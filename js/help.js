// ─── HJELPESENTER ────────────────────────────────────────────────────────────
// Innhold er i help-content.js (HELP_CONTENT). Legg til artikler der.

let _helpQ = '';
let _helpCat = null;   // åpen kategori-indeks (null = kategori-liste)
let _helpOpenId = null; // åpen artikkel: "catIdx:artIdx" eller null

function renderHelp(){
  const sec = document.getElementById('sec-hjelp');
  if(!sec) return;
  const totalArt = HELP_CONTENT.reduce(function(n,k){ return n+k.artikler.length; }, 0);

  let html = '<div style="max-width:660px;margin:0 auto;padding-bottom:40px">';

  // Topptekst
  html += '<div style="margin-bottom:18px">';
  html += '<div style="font-size:20px;font-weight:700;color:#2C2C2A;margin-bottom:3px">Hjelpesenter</div>';
  html += '<div style="font-size:12px;color:#888780">'+totalArt+' artikler i '+HELP_CONTENT.length+' kategorier</div>';
  html += '</div>';

  // Søkefelt
  html += '<div style="position:relative;margin-bottom:20px">';
  html += '<input type="search" id="help-search" value="'+escapeHtml(_helpQ)+'" oninput="_helpOnSearch(this.value)" placeholder="Søk i hjelpeartikler…" autocomplete="off" autocorrect="off" spellcheck="false" style="width:100%;padding:11px 40px 11px 40px;border:1.5px solid #D3D1C7;border-radius:10px;font-size:14px;box-sizing:border-box;font-family:inherit;color:#2C2C2A;background:#fff;-webkit-appearance:none">';
  html += '<span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none">🔍</span>';
  if(_helpQ){
    html += '<button onclick="_helpClear()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;color:#888780;padding:4px;line-height:1">×</button>';
  }
  html += '</div>';

  // Innholdsområde
  if(_helpQ.trim()){
    html += _helpBuildSearch(_helpQ.trim());
  } else if(_helpCat !== null){
    html += _helpBuildCategory(_helpCat);
  } else {
    html += _helpBuildList();
  }

  html += '</div>';
  sec.innerHTML = html;

  // Gjenopprett fokus i søkefeltet uten å flytte markøren
  const qEl = document.getElementById('help-search');
  if(qEl && _helpQ){ qEl.focus(); try{ qEl.setSelectionRange(_helpQ.length,_helpQ.length); }catch(e){} }
}

function _helpOnSearch(val){
  _helpQ = val;
  _helpCat = null;
  _helpOpenId = null;
  renderHelp();
}

function _helpClear(){
  _helpQ = '';
  _helpOpenId = null;
  renderHelp();
  const q = document.getElementById('help-search');
  if(q) q.focus();
}

function _helpOpenCategory(idx){
  _helpCat = idx;
  _helpOpenId = null;
  renderHelp();
}

function _helpBack(){
  _helpCat = null;
  _helpOpenId = null;
  renderHelp();
}

function _helpToggle(catIdx, artIdx){
  const key = catIdx+':'+artIdx;
  _helpOpenId = (_helpOpenId === key) ? null : key;
  renderHelp();
  if(_helpOpenId){
    setTimeout(function(){
      const el = document.getElementById('help-a-'+catIdx+'-'+artIdx);
      if(el) el.scrollIntoView({behavior:'smooth', block:'nearest'});
    }, 60);
  }
}

// ─── BYGGERE ─────────────────────────────────────────────────────────────────

function _helpBuildList(){
  let html = '<div style="display:flex;flex-direction:column;gap:8px">';
  HELP_CONTENT.forEach(function(kat, i){
    html += '<div onclick="_helpOpenCategory('+i+')" style="display:flex;align-items:center;gap:14px;background:#F8F7F3;border:1.5px solid #D3D1C7;border-radius:12px;padding:14px 16px;cursor:pointer">';
    html += '<span style="font-size:26px;line-height:1;flex-shrink:0">'+kat.icon+'</span>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:14px;font-weight:700;color:#2C2C2A">'+escapeHtml(kat.kategori)+'</div>';
    html += '<div style="font-size:12px;color:#888780;margin-top:2px">'+kat.artikler.length+' artikler</div>';
    html += '</div>';
    html += '<span style="color:#888780;font-size:20px;line-height:1;flex-shrink:0">›</span>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _helpBuildCategory(catIdx){
  const kat = HELP_CONTENT[catIdx];
  if(!kat) return '';
  let html = '';
  html += '<button onclick="_helpBack()" style="background:none;border:none;cursor:pointer;color:#0C447C;font-size:13px;font-weight:600;padding:0;margin-bottom:16px;display:flex;align-items:center;gap:5px">&#8592; Alle kategorier</button>';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  html += '<span style="font-size:22px">'+kat.icon+'</span>';
  html += '<div style="font-size:16px;font-weight:700;color:#2C2C2A">'+escapeHtml(kat.kategori)+'</div>';
  html += '</div>';
  html += _helpBuildAccordion(kat.artikler, catIdx);
  return html;
}

function _helpBuildSearch(query){
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = [];
  HELP_CONTENT.forEach(function(kat, ci){
    kat.artikler.forEach(function(art, ai){
      const hay = (art.tittel+' '+art.svar).toLowerCase();
      if(words.every(function(w){ return hay.includes(w); })){
        results.push({kat: kat.kategori, icon: kat.icon, ci: ci, ai: ai, tittel: art.tittel, svar: art.svar});
      }
    });
  });

  if(!results.length){
    return '<div style="text-align:center;padding:48px 20px;color:#888780">'
      +'<div style="font-size:36px;margin-bottom:12px">🔍</div>'
      +'<div style="font-size:14px;font-weight:600;color:#5F5E5A">Ingen treff for «'+escapeHtml(query)+'»</div>'
      +'<div style="font-size:12px;margin-top:6px">Prøv et annet søkeord, eller bla i kategoriene.</div>'
      +'</div>';
  }

  let html = '<div style="font-size:12px;color:#888780;margin-bottom:12px">'+results.length+' treff</div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  results.forEach(function(r){
    const key = r.ci+':'+r.ai;
    const isOpen = _helpOpenId === key;
    html += '<div id="help-a-'+r.ci+'-'+r.ai+'" style="border:1.5px solid '+(isOpen?'#B8D4E8':'#D3D1C7')+';border-radius:10px;overflow:hidden;background:'+(isOpen?'#F0F7FE':'#fff')+'">';
    html += '<div onclick="_helpToggle('+r.ci+','+r.ai+')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer">';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:13px;font-weight:600;color:#2C2C2A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHtml(r.tittel)+'</div>';
    html += '<div style="font-size:11px;color:#888780;margin-top:2px">'+r.icon+' '+escapeHtml(r.kat)+'</div>';
    html += '</div>';
    html += '<span style="color:#888780;font-size:16px;flex-shrink:0;transform:'+(isOpen?'rotate(90deg)':'')+'">›</span>';
    html += '</div>';
    if(isOpen){
      html += '<div style="padding:0 14px 14px;border-top:1px solid #D3D1C7">'+_helpSvarHtml(r.svar)+'</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _helpBuildAccordion(artikler, catIdx){
  let html = '<div style="display:flex;flex-direction:column;gap:8px">';
  artikler.forEach(function(art, ai){
    const key = catIdx+':'+ai;
    const isOpen = _helpOpenId === key;
    html += '<div id="help-a-'+catIdx+'-'+ai+'" style="border:1.5px solid '+(isOpen?'#B8D4E8':'#D3D1C7')+';border-radius:10px;overflow:hidden;background:'+(isOpen?'#F0F7FE':'#fff')+'">';
    html += '<div onclick="_helpToggle('+catIdx+','+ai+')" style="display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer">';
    html += '<div style="font-size:13px;font-weight:600;color:#2C2C2A;flex:1">'+escapeHtml(art.tittel)+'</div>';
    html += '<span style="color:#888780;font-size:16px;flex-shrink:0;transition:transform 0.15s;transform:'+(isOpen?'rotate(90deg)':'')+'">&rsaquo;</span>';
    html += '</div>';
    if(isOpen){
      html += '<div style="padding:0 16px 14px;border-top:1px solid #D3D1C7">'+_helpSvarHtml(art.svar)+'</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _helpSvarHtml(svar){
  // Del opp i avsnitt (dobbelt linjeskift)
  const paragraphs = svar.split(/\n\n+/);
  let html = '';
  paragraphs.forEach(function(para){
    const lines = para.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    if(!lines.length) return;
    const allNumbered = lines.every(function(l){ return /^\d+\./.test(l); });
    if(allNumbered){
      html += '<ol style="margin:10px 0 4px;padding-left:20px;line-height:1.75;color:#2C2C2A;font-size:13px">';
      html += lines.map(function(l){
        return '<li style="margin-bottom:3px">'+escapeHtml(l.replace(/^\d+\.\s*/,''))+'</li>';
      }).join('');
      html += '</ol>';
    } else {
      html += '<p style="margin:10px 0 4px;line-height:1.75;color:#2C2C2A;font-size:13px">';
      html += lines.map(escapeHtml).join('<br>');
      html += '</p>';
    }
  });
  return html;
}
