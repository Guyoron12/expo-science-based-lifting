import WeekDateSlider from "@/components/ui/WeekDateSlider";
import { hudColors, hudMotion, hudShadow, hudTypography, theme } from "@/theme";
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
  exerciseCount: number;
  totalSets: number;
  prCount: number;
  strengthScore: number;
  intensityTarget: string;
};

type NeonDripTextProps = {
  children: string | number;
  variant?: "title" | "metric";
};

function NeonDripText({ children, variant = "title" }: NeonDripTextProps) {
  return (
    <View style={styles.dripTextContainer}>
      <Text
        style={[
          variant === "title" ? styles.routineTitle : styles.metricValueHot,
        ]}
      >
        {children}
      </Text>
      <View pointerEvents="none" style={styles.dripRow}>
        <View style={[styles.drip, styles.dripTall]} />
        <View style={[styles.drip, styles.dripShort]} />
        <View style={[styles.drip, styles.dripDot]} />
      </View>
    </View>
  );
}

// type MetricCardProps = {
//   label: string;
//   value: string | number;
//   detail: string;
//   highlight?: boolean;
// };

// function MetricCard({
//   label,
//   value,
//   detail,
//   highlight = false,
// }: MetricCardProps) {
//   return (
//     <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
//       <Text style={styles.metricLabel}>{label}</Text>
//       {highlight ? (
//         <NeonDripText variant="metric">{value}</NeonDripText>
//       ) : (
//         <Text style={styles.metricValue}>{value}</Text>
//       )}
//       <Text style={styles.metricDetail}>{detail}</Text>
//     </View>
//   );
// }

function insightCopy(
  isRestDay: boolean,
  prCount: number,
  intensityTarget: string,
) {
  if (isRestDay) {
    return "Recovery preserves output. Keep the nervous system quiet and come back violent.";
  }

  if (prCount > 0) {
    return "PR signal detected. Hold form standards and chase repeatable overload, not chaos.";
  }

  return `Dose the set with ${intensityTarget}. High intent, clean reps, no wasted volume.`;
}

export default function WorkoutListHeader({
  selectedDate,
  routineNames,
  onSelectDate,
  isRestDay,
  isSkippedDay,
  routineName,
  routineDetailsText,
  // exerciseCount,
  // totalSets,
  prCount,
  // strengthScore,
  intensityTarget,
}: WorkoutListHeaderProps) {
  const restScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRestDay) return;
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(restScale, {
          toValue: 1.03,
          duration: hudMotion.slow,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(restScale, {
          toValue: 1,
          duration: hudMotion.slow,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, [isRestDay, restScale]);

  const displayRoutineName = isRestDay
    ? isSkippedDay
      ? "Skipped Day"
      : "Rest Day"
    : (routineName ?? "Unassigned Protocol");
  const protocolLabel = isRestDay
    ? "Recovery protocol"
    : "Hypertrophy protocol";

  return (
    <>
      <View style={styles.dateSliderContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>7-day protocol</Text>
          <Text style={styles.sectionTitle}>Lab Calendar</Text>
        </View>
        <WeekDateSlider
          selectedDate={selectedDate}
          routineNames={routineNames}
          onSelectDate={onSelectDate}
          onRoutineSelect={() => {}}
        />
      </View>

      <View style={styles.routineContainer}>
        <Animated.View
          style={[
            styles.todayCard,
            isRestDay && { transform: [{ scale: restScale }] },
          ]}
        >
          <View style={styles.cardGradientWash} />
          <View style={styles.heroTopLine}>
            <Text style={styles.sectionKicker}>Today's workout</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{protocolLabel}</Text>
            </View>
          </View>
          <NeonDripText>{displayRoutineName}</NeonDripText>
          <Text style={styles.routineDetails}>
            {isRestDay ? "Recovery protocol active" : routineDetailsText}
          </Text>
        </Animated.View>

        {/* <View style={styles.dashboardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>Progress</Text>
            <Text style={styles.sectionTitle}>Output Markers</Text>
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Strength score"
              value={isRestDay ? "--" : strengthScore}
              detail={isRestDay ? "Stand down" : "Projected session"}
              highlight={!isRestDay}
            />
            <MetricCard
              label="Volume"
              value={`${totalSets}`}
              detail={`${exerciseCount} exercises`}
            />
            <MetricCard
              label="PR flags"
              value={`${prCount}`}
              detail={prCount > 0 ? "Exploit cautiously" : "No spike"}
            />
          </View>
        </View> */}

        <View style={styles.insightCard}>
          <View style={styles.insightRail} />
          <View style={styles.insightCopy}>
            <Text style={styles.sectionKicker}>Insights</Text>
            <Text style={styles.insightTitle}>Science-based command</Text>
            <Text style={styles.insightBody}>
              {insightCopy(isRestDay, prCount, intensityTarget)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dateSliderContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: hudColors.border,
  },
  routineContainer: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  sectionKicker: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    fontWeight: "700",
    color: hudColors.accent,
    ...hudTypography.labelWide,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: hudColors.textPrimary,
    ...hudTypography.headingTight,
  },
  todayCard: {
    position: "relative",
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: hudColors.borderGreen,
    borderRadius: theme.radius.lg,
    backgroundColor: hudColors.surface,
    padding: theme.spacing.xl,
    overflow: "hidden",
    ...hudShadow.card,
  },
  cardGradientWash: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 180,
    height: 180,
    borderBottomLeftRadius: 180,
    backgroundColor: hudColors.surfaceGreenStrong,
  },
  heroTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: hudColors.border,
    backgroundColor: hudColors.backgroundTertiary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: hudColors.accent,
  },
  statusText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    fontWeight: "700",
    color: hudColors.textPrimary,
    ...hudTypography.labelWide,
  },
  dripTextContainer: {
    alignSelf: "flex-start",
  },
  dripRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
    marginTop: -2,
  },
  drip: {
    backgroundColor: hudColors.accent,
    shadowColor: hudColors.accent,
    shadowOpacity: 0.42,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dripTall: {
    width: 3,
    height: 12,
    borderRadius: 999,
  },
  dripShort: {
    width: 3,
    height: 7,
    borderRadius: 999,
  },
  dripDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  routineTitle: {
    ...theme.typography.display,
    color: hudColors.textPrimary,
    ...hudTypography.headingTight,
  },
  routineDetails: {
    ...theme.typography.body,
    color: hudColors.textSecondary,
    ...hudTypography.mono,
  },
  dashboardSection: {
    gap: theme.spacing.md,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 116,
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: hudColors.border,
    backgroundColor: hudColors.surfaceRaised,
  },
  metricCardHighlight: {
    borderColor: hudColors.borderGreenStrong,
    backgroundColor: hudColors.surfaceGreen,
    ...hudShadow.card,
  },
  metricLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    fontWeight: "700",
    color: hudColors.textSecondary,
    ...hudTypography.labelWide,
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: hudColors.textPrimary,
    ...hudTypography.mono,
  },
  metricValueHot: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    color: hudColors.accent,
    ...hudTypography.mono,
  },
  metricDetail: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: hudColors.textDim,
  },
  insightCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: hudColors.border,
    backgroundColor: hudColors.backgroundTertiary,
  },
  insightRail: {
    width: 3,
    borderRadius: 999,
    backgroundColor: hudColors.accentSecondary,
  },
  insightCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  insightTitle: {
    ...theme.typography.title,
    color: hudColors.textPrimary,
    ...hudTypography.headingTight,
  },
  insightBody: {
    ...theme.typography.body,
    color: hudColors.textSecondary,
  },
});
