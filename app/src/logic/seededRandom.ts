/**
 * NICHE — seeded random.
 *
 * A tiny deterministic PRNG so Daily Duel can produce the *same* pair
 * for every player on a given date, entirely offline — no backend
 * needed to distribute "today's pair". Math.random() is not seedable
 * in JS, so this stands in for it wherever determinism matters.
 */

// FNV-1a-ish string hash -> 32-bit seed. Good enough for a game seed,
// not for anything cryptographic.
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 — small, fast, decent-quality seeded PRNG. Returns a
// function with the same shape as Math.random (0-1 float).
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Today's date as YYYY-MM-DD in the device's local timezone. */
export function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A seeded RNG (Math.random-shaped) derived from an arbitrary string, e.g. a date key. */
export function rngFromSeed(seedStr: string): () => number {
  return mulberry32(hashSeed(seedStr));
}
