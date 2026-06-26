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
        svar: 'På et besøk eller kundekort kan du legge til notater og bilder. Notater kan redigeres med ✏-knappen, og endringen vises alle steder notatet dukker opp.'
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
        tittel: 'Jeg trenger hjelp som ikke står her',
        svar: 'Ta kontakt med Jørn (eller den som har ansvar for Kompass internt) — så kan svaret legges inn i hjelpesenteret.'
      }
    ]
  }
];
