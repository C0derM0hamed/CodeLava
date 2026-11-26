# CodeLava — Design Reference v2 ("Daylight Magma")

**This supersedes the dark "Obsidian & Magma" visual direction in ARCHITECTURE.md.** Everything else in ARCHITECTURE.md (ownership, data rules, security, a11y, perf) still applies.

The client supplied `docs/design-reference.png` (open it — it is the benchmark). Use it for layout balance, spacing, hierarchy, colour harmony, card/CTA styling and section rhythm. Do **not** copy it pixel-for-pixel, and **never copy its content**: the logos (Saqa, Meridian…), testimonials (Fahad A., Ahmed M.), stats (50+, 30+…), blog posts, addresses and phone numbers in it are placeholders. Our content is 100 % from the DB; sections with no data hide themselves.

## 1. What the reference does (analysis)

**Tone** — bright, airy, premium, confident. Light pearl surfaces, lots of breathing room, one dominant warm accent (orange), cool code colour (cyan→blue) only on the bracket/code motif. Volcano imagery is *contained* (hero art, process band, CTA banner) — never full-page darkness.

**Layout system**
- Container ≈ 1200–1280 px content width, centred; generous gutters (`.container-lava`, `--container` may be tightened to 1240px).
- Section vertical rhythm: ~96–128 px desktop / 64–80 px mobile between sections. Never cramped.
- **Signature section pattern: "split intro"** — a left column (~30–35 %) holding kicker + H2 + 2–3 line intro + orange text link ("Explore All Services →"), and a right column (~65 %) holding the content (tiles, cards, logos). Used for Services, Technologies, Testimonials, Blog. Vary it (e.g. About flips image left), so it reads editorial, not templated.
- Hero: 2 columns — copy left (~45 %), volcano art right (~55 %), then a trust strip of client logos separated by thin vertical dividers.
- Featured project: text left · device mockup centre · stats card (2×2) right.
- Process: **full-bleed dark ink band with soft wavy top/bottom edges**, steps connected by a glowing lava line, each step an icon tile with orange outline icon.
- CTA banner: dark rounded (radius-xl) card with volcano imagery bleeding in from one side, white pill primary + outlined pill secondary.
- Footer: dark ink, 5 columns (brand+socials · quick links · services · contact · newsletter), bottom bar with legal + language.

**Colour logic** (tokens in `src/app/globals.css`, never raw hex)
- Page `--bg` warm pearl `#f6f5f3`; cards `--surface` pure white; atmospheric washes `.page-wash` (soft peach top-right, lavender mist left).
- Text: `--text` deep ink-navy `#151a29` (never pure black), `--text-muted` `#4a5165`, `--text-faint`.
- Accent: orange gradient `--gradient-cta` for primary CTAs and the hero's highlighted words (`.text-lava-gradient`). Orange **text** must use `--accent-text` (AA on light).
- Code motif: `--gradient-code` / `--code-cyan` / `--code-blue` for the `<` bracket and code ornaments.
- Dark bands: wrap in `.surface-dark` (or `data-surface="dark"`): semantic tokens flip automatically (ink bg, warm-white text). Use for process band, CTA banner, footer — max ~3 dark moments per page.
- Purple: none.

**Typography**
- Display: Outfit **700**, tight tracking, sizes contained (hero ≈ 72–84 px desktop, section H2 ≈ 40–44 px, card titles ≈ 18–22 px). Two-line H2s are the norm ("End-to-End / Digital Solutions").
- Hero headline: line 1 ink, line 2 orange gradient (highlight the key phrase).
- Body 15–17 px, `--text-muted`, max ~46ch in intros.
- Kicker: `.kicker-rule` — 28 px orange gradient rule + short label in `--accent-text`, 13 px semibold (sentence case, not mono caps). Mono is reserved for code ornaments/meta.
- Arabic: Readex Pro / IBM Plex Sans Arabic, no letter-spacing, taller line-height (already in tokens).

**Components**
- **Primary CTA**: pill (`--radius-pill`), `--gradient-cta`, white 15 px semibold, trailing arrow (mirrored in RTL), `--shadow-lava`, hover lifts 1–2 px + arrow nudges. Height 44–48 px.
- **Secondary CTA**: white pill with hairline border + ink text, or a "play" circle + label ("Watch our work"). On dark: outlined pill with white text.
- **Text link CTA**: orange `--accent-text` label + arrow, used at the end of split intros.
- **Tiles/cards**: white, `--radius-md` (14 px), `--shadow-card`, hairline `--line` border, generous padding; hover → `--shadow-lift` + 2 px rise. The *active/featured* tile may be dark ink with orange glow (Services row).
- **Icon style**: 1.5–1.75 px stroke line icons (lucide) in orange inside tiles; tech logos in white square tiles.
- **Stats card**: one white card, 2×2 grid with hairline dividers, orange icon + big number + small label. (Only from DB achievements.)
- **Testimonial card**: white, avatar circle, 5 orange stars, quote, name/role, source badge (Upwork/Mostaql/Direct) + country flag. Prev/next round buttons (one orange filled, one white).
- **Blog card**: image top (radius-md, 16:10), category in orange, title 2 lines, date + read time meta with icons.
- **Header**: light, sticky, white/glass on scroll with hairline bottom border; logo left, nav centre with active item in orange + 2 px orange underline, language switch (globe + code), primary pill "Get a Quote" right. Mobile: burger → full-height light sheet.
- **Forms**: white fields, 12 px radius, hairline border, orange focus ring.

**Motion (restrained)**
- Reveal on scroll: 16–24 px rise + fade, 600–800 ms expo-out, light stagger.
- Hover: lift + shadow; arrows nudge; tiles tilt subtly at most.
- Hero: the volcano art is alive (lava glow breathing, slow ribbon ring orbit, a few embers), scroll adds a gentle eruption/parallax — no 380vh pinned film, no heavy smoke.
- Flame cursor: kept, tuned for light backgrounds (smaller, warmer, lower opacity).
- Everything respects `prefers-reduced-motion`.

## 2. Improvements over the reference (our refinement)
- Better contrast: orange text uses `--accent-text`; CTAs meet 3:1 non-text and readable labels.
- Real bilingual quality: every layout mirrors cleanly in RTL (logical properties, mirrored arrows), Arabic copy not a translation afterthought.
- Fewer identical cards: vary tile sizes; one dark featured tile per row max.
- Data honesty: no fabricated logos/stats/reviews — sections hide when empty.
- Performance: hero art is optimised (AVIF/WebP + small canvas/WebGL accents), LCP is the headline text.
