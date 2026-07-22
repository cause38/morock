import { differenceInCalendarDays, parseISO, addDays, format } from 'date-fns';
import type { DdayKind } from '../design/tokens';

/** 오늘 기준 남은 일수 (지났으면 음수) */
export const ddayOf = (expiryDate: string, today: Date = new Date()): number =>
  differenceInCalendarDays(parseISO(expiryDate), today);

/** D-day → 상태 (임박 d1 / 주의 d2 / 여유 d4) */
export const ddayKind = (dday: number): DdayKind => (dday <= 1 ? 'd1' : dday <= 3 ? 'd2' : 'd4');

/** "D-3" / "D-DAY" / "D+2" 표기 */
export const ddayLabel = (dday: number): string =>
  dday > 0 ? `D-${dday}` : dday === 0 ? 'D-DAY' : `D+${-dday}`;

export const dateAfter = (days: number, from: Date = new Date()): string =>
  format(addDays(from, days), 'yyyy-MM-dd');
