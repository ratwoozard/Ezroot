# Traceability matrix (krav → API → DB → test)

MVP: Hvert krav har REQ-ID; hver række viser endpoint(s), DB-tabel(ler) og test.

| REQ-ID | Beskrivelse | Endpoint(s) | DB-tabel (RLS) | Test |
|--------|-------------|-------------|----------------|------|
| REQ-AUTH-001 | Brugeroprettelse og login | POST /auth/register, POST /auth/login | organizations, users | Unit + integration: register, login, 401 ved forkert password |
| REQ-AUTH-002 | Organisation og roller | POST /auth/register, GET /me | organizations, users | Integration: role i JWT; admin vs planner |
| REQ-AUTH-003 | Session og logout | (klient invaliderer token) | audit_log (login failure) | E2E eller manuel: logout |
| REQ-VP-001 | Køretøjsprofiler CRUD | GET/POST /vehicle-profiles, GET/PATCH/DELETE /vehicle-profiles/:id | vehicle_profiles | Unit + integration; RLS isolation |
| REQ-GEO-001 | Geokodning | GET /geocode/search?q= (proxy til Nominatim + cache) | (cache: Redis) | Integration: søg returnerer items med lat/lon |
| REQ-ROUTE-001 | Ruteplanlægning | POST /routes/compute | (validering: vehicle_profiles) | Integration: 200 med geometry; 400/404/503 |
| REQ-MAP-001 | Kortvisning | (tiles fra Martin) | (PostGIS til Martin) | E2E: kort vises; rute tegnes |
| REQ-PLACE-001 | Gemte steder | GET/POST /saved-places, DELETE /saved-places/:id | saved_places | Integration + RLS isolation |
| REQ-ROUTE-002 | Gemte ruter | GET/POST /saved-routes, GET/DELETE /saved-routes/:id | saved_routes | Integration + RLS isolation |
| REQ-EXPORT-001 | Eksport | POST /exports, GET /exports/:jobId | export_jobs | Integration: job flow og file_url |
| REQ-MT-001 | Multi-tenant | Alle beskyttede endpoints | Alle tabeller med org_id + RLS | Integration: RLS isolation test (to orgs) |
| REQ-AUDIT-001 | Audit-log | (backend ved create/delete/login) | audit_log | Integration: tjek at events logges |
| REQ-NFR-001 | 99,9% uptime | – | – | Drift + monitoring |
| REQ-NFR-002 | 90% routing < 500 ms | POST /routes/compute | – | Perf test |
| REQ-NFR-003 | TLS, rate limit | – | – | Config + security review |
| REQ-NFR-004 | GDPR, retention | – | audit_log, logs | Doc + process |

RLS protected tabeller: users, vehicle_profiles, saved_places, saved_routes, export_jobs, audit_log. organizations bruges ved oprettelse og til lookup; adgang begrænses til egen org.
