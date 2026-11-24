/* =========================================================
   Mossy's Energy Check (Lichaamsfuncties)
   Een batterij die rustig oploopt tot het zelfgegeven cijfer
   (bijv. een 6 = 60% vol), met Mossy ernaast en een korte reflectie.
   Teksten en onderwerpen: data/inzichten.js -> lichaam
   ========================================================= */
INZICHTEN['energy-check'] = {
  start(vak, { dim, cfg, antwoorden, cijfer }) {
    const { min, max } = IPH.cijfer;
    const procent = Math.round(100 * (cijfer - min) / (max - min));
    const H = 214; // hoogte van de binnenkant van de batterij
    const mossy = [...cfg.mossy].reverse().find(m => cijfer >= m.min);

    vak.innerHTML = `
      <div class="inzicht-beeld energy">
        <svg class="batterij" viewBox="0 0 160 270" role="img" aria-label="Batterij, ${procent}% gevuld">
          <defs>
            <clipPath id="ecBinnen"><rect x="24" y="36" width="112" height="${H}" rx="18"/></clipPath>
            <linearGradient id="ecVulling" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#b4dc78"/><stop offset="1" stop-color="#64b255"/>
            </linearGradient>
          </defs>
          <rect x="56" y="6" width="48" height="24" rx="8" fill="#1B455B"/>
          <rect x="12" y="24" width="136" height="238" rx="28" fill="#fff" stroke="#1B455B" stroke-width="6"/>
          <g clip-path="url(#ecBinnen)">
            <rect x="24" y="36" width="112" height="${H}" fill="#eef6e2"/>
            <g class="ec-vulling" style="transform: translateY(${H}px)">
              <g class="ec-golf">
                <path d="M-120 44 q14 -10 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 V300 H-120 Z" fill="url(#ecVulling)"/>
              </g>
            </g>
            ${[1, 2, 3, 4].map(k => `<line x1="24" x2="136" y1="${36 + (H * k) / 5}" y2="${36 + (H * k) / 5}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`).join('')}
            <rect x="34" y="50" width="10" height="150" rx="5" fill="#fff" opacity=".35"/>
          </g>
          <text class="ec-procent" x="80" y="160" text-anchor="middle">0%</text>
        </svg>
        <div class="ec-mossy">
          <p class="ballon">${mossy.tekst}</p>
          <img src="${mossy.beeld}" alt="Mossy">
        </div>
      </div>
      <div class="ec-uitkomst">
        <span class="label">${cfg.label}</span>
        <p class="ec-cijfer"><b class="ec-teller">0</b> <span>van 10</span></p>
        <p class="ec-niveau">Energie: ${procent}% gevuld</p>
      </div>
      <div class="kaart reflectie">${energyReflectie(dim.id, cfg, antwoorden, cijfer, procent)}</div>`;

    // Batterij rustig laten oplopen tot het niveau van het cijfer.
    const vulling = vak.querySelector('.ec-vulling');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      // -8: de golf ligt 8 px onder de bovenrand van de vulling; bij 0% blijft hij helemaal leeg.
      vulling.style.transform = `translateY(${procent === 0 ? H : H * (1 - procent / 100) - 8}px)`;
    }));
    const stop1 = telOp(vak.querySelector('.ec-procent'), procent, 1600, n => n + '%');
    const stop2 = telOp(vak.querySelector('.ec-teller'), cijfer, 1600, n => toonScore(n));
    return () => { stop1(); stop2(); };
  }
};

/* Korte reflectie: alleen onderwerpen die echt zijn ingevuld. */
function energyReflectie(dimId, cfg, antwoorden, cijfer, procent) {
  const goed = [], aandacht = [];
  cfg.onderwerpen.forEach((o, nr) => {
    const a = antwoordOp(dimId, nr, antwoorden);
    if (a === undefined) return;
    const fijn = o.omgekeerd ? a === 'nee' : a === 'ja';
    (fijn ? goed : aandacht).push(fijn ? o.goed : o.aandacht);
  });
  const t = cfg.teksten;
  const regels = [t.uitleg.replace('{cijfer}', toonScore(cijfer)).replace('{procent}', procent)];
  if (goed.length) regels.push(t.goed.replace('{lijst}', opsomming(goed)));
  if (aandacht.length) regels.push(t.aandacht.replace('{lijst}', opsomming(aandacht)));
  if (!goed.length && !aandacht.length) regels.push(t.geenAntwoorden);
  return regels.map(r => `<p>${r}</p>`).join('');
}
