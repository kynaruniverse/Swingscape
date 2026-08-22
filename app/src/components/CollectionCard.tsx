import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CollectionEntry } from "../logic/collectionStore";
import { TIER_COLORS, TIER_SHADOW_COLORS, TIER_LABELS, PROMINENT_TIERS } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";
import GameCard from "./GameCard";

interface Props {
  entry: CollectionEntry;
}

export default function CollectionCard({ entry }: Props) {
  const prominent = PROMINENT_TIERS.has(entry.tier);
  const tierColor = TIER_COLORS[entry.tier];

  return (
    <GameCard
      borderColor={tierColor}
      shadowColor={TIER_SHADOW_COLORS[entry.tier]}
      style={styles.cardInner}
    >
      <View style={[styles.cornerTag, { backgroundColor: tierColor }]}>
        <Text style={styles.cornerTagText}>No. {entry.rarity_score}</Text>
      </View>
      <View style={styles.cardHeader}>
        <Text style={styles.word}>{entry.word.toUpperCase()}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierText}>{TIER_LABELS[entry.tier]}</Text>
        </View>
      </View>
      <Text style={[styles.score, { color: tierColor }]}>{entry.rarity_score}</Text>
      {entry.definition && <Text style={styles.definition}>{entry.definition}</Text>}
      <Text style={styles.meta}>Found between {entry.pairContext}</Text>
      <Text style={styles.date}>
        First discovered{" "}
        {new Date(entry.foundAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  cardInner: { padding: 16, marginTop: 12, position: "relative" },
  cornerTag: {
    position: "absolute",
    top: -3,
    right: 14,
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cornerTagText: { fontFamily: FONTS.monoBold, fontSize: 10, letterSpacing: 0.5, color: COLORS.cream },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  word: { color: COLORS.ink, fontSize: 19, fontFamily: FONTS.display, letterSpacing: 0.3, flexShrink: 1 },
  tierBadge: { borderWidth: 2, borderColor: COLORS.outline, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  tierText: { fontFamily: FONTS.monoBold, fontSize: 10, letterSpacing: 0.5, color: COLORS.cream },
  score: { fontSize: 26, fontFamily: FONTS.monoBold, marginTop: 8 },
  meta: { color: COLORS.inkMuted, fontSize: 13, marginTop: 6 },
  definition: {
    color: COLORS.inkMuted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontStyle: "italic",
  },
  date: { color: COLORS.inkFaint, fontSize: 12, marginTop: 4 },
});
