import { Tier } from "../logic/wordStore";

// Reads as a hand-inked classification scale rather than a color-picker
// gradient: graphite pencil at the low end, warming toward the Wax Seal
// copper (see appTheme.ts) as rarity climbs.
export const TIER_COLORS: Record<Tier, string> = {
  common: "#6b6a62",
  familiar: "#6f8a5e",
  uncommon: "#5b84a0",
  rare: "#8272a8",
  obscure: "#a8607e",
  niche: "#d4954a",
};

export const TIER_LABELS: Record<Tier, string> = {
  common: "COMMON",
  familiar: "FAMILIAR",
  uncommon: "UNCOMMON",
  rare: "RARE",
  obscure: "OBSCURE",
  niche: "NICHE",
};

// Low-to-high rarity order, for rarity ladders/meters and tier summaries.
export const TIER_ORDER: Tier[] = ["common", "familiar", "uncommon", "rare", "obscure", "niche"];

// Tier-aware result copy — gets more rewarding as rarity climbs.
export const FIND_MESSAGES: Record<Tier, string> = {
  common: "VALID FIND",
  familiar: "NICE FIND",
  uncommon: "GOOD FIND",
  rare: "RARE FIND",
  obscure: "EXCELLENT FIND",
  niche: "INCREDIBLE FIND",
};

// Rarity controls how dramatic the reveal feels, not just the reveal
// itself — common finds are quick and quiet, niche finds get a longer,
// more emphatic pulse. Never so dramatic it fights the next guess.
export const REVEAL_DURATIONS: Record<Tier, number> = {
  common: 150,
  familiar: 180,
  uncommon: 220,
  rare: 280,
  obscure: 340,
  niche: 420,
};

// Rare-and-above discoveries get extra visual weight in the collection cabinet.
export const PROMINENT_TIERS: Set<Tier> = new Set(["rare", "obscure", "niche"]);
