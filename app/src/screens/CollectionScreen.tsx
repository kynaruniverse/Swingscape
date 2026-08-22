import React from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from "react-native";
import TopBar from "../components/TopBar";
import TierSummary from "../components/TierSummary";
import CollectionCard from "../components/CollectionCard";
import { useCollection } from "../hooks/useCollection";
import styles from "./CollectionScreen.styles";

export default function CollectionScreen() {
  const { entries, sorted, sortMode, setSortMode, loaded, tierCounts, handleClear } =
    useCollection();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar eyebrow="CABINET" />

      <View style={styles.header}>
        <Text style={styles.title}>WORD CABINET</Text>
        <Text style={styles.subtitle}>
          {entries.length} {entries.length === 1 ? "DISCOVERY" : "DISCOVERIES"}
        </Text>
      </View>

      {entries.length > 0 && <TierSummary counts={tierCounts} />}

      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === "rarity" && styles.sortButtonActive]}
          onPress={() => setSortMode("rarity")}
        >
          <Text style={[styles.sortButtonText, sortMode === "rarity" && styles.sortButtonTextActive]}>
            Rarest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === "recent" && styles.sortButtonActive]}
          onPress={() => setSortMode("recent")}
        >
          <Text style={[styles.sortButtonText, sortMode === "recent" && styles.sortButtonTextActive]}>
            Most recent
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={sorted}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => <CollectionCard entry={item} />}
        ListEmptyComponent={
          loaded ? (
            <Text style={styles.emptyText}>
              No rare finds yet — play Explore and anything rare or better gets saved here.
            </Text>
          ) : null
        }
        ListFooterComponent={
          sorted.length > 0 ? (
            <Text style={styles.footerTip}>
              Rare-and-above discoveries are added automatically — no need to save manually.
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
