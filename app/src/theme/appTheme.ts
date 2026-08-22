// Light parchment/ink palette — a field-guide page rather than a dark
// app default. Key names describe role (paper/ink/accent), not a fixed
// light-or-dark value, so a future retint changes meaning-in-code, not
// just the hex.
export const COLORS = {
  paper: "#f4ecd8", // base background — warm cream, not pure white
  paperPanel: "#e9dfc2", // card/panel surface, one step down from base
  paperPanelRaised: "#ddcfa8", // inputs, buttons-at-rest
  paperPanelHighlight: "#f0e2b8", // prominent/highlighted card surface
  ink: "#2b2318", // primary text — warm near-black, not pure #000
  inkMuted: "#6b5f47", // secondary text
  inkFaint: "#9c8f6d", // tertiary/disabled text
  waxSeal: "#a8562a", // single warm accent — CTAs, best-find moments only
  waxSealMuted: "#c9814f", // pressed/inactive state of the accent
  hairline: "#cabf98", // borders, dividers
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
  dark: false,
  colors: {
    primary: COLORS.waxSeal,
    background: COLORS.paper,
    card: COLORS.paper,
    text: COLORS.ink,
    border: COLORS.hairline,
    notification: COLORS.waxSeal,
  },
} as const;
