// Hjelpesenter-innhold. Legg til/rediger artikler her — UI-koden er i help.js.
// Struktur: array av { kategori, artikler: [{ tittel, svar }] }
// I svar: bruk \n\n for nytt avsnitt, og "1. ", "2. " osv. for nummererte steg.

const HELP_CONTENT = [
  {
    kategori: 'Komme i gang',
    icon: '🧭',
    artikler: [
      {
        tittel: 'Hva er Kompass?',
        svar: 'Kompass er Alfa Sko sitt felt-verktøy. Her samler du kundene dine, planlegger kjøreruter, fører kalender og holder styr på oppfølginger — på både PC og mobil. Alt lagres i skyen, så du har samme data uansett hvor du logger inn.'
      },
      {
        tittel: 'Legg Kompass på hjemskjermen (iPhone)',
        svar: '1. Åpne alfa-sko.github.io i Safari på iPhone.\n2. Trykk på Del-knappen (firkanten med pil opp) nederst.\n3. Velg «Legg til på Hjem-skjerm».\n4. Trykk «Legg til». Nå ligger Kompass som et app-ikon med kompassrosen.'
      },
      {
        tittel: 'Logge inn',
        svar: 'Du logger inn med e-post og passord. Er du innlogget på én enhet, må du logge inn separat på en annen (f.eks. både PC og mobil). Dataene dine er de samme begge steder.'
      }
    ]
  },
  {
    kategori: 'Kunder og kontakter',
    icon: '👥',
    artikler: [
      {
        tittel: 'Finne en kunde',
        svar: 'Gå til Kunder-fanen. Bruk søkefeltet øverst — du kan søke på navn, by eller kjede. Du kan også filtrere på klasse, butikktype og kjede med nedtrekksmenyene.'
      },
      {
        tittel: 'Legge til kontaktperson på en kunde',
        svar: '1. Åpne kundekortet (klikk på kunden).\n2. Finn kontaktperson-seksjonen.\n3. Trykk «+ Legg til kontaktperson» og fyll inn navn, rolle, telefon og e-post.'
      },
      {
        tittel: 'Laste kontaktperson NED til iPhone',
        svar: 'På et kundekort, trykk 📇-knappen ved en kontaktperson. Det lastes ned en kontaktfil (.vcf) som iPhone foreslår å legge til i kontaktene dine. Har kunden flere kontakter, kan du laste ned alle samtidig med «Last ned alle kontakter».'
      },
      {
        tittel: 'Laste kontaktperson OPP fra iPhone til Kompass',
        svar: 'Du må først dele kontakten fra iPhone:\n\n1. Åpne Kontakter-appen på iPhone, velg kontakten.\n2. Trykk «Del kontakt» → «Lagre i Filer» → velg en mappe (f.eks. «På min iPhone»).\n3. I Kompass, på kundekortet: trykk «📇 Last opp fra mobil (.vcf)».\n4. Naviger til samme mappe, velg fila. Bekreft, og kontakten legges på kunden.'
      },
      {
        tittel: 'Konstellasjoner — hva er det?',
        svar: 'En konstellasjon er eieren/driveren bak en eller flere butikker, på tvers av kjeder. Eksempel: én eier kan stå bak både en Sport 1 og en Intersport. Konstellasjoner finner du som egen underfane i Kunder. Der kan du opprette, gi nytt navn, slette, sette konstellasjon på en kunde, og slå sammen konstellasjoner.'
      },
      {
        tittel: 'Åpne adresse i Google Maps',
        svar: 'På kundekortet og i kalender-popup for besøk finner du en «🗺 Google Maps»-lenke ved adressen. Trykk på den for å åpne adressen direkte i Google Maps på telefon eller PC. Nyttig for å få veibeskrivelse direkte til butikken.'
      }
    ]
  },
  {
    kategori: 'Ruteplanlegging',
    icon: '🗺',
    artikler: [
      {
        tittel: 'Planlegge en kjørerute',
        svar: '1. Gå til ruteplanleggeren.\n2. Velg område og hvilke kunder/dager du vil ha med.\n3. Kompass lager en kjørerute med rekkefølge, kjøretid mellom besøk, og foreslår overnatting hvis turen er for lang for én dag.'
      },
      {
        tittel: 'Sette avreisetidspunkt hjemmefra',
        svar: 'I planleggeren finner du feltet «Avreise hjemmefra (kl.)» — dette gjelder kun første dag. Setter du et morgentidspunkt og rekker første kunde innen arbeidstid, starter besøkene ved fremkomst. Setter du et kveldstidspunkt og ikke rekker fram i tide, legger Kompass automatisk inn overnatting, og besøkene starter neste morgen.'
      },
      {
        tittel: 'Maks tid per kunde — komprimere en dag',
        svar: 'På en travel dag kan du sette en maksgrense for hvor lenge hvert besøk varer. Når du korter ned tiden, fyller Kompass automatisk inn kunder fra «fikk ikke plass»-lista i den frigjorte tiden.'
      },
      {
        tittel: 'Legge til telefonanrop på en kjøreetappe',
        svar: 'På en kjøreetappe i ruten kan du trykke «+ Legg til anrop». Du kan velge enten en åpen oppfølging du vil ringe, eller en kontaktperson hos en bestemt kunde. Telefonnummeret blir klikkbart, så du kan ringe direkte fra mobilen.'
      },
      {
        tittel: 'Åpningstider og besøkstart',
        svar: 'Planleggeren tar hensyn til åpningstidene du har registrert på kundene. Besøk starter ikke før kunden åpner, og planleggeren avsetter ikke tid etter stenging.\n\nBesøkstart rundes alltid opp til nærmeste kvarter (15 min) etter beregnet kjøretid — slik at starttidspunktene alltid er hele kvarter (f.eks. 09:15, ikke 09:13). Dette gjelder konsekvent i både regionvisning og dagsvisning.'
      },
      {
        tittel: 'Ferieplanlegging: flyankomst og hjemreise',
        svar: 'I oppsettsskjemaet for planleggeren kan du angi fly og hotell for reisen:\n\n1. Fyll inn flyankomst: by, dato og klokkeslett.\n2. Fyll inn hjemreise: by, dato og klokkeslett.\n3. Angi hotellet du bor på under turen.\n\nPlanleggeren bruker disse opplysningene til å sette riktig start- og sluttsted per dag — du kjører fra flyplassen første dag og avslutter reisen der på siste dag.'
      }
    ]
  },
  {
    kategori: 'Kalender',
    icon: '📅',
    artikler: [
      {
        tittel: 'Bytte mellom dag, uke og måned',
        svar: 'Bruk knappene øverst i kalenderen: Måned, Uke, Dag.'
      },
      {
        tittel: 'Flytte en avtale (dra-og-slipp)',
        svar: 'Dra avtalen til et nytt tidspunkt. Den snapper til nærmeste 15-minutters strek. Flytter du en avtale slik at den havner oppå en annen, skyves de etterfølgende avtalene nedover (senere på dagen) for å gi plass — mellomrommene beholdes. På mobil: hold fingeren på avtalen et øyeblikk (long-press) for å starte flyttingen.'
      },
      {
        tittel: 'Eksportere kalender til Outlook',
        svar: 'Trykk Outlook-knappen i kalenderen. Det lages en fil (.ics) du kan importere i Outlook. Importerer du på nytt senere, oppdateres avtalene i stedet for å dupliseres.'
      },
      {
        tittel: 'Importere kalender fra Outlook (.ics)',
        svar: '1. Eksporter kalenderen fra Outlook som .ics-fil.\n2. Trykk «📅 Importer .ics» i Kompass-kalenderen.\n3. Velg filen. Du får en liste over avtalene som vil importeres — velg bort de du ikke vil ha med.\n4. Trykk «Importer». Avtalene legges inn og er redigerbare som vanlige Kompass-avtaler.\n\nImporterer du samme fil på nytt, oppdateres eksisterende avtaler i stedet for å lage duplikater.'
      },
      {
        tittel: 'Eksportere kalenderfil (.ics) fra Outlook',
        svar: 'Fremgangsmåten er litt ulik i ny og gammel Outlook. Velg den du bruker.\n\nGAMMEL OUTLOOK (klassisk skrivebordsapp på PC):\n1. Åpne Outlook og gå til Kalender-visningen.\n2. Klikk Fil, så Lagre kalender.\n3. Klikk Flere alternativer før du lagrer.\n4. Under Datoområde: velg et fornuftig vindu, for eksempel neste 30 dager (ikke hele kalenderen hvis du har mange år med avtaler).\n5. Under Detaljer: velg Fullstendige detaljer, så tittel, tid, sted og beskrivelse følger med.\n6. Lagre. Du får en .ics-fil som kan lastes opp i Kompass.\n\nNY OUTLOOK FOR WINDOWS / OUTLOOK PÅ WEB (outlook.office.com):\n1. Gå til Kalender.\n2. Klikk tannhjulet (Innstillinger) øverst til høyre.\n3. Velg Kalender, så Delte kalendere (eller Publiser kalender, avhengig av versjon).\n4. Under Publiser kalender: velg kalenderen og hvor mye som skal deles, og klikk Publiser.\n5. Du får en ICS-lenke. Kopier lenken og lim den inn i nettleseren — da lastes .ics-filen ned.\n\nTIPS:\n- Velg et fornuftig datoområde, ikke alt — importen til Kompass blir ryddigere med for eksempel de neste par månedene.\n- Fullstendige detaljer gir best resultat, så sted og beskrivelse følger med, ikke bare tittelen.\n- iPhone-kalenderen lar deg ikke enkelt eksportere som .ics direkte — gjør denne jobben fra en PC.'
      }
    ]
  },
  {
    kategori: 'Oppfølginger',
    icon: '✅',
    artikler: [
      {
        tittel: 'Lage en oppfølging',
        svar: 'Sett en oppfølging med oppgavetekst og frist. Den dukker opp i Oppfølging-fanen til du markerer den som gjennomført.'
      },
      {
        tittel: 'Søke i oppfølginger',
        svar: 'Bruk søkefeltet øverst i Oppfølging-fanen. Du kan søke på alle ord — søket leter i kundenavn, oppgavetekst, frist og prioritet. Skriver du flere ord, må alle finnes (f.eks. «intersport tilbud» finner oppfølginger som inneholder begge ordene).'
      },
      {
        tittel: 'Redigere en oppfølging',
        svar: 'Trykk ✎-knappen på en åpen oppfølging. Du kan endre både oppgavetekst og frist.'
      },
      {
        tittel: 'Markere som gjennomført — og angre',
        svar: 'Oppfølginger markeres som gjennomført KUN i Oppfølging-fanen (ikke fra kalender eller kjørerute). Har du markert noe som gjennomført ved en feil, finner du det under «Gjennomførte» og trykker «↩ Åpne igjen» for å sette det tilbake til åpent.'
      },
      {
        tittel: 'Dele en oppfølging med en kollega',
        svar: 'Trykk 👥-knappen på en oppfølging og velg én eller flere fra teamet. Da blir oppfølgingen felles: alle som den er delt med ser den i sin egen liste (markert som delt), og alle kan redigere og fullføre den. Fullfører én av dere, er den fullført for alle.'
      }
    ]
  },
  {
    kategori: 'Registrere aktivitet',
    icon: '📋',
    artikler: [
      {
        tittel: 'Føre et kundebesøk eller annen aktivitet',
        svar: 'Bruk «+ Ny aktivitet». Du kan registrere kundebesøk, telefonsamtale, clinic, teamsmøte, trening, lunsj med kunde, middag med kunde, eller annet (fritekst).'
      },
      {
        tittel: 'Legge til notat eller bilde på et besøk',
        svar: 'På et besøk eller kundekort kan du legge til notater og bilder. Notater er klikkbare overalt de vises — i tidslinja, på kundekortet, i kalender-popup og andre steder. Klikker du på et notat, åpnes det i redigeringsvisning med den allerede lagrede teksten klar til endring. Redigeringer lagres og oppdateres alle steder notatet dukker opp.'
      },
      {
        tittel: 'Registrere en reise (hotell, fly, leiebil, ferge)',
        svar: 'Trykk «+ Ny aktivitet» → «Legg til reise» for å registrere en reisebooking i kalenderen.\n\nVelg blant fire typer:\n— Hotell: navn, innsjekk- og utsjekkdato\n— Fly: flyselskap, flightnummer, avreise- og ankomsttidspunkt\n— Leiebil: leveringssted, hente- og leveringstidspunkt\n— Ferge: avgangssted og avgangstidspunkt\n\nReisen vises i kalenderen med eget ikon per type. Flynummeret vises direkte på fly-boksen i kalendervisningen.\n\nDu kan også starte reiseregistrering ved å klikke på et ledig tidspunkt i dag- eller ukevisningen — velg «Reise» i dialogboksen som dukker opp.'
      },
      {
        tittel: 'Redigere tidspunkt på en flyreise',
        svar: 'Klikk på en flyreise-boks i kalenderen. Et popup åpnes der du kan endre avreisedato og -tidspunkt. Endringen lagres umiddelbart.'
      }
    ]
  },
  {
    kategori: 'Prisliste',
    icon: '📄',
    artikler: [
      {
        tittel: 'Hva er prisliste-verktøyet?',
        svar: 'Prisliste-verktøyet samler alle tilgjengelige prisnøkler og produktlister på ett sted, organisert per sesong. Du kan se veiledende utsalgspris og produktinformasjon for de sesongene og kjedene du har tilgang til.\n\nInterne priser (innkjøpspris, rabattsatser og nettopris) vises aldri i Kompass — kun veiledende utsalgspris.'
      },
      {
        tittel: 'Sesonger og søk i prislisten',
        svar: 'Prislister er organisert per sesong (f.eks. Vår/Sommer og Høst/Vinter). Bytt sesong med nedtrekksmenyen øverst i Prisliste-fanen.\n\nBruk søkefeltet for å finne enkeltartikler, og filtrer på kjede eller kategori for å begrense visningen.'
      },
      {
        tittel: 'Laste opp prisliste (kun for administratorer)',
        svar: 'Opplasting av prislistefiler er forbeholdt brukere med administratortilgang.\n\n1. Gå til Prisliste-fanen.\n2. Trykk «Last opp» og velg en Excel PRICAT-fil eller PDF-prisliste.\n3. Velg hvilken sesong filen tilhører.\n4. Trykk «Last opp». Filen er tilgjengelig for alle brukere med tilgang så snart opplastingen er fullført.'
      }
    ]
  },
  {
    kategori: 'Kart og ladestasjoner',
    icon: '⚡',
    artikler: [
      {
        tittel: 'Vise ladestasjoner på kartet',
        svar: 'Trykk ⚡-knappen øverst til venstre på kartet for å vise ladestasjoner (data fra Nobil). Trykk igjen for å skjule dem. Det samme fungerer på planlegger-kartet for enkeltdager.\n\nKun norske ladestasjoner vises — svenske og finske stasjoner filtreres alltid bort, selv på kartutsnitt som strekker seg over grensen.'
      },
      {
        tittel: 'Filtrere på region og leverandør',
        svar: 'Trykk ⚙-knappen (ved siden av ⚡) for å åpne filterpanelet.\n\nREGION: Velg et fylke for å begrense visningen til ladestasjoner i det området. Standardvalget viser alle norske fylker.\n\nLEVERANDØR: Søk i leverandørlisten, hak av de du vil se, eller bruk «Velg alle» / «Fjern alle». Bare stasjoner fra valgte leverandører vises på kartet.'
      }
    ]
  },
  {
    kategori: 'Transport og elbil',
    icon: '🚗',
    artikler: [
      {
        tittel: 'Transport-fanen',
        svar: 'Transport-fanen samler verktøy knyttet til kjøring og logistikk. I første omgang inneholder den ladeplanlegging for elbil — med plass til fremtidige verktøy som rutetabell for ferjer og annen transportinfo.\n\nDu finner Transport-fanen i hovedmenyen på PC og under «Mer» på mobil.'
      },
      {
        tittel: 'Rekkevidde-felt på Oversikt-siden',
        svar: '«Rekkevidde i dag (km)»-feltet på Oversikt-siden lar deg raskt registrere gjenværende rekkevidde ved dagens start. Verdien er synkronisert med Lading underveis-widgeten i Transport-fanen — endrer du rekkevidde ett sted, oppdateres den automatisk det andre stedet også.'
      },
      {
        tittel: 'Lading underveis — finne nærmeste stasjon',
        svar: 'Lading underveis-widgeten hjelper deg planlegge et ladestopp midt i arbeidsdagen.\n\n1. Skriv inn gjenværende rekkevidde i km.\n2. Widgeten finner nærmeste ladestasjon innenfor rekkevidden og viser ventet ladetid.\n3. Du ser konsekvensen for neste avtale i kalenderen.\n4. Kolliderer ladingen med en avtale, kan du velge å skyve avtalen, korte den ned eller slette den.\n\nFunksjonen er kun tilgjengelig når kjøretøytype er satt til «Elbil» i Min profil.'
      },
      {
        tittel: 'Elbilinnstillinger i Min profil',
        svar: 'For å bruke Lading underveis, sett kjøretøytype til «Elbil» i Min profil.\n\nDu kan også fylle inn to valgfrie felt som gjør beregningene mer nøyaktige:\n— Maks ladefart (kW): brukes til å beregne ventet ladetid.\n— Forbruk (kWh/100 km): brukes til å anslå reell rekkevidde.\n\nDisse verdiene finner du i bilens spesifikasjoner eller i produsentens dokumentasjon.'
      }
    ]
  },
  {
    kategori: 'Varsler, notater og reaksjoner',
    icon: '🔔',
    artikler: [
      {
        tittel: 'Varselsenter — bjellen i banneret',
        svar: 'Bjelle-ikonet (🔔) øverst i banneret viser varsler utledet fra aktivitet i Kompass. Antall uleste varsler vises som et tall på bjellen.\n\nTrykk på bjellen for å åpne varselsenteret. Varsler markeres som leste når du åpner dem. Her samles blant annet påminnelser om oppfølginger og relevante teamhendelser.'
      },
      {
        tittel: 'Kommentarer på oppføringer',
        svar: 'Du kan legge til kommentarer på besøk og andre oppføringer. Klikk på kommentar-ikonet på en oppføring og skriv inn kommentaren din.\n\nKommentarer er synlige for alle på teamet som har tilgang til samme oppføring.'
      },
      {
        tittel: 'Emoji-reaksjoner',
        svar: 'På besøk og oppføringer kan du reagere med emoji. Velg en emoji fra reaksjonsvelgeren — reaksjonen vises på oppføringen og er synlig for alle med tilgang til samme oppføring.'
      }
    ]
  },
  {
    kategori: 'Problemløsing',
    icon: '🛠',
    artikler: [
      {
        tittel: 'Jeg ser ikke endringene mine / appen virker gammel',
        svar: 'Appen kan ligge mellomlagret i nettleseren. Prøv å laste siden på nytt. På PC kan du teste i et privat/inkognito-vindu for å være sikker på at du ser nyeste versjon.'
      },
      {
        tittel: 'En kontaktperson eller avtale forsvant',
        svar: 'Data lagres i skyen, men hver enhet har også et lokalt lager. Sjekk at du er innlogget, og last siden på nytt så den henter fersk data fra skyen. Hvis noe du la inn på mobil ikke vises på PC (eller omvendt), gi det et øyeblikk og last på nytt — synkingen skjer ved oppstart.'
      },
      {
        tittel: 'Hjemskjerm-ikonet på iPhone viser bare en «K»',
        svar: 'Det betyr at iPhone har mellomlagret et gammelt ikon. Fjern Kompass fra hjemskjermen, åpne siden på nytt i Safari, og legg den til på hjemskjermen igjen. Da dukker kompassrosen opp.'
      },
      {
        tittel: 'Vedlikeholdsmodus (kun for administratorer)',
        svar: 'Vedlikeholdsmodus stenger Kompass for alle vanlige brukere og viser en «Under vedlikehold»-melding. Bare administratorer kan logge inn og jobbe mens vedlikeholdsmodus er aktiv.\n\nAdministratorer slår vedlikeholdsmodus av og på under Min profil → Administrasjon.'
      },
      {
        tittel: 'Jeg trenger hjelp som ikke står her',
        svar: 'Ta kontakt med Jørn (eller den som har ansvar for Kompass internt) — så kan svaret legges inn i hjelpesenteret.'
      }
    ]
  }
];
