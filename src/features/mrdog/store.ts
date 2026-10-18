import { create } from "zustand";
import { site } from "@/content/site";
import { useStore as useAppStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import {
  FIXED_QUESTIONS,
  FixedQuestionItem,
  getInitialFixedQuestionsForWorld,
  matchFaq,
} from "./faq";

export type MrDogExpression =
  | "idle"
  | "greet"
  | "listening"
  | "thinking"
  | "talking"
  | "rage"
  | "shrug"
  | "wink"
  | "sorry";

export type MrDogOutfit = "home" | "redroom" | "diwali";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface MrDogState {
  isOpen: boolean;
  expression: MrDogExpression;
  chatCovering: boolean;
  jawTarget: number;
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  hasGreetedSession: boolean;
  nudgeVisible: boolean;
  nudgeDismissed: boolean;
  launcherWink: boolean;
  activeFollowUps: string[];

  // Actions
  openMrDog: () => void;
  closeMrDog: () => void;
  toggleMrDog: () => void;
  setExpression: (expr: MrDogExpression) => void;
  setChatCovering: (covering: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  stopStreaming: () => void;
  dismissNudge: () => void;
  triggerLauncherWink: () => void;
}

const STORAGE_KEY = "underdogs-mrdog-chat";
const GREETED_KEY = "underdogs-mrdog-greeted";

function getInitialMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

export function getWorldGreeting(world: WorldId): string {
  if (world === "redroom") {
    return `Gate's open to The Red Room. Costumes are compulsory — dress to disturb. Tap any question below or ask me about Halloween night.`;
  }
  if (world === "diwali") {
    return `Welcome to DHAMAAKA season — The Karan Johar Edition (${site.diwali.accent}). Tap any question below or ask me about our Diwali premiere.`;
  }
  return "Gate's open. I'm Mr. Dog — ask me anything about Underdogs, the nights, or tap a question below.";
}

export function getChipsForWorld(world: WorldId, activeFollowUps: string[] = []): FixedQuestionItem[] {
  if (activeFollowUps && activeFollowUps.length > 0) {
    const matched = activeFollowUps
      .map((id) => FIXED_QUESTIONS[id])
      .filter((q): q is FixedQuestionItem => Boolean(q));
    if (matched.length > 0) return matched;
  }
  return getInitialFixedQuestionsForWorld(world);
}

export function worldToOutfit(world: WorldId): MrDogOutfit {
  if (world === "redroom") return "redroom";
  if (world === "diwali") return "diwali";
  return "home";
}

let activeStreamId = 0;

export const useMrDogStore = create<MrDogState>((set, get) => ({
  isOpen: false,
  expression: "idle",
  chatCovering: false,
  jawTarget: 0,
  messages: getInitialMessages(),
  streamingText: "",
  isStreaming: false,
  hasGreetedSession: typeof window !== "undefined" && sessionStorage.getItem(GREETED_KEY) === "1",
  nudgeVisible: false,
  nudgeDismissed: false,
  launcherWink: false,
  activeFollowUps: [],

  openMrDog: () => {
    const greeted = get().hasGreetedSession;
    const currentWorld = useAppStore.getState().world;

    let msgs = get().messages;
    if (msgs.length === 0) {
      msgs = [
        {
          id: "initial-greeting",
          role: "assistant",
          content: getWorldGreeting(currentWorld),
        },
      ];
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
      } catch {}
    }

    set({
      isOpen: true,
      nudgeVisible: false,
      messages: msgs,
      expression: greeted ? "idle" : "greet",
    });

    if (!greeted) {
      try {
        sessionStorage.setItem(GREETED_KEY, "1");
      } catch {}
      set({ hasGreetedSession: true });
      setTimeout(() => {
        if (get().expression === "greet") {
          set({ expression: "idle" });
        }
      }, 1600);
    }
  },

  closeMrDog: () => {
    get().stopStreaming();
    set({
      isOpen: false,
      chatCovering: false,
      expression: "idle",
    });
  },

  toggleMrDog: () => {
    if (get().isOpen) {
      get().closeMrDog();
    } else {
      get().openMrDog();
    }
  },

  setExpression: (expression) => set({ expression }),

  setChatCovering: (chatCovering) => set({ chatCovering }),

  dismissNudge: () => set({ nudgeVisible: false, nudgeDismissed: true }),

  triggerLauncherWink: () => {
    set({ launcherWink: true });
    setTimeout(() => set({ launcherWink: false }), 200);
  },

  clearChat: () => {
    get().stopStreaming();
    const currentWorld = useAppStore.getState().world;
    const fresh = [
      {
        id: "fresh-greeting",
        role: "assistant" as const,
        content: getWorldGreeting(currentWorld),
      },
    ];
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    set({
      messages: fresh,
      streamingText: "",
      expression: "idle",
      activeFollowUps: [],
    });
  },

  stopStreaming: () => {
    activeStreamId++;
    set({ isStreaming: false, streamingText: "", jawTarget: 0 });
  },

  sendMessage: async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: clean,
    };

    const currentWorld = useAppStore.getState().world;
    const motion = useAppStore.getState().motionEnabled;

    const updated = [...get().messages, userMsg];
    set({
      messages: updated,
      isStreaming: true,
      streamingText: "",
      expression: "thinking",
    });

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    activeStreamId++;
    const currentStreamId = activeStreamId;

    // 1. Try calling the backend /api/mr-dog endpoint if available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("/api/mr-dog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          world: currentWorld,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        set({ expression: "talking" });

        while (true) {
          if (activeStreamId !== currentStreamId) break;
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          const hasVowel = /[aeiouAEIOU\u0904-\u0914\u093E-\u094C]/.test(chunk);
          set({
            streamingText: accumulated,
            jawTarget: hasVowel ? 0.75 : 0.35,
            expression: /announcing soon|don't know|under wraps/i.test(accumulated)
              ? "shrug"
              : /\b(party|parties|rage|monish|mohnish|halloween|diwali)\b/i.test(accumulated)
                ? "rage"
                : "talking",
          });
        }

        if (accumulated.trim() && activeStreamId === currentStreamId) {
          const assistantMsg: ChatMessage = {
            id: "a-" + Date.now(),
            role: "assistant",
            content: accumulated.trim(),
          };
          const finalMsgs = [...updated, assistantMsg];
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalMsgs));
          } catch {}

          const match = matchFaq(clean, currentWorld);
          set({
            messages: finalMsgs,
            isStreaming: false,
            streamingText: "",
            jawTarget: 0,
            expression: "idle",
            activeFollowUps: match.followUpIds,
          });
          return;
        }
      }
    } catch {
      // Backend not running, timed out, or mock mode -> continue to fixed Q&A engine
    }

    if (activeStreamId !== currentStreamId) return;

    // 2. Client-side Fixed Q&A Engine (100% reliable without external API)
    const match = matchFaq(clean, currentWorld);
    const fullReply = match.reply;

    // Natural "thinking" beat so it feels responsive like an AI concierge
    await new Promise((r) => setTimeout(r, motion ? 320 : 0));

    if (activeStreamId !== currentStreamId) return;

    set({ expression: match.expression || "talking" });

    // Stream words with realistic typing speed & 3D jaw movement
    const words = fullReply.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      if (activeStreamId !== currentStreamId) return;

      const word = (i === 0 ? "" : " ") + words[i];
      accumulated += word;

      const hasVowel = /[aeiouAEIOU\u0904-\u0914\u093E-\u094C]/.test(word);
      const jaw = hasVowel ? 0.75 : 0.35;

      set({
        streamingText: accumulated,
        jawTarget: jaw,
        expression:
          match.expression === "rage"
            ? "rage"
            : match.expression === "shrug"
              ? "shrug"
              : match.expression === "wink"
                ? i > words.length * 0.7
                  ? "wink"
                  : "talking"
                : "talking",
      });

      // Punctuation pacing: pause longer at periods and commas
      const pause = /[.!?]$/.test(word)
        ? 140
        : /[,;:\n]$/.test(word)
          ? 70
          : 28;

      if (motion) {
        await new Promise((r) => setTimeout(r, pause));
      }
    }

    if (activeStreamId !== currentStreamId) return;

    // Complete reply
    const assistantMsg: ChatMessage = {
      id: "a-" + Date.now(),
      role: "assistant",
      content: fullReply,
    };

    const finalMsgs = [...updated, assistantMsg];
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalMsgs));
    } catch {}

    set({
      messages: finalMsgs,
      isStreaming: false,
      streamingText: "",
      jawTarget: 0,
      expression: "idle",
      activeFollowUps: match.followUpIds,
    });
  },
}));

