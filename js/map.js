// ─── KART-MODUL (Leaflet) ────────────────────────────────────────────────────
// Gjenbrukbar modul for oversiktskart og planlegger-rutevisning (fase 3).
// Forutsetter at Leaflet er lastet (via CDN i index.html) og
// at #map-container finnes i DOM-en.

let _mapInstance = null; // Leaflet-instans, gjenbrukes på tvers av besøk
let _mapLayers   = [];   // aktive lag (markører, linjer), fjernes ved re-render
let _mapLegend   = null; // Leaflet-control for tegnforklaring

// ── Kjede → farge ────────────────────────────────────────────────────────────
// Rekkefølgen er viktig: "Jaktia Norge · Stadion" treffer jaktia før stadion.

function _chainColor(chain) {
  if (!chain) return '#3A7A3A';
  const c = chain.toLowerCase();
  if (c.includes('intersport')) return '#DA291C'; // PMS 485
  if (c.includes('jaktia'))     return '#693F23'; // PMS 469
  if (c.includes('stadion'))    return '#002F6C'; // PMS 294
  if (/sport\s*1/.test(c))      return '#005EB8'; // PMS 300
  return '#00B140';                               // PMS 354 (frittstående/andre)
}

// ── Mørkere fargetone til skyggedelen av 3D-gradienten ───────────────────────

function _darken(hex, f = 0.52) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
}

// ── Knappenål-ikon (3D-kule + nål, SVG i L.divIcon) ─────────────────────────
//
// Oppbygning (topp → bunn):
//   • radialGradient: hvitt høylys øverst til venstre → basisfarge → mørk skygge
//   • polygon: tynn nål fra kule-bunnen ned til spissen (ankerpunkt)
//   • ellipse: subtil skygge i overgangen kule/nål for dybdeeffekt
//   • circle: den 3D-graderte kula
//   • ellipse: lite høylys-flekk øverst til venstre på kula
//
// Alle markører med samme kjede-farge deler gradient-ID (identisk innhold → OK).

function _pinIcon(color) {
  const gid  = 'mpin_' + color.replace('#', '');
  const dark = _darken(color);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="38" viewBox="0 0 20 38">` +
    `<defs>` +
    `<radialGradient id="${gid}" cx="36%" cy="28%" r="70%">` +
    `<stop offset="0%"   stop-color="white"   stop-opacity="0.80"/>` +
    `<stop offset="42%"  stop-color="${color}" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="${dark}"  stop-opacity="1"/>` +
    `</radialGradient>` +
    `</defs>` +
    // Nål (polygon: toppkant 9–11, spiss 10,37)
    `<polygon points="9,18 11,18 10,37" fill="#2e2e2e"/>` +
    // Subtil ellipse-skygge i kule/nål-overgangen
    `<ellipse cx="10" cy="18" rx="5" ry="2" fill="rgba(0,0,0,0.18)"/>` +
    // Kule
    `<circle cx="10" cy="9.5" r="9" fill="url(#${gid})" stroke="rgba(0,0,0,0.22)" stroke-width="0.8"/>` +
    // Høylys-flekk (liten lys ellipse øverst til venstre)
    `<ellipse cx="7" cy="6.5" rx="3" ry="2.2" fill="white" opacity="0.52" transform="rotate(-20 7 6.5)"/>` +
    `</svg>`;
  return L.divIcon({
    html:        svg,
    className:   '',
    iconSize:    [20, 38],
    iconAnchor:  [10, 37],  // spissen av nålen
    popupAnchor: [0, -38],
  });
}

// ── Tegnforklaring ────────────────────────────────────────────────────────────

const _LEGEND_ITEMS = [
  { label: 'Intersport',            color: '#DA291C' }, // PMS 485
  { label: 'Sport 1',               color: '#005EB8' }, // PMS 300
  { label: 'Stadion',               color: '#002F6C' }, // PMS 294
  { label: 'Jaktia',                color: '#693F23' }, // PMS 469
  { label: 'Frittstående / andre',  color: '#00B140' }, // PMS 354
];

// ── Privat: initialiser eller gjenbruk kart ──────────────────────────────────

function _ensureMap(containerId) {
  if (_mapInstance) {
    setTimeout(() => _mapInstance.invalidateSize(), 0);
    return _mapInstance;
  }
  _mapInstance = L.map(containerId, { zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere',
    maxZoom: 19,
  }).addTo(_mapInstance);
  return _mapInstance;
}

function _clearLayers() {
  if (!_mapInstance) return;
  _mapLayers.forEach(l => _mapInstance.removeLayer(l));
  _mapLayers = [];
  if (_mapLegend) { _mapInstance.removeControl(_mapLegend); _mapLegend = null; }
}

// ── OVERSIKTSKART ────────────────────────────────────────────────────────────
// Viser alle kunder med koordinater som 3D-knappenåler, fargekoda på kjede.
// geo='adresse'/'manuell' = presis posisjon, geo='by' = kommunesentrum (omtrentlig).

function mapInitOverview() {
  const map = _ensureMap('map-container');
  _clearLayers();

  const customers = getCustomers().filter(c => c.lat != null && c.lng != null);
  if (customers.length === 0) {
    map.setView([65.5, 15], 5);
    return;
  }

  const overviewCoords = _spreadDuplicates(customers.map(c => [c.lat, c.lng]));
  customers.forEach((c, ci) => {
    try {
      const marker = L.marker(overviewCoords[ci], { icon: _pinIcon(_chainColor(c.chain)) });

      const l12str   = c.l12 > 0 ? c.l12.toLocaleString('no-NO') + ' kr' : '–';
      const clsBadge = c.class
        ? `<span style="background:#E6F1FB;color:#0C447C;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700">${c.class}-kunde</span> `
        : '';
      const precTxt = c.geo === 'adresse' ? '📍 adresse'
                    : c.geo === 'manuell'  ? '📍 manuelt koordinat'
                    : '○ by-nivå (omtrentlig)';

      const safeName = c.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      marker.bindPopup(
        `<div style="min-width:190px;font-family:inherit">` +
        `<div style="font-weight:700;font-size:14px;margin-bottom:3px">${c.name}</div>` +
        `<div style="font-size:12px;color:#555;margin-bottom:7px">${c.city || ''}${c.chain ? ' · ' + c.chain : ''}</div>` +
        `<div style="font-size:12px;margin-bottom:4px">${clsBadge}<span style="color:#666">L12: ${l12str}</span></div>` +
        `<div style="font-size:10px;color:#999;margin-top:4px;border-top:1px solid #eee;padding-top:4px">${precTxt}</div>` +
        `<button onclick="goToCustomer('${safeName}')" style="margin-top:8px;width:100%;padding:6px 8px;background:#2C2C2A;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">🏪 Åpne kundekort</button>` +
        `</div>`,
        { maxWidth: 260 }
      );

      marker.addTo(map);
      _mapLayers.push(marker);
    } catch (e) {
      console.warn('mapInitOverview: feil ved markør for', c.name, e);
    }
  });

  if (_mapLayers.length > 0) {
    map.fitBounds(L.featureGroup(_mapLayers).getBounds().pad(0.06));
  }

  // Ladestasjon-toggle-knapp (berre éin gong per kart-instans)
  if (!document.getElementById('charger-toggle-btn')) {
    const chargerCtrl = L.control({ position: 'topleft' });
    chargerCtrl.onAdd = function() {
      const div = L.DomUtil.create('div');
      div.innerHTML =
        '<button id="charger-toggle-btn" onclick="mapToggleChargers(!window._nobilChargerOn)" ' +
        'style="padding:6px 12px;background:#fff;border:1px solid #D3D1C7;border-radius:6px;' +
        'font-size:12px;font-weight:500;cursor:pointer;color:#5F5E5A;' +
        'box-shadow:0 1px 4px rgba(0,0,0,0.12);white-space:nowrap">⚡ Ladestasjoner</button>';
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    chargerCtrl.addTo(map);
  }

  // Tegnforklaring
  _mapLegend = L.control({ position: 'bottomright' });
  _mapLegend.onAdd = function() {
    const div = L.DomUtil.create('div');
    div.style.cssText =
      'background:white;padding:10px 12px;border-radius:8px;font-size:12px;' +
      'line-height:1.9;box-shadow:0 2px 8px rgba(0,0,0,0.18);min-width:150px';
    div.innerHTML =
      `<div style="font-weight:700;margin-bottom:4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.5px">Kjede</div>` +
      _LEGEND_ITEMS.map(it =>
        `<div><span style="display:inline-block;width:11px;height:11px;border-radius:50%;` +
        `background:${it.color};margin-right:7px;vertical-align:middle;border:1px solid rgba(0,0,0,0.15)"></span>${it.label}</div>`
      ).join('');
    return div;
  };
  _mapLegend.addTo(map);
}

// ── RUTEVISNING (fase 3 – planlegger) ────────────────────────────────────────
// stops: [{lat, lng, name, ...}], options: {fitBounds: true}
// Implementeres når kartet kobles til planleggeren.

function mapShowRoute(stops, options) {
  // TODO: rutelinje + stopp-markører
}

// ── PLANLEGGER-DAGSKART ───────────────────────────────────────────────────────
// Viser én rute per plandag: start (hjem/hotell) → kunder i rekkefølge → slutt.
// Kjørelinjen hentes fra OSRM (gratis, ingen nøkkel); fallback = rett stiplet linje.

let _dayMapInstances = [];

// Oppslag i CITY_COORDS (definert i planner-data.js)
function _cityCoord(city) {
  if (!city) return null;
  const t = (typeof CITY_COORDS !== 'undefined') ? CITY_COORDS : {};
  return t[city] ? [t[city][0], t[city][1]] : null;
}

// Nummerert ballong-pin (kjede-farge + hvitt tall)
function _numberedPinIcon(n, color) {
  const dark = _darken(color, 0.60);
  const fs = n > 9 ? 10 : 13;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34">` +
    `<circle cx="14" cy="13" r="12" fill="${color}" stroke="white" stroke-width="2"/>` +
    `<polygon points="11,25 17,25 14,34" fill="${dark}"/>` +
    `<text x="14" y="13" text-anchor="middle" dominant-baseline="central" ` +
    `fill="white" font-size="${fs}" font-weight="700" font-family="Arial,sans-serif">${n}</text>` +
    `</svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -36] });
}

// Start- eller slutt-pin (bokstav + bakgrunnsfarge)
function _labelPin(letter, bgColor) {
  const dark = _darken(bgColor, 0.60);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34">` +
    `<circle cx="14" cy="13" r="12" fill="${bgColor}" stroke="white" stroke-width="2"/>` +
    `<polygon points="11,25 17,25 14,34" fill="${dark}"/>` +
    `<text x="14" y="13" text-anchor="middle" dominant-baseline="central" ` +
    `fill="white" font-size="10" font-weight="700" font-family="Arial,sans-serif">${letter}</text>` +
    `</svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -36] });
}

// Liten grå +-pin for "nearby"-kunder som ikke er i planen ennå
function _grayNearbyPinIcon() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28">` +
    `<circle cx="11" cy="10" r="9" fill="#888780" stroke="white" stroke-width="1.5"/>` +
    `<polygon points="9,19 13,19 11,28" fill="#5F5E5A"/>` +
    `<text x="11" y="10" text-anchor="middle" dominant-baseline="central" ` +
    `fill="white" font-size="13" font-weight="700" font-family="Arial,sans-serif">+</text>` +
    `</svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [22, 28], iconAnchor: [11, 28], popupAnchor: [0, -30] });
}

// Finn kunder som ikke er i noen dag i planen, men er nær dagens rute.
// "Nær" = same by som eit stopp ELLER ≤ 60 min kjøring unna ELLER
// ≤ 60 min koordinatavstand frå dagens hotell-startpunkt (dag 2+).
function _computeNearbyCustomers(day, days) {
  if (typeof getCustomers !== 'function' || typeof getDriveMin !== 'function') return [];
  const inPlan = new Set();
  days.forEach(d => (d.customers || []).forEach(c => inPlan.add(c.id != null ? c.id : c.name)));
  const dayCities = new Set((day.customers || []).map(c => c.city).filter(Boolean));
  if (day.startCity) dayCities.add(day.startCity);
  const hotelCoord = (day.startHotel && day.startHotel.lat != null && day.startHotel.lon != null)
    ? [day.startHotel.lat, day.startHotel.lon] : null;
  if (dayCities.size === 0 && !hotelCoord) return [];
  return getCustomers().filter(c => {
    if (!c.city || inPlan.has(c.id != null ? c.id : c.name)) return false;
    if (dayCities.has(c.city)) return true;
    for (const city of dayCities) {
      if (getDriveMin(city, c.city) <= 60) return true;
    }
    // Koordinatavstand frå hotell-startpunkt (fangar kunder langs hotell→første-stopp)
    if (hotelCoord && c.lat != null && c.lng != null &&
        typeof _routeInfoFromCoords === 'function') {
      const info = _routeInfoFromCoords(hotelCoord[0], hotelCoord[1], c.lat, c.lng, '');
      if (info && info.min <= 60) return true;
    }
    return false;
  });
}

// Hent veirute fra OSRM (én samlet request per dag)
async function _fetchOsrmRoute(latLngs) {
  if (latLngs.length < 2) return null;
  const coords = latLngs.map(ll => `${ll[1]},${ll[0]}`).join(';');
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    );
    clearTimeout(tid);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.routes || !json.routes[0]) return null;
    // OSRM: [lng, lat] → Leaflet: [lat, lng]
    return json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  } catch (_) {
    clearTimeout(tid);
    return null;
  }
}

// Spre pins med identisk/nær-identisk koordinat i en sirkel (spiderfy-lignende).
// Input/output: array av [lat, lng]-par. Toleranse 4 desimaler ≈ 11 m.
function _spreadDuplicates(coords) {
  const key = ll => `${ll[0].toFixed(4)},${ll[1].toFixed(4)}`;
  const groups = {};
  coords.forEach((ll, i) => {
    const k = key(ll);
    if (!groups[k]) groups[k] = [];
    groups[k].push(i);
  });
  const out = coords.map(ll => [ll[0], ll[1]]);
  Object.values(groups).forEach(idxs => {
    if (idxs.length < 2) return;
    const n = idxs.length;
    const R = 0.003; // ~300 m offset-radius
    idxs.forEach((i, j) => {
      const a = (2 * Math.PI * j) / n - Math.PI / 2;
      out[i][0] += R * Math.cos(a);
      out[i][1] += R * Math.sin(a) * 0.6;
    });
  });
  return out;
}

// Fjern alle eksisterende dagskart-instanser (kall FØR ny output.innerHTML)
function _destroyDayMaps() {
  _dayChargerLayers.forEach(l => { try { if(l) l.clearLayers(); } catch(_){} });
  _dayChargerLayers = [];
  _dayMapInstances.forEach(m => { try { m.remove(); } catch (_) {} });
  _dayMapInstances = [];
  window._nearbyPinMap = {};
}

// Initialisér kart for én plandag
async function _initOneDayMap(day, dayIdx, homeBase, tripMeta, days) {
  const container = document.getElementById('plan-map-' + dayIdx);
  if (!container) return;

  // ── Startpunkt ──────────────────────────────────────────────────────────────
  // Dag 2+: bruk hotell-koordinat om tilgjengeleg (eksakt adresse, ikkje by-sentrum)
  const startCity = day.startCity || (dayIdx === 0 ? homeBase : '');
  const hotelStartCoord = (day.startHotel && day.startHotel.lat != null && day.startHotel.lon != null)
    ? [day.startHotel.lat, day.startHotel.lon] : null;
  const startCoord = hotelStartCoord || _cityCoord(startCity);
  const startIsHome = dayIdx === 0 || (day.sleepAtHome && !hotelStartCoord && dayIdx > 0);
  const startIcon = _labelPin('A', startIsHome ? '#2C2C2A' : '#BA7517');
  const startPopup = hotelStartCoord
    ? `<strong>🏨 Start: ${day.startHotel.name}</strong>`
    : startIsHome
      ? `<strong>🏠 Start: ${startCity || 'Hjem'}</strong>`
      : `<strong>🏨 Hotell/start: ${startCity || ''}</strong>`;

  // ── Kundestoppene ────────────────────────────────────────────────────────────
  const custStops = day.customers.map(c => {
    const coord = (c.lat != null && c.lng != null) ? [c.lat, c.lng] : _cityCoord(c.city);
    return coord ? { coord, customer: c } : null;
  }).filter(Boolean);
  // Spre duplikate by-senter-koordinater så alle pins er synlige og klikkbare
  _spreadDuplicates(custStops.map(s => s.coord)).forEach((c, i) => { custStops[i].coord = c; });

  // ── Sluttpunkt (hotell/hjem) ─────────────────────────────────────────────────
  let endCity = null, endIsHome = false, endHotelName = '';
  if (day.returnHome) {
    endCity = day.returnHome.to || homeBase; endIsHome = true;
  } else if (day.eveningTransfer) {
    endCity = day.eveningTransfer.to;
  } else if (day.hotel && day.hotel.city) {
    endCity = day.hotel.city; endHotelName = day.hotel.name || '';
  } else if (day.sleepAtHome) {
    endCity = homeBase; endIsHome = true;
  } else if (day.sleepCity) {
    endCity = day.sleepCity;
  }
  const endCoord = _cityCoord(endCity);
  const endIcon = _labelPin('Z', endIsHome ? '#1A5C3A' : '#BA7517');
  const endPopup = endIsHome
    ? `<strong>🏠 Hjem: ${endCity || homeBase}</strong>`
    : `<strong>🏨 ${endHotelName || 'Hotell'}: ${endCity || ''}</strong>`;

  // ── Alle koordinater (for bounds) ───────────────────────────────────────────
  const allCoords = [
    ...(startCoord ? [startCoord] : []),
    ...custStops.map(s => s.coord),
    ...(endCoord && endCity !== startCity ? [endCoord] : []),
  ];
  if (allCoords.length === 0) { container.style.display = 'none'; return; }

  // ── Leaflet-instans ──────────────────────────────────────────────────────────
  const map = L.map(container, { zoomControl: false, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);
  _dayMapInstances.push(map);

  // ── Startmarkør ─────────────────────────────────────────────────────────────
  if (startCoord) {
    L.marker(startCoord, { icon: startIcon }).bindPopup(startPopup).addTo(map);
  }

  // ── Kunde-pins (nummerert, kjede-farge) ─────────────────────────────────────
  custStops.forEach((s, i) => {
    const c = s.customer;
    const color = _chainColor(c.chain);
    const t = mins => `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;
    const l12str = c.l12 > 0 ? c.l12.toLocaleString('no-NO') + ' kr' : '–';
    const popup =
      `<div style="min-width:160px;font-family:inherit">` +
      `<div style="font-weight:700;font-size:13px">${i+1}. ${c.name}</div>` +
      `<div style="font-size:11px;color:#555;margin:3px 0">${c.city||''}${c.chain ? ' · '+c.chain : ''}</div>` +
      `<div style="font-size:11px">🕐 ${t(c._start)} – ${t(c._end)} · L12: ${l12str}</div>` +
      `</div>`;
    L.marker(s.coord, { icon: _numberedPinIcon(i+1, color) }).bindPopup(popup).addTo(map);
  });

  // ── Sluttmarkør (hotell / hjem) ─────────────────────────────────────────────
  if (endCoord && endCity !== startCity) {
    L.marker(endCoord, { icon: endIcon }).bindPopup(endPopup).addTo(map);
  }

  // ── Kart-bounds ─────────────────────────────────────────────────────────────
  const boundsGroup = L.featureGroup(allCoords.map(c => L.marker(c, { opacity: 0 })));
  map.fitBounds(boundsGroup.getBounds().pad(0.18));
  setTimeout(() => map.invalidateSize(), 50);

  // ── Nearby-pins: kunder nær ruta som ikke er i planen ────────────────────────
  if (days) {
    const nearby = _computeNearbyCustomers(day, days);
    const nearbyCoords = _spreadDuplicates(nearby.map(c =>
      (c.lat != null && c.lng != null) ? [c.lat, c.lng] : (_cityCoord(c.city) || null)
    ).filter(Boolean));
    let ni = 0;
    nearby.forEach(c => {
      const rawCoord = (c.lat != null && c.lng != null) ? [c.lat, c.lng] : _cityCoord(c.city);
      if (!rawCoord) return;
      const coord = nearbyCoords[ni++];
      const key = 'np_' + dayIdx + '_' + ni;
      window._nearbyPinMap = window._nearbyPinMap || {};
      window._nearbyPinMap[key] = c;
      const l12str = c.l12 > 0 ? c.l12.toLocaleString('no-NO') + ' kr' : '–';
      const popup =
        `<div style="min-width:170px;font-family:inherit">` +
        `<div style="font-weight:700;font-size:13px;margin-bottom:2px">${c.name}</div>` +
        `<div style="font-size:11px;color:#555;margin-bottom:5px">${c.city||''}${c.chain?' · '+c.chain:''}</div>` +
        `<div style="font-size:11px;color:#666;margin-bottom:8px">L12: ${l12str}</div>` +
        `<button onclick="if(typeof showInsertPositionPicker==='function')` +
        ` showInsertPositionPicker(${dayIdx},window._nearbyPinMap['${key}'])" ` +
        `style="width:100%;padding:6px 10px;background:#2C2C2A;color:#fff;border:none;` +
        `border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">` +
        `+ Legg til i dag ${dayIdx + 1}</button>` +
        `</div>`;
      const marker = L.marker(coord, { icon: _grayNearbyPinIcon(), opacity: 0.55 });
      marker.bindPopup(popup, { maxWidth: 220 });
      marker.addTo(map);
    });
  }

  // ── Ladestasjoner (om toggle er aktiv) ─────────────────────────────────────
  if (_chargerOn && typeof nobilRenderChargers === 'function') {
    const cl = L.layerGroup().addTo(map);
    _dayChargerLayers.push(cl);
    nobilRenderChargers(map, cl);
  } else {
    _dayChargerLayers.push(null);
  }

  // ── OSRM-rute (asynkron — tegnes etter at kartet er synlig) ─────────────────
  const osrmWpts = [
    ...(startCoord ? [startCoord] : []),
    ...custStops.map(s => s.coord),
    ...(endCoord ? [endCoord] : []),
  ];
  if (osrmWpts.length >= 2) {
    _fetchOsrmRoute(osrmWpts).then(routeLine => {
      if (routeLine && routeLine.length > 1) {
        L.polyline(routeLine, { color: '#1565C0', weight: 3, opacity: 0.75 }).addTo(map);
      } else {
        // Fallback: stiplet rett linje mellom stoppene
        L.polyline(osrmWpts, { color: '#1565C0', weight: 2, opacity: 0.45, dashArray: '6 6' }).addTo(map);
      }
    });
  }
}

// Initialisér alle dagskart etter at planen er rendret
function initPlannerDayMaps(days, homeBase, tripMeta) {
  _destroyDayMaps();
  if (!days || !days.length) return;
  days.forEach((day, idx) => {
    if (!day.skippedReason && day.customers && day.customers.length > 0) {
      _initOneDayMap(day, idx, homeBase || '', tripMeta || {}, days);
    }
  });
}

// ── LADESTASJONAR (Nobil) ─────────────────────────────────────────────────────
// Global toggle for ladestasjoner på alle kart (oversikt + planlegger-dagskart).
// Kall mapToggleChargers(true/false) frå UI-knapp.

let _chargerLayer = null;      // L.layerGroup på hovudkartet
let _chargerOn = false;        // global toggle-tilstand
window._nobilChargerOn = false;
let _chargerMoveTimer = null;  // debounce for moveend/zoomend på hovudkartet
let _dayChargerLayers = [];    // éin L.layerGroup per dagskart (null = ikkje aktiv)

function mapToggleChargers(show) {
  _chargerOn = window._nobilChargerOn = !!show;

  // Oppdater knapp-stil (hovudkart + planlegger)
  document.querySelectorAll('[id^="charger-toggle-btn"], [id="planner-charger-btn"]').forEach(btn => {
    btn.style.background = _chargerOn ? '#F9A825' : '#fff';
    btn.style.color = _chargerOn ? '#2C2C2A' : '#5F5E5A';
    btn.style.fontWeight = _chargerOn ? '700' : '500';
    btn.style.borderColor = _chargerOn ? '#F57F17' : '#D3D1C7';
  });

  // Hovudkart
  if (_mapInstance) {
    if (!_chargerLayer) {
      _chargerLayer = L.layerGroup().addTo(_mapInstance);
      _mapInstance.on('moveend zoomend', function() {
        if (!_chargerOn) return;
        clearTimeout(_chargerMoveTimer);
        _chargerMoveTimer = setTimeout(function() {
          if (typeof nobilRenderChargers === 'function') nobilRenderChargers(_mapInstance, _chargerLayer);
        }, 700);
      });
    }
    if (_chargerOn) {
      if (typeof nobilRenderChargers === 'function') nobilRenderChargers(_mapInstance, _chargerLayer);
    } else {
      _chargerLayer.clearLayers();
    }
  }

  // Dagskart
  _dayMapInstances.forEach((map, i) => {
    if (_chargerOn) {
      if (!_dayChargerLayers[i]) {
        _dayChargerLayers[i] = L.layerGroup().addTo(map);
      }
      if (typeof nobilRenderChargers === 'function') nobilRenderChargers(map, _dayChargerLayers[i]);
    } else {
      if (_dayChargerLayers[i]) _dayChargerLayers[i].clearLayers();
    }
  });
}
