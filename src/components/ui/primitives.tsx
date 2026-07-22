import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { DDAY, DdayKind, font, M, shadow } from '../../design/tokens';

// ── 타이포 ──────────────────────────────────────────────────

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TxtProps {
  children: React.ReactNode;
  size?: number;
  weight?: Weight;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

/** Pretendard 본문 텍스트 */
export function Txt({ children, size = 14, weight = 'regular', color = M.ink, style, numberOfLines }: TxtProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: font[weight], fontSize: size, color, letterSpacing: -0.3 }, style]}
    >
      {children}
    </Text>
  );
}

/** Nunito 숫자 */
export function Num({
  children,
  size = 14,
  color = M.ink,
  weight = 800,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 600 | 700 | 800;
  style?: StyleProp<TextStyle>;
}) {
  const family = weight === 600 ? font.numSemibold : weight === 700 ? font.numBold : font.numHeavy;
  return (
    <Text style={[{ fontFamily: family, fontSize: size, color, letterSpacing: -0.3 }, style]}>
      {children}
    </Text>
  );
}

/** 영문 대문자 라벨 — "MY FRIDGE" 등 */
export function Eyebrow({ children, color = M.sub }: { children: React.ReactNode; color?: string }) {
  return (
    <Text
      style={{
        fontFamily: font.numHeavy,
        fontSize: 11,
        letterSpacing: 1.8,
        color,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

/** 큰 한글 헤드라인 (두 줄) */
export function Title({
  children,
  size = 27,
  color = M.ink,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: font.bold,
          fontSize: size,
          lineHeight: size * 1.28,
          letterSpacing: -0.8,
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ── 컨테이너 ────────────────────────────────────────────────

export function Card({
  children,
  pad = 18,
  style,
  onPress,
}: {
  children: React.ReactNode;
  pad?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const base: ViewStyle = {
    backgroundColor: M.white,
    borderRadius: 22,
    padding: pad,
    borderWidth: 1,
    borderColor: M.line,
    ...shadow.card,
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, style, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

// ── 칩 / 버튼 ───────────────────────────────────────────────

export type ChipKind = DdayKind | 'ok' | 'mocha' | 'outline' | 'neutral';

export function Chip({
  children,
  kind = 'neutral',
  size = 'sm',
  onPress,
}: {
  children: React.ReactNode;
  kind?: ChipKind;
  size?: 'sm' | 'lg';
  onPress?: () => void;
}) {
  const p =
    kind === 'd1' || kind === 'd2' || kind === 'd4' || kind === 'ok'
      ? DDAY[kind]
      : kind === 'mocha'
        ? { fg: M.mochaDark, bg: M.mochaSoft }
        : kind === 'outline'
          ? { fg: M.sub, bg: 'transparent', bd: M.line2 }
          : { fg: M.sub, bg: M.cream };
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: size === 'lg' ? 5 : 3.5,
        paddingHorizontal: size === 'lg' ? 12 : 10,
        borderRadius: 999,
        backgroundColor: p.bg,
        borderWidth: 'bd' in p ? 1.3 : 0,
        borderColor: 'bd' in p ? p.bd : undefined,
      }}
    >
      <Text
        style={{
          fontFamily: font.bold,
          fontSize: size === 'lg' ? 12.5 : 11.5,
          color: p.fg,
          letterSpacing: -0.2,
        }}
      >
        {children}
      </Text>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

/** 큰 액션 버튼 */
export function Pill({
  children,
  kind = 'primary',
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  kind?: 'primary' | 'soft' | 'ghost';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c =
    kind === 'primary'
      ? { bg: M.mocha, fg: '#fff' }
      : kind === 'soft'
        ? { bg: M.mochaSoft, fg: M.mochaDark }
        : { bg: M.white, fg: M.mochaDark, bd: M.line2 };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 17,
          paddingHorizontal: 24,
          borderRadius: 18,
          backgroundColor: c.bg,
          borderWidth: 'bd' in c ? 1.4 : 0,
          borderColor: 'bd' in c ? c.bd : undefined,
          opacity: disabled ? 0.45 : 1,
        },
        kind === 'primary' && !disabled && shadow.pill,
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {React.isValidElement(children) ? (
        children
      ) : (
        <Text style={{ fontFamily: font.bold, fontSize: 15.5, color: c.fg, letterSpacing: -0.3 }}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function Check({ on, square }: { on: boolean; square?: boolean }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: square ? 7 : 12,
        backgroundColor: on ? M.mocha : 'transparent',
        borderWidth: on ? 0 : 1.5,
        borderColor: M.cap,
        borderStyle: square ? 'solid' : 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {on && <Text style={{ color: '#fff', fontSize: 13, fontFamily: font.bold }}>✓</Text>}
    </View>
  );
}

/** 원형 헤더 버튼 (‹ 뒤로 / × 닫기) */
export function CircleButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: M.white,
        borderWidth: 1,
        borderColor: M.line,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 17, color: M.ink2, lineHeight: 20 }}>{label}</Text>
    </Pressable>
  );
}
