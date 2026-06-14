// scripts/geocode.js — geokoder kundene i Supabase customers-tabellen via Nominatim.
// Kjør: $env:SUPA_SECRET_KEY="<sb_secret_...>"; node scripts/geocode.js
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.
// Nøkkel hentes KUN fra miljøvariabel – aldri hardkod den her.

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = process.env.SUPA_SECRET_KEY;
if (!SUPA_KEY) {
  console.error('Feil: SUPA_SECRET_KEY er ikke satt.');
  console.error('Kjør: $env:SUPA_SECRET_KEY="<sb_secret_...>"; node scripts/geocode.js');
  process.exit(1);
}

const DELAY_MS = 1100; // > 1 sek mellom requests (Nominatim fair-use policy)
const UA       = 'AlfaKompass/1.0 (intern CRM, kontakt: jorn@alfa.no)';

// ── Supabase helpers ──────────────────────────────────────────────────────────

function sbHeaders(extra = {}) {
  return {
    apikey:          SUPA_KEY,
    Authorization:   `Bearer ${SUPA_KEY}`,
    'Content-Type':  'application/json',
    ...extra,
  };
}

// ── Hent kunder som mangler koordinater ──────────────────────────────────────
// Filtrerer på lat=is.null OG geo=is.null: hopper over de som allerede er
// merket "mangler" etter et tidligere forsøk (unngår unødige Nominatim-kall).
// For å tvinge full re-kjøring, endre filteret til bare lat=is.null.

async function fetchUngeocoded() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/customers?select=id,name,gate,postnr,poststed&lat=is.null&geo=is.null&order=name`,
    { headers: sbHeaders() }
  );
  if (!res.ok) throw new Error(`Supabase fetch feilet: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Skriv lat/lng/geo til én kunde (PATCH på UUID) ───────────────────────────

async function updateCustomer(id, lat, lng, geo) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/customers?id=eq.${id}`,
    {
      method:  'PATCH',
      headers: sbHeaders({ Prefer: 'return=minimal' }),
      body:    JSON.stringify({ lat, lng, geo }),
    }
  );
  if (!res.ok) throw new Error(`PATCH feilet for id=${id}: ${res.status} ${await res.text()}`);
}

// ── Nominatim-oppslag ────────────────────────────────────────────────────────

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=no`;
  const res  = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const json = await res.json();
  return json.length > 0 ? { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) } : null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Hovedløkke ───────────────────────────────────────────────────────────────

async function main() {
  const customers = await fetchUngeocoded();
  console.log(`Fant ${customers.length} kunder uten koordinater.\n`);
  if (customers.length === 0) { console.log('Ingenting å gjøre.'); return; }

  const byList      = [];
  const missingList = [];
  let   okCount     = 0;

  for (let i = 0; i < customers.length; i++) {
    const { id, name, gate, postnr, poststed } = customers[i];

    process.stdout.write(`[${i + 1}/${customers.length}] ${name} … `);

    let result    = null;
    let precision = 'mangler';

    // Forsøk 1: full adresse (gate + postnr + poststed)
    if (gate && postnr && poststed) {
      result = await geocode(`${gate}, ${postnr} ${poststed}, Norge`);
      if (result) precision = 'adresse';
      await sleep(DELAY_MS);
    }

    // Forsøk 2: poststed-fallback
    if (!result && poststed) {
      result = await geocode(`${poststed}, Norge`);
      if (result) {
        precision = 'by';
        byList.push(`${name} | ${poststed}`);
      }
      await sleep(DELAY_MS);
    }

    if (!result) {
      missingList.push(`${name} | gate="${gate || '–'}" poststed="${poststed || '–'}"`);
      console.log('INGEN TREFF');
      // Merker geo='mangler' (lat/lng forblir null) – hoppes over ved neste kjøring
      await updateCustomer(id, null, null, 'mangler');
      continue;
    }

    console.log(`${precision} → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`);
    await updateCustomer(id, result.lat, result.lng, precision);
    okCount++;
  }

  // ── Oppsummering ────────────────────────────────────────────────────────────

  console.log('\n=== OPPSUMMERING ===');
  console.log(`Geokoda:    ${okCount} / ${customers.length}`);
  if (byList.length)      { console.log(`\nBy-nivå (${byList.length}) — sjekk manuelt:`);  byList.forEach(l => console.log('  ' + l)); }
  if (missingList.length) { console.log(`\nIngen treff (${missingList.length}):`);          missingList.forEach(l => console.log('  ' + l)); }
  console.log('\nHusk: roter/invalider secret key hvis den ikke trengs lenger.');
}

main().catch(err => { console.error(err); process.exit(1); });
