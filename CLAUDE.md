# CLAUDE.md

## Project overview

Next.js 15 dashboard for Instantly.ai email campaign analytics. Displays campaign performance metrics, lead inventory, and daily trends using data from the Instantly V2 API.

## Commands

```sh
npm run dev       # Start dev server (port 3000)
npm run build     # Production build — run this to verify before committing
npm run lint      # ESLint via next lint
```

No test framework is configured yet. When adding tests, prefer Vitest.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 (via @tailwindcss/postcss)
- Recharts for data visualization
- Instantly V2 API for data (authenticated via `INSTANTLY_API_KEY` env var)

## Code style & conventions

- Use `type` over `interface` for new types; never use `enum` — use string literal unions
- Existing types live in `src/lib/types.ts` — extend them there, don't scatter type definitions
- Use ES module syntax (`import/export`), not CommonJS
- Destructure imports when possible
- Prefer server components by default; only add `"use client"` when the component needs interactivity
- API routes go in `src/app/api/` following Next.js App Router conventions
- Reusable UI primitives go in `src/components/ui/`; feature components go in `src/components/`
- Chart components go in `src/components/charts/`

## Workflow

- Always run `npm run build` before committing to catch type errors and build failures
- Run `npm run lint` and fix issues before committing
- When making UI changes, verify they render correctly on the dev server
- Prefer small, focused PRs over large sweeping changes

## Architecture notes

- Campaign status codes: 0=draft, 1=active, 2=paused, 3=completed
- Analytics step/variant indices from the API are 0-based; convert to 1-based for display
- Date utilities live in `src/lib/dates.ts`; aggregation logic in `src/lib/aggregation.ts`
- The dashboard fetches data through Next.js API routes that proxy to Instantly's API — do not call Instantly directly from client components

## Things to avoid

- Do not use `any` type without explicit approval
- Do not install new dependencies without asking first
- Do not commit `.env` or files containing API keys
- Do not call the Instantly API directly from client-side code — always go through API routes
- Do not add `console.log` statements in committed code; use proper error handling instead

## Self-improvement

After every correction, update this CLAUDE.md so the mistake doesn't repeat. Keep this file lean — if removing a line wouldn't cause mistakes, cut it.
