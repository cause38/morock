import type { FridgeItem, Menu } from '../data/types';
import { MENUS } from '../data/menus';
import { ddayOf } from './dday';

/**
 * 재료 이름 정규화 매칭.
 * "두부 (부침용)" ↔ "두부", "다진 마늘" ↔ "다진마늘" 을 같은 재료로 취급한다.
 * (기획서 §8 — lower/trim 매칭에 괄호·공백 제거를 더한 MVP 규칙)
 */
const ALIASES: Record<string, string> = {
  간장: '진간장', // 시드 메뉴의 "간장"은 진간장으로 취급
  마늘: '다진마늘',
  깨소금: '참깨',
};

export const normalizeName = (name: string): string => {
  const n = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, '')
    .trim();
  return ALIASES[n] ?? n;
};

export interface MenuMatch {
  menu: Menu;
  /** 보유 중인 필수 재료 */
  owned: FridgeItem[];
  /** 부족한 필수 재료 이름 */
  missing: string[];
  /** 필수 재료 중 가장 임박한 보유 재료 (없으면 null) */
  urgent: { item: FridgeItem; dday: number } | null;
  /** 임박 가중치 포함 추천 점수 */
  score: number;
}

const urgencyBonus = (dday: number): number => {
  if (dday < 0) return 0; // 이미 지난 재료는 가중치 없음
  if (dday <= 1) return 30;
  if (dday <= 2) return 20;
  if (dday <= 3) return 10;
  return 0;
};

/** 냉장고 기준으로 메뉴 하나를 평가 */
export const matchMenu = (menu: Menu, fridge: FridgeItem[], today: Date = new Date()): MenuMatch => {
  const byNorm = new Map<string, FridgeItem>();
  for (const f of fridge) {
    const key = normalizeName(f.name);
    const prev = byNorm.get(key);
    // 같은 재료가 여러 개면 더 임박한 것을 대표로
    if (!prev || ddayOf(f.expiryDate, today) < ddayOf(prev.expiryDate, today)) byNorm.set(key, f);
  }

  const owned: FridgeItem[] = [];
  const missing: string[] = [];
  for (const req of menu.required) {
    const hit = byNorm.get(normalizeName(req));
    if (hit) owned.push(hit);
    else missing.push(req);
  }

  let urgent: MenuMatch['urgent'] = null;
  let bonus = 0;
  for (const item of owned) {
    const dday = ddayOf(item.expiryDate, today);
    bonus += urgencyBonus(dday);
    if (dday >= 0 && (!urgent || dday < urgent.dday)) urgent = { item, dday };
  }

  // 바로 가능(부족 0) > 조금만 사면(1~2) > 그 외, 임박 가중치로 정렬
  const score = bonus - missing.length * 25 + (missing.length === 0 ? 15 : 0);
  return { menu, owned, missing, urgent, score };
};

/** 전체 메뉴 추천 — 만들 수 있거나(0) 조금만 사면 되는(≤2) 메뉴, 점수순 */
export const recommendMenus = (fridge: FridgeItem[], today: Date = new Date()): MenuMatch[] =>
  MENUS.map((m) => matchMenu(m, fridge, today))
    .filter((r) => r.owned.length > 0 && r.missing.length <= 2)
    .sort((a, b) => b.score - a.score);

export interface ChainSuggestion {
  /** 하나만 더 사면 되는 재료 이름 */
  addName: string;
  menu: Menu;
}

/**
 * 연쇄 추천 — 냉장고 + (장보기에 담은 재료)를 가진 상태에서
 * 재료 "하나"만 더 사면 완성되는 메뉴.
 */
export const chainSuggestions = (
  fridge: FridgeItem[],
  plannedNames: string[],
  today: Date = new Date(),
  limit = 3,
): ChainSuggestion[] => {
  const planned = new Set(plannedNames.map(normalizeName));
  const out: ChainSuggestion[] = [];
  const seen = new Set<string>();
  const ranked = MENUS.map((m) => matchMenu(m, fridge, today)).sort((a, b) => b.score - a.score);
  for (const r of ranked) {
    const remaining = r.missing.filter((n) => !planned.has(normalizeName(n)));
    if (remaining.length !== 1) continue;
    const key = normalizeName(remaining[0]);
    if (seen.has(key)) continue; // 같은 재료 추천은 한 번만
    seen.add(key);
    out.push({ addName: remaining[0], menu: r.menu });
    if (out.length >= limit) break;
  }
  return out;
};
