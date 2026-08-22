import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { WordStore } from "../logic/wordStore";
import { Difficulty } from "../logic/pairGenerator";
import { useNavigation } from "@react-navigation/native";
import { TIER_COLORS, TIER_LABELS } from "../theme/tiers";
import { COLORS } from "../theme/appTheme";
import TopBar from "../components/TopBar";
import AnimatedResultCard from "../components/AnimatedResultCard";
import FeedbackCard from "../components/FeedbackCard";
import RarityMeter from "../components/RarityMeter";
import FieldNotesCard from "../components/FieldNotesCard";
import SpecimenCard from "../components/SpecimenCard";
import { shareSpecimenCard } from "../logic/shareSpecimen";
import { useExploreRound } from "../hooks/useExploreRound";
import PaperTexture from "../components/PaperTexture";
import styles from "./ExploreScreen.styles";

interface Props {
  store: WordStore;
  difficulty?: Difficulty;
}

export default function ExploreScreen({ store, difficulty = "medium" }: Props) {
  const navigation = useNavigation<any>();
  const specimenRef = useRef<View>(null);
  const {
    state,
    input,
    setInput,
    feedback,
    collectionToast,
    resultKey,
    handleSubmit,
    handleNewPair,
    handleHint,
    hint,
    hintAvailable,
    best,
    roundOver,
    finds,
    progressPct,
    madeCollection,
  } = useExploreRound(store, difficulty);

  if (!state) {
    return (
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="EXPLORE" />
        <Text style={styles.errorText}>Couldn't generate a pair. Try again.</Text>
        <TouchableOpacity style={styles.button} onPress={handleNewPair}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (roundOver) {
    return (
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="EXPLORE" />
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
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareSpecimenCard(specimenRef)}
              >
                <Text style={styles.shareButtonText}>SHARE FIND</Text>
              </TouchableOpacity>

              {/* Rendered off-screen (not display:none — captureRef needs an
                  actually-laid-out view) purely so it can be screenshotted
                  by the Share button above; never visible to the player. */}
              <View style={styles.offscreenCapture} pointerEvents="none">
                <SpecimenCard
                  ref={specimenRef}
                  entry={best}
                  pairContext={`${state.pair.wordA} – ${state.pair.wordB}`}
                />
              </View>
            </>
          ) : (
            <Text style={styles.endBestTier}>No finds this round</Text>
          )}

          <View style={styles.endStatsRow}>
            <View style={styles.endStat}>
              <Text style={styles.endStatValue}>{finds.length}</Text>
              <Text style={styles.endStatLabel}>DISCOVERIES</Text>
            </View>
            {progressPct !== undefined && (
              <View style={styles.endStat}>
                <Text style={styles.endStatValue}>{progressPct}%</Text>
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="EXPLORE" />

        <View style={styles.pairContainer}>
          <Text style={styles.bookend}>{state.pair.wordA.toUpperCase()}</Text>
          <Text style={styles.arrow}>—</Text>
          <Text style={styles.bookend}>{state.pair.wordB.toUpperCase()}</Text>
        </View>
        <Text style={styles.attemptsLeft}>
          {state.maxAttempts - state.attemptsUsed} GUESSES LEFT
        </Text>

        <View style={styles.hintRow}>
          {hint && <Text style={styles.hintText}>{hint}</Text>}
          {hintAvailable && (
            <TouchableOpacity onPress={handleHint} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.hintButtonText}>{hint ? "REVEAL ANOTHER LETTER" : "NEED A HINT? (−1 GUESS)"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {best ? (
          <View style={[styles.bestPanel, { borderColor: TIER_COLORS[best.tier] }]}>
            <Text style={styles.bestPanelLabel}>YOUR BEST</Text>
            <Text style={[styles.bestPanelScore, { color: TIER_COLORS[best.tier] }]}>
              {best.rarity_score} · {TIER_LABELS[best.tier]}
            </Text>
            <Text style={styles.bestPanelWord}>{best.word.toUpperCase()}</Text>
          </View>
        ) : (
          <View style={styles.bestPanelEmpty}>
            <Text style={styles.bestPanelLabel}>YOUR BEST</Text>
            <Text style={styles.bestPanelEmptyText}>AWAITING DISCOVERY</Text>
          </View>
        )}

        <RarityMeter bestTier={best?.tier} progressPct={progressPct} />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            placeholder="Type a word..."
            placeholderTextColor={COLORS.inkFaint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Go</Text>
          </TouchableOpacity>
        </View>

        {feedback && (
          <AnimatedResultCard
            key={resultKey}
            tier={feedback.kind === "success" ? feedback.entry.tier : undefined}
            isNewBest={feedback.kind === "success" && feedback.isNewBest}
          >
            <FeedbackCard
              feedback={feedback}
              pairHint={{ wordA: state.pair.wordA, wordB: state.pair.wordB }}
            />
          </AnimatedResultCard>
        )}
        {collectionToast && <Text style={styles.collectionToast}>{collectionToast}</Text>}

        {finds.length === 0 ? (
          <FieldNotesCard />
        ) : (
          <FlatList
            style={styles.findsList}
            data={finds}
            keyExtractor={(item) => item.word}
            renderItem={({ item }) => (
              <View style={styles.findRow}>
                <Text style={styles.findWord}>{item.word}</Text>
                <Text style={[styles.findTier, { color: TIER_COLORS[item.tier] }]}>
                  {item.tier} · {item.rarity_score}
                </Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.newPairButton} onPress={handleNewPair}>
          <Text style={styles.newPairButtonText}>New Pair</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
