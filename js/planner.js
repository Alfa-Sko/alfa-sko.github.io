// ─── AI PLANNER ─────────────────────────────────────────────────────────────

let _plannerDays = 1;
let _plannerMaxVisits = 5;  // 0 = ingen grense, fyll opp dagen
let _plannerHomeBase = '';  // Brukerens hjemmebase (settes fra Min profil)
let _plannerStartFromHome = true;  // Start hver dag fra hjem (kjøring i stedet for adm.)

// Foreslå hoteller i en by, sortert med brukerens foretrukne kjeder først
function suggestHotels(city){
  if(!city) return [];
  // Normaliser: finn by-nøkkel som matcher (full adresse → bynavn)
  let key = city;
  if(!HOTELS_BY_CITY[key]){
    const lower = city.toLowerCase();
    key = Object.keys(HOTELS_BY_CITY).find(k=>lower.includes(k.toLowerCase())) || city;
  }
  const all = HOTELS_BY_CITY[key] || [];
  const pref = (userProfile && userProfile.hotelChainPref) || [];
  return all.slice().sort((a,b)=>{
    const ap = pref.indexOf(a.chain), bp = pref.indexOf(b.chain);
    return (ap===-1?99:ap) - (bp===-1?99:bp);
  }).map(h=>Object.assign({preferred: pref.includes(h.chain)}, h));
}

function toggleTripDetails(){
  const box = document.getElementById('trip-details-box');
  const arrow = document.getElementById('trip-details-arrow');
  const open = box.style.display==='none';
  box.style.display = open ? 'block' : 'none';
  if(arrow) arrow.textContent = open ? '▾' : '▸';
}

// Les reisedetaljer fra skjemaet. Returnerer null-felter når tomt.
function readTripMeta(){
  const v = id => { const el=document.getElementById(id); return el?(el.value||'').trim():''; };
  const meta = {
    title: v('trip-title'),
    flyDate: v('trip-fly-date'),
    flyTime: v('trip-fly-time'),
    flyCity: v('trip-fly-city'),
    hotelName: v('trip-hotel-name'),
    hotelCity: v('trip-hotel-city'),
    rental: v('trip-rental'),
    retDate: v('trip-ret-date'),
    retTime: v('trip-ret-time'),
    retCity: v('trip-ret-city'),
  };
  meta.hasFlight = !!(meta.flyDate && meta.flyCity);
  meta.hasReturn = !!(meta.retTime && meta.retCity);
  meta.hasHotel = !!meta.hotelName;
  // Hotellby: eksplisitt felt, ellers flyby
  meta.hotelBase = meta.hotelCity || meta.flyCity || '';
  return meta;
}

// Egendefinert rute: array av {city, sameDay}.
// sameDay=true betyr at stoppet tas SAMME DAG som forrige stopp.
// Samme by kan velges flere ganger (= flere dager samme sted).
let _customRoute = [];

function toggleCustomRoute(){
  const on = document.getElementById('planner-custom-route').checked;
  const builder = document.getElementById('custom-route-builder');
  builder.style.display = on ? 'block' : 'none';
  if(on){
    populateCustomRouteDropdown();
    renderCustomRouteList();
  }
}

function populateCustomRouteDropdown(){
  const sel = document.getElementById('custom-route-add');
  const mainSel = document.getElementById('planner-area');
  // Hent fra hver optgroup i hovedlisten — bevar struktur slik at
  // "Mitt territorium" kommer først. Byer kan velges flere ganger,
  // så vi filtrerer IKKE bort allerede valgte.
  const groups = [];
  mainSel.querySelectorAll('optgroup').forEach(g=>{
    const cities = [];
    g.querySelectorAll('option').forEach(o=>{
      if(o.value && o.value!=='Alle'){
        cities.push({value:o.value, label:o.textContent});
      }
    });
    if(cities.length>0){
      groups.push({label:g.label, cities});
    }
  });
  let html = '<option value="">Legg til by ...</option>';
  groups.forEach(g=>{
    html += '<optgroup label="'+escapeHtml(g.label)+'">';
    g.cities.forEach(c=>{
      html += '<option value="'+escapeHtml(c.value)+'">'+escapeHtml(c.label)+'</option>';
    });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
}

// Beregn dagsnummer for hvert stopp: nytt dagsnummer når sameDay=false
function customRouteDayNumbers(){
  let day = 0;
  return _customRoute.map((r,i)=>{
    if(i===0 || !r.sameDay) day++;
    return day;
  });
}

function renderCustomRouteList(){
  const list = document.getElementById('custom-route-list');
  if(_customRoute.length===0){
    list.innerHTML = '<div style="font-size:11px;color:#888780;font-style:italic;padding:6px 0">Ingen byer valgt ennå</div>';
    return;
  }
  const dayNums = customRouteDayNumbers();
  const totalDays = dayNums[dayNums.length-1];
  let html = '<div style="font-size:11px;color:#5F5E5A;margin-bottom:6px">'+totalDays+' dag(er) · '+_customRoute.length+' stopp</div>';
  html += _customRoute.map((r,i)=>{
    const isFirst = i===0;
    const isLast = i===_customRoute.length-1;
    const linked = !!r.sameDay && !isFirst;
    // Kjedet stopp rykkes inn med kobling-symbol
    return '<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:'+(linked?'#FAFAF7':'#fff')+';border:1px solid #D3D1C7;border-radius:6px;margin-bottom:4px;font-size:12px'+(linked?';margin-left:18px':'')+'">'
      + '<span style="background:'+(isFirst?'#9FE1CB':(linked?'#E6F1FB':'#F1EFE8'))+';color:'+(isFirst?'#0F5C40':(linked?'#0C447C':'#5F5E5A'))+';min-width:42px;height:22px;padding:0 6px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;flex-shrink:0">'+(linked?'🔗 ':'')+'Dag '+dayNums[i]+'</span>'
      + '<span style="flex:1;font-weight:'+(isFirst?'700':'500')+';color:#2C2C2A;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(r.city)+(isFirst?' <span style="font-size:10px;color:#0F5C40;font-weight:600">START</span>':'')+'</span>'
      + (isFirst?'':'<button class="btn btn-light btn-sm" type="button" onclick="customRouteToggleSameDay('+i+')" title="'+(r.sameDay?'Skill ut som egen dag':'Slå sammen med forrige stopp (samme dag)')+'" style="padding:2px 8px;font-size:11px;'+(r.sameDay?'background:#0C447C;color:#fff;border-color:#0C447C':'')+'">🔗</button>')
      + '<button class="btn btn-light btn-sm" type="button" onclick="customRouteMove('+i+',-1)" '+(isFirst?'disabled':'')+' style="padding:2px 8px;font-size:11px;opacity:'+(isFirst?'0.3':'1')+'">↑</button>'
      + '<button class="btn btn-light btn-sm" type="button" onclick="customRouteMove('+i+',1)" '+(isLast?'disabled':'')+' style="padding:2px 8px;font-size:11px;opacity:'+(isLast?'0.3':'1')+'">↓</button>'
      + '<button class="btn btn-light btn-sm" type="button" onclick="customRouteRemove('+i+')" style="padding:2px 8px;font-size:11px;color:#A23B27">×</button>'
      + '</div>';
  }).join('');
  html += '<div style="font-size:10px;color:#888780;margin-top:4px">💡 Velg samme by flere ganger for flere dager der. Trykk 🔗 på et stopp for å ta det samme dag som stoppet over.</div>';
  list.innerHTML = html;
}

function customRouteAdd(){
  const sel = document.getElementById('custom-route-add');
  const v = sel.value;
  if(!v) return;
  _customRoute.push({city:v, sameDay:false});
  sel.value='';
  renderCustomRouteList();
}

function customRouteRemove(idx){
  _customRoute.splice(idx,1);
  if(_customRoute.length>0) _customRoute[0].sameDay = false;
  renderCustomRouteList();
}

function customRouteMove(idx, dir){
  const newIdx = idx + dir;
  if(newIdx<0 || newIdx>=_customRoute.length) return;
  const tmp = _customRoute[idx];
  _customRoute[idx] = _customRoute[newIdx];
  _customRoute[newIdx] = tmp;
  if(_customRoute.length>0) _customRoute[0].sameDay = false;
  renderCustomRouteList();
}

function customRouteToggleSameDay(idx){
  if(idx<=0) return;
  _customRoute[idx].sameDay = !_customRoute[idx].sameDay;
  renderCustomRouteList();
}

// Bygg dagsgrupper: [['Tromsø'],['Finnsnes','Bardufoss'],['Tromsø']] osv.
function customRouteDayGroups(){
  const groups = [];
  _customRoute.forEach((r,i)=>{
    if(i===0 || !r.sameDay) groups.push([]);
    groups[groups.length-1].push(r.city);
  });
  return groups;
}

function plannerSetDays(n, btn){
  _plannerDays = n;
  document.querySelectorAll('.planner-days-btn').forEach(b=>{ b.style.background=b===btn?'#2C2C2A':''; b.style.color=b===btn?'#fff':''; });
}
function plannerSetVisits(n, btn){
  _plannerMaxVisits = n;
  document.querySelectorAll('.planner-visits-btn').forEach(b=>{ b.style.background=b===btn?'#2C2C2A':''; b.style.color=b===btn?'#fff':''; });
}



// Haversine-formel: returnerer fugleflukt-distanse i km

// Estimer kjøreavstand og tid mellom to byer som ikke er i ROUTE_DATA.
// Bruker fugleflukt × 1.4 (typisk norsk vei-faktor) og snitt 65 km/t.
function _coordFor(city){
  if(!city) return null;
  if(CITY_COORDS[city]) return CITY_COORDS[city];
  const low=String(city).trim().toLowerCase();
  for(const k of Object.keys(CITY_COORDS)){ if(k.toLowerCase()===low) return CITY_COORDS[k]; }
  return null;
}
function estimateRoute(fromCity, toCity){
  const c1 = _coordFor(fromCity), c2 = _coordFor(toCity);
  if(!c1 || !c2) return null;
  const straightKm = haversineKm(c1[0], c1[1], c2[0], c2[1]);
  // Faktor 1,5 og 60 km/t: norske veier (særlig i nord) går rundt fjorder og fjell,
  // så reell kjørevei er typisk 40-60% lenger enn fugleflukt. Verifisert mot Google Maps.
  const driveKm = Math.round(straightKm * 1.5);
  const driveMin = Math.round((driveKm / 60) * 60);
  return {min: driveMin, km: driveKm, estimated: true};
}

// Innen samme by: sjablong avhengig av bystørrelse (storbyer har lengre internetapper)
function sameCityRoute(city){
  const big = BIG_CITIES.some(b=>String(city||'').toLowerCase().includes(b.toLowerCase()));
  return big ? {min:15, km:7, approx:true} : {min:8, km:4, approx:true};
}

// ─────────────────────────────────────────────────────────────────────────────
// REGIONPLANLEGGER
// ─────────────────────────────────────────────────────────────────────────────


let _rpSelected = {}; // id -> true

function rpVisitLen(c){ return VISIT_LEN[(c&&c.class)||''] || 45; }

let _regionLowIndex = null;
function rpRegionOfCustomer(c){
  if(!c||!c.city) return 'Ukjent';
  if(CITY_TO_REGION[c.city]) return CITY_TO_REGION[c.city];
  if(!_regionLowIndex){ _regionLowIndex={}; Object.keys(CITY_TO_REGION).forEach(k=>_regionLowIndex[k.toLowerCase()]=CITY_TO_REGION[k]); }
  const low = c.city.trim().toLowerCase();
  if(_regionLowIndex[low]) return _regionLowIndex[low];
  // Kjente fylkesnavn skrevet direkte i city-feltet
  const known=['Trøndelag','Nordland','Troms','Finnmark','Svalbard','Møre og Romsdal','Vestland','Rogaland','Agder','Telemark','Vestfold','Buskerud','Innlandet','Oslo','Akershus','Østfold'];
  const hit = known.find(k=>k.toLowerCase()===low);
  return hit || 'Andre';
}

function rpAllRegionsPresent(){
  const set = {};
  getCustomers().forEach(c=>{ const r=rpRegionOfCustomer(c); set[r]=(set[r]||0)+1; });
  return set;
}

function rpInitRegionSelect(){
  const sel = document.getElementById('rp-region');
  if(!sel) return;
  const sd=document.getElementById('rp-startdate'); if(sd && !sd.value) sd.value=(typeof TODAY_STR!=='undefined'?TODAY_STR:new Date().toISOString().slice(0,10));
  const present = rpAllRegionsPresent();
  // Sorter regioner etter antall kunder (flest først), men løft mitt territorium øverst
  const territory = ['Trøndelag','Nordland','Troms','Finnmark','Svalbard'];
  const regions = Object.keys(present).sort((a,b)=>{
    const ta=territory.indexOf(a), tb=territory.indexOf(b);
    if(ta!==-1 && tb!==-1) return ta-tb;
    if(ta!==-1) return -1;
    if(tb!==-1) return 1;
    return present[b]-present[a];
  });
  sel.innerHTML = regions.map(r=>'<option value="'+escapeHtml(r)+'">'+escapeHtml(r)+' ('+present[r]+')</option>').join('');
  // Startby fra profil
  const startEl = document.getElementById('rp-start');
  if(startEl && !startEl.value) startEl.value = (userProfile&&userProfile.homeCity)||'';
}

// Bygg bolker: valgt region øverst, så naboregioner i egne bolker.
function rpBuildBlocks(selectedRegion){
  const byRegion = {};
  getCustomers().forEach(c=>{
    const r = rpRegionOfCustomer(c);
    (byRegion[r]=byRegion[r]||[]).push(c);
  });
  const order = [selectedRegion, ...(REGION_NEIGHBORS[selectedRegion]||[])];
  // Legg på øvrige regioner (med kunder) til slutt, så ingenting forsvinner
  Object.keys(byRegion).forEach(r=>{ if(!order.includes(r)) order.push(r); });
  // Sorter hver bolk: høyest omsetning først, sekundært samme by samlet
  return order.filter(r=>byRegion[r]&&byRegion[r].length).map(r=>{
    const list = byRegion[r].slice().sort((a,b)=>{
      if((b.l12||0)!==(a.l12||0)) return (b.l12||0)-(a.l12||0);
      return String(a.city||'').localeCompare(String(b.city||''));
    });
    return {region:r, customers:list, isPrimary:r===selectedRegion};
  });
}

function rpRenderCustomerList(){
  const host = document.getElementById('rp-customer-list');
  const sel = document.getElementById('rp-region');
  if(!host||!sel) return;
  const region = sel.value;
  const blocks = rpBuildBlocks(region);
  let html='';
  blocks.forEach(b=>{
    const sumL12 = b.customers.reduce((s,c)=>s+(c.l12||0),0);
    html += '<div class="card" style="margin-bottom:12px;'+(b.isPrimary?'border:1px solid #0C447C':'')+'">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<div style="font-weight:700;font-size:15px;color:#2C2C2A">'+(b.isPrimary?'📍 ':'')+escapeHtml(b.region)+'</div>';
    html += '<div style="font-size:11px;color:#888780">'+b.customers.length+' kunder · '+fmtKr(sumL12)+'</div>';
    html += '</div>';
    let lastCity='';
    b.customers.forEach(c=>{
      if(c.city!==lastCity){
        html += '<div style="font-size:10px;font-weight:700;letter-spacing:0.04em;color:#A8A6A0;text-transform:uppercase;margin:8px 0 4px">'+escapeHtml(c.city||'—')+'</div>';
        lastCity=c.city;
      }
      const checked = _rpSelected[c.id]?'checked':'';
      const cls = c.class||'';
      const clsColor = cls==='A'?'#1A7A4E':cls==='B'?'#6D4C00':'#888780';
      html += '<label style="display:flex;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid #F1EFE8;cursor:pointer">';
      html += '<input type="checkbox" '+checked+' onchange="rpToggle(\''+c.id+'\',this.checked)" style="flex-shrink:0">';
      html += '<span style="flex:1;min-width:0;font-size:13px;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(c.name)+'</span>';
      if(cls) html += '<span style="flex-shrink:0;font-size:10px;font-weight:700;color:'+clsColor+'">'+cls+'</span>';
      html += '<span style="flex-shrink:0;font-size:11px;color:#888780;min-width:64px;text-align:right">'+fmtKr(c.l12||0)+'</span>';
      html += '</label>';
    });
    html += '</div>';
  });
  host.innerHTML = html;
  rpUpdateSelectionBar();
}

function rpToggle(id, on){
  if(on) _rpSelected[id]=true; else delete _rpSelected[id];
  rpUpdateSelectionBar();
}

function rpClearSelection(){
  _rpSelected = {};
  rpRenderCustomerList();
}

function rpUpdateSelectionBar(){
  const ids = Object.keys(_rpSelected);
  const sel = getCustomers().filter(c=>_rpSelected[c.id]);
  const sumL12 = sel.reduce((s,c)=>s+(c.l12||0),0);
  const cEl=document.getElementById('rp-selected-count'); if(cEl) cEl.textContent=ids.length;
  const lEl=document.getElementById('rp-selected-l12'); if(lEl) lEl.textContent=fmtKr(sumL12);
}

// Nærmeste-nabo-rute fra startby gjennom alle valgte kunder.
function rpNearestNeighborRoute(startCity, customers){
  const remaining = customers.slice();
  const route = [];
  let current = startCity;
  while(remaining.length){
    let bestIdx=0, bestMin=Infinity;
    for(let i=0;i<remaining.length;i++){
      const info = getRouteInfo(current, remaining[i].city);
      const min = info?info.min:99999;
      if(min<bestMin){ bestMin=min; bestIdx=i; }
    }
    const next = remaining.splice(bestIdx,1)[0];
    const leg = getRouteInfo(current, next.city) || {min:0,km:0};
    route.push({customer:next, legMin:leg.min, legKm:leg.km, from:current});
    current = next.city;
  }
  return route;
}

// Del rute i dagsbolker. Maks kjøretid + besøkstid per dag styrer oppdelingen.
function rpSplitIntoDays(route, opts){
  const MAX_DRIVE_MIN = (opts&&opts.maxDriveMin)||300;   // 5t kjøring
  const VISIT_MIN = (opts&&opts.visitMin)||45;           // snitt per besøk
  const MAX_DAY_MIN = (opts&&opts.maxDayMin)||540;       // 9t arbeidsdag
  const days=[];
  let cur={legs:[], driveMin:0, visitMin:0};
  route.forEach(leg=>{
    const addDrive=leg.legMin, addVisit=VISIT_MIN;
    const wouldDrive=cur.driveMin+addDrive;
    const wouldDay=cur.driveMin+cur.visitMin+addDrive+addVisit;
    if(cur.legs.length && (wouldDrive>MAX_DRIVE_MIN || wouldDay>MAX_DAY_MIN)){
      days.push(cur); cur={legs:[], driveMin:0, visitMin:0};
    }
    cur.legs.push(leg); cur.driveMin+=addDrive; cur.visitMin+=addVisit;
  });
  if(cur.legs.length) days.push(cur);
  return days;
}


function rpBuildRoute(){
  const allSel = getCustomers().filter(c=>_rpSelected[c.id]);
  const host = document.getElementById('rp-route-result');
  if(!host) return;
  if(allSel.length===0){ host.innerHTML='<div class="empty-state">Hak av minst én kunde for å lage en plan.</div>'; return; }

  const region = document.getElementById('rp-region').value;
  const startDate = document.getElementById('rp-startdate').value;
  const numDays = Math.max(1, parseInt(document.getElementById('rp-days').value)||1);
  const maxPerDay = Math.max(1, parseInt(document.getElementById('rp-maxpd').value)||5);
  const homeCity = (userProfile&&userProfile.homeCity)||'';
  // Reisedetaljer (samme felter/oppførsel som automatisk planlegger)
  const _v = id => (document.getElementById(id)||{}).value || '';
  const flyDate=_v('rp-fly-date'), flyTime=_v('rp-fly-time'), flyCity=_v('rp-fly-city');
  const retDate=_v('rp-ret-date'), retTime=_v('rp-ret-time'), retCity=_v('rp-ret-city');
  const hotelName=_v('rp-hotel-name'), hotelCity=_v('rp-hotel-city');
  const useFly = !!(flyCity && (flyDate||flyTime));
  const returnHome = !!(retCity && retTime);
  const typedStart = (document.getElementById('rp-start').value||'').trim();

  // Arbeidstid fra profil (faller tilbake på 08:00 om ikke satt)
  const wStart = (userProfile&&userProfile.workStart)||'08:00';
  const [wh,wm] = wStart.split(':').map(Number);
  const dayStartMin = wh*60+wm;

  // Kapasitet: tak per dag × antall dager. For mange? Utsett lavest omsetning først.
  const capacity = maxPerDay * numDays;
  const sortedByL12 = allSel.slice().sort((a,b)=>(b.l12||0)-(a.l12||0));
  const planned = sortedByL12.slice(0, capacity);
  const deferred = sortedByL12.slice(capacity);

  const hub = flyCity || REGION_HUB[region] || (planned[0] && planned[0].city) || '';
  const startCity = useFly ? hub : (typedStart || homeCity || (planned[0] && planned[0].city) || '');

  // Nærmeste-nabo gjennom de planlagte
  const route = rpNearestNeighborRoute(startCity, planned);

  // Del i dager (maks N besøk/dag) og bygg renderPlanFromData-kompatibel struktur
  const dayChunks=[];
  for(let i=0;i<route.length;i+=maxPerDay){ dayChunks.push(route.slice(i,i+maxPerDay)); }

  const days = dayChunks.map((legs, di)=>{
    const dateObj = startDate ? rpAddDays(startDate, di) : new Date(Date.now()+di*864e5);
    const label = startDate ? rpDateLabelFull(dateObj) : ('Dag '+(di+1));
    const dayStartCity = (di===0) ? startCity : (dayChunks[di-1].length ? dayChunks[di-1][dayChunks[di-1].length-1].customer.city : startCity);

    // Klokkeslett: hver dag starter kl. arbeidstid-start; kjøretid + møtelengde kjedes
    let clock = dayStartMin;
    const customers = legs.map((leg, li)=>{
      const c = leg.customer;
      const drive = (li>0) ? leg.legMin : (di>0 ? leg.legMin : (useFly ? 0 : leg.legMin));
      if(li>0) clock += leg.legMin;
      const start = clock;
      const dur = rpVisitLen(c);
      const end = start + dur;
      clock = end;
      return Object.assign({}, c, {
        _start:start, _end:end, _drive:(li>0?leg.legMin:0), _duration:dur,
        appointed:false, isPrio:(c.class==='A')
      });
    });

    // Timeline (visit-blokker; renderPlanFromData håndterer kjøring/avreise selv)
    const timeline = customers.map(c=>({kind:'visit', customer:c, startMins:c._start, endMins:c._end}));

    // Hotell-natt mellom dager (ikke siste dag)
    let hotel=null;
    if(di < dayChunks.length-1){
      const lastCity = legs.length ? legs[legs.length-1].customer.city : '';
      let hotelName = 'Hotell '+(lastCity||'');
      if(typeof HOTELS_BY_CITY!=='undefined'){
        const key = Object.keys(HOTELS_BY_CITY).find(k=>String(lastCity||'').toLowerCase().includes(k.toLowerCase()));
        if(key && HOTELS_BY_CITY[key] && HOTELS_BY_CITY[key].length){ hotelName = HOTELS_BY_CITY[key][0].name; }
      }
      hotel = {name:hotelName, city:lastCity};
    }

    return {
      label, date:dateObj, startCity:dayStartCity, customers, timeline,
      hotel, zones:[], fixedCount:0
    };
  });

  // Flyankomst: hvis flyTime satt og samme dato som dag 1 → vis som flight-leg på dag 1.
  // Hvis flyDate er dagen FØR dag 1 → egen ankomstdag håndteres av plannerAddToCalendar
  // (tripMeta.flyDate), men i visningen viser vi ankomsten øverst på dag 1 uansett.
  if(useFly && hub && days.length){
    const fh = flyTime ? (parseInt(flyTime.split(':')[0])*60+parseInt(flyTime.split(':')[1])) : (dayStartMin-90);
    const sameDay = !flyDate || (startDate && flyDate===startDate);
    if(sameDay){
      days[0].timeline.push({kind:'flight-leg', id:1, from:(homeCity||''), to:hub, startMins:fh, endMins:fh+30, booked:false});
      days[0].timeline.sort((a,b)=>a.startMins-b.startMins);
    }
  }
  // Returfly siste dag — med ekte avgangstid (kan være midt på dagen)
  if(returnHome && retCity && days.length){
    const ld = days[days.length-1];
    const rm = retTime ? (parseInt(retTime.split(':')[0])*60+parseInt(retTime.split(':')[1])) : (17*60);
    const lastCity = ld.customers.length ? ld.customers[ld.customers.length-1].city : retCity;
    const driveMin = (lastCity===retCity?15:getDriveMin(lastCity,retCity));
    ld.timeline.push({kind:'flight-return', startMins:Math.max(0,rm-45-driveMin), endMins:rm, from:lastCity, to:retCity, retMins:rm, driveMin:driveMin});
  }

  // Lagre trip-meta så plannerAddToCalendar (felles m/auto) tar med fly/hotell/leiebil
  const _firstHotel = days.find(d=>d.hotel);
  window._lastTripMeta = {
    title:'Regionplan '+region,
    hasFlight: useFly,
    flyDate: flyDate || startDate || null,
    flyCity: hub,
    flyTime: flyTime || rpFmtTime(Math.max(0,dayStartMin-90)),
    hasHotel: !!(hotelName || _firstHotel),
    hotelName: hotelName || (_firstHotel && _firstHotel.hotel ? _firstHotel.hotel.name : ''),
    hotelBase: hotelCity || (_firstHotel && _firstHotel.hotel ? _firstHotel.hotel.city : ''),
    rental: useFly ? hub : '',
    hasReturn: returnHome,
    retCity: retCity || hub,
    retTime: retTime || '17:00',
    retDate: retDate || null,
    flyBooked:false, hotelBooked:false, rentalBooked:false, retBooked:false
  };

  // VIS via den FELLES planlegger-rendreren — identisk utseende som automatisk plan
  const out = document.getElementById('rp-route-result');
  const plannerOut = document.getElementById('planner-output');
  // renderPlanFromData skriver til #planner-output; vi midlertidig peker den hit
  if(plannerOut){
    renderPlanFromData(days);
    out.innerHTML = plannerOut.innerHTML;
    plannerOut.innerHTML = '';
  } else {
    renderPlanFromData(days);
  }
  window._lastPlan = days;

  // Utsatte kunder (kapasitet sprengt) — lavest omsetning først
  if(deferred.length){
    let dh = '<div class="card" style="margin-top:16px;padding:14px;background:#FBF3E8;border:1px solid #E8C9A0">';
    dh += '<div style="font-size:13px;font-weight:700;color:#8A5A1E;margin-bottom:6px">⏳ Utsatt til neste tur ('+deferred.length+')</div>';
    dh += '<div style="font-size:11px;color:#8A6A3E;margin-bottom:10px">Flere kunder enn det er plass til på '+numDays+' dag'+(numDays>1?'er':'')+' (maks '+maxPerDay+'/dag). Disse har lavest omsetning:</div>';
    deferred.forEach(c=>{
      dh += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #F0E4D2">';
      dh += '<span style="font-size:12px;color:#5F5E5A">'+escapeHtml(c.name)+' · '+escapeHtml(c.city||'')+'</span>';
      dh += '<span style="font-size:11px;color:#888780">'+nok(c.l12||0)+'</span></div>';
    });
    dh += '</div>';
    out.innerHTML += dh;
  }

  out.scrollIntoView({behavior:'smooth', block:'start'});
}

function rpToggleTravelBox(){
  const box=document.getElementById('rp-travel-box');
  const arr=document.getElementById('rp-travel-arrow');
  if(!box) return;
  const open = box.style.display==='none';
  box.style.display = open?'block':'none';
  if(arr) arr.textContent = open?'▾':'▸';
}

function getRouteInfo(fromCity, toCity){
  if(!fromCity||!toCity) return null;
  if(fromCity===toCity) return sameCityRoute(fromCity);
  // Forsøk å normalisere: hvis brukeren har skrevet en full adresse (f.eks. "Storgata 1, 9000 Tromsø"),
  // skal vi gjenkjenne "Kvaløya" som by
  function normalizeCity(s){
    if(!s) return s;
    // Hvis adressen inneholder en kjent bynavn fra ROUTE_DATA/CITY_COORDS, returner bynavnet
    const knownCities = Object.keys(CITY_COORDS);
    for(const c of knownCities){
      if(s.toLowerCase().includes(c.toLowerCase())) return c;
    }
    return s;
  }
  const f = normalizeCity(fromCity);
  const t = normalizeCity(toCity);
  if(f===t) return sameCityRoute(f);
  // 1. Eksakt match i ROUTE_DATA
  const exact = ROUTE_DATA[f+'-'+t]||ROUTE_DATA[t+'-'+f];
  if(exact) return exact;
  // 2. Estimat via koordinater
  return estimateRoute(f, t);
}

function getDriveMin(fromCity, toCity){
  if(!fromCity||!toCity) return 20;
  if(fromCity===toCity) return sameCityRoute(fromCity).min;
  const r=getRouteInfo(fromCity,toCity);
  return r?r.min:30;
}

function mapsLink(from, to){
  return 'https://www.google.com/maps/dir/'+encodeURIComponent(from)+'/'+encodeURIComponent(to);
}


// Hent korridor-naboer til et område, ordnet etter geografisk avstand fra startindeks
// I stedet for å veksle nord/sør symmetrisk, sender vi tilbake alle naboer i én retning
// først, så den andre retningen. Retningen velges basert på hvor det er flest kunder.
function getCorridorNeighbors(area, customers){
  const idx=AREA_CORRIDOR.indexOf(area);
  if(idx<0) return [];
  const northward=AREA_CORRIDOR.slice(idx+1);
  const southward=AREA_CORRIDOR.slice(0,idx).reverse();
  // Hvis ingen kundedata gitt, returner nord først som default
  if(!customers){ return [...northward, ...southward]; }
  // Tell antall kunder med L12>0 i hver retning (kun bynavn-match)
  function countInPath(path){
    let n=0;
    path.forEach(city=>{
      n += customers.filter(c=>c.l12>0 && matchesArea(c, city)).length;
    });
    return n;
  }
  const nN=countInPath(northward), sN=countInPath(southward);
  // Velg retning med flest kunder først
  if(nN >= sN) return [...northward, ...southward];
  return [...southward, ...northward];
}

function matchesArea(c, area){
  if(!area || area==='Alle') return true;
  const aLow=area.toLowerCase();
  const cityLow=(c.city||'').toLowerCase();
  const nameLow=(c.name||'').toLowerCase();
  const addrLow=((c.address||c.gate)||'').toLowerCase();
  // 1. Direkte match på fylke (kundens .city)
  if(cityLow===aLow || cityLow.includes(aLow)) return true;
  // 2. Bystedet ligger i kundenavnet (i parentes typisk)
  if(nameLow.includes(aLow)) return true;
  // 3. Bystedet ligger i adressen
  if(addrLow.includes(aLow)) return true;
  // 4. Området er en by — slå opp fylket og match mot kundens fylke
  const region=CITY_TO_REGION[area];
  if(region && cityLow===region.toLowerCase()) return true;
  return false;
}

// Rund ned til nærmeste halvtime
// Hent allerede planlagte avtaler/besøk på en dato — sortert etter starttid
function getFixedAppointmentsForDate(dt){
  const key=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  const evs=(calEvents[key]||[]).filter(e=>{
    // Hopp over auto-genererte og kjøringer
    if(e.type==='drive'||e.type==='drive-auto'||e.type==='hotel') return false;
    // Hopp over planner-genererte (har agenda som starter med "Planlagt besøk")
    if(e.agenda && e.agenda.startsWith('Planlagt besøk')) return false;
    return true;
  }).map(e=>{
    const startMins=e.startMins!==undefined?e.startMins:(e.h||8)*60;
    const endMins=e.endMins!==undefined?e.endMins:(e.hEnd?e.hEnd*60:startMins+60);
    return {startMins,endMins,label:e.label||'Avtale',type:e.type||'visit'};
  }).sort((a,b)=>a.startMins-b.startMins);
  return evs;
}

function runPlanner(){
  const area=document.getElementById('planner-area').value;
  const dateStr=document.getElementById('planner-date').value||TODAY_STR;
  const startT=document.getElementById('planner-start').value||'08:00';
  const endT=document.getElementById('planner-end').value||'17:00';
  const homeBase=(document.getElementById('planner-home')||{}).value||_plannerHomeBase;
  let startFromHome=(document.getElementById('planner-from-home')||{}).checked;
  _plannerHomeBase=homeBase;
  _plannerStartFromHome=startFromHome;
  // Reisedetaljer (tittel, fly, hotell, leiebil)
  const tripMeta = readTripMeta();
  // Behold bestilt-status fra forrige kjøring (sjekkboksene i planvisningen)
  const _prevTm = window._lastTripMeta||{};
  tripMeta.flyBooked = !!_prevTm.flyBooked;
  tripMeta.hotelBooked = !!_prevTm.hotelBooked;
  tripMeta.rentalBooked = !!_prevTm.rentalBooked;
  tripMeta.retBooked = !!_prevTm.retBooked;
  // Med flyankomst: man starter IKKE hjemmefra — basen er hotell-/ankomstbyen
  if(tripMeta.hasFlight){ startFromHome = false; }
  const output=document.getElementById('planner-output');
  output.innerHTML='<div class="planner-loading">🤖 Analyserer kunder og setter opp plan…</div>';
  // Sjekk om egendefinert rute er aktiv
  const customRouteActive = (document.getElementById('planner-custom-route')||{}).checked && _customRoute.length>0;
  // Bygg pool: enten fra egendefinert rute eller fra korridor-naboer
  const customerZone=new Map(); // c.name -> zone (område-navn fra korridor eller fylke)
  // Dagsgrupper for egendefinert rute: hver gruppe = én dag med én eller flere byer.
  // Samme by kan forekomme i flere grupper (flere dager samme sted) — kundene
  // fordeles da fortløpende: dag 2 i samme by fortsetter der dag 1 slapp.
  const customDayGroups = customRouteActive ? customRouteDayGroups() : [];
  let pool=[];
  if(customRouteActive){
    // Bruk byene i den rekkefølgen brukeren har valgt (unike byer, første forekomst teller)
    const seen=new Set();
    const uniqueCities=[];
    _customRoute.forEach(r=>{ if(!uniqueCities.includes(r.city)) uniqueCities.push(r.city); });
    uniqueCities.forEach(city=>{
      const cityCust=getCustomers().filter(c=>c.l12>0&&!seen.has(c.name)&&matchesArea(c,city));
      cityCust.sort((a,b)=>b.l12-a.l12);
      cityCust.forEach(c=>{
        seen.add(c.name);
        customerZone.set(c.name, city);
        pool.push(c);
      });
    });
  } else {
    pool=getCustomers().filter(c=>c.l12>0&&matchesArea(c,area));
    pool.forEach(c=>customerZone.set(c.name, area));
    if(_plannerDays>1 && area!=='Alle'){
      // Hent naboområder i geografisk rekkefølge fra korridoren
      const neighbors=getCorridorNeighbors(area, getCustomers());
      const seen=new Set(pool.map(c=>c.name));
      // For hver nabo-by i korridoren (i geografisk rekkefølge), hent kunder fra den byen
      neighbors.forEach(nb=>{
        const nbCust=getCustomers().filter(c=>c.l12>0&&!seen.has(c.name)&&matchesArea(c,nb));
        nbCust.sort((a,b)=>b.l12-a.l12);
        nbCust.forEach(c=>{
          seen.add(c.name);
          customerZone.set(c.name, nb);
          pool.push(c);
        });
      });
      // Som fallback: legg til evt. gjenværende kunder fra samme fylke
      const startRegion=CITY_TO_REGION[area];
      if(startRegion){
        const moreInRegion=getCustomers().filter(c=>c.l12>0&&!seen.has(c.name)&&(c.city||'').toLowerCase()===startRegion.toLowerCase());
        moreInRegion.sort((a,b)=>b.l12-a.l12);
        moreInRegion.forEach(c=>{
          seen.add(c.name);
          customerZone.set(c.name, startRegion);
          pool.push(c);
        });
      }
    }
  }
  if(pool.length===0 && !customRouteActive && area!=='Alle' && CITY_TO_REGION[area]){
    const region=CITY_TO_REGION[area];
    pool=getCustomers().filter(c=>c.l12>0&&(c.city||'').toLowerCase()===region.toLowerCase());
    pool.forEach(c=>customerZone.set(c.name, area));
  }
  if(pool.length===0){
    output.innerHTML='<div class="planner-result" style="color:#888780;text-align:center;padding:24px">Ingen kunder funnet i '+(customRouteActive?'valgte byer':area)+'.</div>';
    return;
  }
  // Sortér: respekter egendefinert rekkefølge, ellers korridor-rekkefølge
  const zoneOrder = customRouteActive ? (()=>{const u=[];_customRoute.forEach(r=>{if(!u.includes(r.city))u.push(r.city);});return u;})() : [area, ...getCorridorNeighbors(area, getCustomers())];
  pool.sort((a,b)=>{
    const za=zoneOrder.indexOf(customerZone.get(a.name));
    const zb=zoneOrder.indexOf(customerZone.get(b.name));
    if(za!==zb) return (za<0?999:za)-(zb<0?999:zb);
    return b.l12-a.l12;
  });
  const [sh,sm]=startT.split(':').map(Number);
  const [eh,em]=endT.split(':').map(Number);
  const dayStartMin=roundUpTo30(sh*60+sm);
  const dayEndMin=roundTo30(eh*60+em);
  // Besøkstid basert på omsetning, rundet til halvtimer
  function visitDuration(c){
    if(c.l12>=200000) return 120;
    if(c.l12>=100000) return 90;
    return 60;
  }
  // Default åpningstider per kjede/butikktype. Returner åpningstid (min siden midnatt) for hverdager.
  // Sportskjeder åpner stort sett 09:00–10:00 i Norge. B2B/Pro-shops kan starte tidligere.
  function getOpeningTimeMin(c, weekday){
    // Hvis kunden har egen registrert åpningstid, bruk den (lagret som "HH:MM")
    if(c.opening){
      const m=c.opening.match(/^(\d{1,2}):(\d{2})$/);
      if(m) return parseInt(m[1])*60+parseInt(m[2]);
    }
    // Lørdag/søndag: typisk senere åpning
    if(weekday===6){ return 10*60; }      // lør 10:00
    if(weekday===0){ return 12*60; }      // søn 12:00 (mange stengt — antas senere)
    const name=(c.name||'').toUpperCase();
    const chain=(c.chain||'').toUpperCase();
    // B2B/pro-shop åpner ofte tidligere (administrativt åpent)
    if(name.includes('B2B')||name.includes('PRO')||chain.includes('B2B')) return 8*60;
    // Nava Sport / G-Sport / Intersport / Sport 1 / Stadion / Anton Sport: hverdager fra 09:00
    if(/INTERSPORT|SPORT 1|STADION|G-SPORT|NAVA|ANTON|XXL|SPORTSHUSET|SPORTSCENTER|SKORINGEN|EURO SKO|FALKANGER|JAKTIA/.test(chain+' '+name)){
      return 10*60;  // 10:00
    }
    // Frittstående/spesialbutikker (sykkel/jakt/sport): typisk 10:00
    return 10*60;
  }
  // Finn lunsjslot mellom 11:00 og 12:30 (gir 30 min lunsj)
  function findLunchSlot(busy){
    const earliest=11*60, latest=12*60+30, lunchDur=30;
    // Søk etter en 30-min slot innenfor 11:00-13:00 som ikke kolliderer med busy[]
    for(let t=earliest; t<=latest; t+=30){
      const conflict=busy.some(b=>t<b.endMins && t+lunchDur>b.startMins);
      if(!conflict) return {startMins:t, endMins:t+lunchDur};
    }
    // Fallback: 11:30
    return {startMins:11*60+30, endMins:12*60};
  }
  const startDate=new Date(dateStr);
  const days=[];
  // I egendefinert rute-modus styres antall dager av rutepunkt-gruppene
  const effDays = customRouteActive ? customDayGroups.length : _plannerDays;
  // Fordel kunder jevnt over alle dager — IKKE bruk opp alle på dag 1
  const maxPerDay = _plannerMaxVisits>0 ? _plannerMaxVisits : 99;
  const customersPerDay = Math.max(1, Math.min(maxPerDay, Math.ceil(pool.length/effDays)));

  let custIdx=0;
  // Custom rute: hold styr på hvilke kunder som er plassert (på tvers av dager)
  const _placedGlobal = new Set();
  let _groupIdx = 0; // teller for dagsgrupper — øker kun på arbeidsdager
  // Hvor starter dag 2+ fra? Default = hjem hvis dag 1 endte hjemme, ellers siste besøk by.
  let lastDayEndCity = homeBase;
  let prevDayEndedAtHome = true;
  for(let d=0; (customRouteActive ? (_groupIdx<customDayGroups.length && d<customDayGroups.length+14) : d<effDays); d++){
    const dayDate=new Date(startDate);
    dayDate.setDate(startDate.getDate()+d);
    const dayKey=dayDate.getFullYear()+'-'+String(dayDate.getMonth()+1).padStart(2,'0')+'-'+String(dayDate.getDate()).padStart(2,'0');
    const holidayName=getHolidayName(dayKey);
    const persDay=getPersonalDay(dayKey);
    const dayLabel=['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'][dayDate.getDay()]+' '+dayDate.getDate()+'. '+['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'][dayDate.getMonth()];
    // Hopp over helligdager og registrerte fridager — vi legger til en tom dag med varsel
    if(holidayName || persDay){
      const reason = holidayName || (persDay.label || 'Fridag');
      days.push({label:dayLabel,date:dayDate,customers:[],timeline:[],startMin:dayStartMin,fixedCount:0,zones:[],startCity:'',skippedReason:reason,isHoliday:!!holidayName});
      // Antall dager øker, men ingen kunder konsumeres på fridag
      continue;
    }
    // Hent eksisterende faste avtaler for denne dagen
    const fixedAppts=getFixedAppointmentsForDate(dayDate);
    // Bygg busy-liste (faste avtaler er låst)
    const busy=fixedAppts.map(a=>({...a,fixed:true}));
    // Plasser besøk i ledige luker (rundt faste avtaler)
    const dayCustomers=[];
    let lunchInserted=false;
    // Bestem dagens startsted:
    //   - Dag 1: hjemmebase (hvis "start fra hjem" er på)
    //   - Dag 2+: forrige dags sluttsted, MEN hvis forrige dag endte hjemme,
    //     start på hjemmebase igjen (du har sovet hjemme)
    let dayStartCity;
    if(d===0){
      if(tripMeta.hasFlight){
        // Fly: dag 1 starter fra hotellbyen (eller ankomstbyen)
        dayStartCity = tripMeta.hotelBase || tripMeta.flyCity;
      } else {
        dayStartCity = startFromHome ? homeBase : (area==='Alle'?'':area);
      }
    } else if(prevDayEndedAtHome && startFromHome){
      dayStartCity = homeBase;
    } else {
      dayStartCity = lastDayEndCity;
    }
    // Flyankomst SAMME DAG som dag 1: dagen kan tidligst starte 45 min etter landing
    let dayStartMinEff = dayStartMin;
    if(d===0 && tripMeta.hasFlight && tripMeta.flyDate===dayKey && tripMeta.flyTime){
      const [fh,fm]=tripMeta.flyTime.split(':').map(Number);
      dayStartMinEff = Math.max(dayStartMin, roundUpTo30(fh*60+fm+45));
    }
    // LANG TRANSPORT TIL DAGENS OMRÅDE? Hvis kjøringen fra dagens startsted til
    // dagens første by er over 3 timer, legges transporten som en KVELDSETAPPE
    // på forrige dag (med overnatting), slik at dagen kan starte i området.
    if(d>0){
      const nextCity = customRouteActive
        ? ((customDayGroups[_groupIdx]||[])[0] || null)
        : (custIdx<pool.length ? (pool[custIdx].city||area) : null);
      if(nextCity){
        const transferMin = getDriveMin(dayStartCity, nextCity);
        if(transferMin > 180){
          // Finn forrige arbeidsdag med besøk og legg kveldsetappen der
          let pd=null;
          for(let k=days.length-1;k>=0;k--){
            if(days[k].customers && days[k].customers.length>0){ pd=days[k]; break; }
          }
          if(pd){
            const lastV = pd.customers[pd.customers.length-1];
            const evFrom = lastV.city || pd.startCity;
            const evDrive = getDriveMin(evFrom, nextCity);
            const evStart = lastV._end;
            pd.timeline.push({kind:'drive-evening', startMins:evStart, endMins:evStart+evDrive, from:evFrom, to:nextCity, min:evDrive});
            pd.timeline.sort((a,b)=>a.startMins-b.startMins);
            pd.eveningTransfer = {from:evFrom, to:nextCity, min:evDrive};
            dayStartCity = nextCity;
            prevDayEndedAtHome = false;
          }
        }
      }
    }
    let prevCity = dayStartCity;
    // Dag 1 fra hjemmebase som er > 3t unna målområdet: anta at bruker er fremme
    // (fly/bil kvelden før). Beregn kjøretider fra målbyen, ikke hjemmebasen.
    if(d===0 && !customRouteActive && dayStartCity && area!=='Alle'){
      if(getDriveMin(dayStartCity, area) > 180){
        dayStartCity = area;
        prevCity = area;
      }
    }
    let lastEndMin=dayStartMinEff;
    // Returfly: på avreisedagen (angitt dato, ellers siste plandag) må besøkene
    // slutte senest 1t 45min før flyavgang (innsjekk + kjøring til flyplassen).
    const isLastDay = customRouteActive ? (_groupIdx===customDayGroups.length-1) : (d===effDays-1);
    let returnFlightToday = false;
    let dayEndEff = dayEndMin;
    if(tripMeta.hasReturn){
      const retOnThisDay = tripMeta.retDate ? (tripMeta.retDate===dayKey) : isLastDay;
      if(retOnThisDay){
        returnFlightToday = true;
        const [rh,rm]=tripMeta.retTime.split(':').map(Number);
        const retMins = rh*60+rm;
        dayEndEff = Math.min(dayEndMin, roundTo30(retMins-105));
      }
    }
    // Hjelp: finn ledig slot for et besøk med kjøretid + varighet
    // Hvis kunden har åpningstid, ankomst kan ikke være før den.
    function findSlot(driveMin, durMin, afterMin, fromCity, customer){
      const weekday=dayDate.getDay();
      const openMin=customer?getOpeningTimeMin(customer, weekday):0;
      let t=roundUpTo30(Math.max(afterMin+driveMin, openMin));
      while(t+durMin<=dayEndEff){
        const conflict=busy.some(b=>t<b.endMins && t+durMin>b.startMins);
        if(!conflict) return t;
        const next=busy.find(b=>b.endMins>t)||{endMins:dayEndEff};
        t=roundUpTo30(next.endMins);
      }
      return -1;
    }
    // I egendefinert modus: begrens dagens kandidater til dagens byer (rutegruppen).
    // Kunder som ikke fikk plass en tidligere dag i samme by er fortsatt tilgjengelige.
    const _dayCities = customRouteActive ? new Set(customDayGroups[_groupIdx]||[]) : null;
    const dayPool = customRouteActive
      ? pool.filter(c=>_dayCities.has(customerZone.get(c.name)) && !_placedGlobal.has(c.name))
      : pool;
    let dIdx = customRouteActive ? 0 : custIdx;
    // Før dagen begynner: hvis kunde nr 1 i poolen åpner sent (10:00), men en kunde
    // lenger ned i samme område åpner tidlig (08:00 / B2B), bytt rekkefølge så
    // dagen starter med den tidligste åpningen. Bytt KUN innenfor samme by.
    {
      const weekday=dayDate.getDay();
      // Finn første kunde i poolen som ikke er plassert på en tidligere dag
      let firstIdx=dIdx;
      if(firstIdx<dayPool.length){
        const firstCity=dayPool[firstIdx].city||area;
        // Finn beste kandidat (tidligst åpning) blant kunder i samme by, innenfor neste 5
        let bestIdx=firstIdx;
        let bestOpen=getOpeningTimeMin(dayPool[firstIdx], weekday);
        for(let k=firstIdx+1; k<Math.min(firstIdx+6, dayPool.length); k++){
          if((dayPool[k].city||area)!==firstCity) break;  // bare innen samme by
          const o=getOpeningTimeMin(dayPool[k], weekday);
          if(o<bestOpen){ bestOpen=o; bestIdx=k; }
        }
        if(bestIdx!==firstIdx){
          // Bytt slik at tidligste åpning kommer først
          const tmp=dayPool[firstIdx]; dayPool[firstIdx]=dayPool[bestIdx]; dayPool[bestIdx]=tmp;
        }
      }
    }
    // Itererer gjennom kunder
    let placed=0;
    while(dIdx<dayPool.length && placed<maxPerDay){
      const c=dayPool[dIdx];
      // Kjøring til første kunde: bruk dayStartCity (hjem på dag 1, eller forrige dags sluttsted).
      // Hvis dayStartCity er tom (ingen valgt startpunkt), behandles det som "allerede der".
      let drive;
      if(dayCustomers.length===0 && fixedAppts.length===0){
        drive = dayStartCity ? getDriveMin(dayStartCity, c.city||area) : 0;
      } else {
        drive = getDriveMin(prevCity||area, c.city||area);
      }
      const dur=visitDuration(c);
      const slot=findSlot(drive, dur, lastEndMin, prevCity, c);
      // VIKTIG: Hvis kunden ikke får plass på denne dagen, IKKE hopp over —
      // la kunden gå videre til neste dag (break ut av dagens loop).
      if(slot<0){ break; }
      // Sett inn lunsj hvis vi er forbi 11:00 og lunsj ikke er satt
      if(!lunchInserted && slot>=11*60){
        const lunch=findLunchSlot(busy);
        if(lunch.startMins<=slot){
          busy.push({startMins:lunch.startMins,endMins:lunch.endMins,label:'Lunsj',type:'lunch',fixed:true});
          busy.sort((a,b)=>a.startMins-b.startMins);
          lunchInserted=true;
          // Re-evaluer slot etter lunsj
          const newSlot=findSlot(drive, dur, lastEndMin, prevCity, c);
          if(newSlot<0){ break; }
          dayCustomers.push({...c,_drive:drive,_duration:dur,_start:newSlot,_end:newSlot+dur,isPrio:c.l12>=150000});
          busy.push({startMins:newSlot,endMins:newSlot+dur,label:c.name,fixed:false});
          busy.sort((a,b)=>a.startMins-b.startMins);
          lastEndMin=newSlot+dur;
          prevCity=c.city||area;
          _placedGlobal.add(c.name);
          dIdx++;
          placed++;
          continue;
        }
      }
      dayCustomers.push({...c,_drive:drive,_duration:dur,_start:slot,_end:slot+dur,isPrio:c.l12>=150000});
      busy.push({startMins:slot,endMins:slot+dur,label:c.name,fixed:false});
      busy.sort((a,b)=>a.startMins-b.startMins);
      lastEndMin=slot+dur;
      prevCity=c.city||area;
      _placedGlobal.add(c.name);
      dIdx++;
      placed++;
    }
    // I normal modus: synk global indeks (dayPool === pool der)
    if(!customRouteActive) custIdx = dIdx;
    // I egendefinert modus: dagens rutegruppe er ferdig — gå til neste gruppe
    if(customRouteActive) _groupIdx++;
    // Sett inn lunsj hvis ikke alt — bare hvis vi har minst ett besøk forbi 11:00
    if(!lunchInserted && dayCustomers.some(c=>c._start>=11*60)){
      const lunch=findLunchSlot(busy);
      busy.push({startMins:lunch.startMins,endMins:lunch.endMins,label:'Lunsj',type:'lunch',fixed:true});
    }
    // Hvis første besøk starter senere enn dayStartMin (typisk fordi butikkene åpner 10:00),
    // sett inn en "Adm./forberedelse"-blokk om morgenen.
    let admBlock = null;
    if(dayCustomers.length>0){
      const firstStart = Math.min(...dayCustomers.map(c=>c._start));
      // Sjekk om det er en kjøring først (drive>0 på første besøk) — i så fall fyller kjøringen tiden
      const firstCust = dayCustomers.find(c=>c._start===firstStart);
      const hasMorningDrive = firstCust && firstCust._drive>=30;
      // Hvis det er minst 30 min ledig om morgenen og ingen lang kjøring der, legg inn adm-blokk
      if(firstStart - dayStartMin >= 30 && !hasMorningDrive){
        // Adm-blokken slutter senest 15 min før første besøk (litt buffer)
        const admEnd = roundTo30(Math.max(dayStartMin+30, firstStart-15));
        if(admEnd > dayStartMin){
          admBlock = {startMins: dayStartMin, endMins: admEnd};
        }
      }
    }
    // Sortér alt etter starttid for visning
    const timeline=[];
    // Returfly: legg hjemreise-blokken på slutten av dagen
    if(returnFlightToday && tripMeta.retCity){
      const [rh,rm]=tripMeta.retTime.split(':').map(Number);
      const retMins=rh*60+rm;
      const lastV = dayCustomers.length>0 ? dayCustomers[dayCustomers.length-1] : null;
      const fromC = lastV ? (lastV.city||dayStartCity) : dayStartCity;
      const sameCity = !fromC || fromC===tripMeta.retCity;
      const driveToAirport = sameCity ? 15 : getDriveMin(fromC, tripMeta.retCity);
      const blockStart = Math.max(lastV?lastV._end:dayStartMinEff, retMins-45-driveToAirport);
      timeline.push({kind:'flight-return', startMins:blockStart, endMins:retMins, from:fromC, to:tripMeta.retCity, retMins:retMins, driveMin:driveToAirport});
    }
    dayCustomers.forEach(c=>timeline.push({kind:'visit',customer:c,startMins:c._start,endMins:c._end}));
    fixedAppts.forEach(a=>timeline.push({kind:'fixed',appt:a,startMins:a.startMins,endMins:a.endMins}));
    busy.filter(b=>b.type==='lunch').forEach(l=>timeline.push({kind:'lunch',startMins:l.startMins,endMins:l.endMins}));
    // Legg eksplisitt inn "kjøring fra startsted" som egen blokk hvis det er kjøretid > 0
    // på dagens første besøk. Dette gjør at brukeren ALLTID ser hvor reisen begynner.
    let driveHomeBlock = null;
    if(dayCustomers.length>0 && dayStartCity){
      const firstC = dayCustomers.reduce((a,b)=>(b._start<a._start?b:a), dayCustomers[0]);
      const firstDrive = firstC._drive || 0;
      const firstCity = firstC.city || '';
      if(firstDrive>0 && firstCity && firstCity!==dayStartCity){
        const driveStart = Math.max(dayStartMin, firstC._start - firstDrive);
        driveHomeBlock = {kind:'drive-home', startMins:driveStart, endMins:firstC._start, from:dayStartCity, to:firstCity, min:firstDrive};
        timeline.push(driveHomeBlock);
      }
    }
    // Adm-blokk skal kun fylles inn der det IKKE er drive-home tidlig
    if(admBlock){
      // Juster admBlock så den ikke overlapper drive-home
      if(driveHomeBlock && admBlock.endMins > driveHomeBlock.startMins){
        admBlock.endMins = driveHomeBlock.startMins;
      }
      if(admBlock.endMins - admBlock.startMins >= 30){
        timeline.push({kind:'adm',startMins:admBlock.startMins,endMins:admBlock.endMins});
      }
    }
    timeline.sort((a,b)=>a.startMins-b.startMins);
    // Hvilke soner dekker denne dagen?
    const zones=[...new Set(dayCustomers.map(c=>customerZone.get(c.name)).filter(Boolean))];
    days.push({label:dayLabel,date:dayDate,customers:dayCustomers,timeline:timeline,startMin:dayStartMin,fixedCount:fixedAppts.length,zones:zones,startCity:dayStartCity});
    // Oppdater "forrige dags sluttsted" for neste iterasjon
    if(dayCustomers.length>0){
      const lastVisit = dayCustomers[dayCustomers.length-1];
      lastDayEndCity = lastVisit.city || dayStartCity;
      // Vurder om dagen "endte hjemme": dvs. om siste besøk var i samme by/område som hjemmebase
      // ELLER om kjøretiden fra siste besøk hjem er kort (<60 min) — da forutsetter vi at man kjører hjem
      const driveHome = getDriveMin(lastDayEndCity, homeBase);
      prevDayEndedAtHome = (driveHome <= 60) && !tripMeta.hasHotel && !tripMeta.hasFlight;
      // Lagre hvor man sover etter denne dagen — driver hotellvelgeren i planen
      const thisDay = days[days.length-1];
      thisDay.sleepAtHome = prevDayEndedAtHome;
      thisDay.sleepCity = prevDayEndedAtHome ? null : lastDayEndCity;
    } else {
      // Tom dag — behold forrige tilstand
    }
  }
  // Hjemtur siste dag — legg på en drive-home-return-blokk hvis siste dag har besøk
  // og siste besøkssted ikke er hjemme
  if(days.length>0 && startFromHome && homeBase){
    const lastDay = days[days.length-1];
    if(lastDay.customers.length>0){
      const lastVisit = lastDay.customers[lastDay.customers.length-1];
      const fromCity = lastVisit.city || lastDay.startCity;
      const homeDriveMin = getDriveMin(fromCity, homeBase);
      // Vis kun hvis kjøretid > 0 og det faktisk er forskjellig sted
      if(homeDriveMin>0 && fromCity && fromCity!==homeBase){
        const returnStart = lastVisit._end;
        const returnEnd = returnStart + homeDriveMin;
        lastDay.timeline.push({
          kind:'drive-home-return',
          startMins: returnStart,
          endMins: returnEnd,
          from: fromCity,
          to: homeBase,
          min: homeDriveMin
        });
        lastDay.timeline.sort((a,b)=>a.startMins-b.startMins);
        lastDay.returnHome = {startMins: returnStart, endMins: returnEnd, from: fromCity, to: homeBase, min: homeDriveMin};
      }
    }
  }
  // Telefonpool: ringbare kandidater som ikke er på planen, sortert etter L12
  const planNames=new Set();
  days.forEach(day=>day.customers.forEach(c=>planNames.add(c.name)));
  const callPool=getCustomers().filter(c=>!planNames.has(c.name)&&(c.phone||(c.contacts||[]).some(p=>p.phone)));
  callPool.sort((a,b)=>(b.l12||0)-(a.l12||0));
  let html='<div class="planner-result">';
  // Pool-fordeling per sone (debug-informasjon for å vise hvor kundene kommer fra)
  const zoneBreakdown={};
  pool.forEach(c=>{ const z=customerZone.get(c.name)||area; zoneBreakdown[z]=(zoneBreakdown[z]||0)+1; });
  const zoneList=Object.keys(zoneBreakdown).map(z=>z+' ('+zoneBreakdown[z]+')').join(' · ');
  const planTitle = tripMeta.title || (customRouteActive ? ('Egendefinert: '+customDayGroups.map(g=>g.join('+')).join(' → ')) : ('Plan for '+area));
  // Reiseinfo-bokser (fly, hotell, leiebil) vises øverst i planen
  let tripInfoHtml='';
  if(tripMeta.hasFlight){
    const flyDateNice = tripMeta.flyDate ? tripMeta.flyDate.split('-').reverse().join('.') : '';
    tripInfoHtml+='<div style="background:#E6F1FB;border:1px solid #B8D4E8;border-radius:8px;padding:8px 12px;margin:4px 0;font-size:12px;color:#0C447C;display:flex;align-items:center;gap:8px'+(tripMeta.flyBooked?'':';opacity:0.62')+'"><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700"><input type="checkbox" '+(tripMeta.flyBooked?'checked':'')+' onchange="toggleTripBooked(\'flyBooked\', this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label><div style="flex:1;min-width:0"><span class="book-mark">'+(tripMeta.flyBooked?'✅':'❌')+'</span> ✈ <strong>Flyankomst:</strong> '+escapeHtml(tripMeta.flyCity)+' '+flyDateNice+(tripMeta.flyTime?' kl. '+tripMeta.flyTime:'')+(tripMeta.flyDate<dateStr?' <span style="background:#0C447C;color:#fff;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600">dagen før</span>':'')+'</div></div>';
  }
  if(tripMeta.hasHotel){
    const hotelQuery=encodeURIComponent(tripMeta.hotelName+(tripMeta.hotelBase?', '+tripMeta.hotelBase:'')+', Norge');
    tripInfoHtml+='<div style="background:#FFF6E6;border:1px solid #E6D9B8;border-radius:8px;padding:8px 12px;margin:4px 0;font-size:12px;color:#6D4C00;display:flex;align-items:center;gap:8px'+(tripMeta.hotelBooked?'':';opacity:0.62')+'"><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700"><input type="checkbox" '+(tripMeta.hotelBooked?'checked':'')+' onchange="toggleTripBooked(\'hotelBooked\', this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label><div style="flex:1;min-width:0"><span class="book-mark">'+(tripMeta.hotelBooked?'✅':'❌')+'</span> 🏨 <strong>Hotell:</strong> '+escapeHtml(tripMeta.hotelName)+(tripMeta.hotelBase?' ('+escapeHtml(tripMeta.hotelBase)+')':'')+' · <a href="https://www.google.com/maps/search/'+hotelQuery+'" target="_blank" style="color:#1565C0;text-decoration:underline">Adresse/Maps ↗</a></div></div>';
  }
  if(tripMeta.rental){
    tripInfoHtml+='<div style="background:#F1EFE8;border:1px solid #D3D1C7;border-radius:8px;padding:8px 12px;margin:4px 0;font-size:12px;color:#5F5E5A;display:flex;align-items:center;gap:8px'+(tripMeta.rentalBooked?'':';opacity:0.62')+'"><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700"><input type="checkbox" '+(tripMeta.rentalBooked?'checked':'')+' onchange="toggleTripBooked(\'rentalBooked\', this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label><div style="flex:1;min-width:0"><span class="book-mark">'+(tripMeta.rentalBooked?'✅':'❌')+'</span> 🚙 <strong>Leiebil:</strong> '+escapeHtml(tripMeta.rental)+'</div></div>';
  } else if(tripMeta.hasFlight){
    // Foreslå leiebil-uttak ved ankomst, fra foretrukket leverandør i profilen
    const rp = RENTAL_NAMES[userProfile.rentalPref]||'';
    const rentalQ = encodeURIComponent((rp?rp+' ':'')+'leiebil '+tripMeta.flyCity+' lufthavn');
    tripInfoHtml+='<div style="background:#F1EFE8;border:1px dashed #888780;border-radius:8px;padding:8px 12px;margin:4px 0;font-size:12px;color:#5F5E5A">🚙 <strong>Forslag:</strong> Hent leiebil'+(rp?' hos <strong>'+rp+'</strong>':'')+' ved '+escapeHtml(tripMeta.flyCity)+' lufthavn ved ankomst · <a href="https://www.google.com/maps/search/'+rentalQ+'" target="_blank" style="color:#1565C0;text-decoration:underline">Finn utleier ↗</a><span style="color:#888780"> — skriv inn i Leiebil-feltet for å bekrefte</span></div>';
  }
  html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px"><div style="font-size:16px;font-weight:700;color:#2C2C2A;min-width:0;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(planTitle)+'</div><div style="font-size:12px;color:#888780;flex-shrink:0">'+pool.length+' kunder · '+_plannerDays+' dag(er)</div></div>';
  html+=tripInfoHtml;
  html+='<div style="font-size:11px;color:#888780;margin-bottom:14px">Områder i poolen: '+zoneList+'</div>';
  days.forEach((day,dayIdx)=>{
    // Forhåndsberegn kjøreturer >15 min for denne dagen (for ringeforslag)
    const driveSegments=[];
    day.customers.forEach((c,i)=>{if(c._drive>=15) driveSegments.push(c.name);});
    const dayCalls=callPool.slice(dayIdx*10,(dayIdx+1)*10);
    const totalDriveMin=day.customers.filter(c=>c._drive>=15).reduce((s,c)=>s+c._drive,0);
    const callsByCustomer={};
    if(driveSegments.length>0&&totalDriveMin>0){
      let assigned=0;
      day.customers.filter(c=>c._drive>=15).forEach((c,j,arr)=>{
        const share=j===arr.length-1?dayCalls.length-assigned:Math.round((c._drive/totalDriveMin)*dayCalls.length);
        callsByCustomer[c.name]=dayCalls.slice(assigned,assigned+share);
        assigned+=share;
      });
    }
    const fixedInfo=day.fixedCount>0?' · <span style="color:#0C447C">'+day.fixedCount+' fast(e) avtale(r)</span>':'';
    const zoneInfo=day.zones&&day.zones.length>0?' · <span style="color:#0A4A7A;font-weight:600">📍 '+day.zones.join(' → ')+'</span>':'';
    html+='<div class="planner-day"><div class="planner-day-title">'+day.label+' <span style="font-weight:400;color:#888780;font-size:12px">· '+day.customers.length+' besøk'+fixedInfo+zoneInfo+'</span></div>';
    // Vis fridag-/helligdag-banner og hopp over resten av dagen
    if(day.skippedReason){
      const icon = day.isHoliday ? '🎉' : '🌴';
      const bg = day.isHoliday ? '#FBE9E7' : '#FFF4E6';
      const border = day.isHoliday ? '#C62828' : '#BA7517';
      const txtColor = day.isHoliday ? '#C62828' : '#6D4C00';
      html+='<div style="background:'+bg+';border:1px solid '+border+';color:'+txtColor+';padding:12px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600">'+icon+' '+escapeHtml(day.skippedReason)+' — ingen besøk planlagt</div></div>';
      return;
    }
    let prevCity = day.startCity || (area==='Alle'?'':area);
    day.timeline.forEach(item=>{
      const hh=String(Math.floor(item.startMins/60)).padStart(2,'0');
      const mm=String(item.startMins%60).padStart(2,'0');
      const ehh=String(Math.floor(item.endMins/60)).padStart(2,'0');
      const emm=String(item.endMins%60).padStart(2,'0');
      if(item.kind==='lunch'){
        html+='<div class="planner-stop" style="opacity:0.85"><div class="planner-stop-time">'+hh+':'+mm+'</div><div class="planner-stop-icon">🍽️</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#5F5E5A;font-weight:500">Lunsj</div><div class="planner-stop-meta">'+hh+':'+mm+' – '+ehh+':'+emm+'</div></div></div>';
      } else if(item.kind==='drive-home'){
        const dur=item.endMins-item.startMins;
        const driveRouteInfo=getRouteInfo(item.from, item.to);
        const _kmInfo=driveRouteInfo&&driveRouteInfo.km?' · '+(driveRouteInfo.estimated?'≈':'')+driveRouteInfo.km+' km':'';
        const durStr=(dur>=60?(Math.floor(dur/60)+'t '+(dur%60?(dur%60)+'min':'')).trim():dur+' min')+_kmInfo;
        const mapsHref='https://www.google.com/maps/dir/'+encodeURIComponent((item.from||'')+', Norge')+'/'+encodeURIComponent((item.to||'')+', Norge');
        const fromLabel = item.from===homeBase ? '🏠 Hjem ('+(homeBase.split(',')[0])+')' : escapeHtml(item.from);
        const driveFerry=driveRouteInfo?driveRouteInfo.ferry:null;
        let ferryHtml='';
        if(driveFerry){
          ferryHtml='<div style="margin-top:6px;padding:6px 8px;background:#E6F1FB;border:1px solid #B8D4E8;border-radius:5px;font-size:11px;color:#0C447C;display:flex;align-items:center;gap:6px"><span style="font-size:14px">⛴</span><div style="flex:1"><strong>Ferje: '+escapeHtml(driveFerry.name)+'</strong> <span style="color:#5F5E5A">— '+escapeHtml(driveFerry.op)+'</span></div><a href="'+escapeHtml(driveFerry.url)+'" target="_blank" style="color:#0C447C;text-decoration:underline;font-weight:600">Tider ↗</a></div>';
        }
        html+='<div class="planner-stop" style="background:#FFF6E6;border:1px solid #E6D9B8;border-radius:8px;padding:8px 12px;margin:4px 0">'+
          '<div class="planner-stop-time" style="color:#6D4C00">'+hh+':'+mm+'</div>'+
          '<div class="planner-stop-icon">🚗</div>'+
          '<div class="planner-stop-body">'+
            '<div class="planner-stop-name" style="color:#2C2C2A">Avreise: '+fromLabel+' → '+escapeHtml(item.to)+' '+
            '<span style="background:#E6D9B8;color:#6D4C00;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+durStr+'</span></div>'+
            '<div class="planner-stop-meta" style="color:#6D4C00">'+hh+':'+mm+' – '+ehh+':'+emm+' · <a href="'+mapsHref+'" target="_blank" style="color:#1565C0;text-decoration:underline">Maps ↗</a></div>'+
            ((item.min||dur)>90?'<div style="margin-top:6px;padding:6px 8px;background:#FBE9E7;border:1px solid #E5B8B0;border-radius:5px;font-size:11px;color:#A23B27">⚠ Lang morgenkjøring ('+(Math.floor((item.min||dur)/60)+'t '+((item.min||dur)%60?(item.min||dur)%60+'min':'')).trim()+'). Vurder å kjøre kvelden før og overnatte i '+escapeHtml(item.to)+'.</div>':'')+
            ferryHtml+
          '</div></div>';
      } else if(item.kind==='drive-evening'){
        const dur=item.min||(item.endMins-item.startMins);
        const _evRoute=getRouteInfo(item.from, item.to);
        const _evKm=_evRoute&&_evRoute.km?' · '+(_evRoute.estimated?'≈':'')+_evRoute.km+' km':'';
        const durStr=(dur>=60?(Math.floor(dur/60)+'t '+(dur%60?(dur%60)+'min':'')).trim():dur+' min')+_evKm;
        const mapsHref='https://www.google.com/maps/dir/'+encodeURIComponent((item.from||'')+', Norge')+'/'+encodeURIComponent((item.to||'')+', Norge');
        let evFerryHtml='';
        const evFerry=_evRoute?_evRoute.ferry:null;
        if(evFerry){
          evFerryHtml='<div style="margin-top:6px;padding:6px 8px;background:#E6F1FB;border:1px solid #B8D4E8;border-radius:5px;font-size:11px;color:#0C447C">⛴ Ferje: '+escapeHtml(evFerry.name)+' — <a href="'+escapeHtml(evFerry.url)+'" target="_blank" style="color:#0C447C;text-decoration:underline">Tider ↗</a></div>';
        }
        html+='<div class="planner-stop" style="background:#EEE9F7;border:1px solid #C5B8E0;border-radius:8px;padding:8px 12px;margin:4px 0">'+
          '<div class="planner-stop-time" style="color:#4A2E8A">'+hh+':'+mm+'</div>'+
          '<div class="planner-stop-icon">🌙</div>'+
          '<div class="planner-stop-body">'+
            '<div class="planner-stop-name" style="color:#2C2C2A">Transportetappe: '+escapeHtml(item.from)+' → '+escapeHtml(item.to)+' '+
            '<span style="background:#D8CCEF;color:#4A2E8A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+durStr+'</span></div>'+
            '<div class="planner-stop-meta" style="color:#4A2E8A">'+hh+':'+mm+' – '+ehh+':'+emm+' · <a href="'+mapsHref+'" target="_blank" style="color:#1565C0;text-decoration:underline">Maps ↗</a></div>'+
            '<div style="margin-top:6px;padding:6px 8px;background:#FFF6E6;border:1px solid #E6D9B8;border-radius:5px;font-size:11px;color:#6D4C00">🏨 Overnatting i '+escapeHtml(item.to)+' — neste dag starter der.</div>'+
            evFerryHtml+
          '</div></div>';
      } else if(item.kind==='flight-return'){
        const f2=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
        const driveTxt = item.from && item.from!==item.to ? '🚗 Kjør '+escapeHtml(item.from)+' → '+escapeHtml(item.to)+' ('+item.driveMin+' min) · ' : '';
        const _retB = (window._lastTripMeta||{}).retBooked;
        html+='<div class="planner-stop" style="background:#E6F1FB;border:1px solid #B8D4E8;border-radius:8px;padding:8px 12px;margin:4px 0'+(_retB?'':';opacity:0.62')+'">'+
          '<div class="planner-stop-time" style="color:#0C447C">'+hh+':'+mm+'</div>'+
          '<div class="planner-stop-icon">✈</div>'+
          '<div class="planner-stop-body">'+
            '<div class="planner-stop-name" style="color:#2C2C2A"><span class="book-mark">'+(_retB?'✅':'❌')+'</span> Hjemreise: fly fra '+escapeHtml(item.to)+' kl. '+f2(item.retMins)+'</div>'+
            '<div class="planner-stop-meta" style="color:#0C447C">'+driveTxt+'Vær på flyplassen senest '+f2(item.retMins-45)+'</div>'+
          '</div>'+
          '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700;color:#0C447C"><input type="checkbox" '+(_retB?'checked':'')+' onchange="toggleRetBooked(this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label></div>';
      } else if(item.kind==='drive-home-return'){
        const dur=item.endMins-item.startMins;
        const _retRoute=getRouteInfo(item.from, item.to);
        const _retKm=_retRoute&&_retRoute.km?' · '+(_retRoute.estimated?'≈':'')+_retRoute.km+' km':'';
        const durStr=(dur>=60?(Math.floor(dur/60)+'t '+(dur%60?(dur%60)+'min':'')).trim():dur+' min')+_retKm;
        const mapsHref='https://www.google.com/maps/dir/'+encodeURIComponent((item.from||'')+', Norge')+'/'+encodeURIComponent((item.to||'')+', Norge');
        const toLabel = item.to===homeBase ? '🏠 Hjem ('+(homeBase.split(',')[0])+')' : escapeHtml(item.to);
        html+='<div class="planner-stop" style="background:#E8F4ED;border:1px solid #B8D4C2;border-radius:8px;padding:8px 12px;margin:4px 0">'+
          '<div class="planner-stop-time" style="color:#1A5C3A">'+hh+':'+mm+'</div>'+
          '<div class="planner-stop-icon">🏠</div>'+
          '<div class="planner-stop-body">'+
            '<div class="planner-stop-name" style="color:#2C2C2A">Hjemtur: '+escapeHtml(item.from)+' → '+toLabel+' '+
            '<span style="background:#C8E6D5;color:#1A5C3A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+durStr+'</span></div>'+
            '<div class="planner-stop-meta" style="color:#1A5C3A">'+hh+':'+mm+' – '+ehh+':'+emm+' · <a href="'+mapsHref+'" target="_blank" style="color:#1565C0;text-decoration:underline">Maps ↗</a></div>'+
          '</div></div>';
      } else if(item.kind==='adm'){
        const dur=item.endMins-item.startMins;
        const durStr=dur>=60?(Math.floor(dur/60)+'t '+(dur%60?(dur%60)+'min':'').trim()):dur+' min';
        html+='<div class="planner-stop" style="background:#F1EFE8;border-radius:8px;padding:6px 10px;margin:4px 0;opacity:0.92"><div class="planner-stop-time" style="color:#5F5E5A">'+hh+':'+mm+'</div><div class="planner-stop-icon">💻</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#2C2C2A">Adm. / forberedelse <span style="font-size:10px;background:#D3D1C7;color:#5F5E5A;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+durStr.trim()+'</span></div><div class="planner-stop-meta" style="color:#888780">'+hh+':'+mm+' – '+ehh+':'+emm+' · e-post, ordre, rapportering, samtaler</div></div></div>';
      } else if(item.kind==='fixed'){
        html+='<div class="planner-stop" style="background:#E6F1FB;border-radius:8px;padding:6px 10px;margin:4px 0"><div class="planner-stop-time" style="color:#0C447C">'+hh+':'+mm+'</div><div class="planner-stop-icon">🔒</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#0A4A7A">'+item.appt.label+' <span style="font-size:10px;background:#1976D2;color:#fff;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">Fast avtale</span></div><div class="planner-stop-meta" style="color:#0C447C">'+hh+':'+mm+' – '+ehh+':'+emm+'</div></div></div>';
        const fc=getCustomers().find(c=>c.name===item.appt.label);
        if(fc) prevCity=fc.city||prevCity;
      } else {
        const c=item.customer;
        const driveMin=c._drive||0;
        // Sjekk om dette er dagens første besøk — hvis kjøringen fra hjem allerede er vist
        // som en drive-home-blokk, skal vi ikke vise den igjen.
        const driveHomeAlreadyShown = day.timeline.some(x=>x.kind==='drive-home');
        const isFirstVisitOfDay = day.timeline.filter(x=>x.kind==='visit')[0] === item;
        const showFullDrive = driveMin>=15 && !(isFirstVisitOfDay && driveHomeAlreadyShown);
        if(showFullDrive){
          const routeInfo=getRouteInfo(prevCity, c.city||area);
          const ferry=routeInfo?routeInfo.ferry:null;
          let ferryHtml='';
          if(ferry){
            ferryHtml='<div style="margin-top:6px;padding:6px 8px;background:#E6F1FB;border:1px solid #B8D4E8;border-radius:5px;font-size:11px;color:#0C447C;display:flex;align-items:center;gap:6px"><span style="font-size:14px">⛴</span><div style="flex:1"><strong>Ferje: '+escapeHtml(ferry.name)+'</strong> <span style="color:#5F5E5A">— '+escapeHtml(ferry.op)+'</span></div><a href="'+escapeHtml(ferry.url)+'" target="_blank" style="color:#0C447C;text-decoration:underline;font-weight:600">Tider ↗</a></div>';
          }
          const calls=callsByCustomer[c.name]||[];
          let callsHtml='';
          if(calls.length>0){
            callsHtml='<div style="margin-top:6px;padding-top:6px;border-top:1px solid #E6D9B8"><div style="font-size:10px;font-weight:700;color:#6D4C00;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">📞 Ringeforslag ('+calls.length+' kunder · '+driveMin+' min)</div>';
            calls.forEach(cc=>{
              const contact=(cc.contacts&&cc.contacts[0])?cc.contacts[0]:null;
              const phone=cc.phone||(contact?contact.phone:'')||'';
              const contactName=contact?contact.name:(cc.phone?'Direkte':'');
              callsHtml+='<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;color:#2C2C2A;gap:6px"><span style="flex:1;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+cc.name+'</span><span style="color:#888780;font-size:10px;flex-shrink:0">'+contactName+'</span>'+(phone?'<a href="tel:'+phone+'" style="color:#0C447C;font-weight:600;text-decoration:none;flex-shrink:0">'+phone+'</a>':'')+'</div>';
            });
            callsHtml+='</div>';
          }
          // Formatér tid + distanse fra routeInfo (samme strekning som driveMin er beregnet fra)
          const _dh=Math.floor(driveMin/60), _dm=driveMin%60;
          const timeStr=_dh>0?(_dh+'t'+(_dm>0?' '+_dm+'min':'')):(_dm+' min');
          const kmStr=routeInfo&&routeInfo.km?(routeInfo.estimated?'≈':'')+routeInfo.km+' km':'';
          const distLabel=timeStr+(kmStr?' · '+kmStr:'');
          html+='<div class="planner-drive">🚗 Kjøring · '+distLabel+' <a href="'+mapsLink((prevCity+', Norge'),((c.city||area)+', Norge'))+'" target="_blank" style="color:#1565C0;text-decoration:underline;margin-left:4px">Maps ↗</a>'+ferryHtml+callsHtml+'</div>';
        } else if(driveMin>0){
          const _ri=getRouteInfo(prevCity, c.city||area);
          const _kmS=_ri&&_ri.km?' · '+(_ri.estimated?'≈':'')+_ri.km+' km':'';
          html+='<div class="planner-drive" style="background:#F8F7F3;color:#888780">🚗 '+driveMin+' min'+_kmS+'</div>';
        }
        const badge=c.isPrio?'<span style="background:#D1EAF8;color:#0A4A7A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600">Prioritert</span>':'';
        const durBadge='<span style="background:#F1EFE8;color:#5F5E5A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+c._duration+' min</span>';
        const custIndex = day.customers.indexOf(c);
        html+='<div class="planner-stop editable-stop" draggable="true" data-day="'+dayIdx+'" data-cust="'+custIndex+'" ondragstart="plannerDragStart(event,'+dayIdx+','+custIndex+')" ondragover="plannerDragOver(event)" ondrop="plannerDrop(event,'+dayIdx+','+custIndex+')" ondragend="plannerDragEnd(event)" style="cursor:grab;position:relative'+(c.appointed===true?'':';opacity:0.62')+'">'+
          '<div class="planner-stop-time">'+hh+':'+mm+'</div>'+
          '<div class="planner-stop-icon" style="cursor:grab" title="Dra for å endre rekkefølge">⠿</div>'+
          '<div class="planner-stop-body"><div class="planner-stop-name">'+c.name+' '+badge+durBadge+'</div><div class="planner-stop-meta">'+( c.city||'')+' · L12: '+nok(c.l12)+'</div><div class="planner-stop-meta" style="color:#888780">'+hh+':'+mm+' – '+ehh+':'+emm+'</div></div>'+
          '<button onclick="toggleVisitAppointed('+dayIdx+','+custIndex+')" style="background:'+(c.appointed===true?'#1A5C3A':'#FFF6E6')+';color:'+(c.appointed===true?'#fff':'#6D4C00')+';border:1px solid '+(c.appointed===true?'#1A5C3A':'#E6D9B8')+';border-radius:12px;font-size:10px;font-weight:700;cursor:pointer;padding:3px 8px;flex-shrink:0;white-space:nowrap" title="Trykk for å endre avtalestatus">'+(c.appointed===true?'✓ Avtalt':'Uanmeldt')+'</button>'+
          '<button onclick="plannerRemoveStop('+dayIdx+','+custIndex+')" style="background:none;border:none;color:#A23B27;font-size:18px;cursor:pointer;padding:0 6px;flex-shrink:0" title="Fjern besøk">×</button>'+
          '</div>';
        prevCity=c.city||area;
      }
    });
    // Legg til-knapp per dag
    html+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button onclick="plannerAddStopPrompt('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#F1EFE8;border:1px dashed #888780;border-radius:8px;color:#5F5E5A;font-size:12px;font-weight:600;cursor:pointer">+ Kunde</button><button onclick="addFlightLegPrompt('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#E6F1FB;border:1px dashed #0C447C;border-radius:8px;color:#0C447C;font-size:12px;font-weight:600;cursor:pointer">✈ Flyetappe</button><button onclick="showTimeBlockModal('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#F1EFE8;border:1px dashed #5F5E5A;border-radius:8px;color:#5F5E5A;font-size:12px;font-weight:600;cursor:pointer">🕐 Legg til tid</button></div>';
    html+=dayHotelRowHtml(day, dayIdx, days);
    if(day.customers.length===0 && day.fixedCount===0){
      html+='<div style="color:#888780;font-size:13px;padding:14px;background:#F8F7F3;border-radius:8px;text-align:center;border:1px dashed #D3D1C7">Ingen kunder igjen i kundepoolen for denne dagen.<br><span style="font-size:11px">Velg færre dager, eller utvid området.</span></div>';
    }
    if(!day.skippedReason && day.customers.length>0){
      html+='<div id="plan-map-'+dayIdx+'" class="planner-day-map"></div>';
    }
    html+='</div>';
  });
  window._lastPlan=days;
  window._lastTripMeta=tripMeta;
  window._lastHomeBase=homeBase;
  html+='<div style="font-size:11px;color:#888780;margin:8px 0;text-align:center;font-style:italic">💡 Dra i ⠿ for å endre rekkefølge · × for å fjerne · knappen for å legge til</div>';
  html+='<button class="btn btn-dark planner-add-btn" onclick="plannerAddToCalendar(window._lastPlan)" style="width:100%;margin-top:8px">📅 Legg inn i kalender</button>';
  html+='</div>';
  if(typeof _destroyDayMaps==='function') _destroyDayMaps();
  output.innerHTML=html;
  setTimeout(()=>{ if(typeof initPlannerDayMaps==='function') initPlannerDayMaps(window._lastPlan,window._lastHomeBase,window._lastTripMeta); },0);
}

// ─── HOTELL PER DAG I PLANEN ────────────────────────────────────────────────

// Bygg hotellvelger-rad for en plandag. Viser forslag fra HOTELS_BY_CITY
// sortert etter brukerens foretrukne kjeder (★ = preferert kjede).
function dayHotelRowHtml(day, dayIdx, daysArr){
  if(!day || day.skippedReason) return '';
  if(day.returnHome) return ''; // hjemtur — ingen overnatting
  const days = daysArr || window._lastPlan || [];
  // Siste dag: man reiser normalt hjem — ingen hotellrad som default
  if(days.length>0 && dayIdx>=days.length-1) return '';
  if((day.timeline||[]).some(x=>x.kind==='flight-return')) return '';
  const sleepCity = day.eveningTransfer ? day.eveningTransfer.to : day.sleepCity;
  // Neste dags første by — relevant for å ligge i forkant
  let nextCity = null;
  const nd = days[dayIdx+1];
  if(nd && !nd.skippedReason){
    nextCity = (nd.customers && nd.customers[0] && nd.customers[0].city) || nd.startCity || null;
  }
  const sel = day.hotel ? day.hotel.name : '';
  const selCity = day.hotel ? (day.hotel.city||'') : '';
  // Bygg options: hoteller i overnattingsbyen + (hvis ulik) neste dags by
  function cityOpts(city, label){
    const sugg = suggestHotels(city);
    if(sugg.length===0 && !label) return '';
    let o = '<optgroup label="'+escapeHtml(label||('Hoteller i '+city))+'">';
    sugg.forEach(h=>{
      const val = h.name+'||'+city;
      o += '<option value="'+escapeHtml(val)+'"'+(sel===h.name&&selCity===city?' selected':'')+'>'+(h.preferred?'★ ':'')+escapeHtml(h.name)+'</option>';
    });
    o += '</optgroup>';
    return o;
  }
  // Hjemme-natt: tilby likevel hotell i neste dags by (ligge i forkant)
  if(day.sleepAtHome && !day.eveningTransfer && !sel){
    if(!nextCity) {
      return '<div id="day-hotel-row-'+dayIdx+'" style="margin-top:6px;padding:8px 12px;background:#F1F7F3;border:1px solid #C8E0CF;border-radius:8px;font-size:12px;color:#1A5C3A">🏠 Overnatting: hjemme</div>';
    }
    let opts = '<option value="">🏠 Hjemme (standard)</option>';
    opts += cityOpts(nextCity, 'Ligg i forkant — hoteller i '+nextCity);
    opts += '<option value="__custom">Annet (skriv selv) ...</option>';
    return '<div id="day-hotel-row-'+dayIdx+'" style="margin-top:6px;padding:8px 12px;background:#F1F7F3;border:1px solid #C8E0CF;border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
      '<span style="font-size:12px;color:#1A5C3A;font-weight:600;flex-shrink:0">🏠 Overnatting:</span>'+
      '<select onchange="setDayHotel('+dayIdx+',this.value)" style="flex:1;min-width:170px;padding:7px 9px;border:1px solid #C8E0CF;border-radius:7px;font-size:12px;background:#fff">'+opts+'</select>'+
      '</div>';
  }
  const baseCity = sleepCity || nextCity;
  if(!baseCity && !sel) return '';
  let opts = '<option value="">Velg hotell ...</option>';
  if(sleepCity) opts += cityOpts(sleepCity);
  if(nextCity && nextCity!==sleepCity) opts += cityOpts(nextCity, 'Ligg i forkant — hoteller i '+nextCity);
  if(sel){
    const selVal = sel+'||'+selCity;
    // Hvis valgt hotell ikke er blant forslagene, vis det som eget valg
    if(opts.indexOf('value="'+escapeHtml(selVal)+'"')===-1){
      opts += '<option value="'+escapeHtml(selVal)+'" selected>'+escapeHtml(sel)+(selCity?' ('+escapeHtml(selCity)+')':'')+'</option>';
    }
  }
  opts += '<option value="__custom">Annet (skriv selv) ...</option>';
  const mapsLink2 = sel ? ' <a href="https://www.google.com/maps/search/'+encodeURIComponent(sel+', '+(selCity||baseCity||'')+', Norge')+'" target="_blank" style="color:#1565C0;text-decoration:underline;font-size:11px;flex-shrink:0">Maps ↗</a>' : '';
  const hb = day.hotel && day.hotel.booked;
  const bookChk = sel ? '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700;color:#6D4C00"><input type="checkbox" '+(hb?'checked':'')+' onchange="toggleDayHotelBooked('+dayIdx+',this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label>' : '';
  return '<div id="day-hotel-row-'+dayIdx+'" style="margin-top:6px;padding:8px 12px;background:#FFF6E6;border:1px solid #E6D9B8;border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap'+(sel&&!hb?';opacity:0.62':'')+'">'+
    '<span style="font-size:12px;color:#6D4C00;font-weight:600;flex-shrink:0">'+(sel?'<span class="book-mark">'+(hb?'✅':'❌')+'</span> ':'')+'🏨 Overnatting:</span>'+
    '<select onchange="setDayHotel('+dayIdx+',this.value)" style="flex:1;min-width:170px;padding:7px 9px;border:1px solid #D3D1C7;border-radius:7px;font-size:12px;background:#fff">'+opts+'</select>'+
    mapsLink2+bookChk+
    '</div>';
}

function setDayHotel(dayIdx, value){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const day = days[dayIdx];
  const sleepCity = day.eveningTransfer ? day.eveningTransfer.to : day.sleepCity;
  let name='', city='';
  if(value==='__custom'){
    name = (prompt('Hotellnavn:','')||'').trim();
    if(name){
      city = (prompt('Hvilken by ligger hotellet i?', sleepCity||'')||'').trim();
    }
  } else if(value){
    const parts = value.split('||');
    name = parts[0]; city = parts[1]||sleepCity||'';
  }
  // 1) Rydd opp tidligere hotellgenerert kveldsetappe og neste-dags-endring
  day.timeline = (day.timeline||[]).filter(x=>!(x.kind==='drive-evening' && x.byHotel));
  if(day._hotelSetEveningTransfer){ day.eveningTransfer = null; day._hotelSetEveningTransfer = false; }
  if(day._hotelPrevSleepAtHome!==undefined){ day.sleepAtHome = day._hotelPrevSleepAtHome; delete day._hotelPrevSleepAtHome; }
  const nd = days[dayIdx+1];
  if(day._hotelPrevNextStart!==undefined && nd){
    nd.startCity = day._hotelPrevNextStart;
    delete day._hotelPrevNextStart;
    if(typeof recomputeDayTimes==='function') recomputeDayTimes(nd);
  }
  // 2) Sett hotellet
  day.hotel = name ? {name:name, city:city} : null;
  // 3) Hotell i annen by enn dagens slutt? Legg automatisk kveldsetappe dit.
  if(name && city){
    const lastV = day.customers && day.customers.length>0 ? day.customers[day.customers.length-1] : null;
    const endCity = (lastV && lastV.city) || day.startCity || '';
    const alreadyThere = day.eveningTransfer && day.eveningTransfer.to===city;
    if(endCity && city!==endCity && !alreadyThere){
      const evDrive = getDriveMin(endCity, city);
      if(evDrive>0){
        const evStart = lastV ? lastV._end : (17*60);
        day.timeline = day.timeline||[];
        day.timeline.push({kind:'drive-evening', byHotel:true, startMins:evStart, endMins:evStart+evDrive, from:endCity, to:city, min:evDrive});
        day.timeline.sort((a,b)=>a.startMins-b.startMins);
        if(!day.eveningTransfer){ day.eveningTransfer = {from:endCity, to:city, min:evDrive}; day._hotelSetEveningTransfer = true; }
        if(day.sleepAtHome){ day._hotelPrevSleepAtHome = day.sleepAtHome; day.sleepAtHome = false; }
        // Neste dag starter fra hotellbyen
        if(nd && !nd.skippedReason && nd.startCity!==city){
          day._hotelPrevNextStart = nd.startCity;
          nd.startCity = city;
          if(typeof recomputeDayTimes==='function') recomputeDayTimes(nd);
        }
        showToast('🚗 Kveldsetappe '+endCity+' → '+city+' lagt til ('+evDrive+' min)');
      }
    }
  }
  // 4) Re-render hele planen så etappen og neste dags tider vises
  if(typeof renderPlanFromData==='function' && window._lastPlan){
    renderPlanFromData(days);
  } else {
    const row = document.getElementById('day-hotel-row-'+dayIdx);
    if(row) row.outerHTML = dayHotelRowHtml(day, dayIdx, days);
  }
}

// ─── REDIGERING AV RUTEFORSLAG ──────────────────────────────────────────────



// Globale versjoner av tidsberegnings-hjelpere (for re-beregning etter redigering)
function _gVisitDuration(c){
  if(c.l12>=200000) return 120;
  if(c.l12>=100000) return 90;
  return 60;
}
function _gOpeningTimeMin(c, weekday){
  if(c.opening){
    const m=c.opening.match(/^(\d{1,2}):(\d{2})$/);
    if(m) return parseInt(m[1])*60+parseInt(m[2]);
  }
  if(weekday===6) return 10*60;
  if(weekday===0) return 12*60;
  const name=(c.name||'').toUpperCase();
  const chain=(c.chain||'').toUpperCase();
  if(name.includes('B2B')||name.includes('PRO')||chain.includes('B2B')) return 8*60;
  return 10*60;
}

// Re-beregn start/slutt-tider for alle besøk på en dag etter redigering
function recomputeDayTimes(day){
  const dayStartMin = 8*60;
  const weekday = day.date.getDay();
  let cursor = dayStartMin;
  let prevCity = day.startCity || '';
  // Faste hindringer: flyetapper (med byskifte) og tidsblokker (adm/lunsj/møter osv.).
  // Besøk som kolliderer skyves til etter hindringen.
  const legs = (day.flightLegs||[]).slice().sort((a,b)=>a.depMins-b.depMins);
  const blocks = (day.timeBlocks||[]).slice().sort((a,b)=>a.startMins-b.startMins);
  const obstacles = [];
  legs.forEach(L=>obstacles.push({s:L.depMins-30, e:L.arrMins+20, arrCity:L.arrCity}));
  blocks.forEach(b=>obstacles.push({s:b.startMins, e:b.endMins}));
  obstacles.sort((a,b)=>a.s-b.s);
  let oIdx = 0;
  day.customers.forEach((c)=>{
    const dur = _gVisitDuration(c);
    let placedOk = false;
    let guard = 0;
    while(!placedOk && guard<40){
      guard++;
      // Konsumér hindringer vi allerede har passert (fly bytter by)
      while(oIdx<obstacles.length && obstacles[oIdx].e<=cursor){
        if(obstacles[oIdx].arrCity) prevCity = obstacles[oIdx].arrCity;
        oIdx++;
      }
      const drive = prevCity ? getDriveMin(prevCity, c.city||'') : 0;
      const openMin = _gOpeningTimeMin(c, weekday);
      let t = Math.ceil(Math.max(cursor + drive, openMin)/30)*30;
      // Kolliderer besøket med neste hindring?
      if(oIdx<obstacles.length && t+dur > obstacles[oIdx].s && t < obstacles[oIdx].e){
        cursor = obstacles[oIdx].e;
        if(obstacles[oIdx].arrCity) prevCity = obstacles[oIdx].arrCity;
        oIdx++;
        continue;
      }
      // Hoppet helt forbi en hindring (sen åpningstid e.l.)? Konsumér den og prøv igjen.
      if(oIdx<obstacles.length && t >= obstacles[oIdx].e){
        if(obstacles[oIdx].arrCity) prevCity = obstacles[oIdx].arrCity;
        oIdx++;
        continue;
      }
      c._drive = drive;
      c._duration = dur;
      c._start = t;
      c._end = t + dur;
      c.isPrio = c.l12>=150000;
      cursor = t + dur;
      prevCity = c.city || prevCity;
      placedOk = true;
    }
  });
  // Oppdater drive-home timeline-element hvis det finnes
  if(day.timeline){
    day.timeline = day.timeline.filter(x=>x.kind!=='drive-home' && x.kind!=='drive-home-return' && x.kind!=='adm' && x.kind!=='flight-leg' && x.kind!=='time-block');
  } else {
    day.timeline = [];
  }
  // Flyetapper og tidsblokker inn i timeline
  legs.forEach(L=>{
    day.timeline.push({kind:'flight-leg', id:L.id, startMins:L.depMins, endMins:L.arrMins, from:L.depCity, to:L.arrCity, booked:!!L.booked});
  });
  blocks.forEach(b=>{
    day.timeline.push({kind:'time-block', id:b.id, startMins:b.startMins, endMins:b.endMins, type:b.type, label:b.label});
  });
  // Gjenskap drive-home (morgenkjøring) hvis dagen starter fra et sted og første kunde har kjøretid
  if(day.startCity && day.customers.length>0){
    const firstC = day.customers[0];
    if(firstC._drive>0 && firstC.city && firstC.city!==day.startCity){
      const driveStart = Math.max(8*60, firstC._start - firstC._drive);
      day.timeline.push({kind:'drive-home', startMins:driveStart, endMins:firstC._start, from:day.startCity, to:firstC.city, min:firstC._drive});
    }
  }
  day.timeline.sort((a,b)=>a.startMins-b.startMins);
  day.zones = [...new Set(day.customers.map(c=>c.city).filter(Boolean))];
}

// Legg til flyetappe på en dag (mellom kundebesøk)
function addFlightLegPrompt(dayIdx){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const day = days[dayIdx];
  const dep = (prompt('Flyetappe — FRA by (avreise):', day.zones&&day.zones[0]?day.zones[0]:'')||'').trim();
  if(!dep) return;
  const arr = (prompt('TIL by (ankomst):','')||'').trim();
  if(!arr) return;
  const depT = (prompt('Avgangstid (HH:MM):','09:00')||'').trim();
  const arrT = (prompt('Ankomsttid (HH:MM):','10:00')||'').trim();
  const pm = s=>{ const m=s.match(/^(\d{1,2}):(\d{2})$/); return m?parseInt(m[1])*60+parseInt(m[2]):null; };
  const depMins = pm(depT), arrMins = pm(arrT);
  if(depMins===null || arrMins===null || arrMins<=depMins){ showToast('Ugyldig tid — bruk HH:MM, ankomst etter avgang'); return; }
  day.flightLegs = day.flightLegs || [];
  day.flightLegs.push({id:Date.now(), depCity:dep, arrCity:arr, depMins:depMins, arrMins:arrMins});
  recomputeDayTimes(day);
  renderPlanFromData(days);
  showToast('✈ '+dep+' → '+arr+' lagt til — tider rekalkulert');
}

function removeFlightLeg(dayIdx, legId){
  const days = window._lastPlan;
  if(!days || !days[dayIdx] || !days[dayIdx].flightLegs) return;
  days[dayIdx].flightLegs = days[dayIdx].flightLegs.filter(l=>l.id!==legId);
  recomputeDayTimes(days[dayIdx]);
  renderPlanFromData(days);
}


function showTimeBlockModal(dayIdx){
  const existing = document.getElementById('time-block-modal');
  if(existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'time-block-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.onclick = (e)=>{ if(e.target===modal) modal.remove(); };
  let typeBtns = '';
  TIME_BLOCK_TYPES.forEach((t,i)=>{
    typeBtns += '<button type="button" class="tb-type-btn" data-key="'+t.key+'" data-label="'+escapeHtml(t.label)+'" onclick="document.querySelectorAll(\'.tb-type-btn\').forEach(b=>b.style.background=\'#F1EFE8\');document.querySelectorAll(\'.tb-type-btn\').forEach(b=>b.style.color=\'#5F5E5A\');this.style.background=\'#2C2C2A\';this.style.color=\'#fff\';document.getElementById(\'tb-selected-type\').value=this.dataset.key+\'|\'+this.dataset.label" style="padding:8px 12px;border-radius:16px;border:1px solid #D3D1C7;background:#F1EFE8;color:#5F5E5A;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">'+t.emoji+' '+escapeHtml(t.label)+'</button>';
  });
  modal.innerHTML = '<div style="background:#fff;border-radius:14px;width:460px;max-width:100%;padding:16px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-size:15px;font-weight:700">🕐 Legg til tid</div><button onclick="document.getElementById(\'time-block-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888780">×</button></div>'+
    '<input type="hidden" id="tb-selected-type" value="">'+
    '<div style="font-size:11px;font-weight:600;color:#5F5E5A;margin-bottom:6px">Type</div>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'+typeBtns+'</div>'+
    '<div style="display:flex;gap:8px;margin-bottom:14px">'+
      '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#5F5E5A;margin-bottom:4px">Starttid</div><input type="time" id="tb-start" value="12:00" style="width:100%;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px"></div>'+
      '<div style="flex:1"><div style="font-size:11px;font-weight:600;color:#5F5E5A;margin-bottom:4px">Varighet</div><select id="tb-dur" style="width:100%;padding:8px 10px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;background:#fff"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="45">45 min</option><option value="60">1 time</option><option value="90">1,5 time</option><option value="120">2 timer</option></select></div>'+
    '</div>'+
    '<button class="btn btn-dark" style="width:100%" onclick="confirmTimeBlock('+dayIdx+')">Legg til</button>'+
    '</div>';
  document.body.appendChild(modal);
}

function confirmTimeBlock(dayIdx){
  const typeVal = (document.getElementById('tb-selected-type')||{}).value||'';
  if(!typeVal){ showToast('Velg type først'); return; }
  const [key,label] = typeVal.split('|');
  const startT = (document.getElementById('tb-start')||{}).value||'';
  const dur = parseInt((document.getElementById('tb-dur')||{}).value)||30;
  const mm = startT.match(/^(\d{1,2}):(\d{2})$/);
  if(!mm){ showToast('Ugyldig starttid'); return; }
  const startMins = parseInt(mm[1])*60+parseInt(mm[2]);
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const day = days[dayIdx];
  day.timeBlocks = day.timeBlocks || [];
  day.timeBlocks.push({id:Date.now(), type:key, label:label, startMins:startMins, endMins:startMins+dur});
  const modal = document.getElementById('time-block-modal');
  if(modal) modal.remove();
  recomputeDayTimes(day);
  renderPlanFromData(days);
  showToast('🕐 '+label+' lagt til — tider rekalkulert');
}

function removeTimeBlock(dayIdx, blockId){
  const days = window._lastPlan;
  if(!days || !days[dayIdx] || !days[dayIdx].timeBlocks) return;
  days[dayIdx].timeBlocks = days[dayIdx].timeBlocks.filter(b=>b.id!==blockId);
  recomputeDayTimes(days[dayIdx]);
  renderPlanFromData(days);
}

let _dragData = null;
function plannerDragStart(ev, dayIdx, custIdx){
  _dragData = {dayIdx, custIdx};
  ev.dataTransfer.effectAllowed = 'move';
  try{ ev.dataTransfer.setData('text/plain', dayIdx+':'+custIdx); }catch(e){}
  ev.currentTarget.style.opacity = '0.4';
}
function plannerDragOver(ev){
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';
  ev.currentTarget.style.borderTop = '2px solid #0C447C';
}
function plannerDragEnd(ev){
  ev.currentTarget.style.opacity = '1';
  document.querySelectorAll('.editable-stop').forEach(el=>el.style.borderTop='');
}
function plannerDrop(ev, dayIdx, targetIdx){
  ev.preventDefault();
  ev.currentTarget.style.borderTop = '';
  if(!_dragData) return;
  const src = _dragData;
  _dragData = null;
  const days = window._lastPlan;
  if(!days) return;
  // Hent kunden som dras
  const srcDay = days[src.dayIdx];
  const tgtDay = days[dayIdx];
  if(!srcDay || !tgtDay) return;
  const moved = srcDay.customers[src.custIdx];
  if(!moved) return;
  // Fjern fra kilde
  srcDay.customers.splice(src.custIdx, 1);
  // Sett inn ved target (juster indeks hvis samme dag og target var etter kilde)
  let insertAt = targetIdx;
  if(src.dayIdx===dayIdx && src.custIdx < targetIdx) insertAt = targetIdx; // allerede forskjøvet etter splice
  tgtDay.customers.splice(insertAt, 0, moved);
  // Re-beregn tider på begge dager
  recomputeDayTimes(srcDay);
  if(tgtDay!==srcDay) recomputeDayTimes(tgtDay);
  renderPlanFromData(days);
}

// Toggle bestilt-status på reiseelementer (fly/hotell/leiebil) i planvisningen.
// Oppdaterer DOM-stilen direkte (re-render ville nullstilt redigeringer).
function toggleTripBooked(field, el){
  if(!window._lastTripMeta) window._lastTripMeta = {};
  window._lastTripMeta[field] = el.checked;
  const box = el.closest('div[style]');
  // Finn ytterste reiseboks (den med margin:4px 0)
  let p = el.parentElement;
  while(p && !(p.getAttribute('style')||'').includes('margin:4px 0')) p = p.parentElement;
  if(p) p.style.opacity = el.checked ? '1' : '0.62';
  if(p){ const mk=p.querySelector('.book-mark'); if(mk) mk.textContent = el.checked?'✅':'❌'; }
}

// Toggle bestilt på en flyetappe
function toggleLegBooked(dayIdx, legId, el){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const leg = (days[dayIdx].flightLegs||[]).find(l=>l.id===legId);
  if(leg) leg.booked = el.checked;
  const item = (days[dayIdx].timeline||[]).find(x=>x.kind==='flight-leg'&&x.id===legId);
  if(item) item.booked = el.checked;
  let p = el.parentElement;
  while(p && !p.classList.contains('planner-stop')) p = p.parentElement;
  if(p) p.style.opacity = el.checked ? '1' : '0.62';
  if(p){ const mk=p.querySelector('.book-mark'); if(mk) mk.textContent = el.checked?'✅':'❌'; }
}

// Toggle bestilt på dagens hotell
function toggleDayHotelBooked(dayIdx, el){
  const days = window._lastPlan;
  if(!days || !days[dayIdx] || !days[dayIdx].hotel) return;
  days[dayIdx].hotel.booked = el.checked;
  const row = document.getElementById('day-hotel-row-'+dayIdx);
  if(row) row.style.opacity = el.checked ? '1' : '0.62';
  if(row){ const mk=row.querySelector('.book-mark'); if(mk) mk.textContent = el.checked?'✅':'❌'; }
}

// Toggle bestilt på hjemreise-flyet
function toggleRetBooked(el){
  if(!window._lastTripMeta) window._lastTripMeta = {};
  window._lastTripMeta.retBooked = el.checked;
  let p = el.parentElement;
  while(p && !p.classList.contains('planner-stop')) p = p.parentElement;
  if(p) p.style.opacity = el.checked ? '1' : '0.62';
  if(p){ const mk=p.querySelector('.book-mark'); if(mk) mk.textContent = el.checked?'✅':'❌'; }
}

// Toggle avtalt/uanmeldt på et besøk i planen
function toggleVisitAppointed(dayIdx, custIdx){
  const days = window._lastPlan;
  if(!days || !days[dayIdx] || !days[dayIdx].customers[custIdx]) return;
  const c = days[dayIdx].customers[custIdx];
  c.appointed = c.appointed===true ? false : true;
  renderPlanFromData(days);
}

function plannerRemoveStop(dayIdx, custIdx){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  days[dayIdx].customers.splice(custIdx, 1);
  recomputeDayTimes(days[dayIdx]);
  renderPlanFromData(days);
}

function plannerAddStopPrompt(dayIdx){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  // Bygg en liste over kunder som ikke allerede er i planen
  const inPlan = new Set();
  days.forEach(d=>d.customers.forEach(c=>inPlan.add(c.name)));
  const available = getCustomers().filter(c=>!inPlan.has(c.name)).sort((a,b)=>(b.l12||0)-(a.l12||0));
  if(available.length===0){ showToast('Alle kunder er allerede i planen'); return; }
  // Vis søkbar modal
  showAddStopModal(dayIdx, available);
}

function showAddStopModal(dayIdx, available){
  const existing = document.getElementById('add-stop-modal');
  if(existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'add-stop-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.onclick = (e)=>{ if(e.target===modal) modal.remove(); };
  const rows = available.slice(0,200).map(c=>{
    const safeName = (c.name||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return '<div class="add-stop-row" data-name="'+escapeHtml(c.name)+'" onclick="plannerConfirmAddStop('+dayIdx+',\''+safeName+'\')" style="padding:10px 12px;border-bottom:1px solid #F1EFE8;cursor:pointer;display:flex;justify-content:space-between;gap:8px">'+
      '<div style="min-width:0"><div style="font-weight:600;font-size:13px;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(c.name)+'</div><div style="font-size:11px;color:#888780">'+escapeHtml(c.city||'')+' · '+escapeHtml(c.chain||'')+'</div></div>'+
      '<div style="flex-shrink:0;font-size:11px;color:#5F5E5A">'+(c.class||'')+' · '+(c.l12?Math.round(c.l12/1000)+'k':'–')+'</div>'+
      '</div>';
  }).join('');
  modal.innerHTML = '<div style="background:#fff;border-radius:14px;width:520px;max-width:100%;max-height:80vh;display:flex;flex-direction:column">'+
    '<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:center"><div style="font-size:15px;font-weight:700">Legg til kunde</div><button onclick="document.getElementById(\'add-stop-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888780">×</button></div>'+
    '<div style="padding:10px 16px;border-bottom:1px solid #F1EFE8"><input type="text" id="add-stop-search" placeholder="Søk på navn, by, kjede ..." oninput="filterAddStop()" style="width:100%;padding:9px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px"></div>'+
    '<div id="add-stop-list" style="overflow-y:auto;flex:1">'+rows+'</div></div>';
  document.body.appendChild(modal);
  setTimeout(()=>{ const s=document.getElementById('add-stop-search'); if(s) s.focus(); },50);
}

function filterAddStop(){
  const q = (document.getElementById('add-stop-search').value||'').toLowerCase();
  document.querySelectorAll('#add-stop-list .add-stop-row').forEach(row=>{
    const name = (row.dataset.name||'').toLowerCase();
    const text = row.textContent.toLowerCase();
    row.style.display = (text.includes(q)) ? 'flex' : 'none';
  });
}

function plannerConfirmAddStop(dayIdx, name){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const cust = getCustomers().find(c=>c.name===name);
  if(!cust) return;
  days[dayIdx].customers.push(Object.assign({}, cust));
  recomputeDayTimes(days[dayIdx]);
  const modal = document.getElementById('add-stop-modal');
  if(modal) modal.remove();
  renderPlanFromData(days);
  showToast(name + ' lagt til');
}

// Sett inn en kunde på en bestemt plass i dagen (bruker splice-mønsteret fra drag-drop).
// insertAt=0 → øverst, insertAt=day.customers.length → sist.
function plannerInsertStop(dayIdx, insertAt, cust){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const day = days[dayIdx];
  day.customers.splice(insertAt, 0, Object.assign({}, cust));
  recomputeDayTimes(day);
  const modal = document.getElementById('insert-pos-modal');
  if(modal) modal.remove();
  renderPlanFromData(days);
  showToast(cust.name + ' lagt til som stopp ' + (insertAt + 1));
}

// Vis posisjonvelger: bruker velger plass i rekkefølgen, som kaller plannerInsertStop.
// Kalles fra kartpopup (BOLK 2) og kan testes fra konsollen: showInsertPositionPicker(0, cust)
function showInsertPositionPicker(dayIdx, cust){
  const days = window._lastPlan;
  if(!days || !days[dayIdx]) return;
  const day = days[dayIdx];
  // Ingen kunder ennå: sett inn direkte uten picker
  if(day.customers.length === 0){ plannerInsertStop(dayIdx, 0, cust); return; }
  // Lagre cust midlertidig for onclick-strenger i HTML
  window._insertPickerCust = cust;
  const existing = document.getElementById('insert-pos-modal');
  if(existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'insert-pos-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.onclick = e => { if(e.target===modal) modal.remove(); };
  const ft = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
  const n = day.customers.length;
  let rows = '';
  for(let i = 0; i <= n; i++){
    const after  = day.customers[i-1];
    const before = day.customers[i];
    let lbl;
    if(i === 0)    lbl = 'Før ' + escapeHtml(before.name.split(' ')[0]);
    else if(i===n) lbl = 'Etter ' + escapeHtml(after.name.split(' ')[0]) + ' – sist';
    else           lbl = 'Mellom ' + escapeHtml(after.name.split(' ')[0]) + ' og ' + escapeHtml(before.name.split(' ')[0]);
    const timehint = before
      ? '<span style="flex-shrink:0;font-size:11px;color:#888780">ca. '+ft(before._start||0)+'</span>'
      : '';
    rows +=
      '<div onclick="plannerInsertStop('+dayIdx+','+i+',window._insertPickerCust)" '
      + 'style="padding:10px 14px;border:1px solid #D3D1C7;border-radius:8px;margin-bottom:6px;'
      + 'cursor:pointer;display:flex;align-items:center;gap:10px;background:#fff">'
      + '<span style="background:#E6F1FB;color:#0C447C;min-width:26px;height:26px;border-radius:13px;'
      + 'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">'
      + (i+1) + '</span>'
      + '<span style="flex:1;font-size:13px;color:#2C2C2A">' + escapeHtml(lbl) + '</span>'
      + timehint
      + '</div>';
  }
  modal.innerHTML =
    '<div style="background:#fff;border-radius:14px;width:420px;max-width:100%;max-height:80vh;display:flex;flex-direction:column">'
    + '<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:center">'
    + '<div><div style="font-size:15px;font-weight:700">Sett inn på plass</div>'
    + '<div style="font-size:12px;color:#5F5E5A;margin-top:2px">'
    + escapeHtml(cust.name) + ' · ' + escapeHtml(cust.city||'') + ' · ' + (cust.l12?Math.round(cust.l12/1000)+'k':'–')
    + '</div></div>'
    + '<button onclick="document.getElementById(\'insert-pos-modal\').remove()" '
    + 'style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;padding:0 4px;line-height:1">×</button></div>'
    + '<div style="padding:12px 16px;overflow-y:auto;flex:1">' + rows + '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

// Re-render planen fra (redigerte) data uten å kjøre planleggeren på nytt
function renderPlanFromData(days){
  window._lastPlan = days;
  const output = document.getElementById('planner-output');
  if(!output) return;
  let html = '<div class="planner-result">';
  const totalVisits = days.reduce((s,d)=>s+d.customers.length,0);
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px"><div style="font-size:16px;font-weight:700;color:#2C2C2A">Redigert plan</div><div style="font-size:12px;color:#888780;flex-shrink:0">'+totalVisits+' besøk · '+days.length+' dag(er)</div></div>';
  days.forEach((day, dayIdx)=>{
    const fixedInfo = day.fixedCount>0 ? ' · '+day.fixedCount+' fast(e) avtale(r)' : '';
    const zoneInfo = day.zones&&day.zones.length>0 ? ' · 📍 '+day.zones.join(' → ') : '';
    html += '<div class="planner-day"><div class="planner-day-title">'+day.label+' <span style="font-weight:400;color:#888780;font-size:12px">· '+day.customers.length+' besøk'+fixedInfo+zoneInfo+'</span></div>';
    if(day.skippedReason){
      const icon = day.isHoliday ? '🎉' : '🌴';
      html += '<div style="background:#FBE9E7;border:1px solid #C62828;color:#C62828;padding:12px 14px;margin:8px 0;border-radius:8px;font-size:13px;font-weight:600">'+icon+' '+escapeHtml(day.skippedReason)+' — ingen besøk planlagt</div></div>';
      return;
    }
    let prevCity = day.startCity || '';
    const _extras = ((day.timeline||[]).filter(x=>x.kind==='flight-leg'||x.kind==='time-block')).sort((a,b)=>a.startMins-b.startMins);
    let _legPtr = 0;
    function _renderExtra(item){
      const f3=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
      if(item.kind==='flight-leg'){
        return '<div class="planner-stop" style="background:#E6F1FB;border:1px solid #B8D4E8;border-radius:8px;padding:8px 12px;margin:4px 0'+(item.booked?'':';opacity:0.62')+'"><div class="planner-stop-time" style="color:#0C447C">'+f3(item.startMins)+'</div><div class="planner-stop-icon">✈</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#2C2C2A"><span class="book-mark">'+(item.booked?'✅':'❌')+'</span> Fly: '+escapeHtml(item.from)+' → '+escapeHtml(item.to)+'</div><div class="planner-stop-meta" style="color:#0C447C">Avgang '+f3(item.startMins)+' · Ankomst '+f3(item.endMins)+' · vær der 30 min før</div></div><label style="display:flex;align-items:center;gap:4px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700;color:#0C447C"><input type="checkbox" '+(item.booked?'checked':'')+' onchange="toggleLegBooked('+dayIdx+','+item.id+',this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label><button onclick="removeFlightLeg('+dayIdx+','+item.id+')" style="background:none;border:none;color:#A23B27;font-size:18px;cursor:pointer;padding:0 6px;flex-shrink:0" title="Fjern flyetappe">×</button></div>';
      }
      // time-block
      const tt = TIME_BLOCK_TYPES.find(t=>t.key===item.type)||{emoji:'🕐'};
      return '<div class="planner-stop" style="background:#F1EFE8;border:1px solid #D3D1C7;border-radius:8px;padding:8px 12px;margin:4px 0;opacity:0.92"><div class="planner-stop-time">'+f3(item.startMins)+'</div><div class="planner-stop-icon">'+tt.emoji+'</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#5F5E5A;font-weight:600">'+escapeHtml(item.label||'Tid')+'</div><div class="planner-stop-meta">'+f3(item.startMins)+' – '+f3(item.endMins)+'</div></div><button onclick="removeTimeBlock('+dayIdx+','+item.id+')" style="background:none;border:none;color:#A23B27;font-size:18px;cursor:pointer;padding:0 6px;flex-shrink:0" title="Fjern">×</button></div>';
    }
    // Vis avreise fra hjem hvis aktuelt
    if(day.startCity && day.customers.length>0){
      const firstC = day.customers[0];
      if(firstC._drive>0){
        const fromShort = day.startCity.split(',')[0];
        const ds = firstC._start - firstC._drive;
        const h1=Math.floor(Math.max(0,ds)/60), m1=Math.max(0,ds)%60;
        const _depRoute=getRouteInfo(day.startCity, firstC.city||'');
        const _depKm=_depRoute&&_depRoute.km?' · '+(_depRoute.estimated?'≈':'')+_depRoute.km+' km':'';
        const _depMaps='https://www.google.com/maps/dir/'+encodeURIComponent(day.startCity+', Norge')+'/'+encodeURIComponent((firstC.city||'')+', Norge');
        html+='<div class="planner-stop" style="background:#FFF6E6;border:1px solid #E6D9B8;border-radius:8px;padding:8px 12px;margin:4px 0"><div class="planner-stop-time" style="color:#6D4C00">'+(h1<10?'0':'')+h1+':'+(m1<10?'0':'')+m1+'</div><div class="planner-stop-icon">🏠</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#2C2C2A">Avreise: '+escapeHtml(fromShort)+' → '+escapeHtml(firstC.city||'')+' <span style="background:#E6D9B8;color:#6D4C00;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600">'+firstC._drive+' min'+_depKm+'</span> <a href="'+_depMaps+'" target="_blank" style="color:#1565C0;text-decoration:underline;font-size:11px">Maps ↗</a></div></div></div>';
      }
    }
    day.customers.forEach((c, custIdx)=>{
      // Flyetapper som skjer før dette besøket
      while(_legPtr<_extras.length && _extras[_legPtr].startMins <= (c._start - (c._drive||0))){
        html+=_renderExtra(_extras[_legPtr]);
        if(_extras[_legPtr].kind==='flight-leg') prevCity = _extras[_legPtr].to || prevCity;
        _legPtr++;
      }
      const hh=Math.floor(c._start/60), mm=c._start%60;
      const ehh=Math.floor(c._end/60), emm=c._end%60;
      const f=n=>(n<10?'0':'')+n;
      // Kjøring mellom kunder
      if(custIdx>0 && c._drive>0){
        const ri = getRouteInfo(prevCity, c.city||'');
        const ferry = ri?ri.ferry:null;
        let ferryHtml='';
        if(ferry) ferryHtml='<div style="margin-top:4px;padding:5px 8px;background:#E6F1FB;border-radius:5px;font-size:11px;color:#0C447C">⛴ Ferje: '+escapeHtml(ferry.name)+' — <a href="'+escapeHtml(ferry.url)+'" target="_blank" style="color:#0C447C">Tider ↗</a></div>';
        const _eh=Math.floor(c._drive/60), _em=c._drive%60;
        const _ts=_eh>0?(_eh+'t'+(_em>0?' '+_em+'min':'')):(_em+' min');
        const _ks=ri&&ri.km?' · '+(ri.estimated?'≈':'')+ri.km+' km':'';
        html+='<div class="planner-drive">🚗 Kjøring · '+_ts+_ks+' <a href="'+mapsLink((prevCity+', Norge'),((c.city||'')+', Norge'))+'" target="_blank" style="color:#1565C0;text-decoration:underline;margin-left:4px">Maps ↗</a>'+ferryHtml+'</div>';
      }
      const badge=c.isPrio?'<span style="background:#D1EAF8;color:#0A4A7A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600">Prioritert</span>':'';
      const durBadge='<span style="background:#F1EFE8;color:#5F5E5A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600;margin-left:4px">'+c._duration+' min</span>';
      html+='<div class="planner-stop editable-stop" draggable="true" data-day="'+dayIdx+'" data-cust="'+custIdx+'" ondragstart="plannerDragStart(event,'+dayIdx+','+custIdx+')" ondragover="plannerDragOver(event)" ondrop="plannerDrop(event,'+dayIdx+','+custIdx+')" ondragend="plannerDragEnd(event)" style="cursor:grab;position:relative'+(c.appointed===true?'':';opacity:0.62')+'">'+
        '<div class="planner-stop-time">'+f(hh)+':'+f(mm)+'</div>'+
        '<div class="planner-stop-icon" style="cursor:grab" title="Dra for å endre rekkefølge">⠿</div>'+
        '<div class="planner-stop-body"><div class="planner-stop-name">'+escapeHtml(c.name)+' '+badge+durBadge+'</div><div class="planner-stop-meta">'+escapeHtml(c.city||'')+' · L12: '+nok(c.l12)+'</div><div class="planner-stop-meta" style="color:#888780">'+f(hh)+':'+f(mm)+' – '+f(ehh)+':'+f(emm)+'</div></div>'+
        '<button onclick="toggleVisitAppointed('+dayIdx+','+custIdx+')" style="background:'+(c.appointed===true?'#1A5C3A':'#FFF6E6')+';color:'+(c.appointed===true?'#fff':'#6D4C00')+';border:1px solid '+(c.appointed===true?'#1A5C3A':'#E6D9B8')+';border-radius:12px;font-size:10px;font-weight:700;cursor:pointer;padding:3px 8px;flex-shrink:0;white-space:nowrap" title="Trykk for å endre avtalestatus">'+(c.appointed===true?'✓ Avtalt':'Uanmeldt')+'</button>'+
        '<button onclick="plannerRemoveStop('+dayIdx+','+custIdx+')" style="background:none;border:none;color:#A23B27;font-size:18px;cursor:pointer;padding:0 6px;flex-shrink:0" title="Fjern besøk">×</button>'+
        '</div>';
      prevCity = c.city || prevCity;
    });
    // Gjenværende flyetapper (etter siste besøk)
    while(_legPtr<_extras.length){
      html+=_renderExtra(_extras[_legPtr]);
      _legPtr++;
    }
    // Hjemreise med fly (siste dag)
    const _fr = (day.timeline||[]).find(x=>x.kind==='flight-return');
    if(_fr){
      const f4=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
      const driveTxt = _fr.from && _fr.from!==_fr.to ? '🚗 Kjør '+escapeHtml(_fr.from)+' → '+escapeHtml(_fr.to)+' ('+_fr.driveMin+' min) · ' : '';
      const _retB2 = (window._lastTripMeta||{}).retBooked;
      html+='<div class="planner-stop" style="background:#E6F1FB;border:1px solid #B8D4E8;border-radius:8px;padding:8px 12px;margin:4px 0'+(_retB2?'':';opacity:0.62')+'"><div class="planner-stop-time" style="color:#0C447C">'+f4(_fr.startMins)+'</div><div class="planner-stop-icon">✈</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#2C2C2A"><span class="book-mark">'+(_retB2?'✅':'❌')+'</span> Hjemreise: fly fra '+escapeHtml(_fr.to)+' kl. '+f4(_fr.retMins)+'</div><div class="planner-stop-meta" style="color:#0C447C">'+driveTxt+'Vær på flyplassen senest '+f4(_fr.retMins-45)+'</div></div><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;font-size:11px;font-weight:700;color:#0C447C"><input type="checkbox" '+(_retB2?'checked':'')+' onchange="toggleRetBooked(this)" style="width:15px;height:15px;cursor:pointer">Bestilt</label></div>';
    }
    html+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button onclick="plannerAddStopPrompt('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#F1EFE8;border:1px dashed #888780;border-radius:8px;color:#5F5E5A;font-size:12px;font-weight:600;cursor:pointer">+ Kunde</button><button onclick="addFlightLegPrompt('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#E6F1FB;border:1px dashed #0C447C;border-radius:8px;color:#0C447C;font-size:12px;font-weight:600;cursor:pointer">✈ Flyetappe</button><button onclick="showTimeBlockModal('+dayIdx+')" style="flex:1;min-width:120px;padding:8px;background:#F1EFE8;border:1px dashed #5F5E5A;border-radius:8px;color:#5F5E5A;font-size:12px;font-weight:600;cursor:pointer">🕐 Legg til tid</button></div>';
    // Vis kveldsetappe (transport til neste dags område / hotellby)
    const evItem = (day.timeline||[]).find(x=>x.kind==='drive-evening');
    if(evItem){
      const evf=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
      const evDur=evItem.min||(evItem.endMins-evItem.startMins);
      const evDurStr=evDur>=60?(Math.floor(evDur/60)+'t '+(evDur%60?(evDur%60)+'min':'')).trim():evDur+' min';
      const evRi=getRouteInfo(evItem.from, evItem.to);
      const evKm=evRi&&evRi.km?' · '+(evRi.estimated?'≈':'')+evRi.km+' km':'';
      const evMaps='https://www.google.com/maps/dir/'+encodeURIComponent(evItem.from+', Norge')+'/'+encodeURIComponent(evItem.to+', Norge');
      html+='<div class="planner-stop" style="background:#EEE9F7;border:1px solid #C5B8E0;border-radius:8px;padding:8px 12px;margin:6px 0 0"><div class="planner-stop-time" style="color:#4A2E8A">'+evf(evItem.startMins)+'</div><div class="planner-stop-icon">🌙</div><div class="planner-stop-body"><div class="planner-stop-name" style="color:#2C2C2A">Kveldsetappe: '+escapeHtml(evItem.from)+' → '+escapeHtml(evItem.to)+' <span style="background:#D8CCEF;color:#4A2E8A;font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600">'+evDurStr+evKm+'</span> <a href="'+evMaps+'" target="_blank" style="color:#1565C0;text-decoration:underline;font-size:11px">Maps ↗</a></div><div class="planner-stop-meta" style="color:#4A2E8A">Ankomst '+evf(evItem.endMins)+(day.hotel&&day.hotel.name?' · 🏨 '+escapeHtml(day.hotel.name):'')+'</div></div></div>';
    }
    html+=dayHotelRowHtml(day, dayIdx, days);
    if(day.customers.length===0){
      html+='<div style="color:#888780;font-size:13px;padding:14px;background:#F8F7F3;border-radius:8px;text-align:center;border:1px dashed #D3D1C7;margin-top:6px">Ingen besøk denne dagen.</div>';
    }
    if(!day.skippedReason && day.customers.length>0){
      html+='<div id="plan-map-'+dayIdx+'" class="planner-day-map"></div>';
    }
    html+='</div>';
  });
  html += '<div style="font-size:11px;color:#888780;margin:8px 0;text-align:center;font-style:italic">💡 Dra i ⠿ for å endre rekkefølge · × for å fjerne · knappen for å legge til</div>';
  html += '<button class="btn btn-dark planner-add-btn" onclick="plannerAddToCalendar(window._lastPlan)" style="width:100%;margin-top:8px">📅 Legg inn i kalender</button>';
  html += '</div>';
  if(typeof _destroyDayMaps==='function') _destroyDayMaps();
  output.innerHTML = html;
  setTimeout(()=>{ if(typeof initPlannerDayMaps==='function') initPlannerDayMaps(window._lastPlan,window._lastHomeBase,window._lastTripMeta); },0);
}

function plannerAddToCalendar(days){
  const tm = window._lastTripMeta || {};
  const tripTag = tm.title ? ' · '+tm.title : '';
  // Flyankomst-event (kan være dagen før dag 1)
  if(tm.hasFlight && tm.flyDate){
    if(!calEvents[tm.flyDate]) calEvents[tm.flyDate]=[];
    let flyMins = 12*60;
    if(tm.flyTime){ const [fh,fm]=tm.flyTime.split(':').map(Number); flyMins=fh*60+fm; }
    const flyLabel='✈ Ankomst '+tm.flyCity;
    const exists=calEvents[tm.flyDate].some(e=>e.type==='flight' && e.startMins===flyMins);
    if(!exists){
      calEvents[tm.flyDate].push({type:'flight',label:flyLabel,booked:!!tm.flyBooked,startMins:flyMins,endMins:flyMins+30,h:Math.floor(flyMins/60),hEnd:Math.ceil((flyMins+30)/60),agenda:'Planlagt flyankomst'+tripTag});
    }
    // Hotell-innsjekk samme kveld som ankomst (hvis hotell)
    if(tm.hasHotel){
      const ciMins = Math.max(flyMins+45, 15*60);
      const hExists=calEvents[tm.flyDate].some(e=>e.type==='hotel' && e.label.includes(tm.hotelName));
      if(!hExists){
        calEvents[tm.flyDate].push({type:'hotel',label:'🏨 '+tm.hotelName,booked:!!tm.hotelBooked,startMins:ciMins,endMins:ciMins+30,h:Math.floor(ciMins/60),hEnd:Math.ceil((ciMins+30)/60),agenda:'Innsjekk'+tripTag});
      }
    }
    // Leiebil-uttak ved ankomst (hvis angitt)
    if(tm.rental){
      const ruMins = flyMins+20;
      const rExists=calEvents[tm.flyDate].some(e=>e.type==='rental');
      if(!rExists){
        calEvents[tm.flyDate].push({type:'rental',label:'🚙 Leiebil: '+tm.rental,booked:!!tm.rentalBooked,startMins:ruMins,endMins:ruMins+25,h:Math.floor(ruMins/60),hEnd:Math.ceil((ruMins+25)/60),agenda:'Hent leiebil'+tripTag});
      }
    }
  }
  // Sjekk om noen av dagene allerede har planlagte besøk — be om bekreftelse / erstatning
  const conflictDays=[];
  days.forEach(day=>{
    const dt=day.date;
    const dateStr=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    if((calEvents[dateStr]||[]).some(e=>e.agenda&&e.agenda.startsWith('Planlagt'))) conflictDays.push(dateStr);
  });
  let overwrite=false;
  if(conflictDays.length>0){
    overwrite=confirm('Det finnes allerede planlagte oppføringer på '+conflictDays.length+' dag(er). Vil du erstatte disse? OK = erstatt, Avbryt = legg til som ekstra.');
  }
  days.forEach(day=>{
    const dt=day.date;
    const dateStr=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    if(!calEvents[dateStr]) calEvents[dateStr]=[];
    // Erstatt: fjern eksisterende auto-planlagte oppføringer på denne dagen
    if(overwrite){
      calEvents[dateStr]=calEvents[dateStr].filter(e=>!(e.agenda&&e.agenda.startsWith('Planlagt')));
    }
    // Legg inn morgen-kjøring fra hjem hvis det er på timeline
    const driveHomeItem = (day.timeline||[]).find(x=>x.kind==='drive-home');
    if(driveHomeItem){
      const exists=calEvents[dateStr].some(e=>e.type==='drive' && e.startMins===driveHomeItem.startMins);
      if(!exists){
        calEvents[dateStr].push({
          type:'drive',
          label: driveHomeItem.from+' → '+driveHomeItem.to,
          from: driveHomeItem.from,
          to: driveHomeItem.to,
          mapsFrom: driveHomeItem.from,
          mapsTo: driveHomeItem.to,
          startMins: driveHomeItem.startMins,
          endMins: driveHomeItem.endMins,
          h: Math.floor(driveHomeItem.startMins/60),
          hEnd: Math.ceil(driveHomeItem.endMins/60),
          agenda: 'Planlagt kjøring fra hjem'
        });
      }
    }
    // Legg inn besøk
    day.customers.forEach(c=>{
      const startMin=c._start;
      const endMin=c._end;
      const exists=calEvents[dateStr].some(e=>e.label===c.name && e.startMins===startMin);
      if(!exists){
        calEvents[dateStr].push({type:'visit',label:c.name,appointed:c.appointed===true,startMins:startMin,endMins:endMin,h:Math.floor(startMin/60),hEnd:Math.ceil(endMin/60),agenda:'Planlagt besøk'+tripTag+' · L12: '+nok(c.l12),auto:false});
      }
    });
    // Legg inn kveldsetappe (transport til neste dags område, med overnatting)
    const eveningItem = (day.timeline||[]).find(x=>x.kind==='drive-evening');
    if(eveningItem){
      const exists=calEvents[dateStr].some(e=>e.type==='drive' && e.startMins===eveningItem.startMins);
      if(!exists){
        calEvents[dateStr].push({
          type:'drive',
          label: eveningItem.from+' → '+eveningItem.to+' (overnatting)',
          from: eveningItem.from,
          to: eveningItem.to,
          mapsFrom: eveningItem.from,
          mapsTo: eveningItem.to,
          startMins: eveningItem.startMins,
          endMins: eveningItem.endMins,
          h: Math.floor(eveningItem.startMins/60),
          hEnd: Math.ceil(eveningItem.endMins/60),
          agenda: 'Planlagt transportetappe — overnatting i '+eveningItem.to
        });
      }
    }
    // Legg inn hotellnatt valgt for denne dagen
    if(day.hotel && day.hotel.name){
      const hotelStart = eveningItem ? Math.max(20*60, eveningItem.endMins) : 20*60;
      const hExists=calEvents[dateStr].some(e=>e.type==='hotel' && (e.label||'').includes(day.hotel.name));
      if(!hExists){
        calEvents[dateStr].push({
          type:'hotel',
          label:'🏨 '+day.hotel.name,
          booked: !!day.hotel.booked,
          startMins: hotelStart,
          endMins: hotelStart+60,
          h: Math.floor(hotelStart/60),
          hEnd: Math.ceil((hotelStart+60)/60),
          agenda: 'Overnatting'+(day.hotel.city?' i '+day.hotel.city:'')+tripTag
        });
      }
    }
    // Legg inn flyetapper (mellom kundebesøk)
    (day.timeline||[]).filter(x=>x.kind==='flight-leg').forEach(L=>{
      const exists=calEvents[dateStr].some(e=>e.type==='flight' && e.startMins===L.startMins);
      if(!exists){
        calEvents[dateStr].push({type:'flight',label:'✈ '+L.from+' → '+L.to,booked:!!L.booked,startMins:L.startMins,endMins:L.endMins,h:Math.floor(L.startMins/60),hEnd:Math.ceil(L.endMins/60),agenda:'Planlagt flyetappe'+tripTag});
      }
    });
    // Legg inn hjemreise med fly (siste dag)
    const frItem = (day.timeline||[]).find(x=>x.kind==='flight-return');
    if(frItem){
      const exists=calEvents[dateStr].some(e=>e.type==='flight' && e.startMins===frItem.retMins);
      if(!exists){
        calEvents[dateStr].push({type:'flight',label:'✈ Hjemreise fra '+frItem.to,booked:!!tm.retBooked,startMins:frItem.retMins,endMins:frItem.retMins+60,h:Math.floor(frItem.retMins/60),hEnd:Math.ceil((frItem.retMins+60)/60),agenda:'Planlagt hjemreise'+tripTag});
      }
    }
    // Legg inn tidsblokker (adm, lunsj, møter, trening osv.)
    (day.timeline||[]).filter(x=>x.kind==='time-block').forEach(b=>{
      const exists=calEvents[dateStr].some(e=>e.startMins===b.startMins && e.label===b.label);
      if(!exists){
        calEvents[dateStr].push({type:b.type||'adm',label:b.label||'Tid',startMins:b.startMins,endMins:b.endMins,h:Math.floor(b.startMins/60),hEnd:Math.ceil(b.endMins/60),agenda:'Planlagt'+tripTag});
      }
    });
    // Legg inn hjemtur (siste dag)
    const returnHomeItem = (day.timeline||[]).find(x=>x.kind==='drive-home-return');
    if(returnHomeItem){
      const exists=calEvents[dateStr].some(e=>e.type==='drive' && e.startMins===returnHomeItem.startMins);
      if(!exists){
        calEvents[dateStr].push({
          type:'drive',
          label: returnHomeItem.from+' → Hjem',
          from: returnHomeItem.from,
          to: returnHomeItem.to,
          mapsFrom: returnHomeItem.from,
          mapsTo: returnHomeItem.to,
          startMins: returnHomeItem.startMins,
          endMins: returnHomeItem.endMins,
          h: Math.floor(returnHomeItem.startMins/60),
          hEnd: Math.ceil(returnHomeItem.endMins/60),
          agenda: 'Planlagt hjemtur'
        });
      }
    }
  });
  saveData('alfa_events',calEvents);
  showToast('Plan lagt inn i kalender!');
  showSection('kalender', document.querySelector('.nav-item:nth-child(3)'));
  renderCal();
}
