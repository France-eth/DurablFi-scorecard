# DurablFi Scorecard

DurablFi is an editorial DeFi risk and yield research publication. It contains a public scorecard library, published articles, and a private **DurablFi Publisher** for controlled content workflows backed by Supabase.

## What is included

- Public editorial website with preserved scorecard routes
- Free Scorecard Library with filtering and sorting
- Scorecard detail pages for the approved records
- Public Articles index and published article detail pages
- Methodology and Privacy pages
- Email capture, cookie consent, optional Google Analytics, SEO metadata, sitemap, robots, and `llms.txt`
- Supabase Auth-backed Publisher login
- Scorecard workflow: Draft → Preview → Publish
- Article workflow: Draft → Preview → Publish
- Immutable version history and publish validation
- Protected Publisher Admin view with RLS-backed access controls
- Supabase migrations, repair migrations, and security tests

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Wouter
- Supabase Auth + Postgres + Row Level Security
- Vitest
- pnpm

## Quick start

Requirements: Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

The development server starts the full-stack app through the project server. For a frontend-only iteration, use the existing Vite configuration through the project scripts or your preferred AI coding tool.

## Environment configuration

No secret values are committed. Configure the variables in your local environment or deployment provider. The complete variable reference is in [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

Minimum public-site variables:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Publisher authentication and server execution additionally require the server-side variables documented in `docs/ENVIRONMENT.md`. Never expose management tokens, service-role keys, founder passwords, or database credentials to the browser.

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL files in `supabase/migrations/` in filename order.
3. Enable the Auth settings described in [`supabase/README.md`](supabase/README.md).
4. Create the founder Auth user with email confirmation enabled.
5. Insert the founder Auth UUID into `public.admin_users` using the SQL Editor.
6. Configure the public Supabase URL and publishable key in the deployment environment.

RLS is the security boundary. Public clients should only read published projections. Internal versions, research notes, sources, checklists, review flags, activity, and allowlist data remain protected.

## Commands

```bash
pnpm check       # TypeScript validation
pnpm test        # Vitest suite
pnpm run build   # Production client and server build
pnpm run start   # Run the production server after building
pnpm format      # Format source files
```

The credential and authenticated-boundary tests are live integration checks. They require the secure variables listed in `docs/ENVIRONMENT.md` plus `SUPABASE_RUN_LIVE_TESTS=1`; without that explicit opt-in, the checks are skipped so GitHub CI remains deterministic and secret-free. They validate a configured Supabase project and do not create accounts or alter production data.

## Project map

```text
client/src/pages/       Public pages and Publisher/Admin views
client/src/components/  Site layout, SEO, consent, forms, and UI primitives
client/src/data/        Approved static scorecard presentation data
client/src/lib/         Supabase and Publisher data helpers
server/                 Full-stack server, auth boundary tests, and validation tests
supabase/migrations/    Publisher schema, seed, repair, and RLS SQL
shared/                 Shared types and constants
docs/                   Environment and AI-redesign handoff notes
```

## Design constraints for future redesigns

Preserve these product rules when using another AI coding tool:

- Keep the visual language editorial, research-first, and human-led.
- Do not introduce AI-generated copy, AI scoring, fake metrics, or fabricated protocol facts.
- Keep purple/indigo as an accent only; maintain a neutral dark base.
- Do not add payments, subscriptions, wallet connection, blockchain scanning, or automated publishing.
- Preserve the public scorecard URLs and the three approved scorecard records.
- Keep the public site limited to published content.
- Keep RLS enforcement at the database layer; frontend checks are not authorization.
- Keep motion subtle, purposeful, short, and disabled for reduced-motion users.

See [`docs/AI-REDESIGN-CONTEXT.md`](docs/AI-REDESIGN-CONTEXT.md) for a concise handoff brief.

## Repository safety

Do not commit:

- `.env` files or secret values
- Supabase management tokens
- Supabase service-role keys
- Auth passwords
- Database URLs containing credentials
- `node_modules/`, `dist/`, runtime logs, or sandbox metadata

The included `.gitignore` excludes the normal local and build artifacts. Review `git diff --cached` before pushing to GitHub.

## License

MIT. See [`LICENSE`](LICENSE).
