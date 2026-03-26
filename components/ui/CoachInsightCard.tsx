import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { theme } from "@/theme";

type InsightTone = "success" | "warning" | "danger" | "info";

type CoachInsightCardProps = {
  title: string;
  message: string;
  tone: InsightTone;
};

export function CoachInsightCard({ title, message, tone }: CoachInsightCardProps) {
  const indicatorColor = theme.colors.semantic[tone];

  return (
    <Card>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: indicatorColor }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  title: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
