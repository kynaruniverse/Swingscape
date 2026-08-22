import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadCollection } from "../logic/collectionStore";
import { getStreak } from "../logic/dailyStore";
import { getCatalogTotal } from "../logic/catalogStore";
import GameButton from "../components/GameButton";
import { COLORS, FONTS } from "../theme/appTheme";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [discoveryCount, setDiscoveryCount] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [catalogTotal, setCatalogTotal] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      loadCollection().then((c) => {
        if (!cancelled) setDiscoveryCount(c.length);
      });
      getStreak().then((s) => {
        if (!cancelled) setStreakCount(s.current);
      });
      getCatalogTotal().then((n) => {
        if (!cancelled) setCatalogTotal(n);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="settings-outline" size={22} color={COLORS.inkMuted} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.wordmark}>NICHE</Text>
        <Text style={styles.tagline}>a field guide to rare words</Text>
        {!!catalogTotal && (
          <Text style={styles.catalogText}>SPECIMEN NO. {catalogTotal} CATALOGUED</Text>
        )}

        <GameButton
          label="PLAY"
          onPress={() => navigation.navigate("Game", { screen: "Explore" })}
          style={styles.playButton}
        />

        <GameButton
          label={streakCount > 0 ? `DAILY DUEL · ${streakCount} DAY STREAK` : "DAILY DUEL"}
          onPress={() => navigation.navigate("Game", { screen: "Daily" })}
          color={COLORS.secondary}
          shadowColor={COLORS.secondaryShadow}
          small
          style={styles.secondaryButton}
        />

        <GameButton
          label={
            discoveryCount === null
              ? "WORD CABINET"
              : `WORD CABINET · ${discoveryCount} ${discoveryCount === 1 ? "FIND" : "FINDS"}`
          }
          onPress={() => navigation.navigate("Game", { screen: "Collection" })}
          color={COLORS.surface}
          shadowColor={COLORS.inkFaint}
          textColor={COLORS.ink}
          small
          style={styles.secondaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  settingsButton: { alignSelf: "flex-end", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, width: "100%" },
  wordmark: {
    color: COLORS.ink,
    fontSize: 48,
    fontFamily: FONTS.display,
    letterSpacing: 0.5,
  },
  tagline: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  catalogText: {
    color: COLORS.primaryShadow,
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 28,
  },
  playButton: { width: "100%", marginBottom: 18 },
  secondaryButton: { width: "100%", marginBottom: 14 },
});
