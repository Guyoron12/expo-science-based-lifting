import Loader from "@/components/ui/Loader";
import WorkoutHeader from "@/containers/headers/workout-header";
import ExerciseRow from "@/containers/workout/exercise-row";
import WorkoutListFooter from "@/containers/workout/list-footer";
import WorkoutListHeader from "@/containers/workout/list-header";
import fetchActiveSplit from "@/mockApi/workout.screen";
import {
  getRoutineByDate,
  isPersonalRecordText,
  startOfLocalDay,
  weekDatesFromMonday,
} from "@/services/functions/functions.service";
import { hudColors, hudMotion, theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import type { ActiveSplit, Exercise } from "./workout.types";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, FlatList, StyleSheet, Text, View } from "react-native";

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const pageOpacity = useRef(new Animated.Value(0)).current;
  const pageTranslateX = useRef(new Animated.Value(20)).current;
  const introFlashOpacity = useRef(new Animated.Value(0)).current;
  const prFlashOpacity = useRef(new Animated.Value(0)).current;
  const hasTriggeredPrFlash = useRef(false);
  const {
    data: activeSplit,
    isLoading,
    error,
  } = useQuery<ActiveSplit>({
    queryKey: ["split"],
    queryFn: fetchActiveSplit as () => Promise<ActiveSplit>,
  });
  const subtitle = selectedDate.toLocaleDateString();

  const grainDots = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        key: i.toString(),
        top: (i * 31) % 760,
        left: (i * 53) % 360,
        size: i % 3 === 0 ? 2 : 1,
      })),
    [],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 1,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pageTranslateX, {
        toValue: 0,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(introFlashOpacity, {
          toValue: 0.28,
          duration: hudMotion.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(introFlashOpacity, {
          toValue: 0,
          duration: hudMotion.normal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [introFlashOpacity, pageOpacity, pageTranslateX]);

  const triggerPRFlash = useCallback(() => {
    if (hasTriggeredPrFlash.current) return;
    hasTriggeredPrFlash.current = true;
    Animated.sequence([
      Animated.timing(prFlashOpacity, {
        toValue: 0.55,
        duration: hudMotion.fast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(prFlashOpacity, {
        toValue: 0,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [prFlashOpacity]);

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
  const exerciseCount = exercises.length;
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const prCount = exercises.filter((exercise) =>
    isPersonalRecordText(exercise.lastSession),
  ).length;
  const minRir = exercises.length
    ? Math.min(...exercises.map((exercise) => exercise.rir.min))
    : 0;
  const maxRir = exercises.length
    ? Math.max(...exercises.map((exercise) => exercise.rir.max))
    : 0;
  const intensityTarget = isRestDay ? "recovery" : `${minRir}-${maxRir} RIR`;
  const strengthScore = Math.min(
    99,
    Math.round(68 + totalSets * 1.8 + prCount * 6),
  );
  const weeklyRoutineNames = weekDatesFromMonday(selectedDate).map((day) => {
    const dayRoutine = getRoutineByDate(activeSplit.routines, day);
    if (!dayRoutine || dayRoutine.status === "skipped") return "Rest";
    return dayRoutine.name;
  });
  const routineStatusLabel = !routine
    ? "Recovery"
    : routine.status === "completed"
      ? "Completed"
      : routine.status === "skipped"
        ? "Skipped"
        : "Planned";

  const routineDetailsText =
    !isRestDay && routine && routine.exercises.length > 0
      ? `${routineStatusLabel} · ${routine.exercises.length} exercises · 60 minutes` //TODO: get previous duration from backend
      : `${routineStatusLabel} · No exercises · 0 minutes`;

  /*TODO: handle edit button press */
  const handleEditExercisePress = (exercise: Exercise) => {
    console.log("Edit exercise:", exercise);
  };

  return (
    <View style={styles.screenContainer}>
      <View pointerEvents="none" style={styles.scanlineLayer}>
        {Array.from({ length: 70 }).map((_, i) => (
          <View key={`line-${i}`} style={[styles.scanline, { top: i * 14 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={styles.grainLayer}>
        {grainDots.map((dot) => (
          <View
            key={dot.key}
            style={[
              styles.grainDot,
              {
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
              },
            ]}
          />
        ))}
      </View>
      <Animated.View
        style={[
          styles.listContainer,
          { opacity: pageOpacity, transform: [{ translateX: pageTranslateX }] },
        ]}
      >
        <FlatList
          style={styles.list}
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <ExerciseRow
              item={item}
              index={index}
              onEdit={handleEditExercisePress}
              onPRPulse={triggerPRFlash}
            />
          )}
          ListHeaderComponent={
            <WorkoutListHeader
              selectedDate={selectedDate}
              routineNames={weeklyRoutineNames}
              onSelectDate={setSelectedDate}
              isRestDay={isRestDay}
              isSkippedDay={isSkippedDay}
              routineName={routine?.name}
              routineDetailsText={routineDetailsText}
              exerciseCount={exerciseCount}
              totalSets={totalSets}
              prCount={prCount}
              strengthScore={strengthScore}
              intensityTarget={intensityTarget}
            />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
      <WorkoutListFooter isRestDay={isRestDay} />
      <Animated.View
        pointerEvents="none"
        style={[styles.flashFrame, { opacity: introFlashOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.prFlash, { opacity: prFlashOpacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: hudColors.backgroundPrimary,
  },
  listContainer: {
    flex: 1,
  },
  scanlineLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: hudColors.scanline,
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  grainDot: {
    position: "absolute",
    borderRadius: 1,
    backgroundColor: hudColors.grain,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  flashFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: hudColors.accent,
    backgroundColor: hudColors.flash,
  },
  prFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hudColors.flash,
  },
});
