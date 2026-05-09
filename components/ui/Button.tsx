import { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import { hudColors, hudMotion, hudShadow, theme } from "@/theme";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = useCallback(
    (toValue: number) => {
      Animated.timing(scale, {
        toValue,
        duration: hudMotion.fast,
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Pressable
        disabled={disabled}
        onHoverIn={() => !disabled && animateScale(hudMotion.pressScale)}
        onHoverOut={() => animateScale(1)}
        onPressIn={() => !disabled && animateScale(hudMotion.pressScale)}
        onPressOut={() => animateScale(1)}
        onPress={onPress}
        style={[
          styles.base,
          variant === "primary" ? styles.primary : styles.secondary,
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.textBase,
            variant === "primary" ? styles.textPrimary : styles.textSecondary,
            disabled && styles.textDisabled,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  primary: {
    backgroundColor: hudColors.accent,
    borderColor: hudColors.accentSoft,
    ...hudShadow.glow,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
  },
  disabled: {
    backgroundColor: hudColors.surfaceGreen,
    borderColor: hudColors.border,
    shadowOpacity: 0,
  },
  textBase: {
    ...theme.typography.label,
    ...theme.hud.typography.labelWide,
  },
  textPrimary: {
    color: hudColors.textInverse,
  },
  textSecondary: {
    color: hudColors.accent,
  },
  textDisabled: {
    color: hudColors.textMuted,
  },
});
