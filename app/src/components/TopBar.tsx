import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../theme/appTheme";

interface Props {
  // Small eyebrow label under the wordmark for the current section,
  // e.g. "FIELD NOTES" on Explore, "CABINET" on Collection. Omit on Home.
  eyebrow?: string;
}

export default function TopBar({ eyebrow }: Props) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.bar}>
      <View>
        <Text style={styles.wordmark}>NICHE</Text>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="settings-outline" size={20} color={COLORS.inkMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.outline,
  },
  wordmark: {
    color: COLORS.ink,
    fontFamily: FONTS.display,
    fontSize: 18,
    letterSpacing: 1,
  },
  eyebrow: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  settingsButton: { padding: 4 },
});
