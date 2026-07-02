// ─── PRISLISTE (fler-sesong, xlsx + pdf) ─────────────────────────────────────

var _plSeasons      = {};
var _plActiveSeason = null;
var _plFiltered     = [];
var _plLoaded       = false;
var _plPending      = null; // { items, suggestedSeason, validFrom, validTo, filename }
var _PL_PREFIX      = 'pl-';

var ADMIN_UIDS = ['f0cff8a8-d538-431b-8d1f-95db1d75fa03', '1cd8ee06-8fb2-40e6-8634-e17bb08792dd'];
function _plIsAdmin() { return !!(window._sbUser && ADMIN_UIDS.indexOf(window._sbUser.id) !== -1); }
function plRefreshAdminSection() {
  var el = document.getElementById('pl-admin-section');
  if (el) el.style.display = _plIsAdmin() ? 'block' : 'none';
}

function _plStorageName(season) {
  return 'pl-' + season.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.json';
}
function _plSeasonKey(name) {
  return name.replace(/^pl-(.+)\.json$/, '$1');
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function plLoad() {
  var listEl = document.getElementById('pl-list');
  var seasEl = document.getElementById('pl-seasons');
  if (!listEl) return;
  if (!window._sbUser) {
    if (seasEl) seasEl.innerHTML = '';
    listEl.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">Logg inn for å se den felles prislisten.</div>';
    return;
  }
  if (_plLoaded) { _plRenderSeasons(); _plRenderMeta(); _plRender(); return; }
  listEl.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">Laster prislister …</div>';
  try {
    console.log('[prisliste] henter sesongliste …');
    // prefix:'' = list rotnivå i bucketen. prefix:'pl-' ville sett etter ein virtuell mappe
    // kalla "pl-/" og finna ingenting — det er den tidlegare feilen.
    var listRes = await sbFetch('/storage/v1/object/list/kataloger', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 100, sortBy: { column: 'name', order: 'asc' } })
    });
    if (!listRes.ok) {
      var listErr = ''; try { listErr = await listRes.text(); } catch(_) {}
      throw new Error('Liste HTTP ' + listRes.status + (listErr ? ' — ' + listErr : ''));
    }
    var files = await listRes.json();
    console.log('[prisliste] sesongliste: ' + (files || []).length + ' objekt totalt');
    var seasonFiles = (files || []).filter(function (f) { return f.name && /^pl-.+\.json$/.test(f.name); });
    console.log('[prisliste] sesongfiler funne: ' + seasonFiles.length, seasonFiles.map(function(f){ return f.name; }));
    if (!seasonFiles.length) { _plLoaded = true; if (seasEl) seasEl.innerHTML = ''; _plShowEmpty(); return; }
    await Promise.all(seasonFiles.map(async function (f) {
      try {
        var r = await sbFetch('/storage/v1/object/authenticated/kataloger/' + encodeURIComponent(f.name), { method: 'GET' });
        console.log('[prisliste] henta ' + f.name + ' → HTTP ' + r.status);
        if (!r.ok) {
          var fetchErr = ''; try { fetchErr = await r.text(); } catch(_) {}
          console.error('[prisliste] ' + f.name + ' feila:', r.status, fetchErr);
          return;
        }
        _plSeasons[_plSeasonKey(f.name)] = await r.json();
      } catch (e) { console.error('[prisliste] Kunne ikkje hente', f.name, e.message); }
    }));
    console.log('[prisliste] lasta ' + Object.keys(_plSeasons).length + ' sesong(ar):', Object.keys(_plSeasons));
    _plLoaded = true;
    if (!Object.keys(_plSeasons).length) { _plShowEmpty(); return; }
    if (!_plActiveSeason || !_plSeasons[_plActiveSeason]) _plActiveSeason = _plPickCurrentSeason();
    _plFiltered = _plActiveSeason ? ((_plSeasons[_plActiveSeason] || {}).items || []) : [];
    _plRenderSeasons(); _plRenderMeta(); _plRender();
  } catch (e) {
    listEl.innerHTML = '<div style="color:#A23B27;padding:20px;font-size:13px">Kunne ikkje hente prislister: ' + escapeHtml(e.message || '') + '</div>';
    console.error('[prisliste] Load feilet:', e);
  }
}

function _plPickCurrentSeason() {
  var keys = Object.keys(_plSeasons);
  if (!keys.length) return null;
  var today = new Date().toISOString().slice(0, 10);
  var cur = keys.filter(function (k) { var s = _plSeasons[k]; return s.validFrom && s.validTo && today >= s.validFrom && today <= s.validTo; });
  if (cur.length) return cur.sort(function (a, b) { return (_plSeasons[b].validFrom || '').localeCompare(_plSeasons[a].validFrom || ''); })[0];
  return keys.sort(function (a, b) { return (_plSeasons[b].uploadedAt || '').localeCompare(_plSeasons[a].uploadedAt || ''); })[0];
}
function _plIsCurrentSeason(key) {
  var s = _plSeasons[key];
  if (!s || !s.validFrom || !s.validTo) return false;
  var today = new Date().toISOString().slice(0, 10);
  return today >= s.validFrom && today <= s.validTo;
}

// ── Upload ────────────────────────────────────────────────────────────────────

function plUploadClick() {
  if (!window._sbUser) { showToast('Logg inn først'); return; }
  if (!_plIsAdmin()) { showToast('Berre administratorar kan laste opp prislistar'); return; }
  document.getElementById('pl-file-input').click();
}

async function plHandleUpload(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  var isPdf  = /\.pdf$/i.test(file.name);
  var isXlsx = /\.xlsx$/i.test(file.name);
  if (!isPdf && !isXlsx) { showToast('Filen må være .xlsx eller .pdf'); return; }
  showToast('Parser prisliste …');
  try {
    var parsed = isPdf ? await _plParsePdf(file) : await _plParseXlsx(file);
    _plPending = { items: parsed.items, suggestedSeason: parsed.suggestedSeason, validFrom: parsed.validFrom, validTo: parsed.validTo, filename: file.name };
    var nameEl = document.getElementById('pl-confirm-name');
    var fromEl = document.getElementById('pl-confirm-from');
    var toEl   = document.getElementById('pl-confirm-to');
    var fnEl   = document.getElementById('pl-confirm-file');
    if (nameEl) nameEl.value = parsed.suggestedSeason;
    if (fromEl) fromEl.textContent = parsed.validFrom || '—';
    if (toEl)   toEl.textContent   = parsed.validTo   || '—';
    if (fnEl)   fnEl.textContent   = file.name;
    _plShowConfirmPreview(parsed.items);
    var card = document.getElementById('pl-upload-confirm');
    if (card) { card.style.display = 'block'; card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    showToast(parsed.items.length + ' produkter analysert — bekreft sesongnavn');
  } catch (e) {
    showToast('Feil: ' + (e.message || e));
    console.error('[prisliste] Parse feilet:', e);
  }
}

function _plShowConfirmPreview(items) {
  var el = document.getElementById('pl-confirm-preview');
  if (!el) return;
  var sample = (items || []).slice(0, 5);
  if (!sample.length) { el.innerHTML = ''; return; }
  el.innerHTML =
    '<div style="font-size:11px;color:#5F5E5A;font-weight:600;margin-bottom:4px">' + items.length + ' produkter funnet — eksempel:</div>' +
    '<div style="font-size:11px;background:#fff;border:1px solid #D3D1C7;border-radius:6px;overflow:hidden">' +
    sample.map(function (item) {
      var price = item.rrp ? item.rrp.toLocaleString('no-NO') + ' kr' : '—';
      var sub   = [item.artnr, item.color, item.str || item.sizeSpan].filter(function (v) { return v && v !== '-'; }).join(' · ');
      return '<div style="padding:5px 10px;border-bottom:1px solid #F1EFE8;display:flex;justify-content:space-between;gap:8px">' +
        '<div><span style="font-weight:600">' + escapeHtml(item.name || '—') + '</span>' +
        (sub ? '<span style="color:#888780"> — ' + escapeHtml(sub) + '</span>' : '') + '</div>' +
        '<span style="color:#0C447C;white-space:nowrap">' + price + '</span></div>';
    }).join('') +
    (items.length > 5 ? '<div style="padding:5px 10px;color:#888780">… og ' + (items.length - 5) + ' til</div>' : '') +
    '</div>';
}

async function plConfirmUpload() {
  if (!_plPending) return;
  var nameEl = document.getElementById('pl-confirm-name');
  var season = (nameEl ? nameEl.value : '').trim();
  if (!season) { showToast('Skriv inn sesongnavn'); if (nameEl) nameEl.focus(); return; }
  var s = typeof _sbSession === 'function' ? _sbSession() : null;
  var payload = {
    season: season, filename: _plPending.filename,
    uploadedAt: new Date().toISOString(),
    uploadedBy: (s && s.user) ? (s.user.email || s.user.id) : '',
    validFrom: _plPending.validFrom, validTo: _plPending.validTo,
    items: _plPending.items
  };
  showToast('Laster opp ' + season + ' …');
  // Sjekk token-utløp og forny FØR opplasting (token kan utløpe under forhåndsvisning)
  var _s0 = _sbSession(), _t0 = (_s0 && _s0.access_token) || '';
  var _exp = 0; try { _exp = JSON.parse(atob(_t0.split('.')[1])).exp - Math.floor(Date.now()/1000); } catch(_){}
  console.log('[prisliste] Token: Bearer ' + (_t0 ? _t0.slice(0,20)+'…' : 'MANGLER') + ', utløper om ' + _exp + 's');
  if (_exp < 120) {
    console.log('[prisliste] Fornyer token (utløper om ' + _exp + 's) …');
    var refreshed = await sbRefresh();
    var _s1 = _sbSession(), _t1 = (_s1 && _s1.access_token) || '';
    var _exp1 = 0; try { _exp1 = JSON.parse(atob(_t1.split('.')[1])).exp - Math.floor(Date.now()/1000); } catch(_){}
    console.log('[prisliste] Token etter fornying: utløper om ' + _exp1 + 's (ok=' + refreshed + ')');
    if (!refreshed && _exp <= 0) { showToast('Sesjonen har utløpt — logg inn på nytt'); return; }
  }
  var storageName = _plStorageName(season);
  var storageUrl  = '/storage/v1/object/kataloger/' + encodeURIComponent(storageName);
  var body        = new Blob([JSON.stringify(payload)], { type: 'application/octet-stream' });
  console.log('[prisliste] Laster opp:', storageName, '—', payload.items.length, 'produkter');
  try {
    // Atomisk upsert — fungerer både når fila finst (overskriver) og ikkje finst (oppretter).
    // UPDATE-policy er bekrefta på plass for admin. Frisk opts per kall — sbFetch muterer opts.headers.
    var res = await sbFetch(storageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-upsert': 'true' },
      body: body
    });
    var resBody = ''; try { resBody = await res.text(); } catch (_) {}
    console.log('[prisliste] POST upsert HTTP ' + res.status + ':', resBody || '(tom body)');
    if (!res.ok) {
      console.error('[prisliste] Opplasting feilet:', res.status, resBody);
      throw new Error('HTTP ' + res.status + (resBody ? ' — ' + resBody : ''));
    }
    _plSeasons[season] = payload;
    _plActiveSeason = season;
    _plFiltered = payload.items;
    _plLoaded = true;
    _plPending = null;
    plCancelUpload();
    var searchEl = document.getElementById('pl-search');
    if (searchEl) searchEl.value = '';
    _plRenderSeasons(); _plRenderMeta(); _plRender();
    showToast('✅ ' + season + ' lastet opp — ' + payload.items.length + ' produkter');
  } catch (e) {
    showToast('Opplasting feilet: ' + (e.message || e));
  }
}

function plCancelUpload() {
  _plPending = null;
  var card = document.getElementById('pl-upload-confirm');
  if (card) card.style.display = 'none';
  var prev = document.getElementById('pl-confirm-preview');
  if (prev) prev.innerHTML = '';
}

// ── Sesong-veksling og sletting ───────────────────────────────────────────────

function plSelectSeason(key) {
  if (!_plSeasons[key]) return;
  _plActiveSeason = key;
  _plFiltered = _plSeasons[key].items || [];
  var searchEl = document.getElementById('pl-search');
  if (searchEl) searchEl.value = '';
  _plRenderSeasons(); _plRenderMeta(); _plRender();
}

async function plDeleteSeason(key, ev) {
  if (ev) ev.stopPropagation();
  if (!_plSeasons[key]) return;
  if (!confirm('Slette prislisten «' + key + '»?\nDette kan ikke angres.')) return;
  try {
    var res = await sbFetch('/storage/v1/object/kataloger/' + _plStorageName(key), { method: 'DELETE' });
    if (!res.ok) {
      var delBody = ''; try { delBody = await res.text(); } catch(_) {}
      // Supabase Storage returnerer HTTP 400 med body {statusCode:"404"} når fila ikkje finst
      var notFound = res.status === 404 || (res.status === 400 && /"statusCode"\s*:\s*"404"/.test(delBody));
      if (!notFound) throw new Error('HTTP ' + res.status + (delBody ? ' — ' + delBody : ''));
    }
    delete _plSeasons[key];
    if (_plActiveSeason === key) {
      _plActiveSeason = _plPickCurrentSeason();
      _plFiltered = _plActiveSeason ? ((_plSeasons[_plActiveSeason] || {}).items || []) : [];
    }
    _plRenderSeasons(); _plRenderMeta(); _plRender();
    showToast('Prisliste «' + key + '» slettet');
  } catch (e) { showToast('Sletting feilet: ' + (e.message || e)); }
}

// ── Render ────────────────────────────────────────────────────────────────────

function _plRenderSeasons() {
  var el = document.getElementById('pl-seasons');
  if (!el) return;
  var keys = Object.keys(_plSeasons).sort(function (a, b) { return a.localeCompare(b, 'no'); });
  if (!keys.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
    keys.map(function (k) {
      var esc = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var active = k === _plActiveSeason, cur = _plIsCurrentSeason(k);
      return '<button class="pl-season-btn' + (active ? ' active' : '') + '" onclick="plSelectSeason(\'' + esc + '\')">' +
        escapeHtml(k) +
        (cur ? ' <span class="pl-cur-dot" title="Gjeldende sesong">●</span>' : '') +
        (_plIsAdmin() ? ' <span class="pl-season-del" onclick="plDeleteSeason(\'' + esc + '\',event)" title="Slett ' + escapeHtml(k) + '">✕</span>' : '') +
        '</button>';
    }).join('') + '</div>';
}

function _plRenderMeta() {
  var el = document.getElementById('pl-meta');
  if (!el) return;
  if (!_plActiveSeason || !_plSeasons[_plActiveSeason]) { el.textContent = ''; return; }
  var s = _plSeasons[_plActiveSeason], parts = [];
  if (s.filename)   parts.push(s.filename);
  if (s.uploadedAt) parts.push('oppdatert ' + new Date(s.uploadedAt).toLocaleDateString('no-NO'));
  if (s.uploadedBy) parts.push('av ' + s.uploadedBy);
  if (s.validFrom || s.validTo) parts.push('Gyldig: ' + (s.validFrom || '?') + ' – ' + (s.validTo || '?'));
  el.textContent = parts.join(' · ');
}

function plSearch() {
  var q = (document.getElementById('pl-search').value || '').trim().toLowerCase();
  var items = _plActiveSeason ? ((_plSeasons[_plActiveSeason] || {}).items || []) : [];
  if (!q) {
    _plFiltered = items;
  } else {
    var terms = q.split(/\s+/);
    _plFiltered = items.filter(function (item) {
      var hay = ((item.name || '') + ' ' + (item.color || '') + ' ' + (item.modelNo || '') + ' ' + (item.artnr || '')).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  }
  _plRender();
}

function _plRender() {
  var el = document.getElementById('pl-list');
  if (!el) return;
  if (!_plActiveSeason || !Object.keys(_plSeasons).length) { _plShowEmpty(); return; }
  if (!_plFiltered.length) {
    var allItems = (_plSeasons[_plActiveSeason] || {}).items || [];
    el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">' +
      (allItems.length ? 'Ingen treff — prøv et annet søkeord' : 'Ingen produkter i denne sesongen') + '</div>';
    return;
  }
  el.innerHTML = _plFiltered.map(function (item) {
    var gLabel   = item.gender === 'M' ? 'Herre' : item.gender === 'W' ? 'Dame' : '';
    var colorVal = item.color && item.color !== '-' ? item.color : '';
    var sizeVal  = item.sizeSpan || item.str || '';
    var meta     = [colorVal, gLabel, sizeVal ? 'Str. ' + sizeVal : ''].filter(Boolean).join(' · ');
    var sub      = item.artnr ? item.artnr : '';
    var price    = item.rrp ? item.rrp.toLocaleString('no-NO') + ' kr' : '—';
    return '<div class="pl-item">' +
      '<div class="pl-name">' + escapeHtml(item.name || '—') + '</div>' +
      (meta ? '<div class="pl-meta-line">' + escapeHtml(meta) + '</div>' : '') +
      (sub  ? '<div class="pl-meta-line" style="color:#B0AEA8;font-size:11px">' + escapeHtml(sub) + '</div>' : '') +
      '<div class="pl-footer"><span class="pl-price">' + price + '</span>' +
      (item.rrp ? '<button class="pl-calc-btn" onclick="plUseInCalc(' + item.rrp + ')">Bruk i kalkulator →</button>' : '') +
      '</div></div>';
  }).join('');
}

function plUseInCalc(rrp) {
  var field = document.getElementById('rk-veil');
  if (field) {
    field.value = rrp;
    if (typeof rkCalculate === 'function') rkCalculate();
    var divider = document.getElementById('pl-calc-divider');
    if (divider) divider.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Veil. pris satt til ' + rrp.toLocaleString('no-NO') + ' kr');
  }
}

function _plShowEmpty() {
  var el = document.getElementById('pl-list');
  if (el) el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">' +
    'Ingen prislister lastet opp ennå.<br>Last opp en PRICAT .xlsx eller Alfa prisliste .pdf for å dele med hele teamet.</div>';
}

// ── Parse XLSX (PRICAT) ───────────────────────────────────────────────────────

async function _plParseXlsx(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function () { reject(new Error('Kunne ikke lese filen')); };
    reader.onload = function (ev) {
      try {
        var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array', cellDates: true });
        var ws = wb.Sheets['Pricat'];
        if (!ws) throw new Error('Fant ikke ark "Pricat" i filen');
        // metaRows[0]=rad1(headers), metaRows[1]=rad2(tekniske), metaRows[2]=rad3(verdier)
        var metaRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        var mHdrs = metaRows[0] || [], mVals = metaRows[2] || [];
        function mGet(n) { var i = mHdrs.indexOf(n); return i >= 0 ? mVals[i] : ''; }
        function toDateStr(v) {
          if (!v) return '';
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10);
          return String(v).trim();
        }
        var pricatName = String(mGet('PRICAT Name') || '').trim();
        var period     = String(mGet('Period')      || '').trim();
        var validFrom  = toDateStr(mGet('Valid from date'));
        var validTo    = toDateStr(mGet('Valid to date'));
        var suggestedSeason = pricatName || (period ? period.replace(/^([A-Za-z]+)20(\d{2})$/, '$1$2') : '') || '';
        // range:6 = rad 6 eksplisitt som header (unngår hopp-over-tomme-rader-bug)
        var rows = XLSX.utils.sheet_to_json(ws, { range: 6, defval: '' });
        var allKeys = {};
        rows.forEach(function (r) { Object.keys(r).forEach(function (k) { allKeys[k] = true; }); });
        var required = ['Action', 'Name (Supplier)', 'Model no (Supplier)', 'Color', 'Size', 'Gender (Supplier)', 'Rec retail price:1 NOK'];
        var missing = required.filter(function (c) { return !allKeys[c]; });
        if (missing.length) throw new Error('Mangler kolonner: ' + missing.join(', '));
        var groups = {};
        rows.forEach(function (row) {
          if (String(row['Action'] || '').trim() !== 'Add') return;
          var modelNo = String(row['Model no (Supplier)'] || '').trim();
          var color   = String(row['Color'] || '').trim();
          var key     = modelNo + '\x00' + color;
          if (!groups[key]) {
            var rrpRaw = row['Rec retail price:1 NOK'];
            groups[key] = {
              name: String(row['Name (Supplier)'] || '').trim(), modelNo: modelNo, color: color,
              gender: String(row['Gender (Supplier)'] || '').trim(),
              rrp: (rrpRaw !== '' && rrpRaw !== null && !isNaN(Number(rrpRaw))) ? Math.round(Number(rrpRaw)) : null,
              brand: String(row['Brand'] || '').trim(), sizes: []
            };
          }
          var sz = String(row['Size'] || '').trim();
          if (sz && groups[key].sizes.indexOf(sz) === -1) groups[key].sizes.push(sz);
        });
        var items = Object.values(groups).map(function (g) {
          g.sizeSpan = _plSizeSpan(g.sizes); delete g.sizes; return g;
        });
        items.sort(function (a, b) { return a.name.localeCompare(b.name, 'no') || a.color.localeCompare(b.color, 'no'); });
        if (!items.length) throw new Error('Ingen "Add"-rader funnet i Pricat-arket');
        resolve({ items: items, suggestedSeason: suggestedSeason, validFrom: validFrom, validTo: validTo });
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

function _plSizeSpan(sizes) {
  if (!sizes || !sizes.length) return '';
  if (sizes.length === 1) return sizes[0];
  var nums = sizes.map(function (s) { return parseFloat(s); });
  if (nums.every(function (n) { return !isNaN(n); })) {
    nums.sort(function (a, b) { return a - b; });
    return nums[0] + '–' + nums[nums.length - 1];
  }
  return sizes.join(', ');
}

// ── Parse PDF (Alfa prisliste) ────────────────────────────────────────────────

async function _plParsePdf(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('pdf.js ikke lastet — last siden på nytt');
  var buf = await new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onerror = function () { reject(new Error('Kunne ikke lese filen')); };
    r.onload  = function (e) { resolve(e.target.result); };
    r.readAsArrayBuffer(file);
  });
  var pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  var allLines = [];
  for (var p = 1; p <= pdf.numPages; p++) {
    var page    = await pdf.getPage(p);
    var content = await page.getTextContent();
    var pageItems = content.items.map(function (it) {
      return { str: it.str, x: it.transform[4], y: it.transform[5] };
    });
    allLines = allLines.concat(_pdfReconstructLines(pageItems));
  }
  var result = _plParsePdfLines(allLines);
  if (!result.items.length) throw new Error('Ingen produkter funnet i PDF-en — kontroller at riktig prisliste er valgt');
  return result;
}

function _pdfReconstructLines(items) {
  var Y_TOL = 3, lines = [];
  items.forEach(function (item) {
    if (!item.str || !item.str.trim()) return;
    var y = item.y, line = null;
    for (var i = 0; i < lines.length; i++) {
      if (Math.abs(lines[i].y - y) <= Y_TOL) { line = lines[i]; break; }
    }
    if (!line) { line = { y: y, parts: [] }; lines.push(line); }
    line.parts.push({ x: item.x, text: item.str });
  });
  lines.sort(function (a, b) { return b.y - a.y; });
  return lines.map(function (line) {
    line.parts.sort(function (a, b) { return a.x - b.x; });
    return line.parts.map(function (p) { return p.text; }).join(' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}

var _PDF_CATEGORIES = [
  'NNN ALFA SHIELD', 'NNN TOUR', 'BACKCOUNTRY XPLORE',
  'BACKCOUNTRY BC', 'EXPEDITION', 'WINTER HIKING', 'ACCESSORIES'
];

function _plParsePdfLines(lines) {
  var suggestedSeason = '', validFrom = '', items = [], kategori = '', isAccessory = false;
  lines.forEach(function (line) {
    // Header: "// PRISLISTE FW 26/27 NOK"
    var hm = line.match(/\/\/\s*PRISLISTE\s+([\w\s\/]+?)\s+NOK\b/i);
    if (hm) { suggestedSeason = _plNormalizePdfSeason(hm[1]); return; }
    // Validity: "Gyldig fra 01.07.2026"
    var gm = line.match(/Gyldig\s+fra\s+(\d{2})\.(\d{2})\.(\d{4})/i);
    if (gm) { validFrom = gm[3] + '-' + gm[2] + '-' + gm[1]; return; }
    // Skip non-data lines
    if (/^(Art\.nr\.|Ordre |Alle priser|www\.|PRISLISTE |\* Str \d)/i.test(line)) return;
    // Category header
    var upper = line.toUpperCase().trim();
    for (var ci = 0; ci < _PDF_CATEGORIES.length; ci++) {
      if (upper === _PDF_CATEGORIES[ci] || upper.indexOf(_PDF_CATEGORIES[ci]) === 0) {
        kategori = _PDF_CATEGORIES[ci]; isAccessory = (kategori === 'ACCESSORIES'); return;
      }
    }
    // Product line
    var prod = _parsePdfProductLine(line, isAccessory);
    if (prod && prod.veil > 0) {
      items.push({
        name:     prod.navn,
        color:    prod.farge && prod.farge !== '-' ? prod.farge : '',
        str:      prod.str   && prod.str   !== '-' ? prod.str   : '',
        saale:    prod.saale && prod.saale !== '-' ? prod.saale : '',
        artnr:    prod.artnr,
        kategori: kategori,
        rrp:      prod.veil
      });
    }
  });
  return { items: items, suggestedSeason: suggestedSeason, validFrom: validFrom, validTo: '' };
}

function _plNormalizePdfSeason(s) {
  s = s.trim();
  s = s.replace(/^([A-Za-z]+)\s+(\d{2})\/(\d{2})$/, '$1$2$3'); // "FW 26/27" → "FW2627"
  s = s.replace(/^([A-Za-z]+)\s+(\d{2})$/,          '$1$2');    // "SS 26"    → "SS26"
  return s.replace(/\s+/g, '');
}

function _parsePdfProductLine(line, isAccessory) {
  var tokens = line.trim().split(/\s+/);
  if (tokens.length < 5) return null;
  // Last two must be pure integers (pris og veil.pris)
  var last  = tokens[tokens.length - 1];
  var slast = tokens[tokens.length - 2];
  if (!/^\d+$/.test(last) || !/^\d+$/.test(slast)) return null;
  var veil = parseInt(last, 10);
  // First token: art.nr group 1 (digits, optional letter prefix)
  if (!/^[A-Za-z]{0,3}\d+$/.test(tokens[0])) return null;
  // Second token: art.nr group 2 (digits)
  if (!/^\d+$/.test(tokens[1])) return null;
  // Third token: art.nr group 3 (digits), may be merged with name ("0009POLAR")
  var t2raw = tokens[2];
  var t2m   = t2raw.match(/^(\d+)([A-Za-z].*)?$/);
  if (!t2m) return null;
  var artNr3 = t2m[1], nameExtra = t2m[2] || '';
  var artnr = tokens[0] + ' ' + tokens[1] + ' ' + artNr3;
  // Middle tokens (between art.nr and prices)
  var mid = tokens.slice(3, tokens.length - 2);
  if (nameExtra) mid.unshift(nameExtra);
  // Split from right: accessories have 2 trailing fields (farge, str); others have 3 (farge, saale, str)
  var str   = mid.length > 0 ? mid.pop() : '';
  var saale = '', farge = '';
  if (isAccessory) {
    farge = mid.length > 0 ? mid.pop() : '';
  } else {
    saale = mid.length > 0 ? mid.pop() : '';
    farge = mid.length > 0 ? mid.pop() : '';
  }
  var navn = mid.join(' ');
  if (!navn && !farge) return null;
  return { artnr: artnr, navn: navn, farge: farge, saale: saale, str: str, veil: veil };
}
