# System Requirements Specification (SRS)

Requirement-IDs bruges i traceability matrix. Prioritet: Høj = must-have MVP, Mellem = V1, Lav = V2.

## Funktionskrav

| ID | Beskrivelse | Prioritet | Acceptkriterier |
|----|-------------|-----------|-----------------|
| REQ-AUTH-001 | Brugeroprettelse og login med e-mail og adgangskode | Høj | Ny bruger kan oprette konto; login validerer password og returnerer JWT; fejl returnerer ErrorResponse. |
| REQ-AUTH-002 | Organisation og roller | Høj | Admin kan oprette org og tildele roller; kun rolletildelte brugere ser ressourcer. |
| REQ-AUTH-003 | Session og logout | Høj | Logout fjerner token; fejlede logins logges. |
| REQ-VP-001 | Køretøjsprofiler CRUD | Høj | CRUD for profiler (navn, længde, bredde, højde, vægt, aksler, hazardous). Validering; data gemmes korrekt (RLS protected). |
| REQ-GEO-001 | Geokodning | Høj | GET /geocode/search?q= returnerer forslag med address, lat, lon (Nominatim + cache). |
| REQ-ROUTE-001 | Ruteplanlægning | Høj | POST /routes/compute med origin, destination, evt. waypoints og vehicleId returnerer rute (geometry, distance_km, duration_min, warnings). Respekterer profil/restriktioner (best-effort). |
| REQ-MAP-001 | Kortvisning | Høj | MapLibre viser vektor-tiles (Martin); rute tegnes som linje; lag (evt. lavemissionszoner) kan slås til. |
| REQ-PLACE-001 | Gemte steder | Mellem | Gem og hent saved places via API; pagination + search; liste i UI med slet/rediger (RLS protected). |
| REQ-ROUTE-002 | Gemte ruter | Mellem | Gem beregnede ruter med navn/parametre; list og hent med pagination + search (RLS protected). |
| REQ-EXPORT-001 | Eksport | Lav | Eksport GPX og PDF (placeholder ok); job-baseret: POST /exports → GET /exports/{jobId} for status og fileUrl. |
| REQ-MT-001 | Multi-tenant isolering | Høj | Data segregaret pr. organisation; alle API-kald med org_id fra JWT; 403 ved andet org; RLS på alle relevante tabeller. |
| REQ-AUDIT-001 | Audit-log | Mellem | Kritiske handlinger (login, ruteoprettelse, sletning) logges med tid og bruger (RLS protected). |

## Ikke-funktionelle krav (refereret i nfr.md)

- REQ-NFR-001: Tilgængelighed 99,9% SLO.
- REQ-NFR-002: 90% af ruteforespørgsler < 500 ms.
- REQ-NFR-003: TLS i produktion; rate limiting.
- REQ-NFR-004: GDPR; log retention; sletning på anmodning.

Se [nfr.md](./nfr.md) for detaljer.
