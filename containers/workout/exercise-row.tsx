import type { Exercise } from "@/app/(tabs)/workout/workout.types";
import { isPersonalRecordText } from "@/services/functions/functions.service";
import { hudColors, hudMotion, hudShadow, theme } from "@/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from "react-native";

import AnimatedCounter from "./animated-counter";

type ExerciseRowProps = {
  item: Exercise;
  index: number;
  onEdit: (exercise: Exercise) => void;
  onPRPulse: () => void;
};

export default function ExerciseRow({
  item,
  index,
  onEdit,
  onPRPulse,
}: ExerciseRowProps) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslate = useRef(new Animated.Value(16)).current;
  const prScale = useRef(new Animated.Value(1)).current;

  const isPR = isPersonalRecordText(item.lastSession);

  useEffect(() => {
    const staggerDelay = index * hudMotion.revealStagger;

    const animations: Animated.CompositeAnimation[] = [
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

const styles = StyleSheet.create({
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
});
