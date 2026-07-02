# Alfa Kompass — instruksjoner til Claude

## Deploy-regel (ALDRI bryt denne)

```
git checkout main
git merge --ff-only alfa2
git push origin main
git checkout alfa2
```

- **Aldri commit direkte til `main`** — all utvikling skjer på `alfa2`
- Deploy = fast-forward merge til `main` + push
- Bevis på vellykka deploy: `git log --oneline -1 origin/main` skal vise siste commit

## Ny tabell eller bucket i Supabase — sjekkliste

Kvar gong du oppretter ein ny tabell eller Storage-bucket i Supabase, **kjør dette før featuren reknast som ferdig:**

1. **GRANT til `authenticated`**
   - Tabellar: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabell> TO authenticated;`
   - Read-only tabellar: `GRANT SELECT ON public.<tabell> TO authenticated;`
   - Bucket: sett riktig policy i Storage-innstillingane (eller via SQL)
   - GRANT er ikkje det same som RLS-policy — begge krevst

2. **RLS-policies for lese OG skrive**
   - `FOR SELECT` — kven kan lese?
   - `FOR INSERT`, `FOR UPDATE`, `FOR DELETE` — kven kan skrive?
   - Minst eitt testkall (SELECT + INSERT/PATCH) som bekreftar 2xx

3. **Verifiser med eit faktisk kall**
   - Ikkje rekn featuren som ferdig før du ser 2xx i konsollen
   - 403 med kode 42501 = manglande GRANT (ikkje RLS-feil)
   - 403 utan kode = RLS-policy avviser (GRANT finst, men policy slepp ikkje gjennom)

## Supabase SQL-migreringsfiler

Ligg i `supabase/` og køyrast manuelt i Supabase SQL-editor av Jørn.

| Fil | Innhald |
|-----|---------|
| `001_customers.sql` | customers + seller_districts + RLS-policies |
| `002_grants.sql` | GRANT til authenticated for alle tabellar |

## Sikkerheitskrav (absolutte)

- **Aldri** hardkod `sb_secret_`-nøklar — alltid frå miljøvariabel `SUPA_SECRET_KEY`
- `sb_publishable_` (SUPA_KEY i koden) er offentleg og trygg for frontend
- Interne priser (Gross price, Pre net price, rabatt-% frå innkjøp, nettopris, innkjøpspris) skal **aldri** lagrast eller visast — berre VEILEDENDE UTSALGSPRIS + modellinfo

## .gitignore (aldri commit desse)

- `backup/`
- `.claude/`
- `scripts/*.json`
- `CLAUDE.md`

## Admin-UIDs

- Jørn: `f0cff8a8-d538-431b-8d1f-95db1d75fa03`
- Hans Jørgen Kvåle: `1cd8ee06-8fb2-40e6-8634-e17bb08792dd`
