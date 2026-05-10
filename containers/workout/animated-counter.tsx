import { hudMotion } from "@/theme";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  Text,
  TextStyle,
} from "react-native";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  duration?: number;
  style?: StyleProp<TextStyle>;
};

export default function AnimatedCounter({
  value,
  suffix = "",
  duration = hudMotion.normal,
  style,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.setValue(0);
    const listener = animatedValue.addListener(({ value: next }) => {
      setDisplayValue(Math.round(next));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, duration, value]);

  return (
    <Text style={style}>
      {displayValue}
      {suffix}
    </Text>
  );
}
