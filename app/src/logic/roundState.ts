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
}

export type GuessResult =
  | { status: "invalid_word" }
  | { status: "out_of_range" }
  | { status: "already_found" }
  | { status: "success"; entry: WordEntry; isNewBest: boolean };

export function createRoundState(pair: WordPair): RoundState {
  return { pair, finds: {} };
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
  const word = rawInput.trim().toLowerCase();

  if (!store.isValidWord(word)) {
    return { result: { status: "invalid_word" }, nextState: state };
  }
  if (!store.isInRange(word, state.pair.wordA, state.pair.wordB)) {
    return { result: { status: "out_of_range" }, nextState: state };
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
  };

  return {
    result: { status: "success", entry, isNewBest },
    nextState,
  };
}
