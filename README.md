# Mossy · Healthy Hub Challenge (De Haagse Hogeschool)

Mossy is een webapp zonder bouwstap: gewone HTML, CSS en JavaScript in de map `webapp/`.
Er zijn twee startpagina's:

| Apparaat | Startpagina | Wat de student ziet |
| --- | --- | --- |
| Kiosk (groot touchscreen) | `webapp/kiosk.html` | Introductievideo, daarna de keuze: iPad of telefoon (QR-code) |
| iPad in een stemhokje | `webapp/index.html?apparaat=ipad` | Spinnenweb als eerste scherm; sessie wordt na 5 minuten zonder aanraking gewist |
| Telefoon (via QR-code) en thuis | `webapp/index.html` | Precies dezelfde schermen als op de iPad |

## Lokaal openen

Zonder installatie: dubbelklik op `webapp/index.html` of `webapp/kiosk.html`.

Beter (zo werkt het ook op een telefoon in hetzelfde wifi-netwerk): start een kleine webserver in de map `webapp`:

```bash
cd webapp
python3 -m http.server 8080
# of: npx serve .
```

Open daarna `http://localhost:8080/kiosk.html` (kiosk) en `http://localhost:8080/index.html?apparaat=ipad` (iPad).

## Waar pas ik wat aan?

| Wat | Bestand |
| --- | --- |
| Introductievideo, link in de QR-code, tijden | `webapp/config.js` (video zelf: `webapp/media/introductie.html`, zie de README daar) |
| De zes dimensies: naam, omschrijving, fysieke activiteit, digitale activiteit | `webapp/data/dimensies.js` |
| De digitale activiteiten zelf (één bestand per activiteit) | `webapp/js/activiteiten/` |
| IPH-vragen en antwoordschaal (één bron voor spinnenweb én vragenlijst per dimensie) | `webapp/data/iph-vragen.js` |
| Inzichten na de vragenlijst: teksten, waardenkaartjes, tuinkeuzes, uitdagingen, cijfer → batterij/weer | `webapp/data/inzichten.js` |
| Beelden en interactie van die inzichten (één bestand per inzicht) | `webapp/js/inzichten/` en `webapp/css/inzichten.css` |
| Kleuren en indeling | `webapp/css/mossy.css`, `webapp/css/activiteiten.css` en `webapp/css/kiosk.css` |

**QR-code.** Leeg `appUrl` in `config.js` betekent: `index.html` op dezelfde website als de kiosk.
Draait de kiosk lokaal of via `localhost`? Vul dan de publieke URL in (bijvoorbeeld `https://mossyapp.netlify.app/`),
anders kan een telefoon de link niet openen.

**Activiteiten per dimensie.**

| Dimensie | In de Healthy Hub | In de webapp |
| --- | --- | --- |
| Lichaamsfuncties | Foodies en Goodies | Rekken |
| Mentaal welbevinden | Memory Wipe | Ademhaling, Loslaten |
| Zingeving | Dankbaarheidsbuddy | Mediteren, Mossy's Life Compass |
| Kwaliteit van leven | Smart Money | Geluiden, Mossy's Happiness Garden |
| Meedoen | Punten verzamelen | Social Challenge, Mossy Connect |
| Dagelijks functioneren | Trivia Race | Mossy's Morning Rush, Mossy's Mini Missions |

De uitleg van de Healthy Hub-activiteiten ontbreekt nog: vul per dimensie `fysiek.uitleg` en `fysiek.stappen` in.
Een nieuwe webapp-activiteit maak je als bestand in `js/activiteiten/` met
`ACTIVITEITEN['naam'] = { start(vak) { ...; return opruimen; } }`, voeg je toe aan `index.html`
en koppel je via de lijst `digitaal` in `dimensies.js`. Heeft een dimensie meer dan één webapp-activiteit,
dan kiest de student eerst (bijvoorbeeld Ademhaling of Loslaten bij Mentaal welbevinden).

**Loslaten** gebruikt de microfoon om te meten of de student blaast; er wordt niets opgenomen.
Browsers geven alleen toegang tot de microfoon via `https://` of `localhost`. Lukt dat niet, dan werkt de knop "Houd ingedrukt".

**IPH-vragen.** Per dimensie 7 vragen met de antwoorden Ja / Een beetje / Nee, en als achtste vraag een cijfer van 0 tot 10.
Het algemene spinnenweb stelt alle 48 vragen; de vragenlijst per dimensie stelt dezelfde 8 vragen van die dimensie.
Pas teksten of antwoordopties aan in `webapp/data/iph-vragen.js`.

## Inzichten na de vragenlijst per dimensie

Na de vragenlijst van één dimensie gaat de app naar `#/dimensie/<id>/inzicht`:

| Dimensie | Wat er verschijnt | Bestand |
| --- | --- | --- |
| Lichaamsfuncties | Mossy's Energy Check: batterij gevuld tot het cijfer (6 = 60%) + korte reflectie | `js/inzichten/energy-check.js` |
| Mentaal welbevinden | Mossy's Emotion Clouds: weerbeeld bij het cijfer + één vraag van Mossy | `js/inzichten/emotion-clouds.js` |
| Zingeving | Uitnodiging → Mossy's Life Compass (drie waarden op een kompas, kleine stap) | `js/inzichten/life-compass.js` |
| Kwaliteit van leven | Uitnodiging → Mossy's Happiness Garden (planten per geluksbron, aandachtsplek) | `js/inzichten/happiness-garden.js` |
| Meedoen | Uitnodiging → Mossy Connect (mini-uitdagingen, netwerk van Mossy's, reflectie) | `js/inzichten/mossy-connect.js` |
| Dagelijks functioneren | Uitnodiging → Mossy's Mini Missions (taak in drie stappen, kamer ruimt op) | `js/inzichten/mini-missions.js` |

- **Teksten en instellingen** staan allemaal in `webapp/data/inzichten.js`: titels, uitnodigingen, de waardenkaartjes,
  de tuinkeuzes en hun plantvorm, de uitdagingen, de vragen van Mini Missions, Mossy's reflectievragen en de
  **grenzen van het weer** per cijfer (`mentaal.weer`). De batterij volgt het cijfer direct (cijfer × 10%).
- **Beelden** zijn getekend in SVG in de bestanden hierboven (bijv. de plantvormen bovenaan `happiness-garden.js`,
  de plekken van de voorwerpen bovenaan `mini-missions.js`). Mossy gebruikt de afbeeldingen uit `webapp/images/`.
- **Ook als webapp-game.** Life Compass, Happiness Garden, Mossy Connect en Mini Missions staan ook bij de webapp-activiteiten
  van hun dimensie (`inzichtAlsGame(...)` in `data/dimensies.js`). Het is dezelfde module met dezelfde teksten en bewaarde
  keuzes, dus een wijziging werkt op beide plekken door. De terugknop gaat naar waar de activiteit is geopend:
  de lijst met webapp-activiteiten, of het scherm na de vragenlijst.
- **Keuzes** (kompas, tuin, netwerk, stappen) worden per dimensie in de sessie bewaard: terugnavigeren behoudt ze,
  **Sessie beëindigen** wist ze. Slepen en tikken gebruikt de gedeelde helper `js/sleep.js` (ook voor Morning Rush).
- Animaties zijn kort en rustig; met "minder beweging" in het besturingssysteem staan ze uit.

## Hoe de code in elkaar zit

```text
webapp/
├── index.html                 iPad en telefoon (laadt de scripts hieronder in volgorde)
├── kiosk.html                 kiosk
├── config.js                  centrale instellingen
├── data/
│   ├── dimensies.js           één bron voor de zes dimensies
│   ├── iph-vragen.js          één bron voor alle IPH-vragen
│   └── inzichten.js           teksten en instellingen van de inzichten
├── js/
│   ├── app.js                 routes, gedeelde knoppen, sessie beëindigen, iPad-inactiviteit
│   ├── sessie.js              tijdelijke antwoorden (sessionStorage) en wissen
│   ├── score.js               score per dimensie en korte samenvatting
│   ├── spinnenweb-svg.js      tekent het spinnenweb
│   ├── qr.js                  maakt de QR-code (werkt offline)
│   ├── kiosk.js               video en overstapscherm
│   ├── activiteiten/          rekken, ademhaling, loslaten, mediteren, geluiden, social-challenge, morning-rush
│   ├── inzichten/             energy-check, emotion-clouds, life-compass, happiness-garden, mossy-connect, mini-missions
│   ├── sleep.js               slepen en tikken (gedeeld)
│   └── schermen/
│       ├── spinnenweb.js      eerste scherm + resultaat
│       ├── vragenlijst.js     algemene vragenlijst + vragenlijst per dimensie
│       ├── inzicht.js         visualisatie of uitnodiging na de vragenlijst
│       ├── dimensiemenu.js    overzicht van de zes dimensies
│       ├── dimensiepagina.js  één pagina met de drie keuzes, voor alle dimensies
│       └── activiteiten.js    activiteit in de Healthy Hub + scherm dat een webapp-activiteit opent
├── css/                       mossy.css (alles), activiteiten.css en kiosk.css
└── images/                    Mossy-afbeeldingen
```

De route staat na het `#`-teken in de adresbalk, bijvoorbeeld `index.html#/dimensie/zingeving`.
In `js/app.js` staat bovenaan de lijst met alle routes en welk scherm erbij hoort.
Elk scherm is een functie die `{ titel, html }` teruggeeft (en eventueel `na`, voor knoppen die iets doen).
Geeft `na` een functie terug, dan roept de router die aan bij het verlaten van het scherm (zo stoppen timers en geluid).

## Score

De score van een dimensie in het spinnenweb is het cijfer (0–10) dat de student zichzelf geeft bij de achtste vraag.
Dat sluit aan op de introductievideo ("per dimensie geef je jezelf een cijfer van 0 tot 10").
De antwoorden op de zeven Ja / Een beetje / Nee-vragen zijn om over na te denken en staan per dimensie in het resultaat
onder "Bekijk je antwoorden". Een dimensie zonder cijfer krijgt geen score (nooit een nul). De logica staat in `js/score.js`.

## Privacy

Antwoorden staan alleen in `sessionStorage` van de browsertab en worden nergens naartoe gestuurd.
**Sessie beëindigen** wist alles en gaat terug naar het spinnenweb; ook terugnavigeren of vernieuwen toont daarna niets meer.
De kiosk slaat niets op.
