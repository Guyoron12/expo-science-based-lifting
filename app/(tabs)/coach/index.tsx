import { StyleSheet, Text, View } from "react-native";

import { CoachInsightCard } from "@/components/ui/CoachInsightCard";
import { theme } from "@/theme";

export default function CoachScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Insights</Text>
      <CoachInsightCard
        title="Fatigue signal"
        message="Bar speed is down for 2 sessions. Reduce top set by 2.5% today."
        tone="warning"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
});
