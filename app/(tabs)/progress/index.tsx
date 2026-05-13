//TODO: This screen is a work in progress.
import { theme } from "@/theme";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProgressTab = "insights" | "progressive-overload";
type InsightImpact = "low" | "medium" | "high" | "SBL optimal";
type ImpactSortOrder = "highest-first" | "lowest-first";
type ProgressInsight = {
  id: string;
  title: string;
  metric: string;
  detail: string;
  scienceNote: string;
  muscleGroup: string;
  impact: InsightImpact;
};
type OverloadPoint = {
  weekLabel: string;
  load: number;
  reps: number;
  volume: number;
  hitTarget: boolean;
  isPr: boolean;
};
type OverloadExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  points: OverloadPoint[];
};

const IMPACT_SCORE: Record<InsightImpact, number> = {
  low: 1,
  medium: 2,
  high: 3,
  "SBL optimal": 4,
};

const INSIGHT_MOCK_DATA: ProgressInsight[] = [
  {
    id: "chest-e1rm",
    title: "Bench e1RM trend",
    metric: "+3.4%",
    detail: "Estimated 1RM has progressed over the last 3 exposures.",
    scienceNote: "Signal: e1RM trend + stable RIR at matched rep targets.",
    muscleGroup: "Chest",
    impact: "SBL optimal",
  },
  {
    id: "back-volume-density",
    title: "Back volume density",
    metric: "+11%",
    detail:
      "Useful back volume per session is increasing with no spillover fatigue.",
    scienceNote: "Signal: hard sets in MEV-MAV zone with consistent execution.",
    muscleGroup: "Back",
    impact: "high",
  },
  {
    id: "legs-proximity",
    title: "Legs proximity control",
    metric: "RIR 1.8 avg",
    detail:
      "Lower-body compounds are consistently landing near the target effort range.",
    scienceNote:
      "Signal: proximity to failure is controlled session to session.",
    muscleGroup: "Legs",
    impact: "high",
  },
  {
    id: "shoulders-stimulus",
    title: "Shoulder stimulus quality",
    metric: "14 hard sets",
    detail:
      "Weekly shoulder stimulus is accumulating without a drop in rep quality.",
    scienceNote:
      "Signal: volume landmarks and rep quality both trending positively.",
    muscleGroup: "Shoulders",
    impact: "medium",
  },
  {
    id: "arms-loading",
    title: "Arms loading progression",
    metric: "+2.1 kg",
    detail:
      "Average external load is rising on arm accessories at target reps.",
    scienceNote:
      "Signal: progressive overload achieved with stable technique pacing.",
    muscleGroup: "Arms",
    impact: "medium",
  },
  {
    id: "core-output",
    title: "Core output consistency",
    metric: "92% hit rate",
    detail:
      "Core sets are completed on schedule, but load progression is still gradual.",
    scienceNote: "Signal: adherence strong; overload stimulus is moderate.",
    muscleGroup: "Core",
    impact: "low",
  },
  {
    id: "chest-fatigue",
    title: "Chest fatigue management",
    metric: "No regressions",
    detail:
      "Top-set output remains stable despite higher weekly chest exposure.",
    scienceNote: "Signal: fatigue is managed while progression continues.",
    muscleGroup: "Chest",
    impact: "high",
  },
  {
    id: "back-technique",
    title: "Back technique stability",
    metric: "Bar path stable",
    detail: "Movement quality remains consistent as loading increases.",
    scienceNote:
      "Signal: technical consistency supports sustainable progression.",
    muscleGroup: "Back",
    impact: "medium",
  },
];

const MUSCLE_GROUP_FILTERS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

const OVERLOAD_MOCK_DATA: OverloadExercise[] = [
  {
    id: "bench-press",
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    points: [
      {
        weekLabel: "W1",
        load: 82.5,
        reps: 8,
        volume: 1980,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 85,
        reps: 8,
        volume: 2040,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W3",
        load: 87.5,
        reps: 7,
        volume: 2100,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 87.5,
        reps: 8,
        volume: 2240,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W5",
        load: 90,
        reps: 7,
        volume: 2160,
        hitTarget: false,
        isPr: false,
      },
      {
        weekLabel: "W6",
        load: 90,
        reps: 8,
        volume: 2304,
        hitTarget: true,
        isPr: true,
      },
    ],
  },
  {
    id: "weighted-pull-up",
    name: "Weighted Pull-Up",
    muscleGroup: "Back",
    points: [
      {
        weekLabel: "W1",
        load: 12.5,
        reps: 7,
        volume: 1050,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 15,
        reps: 7,
        volume: 1120,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W3",
        load: 15,
        reps: 8,
        volume: 1280,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 17.5,
        reps: 7,
        volume: 1225,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W5",
        load: 17.5,
        reps: 8,
        volume: 1400,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W6",
        load: 20,
        reps: 6,
        volume: 1200,
        hitTarget: false,
        isPr: false,
      },
    ],
  },
  {
    id: "high-bar-squat",
    name: "High-Bar Squat",
    muscleGroup: "Legs",
    points: [
      {
        weekLabel: "W1",
        load: 110,
        reps: 6,
        volume: 2640,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 112.5,
        reps: 6,
        volume: 2700,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W3",
        load: 115,
        reps: 6,
        volume: 2760,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 117.5,
        reps: 5,
        volume: 2350,
        hitTarget: false,
        isPr: false,
      },
      {
        weekLabel: "W5",
        load: 117.5,
        reps: 6,
        volume: 2820,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W6",
        load: 120,
        reps: 6,
        volume: 2880,
        hitTarget: true,
        isPr: true,
      },
    ],
  },
  {
    id: "standing-ohp",
    name: "Standing Overhead Press",
    muscleGroup: "Shoulders",
    points: [
      {
        weekLabel: "W1",
        load: 47.5,
        reps: 8,
        volume: 1140,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 50,
        reps: 8,
        volume: 1200,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W3",
        load: 50,
        reps: 9,
        volume: 1350,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 52.5,
        reps: 7,
        volume: 1102,
        hitTarget: false,
        isPr: false,
      },
      {
        weekLabel: "W5",
        load: 52.5,
        reps: 8,
        volume: 1260,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W6",
        load: 55,
        reps: 7,
        volume: 1155,
        hitTarget: true,
        isPr: true,
      },
    ],
  },
  {
    id: "ez-curl",
    name: "EZ-Bar Curl",
    muscleGroup: "Arms",
    points: [
      {
        weekLabel: "W1",
        load: 30,
        reps: 10,
        volume: 1500,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 32.5,
        reps: 10,
        volume: 1625,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W3",
        load: 32.5,
        reps: 11,
        volume: 1787,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 35,
        reps: 9,
        volume: 1575,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W5",
        load: 35,
        reps: 10,
        volume: 1750,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W6",
        load: 37.5,
        reps: 9,
        volume: 1687,
        hitTarget: false,
        isPr: false,
      },
    ],
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    muscleGroup: "Core",
    points: [
      {
        weekLabel: "W1",
        load: 42.5,
        reps: 12,
        volume: 2040,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W2",
        load: 45,
        reps: 12,
        volume: 2160,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W3",
        load: 45,
        reps: 13,
        volume: 2340,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W4",
        load: 47.5,
        reps: 11,
        volume: 2090,
        hitTarget: true,
        isPr: false,
      },
      {
        weekLabel: "W5",
        load: 50,
        reps: 11,
        volume: 2200,
        hitTarget: true,
        isPr: true,
      },
      {
        weekLabel: "W6",
        load: 50,
        reps: 12,
        volume: 2400,
        hitTarget: true,
        isPr: true,
      },
    ],
  },
];

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<ProgressTab>("insights");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [impactSortOrder, setImpactSortOrder] =
    useState<ImpactSortOrder>("highest-first");
  const [selectedExerciseId, setSelectedExerciseId] = useState("bench-press");
  const tabContentProgress = useRef(new Animated.Value(1)).current;
  const cardEntranceProgress = useRef(new Animated.Value(0)).current;
  const chartRevealProgress = useRef(new Animated.Value(0)).current;
  const selectedFilterPulse = useRef(new Animated.Value(0)).current;

  const rankedInsights = useMemo(() => {
    const filteredInsights =
      selectedMuscleGroup === "All"
        ? INSIGHT_MOCK_DATA
        : INSIGHT_MOCK_DATA.filter(
            (insight) => insight.muscleGroup === selectedMuscleGroup,
          );

    return [...filteredInsights].sort((a, b) => {
      const scoreDelta = IMPACT_SCORE[b.impact] - IMPACT_SCORE[a.impact];

      if (scoreDelta !== 0) {
        return impactSortOrder === "highest-first" ? scoreDelta : -scoreDelta;
      }

      return a.title.localeCompare(b.title);
    });
  }, [impactSortOrder, selectedMuscleGroup]);

  const featuredInsights = rankedInsights.slice(0, 2);
  const remainingInsights = rankedInsights.slice(2);

  const overloadExercises = useMemo(() => {
    return selectedMuscleGroup === "All"
      ? OVERLOAD_MOCK_DATA
      : OVERLOAD_MOCK_DATA.filter(
          (exercise) => exercise.muscleGroup === selectedMuscleGroup,
        );
  }, [selectedMuscleGroup]);

  useEffect(() => {
    if (
      overloadExercises.length > 0 &&
      !overloadExercises.some((exercise) => exercise.id === selectedExerciseId)
    ) {
      setSelectedExerciseId(overloadExercises[0].id);
    }
  }, [overloadExercises, selectedExerciseId]);

  const selectedExercise =
    overloadExercises.find((exercise) => exercise.id === selectedExerciseId) ??
    overloadExercises[0];

  const selectedExerciseStats = useMemo(() => {
    if (!selectedExercise) {
      return null;
    }

    const points = selectedExercise.points;
    const firstPoint = points[0];
    const latestPoint = points[points.length - 1];
    const totalPrs = points.filter((point) => point.isPr).length;
    const consistencyRatio =
      points.filter((point) => point.hitTarget).length / points.length;

    return {
      loadDelta: latestPoint.load - firstPoint.load,
      repsDelta: latestPoint.reps - firstPoint.reps,
      volumeDeltaPercent:
        ((latestPoint.volume - firstPoint.volume) / firstPoint.volume) * 100,
      totalPrs,
      consistencyPercent: consistencyRatio * 100,
      latestPoint,
    };
  }, [selectedExercise]);

  useEffect(() => {
    tabContentProgress.setValue(0);
    Animated.timing(tabContentProgress, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, selectedMuscleGroup]);

  useEffect(() => {
    cardEntranceProgress.setValue(0);
    Animated.timing(cardEntranceProgress, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [
    activeTab,
    selectedMuscleGroup,
    impactSortOrder,
    selectedExerciseId,
    cardEntranceProgress,
  ]);

  useEffect(() => {
    selectedFilterPulse.setValue(0);
    Animated.spring(selectedFilterPulse, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [selectedMuscleGroup, selectedFilterPulse]);

  useEffect(() => {
    if (activeTab !== "progressive-overload") {
      return;
    }
    chartRevealProgress.setValue(0);
    Animated.timing(chartRevealProgress, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [activeTab, selectedExerciseId, selectedMuscleGroup, chartRevealProgress]);

  const tabContentAnimatedStyle = {
    opacity: tabContentProgress,
    transform: [
      {
        translateY: tabContentProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  const getCardEntranceStyle = (index: number) => {
    const start = index * 0.08;
    const end = Math.min(start + 0.38, 1);

    return {
      opacity: cardEntranceProgress.interpolate({
        inputRange: [start, end, 1],
        outputRange: [0, 1, 1],
        extrapolate: "clamp",
      }),
      transform: [
        {
          translateY: cardEntranceProgress.interpolate({
            inputRange: [start, end, 1],
            outputRange: [10, 0, 0],
            extrapolate: "clamp",
          }),
        },
      ],
    };
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Progress overview</Text>
        <Text style={styles.heroTitle}>Current 4-week block</Text>
        <Text style={styles.heroSubtitle}>
          Track trendlines, loading consistency, and muscle-group output.
        </Text>
        <View style={styles.heroMetricsRow}>
          <View style={styles.heroMetricItem}>
            <Text style={styles.heroMetricValue}>18</Text>
            <Text style={styles.heroMetricLabel}>Sessions</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetricItem}>
            <Text style={styles.heroMetricValue}>86%</Text>
            <Text style={styles.heroMetricLabel}>Adherence</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetricItem}>
            <Text style={styles.heroMetricValue}>+42kg</Text>
            <Text style={styles.heroMetricLabel}>Total Load</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tabSwitcher}>
          <Pressable
            onPress={() => setActiveTab("insights")}
            style={[
              styles.tabButton,
              activeTab === "insights" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "insights" && styles.tabLabelActive,
              ]}
            >
              Insights
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("progressive-overload")}
            style={[
              styles.tabButton,
              activeTab === "progressive-overload" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "progressive-overload" && styles.tabLabelActive,
              ]}
            >
              Progressive Overload
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle groups</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {MUSCLE_GROUP_FILTERS.map((group) => {
            const isSelected = selectedMuscleGroup === group;
            return (
              <Pressable
                key={group}
                onPress={() => setSelectedMuscleGroup(group)}
                style={styles.filterChipPressable}
              >
                <Animated.View
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                    isSelected && {
                      transform: [
                        {
                          scale: selectedFilterPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.97, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                  >
                    {group}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Animated.View style={tabContentAnimatedStyle}>
        {activeTab === "insights" ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Featured insights</Text>
                <Text style={styles.sectionMeta}>Top 2 signals</Text>
              </View>
              <View style={styles.insightCardsColumn}>
                {featuredInsights.map((insight, index) => (
                  <Animated.View
                    key={insight.id}
                    style={[
                      styles.featuredInsightCard,
                      getCardEntranceStyle(index),
                    ]}
                  >
                    <View style={styles.insightCardHeader}>
                      <Text style={styles.rankBadge}>#{index + 1}</Text>
                      <Text
                        style={[
                          styles.impactBadge,
                          styles[getImpactBadgeStyle(insight.impact)],
                        ]}
                      >
                        {insight.impact}
                      </Text>
                    </View>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightValue}>{insight.metric}</Text>
                    <Text style={styles.insightDetail}>{insight.detail}</Text>
                    <Text style={styles.scienceNote}>
                      {insight.scienceNote}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Ranked insights</Text>
                <View style={styles.sortSwitcher}>
                  <Pressable
                    onPress={() => setImpactSortOrder("highest-first")}
                    style={[
                      styles.sortButton,
                      impactSortOrder === "highest-first" &&
                        styles.sortButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        impactSortOrder === "highest-first" &&
                          styles.sortButtonTextActive,
                      ]}
                    >
                      Highest
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setImpactSortOrder("lowest-first")}
                    style={[
                      styles.sortButton,
                      impactSortOrder === "lowest-first" &&
                        styles.sortButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        impactSortOrder === "lowest-first" &&
                          styles.sortButtonTextActive,
                      ]}
                    >
                      Lowest
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.insightCardsColumn}>
                {remainingInsights.length > 0 ? (
                  remainingInsights.map((insight, index) => (
                    <Animated.View
                      key={insight.id}
                      style={[
                        styles.insightCard,
                        getCardEntranceStyle(index + 2),
                      ]}
                    >
                      <View style={styles.insightCardHeader}>
                        <Text style={styles.rankLabel}>#{index + 3}</Text>
                        <Text
                          style={[
                            styles.impactBadge,
                            styles[getImpactBadgeStyle(insight.impact)],
                          ]}
                        >
                          {insight.impact}
                        </Text>
                      </View>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightValue}>{insight.metric}</Text>
                      <Text style={styles.insightDetail}>{insight.detail}</Text>
                      <Text style={styles.scienceNote}>
                        {insight.scienceNote}
                      </Text>
                    </Animated.View>
                  ))
                ) : (
                  <View style={styles.contentPlaceholder}>
                    <Text style={styles.placeholderTitle}>No insights yet</Text>
                    <Text style={styles.placeholderCopy}>
                      Try selecting another muscle group to review current
                      progress signals.
                    </Text>
                    <Text style={styles.placeholderMeta}>
                      Filter: {selectedMuscleGroup}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Select lift</Text>
                <Text style={styles.sectionMeta}>
                  {selectedMuscleGroup === "All"
                    ? "All muscle groups"
                    : selectedMuscleGroup}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {overloadExercises.map((exercise) => {
                  const isSelected = selectedExercise?.id === exercise.id;
                  return (
                    <Pressable
                      key={exercise.id}
                      onPress={() => setSelectedExerciseId(exercise.id)}
                      style={[
                        styles.exerciseChip,
                        isSelected && styles.exerciseChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.exerciseChipText,
                          isSelected && styles.exerciseChipTextSelected,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {selectedExercise && selectedExerciseStats ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Progress proof</Text>
                  <View style={styles.overloadStatGrid}>
                    <Animated.View
                      style={[styles.overloadStatCard, getCardEntranceStyle(0)]}
                    >
                      <Text style={styles.overloadStatLabel}>Load change</Text>
                      <Text style={styles.overloadStatValue}>
                        +{selectedExerciseStats.loadDelta.toFixed(1)} kg
                      </Text>
                    </Animated.View>
                    <Animated.View
                      style={[styles.overloadStatCard, getCardEntranceStyle(1)]}
                    >
                      <Text style={styles.overloadStatLabel}>Rep change</Text>
                      <Text style={styles.overloadStatValue}>
                        {selectedExerciseStats.repsDelta >= 0 ? "+" : ""}
                        {selectedExerciseStats.repsDelta} reps
                      </Text>
                    </Animated.View>
                    <Animated.View
                      style={[styles.overloadStatCard, getCardEntranceStyle(2)]}
                    >
                      <Text style={styles.overloadStatLabel}>
                        Volume change
                      </Text>
                      <Text style={styles.overloadStatValue}>
                        {selectedExerciseStats.volumeDeltaPercent >= 0
                          ? "+"
                          : ""}
                        {selectedExerciseStats.volumeDeltaPercent.toFixed(1)}%
                      </Text>
                    </Animated.View>
                    <Animated.View
                      style={[styles.overloadStatCard, getCardEntranceStyle(3)]}
                    >
                      <Text style={styles.overloadStatLabel}>PRs hit</Text>
                      <Text style={styles.overloadStatValue}>
                        {selectedExerciseStats.totalPrs}
                      </Text>
                    </Animated.View>
                    <Animated.View
                      style={[styles.overloadStatCard, getCardEntranceStyle(4)]}
                    >
                      <Text style={styles.overloadStatLabel}>Consistency</Text>
                      <Text style={styles.overloadStatValue}>
                        {selectedExerciseStats.consistencyPercent.toFixed(0)}%
                      </Text>
                    </Animated.View>
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.chartCard}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>6-week trend</Text>
                      <Text style={styles.sectionMeta}>
                        {selectedExercise.name}
                      </Text>
                    </View>
                    <View style={styles.chartLegend}>
                      <View style={styles.legendItem}>
                        <View style={styles.legendVolumeDot} />
                        <Text style={styles.legendText}>Volume</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={styles.legendLoadDot} />
                        <Text style={styles.legendText}>Load</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={styles.legendRepsDot} />
                        <Text style={styles.legendText}>Reps</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <Text style={styles.legendPrText}>PR</Text>
                      </View>
                    </View>

                    <View style={styles.trendColumns}>
                      {selectedExercise.points.map((point) => {
                        const volumeMax = Math.max(
                          ...selectedExercise.points.map((item) => item.volume),
                        );
                        const loadMin = Math.min(
                          ...selectedExercise.points.map((item) => item.load),
                        );
                        const loadMax = Math.max(
                          ...selectedExercise.points.map((item) => item.load),
                        );
                        const repsMin = Math.min(
                          ...selectedExercise.points.map((item) => item.reps),
                        );
                        const repsMax = Math.max(
                          ...selectedExercise.points.map((item) => item.reps),
                        );
                        const chartInnerHeight = 112;
                        const volumeHeight = Math.max(
                          (point.volume / volumeMax) * chartInnerHeight,
                          10,
                        );
                        const loadBottom =
                          ((point.load - loadMin) /
                            Math.max(loadMax - loadMin, 1)) *
                          chartInnerHeight;
                        const repsBottom =
                          ((point.reps - repsMin) /
                            Math.max(repsMax - repsMin, 1)) *
                          chartInnerHeight;

                        return (
                          <View
                            key={point.weekLabel}
                            style={styles.trendColumn}
                          >
                            <View style={styles.trendGraphSlot}>
                              {point.isPr ? (
                                <Text style={styles.prBadge}>PR</Text>
                              ) : null}
                              <Animated.View
                                style={[
                                  styles.volumeBar,
                                  {
                                    height: volumeHeight,
                                    transform: [
                                      {
                                        scaleY: chartRevealProgress.interpolate(
                                          {
                                            inputRange: [0, 1],
                                            outputRange: [0.2, 1],
                                          },
                                        ),
                                      },
                                    ],
                                    opacity: chartRevealProgress.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.25, 1],
                                    }),
                                  },
                                ]}
                              />
                              <Animated.View
                                style={[
                                  styles.loadMarker,
                                  {
                                    bottom: loadBottom,
                                    opacity: chartRevealProgress,
                                  },
                                ]}
                              />
                              <Animated.View
                                style={[
                                  styles.repsMarker,
                                  {
                                    bottom: repsBottom,
                                    opacity: chartRevealProgress,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.trendWeekLabel}>
                              {point.weekLabel}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.consistencyRow}>
                      {selectedExercise.points.map((point) => (
                        <View
                          key={`${point.weekLabel}-hit`}
                          style={styles.consistencyItem}
                        >
                          <View
                            style={[
                              styles.consistencyDot,
                              point.hitTarget
                                ? styles.consistencyDotHit
                                : styles.consistencyDotMiss,
                            ]}
                          />
                          <Text style={styles.consistencyLabel}>
                            {point.weekLabel}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.placeholderMeta}>
                      Consistency track: completed target sets per week.
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.section}>
                <View style={styles.contentPlaceholder}>
                  <Text style={styles.placeholderTitle}>No lifts found</Text>
                  <Text style={styles.placeholderCopy}>
                    This muscle group has no mock progression data yet.
                  </Text>
                  <Text style={styles.placeholderMeta}>
                    Filter: {selectedMuscleGroup}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function getImpactBadgeStyle(impact: InsightImpact) {
  switch (impact) {
    case "SBL optimal":
      return "impactBadgeOptimal";
    case "high":
      return "impactBadgeHigh";
    case "medium":
      return "impactBadgeMedium";
    case "low":
    default:
      return "impactBadgeLow";
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.hud.colors.borderGreen,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroLabel: {
    ...theme.typography.label,
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  heroMetricsRow: {
    marginTop: theme.spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.base,
  },
  heroMetricItem: {
    flex: 1,
    gap: 2,
  },
  heroMetricValue: {
    ...theme.typography.metric,
    color: theme.colors.text.primary,
  },
  heroMetricLabel: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  heroDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: theme.colors.border,
  },
  section: {
    gap: theme.spacing.base,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.base,
  },
  sectionMeta: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
  },
  insightCardsColumn: {
    gap: theme.spacing.base,
  },
  featuredInsightCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.hud.colors.borderGreen,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  insightCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  insightCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  rankBadge: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  rankLabel: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
  },
  impactBadge: {
    ...theme.typography.label,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  impactBadgeLow: {
    color: theme.colors.text.muted,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.card,
  },
  impactBadgeMedium: {
    color: theme.colors.semantic.info,
    borderColor: theme.colors.semantic.info,
    backgroundColor: theme.hud.colors.surfaceGreen,
  },
  impactBadgeHigh: {
    color: theme.colors.accent,
    borderColor: theme.colors.accent,
    backgroundColor: theme.hud.colors.surfaceGreen,
  },
  impactBadgeOptimal: {
    color: theme.colors.background.primary,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  insightTitle: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightValue: {
    ...theme.typography.metric,
    color: theme.colors.text.primary,
  },
  insightDetail: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  scienceNote: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  tabSwitcher: {
    padding: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.hud.colors.borderGreen,
  },
  tabLabel: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
  },
  tabLabelActive: {
    color: theme.colors.text.primary,
  },
  filterRow: {
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  filterChip: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  filterChipPressable: {
    borderRadius: theme.radius.sm,
  },
  filterChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.hud.colors.accentSoft,
  },
  filterChipText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  filterChipTextSelected: {
    color: theme.colors.text.primary,
  },
  sortSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 2,
    backgroundColor: theme.colors.background.secondary,
  },
  sortButton: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.background.card,
  },
  sortButtonText: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
  },
  sortButtonTextActive: {
    color: theme.colors.text.primary,
  },
  exerciseChip: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  exerciseChipSelected: {
    borderColor: theme.hud.colors.borderGreen,
    backgroundColor: theme.colors.background.card,
  },
  exerciseChipText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  exerciseChipTextSelected: {
    color: theme.colors.text.primary,
  },
  overloadStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.base,
  },
  overloadStatCard: {
    minWidth: "30%",
    flexGrow: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.base,
    gap: 4,
  },
  overloadStatLabel: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  overloadStatValue: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  chartCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.hud.colors.borderGreen,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.base,
  },
  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.base,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendVolumeDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.hud.colors.surfaceGreenStrong,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  legendLoadDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
  },
  legendRepsDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.semantic.info,
  },
  legendPrText: {
    ...theme.typography.label,
    color: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  legendText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  trendColumns: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  trendColumn: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  trendGraphSlot: {
    height: 132,
    width: "100%",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
    position: "relative",
  },
  volumeBar: {
    width: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.hud.colors.surfaceGreenStrong,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  loadMarker: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.background.primary,
  },
  repsMarker: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.semantic.info,
    borderWidth: 1,
    borderColor: theme.colors.background.primary,
  },
  prBadge: {
    ...theme.typography.label,
    position: "absolute",
    top: 4,
    color: theme.colors.background.primary,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  trendWeekLabel: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  consistencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  consistencyItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  consistencyDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  consistencyDotHit: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  consistencyDotMiss: {
    backgroundColor: theme.colors.semantic.warning,
    borderColor: theme.colors.semantic.warning,
  },
  consistencyLabel: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
  },
  contentPlaceholder: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  placeholderTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  placeholderCopy: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  placeholderMeta: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
});
