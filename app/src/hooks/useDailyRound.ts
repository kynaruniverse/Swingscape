import { useState, useCallback, useEffect, useRef } from "react";
import { WordStore } from "../logic/wordStore";
import { generatePair } from "../logic/pairGenerator";
import { rngFromSeed, todayDateKey } from "../logic/seededRandom";
import {
  RoundState,
  createRoundState,
  submitGuess,
  allFinds,
  bestFind,
  percentOfBest,
  isRoundOver,
  DEFAULT_MAX_ATTEMPTS,
  useHint as applyHint,
  hintDisplay,
  canTakeHint,
} from "../logic/roundState";
import { maybeAddToCollection } from "../logic/collectionStore";
import { recordDiscovery } from "../logic/catalogStore";
import { getTodayResult, saveTodayResult, getStreak, StreakState, DailyResult } from "../logic/dailyStore";
import { FeedbackState } from "../components/FeedbackCard";

// Fixed difficulty for Daily Duel — every player faces the same
// challenge on a given date, independent of their Explore difficulty
// setting, so the day is a fair shared comparison point.
const DAILY_DIFFICULTY = "medium" as const;

export function useDailyRound(store: WordStore) {
  const [loading, setLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [todayResult, setTodayResult] = useState<DailyResult | null>(null);
  const [streak, setStreak] = useState<StreakState>({ current: 0, longest: 0, lastPlayedDate: null });
  const [state, setState] = useState<RoundState | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [collectionToast, setCollectionToast] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const saved = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [existing, streakState] = await Promise.all([getTodayResult(), getStreak()]);
      if (cancelled) return;
      setStreak(streakState);

      if (existing) {
        setTodayResult(existing);
        setAlreadyPlayed(true);
        setLoading(false);
        return;
      }

      const rng = rngFromSeed(`niche-daily-${todayDateKey()}`);
      const pair = generatePair(store, DAILY_DIFFICULTY, 200, rng);
      if (pair) setState(createRoundState(pair, DEFAULT_MAX_ATTEMPTS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const roundOver = state ? isRoundOver(state) : false;
  const best = state ? bestFind(state) : undefined;
  const finds = state ? allFinds(state) : [];
  const progressPct = state?.pair.bestPossible
    ? Math.min(100, Math.round(percentOfBest(state) * 100))
    : undefined;

  // Persist the result and bump the streak exactly once, the moment
  // the live round ends (not on every render while roundOver is true).
  useEffect(() => {
    if (!roundOver || saved.current || !state) return;
    saved.current = true;
    saveTodayResult(best ?? null, finds.length).then((next) => {
      setStreak(next);
      setTodayResult({ date: todayDateKey(), best: best ?? null, findsCount: finds.length });
    });
  }, [roundOver, state, best, finds.length]);

  const handleSubmit = useCallback(() => {
    if (!state || !input.trim() || isRoundOver(state)) return;

    const { result, nextState } = submitGuess(state, store, input);
    setCollectionToast(null);
    setResultKey((k) => k + 1);

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
        recordDiscovery(result.entry.word);
        break;
      }
    }
    setInput("");
  }, [state, input, store]);

  const handleHint = useCallback(() => {
    if (!state) return;
    setState(applyHint(state));
  }, [state]);

  const hint = state ? hintDisplay(state) : undefined;
  const hintAvailable = state ? canTakeHint(state) : false;

  return {
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
  };
}
