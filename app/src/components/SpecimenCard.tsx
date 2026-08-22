import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WordEntry } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS } from "../theme/tiers";
import { COLORS, FONTS } from "../theme/appTheme";

interface Props {
  entry: WordEntry;
  catalogNumber?: number;
  pairContext?: string;
}

// Rendered off-screen and captured via react-native-view-shot — this
// is the actual image that gets shared, so it's laid out as a
// standalone square card, not a fragment of the app's own screen chrome.
const SpecimenCard = forwardRef<View, Props>(({ entry, catalogNumber, pairContext }, ref) => {
  const tierColor = TIER_COLORS[entry.tier];

  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      <Text style={styles.brand}>NICHE</Text>
      <Text style={styles.brandTagline}>A FIELD GUIDE TO RARE WORDS</Text>

      <View style={[styles.frame, { borderColor: tierColor }]}>
        <View style={[styles.cornerTag, { borderColor: tierColor }]}>
          <Text style={[styles.cornerTagText, { color: tierColor }]}>
            No. {catalogNumber ?? entry.rarity_score}
          </Text>
        </View>

        <Text style={styles.word}>{entry.word.toUpperCase()}</Text>
        <Text style={[styles.score, { color: tierColor }]}>{entry.rarity_score}</Text>
        <Text style={[styles.tier, { color: tierColor }]}>{TIER_LABELS[entry.tier]}</Text>

        {entry.definition && <Text style={styles.definition}>{entry.definition}</Text>}
        {pairContext && <Text style={styles.pairContext}>found between {pairContext}</Text>}
      </View>
    </View>
  );
});

export default SpecimenCard;

const CARD_SIZE = 340;

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    padding: 24,
    backgroundColor: COLORS.paper,
    alignItems: "center",
  },
  brand: {
    color: COLORS.ink,
    fontFamily: FONTS.monoBold,
    fontSize: 15,
    letterSpacing: 4,
  },
  brandTagline: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 20,
  },
  frame: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: COLORS.paperPanel,
    position: "relative",
  },
  cornerTag: {
    position: "absolute",
    top: -1,
    right: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.paper,
  },
  cornerTagText: { fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 0.5 },
  word: { color: COLORS.ink, fontSize: 30, fontFamily: FONTS.display, letterSpacing: 0.5 },
  score: { fontSize: 40, fontFamily: FONTS.monoBold, marginTop: 8 },
  tier: { fontFamily: FONTS.mono, fontSize: 13, letterSpacing: 2, marginTop: 4 },
  definition: {
    color: COLORS.inkMuted,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  pairContext: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 12,
  },
});
