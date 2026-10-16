import { site, ANNOUNCING_SOON } from "@/content/site";

export type WorldContext = "home" | "redroom" | "diwali" | "events";

export type Intent =
  | "when"
  | "where"
  | "dress"
  | "entry"
  | "partners"
  | "artist"
  | "about"
  | "past"
  | "events"
  | "greeting"
  | "thanks"
  | "unknown";

interface IntentMatch {
  intent: Intent;
  reply: string;
}

const INTENT_PATTERNS: { intent: Intent; keywords: RegExp }[] = [
  {
    intent: "entry",
    keywords: /\b(ticket|tickets|entry|pass|passes|price|prices|rate|cost|kitna|rupee|rupees|inr|charges|book|booking|rsvp|buy|purchase|how much)\b/i,
  },
  {
    intent: "when",
    keywords: /\b(when|date|dates|time|timing|schedule|kab|tarikh|tareekh|din|hours|starts?)\b/i,
  },
  {
    intent: "where",
    keywords: /\b(where|venue|place|location|address|kahan|kidhar|kuthe|kothe|city|directions?|map)\b/i,
  },
  {
    intent: "dress",
    keywords: /\b(dress|code|costume|costumes|outfit|outfits|theme|kya pehnu|wear|wearing|clothes|attire)\b/i,
  },
  {
    intent: "artist",
    keywords: /\b(dj|artist|artists|music|lineup|line-up|line up|kaun bajayega|performer|playing|tracks?|genre)\b/i,
  },
  {
    intent: "partners",
    keywords: /\b(partner|partners|sponsor|sponsors|powered by|co-powered|association|brands?)\b/i,
  },
  {
    intent: "about",
    keywords: /\b(what is underdogs|who are you|who are underdogs|tell me about underdogs|about|company|crew|human|are you human|real person|bot|ai)\b/i,
  },
  {
    intent: "past",
    keywords: /\b(past|history|previous|project x|retro holi|anti v|maison blanche|afrochella|luau|akai yane)\b/i,
  },
  {
    intent: "events",
    keywords: /\b(events?|two worlds|this season|what's on|whats on|nights|celebrations?|kya scene|scene|chal raha|party)\b/i,
  },
  {
    intent: "thanks",
    keywords: /\b(thank|thanks|dhanyawad|shukriya|bye|cya|see you|goodbye|cheers|awesome|great)\b/i,
  },
  {
    intent: "greeting",
    keywords: /\b(hi|hello|hey|yo|namaste|kaisa hai|wassup|what's up|sup|morning|evening)\b/i,
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

export function getFaqAnswer(intent: Intent, world: WorldContext = "home"): string {
  const redRoom = site.redRoom;
  const diwali = site.diwali;

  switch (intent) {
    case "entry":
      return "I run the door, not the box office. Entry and pass details are announcing soon. Keep an eye on @underdogs_nagpur on Instagram.";

    case "when": {
      if (world === "redroom") {
        return `The Red Room goes down on ${redRoom.sub.split(" · ")[0]}. Timing details are ${ANNOUNCING_SOON}.`;
      }
      if (world === "diwali") {
        return `DHAMAAKA lights up on ${diwali.sub.split(" · ")[0]}. Start time is ${ANNOUNCING_SOON}.`;
      }
      return `Two dates to lock in: The Red Room on ${redRoom.sub.split(" · ")[0]}, and DHAMAAKA on ${diwali.sub.split(" · ")[0]}. Times are announcing soon.`;
    }

    case "where": {
      if (world === "redroom") {
        const row = redRoom.invitation.rows.find((r) => r.label === "Venue");
        return `We're taking over ${row?.value || "Millo — Kitchen & Bar"} at ${row?.sub || "Civil Lines, Nagpur"}.`;
      }
      if (world === "diwali") {
        const row = diwali.invitation.rows.find((r) => r.label === "Venue");
        return `DHAMAAKA is happening at ${row?.value || "Centre Point, Nagpur"}.`;
      }
      return `Two venues in Nagpur: Millo in Civil Lines for The Red Room, and Centre Point for Diwali DHAMAAKA.`;
    }

    case "dress": {
      if (world === "redroom") {
        return "Costumes aren't optional. Dress to disturb, dress to deceive. Come as yourself and I'll be very disappointed at the gate.";
      }
      if (world === "diwali") {
        return "The royal Bollywood Diwali theme and dress code details are announcing soon. Think pure couture.";
      }
      return "For The Red Room on Halloween, costumes are compulsory — dress to disturb. For Diwali DHAMAAKA, dress code is announcing soon.";
    }

    case "artist": {
      if (world === "redroom") {
        return `${redRoom.dj.name} is on the decks for The Red Room, spinning ${redRoom.dj.genre}. Get ready for pure mayhem.`;
      }
      if (world === "diwali") {
        return `${diwali.dj.name} is headlining DHAMAAKA with Bollywood-EDM festival anthems and celebrity remixes.`;
      }
      return `DJ Mohnish headlines The Red Room for Halloween, and DJ Yogi headlines DHAMAAKA for Diwali.`;
    }

    case "partners": {
      if (world === "redroom") {
        const partners = redRoom.partners.list.map((p) => `${p.role}: ${p.name}`).join(", ");
        return `The Red Room is brought together with ${partners}.`;
      }
      if (world === "diwali") {
        const powered = diwali.partners.list.find((p) => p.role.includes("Powered"))?.name;
        return `DHAMAAKA is powered by ${powered || "Rich Bliss"}, co-powered by F Salon by FashionTV, and crafted with our partner family.`;
      }
      return "Both nights are co-powered with top collaborators across Nagpur, including F Salon by FashionTV, Millo, and Layerz.";
    }

    case "about":
      return "I'm Mr. Dog, the Underdogs concierge — an AI running the door at the Gate to Rage. Underdogs is Nagpur's party people. We don't throw ordinary parties — we build worlds and open the gate.";

    case "past":
      return `We've thrown ${site.home.nights.list.slice(0, 6).join(", ")}, plus NYE and festival editions. Latest was Project X at Pablo Nagpur.`;

    case "events":
      return `This season brings two worlds: The Red Room on Saturday 24 October at Millo, and DHAMAAKA on Saturday 7 November at Centre Point. Pick your poison.`;

    case "thanks":
      return "Anytime, boss. See you at the gate.";

    case "greeting":
      if (world === "redroom") {
        return "Gate's open to The Red Room. Costumes are compulsory here. What do you need to know?";
      }
      if (world === "diwali") {
        return "Welcome to DHAMAAKA season — The Karan Johar Edition. Ask me anything about the grand premiere.";
      }
      return "Gate's open. I'm Mr. Dog — ask me anything about Underdogs and the nights.";

    case "unknown":
    default:
      return "That's still under wraps — announcing soon. Even I don't know, and I know everything at the door. Ask me about the dates, venues or dress codes.";
  }
}

/**
 * Returns an instant match if the prompt clearly hits a known intent.
 */
export function matchFaq(text: string, world: WorldContext = "home"): IntentMatch {
  const intent = detectIntent(text);
  return {
    intent,
    reply: getFaqAnswer(intent, world),
  };
}
