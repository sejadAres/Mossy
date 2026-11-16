/* =========================================================
   Scherm: dimensiemenu met de zes dimensies  ->  #/dimensies
   ========================================================= */
function schermDimensiemenu() {
  const antwoorden = Sessie.antwoorden();
  const kaarten = DIMENSIES.map(dim => {
    const score = dimensieScore(dim.id, antwoorden);
    return `
      <li>
        <a class="kaart dimensie" href="#/dimensie/${dim.id}" style="--kleur:${dim.kleur}">
          <span class="dim-naam"><span class="stip" style="background:${dim.kleur}"></span>${dim.naam}</span>
          <span class="dim-tekst">${dim.omschrijving}</span>
          ${score === null ? '' : `<span class="dim-score">Jouw cijfer: ${toonScore(score)}</span>`}
        </a>
      </li>`;
  }).join('');

  return {
    titel: 'Kies een dimensie',
    html: `
      ${terugLink('#/', 'Terug naar het spinnenweb')}
      <h1 tabindex="-1">Kies een dimensie</h1>
      <p class="lead">Welke dimensie wil je verkennen? Je kunt later altijd een andere kiezen.</p>
      <ul class="raster">${kaarten}</ul>`
  };
}
