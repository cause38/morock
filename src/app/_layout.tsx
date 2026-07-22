import React from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { M } from '../design/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.ttf'),
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  React.useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: M.cream },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="menu/[id]" />
      <Stack.Screen name="add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="add-detail" />
    </Stack>
  );

  return (
    <>
      <StatusBar style="dark" />
      {Platform.OS === 'web' ? (
        // 웹 데모: 모바일 프레임 폭으로 중앙 정렬
        <View style={{ flex: 1, backgroundColor: '#F0EEE9', alignItems: 'center' }}>
          <View style={{ flex: 1, width: '100%', maxWidth: 430, backgroundColor: M.cream }}>
            {stack}
          </View>
        </View>
      ) : (
        stack
      )}
    </>
  );
}
