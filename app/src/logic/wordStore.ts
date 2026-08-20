/**
 * NICHE — word store.
 *
 * Loads the precomputed word list (word, zipf, rarity_score, tier) and
 * provides fast, offline lookups: validity check, alphabetical range
 * lookup, and rarity scoring. The list is pre-sorted alphabetically by
 * the build script, so range lookups are binary search + slice — no
 * network call, no per-guess computation cost.
 */

export type Tier = "common" | "familiar" | "uncommon" | "rare" | "obscure" | "niche";

export interface WordEntry {
  word: string;
  zipf: number;
  rarity_score: number;
  tier: Tier;
  definition?: string;
}

export class WordStore {
  private entries: WordEntry[];
  private wordToEntry: Map<string, WordEntry>;

  constructor(entries: WordEntry[]) {
    // Assumes entries are already sorted alphabetically by `word`
    // (guaranteed by build_wordlist.py). If loading from an untrusted
    // or hand-edited source, sort defensively here instead.
    this.entries = entries;
    this.wordToEntry = new Map(entries.map((e) => [e.word, e]));
  }

  /** Is this a real, valid word in our list? */
  isValidWord(word: string): boolean {
    return this.wordToEntry.has(word.toLowerCase());
  }

  /** Look up the full entry (rarity, tier) for a known word. */
  getEntry(word: string): WordEntry | undefined {
    return this.wordToEntry.get(word.toLowerCase());
  }

  /** Index of the first entry >= target word (binary search lower bound). */
  private lowerBound(target: string): number {
    let lo = 0;
    let hi = this.entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.entries[mid].word < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /**
   * Number of dictionary entries strictly between wordA and wordB
   * (exclusive on both ends). This is the "gap size" used by the pair
   * generator to control difficulty.
   */
  gapCount(wordA: string, wordB: string): number {
    const [lo, hi] = wordA < wordB ? [wordA, wordB] : [wordB, wordA];
    const startIdx = this.lowerBound(lo);
    const endIdx = this.lowerBound(hi);
    // exclude the bookends themselves if they happen to be in the list
    let count = endIdx - startIdx;
    if (this.entries[startIdx]?.word === lo) count -= 1;
    return Math.max(0, count);
  }

  /** The best (rarest) obtainable word strictly between two bookends. */
  bestPossibleInRange(wordA: string, wordB: string): WordEntry | undefined {
    const [lo, hi] = wordA < wordB ? [wordA, wordB] : [wordB, wordA];
    const startIdx = this.lowerBound(lo);
    const endIdx = this.lowerBound(hi);
    let best: WordEntry | undefined;
    for (let i = startIdx; i < endIdx; i++) {
      const e = this.entries[i];
      if (e.word === lo) continue;
      if (!best || e.rarity_score > best.rarity_score) best = e;
    }
    return best;
  }

  /** Is `word` strictly alphabetically between wordA and wordB? */
  isInRange(word: string, wordA: string, wordB: string): boolean {
    const [lo, hi] = wordA < wordB ? [wordA, wordB] : [wordB, wordA];
    return word > lo && word < hi;
  }

  get(index: number): WordEntry {
    return this.entries[index];
  }

  get size(): number {
    return this.entries.length;
  }
}
