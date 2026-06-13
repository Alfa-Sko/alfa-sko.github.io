# Alfa Kompass – prosjektkontekst

Intern CRM-webapp for Alfa Sko. I produksjon, brukes av 5–6 personer (selgere, KAM, salgssjef, CEO). Skal være skalerbar og lett å vedlikeholde.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript (ingen rammeverk)
- Backend: Supabase (auth + tabellene `profiles` og `user_data`)
- Hosting: GitHub Pages, repo `alfa-sko.github.io`

## Git
- Jobb ALLTID på branch `alfa2`. Aldri merge til `main`.
- Små, hyppige commits.

## Ufravikelige regler
- Ikke bygg appen på nytt. Ikke redesign. Ikke skriv om fungerende funksjonalitet.
- Ikke rør Supabase-databasen, authentication eller login enda.
- Behold all eksisterende funksjonalitet.

## Pågående arbeid: refaktorering
Alt ligger nå i én index.html (~7766 linjer). Mål:
- CSS → css/app.css
- JS → js/data.js, js/utils.js, js/supabase.js, js/ui.js, js/calendar.js, js/customers.js, js/dashboard.js, js/planner.js, js/init.js
