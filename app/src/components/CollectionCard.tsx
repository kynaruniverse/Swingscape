import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CollectionEntry } from "../logic/collectionStore";
import { TIER_COLORS, TIER_LABELS, PROMINENT_TIERS } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";

interface Props {
  entry: CollectionEntry;
}

export default function CollectionCard({ entry }: Props) {
  const prominent = PROMINENT_TIERS.has(entry.tier);

  return (
    <View
      style={[
        styles.card,
        prominent && styles.cardProminent,
        prominent && { borderColor: TIER_COLORS[entry.tier] },
      ]}
    >
      <View style={[styles.cornerTag, { borderColor: TIER_COLORS[entry.tier] }]}>
        <Text style={[styles.cornerTagText, { color: TIER_COLORS[entry.tier] }]}>
          No. {entry.rarity_score}
        </Text>
      </View>
      <View style={styles.cardHeader}>
        <Text style={styles.word}>{entry.word.toUpperCase()}</Text>
        <View style={[styles.tierBadge, { borderColor: TIER_COLORS[entry.tier] }]}>
          <Text style={[styles.tierText, { color: TIER_COLORS[entry.tier] }]}>
            {TIER_LABELS[entry.tier]}
          </Text>
        </View>
      </View>
      <Text style={[styles.score, prominent && { color: TIER_COLORS[entry.tier] }]}>
        {entry.rarity_score}
      </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.vellumPanel,
    borderRadius: 4,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  cardProminent: { backgroundColor: "#241d1a", borderWidth: 1.5 },
  cornerTag: {
    position: "absolute",
    top: -1,
    right: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.ledgerInk,
  },
  cornerTagText: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 0.5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  word: { color: COLORS.parchment, fontSize: 17, fontFamily: FONTS.monoBold, letterSpacing: 0.5 },
  tierBadge: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 10, paddingVertical: 3 },
  tierText: { fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 0.5 },
  score: { color: COLORS.parchmentMuted, fontSize: 22, fontFamily: FONTS.display, marginTop: 6 },
  meta: { color: COLORS.parchmentMuted, fontSize: 13, marginTop: 6 },
  definition: {
    color: COLORS.parchmentMuted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontStyle: "italic",
  },
  date: { color: COLORS.parchmentFaint, fontSize: 12, marginTop: 4 },
});
