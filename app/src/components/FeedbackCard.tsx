import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WordEntry } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS, FIND_MESSAGES } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";

export type FeedbackState =
  | { kind: "invalid" }
  | { kind: "out_of_range" }
  | { kind: "already_found" }
  | { kind: "success"; entry: WordEntry; isNewBest: boolean };

interface Props {
  feedback: FeedbackState;
  pairHint?: { wordA: string; wordB: string };
}

export default function FeedbackCard({ feedback, pairHint }: Props) {
  switch (feedback.kind) {
    case "invalid":
      return (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabelMuted}>NOT A KNOWN WORD</Text>
        </View>
      );
    case "out_of_range":
      return (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabelMuted}>NOT IN RANGE</Text>
          {pairHint && (
            <Text style={styles.resultHint}>
              Try something between {pairHint.wordA} and {pairHint.wordB}.
            </Text>
          )}
        </View>
      );
    case "already_found":
      return (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabelMuted}>ALREADY FOUND</Text>
        </View>
      );
    case "success": {
      const { entry, isNewBest } = feedback;
      const label = isNewBest ? "NEW BEST" : FIND_MESSAGES[entry.tier];
      return (
        <View
          style={[
            styles.resultCard,
            isNewBest && styles.resultCardBest,
            { borderColor: TIER_COLORS[entry.tier] },
          ]}
        >
          {/* Specimen-label corner tag — the signature element */}
          <View style={[styles.cornerTag, { borderColor: TIER_COLORS[entry.tier] }]}>
            <Text style={[styles.cornerTagText, { color: TIER_COLORS[entry.tier] }]}>
              No. {entry.rarity_score}
            </Text>
          </View>
          <Text style={[styles.resultLabel, { color: TIER_COLORS[entry.tier] }]}>{label}</Text>
          <Text style={styles.resultWord}>{entry.word.toUpperCase()}</Text>
          <Text style={[styles.resultScore, { color: TIER_COLORS[entry.tier] }]}>
            {entry.rarity_score}
          </Text>
          <Text style={styles.resultTier}>{TIER_LABELS[entry.tier]}</Text>
          {entry.definition && <Text style={styles.resultDefinition}>{entry.definition}</Text>}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    position: "relative",
  },
  resultCardBest: { borderWidth: 4 },
  cornerTag: {
    position: "absolute",
    top: -3,
    right: 14,
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.bg,
  },
  cornerTagText: { fontFamily: FONTS.monoBold, fontSize: 10, letterSpacing: 0.5 },
  resultLabelMuted: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  resultHint: { color: COLORS.inkFaint, fontSize: 13, marginTop: 4, textAlign: "center" },
  resultLabel: { fontFamily: FONTS.monoBold, fontSize: 12, letterSpacing: 1 },
  resultWord: {
    color: COLORS.ink,
    fontSize: 22,
    fontFamily: FONTS.display,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  resultScore: { fontSize: 28, fontFamily: FONTS.monoBold, marginTop: 4 },
  resultTier: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },
  resultDefinition: {
    color: COLORS.inkMuted,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
});
