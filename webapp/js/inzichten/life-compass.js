/* =========================================================
   Mossy's Life Compass (Zingeving)
   1. Kies drie waarden en zet ze op het kompas (tikken of slepen).
   2. "Heb je vandaag iets gedaan dat hierbij past?"
   3. Bedenk een kleine stap bij een van je waarden.
   4. Eindbeeld: jouw kompas met de drie waarden en je stap.
   Waarden en teksten: data/inzichten.js -> zingeving
   ========================================================= */
const KOMPAS_PLEKKEN = [[50, 9], [80, 74], [20, 74]]; // x%, y% van de drie plekken rond Mossy

INZICHTEN['life-compass'] = {
  start(vak, { cfg, staat, bewaar }) {
    const s = { plekken: [null, null, null], reflectie: '', stapWaarde: '', stap: '', fase: 'kiezen', ...staat };
    const waarde = id => cfg.waarden.find(w => w.id === id);
    const geplaatst = () => s.plekken.filter(Boolean);
    const t = cfg.teksten;

    function opslaan() { bewaar({ ...s }); }

    /* ---------- Weergave ---------- */
    function teken(focus) {
      if (s.fase === 'kiezen') tekenKiezen();
      else if (s.fase === 'vraag') tekenVraag();
      else if (s.fase === 'stap') tekenStap();
      else tekenKlaar();
      const el = focus && vak.querySelector(focus);
      if (el) el.focus();
    }

    function kompas(interactief) {
      const ticks = Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 - 90) * Math.PI / 180, lang = i % 9 === 0;
        const r1 = lang ? 124 : 130, r2 = 138;
        return `<line x1="${150 + r1 * Math.cos(a)}" y1="${150 + r1 * Math.sin(a)}" x2="${150 + r2 * Math.cos(a)}" y2="${150 + r2 * Math.sin(a)}" stroke-width="${lang ? 2.5 : 1.2}"/>`;
      }).join('');
      const lijnen = KOMPAS_PLEKKEN.map(([x, y]) => `<line x1="150" y1="150" x2="${x * 3}" y2="${y * 3}"/>`).join('');
      const plekken = s.plekken.map((id, i) => {
        const [x, y] = KOMPAS_PLEKKEN[i], w = id && waarde(id);
        const inhoud = w
          ? `<span class="w-icoon" aria-hidden="true">${w.icoon}</span><span class="w-naam">${w.naam}</span>`
          : `<span class="plek-leeg">Plek ${i + 1}</span>`;
        return interactief
          ? `<button type="button" class="kompas-plek ${w ? 'vol' : ''}" data-plek="${i}" style="left:${x}%;top:${y}%"
               aria-label="${w ? w.naam + ' op plek ' + (i + 1) + ', tik om terug te leggen' : 'Lege plek ' + (i + 1)}">${inhoud}</button>`
          : `<div class="kompas-plek ${w ? 'vol' : ''}" style="left:${x}%;top:${y}%">${inhoud}</div>`;
      }).join('');
      return `
        <div class="kompas">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <circle cx="150" cy="150" r="140" fill="#fff" stroke="#1B455B" stroke-width="2"/>
            <circle cx="150" cy="150" r="112" fill="#f3f9ea" stroke="#d6e9c2" stroke-dasharray="4 6"/>
            <g stroke="#1B455B" stroke-opacity=".45">${ticks}</g>
            <g stroke="#96cc4b" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round">${lijnen}</g>
            <g fill="#4d6a77" font-size="13" font-weight="700" text-anchor="middle">
              <text x="150" y="38">N</text><text x="266" y="155">O</text><text x="150" y="272">Z</text><text x="34" y="155">W</text>
            </g>
          </svg>
          <img class="kompas-mossy" src="images/mossy.png" alt="Mossy in het midden van het kompas">
          ${plekken}
        </div>`;
    }

    function tekenKiezen() {
      const vol = geplaatst().length === 3;
      vak.innerHTML = `
        <p class="instructie">${t.kies}</p>
        <div class="inzicht-beeld kompas-beeld">${kompas(true)}</div>
        <p class="klein" aria-live="polite">${geplaatst().length} van 3 geplaatst. ${t.wissel}</p>
        <div class="waarden" role="group" aria-label="Waarden">
          ${cfg.waarden.map(w => {
            const op = s.plekken.includes(w.id);
            return `<button type="button" class="waarde ${op ? 'gekozen' : ''}" data-id="${w.id}" aria-pressed="${op}">
              <span class="w-icoon" aria-hidden="true">${w.icoon}</span><span class="w-naam">${w.naam}</span>
              ${op ? '<span class="w-vink" aria-hidden="true">✓</span>' : ''}</button>`;
          }).join('')}
        </div>
        <p class="melding-klein" aria-live="polite"></p>
        <div class="acties rij"><button type="button" class="knop primair" id="lcVerder" ${vol ? '' : 'disabled'}>Volgende</button></div>`;

      const melding = vak.querySelector('.melding-klein');
      sleepbaar({
        container: vak.querySelector('.waarden'),
        selector: '.waarde',
        vindDoel: e => [...vak.querySelectorAll('.kompas-plek')].find(p => boven(p, e, 6)) || null,
        opNeerzetten: (kaart, plek) => zetOpPlek(kaart.dataset.id, +plek.dataset.plek, kaart),
        opTik: kaart => {
          const id = kaart.dataset.id, nu = s.plekken.indexOf(id);
          if (nu >= 0) return haalVanPlek(nu, '.waarde[data-id="' + id + '"]');
          const vrij = s.plekken.indexOf(null);
          if (vrij < 0) { melding.textContent = 'Je kompas is vol. Tik op een waarde op het kompas om te wisselen.'; return; }
          zetOpPlek(id, vrij, kaart);
        }
      });
      vak.querySelectorAll('.kompas-plek.vol').forEach(p => (p.onclick = () => haalVanPlek(+p.dataset.plek)));
      vak.querySelector('#lcVerder').onclick = () => { s.fase = 'vraag'; opslaan(); teken('textarea'); };
    }

    // Zet een waarde op een plek; een waarde die daar al stond gaat terug naar de kaartjes.
    function zetOpPlek(id, plek, kaart) {
      const van = kaart.getBoundingClientRect();
      const oud = s.plekken.indexOf(id);
      if (oud >= 0) s.plekken[oud] = null;
      s.plekken[plek] = id;
      opslaan();
      teken('.waarde[data-id="' + id + '"]');
      glijVan(vak.querySelector(`.kompas-plek[data-plek="${plek}"]`), van);
    }

    function haalVanPlek(plek, focus) {
      const id = s.plekken[plek];
      const van = vak.querySelector(`.kompas-plek[data-plek="${plek}"]`).getBoundingClientRect();
      s.plekken[plek] = null;
      opslaan();
      teken(focus || `.kompas-plek[data-plek="${plek}"]`);
      glijVan(vak.querySelector('.waarde[data-id="' + id + '"]'), van);
    }

    function tekenVraag() {
      vak.innerHTML = `
        <div class="inzicht-beeld kompas-beeld klein-kompas">${kompas(false)}</div>
        <label class="vraag-label" for="lcReflectie">${t.vraag}</label>
        <textarea id="lcReflectie" rows="3" maxlength="300" placeholder="Schrijf het kort op (mag ook leeg blijven)">${esc(s.reflectie)}</textarea>
        <div class="acties rij">
          <button type="button" class="knop" id="lcTerug">Terug naar je kompas</button>
          <button type="button" class="knop primair" id="lcVerder">Volgende</button>
        </div>`;
      const veld = vak.querySelector('#lcReflectie');
      veld.oninput = () => { s.reflectie = veld.value; opslaan(); };
      vak.querySelector('#lcTerug').onclick = () => { s.fase = 'kiezen'; opslaan(); teken('.kompas-plek'); };
      vak.querySelector('#lcVerder').onclick = () => { s.fase = 'stap'; opslaan(); teken('.keuze-waarde'); };
    }

    function tekenStap() {
      if (!s.plekken.includes(s.stapWaarde)) s.stapWaarde = s.plekken[0];
      vak.innerHTML = `
        <p class="vraag-label">${t.stapVraag}</p>
        <div class="segment waarde-keuze" role="group" aria-label="Kies een waarde">
          ${s.plekken.map(id => `<button type="button" class="keuze-waarde" data-id="${id}" aria-pressed="${id === s.stapWaarde}">
            <span aria-hidden="true">${waarde(id).icoon}</span> ${waarde(id).naam}</button>`).join('')}
        </div>
        <label class="lbl" for="lcStap">Mijn kleine stap</label>
        <input type="text" id="lcStap" maxlength="120" autocomplete="off" placeholder="${t.stapVoorbeeld}" value="${esc(s.stap)}">
        <div class="acties rij">
          <button type="button" class="knop" id="lcTerug">Vorige</button>
          <button type="button" class="knop primair" id="lcKlaar" ${s.stap.trim() ? '' : 'disabled'}>Bekijk je kompas</button>
        </div>`;
      const veld = vak.querySelector('#lcStap'), klaar = vak.querySelector('#lcKlaar');
      vak.querySelectorAll('.keuze-waarde').forEach(b => (b.onclick = () => {
        s.stapWaarde = b.dataset.id; opslaan();
        vak.querySelectorAll('.keuze-waarde').forEach(k => k.setAttribute('aria-pressed', k === b));
      }));
      veld.oninput = () => { s.stap = veld.value; opslaan(); klaar.disabled = !s.stap.trim(); };
      veld.onkeydown = e => { if (e.key === 'Enter' && !klaar.disabled) klaar.click(); };
      vak.querySelector('#lcTerug').onclick = () => { s.fase = 'vraag'; opslaan(); teken('textarea'); };
      klaar.onclick = () => { s.fase = 'klaar'; opslaan(); teken('#lcAanpassen'); };
    }

    function tekenKlaar() {
      const w = waarde(s.stapWaarde);
      vak.innerHTML = `
        <div class="inzicht-beeld kompas-beeld">${kompas(false)}</div>
        <div class="kaart mijn-stap">
          <span class="label">Mijn kleine stap</span>
          <p><span aria-hidden="true">${w.icoon}</span> <b>${w.naam}:</b> ${esc(s.stap)}</p>
          ${s.reflectie.trim() ? `<p class="klein"><b>Vandaag:</b> ${esc(s.reflectie)}</p>` : ''}
        </div>
        <div class="acties rij"><button type="button" class="knop" id="lcAanpassen">Pas je kompas aan</button></div>`;
      vak.querySelector('#lcAanpassen').onclick = () => { s.fase = 'kiezen'; opslaan(); teken('.waarde'); };
    }

    teken();
  }
};
