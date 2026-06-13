// ─── BRUKERPROFIL ───────────────────────────────────────────────────────────

function loadProfileIntoForm(){
  document.getElementById('prof-name').value = userProfile.name||'';
  document.getElementById('prof-email').value = userProfile.email||'';
  document.getElementById('prof-phone').value = userProfile.phone||'';
  document.getElementById('prof-home-address').value = userProfile.homeAddress||'';
  document.getElementById('prof-home-city').value = userProfile.homeCity||'';
  document.getElementById('prof-car-type').value = userProfile.carType||'bensin';
  document.getElementById('prof-car-model').value = userProfile.carModel||'';
  document.getElementById('prof-ev-range').value = userProfile.evRange||'';
  document.getElementById('prof-charging').value = userProfile.chargingPref||'alle';
  document.getElementById('prof-autopass').checked = userProfile.autopass!==false;
  document.getElementById('prof-rental').value = userProfile.rentalPref||'';
  document.getElementById('prof-airline').value = userProfile.airlinePref||'alle';
  document.getElementById('prof-home-airport').value = userProfile.homeAirport||'TOS';
  document.getElementById('prof-airline-loyalty').value = userProfile.airlineLoyalty||'';
  document.getElementById('prof-hotel-loyalty').value = userProfile.hotelLoyalty||'';
  document.getElementById('prof-work-start').value = userProfile.workStart||'08:00';
  document.getElementById('prof-work-end').value = userProfile.workEnd||'17:00';
  document.getElementById('prof-lunch-start').value = userProfile.lunchStart||'11:00';
  document.getElementById('prof-lunch-dur').value = userProfile.lunchDuration||30;
  document.getElementById('prof-ferry').value = userProfile.preferredFerryOperator||'alle';
  // Hotell-kjeder (piller)
  const chains = userProfile.hotelChainPref||[];
  document.querySelectorAll('.hotel-chain-pill').forEach(btn=>{
    if(chains.includes(btn.dataset.value)) btn.classList.add('selected');
    else btn.classList.remove('selected');
  });
  profileToggleEV();
}

function toggleHotelChain(btn){
  btn.classList.toggle('selected');
}

function profileToggleEV(){
  const carType = document.getElementById('prof-car-type').value;
  const isEV = carType==='elbil' || carType==='hybrid';
  document.getElementById('prof-ev-section').style.display = isEV ? 'block' : 'none';
}

function saveUserProfile(){
  userProfile.name = document.getElementById('prof-name').value.trim();
  userProfile.email = document.getElementById('prof-email').value.trim();
  userProfile.phone = document.getElementById('prof-phone').value.trim();
  userProfile.homeAddress = document.getElementById('prof-home-address').value.trim();
  userProfile.homeCity = document.getElementById('prof-home-city').value.trim();
  userProfile.carType = document.getElementById('prof-car-type').value;
  userProfile.carModel = document.getElementById('prof-car-model').value.trim();
  userProfile.evRange = parseInt(document.getElementById('prof-ev-range').value)||0;
  userProfile.chargingPref = document.getElementById('prof-charging').value;
  userProfile.autopass = document.getElementById('prof-autopass').checked;
  userProfile.rentalPref = document.getElementById('prof-rental').value||'';
  userProfile.airlinePref = document.getElementById('prof-airline').value;
  userProfile.homeAirport = document.getElementById('prof-home-airport').value;
  userProfile.airlineLoyalty = document.getElementById('prof-airline-loyalty').value.trim();
  userProfile.hotelLoyalty = document.getElementById('prof-hotel-loyalty').value.trim();
  userProfile.workStart = document.getElementById('prof-work-start').value||'08:00';
  userProfile.workEnd = document.getElementById('prof-work-end').value||'17:00';
  userProfile.lunchStart = document.getElementById('prof-lunch-start').value||'11:00';
  userProfile.lunchDuration = parseInt(document.getElementById('prof-lunch-dur').value)||30;
  userProfile.preferredFerryOperator = document.getElementById('prof-ferry').value;
  userProfile.hotelChainPref = [...document.querySelectorAll('.hotel-chain-pill.selected')].map(b=>b.dataset.value);
  saveData('alfa_user_profile', userProfile);
  // Synkronisér planleggerverdier
  syncProfileToPlanner();
  showToast('✓ Profilen er lagret');
}

function resetUserProfile(){
  if(!confirm('Tilbakestille profilen til standardverdier?')) return;
  userProfile = Object.assign({}, DEFAULT_USER_PROFILE);
  saveData('alfa_user_profile', userProfile);
  loadProfileIntoForm();
  syncProfileToPlanner();
  showToast('Profilen er tilbakestilt');
}

// Synkronisér profil-data til planleggerens UI-felter (hjemmebase, arbeidstid)
function syncProfileToPlanner(){
  const homeEl = document.getElementById('planner-home');
  if(homeEl && userProfile.homeAddress) homeEl.value = userProfile.homeAddress;
  const startEl = document.getElementById('planner-start');
  if(startEl && userProfile.workStart) startEl.value = userProfile.workStart;
  const endEl = document.getElementById('planner-end');
  if(endEl && userProfile.workEnd) endEl.value = userProfile.workEnd;
  // Oppdater kundetelling
  const cnt = document.getElementById('current-customer-count');
  if(cnt) cnt.textContent = getCustomers().length + ' kunder';
}

