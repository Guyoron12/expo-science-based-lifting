import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/providers/AuthProvider";

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Science Based Lifting</Text>
      <Text style={styles.body}>Use tabs below to navigate.</Text>
      <Pressable onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    color: "#4B5563",
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
