import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { theme } from "@/theme";

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <Card style={styles.card}>
        <Text style={styles.body}>Estimated 1RM trend</Text>
        <View style={styles.row}>
          <Text style={styles.metric}>182.5 kg</Text>
          <ProgressIndicator value="1.2%" trend="down" />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  card: { gap: theme.spacing.sm },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metric: {
    ...theme.typography.metric,
    color: theme.colors.text.primary,
  },
});
