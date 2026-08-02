// Nobil EV-ladestasjoner — klientside modul
// Alle API-kall går via Supabase Edge Function (NOBIL_API_KEY ligg server-side)
// Datakilde: NOBIL.no, lisens CC BY 4.0

const _NOBIL_CACHE_MS = 60000;
const _NOBIL_CACHE = {};

// ── Filterstate (global) ──────────────────────────────────────────────────────
window._nobilFilter = { county: '', ops: null, connTypes: null };
let _nobilKnownOps = [];
let _nobilKnownConnTypes = [];
let _nobilKnownCounties = [];
let _nobilCountyDefaultSet = false;

function _nobilApplyFilter(stations) {
  const f = window._nobilFilter;
  return stations.filter(s => {
    if (f.county && s.county !== f.county) return false;
    if (f.ops !== null && !f.ops.has(s.op)) return false;
    if (f.connTypes !== null) {
      const types = (s.conns || []).map(c => c.type);
      if (!types.some(t => f.connTypes.has(t))) return false;
    }
    return true;
  });
}

function _nobilMergeKnown(stations) {
  stations.forEach(s => {
    if (s.op    && !_nobilKnownOps.includes(s.op))          _nobilKnownOps.push(s.op);
    if (s.county && !_nobilKnownCounties.includes(s.county)) _nobilKnownCounties.push(s.county);
    (s.conns || []).forEach(c => {
      if (c.type && !_nobilKnownConnTypes.includes(c.type)) _nobilKnownConnTypes.push(c.type);
    });
  });
  _nobilKnownOps.sort();
  _nobilKnownConnTypes.sort();
  _nobilKnownCounties.sort();

  // Sett standard fylke frå brukerens distrikt (éin gong, etter første datahenting)
  if (!_nobilCountyDefaultSet && _nobilKnownCounties.length > 0) {
    _nobilCountyDefaultSet = true;
    if (!window._nobilFilter.county && typeof userProfile !== 'undefined' && userProfile.district) {
      const dtR = typeof DISTRICT_TO_REGIONS !== 'undefined' ? DISTRICT_TO_REGIONS : {};
      const regions = (dtR[userProfile.district] || []).map(r => r.toLowerCase());
      const match = _nobilKnownCounties.find(c => regions.includes(c.toLowerCase()));
      if (match) window._nobilFilter.county = match;
    }
  }
}

// ── API-henting ────────────────────────────────────────────────────────────────

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
      body: JSON.stringify({ southWest: { lat: swLat, lng: swLng }, northEast: { lat: neLat, lng: neLng } })
    });
    if (!resp.ok) { console.warn('Nobil proxy HTTP', resp.status); return []; }
    const { stations = [] } = await resp.json();
    _NOBIL_CACHE[key] = { ts: now, data: stations };
    _nobilMergeKnown(stations);
    return stations;
  } catch (e) {
    console.warn('Nobil:', e.message);
    return [];
  }
}

async function nobilFindNearest(cities) {
  const cc = typeof CITY_COORDS !== 'undefined' ? CITY_COORDS : {};
  const coords = cities.map(c => cc[c]).filter(Boolean);
  if (!coords.length) return null;
  const pad = 0.7;
  const lats = coords.map(c => c.lat), lngs = coords.map(c => c.lng);
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

// ── Leaflet-ikon og popup ──────────────────────────────────────────────────────

function nobilChargerIcon() {
  return L.divIcon({
    html: '<div style="background:#FFF176;border:2.5px solid #F57F17;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.28);line-height:1">⚡</div>',
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function nobilChargerPopup(s) {
  const connStr = (s.conns||[]).map(c => c.type + (c.cap ? ' '+c.cap : '')).join(' · ') || '';
  const availTxt = s.avail > 0 ? '✅ '+s.avail+'/'+s.total+' ledig' : s.total+' ladepunkt';
  return '<div style="font-size:12px;min-width:170px">' +
    '<div style="font-weight:700;font-size:13px;margin-bottom:2px">⚡ '+escapeHtml(s.name||'Ladestasjon')+'</div>' +
    (s.op     ? '<div style="color:#5F5E5A;margin-bottom:3px">'+escapeHtml(s.op)+'</div>' : '') +
    (s.county ? '<div style="font-size:11px;color:#888780;margin-bottom:3px">'+escapeHtml(s.county)+'</div>' : '') +
    (connStr  ? '<div style="color:#0C447C;margin-bottom:4px">'+escapeHtml(connStr)+'</div>' : '') +
    '<div>'+availTxt+'</div>' +
    '<div style="font-size:10px;color:#888780;margin-top:5px;border-top:1px solid #F1EFE8;padding-top:4px">Kjelde: NOBIL.no (CC BY 4.0)</div>' +
    '</div>';
}

// ── Hent og teikn ─────────────────────────────────────────────────────────────

async function nobilRenderChargers(map, layerGroup) {
  if (!map || !layerGroup) return;
  const b = map.getBounds();
  const sw = b.getSouthWest(), ne = b.getNorthEast();
  const stations = await nobilFetch(sw.lat, sw.lng, ne.lat, ne.lng);
  layerGroup.clearLayers();
  const filtered = _nobilApplyFilter(stations);
  filtered.forEach(s => {
    L.marker([s.lat, s.lng], { icon: nobilChargerIcon() })
      .bindPopup(nobilChargerPopup(s), { maxWidth: 250 })
      .addTo(layerGroup);
  });
  // Oppdater filterpanel-val etter at nye data er henta
  const panel = document.getElementById('nobil-filter-panel');
  if (panel && panel.style.display !== 'none') _nobilSyncFilterPanel();
  _nobilSyncFilterBadges();
}

// ── Filterpanel ────────────────────────────────────────────────────────────────

function _nobilActiveFilterCount() {
  const f = window._nobilFilter;
  return (f.county ? 1 : 0) + (f.ops !== null ? 1 : 0) + (f.connTypes !== null ? 1 : 0);
}

function _nobilSyncFilterBadges() {
  const n = _nobilActiveFilterCount();
  const badge = n > 0 ? ' ('+n+')' : '';
  document.querySelectorAll('.nobil-filter-btn').forEach(b => {
    b.textContent = '⚙' + badge;
    b.title = n > 0 ? n+' aktive filter' : 'Filtrer ladestasjoner';
    b.style.background   = n > 0 ? '#E3F2FD' : '#fff';
    b.style.color        = n > 0 ? '#0C447C' : '#5F5E5A';
    b.style.borderColor  = n > 0 ? '#90CAF9' : '#D3D1C7';
    b.style.fontWeight   = n > 0 ? '700' : '500';
  });
}

function _nobilRenderCheckboxes(containerId, items, filterKey) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = '<span style="color:#888780;font-size:11px;font-style:italic">Aktiver ladestasjoner for å laste data</span>';
    return;
  }

  if (filterKey === 'ops') {
    // Leverandørliste: Velg alle / Fjern alle + søkefelt, ingen master-checkbox
    const opsF = window._nobilFilter.ops;
    const bBase = 'font-size:11px;padding:3px 8px;border-radius:5px;cursor:pointer;font-weight:600;border:1px solid';
    let html = '<div style="display:flex;gap:4px;margin-bottom:6px">'
      + '<button onclick="_nobilOpsSelectAll()" style="'+bBase+' #0C447C;background:#0C447C;color:#fff">Velg alle</button>'
      + '<button onclick="_nobilOpsClearAll()" style="'+bBase+' #A23B27;background:#fff;color:#A23B27">Fjern alle</button>'
      + '</div>'
      + '<input type="text" id="nobil-ops-search" placeholder="Søk leverandør..." oninput="_nobilOpsSearch()"'
      + ' style="width:100%;padding:5px 8px;border:1px solid #D3D1C7;border-radius:6px;font-size:11px;box-sizing:border-box;margin-bottom:5px">';

    items.forEach(item => {
      const checked = opsF === null || (opsF && opsF.has(item));
      html += '<label class="nobil-ops-row" style="display:flex;gap:6px;align-items:flex-start;padding:2px 0;cursor:pointer">'
        + '<input type="checkbox" value="'+escapeHtml(item)+'"'+(checked?' checked':'')
        + ' onchange="_nobilCheckItem(\'ops\',this)" style="margin-top:1px;flex-shrink:0">'
        + '<span class="nobil-ops-name" style="word-break:break-word">'+escapeHtml(item)+'</span>'
        + '</label>';
    });
    el.innerHTML = html;
  } else {
    // Kontakttypar: beheld master-checkbox-mønster
    const isAll = window._nobilFilter[filterKey] === null;
    let html = '<label style="display:flex;gap:6px;align-items:center;padding:2px 0;cursor:pointer;font-weight:600;border-bottom:1px solid #F1EFE8;margin-bottom:3px;padding-bottom:4px">'
      + '<input type="checkbox"'+(isAll?' checked':'')+' onchange="_nobilCheckAll(\''+filterKey+'\',this)">Alle typer</label>';
    items.forEach(item => {
      const checked = isAll || (window._nobilFilter[filterKey] && window._nobilFilter[filterKey].has(item));
      html += '<label style="display:flex;gap:6px;align-items:flex-start;padding:2px 0;cursor:pointer">'
        + '<input type="checkbox" value="'+escapeHtml(item)+'"'+(checked?' checked':'')
        + ' onchange="_nobilCheckItem(\''+filterKey+'\',this)" style="margin-top:1px;flex-shrink:0">'
        + '<span style="word-break:break-word">'+escapeHtml(item)+'</span>'
        + '</label>';
    });
    el.innerHTML = html;
  }
}

function _nobilSyncFilterPanel() {
  const countyEl = document.getElementById('nobil-filter-county');
  if (countyEl) {
    countyEl.innerHTML = '<option value="">Alle fylker i Norge</option>' +
      _nobilKnownCounties.map(c => '<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join('');
    countyEl.value = window._nobilFilter.county || '';
  }
  const savedQ = (document.getElementById('nobil-ops-search') || {}).value || '';
  _nobilRenderCheckboxes('nobil-filter-ops',   _nobilKnownOps,       'ops');
  _nobilRenderCheckboxes('nobil-filter-conns',  _nobilKnownConnTypes, 'connTypes');
  if (savedQ) {
    const newSearch = document.getElementById('nobil-ops-search');
    if (newSearch) { newSearch.value = savedQ; _nobilOpsSearch(); }
  }
  _nobilSyncFilterBadges();
}

function nobilFilterOpen(btn) {
  const panel = document.getElementById('nobil-filter-panel');
  if (!panel) return;
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  _nobilSyncFilterPanel();
  panel.style.display = 'block';
  const rect = btn.getBoundingClientRect();
  const pw = 268;
  let left = Math.max(8, Math.min(rect.right - pw, window.innerWidth - pw - 8));
  let top  = rect.bottom + 6;
  if (top + 380 > window.innerHeight) top = Math.max(8, rect.top - 380);
  panel.style.left = left + 'px';
  panel.style.top  = top + 'px';
}

function nobilFilterClose() {
  const panel = document.getElementById('nobil-filter-panel');
  if (panel) panel.style.display = 'none';
}

function nobilFilterChange() {
  const countyEl = document.getElementById('nobil-filter-county');
  window._nobilFilter.county = (countyEl && countyEl.value) || '';
  _nobilSyncFilterBadges();
  _nobilRerender();
}

function _nobilCheckAll(filterKey, cb) {
  // "Alle"-avkryssing: sett alltid til null (alle) — kan ikkje velge "ingenting"
  window._nobilFilter[filterKey] = null;
  cb.checked = true;
  _nobilRenderCheckboxes(
    filterKey === 'ops' ? 'nobil-filter-ops' : 'nobil-filter-conns',
    filterKey === 'ops' ? _nobilKnownOps : _nobilKnownConnTypes,
    filterKey
  );
  _nobilSyncFilterBadges();
  _nobilRerender();
}

function _nobilCheckItem(filterKey, cb) {
  const allItems = filterKey === 'ops' ? _nobilKnownOps : _nobilKnownConnTypes;
  let current = window._nobilFilter[filterKey];

  if (current === null) {
    if (!cb.checked) {
      current = new Set(allItems.filter(i => i !== cb.value));
    }
  } else {
    current = new Set(current);
    if (cb.checked) current.add(cb.value);
    else current.delete(cb.value);
    // current.size === 0 er gyldig: tom mengde = vis ingenting (ikkje reset til null/alle)
    if (current && current.size === allItems.length) current = null; // alle hukt = tilbake til null
  }

  window._nobilFilter[filterKey] = current;

  // Oppdater "Alle"-boksen — berre for connTypes (ops-lista har ikkje lenger master-checkbox)
  if (filterKey === 'connTypes') {
    const el = document.getElementById('nobil-filter-conns');
    if (el) {
      const allCb = el.querySelector('input[type="checkbox"]');
      if (allCb) allCb.checked = (window._nobilFilter[filterKey] === null);
    }
  }

  _nobilSyncFilterBadges();
  _nobilRerender();
}

function _nobilOpsSelectAll() {
  window._nobilFilter.ops = null; // null = alle
  _nobilSyncFilterPanel();
  _nobilSyncFilterBadges();
  _nobilRerender();
}

function _nobilOpsClearAll() {
  window._nobilFilter.ops = new Set(); // tom mengde = vis ingenting
  _nobilSyncFilterPanel();
  _nobilSyncFilterBadges();
  _nobilRerender();
}

function _nobilOpsSearch() {
  const q = ((document.getElementById('nobil-ops-search') || {}).value || '').toLowerCase();
  document.querySelectorAll('#nobil-filter-ops .nobil-ops-row').forEach(row => {
    const name = ((row.querySelector('.nobil-ops-name') || {}).textContent || '').toLowerCase();
    row.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

function nobilFilterReset() {
  window._nobilFilter = { county: '', ops: null, connTypes: null };
  _nobilSyncFilterPanel();
  _nobilRerender();
}

function _nobilRerender() {
  if (typeof mapToggleChargers === 'function' && window._nobilChargerOn) {
    mapToggleChargers(true);
  }
}

// Lukk filterpanel ved klikk utanfor
document.addEventListener('click', function(e) {
  const panel = document.getElementById('nobil-filter-panel');
  if (!panel || panel.style.display === 'none') return;
  if (panel.contains(e.target)) return;
  if (e.target.classList && e.target.classList.contains('nobil-filter-btn')) return;
  panel.style.display = 'none';
}, true);
