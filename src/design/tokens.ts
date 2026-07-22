/**
 * 모락 (Morak) — Quiet Warm 디자인 토큰
 * 하이파이 v0.4 (Morak Hifi.html) 팔레트 기준 단일 소스.
 */

export const M = {
  // base
  white: '#FFFFFF',
  cream: '#FAF7F2',
  paper: '#F4F0EA',
  ink: '#3D332E',
  ink2: '#5A4E47',
  sub: '#8B7E76',
  cap: '#BCB0A8',
  line: '#EFE9E2',
  line2: '#E7DFD6',
  // action — mocha
  mocha: '#9E8276',
  mochaDark: '#7C6457',
  mochaSoft: '#EDE3DC',
} as const;

/** 카테고리 파스텔 [soft, strong] */
export const CAT = {
  veg: ['#E3F0D2', '#A9CE84'],
  meat: ['#FFE2D2', '#F0A07E'],
  egg: ['#FFF0C7', '#F2CE6E'],
  sauce: ['#E0EAF1', '#9CC0D6'],
  grain: ['#F6ECD6', '#DEC192'],
  spicy: ['#FFD7C9', '#E78566'],
  rose: ['#FBE0E0', '#E89A9A'],
} as const;

export type CategoryKey = keyof typeof CAT;

/** D-day 상태 컬러 */
export const DDAY = {
  d1: { fg: '#C9594B', bg: '#FFE0D6' }, // 임박 (D-1 이하)
  d2: { fg: '#A87E2E', bg: '#FBEFC8' }, // 주의 (D-2~3)
  d4: { fg: '#5C8D3F', bg: '#E6F2D8' }, // 여유 (D-4+)
  ok: { fg: '#5C8D3F', bg: '#E6F2D8' },
} as const;

export type DdayKind = 'd1' | 'd2' | 'd4';

/** 시드 데이터의 한글 카테고리 → 팔레트 키 */
export const categoryKey = (kor: string): CategoryKey => {
  const map: Record<string, CategoryKey> = {
    채소: 'veg',
    해조: 'veg',
    육류: 'meat',
    해산물: 'meat',
    가공식품: 'meat',
    계란: 'egg',
    유제품: 'egg',
    두부: 'grain',
    양념: 'sauce',
    곡류: 'grain',
    발효: 'spicy',
  };
  return map[kor] ?? 'sauce';
};

export const categoryColor = (kor: string) => CAT[categoryKey(kor)];

/** 카테고리 한글 라벨 (재료 추가 화면 표기용) */
export const CATEGORY_LABELS = [
  '채소',
  '육류',
  '해산물',
  '가공식품',
  '계란',
  '유제품',
  '두부',
  '양념',
  '곡류',
  '해조',
  '발효',
] as const;

/** 이름 → 블롭 모양 인덱스 (0-4 고정 해시) */
export const blobShapeOf = (name: string): number => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 5;
};

export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  // 숫자 전용
  numSemibold: 'Nunito_600SemiBold',
  numBold: 'Nunito_700Bold',
  numHeavy: 'Nunito_800ExtraBold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#3D332E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  pill: {
    shadowColor: '#9E8276',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;
