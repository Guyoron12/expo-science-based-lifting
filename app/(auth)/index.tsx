import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/auth.store";
import { theme } from "@/theme";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.body}>Backend auth will be connected later.</Text>
      </Card>
      <Button label="Continue" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text.primary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
