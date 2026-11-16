/* =========================================================
   Sessie: tijdelijke antwoorden van één student.
   Alles staat in sessionStorage van deze browsertab en verdwijnt
   met Sessie.wis() of als de tab wordt gesloten. Er wordt niets verstuurd.
   ========================================================= */
const Sessie = {
  lees() {
    try {
      return JSON.parse(sessionStorage.getItem(CONFIG.opslagSleutel)) || { antwoorden: {} };
    } catch {
      return { antwoorden: {} };
    }
  },

  bewaar(data) {
    try {
      sessionStorage.setItem(CONFIG.opslagSleutel, JSON.stringify(data));
    } catch {
      /* Opslag niet beschikbaar (bijv. privé-modus): de app werkt dan zonder vernieuwen-herstel. */
    }
  },

  antwoorden() {
    return this.lees().antwoorden;
  },

  zetAntwoord(vraagId, waarde) {
    const data = this.lees();
    data.antwoorden[vraagId] = waarde;
    this.bewaar(data);
  },

  heeftAntwoorden() {
    return Object.keys(this.antwoorden()).length > 0;
  },

  wis() {
    try { sessionStorage.removeItem(CONFIG.opslagSleutel); } catch { /* niets te wissen */ }
  }
};
