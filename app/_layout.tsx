import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    (async () => {
      await setBackgroundColorAsync('#46444e');
      await Font.loadAsync(Ionicons.font);
      SplashScreen.hideAsync();
    })();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#46444e' },
        animation: 'fade',
      }}
    />
  );
}
