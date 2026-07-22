import React from 'react';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

// 하이파이 v0.4의 손그림 블롭 5종 — 재료/메뉴 비주얼의 기본 형태 언어
const SHAPES = [
  'M50 12 Q 80 14, 85 44 Q 90 73, 60 85 Q 30 93, 17 70 Q 7 47, 23 27 Q 35 12, 50 12 Z',
  'M30 16 Q 73 10, 85 38 Q 91 64, 70 84 Q 44 93, 21 76 Q 7 55, 15 35 Q 21 20, 30 16 Z',
  'M52 7 Q 87 30, 85 60 Q 81 92, 50 92 Q 17 92, 15 60 Q 17 31, 52 7 Z',
  'M50 9 Q 82 18, 85 49 Q 89 84, 50 91 Q 13 85, 13 53 Q 13 21, 50 9 Z',
  'M28 20 Q 61 3, 80 24 Q 97 49, 80 74 Q 60 93, 35 84 Q 7 70, 13 43 Q 19 26, 28 20 Z',
];

let gradSeq = 0;

interface BlobProps {
  shape?: number;
  /** [gradientStart, gradientEnd] 또는 단색 */
  c: readonly [string, string] | string;
  size?: number;
}

export function Blob({ shape = 0, c, size = 56 }: BlobProps) {
  const fill: readonly [string, string] = Array.isArray(c) ? (c as [string, string]) : [c as string, c as string];
  const id = React.useMemo(() => `blob-g-${gradSeq++}`, []);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={id} x1="20%" y1="8%" x2="80%" y2="98%">
          <Stop offset="0%" stopColor={fill[0]} />
          <Stop offset="100%" stopColor={fill[1]} />
        </LinearGradient>
      </Defs>
      <Path d={SHAPES[Math.abs(shape) % SHAPES.length]} fill={`url(#${id})`} />
      <Ellipse
        cx={38}
        cy={34}
        rx={13}
        ry={9}
        fill="#fff"
        opacity={0.32}
        transform="rotate(-24 38 34)"
      />
    </Svg>
  );
}
