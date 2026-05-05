import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "@/theme";

const CARD_GAP = 12;
const SCROLL_EDGE_PADDING = 16;
const CLIPPED_CARD_OPACITY = 0.65;
const VISIBILITY_EPS = 2;
const SCROLL_THROTTLE_MS = 32;

const COLORS = {
  cardBg: "#0F1724",
  cardBgSelected: "#2F9BFF",
  border: "rgba(255, 255, 255, 0.176)",
  text: "#E6EEF8",
  textSelected: "#061428",
} as const;

// ─── pure helpers ────────────────────────────────────────────────────────────

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function weekDaysFromMonday(anchor: Date): Date[] {
  const base = startOfLocalDay(anchor);
  const day = base.getDay();
  base.setDate(base.getDate() + (day === 0 ? -6 : 1 - day)); // rewind to Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

function cardLeftEdge(index: number, widths: (number | undefined)[]): number {
  let x = SCROLL_EDGE_PADDING;
  for (let i = 0; i < index; i++) x += (widths[i] as number) + CARD_GAP;
  return x;
}

function isCardFullyVisible(
  index: number,
  widths: (number | undefined)[],
  scrollX: number,
  viewportWidth: number,
): boolean {
  const w = widths[index];
  if (!w || viewportWidth <= 0) return true;
  const left = cardLeftEdge(index, widths);
  return (
    left >= scrollX - VISIBILITY_EPS &&
    left + w <= scrollX + viewportWidth + VISIBILITY_EPS
  );
}

function routineLabelAt(
  routineNames: (string | null | undefined)[] | undefined,
  index: number,
): string {
  const raw = routineNames?.[index];
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : "Rest";
}

function weekdayLabel(day: Date): string {
  return day.toLocaleDateString(undefined, { weekday: "long" });
}

// ─── component ───────────────────────────────────────────────────────────────

type WeekDateSliderProps = {
  selectedDate: Date;
  routineNames?: (string | null | undefined)[];
  onSelectDate: (date: Date) => void;
  onRoutineSelect: (index: number) => void;
};

export default function WeekDateSlider({
  selectedDate,
  routineNames,
  onSelectDate,
  onRoutineSelect,
}: WeekDateSliderProps) {
  const days = useRef(weekDaysFromMonday(new Date())).current;

  const scrollRef = useRef<ScrollView>(null);
  const cardWidths = useRef<(number | undefined)[]>(Array(7).fill(undefined));
  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const scrollXRef = useRef(0);
  const scrollThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allWidthsReadyRef = useRef(false);

  // Single render-trigger for opacity recalculation after scroll/layout changes
  const [renderKey, setRenderKey] = useState(0);
  const bump = useCallback(() => setRenderKey((n) => n + 1), []);

  const selectedIndex = days.findIndex((d) => sameCalendarDay(d, selectedDate));

  // ── scrolling ──────────────────────────────────────────────────────────────

  const scrollToCenterIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const vw = viewportWidthRef.current;
    const cw = contentWidthRef.current;
    if (!allWidthsReadyRef.current || vw <= 0) return;

    const cardW = cardWidths.current[index] as number;
    const left = cardLeftEdge(index, cardWidths.current);
    const target = Math.max(0, Math.min(left + cardW / 2 - vw / 2, cw - vw));

    scrollRef.current.scrollTo({ x: target, animated: true });
    scrollXRef.current = target;
  }, []);

  // Center on the selected card once all widths are measured
  const onCardLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      cardWidths.current[index] = e.nativeEvent.layout.width;
      if (allWidthsReadyRef.current) return;
      if (cardWidths.current.every((w) => w != null && w > 0)) {
        allWidthsReadyRef.current = true;
        requestAnimationFrame(() => {
          if (selectedIndex >= 0) scrollToCenterIndex(selectedIndex);
          bump();
        });
      }
    },
    [selectedIndex, scrollToCenterIndex, bump],
  );

  const onScrollViewLayout = useCallback(
    (e: LayoutChangeEvent) => {
      viewportWidthRef.current = e.nativeEvent.layout.width;
      bump();
    },
    [bump],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollXRef.current = e.nativeEvent.contentOffset.x;
      if (scrollThrottleRef.current != null) return;
      scrollThrottleRef.current = setTimeout(() => {
        scrollThrottleRef.current = null;
        bump();
      }, SCROLL_THROTTLE_MS);
    },
    [bump],
  );

  const flushScroll = useCallback(() => bump(), [bump]);

  useEffect(
    () => () => {
      if (scrollThrottleRef.current != null)
        clearTimeout(scrollThrottleRef.current);
    },
    [],
  );

  // ── press ──────────────────────────────────────────────────────────────────

  const handleCardPress = useCallback(
    (day: Date, index: number) => {
      onSelectDate(startOfLocalDay(day));
      onRoutineSelect(index);
      if (
        allWidthsReadyRef.current &&
        !isCardFullyVisible(
          index,
          cardWidths.current,
          scrollXRef.current,
          viewportWidthRef.current,
        )
      ) {
        scrollToCenterIndex(index);
      }
    },
    [onSelectDate, scrollToCenterIndex],
  );

  // ── render ─────────────────────────────────────────────────────────────────

  const vw = viewportWidthRef.current;
  const sx = scrollXRef.current;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onLayout={onScrollViewLayout}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onScrollEndDrag={flushScroll}
      onMomentumScrollEnd={flushScroll}
      onContentSizeChange={(width) => {
        contentWidthRef.current = width;
      }}
      contentContainerStyle={styles.scrollContent}
    >
      {days.map((day, index) => {
        const isSelected = sameCalendarDay(day, selectedDate);
        const routineLabel = routineLabelAt(routineNames, index);
        const dayLabel = weekdayLabel(day);
        const fullyVisible =
          vw <= 0 || isCardFullyVisible(index, cardWidths.current, sx, vw);

        return (
          <Pressable
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            accessibilityRole="button"
            accessibilityLabel={`${dayLabel}, ${routineLabel}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => handleCardPress(day, index)}
            onLayout={(e) => onCardLayout(index, e)}
            style={({ pressed }) => [
              styles.card,
              isSelected ? styles.cardSelected : styles.cardDefault,
              index < 6 && styles.cardSpacing,
              {
                opacity:
                  pressed && !isSelected
                    ? (fullyVisible ? 1 : CLIPPED_CARD_OPACITY) * 0.92
                    : fullyVisible
                      ? 1
                      : CLIPPED_CARD_OPACITY,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.daySlot,
                  isSelected ? styles.textSelected : styles.textDefault,
                ]}
              >
                {dayLabel}
              </Text>
              <Text
                style={[
                  styles.routineName,
                  isSelected ? styles.textSelected : styles.textDefault,
                ]}
              >
                {routineLabel}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingLeft: SCROLL_EDGE_PADDING,
    paddingRight: SCROLL_EDGE_PADDING,
  },
  card: {
    paddingLeft: 16,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 38.75,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
  },
  cardSpacing: {
    marginRight: CARD_GAP,
  },
  cardDefault: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
  },
  cardSelected: {
    backgroundColor: COLORS.cardBgSelected,
    borderColor: COLORS.cardBgSelected,
  },
  daySlot: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  routineName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  textDefault: {
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.textSelected,
  },
});
