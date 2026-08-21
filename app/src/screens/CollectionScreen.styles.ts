import { StyleSheet } from "react-native";
import { COLORS, FONTS } from "../theme/appTheme";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ledgerInk },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  title: {
    color: COLORS.parchment,
    fontSize: 26,
    fontFamily: FONTS.display,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.parchmentFaint,
    fontFamily: FONTS.mono,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
  },
  sortRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 12, marginBottom: 8, gap: 8 },
  sortButton: {
    backgroundColor: COLORS.vellumPanelRaised,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  sortButtonActive: { backgroundColor: COLORS.waxSeal, borderColor: COLORS.waxSeal },
  sortButtonText: { color: COLORS.parchmentMuted, fontFamily: FONTS.mono, fontSize: 12 },
  sortButtonTextActive: { color: COLORS.ledgerInk, fontFamily: FONTS.monoBold },
  list: { flex: 1, paddingHorizontal: 20 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: {
    color: COLORS.parchmentFaint,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  clearButton: { margin: 20, alignItems: "center", paddingVertical: 10 },
  clearButtonText: { color: COLORS.parchmentFaint, fontFamily: FONTS.mono, fontSize: 12 },
});
