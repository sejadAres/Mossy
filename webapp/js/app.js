/* =========================================================
   Mossy op iPad en telefoon: routes, gedeelde bouwstenen en sessiebeheer.

   Routes (na het #-teken in de adresbalk):
     #/                               spinnenweb (eerste scherm)
     #/vragenlijst                    algemeen spinnenweb invullen
     #/resultaat                      persoonlijk resultaat
     #/dimensies                      dimensiemenu
     #/dimensie/<id>                  drie keuzes voor één dimensie
     #/dimensie/<id>/vragen           vragenlijst van die dimensie
     #/dimensie/<id>/healthy-hub      fysieke activiteit
     #/dimensie/<id>/webapp           digitale activiteit (of keuze als er meer zijn)
     #/dimensie/<id>/webapp/<naam>    één digitale activiteit, bijv. .../webapp/loslaten
   ========================================================= */
const ROUTES = [
  [/^$/, schermSpinnenweb],
  [/^vragenlijst$/, schermVragenlijstAlgemeen],
  [/^resultaat$/, schermResultaat],
  [/^dimensies$/, schermDimensiemenu],
  [/^dimensie\/([\w-]+)$/, schermDimensie],
  [/^dimensie\/([\w-]+)\/vragen$/, schermVragenlijstDimensie],
  [/^dimensie\/([\w-]+)\/healthy-hub$/, schermFysiek],
  [/^dimensie\/([\w-]+)\/webapp$/, schermDigitaal],
  [/^dimensie\/([\w-]+)\/webapp\/([\w-]+)$/, schermDigitaal]
];

const IS_IPAD = new URLSearchParams(location.search).get('apparaat') === 'ipad';
const main = document.querySelector('main');

/* ---------- Router ---------- */
let ruimOp = null; // opruimfunctie van het vorige scherm (stopt timers en geluid)

function toonHuidigScherm() {
  const pad = location.hash.replace(/^#\/?/, '');
  const route = ROUTES.find(([patroon]) => patroon.test(pad));
  if (!route) return omleiden('');

  const scherm = route[1](...pad.match(route[0]).slice(1));
  if (!scherm) return; // scherm heeft omgeleid

  if (ruimOp) ruimOp();
  document.title = scherm.titel + ' · Mossy';
  main.innerHTML = scherm.html;
  main.scrollTop = 0;
  window.scrollTo(0, 0);
  ruimOp = (scherm.na && scherm.na(main)) || null;
  if (!main.contains(document.activeElement)) main.querySelector('h1')?.focus();
}

/* Vervangt de huidige route (zonder extra stap in de geschiedenis). */
function omleiden(pad) {
  location.replace('#/' + pad);
  return null;
}

/* ---------- Gedeelde bouwstenen voor schermen ---------- */
function knop(href, tekst, soort = '') {
  return `<a class="knop ${soort}" href="${href}">${tekst}</a>`;
}

function terugLink(href, tekst) {
  return `<a class="terug" href="${href}">← ${tekst}</a>`;
}

function binnenkort(tekst) {
  return `<span class="knop uit" aria-disabled="true">${tekst}<small>Binnenkort beschikbaar</small></span>`;
}

function nietBeschikbaar(uitleg, terug) {
  return `
    <div class="kaart leeg">
      <img src="images/mossy-book.png" alt="">
      <h2>Binnenkort beschikbaar</h2>
      <p>${uitleg}</p>
      ${terug ? knop(terug[0], terug[1], 'primair') : ''}
    </div>`;
}

/* ---------- Sessie beëindigen ---------- */
const eindDialoog = document.getElementById('eindDialoog');

function beeindigSessie() {
  Sessie.wis();
  if (eindDialoog.open) eindDialoog.close();
  if (location.hash.replace(/^#\/?/, '') === '') toonHuidigScherm();
  else omleiden('');
}

document.getElementById('bEinde').onclick = () => eindDialoog.showModal();
document.getElementById('bEindeJa').onclick = beeindigSessie;
document.getElementById('bEindeNee').onclick = () => eindDialoog.close();

/* ---------- iPad: automatisch wissen na inactiviteit ---------- */
function bewaakInactiviteit() {
  if (!IS_IPAD || !CONFIG.ipadInactiefMinuten) return;
  const dialoog = document.getElementById('inactiefDialoog');
  let timer, aftellen;

  const herstart = () => {
    clearTimeout(timer);
    timer = setTimeout(vraagOfErNogIemandIs, CONFIG.ipadInactiefMinuten * 60000);
  };

  function vraagOfErNogIemandIs() {
    if (!Sessie.heeftAntwoorden() && location.hash.replace(/^#\/?/, '') === '') return herstart();
    let seconden = 30;
    const teller = dialoog.querySelector('b');
    teller.textContent = seconden;
    dialoog.showModal();
    aftellen = setInterval(() => {
      teller.textContent = --seconden;
      if (seconden <= 0) { clearInterval(aftellen); dialoog.close(); beeindigSessie(); }
    }, 1000);
  }

  document.getElementById('bNogHier').onclick = () => { clearInterval(aftellen); dialoog.close(); herstart(); };
  ['pointerdown', 'keydown'].forEach(e => addEventListener(e, () => { if (!dialoog.open) herstart(); }));
  herstart();
}

/* ---------- Start ---------- */
addEventListener('hashchange', toonHuidigScherm);
addEventListener('pageshow', e => { if (e.persisted) toonHuidigScherm(); }); // terugknop uit cache: opnieuw opbouwen
bewaakInactiviteit();
toonHuidigScherm();
