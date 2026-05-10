import type { Exercise } from "@/app/(tabs)/workout/_workout.types";
import { isPersonalRecordText } from "@/services/functions/functions.service";
import { hudColors, hudMotion, hudShadow, theme } from "@/theme";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AnimatedCounter from "./animated-counter";

type ExerciseRowProps = {
  item: Exercise;
  index: number;
  onEdit: (exercise: Exercise) => void;
  onPRPulse: () => void;
  isEditing?: boolean;
  editValues?: {
    sets: string;
    repRangeMin: string;
    repRangeMax: string;
    rirMin: string;
    rirMax: string;
  };
  validationErrors?: {
    sets?: string;
    repRange?: string;
    rir?: string;
    image?: string;
  };
  onEditFieldChange?: (
    field: "sets" | "repRangeMin" | "repRangeMax" | "rirMin" | "rirMax",
    value: string,
  ) => void;
  onMoveLongPress?: () => void;
  isDragging?: boolean;
  onImagePress?: () => void;
  onRemove?: () => void;
};

export default function ExerciseRow({
  item,
  index,
  onEdit,
  onPRPulse,
  isEditing = false,
  editValues,
  validationErrors,
  onEditFieldChange,
  onMoveLongPress,
  isDragging = false,
  onImagePress,
  onRemove,
}: ExerciseRowProps) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslate = useRef(new Animated.Value(16)).current;
  const prScale = useRef(new Animated.Value(1)).current;
  const editWobble = useRef(new Animated.Value(0)).current;
  const repsMinInputRef = useRef<TextInput>(null);
  const rirMinInputRef = useRef<TextInput>(null);

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

    if (isPR && !isEditing) {
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
  }, [
    entryOpacity,
    entryTranslate,
    index,
    isEditing,
    isPR,
    onPRPulse,
    prScale,
  ]);

  useEffect(() => {
    if (!isEditing) {
      editWobble.stopAnimation();
      editWobble.setValue(0);
      return;
    }

    const wobbleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 35),
        Animated.timing(editWobble, {
          toValue: 1,
          duration: hudMotion.fast,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(editWobble, {
          toValue: -1,
          duration: hudMotion.fast,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(editWobble, {
          toValue: 0,
          duration: hudMotion.fast,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    wobbleLoop.start();
    return () => {
      wobbleLoop.stop();
      editWobble.setValue(0);
    };
  }, [editWobble, index, isEditing]);

  const wobbleRotation = editWobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-0.45deg", "0.45deg"],
  });

  return (
    <Animated.View
      style={[
        styles.exerciseRowContainer,
        isDragging && styles.exerciseRowContainerDragging,
        {
          opacity: entryOpacity,
          transform: [
            { translateY: entryTranslate },
            { scale: isDragging ? 1.02 : prScale },
            { rotate: isEditing ? wobbleRotation : "0deg" },
          ],
        },
      ]}
    >
      {isEditing ? (
        <View style={styles.exerciseRow}>
          <Pressable
            onPress={onImagePress}
            style={styles.exerciseImageContainer}
          >
            <Image source={{ uri: item.image }} style={styles.exerciseImage} />
            <View style={styles.exerciseIndexContainer}>
              <Text style={styles.exerciseIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.imageEditChip}>
              <Text style={styles.imageEditChipText}>Edit</Text>
            </View>
          </Pressable>
          <View style={styles.exerciseInfoContainer}>
            <View style={styles.exerciseNameRow}>
              <Text style={styles.exerciseName}>{item.exerciseName}</Text>
              <View style={styles.editActions}>
                <Pressable
                  onLongPress={onMoveLongPress}
                  delayLongPress={220}
                  style={({ pressed }) => [
                    styles.moveHandle,
                    pressed && styles.moveHandlePressed,
                  ]}
                >
                  <Text style={styles.moveHintText}>MOVE</Text>
                </Pressable>
                <Pressable onPress={onRemove} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>X</Text>
                </Pressable>
              </View>
            </View>
            <Text
              style={[
                styles.validationErrorText,
                styles.imageValidationErrorText,
                !validationErrors?.image && styles.validationErrorPlaceholder,
              ]}
              numberOfLines={1}
            >
              {validationErrors?.image ?? " "}
            </Text>
            <View style={styles.exercisePlannedStats}>
              <View
                style={[
                  styles.plannedStatsItem,
                  validationErrors?.sets && styles.plannedStatsItemError,
                ]}
              >
                <Text style={styles.itemLabel}>SETS</Text>
                <View style={styles.valueInputContainer}>
                  <TextInput
                    style={styles.plannedStatInput}
                    value={editValues?.sets ?? item.sets.toString()}
                    keyboardType="number-pad"
                    placeholder="1-99"
                    placeholderTextColor={hudColors.textMuted}
                    maxLength={2}
                    onChangeText={(value) => onEditFieldChange?.("sets", value)}
                  />
                </View>
                <Text
                  style={[
                    styles.validationErrorText,
                    !validationErrors?.sets &&
                      styles.validationErrorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {validationErrors?.sets ?? " "}
                </Text>
              </View>
              <View
                style={[
                  styles.plannedStatsItem,
                  validationErrors?.repRange && styles.plannedStatsItemError,
                ]}
              >
                <Text style={styles.itemLabel}>REPS</Text>
                <View style={styles.rangeInputsContainer}>
                  <TextInput
                    ref={repsMinInputRef}
                    style={styles.rangeInput}
                    value={
                      editValues?.repRangeMin ?? item.repRange.min.toString()
                    }
                    keyboardType="number-pad"
                    placeholder="8"
                    placeholderTextColor={hudColors.textMuted}
                    maxLength={3}
                    onChangeText={(value) =>
                      onEditFieldChange?.("repRangeMin", value)
                    }
                  />
                  <Text style={styles.rangeDash}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={
                      editValues?.repRangeMax ?? item.repRange.max.toString()
                    }
                    keyboardType="number-pad"
                    placeholder="12"
                    placeholderTextColor={hudColors.textMuted}
                    maxLength={3}
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === "Backspace" &&
                        !(editValues?.repRangeMax ?? "")
                      ) {
                        repsMinInputRef.current?.focus();
                      }
                    }}
                    onChangeText={(value) =>
                      onEditFieldChange?.("repRangeMax", value)
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.validationErrorText,
                    !validationErrors?.repRange &&
                      styles.validationErrorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {validationErrors?.repRange ?? " "}
                </Text>
              </View>
              <View
                style={[
                  styles.plannedStatsItem,
                  validationErrors?.rir && styles.plannedStatsItemError,
                ]}
              >
                <Text style={styles.itemLabel}>RIR</Text>
                <View style={styles.rangeInputsContainer}>
                  <TextInput
                    ref={rirMinInputRef}
                    style={styles.rangeInput}
                    value={editValues?.rirMin ?? item.rir.min.toString()}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={hudColors.textMuted}
                    maxLength={2}
                    onChangeText={(value) =>
                      onEditFieldChange?.("rirMin", value)
                    }
                  />
                  <Text style={styles.rangeDash}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={editValues?.rirMax ?? item.rir.max.toString()}
                    keyboardType="number-pad"
                    placeholder="3"
                    placeholderTextColor={hudColors.textMuted}
                    maxLength={2}
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === "Backspace" &&
                        !(editValues?.rirMax ?? "")
                      ) {
                        rirMinInputRef.current?.focus();
                      }
                    }}
                    onChangeText={(value) =>
                      onEditFieldChange?.("rirMax", value)
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.validationErrorText,
                    !validationErrors?.rir && styles.validationErrorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {validationErrors?.rir ?? " "}
                </Text>
              </View>
            </View>
            <View
              style={[styles.lastSessionItem, styles.lastSessionItemDisabled]}
            >
              <Text style={styles.itemLabel}>LAST SESSION</Text>
              <Text
                style={[
                  styles.itemValue,
                  styles.lastSessionValue,
                  styles.lastSessionValueDisabled,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.lastSession}
              </Text>
            </View>
          </View>
        </View>
      ) : (
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
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  exerciseRowContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  exerciseRowContainerDragging: {
    zIndex: 10,
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
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  moveHintText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    fontWeight: "700",
    color: hudColors.textSecondary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  moveHandle: {
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  moveHandlePressed: {
    opacity: 0.75,
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: hudColors.danger,
    backgroundColor: "rgba(255, 77, 77, 0.12)",
  },
  removeButtonText: {
    color: hudColors.danger,
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    fontWeight: "700",
  },
  imageEditChip: {
    position: "absolute",
    right: -4,
    bottom: -4,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: hudColors.surfaceRaised,
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
  },
  imageEditChipText: {
    color: hudColors.accent,
    fontSize: 9,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
    // minHeight: 96,
    justifyContent: "flex-start",
  },
  plannedStatsItemError: {
    borderColor: hudColors.danger,
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
  valueInputContainer: {
    height: 26,
    borderWidth: 1,
    borderColor: hudColors.borderGreen,
    borderRadius: theme.radius.xs,
    backgroundColor: hudColors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  plannedStatInput: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    fontWeight: "700" as const,
    color: hudColors.accent,
    textAlign: "center",
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 26,
  },
  rangeInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: hudColors.borderGreen,
    borderRadius: theme.radius.xs,
    backgroundColor: hudColors.backgroundSecondary,
    overflow: "hidden",
    height: 26,
  },
  rangeInput: {
    flex: 1,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    fontWeight: "700" as const,
    color: hudColors.accent,
    paddingVertical: 0,
    minWidth: 0,
    height: 26,
  },
  rangeDash: {
    color: hudColors.textSecondary,
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.xs,
  },
  validationErrorText: {
    color: hudColors.danger,
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    fontWeight: "700",
    minHeight: 12,
    lineHeight: 12,
  },
  validationErrorPlaceholder: {
    color: "transparent",
  },
  imageValidationErrorText: {
    marginTop: -theme.spacing.xs,
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
  lastSessionItemDisabled: {
    borderColor: hudColors.border,
    backgroundColor: hudColors.backgroundTertiary,
    opacity: 0.72,
  },
  lastSessionValueDisabled: {
    color: hudColors.textMuted,
  },
});
