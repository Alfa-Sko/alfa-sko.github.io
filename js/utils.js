function loadData(key, def){ if(window._DEMO_ACTIVE && key && key.startsWith('alfa_')) return def; try{ const d=localStorage.getItem(key); return d?JSON.parse(d):def; }catch(e){ return def; } }

function calculateNorwegianHolidays(year){
  const out = {};
  // Faste helligdager
  out[year+'-01-01'] = 'Første nyttårsdag';
  out[year+'-05-01'] = 'Arbeidernes dag';
  out[year+'-05-17'] = 'Grunnlovsdag';
  out[year+'-12-25'] = '1. juledag';
  out[year+'-12-26'] = '2. juledag';
  // Påskedag (Gauss/Meeus-algoritmen)
  const a = year % 19;
  const b = Math.floor(year/100);
  const c = year % 100;
  const d = Math.floor(b/4);
  const e = b % 4;
  const f = Math.floor((b+8)/25);
  const g = Math.floor((b-f+1)/3);
  const h = (19*a + b - d - g + 15) % 30;
  const i = Math.floor(c/4);
  const k = c % 4;
  const L = (32 + 2*e + 2*i - h - k) % 7;
  const m = Math.floor((a + 11*h + 22*L)/451);
  const month = Math.floor((h + L - 7*m + 114)/31);
  const day = ((h + L - 7*m + 114) % 31) + 1;
  const easter = new Date(year, month-1, day);
  function fmt(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
  out[fmt(addDays(easter,-3))] = 'Skjærtorsdag';
  out[fmt(addDays(easter,-2))] = 'Langfredag';
  out[fmt(easter)] = 'Første påskedag';
  out[fmt(addDays(easter,1))] = 'Andre påskedag';
  out[fmt(addDays(easter,39))] = 'Kristi himmelfartsdag';
  out[fmt(addDays(easter,49))] = 'Første pinsedag';
  out[fmt(addDays(easter,50))] = 'Andre pinsedag';
  return out;
}

// Cache helligdager for nåværende + neste år
const HOLIDAYS = (function(){
  const now = new Date();
  const y = now.getFullYear();
  return Object.assign(
    calculateNorwegianHolidays(y-1),
    calculateNorwegianHolidays(y),
    calculateNorwegianHolidays(y+1),
    calculateNorwegianHolidays(y+2)
  );
})();

function getHolidayName(dateKey){
  return HOLIDAYS[dateKey] || null;
}

// Sjekk om en dato er registrert som fridag/ferie
function getPersonalDay(dateKey){
  return personalDays.find(d=>d.date===dateKey) || null;
}

function mb(j){ return j===0?6:j-1; }
function dk(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
function isToday(y,m,d){ return dk(y,m,d)===TODAY_STR; }

function escapeHtml(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function _icsHash(str){ let h=0; for(let i=0;i<str.length;i++){ h=((h<<5)-h+str.charCodeAt(i))|0; } return (h>>>0).toString(36); }
function _icsPad(n){ return String(n).padStart(2,'0'); }
function _icsEscape(s){ return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'); }
function _icsFold(line){
  if(line.length<=74) return line;
  let out=line.slice(0,74); let rest=line.slice(74);
  while(rest.length>73){ out+='\r\n '+rest.slice(0,73); rest=rest.slice(73); }
  out+='\r\n '+rest; return out;
}
function _icsLocalDT(dateKey, mins){
  const p=dateKey.split('-');
  const h=Math.floor(mins/60), m=mins%60;
  return p[0]+p[1]+p[2]+'T'+_icsPad(h)+_icsPad(m)+'00';
}

function rkFormatKr(n){
  if(isNaN(n) || !isFinite(n)) return '–';
  return Math.round(n).toLocaleString('no-NO')+' kr';
}
function rkFormatKalk(n){
  if(isNaN(n) || !isFinite(n)) return '–';
  return n.toFixed(3).replace('.',',');
}

function normalizeColName(s){
  return String(s||'').toLowerCase().trim()
    .replace(/[æå]/g,'a').replace(/ø/g,'o')
    .replace(/[^a-z0-9]/g,'');
}

const COL_ALIASES = {
  name: ['navn','kunde','kundenavn','customer','customername','name'],
  city: ['by','sted','poststed','kommune','city','town'],
  chain: ['kjede','butikkjede','konsern','chain'],
  l12: ['l12','omsetning','salg','omsetningl12','omsl12','omsetningsiste12'],
  budget: ['budsjett','budget','mal','maal','target'],
  concept: ['konsept','concept','konseptype'],
  class: ['klasse','class','kundeklasse','abc'],
  priority: ['prioritet','priority'],
  note: ['notat','note','kommentar','beskrivelse','notes'],
  id: ['id','kundeid','nr','nummer'],
};

function findColIdx(headers, fieldKey){
  const norm = headers.map(normalizeColName);
  const aliases = COL_ALIASES[fieldKey]||[];
  for(const a of aliases){
    const idx = norm.indexOf(a);
    if(idx>=0) return idx;
  }
  // Partial match
  for(let i=0;i<norm.length;i++){
    for(const a of aliases){
      if(norm[i].includes(a)) return i;
    }
  }
  return -1;
}

function nok(n){ return n ? Math.round(n/1000)+'k' : '–'; }

function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function fmtKr(n){
  n=Math.round(n||0);
  return n.toLocaleString('no-NO')+' kr';
}
function fmtDur(min){
  min=Math.round(min||0);
  const h=Math.floor(min/60), m=min%60;
  return h>0 ? (h+'t '+(m>0?m+'min':'')).trim() : m+'min';
}

function rpFmtTime(mins){
  mins=((mins%1440)+1440)%1440;
  return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
}
function rpAddDays(dateStr, n){
  const d=new Date(dateStr+'T00:00:00');
  d.setDate(d.getDate()+n);
  return d;
}
function rpDateLabel(d){
  const days=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const mon=['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
  return days[d.getDay()]+' '+d.getDate()+'. '+mon[d.getMonth()];
}

function rpDateLabelFull(d){
  const days=['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
  const mon=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
  return days[d.getDay()]+' '+d.getDate()+'. '+mon[d.getMonth()];
}

function roundTo30(min){ return Math.floor(min/30)*30; }
// Rund opp til nærmeste halvtime
function roundUpTo30(min){ return Math.ceil(min/30)*30; }

