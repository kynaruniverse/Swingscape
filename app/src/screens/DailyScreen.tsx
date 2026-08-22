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
  ActivityIndicator,
} from "react-native";
import { WordStore } from "../logic/wordStore";
import { TIER_COLORS, TIER_LABELS } from "../theme/tiers";
import { COLORS } from "../theme/appTheme";
import TopBar from "../components/TopBar";
import AnimatedResultCard from "../components/AnimatedResultCard";
import FeedbackCard from "../components/FeedbackCard";
import RarityMeter from "../components/RarityMeter";
import FieldNotesCard from "../components/FieldNotesCard";
import SpecimenCard from "../components/SpecimenCard";
import { shareSpecimenCard } from "../logic/shareSpecimen";
import { useDailyRound } from "../hooks/useDailyRound";
import PaperTexture from "../components/PaperTexture";
import styles from "./DailyScreen.styles";

interface Props {
  store: WordStore;
}

function StreakRow({ current }: { current: number }) {
  if (current <= 0) return null;
  return (
    <View style={styles.streakRow}>
      <Text style={styles.streakValue}>{current}</Text>
      <Text style={styles.streakLabel}>DAY STREAK</Text>
    </View>
  );
}

export default function DailyScreen({ store }: Props) {
  const specimenRef = useRef<View>(null);
  const {
    loading,
    alreadyPlayed,
    todayResult,
    streak,
    state,
    input,
    setInput,
    feedback,
    collectionToast,
    resultKey,
    handleSubmit,
    handleHint,
    hint,
    hintAvailable,
    best,
    roundOver,
    finds,
    progressPct,
  } = useDailyRound(store);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="DAILY" />
        <View style={styles.centerFill}>
          <ActivityIndicator color={COLORS.waxSeal} />
        </View>
      </SafeAreaView>
    );
  }

  // Already completed today's Daily (either just now, or on a return
  // visit) — show the result + streak instead of a fresh round.
  if (alreadyPlayed || roundOver) {
    const result = todayResult;
    return (
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="DAILY" />
        <View style={[styles.centerFill, { paddingHorizontal: 24 }]}>
          <Text style={styles.resultHeading}>TODAY'S DUEL COMPLETE</Text>
          <Text style={styles.resultSub}>Come back tomorrow for a new pair</Text>

          {result?.best ? (
            <>
              <Text style={styles.resultBestLabel}>BEST FIND</Text>
              <Text style={styles.resultBestWord}>{result.best.word.toUpperCase()}</Text>
              <Text style={[styles.resultBestScore, { color: TIER_COLORS[result.best.tier] }]}>
                {result.best.rarity_score}
              </Text>
              <Text style={styles.resultBestTier}>{TIER_LABELS[result.best.tier]}</Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareSpecimenCard(specimenRef)}
              >
                <Text style={styles.shareButtonText}>SHARE FIND</Text>
              </TouchableOpacity>
              <View style={styles.offscreenCapture} pointerEvents="none">
                <SpecimenCard ref={specimenRef} entry={result.best} />
              </View>
            </>
          ) : (
            <Text style={styles.resultBestTier}>No finds today</Text>
          )}

          <View style={styles.streakBadgeRow}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeValue}>{streak.current}</Text>
              <Text style={styles.streakBadgeLabel}>CURRENT STREAK</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeValue}>{streak.longest}</Text>
              <Text style={styles.streakBadgeLabel}>BEST STREAK</Text>
            </View>
          </View>

          <Text style={styles.comeBackText}>A new pair unlocks at midnight</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="DAILY" />
        <View style={styles.centerFill}>
          <Text style={styles.resultBestTier}>Couldn't load today's pair. Try again shortly.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <PaperTexture />
        <TopBar eyebrow="DAILY" />
        <StreakRow current={streak.current} />

        <View style={styles.pairContainer}>
          <Text style={styles.bookend}>{state.pair.wordA.toUpperCase()}</Text>
          <Text style={styles.arrow}>—</Text>
          <Text style={styles.bookend}>{state.pair.wordB.toUpperCase()}</Text>
        </View>
        <Text style={styles.attemptsLeft}>
          {state.maxAttempts - state.attemptsUsed} GUESSES LEFT · ONE ROUND A DAY
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
