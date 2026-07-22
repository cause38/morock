import type { SupabaseClient } from '@supabase/supabase-js';
import type { FridgeItem, ShopItem } from '../data/types';
import { useMorak } from '../store/morak';
import { getSupabase } from './supabase';

/**
 * 로컬 우선 동기화 (기획서 1차 범위 — 익명 로컬 저장 + Sync 옵션).
 *
 * - 시작 시 익명 세션 확보 → 원격에 데이터가 있으면 로컬로 당겨오고,
 *   없으면(새 기기) 로컬 스냅샷을 올린다.
 * - 이후 스토어 변경을 디바운스해 원격 미러를 갱신한다 (전체 교체 방식).
 * - 실패는 조용히 무시 — 오프라인이어도 앱은 로컬로 계속 동작한다.
 */

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
let started = false;
let hydrating = false;
let lastPushed = '';

const toIngredientRow = (f: FridgeItem, userId: string) => ({
  id: f.id,
  user_id: userId,
  name: f.name,
  category: f.category,
  quantity: f.quantity,
  expiry_date: f.expiryDate,
  added_at: f.addedAt,
});

const toShopRow = (s: ShopItem, userId: string) => ({
  id: s.id,
  user_id: userId,
  name: s.name,
  quantity: s.quantity,
  linked_menu_id: s.linkedMenuId ?? null,
  is_purchased: s.checked,
});

const snapshotKey = (fridge: FridgeItem[], shopping: ShopItem[]) =>
  JSON.stringify([fridge, shopping]);

async function pushSnapshot(sb: SupabaseClient, userId: string) {
  const { fridge, shopping } = useMorak.getState();
  const key = snapshotKey(fridge, shopping);
  if (key === lastPushed) return;

  // 미러 전체 교체 — 행 수가 작아 MVP에서는 가장 단순하고 안전한 방식
  const results = [
    await sb.from('user_ingredient').delete().neq('id', NIL_UUID),
    fridge.length > 0
      ? await sb.from('user_ingredient').insert(fridge.map((f) => toIngredientRow(f, userId)))
      : null,
    await sb.from('shopping_list').delete().neq('id', NIL_UUID),
    shopping.length > 0
      ? await sb.from('shopping_list').insert(shopping.map((s) => toShopRow(s, userId)))
      : null,
  ];
  const failed = results.find((r) => r?.error);
  if (failed?.error) {
    console.warn('[morak] sync push failed:', failed.error.message);
    return;
  }
  lastPushed = key;
}

async function pullSnapshot(sb: SupabaseClient): Promise<boolean> {
  const [ing, shop] = await Promise.all([
    sb
      .from('user_ingredient')
      .select('id,name,category,quantity,expiry_date,added_at')
      .is('consumed_at', null),
    sb
      .from('shopping_list')
      .select('id,name,quantity,linked_menu_id,is_purchased'),
  ]);
  if (ing.error || shop.error) throw ing.error ?? shop.error;
  if ((ing.data?.length ?? 0) === 0 && (shop.data?.length ?? 0) === 0) return false;

  const fridge: FridgeItem[] = (ing.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category ?? '양념',
    quantity: r.quantity ?? '',
    expiryDate: r.expiry_date,
    addedAt: r.added_at,
  }));
  const shopping: ShopItem[] = (shop.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    quantity: r.quantity ?? '',
    linkedMenuId: r.linked_menu_id ?? undefined,
    checked: r.is_purchased,
  }));

  hydrating = true;
  useMorak.setState({ fridge, shopping });
  lastPushed = snapshotKey(fridge, shopping);
  hydrating = false;
  return true;
}

/** "오늘 만든 메뉴" 기록 (실패 무시) */
export async function recordMade(menuId: string) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;
    await sb.from('user_menu_history').insert({
      user_id: userId,
      menu_id: menuId,
      made_at: new Date().toISOString().slice(0, 10),
    });
  } catch {
    // offline — 로컬 기록(madeMenuIds)은 이미 남아 있다
  }
}

export async function initSync() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) return;

  try {
    let { data } = await sb.auth.getSession();
    if (!data.session) {
      const res = await sb.auth.signInAnonymously();
      if (res.error) throw res.error;
      data = { session: res.data.session };
    }
    const userId = data.session!.user.id;

    const hadRemote = await pullSnapshot(sb);
    if (!hadRemote) await pushSnapshot(sb, userId);

    // 이후 변경은 디바운스 push
    let timer: ReturnType<typeof setTimeout> | null = null;
    useMorak.subscribe(() => {
      if (hydrating) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        pushSnapshot(sb, userId).catch(() => {});
      }, 1200);
    });
  } catch (e) {
    // 네트워크/설정 문제 — 로컬 모드로 계속
    console.warn('[morak] sync disabled:', (e as Error)?.message);
  }
}
