import Loader from "@/components/ui/Loader";
import WeekDateSlider from "@/components/ui/WeekDateSlider";
import WorkoutHeader from "@/containers/headers/workout-header";
import WorkoutListFooter from "@/containers/workout/list-footer";
import fetchActiveSplit from "@/mockApi/workout.screen";
import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  date?: string;
  status?: "completed" | "skipped" | "planned";
  exercises: Exercise[];
};
type Exercise = {
  id: number;
  exerciseName: string;
  image: string;
  muscleGroups: MuscleGroup[];
  sets: number;
  repRange: {
    min: number;
    max: number;
  };
  rir: {
    min: number;
    max: number;
  };
  lastSession: string;
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

function weekDatesFromMonday(anchor: Date): Date[] {
  const base = startOfLocalDay(anchor);
  const day = base.getDay();
  base.setDate(base.getDate() + (day === 0 ? -6 : 1 - day));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

function parseIsoDateToLocalDay(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getRoutineByDate(
  routines: Routine[],
  date: Date,
): Routine | undefined {
  return routines.find((routine) => {
    if (!routine.date) return false;
    return isSameCalendarDay(parseIsoDateToLocalDay(routine.date), date);
  });
}

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfLocalDay(new Date()),
  );
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
    navigation.setOptions({
      header: () => (
        <WorkoutHeader
          title={activeSplit?.name ?? "Workout"}
          subtitle={subtitle}
        />
      ),
    });
  }, [navigation, activeSplit, subtitle]);

  //TODO: handle loading
  if (isLoading) {
    return (
      <View style={styles.screenContainer}>
        <Loader />
      </View>
    );
  }
  //TODO: handle error
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  //TODO: handle no active split
  if (!activeSplit) {
    return <Text>No active split</Text>;
  }

  const routine = getRoutineByDate(activeSplit.routines, selectedDate);
  const isSkippedDay = routine?.status === "skipped";
  const isRestDay = !routine || isSkippedDay;
  const exercises = isRestDay ? [] : routine.exercises;
  const weeklyRoutineNames = weekDatesFromMonday(selectedDate).map((day) => {
    const dayRoutine = getRoutineByDate(activeSplit.routines, day);
    if (!dayRoutine || dayRoutine.status === "skipped") return "Rest";
    return dayRoutine.name;
  });
  const routineStatusLabel =
    routine?.status === "completed"
      ? "Completed"
      : routine?.status === "skipped"
        ? "Skipped"
        : "Planned";

  const listHeader = (
    <>
      <View style={styles.dateSliderContainer}>
        <WeekDateSlider
          selectedDate={selectedDate}
          routineNames={weeklyRoutineNames}
          onSelectDate={setSelectedDate}
          onRoutineSelect={() => {}}
        />
      </View>

      <View style={styles.routineContainer}>
        {isRestDay ? ( //TODO: handle rest day
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>
              {isSkippedDay ? "Skipped Day" : "Rest Day"}
            </Text>
          </View>
        ) : (
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>{routine.name}</Text>
            <Text style={styles.routineDetails}>
              {routine.exercises.length > 0
                ? `${routineStatusLabel} · ${routine.exercises.length} exercises · 60 minutes` //TODO: get previous duration from backend
                : `${routineStatusLabel} · No exercises · 0 minutes`}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  /*TODO: handle edit button press */
  const handleEditExercisePress = (exercise: Exercise) => {
    console.log("Edit exercise:", exercise);
  };

  return (
    <View style={styles.screenContainer}>
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
              <View style={styles.exerciseInfoContainer}>
                <View style={styles.exerciseNameRow}>
                  <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEditExercisePress(item)}
                  >
                    <Image
                      source={require("@/assets/images/edit-icon.png")}
                      style={styles.editButtonImage}
                    />
                  </Pressable>
                </View>
                <View style={styles.exercisePlannedStats}>
                  <View style={styles.plannedStatsItem}>
                    <Text style={styles.itemLabel}>SETS</Text>
                    <Text style={styles.itemValue}>{item.sets}</Text>
                  </View>
                  <View style={styles.plannedStatsItem}>
                    <Text style={styles.itemLabel}>REPS</Text>
                    <Text style={styles.itemValue}>
                      {item.repRange.min}-{item.repRange.max}
                    </Text>
                  </View>
                  <View style={styles.plannedStatsItem}>
                    <Text style={styles.itemLabel}>RIR</Text>
                    <Text style={styles.itemValue}>
                      {item.rir.min}-{item.rir.max}
                    </Text>
                  </View>
                </View>
                <View style={styles.lastSessionItem}>
                  <Text style={styles.itemLabel}>LAST SESSION</Text>
                  <Text
                    style={[styles.itemValue, styles.lastSessionValue]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.lastSession}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={listHeader}
        // ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
      {<WorkoutListFooter isRestDay={isRestDay} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  list: {
    flex: 1,
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
  exerciseInfoContainer: {
    flex: 1,
    gap: theme.spacing.md,
  },
  exerciseNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  exerciseName: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  editButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonImage: {
    width: 13.33,
    height: 1.67,
  },
  exercisePlannedStats: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  plannedStatsItem: {
    flex: 1,
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  itemLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#89A2BF",
  },
  itemValue: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    fontWeight: "600" as const,
    color: theme.colors.text.primary,
  },
  lastSessionItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  lastSessionValue: {
    flex: 1,
    minWidth: 0,
  },
});
