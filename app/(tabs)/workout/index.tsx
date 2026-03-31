import { StyleSheet, Text, View } from "react-native";

import fetchActiveSplit from "@/mockApi/workout.screen";
import { theme } from "@/theme";
import { useQuery } from "@tanstack/react-query";
type ActiveSplit = {
  id: number;
  name: string;
  frequencyWeekly: number;
  active: boolean;
  routines: Routine[];
};
type Routine = {
  id: number;
  name: string;
  exercises: Exercise[];
};
type Exercise = {
  id: number;
  exerciseName: string;
  muscleGroups: MuscleGroup[];
};
type MuscleGroup = {
  id: number;
  name: string;
  activation: "primary" | "secondary" | "stabilizer";
};
export default function WorkoutScreen() {
  const {
    data: activeSplit,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["split"],
    queryFn: fetchActiveSplit,
  });
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  const formattedDate = new Date().toLocaleDateString();
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{activeSplit.name}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
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
  date: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
