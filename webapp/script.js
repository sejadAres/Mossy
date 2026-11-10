const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ===== Welkomstscherm ===== */
$('#go').onclick = () => {
  const w = $('#welcome');
  w.style.opacity = 0;
  setTimeout(() => (w.style.display = 'none'), 400);
};

/* ===== Tabs ===== */
function go(t) {
  $$('nav button').forEach(x => x.classList.toggle('on', x.dataset.t === t));
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + t));
  $('main').scrollTop = 0;
}
$$('nav button').forEach(b => (b.onclick = () => go(b.dataset.t)));
$$('.go').forEach(b => (b.onclick = () => go(b.dataset.go)));

/* ===== Ademhaling ===== */
let breathing = false, bt;
const orb = $('#orb'), ph = $('#phase');

function step(i) {
  if (!breathing) return;
  const P = [['Adem in', 4, 1.7], ['Vasthouden', 4, 1.7], ['Adem uit', 6, 1]][i];
  ph.textContent = P[0];
  orb.style.transition = 'transform ' + (i === 1 ? 0 : P[1]) + 's ease-in-out';
  orb.style.transform = 'scale(' + P[2] + ')';
  bt = setTimeout(() => step((i + 1) % 3), P[1] * 1000);
}

$('#bBtn').onclick = () => {
  breathing = !breathing;
  $('#bBtn').textContent = breathing ? 'Stop' : 'Start';
  if (breathing) {
    step(0);
  } else {
    clearTimeout(bt);
    ph.textContent = 'Klaar';
    orb.style.transition = 'transform 1s';
    orb.style.transform = 'scale(1)';
  }
};

/* ===== Geluiden ===== */
const S = [
  ['white', '⚪', 'Witte ruis', 'Gelijkmatig en neutraal'],
  ['rain', '🌧️', 'Regen', 'Zacht, helder getik'],
  ['ocean', '🌊', 'Oceaan', 'Langzaam rollende golven']
];
let ctx, master, cur = null, vol = 0.5;

$('#list').innerHTML = S.map(s =>
  `<button class="card" data-id="${s[0]}"><div class="ic">${s[1]}</div><div><b>${s[2]}</b><span>${s[3]}</span></div><div class="st"></div></button>`
).join('');

function stopSnd() {
  if (cur) {
    cur.src.stop();
    cur.x.forEach(o => o.stop());
    cur = null;
  }
}

function play(id) {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  master.gain.value = vol;
  ctx.resume();
  stopSnd();

  // 2 seconden ruis die blijft herhalen
  const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const x = [];
  const g = ctx.createGain();
  g.gain.value = 0.4;

  if (id === 'rain') {
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1200;
    src.connect(f); f.connect(g);
  } else if (id === 'ocean') {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 500;
    const l = ctx.createOscillator();   // langzame golfbeweging
    l.frequency.value = 0.1;
    const lg = ctx.createGain();
    lg.gain.value = 0.3;
    l.connect(lg); lg.connect(g.gain);
    l.start();
    x.push(l);
    src.connect(f); f.connect(g);
  } else {
    src.connect(g);
  }

  g.connect(master);
  src.start();
  cur = { id, src, x };
}

$('#list').onclick = e => {
  const c = e.target.closest('.card');
  if (!c) return;
  const was = cur && cur.id === c.dataset.id;
  if (was) stopSnd(); else play(c.dataset.id);
  $$('#list .card').forEach(k => {
    const on = cur && cur.id === k.dataset.id;
    k.classList.toggle('on', !!on);
    k.querySelector('.st').textContent = on ? 'Speelt' : '';
  });
};

$('#vol').oninput = e => {
  vol = e.target.value / 100;
  if (master) master.gain.value = vol;
};

/* ===== Mediteren: timer ===== */
// status: 'idle' (klaar om te beginnen), 'running' (loopt), 'paused' (gepauzeerd)
let mins = 5, tmr = null, left = 0, total = 0, mStatus = 'idle';
const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

$('#chips').innerHTML = [5, 10, 15].map(m =>
  `<button class="chip${m === 5 ? ' on' : ''}" data-min="${m}">${m} min</button>`
).join('');

function draw() {
  const t = $('#time');
  t.classList.remove('done');
  t.textContent = fmt(left);
  $('#arc').style.strokeDashoffset = 339.3 * (1 - left / total);
}

// Zet alle knoppen en teksten goed bij de huidige status
function setStatus(s) {
  mStatus = s;
  const active = s !== 'idle';
  $('#mBtn').textContent = active ? 'Stop' : 'Begin';
  $('#mPlus').disabled = !active;
  $('#mPause').disabled = !active;
  $('#mPause').classList.toggle('paused', s === 'paused');
  $('#mPause').querySelector('span').textContent = s === 'paused' ? 'Verder' : 'Pauze';
  $('#chips').classList.toggle('locked', active);
  $('#s-med').classList.toggle('is-paused', s === 'paused');
  $('#mState').textContent =
    s === 'running' ? 'Bezig met mediteren…' :
    s === 'paused'  ? 'Gepauzeerd. Tik op Verder om door te gaan.' : '';
}

function tick() {
  left--;
  draw();
  if (left <= 0) {
    reset();
    const t = $('#time');
    t.textContent = 'Goed gedaan 🙏';
    t.classList.add('done');
    $('#mState').textContent = 'Klaar! Kies een duur om opnieuw te beginnen.';
  }
}

function startTimer() {
  clearInterval(tmr);
  tmr = setInterval(tick, 1000);
  setStatus('running');
}

function reset() {
  clearInterval(tmr);
  tmr = null;
  total = left = mins * 60;
  draw();
  setStatus('idle');
}

$('#chips').onclick = e => {
  const c = e.target.closest('.chip');
  if (!c || mStatus !== 'idle') return;
  mins = +c.dataset.min;
  $$('#chips .chip').forEach(k => k.classList.toggle('on', k === c));
  reset();
};

// Begin / Stop
$('#mBtn').onclick = () => {
  if (mStatus === 'idle') startTimer();
  else reset();
};

// Pauzeren / verder
$('#mPause').onclick = () => {
  if (mStatus === 'running') {
    clearInterval(tmr);
    tmr = null;
    setStatus('paused');
  } else if (mStatus === 'paused') {
    startTimer();
  }
};

// +1 minuut
$('#mPlus').onclick = () => {
  if (mStatus === 'idle') return;
  left += 60;
  total += 60;
  draw();
};

// Opnieuw: timer én onderwerp terug naar het begin
$('#mRestart').onclick = () => {
  reset();
  resetTopic();
  $('#mState').textContent = 'Timer en onderwerp staan weer op het begin.';
};

/* ===== Mediteren: onderwerp genereren ===== */
// Thema-kleuren komen uit de app (zelfde kleuren als de domeinen bij Tips)
const THEMES = {
  gevoel: { name: 'Gevoelens',    color: '#1f86c8' },
  waarde: { name: 'Waarden',      color: '#7b3f98' },
  dank:   { name: 'Dankbaarheid', color: '#f7a21b' },
  ik:     { name: 'Wie ben ik?',  color: '#64b255' }
};

const TOPICS = [
  // Gevoelens
  ['gevoel', 'Welk gevoel duw je de laatste tijd weg? Geef het een naam, bijvoorbeeld angst, verdriet of boosheid. Stel je voor dat je er ruimte voor maakt in je lichaam.'],
  ['gevoel', 'Mag je verdrietig zijn zonder het meteen op te lossen? Laat het verdriet er even zijn en kijk wat er gebeurt.'],
  ['gevoel', 'Wat voel je nu in je lichaam: onrust, rust of verveling? Kijk er alleen naar, zonder er iets aan te veranderen.'],
  ['gevoel', 'Denk aan iets moeilijks in je leven. Zeg rustig tegen jezelf: dit gaat voorbij, gevoelens veranderen.'],
  ['gevoel', 'Waar voel je spanning in je lichaam? Adem rustig naar die plek toe en laat de spanning zachter worden.'],
  ['gevoel', 'Ben je nog ergens boos over? Hoe zou het voelen om het los te laten, voor je eigen rust?'],
  // Waarden
  ['waarde', 'Wat vind jij vandaag het belangrijkst: eerlijkheid, geduld of creativiteit? Past wat je doet daarbij?'],
  ['waarde', 'Noem drie dingen die jij echt belangrijk vindt in het leven. Leef je daar op dit moment naar?'],
  ['waarde', 'Welke keuze of richting voelt nu het meest als ‘echt jij’?'],
  ['waarde', 'Waar wil je over een jaar staan? Welke kleine stap kun je deze week zetten?'],
  ['waarde', 'Welk gedrag van iemand anders irriteert je? Herken je daar soms ook iets van in jezelf?'],
  ['waarde', 'Wanneer was je voor het laatst trots op hoe je iets hebt aangepakt? Wat zegt dat over jou?'],
  // Dankbaarheid
  ['dank', 'Sta stil bij drie dingen in je leven waar je op dit moment dankbaar voor bent.'],
  ['dank', 'Noem drie kleine, gewone dingen van vandaag die je blij of rustig maakten.'],
  ['dank', 'Aan wie ben je dankbaar? Wat zou je tegen die persoon willen zeggen?'],
  ['dank', 'Wat kan je lichaam allemaal? Denk aan dingen waar je normaal niet bij stilstaat.'],
  ['dank', 'Denk aan een fijne herinnering. Wat zie, hoor en voel je?'],
  ['dank', 'Welke plek geeft jou rust? Stel je voor dat je daar nu bent.'],
  // Wie ben ik?
  ['ik', 'Wie ben je zonder je cijfers, je werk of wat anderen van je vinden?'],
  ['ik', 'Waar ben je streng voor jezelf? Wat zou je zeggen tegen een goede vriend in dezelfde situatie?'],
  ['ik', 'Welke drie woorden passen echt bij jou?'],
  ['ik', 'Waar ben je goed in, ook als niemand het zegt?'],
  ['ik', 'Wat heb jij vandaag nodig om je goed te voelen?'],
  ['ik', 'Wanneer voel je je het meest jezelf? Waar ben je dan, en met wie?']
];

// "Zak" met geschudde onderwerpen: je ziet alles één keer voordat er iets terugkomt
let bag = [], history = [], current = -1;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextIndex() {
  if (!bag.length) {
    bag = shuffle(TOPICS.map((_, i) => i));
    if (bag[bag.length - 1] === current) bag.unshift(bag.pop()); // nooit twee keer hetzelfde achter elkaar
  }
  return bag.pop();
}

function showTopic(i) {
  current = i;
  const [themeKey, text] = TOPICS[i], th = THEMES[themeKey];
  const tag = $('#topicTag'), p = $('#topicText'), card = $('#topic');
  tag.hidden = false;
  tag.querySelector('.dd').style.background = th.color;
  tag.querySelector('span').textContent = th.name;
  p.textContent = text;
  p.classList.remove('empty');
  card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  $('#prevBtn').hidden = history.length === 0;
}

function resetTopic() {
  bag = []; history = []; current = -1;
  $('#topicTag').hidden = true;
  const p = $('#topicText');
  p.innerHTML = 'Tik op <b>Genereer</b> voor een onderwerp om over na te denken tijdens het mediteren.';
  p.classList.add('empty');
  $('#prevBtn').hidden = true;
}

$('#genBtn').onclick = () => {
  if (current !== -1) history.push(current);
  showTopic(nextIndex());
  const g = $('#genBtn');
  g.classList.remove('go-spin'); void g.offsetWidth; g.classList.add('go-spin');
};

$('#prevBtn').onclick = () => {
  if (!history.length) return;
  showTopic(history.pop());
};

/* ===== Rekken ===== */
const MV = [
  ['🙆', 'Nek kantelen', 'Kantel één oor naar je schouder en wissel halverwege.'],
  ['🔄', 'Schouders rollen', 'Rol je schouders in grote, langzame cirkels naar achteren.'],
  ['🙌', 'Strek je lang uit', 'Vouw je vingers in elkaar en strek je armen omhoog naar het plafond.'],
  ['🌀', 'Zittende draai', 'Leg een hand op de tegenovergestelde knie, draai rustig en kijk achter je. Wissel halverwege.'],
  ['🤲', 'Polsen en handen', 'Strek één arm voor je uit en trek de vingers voorzichtig naar je toe. Wissel halverwege.'],
  ['👀', 'Oogpauze', 'Kijk naar iets in de verte en knipper dan langzaam met je ogen.']
];
let stSet = 'q', stT = null, stI = 0, stS = 0, stList = [], stSec = 15;

function stCfg() {
  stList = stSet === 'q' ? [0, 1, 2, 5] : [0, 1, 2, 3, 4, 5];
  stSec = stSet === 'q' ? 15 : 30;
}

function stDots() {
  $('#stDots').innerHTML = stList.map((_, i) => '<b class="' + (stT && i <= stI ? 'on' : '') + '"></b>').join('');
}

function stShow() {
  const m = MV[stList[stI]], b = $('#stBar');
  $('#stEmoji').textContent = m[0];
  $('#stName').textContent = m[1];
  $('#stText').textContent = m[2];
  $('#stClock').textContent = '0:' + String(stS).padStart(2, '0');
  b.style.transition = stS === stSec ? 'none' : '';
  b.style.width = (100 * (stSec - stS) / stSec) + '%';
  stDots();
}

function stReset(msg) {
  clearInterval(stT);
  stT = null;
  stCfg();
  $('#stBtn').textContent = 'Start';
  $('#stBar').style.transition = 'none';
  $('#stBar').style.width = '0';
  $('#stEmoji').textContent = msg ? '🙏' : '🤸';
  $('#stName').textContent = msg || 'Klaar?';
  $('#stText').textContent = msg ? 'Terug aan het werk met een helderder hoofd.' : 'Kies een duur en druk op start.';
  $('#stClock').textContent = '';
  stDots();
}

$$('.pick').forEach(g => (g.onclick = e => {
  const c = e.target.closest('.chip');
  if (!c || stT) return;
  g.querySelectorAll('.chip').forEach(k => k.classList.toggle('on', k === c));
  stSet = c.dataset.v;
  stReset();
}));

$('#stBtn').onclick = () => {
  if (stT) { stReset(); return; }
  stCfg();
  stI = 0;
  stS = stSec;
  $('#stBtn').textContent = 'Stop';
  stT = setInterval(() => {
    stS--;
    if (stS <= 0) {
      stI++;
      if (stI >= stList.length) { stReset('Goed gedaan'); return; }
      stS = stSec;
    }
    stShow();
  }, 1000);
  stShow(); // na setInterval, zodat het eerste bolletje meteen oplicht
};

/* ===== Start ===== */
stReset();
reset();
