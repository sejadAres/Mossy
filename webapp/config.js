/* =========================================================
   Centrale instellingen van Mossy (kiosk + iPad/telefoon).
   Pas hier de video, de link voor de QR-code en de tijden aan.
   ========================================================= */
const CONFIG = {
  // Introductievideo op de kiosk. Zet het bestand in webapp/media/
  // of gebruik een volledige URL. Een .mp4 speelt als gewone video;
  // een .html speelt als geanimeerde uitleg (zoals media/introductie.html).
  // Poster = stilstaand beeld vóór het afspelen.
  video: 'media/introductie.html',
  videoPoster: 'images/mossy.png',

  // Link in de QR-code op de kiosk. Leeg = de map waarin kiosk.html staat
  // (dus index.html op dezelfde website). Vul hier de publieke URL in als de
  // kiosk lokaal draait, bijvoorbeeld 'https://mossyapp.netlify.app/'.
  appUrl: '',

  // Beschikbaarheid van de stemhokjes. Er is nog geen koppeling die dit weet,
  // dus de kiosk vraagt de student zelf te kijken welk hokje vrij is.
  // Later bijvoorbeeld: hokjes: [{ naam: 'Hokje 1', vrij: true }, ...]
  hokjes: null,

  // Kiosk: na zoveel seconden op het overstapscherm terug naar de video.
  kioskTerugNaSeconden: 90,

  // iPad (index.html?apparaat=ipad): sessie automatisch wissen na
  // zoveel minuten zonder aanraking. 0 = uit.
  ipadInactiefMinuten: 5,

  // Sleutel voor tijdelijke antwoorden in deze browsertab (sessionStorage).
  opslagSleutel: 'mossy-sessie'
};
