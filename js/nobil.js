// Nobil EV-ladestasjoner — klientside modul
// Alle API-kall går via Supabase Edge Function (NOBIL_API_KEY ligg server-side)
// Datakilde: NOBIL.no, lisens CC BY 4.0

const _NOBIL_CACHE_MS = 60000;   // 60 sek cache per bbox
const _NOBIL_CACHE = {};

// Hent ladestasjoner for ein bounding box (via proxy)
async function nobilFetch(swLat, swLng, neLat, neLng) {
  const key = swLat.toFixed(2)+','+swLng.toFixed(2)+','+neLat.toFixed(2)+','+neLng.toFixed(2);
  const now = Date.now();
  if (_NOBIL_CACHE[key] && now - _NOBIL_CACHE[key].ts < _NOBIL_CACHE_MS) {
    return _NOBIL_CACHE[key].data;
  }
  try {
    const resp = await sbFetch('/functions/v1/nobil-chargers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        southWest: { lat: swLat, lng: swLng },
        northEast: { lat: neLat, lng: neLng }
      })
    });
    if (!resp.ok) {
      console.warn('Nobil proxy HTTP', resp.status);
      return [];
    }
    const { stations = [] } = await resp.json();
    _NOBIL_CACHE[key] = { ts: now, data: stations };
    return stations;
  } catch (e) {
    console.warn('Nobil:', e.message);
    return [];
  }
}

// Finn nærmeste ladestasjon til ein eller fleire byar
async function nobilFindNearest(cities) {
  const cc = typeof CITY_COORDS !== 'undefined' ? CITY_COORDS : {};
  const coords = cities.map(c => cc[c]).filter(Boolean);
  if (!coords.length) return null;
  const pad = 0.7;  // ~70 km padding
  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  const stations = await nobilFetch(
    Math.min(...lats) - pad, Math.min(...lngs) - pad,
    Math.max(...lats) + pad, Math.max(...lngs) + pad
  );
  if (!stations.length) return null;
  let best = null, bestD = Infinity;
  coords.forEach(coord => {
    stations.forEach(s => {
      const d = haversineKm(coord.lat, coord.lng, s.lat, s.lng);
      if (d < bestD) { bestD = d; best = { ...s, distKm: Math.round(d) }; }
    });
  });
  return best;
}

// Leaflet-ikon for ladestasjonsmarkør
function nobilChargerIcon() {
  return L.divIcon({
    html: '<div style="background:#FFF176;border:2.5px solid #F57F17;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.28);line-height:1">⚡</div>',
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Popup-HTML for ein ladestasjon
function nobilChargerPopup(s) {
  const connStr = (s.conns||[]).map(c => c.type + (c.cap ? ' '+c.cap : '')).join(' · ') || '';
  const availTxt = s.avail > 0 ? '✅ '+s.avail+'/'+s.total+' ledig' : s.total+' ladepunkt';
  return '<div style="font-size:12px;min-width:170px">' +
    '<div style="font-weight:700;font-size:13px;margin-bottom:2px">⚡ '+escapeHtml(s.name||'Ladestasjon')+'</div>' +
    (s.op ? '<div style="color:#5F5E5A;margin-bottom:4px">'+escapeHtml(s.op)+'</div>' : '') +
    (connStr ? '<div style="color:#0C447C;margin-bottom:4px">'+escapeHtml(connStr)+'</div>' : '') +
    '<div>'+availTxt+'</div>' +
    '<div style="font-size:10px;color:#888780;margin-top:5px;border-top:1px solid #F1EFE8;padding-top:4px">Kjelde: NOBIL.no (CC BY 4.0)</div>' +
    '</div>';
}

// Hent og teikn ladestasjoner på eit Leaflet-kart
async function nobilRenderChargers(map, layerGroup) {
  if (!map || !layerGroup) return;
  const b = map.getBounds();
  const sw = b.getSouthWest(), ne = b.getNorthEast();
  const stations = await nobilFetch(sw.lat, sw.lng, ne.lat, ne.lng);
  layerGroup.clearLayers();
  stations.forEach(s => {
    L.marker([s.lat, s.lng], { icon: nobilChargerIcon() })
      .bindPopup(nobilChargerPopup(s), { maxWidth: 250 })
      .addTo(layerGroup);
  });
}
