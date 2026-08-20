/**
 * NICHE — round logic.
 *
 * Manages state for a single pair: validating a guess, tracking every
 * word found so far for this pair, and identifying the player's best
 * find. Pure logic, no UI — screens call into this.
 */

import { WordStore, WordEntry } from "./wordStore";
import { WordPair } from "./pairGenerator";

export type GuessResult =
  | { status: "invalid_word" }
  | { status: "out_of_range" }
  | { status: "already_found" }
  | { status: "success"; entry: WordEntry; isNewBest: boolean };

export class Round {
  readonly pair: WordPair;
  private store: WordStore;
  private found: Map<string, WordEntry> = new Map();

  constructor(pair: WordPair, store: WordStore) {
    this.pair = pair;
    this.store = store;
  }

  submitGuess(rawInput: string): GuessResult {
    const word = rawInput.trim().toLowerCase();

    if (!this.store.isValidWord(word)) {
      return { status: "invalid_word" };
    }
    if (!this.store.isInRange(word, this.pair.wordA, this.pair.wordB)) {
      return { status: "out_of_range" };
    }
    if (this.found.has(word)) {
      return { status: "already_found" };
    }

    const entry = this.store.getEntry(word)!;
    const previousBest = this.bestFind();
    const isNewBest = !previousBest || entry.rarity_score > previousBest.rarity_score;

    this.found.set(word, entry);
    return { status: "success", entry, isNewBest };
  }

  /** All words found so far this round, rarest first. */
  allFinds(): WordEntry[] {
    return [...this.found.values()].sort((a, b) => b.rarity_score - a.rarity_score);
  }

  bestFind(): WordEntry | undefined {
    return this.allFinds()[0];
  }

  /** How close the player's best find is to the theoretical best (0-1). */
  percentOfBest(): number {
    const best = this.bestFind();
    if (!best || !this.pair.bestPossible) return 0;
    return best.rarity_score / this.pair.bestPossible.rarity_score;
  }
}
