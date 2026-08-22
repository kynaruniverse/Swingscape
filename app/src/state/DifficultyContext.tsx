import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Difficulty } from "../logic/pairGenerator";

const STORAGE_KEY = "niche:difficulty:v1";
const DEFAULT_DIFFICULTY: Difficulty = "medium";

interface DifficultyContextValue {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

const DifficultyContext = createContext<DifficultyContextValue>({
  difficulty: DEFAULT_DIFFICULTY,
  setDifficulty: () => {},
});

export function DifficultyProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficultyState] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw === "easy" || raw === "medium" || raw === "hard") {
        setDifficultyState(raw);
      }
    });
  }, []);

  const setDifficulty = (d: Difficulty) => {
    setDifficultyState(d);
    AsyncStorage.setItem(STORAGE_KEY, d).catch(() => {});
  };

  return (
    <DifficultyContext.Provider value={{ difficulty, setDifficulty }}>
      {children}
    </DifficultyContext.Provider>
  );
}

export function useDifficulty() {
  return useContext(DifficultyContext);
}
