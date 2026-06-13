// Engangs-skript: migrerer BASE_CUSTOMERS fra data.js til Supabase customers-tabellen.
// Kjør: SUPA_SERVICE_KEY=<din_service_role_key> node scripts/migrate-customers.js
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.
// Nøkkel hentes KUN fra miljøvariabel – aldri hardkod den her.

const fs   = require('fs');
const path = require('path');

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
if (!SUPA_KEY) {
  console.error('Feil: SUPA_SERVICE_KEY er ikke satt.');
  console.error('Kjør: SUPA_SERVICE_KEY=<nøkkel> node scripts/migrate-customers.js');
  process.exit(1);
}

// ── District-mapping (poststed → distrikt) ────────────────────────────────────
// Alle 142 poststed-verdier er verifisert mot denne mappingen (0 ukjente).

const MIDT = new Set([
  'TRONDHEIM','STJØRDAL','STEINKJER','ORKANGER','OPPDAL','STØREN','NAMSOS',
  'LEVANGER','KOLVEREID','RØROS','ÅFJORD','VERDALSØRA','VERDAL','TILLER',
  'SISTRANDA','SELBU','RISSA','OVERHALLA','MERÅKER','MELHUS','LØKKEN VERK',
  'LEINSTRAND','KYRKSÆTERØRA','KONGSMOEN','HITRA','HALTDALEN','GRONG','FANNREM',
  'EKNE','BREKSTAD','BJUGN','RØRVIK',
]);
const NORDLAND = new Set([
  'BODØ','MO I RANA','MOSJØEN','SANDNESSJØEN','BRØNNØYSUND','FAUSKE','NARVIK',
  'SORTLAND','SVOLVÆR','LEKNES','BALLANGEN','ROGNAN','STOKMARKNES','ØRNES',
  'BJERKVIK','LØDINGEN','BØ I VESTERÅLEN','ANDENES',
]);
const TROMS = new Set([
  'TROMSØ',
  'TROMØ',     // kjent skrivefeil på id=114 (postnr 9008 = Tromsø) – mappes riktig til Nord-Norge
  'HARSTAD','FINNSNES','BARDUFOSS','BARDU','STORSLETT',
  'SØRREISA','SKJERVØY','SJØVEGAN','LYNGSEIDET',
]);
const FINNMARK = new Set([
  'ALTA','HAMMERFEST','KIRKENES','VADSØ','LAKSELV','TANA','RYPEFJORD',
  'HESSENG','KJØLLEFJORD','KARASJOK','KAUTOKEINO','HONNINGSVÅG',
]);

function getDistrict(c) {
  const p = (c.poststed || '').toUpperCase().trim();
  if (MIDT.has(p))                                         return 'Midt-Norge';
  if (NORDLAND.has(p) || TROMS.has(p) || FINNMARK.has(p)) return 'Nord-Norge';
  if (p === 'LONGYEARBYEN')                                return 'Svalbard';
  throw new Error(`Ukjent poststed "${c.poststed}" for kunde "${c.name}" (id=${c.id})`);
}

// ── Les BASE_CUSTOMERS fra data.js ────────────────────────────────────────────

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const match = src.match(/const BASE_CUSTOMERS\s*=\s*(\[[\s\S]*?\n\]);/);
if (!match) { console.error('Fant ikke BASE_CUSTOMERS i data.js'); process.exit(1); }
// eval er trygt her: lokal fil under vår kontroll, kjøres ikke i nettleser
const BASE_CUSTOMERS = eval(match[1]); // eslint-disable-line no-eval

// ── Bygg rader til Supabase ───────────────────────────────────────────────────
// VIKTIG: name brukes UENDRET — det er join-nøkkelen mot eksisterende
// alfa_visits og alfa_followups i user_data. Ikke trim, ikke normaliser.

const rows = BASE_CUSTOMERS.map(c => ({
  name:          c.name,
  legacy_id:     c.id,
  city:          c.city      || null,
  chain:         c.chain     || null,
  l12:           c.l12       || 0,
  budget:        c.budget    || 0,
  concept:       c.concept   || null,
  class:         c.class     || null,
  priority:      c.priority  || null,
  contacts:      c.contacts  || [],
  note:          c.note      || '',
  gate:          c.gate      || null,
  postnr:        c.postnr    || null,
  poststed:      c.id === '114' ? 'TROMSØ' : (c.poststed || null), // rett TROMØ-skrivefeil
  address:       c.address   || null,
  phone:         c.phone     || null,
  discount:      c.discount  || null,
  storetype:     c.storetype || null,
  district:      getDistrict(c),
  assigned_user: null,
}));

// ── Sett inn i Supabase (upsert på name) ─────────────────────────────────────

async function run() {
  console.log(`Forbereder ${rows.length} kunder...`);

  // Verifiser at alle district-verdier er gyldige før vi sender noe
  const dist = {};
  rows.forEach(r => { dist[r.district] = (dist[r.district] || 0) + 1; });
  console.log('District-fordeling:');
  Object.entries(dist).sort().forEach(([d, n]) => console.log(`  ${d}: ${n}`));
  const total = Object.values(dist).reduce((s, n) => s + n, 0);
  if (total !== 142) {
    console.error(`Feil: forventet 142 kunder, fikk ${total}. Avbryter.`);
    process.exit(1);
  }

  // Sjekk eksisterende rader
  const checkRes = await fetch(
    `${SUPA_URL}/rest/v1/customers?select=count`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Prefer: 'count=exact' } }
  );
  const range = checkRes.headers.get('content-range') || '*/0';
  const existing = parseInt(range.split('/')[1] || '0', 10);
  if (existing > 0) {
    console.warn(`\nOBS: Tabellen har allerede ${existing} rader. Fortsetter med upsert.`);
  }

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
  console.log(`\n✓ ${inserted.length} kunder skrevet til Supabase.`);
  console.log('\nHusk: roter service role key i Supabase Dashboard etter at du har bekreftet migreringen.');
}

run().catch(err => { console.error(err); process.exit(1); });
