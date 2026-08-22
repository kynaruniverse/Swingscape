import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Difficulty } from "../logic/pairGenerator";
import { useDifficulty } from "../state/DifficultyContext";
import { COLORS, FONTS } from "../theme/appTheme";

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "easy", label: "EASY", hint: "Wide bookends, generous rarity ceiling" },
  { value: "medium", label: "MEDIUM", hint: "Balanced range — the default" },
  { value: "hard", label: "HARD", hint: "Narrow bookends, harder to place a find" },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { difficulty, setDifficulty } = useDifficulty();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.sectionLabel}>DIFFICULTY</Text>
      {DIFFICULTIES.map((d) => {
        const active = d.value === difficulty;
        return (
          <TouchableOpacity
            key={d.value}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setDifficulty(d.value)}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {d.label}
              </Text>
              <Text style={styles.optionHint}>{d.hint}</Text>
            </View>
            {active && <Ionicons name="checkmark" size={18} color={COLORS.waxSeal} />}
          </TouchableOpacity>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>NICHE · v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.paperPanel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  title: { color: COLORS.ink, fontFamily: FONTS.monoBold, fontSize: 14, letterSpacing: 2 },
  sectionLabel: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.paperPanel,
  },
  optionActive: { borderColor: COLORS.waxSeal, backgroundColor: COLORS.paperPanelHighlight },
  optionText: { flex: 1 },
  optionLabel: { color: COLORS.ink, fontFamily: FONTS.monoBold, fontSize: 13, letterSpacing: 1 },
  optionLabelActive: { color: COLORS.waxSeal },
  optionHint: { color: COLORS.inkMuted, fontSize: 12, marginTop: 3 },
  footer: { marginTop: "auto", alignItems: "center", paddingVertical: 24 },
  footerText: { color: COLORS.inkFaint, fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1 },
});
