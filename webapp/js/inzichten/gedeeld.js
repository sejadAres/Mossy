/* =========================================================
   Gedeelde hulpfuncties voor de inzicht-modules (js/inzichten/*.js).
   ========================================================= */
const MINDER_BEWEGING = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Zelfgeschreven tekst veilig in HTML zetten. */
function esc(tekst) {
  return String(tekst ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Antwoord op vraag nr (0 = eerste) van een dimensie: 'ja' | 'beetje' | 'nee' | getal | undefined */
function antwoordOp(dimId, nr, antwoorden) {
  return antwoorden[dimId + '-' + nr];
}

/* "a", "a en b", "a, b en c" */
function opsomming(woorden) {
  return woorden.length < 2 ? woorden.join('') : woorden.slice(0, -1).join(', ') + ' en ' + woorden[woorden.length - 1];
}

/* Telt een getal rustig op in een element (of zet het direct bij minder beweging). */
function telOp(el, tot, duurMs, opmaak = n => n) {
  if (MINDER_BEWEGING) { el.textContent = opmaak(tot); return () => {}; }
  const start = performance.now();
  let raf;
  const stap = nu => {
    const t = Math.min(1, (nu - start) / duurMs);
    el.textContent = opmaak(Math.round(tot * (1 - Math.pow(1 - t, 3))));
    if (t < 1) raf = requestAnimationFrame(stap);
  };
  raf = requestAnimationFrame(stap);
  return () => cancelAnimationFrame(raf);
}

/* Laat een element vanaf een oude plek (DOMRect) rustig naar zijn nieuwe plek glijden. */
function glijVan(el, vanRect) {
  if (!el || !vanRect || MINDER_BEWEGING) return;
  const naar = el.getBoundingClientRect();
  el.animate([
    { transform: `translate(${vanRect.left - naar.left}px, ${vanRect.top - naar.top}px) scale(${vanRect.width / naar.width})` },
    { transform: 'none' }
  ], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
}

/* Segmentknoppen (bijv. Gepland / Gedaan) als HTML. */
function segment(naam, opties, gekozen, label) {
  return `<div class="segment" role="group" aria-label="${esc(label)}">${opties.map(([waarde, tekst]) =>
    `<button type="button" data-${naam}="${waarde}" aria-pressed="${waarde === gekozen}">${tekst}</button>`).join('')}</div>`;
}
