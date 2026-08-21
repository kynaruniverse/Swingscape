import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tier } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS, TIER_ORDER } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";

interface Props {
  counts: Record<Tier, number>;
}

export default function TierSummary({ counts }: Props) {
  return (
    <View style={styles.tierSummary}>
      {TIER_ORDER.map((tier) => (
        <View key={tier} style={styles.tierSummaryRow}>
          <Text style={[styles.tierSummaryLabel, { color: TIER_COLORS[tier] }]}>
            {TIER_LABELS[tier]}
          </Text>
          <Text style={styles.tierSummaryCount}>{counts[tier]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tierSummary: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 4,
    backgroundColor: COLORS.vellumPanel,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  tierSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  tierSummaryLabel: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 0.5 },
  tierSummaryCount: { color: COLORS.parchmentMuted, fontFamily: FONTS.monoBold, fontSize: 12 },
});
