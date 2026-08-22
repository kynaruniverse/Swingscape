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
import { TIER_COLORS, TIER_SHADOW_COLORS, TIER_LABELS } from "../theme/tiers";
import { COLORS } from "../theme/appTheme";
import TopBar from "../components/TopBar";
import AnimatedResultCard from "../components/AnimatedResultCard";
import FeedbackCard from "../components/FeedbackCard";
import RarityMeter from "../components/RarityMeter";
import SpecimenCard from "../components/SpecimenCard";
import GameButton from "../components/GameButton";
import GameCard from "../components/GameCard";
import { shareSpecimenCard } from "../logic/shareSpecimen";
import { useExploreRound } from "../hooks/useExploreRound";
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
        <TopBar eyebrow="EXPLORE" />
        <View style={{ padding: 20 }}>
          <Text style={styles.errorText}>Couldn't generate a pair. Try again.</Text>
          <GameButton label="RETRY" onPress={handleNewPair} />
        </View>
      </SafeAreaView>
    );
  }

  if (roundOver) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar eyebrow="EXPLORE" />
        <View style={styles.endScreen}>
          <Text style={styles.endHeading}>ROUND COMPLETE</Text>

          {best ? (
            <>
              <GameCard
                borderColor={TIER_COLORS[best.tier]}
                shadowColor={TIER_SHADOW_COLORS[best.tier]}
                style={styles.endBestCardInner}
              >
                <Text style={styles.endBestLabel}>BEST FIND</Text>
                <Text style={styles.endBestWord}>{best.word.toUpperCase()}</Text>
                <Text style={[styles.endBestScore, { color: TIER_COLORS[best.tier] }]}>
                  {best.rarity_score}
                </Text>
                <Text style={[styles.endBestTier, { color: TIER_COLORS[best.tier] }]}>
                  {TIER_LABELS[best.tier]}
                </Text>
              </GameCard>

              {madeCollection && (
                <Text style={styles.endCollectionBadge}>★ NEW COLLECTION ENTRY</Text>
              )}

              <GameButton
                label="SHARE FIND"
                onPress={() => shareSpecimenCard(specimenRef)}
                color={COLORS.surface}
                shadowColor={COLORS.inkFaint}
                textColor={COLORS.ink}
                small
                style={{ marginTop: 16 }}
              />

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

          <GameButton label="PLAY AGAIN" onPress={handleNewPair} style={{ marginTop: 24 }} />
          <GameButton
            label="WORD CABINET"
            onPress={() => navigation.navigate("Collection")}
            color={COLORS.secondary}
            shadowColor={COLORS.secondaryShadow}
            small
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <TopBar eyebrow="EXPLORE" />

        <GameCard style={styles.pairCard}>
          <View style={styles.pairRow}>
            <Text style={styles.bookend}>{state.pair.wordA.toUpperCase()}</Text>
            <View style={styles.arrowPill}>
              <Text style={styles.arrow}>→</Text>
            </View>
            <Text style={styles.bookend}>{state.pair.wordB.toUpperCase()}</Text>
          </View>
        </GameCard>

        <View style={styles.attemptsRow}>
          <Text style={styles.attemptsLeft}>{state.maxAttempts - state.attemptsUsed} GUESSES LEFT</Text>
          {hintAvailable && (
            <TouchableOpacity onPress={handleHint} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.hintButtonText}>{hint ? "REVEAL ANOTHER LETTER" : "HINT (−1 GUESS)"}</Text>
            </TouchableOpacity>
          )}
        </View>
        {hint && <Text style={styles.hintText}>{hint}</Text>}

        {best ? (
          <GameCard
            borderColor={TIER_COLORS[best.tier]}
            shadowColor={TIER_SHADOW_COLORS[best.tier]}
            style={styles.bestPanelInner}
          >
            <Text style={styles.bestPanelLabel}>YOUR BEST</Text>
            <Text style={[styles.bestPanelScore, { color: TIER_COLORS[best.tier] }]}>
              {best.rarity_score} · {TIER_LABELS[best.tier]}
            </Text>
            <Text style={styles.bestPanelWord}>{best.word.toUpperCase()}</Text>
          </GameCard>
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
          <GameButton label="GO" onPress={handleSubmit} small style={styles.goButton} />
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
          <Text style={styles.tip}>
            Type a word that fits alphabetically between the pair above — rarer words score higher.
          </Text>
        ) : (
          <FlatList
            style={styles.findsList}
            data={finds}
            keyExtractor={(item) => item.word}
            renderItem={({ item }) => (
              <View style={styles.findRow}>
                <View style={[styles.findDot, { backgroundColor: TIER_COLORS[item.tier] }]} />
                <Text style={styles.findWord}>{item.word}</Text>
                <Text style={[styles.findTier, { color: TIER_COLORS[item.tier] }]}>
                  {item.tier} · {item.rarity_score}
                </Text>
              </View>
            )}
          />
        )}

        <GameButton
          label="NEW PAIR"
          onPress={handleNewPair}
          color={COLORS.secondary}
          shadowColor={COLORS.secondaryShadow}
          style={styles.newPairButton}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
