import { theme } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProgressHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Progress</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    padding: theme.spacing.lg,
    borderBottomColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
});
