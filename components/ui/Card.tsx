import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { hudColors, hudShadow, theme } from "@/theme";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: hudColors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: hudColors.border,
    ...hudShadow.card,
  },
});
