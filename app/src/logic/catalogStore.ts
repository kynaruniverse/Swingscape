/**
 * NICHE — catalog store.
 *
 * Tracks every *unique* word the player has ever found, across both
 * Explore and Daily Duel — not just the rare-and-above finds that make
 * it into the Word Cabinet (see collectionStore.ts). This is what
 * powers the "Specimen No. N catalogued" running count on Home: even
 * a Common find still adds to the player's lifetime total.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "niche:catalog:v1";

interface CatalogState {
  total: number;
  seen: string[]; // every word counted so far, so re-finding one doesn't inflate the total
}

async function loadCatalog(): Promise<CatalogState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CatalogState) : { total: 0, seen: [] };
  } catch (err) {
    console.warn("Failed to load catalog", err);
    return { total: 0, seen: [] };
  }
}

export async function getCatalogTotal(): Promise<number> {
  const c = await loadCatalog();
  return c.total;
}

/**
 * Records a find. Returns the word's permanent catalog number
 * (1-based, in discovery order) — the same number every time this
 * word is found again, since re-finding a word doesn't grow the
 * catalog.
 */
export async function recordDiscovery(word: string): Promise<number> {
  const c = await loadCatalog();
  const existingIdx = c.seen.indexOf(word);
  if (existingIdx !== -1) return existingIdx + 1;

  c.seen.push(word);
  c.total = c.seen.length;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch (err) {
    console.warn("Failed to save catalog", err);
  }

  return c.total;
}
