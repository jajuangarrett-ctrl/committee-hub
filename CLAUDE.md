# CLAUDE.md

Project guidance for Claude and other AI coding assistants working on Committee Hub.

## Source of Truth

- GitHub is the source of truth for this project.
- Canonical repo: `https://github.com/jajuangarrett-ctrl/committee-hub`
- Do not treat local exported folders as canonical, including `FJG Vault/Artifacts/Committee Hub`.
- Commit and push meaningful code/documentation changes to `master`.
- Netlify deploys automatically from GitHub.

## User Preferences

- The user's name is Franklin Garrett.
- Do not refer to the user as Jajuan in user-facing drafts.
- Do not delete files or reset stored data without explicit confirmation.

## Production Site

- Netlify site: `cw-committees`
- Public URL: `https://cw-committees.netlify.app`
- Netlify admin URL: `https://app.netlify.com/projects/cw-committees`
- Production branch: `master`

## App Behavior

- Visitors can view the dashboard without logging in.
- Editing requires admin mode.
- Admin password: `fjg`
- Admin session is stored in `sessionStorage`.
- Shared edits persist through Netlify Blobs, not browser-only storage.

## Implementation Notes

- Main UI: `client/src/pages/dashboard.tsx`
- Data hook: `client/src/hooks/use-local-data.ts`
- Client working state: `client/src/lib/localStore.ts`
- Shared initial/normalized data: `shared/committee-data.ts`
- Shared state API: `netlify/functions/state.ts`
- Theme tokens: `client/src/index.css`
- Netlify config: `netlify.toml`

The shared state API is mounted at `/api/state`:

- `GET /api/state` returns dashboard state publicly.
- `POST /api/state` validates `x-admin-password`.
- `PUT /api/state` saves only when `x-admin-password` is valid.

Netlify Blob storage:

- Store: `committee-hub`
- Key: `dashboard-state-v1`

## Visual Direction

The dashboard should use the orange/black direction.

Current core colors:

- Orange: `#f97316`
- Black: `#111111`
- Supporting orange: `#fb923c`, `#ea580c`
- Supporting dark neutrals: `#2b2b2b`, `#525252`

Do not reintroduce the previous teal-heavy palette unless explicitly asked.

## Commands

Install dependencies:

```bash
npm install
```

Typecheck:

```bash
npm run check
```

Build static production app:

```bash
npm run build:static
```

Run Netlify build, including functions:

```bash
npx netlify build
```

Run local Vite dev server:

```bash
npm exec vite -- --host 127.0.0.1 --port 5173
```

Watch Netlify deploy after push:

```bash
npx netlify watch
```

## Working Rules

- Keep changes scoped to the user's request.
- Prefer existing project patterns over new architecture.
- Run `npm run check` and `npm run build:static` before pushing code changes.
- Run `npx netlify build` when touching Netlify config, functions, dependency wiring, or deployment behavior.
- Do not edit generated `dist/` output.
- Do not commit `.netlify/`, `.env`, or local state files.
- Do not reset Netlify Blobs unless Franklin explicitly requests it.

## Recent Project Work

- GitHub-to-Netlify auto deploy verified.
- `.netlify` added to `.gitignore`.
- Dashboard updated to orange/black visual direction.
- Shared persistence added using Netlify Blobs.
- Admin password gate added for edits.
- Netlify production `ADMIN_PASSWORD` set to `fjg`.
- Public read, missing-password rejection, and valid-password admin checks were verified.

## Cross-Agent File

This repo also has `AGENTS.md` with similar guidance for non-Claude agents. Keep both files aligned when changing project operating instructions.
