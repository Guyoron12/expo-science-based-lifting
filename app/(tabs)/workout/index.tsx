import Loader from "@/components/ui/Loader";
import WorkoutHeader from "@/containers/headers/workout-header";
import ExerciseRow from "@/containers/workout/exercise-row";
import WorkoutListFooter from "@/containers/workout/list-footer";
import WorkoutListHeader from "@/containers/workout/list-header";
import fetchActiveSplit from "@/mockApi/workout.screen";
import {
  getRoutineByDate,
  isPersonalRecordText,
  startOfLocalDay,
  weekDatesFromMonday,
} from "@/services/functions/functions.service";
import { hudColors, hudMotion, theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import type { ActiveSplit, Exercise } from "./_workout.types";

type EditableField =
  | "sets"
  | "repRangeMin"
  | "repRangeMax"
  | "rirMin"
  | "rirMax";

type ExerciseDraftValues = {
  sets: string;
  repRangeMin: string;
  repRangeMax: string;
  rirMin: string;
  rirMax: string;
};

type ExerciseValidationErrors = {
  sets?: string;
  repRange?: string;
  rir?: string;
  image?: string;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
]);

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfLocalDay(new Date()),
  );
  const [isEditingPlannedWorkout, setIsEditingPlannedWorkout] = useState(false);
  const [editableExercises, setEditableExercises] = useState<Exercise[]>([]);
  const [exerciseDrafts, setExerciseDrafts] = useState<
    Record<number, ExerciseDraftValues>
  >({});
  const [exerciseValidationErrors, setExerciseValidationErrors] = useState<
    Record<number, ExerciseValidationErrors>
  >({});
  const [routineExerciseOverrides, setRoutineExerciseOverrides] = useState<
    Record<number, Exercise[]>
  >({});
  const pageOpacity = useRef(new Animated.Value(0)).current;
  const pageTranslateX = useRef(new Animated.Value(20)).current;
  const introFlashOpacity = useRef(new Animated.Value(0)).current;
  const prFlashOpacity = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(14)).current;
  const toastScale = useRef(new Animated.Value(0.96)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasTriggeredPrFlash = useRef(false);
  const {
    data: activeSplit,
    isLoading,
    error,
  } = useQuery<ActiveSplit>({
    queryKey: ["split"],
    queryFn: fetchActiveSplit as () => Promise<ActiveSplit>,
  });
  const subtitle = selectedDate.toLocaleDateString();

  const grainDots = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        key: i.toString(),
        top: (i * 31) % 760,
        left: (i * 53) % 360,
        size: i % 3 === 0 ? 2 : 1,
      })),
    [],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 1,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pageTranslateX, {
        toValue: 0,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(introFlashOpacity, {
          toValue: 0.28,
          duration: hudMotion.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(introFlashOpacity, {
          toValue: 0,
          duration: hudMotion.normal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [introFlashOpacity, pageOpacity, pageTranslateX]);

  const triggerPRFlash = useCallback(() => {
    if (hasTriggeredPrFlash.current) return;
    hasTriggeredPrFlash.current = true;
    Animated.sequence([
      Animated.timing(prFlashOpacity, {
        toValue: 0.55,
        duration: hudMotion.fast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(prFlashOpacity, {
        toValue: 0,
        duration: hudMotion.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [prFlashOpacity]);

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      toastOpacity.stopAnimation();
      toastTranslateY.stopAnimation();
      toastScale.stopAnimation();
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastOpacity.setValue(0);
      toastTranslateY.setValue(14);
      toastScale.setValue(0.96);

      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: hudMotion.fast,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: hudMotion.fast,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(toastScale, {
          toValue: 1,
          duration: hudMotion.fast,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      toastTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: hudMotion.normal,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: 10,
            duration: hudMotion.normal,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(toastScale, {
            toValue: 0.98,
            duration: hudMotion.normal,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setToastMessage(null);
        });
      }, 1400);
    },
    [toastOpacity, toastScale, toastTranslateY],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <WorkoutHeader
          title={activeSplit?.name ?? "Workout"}
          subtitle={subtitle}
        />
      ),
    });
  }, [navigation, activeSplit, subtitle]);

  const routine = activeSplit
    ? getRoutineByDate(activeSplit.routines, selectedDate)
    : undefined;
  const isSkippedDay = routine?.status === "skipped";
  const isRestDay = !routine || isSkippedDay;
  const exercises =
    !isRestDay && routine
      ? (routineExerciseOverrides[routine.id] ?? routine.exercises)
      : [];
  const displayedExercises =
    isEditingPlannedWorkout && !isRestDay ? editableExercises : exercises;
  const exerciseCount = displayedExercises.length;
  const totalSets = displayedExercises.reduce(
    (sum, exercise) => sum + exercise.sets,
    0,
  );
  const prCount = displayedExercises.filter((exercise) =>
    isPersonalRecordText(exercise.lastSession),
  ).length;
  const minRir = displayedExercises.length
    ? Math.min(...displayedExercises.map((exercise) => exercise.rir.min))
    : 0;
  const maxRir = displayedExercises.length
    ? Math.max(...displayedExercises.map((exercise) => exercise.rir.max))
    : 0;
  const intensityTarget = isRestDay ? "recovery" : `${minRir}-${maxRir} RIR`;
  const strengthScore = Math.min(
    99,
    Math.round(68 + totalSets * 1.8 + prCount * 6),
  );
  const weeklyRoutineNames = weekDatesFromMonday(selectedDate).map((day) => {
    const dayRoutine = getRoutineByDate(activeSplit?.routines ?? [], day);
    if (!dayRoutine || dayRoutine.status === "skipped") return "Rest";
    return dayRoutine.name;
  });
  const routineStatusLabel = !routine
    ? "Recovery"
    : routine.status === "completed"
      ? "Completed"
      : routine.status === "skipped"
        ? "Skipped"
        : "Planned";

  const routineDetailsText =
    !isRestDay && displayedExercises.length > 0
      ? `${routineStatusLabel} · ${displayedExercises.length} exercises · 60 minutes` //TODO: get previous duration from backend
      : `${routineStatusLabel} · No exercises · 0 minutes`;

  useEffect(() => {
    setIsEditingPlannedWorkout(false);
    setEditableExercises([]);
    setExerciseDrafts({});
    setExerciseValidationErrors({});
  }, [routine?.id, selectedDate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const cloneExercise = useCallback(
    (exercise: Exercise): Exercise => ({
      ...exercise,
      repRange: { ...exercise.repRange },
      rir: { ...exercise.rir },
      muscleGroups: [...exercise.muscleGroups],
    }),
    [],
  );

  const toDraftValues = useCallback(
    (exercise: Exercise): ExerciseDraftValues => ({
      sets: exercise.sets.toString(),
      repRangeMin: exercise.repRange.min.toString(),
      repRangeMax: exercise.repRange.max.toString(),
      rirMin: exercise.rir.min.toString(),
      rirMax: exercise.rir.max.toString(),
    }),
    [],
  );

  const parseWholeNumber = useCallback((rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return null;
    if (!/^\d+$/.test(trimmedValue)) return null;
    return Number(trimmedValue);
  }, []);

  const validateSetsValue = useCallback((rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return "Sets is required.";
    if (!/^\d+$/.test(trimmedValue)) return "Sets must be a whole number.";
    const sets = Number(trimmedValue);
    if (sets < 1 || sets > 99) return "Sets must be between 1 and 99.";
    return undefined;
  }, []);

  const validateRangeValues = useCallback(
    ({
      minRaw,
      maxRaw,
      label,
      maxValue,
    }: {
      minRaw: string;
      maxRaw: string;
      label: "reps" | "RIR";
      maxValue: number;
    }) => {
      const minValue = parseWholeNumber(minRaw);
      const maxValueParsed = parseWholeNumber(maxRaw);
      if (minValue === null || maxValueParsed === null) {
        return `${label} min and max are required whole numbers.`;
      }
      if (minValue > maxValueParsed) {
        return `${label} min cannot be greater than max.`;
      }
      if (maxValueParsed > maxValue) {
        return `${label} values cannot be greater than ${maxValue}.`;
      }
      return undefined;
    },
    [parseWholeNumber],
  );

  const validateDraftValues = useCallback(
    (draft: ExerciseDraftValues): ExerciseValidationErrors => ({
      sets: validateSetsValue(draft.sets),
      repRange: validateRangeValues({
        minRaw: draft.repRangeMin,
        maxRaw: draft.repRangeMax,
        label: "reps",
        maxValue: 999,
      }),
      rir: validateRangeValues({
        minRaw: draft.rirMin,
        maxRaw: draft.rirMax,
        label: "RIR",
        maxValue: 99,
      }),
    }),
    [validateRangeValues, validateSetsValue],
  );

  const upsertExercise = useCallback(
    (exerciseId: number, updater: (exercise: Exercise) => Exercise) => {
      setEditableExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId ? updater(exercise) : exercise,
        ),
      );
    },
    [],
  );

  const updateDraftField = useCallback(
    (exerciseId: number, field: EditableField, value: string) => {
      const sanitizedValue = value.replace(/[^\d]/g, "");
      setExerciseDrafts((prev) => {
        const currentDraft = prev[exerciseId] ?? {
          sets: "",
          repRangeMin: "",
          repRangeMax: "",
          rirMin: "",
          rirMax: "",
        };
        const nextDraft = {
          ...currentDraft,
          [field]: sanitizedValue,
        };
        const nextErrors = validateDraftValues(nextDraft);
        setExerciseValidationErrors((currentErrors) => ({
          ...currentErrors,
          [exerciseId]: {
            ...(currentErrors[exerciseId] ?? {}),
            sets: nextErrors.sets,
            repRange: nextErrors.repRange,
            rir: nextErrors.rir,
          },
        }));
        return {
          ...prev,
          [exerciseId]: nextDraft,
        };
      });
    },
    [validateDraftValues],
  );

  const getFileExtension = useCallback((pathOrFileName: string) => {
    const sanitizedPath = pathOrFileName.split("?")[0];
    const extension = sanitizedPath.split(".").pop();
    return extension?.toLowerCase() ?? "";
  }, []);

  const validateImageFile = useCallback(
    ({
      fileName,
      uri,
      mimeType,
      fileSize,
    }: {
      fileName?: string | null;
      uri: string;
      mimeType?: string | null;
      fileSize?: number | null;
    }) => {
      const extension = getFileExtension(fileName ?? uri);
      const hasExtension = extension.length > 0;
      if (hasExtension && !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
        return "Only JPG, JPEG, PNG, WEBP, GIF, HEIC or HEIF images are allowed.";
      }
      if (mimeType && !mimeType.startsWith("image/")) {
        return "Selected file must be an image.";
      }
      if (!mimeType && !hasExtension) {
        return "Could not verify image type. Please choose a JPG, PNG or WEBP image.";
      }
      if (fileSize && fileSize > MAX_IMAGE_SIZE_BYTES) {
        return "Image size must be 5MB or less.";
      }
      return undefined;
    },
    [getFileExtension],
  );

  const applySelectedImage = useCallback(
    (
      exerciseId: number,
      payload: {
        uri: string;
        fileName?: string | null;
        mimeType?: string | null;
        fileSize?: number | null;
      },
    ) => {
      const imageError = validateImageFile(payload);
      setExerciseValidationErrors((prev) => ({
        ...prev,
        [exerciseId]: {
          ...(prev[exerciseId] ?? {}),
          image: imageError,
        },
      }));
      if (imageError) return false;
      upsertExercise(exerciseId, (exercise) => ({
        ...exercise,
        image: payload.uri,
      }));
      return true;
    },
    [upsertExercise, validateImageFile],
  );

  const pickImageFromLibrary = useCallback(
    async (exerciseId: number) => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Photo library permission is needed to select an image.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled) return;
      const selectedAsset = result.assets[0];
      applySelectedImage(exerciseId, {
        uri: selectedAsset.uri,
        fileName: selectedAsset.fileName,
        mimeType: selectedAsset.mimeType,
        fileSize: selectedAsset.fileSize,
      });
    },
    [applySelectedImage],
  );

  const takePhoto = useCallback(
    async (exerciseId: number) => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Camera permission is needed to take a photo.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled) return;
      const selectedAsset = result.assets[0];
      applySelectedImage(exerciseId, {
        uri: selectedAsset.uri,
        fileName: selectedAsset.fileName,
        mimeType: selectedAsset.mimeType,
        fileSize: selectedAsset.fileSize,
      });
    },
    [applySelectedImage],
  );

  const pickImageFile = useCallback(
    async (exerciseId: number) => {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const selectedAsset = result.assets[0];
      applySelectedImage(exerciseId, {
        uri: selectedAsset.uri,
        fileName: selectedAsset.name,
        mimeType: selectedAsset.mimeType,
        fileSize: selectedAsset.size,
      });
    },
    [applySelectedImage],
  );

  const handleImagePress = useCallback(
    (exerciseId: number) => {
      Alert.alert("Replace Exercise Image", "Choose an image source", [
        {
          text: "Photo Library",
          onPress: () => {
            void pickImageFromLibrary(exerciseId);
          },
        },
        {
          text: "Take Photo",
          onPress: () => {
            void takePhoto(exerciseId);
          },
        },
        {
          text: "Browse Files",
          onPress: () => {
            void pickImageFile(exerciseId);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [pickImageFile, pickImageFromLibrary, takePhoto],
  );

  /*TODO: handle edit button press */
  const handleEditExercisePress = (exercise: Exercise) => {
    console.log("Edit exercise:", exercise);
  };

  const handleEditPlannedWorkoutPress = () => {
    if (isRestDay || isEditingPlannedWorkout) return;
    const clonedExercises = exercises.map(cloneExercise);
    const drafts = clonedExercises.reduce<Record<number, ExerciseDraftValues>>(
      (accumulator, exercise) => {
        accumulator[exercise.id] = toDraftValues(exercise);
        return accumulator;
      },
      {},
    );
    setEditableExercises(clonedExercises);
    setExerciseDrafts(drafts);
    setExerciseValidationErrors({});
    setIsEditingPlannedWorkout(true);
  };

  const handleRemoveExercisePress = (exerciseId: number) => {
    setEditableExercises((prev) =>
      prev.filter((exercise) => exercise.id !== exerciseId),
    );
    setExerciseDrafts((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
    setExerciseValidationErrors((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
  };

  const handleExerciseReorder = useCallback(
    (nextExercises: Exercise[]) => {
      setEditableExercises(nextExercises.map(cloneExercise));
    },
    [cloneExercise],
  );

  const handleDiscardPlannedWorkoutEdits = () => {
    setEditableExercises([]);
    setExerciseDrafts({});
    setExerciseValidationErrors({});
    setIsEditingPlannedWorkout(false);
    showToast("Changes discarded");
  };

  const collectValidationErrors = useCallback(() => {
    let hasErrors = false;
    const nextValidationErrors: Record<number, ExerciseValidationErrors> = {};

    for (const exercise of editableExercises) {
      const draftValues =
        exerciseDrafts[exercise.id] ?? toDraftValues(exercise);
      const fieldErrors = validateDraftValues(draftValues);
      const exerciseErrors = exerciseValidationErrors[exercise.id] ?? {};
      const mergedErrors: ExerciseValidationErrors = {
        sets: fieldErrors.sets,
        repRange: fieldErrors.repRange,
        rir: fieldErrors.rir,
        image: exerciseErrors.image,
      };

      if (Object.values(mergedErrors).some(Boolean)) {
        hasErrors = true;
      }
      nextValidationErrors[exercise.id] = mergedErrors;
    }

    setExerciseValidationErrors(nextValidationErrors);
    return { hasErrors, nextValidationErrors };
  }, [
    editableExercises,
    exerciseDrafts,
    exerciseValidationErrors,
    toDraftValues,
    validateDraftValues,
  ]);

  const buildExercisesFromDrafts = useCallback(() => {
    return editableExercises.map((exercise) => {
      const draftValues =
        exerciseDrafts[exercise.id] ?? toDraftValues(exercise);
      return {
        ...exercise,
        sets: Number(draftValues.sets.trim()),
        repRange: {
          min: Number(draftValues.repRangeMin.trim()),
          max: Number(draftValues.repRangeMax.trim()),
        },
        rir: {
          min: Number(draftValues.rirMin.trim()),
          max: Number(draftValues.rirMax.trim()),
        },
      };
    });
  }, [editableExercises, exerciseDrafts, toDraftValues]);

  const handleSavePlannedWorkoutEdits = () => {
    if (!routine) return;
    const { hasErrors } = collectValidationErrors();
    if (hasErrors) {
      Alert.alert(
        "Validation errors",
        "Please fix invalid fields before saving.",
      );
      return;
    }

    const nextExercises = buildExercisesFromDrafts();

    Alert.alert(
      "Save Planned Workout",
      "Where do you want to save these changes?",
      [
        {
          text: "Current Session",
          onPress: () => {
            setRoutineExerciseOverrides((prev) => ({
              ...prev,
              [routine.id]: nextExercises.map(cloneExercise),
            }));
            setEditableExercises(nextExercises.map(cloneExercise));
            setIsEditingPlannedWorkout(false);
            showToast("Workout saved for this session");
          },
        },
        {
          text: "Save Permanently",
          onPress: () => {
            setRoutineExerciseOverrides((prev) => ({
              ...prev,
              [routine.id]: nextExercises.map(cloneExercise),
            }));
            setEditableExercises(nextExercises.map(cloneExercise));
            setIsEditingPlannedWorkout(false);
            showToast("Workout saved permanently");
            // TODO: Persist permanent planned workout updates once backend mutation is available.
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleAddExercisePress = () => {
    // TODO: Open add exercise flow after planned-workout editor backend contract is defined.
  };

  // NOTE: Keep all early returns after hook declarations
  // to preserve hook call order across renders.
  if (isLoading) {
    return (
      <View style={styles.screenContainer}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!activeSplit) {
    return <Text>No active split</Text>;
  }

  return (
    <View style={styles.screenContainer}>
      <View pointerEvents="none" style={styles.scanlineLayer}>
        {Array.from({ length: 70 }).map((_, i) => (
          <View key={`line-${i}`} style={[styles.scanline, { top: i * 14 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={styles.grainLayer}>
        {grainDots.map((dot) => (
          <View
            key={dot.key}
            style={[
              styles.grainDot,
              {
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
              },
            ]}
          />
        ))}
      </View>
      <Animated.View
        style={[
          styles.listContainer,
          { opacity: pageOpacity, transform: [{ translateX: pageTranslateX }] },
        ]}
      >
        {isEditingPlannedWorkout ? (
          <DraggableFlatList
            style={styles.list}
            data={displayedExercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, getIndex, drag, isActive }) => (
              <ExerciseRow
                item={item}
                index={getIndex() ?? 0}
                onEdit={handleEditExercisePress}
                onPRPulse={triggerPRFlash}
                isEditing
                isDragging={isActive}
                onMoveLongPress={drag}
                editValues={exerciseDrafts[item.id]}
                validationErrors={exerciseValidationErrors[item.id]}
                onEditFieldChange={(field, value) =>
                  updateDraftField(item.id, field, value)
                }
                onImagePress={() => handleImagePress(item.id)}
                onRemove={() => handleRemoveExercisePress(item.id)}
              />
            )}
            onDragEnd={({ data }) => handleExerciseReorder(data)}
            ListHeaderComponent={
              <WorkoutListHeader
                selectedDate={selectedDate}
                routineNames={weeklyRoutineNames}
                onSelectDate={setSelectedDate}
                isRestDay={isRestDay}
                isSkippedDay={isSkippedDay}
                routineName={routine?.name}
                routineDetailsText={routineDetailsText}
                exerciseCount={exerciseCount}
                totalSets={totalSets}
                prCount={prCount}
                strengthScore={strengthScore}
                intensityTarget={intensityTarget}
              />
            }
            ListFooterComponent={
              <View style={styles.editListFooter}>
                <Pressable
                  onPress={handleAddExercisePress}
                  style={styles.addExerciseButton}
                >
                  <Text style={styles.addExerciseButtonText}>Add exercise</Text>
                </Pressable>
              </View>
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            containerStyle={styles.list}
          />
        ) : (
          <FlatList
            style={styles.list}
            data={displayedExercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <ExerciseRow
                item={item}
                index={index}
                onEdit={handleEditExercisePress}
                onPRPulse={triggerPRFlash}
                editValues={exerciseDrafts[item.id]}
                validationErrors={exerciseValidationErrors[item.id]}
                onEditFieldChange={(field, value) =>
                  updateDraftField(item.id, field, value)
                }
                onImagePress={() => handleImagePress(item.id)}
                onRemove={() => handleRemoveExercisePress(item.id)}
              />
            )}
            ListHeaderComponent={
              <WorkoutListHeader
                selectedDate={selectedDate}
                routineNames={weeklyRoutineNames}
                onSelectDate={setSelectedDate}
                isRestDay={isRestDay}
                isSkippedDay={isSkippedDay}
                routineName={routine?.name}
                routineDetailsText={routineDetailsText}
                exerciseCount={exerciseCount}
                totalSets={totalSets}
                prCount={prCount}
                strengthScore={strengthScore}
                intensityTarget={intensityTarget}
              />
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </Animated.View>
      {isEditingPlannedWorkout && (
        <View style={styles.editActionsContainer}>
          <Pressable
            onPress={handleDiscardPlannedWorkoutEdits}
            style={[styles.editActionButton, styles.editActionDiscardButton]}
          >
            <Text style={styles.editActionDiscardText}>Discard changes</Text>
          </Pressable>
          <Pressable
            onPress={handleSavePlannedWorkoutEdits}
            style={[styles.editActionButton, styles.editActionSaveButton]}
          >
            <Text style={styles.editActionSaveText}>Save changes</Text>
          </Pressable>
        </View>
      )}
      {toastMessage && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastContainer,
            isEditingPlannedWorkout && styles.toastContainerEditing,
            {
              opacity: toastOpacity,
              transform: [
                { translateY: toastTranslateY },
                { scale: toastScale },
              ],
            },
          ]}
        >
          <View style={styles.toastBubble}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
      <WorkoutListFooter
        isRestDay={isRestDay}
        isEditingPlannedWorkout={isEditingPlannedWorkout}
        onEditPlannedWorkoutPress={handleEditPlannedWorkoutPress}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.flashFrame, { opacity: introFlashOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.prFlash, { opacity: prFlashOpacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: hudColors.backgroundPrimary,
  },
  listContainer: {
    flex: 1,
  },
  scanlineLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: hudColors.scanline,
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  grainDot: {
    position: "absolute",
    borderRadius: 1,
    backgroundColor: hudColors.grain,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  editListFooter: {
    paddingHorizontal: theme.spacing.lg,
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
    backgroundColor: hudColors.accentSecondary,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  addExerciseButtonText: {
    color: hudColors.textPrimary,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  editActionsContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  editActionButton: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editActionDiscardButton: {
    borderColor: hudColors.border,
    backgroundColor: hudColors.surfaceRaised,
  },
  editActionSaveButton: {
    borderColor: hudColors.accentSoft,
    backgroundColor: hudColors.accent,
  },
  editActionDiscardText: {
    color: hudColors.textSecondary,
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  editActionSaveText: {
    color: hudColors.textInverse,
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 118,
    alignItems: "center",
    zIndex: 30,
  },
  toastContainerEditing: {
    bottom: 168,
  },
  toastBubble: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: hudColors.borderGreenStrong,
    backgroundColor: hudColors.surfaceRaised,
    shadowColor: hudColors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  toastText: {
    color: hudColors.accent,
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  flashFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: hudColors.accent,
    backgroundColor: hudColors.flash,
  },
  prFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hudColors.flash,
  },
});
