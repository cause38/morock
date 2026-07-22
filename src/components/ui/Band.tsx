import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** 화면 상단에 깔리는 카테고리 파스텔 그라데이션 밴드 */
export function Band({ from, h = 220 }: { from: string; h?: number }) {
  return (
    <LinearGradient
      colors={[from, `${from}00`]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.42, y: 0.92 }}
      style={[StyleSheet.absoluteFill, { height: h, bottom: undefined }]}
      pointerEvents="none"
    />
  );
}
