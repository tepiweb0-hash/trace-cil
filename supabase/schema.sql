-- Run in the Supabase SQL editor when you are ready to enable cloud login/save.
-- Safe to re-run: policies are replaced idempotently.
create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

drop policy if exists "Users can read their own save" on public.game_saves;
create policy "Users can read their own save"
on public.game_saves for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own save" on public.game_saves;
create policy "Users can insert their own save"
on public.game_saves for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own save" on public.game_saves;
create policy "Users can update their own save"
on public.game_saves for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.game_saves to authenticated;
