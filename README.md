# Coy Discover

A standalone, mobile-first implementation of Coy's Discover assignment.

## Stack
- React + Vite
- Node.js + Express
- SQLite via Node's built-in `node:sqlite` (no native dependency to compile)
- Framer Motion, Axios, Lucide React

## Requirements
Node.js 22.13 or newer (developed on Node 24). `node:sqlite` prints an "experimental" warning on startup; that is expected.

## Run locally

### 1. Backend
```bash
cd server
npm install
npm run dev
```
Backend: http://localhost:4000

### 2. Frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Frontend: http://localhost:5173

The SQLite database is created automatically at `server/data/coy.sqlite` and seeded with 32 profiles on first launch. A single demo user (`me`) is assumed, as permitted by the assignment.

## API
- `GET /feed` — profiles not yet swiped on
- `POST /swipe` — body: `{ "profileId": 1, "action": "like" | "pass" }`
- `GET /matches` — mutual matches only

Optional health endpoint: `GET /health`

## Privacy rules
- Incoming like status is never revealed in the feed. Profiles are displayed like any other profile.
- `/feed` does not expose the `likesYou` seed field.
- `/matches` returns only mutual matches.
- A match is created only when the current user likes a profile that has already liked the current user.
- Duplicate swipes are rejected; swipes and matches are persisted in SQLite.


## Pages
- **Home**: intentionally blank, as the assignment asks.
- **Discover**: one card at a time. Drag the card, use the Like / Pass buttons, or the left / right arrow keys.
- **Matches**: everyone you matched with.

## Reset demo data
Stop the server and delete `server/data/coy.sqlite` (and any `-shm` / `-wal` files). Restart the server to reseed. Set `DATA_DIR` to keep the database somewhere else (handy for testing).

## Notes
All people and profile details are fictional demo data. Profile photos are sourced from Unsplash and loaded through remote image URLs, so an internet connection is required to display them. If an image fails to load, the card displays a fallback placeholder.
