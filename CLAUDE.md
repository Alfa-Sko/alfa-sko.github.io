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
- JS → lasterekkefølge:
  1. js/data.js         — statiske datasett (BASE_CUSTOMERS, CUSTOMER_SALES)
  2. js/utils.js        — rene hjelpefunksjoner (loadData, formatering, dato)
  3. js/state.js        — delt global state (visits, followups, calEvents, userProfile m.fl.)
  4. js/supabase.js     — auth, synk, saveData
  5. js/ui.js           — felles UI-funksjoner (nav, modal, toast)
  6. js/dashboard.js    — oversikt, ledermodus, demo
  7. js/customers.js    — kundeliste, detaljer, import/eksport
  8. js/calendar.js     — kalender, hendelser, drag-drop, ICS-eksport
  9. js/planner-data.js — statiske planlegger-datasett (ruter, hoteller, regioner)
  10. js/planner.js     — AI-planlegger (algoritme, redigering, kalendereksport)
  11. js/photos.js      — IndexedDB-lag for besøksbilder
  12. js/visits.js      — besøksskjema, saveVisit, deleteVisit
  13. js/followups.js   — oppfølginger og bestillings-oppfølging
  14. js/timeline.js    — tidslinje, team-tidslinje, renderNotes
  15. js/profile.js     — brukerprofil
  16. js/calculator.js  — rabattkalkulator
  17. js/workbooks.js   — workbooks (IndexedDB) + felles kataloger (Supabase Storage)
  18. js/orders.js      — ordrestatus-widget
  19. js/init.js        — oppstartssekvens (kun startup-kall, ingen state-deklarasjoner)

## Datamodell-beslutninger

- **Kunde-eierskap:** `customers`-tabellen (fase 2) får BÅDE `district` (primær filtrering, settes på alle kunder) OG et valgfritt `assigned_user` (tomt inntil videre). Filter: vis kunder i brukerens distrikt; hvis `assigned_user` er satt, vis den kun til den brukeren. Grunn: ett distrikt kan deles mellom to selgere – `assigned_user` holder døren åpen uten tabellombygging.
- **Eierskap baseres på `district`** fordi `profiles` allerede har `district` per bruker.
- **Kunder i egen `customers`-tabell** (strukturerte delte data), IKKE i `user_data` (som er per-bruker nøkkel-verdi).

## Backlog (etter refaktorering)


- id=114 (TROMSØ OUTDOOR AS) har poststed="TROMØ" – skrivefeil for "TROMSØ" (postnr 9008 bekrefter). Rettes i datafyllingen til Supabase, ellers feiler geokoding.
- Adressevisning i kundekort: data finnes (gate/postnr/poststed på alle 142), men visningen (customers.js ~linje 237 og 322) leser feil felt (c.address). Fiks med fallback: vis gate/postnr/poststed som primær, c.address kun hvis utfylt manuelt. IKKE kopier gate→address (unngå dobbel sannhet – geokoding trenger de strukturerte feltene). Liten fiks, tas rett etter fase 1.
- Tidslinje viser ikke bildevedlegg. Kode (renderNotesWithPhotos → getPhotosForVisit) er identisk med original-main, så feilen er pre-eksisterende. Uavklart om det er reell feil eller bare manglende lagrede bilder. Undersøk når refaktorering er ferdig: verifiser at initPhotoDB faktisk åpner basen (sjekk schema-versjon / IndexedDB i DevTools → Application), og at et besøk med faktisk lagret bilde rendres i tidslinjen.
