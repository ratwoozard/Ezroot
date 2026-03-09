# API-overblik

**OpenAPI:** `docs/04-api/openapi.yaml` – valideres med `npx @redocly/cli lint docs/04-api/openapi.yaml`. Server-URL er localhost til lokal dev (bevidst).

## Principper

- **REST:** Ressourcer med klare navne; GET for læsning, POST for oprettelse, PATCH for opdatering, DELETE for sletning.
- **Auth:** Alle beskyttede endpoints kræver `Authorization: Bearer <JWT>`. JWT indeholder claims: `sub` (user_id), `org` (org_id), `role`.
- **Fejl:** Alle 4xx og 5xx returnerer samme envelope: `{ "error_code": string, "message": string, "details": string[] }`. Se OpenAPI og examples.md.
- **Pagination:** Endpoints der lister ressourcer (GET /vehicle-profiles, GET /saved-places, GET /saved-routes) understøtter `?page=1&limit=20` og evt. `?search=`. Response indeholder:
  - **Body `totalCount`** er **canonical (source of truth)** – ved uenighed mellem header og body gælder body.
- **Header `X-Total-Count`** er **convenience** (fx lazy loading); skal matche body.totalCount. Håndhæves i kontrakt og eksempler (examples.md).
  - Body: `{ "items": [...], "totalCount": <number> }`
- **Content-Type:** Request: `application/json` hvor body bruges. Response: `application/json`.

## Auth-flow

1. POST /auth/register – opret organisation + admin-bruger (ingen auth).
2. POST /auth/login – send email + password; modtag `access_token` og `user`.
3. Efterfølgende kald: `Authorization: Bearer <access_token>`.
4. GET /me – returnerer aktuel bruger (validerer token).

## Endpoints (MVP)

| Metode | Path | Beskrivelse | Auth |
|--------|------|-------------|------|
| POST | /auth/register | Opret org + admin | Nej |
| POST | /auth/login | Login, returner JWT | Nej |
| GET | /me | Aktuel bruger | JWT |
| GET | /geocode/search | Adressesøgning – **ikke implementeret i MVP**; brug koordinat til routes/compute | JWT |
| GET | /vehicle-profiles | List profiler (paginated) | JWT |
| POST | /vehicle-profiles | Opret profil | JWT |
| GET | /vehicle-profiles/:id | Hent profil | JWT |
| PATCH | /vehicle-profiles/:id | Opdater profil | JWT |
| DELETE | /vehicle-profiles/:id | Slet profil | JWT |
| GET | /saved-places | List steder (paginated + search) | JWT |
| POST | /saved-places | Gem sted | JWT |
| DELETE | /saved-places/:id | Slet sted | JWT |
| POST | /routes/compute | Beregn rute (gemmes ikke) | JWT |
| GET | /saved-routes | List ruter (paginated + search) | JWT |
| POST | /saved-routes | Gem rute | JWT |
| GET | /saved-routes/:id | Hent rute | JWT |
| DELETE | /saved-routes/:id | Slet rute | JWT |
| POST | /exports | Opret eksport-job (GPX/PDF) | JWT |
| GET | /exports/:jobId | Hent job status og fileUrl | JWT |

Alle beskyttede endpoints returnerer 401 ved manglende eller ugyldig token; 403 ved manglende rettighed. Alle fejl bruger ErrorResponse.

## Rate limiting

- Plan: fx 100 requests/minut per token (eller per IP for auth). Dokumenteret i security; konkrete tal kan justeres ved go-live.
