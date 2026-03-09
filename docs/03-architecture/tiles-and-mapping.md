# Tiles og kort (Martin + PostGIS)

## Strategi (ADR)

- **Vektor-tiles:** Martin læser fra PostGIS (eller MBTiles) og server MVT (Mapbox Vector Tiles).
- **Datakilde:** OSM via Geofabrik PBF → osm2pgsql → PostGIS med schema der understøtter Martin (fx OpenMapTiles-kompatibelt schema eller Martin’s forventede tabeller).
- **Alternativ:** OpenMapTiles MBTiles til hurtig MVP-udrulning; Martin kan serve MBTiles.

## Lag og styles

- **Basiskort:** Veje, bygninger, vand, labels fra PostGIS/MBTiles.
- **Tillægslag (MVP/V1):** Lavemissionszoner (hvis data i PostGIS); rute-linje og markører leveres af app (GeoJSON fra API), ikke som tile-lag.
- **Attribution:** På kortet vises "© OpenStreetMap contributors" og evt. "Data © OpenStreetMap (ODbL)" (jf. licensing-attribution).

## MapLibre (frontend)

- Web-appen bruger MapLibre GL JS.
- Style URL peger på Martin (fx `http://martin:6767/styles/basic` eller tile-endpoint).
- Rute og markører tilføjes som GeoJSON source + layer efter respons fra POST /routes/compute og ved visning af gemte ruter.

## Caching

- Martin kan cache på disk; CDN (fx Cloudflare) for tile-URL’er med Cache-Control for at reducere load.
- OSM Tile Usage Policy tillader caching; attribution skal stadig vises.

## Hardware og opsætning

- PostGIS: for DK ~8–16 GB RAM ved import; for EU 32–64 GB. Disk: 5–6× PBF-størrelse til osm2pgsql.
- Martin er letvægts; hovedbelastning er PostGIS og I/O. Se data-pipeline-runbook for import-trin.
