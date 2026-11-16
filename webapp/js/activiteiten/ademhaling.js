/* Ademhaling (Mentaal welbevinden): in 4 · vasthouden 4 · uit 6 */
ACTIVITEITEN.ademhaling = {
  start(vak) {
    vak.innerHTML = `
      <div class="oef-kop"><p class="sub">In 4 · vasthouden 4 · uit 6</p><img class="mini" src="images/mossy.png" alt=""></div>
      <div class="stage"><div id="orb"></div><div id="phase" aria-live="polite">Klaar</div></div>
      <button type="button" class="knop primair" id="bBtn">Start</button>`;

    const orb = vak.querySelector('#orb'), fase = vak.querySelector('#phase'), knopStart = vak.querySelector('#bBtn');
    const FASEN = [['Adem in', 4, 1.7], ['Vasthouden', 4, 1.7], ['Adem uit', 6, 1]];
    let bezig = false, timer;

    function stap(i) {
      if (!bezig) return;
      const [naam, sec, schaal] = FASEN[i];
      fase.textContent = naam;
      orb.style.transition = 'transform ' + (i === 1 ? 0 : sec) + 's ease-in-out';
      orb.style.transform = 'scale(' + schaal + ')';
      timer = setTimeout(() => stap((i + 1) % 3), sec * 1000);
    }

    function stop() {
      bezig = false;
      clearTimeout(timer);
      knopStart.textContent = 'Start';
      fase.textContent = 'Klaar';
      orb.style.transition = 'transform 1s';
      orb.style.transform = 'scale(1)';
    }

    knopStart.onclick = () => {
      if (bezig) return stop();
      bezig = true;
      knopStart.textContent = 'Stop';
      stap(0);
    };

    return stop;
  }
};
