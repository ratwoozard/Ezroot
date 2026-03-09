# Docs & API version

**Nuværende version:** 0.1.0

Dokumentation og OpenAPI følger semver. Kun docs/ og kontrakt (OpenAPI) versioneres her; app-kode kan have egen version.

## Semver for specs

- **MAJOR:** API-breaking (fjernet/omdøbt endpoint, ændret request/response schema på eksisterende, breaking ændring i pagination/error envelope). DB-breaking (fjernet kolonne, ændret RLS-model). UX-copy der ændrer juridiske/attribution-krav.
- **MINOR:** Nye endpoints, nye felter (bagudkompatible), nye REQ-IDs og krav, nye docs-sektioner. Ikke-breaking.
- **PATCH:** Rettelser i tekst, eksempler, beskrivelser, diagrammer. Ingen kontraktændring.

## Hvor versionen står

- `docs/VERSION.md` (denne fil)
- `docs/04-api/openapi.yaml` → `info.version` (skal matche ved release)
- `docs/CHANGELOG.md` → release-noter

Ved release: opdater VERSION.md og openapi.yaml info.version til samme værdi; tag i CHANGELOG.
