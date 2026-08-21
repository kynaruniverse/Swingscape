import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Tier } from "../logic/wordStore";
import { CollectionEntry, loadCollection, clearCollection } from "../logic/collectionStore";

const TIER_COLORS: Record<Tier, string> = {
  common: "#8a8a8a",
  familiar: "#7a9a7a",
  uncommon: "#5a9ab0",
  rare: "#7a6ab0",
  obscure: "#b0698a",
  niche: "#d4a13d",
};

const TIER_LABELS: Record<Tier, string> = {
  common: "COMMON",
  familiar: "FAMILIAR",
  uncommon: "UNCOMMON",
  rare: "RARE",
  obscure: "OBSCURE",
  niche: "NICHE",
};

const TIER_ORDER: Tier[] = ["common", "familiar", "uncommon", "rare", "obscure", "niche"];

// Rare-and-above discoveries get extra visual weight in the cabinet.
const PROMINENT_TIERS: Set<Tier> = new Set(["rare", "obscure", "niche"]);

type SortMode = "rarity" | "recent";

export default function CollectionScreen() {
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

  const sorted = [...entries].sort((a, b) =>
    sortMode === "rarity"
      ? b.rarity_score - a.rarity_score
      : new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
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

  const handleClear = () => {
    Alert.alert(
      "Clear collection?",
      "This removes every saved find. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearCollection();
            setEntries([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WORD CABINET</Text>
        <Text style={styles.subtitle}>
          {entries.length} {entries.length === 1 ? "DISCOVERY" : "DISCOVERIES"}
        </Text>
      </View>

      {entries.length > 0 && (
        <View style={styles.tierSummary}>
          {TIER_ORDER.map((tier) => (
            <View key={tier} style={styles.tierSummaryRow}>
              <Text style={[styles.tierSummaryLabel, { color: TIER_COLORS[tier] }]}>
                {TIER_LABELS[tier]}
              </Text>
              <Text style={styles.tierSummaryCount}>{tierCounts[tier]}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === "rarity" && styles.sortButtonActive]}
          onPress={() => setSortMode("rarity")}
        >
          <Text
            style={[styles.sortButtonText, sortMode === "rarity" && styles.sortButtonTextActive]}
          >
            Rarest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === "recent" && styles.sortButtonActive]}
          onPress={() => setSortMode("recent")}
        >
          <Text
            style={[styles.sortButtonText, sortMode === "recent" && styles.sortButtonTextActive]}
          >
            Most recent
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={sorted}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => {
          const prominent = PROMINENT_TIERS.has(item.tier);
          return (
            <View
              style={[
                styles.card,
                prominent && styles.cardProminent,
                prominent && { borderColor: TIER_COLORS[item.tier] },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.word}>{item.word.toUpperCase()}</Text>
                <View style={[styles.tierBadge, { borderColor: TIER_COLORS[item.tier] }]}>
                  <Text style={[styles.tierText, { color: TIER_COLORS[item.tier] }]}>
                    {TIER_LABELS[item.tier]}
                  </Text>
                </View>
              </View>
              <Text style={[styles.score, prominent && { color: TIER_COLORS[item.tier] }]}>
                {item.rarity_score}
              </Text>
              {item.definition && (
                <Text style={styles.definition}>{item.definition}</Text>
              )}
              <Text style={styles.meta}>Found between {item.pairContext}</Text>
              <Text style={styles.date}>
                First discovered{" "}
                {new Date(item.foundAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          loaded ? (
            <Text style={styles.emptyText}>
              No rare finds yet — play Explore and anything rare or better gets saved here.
            </Text>
          ) : null
        }
        contentContainerStyle={sorted.length === 0 ? styles.emptyContainer : undefined}
      />

      {entries.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear collection</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  title: { color: "#fff", fontSize: 26, fontFamily: "DMSerifDisplay_400Regular", letterSpacing: 0.5 },
  subtitle: { color: "#888", fontSize: 13, marginTop: 4, letterSpacing: 0.5 },
  tierSummary: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#202020",
  },
  tierSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  tierSummaryLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  tierSummaryCount: { color: "#ccc", fontSize: 12, fontWeight: "600" },
  sortRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 12, marginBottom: 8, gap: 8 },
  sortButton: {
    backgroundColor: "#262626",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortButtonActive: { backgroundColor: "#d4a13d" },
  sortButtonText: { color: "#aaa", fontSize: 13, fontWeight: "600" },
  sortButtonTextActive: { color: "#1a1a1a" },
  list: { flex: 1, paddingHorizontal: 20 },
  card: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardProminent: { backgroundColor: "#241f16", borderWidth: 1.5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  word: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },
  tierBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tierText: { fontSize: 11, fontWeight: "700" },
  score: { color: "#ccc", fontSize: 24, fontFamily: "DMSerifDisplay_400Regular", marginTop: 6 },
  meta: { color: "#999", fontSize: 13, marginTop: 6 },
  definition: { color: "#bbb", fontSize: 13, marginTop: 6, lineHeight: 18, fontStyle: "italic" },
  date: { color: "#666", fontSize: 12, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: { color: "#555", textAlign: "center", paddingHorizontal: 40, lineHeight: 20 },
  clearButton: { margin: 20, alignItems: "center", paddingVertical: 10 },
  clearButtonText: { color: "#664", fontSize: 13 },
});
