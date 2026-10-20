-- =====================================================================
-- Acervo de pregações e estudos — esquema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  status       text not null default 'draft'
               check (status in ('processing', 'draft', 'published', 'error')),
  category     text not null check (category in ('pregacao', 'estudo')),
  title        text not null default '',
  date         date not null default current_date,
  preacher     text not null default '',
  series       text,
  main_topic   text not null default '',
  summary      text not null default '',          -- parágrafos separados por linha em branco
  verses       jsonb not null default '[]'::jsonb, -- [{ reference, book, chapter, verses, text }]
  key_points   jsonb not null default '[]'::jsonb, -- [{ title, description }]
  quotes       jsonb not null default '[]'::jsonb, -- ["frase", ...]
  books        text[] not null default '{}',       -- livros citados (para filtros)
  transcript   text not null default '',
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  fts tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(main_topic, '') || ' ' || coalesce(series, '') || ' ' || coalesce(preacher, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'C') ||
    setweight(to_tsvector('portuguese', left(coalesce(transcript, ''), 400000)), 'D')
  ) stored
);

create index if not exists messages_category_date_idx on public.messages (category, date desc);
create index if not exists messages_status_idx        on public.messages (status);
create index if not exists messages_books_idx         on public.messages using gin (books);
create index if not exists messages_fts_idx           on public.messages using gin (fts);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists messages_touch on public.messages;
create trigger messages_touch before update on public.messages
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Segurança (RLS)
-- ---------------------------------------------------------------------
-- RLS ligado e SEM políticas: ninguém acessa a tabela pela chave pública.
-- O site acessa o banco apenas pelo servidor, com a chave service_role
-- (que ignora o RLS).
alter table public.messages enable row level security;
drop policy if exists "admin acesso total" on public.messages;
