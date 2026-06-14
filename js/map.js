// ─── KART-MODUL (Leaflet) ────────────────────────────────────────────────────
// Gjenbrukbar modul for oversiktskart og planlegger-rutevisning (fase 3).
// Forutsetter at Leaflet er lastet (via CDN i index.html) og
// at #map-container finnes i DOM-en.

let _mapInstance = null; // Leaflet-instans, gjenbrukes på tvers av besøk
let _mapLayers   = [];   // aktive lag (markører, linjer), fjernes ved re-render

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
}

// ── OVERSIKTSKART ────────────────────────────────────────────────────────────
// Viser alle kunder med koordinater.
// Fylt sirkel  = geo:'adresse' (presis posisjon)
// Hul sirkel   = geo:'by'      (poststed-nivå, omtrentlig)

function mapInitOverview() {
  const map = _ensureMap('map-container');
  _clearLayers();

  const customers = getCustomers().filter(c => c.lat != null && c.lng != null);
  if (customers.length === 0) {
    map.setView([65.5, 15], 5);
    return;
  }

  customers.forEach(c => {
    const precise = c.geo === 'adresse';
    const clsColor = c.class === 'A' ? '#C0392B' : c.class === 'B' ? '#1A5FA3' : '#5A9A4A';

    const marker = L.circleMarker([c.lat, c.lng], {
      radius:      precise ? 7 : 8,
      fillColor:   clsColor,
      color:       precise ? clsColor : '#666',
      weight:      precise ? 1.5 : 2,
      fillOpacity: precise ? 0.80 : 0,   // fylt = adresse, hul = by-nivå
    });

    const l12str  = c.l12 > 0 ? c.l12.toLocaleString('no-NO') + ' kr' : '–';
    const clsBadge = c.class
      ? `<span style="background:#E6F1FB;color:#0C447C;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700">${c.class}-kunde</span> `
      : '';
    const precTxt = precise ? '📍 adresse' : '○ by-nivå (omtrentlig)';

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
  });

  const group = L.featureGroup(_mapLayers);
  map.fitBounds(group.getBounds().pad(0.06));
}

// ── RUTEVISNING (fase 3 – planlegger) ────────────────────────────────────────
// stops: [{lat, lng, name, ...}], options: {fitBounds: true}
// Implementeres når kartet kobles til planleggeren.

function mapShowRoute(stops, options) {
  // TODO: rutelinje + stopp-markører
}
