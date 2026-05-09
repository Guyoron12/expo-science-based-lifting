import Loader from "@/components/ui/Loader";
import WorkoutHeader from "@/containers/headers/workout-header";
import WorkoutListFooter from "@/containers/workout/list-footer";
import WorkoutListHeader from "@/containers/workout/list-header";
import fetchActiveSplit from "@/mockApi/workout.screen";
import { hudColors, hudMotion, hudShadow, theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
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

function isPersonalRecordText(text: string): boolean {
  return /pr|personal record|pb/i.test(text);
}

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  duration?: number;
  style?: StyleProp<TextStyle>;
};

function AnimatedCounter({
  value,
  suffix = "",
  duration = hudMotion.normal,
  style,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.setValue(0);
    const listener = animatedValue.addListener(({ value: next }) => {
      setDisplayValue(Math.round(next));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, duration, value]);

  return (
    <Text style={style}>
      {displayValue}
      {suffix}
    </Text>
  );
}

type ExerciseRowProps = {
  item: Exercise;
  index: number;
  onEdit: (exercise: Exercise) => void;
  onPRPulse: () => void;
};

function ExerciseRow({ item, index, onEdit, onPRPulse }: ExerciseRowProps) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslate = useRef(new Animated.Value(16)).current;
  const prScale = useRef(new Animated.Value(1)).current;

  const isPR = isPersonalRecordText(item.lastSession);

  useEffect(() => {
    const staggerDelay = index * hudMotion.revealStagger;

    const animations = [
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: hudMotion.normal,
        delay: staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslate, {
        toValue: 0,
        duration: hudMotion.normal,
        delay: staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    if (isPR) {
      animations.push(
        Animated.sequence([
          Animated.delay(staggerDelay + 140),
          Animated.spring(prScale, {
            toValue: hudMotion.pressScale,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(prScale, {
            toValue: 1,
            friction: 8,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
      );
      onPRPulse();
    }

    Animated.parallel(animations).start();
  }, [entryOpacity, entryTranslate, index, isPR, onPRPulse, prScale]);

  return (
    <Animated.View
      style={[
        styles.exerciseRowContainer,
        {
          opacity: entryOpacity,
          transform: [{ translateY: entryTranslate }, { scale: prScale }],
        },
      ]}
    >
      <Pressable
        onPress={() => onEdit(item)}
        style={({ pressed }) => [
          styles.exerciseRow,
          pressed && styles.exerciseRowPressed,
        ]}
      >
        <View style={styles.exerciseImageContainer}>
          <Image source={{ uri: item.image }} style={styles.exerciseImage} />
          <View style={styles.exerciseIndexContainer}>
            <Text style={styles.exerciseIndexText}>{index + 1}</Text>
          </View>
        </View>
        <View style={styles.exerciseInfoContainer}>
          <View style={styles.exerciseNameRow}>
            <Text style={styles.exerciseName}>{item.exerciseName}</Text>
            <View style={styles.editButton}>
              <Image
                source={require("@/assets/images/edit-icon.png")}
                style={styles.editButtonImage}
              />
            </View>
          </View>
          <View style={styles.exercisePlannedStats}>
            <View style={styles.plannedStatsItem}>
              <Text style={styles.itemLabel}>SETS</Text>
              <AnimatedCounter value={item.sets} style={styles.itemValue} />
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
              style={[
                styles.itemValue,
                styles.lastSessionValue,
                isPR && styles.lastSessionValueHighlight,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastSession}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

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
  exerciseRowContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  exerciseRow: {
    width: "100%",
    flexDirection: "row",
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: hudColors.border,
    borderRadius: theme.radius.md,
    backgroundColor: hudColors.surfaceRaised,
    ...hudShadow.card,
  },
  exerciseRowPressed: {
    borderColor: hudColors.borderGreenStrong,
    transform: [{ scale: hudMotion.pressScale }],
    ...hudShadow.glow,
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
    borderRadius: 999,
    backgroundColor: hudColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
  },
  exerciseIndexText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    color: hudColors.accent,
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
    color: hudColors.textPrimary,
    letterSpacing: -0.32,
    textTransform: "uppercase",
  },
  editButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: hudColors.border,
    borderRadius: 999,
    backgroundColor: hudColors.surfaceGreen,
  },
  editButtonImage: {
    width: 13.33,
    height: 1.67,
    tintColor: hudColors.accent,
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
    borderColor: hudColors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: hudColors.surfaceGreen,
  },
  itemLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    fontWeight: "700" as const,
    color: hudColors.textDim,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  itemValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    fontWeight: "700" as const,
    color: hudColors.accent,
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
    borderColor: hudColors.border,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    backgroundColor: hudColors.surfaceGreen,
  },
  lastSessionValue: {
    flex: 1,
    minWidth: 0,
  },
  lastSessionValueHighlight: {
    color: hudColors.accent,
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
