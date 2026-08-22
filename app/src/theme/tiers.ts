import { Tier } from "../logic/wordStore";

// A bold, escalating earthy palette — dusty and calm at the common
// end, warming through amber/rust, then breaking into deep forest and
// finally a vivid plum at the rarest tier so "niche" reads as a real
// payoff, not just another swatch in a gradient.
export const TIER_COLORS: Record<Tier, string> = {
  common: "#8a9a6b",
  familiar: "#d1a237",
  uncommon: "#e2822f",
  rare: "#d94f2b",
  obscure: "#2f8f6b",
  niche: "#8b1e5c",
};

// Darker shade of each tier color, for the offset "shadow" block under
// tier-colored chunky elements (badges, RarityMeter segments) — a true
// 3D-extrusion look needs a shade of the *same* hue, not flat grey.
export const TIER_SHADOW_COLORS: Record<Tier, string> = {
  common: "#5f6c49",
  familiar: "#9c7620",
  uncommon: "#a85c1c",
  rare: "#9c341a",
  obscure: "#1f6349",
  niche: "#5e1240",
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
