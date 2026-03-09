# Ordliste

| Term | Definition |
|------|------------|
| **ADR** | Architecture Decision Record – beslutningsdokument med kontekst og konsekvens. |
| **RLS** | Row-Level Security – Postgres-funktion der begrænser rækker pr. session (her: org_id). |
| **ODbL** | Open Database License – OSM's licens; krav om attribution og share-alike. |
| **PBF** | Protocol Buffer Binary – OSM's kompakte filformat (fx fra Geofabrik). |
| **MVT** | Mapbox Vector Tiles – vektor-tile format serveret af Martin. |
| **GraphHopper** | Open-source routing-engine; bruger OSM; understøtter truck-profiler. |
| **Martin** | Vektor-tile server (Rust); læser fra PostGIS eller MBTiles. |
| **Nominatim** | Geokodnings-tjeneste baseret på OSM. |
| **JWT** | JSON Web Token – signeret token med claims (sub, org, role, exp). |
| **ErrorResponse** | Fælles fejl-envelope: error_code, message, details[]. |
| **MVP** | Minimum Viable Product – fase 1 med enkelt rute, profiler, gemte data, eksport. |
| **Best-effort (rute)** | Rute respekterer kendte OSM-restriktioner; manglende data giver advarsel, ikke garanti. |
| **PTV** | Benchmark-kategori (kommercielt ruteværktøj); ingen kopiering. |
| **RBAC** | Role-Based Access Control – adgang baseret på roller (admin, planner, driver). |
| **SLO** | Service Level Objective – mål fx 99,9% uptime, 90% routing < 500 ms. |
