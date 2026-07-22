import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FridgeItem, ShopItem } from '../data/types';
import { INGREDIENT_MASTER } from '../data/ingredients';
import { dateAfter } from '../logic/dday';
import { normalizeName } from '../logic/recommend';

const uid = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const masterByName = (name: string) =>
  INGREDIENT_MASTER.find((m) => normalizeName(m.name) === normalizeName(name));

const defaultQty = (unit?: string): string => {
  if (!unit) return '1개';
  if (unit === 'g') return '200g';
  if (unit === 'kg') return '1kg';
  return `1${unit}`;
};

/** 첫 실행용 데모 냉장고 (하이파이 시안과 동일한 구성) */
const initialFridge = (): FridgeItem[] => {
  const rows: Array<[string, string, string, number]> = [
    // name, category, quantity, dday
    ['시금치', '채소', '200g', 1],
    ['두부 (부침용)', '두부', '1모', 2],
    ['양파', '채소', '2개', 3],
    ['우유', '유제품', '900ml', 5],
    ['계란', '계란', '6개', 7],
    ['당근', '채소', '1개', 9],
    ['다진마늘', '양념', '1통', 30],
    ['진간장', '양념', '1병', 180],
    // 상비 양념 — 있어야 "바로 가능" 추천이 현실적으로 나온다
    ['참기름', '양념', '1병', 90],
    ['참깨', '양념', '1병', 120],
    ['소금', '양념', '1통', 365],
    ['식용유', '양념', '1병', 180],
    ['설탕', '양념', '1봉', 365],
  ];
  const now = new Date().toISOString();
  return rows.map(([name, category, quantity, dday]) => ({
    id: uid(),
    name,
    category,
    quantity,
    expiryDate: dateAfter(dday),
    addedAt: now,
  }));
};

interface MorakState {
  fridge: FridgeItem[];
  shopping: ShopItem[];
  /** 재료 추가 화면의 최근 추가 이름 */
  recentNames: string[];
  /** "오늘 만든 메뉴" 기록 (menuId) */
  madeMenuIds: string[];

  addFridgeItem: (item: Omit<FridgeItem, 'id' | 'addedAt'>) => void;
  removeFridgeItem: (id: string) => void;

  addShopItems: (items: Array<{ name: string; quantity?: string; linkedMenuId?: string }>) => void;
  toggleShopItem: (id: string) => void;
  removeShopItem: (id: string) => void;
  /** 체크된 항목을 냉장고로 이동 (유통기한은 재료 사전 shelf_life 기준) */
  completeShopping: () => number;

  markMade: (menuId: string) => void;
  resetDemo: () => void;
}

export const useMorak = create<MorakState>()(
  persist(
    (set, get) => ({
      fridge: initialFridge(),
      shopping: [],
      recentNames: [],
      madeMenuIds: [],

      addFridgeItem: (item) =>
        set((s) => ({
          fridge: [{ ...item, id: uid(), addedAt: new Date().toISOString() }, ...s.fridge],
          recentNames: [item.name, ...s.recentNames.filter((n) => n !== item.name)].slice(0, 8),
        })),

      removeFridgeItem: (id) => set((s) => ({ fridge: s.fridge.filter((f) => f.id !== id) })),

      addShopItems: (items) =>
        set((s) => {
          const existing = new Set(s.shopping.map((i) => normalizeName(i.name)));
          const added: ShopItem[] = items
            .filter((i) => !existing.has(normalizeName(i.name)))
            .map((i) => ({
              id: uid(),
              name: i.name,
              quantity: i.quantity ?? defaultQty(masterByName(i.name)?.defaultUnit),
              linkedMenuId: i.linkedMenuId,
              checked: false,
            }));
          return { shopping: [...s.shopping, ...added] };
        }),

      toggleShopItem: (id) =>
        set((s) => ({
          shopping: s.shopping.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        })),

      removeShopItem: (id) => set((s) => ({ shopping: s.shopping.filter((i) => i.id !== id) })),

      completeShopping: () => {
        const { shopping } = get();
        const bought = shopping.filter((i) => i.checked);
        if (bought.length === 0) return 0;
        const now = new Date().toISOString();
        const items: FridgeItem[] = bought.map((i) => {
          const master = masterByName(i.name);
          return {
            id: uid(),
            name: i.name,
            category: master?.category ?? '양념',
            quantity: i.quantity || master?.defaultUnit || '',
            expiryDate: dateAfter(master?.shelfLifeDays ?? 7),
            addedAt: now,
          };
        });
        set((s) => ({
          fridge: [...items, ...s.fridge],
          shopping: s.shopping.filter((i) => !i.checked),
        }));
        return bought.length;
      },

      markMade: (menuId) =>
        set((s) => ({ madeMenuIds: [menuId, ...s.madeMenuIds.filter((m) => m !== menuId)] })),

      resetDemo: () => set({ fridge: initialFridge(), shopping: [], madeMenuIds: [] }),
    }),
    {
      name: 'morak-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
