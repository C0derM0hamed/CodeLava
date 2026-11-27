# CodeLava

Bilingual (English / Arabic, LTR / RTL) website and admin dashboard for **CodeLava — Software & AI Solutions** (`ابتكار يتدفق برمجياً`).

- **Public site:** home, services, portfolio and case studies, process, technologies, blog, about, FAQ, contact, and a multi-step quote form with attachments.
- **Admin dashboard:** content, media, SEO, translations, leads, and roles and permissions. All business content comes from the database.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the architecture and team contract, and [`DESIGN-REFERENCE.md`](DESIGN-REFERENCE.md) for the visual direction.

## Stack

- Next.js 16 (App Router, Server Actions)
- React 19, TypeScript, Tailwind CSS v4
- next-intl
- PostgreSQL 18 with Drizzle ORM
- Three.js, GSAP and Lenis for motion
- Playwright tests

## Getting started

```bash
cp .env.example .env          # fill in DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD…
docker compose up -d          # PostgreSQL on port 5433
pnpm install
pnpm db:push && pnpm db:seed  # schema + roles, owner account, starter services/process/FAQ
pnpm dev                      # http://localhost:3000  ·  admin at /admin
```

| Command | Purpose |
|---|---|
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm exec playwright test` | End-to-end tests (needs a running server; `BASE_URL` overrides the default) |
| `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` | Drizzle schema tools |

Uploaded files are stored under `storage/`, which git ignores. Lead attachments are private and served only to authenticated admins.

### Developer content fixtures

The optional fixture command requires `NODE_ENV=development` and a separate loopback PostgreSQL database named `codelava_dev_fixtures`. Apply migrations and the standard seed to that database before running `NODE_ENV=development pnpm db:fixtures`. To view fixtures, run the local app against that same database with `STORAGE_LOCAL_PUBLIC_DIR=./storage/dev-fixtures/public` and open an authenticated draft preview.

Run `NODE_ENV=development pnpm db:fixtures --clean` to remove the fixtures and their files from the configured local database and storage. Cleanup also recognizes data written by the previous demo command.
