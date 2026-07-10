-- ══════════════════════════════════════════════════════════════════════════════
--  Alfa Kompass — 003_app_settings.sql
--  Globale appinstillingar delte av alle brukarar.
--  Første rad: key='maintenance_mode', value='on'/'off'.
--
--  RLS: alle authenticated kan LESE. Berre Jørn (admin-UID) kan ENDRE.
--  Kjøres i Supabase SQL-editoren éin gong.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Startverdi: vedlikehold AV
INSERT INTO public.app_settings (key, value)
VALUES ('maintenance_mode', 'off')
ON CONFLICT (key) DO NOTHING;

-- GRANT
GRANT SELECT ON public.app_settings TO authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;

-- RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Alle innloggede kan lese
CREATE POLICY "app_settings_select" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

-- Berre Jørn kan skrive (INSERT / UPDATE)
CREATE POLICY "app_settings_write_admin" ON public.app_settings
  FOR ALL TO authenticated
  USING     (auth.uid() = 'f0cff8a8-d538-431b-8d1f-95db1d75fa03'::uuid)
  WITH CHECK(auth.uid() = 'f0cff8a8-d538-431b-8d1f-95db1d75fa03'::uuid);
