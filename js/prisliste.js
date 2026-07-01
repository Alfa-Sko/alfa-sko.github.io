// ─── PRISLISTE (fler-sesong) ──────────────────────────────────────────────────
// Felles PRICAT-prislister per sesong. Lagres som pl-{sesong}.json i
// kataloger-bucketen. Alle innloggede brukere ser alle sesonger.
// Interne priser (innkjøp/grossist) lagres/vises ALDRI.

var _plSeasons     = {};    // { "SS26": {season, filename, uploadedAt, uploadedBy, validFrom, validTo, items} }
var _plActiveSeason = null; // sesong som vises nå
var _plFiltered    = [];    // søkeresultat for aktiv sesong
var _plLoaded      = false; // har vi hentet sesong-listen denne sesjonen?
var _plPending     = null;  // { items, suggestedSeason, validFrom, validTo, filename }

var _PL_PREFIX = 'pl-';

function _plStorageName(season) {
  return 'pl-' + season.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.json';
}
function _plSeasonKey(storageName) {
  return storageName.replace(/^pl-(.+)\.json$/, '$1');
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

  if (_plLoaded) {
    _plRenderSeasons();
    _plRenderMeta();
    _plRender();
    return;
  }

  listEl.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">Laster prislister …</div>';

  try {
    var listRes = await sbFetch('/storage/v1/object/list/kataloger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: _PL_PREFIX, limit: 50, sortBy: { column: 'name', order: 'asc' } })
    });
    if (!listRes.ok) throw new Error('HTTP ' + listRes.status);
    var files = await listRes.json();
    var seasonFiles = (files || []).filter(function (f) { return f.name && /^pl-.+\.json$/.test(f.name); });

    if (!seasonFiles.length) {
      _plLoaded = true;
      if (seasEl) seasEl.innerHTML = '';
      _plShowEmpty();
      return;
    }

    await Promise.all(seasonFiles.map(async function (f) {
      try {
        var r = await sbFetch('/storage/v1/object/authenticated/kataloger/' + encodeURIComponent(f.name), { method: 'GET' });
        if (!r.ok) return;
        var data = await r.json();
        _plSeasons[_plSeasonKey(f.name)] = data;
      } catch (e) {
        console.warn('[prisliste] Kunne ikke hente', f.name, e.message);
      }
    }));

    _plLoaded = true;

    if (!Object.keys(_plSeasons).length) { _plShowEmpty(); return; }

    if (!_plActiveSeason || !_plSeasons[_plActiveSeason]) {
      _plActiveSeason = _plPickCurrentSeason();
    }
    _plFiltered = _plActiveSeason ? ((_plSeasons[_plActiveSeason] || {}).items || []) : [];
    _plRenderSeasons();
    _plRenderMeta();
    _plRender();

  } catch (e) {
    listEl.innerHTML = '<div style="color:#A23B27;padding:20px;font-size:13px">Kunne ikke hente prislister: ' + escapeHtml(e.message || '') + '</div>';
    console.warn('[prisliste] Load feilet:', e);
  }
}

function _plPickCurrentSeason() {
  var keys = Object.keys(_plSeasons);
  if (!keys.length) return null;
  var today = new Date().toISOString().slice(0, 10);
  var current = keys.filter(function (k) {
    var s = _plSeasons[k];
    return s.validFrom && s.validTo && today >= s.validFrom && today <= s.validTo;
  });
  if (current.length) {
    return current.sort(function (a, b) {
      return (_plSeasons[b].validFrom || '').localeCompare(_plSeasons[a].validFrom || '');
    })[0];
  }
  return keys.sort(function (a, b) {
    return (_plSeasons[b].uploadedAt || '').localeCompare(_plSeasons[a].uploadedAt || '');
  })[0];
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
  document.getElementById('pl-file-input').click();
}

async function plHandleUpload(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!/\.xlsx$/i.test(file.name)) { showToast('Filen må være .xlsx (Excel)'); return; }
  showToast('Parser prisliste …');
  try {
    var parsed = await _plParseXlsx(file);
    _plPending = { items: parsed.items, suggestedSeason: parsed.suggestedSeason, validFrom: parsed.validFrom, validTo: parsed.validTo, filename: file.name };

    var nameEl = document.getElementById('pl-confirm-name');
    var fromEl = document.getElementById('pl-confirm-from');
    var toEl   = document.getElementById('pl-confirm-to');
    var fnEl   = document.getElementById('pl-confirm-file');
    if (nameEl) nameEl.value = parsed.suggestedSeason;
    if (fromEl) fromEl.textContent = parsed.validFrom || '—';
    if (toEl)   toEl.textContent   = parsed.validTo   || '—';
    if (fnEl)   fnEl.textContent   = file.name;

    var card = document.getElementById('pl-upload-confirm');
    if (card) { card.style.display = 'block'; card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    showToast(parsed.items.length + ' modeller analysert — bekreft sesongnavn');
  } catch (e) {
    showToast('Feil: ' + (e.message || e));
    console.error('[prisliste] Parse feilet:', e);
  }
}

async function plConfirmUpload() {
  if (!_plPending) return;
  var nameEl = document.getElementById('pl-confirm-name');
  var season = (nameEl ? nameEl.value : '').trim();
  if (!season) { showToast('Skriv inn sesongnavn'); if (nameEl) nameEl.focus(); return; }

  var s = typeof _sbSession === 'function' ? _sbSession() : null;
  var payload = {
    season:     season,
    filename:   _plPending.filename,
    uploadedAt: new Date().toISOString(),
    uploadedBy: (s && s.user) ? (s.user.email || s.user.id) : '',
    validFrom:  _plPending.validFrom,
    validTo:    _plPending.validTo,
    items:      _plPending.items
  };

  showToast('Laster opp ' + season + ' …');
  try {
    var res = await sbFetch('/storage/v1/object/kataloger/' + _plStorageName(season), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-upsert': 'true' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    _plSeasons[season] = payload;
    _plActiveSeason = season;
    _plFiltered = payload.items;
    _plLoaded = true;
    _plPending = null;
    plCancelUpload();

    var searchEl = document.getElementById('pl-search');
    if (searchEl) searchEl.value = '';
    _plRenderSeasons();
    _plRenderMeta();
    _plRender();
    showToast('✅ ' + season + ' lastet opp — ' + payload.items.length + ' modeller');
  } catch (e) {
    showToast('Opplasting feilet: ' + (e.message || e));
    console.error('[prisliste] Upload feilet:', e);
  }
}

function plCancelUpload() {
  _plPending = null;
  var card = document.getElementById('pl-upload-confirm');
  if (card) card.style.display = 'none';
}

// ── Sesong-veksling og sletting ───────────────────────────────────────────────

function plSelectSeason(key) {
  if (!_plSeasons[key]) return;
  _plActiveSeason = key;
  _plFiltered = _plSeasons[key].items || [];
  var searchEl = document.getElementById('pl-search');
  if (searchEl) searchEl.value = '';
  _plRenderSeasons();
  _plRenderMeta();
  _plRender();
}

async function plDeleteSeason(key, ev) {
  if (ev) ev.stopPropagation();
  if (!_plSeasons[key]) return;
  if (!confirm('Slette prislisten «' + key + '»?\nDette kan ikke angres.')) return;

  try {
    var res = await sbFetch('/storage/v1/object/kataloger/' + _plStorageName(key), { method: 'DELETE' });
    if (!res.ok && res.status !== 404) throw new Error('HTTP ' + res.status);
    delete _plSeasons[key];
    if (_plActiveSeason === key) {
      _plActiveSeason = _plPickCurrentSeason();
      _plFiltered = _plActiveSeason ? ((_plSeasons[_plActiveSeason] || {}).items || []) : [];
    }
    _plRenderSeasons();
    _plRenderMeta();
    _plRender();
    showToast('Prisliste «' + key + '» slettet');
  } catch (e) {
    showToast('Sletting feilet: ' + (e.message || e));
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

function _plRenderSeasons() {
  var el = document.getElementById('pl-seasons');
  if (!el) return;
  var keys = Object.keys(_plSeasons).sort(function (a, b) { return a.localeCompare(b, 'no'); });
  if (!keys.length) { el.innerHTML = ''; return; }

  el.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
    keys.map(function (k) {
      var esc    = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var active = k === _plActiveSeason;
      var cur    = _plIsCurrentSeason(k);
      return '<button class="pl-season-btn' + (active ? ' active' : '') + '" onclick="plSelectSeason(\'' + esc + '\')">' +
        escapeHtml(k) +
        (cur ? ' <span class="pl-cur-dot" title="Gjeldende sesong">●</span>' : '') +
        ' <span class="pl-season-del" onclick="plDeleteSeason(\'' + esc + '\',event)" title="Slett ' + escapeHtml(k) + '">✕</span>' +
        '</button>';
    }).join('') +
    '</div>';
}

function _plRenderMeta() {
  var el = document.getElementById('pl-meta');
  if (!el) { return; }
  if (!_plActiveSeason || !_plSeasons[_plActiveSeason]) { el.textContent = ''; return; }
  var s = _plSeasons[_plActiveSeason];
  var parts = [];
  if (s.filename) parts.push(s.filename);
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
      var hay = (item.name + ' ' + item.color + ' ' + item.modelNo).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  }
  _plRender();
}

function _plRender() {
  var el = document.getElementById('pl-list');
  if (!el) return;

  if (!_plActiveSeason || !Object.keys(_plSeasons).length) {
    _plShowEmpty();
    return;
  }

  if (!_plFiltered.length) {
    var allItems = (_plSeasons[_plActiveSeason] || {}).items || [];
    el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">' +
      (allItems.length ? 'Ingen treff — prøv et annet søkeord' : 'Ingen modeller i denne sesongen') + '</div>';
    return;
  }

  el.innerHTML = _plFiltered.map(function (item) {
    var gLabel = item.gender === 'M' ? 'Herre' : item.gender === 'W' ? 'Dame' : '';
    var meta = [item.color, gLabel, item.sizeSpan ? 'Str. ' + item.sizeSpan : ''].filter(Boolean).join(' · ');
    var price = item.rrp ? item.rrp.toLocaleString('no-NO') + ' kr' : '—';
    return '<div class="pl-item">' +
      '<div class="pl-name">' + escapeHtml(item.name) + '</div>' +
      '<div class="pl-meta-line">' + escapeHtml(meta) + '</div>' +
      '<div class="pl-footer">' +
        '<span class="pl-price">' + price + '</span>' +
        (item.rrp ? '<button class="pl-calc-btn" onclick="plUseInCalc(' + item.rrp + ')">Bruk i kalkulator →</button>' : '') +
      '</div>' +
    '</div>';
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
    'Ingen prislister lastet opp ennå.<br>Last opp en PRICAT .xlsx-fil for å dele med hele teamet.</div>';
}

// ── Parse XLSX ────────────────────────────────────────────────────────────────

async function _plParseXlsx(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function () { reject(new Error('Kunne ikke lese filen')); };
    reader.onload = function (ev) {
      try {
        var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array', cellDates: true });
        var ws = wb.Sheets['Pricat'];
        if (!ws) throw new Error('Fant ikke ark "Pricat" i filen');

        // ── Metadata (rad 0 er tom → hoppes over) ──
        // metaRows[0] = rad 1: "Buyer, Currency, PRICAT Name, Period, Valid from date, Valid to date, ..."
        // metaRows[1] = rad 2: tekniske feltnavn
        // metaRows[2] = rad 3: metadata-verdier (NOK, SS26, 2026-01-01, ...)
        var metaRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        var mHdrs = metaRows[0] || [];
        var mVals = metaRows[2] || [];

        function mGet(name) {
          var i = mHdrs.indexOf(name);
          return i >= 0 ? mVals[i] : '';
        }

        function toDateStr(val) {
          if (!val) return '';
          if (val instanceof Date) return val.toISOString().slice(0, 10);
          if (typeof val === 'number') {
            // Excel-seriedato → JS Date (UTC)
            return new Date(Math.round((val - 25569) * 86400000)).toISOString().slice(0, 10);
          }
          return String(val).trim();
        }

        var pricatName = String(mGet('PRICAT Name') || '').trim();
        var period     = String(mGet('Period')      || '').trim();
        var validFrom  = toDateStr(mGet('Valid from date'));
        var validTo    = toDateStr(mGet('Valid to date'));

        // Foreslå sesongnavn: PRICAT Name > Period (SS2026→SS26) > ''
        var suggestedSeason = pricatName ||
          (period ? period.replace(/^([A-Za-z]+)20(\d{2})$/, '$1$2') : '') ||
          '';

        // ── Data-rader ──
        // { range: 6 } = rad 6 (0-indeksert) er eksplisitt header-rad.
        // Rad 7 (tekniske feltnavn som "i:action") filtreres bort av Action!="Add".
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
          var color   = String(row['Color']               || '').trim();
          var key     = modelNo + '\x00' + color;

          if (!groups[key]) {
            var rrpRaw = row['Rec retail price:1 NOK'];
            groups[key] = {
              name:    String(row['Name (Supplier)']   || '').trim(),
              modelNo: modelNo,
              color:   color,
              gender:  String(row['Gender (Supplier)'] || '').trim(),
              rrp:     (rrpRaw !== '' && rrpRaw !== null && !isNaN(Number(rrpRaw))) ? Math.round(Number(rrpRaw)) : null,
              brand:   String(row['Brand']             || '').trim(),
              sizes:   []
            };
          }
          var sz = String(row['Size'] || '').trim();
          if (sz && groups[key].sizes.indexOf(sz) === -1) groups[key].sizes.push(sz);
        });

        var items = Object.values(groups).map(function (g) {
          g.sizeSpan = _plSizeSpan(g.sizes);
          delete g.sizes;
          return g;
        });
        items.sort(function (a, b) {
          return a.name.localeCompare(b.name, 'no') || a.color.localeCompare(b.color, 'no');
        });
        if (!items.length) throw new Error('Ingen "Add"-rader funnet i Pricat-arket');

        resolve({ items: items, suggestedSeason: suggestedSeason, validFrom: validFrom, validTo: validTo });
      } catch (err) {
        reject(err);
      }
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
