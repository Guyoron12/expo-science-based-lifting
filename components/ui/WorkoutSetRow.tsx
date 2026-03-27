import { StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { theme } from "@/theme";

type WorkoutSetRowProps = {
  exercise: string;
  reps: string;
  weight: string;
  onRepsChange: (value: string) => void;
  onWeightChange: (value: string) => void;
};

export default function WorkoutSetRow({
  exercise,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
}: WorkoutSetRowProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.exercise}>{exercise}</Text>
      <View style={styles.inputsRow}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={reps}
            onChangeText={onRepsChange}
            placeholder="8"
            placeholderTextColor={theme.colors.text.muted}
          />
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={onWeightChange}
            placeholder="100"
            placeholderTextColor={theme.colors.text.muted}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  exercise: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },
  inputsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  inputBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  input: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
  },
});
