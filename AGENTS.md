# AGENTS.md

Guidance for AI agents and coding assistants working on this repository.

## Source of Truth

- Treat GitHub as the source of truth for this project.
- Canonical repository: `https://github.com/jajuangarrett-ctrl/committee-hub`
- Local artifact/export folders, including anything under `FJG Vault/Artifacts/Committee Hub`, are not canonical unless the user explicitly says otherwise.
- After meaningful code changes, commit and push to `master` so Netlify deploys from GitHub.

## Project Summary

Committee Hub is a React/Vite dashboard for staff committee interest and assignment management.

Current production site:

- Netlify site: `cw-committees`
- Public URL: `https://cw-committees.netlify.app`
- Netlify admin URL: `https://app.netlify.com/projects/cw-committees`

Primary user-facing behavior:

- Visitors can view the dashboard.
- Editing requires admin mode.
- Admin password is `fjg`.
- Shared changes are saved through a Netlify Function backed by Netlify Blobs.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Recharts
- Netlify Functions
- Netlify Blobs
- Existing server/SQLite code remains in the repo, but production currently uses the static Vite build plus Netlify Function persistence.

## Important Files

- `client/src/pages/dashboard.tsx`
  - Main dashboard UI.
  - Admin unlock/lock UI.
  - Committee/member/assignment interactions.
- `client/src/hooks/use-local-data.ts`
  - Client data hook.
  - Loads shared state from `/api/state`.
  - Sends admin-authenticated saves to `/api/state`.
- `client/src/lib/localStore.ts`
  - Client-side working copy of dashboard state.
  - Mutations happen locally first, then persist through the hook.
- `shared/committee-data.ts`
  - Shared initial dashboard data.
  - Orange/black committee colors.
  - State normalization and next-ID handling.
- `netlify/functions/state.ts`
  - Netlify Function mounted at `/api/state`.
  - `GET` returns shared dashboard state publicly.
  - `POST` validates admin password.
  - `PUT` saves state only when the `x-admin-password` header is valid.
- `client/src/index.css`
  - Global theme tokens.
  - Current palette is orange and black.
- `netlify.toml`
  - Netlify build and function configuration.

## Commands

Install dependencies:

```bash
npm install
```

Run typecheck:

```bash
npm run check
```

Build the static production app:

```bash
npm run build:static
```

Run Netlify's local production build, including functions:

```bash
npx netlify build
```

Start Vite locally:

```bash
npm exec vite -- --host 127.0.0.1 --port 5173
```

Watch Netlify deployment after pushing:

```bash
npx netlify watch
```

## Netlify Deployment

Netlify continuous deployment is already configured.

- Connected repo: `jajuangarrett-ctrl/committee-hub`
- Production branch: `master`
- Build command: `npm run build:static`
- Publish directory: `dist/public`
- Functions directory: `netlify/functions`
- Node version: `20`

Pushing to `master` triggers production deployment.

The production `ADMIN_PASSWORD` environment variable has been set in Netlify. The code also has a fallback of `fjg`, but agents should prefer the Netlify environment variable as the operational source for deployed auth.

## Shared Persistence

The dashboard previously used local/in-memory browser state. It now uses shared persistence:

- The browser loads state with `GET /api/state`.
- The admin unlock flow calls `POST /api/state` with `x-admin-password`.
- Saves use `PUT /api/state` with `x-admin-password`.
- State is stored in Netlify Blobs:
  - Store: `committee-hub`
  - Key: `dashboard-state-v1`

Important constraint:

- Do not bypass `/api/state` with direct browser-only storage for shared data. Browser state is acceptable only as a working copy or fallback, not as the canonical shared state.

## Admin Editing

Current admin password: `fjg`

Expected behavior:

- Public users can view.
- Public users cannot save edits.
- Admin users unlock with the Admin button.
- Admin session is stored in `sessionStorage`, not permanent local storage.
- Locking admin mode removes the password from `sessionStorage`.

Security note:

- This is a lightweight admin gate, not enterprise authentication.
- If stronger security is needed, replace this with Netlify Identity, OAuth, or another authenticated backend flow.

## Visual Direction

The requested visual direction is orange and black.

Use the existing theme tokens and committee color set unless the user asks for a redesign:

- Primary orange: `#f97316`
- Black: `#111111`
- Supporting orange: `#fb923c`, `#ea580c`
- Supporting neutral darks: `#2b2b2b`, `#525252`

Avoid reintroducing the prior teal-heavy palette.

## Working Rules for Agents

- Keep changes scoped to the requested behavior.
- Prefer existing project patterns over new abstractions.
- Run `npm run check` and `npm run build:static` before pushing code.
- Run `npx netlify build` when changing Netlify config, functions, dependency wiring, or deployment behavior.
- Do not delete user data or reset Netlify Blobs unless the user explicitly requests it.
- Do not edit generated build output under `dist/`.
- Do not commit `.netlify/` or local environment files.
- Never assume artifact folders are the active project source. Check GitHub/local repo context first.

## Recent Work Completed

- Connected and verified GitHub-to-Netlify auto deploy for `cw-committees`.
- Added `.netlify` to `.gitignore`.
- Updated the dashboard to the orange/black visual direction.
- Added shared persistence using Netlify Blobs via `netlify/functions/state.ts`.
- Added admin password protection for shared edits.
- Set Netlify production `ADMIN_PASSWORD` to `fjg`.
- Verified public reads return `200`, missing admin password returns `401`, and `fjg` succeeds.

## Vault/Cloud Notes

No `cloud.md` file was found in this project checkout during creation of this file.

Relevant general vault preference found in `CLAUDE.md`:

- Franklin Garrett is the user-facing name.
- Do not delete files without explicit confirmation.

Those vault rules are general context only. For this repository, GitHub remains the source of truth.
