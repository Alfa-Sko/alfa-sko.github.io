// Beregn norske helligdager for et gitt år. Returnerer { 'YYYY-MM-DD': 'Navn' }

function addPersonalDay(dateKey){
  // Be om type via en enkel input — bruk en in-app modal eller prompt
  const label = prompt('Hvilken type fri?\n\nEksempler: Ferie, Avspasering, Sykedag, Permisjon, Egenmelding\n\n(Trykk Avbryt for å lukke)', 'Ferie');
  if(!label) return;
  const note = prompt('Notat (valgfritt — f.eks. "Med familien")', '');
  // Spør om dato-spenn
  const endDateInput = prompt('Slutter samme dag? Skriv inn sluttdato (YYYY-MM-DD) for flerdagers ferie, eller trykk OK for å bare bruke '+dateKey+':', dateKey);
  const endDate = endDateInput || dateKey;
  // Legg inn én oppføring per dag
  const start = new Date(dateKey);
  const end = new Date(endDate);
  if(end < start){ showToast('Sluttdato er før startdato — bruker bare startdato'); }
  const days = [];
  for(let d = new Date(start); d <= end; d.setDate(d.getDate()+1)){
    const key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    days.push(key);
  }
  let added = 0;
  days.forEach(key=>{
    // Skip hvis allerede helligdag eller allerede registrert
    if(getHolidayName(key)) return;
    if(getPersonalDay(key)) return;
    personalDays.push({date:key, label:label, note:note||''});
    added++;
  });
  saveData('alfa_personal_days', personalDays);
  showToast(added>1 ? (added+' fridager registrert') : 'Fridag registrert');
  renderCal();
}

function removePersonalDay(dateKey){
  if(!confirm('Fjerne registrert fridag?')) return;
  personalDays = personalDays.filter(d=>d.date!==dateKey);
  saveData('alfa_personal_days', personalDays);
  showToast('Fridag fjernet');
  renderCal();
}
let calView = 'month';
const TODAY = new Date();
const TODAY_STR = TODAY.getFullYear()+'-'+String(TODAY.getMonth()+1).padStart(2,'0')+'-'+String(TODAY.getDate()).padStart(2,'0');
let calCursor = new Date();

const NO_MONTHS=['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];
const NO_SHORT=['Man','Tir','Ons','Tor','Fre','Lør','Søn'];
const NO_LONG=['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'];
// ─── CALENDAR ───────────────────────────────────────────────────────────────

function setCalView(v,el){
  calView=v;
  document.querySelectorAll('.vt-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderCal();
}
function calNav(dir){
  if(calView==='month') calCursor.setMonth(calCursor.getMonth()+dir);
  else if(calView==='week') calCursor.setDate(calCursor.getDate()+dir*7);
  else calCursor.setDate(calCursor.getDate()+dir);
  renderCal();
}
function calGoToday(){ calCursor=new Date(TODAY); renderCal(); }

// Garantert virkende tøm-funksjon. Krever to trykk innen 3 sekunder for å bekrefte.
let _clearConfirmAt = 0;
function clearAllCalendar(){
  const now = Date.now();
  if(now - _clearConfirmAt > 3000){
    // Første trykk — be om bekreftelse via toast
    _clearConfirmAt = now;
    try{ showToast('Trykk én gang til innen 3 sek for å tømme ALT i kalenderen'); }catch(e){}
    return;
  }
  // Andre trykk — slett ALT
  _clearConfirmAt = 0;
  try{
    if(typeof calEvents === 'object' && calEvents){
      for(const k in calEvents) delete calEvents[k];
    }
    if(Array.isArray(visits))    visits.length    = 0;
    if(Array.isArray(followups)) followups.length = 0;
    // saveData skriver localStorage OG pusher tom tilstand til Supabase
    saveData('alfa_events',    {});
    saveData('alfa_visits',    []);
    saveData('alfa_followups', []);
  }catch(e){ console.error('clear error', e); }
  try{ showToast('✓ Kalenderen er tømt'); }catch(e){}
  try{ renderCal(); }catch(e){ console.error(e); }
}

function getEventsForDay(key){
  const base = calEvents[key]||[];
  const visitEvs = visits.filter(v=>v.date===key).map(v=>({type:'visit',label:v.customer,h:parseInt((v.time||'08').split(':')[0]),visitId:v.id}));
  const seen = new Set(base.map(e=>e.label));
  return [...base,...visitEvs.filter(v=>!seen.has(v.label))];
}

function renderCal(){
  const body = document.getElementById('cal-body');
  if(calView==='month') renderMonth(body);
  else if(calView==='week') renderWeek(body);
  else renderDay(body);
}

function renderMonth(body){
  const y=calCursor.getFullYear(), m=calCursor.getMonth();
  document.getElementById('cal-title').textContent=NO_MONTHS[m]+' '+y;
  const first=mb(new Date(y,m,1).getDay());
  const dim=new Date(y,m+1,0).getDate();
  const prev=new Date(y,m,0).getDate();
  let h='<div class="cal-grid-month">';
  NO_SHORT.forEach(n=>{h+=`<div class="cal-dname">${n}</div>`});
  const pm=m===0?11:m-1, py=m===0?y-1:y;
  for(let i=0;i<first;i++){
    const pd=prev-first+1+i, pkey=dk(py,pm,pd);
    const pallEvs=getEventsForDay(pkey);
    const pevHtml=pallEvs.slice(0,3).map(e=>{
      const cc=calEvClass(e.type);
      const sl=(e.label||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const si=_calStatusIcons(e,pkey);
      return `<div class="cal-ev ${cc}" style="${calEvDim(e)}" onclick="event.stopPropagation();monthEvClick('${pkey}')">${calBookedMark(e)}${sl}${si?'<span style="font-size:9px;margin-left:2px;opacity:0.9">'+si+'</span>':''}</div>`;
    }).join('');
    const pmore=pallEvs.length>3?`<div class="cal-ev" style="color:#0C447C;font-weight:600">+${pallEvs.length-3} til</div>`:'';
    h+=`<div class="cal-day other-month${pallEvs.length>0?' has-events':''}" onclick="jumpToDayFromMonth(${py},${pm},${pd})"><div class="cal-dnum">${pd}</div>${pevHtml}${pmore}</div>`;
  }
  for(let d=1;d<=dim;d++){
    const col=mb(new Date(y,m,d).getDay());
    const wk=col>=5?' weekend':'';
    const td=isToday(y,m,d)?' is-today':'';
    const key=dk(y,m,d);
    const allEvs=getEventsForDay(key);
    const hasEv=allEvs.length>0?' has-events':'';
    const holidayName=getHolidayName(key);
    const vacationDay=getPersonalDay(key);
    const isHol=holidayName?' is-holiday':'';
    const isVac=(!holidayName && vacationDay)?' is-vacation':'';
    const evs=allEvs.slice(0,3);
    const more=allEvs.length>3?`<div class="cal-ev" style="color:#0C447C;font-weight:600">+${allEvs.length-3} til</div>`:'';
    let topLabel='';
    // I månedsvisning vises kun fargen for helligdager — navnet kommer i uke/dag-visning.
    // For ferie/fridag viser vi en kort label.
    if(!holidayName && vacationDay){
      topLabel=`<div class="cal-vacation-label" title="${vacationDay.label||'Fridag'}">${vacationDay.label||'Fridag'}</div>`;
    }
    const evHtml=evs.map(e=>{
      const cc=calEvClass(e.type);
      const safeLabel=(e.label||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const si=_calStatusIcons(e,key);
      return `<div class="cal-ev ${cc}" style="${calEvDim(e)}" onclick="event.stopPropagation();monthEvClick('${key}')">${calBookedMark(e)}${safeLabel}${si?'<span style="font-size:9px;margin-left:2px;opacity:0.9">'+si+'</span>':''}</div>`;
    }).join('');
    h+=`<div class="cal-day${wk}${td}${hasEv}${isHol}${isVac}" onclick="jumpToDayFromMonth(${y},${m},${d})"><div class="cal-dnum">${d}</div>${topLabel}${evHtml}${more}</div>`;
  }
  const used=first+dim;
  const rem=used%7===0?0:7-(used%7);
  const nm=m===11?0:m+1, ny=m===11?y+1:y;
  for(let i=0;i<rem;i++){
    const nd=i+1, nkey=dk(ny,nm,nd);
    const nallEvs=getEventsForDay(nkey);
    const nevHtml=nallEvs.slice(0,3).map(e=>{
      const cc=calEvClass(e.type);
      const sl=(e.label||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const si=_calStatusIcons(e,nkey);
      return `<div class="cal-ev ${cc}" style="${calEvDim(e)}" onclick="event.stopPropagation();monthEvClick('${nkey}')">${calBookedMark(e)}${sl}${si?'<span style="font-size:9px;margin-left:2px;opacity:0.9">'+si+'</span>':''}</div>`;
    }).join('');
    const nmore=nallEvs.length>3?`<div class="cal-ev" style="color:#0C447C;font-weight:600">+${nallEvs.length-3} til</div>`:'';
    h+=`<div class="cal-day other-month${nallEvs.length>0?' has-events':''}" onclick="jumpToDayFromMonth(${ny},${nm},${nd})"><div class="cal-dnum">${nd}</div>${nevHtml}${nmore}</div>`;
  }
  h+='</div>';
  body.innerHTML=h;
}

function jumpToDayFromMonth(y,m,d){
  calCursor=new Date(y,m,d);
  calView='day';
  document.querySelectorAll('.vt-btn').forEach(b=>b.classList.remove('active'));
  const dayBtn=document.querySelector('.vt-btn[onclick*="day"]');
  if(dayBtn) dayBtn.classList.add('active');
  renderCal();
}

function monthEvClick(key){
  const [y,m,d]=key.split('-').map(Number);
  jumpToDayFromMonth(y,m-1,d);
}

// Dus visning for ubekreftede oppføringer:
//  - kundebesøk uten avtale (appointed===false) vises dusere
//  - fly/hotell som ikke er bestilt (booked===false) vises dusere
// Felter som ikke er satt (eldre/manuelle events) vises normalt.
// ✅/❌-symbol for bestillingsstatus på reise-elementer
function calBookedMark(e){
  if(e.type==='flight'||e.type==='hotel'||e.type==='rental'||e.type==='ferry'){
    if(e.booked===true) return '✅ ';
    if(e.booked===false) return '❌ ';
  }
  return '';
}
function calEvDim(e){
  // Kundebesøk: GRØNN når avtalt, RØD når uanmeldt/ikke avtalt
  if(e.type==='visit' && e.appointed===true) return 'background:#E3F2E8;color:#1A5C3A;border-left-color:#1A5C3A;';
  if(e.type==='visit' && e.appointed===false) return 'background:#FBE9E7;color:#A23B27;border-left-color:#A23B27;border-left-style:dashed;';
  if((e.type==='flight'||e.type==='hotel'||e.type==='rental'||e.type==='ferry') && e.booked===false) return 'opacity:0.45;border-left-style:dashed;';
  return '';
}
function calEvClass(type){
  const m={visit:'cev-visit',phone:'cev-phone',nydalen:'cev-nydalen',teams:'cev-teams',clinic:'cev-clinic',external:'cev-external',dinner:'cev-dinner',drive:'cev-d','drive-auto':'cev-drive-auto',hotel:'cev-h','hotel-start':'cev-h',flight:'cev-h',rental:'cev-d',ferry:'cev-h'};
  return m[type]||'cev-v';
}
function calEvEmoji(type){
  const m={visit:'🏪',phone:'📞',nydalen:'🏢',teams:'👥',clinic:'🎓',external:'📈',dinner:'🍽️',drive:'🚗','drive-auto':'🚗',hotel:'🏨','hotel-start':'🏨',flight:'✈️',adm:'💻',lunch:'🍽️',training:'🏃',leisure:'🌿',rental:'🚙',ferry:'⛴️',other:'📌'};
  return m[type]||'📅';
}
function _calStatusIcons(e, key){
  if(e.type !== 'visit') return '';
  const v = e.visitId
    ? visits.find(x => String(x.id) === String(e.visitId))
    : visits.find(x => x.date === key && x.customer === e.label);
  const hasPhoto = (v && v.photoPaths && v.photoPaths.length > 0)
    || (custPhotos || []).some(p => p.customer === e.label && p.date === key);
  const hasNote = !!(v && v.notes && v.notes.trim());
  const hasFollowup = (typeof followups !== 'undefined' ? followups : []).some(f => f.customer === e.label && !f.done);
  return (hasPhoto ? '📷' : '') + (hasNote ? '📝' : '') + (hasFollowup ? '🔔' : '');
}
function calFmt(m){
  const h=Math.floor(m/60),mm=m%60;
  return (h<10?'0':'')+h+':'+(mm<10?'0':'')+mm;
}
function calAutoAddDrives(evs,key){
  const result=[...evs];
  const visits=evs.filter(e=>e.type==='visit').map(e=>({...e,startMins:e.startMins!==undefined?e.startMins:(e.h||8)*60,endMins:e.endMins!==undefined?e.endMins:(e.hEnd?e.hEnd*60:((e.h||8)+1)*60)})).sort((a,b)=>a.startMins-b.startMins);
  for(let i=0;i<visits.length-1;i++){
    const from=visits[i],to=visits[i+1];
    const ds=from.endMins,de=to.startMins;
    if(de>ds&&!evs.some(e=>e.type==='drive'&&Math.abs((e.startMins||e.h*60)-ds)<30)){
      result.push({id:'auto-'+key+'-'+i,type:'drive-auto',auto:true,label:from.label+' → '+to.label,startMins:ds,endMins:de,mapsFrom:from.label,mapsTo:to.label});
    }
  }
  return result;
}
function calLayoutOverlap(evs,HSTART,HEND){
  const visible=evs.filter(e=>e.startMins<HEND*60&&e.endMins>HSTART*60);
  const sorted=[...visible].sort((a,b)=>a.startMins-b.startMins);
  const cols=[];
  const result=sorted.map(e=>{
    let placed=-1;
    for(let i=0;i<cols.length;i++){if(cols[i]<=e.startMins){cols[i]=e.endMins;placed=i;break;}}
    if(placed===-1){cols.push(e.endMins);placed=cols.length-1;}
    return{...e,_col:placed};
  });
  result.forEach(e=>{e._cols=result.filter(o=>o.startMins<e.endMins&&o.endMins>e.startMins).reduce((m,o)=>Math.max(m,o._col+1),1);});
  return result;
}

let _calDrag=null;
function calEvDragStart(ev,key,eEnc){ev.stopPropagation();const e=JSON.parse(decodeURIComponent(eEnc));_calDrag={key,e,dur:(e.endMins||0)-(e.startMins||0),origEnd:e.endMins||e.startMins};ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain','ev');}
function calEvDragEnd(){_calDrag=null;}
function calDragOver(ev,key,colEl){
  ev.preventDefault();
  if(!_calDrag||!colEl) return;
  const ghost=document.getElementById('wkghost-'+key);
  if(!ghost) return;
  const rect=colEl.getBoundingClientRect();
  const slot=Math.max(0,Math.round((ev.clientY-rect.top)/15));
  const h=Math.max(1,Math.round(_calDrag.dur/15));
  ghost.style.cssText='display:block;position:absolute;left:4px;right:4px;top:'+(slot*15)+'px;height:'+(h*15)+'px;background:rgba(25,118,210,0.18);border:2px dashed #1976D2;border-radius:5px;pointer-events:none;z-index:10;box-sizing:border-box';
}
function calDragLeave(ev,key){
  const ghost=document.getElementById('wkghost-'+key);
  if(ghost) ghost.style.display='none';
}
function calDrop(ev,newKey,colEl){
  ev.preventDefault();
  if(!_calDrag) return;
  if(_roGuard()){_calDrag=null;return;}
  const ghost=document.getElementById('wkghost-'+newKey);
  if(ghost) ghost.style.display='none';
  const rect=colEl.getBoundingClientRect();
  const HSTART=(calView==='day')?4:6;
  const slot=Math.max(0,Math.round((ev.clientY-rect.top)/15));
  const newStart=HSTART*60+slot*15;
  const oldKey=_calDrag.key;
  const oldE=_calDrag.e;
  _calDrag=null;
  if(!oldE.auto) _calDoPlace(oldKey,newKey,oldE,newStart);
}
function _calDoPlace(oldKey,newKey,oldE,newStart){
  if(oldKey===newKey&&newStart===oldE.startMins){renderCal();return;}
  const dur=(oldE.endMins||0)-(oldE.startMins||0);
  const newEnd=newStart+dur;
  const origEnd=oldE.endMins||oldE.startMins;
  if(calEvents[oldKey]){
    calEvents[oldKey]=calEvents[oldKey].filter(e=>!(e.label===oldE.label&&e.startMins===oldE.startMins&&e.h===oldE.h));
    if(!calEvents[oldKey].length) delete calEvents[oldKey];
  }
  if(calEvents[newKey]){
    const dayEvs=calEvents[newKey];
    const cols=dayEvs.filter(e=>e.startMins<newEnd&&e.endMins>newStart);
    if(cols.length){
      cols.sort((a,b)=>a.startMins-b.startMins);
      const first=cols[0];
      const origGap=Math.max(0,first.startMins-origEnd);
      const pushAmt=Math.max(0,(newEnd-first.startMins)+origGap);
      if(pushAmt>0) dayEvs.forEach(e=>{if(e.startMins>=first.startMins){e.startMins+=pushAmt;e.endMins+=pushAmt;e.h=Math.floor(e.startMins/60);e.hEnd=Math.ceil(e.endMins/60);}});
    }
  }
  if(!calEvents[newKey]) calEvents[newKey]=[];
  calEvents[newKey].push({...oldE,startMins:newStart,endMins:newEnd,h:Math.floor(newStart/60),hEnd:Math.ceil(newEnd/60)});
  saveData('alfa_events',calEvents);
  showToast((oldE.label||'')+' → '+calFmt(newStart)+'–'+calFmt(newEnd));
  renderCal();
}
let _calTouchDrag=null;
function calEvTouchStart(ev,key,eEnc){
  const e=JSON.parse(decodeURIComponent(eEnc));
  if(e.auto) return;
  const t0=ev.touches[0];
  const sx=t0.clientX,sy=t0.clientY;
  let active=false,moved=false;
  const evEl=ev.currentTarget;
  const timer=setTimeout(()=>{
    if(moved) return;
    active=true;
    if(navigator.vibrate) navigator.vibrate(25);
    evEl.style.opacity='0.4';
    const g=document.createElement('div');
    g.id='_calTG';
    g.style.cssText='position:fixed;pointer-events:none;z-index:9999;opacity:0.88;border-radius:5px;padding:4px 10px;font-size:12px;font-weight:600;border-left:3px solid rgba(0,0,0,0.25);white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;'+calEvDim(e);
    g.textContent=calEvEmoji(e.type)+' '+(e.label||'');
    document.body.appendChild(g);
  },220);
  function move(mev){
    const t=mev.touches[0];
    if(!active){if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8){moved=true;clearTimeout(timer);}return;}
    mev.preventDefault();
    const g=document.getElementById('_calTG');
    if(g){g.style.left=(t.clientX-40)+'px';g.style.top=(t.clientY-40)+'px';}
  }
  function end(eev){
    clearTimeout(timer);
    document.removeEventListener('touchmove',move);
    document.removeEventListener('touchend',end);
    evEl.style.opacity='';
    const g=document.getElementById('_calTG');
    if(g) g.style.display='none';
    if(!active){if(g)g.remove();return;}
    const t=eev.changedTouches[0];
    const target=document.elementFromPoint(t.clientX,t.clientY);
    if(g) g.remove();
    if(!target||_roGuard()) return;
    const colEl=target.closest?target.closest('[data-calkey]'):null;
    if(!colEl) return;
    const newKey=colEl.getAttribute('data-calkey');
    const rect=colEl.getBoundingClientRect();
    const HSTART=(calView==='day')?4:6;
    const slot=Math.max(0,Math.round((t.clientY-rect.top)/15));
    _calDoPlace(key,newKey,e,HSTART*60+slot*15);
  }
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',end);
}
function calColClick(ev,key,colEl){
  if(ev.target!==colEl&&!ev.target.style.borderTop)return;
  const rect=colEl.getBoundingClientRect();
  const slot=Math.max(0,Math.round((ev.clientY-rect.top)/15));
  const presetMins=(calView==='day'?4:6)*60+slot*15;
  const h=Math.floor(presetMins/60);
  _calShowAddPicker(ev.clientX,ev.clientY,key,h,presetMins);
}

function _calShowAddPicker(x,y,dateKey,h,presetMins){
  const old=document.getElementById('cal-add-picker');
  if(old) old.remove();
  const d=document.createElement('div');
  d.id='cal-add-picker';
  d.style.cssText='position:fixed;z-index:600;background:#fff;border:1px solid #D3D1C7;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,0.18);padding:8px 10px;display:flex;gap:6px;align-items:center';
  const pw=240;
  d.style.left=Math.min(x,window.innerWidth-pw-8)+'px';
  d.style.top=Math.min(y+6,window.innerHeight-54)+'px';
  const actBtn='<button onclick="document.getElementById(\'cal-add-picker\').remove();openAppt(\''+dateKey+'\',null,'+h+')" style="padding:7px 12px;border:1px solid #D3D1C7;border-radius:7px;font-size:12px;font-weight:600;background:#fff;cursor:pointer;color:#2C2C2A;white-space:nowrap">&#9997;&#65039; Aktivitet</button>';
  const reiseBtn=typeof openReiseModalAt==='function'
    ?'<button onclick="document.getElementById(\'cal-add-picker\').remove();openReiseModalAt(\''+dateKey+'\','+presetMins+')" style="padding:7px 12px;border:1px solid #0C447C;border-radius:7px;font-size:12px;font-weight:600;background:#EEF4FB;cursor:pointer;color:#0C447C;white-space:nowrap">&#9992;&#65039; Reise</button>'
    :'';
  d.innerHTML=actBtn+reiseBtn+'<button onclick="this.parentElement.remove()" style="padding:3px 6px;border:none;background:none;font-size:15px;cursor:pointer;color:#888780;line-height:1">&#10005;</button>';
  document.body.appendChild(d);
  setTimeout(()=>{
    document.addEventListener('click',function _dp(e){if(!d.contains(e.target)){d.remove();document.removeEventListener('click',_dp);}},true);
  },10);
}

let _calResize=null;
function calResizeStart(ev,key,eEnc){
  ev.preventDefault();ev.stopPropagation();
  const e=JSON.parse(decodeURIComponent(eEnc));
  _calResize={key,e,origEnd:e.endMins,startY:ev.clientY};
  document.addEventListener('mousemove',calResizeMove);
  document.addEventListener('mouseup',calResizeEnd);
}
function calResizeMove(ev){
  if(!_calResize)return;
  const deltaSlots=Math.round((ev.clientY-_calResize.startY)/15);
  const newEnd=Math.max(_calResize.origEnd-(_calResize.origEnd-_calResize.e.startMins)+15,Math.min(_calResize.origEnd+deltaSlots*15,24*60));
  const evs=calEvents[_calResize.key]||[];
  const live=evs.find(e=>e.label===_calResize.e.label&&(e.startMins===_calResize.e.startMins||e.h===_calResize.e.h));
  if(live){live.endMins=newEnd;live.hEnd=Math.ceil(newEnd/60);}
  renderCal();
}
function calResizeEnd(){
  document.removeEventListener('mousemove',calResizeMove);
  document.removeEventListener('mouseup',calResizeEnd);
  if(!_calResize)return;
  saveData('alfa_events',calEvents);
  const evs=calEvents[_calResize.key]||[];
  const live=evs.find(e=>e.label===_calResize.e.label);
  if(live)showToast((live.label||'')+': '+calFmt(live.startMins)+'–'+calFmt(live.endMins));
  _calResize=null;
}

function renderWeek(body){
  const ws=new Date(calCursor);
  ws.setDate(calCursor.getDate()-mb(calCursor.getDay()));
  const days=[];
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);days.push(d);}
  const we=days[6];
  document.getElementById('cal-title').textContent=ws.getDate()+'. '+NO_MONTHS[ws.getMonth()]+' – '+we.getDate()+'. '+NO_MONTHS[we.getMonth()]+' '+we.getFullYear();
  const HSTART=6,HEND=22,SPH=4,SPX=15;
  const totalSlots=(HEND-HSTART)*SPH;
  const cols='48px repeat(7, 1fr)';
  let html='<div class="week-grid" style="grid-template-columns:'+cols+';overflow:hidden">';
  // Header bygges med NØYAKTIG samme flex-oppsett som rutenettet under
  // (48px tidskolonne + hverdager flex:1 + helg 8%), ellers forskyves kolonnene.
  html+='<div style="grid-column:1/-1;display:flex;border-bottom:1px solid #D3D1C7">';
  html+='<div style="width:48px;flex-shrink:0;background:#F8F7F3;border-right:1px solid #D3D1C7"></div>';
  days.forEach((d,i)=>{
    const tod=isToday(d.getFullYear(),d.getMonth(),d.getDate());
    const key=dk(d.getFullYear(),d.getMonth(),d.getDate());
    const hol=getHolidayName(key);
    const vac=getPersonalDay(key);
    const wknd=i>=5;
    const hflex=wknd?'0 0 8%':'1';
    const headerStyle = hol ? 'background:#FBE9E7;color:#C62828;' : (vac?'background:#FFF4E6;color:#BA7517;':'');
    const subLabel = hol ? '<div style="font-size:9px;font-weight:600;line-height:1;margin-top:2px;color:#C62828;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(hol)+'</div>' :
                     (vac?'<div style="font-size:9px;font-weight:600;line-height:1;margin-top:2px;color:#BA7517;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(vac.label||'Fridag')+'</div>':'');
    html+='<div class="week-day-hdr'+(tod?' is-today':'')+'" style="flex:'+hflex+';min-width:0;'+headerStyle+'" onclick="jumpToDay('+d.getFullYear()+','+d.getMonth()+','+d.getDate()+')"><span class="wdname">'+NO_SHORT[i]+'</span>'+d.getDate()+subLabel+'</div>';
  });
  html+='</div>';
  html+='<div style="grid-column:1/-1;display:flex;overflow-y:auto;max-height:540px;border-top:1px solid #D3D1C7">';
  html+='<div style="width:48px;flex-shrink:0;background:#F8F7F3;border-right:1px solid #D3D1C7">';
  for(let h=HSTART;h<HEND;h++){
    html+='<div style="height:60px;border-bottom:1px solid #D3D1C7;font-size:9px;color:#888780;text-align:right;padding:2px 4px 0 0;box-sizing:border-box">'+(h<10?'0':'')+h+':00</div>';
    for(let q=1;q<4;q++){html+='<div style="height:0;border-bottom:1px dashed #ECEAE4"></div>';}
  }
  html+='</div>';
  days.forEach((d,i)=>{
    const tod=isToday(d.getFullYear(),d.getMonth(),d.getDate());
    const wknd=i>=5;
    const key=dk(d.getFullYear(),d.getMonth(),d.getDate());
    const rawEvs=getEventsForDay(key);
    const allEvs=calAutoAddDrives(rawEvs,key);
    const normEvs=allEvs.map(e=>{if(e.startMins!==undefined)return e;return{...e,startMins:(e.h||8)*60,endMins:(e.hEnd?e.hEnd*60:((e.h||8)+1)*60)};});
    const laid=calLayoutOverlap(normEvs,HSTART,HEND);
    const flex=wknd?'0 0 8%':'1';
    const totalH=totalSlots*SPX;
    html+='<div data-calkey="'+key+'" style="flex:'+flex+';position:relative;min-width:0;height:'+totalH+'px;'+(wknd?'background:#F8F7F3;':'')+(tod?'background:rgba(25,118,210,0.025);':'')+'border-left:1px solid #D3D1C7;" ondragover="calDragOver(event,\''+key+'\',this)" ondragleave="calDragLeave(event,\''+key+'\')" ondrop="calDrop(event,\''+key+'\',this)" onclick="calColClick(event,\''+key+'\',this)">';
    for(let s=0;s<totalSlots;s++){const isH=(s%SPH===0);html+='<div style="position:absolute;left:0;right:0;top:'+(s*SPX)+'px;border-top:1px '+(isH?'solid #D3D1C7':'dashed #ECEAE4')+';pointer-events:none"></div>';}
    html+='<div id="wkghost-'+key+'" style="display:none;position:absolute;left:2px;right:2px;background:rgba(25,118,210,0.12);border:2px dashed #1976D2;border-radius:4px;pointer-events:none;z-index:2"></div>';
    laid.forEach(e=>{
      const cc=calEvClass(e.type);
      const emoji=calEvEmoji(e.type);
      const startSlot=Math.round((e.startMins-HSTART*60)/15);
      const endSlot=Math.round((e.endMins-HSTART*60)/15);
      const topPx=startSlot*SPX;
      const durPx=(endSlot-startSlot)*SPX-2;
      const isDrive=e.type==='drive-auto';
      const heightPx=Math.max(durPx,isDrive?32:SPX);
      const isCompact=isDrive&&durPx<32;
      const wPct=100/(e._cols||1);
      const lPct=(e._col||0)*wPct;
      const showTime=heightPx>=24&&!isCompact;
      const showMaps=isDrive;
      const eEnc=encodeURIComponent(JSON.stringify(e));
      html+='<div class="'+cc+'" draggable="true" ondragstart="calEvDragStart(event,\''+key+'\',\''+eEnc+'\')" ondragend="calEvDragEnd()" ontouchstart="calEvTouchStart(event,\''+key+'\',\''+eEnc+'\')" onclick="event.stopPropagation();handleEvClick(event,\''+key+'\',\''+eEnc+'\')" title="'+(e.label||'').replace(/"/g,'&quot;')+'" style="position:absolute;top:'+topPx+'px;height:'+heightPx+'px;left:calc('+lPct+'% + 2px);width:calc('+wPct+'% - 4px);border-radius:4px;'+(isDrive?'padding:2px 52px 2px 5px;':'padding:2px 5px;')+'font-size:10px;font-weight:600;overflow:hidden;border-left:3px solid rgba(0,0,0,0.2);z-index:3;box-sizing:border-box;cursor:grab;'+calEvDim(e)+'">'+calBookedMark(e)+emoji+' '+(e.label||'');
      if(showTime) html+='<span style="font-size:9px;font-weight:400;opacity:0.75;display:block">'+calFmt(e.startMins)+'–'+calFmt(e.endMins)+'</span>';
      if(e.type==='flight'&&e.bookingRef) html+='<span style="font-size:9px;font-weight:500;opacity:0.85;display:block">'+escapeHtml(e.bookingRef)+'</span>';
      if(showMaps){const mf=encodeURIComponent(e.mapsFrom||'');const mt=encodeURIComponent(e.mapsTo||'');html+='<a onclick="event.stopPropagation()" href="https://www.google.com/maps/dir/'+mf+'/'+mt+'" target="_blank" style="position:absolute;top:3px;right:4px;font-size:9px;color:#1565C0;white-space:nowrap;text-decoration:underline;background:rgba(255,255,255,0.88);border-radius:3px;padding:1px 3px;line-height:1.3;cursor:pointer">🗺 Maps ↗</a>';}
      const _siW=_calStatusIcons(e,key);
      if(_siW) html+='<span style="font-size:9px;display:block;opacity:0.85;line-height:1.2">'+_siW+'</span>';
      html+='<div onmousedown="calResizeStart(event,\''+key+'\',\''+eEnc+'\')" style="position:absolute;bottom:0;left:0;right:0;height:5px;cursor:s-resize;background:rgba(0,0,0,0.12);border-radius:0 0 3px 3px"></div>';
      html+='</div>';
    });
    html+='</div>';
  });
  html+='</div></div>';
  body.innerHTML=html;
}

// Bygger HTML for dagvisning. readOnly=true: ingen drag/resize/ny-hendelse-klikk/fridag-knapp.
// Kalles av renderDay() (readOnly=false) og dashbordet (readOnly=true, TODAY_STR).
function buildDayViewHtml(key, readOnly){
  const parts=key.split('-');
  const y=+parts[0],m=+parts[1]-1,d=+parts[2];
  const col=mb(new Date(y,m,d).getDay());
  const HSTART=4,HEND=24,SPH=4,SPX=15;
  const totalSlots=(HEND-HSTART)*SPH;
  const rawEvs=getEventsForDay(key);
  const allEvs=calAutoAddDrives(rawEvs,key);
  const normEvs=allEvs.map(e=>{if(e.startMins!==undefined)return e;return{...e,startMins:(e.h||8)*60,endMins:(e.hEnd?e.hEnd*60:((e.h||8)+1)*60)};});
  const laid=calLayoutOverlap(normEvs,HSTART,HEND);
  const dayHoliday=getHolidayName(key);
  const dayVacation=getPersonalDay(key);

  // Tom dag i dashbord-modus: vis banner eller enkel melding
  if(readOnly && laid.length===0){
    if(dayHoliday) return '<div style="background:#FBE9E7;border:1px solid #C62828;color:#C62828;padding:12px 14px;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🎉</span><span>'+escapeHtml(dayHoliday)+' — offentlig fridag</span></div>';
    if(dayVacation) return '<div style="background:#FFF4E6;border:1px solid #BA7517;color:#6D4C00;padding:12px 14px;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🌴</span><span>'+escapeHtml(dayVacation.label||'Fridag')+(dayVacation.note?' — '+escapeHtml(dayVacation.note):'')+' </span></div>';
    return '<div style="padding:20px;text-align:center;color:#888780;font-size:13px">Ingen avtaler i dag</div>';
  }

  const totalH=totalSlots*SPX;
  const maxH=readOnly?360:580;
  let html='<div class="day-view"><div class="day-view-hdr"><span class="day-view-date">'+d+'. '+NO_MONTHS[m]+'</span><span class="day-view-lbl">'+NO_LONG[col]+(isToday(y,m,d)?' · I dag':'')+'</span></div>';

  // Helligdag- eller fridag-banner
  if(dayHoliday){
    html+='<div style="background:#FBE9E7;border:1px solid #C62828;color:#C62828;padding:10px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🎉</span><span>'+escapeHtml(dayHoliday)+' — offentlig fridag</span></div>';
  } else if(dayVacation){
    const rmBtn=readOnly?'':'<button class="btn btn-light btn-sm" onclick="removePersonalDay(\''+key+'\')" style="color:#A23B27;font-size:11px">× Fjern</button>';
    html+='<div style="background:#FFF4E6;border:1px solid #BA7517;color:#6D4C00;padding:10px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px"><div><span style="font-size:18px">🌴</span> '+escapeHtml(dayVacation.label||'Fridag')+(dayVacation.note?' <span style="font-weight:400;color:#5F5E5A">— '+escapeHtml(dayVacation.note)+'</span>':'')+'</div>'+rmBtn+'</div>';
  } else if(!readOnly){
    html+='<div style="margin:6px 0;text-align:right"><button class="btn btn-light btn-sm" onclick="addPersonalDay(\''+key+'\')" style="font-size:11px;color:#888780">+ Registrer fridag/ferie</button></div>';
  }

  html+='<div style="display:flex;overflow-y:auto;max-height:'+maxH+'px">';
  html+='<div style="width:52px;flex-shrink:0;background:#F8F7F3;border-right:1px solid #D3D1C7">';
  for(let h=HSTART;h<HEND;h++){html+='<div style="height:60px;border-bottom:1px solid #D3D1C7;font-size:10px;color:#888780;text-align:right;padding:2px 6px 0 0;box-sizing:border-box">'+(h<10?'0':'')+h+':00</div>';}
  html+='</div>';

  // Grid-kolonne: interaktiv (kalender) eller read-only (dashbord)
  if(readOnly){
    html+='<div style="flex:1;position:relative;height:'+totalH+'px">';
  } else {
    html+='<div data-calkey="'+key+'" style="flex:1;position:relative;height:'+totalH+'px" ondragover="calDragOver(event,\''+key+'\',this)" ondragleave="calDragLeave(event,\''+key+'\')" ondrop="calDrop(event,\''+key+'\',this)" onclick="calColClick(event,\''+key+'\',this)">';
    html+='<div id="wkghost-'+key+'" style="display:none;position:absolute;left:4px;right:4px;background:rgba(25,118,210,0.12);border:2px dashed #1976D2;border-radius:4px;pointer-events:none;z-index:2"></div>';
  }

  for(let s=0;s<totalSlots;s++){const isH=(s%SPH===0);html+='<div style="position:absolute;left:0;right:0;top:'+(s*SPX)+'px;border-top:1px '+(isH?'solid #D3D1C7':'dashed #ECEAE4')+';pointer-events:none"></div>';}

  // Pre-pass: compute effective topPx per column so min-height bumps don't cause visual overlap
  const MIN_H=44;
  const _effTop=new Map();
  {
    const byCol={};
    laid.forEach(e=>{
      const c=e._col||0;
      if(!byCol[c]) byCol[c]=[];
      byCol[c].push(e);
    });
    Object.values(byCol).forEach(col=>{
      col.sort((a,b)=>a.startMins-b.startMins);
      let colBottom=0;
      col.forEach(e=>{
        const ss=Math.round((e.startMins-HSTART*60)/15);
        const es=Math.round((e.endMins-HSTART*60)/15);
        const naturalTop=ss*SPX;
        const top=Math.max(naturalTop,colBottom);
        _effTop.set(e,top);
        colBottom=top+Math.max((es-ss)*SPX-3,MIN_H);
      });
    });
  }

  laid.forEach(e=>{
    const cc=calEvClass(e.type);
    const emoji=calEvEmoji(e.type);
    const startSlot=Math.round((e.startMins-HSTART*60)/15);
    const endSlot=Math.round((e.endMins-HSTART*60)/15);
    const topPx=_effTop.has(e)?_effTop.get(e):startSlot*SPX;
    const durPx=(endSlot-startSlot)*SPX-3;
    const isDrive=e.type==='drive-auto';
    const heightPx=Math.max(durPx,MIN_H);
    const isCompact=durPx<MIN_H;
    const wPct=100/(e._cols||1);
    const lPct=(e._col||0)*wPct;
    const eEnc=encodeURIComponent(JSON.stringify(e));
    const showTime=!isCompact;
    const showMaps=isDrive;
    const cursor=readOnly?'pointer':'grab';
    const dragAttrs=readOnly?'':' draggable="true" ondragstart="calEvDragStart(event,\''+key+'\',\''+eEnc+'\')" ondragend="calEvDragEnd()" ontouchstart="calEvTouchStart(event,\''+key+'\',\''+eEnc+'\')"';
    html+='<div class="'+cc+'"'+dragAttrs+' onclick="event.stopPropagation();handleEvClick(event,\''+key+'\',\''+eEnc+'\')" title="'+(e.label||'').replace(/"/g,'&quot;')+'" style="position:absolute;top:'+topPx+'px;height:'+heightPx+'px;left:calc('+lPct+'% + 4px);width:calc('+wPct+'% - 8px);border-radius:5px;'+(isDrive?'padding:4px 80px 4px 8px;':'padding:4px 8px;')+'font-size:12px;font-weight:600;overflow:hidden;border-left:3px solid rgba(0,0,0,0.2);z-index:3;box-sizing:border-box;cursor:'+cursor+';'+calEvDim(e)+'">'+calBookedMark(e)+emoji+' '+(e.label||'');
    if(showTime) html+='<span style="font-size:10px;font-weight:400;opacity:0.75;display:block">'+calFmt(e.startMins)+'–'+calFmt(e.endMins)+'</span>';
    if(e.type==='flight'&&e.bookingRef) html+='<span style="font-size:10px;font-weight:500;opacity:0.85;display:block">'+escapeHtml(e.bookingRef)+'</span>';
    if(showMaps){const mf=encodeURIComponent(e.mapsFrom||'');const mt=encodeURIComponent(e.mapsTo||'');html+='<a onclick="event.stopPropagation()" href="https://www.google.com/maps/dir/'+mf+'/'+mt+'" target="_blank" style="position:absolute;top:5px;right:6px;font-size:11px;color:#1565C0;white-space:nowrap;text-decoration:underline;background:rgba(255,255,255,0.9);border-radius:3px;padding:1px 4px;line-height:1.3;cursor:pointer">🗺 Maps ↗</a>';}
    const _siD=_calStatusIcons(e,key);
    if(_siD) html+='<span style="font-size:11px;display:block;margin-top:2px;line-height:1;opacity:0.85">'+_siD+'</span>';
    if(!readOnly) html+='<div onmousedown="calResizeStart(event,\''+key+'\',\''+eEnc+'\')" style="position:absolute;bottom:0;left:0;right:0;height:6px;cursor:s-resize;background:rgba(0,0,0,0.12);border-radius:0 0 4px 4px"></div>';
    html+='</div>';
  });
  html+='</div></div></div>';
  return html;
}

function renderDay(body){
  const y=calCursor.getFullYear(),m=calCursor.getMonth(),d=calCursor.getDate();
  const col=mb(new Date(y,m,d).getDay());
  document.getElementById('cal-title').textContent=NO_LONG[col]+' '+d+'. '+NO_MONTHS[m]+' '+y;
  body.innerHTML=buildDayViewHtml(dk(y,m,d), false);
}

function jumpToDay(y,m,d){
  calCursor=new Date(y,m,d);
  calView='day';
  document.querySelectorAll('.vt-btn').forEach((b,i)=>b.classList.toggle('active',i===2));
  renderCal();
}

// ─── DRIVE MODAL ────────────────────────────────────────────────────────────

function openDriveModal(title, from, to, dist, dateKey, startMins, evType, evLabel){
  const r = getRouteInfo(from, to);
  const min = r?r.min:0;
  const km = r?r.km:0;
  const ferry = r?r.ferry:null;
  const isEstimate = r && r.estimated;
  // Tidsformat: "2t 15min" eller "45 min"
  function fmtTime(m){
    if(!m) return '–';
    const h = Math.floor(m/60), mm = m%60;
    if(h===0) return mm+' min';
    if(mm===0) return h+'t';
    return h+'t '+mm+'min';
  }
  const timeStr = fmtTime(min);
  const routeStr = from && to ? from+' – '+to : (title||'Kjøring');

  const callsForThisDrive = getCallSuggestionsForDrive(dateKey, from, to);
  const box = document.getElementById('drive-modal').querySelector('.modal-box');

  let html = '<div class="modal-title">🚗 '+escapeHtml(routeStr)+'</div>';
  html += '<div class="modal-sub">'+escapeHtml(timeStr+(km?' · '+km+' km':''))+(isEstimate?' <span style="color:#BA7517;font-weight:600">· estimat</span>':'')+'</div>';

  // Info-blokk
  html += '<div style="background:#F8F7F3;border:1px solid #D3D1C7;border-radius:10px;padding:14px;margin-bottom:14px">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  html += '<div><div style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">⏱ Tid</div><div style="font-size:18px;font-weight:700;color:#2C2C2A">'+escapeHtml(timeStr)+'</div></div>';
  html += '<div><div style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">📏 Distanse</div><div style="font-size:18px;font-weight:700;color:#2C2C2A">'+(km?escapeHtml(km+' km'):'–')+'</div></div>';
  html += '</div>';
  if(isEstimate){
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #D3D1C7;font-size:11px;color:#BA7517"><strong>⚠ Estimat:</strong> Strekningen mangler i ruteboken — tall er beregnet fra fugleflukt × 1,4. Sjekk Google Maps for nøyaktig tid.</div>';
  }
  html += '</div>';

  // Rute-visualisering
  html += '<div class="route-display"><div class="route-display-stop"><div class="route-dot"></div><span>'+escapeHtml(from||'Start')+'</span></div><div class="route-line"></div><div class="route-display-stop"><div class="route-dot end"></div><span>'+escapeHtml(to||'Slutt')+'</span></div></div>';

  // Ferge
  if(ferry){
    html += '<div style="background:#E6F1FB;border:1px solid #B8D4E8;border-radius:10px;padding:12px;margin-bottom:14px">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">⛴</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#0C447C">Ferge: '+escapeHtml(ferry.name)+'</div><div style="font-size:11px;color:#5F5E5A">'+escapeHtml(ferry.op)+'</div></div></div>';
    html += '<a href="'+escapeHtml(ferry.url)+'" target="_blank" rel="noopener" style="display:inline-block;font-size:12px;color:#0C447C;font-weight:600;text-decoration:underline">📅 Se fergetider ↗</a>';
    html += '</div>';
  }

  // Ringeforslag
  if(callsForThisDrive && callsForThisDrive.length>0){
    html += '<div style="background:#FAEEDA;border:1px solid #E6D9B8;border-radius:10px;padding:12px;margin-bottom:14px">';
    html += '<div style="font-size:11px;font-weight:700;color:#6D4C00;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">📞 Ringeforslag på kjøreturen ('+callsForThisDrive.length+' kunder)</div>';
    callsForThisDrive.forEach(cc=>{
      const contact=(cc.contacts&&cc.contacts[0])?cc.contacts[0]:null;
      const phone=cc.phone||(contact?contact.phone:'')||'';
      const contactName=contact?contact.name:(cc.phone?'Direkte':'–');
      html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid #E6D9B8;font-size:12px;color:#2C2C2A;gap:8px"><div style="flex:1;min-width:0"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(cc.name)+'</div><div style="font-size:10px;color:#888780;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(contactName)+'</div></div>'+(phone?'<a href="tel:'+phone+'" style="color:#0C447C;font-weight:600;text-decoration:none;font-size:13px;flex-shrink:0">'+escapeHtml(phone)+'</a>':'<span style="color:#888780;font-size:11px">ingen tlf</span>')+'</div>';
    });
    html += '</div>';
  } else {
    html += '<div style="background:#F8F7F3;border:1px dashed #D3D1C7;border-radius:10px;padding:10px;margin-bottom:14px;font-size:11px;color:#888780;text-align:center">📞 Ingen ringeforslag — sørg for at kundene har registrert telefonnummer</div>';
  }

  // Maps-knapp
  const url = 'https://www.google.com/maps/dir/'+encodeURIComponent((from||'')+', Norge')+'/'+encodeURIComponent((to||'')+', Norge');
  html += '<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener" style="text-decoration:none;display:block;margin-bottom:8px"><button class="maps-btn-big" type="button">🗺 Åpne i Google Maps →</button></a>';
  if(evType && startMins !== undefined && !window._viewOnlyMode){
    const _evStart = startMins !== undefined ? startMins : 0;
    const _safeDelLbl = (evLabel||title||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    html += '<button type="button" class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8;width:100%;margin-bottom:8px" onclick="closeDriveModal();deleteCalEventGeneric(\''+dateKey+'\','+_evStart+',\''+evType+'\',\''+_safeDelLbl+'\')">🗑 Fjern kjøreetappe fra kalender</button>';
  }
  html += '<button class="modal-close" type="button" id="drive-modal-close-btn">Lukk</button>';
  box.innerHTML = html;

  // Bind lukkeknapp eksplisitt
  const closeBtn = document.getElementById('drive-modal-close-btn');
  if(closeBtn){
    closeBtn.addEventListener('click', function(ev){ ev.stopPropagation(); closeDriveModal(); });
    closeBtn.addEventListener('touchend', function(ev){ ev.preventDefault(); ev.stopPropagation(); closeDriveModal(); });
  }
  document.getElementById('drive-modal').classList.add('open');
}


// Hent ringeforslag for én bestemt kjøretur — totalt 10 ringbare kunder per dag,
// fordelt over alle kjøreturer >=15 min på dagen.
function getCallSuggestionsForDrive(dateKey, from, to){
  // Bygg pool av ringbare kunder med telefon (direkte eller via kontaktperson)
  let dayCustomerNames = new Set();
  let drives = [];
  if(dateKey){
    const dayEvs = (calEvents[dateKey]||[]);
    drives = dayEvs.filter(e=>e.type==='drive'||e.type==='drive-auto'||(e.type==='visit'&&e.label)).sort((a,b)=>(a.startMins||(a.h||8)*60)-(b.startMins||(b.h||8)*60));
    dayCustomerNames = new Set(dayEvs.filter(e=>e.type==='visit').map(e=>e.label));
  }
  // Eksluder også fra/til-byene fra ringepoolen — disse besøker du allerede
  const callPool = getCustomers().filter(c=>{
    if(dayCustomerNames.has(c.name)) return false;
    if(!(c.phone||(c.contacts||[]).some(p=>p.phone))) return false;
    return true;
  });
  callPool.sort((a,b)=>(b.l12||0)-(a.l12||0));
  const totalCalls = Math.min(10, callPool.length);
  if(totalCalls===0) return [];
  // Hvis ingen kjøretur-events i kalenderen, returner de 3 første som forslag
  const driveEvents = drives.filter(d=>d.type==='drive'||d.type==='drive-auto');
  if(driveEvents.length===0) return callPool.slice(0, Math.min(3, totalCalls));
  // Finn hvilken kjøretur dette er
  const thisIdx = driveEvents.findIndex(d=>{
    const dFrom = (d.from||d.mapsFrom||'').toLowerCase();
    const dTo = (d.to||d.mapsTo||'').toLowerCase();
    if(dFrom===((from||'').toLowerCase()) && dTo===((to||'').toLowerCase())) return true;
    if(d.label && d.label.toLowerCase().indexOf((from||'').toLowerCase())>=0 && d.label.toLowerCase().indexOf((to||'').toLowerCase())>=0) return true;
    return false;
  });
  if(thisIdx<0) return callPool.slice(0, Math.min(3, totalCalls));
  // Fordel 10 kunder jevnt mellom alle kjøreturer
  const perDrive = Math.ceil(totalCalls/driveEvents.length);
  const start = thisIdx * perDrive;
  return callPool.slice(start, Math.min(start+perDrive, totalCalls));
}

function closeDriveModal(){ document.getElementById('drive-modal').classList.remove('open'); }
document.getElementById('drive-modal').addEventListener('click',function(e){ if(e.target===this) closeDriveModal(); });
function fillQuarterHourSlots(selectEl, defaultVal){
  const opts=[];
  for(let h=6; h<=23; h++){
    for(let m of [0,15,30,45]){
      if(h===23 && m>0) continue;
      const hh=String(h).padStart(2,'0');
      const mm=String(m).padStart(2,'0');
      opts.push(hh+':'+mm);
    }
  }
  selectEl.innerHTML=opts.map(o=>'<option value="'+o+'">'+o+'</option>').join('');
  if(defaultVal && opts.includes(defaultVal)) selectEl.value=defaultVal;
}
function fillHalfHourSlots(selectEl, defaultVal){ fillQuarterHourSlots(selectEl, defaultVal); }
// ─── PDF EXPORT ─────────────────────────────────────────────────────────────

function exportPDF(){
  const allVisits=[...visits].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);
  const tMap={visit:'Kundebesøk',nydalen:'Besøk Nydalen',phone:'Telefonsamtale',clinic:'Clinic',dinner:'Kundemiddag'};
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Alfa Sko Aktivitetsrapport</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#2C2C2A;font-size:13px}h1{font-size:24px;font-weight:700;margin-bottom:4px}h2{font-size:15px;font-weight:700;margin:24px 0 10px;border-bottom:2px solid #2C2C2A;padding-bottom:4px}.meta{color:#888780;font-size:12px;margin-bottom:30px}.visit{margin-bottom:18px;padding:14px;border:1px solid #D3D1C7;border-radius:8px}.vhdr{display:flex;justify-content:space-between;margin-bottom:8px}.vhdr-name{font-weight:700;font-size:14px}.vhdr-date{color:#888780;font-size:12px}.vtype{font-size:11px;color:#0C447C;background:#E6F0FA;padding:2px 8px;border-radius:99px;display:inline-block;margin-top:4px}.vmeta{font-size:12px;color:#888780;margin:6px 0}.vnotes{line-height:1.6}.vnotes-empty{color:#888780;font-style:italic}.vfollow{margin-top:8px;padding:6px 10px;background:#FAEEDA;border-radius:6px;font-size:12px;color:#633806}.footer{margin-top:40px;padding-top:14px;border-top:1px solid #D3D1C7;font-size:11px;color:#888780;text-align:center}@media print{body{margin:20px}}</style></head><body><h1>Alfa Kompass · Aktivitetsrapport</h1><div class="meta">Generert: ${new Date().toLocaleDateString('no-NO')}</div><h2>Aktiviteter</h2>${allVisits.length===0?'<p>Ingen aktiviteter registrert.</p>':allVisits.map(v=>`<div class="visit"><div class="vhdr"><div><div class="vhdr-name">${v.customer}</div><div class="vtype">${tMap[v.type]||tMap.visit}</div></div><div class="vhdr-date">${v.date.split('-').reverse().join('.')} · ${v.time||''}${v.timeEnd?' – '+v.timeEnd:''}</div></div><div class="vmeta">Kontakt: ${v.contact||'–'}</div>${v.notes?`<div class="vnotes">${v.notes}</div>`:'<div class="vnotes vnotes-empty">Ingen notat</div>'}${v.followup?`<div class="vfollow">Oppfølging: ${v.followup}</div>`:''}</div>`).join('')}<div class="footer">Alfa · Konfidensielt — walk with us</div></body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='alfa-sko-rapport-'+TODAY_STR+'.html';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Rapport lastet ned — trykk Ctrl+P for PDF');
}

// ─── TOAST ──────────────────────────────────────────────────────────────────

function buildCalendarICS(events, fromDate){
  const stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  let out=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Alfa Kompass//Feltverktoy//NO','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Alfa Kompass'];
  let count=0;
  Object.keys(events||{}).sort().forEach(function(dateKey){
    if(fromDate && dateKey<fromDate) return;
    (events[dateKey]||[]).forEach(function(e){
      const start = (e.startMins!=null)?e.startMins:((e.h!=null)?e.h*60:480);
      const end = (e.endMins!=null)?e.endMins:start+60;
      const uid='kompass-'+_icsHash(dateKey+'|'+start+'|'+(e.label||''))+'@alfakompass';
      const summary=_icsEscape(e.label||'Aktivitet');
      const loc=_icsEscape(e.city||'');
      const descParts=[];
      if(e.agenda) descParts.push(e.agenda);
      if(e.contact) descParts.push('Kontakt: '+e.contact);
      if(e.type==='visit' && e.appointed===false) descParts.push('(Uanmeldt)');
      const desc=_icsEscape(descParts.join('\n'));
      out.push('BEGIN:VEVENT');
      out.push(_icsFold('UID:'+uid));
      out.push('DTSTAMP:'+stamp);
      out.push('DTSTART:'+_icsLocalDT(dateKey,start));
      out.push('DTEND:'+_icsLocalDT(dateKey,end));
      out.push(_icsFold('SUMMARY:'+summary));
      if(loc) out.push(_icsFold('LOCATION:'+loc));
      if(desc) out.push(_icsFold('DESCRIPTION:'+desc));
      out.push('END:VEVENT');
      count++;
    });
  });
  out.push('END:VCALENDAR');
  return {ics: out.join('\r\n'), count: count};
}
function exportCalendarICS(){
  const fromDate = (typeof TODAY_STR!=='undefined')?TODAY_STR:new Date().toISOString().slice(0,10);
  const res = buildCalendarICS(calEvents, fromDate);
  if(res.count===0){ showToast('Ingen kommende hendelser å eksportere'); return; }
  try{
    const blob=new Blob([res.ics],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='alfa-kompass.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1500);
    showToast('Eksporterte '+res.count+' hendelser — apne filen i Outlook');
  }catch(err){ showToast('Kunne ikke lage fil: '+err.message); }
}
// ─── EVENT POPUP ─────────────────────────────────────────────────────────────

async function _loadEvPopupPhotos(v){
  var el = document.getElementById('ev-popup-photos');
  if(!el) return;
  var photos = await getStoragePhotosForVisit(v);
  if(!photos.length) return;
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px">'
    + photos.map(function(p){
        var safeUrl=p.url.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        var safeName=p.name.replace(/'/g,"\\'");
        return '<div style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid #D3D1C7;position:relative">'
          +'<img src="'+p.url+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" alt="'+p.name+'" onclick="viewPhoto(\''+safeUrl+'\',\''+safeName+'\')">'
          +(p.path?'<button onclick="deleteSingleVisitPhoto(\''+v.id+'\',\''+p.path.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
          +'</div>';
      }).join('')
    + '</div>';
}

function handleEvClick(evt, dateKey, evJsonEncoded){
  evt.stopPropagation();
  const e = JSON.parse(decodeURIComponent(evJsonEncoded));
  if(e.reiseEvent && typeof openReiseEditor === 'function'){
    openReiseEditor(dateKey, e);
    return;
  }
  if(e.type==='drive-auto'){
    openEvPopup(evt, dateKey, e);
    return;
  }
  if(e.type==='drive'){
    // Bygg from/to: bruk mapsFrom/mapsTo først, ellers parse label "X → Y"
    let from = e.from || e.mapsFrom || '';
    let to = e.to || e.mapsTo || '';
    if((!from || !to) && e.label && e.label.includes('→')){
      const parts = e.label.split('→').map(s=>s.trim());
      from = from || parts[0] || '';
      to = to || parts[1] || '';
    }
    openDriveModal(e.label||'Kjøring', from, to, e.dist||'', dateKey, e.startMins, e.type, e.label);
    return;
  }
  openEvPopup(evt, dateKey, e);
}


// Tidsredigeringsrad i event-popup: endre start/slutt fritt (også før 08:00)
function _evTimeEditRow(dateKey, e){
  if(window._viewOnlyMode) return '';
  const f=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
  const roundQ=m=>Math.round(m/15)*15;
  const lbl=(e.label||'').replace(/'/g,"\\'");
  const qOpts=[];
  for(let h=6;h<=23;h++){ for(let m of [0,15,30,45]){ if(h===23&&m>0) continue; qOpts.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')); } }
  const mkSel=(id,val)=>'<select id="'+id+'" style="padding:5px 7px;border:1px solid #D3D1C7;border-radius:7px;font-size:12px">'+qOpts.map(o=>'<option value="'+o+'"'+(o===val?' selected':'')+'>'+o+'</option>').join('')+'</select>';
  const sVal=f(Math.min(roundQ(e.startMins||0),23*60));
  const eVal=f(Math.min(roundQ(e.endMins||((e.startMins||0)+60)),23*60));
  return '<div style="display:flex;gap:6px;align-items:center;padding:10px 0 0;flex-wrap:wrap">'+
    '<span style="font-size:11px;font-weight:600;color:#5F5E5A">🕐 Tid:</span>'+
    mkSel('ev-edit-start',sVal)+
    '<span style="color:#888780">–</span>'+
    mkSel('ev-edit-end',eVal)+
    '<button class="btn btn-dark btn-sm" onclick="saveEvTimes(\''+dateKey+'\','+(e.startMins||0)+',\''+lbl+'\')">Lagre tid</button>'+
    '</div>';
}

function saveEvTimes(dateKey, oldStart, label){
  if(_roGuard()) return;
  const sv=(document.getElementById('ev-edit-start')||{}).value||'';
  const ev2=(document.getElementById('ev-edit-end')||{}).value||'';
  const pm=t=>{const mm=t.match(/^(\d{1,2}):(\d{2})$/);return mm?parseInt(mm[1])*60+parseInt(mm[2]):null;};
  const ns=pm(sv), ne=pm(ev2);
  if(ns===null || ne===null){ showToast('Ugyldig tid'); return; }
  if(ne<=ns){ showToast('Sluttid må være etter starttid'); return; }
  const evs=calEvents[dateKey]||[];
  const ev=evs.find(x=>x.startMins===oldStart && (x.label||'')===label);
  if(!ev){ showToast('Fant ikke oppføringen'); return; }
  ev.startMins=ns; ev.endMins=ne;
  ev.h=Math.floor(ns/60); ev.hEnd=Math.ceil(ne/60);
  saveData('alfa_events', calEvents);
  closeEvPopup();
  renderCal();
  showToast('Tid endret: '+sv+'–'+ev2);
}

function _calPrivBtn(dateKey, e){
  if(window._viewOnlyMode) return '';
  const lbl = (e.label||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const isPriv = e.private === true;
  return '<button class="btn btn-sm" onclick="toggleCalPrivate(\''+dateKey+'\','+(e.startMins||0)+',\''+lbl+'\')" style="'+(isPriv?'background:#5F5E5A;color:#fff;border:none':'background:#F8F7F3;border:1px solid #D3D1C7;color:#5F5E5A')+'" title="'+(isPriv?'Privat — klikk for å gjøre synlig for team':'Jobb-avtale — klikk for å gjøre privat')+'">'+(isPriv?'🔒':'🌐')+'</button>';
}

function openEvPopup(evt, dateKey, e){
  closeEvPopup();
  const popup = document.getElementById('ev-popup');
  const dateStr = dateKey.split('-').reverse().join('.');
  const SIMPLE_TYPES = ['adm','lunch','dinner','training','leisure','teams','phone','external','nydalen','clinic','drive','drive-auto','other','hotel-start'];
  if(e.type==='hotel' || e.type==='flight' || e.type==='rental' || e.type==='ferry'){
    const isBooked = e.booked===true;
    const icon = e.type==='hotel' ? '🏨' : e.type==='rental' ? '🚙' : e.type==='ferry' ? '⛴️' : '✈️';
    const bookBtn = '<button class="btn btn-sm" onclick="toggleCalBooked(\''+dateKey+'\','+e.startMins+',\''+(e.label||'').replace(/'/g,"\\'")+'\')" style="'+(isBooked?'background:#1A5C3A;color:#fff':'background:#FFF6E6;color:#6D4C00;border:1px solid #E6D9B8')+'">'+(isBooked?'✓ Bestilt':'Merk som bestilt')+'</button>';
    const delBtnTravel = '<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEventGeneric(\''+dateKey+'\','+e.startMins+',\''+e.type+'\',\''+(e.label||'').replace(/'/g,"\\'")+'\')">🗑 Fjern</button>';
    popup.innerHTML = `<div class="ev-popup-hdr" style="background:#185FA5"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">${icon} ${e.label}</div><div class="ev-popup-hdr-sub">${dateStr}${isBooked?' · ✓ bestilt':' · ikke bestilt'}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-actions" style="padding-top:12px;display:flex;gap:6px">${bookBtn}${delBtnTravel}${_calPrivBtn(dateKey,e)}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
  } else if(SIMPLE_TYPES.includes(e.type)){
    const _safeEvLbl = (e.label||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const _delOrNote = e.type==='drive-auto'
      ? '<div style="font-size:11px;color:#888780;padding:4px 0 2px">Kjøretid beregnes automatisk mellom besøk og kan ikke slettes direkte — flytt eller slett ett av besøkene.</div>'
      : '<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEventGeneric(\''+dateKey+'\','+e.startMins+',\''+e.type+'\',\''+_safeEvLbl+'\')">🗑 Fjern</button>';
    popup.innerHTML = `<div class="ev-popup-hdr" style="background:#5F5E5A"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">${calEvEmoji(e.type)} ${e.label}</div><div class="ev-popup-hdr-sub">${dateStr} · ${calFmt(e.startMins)}–${calFmt(e.endMins)}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-actions" style="padding-top:12px;display:flex;gap:6px;flex-wrap:wrap">${_delOrNote}${_calPrivBtn(dateKey,e)}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
  } else {
    const cname = e.label;
    const c = getCustomers().find(c=>c.name===cname)||{};
    const v = visits.filter(v=>v.customer===cname).sort((a,b)=>b.date.localeCompare(a.date));
    const todayV = v.find(x=>x.date===dateKey);
    const lastV = todayV||v[0];
    const openF = followups.filter(f=>f.customer===cname&&!f.done);
    const bCls = c.class==='A'?'badge-a':c.class==='B'?'badge-b':c.class==='C'?'badge-c':'badge-new';
    const bLbl = c.class==='A'?'A':c.class==='B'?'B':c.class==='C'?'C':'Ny';
    const safeName = cname.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    popup.innerHTML = `<div class="ev-popup-hdr"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">🏪 ${cname}</div><div class="ev-popup-hdr-sub">${dateStr}${e.h!==undefined?' · '+(e.h<10?'0':'')+e.h+':00':''} · ${c.city||''}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-body">${c.l12>0||c.class?`<div class="ev-popup-row"><div class="ev-popup-icon">📈</div><div><div class="ev-popup-lbl">Omsetning / Budsjett</div><div class="ev-popup-val">${c.l12>0?c.l12.toLocaleString('no-NO')+' kr':'–'} / ${c.budget>0?c.budget.toLocaleString('no-NO')+' kr':'–'} <span class="badge ${bCls}" style="margin-left:6px">${bLbl}</span></div></div></div>`:''} ${e.agenda||c.concept?`<div class="ev-popup-row"><div class="ev-popup-icon">◈</div><div><div class="ev-popup-lbl">Agenda</div><div class="ev-popup-val">${e.agenda||c.concept||''}</div></div></div>`:''} ${lastV?`<hr class="ev-popup-sep"><div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">${todayV?'Notat fra besøket':'Siste besøksnotat ('+lastV.date.split('-').reverse().join('.')+')'}</div><div class="ev-popup-note" onclick="closeEvPopup();openApptFor('${safeName}','${dateKey}')" style="cursor:pointer;border-radius:6px;padding:5px 7px;margin:-5px -7px;transition:background 0.12s" onmouseover="this.style.background='#F0EDE5'" onmouseout="this.style.background=''" title="Klikk for å redigere notat">${lastV.notes||'Ingen notater ennå.'}</div><div id="ev-popup-photos" style="margin-top:8px"></div><label class="btn btn-light btn-sm" style="cursor:pointer;display:inline-block;font-size:11px;margin-top:4px">📷 Legg til bilde<input type="file" accept="image/*" multiple style="display:none" onchange="addPhotoToVisit('${lastV.id}',this)"></label>`:'<div style="font-size:12px;color:#888780;padding:4px 0">Ingen besøksnotater ennå.</div>'} ${openF.length>0?`<hr class="ev-popup-sep"><div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">Åpen oppfølging (${openF.length})</div>${openF.slice(0,3).map(f=>{const pc=f.priority==='high'?'#D85A30':f.priority==='medium'?'#EF9F27':'#1D9E75';return '<div class="ev-popup-follow"><div class="ev-popup-follow-dot" style="background:'+pc+'"></div><span style="flex:1">'+f.task+'</span><span style="color:#888780;font-size:10px">'+f.due.split('-').reverse().join('.')+'</span></div>';}).join('')}`:''}<div id="ev-popup-custphotos" style="margin-top:6px"></div><div id="ev-popup-comments"></div></div><div class="ev-popup-actions">${e.type==='visit'?`<button class="btn btn-sm" onclick="toggleCalAppointed('${dateKey}',${e.startMins},'${safeName}')" style="${e.appointed===true?'background:#1A5C3A;color:#fff':'background:#FFF6E6;color:#6D4C00;border:1px solid #E6D9B8'}">${e.appointed===true?'✓ Avtalt':'Merk som avtalt'}</button>`:''}<button class="btn btn-dark btn-sm" onclick="closeEvPopup();goToCustomer('${safeName}')">🏪 Kundekort</button>${typeof _custMapsUrl==='function'&&_custMapsUrl(c)?`<a href="${_custMapsUrl(c)}" target="_blank" rel="noopener" style="text-decoration:none"><button class="btn btn-sm" style="background:#EEF4FB;color:#1565C0;border:1px solid #C5D9F0">🗺️ Maps</button></a>`:''}<button class="btn btn-green btn-sm" onclick="closeEvPopup();openApptFor('${safeName}','${dateKey}')">📝 Notat</button><label class="btn btn-sm" style="background:#EEF4FB;color:#185FA5;border:1px solid #C5D9F0;cursor:pointer;font-size:11px">📷 Bilde<input type="file" accept="image/*" multiple style="display:none" onchange="addCustomerPhoto('${safeName}',this)"></label>${lastV?`<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteVisit('${lastV.id}')">🗑 Slett besøk</button>`:`<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEvent('${dateKey}',${e.startMins},'${safeName}')">🗑 Slett planlagt besøk</button>`}${_calPrivBtn(dateKey,e)}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
    if(lastV) _loadEvPopupPhotos(lastV);
    const _cpEl = document.getElementById('ev-popup-custphotos');
    if(_cpEl && typeof _renderCustPhotoInPopup === 'function') _renderCustPhotoInPopup(_cpEl, cname);
    if(lastV && window._sbUser && typeof ecFetch==='function'){
      ecFetch('visit', lastV.id, window._sbUser.id).then(function(rows){
        const _commEl=document.getElementById('ev-popup-comments');
        if(!_commEl) return;
        const count=rows.filter(function(r){ return r.kind==='comment'; }).length;
        if(!count){ _commEl.innerHTML=''; return; }
        _commEl.innerHTML='<button onclick="closeEvPopup();showSection(\'timeline\')" style="border:none;background:none;padding:3px 0 0;cursor:pointer;font-size:12px;color:#0C447C;font-weight:500">💬 '+count+' kommentar'+(count===1?'':'ar')+' — sjå tidslinja →</button>';
      });
    }
  }
  popup.style.display = 'block';
  const isMobile = window.innerWidth <= 600;
  if(!isMobile){
    const pw=310, ph=popup.scrollHeight||300;
    const vw=window.innerWidth, vh=window.innerHeight;
    let left=evt.clientX+12, top=evt.clientY-20;
    if(left+pw>vw-8) left=evt.clientX-pw-12;
    if(top+ph>vh-8) top=vh-ph-8;
    if(top<8) top=8;
    popup.style.left=left+'px'; popup.style.top=top+'px';
  }
  setTimeout(()=>document.addEventListener('click', outsideClose, {once:true}), 50);
}

function outsideClose(e){ const p=document.getElementById('ev-popup'); if(p&&!p.contains(e.target)) closeEvPopup(); }

// Toggle bestilt-status (fly/hotell) på en kalenderoppføring
function toggleCalBooked(dateKey, startMins, label){
  if(_roGuard()) return;
  const evs = calEvents[dateKey]||[];
  const ev = evs.find(x=>x.startMins===startMins && (x.label||'')===label);
  if(!ev) return;
  ev.booked = ev.booked===true ? false : true;
  saveData('alfa_events', calEvents);
  closeEvPopup();
  renderCal();
  showToast(ev.booked ? '✓ Merket som bestilt' : 'Merket som ikke bestilt');
}

// Toggle avtalt-status på et planlagt kundebesøk i kalenderen
function toggleCalAppointed(dateKey, startMins, label){
  if(_roGuard()) return;
  const evs = calEvents[dateKey]||[];
  const ev = evs.find(x=>x.startMins===startMins && (x.label||'')===label);
  if(!ev) return;
  ev.appointed = ev.appointed===true ? false : true;
  saveData('alfa_events', calEvents);
  closeEvPopup();
  renderCal();
  showToast(ev.appointed ? '✓ Avtale bekreftet' : 'Merket som uanmeldt besøk');
}

function toggleCalPrivate(dateKey, startMins, label){
  if(_roGuard()) return;
  const evs = calEvents[dateKey]||[];
  const ev = evs.find(x=>x.startMins===startMins && (x.label||'')===label);
  if(!ev) return;
  ev.private = ev.private===true ? false : true;
  saveData('alfa_events', calEvents);
  closeEvPopup();
  renderCal();
  showToast(ev.private ? '🔒 Privat — skjult for teamet' : '🌐 Synlig for teamet');
}
function closeEvPopup(){ const p=document.getElementById('ev-popup'); if(p) p.style.display='none'; document.removeEventListener('click',outsideClose); }
function deleteCalEvent(dateKey, startMins, label){
  if(!confirm('Fjern det planlagte besøket hos '+label+' fra kalenderen?')) return;
  calEvents[dateKey]=(calEvents[dateKey]||[]).filter(function(ev){
    var evStart=ev.startMins!==undefined?ev.startMins:(ev.h||0)*60;
    return !(ev.type==='visit'&&evStart===startMins&&ev.label===label);
  });
  saveData('alfa_events',calEvents);
  closeEvPopup();
  renderCal();
}

function deleteCalEventGeneric(dateKey, startMins, type, label){
  if(_roGuard()) return;
  // For hotel: finn og slett tilknyttede hotel-start oppføringer (deler hotellnavn i label)
  const alsoDelete = [];
  if(type==='hotel' && label){
    const hotelName = (label||'').replace(/^🏨\s*/,'').trim();
    Object.keys(calEvents).forEach(dk=>{
      (calEvents[dk]||[]).forEach(ev=>{
        if(ev.type==='hotel-start' && (ev.label||'').includes(hotelName)){
          const evS = ev.startMins!==undefined ? ev.startMins : (ev.h||0)*60;
          alsoDelete.push({dk, evS, label:ev.label});
        }
      });
    });
  }
  const typeNames = {drive:'kjøring','hotel-start':'hotell-startmarkering',hotel:'hotell-innsjekk',flight:'flyoppføring',rental:'leiebil',adm:'adm-blokk',lunch:'lunsj',dinner:'middag',phone:'telefonsamtale',teams:'Teams-møte',nydalen:'Nydalen-besøk',clinic:'clinic',external:'ekstern avtale',training:'treningsøkt',leisure:'fritidstid',other:'oppføring'};
  const typeLbl = typeNames[type] || type;
  let msg = 'Fjern '+typeLbl+' «'+(label||'')+'» fra '+dateKey.split('-').reverse().join('.')+' fra kalenderen?';
  if(alsoDelete.length) msg += '\n\nFjerner også hotell-startmarkering for tilknyttede dager.\nKjøreetapper til/fra hotellet slettes ikke automatisk.';
  if(!confirm(msg)) return;
  // Slett hovedoppføringen (robust matching: normaliser startMins via h-fallback)
  calEvents[dateKey]=(calEvents[dateKey]||[]).filter(ev=>{
    const evStart=ev.startMins!==undefined?ev.startMins:(ev.h||0)*60;
    return !(ev.type===type && evStart===startMins && (ev.label||'')===(label||''));
  });
  if(calEvents[dateKey] && !calEvents[dateKey].length) delete calEvents[dateKey];
  // Slett tilknyttede hotel-start oppføringer
  alsoDelete.forEach(({dk, evS, label:aLbl})=>{
    calEvents[dk]=(calEvents[dk]||[]).filter(ev=>{
      const evStart=ev.startMins!==undefined?ev.startMins:(ev.h||0)*60;
      return !(ev.type==='hotel-start' && evStart===evS && ev.label===aLbl);
    });
    if(calEvents[dk] && !calEvents[dk].length) delete calEvents[dk];
  });
  saveData('alfa_events',calEvents);
  closeEvPopup();
  renderCal();
}
function openApptFor(name, dateKey){
  openAppt(dateKey, null);
  setTimeout(()=>{
    if(typeof window._csp_appt_setSelected==='function') window._csp_appt_setSelected(name);
    else document.getElementById('appt-customer').value=name;
    apptCustomerChange();
    // Fyll inn eksisterende notat så bruker ser det og kan redigere/legge til
    const _existV = visits.find(function(v){ return v.customer===name && v.date===dateKey; });
    const _notesEl = document.getElementById('appt-notes');
    if(_existV && _existV.notes && _notesEl) _notesEl.value = _existV.notes;
    apptTab('notat', document.querySelectorAll('.appt-tab')[1]);
  }, 80);
}

// ─── APPOINTMENT MODAL ───────────────────────────────────────────────────────

let _apptDate = '';

function openAppt(dateKey, evt, presetHour){
  if(evt) evt.stopPropagation();
  closeEvPopup();
  _apptDate = dateKey;
  const ds = dateKey.split('-');
  document.getElementById('appt-hdr-date').textContent = ds[2]+'.'+ds[1]+'.'+ds[0];
  document.getElementById('appt-hdr-title').textContent = 'Ny avtale';
  const h = presetHour !== undefined ? presetHour : 9;
  const hS = String(h).padStart(2,'0');
  const hE = String(Math.min(h+1,23)).padStart(2,'0');
  fillQuarterHourSlots(document.getElementById('appt-start'), hS+':00');
  fillQuarterHourSlots(document.getElementById('appt-end'), hE+':00');
  document.getElementById('appt-customer').value = '';
  document.getElementById('appt-cinfo').style.display = 'none';
  var apptCsBar=document.getElementById('appt-cs-bar');
  if(apptCsBar && typeof _csMountPicker==='function'){
    _csMountPicker(apptCsBar, getCustomers(), {
      prefix:'appt',
      topRows:[{value:'__new__',label:'+ Legg til ny kunde'}],
      onPick:function(name){ document.getElementById('appt-customer').value=name; apptCustomerChange(); },
      onTopRow:function(){ document.getElementById('appt-customer').value=''; openQuickCustomerModal(); }
    });
  }
  document.getElementById('appt-agenda').value = '';
  document.getElementById('appt-contact').value = '';
  document.getElementById('appt-notes').value = '';
  document.getElementById('appt-order').value = '';
  document.getElementById('appt-ftask').value = '';
  document.getElementById('appt-fdate').value = dateKey;
  const _pEl = document.getElementById('appt-private'); if(_pEl) _pEl.checked = false;
  document.getElementById('appt-open-follows').innerHTML = '';
  apptTab('avtale', document.querySelector('.appt-tab'));
  document.getElementById('appt-overlay').classList.add('open');
  setTimeout(()=>{ const q=document.getElementById('appt-q'); if(q) q.focus(); }, 100);
}

function closeAppt(){ document.getElementById('appt-overlay').classList.remove('open'); }

function apptTab(name, el){
  document.querySelectorAll('.appt-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.appt-panel').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('appt-panel-'+name).classList.add('active');
}

function apptUpdateTitle(){
  const cname = document.getElementById('appt-customer').value;
  if(cname && cname !== '__new__') document.getElementById('appt-hdr-title').textContent = cname;
}

function apptCustomerChange(){
  const val = document.getElementById('appt-customer').value;
  if(val === '__new__'){ document.getElementById('appt-customer').value=''; openQuickCustomerModal(); return; }
  const c = getCustomers().find(x=>x.name===val);
  const infoDiv = document.getElementById('appt-cinfo');
  if(c){
    infoDiv.style.display = 'block';
    document.getElementById('appt-ci-name').textContent = c.name;
    document.getElementById('appt-ci-meta').textContent = (c.city||'')+(c.chain?' · '+c.chain:'');
    document.getElementById('appt-ci-l12').textContent = c.l12>0?c.l12.toLocaleString('no-NO')+' kr':'–';
    document.getElementById('appt-ci-budget').textContent = c.budget>0?c.budget.toLocaleString('no-NO')+' kr':'–';
    document.getElementById('appt-ci-class').textContent = c.class||'Ny';
    document.getElementById('appt-ci-note').textContent = c.note||c.concept||'';
    if(c.concept && !document.getElementById('appt-agenda').value) document.getElementById('appt-agenda').value = c.concept;
    apptUpdateTitle();
    const openF = followups.filter(f=>f.customer===c.name&&!f.done);
    const ef = document.getElementById('appt-open-follows');
    if(openF.length){
      ef.innerHTML = '<div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 6px">Åpne oppfølginger</div>'+openF.map(f=>{const pc=f.priority==='high'?'#D85A30':f.priority==='medium'?'#EF9F27':'#1D9E75';return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:5px 0;border-bottom:1px solid #F1EFE8"><div style="width:7px;height:7px;border-radius:50%;background:${pc};flex-shrink:0"></div><span style="flex:1">${f.task}</span><span style="color:#888780;font-size:11px">${f.due.split('-').reverse().join('.')}</span></div>`;}).join('');
    } else { ef.innerHTML=''; }
  } else {
    infoDiv.style.display='none';
    document.getElementById('appt-hdr-title').textContent='Ny avtale';
    document.getElementById('appt-open-follows').innerHTML='';
  }
}

function apptPhotoPreview(){
  const files=document.getElementById('appt-photos').files;
  const preview=document.getElementById('appt-photo-preview');
  preview.innerHTML='';
  Array.from(files).forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=document.createElement('img');
      img.src=e.target.result;
      img.style.cssText='width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #D3D1C7';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function saveAppt(){
  const cname = document.getElementById('appt-customer').value;
  const tStart = document.getElementById('appt-start').value;
  const tEnd = document.getElementById('appt-end').value;
  const type = document.getElementById('appt-type').value;
  const agenda = document.getElementById('appt-agenda').value.trim();
  const contact = document.getElementById('appt-contact').value.trim();
  const notes = document.getElementById('appt-notes').value.trim();
  const order = document.getElementById('appt-order').value.trim();
  const ftask = document.getElementById('appt-ftask').value.trim();
  const fdate = document.getElementById('appt-fdate').value;
  const fprio = document.getElementById('appt-fprio').value;
  if(!cname){ showToast('Velg en kunde'); return; }
  if(tEnd && tStart && tEnd <= tStart){ showToast('Sluttid må være etter starttid'); return; }
  const h = parseInt(tStart.split(':')[0]);
  if(!calEvents[_apptDate]) calEvents[_apptDate]=[];
  const isPrivate = !!(document.getElementById('appt-private')||{}).checked;
  if(!calEvents[_apptDate].find(e=>e.label===cname)){
    calEvents[_apptDate].push({type, label:cname, h, agenda, contact, ...(isPrivate ? {private:true} : {})});
    saveData('alfa_events', calEvents);
  }
  if(type==='visit'){
    let fullNotes = notes;
    if(agenda) fullNotes = 'Agenda: '+agenda+(notes?'\n\n'+notes:'');
    if(order) fullNotes += (fullNotes?'\n\nOrdre: ':'Ordre: ')+order;
    const existing = visits.find(v=>v.customer===cname&&v.date===_apptDate);
    if(!existing){ visits.push({id:(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'v_'+Date.now()+'_'+Math.random().toString(36).slice(2)), customer:cname, date:_apptDate, time:tStart, contact, notes:fullNotes, followup:ftask, photoCount:0}); }
    else { if(fullNotes) existing.notes=fullNotes; if(contact) existing.contact=contact; }
    saveData('alfa_visits', visits);
    const _photoInput = document.getElementById('appt-photos');
    if(_photoInput && _photoInput.files && _photoInput.files.length > 0){
      const _savedVisit = existing || visits[visits.length-1];
      if(typeof addPhotoToVisit === 'function') addPhotoToVisit(_savedVisit.id, _photoInput);
    }
  }
  if(ftask && fdate){ followups.push({id:Date.now()+1, customer:cname, task:ftask, due:fdate, priority:fprio, done:false}); saveData('alfa_followups', followups); }
  closeAppt();
  renderCal();
  showToast('Avtale lagret!');
}

document.getElementById('appt-overlay').addEventListener('click', function(e){ if(e.target===this) closeAppt(); });

// ─── ICS IMPORT ──────────────────────────────────────────────────────────────

function _icsImportStart(){
  var inp=document.getElementById('ics-upload-input');
  if(!inp){
    inp=document.createElement('input');
    inp.type='file';
    inp.id='ics-upload-input';
    inp.accept='.ics,text/calendar';
    inp.style.display='none';
    document.body.appendChild(inp);
  }
  inp.value='';
  inp.onchange=function(){ _icsHandleFile(this); };
  inp.click();
}

function _icsHandleFile(inputEl){
  const file=inputEl.files&&inputEl.files[0];
  if(!file) return;
  if(file.size===0){ showToast('Filen er tom'); return; }
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const parsed=_parseICSEvents(e.target.result);
      if(!parsed.length){ showToast('Ingen gyldige avtaler funnet i .ics-filen'); return; }
      _icsShowImportConfirm(parsed);
    }catch(err){ console.warn('ICS parse feil',err); showToast('Kunne ikke lese .ics-filen — ugyldig format?'); }
  };
  reader.readAsText(file,'utf-8');
}

function _icsUnescapeVal(s){
  return String(s==null?'':s).replace(/\\n/gi,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\');
}

function _icsParseDT(val, params){
  val=(val||'').trim();
  params=(params||'').toUpperCase();
  const isAllDay=params.includes('VALUE=DATE')||/^\d{8}$/.test(val);
  if(isAllDay){
    if(val.length<8) return null;
    const y=+val.slice(0,4),m=+val.slice(4,6),d=+val.slice(6,8);
    if(!y||!m||!d) return null;
    return{dateKey:y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),startMins:480,isAllDay:true};
  }
  if(val.length<15) return null;
  const isUTC=val.endsWith('Z');
  const vy=+val.slice(0,4),vm=+val.slice(4,6)-1,vd=+val.slice(6,8);
  const vh=+val.slice(9,11),vmi=+val.slice(11,13);
  // UTC: convert via JS Date (handles DST automatically). Non-UTC: treat as local Norwegian time.
  const dt=isUTC?new Date(Date.UTC(vy,vm,vd,vh,vmi)):new Date(vy,vm,vd,vh,vmi);
  const lY=dt.getFullYear(),lM=dt.getMonth()+1,lD=dt.getDate();
  const lH=dt.getHours(),lMi=dt.getMinutes();
  return{dateKey:lY+'-'+String(lM).padStart(2,'0')+'-'+String(lD).padStart(2,'0'),startMins:lH*60+lMi,isAllDay:false};
}

function _parseICSEvents(text){
  text=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  text=text.replace(/\n[ \t]/g,''); // line-unfolding
  const events=[];
  text.split(/BEGIN:VEVENT/i).forEach(function(block){
    const end=block.search(/END:VEVENT/i);
    if(end===-1) return;
    const lines=block.substring(0,end).split('\n');
    let uid='',summary='',dtstart='',dtend='',location='',description='',dtstartParams='',dtendParams='';
    lines.forEach(function(line){
      const ci=line.indexOf(':');
      if(ci===-1) return;
      const propFull=line.substring(0,ci);
      const val=line.substring(ci+1).trim();
      const base=propFull.split(';')[0].toUpperCase();
      const paramStr=propFull.split(';').slice(1).join(';');
      switch(base){
        case 'UID':         uid=val; break;
        case 'SUMMARY':     summary=_icsUnescapeVal(val); break;
        case 'DTSTART':     dtstart=val; dtstartParams=paramStr; break;
        case 'DTEND':       dtend=val; dtendParams=paramStr; break;
        case 'LOCATION':    location=_icsUnescapeVal(val); break;
        case 'DESCRIPTION': description=_icsUnescapeVal(val); break;
      }
    });
    if(!dtstart) return;
    const start=_icsParseDT(dtstart,dtstartParams);
    if(!start) return;
    let endMins=start.startMins+60;
    if(dtend){
      const endDt=_icsParseDT(dtend,dtendParams);
      if(endDt&&!start.isAllDay){
        endMins=endDt.startMins;
        if(endMins<=start.startMins) endMins=start.startMins+60;
      }
    }
    if(start.isAllDay) endMins=start.startMins+480;
    const ev={
      type:'other',
      label:summary||'Uten tittel',
      h:Math.floor(start.startMins/60),
      hEnd:Math.ceil(endMins/60),
      startMins:start.startMins,
      endMins:endMins,
      _dateKey:start.dateKey
    };
    if(location) ev.city=location;
    if(description) ev.agenda=description;
    if(uid) ev._icsUid=uid;
    events.push(ev);
  });
  return events;
}

function _icsFindExisting(uid){
  if(!uid) return null;
  for(const dk in calEvents){
    const ev=(calEvents[dk]||[]).find(function(e){ return e._icsUid===uid; });
    if(ev) return{dateKey:dk,ev:ev};
  }
  return null;
}

function _icsShowImportConfirm(events){
  const existing=document.getElementById('ics-confirm-modal');
  if(existing) existing.remove();
  window._icsParsed=events;
  const MAX_SHOW=100;
  const shown=events.slice(0,MAX_SHOW);
  const overflow=events.length-MAX_SHOW;
  let newCount=0,updateCount=0;
  events.forEach(function(ev){ if(ev._icsUid&&_icsFindExisting(ev._icsUid)) updateCount++; else newCount++; });
  const countTxt=newCount+' nye'+(updateCount?', '+updateCount+' oppdateringer':'');
  const btnStyle='padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;';
  let rows='';
  shown.forEach(function(ev,i){
    const isUpdate=ev._icsUid&&_icsFindExisting(ev._icsUid);
    const dateDisplay=ev._dateKey.split('-').reverse().join('.');
    const sh=Math.floor(ev.startMins/60),sm=ev.startMins%60,eh=Math.floor(ev.endMins/60),em=ev.endMins%60;
    const timeDisplay=ev.startMins!==undefined?(String(sh).padStart(2,'0')+':'+String(sm).padStart(2,'0')+'–'+String(eh).padStart(2,'0')+':'+String(em).padStart(2,'0')):'(heldags)';
    rows+=`<label style="display:flex;align-items:flex-start;gap:10px;padding:9px 10px;background:#F8F7F3;border-radius:8px;cursor:pointer;margin-bottom:6px">
      <input type="checkbox" id="ics-cb-${i}" checked onchange="_icsUpdateCount()" style="width:16px;height:16px;margin-top:2px;cursor:pointer;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(ev.label)}</div>
        <div style="font-size:11px;color:#888780;margin-top:2px">${escapeHtml(dateDisplay)} · ${escapeHtml(timeDisplay)}${ev.city?' · 📍'+escapeHtml(ev.city):''}</div>
        ${isUpdate?'<div style="font-size:10px;color:#BA7517;margin-top:1px">↻ Oppdaterer eksisterende</div>':''}
      </div>
    </label>`;
  });
  if(overflow>0) rows+=`<div style="font-size:11px;color:#888780;text-align:center;padding:6px">… og ${overflow} til (importeres automatisk)</div>`;
  const modal=document.createElement('div');
  modal.id='ics-confirm-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  modal.innerHTML=`<div style="background:#fff;border-radius:14px;width:460px;max-width:100%;padding:16px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:15px;font-weight:700">📅 Importer fra Outlook</div>
      <button onclick="document.getElementById('ics-confirm-modal').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;line-height:1">×</button>
    </div>
    <div style="font-size:12px;color:#888780;margin-bottom:12px">${events.length} avtaler funnet · ${countTxt}</div>
    <div style="display:flex;flex-direction:column;max-height:340px;overflow-y:auto;margin-bottom:14px">${rows}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
      <button onclick="document.getElementById('ics-confirm-modal').remove()" style="${btnStyle}background:#F1EFE8;border:1px solid #D3D1C7;color:#5F5E5A">Avbryt</button>
      <button id="ics-save-btn" onclick="_icsDoImportSelected()" style="${btnStyle}background:#0C447C;border:none;color:#fff">✓ Importer alle (${events.length})</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _icsUpdateCount(){
  const events=window._icsParsed||[];
  const shown=Math.min(events.length,100);
  let n=0;
  for(let i=0;i<shown;i++){ const cb=document.getElementById('ics-cb-'+i); if(cb&&cb.checked) n++; }
  const overflow=events.length>100?events.length-100:0;
  const btn=document.getElementById('ics-save-btn');
  if(btn) btn.textContent='✓ Importer valgte ('+(n+overflow)+')';
}

function _icsDoImportSelected(){
  const events=window._icsParsed||[];
  const shown=events.slice(0,100);
  const selected=[];
  shown.forEach(function(ev,i){ const cb=document.getElementById('ics-cb-'+i); if(cb&&cb.checked) selected.push(ev); });
  _icsDoImport(selected.concat(events.slice(100)));
}

function _icsDoImport(events){
  if(!events||!events.length){ showToast('Ingen avtaler valgt'); return; }
  if(_roGuard()) return;
  let added=0,updated=0;
  events.forEach(function(ev){
    const dateKey=ev._dateKey;
    if(!dateKey) return;
    const stored={type:ev.type||'other',label:ev.label,h:ev.h,hEnd:ev.hEnd,startMins:ev.startMins,endMins:ev.endMins};
    if(ev.city) stored.city=ev.city;
    if(ev.agenda) stored.agenda=ev.agenda;
    if(ev._icsUid) stored._icsUid=ev._icsUid;
    if(ev._icsUid){
      const match=_icsFindExisting(ev._icsUid);
      if(match){
        const arr=calEvents[match.dateKey]||[];
        const idx=arr.indexOf(match.ev);
        if(match.dateKey===dateKey){
          if(idx>=0) arr[idx]=stored;
        } else {
          if(idx>=0) arr.splice(idx,1);
          if(!arr.length) delete calEvents[match.dateKey];
          if(!calEvents[dateKey]) calEvents[dateKey]=[];
          calEvents[dateKey].push(stored);
        }
        updated++;
        return;
      }
    }
    if(!calEvents[dateKey]) calEvents[dateKey]=[];
    calEvents[dateKey].push(stored);
    added++;
  });
  saveData('alfa_events',calEvents);
  document.getElementById('ics-confirm-modal')?.remove();
  renderCal();
  const msg=added>0&&updated>0?(added+' importert, '+updated+' oppdatert'):added>0?(added+' avtaler importert!'):( updated+' avtaler oppdatert!');
  showToast(msg);
}
