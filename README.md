# Lasan Mart Admin Console

The internal console the Lasan Mart team uses to handle customer requests,
send work to partners, review Lasan Hub sign-ups, manage Lasan Vibes reels
and look up users.

It is a Next.js 16 app deployed on Vercel. It has no database of its own:
every screen reads from and writes to the Lasan Mart backend API.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000 and sign in with the admin password.

> The backend usually also runs on port 3000 locally. If it does, start
> the console on another port: `npm run dev -- -p 3001`.

## Settings

Set these in `.env.local` for local development, and in
**Vercel → Project → Settings → Environment Variables** for production.

| Name | Required | What it is |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | The password the team signs in with. It is also sent to the backend as its admin key. Changing it signs everyone out. If it's missing, nobody can sign in. |
| `API_URL` | Yes in production | The backend's address, e.g. `https://api.example.com`. Read when each request is made, so changing it takes effect without a rebuild. In production the console reports an error if it's missing; locally it falls back to `http://localhost:3000`. |
| `NEXT_PUBLIC_API_URL` | No | Older name for `API_URL`, still accepted. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For reel uploads | Cloudinary account that stores Vibes videos. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For reel uploads | Cloudinary upload preset used by the reel uploader. |
| `SESSION_SECRET` | No | Extra secret mixed into the sign-in session signature. Changing it signs everyone out. |
| `ADMIN_API_KEY` | No | Send a different key to the backend instead of `ADMIN_PASSWORD`. |

`NEXT_PUBLIC_` values are built into the page and visible in the browser.
Never put a secret in one.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

GitHub runs lint, the type check and a build on every push and pull
request (see `.github/workflows/ci.yml`).

## How it fits together

```
Browser ──► proxy.ts ──► pages (server-rendered) ──► lib/api.ts ──┐
   │        checks the                                              ├──► Backend API
   └──────► /api/* route handlers ──► lib/backend.ts ─────────────┘   (x-admin-key)
```

- **`proxy.ts`** runs before every request. Without a valid session it
  sends pages to `/login` and returns 401 for API calls. It also rejects
  changes coming from other websites.
- **`lib/session.ts`** creates and checks the signed session cookie. The
  password itself is never stored in the browser.
- **Pages** in `app/(console)/` load their data on the server through
  `adminFetch` in `lib/api.ts`.
- **Buttons that change things** call the small route handlers in
  `app/api/`, which forward to the backend through `forward()` in
  `lib/backend.ts`. The admin key is added on the server and never reaches
  the browser.
- **Shared pieces:** labels, colours and formatting helpers live in
  `lib/meta.ts`, data shapes in `lib/types.ts`, and reusable UI
  (`Dialog`, `StatCard`, `LoadError`, `Pagination`) in `components/`.

## Deploying

Pushing to `main` deploys to production on Vercel.

If a deploy was ever **rolled back** in Vercel, new deploys stop going live
on their own: they show as "Staged". Open the newest deployment, choose
**⋯ → Promote to Production**, and automatic deploys resume.
