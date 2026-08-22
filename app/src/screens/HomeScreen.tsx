import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadCollection } from "../logic/collectionStore";
import { COLORS, FONTS } from "../theme/appTheme";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [discoveryCount, setDiscoveryCount] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      loadCollection().then((c) => {
        if (!cancelled) setDiscoveryCount(c.length);
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
        <Ionicons name="settings-outline" size={20} color={COLORS.inkMuted} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.wordmark}>NICHE</Text>
        <Text style={styles.tagline}>a field guide to rare words</Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation.navigate("Game", { screen: "Explore" })}
        >
          <Text style={styles.playButtonText}>PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cabinetLink}
          onPress={() => navigation.navigate("Game", { screen: "Collection" })}
        >
          <Text style={styles.cabinetLinkText}>
            {discoveryCount === null
              ? "WORD CABINET"
              : `WORD CABINET · ${discoveryCount} ${discoveryCount === 1 ? "FIND" : "FINDS"}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  settingsButton: { alignSelf: "flex-end", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  wordmark: {
    color: COLORS.ink,
    fontSize: 44,
    fontFamily: FONTS.display,
    letterSpacing: 1,
  },
  tagline: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 44,
  },
  playButton: {
    backgroundColor: COLORS.waxSeal,
    borderRadius: 4,
    paddingHorizontal: 56,
    paddingVertical: 16,
  },
  playButtonText: {
    color: COLORS.paper,
    fontFamily: FONTS.monoBold,
    fontSize: 16,
    letterSpacing: 2,
  },
  cabinetLink: { marginTop: 24, paddingVertical: 10 },
  cabinetLinkText: {
    color: COLORS.inkMuted,
    fontFamily: FONTS.mono,
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
