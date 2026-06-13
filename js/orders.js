// ─── ORDRESTATUS ─────────────────────────────────────────────────────────────

function osLoad(){ return JSON.parse(localStorage.getItem('alfa_ordrestatus')||'{}'); }
function osSave(data){ localStorage.setItem('alfa_ordrestatus', JSON.stringify(data)); }

const OS_SEASONS = ['SS26','AW26','SS27','AW27','SS28'];
const OS_ICONS   = {done:'🟢',pending:'🟡',none:'🔴',unset:'⚪'};
const OS_NAMES   = {done:'Bekreftet',pending:'Venter',none:'Ingen ordre',unset:'Ikke satt'};
const OS_NEXT    = {unset:'done',done:'pending',pending:'none',none:'unset'};

function osRender(customerId, container){
  const all=osLoad();
  const cdata=all[customerId]||{};
  container.innerHTML='<div class="os-label">Ordrestatus per sesong</div><div class="os-grid">'+OS_SEASONS.map(s=>{const st=cdata[s]||'unset';return '<div class="os-pill '+st+'" onclick="osToggle(\''+customerId+'\',\''+s+'\')" title="'+OS_NAMES[st]+'">'+OS_ICONS[st]+' '+s+'</div>';}).join('')+'</div>';
}

function osToggle(customerId, season){
  const all=osLoad();
  if(!all[customerId]) all[customerId]={};
  const cur=all[customerId][season]||'unset';
  all[customerId][season]=OS_NEXT[cur];
  osSave(all);
  document.querySelectorAll('[data-os-customer="'+customerId+'"]').forEach(el=>osRender(customerId,el));
  showToast(season+': '+OS_NAMES[OS_NEXT[cur]]);
}

function osWidget(customerId){
  const div=document.createElement('div');
  div.className='os-section';
  div.setAttribute('data-os-customer',customerId);
  osRender(customerId,div);
  return div;
}




