// scripts/geocode.js — geokoder kundene i Supabase customers-tabellen via Nominatim.
//
// Autentisering: logger inn som bruker og bruker user-JWT i Authorization-headeren.
// sb_secret_-nøkler er IKKE JWTs og fungerer ikke med PostgREST /rest/v1/.
// User-JWT fungerer fordi brukeren har skrivetilgang til egne kunder via RLS.
//
// Kjør (PowerShell):
//   $env:SUPA_EMAIL="jorn@alfa.no"
//   $env:SUPA_PASSWORD="<passord>"
//   node scripts/geocode.js
//
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.

const SUPA_URL         = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_PUBLISHABLE = 'sb_publishable_eflHUMlSGKaZIzb1YYjG3w_TTNKK1az';

const DELAY_MS = 1100; // > 1 sek mellom requests (Nominatim fair-use policy)
const UA       = 'AlfaKompass/1.0 (intern CRM, kontakt: jorn@alfa.no)';

// ── Login → hent user-JWT ────────────────────────────────────────────────────
// PostgREST validerer Authorization: Bearer <jwt> som et ekte JWT.
// sb_secret_-tokens er ikke JWTs og avvises av PostgREST med 401.

async function getAccessToken() {
  const email    = process.env.SUPA_EMAIL;
  const password = process.env.SUPA_PASSWORD;
  if (!email || !password) {
    console.error('Feil: SUPA_EMAIL og SUPA_PASSWORD må være satt som miljøvariabler.');
    process.exit(1);
  }
  const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method:  'POST',
    headers: { apikey: SUPA_PUBLISHABLE, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login feilet: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log(`Innlogget som ${data.user.email}\n`);
  return data.access_token;
}

// ── Supabase REST-headers (bruker user-JWT, ikke sb_secret_) ─────────────────

function sbHeaders(accessToken, extra = {}) {
  return {
    apikey:         SUPA_PUBLISHABLE,
    Authorization:  `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// ── Hent kunder uten koordinater ─────────────────────────────────────────────
// lat=is.null AND geo=is.null: kun kunder som ikke er forsøkt ennå.
// For å re-kjøre "mangler"-merkede: fjern &geo=is.null.

async function fetchUngeocoded(accessToken) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/customers?select=id,name,gate,postnr,poststed&lat=is.null&geo=is.null&order=name`,
    { headers: sbHeaders(accessToken) }
  );
  if (!res.ok) throw new Error(`Supabase fetch feilet: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── PATCH lat/lng/geo på én kunde (UUID) ─────────────────────────────────────

async function updateCustomer(accessToken, id, lat, lng, geo) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/customers?id=eq.${id}`,
    {
      method:  'PATCH',
      headers: sbHeaders(accessToken, { Prefer: 'return=minimal' }),
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
  const accessToken = await getAccessToken();
  const customers   = await fetchUngeocoded(accessToken);

  console.log(`Fant ${customers.length} kunder uten koordinater.\n`);
  if (customers.length === 0) { console.log('Ingenting å gjøre.'); return; }

  const byList = [], missingList = [];
  let okCount = 0;

  for (let i = 0; i < customers.length; i++) {
    const { id, name, gate, postnr, poststed } = customers[i];
    process.stdout.write(`[${i + 1}/${customers.length}] ${name} … `);

    let result = null, precision = 'mangler';

    // Forsøk 1: full adresse
    if (gate && postnr && poststed) {
      result = await geocode(`${gate}, ${postnr} ${poststed}, Norge`);
      if (result) precision = 'adresse';
      await sleep(DELAY_MS);
    }

    // Forsøk 2: poststed-fallback
    if (!result && poststed) {
      result = await geocode(`${poststed}, Norge`);
      if (result) { precision = 'by'; byList.push(`${name} | ${poststed}`); }
      await sleep(DELAY_MS);
    }

    if (!result) {
      missingList.push(`${name} | gate="${gate || '–'}" poststed="${poststed || '–'}"`);
      console.log('INGEN TREFF');
      await updateCustomer(accessToken, id, null, null, 'mangler');
      continue;
    }

    console.log(`${precision} → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`);
    await updateCustomer(accessToken, id, result.lat, result.lng, precision);
    okCount++;
  }

  console.log('\n=== OPPSUMMERING ===');
  console.log(`Geokoda:    ${okCount} / ${customers.length}`);
  if (byList.length)      { console.log(`\nBy-nivå (${byList.length}) — sjekk manuelt:`);  byList.forEach(l => console.log('  ' + l)); }
  if (missingList.length) { console.log(`\nIngen treff (${missingList.length}):`);          missingList.forEach(l => console.log('  ' + l)); }
}

main().catch(err => { console.error(err); process.exit(1); });
