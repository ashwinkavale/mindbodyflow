-- Run once in Dashboard → SQL Editor, after 002_custom_challenges.sql.
-- 1) daily achievements  2) next-week plans  3) richer custom challenges (category, exercise, reps, time, weight)

-- ---------- achievements: free-text posts about the day, several per day allowed ----------
create table public.achievements (
  id         uuid primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date       date not null,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index achievements_user_date_idx on public.achievements (user_id, date desc);

-- ---------- week_plans: one row per user per week; week_start is that week's Monday ----------
create table public.week_plans (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  focus      text not null default '' check (char_length(focus) <= 200),
  days       jsonb not null default '[]' check (jsonb_typeof(days) = 'array' and jsonb_array_length(days) <= 7),
  primary key (user_id, week_start)
);

do $$
declare t text;
begin
  foreach t in array array['achievements','week_plans'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated, service_role', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- ---------- custom_challenges ----------
alter table public.custom_challenges rename column tool to category;

-- The old check only allowed the three tools; drop it by definition rather than by guessed name.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.custom_challenges'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) like '%indian-clubs%'
  loop
    execute format('alter table public.custom_challenges drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.custom_challenges
  add constraint custom_challenges_category_check
    check (category in ('indian-clubs','rope-flow','mace','bodyweight','other')),
  add column exercise  text not null default '' check (char_length(exercise) <= 60),
  add column reps      numeric check (reps is null or reps > 0),
  add column time_min  numeric check (time_min is null or time_min > 0),
  add column weight_kg numeric check (weight_kg is null or weight_kg > 0);

-- Existing rows: the old name becomes the exercise, and the old target becomes minutes or reps.
update public.custom_challenges set exercise = left(name, 60) where exercise = '';
update public.custom_challenges set time_min = target
  where reps is null and time_min is null and lower(btrim(unit)) in ('min','mins','minute','minutes');
update public.custom_challenges set reps = target where reps is null and time_min is null;