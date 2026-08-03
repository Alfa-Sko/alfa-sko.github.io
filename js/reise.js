// Reise-modal: enkeltbookinger (fly, hotell, leiebil, ferge) til kalender

function openReiseModal() {
  document.getElementById('mode-modal').style.display = 'none';
  const m = document.getElementById('reise-modal');
  if (!m) return;
  window._reiseType = 'fly';
  document.querySelectorAll('.reise-type-chip').forEach(c => _reiseChipStyle(c, c.dataset.type === 'fly'));
  _reiseRenderFields('fly');
  m.style.display = 'flex';
}

function closeReiseModal() {
  const m = document.getElementById('reise-modal');
  if (m) m.style.display = 'none';
}

function _reiseChipStyle(btn, active) {
  btn.style.fontWeight  = active ? '700' : '500';
  btn.style.background  = active ? '#0C447C' : '#F1EFE8';
  btn.style.color       = active ? '#fff'    : '#2C2C2A';
  btn.style.borderColor = active ? '#0C447C' : '#D3D1C7';
}

function _reiseSetType(t) {
  window._reiseType = t;
  document.querySelectorAll('.reise-type-chip').forEach(c => _reiseChipStyle(c, c.dataset.type === t));
  _reiseRenderFields(t);
}

function _reiseRenderFields(t, vals, containerEl) {
  const el = containerEl || document.getElementById('reise-fields');
  if (!el) return;
  const v = vals || {};
  const today = (typeof TODAY_STR !== 'undefined' ? TODAY_STR : null) || new Date().toISOString().slice(0, 10);

  const inp = (id, label, type, val, ph, required) =>
    `<div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">${label}${required ? ' <span style="color:#A23B27">*</span>' : ''}</label>
      <input type="${type}" id="${id}" value="${escapeHtml(String(val || ''))}" placeholder="${ph || ''}"
        style="width:100%;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;box-sizing:border-box">
    </div>`;

  const dt = (idD, idT, label, dv, tv, required) =>
    `<div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">${label}${required ? ' <span style="color:#A23B27">*</span>' : ''}</label>
      <div style="display:flex;gap:8px">
        <input type="date" id="${idD}" value="${dv || today}"
          style="flex:2;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px">
        <input type="time" id="${idT}" value="${tv || ''}"
          style="flex:1;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px">
      </div>
    </div>`;

  let html = '';
  if (t === 'hotell') {
    html += inp('rf-hotel-name', 'Navn / kjede', 'text', v.hotelName, 'f.eks. Scandic, Thon...', true);
    html += inp('rf-hotel-city', 'By', 'text', v.city, 'f.eks. Oslo', true);
    html += dt('rf-checkin-date', 'rf-checkin-time', 'Innsjekk', v.checkinDate, v.checkinTime, true);
    html += dt('rf-checkout-date', 'rf-checkout-time', 'Utsjekk', v.checkoutDate, v.checkoutTime, true);
    html += inp('rf-hotel-ref', 'Bookingreferanse', 'text', v.bookingRef, 'valgfritt', false);
  } else if (t === 'fly') {
    html += inp('rf-fly-from', 'Fra (by / flyplass)', 'text', v.from, 'f.eks. Oslo (OSL)', true);
    html += inp('rf-fly-to', 'Til (by / flyplass)', 'text', v.to, 'f.eks. Tromsø (TOS)', true);
    html += dt('rf-dep-date', 'rf-dep-time', 'Avreise', v.depDate, v.depTime, true);
    html += dt('rf-arr-date', 'rf-arr-time', 'Ankomst (valgfritt)', v.arrDate, v.arrTime, false);
    html += inp('rf-airline', 'Flyselskap', 'text', v.airline, 'f.eks. SAS, Norwegian', false);
    html += inp('rf-fly-ref', 'Reisereferanse / bookingnummer', 'text', v.bookingRef, 'vises direkte i kalenderboksen', false);
  } else if (t === 'leiebil') {
    html += inp('rf-car-location', 'Utleiested', 'text', v.location, 'f.eks. Hertz Tromsø', true);
    html += dt('rf-pickup-date', 'rf-pickup-time', 'Henting', v.pickupDate, v.pickupTime, true);
    html += dt('rf-return-date', 'rf-return-time', 'Levering', v.returnDate, v.returnTime, true);
    html += inp('rf-car-ref', 'Bookingreferanse', 'text', v.bookingRef, 'valgfritt', false);
  } else if (t === 'ferge') {
    html += inp('rf-ferry-from', 'Fra', 'text', v.from, 'f.eks. Oslo', true);
    html += inp('rf-ferry-to', 'Til', 'text', v.to, 'f.eks. Kiel', true);
    html += dt('rf-ferry-dep-date', 'rf-ferry-dep-time', 'Avgang', v.depDate, v.depTime, true);
    html += inp('rf-ferry-ref', 'Bookingreferanse', 'text', v.bookingRef, 'valgfritt', false);
  }
  el.innerHTML = html;
}

function _rfVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function _parseMins(timeStr) {
  if (!timeStr) return null;
  const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
}

function saveReise() {
  if (typeof _roGuard === 'function' && _roGuard()) return;
  const t = window._reiseType || 'fly';
  let ev = null, dateKey = '';

  if (t === 'hotell') {
    const name     = _rfVal('rf-hotel-name');
    const city     = _rfVal('rf-hotel-city');
    const cinDate  = _rfVal('rf-checkin-date');
    const cinTime  = _rfVal('rf-checkin-time');
    const coutDate = _rfVal('rf-checkout-date');
    const coutTime = _rfVal('rf-checkout-time');
    const ref      = _rfVal('rf-hotel-ref');
    if (!name || !cinDate) { showToast('Fyll inn hotellets navn og innsjekk-dato'); return; }
    const startMins = _parseMins(cinTime) ?? 15 * 60;
    dateKey = cinDate;
    ev = { type:'hotel', reiseEvent:true, label:name+(city?' – '+city:''), startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60), city, checkoutDate:coutDate, checkoutTime:coutTime, bookingRef:ref, booked:true };

  } else if (t === 'fly') {
    const from    = _rfVal('rf-fly-from');
    const to      = _rfVal('rf-fly-to');
    const depDate = _rfVal('rf-dep-date');
    const depTime = _rfVal('rf-dep-time');
    const arrDate = _rfVal('rf-arr-date');
    const arrTime = _rfVal('rf-arr-time');
    const airline = _rfVal('rf-airline');
    const ref     = _rfVal('rf-fly-ref');
    if (!from || !to || !depDate) { showToast('Fyll inn Fra, Til og avreisedato'); return; }
    const startMins = _parseMins(depTime) ?? 8 * 60;
    let endMins = (_parseMins(arrTime) ?? null);
    if (endMins === null || endMins <= startMins) endMins = startMins + 90;
    dateKey = depDate;
    ev = { type:'flight', reiseEvent:true, label:from+' → '+to, startMins, endMins, h:Math.floor(startMins/60), hEnd:Math.ceil(endMins/60), from, to, airline, arrivalDate:arrDate, arrivalTime:arrTime, bookingRef:ref, booked:true };

  } else if (t === 'leiebil') {
    const location   = _rfVal('rf-car-location');
    const pickupDate = _rfVal('rf-pickup-date');
    const pickupTime = _rfVal('rf-pickup-time');
    const retDate    = _rfVal('rf-return-date');
    const retTime    = _rfVal('rf-return-time');
    const ref        = _rfVal('rf-car-ref');
    if (!location || !pickupDate) { showToast('Fyll inn utleiested og hentedato'); return; }
    const startMins = _parseMins(pickupTime) ?? 10 * 60;
    dateKey = pickupDate;
    ev = { type:'rental', reiseEvent:true, label:location, startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60), location, returnDate:retDate, returnTime:retTime, bookingRef:ref, booked:true };

  } else if (t === 'ferge') {
    const from    = _rfVal('rf-ferry-from');
    const to      = _rfVal('rf-ferry-to');
    const depDate = _rfVal('rf-ferry-dep-date');
    const depTime = _rfVal('rf-ferry-dep-time');
    const ref     = _rfVal('rf-ferry-ref');
    if (!from || !to || !depDate) { showToast('Fyll inn Fra, Til og avgangsdato'); return; }
    const startMins = _parseMins(depTime) ?? 17 * 60;
    dateKey = depDate;
    ev = { type:'ferry', reiseEvent:true, label:from+' → '+to, startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60), from, to, bookingRef:ref, booked:true };
  }

  if (!ev || !dateKey) return;
  if (!calEvents[dateKey]) calEvents[dateKey] = [];
  calEvents[dateKey].push(ev);
  saveData('alfa_events', calEvents);
  closeReiseModal();
  _reiseNavToDate(dateKey);
  const labels = { hotel:'Hotell', flight:'Flyreise', rental:'Leiebil', ferry:'Ferge' };
  showToast((labels[ev.type]||'Reise') + ' lagt til i kalender');
}

function _reiseNavToDate(dateKey) {
  const parts = dateKey.split('-');
  calCursor = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  calView = 'day';
  document.querySelectorAll('.vt-btn').forEach((b, i) => b.classList.toggle('active', i === 2));
  if (typeof showSection === 'function') showSection('kalender', null);
  if (typeof renderCal === 'function') renderCal();
}

// ── Reise-editor (klikk på eksisterande reise-oppføring) ─────────────────────

function openReiseEditor(dateKey, e) {
  if (typeof closeEvPopup === 'function') closeEvPopup();
  const m = document.getElementById('reise-editor-modal');
  if (!m) return;
  window._reiseEditKey  = dateKey;
  window._reiseEditOrig = e;

  const icon = e.type==='flight' ? '✈️' : e.type==='hotel' ? '🏨' : e.type==='rental' ? '🚙' : '⛴️';
  const titleEl = document.getElementById('reise-ed-title');
  if (titleEl) titleEl.textContent = icon + ' ' + (e.label || 'Reise');

  const fmtTime = mins => {
    if (mins === undefined || mins === null) return '';
    const h = Math.floor(mins / 60), mm = mins % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  };

  const el = document.getElementById('reise-ed-fields');
  if (!el) return;

  const typeMap = { flight:'fly', hotel:'hotell', rental:'leiebil', ferry:'ferge' };
  const rType = typeMap[e.type] || 'fly';
  let vals = {};

  if (e.type === 'flight') {
    const parts = (e.label || '').split(' → ');
    vals = { from:e.from||parts[0]||'', to:e.to||parts[1]||'', depDate:dateKey, depTime:fmtTime(e.startMins), arrDate:e.arrivalDate||dateKey, arrTime:e.arrivalTime||fmtTime(e.endMins), airline:e.airline||'', bookingRef:e.bookingRef||'' };
  } else if (e.type === 'hotel') {
    const parts = (e.label || '').split(' – ');
    vals = { hotelName:parts[0]||e.label||'', city:parts[1]||e.city||'', checkinDate:dateKey, checkinTime:fmtTime(e.startMins), checkoutDate:e.checkoutDate||'', checkoutTime:e.checkoutTime||'', bookingRef:e.bookingRef||'' };
  } else if (e.type === 'rental') {
    vals = { location:e.location||e.label||'', pickupDate:dateKey, pickupTime:fmtTime(e.startMins), returnDate:e.returnDate||'', returnTime:e.returnTime||'', bookingRef:e.bookingRef||'' };
  } else if (e.type === 'ferry') {
    const parts = (e.label || '').split(' → ');
    vals = { from:e.from||parts[0]||'', to:e.to||parts[1]||'', depDate:dateKey, depTime:fmtTime(e.startMins), bookingRef:e.bookingRef||'' };
  }

  _reiseRenderFields(rType, vals, el);

  m.style.display = 'flex';
}

function closeReiseEditor() {
  const m = document.getElementById('reise-editor-modal');
  if (m) m.style.display = 'none';
  window._reiseEditKey  = null;
  window._reiseEditOrig = null;
}

function saveReiseEdit() {
  if (typeof _roGuard === 'function' && _roGuard()) return;
  const dateKey = window._reiseEditKey;
  const orig    = window._reiseEditOrig;
  if (!dateKey || !orig) return;

  const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const t = orig.type;
  let updated = { ...orig };
  let newDateKey = dateKey;

  if (t === 'flight') {
    const from    = v('rf-fly-from');
    const to      = v('rf-fly-to');
    const depDate = v('rf-dep-date');
    const depTime = v('rf-dep-time');
    const arrDate = v('rf-arr-date');
    const arrTime = v('rf-arr-time');
    if (!depDate) { showToast('Fyll inn avreisedato'); return; }
    const startMins = _parseMins(depTime) ?? orig.startMins;
    let endMins = _parseMins(arrTime) ?? orig.endMins;
    if (endMins <= startMins) endMins = startMins + 90;
    newDateKey = depDate;
    updated = { ...orig, label:from+' → '+to, from, to, airline:v('rf-airline'), bookingRef:v('rf-fly-ref'), arrivalDate:arrDate, arrivalTime:arrTime, startMins, endMins, h:Math.floor(startMins/60), hEnd:Math.ceil(endMins/60) };

  } else if (t === 'hotel') {
    const name    = v('rf-hotel-name');
    const city    = v('rf-hotel-city');
    const cinDate = v('rf-checkin-date');
    const cinTime = v('rf-checkin-time');
    if (!cinDate) { showToast('Fyll inn innsjekk-dato'); return; }
    const startMins = _parseMins(cinTime) ?? orig.startMins;
    newDateKey = cinDate;
    updated = { ...orig, label:name+(city?' – '+city:''), city, checkoutDate:v('rf-checkout-date'), checkoutTime:v('rf-checkout-time'), bookingRef:v('rf-hotel-ref'), startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60) };

  } else if (t === 'rental') {
    const location   = v('rf-car-location');
    const pickupDate = v('rf-pickup-date');
    const pickupTime = v('rf-pickup-time');
    if (!pickupDate) { showToast('Fyll inn hentedato'); return; }
    const startMins = _parseMins(pickupTime) ?? orig.startMins;
    newDateKey = pickupDate;
    updated = { ...orig, label:location, location, returnDate:v('rf-return-date'), returnTime:v('rf-return-time'), bookingRef:v('rf-car-ref'), startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60) };

  } else if (t === 'ferry') {
    const from    = v('rf-ferry-from');
    const to      = v('rf-ferry-to');
    const depDate = v('rf-ferry-dep-date');
    const depTime = v('rf-ferry-dep-time');
    if (!depDate) { showToast('Fyll inn avgangsdato'); return; }
    const startMins = _parseMins(depTime) ?? orig.startMins;
    newDateKey = depDate;
    updated = { ...orig, label:from+' → '+to, from, to, bookingRef:v('rf-ferry-ref'), startMins, endMins:startMins+60, h:Math.floor(startMins/60), hEnd:Math.ceil((startMins+60)/60) };
  }

  // Remove from old date
  if (calEvents[dateKey]) {
    calEvents[dateKey] = calEvents[dateKey].filter(x =>
      !(x.reiseEvent && x.type === orig.type && x.startMins === orig.startMins && x.label === orig.label)
    );
    if (!calEvents[dateKey].length) delete calEvents[dateKey];
  }
  if (!calEvents[newDateKey]) calEvents[newDateKey] = [];
  calEvents[newDateKey].push(updated);
  saveData('alfa_events', calEvents);

  closeReiseEditor();
  _reiseNavToDate(newDateKey);
  showToast('Reise oppdatert');
}

function deleteReiseEdit() {
  if (typeof _roGuard === 'function' && _roGuard()) return;
  const dateKey = window._reiseEditKey;
  const orig    = window._reiseEditOrig;
  if (!dateKey || !orig) return;
  if (!confirm('Slette denne reiseoppføringen?')) return;
  if (calEvents[dateKey]) {
    calEvents[dateKey] = calEvents[dateKey].filter(x =>
      !(x.reiseEvent && x.type === orig.type && x.startMins === orig.startMins && x.label === orig.label)
    );
    if (!calEvents[dateKey].length) delete calEvents[dateKey];
  }
  saveData('alfa_events', calEvents);
  closeReiseEditor();
  if (typeof renderCal === 'function') renderCal();
  showToast('Reiseoppføring slettet');
}
