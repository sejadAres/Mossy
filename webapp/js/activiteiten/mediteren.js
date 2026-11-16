/* Mediteren (Zingeving): timer van 5, 10 of 15 minuten met een onderwerp om over na te denken */
const MEDITATIE_THEMAS = {
  gevoel: { naam: 'Gevoelens', kleur: '#1f86c8' },
  waarde: { naam: 'Waarden', kleur: '#7b3f98' },
  dank: { naam: 'Dankbaarheid', kleur: '#f7a21b' },
  ik: { naam: 'Wie ben ik?', kleur: '#64b255' }
};

const MEDITATIE_ONDERWERPEN = [
  ['gevoel', 'Welk gevoel duw je de laatste tijd weg? Geef het een naam, bijvoorbeeld angst, verdriet of boosheid. Stel je voor dat je er ruimte voor maakt in je lichaam.'],
  ['gevoel', 'Mag je verdrietig zijn zonder het meteen op te lossen? Laat het verdriet er even zijn en kijk wat er gebeurt.'],
  ['gevoel', 'Wat voel je nu in je lichaam: onrust, rust of verveling? Kijk er alleen naar, zonder er iets aan te veranderen.'],
  ['gevoel', 'Denk aan iets moeilijks in je leven. Zeg rustig tegen jezelf: dit gaat voorbij, gevoelens veranderen.'],
  ['gevoel', 'Waar voel je spanning in je lichaam? Adem rustig naar die plek toe en laat de spanning zachter worden.'],
  ['gevoel', 'Ben je nog ergens boos over? Hoe zou het voelen om het los te laten, voor je eigen rust?'],
  ['waarde', 'Wat vind jij vandaag het belangrijkst: eerlijkheid, geduld of creativiteit? Past wat je doet daarbij?'],
  ['waarde', 'Noem drie dingen die jij echt belangrijk vindt in het leven. Leef je daar op dit moment naar?'],
  ['waarde', 'Welke keuze of richting voelt nu het meest als ‘echt jij’?'],
  ['waarde', 'Waar wil je over een jaar staan? Welke kleine stap kun je deze week zetten?'],
  ['waarde', 'Welk gedrag van iemand anders irriteert je? Herken je daar soms ook iets van in jezelf?'],
  ['waarde', 'Wanneer was je voor het laatst trots op hoe je iets hebt aangepakt? Wat zegt dat over jou?'],
  ['dank', 'Sta stil bij drie dingen in je leven waar je op dit moment dankbaar voor bent.'],
  ['dank', 'Noem drie kleine, gewone dingen van vandaag die je blij of rustig maakten.'],
  ['dank', 'Aan wie ben je dankbaar? Wat zou je tegen die persoon willen zeggen?'],
  ['dank', 'Wat kan je lichaam allemaal? Denk aan dingen waar je normaal niet bij stilstaat.'],
  ['dank', 'Denk aan een fijne herinnering. Wat zie, hoor en voel je?'],
  ['dank', 'Welke plek geeft jou rust? Stel je voor dat je daar nu bent.'],
  ['ik', 'Wie ben je zonder je cijfers, je werk of wat anderen van je vinden?'],
  ['ik', 'Waar ben je streng voor jezelf? Wat zou je zeggen tegen een goede vriend in dezelfde situatie?'],
  ['ik', 'Welke drie woorden passen echt bij jou?'],
  ['ik', 'Waar ben je goed in, ook als niemand het zegt?'],
  ['ik', 'Wat heb jij vandaag nodig om je goed te voelen?'],
  ['ik', 'Wanneer voel je je het meest jezelf? Waar ben je dan, en met wie?']
];

ACTIVITEITEN.mediteren = {
  start(vak) {
    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">Kies een duur en kom tot rust.</p><img class="mini" src="images/mossy-yoga.png" alt=""></div>
      <div class="chips" id="chips">${[5, 10, 15].map(m =>
        `<button type="button" class="chip${m === 5 ? ' on' : ''}" data-min="${m}" aria-pressed="${m === 5}">${m} min</button>`).join('')}</div>
      <div class="stage med-stage">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--ring)" stroke-width="5"/>
          <circle id="arc" cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" stroke-width="5"
                  stroke-linecap="round" stroke-dasharray="339.3" stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
        </svg>
        <div class="dial">
          <button type="button" class="plus" id="mPlus" disabled aria-label="Eén minuut erbij">+1 min</button>
          <div id="time" role="timer">5:00</div>
          <div class="ctrls">
            <button type="button" class="ctl" id="mPause" disabled><span>Pauze</span></button>
            <button type="button" class="ctl" id="mRestart"><span>Opnieuw</span></button>
          </div>
        </div>
      </div>
      <p id="mState" class="mstate" aria-live="polite"></p>
      <button type="button" class="knop primair" id="mBtn">Begin</button>
      <div class="topic" id="topic" aria-live="polite">
        <span class="tag" id="topicTag" hidden><i class="dd"></i><span></span></span>
        <p id="topicText" class="empty"></p>
      </div>
      <div class="topic-actions">
        <button type="button" class="sec" id="prevBtn" hidden>← Vorig onderwerp</button>
        <button type="button" class="gen" id="genBtn"><span class="spin" aria-hidden="true">🔄</span>Genereer</button>
      </div>`;

    const q = s => vak.querySelector(s);
    const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

    /* ---- Timer. Status: 'idle' (klaar), 'running' (loopt), 'paused' (gepauzeerd) ---- */
    let minuten = 5, timer = null, over = 0, totaal = 0, status = 'idle';

    function teken() {
      q('#time').classList.remove('done');
      q('#time').textContent = fmt(over);
      q('#arc').style.strokeDashoffset = 339.3 * (1 - over / totaal);
    }

    function zetStatus(s) {
      status = s;
      const actief = s !== 'idle';
      q('#mBtn').textContent = actief ? 'Stop' : 'Begin';
      q('#mPlus').disabled = !actief;
      q('#mPause').disabled = !actief;
      q('#mPause span').textContent = s === 'paused' ? 'Verder' : 'Pauze';
      q('#chips').classList.toggle('locked', actief);
      vak.classList.toggle('is-paused', s === 'paused');
      q('#mState').textContent = s === 'running' ? 'Bezig met mediteren…' : s === 'paused' ? 'Gepauzeerd. Tik op Verder om door te gaan.' : '';
    }

    function tik() {
      over--;
      teken();
      if (over > 0) return;
      reset();
      q('#time').textContent = 'Goed gedaan 🙏';
      q('#time').classList.add('done');
      q('#mState').textContent = 'Klaar! Kies een duur om opnieuw te beginnen.';
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(tik, 1000);
      zetStatus('running');
    }

    function reset() {
      clearInterval(timer);
      timer = null;
      totaal = over = minuten * 60;
      teken();
      zetStatus('idle');
    }

    q('#chips').onclick = e => {
      const chip = e.target.closest('.chip');
      if (!chip || status !== 'idle') return;
      minuten = +chip.dataset.min;
      vak.querySelectorAll('#chips .chip').forEach(k => { k.classList.toggle('on', k === chip); k.setAttribute('aria-pressed', k === chip); });
      reset();
    };
    q('#mBtn').onclick = () => (status === 'idle' ? startTimer() : reset());
    q('#mPause').onclick = () => {
      if (status === 'running') { clearInterval(timer); timer = null; zetStatus('paused'); } else if (status === 'paused') startTimer();
    };
    q('#mPlus').onclick = () => { if (status !== 'idle') { over += 60; totaal += 60; teken(); } };
    q('#mRestart').onclick = () => {
      reset();
      resetOnderwerp();
      q('#mState').textContent = 'Timer en onderwerp staan weer op het begin.';
    };

    /* ---- Onderwerp: geschudde "zak", je ziet alles één keer voordat er iets terugkomt ---- */
    let zak = [], geschiedenis = [], huidig = -1;

    function volgende() {
      if (!zak.length) {
        zak = MEDITATIE_ONDERWERPEN.map((_, i) => i);
        for (let i = zak.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [zak[i], zak[j]] = [zak[j], zak[i]]; }
        if (zak[zak.length - 1] === huidig) zak.unshift(zak.pop()); // nooit twee keer hetzelfde achter elkaar
      }
      return zak.pop();
    }

    function toonOnderwerp(i) {
      huidig = i;
      const [thema, tekst] = MEDITATIE_ONDERWERPEN[i], th = MEDITATIE_THEMAS[thema];
      q('#topicTag').hidden = false;
      q('#topicTag .dd').style.background = th.kleur;
      q('#topicTag span').textContent = th.naam;
      q('#topicText').textContent = tekst;
      q('#topicText').classList.remove('empty');
      q('#prevBtn').hidden = geschiedenis.length === 0;
    }

    function resetOnderwerp() {
      zak = []; geschiedenis = []; huidig = -1;
      q('#topicTag').hidden = true;
      q('#topicText').innerHTML = 'Tik op <b>Genereer</b> voor een onderwerp om over na te denken tijdens het mediteren.';
      q('#topicText').classList.add('empty');
      q('#prevBtn').hidden = true;
    }

    q('#genBtn').onclick = () => {
      if (huidig !== -1) geschiedenis.push(huidig);
      toonOnderwerp(volgende());
    };
    q('#prevBtn').onclick = () => { if (geschiedenis.length) toonOnderwerp(geschiedenis.pop()); };

    reset();
    resetOnderwerp();
    return () => clearInterval(timer);
  }
};
