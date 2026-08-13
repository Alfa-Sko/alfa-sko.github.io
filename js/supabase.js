// ═══════════════════════════════════════════════════════════════════════════
// SKYSYNK & INNLOGGING (Supabase)
// localStorage er fortsatt den lokale hurtigbufferen (appen er rask og
// fungerer offline). Alle 'alfa_'-nøkler speiles til skyen per bruker, og
// hentes ned ved innlogging på en ny enhet. Sist-skrevet-vinner.
// ═══════════════════════════════════════════════════════════════════════════

const APP_VERSION = 'v2026.06.11-36';

// ── Vedlikeholdssperre ────────────────────────────────────────────────────────
// Status styrast frå app_settings-tabellen i Supabase (key='maintenance_mode').
// Jørn (MAINTENANCE_ADMIN_UID) slepp alltid inn og ser bryteren på Min profil.
const MAINTENANCE_ADMIN_UID = 'f0cff8a8-d538-431b-8d1f-95db1d75fa03';

async function _fetchMaintenanceMode(){
  try{
    const r = await sbFetch('/rest/v1/app_settings?key=eq.maintenance_mode&select=value', {method:'GET'});
    if(!r.ok) return 'off';
    const rows = await r.json();
    return (rows[0] && rows[0].value==='on') ? 'on' : 'off';
  }catch(e){ return 'off'; }
}

async function maintenanceToggle(){
  const s = _sbSession();
  if(!s || s.user.id !== MAINTENANCE_ADMIN_UID) return;
  const el = document.getElementById('maintenance-admin-section');
  const current = (el && el.dataset.status) || 'off';
  const next = current==='on' ? 'off' : 'on';
  if(next==='on' && !confirm('Dette stenger alle andre ute – sikker?')) return;
  try{
    const r = await sbFetch('/rest/v1/app_settings?on_conflict=key', {
      method:'POST',
      headers:{'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body: JSON.stringify({key:'maintenance_mode', value:next, updated_at:new Date().toISOString()})
    });
    if(!r.ok) throw new Error('HTTP '+r.status+' '+await r.text());
    _renderMaintenanceAdminUI(next);
  }catch(e){ alert('Feil: kunne ikke oppdatere vedlikeholdsstatus.\n'+e.message); }
}

function _renderMaintenanceAdminUI(status){
  const el = document.getElementById('maintenance-admin-section');
  if(!el) return;
  el.dataset.status = status;
  el.style.display = 'block';
  const on = status==='on';
  el.innerHTML =
    '<div class="card" style="margin-bottom:14px;border:1px solid '+(on?'#A23B27':'#1A7A4E')+';background:'+(on?'#FBE6E6':'#F0FAF5')+'">'
    +'<div class="card-title">🛠️ Vedlikeholdsmodus</div>'
    +'<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:'+(on?'#A23B27':'#1A7A4E')+'">'+(on?'🔴 PÅ – andre brukere er sperret':'🟢 AV – alle har tilgang')+'</div>'
    +'<button onclick="maintenanceToggle()" class="btn '+(on?'btn-dark':'btn-light')+'" style="'+(on?'background:#1A7A4E;border-color:#1A7A4E':'border:1px solid #A23B27;color:#A23B27')+';font-weight:700">'+(on?'Opphev vedlikehold (gi tilgang til alle)':'Aktiver vedlikehold (steng ute andre)')+'</button>'
    +'</div>';
}

async function renderMaintenanceAdminSection(){
  const s = _sbSession();
  if(!s || s.user.id !== MAINTENANCE_ADMIN_UID) return;
  const status = await _fetchMaintenanceMode();
  _renderMaintenanceAdminUI(status);
}

function _showMaintenanceScreen(){
  const app = document.querySelector('.app');
  if(app) app.style.display = 'none';
  if(document.getElementById('maintenance-overlay')) return;
  const el = document.createElement('div');
  el.id = 'maintenance-overlay';
  el.style.cssText = 'position:fixed;inset:0;z-index:3000;background:#2C2C2A;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;box-sizing:border-box;text-align:center';
  el.innerHTML =
    '<div style="color:#fff;margin-bottom:28px">'
    +'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 783.4 216.0" style="height:44px;width:auto" role="img" aria-label="KOMPASS"><g transform="translate(40.00,176.00) scale(0.17143,-0.17143)"><path d="M65 12V688L76 700H150L162 688V311H170L383 515H441L453 503V445L301 299V290L462 69V12L450 0H389L225 227H216L162 174V12L150 0H76Z" fill="currentColor"/></g><g transform="translate(224.63,176.00) scale(0.17143,-0.17143)"><path d="M60 11V504L71 515H145L157 504V450H165Q190 487 227.0 506.0Q264 525 311 525Q363 525 404.0 502.0Q445 479 467 439H475Q499 479 543.5 502.0Q588 525 641 525Q691 525 732.0 501.5Q773 478 796.0 436.5Q819 395 819 343V11L808 0H733L722 11V322Q722 374 695.0 403.0Q668 432 619 432Q558 432 523.5 384.0Q489 336 489 245V11L478 0H404L393 11V322Q393 374 366.0 403.0Q339 432 290 432Q228 432 192.5 381.5Q157 331 157 245V11L145 0H71Z" fill="currentColor"/></g><g transform="translate(372.23,176.00) scale(0.17143,-0.17143)"><path d="M60 -154V503L71 515H144L155 503V452H164Q215 525 314 525Q384 525 435.5 491.5Q487 458 514.5 397.5Q542 337 542 257Q542 178 514.5 117.5Q487 57 436.5 23.5Q386 -10 317 -10Q221 -10 165 58H157V-154L145 -165H71ZM443 257Q443 339 404.5 385.0Q366 431 298 431Q230 431 191.5 385.0Q153 339 153 257Q153 176 191.5 130.0Q230 84 298 84Q366 84 404.5 130.0Q443 176 443 257Z" fill="currentColor"/></g><g transform="translate(471.31,176.00) scale(0.17143,-0.17143)"><path d="M33 145Q33 226 88.5 268.5Q144 311 251 311H361L370 320V345Q370 390 344.5 410.5Q319 431 260 431Q204 431 177.0 413.5Q150 396 145 357L133 346H58L47 357Q52 438 106.0 481.5Q160 525 260 525Q362 525 414.5 479.5Q467 434 467 348V117Q467 105 473.5 98.0Q480 91 493 91H515L527 80V8L515 -3H478Q445 -3 419.0 14.0Q393 31 383 63H375Q350 24 312.5 7.0Q275 -10 215 -10Q128 -10 80.5 30.5Q33 71 33 145ZM370 205V223L361 232H258Q192 232 162.0 212.5Q132 193 132 153Q132 83 231 83Q370 83 370 205Z" fill="currentColor"/></g><g transform="translate(564.40,176.00) scale(0.17143,-0.17143)"><path d="M36 159 48 170H125L136 159Q147 84 269 84Q325 84 351.5 99.5Q378 115 378 145Q378 197 290 212L207 227Q133 240 92.0 279.5Q51 319 51 378Q51 446 103.5 485.5Q156 525 246 525Q341 525 401.5 478.5Q462 432 467 356L455 345H379L368 356Q363 393 336.0 412.0Q309 431 250 431Q200 431 174.0 416.0Q148 401 148 372Q148 349 167.5 336.0Q187 323 230 316L306 302Q391 287 434.0 247.0Q477 207 477 150Q477 77 421.5 33.5Q366 -10 269 -10Q165 -10 103.5 36.5Q42 83 36 159Z" fill="currentColor"/></g><g transform="translate(653.89,176.00) scale(0.17143,-0.17143)"><path d="M36 159 48 170H125L136 159Q147 84 269 84Q325 84 351.5 99.5Q378 115 378 145Q378 197 290 212L207 227Q133 240 92.0 279.5Q51 319 51 378Q51 446 103.5 485.5Q156 525 246 525Q341 525 401.5 478.5Q462 432 467 356L455 345H379L368 356Q363 393 336.0 412.0Q309 431 250 431Q200 431 174.0 416.0Q148 401 148 372Q148 349 167.5 336.0Q187 323 230 316L306 302Q391 287 434.0 247.0Q477 207 477 150Q477 77 421.5 33.5Q366 -10 269 -10Q165 -10 103.5 36.5Q42 83 36 159Z" fill="currentColor"/></g><circle cx="174.91" cy="131.86" r="45.91" fill="none" stroke="currentColor" stroke-width="13.4"/><polygon points="174.91,85.95 162.91,128.86 186.91,128.86" fill="#D85A30"/><polygon points="174.91,177.77 162.91,134.86 186.91,134.86" fill="currentColor"/></svg>'
    +'</div>'
    +'<div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:14px">Vedlikehold pågår</div>'
    +'<div style="font-size:14px;color:#B4B2A9;max-width:360px;line-height:1.65">Kompass er midlertidig utilgjengelig på grunn av tekniske problemer med serveren. Vi jobber med saken – prøv igjen senere.</div>'
    +'<button onclick="sbLogout()" style="margin-top:52px;background:none;border:1px solid #5F5E5A;color:#888780;font-size:12px;padding:8px 22px;border-radius:8px;cursor:pointer;letter-spacing:0.02em">Logg ut</button>';
  document.body.appendChild(el);
}

// _DEMO_ACTIVE + _demoMode er sett av inline-snutt i index.html (før alle moduler).
// Husket rolle fra forrige økt (settes ved profil-lasting). Gjør at leder-
// kontoer kan sperres og ryddes SYNKRONT ved oppstart — før UI er klikkbart.
window._bootLeader = false;
if(!window._DEMO_ACTIVE){
  try{
    const _cachedRole = localStorage.getItem('sb_role');
    if(_cachedRole==='sjef' || _cachedRole==='ceo'){
      window._bootLeader = true;
      Object.keys(localStorage).forEach(k=>{ if(k.startsWith('alfa_')) localStorage.removeItem(k); });
    }
  }catch(e){}
}

const SUPA_URL = 'https://oxwirhetgwcbsehyuaeq.supabase.co';
const SUPA_KEY = 'sb_publishable_eflHUMlSGKaZIzb1YYjG3w_TTNKK1az';

function _sbSession(){ try{ return JSON.parse(localStorage.getItem('sb_session')||'null'); }catch(e){ return null; } }
function _sbSaveSession(s){ if(s) localStorage.setItem('sb_session', JSON.stringify(s)); else localStorage.removeItem('sb_session'); }

async function sbLogin(email, password){
  const r = await fetch(SUPA_URL+'/auth/v1/token?grant_type=password', {
    method:'POST',
    headers:{'apikey':SUPA_KEY,'Content-Type':'application/json'},
    body: JSON.stringify({email:email, password:password})
  });
  const d = await r.json();
  if(!r.ok) throw new Error(d.error_description||d.msg||'Innlogging feilet');
  // Eierbinding: lokale data på enheten tilhører ÉN bruker. Logger en annen
  // bruker inn, tømmes alle alfa_-nøkler så ingen arver forrige brukers data.
  try{
    const prevOwner = localStorage.getItem('sb_data_owner');
    if(prevOwner && prevOwner !== d.user.id){
      Object.keys(localStorage).forEach(k=>{ if(k.startsWith('alfa_')) localStorage.removeItem(k); });
    }
    localStorage.setItem('sb_data_owner', d.user.id);
  }catch(e){}
  _sbSaveSession({access_token:d.access_token, refresh_token:d.refresh_token, user:d.user, ts:Date.now()});
  window._sbUser = d.user;
  return d.user;
}

async function sbRefresh(){
  const s = _sbSession();
  if(!s || !s.refresh_token) return false;
  try{
    const r = await fetch(SUPA_URL+'/auth/v1/token?grant_type=refresh_token', {
      method:'POST',
      headers:{'apikey':SUPA_KEY,'Content-Type':'application/json'},
      body: JSON.stringify({refresh_token:s.refresh_token})
    });
    const d = await r.json();
    if(!r.ok) return false;
    _sbSaveSession({access_token:d.access_token, refresh_token:d.refresh_token, user:d.user, ts:Date.now()});
    window._sbUser = d.user;
    return true;
  }catch(e){ return false; }
}

// Autentisert kall med automatisk token-fornyelse ved 401
async function sbFetch(path, opts){
  const s = _sbSession();
  if(!s) throw new Error('Ikke innlogget');
  opts = opts||{};
  opts.headers = Object.assign({'apikey':SUPA_KEY,'Authorization':'Bearer '+s.access_token}, opts.headers||{});
  let r = await fetch(SUPA_URL+path, opts);
  if(r.status===401){
    const ok = await sbRefresh();
    if(ok){
      const s2 = _sbSession();
      opts.headers['Authorization'] = 'Bearer '+s2.access_token;
      r = await fetch(SUPA_URL+path, opts);
    }
  }
  return r;
}

function sbLogout(){
  try{ localStorage.removeItem('sb_role'); }catch(e){}
  _sbSaveSession(null);
  window._sbUser = null;
  location.reload();
}

// ── Push: speil en nøkkel til skyen (debounced, kø ved offline) ──
const _sbPushTimers = {};
function sbPushKey(key, val){
  if(!window._sbUser || window._demoMode) return;
  clearTimeout(_sbPushTimers[key]);
  _sbPushTimers[key] = setTimeout(()=>{ _sbDoPush(key, val); }, 1200);
}
async function _sbDoPush(key, val){
  const s = _sbSession();
  if(!s) return;
  try{
    const r = await sbFetch('/rest/v1/user_data?on_conflict=user_id,key', {
      method:'POST',
      headers:{'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
      body: JSON.stringify({user_id:s.user.id, key:key, value:val, updated_at:new Date().toISOString()})
    });
    if(!r.ok) throw new Error('push '+r.status);
    _sbSetStatus('Synket '+new Date().toLocaleTimeString('no-NO',{hour:'2-digit',minute:'2-digit'}));
    _sbClearPending(key);
  }catch(e){
    _sbAddPending(key);
    _sbSetStatus('Venter på nett — endringer lagres lokalt');
  }
}
function _sbAddPending(key){
  const p = loadData('sb_pending', []);
  if(!p.includes(key)){ p.push(key); localStorage.setItem('sb_pending', JSON.stringify(p)); }
}
function _sbClearPending(key){
  const p = loadData('sb_pending', []).filter(k=>k!==key);
  localStorage.setItem('sb_pending', JSON.stringify(p));
}
async function sbRetryPending(){
  const p = loadData('sb_pending', []);
  for(const key of p){
    const val = loadData(key, null);
    if(val!==null) await _sbDoPush(key, val);
  }
}

// ── Pull: hent alle data fra skyen og oppdater lokalt ──
async function sbPullAll(){
  const uid = ((_sbSession()||{}).user||{}).id;
  const r = await sbFetch('/rest/v1/user_data?select=key,value&user_id=eq.'+uid, {method:'GET'});
  if(!r.ok) throw new Error('pull '+r.status);
  const rows = await r.json();
  let changed = 0;
  rows.forEach(row=>{
    if(!row.key || !row.key.startsWith('alfa_')) return;
    const localStr = localStorage.getItem(row.key);
    const remoteStr = JSON.stringify(row.value);
    if(localStr !== remoteStr){
      localStorage.setItem(row.key, remoteStr);
      changed++;
    }
  });
  return changed;
}

// Første synk fra en enhet med eksisterende lokale data: send alt opp
const SYNC_KEYS = ['alfa_customers','alfa_customers_version','alfa_cust_constellations','alfa_cust_photos','alfa_events','alfa_followups','alfa_free_notes','alfa_personal_days','alfa_user_profile','alfa_visits'];
function _sbAllSyncKeys(){
  const keys = new Set(SYNC_KEYS);
  try{ Object.keys(localStorage).forEach(k=>{ if(k.startsWith('alfa_')) keys.add(k); }); }catch(e){}
  return [...keys];
}
function _sbWipeLocalAlfa(){
  _sbAllSyncKeys().forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
}

async function sbPushAll(){
  for(const key of _sbAllSyncKeys()){
    const val = loadData(key, null);
    if(val!==null) await _sbDoPush(key, val);
  }
}

function _sbSetStatus(txt){
  const el = document.getElementById('sync-status');
  if(el) el.textContent = txt;
  const el2 = document.getElementById('sync-status-profile');
  if(el2) el2.textContent = txt;
}

// ── Innloggingsflyt ──
async function sbHandleLogin(){
  const email = (document.getElementById('login-email')||{}).value||'';
  const pass = (document.getElementById('login-pass')||{}).value||'';
  const err = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  if(!email || !pass){ if(err){err.textContent='Fyll inn e-post og passord';err.style.display='block';} return; }
  if(btn){ btn.disabled=true; btn.textContent='Logger inn …'; }
  try{
    await sbLogin(email.trim(), pass);
    const prof = await sbLoadMyProfile();
    const isLeader = prof && (prof.role==='sjef' || prof.role==='ceo');
    if(isLeader){
      // Ledere har ikke egne feltdata: rydd lokalt; sanering fullføres ved oppstart
      _sbWipeLocalAlfa();
    } else {
      // Har skyen MINE data? Pull. Tom sky + lokale data: push opp (førstegang).
      const uid = ((_sbSession()||{}).user||{}).id;
      const r = await sbFetch('/rest/v1/user_data?select=key&user_id=eq.'+uid+'&limit=1', {method:'GET'});
      const rows = r.ok ? await r.json() : [];
      if(rows.length===0){
        await sbPushAll();
      } else {
        await sbPullAll();
      }
    }
    location.reload(); // start appen rent med ferske data og gyldig sesjon
  }catch(e){
    let msg = e.message||'ukjent feil';
    if(/load failed|failed to fetch|networkerror|network request failed/i.test(msg)){
      msg = 'Får ikke kontakt med serveren. Dette skjer som regel når appen er åpnet som lokal fil — den må åpnes fra en nettadresse (https). Trykk "Fortsett uten innlogging" for å jobbe lokalt nå.';
    } else if(/invalid login credentials/i.test(msg)){
      msg = 'Feil e-post eller passord.';
    } else if(/email not confirmed/i.test(msg)){
      msg = 'Brukeren er ikke bekreftet. Gå til Supabase → Authentication → Users og bekreft brukeren (eller opprett på nytt med "Auto Confirm User").';
    }
    if(err){ err.textContent = msg; err.style.display='block'; }
    if(btn){ btn.disabled=false; btn.textContent='Logg inn'; }
  }
}

function sbSkipLogin(){
  localStorage.setItem('sb_local_mode','1');
  const ov = document.getElementById('login-overlay');
  if(ov) ov.style.display='none';
}

async function sbInitAuth(){
  if(window._DEMO_ACTIVE){
    const ov = document.getElementById('login-overlay');
    if(ov) ov.style.display='none';
    // Banner
    if(!document.getElementById('demo-active-banner')){
      const b = document.createElement('div');
      b.id = 'demo-active-banner';
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2000;background:#1A5C3A;color:#fff;font-size:12px;font-weight:700;padding:8px 16px;text-align:center;letter-spacing:0.04em;pointer-events:none;user-select:none';
      b.textContent = '🧪 DEMOMODUS — fiktive data, ingenting lagres';
      document.body.appendChild(b);
      document.body.style.paddingTop = '34px';
    }
    // Skjul login-knapp, logout-knapp og gammel anonymiserings-demo-toggle
    ['sync-login-btn','sync-logout-btn','demo-toggle-btn'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.style.display='none';
    });
    // Demo-hero-banner: bytt Walk-with-us-bilde med demo_banner.jpg
    (function(){
      var heroImg = document.querySelector('.hero-banner');
      var demoMap = document.getElementById('demo-hero-map');
      if(demoMap) demoMap.style.setProperty('display','block','important');
      if(heroImg) heroImg.style.setProperty('display','none','important');
    })();
    return;
  }
  const ov = document.getElementById('login-overlay');
  const s = _sbSession();
  if(s && s.user){
    window._sbUser = s.user;
    if(ov) ov.style.display='none';
    const _mUid = s.user.id;
    if(_mUid !== MAINTENANCE_ADMIN_UID){
      const _mStatus = await _fetchMaintenanceMode();
      if(_mStatus === 'on'){ _showMaintenanceScreen(); return; }
    } else {
      renderMaintenanceAdminSection();
    }
    // Bakgrunnssynk: forny token, hent endringer, prøv ventende push
    sbRefresh().then(async ok=>{
      if(!ok){ _sbSetStatus('Frakoblet — jobber lokalt'); return; }
      try{
        const prof = await sbLoadMyProfile();
        const roleEl = document.getElementById('sync-role-line');
        if(roleEl){
          roleEl.textContent = prof
            ? 'Rolle: '+prof.role+(prof.district?' · '+prof.district:'')
            : '⚠ Profil ikke lest. Teknisk svar: '+(window._profDiag||'ukjent');
          roleEl.style.color = prof ? '#888780' : '#A23B27';
        }
        if(prof && (prof.role==='sjef' || prof.role==='ceo')) managerInit();
        const changed = await sbPullAll();
        await sbRetryPending();
        if(changed>0){
          _sbSetStatus('Hentet '+changed+' oppdatering(er) fra skyen');
          if(typeof _demoRerender==='function'){ _sbApplyPulled(); }
        } else {
          _sbSetStatus('Synket og oppdatert');
        }
      }catch(e){ _sbSetStatus('Synkfeil: '+(e.message||e)); }
    });
    window.addEventListener('online', ()=>{ sbRetryPending(); });
    return;
  }
  if(localStorage.getItem('sb_local_mode')==='1'){
    if(ov) ov.style.display='none';
    return;
  }
  if(ov) ov.style.display='flex';
}

// Etter pull: les kjente nøkler inn i minnet og re-render
function _sbApplyPulled(){
  try{
    calEvents = loadData('alfa_events', calEvents);
    visits = loadData('alfa_visits', visits);
    followups = loadData('alfa_followups', followups);
    userProfile = Object.assign({}, DEFAULT_USER_PROFILE, loadData('alfa_user_profile', {}));
    if(typeof personalDays!=='undefined') personalDays = loadData('alfa_personal_days', personalDays);
    if(typeof custPhotos!=='undefined') custPhotos = loadData('alfa_cust_photos', custPhotos);
    if(typeof constellations!=='undefined') constellations = loadData('alfa_cust_constellations', constellations);
    const sc = loadData('alfa_customers', null);
    if(sc) CUSTOMERS = sc;
    if(typeof syncProfileToPlanner==='function') syncProfileToPlanner();
    _demoRerender();
  }catch(e){}
}

function saveData(key,val){ if(window._demoMode || window._viewOnlyMode) return; localStorage.setItem(key,JSON.stringify(val)); if(key.startsWith('alfa_')) sbPushKey(key,val); }

