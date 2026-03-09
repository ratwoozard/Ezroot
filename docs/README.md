# Route Guide – Dokumentation

Implementeringsklar dokumentation for B2B "map + route guide" web-app. Sporbarhed: krav → API → DB → test.

## MVP-dokumentation (konsistent med kode)

Disse dokumenter er holdt i sync med den implementerede kode:

| Dokument | Indhold |
|----------|--------|
| [Runbook](./runbook.md) | Lokale startkommandoer, migrationer, seed, test, fejlsøgning, light vs. fuld infra |
| [Data pipeline](./data-pipeline.md) | Routing i dev, GraphHopper/fallback, tiles, import-scripts, implementeret vs. planlagt |
| [Security](./security.md) | JWT, RLS, audit log, bcrypt, begrænsninger, hvad RLS-tests beviser |
| [Licensing & attribution](./licensing-attribution.md) | OSM-attribution, vejledende-rute disclaimer, hvor det vises i UI |
| [API](./api.md) | Implementerede endpoints, auth-flow, ErrorResponse, pagination, route compute, export-flow |

### Kendte begrænsninger i MVP

- **Geocode:** GET /geocode/search er ikke implementeret; brug koordinat-input (fx "55.68,12.57") til ruteberegning.
- **RBAC:** Ingen forskel på roller i adgang; alle autentificerede brugere i en org har samme rettigheder.
- **Rate limiting:** Ikke implementeret.
- **Audit_log:** Skrives ved mutationer; ingen læse-endpoint i MVP.
- **PDF-eksport:** Placeholder (status completed med besked); kun GPX er reelt genereret.

### Verificeret lokalt (build/test matrix)

Efter `pnpm install` og med DATABASE_URL (+ JWT_SECRET til test):

- `docker compose -f infra/docker-compose.yml up -d`
- `node scripts/run-migrations.js` (eller `make db-migrate`)
- `pnpm -C apps/api run seed:run` (eller `make seed`)
- `pnpm -C apps/api test` (eller `make test`)
- `pnpm -C packages/openapi run codegen`
- `pnpm -C apps/api build` og `pnpm -C apps/web build`
- `pnpm -C apps/api start:dev` og `pnpm -C apps/web dev`

## Navigation (øvrige docs)

| Sektion | Indhold |
|--------|--------|
| [00 Executive Summary](./00-executive-summary.md) | Source-of-truth, binding decisions, konfliktregel |
| [01 Product Scope](./01-product-scope.md) | Personas, workflows, MVP/V1/V2 |
| [02 Requirements](./02-requirements/) | SRS, NFR, acceptance criteria, antagelser |
| [03 Architecture](./03-architecture/) | Overblik, data flow, RLS, routing, tiles |
| [04 API](./04-api/) | API-overblik, OpenAPI-spec, eksempler |
| [05 Data](./05-data/) | Kilder, licenser, pipeline-runbook, datakvalitet |
| [06 Security](./06-security/) | Threat model, auth/RBAC, logging, GDPR |
| [07 UX](./07-ux/) | UX-spec, wireframes, states, disclaimer |
| [08 Testing](./08-testing/) | Teststrategi, test cases, RLS isolation |
| [09 Delivery](./09-delivery/) | Milestones, risikoregister |
| [10 Traceability](./10-traceability/) | Traceability matrix, decision log |
| [11 Glossary](./11-glossary.md) | Ordliste |

## Konventioner

- **Requirement IDs:** REQ-ROUTE-001, REQ-AUTH-002 osv. (brugt konsekvent).
- **RLS:** Alle multi-tenant tabeller er "RLS protected"; policy baseret på `app.current_org_id`.
- **ANTAGELSE:** Ubekræftet eller valgt løsning markeret så i teksten.
- **PTV:** Omtales kun som "benchmark-kategori"; ingen kopiering af UI/tekster/kode.
