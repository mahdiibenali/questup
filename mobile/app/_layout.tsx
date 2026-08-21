import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "../src/api/trpc";
import { AuthProvider, useAuth } from "../src/lib/auth-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { colors } from "../src/lib/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: colors.border, borderTopColor: colors.primary }} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <RootLayoutNav />
            <StatusBar style="light" />
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
