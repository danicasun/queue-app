# Queue

Queue is a calm learning queue with an ambient social feed. This repo contains:
- `/ui-reference`: Base44-generated UI reference (Vite + React). Not production code.
- `/ui-reference/screenshots`: Visual source of truth for the Queue UI.
- `/app`: Next.js 14 App Router implementation.

## Prerequisites
- Node.js 18+
- pnpm
- Supabase project (URL + anon key)

## Setup
1) Install dependencies:
   `pnpm install`

2) Create `.env.local` from `.env.local.example` and fill values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (for auth redirects)
   - `SUPABASE_DB_URL` (for applying schema)

3) Apply the database schema + RLS policies:
   `SUPABASE_DB_URL=... ./scripts/apply-schema.sh`

4) Run the app:
   `pnpm dev`

## Scripts
- `pnpm dev`: Run Next.js dev server
- `pnpm build`: Build for production
- `pnpm start`: Run production server
- `pnpm lint`: Run lint

## Notes
- Supabase Auth uses magic link sign-in.
- RLS is enabled on all tables; access is enforced by policies.