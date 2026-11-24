/* =========================================================
   Inzichten na de vragenlijst per dimensie: ALLE teksten, kaartjes,
   keuzes en de koppeling tussen cijfer en beeld staan hier.

   - soort 'visualisatie': verschijnt direct na de vragenlijst.
   - soort 'activiteit'  : na de vragenlijst volgt een uitnodiging
                           met "Start activiteit" of "Ga verder".
   - module              : bestand in js/inzichten/ dat het beeld tekent.

   De antwoorden verwijzen naar de vragen van data/iph-vragen.js
   via hun volgnummer (0 = eerste vraag van die dimensie).
   ========================================================= */
const INZICHT_INSTELLINGEN = {

  /* ---------- 1. Lichaamsfuncties ---------- */
  lichaam: {
    soort: 'visualisatie',
    module: 'energy-check',
    titel: "Mossy's Energy Check",
    label: 'Jouw Energy Check',
    // Mossy naast de batterij, per cijfer (vanaf 'min').
    mossy: [
      { min: 0, beeld: 'images/mossy-yoga.png', tekst: 'Rustig aan is ook goed. Elke kleine stap telt.' },
      { min: 4, beeld: 'images/mossy.png', tekst: 'Mooi dat je even stilstaat bij je energie.' },
      { min: 7, beeld: 'images/mossy-stretch.png', tekst: 'Wat fijn dat je je energiek voelt!' }
    ],
    // Onderwerp per vraag. 'omgekeerd' = bij deze vraag is "Nee" het fijne antwoord.
    onderwerpen: [
      { goed: 'je gezond voelen', aandacht: 'je gezond voelen' },
      { goed: 'je fit voelen', aandacht: 'je fit voelen' },
      { goed: 'weinig pijn', aandacht: 'pijn', omgekeerd: true },
      { goed: 'goed slapen', aandacht: 'slapen' },
      { goed: 'gezond eten', aandacht: 'gezond eten' },
      { goed: 'niet vaak ziek zijn', aandacht: 'vaak ziek zijn', omgekeerd: true },
      { goed: 'goed kunnen bewegen', aandacht: 'bewegen' }
    ],
    teksten: {
      goed: 'Wat je energie geeft: {lijst}.',
      aandacht: 'Hier kun je misschien wat energie winnen: {lijst}.',
      geenAntwoorden: 'Je hebt de vragen overgeslagen. Wat geeft jou vandaag energie?',
      uitleg: 'Je gaf jezelf een {cijfer}. Daarom is je batterij voor {procent}% gevuld.'
    }
  },

  /* ---------- 2. Mentaal welbevinden ---------- */
  mentaal: {
    soort: 'visualisatie',
    module: 'emotion-clouds',
    titel: "Mossy's Emotion Clouds",
    uitleg: 'Dit weerbeeld hoort bij het cijfer dat jij jezelf vandaag geeft.',
    // Weer per cijfer (0–10). Het eerste weer waarvan 'max' >= cijfer wordt gebruikt.
    // wolken = aantal, regen = aantal regenstrepen, zon = zichtbaarheid van de zon (0–1).
    weer: [
      { max: 2, naam: 'Regenachtig', tekst: 'Een grijze lucht met zachte regen.',
        lucht: ['#c9d6de', '#e6ecef'], wolken: 4, wolkKleur: '#9fb1bc', regen: 22, zon: 0, mossy: 'images/mossy-headphones.png' },
      { max: 4, naam: 'Bewolkt', tekst: 'Veel wolken en af en toe een druppel.',
        lucht: ['#d3e2ea', '#eef3f5'], wolken: 3, wolkKleur: '#b8c8d1', regen: 8, zon: 0.25, mossy: 'images/mossy.png' },
      { max: 7, naam: 'Wisselend', tekst: 'Wolken en zon wisselen elkaar af.',
        lucht: ['#cfe8f5', '#f2f9fc'], wolken: 2, wolkKleur: '#ffffff', regen: 0, zon: 0.75, mossy: 'images/mossy.png' },
      { max: 10, naam: 'Zonnig', tekst: 'Een open lucht met een warme zon.',
        lucht: ['#bfe3f5', '#fff6df'], wolken: 1, wolkKleur: '#ffffff', regen: 0, zon: 1, mossy: 'images/mossy-stretch.png' }
    ],
    // Mossy stelt één vraag: de eerste regel die past bij de antwoorden.
    reflectie: [
      { vraag: 3, als: ['nee', 'beetje'], tekst: 'Wat zou jou vandaag een klein beetje vrolijker maken?' },
      { vraag: 5, als: ['nee'], tekst: 'Bij wie of wat kun jij terecht als het even niet goed gaat?' },
      { vraag: 4, als: ['nee', 'beetje'], tekst: 'Wat is iets wat jij goed doet, ook als niemand het zegt?' },
      { vraag: 1, als: ['nee'], tekst: 'Wanneer lukt het jou het best om je hoofd even leeg te maken?' }
    ],
    reflectieStandaard: 'Wat heeft vandaag invloed op hoe jij je voelt?'
  },

  /* ---------- 3. Zingeving ---------- */
  zingeving: {
    soort: 'activiteit',
    module: 'life-compass',
    titel: "Mossy's Life Compass",
    uitnodiging: 'Kies drie waarden die voor jou belangrijk zijn en zet ze op je eigen kompas.',
    waarden: [
      { id: 'familie', naam: 'Familie', icoon: '👪' },
      { id: 'vrijheid', naam: 'Vrijheid', icoon: '🕊️' },
      { id: 'vriendschap', naam: 'Vriendschap', icoon: '🤝' },
      { id: 'ontwikkeling', naam: 'Ontwikkeling', icoon: '🌱' },
      { id: 'plezier', naam: 'Plezier', icoon: '🎉' },
      { id: 'gezondheid', naam: 'Gezondheid', icoon: '💚' },
      { id: 'rust', naam: 'Rust', icoon: '🍃' },
      { id: 'creativiteit', naam: 'Creativiteit', icoon: '🎨' }
    ],
    teksten: {
      kies: 'Kies drie waarden. Tik op een kaartje of sleep het naar een plek op het kompas.',
      wissel: 'Tik op een waarde op het kompas om hem terug te leggen.',
      vraag: 'Heb je vandaag iets gedaan dat hierbij past?',
      stapVraag: 'Bedenk een kleine stap die bij een van je waarden past.',
      stapVoorbeeld: 'bijv. mijn oma bellen'
    }
  },

  /* ---------- 4. Kwaliteit van leven ---------- */
  kwaliteit: {
    soort: 'activiteit',
    module: 'happiness-garden',
    titel: "Mossy's Happiness Garden",
    uitnodiging: 'Laat een tuin groeien met de dingen die jou gelukkig maken.',
    // kort = label in de tuin, plant = vorm: bloem, varen, bloemetjes, klokje, zonnebloem, struik
    keuzes: [
      { id: 'hobbys', naam: "Hobby's", kort: "Hobby's", plant: 'bloem', kleur: '#f26a21' },
      { id: 'rust', naam: 'Rust', kort: 'Rust', plant: 'varen', kleur: '#64b255' },
      { id: 'vrienden', naam: 'Vrienden', kort: 'Vrienden', plant: 'bloemetjes', kleur: '#e5607a' },
      { id: 'muziek', naam: 'Muziek', kort: 'Muziek', plant: 'klokje', kleur: '#7b6fd0' },
      { id: 'successen', naam: 'Persoonlijke successen', kort: 'Successen', plant: 'zonnebloem', kleur: '#f7b21b' },
      { id: 'natuur', naam: 'Buiten zijn', kort: 'Buiten', plant: 'struik', kleur: '#3f8f4f' }
    ],
    teksten: {
      kies: 'Wat maakt jou gelukkig? Tik op wat bij jou past. Je kunt je keuzes altijd aanpassen.',
      aandachtVraag: 'Tik op een plant waar je meer aandacht aan wilt geven.',
      aandachtLabel: 'Hier wil ik meer aandacht aan geven'
    }
  },

  /* ---------- 5. Meedoen ---------- */
  meedoen: {
    soort: 'activiteit',
    module: 'mossy-connect',
    titel: 'Mossy Connect',
    uitnodiging: 'Kies een kleine sociale uitdaging en zie je netwerk groeien.',
    uitdagingen: [
      { id: 'compliment', naam: 'Geef iemand een compliment', label: 'Compliment', icoon: '💬' },
      { id: 'bericht', naam: 'Stuur een vriend een bericht', label: 'Bericht', icoon: '✉️' },
      { id: 'samen', naam: 'Doe mee aan een gezamenlijke activiteit', label: 'Samen doen', icoon: '👥' }
    ],
    reflectieOptie: 'Ik begin met een reflectieopdracht',
    reflectieVraag: 'Bij wie voel jij je op je gemak, en waardoor komt dat?',
    statussen: [['gepland', 'Ik ga dit plannen'], ['gedaan', 'Heb ik gedaan']]
  },

  /* ---------- 6. Dagelijks functioneren ---------- */
  dagelijks: {
    soort: 'activiteit',
    module: 'mini-missions',
    titel: "Mossy's Mini Missions",
    uitnodiging: 'Maak van een taak waar je tegenop ziet drie kleine, haalbare stappen.',
    taakVraag: 'Welke taak zie je op dit moment tegenop?',
    taakVoorbeeld: 'bijv. mijn verslag schrijven',
    stapVragen: ['Wat is het eerste kleine begin?', 'Wat kun je daarna doen?', 'Wat is een haalbare derde stap?'],
    statussen: [['todo', 'Nog te doen'], ['gepland', 'Gepland'], ['gedaan', 'Gedaan']]
  }
};

/* Een inzicht-activiteit als webapp-game (zie data/dimensies.js -> digitaal).
   Titel en omschrijving komen hierboven vandaan, dus wijzigingen werken op beide plekken door. */
function inzichtAlsGame(dimId) {
  const cfg = INZICHT_INSTELLINGEN[dimId];
  return { titel: cfg.titel, activiteit: cfg.module, omschrijving: cfg.uitnodiging };
}

/* Hier melden de inzicht-modules zich aan (zie js/inzichten/).
   Elke module: INZICHTEN['naam'] = { start(vak, context) { ...; return opruimen; } } */
const INZICHTEN = {};
