import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function mondayOfWeekContaining(d: Date): Date {
  const date = startOfLocalDay(d);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return date;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function calendarDaysApart(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round(Math.abs(ua - ub) / 86400000);
}

function weekDaysForDate(anchor: Date): Date[] {
  const monday = mondayOfWeekContaining(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
}

type WeekDateSliderProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function WeekDateSlider({
  selectedDate,
  onSelectDate,
}: WeekDateSliderProps) {
  const today = startOfLocalDay(new Date());
  const days = weekDaysForDate(today);

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const isSelected = sameCalendarDay(day, selectedDate);
        const isToday = sameCalendarDay(day, today);
        const distanceFromToday = calendarDaysApart(day, today);
        const proximityOpacity = Math.max(0.42, 1 - distanceFromToday * 0.11);

        return (
          <Pressable
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            accessibilityRole="button"
            accessibilityLabel={`${WEEKDAY_LABELS[index]} ${day.getDate()}, ${day.getFullYear()}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDate(startOfLocalDay(day))}
            style={({ pressed }) => [
              styles.cell,
              {
                opacity: isSelected
                  ? 1
                  : pressed
                    ? Math.min(1, proximityOpacity + 0.12)
                    : proximityOpacity,
              },
              isSelected && styles.cellSelected,
              isToday && !isSelected && styles.cellTodayOutline,
            ]}
          >
            <Text
              style={[styles.weekday, isSelected && styles.weekdaySelected]}
            >
              {WEEKDAY_LABELS[index]}
            </Text>
            <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
              {day.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cellSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  cellTodayOutline: {
    borderColor: theme.colors.border,
  },
  weekday: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  weekdaySelected: {
    color: "rgba(255,255,255,0.92)",
  },
  dayNum: {
    ...theme.typography.metric,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  dayNumSelected: {
    color: "#FFFFFF",
  },
});
