import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { COLORS, FONTS, DEPTH } from "../theme/appTheme";

interface Props {
  label: string;
  onPress: () => void;
  color?: string; // fill color — defaults to primary
  shadowColor?: string; // offset shadow shade — defaults to a darkened primary
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

/**
 * The core "pressable game piece" button: a solid-color pill sitting on
 * top of a darker offset shadow block of the same shape. On press, the
 * button visually sinks down into its shadow (translateY) rather than
 * just dimming — that's what sells "physical thing you tapped" instead
 * of "flat web button."
 */
export default function GameButton({
  label,
  onPress,
  color = COLORS.primary,
  shadowColor = COLORS.primaryShadow,
  textColor = COLORS.cream,
  disabled,
  style,
  small,
}: Props) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const offset = small ? DEPTH.shadowOffset - 2 : DEPTH.shadowOffset;

  const handlePressIn = () => {
    Animated.timing(pressAnim, { toValue: offset, duration: 60, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, friction: 5, tension: 200, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.wrapper, style]}
    >
      <Animated.View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: disabled ? COLORS.inkFaint : shadowColor,
            borderRadius: small ? DEPTH.radiusSm : DEPTH.radiusMd,
            top: offset,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.fillLayer,
          {
            backgroundColor: disabled ? COLORS.surfaceAlt : color,
            borderRadius: small ? DEPTH.radiusSm : DEPTH.radiusMd,
            paddingVertical: small ? 10 : 16,
            transform: [{ translateY: pressAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: disabled ? COLORS.inkFaint : textColor, fontSize: small ? 13 : 16 },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  shadowLayer: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 },
  fillLayer: {
    borderWidth: DEPTH.borderWidth,
    borderColor: COLORS.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: FONTS.display, letterSpacing: 0.5 },
});
