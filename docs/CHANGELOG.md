# Changelog

Alle væsentlige ændringer i dokumentation og API-kontrakt dokumenteres her.

## Unreleased

- Ingen ændringer endnu.

## [0.1.0] – Docs Freeze

- **Docs freeze:** Dokumentation låst som kontrakt-stabil før build.
- **OpenAPI:** Canonical spec i [docs/04-api/openapi.yaml](04-api/openapi.yaml). Auth, vehicle-profiles, saved-places, saved-routes, routes/compute, exports. Geocode (GET /geocode/search) i spec men ikke implementeret i MVP. ErrorResponse envelope; pagination (body totalCount canonical, X-Total-Count convenience).
- **Traceability:** [Traceability matrix](10-traceability/traceability-matrix.md) knytter REQ-ID → endpoint → DB → test. [Sanity-check](10-traceability/sanity-check.md) og [traceability-contract](10-traceability/traceability-contract.md) definerer gates.
- **CI:** OpenAPI lint (Redocly) og traceability-check kører som release gates (lokalt og i GitHub Actions).
- **Versionering:** Se [VERSION.md](VERSION.md). Process beskrevet i [CONTRIBUTING.md](CONTRIBUTING.md).

[0.1.0]: https://github.com/your-org/EzRoot/releases/tag/docs-v0.1.0
