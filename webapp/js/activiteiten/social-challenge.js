/* Social Challenge (Meedoen): draai aan het rad voor een laagdrempelige sociale uitdaging */
const SOCIALE_UITDAGINGEN = [
  ['👋', 'Groet een klasgenoot die je nog niet kent.'],
  ['💬', 'Geef iemand een oprecht compliment.'],
  ['☕', 'Vraag een medestudent hoe het met hem of haar gaat, en luister echt.'],
  ['🪑', 'Ga in de pauze eens naast iemand zitten die je minder goed kent.'],
  ['📱', 'Stuur een berichtje naar iemand die je al een tijd niet hebt gesproken.'],
  ['🙏', 'Bedank een docent, medewerker of klasgenoot voor iets wat diegene deed.'],
  ['🗺️', 'Vraag iemand naar zijn of haar favoriete plek in Den Haag.'],
  ['🤝', 'Bied een klasgenoot hulp aan bij een opdracht.'],
  ['🎉', 'Vraag iemand wat hij of zij dit weekend gaat doen.'],
  ['😊', 'Lach naar drie mensen die je vandaag tegenkomt.']
];

ACTIVITEITEN['social-challenge'] = {
  start(vak) {
    const n = SOCIALE_UITDAGINGEN.length, hoek = 360 / n;
    const KLEUREN = ['#64b255', '#96cc4b', '#4f9a43', '#b9dc8c'];
    const punt = (graden, r) => {
      const rad = (graden - 90) * Math.PI / 180;
      return [(r * Math.cos(rad)).toFixed(1), (r * Math.sin(rad)).toFixed(1)];
    };
    const vakken = SOCIALE_UITDAGINGEN.map(([emoji], i) => {
      const [x1, y1] = punt(i * hoek, 130), [x2, y2] = punt((i + 1) * hoek, 130), [ex, ey] = punt((i + 0.5) * hoek, 95);
      return `<path d="M0 0L${x1} ${y1}A130 130 0 0 1 ${x2} ${y2}Z" fill="${KLEUREN[i % KLEUREN.length]}" stroke="#e2f2cb" stroke-width="1.5"/>` +
             `<text x="${ex}" y="${ey}" text-anchor="middle" dominant-baseline="central" font-size="26">${emoji}</text>`;
    }).join('');

    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">Het is leuk om een nieuwe uitdaging aan te gaan. Draai aan het rad!</p><img class="mini" src="images/mossy.png" alt=""></div>
      <div class="rad-vak">
        <svg class="rad-voet" viewBox="0 0 100 70" aria-hidden="true"><path d="M50 0L95 70H5Z" fill="#1B455B"/></svg>
        <div class="rad" id="rad" aria-hidden="true">
          <svg viewBox="-150 -150 300 300">
            <circle r="148" fill="#698451"/>${vakken}
            <circle r="44" fill="#698451"/><circle r="38" fill="#96cc4b"/>
            <path d="M0-28L8-9 28-9 12 3 18 23 0 11-18 23-12 3-28-9-8-9Z" fill="#e2f2cb"/>
          </svg>
        </div>
        <div class="rad-wijzer" aria-hidden="true"></div>
      </div>
      <button type="button" class="knop primair" id="bDraai">Draai aan het rad</button>
      <div class="kaart uitdaging" id="uitdaging" aria-live="polite" hidden></div>
      <p class="klein" id="teller" aria-live="polite"></p>`;

    const q = s => vak.querySelector(s);
    const minderBeweging = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotatie = 0, gedaan = 0, timer;

    function draai() {
      const i = Math.floor(Math.random() * n);
      const doel = -(i + 0.5) * hoek + (Math.random() - 0.5) * hoek * 0.6; // midden van vak i bovenaan
      rotatie += 360 * 5 + ((((doel - rotatie) % 360) + 360) % 360);
      q('#rad').style.transform = `rotate(${rotatie}deg)`;
      q('#bDraai').disabled = true;
      q('#uitdaging').hidden = true;
      timer = setTimeout(() => toonUitdaging(i), minderBeweging ? 0 : 4000);
    }

    function toonUitdaging(i) {
      const [emoji, tekst] = SOCIALE_UITDAGINGEN[i];
      const kaart = q('#uitdaging');
      kaart.hidden = false;
      kaart.innerHTML = `
        <span class="label">Jouw uitdaging</span>
        <p class="uitdaging-tekst"><span aria-hidden="true">${emoji}</span> ${tekst}</p>
        <div class="acties rij"><button type="button" class="knop primair" id="bGedaan">Gedaan! ✓</button></div>`;
      q('#bGedaan').onclick = () => {
        gedaan++;
        q('#teller').textContent = `⭐ Uitdagingen gedaan: ${gedaan}. Goed bezig!`;
        kaart.hidden = true;
        q('#bDraai').focus();
      };
      q('#bDraai').disabled = false;
      q('#bDraai').textContent = 'Draai opnieuw';
    }

    q('#bDraai').onclick = draai;
    return () => clearTimeout(timer);
  }
};
