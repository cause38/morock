import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { font, M } from '../../design/tokens';

// 하이파이 v0.4 탭 아이콘 (홈 · 냉장고 · 장보기 · 내정보)
const ICONS: Record<string, string> = {
  index: 'M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5',
  fridge: 'M6 3h12v18H6zM6 9h12',
  shop: 'M4 6h16l-1.5 11.5H5.5zM9 6V4h6v2',
  me: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7',
};

const LABELS: Record<string, string> = {
  index: '홈',
  fridge: '냉장고',
  shop: '장보기',
  me: '내정보',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 11,
        paddingHorizontal: 12,
        paddingBottom: Math.max(insets.bottom, 14),
        backgroundColor: M.white,
        borderTopWidth: 1,
        borderTopColor: M.line,
      }}
    >
      {state.routes.map((route, i) => {
        const active = state.index === i;
        const color = active ? M.mocha : M.cap;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ alignItems: 'center', gap: 5, flex: 1 }}
            hitSlop={6}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d={ICONS[route.name] ?? ICONS.index}
                stroke={color}
                strokeWidth={active ? 2.1 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text
              style={{
                fontSize: 10.5,
                fontFamily: active ? font.bold : font.semibold,
                color,
              }}
            >
              {LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
