import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { M } from '../../design/tokens';

export type MochiMood = 'happy' | 'worried' | 'cheer';

interface MochiProps {
  size?: number;
  mood?: MochiMood;
  /** 볼터치 컬러 (카테고리 soft 톤) */
  tint?: string;
}

/** 모찌 — 김이 모락모락 나는 주먹밥 마스코트 */
export function Mochi({ size = 92, mood = 'happy', tint = '#FFE2D2' }: MochiProps) {
  return (
    <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
      <G stroke={M.ink} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.4}>
        <Path d="M34 8 Q 29 16, 34 24 Q 39 32, 34 39" />
        <Path d="M50 5 Q 45 14, 50 23 Q 55 32, 50 40" />
        <Path d="M66 8 Q 61 16, 66 24 Q 71 32, 66 39" />
      </G>
      <Path
        d="M19 90 Q 17 49, 50 35 Q 83 49, 81 90 Z"
        fill="#FFFBF4"
        stroke={M.ink}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <Path d="M21 77 L79 77 L79 87 Q 50 92, 21 87 Z" fill={M.ink} />
      <Circle cx={38} cy={63} r={2.9} fill={M.ink} />
      <Circle cx={62} cy={63} r={2.9} fill={M.ink} />
      <Circle cx={30} cy={70} r={3.4} fill={tint} opacity={0.85} />
      <Circle cx={70} cy={70} r={3.4} fill={tint} opacity={0.85} />
      {mood === 'happy' && (
        <Path d="M44 70 Q 50 75, 56 70" stroke={M.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
      {mood === 'worried' && (
        <Path d="M44 72 Q 50 67, 56 72" stroke={M.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
      {mood === 'cheer' && <Ellipse cx={50} cy={71} rx={3.4} ry={2.6} fill={M.ink} />}
    </Svg>
  );
}
