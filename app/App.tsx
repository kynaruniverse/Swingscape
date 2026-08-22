import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { WordStore, WordEntry } from "./src/logic/wordStore";
import HomeScreen from "./src/screens/HomeScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import DailyScreen from "./src/screens/DailyScreen";
import CollectionScreen from "./src/screens/CollectionScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { DifficultyProvider, useDifficulty } from "./src/state/DifficultyContext";
import { COLORS, FONTS, NAV_THEME } from "./src/theme/appTheme";

// Bundled at build time by the Metro bundler — no network fetch needed,
// this is what makes true offline/unlimited play possible.
import wordData from "./src/data/niche_wordlist.json";

// Keep the native splash (see app.json) up until fonts + the word store
// are ready, instead of letting it drop to a blank white frame.
SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GameTabs({ store }: { store: WordStore }) {
  const { difficulty } = useDifficulty();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.paperPanel, borderTopColor: COLORS.hairline },
        tabBarActiveTintColor: COLORS.waxSeal,
        tabBarInactiveTintColor: COLORS.inkFaint,
      }}
    >
      <Tab.Screen
        name="Explore"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <ExploreScreen store={store} difficulty={difficulty} />}
      </Tab.Screen>
      <Tab.Screen
        name="Daily"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <DailyScreen store={store} />}
      </Tab.Screen>
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [store, setStore] = useState<WordStore | null>(null);
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    // Constructing the WordStore builds a Map of ~78k entries — cheap
    // (<100ms) but done once here rather than on every screen mount.
    setStore(new WordStore(wordData as WordEntry[]));
  }, []);

  const ready = !!store && fontsLoaded;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    // Matches app.json's native splash background exactly so there's
    // no visible handoff flash between native splash and this screen.
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingWordmark}>NICHE</Text>
        <ActivityIndicator color={COLORS.waxSeal} size="small" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <DifficultyProvider>
        <NavigationContainer theme={NAV_THEME}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game">{() => <GameTabs store={store!} />}</Stack.Screen>
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ presentation: "modal" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </DifficultyProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.paper,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingWordmark: {
    color: COLORS.ink,
    fontSize: 32,
    fontFamily: FONTS.display,
    letterSpacing: 1,
  },
});
