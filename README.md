# Sole Surgeon PCS

A small, mobile-first Progressive Web App for Ana's production batches, built with Next.js App Router, TypeScript, and Airtable.

## What it does

- Lists Ana's batches whose `Target Date` is **2026-10-22**.
- Shows each batch's name, total tasks, completed tasks (Airtable `Done Count` when present, otherwise task statuses), and whether `Started At` is populated.
- Opens a batch with tasks sorted by sequence, resolving item names from linked `Items` records.
- Starts a batch by saving `new Date().toISOString()` to `Started At`.
- Marks an eligible task `Done` and re-fetches the batch/task state so the next unlocked sequence step and counts appear immediately.
- Enforces business rules on the server:
  - A batch with `Started At` populated cannot be started again (`409`).
  - A task with `Task State = LOCKED` cannot be marked `Done` (`409`).
  - Both guards re-read the Airtable record before writing.
- Installable PWA with a web manifest, 192/512 icons, `display: "standalone"`, `start_url: "/"`, and a registered service worker.

## Versions used

- Node.js: `v24.14.1`
- npm: `11.11.0`
- pnpm: `11.21.0` (repository lockfile and `packageManager` field)
- Next.js: `16.4.6`

## Setup

```bash
# 1. Install dependencies (pnpm is used by this repo)
pnpm install
# npm install also works

# 2. Create the local environment file
# macOS/Linux:
cp .env.example .env.local
# Windows PowerShell:
# Copy-Item .env.example .env.local
```

Fill in `.env.local`:

```dotenv
AIRTABLE_API_KEY=pat_xxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_BATCHES_TABLE=Batches
AIRTABLE_TASKS_TABLE=Tasks
AIRTABLE_ITEMS_TABLE=Items
```

The token needs `data.records:read` and `data.records:write` for the base. The table-name variables are optional; the defaults are shown above.

Inspect the real table/field names and linked-record shapes at any time:

```bash
npm run inspect:airtable
```

## Run

```bash
npm run dev
```

Open <http://localhost:3000>. For a production check:

```bash
npm run build
npm start
```

## Test

```bash
npm test
```

The Vitest suite uses only in-memory mock repositories. It never reads or writes live Airtable data. It covers:

1. The backend guard that blocks starting an already-started batch and blocks completing a `LOCKED` task (plus the already-done guard).
2. Filtering Ana's batches for `2026-10-22` and calculating total/completed task counts.
3. Sequence sorting and linked item-name resolution.
4. Airtable field-name resolution and writes to the resolved `Started At` / `Status` fields using an injected fake client.

Other checks:

```bash
npm run lint
npm run typecheck
```

## Structure

```text
src/app/                     App Router pages, manifest, and API route handlers
src/app/api/batches/[id]/start/route.ts
src/app/api/tasks/[id]/complete/route.ts
src/components/              Server UI + client start/complete buttons
src/lib/airtable/            Airtable client, repository, adaptive field mapping
src/lib/pcs/                 Domain types, pure summaries, guarded service
scripts/inspect-airtable.mjs Schema/field inspector
public/sw.js                 Minimal service worker
```

The server-side guards live in `src/lib/pcs/service.ts` and are called by the API routes. Unit tests inject a fake repository into that same service, so the tested guard logic is the production logic.

## Assumptions and known issues

- The worker (`Ana`) and business date (`2026-10-22`) are fixed constants, as requested. The business date is used only for filtering; it is never written to `Started At`.
- Field names are resolved adaptively from the records returned by Airtable, with aliases for standard field names (`Target Date`, `Started At`, `Done Count`, `Task State`, `Tasks`, `Item`, etc.).
- `Done Count` is trusted when Airtable returns it; otherwise completed tasks are derived from task `Status` values.
- Airtable date-only fields may truncate the time portion of `Started At`; the UI displays the value Airtable actually saved.
- No login or per-user authorization is implemented, as the exercise requires no login screen.
- The service worker is intentionally minimal and network-only. Offline caching and background sync are out of scope.
- Live Airtable calls are not part of the automated test suite.

## Would improve with more time

- Add authentication/authorization and verify that Ana only mutates her own batches.
- Use Airtable's Metadata API at startup for strict schema validation and clearer setup errors.
- Add optimistic UI or SWR caching while keeping the server as the source of truth.
- Add integration tests for the route handlers with a fake Airtable HTTP layer.
- Add install/update UX, push notifications, and optional offline read caching.
- Add richer batch filtering, search, and a worker switcher.

## AI assistance

Built with assistance from **OpenCode** (AI coding agent) for implementation, tests, and documentation. The app logic remains in the repository and is covered by mocked automated tests.
