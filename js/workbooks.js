// ─── WORKBOOKS ─────────────────────────────────────────────────────────────

if(typeof pdfjsLib !== 'undefined'){
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let lbDocs = [];
let _lbDB = null;
let lbCurrentFilter = 'all';

(function lbInit(){
  const req = indexedDB.open('AlfaWorkbooks', 1);
  req.onupgradeneeded = e => { e.target.result.createObjectStore('docs', {keyPath:'id'}); };
  req.onsuccess = e => {
    _lbDB = e.target.result;
    const tx = _lbDB.transaction('docs','readonly');
    const r = tx.objectStore('docs').getAll();
    r.onsuccess = () => { lbDocs=(r.result||[]).sort((a,b)=>b.added.localeCompare(a.added)); if(document.getElementById('lb-grid')) lbRender(); };
  };
  req.onerror = () => console.warn('WorkbookDB failed');
})();

// ─── FELLES KATALOGER (Supabase Storage, bucket: kataloger) ─────────────────

async function sbListCatalogs(){
  const r = await sbFetch('/storage/v1/object/list/kataloger', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({prefix:'', limit:200, sortBy:{column:'name', order:'asc'}})
  });
  if(!r.ok) throw new Error('HTTP '+r.status);
  return await r.json();
}

async function sbRenderCatalogs(){
  const el = document.getElementById('cloud-cat-list');
  if(!el) return;
  if(!window._sbUser){
    el.innerHTML = '<div class="empty-state" style="padding:10px;font-size:12px">Logg inn for å se og dele felles kataloger.</div>';
    return;
  }
  try{
    const items = (await sbListCatalogs()).filter(it=>it.name && !it.name.startsWith('.'));
    if(items.length===0){
      el.innerHTML = '<div class="empty-state" style="padding:10px;font-size:12px">Ingen felles kataloger ennå — last opp den første!</div>';
      return;
    }
    el.innerHTML = items.map(it=>{
      const sizeMb = it.metadata && it.metadata.size ? (it.metadata.size/1048576).toFixed(1)+' MB' : '';
      const nm = it.name.replace(/'/g,"\\'");
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #E3EDF5">'+
        '<span style="font-size:18px">📕</span>'+
        '<div style="flex:1;min-width:0;font-size:13px;font-weight:600;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(it.name)+'</div>'+
        (sizeMb?'<span style="font-size:11px;color:#888780;flex-shrink:0">'+sizeMb+'</span>':'')+
        '<button class="btn btn-dark btn-sm" style="flex-shrink:0" onclick="sbOpenCatalog(\''+nm+'\')">Åpne</button>'+
        '</div>';
    }).join('');
  }catch(e){
    el.innerHTML = '<div class="empty-state" style="padding:10px;font-size:12px;color:#A23B27">Fikk ikke hentet felles kataloger ('+escapeHtml(e.message||'feil')+'). Sjekk at storage-policyene er på plass.</div>';
  }
}

async function sbOpenCatalog(name){
  showToast('Henter '+name+' …');
  try{
    const r = await sbFetch('/storage/v1/object/authenticated/kataloger/'+encodeURIComponent(name), {method:'GET'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }catch(e){
    showToast('Kunne ikke åpne: '+(e.message||e));
  }
}

async function sbUploadCatalogs(input){
  if(!window._sbUser){ showToast('Logg inn først'); return; }
  const files = Array.from(input.files||[]);
  input.value='';
  for(const file of files){
    if(file.size > 50*1048576){ alert(file.name+' er over 50 MB — komprimer PDF-en først (gratisplanen har 1 GB totalt).'); continue; }
    showToast('Laster opp '+file.name+' …');
    try{
      const _wbS = _sbSession(), _wbT = (_wbS && _wbS.access_token) || '';
      let _wbExp = 0; try { _wbExp = JSON.parse(atob(_wbT.split('.')[1])).exp - Math.floor(Date.now()/1000); } catch(_){}
      console.log('[workbooks] Token: Bearer ' + (_wbT ? _wbT.slice(0,20)+'…' : 'MANGLER') + ', utløper om ' + _wbExp + 's');
      const r = await sbFetch('/storage/v1/object/kataloger/'+encodeURIComponent(file.name), {
        method:'POST',
        headers:{'Content-Type': file.type||'application/pdf'},
        body: file
      });
      if(r.status===409){ showToast(file.name+' finnes fra før — gi filen nytt navn for å laste opp ny versjon'); continue; }
      if(!r.ok) throw new Error('HTTP '+r.status);
      showToast('✅ '+file.name+' delt med teamet');
    }catch(e){
      showToast('Opplasting feilet: '+(e.message||e));
    }
  }
  sbRenderCatalogs();
}

function lbUpload(input){
  Array.from(input.files).forEach(file=>{
    const reader = new FileReader();
    reader.onload = e => {
      const id = 'wb-'+Date.now()+'-'+Math.random().toString(36).slice(2);
      const season = /fw|aw|winter|vinter|høst/i.test(file.name)?'FW':'SS';
      const year = (file.name.match(/\d{2,4}/)||[''])[0];
      const doc = {id, name:file.name.replace(/\.[^.]+$/,''), type:file.type, dataURL:e.target.result, season, year, added:new Date().toISOString()};
      lbDocs.unshift(doc);
      if(_lbDB){ const tx=_lbDB.transaction('docs','readwrite'); tx.objectStore('docs').put(doc); }
      lbRender();
      showToast(doc.name+' lagt til');
    };
    reader.readAsDataURL(file);
  });
  input.value='';
}

function lbFilter(f){
  lbCurrentFilter=f;
  ['all','FW','SS'].forEach(x=>{ const el=document.getElementById('lbf-'+x); if(el) el.style.background=x===f?'#2C2C2A':'#F1EFE8'; el&&(el.style.color=x===f?'#fff':'#2C2C2A'); });
  lbRender();
}

function lbRender(){
  const grid=document.getElementById('lb-grid');
  if(!grid) return;
  const filtered=lbCurrentFilter==='all'?lbDocs:lbDocs.filter(d=>d.season===lbCurrentFilter);
  if(!filtered.length){ grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888780;font-size:14px">'+(lbDocs.length?'Ingen workbooks for valgt sesong.':'Ingen workbooks ennå.<br><br>Trykk på «Last opp» og velg PDF-filer.')+'</div>'; return; }
  grid.innerHTML=filtered.map(d=>{
    const icon=d.season==='SS'?'☀️':'❄️';
    const thumbContent=d.type&&d.type.startsWith('image')?'<img src="'+d.dataURL+'" style="width:100%;height:100%;object-fit:cover">':'<canvas id="canvas-'+d.id+'" style="width:100%;height:100%;object-fit:contain"></canvas>';
    return '<div class="lb-card" onclick="lbOpen(\''+d.id+'\')">'+'<div class="lb-thumb" style="background:'+(d.type==='application/pdf'?'#1a1a18':'#F1EFE8')+'">'+thumbContent+'</div>'+'<div class="lb-meta"><div class="lb-title">'+d.name+'</div><div class="lb-tag">'+icon+' '+d.season+(d.year?' '+d.year:'')+'</div></div>'+'<div style="padding:0 12px 12px;display:flex;gap:6px"><button class="btn btn-dark btn-sm" style="flex:1" onclick="event.stopPropagation();lbOpen(\''+d.id+'\')">Åpne</button><button class="btn btn-light btn-sm" onclick="event.stopPropagation();lbDelete(\''+d.id+'\')">🗑</button></div>'+'</div>';
  }).join('');
  filtered.forEach(d=>{ if(d.type==='application/pdf'&&d.dataURL) lbRenderThumb(d); });
}

function lbRenderThumb(d){
  if(typeof pdfjsLib==='undefined') return;
  pdfjsLib.getDocument(d.dataURL).promise.then(pdf=>pdf.getPage(1)).then(page=>{
    const canvas=document.getElementById('canvas-'+d.id);
    if(!canvas) return;
    const w=canvas.parentElement.offsetWidth||220;
    const h=w/0.71;
    const vp=page.getViewport({scale:1});
    const scale=Math.min(w/vp.width,h/vp.height);
    const svp=page.getViewport({scale});
    canvas.width=svp.width; canvas.height=svp.height;
    page.render({canvasContext:canvas.getContext('2d'),viewport:svp});
  }).catch(()=>{});
}

let _currentLbDoc = null;
function lbOpen(id){
  const d=lbDocs.find(x=>x.id===id);
  if(!d||!d.dataURL) return;
  _currentLbDoc = d;
  document.getElementById('lb-viewer-title').textContent=d.name;
  document.getElementById('lb-viewer-pages').textContent='Laster...';
  document.getElementById('lb-viewer').style.display='flex';
  const container = document.getElementById('lb-viewer-pages-container');
  container.innerHTML='<div style="color:#888;font-size:13px;padding:40px">Laster PDF ...</div>';
  // For bilder, vis direkte
  if(d.type && d.type.startsWith('image')){
    container.innerHTML = '<img src="'+d.dataURL+'" style="max-width:100%;max-height:90vh;object-fit:contain;background:#fff;border-radius:4px">';
    document.getElementById('lb-viewer-pages').textContent='Bilde';
    return;
  }
  // For PDF, rendre alle sider med PDF.js
  if(typeof pdfjsLib === 'undefined'){
    container.innerHTML = '<div style="color:#fff;padding:20px;text-align:center"><p>PDF-leseren laster fortsatt. Prøv å laste siden på nytt eller åpne PDF-en direkte:</p><a href="'+d.dataURL+'" target="_blank" style="color:#9FE1CB;display:inline-block;margin-top:14px;padding:10px 18px;background:#333;border-radius:8px;text-decoration:none">📄 Åpne i ny fane</a></div>';
    return;
  }
  pdfjsLib.getDocument(d.dataURL).promise.then(async pdf=>{
    document.getElementById('lb-viewer-pages').textContent = pdf.numPages + ' sider';
    container.innerHTML='';
    // Rendre én side om gangen for å unngå å hentge nettleseren
    for(let i=1; i<=pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const containerWidth = Math.min(window.innerWidth - 40, 900);
      const vp = page.getViewport({scale:1});
      const scale = containerWidth/vp.width;
      const svp = page.getViewport({scale});
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'background:#fff;max-width:100%;height:auto;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.4)';
      canvas.width = svp.width;
      canvas.height = svp.height;
      // Side-nummer-overlegg
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;width:100%;max-width:'+containerWidth+'px;display:flex;justify-content:center';
      wrapper.appendChild(canvas);
      const pageLabel = document.createElement('div');
      pageLabel.textContent = 'Side ' + i + ' av ' + pdf.numPages;
      pageLabel.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;padding:3px 8px;border-radius:4px;pointer-events:none';
      wrapper.appendChild(pageLabel);
      container.appendChild(wrapper);
      await page.render({canvasContext:canvas.getContext('2d'),viewport:svp}).promise;
    }
  }).catch(err=>{
    console.error('PDF render error', err);
    container.innerHTML = '<div style="color:#fff;padding:20px;text-align:center"><p>Kunne ikke åpne PDF-en i appen. Last den ned for å vise:</p><a href="'+d.dataURL+'" download="'+d.name+'.pdf" style="color:#9FE1CB;display:inline-block;margin-top:14px;padding:10px 18px;background:#333;border-radius:8px;text-decoration:none">⬇ Last ned PDF</a></div>';
  });
}

function lbDownload(){
  if(!_currentLbDoc || !_currentLbDoc.dataURL) return;
  const a = document.createElement('a');
  a.href = _currentLbDoc.dataURL;
  a.download = _currentLbDoc.name + (_currentLbDoc.type==='application/pdf' ? '.pdf' : '');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function lbClose(){
  document.getElementById('lb-viewer').style.display='none';
  document.getElementById('lb-viewer-pages-container').innerHTML='';
  _currentLbDoc = null;
}

function lbDelete(id){
  lbDocs=lbDocs.filter(d=>d.id!==id);
  if(_lbDB){const tx=_lbDB.transaction('docs','readwrite');tx.objectStore('docs').delete(id);}
  lbRender();
  showToast('Workbook fjernet');
}

