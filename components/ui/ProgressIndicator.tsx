import { StyleSheet, Text } from "react-native";

import { theme } from "@/theme";

type Trend = "up" | "down" | "neutral";

type ProgressIndicatorProps = {
  value: string;
  trend: Trend;
};

export function ProgressIndicator({ value, trend }: ProgressIndicatorProps) {
  const trendStyle =
    trend === "up"
      ? styles.up
      : trend === "down"
        ? styles.down
        : styles.neutral;

  const trendSymbol = trend === "up" ? "+" : trend === "down" ? "-" : "";

  return <Text style={[styles.base, trendStyle]}>{`${trendSymbol}${value}`}</Text>;
}

const styles = StyleSheet.create({
  base: {
    ...theme.typography.label,
  },
  up: {
    color: theme.colors.semantic.success,
  },
  down: {
    color: theme.colors.semantic.danger,
  },
  neutral: {
    color: theme.colors.text.secondary,
  },
});
