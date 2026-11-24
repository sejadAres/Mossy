/* =========================================================
   Gedeeld: slepen én tikken, met muis, vinger of toetsenbord.
   Gebruikt door Mossy's Morning Rush en Mossy's Life Compass.

   sleepbaar({
     container,            element met de sleepbare knoppen
     selector,             welke knoppen sleepbaar zijn, bijv. '.mr-tegel'
     vindDoel(e),          geeft het doel onder de vinger terug (of null)
     opNeerzetten(item, doel),  losgelaten boven een doel
     opTik(item)           gewoon getikt of met Enter gekozen
   })
   ========================================================= */
function sleepbaar({ container, selector, vindDoel, opNeerzetten, opTik }) {
  let sleep = null, negeerKlik = false;

  const markeer = doel => {
    if (sleep.doel && sleep.doel !== doel) sleep.doel.classList.remove('erboven');
    if (doel) doel.classList.add('erboven');
    sleep.doel = doel;
  };

  container.addEventListener('click', e => {
    const item = e.target.closest(selector);
    if (item && !item.disabled && !negeerKlik) opTik(item);
    negeerKlik = false;
  });

  container.addEventListener('pointerdown', e => {
    const item = e.target.closest(selector);
    if (!item || item.disabled) return;
    sleep = { item, x: e.clientX, y: e.clientY, kopie: null, doel: null };
    item.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', e => {
    if (!sleep) return;
    if (!sleep.kopie && Math.hypot(e.clientX - sleep.x, e.clientY - sleep.y) > 8) {
      const r = sleep.item.getBoundingClientRect();
      sleep.kopie = sleep.item.cloneNode(true);
      sleep.kopie.classList.add('sleep-kopie');
      sleep.kopie.style.width = r.width + 'px';
      document.body.append(sleep.kopie);
    }
    if (!sleep.kopie) return;
    sleep.kopie.style.left = e.clientX + 'px';
    sleep.kopie.style.top = e.clientY + 'px';
    markeer(vindDoel(e));
  });

  const stop = e => {
    if (!sleep) return;
    if (sleep.kopie) {
      sleep.kopie.remove();
      negeerKlik = true; // de klik die direct na het slepen komt, telt niet als tik
      setTimeout(() => { negeerKlik = false; });
      const doel = e.type === 'pointerup' ? vindDoel(e) : null;
      if (doel) opNeerzetten(sleep.item, doel);
    }
    markeer(null);
    sleep = null;
  };
  container.addEventListener('pointerup', stop);
  container.addEventListener('pointercancel', stop);
}

/* Ligt het punt van de vinger (ruim) boven dit element? */
function boven(el, e, marge = 20) {
  const r = el.getBoundingClientRect();
  return e.clientX >= r.left - marge && e.clientX <= r.right + marge && e.clientY >= r.top - marge && e.clientY <= r.bottom + marge;
}
