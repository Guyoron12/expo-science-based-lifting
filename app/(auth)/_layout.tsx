import { Redirect, Slot } from "expo-router";

import { useAuthStore } from "@/stores/auth.store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}
