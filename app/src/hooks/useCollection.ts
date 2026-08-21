import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Tier } from "../logic/wordStore";
import { CollectionEntry, loadCollection, clearCollection } from "../logic/collectionStore";

export type SortMode = "rarity" | "recent";

// Owns loading, sorting, tier-count aggregation, and clearing for the
// Word Cabinet — independent of how any of that gets rendered.
export function useCollection() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("rarity");
  const [loaded, setLoaded] = useState(false);

  // Reload every time this screen gains focus (not just on mount) so
  // finds added in Explore show up immediately when the player switches
  // tabs, without needing a global state manager for something this simple.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadCollection().then((c) => {
        if (!cancelled) {
          setEntries(c);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) =>
        sortMode === "rarity"
          ? b.rarity_score - a.rarity_score
          : new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
      ),
    [entries, sortMode]
  );

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = {
      common: 0,
      familiar: 0,
      uncommon: 0,
      rare: 0,
      obscure: 0,
      niche: 0,
    };
    for (const item of entries) {
      if (counts[item.tier] !== undefined) {
        counts[item.tier]++;
      }
    }
    return counts;
  }, [entries]);

  const handleClear = useCallback(() => {
    Alert.alert("Clear collection?", "This removes every saved find. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearCollection();
          setEntries([]);
        },
      },
    ]);
  }, []);

  return { entries, sorted, sortMode, setSortMode, loaded, tierCounts, handleClear };
}
