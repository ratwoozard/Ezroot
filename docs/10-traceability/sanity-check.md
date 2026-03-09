# Traceability sanity-check (docs→build)

Sidst verificeret: ved "frys" af dokumentation før build.

## 1. Alle REQ-* fra SRS findes i matrix

| REQ-ID (SRS) | I matrix |
|--------------|----------|
| REQ-AUTH-001 | Ja |
| REQ-AUTH-002 | Ja |
| REQ-AUTH-003 | Ja |
| REQ-VP-001 | Ja |
| REQ-GEO-001 | Ja |
| REQ-ROUTE-001 | Ja |
| REQ-MAP-001 | Ja |
| REQ-PLACE-001 | Ja |
| REQ-ROUTE-002 | Ja |
| REQ-EXPORT-001 | Ja |
| REQ-MT-001 | Ja |
| REQ-AUDIT-001 | Ja |
| REQ-NFR-001 til 004 | Ja |

## 2. Hvert MVP-endpoint har mindst én REQ-reference

| Endpoint | REQ-ID(e) |
|----------|-----------|
| POST /auth/register | REQ-AUTH-001, REQ-AUTH-002 |
| POST /auth/login | REQ-AUTH-001 |
| GET /me | REQ-AUTH-002 |
| GET /geocode/search | REQ-GEO-001 |
| GET/POST /vehicle-profiles, GET/PATCH/DELETE /vehicle-profiles/:id | REQ-VP-001 |
| GET/POST /saved-places, DELETE /saved-places/:id | REQ-PLACE-001 |
| POST /routes/compute | REQ-ROUTE-001 |
| GET/POST /saved-routes, GET/DELETE /saved-routes/:id | REQ-ROUTE-002 |
| POST /exports, GET /exports/:jobId | REQ-EXPORT-001 |
| (Alle beskyttede) | REQ-MT-001 |
| (Backend ved create/delete/login) | REQ-AUDIT-001 |

Kort (tiles) og MapLibre er REQ-MAP-001 (frontend + Martin); ingen direkte API-path.

## 3. Pagination (kontrakt)

- **Source of truth:** Body `totalCount` er canonical.
- **Convenience:** Header `X-Total-Count` skal matche; ved uenighed gælder body.
- Dokumenteret i docs/04-api/api-overview.md.
