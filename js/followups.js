// ─── FOLLOWUPS ──────────────────────────────────────────────────────────────

// ─ Delte oppfølginger: in-memory cache ─
let _sharedFollowups = [];
let _sharedFetchTs = 0;
let _teamProfCache = null;

async function _loadTeamProfs(){
  if(_teamProfCache) return _teamProfCache;
  if(!window._sbUser) return [];
  try{
    const r=await sbFetch('/rest/v1/profiles?select=user_id,full_name&order=full_name',{method:'GET'});
    if(!r.ok) return [];
    _teamProfCache=await r.json();
    return _teamProfCache;
  }catch(e){ return []; }
}

function _profName(uid){
  if(!uid) return '?';
  if(!_teamProfCache) return uid.slice(0,8)+'…';
  const p=_teamProfCache.find(x=>x.user_id===uid);
  return p?p.full_name:uid.slice(0,8)+'…';
}

async function _fetchSharedFollowups(){
  if(Date.now()-_sharedFetchTs<30000) return;
  _sharedFetchTs=Date.now();
  if(!window._sbUser||window._demoMode||window._viewOnlyMode||window._leaderHome) return;
  try{
    await _loadTeamProfs();
    const r=await sbFetch('/rest/v1/shared_followups?select=*&order=due',{method:'GET'});
    if(!r.ok) return;
    _sharedFollowups=await r.json();
    renderFollowups();
  }catch(e){}
}

function followItem(f, myId){
  const pclass={high:'ph',medium:'pm',low:'pl'}[f.priority]||'pm';
  const isOverdue=f.due<TODAY_STR&&!f.done;
  const isShared=f._src==='shared';
  const isOwner=isShared&&f.owner_id===myId;

  let badge='';
  if(isShared){
    const who=isOwner
      ?'Delt med '+(f.shared_with||[]).map(uid=>escapeHtml(_profName(uid))).join(', ')
      :'Delt av '+escapeHtml(_profName(f.owner_id));
    badge='<span style="font-size:10px;background:#E8F0FE;color:#0C447C;border-radius:6px;padding:1px 7px;font-weight:600;margin-left:5px">👥 '+who+'</span>';
  }

  let doneExtra='';
  if(f.done&&isShared&&f.done_by) doneExtra=' · fullført av '+escapeHtml(_profName(f.done_by));

  let btns;
  if(!f.done){
    if(isShared){
      btns='<div style="display:flex;gap:4px;flex-shrink:0">'
        +'<button onclick="_editSharedFollowup(\''+f.id+'\')" style="background:none;border:1px solid #D3D1C7;border-radius:8px;color:#5F5E5A;font-size:14px;cursor:pointer;padding:3px 8px;line-height:1" title="Rediger">✎</button>'
        +'<button class="btn btn-light btn-sm" onclick="_doneSharedFollowup(\''+f.id+'\')">✓</button>'
        +(isOwner?'<button onclick="_deleteSharedFollowup(\''+f.id+'\')" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0 0 0 4px" title="Slett">🗑</button>':'')
        +'</div>';
    }else{
      btns='<div style="display:flex;gap:4px;flex-shrink:0">'
        +'<button onclick="_shareFollowup('+f.id+')" style="background:none;border:1px solid #9DC1E8;border-radius:8px;color:#0C447C;font-size:11px;cursor:pointer;padding:3px 7px;line-height:1;font-weight:600" title="Del med team">👥</button>'
        +'<button onclick="_openFollowupEditModal('+f.id+')" style="background:none;border:1px solid #D3D1C7;border-radius:8px;color:#5F5E5A;font-size:14px;cursor:pointer;padding:3px 8px;line-height:1" title="Rediger">✎</button>'
        +'<button class="btn btn-light btn-sm" onclick="markDone('+f.id+')">✓</button>'
        +'</div>';
    }
  }else{
    if(isShared){
      btns='<button onclick="_undoneSharedFollowup(\''+f.id+'\')" style="background:none;border:1px solid #D3D1C7;border-radius:8px;color:#5F5E5A;font-size:11px;cursor:pointer;padding:2px 7px;white-space:nowrap">↩ Åpne igjen</button>'
        +(isOwner?'<button onclick="_deleteSharedFollowup(\''+f.id+'\')" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0 0 0 6px" title="Slett">🗑</button>':'');
    }else{
      btns='<button onclick="markUndone('+f.id+')" style="background:none;border:1px solid #D3D1C7;border-radius:8px;color:#5F5E5A;font-size:11px;cursor:pointer;padding:2px 7px;white-space:nowrap">↩ Åpne igjen</button>'
        +'<button onclick="deleteFollowup('+f.id+')" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0 0 0 6px" title="Slett">🗑</button>';
    }
  }

  return '<div class="follow-item'+(f.done?' fdone':'')+'"><div class="pdot '+pclass+'"></div>'
    +'<div class="fi">'
    +'<div class="ftitle">'+escapeHtml(f.task)+' — '+escapeHtml(f.customer)+badge+'</div>'
    +'<div class="fdue'+(isOverdue?' furgent':'')+'">Forfaller '+f.due.split('-').reverse().join('.')+(isOverdue?' · FORFALT':'')+doneExtra+'</div>'
    +'</div>'
    +btns
    +'</div>';
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

function markUndone(id){
  if(_roGuard()) return;
  followups=followups.map(f=>f.id===id?{...f,done:false}:f);
  saveData('alfa_followups',followups);
  renderFollowups();
  showToast('Oppfølging gjenåpnet');
}

function deleteFollowup(id){
  if(_roGuard()) return;
  if(!confirm('Slett denne oppfølgingen? (kan ikke angres)')) return;
  followups=followups.filter(function(f){ return f.id!==id; });
  saveData('alfa_followups',followups);
  renderFollowups();
  showToast('Oppfølging slettet');
}

function _followMatch(f, words){
  if(!words.length) return true;
  const prio={high:'høy',medium:'medium',low:'lav'}[f.priority]||f.priority||'';
  const dueFmt=f.due?f.due.split('-').reverse().join('.'):'';
  const hay=[f.task||'',f.customer||'',f.due||'',dueFmt,prio].join(' ').toLowerCase();
  return words.every(w=>hay.includes(w));
}

function renderFollowups(){
  const myId=((_sbSession()||{}).user||{}).id||'';
  if(window._sbUser&&!window._demoMode&&!window._viewOnlyMode&&!window._leaderHome) _fetchSharedFollowups();
  const q=((document.getElementById('follow-search')||{}).value||'').toLowerCase();
  const words=q.split(/\s+/).filter(Boolean);
  const allOpen=[
    ...followups.filter(f=>!f.done).map(f=>({...f,_src:'local'})),
    ..._sharedFollowups.filter(f=>!f.done).map(f=>({...f,_src:'shared'}))
  ].sort((a,b)=>a.due.localeCompare(b.due)).filter(f=>_followMatch(f,words));
  const allDone=[
    ...followups.filter(f=>f.done).map(f=>({...f,_src:'local'})),
    ..._sharedFollowups.filter(f=>f.done).map(f=>({...f,_src:'shared'}))
  ].filter(f=>_followMatch(f,words));
  const emptyMsg=words.length
    ?'<div class="empty-state">Ingen treff for «'+escapeHtml(q)+'»</div>'
    :'<div class="empty-state">Ingen åpne oppfølginger ✓</div>';
  let html=allOpen.length===0?emptyMsg:allOpen.map(f=>followItem(f,myId)).join('');
  if(allDone.length>0) html+='<div class="section-label" style="margin-top:20px">Gjennomførte ('+allDone.length+')</div>'+allDone.map(f=>followItem(f,myId)).join('');
  document.getElementById('followup-list').innerHTML=html;
  renderBookingFollowups();
}

// ─── LOKALE OPPFØLGINGER — rediger ───────────────────────────────────────────

function _openFollowupEditModal(id){
  if(_roGuard()) return;
  const f=followups.find(x=>x.id===id);
  if(!f) return;
  const existing=document.getElementById('follow-edit-modal');
  if(existing) existing.remove();
  const modal=document.createElement('div');
  modal.id='follow-edit-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.innerHTML=
    '<div style="background:#fff;border-radius:14px;width:480px;max-width:100%;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
    +'<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
    +'<div><div style="font-size:15px;font-weight:700;color:#2C2C2A">Rediger oppfølging</div>'
    +'<div style="font-size:12px;color:#5F5E5A;margin-top:2px">'+escapeHtml(f.customer)+'</div></div>'
    +'<button onclick="document.getElementById(\'follow-edit-modal\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;padding:0 4px;line-height:1;flex-shrink:0">×</button>'
    +'</div>'
    +'<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    +'<div><label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">Oppgave</label>'
    +'<textarea id="follow-edit-task" style="width:100%;min-height:90px;padding:10px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;line-height:1.55;resize:vertical;box-sizing:border-box;font-family:inherit;color:#2C2C2A"></textarea></div>'
    +'<div><label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">Frist</label>'
    +'<input type="date" id="follow-edit-due" style="width:100%;padding:10px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;box-sizing:border-box;font-family:inherit;color:#2C2C2A"></div>'
    +'</div>'
    +'<div style="padding:0 16px 14px;display:flex;gap:8px">'
    +'<button onclick="window._followEditSave()" style="flex:1;padding:10px;background:#2C2C2A;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Lagre</button>'
    +'<button onclick="document.getElementById(\'follow-edit-modal\').remove()" style="padding:10px 18px;background:#F1EFE8;border:none;border-radius:8px;font-size:13px;cursor:pointer;color:#5F5E5A">Avbryt</button>'
    +'</div>'
    +'</div>';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  window._followEditSave=function(){
    const ta=document.getElementById('follow-edit-task');
    const dt=document.getElementById('follow-edit-due');
    if(!ta||!dt) return;
    const newTask=ta.value.trim();
    const newDue=dt.value;
    if(!newTask||!newDue){ showToast('Fyll ut oppgave og frist'); return; }
    modal.remove();
    delete window._followEditSave;
    followups=followups.map(x=>x.id===id?{...x,task:newTask,due:newDue}:x);
    saveData('alfa_followups',followups);
    renderFollowups();
    showToast('Oppfølging oppdatert');
  };
  document.body.appendChild(modal);
  setTimeout(function(){
    const ta=document.getElementById('follow-edit-task');
    const dt=document.getElementById('follow-edit-due');
    if(ta){ ta.value=f.task; ta.focus(); }
    if(dt) dt.value=f.due;
  },30);
}

// ─── DELTE OPPFØLGINGER — operasjoner ────────────────────────────────────────

async function _shareFollowup(id){
  if(_roGuard()) return;
  const f=followups.find(x=>x.id===id);
  if(!f) return;
  const myId=((_sbSession()||{}).user||{}).id||'';
  const profs=await _loadTeamProfs();
  const others=profs.filter(p=>p.user_id!==myId);
  if(others.length===0){ showToast('Ingen andre teammedlemmer funnet'); return; }

  const existing=document.getElementById('share-follow-modal');
  if(existing) existing.remove();
  const modal=document.createElement('div');
  modal.id='share-follow-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:14px';

  let rows='';
  others.forEach(p=>{
    rows+='<label style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F1EFE8;cursor:pointer">'
      +'<input type="checkbox" class="share-cb" value="'+p.user_id+'" style="width:16px;height:16px;accent-color:#0C447C;flex-shrink:0">'
      +'<span style="font-size:13px;color:#2C2C2A">'+escapeHtml(p.full_name)+'</span>'
      +'</label>';
  });

  modal.innerHTML=
    '<div style="background:#fff;border-radius:14px;width:400px;max-width:100%;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
    +'<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
    +'<div><div style="font-size:15px;font-weight:700;color:#2C2C2A">Del oppfølging</div>'
    +'<div style="font-size:12px;color:#5F5E5A;margin-top:2px">'+escapeHtml(f.task.slice(0,60)+(f.task.length>60?'…':''))+' — '+escapeHtml(f.customer)+'</div></div>'
    +'<button onclick="document.getElementById(\'share-follow-modal\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;padding:0 4px;line-height:1;flex-shrink:0">×</button>'
    +'</div>'
    +'<div style="padding:14px 16px">'+rows+'</div>'
    +'<div style="padding:0 16px 14px;display:flex;gap:8px">'
    +'<button id="share-confirm-btn" onclick="window._shareFollowupConfirm()" style="flex:1;padding:10px;background:#0C447C;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">👥 Del med valgte</button>'
    +'<button onclick="document.getElementById(\'share-follow-modal\').remove()" style="padding:10px 18px;background:#F1EFE8;border:none;border-radius:8px;font-size:13px;cursor:pointer;color:#5F5E5A">Avbryt</button>'
    +'</div>'
    +'</div>';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };

  window._shareFollowupConfirm=async function(){
    const checked=[...modal.querySelectorAll('.share-cb:checked')].map(cb=>cb.value);
    if(!checked.length){ showToast('Velg minst én person'); return; }
    // Les fersk sesjon inne i callbacken — ikke stol på closure-variabel
    const _s=_sbSession();
    if(!_s||!_s.access_token||!(_s.user||{}).id){
      showToast('Økt utløpt — last siden på nytt'); return;
    }
    const uid=_s.user.id;
    const btn=document.getElementById('share-confirm-btn');
    if(btn){ btn.disabled=true; btn.textContent='Deler…'; }
    const payload={
      owner_id:uid,
      shared_with:checked,
      customer:f.customer,
      task:f.task,
      due:f.due,
      priority:f.priority||'medium',
      done:false
    };
    try{
      const r=await sbFetch('/rest/v1/shared_followups',{
        method:'POST',
        headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify(payload)
      });
      if(!r.ok){
        let body=''; try{ body=(await r.text()).slice(0,200); }catch(e){}
        throw new Error('HTTP '+r.status+(body?' — '+body:''));
      }
      // Fjern fra lokal ETTER vellykket INSERT
      followups=followups.filter(x=>x.id!==id);
      saveData('alfa_followups',followups);
      _sharedFetchTs=0;
      modal.remove();
      delete window._shareFollowupConfirm;
      await _fetchSharedFollowups();
      showToast('Oppfølging delt med '+checked.length+' person(er)');
    }catch(e){
      if(btn){ btn.disabled=false; btn.textContent='👥 Del med valgte'; }
      showToast('Deling feilet: '+(e.message||e));
    }
  };
  document.body.appendChild(modal);
}

function _editSharedFollowup(id){
  if(_roGuard()) return;
  const f=_sharedFollowups.find(x=>x.id===id);
  if(!f) return;
  const existing=document.getElementById('follow-edit-modal');
  if(existing) existing.remove();
  const modal=document.createElement('div');
  modal.id='follow-edit-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.innerHTML=
    '<div style="background:#fff;border-radius:14px;width:480px;max-width:100%;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
    +'<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
    +'<div><div style="font-size:15px;font-weight:700;color:#2C2C2A">Rediger delt oppfølging</div>'
    +'<div style="font-size:12px;color:#5F5E5A;margin-top:2px">'+escapeHtml(f.customer)+' · 👥 Delt</div></div>'
    +'<button onclick="document.getElementById(\'follow-edit-modal\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;padding:0 4px;line-height:1;flex-shrink:0">×</button>'
    +'</div>'
    +'<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    +'<div><label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">Oppgave</label>'
    +'<textarea id="follow-edit-task" style="width:100%;min-height:90px;padding:10px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;line-height:1.55;resize:vertical;box-sizing:border-box;font-family:inherit;color:#2C2C2A"></textarea></div>'
    +'<div><label style="font-size:12px;font-weight:600;color:#5F5E5A;display:block;margin-bottom:4px">Frist</label>'
    +'<input type="date" id="follow-edit-due" style="width:100%;padding:10px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;box-sizing:border-box;font-family:inherit;color:#2C2C2A"></div>'
    +'</div>'
    +'<div style="padding:0 16px 14px;display:flex;gap:8px">'
    +'<button onclick="window._followEditSave()" style="flex:1;padding:10px;background:#2C2C2A;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Lagre</button>'
    +'<button onclick="document.getElementById(\'follow-edit-modal\').remove()" style="padding:10px 18px;background:#F1EFE8;border:none;border-radius:8px;font-size:13px;cursor:pointer;color:#5F5E5A">Avbryt</button>'
    +'</div>'
    +'</div>';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  window._followEditSave=async function(){
    const ta=document.getElementById('follow-edit-task');
    const dt=document.getElementById('follow-edit-due');
    if(!ta||!dt) return;
    const newTask=ta.value.trim();
    const newDue=dt.value;
    if(!newTask||!newDue){ showToast('Fyll ut oppgave og frist'); return; }
    modal.remove();
    delete window._followEditSave;
    try{
      await sbFetch('/rest/v1/shared_followups?id=eq.'+id,{
        method:'PATCH',
        headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({task:newTask,due:newDue,updated_at:new Date().toISOString()})
      });
      _sharedFetchTs=0;
      await _fetchSharedFollowups();
      showToast('Delt oppfølging oppdatert');
    }catch(e){ showToast('Lagring feilet'); }
  };
  document.body.appendChild(modal);
  setTimeout(function(){
    const ta=document.getElementById('follow-edit-task');
    const dt=document.getElementById('follow-edit-due');
    if(ta){ ta.value=f.task; ta.focus(); }
    if(dt) dt.value=f.due;
  },30);
}

async function _doneSharedFollowup(id){
  if(_roGuard()) return;
  const myId=((_sbSession()||{}).user||{}).id||'';
  try{
    await sbFetch('/rest/v1/shared_followups?id=eq.'+id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({done:true,done_by:myId,updated_at:new Date().toISOString()})
    });
    _sharedFetchTs=0;
    await _fetchSharedFollowups();
    showToast('Oppfølging fullført for alle');
  }catch(e){ showToast('Feilet'); }
}

async function _undoneSharedFollowup(id){
  if(_roGuard()) return;
  try{
    await sbFetch('/rest/v1/shared_followups?id=eq.'+id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({done:false,done_by:null,updated_at:new Date().toISOString()})
    });
    _sharedFetchTs=0;
    await _fetchSharedFollowups();
    showToast('Delt oppfølging gjenåpnet for alle');
  }catch(e){ showToast('Feilet'); }
}

async function _deleteSharedFollowup(id){
  if(_roGuard()) return;
  if(!confirm('Slett delt oppfølging? Den forsvinner for alle. (kan ikke angres)')) return;
  try{
    await sbFetch('/rest/v1/shared_followups?id=eq.'+id,{method:'DELETE'});
    _sharedFetchTs=0;
    await _fetchSharedFollowups();
    showToast('Delt oppfølging slettet');
  }catch(e){ showToast('Sletting feilet'); }
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
