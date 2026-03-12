# ShipArtifact

Build in Chat. Ship to the world.

Launch your Claude artifacts as live websites in seconds. Paste your code, pick a name, get a URL.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Auth | Clerk |
| Database | PostgreSQL via Drizzle ORM |
| File storage | Cloudflare R2 |
| Site serving | Cloudflare Worker (wildcard subdomain) |
| Styling | Tailwind CSS 4 |
| Hosting | Vercel |

**How it works:** Users paste JSX or HTML artifact code. ShipArtifact wraps it in a standalone HTML page (injecting React UMD, Tailwind CDN, OG metadata), uploads to R2, and stores metadata in Postgres. A Cloudflare Worker serves `*.shipartifact.com` by reading from R2.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- PostgreSQL (local for dev)
- A [Clerk](https://clerk.com) account (for auth)
- A [Cloudflare](https://cloudflare.com) account (for R2 storage + Worker)

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd shipartifact
pnpm install
```

### 2. Set up PostgreSQL

```bash
createdb shipartifact
```

If you need to specify a user:

```bash
createdb -U your_username shipartifact
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Clerk Authentication
# Get keys from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/new
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/new

# PostgreSQL (local)
POSTGRES_URL=postgresql://localhost:5432/shipartifact

# Cloudflare R2
# Get from Cloudflare dashboard > R2 > Manage R2 API Tokens
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=shipartifact-sites

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITES_DOMAIN=shipartifact.com
```

### 4. Run database migrations

```bash
pnpm drizzle-kit migrate
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local dev notes

- The full launch flow works locally — saves to DB and uploads to R2
- You **cannot** visit subdomain URLs (e.g. `my-app.shipartifact.com`) locally — that requires the Cloudflare Worker + DNS
- The preview pane on `/new` renders artifacts in an iframe so you can test rendering without deploying
- Slug availability checks hit the real DB via `/api/sites/{slug}`

## Project Structure

```
src/
  app/
    api/
      deploy/route.ts       # POST — create/update site, upload to R2
      sites/route.ts         # GET — list user's sites
      sites/[slug]/route.ts  # GET/DELETE — single site
      preview/route.ts       # POST — preview without saving
      og/route.tsx           # GET — OG share image (edge runtime)
    dashboard/page.tsx       # User's site list
    new/page.tsx             # Create/redeploy page (editor + preview)
    site/[slug]/page.tsx     # Site detail + deployment history
    sign-in/, sign-up/       # Clerk auth pages
    page.tsx                 # Landing page
    layout.tsx               # Root layout + metadata
  components/
    editor/                  # Code editor, preview pane, deploy form, share preview
    dashboard/               # Site cards, empty state
    landing/                 # CTA button
    shared/                  # Navbar, logo
  lib/
    db/schema.ts             # Drizzle schema (sites + deployments)
    db/queries.ts            # Database query functions
    db/index.ts              # Drizzle client setup
    artifact/detect.ts       # Detect JSX vs HTML, extract titles
    artifact/wrap.ts         # Wrap artifacts in standalone HTML
    artifact/validate.ts     # Input validation
    cloudflare/r2.ts         # R2 upload/delete
    constants.ts             # App constants, reserved slugs, limits
  middleware.ts              # Clerk auth middleware
worker/
  src/index.ts               # Cloudflare Worker — serves *.shipartifact.com from R2
  wrangler.toml              # Worker config + routes
drizzle/
  0000_*.sql                 # Initial migration
```

## Cloudflare Worker Setup

The Worker serves deployed sites from R2 via wildcard subdomains.

### 1. Create the R2 bucket

```bash
npx wrangler r2 bucket create shipartifact-sites
```

### 2. Deploy the Worker

```bash
cd worker
pnpm install
npx wrangler deploy
```

### 3. Configure DNS

In your Cloudflare DNS dashboard for `shipartifact.com`:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `@` | `cname.vercel-dns.com` | DNS only |
| AAAA | `*` | `100::` | Proxied |

The wildcard record routes all subdomains through Cloudflare, where the Worker intercepts them. The Worker routes are in `worker/wrangler.toml`:

```toml
routes = [
  { pattern = "*.shipartifact.com/*", zone_name = "shipartifact.com" }
]
```

## Production Deployment (Vercel)

### 1. Connect to Vercel

```bash
npx vercel link
```

### 2. Set up production database

**Option A: Vercel + Neon integration (recommended)**

1. Vercel Dashboard > Storage > Create Database > Neon Postgres
2. Set the **Custom Prefix** to `POSTGRES` (so env vars are named `POSTGRES_URL`, matching the code)
3. Pick a region close to your users (e.g. Cleveland for US-distributed users)
4. Hit Connect

Vercel automatically adds `POSTGRES_URL` to your project's environment variables.

**Option B: Any hosted PostgreSQL**

Set `POSTGRES_URL` manually in Vercel > Settings > Environment Variables.

### 3. Run migrations against production

```bash
POSTGRES_URL="<your production connection string>" pnpm drizzle-kit migrate
```

You can get the connection string from:
- Vercel Dashboard > Storage > your database > Show secret
- Or: `npx vercel env pull .env.production.local` then check the file

### 4. Set remaining environment variables

In Vercel Dashboard > Settings > Environment Variables:

| Variable | Production Value |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk **production** publishable key |
| `CLERK_SECRET_KEY` | Your Clerk **production** secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/new` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/new` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Your R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Your R2 API token secret |
| `R2_BUCKET_NAME` | `shipartifact-sites` |
| `NEXT_PUBLIC_APP_URL` | `https://shipartifact.com` |
| `NEXT_PUBLIC_SITES_DOMAIN` | `shipartifact.com` |

### 5. Deploy

```bash
git push  # Vercel auto-deploys from your connected branch
```

Or manually:

```bash
npx vercel --prod
```

## Database Schema

**sites** — One row per artifact

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | TEXT | Clerk user ID |
| slug | TEXT | Unique subdomain name |
| title | TEXT | Site title |
| description | TEXT | Optional description |
| sourceCode | TEXT | Original JSX/HTML code |
| artifactType | TEXT | `jsx` or `html` |
| currentVersion | INT | Increments on relaunch |
| isPublished | BOOL | Whether site is live |

**deployments** — Version history

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| siteId | UUID | FK to sites (cascade delete) |
| version | INT | Version number |
| sourceCode | TEXT | Code at time of deploy |
| wrappedHtml | TEXT | Final HTML served to users |
| status | TEXT | `deploying`, `deployed`, `failed` |

To modify the schema, edit `src/lib/db/schema.ts` then:

```bash
pnpm drizzle-kit generate  # generates a new migration SQL file
pnpm drizzle-kit migrate   # applies it
```

## Limits

- **Max code size:** 500 KB
- **Free tier:** 3 sites per user
- **Slugs:** 3–63 chars, alphanumeric + hyphens, must start/end with alphanumeric
- **Reserved slugs:** api, www, app, admin, dashboard, etc. (see `src/lib/constants.ts`)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm drizzle-kit migrate` | Apply DB migrations |
| `pnpm drizzle-kit generate` | Generate migration from schema changes |
