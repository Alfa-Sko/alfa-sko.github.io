// ─── KOMMENTARAR OG REAKSJONAR (entry_comments) ─────────────────────────────
// Avhenger av: sbFetch (supabase.js), escapeHtml (utils.js), showToast (ui.js)
// Brukar IKKJE saveData eller _roGuard — kommentarar er alltid eigne data

var EC_REACTIONS = ['👍', '❤️', '😂', '😮', '👏'];
var EC_TABLE = '/rest/v1/entry_comments';

function ecTargetType(it) {
  if (it.kind === 'free')      return 'free_note';
  if (it.kind === 'custphoto') return 'cust_photo';
  return 'visit';
}

// Batch-hent alle kommentarar/reaksjonar for ei liste av oppføringer.
// Returnerer objekt nøkla med "targetType::targetId" → [rows]
async function ecFetchBatch(entries, ownerUid) {
  if (!window._sbUser || !entries || !entries.length) return {};
  ownerUid = ownerUid || window._sbUser.id;
  var ids = [];
  entries.forEach(function(e){ if (e.id != null) ids.push(String(e.id)); });
  if (!ids.length) return {};
  var inClause = ids.join(',');
  try {
    var r = await sbFetch(
      EC_TABLE + '?target_owner=eq.' + ownerUid
               + '&target_id=in.(' + inClause + ')'
               + '&order=created_at.asc',
      {method: 'GET'}
    );
    if (!r.ok) return {};
    var rows = await r.json();
    var byId = {};
    rows.forEach(function(row) {
      var key = row.target_type + '::' + row.target_id;
      if (!byId[key]) byId[key] = [];
      byId[key].push(row);
    });
    return byId;
  } catch(e) { return {}; }
}

// Hent kommentarar/reaksjonar for éi enkelt oppføring
async function ecFetch(targetType, targetId, targetOwner) {
  if (!window._sbUser) return [];
  try {
    var r = await sbFetch(
      EC_TABLE + '?target_type=eq.' + encodeURIComponent(targetType)
               + '&target_id=eq.'   + encodeURIComponent(String(targetId))
               + '&target_owner=eq.' + targetOwner
               + '&order=created_at.asc',
      {method: 'GET'}
    );
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { return []; }
}

// Sett inn ny rad (kommentar eller reaksjon)
async function ecPost(targetType, targetId, targetOwner, kind, text) {
  if (!window._sbUser) return null;
  var authorName = (userProfile && userProfile.name) ? userProfile.name
    : (window._sbUser.email ? window._sbUser.email.split('@')[0] : 'Ukjent');
  try {
    var r = await sbFetch(EC_TABLE, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Prefer': 'return=representation'},
      body: JSON.stringify({
        target_type:  targetType,
        target_id:    String(targetId),
        target_owner: targetOwner,
        author_id:    window._sbUser.id,
        author_name:  authorName,
        kind:         kind,
        text:         text
      })
    });
    if (!r.ok) return null;
    var rows = await r.json();
    return rows[0] || null;
  } catch(e) { return null; }
}

// Slett éin rad etter id
async function ecDelete(id) {
  if (!window._sbUser) return;
  try { await sbFetch(EC_TABLE + '?id=eq.' + id, {method: 'DELETE'}); } catch(e) {}
}

// Toggle reaksjon: slett om eiga eksisterer, elles sett inn — oppdaterer blokka
async function ecToggleReaction(emoji, targetType, targetId, targetOwner, containerId) {
  if (!window._sbUser) { showToast('Logg inn for å reagere'); return; }
  var rows   = await ecFetch(targetType, targetId, targetOwner);
  var myUid  = window._sbUser.id;
  var myReact = null;
  rows.forEach(function(r) {
    if (r.kind === 'reaction' && r.text === emoji && r.author_id === myUid) myReact = r;
  });
  if (myReact) { await ecDelete(myReact.id); }
  else         { await ecPost(targetType, targetId, targetOwner, 'reaction', emoji); }
  var newRows = await ecFetch(targetType, targetId, targetOwner);
  ecInjectBlock(containerId, targetType, targetId, targetOwner, newRows);
}

// Send kommentar frå input-felt (kalla av Send-knapp og Enter)
async function ecPostComment(targetType, targetId, targetOwner, containerId) {
  if (!window._sbUser) { showToast('Logg inn for å kommentere'); return; }
  var input = document.getElementById('ec-input-' + containerId);
  var text  = input ? input.value.trim() : '';
  if (!text) return;
  if (input) { input.value = ''; input.disabled = true; }
  await ecPost(targetType, targetId, targetOwner, 'comment', text);
  var rows = await ecFetch(targetType, targetId, targetOwner);
  ecInjectBlock(containerId, targetType, targetId, targetOwner, rows);
}

// Slett eiga kommentar og oppdater blokka
async function ecDeleteComment(commentId, targetType, targetId, targetOwner, containerId) {
  await ecDelete(commentId);
  var rows = await ecFetch(targetType, targetId, targetOwner);
  ecInjectBlock(containerId, targetType, targetId, targetOwner, rows);
}

// Toggle kommentartråd open/lukka (bevar input-fokus ved opning)
function ecToggleThread(containerId) {
  var threadEl = document.getElementById('ec-thread-' + containerId);
  var parent   = document.getElementById(containerId);
  if (!threadEl || !parent) return;
  var isOpen = parent.dataset.threadOpen === '1';
  parent.dataset.threadOpen = isOpen ? '0' : '1';
  threadEl.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    var inp = document.getElementById('ec-input-' + containerId);
    if (inp) setTimeout(function() { inp.disabled = false; inp.focus(); }, 40);
  }
}

// Bygg og set inn HTML-blokk (reaksjonsrad + kommentartråd) i ein container-div
function ecInjectBlock(containerId, targetType, targetId, targetOwner, rows) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var myUid     = window._sbUser ? window._sbUser.id : null;
  var reactions = rows.filter(function(r) { return r.kind === 'reaction'; });
  var comments  = rows.filter(function(r) { return r.kind === 'comment';  });

  // Teljing og forfattarliste per emoji
  var emojiCounts  = {};
  var emojiAuthors = {};
  reactions.forEach(function(r) {
    emojiCounts[r.text]  = (emojiCounts[r.text]  || 0) + 1;
    if (!emojiAuthors[r.text]) emojiAuthors[r.text] = [];
    emojiAuthors[r.text].push(r.author_name || 'Ukjent');
  });

  // Escape for inline onclick-strenger
  var safeId  = String(targetId).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  var safeCid = containerId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  var threadVisible = el.dataset.threadOpen === '1';
  var commentCount  = comments.length;

  // ── Reaksjonsrad ─────────────────────────────────────────────────────────
  var reactHtml = '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:8px">';
  EC_REACTIONS.forEach(function(emoji) {
    var count   = emojiCounts[emoji] || 0;
    var myReact = reactions.some(function(r) { return r.text === emoji && r.author_id === myUid; });
    var authors = (emojiAuthors[emoji] || []).join(', ');
    var activeSt = myReact
      ? 'background:#D0E8FF;border-color:#4A90D9;font-weight:700'
      : 'background:#F5F4F0;border-color:#D3D1C7' + (count === 0 ? ';opacity:0.42' : '');
    reactHtml += '<button'
      + ' onclick="ecToggleReaction(\'' + emoji + '\',\'' + targetType + '\',\'' + safeId + '\',\'' + targetOwner + '\',\'' + safeCid + '\')"'
      + ' title="' + escapeHtml(authors) + '"'
      + ' style="border:1px solid;border-radius:14px;padding:2px 8px;cursor:pointer;font-size:13px;line-height:1.4;' + activeSt + '">'
      + emoji + (count > 0 ? ' <span style="font-size:11px">' + count + '</span>' : '')
      + '</button>';
  });

  // Kommentar-teller-knapp
  var threadBtnSt = threadVisible
    ? 'background:#D0E8FF;border-color:#4A90D9;color:#0C447C'
    : 'background:#F5F4F0;border-color:#D3D1C7;color:#5F5E5A';
  reactHtml += '<button onclick="ecToggleThread(\'' + safeCid + '\')"'
    + ' style="border:1px solid;border-radius:14px;padding:2px 8px;cursor:pointer;font-size:12px;line-height:1.4;margin-left:2px;' + threadBtnSt + '">'
    + '💬' + (commentCount > 0 ? ' <span style="font-size:11px">' + commentCount + '</span>' : '')
    + '</button>';
  reactHtml += '</div>';

  // ── Kommentartråd ─────────────────────────────────────────────────────────
  var threadHtml = '<div id="ec-thread-' + containerId + '"'
    + ' style="' + (threadVisible ? '' : 'display:none;') + 'margin-top:8px;border-top:1px solid #EEEDEA;padding-top:8px">';

  if (comments.length) {
    threadHtml += '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px">';
    comments.forEach(function(c) {
      var isOwn   = c.author_id === myUid;
      var timeStr = c.created_at
        ? new Date(c.created_at).toLocaleDateString('no-NO', {day: '2-digit', month: 'short'})
        : '';
      threadHtml += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">';
      threadHtml += '<div style="flex:1;min-width:0">'
        + '<span style="font-size:11px;font-weight:600;color:#5F5E5A">' + escapeHtml(c.author_name || 'Ukjent') + '</span>'
        + ' <span style="font-size:10px;color:#B0AEA8">' + escapeHtml(timeStr) + '</span>'
        + '<div style="font-size:12px;color:#2C2C2A;word-break:break-word;margin-top:1px">' + escapeHtml(c.text || '') + '</div>'
        + '</div>';
      if (isOwn) {
        threadHtml += '<button onclick="ecDeleteComment(\'' + c.id + '\',\'' + targetType + '\',\'' + safeId + '\',\'' + targetOwner + '\',\'' + safeCid + '\')"'
          + ' style="border:none;background:none;color:#C0BEB8;font-size:13px;cursor:pointer;flex-shrink:0;padding:1px 3px;line-height:1"'
          + ' title="Slett min kommentar">✕</button>';
      }
      threadHtml += '</div>';
    });
    threadHtml += '</div>';
  }

  // Input-rad (berre for innlogga brukarar)
  if (window._sbUser) {
    threadHtml += '<div style="display:flex;gap:6px;align-items:center">'
      + '<input id="ec-input-' + containerId + '" type="text" placeholder="Skriv kommentar…"'
      + ' style="flex:1;font-size:12px;padding:5px 8px;border:1px solid #D3D1C7;border-radius:8px;outline:none"'
      + ' onkeydown="if(event.key===\'Enter\')ecPostComment(\'' + targetType + '\',\'' + safeId + '\',\'' + targetOwner + '\',\'' + safeCid + '\')">'
      + '<button onclick="ecPostComment(\'' + targetType + '\',\'' + safeId + '\',\'' + targetOwner + '\',\'' + safeCid + '\')"'
      + ' style="border:none;background:#0C447C;color:#fff;border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer">Send</button>'
      + '</div>';
  }
  threadHtml += '</div>';

  el.innerHTML = reactHtml + threadHtml;
}
