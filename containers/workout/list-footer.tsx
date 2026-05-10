import { hudColors, hudMotion, hudShadow, theme } from "@/theme";
import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

type WorkoutListFooterProps = {
  isRestDay: boolean;
  isEditingPlannedWorkout?: boolean;
  onStartWorkoutPress?: () => void;
  onEditPlannedWorkoutPress?: () => void;
};

export default function WorkoutListFooter({
  isRestDay,
  isEditingPlannedWorkout = false,
  onStartWorkoutPress, //TODO: handle start workout press
  onEditPlannedWorkoutPress, //TODO: handle edit planned workout press
}: WorkoutListFooterProps) {
  const shimmerX = useRef(new Animated.Value(-180)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.22)).current;

  useEffect(() => {
    if (isRestDay) {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 340,
        duration: hudMotion.slow,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.025,
            duration: hudMotion.slow,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: hudMotion.slow,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.34,
            duration: hudMotion.slow,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.16,
            duration: hudMotion.slow,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    shimmerLoop.start();
    pulseLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [isRestDay, pulseOpacity, pulseScale, shimmerX]);

  return (
    <View style={styles.listFooter}>
      <Animated.View
        style={[
          styles.footerButtonShell,
          !isRestDay && { transform: [{ scale: pulseScale }] },
        ]}
      >
        {!isRestDay && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseHalo,
              {
                opacity: pulseOpacity,
              },
            ]}
          />
        )}
        <Pressable
          disabled={isRestDay}
          style={({ pressed }) => [
            styles.listFooterButton,
            isRestDay && styles.listFooterButtonDisabled,
            pressed && !isRestDay && styles.listFooterButtonPressed,
          ]}
          onPress={onStartWorkoutPress}
        >
          {!isRestDay && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerX }, { rotate: "18deg" }],
                },
              ]}
            />
          )}
          <Image
            source={require("@/assets/images/start-workout-icon.png")}
            style={styles.listFooterButtonImage}
          />
          <Text style={styles.listFooterButtonText}>
            {isRestDay ? "Recovery Locked" : "Start Workout"}
          </Text>
        </Pressable>
      </Animated.View>
      <Pressable
        onPress={onEditPlannedWorkoutPress}
        style={({ pressed }) => [
          styles.listFooterEditButton,
          isEditingPlannedWorkout && styles.listFooterEditButtonActive,
          pressed && styles.listFooterEditButtonPressed,
        ]}
      >
        <Text style={styles.listFooterEditButtonText}>
          {isEditingPlannedWorkout ? "Editing planned workout" : "Edit planned workout"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listFooter: {
    paddingBottom: 32,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: hudColors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: hudColors.backgroundSecondary,
  },
  footerButtonShell: {
    width: "100%",
  },
  pulseHalo: {
    position: "absolute",
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    borderRadius: theme.radius.lg,
    backgroundColor: hudColors.accentGlow,
  },
  listFooterButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    backgroundColor: hudColors.accent,
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: hudColors.accentSoft,
    ...hudShadow.glow,
  },
  listFooterButtonPressed: {
    transform: [{ scale: hudMotion.pressScale }],
  },
  shimmer: {
    position: "absolute",
    width: 120,
    height: 120,
    backgroundColor: hudColors.shine,
    left: -120,
    top: -45,
  },
  listFooterButtonImage: {
    width: 20,
    height: 20,
    tintColor: hudColors.textInverse,
  },
  listFooterButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700" as const,
    color: hudColors.textInverse,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  },
  listFooterEditButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    fontWeight: "700" as const,
    color: hudColors.textSecondary,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  },
  listFooterEditButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  listFooterEditButtonPressed: {
    opacity: 0.9,
  },
  listFooterEditButtonActive: {
    backgroundColor: hudColors.surfaceGreen,
    borderColor: hudColors.borderGreenStrong,
  },
  listFooterButtonDisabled: {
    backgroundColor: hudColors.surfaceGreen,
    borderColor: hudColors.border,
    shadowOpacity: 0,
  },
});
