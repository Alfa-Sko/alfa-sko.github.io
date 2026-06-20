// SJEFSMODUS — lese-innsyn i selgernes planer, aktivitet og kalender
// Krever profiles-tabell i Supabase med role='sjef' + lese-policy.
// ═══════════════════════════════════════════════════════════════════════════

async function sbLoadMyProfile(){
  try{
    const s = _sbSession();
    if(!s){ window._profDiag = 'ingen sesjon'; return null; }
    const r = await sbFetch('/rest/v1/profiles?select=*&user_id=eq.'+s.user.id, {method:'GET'});
    if(!r.ok){
      let body=''; try{ body = (await r.text()).slice(0,160); }catch(e){}
      window._profDiag = 'HTTP '+r.status+(body?' — '+body:'');
      return null;
    }
    const rows = await r.json();
    if(rows.length===0){
      window._profDiag = 'HTTP 200, men 0 rader — RLS-policy blokkerer trolig lesing, eller user_id matcher ikke (min id: '+s.user.id.slice(0,8)+'…)';
    } else {
      window._profDiag = 'OK';
    }
    window._myProfile = rows[0]||null;
    try{
      if(window._myProfile) localStorage.setItem('sb_role', window._myProfile.role||'');
    }catch(e){}
    return window._myProfile;
  }catch(e){ window._profDiag = 'nettverksfeil: '+(e.message||e); return null; }
}

// ── Lederdashbord: teamoversikt som hjemskjerm for sjef/CEO ──
async function renderLeaderDashboard(){
  const host = document.getElementById('sec-oversikt');
  if(!host || !window._teamProfiles) return;
  const td = window._teamData||{};
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toISOString().slice(0,10);
  const d30 = new Date(today.getTime()-30*864e5).toISOString().slice(0,10);
  const d7f = new Date(today.getTime()+7*864e5).toISOString().slice(0,10);
  let cards='';
  window._teamProfiles.forEach(p=>{
    const data = td[p.user_id]||{};
    const vis = data['alfa_visits']||[];
    const evs = data['alfa_events']||{};
    const fol = data['alfa_followups']||[];
    const vis30 = vis.filter(v=>v.date>=d30 && v.date<=todayStr).length;
    let planned7=0, nextVisit=null;
    Object.keys(evs).sort().forEach(k=>{
      (evs[k]||[]).forEach(e=>{
        if(e.type!=='visit') return;
        if(k>=todayStr && k<=d7f) planned7++;
        if(k>=todayStr && !nextVisit) nextVisit={date:k,label:e.label};
      });
    });
    const openFol = fol.filter(f=>!f.done).length;
    const unbooked = (()=>{ let n=0; Object.keys(evs).forEach(k=>{(evs[k]||[]).forEach(e=>{ if((e.type==='flight'||e.type==='hotel'||e.type==='rental')&&e.booked===false&&k>=todayStr) n++; });}); return n; })();
    const tag = p.role==='kam' ? ' <span style="background:#0C447C;color:#fff;font-size:9px;padding:1px 7px;border-radius:9px;font-weight:700">KAM</span>' : '';
    const hasData = Object.keys(data).length>0;
    const uidq = "'"+p.user_id+"','"+escapeHtml(p.full_name).replace(/'/g,"\\'")+"'";
    cards += '<div class="card" style="margin-bottom:12px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+
        '<div><div style="font-weight:700;font-size:15px;color:#2C2C2A">'+escapeHtml(p.full_name)+tag+'</div>'+
        '<div style="font-size:11px;color:#888780">'+escapeHtml(p.district||'')+'</div></div>'+
      '</div>'+
      (hasData ?
      '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">'+
        '<div><div style="font-size:20px;font-weight:800;color:#2C2C2A">'+vis30+'</div><div style="font-size:10px;color:#888780">besøk siste 30 dg</div></div>'+
        '<div><div style="font-size:20px;font-weight:800;color:#2C2C2A">'+planned7+'</div><div style="font-size:10px;color:#888780">planlagt neste 7 dg</div></div>'+
        '<div><div style="font-size:20px;font-weight:800;color:'+(openFol>0?'#6D4C00':'#2C2C2A')+'">'+openFol+'</div><div style="font-size:10px;color:#888780">åpne oppfølginger</div></div>'+
        (unbooked>0?'<div><div style="font-size:20px;font-weight:800;color:#A23B27">'+unbooked+'</div><div style="font-size:10px;color:#888780">ubestilte reiser</div></div>':'')+
      '</div>'+
      (nextVisit?'<div style="font-size:12px;color:#5F5E5A;margin-bottom:10px">Neste besøk: <strong>'+escapeHtml(nextVisit.label||'')+'</strong> '+nextVisit.date.split('-').reverse().join('.')+'</div>':'<div style="font-size:12px;color:#888780;margin-bottom:10px">Ingen kommende besøk planlagt</div>')+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
        '<button class="btn btn-light btn-sm" onclick="leaderOpen('+uidq+',\'tidslinje\')">📜 Tidslinje</button>'+
        '<button class="btn btn-light btn-sm" onclick="leaderOpen('+uidq+',\'kalender\')">📅 Kalender</button>'+
        '<button class="btn btn-light btn-sm" onclick="leaderOpen('+uidq+',\'oppfolging\')">✓ Oppfølging</button>'+
        '<button class="btn btn-light btn-sm" onclick="leaderOpen('+uidq+',\'oversikt\')">📊 Dashbord</button>'+
      '</div>'
      : '<div style="font-size:12px;color:#888780">Ikke kommet i gang ennå — ingen synkede data.</div>')+
      '</div>';
  });
  host.innerHTML = '<div style="font-size:22px;font-weight:700;color:#2C2C2A;margin-bottom:4px">👔 Lederoversikt</div>'+
    '<div style="font-size:13px;color:#888780;margin-bottom:16px">Aktivitet og planer per selger. Trykk for å åpne tidslinje, kalender eller oppfølging — alt i lesemodus.</div>'+cards;
}

async function leaderOpen(uid, name, section){
  await managerViewUser(uid, name);
  const navItems = document.querySelectorAll('.nav-item');
  showSection(section, null);
}

async function _leaderLoadTeamData(){
  try{
    const r = await sbFetch('/rest/v1/user_data?select=user_id,key,value', {method:'GET'});
    if(!r.ok) return;
    const rows = await r.json();
    const td = {};
    const myId = ((_sbSession()||{}).user||{}).id;
    rows.forEach(row=>{
      if(row.user_id===myId) return; // lederens egne (tomme) data
      td[row.user_id] = td[row.user_id]||{};
      td[row.user_id][row.key] = row.value;
    });
    window._teamData = td;
  }catch(e){}
}

// Ledere skal ALDRI ha egne feltdata. Rydder lokal lagring, minnet og
// eventuelle forurensede rader på lederens egen konto i skyen (selvhelende
// etter synk-feilen som kopierte selgerdata inn til ledere før v-8).
async function _leaderSanitize(){
  try{
    _sbWipeLocalAlfa();
    calEvents = {};
    visits = [];
    followups = [];
    freeNotes = [];
    if(typeof personalDays!=='undefined') personalDays = [];
    CUSTOMERS = [];
    userProfile = Object.assign({}, DEFAULT_USER_PROFILE);
    try{ if(typeof loadProfileIntoForm==='function') loadProfileIntoForm(); }catch(e){}
    window._lastPlan = null;
    // Slett egne sky-rader (RLS tillater kun egne — selgernes data berøres ikke)
    const uid = ((_sbSession()||{}).user||{}).id;
    if(uid) sbFetch('/rest/v1/user_data?user_id=eq.'+uid, {method:'DELETE'}).catch(()=>{});
  }catch(e){}
}

async function managerInit(){
  await _leaderSanitize();
  // Hent alle profiler og bygg verktøylinjen
  try{
    const r = await sbFetch('/rest/v1/profiles?select=*&order=full_name', {method:'GET'});
    if(!r.ok) return;
    const profs = await r.json();
    const sellers = profs.filter(p=>p.role!=='sjef' && p.role!=='ceo');
    if(sellers.length===0) return;
    window._teamProfiles = sellers;
    window._leaderHome = true;
    await _leaderLoadTeamData();
    _demoRerender();
    renderLeaderDashboard();
    let bar = document.getElementById('mgr-bar');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'mgr-bar';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:1900;background:#0C447C;color:#fff;font-size:12px;font-weight:600;padding:7px 12px;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap';
      document.body.appendChild(bar);
      document.body.style.paddingTop = '40px';
    }
    let opts = '<option value="">— velg selger —</option>';
    sellers.forEach(p=>{ const tag = p.role==='kam' ? ' · KAM' : ''; opts += '<option value="'+p.user_id+'|'+escapeHtml(p.full_name)+'">'+escapeHtml(p.full_name)+tag+(p.district?' ('+escapeHtml(p.district)+')':'')+'</option>'; });
    bar.innerHTML = '👔 Sjefsvisning · Se som: <select id="mgr-select" style="padding:4px 8px;border-radius:6px;border:none;font-size:12px">'+opts+'</select> '+
      '<button onclick="managerViewSelected()" style="background:#fff;color:#0C447C;border:none;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer">Vis</button>'+
      '<span id="mgr-current" style="display:none;background:#FFF6E6;color:#6D4C00;border-radius:10px;padding:2px 10px;font-size:11px"></span>'+
      '<button id="mgr-back" onclick="managerBack()" style="display:none;background:#FFF6E6;color:#6D4C00;border:none;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer">↩ Mine data</button>';
  }catch(e){}
}

function managerViewSelected(){
  const sel = document.getElementById('mgr-select');
  if(!sel || !sel.value) return;
  const [uid, name] = sel.value.split('|');
  managerViewUser(uid, name);
}

async function managerViewUser(uid, name){
  try{
    const r = await sbFetch('/rest/v1/user_data?select=key,value&user_id=eq.'+uid, {method:'GET'});
    if(!r.ok){ showToast('Fikk ikke hentet data — sjekk sjef-tilgangen i Supabase'); return; }
    const rows = await r.json();
    if(rows.length===0){ showToast(name+' har ingen synkede data ennå'); return; }
    // Ta vare på egne data første gang
    if(!window._mgrBackup){
      window._mgrBackup = {customers:getCustomers(), calEvents:calEvents, visits:visits, followups:followups, profile:userProfile};
    }
    const byKey = {};
    rows.forEach(row=>{ byKey[row.key] = row.value; });
    if(byKey['alfa_customers']) CUSTOMERS = byKey['alfa_customers'];
    calEvents = byKey['alfa_events']||{};
    visits = byKey['alfa_visits']||[];
    followups = byKey['alfa_followups']||[];
    if(byKey['alfa_user_profile']) userProfile = Object.assign({}, DEFAULT_USER_PROFILE, byKey['alfa_user_profile']);
    if(byKey['alfa_free_notes']) freeNotes = byKey['alfa_free_notes'];
    if(byKey['alfa_personal_days'] && typeof personalDays!=='undefined') personalDays = byKey['alfa_personal_days'];
    window._viewOnlyMode = true;
    const cur = document.getElementById('mgr-current');
    const back = document.getElementById('mgr-back');
    if(cur){ cur.textContent = '👁 Ser på: '+name+' (kun lesing)'; cur.style.display='inline-block'; }
    if(back) back.style.display='inline-block';
    _demoRerender();
    showToast('Viser '+name+' sine data — endringer er deaktivert');
  }catch(e){ showToast('Feil ved henting: '+(e.message||e)); }
}

function managerBack(){
  const b = window._mgrBackup;
  if(!b) return;
  CUSTOMERS = b.customers; calEvents = b.calEvents; visits = b.visits; followups = b.followups; userProfile = b.profile;
  window._mgrBackup = null;
  window._viewOnlyMode = false;
  const cur = document.getElementById('mgr-current');
  const back = document.getElementById('mgr-back');
  if(cur) cur.style.display='none';
  if(back) back.style.display='none';
  _demoRerender();
  if(window._leaderHome){ showSection('oversikt', null); renderLeaderDashboard(); showToast('Tilbake til lederoversikten'); }
  else showToast('Tilbake til dine egne data');
}

// ─── DEMOMODUS (anonymiserte data for demo/presentasjon) ────────────────────
// Sesjonsbasert og IKKE-destruktivt: originaldata bevares i minnet, ingenting
// lagres til localStorage mens demo er på (saveData er blokkert), og alt
// gjenopprettes ved avslutning eller sideoppdatering.

const DEMO_BASE_NAMES = ['Fjellsport','Nordlys Sport','Polar Sport','Vidde Sport','Topptur Sport',
  'Skredfri Sport','Midnattsol Sport','Vinterli Sport','Tindebua','Fjordsport',
  'Stisport','Lavvo Sport','Rype Sport','Multebær Sport','Brevandring Sport'];

function _demoName(i, c){
  const base = DEMO_BASE_NAMES[i % DEMO_BASE_NAMES.length];
  const suffix = Math.floor(i / DEMO_BASE_NAMES.length);
  return base + (suffix>0 ? ' '+(suffix+1) : '') + (c.city ? ' '+c.city : '') + ' AS';
}
function _demoFactor(i){ return 0.6 + ((i*37)%80)/100; }
function _demoRound(n){ return Math.round(n/1000)*1000; }

function toggleDemoMode(){
  if(window._DEMO_ACTIVE) return; // gjeste-demo: kan ikkje toggast av
  if(window._demoMode){ _demoOff(); } else { _demoOn(); }
}

function _demoOn(){
  // 1) Ta vare på originalene
  window._demoBackup = {
    customers: getCustomers(),
    calEvents: calEvents,
    visits: visits,
    followups: followups,
    profile: userProfile,
    sales: Object.assign({}, getCustomerSales()),
    homeBase: _plannerHomeBase,
  };
  // 2) Bygg navnemapping og anonymisert kundeliste
  const nameMap = {};
  const anonCustomers = getCustomers().map((c,i)=>{
    const newName = _demoName(i, c);
    nameMap[c.name] = newName;
    const f = _demoFactor(i);
    return Object.assign({}, c, {
      name: newName,
      l12: c.l12 ? _demoRound(c.l12*f) : 0,
      budget: c.budget ? _demoRound(c.budget*f) : 0,
      phone: c.phone ? '+47 900 00 0'+String(i%100).padStart(2,'0') : '',
      email: c.email ? 'post@demo'+(i+1)+'.no' : '',
      address: c.address ? (c.city||'Demoby') : '',
      note: c.note ? 'Demonotat — anonymisert' : '',
      contacts: (c.contacts||[]).map((k,j)=>({name:'Kontakt '+(j+1), role:k.role||'', phone:'+47 900 00 0'+String((i+j)%100).padStart(2,'0'), email:''})),
    });
  });
  window._demoNameMap = nameMap;
  // 3) Anonymiser kalender, besøk, oppfølginger (kopier)
  const mapName = n => nameMap[n] || n;
  const anonEvents = {};
  Object.keys(calEvents).forEach(k=>{
    anonEvents[k] = (calEvents[k]||[]).map(e=>{
      const ne = Object.assign({}, e);
      if(nameMap[ne.label]) ne.label = nameMap[ne.label];
      if(ne.type==='visit') ne.agenda = 'Planlagt besøk';
      return ne;
    });
  });
  const anonVisits = visits.map((v,i)=>Object.assign({}, v, {customer: mapName(v.customer), contact: v.contact?'Kontaktperson':'', notes: v.notes?'Demonotat fra besøk.':'', followup: v.followup?'Demo-oppfølging':''}));
  const anonFollow = followups.map((f,i)=>Object.assign({}, f, {customer: mapName(f.customer), task: 'Demo-oppgave '+(i+1)}));
  // 4) Anonymiser artikkelsalg (CUSTOMER_SALES er const — muteres på plass)
  const salesKeys = Object.keys(CUSTOMER_SALES);
  salesKeys.forEach((k,idx)=>{
    const arts = CUSTOMER_SALES[k];
    delete CUSTOMER_SALES[k];
    const f = _demoFactor(idx);
    CUSTOMER_SALES[mapName(k)] = (arts||[]).map(a=>Object.assign({}, a, {y2025: a.y2025?Math.round(a.y2025*f):0, y2026: a.y2026?Math.round(a.y2026*f):0}));
  });
  // 5) Anonymiser profil og hjemmebase
  userProfile = Object.assign({}, userProfile, {name:'Demo Selger', email:'demo@alfa.no', phone:'+47 900 00 000', homeAddress:'Storgata 1, 9008 Tromsø', homeCity:'Tromsø'});
  _plannerHomeBase = 'Storgata 1, 9008 Tromsø';
  const ph = document.getElementById('planner-home');
  if(ph) ph.value = _plannerHomeBase;
  // 6) Bytt inn anonymiserte data
  CUSTOMERS = anonCustomers;
  calEvents = anonEvents;
  visits = anonVisits;
  followups = anonFollow;
  window._lastPlan = null;
  const po = document.getElementById('planner-output');
  if(po) po.innerHTML = '';
  window._demoMode = true;
  _demoBanner(true);
  _demoRerender();
  showToast('🎭 Demomodus PÅ — alle kundedata er anonymisert. Ingenting lagres.');
}

function _demoOff(){
  const b = window._demoBackup;
  if(!b) return;
  CUSTOMERS = b.customers;
  calEvents = b.calEvents;
  visits = b.visits;
  followups = b.followups;
  userProfile = b.profile;
  _plannerHomeBase = b.homeBase;
  const ph = document.getElementById('planner-home');
  if(ph) ph.value = _plannerHomeBase;
  // Gjenopprett artikkelsalg
  Object.keys(CUSTOMER_SALES).forEach(k=>delete CUSTOMER_SALES[k]);
  Object.keys(b.sales).forEach(k=>{ CUSTOMER_SALES[k] = b.sales[k]; });
  window._demoMode = false;
  window._demoBackup = null;
  window._lastPlan = null;
  const po = document.getElementById('planner-output');
  if(po) po.innerHTML = '';
  _demoBanner(false);
  _demoRerender();
  showToast('Demomodus AV — ekte data gjenopprettet.');
}

function _demoBanner(on){
  let el = document.getElementById('demo-banner');
  if(on){
    if(!el){
      el = document.createElement('div');
      el.id = 'demo-banner';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2000;background:repeating-linear-gradient(45deg,#6D4C00,#6D4C00 14px,#8A6200 14px,#8A6200 28px);color:#fff;font-size:12px;font-weight:700;padding:7px 12px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px';
      el.innerHTML = '🎭 DEMOMODUS — anonymiserte kunder og tall. Ingenting lagres. <button onclick="toggleDemoMode()" style="background:#fff;color:#6D4C00;border:none;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;cursor:pointer">Avslutt demo</button>';
      document.body.appendChild(el);
      document.body.style.paddingTop = '34px';
    }
  } else {
    if(el) el.remove();
    document.body.style.paddingTop = '';
  }
  const btn = document.getElementById('demo-toggle-btn');
  if(btn) btn.textContent = on ? '🎭 Avslutt demomodus' : '🎭 Start demomodus';
}

function _demoRerender(){
  [
    ()=>{ if(typeof renderOverview==='function') renderOverview(); },
    ()=>{ if(typeof renderCustomers==='function') renderCustomers(); },
    ()=>{ if(typeof renderCal==='function') renderCal(); },
    ()=>{ if(typeof renderFollowups==='function') renderFollowups(); },
    ()=>{ if(typeof renderTimeline==='function') renderTimeline(); },
    ()=>{ if(typeof populateVisitCustomers==='function') populateVisitCustomers(); },
    ()=>{ if(typeof populateFollowCustomers==='function') populateFollowCustomers(); },
  ].forEach(fn=>{ try{ fn(); }catch(e){} });
}

// ─── OVERVIEW ───────────────────────────────────────────────────────────────

function renderDistrictDashboard(){
  const container = document.getElementById('district-dashboard');
  if(!container) return;
  const now = new Date();
  const year = now.getFullYear();
  // Hvor mange dager av året er gått (for å estimere YTD-andel)
  const startYear = new Date(year,0,1);
  const daysIntoYear = Math.floor((now-startYear)/(24*60*60*1000))+1;
  const yearProgress = daysIntoYear/365;

  // 1. Budsjettoppnåelse
  let totalBudget=0, totalY2026=0, totalY2025=0;
  getCustomers().forEach(c=>{
    totalBudget += (c.budget||0);
    const sales = getCustomerSales()[c.name];
    if(sales){
      sales.forEach(a=>{
        totalY2026 += a.y2026||0;
        totalY2025 += a.y2025||0;
      });
    }
  });
  const budgetPct = totalBudget>0 ? (totalY2026/totalBudget*100) : 0;
  const expectedPct = yearProgress*100;
  const budgetTrend = budgetPct >= expectedPct ? 'opp' : 'ned';

  // 2. A-kunder uten besøk siste 90 dager
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate()-90);
  const cutoffKey = cutoff.getFullYear()+'-'+String(cutoff.getMonth()+1).padStart(2,'0')+'-'+String(cutoff.getDate()).padStart(2,'0');
  function lastVisitDate(name){
    const vs = visits.filter(v=>v.customer===name);
    if(vs.length===0) return null;
    return vs.map(v=>v.date).sort().pop();
  }
  const aCustomers = getCustomers().filter(c=>c.class==='A');
  const aOverdue = aCustomers.filter(c=>{
    const last = lastVisitDate(c.name);
    return !last || last < cutoffKey;
  });

  // 3. Kunder med fallende omsetning (2026 ratejustert < 70% av 2025)
  // Sammenlign 2026 YTD vs 2025 YTD (samme periode)
  const fallingCustomers = getCustomers().filter(c=>{
    if(c.l12===0) return false;
    const sales = getCustomerSales()[c.name];
    if(!sales || sales.length===0) return false;
    let s25=0, s26=0;
    sales.forEach(a=>{ s25+=a.y2025||0; s26+=a.y2026||0; });
    if(s25<10000) return false; // for små til å være meningsfullt
    // Ratejustert: 2026 YTD bør være ≥ 2025 × yearProgress
    const expected26 = s25 * yearProgress;
    return s26 < expected26 * 0.7;
  });
  fallingCustomers.sort((a,b)=>(b.l12||0)-(a.l12||0));

  // 4. Nye relasjoner uten besøk
  const newWithoutVisit = getCustomers().filter(c=>c.priority==='Ny relasjon' && !lastVisitDate(c.name));

  // 5. Forfalte oppfølginger
  const overdueFollowups = (followups||[]).filter(f=>!f.done && f.due < TODAY_STR);

  // 6. Planlagt aktivitet neste 30 dager
  const future = new Date(now);
  future.setDate(future.getDate()+30);
  let plannedNext30 = 0;
  Object.keys(calEvents||{}).forEach(key=>{
    if(key >= TODAY_STR && key <= future.getFullYear()+'-'+String(future.getMonth()+1).padStart(2,'0')+'-'+String(future.getDate()).padStart(2,'0')){
      plannedNext30 += (calEvents[key]||[]).filter(e=>e.type==='visit').length;
    }
  });

  // Bygg kortene
  function card(opts){
    const {icon, label, value, sub, color, action, tooltip} = opts;
    return '<div class="dash-card" '+(action?'onclick="'+action+'" style="cursor:pointer"':'')+' title="'+escapeHtml(tooltip||'')+'">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">'+icon+'</span><span style="font-size:11px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">'+label+'</span></div>'+
      '<div style="font-size:22px;font-weight:700;color:'+(color||'#2C2C2A')+';line-height:1.1">'+value+'</div>'+
      (sub?'<div style="font-size:11px;color:#888780;margin-top:4px">'+sub+'</div>':'')+
      '</div>';
  }

  function nokCompact(n){
    if(n>=1000000) return (n/1000000).toFixed(1)+' mill';
    if(n>=1000) return Math.round(n/1000)+'k';
    return Math.round(n);
  }

  const html = `
    <div class="card" style="margin-bottom:14px;background:linear-gradient(135deg,#F8F7F3 0%,#FAFAF7 100%);border:1px solid #D3D1C7">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div style="font-size:14px;font-weight:700;color:#2C2C2A">📊 Distrikts-helsesjekk</div>
        <div style="font-size:11px;color:#888780">${year} · uke ${Math.ceil(daysIntoYear/7)}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        ${card({
          icon:'🎯',
          label:'Budsjett ' + year,
          value: budgetPct.toFixed(0)+'%',
          sub: nokCompact(totalY2026)+' kr av ' + nokCompact(totalBudget) + ' kr · forventet ' + expectedPct.toFixed(0) + '%',
          color: budgetTrend==='opp' ? '#1A7A4E' : '#A23B27',
          tooltip:'Sum 2026-omsetning vs sum budsjett. Forventet andel basert på årsprogresjon.'
        })}
        ${card({
          icon:'🔴',
          label:'A-kunder forfalt',
          value: aOverdue.length + ' / ' + aCustomers.length,
          sub: aOverdue.length>0 ? 'Ikke besøkt 90+ dager' : 'Alle besøkt nylig ✓',
          color: aOverdue.length>0 ? '#A23B27' : '#1A7A4E',
          action:"openOverdueAList()",
          tooltip:'A-kunder som ikke har vært besøkt på 90 dager. Klikk for liste.'
        })}
        ${card({
          icon:'📉',
          label:'Fallende kunder',
          value: fallingCustomers.length,
          sub: fallingCustomers.length>0 ? 'Omsetning < 70% av forventet' : 'Ingen vesentlige fall',
          color: fallingCustomers.length>0 ? '#A23B27' : '#1A7A4E',
          action:"openFallingList()",
          tooltip:'Kunder hvor 2026 YTD er mindre enn 70% av ratejustert 2025-nivå.'
        })}
        ${card({
          icon:'🌱',
          label:'Nye relasjoner',
          value: newWithoutVisit.length,
          sub: newWithoutVisit.length>0 ? 'Uten første besøk' : 'Alle introdusert ✓',
          color: newWithoutVisit.length>0 ? '#BA7517' : '#1A7A4E',
          action:"openNewList()",
          tooltip:'Kunder merket som ny relasjon som ennå ikke er besøkt.'
        })}
        ${card({
          icon:'⏰',
          label:'Forfalt oppfølging',
          value: overdueFollowups.length,
          sub: overdueFollowups.length>0 ? 'Krever handling' : 'Alt under kontroll ✓',
          color: overdueFollowups.length>0 ? '#A23B27' : '#1A7A4E',
          action:"showSection('oppfolging',document.querySelector('.nav-item:nth-child(7)'))",
          tooltip:'Oppfølginger med forfallsdato før i dag.'
        })}
        ${card({
          icon:'📅',
          label:'Plan neste 30 dager',
          value: plannedNext30,
          sub: plannedNext30>0 ? 'planlagte besøk' : 'Ingen besøk i kalenderen',
          color: '#0C447C',
          action:"showSection('kalender',document.querySelector('.nav-item:nth-child(3)'))",
          tooltip:'Antall besøk lagt inn i kalenderen de neste 30 dagene.'
        })}
      </div>
    </div>
  `;
  container.innerHTML = html;
  // Lagre lister for klikk
  window._dashOverdueA = aOverdue;
  window._dashFalling = fallingCustomers;
  window._dashNew = newWithoutVisit;
}

function openOverdueAList(){
  showCustomerListModal('A-kunder forfalt (90+ dager uten besøk)', window._dashOverdueA||[]);
}
function openFallingList(){
  showCustomerListModal('Kunder med fallende omsetning', window._dashFalling||[]);
}
function openNewList(){
  showCustomerListModal('Nye relasjoner uten besøk', window._dashNew||[]);
}


function renderOverview(){
  if(window._leaderHome && !window._mgrBackup){ renderLeaderDashboard(); return; }
  renderDistrictDashboard();
  const _days=['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
  const _months=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
  const _now=new Date();
  document.getElementById('today-label').textContent = _days[_now.getDay()]+' '+_now.getDate()+'. '+_months[_now.getMonth()]+' '+_now.getFullYear();
  const todayVisits = visits.filter(v=>v.date===TODAY_STR);
  const overdue = followups.filter(f=>!f.done && f.due<TODAY_STR);

  document.getElementById('overview-metrics').innerHTML =
    metric(todayVisits.length,'Besøk i dag','planlagt') +
    metric(followups.filter(f=>!f.done).length,'Åpen oppfølging', overdue.length+' forfalt') +
    metric('250 km','Kjøring i dag','estimert');

  const tv = document.getElementById('today-visits');
  if(todayVisits.length===0){
    tv.innerHTML='<div class="empty-state">Ingen besøk registrert for i dag</div>';
  } else {
    tv.innerHTML = todayVisits.map(v=>{
      const c = getCustomers().find(c=>c.name===v.customer)||{class:''};
      const bCls = c.class==='A'?'badge-a':c.class==='B'?'badge-b':c.class==='C'?'badge-c':'badge-new';
      const bLbl = c.class==='A'?'A-kunde':c.class==='B'?'B-kunde':c.class==='C'?'C-kunde':'Ny';
      const safeName = v.customer.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `<div class="visit-row" onclick="openCustomer('${safeName}')">
        <div class="avatar">${v.customer.slice(0,2).toUpperCase()}</div>
        <div class="vinfo"><div class="vname">${v.customer}</div><div class="vmeta">${v.time||''}${v.timeEnd?' – '+v.timeEnd:''} · ${v.contact||''}</div></div>
        <span class="badge ${bCls}">${bLbl}</span>
      </div>`;
    }).join('');
  }

  const of = document.getElementById('overdue-follow');
  if(overdue.length===0){
    of.innerHTML='<div class="empty-state" style="padding:16px">Ingen forfalt oppfølging &#10003;</div>';
  } else {
    of.innerHTML = overdue.map(f=>followItem(f)).join('');
  }
}

function metric(val,lbl,sub){
  return `<div class="metric"><div class="metric-val">${val}</div><div class="metric-lbl">${lbl}</div><div class="metric-sub">${sub}</div></div>`;
}

