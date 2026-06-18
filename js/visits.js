// ─── VISIT FORM ─────────────────────────────────────────────────────────────


function populateVisitCustomers(){
  const sel=document.getElementById('visit-customer');
  sel.innerHTML='<option value="">Velg kunde...</option>'+'<option value="__new__">+ Ny kunde (skriv inn nå)</option>'+'<optgroup label="─────────────────"></optgroup>'+getCustomers().map(c=>`<option value="${c.name}">${c.name} — ${c.city}</option>`).join('');
  sel.onchange=function(){if(this.value==='__new__'){openQuickCustomerModal();this.value='';}};
  document.getElementById('visit-date').value=TODAY_STR;
  fillHalfHourSlots(document.getElementById('visit-time'), '09:00');
  fillHalfHourSlots(document.getElementById('visit-time-end'), '10:00');
  // Auto-juster slutt når start endres (sett slutt = start + 1t hvis slutt er <= start)
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
}
function populateFollowCustomers(){
  const sel=document.getElementById('follow-customer');
  sel.innerHTML='<option value="">Velg kunde...</option>'+getCustomers().map(c=>`<option value="${c.name}">${c.name} — ${c.city}</option>`).join('');
}

function clearVisitForm(){
  document.getElementById('visit-customer').value='';
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
  const id=Date.now();
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

function deleteVisit(id){
  if(!confirm('Slett dette besøket og alle tilhørende bilder?')) return;
  deletePhotosForVisit(id);
  visits=visits.filter(v=>v.id!==id);
  saveData('alfa_visits',visits);
  renderNotes();
  showToast('Besøk slettet');
}
