# MediBridge

Hackathon-ready pharmacy medicine discovery + inventory management MVP.

## Local development

### 1) Environment variables

Create a `.env` in the repo root:

- `MONGODB_URI`
- `JWT_SECRET`

This repo already includes a starter `.env` file — just replace `MONGODB_URI` with your MongoDB Atlas URI.

Frontend variables live in `frontend/my-app/.env` (already included for local dev).

### 2) Install

```bash
npm install
npm --workspace frontend/my-app install
```

### 3) Run (web + API)

```bash
npm run dev
```

- Web (Vite): `http://localhost:5173`
- API (local Vercel-style runner): `http://localhost:3000/api/*`

### 4) Seed demo data

```bash
npm run seed
```

### Demo logins

- **Owner**: `owner@demo.com` / `Demo@123`
- **User**: `user@demo.com` / `Demo@123`

### Quick API check

- `GET /api/health`

