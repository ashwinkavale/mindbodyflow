-- RTS Tracker schema. Run once in Dashboard → SQL Editor.
-- Every table: RLS on, explicit grants (required for new tables since Supabase stopped auto-exposing
-- public tables to the Data API), and policies that restrict each user to their own rows.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null,
  email         text not null,
  mobile        text not null,
  dob           date,
  gender        text not null check (gender in ('female','male','non-binary','undisclosed')),
  city          text not null,
  photo         text check (photo is null or length(photo) < 700000),
  goals         text[] not null default '{}',
  program       text not null check (program in ('indian-clubs','rope-flow','mace')),
  weekly_target smallint not null default 5 check (weekly_target between 1 and 7),
  height_cm     numeric check (height_cm is null or height_cm > 0),
  next_skill_id text,
  created_at    timestamptz not null default now()
);

create table public.training_sessions (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date          date not null,
  status        text not null check (status in ('completed','partial','rest','missed')),
  training_type text check (training_type in ('indian-clubs','rope-flow','mace','rts')),
  duration      text check (duration in ('lt15','15-30','30-45','45-60','60plus')),
  effort        text check (effort in ('easy','moderate','challenging','high')),
  energy        text check (energy in ('low','good','high')),
  movement      text check (movement in ('stiff','normal','fluid')),
  recovery      text check (recovery in ('poor','okay','good')),
  pain_level    text check (pain_level in ('none','mild','moderate','significant')),
  pain_location text,
  highlight     text,
  created_at    timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.user_skills (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id   text not null,
  learned    boolean not null default false,
  expertise  text not null default 'beginner' check (expertise in ('beginner','advanced','integrated')),
  control    smallint not null default 0 check (control between 0 and 5),
  confidence smallint not null default 0 check (confidence between 0 and 5),
  notes      text not null default '',
  learned_on date,
  history    jsonb not null default '[]'::jsonb,
  primary key (user_id, skill_id)
);

create table public.user_challenges (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  challenge_id text not null,
  started_on   date not null,
  progress     numeric not null default 0 check (progress >= 0),
  primary key (user_id, challenge_id)
);

create table public.health_metrics (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date        date not null,
  sleep_hours numeric check (sleep_hours is null or sleep_hours between 0 and 24),
  resting_hr  smallint check (resting_hr is null or resting_hr > 0),
  steps       integer check (steps is null or steps >= 0),
  weight_kg   numeric check (weight_kg is null or weight_kg > 0),
  primary key (user_id, date)
);

-- profiles: a user can read, create and edit only their own row.
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
create policy "read own profile"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "create own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Everything else is keyed by user_id and gets the same treatment.
do $$
declare t text;
begin
  foreach t in array array['training_sessions','user_skills','user_challenges','health_metrics'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated, service_role', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;