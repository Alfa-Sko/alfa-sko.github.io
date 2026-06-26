// calendar-sync.js — Speiler kalenderavtaler til calendar_events-tabellen (Supabase).
// Lastes etter supabase.js. Hekter seg på saveData for alfa_events.
// localStorage forblir primærkilde — dette er et tillegg, ikke erstatning.
// Feil i synkronisering blokkerer ALDRI lokal lagring.

(function(){
  var _orig = window.saveData;
  window.saveData = function(key, val){
    _orig.call(window, key, val);
    if(key === 'alfa_events') _calScheduleCloudSync(val);
  };
})();

var _calSyncTimer = null;

function _calScheduleCloudSync(events){
  if(window._demoMode || window._viewOnlyMode) return;
  clearTimeout(_calSyncTimer);
  _calSyncTimer = setTimeout(function(){ _calDoCloudSync(events); }, 1500);
}

async function _calDoCloudSync(events){
  var s = typeof _sbSession === 'function' ? _sbSession() : null;
  if(!s || !s.access_token || !(s.user||{}).id) return;
  var uid = s.user.id;

  // Bygg rader: én rad per avtale på tvers av alle datoer
  var rows = [];
  Object.keys(events || {}).forEach(function(dateKey){
    (events[dateKey] || []).forEach(function(ev){
      rows.push({
        user_id: uid,
        event_date: dateKey,
        event_data: ev,
        is_private: ev.private === true,
        updated_at: new Date().toISOString()
      });
    });
  });

  try {
    // Slett alle mine rader, sett deretter inn alle på nytt
    var delRes = await sbFetch('/rest/v1/calendar_events?user_id=eq.' + uid, {
      method: 'DELETE',
      headers: {'Prefer': 'return=minimal'}
    });
    if(!delRes.ok){
      var delBody = await delRes.text().catch(function(){ return ''; });
      throw new Error('DELETE ' + delRes.status + ' ' + delBody);
    }

    if(rows.length > 0){
      var insRes = await sbFetch('/rest/v1/calendar_events', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Prefer': 'return=minimal'},
        body: JSON.stringify(rows)
      });
      if(!insRes.ok){
        var insBody = await insRes.text().catch(function(){ return ''; });
        throw new Error('INSERT ' + insRes.status + ' ' + insBody);
      }
    }
  } catch(e){
    console.warn('[kalSync] Speiling feilet (lokalt OK):', e.message);
  }
}
