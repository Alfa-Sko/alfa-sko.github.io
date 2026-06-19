// Engangs-skript: migrerer Håvards kunder (havard_kunder_migrasjon.json) til Supabase customers-tabellen.
// Kjør: SUPA_SERVICE_KEY=<din_service_role_key> node scripts/migrate-havard.js
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.
// Nøkkel hentes KUN fra miljøvariabel – aldri hardkod den her.

const fs   = require('fs');
const path = require('path');

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
if (!SUPA_KEY) {
  console.error('Feil: SUPA_SERVICE_KEY er ikke satt.');
  console.error('Kjør: SUPA_SERVICE_KEY=<nøkkel> node scripts/migrate-havard.js');
  process.exit(1);
}

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
// Feltene matches customers-tabellens skjema (se migrate-customers.js).
// email og eier_konstellasjon finnes i JSON men er ikke egne kolonner – utelates.
// poststed settes til city (samme verdi i Håvards data).

const rows = src.map(c => ({
  name:          c.name,
  legacy_id:     null,
  city:          c.city          || null,
  chain:         c.chain         || null,
  l12:           parseL12(c.l12_raw),
  budget:        0,
  concept:       null,
  class:         null,
  priority:      null,
  contacts:      [],
  note:          '',
  gate:          null,
  postnr:        c.postal        || null,
  poststed:      c.city          || null,
  address:       c.address       || null,
  phone:         c.phone         || null,
  discount:      null,
  storetype:     null,
  district:      'Vest/Sør Norge',
  assigned_user: null,
}));

// ── Kjør ──────────────────────────────────────────────────────────────────────

async function run() {
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

  // 2. Rapporter overlapp
  const matches  = rows.filter(r =>  existingNames.has(r.name));
  const newOnes  = rows.filter(r => !existingNames.has(r.name));

  console.log('\n── Matches mot eksisterende kunder (' + matches.length + ') ──');
  if (matches.length === 0) {
    console.log('  Ingen – alle er nye.');
  } else {
    matches.forEach(r => console.log('  ~ ' + r.name));
    console.log('  (disse oppdateres med upsert)');
  }

  console.log('\n── Nye kunder (' + newOnes.length + ') ──');
  const preview = newOnes.slice(0, 10);
  preview.forEach(r => console.log('  + ' + r.name));
  if (newOnes.length > 10) console.log('  ... og ' + (newOnes.length - 10) + ' til');

  // 3. Bekreft før skriving
  console.log('\nSamlet: ' + rows.length + ' kunder (' + newOnes.length + ' nye, ' + matches.length + ' oppdateres)');

  // 4. Upsert (slår på name-unique-constraint i tabellen)
  console.log('\nSkriver til Supabase...');
  const res = await fetch(`${SUPA_URL}/rest/v1/customers`, {
    method: 'POST',
    headers: {
      apikey:          SUPA_KEY,
      Authorization:   `Bearer ${SUPA_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    console.error('Feil fra Supabase:', res.status, await res.text());
    process.exit(1);
  }

  const inserted = await res.json();
  console.log('\n✓ ' + inserted.length + ' kunder skrevet til Supabase.');
  console.log('  Nye:       ' + newOnes.length);
  console.log('  Oppdatert: ' + matches.length);
  console.log('\nHusk: roter service role key i Supabase Dashboard etter at du har bekreftet migreringen.');
}

run().catch(err => { console.error(err); process.exit(1); });
