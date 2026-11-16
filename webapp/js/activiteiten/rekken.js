/* Rekken (Lichaamsfuncties): kort (1 min) of volledig (3 min) */
ACTIVITEITEN.rekken = {
  start(vak) {
    const OEFENINGEN = [
      ['🙆', 'Nek kantelen', 'Kantel één oor naar je schouder en wissel halverwege.'],
      ['🔄', 'Schouders rollen', 'Rol je schouders in grote, langzame cirkels naar achteren.'],
      ['🙌', 'Strek je lang uit', 'Vouw je vingers in elkaar en strek je armen omhoog naar het plafond.'],
      ['🌀', 'Zittende draai', 'Leg een hand op de tegenovergestelde knie, draai rustig en kijk achter je. Wissel halverwege.'],
      ['🤲', 'Polsen en handen', 'Strek één arm voor je uit en trek de vingers voorzichtig naar je toe. Wissel halverwege.'],
      ['👀', 'Oogpauze', 'Kijk naar iets in de verte en knipper dan langzaam met je ogen.']
    ];
    const SETS = { q: { lijst: [0, 1, 2, 5], sec: 15 }, f: { lijst: [0, 1, 2, 3, 4, 5], sec: 30 } };

    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">Veel gezeten? Beweeg een minuutje.</p><img class="mini" src="images/mossy-stretch.png" alt=""></div>
      <div class="chips" id="stLen">
        <button type="button" class="chip on" data-v="q" aria-pressed="true">Kort · 1 min</button>
        <button type="button" class="chip" data-v="f" aria-pressed="false">Volledig · 3 min</button>
      </div>
      <div class="stage stretch-stage" aria-live="polite">
        <div id="stEmoji" aria-hidden="true">🤸</div>
        <div id="stName">Klaar?</div>
        <p id="stText" class="sub">Kies een duur en druk op start.</p>
        <div class="dots" id="stDots"></div>
        <div class="bar"><i id="stBar"></i></div>
        <div id="stClock"></div>
      </div>
      <button type="button" class="knop primair" id="stBtn">Start</button>`;

    const q = s => vak.querySelector(s);
    let set = SETS.q, timer = null, index = 0, over = 0;

    function bolletjes() {
      q('#stDots').innerHTML = set.lijst.map((_, i) => `<b class="${timer && i <= index ? 'on' : ''}"></b>`).join('');
    }

    function toon() {
      const [emoji, naam, tekst] = OEFENINGEN[set.lijst[index]];
      q('#stEmoji').textContent = emoji;
      q('#stName').textContent = naam;
      q('#stText').textContent = tekst;
      q('#stClock').textContent = '0:' + String(over).padStart(2, '0');
      q('#stBar').style.transition = over === set.sec ? 'none' : '';
      q('#stBar').style.width = (100 * (set.sec - over) / set.sec) + '%';
      bolletjes();
    }

    function reset(klaar) {
      clearInterval(timer);
      timer = null;
      q('#stBtn').textContent = 'Start';
      q('#stBar').style.transition = 'none';
      q('#stBar').style.width = '0';
      q('#stEmoji').textContent = klaar ? '🙏' : '🤸';
      q('#stName').textContent = klaar ? 'Goed gedaan' : 'Klaar?';
      q('#stText').textContent = klaar ? 'Terug aan het werk met een helderder hoofd.' : 'Kies een duur en druk op start.';
      q('#stClock').textContent = '';
      bolletjes();
    }

    q('#stLen').onclick = e => {
      const chip = e.target.closest('.chip');
      if (!chip || timer) return;
      vak.querySelectorAll('#stLen .chip').forEach(k => { k.classList.toggle('on', k === chip); k.setAttribute('aria-pressed', k === chip); });
      set = SETS[chip.dataset.v];
      reset();
    };

    q('#stBtn').onclick = () => {
      if (timer) return reset();
      index = 0;
      over = set.sec;
      q('#stBtn').textContent = 'Stop';
      timer = setInterval(() => {
        if (--over <= 0) {
          if (++index >= set.lijst.length) return reset(true);
          over = set.sec;
        }
        toon();
      }, 1000);
      toon(); // na setInterval, zodat het eerste bolletje meteen oplicht
    };

    reset();
    return () => clearInterval(timer);
  }
};
