/* =========================================================
   Mossy's Morning Rush (Dagelijks functioneren)
   Plan Mossy's ochtend in 60 minuten door activiteiten naar de tijdlijn te slepen
   (of erop te tikken). Elke activiteit kost tijd en verandert de energie.
   Halverwege vertrekt de bus 10 minuten eerder: pas je planning aan.
   ========================================================= */
const OCHTEND_ACTIVITEITEN = [
  { id: 'douchen', emoji: '🚿', naam: 'Douchen', min: 15, energie: 10 },
  { id: 'ontbijten', emoji: '🥣', naam: 'Ontbijten', min: 15, energie: 25 },
  { id: 'studeren', emoji: '📖', naam: 'Studeren', min: 20, energie: -10 },
  { id: 'ontspannen', emoji: '🧘', naam: 'Ontspannen', min: 10, energie: 10 },
  { id: 'sporten', emoji: '🏃', naam: 'Sporten', min: 15, energie: 15 },
  { id: 'aankleden', emoji: '👕', naam: 'Aankleden', min: 5, energie: 0 },
  { id: 'snoozen', emoji: '😴', naam: 'Snoozen', min: 10, energie: 5 },
  { id: 'scrollen', emoji: '📱', naam: 'Scrollen', min: 10, energie: -10 }
];
const MR = { totaal: 60, busEerder: 10, startEnergie: 30, speeltijd: 120, gebeurtenisNa: 30 };

ACTIVITEITEN['morning-rush'] = {
  start(vak) {
    let planning, limiet, gebeurtenis, klok, seconden;
    const zoek = id => OCHTEND_ACTIVITEITEN.find(a => a.id === id);
    const minuten = () => planning.reduce((s, id) => s + zoek(id).min, 0);
    const energie = () => Math.max(0, Math.min(100, planning.reduce((s, id) => s + zoek(id).energie, MR.startEnergie)));
    const energieBalk = () => `<div class="energie"><span>Energie</span><div class="balk"><i style="width:${energie()}%"></i></div><b>${energie()}%</b></div>`;

    /* ---------- 1. Startscherm ---------- */
    function intro() {
      clearInterval(klok);
      vak.innerHTML = `
        <div class="mr-intro">
          <img src="images/mossy.png" alt="">
          <div class="kaart">
            <p class="mr-groot">⏰ Help Mossy op tijd naar school!</p>
            <p>Je hebt ${MR.totaal} minuten. Sleep activiteiten naar de tijdlijn (of tik erop).
               Plan slim en houd Mossy's energie op peil. Let op: er kan iets onverwachts gebeuren…</p>
          </div>
          <button type="button" class="knop primair" id="mrStart">Start spel</button>
        </div>`;
      vak.querySelector('#mrStart').onclick = plannen;
    }

    /* ---------- 2. Plannen ---------- */
    function plannen() {
      planning = []; limiet = MR.totaal; gebeurtenis = false; seconden = MR.speeltijd;
      vak.innerHTML = `
        <div class="mr-status" aria-live="polite"></div>
        <div class="mr-tegels" role="group" aria-label="Activiteiten"></div>
        <div class="mr-schaal" aria-hidden="true"><span>0</span><span>15</span><span>30</span><span>45</span><span>60</span></div>
        <div class="tijdlijn" id="tijdlijn"></div>
        <ul class="mr-gepland" aria-label="Jouw planning"></ul>
        <div class="mr-melding" aria-live="assertive"></div>
        <div class="acties rij mr-onder">
          <span class="mr-klok" role="timer" aria-label="Speeltijd"></span>
          <button type="button" class="knop primair" id="mrKlaar">Klaar met plannen</button>
        </div>`;
      vak.querySelector('#mrKlaar').onclick = () => { if (!gebeurtenis) busGebeurtenis(); else resultaat(); };
      sleepbaar(vak.querySelector('.mr-tegels'), vak.querySelector('#tijdlijn'), voegToe);
      klok = setInterval(() => { seconden--; tekenKlok(); if (seconden <= 0) resultaat(); }, 1000);
      tekenPlan();
      tekenKlok();
    }

    function tekenKlok() {
      vak.querySelector('.mr-klok').textContent = '⏱ ' + Math.floor(seconden / 60) + ':' + String(seconden % 60).padStart(2, '0');
    }

    function voegToe(id) {
      if (planning.includes(id)) return;
      planning.push(id);
      tekenPlan();
      if (!gebeurtenis && minuten() >= MR.gebeurtenisNa) busGebeurtenis();
    }

    function haalWeg(id) {
      planning = planning.filter(p => p !== id);
      tekenPlan();
    }

    function busGebeurtenis() {
      gebeurtenis = true;
      limiet = MR.totaal - MR.busEerder;
      tekenPlan();
    }

    function tekenPlan() {
      const over = limiet - minuten();
      vak.querySelector('.mr-status').innerHTML =
        `<span class="mr-tijd ${over < 0 ? 'te-veel' : ''}">⏱ ${over >= 0 ? 'Nog ' + over + ' min' : -over + ' min te veel'}</span>${energieBalk()}`;

      vak.querySelector('.mr-tegels').innerHTML = OCHTEND_ACTIVITEITEN.map(a => `
        <button type="button" class="mr-tegel" data-id="${a.id}" ${planning.includes(a.id) ? 'disabled' : ''}>
          <span class="mr-emoji" aria-hidden="true">${a.emoji}</span><b>${a.naam}</b><small>${a.min} min · energie ${a.energie >= 0 ? '+' : ''}${a.energie}</small>
        </button>`).join('');

      const lijn = vak.querySelector('#tijdlijn');
      lijn.innerHTML = (planning.length ? '' : '<span class="mr-leeg">Sleep een activiteit hierheen of tik erop</span>') +
        planning.map(id => { const a = zoek(id); return `<span class="mr-blok" style="width:${100 * a.min / MR.totaal}%" title="${a.naam}">${a.emoji}</span>`; }).join('') +
        (gebeurtenis ? `<span class="mr-bus" style="width:${100 * MR.busEerder / MR.totaal}%">🚌</span>` : '');

      vak.querySelector('.mr-gepland').innerHTML = planning.map(id => { const a = zoek(id); return `
        <li><span aria-hidden="true">${a.emoji}</span> ${a.naam} · ${a.min} min
          <button type="button" class="mr-weg" data-weg="${a.id}" aria-label="${a.naam} weghalen">✕</button></li>`; }).join('');
      vak.querySelectorAll('[data-weg]').forEach(b => (b.onclick = () => haalWeg(b.dataset.weg)));

      vak.querySelector('.mr-melding').innerHTML = gebeurtenis
        ? `<p class="mr-oeps">🚌 Oeps! De bus vertrekt ${MR.busEerder} minuten eerder. ${over < 0 ? 'Haal iets weg zodat je planning weer past.' : 'Je planning past nog. Goed zo!'}</p>`
        : '';
      const klaar = vak.querySelector('#mrKlaar');
      klaar.disabled = !planning.length || over < 0;
      klaar.textContent = gebeurtenis ? 'Klaar met plannen' : 'Volgende';
    }

    /* ---------- 3. Resultaat ---------- */
    function resultaat() {
      clearInterval(klok);
      const opTijd = minuten() <= limiet, e = energie();
      const tip = !planning.includes('ontbijten') ? 'Een ontbijt geeft energie voor de hele ochtend.'
        : limiet - minuten() === 0 ? 'Laat wat ruimte over voor onverwachte dingen.'
        : e < 50 ? 'Kies ook iets wat je energie geeft, zoals ontspannen of bewegen.'
        : 'Een beetje speling in je planning geeft rust als er iets tegenzit.';

      vak.innerHTML = `
        <div class="kaart mr-resultaat">
          <h2 tabindex="-1">Jouw ochtend</h2>
          <p class="label">Gekozen activiteiten</p>
          <ul class="mr-gepland">${planning.map(id => `<li><span aria-hidden="true">${zoek(id).emoji}</span> ${zoek(id).naam}</li>`).join('') || '<li>Nog niets gepland</li>'}</ul>
          ${energieBalk()}
          <p class="mr-groot">${opTijd && planning.length ? '✅ Je hebt je ochtend gepland! Mossy haalt de bus.' : '⏰ Mossy heeft de bus gemist. Probeer het nog eens!'}</p>
          <div class="mr-tips">
            <p class="kaart"><b>Wat zou je anders doen?</b><br>Denk aan je eigen ochtend: wat helpt jou om goed te beginnen?</p>
            <p class="kaart"><b>💡 Tip van Mossy</b><br>${tip}</p>
          </div>
          <div class="acties rij"><button type="button" class="knop primair" id="mrOpnieuw">Opnieuw spelen</button></div>
        </div>`;
      vak.querySelector('#mrOpnieuw').onclick = plannen;
      vak.querySelector('h2').focus();
    }

    intro();
    return () => clearInterval(klok);
  }
};

/* Slepen met muis of vinger (pointer events). Tikken of Enter op een tegel werkt ook. */
function sleepbaar(tegels, doel, opNeerzetten) {
  let sleep = null, negeerKlik = false;

  tegels.addEventListener('click', e => {
    const tegel = e.target.closest('.mr-tegel');
    if (tegel && !negeerKlik) opNeerzetten(tegel.dataset.id);
    negeerKlik = false;
  });

  tegels.addEventListener('pointerdown', e => {
    const tegel = e.target.closest('.mr-tegel');
    if (!tegel || tegel.disabled) return;
    sleep = { tegel, x: e.clientX, y: e.clientY, kopie: null };
    tegel.setPointerCapture(e.pointerId);
  });

  tegels.addEventListener('pointermove', e => {
    if (!sleep) return;
    if (!sleep.kopie && Math.hypot(e.clientX - sleep.x, e.clientY - sleep.y) > 8) {
      sleep.kopie = sleep.tegel.cloneNode(true);
      sleep.kopie.classList.add('mr-sleep');
      document.body.append(sleep.kopie);
    }
    if (!sleep.kopie) return;
    sleep.kopie.style.left = e.clientX + 'px';
    sleep.kopie.style.top = e.clientY + 'px';
    doel.classList.toggle('erboven', boven(doel, e));
  });

  const stop = e => {
    if (!sleep) return;
    if (sleep.kopie) {
      sleep.kopie.remove();
      negeerKlik = true; // de klik die direct na het slepen komt, telt niet als tik
      setTimeout(() => { negeerKlik = false; });
      if (e.type === 'pointerup' && boven(doel, e)) opNeerzetten(sleep.tegel.dataset.id);
    }
    doel.classList.remove('erboven');
    sleep = null;
  };
  tegels.addEventListener('pointerup', stop);
  tegels.addEventListener('pointercancel', stop);
}

function boven(el, e) {
  const r = el.getBoundingClientRect();
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20;
}
