-- ══════════════════════════════════════════════════════════════════════════════
--  Alfa Kompass – fase 2: customers + seller_districts
--  Kjøres i Supabase SQL-editoren.
--  Rører IKKE user_data, profiles, auth eller noen eksisterende tabeller.
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. Distrikt-domene ───────────────────────────────────────────────────────
--  Definerer de tre gyldige verdiene ETT sted. Brukes som kolonnetype i
--  BEGGE tabeller – garanterer identisk stavemåte overalt. En INSERT med
--  feil verdi avvises av databasen med en klar feilmelding.

create domain public.district_code as text
  check (value in ('Midt-Norge', 'Nord-Norge', 'Svalbard'));


-- ── 2. customers ─────────────────────────────────────────────────────────────

create table public.customers (

  -- Identitet
  id              uuid                  primary key default gen_random_uuid(),
  legacy_id       text,                 -- opprinnelig id fra data.js, kun migreringsreferanse

  -- JOIN-NØKKEL: må matche alfa_visits[].customer og alfa_followups[].customer EKSAKT.
  -- unique-constraint hindrer duplikate kundenavn.
  name            text                  not null unique,

  -- Kjernedata fra data.js
  city            text,
  chain           text,
  l12             integer               not null default 0,
  budget          integer               not null default 0,
  concept         text,
  class           text,                 -- 'A' | 'B' | 'C' | ''
  priority        text,
  contacts        jsonb                 not null default '[]',
  note            text                  not null default '',

  -- Strukturerte adressefelter (flettet fra Excel)
  gate            text,
  postnr          text,
  poststed        text,

  -- Manuell adresse (redigerbar i app, fallback i visning)
  address         text,

  -- Kommersielle/kontaktfelter (redigerbare i app)
  phone           text,
  discount        text,
  storetype       text,

  -- Distrikt: domenet avviser ugyldige verdier ved insert
  district        public.district_code  not null,

  -- Eksplisitt tildeling til én bruker (valgfritt, null for alle nå)
  assigned_user   uuid                  references auth.users(id) on delete set null,

  -- Geokoding (fylles av geocode.js – fase 3)
  lat             double precision,
  lng             double precision,
  geo             text                  check (geo in ('adresse','by','manuell','mangler') or geo is null),

  -- Metadata
  created_at      timestamptz           not null default now(),
  updated_at      timestamptz           not null default now()

);


-- ── 3. Trigger: updated_at ───────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_updated_at
  before update on public.customers
  for each row execute procedure public.set_updated_at();


-- ── 4. seller_districts ──────────────────────────────────────────────────────
--  Koblingstabell: én rad per selger per distrikt de eier.
--  Ny selger onboardes ved å INSERT rader her – ingen kodeendring.

create table public.seller_districts (
  user_id   uuid                  not null references auth.users(id) on delete cascade,
  district  public.district_code  not null,
  primary key (user_id, district)
);


-- ── 5. RLS: seller_districts ─────────────────────────────────────────────────
--  Selger kan lese SINE egne rader (nødvendig for RLS-evaluering på customers).
--  Ingen INSERT/UPDATE/DELETE-policy: vanlige brukere kan ikke endre tabellen.
--  Kun service role key (eller SQL-editoren) kan skrive her.

alter table public.seller_districts enable row level security;

create policy "Selger leser egne distrikter"
  on public.seller_districts
  for select
  using (user_id = auth.uid());


-- ── 6. RLS: customers ────────────────────────────────────────────────────────

alter table public.customers enable row level security;

-- LES: kunder i dine distrikter (via seller_districts), ELLER rollen gir deg alt
create policy "Selger leser egne kunder"
  on public.customers
  for select
  using (
    exists (
      select 1 from public.seller_districts
      where user_id  = auth.uid()
        and district = customers.district
    )
    or exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('ceo', 'sjef', 'kam')
    )
  );

-- SKRIV: identisk betingelse som lese
create policy "Selger endrer egne kunder"
  on public.customers
  for all
  using (
    exists (
      select 1 from public.seller_districts
      where user_id  = auth.uid()
        and district = customers.district
    )
    or exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('ceo', 'sjef', 'kam')
    )
  );


-- ── 7. Populer seller_districts for Jørn ─────────────────────────────────────
--  UUID bekreftet mot auth.users (jorn@alfa.no = f0cff8a8-d538-431b-8d1f-95db1d75fa03).

insert into public.seller_districts (user_id, district) values
  ('f0cff8a8-d538-431b-8d1f-95db1d75fa03', 'Midt-Norge'),
  ('f0cff8a8-d538-431b-8d1f-95db1d75fa03', 'Nord-Norge'),
  ('f0cff8a8-d538-431b-8d1f-95db1d75fa03', 'Svalbard');
