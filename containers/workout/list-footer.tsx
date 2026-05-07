import { theme } from "@/theme";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={styles.listFooter}>
      <Pressable
        style={[
          styles.listFooterButton,
          isRestDay && styles.listFooterButtonDisabled,
        ]}
        onPress={onStartWorkoutPress}
      >
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
    borderTopColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  listFooterButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#2F9BFF",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  listFooterButtonImage: {
    width: 20,
    height: 20,
  },
  listFooterButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#061428",
  },
  listFooterEditButtonText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    fontWeight: "400" as const,
    color: "#89A2BF",
  },
  listFooterButtonDisabled: {
    backgroundColor: theme.colors.disabled.bg,
    borderColor: "transparent",
  },
});
