# SafeGuard — Parental Controls Dashboard

A web app where parents manage child profiles, block inappropriate websites by domain and category, and monitor activity logs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, wouter routing, TanStack Query

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — DB tables: profiles, blocked-sites, activity-logs
- `artifacts/api-server/src/routes/` — Express routes: profiles, blocked-sites, activity, dashboard
- `artifacts/parental-controls/src/` — React frontend (pages: Dashboard, Profiles, ProfileDetail, Activity)

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → typed hooks on frontend + Zod validators on backend
- Activity logs are append-only (no edit/delete); they accumulate over time
- Blocked sites are per-profile with category tagging; toggle on/off without deleting
- Dashboard stats aggregate from DB at request time (no caching layer yet)
- Activity endpoint uses query params for filtering (not path params) to avoid Orval type name collision

## Product

- **Dashboard**: Live stats (active profiles, total blocked rules, blocks in last 24h, top blocked category), recent activity feed, quick profile access
- **Profiles**: Create/edit/delete child profiles with color-coded avatars, toggle active status
- **Profile Detail**: Manage blocked sites per profile — add by domain + category, toggle rules on/off, filter by category, delete rules
- **Activity Log**: Full chronological feed of block events across all profiles, filterable by child

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always re-run `pnpm --filter @workspace/api-spec run codegen` before writing routes or frontend code
- Avoid mixing path params + query params on the same operationId — Orval generates colliding type names (use query params only for filtering)
- Body schema names must be entity-shaped (e.g. `ProfileInput`), never `<OperationId>Body` — causes TS2308

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
