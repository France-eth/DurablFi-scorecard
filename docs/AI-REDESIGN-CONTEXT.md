# DurablFi redesign handoff

Use this file as the context brief when importing the repository into another AI coding tool.

## Product

DurablFi is an independent, human-led DeFi risk and yield research publication. It explains what could go wrong behind yield opportunities in plain English. This is an editorial product, not an AI product, trading tool, or financial-advice service.

## Existing public routes

- `/` — homepage
- `/scorecards` — free public scorecard library
- `/scorecards/:slug` — scorecard detail page
- `/archive` — legacy-compatible library route; preserve it
- `/articles` — published articles
- `/articles/:slug` — published article detail
- `/methodology` — high-level methodology
- `/privacy` — privacy and analytics disclosure
- `/publisher/login` — Supabase Auth login
- `/publisher` — protected DurablFi Publisher
- `/publisher/admin` — protected Publisher Admin view

## Content rules

- Preserve the three approved scorecards exactly: Aave V3 USDC, Lido stETH, Pendle PT-eETH.
- Preserve their public slugs and bookmarked URLs.
- Do not fabricate metrics, protocol facts, sources, authors, social URLs, or testimonials.
- Public queries must expose published content only.
- Internal sources, research notes, checklists, review flags, activity, and version history are not public.
- Do not add AI-generated content, automated ratings, blockchain scanning, monitoring, payments, subscriptions, or wallet connection.

## Visual direction

- Restrained editorial and research-led.
- Neutral dark foundation with white/grey typography.
- Purple/indigo is an accent, not the whole palette.
- Generous whitespace and clear reading rhythm.
- Typography should feel considered and publication-like rather than dashboard-like.
- Avoid gradients, glows, glassmorphism, neon colors, dense pill grids, fake live indicators, oversized metric walls, and generic AI SaaS patterns.
- Motion should be purposeful only: subtle reveals, hover transitions, and mobile menu transitions under roughly 300ms; respect `prefers-reduced-motion`.
- Use Lucide icons or other vector icons; do not use emoji as interface icons.

## Architecture

- Public site layout: `client/src/components/SiteLayout.tsx`
- Header/footer: `client/src/components/SiteHeader.tsx` and `SiteFooter.tsx`
- Global visual system: `client/src/index.css`
- Routes: `client/src/App.tsx`
- Public scorecard data: `client/src/data/scorecards.ts`
- Supabase client: `client/src/lib/supabase.ts`
- Publisher helpers: `client/src/lib/publisher.ts`
- Supabase SQL: `supabase/migrations/`

## Safe redesign workflow

1. Inspect existing route behavior and data models before editing.
2. Keep content and public URLs unchanged.
3. Change visual components and CSS before changing schemas.
4. Run `pnpm check`, `pnpm test`, and `pnpm run build`.
5. Verify public pages do not expose draft/internal data.
6. Review the final diff for secrets and fabricated content.
