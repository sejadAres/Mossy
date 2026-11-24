/* =========================================================
   Eén bron voor de zes dimensies van Positieve Gezondheid.
   Het dimensiemenu en de dimensiepagina lezen allebei deze lijst.

   Per dimensie:
   - id            korte sleutel; ook de sleutel van de IPH-vragen in data/iph-vragen.js
   - naam, kleur   naam en kleur (zelfde kleuren als de oude Tips-pagina)
   - omschrijving  korte uitleg in het dimensiemenu
   - fysiek        activiteit in de Healthy Hub.
                   'uitleg' en 'stappen' leeg = "Uitleg binnenkort beschikbaar"
   - digitaal      lijst met activiteiten in de webapp. 'activiteit' verwijst naar een bestand
                   in js/activiteiten/ (bijv. 'rekken' -> js/activiteiten/rekken.js).
                   Eén activiteit opent direct; bij meer kiest de student eerst.
                   inzichtAlsGame('<dimensie>') voegt de activiteit van na de vragenlijst toe
                   (data/inzichten.js); die gebruikt dezelfde module en bewaarde keuzes.
                   Bestaat er geen, dan toont de app "Binnenkort beschikbaar".
   ========================================================= */
const DIMENSIES = [
  {
    id: 'lichaam',
    naam: 'Lichaamsfuncties',
    kleur: '#e5202e',
    omschrijving: 'Gezond voelen, fitheid, slapen, eten, bewegen en meer.',
    fysiek: { titel: 'Foodies en Goodies', uitleg: '', stappen: [] },
    digitaal: [{ titel: 'Rekken', activiteit: 'rekken', omschrijving: 'Veel gezeten? Beweeg een minuutje.' }]
  },
  {
    id: 'mentaal',
    naam: 'Mentaal welbevinden',
    kleur: '#1f86c8',
    omschrijving: 'Concentreren, vrolijk zijn, jezelf accepteren, omgaan met verandering en meer.',
    fysiek: { titel: 'Memory Wipe', uitleg: '', stappen: [] },
    digitaal: [
      { titel: 'Ademhaling', activiteit: 'ademhaling', omschrijving: 'Rustig ademen: in 4, vasthouden 4, uit 6.' },
      { titel: 'Loslaten', activiteit: 'loslaten', omschrijving: 'Schrijf op wat je dwarszit en blaas het weg.' }
    ]
  },
  {
    id: 'zingeving',
    naam: 'Zingeving',
    kleur: '#7b3f98',
    omschrijving: 'Zinvol leven, vertrouwen, dankbaarheid, blijven leren en meer.',
    fysiek: { titel: 'Dankbaarheidsbuddy', uitleg: '', stappen: [] },
    digitaal: [{ titel: 'Mediteren', activiteit: 'mediteren', omschrijving: 'Kom tot rust met een onderwerp om over na te denken.' },
      inzichtAlsGame('zingeving')]
  },
  {
    id: 'kwaliteit',
    naam: 'Kwaliteit van leven',
    kleur: '#f7a21b',
    omschrijving: 'Genieten, gelukkig zijn, balans, je veilig voelen en meer.',
    fysiek: { titel: 'Smart Money', uitleg: '', stappen: [] },
    digitaal: [{ titel: 'Geluiden', activiteit: 'geluiden', omschrijving: 'Ontspan met witte ruis, regen of de oceaan.' },
      inzichtAlsGame('kwaliteit')]
  },
  {
    id: 'meedoen',
    naam: 'Meedoen',
    kleur: '#f26a21',
    omschrijving: 'Sociale contacten, erbij horen, steun van anderen en meer.',
    fysiek: { titel: 'Punten verzamelen', uitleg: '', stappen: [] },
    digitaal: [{ titel: 'Social Challenge', activiteit: 'social-challenge', omschrijving: 'Draai aan het rad voor een sociale uitdaging.' },
      inzichtAlsGame('meedoen')]
  },
  {
    id: 'dagelijks',
    naam: 'Dagelijks functioneren',
    kleur: '#7ab536',
    omschrijving: 'Zorgen voor jezelf, je grenzen kennen, omgaan met tijd, hulp vragen en meer.',
    fysiek: { titel: 'Trivia Race', uitleg: '', stappen: [] },
    digitaal: [{ titel: "Mossy's Morning Rush", activiteit: 'morning-rush', omschrijving: "Plan Mossy's ochtend in 60 minuten." },
      inzichtAlsGame('dagelijks')]
  }
];

/* Zoek een dimensie op id. Geeft undefined als die niet bestaat. */
function vindDimensie(id) {
  return DIMENSIES.find(d => d.id === id);
}

/* De webapp-activiteiten van een dimensie die echt in de code staan
   (een gewone activiteit uit js/activiteiten/ of een inzicht uit js/inzichten/). */
function digitaleActiviteiten(dim) {
  return dim.digitaal.filter(a => ACTIVITEITEN[a.activiteit] || INZICHTEN[a.activiteit]);
}

/* Hier melden de digitale activiteiten zich aan (zie js/activiteiten/).
   Elke activiteit: ACTIVITEITEN['naam'] = { start(vak) { ...; return opruimen; } } */
const ACTIVITEITEN = {};
