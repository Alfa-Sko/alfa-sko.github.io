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
    if(typeof custPhotos!=='undefined') custPhotos = [];
    if(typeof constellations!=='undefined') constellations = [];
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
    if(byKey['alfa_cust_photos'] && typeof custPhotos!=='undefined') custPhotos = byKey['alfa_cust_photos'];
    if(byKey['alfa_cust_constellations'] && typeof constellations!=='undefined') constellations = byKey['alfa_cust_constellations'];
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

// ─── DISTRIKTS-HELSESJEKK ────────────────────────────────────────────────────
// Helsesignaler basert BERRE på appens eigne data (aktivitetar, oppfølgingar,
// kalender, kontaktpersonar). Ingen omsetning/L12 — sjå feature-flag under.
//
// HEALTH_TURNOVER_ENABLED: sett til true når salgstall-import er på plass.
// Reaktiverer: budsjettoppnåing, fallande omsetning, L12-basert vekting.
const HEALTH_TURNOVER_ENABLED = false;

function renderDistrictDashboard(){
  const container = document.getElementById('district-dashboard');
  if(!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const daysIntoYear = Math.floor((now-new Date(year,0,1))/864e5)+1;
  const weekNum = Math.ceil(daysIntoYear/7);

  // Datostrengar
  function dStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function daysAgo(n){ const d=new Date(now); d.setDate(d.getDate()-n); return dStr(d); }
  function daysAhead(n){ const d=new Date(now); d.setDate(d.getDate()+n); return dStr(d); }

  const today=TODAY_STR;
  const d90=daysAgo(90), d45=daysAgo(45), d30=daysAgo(30);
  const monthStart=year+'-'+String(now.getMonth()+1).padStart(2,'0')+'-01';
  const next30=daysAhead(30);

  const customers=getCustomers();

  // ── Per-kunde hjelparar ──────────────────────────────────────────────────
  function custVisitDates(name){ return (visits||[]).filter(v=>v.customer===name).map(v=>v.date); }

  // Signal 1: Forfalte oppfølgingar — kjelde: oppfølgings-data. Vekt: ×3 (tyngst)
  const overdueByCustomer={};
  (followups||[]).filter(f=>!f.done&&f.due<today).forEach(f=>{
    if(f.customer) overdueByCustomer[f.customer]=(overdueByCustomer[f.customer]||0)+1;
  });
  const totalOverdue=Object.values(overdueByCustomer).reduce((s,n)=>s+n,0);

  // Signal 2: Aktivitetstrend siste 90 dg — kjelde: besøkshistorikk
  // p1 = siste 45 dg, p0 = 45–90 dg sidan. null = ukjent (ingen data i begge periodar)
  function actTrend(name){
    const dates=custVisitDates(name);
    const p0=dates.filter(d=>d>=d90&&d<d45).length;
    const p1=dates.filter(d=>d>=d45&&d<=today).length;
    if(p0===0&&p1===0) return null;
    return p1>p0?'up':p1<p0?'down':'flat';
  }

  // Signal 3: Har kontaktpersonar — kjelde: kundekort
  // Proxy for relasjonsbygging; tidspunkt for registrering lagras ikkje enno.
  function hasContacts(c){ return !!(c.contacts&&c.contacts.length); }

  // Score per kunde: lågt = dårleg helse. null = ukjent (ingen datagrunnlag)
  function scoreCustomer(c){
    let score=0, signals=0;
    // Overdue oppfølgingar (vekt ×3)
    const od=overdueByCustomer[c.name]||0;
    if(od>0){ score-=od*3; signals++; }
    else if((followups||[]).some(f=>f.customer===c.name)){ signals++; } // har oppfølgingar, ingen forfalt
    // Aktivitetstrend
    const t=actTrend(c.name);
    if(t!==null){ signals++; if(t==='down') score-=2; else if(t==='up') score+=1; }
    // Kontaktpersonar
    if(hasContacts(c)){ score+=1; signals++; }
    return signals>0?score:null;
  }

  const custData=customers.map(c=>({c,score:scoreCustomer(c),trend:actTrend(c.name),od:overdueByCustomer[c.name]||0}));
  const ranked=custData.filter(x=>x.score!==null).sort((a,b)=>a.score-b.score);
  const unknownCount=custData.filter(x=>x.score===null).length;

  // Distrikt-aggregatar
  let tUp=0,tDown=0,tFlat=0;
  customers.forEach(c=>{ const t=actTrend(c.name); if(t==='up')tUp++;else if(t==='down')tDown++;else if(t==='flat')tFlat++; });
  const withContacts=customers.filter(c=>hasContacts(c)).length;

  // ── Innsatsrad: km og besøk (ikkje del av score) ─────────────────────────
  let kmMonth=0,kmLast30=0;
  Object.keys(calEvents||{}).forEach(key=>{
    (calEvents[key]||[]).forEach(e=>{
      if((e.type==='drive'||e.type==='drive-auto')&&e.dist){
        const d=parseFloat(e.dist)||0;
        if(key>=monthStart&&key<=today) kmMonth+=d;
        if(key>=d30&&key<=today) kmLast30+=d;
      }
    });
  });
  const visMonth=(visits||[]).filter(v=>v.date>=monthStart&&v.date<=today).length;
  const visLast30=(visits||[]).filter(v=>v.date>=d30&&v.date<=today).length;
  let planned30=0;
  Object.keys(calEvents||{}).forEach(key=>{
    if(key>=today&&key<=next30) planned30+=(calEvents[key]||[]).filter(e=>e.type==='visit').length;
  });

  // ── HTML-hjelpefunksjonar ────────────────────────────────────────────────
  function srcTag(lbl){
    return '<span style="font-size:9px;color:#888780;background:#F1EFE8;border:1px solid #D3D1C7;border-radius:4px;padding:1px 5px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">'+escapeHtml(lbl)+'</span>';
  }

  function sigCard(icon,label,value,sub,color,tooltip,source,action){
    return '<div class="dash-card"'+(action?' onclick="'+action+'" style="cursor:pointer"':'')+' title="'+escapeHtml(tooltip||'')+'">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:4px;margin-bottom:5px">'
      +'<div style="display:flex;align-items:center;gap:5px"><span style="font-size:15px">'+icon+'</span>'
      +'<span style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;line-height:1.2">'+label+'</span></div>'
      +srcTag(source)+'</div>'
      +'<div style="font-size:22px;font-weight:700;color:'+(color||'#2C2C2A')+';line-height:1.1">'+value+'</div>'
      +(sub?'<div style="font-size:11px;color:#888780;margin-top:3px">'+sub+'</div>':'')
      +'</div>';
  }

  // Trendstreng for aktivitetssignalet
  const trendDown=tDown>0, trendVal=tDown>0?tDown+' ↓':tUp>0?tUp+' ↑':tFlat>0?tFlat+' →':'—';
  const trendSub=tDown>0?tDown+' med fallande aktivitet':tUp>0?tUp+' med stigande aktivitet':'Stabil trend';
  const trendColor=tDown>0?'#A23B27':tUp>0?'#1A7A4E':'#888780';

  // Verste kunder (topp 5 med score < 0)
  const worst=ranked.filter(x=>x.score<0).slice(0,5);
  function healthDot(score){ return score>=0?'<span style="color:#1A7A4E;font-size:10px">●</span>':score>=-2?'<span style="color:#BA7517;font-size:10px">●</span>':'<span style="color:#A23B27;font-size:10px">●</span>'; }

  const worstRows=worst.length===0
    ?'<div style="color:#1A7A4E;font-size:12px;padding:8px 0">✓ Ingen kunder med store helseutfordringar</div>'
    :worst.map(function(x){
      const c=x.c;
      const safe=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const issues=[];
      if(x.od>0) issues.push(x.od+(x.od===1?' forfalt':' forfalt'));
      if(x.trend==='down') issues.push('aktivitet↓');
      if(!hasContacts(c)) issues.push('ingen kontakt');
      return '<div onclick="openCustomer(\''+safe+'\')" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F1EFE8;cursor:pointer">'
        +healthDot(x.score)
        +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:12px;font-weight:700;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(c.name)+'</div>'
        +'<div style="font-size:11px;color:#888780">'+escapeHtml(issues.join(' · '))+'</div>'
        +'</div>'
        +(c.class?'<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;background:'+(c.class==='A'?'#FBE6E6':c.class==='B'?'#FFF6E6':'#F1EFE8')+';color:'+(c.class==='A'?'#A23B27':c.class==='B'?'#6D4C00':'#5F5E5A')+'">'+c.class+'</span>':'')
        +'</div>';
    }).join('');

  // Omsetningssignalar er parkert — reaktiver HEALTH_TURNOVER_ENABLED når salgstall-import er klar
  let turnoverCards='';
  if(HEALTH_TURNOVER_ENABLED){
    // TODO: legg til budsjettoppnåing og fallande-omsetning-kort her
  }

  container.innerHTML=`
    <div class="card" style="margin-bottom:14px;background:linear-gradient(135deg,#F8F7F3 0%,#FAFAF7 100%);border:1px solid #D3D1C7">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:6px">
        <div style="font-size:14px;font-weight:700;color:#2C2C2A">📊 Distrikts-helsesjekk</div>
        <div style="font-size:11px;color:#888780">${year} · uke ${weekNum}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:10px;margin-bottom:14px">
        ${sigCard('⏰','Forfalt oppfølging',
          totalOverdue,
          totalOverdue>0?totalOverdue+' krev handling':'Alt under kontroll ✓',
          totalOverdue>0?'#A23B27':'#1A7A4E',
          'Oppfølgingar med forfallsdato passert. Klikk for å gå til oppfølging.',
          'Oppfølgings-data',
          "showSection('oppfolging',document.querySelector('.nav-item:nth-child(7)'));")}
        ${sigCard('📈','Aktivitetstrend 90 dg',
          trendVal,
          trendSub,
          trendColor,
          'Samanliknar aktivitetsvolum siste 45 dg mot dei 45 før. ↑ stigande · → stabil · ↓ fallande.',
          'Besøkshistorikk')}
        ${sigCard('👤','Med kontaktperson',
          withContacts+' / '+customers.length,
          withContacts>0?withContacts+' kundar med min. 1 kontakt':'Ingen kundar har kontaktperson',
          withContacts>customers.length*0.5?'#1A7A4E':'#BA7517',
          'Kundar med minst éin registrert kontaktperson. Proxy for relasjonsbygging.',
          'Kundekort')}
        ${turnoverCards}
      </div>

      ${worst.length>0?`
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:#5F5E5A;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Kundar som treng merksemd <span style="font-weight:400;color:#B4B2A9">(klikk for å opne kundekort)</span></div>
        <div style="background:#fff;border:1px solid #E5E3DB;border-radius:8px;padding:4px 12px">${worstRows}</div>
        ${unknownCount>0?'<div style="font-size:10px;color:#B4B2A9;margin-top:4px">● '+unknownCount+' kundar utan aktivitetsdata — vist som ukjent, ikkje dårleg helse</div>':''}
      </div>`:''}

      <div style="border-top:1px solid #E5E3DB;padding-top:12px">
        <div style="font-size:11px;font-weight:700;color:#5F5E5A;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Innsatsrad</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">
          <div class="dash-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase">🚗 Km kjørt</span>
              ${srcTag('Kjøreetappar')}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              <div><div style="font-size:18px;font-weight:700;color:#0C447C">${kmMonth>0?Math.round(kmMonth)+' km':'—'}</div><div style="font-size:10px;color:#888780">Inneværande md.</div></div>
              <div><div style="font-size:18px;font-weight:700;color:#5F5E5A">${kmLast30>0?Math.round(kmLast30)+' km':'—'}</div><div style="font-size:10px;color:#888780">Siste 30 dg</div></div>
            </div>
          </div>
          <div class="dash-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase">🏪 Besøk gjennomført</span>
              ${srcTag('Besøkshistorikk')}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              <div><div style="font-size:18px;font-weight:700;color:#0C447C">${visMonth}</div><div style="font-size:10px;color:#888780">Inneværande md.</div></div>
              <div><div style="font-size:18px;font-weight:700;color:#5F5E5A">${visLast30}</div><div style="font-size:10px;color:#888780">Siste 30 dg</div></div>
            </div>
          </div>
          <div class="dash-card" onclick="showSection('kalender',document.querySelector('.nav-item:nth-child(3)'))" style="cursor:pointer" title="Gå til kalender">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase">📅 Planlagt neste 30 dg</span>
              ${srcTag('Kalender')}
            </div>
            <div style="font-size:18px;font-weight:700;color:#0C447C">${planned30}</div>
            <div style="font-size:11px;color:#888780;margin-top:2px">${planned30===0?'Ingen besøk i kalender':'planlagte besøk'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

}

function openFallingList(){
  // Parkert bak HEALTH_TURNOVER_ENABLED — reaktiver når salgstall-import er på plass
  showCustomerListModal('Kunder med fallende omsetning (ikkje aktivt)', []);
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
  const _unEl=document.getElementById('banner-user-name');
  if(_unEl) _unEl.textContent=(userProfile&&userProfile.name)?userProfile.name:((window._sbUser&&window._sbUser.email)?window._sbUser.email.split('@')[0]:'');
  const overdue = followups.filter(f=>!f.done && f.due<TODAY_STR);

  // Dagens plan — kompakt agendaliste
  renderTodayAgenda();

  const todayVisits = visits.filter(v=>v.date===TODAY_STR);
  document.getElementById('overview-metrics').innerHTML =
    metric(todayVisits.length,'Besøk i dag','planlagt') +
    metric(followups.filter(f=>!f.done).length,'Åpen oppfølging', overdue.length+' forfalt') +
    metric('250 km','Kjøring i dag','estimert');

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

// ── Dagens plan: kompakt agendaliste ────────────────────────────────────────
function renderTodayAgenda(){
  var el=document.getElementById('today-calendar');
  if(!el) return;

  var key=TODAY_STR;
  // Normaliser startMins/endMins for alle hendingar
  var rawEvs=(calEvents[key]||[]).map(function(e){
    if(e.startMins!==undefined) return e;
    return Object.assign({},e,{startMins:(e.h||8)*60,endMins:e.hEnd?e.hEnd*60:((e.h||8)+1)*60});
  });

  // Legg til automatiske kjøreetappar mellom kundebesøk
  var allEvs=typeof calAutoAddDrives==='function' ? calAutoAddDrives(rawEvs,key) : rawEvs;

  var sorted=allEvs.slice().sort(function(a,b){ return a.startMins-b.startMins; });

  if(!sorted.length){
    el.innerHTML='<div style="padding:20px 16px;color:#888780;font-size:13px;text-align:center">Ingen avtaler i dag</div>';
    return;
  }

  var now=new Date();
  var nowMins=now.getHours()*60+now.getMinutes();

  // Finn neste kommande avtale (ikkje kjøring)
  var nextIdx=-1;
  for(var i=0;i<sorted.length;i++){
    var ev=sorted[i];
    if(ev.type==='drive'||ev.type==='drive-auto') continue;
    if((ev.endMins||(ev.startMins+60))>nowMins){ nextIdx=i; break; }
  }

  var TYPE_LBL={visit:'Besøk',phone:'Telefon',nydalen:'Nydalen',teams:'Teams',clinic:'Clinic',external:'Ekstern',dinner:'Middag',hotel:'Hotell','hotel-start':'Hotell',flight:'Fly',rental:'Leiebil',adm:'Adm',lunch:'Lunsj',training:'Trening',leisure:'Fritid',other:'Annet',drive:'Kjøring','drive-auto':'Kjøring'};
  var TYPE_CLR={visit:'#185FA5',phone:'#1A5C3A',nydalen:'#4D3085',teams:'#0C447C',clinic:'#B06000',external:'#5F5E5A',dinner:'#7A3A00',hotel:'#0C447C','hotel-start':'#0C447C',flight:'#0C447C',rental:'#888780',adm:'#5F5E5A',lunch:'#7A3A00',training:'#1A5C3A',leisure:'#2D7D32',other:'#5F5E5A'};

  var fmtFn=typeof calFmt==='function'?calFmt:function(m){var h=Math.floor(m/60),mm=m%60;return(h<10?'0':'')+h+':'+(mm<10?'0':'')+mm;};
  var emojiFn=typeof calEvEmoji==='function'?calEvEmoji:function(){ return '📅'; };

  var html='';

  for(var j=0;j<sorted.length;j++){
    var e=sorted[j];
    var isDrive=e.type==='drive'||e.type==='drive-auto';
    var endM=e.endMins||(e.startMins+60);
    var isPast=endM<=nowMins;
    var isNext=j===nextIdx;
    var bdr=j<sorted.length-1?'border-bottom:1px solid #F1EFE8;':'';

    if(isDrive){
      var durMins=Math.max(1,endM-e.startMins);
      var durText=durMins>=60?Math.floor(durMins/60)+' t'+(durMins%60?' '+(durMins%60)+' min':''):durMins+' min';
      var mf=e.mapsFrom||e.from||'';
      var mt=e.mapsTo||e.to||'';
      var mapsHref=(mf&&mt)?'https://www.google.com/maps/dir/'+encodeURIComponent(mf)+'/'+encodeURIComponent(mt):'';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:5px 14px;min-height:32px;'+bdr+(isPast?'opacity:0.4;':'')+'">';
      html+='<span style="font-size:12px;color:#B4B2A9;flex-shrink:0">🚗</span>';
      html+='<span style="font-size:12px;font-weight:500;color:#888780;flex-shrink:0">'+durText+'</span>';
      html+='<span style="font-size:12px;color:#B4B2A9;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(e.label||'')+'</span>';
      if(mapsHref) html+='<a href="'+mapsHref+'" target="_blank" onclick="event.stopPropagation()" style="flex-shrink:0;font-size:11px;color:#1565C0;text-decoration:none;white-space:nowrap;border:1px solid #B8D4E8;border-radius:4px;padding:1px 6px;line-height:1.5">🗺 Maps</a>';
      html+='</div>';
    } else {
      var typeLbl=TYPE_LBL[e.type]||(e.type||'Avtale');
      var typeClr=TYPE_CLR[e.type]||'#5F5E5A';
      var emoji=emojiFn(e.type);

      var relText='';
      if(isNext){
        var diff=e.startMins-nowMins;
        if(diff<=0) relText='Pågår nå';
        else if(diff<60) relText='Om '+diff+' min';
        else relText='Om '+Math.floor(diff/60)+' t'+(diff%60?' '+diff%60+' min':'');
      }

      var bgStyle=isNext?'background:'+typeClr+'0D;':'';
      var leftBdr=isNext?'border-left:3px solid '+typeClr+';':'border-left:3px solid transparent;';
      var opStyle=isPast?'opacity:0.45;':'';

      html+='<div onclick="showSection(\'kalender\');setTimeout(function(){if(typeof calGoToday===\'function\')calGoToday();},60);" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;min-height:44px;'+bdr+leftBdr+bgStyle+opStyle+'">';
      html+='<div style="flex-shrink:0;width:42px;font-size:12px;font-weight:600;color:'+(isPast?'#B4B2A9':'#5F5E5A')+';font-variant-numeric:tabular-nums">'+fmtFn(e.startMins)+'</div>';
      html+='<div style="flex:1;min-width:0">';
      html+='<div style="font-size:13px;font-weight:700;color:'+(isPast?'#B4B2A9':'#2C2C2A')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(e.label||typeLbl)+'</div>';
      if(relText) html+='<div style="font-size:11px;color:'+typeClr+';font-weight:600;margin-top:1px">'+relText+'</div>';
      html+='</div>';
      html+='<span style="flex-shrink:0;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;background:'+typeClr+'18;color:'+typeClr+';border:1px solid '+typeClr+'28;white-space:nowrap;line-height:1.5">'+emoji+' '+typeLbl+'</span>';
      html+='</div>';
    }
  }

  el.innerHTML=html;
}

