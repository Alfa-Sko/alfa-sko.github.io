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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })

  try {
    const { southWest, northEast } = await req.json()

    const key = Deno.env.get('NOBIL_API_KEY')
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'NOBIL_API_KEY ikkje satt. Legg til som secret i Supabase Dashboard.' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const body = new URLSearchParams({
      apikey: key,
      apiversion: '3',
      action: 'search',
      type: 'rectangle',
      northeast_lat: String(northEast.lat),
      northeast_long: String(northEast.lng),
      southwest_lat: String(southWest.lat),
      southwest_long: String(southWest.lng),
    })

    const nr = await fetch('https://nobil.no/api/server/search.php?mode=ajax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!nr.ok) {
      return new Response(
        JSON.stringify({ error: 'Nobil API feil', status: nr.status }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const raw = await nr.json()

    const stations = (raw.chargerstations || []).flatMap((s: Record<string, unknown>) => {
      const m = (s.csmd as Record<string, unknown>) || {}
      const pos = String(m.Position || '').replace(/[()]/g, '').split(',')
      const lat = parseFloat(pos[0])
      const lng = parseFloat(pos[1])
      if (isNaN(lat) || isNaN(lng)) return []
      if ((m.Station_status as number || 0) !== 1) return []

      const attr = (s.attr as Record<string, unknown>) || {}
      const conn = (attr.conn as Record<string, Record<string, { trans: string }>>) || {}
      const conns = Object.values(conn).map(c => ({
        type: (c[4]?.trans || '').trim(),
        cap: (c[5]?.trans || '').trim(),
      })).filter(c => c.type)

      return [{
        id: String(m.International_id || m.id || ''),
        name: String(m.name || ''),
        op: String(m.Operator || m.Owned_by || ''),
        lat,
        lng,
        total: Number(m.Number_charging_points || 0),
        avail: Number(m.Available_charging_points || 0),
        conns,
      }]
    })

    return new Response(
      JSON.stringify({ stations }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
