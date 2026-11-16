/* =========================================================
   Score per dimensie = het cijfer (0–10) dat de student zichzelf geeft
   bij de laatste vraag van die dimensie. Zo staat het ook in de introductievideo:
   "Per dimensie geef je jezelf een cijfer van 0 tot 10."
   Nog geen cijfer gegeven? Dan is er geen score (nooit als nul geteld).
   ========================================================= */
function dimensieScore(dimId, antwoorden) {
  const cijfervraag = vragenVan(dimId).find(v => v.type === 'cijfer');
  const cijfer = cijfervraag && antwoorden[cijfervraag.id];
  return Number.isFinite(cijfer) ? cijfer : null;
}

/* Score van alle zes dimensies: [{ dim, score }] (score is null als er nog geen cijfer is). */
function alleScores(antwoorden) {
  return DIMENSIES.map(dim => ({ dim, score: dimensieScore(dim.id, antwoorden) }));
}

/* 7 -> "7", 7.5 -> "7,5" */
function toonScore(score) {
  return String(score).replace('.', ',');
}

/* Korte tekstuele samenvatting van het spinnenweb. */
function samenvatting(scores) {
  const compleet = scores.filter(s => s.score !== null);
  if (!compleet.length) return 'Je hebt nog geen cijfer gegeven.';
  const gesorteerd = [...compleet].sort((a, b) => b.score - a.score);
  const hoog = gesorteerd[0], laag = gesorteerd[gesorteerd.length - 1];
  if (compleet.length === 1 || hoog.score === laag.score) {
    return `Je gaf jezelf een ${toonScore(hoog.score)}.`;
  }
  return `Je hoogste cijfer is voor ${hoog.dim.naam} (${toonScore(hoog.score)}), ` +
         `je laagste voor ${laag.dim.naam} (${toonScore(laag.score)}).`;
}
