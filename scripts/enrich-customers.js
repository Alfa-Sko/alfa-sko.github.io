// scripts/enrich-customers.js
// Beriker customers-tabellen i Supabase med kontaktinfo fra jorn_kunde_beriking.json.
//
// Autentisering: sb_secret_-nøkkel sendes KUN som "apikey"-header.
// Supabase sin API-gateway validerer den og gir service_role-tilgang (bypasser RLS).
// IKKE send den som "Authorization: Bearer" – da prøver PostgREST å parse den som
// JWT, feiler, og returnerer 401. (Kilde: supabase.com/docs/guides/api/api-keys)
//
// Kjør (PowerShell - tørrkjøring / vis matching):
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/enrich-customers.js
//
// Kjør (PowerShell - skriv etter godkjenning):
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/enrich-customers.js --write
//
// Regler:
//   - Matcher på name (eksakt, case-insensitiv).
//   - Skriver KUN felt med verdi i JSON-fila.
//   - Overskriver ALDRI eksisterende data med tom verdi.
//   - Advarer (og hopper over) hvis Supabase allerede har en annen verdi.
//   - eier_konstellasjon leses IKKE frå Supabase (PostgREST schema-cache ser den ikke),
//     men skrives blindt frå JSON-fila viss verdi finst.
//
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker.

const { readFileSync } = require('fs');
const { join }         = require('path');

const SUPA_URL  = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY  = process.env.SUPA_SECRET_KEY;
const WRITE     = process.argv.includes('--write');

if (!SUPA_KEY) {
  console.error('Feil: SUPA_SECRET_KEY er ikke satt.');
  console.error('Kjør: $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/enrich-customers.js');
  process.exit(1);
}

function sbHeaders(extra = {}) {
  return { apikey: SUPA_KEY, 'Content-Type': 'application/json', ...extra };
}

// ── Last og de-dupliser JSON ──────────────────────────────────────────────────

const rawJson = JSON.parse(
  readFileSync(join(__dirname, 'jorn_kunde_beriking.json'), 'utf8')
);

// Slår sammen duplikater (samme navn) ved å ta første ikke-null verdi per felt.
const jsonMap = new Map(); // lowercase-name → merged entry
for (const entry of rawJson) {
  const key = entry.name.trim().toLowerCase();
  if (!jsonMap.has(key)) {
    jsonMap.set(key, { ...entry, name: entry.name.trim() });
  } else {
    const existing = jsonMap.get(key);
    if (!existing.phone && entry.phone)                             existing.phone = entry.phone;
    if (!existing.email && entry.email)                             existing.email = entry.email;
    if (!existing.eier_konstellasjon && entry.eier_konstellasjon)   existing.eier_konstellasjon = entry.eier_konstellasjon;
  }
}
const jsonEntries = [...jsonMap.values()];

// ── Hent alle Supabase-kunder (paginert) ─────────────────────────────────────

async function fetchCustomers(cols) {
  const all = [];
  const PAGE = 1000;
  let offset = 0;
  for (;;) {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/customers?select=${cols}&order=name&limit=${PAGE}&offset=${offset}`,
      { headers: sbHeaders() }
    );
    if (!res.ok) throw new Error(`Supabase fetch feilet: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    all.push(...rows);
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

// ── Hjelpere ──────────────────────────────────────────────────────────────────

function isEmpty(v) { return v === null || v === undefined || v === ''; }
function norm(s)    { return (s || '').trim().toLowerCase(); }

// ── Hovedlogikk ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Alfa Kompass – customer enrichment ===`);
  console.log(`Modus: ${WRITE ? '⚠️  SKRIV' : '🔍 tørrkjøring (ingen endringer)'}\n`);

  // 1. Hent Supabase-kunder
  // eier_konstellasjon er utelatt: PostgREST sin schema-cache ser ikke kolonnen
  // og gir 401 ved select. Vi skriver den blindt via PATCH uten å lese den først.
  const sbCols = 'id,name,phone,email';
  const sbCustomers = await fetchCustomers(sbCols);
  console.log(`Supabase: ${sbCustomers.length} kunder hentet.`);
  console.log(`JSON-fil: ${rawJson.length} oppslag, ${jsonEntries.length} etter de-duplikering.\n`);

  // Bygg oppslagstabell: lowercase-name → supabase-rad
  const sbMap = new Map();
  for (const c of sbCustomers) sbMap.set(norm(c.name), c);

  // 3. Match JSON-oppslag mot Supabase
  const matched     = [];  // { json, sb }
  const noMatch     = [];  // json entries uten supabase-treff
  const caseChanged = [];  // treff der navn avviker i store/små bokstaver

  for (const je of jsonEntries) {
    const sb = sbMap.get(norm(je.name));
    if (sb) {
      matched.push({ json: je, sb });
      if (sb.name.trim() !== je.name) {
        caseChanged.push({ jsonName: je.name, sbName: sb.name.trim() });
      }
    } else {
      noMatch.push(je.name);
    }
  }

  // 4. Beregn hvilke felt som faktisk skal oppdateres
  const updates = []; // { sb, patch, warnings }
  const noData  = []; // matchede kunder der JSON ikke tilbyr noe nytt

  for (const { json: je, sb } of matched) {
    const patch    = {};
    const warnings = [];

    for (const field of ['phone', 'email', 'eier_konstellasjon']) {
      const jsonVal = (je[field] || '').trim();
      if (!jsonVal) continue; // JSON har ingen verdi — hopp over

      const sbVal = (sb[field] || '').trim();
      if (isEmpty(sbVal)) {
        patch[field] = jsonVal; // Supabase er tom → skriv
      } else if (sbVal.toLowerCase() !== jsonVal.toLowerCase()) {
        warnings.push(`${field}: Supabase="${sbVal}" vs JSON="${jsonVal}" → BEHOLDER Supabase-verdi`);
      }
      // sbVal === jsonVal: ingenting å gjøre
    }

    if (Object.keys(patch).length > 0 || warnings.length > 0) {
      updates.push({ sb, patch, warnings });
    } else {
      noData.push(sb.name.trim());
    }
  }

  // ── Rapport ──────────────────────────────────────────────────────────────

  const toWrite = updates.filter(u => Object.keys(u.patch).length > 0);

  console.log(`══════════════════════════════════════════════`);
  console.log(`MATCHING-RAPPORT`);
  console.log(`══════════════════════════════════════════════\n`);
  console.log(`✅ Matchet:        ${matched.length} av ${jsonEntries.length}`);
  console.log(`❌ Ingen treff:    ${noMatch.length}`);
  console.log(`🔄 Vil oppdatere: ${toWrite.length} kunder`);
  console.log(`⚠️  Konflikt:      ${updates.filter(u => u.warnings.length > 0).length} kunder (hopper over motstridende felt)`);
  console.log(`➖ Ingen ny data:  ${noData.length + (matched.length - updates.length - noData.length < 0 ? 0 : matched.length - toWrite.length - updates.filter(u => u.warnings.length > 0 && Object.keys(u.patch).length === 0).length - noData.length)} kunder\n`);

  if (caseChanged.length > 0) {
    console.log(`── Navn matchet case-insensitivt (ikke feil, bare info) ──`);
    for (const { jsonName, sbName } of caseChanged) {
      console.log(`   JSON: "${jsonName}"`);
      console.log(`   SB:   "${sbName}"`);
    }
    console.log();
  }

  if (noMatch.length > 0) {
    console.log(`── ❌ Ingen treff i Supabase (rettes manuelt) ──`);
    for (const n of noMatch) console.log(`   "${n}"`);
    console.log();
  }

  const conflictOnly = updates.filter(u => u.warnings.length > 0 && Object.keys(u.patch).length === 0);
  if (conflictOnly.length > 0) {
    console.log(`── ⚠️  Kunder der Supabase allerede har data (ingen skriving) ──`);
    for (const { sb, warnings } of conflictOnly) {
      console.log(`  "${sb.name.trim()}":`);
      for (const w of warnings) console.log(`    ${w}`);
    }
    console.log();
  }

  if (toWrite.length > 0) {
    console.log(`── 🔄 Planlagte oppdateringer ──`);
    for (const { sb, patch, warnings } of updates) {
      const fields = Object.keys(patch);
      if (fields.length > 0) {
        console.log(`  "${sb.name.trim()}":`);
        for (const f of fields) console.log(`    ${f} → "${patch[f]}"`);
      }
      for (const w of warnings) console.log(`    ⚠️ ${w}`);
    }
    console.log();
  }

  if (!WRITE) {
    console.log(`── Tørrkjøring fullført. Ingen endringer gjort. ──`);
    console.log(`Godkjenn rapporten ovenfor, kjør så med --write for å skrive:`);
    console.log(`  $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/enrich-customers.js --write`);
    return;
  }

  // ── Skriv ────────────────────────────────────────────────────────────────

  if (toWrite.length === 0) {
    console.log('Ingen kunder å oppdatere.');
    return;
  }

  console.log(`\n══════════════════════════════════════════════`);
  console.log(`SKRIVER ${toWrite.length} OPPDATERINGER`);
  console.log(`══════════════════════════════════════════════\n`);

  let ok = 0, fail = 0, ekOk = 0, ekFail = 0;
  for (const { sb, patch } of toWrite) {
    // Splitt: phone/email i éin PATCH, eier_konstellasjon separat.
    // Grunn: PostgREST schema-cache ser ikkje eier_konstellasjon – ein kombinert
    // PATCH ville feile for alle felt viss kolonnen ikkje er i cachen.
    const corePatch = {};
    const ekPatch   = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'eier_konstellasjon') ekPatch[k] = v;
      else corePatch[k] = v;
    }

    if (Object.keys(corePatch).length > 0) {
      const res = await fetch(
        `${SUPA_URL}/rest/v1/customers?id=eq.${sb.id}`,
        { method: 'PATCH', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(corePatch) }
      );
      if (res.ok) {
        ok++;
        console.log(`  ✅ "${sb.name.trim()}" → ${Object.entries(corePatch).map(([k,v])=>`${k}="${v}"`).join(', ')}`);
      } else {
        fail++;
        console.error(`  ❌ "${sb.name.trim()}" feilet: ${res.status} ${await res.text()}`);
      }
    }

    if (Object.keys(ekPatch).length > 0) {
      const res = await fetch(
        `${SUPA_URL}/rest/v1/customers?id=eq.${sb.id}`,
        { method: 'PATCH', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(ekPatch) }
      );
      if (res.ok) {
        ekOk++;
        console.log(`  ✅ "${sb.name.trim()}" → eier_konstellasjon="${ekPatch.eier_konstellasjon}"`);
      } else {
        const text = await res.text();
        ekFail++;
        if (res.status === 400) {
          console.warn(`  ⚠️  "${sb.name.trim()}" eier_konstellasjon SKIP (schema-cache): ${text}`);
        } else {
          console.error(`  ❌ "${sb.name.trim()}" eier_konstellasjon feilet: ${res.status} ${text}`);
        }
      }
    }
  }

  console.log(`\nFerdig: ${ok} kunder oppdatert (phone/email), ${fail} feilet.`);
  if (ekOk + ekFail > 0) {
    console.log(`eier_konstellasjon: ${ekOk} skrevet, ${ekFail} feilet (sjå ⚠️ over for schema-cache-feil).`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
