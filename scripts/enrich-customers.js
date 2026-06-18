// scripts/enrich-customers.js
// Beriker customers-tabellen i Supabase med kontaktinfo fra jorn_kunde_beriking.json.
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
//   - eier_konstellasjon: scriptet sjekker om kolonnen finnes og stopper med DDL-instruksjon hvis ikke.
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

// ── Sjekk om kolonne finnes ───────────────────────────────────────────────────

async function columnExists(col) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/customers?select=${col}&limit=0`,
    { headers: sbHeaders() }
  );
  return res.ok;
}

// ── Hjelpere ──────────────────────────────────────────────────────────────────

function isEmpty(v) { return v === null || v === undefined || v === ''; }
function norm(s)    { return (s || '').trim().toLowerCase(); }

// ── Hovedlogikk ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Alfa Kompass – customer enrichment ===`);
  console.log(`Modus: ${WRITE ? '⚠️  SKRIV' : '🔍 tørrkjøring (ingen endringer)'}\n`);

  // 1. Sjekk eier_konstellasjon-kolonne
  const hasEk = await columnExists('eier_konstellasjon');
  if (!hasEk) {
    console.log('⚠️  Kolonnen eier_konstellasjon finnes IKKE i customers-tabellen.');
    console.log('Kjør dette i Supabase SQL Editor (Dashboard → SQL Editor):');
    console.log();
    console.log('  ALTER TABLE customers ADD COLUMN IF NOT EXISTS eier_konstellasjon text;');
    console.log();
    console.log('Kjør deretter scriptet på nytt.');
    process.exit(1);
  }
  console.log('✅ Kolonne eier_konstellasjon finnes.\n');

  // 2. Hent Supabase-kunder
  const sbCols = 'id,name,phone,email,eier_konstellasjon';
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

  let ok = 0, fail = 0;
  for (const { sb, patch } of toWrite) {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/customers?id=eq.${sb.id}`,
      {
        method:  'PATCH',
        headers: sbHeaders({ Prefer: 'return=minimal' }),
        body:    JSON.stringify(patch),
      }
    );
    if (res.ok) {
      ok++;
      const fields = Object.entries(patch).map(([k, v]) => `${k}="${v}"`).join(', ');
      console.log(`  ✅ "${sb.name.trim()}" → ${fields}`);
    } else {
      fail++;
      console.error(`  ❌ "${sb.name.trim()}" feilet: ${res.status} ${await res.text()}`);
    }
  }

  console.log(`\nFerdig: ${ok} oppdatert, ${fail} feilet.`);
}

main().catch(e => { console.error(e); process.exit(1); });
