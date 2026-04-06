import WeekDateSlider from "@/components/ui/WeekDateSlider";
import WorkoutHeader from "@/containers/headers/workout-header";
import fetchActiveSplit from "@/mockApi/workout.screen";
import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
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
  image: string;
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
  const isRestDay = routine === undefined;
  const exercises = isRestDay ? [] : routine.exercises;
  const weeklyRoutineNames = Array.from(
    { length: 7 },
    (_, i) => activeSplit.routines[i]?.name,
  );

  const listHeader = (
    <>
      <View style={styles.dateSliderContainer}>
        <WeekDateSlider
          selectedDate={selectedDate}
          routineNames={weeklyRoutineNames}
          onSelectDate={setSelectedDate}
          onRoutineSelect={setSelectedRoutine}
        />
      </View>

      <View style={styles.routineContainer}>
        {isRestDay ? ( //TODO: handle rest day
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>Rest Day</Text>
          </View>
        ) : (
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>{routine.name}</Text>
            <Text style={styles.routineDetails}>
              {routine.exercises.length > 0
                ? `${routine.exercises.length} exercises · 60 minutes` //TODO: get previous duration from backend
                : "No exercises · 0 minutes"}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <FlatList
      style={styles.list}
      data={exercises}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.exerciseRowContainer}>
          <View style={styles.exerciseRow}>
            <View style={styles.exerciseImageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.exerciseImage}
              />
              <View style={styles.exerciseIndexContainer}>
                <Text style={styles.exerciseIndexText}>{index + 1}</Text>
              </View>
            </View>
            <Text style={styles.exerciseName}>{item.exerciseName}</Text>
          </View>
        </View>
      )}
      ListHeaderComponent={listHeader}
      // ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContent: {
    gap: 16,
  },
  dateSliderContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  routineContainer: {
    paddingTop: 24,
    paddingInline: 16,
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
  exerciseRowContainer: {
    paddingHorizontal: 16,
  },
  exerciseRow: {
    width: "100%",
    flexDirection: "row",
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xs,
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  exerciseImageContainer: {
    position: "relative",
    width: 64,
    height: 64,
    borderRadius: theme.radius.xs,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xs,
  },
  exerciseIndexContainer: {
    position: "absolute",
    top: -7,
    left: -7,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.md,
    backgroundColor: "#E6EEF8",
    borderWidth: 0.5,
    borderColor: "#0F1724",
  },
  exerciseIndexText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    color: "#0B1220",
  },
});
