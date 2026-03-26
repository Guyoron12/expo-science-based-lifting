import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { AppHeader } from "@/components/navigation/AppHeader";
import { useAuthStore } from "@/stores/auth.store";

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          borderTopColor: "#E5E7EB",
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
        },
        header: ({ options }) => (
          <AppHeader
            title={
              typeof options.title === "string"
                ? options.title
                : "Science Lifting"
            }
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout/index"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach/index"
        options={{
          title: "Coach",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
