# LeetLog — LeetCode Practice Tracker

Small full-stack journal for logging LeetCode practice: difficulty, topics, notes, streak, and a 12-week activity heatmap. Data lives in MongoDB. Accounts use JWT auth so each user’s journal stays private.

## Stack

- **Client:** Vite + React + TypeScript (`client/`)
- **API:** Express + TypeScript (`server/`)
- **DB:** MongoDB + Mongoose
- **Auth:** JWT (`Bearer` token) + bcrypt password hashes

## Prerequisites

- Node.js 20+
- MongoDB optional for local demo: if `127.0.0.1:27017` is down, the API **auto-falls back to in-memory MongoDB** (data resets when the server stops). For real persistence use local MongoDB or [Atlas](https://www.mongodb.com/atlas).

## Setup

```bash
# from repo root
npm run install:all
```

Copy env and point at your database:

```bash
copy server\.env.example server\.env
```

Edit `server/.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/leetlog
PORT=4000
JWT_SECRET=change-me-to-a-long-random-string
```

For Atlas, use your cluster URI instead of the local one.

## Run

```bash
npm run dev
```

- UI: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000](http://localhost:4000) (`/api` is proxied from Vite)

## Features

- Light / dark theme toggle (persisted)
- EN / VI language switch (persisted)
- Log / edit / delete practice entries
- Filter by difficulty, status, topic, or title search
- Dashboard + full-year (53-week) activity heatmap
- Sign up / sign in (JWT); entries and stats are per-user

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user |
| PUT | `/api/auth/password` | Yes | Change password (`currentPassword`, `newPassword`) |
| GET | `/api/entries` | Yes | List (`difficulty`, `status`, `topic`, `q`) |
| GET | `/api/entries/:id` | Yes | Get one |
| POST | `/api/entries` | Yes | Create |
| PUT | `/api/entries/:id` | Yes | Update |
| DELETE | `/api/entries/:id` | Yes | Delete |
| GET | `/api/stats` | Yes | Aggregates + streak + heatmap |
