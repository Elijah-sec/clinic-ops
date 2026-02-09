Clinic Ops — Developer README
=============================

Quick start
-----------

1. Copy environment variables:

   cp .env.example .env

2. Set values in `.env` (do NOT commit secrets).

3. Install dependencies:

   npm install

4. Run migrations (requires `psql` on PATH and `DATABASE_URL` in env):

```bash
export DATABASE_URL="postgres://user:pass@host:5432/db"
npm run db:migrate
```

5. Run dev server:

```bash
npm run dev
```

Environment variables
---------------------

- `SUPABASE_URL` — Supabase project URL (server)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL for browser SDK
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key for browser SDK
- `DATABASE_URL` — Postgres connection string (for migrations)

Notes on migrations
-------------------

Migrations are plain SQL files under `db/migrations/` and are applied in lexical order by `scripts/run_migrations.sh` using `psql`.

Security
--------

- Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Use the anon keys only in the browser.

Where to look next
------------------

- `lib/supabase.ts` — Supabase client initializers
- `lib/auth.ts` — server auth helpers and staff-role checks
- `src/app/api/patients/route.ts` — Patients API
- `src/app/api/appointments/route.ts` — Appointments API
- `src/app/clinics/[clinicId]/dashboard` — Today dashboard
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
