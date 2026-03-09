# Teststrategi

## Unit

- **Backend:** Services isoleret med mocked dependencies (DB, GraphHopper, Redis). Test validering (DTO), fejlkoder, mapping af GraphHopper-svar til RouteResult.
- **Frontend:** Komponenter med React Testing Library; mocked API.
- **Dækning:** Mål >80% for kritisk forretningslogik.

## Integration

- **API + DB:** Fuld request gennem API med test-DB (Postgres med RLS). Test at alle endpoints returnerer forventet format og at RLS gælder.
- **RLS isolation (obligatorisk):** Opret to organisationer med hver sin bruger. Som bruger A: opret vehicle_profile og saved_route. Som bruger B: GET /vehicle-profiles og GET /saved-routes – accept: ingen af A's data; GET /saved-routes/{A's id} → 404. Dokumenteret som acceptkriterie i acceptance-criteria.md.
- **Routing:** Integrationstest mod GraphHopper (eller mock med kendt svar); test at POST /routes/compute returnerer geometry, distance_km, duration_min.

## E2E

- **Scenarier:** Login → Dashboard → indtast adresse (eller koordinater) → vælg profil → beregn → vis rute → gem rute → list gemte ruter → eksport (evt. mock job). Tool: Cypress eller Playwright.
- **Kort:** Mock tile-server eller statisk tile-URL så E2E ikke afhænger af fuld OSM-import.

## Performance

- **Routing:** Benchmark POST /routes/compute under load; mål P90 < 500 ms (best effort lokalt).
- **API:** Load test på list-endpoints med pagination; tjek at X-Total-Count og items er korrekte under concurrency.

## Testdata

- Syntetiske orgs og brugere (seed); kendte koordinater for DK-ruter. Ingen rigtige persondata i test.
