-- ══════════════════════════════════════════════════════════════════════════════
--  Alfa Kompass — 002_grants.sql
--  Eksplisitte tabell-grants for authenticated-rollen.
--
--  Bakgrunn: RLS-policies aleine er ikkje nok. PostgreSQL krev BÅDE
--  tabell-nivå GRANT og godkjende RLS-policies. Utan GRANT får alle
--  UPDATE/INSERT/DELETE ein 403 med kode 42501 sjølv om RLS-policy
--  er korrekt definert.
--
--  Kjøres i Supabase SQL-editoren éin gong.
--  Trygg å køyre fleire gonger (GRANT er idempotent).
-- ══════════════════════════════════════════════════════════════════════════════

-- Schema-tilgang (Supabase set vanlegvis dette, men ta det eksplisitt)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- ── customers ────────────────────────────────────────────────────────────────
-- RLS-policy "Selger endrer egne kunder" (001_customers.sql) dekkjer kven
-- som får skrive. GRANT her opnar berre for at authenticated kan prøve.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- ── seller_districts ─────────────────────────────────────────────────────────
-- Berre lese-policy for authenticated (skrive = service role i SQL-editor).
GRANT SELECT ON public.seller_districts TO authenticated;

-- ── user_data ─────────────────────────────────────────────────────────────────
-- Brukt av supabase.js (sbPushKey / sbPull). RLS: eigen rad.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_data TO authenticated;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Brukt av dashboard.js og followups.js for rolle-sjekk og brukarliste.
-- Skriv berre via service role (admin-oppsett), ikkje av appen sjølv.
GRANT SELECT ON public.profiles TO authenticated;

-- ── entry_comments ────────────────────────────────────────────────────────────
-- Kommentarar og reaksjonar (comments.js). RLS: eige + tilgang via target_owner.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entry_comments TO authenticated;

-- ── notification_reads ────────────────────────────────────────────────────────
-- Lest-status per varsel (notifications.js). RLS: eigne rader.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_reads TO authenticated;
