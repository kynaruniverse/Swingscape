import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { COLORS, DEPTH } from "../theme/appTheme";

interface Props {
  children: React.ReactNode;
  color?: string; // fill — defaults to the neutral surface color
  shadowColor?: string; // defaults to a flat near-black shadow
  borderColor?: string; // defaults to the standard dark outline
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

/**
 * The static counterpart to GameButton: same thick-outline + offset
 * hard-shadow language, but for things you look at rather than tap
 * (the word-pair tile, the best-find panel, a collection card).
 */
export default function GameCard({
  children,
  color = COLORS.surface,
  shadowColor = COLORS.shadow,
  borderColor = COLORS.outline,
  style,
  radius = DEPTH.radiusMd,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.shadowLayer, { backgroundColor: shadowColor, borderRadius: radius }]} />
      <View
        style={[
          styles.fillLayer,
          { backgroundColor: color, borderColor, borderRadius: radius },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  shadowLayer: { position: "absolute", left: 0, right: 0, bottom: 0, top: DEPTH.shadowOffset },
  fillLayer: { borderWidth: DEPTH.borderWidth },
});
