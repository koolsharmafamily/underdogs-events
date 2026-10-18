import { site, ANNOUNCING_SOON } from "@/content/site";
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
  | "dress"
  | "entry"
  | "booking"
  | "artist"
  | "about"
  | "past"
  | "events"
  | "partners"
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
      "We’re Nagpur’s party people. We don’t throw parties — we build worlds and open the gate. Every night gets a name, a dress code, and a reason to remember it. Chaos, curated.",
    expression: "talking",
    followUpIds: ["season", "past", "booking"],
  },
  season: {
    id: "season",
    chipLabel: "This season's nights",
    userQuestion: "What's on this season?",
    answer:
      "Two worlds. Two celebrations. One unforgettable season:\n\n• World One: The Red Room (Halloween) — Saturday 24 October 2026 at Millo, Civil Lines.\n• World Two: DHAMAAKA (Diwali — The Karan Johar Edition) — Saturday 7 November 2026 at Hotel Centre Point, Nagpur.",
    expression: "talking",
    followUpIds: ["redroom_when", "diwali_when", "entry"],
  },
  past: {
    id: "past",
    chipLabel: "Past nights thrown",
    userQuestion: "What past nights have you thrown?",
    answer:
      "We’ve thrown Project X (latest at Pablo, Nagpur), Retro Holi, Anti V, Diwali 2k25, Holi 2k25, Maison Blanche, Afrochella, Akai Yane, Luau, plus our legendary NYE editions.",
    expression: "talking",
    followUpIds: ["season", "about", "booking"],
  },
  entry: {
    id: "entry",
    chipLabel: "How to get tickets / entry?",
    userQuestion: "How do I get tickets or entry?",
    answer:
      "I run the door, not the box office, bhai! Entry details and passes are announcing soon. We don’t sell tickets or take bookings on this website. Keep your eyes on @underdogs_nagpur on Instagram for the official drop.",
    expression: "shrug",
    followUpIds: ["booking", "redroom_when", "diwali_when"],
  },
  booking: {
    id: "booking",
    chipLabel: "VIP Booking & Phone numbers",
    userQuestion: "How do I book tables or contact the team?",
    answer:
      "For official table bookings, VIP reservations, and inquiries, connect directly with the Underdogs team:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505\n\nOr DM @underdogs_nagpur on Instagram.",
    expression: "wink",
    followUpIds: ["redroom_when", "diwali_when", "entry"],
  },
  instagram: {
    id: "instagram",
    chipLabel: "Official Instagram Link",
    userQuestion: "Can you give the link to message or Instagram?",
    answer:
      "Tap right here to DM us on Instagram: https://instagram.com/underdogs_nagpur (@underdogs_nagpur)! You can also call VIP table reservations directly:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505",
    expression: "wink",
    followUpIds: ["booking", "entry", "season"],
  },

  // --- THE RED ROOM (HALLOWEEN) ---
  redroom_when: {
    id: "redroom_when",
    chipLabel: "When & where is Red Room?",
    userQuestion: "When and where is The Red Room?",
    answer:
      "The Red Room descends on Saturday, 24 October 2026 at Millo — Kitchen & Bar (245/U1, East High Court Road, near Zudio, Civil Lines, Nagpur 440001). Time details are announcing soon.",
    expression: "talking",
    followUpIds: ["redroom_dress", "redroom_dj", "redroom_booking"],
  },
  redroom_dress: {
    id: "redroom_dress",
    chipLabel: "Halloween dress code",
    userQuestion: "What is the dress code for Halloween?",
    answer:
      "Dress to disturb. Dress to deceive. Dress to become someone else.\n\nCostumes aren’t optional — consider this your warning! Come as yourself and I'll be very disappointed at the gate.",
    expression: "rage",
    followUpIds: ["redroom_dj", "redroom_when", "entry"],
  },
  redroom_dj: {
    id: "redroom_dj",
    chipLabel: "Headline DJ (Red Room)",
    userQuestion: "Who is the DJ for The Red Room?",
    answer:
      "DJ Monish is on the decks! Nagpur's premier nightlife authority and resident crowd-controller at Millo is taking over with dark Afro-house grooves, high-octane transitions, and high-energy club anthems.",
    expression: "rage",
    followUpIds: ["redroom_dress", "redroom_booking", "redroom_partners"],
  },
  redroom_booking: {
    id: "redroom_booking",
    chipLabel: "Book Millo VIP tables",
    userQuestion: "How do I book VIP tables for The Red Room?",
    answer:
      "For table reservations at Millo — Kitchen & Bar, call:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505\n\nOr message @underdogs_nagpur.",
    expression: "wink",
    followUpIds: ["redroom_when", "redroom_dress", "redroom_dj"],
  },
  redroom_partners: {
    id: "redroom_partners",
    chipLabel: "Red Room partners",
    userQuestion: "Who are the partners for The Red Room?",
    answer:
      "The Red Room is brought together in association with:\n• Title partner: F Salon by FashionTV, Nagpur\n• Venue partner: Millo — Kitchen & Bar\n• Glam partner: The Makeup Alchemy\n• Creative experience partner: Layerz\n• Tech partner: Kool Korp",
    expression: "talking",
    followUpIds: ["redroom_when", "redroom_dj", "redroom_booking"],
  },

  // --- DHAMAAKA (DIWALI) ---
  diwali_when: {
    id: "diwali_when",
    chipLabel: "When & where is DHAMAAKA?",
    userQuestion: "When and where is DHAMAAKA?",
    answer:
      "NO CTRL presents DHAMAAKA — The Karan Johar Edition on Saturday, 7 November 2026 at Hotel Centre Point, Nagpur. Start time is announcing soon.",
    expression: "talking",
    followUpIds: ["diwali_dress", "diwali_artist", "diwali_booking"],
  },
  diwali_dress: {
    id: "diwali_dress",
    chipLabel: "Diwali theme & attire",
    userQuestion: "What is the theme and dress code for DHAMAAKA?",
    answer:
      "DHAMAAKA — The Karan Johar Edition (दीपावली धमाका). Theme and dress code details are announcing soon. Think pure royal Bollywood couture and premiere-night glamour.",
    expression: "wink",
    followUpIds: ["diwali_artist", "diwali_when", "entry"],
  },
  diwali_artist: {
    id: "diwali_artist",
    chipLabel: "Headline Artist (Diwali)",
    userQuestion: "Who is the artist performing at DHAMAAKA?",
    answer:
      "The headline artist for DHAMAAKA is announcing soon! Keep an eye on @underdogs_nagpur on Instagram for the official reveal.",
    expression: "shrug",
    followUpIds: ["diwali_when", "diwali_dress", "diwali_booking"],
  },
  diwali_booking: {
    id: "diwali_booking",
    chipLabel: "Book Centre Point tables",
    userQuestion: "How do I book VIP tables for DHAMAAKA?",
    answer:
      "For table reservations at Hotel Centre Point, Nagpur, reach out to:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505\n\nOr DM @underdogs_nagpur on Instagram.",
    expression: "wink",
    followUpIds: ["diwali_when", "diwali_dress", "diwali_partners"],
  },
  diwali_partners: {
    id: "diwali_partners",
    chipLabel: "DHAMAAKA partners",
    userQuestion: "Who are the partners for DHAMAAKA?",
    answer:
      "DHAMAAKA is presented by NO CTRL with:\n• Powered by: Rich Bliss Auto · Rich Bliss Jewels\n• Co-powered by: F Salon by FashionTV\n• Venue partner: Hotel Centre Point\n• Beverage partner: Alpha Bull Rum\n• Gifting partner: Shika Arts\n• Experience partner: Layerz\n• Fashion partner: Aayush Sachdev Couture\n• Tech partner: Kool Korp\n• Travel partner: Nova Travels",
    expression: "talking",
    followUpIds: ["diwali_when", "diwali_artist", "diwali_booking"],
  },
};

/**
 * Returns initial fixed questions list for each world view.
 */
export function getInitialFixedQuestionsForWorld(world: WorldContext): FixedQuestionItem[] {
  if (world === "redroom") {
    return [
      FIXED_QUESTIONS.redroom_when,
      FIXED_QUESTIONS.redroom_dress,
      FIXED_QUESTIONS.redroom_dj,
      FIXED_QUESTIONS.entry,
      FIXED_QUESTIONS.redroom_booking,
      FIXED_QUESTIONS.redroom_partners,
    ];
  }
  if (world === "diwali") {
    return [
      FIXED_QUESTIONS.diwali_when,
      FIXED_QUESTIONS.diwali_dress,
      FIXED_QUESTIONS.diwali_artist,
      FIXED_QUESTIONS.entry,
      FIXED_QUESTIONS.diwali_booking,
      FIXED_QUESTIONS.diwali_partners,
    ];
  }
  // Home & Events default
  return [
    FIXED_QUESTIONS.about,
    FIXED_QUESTIONS.season,
    FIXED_QUESTIONS.redroom_when,
    FIXED_QUESTIONS.diwali_when,
    FIXED_QUESTIONS.entry,
    FIXED_QUESTIONS.booking,
    FIXED_QUESTIONS.past,
  ];
}

const INTENT_PATTERNS: { intent: Intent; keywords: RegExp }[] = [
  {
    intent: "instagram",
    keywords:
      /\b(instagram|insta|ig|dm|message|inbox|link|handle|profile|reach|direct message|text you|chat)\b/i,
  },
  {
    intent: "booking",
    keywords:
      /\b(call|phone|number|numbers|mobile|contact|table|tables|vip|cabana|reservation|reservations|inquiry|inquiries|bhai number|reach)\b/i,
  },
  {
    intent: "entry",
    keywords:
      /\b(ticket|tickets|entry|pass|passes|price|prices|rate|cost|kitna|rupee|rupees|inr|charges|book|booking|rsvp|buy|purchase|how much|gate pass|come|coming|attend|attending|join|get in|admission|allowed)\b/i,
  },
  {
    intent: "when",
    keywords:
      /\b(when|date|dates|time|timing|schedule|kab|tarikh|tareekh|din|hours|starts?)\b/i,
  },
  {
    intent: "where",
    keywords:
      /\b(where|venue|place|location|address|kahan|kidhar|kuthe|kothe|city|directions?|map|millo|centre point|hotel centre point)\b/i,
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
      /\b(partner|partners|sponsor|sponsors|powered by|co-powered|association|brands?|rich bliss|f salon|layerz|kool korp)\b/i,
  },
  {
    intent: "about",
    keywords:
      /\b(what is underdogs|who are you|who are underdogs|tell me about underdogs|about|company|crew|human|are you human|real person|bot|ai)\b/i,
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

  // 3. Keyword Intent detection with world awareness
  const intent = detectIntent(text);

  switch (intent) {
    case "instagram": {
      return {
        intent,
        reply:
          "Tap right here to DM us on Instagram: https://instagram.com/underdogs_nagpur (@underdogs_nagpur)! You can also reach our VIP booking lines directly:\n\n• +91 90491 00002\n• +91 98231 77648\n• +91 72762 05656\n• +91 96891 93505",
        expression: "wink",
        followUpIds:
          world === "redroom"
            ? ["redroom_when", "redroom_dress", "redroom_booking"]
            : world === "diwali"
              ? ["diwali_when", "diwali_dress", "diwali_booking"]
              : ["season", "booking", "entry"],
      };
    }

    case "booking": {
      const q =
        world === "redroom"
          ? FIXED_QUESTIONS.redroom_booking
          : world === "diwali"
            ? FIXED_QUESTIONS.diwali_booking
            : FIXED_QUESTIONS.booking;
      return {
        intent,
        reply: q.answer,
        expression: "wink",
        followUpIds: q.followUpIds,
      };
    }

    case "entry": {
      if (world === "redroom") {
        return {
          intent,
          reply:
            "I run the door, not the box office, bhai! For The Red Room, costumes are strictly compulsory — dress to disturb. Entry details and passes are announcing soon. For VIP table reservations at Millo, call +91 90491 00002 or DM @underdogs_nagpur.",
          expression: "rage",
          followUpIds: ["redroom_dress", "redroom_booking", "redroom_when"],
        };
      }
      if (world === "diwali") {
        return {
          intent,
          reply:
            "Welcome to DHAMAAKA — The Karan Johar Edition! Entry details and passes are announcing soon. For table reservations at Hotel Centre Point, call +91 90491 00002 or DM @underdogs_nagpur.",
          expression: "wink",
          followUpIds: ["diwali_dress", "diwali_booking", "diwali_when"],
        };
      }
      return {
        intent,
        reply: FIXED_QUESTIONS.entry.answer,
        expression: "shrug",
        followUpIds: FIXED_QUESTIONS.entry.followUpIds,
      };
    }

    case "when":
    case "where": {
      const q =
        world === "redroom"
          ? FIXED_QUESTIONS.redroom_when
          : world === "diwali"
            ? FIXED_QUESTIONS.diwali_when
            : FIXED_QUESTIONS.season;
      return {
        intent,
        reply: q.answer,
        expression: "talking",
        followUpIds: q.followUpIds,
      };
    }

    case "dress": {
      const q =
        world === "redroom"
          ? FIXED_QUESTIONS.redroom_dress
          : world === "diwali"
            ? FIXED_QUESTIONS.diwali_dress
            : FIXED_QUESTIONS.redroom_dress;
      return {
        intent,
        reply: q.answer,
        expression: q.expression,
        followUpIds: q.followUpIds,
      };
    }

    case "artist": {
      const q =
        world === "redroom"
          ? FIXED_QUESTIONS.redroom_dj
          : world === "diwali"
            ? FIXED_QUESTIONS.diwali_artist
            : FIXED_QUESTIONS.redroom_dj;
      return {
        intent,
        reply: q.answer,
        expression: q.expression,
        followUpIds: q.followUpIds,
      };
    }

    case "partners": {
      const q =
        world === "redroom"
          ? FIXED_QUESTIONS.redroom_partners
          : world === "diwali"
            ? FIXED_QUESTIONS.diwali_partners
            : FIXED_QUESTIONS.redroom_partners;
      return {
        intent,
        reply: q.answer,
        expression: "talking",
        followUpIds: q.followUpIds,
      };
    }

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
        followUpIds: FIXED_QUESTIONS.season.followUpIds,
      };

    case "thanks":
      return {
        intent,
        reply: "Anytime, boss! See you at the gate. Stay unruly.",
        expression: "wink",
        followUpIds:
          world === "redroom"
            ? ["redroom_when", "redroom_dress"]
            : world === "diwali"
              ? ["diwali_when", "diwali_dress"]
              : ["season", "booking"],
      };

    case "greeting":
      if (world === "redroom") {
        return {
          intent,
          reply:
            "Gate's open to The Red Room. Costumes are compulsory here. Tap any question below or ask me about the night, DJ Monish, or VIP tables.",
          expression: "greet",
          followUpIds: ["redroom_when", "redroom_dress", "redroom_dj"],
        };
      }
      if (world === "diwali") {
        return {
          intent,
          reply:
            "Welcome to DHAMAAKA — The Karan Johar Edition! Tap any question below or ask me about Hotel Centre Point, tables, and dress codes.",
          expression: "greet",
          followUpIds: ["diwali_when", "diwali_dress", "diwali_booking"],
        };
      }
      return {
        intent,
        reply:
          "Gate's open. I'm Mr. Dog — the Underdogs concierge. Tap any question below or ask me anything about the season.",
        expression: "greet",
        followUpIds: ["season", "about", "booking"],
      };

    case "unknown":
    default:
      return {
        intent: "unknown",
        reply:
          "That's still under wraps — announcing soon, bhai! Even I don't know, and I run the door at the Gate to Rage. Tap one of the questions below or ask me about dates, venues, dress codes, or booking numbers.",
        expression: "shrug",
        followUpIds:
          world === "redroom"
            ? ["redroom_when", "redroom_dress", "redroom_dj"]
            : world === "diwali"
              ? ["diwali_when", "diwali_dress", "diwali_booking"]
              : ["season", "booking", "entry"],
      };
  }
}
