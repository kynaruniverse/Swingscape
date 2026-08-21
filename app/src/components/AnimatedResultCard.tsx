import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { Tier } from "../logic/wordStore";
import { REVEAL_DURATIONS } from "../theme/tiers";

interface Props {
  children: React.ReactNode;
  tier?: Tier;
  isNewBest?: boolean;
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
    </Animated.View>
  );
}
