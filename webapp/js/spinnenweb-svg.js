/* =========================================================
   Tekent het spinnenweb als SVG.
   scores: [{ dim, score }] uit alleScores(). score null = niet ingevuld.
   Zonder scores tekent hij een leeg web met de zes labels.
   ========================================================= */
function tekenSpinnenweb(scores) {
  const R = 75, n = DIMENSIES.length;
  const punt = (i, r) => {
    const hoek = (Math.PI * 2 * i) / n - Math.PI / 2; // eerste as recht omhoog
    return [r * Math.cos(hoek), r * Math.sin(hoek)];
  };
  const xy = ([x, y]) => x.toFixed(1) + ',' + y.toFixed(1);

  const ringen = [2, 4, 6, 8, 10].map(w =>
    `<polygon class="web-ring" points="${DIMENSIES.map((_, i) => xy(punt(i, R * w / 10))).join(' ')}"/>`
  ).join('');

  const assen = DIMENSIES.map((d, i) =>
    `<line class="web-as" x1="0" y1="0" x2="${punt(i, R)[0].toFixed(1)}" y2="${punt(i, R)[1].toFixed(1)}"/>` +
    `<circle cx="${punt(i, R)[0].toFixed(1)}" cy="${punt(i, R)[1].toFixed(1)}" r="4" fill="${d.kleur}"/>`
  ).join('');

  const labels = DIMENSIES.map((d, i) => {
    const [x, y] = punt(i, R + 14);
    const anker = Math.abs(x) < 1 ? 'middle' : x > 0 ? 'start' : 'end';
    const regels = d.naam.split(' ').length > 1 && d.naam.length > 12
      ? splitsInTwee(d.naam) : [d.naam];
    const dy = y < -1 ? -(regels.length - 1) * 17 : y > 1 ? 12 : -((regels.length - 1) * 17) / 2 + 5;
    return `<text class="web-label" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anker}">` +
      regels.map((r, k) => `<tspan x="${x.toFixed(1)}" dy="${k ? 17 : 0}">${r}</tspan>`).join('') + '</text>';
  }).join('');

  // Vorm alleen als alle zes dimensies een score hebben; anders losse punten.
  const metScore = (scores || []).filter(s => s.score !== null);
  let vorm = '';
  if (metScore.length === n) {
    vorm = `<polygon class="web-vorm" points="${scores.map((s, i) => xy(punt(i, R * s.score / 10))).join(' ')}"/>`;
  }
  vorm += metScore.map(s => {
    const i = DIMENSIES.indexOf(s.dim);
    const [x, y] = punt(i, R * s.score / 10);
    return `<circle class="web-punt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`;
  }).join('');

  const beschrijving = metScore.length
    ? 'Spinnenweb met jouw scores: ' + metScore.map(s => `${s.dim.naam} ${toonScore(s.score)}`).join(', ') + '.'
    : 'Leeg spinnenweb met de zes dimensies van Positieve Gezondheid.';

  return `<svg class="spinnenweb" viewBox="-178 -130 356 262" role="img" aria-label="${beschrijving}">` +
    ringen + assen + vorm + labels + '</svg>';
}

/* "Dagelijks functioneren" -> ["Dagelijks", "functioneren"] */
function splitsInTwee(tekst) {
  const woorden = tekst.split(' ');
  const midden = Math.ceil(woorden.length / 2);
  return [woorden.slice(0, midden).join(' '), woorden.slice(midden).join(' ')];
}
