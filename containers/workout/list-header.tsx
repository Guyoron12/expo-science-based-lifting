import WeekDateSlider from "@/components/ui/WeekDateSlider";
import { hudColors, hudTypography, theme } from "@/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type WorkoutListHeaderProps = {
  selectedDate: Date;
  routineNames: string[];
  onSelectDate: (date: Date) => void;
  isRestDay: boolean;
  isSkippedDay: boolean;
  routineName?: string;
  routineDetailsText?: string;
};

export default function WorkoutListHeader({
  selectedDate,
  routineNames,
  onSelectDate,
  isRestDay,
  isSkippedDay,
  routineName,
  routineDetailsText,
}: WorkoutListHeaderProps) {
  const restScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRestDay) return;
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(restScale, {
          toValue: 1.03,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(restScale, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, [isRestDay, restScale]);

  return (
    <>
      <View style={styles.dateSliderContainer}>
        <WeekDateSlider
          selectedDate={selectedDate}
          routineNames={routineNames}
          onSelectDate={onSelectDate}
          onRoutineSelect={() => {}}
        />
      </View>

      <View style={styles.routineContainer}>
        {isRestDay ? (
          <Animated.View
            style={[styles.restDayCard, { transform: [{ scale: restScale }] }]}
          >
            <View style={styles.restOrb} />
            <Text style={styles.routineTitle}>
              {isSkippedDay ? "Skipped Day" : "Rest Day"}
            </Text>
            <Text style={styles.routineDetails}>Recovery protocol active</Text>
          </Animated.View>
        ) : (
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>{routineName}</Text>
            <Text style={styles.routineDetails}>{routineDetailsText}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dateSliderContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: hudColors.border,
  },
  routineContainer: {
    paddingTop: 24,
    paddingInline: 16,
  },
  routineHeader: {
    gap: 8,
  },
  restDayCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: hudColors.border,
    borderRadius: theme.radius.md,
    backgroundColor: hudColors.surface,
    padding: theme.spacing.lg,
  },
  restOrb: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "rgba(0, 255, 135, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 135, 0.35)",
    shadowColor: hudColors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  routineTitle: {
    ...theme.typography.display,
    color: hudColors.textPrimary,
    ...hudTypography.headingTight,
  },
  routineDetails: {
    ...theme.typography.body,
    color: hudColors.textMuted,
    ...hudTypography.mono,
  },
});
