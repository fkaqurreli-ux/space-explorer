# SEC PX1 — Solar Explorer

Eksperiencë interaktive 3D e sistemit diellor, e ndërtuar me Three.js dhe JavaScript modules.

## Nisja lokale

Shërbeje folderin me një server statik (p.sh. VS Code Live Server) ose përdor Vite:

```bash
npm create vite@latest solar-odyssey -- --template vanilla
# kopjo skedarët e këtij projekti te projekti Vite
npm install three
npm run dev
```

GitHub Pages përdor CDN për Three.js dhe teksturat; nuk kërkon build lokal.

## Arkitektura

- `index.html`: markup semantik dhe importmap.
- `styles/main.css`: UI responsive, tipografi dhe controls.
- `js/main.js`: skena Three.js, drita, planetët, orbitat dhe loop-i.
- `js/planets.js`: të dhënat shkencore dhe hartat e teksturave.
- `js/audio.js`: soundscape procedural Web Audio me crossfade.
- `js/camera.js`: fluturime kamere me easing.
- `js/ui.js`: navigimi dhe telemetria.

## Tekstura dhe audio

Teksturat ngarkohen nga Solar System Scope CDN. Mund t'i vendosësh lokalisht në `assets/textures/` dhe të ndryshosh `TEX` në `js/planets.js` në `../assets/textures/`. Për Tokën, normal/cloud/specular maps duhen shtuar vetëm pasi të verifikohet emri dhe formati i skedarit në burim. Soundscape gjenerohet proceduralisht; për audio personale, krijo një Audio element dhe përdor skedarë në `assets/audio/` pas ndërveprimit të përdoruesit.

Kontrollo licencën dhe kushtet e atribuimit të çdo teksture/audioje përpara ripërdorimit. Përmasa orbitale dhe shpejtësitë në këtë pamje janë të shkallëzuara për vizualizim, jo simulim astronomik në njësi absolute.
