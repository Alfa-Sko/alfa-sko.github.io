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
  if (c.includes('intersport')) return '#C0392B'; // rød
  if (c.includes('jaktia'))     return '#8B5E3C'; // brun
  if (c.includes('stadion'))    return '#1A2E5A'; // navy
  if (/sport\s*1/.test(c))      return '#1A5FA3'; // blå
  return '#3A7A3A';                               // grønn (frittstående/andre)
}

// ── Pin-ikon (Leaflet divIcon med SVG) ───────────────────────────────────────

function _pinIcon(color) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">` +
    `<path d="M11 0C4.925 0 0 4.925 0 11c0 7.5 11 19 11 19S22 18.5 22 11C22 4.925 17.075 0 11 0z" fill="${color}" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>` +
    `<circle cx="11" cy="11" r="4.5" fill="white" opacity="0.9"/>` +
    `</svg>`;
  return L.divIcon({
    html:        svg,
    className:   '',
    iconSize:    [22, 30],
    iconAnchor:  [11, 30],
    popupAnchor: [0, -30],
  });
}

// ── Tegnforklaring ────────────────────────────────────────────────────────────

const _LEGEND_ITEMS = [
  { label: 'Intersport',          color: '#C0392B' },
  { label: 'Sport 1',             color: '#1A5FA3' },
  { label: 'Stadion',             color: '#1A2E5A' },
  { label: 'Jaktia',             color: '#8B5E3C' },
  { label: 'Frittstående / andre', color: '#3A7A3A' },
];

// ── Privat: initialiser eller gjenbruk kart ──────────────────────────────────
// Må kalles etter at container-elementet er synlig (display:block),
// ellers beregner Leaflet feil størrelse.

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
// Pin-farge basert på kjede. geo='adresse'/'manuell' = presis posisjon,
// geo='by' = kommunesentrum (omtrentlig) — vist i popup.

function mapInitOverview() {
  const map = _ensureMap('map-container');
  _clearLayers();

  const customers = getCustomers().filter(c => c.lat != null && c.lng != null);
  if (customers.length === 0) {
    map.setView([65.5, 15], 5);
    return;
  }

  customers.forEach(c => {
    try {
      const color  = _chainColor(c.chain);
      const marker = L.marker([c.lat, c.lng], { icon: _pinIcon(color) });

      const l12str   = c.l12 > 0 ? c.l12.toLocaleString('no-NO') + ' kr' : '–';
      const clsBadge = c.class
        ? `<span style="background:#E6F1FB;color:#0C447C;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700">${c.class}-kunde</span> `
        : '';
      const precTxt = c.geo === 'adresse' ? '📍 adresse'
                    : c.geo === 'manuell'  ? '📍 manuelt koordinat'
                    : '○ by-nivå (omtrentlig)';

      marker.bindPopup(
        `<div style="min-width:190px;font-family:inherit">` +
        `<div style="font-weight:700;font-size:14px;margin-bottom:3px">${c.name}</div>` +
        `<div style="font-size:12px;color:#555;margin-bottom:7px">${c.city || ''}${c.chain ? ' · ' + c.chain : ''}</div>` +
        `<div style="font-size:12px;margin-bottom:4px">${clsBadge}<span style="color:#666">L12: ${l12str}</span></div>` +
        `<div style="font-size:10px;color:#999;margin-top:4px;border-top:1px solid #eee;padding-top:4px">${precTxt}</div>` +
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
