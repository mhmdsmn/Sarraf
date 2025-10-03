import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ExchangeProvider } from "@/hooks/exchange-store";
import { AdminProvider } from "@/hooks/admin-store";
import { StorageProvider } from "@/hooks/storage-provider";
import { I18nProvider } from "@/hooks/i18n-provider";
import { AdsManagerProvider } from "@/hooks/ads-manager";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="secret-admin-portal" options={{ headerShown: false }} />
      <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="admin/users" options={{ headerShown: false }} />
      <Stack.Screen name="admin/pricing" options={{ headerShown: false }} />
      <Stack.Screen name="admin/promotions" options={{ headerShown: false }} />
      <Stack.Screen name="admin/analytics" options={{ headerShown: false }} />
      <Stack.Screen name="admin/support" options={{ headerShown: false }} />
      <Stack.Screen name="admin/settings" options={{ headerShown: false }} />
      <Stack.Screen name="admin/subscriptions" options={{ headerShown: false }} />
      <Stack.Screen name="admin/payment-methods" options={{ headerShown: false }} />
      <Stack.Screen name="admin/ads-settings" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StorageProvider>
        <I18nProvider>
          <AdminProvider>
            <ExchangeProvider>
              <AdsManagerProvider>
                <GestureHandlerRootView>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </AdsManagerProvider>
            </ExchangeProvider>
          </AdminProvider>
        </I18nProvider>
      </StorageProvider>
    </QueryClientProvider>
  );
}