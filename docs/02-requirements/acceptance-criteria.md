# Acceptance Criteria (samlet)

Krav fra SRS med konkrete acceptkriterier til UAT og test.

## Auth

- **REQ-AUTH-001:** (1) Bruger kan registrere med e-mail og password (min. 8 tegn). (2) Login med gyldige credentials returnerer 200 og JWT med org_id og role. (3) Login med ugyldige credentials returnerer 401 og ErrorResponse.
- **REQ-AUTH-002:** (1) Admin kan oprette organisation ved registrering. (2) Admin kan tildele roller (admin, planner, driver). (3) Bruger uden rolle til et resource får 403.
- **REQ-AUTH-003:** (1) Logout invaliderer token på klient. (2) Fejlede loginforsøg logges i audit_log (evt. efter N forsøg).

## Køretøjsprofiler

- **REQ-VP-001:** (1) POST /vehicle-profiles med gyldig body opretter profil og returnerer 201. (2) GET /vehicle-profiles returnerer kun profiler for brugerens org (RLS). (3) PATCH/DELETE på egen profil virker; på anden org 404. (4) Validering: name, length, width, height, weight, axles påkrævet; evt. max-værdier.

## Geokodning

- **REQ-GEO-001:** (1) Søgning med fritekst returnerer liste af forslag med address, lat, lon. (2) Ingen resultat returnerer tom array, ikke fejl.

## Rute

- **REQ-ROUTE-001:** (1) POST /routes/compute med gyldig origin, destination og vehicleId returnerer 200 med geometry (LineString), distance_km, duration_min og evt. warnings[]. (2) Ugyldig vehicleId returnerer 400 ErrorResponse. (3) Ingen rute fundet (fx pga. restriktioner) returnerer 404 eller 200 med tom geometry og beskrivende warning.
- **REQ-MAP-001:** (1) Dashboard viser kort med tiles fra Martin. (2) Efter beregning vises ruten som linje på kortet. (3) Evt. lag (lavemissionszoner) kan slås til fra UI.

## Gemte data

- **REQ-PLACE-001:** (1) POST /saved-places gemmer sted; GET /saved-places med page/limit returnerer pagineret liste; X-Total-Count sendes. (2) Søg med ?search= filtrerer på navn/adresse. (3) DELETE /saved-places/{id} sletter kun eget orgs sted.
- **REQ-ROUTE-002:** (1) POST /saved-routes gemmer rute med navn og parametre. (2) GET /saved-routes pagineret med X-Total-Count. (3) GET /saved-routes/{id} returnerer fuld rute inkl. geometry.

## Eksport

- **REQ-EXPORT-001:** (1) POST /exports med routeId og format (GPX|PDF) returnerer 202 og job_id. (2) GET /exports/{jobId} returnerer status (pending|completed|failed) og ved completed file_url. (3) PDF kan være placeholder (simpel rutebeskrivelse).

## Multi-tenant og audit

- **REQ-MT-001:** (1) Bruger fra org A kan ikke se eller ændre data fra org B (integrationstest med to orgs). (2) Alle lister og get-by-id respekterer RLS (X-Total-Count og items kun for egen org).
- **REQ-AUDIT-001:** (1) Oprettelse af rute, gem rute, sletning og login-fejl logges med action og user_id/org_id. (2) Kun admin/QA har adgang til audit-log (eller via support).
