// Nobil EV-lader proxy — Supabase Edge Function
// Les Nobil-dokumentasjon: https://info.nobil.no/api
// Miljøvariabel NOBIL_API_KEY må settast i Supabase Dashboard → Edge Functions → Secrets
// Deploy: supabase functions deploy nobil-chargers --project-ref oxwirhetgwcbsehyuaeq

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResp(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })

  try {
    // ── Parse request ──────────────────────────────────────────────────────────
    let southWest: { lat: number; lng: number }
    let northEast: { lat: number; lng: number }
    try {
      const body = await req.json()
      southWest = body.southWest
      northEast = body.northEast
      if (!southWest?.lat || !northEast?.lat) throw new Error('Manglande koordinatar')
    } catch (e) {
      console.error('Request parse-feil:', e)
      return jsonResp({ error: 'Ugyldig request-body: ' + (e as Error).message }, 400)
    }

    // ── Hent API-nøkkel ────────────────────────────────────────────────────────
    const key = Deno.env.get('NOBIL_API_KEY')
    if (!key) {
      console.error('NOBIL_API_KEY ikkje satt i Edge Function secrets')
      return jsonResp({ error: 'NOBIL_API_KEY ikkje konfigurert' }, 500)
    }

    // ── Bygg Nobil-kall ────────────────────────────────────────────────────────
    // Nobil v3 API: northeast og southwest som "(lat,lon)"-strengar, ikkje separate felt.
    // countrycode=NOR filterer bort svenske/finske stasjoner på API-nivå.
    const nobilParams = new URLSearchParams({
      apikey:      key,
      apiversion:  '3',
      action:      'search',
      type:        'rectangle',
      northeast:   `(${northEast.lat},${northEast.lng})`,
      southwest:   `(${southWest.lat},${southWest.lng})`,
      countrycode: 'NOR',
      format:      'json',
    })

    let nobilResp: Response
    try {
      nobilResp = await fetch('https://nobil.no/api/server/search.php?mode=ajax', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    nobilParams.toString(),
      })
    } catch (e) {
      console.error('Nobil nettverksfeil:', e)
      return jsonResp({ error: 'Kunne ikkje nå Nobil API', detail: (e as Error).message }, 502)
    }

    if (!nobilResp.ok) {
      const txt = await nobilResp.text().catch(() => '')
      console.error('Nobil HTTP-feil', nobilResp.status, txt.slice(0, 300))
      return jsonResp({ error: 'Nobil API feil', status: nobilResp.status, detail: txt.slice(0, 200) }, 502)
    }

    // ── Parse Nobil-svar ───────────────────────────────────────────────────────
    // Nobil kan returnere HTML ved feil — les som tekst og parse JSON manuelt
    const rawText = await nobilResp.text()
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(rawText)
    } catch (_) {
      console.error('Nobil returnerte ikkje gyldig JSON:', rawText.slice(0, 300))
      return jsonResp({ error: 'Nobil returnerte ugyldig JSON', preview: rawText.slice(0, 200) }, 502)
    }

    // ── Transformer til forenkla format ───────────────────────────────────────
    const list = Array.isArray(raw.chargerstations) ? raw.chargerstations : []
    const stations = (list as Record<string, unknown>[]).flatMap(s => {
      try {
        const m = (s.csmd as Record<string, unknown>) || {}
        const pos = String(m.Position || '').replace(/[()]/g, '').split(',')
        const lat = parseFloat(pos[0])
        const lng = parseFloat(pos[1])
        if (isNaN(lat) || isNaN(lng)) return []
        if (Number(m.Station_status ?? 0) !== 1) return []

        const attr = (s.attr as Record<string, unknown>) || {}
        const conn = (attr.conn as Record<string, Record<string, { trans: string }>>) || {}
        const conns = Object.values(conn).map(c => ({
          type: (c[4]?.trans || '').trim(),
          cap:  (c[5]?.trans || '').trim(),
        })).filter(c => c.type)

        return [{
          id:     String(m.International_id || m.id || ''),
          name:   String(m.name || ''),
          op:     String(m.Operator || m.Owned_by || ''),
          county: String(m.County || ''),
          lat, lng,
          total:  Number(m.Number_charging_points || 0),
          avail:  Number(m.Available_charging_points || 0),
          conns,
        }]
      } catch (_) {
        return []
      }
    })

    console.log(`Nobil: returnerer ${stations.length} stasjonar for bbox`)
    return jsonResp({ stations })

  } catch (e) {
    console.error('Uhandtert feil i nobil-chargers:', e)
    return jsonResp({ error: (e as Error).message }, 500)
  }
})
