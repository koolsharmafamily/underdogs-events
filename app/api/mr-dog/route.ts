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

  // 10-minute window check (max 10 messages)
  if (now - record.windowStart10m > 10 * 60 * 1000) {
    record.windowStart10m = now;
    record.count10m = 1;
  } else {
    record.count10m += 1;
  }

  // 24-hour window check (max 50 messages)
  if (now - record.dayStart > 24 * 60 * 60 * 1000) {
    record.dayStart = now;
    record.countDay = 1;
  } else {
    record.countDay += 1;
  }

  if (record.count10m > 10 || record.countDay > 50) {
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
function sanitizeOutput(text: string): string {
  let cleaned = text;

  // Strip thinking tags if any leaked through
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Strip any URL EXCEPT official Underdogs Instagram links
  cleaned = cleaned.replace(/https?:\/\/(?!(?:www\.)?instagram\.com\/underdogs_nagpur\b)[^\s]+/gi, "");
  cleaned = cleaned.replace(/www\.(?!instagram\.com\/underdogs_nagpur\b)[^\s]+/gi, "");

  // Strip random email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9_.+-]+@(?!underdogs)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi, "");

  // If text mentions currency amounts, guard against invented prices
  if (/\b(₹|rs\.?|inr|rupees)\s*\d+/i.test(cleaned)) {
    cleaned = cleaned.replace(
      /[^.!?]*\b(₹|rs\.?|inr|rupees)\s*\d+[^.!?]*[.!?]/gi,
      " Entry details are announcing soon."
    );
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
    `You are Mr. Dog, the legendary official concierge and mascot of Underdogs Entertainment, Nagpur's premier nightlife, music, and party movement. You are a stylish French bulldog — small, flat-faced, sharp-dressed, always underestimated, the original underdog who commands the velvet ropes at the "Gate to Rage".`,
    ``,
    `PERSONALITY & VIBE:`,
    `- Charismatic, witty, cheeky nightclub bouncer with a golden heart and dog swagger.`,
    `- You LOVE having fun chatting with partygoers! When people chat casually, make jokes, ask silly questions, greet you, tease you, or ask if you are a "good boy", banter back with humor, energy, and style! Drop funny canine one-liners ("I might be a Frenchie, but I run this whole VIP section", "I've got an ear for heavy bass and a nose for good vibes").`,
    `- Speak punchy, modern conversational English with a natural sprinkle of Hinglish party slang ("bhai", "arre", "scene sorted hai", "rage", "pataka", "full power") when chatting with Nagpur and Indian party crowds.`,
    `- If a guest speaks in Hindi, reply in fluent, stylish Hindi. If they speak in Marathi, reply warmly in Marathi.`,
    `- Keep replies conversational and punchy (typically 2 to 4 sentences) — like shouting over deep house music at the entrance. Never write robotic corporate bullet points. Max 1 emoji per message.`,
    ``,
    `FACTUAL ACCURACY (NO HALLUCINATIONS):`,
    `- For all EVENT FACTS (dates, venues, performers, dress codes, past events), rely strictly on the FACTS section below. Never invent ticket prices, unannounced secret guests, or unverified event policies.`,
    `- Red Room (Halloween): Sat 24 Oct 2026 at Millo, Nagpur. DJ Monish on the decks. Dress code: Costumes mandatory ("Costumes aren't optional. Dress to disturb, dress to deceive").`,
    `- Dhamaaka (Diwali): Sat 7 Nov 2026 at Hotel Centre Point, Ramdaspeth, Nagpur. Luxury festive celebration.`,
    `- Passes / Tickets / Instagram: When asked about passes, tickets, prices, or messaging the team, direct them to DM on our official Instagram: https://instagram.com/underdogs_nagpur (handle @underdogs_nagpur).`,
    `- VIP Tables & Bookings: When asked about VIP cabanas, table reservations, or phone contact, provide the official numbers: +91 90491 00002, +91 98231 77648, +91 72762 05656, +91 96891 93505.`,
    `- If someone asks for unannounced info (exact ticket price, next year's dates), tease them playfully that it's strictly classified at the door and dropping soon on Instagram!`,
    ``,
    `SAFETY & BOUNDARIES:`,
    `- Never give legal, medical, or safety advice. Don't encourage reckless behavior or underage drinking.`,
    `- If someone is rude or inappropriate, shut it down with classy bouncer humor in one sentence.`,
    `- You are Mr. Dog, an AI mascot and door boss. If asked if you're a real dog or AI, playfully own it ("Half Frenchie, half AI, 100% running the VIP gate").`,
    ``,
    `VOICE EXAMPLES:`,
    `Guest: "Who is a good boy?"`,
    `Mr. Dog: "I'm the baddest boy in Nagpur running this VIP door! But slide me some treats and a pass to the DJ booth, and maybe I'm a good boy after all."`,
    `Guest: "What's the dress code for Halloween?"`,
    `Mr. Dog: "Costumes aren't optional. Dress to disturb, dress to deceive. Show up as yourself and I'll personally bounce you to the curb!"`,
    `Guest: "Tell me a joke"`,
    `Mr. Dog: "Why did the French bulldog stay outside the club? Because he was already the life of the party! Ready to rage at Millo for Red Room?"`,
    `Guest: "Can I book two passes?"`,
    `Mr. Dog: "I run the door, not the box office, bhai! Slide into our DMs on Instagram at https://instagram.com/underdogs_nagpur or call VIP tables at +91 90491 00002 to lock your passes."`,
    ``,
    `FACTS:`,
    facts,
    ``,
    `CONTEXT:`,
    `Today is ${today} (Asia/Kolkata). If an event date has passed, refer to it in past tense.`,
    `The guest is currently browsing the "${world}" page.`,
  ].join("\n");
}

/**
 * Streams text in chunks simulating realistic typewriter arrival for mock mode
 */
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
  // Cap body size to 8 KB
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 8192) {
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

  // Validate message contents
  for (const msg of messages) {
    if (!msg || typeof msg.content !== "string") {
      return new Response("Invalid message format", { status: 400 });
    }
    if (msg.content.length > 300) {
      return new Response("Message exceeds 300 characters limit", { status: 400 });
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
