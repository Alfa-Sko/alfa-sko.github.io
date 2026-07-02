// ─── MOBILE NAV ─────────────────────────────────────────────────────────────

function mobileNav(id, el) {
  showSection(id, document.querySelector('.nav-item'));
  document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
}

function mobileShowMer(el){
  const menu=document.getElementById('mer-menu');
  if(!menu) return;
  menu.style.display = menu.style.display==='none' ? 'block' : 'none';
  document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
  if(menu.style.display==='block' && el) el.classList.add('active');
}
function closeMer(){
  const menu=document.getElementById('mer-menu');
  if(menu) menu.style.display='none';
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

function showSection(id, el){
  document.querySelectorAll('.section').forEach(s=>s.style.display='none');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const sec = document.getElementById('sec-'+id);
  if(sec) sec.style.display='block';
  if(el) el.classList.add('active');
  // Sync mobile nav
  const mobileMap = {oversikt:'mni-oversikt',kalender:'mni-kalender',kunder:'mni-kunder',tidslinje:'mni-tidslinje'};
  document.querySelectorAll('.mobile-nav-item').forEach(b=>b.classList.remove('active'));
  const mniId = mobileMap[id];
  if(mniId){const mniEl=document.getElementById(mniId);if(mniEl)mniEl.classList.add('active');}
  if(id==='lookbooks'){ setTimeout(lbRender,0); setTimeout(sbRenderCatalogs,0); }
  if(id==='kalender') renderCal();
  if(id==='kunder') renderCustomers();
  if(id==='regionplan'){ rpInitRegionSelect(); rpRenderCustomerList(); }
  if(id==='notater') renderNotes();
  if(id==='oversikt') renderOverview();
  if(id==='oppfolging'){ populateFollowCustomers(); renderFollowups(); }
  if(id==='nytt-besok') populateVisitCustomers();
  if(id==='tidslinje'){ document.getElementById('free-note-date').value=TODAY_STR; renderTimeline(); }
  if(id==='profil'){ loadProfileIntoForm(); if(window._syncCardUpdate) window._syncCardUpdate(); if(typeof plRefreshAdminSection==='function') plRefreshAdminSection(); }
  if(id==='prisliste'){ plLoad(); rkCalculate(); }
  if(id==='kart') mapInitOverview();
  if(id==='hjelp') renderHelp();
}

// ─── KUNDEVELGER MED LIVE-LISTE ───────────────────────────────────────────────
// Monterer søkefelt + filtre + klikkbar resultatliste i `barEl`.
// opts: { prefix, topRows:[{value,label}], onPick(name), onTopRow(value), maxRows }
// Eksponerer window['_csp_'+prefix+'_setSelected'](name) for ekstern pre-valg.
function _csMountPicker(barEl, customers, opts){
  if(!barEl) return;
  opts = opts||{};
  var prefix = opts.prefix||'cspk';
  var maxRows = opts.maxRows||25;
  var topRows = opts.topRows||[];
  var onPick = opts.onPick||function(){};
  var onTopRow = opts.onTopRow||function(){};
  var qId=prefix+'-q', chainId=prefix+'-chain', cityId=prefix+'-city', cstId=prefix+'-cst';
  var listId=prefix+'-list', badgeId=prefix+'-badge', badgeTxtId=prefix+'-badgetxt';

  var nameById={};
  if(typeof constellations!=='undefined') constellations.forEach(function(c){ nameById[c.id]=c.name; });
  var chainSet={},citySet={},cstSet={};
  customers.forEach(function(c){
    if(c.chain) chainSet[c.chain]=true;
    if(c.city) citySet[c.city]=true;
    if(c.constellation_id) cstSet[c.constellation_id]=true;
  });
  var chains=Object.keys(chainSet).sort(function(a,b){ return a.localeCompare(b,'no'); });
  var cities=Object.keys(citySet).sort(function(a,b){ return a.localeCompare(b,'no'); });
  var csts=Object.keys(cstSet).map(function(id){ return {id:id,name:nameById[id]||id}; }).sort(function(a,b){ return a.name.localeCompare(b.name,'no'); });
  var hasFilters=chains.length>1||cities.length>1||csts.length>1;

  var html='';
  // Valgt-badge (skjult til noe er valgt)
  html+='<div id="'+badgeId+'" style="display:none;padding:7px 10px;background:#E8F4ED;border:1px solid #B8D4C2;border-radius:8px;margin-bottom:6px;align-items:center;gap:8px">';
  html+='<span style="color:#1A5C3A;font-size:13px;flex-shrink:0">✓</span>';
  html+='<span id="'+badgeTxtId+'" style="flex:1;font-size:13px;font-weight:500;color:#1A5C3A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>';
  html+='<button id="'+prefix+'-clearbtn" style="background:none;border:none;font-size:16px;cursor:pointer;color:#888780;padding:0;flex-shrink:0;line-height:1" title="Fjern valg">×</button>';
  html+='</div>';
  // Søkefelt
  html+='<input type="text" id="'+qId+'" placeholder="Søk navn, by, kjede …" autocomplete="off" style="width:100%;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:5px">';
  // Filtre
  if(hasFilters){
    html+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">';
    if(chains.length>1){
      html+='<select id="'+chainId+'" style="flex:1;min-width:80px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff"><option value="">Alle kjeder</option>';
      chains.forEach(function(ch){ html+='<option value="'+escapeHtml(ch)+'">'+escapeHtml(ch)+'</option>'; });
      html+='</select>';
    }
    if(cities.length>1){
      html+='<select id="'+cityId+'" style="flex:1;min-width:80px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff"><option value="">Alle byer</option>';
      cities.forEach(function(ci){ html+='<option value="'+escapeHtml(ci)+'">'+escapeHtml(ci)+'</option>'; });
      html+='</select>';
    }
    if(csts.length>1){
      html+='<select id="'+cstId+'" style="flex:1;min-width:80px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff"><option value="">Alle konst.</option>';
      csts.forEach(function(c){ html+='<option value="'+c.id+'">'+escapeHtml(c.name)+'</option>'; });
      html+='</select>';
    }
    html+='</div>';
  }
  // Resultatliste
  html+='<div id="'+listId+'" style="border:1px solid #D3D1C7;border-radius:8px;overflow:hidden;max-height:220px;overflow-y:auto;background:#fff"></div>';
  barEl.innerHTML=html;

  var _sel='';

  function _getF(){ return {q:(document.getElementById(qId)||{value:''}).value||'',chain:(document.getElementById(chainId)||{value:''}).value||'',city:(document.getElementById(cityId)||{value:''}).value||'',cst:(document.getElementById(cstId)||{value:''}).value||''}; }

  function _filter(f){
    var nb={}; if(typeof constellations!=='undefined') constellations.forEach(function(c){ nb[c.id]=c.name; });
    return customers.filter(function(c){
      if(f.chain&&(c.chain||'')!==f.chain) return false;
      if(f.city&&(c.city||'')!==f.city) return false;
      if(f.cst&&(c.constellation_id||'')!==f.cst) return false;
      if(f.q){ var cstN=c.constellation_id?(nb[c.constellation_id]||''):''; var hay=[c.name,c.city,c.chain,cstN].filter(Boolean).join(' ').toLowerCase(); var words=f.q.toLowerCase().split(/\s+/).filter(Boolean); if(!words.every(function(w){ return hay.includes(w); })) return false; }
      return true;
    });
  }

  function _renderList(){
    var filtered=_filter(_getF());
    var list=document.getElementById(listId);
    if(!list) return;
    var h='';
    topRows.forEach(function(r){
      var sv=r.value.replace(/'/g,"\\'");
      h+='<div onclick="'+prefix+'_tr(\''+sv+'\')" style="padding:10px 12px;border-bottom:1px solid #D3D1C7;cursor:pointer;background:#F8F9FC;font-size:13px;font-weight:600;color:#2C2C2A" onmouseover="this.style.background=\'#EEF3FC\'" onmouseout="this.style.background=\'#F8F9FC\'">'+escapeHtml(r.label)+'</div>';
    });
    if(!filtered.length){
      h+='<div style="padding:14px;color:#888780;font-size:13px;text-align:center">Ingen kunder funnet</div>';
    } else {
      filtered.slice(0,maxRows).forEach(function(c){
        var sn=c.name.replace(/'/g,"\\'");
        var isSel=c.name===_sel;
        var bg=isSel?'#E8F4ED':'#fff', bgH=isSel?'#D0ECD8':'#F8F7F3';
        var clrC=c.class==='A'?'#1A7A4E':c.class==='B'?'#BA7517':'#888780';
        h+='<div onclick="'+prefix+'_pk(\''+sn+'\')" style="padding:9px 12px;border-bottom:1px solid #F1EFE8;cursor:pointer;display:flex;align-items:center;gap:8px;background:'+bg+'" onmouseover="this.style.background=\''+bgH+'\'" onmouseout="this.style.background=\''+bg+'\'">';
        if(isSel) h+='<span style="color:#1A5C3A;font-size:12px;flex-shrink:0">✓</span>';
        h+='<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:'+(isSel?'600':'500')+';color:'+(isSel?'#1A5C3A':'#2C2C2A')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(c.name)+'</div>';
        if(c.city||c.chain) h+='<div style="font-size:11px;color:#888780">'+escapeHtml(c.city||'')+(c.chain?' · '+escapeHtml(c.chain):'')+'</div>';
        h+='</div>';
        if(c.class) h+='<span style="flex-shrink:0;font-size:10px;font-weight:700;color:'+clrC+'">'+c.class+'</span>';
        if(c.l12>0) h+='<span style="flex-shrink:0;font-size:11px;color:#888780">'+Math.round(c.l12/1000)+'k</span>';
        h+='</div>';
      });
      if(filtered.length>maxRows) h+='<div style="padding:6px 12px;color:#888780;font-size:11px;text-align:center;background:#F8F7F3;border-top:1px solid #F1EFE8">'+filtered.length+' treff – skriv mer for å snevre inn</div>';
    }
    list.innerHTML=h;
  }

  function _doSelect(name){
    _sel=name;
    var c=customers.find(function(x){ return x.name===name; });
    var badge=document.getElementById(badgeId), txt=document.getElementById(badgeTxtId);
    if(badge){ badge.style.display='flex'; }
    if(txt&&c) txt.textContent=c.name+(c.city?' — '+c.city:'');
    var qEl=document.getElementById(qId); if(qEl) qEl.value='';
    _renderList();
    onPick(name);
  }

  function _doClear(){
    _sel='';
    var badge=document.getElementById(badgeId); if(badge) badge.style.display='none';
    var qEl=document.getElementById(qId); if(qEl){ qEl.value=''; qEl.focus(); }
    _renderList();
    onPick('');
  }

  window[prefix+'_pk']=_doSelect;
  window[prefix+'_tr']=function(v){ onTopRow(v); };
  var cb=document.getElementById(prefix+'-clearbtn');
  if(cb) cb.addEventListener('click',function(e){ e.stopPropagation(); _doClear(); });
  var qEl=document.getElementById(qId);
  if(qEl) qEl.addEventListener('input',function(){ if(_sel){ _sel=''; var b=document.getElementById(badgeId); if(b) b.style.display='none'; onPick(''); } _renderList(); });
  [chainId,cityId,cstId].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('change',_renderList); });
  _renderList();

  var api={setSelected:function(name){ if(!name){ _doClear(); } else { var c=customers.find(function(x){ return x.name===name; }); if(c) _doSelect(name); } }};
  window['_csp_'+prefix+'_setSelected']=api.setSelected;
  return api;
}

// ─── SØKBAR KUNDEVELGER — felles komponent ────────────────────────────────────
// Monterer søkefelt + filtre (kjede/by/konstellasjon) i `barEl`.
// `onFilter(filteredList)` kalles umiddelbart og ved hvert tastetrykk/endre.
// `prefix` brukes som ID-prefiks for søkefeltene så flere instanser kan eksistere.
function _csMountSearch(barEl, customers, onFilter, prefix){
  if(!barEl) return;
  prefix = prefix || 'cs';
  var qId = prefix+'-cs-q';
  var chainId = prefix+'-cs-chain';
  var cityId = prefix+'-cs-city';
  var cstId = prefix+'-cs-cst';

  var nameById = {};
  if(typeof constellations !== 'undefined') constellations.forEach(function(c){ nameById[c.id]=c.name; });

  var chains = [];
  var cities = [];
  var csts = [];
  (function(){
    var chainSet={}, citySet={}, cstSet={};
    customers.forEach(function(c){
      if(c.chain) chainSet[c.chain]=true;
      if(c.city) citySet[c.city]=true;
      if(c.constellation_id) cstSet[c.constellation_id]=true;
    });
    chains = Object.keys(chainSet).sort(function(a,b){ return a.localeCompare(b,'no'); });
    cities = Object.keys(citySet).sort(function(a,b){ return a.localeCompare(b,'no'); });
    csts = Object.keys(cstSet).map(function(id){ return {id:id,name:nameById[id]||id}; }).sort(function(a,b){ return a.name.localeCompare(b.name,'no'); });
  })();

  var html = '<div style="margin-bottom:6px">';
  html += '<input type="text" id="'+qId+'" placeholder="Søk navn, by, kjede …" autocomplete="off" style="width:100%;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;box-sizing:border-box';
  if(chains.length>1||cities.length>1||csts.length>1) html += ';margin-bottom:5px';
  html += '">';
  if(chains.length>1||cities.length>1||csts.length>1){
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
    if(chains.length>1){
      html += '<select id="'+chainId+'" style="flex:1;min-width:88px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff">';
      html += '<option value="">Alle kjeder</option>';
      chains.forEach(function(ch){ html += '<option value="'+escapeHtml(ch)+'">'+escapeHtml(ch)+'</option>'; });
      html += '</select>';
    }
    if(cities.length>1){
      html += '<select id="'+cityId+'" style="flex:1;min-width:88px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff">';
      html += '<option value="">Alle byer</option>';
      cities.forEach(function(ci){ html += '<option value="'+escapeHtml(ci)+'">'+escapeHtml(ci)+'</option>'; });
      html += '</select>';
    }
    if(csts.length>1){
      html += '<select id="'+cstId+'" style="flex:1;min-width:88px;padding:4px 6px;border:1px solid #D3D1C7;border-radius:7px;font-size:11px;color:#5F5E5A;background:#fff">';
      html += '<option value="">Alle konst.</option>';
      csts.forEach(function(c){ html += '<option value="'+c.id+'">'+escapeHtml(c.name)+'</option>'; });
      html += '</select>';
    }
    html += '</div>';
  }
  html += '</div>';
  barEl.innerHTML = html;

  function runFilter(){
    var q = (document.getElementById(qId)||{value:''}).value||'';
    var chain = (document.getElementById(chainId)||{value:''}).value||'';
    var city = (document.getElementById(cityId)||{value:''}).value||'';
    var cst = (document.getElementById(cstId)||{value:''}).value||'';
    var nb = {};
    if(typeof constellations !== 'undefined') constellations.forEach(function(c){ nb[c.id]=c.name; });
    var filtered = customers.filter(function(c){
      if(chain && (c.chain||'')!==chain) return false;
      if(city && (c.city||'')!==city) return false;
      if(cst && (c.constellation_id||'')!==cst) return false;
      if(q){
        var cstN = c.constellation_id ? (nb[c.constellation_id]||'') : '';
        var hay = [c.name,c.city,c.chain,cstN].filter(Boolean).join(' ').toLowerCase();
        var words = q.toLowerCase().split(/\s+/).filter(Boolean);
        if(!words.every(function(w){ return hay.includes(w); })) return false;
      }
      return true;
    });
    onFilter(filtered);
  }

  [qId, chainId, cityId, cstId].forEach(function(id){
    var el = document.getElementById(id);
    if(el){
      el.addEventListener('input', runFilter);
      el.addEventListener('change', runFilter);
    }
  });
  runFilter();
}

function showCustomerListModal(title, customers){
  if(!customers || customers.length===0){
    showToast('Listen er tom');
    return;
  }
  // Vis som enkel modal-liste
  const existing = document.getElementById('dash-modal');
  if(existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'dash-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.onclick = (e)=>{ if(e.target===modal) modal.remove(); };
  const rows = customers.map(c=>{
    const safeName = (c.name||'').replace(/'/g,"\\'");
    const cls = c.class||'';
    const bCls = cls==='A'?'#A23B27':cls==='B'?'#BA7517':'#888780';
    return '<div style="padding:10px 12px;border-bottom:1px solid #F1EFE8;display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="document.getElementById(\'dash-modal\').remove();openCustomer(\''+safeName+'\')">'+
      '<div><div style="font-weight:600;color:#2C2C2A;font-size:13px">'+escapeHtml(c.name)+'</div><div style="font-size:11px;color:#888780;margin-top:2px">'+escapeHtml(c.city||'')+' · '+escapeHtml(c.chain||'')+'</div></div>'+
      '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0"><span style="font-size:11px;font-weight:600;color:'+bCls+';padding:2px 7px;background:#F1EFE8;border-radius:10px">'+cls+'</span><span style="font-size:11px;color:#5F5E5A">L12: '+(c.l12?Math.round(c.l12/1000)+'k':'–')+'</span></div>'+
      '</div>';
  }).join('');
  modal.innerHTML = '<div style="background:#fff;border-radius:14px;width:500px;max-width:100%;max-height:80vh;display:flex;flex-direction:column"><div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:center"><div style="font-size:15px;font-weight:700;color:#2C2C2A">'+escapeHtml(title)+' · '+customers.length+'</div><button onclick="document.getElementById(\'dash-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888780">×</button></div><div style="overflow-y:auto;flex:1">'+rows+'</div></div>';
  document.body.appendChild(modal);
}

function showToast(msg, type){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.background=(type==='warning')?'#92400E':'';
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid=setTimeout(()=>{ t.classList.remove('show'); t.style.background=''; },(type==='warning')?5000:3000);
}

function viewPhoto(src, name){
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;cursor:pointer';
  overlay.innerHTML=`<img src="${src}" style="max-width:90vw;max-height:80vh;border-radius:10px;object-fit:contain" alt="${name}"><div style="color:#F1EFE8;font-size:13px">${name} · Klikk for å lukke</div>`;
  overlay.onclick=()=>document.body.removeChild(overlay);
  document.body.appendChild(overlay);
}

function goToCustomer(name){ showSection('kunder', document.querySelectorAll('.nav-item')[2]); setTimeout(()=>openCustomer(name), 80); }

// ─── MODE SELECTOR ───────────────────────────────────────────────────────────

let _modeNavEl = null;
function showModeModal(el){
  _modeNavEl = el;
  document.getElementById('mode-modal').style.display='flex';
}
function modeSelectManual(){
  document.getElementById('mode-modal').style.display='none';
  showSection('nytt-besok', _modeNavEl);
}
function modeSelectRegion(){
  document.getElementById('mode-modal').style.display='none';
  document.querySelectorAll('.section').forEach(s=>s.style.display='none');
  document.getElementById('sec-regionplan').style.display='block';
  if(_modeNavEl){document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));_modeNavEl.classList.add('active');}
  rpInitRegionSelect(); rpRenderCustomerList();
}
function modeSelectAI(){
  document.getElementById('mode-modal').style.display='none';
  const d=document.getElementById('planner-date');
  if(d&&!d.value) d.value=TODAY_STR;
  document.querySelectorAll('.section').forEach(s=>s.style.display='none');
  document.getElementById('sec-planner').style.display='block';
  if(_modeNavEl){document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));_modeNavEl.classList.add('active');}
  if(typeof _plannerFilterArea==='function') _plannerFilterArea();
}

