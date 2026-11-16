# Media

`introductie.html` is de introductie op de kiosk: een geanimeerde uitleg met ondertitels en hoofdstukken.
Een andere video gebruik je door het bestand hier neer te zetten en `video` in `webapp/config.js` aan te passen.

- `.mp4` (H.264 + AAC) speelt als gewone video, met geluid.
- `.html` speelt als animatie. De kiosk weet dat zo'n pagina klaar is als die
  `postMessage({ type: 'healthy-hub-video', event: 'ended' })` naar de kiosk stuurt,
  en pauzeert hem met `{ type: 'healthy-hub-video', cmd: 'pause' | 'play' }`.
