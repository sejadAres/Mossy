/* =========================================================
   IPH-vragen: één bron voor het algemene spinnenweb én de vragenlijst per dimensie.
   Per dimensie 7 vragen met de antwoorden Ja / Een beetje / Nee
   en als laatste vraag een cijfer van 0 tot 10.
   Het cijfer is de score van die dimensie in het spinnenweb.
   ========================================================= */
const IPH = {
  versie: 'Vragen zoals aangeleverd door het team (per dimensie 7 vragen + 1 cijfer)',
  goedgekeurd: true,
  keuzes: [['ja', 'Ja'], ['beetje', 'Een beetje'], ['nee', 'Nee']],
  cijfer: { min: 0, max: 10, laag: 'Heel slecht', hoog: 'Heel goed' },
  vragen: {
    lichaam: {
      vragen: ['Voel jij je gezond?', 'Voel jij je fit?', 'Heb je pijn?', 'Slaap je goed?',
               'Eet je gezond?', 'Ben je vaak ziek?', 'Kan je goed bewegen?'],
      cijfer: 'Je hebt nagedacht over je lichaam. Welk cijfer geef je dit?'
    },
    mentaal: {
      vragen: ['Kan je dingen goed onthouden?', 'Kan je goed nadenken?', 'Kan je goed zien en horen?',
               'Voel jij je vrolijk?', 'Ben je blij met wie je bent?',
               'Weet je wat je moet doen als het niet goed gaat?', 'Beslis je zelf over belangrijke dingen?'],
      cijfer: 'Je hebt nagedacht over je gevoel en gedachten. Welk cijfer geef je dit?'
    },
    zingeving: {
      vragen: ['Vind jij je leven zinvol?', "Heb je 's morgens zin om op te staan?",
               'Zijn er dingen die je graag wil doen in je leven?', 'Maak jij je zorgen over je toekomst?',
               'Accepteer jij je leven zoals het is?', 'Ben je dankbaar voor je leven?',
               'Heb je zin om nieuwe dingen te leren?'],
      cijfer: 'Je hebt nagedacht over een zinvol leven. Welk cijfer geef je dit?'
    },
    kwaliteit: {
      vragen: ['Geniet je van het leven?', 'Ben je gelukkig?', 'Voel jij je goed?', 'Kan jij je leven aan?',
               'Voel jij je veilig?', 'Ben je tevreden over hoe je woont?',
               'Heb je genoeg geld om je rekeningen te betalen?'],
      cijfer: 'Je hebt nagedacht over jouw kwaliteit van leven. Welk cijfer geef je dit?'
    },
    meedoen: {
      vragen: ['Heb je contact met andere mensen?', 'Nemen andere mensen je serieus?', 'Heb je vrienden?',
               'Heb je mensen die je kunnen helpen?', 'Heb je het gevoel dat je erbij hoort?',
               'Heb je werk of doe je andere dingen die je belangrijk vindt?',
               'Wil je graag weten wat er in je dorp of stad gebeurt?'],
      cijfer: 'Je hebt nagedacht over meedoen. Welk cijfer geef je dit?'
    },
    dagelijks: {
      vragen: ['Kan je goed voor jezelf zorgen?', 'Weet je wat je kan en niet kan?',
               'Weet je hoe je gezond kunt leven?', 'Kan jij jouw dag goed indelen?',
               'Geef je meer geld uit dan je hebt?', 'Kan je werken?', 'Weet jij hoe je hulp kan vragen?'],
      cijfer: 'Je hebt nagedacht over het dagelijks leven. Welk cijfer geef je dit?'
    }
  }
};

/* Mogen de vragenlijsten getoond worden? */
function iphBeschikbaar() {
  return IPH.goedgekeurd;
}

/* Vragen van één dimensie, met een vaste id per vraag (bijv. 'lichaam-0').
   type 'keuze' = Ja / Een beetje / Nee, type 'cijfer' = 0 tot 10. */
function vragenVan(dimId) {
  const set = IPH.vragen[dimId];
  if (!set) return [];
  return [
    ...set.vragen.map(tekst => ({ type: 'keuze', tekst })),
    { type: 'cijfer', tekst: set.cijfer }
  ].map((v, i) => ({ ...v, id: dimId + '-' + i, dimId }));
}

/* Alle vragen voor het algemene spinnenweb, in de volgorde van DIMENSIES. */
function alleVragen() {
  return DIMENSIES.flatMap(d => vragenVan(d.id));
}

/* 'beetje' -> 'Een beetje', 7 -> '7' */
function antwoordTekst(waarde) {
  const keuze = IPH.keuzes.find(([k]) => k === waarde);
  return keuze ? keuze[1] : String(waarde);
}
