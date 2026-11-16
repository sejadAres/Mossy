/* =========================================================
   Scherm: activiteit in de Healthy Hub  ->  #/dimensie/<id>/healthy-hub
   Scherm: activiteit in de webapp      ->  #/dimensie/<id>/webapp
   ========================================================= */
function schermFysiek(dimId) {
  const dim = vindDimensie(dimId);
  if (!dim) return omleiden('dimensies');
  const terug = ['#/dimensie/' + dim.id, 'Terug naar ' + dim.naam];
  const { titel, uitleg, stappen } = dim.fysiek;

  const inhoud = uitleg || stappen.length
    ? `<p>${uitleg}</p>${stappen.length ? `<h3>Zo doe je het</h3><ol>${stappen.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}`
    : '<p><span class="label binnenkort">Uitleg binnenkort beschikbaar</span></p>';

  return {
    titel: titel + ' · Healthy Hub',
    html: `
      ${terugLink(...terug)}
      <h1 tabindex="-1">${titel}</h1>
      <p class="melding">📍 Deze activiteit doe je in de Healthy Hub van De Haagse Hogeschool.
         Ben je ergens anders? Dan kun je wel de vragenlijst of de activiteit in de webapp doen.</p>
      <article class="kaart activiteit">${inhoud}</article>
      <div class="acties">${knop(terug[0], 'Terug naar de keuzes', 'primair')}</div>`
  };
}

function schermDigitaal(dimId, naam) {
  const dim = vindDimensie(dimId);
  if (!dim) return omleiden('dimensies');
  const pad = '#/dimensie/' + dim.id;
  const beschikbaar = digitaleActiviteiten(dim);

  // Meer dan één activiteit en nog niets gekozen: eerst kiezen.
  if (!naam && beschikbaar.length > 1) return schermKiesDigitaal(dim, beschikbaar);

  const gekozen = naam ? dim.digitaal.find(a => a.activiteit === naam) : (beschikbaar[0] || dim.digitaal[0]);
  if (!gekozen) return omleiden('dimensie/' + dim.id + '/webapp');
  // Terug naar het keuzelijstje als er meer activiteiten zijn, anders naar de dimensie.
  const terug = beschikbaar.length > 1
    ? [pad + '/webapp', 'Terug naar de webapp-activiteiten']
    : [pad, 'Terug naar ' + dim.naam];
  const kop = terugLink(...terug) + `<h1 tabindex="-1">${gekozen.titel}</h1>`;

  if (!ACTIVITEITEN[gekozen.activiteit]) {
    return { titel: gekozen.titel, html: kop + nietBeschikbaar(`De activiteit ${gekozen.titel} staat nog niet in de webapp.`, terug) };
  }

  // De activiteit tekent zichzelf in .oefening en geeft een opruimfunctie terug (timers, geluid, microfoon).
  return {
    titel: gekozen.titel,
    html: kop + `<div class="oefening"></div><div class="acties">${knop(pad, 'Terug naar de keuzes')}</div>`,
    na: root => ACTIVITEITEN[gekozen.activiteit].start(root.querySelector('.oefening'))
  };
}

/* Keuzelijstje als een dimensie meerdere webapp-activiteiten heeft. */
function schermKiesDigitaal(dim, activiteiten) {
  const pad = '#/dimensie/' + dim.id;
  return {
    titel: dim.naam + ': webapp',
    html: `
      ${terugLink(pad, 'Terug naar ' + dim.naam)}
      <h1 tabindex="-1">Kies een activiteit</h1>
      <p class="lead">Welke activiteit wil je doen voor ${dim.naam.toLowerCase()}?</p>
      <ul class="keuzes">${activiteiten.map(a => `
        <li><a class="kaart keuze" href="${pad}/webapp/${a.activiteit}">
          <span class="keuze-titel">${a.titel}</span>
          <span class="keuze-tekst">${a.omschrijving || ''}</span>
        </a></li>`).join('')}</ul>
      <div class="acties">${knop(pad, 'Terug naar de keuzes')}</div>`
  };
}
