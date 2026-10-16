/**
 * Speech envelope and character-timed speech queue for Mr. Dog.
 * Synchronizes the typewriter text reveal with jaw flap and 2D talk states.
 */

// Devanagari vowel signs range: \u093E to \u094C, independent vowels \u0904 to \u0914
const DEVANAGARI_VOWEL_REGEX = /[\u0904-\u0914\u093E-\u094C]/;
const LATIN_VOWEL_REGEX = /[aeiouAEIOU]/;

export interface SpeechStep {
  char: string;
  jawTarget: number; // 0 to 1
  pauseMs: number;
}

export function getCharSpeechTarget(char: string): { jawTarget: number; pauseMs: number } {
  if (char === "." || char === "!" || char === "?") {
    return { jawTarget: 0, pauseMs: 160 };
  }
  if (char === " " || char === "," || char === ";" || char === ":") {
    return { jawTarget: 0, pauseMs: 25 };
  }
  if (LATIN_VOWEL_REGEX.test(char) || DEVANAGARI_VOWEL_REGEX.test(char)) {
    return { jawTarget: 0.8, pauseMs: 0 };
  }
  // Consonants and other characters
  return { jawTarget: 0.35, pauseMs: 0 };
}

export class SpeechQueue {
  private queue: string[] = [];
  private revealedText = "";
  private currentJawTarget = 0;
  private isTalking = false;
  private lastCharTime = 0;
  private pendingPause = 0;

  private onUpdate: (revealed: string, jaw: number, talking: boolean) => void;
  private onComplete?: () => void;

  constructor(
    onUpdate: (revealed: string, jaw: number, talking: boolean) => void,
    onComplete?: () => void
  ) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  public pushText(text: string, motionEnabled: boolean) {
    if (!motionEnabled) {
      // Instant reveal with motion off
      this.revealedText += text;
      this.currentJawTarget = 0;
      this.isTalking = false;
      this.onUpdate(this.revealedText, 0, false);
      if (this.onComplete) this.onComplete();
      return;
    }

    for (const ch of text) {
      this.queue.push(ch);
    }
    this.isTalking = true;
  }

  public tick(deltaMs: number, motionEnabled: boolean): { jaw: number; talking: boolean } {
    if (!motionEnabled) {
      return { jaw: 0, talking: false };
    }

    if (this.pendingPause > 0) {
      this.pendingPause -= deltaMs;
      return { jaw: this.currentJawTarget, talking: this.isTalking };
    }

    if (this.queue.length === 0) {
      if (this.isTalking) {
        this.currentJawTarget = 0;
        this.isTalking = false;
        this.onUpdate(this.revealedText, 0, false);
        if (this.onComplete) this.onComplete();
      }
      return { jaw: 0, talking: false };
    }

    // Dynamic rate: ~28 chars/s base (~35ms per char).
    // If queue > 60 chars, accelerate to keep reveal within 1.5s
    const baseInterval = 35;
    const interval = this.queue.length > 60 ? Math.max(12, 1500 / this.queue.length) : baseInterval;

    this.lastCharTime += deltaMs;

    while (this.lastCharTime >= interval && this.queue.length > 0) {
      this.lastCharTime -= interval;
      const nextChar = this.queue.shift()!;
      this.revealedText += nextChar;

      const { jawTarget, pauseMs } = getCharSpeechTarget(nextChar);
      this.currentJawTarget = jawTarget;

      if (pauseMs > 0) {
        this.pendingPause = pauseMs;
        break;
      }
    }

    this.onUpdate(this.revealedText, this.currentJawTarget, true);
    return { jaw: this.currentJawTarget, talking: true };
  }

  public clear() {
    this.queue = [];
    this.revealedText = "";
    this.currentJawTarget = 0;
    this.isTalking = false;
    this.pendingPause = 0;
    this.lastCharTime = 0;
  }

  public getRevealed(): string {
    return this.revealedText;
  }

  public hasPending(): boolean {
    return this.queue.length > 0;
  }
}
