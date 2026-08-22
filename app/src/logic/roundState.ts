/**
 * NICHE — round state (pure, immutable version).
 *
 * Replaces the mutating Round class with plain data + pure functions,
 * so React state updates work normally (setRoundState(newState)) instead
 * of needing manual re-render tricks after an internal mutation.
 */

import { WordStore, WordEntry } from "./wordStore";
import { WordPair } from "./pairGenerator";

export interface RoundState {
  pair: WordPair;
  finds: Record<string, WordEntry>; // word -> entry, insertion order not guaranteed
  attemptsUsed: number;
  maxAttempts: number;
  // How many leading letters of pair.bestPossible.word have been
  // revealed via the Hint button. Never reaches the word's full length
  // — a hint should nudge, not solve.
  hintLettersRevealed: number;
}

export type GuessResult =
  | { status: "invalid_word" }
  | { status: "out_of_range" }
  | { status: "already_found" }
  | { status: "success"; entry: WordEntry; isNewBest: boolean }
  | { status: "round_over" };

// A round ends automatically after this many real attempts (guesses that
// were invalid, out of range, or a genuine new find — resubmitting an
// already-found word doesn't cost an attempt).
export const DEFAULT_MAX_ATTEMPTS = 8;

export function createRoundState(
  pair: WordPair,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): RoundState {
  return { pair, finds: {}, attemptsUsed: 0, maxAttempts, hintLettersRevealed: 0 };
}

export function allFinds(state: RoundState): WordEntry[] {
  return Object.values(state.finds).sort((a, b) => b.rarity_score - a.rarity_score);
}

export function bestFind(state: RoundState): WordEntry | undefined {
  return allFinds(state)[0];
}

export function percentOfBest(state: RoundState): number {
  const best = bestFind(state);
  if (!best || !state.pair.bestPossible) return 0;
  return best.rarity_score / state.pair.bestPossible.rarity_score;
}

export function isRoundOver(state: RoundState): boolean {
  return state.attemptsUsed >= state.maxAttempts;
}

/**
 * Attempts a guess against the current state. Returns both the result
 * (for UI feedback) and the new state (or the same state if nothing
 * changed) — caller is responsible for calling setState with it.
 */
export function submitGuess(
  state: RoundState,
  store: WordStore,
  rawInput: string
): { result: GuessResult; nextState: RoundState } {
  if (isRoundOver(state)) {
    return { result: { status: "round_over" }, nextState: state };
  }

  const word = rawInput.trim().toLowerCase();

  if (!store.isValidWord(word)) {
    const nextState: RoundState = { ...state, attemptsUsed: state.attemptsUsed + 1 };
    return { result: { status: "invalid_word" }, nextState };
  }
  if (!store.isInRange(word, state.pair.wordA, state.pair.wordB)) {
    const nextState: RoundState = { ...state, attemptsUsed: state.attemptsUsed + 1 };
    return { result: { status: "out_of_range" }, nextState };
  }
  if (state.finds[word]) {
    return { result: { status: "already_found" }, nextState: state };
  }

  const entry = store.getEntry(word)!;
  const previousBest = bestFind(state);
  const isNewBest = !previousBest || entry.rarity_score > previousBest.rarity_score;

  const nextState: RoundState = {
    ...state,
    finds: { ...state.finds, [word]: entry },
    attemptsUsed: state.attemptsUsed + 1,
  };

  return {
    result: { status: "success", entry, isNewBest },
    nextState,
  };
}

/**
 * Spends one attempt to reveal one more leading letter of the best
 * obtainable word in this gap. Returns the same state (no-op) if the
 * round is already over, there's no known best-possible word, or the
 * hint would reveal the entire word — a hint should never hand over
 * the full answer for free.
 */
export function useHint(state: RoundState): RoundState {
  const target = state.pair.bestPossible?.word;
  if (!target || isRoundOver(state)) return state;
  if (state.hintLettersRevealed >= target.length - 1) return state;

  return {
    ...state,
    hintLettersRevealed: state.hintLettersRevealed + 1,
    attemptsUsed: state.attemptsUsed + 1,
  };
}

/** "e n _ _ _"-style display string for the currently revealed hint, or undefined if no hint taken yet. */
export function hintDisplay(state: RoundState): string | undefined {
  const target = state.pair.bestPossible?.word;
  if (!target || state.hintLettersRevealed === 0) return undefined;

  return target
    .split("")
    .map((ch, i) => (i < state.hintLettersRevealed ? ch.toUpperCase() : "_"))
    .join(" ");
}

/** Whether a hint is still available to take (round active, word known, not fully revealed). */
export function canTakeHint(state: RoundState): boolean {
  const target = state.pair.bestPossible?.word;
  if (!target || isRoundOver(state)) return false;
  return state.hintLettersRevealed < target.length - 1;
}
