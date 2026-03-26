import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/providers/AuthProvider";

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.body}>Backend auth will be connected later.</Text>
      <Pressable onPress={login} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
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
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    marginTop: 8,
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
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
