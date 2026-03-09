# Data pipeline – implementeret vs. planlagt

Dette dokument beskriver, hvordan routing og tiles fungerer i den nuværende kode, og hvad import-scripts gør.

## Routing i dev nu

- **POST /routes/compute** accepterer `origin` og `destination` som streng (adresse eller **"lat,lon"**).
- **Implementeret:** Koordinat-input (fx "55.68,12.57"). Parser understøtter både "lat,lon" og "lon,lat".
- **GraphHopper:** Hvis `GRAPHHOPPER_URL` er sat og tjenesten svarer, kalder API GraphHopper `/route` med `point=lat,lon` og returnerer geometry, distance_km, duration_min. Ved timeout eller fejl falder API tilbage til dev fallback.
- **Dev fallback:** Returnerer 200 med:
  - `geometry`: koordinater fra origin, waypoints og destination (ingen egentlig ruteberegning)
  - `distance_km`: 0, `duration_min`: 0
  - `warnings`: besked om at GraphHopper ikke er tilgængelig / ikke konfigureret, og at ruten er vejledende.

Ingen geokodning (adresse → koordinater) er implementeret i MVP; brugeren angiver koordinater direkte eller bruger fremtidig geocode-endpoint.

## GraphHopper-integration

- **Konfiguration:** Miljøvariabel `GRAPHHOPPER_URL` (fx http://localhost:8989). Uden denne bruges kun fallback.
- **Kode:** `apps/api/src/routes/graphhopper.service.ts` – kalder GraphHopper HTTP API, mapper response til `RouteResult` (geometry, distance_km, duration_min, warnings).
- **Fuld brug:** Start GraphHopper-container (profile "full" i docker-compose), kør PBF-import (se scripts nedenfor), sæt `GRAPHHOPPER_URL`.

## Tiles (Martin + PostGIS)

- **Planlagt:** Martin læser vektor-tiles fra PostGIS; OSM-data importeres med osm2pgsql. Webappen peger style på Martin.
- **Implementeret i kode:** Webappen læser `NEXT_PUBLIC_MAP_STYLE_URL`. Hvis den er tom eller style fejler, bruges en fallback map style (Carto dark), så kortet altid kan vise rute-geometry.
- Martin og osm2pgsql er **ikke** påkrævet for at få kort og ruter til at fungere i dev; kun for “rigtige” OSM-basemaps fra egen infra.

## Import-scripts (hvad de gør nu)

- **scripts/download-pbf.sh** – Henter `denmark-latest.osm.pbf` fra Geofabrik til `data/`. Bruges før GraphHopper/osm2pgsql-import.
- **scripts/import-graphhopper.sh** – Forudsætter PBF og en kørende GraphHopper-container. Kopierer PBF ind i container og kører `graphhopper import`. Hvis PBF eller container mangler, afsluttes scriptet med TODO-besked (light mode).
- **scripts/import-osm2pgsql.sh** – Forudsætter PBF og `osm2pgsql` på host. Importerer PBF til PostGIS (DATABASE_URL). Hvis `osm2pgsql` ikke findes, afsluttes med TODO-besked.

`make import-dk` kører alle tre scripts i rækkefølge; i et minimalt setup uden GraphHopper/osm2pgsql installeret vil de to sidste blot logge og afslutte.

## Implementeret vs. planlagt (kort)

| Område           | Implementeret i MVP                         | Planlagt / fremtid                    |
|------------------|---------------------------------------------|----------------------------------------|
| Ruteberegning    | Koordinat-input; GraphHopper hvis URL sat; ellers fallback | Geokodning (adresse → koordinater)   |
| Tiles            | Web fallback style; valgfri Martin URL       | Martin + PostGIS + osm2pgsql          |
| Geocode          | Ikke implementeret                          | Nominatim eller tilsvarende            |
| PBF/import       | Scripts findes; light mode hvis deps mangler| Fuld DK/EU-import                      |
