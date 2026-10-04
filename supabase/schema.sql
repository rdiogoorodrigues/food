-- Estado partilhado do casal: um único documento JSON.
create table if not exists public.household_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.household_state enable row level security;

-- Apenas utilizadores autenticados (as duas contas criadas em Authentication > Users).
create policy "authenticated read" on public.household_state
  for select to authenticated using (true);
create policy "authenticated insert" on public.household_state
  for insert to authenticated with check (true);
create policy "authenticated update" on public.household_state
  for update to authenticated using (true) with check (true);

-- Atualizações em tempo real entre telemóveis.
alter publication supabase_realtime add table public.household_state;
