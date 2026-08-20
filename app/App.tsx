import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WordStore, WordEntry } from "./src/logic/wordStore";
import ExploreScreen from "./src/screens/ExploreScreen";
import CollectionScreen from "./src/screens/CollectionScreen";

// Bundled at build time by the Metro bundler — no network fetch needed,
// this is what makes true offline/unlimited play possible.
import wordData from "./src/data/niche_wordlist.json";

const Tab = createBottomTabNavigator();

export default function App() {
  const [store, setStore] = useState<WordStore | null>(null);

  useEffect(() => {
    // Constructing the WordStore builds a Map of ~78k entries — cheap
    // (<100ms) but done once here rather than on every screen mount.
    setStore(new WordStore(wordData as WordEntry[]));
  }, []);

  if (!store) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#d4a13d" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: "#d4a13d",
          background: "#1a1a1a",
          card: "#1a1a1a",
          text: "#fff",
          border: "#2a2a2a",
          notification: "#d4a13d",
        },
      }}
    >
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#1a1a1a", borderTopColor: "#2a2a2a" },
          tabBarActiveTintColor: "#d4a13d",
          tabBarInactiveTintColor: "#666",
        }}
      >
        <Tab.Screen
          name="Explore"
          options={{ tabBarLabel: "Explore" }}
        >
          {() => <ExploreScreen store={store} difficulty="medium" />}
        </Tab.Screen>
        <Tab.Screen
          name="Collection"
          component={CollectionScreen}
          options={{ tabBarLabel: "Collection" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
});
