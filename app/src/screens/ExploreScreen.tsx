import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { WordStore, Tier } from "../logic/wordStore";
import { generatePair, Difficulty } from "../logic/pairGenerator";
import {
  RoundState,
  createRoundState,
  submitGuess,
  allFinds,
  bestFind,
} from "../logic/roundState";
import { maybeAddToCollection } from "../logic/collectionStore";

const TIER_COLORS: Record<Tier, string> = {
  common: "#8a8a8a",
  familiar: "#7a9a7a",
  uncommon: "#5a9ab0",
  rare: "#7a6ab0",
  obscure: "#b0698a",
  niche: "#d4a13d",
};

interface Props {
  store: WordStore;
  difficulty?: Difficulty;
}

export default function ExploreScreen({ store, difficulty = "medium" }: Props) {
  const [state, setState] = useState<RoundState | null>(() => newState(store, difficulty));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function newState(s: WordStore, diff: Difficulty): RoundState | null {
    const pair = generatePair(s, diff);
    return pair ? createRoundState(pair) : null;
  }

  const handleNewPair = useCallback(() => {
    setState(newState(store, difficulty));
    setInput("");
    setFeedback(null);
  }, [store, difficulty]);

  const handleSubmit = useCallback(() => {
    if (!state || !input.trim()) return;

    const { result, nextState } = submitGuess(state, store, input);

    switch (result.status) {
      case "invalid_word":
        setFeedback("Not a word we know");
        break;
      case "out_of_range":
        setFeedback(`Not between ${state.pair.wordA} and ${state.pair.wordB}`);
        break;
      case "already_found":
        setFeedback("Already found that one");
        break;
      case "success": {
        const defPart = result.entry.definition ? ` — "${result.entry.definition}"` : "";
        setFeedback(
          result.isNewBest
            ? `New best! "${result.entry.word}" — ${result.entry.tier} (${result.entry.rarity_score})${defPart}`
            : `Found "${result.entry.word}" — ${result.entry.tier} (${result.entry.rarity_score})${defPart}`
        );
        setState(nextState);

        const pairContext = `${state.pair.wordA} – ${state.pair.wordB}`;
        maybeAddToCollection(result.entry, pairContext).then(({ wasAdded }) => {
          if (wasAdded) {
            setFeedback(
              `Added to collection: "${result.entry.word}" — ${result.entry.tier}`
            );
          }
        });
        break;
      }
    }
    setInput("");
  }, [state, input, store]);

  if (!state) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Couldn't generate a pair. Try again.</Text>
        <TouchableOpacity style={styles.button} onPress={handleNewPair}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const best = bestFind(state);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.pairContainer}>
          <Text style={styles.bookend}>{state.pair.wordA.toUpperCase()}</Text>
          <Text style={styles.arrow}>—</Text>
          <Text style={styles.bookend}>{state.pair.wordB.toUpperCase()}</Text>
        </View>

        {best && (
          <View style={[styles.bestBadge, { borderColor: TIER_COLORS[best.tier] }]}>
            <Text style={[styles.bestBadgeText, { color: TIER_COLORS[best.tier] }]}>
              Best: {best.word} · {best.tier} · {best.rarity_score}
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            placeholder="Type a word..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Go</Text>
          </TouchableOpacity>
        </View>

        {feedback && <Text style={styles.feedback}>{feedback}</Text>}

        <FlatList
          style={styles.findsList}
          data={allFinds(state)}
          keyExtractor={(item) => item.word}
          renderItem={({ item }) => (
            <View style={styles.findRow}>
              <Text style={styles.findWord}>{item.word}</Text>
              <Text style={[styles.findTier, { color: TIER_COLORS[item.tier] }]}>
                {item.tier} · {item.rarity_score}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No finds yet — give it a go</Text>}
        />

        <TouchableOpacity style={styles.newPairButton} onPress={handleNewPair}>
          <Text style={styles.newPairButtonText}>New Pair</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  pairContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
  },
  bookend: { color: "#fff", fontSize: 22, fontWeight: "700", letterSpacing: 1 },
  arrow: { color: "#555", fontSize: 20, marginHorizontal: 12 },
  bestBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  bestBadgeText: { fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: "#262626",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#d4a13d",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    marginLeft: 8,
  },
  submitButtonText: { color: "#1a1a1a", fontWeight: "700", fontSize: 16 },
  feedback: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  findsList: { flex: 1, paddingHorizontal: 20 },
  findRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  findWord: { color: "#eee", fontSize: 15 },
  findTier: { fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#555", textAlign: "center", marginTop: 40 },
  newPairButton: {
    margin: 20,
    backgroundColor: "#262626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  newPairButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  errorText: { color: "#fff", textAlign: "center", marginTop: 100, marginBottom: 20 },
  button: {
    alignSelf: "center",
    backgroundColor: "#d4a13d",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: { color: "#1a1a1a", fontWeight: "700" },
});
