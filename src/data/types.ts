export interface IngredientMaster {
  id: string;
  name: string;
  category: string; // 채소 | 육류 | 해산물 | 가공식품 | 계란 | 유제품 | 두부 | 양념 | 곡류 | 해조 | 발효
  defaultUnit: string;
  shelfLifeDays: number;
  storage: string; // 냉장 | 냉동 | 실온
  notes?: string;
}

export interface Menu {
  id: string;
  name: string;
  category: string;
  cookingTime: number; // 분
  difficulty: string;
  required: string[];
  optional: string[];
  tags: string[];
  description: string;
}

/** 냉장고 보유 재료 */
export interface FridgeItem {
  id: string;
  name: string;
  category: string;
  quantity: string; // "200g", "1모" 등 자유 형식
  expiryDate: string; // yyyy-MM-dd
  addedAt: string; // ISO
}

/** 장보기 리스트 항목 */
export interface ShopItem {
  id: string;
  name: string;
  quantity: string;
  linkedMenuId?: string;
  checked: boolean;
}
