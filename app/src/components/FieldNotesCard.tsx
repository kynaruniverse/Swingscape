import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../theme/appTheme";

export default function FieldNotesCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>FIELD NOTES</Text>
      <Text style={styles.body}>
        Type a word that fits alphabetically between the two shown above. The rarer the word,
        the higher it scores — rare finds and better are saved automatically to your cabinet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.paperPanel,
  },
  heading: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  body: { color: COLORS.inkMuted, fontSize: 13, lineHeight: 19 },
});
