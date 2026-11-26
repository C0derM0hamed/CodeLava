# CodeLava — Architecture & Team Contract

Read this fully before touching code. Lead architect & reviewer: **Claude**. Several agents work **in the same checkout at the same time** — respect file ownership.

## Product
Premium bilingual (EN / AR, LTR / RTL) website + admin dashboard for **CodeLava** (`.codelava`), a software & AI engineering company targeting the Gulf (KSA, UAE, Kuwait, Qatar), Egypt and international clients. Tagline: *"Software & AI Solutions"* — Arabic: *"ابتكار يتدفق برمجياً"* (innovation flowing through code).

## Brand & creative direction — "Obsidian & Magma"
- Logo: white `<` + lava-orange `>` brackets cradling a cracked, glowing volcano; wordmark "Code" (warm white) + "Lava." (orange gradient), geometric sans. Key art: `public/brand/logo-key-art.png` (has background — not a transparent asset).
- Palette: obsidian blacks (warm undertone), lava orange heat scale, warm white text; syntax accents (cyan/blue/green/yellow) **only** where code is the motif. Minimal purple. Tokens in `src/app/globals.css` — never use raw hex in components.
- Mood: cinematic, calm confidence, heat under the surface. Lava is *light*, not decoration: glows, cracks, embers, heat-haze. Typography and whitespace do most of the work.
- **Avoid**: generic AI landing layouts (centered hero + 3 cards + logos strip + 3 cards…), repetitive card grids, pill buttons with gradients everywhere, excessive neon/glow, glassmorphism soup, emoji icons, stock "rocket" metaphors, purple gradients.
- Prefer: editorial grids, asymmetric compositions, oversized type, code-as-texture, horizontal scroll moments, sticky storytelling, magnetic/underlined text links instead of conventional buttons, numbered sections in mono (`01 / Services`).
- Fonts (next/font/google, set as CSS vars in root layouts): display Latin **Outfit** (`--font-display-latin`), body Latin **Geist** (`--font-body-latin`), code **JetBrains Mono** (`--font-code`), Arabic display **Readex Pro** (`--font-display-arabic`), Arabic body **IBM Plex Sans Arabic** (`--font-body-arabic`). Tailwind: `font-display`, `font-sans`, `font-mono`.

## Stack
Next.js 16 (App Router, RSC, Server Actions, Turbopack) · React 19 · TypeScript strict · Tailwind v4 · PostgreSQL 18 (docker compose, port 5433) · Drizzle ORM · next-intl · Three.js + GSAP (ScrollTrigger) + Lenis · zod · @node-rs/argon2 · sharp · file-type. Package manager **pnpm**. Network is slow: **do not add dependencies** without the lead's approval (ask in your final report instead); everything above is already installed.

## Directory map & ownership
| Path | Owner lane |
|---|---|
| `src/db/**`, `drizzle.config.ts`, `ARCHITECTURE.md`, `src/i18n/routing.ts`, `src/i18n/navigation.ts` | Lead (ask before changing; schema additions allowed by Backend lane — report them) |
| `src/experience/volcano/**`, `public/media/hero/**`, `src/app/(lab)/**` | **Volcano lane** |
| `src/app/globals.css` (refine tokens), `src/components/ui/**`, `src/components/brand/**`, `src/components/site/**`, `src/experience/cursor/**`, `src/experience/fx/**` | **Design-system lane** |
| `src/i18n/**` (except routing/navigation), `src/proxy.ts`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/not-found.tsx`, `src/server/queries/**`, `src/lib/**`, `src/content/**`, `src/app/sitemap.ts`, `src/app/robots.ts` | **Platform lane** (i18n, public data, SEO) |
| `src/server/**` (except `queries`), `src/app/admin/**`, `src/app/api/**`, `src/components/admin/**`, `drizzle/**`, `scripts/**` | **Backend lane** |
| `src/app/[locale]/**` pages & `src/components/sections/**` | Assigned per page in phase 2 |

If you need a change in a file you don't own, **don't edit it** — note it in your final report (exact change) and the lead integrates it.

## Routing
- Public: `src/app/[locale]/…` — root layout per locale sets `<html lang dir>`. No `src/app/layout.tsx` (multiple root layouts: `[locale]`, `admin`, `(lab)`).
- Admin: `src/app/admin/…` — own root layout, English UI, edits both locales side-by-side. Not indexed.
- `src/proxy.ts` (Next 16 middleware): locale negotiation for public paths only; excludes `/admin`, `/api`, `/media`, `/_next`, files.
- Use `Link`/`useRouter` from `@/i18n/navigation` in public UI.

### Public routes
`/[locale]` home · `/services` · `/services/[slug]` · `/work` (portfolio, filters `?category=`) · `/work/[slug]` (case study) · `/about` (story, team, achievements, clients) · `/process` · `/technologies` · `/blog` · `/blog/[slug]` · `/faq` · `/contact` · `/quote` (multi-step project quotation w/ attachments) · `/privacy`.

## Data rules
- **All business content is dynamic from the DB.** Never hardcode or invent projects, testimonials, reviews, achievements, client logos, team members, statistics or contact details. Sections whose data is empty **hide themselves** (or show a tasteful neutral state on index pages) — never placeholder lorem/fake data on the public site.
- Generic brand copy (headlines, section intros, CTA text, service descriptions) lives in `page_sections` / i18n messages and is editable in the dashboard; seed defaults may be written by us.
- Localized fields are jsonb `{en, ar}`. Use `t(field, locale)` helper from `src/lib/i18n-content.ts` (falls back to the other locale if empty).
- Draft/preview: public queries return only `status='published'` unless Next `draftMode()` is enabled (admin "Preview" sets it via `/api/preview?secret&path`).
- Caching: public queries use `unstable_cache`/`"use cache"` with tags (`projects`, `services`, …); admin mutations call `revalidateTag`.

## Security
Argon2id passwords · DB sessions (sha256 token id, httpOnly Secure SameSite=Lax cookie, rotating, 14d) · RBAC permissions checked **in every server action / route** (not only UI) · CSRF: server actions + Origin check on route handlers · zod validation everywhere · rate limiting on login & public forms (DB/memory token bucket) · honeypot + timing check on forms · uploads: size limits, magic-byte sniffing (`file-type`), allow-list mime, re-encode images with sharp (strips EXIF), random storage keys, lead attachments stored **private** and served only via authenticated route · sanitize rendered markdown · security headers (CSP, HSTS, frame-ancestors, referrer-policy) in `next.config.ts` (lead integrates).

## Performance budget
LCP < 2.5s on 4G mid-tier mobile; hero JS lazy-loaded after first paint; WebGL only when supported & not reduced-motion; total hero media ≤ ~6 MB desktop, ≤ ~2.5 MB mobile; images via next/image with AVIF/WebP; no layout shift from fonts (`display: swap` + size-adjust via next/font).

## Accessibility & motion
WCAG 2.2 AA. All effects respect `prefers-reduced-motion` (static, elegant fallback) and are disabled on coarse pointers where they add nothing (custom cursor). Keyboard navigable, visible focus, skip link, proper landmarks, `aria-live` for form status. Arabic: logical CSS properties (`ms-*`, `me-*`, `start`, `end`), mirror directional icons, never letter-space Arabic text.

## Future AI platform (phase 2 — do NOT build now)
Keep modules decoupled (`src/server/<module>`), leads carry `metadata`/`score`, and every lead/content change writes a row to `domain_events` (outbox). A future service can consume events, enrich leads, generate proposals, and expose its own API under `/api/v1/*`.

## Commands
`docker compose up -d` · `pnpm db:push` / `pnpm db:generate` / `pnpm db:migrate` · `pnpm db:seed` · `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck`.
Dev servers: do **not** start `pnpm dev` on port 3000 (reserved for the lead). Use your own port (`pnpm dev -p 31xx`, given in your brief) and stop it when finished.
