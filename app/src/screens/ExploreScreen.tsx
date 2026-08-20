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
import { WordStore, Tier, WordEntry } from "../logic/wordStore";
import { generatePair, Difficulty } from "../logic/pairGenerator";
import {
  RoundState,
  createRoundState,
  submitGuess,
  allFinds,
  bestFind,
  percentOfBest,
  isRoundOver,
} from "../logic/roundState";
import { maybeAddToCollection, COLLECTION_MIN_RARITY } from "../logic/collectionStore";
import { useNavigation } from "@react-navigation/native";
import { maybeAddToCollection } from "../logic/collectionStore";

const TIER_COLORS: Record<Tier, string> = {
  common: "#8a8a8a",
  familiar: "#7a9a7a",
  uncommon: "#5a9ab0",
  rare: "#7a6ab0",
  obscure: "#b0698a",
  niche: "#d4a13d",
};

const TIER_LABELS: Record<Tier, string> = {
  common: "COMMON",
  familiar: "FAMILIAR",
  uncommon: "UNCOMMON",
  rare: "RARE",
  obscure: "OBSCURE",
  niche: "NICHE",
};

// Tier-aware result copy — gets more rewarding as rarity climbs.
const FIND_MESSAGES: Record<Tier, string> = {
  common: "VALID FIND",
  familiar: "NICE FIND",
  uncommon: "GOOD FIND",
  rare: "RARE FIND",
  obscure: "EXCELLENT FIND",
  niche: "INCREDIBLE FIND",
};

// Low-to-high rarity order, for the rarity ladder/meter.
const TIER_ORDER: Tier[] = ["common", "familiar", "uncommon", "rare", "obscure", "niche"];

type FeedbackState =
  | { kind: "invalid" }
  | { kind: "out_of_range" }
  | { kind: "already_found" }
  | { kind: "success"; entry: WordEntry; isNewBest: boolean };

interface Props {
  store: WordStore;
  difficulty?: Difficulty;
}

export default function ExploreScreen({ store, difficulty = "medium" }: Props) {
  const [state, setState] = useState<RoundState | null>(() => newState(store, difficulty));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [collectionToast, setCollectionToast] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  
  function newState(s: WordStore, diff: Difficulty): RoundState | null {
    const pair = generatePair(s, diff);
    return pair ? createRoundState(pair) : null;
  }

  const handleNewPair = useCallback(() => {
    setState(newState(store, difficulty));
    setInput("");
    setFeedback(null);
    setCollectionToast(null);
  }, [store, difficulty]);

  const handleSubmit = useCallback(() => {
    if (!state || !input.trim()) return;

    const { result, nextState } = submitGuess(state, store, input);
    setCollectionToast(null);

    switch (result.status) {
      case "round_over":
        break;
      case "invalid_word":
        setFeedback({ kind: "invalid" });
        break;
      case "out_of_range":
        setFeedback({ kind: "out_of_range" });
        break;
      case "already_found":
        setFeedback({ kind: "already_found" });
        break;
      case "success": {
        setFeedback({ kind: "success", entry: result.entry, isNewBest: result.isNewBest });
        setState(nextState);

        const pairContext = `${state.pair.wordA} – ${state.pair.wordB}`;
        maybeAddToCollection(result.entry, pairContext).then(({ wasAdded }) => {
          if (wasAdded) {
            setCollectionToast(`Added to collection: "${result.entry.word}"`);
          }
        });
        break;
      }
    }
    setInput("");
  }, [state, input, store]);

  function renderFeedback(fb: FeedbackState) {
    switch (fb.kind) {
      case "invalid":
        return (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabelMuted}>NOT A KNOWN WORD</Text>
          </View>
        );
      case "out_of_range":
        return (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabelMuted}>NOT IN RANGE</Text>
            {state && (
              <Text style={styles.resultHint}>
                Try something between {state.pair.wordA} and {state.pair.wordB}.
              </Text>
            )}
          </View>
        );
      case "already_found":
        return (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabelMuted}>ALREADY FOUND</Text>
          </View>
        );
      case "success": {
        const { entry, isNewBest } = fb;
        const label = isNewBest ? "NEW BEST" : FIND_MESSAGES[entry.tier];
        return (
          <View
            style={[
              styles.resultCard,
              isNewBest && styles.resultCardBest,
              { borderColor: TIER_COLORS[entry.tier] },
            ]}
          >
            <Text style={[styles.resultLabel, { color: TIER_COLORS[entry.tier] }]}>
              {label}
            </Text>
            <Text style={styles.resultWord}>{entry.word.toUpperCase()}</Text>
            <Text style={[styles.resultScore, { color: TIER_COLORS[entry.tier] }]}>
              {entry.rarity_score}
            </Text>
            <Text style={styles.resultTier}>{TIER_LABELS[entry.tier]}</Text>
            {entry.definition && (
              <Text style={styles.resultDefinition}>{entry.definition}</Text>
            )}
          </View>
        );
      }
    }
  }

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
  const roundOver = isRoundOver(state);

  if (roundOver) {
    const finds = allFinds(state);
    const potentialPct = state.pair.bestPossible
      ? Math.min(100, Math.round(percentOfBest(state) * 100))
      : 0;
    const madeCollection = !!best && best.rarity_score >= COLLECTION_MIN_RARITY;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endScreen}>
          <Text style={styles.endHeading}>ROUND COMPLETE</Text>

          {best ? (
            <>
              <Text style={styles.endBestLabel}>BEST FIND</Text>
              <Text style={styles.endBestWord}>{best.word.toUpperCase()}</Text>
              <Text style={[styles.endBestScore, { color: TIER_COLORS[best.tier] }]}>
                {best.rarity_score}
              </Text>
              <Text style={styles.endBestTier}>{TIER_LABELS[best.tier]}</Text>
              {madeCollection && (
                <Text style={styles.endCollectionBadge}>NEW COLLECTION ENTRY</Text>
              )}
            </>
          ) : (
            <Text style={styles.endBestTier}>No finds this round</Text>
          )}

          <View style={styles.endStatsRow}>
            <View style={styles.endStat}>
              <Text style={styles.endStatValue}>{finds.length}</Text>
              <Text style={styles.endStatLabel}>DISCOVERIES</Text>
            </View>
            {state.pair.bestPossible && (
              <View style={styles.endStat}>
                <Text style={styles.endStatValue}>{potentialPct}%</Text>
                <Text style={styles.endStatLabel}>OF POTENTIAL</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.newPairButton} onPress={handleNewPair}>
            <Text style={styles.newPairButtonText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.collectionLinkButton}
            onPress={() => navigation.navigate("Collection")}
          >
            <Text style={styles.collectionLinkText}>WORD CABINET</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.attemptsLeft}>
          {state.maxAttempts - state.attemptsUsed} GUESSES LEFT
        </Text>

        {best && (
          <View style={[styles.bestPanel, { borderColor: TIER_COLORS[best.tier] }]}>
            <Text style={styles.bestPanelLabel}>YOUR BEST</Text>
            <Text style={[styles.bestPanelScore, { color: TIER_COLORS[best.tier] }]}>
              {best.rarity_score} · {TIER_LABELS[best.tier]}
            </Text>
            <Text style={styles.bestPanelWord}>{best.word.toUpperCase()}</Text>
          </View>
        )}

        {best && (
          <View style={styles.rarityMeter}>
            <View style={styles.rarityLadder}>
              {TIER_ORDER.map((tier) => (
                <View key={tier} style={styles.rarityLadderItem}>
                  <View
                    style={[
                      styles.rarityLadderDot,
                      { backgroundColor: tier === best.tier ? TIER_COLORS[tier] : "transparent" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.rarityLadderText,
                      tier === best.tier && { color: TIER_COLORS[tier], fontWeight: "800" },
                    ]}
                  >
                    {TIER_LABELS[tier]}
                  </Text>
                </View>
              ))}
            </View>

            {state.pair.bestPossible && (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, Math.round(percentOfBest(state) * 100))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {Math.min(100, Math.round(percentOfBest(state) * 100))}% OF POTENTIAL
                </Text>
              </View>
            )}
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

        {feedback && renderFeedback(feedback)}
        {collectionToast && <Text style={styles.collectionToast}>{collectionToast}</Text>}

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
  attemptsLeft: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 8,
  },  
  bestPanel: {
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  bestPanelLabel: { color: "#888", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  bestPanelScore: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  bestPanelWord: { color: "#ccc", fontSize: 13, marginTop: 2, letterSpacing: 1 },
  rarityMeter: { paddingHorizontal: 20, marginBottom: 16 },
  rarityLadder: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  rarityLadderItem: { alignItems: "center", flex: 1 },
  rarityLadderDot: { width: 5, height: 5, borderRadius: 3, marginBottom: 3 },
  rarityLadderText: { color: "#555", fontSize: 9, fontWeight: "600", letterSpacing: 0.5 },
  progressRow: { alignItems: "center" },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#262626",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#d4a13d", borderRadius: 3 },
  progressLabel: { color: "#777", fontSize: 11, fontWeight: "600", marginTop: 6, letterSpacing: 0.5 },
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
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#202020",
    alignItems: "center",
  },
  resultCardBest: { borderWidth: 2 },
  resultLabelMuted: { color: "#888", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  resultHint: { color: "#777", fontSize: 13, marginTop: 4, textAlign: "center" },
  resultLabel: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  resultWord: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6, letterSpacing: 1 },
  resultScore: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  resultTier: { color: "#999", fontSize: 12, fontWeight: "600", marginTop: 2, letterSpacing: 1 },
  resultDefinition: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  collectionToast: {
    color: "#d4a13d",
    textAlign: "center",
    fontSize: 12,
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
  endScreen: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  endHeading: { color: "#666", fontSize: 13, fontWeight: "700", letterSpacing: 2, marginBottom: 28 },
  endBestLabel: { color: "#888", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  endBestWord: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 8, letterSpacing: 1 },
  endBestScore: { fontSize: 44, fontWeight: "800", marginTop: 10 },
  endBestTier: { color: "#999", fontSize: 14, fontWeight: "600", marginTop: 4, letterSpacing: 1 },
  endCollectionBadge: {
    color: "#d4a13d",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    letterSpacing: 1,
  },
  endStatsRow: { flexDirection: "row", marginTop: 36, gap: 40 },
  endStat: { alignItems: "center" },
  endStatValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  endStatLabel: { color: "#666", fontSize: 10, fontWeight: "600", marginTop: 2, letterSpacing: 0.5 },
  collectionLinkButton: { paddingVertical: 10 },
  collectionLinkText: { color: "#d4a13d", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
});
