import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tier } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS, TIER_ORDER } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";
import GameCard from "./GameCard";

interface Props {
  counts: Record<Tier, number>;
}

export default function TierSummary({ counts }: Props) {
  return (
    <GameCard style={styles.tierSummaryInner}>
      {TIER_ORDER.map((tier) => (
        <View key={tier} style={styles.tierSummaryRow}>
          <View style={[styles.dot, { backgroundColor: TIER_COLORS[tier] }]} />
          <Text style={styles.tierSummaryLabel}>{TIER_LABELS[tier]}</Text>
          <Text style={styles.tierSummaryCount}>{counts[tier]}</Text>
        </View>
      ))}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  tierSummaryInner: { marginHorizontal: 20, marginTop: 14, padding: 14 },
  tierSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  tierSummaryLabel: { color: COLORS.ink, fontFamily: FONTS.monoBold, fontSize: 11, letterSpacing: 0.5, flex: 1 },
  tierSummaryCount: { fontFamily: FONTS.monoBold, fontSize: 12 },
});
