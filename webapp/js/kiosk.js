/* =========================================================
   Kiosk: introductievideo en overstap naar iPad of telefoon.
   De kiosk slaat geen persoonlijke gegevens op.
   ========================================================= */
const $ = id => document.getElementById(id);
const video = $('video'), frame = $('introFrame');
const APP_URL = CONFIG.appUrl || new URL('index.html', location.href).href;
let terugTimer, gepauzeerd = false;

/* ---------- Speler: gewone video (.mp4) of geanimeerde uitleg (.html) ---------- */
const IS_ANIMATIE = /\.html?([?#].*)?$/i.test(CONFIG.video);

const speler = IS_ANIMATIE ? {
  // De animatie start zodra hij laadt; opnieuw laden = vanaf het begin.
  async start() {
    if (location.protocol.startsWith('http')) { // bestaat het bestand?
      const antwoord = await fetch(CONFIG.video, { method: 'HEAD' }).catch(() => null);
      if (!antwoord || !antwoord.ok) throw new Error('Introductie niet gevonden');
    }
    video.hidden = true;
    frame.hidden = false;
    frame.src = CONFIG.video + (CONFIG.video.includes('?') ? '&' : '?') + 'start=' + Date.now();
  },
  pauze(aan) { frame.contentWindow?.postMessage({ type: 'healthy-hub-video', cmd: aan ? 'pause' : 'play' }, '*'); },
  stop() { frame.removeAttribute('src'); frame.hidden = true; video.hidden = false; }
} : {
  start() { video.currentTime = 0; return video.play(); },
  pauze(aan) { return aan ? video.pause() : video.play(); },
  stop() { video.pause(); if (video.readyState) video.currentTime = 0; }
};

/* ---------- Weergaven ---------- */
function toonIntro() {
  clearTimeout(terugTimer);
  speler.stop();
  $('vOverstap').hidden = true;
  $('vIntro').hidden = false;
  $('bediening').hidden = true;
  $('fout').hidden = true;
  $('bSpeel').hidden = false;
  zetTitel('Welkom bij Mossy');
}

function toonOverstap() {
  speler.stop();
  $('vIntro').hidden = true;
  $('vOverstap').hidden = false;
  zetTitel('Kies hoe je verdergaat');
  clearTimeout(terugTimer);
  terugTimer = setTimeout(toonIntro, CONFIG.kioskTerugNaSeconden * 1000);
}

function toonFout() {
  speler.stop();
  $('bSpeel').hidden = true;
  $('bediening').hidden = true;
  $('fout').hidden = false;
  $('bProbeerOpnieuw').focus();
}

function zetTitel(tekst) {
  $('kioskTitel').textContent = tekst;
  $('kioskTitel').focus();
}

/* ---------- Bediening ---------- */
async function speelAf() {
  $('fout').hidden = true;
  $('bSpeel').hidden = true;
  $('bediening').hidden = false;
  $('tijdbalk').parentElement.hidden = IS_ANIMATIE; // de animatie heeft een eigen hoofdstukbalk
  zetPauze(false);
  try { await speler.start(); } catch { toonFout(); }
}

function zetPauze(aan) {
  gepauzeerd = aan;
  $('bPauze').textContent = aan ? '▶ Verder' : '❚❚ Pauzeer';
}

function wisselPauze() {
  zetPauze(!gepauzeerd);
  Promise.resolve(speler.pauze(gepauzeerd)).catch(toonFout);
}

/* ---------- Overstapscherm vullen ---------- */
function vulOverstap() {
  $('qr').innerHTML = maakQrSvg(APP_URL);
  $('appLink').textContent = APP_URL.replace(/^https?:\/\//, '').replace(/index\.html$/, '');

  $('hokjes').innerHTML = Array.isArray(CONFIG.hokjes)
    ? '<ul class="hokjes">' + CONFIG.hokjes.map(h =>
        `<li class="${h.vrij ? 'vrij' : 'bezet'}">${h.naam}: ${h.vrij ? 'vrij' : 'bezet'}</li>`).join('') + '</ul>'
    : '<p class="klein">Kijk zelf welk hokje vrij is. Zijn ze alle drie bezet? Ga dan verder op je telefoon.</p>';
}

/* ---------- Start ---------- */
video.poster = CONFIG.videoPoster;
if (!IS_ANIMATIE) video.src = CONFIG.video;

video.addEventListener('ended', toonOverstap);
video.addEventListener('error', () => { if ($('bSpeel').hidden) toonFout(); }); // alleen na een afspeelpoging
video.addEventListener('timeupdate', () => {
  $('tijdbalk').style.width = video.duration ? (100 * video.currentTime / video.duration) + '%' : '0';
});
video.addEventListener('click', () => { if (!$('bSpeel').hidden) speelAf(); else wisselPauze(); });

// De animatie meldt zelf dat hij klaar is.
addEventListener('message', e => {
  const d = e.data || {};
  if (e.source === frame.contentWindow && d.type === 'healthy-hub-video' && d.event === 'ended') toonOverstap();
});

$('bSpeel').onclick = speelAf;
$('bPauze').onclick = wisselPauze;
$('bOpnieuw').onclick = speelAf;
$('bOverslaan').onclick = toonOverstap;
$('bProbeerOpnieuw').onclick = speelAf;
$('bGaVerder').onclick = toonOverstap;
$('bBegin').onclick = toonIntro;

vulOverstap();
