// ═══════════════════════════════════════════════════════════════════════════
// SKYSYNK & INNLOGGING (Supabase)
// localStorage er fortsatt den lokale hurtigbufferen (appen er rask og
// fungerer offline). Alle 'alfa_'-nøkler speiles til skyen per bruker, og
// hentes ned ved innlogging på en ny enhet. Sist-skrevet-vinner.
// ═══════════════════════════════════════════════════════════════════════════

const APP_VERSION = 'v2026.06.11-36';

// ── Gjeste-demomodus (?demo=1) ─────────────────────────────────────────────
// Fryst og uforanderleg – kan aldri skruast av via UI.
// Blokkerer ALL Supabase-tilkobling, auth og lagring.
(function(){
  const _isDemoURL = (new URLSearchParams(location.search)).get('demo') === '1';
  try{
    Object.defineProperty(window, '_DEMO_ACTIVE', { value: _isDemoURL, writable: false, configurable: false });
  }catch(e){ window._DEMO_ACTIVE = _isDemoURL; }
  if(_isDemoURL) window._demoMode = true; // blokkerer saveData + sbPushKey allereie no
})();

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
const SYNC_KEYS = ['alfa_customers','alfa_customers_version','alfa_events','alfa_followups','alfa_free_notes','alfa_personal_days','alfa_user_profile','alfa_visits'];
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
    return;
  }
  const ov = document.getElementById('login-overlay');
  const s = _sbSession();
  if(s && s.user){
    window._sbUser = s.user;
    if(ov) ov.style.display='none';
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
    const sc = loadData('alfa_customers', null);
    if(sc) CUSTOMERS = sc;
    if(typeof syncProfileToPlanner==='function') syncProfileToPlanner();
    _demoRerender();
  }catch(e){}
}

function saveData(key,val){ if(window._demoMode || window._viewOnlyMode) return; localStorage.setItem(key,JSON.stringify(val)); if(key.startsWith('alfa_')) sbPushKey(key,val); }

