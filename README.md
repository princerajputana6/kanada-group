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

Pushes to `main` are deployed by Cloudflare's **Workers Builds** Git
integration (dashboard → Workers → `kanada-lms` → Settings → Build), which
uses Cloudflare's own build token — no API token or GitHub secret needed.
It runs from the repo root with its default commands, and the repo is set up
so those just work:

| Setting | Value |
|---|---|
| Root directory | `/` |
| Build command | `pnpm run build` — runs `opennextjs-cloudflare build` for `apps/web` (producing `apps/web/.open-next/`), then `scripts/prepare-workers-builds.mjs` |
| Deploy command | `npx wrangler deploy` — uses the root `wrangler.jsonc` written by that script |

Inside Workers Builds (`WORKERS_CI=1`) the script copies
`deploy/workers-builds.wrangler.jsonc` to the repo root; everywhere else it
does nothing. The root file is deliberately never committed: wrangler
commands run inside `apps/web` (`next dev` bindings, `db:migrate:local`, …)
would otherwise resolve it instead of `apps/web/wrangler.toml` and lose
`.dev.vars` and the local D1 state. The template mirrors
`apps/web/wrangler.toml` with repo-root-relative paths — **update both when
bindings change**.

`.github/workflows/deploy.yml` is kept as a manual fallback
(`workflow_dispatch`). To use it, add a `CLOUDFLARE_API_TOKEN` repository
secret (Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers"
template) and run it from the Actions tab.

Migrations and secrets aren't part of either deploy path — run
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
