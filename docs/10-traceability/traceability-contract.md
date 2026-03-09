# Traceability contract (hvad checken forventer)

Scriptet `scripts/traceability-check.mjs` håndhæver følgende.

## 1. Filer og placering

- **SRS:** `docs/02-requirements/srs.md` – indeholder krav med REQ-ID (mønster `REQ-XXX-NNN`).
- **Matrix:** `docs/10-traceability/traceability-matrix.md` – markdown-tabel med kolonner: REQ-ID, Beskrivelse, Endpoint(s), DB-tabel, Test.
- **OpenAPI:** `docs/04-api/openapi.yaml` – canonical API-spec med `paths`.

## 2. Regler

1. **Alle REQ-IDs fra SRS skal findes i matrix.**  
   REQ-IDs udtrækkes via regex `REQ-[A-Z]+-\d+` i SRS. Hver skal optræde i mindst én matrix-række (første kolonne).

2. **Hvert endpoint i OpenAPI skal have mindst én REQ-reference.**  
   Et endpoint er (metode, path) fra OpenAPI (fx `GET /me`, `POST /routes/compute`). Matrix-kolonnen "Endpoint(s)" indeholder tekster som `POST /auth/register`, `GET/POST /vehicle-profiles`, `GET/PATCH/DELETE /vehicle-profiles/:id`. Path normaliseres så `{id}` ↔ `:id` og `{jobId}` ↔ `:jobId` matcher. Hvis et OpenAPI-endpoint ikke dækkes af nogen matrix-række, fejler checken.

3. **Undtagelser:**  
   - Endpoints uden path-parameter (fx kun `(tiles fra Martin)`) tæller ikke som HTTP-path; REQ-MAP-001 dækker kort/tiles uden at stå som konkret path.  
   - Matrix kan bruge "Alle beskyttede endpoints" (REQ-MT-001) til at dække alle beskyttede paths; scriptet accepterer at en matrix-række med "Alle beskyttede endpoints" eller tilsvarende dækker alle paths der kræver JWT.

## 3. Format-antagelser

- SRS: REQ-IDs i markdown-tabel eller som liste (regex finder alle).
- Matrix: Markdown-tabel med separator `|`; kolonne 1 = REQ-ID, kolonne 3 = Endpoint(s). Rækker der starter med `| REQ-` tælles.
- OpenAPI: YAML med `paths:`; nøgler er paths; under hver path er metoder (get, post, patch, delete, put).

Scriptet er pragmatisk: det læser filer som tekst og bruger regex/YAML-parsing (fs + simpelt YAML-parse eller path-udtrækning via regex).
