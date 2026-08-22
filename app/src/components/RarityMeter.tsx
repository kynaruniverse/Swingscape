import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tier } from "../logic/wordStore";
import { TIER_COLORS, TIER_SHADOW_COLORS, TIER_LABELS, TIER_ORDER } from "../theme/tiers";
import { COLORS, FONTS, DEPTH } from "../theme/appTheme";

interface Props {
  // Undefined until the player's first find of the round.
  bestTier?: Tier;
  // Omit to hide the progress row entirely (e.g. when the pair has no
  // known ceiling to measure progress against).
  progressPct?: number;
}

// A chunky "level meter": six solid blocks, one per tier. Unearned
// tiers sit flat and pale; earned tiers snap to full tier color with
// their own offset shadow, and the current best block pops up slightly
// taller than the rest — reads as a game rank-up strip, not a chart.
export default function RarityMeter({ bestTier, progressPct }: Props) {
  const bestIndex = bestTier ? TIER_ORDER.indexOf(bestTier) : -1;

  return (
    <View style={styles.rarityMeter}>
      <Text style={styles.chartLabel}>RANK</Text>

      <View style={styles.ladder}>
        {TIER_ORDER.map((tier, i) => {
          const achieved = i <= bestIndex;
          const isBest = tier === bestTier;
          return (
            <View key={tier} style={styles.rankSlot}>
              <View style={styles.blockWrapper}>
                {achieved && (
                  <View
                    style={[
                      styles.blockShadow,
                      { backgroundColor: TIER_SHADOW_COLORS[tier], top: isBest ? 5 : 3 },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.block,
                    isBest && styles.blockBest,
                    achieved
                      ? { backgroundColor: TIER_COLORS[tier], borderColor: COLORS.outline }
                      : { backgroundColor: COLORS.surfaceAlt, borderColor: COLORS.inkFaint },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.rankLabel,
                  achieved && { color: COLORS.ink },
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
  rarityMeter: { paddingHorizontal: 20, marginBottom: 18 },
  chartLabel: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  ladder: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  rankSlot: { alignItems: "center", flex: 1, paddingHorizontal: 2 },
  blockWrapper: { width: "100%", height: 22, position: "relative", marginBottom: 6 },
  blockShadow: { position: "absolute", left: 0, right: 0, bottom: 0, height: 14, borderRadius: 5 },
  block: {
    height: 14,
    borderRadius: 5,
    borderWidth: 2,
  },
  blockBest: { height: 18, borderRadius: 6 },
  rankLabel: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 8,
    letterSpacing: 0.3,
  },
  rankLabelBest: { fontFamily: FONTS.monoBold, fontSize: 8.5 },
  progressRow: { alignItems: "center" },
  progressTrack: {
    width: "100%",
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surfaceAlt,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.primary },
  progressLabel: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
