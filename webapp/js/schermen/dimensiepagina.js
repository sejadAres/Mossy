/* =========================================================
   Scherm: één dimensie met drie keuzes  ->  #/dimensie/<id>
   Eén gedeelde pagina voor alle zes dimensies; de inhoud komt uit data/dimensies.js.
   ========================================================= */
function schermDimensie(dimId) {
  const dim = vindDimensie(dimId);
  if (!dim) return omleiden('dimensies');
  const pad = '#/dimensie/' + dim.id;
  const score = dimensieScore(dim.id, Sessie.antwoorden());

  const keuzes = [
    {
      titel: 'Vul de vragenlijst in',
      tekst: `${vragenVan(dim.id).length} korte vragen over ${dim.naam.toLowerCase()}.` +
             (score === null ? '' : ` Jouw cijfer: ${toonScore(score)}.`),
      href: pad + '/vragen',
      beschikbaar: iphBeschikbaar()
    },
    {
      titel: 'Doe een activiteit in de Healthy Hub',
      tekst: dim.fysiek.titel + '.',
      label: '📍 In de Healthy Hub',
      href: pad + '/healthy-hub',
      beschikbaar: true
    },
    {
      titel: 'Doe een activiteit in de webapp',
      tekst: dim.digitaal.map(a => a.titel).join(' of ') + '.',
      href: pad + '/webapp',
      beschikbaar: digitaleActiviteiten(dim).length > 0
    }
  ];

  return {
    titel: dim.naam,
    html: `
      ${terugLink('#/dimensies', 'Terug naar alle dimensies')}
      <h1 tabindex="-1" class="met-stip"><span class="stip groot" style="background:${dim.kleur}"></span>${dim.naam}</h1>
      <p class="lead">${dim.omschrijving} Waar wil je beginnen?</p>
      <ul class="keuzes">${keuzes.map(keuzeKaart).join('')}</ul>
      <div class="acties">${knop('#/dimensies', 'Terug naar alle dimensies')}</div>`
  };
}

function keuzeKaart(k, i) {
  const inhoud = `
    <span class="keuze-nr" aria-hidden="true">${i + 1}</span>
    <span class="keuze-titel">${k.titel}</span>
    <span class="keuze-tekst">${k.tekst}</span>
    ${k.beschikbaar
      ? (k.label ? `<span class="label">${k.label}</span>` : '')
      : '<span class="label binnenkort">Binnenkort beschikbaar</span>'}`;
  return k.beschikbaar
    ? `<li><a class="kaart keuze" href="${k.href}">${inhoud}</a></li>`
    : `<li><div class="kaart keuze uit" aria-disabled="true">${inhoud}</div></li>`;
}
