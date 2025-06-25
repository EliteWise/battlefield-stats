// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    (async () => {
      await Font.loadAsync(Ionicons.font);
      SplashScreen.hideAsync();
    })();
  }, []);

  return <Stack
          screenOptions={{
              headerShown: false,
          }}
        />;
}
