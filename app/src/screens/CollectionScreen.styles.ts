import { StyleSheet } from "react-native";
import { COLORS, FONTS, DEPTH } from "../theme/appTheme";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontFamily: FONTS.display,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.monoBold,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
  },
  sortRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 14, marginBottom: 10, gap: 10 },
  sortButton: {
    backgroundColor: COLORS.surface,
    borderRadius: DEPTH.radiusSm,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 2,
    borderColor: COLORS.outline,
  },
  sortButtonActive: { backgroundColor: COLORS.primary },
  sortButtonText: { color: COLORS.inkMuted, fontFamily: FONTS.monoBold, fontSize: 12 },
  sortButtonTextActive: { color: COLORS.cream, fontFamily: FONTS.monoBold },
  list: { flex: 1, paddingHorizontal: 20 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyText: {
    color: COLORS.inkFaint,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  clearButton: { margin: 20, alignItems: "center", paddingVertical: 10 },
  clearButtonText: { color: COLORS.inkFaint, fontFamily: FONTS.mono, fontSize: 12 },
  footerTip: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.mono,
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.5,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
});
