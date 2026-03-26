import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/theme";

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
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
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
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  secondary: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    backgroundColor: theme.colors.disabled.bg,
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
  },
  textBase: {
    ...theme.typography.label,
  },
  textPrimary: {
    color: theme.colors.text.primary,
  },
  textSecondary: {
    color: theme.colors.text.secondary,
  },
  textDisabled: {
    color: theme.colors.disabled.text,
  },
});
