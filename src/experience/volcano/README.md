# CodeLava volcano opener

Drop `<VolcanoExperience locale="en" />` at the top of the homepage. Pass localized CMS copy in `tagline` and `kicker`. The optional `onComplete` fires once when an animated instance first reaches the end of its scroll range. Content below the hero can render immediately. The hero contains the page’s CodeLava H1. Its duplicate reveal lockup is hidden from assistive technology.

Visit `/lab/volcano` for English and `/lab/volcano?locale=ar` for Arabic. The language switch and ordinary page content follow the pinned section. A focus-visible link skips the whole scene.

## Beat map

| Scroll progress | Composition |
| --- | --- |
| 0–12% | A still night landscape, opening wordmark and localized tagline. The crater starts to brighten. |
| 12–29% | The opening title lifts away as real footage reaches ignition. Point sprites rise from the summit. |
| 29–50% | Syntax-colored TypeScript, Python, SQL and Swift fragments fan out from the crater, interspersed with Arabic comments. |
| 50–69% | The fan bends into a twisted strip. Pulses of light track along its strands while the eruption dissolves back into the night landscape. |
| 69–86% | The strip curls inward to the summit. An inline SVG bracket-and-volcano mark and a DOM wordmark resolve in its place. |
| 86–94% | The identity holds with the active locale’s tagline. |
| 94–100% | The identity lifts and dims, the terrain recedes into the page background and a low pool of orange light travels out with the sticky stage. |

## Rendering and tuning

- `VolcanoExperience.tsx` server-renders the first-party 61,544-byte WebP and the semantic heading. After hydration, an idle callback imports the scene. The reduced-motion path keeps a single viewport with the poster and centered vector identity, and skips the scene import and video request. Changing the preference tears down an active scene.
- `scene.ts` maps GSAP ScrollTrigger progress to visual state. CSS sticky supplies the pin, so the shell and keyboard scrolling work without a JavaScript pin spacer. A shared window-scroll Lenis instance at `window.__lenis` can drive updates. The hero does not instantiate a second scroll controller.
- `volcano.css` sets the scroll length to 380svh on desktop and 325svh below 640px, including the visible viewport. The stage must sit inside the page scroller. An ancestor with overflow scrolling can change the sticky containing block.
- The two H.264 plates retain the first 30 frames of the original at 24 fps. Every frame is a keyframe. They contain no audio stream. Source selection uses viewport width or coarse pointer. A seek is allowed to finish before the next target is applied, so quick reversals converge on the latest position. The supplied full-length clips and baked logo are never requested.
- `ink.ts` draws the ribbon and native-resolution glyphs with Canvas 2D. The same parametric function positions the strokes and type. Adjust the fan, twist or collapse terms in `point()` to retune the shape. The multilingual snippet list and colors are near the top of the file. Code remains LTR on Arabic pages. DPR tops out at 1.75 for text and 1.25 on the lower quality tier.
- `embers.ts` adds 320 deterministic GPU point sprites in one draw call, or 96 on the lower tier. Surface area is capped independently of the text layer. Unsupported WebGL leaves the footage, code ribbon and identity intact. No Three.js runtime, postprocessing passes, separate particle textures or continuous animation loop are needed for this shot.
- All geometry derives from scroll position. Intersection and document-visibility checks suspend hero drawing outside the visible scene. The teardown removes observers, media listeners, Lenis subscription, ScrollTrigger, shaders, buffer and program. Slow active frames lower the ink and ember budgets.

## Measurements

Chromium 1255 headless, local Next development server, eight settled positions at 0%, 18%, 33%, 45%, 59%, 70%, 86% and 97%. The timing sample is a five-second continuous reverse scroll after the forward capture sequence, with the video decoded and software WebGL enabled. FPS measures requestAnimationFrame cadence. Long tasks use the browser’s 50 ms threshold.

| Viewport | Mean FPS | p95 frame interval | Long tasks | Hero media, including WebP |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900, English, DPR 1 | 55.2 | 33.3 ms | 0 | 1,605,539 bytes |
| 390 × 844, Arabic, touch, DPR 2 | 60.0 | 16.7 ms | 0 | 973,065 bytes |

The desktop run dropped some frames under software rendering. Physical mobile GPU performance remains unverified. On a separate cold lab navigation with 4× CPU throttling, 150 ms latency and a 1.6 Mbps download cap, the last LCP entry observed in the first 12 seconds was 952 ms. This is a development-lab observation. Production homepage fonts, navigation and other sections will affect field LCP.

A standalone minified ESM split build (esbuild, React and framework runtime external, CSS omitted) measured 3,943 bytes initial JS / 1,643 bytes gzip and 123,734 bytes lazy JS / 49,062 bytes gzip, including GSAP and ScrollTrigger. The shared production build can deduplicate these dependencies.

The reduced-motion check reported a 720px scene in a 720px viewport, no video source and no animated scene. A separate no-WebGL check with a failed video request reached full identity opacity with zero page errors. The English and Arabic eight-frame contact sheets and the reproducible Playwright script are in the local review directory `/tmp/codelava-volcano/`.
