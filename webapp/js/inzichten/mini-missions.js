/* =========================================================
   Mossy's Mini Missions (Dagelijks functioneren)
   Een licht rommelige kamer die opruimt terwijl de student een taak
   opknipt in drie eigen stappen en die stappen organiseert.
   Vragen en statussen: data/inzichten.js -> dagelijks
   ========================================================= */
// Plek van elk voorwerp: [x, y, draaiing] rommelig en opgeruimd (beeld van 360 x 240).
const KAMER = {
  papier1: { rommel: [176, 196, -28], netjes: [318, 128, 0] },
  papier2: { rommel: [236, 126, 18], netjes: [318, 125, -2] },
  papier3: { rommel: [304, 208, 38], netjes: [318, 122, 2] },
  boek: { rommel: [144, 214, 78], netjes: [62, 37, 0] },
  tas: { rommel: [262, 212, -72], netjes: [212, 184, 0] },
  kaart0: { rommel: [196, 170, -22], netjes: [208, 62, 0] },
  kaart1: { rommel: [126, 118, 24], netjes: [256, 62, 0] },
  kaart2: { rommel: [290, 168, 14], netjes: [304, 62, 0] }
};

INZICHTEN['mini-missions'] = {
  start(vak, { cfg, staat, bewaar }) {
    const leeg = () => ({ tekst: '', status: 'todo', wanneer: '' });
    const s = { taak: '', stappen: [leeg(), leeg(), leeg()], fase: 'taak', ...staat };
    const opslaan = () => bewaar({ ...s, stappen: s.stappen.map(st => ({ ...st })) });
    const statusTekst = k => cfg.statussen.find(([w]) => w === k)[1];

    /* ---------- De kamer ---------- */
    // Hoe verder de student is, hoe netter de kamer: papieren -> boek -> tas -> taakkaartjes.
    const FASEN = ['taak', 'stap0', 'stap1', 'stap2', 'organiseren', 'klaar'];
    function netjes(ding) {
      const niveau = FASEN.indexOf(s.fase);
      if (ding.startsWith('papier')) return niveau >= 1;
      if (ding === 'boek') return niveau >= 2;
      if (ding === 'tas') return niveau >= 3;
      return niveau >= 4; // taakkaartjes krijgen een vaste plek op het bord
    }
    const plek = ding => {
      const [x, y, r] = KAMER[ding][netjes(ding) ? 'netjes' : 'rommel'];
      return `transform: translate(${x}px, ${y}px) rotate(${r}deg)`;
    };
    const papier = '<rect x="-14" y="-18" width="28" height="36" rx="3" fill="#fff" stroke="#c3d2d9"/><g stroke="#d6e9c2" stroke-width="2"><line x1="-8" x2="8" y1="-9" y2="-9"/><line x1="-8" x2="8" y1="-2" y2="-2"/><line x1="-8" x2="4" y1="5" y2="5"/></g>';

    function kamer() {
      const opgeruimd = Object.keys(KAMER).filter(netjes).length;
      return `
        <svg class="kamer" viewBox="0 0 360 240" role="img" aria-label="Mossy's kamer: ${opgeruimd} van ${Object.keys(KAMER).length} dingen opgeruimd">
          <rect width="360" height="240" fill="#f3f9ea"/>
          <rect y="200" width="360" height="40" fill="#e2f2cb"/>
          <rect x="170" y="24" width="174" height="74" rx="10" fill="#fff" stroke="#d6e9c2" stroke-width="2"/>
          <rect x="26" y="58" width="104" height="7" rx="3.5" fill="#d2b48c"/>
          <rect x="150" y="140" width="204" height="12" rx="6" fill="#d9b88f"/>
          <rect x="162" y="152" width="9" height="50" rx="4" fill="#c9a77c"/><rect x="333" y="152" width="9" height="50" rx="4" fill="#c9a77c"/>
          <g class="mm-ding" style="${plek('papier1')}">${papier}</g>
          <g class="mm-ding" style="${plek('papier2')}">${papier}</g>
          <g class="mm-ding" style="${plek('papier3')}">${papier}</g>
          <g class="mm-ding" style="${plek('boek')}"><rect x="-7" y="-20" width="14" height="40" rx="3" fill="#7b6fd0"/><rect x="-7" y="-14" width="14" height="4" fill="#fff" opacity=".7"/></g>
          <g class="mm-ding" style="${plek('tas')}"><rect x="-16" y="-18" width="32" height="36" rx="9" fill="#f26a21"/><rect x="-10" y="2" width="20" height="11" rx="4" fill="#fff" opacity=".35"/><path d="M-8 -18 Q0 -30 8 -18" stroke="#c24f12" stroke-width="3" fill="none"/></g>
          ${s.stappen.map((st, i) => `
            <g class="mm-ding kaartje ${st.status}" style="${plek('kaart' + i)}">
              <rect x="-18" y="-12" width="36" height="24" rx="5"/>
              <text y="5" text-anchor="middle">${st.status === 'gedaan' ? '✓' : i + 1}</text>
              ${netjes('kaart' + i) ? '<circle cy="-12" r="3" fill="#e5202e"/>' : ''}
            </g>`).join('')}
          <image href="images/mossy-book.png" x="4" y="122" width="108" height="108"/>
        </svg>`;
    }

    /* ---------- Stappen ---------- */
    function teken(focus) {
      let onder = '';
      if (s.fase === 'taak') {
        onder = vraag('mmTaak', cfg.taakVraag, s.taak, cfg.taakVoorbeeld, '', 'Volgende');
      } else if (s.fase.startsWith('stap')) {
        const i = +s.fase.slice(4);
        onder = `<p class="mm-taak"><span class="label">Jouw taak</span> ${esc(s.taak)}</p>
          <p class="klein">Stap ${i + 1} van 3</p>
          ${vraag('mmStap', cfg.stapVragen[i], s.stappen[i].tekst, '', 'Vorige', i < 2 ? 'Volgende' : 'Organiseer je stappen')}`;
      } else {
        const klaar = s.fase === 'klaar';
        onder = `
          <p class="mm-taak"><span class="label">Jouw taak</span> ${esc(s.taak)}</p>
          ${klaar ? '' : '<p class="instructie">Zet je stappen in de volgorde die jij wilt en kies per stap: plannen of gedaan.</p>'}
          <ol class="mm-stappen">${s.stappen.map((st, i) => stapKaart(st, i, klaar)).join('')}</ol>
          <div class="acties rij">${klaar
            ? '<button type="button" class="knop" id="mmAanpassen">Pas je stappen aan</button>'
            : '<button type="button" class="knop" id="mmVorige">Vorige</button><button type="button" class="knop primair" id="mmKlaar">Klaar</button>'}</div>`;
      }
      vak.innerHTML = `<div class="inzicht-beeld kamer-beeld">${kamer()}</div>${onder}`;
      koppel();
      const el = focus && vak.querySelector(focus);
      if (el) el.focus();
    }

    function vraag(id, tekst, waarde, voorbeeld, terug, verder) {
      return `
        <label class="vraag-label" for="${id}">${tekst}</label>
        <input type="text" id="${id}" maxlength="120" autocomplete="off" value="${esc(waarde)}" placeholder="${voorbeeld}">
        <div class="acties rij">
          ${terug ? `<button type="button" class="knop" id="mmTerug">${terug}</button>` : ''}
          <button type="button" class="knop primair" id="mmVerder" ${waarde.trim() ? '' : 'disabled'}>${verder}</button>
        </div>`;
    }

    function stapKaart(st, i, klaar) {
      const status = `<span class="mm-status ${st.status}">${statusTekst(st.status)}${st.status === 'gepland' && st.wanneer ? ' · ' + esc(st.wanneer) : ''}</span>`;
      if (klaar) return `<li class="mm-stap ${st.status}"><span class="mm-nr">${i + 1}</span><span class="mm-tekst">${esc(st.tekst)}</span>${status}</li>`;
      return `
        <li class="mm-stap ${st.status}">
          <div class="mm-rij">
            <span class="mm-nr">${i + 1}</span>
            <label class="sr-only" for="mmTekst${i}">Stap ${i + 1}</label>
            <input type="text" id="mmTekst${i}" data-tekst="${i}" maxlength="120" value="${esc(st.tekst)}">
            <span class="mm-volgorde">
              <button type="button" data-omhoog="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Stap ${i + 1} omhoog">↑</button>
              <button type="button" data-omlaag="${i}" ${i === 2 ? 'disabled' : ''} aria-label="Stap ${i + 1} omlaag">↓</button>
            </span>
          </div>
          ${segment('status' + i, cfg.statussen, st.status, 'Status van stap ' + (i + 1))}
          ${st.status === 'gepland' ? `<label class="mm-wanneer">Wanneer? <input type="text" data-wanneer="${i}" maxlength="40" value="${esc(st.wanneer)}" placeholder="bijv. morgen na de les"></label>` : ''}
          ${status}
        </li>`;
    }

    function naar(fase, focus) { s.fase = fase; opslaan(); teken(focus); }

    function koppel() {
      const q = sel => vak.querySelector(sel);
      // Vragen
      const invoer = q('#mmTaak') || q('#mmStap');
      if (invoer) {
        const i = s.fase.startsWith('stap') ? +s.fase.slice(4) : -1;
        invoer.oninput = () => {
          if (i < 0) s.taak = invoer.value; else s.stappen[i].tekst = invoer.value;
          opslaan();
          q('#mmVerder').disabled = !invoer.value.trim();
        };
        invoer.onkeydown = e => { if (e.key === 'Enter' && !q('#mmVerder').disabled) q('#mmVerder').click(); };
        q('#mmVerder').onclick = () => naar(i < 0 ? 'stap0' : i < 2 ? 'stap' + (i + 1) : 'organiseren', i < 2 ? 'input' : '[data-status0]');
        if (q('#mmTerug')) q('#mmTerug').onclick = () => naar(i === 0 ? 'taak' : 'stap' + (i - 1), 'input');
      }
      // Organiseren
      vak.querySelectorAll('[data-tekst]').forEach(v => (v.oninput = () => { s.stappen[+v.dataset.tekst].tekst = v.value; opslaan(); }));
      vak.querySelectorAll('[data-wanneer]').forEach(v => (v.oninput = () => { s.stappen[+v.dataset.wanneer].wanneer = v.value; opslaan(); }));
      s.stappen.forEach((st, i) => vak.querySelectorAll(`[data-status${i}]`).forEach(b => (b.onclick = () => {
        st.status = b.getAttribute('data-status' + i);
        opslaan();
        teken(`[data-status${i}="${st.status}"]`);
      })));
      const wissel = (a, b) => { [s.stappen[a], s.stappen[b]] = [s.stappen[b], s.stappen[a]]; opslaan(); };
      vak.querySelectorAll('[data-omhoog]').forEach(b => (b.onclick = () => { const i = +b.dataset.omhoog; wissel(i, i - 1); teken(`[data-omhoog="${i - 1}"]`); }));
      vak.querySelectorAll('[data-omlaag]').forEach(b => (b.onclick = () => { const i = +b.dataset.omlaag; wissel(i, i + 1); teken(`[data-omlaag="${i + 1}"]`); }));
      if (q('#mmVorige')) q('#mmVorige').onclick = () => naar('stap2', 'input');
      if (q('#mmKlaar')) q('#mmKlaar').onclick = () => {
        const leegNr = s.stappen.findIndex(st => !st.tekst.trim());
        if (leegNr >= 0) { q(`[data-tekst="${leegNr}"]`).focus(); return; }
        naar('klaar', '#mmAanpassen');
      };
      if (q('#mmAanpassen')) q('#mmAanpassen').onclick = () => naar('organiseren', '[data-status0]');
    }

    teken();
  }
};
