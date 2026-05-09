import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { hudColors, theme } from "@/theme";

type InputFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
};

export function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder={placeholder}
        placeholderTextColor={hudColors.textMuted}
        selectionColor={hudColors.accent}
        cursorColor={hudColors.accent}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.label,
    color: hudColors.textSecondary,
    ...theme.hud.typography.labelWide,
  },
  input: {
    minHeight: 44,
    backgroundColor: hudColors.backgroundTertiary,
    color: hudColors.textPrimary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: hudColors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
  },
  inputFocused: {
    borderColor: hudColors.accent,
    backgroundColor: hudColors.surfaceGreen,
    shadowColor: hudColors.accent,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
});
