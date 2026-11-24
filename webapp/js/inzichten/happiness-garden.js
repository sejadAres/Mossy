/* =========================================================
   Mossy's Happiness Garden (Kwaliteit van leven)
   1. Kies wat je gelukkig maakt: elke keuze groeit als eigen plant.
   2. Wijs een plant aan waar je meer aandacht aan wilt geven.
   3. Eindbeeld: jouw tuin met een kort overzicht.
   Keuzes, plantvormen en teksten: data/inzichten.js -> kwaliteit
   ========================================================= */
// Vaste plek per keuze (x, y van de voet van de plant in het beeld van 360 x 272).
const TUIN_PLEKKEN = [[128, 122], [208, 110], [290, 122], [150, 234], [232, 226], [312, 236]];
const TUIN_H = 272;

/* Plantvormen: allemaal dezelfde stijl (groene steel, ronde vormen). */
const PLANTEN = {
  bloem: k => `${steel(46)}${blad(-1, -18)}${blad(1, -28)}
    <g transform="translate(0 -54)">${Array.from({ length: 8 }, (_, i) => `<ellipse rx="7" ry="13" cy="-12" fill="${k}" transform="rotate(${i * 45})"/>`).join('')}<circle r="7" fill="#ffd66b"/></g>`,
  varen: () => Array.from({ length: 5 }, (_, i) => {
    const hoek = -50 + i * 25, lang = i === 2 ? 52 : 42;
    return `<g transform="rotate(${hoek})"><path d="M0 0 Q4 ${-lang / 2} 0 ${-lang}" stroke="#4f9a43" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${Array.from({ length: 4 }, (_, j) => `<ellipse cx="${j % 2 ? 6 : -6}" cy="${-12 - j * 9}" rx="6" ry="3.2" fill="#64b255" transform="rotate(${j % 2 ? -30 : 30} ${j % 2 ? 6 : -6} ${-12 - j * 9})"/>`).join('')}</g>`;
  }).join(''),
  bloemetjes: k => [[-14, 30], [0, 42], [14, 34]].map(([x, h]) =>
    `<path d="M${x} 0 V${-h}" stroke="#4f9a43" stroke-width="2.5" stroke-linecap="round"/>
     <g transform="translate(${x} ${-h})">${Array.from({ length: 5 }, (_, i) => `<circle r="4.5" cy="-5" fill="${k}" transform="rotate(${i * 72})"/>`).join('')}<circle r="3" fill="#fff4c2"/></g>`).join('') + blad(-1, -10) + blad(1, -14),
  klokje: k => `<path d="M0 0 C0 -30 6 -48 24 -50" stroke="#4f9a43" stroke-width="2.5" fill="none" stroke-linecap="round"/>${blad(-1, -16)}
    ${[[8, -40], [17, -48], [24, -38]].map(([x, y]) => `<path d="M${x - 6} ${y + 12} Q${x - 6} ${y} ${x} ${y} Q${x + 6} ${y} ${x + 6} ${y + 12} Q${x} ${y + 9} ${x - 6} ${y + 12} Z" fill="${k}"/>`).join('')}`,
  zonnebloem: k => `${steel(50)}${blad(-1, -18)}${blad(1, -30)}
    <g transform="translate(0 -56)">${Array.from({ length: 12 }, (_, i) => `<ellipse rx="4.5" ry="9" cy="-11" fill="${k}" transform="rotate(${i * 30})"/>`).join('')}<circle r="9" fill="#8a5a2b"/></g>`,
  struik: k => `<circle cx="-14" cy="-18" r="16" fill="${k}"/><circle cx="14" cy="-18" r="16" fill="${k}"/><circle cx="0" cy="-32" r="18" fill="#4f9a43"/>
    <g fill="#e5607a"><circle cx="-8" cy="-30" r="2.6"/><circle cx="10" cy="-22" r="2.6"/><circle cx="-16" cy="-14" r="2.6"/></g>`
};
const steel = h => `<path d="M0 0 V${-h}" stroke="#4f9a43" stroke-width="3" stroke-linecap="round"/>`;
const blad = (kant, y) => `<ellipse cx="${kant * 9}" cy="${y}" rx="9" ry="4.5" fill="#7ab536" transform="rotate(${kant * -30} ${kant * 9} ${y})"/>`;

INZICHTEN['happiness-garden'] = {
  start(vak, { cfg, staat, bewaar }) {
    const s = { gekozen: [], aandacht: '', fase: 'kiezen', ...staat };
    const t = cfg.teksten;
    let nieuw = null; // plant die net is gekozen: alleen die groeit opnieuw

    function opslaan() { bewaar({ ...s }); }

    function tuin() {
      const planten = cfg.keuzes.map((k, i) => {
        if (!s.gekozen.includes(k.id)) return '';
        const [x, y] = TUIN_PLEKKEN[i];
        return `<g transform="translate(${x} ${y})">
          ${s.aandacht === k.id ? '<rect class="aandacht-rand" x="-36" y="-90" width="72" height="98" rx="20"/>' : ''}
          <g class="plant ${nieuw === k.id ? 'groei' : ''}">${PLANTEN[k.plant](k.kleur)}</g></g>`;
      }).join('');
      // Label onder elke plant; de plant met aandacht krijgt een donker label en een stippelrand.
      const labels = cfg.keuzes.map((k, i) => {
        if (!s.gekozen.includes(k.id)) return '';
        const [x, y] = TUIN_PLEKKEN[i], aan = s.aandacht === k.id;
        const stijl = `left:${(x / 360) * 100}%;top:${((y + 6) / TUIN_H) * 100}%`;
        const tekst = k.kort;
        return s.fase === 'aandacht'
          ? `<button type="button" class="plant-label ${aan ? 'aan' : ''}" data-id="${k.id}" style="${stijl}" aria-pressed="${aan}">${tekst}</button>`
          : `<span class="plant-label ${aan ? 'aan' : ''}" style="${stijl}">${tekst}</span>`;
      }).join('');
      const aandacht = s.gekozen.includes(s.aandacht) && cfg.keuzes.find(k => k.id === s.aandacht);
      return `
        <div class="tuin">
          <svg viewBox="0 0 360 272" role="img" aria-label="Jouw tuin met ${s.gekozen.length} ${s.gekozen.length === 1 ? 'plant' : 'planten'}">
            <rect width="360" height="272" rx="18" fill="#eef6e2"/>
            <path d="M40 272 C110 196 210 204 250 152 S320 88 360 76" stroke="#e3d6b8" stroke-width="30" fill="none" stroke-linecap="round"/>
            <path d="M40 272 C110 196 210 204 250 152 S320 88 360 76" stroke="#f6eedb" stroke-width="24" fill="none" stroke-linecap="round"/>
            ${TUIN_PLEKKEN.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 2}" rx="24" ry="7" fill="#d4e8bd"/>`).join('')}
            <g fill="#b9dc8c">${[[24, 44], [70, 80], [336, 170], [186, 166], [96, 168]].map(([x, y]) => `<path d="M${x} ${y} l3 -9 l3 9 l3 -7 l2 7z"/>`).join('')}</g>
            ${planten}
            <image href="images/mossy.png" x="0" y="178" width="90" height="90"/>
          </svg>
          ${labels}
        </div>
        ${aandacht ? `<p class="aandacht-legenda"><span class="rand-voorbeeld" aria-hidden="true"></span><span>${t.aandachtLabel}: <b>${aandacht.naam}</b></span></p>` : ''}`;
    }

    function teken(focus) {
      const overzicht = cfg.keuzes.filter(k => s.gekozen.includes(k.id));
      let onder = '';
      if (s.fase === 'kiezen') {
        onder = `
          <p class="instructie">${t.kies}</p>
          <div class="tuin-keuzes" role="group" aria-label="Wat maakt jou gelukkig?">
            ${cfg.keuzes.map(k => `<button type="button" class="tuin-keuze" data-id="${k.id}" aria-pressed="${s.gekozen.includes(k.id)}">
              <span class="stip" style="background:${k.kleur}"></span>${k.naam}</button>`).join('')}
          </div>
          <div class="acties rij"><button type="button" class="knop primair" id="hgVerder" ${overzicht.length ? '' : 'disabled'}>Volgende</button></div>`;
      } else if (s.fase === 'aandacht') {
        onder = `
          <p class="instructie">${t.aandachtVraag}</p>
          <div class="acties rij">
            <button type="button" class="knop" id="hgTerug">Terug naar je keuzes</button>
            <button type="button" class="knop primair" id="hgVerder">${s.aandacht ? 'Volgende' : 'Sla over'}</button>
          </div>`;
      } else {
        const aandacht = cfg.keuzes.find(k => k.id === s.aandacht);
        onder = `
          <div class="kaart overzicht">
            <span class="label">Jouw tuin</span>
            <p><b>Dit maakt jou gelukkig:</b> ${opsomming(overzicht.map(k => k.naam))}.</p>
            ${aandacht ? `<p><b>${t.aandachtLabel}:</b> ${aandacht.naam}.</p>` : ''}
          </div>
          <div class="acties rij"><button type="button" class="knop" id="hgAanpassen">Pas je tuin aan</button></div>`;
      }
      vak.innerHTML = `<div class="inzicht-beeld tuin-beeld">${tuin()}</div>${onder}`;
      nieuw = null;
      koppel();
      const el = focus && vak.querySelector(focus);
      if (el) el.focus();
    }

    function koppel() {
      vak.querySelectorAll('.tuin-keuze').forEach(b => (b.onclick = () => {
        const id = b.dataset.id;
        if (s.gekozen.includes(id)) {
          s.gekozen = s.gekozen.filter(g => g !== id);
          if (s.aandacht === id) s.aandacht = '';
        } else { s.gekozen.push(id); nieuw = id; }
        opslaan();
        teken(`.tuin-keuze[data-id="${id}"]`);
      }));
      vak.querySelectorAll('button.plant-label').forEach(b => (b.onclick = () => {
        s.aandacht = s.aandacht === b.dataset.id ? '' : b.dataset.id;
        opslaan();
        teken(`.plant-label[data-id="${b.dataset.id}"]`);
      }));
      const knopNaar = (id, fase, focus) => { const k = vak.querySelector(id); if (k) k.onclick = () => { s.fase = fase; opslaan(); teken(focus); }; };
      knopNaar('#hgVerder', s.fase === 'kiezen' ? 'aandacht' : 'klaar', s.fase === 'kiezen' ? 'button.plant-label' : '#hgAanpassen');
      knopNaar('#hgTerug', 'kiezen', '.tuin-keuze');
      knopNaar('#hgAanpassen', 'kiezen', '.tuin-keuze');
    }

    teken();
  }
};
