# Night volcano lab

The night opener runs at `/lab/volcano` (English) and `/lab/volcano?locale=ar` (Arabic). The public homepage uses the separate daylight `HeroStage`. Measurements below cover the night lab.

`VolcanoExperience` accepts `locale`, localized `tagline` and `kicker`, `className`, and an optional `onComplete` that fires once when the animated instance first reaches the end. Its opening wordmark is an H1. The duplicate reveal lockup and code textures are decorative. Keyboard users can skip directly past the scene.

To join the outgoing stroke to the next section, render the named export `HeroFilament` from `./HeroFilament` as the first child of a relatively positioned, full-width section directly after the hero. Both curves meet 18% from the inline start and share a vertical tangent. The lab demonstrates the placement in both reading directions.

## Beat map

| Progress | Action |
| --- | --- |
| 0–12% | The opening wordmark and tagline sit over a calm night crater. |
| 12–29% | The title lifts away, the filmed crater ignites, and staggered spark volleys begin. |
| 29–50% | Code launches from the crater on ballistic arcs to either side. Depth changes softness, size and opacity. Bounding-box clearance keeps foreground fragments apart. |
| 50–70% | Code gathers into a loop of moving glyphs. The hot center and cool edges narrow at the twist, and the reverse face dims. |
| 70–86% | Five longitudinal sections contract onto the exact paths of the two brackets and three lava seams. A faceted SVG volcano settles between the brackets. |
| 86–94% | The identity holds with the localized tagline and a few drifting embers. |
| 94–100% | The identity lifts, the landscape dims and a single filament extends into the following section. |

## Footage and rendering

The source already contains generated lettering near 1.1 seconds, including throughout frames 80–95. The silent 3.625-second plates preserve the moving fire fountain by tracking it back to the opening crater and compositing the warm plume over the clean landscape. Both H.264 files contain 87 independently seekable frames at 24 fps. A coarse pointer or viewport at most 700px wide selects 854 × 480. Desktop selects 1280 × 720.

- `VolcanoExperience.tsx` server-renders a 61,544-byte WebP and the heading. An idle callback imports the motion code. Reduced motion keeps the poster, SVG and localized identity in one viewport.
- `scene.ts` maps ScrollTrigger progress to video seeks and drawing. CSS sticky supplies the pin. Scroll length, including the stage, is 380svh on desktop and 325svh below 640px. The controller subscribes to a shared window-scroll Lenis instance when available. At most one video seek is in flight.
- `ink.ts` sets the launch timing, fragment clearance and ribbon shading. Code is typeset into a repeating texture on resize. Its slices follow the local tangent of the ribbon defined in `geometry.ts`. The higher tier uses seven rows on wide screens, and narrow screens use five. Canvas DPR is capped at 1.75 or 1.4 on the lower tier.
- `geometry.ts` supplies the same bracket and crack paths to the shrinking ribbon and `mark.tsx`. Resize observations register the landing points to the rendered SVG.
- `embers.ts` draws up to 320 point sprites in one call, or 96 on the lower tier. Its drawing buffer covers the upper 48% of the stage. The late ambient embers use CSS and can continue when WebGL is unavailable.
- Scroll position determines the footage, code and geometry in both directions. Hero drawing stops outside the visible stage or in a hidden tab. The ambient drift pauses too. Teardown releases the video, GPU resources, scroll trigger, listeners and observers.

## Verification

A Playwright Chromium pass captured eight settled positions in English and Arabic at 0%, 18%, 33%, 45%, 59%, 70%, 86% and 97%. Additional frames cover the ribbon-to-mark transition and the first section after the pin. Timing uses a five-second continuous reverse scroll after the capture sequence, with software WebGL enabled on the local development server.

| Viewport | Mean FPS | p95 frame interval | Tasks over 50 ms | Media including poster |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900, English, DPR 1 | 55.4 | 33.3 ms | 0 | 2,330,655 bytes |
| 390 × 844, Arabic, touch, DPR 2 | 60.0 | 16.8 ms | 0 | 1,169,396 bytes |

Desktop software rendering dropped some frames. The mobile result comes from emulation. A cold lab navigation at 4× CPU throttling, 150 ms simulated latency and 1.6 Mbps down recorded an LCP of 1.44 seconds during a 12-second observation.

An isolated minified esbuild split bundle, excluding CSS, React and the framework runtime, measured 2,659 bytes gzip for the initial component plus shared geometry and 50,408 bytes gzip for the deferred scene, including GSAP and ScrollTrigger.

Reduced motion yielded a single 720px viewport, a visible mark and wordmark, and no video source on initial load. With the video request blocked and WebGL unavailable, the final mark and wordmark both reached full opacity without page errors. Lane-scoped TypeScript and ESLint passed.

Local capture sheets and the Playwright script are in `/tmp/codelava-volcano/` under `desktop-story.jpg`, `mobile-story.jpg`, `transition-story.jpg` and `check.cjs`.
