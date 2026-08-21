/**
 * NICHE — word pair generator.
 *
 * Generates a fair, playable bookend pair (wordA, wordB) such that:
 *  - the alphabetical gap between them contains a difficulty-appropriate
 *    number of dictionary entries
 *  - the gap guarantees at least one word above a minimum rarity floor,
 *    so no pair is a dead end
 *  - bookend words themselves are biased toward common/familiar tiers,
 *    so the *edges* are always easy to read even when the gap is hard
 */

import { WordStore, WordEntry } from "./wordStore";

export type Difficulty = "easy" | "medium" | "hard";

interface GapRange {
  minEntries: number;
  maxEntries: number;
}

const GAP_RANGES: Record<Difficulty, GapRange> = {
  easy: { minEntries: 150, maxEntries: 400 },
  medium: { minEntries: 40, maxEntries: 150 },
  hard: { minEntries: 8, maxEntries: 40 },
};

// Every generated pair must contain at least one obtainable word at or
// above this rarity score, so a player always has *something* worth
// finding — no pair should be a guaranteed dead end.
const MIN_GUARANTEED_RARITY = 400;

// Bookends are picked from words at or above this tier so the pair is
// always easy to read/say, even on Hard, where the *gap* is the hard part.
const BOOKEND_MIN_ZIPF = 4.0;

export interface WordPair {
  wordA: string;
  wordB: string;
  difficulty: Difficulty;
  gapSize: number;
  bestPossible: WordEntry | undefined;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Rejects bookend pairs that are too easy to "solve" without ever
 * knowing an in-between word — the design doc's "A" / "AB" example.
 * True whenever the shorter bookend is an exact prefix of the longer
 * one (e.g. "cat" / "cats"), which is a different failure mode from
 * two same-length words that merely share some letters (e.g. "car" /
 * "cat" is a perfectly good pair — there's a real gap in between).
 */
function isTrivialPair(wordA: string, wordB: string): boolean {
  const shorter = wordA.length <= wordB.length ? wordA : wordB;
  const longer = wordA.length <= wordB.length ? wordB : wordA;
  return longer.startsWith(shorter);
}

/**
 * Attempts to generate a valid pair for the given difficulty.
 * Retries with a fresh random starting point on failure (rejection
 * sampling) — cheap enough to do many attempts since everything is
 * in-memory, no network cost.
 */
export function generatePair(
  store: WordStore,
  difficulty: Difficulty,
  maxAttempts = 200
): WordPair | null {
  const { minEntries, maxEntries } = GAP_RANGES[difficulty];

  // Candidate bookend words: only common/familiar-tier words, so the
  // pair reads naturally regardless of how hard the gap itself is.
  const bookendCandidates: number[] = [];
  for (let i = 0; i < store.size; i++) {
    if (store.get(i).zipf >= BOOKEND_MIN_ZIPF) bookendCandidates.push(i);
  }

  if (bookendCandidates.length < 2) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startPos = randomInt(0, bookendCandidates.length - 2);
    const startIdx = bookendCandidates[startPos];
    const wordA = store.get(startIdx).word;

    // find a second bookend candidate roughly the right distance away
    for (let endPos = startPos + 1; endPos < bookendCandidates.length; endPos++) {
      const endIdx = bookendCandidates[endPos];
      const wordB = store.get(endIdx).word;

      if (isTrivialPair(wordA, wordB)) continue; // e.g. "cat" / "cats" — too obvious

      const gapSize = store.gapCount(wordA, wordB);

      if (gapSize < minEntries) continue; // too narrow, keep extending
      if (gapSize > maxEntries) break; // too wide, this start point is done

      const bestPossible = store.bestPossibleInRange(wordA, wordB);
      if (!bestPossible || bestPossible.rarity_score < MIN_GUARANTEED_RARITY) {
        continue; // dead-end pair, try another
      }

      return { wordA, wordB, difficulty, gapSize, bestPossible };
    }
  }

  return null; // caller should handle: relax constraints or show an error
}
