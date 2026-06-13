// ─── RABATTKALKULATOR ───────────────────────────────────────────────────────

function rkSetDiscount(pct){
  document.getElementById('rk-discount').value = pct;
  // Marker aktiv pill
  document.querySelectorAll('.rk-discount-pill').forEach(p=>p.classList.remove('active'));
  const pill = [...document.querySelectorAll('.rk-discount-pill')].find(p=>p.textContent.trim()===pct+'%');
  if(pill) pill.classList.add('active');
  rkCalculate();
}


function rkCalculate(){
  const veil = parseFloat(document.getElementById('rk-veil').value)||0;
  const baseKalk = parseFloat(document.getElementById('rk-base-kalk').value)||1.855;
  const discount = parseFloat(document.getElementById('rk-discount').value)||0;

  const results = document.getElementById('rk-results');
  if(veil<=0 || baseKalk<=0){
    results.innerHTML = '<div style="text-align:center;padding:20px;color:#888780;font-style:italic">Tast inn veiledende pris for å se beregningen</div>';
    return;
  }

  // Listepris (grossist, ekskl. mva) = veil / baseKalk
  const listePris = veil / baseKalk;
  // Sluttpris (det kunden faktisk betaler etter rabatt)
  const discountFactor = 1 - discount/100;
  const sluttPris = listePris * discountFactor;
  // Ny kalkyle = veil / sluttpris = baseKalk / (1 - rabatt)
  const nyKalk = veil / sluttPris;
  // Mva-andel av veil pris (25%)
  const mvaSats = 0.25;
  const veilExMva = veil / (1 + mvaSats);
  // Butikkens brutto dekningsbidrag (kr og %)
  const dbKr = veilExMva - sluttPris;
  const dbPct = veilExMva>0 ? (dbKr/veilExMva*100) : 0;
  // Rabattbeløp
  const rabattKr = listePris - sluttPris;

  let html = '';
  // Hovedresultat: ny kalkyle og sluttpris
  html += '<div style="background:#fff;border:1px solid #B8D4E8;border-radius:10px;padding:14px">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  html += '<div><div style="font-size:10px;color:#0C447C;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Sluttpris til kunde</div><div style="font-size:24px;font-weight:700;color:#0C447C">'+rkFormatKr(sluttPris)+'</div><div style="font-size:11px;color:#5F5E5A;margin-top:2px">Pris butikken betaler (ekskl. mva)</div></div>';
  html += '<div><div style="font-size:10px;color:#0C447C;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Ny kalkyle</div><div style="font-size:24px;font-weight:700;color:#0C447C">'+rkFormatKalk(nyKalk)+'</div><div style="font-size:11px;color:#5F5E5A;margin-top:2px">'+rkFormatKalk(baseKalk)+' ÷ '+(discountFactor.toFixed(2).replace('.',','))+'</div></div>';
  html += '</div></div>';

  // Detaljer
  html += '<div style="background:#fff;border:1px solid #D3D1C7;border-radius:10px;padding:14px">';
  html += '<div style="font-size:11px;color:#888780;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px">Detaljer</div>';
  html += '<div style="display:grid;gap:8px;font-size:13px">';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1EFE8"><span>Veiledende pris inkl. mva</span><span style="font-weight:600">'+rkFormatKr(veil)+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1EFE8;color:#5F5E5A"><span>Mva (25%)</span><span>'+rkFormatKr(veil-veilExMva)+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1EFE8;color:#5F5E5A"><span>Veil. pris ekskl. mva</span><span>'+rkFormatKr(veilExMva)+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1EFE8"><span>Listepris (grossist, '+rkFormatKalk(baseKalk)+')</span><span style="font-weight:600">'+rkFormatKr(listePris)+'</span></div>';
  if(discount>0){
    html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1EFE8;color:#A23B27"><span>− Rabatt ('+discount.toString().replace('.',',')+'%)</span><span style="font-weight:600">−'+rkFormatKr(rabattKr)+'</span></div>';
  }
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #2C2C2A;font-weight:700"><span>Sluttpris til kunde</span><span style="color:#0C447C">'+rkFormatKr(sluttPris)+'</span></div>';
  html += '</div></div>';

  // Butikkens margin
  html += '<div style="background:#FAEEDA;border:1px solid #E6D9B8;border-radius:10px;padding:14px">';
  html += '<div style="font-size:11px;color:#6D4C00;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px">💰 Butikkens bruttomargin</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  html += '<div><div style="font-size:10px;color:#6D4C00;font-weight:700">Dekningsbidrag</div><div style="font-size:18px;font-weight:700;color:#2C2C2A">'+rkFormatKr(dbKr)+'</div></div>';
  html += '<div><div style="font-size:10px;color:#6D4C00;font-weight:700">DB-grad</div><div style="font-size:18px;font-weight:700;color:#2C2C2A">'+dbPct.toFixed(1).replace('.',',')+'%</div></div>';
  html += '</div></div>';

  results.innerHTML = html;
}






