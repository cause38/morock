# 모락 (Morak)

> 모아 담아, 모락 — 냉장고 속 재료의 유통기한을 기준으로 오늘의 도시락 메뉴를 추천하는 서비스

Expo(React Native + Web) 기반 MVP. 디자인은 Claude Design의 **Morak Hifi v0.4** (Quiet Warm — 순백 베이스 · 카테고리 파스텔 · 모카 베이지 액션 · 블롭 일러스트 · 모찌 마스코트)를 구현했습니다.

## 실행

```bash
npm install
npm run web      # 웹 (http://localhost:8081)
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
```

## 화면

| 화면 | 경로 | 내용 |
|------|------|------|
| 홈 | `/` | 냉장고 임박 순 가로 스크롤 + 오늘의 추천 메뉴 (상하 분할) |
| 냉장고 | `/fridge` | 보유 재료 전체 리스트 (D-day 정렬, 삭제) |
| 메뉴 상세 | `/menu/[id]` | 통합 재료 체크리스트, 부족 재료 → 장보기 담기 |
| 재료 추가 | `/add`, `/add-detail` | 검색 우선 + 단일 카드 상세 (수량·유통기한 캘린더) |
| 장보기 | `/shop` | 체크리스트 + 연쇄 추천("하나 더 사면 +1 메뉴") + 구매 완료 → 냉장고 이동 |
| 내정보 | `/me` | 통계 · 데모 초기화 |

## 구조

```
src/
├─ app/              # Expo Router 화면
├─ components/ui/    # Blob, Mochi(마스코트), Chip/Pill/Card 등 하이파이 프리미티브
├─ design/tokens.ts  # Quiet Warm 팔레트·타이포·그림자 (단일 소스)
├─ data/             # 시드 데이터 (메뉴 50 · 재료 사전 100, CSV에서 생성)
├─ logic/            # D-day 계산 · 메뉴 추천 · 연쇄 추천 (순수 함수)
└─ store/            # zustand + AsyncStorage (익명 로컬 저장)
```

- 시드 수정: `docs/seed/*.csv` 편집 후 `node scripts/gen-seed.js` (로컬) / `node scripts/seed-supabase.js` (원격)
- 추천 규칙: 필수 재료 충족 여부 + 유통기한 임박 가중치(D-1 +30 / D-2 +20 / D-3 +10)
- 전체 기획: `docs/도시락_메뉴_추천_서비스_기획서.md` (v0.5)

## 백엔드 — Supabase

로컬 우선(익명 로컬 저장) + 백그라운드 동기화. `.env`에 키가 없으면 순수 로컬 모드로 동작합니다.

- `.env.example`을 `.env`로 복사하고 프로젝트 URL/anon key 입력 (프로젝트: `morak`, ref `gkloloygthncowfhgkil`)
- 스키마는 `supabase/migrations/` — 변경 시 `npx supabase db push`
- 익명 로그인 → `user_ingredient`/`shopping_list` 미러 동기화, `user_menu_history` 기록
- 서비스 롤 키 등 비밀 값은 `.env.local` (커밋 금지)

## 배포

| 대상 | 방법 |
|------|------|
| 웹 (Vercel) | `npx vercel build --prod && npx vercel deploy --prebuilt --prod` → https://morak-umber.vercel.app (개인 스코프 `parkjinjus-projects`) |
| 앱 빌드 | `eas login` → `eas init` → `eas build --profile preview` (eas.json 구성됨) |
| OTA 업데이트 | `eas update --branch production` (JS/스타일 수정은 심사 없이 반영) |
