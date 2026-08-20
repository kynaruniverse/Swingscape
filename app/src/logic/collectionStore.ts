/**
 * NICHE — collection store.
 *
 * Persists notable finds locally (AsyncStorage) so players build a
 * "cabinet of curiosities" over time, per the GDD's Collection mode.
 * Phase 1 scope: local only, no sync — see GDD §12.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordEntry } from "./wordStore";

const STORAGE_KEY = "niche:collection:v1";

// Only finds at or above this rarity are worth saving — otherwise
// every session's Common/Familiar guesses would clutter the collection
// with words nobody's proud of finding.
export const COLLECTION_MIN_RARITY = 550; // roughly "rare" tier and up

export interface CollectionEntry extends WordEntry {
  foundAt: string; // ISO date string
  pairContext: string; // e.g. "monster – mouse"
}

export async function loadCollection(): Promise<CollectionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CollectionEntry[];
  } catch (err) {
    console.warn("Failed to load collection", err);
    return [];
  }
}

/**
 * Adds a find to the collection if it clears the rarity bar and isn't
 * already saved. Returns the updated collection and whether this was a
 * genuinely new addition (useful for a "added to collection!" toast).
 */
export async function maybeAddToCollection(
  entry: WordEntry,
  pairContext: string
): Promise<{ collection: CollectionEntry[]; wasAdded: boolean }> {
  const current = await loadCollection();

  if (entry.rarity_score < COLLECTION_MIN_RARITY) {
    return { collection: current, wasAdded: false };
  }
  if (current.some((c) => c.word === entry.word)) {
    return { collection: current, wasAdded: false };
  }

  const newEntry: CollectionEntry = {
    ...entry,
    foundAt: new Date().toISOString(),
    pairContext,
  };
  const updated = [newEntry, ...current];

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save collection", err);
    return { collection: current, wasAdded: false };
  }

  return { collection: updated, wasAdded: true };
}

export async function clearCollection(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear collection", err);
  }
}
