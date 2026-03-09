# Runbook – lokalt kørsel og fejlsøgning

Dette dokument beskriver præcise kommandoer og fejlretning for den implementerede kode.

## Forudsætninger

- Node.js >= 18
- pnpm 9+
- Docker og Docker Compose (til Postgres m.m.)
- Make (til db-migrate, seed, test) – på Windows: Git Bash eller WSL til make og bash-scripts

## Lokale startkommandoer

```bash
# 1. Installer dependencies
pnpm install

# 2. Miljø
cp .env.example .env
# Sæt i .env: DATABASE_URL, JWT_SECRET (min. 16 tegn)
# Valgfrit: GRAPHHOPPER_URL (ellers dev fallback for ruteberegning)

# Infra (kun Postgres + Redis er påkrævet til MVP)
docker compose -f infra/docker-compose.yml up -d

# 3. Database
node scripts/run-migrations.js
# eller: make db-migrate

# 4. Seed (valgfrit)
pnpm -C apps/api run seed:run
# eller: make seed

# 5. Start API
pnpm -C apps/api start:dev

# 6. I anden terminal: Start web (kræver codegen kørt én gang)
pnpm -C packages/openapi run codegen
pnpm -C apps/web dev
```

- **API:** http://localhost:3001  
- **Web:** http://localhost:3000  

Seed-login: admin@org-a.dk / seed-pass-123 (eller admin@org-b.dk).

## Migrationer

- Filer: `infra/migrations/*.sql` (001_tables, 002_rls, 003_login_by_email).
- Kør: `node scripts/run-migrations.js` (kræver `DATABASE_URL` i miljø; sæt fx i shell eller via samme .env som API bruger).
- Track: Tabel `_migrations`; hver fil køres kun én gang.

## Seed

- Script: `apps/api/src/seed/run.ts`.
- Kør: `pnpm -C apps/api run seed:run` (kræver `DATABASE_URL`).
- Opretter: 2 organisationer (Org A, Org B), 2 brugere, vehicle profiles, saved places, saved routes.
- Adgangskode for begge: **seed-pass-123**. Kør seed igen er idempotent for orgs/users (ON CONFLICT); kan give ekstra rækker i vehicle_profiles/saved_places/saved_routes.

## Test

- Kør: `pnpm -C apps/api test` eller `make test`.
- Kræver: `DATABASE_URL` og `JWT_SECRET` (fx fra repo `.env` eller `apps/api/.env`).
- Tests: Auth (register → login → me), tenant-scoped GET /vehicle-profiles, **RLS-isolation** (org B kan ikke læse org A’s vehicle_profiles; GET med A’s id som B giver 404).
- RLS bevises via HTTP e2e (supertest mod app); der køres ikke direkte DB-queries med forskellige session-variabler i samme testsuite.

## Web + API start

- API først: `pnpm -C apps/api start:dev`.
- Web: `pnpm -C apps/web dev`. Web forventer `NEXT_PUBLIC_API_URL` (fx i `apps/web/.env.local`); default er http://localhost:3001.
- Codegen: Kør `pnpm -C packages/openapi run codegen` før første web build eller efter ændringer i `packages/openapi/openapi.yaml`.

## Fejlretning

### Database

- **"DATABASE_URL is not set"** – Sæt `DATABASE_URL` i `.env` eller miljø (fx `postgres://app:secret@localhost:5432/appdb`).
- **Connection refused** – Tjek at Postgres kører: `docker compose -f infra/docker-compose.yml ps`. Start med `docker compose -f infra/docker-compose.yml up -d`.
- **Relation does not exist** – Kør migrationer: `node scripts/run-migrations.js`.

### JWT

- **JWT_SECRET must be set** – Sæt i `.env` eller `apps/api/.env`; mindst 16 tegn.
- **401 på /me eller andre beskyttede endpoints** – Tjek at frontend sender `Authorization: Bearer <token>`; token fra POST /auth/login.

### GraphHopper / ruteberegning

- **Dev fallback:** Hvis `GRAPHHOPPER_URL` ikke er sat eller GraphHopper ikke svarer, returnerer POST /routes/compute stadig 200 med `geometry` (koordinater fra input), `distance_km: 0`, `duration_min: 0` og `warnings` med besked om fallback.
- For rigtig routing: Sæt `GRAPHHOPPER_URL` (fx http://localhost:8989) og kør GraphHopper med importeret PBF (se data-pipeline.md).

### Map style (web)

- Hvis `NEXT_PUBLIC_MAP_STYLE_URL` er tom eller style fejler, bruger webappen automatisk en fallback style (Carto dark). Kortet rendrer stadig.

## Verificeret lokalt

Disse kommandoer forventes at virke med repoet som det er (efter pnpm install og med DATABASE_URL + JWT_SECRET hvor angivet):

- `pnpm install`
- `docker compose -f infra/docker-compose.yml up -d`
- `node scripts/run-migrations.js` (DATABASE_URL)
- `pnpm -C apps/api run seed:run` (DATABASE_URL)
- `pnpm -C apps/api test` (DATABASE_URL + JWT_SECRET)
- `pnpm -C packages/openapi run codegen`
- `pnpm -C apps/api build`
- `pnpm -C apps/web build`
- `pnpm -C apps/api start:dev` og `pnpm -C apps/web dev`

## MVP acceptance checklist

- [ ] `pnpm install` kører uden fejl
- [ ] `docker compose -f infra/docker-compose.yml up -d` starter Postgres (og Redis)
- [ ] `node scripts/run-migrations.js` anvender alle migrationer (DATABASE_URL sat)
- [ ] `pnpm -C apps/api run seed:run` opretter seed-data; login admin@org-a.dk / seed-pass-123 virker
- [ ] `pnpm -C apps/api test` grøn (auth, tenant endpoint, RLS isolation)
- [ ] `pnpm -C packages/openapi run codegen` genererer `packages/openapi/generated/schema.d.ts`
- [ ] `pnpm -C apps/api build` og `pnpm -C apps/web build` bygger uden fejl
- [ ] API start: `pnpm -C apps/api start:dev` → GET http://localhost:3001/health returnerer 200
- [ ] Web start: `pnpm -C apps/web dev` → http://localhost:3000 viser login; efter login dashboard med kort
- [ ] Login med seed-bruger → dashboard; planlæg rute (lat,lon) → beregn → rute vises på kort; gem rute; eksport GPX
- [ ] Disclaimer "Ruten er vejledende" og OSM-attribution synlig under kort

## Light/dev mode vs. rigtig infra

| Komponent        | Light/Dev (MVP)                    | Fuld infra                          |
|-----------------|-------------------------------------|-------------------------------------|
| Postgres        | Påkrævet (docker compose)           | Samme                               |
| Redis           | Kører med compose; ikke påkrævet i kode endnu | Brug til cache m.m.                 |
| GraphHopper     | Valgfri; API bruger fallback        | GRAPHHOPPER_URL + import af PBF      |
| Martin / tiles  | Valgfri; web bruger fallback style | Martin + PostGIS + osm2pgsql       |
| Geocode         | Ikke implementeret; brug "lat,lon" | Fremtidig (Nominatim m.m.)          |

## Remaining known issues (MVP)

- **Migration/seed miljø:** `node scripts/run-migrations.js` og `pnpm -C apps/api run seed:run` læser ikke automatisk `.env`; DATABASE_URL skal være sat i miljø (fx `set DATABASE_URL=...` på Windows eller export på Unix).
- **Make på Windows:** `make db-migrate`, `make seed`, `make test` kræver Make og bash (Git Bash eller WSL); alternativt brug de tilsvarende pnpm/node-kommandoer direkte.
- **Geocode:** GET /geocode/search er i OpenAPI men ikke implementeret; brug koordinat-input til ruteberegning.
- **PDF-eksport:** Returnerer placeholder (completed med besked); kun GPX er reelt genereret.
