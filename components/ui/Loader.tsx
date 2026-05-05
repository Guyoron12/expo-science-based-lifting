import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type LoaderProps = {
  label?: string;
};

export default function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
