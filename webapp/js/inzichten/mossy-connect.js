/* =========================================================
   Mossy Connect (Meedoen)
   Kies een of meer sociale mini-uitdagingen of begin met een reflectieopdracht.
   Elke gekozen vorm van contact voegt een Mossy-figuurtje toe aan jouw netwerk,
   verbonden met een gebogen lijn (stippel = gepland, doorgetrokken = gedaan).
   Uitdagingen en teksten: data/inzichten.js -> meedoen
   ========================================================= */
const CONNECT_H = 340;
const CONNECT_MIDDEN = [180, 160];
// Plek van elk figuurtje en waar het label staat: onder het figuurtje of rechts ernaast.
const CONNECT_PLEKKEN = { compliment: [52, 118, 'onder'], samen: [180, 36, 'rechts'], bericht: [308, 118, 'onder'] };

INZICHTEN['mossy-connect'] = {
  start(vak, { cfg, staat, bewaar }) {
    const s = { gekozen: {}, reflectie: false, reflectieTekst: '', ...staat };
    let nieuw = null;
    const opslaan = () => bewaar({ ...s, gekozen: { ...s.gekozen } });

    function netwerk() {
      const [mx, my] = CONNECT_MIDDEN;
      const items = cfg.uitdagingen.filter(u => s.gekozen[u.id]);
      const boog = (x, y) => [(mx + x) / 2 + (y - my) * 0.35, (my + y) / 2 - (x - mx) * 0.2]; // zachte boog
      const lijnen = items.map(u => {
        const [x, y] = CONNECT_PLEKKEN[u.id], [cx, cy] = boog(x, y);
        // pictogram op het midden van de lijn (kwadratische bezier op t = 0,5)
        const ix = (mx + 2 * cx + x) / 4, iy = (my + 2 * cy + y) / 4;
        return `<path class="verbinding ${s.gekozen[u.id]} ${nieuw === u.id ? 'nieuw' : ''}" d="M${mx} ${my} Q${cx} ${cy} ${x} ${y}"/>
          <g transform="translate(${ix} ${iy})"><circle r="15" fill="#fff" stroke="#96cc4b" stroke-width="2"/><text y="5.5" text-anchor="middle" font-size="15">${u.icoon}</text></g>`;
      }).join('');
      const figuren = items.map(u => {
        const [x, y] = CONNECT_PLEKKEN[u.id];
        return `<g class="figuur ${nieuw === u.id ? 'nieuw' : ''}" transform="translate(${x} ${y})">
          <circle r="27" fill="#fff" stroke="#d6e9c2" stroke-width="2"/><image href="images/mossy.png" x="-22" y="-24" width="44" height="44"/></g>`;
      }).join('');
      const labels = items.map(u => {
        const [x, y, kant] = CONNECT_PLEKKEN[u.id];
        const status = cfg.statussen.find(([k]) => k === s.gekozen[u.id])[1];
        const stijl = kant === 'rechts'
          ? `left:${((x + 34) / 360) * 100}%;top:${(y / CONNECT_H) * 100}%;transform:translate(0,-50%)`
          : `left:${(x / 360) * 100}%;top:${((y + 32) / CONNECT_H) * 100}%;transform:translate(-50%,0)`;
        return `<span class="verbinding-label" style="${stijl}">${u.label}<small>${status}</small></span>`;
      }).join('');
      return `
        <div class="netwerk">
          <svg viewBox="0 0 360 ${CONNECT_H}" role="img" aria-label="Jouw netwerk: ${items.length ? items.map(u => u.label).join(', ') : 'nog alleen jij'}">
            <circle cx="${mx}" cy="${my}" r="98" fill="none" stroke="#d6e9c2" stroke-dasharray="3 7"/>
            ${lijnen}${figuren}
            <g transform="translate(${mx} ${my})"><circle r="40" fill="#fff" stroke="#64b255" stroke-width="3"/>
              <image href="images/mossy.png" x="-32" y="-36" width="64" height="64"/></g>
          </svg>
          <span class="jij-label" style="left:50%;top:${((my + 46) / CONNECT_H) * 100}%">Jij</span>
          ${labels}
          ${s.reflectie ? `<div class="reflectie-kaartje"><span class="label">Reflectie</span><p>${cfg.reflectieVraag}</p></div>` : ''}
        </div>`;
    }

    function teken(focus) {
      const items = cfg.uitdagingen.filter(u => s.gekozen[u.id]);
      vak.innerHTML = `
        <p class="instructie">Mossy heeft drie mini-uitdagingen voor je. Kies er een of meer, of begin eerst met nadenken.</p>
        <div class="connect-keuzes" role="group" aria-label="Kies een uitdaging">
          ${cfg.uitdagingen.map(u => `<button type="button" class="connect-keuze" data-id="${u.id}" aria-pressed="${Boolean(s.gekozen[u.id])}">
            <span class="c-icoon" aria-hidden="true">${u.icoon}</span><span>${u.naam}</span></button>`).join('')}
          <button type="button" class="connect-keuze reflectie-keuze" data-id="reflectie" aria-pressed="${s.reflectie}">
            <span class="c-icoon" aria-hidden="true">💭</span><span>${cfg.reflectieOptie}</span></button>
        </div>
        <div class="inzicht-beeld connect-beeld">${netwerk()}</div>
        ${s.reflectie ? `<label class="lbl" for="mcTekst">Jouw gedachten (mag ook leeg blijven)</label>
          <textarea id="mcTekst" rows="3" maxlength="300">${esc(s.reflectieTekst)}</textarea>` : ''}
        ${items.map(u => `
          <div class="kaart gekozen-uitdaging">
            <p><span aria-hidden="true">${u.icoon}</span> <b>${u.naam}</b></p>
            ${segment('status-' + u.id, cfg.statussen, s.gekozen[u.id], 'Status van ' + u.naam)}
          </div>`).join('')}`;
      nieuw = null;

      vak.querySelectorAll('.connect-keuze').forEach(b => (b.onclick = () => {
        const id = b.dataset.id;
        if (id === 'reflectie') s.reflectie = !s.reflectie;
        else if (s.gekozen[id]) delete s.gekozen[id];
        else { s.gekozen[id] = cfg.statussen[0][0]; nieuw = id; }
        opslaan();
        teken(`.connect-keuze[data-id="${id}"]`);
      }));
      cfg.uitdagingen.forEach(u => vak.querySelectorAll(`[data-status-${u.id}]`).forEach(b => (b.onclick = () => {
        s.gekozen[u.id] = b.getAttribute('data-status-' + u.id);
        opslaan();
        teken(`[data-status-${u.id}="${s.gekozen[u.id]}"]`);
      })));
      const veld = vak.querySelector('#mcTekst');
      if (veld) veld.oninput = () => { s.reflectieTekst = veld.value; opslaan(); };
      const el = focus && vak.querySelector(focus);
      if (el) el.focus();
    }

    teken();
  }
};
