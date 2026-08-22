// Bold & chunky, earthy-but-high-contrast — cards read as pressable
// game pieces, not document sections. Two ideas do most of the work:
// (1) a plain, fairly neutral background so saturated card colors are
// what pops, and (2) every interactive/important surface gets a thick
// dark outline plus a solid offset "shadow" block underneath it
// (see components/GameButton.tsx and GameCard.tsx) rather than a soft
// blurred shadow — that hard-edged offset is what reads as "3D game
// piece" instead of "flat web card."
export const COLORS = {
  bg: "#fdf3dc", // plain warm cream backdrop — deliberately quiet so cards pop
  surface: "#fffaf0", // default card fill — brighter than bg, for contrast
  surfaceAlt: "#f4e6c4", // input fields, secondary panels
  ink: "#2b1d12", // primary text + default outline color — warm near-black
  inkMuted: "#6b5233",
  inkFaint: "#a68f6b",
  outline: "#2b1d12", // the thick border color used on every chunky element
  shadow: "#1c1109", // the solid offset shadow block color (near-black, not grey)
  primary: "#e2622e", // main CTA color — bold rust/terracotta
  primaryShadow: "#a8431a", // primary's offset-shadow shade (darker, not just grey)
  secondary: "#2f8f6b", // secondary actions (New Pair, etc.) — bold forest green
  secondaryShadow: "#1f6349",
  cream: "#fff", // reserved for text-on-dark-fill contexts
  hairline: "#e0cf9e", // thin dividers only (list rows) — chunky elements use `outline`, not this
} as const;

// Fredoka: a chunky, rounded, friendly display face for the words
// themselves — does the "this is a game, not a document" work that a
// serif never could. JetBrains Mono stays for anything stamped/counted
// (scores, tier tags) so playful headline type and technical readout
// type stay legible as two different jobs, not one clashing look.
export const FONTS = {
  display: "Fredoka_700Bold",
  displaySemi: "Fredoka_600SemiBold",
  mono: "JetBrainsMono_500Medium",
  monoBold: "JetBrainsMono_700Bold",
} as const;

// Shared depth constants — keep every chunky element's border/shadow
// consistent instead of each screen picking its own numbers.
export const DEPTH = {
  borderWidth: 3,
  shadowOffset: 5,
  radiusLg: 20,
  radiusMd: 14,
  radiusSm: 10,
} as const;

export const NAV_THEME = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.bg,
    card: COLORS.bg,
    text: COLORS.ink,
    border: COLORS.outline,
    notification: COLORS.primary,
  },
} as const;
