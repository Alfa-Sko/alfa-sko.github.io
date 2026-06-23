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
  if(id==='profil'){ loadProfileIntoForm(); if(window._syncCardUpdate) window._syncCardUpdate(); }
  if(id==='rabatt'){ rkCalculate(); }
  if(id==='kart') mapInitOverview();
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

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
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
}

