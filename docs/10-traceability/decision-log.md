# Decision log

Væsentlige beslutninger med rationale. Konfliktregel: ADR > API-kontrakter > research-report.

| Beslutning | Kilde | Rationale |
|------------|--------|-----------|
| Routing: GraphHopper | ADR (Routing-motor) | Bedre til lange ruter og flere profiler (truck, small_truck); fornuftig RAM; VRP mulig i V1. OSRM kræver mere RAM; Valhalla langsom på lange ruter i MVP. |
| Tiles: Martin + PostGIS | ADR (Kort-tile-strategi) | Én PostGIS til app + tiles; Martin hurtig; fleksibel lagdeling. Alternativ: OpenMapTiles MBTiles til hurtig MVP. |
| Multi-tenant: RLS | ADR (Multi-tenant) | Få lejere (B2B); én DB simplere at administrere; RLS med app.current_org_id. |
| Auth: egen JWT | ADR (Auth) | Mindre overhead end Keycloak/Auth0 i MVP; org_id og role i claims til RLS og RBAC. |
| ErrorResponse envelope | API-kontrakter | Ens fejlformat på tværs af alle endpoints; error_code, message, details[]. |
| Pagination: X-Total-Count + totalCount | API-kontrakter | Header til klient-optimering; body totalCount for konsistens med items. |
| Truck-restriktioner: best-effort | ADR (Truck-restriktioner) | OSM-dækning uensartet; tydelig disclaimer og advarsler; "Ignorer advarsler" til bruger. |
| Disclaimer (vejledende rute) | API-kontrakter, data-sources-licensing | Juridisk og compliance; vises i UI og eksport. |
| Log retention 90 dage | NFR, logging-audit-gdpr | GDPR og dataminimalitet; anonymiser eller slet PII i logs efter 90 dage. |

ADR-dokumenter refereres eksternt (Routing-motor ADR, API-kontrakter PDF); dette repo indeholder konsolideret beskrivelse i docs.
