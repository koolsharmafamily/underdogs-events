import { site } from "@/content/site";
import type { MrDogExpression } from "./store";

export type WorldContext = "home" | "redroom" | "diwali" | "events";

export interface FixedQuestionItem {
  id: string;
  chipLabel: string;
  userQuestion: string;
  answer: string;
  expression: MrDogExpression;
  followUpIds: string[];
}

export type Intent =
  | "when"
  | "where"
  | "rates"
  | "cover"
  | "vip"
  | "layout"
  | "gates"
  | "dress"
  | "entry"
  | "booking"
  | "artist"
  | "about"
  | "past"
  | "events"
  | "partners"
  | "decor"
  | "greeting"
  | "thanks"
  | "instagram"
  | "unknown";

interface IntentMatch {
  intent: Intent;
  reply: string;
  expression: MrDogExpression;
  followUpIds: string[];
}

/**
 * Fixed Q&A Database for Mr. Dog.
 * Grounded 100% in src/content/site.ts with authentic mascot voice.
 */
export const FIXED_QUESTIONS: Record<string, FixedQuestionItem> = {
  // --- HOME / GENERAL ---
  about: {
    id: "about",
    chipLabel: "What is Underdogs?",
    userQuestion: "What is Underdogs?",
    answer:
      "We’re Nagpur’s party people. Underdogs was created to cater to an exclusive niche within Nagpur’s party scene. We don’t throw parties — we build worlds and open the gate. Every night gets a name, a dress code, and a reason to remember it. Chaos, curated.",
    expression: "talking",
    followUpIds: ["diwali_rates", "season", "booking"],
  },
  season: {
    id: "season",
    chipLabel: "This season's nights",
    userQuestion: "What's on this season?",
    answer:
      "Two worlds. Two celebrations. One unforgettable season:\n\n• World One: The Red Room (Halloween) — Happened on Sat 24 Oct 2026 at Millo (event concluded).\n• World Two: DHAMAAKA (Diwali — The Karan Johar Edition) — Saturday 7 November 2026 at Hotel Centre Point, Nagpur (8:00 PM – 1:30 AM).",
    expression: "talking",
    followUpIds: ["diwali_rates", "diwali_when", "booking"],
  },
  past: {
    id: "past",
    chipLabel: "Past nights thrown",
    userQuestion: "What past nights have you thrown?",
    answer:
      "We’ve thrown Project X (latest at Pablo, Nagpur), Retro Holi, Anti V, Diwali 2k25, Holi 2k25, Maison Blanche, Afrochella, Akai Yane, Luau, and our NYE editions — and now The Red Room (Halloween 2026) has joined the archive!",
    expression: "talking",
    followUpIds: ["diwali_rates", "season", "about"],
  },
  entry: {
    id: "entry",
    chipLabel: "How to get tickets / entry?",
    userQuestion: "How do I get tickets or entry?",
    answer:
      "For DHAMAAKA (7 Nov 2026), Phase 1 Rates are live:\n• Couple: ₹5,000 (with ₹2,500 cover)\n• Stag: ₹4,000 (with ₹2,000 cover)\n\nWe don't take direct website card checkout. Slide into @underdogs_nagpur on Instagram or call our official lines to secure your passes before gates close at 10:00 PM!",
    expression: "wink",
    followUpIds: ["diwali_rates", "diwali_cover", "booking"],
  },
  booking: {
    id: "booking",
    chipLabel: "VIP Booking & Phone numbers",
    userQuestion: "How do I book tables or contact the team?",
    answer:
      "For tickets, table enquiries, and bookings for DHAMAAKA at Centre Point, connect directly with the Underdogs team:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505\n\nOr DM @underdogs_nagpur on Instagram.",
    expression: "wink",
    followUpIds: ["diwali_rates", "diwali_vip", "diwali_when"],
  },
  instagram: {
    id: "instagram",
    chipLabel: "Official Instagram Link",
    userQuestion: "Can you give the link to message or Instagram?",
    answer:
      "Tap right here to DM us on Instagram: https://instagram.com/underdogs_nagpur (@underdogs_nagpur)! You can also reach our official booking lines directly:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505",
    expression: "wink",
    followUpIds: ["diwali_rates", "booking", "season"],
  },

  // --- THE RED ROOM (PAST EVENT) ---
  redroom_how_was: {
    id: "redroom_how_was",
    chipLabel: "How was The Red Room?",
    userQuestion: "How was The Red Room?",
    answer:
      "That night's done — and it was a scene! The Red Room has closed its doors. Thank you, Nagpur, for coming dressed to disturb. See you at the next gate: DHAMAAKA on Saturday 7 November!",
    expression: "rage",
    followUpIds: ["redroom_decor", "diwali_when", "diwali_rates"],
  },
  redroom_decor: {
    id: "redroom_decor",
    chipLabel: "Who did the décor?",
    userQuestion: "Who did the décor for The Red Room?",
    answer:
      "Décor & Production for The Red Room was executed by Rise India (Raise Your Expectations) — creating an unforgettable dark, immersive Halloween world at Millo Nagpur.",
    expression: "talking",
    followUpIds: ["redroom_how_was", "diwali_when", "diwali_rates"],
  },
  redroom_when: {
    id: "redroom_when",
    chipLabel: "When was The Red Room?",
    userQuestion: "When is The Red Room?",
    answer:
      "The Red Room is now a past event! It took place on Saturday, 24 October 2026 at Millo — Kitchen & Bar, Civil Lines, Nagpur. That night has concluded, and our focus is now 100% on DHAMAAKA on Saturday 7 November at Hotel Centre Point!",
    expression: "talking",
    followUpIds: ["diwali_when", "diwali_rates", "redroom_decor"],
  },
  redroom_entry: {
    id: "redroom_entry",
    chipLabel: "How much was Red Room entry?",
    userQuestion: "How much was Red Room entry?",
    answer:
      "The Red Room has already concluded, and admission was strictly through a name-based guest list. We do not quote rates for past events. Head over to DHAMAAKA for our upcoming Diwali Phase 1 rates!",
    expression: "shrug",
    followUpIds: ["diwali_rates", "diwali_cover", "diwali_when"],
  },

  // --- DHAMAAKA (UPCOMING EVENT) ---
  diwali_rates: {
    id: "diwali_rates",
    chipLabel: "Rates & timings",
    userQuestion: "What are the DHAMAAKA rates and timings?",
    answer:
      "NO CTRL presents DHAMAAKA — The Karan Johar Edition on Saturday, 7 November 2026 at Hotel Centre Point, Nagpur, from 8:00 PM – 1:30 AM (Gates close at 10:00 PM).\n\nPhase 1 Rates:\n• Couple: ₹5,000\n  ₹2,500 cover\n• Stag: ₹4,000\n  ₹2,000 cover",
    expression: "wink",
    followUpIds: ["diwali_cover", "diwali_gates", "diwali_vip"],
  },
  diwali_cover: {
    id: "diwali_cover",
    chipLabel: "What's the cover?",
    userQuestion: "What is the cover for DHAMAAKA?",
    answer:
      "For DHAMAAKA Phase 1 Rates:\n• Couple (₹5,000): includes ₹2,500 cover\n• Stag (₹4,000): includes ₹2,000 cover\n\nThe cover is described exactly as ₹2,500 cover and ₹2,000 cover.",
    expression: "talking",
    followUpIds: ["diwali_rates", "diwali_gates", "diwali_booking"],
  },
  diwali_when: {
    id: "diwali_when",
    chipLabel: "When & where is DHAMAAKA?",
    userQuestion: "When and where is DHAMAAKA?",
    answer:
      "NO CTRL presents DHAMAAKA — The Karan Johar Edition on Saturday, 7 November 2026 at Centre Point, Nagpur. Timings: 8:00 PM – 1:30 AM. Notice: Gates close at 10:00 PM.",
    expression: "talking",
    followUpIds: ["diwali_rates", "diwali_gates", "diwali_vip"],
  },
  diwali_gates: {
    id: "diwali_gates",
    chipLabel: "When do gates close?",
    userQuestion: "When do gates close for DHAMAAKA?",
    answer:
      "Notice: Gates close at 10:00 PM sharp! DHAMAAKA timings are 8:00 PM – 1:30 AM at Hotel Centre Point, Nagpur. Arrive early so you're not locked out at the gate, bhai!",
    expression: "rage",
    followUpIds: ["diwali_rates", "diwali_cover", "diwali_booking"],
  },
  diwali_vip: {
    id: "diwali_vip",
    chipLabel: "Are VIP tables available?",
    userQuestion: "Are VIP tables available for DHAMAAKA?",
    answer:
      "Notice: All VIP Enclosures Sold Out! General entry (Couple & Stag) and standard table enquiries are open via @underdogs_nagpur on Instagram or our booking lines: +91 90491 00002.",
    expression: "talking",
    followUpIds: ["diwali_layout", "diwali_rates", "diwali_booking"],
  },
  diwali_layout: {
    id: "diwali_layout",
    chipLabel: "Venue Layout",
    userQuestion: "What is the venue layout for DHAMAAKA?",
    answer:
      "Reference layout at Hotel Centre Point includes tables D1–D9 and U1–U4, NO CTRL Lounge, stage and DJ booth, bars, entrances, and fire exit. Check the DHAMAAKA page to view and zoom the complete venue map!",
    expression: "talking",
    followUpIds: ["diwali_vip", "diwali_rates", "diwali_partners"],
  },
  diwali_partners: {
    id: "diwali_partners",
    chipLabel: "DHAMAAKA partners",
    userQuestion: "Who are the partners for DHAMAAKA?",
    answer:
      "DHAMAAKA partners:\n• Powered by: Rich Bliss Auto · Rich Bliss Jewels\n• Co-powered by: F Salon by FashionTV\n• Beverage partner: Alpha Bull Rum\n• Gifting partner: Shika Arts\n• Tech partner: Kool Korp\n• Fashion partner: Aayush Sachdev Couture\n• Experience partner: Layerz\n• Travel partner: Nova Travels",
    expression: "talking",
    followUpIds: ["diwali_rates", "diwali_when", "diwali_booking"],
  },
  diwali_dress: {
    id: "diwali_dress",
    chipLabel: "Diwali theme & attire",
    userQuestion: "What is the theme and dress code for DHAMAAKA?",
    answer:
      "DHAMAAKA — The Karan Johar Edition (दीपावली धमाका). Think pure high-voltage Bollywood premiere glamour, royal elegance, and red-carpet couture.",
    expression: "wink",
    followUpIds: ["diwali_rates", "diwali_when", "diwali_booking"],
  },
  diwali_artist: {
    id: "diwali_artist",
    chipLabel: "Headline Artist (Diwali)",
    userQuestion: "Who is the artist performing at DHAMAAKA?",
    answer:
      "The headline artist for DHAMAAKA is announcing soon! Keep an eye on @underdogs_nagpur on Instagram for the official drop.",
    expression: "shrug",
    followUpIds: ["diwali_rates", "diwali_when", "diwali_booking"],
  },
  diwali_booking: {
    id: "diwali_booking",
    chipLabel: "Book Centre Point tables",
    userQuestion: "How do I book tables for DHAMAAKA?",
    answer:
      "For Phase 1 passes and table enquiries at Hotel Centre Point, Nagpur, reach out to:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505\n\nOr DM @underdogs_nagpur on Instagram.",
    expression: "wink",
    followUpIds: ["diwali_rates", "diwali_vip", "diwali_partners"],
  },
};

/**
 * Returns initial fixed questions list for each world view.
 */
export function getInitialFixedQuestionsForWorld(world: WorldContext): FixedQuestionItem[] {
  if (world === "redroom") {
    return [
      FIXED_QUESTIONS.redroom_how_was,
      FIXED_QUESTIONS.redroom_decor,
      FIXED_QUESTIONS.redroom_when,
      FIXED_QUESTIONS.diwali_rates,
      FIXED_QUESTIONS.diwali_when,
      FIXED_QUESTIONS.booking,
    ];
  }
  if (world === "diwali") {
    return [
      FIXED_QUESTIONS.diwali_rates,
      FIXED_QUESTIONS.diwali_cover,
      FIXED_QUESTIONS.diwali_when,
      FIXED_QUESTIONS.diwali_gates,
      FIXED_QUESTIONS.diwali_vip,
      FIXED_QUESTIONS.diwali_layout,
      FIXED_QUESTIONS.diwali_partners,
      FIXED_QUESTIONS.diwali_booking,
    ];
  }
  // Home & Events default
  return [
    FIXED_QUESTIONS.about,
    FIXED_QUESTIONS.diwali_rates,
    FIXED_QUESTIONS.diwali_when,
    FIXED_QUESTIONS.diwali_vip,
    FIXED_QUESTIONS.redroom_how_was,
    FIXED_QUESTIONS.booking,
    FIXED_QUESTIONS.past,
  ];
}

const INTENT_PATTERNS: { intent: Intent; keywords: RegExp }[] = [
  {
    intent: "rates",
    keywords:
      /\b(rate|rates|pricing|price|prices|ticket|tickets|entry fee|cost|charges|how much|5000|4000|phase 1|stag|couple)\b/i,
  },
  {
    intent: "cover",
    keywords:
      /\b(cover|cover charge|redeemable|2500|2000)\b/i,
  },
  {
    intent: "gates",
    keywords:
      /\b(gate|gates|gates close|closing time|gate close|last entry)\b/i,
  },
  {
    intent: "vip",
    keywords:
      /\b(vip|enclosure|enclosures|cabana|cabanas|sold out|table available|tables available)\b/i,
  },
  {
    intent: "layout",
    keywords:
      /\b(layout|venue layout|floor plan|map|seating|d1|d9|u1|u4|lounge|dj booth|booth|reference layout)\b/i,
  },
  {
    intent: "decor",
    keywords:
      /\b(decor|décor|production|rise india|stage design|setup|who did)\b/i,
  },
  {
    intent: "instagram",
    keywords:
      /\b(instagram|insta|ig|dm|message|inbox|link|handle|profile|reach|direct message|text you|chat)\b/i,
  },
  {
    intent: "booking",
    keywords:
      /\b(call|phone|number|numbers|mobile|contact|reservation|reservations|inquiry|inquiries|bhai number)\b/i,
  },
  {
    intent: "when",
    keywords:
      /\b(when|date|dates|time|timing|timings|schedule|kab|tarikh|tareekh|din|hours|starts?)\b/i,
  },
  {
    intent: "where",
    keywords:
      /\b(where|venue|place|location|address|kahan|kidhar|kuthe|kothe|city|directions?|millo|centre point|hotel centre point)\b/i,
  },
  {
    intent: "dress",
    keywords:
      /\b(dress|code|costume|costumes|outfit|outfits|theme|kya pehnu|wear|wearing|clothes|attire|what to wear)\b/i,
  },
  {
    intent: "artist",
    keywords:
      /\b(dj|artist|artists|music|lineup|line-up|line up|monish|mohnish|kaun bajayega|performer|playing|tracks?|genre|sound)\b/i,
  },
  {
    intent: "partners",
    keywords:
      /\b(partner|partners|sponsor|sponsors|powered by|co-powered|association|brands?|rich bliss|f salon|alpha bull|shika arts|kool korp|aayush sachdev|layerz|nova travels)\b/i,
  },
  {
    intent: "about",
    keywords:
      /\b(what is underdogs|who are you|who are underdogs|tell me about underdogs|about|company|crew|human|are you human|real person|bot|ai|party people|niche)\b/i,
  },
  {
    intent: "past",
    keywords:
      /\b(past|history|previous|project x|retro holi|anti v|maison blanche|afrochella|luau|akai yane)\b/i,
  },
  {
    intent: "events",
    keywords:
      /\b(events?|two worlds|this season|what's on|whats on|nights|celebrations?|kya scene|scene|chal raha|party|parties)\b/i,
  },
  {
    intent: "thanks",
    keywords:
      /\b(thank|thanks|dhanyawad|shukriya|bye|cya|see you|goodbye|cheers|awesome|great|cool)\b/i,
  },
  {
    intent: "greeting",
    keywords:
      /\b(hi|hello|hey|yo|namaste|kaisa hai|wassup|what's up|sup|morning|evening|kya bolte)\b/i,
  },
];

export function detectIntent(text: string): Intent {
  const clean = text.toLowerCase().trim();
  for (const { intent, keywords } of INTENT_PATTERNS) {
    if (keywords.test(clean)) {
      return intent;
    }
  }
  return "unknown";
}

/**
 * Matches any input (from chip click or free text) to fixed questions & answers.
 */
export function matchFaq(text: string, world: WorldContext = "home"): IntentMatch {
  const clean = text.toLowerCase().trim();

  // 1. Direct chip ID match if passed directly
  if (FIXED_QUESTIONS[text]) {
    const q = FIXED_QUESTIONS[text];
    return {
      intent: "unknown",
      reply: q.answer,
      expression: q.expression,
      followUpIds: q.followUpIds,
    };
  }

  // 2. Exact or close question text match
  for (const q of Object.values(FIXED_QUESTIONS)) {
    if (
      clean === q.chipLabel.toLowerCase() ||
      clean === q.userQuestion.toLowerCase() ||
      clean.includes(q.userQuestion.toLowerCase())
    ) {
      return {
        intent: "unknown",
        reply: q.answer,
        expression: q.expression,
        followUpIds: q.followUpIds,
      };
    }
  }

  // Check specific high-priority Red Room past questions
  if (clean.includes("red room") || clean.includes("halloween")) {
    if (clean.includes("decor") || clean.includes("production") || clean.includes("rise")) {
      return {
        intent: "decor",
        reply: FIXED_QUESTIONS.redroom_decor.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.redroom_decor.followUpIds,
      };
    }
    if (clean.includes("price") || clean.includes("rate") || clean.includes("cost") || clean.includes("ticket") || clean.includes("entry") || clean.includes("how much")) {
      return {
        intent: "entry",
        reply: FIXED_QUESTIONS.redroom_entry.answer,
        expression: "shrug",
        followUpIds: FIXED_QUESTIONS.redroom_entry.followUpIds,
      };
    }
    if (clean.includes("when") || clean.includes("date") || clean.includes("time") || clean.includes("where")) {
      return {
        intent: "when",
        reply: FIXED_QUESTIONS.redroom_when.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.redroom_when.followUpIds,
      };
    }
    return {
      intent: "past",
      reply: FIXED_QUESTIONS.redroom_how_was.answer,
      expression: "rage",
      followUpIds: FIXED_QUESTIONS.redroom_how_was.followUpIds,
    };
  }

  // Check specific VIP questions
  if (clean.includes("vip") || clean.includes("enclosure")) {
    return {
      intent: "vip",
      reply: FIXED_QUESTIONS.diwali_vip.answer,
      expression: "talking",
      followUpIds: FIXED_QUESTIONS.diwali_vip.followUpIds,
    };
  }

  // Check specific Cover questions
  if (clean.includes("cover")) {
    return {
      intent: "cover",
      reply: FIXED_QUESTIONS.diwali_cover.answer,
      expression: "talking",
      followUpIds: FIXED_QUESTIONS.diwali_cover.followUpIds,
    };
  }

  // Check specific Gates Close questions
  if (clean.includes("gates close") || clean.includes("gate close") || (clean.includes("gate") && clean.includes("close"))) {
    return {
      intent: "gates",
      reply: FIXED_QUESTIONS.diwali_gates.answer,
      expression: "rage",
      followUpIds: FIXED_QUESTIONS.diwali_gates.followUpIds,
    };
  }

  // Check layout questions
  if (clean.includes("layout") || clean.includes("table") || clean.includes("seating") || clean.includes("d1") || clean.includes("u1")) {
    return {
      intent: "layout",
      reply: FIXED_QUESTIONS.diwali_layout.answer,
      expression: "talking",
      followUpIds: FIXED_QUESTIONS.diwali_layout.followUpIds,
    };
  }

  // 3. Keyword Intent detection
  const intent = detectIntent(text);

  switch (intent) {
    case "rates":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_rates.answer,
        expression: "wink",
        followUpIds: FIXED_QUESTIONS.diwali_rates.followUpIds,
      };

    case "cover":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_cover.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.diwali_cover.followUpIds,
      };

    case "vip":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_vip.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.diwali_vip.followUpIds,
      };

    case "layout":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_layout.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.diwali_layout.followUpIds,
      };

    case "gates":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_gates.answer,
        expression: "rage",
        followUpIds: FIXED_QUESTIONS.diwali_gates.followUpIds,
      };

    case "decor":
      return {
        intent,
        reply: FIXED_QUESTIONS.redroom_decor.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.redroom_decor.followUpIds,
      };

    case "instagram":
      return {
        intent,
        reply: FIXED_QUESTIONS.instagram.answer,
        expression: "wink",
        followUpIds: ["diwali_rates", "booking", "season"],
      };

    case "booking":
      return {
        intent,
        reply: FIXED_QUESTIONS.booking.answer,
        expression: "wink",
        followUpIds: ["diwali_rates", "diwali_vip", "diwali_when"],
      };

    case "entry":
      return {
        intent,
        reply: FIXED_QUESTIONS.entry.answer,
        expression: "wink",
        followUpIds: ["diwali_rates", "diwali_cover", "booking"],
      };

    case "when":
    case "where":
      if (world === "redroom") {
        return {
          intent,
          reply: FIXED_QUESTIONS.redroom_when.answer,
          expression: "talking",
          followUpIds: ["diwali_when", "diwali_rates"],
        };
      }
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_when.answer,
        expression: "talking",
        followUpIds: ["diwali_rates", "diwali_gates", "diwali_vip"],
      };

    case "dress":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_dress.answer,
        expression: "wink",
        followUpIds: ["diwali_rates", "diwali_when", "entry"],
      };

    case "artist":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_artist.answer,
        expression: "shrug",
        followUpIds: ["diwali_rates", "diwali_when", "diwali_booking"],
      };

    case "partners":
      return {
        intent,
        reply: FIXED_QUESTIONS.diwali_partners.answer,
        expression: "talking",
        followUpIds: ["diwali_rates", "diwali_when", "diwali_booking"],
      };

    case "about":
      return {
        intent,
        reply: FIXED_QUESTIONS.about.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.about.followUpIds,
      };

    case "past":
      return {
        intent,
        reply: FIXED_QUESTIONS.past.answer,
        expression: "talking",
        followUpIds: FIXED_QUESTIONS.past.followUpIds,
      };

    case "events":
      return {
        intent,
        reply: FIXED_QUESTIONS.season.answer,
        expression: "talking",
        followUpIds: ["diwali_rates", "diwali_when", "booking"],
      };

    case "thanks":
      return {
        intent,
        reply: "Anytime, boss! See you at the gate for DHAMAAKA. Stay unruly.",
        expression: "wink",
        followUpIds: ["diwali_rates", "diwali_when", "booking"],
      };

    case "greeting":
      if (world === "redroom") {
        return {
          intent,
          reply:
            "That night's done — The Red Room was a scene! Tap any question below or ask me about our next gate: DHAMAAKA on 7 November.",
          expression: "greet",
          followUpIds: ["redroom_how_was", "redroom_decor", "diwali_rates"],
        };
      }
      return {
        intent,
        reply:
          "Gate's open. I'm Mr. Dog — the Underdogs concierge. Tap any question below or ask me about DHAMAAKA rates, timings, or VIP tables.",
        expression: "greet",
        followUpIds: ["diwali_rates", "diwali_cover", "diwali_when"],
      };

    case "unknown":
    default:
      return {
        intent: "unknown",
        reply:
          "Slide into our DMs at @underdogs_nagpur or tap one of the questions below for DHAMAAKA Phase 1 rates, timings, and tables!",
        expression: "shrug",
        followUpIds: ["diwali_rates", "diwali_cover", "diwali_when"],
      };
  }
}
