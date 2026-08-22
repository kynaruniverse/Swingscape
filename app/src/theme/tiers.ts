import { Tier } from "../logic/wordStore";

// Reads as a hand-inked classification scale rather than a color-picker
// gradient: graphite pencil at the low end, warming toward a deep
// burnt-copper as rarity climbs. Values are darkened relative to a
// dark-mode version of this scale — on cream paper, light/pastel tones
// wash out, so every tier color needs to carry its own contrast.
export const TIER_COLORS: Record<Tier, string> = {
  common: "#5c584c",
  familiar: "#4f6b3f",
  uncommon: "#3d6684",
  rare: "#6a4f92",
  obscure: "#8a3f5c",
  niche: "#b06a1e",
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
