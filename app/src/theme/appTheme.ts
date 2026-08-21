// Ledger/specimen-cabinet palette. Named for what they evoke, not what
// they render as, so a future retint changes meaning-in-code, not just
// the hex.
export const COLORS = {
  ledgerInk: "#14181a", // base background — blue-green cast, not flat black
  vellumPanel: "#1f2422", // card/panel surface, one step up from base
  vellumPanelRaised: "#262b28", // inputs, buttons-at-rest
  parchment: "#e8dfc8", // primary text — warm off-white, not pure #fff
  parchmentMuted: "#a89f8a", // secondary text
  parchmentFaint: "#5f5b4d", // tertiary/disabled text, hairlines
  waxSeal: "#c17a3d", // single warm accent — CTAs, best-find moments only
  waxSealMuted: "#8a5a30", // pressed/inactive state of the accent
  hairline: "#2c3230", // borders, dividers
} as const;

// Serif for specimen names (words), mono for anything stamped/measured
// (scores, tier labels, counts) — the pairing does the "cataloguing"
// work, not decoration.
export const FONTS = {
  display: "DMSerifDisplay_400Regular",
  mono: "JetBrainsMono_500Medium",
  monoBold: "JetBrainsMono_700Bold",
} as const;

export const NAV_THEME = {
  dark: true,
  colors: {
    primary: COLORS.waxSeal,
    background: COLORS.ledgerInk,
    card: COLORS.ledgerInk,
    text: COLORS.parchment,
    border: COLORS.hairline,
    notification: COLORS.waxSeal,
  },
} as const;
