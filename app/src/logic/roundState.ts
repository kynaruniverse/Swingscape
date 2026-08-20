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
  return { pair, finds: {}, attemptsUsed: 0, maxAttempts };
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
