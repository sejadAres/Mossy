/* Geluiden (Kwaliteit van leven): witte ruis, regen en oceaan, gemaakt met de Web Audio API */
ACTIVITEITEN.geluiden = {
  start(vak) {
    const GELUIDEN = [
      ['white', '⚪', 'Witte ruis', 'Gelijkmatig en neutraal'],
      ['rain', '🌧️', 'Regen', 'Zacht, helder getik'],
      ['ocean', '🌊', 'Oceaan', 'Langzaam rollende golven']
    ];
    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">Tik om af te spelen. Tik nogmaals om te stoppen.</p><img class="mini" src="images/mossy-headphones.png" alt=""></div>
      <div id="list">${GELUIDEN.map(([id, ic, naam, uitleg]) =>
        `<button type="button" class="card" data-id="${id}" aria-pressed="false"><div class="ic" aria-hidden="true">${ic}</div><div><b>${naam}</b><span>${uitleg}</span></div><div class="st"></div></button>`).join('')}</div>
      <label class="lbl" for="vol">Volume</label>
      <input type="range" id="vol" min="0" max="100" value="50">`;

    let ctx, master, huidig = null, volume = 0.5;

    function stopGeluid() {
      if (!huidig) return;
      huidig.bron.stop();
      huidig.extra.forEach(o => o.stop());
      huidig = null;
    }

    function speel(id) {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.connect(ctx.destination);
      }
      master.gain.value = volume;
      ctx.resume();
      stopGeluid();

      // 2 seconden ruis die blijft herhalen
      const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const bron = ctx.createBufferSource();
      bron.buffer = buf;
      bron.loop = true;
      const extra = [], g = ctx.createGain();
      g.gain.value = 0.4;

      if (id === 'white') {
        bron.connect(g);
      } else {
        const f = ctx.createBiquadFilter();
        f.type = id === 'rain' ? 'highpass' : 'lowpass';
        f.frequency.value = id === 'rain' ? 1200 : 500;
        bron.connect(f); f.connect(g);
        if (id === 'ocean') { // langzame golfbeweging
          const golf = ctx.createOscillator(), diepte = ctx.createGain();
          golf.frequency.value = 0.1;
          diepte.gain.value = 0.3;
          golf.connect(diepte); diepte.connect(g.gain);
          golf.start();
          extra.push(golf);
        }
      }
      g.connect(master);
      bron.start();
      huidig = { id, bron, extra };
    }

    vak.querySelector('#list').onclick = e => {
      const kaart = e.target.closest('.card');
      if (!kaart) return;
      if (huidig && huidig.id === kaart.dataset.id) stopGeluid(); else speel(kaart.dataset.id);
      vak.querySelectorAll('.card').forEach(k => {
        const aan = Boolean(huidig && huidig.id === k.dataset.id);
        k.classList.toggle('on', aan);
        k.setAttribute('aria-pressed', aan);
        k.querySelector('.st').textContent = aan ? 'Speelt' : '';
      });
    };

    vak.querySelector('#vol').oninput = e => {
      volume = e.target.value / 100;
      if (master) master.gain.value = volume;
    };

    return () => { stopGeluid(); if (ctx) ctx.close(); };
  }
};
