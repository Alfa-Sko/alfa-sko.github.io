// ─── TIDSLINJE ──────────────────────────────────────────────────────────────

async function _loadTlPhotos(it){
  var el = document.getElementById('tl-photos-'+it.id);
  if(!el) return;
  var photos = await getStoragePhotosForVisit({photoPaths:it.photoPaths});
  if(!photos.length) return;
  var isCustPhoto = it.kind==='custphoto';
  var delFnName = isCustPhoto ? 'deleteSingleCustPhoto' : 'deleteSingleVisitPhoto';
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px">'
    + photos.map(function(p){
        var safeUrl=p.url.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        var safeName=p.name.replace(/'/g,"\\'");
        return '<div style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid #D3D1C7;position:relative">'
          +'<img src="'+p.url+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" loading="lazy" alt="'+p.name+'" onclick="viewPhoto(\''+safeUrl+'\',\''+safeName+'\')">'
          +(p.path?'<button onclick="'+delFnName+'('+it.id+',\''+p.path+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
          +'</div>';
      }).join('')
    + '</div>';
}

function saveFreeNote(){
  if(_roGuard()) return;
  const text=document.getElementById('free-note-text').value.trim();
  const date=document.getElementById('free-note-date').value;
  const tag=document.getElementById('free-note-tag').value.trim();
  if(!text){ showToast('Skriv inn et notat først'); return; }
  if(!date){ showToast('Sett dato'); return; }
  freeNotes.push({id:(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'fn_'+Date.now()+'_'+Math.random().toString(36).slice(2)), date, text, tag, createdAt:new Date().toISOString()});
  saveData('alfa_free_notes', freeNotes);
  document.getElementById('free-note-text').value='';
  document.getElementById('free-note-tag').value='';
  showToast('Notat lagt til i tidslinjen');
  renderTimeline();
}

function deleteFreeNote(id){
  if(_roGuard()) return;
  if(!confirm('Slett dette frie notatet?')) return;
  freeNotes=freeNotes.filter(n=>String(n.id)!==String(id));
  saveData('alfa_free_notes', freeNotes);
  renderTimeline();
  showToast('Notat slettet');
}

function editFreeNote(id){
  if(_roGuard()) return;
  var n=freeNotes.find(function(x){ return String(x.id)===String(id); });
  if(!n) return;
  _openNoteEditModal({
    text: n.text||'',
    subtitle: (n.tag||'Fritt notat')+' · '+n.date.split('-').reverse().join('.'),
    onSave: function(newText){
      if(!newText){
        // Tomt fritt notat → slett
        freeNotes=freeNotes.filter(function(x){ return String(x.id)!==String(id); });
        saveData('alfa_free_notes', freeNotes);
        renderTimeline();
        showToast('Tomt notat slettet');
      } else {
        n.text=newText;
        saveData('alfa_free_notes', freeNotes);
        renderTimeline();
        showToast('Notat oppdatert');
      }
    }
  });
}

function renderTimeline(){
  if(window._leaderHome && !window._mgrBackup){ renderTeamTimeline(); return; }
  const list=document.getElementById('timeline-list');
  if(!list) return;
  const q=(document.getElementById('timeline-search').value||'').toLowerCase();
  const filter=document.getElementById('timeline-filter').value||'all';
  // Bygg én kombinert tidslinje av visits + freeNotes
  const items=[];
  visits.forEach(v=>{
    items.push({
      kind:'activity',
      type:v.type||'visit',
      date:v.date,
      time:v.time||'',
      timeEnd:v.timeEnd||'',
      title:v.customer,
      contact:v.contact,
      notes:v.notes,
      followup:v.followup,
      id:v.id,
      photoPaths:v.photoPaths||[],
      sortKey:v.date+'T'+(v.time||'00:00')
    });
  });
  freeNotes.forEach(n=>{
    let noteTime='';
    if(n.createdAt){
      const cd=new Date(n.createdAt);
      if(!isNaN(cd)) noteTime=String(cd.getHours()).padStart(2,'0')+':'+String(cd.getMinutes()).padStart(2,'0');
    }
    items.push({
      kind:'free',
      type:'free',
      date:n.date,
      time:noteTime,
      title:n.tag||'Fritt notat',
      notes:n.text,
      id:n.id,
      sortKey:n.date+'T'+(noteTime||'23:59')
    });
  });
  (custPhotos||[]).forEach(p=>{
    let pTime='';
    if(p.createdAt){
      const cd=new Date(p.createdAt);
      if(!isNaN(cd)) pTime=String(cd.getHours()).padStart(2,'0')+':'+String(cd.getMinutes()).padStart(2,'0');
    }
    items.push({
      kind:'custphoto',
      type:'photo',
      date:p.date,
      time:pTime,
      title:p.customer,
      id:p.id,
      photoPaths:p.photoPaths||[],
      sortKey:p.date+'T'+(pTime||'23:59')
    });
  });
  // Sortér nyeste først
  items.sort((a,b)=>b.sortKey.localeCompare(a.sortKey));
  // Filtrér
  const filtered=items.filter(it=>{
    if(filter!=='all' && it.type!==filter) return false;
    if(q){
      const hay=((it.title||'')+' '+(it.notes||'')+' '+(it.contact||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  if(filtered.length===0){
    list.innerHTML='<div class="empty-state">Ingen oppføringer i tidslinjen. Registrer en aktivitet eller legg til et fritt notat for å komme i gang.</div>';
    return;
  }
  // Grupper etter måned-år
  const groups={};
  filtered.forEach(it=>{
    const [y,m]=it.date.split('-');
    const key=y+'-'+m;
    if(!groups[key]) groups[key]=[];
    groups[key].push(it);
  });
  const groupKeys=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  const monthNames=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
  const typeMap={visit:{ico:'🏪',lbl:'Kundebesøk',color:'#888780'},nydalen:{ico:'🏢',lbl:'Besøk Nydalen',color:'#5F5E5A'},phone:{ico:'📞',lbl:'Telefonsamtale',color:'#0C447C'},clinic:{ico:'🎓',lbl:'Clinic',color:'#6D4C00'},teams:{ico:'👥',lbl:'Teamsmøte',color:'#0C447C'},training:{ico:'🏃',lbl:'Trening',color:'#1A7A4E'},lunch:{ico:'🥪',lbl:'Lunsj med kunde',color:'#7A3B0E'},dinner:{ico:'🍽️',lbl:'Middag med kunde',color:'#7A3B0E'},other:{ico:'📌',lbl:'Annet',color:'#5F5E5A'},free:{ico:'💭',lbl:'Fritt notat',color:'#1A7A4E'},photo:{ico:'📷',lbl:'Kundebilde',color:'#185FA5'}};
  let html='';
  groupKeys.forEach(gk=>{
    const [y,m]=gk.split('-');
    const monthLabel=monthNames[parseInt(m)-1]+' '+y;
    html+='<div class="section-label" style="margin-top:18px;text-transform:capitalize">'+monthLabel+'</div>';
    groups[gk].forEach(it=>{
      const t=typeMap[it.type]||typeMap.visit;
      const dateLabel=it.date.split('-').reverse().join('.');
      const timeLabel=it.time?(' · '+it.time+(it.timeEnd?'–'+it.timeEnd:'')):'';
      const isFree=it.kind==='free';
      const isCustPhoto=it.kind==='custphoto';
      const accent=isFree?'#1A7A4E':isCustPhoto?'#185FA5':t.color;
      const bg=isFree?'#E8F4ED':isCustPhoto?'#EEF4FB':'#fff';
      const delFn=isFree?'deleteFreeNote':isCustPhoto?'deleteCustomerPhoto':'deleteVisit';
      html+='<div id="tl-entry-'+it.kind+'-'+it.id+'" class="card" style="margin-bottom:10px;padding:14px;border-left:3px solid '+accent+';background:'+bg+'">';
      html+='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px">';
      html+='<div style="flex:1;min-width:0">';
      html+='<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px"><span style="font-size:16px">'+t.ico+'</span><span style="font-size:14px;font-weight:600;color:#2C2C2A">'+escapeHtml(it.title||'(ingen tittel)')+'</span>';
      if(!isFree){html+='<span style="font-size:10px;padding:1px 6px;background:#F1EFE8;color:#5F5E5A;border-radius:10px;font-weight:600">'+t.lbl+'</span>';}
      else if(it.title && it.title!=='Fritt notat'){html+='<span style="font-size:10px;padding:1px 6px;background:#C8E6D5;color:#1A5C3A;border-radius:10px;font-weight:600">'+t.lbl+'</span>';}
      html+='</div>';
      html+='<div style="font-size:11px;color:#888780">'+dateLabel+timeLabel+(it.contact?' · '+escapeHtml(it.contact):'')+'</div>';
      html+='</div>';
      html+='<button class="btn btn-light btn-sm" style="font-size:10px;color:#A23B27" onclick="'+delFn+'(\''+it.id+'\')">×</button>';
      html+='</div>';
      if(it.notes){
        const _tlSafeCust=(it.title||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        const _tlEditFn=it.kind==='activity'
          ?'openApptFor(\''+_tlSafeCust+'\',\''+it.date+'\')'
          :it.kind==='free'?"editFreeNote('"+it.id+"')":'';
        const _noteEditBtn=it.kind==='activity'
          ?'<button onclick="'+_tlEditFn+'" style="background:none;border:none;color:#5F5E5A;font-size:16px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1" title="Rediger notat">✏</button>'
          +'<button onclick="clearVisitNote(\''+it.id+'\')" style="background:none;border:none;color:#A23B27;font-size:16px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1" title="Slett notat">🗑</button>'
          :it.kind==='free'
          ?'<button onclick="editFreeNote(\''+it.id+'\')" style="background:none;border:none;color:#5F5E5A;font-size:16px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1" title="Rediger notat">✏</button>'
          :'';
        const _tlNoteSpan=_tlEditFn
          ?'<span onclick="'+_tlEditFn+'" style="cursor:pointer;border-radius:4px;padding:3px 5px;margin:-3px -5px;transition:background 0.12s" onmouseover="this.style.background=\'#F0EDE5\'" onmouseout="this.style.background=\'\'" title="Klikk for å redigere">'+escapeHtml(it.notes).replace(/\n/g,'<br>')+'</span>'
          :'<span>'+escapeHtml(it.notes).replace(/\n/g,'<br>')+'</span>';
        html+='<div style="font-size:13px;color:#2C2C2A;line-height:1.55;margin-top:4px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'+_tlNoteSpan+'<div style="display:flex;gap:2px;flex-shrink:0">'+_noteEditBtn+'</div></div>';
      }
      if(it.followup){html+='<div style="margin-top:8px;font-size:11px;color:#633806;background:#FAEEDA;padding:5px 9px;border-radius:6px;display:inline-block">▶ Oppfølging: '+escapeHtml(it.followup)+'</div>';}
      if((it.kind==='activity'||it.kind==='custphoto') && it.photoPaths && it.photoPaths.length){html+='<div id="tl-photos-'+it.id+'" style="margin-top:8px"></div>';}
      html+='<div id="ec-'+it.kind+'-'+it.id+'"></div>';
      html+='</div>';
    });
  });
  list.innerHTML=html;
  filtered.forEach(function(it){ if((it.kind==='activity'||it.kind==='custphoto') && it.photoPaths && it.photoPaths.length) _loadTlPhotos(it); });
  if(window._sbUser && typeof ecFetchBatch==='function'){
    var _ecOwner=window._sbUser.id;
    ecFetchBatch(filtered, _ecOwner).then(function(byId){
      filtered.forEach(function(it){
        if(it.id==null) return;
        var cid='ec-'+it.kind+'-'+it.id;
        var rows=byId[ecTargetType(it)+'::'+String(it.id)]||[];
        ecInjectBlock(cid, ecTargetType(it), it.id, _ecOwner, rows);
      });
    });
  }
}
// ─── FELLES TEAM-TIDSLINJE (ledervisning) ──────────────────────────────────

const TEAM_COLORS = ['#0C447C','#1A5C3A','#A23B27','#6D4C00','#5E3A87','#00695C'];

function renderTeamTimeline(){
  const list=document.getElementById('timeline-list');
  if(!list) return;
  if(!window._teamData || !window._teamProfiles){
    list.innerHTML='<div class="empty-state">Laster teamdata …</div>';
    if(typeof _leaderLoadTeamData==='function'){ _leaderLoadTeamData().then(()=>renderTeamTimeline()); }
    return;
  }
  const q=((document.getElementById('timeline-search')||{}).value||'').toLowerCase();
  const filter=(document.getElementById('timeline-filter')||{}).value||'all';
  const items=[];
  window._teamProfiles.forEach((p,pi)=>{
    const color = TEAM_COLORS[pi % TEAM_COLORS.length];
    const owner = {name:p.full_name, color:color};
    const data = window._teamData[p.user_id]||{};
    (data['alfa_visits']||[]).forEach(v=>{
      items.push({kind:'activity', type:v.type||'visit', date:v.date, time:v.time||'', timeEnd:v.timeEnd||'',
        title:v.customer, contact:v.contact, notes:v.notes, followup:v.followup, owner:owner,
        sortKey:v.date+'T'+(v.time||'00:00')});
    });
    (data['alfa_free_notes']||[]).forEach(n=>{
      let noteTime='';
      if(n.createdAt){ const cd=new Date(n.createdAt); if(!isNaN(cd)) noteTime=String(cd.getHours()).padStart(2,'0')+':'+String(cd.getMinutes()).padStart(2,'0'); }
      items.push({kind:'free', type:'free', date:n.date, time:noteTime, title:n.tag||'Fritt notat',
        notes:n.text, owner:owner, sortKey:n.date+'T'+(noteTime||'23:59')});
    });
  });
  items.sort((a,b)=>b.sortKey.localeCompare(a.sortKey));
  const filtered=items.filter(it=>{
    if(filter!=='all' && it.type!==filter) return false;
    if(q){
      const hay=((it.title||'')+' '+(it.notes||'')+' '+(it.contact||'')+' '+(it.owner.name||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  // Fargeforklaring øverst
  let legend='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center"><span style="font-size:12px;font-weight:700;color:#2C2C2A">👥 Felles tidslinje:</span>';
  window._teamProfiles.forEach((p,pi)=>{
    const c=TEAM_COLORS[pi % TEAM_COLORS.length];
    legend+='<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#5F5E5A"><span style="width:10px;height:10px;border-radius:50%;background:'+c+';display:inline-block"></span>'+escapeHtml(p.full_name)+'</span>';
  });
  legend+='</div>';
  if(filtered.length===0){
    list.innerHTML=legend+'<div class="empty-state">Ingen aktivitet registrert i teamet ennå.</div>';
    return;
  }
  const groups={};
  filtered.forEach(it=>{ const gk=it.date.slice(0,7); (groups[gk]=groups[gk]||[]).push(it); });
  const groupKeys=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  const monthNames=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
  const typeMap={visit:{ico:'🏪',lbl:'Kundebesøk'},nydalen:{ico:'🏢',lbl:'Besøk Nydalen'},phone:{ico:'📞',lbl:'Telefonsamtale'},clinic:{ico:'🎓',lbl:'Clinic'},teams:{ico:'👥',lbl:'Teamsmøte'},training:{ico:'🏃',lbl:'Trening'},lunch:{ico:'🥪',lbl:'Lunsj med kunde'},dinner:{ico:'🍽️',lbl:'Middag med kunde'},other:{ico:'📌',lbl:'Annet'},free:{ico:'💭',lbl:'Fritt notat'}};
  let html=legend;
  groupKeys.forEach(gk=>{
    const [y,m]=gk.split('-');
    html+='<div class="section-label" style="margin-top:18px;text-transform:capitalize">'+monthNames[parseInt(m)-1]+' '+y+'</div>';
    groups[gk].forEach(it=>{
      const t=typeMap[it.type]||typeMap.visit;
      const dateLabel=it.date.split('-').reverse().join('.');
      const timeLabel=it.time?(' · '+it.time+(it.timeEnd?'–'+it.timeEnd:'')):'';
      const c=it.owner.color;
      html+='<div class="card" style="margin-bottom:10px;padding:14px;border-left:4px solid '+c+'">';
      html+='<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">';
      html+='<span style="background:'+c+';color:#fff;font-size:10px;font-weight:700;padding:2px 9px;border-radius:10px">'+escapeHtml(it.owner.name)+'</span>';
      html+='<span style="font-size:16px">'+t.ico+'</span><span style="font-size:14px;font-weight:600;color:#2C2C2A">'+escapeHtml(it.title||'(ingen tittel)')+'</span>';
      html+='<span style="font-size:10px;padding:1px 6px;background:#F1EFE8;color:#5F5E5A;border-radius:10px;font-weight:600">'+t.lbl+'</span>';
      html+='</div>';
      html+='<div style="font-size:11px;color:#888780">'+dateLabel+timeLabel+(it.contact?' · '+escapeHtml(it.contact):'')+'</div>';
      if(it.notes){html+='<div style="font-size:13px;color:#2C2C2A;line-height:1.55;margin-top:4px">'+escapeHtml(it.notes).replace(/\n/g,'<br>')+'</div>';}
      if(it.followup){html+='<div style="margin-top:8px;font-size:11px;color:#633806;background:#FAEEDA;padding:5px 9px;border-radius:6px;display:inline-block">▶ Oppfølging: '+escapeHtml(it.followup)+'</div>';}
      html+='</div>';
    });
  });
  list.innerHTML=html;
}
async function renderNotesWithPhotos(){
  const q=(document.getElementById('notes-search').value||'').toLowerCase();
  const sorted=[...visits].sort((a,b)=>b.date.localeCompare(a.date));
  const filtered=sorted.filter(v=>!q||v.customer.toLowerCase().includes(q)||(v.notes||'').toLowerCase().includes(q));
  if(filtered.length===0){document.getElementById('notes-list').innerHTML='<div class="empty-state">Ingen aktiviteter funnet. Registrer en aktivitet for å komme i gang.</div>';return;}
  const tMap={visit:{ico:'🏪',lbl:'Kundebesøk'},nydalen:{ico:'🏢',lbl:'Besøk Nydalen'},phone:{ico:'📞',lbl:'Telefonsamtale'},clinic:{ico:'🎓',lbl:'Clinic'},dinner:{ico:'🍽️',lbl:'Kundemiddag'}};
  const items = await Promise.all(filtered.map(async v=>{
    // Storage-bilder (innlogget, photoPaths) → IndexedDB som fallback for eldre lokale bilder
    const storagePhotos = await getStoragePhotosForVisit(v);
    const localPhotos = storagePhotos.length===0 ? await getPhotosForVisit(v.id) : [];
    const allPhotos = [
      ...storagePhotos.map(p=>({src:p.url, name:p.name, path:p.path||null})),
      ...localPhotos.map(p=>({src:p.data, name:p.name, path:null})),
    ];
    const thumbsHtml = allPhotos.length>0
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;margin-bottom:8px">${allPhotos.map(p=>`<div style="aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid #D3D1C7;position:relative"><img src="${p.src}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" alt="${p.name}" onclick="viewPhoto('${p.src.replace(/'/g,"\\'")}','${p.name.replace(/'/g,"\\'")}'">${p.path?`<button onclick="deleteSingleVisitPhoto('${v.id}','${p.path.replace(/'/g,"\\'")}')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>`:''}</div>`).join('')}</div>`
      : '';
    const photoHtml = `<div style="margin-top:12px">${allPhotos.length>0?`<div style="font-size:11px;color:#888780;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Bilder (${allPhotos.length})</div>`:''}${thumbsHtml}<label class="btn btn-light btn-sm" style="font-size:11px;cursor:pointer;display:inline-block">+ Legg til bilde<input type="file" accept="image/*" multiple style="display:none" onchange="addPhotoToVisit('${v.id}',this)"></label></div>`;
    const t=tMap[v.type]||tMap.visit;
    const typePill=`<span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#F1EFE8;color:#444441;font-weight:600;margin-left:6px">${t.ico} ${t.lbl}</span>`;
    const _nwpSafe=v.customer.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const _nwpEditFn="openApptFor('"+_nwpSafe+"','"+v.date+"')";
    const notesHtml = v.notes ? `<div style="font-size:13px;color:#2C2C2A;line-height:1.6;display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><span onclick="${_nwpEditFn}" style="cursor:pointer;border-radius:4px;padding:3px 5px;margin:-3px -5px;transition:background 0.12s" onmouseover="this.style.background='#F0EDE5'" onmouseout="this.style.background=''" title="Klikk for å redigere">${escapeHtml(v.notes).replace(/\n/g,'<br>')}</span><div style="display:flex;gap:2px;flex-shrink:0"><button onclick="${_nwpEditFn}" style="background:none;border:none;color:#5F5E5A;font-size:16px;cursor:pointer;padding:2px 4px;line-height:1" title="Rediger notat">✏</button><button onclick="clearVisitNote('${v.id}')" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:2px 4px;flex-shrink:0" title="Slett notat">🗑</button></div></div>` : '<div style="font-size:12px;color:#888780;font-style:italic">Ingen notat</div>';
    return `<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div><div style="font-size:14px;font-weight:600;color:#2C2C2A">${v.customer}${typePill}</div><div style="font-size:11px;color:#888780">${v.date.split('-').reverse().join('.')} · ${v.time||''}${v.timeEnd?' – '+v.timeEnd:''} · ${v.contact||''}</div></div><button class="btn btn-red btn-sm" onclick="deleteVisit('${v.id}')">Slett</button></div>${notesHtml}${v.followup?`<div style="margin-top:10px;font-size:12px;color:#633806;background:#FAEEDA;padding:6px 10px;border-radius:6px">▶ Oppfølging: ${v.followup}</div>`:''} ${photoHtml}</div>`;
  }));
  document.getElementById('notes-list').innerHTML=items.join('');
}

function renderNotes(){ renderNotesWithPhotos(); }
