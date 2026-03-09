# Data flow

## Ingestion → processing → serving

### 1. Kort- og rutedata (OSM)

- **Kilde:** Geofabrik PBF (fx `denmark-latest.osm.pbf`, `europe-latest.osm.pbf`).
- **Kort (tiles):** PBF → osm2pgsql → PostGIS (schema til vektor-tiles). Martin læser fra PostGIS og server MVT til MapLibre.
- **Routing:** Samme PBF → GraphHopper import (truck-profil) → graf på disk; GraphHopper server svarer på route-requests.
- **Geokodning:** Nominatim importerer OSM til egen DB; API kalder Nominatim (eller proxy) med cache (Redis).

Flow:

```
Geofabrik PBF
    ├── osm2pgsql → PostGIS → Martin → MVT → Web (MapLibre)
    ├── GraphHopper import → GraphHopper server → API → Web (rute-linje)
    └── Nominatim import → Nominatim API ← API (geokodning, med Redis cache)
```

### 2. Applikationsdata

- **Brugerhandlinger:** Web → API (JWT) → Postgres. Ved hver request sættes `app.current_org_id` fra JWT; RLS sikrer at kun egen orgs data læses/skrives.
- **Ruteberegning:** API sender koordinater og profil til GraphHopper; modtager geometry + distance/duration; API kan gemme rute i saved_routes (med geom) og returnere til klient.
- **Eksport:** API opretter job i export_jobs; asynkron generering af GPX/PDF; klient poller GET /exports/{jobId} indtil status completed og henter file_url.

### 3. Caching

- **Geokodning:** Redis: key = normaliseret adresse/query, value = { lat, lon, address }; TTL fx 24t.
- **Ruter:** Valgfri: Redis med hash af (origin, destination, vehicleId) som nøgle for at undgå gentagne GraphHopper-kald.
- **Tiles:** Martin/PostGIS; evt. CDN for tile-endpoints (Cache-Control headers).

Opdatering af OSM-data: månedlig genimport eller diff (jf. data-pipeline-runbook.md); under opdatering kan systemet køre på gamle data (blue/green).
