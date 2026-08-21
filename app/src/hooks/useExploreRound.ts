import { useState, useCallback } from "react";
import { WordStore } from "../logic/wordStore";
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
import { FeedbackState } from "../components/FeedbackCard";

function newState(store: WordStore, difficulty: Difficulty): RoundState | null {
  const pair = generatePair(store, difficulty);
  return pair ? createRoundState(pair) : null;
}

// Owns everything about "one round of Explore" — pair generation, guess
// submission, feedback, and the collection side-effect — independent of
// how it gets rendered. The screen component just reads what this
// returns.
export function useExploreRound(store: WordStore, difficulty: Difficulty = "medium") {
  const [state, setState] = useState<RoundState | null>(() => newState(store, difficulty));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [collectionToast, setCollectionToast] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);

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
        break;
      }
    }
    setInput("");
  }, [state, input, store]);

  const best = state ? bestFind(state) : null;
  const roundOver = state ? isRoundOver(state) : false;
  const finds = state ? allFinds(state) : [];
  const progressPct = state?.pair.bestPossible
    ? Math.min(100, Math.round(percentOfBest(state) * 100))
    : undefined;
  const madeCollection = !!best && best.rarity_score >= COLLECTION_MIN_RARITY;

  return {
    state,
    input,
    setInput,
    feedback,
    collectionToast,
    resultKey,
    handleSubmit,
    handleNewPair,
    best,
    roundOver,
    finds,
    progressPct,
    madeCollection,
  };
}
