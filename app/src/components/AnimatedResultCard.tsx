import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tier } from "../logic/wordStore";
import { REVEAL_DURATIONS, TIER_COLORS } from "../theme/tiers";
import { COLORS } from "../theme/appTheme";

interface Props {
  children: React.ReactNode;
  tier?: Tier;
  isNewBest?: boolean;
}

// A little wax-seal "thump" that stamps down over the corner of the
// result card on a new personal best — separate from the card's own
// reveal animation so it can start mid-air, rotated, and slam down
// rather than fade in with everything else.
function WaxStamp({ tier }: { tier: Tier }) {
  const scale = useRef(new Animated.Value(2.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(-18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
      Animated.spring(rotate, { toValue: -12, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        stampStyles.stamp,
        {
          borderColor: TIER_COLORS[tier],
          opacity,
          transform: [
            { scale },
            { rotate: rotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) },
          ],
        },
      ]}
    >
      <Ionicons name="ribbon-outline" size={16} color={TIER_COLORS[tier]} />
    </Animated.View>
  );
}

export default function AnimatedResultCard({ children, tier, isNewBest }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = tier ? REVEAL_DURATIONS[tier] : 180;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
    ]).start(() => {
      if (isNewBest) {
        const peak = tier === "niche" ? 1.18 : tier === "obscure" ? 1.12 : 1.08;
        Animated.sequence([
          Animated.timing(scale, { toValue: peak, duration: 120, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
      }
    });
    // Runs once per mount — this component is remounted via a changing
    // `key` prop every time a new result comes in, so the animation
    // always plays fresh rather than replaying on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
      {isNewBest && tier && <WaxStamp tier={tier} />}
    </Animated.View>
  );
}

const stampStyles = StyleSheet.create({
  stamp: {
    position: "absolute",
    top: -10,
    right: 28,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: COLORS.paper,
    alignItems: "center",
    justifyContent: "center",
  },
});
