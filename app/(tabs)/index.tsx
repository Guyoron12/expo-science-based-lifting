import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { useAuthStore } from "@/stores/auth.store";
import { theme } from "@/theme";

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Science Based Lifting</Text>
        <Text style={styles.body}>Focused training data for each session.</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricValue}>152.5 kg</Text>
          <ProgressIndicator value="2.5 kg" trend="up" />
        </View>
      </Card>
      <Button label="Logout" onPress={logout} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  metricRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricValue: {
    ...theme.typography.metric,
    color: theme.colors.text.primary,
  },
});
