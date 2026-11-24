/* =========================================================
   Mossy's Emotion Clouds (Mentaal welbevinden)
   Een weerscène boven een klein groen landschap. Het cijfer bepaalt het weer:
   van regen via wolken en zon naar een open lucht met een warme zon.
   Grenzen, kleuren en teksten: data/inzichten.js -> mentaal.weer
   ========================================================= */
const WOLK_PLEKKEN = [[62, 58, 1.05], [196, 44, 1.25], [292, 96, 0.85], [128, 104, 0.9]];

INZICHTEN['emotion-clouds'] = {
  start(vak, { dim, cfg, antwoorden, cijfer }) {
    const weer = cfg.weer.find(w => cijfer <= w.max) || cfg.weer[cfg.weer.length - 1];
    const regel = cfg.reflectie.find(r => r.als.includes(antwoordOp(dim.id, r.vraag, antwoorden)));
    const vraag = regel ? regel.tekst : cfg.reflectieStandaard;

    vak.innerHTML = `
      <div class="inzicht-beeld wolken">
        <svg class="weer" viewBox="0 0 360 260" role="img" aria-label="Weerbeeld: ${weer.naam.toLowerCase()}. ${weer.tekst}">
          <defs>
            <linearGradient id="ecLucht" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${weer.lucht[0]}"/><stop offset="1" stop-color="${weer.lucht[1]}"/>
            </linearGradient>
            <radialGradient id="ecGloed"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".9"/><stop offset="1" stop-color="#ffe7a3" stop-opacity="0"/></radialGradient>
          </defs>
          <rect width="360" height="260" fill="url(#ecLucht)"/>
          <g class="zon" opacity="${weer.zon}">
            <circle cx="268" cy="66" r="62" fill="url(#ecGloed)"/>
            <circle cx="268" cy="66" r="28" fill="#ffcf4d"/>
          </g>
          ${WOLK_PLEKKEN.slice(0, weer.wolken).map(([x, y, s], i) => wolk(x, y, s, weer.wolkKleur, i)).join('')}
          ${regenStrepen(weer.regen)}
          <path d="M0 196 Q90 160 190 188 T360 178 V260 H0 Z" fill="#b9dc8c"/>
          <path d="M0 222 Q120 194 230 216 T360 210 V260 H0 Z" fill="#96cc4b"/>
          ${weer.zon >= 0.75 ? '<g fill="#fff"><circle cx="250" cy="232" r="3"/><circle cx="290" cy="238" r="3"/><circle cx="320" cy="228" r="3"/></g><g fill="#f7b21b"><circle cx="250" cy="232" r="1.3"/><circle cx="290" cy="238" r="1.3"/><circle cx="320" cy="228" r="1.3"/></g>' : ''}
          <image href="${weer.mossy}" x="22" y="150" width="104" height="104"/>
        </svg>
      </div>
      <div class="weer-uitleg">
        <span class="label">${weer.naam}</span>
        <p><b>${cfg.uitleg}</b> ${weer.tekst}</p>
      </div>
      <div class="mossy-vraag">
        <img src="images/mossy.png" alt="Mossy">
        <p class="ballon">${vraag}</p>
      </div>`;
  }
};

/* Afgeronde wolk met een zachte schaduw; schuift langzaam heen en weer. */
function wolk(x, y, schaal, kleur, i) {
  const vorm = '<circle cx="0" cy="0" r="20"/><circle cx="24" cy="-10" r="25"/><circle cx="50" cy="0" r="19"/><rect x="-16" y="0" width="84" height="19" rx="9.5"/>';
  return `<g transform="translate(${x} ${y}) scale(${schaal})">
    <g class="wolk-drift" style="animation-duration:${22 + i * 7}s;animation-delay:-${i * 5}s">
      <g fill="#1B455B" opacity=".07" transform="translate(0 4)">${vorm}</g>
      <g fill="${kleur}">${vorm}</g>
    </g></g>`;
}

/* Dunne regenstrepen onder de wolken. */
function regenStrepen(aantal) {
  return Array.from({ length: aantal }, (_, i) => {
    const x = 30 + ((i * 53) % 300), y = 112 + ((i * 37) % 60);
    return `<line class="drup" x1="${x}" y1="${y}" x2="${x - 3}" y2="${y + 12}" style="animation-delay:-${(i * 0.17) % 1.2}s"/>`;
  }).join('');
}
