// Ladeplanlegger-widget for Alfa Kompass
// Basert på ladeplanlegger.html-komponent (adapter-mønster).
// Krev: nobil.js (nobilFetch), utils.js (haversineKm, escapeHtml),
//       state.js (userProfile, calEvents), dashboard.js (_saveEvRange)

/* ------------------------------------------------------------------
   cpInit() — kalt frå showSection('transport') i ui.js.
   Viser/gøymer widgeten, og viser placeholder for ikkje-elbil-brukarar.
   ------------------------------------------------------------------ */
function cpInit() {
  const host = document.getElementById('cp-widget-host');
  const noEv = document.getElementById('cp-no-ev');
  if (!host) return;
  const isEV = typeof userProfile !== 'undefined' && userProfile.carType === 'elbil';
  host.style.display = isEV ? '' : 'none';
  if (noEv) noEv.style.display = isEV ? 'none' : '';
  if (!isEV) return;

  const inp = document.getElementById('cpRange');
  if (inp) {
    const v = typeof userProfile !== 'undefined' ? (userProfile.evRange || '') : '';
    if (v) inp.value = v;
  }
}

/* ------------------------------------------------------------------
   Hovudlogikk — IIFE for å unngå variabelkollisjoner
   ------------------------------------------------------------------ */
(() => {
'use strict';

/* ---- hjelpar: parse høgste kW frå conns[].cap-strengar ---- */
function _parseMaxKw(conns) {
  let max = 0;
  (conns || []).forEach(c => {
    const m = String(c.cap || '').match(/\d+/);
    if (m) max = Math.max(max, +m[0]);
  });
  return max || 50;
}

/* ================================================================
   ADAPTERE — det einaste som er knytt til Alfa Kompass-data
   ================================================================ */
const CP = {

  get car() {
    const p = typeof userProfile !== 'undefined' ? userProfile : {};
    return {
      maxChargeKw:       p.maxChargeKw       || 170,
      consumptionKwh100: p.consumptionKwh100 || 24,
    };
  },

  avgSpeedKmh:     58,
  reserveKm:       15,
  minVisitMinutes: 20,
  workdayEndHour:  16,

  async getPosition() {
    return new Promise((resolve) => {
      const fallback = () => {
        const cc = typeof CITY_COORDS !== 'undefined' ? CITY_COORDS : {};
        const city = (typeof userProfile !== 'undefined' && userProfile.homeCity) || '';
        const coord = cc[city];
        if (coord) return resolve({ lat: coord.lat, lon: coord.lng });
        resolve({ lat: 69.6712, lon: 18.9410 }); // Tromsø som fallback
      };
      if (!navigator.geolocation) { fallback(); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        fallback,
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  },

  async getStations() {
    const pos = await CP.getPosition();
    const pad = 0.9; // ~90 km radius
    const raw = typeof nobilFetch === 'function'
      ? await nobilFetch(pos.lat - pad, pos.lon - pad, pos.lat + pad, pos.lon + pad)
      : [];
    return raw.map(s => ({
      id:              s.id || (s.lat + ',' + s.lng),
      name:            s.name  || 'Ladestasjon',
      operator:        s.op    || '',
      lat:             s.lat,
      lon:             s.lng,   // Nobil bruker .lng, CP bruker .lon
      max_kw:          _parseMaxKw(s.conns),
      connector_types: [...new Set((s.conns || []).map(c => c.type).filter(Boolean))],
    }));
  },

  async getTodaysEvents() {
    const todayStr = typeof TODAY_STR !== 'undefined'
      ? TODAY_STR : new Date().toISOString().slice(0, 10);
    const evs = (typeof calEvents !== 'undefined' && calEvents[todayStr]) || [];
    const custs = typeof getCustomers === 'function' ? getCustomers() : [];
    const byName = {};
    custs.forEach(c => { if (c.name) byName[c.name] = c; });

    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    return evs
      .filter(e => e.type === 'visit' && e.label)
      .map(e => {
        const sm = e.startMins !== undefined ? e.startMins : (e.h || 8) * 60;
        const em = e.endMins   !== undefined ? e.endMins   : sm + 60;
        const c  = byName[e.label];
        return {
          // ID kodar dato + namn + starttid — nok til å finne att i calEvents
          id:       JSON.stringify({ d: todayStr, l: e.label, m: sm }),
          title:    e.label,
          customer: e.label,
          start:    new Date(midnight.getTime() + sm * 60000),
          end:      new Date(midnight.getTime() + em * 60000),
          lat:      (c && c.lat) ? c.lat : NaN,
          lon:      (c && c.lng) ? c.lng : NaN,
        };
      })
      .sort((a, b) => a.start - b.start);
  },

  async updateEvent(id, patch) {
    try {
      const { d: dk, l: lbl, m: origSm } = JSON.parse(id);
      const evs = typeof calEvents !== 'undefined' ? (calEvents[dk] || []) : [];
      const ev  = evs.find(e =>
        e.type === 'visit' && e.label === lbl &&
        (e.startMins !== undefined ? e.startMins : (e.h || 8) * 60) === origSm
      );
      if (!ev) return;
      const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
      if (patch.start) {
        ev.startMins = Math.round((patch.start - midnight) / 60000);
        ev.h = Math.floor(ev.startMins / 60);
      }
      if (patch.end) {
        ev.endMins = Math.round((patch.end - midnight) / 60000);
        ev.hEnd = Math.ceil(ev.endMins / 60);
      }
      if (typeof saveData === 'function') saveData('alfa_events', calEvents);
      if (typeof renderCal === 'function') setTimeout(renderCal, 0);
      if (typeof renderTodayAgenda === 'function') setTimeout(renderTodayAgenda, 0);
    } catch (_) {}
  },

  async deleteEvent(id) {
    try {
      const { d: dk, l: lbl, m: origSm } = JSON.parse(id);
      if (typeof calEvents === 'undefined' || !calEvents[dk]) return;
      calEvents[dk] = calEvents[dk].filter(e => !(
        e.type === 'visit' && e.label === lbl &&
        (e.startMins !== undefined ? e.startMins : (e.h || 8) * 60) === origSm
      ));
      if (!calEvents[dk].length) delete calEvents[dk];
      if (typeof saveData === 'function') saveData('alfa_events', calEvents);
      if (typeof renderCal === 'function') setTimeout(renderCal, 0);
      if (typeof renderTodayAgenda === 'function') setTimeout(renderTodayAgenda, 0);
    } catch (_) {}
  },

  openNavigation(station) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`,
      '_blank', 'noopener'
    );
  },

  toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
  },
};

/* ================================================================
   REKNEHJELPERE (uendra frå originalkomponenten)
   ================================================================ */
const R_EARTH = 6371;
const rad = d => d * Math.PI / 180;

function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon/2)**2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

const driveMinutes = km => Math.max(1, Math.round(km / CP.avgSpeedKmh * 60));
const addMin  = (date, min) => new Date(date.getTime() + min * 60000);
const diffMin = (a, b)     => Math.round((a - b) / 60000);
const hhmm    = d => d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

function fmtDur(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} t ${m} min` : `${h} t`;
}

function rangeGainedKm(stationKw, minutes) {
  const kw  = Math.min(stationKw || 0, CP.car.maxChargeKw);
  const kwh = kw * (minutes / 60) * 0.8;
  return Math.round(kwh / CP.car.consumptionKwh100 * 100);
}

/* ================================================================
   TILSTAND
   ================================================================ */
const state = {
  rangeKm:         45,
  origin:          null,
  stations:        [],   // alle stasjonar innanfor rekkevidde (maks 15), ufiltrert
  events:          [],
  selectedStation: null,
  chargeMinutes:   30,
  plan:            null,
  opFilter:        null, // null = alle, string = berre denne leverandøren
};

const TIME_OPTIONS = [15, 30, 45, 60, 90];

/* ================================================================
   KJERNE: bygg plan og konsekvensar
   ================================================================ */
function buildPlan() {
  const st = state.selectedStation;
  if (!st) return null;

  const now          = new Date();
  const toStationMin = driveMinutes(st.distanceKm);
  const arriveStation = addMin(now, toStationMin);
  const chargeDone   = addMin(arriveStation, state.chargeMinutes);

  const upcoming = state.events.filter(e => e.start > now);
  const next     = upcoming[0] || null;

  let onwardMin = toStationMin;
  if (next && Number.isFinite(next.lat)) {
    onwardMin = driveMinutes(distanceKm(st, next));
  }
  const arriveNext = addMin(chargeDone, onwardMin);
  const overlapMin = next ? Math.max(0, diffMin(arriveNext, next.start)) : 0;

  return {
    now, toStationMin, arriveStation, chargeDone,
    onwardMin, arriveNext, next, upcoming, overlapMin,
    conflict: overlapMin > 0,
  };
}

function consequences(plan) {
  const { next, upcoming, overlapMin } = plan;
  const lastEnd       = upcoming.length ? upcoming[upcoming.length - 1].end : null;
  const shiftedLastEnd = lastEnd ? addMin(lastEnd, overlapMin) : null;
  const endHour       = CP.workdayEndHour;
  const shiftLate     = shiftedLastEnd &&
    (shiftedLastEnd.getHours() > endHour ||
     (shiftedLastEnd.getHours() === endHour && shiftedLastEnd.getMinutes() > 0));

  const origDur  = diffMin(next.end, next.start);
  const newDur   = diffMin(next.end, plan.arriveNext);
  const tooShort = newDur < CP.minVisitMinutes;

  const after = upcoming[1] || null;
  let afterAlsoClashes = false;
  if (after) {
    let onward = plan.toStationMin;
    if (Number.isFinite(after.lat)) onward = driveMinutes(distanceKm(state.selectedStation, after));
    afterAlsoClashes = addMin(plan.chargeDone, onward) > after.start;
  }

  return {
    shift:   { count: upcoming.length, lastEnd, shiftedLastEnd, late: shiftLate },
    shorten: { origDur, newDur, tooShort },
    remove:  { after, afterAlsoClashes },
  };
}

/* ================================================================
   RENDERING (uendra frå originalkomponenten)
   ================================================================ */
const $ = id => document.getElementById(id);

function renderOpFilter() {
  const box = $('cpOpFilter');
  if (!box) return;
  const ops = [...new Set(state.stations.map(s => s.operator).filter(Boolean))].sort();
  if (ops.length < 2) { box.innerHTML = ''; return; }

  const isAll = state.opFilter === null;
  const esc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : s);
  const chips = [
    `<button class="cp-chip" type="button" data-op="" aria-pressed="${isAll}">Alle</button>`,
    ...ops.map(op => `<button class="cp-chip" type="button" data-op="${esc(op)}" aria-pressed="${!isAll && state.opFilter === op}">${esc(op)}</button>`),
  ].join('');

  box.innerHTML = `<div class="cp-chips" style="flex-wrap:wrap;margin-bottom:8px">${chips}</div>`;
  box.querySelectorAll('.cp-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.op;
      state.opFilter = v === '' ? null : v;
      state.selectedStation = null;
      renderAll();
    });
  });
}

function renderStations() {
  const box = $('cpStations');
  if (!box) return;

  const esc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : s);
  const visible = (state.opFilter
    ? state.stations.filter(s => s.operator === state.opFilter)
    : state.stations
  ).slice(0, 5);

  if (!visible.length) {
    const msg = state.opFilter
      ? `Ingen stasjoner fra <strong>${esc(state.opFilter)}</strong> innenfor rekkevidden. Prøv «Alle».`
      : `Ingen ladestasjoner innenfor ${state.rangeKm} km minus 15 km reserve. Øk rekkevidden eller sjekk kartet manuelt.`;
    box.innerHTML = `<p class="cp-empty">${msg}</p>`;
    return;
  }

  box.innerHTML = visible.map(s => {
    const sel  = state.selectedStation && state.selectedStation.id === s.id;
    const fast = s.max_kw >= 100;
    return `
      <button class="cp-station" type="button" data-id="${s.id}" aria-pressed="${sel}">
        <span class="cp-st-main">
          <span class="cp-st-name">${esc(s.name)}</span>
          <span class="cp-st-meta">${esc(s.operator)} · ${s.connector_types.join(', ')}</span>
        </span>
        <span class="cp-kw ${fast ? 'cp-kw--fast' : ''}">${s.max_kw} kW</span>
        <span class="cp-st-dist">${s.distanceKm.toFixed(1)} km
          <small>${fmtDur(driveMinutes(s.distanceKm))}</small></span>
      </button>`;
  }).join('');

  box.querySelectorAll('.cp-station').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedStation = state.stations.find(s => s.id === btn.dataset.id);
      renderAll();
    });
  });
}

function renderChips() {
  const chipsEl = $('cpChips');
  const gainEl  = $('cpGain');
  if (!chipsEl) return;
  chipsEl.innerHTML = TIME_OPTIONS.map(m => `
    <button class="cp-chip" type="button" data-min="${m}"
            aria-pressed="${state.chargeMinutes === m}">${m} min</button>`).join('');

  chipsEl.querySelectorAll('.cp-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.chargeMinutes = +btn.dataset.min;
      renderAll();
    });
  });

  const st = state.selectedStation;
  if (gainEl) {
    gainEl.innerHTML = st
      ? `Gir omtrent <b>${rangeGainedKm(st.max_kw, state.chargeMinutes)} km</b> ved
         ${Math.min(st.max_kw, CP.car.maxChargeKw)} kW.`
      : '';
  }
}

function renderTimeline(plan) {
  const tl = $('cpTimeline');
  if (!tl) return;
  const rows = [
    ['Nå',                      `Kjør til ${plan.toStationMin < 2 ? 'laderen' : state.selectedStation.name}`, fmtDur(plan.toStationMin), plan.now],
    [hhmm(plan.arriveStation),  'Start lading',               fmtDur(state.chargeMinutes), plan.arriveStation],
    [hhmm(plan.chargeDone),     'Ferdig ladet, kjør videre',  fmtDur(plan.onwardMin),      plan.chargeDone],
  ];
  let html = rows.map(([t, what, dur]) => `
    <div class="cp-tl-row cp-tl-row--now">
      <span class="cp-tl-time">${t}</span>
      <span class="cp-tl-what">${what}</span>
      <span class="cp-tl-dur">${dur}</span>
    </div>`).join('');

  if (plan.next) {
    const late = plan.conflict;
    html += `
      <div class="cp-tl-row ${late ? 'cp-tl-row--clash' : ''}">
        <span class="cp-tl-time">${hhmm(plan.arriveNext)}</span>
        <span class="cp-tl-what">Framme hos ${plan.next.customer}</span>
        <span class="cp-tl-dur">${late
          ? `${plan.overlapMin} min for sent`
          : `avtalt ${hhmm(plan.next.start)}`}</span>
      </div>`;
  }
  tl.innerHTML = html;
}

function renderVerdict(plan) {
  const box = $('cpVerdict');
  if (!box) return;

  if (!plan.next) {
    box.innerHTML = `<div class="cp-banner cp-banner--ok"><i>✓</i>
      <span>Ingen flere avtaler i dag. Lad så lenge du vil.</span></div>`;
    return;
  }
  if (!plan.conflict) {
    const slack = diffMin(plan.next.start, plan.arriveNext);
    box.innerHTML = `<div class="cp-banner cp-banner--ok"><i>✓</i>
      <span>Du rekker <b>${plan.next.customer}</b> kl. ${hhmm(plan.next.start)}
      med ${slack} min til overs.</span></div>`;
    return;
  }

  const c = consequences(plan);
  const n = plan.next;

  box.innerHTML = `
    <div class="cp-banner cp-banner--warn"><i>!</i>
      <span><b>${plan.overlapMin} minutter for lite tid.</b><br>
      Du er framme hos ${n.customer} kl. ${hhmm(plan.arriveNext)},
      men avtalen er kl. ${hhmm(n.start)}.</span></div>

    <div class="cp-options" id="cpOptions">
      <button class="cp-opt" type="button" data-act="shift">
        <span class="cp-opt-ico" aria-hidden="true">→</span>
        <span class="cp-opt-body">
          <span class="cp-opt-ttl">Skyv alle avtaler ${plan.overlapMin} min</span>
          <span class="cp-opt-desc">
            ${c.shift.count} ${c.shift.count === 1 ? 'avtale flyttes' : 'avtaler flyttes'}.
            Dagen slutter <s>${hhmm(c.shift.lastEnd)}</s> ${hhmm(c.shift.shiftedLastEnd)}.
            ${c.shift.late ? `<br>Det er etter kl. ${CP.workdayEndHour}:00.` : ''}
          </span>
        </span>
      </button>

      <button class="cp-opt" type="button" data-act="shorten" ${c.shorten.tooShort ? 'disabled' : ''}>
        <span class="cp-opt-ico" aria-hidden="true">⊟</span>
        <span class="cp-opt-body">
          <span class="cp-opt-ttl">Kort ned ${n.customer}</span>
          <span class="cp-opt-desc">
            Besøket blir <s>${c.shorten.origDur} min</s> ${c.shorten.newDur} min,
            fra ${hhmm(plan.arriveNext)} til ${hhmm(n.end)}. Resten av dagen står.
            ${c.shorten.tooShort ? `<br>For kort til å være verdt turen.` : ''}
          </span>
        </span>
      </button>

      <button class="cp-opt cp-opt--danger" type="button" data-act="remove">
        <span class="cp-opt-ico" aria-hidden="true">✕</span>
        <span class="cp-opt-body">
          <span class="cp-opt-ttl">Slett ${n.customer}</span>
          <span class="cp-opt-desc">
            Besøket fjernes fra dagen.
            ${c.remove.after
              ? (c.remove.afterAlsoClashes
                  ? `Du rekker heller ikke ${c.remove.after.customer} etterpå.`
                  : `Neste stopp blir ${c.remove.after.customer} kl. ${hhmm(c.remove.after.start)}.`)
              : 'Det er dagens siste avtale.'}
          </span>
        </span>
      </button>
    </div>`;

  box.querySelectorAll('.cp-opt').forEach(btn => {
    btn.addEventListener('click', () => resolve(btn.dataset.act, plan));
  });
}

function renderActions(plan) {
  const actEl = $('cpActions');
  if (!actEl) return;
  const blocked = plan.conflict;
  actEl.innerHTML = `
    <button class="cp-btn" id="cpNav" ${blocked ? 'disabled' : ''}>
      Naviger til ${state.selectedStation.name}</button>
    <button class="cp-btn cp-btn--ghost" id="cpCancel">Avbryt</button>`;

  const nav = $('cpNav');
  if (nav && !blocked) {
    nav.addEventListener('click', () => {
      CP.openNavigation(state.selectedStation);
      CP.toast(`Ladestopp: ${state.chargeMinutes} min på ${state.selectedStation.name}.`);
    });
  }
  $('cpCancel').addEventListener('click', () => {
    const r = $('cpResult');
    if (r) r.classList.add('cp-hidden');
    state.selectedStation = null;
  });
}

function renderAll() {
  renderOpFilter();
  renderStations();
  if (!state.selectedStation) return;
  renderChips();
  const plan = buildPlan();
  state.plan = plan;
  renderTimeline(plan);
  renderVerdict(plan);
  renderActions(plan);
}

/* ================================================================
   HANDTER VALT LØYSING
   ================================================================ */
async function resolve(action, plan) {
  const n = plan.next;

  if (action === 'shift') {
    for (const e of plan.upcoming) {
      const patch = { start: addMin(e.start, plan.overlapMin), end: addMin(e.end, plan.overlapMin) };
      await CP.updateEvent(e.id, patch);
      e.start = patch.start; e.end = patch.end;
    }
    CP.toast(`${plan.upcoming.length} avtaler flyttet ${plan.overlapMin} minutter.`);
  }

  if (action === 'shorten') {
    const patch = { start: plan.arriveNext, end: n.end };
    await CP.updateEvent(n.id, patch);
    n.start = patch.start;
    CP.toast(`${n.customer} kortet ned til ${diffMin(n.end, n.start)} minutter.`);
  }

  if (action === 'remove') {
    await CP.deleteEvent(n.id);
    state.events = state.events.filter(e => e.id !== n.id);
    CP.toast(`${n.customer} er fjernet fra dagen.`);
  }

  renderAll();
}

/* ================================================================
   OPPSTART — event-lyttarar
   ================================================================ */
const findBtn  = $('cpFind');
const rangeInp = $('cpRange');
if (!findBtn || !rangeInp) return; // element ikkje i DOM enda

findBtn.addEventListener('click', async () => {
  const val = +rangeInp.value;
  if (!val || val <= 0) { CP.toast('Skriv inn hvor mange km du har igjen.'); return; }
  state.rangeKm = val;

  // Sync rekkevidde tilbake til same datakjelde som ev-range-widget
  if (typeof _saveEvRange === 'function') _saveEvRange(String(val));

  findBtn.disabled = true;
  findBtn.textContent = 'Søker…';

  try {
    const [origin, stations, events] = await Promise.all([
      CP.getPosition(), CP.getStations(), CP.getTodaysEvents(),
    ]);
    state.origin = origin;
    state.events = events.slice().sort((a, b) => a.start - b.start);

    const usable = Math.max(0, state.rangeKm - CP.reserveKm);
    state.opFilter = null; // tilbakestill leverandørfilter ved nytt søk
    state.stations = stations
      .map(s => ({ ...s, distanceKm: distanceKm(origin, s) }))
      .filter(s => s.distanceKm <= usable)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 15); // hent fleire for å gi filtervalg mening

    state.selectedStation = state.stations[0] || null;
    const r = $('cpResult');
    if (r) r.classList.remove('cp-hidden');
    renderAll();
  } finally {
    findBtn.disabled = false;
    findBtn.textContent = 'Finn ladestasjon';
  }
});

rangeInp.addEventListener('keydown', e => { if (e.key === 'Enter') findBtn.click(); });

})();
