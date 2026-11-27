# Volcano Hero Soundscape (`src/experience/volcano/sound/`)

Optional, muted-by-default Web Audio API cinematic soundscape synchronized with `HeroStage` scroll progress (`0..1`).

## Features
- **Muted by default** with an accessible EN/AR pill toggle (`<VolcanoSoundToggle />`), `aria-pressed`, keyboard navigation, and polite live status updates (`heroSound` keys in `src/i18n/messages/{en,ar}.json`).
- **Remembers user preference** in `localStorage` (`codelava:hero-sound`) wrapped in `try/catch`; respects browser autoplay rules with one-shot gesture unlock.
- **Zero eager network cost**: compressed Opus (`.webm`, 124 KB) or AAC (`.m4a`, 188 KB) stems under `public/media/hero/sound/` are lazy-loaded only after sound is enabled. Includes a procedural Web Audio fallback if any asset cannot be decoded.
- **Scroll-synchronized sound design**:
  - `0.00–1.00`: Subtle deep volcanic rumble bed + realistic molten lava bubbling/flow (gains & low-pass cutoffs swell with progress and taper on exit).
  - `0.26` (re-arms `< 0.14`, 3.5s cooldown): Single powerful seismic eruption hit.
  - `0.33 / 0.43 / 0.53 / 0.63` (0.06 hysteresis, 420ms cooldown, max 2 voices): Light crystalline digital code bursts with stereo movement.
  - `0.80` (re-arms `< 0.64`, 3.0s cooldown): Distinctive CodeLava Dmaj9 sonic logo signature with gentle bed ducking.
- **Reversible-scroll & viewport safe**: Forward-only transient triggers, hysteresis bands, jump suppression, and automatic smooth fade-out + `AudioContext.suspend()` when the hero leaves the viewport or the browser tab is hidden.
- **Reduced-motion respectful**: Toggle remains fully functional under `prefers-reduced-motion: reduce`, playing a softened ambient volcanic bed without sudden scroll hits.

## 3-Line Integration in `HeroStage`

```tsx
import { useVolcanoSound, VolcanoSoundToggle } from "./sound";
// Inside HeroStage (or its client wrapper), pass your stage ref & call sound.setProgress(p) on scroll:
const sound = useVolcanoSound({ stageRef }); // feed 0..1 via sound.setProgress(progress)
// Render inside .dl-pin:
<VolcanoSoundToggle sound={sound} />
```

If scroll progress lives in an imperative `.ts` module (such as `daylight-scene.ts`), call `volcanoSound.setProgress(p)` directly while rendering `<VolcanoSoundToggle />` inside `HeroStage` — both share the same controller automatically.

## Audio Assets & License
All stems in `public/media/hero/sound/` are 100% original procedural syntheses generated locally via `src/experience/volcano/sound/generate-assets.py` (Python 3 stdlib + FFmpeg) and dedicated under **CC0 1.0 Universal** (`public/media/hero/sound/LICENSE.txt`).
