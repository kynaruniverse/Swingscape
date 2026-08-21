import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { WordStore, WordEntry } from "./src/logic/wordStore";
import ExploreScreen from "./src/screens/ExploreScreen";
import CollectionScreen from "./src/screens/CollectionScreen";
import { COLORS, NAV_THEME } from "./src/theme/appTheme";

// Bundled at build time by the Metro bundler — no network fetch needed,
// this is what makes true offline/unlimited play possible.
import wordData from "./src/data/niche_wordlist.json";

const Tab = createBottomTabNavigator();

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

  if (!store || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#d4a13d" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NAV_THEME}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: COLORS.ledgerInk, borderTopColor: COLORS.hairline },
          tabBarActiveTintColor: COLORS.waxSeal,
          tabBarInactiveTintColor: COLORS.parchmentFaint,
        }}
      >
        <Tab.Screen
          name="Explore"
          options={{
            tabBarLabel: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" size={size} color={color} />
            ),
          }}
        >
          {() => <ExploreScreen store={store} difficulty="medium" />}
        </Tab.Screen>
        <Tab.Screen
          name="Collection"
          component={CollectionScreen}
          options={{
            tabBarLabel: "Collection",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.ledgerInk,
    justifyContent: "center",
    alignItems: "center",
  },
});
