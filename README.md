# Alfa Kompass

Intern felt-sales CRM for Alfa Sko, en norsk sportsutstyr-distributør. Brukes daglig av distriktsselgere og ledere for å planlegge og dokumentere kundebesøk.

## Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS — ingen rammeverk, ingen byggesteg. Alle moduler lastes som `<script>`-tagger i `index.html`.
- **Backend:** [Supabase](https://supabase.com/) — Postgres med Row Level Security, Supabase Auth og Supabase Storage.
- **Hosting:** GitHub Pages (`main`-branch).

## Mappestruktur

```
index.html               Inngangspunkt – laster alle JS-moduler i rekkefølge
css/app.css              All styling
js/
  supabase.js            Auth, sesjonshåndtering, synkronisering mot Supabase
  customers.js           Kundeliste, detaljer, import/eksport
  calendar.js            Kalender, hendelser, drag-drop, ICS-eksport
  planner.js             Regionplanlegger: algoritme, redigering, kalendereksport
  map.js                 Leaflet-kart, rutekart per dag via OSRM
  visits.js              Besøksskjema, lagring, sletting
  photos.js              Bildearkiv per besøk (klient-komprimering → Supabase Storage)
  timeline.js            Tidslinje og team-tidslinje
  dashboard.js           Oversikt, ledermodus, demomodus
  followups.js           Oppfølginger og bestillingsoppfølging
  workbooks.js           Workbooks (IndexedDB) + felles kataloger (Supabase Storage)
  data.js / state.js / utils.js / ui.js / init.js   Delte datasett, state, hjelpere, oppstart
scripts/
  geocode.js             Geokoder kunder via Nominatim → skriver lat/lon til Supabase
  enrich-customers.js    Beriker kundedata (kategori, klasse o.l.)
  migrate-customers.js   Engangsmigrering fra gammel datamodell
  migrate-havard.js      Distriktsmigrering for Vest/Sør-Norge
  patch-havard-gate.js   Patcher gate-kolonne etter migrering
supabase/
  001_customers.sql      Komplett DDL: tabeller, domener, RLS-policyer, indekser
```

## Datamodell (nøkkeltabeller)

| Tabell | Beskrivelse |
|--------|-------------|
| `customers` | Kunder med adresse, koordinater, kjede, kontakter (jsonb), district |
| `seller_districts` | Kobling selger ↔ distrikt (en selger kan ha flere) |
| `profiles` | Brukerinfo: `full_name`, `district`, `role` (`sjef`/`ceo`/`kam`) |
| Besøk og oppfølginger | Lagres per bruker i `user_data` (nøkkel/verdi-tabell) |

Besøksbilder lagres i Supabase Storage (`besoksbilder`-bucket) og refereres via `photoPaths`-array på besøksobjektet.

## Tilgangsmodell (RLS)

- **Selgere** ser og endrer kun kunder der `customers.district` matcher en rad i `seller_districts` for innlogget bruker.
- **Ledere** (`role in ('sjef', 'ceo', 'kam')` i `profiles`) ser alle kunder på tvers av distrikter.
- `district` er en Postgres-domenetype med faste gyldige verdier — feilstavinger avvises av databasen.

## Hovedfunksjoner

- **Kart** — Leaflet med OSM-tiles; rutekart per dag beregnes live via OSRM.
- **Regionplanlegger** — Optimerer besøksrekkefølge med hotell/fly-logikk, flydagcutoff og manuelle justeringer. Eksporterer til kalender.
- **Kalender** — Månedsoversikt, drag-drop, ICS-eksport til Outlook/Google.
- **Bildearkiv** — Kamerabilde per besøk, komprimeres klient-side (Canvas API) før opplasting til Supabase Storage med signerte URL-er.
- **Kontaktpersoner** — Lagres som JSONB på kunden, redigeres inline.
- **Lederoversikt** — Sjef/CEO ser hele teamets aktivitet, kan bytte mellom selgere.

## Lokal kjøring

Åpne `index.html` med [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) i VS Code. Ingen installasjon eller byggesteg nødvendig.

Appen bruker Supabase-prosjektet direkte — du trenger en brukerkonto med tilgang til prosjektet for å logge inn.

## Scripts (Node.js engangsverktøy)

Krever Node 18+ og ingen npm-pakker (bruker innebygd `fetch`). Alle scripts leser Supabase secret key fra miljøvariabel:

```powershell
$env:SUPA_SECRET_KEY = "sb_secret_..."   # Hentes fra Supabase Dashboard → Settings → API
node scripts/geocode.js                  # Tørrkjøring (standard)
node scripts/geocode.js --write          # Skriv til databasen
```

## Branching

- Utvikling skjer på `alfa2`.
- Deploy = fast-forward merge til `main` (GitHub Pages serverer `main` automatisk).
- Aldri commit direkte til `main`.
