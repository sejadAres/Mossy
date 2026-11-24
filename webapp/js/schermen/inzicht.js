/* =========================================================
   Scherm: inzicht na de vragenlijst van een dimensie
     #/dimensie/<id>/inzicht             visualisatie, of uitnodiging voor de activiteit
     #/dimensie/<id>/inzicht/activiteit  de activiteit zelf
   Teksten en instellingen: data/inzichten.js. Beelden: js/inzichten/*.js
   ========================================================= */
function schermInzicht(dimId, deel) {
  const dim = vindDimensie(dimId);
  const cfg = INZICHT_INSTELLINGEN[dimId];
  if (!dim || !cfg || !INZICHTEN[cfg.module]) return omleiden('dimensies');

  const pad = '#/dimensie/' + dim.id;
  const antwoorden = Sessie.antwoorden();
  const cijfer = dimensieScore(dim.id, antwoorden);
  const cijferRegel = cijfer === null
    ? `Je hebt nog geen cijfer gegeven voor ${dim.naam}.`
    : `Jouw cijfer voor ${dim.naam}: <b>${toonScore(cijfer)} van 10</b>`;
  // Vanuit de activiteit terug naar de uitnodiging (waar hij geopend is); anders naar de dimensie.
  const terug = deel === 'activiteit' ? terugLink(pad + '/inzicht', 'Terug naar je vragenlijstresultaat') : terugLink(pad, 'Terug naar ' + dim.naam);

  // Activiteit: eerst de uitnodiging met "Start activiteit" of "Ga verder".
  if (cfg.soort === 'activiteit' && deel !== 'activiteit') {
    return {
      titel: cfg.titel,
      html: `
        ${terug}
        <h1 tabindex="-1">Klaar met de vragenlijst!</h1>
        <p class="lead">${cijferRegel}</p>
        <div class="kaart uitnodiging">
          <img src="images/mossy.png" alt="">
          <div>
            <h2>${cfg.titel}</h2>
            <p>${cfg.uitnodiging}</p>
            <div class="acties rij">
              ${knop(pad + '/inzicht/activiteit', 'Start activiteit', 'primair')}
              ${knop(pad, 'Ga verder')}
            </div>
          </div>
        </div>`
    };
  }

  // Visualisatie zonder cijfer: eerst een cijfer geven.
  if (cfg.soort === 'visualisatie' && cijfer === null) {
    return {
      titel: cfg.titel,
      html: `${terug}<h1 tabindex="-1">${cfg.titel}</h1>
        <div class="kaart leeg"><img src="images/mossy-book.png" alt="">
          <p>${cijferRegel} Het beeld hoort bij dat cijfer.</p>
          ${knop(pad + '/vragen', 'Geef jezelf een cijfer', 'primair')}</div>`
    };
  }

  // De visualisatie of activiteit zelf. De module bewaart keuzes in de sessie.
  return {
    titel: cfg.titel,
    html: `
      ${terug}
      <h1 tabindex="-1">${cfg.titel}</h1>
      ${cfg.soort === 'visualisatie' ? `<p class="lead">${cijferRegel}</p>` : ''}
      <div class="inzicht"></div>
      <div class="acties">
        ${knop(pad, 'Ga verder', 'primair')}
        ${cfg.soort === 'visualisatie'
          ? knop(pad + '/vragen', 'Pas je antwoorden aan', 'tekstknop') + knop('#/resultaat', 'Bekijk je spinnenweb', 'tekstknop')
          : ''}
      </div>`,
    na: root => INZICHTEN[cfg.module].start(root.querySelector('.inzicht'), inzichtContext(dim))
  };
}

/* Alles wat een inzicht-module nodig heeft. Gebruikt na de vragenlijst én bij de webapp-games,
   zodat beide plekken dezelfde bewaarde keuzes tonen. */
function inzichtContext(dim) {
  const antwoorden = Sessie.antwoorden();
  return {
    dim, cfg: INZICHT_INSTELLINGEN[dim.id], antwoorden,
    cijfer: dimensieScore(dim.id, antwoorden),
    staat: Sessie.inzicht(dim.id),
    bewaar: staat => Sessie.zetInzicht(dim.id, staat)
  };
}
