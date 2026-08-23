# Kanada Group LMS

A Udemy-style learning management system for Kanada Group's VLSI training
program — students self-register, browse and enroll in courses for free,
and stream lesson videos; teachers build courses and upload video content;
admins moderate the platform. Built as a pnpm/Turborepo monorepo and
deployed entirely on **Cloudflare's free tier** (Workers + D1 + R2).

## Stack

- **Next.js 15** (App Router, Server Actions) — the whole app lives in `apps/web`
- **Cloudflare D1** (SQLite) via **Drizzle ORM** — `packages/db`
- **Cloudflare R2** for video storage — `packages/storage` (binding-based
  streaming with HTTP Range support for seeking; presigned browser uploads
  via `aws4fetch`)
- **Auth.js (NextAuth v5)**, credentials + JWT sessions — `packages/auth`
- **Tailwind CSS** + a small hand-rolled component kit — `packages/ui`
- **Framer Motion** — staggered course-card grids, animated sidebar nav,
  page/lesson transitions, modal and button micro-interactions
- **`@opennextjs/cloudflare`** to deploy the Next.js app as a Cloudflare Worker

Three roles: `STUDENT`, `TEACHER`, `ADMIN`.

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` will pick up the pinned version)
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- The [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) —
  installed as a dev dependency, so `pnpm exec wrangler login` works without
  a global install

## 1. Install dependencies

```bash
pnpm install
```

## 2. Create your Cloudflare resources

```bash
pnpm exec wrangler login

# D1 database (free tier: 5GB storage, 5M row reads/day)
pnpm --filter web exec -- wrangler d1 create kanada-lms-db
# Copy the printed database_id into apps/web/wrangler.toml under [[d1_databases]]

# R2 bucket for videos (free tier: 10GB storage, zero egress fees)
pnpm --filter web exec -- wrangler r2 bucket create kanada-lms-videos
```

You'll also need an **R2 API token** (separate from the binding above) so the
app can presign browser upload URLs: Cloudflare dashboard → R2 → **Manage API
Tokens** → create a token with read/write access to the bucket. Note the
Access Key ID, Secret Access Key, and your Account ID.

## 3. Configure environment variables

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars
```

Fill in `apps/web/.dev.vars`:

| Variable | Where to get it |
|---|---|
| `AUTH_SECRET` | Any long random string — `openssl rand -base64 32` |
| `R2_ACCOUNT_ID` | Cloudflare dashboard sidebar |
| `R2_UPLOAD_ACCESS_KEY_ID` / `R2_UPLOAD_SECRET_ACCESS_KEY` | The R2 API token from step 2 |
| `RESEND_API_KEY` | Optional — leave blank to skip email sending |

For production, set the same secrets with `wrangler secret put <NAME>`
instead of committing them anywhere.

## 4. Run database migrations and seed demo data

```bash
pnpm db:generate        # generates SQL migrations from packages/db/src/schema.ts
pnpm db:migrate:local   # applies them to the local D1 simulation
pnpm db:seed:local      # creates demo admin/teacher/student + a sample course
```

The seed script prints the demo login (same password for all three):

```
admin@kanadagroup.dev   (ADMIN)
teacher@kanadagroup.dev (TEACHER)
student@kanadagroup.dev (STUDENT)
password: Password123!
```

## 5. Run it locally

```bash
pnpm dev
```

`next.config.mjs` calls `initOpenNextCloudflareForDev()`, so `next dev` gets
working D1 and R2 bindings from `apps/web/wrangler.toml` automatically — no
Docker, no live traffic to your Cloudflare account required for day-to-day
development.

Try the golden path: sign in as the teacher, create a course, add a
section/lesson, upload a short test video, publish it; sign in as the
student, enroll, play the video (try seeking — that exercises the R2 Range
request path), mark it complete; sign in as the admin and confirm the
dashboard reflects it.

## 6. Deploy to Cloudflare (free)

```bash
pnpm db:migrate:remote   # apply migrations to the real D1 database
pnpm db:seed:remote      # optional — seed the same demo data remotely
pnpm --filter web deploy # opennextjs-cloudflare build && wrangler deploy
```

Free-tier limits to be aware of at scale: Workers (100k requests/day), D1
(5GB storage, 5M row reads/day), R2 (10GB storage, no egress fees ever).
All generous enough for a training program's course catalog; upgrade only
the specific service that's actually constrained if you outgrow it.

### Automatic deploys on push

`.github/workflows/deploy.yml` deploys straight to Cloudflare Workers on
every push to `main`, via `wrangler deploy` — **use this instead of
Cloudflare's own "Workers Builds" Git integration**, which doesn't handle
this repo's pnpm-monorepo layout well (it runs from the repo root and can't
find `apps/web/wrangler.toml` without extra Root Directory / Build & Deploy
command configuration in the dashboard that the CI workflow avoids needing
entirely). To enable it:

1. Create a Cloudflare API token: dashboard → your profile icon → **API
   Tokens** → **Create Token** → use the **"Edit Cloudflare Workers"**
   template, scoped to this account.
2. Add it as a GitHub Actions secret: repo → **Settings → Secrets and
   variables → Actions → New repository secret** → name it
   `CLOUDFLARE_API_TOKEN`.
3. If Cloudflare's dashboard still has a "Workers Builds" Git connection
   configured for this repo (Settings → Build), disable automatic
   deployments there so you don't get a second, failing build on every push
   — it's redundant with this workflow.

Migrations and secrets aren't part of this workflow — run
`pnpm db:migrate:remote` and `wrangler secret put <NAME>` (from `apps/web`)
by hand when the schema changes or a secret needs rotating; deploys don't
touch either.

## Monorepo layout

```
apps/web            Next.js app — every role's UI, server actions, API routes
packages/db          Drizzle schema (D1/SQLite), migrations, seed generator
packages/auth        Auth.js config (credentials + JWT), role helpers
packages/storage     R2 range-streaming + presigned upload URL helpers
packages/ui          Shared Tailwind config + component primitives
packages/config      Shared tsconfig/eslint base
```

## Scope notes

Out of scope by design (see the plan for the full rationale): payment
gateway integration (all enrollment is free for now — the schema has
`isFree`/`price` fields ready for it later), 1:1 resume review, industry
referrals/networking, and live guest lectures — those are Kanada Group's
own services, not LMS features.
