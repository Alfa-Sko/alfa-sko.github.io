// ─── PHOTOS (IndexedDB) ──────────────────────────────────────────────────────

let photoDB = null;

function initPhotoDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open('AlfaSkoPhotos',1);
    req.onupgradeneeded = e => { const db=e.target.result; if(!db.objectStoreNames.contains('photos')){db.createObjectStore('photos',{keyPath:'id',autoIncrement:true});}};
    req.onsuccess = e => { photoDB=e.target.result; resolve(photoDB); };
    req.onerror = () => reject(req.error);
  });
}

function savePhotos(visitId, files){
  if(!photoDB||!files||!files.length) return Promise.resolve([]);
  const promises = Array.from(files).map(file=>new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = e => {
      const tx = photoDB.transaction('photos','readwrite');
      const store = tx.objectStore('photos');
      const req = store.add({visitId, name:file.name, data:e.target.result, date:new Date().toISOString()});
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
    reader.readAsDataURL(file);
  }));
  return Promise.all(promises);
}

function getPhotosForVisit(visitId){
  return new Promise((resolve,reject)=>{
    if(!photoDB){ resolve([]); return; }
    const tx = photoDB.transaction('photos','readonly');
    const store = tx.objectStore('photos');
    const all = store.getAll();
    all.onsuccess = () => resolve(all.result.filter(p=>p.visitId===visitId));
    all.onerror = () => resolve([]);
  });
}

function deletePhotosForVisit(visitId){
  if(!photoDB) return;
  const tx = photoDB.transaction('photos','readwrite');
  const store = tx.objectStore('photos');
  const all = store.getAll();
  all.onsuccess = () => { all.result.filter(p=>p.visitId===visitId).forEach(p=>{ store.delete(p.id); }); };
}

// ─── SUPABASE STORAGE UPLOAD ─────────────────────────────────────────────────

// Komprimer ett bilde til ≤maxBytes via Canvas/JPEG.
// Skalerer ned til maks maxWidth px bredde, binærsøk på kvalitet (7 steg ≈ 1/128 presisjon).
function compressImage(file, maxBytes, maxWidth){
  maxBytes = maxBytes || 500*1024;
  maxWidth = maxWidth || 1600;
  return new Promise(function(resolve){
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function(){
      URL.revokeObjectURL(url);
      var scale = Math.min(1, maxWidth/img.width);
      var canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width*scale);
      canvas.height = Math.round(img.height*scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      function tryQ(q){ return new Promise(function(res){ canvas.toBlob(function(b){ res(b); },'image/jpeg',q); }); }
      (async function(){
        var lo=0.10, hi=0.92, best;
        best = await tryQ(hi);
        if(best && best.size<=maxBytes){ resolve(best); return; }
        for(var i=0;i<7;i++){
          var mid=(lo+hi)/2;
          var b=await tryQ(mid);
          if(b && b.size<=maxBytes){ lo=mid; best=b; }
          else hi=mid;
        }
        resolve(best || await tryQ(0.25));
      })();
    };
    img.onerror = function(){ URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// Last opp ett komprimert bilde til Storage-bucketen "besoksbilder".
// Sti: {uid}/{visitId}/{timestamp}_{tilfeldig}.jpg
// Returnerer lagrings-stien som streng.
async function _sbUploadOnePhoto(visitId, file){
  var s = _sbSession();
  if(!s||!s.user) throw new Error('Ikke innlogget');
  var uid = s.user.id;
  var safeName = Date.now()+'_'+Math.random().toString(36).slice(2,7)+'.jpg';
  var segments = [uid, String(visitId), safeName].map(encodeURIComponent);
  var encodedPath = segments.join('/');
  var blob = await compressImage(file);
  var r = await sbFetch('/storage/v1/object/besoksbilder/'+encodedPath,{
    method:'POST',
    headers:{'Content-Type':'image/jpeg'},
    body:blob,
  });
  if(!r.ok) throw new Error('HTTP '+r.status+': '+await r.text());
  return uid+'/'+String(visitId)+'/'+safeName;
}

// Last opp alle bilder for ett besøk til Supabase Storage.
// Returnerer { count, paths } der paths = Storage-stier (varige på tvers av enheter).
// Faller tilbake til IndexedDB-lagring (eksisterende atferd) hvis brukeren ikke er innlogget.
async function sbUploadVisitPhotos(visitId, files){
  if(!files||!files.length) return {count:0, paths:[]};
  if(!window._sbUser){
    var ids = await savePhotos(visitId, files);
    return {count:ids.length, paths:[]};
  }
  var paths=[];
  for(var i=0;i<files.length;i++){
    try{
      var path = await _sbUploadOnePhoto(visitId, files[i]);
      paths.push(path);
    }catch(e){
      console.warn('Foto-opplasting feilet:',files[i].name,e);
    }
  }
  return {count:paths.length, paths:paths};
}
