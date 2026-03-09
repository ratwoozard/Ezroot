# Docs freeze status

**Status:** ✅ Frozen

Dokumentationen er låst som kontrakt-stabil. Ingen merge til default branch uden at gates er grønne.

## Gates (håndhæves)

| Gate | Beskrivelse | Kommando |
|------|-------------|----------|
| **OpenAPI lint** | OpenAPI spec er valid og overholder regler (inkl. operationId, response description) | `npm run docs:lint` (Redocly med `.redocly.yaml`) |
| **Traceability** | Alle REQ-IDs fra SRS findes i matrix; alle endpoints har mindst én REQ (eller dækkes af "Alle beskyttede endpoints") | `npm run docs:trace` |

Kør begge lokalt: `npm run docs:check` (eller `pnpm docs:check`).

## Valgfri (ikke blokerende)

- **Diagrams:** Mermaid i docs renderes i visse viewers; ingen CI-link-check i baseline.
- **OpenAPI bundle:** `pnpm docs:bundle` genererer bundlet YAML til reference.

**Håndhævede gates nu:** OpenAPI lint (Redocly), traceability-check (SRS ↔ matrix ↔ OpenAPI endpoints). CI kører begge på push/PR mod default branch (`.github/workflows/docs-ci.yml`).

## ANTAGELSE

- Repo root har `package.json` med scripts `docs:lint`, `docs:trace`, `docs:check`. Hvis monorepo bruger `pnpm -w` eller `npm --prefix`, tilpas kommandoen lokalt.
