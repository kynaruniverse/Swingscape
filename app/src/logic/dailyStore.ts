/**
 * NICHE — Daily Duel store.
 *
 * Local-only for now (no Supabase yet — see GDD §12 phase plan):
 * tracks whether today's Daily has been played, the player's best find
 * for today, and a day-streak counter. This is deliberately shaped so
 * a future backend sync only has to layer on top (same fields), not
 * replace this.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordEntry } from "./wordStore";
import { todayDateKey } from "./seededRandom";

const RESULT_KEY_PREFIX = "niche:daily:result:"; // + date key
const STREAK_KEY = "niche:daily:streak:v1";

export interface DailyResult {
  date: string; // YYYY-MM-DD
  best: WordEntry | null;
  findsCount: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastPlayedDate: string | null;
}

export async function getTodayResult(): Promise<DailyResult | null> {
  try {
    const raw = await AsyncStorage.getItem(RESULT_KEY_PREFIX + todayDateKey());
    return raw ? (JSON.parse(raw) as DailyResult) : null;
  } catch (err) {
    console.warn("Failed to load today's Daily result", err);
    return null;
  }
}

export async function getStreak(): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    return raw ? (JSON.parse(raw) as StreakState) : { current: 0, longest: 0, lastPlayedDate: null };
  } catch (err) {
    console.warn("Failed to load streak", err);
    return { current: 0, longest: 0, lastPlayedDate: null };
  }
}

function isYesterday(dateKey: string, today: string): boolean {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === today;
}

/**
 * Records today's Daily Duel result and updates the streak. Safe to
 * call once per completed round — calling it again the same day just
 * overwrites today's result without double-counting the streak.
 */
export async function saveTodayResult(
  best: WordEntry | null,
  findsCount: number
): Promise<StreakState> {
  const today = todayDateKey();
  const result: DailyResult = { date: today, best, findsCount };

  try {
    await AsyncStorage.setItem(RESULT_KEY_PREFIX + today, JSON.stringify(result));
  } catch (err) {
    console.warn("Failed to save today's Daily result", err);
  }

  const streak = await getStreak();
  let nextCurrent: number;

  if (streak.lastPlayedDate === today) {
    // Already recorded a streak day today — don't double-increment.
    nextCurrent = streak.current;
  } else if (streak.lastPlayedDate && isYesterday(streak.lastPlayedDate, today)) {
    nextCurrent = streak.current + 1;
  } else {
    nextCurrent = 1; // gap of 2+ days, or first-ever play
  }

  const next: StreakState = {
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastPlayedDate: today,
  };

  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("Failed to save streak", err);
  }

  return next;
}
