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
  for(let i=0;i<first;i++){
    h+=`<div class="cal-day other-month"><div class="cal-dnum">${prev-first+1+i}</div></div>`;
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
      return `<div class="cal-ev ${cc}" style="${calEvDim(e)}" onclick="event.stopPropagation();monthEvClick('${key}')">${calBookedMark(e)}${safeLabel}</div>`;
    }).join('');
    h+=`<div class="cal-day${wk}${td}${hasEv}${isHol}${isVac}" onclick="jumpToDayFromMonth(${y},${m},${d})"><div class="cal-dnum">${d}</div>${topLabel}${evHtml}${more}</div>`;
  }
  const used=first+dim;
  const rem=used%7===0?0:7-(used%7);
  for(let i=0;i<rem;i++){
    h+=`<div class="cal-day other-month"><div class="cal-dnum">${i+1}</div></div>`;
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
  if(e.type==='flight'||e.type==='hotel'||e.type==='rental'){
    if(e.booked===true) return '✅ ';
    if(e.booked===false) return '❌ ';
  }
  return '';
}
function calEvDim(e){
  // Kundebesøk: GRØNN når avtalt, RØD når uanmeldt/ikke avtalt
  if(e.type==='visit' && e.appointed===true) return 'background:#E3F2E8;color:#1A5C3A;border-left-color:#1A5C3A;';
  if(e.type==='visit' && e.appointed===false) return 'background:#FBE9E7;color:#A23B27;border-left-color:#A23B27;border-left-style:dashed;';
  if((e.type==='flight'||e.type==='hotel'||e.type==='rental') && e.booked===false) return 'opacity:0.45;border-left-style:dashed;';
  return '';
}
function calEvClass(type){
  const m={visit:'cev-visit',phone:'cev-phone',nydalen:'cev-nydalen',teams:'cev-teams',clinic:'cev-clinic',external:'cev-external',dinner:'cev-dinner',drive:'cev-d','drive-auto':'cev-drive-auto',hotel:'cev-h','hotel-start':'cev-h',flight:'cev-h',rental:'cev-d'};
  return m[type]||'cev-v';
}
function calEvEmoji(type){
  const m={visit:'🏪',phone:'📞',nydalen:'🏢',teams:'👥',clinic:'🎓',external:'📈',dinner:'🍽️',drive:'🚗','drive-auto':'🚗',hotel:'🏨','hotel-start':'🏨',flight:'✈',adm:'💻',lunch:'🍽️',training:'🏃',leisure:'🌿',rental:'🚙',other:'📌'};
  return m[type]||'📅';
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
function calEvDragStart(ev,key,eEnc){ev.stopPropagation();const e=JSON.parse(decodeURIComponent(eEnc));_calDrag={key,e,dur:(e.endMins||0)-(e.startMins||0)};ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain','ev');}
function calEvDragEnd(){_calDrag=null;}
function calDragOver(ev,key){ev.preventDefault();}
function calDragLeave(ev,key){}
function calDrop(ev,newKey,colEl){
  ev.preventDefault();
  if(!_calDrag)return;
  if(_roGuard()){_calDrag=null;return;}
  const rect=colEl.getBoundingClientRect();
  const slot=Math.max(0,Math.round((ev.clientY-rect.top)/15));
  const HSTART=(calView==='day')?4:6;
  const newStart=HSTART*60+slot*15;
  const newEnd=newStart+_calDrag.dur;
  const oldKey=_calDrag.key;
  const oldE=_calDrag.e;
  if(!oldE.auto){
    if(calEvents[oldKey]){calEvents[oldKey]=calEvents[oldKey].filter(e=>e.label!==oldE.label||e.startMins!==oldE.startMins||e.h!==oldE.h);if(!calEvents[oldKey].length)delete calEvents[oldKey];}
    if(!calEvents[newKey])calEvents[newKey]=[];
    calEvents[newKey].push({...oldE,startMins:newStart,endMins:newEnd,h:Math.floor(newStart/60),hEnd:Math.ceil(newEnd/60)});
    saveData('alfa_events',calEvents);
    showToast((oldE.label||'')+' → '+calFmt(newStart)+'–'+calFmt(newEnd));
  }
  _calDrag=null;
  renderCal();
}
function calColClick(ev,key,colEl){
  if(ev.target!==colEl&&!ev.target.style.borderTop)return;
  const rect=colEl.getBoundingClientRect();
  const slot=Math.max(0,Math.round((ev.clientY-rect.top)/15));
  const h=Math.floor(((calView==='day'?4:6)*60+slot*15)/60);
  openAppt(key,ev,h);
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
    html+='<div style="flex:'+flex+';position:relative;min-width:0;height:'+totalH+'px;'+(wknd?'background:#F8F7F3;':'')+(tod?'background:rgba(25,118,210,0.025);':'')+'border-left:1px solid #D3D1C7;" ondragover="calDragOver(event,\''+key+'\')" ondragleave="calDragLeave(event,\''+key+'\')" ondrop="calDrop(event,\''+key+'\',this)" onclick="calColClick(event,\''+key+'\',this)">';
    for(let s=0;s<totalSlots;s++){const isH=(s%SPH===0);html+='<div style="position:absolute;left:0;right:0;top:'+(s*SPX)+'px;border-top:1px '+(isH?'solid #D3D1C7':'dashed #ECEAE4')+';pointer-events:none"></div>';}
    html+='<div id="wkghost-'+key+'" style="display:none;position:absolute;left:2px;right:2px;background:rgba(25,118,210,0.12);border:2px dashed #1976D2;border-radius:4px;pointer-events:none;z-index:2"></div>';
    laid.forEach(e=>{
      const cc=calEvClass(e.type);
      const emoji=calEvEmoji(e.type);
      const startSlot=Math.round((e.startMins-HSTART*60)/15);
      const endSlot=Math.round((e.endMins-HSTART*60)/15);
      const topPx=startSlot*SPX;
      const heightPx=Math.max((endSlot-startSlot)*SPX-2,SPX);
      const wPct=100/(e._cols||1);
      const lPct=(e._col||0)*wPct;
      const showTime=heightPx>=24;
      const showMaps=e.type==='drive-auto'&&heightPx>=24;
      const eEnc=encodeURIComponent(JSON.stringify(e));
      html+='<div class="'+cc+'" draggable="true" ondragstart="calEvDragStart(event,\''+key+'\',\''+eEnc+'\')" ondragend="calEvDragEnd()" onclick="event.stopPropagation();handleEvClick(event,\''+key+'\',\''+eEnc+'\')" title="'+(e.label||'').replace(/"/g,'&quot;')+'" style="position:absolute;top:'+topPx+'px;height:'+heightPx+'px;left:calc('+lPct+'% + 2px);width:calc('+wPct+'% - 4px);border-radius:4px;padding:2px 5px;font-size:10px;font-weight:600;overflow:hidden;border-left:3px solid rgba(0,0,0,0.2);z-index:3;box-sizing:border-box;cursor:grab;'+calEvDim(e)+'">'+calBookedMark(e)+emoji+' '+(e.label||'');
      if(showTime) html+='<span style="font-size:9px;font-weight:400;opacity:0.75;display:block">'+calFmt(e.startMins)+'–'+calFmt(e.endMins)+'</span>';
      if(showMaps){const mf=encodeURIComponent(e.mapsFrom||'');const mt=encodeURIComponent(e.mapsTo||'');html+='<span onclick="event.stopPropagation();window.open(\'https://www.google.com/maps/dir/'+mf+'/'+mt+'\',\'_blank\')" style="font-size:9px;text-decoration:underline;cursor:pointer;display:block">Maps ↗</span>';}
      html+='<div onmousedown="calResizeStart(event,\''+key+'\',\''+eEnc+'\')" style="position:absolute;bottom:0;left:0;right:0;height:5px;cursor:s-resize;background:rgba(0,0,0,0.12);border-radius:0 0 3px 3px"></div>';
      html+='</div>';
    });
    html+='</div>';
  });
  html+='</div></div>';
  body.innerHTML=html;
}

function renderDay(body){
  const y=calCursor.getFullYear(),m=calCursor.getMonth(),d=calCursor.getDate();
  const col=mb(new Date(y,m,d).getDay());
  document.getElementById('cal-title').textContent=NO_LONG[col]+' '+d+'. '+NO_MONTHS[m]+' '+y;
  const key=dk(y,m,d);
  const HSTART=4,HEND=24,SPH=4,SPX=15;
  const totalSlots=(HEND-HSTART)*SPH;
  const rawEvs=getEventsForDay(key);
  const allEvs=calAutoAddDrives(rawEvs,key);
  const normEvs=allEvs.map(e=>{if(e.startMins!==undefined)return e;return{...e,startMins:(e.h||8)*60,endMins:(e.hEnd?e.hEnd*60:((e.h||8)+1)*60)};});
  const laid=calLayoutOverlap(normEvs,HSTART,HEND);
  const totalH=totalSlots*SPX;
  let html='<div class="day-view"><div class="day-view-hdr"><span class="day-view-date">'+d+'. '+NO_MONTHS[m]+'</span><span class="day-view-lbl">'+NO_LONG[col]+(isToday(y,m,d)?' · I dag':'')+'</span></div>';
  // Helligdag- eller fridag-banner
  const dayHoliday=getHolidayName(key);
  const dayVacation=getPersonalDay(key);
  if(dayHoliday){
    html+='<div style="background:#FBE9E7;border:1px solid #C62828;color:#C62828;padding:10px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="font-size:18px">🎉</span><span>'+escapeHtml(dayHoliday)+' — offentlig fridag</span></div>';
  } else if(dayVacation){
    html+='<div style="background:#FFF4E6;border:1px solid #BA7517;color:#6D4C00;padding:10px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px"><div><span style="font-size:18px">🌴</span> '+escapeHtml(dayVacation.label||'Fridag')+(dayVacation.note?' <span style="font-weight:400;color:#5F5E5A">— '+escapeHtml(dayVacation.note)+'</span>':'')+'</div><button class="btn btn-light btn-sm" onclick="removePersonalDay(\''+key+'\')" style="color:#A23B27;font-size:11px">× Fjern</button></div>';
  } else {
    html+='<div style="margin:6px 0;text-align:right"><button class="btn btn-light btn-sm" onclick="addPersonalDay(\''+key+'\')" style="font-size:11px;color:#888780">+ Registrer fridag/ferie</button></div>';
  }
  html+='<div style="display:flex;overflow-y:auto;max-height:580px">';
  html+='<div style="width:52px;flex-shrink:0;background:#F8F7F3;border-right:1px solid #D3D1C7">';
  for(let h=HSTART;h<HEND;h++){html+='<div style="height:60px;border-bottom:1px solid #D3D1C7;font-size:10px;color:#888780;text-align:right;padding:2px 6px 0 0;box-sizing:border-box">'+(h<10?'0':'')+h+':00</div>';}
  html+='</div>';
  html+='<div style="flex:1;position:relative;height:'+totalH+'px" ondragover="calDragOver(event,\''+key+'\')" ondragleave="calDragLeave(event,\''+key+'\')" ondrop="calDrop(event,\''+key+'\',this)" onclick="calColClick(event,\''+key+'\',this)">';
  for(let s=0;s<totalSlots;s++){const isH=(s%SPH===0);html+='<div style="position:absolute;left:0;right:0;top:'+(s*SPX)+'px;border-top:1px '+(isH?'solid #D3D1C7':'dashed #ECEAE4')+';pointer-events:none"></div>';}
  html+='<div id="wkghost-'+key+'" style="display:none;position:absolute;left:4px;right:4px;background:rgba(25,118,210,0.12);border:2px dashed #1976D2;border-radius:4px;pointer-events:none;z-index:2"></div>';
  laid.forEach(e=>{
    const cc=calEvClass(e.type);
    const emoji=calEvEmoji(e.type);
    const startSlot=Math.round((e.startMins-HSTART*60)/15);
    const endSlot=Math.round((e.endMins-HSTART*60)/15);
    const topPx=startSlot*SPX;
    const heightPx=Math.max((endSlot-startSlot)*SPX-3,SPX);
    const wPct=100/(e._cols||1);
    const lPct=(e._col||0)*wPct;
    const eEnc=encodeURIComponent(JSON.stringify(e));
    const showTime=heightPx>=30;
    const showMaps=e.type==='drive-auto';
    html+='<div class="'+cc+'" draggable="true" ondragstart="calEvDragStart(event,\''+key+'\',\''+eEnc+'\')" ondragend="calEvDragEnd()" onclick="event.stopPropagation();handleEvClick(event,\''+key+'\',\''+eEnc+'\')" title="'+(e.label||'').replace(/"/g,'&quot;')+'" style="position:absolute;top:'+topPx+'px;height:'+heightPx+'px;left:calc('+lPct+'% + 4px);width:calc('+wPct+'% - 8px);border-radius:5px;padding:4px 8px;font-size:12px;font-weight:600;overflow:hidden;border-left:3px solid rgba(0,0,0,0.2);z-index:3;box-sizing:border-box;cursor:grab;'+calEvDim(e)+'">'+calBookedMark(e)+emoji+' '+(e.label||'');
    if(showTime) html+='<span style="font-size:10px;font-weight:400;opacity:0.75;display:block">'+calFmt(e.startMins)+'–'+calFmt(e.endMins)+'</span>';
    if(showMaps){const mf=encodeURIComponent(e.mapsFrom||'');const mt=encodeURIComponent(e.mapsTo||'');html+='<a onclick="event.stopPropagation()" href="https://www.google.com/maps/dir/'+mf+'/'+mt+'" target="_blank" style="font-size:11px;color:#1565C0;text-decoration:underline;display:block;margin-top:2px">🗺 Åpne i Google Maps ↗</a>';}
    html+='<div onmousedown="calResizeStart(event,\''+key+'\',\''+eEnc+'\')" style="position:absolute;bottom:0;left:0;right:0;height:6px;cursor:s-resize;background:rgba(0,0,0,0.12);border-radius:0 0 4px 4px"></div>';
    html+='</div>';
  });
  html+='</div></div></div>';
  body.innerHTML=html;
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
function fillHalfHourSlots(selectEl, defaultVal){
  const opts=[];
  for(let h=6; h<=20; h++){
    for(let m of [0,30]){
      const hh=String(h).padStart(2,'0');
      const mm=String(m).padStart(2,'0');
      opts.push(hh+':'+mm);
    }
  }
  selectEl.innerHTML=opts.map(o=>'<option value="'+o+'">'+o+'</option>').join('');
  if(defaultVal && opts.includes(defaultVal)) selectEl.value=defaultVal;
}
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
          +(p.path?'<button onclick="deleteSingleVisitPhoto('+v.id+',\''+p.path+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
          +'</div>';
      }).join('')
    + '</div>';
}

function handleEvClick(evt, dateKey, evJsonEncoded){
  evt.stopPropagation();
  const e = JSON.parse(decodeURIComponent(evJsonEncoded));
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
  const lbl=(e.label||'').replace(/'/g,"\\'");
  return '<div style="display:flex;gap:6px;align-items:center;padding:10px 0 0;flex-wrap:wrap">'+
    '<span style="font-size:11px;font-weight:600;color:#5F5E5A">🕐 Tid:</span>'+
    '<input type="time" id="ev-edit-start" value="'+f(e.startMins||0)+'" style="padding:5px 7px;border:1px solid #D3D1C7;border-radius:7px;font-size:12px">'+
    '<span style="color:#888780">–</span>'+
    '<input type="time" id="ev-edit-end" value="'+f(e.endMins||((e.startMins||0)+60))+'" style="padding:5px 7px;border:1px solid #D3D1C7;border-radius:7px;font-size:12px">'+
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

function openEvPopup(evt, dateKey, e){
  closeEvPopup();
  const popup = document.getElementById('ev-popup');
  const dateStr = dateKey.split('-').reverse().join('.');
  const SIMPLE_TYPES = ['adm','lunch','dinner','training','leisure','teams','phone','external','nydalen','clinic','drive','drive-auto','other','hotel-start'];
  if(e.type==='hotel' || e.type==='flight' || e.type==='rental'){
    const isBooked = e.booked===true;
    const icon = e.type==='hotel' ? '🏨' : (e.type==='rental' ? '🚙' : '✈');
    const bookBtn = '<button class="btn btn-sm" onclick="toggleCalBooked(\''+dateKey+'\','+e.startMins+',\''+(e.label||'').replace(/'/g,"\\'")+'\')" style="'+(isBooked?'background:#1A5C3A;color:#fff':'background:#FFF6E6;color:#6D4C00;border:1px solid #E6D9B8')+'">'+(isBooked?'✓ Bestilt':'Merk som bestilt')+'</button>';
    const delBtnTravel = '<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEventGeneric(\''+dateKey+'\','+e.startMins+',\''+e.type+'\',\''+(e.label||'').replace(/'/g,"\\'")+'\')">🗑 Fjern</button>';
    popup.innerHTML = `<div class="ev-popup-hdr" style="background:#185FA5"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">${icon} ${e.label}</div><div class="ev-popup-hdr-sub">${dateStr}${isBooked?' · ✓ bestilt':' · ikke bestilt'}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-actions" style="padding-top:12px;display:flex;gap:6px">${bookBtn}${delBtnTravel}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
  } else if(SIMPLE_TYPES.includes(e.type)){
    const _safeEvLbl = (e.label||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const _delOrNote = e.type==='drive-auto'
      ? '<div style="font-size:11px;color:#888780;padding:4px 0 2px">Kjøretid beregnes automatisk mellom besøk og kan ikke slettes direkte — flytt eller slett ett av besøkene.</div>'
      : '<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEventGeneric(\''+dateKey+'\','+e.startMins+',\''+e.type+'\',\''+_safeEvLbl+'\')">🗑 Fjern</button>';
    popup.innerHTML = `<div class="ev-popup-hdr" style="background:#5F5E5A"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">${calEvEmoji(e.type)} ${e.label}</div><div class="ev-popup-hdr-sub">${dateStr} · ${calFmt(e.startMins)}–${calFmt(e.endMins)}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-actions" style="padding-top:12px;display:flex;gap:6px;flex-wrap:wrap">${_delOrNote}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
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
    popup.innerHTML = `<div class="ev-popup-hdr"><div class="ev-popup-hdr-left"><div class="ev-popup-hdr-title">🏪 ${cname}</div><div class="ev-popup-hdr-sub">${dateStr}${e.h!==undefined?' · '+(e.h<10?'0':'')+e.h+':00':''} · ${c.city||''}</div></div><button class="ev-popup-close" onclick="closeEvPopup()">✕</button></div><div class="ev-popup-body">${c.l12>0||c.class?`<div class="ev-popup-row"><div class="ev-popup-icon">📈</div><div><div class="ev-popup-lbl">Omsetning / Budsjett</div><div class="ev-popup-val">${c.l12>0?c.l12.toLocaleString('no-NO')+' kr':'–'} / ${c.budget>0?c.budget.toLocaleString('no-NO')+' kr':'–'} <span class="badge ${bCls}" style="margin-left:6px">${bLbl}</span></div></div></div>`:''} ${e.agenda||c.concept?`<div class="ev-popup-row"><div class="ev-popup-icon">◈</div><div><div class="ev-popup-lbl">Agenda</div><div class="ev-popup-val">${e.agenda||c.concept||''}</div></div></div>`:''} ${lastV?`<hr class="ev-popup-sep"><div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">${todayV?'Notat fra besøket':'Siste besøksnotat ('+lastV.date.split('-').reverse().join('.')+')'}</div><div class="ev-popup-note">${lastV.notes||'Ingen notater ennå.'}</div><div id="ev-popup-photos" style="margin-top:8px"></div><label class="btn btn-light btn-sm" style="cursor:pointer;display:inline-block;font-size:11px;margin-top:4px">📷 Legg til bilde<input type="file" accept="image/*" multiple style="display:none" onchange="addPhotoToVisit(${lastV.id},this)"></label>`:'<div style="font-size:12px;color:#888780;padding:4px 0">Ingen besøksnotater ennå.</div>'} ${openF.length>0?`<hr class="ev-popup-sep"><div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">Åpen oppfølging (${openF.length})</div>${openF.slice(0,3).map(f=>{const pc=f.priority==='high'?'#D85A30':f.priority==='medium'?'#EF9F27':'#1D9E75';return '<div class="ev-popup-follow"><div class="ev-popup-follow-dot" style="background:'+pc+'"></div><span style="flex:1">'+f.task+'</span><span style="color:#888780;font-size:10px">'+f.due.split('-').reverse().join('.')+'</span></div>';}).join('')}`:''}<div id="ev-popup-custphotos" style="margin-top:6px"></div></div><div class="ev-popup-actions">${e.type==='visit'?`<button class="btn btn-sm" onclick="toggleCalAppointed('${dateKey}',${e.startMins},'${safeName}')" style="${e.appointed===true?'background:#1A5C3A;color:#fff':'background:#FFF6E6;color:#6D4C00;border:1px solid #E6D9B8'}">${e.appointed===true?'✓ Avtalt':'Merk som avtalt'}</button>`:''}<button class="btn btn-dark btn-sm" onclick="closeEvPopup();goToCustomer('${safeName}')">🏪 Kundekort</button><button class="btn btn-green btn-sm" onclick="closeEvPopup();openApptFor('${safeName}','${dateKey}')">📝 Notat</button><label class="btn btn-sm" style="background:#EEF4FB;color:#185FA5;border:1px solid #C5D9F0;cursor:pointer;font-size:11px">📷 Bilde<input type="file" accept="image/*" multiple style="display:none" onchange="addCustomerPhoto('${safeName}',this)"></label>${lastV?`<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteVisit(${lastV.id})">🗑 Slett besøk</button>`:`<button class="btn btn-sm" style="background:#FFF0EC;color:#D85A30;border:1px solid #F2C5B8" onclick="deleteCalEvent('${dateKey}',${e.startMins},'${safeName}')">🗑 Slett planlagt besøk</button>`}<button class="btn btn-light btn-sm" onclick="closeEvPopup()">Lukk</button></div>${_evTimeEditRow(dateKey,e)}`;
    if(lastV) _loadEvPopupPhotos(lastV);
    const _cpEl = document.getElementById('ev-popup-custphotos');
    if(_cpEl && typeof _renderCustPhotoInPopup === 'function') _renderCustPhotoInPopup(_cpEl, cname);
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
  document.getElementById('appt-start').value = hS+':00';
  document.getElementById('appt-end').value = hE+':00';
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
      ef.innerHTML = '<div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 6px">Åpne oppfølginger</div>'+openF.map(f=>{const pc=f.priority==='high'?'#D85A30':f.priority==='medium'?'#EF9F27':'#1D9E75';return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:5px 0;border-bottom:1px solid #F1EFE8"><div style="width:7px;height:7px;border-radius:50%;background:${pc};flex-shrink:0"></div><span style="flex:1">${f.task}</span><span style="color:#888780;font-size:11px">${f.due.split('-').reverse().join('.')}</span><button class="btn btn-light btn-sm" style="padding:2px 7px;font-size:11px" onclick="markDone(${f.id});apptCustomerChange()">✓</button></div>`;}).join('');
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
  const h = parseInt(tStart.split(':')[0]);
  if(!calEvents[_apptDate]) calEvents[_apptDate]=[];
  if(!calEvents[_apptDate].find(e=>e.label===cname)){
    calEvents[_apptDate].push({type, label:cname, h, agenda, contact});
    saveData('alfa_events', calEvents);
  }
  if(type==='visit'){
    let fullNotes = notes;
    if(agenda) fullNotes = 'Agenda: '+agenda+(notes?'\n\n'+notes:'');
    if(order) fullNotes += (fullNotes?'\n\nOrdre: ':'Ordre: ')+order;
    const existing = visits.find(v=>v.customer===cname&&v.date===_apptDate);
    if(!existing){ visits.push({id:Date.now(), customer:cname, date:_apptDate, time:tStart, contact, notes:fullNotes, followup:ftask, photoCount:0}); }
    else { if(fullNotes) existing.notes=fullNotes; if(contact) existing.contact=contact; }
    saveData('alfa_visits', visits);
  }
  if(ftask && fdate){ followups.push({id:Date.now()+1, customer:cname, task:ftask, due:fdate, priority:fprio, done:false}); saveData('alfa_followups', followups); }
  closeAppt();
  renderCal();
  showToast('Avtale lagret!');
}

document.getElementById('appt-overlay').addEventListener('click', function(e){ if(e.target===this) closeAppt(); });
