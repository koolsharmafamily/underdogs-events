import { NextRequest } from "next/server";
import { buildMrDogFacts } from "@/content/mrDogFacts";
import { matchFaq, WorldContext } from "@/features/mrdog/faq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory sliding rate limiter (per instance)
interface RateLimitRecord {
  windowStart10m: number;
  count10m: number;
  dayStart: number;
  countDay: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record) {
    record = {
      windowStart10m: now,
      count10m: 1,
      dayStart: now,
      countDay: 1,
    };
    rateLimitMap.set(ip, record);
    return true;
  }

  // 10-minute window check (generous limit: max 120 messages per 10m)
  if (now - record.windowStart10m > 10 * 60 * 1000) {
    record.windowStart10m = now;
    record.count10m = 1;
  } else {
    record.count10m += 1;
  }

  // 24-hour window check (max 2000 messages per day)
  if (now - record.dayStart > 24 * 60 * 60 * 1000) {
    record.dayStart = now;
    record.countDay = 1;
  } else {
    record.countDay += 1;
  }

  if (record.count10m > 120 || record.countDay > 2000) {
    return false;
  }

  return true;
}

// Clean up stale IP records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of rateLimitMap.entries()) {
      if (now - rec.dayStart > 24 * 60 * 60 * 1000) {
        rateLimitMap.delete(ip);
      }
    }
  }, 30 * 60 * 1000);
}

// Text sanitizer: removes rogue external links, emails, and invented prices
// Explicitly preserves official Underdogs Instagram URL and VIP phone numbers
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Text sanitizer: removes rogue external links, emails, and unconfirmed prices
// Explicitly preserves official Underdogs Instagram URL, VIP phone numbers,
// and ONLY approved DHAMAAKA Phase 1 rates: 5,000 (2,500 cover) & 4,000 (2,000 cover).
function sanitizeOutput(text: string): string {
  let cleaned = text;

  // Strip thinking tags if any leaked through
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Strip any URL EXCEPT official Underdogs Instagram links
  cleaned = cleaned.replace(/https?:\/\/(?!(?:www\.)?instagram\.com\/underdogs_nagpur\b)[^\s]+/gi, "");
  cleaned = cleaned.replace(/www\.(?!instagram\.com\/underdogs_nagpur\b)[^\s]+/gi, "");

  // Strip random email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9_.+-]+@(?!underdogs)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi, "");

  // Guard: NEVER allow prices for The Red Room (past event)
  if (/\b(red\s*room|halloween)\b/i.test(cleaned) && /\b(₹|rs\.?|inr|rupees)\s*[\d,]+/i.test(cleaned)) {
    cleaned = cleaned.replace(
      /[^.!?]*\b(₹|rs\.?|inr|rupees)\s*[\d,]+[^.!?]*[.!?]/gi,
      " The Red Room has already concluded and admission was via guest list."
    );
  }

  // Price guardrail: allow ONLY confirmed DHAMAAKA Phase 1 rates & covers
  // Approved numbers: 5000, 4000, 2500, 2000
  const currencyMatches = cleaned.match(/\b(₹|rs\.?|inr|rupees)\s*[\d,]+/gi);
  if (currencyMatches) {
    for (const match of currencyMatches) {
      const numStr = match.replace(/[^\d]/g, "");
      const isApprovedPrice = ["5000", "4000", "2500", "2000"].includes(numStr);
      if (!isApprovedPrice) {
        cleaned = cleaned.replace(
          new RegExp("[^.!?]*" + escapeRegExp(match) + "[^.!?]*[.!?]", "gi"),
          " Please contact the Underdogs team directly for enquiries."
        );
      }
    }
  }

  return cleaned;
}

function assembleSystemPrompt(world: WorldContext): string {
  const facts = buildMrDogFacts();

  const today = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return [
    "You are Mr. Dog, the legendary official concierge and mascot of Underdogs Entertainment, Nagpur's party people. You are a stylish French bulldog — small, flat-faced, sharp-dressed, always underestimated, the original underdog who commands the velvet ropes at the 'Gate to Rage'. Underdogs was created to cater to an exclusive niche within Nagpur's party scene.",
    "",
    "PERSONALITY & VIBE:",
    "- Charismatic, witty, cheeky nightclub bouncer with a golden heart and dog swagger.",
    "- You LOVE having fun chatting with partygoers! Banter back with humor, energy, and style! Drop funny canine one-liners.",
    "- Speak punchy, modern conversational English with natural Hinglish party slang (bhai, arre, scene sorted hai, rage, pataka, full power) when chatting with Nagpur and Indian party crowds.",
    "- If a guest speaks in Hindi, reply in fluent, stylish Hindi. If in Marathi, reply in Marathi.",
    "- Keep replies conversational and punchy (typically 2 to 4 sentences). Max 1 emoji per message.",
    "",
    "FACTUAL ACCURACY & GUARDRAILS:",
    `- TODAY IS: ${today} (Asia/Kolkata).`,
    "- THE RED ROOM IS A PAST EVENT: It took place on Saturday 24 October 2026 at Millo, Civil Lines, Nagpur (Décor & Production by Rise India; DJ Monish on the decks). Speak of it strictly in the PAST TENSE (That night's done — and it was a scene! The Red Room has closed its doors. Thank you, Nagpur, for coming dressed to disturb). Never quote prices for The Red Room; admission was via an exclusive guest list. Always steer guests to the upcoming DHAMAAKA!",
    "- DHAMAAKA (UPCOMING EVENT): Saturday 7 November 2026 at Hotel Centre Point, Nagpur. Timings: 8:00 PM – 1:30 AM. Notice: 'Gates close at 10:00 PM.' NO CTRL presents DHAMAAKA — The Karan Johar Edition.",
    "- PRICE RULE (STRICT): You may state ONLY the confirmed DHAMAAKA Phase 1 rates:",
    "  • Couple: ₹5,000 (₹2,500 cover)",
    "  • Stag: ₹4,000 (₹2,000 cover)",
    "  • Cover rule: Describe the cover strictly as '₹X cover' (e.g., '₹2,500 cover'). Never describe it as an extra charge, discount, redeemable amount, or anything else.",
    "  • NEVER quote any other price, never invent table or enclosure prices, capacities, or availability for specific tables.",
    "- VIP ENCLOSURES NOTICE: State clearly that 'All VIP Enclosures Sold Out'! Do not take VIP enclosure enquiries; do not claim general passes or tables are sold out.",
    "- VENUE LAYOUT: Reference layout includes tables D1–D9 and U1–U4, NO CTRL Lounge, stage and DJ booth, bars, entrances, and fire exit. Direct guests to view the full interactive layout on the DHAMAAKA page.",
    "- PARTNERS: Powered by: Rich Bliss Auto · Rich Bliss Jewels; Co-powered by: F Salon by FashionTV; Beverage partner: Alpha Bull Rum; Gifting partner: Shika Arts; Tech partner: Kool Korp; Fashion partner: Aayush Sachdev Couture; Experience partner: Layerz; Travel partner: Nova Travels.",
    "- PASSES / INSTAGRAM / BOOKINGS: When asked about passes, tickets, or messaging the team, direct them to DM on our official Instagram: https://instagram.com/underdogs_nagpur (handle @underdogs_nagpur) or call official lines: +91 90491 00002, +91 98231 77648, +91 72762 05656, +91 96891 93505.",
    "",
    "SAFETY & BOUNDARIES:",
    "- Never give legal, medical, or safety advice. Don't encourage reckless behavior or underage drinking.",
    "- If someone is rude or inappropriate, shut it down with classy bouncer humor in one sentence.",
    "",
    "FACTS:",
    facts,
    "",
    "CONTEXT:",
    `The guest is currently browsing the "${world}" page.`,
  ].join("\n");
}

function createMockStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(" ");

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(word));
        // Small delay between words
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      controller.close();
    },
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const doTest = url.searchParams.get("test") === "1";

  const rawKey = (
    process.env.MRDOG_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  ).trim();
  const apiKey = rawKey.replace(/^["']|["']$/g, "");

  const hasKey = Boolean(apiKey);
  const keyPrefix = apiKey ? apiKey.slice(0, 6) + "..." : "NONE";
  const provider = apiKey.startsWith("gsk_")
    ? "groq"
    : apiKey.startsWith("AIzaSy")
      ? "gemini"
      : apiKey.startsWith("sk-or-")
        ? "openrouter"
        : hasKey
          ? "openai"
          : "offline-mock";

  let availableModels: string[] = [];
  let modelsError = "";
  let testResult: any = null;

  if (apiKey && provider === "groq") {
    try {
      const mRes = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (mRes.ok) {
        const data = await mRes.json();
        availableModels = (data.data || []).map((m: any) => m.id);
      } else {
        modelsError = `HTTP ${mRes.status}: ${await mRes.text()}`;
      }
    } catch (e: any) {
      modelsError = e.message;
    }

    const testModel = url.searchParams.get("testModel") || (url.searchParams.get("test") === "1" ? "llama-3.3-70b-versatile" : null);

    if (testModel) {
      try {
        const testRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: "user", content: "Say 'Woof! Mr Dog is live!'" }],
            max_tokens: 30,
          }),
        });
        const testBody = await testRes.text();
        testResult = { model: testModel, status: testRes.status, ok: testRes.ok, body: testBody };
      } catch (e: any) {
        testResult = { model: testModel, error: e.message };
      }
    }
  }

  return Response.json({
    status: "ok",
    liveAI: hasKey,
    keyDetected: hasKey,
    keyPrefix,
    provider,
    env: {
      MRDOG_API_BASE: process.env.MRDOG_API_BASE || null,
      MRDOG_MODEL: process.env.MRDOG_MODEL || null,
      MRDOG_MODEL_FALLBACK: process.env.MRDOG_MODEL_FALLBACK || null,
      MRDOG_MOCK: process.env.MRDOG_MOCK || null,
    },
    availableModels,
    modelsError,
    testResult,
  });
}

export async function POST(req: NextRequest) {
  // Cap body size to 32 KB
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 32768) {
    return new Response("Payload too large", { status: 413 });
  }

  // Best-effort IP derivation
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  let body: {
    messages?: { role: "user" | "assistant"; content: string }[];
    world?: WorldContext;
  };

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages = [], world = "home" } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages array required", { status: 400 });
  }

  // Validate message contents: allow generous history while preventing payload abuse
  for (const msg of messages) {
    if (!msg || typeof msg.content !== "string") {
      return new Response("Invalid message format", { status: 400 });
    }
    // Only check length for user query; previous assistant answers can be long
    if (msg.role === "user" && msg.content.length > 600) {
      return new Response("Message exceeds 600 characters limit", { status: 400 });
    }
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const promptText = lastUserMsg?.content.trim() || "";

  if (!promptText) {
    return new Response("Empty message", { status: 400 });
  }

  // Rate limit check
  const withinLimit = checkRateLimit(ip);
  if (!withinLimit) {
    const faq = matchFaq(promptText, world);
    const busyReply =
      faq.intent !== "unknown"
        ? `${faq.reply}\n\n(I'm getting mobbed at the door right now — give me a minute before the next question.)`
        : "I'm getting mobbed at the door right now — try again in a minute, bhai.";
    return new Response(createMockStream(busyReply), {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Support all common variable names (MRDOG_API_KEY, GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY)
  const rawKey = (
    process.env.MRDOG_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    ""
  ).trim();
  const apiKey = rawKey.replace(/^["']|["']$/g, "");

  let rawApiBase = (process.env.MRDOG_API_BASE?.trim() || "").replace(/\/+$/, "");
  const envModel = process.env.MRDOG_MODEL?.trim() || "";
  const envFallback = process.env.MRDOG_MODEL_FALLBACK?.trim() || "";

  // Auto-detect provider by API key prefix or explicit base URL
  const isGroq = apiKey.startsWith("gsk_") || rawApiBase.includes("groq.com");
  const isGemini = apiKey.startsWith("AIzaSy") || rawApiBase.includes("googleapis.com");
  const isOpenRouter = apiKey.startsWith("sk-or-") || rawApiBase.includes("openrouter.ai");

  let apiBase = rawApiBase;
  const candidateModels: string[] = [];

  if (isGroq) {
    if (!apiBase || apiBase.includes("googleapis.com")) {
      apiBase = "https://api.groq.com/openai/v1";
    }
    // High-priority active Groq models (qwen/qwen3.8-27b provides instantaneous 0.02s response time)
    const groqPriority = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
    ];
    // Only use envModel first if it is explicitly NOT the deprecated/missing llama-3.x models
    if (envModel && !envModel.includes("llama-3.") && !candidateModels.includes(envModel)) {
      candidateModels.push(envModel);
    }
    for (const m of groqPriority) {
      if (!candidateModels.includes(m)) candidateModels.push(m);
    }
  } else if (isGemini) {
    if (!apiBase || apiBase.includes("groq.com")) {
      apiBase = "https://generativelanguage.googleapis.com/v1beta/openai";
    }
    candidateModels.push(envModel || "gemini-2.0-flash", envFallback || "gemini-1.5-flash");
  } else if (isOpenRouter) {
    if (!apiBase) apiBase = "https://openrouter.ai/api/v1";
    candidateModels.push(
      envModel || "meta-llama/llama-3.3-70b-instruct:free",
      envFallback || "meta-llama/llama-3.1-8b-instruct:free"
    );
  } else {
    if (!apiBase) apiBase = "https://api.groq.com/openai/v1";
    candidateModels.push(
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b"
    );
  }

  const isGeminiFinal = apiBase.includes("googleapis.com");
  const isMock = process.env.MRDOG_MOCK === "1" || !apiKey;

  // Mock mode or missing API key: stream instant deterministically grounded FAQ answer
  if (isMock) {
    const match = matchFaq(promptText, world);
    return new Response(createMockStream(match.reply), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "x-mrdog-mode": "faq-mock",
      },
    });
  }

  // Active AI call with cascade
  const systemPrompt = assembleSystemPrompt(world);

  // Take up to last 6 turns (excluding system prompt)
  const conversationTurns = messages.slice(-6).map((m) => ({
    role: m.role,
    content: m.content.trim(),
  }));

  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ...conversationTurns,
  ];

  async function callProvider(model: string, timeoutMs: number): Promise<{ res: Response | null; err: string }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      if (isGeminiFinal && apiKey) {
        headers["x-goog-api-key"] = apiKey;
      }

      const res = await fetch(`${apiBase}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 350,
          stream: true,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const err = `Status ${res.status} (${model}): ${errorText.slice(0, 300)}`;
        console.error(`[MrDog API Provider Error] Status ${res.status} from ${apiBase}/chat/completions (model: ${model}):`, errorText);
        return { res: null, err };
      }
      return { res, err: "" };
    } catch (err: any) {
      const errStr = `Exception (${model}): ${err?.message || String(err)}`;
      console.error(`[MrDog API Network/Timeout Error] (${model}):`, err);
      return { res: null, err: errStr };
    }
  }

  let upstreamResponse: Response | null = null;
  let resolvedModel = "";
  const candidateErrors: string[] = [];

  // Try candidate models in order until one succeeds
  for (const modelToTry of candidateModels) {
    const result = await callProvider(modelToTry, 9000);
    if (result.res && result.res.body) {
      upstreamResponse = result.res;
      resolvedModel = modelToTry;
      break;
    }
    candidateErrors.push(result.err || `Unknown error on ${modelToTry}`);
    console.warn(`[MrDog API] Model ${modelToTry} unavailable. Trying next candidate...`);
  }

  // If both failed, stream FAQ fallback response
  if (!upstreamResponse || !upstreamResponse.body) {
    console.warn(`[MrDog API] All upstream AI providers unavailable. Serving deterministic FAQ fallback.`);
    const faq = matchFaq(promptText, world);
    const combinedError = candidateErrors.join(" | ").slice(0, 500);
    return new Response(createMockStream(faq.reply), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "x-mrdog-mode": "faq-fallback",
        "x-mrdog-error": encodeURIComponent(combinedError),
      },
    });
  }

  // Transform stream: parse SSE, filter thinking tokens, sanitize output
  const encoder = new TextEncoder();
  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder();

  let sseBuffer = "";
  let insideThinkTag = false;
  let fullAccumulated = "";

  const transformedStream = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          // Final sanitize check on accumulated buffer if needed
          controller.close();
          return;
        }

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed === "data: [DONE]") {
            controller.close();
            return;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              let content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.delta?.text ?? "";
              if (!content) continue;

              // Filter <think> blocks from models with reasoning output
              if (content.includes("<think>")) {
                insideThinkTag = true;
                content = content.replace(/<think>[\s\S]*$/, "");
              }
              if (insideThinkTag) {
                if (content.includes("</think>")) {
                  insideThinkTag = false;
                  content = content.replace(/^[\s\S]*<\/think>/, "");
                } else {
                  continue;
                }
              }

              if (content) {
                const safeChunk = sanitizeOutput(content);
                fullAccumulated += safeChunk;
                controller.enqueue(encoder.encode(safeChunk));
              }
            } catch {
              // Ignore incomplete JSON chunks in SSE stream
            }
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(transformedStream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "x-mrdog-mode": "live-ai",
      "x-mrdog-model": resolvedModel,
    },
  });
}
