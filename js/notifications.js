// ─── VARSELSENTER ─────────────────────────────────────────────────────────────
// Avhenger av: sbFetch (supabase.js), escapeHtml (utils.js), showToast (ui.js)
// showSection (ui.js), _sharedFollowups/_profName (followups.js)
// _plSeasons/_plLoaded (prisliste.js), followups/TODAY_STR (state.js)
// Brukar IKKJE saveData — varslar lesast/skrivast berre via sbFetch

var _nfTimer    = null;
var _nfPanelOpen = false;
var NF_READS_TABLE = '/rest/v1/notification_reads';

// ─────────────────────────────────────────────────────────────────────────────
// 1. BYGG VARSEL-ARRAY
// ─────────────────────────────────────────────────────────────────────────────
async function nfBuildNotifs() {
  if (!window._sbUser) return [];
  var myUid   = window._sbUser.id;
  var myEmail = (window._sbUser.email || '').toLowerCase();
  var today   = (typeof TODAY_STR !== 'undefined') ? TODAY_STR : new Date().toISOString().slice(0, 10);
  var cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  var cutoff7  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString();
  var notifs = [];

  // ── #1 + #2: Kommentarar/reaksjonar på mine oppføringer ──────────────────
  try {
    var r = await sbFetch(
      '/rest/v1/entry_comments'
        + '?target_owner=eq.' + myUid
        + '&author_id=neq.'   + myUid
        + '&created_at=gte.'  + encodeURIComponent(cutoff30)
        + '&order=created_at.desc&limit=50',
      {method: 'GET'}
    );
    if (r.ok) {
      var ecRows = await r.json();
      (ecRows || []).forEach(function(row) {
        var kind = row.target_type === 'free_note' ? 'free' : row.target_type === 'cust_photo' ? 'custphoto' : 'activity';
        if (row.kind === 'comment') {
          notifs.push({
            key:     'c:' + row.id,
            icon:    '💬',
            text:    escapeHtml(row.author_name || 'Nokon') + ' kommenterte notatet ditt',
            ts:      row.created_at,
            nav:     'tidslinje',
            entryId: 'tl-entry-' + kind + '-' + row.target_id
          });
        } else if (row.kind === 'reaction') {
          notifs.push({
            key:     'r:' + row.id,
            icon:    row.text || '👍',
            text:    escapeHtml(row.author_name || 'Nokon') + ' reagerte på notatet ditt',
            ts:      row.created_at,
            nav:     'tidslinje',
            entryId: 'tl-entry-' + kind + '-' + row.target_id
          });
        }
      });
    } else {
      console.warn('[nf] entry_comments HTTP', r.status, '— tabell finst kanskje ikkje enno');
    }
  } catch(e) { console.error('[nf] entry_comments feil:', e); }

  // ── #3 + #4: Delte oppfølgingar ──────────────────────────────────────────
  var shared = (typeof _sharedFollowups !== 'undefined') ? _sharedFollowups : [];
  shared.forEach(function(f) {
    var swArr    = Array.isArray(f.shared_with) ? f.shared_with : [];
    var iAmShared = swArr.indexOf(myUid) !== -1;
    var iAmOwner  = f.owner_id === myUid;

    // #3: Delt med meg (eg er ikkje eigar)
    if (iAmShared && !iAmOwner && !f.done) {
      notifs.push({
        key:  's:' + f.id,
        icon: '👥',
        text: escapeHtml((typeof _profName === 'function') ? _profName(f.owner_id) : (f.owner_id||'').slice(0,8)+'…')
              + ' delte en oppfølging med deg: ' + escapeHtml(f.task || ''),
        ts:   f.updated_at || (today + 'T00:00:00.000Z'),
        nav:  'oppfolging'
      });
    }

    // #4: Fullført av nokon annan (eg er eigar eller deltar)
    if (f.done && f.done_by && f.done_by !== myUid && (iAmOwner || iAmShared)) {
      var doneTs = f.updated_at || (today + 'T00:00:00.000Z');
      if (doneTs >= cutoff30) {
        notifs.push({
          key:  'd:' + f.id,
          icon: '✅',
          text: escapeHtml((typeof _profName === 'function') ? _profName(f.done_by) : (f.done_by||'').slice(0,8)+'…')
                + ' fullførte: ' + escapeHtml(f.task || ''),
          ts:   doneTs,
          nav:  'oppfolging'
        });
      }
    }
  });

  // ── #5 + #6: Forfaller i dag og forfalt ──────────────────────────────────
  var allFu = [];
  if (typeof followups !== 'undefined') { followups.forEach(function(f) { allFu.push(f); }); }
  shared.forEach(function(f) {
    var swArr = Array.isArray(f.shared_with) ? f.shared_with : [];
    if (f.owner_id === myUid || swArr.indexOf(myUid) !== -1) allFu.push(f);
  });
  var overdueCount = 0;
  allFu.forEach(function(f) {
    if (f.done) return;
    if (f.due === today) {
      notifs.push({
        key:  'due:' + f.id + ':' + today,
        icon: '⏰',
        text: 'Forfaller i dag: ' + escapeHtml(f.task || '') + (f.customer ? ' – ' + escapeHtml(f.customer) : ''),
        ts:   today + 'T08:00:00.000Z',
        nav:  'oppfolging'
      });
    } else if (f.due && f.due < today) {
      overdueCount++;
    }
  });
  if (overdueCount > 0) {
    notifs.push({
      key:  'overdue:' + today,
      icon: '⚠️',
      text: overdueCount + ' oppfølging' + (overdueCount === 1 ? '' : 'ar') + ' er forfalt',
      ts:   today + 'T07:00:00.000Z',
      nav:  'oppfolging'
    });
  }

  // ── #7: Ny prisliste (berre om allereie lasta) ────────────────────────────
  if (typeof _plLoaded !== 'undefined' && _plLoaded && typeof _plSeasons !== 'undefined') {
    Object.keys(_plSeasons).forEach(function(k) {
      var pl = _plSeasons[k];
      if (!pl || !pl.uploadedAt || pl.uploadedAt < cutoff7) return;
      var upBy = (pl.uploadedBy || '').toLowerCase();
      if (upBy === myEmail || upBy === myUid) return;
      notifs.push({
        key:  'pl:' + (pl.season || k),
        icon: '📋',
        text: 'Ny prisliste: ' + escapeHtml(pl.season || k),
        ts:   pl.uploadedAt,
        nav:  'prisliste'
      });
    });
  }

  notifs.sort(function(a, b) { return (b.ts || '').localeCompare(a.ts || ''); });
  return notifs.slice(0, 20);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HENT LEST-NØKLAR (batch)
// ─────────────────────────────────────────────────────────────────────────────
async function nfFetchReadKeys(keys) {
  if (!window._sbUser || !keys || !keys.length) return {};
  var inClause = keys.map(function(k) { return '"' + k.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }).join(',');
  try {
    var r = await sbFetch(
      NF_READS_TABLE + '?user_id=eq.' + window._sbUser.id + '&notif_key=in.(' + inClause + ')&select=notif_key',
      {method: 'GET'}
    );
    if (!r.ok) {
      console.warn('[nf] notification_reads HTTP', r.status, '— tabell finst kanskje ikkje enno');
      return {};
    }
    var rows = await r.json();
    var map = {};
    (rows || []).forEach(function(row) { map[row.notif_key] = true; });
    return map;
  } catch(e) { console.error('[nf] nfFetchReadKeys feil:', e); return {}; }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MARKER LEST (éin)
// ─────────────────────────────────────────────────────────────────────────────
function nfMarkRead(key) {
  if (!window._sbUser) return;
  sbFetch(NF_READS_TABLE, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Prefer': 'return=minimal,resolution=ignore-duplicates'},
    body: JSON.stringify({user_id: window._sbUser.id, notif_key: key})
  }).catch(function(e) { console.error('[nf] nfMarkRead feil:', e); });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MARKER ALLE SOM LEST
// ─────────────────────────────────────────────────────────────────────────────
async function nfMarkAllRead() {
  if (!window._sbUser || !window._nfLastNotifs || !window._nfLastReadMap) return;
  var myUid = window._sbUser.id;
  var toInsert = window._nfLastNotifs
    .filter(function(n) { return !window._nfLastReadMap[n.key]; })
    .map(function(n) { return {user_id: myUid, notif_key: n.key}; });
  if (!toInsert.length) return;
  try {
    var r = await sbFetch(NF_READS_TABLE, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Prefer': 'return=minimal,resolution=ignore-duplicates'},
      body: JSON.stringify(toInsert)
    });
    if (!r.ok) {
      var errTxt = ''; try { errTxt = await r.text(); } catch(_) {}
      console.error('[nf] nfMarkAllRead HTTP', r.status, errTxt);
      showToast('Kunne ikkje merke som lest (HTTP ' + r.status + ')');
      return;
    }
    window._nfLastNotifs.forEach(function(n) { window._nfLastReadMap[n.key] = true; });
    nfRenderPanel(window._nfLastNotifs, window._nfLastReadMap);
    nfUpdateBadge(0);
    showToast('Alle varsler merka som lest');
  } catch(e) { console.error('[nf] nfMarkAllRead feil:', e); showToast('Feil ved merking: ' + (e.message || e)); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RELATIV TID
// ─────────────────────────────────────────────────────────────────────────────
function nfRelTime(ts) {
  if (!ts) return '';
  var d    = new Date(ts.length <= 10 ? ts + 'T12:00:00Z' : ts);
  var diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 90)     return 'Akkurat nå';
  if (diff < 3600)   return Math.floor(diff / 60)    + ' min siden';
  if (diff < 86400)  return Math.floor(diff / 3600)  + ' t siden';
  if (diff < 604800) return Math.floor(diff / 86400) + ' d siden';
  return d.toLocaleDateString('no-NO', {day: '2-digit', month: 'short'});
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. OPPDATER BADGE
// ─────────────────────────────────────────────────────────────────────────────
function nfUpdateBadge(count) {
  var badge = document.getElementById('notif-badge');
  var wrap  = document.getElementById('notif-bell-wrap');
  if (!badge || !wrap) return;
  wrap.style.display = window._sbUser ? 'flex' : 'none';
  if (count > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent   = count > 9 ? '9+' : String(count);
  } else {
    badge.style.display = 'none';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RENDER PANEL
// ─────────────────────────────────────────────────────────────────────────────
function nfRenderPanel(notifs, readMap) {
  var panel = document.getElementById('notif-panel');
  if (!panel) return;
  var unread = notifs.filter(function(n) { return !readMap[n.key]; }).length;

  var hdr = '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px 8px;border-bottom:1px solid #EEEDEA;position:sticky;top:0;background:#fff;z-index:1">'
    + '<div style="font-size:14px;font-weight:700;color:#2C2C2A">🔔 Varsler'
    + (unread > 0 ? ' <span style="font-size:11px;font-weight:700;background:#D85A30;color:#fff;border-radius:99px;padding:1px 6px;vertical-align:middle">' + unread + '</span>' : '')
    + '</div>'
    + (unread > 0 ? '<button onclick="nfMarkAllRead()" style="border:none;background:none;color:#0C447C;font-size:12px;cursor:pointer;padding:2px 0;font-weight:500">Merk alle lest</button>' : '')
    + '</div>';

  if (!notifs.length) {
    panel.innerHTML = hdr + '<div style="padding:24px 14px;font-size:13px;color:#888780;text-align:center">Ingen varsler siste 30 dager</div>';
    return;
  }

  var items = notifs.map(function(n) {
    var isRead  = !!readMap[n.key];
    var safeCid = n.key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var safeEid = (n.entryId || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var bg  = isRead ? '#fff' : '#F0F6FB';
    var fw  = isRead ? '400'  : '600';
    var dot = isRead ? '' : '<div style="width:7px;height:7px;border-radius:50%;background:#D85A30;flex-shrink:0;margin-top:5px"></div>';
    return '<div onclick="nfHandleClick(\'' + safeCid + '\',\'' + n.nav + '\',\'' + safeEid + '\')"'
      + ' style="display:flex;gap:10px;align-items:flex-start;padding:11px 14px;cursor:pointer;background:' + bg + ';border-bottom:1px solid #EEEDEA"'
      + ' onmouseover="this.style.background=\'#EEF4FB\'" onmouseout="this.style.background=\'' + bg + '\'">'
      + '<div style="font-size:16px;flex-shrink:0;margin-top:1px">' + n.icon + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:' + fw + ';color:#2C2C2A;line-height:1.4">' + n.text + '</div>'
      + '<div style="font-size:11px;color:#888780;margin-top:2px">' + nfRelTime(n.ts) + '</div>'
      + '</div>'
      + dot
      + '</div>';
  }).join('');

  panel.innerHTML = hdr + items;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. KLIKK-HANDTERING: marker lest + naviger + scroll/highlight
// ─────────────────────────────────────────────────────────────────────────────
function nfHandleClick(notifKey, navTarget, entryId) {
  nfClosePanel();
  nfMarkRead(notifKey);
  if (window._nfLastReadMap) window._nfLastReadMap[notifKey] = true;
  var unread = window._nfLastNotifs
    ? window._nfLastNotifs.filter(function(n) { return !window._nfLastReadMap[n.key]; }).length
    : 0;
  nfUpdateBadge(unread);

  if (navTarget === 'tidslinje') {
    showSection('tidslinje', document.querySelector('.nav-item[onclick*="tidslinje"]'));
    if (entryId) {
      setTimeout(function() {
        var el = document.getElementById(entryId);
        if (!el) return;
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
        var origOutline = el.style.outline;
        var origBorderRadius = el.style.borderRadius;
        el.style.outline = '2.5px solid #0C447C';
        el.style.borderRadius = '10px';
        setTimeout(function() {
          el.style.outline = origOutline;
          el.style.borderRadius = origBorderRadius;
        }, 2500);
      }, 420);
    }
  } else if (navTarget === 'oppfolging') {
    showSection('oppfolging', document.querySelector('.nav-item[onclick*="oppfolging"]'));
  } else if (navTarget === 'prisliste') {
    showSection('prisliste', document.querySelector('.nav-item[onclick*="prisliste"]'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PANEL OPEN / LUKK / TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function nfTogglePanel() {
  var panel = document.getElementById('notif-panel');
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.style.display) {
    nfOpenPanel();
  } else {
    nfClosePanel();
  }
}

function nfOpenPanel() {
  var panel = document.getElementById('notif-panel');
  var btn   = document.getElementById('notif-bell-btn');
  if (!panel || !btn) return;
  // Posisjonar dynamisk under bjelle-knappen
  var rect = btn.getBoundingClientRect();
  panel.style.top   = (rect.bottom + 6) + 'px';
  panel.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
  panel.style.display = 'block';
  window._nfPanelOpen = true;
  if (window._nfLastNotifs && window._nfLastReadMap) {
    nfRenderPanel(window._nfLastNotifs, window._nfLastReadMap);
  } else {
    nfRefresh();
  }
  setTimeout(function() {
    document.addEventListener('click', nfOutsideClose, {once: true});
  }, 50);
}

function nfClosePanel() {
  var panel = document.getElementById('notif-panel');
  if (panel) panel.style.display = 'none';
  window._nfPanelOpen = false;
}

function nfOutsideClose(e) {
  var panel = document.getElementById('notif-panel');
  var btn   = document.getElementById('notif-bell-btn');
  if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
    nfClosePanel();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HOVUDFUNKSJON: hent + les status + oppdater UI
// ─────────────────────────────────────────────────────────────────────────────
async function nfRefresh() {
  if (!window._sbUser) return;
  try {
    var notifs  = await nfBuildNotifs();
    var keys    = notifs.map(function(n) { return n.key; });
    var readMap = await nfFetchReadKeys(keys);
    window._nfLastNotifs  = notifs;
    window._nfLastReadMap = readMap;
    var unread = notifs.filter(function(n) { return !readMap[n.key]; }).length;
    nfUpdateBadge(unread);
    if (window._nfPanelOpen) nfRenderPanel(notifs, readMap);
  } catch(e) { console.error('[nf] nfRefresh feil:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. INIT (kalles etter innlogging)
// ─────────────────────────────────────────────────────────────────────────────
function nfInit() {
  if (!window._sbUser) return;
  // Kort forsinkelse for å la shared_followups laste frå sbPullAll
  setTimeout(nfRefresh, 2500);
  if (window._nfTimer) clearInterval(window._nfTimer);
  window._nfTimer = setInterval(nfRefresh, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window._sbUser) nfRefresh();
  });
}
