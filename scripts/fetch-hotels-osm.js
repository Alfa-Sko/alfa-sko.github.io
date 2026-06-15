#!/usr/bin/env node
// scripts/fetch-hotels-osm.js
// Henter hoteller i Norge fra OpenStreetMap via Overpass API og genererer js/hotels-data.js.
// Kjøres fra repo-roten: "C:\Program Files\nodejs\node.exe" scripts/fetch-hotels-osm.js
//
// Utdata: js/hotels-data.js med const HOTELS_OSM = { 'By': [{name, lat, lon, type}] }
// Hoteller uten navn hoppes over.
// Hoteller uten addr:city/addr:municipality normaliseres til nærmeste kjente by via haversine.

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── CITY_COORDS (kopi fra js/planner-data.js + ekstra dekning for sørvest/østland) ───
const CITY_COORDS = {
  // Nord-Norge
  'Tromsø':[69.6492,18.9553],'Harstad':[68.7989,16.5419],'Narvik':[68.4385,17.4272],
  'Alta':[69.9689,23.2716],'Hammerfest':[70.6634,23.6821],'Honningsvåg':[70.9821,25.9704],
  'Kirkenes':[69.7273,30.0455],'Vadsø':[70.0739,29.7497],'Vardø':[70.3705,31.1107],
  'Båtsfjord':[70.6346,29.7185],'Lakselv':[70.0506,24.9730],'Karasjok':[69.472,25.5108],
  'Kautokeino':[69.0125,23.0361],'Storslett':[69.7677,21.0353],'Skjervøy':[70.0314,20.9709],
  'Finnsnes':[69.2300,17.9707],'Setermoen':[68.8607,18.3430],'Bardufoss':[69.0566,18.5126],
  'Sjøvegan':[68.8758,17.8247],'Sørreisa':[69.1539,18.1556],'Lyngseidet':[69.5806,20.2197],
  'Bardu':[68.8625,18.3536],'Andenes':[69.3247,16.1197],'Lødingen':[68.4097,15.9986],
  'Bjerkvik':[68.5408,17.5536],'Ballangen':[68.3439,16.8389],
  // Lofoten/Vesterålen
  'Svolvær':[68.2342,14.5662],'Leknes':[68.1462,13.6105],
  'Stokmarknes':[68.5664,14.9112],'Sortland':[68.6986,15.4117],
  'Bø i Vesterålen':[68.6731,14.5089],
  // Nordland
  'Bodø':[67.2804,14.4050],'Fauske':[67.2596,15.3917],'Rognan':[67.1017,15.3919],
  'Ørnes':[66.8678,13.7106],'Mo i Rana':[66.3128,14.1428],'Mosjøen':[65.8378,13.1907],
  'Sandnessjøen':[66.0228,12.6300],'Brønnøysund':[65.4744,12.2107],'Rørvik':[64.8625,11.2369],
  // Trøndelag
  'Trondheim':[63.4305,10.3951],'Steinkjer':[64.0145,11.4954],'Namsos':[64.4664,11.5005],
  'Levanger':[63.7461,11.2999],'Verdal':[63.7917,11.4814],'Stjørdal':[63.4683,10.9197],
  'Grong':[64.4631,12.3107],'Røros':[62.5747,11.3845],'Oppdal':[62.5949,9.6913],
  'Orkanger':[63.3079,9.8463],'Støren':[63.0427,10.2884],'Melhus':[63.2876,10.2766],
  // Møre og Romsdal
  'Ålesund':[62.4722,6.1495],'Molde':[62.7375,7.1591],'Kristiansund':[63.1115,7.7282],
  'Åndalsnes':[62.5639,7.6861],'Ørsta':[62.2011,6.1336],'Volda':[62.1467,6.0681],
  'Sunndalsøra':[62.6717,8.5611],'Tingvoll':[62.9025,8.1817],
  // Vestland
  'Bergen':[60.3913,5.3221],'Voss':[60.6270,6.4171],'Sogndal':[61.2292,7.1007],
  'Florø':[61.5999,5.0329],'Nordfjordeid':[61.8996,5.9875],'Stryn':[61.9042,6.7283],
  'Odda':[60.0682,6.5440],'Norheimsund':[60.3694,6.1490],'Leirvik':[59.7841,5.5033],
  'Stord':[59.7841,5.5033],'Os':[60.1914,5.4714],'Askøy':[60.4039,5.1643],
  // Rogaland
  'Stavanger':[58.9700,5.7331],'Sandnes':[58.8516,5.7348],'Haugesund':[59.4136,5.2686],
  'Egersund':[58.4518,6.0022],'Bryne':[58.7311,5.6458],'Kopervik':[59.2842,5.3133],
  // Agder
  'Kristiansand':[58.1599,8.0182],'Arendal':[58.4610,8.7726],'Grimstad':[58.3437,8.5930],
  'Mandal':[58.0286,7.4621],'Farsund':[58.0957,6.8008],'Flekkefjord':[58.2981,6.6635],
  'Lyngdal':[58.1393,7.0726],'Evje':[58.5895,7.9994],'Vennesla':[58.2768,7.9721],
  // Telemark / Vestfold
  'Skien':[59.2080,9.6065],'Porsgrunn':[59.1417,9.6553],'Notodden':[59.5598,9.2625],
  'Kongsberg':[59.6643,9.6439],'Sandefjord':[59.1313,10.2167],'Larvik':[59.0564,10.0338],
  'Tønsberg':[59.2671,10.4075],'Horten':[59.4143,10.4836],'Holmestrand':[59.4900,10.3243],
  // Innlandet
  'Lillehammer':[61.1153,10.4662],'Gjøvik':[60.7954,10.6919],'Hamar':[60.7944,11.0679],
  'Elverum':[60.8835,11.5622],'Røros':[62.5747,11.3845],'Fagernes':[60.9891,9.2281],
  'Vinstra':[61.5709,9.7499],'Otta':[61.7728,9.5383],'Dombås':[62.0721,9.1340],
  // Viken / Østfold / Akershus
  'Oslo':[59.9139,10.7522],'Drammen':[59.7440,10.2045],'Fredrikstad':[59.2214,10.9304],
  'Sarpsborg':[59.2839,11.1096],'Moss':[59.4344,10.6579],'Halden':[59.1228,11.3876],
  'Lillestrøm':[59.9534,11.0527],'Jessheim':[60.1422,11.1719],'Ski':[59.7196,10.8348],
  'Kongsvinger':[60.1906,12.0024],'Eidsvoll':[60.3292,11.2658],'Sandvika':[59.8915,10.5239],
  'Asker':[59.8337,10.4388],'Bærum':[59.9066,10.5267],'Lørenskog':[59.9183,10.9563],
  'Nittedal':[60.0667,10.9167],'Ås':[59.6597,10.7949],'Askim':[59.5806,11.1581],
  'Mysen':[59.5548,11.3311],'Follo':[59.7211,10.8222],
  // Longyearbyen
  'Longyearbyen':[78.2232,15.6267],
};

// ─── HAVERSINE ───────────────────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function nearestCity(lat, lon) {
  let best = null, bestDist = Infinity;
  for (const [name, [clat, clon]] of Object.entries(CITY_COORDS)) {
    const d = haversineKm(lat, lon, clat, clon);
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return { city: best, distKm: Math.round(bestDist) };
}

// ─── OVERPASS-SPØRRING ───────────────────────────────────────────────────────
const QUERY = `[out:json][timeout:120];
area["ISO3166-1"="NO"]->.a;
(
  node[tourism~"^(hotel|guest_house|hostel)$"](area.a);
  way[tourism~"^(hotel|guest_house|hostel)$"](area.a);
  relation[tourism~"^(hotel|guest_house|hostel)$"](area.a);
);
out center;`;

// ─── MAIN ────────────────────────────────────────────────────────────────────
console.log('Sender spørring til Overpass API (kan ta 30–60 sek)…');

const postBody = 'data=' + encodeURIComponent(QUERY);
const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postBody),
    'User-Agent': 'alfa-sko-hotel-fetcher/1.0 (internal tool)',
  },
};

const req = https.request(options, (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    if (res.statusCode !== 200) {
      console.error(`HTTP ${res.statusCode}: ${raw.slice(0, 400)}`);
      process.exit(1);
    }
    processData(raw);
  });
});

req.setTimeout(150_000, () => { req.destroy(new Error('Request timeout')); });
req.on('error', err => { console.error('Nettverksfeil:', err.message); process.exit(1); });
req.write(postBody);
req.end();

// ─── PROSESSERING ────────────────────────────────────────────────────────────
function processData(jsonStr) {
  let osm;
  try { osm = JSON.parse(jsonStr); }
  catch (e) { console.error('JSON-feil:', e.message, jsonStr.slice(0, 200)); process.exit(1); }

  const elements = osm.elements || [];
  console.log(`Mottok ${elements.length} OSM-elementer`);

  let skippedNoName = 0, skippedNoCoord = 0, cityFromAddr = 0, cityFromNearest = 0;
  const hotels = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || '').trim();
    if (!name) { skippedNoName++; continue; }

    // Koordinater: node → direkte, way/relation → center
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) { skippedNoCoord++; continue; }

    const type = tags.tourism; // hotel | guest_house | hostel
    const addrCity = (tags['addr:city'] || tags['addr:municipality'] || '').trim();

    let city;
    if (addrCity) {
      city = addrCity;
      cityFromAddr++;
    } else {
      city = nearestCity(lat, lon).city;
      cityFromNearest++;
    }

    hotels.push({
      name,
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
      city,
      type,
    });
  }

  console.log(`\n─── Resultat ───`);
  console.log(`  Totalt med navn:      ${hotels.length}`);
  console.log(`  Hoppet over (ingen navn): ${skippedNoName}`);
  console.log(`  Hoppet over (ingen koord): ${skippedNoCoord}`);
  console.log(`  By fra addr:city:     ${cityFromAddr}`);
  console.log(`  By fra nærmeste:      ${cityFromNearest}`);

  // Fordeling per by (topp 25)
  const byCity = {};
  for (const h of hotels) { byCity[h.city] = (byCity[h.city] || 0) + 1; }
  const topCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]);
  console.log(`\n  Totalt antall byer:   ${topCities.length}`);
  console.log(`\nTopp 25 byer:`);
  topCities.slice(0, 25).forEach(([c, n]) => console.log(`  ${String(n).padStart(3)}  ${c}`));

  console.log(`\n10 eksempler:`);
  hotels.slice(0, 10).forEach(h =>
    console.log(`  ${h.name.padEnd(40)} | ${h.city.padEnd(18)} | ${h.lat}, ${h.lon}  [${h.type}]`)
  );

  // ─── Bygg HOTELS_OSM: { 'By': [{name, lat, lon, type}] } ─────────────────
  const byCity2 = {};
  for (const h of hotels) {
    if (!byCity2[h.city]) byCity2[h.city] = [];
    byCity2[h.city].push({ name: h.name, lat: h.lat, lon: h.lon, type: h.type });
  }
  // Sorter hoteller per by alfabetisk på navn
  for (const list of Object.values(byCity2)) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'no'));
  }

  // ─── Skriv js/hotels-data.js ──────────────────────────────────────────────
  const totalH = hotels.length;
  const totalC = Object.keys(byCity2).length;
  const outPath = path.join(__dirname, '..', 'js', 'hotels-data.js');

  const header = [
    '// js/hotels-data.js',
    `// Kilde: OpenStreetMap (Overpass API) — tourism=hotel/guest_house/hostel i Norge`,
    `// Generert: ${new Date().toISOString().slice(0, 10)}`,
    `// ${totalH} hoteller i ${totalC} byer/steder`,
    `// Hoteller uten addr:city er tilordnet nærmeste by fra CITY_COORDS (haversine).`,
    '',
    '// Slå opp hoteller per by. Brukes av planleggeren for å foreslå overnatting og',
    '// beregne kjøring fra hotell til første kundestopp neste dag.',
    `const HOTELS_OSM = `,
  ].join('\n');

  const body = JSON.stringify(byCity2, null, 2);
  const footer = ';\n';

  fs.writeFileSync(outPath, header + body + footer, 'utf8');
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`\nSkrev ${outPath} (${kb} KB)`);
}
