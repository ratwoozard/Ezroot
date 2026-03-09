# EzRoot – Route Guide B2B

Monorepo for B2B ruteplanlægning: multi-tenant backend (NestJS), web (Next.js + MUI + MapLibre), GraphHopper routing, Martin + PostGIS tiles.

## Krav

- Node.js >= 18
- pnpm 9+
- Docker og Docker Compose (for infra)
- Make (for db-migrate, seed, test, import-dk)

## Hurtig start

```bash
pnpm install
cp .env.example .env
# Rediger .env med DATABASE_URL, JWT_SECRET osv.

cd infra && cp .env.example .env && cd ..
docker compose -f infra/docker-compose.yml up -d

make db-migrate
make seed

pnpm -C apps/api start:dev
pnpm -C apps/web dev
```

**Note:** `make db-migrate` virker efter migrations er på plads (infra/migrations). `make seed` kræver kørende Postgres og kørt db-migrate.

- API: http://localhost:3001
- Web: http://localhost:3000

### Seed-login

Efter `make seed` kan du logge ind i webappen med:

- **Org A:** admin@org-a.dk / seed-pass-123
- **Org B:** admin@org-b.dk / seed-pass-123

## Struktur

- **apps/api** – NestJS backend (auth, RLS, routes, exports, audit)
- **apps/web** – Next.js frontend (MUI, MapLibre)
- **packages/shared** – delte typer og utils
- **packages/openapi** – OpenAPI-spec (openapi.yaml)
- **infra** – Docker Compose (Postgres, Redis, GraphHopper, Martin)
- **scripts** – PBF download, GraphHopper import, osm2pgsql import
- **docs** – produkt- og arkitekturdokumentation

## Kommandoreference

| Kommando | Beskrivelse |
|----------|-------------|
| `pnpm install` | Installer alle dependencies |
| `docker compose -f infra/docker-compose.yml up -d` | Start infra (Postgres, Redis, GraphHopper, Martin) |
| `make db-migrate` | Kør database-migrationer |
| `make seed` | Seed dev-data |
| `make test` | Kør tests |
| `make import-dk` | Download DK PBF + import GraphHopper + osm2pgsql (eller light fallback) |
| `pnpm -C apps/api start:dev` | Start API i dev |
| `pnpm -C apps/web dev` | Start web i dev |
| `pnpm -C packages/openapi run codegen` | Generér TS-typer fra OpenAPI (før web build) |

**Tests:** `make test` (eller `pnpm -C apps/api test`) kører integration/e2e-tests mod API. Kræver DATABASE_URL og JWT_SECRET (fx fra `.env` eller `apps/api/.env`). Tests inkluderer auth (register/login/me), tenant-scoped endpoints og **RLS-isolation** (org B kan ikke læse org A's data).

Web bruger `apps/web/.env.local` (se `apps/web/.env.example`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAP_STYLE_URL` (valgfri; fallback style bruges hvis tom).

## API

OpenAPI-spec: `packages/openapi/openapi.yaml`. Auth: JWT med `org` og `role`. Fejl: ErrorResponse envelope. Pagination: `page`, `limit`, `X-Total-Count`. Detaljer og implementerede endpoints: `docs/api.md` og `docs/runbook.md`.

## Verificeret lokalt (build/test matrix)

- `pnpm install`
- `docker compose -f infra/docker-compose.yml up -d`
- `node scripts/run-migrations.js` (kræver DATABASE_URL)
- `pnpm -C apps/api run seed:run` (kræver Postgres + migrations)
- `pnpm -C apps/api test` (kræver DATABASE_URL + JWT_SECRET)
- `pnpm -C packages/openapi run codegen`
- `pnpm -C apps/api build`
- `pnpm -C apps/web build`
- `pnpm -C apps/api start:dev` → API http://localhost:3001
- `pnpm -C apps/web dev` → Web http://localhost:3000  

## Licens

MIT.
