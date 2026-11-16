/* =========================================================
   Loslaten (Mentaal welbevinden): zorgen opschrijven en wegblazen.
   Overgenomen uit de basiscode (script.js), nu als losse activiteit.

   Hoe het werkt:
   - Elke zorg (gescheiden door komma's) wordt een bolletje van de paardenbloem.
   - Via de microfoon meten we hoe hard het geluid is. Blazen = veel ruis = hoog volume.
   - Alleen LANG en RUSTIG blazen telt: pas na even doorblazen gaan de woordjes vliegen.
     Een kort, hard pufje laat ze alleen wiebelen.
   - Geen microfoon? Houd de knop ingedrukt en adem langzaam uit.
   - Er wordt niets opgenomen of opgeslagen.
   ========================================================= */
const BW_PER_SEED = 0.7;    // seconden blazen per bolletje (min. 1,5 s, max. 3 s in totaal)
const BW_MIN_STREAK = 0.35; // zo lang moet je eerst doorblazen voordat er iets wegvliegt
const BW_MAX_SEEDS = 6;     // maximaal aantal zorgen

ACTIVITEITEN.loslaten = {
  start(vak) {
    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">Schrijf op wat je dwarszit. Blaas het daarna weg.</p><img class="mini" src="images/mossy.png" alt=""></div>

      <ol class="steps" id="bwSteps" aria-label="Stappen">
        <li class="on">1 · Opschrijven</li><li>2 · Wegblazen</li><li>3 · Klaar</li>
      </ol>

      <!-- Stap 1: opschrijven -->
      <div class="bw-step" id="bwWrite">
        <label class="lbl" for="worry">Wat zit je dwars? Schrijf het in een paar woorden.</label>
        <input type="text" id="worry" maxlength="150" autocomplete="off" placeholder="toets, ruzie met Sam, moe">
        <p class="hint">Zet een <b>komma</b> tussen je zorgen. Elke zorg wordt een eigen bolletje.</p>
        <div class="preview" id="worryPreview" aria-live="polite"></div>
        <div class="count" id="worryCount">0 van max. ${BW_MAX_SEEDS}</div>
        <p class="privacy">🔒 Dit wordt nergens opgeslagen. Alleen jij ziet het.</p>
        <p class="privacy">🎤 Zo vraagt je browser om je microfoon. Mossy luistert alleen of je blaast en neemt niets op.</p>
        <button type="button" class="knop primair" id="toBlow" disabled>Verder naar wegblazen</button>
      </div>

      <!-- Stap 2: wegblazen -->
      <div class="bw-step" id="bwBlow" hidden>
        <div class="field">
          <div class="cloud" id="cloud"></div>
          <div class="stem"></div>
          <button type="button" class="hold" id="holdBtn" aria-label="Geen microfoon? Houd ingedrukt en adem langzaam uit">
            <span class="hold-ic" aria-hidden="true">🌬️</span>
            <span class="hold-small">Geen microfoon?</span>
            <b>Houd ingedrukt</b>
          </button>
        </div>
        <p class="bw-msg" id="bwMsg" aria-live="polite"></p>
        <div class="meter" aria-hidden="true"><i id="meterFill"></i><b></b></div>
        <div class="meter-lbl"><span>Blaaskracht</span><span id="bwCount"></span></div>
        <button type="button" class="sec bw-back" id="bwBack">← Tekst aanpassen</button>
      </div>

      <!-- Stap 3: klaar -->
      <div class="bw-step bw-done" id="bwDone" hidden>
        <img src="images/mossy-stretch.png" alt="Mossy steekt blij zijn armen omhoog">
        <h2>Weggeblazen 🍃</h2>
        <p>Goed gedaan. Je zorg is misschien niet helemaal weg, maar je hoeft hem nu even niet vast te houden.</p>
        <button type="button" class="knop primair" id="bwAgain">Nog iets wegblazen</button>
        <p class="note">Blijft het je dwarszitten? Praat erover met je mentor of SLB'er.</p>
      </div>`;

    const q = s => vak.querySelector(s);
    const bw = {
      step: 1, seeds: [], removed: 0, power: 0, streak: 0, lvl: 0, thr: 0.05,
      calibUntil: 0, calibSum: 0, calibN: 0, calibMax: 0, holding: false, done: false,
      stream: null, ac: null, an: null, buf: null, raf: 0, last: 0, wasBlowing: false, mode: 'mic', klaarTimer: 0
    };
    const bwMsg = t => { q('#bwMsg').textContent = t; };

    function setBwStep(n) {
      bw.step = n;
      q('#bwWrite').hidden = n !== 1;
      q('#bwBlow').hidden = n !== 2;
      q('#bwDone').hidden = n !== 3;
      vak.querySelectorAll('#bwSteps li').forEach((li, i) => {
        li.classList.toggle('on', i === n - 1);
        li.classList.toggle('done', i < n - 1);
      });
    }

    // Tekst splitsen op komma's: elke zorg wordt een bolletje (max. 6, max. 30 tekens)
    function splitWorries(text) {
      return text.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
                 .slice(0, BW_MAX_SEEDS).map(s => s.length > 30 ? s.slice(0, 29) + '…' : s);
    }

    function seedEl(text) {
      const s = document.createElement('span');
      s.className = 'seed';
      s.textContent = text; // textContent: veilig, geen HTML
      return s;
    }

    function makeSeeds(text) {
      const cloud = q('#cloud');
      cloud.innerHTML = '';
      cloud.classList.remove('empty');
      bw.seeds = splitWorries(text).map(p => cloud.appendChild(seedEl(p)));
      for (let i = bw.seeds.length - 1; i > 0; i--) { // willekeurige volgorde van wegvliegen
        const j = Math.floor(Math.random() * (i + 1));
        [bw.seeds[i], bw.seeds[j]] = [bw.seeds[j], bw.seeds[i]];
      }
    }

    function flyAway(el) {
      el.style.setProperty('--dx', (140 + Math.random() * 140) + 'px');
      el.style.setProperty('--dy', -(70 + Math.random() * 170) + 'px');
      el.style.setProperty('--r', (Math.random() * 90 - 45) + 'deg');
      el.classList.add('gone');
    }

    async function startMic() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('geen microfoon-API');
        // ruisonderdrukking UIT, anders filtert de browser het blaasgeluid juist weg
        bw.stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        if (bw.step !== 2) { stopMic(); return; } // gebruiker is al weg
        bw.ac = new (window.AudioContext || window.webkitAudioContext)();
        await bw.ac.resume();
        const src = bw.ac.createMediaStreamSource(bw.stream);
        bw.an = bw.ac.createAnalyser();
        bw.an.fftSize = 1024;
        src.connect(bw.an);
        bw.buf = new Float32Array(bw.an.fftSize);
        bw.mode = 'mic';
        bw.calibUntil = performance.now() + 900; // eerst even meten hoe stil het is
      } catch {
        if (bw.step !== 2) return;
        bw.mode = 'hold';
        q('#holdBtn').classList.add('focus');
        bwMsg('Geen microfoon gevonden of geen toestemming. Houd de knop hieronder ingedrukt en adem langzaam uit.');
      }
    }

    function stopMic() {
      cancelAnimationFrame(bw.raf);
      if (bw.stream) bw.stream.getTracks().forEach(t => t.stop());
      if (bw.ac) bw.ac.close();
      bw.stream = bw.ac = bw.an = null;
      bw.holding = false;
      q('#holdBtn').classList.remove('active');
    }

    function micLevel() {
      if (!bw.an) return 0;
      bw.an.getFloatTimeDomainData(bw.buf);
      let sum = 0;
      for (let i = 0; i < bw.buf.length; i++) sum += bw.buf[i] * bw.buf[i];
      return Math.sqrt(sum / bw.buf.length);
    }

    function bwLoop(ts) {
      const dt = Math.min(0.05, (ts - (bw.last || ts)) / 1000);
      bw.last = ts;
      const raw = micLevel();

      // Kalibreren: hoe luid is het in de ruimte als je níet blaast?
      if (bw.mode === 'mic' && ts < bw.calibUntil && !bw.holding) {
        bw.calibSum += raw; bw.calibN++; bw.calibMax = Math.max(bw.calibMax, raw);
        bwMsg('Even stil… Mossy luistert naar de ruimte.');
        bw.raf = requestAnimationFrame(bwLoop);
        return;
      }
      if (bw.calibN) {
        // drempel boven het gemiddelde én boven de hardste piek in de ruimte (praten, piepjes)
        const base = bw.calibSum / bw.calibN;
        bw.thr = Math.min(0.15, Math.max(0.012, base * 2.5, bw.calibMax * 1.15));
        bw.calibN = 0;
        bwMsg('Adem diep in door je neus… en blaas dan langzaam in de microfoon.');
      }

      const level = bw.holding ? bw.thr * 1.6 : raw;
      bw.lvl = bw.lvl * 0.75 + level * 0.25; // gladstrijken
      const blowing = !bw.done && (bw.holding || bw.lvl > bw.thr);

      if (blowing) {
        bw.streak += dt;
        if (bw.streak > BW_MIN_STREAK) bw.power += dt;
        bwMsg(bw.streak > BW_MIN_STREAK ? 'Goed zo, blijf rustig doorblazen…' : 'Blijf blazen…');
      } else if (bw.wasBlowing && !bw.done) {
        if (bw.streak > 0.15) bwMsg(bw.streak < BW_MIN_STREAK
          ? 'Iets langer! Blaas niet hard, maar langzaam en lang.'
          : 'Adem weer in… en blaas verder.');
        bw.streak = 0;
      }
      bw.wasBlowing = blowing;

      // woordjes laten wegvliegen
      const n = bw.seeds.length;
      const total = Math.min(3, Math.max(1.5, n * BW_PER_SEED));
      const needed = Math.min(n, Math.floor(bw.power / (total / n)));
      while (bw.removed < needed) flyAway(bw.seeds[bw.removed++]);
      q('#bwCount').textContent = bw.removed + ' van ' + n + ' weggeblazen';

      // meter en wiebelen
      const fill = q('#meterFill');
      fill.style.width = Math.min(100, (bw.lvl / bw.thr) * 50) + '%';
      fill.classList.toggle('ok', blowing);
      const wob = Math.min(6, (bw.lvl / bw.thr) * 3) * Math.sin(ts / 60);
      q('#cloud').style.transform = 'translateX(-50%) rotate(' + (bw.done ? 0 : wob) + 'deg)';

      if (bw.removed === n && !bw.done) {
        bw.done = true;
        q('#cloud').classList.add('empty');
        bwMsg('Alles is weggeblazen… adem rustig uit.');
        bw.klaarTimer = setTimeout(() => { stopMic(); setBwStep(3); }, 2200);
      }
      bw.raf = requestAnimationFrame(bwLoop);
    }

    // Stap 1 → 2
    function updatePreview() {
      const list = splitWorries(q('#worry').value);
      const prev = q('#worryPreview');
      prev.innerHTML = '';
      if (list.length) list.forEach(w => prev.appendChild(seedEl(w)));
      else prev.innerHTML = '<span class="ph">Je bolletjes verschijnen hier.</span>';
      q('#worryCount').textContent = list.length + ' van max. ' + BW_MAX_SEEDS;
      q('#toBlow').disabled = list.length === 0;
    }
    q('#worry').oninput = updatePreview;
    q('#worry').onkeydown = e => { if (e.key === 'Enter' && !q('#toBlow').disabled) q('#toBlow').click(); };

    q('#toBlow').onclick = () => {
      const text = q('#worry').value;
      if (!splitWorries(text).length) return;
      Object.assign(bw, { removed: 0, power: 0, streak: 0, lvl: 0, thr: 0.05, done: false,
                          wasBlowing: false, last: 0, calibSum: 0, calibN: 0, calibMax: 0, calibUntil: 0 });
      makeSeeds(text);
      q('#holdBtn').classList.remove('focus');
      setBwStep(2);
      bwMsg('Microfoon aanzetten…');
      startMic(); // direct na de klik: nodig voor iPhone/Safari
      bw.raf = requestAnimationFrame(bwLoop);
    };

    // Vasthoud-knop (als er geen microfoon is, of als het te druk is)
    const hold = q('#holdBtn');
    const holdOn = () => { bw.holding = true; hold.classList.add('active'); };
    const holdOff = () => { bw.holding = false; hold.classList.remove('active'); };
    hold.addEventListener('pointerdown', e => { hold.setPointerCapture(e.pointerId); holdOn(); });
    ['pointerup', 'pointercancel'].forEach(ev => hold.addEventListener(ev, holdOff));
    hold.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holdOn(); } });
    hold.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') holdOff(); });
    hold.addEventListener('contextmenu', e => e.preventDefault());

    // Terug naar tekst
    q('#bwBack').onclick = () => { stopMic(); setBwStep(1); q('#worry').focus(); };

    // Nog een keer
    q('#bwAgain').onclick = () => {
      q('#worry').value = '';
      updatePreview();
      setBwStep(1);
      q('#worry').focus();
    };

    updatePreview();

    // Opruimen bij weggaan (ander scherm of sessie beëindigen): microfoon uit
    return () => { clearTimeout(bw.klaarTimer); bw.step = 0; stopMic(); };
  }
};
