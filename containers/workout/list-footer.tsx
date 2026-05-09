import { hudColors, hudTypography, theme } from "@/theme";
import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

type WorkoutListFooterProps = {
  isRestDay: boolean;
  onStartWorkoutPress?: () => void;
  onEditPlannedWorkoutPress?: () => void;
};

export default function WorkoutListFooter({
  isRestDay,
  onStartWorkoutPress, //TODO: handle start workout press
  onEditPlannedWorkoutPress, //TODO: handle edit planned workout press
}: WorkoutListFooterProps) {
  const shimmerX = useRef(new Animated.Value(-180)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 340,
        duration: 1600,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerX]);

  return (
    <View style={styles.listFooter}>
      <Pressable
        style={[
          styles.listFooterButton,
          isRestDay && styles.listFooterButtonDisabled,
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
        <Text style={styles.listFooterButtonText}>Start Workout</Text>
      </Pressable>
      <Pressable onPress={onEditPlannedWorkoutPress}>
        <Text style={styles.listFooterEditButtonText}>
          Edit planned workout
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
    backgroundColor: hudColors.backgroundPrimary,
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
    borderColor: hudColors.accentHot,
  },
  shimmer: {
    position: "absolute",
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    left: -120,
    top: -45,
  },
  listFooterButtonImage: {
    width: 20,
    height: 20,
    tintColor: "#042011",
  },
  listFooterButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#042011",
    ...hudTypography.labelWide,
  },
  listFooterEditButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    fontWeight: "700" as const,
    color: hudColors.textMuted,
    ...hudTypography.labelWide,
  },
  listFooterButtonDisabled: {
    backgroundColor: hudColors.surfaceStrong,
    borderColor: hudColors.border,
  },
});
