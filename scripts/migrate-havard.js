// Engangs-skript: migrerer Håvards kunder (havard_kunder_migrasjon.json) til Supabase customers-tabellen.
// Tørrkjøring (default): viser hva som vil skje – skriver ingenting.
// Skriving:              legg til --write for å faktisk sette inn nye kunder.
//
// PowerShell:
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/migrate-havard.js
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/migrate-havard.js --write
//
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.
// Nøkkel hentes KUN fra miljøvariabel – aldri hardkod den her.

const fs     = require('fs');
const path   = require('path');

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = process.env.SUPA_SECRET_KEY;
if (!SUPA_KEY) {
  console.error('Feil: SUPA_SECRET_KEY er ikke satt.');
  console.error('Kjør: $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/migrate-havard.js');
  process.exit(1);
}

const DRY_RUN = !process.argv.includes('--write');

// Parse l12_raw-strenger som "kr  343,181" → 343181 (heltall NOK, komma = tusenskille)
function parseL12(raw) {
  if (!raw) return 0;
  const n = parseInt(raw.replace(/[^\d]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// ── Les JSON ──────────────────────────────────────────────────────────────────

const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'havard_kunder_migrasjon.json'), 'utf8'));
console.log(`Leste ${src.length} kunder fra havard_kunder_migrasjon.json.`);

// ── Bygg rader ────────────────────────────────────────────────────────────────

const rows = src.map(c => ({
  name:               c.name,
  legacy_id:          null,
  city:               c.city               || null,
  chain:              c.chain              || null,
  l12:                parseL12(c.l12_raw),
  budget:             0,
  concept:            null,
  class:              null,
  priority:           null,
  contacts:           [],
  note:               '',
  gate:               null,
  postnr:             c.postal             || null,
  poststed:           c.city               || null,
  address:            c.address            || null,
  phone:              c.phone              || null,
  email:              c.email              || null,
  eier_konstellasjon: c.eier_konstellasjon || null,
  discount:           null,
  storetype:          null,
  district:           'Vest/Sør-Norge',
  assigned_user:      null,
}));

// ── Kjør ──────────────────────────────────────────────────────────────────────

async function run() {
  if (DRY_RUN) console.log('\n[TØRRKJØRING – ingen data skrives. Legg til --write for å utføre.]\n');

  // 1. Hent alle eksisterende kundenavn fra Supabase
  const existRes = await fetch(
    `${SUPA_URL}/rest/v1/customers?select=name`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  if (!existRes.ok) {
    console.error('Feil: kunne ikke hente eksisterende kunder:', existRes.status, await existRes.text());
    process.exit(1);
  }
  const existingRows = await existRes.json();
  const existingNames = new Set(existingRows.map(c => c.name));

  // 2. Del i nye og eksisterende (eksisterende røres IKKE)
  const skipped = rows.filter(r =>  existingNames.has(r.name));
  const toInsert = rows.filter(r => !existingNames.has(r.name));

  // 3. Rapporter hoppet-over
  console.log('── Finnes allerede – hoppes over (' + skipped.length + ') ──');
  if (skipped.length === 0) {
    console.log('  Ingen overlapp.');
  } else {
    skipped.forEach(r => console.log('  ~ ' + r.name));
  }

  // 4. Rapporter nye
  console.log('\n── Nye kunder som vil settes inn (' + toInsert.length + ') ──');
  if (toInsert.length === 0) {
    console.log('  Ingen nye kunder.');
  } else {
    const preview = toInsert.slice(0, 15);
    preview.forEach(r => console.log('  + ' + r.name + (r.city ? ' (' + r.city + ')' : '')));
    if (toInsert.length > 15) console.log('  ... og ' + (toInsert.length - 15) + ' til');
  }

  console.log('\nSamlet: ' + rows.length + ' i JSON → ' + toInsert.length + ' nye, ' + skipped.length + ' hoppet over');

  if (DRY_RUN) {
    console.log('\nKjør med --write for å sette inn de ' + toInsert.length + ' nye kundene:');
    console.log('  $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/migrate-havard.js --write');
    return;
  }

  if (toInsert.length === 0) {
    console.log('\nIngenting å gjøre.');
    return;
  }

  // 5. Sett kun inn NYE (ingen upsert – eksisterende påvirkes ikke)
  console.log('\nSkriver ' + toInsert.length + ' nye kunder til Supabase...');
  const res = await fetch(`${SUPA_URL}/rest/v1/customers`, {
    method: 'POST',
    headers: {
      apikey:          SUPA_KEY,
      Authorization:   `Bearer ${SUPA_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=representation',
    },
    body: JSON.stringify(toInsert),
  });

  if (!res.ok) {
    console.error('Feil fra Supabase:', res.status, await res.text());
    process.exit(1);
  }

  const inserted = await res.json();
  console.log('\n✓ ' + inserted.length + ' nye kunder satt inn i Supabase.');
  console.log('\nHusk: roter SUPA_SECRET_KEY i Supabase Dashboard etter bruk.');
}

run().catch(err => { console.error(err); process.exit(1); });
