/* =========================================================
   Scherm: vragenlijst
   - algemeen spinnenweb (alle IPH-vragen)  ->  #/vragenlijst
   - één dimensie (alleen die vragen)       ->  #/dimensie/<id>/vragen
   Beide gebruiken dezelfde vragen (data/iph-vragen.js) en dezelfde weergave.
   ========================================================= */
function schermVragenlijstAlgemeen() {
  if (!iphBeschikbaar()) return omleiden('');
  return vragenlijstScherm({
    titel: 'Spinnenweb invullen',
    vragen: alleVragen(),
    terug: ['#/', 'Terug naar het spinnenweb'],
    toonDimensie: true,
    opKlaar: () => location.replace('#/resultaat')
  });
}

function schermVragenlijstDimensie(dimId) {
  const dim = vindDimensie(dimId);
  if (!dim) return omleiden('dimensies');
  const terug = ['#/dimensie/' + dim.id, 'Terug naar ' + dim.naam];

  if (!iphBeschikbaar()) {
    return {
      titel: dim.naam + ': vragenlijst',
      html: terugLink(...terug) + `<h1 tabindex="-1">${dim.naam}: vragenlijst</h1>` +
            nietBeschikbaar('De IPH-vragen voor deze dimensie zijn nog niet goedgekeurd.', terug)
    };
  }

  return vragenlijstScherm({
    titel: dim.naam + ': vragenlijst',
    vragen: vragenVan(dim.id),
    terug,
    opKlaar: vak => {
      // Met een inzicht (data/inzichten.js): door naar de visualisatie of uitnodiging.
      if (INZICHT_INSTELLINGEN[dim.id]) return (location.hash = '#/dimensie/' + dim.id + '/inzicht');
      const score = dimensieScore(dim.id, Sessie.antwoorden());
      vak.innerHTML = `
        <div class="kaart klaar">
          <h2 tabindex="-1">Klaar!</h2>
          <p>${score === null
            ? 'Je hebt nog geen cijfer gegeven voor ' + dim.naam + '.'
            : 'Jouw cijfer voor ' + dim.naam + ': <b>' + toonScore(score) + ' van 10</b>.'}</p>
          <div class="acties">
            ${knop(terug[0], 'Terug naar de keuzes', 'primair')}
            ${knop('#/resultaat', 'Bekijk je spinnenweb', 'tekstknop')}
          </div>
        </div>`;
      vak.querySelector('h2').focus();
    }
  });
}

/* Gedeelde opbouw van beide vragenlijsten. */
function vragenlijstScherm({ titel, vragen, terug, toonDimensie, opKlaar }) {
  return {
    titel,
    html: terugLink(...terug) + `<h1 tabindex="-1">${titel}</h1><div class="vraag-vak" aria-live="polite"></div>`,
    na: root => {
      const vak = root.querySelector('.vraag-vak');
      const antwoorden = Sessie.antwoorden();
      // Begin bij de eerste open vraag; alles al ingevuld? Dan vanaf het begin (aanpassen).
      let index = vragen.findIndex(v => antwoorden[v.id] === undefined);
      if (index < 0) index = 0;

      const toon = () => {
        if (index >= vragen.length) return opKlaar(vak);
        toonVraag(vak, vragen[index], index, vragen.length, toonDimensie, {
          kies: waarde => { Sessie.zetAntwoord(vragen[index].id, waarde); index++; toon(); },
          slaOver: () => { index++; toon(); },
          vorige: () => { index--; toon(); }
        });
      };
      toon();
    }
  };
}

/* Toont één vraag: Ja / Een beetje / Nee, of een cijfer van 0 tot 10. */
function toonVraag(vak, vraag, index, totaal, toonDimensie, acties) {
  const gekozen = Sessie.antwoorden()[vraag.id];
  const dim = vindDimensie(vraag.dimId);
  const { min, max, laag, hoog } = IPH.cijfer;
  const opties = vraag.type === 'cijfer'
    ? Array.from({ length: max - min + 1 }, (_, i) => [min + i, String(min + i)])
    : IPH.keuzes;

  vak.innerHTML = `
    <div class="voortgang">
      <span>Vraag ${index + 1} van ${totaal}</span>
      <div class="balk" aria-hidden="true"><i style="width:${(100 * index) / totaal}%"></i></div>
    </div>
    <div class="kaart vraag">
      ${toonDimensie ? `<span class="label"><span class="stip" style="background:${dim.kleur}"></span>${dim.naam}</span>` : ''}
      <h2 id="vraagtekst" tabindex="-1">${vraag.tekst}</h2>
      <div class="antwoorden ${vraag.type}" role="group" aria-labelledby="vraagtekst">
        ${opties.map(([waarde, label], i) =>
          `<button type="button" data-i="${i}" aria-pressed="${waarde === gekozen}">${label}</button>`).join('')}
      </div>
      ${vraag.type === 'cijfer' ? `<div class="schaal-labels" aria-hidden="true"><span>${min} · ${laag}</span><span>${hoog} · ${max}</span></div>` : ''}
    </div>
    <div class="acties rij">
      <button type="button" class="knop" data-actie="vorige" ${index === 0 ? 'hidden' : ''}>Vorige vraag</button>
      <button type="button" class="knop tekstknop" data-actie="slaOver">Sla deze vraag over</button>
    </div>`;

  vak.querySelectorAll('.antwoorden button').forEach(b => (b.onclick = () => acties.kies(opties[b.dataset.i][0])));
  vak.querySelectorAll('[data-actie]').forEach(b => (b.onclick = () => acties[b.dataset.actie]()));
  vak.querySelector('#vraagtekst').focus();
}
