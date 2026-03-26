import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 92,
    paddingTop: 42,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
});
