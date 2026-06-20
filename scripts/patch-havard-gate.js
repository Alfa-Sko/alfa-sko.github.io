// Engangs-skript: setter gate-kolonnen for Håvards 186 kunder (allerede innsatt).
// Nødvendig fordi migrate-havard.js v1 mappet address → address, ikke gate.
// geocode.js bruker gate for adresse-nivå geokoding – uten dette brukes kun poststed.
//
// PowerShell:
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/patch-havard-gate.js
//   $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/patch-havard-gate.js --write
//
// Krav: Node 18+ (innebygd fetch). Ingen npm-pakker nødvendig.

const fs     = require('fs');
const path   = require('path');

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = process.env.SUPA_SECRET_KEY;
if (!SUPA_KEY) {
  console.error('Feil: SUPA_SECRET_KEY er ikke satt.');
  console.error('Kjør: $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/patch-havard-gate.js');
  process.exit(1);
}

const DRY_RUN = !process.argv.includes('--write');

const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'havard_kunder_migrasjon.json'), 'utf8'));

// Bare kunder med gateadresse (hopp over POSTBOKS og tomme adresser)
const withAddress  = src.filter(c => c.address && !c.address.toUpperCase().startsWith('POSTBOKS'));
const withPostboks = src.filter(c => c.address &&  c.address.toUpperCase().startsWith('POSTBOKS'));
const withNone     = src.filter(c => !c.address);

console.log(`Totalt: ${src.length} kunder i JSON`);
console.log(`  Med gateadresse:  ${withAddress.length}  (disse patches)`);
console.log(`  POSTBOKS:         ${withPostboks.length}  (kun poststed-geokoding – hoppes over)`);
console.log(`  Ingen adresse:    ${withNone.length}     (kun poststed-geokoding – hoppes over)`);

if (DRY_RUN) {
  console.log('\n[TØRRKJØRING – ingen data skrives. Legg til --write for å utføre.]\n');
  console.log('Eksempel på hva som vil patches:');
  withAddress.slice(0, 5).forEach(c => console.log(`  ${c.name} → gate="${c.address}"`));
  if (withAddress.length > 5) console.log(`  ... og ${withAddress.length - 5} til`);
  console.log('\nKjør med --write for å sette gate på alle ' + withAddress.length + ' kunder:');
  console.log('  $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/patch-havard-gate.js --write');
  process.exit(0);
}

async function run() {
  let ok = 0, fail = 0;

  for (let i = 0; i < withAddress.length; i++) {
    const c = withAddress[i];
    const encodedName = encodeURIComponent(c.name);
    process.stdout.write(`[${i + 1}/${withAddress.length}] ${c.name} … `);

    const res = await fetch(
      `${SUPA_URL}/rest/v1/customers?name=eq.${encodedName}&district=eq.Vest%2FS%C3%B8r-Norge`,
      {
        method:  'PATCH',
        headers: {
          apikey:          SUPA_KEY,
          'Content-Type':  'application/json',
          Prefer:          'return=minimal',
        },
        body: JSON.stringify({ gate: c.address }),
      }
    );

    if (res.ok) {
      console.log('OK');
      ok++;
    } else {
      console.log('FEIL ' + res.status + ': ' + await res.text());
      fail++;
    }
  }

  console.log(`\n=== FERDIG ===`);
  console.log(`Patched: ${ok} / ${withAddress.length}`);
  if (fail) console.log(`Feilet:  ${fail}`);
  console.log('\nKjør nå: $env:SUPA_SECRET_KEY="sb_secret_..."; node scripts/geocode.js');
}

run().catch(err => { console.error(err); process.exit(1); });
