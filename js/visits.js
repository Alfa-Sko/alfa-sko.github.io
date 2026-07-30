// ─── VISIT FORM ─────────────────────────────────────────────────────────────


function populateVisitCustomers(){
  document.getElementById('visit-date').value=TODAY_STR;
  fillHalfHourSlots(document.getElementById('visit-time'), '09:00');
  fillHalfHourSlots(document.getElementById('visit-time-end'), '10:00');
  const startEl=document.getElementById('visit-time');
  const endEl=document.getElementById('visit-time-end');
  startEl.onchange=function(){
    const [sh,sm]=startEl.value.split(':').map(Number);
    const [eh,em]=endEl.value.split(':').map(Number);
    if(eh*60+em<=sh*60+sm){
      const newEnd=sh*60+sm+60;
      const hh=String(Math.floor(newEnd/60)).padStart(2,'0');
      const mm=String(newEnd%60).padStart(2,'0');
      if([...endEl.options].some(o=>o.value===hh+':'+mm)) endEl.value=hh+':'+mm;
    }
  };
  var visitCsBar=document.getElementById('visit-cs-bar');
  if(visitCsBar && typeof _csMountPicker==='function'){
    _csMountPicker(visitCsBar, getCustomers(), {
      prefix:'visit',
      topRows:[{value:'__new__',label:'+ Ny kunde (skriv inn nå)'}],
      onPick:function(name){ document.getElementById('visit-customer').value=name; },
      onTopRow:function(){ openQuickCustomerModal(); }
    });
  }
}
function populateFollowCustomers(){
  var followCsBar=document.getElementById('follow-cs-bar');
  if(followCsBar && typeof _csMountPicker==='function'){
    _csMountPicker(followCsBar, getCustomers(), {
      prefix:'follow',
      onPick:function(name){ document.getElementById('follow-customer').value=name; }
    });
  }
}

function clearVisitForm(){
  if(typeof window._csp_visit_setSelected==='function') window._csp_visit_setSelected('');
  else document.getElementById('visit-customer').value='';
  document.getElementById('visit-type').value='visit';
  const ow=document.getElementById('visit-other-wrap'); if(ow) ow.style.display='none';
  const ol=document.getElementById('visit-other-label'); if(ol) ol.value='';
  document.getElementById('visit-contact').value='';
  document.getElementById('visit-notes').value='';
  document.getElementById('visit-followup').value='';
  document.getElementById('visit-date').value=TODAY_STR;
  document.getElementById('visit-time').value='09:00';
  document.getElementById('visit-time-end').value='10:00';
  const fp=document.getElementById('visit-photos'); if(fp) fp.value='';
}

function saveVisit(){
  let customer=document.getElementById('visit-customer').value;
  const type=document.getElementById('visit-type').value||'visit';
  const otherLabel=(type==='other' ? (document.getElementById('visit-other-label')||{}).value||'' : '').trim();
  const date=document.getElementById('visit-date').value;
  const time=document.getElementById('visit-time').value;
  const timeEnd=document.getElementById('visit-time-end').value;
  const contact=document.getElementById('visit-contact').value;
  const notes=document.getElementById('visit-notes').value;
  const followup=document.getElementById('visit-followup').value;
  const fileInput=document.getElementById('visit-photos');
  const files=fileInput.files;
  // Trening, teamsmøte og «annet» trenger ikke kunde
  const customerOptional = (type==='training'||type==='teams'||type==='other');
  if(type==='other' && !otherLabel){ showToast('Skriv hva slags aktivitet det er'); return; }
  if(customerOptional && !customer){
    customer = type==='training' ? 'Trening' : type==='teams' ? 'Teamsmøte' : otherLabel;
  }
  if(!customer||!date||!time||!timeEnd){ showToast('Fyll ut kunde, dato, start og slutt'); return; }
  // Sjekk at slutt er etter start
  const [sh,sm]=time.split(':').map(Number);
  const [eh,em]=timeEnd.split(':').map(Number);
  if(eh*60+em<=sh*60+sm){ showToast('Slutttidspunkt må være etter start'); return; }
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'v_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  sbUploadVisitPhotos(id, files).then(({count,paths})=>{
    const v={id,customer,type,date,time,timeEnd,contact,notes,followup,photoCount:count,photoPaths:paths};
    if(otherLabel) v.otherLabel=otherLabel;
    visits.push(v);
    saveData('alfa_visits',visits);
    // Legg også til som kalenderoppføring slik at den vises i kalenderen og blokkerer slotter i autoplanleggeren
    if(!calEvents[date]) calEvents[date]=[];
    const startMins=sh*60+sm, endMins=eh*60+em;
    const exists=calEvents[date].some(e=>e.label===customer && e.startMins===startMins);
    if(!exists){
      calEvents[date].push({type:type||'visit',label:customer,startMins,endMins,h:Math.floor(startMins/60),hEnd:Math.ceil(endMins/60),agenda:otherLabel||'Manuell registrering',contact});
      saveData('alfa_events',calEvents);
    }
    if(followup){followups.push({id:id+1,customer,task:followup,due:date,priority:'medium',done:false});saveData('alfa_followups',followups);}
    showToast('Aktivitet lagret'+(count?' med '+count+' bilde(r)':'')+'!');
    clearVisitForm();
  });
}

async function addPhotoToVisit(visitId, input){
  console.log('[photos] addPhotoToVisit kalt', visitId);
  if(_roGuard()) return;
  var files = Array.from(input.files);  // snapshot før input.value='' tømmer live FileList
  input.value='';
  if(!files.length) return;
  var v = visits.find(function(x){ return String(x.id)===String(visitId); });
  if(!v){ showToast('Besøk ikke funnet'); return; }
  showToast('Laster opp …');
  var result = await sbUploadVisitPhotos(visitId, files);
  if(result.count>0){
    v.photoPaths = (v.photoPaths||[]).concat(result.paths);
    v.photoCount = (v.photoCount||0)+result.count;
    saveData('alfa_visits', visits);
    showToast('Bilde lagret!');
    var ph = document.getElementById('ev-popup-photos');
    if(ph && typeof _loadEvPopupPhotos === 'function') _loadEvPopupPhotos(v);
  } else {
    showToast('Opplasting feilet – sjekk konsollen');
  }
  renderNotes();
}

// ─── KUNDEKORT-BILDER (ikke knyttet til besøk) ───────────────────────────────

async function addCustomerPhoto(customerName, input){
  if(_roGuard()) return;
  var files = Array.from(input.files);
  input.value = '';
  if(!files.length) return;
  showToast('Laster opp …');
  var groupId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'cp_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  var result = await sbUploadVisitPhotos(groupId, files);
  if(!result.count){
    showToast('Opplasting feilet – sjekk konsollen');
    return;
  }
  var entry = {
    id: groupId,
    customer: customerName,
    date: TODAY_STR,
    createdAt: new Date().toISOString(),
    photoPaths: result.paths,
  };
  custPhotos.push(entry);
  saveData('alfa_cust_photos', custPhotos);
  showToast('📷 Bilde lagret på kundekortet!');
  // Oppdater popup-forhåndsvisning hvis den er åpen
  var ph = document.getElementById('ev-popup-custphotos');
  if(ph) _renderCustPhotoInPopup(ph, customerName);
  renderTimeline();
  // Oppdater kundekortet hvis det er åpent for denne kunden
  var detHdr = document.getElementById('customer-detail-name');
  if(detHdr && detHdr.dataset.customer === customerName){
    var histEl = document.getElementById('cust-history-list');
    if(histEl) _renderCustHistory(customerName, 'all');
  }
}

function deleteCustomerPhoto(id){
  if(_roGuard()) return;
  if(!confirm('Slett dette bildet fra kundekortet?')) return;
  var entry = custPhotos.find(function(x){ return String(x.id)===String(id); });
  if(entry && entry.photoPaths && entry.photoPaths.length){
    _sbDeleteStoragePhotos(entry.photoPaths);
  }
  custPhotos = custPhotos.filter(function(x){ return String(x.id)!==String(id); });
  saveData('alfa_cust_photos', custPhotos);
  renderTimeline();
  showToast('Bilde slettet');
}

// Bygger thumbnails for kundekort-bilder inn i et gitt DOM-element
async function _renderCustPhotoInPopup(el, customerName){
  var entries = custPhotos.filter(function(x){ return x.customer===customerName; });
  if(!entries.length){ el.innerHTML=''; return; }
  var pathToEntryId = {};
  entries.forEach(function(e){ (e.photoPaths||[]).forEach(function(path){ pathToEntryId[path]=e.id; }); });
  var allPaths = entries.reduce(function(acc,e){ return acc.concat(e.photoPaths||[]); }, []);
  if(!allPaths.length){ el.innerHTML=''; return; }
  var photos = await getStoragePhotosForVisit({photoPaths: allPaths});
  if(!photos.length){ el.innerHTML=''; return; }
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:5px;margin-top:6px">'
    + photos.map(function(p){
        var safeUrl=p.url.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        var safeName=p.name.replace(/'/g,"\\'");
        var entryId=p.path?pathToEntryId[p.path]:null;
        return '<div style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid #D3D1C7;position:relative">'
          +'<img src="'+p.url+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" loading="lazy" alt="'+p.name+'" onclick="viewPhoto(\''+safeUrl+'\',\''+safeName+'\')">'
          +(entryId&&p.path?'<button onclick="deleteSingleCustPhoto(\''+entryId+'\',\''+p.path.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')" style="position:absolute;top:2px;right:2px;background:rgba(162,59,39,0.82);color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;padding:1px 5px;line-height:1.4">🗑</button>':'')
          +'</div>';
      }).join('')
    + '</div>';
}

function deleteVisit(id){
  if(!confirm('Slett dette besøket og alle tilhørende bilder?')) return;
  var v = visits.find(function(x){ return String(x.id)===String(id); });
  deletePhotosForVisit(id);                          // IndexedDB-bilder (lokale)
  if(v && v.photoPaths && v.photoPaths.length){
    _sbDeleteStoragePhotos(v.photoPaths);            // Storage-bilder, fire-and-forget
  }
  visits=visits.filter(function(x){ return String(x.id)!==String(id); });
  saveData('alfa_visits',visits);
  renderNotes();
  renderTimeline();
  var calEl=document.getElementById('sec-kalender');
  if(calEl && getComputedStyle(calEl).display!=='none'){
    if(typeof closeEvPopup==='function') closeEvPopup();
    if(typeof renderCal==='function') renderCal();
  }
  showToast('Besøk slettet');
}

function clearVisitNote(id){
  if(_roGuard()) return;
  if(!confirm('Slett notatteksten fra dette besøket? (kan ikke angres)')) return;
  var v=visits.find(function(x){ return String(x.id)===String(id); });
  if(!v) return;
  v.notes='';
  saveData('alfa_visits',visits);
  renderNotes();
  renderTimeline();
  var detHdr=document.getElementById('customer-detail-name');
  if(detHdr){ var histEl=document.getElementById('cust-history-list'); if(histEl) _renderCustHistory(detHdr.dataset.customer,'all'); }
  showToast('Notat slettet');
}

function editVisitNote(id){
  if(_roGuard()) return;
  var v=visits.find(function(x){ return String(x.id)===String(id); });
  if(!v) return;
  _openNoteEditModal({
    text: v.notes||'',
    subtitle: escapeHtml(v.customer)+' · '+v.date.split('-').reverse().join('.'),
    onSave: function(newText){
      v.notes=newText; // tom streng = tøm notatet (samme som clearVisitNote, men uten confirm)
      saveData('alfa_visits',visits);
      renderNotes();
      renderTimeline();
      var detHdr=document.getElementById('customer-detail-name');
      if(detHdr){ var histEl=document.getElementById('cust-history-list'); if(histEl) _renderCustHistory(detHdr.dataset.customer,'all'); }
      if(typeof closeEvPopup==='function') closeEvPopup();
      showToast(newText?'Notat oppdatert':'Notat tømt');
    }
  });
}

// Felles inline-modal for notatredigering (brukes av editVisitNote og editFreeNote)
function _openNoteEditModal(opts){
  var existing=document.getElementById('note-edit-modal');
  if(existing) existing.remove();
  var modal=document.createElement('div');
  modal.id='note-edit-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:14px';
  modal.innerHTML=
    '<div style="background:#fff;border-radius:14px;width:480px;max-width:100%;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.18)">'
    +'<div style="padding:14px 16px;border-bottom:1px solid #D3D1C7;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
    +'<div><div style="font-size:15px;font-weight:700;color:#2C2C2A">Rediger notat</div>'
    +'<div style="font-size:12px;color:#5F5E5A;margin-top:2px">'+opts.subtitle+'</div></div>'
    +'<button onclick="document.getElementById(\'note-edit-modal\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888780;padding:0 4px;line-height:1;flex-shrink:0">×</button>'
    +'</div>'
    +'<div style="padding:14px 16px">'
    +'<textarea id="note-edit-ta" placeholder="Skriv notat…" style="width:100%;min-height:130px;padding:10px 12px;border:1px solid #D3D1C7;border-radius:8px;font-size:13px;line-height:1.55;resize:vertical;box-sizing:border-box;font-family:inherit;color:#2C2C2A"></textarea>'
    +'</div>'
    +'<div style="padding:0 16px 14px;display:flex;gap:8px">'
    +'<button onclick="window._noteEditSave()" style="flex:1;padding:10px;background:#2C2C2A;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Lagre</button>'
    +'<button onclick="document.getElementById(\'note-edit-modal\').remove()" style="padding:10px 18px;background:#F1EFE8;border:none;border-radius:8px;font-size:13px;cursor:pointer;color:#5F5E5A">Avbryt</button>'
    +'</div>'
    +'</div>';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  window._noteEditSave=function(){
    var ta=document.getElementById('note-edit-ta');
    if(!ta) return;
    var newText=ta.value.trim();
    modal.remove();
    delete window._noteEditSave;
    opts.onSave(newText);
  };
  document.body.appendChild(modal);
  // Forhåndsutfyll ETTER append (textarea innerHTML-escaping er tryggere via .value)
  setTimeout(function(){
    var ta=document.getElementById('note-edit-ta');
    if(!ta) return;
    ta.value=opts.text;
    ta.focus();
    ta.setSelectionRange(ta.value.length,ta.value.length);
  },30);
}

function deleteSingleVisitPhoto(visitId, path){
  if(_roGuard()) return;
  if(!confirm('Slett dette bildet? (kan ikke angres)')) return;
  var v=visits.find(function(x){ return String(x.id)===String(visitId); });
  if(!v) return;
  v.photoPaths=(v.photoPaths||[]).filter(function(p){ return p!==path; });
  v.photoCount=v.photoPaths.length;
  _sbDeleteStoragePhotos([path]);
  saveData('alfa_visits',visits);
  renderNotes();
  renderTimeline();
  if(typeof _loadEvPopupPhotos==='function'){ var ph=document.getElementById('ev-popup-photos'); if(ph) _loadEvPopupPhotos(v); }
  var detHdr=document.getElementById('customer-detail-name');
  if(detHdr){ var histEl=document.getElementById('cust-history-list'); if(histEl) _renderCustHistory(detHdr.dataset.customer,'all'); }
  showToast('Bilde slettet');
}

function deleteSingleCustPhoto(custPhotoId, path){
  if(_roGuard()) return;
  if(!confirm('Slett dette bildet? (kan ikke angres)')) return;
  var entry=custPhotos.find(function(x){ return String(x.id)===String(custPhotoId); });
  if(!entry) return;
  var customerName=entry.customer;
  entry.photoPaths=(entry.photoPaths||[]).filter(function(p){ return p!==path; });
  if(!entry.photoPaths.length) custPhotos=custPhotos.filter(function(x){ return String(x.id)!==String(custPhotoId); });
  _sbDeleteStoragePhotos([path]);
  saveData('alfa_cust_photos',custPhotos);
  renderTimeline();
  var ph=document.getElementById('ev-popup-custphotos');
  if(ph) _renderCustPhotoInPopup(ph, customerName);
  var detHdr=document.getElementById('customer-detail-name');
  if(detHdr&&detHdr.dataset.customer===customerName){ var histEl=document.getElementById('cust-history-list'); if(histEl) _renderCustHistory(customerName,'all'); }
  showToast('Bilde slettet');
}
