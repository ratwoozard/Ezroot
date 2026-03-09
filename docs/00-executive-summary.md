# Executive Summary – Route Guide (B2B Map + Route)

**Source-of-truth (konsolideret fra ADR, API-kontrakter, research-report):**

1. **Produkt:** Webbaseret B2B "Route & Map Guide" til transportbranchen: enkelt-rute planlægning, køretøjsprofiler, gemte steder/ruter, eksport (GPX/PDF), multi-tenant, audit-log, kort med selv-hostede vektor-tiles. Ingen kopiering af PTV; PTV er kun benchmark-kategori.
2. **Routing:** GraphHopper (ADR). Ikke OSRM/Valhalla i MVP. Truck/small_truck profiler; restriktioner best-effort ud fra OSM-tags.
3. **Tiles:** Martin + PostGIS som vektor-tile strategi (ADR). OSM-data via Geofabrik PBF → osm2pgsql → PostGIS; Martin server MVT.
4. **Multi-tenant:** Én Postgres med Row-Level Security (RLS). Session setting `app.current_org_id` sættes pr. request fra JWT; alle relevante tabeller har `org_id` og RLS-policy.
5. **Auth (MVP):** Egen JWT med claims `org_id` + `role`. Ingen Keycloak/Auth0 i MVP. bcrypt til passwords.
6. **API:** ErrorResponse-envelope: `{ error_code, message, details[] }` på alle 4xx/5xx. Pagination: `page`, `limit`, evt. `search`; response med `X-Total-Count` header og body `items` + `totalCount`.
7. **DB-tabeller (RLS protected):** organizations, users, vehicle_profiles, saved_places, saved_routes, export_jobs, audit_log. Geometri på saved_routes: `geometry(LineString, 4326)`.
8. **NFR:** 99,9% uptime mål; 90% af ruteforespørgsler < 500 ms (best effort lokalt); TLS i prod; rate limiting; GDPR og log retention (logs anonymiseres efter 90 dage).
9. **Data:** OSM som kilde. ODbL-attribution på kort og eksport. Nominatim selv-hostet med cache (Redis) og throttling. Disclaimer: "Ruteberegneren er kun vejledende; kun officielle trafikskilte er juridisk bindende."
10. **Truck-restriktioner:** Best-effort fra OSM (maxheight, maxweight, hazmat, toll). UI viser advarsler og "Ignorer advarsler"; tydelig ansvarsfraskrivelse.
11. **MVP-workflows:** Login → Dashboard med kort → indtast origin/destination (+ waypoints) → beregn rute → vis linje + distance/duration → gem rute → list/reload → gem steder → eksport (GPX + PDF placeholder).
12. **Geografisk scope MVP:** Danmark eller DK + nabolande; EU som udvidelse. Geofabrik PBF til import.
13. **Out-of-scope MVP:** Real-time trafik, stemmenavigation, VRP/multi-stop optimering, reverse engineering af tredjepartsprodukter.
14. **Sporbarhed:** Krav har REQ-ID; traceability matrix knytter krav → API → DB → test.
15. **Konfliktløsning:** Ved modstrid gælder ADR > API-kontrakter > research-report.

**Åbne spørgsmål (løst ved binding decisions):**

- Ingen uafklarede konflikter. Pagination: vi bruger både `X-Total-Count` header og body `totalCount` (API-kontrakter nævner begge; dokumenteret konsekvent i api-overview og openapi.yaml).

**Antagelser (markeret i docs):**

- Geokodning: Nominatim tilstrækkelig for MVP; evt. Danmarks Adresser/Matrikel kan tilføjes senere.
- Told/priser: MVP ingen præcise takster; kun "undgå toll" via profil hvor understøttet.
- Lavemissionszoner: OSM-tags hvor tilgængelige; ellers advarsel/placeholder i UI.
