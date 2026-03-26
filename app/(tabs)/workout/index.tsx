import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { WorkoutSetRow } from "@/components/ui/WorkoutSetRow";
import { theme } from "@/theme";

export default function WorkoutScreen() {
  const [reps, setReps] = useState("8");
  const [weight, setWeight] = useState("100");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout</Text>
      <WorkoutSetRow
        exercise="Back Squat"
        reps={reps}
        weight={weight}
        onRepsChange={setReps}
        onWeightChange={setWeight}
      />
      <Button label="Log Set" onPress={() => {}} />
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
