# Milestones og sprints

## Overblik (MVP)

| Sprint | Fokus | Leverancer |
|--------|--------|------------|
| 1 | Setup, auth, DB | Repo, Docker, PostGIS, migrations + RLS, auth (register/login), GET /me |
| 2 | Køretøjsprofiler, kort | Vehicle-profiles CRUD, MapLibre + Martin tiles, geokodning (proxy/cache) |
| 3 | Routing, rute-UI | GraphHopper integration, POST /routes/compute, rute på kort, gem rute/list |
| 4 | Gemte steder, eksport | Saved places CRUD, saved routes get/list/delete, export job (GPX/PDF) |
| 5 | Polish, test, docs | RLS integrationstest, fejlhåndtering, UX states, runbook og compliance-docs |
| 6 | Release | UAT, sikkerhedstjek, release til demo/miljø |

Estimat: 2 uger per sprint; 6–8 sprints til fuld MVP inkl. test og dokumentation. Kritisk vej: GraphHopper-import og tile-pipeline (tidlig opsætning).
