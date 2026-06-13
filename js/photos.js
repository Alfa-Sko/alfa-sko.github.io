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
