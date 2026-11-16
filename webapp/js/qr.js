/* =========================================================
   Kleine QR-codegenerator (byte-modus, foutcorrectie M, versie 1–10).
   Gebruik: maakQrSvg('https://...') -> SVG-tekst.
   Geen externe bibliotheek nodig, dus de kiosk werkt ook offline.
   Gebaseerd op de QR-specificatie (ISO/IEC 18004).
   ========================================================= */
const QR_BLOKKEN_M = [ // per versie: [EC-codewoorden per blok, [aantal blokken, datacodewoorden], ...]
  null,
  [10, [1, 16]], [16, [1, 28]], [26, [1, 44]], [18, [2, 32]], [24, [2, 43]],
  [16, [4, 27]], [18, [4, 31]], [22, [2, 38], [2, 39]], [22, [3, 36], [2, 37]], [26, [4, 43], [1, 44]]
];
const QR_UITLIJNING = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

function maakQrSvg(tekst) {
  const modules = maakQrMatrix(tekst);
  const n = modules.length, rand = 4;
  let pad = '';
  modules.forEach((rij, y) => rij.forEach((zwart, x) => { if (zwart) pad += `M${x + rand} ${y + rand}h1v1h-1z`; }));
  return `<svg class="qr" viewBox="0 0 ${n + 2 * rand} ${n + 2 * rand}" shape-rendering="crispEdges" role="img" ` +
         `aria-label="QR-code naar ${tekst}"><rect width="100%" height="100%" fill="#fff"/><path d="${pad}" fill="#1B455B"/></svg>`;
}

function maakQrMatrix(tekst) {
  const bytes = [...new TextEncoder().encode(tekst)];

  // 1. Kleinste versie kiezen waar de tekst in past
  let versie = 1;
  const dataCapaciteit = v => QR_BLOKKEN_M[v].slice(1).reduce((s, [aantal, dc]) => s + aantal * dc, 0);
  const nodigeBits = v => 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
  while (versie <= 10 && nodigeBits(versie) > dataCapaciteit(versie) * 8) versie++;
  if (versie > 10) throw new Error('Tekst te lang voor de QR-code');

  // 2. Databits: modus, lengte, bytes, afsluiting en opvulling
  const bits = [];
  const zet = (waarde, lengte) => { for (let i = lengte - 1; i >= 0; i--) bits.push((waarde >>> i) & 1); };
  zet(0b0100, 4);
  zet(bytes.length, versie < 10 ? 8 : 16);
  bytes.forEach(b => zet(b, 8));
  const capBits = dataCapaciteit(versie) * 8;
  zet(0, Math.min(4, capBits - bits.length));
  zet(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xEC; bits.length < capBits; pad ^= 0xEC ^ 0x11) zet(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

  // 3. Blokken met foutcorrectie (Reed-Solomon) en verweven
  const [ecLen, ...groepen] = QR_BLOKKEN_M[versie];
  const deler = rsDeler(ecLen), blokken = [];
  let pos = 0;
  groepen.forEach(([aantal, dc]) => {
    for (let i = 0; i < aantal; i++) {
      const d = data.slice(pos, pos += dc);
      blokken.push({ d, ec: rsRest(d, deler) });
    }
  });
  const codewoorden = [];
  const maxD = Math.max(...blokken.map(b => b.d.length));
  for (let i = 0; i < maxD; i++) blokken.forEach(b => { if (i < b.d.length) codewoorden.push(b.d[i]); });
  for (let i = 0; i < ecLen; i++) blokken.forEach(b => codewoorden.push(b.ec[i]));

  // 4. Vaste patronen tekenen
  const n = versie * 4 + 17;
  const m = Array.from({ length: n }, () => Array(n).fill(false));
  const vast = Array.from({ length: n }, () => Array(n).fill(false));
  const vul = (x, y, zwart) => { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = zwart; vast[y][x] = true; } };

  for (let i = 0; i < n; i++) { vul(6, i, i % 2 === 0); vul(i, 6, i % 2 === 0); } // timing
  [[3, 3], [n - 4, 3], [3, n - 4]].forEach(([cx, cy]) => { // zoekpatronen
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      vul(cx + dx, cy + dy, d !== 2 && d !== 4);
    }
  });
  const al = QR_UITLIJNING[versie];
  al.forEach((cy, i) => al.forEach((cx, j) => { // uitlijnpatronen
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) vul(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  zetFormaat(vul, n, 0); // reserveer de formaatplekken
  if (versie >= 7) { // versie-informatie
    let rest = versie;
    for (let i = 0; i < 12; i++) rest = (rest << 1) ^ ((rest >>> 11) * 0x1F25);
    const vb = (versie << 12) | rest;
    for (let i = 0; i < 18; i++) {
      const bit = ((vb >>> i) & 1) === 1, a = n - 11 + (i % 3), b = Math.floor(i / 3);
      vul(a, b, bit); vul(b, a, bit);
    }
  }

  // 5. Codewoorden in zigzag plaatsen
  let i = 0;
  for (let rechts = n - 1; rechts >= 1; rechts -= 2) {
    if (rechts === 6) rechts = 5;
    for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
      const x = rechts - j, omhoog = ((rechts + 1) & 2) === 0, y = omhoog ? n - 1 - v : v;
      if (!vast[y][x] && i < codewoorden.length * 8) {
        m[y][x] = ((codewoorden[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
        i++;
      }
    }
  }

  // 6. Beste masker kiezen
  const MASKERS = [
    (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
    (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0
  ];
  let beste = null;
  MASKERS.forEach((masker, nr) => {
    const kopie = m.map((rij, y) => rij.map((z, x) => (!vast[y][x] && masker(x, y)) ? !z : z));
    zetFormaat((x, y, z) => { kopie[y][x] = z; }, n, nr);
    const p = qrStrafpunten(kopie);
    if (!beste || p < beste.p) beste = { p, kopie };
  });
  return beste.kopie;
}

/* Formaatinformatie (foutcorrectie M = 00 + masker), twee keer in de code. */
function zetFormaat(vul, n, masker) {
  let rest = masker;
  for (let i = 0; i < 10; i++) rest = (rest << 1) ^ ((rest >>> 9) * 0x537);
  const bits = ((masker << 10) | rest) ^ 0x5412;
  const bit = i => ((bits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) vul(8, i, bit(i));
  vul(8, 7, bit(6)); vul(8, 8, bit(7)); vul(7, 8, bit(8));
  for (let i = 9; i < 15; i++) vul(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) vul(n - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) vul(8, n - 15 + i, bit(i));
  vul(8, n - 8, true);
}

/* Vereenvoudigde strafpunten: lange reeksen, 2x2-blokken en zwart/wit-balans. */
function qrStrafpunten(m) {
  const n = m.length;
  let p = 0, zwart = 0;
  for (let a = 0; a < n; a++) {
    let rijRun = 1, kolRun = 1;
    for (let b = 0; b < n; b++) {
      if (m[a][b]) zwart++;
      if (b > 0) {
        rijRun = m[a][b] === m[a][b - 1] ? rijRun + 1 : 1;
        kolRun = m[b][a] === m[b - 1][a] ? kolRun + 1 : 1;
        if (rijRun === 5) p += 3; else if (rijRun > 5) p++;
        if (kolRun === 5) p += 3; else if (kolRun > 5) p++;
      }
      if (a > 0 && b > 0 && m[a][b] === m[a - 1][b] && m[a][b] === m[a][b - 1] && m[a][b] === m[a - 1][b - 1]) p += 3;
    }
  }
  return p + Math.floor(Math.abs(zwart * 20 - n * n * 10) / (n * n)) * 10;
}

/* Reed-Solomon in GF(256) */
function gfMaal(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
  return z;
}
function rsDeler(graad) {
  const r = Array(graad).fill(0);
  r[graad - 1] = 1;
  let wortel = 1;
  for (let i = 0; i < graad; i++) {
    for (let j = 0; j < graad; j++) { r[j] = gfMaal(r[j], wortel); if (j + 1 < graad) r[j] ^= r[j + 1]; }
    wortel = gfMaal(wortel, 2);
  }
  return r;
}
function rsRest(data, deler) {
  const rest = Array(deler.length).fill(0);
  data.forEach(b => {
    const f = b ^ rest.shift();
    rest.push(0);
    deler.forEach((c, i) => { rest[i] ^= gfMaal(c, f); });
  });
  return rest;
}
