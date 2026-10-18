import { create } from "zustand";
import { site } from "@/content/site";
import { useStore as useAppStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { SpeechQueue } from "./speech";

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

  // Initial world-dependent greeting from site.ts
  return [];
}

export function getWorldGreeting(world: WorldId): string {
  if (world === "redroom") {
    return `Gate's open to The Red Room. Costumes are compulsory — dress to disturb. Ask me anything about Halloween night.`;
  }
  if (world === "diwali") {
    return `Welcome to DHAMAAKA season — The Karan Johar Edition (${site.diwali.accent}). Ask me anything about our Diwali premiere.`;
  }
  return "Gate's open. I'm Mr. Dog — ask me anything about Underdogs and the nights.";
}

export function getChipsForWorld(world: WorldId): string[] {
  if (world === "redroom") {
    return ["When & where?", "Dress code?", "Headline DJ", "Partners"];
  }
  if (world === "diwali") {
    return ["When & where?", "Headline DJ", "Partners", "The two nights"];
  }
  if (world === "home") {
    return ["What is Underdogs?", "What's on this season?", "Past nights", "Ticket entry?"];
  }
  return ["The two nights", "When & where?", "Dress codes", "Who is playing?"];
}

export function worldToOutfit(world: WorldId): MrDogOutfit {
  if (world === "redroom") return "redroom";
  if (world === "diwali") return "diwali";
  return "home";
}

let activeAbortController: AbortController | null = null;
let speechQueueInstance: SpeechQueue | null = null;

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
    });
  },

  stopStreaming: () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    if (speechQueueInstance) {
      speechQueueInstance.clear();
    }
    set({ isStreaming: false, streamingText: "" });
  },

  sendMessage: async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    // Check party/rage trigger words
    const isRageTrigger = /\b(party|parties|night|nights|rage|monish|mohnish|yogi|halloween|diwali|dhamaaka|red room)\b/i.test(clean);

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

    activeAbortController = new AbortController();

    const assistantMsgId = "a-" + Date.now();
    let accumulatedText = "";

    speechQueueInstance = new SpeechQueue(
      (revealed, jaw, talking) => {
        set({
          streamingText: revealed,
          jawTarget: jaw,
          expression: talking ? "talking" : get().expression === "talking" ? "idle" : get().expression,
        });
      },
      () => {
        // Queue finished
        const finalMsgs: ChatMessage[] = [
          ...updated,
          {
            id: assistantMsgId,
            role: "assistant",
            content: accumulatedText,
          },
        ];
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalMsgs));
        } catch {}

        set({
          messages: finalMsgs,
          isStreaming: false,
          streamingText: "",
          jawTarget: 0,
          expression: "idle",
        });
      }
    );

    try {
      const res = await fetch("/api/mr-dog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          world: currentWorld,
        }),
        signal: activeAbortController.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to receive stream");
      }

      // First token arrived
      if (isRageTrigger) {
        set({ expression: "rage" });
        setTimeout(() => {
          if (get().expression === "rage") {
            set({ expression: "talking" });
          }
        }, 1200);
      } else {
        set({ expression: "talking" });
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Check for shrug trigger
        if (/announcing soon|don't know|under wraps/i.test(chunk)) {
          set({ expression: "shrug" });
        }

        speechQueueInstance.pushText(chunk, motion);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      set({ expression: "sorry" });
      const errorMsg = "Lost the signal at the gate. Try again in a minute, bhai.";
      speechQueueInstance.pushText(errorMsg, motion);
    }
  },
}));
