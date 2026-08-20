import React, { useState, useCallback } from "react";
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
        <Text style={styles.title}>Collection</Text>
        <Text style={styles.subtitle}>
          {entries.length} rare {entries.length === 1 ? "find" : "finds"}
        </Text>
      </View>

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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.word}>{item.word}</Text>
              <View style={[styles.tierBadge, { borderColor: TIER_COLORS[item.tier] }]}>
                <Text style={[styles.tierText, { color: TIER_COLORS[item.tier] }]}>
                  {item.tier}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              Score {item.rarity_score} · found between {item.pairContext}
            </Text>
            {item.definition && (
              <Text style={styles.definition}>{item.definition}</Text>
            )}
            <Text style={styles.date}>
              {new Date(item.foundAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
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
  title: { color: "#fff", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#888", fontSize: 14, marginTop: 4 },
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
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  word: { color: "#fff", fontSize: 17, fontWeight: "700" },
  tierBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tierText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  meta: { color: "#999", fontSize: 13, marginTop: 6 },
  definition: { color: "#bbb", fontSize: 13, marginTop: 6, lineHeight: 18, fontStyle: "italic" },
  date: { color: "#666", fontSize: 12, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: { color: "#555", textAlign: "center", paddingHorizontal: 40, lineHeight: 20 },
  clearButton: { margin: 20, alignItems: "center", paddingVertical: 10 },
  clearButtonText: { color: "#664", fontSize: 13 },
});
