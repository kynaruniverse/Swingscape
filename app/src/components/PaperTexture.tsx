import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// A true noise/grain texture needs a bitmap asset (a tileable PNG) —
// there's no procedural noise primitive available without adding a
// heavier native dependency, which isn't worth the EAS-build risk for
// a subtle background effect. This is a lighter stand-in: two soft
// diagonal washes that darken the corners slightly, like the gentle
// unevenness of a scanned paper page, using only expo-linear-gradient
// (already a safe, commonly-bundled Expo package).
//
// If you want true grain later: drop a small tileable noise PNG into
// assets/ and swap this for an <ImageBackground> tiling it — everything
// else (usage below) stays the same.
export default function PaperTexture() {
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(43,35,24,0.05)", "rgba(43,35,24,0)", "rgba(43,35,24,0)", "rgba(43,35,24,0.05)"]}
        locations={[0, 0.25, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(43,35,24,0.04)", "rgba(43,35,24,0)", "rgba(43,35,24,0)", "rgba(43,35,24,0.04)"]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
