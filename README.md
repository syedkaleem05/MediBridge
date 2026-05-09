# MediBridge

Pharmacy medicine discovery and inventory MVP: **MongoDB + Mongoose**, **Vite + React**, and **serverless `/api`** routes packaged for **Vercel**.

## Repository layout

- `frontend/my-app/` — React (Vite) workspace app; build output goes to `dist/`.
- `api/` — Vercel serverless handlers (`/api/<fileName>` → `api/<fileName>.js`).
- `lib/`, `models/` — Shared DB/auth helpers and Mongoose schemas.
- `dev/apiServer.js` — Local runner that executes the same handlers as Vercel (dev only).

Root `npm install` installs **root + workspace** dependencies; API code imports packages from the **repo root**.

## Local development

### Environment

Create `.env` in the **repository root**:

- `MONGODB_URI` — MongoDB Atlas (or local) URI
- `JWT_SECRET` — Strong secret used to sign JWTs

See [.env.example](.env.example). Optional frontend override: copy `frontend/my-app/.env.example` to `.env.development.local` **only if** you need `VITE_API_URL`.

Do **not** commit real `.env` files.

### Commands

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173` (Vite)
- API: `http://localhost:3001/api/*` (`dev/apiServer.js`, proxied from Vite as `/api`)

```bash
npm run seed    # Demo data — see script before running on shared/prod databases
npm run build   # Vite production build → frontend/my-app/dist
```

Demo logins (after seed): `owner@demo.com`, `user@demo.com`, password **`Demo@123`**.

Quick check: `GET http://localhost:3001/api/health`

---

## Deploying to Vercel (single project)

Frontend and backend should **stay together** in one Vercel project: static SPA + `/api` serverless on the **same origin** avoids CORS and keeps `axios` pointing at **`/api`**.

Import the repo, use defaults from `vercel.json` (install `npm install`, build `npm run build`, output `frontend/my-app/dist`) or mirror these in the dashboard.

### Environment variables

| Variable | Required | Purpose |
|---------|----------|---------|
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret (long, random) |
| `ALLOWED_ORIGINS` | No | Only if the UI is hosted on a **different origin** than the API; comma-separated list, or `*` for wide-open demos |

Optional: `MONGODB_MAX_POOL_SIZE`, `MONGODB_SERVER_SELECTION_MS` — see [.env.example](.env.example).

### Atlas checklist

In MongoDB Atlas: **Database Access** (user/password), **Network Access** IP allowlist (often `0.0.0.0/0` for serverless, or tightened rules if you prefer).

### Preview deployments

Define the **same secrets** under Preview — otherwise PR previews cannot reach the DB.

### Split deployments (advanced)

Only if React is built elsewhere set `ALLOWED_ORIGINS` on the API project and **`VITE_API_URL`** when building the frontend to the deployed API origin (must include `/api` path suffix as used in axios `baseURL`).

---

## Troubleshooting builds

Run locally:

```bash
npm ci
npm run build
```

