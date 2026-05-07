import WeekDateSlider from "@/components/ui/WeekDateSlider";
import { theme } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

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
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>
              {isSkippedDay ? "Skipped Day" : "Rest Day"}
            </Text>
          </View>
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
});
