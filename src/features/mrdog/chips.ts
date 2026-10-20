import type {WorldId} from "@/theme/tokens";
import {FIXED_QUESTIONS,getInitialFixedQuestionsForWorld,type FixedQuestionItem} from "./faq";
export function getChipsForWorld(world: WorldId, activeFollowUps: string[] = []): FixedQuestionItem[] {
  if (activeFollowUps && activeFollowUps.length > 0) {
    const matched = activeFollowUps
      .map((id) => FIXED_QUESTIONS[id])
      .filter((q): q is FixedQuestionItem => Boolean(q));
    if (matched.length > 0) return matched;
  }
  return getInitialFixedQuestionsForWorld(world);
}

