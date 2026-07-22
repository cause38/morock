import { create } from 'zustand';
import { INGREDIENT_MASTER } from '../data/ingredients';
import { dateAfter } from '../logic/dday';
import { normalizeName } from '../logic/recommend';

export interface DraftItem {
  name: string;
  category: string;
  quantity: string;
  expiryDate: string; // yyyy-MM-dd
}

const defaultQuantity = (unit: string | undefined): string => {
  if (!unit) return '1개';
  if (unit === 'g') return '200g';
  if (unit === 'kg') return '1kg';
  return `1${unit}`;
};

export const draftFromName = (name: string): DraftItem => {
  const master = INGREDIENT_MASTER.find((m) => normalizeName(m.name) === normalizeName(name));
  return {
    name: master?.name ?? name,
    category: master?.category ?? '양념',
    quantity: defaultQuantity(master?.defaultUnit),
    expiryDate: dateAfter(master?.shelfLifeDays ?? 7),
  };
};

interface AddDraftState {
  selected: DraftItem[];
  toggle: (name: string) => void;
  update: (name: string, patch: Partial<DraftItem>) => void;
  remove: (name: string) => void;
  clear: () => void;
}

/** 재료 추가 플로우 전용 임시 드래프트 (화면 간 공유, 저장 안 함) */
export const useAddDraft = create<AddDraftState>((set) => ({
  selected: [],
  toggle: (name) =>
    set((s) => {
      const key = normalizeName(name);
      const exists = s.selected.some((d) => normalizeName(d.name) === key);
      return {
        selected: exists
          ? s.selected.filter((d) => normalizeName(d.name) !== key)
          : [...s.selected, draftFromName(name)],
      };
    }),
  update: (name, patch) =>
    set((s) => ({
      selected: s.selected.map((d) =>
        normalizeName(d.name) === normalizeName(name) ? { ...d, ...patch } : d,
      ),
    })),
  remove: (name) =>
    set((s) => ({
      selected: s.selected.filter((d) => normalizeName(d.name) !== normalizeName(name)),
    })),
  clear: () => set({ selected: [] }),
}));
