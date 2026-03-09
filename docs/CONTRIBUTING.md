# Bidrag til dokumentation og API

## Principper

- **Docs først:** Ændringer i funktionalitet eller kontrakt skal starte med opdatering af docs (SRS, OpenAPI, traceability). Kode følger derefter.
- **REQ-ID kræves:** Nye funktionskrav skal have et REQ-ID (fx REQ-XXX-NNN) i [SRS](02-requirements/srs.md) og indgå i [traceability matrix](10-traceability/traceability-matrix.md).
- **Endpoint-ændring:** Nyt eller ændret endpoint kræver: opdatering af [OpenAPI](04-api/openapi.yaml), opdatering af matrix (REQ ↔ endpoint), og evt. [acceptance criteria](02-requirements/acceptance-criteria.md).

## Workflow

1. Lav ændringer i docs (branch eller direkte i default efter review).
2. Kør lokalt: `npm run docs:check` (eller `pnpm docs:check`). Ret indtil begge gates er grønne (OpenAPI lint + traceability-check).
3. Push/PR; CI kører samme gates. Merge kun når CI er grøn.

## Breaking changes

- **API-breaking:** Ændring i OpenAPI der bryder eksisterende klienter (fjernet/omdøbt path, ændret response schema, pagination/error envelope). Kræver MAJOR version bump i [VERSION.md](VERSION.md) og [openapi.yaml](04-api/openapi.yaml) `info.version`, samt post i [CHANGELOG.md](CHANGELOG.md) under ny version.
- **DB-breaking:** Ændring i tabeller/RLS der kræver migration og kan påvirke eksisterende data. Dokumenter i arkitektur/docs; versioner efter behov.
- **Proces:** Opret issue/ADR; efter godkendelse opdater VERSION, CHANGELOG, OpenAPI og matrix; derefter implementering.

## Guardrails

- Ingen kopiering af PTV's UI, tekster eller ikoner. Brug kun egne tekster og åbne data-licenser (OSM attribution som dokumenteret).
