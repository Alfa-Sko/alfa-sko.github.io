function loadCustomers(){
  const savedVersion = loadData('alfa_customers_version', null);
  // 'imported' = brukeren har lastet inn egen kundeliste (Excel) — den vinner alltid
  if(savedVersion === CUSTOMER_DATA_VERSION || savedVersion === 'imported'){
    const saved = loadData('alfa_customers', null);
    if(saved) return saved;
  }
  // Innloggede brukere (eller enheter som har vært innlogget) seedes ALDRI med
  // fil-innbakt startliste — kundene deres kommer fra skyen eller Excel-import.
  try{
    if(localStorage.getItem('sb_session') || localStorage.getItem('sb_data_owner')){
      return [];
    }
  }catch(e){}
  // Ny versjon → bruk BASE_CUSTOMERS og lagre versjonsstempel
  saveData('alfa_customers', BASE_CUSTOMERS);
  saveData('alfa_customers_version', CUSTOMER_DATA_VERSION);
  return BASE_CUSTOMERS;
}
let CUSTOMERS = loadCustomers();

// Getter-lag: appen henter alltid kunder herfra.
function getCustomers()     { return CUSTOMERS; }
function getCustomerSales() { return CUSTOMER_SALES; }

// Henter kunder fra Supabase customers-tabellen ved oppstart.
// Kalles av init.js før renderOverview(); CUSTOMERS fylles in-place så
// getCustomers() forblir synkron og de 7 caller-filene trenger ikke endres.
// Fallback: hvis ikke innlogget, fetch feiler, eller tabellen er tom,
// beholdes eksisterende CUSTOMERS (BASE_CUSTOMERS eller localStorage-cache).
async function fetchCustomersFromSupabase() {
  if(window._DEMO_ACTIVE){
    CUSTOMERS.length = 0;
    CUSTOMERS.push(...(typeof DEMO_CUSTOMERS !== 'undefined' ? DEMO_CUSTOMERS : []).map(function(c){ return Object.assign({},c); }));
    return;
  }
  const s = typeof _sbSession === 'function' ? _sbSession() : null;
  if (!s || !s.access_token) return;

  let res;
  try {
    res = await fetch(SUPA_URL + '/rest/v1/customers?select=*&order=name', {
      headers: {
        apikey:        SUPA_KEY,
        Authorization: 'Bearer ' + s.access_token,
      }
    });
  } catch (e) {
    console.warn('fetchCustomersFromSupabase: nettverksfeil', e);
    return;
  }

  if (!res.ok) {
    console.warn('fetchCustomersFromSupabase: HTTP', res.status);
    return;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return; // migrasjon ikke kjørt ennå → behold fallback

  CUSTOMERS.length = 0;
  CUSTOMERS.push(...data);
}

// PATCH éin eller fleire felt direkte på customers-tabellen (delt).
// Bruker sbFetch (apikey + Bearer access_token, auto-retry på 401).
// Fallback: feilen loggast men stoppar ikkje flyten.
async function _sbPatchCustomerField(id, patch){
  if(window._DEMO_ACTIVE) return;
  if(!id || typeof sbFetch==='undefined') return;
  try{
    const r=await sbFetch('/rest/v1/customers?id=eq.'+encodeURIComponent(id),{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify(patch),
    });
    if(!r.ok) console.warn('customers PATCH feilet',r.status,await r.text());
  }catch(e){ console.warn('customers PATCH feil',e); }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXCEL-IMPORT AV KUNDELISTE (mal: kundeoversikt_oppdatering_mal.xlsx)
// Hver selger importerer sitt distrikts kundeliste i sin egen konto.
// ═══════════════════════════════════════════════════════════════════════════

// Map en Excel-rad (norske kolonneoverskrifter) til appens kundeformat
function _mapImportRow(row, idx){
  const get = (...names)=>{
    for(const k of Object.keys(row)){
      const kl = String(k).toLowerCase().trim();
      for(const n of names){ if(kl===n || kl.startsWith(n)) return row[k]; }
    }
    return undefined;
  };
  const name = get('navn','kundenavn');
  if(!name || !String(name).trim()) return null;
  const num = v => {
    if(v===undefined || v===null || v==='') return 0;
    const n = parseFloat(String(v).replace(/\s/g,'').replace(/kr/gi,'').replace(',','.'));
    return isNaN(n) ? 0 : Math.round(n);
  };
  const cls = String(get('klasse')||'').trim().toUpperCase();
  return {
    id: String(get('nr','nummer','kundenr')||('imp'+(idx+1))),
    name: String(name).trim(),
    city: String(get('by','sted','poststed')||'').trim(),
    address: String(get('adresse')||'').trim(),
    chain: String(get('kjede')||'').trim(),
    concept: String(get('konsept')||'').trim(),
    class: ['A','B','C'].includes(cls) ? cls : (cls||''),
    priority: String(get('prioritet')||'').trim(),
    l12: num(get('l12','omsetning')),
    budget: num(get('budsjett','budget')),
    phone: String(get('telefon','tlf')||'').trim(),
    email: String(get('e-post','epost','email')||'').trim(),
    note: String(get('notat','kommentar')||'').trim(),
    contacts: [],
  };
}

function importCustomersExcel(){
  const inp = document.getElementById('cust-import-file');
  if(inp) inp.click();
}

function _handleCustomerImportFile(ev){
  const file = ev.target.files && ev.target.files[0];
  if(!file) return;
  ev.target.value = '';
  if(typeof XLSX === 'undefined'){
    alert('Excel-biblioteket er ikke lastet (krever nettilgang ved første åpning). Prøv å laste siden på nytt.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
      // Foretrekk arket 'Kunder' (malen), ellers første ark
      const sheetName = wb.SheetNames.find(n=>n.toLowerCase().includes('kunde')) || wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {defval:''});
      const customers = rows.map((r,i)=>_mapImportRow(r,i)).filter(c=>c!==null);
      if(customers.length===0){
        alert('Fant ingen kunder i arket "'+sheetName+'". Sjekk at filen følger malen (kolonner: Nr, Navn, By, Kjede, Klasse, L12 …) og at kundene ligger i arket "Kunder".');
        return;
      }
      const aCount = customers.filter(c=>c.class==='A').length;
      const bCount = customers.filter(c=>c.class==='B').length;
      const cCount = customers.filter(c=>c.class==='C').length;
      const sumL12 = customers.reduce((s,c)=>s+(c.l12||0),0);
      const knownCity = c => { const cl=String(c||'').toLowerCase(); return Object.keys(CITY_COORDS).some(k=>cl.includes(k.toLowerCase())); };
      const unknownCities = [...new Set(customers.filter(c=>c.city && !knownCity(c.city)).map(c=>c.city))];
      const cityWarn = unknownCities.length>0 ? '\n⚠ '+unknownCities.length+' by(er) appen ikke kjenner ruter for: '+unknownCities.slice(0,6).join(', ')+(unknownCities.length>6?' …':'')+'\nKjøretider for disse blir grove — sjekk stavemåten mot tettstedslisten.\n' : '';
      const ok = confirm(
        'Fant '+customers.length+' kunder i "'+sheetName+'":\n'+cityWarn+
        '  A: '+aCount+' · B: '+bCount+' · C: '+cCount+'\n'+
        '  Sum L12: '+Math.round(sumL12/1000)+' tusen kr\n\n'+
        'Dette ERSTATTER dagens kundeliste ('+getCustomers().length+' kunder).\n'+
        'Besøkshistorikk og kalender beholdes.\n\nFortsette?'
      );
      if(!ok) return;
      CUSTOMERS = customers;
      saveData('alfa_customers', CUSTOMERS);
      saveData('alfa_customers_version', 'imported');
      _demoRerender();
      showToast('📥 '+customers.length+' kunder importert'+(window._sbUser?' — synkes til skyen':''));
    }catch(err){
      alert('Kunne ikke lese filen: '+(err.message||err)+'\nSjekk at det er en .xlsx-fil fra malen.');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ─── NY KUNDE ────────────────────────────────────────────────────────────────

function openNewCustomerModal(){ document.getElementById('new-customer-modal').classList.add('open'); }
function closeNewCustomerModal(){
  document.getElementById('new-customer-modal').classList.remove('open');
  ['nc-name','nc-city','nc-address','nc-chain','nc-contact','nc-phone','nc-discount','nc-l12','nc-budget','nc-note'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('nc-class').value='B';
  document.getElementById('nc-storetype').value='';
}
function saveNewCustomer(){
  const name=document.getElementById('nc-name').value.trim();
  const city=document.getElementById('nc-city').value.trim();
  if(!name||!city){ showToast('Kundenavn og fylke/by er påkrevd'); return; }
  const contactName=document.getElementById('nc-contact').value.trim();
  const phone=document.getElementById('nc-phone').value.trim();
  const newC={id:'custom_'+Date.now(),name,city,address:document.getElementById('nc-address').value.trim(),chain:document.getElementById('nc-chain').value.trim(),class:document.getElementById('nc-class').value,storetype:document.getElementById('nc-storetype').value,discount:document.getElementById('nc-discount').value.trim(),phone,l12:parseInt(document.getElementById('nc-l12').value)||0,budget:parseInt(document.getElementById('nc-budget').value)||0,note:document.getElementById('nc-note').value.trim(),priority:'',contacts:contactName?[{name:contactName,role:'',type:'decision',phone}]:[]};
  CUSTOMERS.push(newC);
  saveData('alfa_customers', CUSTOMERS);
  closeNewCustomerModal();
  renderCustomers();
  showToast('Kunde "'+name+'" lagt til!');
}

function openQuickCustomerModal(){
  document.getElementById('quick-customer-modal').classList.add('open');
  setTimeout(()=>document.getElementById('qc-name').focus(),100);
}
function closeQuickCustomerModal(){ document.getElementById('quick-customer-modal').classList.remove('open'); }
function saveQuickCustomer(){
  const name=document.getElementById('qc-name').value.trim();
  const city=document.getElementById('qc-city').value.trim();
  if(!name||!city){ showToast('Navn og by er påkrevd'); return; }
  const newC={id:'custom_'+Date.now(),name,city,chain:'',address:'',class:document.getElementById('qc-class').value,concept:'',l12:0,budget:0,priority:'',contacts:[]};
  CUSTOMERS.push(newC);
  saveData('alfa_customers', CUSTOMERS);
  closeQuickCustomerModal();
  populateVisitCustomers();
  const sel=document.getElementById('visit-customer');
  sel.value=name;
  showToast('Kunde "'+name+'" opprettet og valgt!');
}

document.getElementById('new-customer-modal').addEventListener('click',function(e){ if(e.target===this) closeNewCustomerModal(); });
document.getElementById('quick-customer-modal').addEventListener('click',function(e){ if(e.target===this) closeQuickCustomerModal(); });

// ─── CUSTOMERS ──────────────────────────────────────────────────────────────

function renderCustomers(){
  _setCtTabsVisible(true);
  _switchCtTabDisplay('list');
  document.getElementById('customer-detail').style.display='none';
  populateChainFilter();
  filterCustomers();
}

function _setCtTabsVisible(visible){
  var el=document.getElementById('ct-tabs');
  if(el) el.style.display=visible?'flex':'none';
}

function _switchCtTabDisplay(tab){
  ['list','konstellasjoner','kjeder'].forEach(function(t){
    var btn=document.getElementById('ct-tab-'+t);
    if(btn) btn.className=(t===tab)?'btn btn-dark btn-sm':'btn btn-light btn-sm';
  });
  document.getElementById('customer-list-view').style.display=(tab==='list')?'block':'none';
  var kEl=document.getElementById('customer-konstellasjoner-view');
  if(kEl) kEl.style.display=(tab==='konstellasjoner')?'block':'none';
  var kjEl=document.getElementById('customer-kjeder-view');
  if(kjEl) kjEl.style.display=(tab==='kjeder')?'block':'none';
}

function switchCustomerTab(tab){
  _setCtTabsVisible(true);
  _switchCtTabDisplay(tab);
  if(tab==='konstellasjoner') renderKonstellasjonerView();
  else if(tab==='kjeder') renderKjederView();
}

function _chainPrefix(chain){
  if(!chain) return '';
  var dot=chain.indexOf(' · ');
  return dot>=0?chain.slice(0,dot):chain;
}

function toggleCustGroup(groupId){
  var el=document.getElementById(groupId);
  var arrow=document.getElementById(groupId+'-arrow');
  if(!el) return;
  var isOpen=el.style.display!=='none';
  el.style.display=isOpen?'none':'block';
  if(arrow) arrow.style.transform=isOpen?'':'rotate(90deg)';
}

function _renderGroupedCustomersView(getKeyFn, containerId, emptyLabel){
  var el=document.getElementById(containerId);
  if(!el) return;
  var groups={};
  getCustomers().forEach(function(c){
    var key=getKeyFn(c)||emptyLabel;
    if(!groups[key]) groups[key]=[];
    groups[key].push(c);
  });
  var keys=Object.keys(groups).sort(function(a,b){
    if(a===emptyLabel) return 1;
    if(b===emptyLabel) return -1;
    return a.localeCompare(b,'no');
  });
  if(!keys.length){ el.innerHTML='<div class="empty-state">Ingen kunder</div>'; return; }
  var html='';
  keys.forEach(function(key){
    var members=groups[key].sort(function(a,b){ return (a.name||'').localeCompare(b.name||'','no'); });
    var l12sum=members.reduce(function(s,c){ return s+(c.l12||0); },0);
    var groupId='cgr-'+key.replace(/[^a-zA-Z0-9]/g,'-');
    html+='<div style="margin-bottom:8px;border:1px solid #E5E3DB;border-radius:8px;overflow:hidden">';
    html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#F8F7F3;cursor:pointer;gap:10px;user-select:none" onclick="toggleCustGroup(\''+groupId+'\')" id="'+groupId+'-hdr">';
    html+='<div style="flex:1;min-width:0"><span style="font-size:14px;font-weight:600;color:#2C2C2A">'+escapeHtml(key)+'</span></div>';
    html+='<div style="display:flex;align-items:center;gap:12px;flex-shrink:0">';
    html+='<span style="font-size:11px;color:#888780">'+members.length+' butikk'+(members.length!==1?'er':'')+'</span>';
    if(l12sum>0) html+='<span style="font-size:11px;color:#5F5E5A;font-weight:600">'+Math.round(l12sum/1000)+' k</span>';
    html+='<span id="'+groupId+'-arrow" style="font-size:11px;color:#B4B2A9;display:inline-block;transition:transform 0.15s">▶</span>';
    html+='</div></div>';
    html+='<div id="'+groupId+'" style="display:none">';
    members.forEach(function(c){
      var safeName=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      var bCls=c.class==='A'?'badge-a':c.class==='B'?'badge-b':c.class==='C'?'badge-c':'badge-new';
      var bLbl=c.class==='A'?'A':c.class==='B'?'B':c.class==='C'?'C':'Ny';
      html+='<div style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-top:1px solid #F1EFE8;cursor:pointer;background:#fff" onclick="openCustomer(\''+safeName+'\')" onmouseover="this.style.background=\'#FAF9F5\'" onmouseout="this.style.background=\'#fff\'">';
      html+='<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(c.name)+'</div>';
      if(c.city) html+='<div style="font-size:11px;color:#888780">'+escapeHtml(c.city)+'</div>';
      html+='</div>';
      if(c.class) html+='<span class="ct-badge '+bCls+'" style="flex-shrink:0">'+bLbl+'</span>';
      if(c.l12>0) html+='<span style="font-size:11px;color:#888780;flex-shrink:0">'+Math.round(c.l12/1000)+' k</span>';
      html+='</div>';
    });
    html+='</div></div>';
  });
  el.innerHTML=html;
}

function renderKonstellasjonerView(){
  _renderGroupedCustomersView(function(c){ return c.chain||''; },'customer-konstellasjoner-view','(Uten kjede)');
}

function renderKjederView(){
  _renderGroupedCustomersView(function(c){ return _chainPrefix(c.chain); },'customer-kjeder-view','(Uten kjede)');
}

function populateChainFilter(){
  const sel = document.getElementById('ct-filter-chain');
  if(!sel) return;
  const chains = [...new Set(getCustomers().map(c=>c.chain||'').filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Alle kjeder</option>' + chains.map(ch=>`<option value="${ch.replace(/"/g,'&quot;')}">${ch}</option>`).join('');
}

function filterCustomers(){
  const q=(document.getElementById('customer-search').value||'').toLowerCase().trim();
  const clsF=document.getElementById('ct-filter-class').value;
  const typeF=document.getElementById('ct-filter-type').value;
  const chainF=document.getElementById('ct-filter-chain').value;

  let filtered=getCustomers().filter(c=>{
    const searchTarget=[c.name,c.city,c.chain,c.address,c.phone,c.discount,c.storetype,c.note,(c.contacts||[]).map(p=>p.name+' '+p.role).join(' ')].filter(Boolean).join(' ').toLowerCase();
    const matchQ=!q||q.split(' ').every(word=>searchTarget.includes(word));
    const matchCls=!clsF||c.class===clsF;
    const matchType=!typeF||(c.storetype||'')=== typeF;
    const matchChain=!chainF||(c.chain||'')=== chainF;
    return matchQ&&matchCls&&matchType&&matchChain;
  });

  const col=_sortCol||'name';
  const dir=_sortDir||1;
  filtered=[...filtered].sort((a,b)=>{
    let av='',bv='';
    if(col==='name'){av=a.name;bv=b.name;}
    else if(col==='city'){av=a.city||'';bv=b.city||'';}
    else if(col==='contact'){av=(a.contacts&&a.contacts[0]?a.contacts[0].name:'');bv=(b.contacts&&b.contacts[0]?b.contacts[0].name:'');}
    else if(col==='phone'){av=a.phone||'';bv=b.phone||'';}
    else if(col==='chain'){av=a.chain||'';bv=b.chain||'';}
    else if(col==='discount'){av=parseFloat((a.discount||'0').replace(/[^0-9.]/g,''))||0;bv=parseFloat((b.discount||'0').replace(/[^0-9.]/g,''))||0;return dir*(av-bv);}
    else if(col==='storetype'){av=a.storetype||'';bv=b.storetype||'';}
    else if(col==='class'){av=a.class||'Ø';bv=b.class||'Ø';}
    else if(col==='l12'){av=a.l12||0;bv=b.l12||0;return dir*(bv-av);}
    return dir*av.localeCompare(bv,'no');
  });

  document.querySelectorAll('.ct th').forEach(th=>th.classList.remove('sorted'));
  const thEl=document.getElementById('th-'+col);
  if(thEl){thEl.classList.add('sorted');thEl.querySelector('.sort-arrow').textContent=dir===1?'\u25b2':'\u25bc';}

  const tbody=document.getElementById('customer-tbody');
  if(!tbody) return;

  if(filtered.length===0){
    tbody.innerHTML=`<tr><td colspan="9" class="empty-state" style="padding:32px;text-align:center">Ingen kunder matcher søket</td></tr>`;
    document.getElementById('ct-count').textContent='';
    return;
  }

  tbody.innerHTML=filtered.map(c=>{
    const safeName=c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const bCls=c.class==='A'?'badge-a':c.class==='B'?'badge-b':c.class==='C'?'badge-c':'badge-new';
    const bLbl=c.class==='A'?'A':c.class==='B'?'B':c.class==='C'?'C':'Ny';
    const primaryContact=c.contacts&&c.contacts[0]?c.contacts[0]:null;
    const contactName=primaryContact?primaryContact.name:(c.contactName||'');
    const phone=c.phone||'';
    const discount=c.discount||'';
    const storetype=c.storetype||'';
    const l12=c.l12>0?c.l12.toLocaleString('no-NO')+' kr':'–';
    let displayName=c.name;
    if(q){const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi');displayName=c.name.replace(re,'<mark style="background:#FFF3CD;border-radius:2px;padding:0 1px">$1</mark>');}
    return `<tr onclick="openCustomer('${safeName}')">
      <td><div class="ct-name">${displayName}</div>${(c.gate||c.address)?`<div class="ct-sub">${c.gate?`${c.gate}, ${c.postnr} ${c.poststed}`:c.address}</div>`:''}</td>
      <td><div style="font-size:12px">${c.city||'–'}</div></td>
      <td><div style="font-size:12px">${contactName||'–'}</div></td>
      <td>${phone?`<a href="tel:${phone}" class="ct-phone" onclick="event.stopPropagation()">${phone}</a>`:'<span style="color:#B4B2A9">–</span>'}</td>
      <td><div style="font-size:12px;color:#5F5E5A">${c.chain||'–'}</div></td>
      <td><div class="ct-discount">${discount||'–'}</div></td>
      <td>${storetype?`<span class="ct-type">${storetype}</span>`:'<span style="color:#B4B2A9;font-size:12px">–</span>'}</td>
      <td>${c.class?`<span class="ct-badge ${bCls}">${bLbl}</span>`:'<span style="color:#B4B2A9;font-size:12px">–</span>'}</td>
      <td style="text-align:right"><div style="font-size:12px;font-weight:500">${l12}</div></td>
    </tr>`;
  }).join('');

  document.getElementById('ct-count').textContent=`Viser ${filtered.length} av ${getCustomers().length} kunder`;
}

let _sortCol='name', _sortDir=1;
function sortCustomers(col){
  if(_sortCol===col){ _sortDir*=-1; } else { _sortCol=col; _sortDir=1; }
  filterCustomers();
}

function renderTopArticles(customerName){
  const articles = getCustomerSales()[customerName];
  if(!articles || articles.length===0){
    return '<div class="empty-state" style="padding:16px;font-size:12px">Ingen artikkelsalg registrert for denne kunden.</div>';
  }
  // Norsk tallformat med tusenskille
  function fmtKr(n){
    if(!n) return '–';
    return Math.round(n).toLocaleString('no-NO')+' kr';
  }
  function fmtKrShort(n){
    if(!n) return '–';
    return Math.round(n).toLocaleString('no-NO');
  }
  // Sum total per år
  const sum2025 = articles.reduce((s,a)=>s+(a.y2025||0), 0);
  const sum2026 = articles.reduce((s,a)=>s+(a.y2026||0), 0);
  const maxTot = Math.max(...articles.map(a=>(a.y2025||0)+(a.y2026||0))) || 1;
  let html = '';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
  html += '<div style="background:#F1EFE8;border-radius:8px;padding:10px 12px"><div style="font-size:10px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Topp 20 · 2025</div><div style="font-size:16px;font-weight:700;color:#2C2C2A">'+fmtKr(sum2025)+'</div></div>';
  html += '<div style="background:#E6F1FB;border-radius:8px;padding:10px 12px"><div style="font-size:10px;color:#0C447C;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Topp 20 · 2026</div><div style="font-size:16px;font-weight:700;color:#0C447C">'+fmtKr(sum2026)+'</div></div>';
  html += '</div>';
  html += '<div style="border:1px solid #D3D1C7;border-radius:8px;overflow:hidden">';
  html += '<div style="display:grid;grid-template-columns:24px 1fr 90px 90px;gap:8px;padding:8px 10px;background:#F8F7F3;font-size:10px;font-weight:700;color:#888780;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #D3D1C7"><div>#</div><div>Artikkel</div><div style="text-align:right">2025</div><div style="text-align:right">2026</div></div>';
  articles.forEach((a,i)=>{
    const tot = (a.y2025||0)+(a.y2026||0);
    const pct = Math.round(tot/maxTot*100);
    const bgStyle = i%2 ? 'background:#fff' : 'background:#FAFAF7';
    const trend = (a.y2026>a.y2025) ? '↑' : (a.y2026<a.y2025*0.5 && a.y2025>0 ? '↓' : '');
    const trendColor = trend==='↑' ? '#1A7A4E' : (trend==='↓' ? '#A23B27' : '#888780');
    html += '<div style="display:grid;grid-template-columns:24px 1fr 90px 90px;gap:8px;padding:8px 10px;font-size:12px;border-bottom:1px solid #F1EFE8;'+bgStyle+';position:relative" title="'+escapeHtml(a.id)+'">';
    html += '<div style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background:linear-gradient(90deg, rgba(159,225,203,0.18), rgba(159,225,203,0.02));pointer-events:none"></div>';
    html += '<div style="color:#888780;font-weight:600;position:relative">'+(i+1)+'</div>';
    html += '<div style="color:#2C2C2A;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative">'+escapeHtml(a.name)+(trend?' <span style="color:'+trendColor+';font-weight:700">'+trend+'</span>':'')+'</div>';
    html += '<div style="text-align:right;color:'+(a.y2025?'#2C2C2A':'#B4B2A9')+';position:relative">'+fmtKrShort(a.y2025)+'</div>';
    html += '<div style="text-align:right;color:'+(a.y2026?'#0C447C':'#B4B2A9')+';font-weight:'+(a.y2026?'600':'400')+';position:relative">'+fmtKrShort(a.y2026)+'</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="font-size:10px;color:#888780;margin-top:6px;font-style:italic">↑ økt fra 2025 · ↓ vesentlig redusert</div>';
  return html;
}

async function _renderCustHistory(name, filter){
  filter=filter||'all';
  var el=document.getElementById('cust-history-list');
  if(!el) return;
  document.querySelectorAll('[id^="chf-"]').forEach(function(b){
    b.className=b.id==='chf-'+filter?'btn btn-dark btn-sm':'btn btn-light btn-sm';
    b.style.fontSize='11px';
  });
  var tMap={
    visit:{ico:'🏪',lbl:'Kundebesøk'},nydalen:{ico:'🏢',lbl:'Besøk Nydalen'},
    phone:{ico:'📞',lbl:'Telefonsamtale'},clinic:{ico:'🎓',lbl:'Clinic'},
    dinner:{ico:'🍽️',lbl:'Kundemiddag'},training:{ico:'🏃',lbl:'Trening'},
    teams:{ico:'👥',lbl:'Teamsmøte'},lunch:{ico:'🥪',lbl:'Lunsj med kunde'},
    other:{ico:'📌',lbl:'Annet'}
  };
  var all=visits.filter(function(v){return v.customer===name;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var shown=filter==='bilder'?all.filter(function(v){return v.photoPaths&&v.photoPaths.length;})
           :filter==='all'?all
           :all.filter(function(v){return (v.type||'visit')===filter;});
  // Kundekort-bilder (ikke knyttet til besøk) – vises alltid i 'bilder'- og 'all'-filter
  var shownCustPhotos=(filter==='bilder'||filter==='all')?(custPhotos||[]).filter(function(p){return p.customer===name;}).sort(function(a,b){return b.date.localeCompare(a.date);}) : [];
  if(!shown.length && !shownCustPhotos.length){el.innerHTML='<div class="empty-state" style="padding:12px">Ingen aktiviteter for dette filteret</div>';return;}
  var visitHtml=shown.map(function(v){
    var t=tMap[v.type]||tMap.visit;
    var ph=(v.photoPaths&&v.photoPaths.length)?'<div id="ch-photos-'+v.id+'" style="margin-top:8px"></div>':'';
    return '<div class="tl-item"><div class="tl-dot tl-dot-visit">'+t.ico+'</div><div class="tl-body">'
      +'<div class="tl-date">'+v.date.split('-').reverse().join('.')+' · '+(v.time||'')+(v.timeEnd?' – '+v.timeEnd:'')+' · '+(v.contact||'')+'</div>'
      +'<div class="tl-title">'+t.lbl+'</div>'
      +(v.notes?'<div class="tl-text" style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><span>'+escapeHtml(v.notes)+'</span><button onclick="clearVisitNote('+v.id+')" style="background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0;flex-shrink:0">🗑</button></div>':'')
      +(v.followup?'<div style="margin-top:6px;font-size:11px;color:#633806;background:#FAEEDA;padding:4px 8px;border-radius:6px;display:inline-block">Oppfølging: '+v.followup+'</div>':'')
      +ph+'</div></div>';
  }).join('');
  var custPhotoHtml=shownCustPhotos.map(function(p){
    return '<div class="tl-item" style="border-left:3px solid #185FA5"><div class="tl-dot" style="background:#185FA5;color:#fff;font-size:12px">📷</div><div class="tl-body">'
      +'<div class="tl-date">'+p.date.split('-').reverse().join('.')+'</div>'
      +'<div class="tl-title" style="color:#185FA5">Kundekort-bilde</div>'
      +'<div id="ch-custphotos-'+p.id+'" style="margin-top:8px"></div>'
      +'<button onclick="deleteCustomerPhoto('+p.id+')" style="margin-top:6px;background:none;border:none;color:#A23B27;font-size:11px;cursor:pointer;padding:0">🗑 Slett</button>'
      +'</div></div>';
  }).join('');
  el.innerHTML=visitHtml+custPhotoHtml;
  shown.forEach(function(v){if(v.photoPaths&&v.photoPaths.length)_loadChPhotos(v);});
  shownCustPhotos.forEach(function(p){_loadChCustPhotos(p);});
}

async function _loadChCustPhotos(p){
  var el=document.getElementById('ch-custphotos-'+p.id);
  if(!el) return;
  var photos=await getStoragePhotosForVisit({photoPaths:p.photoPaths||[]});
  if(!photos.length) return;
  el.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px">'
    +photos.map(function(ph){
      var safeUrl=ph.url.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      var safeName=ph.name.replace(/'/g,"\\'");
      return '<div style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid #D3D1C7;position:relative">'
        +'<img src="'+ph.url+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" loading="lazy" alt="'+ph.name+'" onclick="viewPhoto(\''+safeUrl+'\',\''+safeName+'\')">'
        +(ph.path?'<button onclick="deleteSingleCustPhoto('+p.id+',\''+ph.path+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
        +'</div>';
    }).join('')+'</div>';
}

async function _loadChPhotos(v){
  var el=document.getElementById('ch-photos-'+v.id);
  if(!el) return;
  var photos=await getStoragePhotosForVisit(v);
  if(!photos.length) return;
  el.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px">'
    +photos.map(function(p){
      var safeUrl=p.url.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      var safeName=p.name.replace(/'/g,"\\'");
      return '<div style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid #D3D1C7;position:relative">'
        +'<img src="'+p.url+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" loading="lazy" alt="'+p.name+'" onclick="viewPhoto(\''+safeUrl+'\',\''+safeName+'\')">'
        +(p.path?'<button onclick="deleteSingleVisitPhoto('+v.id+',\''+p.path+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
        +'</div>';
    }).join('')+'</div>';
}

function openCustomer(name){
  const c=getCustomers().find(c=>c.name===name);
  if(!c) return;
  _setCtTabsVisible(false);
  document.getElementById('customer-list-view').style.display='none';
  var kEl=document.getElementById('customer-konstellasjoner-view'); if(kEl) kEl.style.display='none';
  var kjEl=document.getElementById('customer-kjeder-view'); if(kjEl) kjEl.style.display='none';
  document.getElementById('customer-detail').style.display='block';
  const custVisits=visits.filter(v=>v.customer===name).sort((a,b)=>b.date.localeCompare(a.date));
  const custFollows=followups.filter(f=>f.customer===name&&!f.done);
  const typeLabel={decision:'Beslutningstaker',buyer:'Innkjøper',influence:'Påvirker'};
  const typeClass={decision:'ct-decision',buyer:'ct-buyer',influence:'ct-influence'};
  const bCls=c.class==='A'?'badge-a':c.class==='B'?'badge-b':c.class==='C'?'badge-c':'badge-new';
  const bLbl=c.class==='A'?'A-kunde':c.class==='B'?'B-kunde':c.class==='C'?'C-kunde':'Ny relasjon';
  const safeName=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const primaryContact=c.contacts&&c.contacts[0]?c.contacts[0]:null;
  const _htl={visit:'Besøk',nydalen:'Nydalen',phone:'Telefon',clinic:'Clinic',dinner:'Middag',training:'Trening',teams:'Møte',lunch:'Lunsj',other:'Annet'};
  const _hat=[...new Set(custVisits.map(v=>v.type||'visit'))];
  let histFilterBtns='<button class="btn btn-dark btn-sm" id="chf-all" style="font-size:11px" onclick="_renderCustHistory(\''+safeName+'\',\'all\')">Alle</button>';
  _hat.forEach(t=>{histFilterBtns+='<button class="btn btn-light btn-sm" id="chf-'+t+'" style="font-size:11px" onclick="_renderCustHistory(\''+safeName+'\',\''+t+'\')">'+(_htl[t]||t)+'</button>';});
  const _hasCustPhotos=(custPhotos||[]).some(p=>p.customer===name);
  if(custVisits.some(v=>v.photoPaths&&v.photoPaths.length>0)||_hasCustPhotos) histFilterBtns+='<button class="btn btn-light btn-sm" id="chf-bilder" style="font-size:11px" onclick="_renderCustHistory(\''+safeName+'\',\'bilder\')">📷 Bilder</button>';

  document.getElementById('customer-detail-content').innerHTML=`
    <div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <div style="flex:1">
          <div id="customer-detail-name" data-customer="${c.name}" style="font-size:20px;font-weight:700;color:#2C2C2A">${c.name}</div>
          <div style="font-size:13px;color:#888780;margin-top:3px">${c.city||''}${c.chain?' · '+c.chain:''}</div>
          ${(c.gate||c.address)?`<div style="font-size:12px;color:#888780;margin-top:2px">📍 ${c.gate?`${c.gate}, ${c.postnr} ${c.poststed}`:c.address}</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
          <span class="badge ${bCls}">${bLbl}</span>
          ${c.storetype?`<span style="font-size:11px;padding:3px 9px;border-radius:99px;background:#EEEDFE;color:#3C3489;font-weight:600">${c.storetype}</span>`:''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:#F8F7F3;border-radius:8px;padding:10px 12px">
          <div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">L12</div>
          <div style="font-size:15px;font-weight:600;color:#2C2C2A;margin-top:2px">${c.l12>0?c.l12.toLocaleString('no-NO')+' kr':'–'}</div>
        </div>
        <div style="background:#F8F7F3;border-radius:8px;padding:10px 12px">
          <div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Budsjett</div>
          <div style="font-size:15px;font-weight:600;color:#2C2C2A;margin-top:2px">${c.budget>0?c.budget.toLocaleString('no-NO')+' kr':'–'}</div>
        </div>
        <div style="background:#F8F7F3;border-radius:8px;padding:10px 12px">
          <div style="font-size:10px;color:#888780;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Rabatt</div>
          <div style="font-size:15px;font-weight:600;color:#2C2C2A;margin-top:2px">${c.discount||'–'}</div>
        </div>
        ${c.phone?`<div style="background:#E6F1FB;border-radius:8px;padding:10px 12px">
          <div style="font-size:10px;color:#0C447C;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Telefon</div>
          <a href="tel:${c.phone}" style="font-size:14px;font-weight:600;color:#0C447C;text-decoration:none;margin-top:2px;display:block">${c.phone}</a>
        </div>`:''}
        ${c.email?`<div style="background:#E6F1FB;border-radius:8px;padding:10px 12px">
          <div style="font-size:10px;color:#0C447C;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">E-post</div>
          <a href="mailto:${c.email}" style="font-size:13px;font-weight:600;color:#0C447C;text-decoration:none;margin-top:2px;display:block;overflow:hidden;text-overflow:ellipsis">${c.email}</a>
        </div>`:''}
      </div>
      <hr class="divider">
      <div class="section-label">Rediger kundeopplysninger</div>
      <div class="form-row-2" style="margin-bottom:8px">
        <div class="form-group" style="margin-bottom:8px"><label>Adresse</label><input type="text" id="edit-address" value="${(c.address||'').replace(/"/g,'&quot;')}" placeholder="Gateadresse"></div>
        <div class="form-group" style="margin-bottom:8px"><label>Telefon</label><input type="tel" id="edit-phone" value="${(c.phone||'').replace(/"/g,'&quot;')}" placeholder="+47 900 00 000"></div>
      </div>
      <div class="form-row-2" style="margin-bottom:8px">
        <div class="form-group" style="margin-bottom:8px"><label>E-post</label><input type="email" id="edit-email" value="${(c.email||'').replace(/"/g,'&quot;')}" placeholder="butikk@kjede.no"></div>
        <div class="form-group" style="margin-bottom:8px"><label>Rabatt (%)</label><input type="text" id="edit-discount" value="${(c.discount||'').replace(/"/g,'&quot;')}" placeholder="F.eks. 52%"></div>
      </div>
      <div class="form-row-2" style="margin-bottom:8px">
        <div class="form-group" style="margin-bottom:8px"><label>Type butikk</label>
          <select id="edit-storetype">
            <option value="">Ingen</option>
            <option value="SIS"${(c.storetype||'')==='SIS'?' selected':''}>SIS</option>
            <option value="PRO"${(c.storetype||'')==='PRO'?' selected':''}>PRO</option>
            <option value="Pop-up"${(c.storetype||'')==='Pop-up'?' selected':''}>Pop-up</option>
          </select>
        </div>
        <div></div>
      </div>
      <div class="form-group" style="margin-bottom:10px"><label>Notat</label><textarea id="edit-note" style="min-height:60px">${c.note||''}</textarea></div>
      <button class="btn btn-dark btn-sm" onclick="saveCustomerEdits('${safeName}')">Lagre endringer</button>
      <hr class="divider">
      <div class="section-label">Kontaktpersoner</div>
      <div id="contacts-editor"></div>
      ${c.note?`<div style="margin-top:12px;font-size:12px;color:#5F5E5A;background:#F8F7F3;padding:8px 10px;border-radius:7px;line-height:1.5">📋 ${c.note}</div>`:''}
      <hr class="divider">
      <div class="section-label">Topp 20 mest kjøpte artikler</div>
      ${renderTopArticles(c.name)}
      <hr class="divider">
      <div class="section-label">Aktivitetshistorikk</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${histFilterBtns}</div>
      <div id="cust-history-list"></div>
      <hr class="divider">
      <div class="section-label">Åpen oppfølging</div>
      ${custFollows.length===0?'<div class="empty-state" style="padding:12px">Ingen åpen oppfølging</div>':custFollows.map(f=>followItem(f)).join('')}
      <hr class="divider">
      <div id="os-widget-container"></div>
      <hr class="divider">
      <button class="btn btn-dark" onclick="startNewVisit('${safeName}')">+ Registrer ny aktivitet</button>
    </div>`;
  _renderCustHistory(name, 'all');
  renderContactsEditor(name);
  const osContainer = document.getElementById('os-widget-container');
  if(osContainer) osContainer.appendChild(osWidget(name));
  // Scroll to top on mobile
  window.scrollTo(0,0);
}

function saveCustomerEdits(name){
  const c=getCustomers().find(c=>c.name===name);
  if(!c) return;
  c.address=document.getElementById('edit-address').value.trim();
  c.phone=document.getElementById('edit-phone').value.trim();
  c.email=document.getElementById('edit-email').value.trim();
  c.discount=document.getElementById('edit-discount').value.trim();
  c.storetype=document.getElementById('edit-storetype').value;
  c.note=document.getElementById('edit-note').value.trim();
  saveData('alfa_customers',CUSTOMERS);
  _sbPatchCustomerField(c.id,{phone:c.phone,email:c.email});
  openCustomer(name);
  showToast('Kundekortet er oppdatert!');
}

function closeCustomerDetail(){ renderCustomers(); window.scrollTo(0,0); }

function startNewVisit(name){
  showSection('nytt-besok', document.querySelectorAll('.nav-item')[3]);
  setTimeout(()=>{const sel=document.getElementById('visit-customer');populateVisitCustomers();sel.value=name;},100);
}

// ─── KONTAKTPERSONER ────────────────────────────────────────────────────────

function renderContactsEditor(name){
  const container=document.getElementById('contacts-editor');
  if(!container) return;
  const c=getCustomers().find(x=>x.name===name);
  if(!c) return;
  const contacts=c.contacts||[];
  const safeName=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const typeLabel={decision:'Beslutningstaker',buyer:'Innkjøper',influence:'Påvirker'};
  const typeClass={decision:'ct-decision',buyer:'ct-buyer',influence:'ct-influence'};
  let html='<div style="display:flex;flex-direction:column;gap:6px">';
  contacts.forEach((p,idx)=>{
    html+=`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:#F8F7F3;border-radius:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:#2C2C2A">${escapeHtml(p.name||'')}${p.type?` <span class="contact-type ${typeClass[p.type]||'ct-influence'}" style="margin-left:4px">${typeLabel[p.type]||''}</span>`:''}</div>
        ${p.role?`<div style="font-size:11px;color:#888780;margin-top:1px">${escapeHtml(p.role)}</div>`:''}
        <div style="font-size:11px;margin-top:4px;display:flex;gap:10px;flex-wrap:wrap">
          ${p.phone?`<a href="tel:${escapeHtml(p.phone)}" style="color:#0C447C;text-decoration:none">📞 ${escapeHtml(p.phone)}</a>`:''}
          ${p.email?`<a href="mailto:${escapeHtml(p.email)}" style="color:#0C447C;text-decoration:none">✉ ${escapeHtml(p.email)}</a>`:''}
        </div>
      </div>
      <button onclick="deleteContact('${safeName}',${idx})" style="background:none;border:none;font-size:18px;color:#B4B2A9;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0" title="Slett">×</button>
    </div>`;
  });
  html+=`<div id="contact-add-form" style="display:none;padding:10px 12px;background:#F0EEF8;border-radius:8px">
    <div class="form-row-2" style="margin-bottom:6px">
      <div class="form-group" style="margin-bottom:0"><label style="font-size:10px">Navn</label><input type="text" id="cnew-name" placeholder="Kari Nordmann"></div>
      <div class="form-group" style="margin-bottom:0"><label style="font-size:10px">Rolle / tittel</label><input type="text" id="cnew-role" placeholder="Butikksjef"></div>
    </div>
    <div class="form-row-2" style="margin-bottom:6px">
      <div class="form-group" style="margin-bottom:0"><label style="font-size:10px">Telefon</label><input type="tel" id="cnew-phone" placeholder="+47 900 00 000"></div>
      <div class="form-group" style="margin-bottom:0"><label style="font-size:10px">E-post</label><input type="email" id="cnew-email" placeholder="kari@butikk.no"></div>
    </div>
    <div class="form-group" style="margin-bottom:8px"><label style="font-size:10px">Type</label>
      <select id="cnew-type">
        <option value="decision">Beslutningstaker</option>
        <option value="buyer">Innkjøper</option>
        <option value="influence">Påvirker</option>
      </select>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-dark btn-sm" onclick="_saveNewContact('${safeName}')">Lagre kontakt</button>
      <button class="btn btn-sm" onclick="document.getElementById('contact-add-form').style.display='none';document.getElementById('contact-add-btn').style.display=''">Avbryt</button>
    </div>
  </div>`;
  html+=`<button class="btn btn-sm" id="contact-add-btn" onclick="addContact('${safeName}')" style="align-self:flex-start;margin-top:2px">+ Legg til kontaktperson</button>`;
  html+='</div>';
  container.innerHTML=html;
}

function addContact(name){
  const form=document.getElementById('contact-add-form');
  const btn=document.getElementById('contact-add-btn');
  if(!form) return;
  form.style.display='block';
  if(btn) btn.style.display='none';
  const inp=document.getElementById('cnew-name');
  if(inp) inp.focus();
}

function _saveNewContact(name){
  const c=getCustomers().find(x=>x.name===name);
  if(!c) return;
  const newName=(document.getElementById('cnew-name')||{value:''}).value.trim();
  if(!newName){ showToast('Navn er påkrevd'); return; }
  const p={
    name:newName,
    role:(document.getElementById('cnew-role')||{value:''}).value.trim(),
    type:(document.getElementById('cnew-type')||{value:'decision'}).value||'decision',
    phone:(document.getElementById('cnew-phone')||{value:''}).value.trim(),
    email:(document.getElementById('cnew-email')||{value:''}).value.trim(),
  };
  if(!c.contacts) c.contacts=[];
  c.contacts.push(p);
  saveData('alfa_customers',CUSTOMERS);
  _sbPatchCustomerField(c.id,{contacts:c.contacts});
  renderContactsEditor(name);
  showToast('Kontaktperson lagt til');
}

function deleteContact(name,idx){
  const c=getCustomers().find(x=>x.name===name);
  if(!c||!c.contacts) return;
  c.contacts.splice(idx,1);
  saveData('alfa_customers',CUSTOMERS);
  _sbPatchCustomerField(c.id,{contacts:c.contacts});
  renderContactsEditor(name);
  showToast('Kontaktperson fjernet');
}

// ─── KUNDELISTE-IMPORT ──────────────────────────────────────────────────────

function setImportStatus(msg, type){
  const el = document.getElementById('customer-import-status');
  if(!el) return;
  if(!msg){ el.innerHTML=''; return; }
  const colors = {
    info:    {bg:'#E6F1FB', border:'#B8D4E8', color:'#0C447C'},
    success: {bg:'#E8F4ED', border:'#B8D4C2', color:'#1A5C3A'},
    error:   {bg:'#FBE6E6', border:'#E8B8B8', color:'#7A1A1A'},
    warning: {bg:'#FAEEDA', border:'#E6D9B8', color:'#6D4C00'},
  };
  const c = colors[type||'info'];
  el.innerHTML = '<div style="background:'+c.bg+';border:1px solid '+c.border+';color:'+c.color+';padding:10px 12px;border-radius:8px;font-size:12px;line-height:1.5">'+msg+'</div>';
}

// Normaliser kolonne-navn til kjent format

async function handleCustomerImport(fileInput){
  const file = fileInput.files[0];
  if(!file){ return; }
  fileInput.value=''; // Reset for å kunne velge samme fil igjen
  if(typeof XLSX==='undefined'){
    setImportStatus('XLSX-biblioteket har ikke lastet ennå. Vent et øyeblikk og prøv på nytt.','error');
    return;
  }
  setImportStatus('Leser fil ...','info');
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {type:'array'});
    // Bruk første ark
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:''});
    if(rows.length<2){
      setImportStatus('Filen er tom eller har bare overskrift.','error');
      return;
    }
    // Finn header-raden — første rad med tekst i flere kolonner
    let headerIdx = 0;
    for(let i=0;i<Math.min(rows.length,5);i++){
      const cells = rows[i].filter(c=>String(c).trim());
      if(cells.length>=3){ headerIdx=i; break; }
    }
    const headers = rows[headerIdx];
    const dataRows = rows.slice(headerIdx+1);
    // Map kolonner
    const cols = {
      name: findColIdx(headers, 'name'),
      city: findColIdx(headers, 'city'),
      chain: findColIdx(headers, 'chain'),
      l12: findColIdx(headers, 'l12'),
      budget: findColIdx(headers, 'budget'),
      concept: findColIdx(headers, 'concept'),
      class: findColIdx(headers, 'class'),
      priority: findColIdx(headers, 'priority'),
      note: findColIdx(headers, 'note'),
      id: findColIdx(headers, 'id'),
    };
    if(cols.name<0){
      setImportStatus('Klarte ikke finne kolonnen "Navn". Sjekk at overskriften heter "Navn" eller "Kunde". Funnet kolonner: '+headers.filter(h=>h).join(', '),'error');
      return;
    }
    // Bygg ny kundeliste
    const newCustomers = [];
    let skipped = 0;
    dataRows.forEach((row,idx)=>{
      const name = String(row[cols.name]||'').trim();
      if(!name){ skipped++; return; }
      const num = (v)=>{ if(v==null||v==='') return 0; const n=parseFloat(String(v).replace(/[\s,]/g,'')); return isFinite(n)?Math.round(n):0; };
      const get = (k)=>cols[k]>=0?String(row[cols[k]]||'').trim():'';
      newCustomers.push({
        id: cols.id>=0 ? String(row[cols.id]||(idx+1)) : String(idx+1),
        name,
        city: get('city'),
        chain: get('chain'),
        l12: num(row[cols.l12]),
        budget: num(row[cols.budget]),
        concept: get('concept'),
        class: get('class'),
        priority: get('priority'),
        contacts: [],
        note: get('note'),
      });
    });
    if(newCustomers.length===0){
      setImportStatus('Ingen kunder funnet i filen. Sjekk at "Navn" er fylt ut for hver rad.','error');
      return;
    }
    // Bekreftelse
    const confirmed = confirm(
      'Erstatte nåværende kundeliste ('+getCustomers().length+' kunder) med ny import ('+newCustomers.length+' kunder)?\n\n' +
      'Salgsdata (topp 20-artikler) beholdes for kunder med samme navn.\n\n' +
      (skipped>0?'OBS: '+skipped+' rader uten navn ble hoppet over.\n\n':'') +
      'Trykk OK for å erstatte, Avbryt for å beholde nåværende liste.'
    );
    if(!confirmed){ setImportStatus('Import avbrutt — kundelisten er uendret.','warning'); return; }
    // Lagre
    CUSTOMERS.length=0;
    newCustomers.forEach(c=>CUSTOMERS.push(c));
    saveData('alfa_customers', CUSTOMERS);
    // Bump versjonen så den nye listen er kanonisk
    const newVer = 'imported-'+Date.now();
    saveData('alfa_customers_version', newVer);
    setImportStatus('✓ '+newCustomers.length+' kunder importert. '+(skipped>0?'('+skipped+' rader hoppet over.)':''),'success');
    // Oppdater telling
    const cnt = document.getElementById('current-customer-count');
    if(cnt) cnt.textContent = getCustomers().length + ' kunder';
    showToast('✓ '+newCustomers.length+' kunder importert');
  } catch(e){
    console.error(e);
    setImportStatus('Klarte ikke lese filen: '+(e.message||e),'error');
  }
}

function downloadCustomerTemplate(){
  if(typeof XLSX==='undefined'){ showToast('XLSX-biblioteket har ikke lastet ennå'); return; }
  const headers = ['Navn','By','Kjede','L12','Budsjett','Konsept','Klasse','Prioritet','Notat'];
  const exampleRows = [
    ['INTERSPORT TRONDHEIM LEFSTAD','Trondheim','Intersport','485000','520000','PRO','A','Høy',''],
    ['SPORT 1 STEINKJER','Steinkjer','Sport 1','125000','150000','SIS','B','Medium',''],
    ['STADION NAMSOS','Namsos','Stadion','45000','60000','','C','Lav','Ny relasjon'],
  ];
  const data = [headers, ...exampleRows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  // Sett kolonnebredder
  ws['!cols'] = [{wch:30},{wch:15},{wch:15},{wch:10},{wch:10},{wch:10},{wch:8},{wch:10},{wch:25}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kunder');
  XLSX.writeFile(wb, 'kundeliste-mal.xlsx');
  showToast('Mal lastet ned');
}

function exportCurrentCustomers(){
  if(typeof XLSX==='undefined'){ showToast('XLSX-biblioteket har ikke lastet ennå'); return; }
  if(!getCustomers().length){ showToast('Ingen kunder å eksportere'); return; }
  const headers = ['Navn','By','Kjede','L12','Budsjett','Konsept','Klasse','Prioritet','Notat'];
  const rows = getCustomers().map(c=>[c.name||'',c.city||'',c.chain||'',c.l12||0,c.budget||0,c.concept||'',c.class||'',c.priority||'',c.note||'']);
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{wch:35},{wch:15},{wch:20},{wch:12},{wch:12},{wch:12},{wch:8},{wch:12},{wch:30}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kunder');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, 'kundeliste-eksport-'+dateStr+'.xlsx');
  showToast('Kundeliste eksportert');
}

