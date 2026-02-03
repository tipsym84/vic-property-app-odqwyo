
import React, { useEffect } from "react";
import { useColorScheme, Alert } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  useFonts as useGoogleFonts,
  CourierPrime_400Regular,
  CourierPrime_400Regular_Italic,
  CourierPrime_700Bold,
  CourierPrime_700Bold_Italic,
} from '@expo-google-fonts/courier-prime';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNetworkState } from "expo-network";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SystemBars } from "react-native-edge-to-edge";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { PropertyProvider } from "@/contexts/PropertyContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isConnected } = useNetworkState();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [fontsLoaded] = useGoogleFonts({
    CourierPrime_400Regular,
    CourierPrime_400Regular_Italic,
    CourierPrime_700Bold,
    CourierPrime_700Bold_Italic,
  });

  useEffect(() => {
    if (loaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontsLoaded]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded || !fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <WidgetProvider>
          <PropertyProvider>
            <SystemBars style="auto" />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
              <Stack.Screen name="formsheet" options={{ presentation: "formSheet", title: "Form Sheet", sheetGrabberVisible: true, sheetAllowedDetents: [0.5, 0.8, 1.0], sheetCornerRadius: 20 }} />
              <Stack.Screen name="transparent-modal" options={{ presentation: "transparentModal", headerShown: false }} />
              <Stack.Screen name="buy" options={{ headerShown: false }} />
              <Stack.Screen name="sell" options={{ headerShown: false }} />
              <Stack.Screen name="auction-guru" options={{ headerShown: false }} />
              <Stack.Screen name="buyer-calculator" options={{ headerShown: false }} />
              <Stack.Screen name="vendor-calculator" options={{ headerShown: false }} />
              <Stack.Screen name="max-purchase-calculator" options={{ headerShown: false }} />
              <Stack.Screen name="reverse-calculator" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </PropertyProvider>
        </WidgetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
