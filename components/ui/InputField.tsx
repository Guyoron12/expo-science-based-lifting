import { StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "@/theme";

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
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        value={value}
        onChangeText={onChangeText}
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
    color: theme.colors.text.secondary,
  },
  input: {
    minHeight: 44,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
  },
});
