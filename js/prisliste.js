// ─── PRISLISTE ────────────────────────────────────────────────────────────────
// Felles PRICAT-basert prisliste lagret i Supabase Storage (kataloger-bucket).
// Én person laster opp — hele teamet ser samme prisliste.
// Interne priser (innkjøp, grossist) lagres/vises ALDRI.

var _plData = [];
var _plFiltered = [];
var _plLoaded = false;
var _PL_FILE = 'prisliste-data.json';

async function plLoad() {
  var el = document.getElementById('pl-list');
  if (!el) return;
  if (!window._sbUser) {
    el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">Logg inn for å se den felles prislisten.</div>';
    return;
  }
  if (_plLoaded) return;
  el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">Laster prisliste …</div>';
  try {
    var res = await sbFetch('/storage/v1/object/authenticated/kataloger/' + _PL_FILE, { method: 'GET' });
    if (res.status === 404 || res.status === 400) { _plShowEmpty(); return; }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var payload = await res.json();
    _plData = payload.items || [];
    _plFiltered = _plData;
    _plLoaded = true;
    _plRender();
    _plShowMeta(payload.uploadedAt, payload.uploadedBy, payload.filename);
  } catch (e) {
    _plShowEmpty();
    console.warn('[prisliste] Henting feilet:', e.message);
  }
}

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
    var items = await _plParseXlsx(file);
    var s = typeof _sbSession === 'function' ? _sbSession() : null;
    var payload = {
      items: items,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: (s && s.user) ? (s.user.email || s.user.id) : ''
    };
    var res = await sbFetch('/storage/v1/object/kataloger/' + _PL_FILE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-upsert': 'true' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _plData = items;
    _plFiltered = items;
    _plLoaded = true;
    var searchEl = document.getElementById('pl-search');
    if (searchEl) searchEl.value = '';
    _plRender();
    _plShowMeta(payload.uploadedAt, payload.uploadedBy, file.name);
    showToast('✅ Prisliste oppdatert — ' + items.length + ' modeller');
  } catch (e) {
    showToast('Feil ved opplasting: ' + (e.message || e));
    console.error('[prisliste] Upload feilet:', e);
  }
}

async function _plParseXlsx(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function () { reject(new Error('Kunne ikke lese filen')); };
    reader.onload = function (ev) {
      try {
        var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        var ws = wb.Sheets['Pricat'];
        if (!ws) throw new Error('Fant ikke ark "Pricat" i filen — kontroller at riktig PRICAT-fil er valgt');

        // { range: 6 } = Excel rad 6 (0-indeksert) brukes eksplisitt som header-rad.
        // SheetJS hopper over tomme rader med {header:1}, så rows[6] ville peike feil.
        // Med {range:6} får vi objekter keyed direkte på kolonnenavnene fra rad 6.
        var rows = XLSX.utils.sheet_to_json(ws, { range: 6, defval: '' });

        // Verifiser at nødvendige kolonner finnes (sjekk unionen av alle raders nøkler)
        var allKeys = {};
        rows.forEach(function (r) { Object.keys(r).forEach(function (k) { allKeys[k] = true; }); });
        var required = ['Action', 'Name (Supplier)', 'Model no (Supplier)', 'Color', 'Size', 'Gender (Supplier)', 'Rec retail price:1 NOK'];
        var missing = required.filter(function (c) { return !allKeys[c]; });
        if (missing.length) throw new Error('Mangler kolonner: ' + missing.join(', '));

        // Rad 7 (tekniske feltnavn som "i:action") filtreres bort av Action !== 'Add'-sjekken.
        var groups = {};
        rows.forEach(function (row) {
          if (String(row['Action'] || '').trim() !== 'Add') return;

          var modelNo = String(row['Model no (Supplier)'] || '').trim();
          var color   = String(row['Color']               || '').trim();
          var key     = modelNo + '\x00' + color;

          if (!groups[key]) {
            var rrpRaw = row['Rec retail price:1 NOK'];
            var rrp = (rrpRaw !== '' && rrpRaw !== null && !isNaN(Number(rrpRaw)))
              ? Math.round(Number(rrpRaw)) : null;
            groups[key] = {
              name:    String(row['Name (Supplier)']    || '').trim(),
              modelNo: modelNo,
              color:   color,
              gender:  String(row['Gender (Supplier)']  || '').trim(),
              rrp:     rrp,
              brand:   String(row['Brand']              || '').trim(),
              sizes:   []
            };
          }
          var sz = String(row['Size'] || '').trim();
          if (sz && groups[key].sizes.indexOf(sz) === -1) {
            groups[key].sizes.push(sz);
          }
        });

        var items = Object.values(groups).map(function (g) {
          g.sizeSpan = _plSizeSpan(g.sizes);
          delete g.sizes; // ikke lagre rådata
          return g;
        });
        items.sort(function (a, b) {
          return a.name.localeCompare(b.name, 'no') || a.color.localeCompare(b.color, 'no');
        });
        if (!items.length) throw new Error('Ingen "Add"-rader funnet i Pricat-arket');
        resolve(items);
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

function plSearch() {
  var q = (document.getElementById('pl-search').value || '').trim().toLowerCase();
  if (!q) {
    _plFiltered = _plData;
  } else {
    var terms = q.split(/\s+/);
    _plFiltered = _plData.filter(function (item) {
      var hay = (item.name + ' ' + item.color + ' ' + item.modelNo).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  }
  _plRender();
}

function _plRender() {
  var el = document.getElementById('pl-list');
  if (!el) return;
  if (!_plFiltered.length) {
    el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">' +
      (_plData.length ? 'Ingen treff — prøv et annet søkeord' : 'Ingen prisliste lastet opp ennå') + '</div>';
    return;
  }
  el.innerHTML = _plFiltered.map(function (item) {
    var gLabel = item.gender === 'M' ? 'Herre' : item.gender === 'W' ? 'Dame' : '';
    var meta = [item.color, gLabel, item.sizeSpan ? 'Str. ' + item.sizeSpan : '']
      .filter(Boolean).join(' · ');
    var price = item.rrp ? item.rrp.toLocaleString('no-NO') + ' kr' : '—';
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
    showToast('Veil. pris satt til ' + rrp.toLocaleString('no-NO') + ' kr');
  }
}

function _plShowMeta(uploadedAt, uploadedBy, filename) {
  var el = document.getElementById('pl-meta');
  if (!el || !filename) return;
  var parts = [filename];
  if (uploadedAt) parts.push('oppdatert ' + new Date(uploadedAt).toLocaleDateString('no-NO'));
  if (uploadedBy) parts.push('av ' + uploadedBy);
  el.textContent = parts.join(' · ');
}

function _plShowEmpty() {
  var el = document.getElementById('pl-list');
  if (el) el.innerHTML = '<div style="color:#888780;padding:20px;text-align:center;font-size:13px">' +
    'Ingen prisliste lastet opp ennå.<br>Last opp en PRICAT .xlsx-fil for å dele med hele teamet.</div>';
}
