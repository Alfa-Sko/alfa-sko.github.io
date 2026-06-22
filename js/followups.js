// ─── FOLLOWUPS ──────────────────────────────────────────────────────────────

function followItem(f){
  const pclass={high:'ph',medium:'pm',low:'pl'}[f.priority]||'pm';
  const isOverdue=f.due<TODAY_STR&&!f.done;
  return `<div class="follow-item${f.done?' fdone':''}">
    <div class="pdot ${pclass}"></div>
    <div class="fi">
      <div class="ftitle">${f.task} — ${f.customer}</div>
      <div class="fdue${isOverdue?' furgent':''}">Forfaller ${f.due.split('-').reverse().join('.')}${isOverdue?' · FORFALT':''}</div>
    </div>
    ${!f.done?`<button class="btn btn-light btn-sm" onclick="markDone(${f.id})">✓</button>`:`<span style="font-size:11px;color:#1D9E75">✓ Ferdig</span><button onclick="deleteFollowup(${f.id})" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0 0 0 8px" title="Slett">🗑</button>`}
  </div>`;
}

function saveFollowup(){
  if(_roGuard()) return;
  const customer=document.getElementById('follow-customer').value;
  const task=document.getElementById('follow-task').value;
  const due=document.getElementById('follow-date').value;
  const priority=document.getElementById('follow-priority').value;
  if(!customer||!task||!due){ showToast('Fyll ut kunde, oppgave og dato'); return; }
  followups.push({id:Date.now(),customer,task,due,priority,done:false});
  saveData('alfa_followups',followups);
  document.getElementById('follow-task').value='';
  document.getElementById('follow-date').value='';
  renderFollowups();
  showToast('Oppfølging lagt til!');
}

// Lesemodus-vakt: ledere som ser på andres data kan ikke endre noe
function _roGuard(){
  if(window._viewOnlyMode){ showToast('🔒 Kun lesing — du ser på en annens data'); return true; }
  if(window._bootLeader || window._leaderHome){ showToast('🔒 Ledervisning er kun lesing'); return true; }
  return false;
}
function markDone(id){
  if(_roGuard()) return;
  followups=followups.map(f=>f.id===id?{...f,done:true}:f);
  saveData('alfa_followups',followups);
  renderFollowups();
  showToast('Oppfølging markert som fullført!');
}

function deleteFollowup(id){
  if(_roGuard()) return;
  if(!confirm('Slett denne oppfølgingen? (kan ikke angres)')) return;
  followups=followups.filter(function(f){ return f.id!==id; });
  saveData('alfa_followups',followups);
  renderFollowups();
  showToast('Oppfølging slettet');
}

function renderFollowups(){
  const open=followups.filter(f=>!f.done).sort((a,b)=>a.due.localeCompare(b.due));
  const done=followups.filter(f=>f.done);
  let html=open.length===0?'<div class="empty-state">Ingen åpne oppfølginger ✓</div>':open.map(followItem).join('');
  if(done.length>0) html+=`<div class="section-label" style="margin-top:20px">Fullførte (${done.length})</div>`+done.slice(-5).map(followItem).join('');
  document.getElementById('followup-list').innerHTML=html;
  renderBookingFollowups();
}

// ─── BESTILLINGS-OPPFØLGING (ubestilte fly/hotell/leiebil) ──────────────────

function followTab(name){
  const tasks = document.getElementById('follow-pane-tasks');
  const bookings = document.getElementById('follow-pane-bookings');
  const btnT = document.getElementById('ftab-tasks');
  const btnB = document.getElementById('ftab-bookings');
  if(name==='bookings'){
    tasks.style.display='none'; bookings.style.display='block';
    btnT.className='btn btn-light'; btnB.className='btn btn-dark';
    renderBookingFollowups();
  } else {
    tasks.style.display='block'; bookings.style.display='none';
    btnT.className='btn btn-dark'; btnB.className='btn btn-light';
  }
}

// Finn alle ubestilte reise-elementer (fly/hotell/leiebil) i kalenderen
function getUnbookedTravel(){
  const items=[];
  Object.keys(calEvents).forEach(dateKey=>{
    (calEvents[dateKey]||[]).forEach(e=>{
      if((e.type==='flight'||e.type==='hotel'||e.type==='rental') && e.booked===false){
        items.push({dateKey:dateKey, ev:e});
      }
    });
  });
  items.sort((a,b)=>a.dateKey.localeCompare(b.dateKey)||(a.ev.startMins-b.ev.startMins));
  return items;
}

function renderBookingFollowups(){
  const list = document.getElementById('booking-followup-list');
  const badge = document.getElementById('ftab-bookings-count');
  if(!list) return;
  const items = getUnbookedTravel();
  if(badge){
    if(items.length>0){ badge.textContent=items.length; badge.style.display='inline-block'; }
    else badge.style.display='none';
  }
  if(items.length===0){
    list.innerHTML='<div class="empty-state">Alle reiser er bestilt ✓</div>';
    return;
  }
  const typeLbl={flight:'Fly',hotel:'Hotell',rental:'Leiebil'};
  let html='';
  let lastDate='';
  items.forEach(it=>{
    const e=it.ev;
    if(it.dateKey!==lastDate){
      lastDate=it.dateKey;
      const d=new Date(it.dateKey+'T12:00:00');
      const dStr=d.toLocaleDateString('no-NO',{weekday:'long',day:'numeric',month:'long'});
      html+='<div class="section-label" style="margin-top:14px">'+dStr.charAt(0).toUpperCase()+dStr.slice(1)+'</div>';
    }
    const f=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
    const agenda=(e.agenda||'').replace(/</g,'&lt;');
    html+='<div style="background:#fff;border:1px solid #E5B8B0;border-left:4px solid #A23B27;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px">'+
      '<span style="font-size:16px;flex-shrink:0">❌</span>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-weight:700;font-size:13px;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(e.label||'')+'</div>'+
        '<div style="font-size:11px;color:#888780">'+typeLbl[e.type]+' · '+f(e.startMins)+(agenda?' · '+agenda:'')+'</div>'+
      '</div>'+
      '<button class="btn btn-sm" onclick="markTravelBooked(\''+it.dateKey+'\','+e.startMins+',\''+(e.label||'').replace(/'/g,"\\'")+'\')" style="background:#1A5C3A;color:#fff;flex-shrink:0;white-space:nowrap">✓ Bestilt</button>'+
      '</div>';
  });
  list.innerHTML=html;
}

function markTravelBooked(dateKey, startMins, label){
  if(_roGuard()) return;
  const evs = calEvents[dateKey]||[];
  const ev = evs.find(x=>x.startMins===startMins && (x.label||'')===label);
  if(!ev) return;
  ev.booked = true;
  saveData('alfa_events', calEvents);
  renderBookingFollowups();
  showToast('✅ '+label+' merket som bestilt');
}
