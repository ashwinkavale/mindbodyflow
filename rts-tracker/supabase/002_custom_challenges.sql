-- Per-user custom challenges. Run once in Dashboard → SQL Editor, after schema.sql.
-- Built-in challenges stay in code; this table holds only challenges a user creates for themselves.

create table public.custom_challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  tool        text not null check (tool in ('indian-clubs','rope-flow','mace')),
  level       smallint not null check (level between 1 and 3),
  description text not null default '' check (char_length(description) <= 500),
  target      numeric not null check (target > 0),
  unit        text not null check (char_length(btrim(unit)) between 1 and 20),
  created_at  timestamptz not null default now()
);
create index custom_challenges_user_id_idx on public.custom_challenges (user_id);

alter table public.custom_challenges enable row level security;
revoke all on table public.custom_challenges from anon, authenticated;
grant select, insert, update, delete on table public.custom_challenges to authenticated, service_role;
create policy "own rows" on public.custom_challenges for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- user_challenges.challenge_id also holds built-in ids, so it can't be a foreign key.
-- This trigger removes a custom challenge's progress in the same transaction as the challenge itself.
create function public.delete_custom_challenge_progress() returns trigger
language plpgsql set search_path = '' as $$
begin
  delete from public.user_challenges where user_id = old.user_id and challenge_id = old.id::text;
  return old;
end $$;
revoke execute on function public.delete_custom_challenge_progress() from public, anon, authenticated;

create trigger custom_challenge_cleanup after delete on public.custom_challenges
  for each row execute function public.delete_custom_challenge_progress();