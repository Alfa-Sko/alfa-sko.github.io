// ─── INIT ────────────────────────────────────────────────────────────────────

const _todayStr = TODAY.getFullYear()+'-'+String(TODAY.getMonth()+1).padStart(2,'0')+'-'+String(TODAY.getDate()).padStart(2,'0');
document.querySelectorAll('input[type="date"]').forEach(el=>{ if(!el.value) el.value=_todayStr; });

// Rydd opp i duplikate kalender-oppføringer fra tidligere (samme dato + label + starttid)
(function cleanupDuplicates(){
  let cleaned=0;
  Object.keys(calEvents).forEach(dateKey=>{
    const arr=calEvents[dateKey]||[];
    const seen=new Set();
    const filtered=arr.filter(e=>{
      const sig=(e.label||'')+'|'+(e.startMins!==undefined?e.startMins:(e.h||0)*60)+'|'+(e.type||'');
      if(seen.has(sig)){ cleaned++; return false; }
      seen.add(sig);
      return true;
    });
    if(filtered.length!==arr.length) calEvents[dateKey]=filtered;
  });
  if(cleaned>0){ saveData('alfa_events',calEvents); console.log('Fjernet '+cleaned+' duplikat(er) fra kalenderen'); }
})();

// Swipe-navigasjon i kalender (mobil)
(function setupCalSwipe(){
  const body = document.getElementById('cal-body');
  if(!body) return;
  let startX=0, startY=0, startT=0, tracking=false;
  body.addEventListener('touchstart', function(ev){
    if(ev.touches.length!==1) return;
    const t=ev.touches[0];
    startX=t.clientX; startY=t.clientY; startT=Date.now(); tracking=true;
  }, {passive:true});
  body.addEventListener('touchend', function(ev){
    if(!tracking) return;
    tracking=false;
    const t=ev.changedTouches[0];
    const dx=t.clientX-startX, dy=t.clientY-startY, dt=Date.now()-startT;
    // Krav: horisontal forskyvning ≥60px, minst 2x vertikal, varighet <600ms
    if(Math.abs(dx)<60 || Math.abs(dx)<Math.abs(dy)*2 || dt>600) return;
    // Ikke trigge hvis brukeren startet swipe på et event-element (drag)
    if(ev.target.closest('[draggable="true"]')) return;
    calNav(dx<0?1:-1);
    // Visuell tilbakemelding: kort fade
    body.style.opacity='0.5';
    setTimeout(()=>{ body.style.transition='opacity 0.15s'; body.style.opacity='1'; setTimeout(()=>{body.style.transition='';},200); }, 10);
  }, {passive:true});
})();

initPhotoDB().then(()=>renderOverview()).catch(()=>renderOverview());
// Synkronisér brukerprofil til planlegger-feltene ved oppstart
setTimeout(()=>{ try{ syncProfileToPlanner(); }catch(e){} }, 100);


// ── Skysynk: start autentisering ved oppstart ──
(function(){
  function updateSyncCard(){
    const u = window._sbUser;
    const line = document.getElementById('sync-user-line');
    const inBtn = document.getElementById('sync-login-btn');
    const outBtn = document.getElementById('sync-logout-btn');
    if(u){
      if(line) line.innerHTML = '✅ Innlogget som <strong>'+(u.email||'')+'</strong> — data synkes mellom enhetene dine';
      if(inBtn) inBtn.style.display='none';
      if(outBtn) outBtn.style.display='inline-block';
    } else {
      if(line) line.textContent = 'Ikke innlogget — data lagres kun på denne enheten';
      if(inBtn) inBtn.style.display='inline-block';
      if(outBtn) outBtn.style.display='none';
    }
  }
  const lv = document.getElementById('login-version');
  if(lv) lv.textContent = 'Alfa Kompass · '+APP_VERSION;
  const avl = document.getElementById('app-version-label');
  if(avl) avl.textContent = APP_VERSION;
  sbInitAuth().then(updateSyncCard);
  // Oppdater også kortet når profilseksjonen åpnes
  const _origShow = window.showSection || showSection;
  window._syncCardUpdate = updateSyncCard;
})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}
