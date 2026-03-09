# API – implementerede endpoints og kontrakter

Dette dokument matcher den kode, der findes i `apps/api` og `packages/openapi/openapi.yaml`. Canonical spec: `packages/openapi/openapi.yaml`.

## Auth-flow

1. **POST /auth/register** – Opret organisation og admin-bruger (ingen auth). Body: `email`, `password` (min. 8 tegn), `name`, `orgName`. Response 201: User (user_id, org_id, email, name, role).
2. **POST /auth/login** – Body: `email`, `password`. Response 200: `access_token`, `user`.
3. Efterfølgende kald: **Authorization: Bearer &lt;access_token&gt;**.
4. **GET /me** – Returnerer aktuel bruger (fra JWT). Response 200: User.

## Implementerede endpoints

| Metode | Path | Beskrivelse | Auth |
|--------|------|-------------|------|
| POST | /auth/register | Opret org + admin | Nej |
| POST | /auth/login | Login, returner JWT + user | Nej |
| GET | /me | Aktuel bruger | JWT |
| GET | /health | Health (database up/down) | Nej |
| GET | /vehicle-profiles | List profiler (page, limit) | JWT |
| POST | /vehicle-profiles | Opret profil | JWT |
| GET | /vehicle-profiles/:id | Hent profil | JWT |
| PATCH | /vehicle-profiles/:id | Opdater profil | JWT |
| DELETE | /vehicle-profiles/:id | Slet profil | JWT |
| GET | /saved-places | List steder (page, limit, search) | JWT |
| POST | /saved-places | Gem sted | JWT |
| DELETE | /saved-places/:id | Slet sted | JWT |
| POST | /routes/compute | Beregn rute (gemmes ikke) | JWT |
| GET | /saved-routes | List ruter (page, limit, search) | JWT |
| POST | /saved-routes | Gem rute | JWT |
| GET | /saved-routes/:id | Hent rute | JWT |
| DELETE | /saved-routes/:id | Slet rute | JWT |
| POST | /exports | Opret eksport-job (GPX eller PDF) | JWT |
| GET | /exports/:jobId | Hent job status og file_url | JWT |

**Ikke implementeret i MVP:** GET /geocode/search (adressesøgning). I OpenAPI spec findes path men er markeret som fremtidig scope; brug koordinat-input (fx "lat,lon") til routes/compute.

## ErrorResponse-format

Alle 4xx/5xx returnerer samme envelope:

```json
{
  "error_code": "string",
  "message": "string",
  "details": ["string"]
}
```

Eksempler på error_code: INVALID_INPUT, UNAUTHORIZED, NOT_FOUND, SERVICE_UNAVAILABLE.

## Pagination (implementeret)

- Lister: GET /vehicle-profiles, GET /saved-places, GET /saved-routes understøtter `?page=1&limit=20` (default limit 20, max 100). Valgfri `?search=` på saved-places og saved-routes.
- Response body: `{ "items": [...], "totalCount": number }`. **totalCount** er canonical.
- Response header: **X-Total-Count** sættes til samme værdi som totalCount (convenience).

## Route compute (POST /routes/compute)

- **Request:** `origin` (string, fx "55.68,12.57"), `destination` (string), valgfri `waypoints` (string[]), valgfri `vehicleId` (UUID).
- **Response 200:** `geometry` ([lon,lat][]), `distance_km`, `duration_min`, `warnings` (string[]).
- **Adfærd:** Hvis GRAPHHOPPER_URL er sat og svarer: kald til GraphHopper; ellers **dev fallback**: geometry = input-punkter, distance_km/duration_min = 0, warnings indeholder besked om fallback og at ruten er vejledende. Ved ugyldige koordinater: 400 ErrorResponse.

## Export-flow (implementeret)

- **POST /exports** – Body: `routeId` (UUID), `format` ("GPX" | "PDF"). Response 202: ExportJob (job_id, status, file_url, message).
- **GET /exports/:jobId** – Returnerer job (status: pending | completed | failed, file_url ved completed, message ved fejl/placeholder).
- **GPX:** Genereres som XML og returneres som data-URL (base64) i file_url; klient kan downloade direkte.
- **PDF:** MVP returnerer status completed med placeholder file_url og message om at PDF er placeholder; ingen faktisk PDF-generering.

## Verificeret lokalt

Følgende kan køres i repoet uden ekstra ændringer:

- `pnpm install`
- `node scripts/run-migrations.js` (med DATABASE_URL)
- `pnpm -C apps/api run seed:run`
- `pnpm -C apps/api test`
- `pnpm -C apps/api start:dev`
- `pnpm -C packages/openapi run codegen` + `pnpm -C apps/web build` + `pnpm -C apps/web dev`

curl-eksempler: se root README (register → login → me) og runbook.md.
