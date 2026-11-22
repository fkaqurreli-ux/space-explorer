# SEC PX1 — Solar System Explorer

Përvojë 3D interaktive e sistemit diellor, e frymëzuar nga NASA Eyes on the Solar System. Ndërfaqja përfshin navigim trupash qiellorë, kamerë orbitale, kontroll kohor 1949–2049, ngjarje historike të misioneve, krahasim diametrash dhe kontroll të ndriçimit.

## Nisja lokale

Kërkohet një server lokal për ES modules:

```bash
npm create vite@latest solar-odyssey -- --template vanilla
# Kopjo index.html, styles/ dhe js/ në projektin e ri
npm install three
npm run dev
```

Në GitHub Pages Three.js dhe teksturat merren nga CDN; nuk kërkohet API key për versionin aktual.

## Arkitektura

- `index.html` — strukturë UI, timeline, panel misioni dhe kontrolle.
- `styles/main.css` — pamja responsive.
- `js/main.js` — Three.js, dritat, yjet, asteroidët, koha, ngjarjet dhe ndërveprimi.
- `js/planets.js` — të dhënat e planetëve dhe teksturat.
- `js/camera.js` — animacionet e kamerës.
- `js/audio.js` — soundscape procedural Web Audio.

## Koha dhe saktësia shkencore

Timeline ndryshon datën e simulimit dhe lëviz planetët me një model Keplerian të thjeshtuar. Madhësitë, distancat dhe fazat e orbitave janë të shkallëzuara/afërsuara për eksplorim vizual. Ngjarjet Voyager, Cassini, Juno dhe Perseverance janë pika historike reference; shënuesit e misioneve janë skematikë dhe **nuk janë trajektore SPICE ose pozicione të llogaritura nga JPL Horizons**.

Për një binjak dixhital të saktë duhet të shtohet një shërbim backend që kërkon JPL Horizons API dhe SPICE kernels, i cili kthen vektorë pozicioni në një kornizë koordinative të përcaktuar. Nuk duhet të përdoret ky version për navigim, planifikim misioni ose pretendime shkencore precize. UI e shënon qartë natyrën skematike të të dhënave të misioneve.

## Teksturat dhe audio

Teksturat ngarkohen nga Solar System Scope CDN dhe Three.js examples. Për t'i zëvendësuar, vendos skedarët në `assets/textures/` dhe ndrysho `TEX` në `js/planets.js` ose URL-të përkatëse në `js/main.js`. Kontrollo emrat, formatet, licencat dhe kërkesat e atribuimit para publikimit.

Audioja gjenerohet proceduralisht me Web Audio API pas ndërveprimit të parë. Nëse shton muzikë tënden, vendose në `assets/audio/` dhe ngarko me `Audio`/Web Audio pas klikimit të përdoruesit. Respekto licencat e çdo materiali të jashtëm.

## Shënime performance

Përdoret pixel ratio i kufizuar, instancing për asteroidët dhe një numër i moderuar poligonesh. FPS real varet nga pajisja, browser-i dhe rrjeti; nuk garantohet 60 FPS në çdo pajisje.
