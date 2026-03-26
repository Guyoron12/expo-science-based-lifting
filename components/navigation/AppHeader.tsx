import { StyleSheet, Text, View } from "react-native";

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
    borderBottomColor: "#1F2937",
    backgroundColor: "#111827",
    justifyContent: "center",
  },
  title: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
  },
});
