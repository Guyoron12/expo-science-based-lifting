import WeekDateSlider from "@/components/ui/WeekDateSlider";
import WorkoutHeader from "@/containers/headers/workout-header";
import fetchActiveSplit from "@/mockApi/workout.screen";
import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const [selectedRoutine, setSelectedRoutine] = useState(0);
  const {
    data: activeSplit,
    isLoading,
    error,
  } = useQuery<ActiveSplit>({
    queryKey: ["split"],
    queryFn: fetchActiveSplit as () => Promise<ActiveSplit>,
  });
  const subtitle = selectedDate.toLocaleDateString();
  useLayoutEffect(() => {
    if (activeSplit?.name) {
      navigation.setOptions({
        header: () => (
          <WorkoutHeader title={activeSplit.name} subtitle={subtitle} />
        ),
      });
    } else {
      navigation.setOptions({ header: undefined });
    }
  }, [navigation, activeSplit, subtitle]);

  //TODO: handle loading
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  //TODO: handle error
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  //TODO: handle no active split
  if (!activeSplit) {
    return <Text>No active split</Text>;
  }

  const routine = activeSplit.routines[selectedRoutine];
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.dateSliderContainer}>
      <WeekDateSlider
        selectedDate={selectedDate}
        routineNames={Array.from({ length: 7 }, (_, i) =>
          activeSplit.routines[i]?.name,
        )}
        onSelectDate={setSelectedDate}
        onRoutineSelect={setSelectedRoutine}
      />
      </View>
      <View style={styles.routineContainer}>
        <View style={styles.routineHeader}>
          <Text style={styles.routineTitle}>{routine.name}</Text>
          <Text style={styles.routineDetails}>{"routine.exercises.length"} exercises</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {

  },
  dateSliderContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  routineContainer: {
    paddingVertical: 24,
    paddingBottom: 16,
    paddingInline: 16,
    gap: 24,
  },
  routineHeader: {
    gap: 8,
  },
  routineTitle: {
    ...theme.typography.display,
    color: theme.colors.text.primary,
  },
  routineDetails: {
    ...theme.typography.body,
    color: "#89A2BF",
  },
});
