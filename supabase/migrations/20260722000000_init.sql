-- ============================================================
-- 모락 (Morak) — Supabase Schema
-- v0.5 (2026-05-28)
--
-- 사용 방법:
--   1. Supabase 프로젝트 생성 후 SQL Editor 열기
--   2. 이 파일 전체를 붙여넣고 Run
--   3. Table Editor에서 menu, ingredient_master 테이블에 시드 CSV import
-- ============================================================

-- ============ 1. 마스터 데이터 (공용) ============

-- 재료 사전 (100개 시드)
create table if not exists ingredient_master (
  id                text primary key,
  name              text not null,
  category          text not null,
  default_unit      text,
  shelf_life_days   integer,     -- 일반 보관 기준 유통기한
  storage           text,        -- 냉장/냉동/실온
  notes             text,
  created_at        timestamptz not null default now()
);

comment on table ingredient_master is '재료 사전 (100개 시드) — 자동완성 검색·보관 방법 분류에 사용';

-- 메뉴 마스터 (50개 시드)
create table if not exists menu (
  id                text primary key,
  name              text not null,
  category          text not null,
  cooking_time      integer,       -- 분
  difficulty        text,          -- 쉬움/중간/어려움
  tags              text[],
  description       text,
  created_at        timestamptz not null default now()
);

comment on table menu is '도시락 메뉴 마스터 (50개 시드)';

-- 메뉴에 필요한 재료 (M:N 관계)
create table if not exists menu_ingredient (
  id                bigserial primary key,
  menu_id           text not null references menu(id) on delete cascade,
  ingredient_name   text not null,       -- ingredient_master.name과 매칭
  quantity          text,                -- "1단", "200g" 등 자유 형식
  is_optional       boolean not null default false
);

create index if not exists idx_menu_ingredient_menu on menu_ingredient(menu_id);
create index if not exists idx_menu_ingredient_ingredient on menu_ingredient(ingredient_name);

comment on table menu_ingredient is '메뉴별 필수·옵션 재료 매핑';


-- ============ 2. 사용자 데이터 ============

-- 사용자별 보유 재료 (냉장고)
create table if not exists user_ingredient (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  category          text,               -- ingredient_master.category와 동일 값 권장
  quantity          text,
  unit              text,
  expiry_date       date,               -- 유통기한
  added_at          timestamptz not null default now(),
  consumed_at       timestamptz         -- 다 썼을 때 (null이면 보유 중)
);

create index if not exists idx_user_ingredient_user_expiry
  on user_ingredient(user_id, expiry_date)
  where consumed_at is null;

comment on table user_ingredient is '사용자별 보유 재료 — 냉장고 화면';

-- 장보기 리스트
create table if not exists shopping_list (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  quantity          text,
  linked_menu_id    text references menu(id) on delete set null,
  is_purchased      boolean not null default false,
  purchased_at      timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_shopping_list_user_open
  on shopping_list(user_id)
  where is_purchased = false;

comment on table shopping_list is '장보기 리스트 — 구매 완료 시 user_ingredient로 이동';

-- 사용자 메뉴 기록/즐겨찾기
create table if not exists user_menu_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  menu_id           text not null references menu(id) on delete cascade,
  made_at           date,
  is_favorite       boolean not null default false,
  rating            smallint check (rating between 1 and 5)
);

create index if not exists idx_user_menu_history_user on user_menu_history(user_id);

comment on table user_menu_history is '사용자 메뉴 기록 — 만든 횟수, 즐겨찾기, 별점';


-- ============ 3. Row Level Security (RLS) ============

alter table user_ingredient   enable row level security;
alter table shopping_list     enable row level security;
alter table user_menu_history enable row level security;

-- user_ingredient: 본인만 CRUD
create policy "user_ingredient_own" on user_ingredient
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- shopping_list: 본인만 CRUD
create policy "shopping_list_own" on shopping_list
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_menu_history: 본인만 CRUD
create policy "user_menu_history_own" on user_menu_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 마스터 데이터(menu, ingredient_master, menu_ingredient)는 RLS 없이 모두 read 가능하도록 유지
-- (Supabase는 기본적으로 anon key도 select 가능한 상태로 두면 됨)


-- ============ 4. 편의 함수 (선택) ============

-- D-day 계산 view
create or replace view v_user_ingredient_dday as
select
  ui.*,
  (ui.expiry_date - current_date) as dday
from user_ingredient ui
where ui.consumed_at is null;

comment on view v_user_ingredient_dday is '보유 재료 + D-day 계산 (음수는 이미 지난 것)';


-- 유통기한 임박(D-3 이내) 재료를 활용 가능한 메뉴 후보
create or replace view v_urgent_menu_candidate as
select distinct
  m.id       as menu_id,
  m.name     as menu_name,
  mi.ingredient_name,
  ui.user_id,
  ui.expiry_date - current_date as dday
from user_ingredient ui
join menu_ingredient mi
  on lower(trim(mi.ingredient_name)) = lower(trim(ui.name))
join menu m on m.id = mi.menu_id
where ui.consumed_at is null
  and (ui.expiry_date - current_date) <= 3;

comment on view v_urgent_menu_candidate is '유통기한 D-3 이내 재료를 활용하는 메뉴 후보 (추천 정렬에 활용)';


-- ============ 5. 확인 쿼리 ============

-- 시드 데이터 확인
-- select count(*) from ingredient_master;
-- select count(*) from menu;
-- select count(*) from menu_ingredient;
