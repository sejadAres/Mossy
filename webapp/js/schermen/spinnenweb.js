/* =========================================================
   Scherm: spinnenweb (eerste scherm op iPad en telefoon)  ->  #/
   Scherm: persoonlijk resultaat                           ->  #/resultaat
   ========================================================= */
function schermSpinnenweb() {
  const scores = alleScores(Sessie.antwoorden());
  const heeftResultaat = scores.some(s => s.score !== null);

  const invullen = iphBeschikbaar()
    ? knop('#/vragenlijst', 'Vul het spinnenweb in', 'primair')
    : binnenkort('Vul het spinnenweb in');

  return {
    titel: 'Jouw spinnenweb',
    html: `
      <section class="start">
        <div class="start-tekst">
          <h1 tabindex="-1">Jouw spinnenweb</h1>
          <p class="lead">Het spinnenweb laat zien hoe het met je gaat op de zes dimensies van Positieve Gezondheid.
             Vul het in voor je eigen spinnenweb, of sla het over en kies meteen een dimensie.</p>
        </div>
        <div class="web-vak">${tekenSpinnenweb(scores)}</div>
        <div class="start-acties">
          <div class="acties">
            ${invullen}
            ${knop('#/dimensies', 'Sla over en kies een dimensie')}
            ${heeftResultaat ? knop('#/resultaat', 'Bekijk je resultaat', 'tekstknop') : ''}
          </div>
          <p class="klein">Je antwoorden blijven alleen op dit apparaat en worden gewist als je de sessie beëindigt.</p>
        </div>
      </section>`
  };
}

function schermResultaat() {
  const scores = alleScores(Sessie.antwoorden());
  if (!scores.some(s => s.score !== null)) return omleiden('');

  const antwoorden = Sessie.antwoorden();
  const lijst = scores.map(({ dim, score }) => `
    <li>
      <span class="stip" style="background:${dim.kleur}"></span>
      <span class="naam">${dim.naam}</span>
      <span class="waarde">${score === null ? 'nog geen cijfer' : toonScore(score) + ' van 10'}</span>
      <details class="mijn-antwoorden">
        <summary>Bekijk je antwoorden</summary>
        <ol>${vragenVan(dim.id).map(v => `<li><span>${v.tekst}</span><b>${
          antwoorden[v.id] === undefined ? '–' : antwoordTekst(antwoorden[v.id])}</b></li>`).join('')}</ol>
      </details>
    </li>`).join('');

  return {
    titel: 'Jouw resultaat',
    html: `
      <h1 tabindex="-1">Jouw spinnenweb</h1>
      <section class="intro">
        <div class="web-vak">${tekenSpinnenweb(scores)}</div>
        <div class="intro-tekst">
          <p class="samenvatting">${samenvatting(scores)}</p>
          <ul class="scorelijst">${lijst}</ul>
          <p class="klein">Per dimensie zie je het cijfer dat je jezelf gaf, van 0 tot 10.
             Er is geen goed of fout: het is een startpunt voor een gesprek met jezelf.</p>
          <div class="acties">
            ${knop('#/dimensies', 'Kies een dimensie', 'primair')}
            ${knop('#/vragenlijst', 'Pas je antwoorden aan', 'tekstknop')}
          </div>
        </div>
      </section>`
  };
}
