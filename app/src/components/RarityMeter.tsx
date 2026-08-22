import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tier } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS, TIER_ORDER } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";

interface Props {
  // Undefined until the player's first find of the round.
  bestTier?: Tier;
  // Omit to hide the progress row entirely (e.g. when the pair has no
  // known ceiling to measure progress against).
  progressPct?: number;
}

// Styled as a field-guide classification key: a ranked scale with tick
// marks, the achieved rank picked out in its tier color and the rest
// left as quiet, unfilled ticks — rather than a flat row of dots.
export default function RarityMeter({ bestTier, progressPct }: Props) {
  const bestIndex = bestTier ? TIER_ORDER.indexOf(bestTier) : -1;

  return (
    <View style={styles.rarityMeter}>
      <View style={styles.chartLabelRow}>
        <Text style={styles.chartLabel}>RANK</Text>
      </View>
      <View style={styles.ladder}>
        {TIER_ORDER.map((tier, i) => {
          const achieved = i <= bestIndex;
          const isBest = tier === bestTier;
          return (
            <View key={tier} style={styles.rank}>
              <View
                style={[
                  styles.tick,
                  achieved && { backgroundColor: TIER_COLORS[tier] },
                  isBest && styles.tickBest,
                ]}
              />
              <Text
                style={[
                  styles.rankLabel,
                  achieved && { color: TIER_COLORS[tier] },
                  isBest && styles.rankLabelBest,
                ]}
                numberOfLines={1}
              >
                {TIER_LABELS[tier]}
              </Text>
            </View>
          );
        })}
      </View>

      {progressPct !== undefined && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progressPct}% OF POTENTIAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rarityMeter: { paddingHorizontal: 20, marginBottom: 16 },
  chartLabelRow: { marginBottom: 6 },
  chartLabel: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 2,
  },
  ladder: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
    paddingBottom: 10,
    marginBottom: 10,
  },
  rank: { alignItems: "center", flex: 1 },
  tick: {
    width: 3,
    height: 14,
    borderRadius: 1,
    backgroundColor: COLORS.hairline,
    marginBottom: 6,
  },
  tickBest: { height: 20, width: 4 },
  rankLabel: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  rankLabelBest: { fontFamily: FONTS.monoBold },
  progressRow: { alignItems: "center" },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.paperPanelRaised,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.waxSeal, borderRadius: 2 },
  progressLabel: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 10,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
