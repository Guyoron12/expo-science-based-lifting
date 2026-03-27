import { Stack } from "expo-router";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/services/api.service";
import { useAuthStore } from "@/stores/auth.store";

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
}
