# Data pipeline og runbook

## DK quickstart (trin-for-trin)

1. **Download PBF**
   - URL: `https://download.geofabrik.de/europe/denmark-latest.osm.pbf`
   - Gem fx som `data/denmark-latest.osm.pbf`.

2. **PostGIS (tiles til Martin)**
   - Start PostGIS-container (docker compose).
   - Installer osm2pgsql på host eller brug container med osm2pgsql.
   - Kør:
     ```bash
     osm2pgsql -d postgres://app:secret@localhost:5432/appdb \
       -O flex -S <schema-lua eller default> \
       --slim -C 8000 \
       data/denmark-latest.osm.pbf
     ```
   - For Martin: brug schema der matcher Martin (fx OpenMapTiles-kompatibelt). ANTAGELSE: Projektet leverer et `infra/osm2pgsql.lua` eller dokumenterer valgt schema.
   - RAM: DK ~8–16 GB; cache `-C 8000` (MB). Disk: 5–6× PBF-størrelse.

3. **GraphHopper**
   - Start GraphHopper-container med volume til `/data`.
   - Kopiér PBF ind i container eller mount.
   - Kør import:
     ```bash
     docker exec <graphhopper-container> graphhopper import /data/denmark-latest.osm.pbf /data
     ```
   - Efter import: genstart container med `web -d /data` (eller tilsvarende) så den server graf.
   - RAM: DK 4–8 GB ofte nok; EU 32–64 GB.

4. **Nominatim (valgfri)**
   - For geokodning: kør Nominatim-import i egen container med samme PBF; 16+ GB RAM for DK.
   - Eller brug kun koordinat-input i MVP og tilføj Nominatim senere.

5. **Martin**
   - Konfigurer Martin med `MARTIN_DATABASE_URL` til PostGIS.
   - Efter osm2pgsql er færdig, server Martin MVT fra PostGIS.
   - Test: åbn tile-URL i browser eller MapLibre style.

## EU (placeholder)

- PBF: `https://download.geofabrik.de/europe/europe-latest.osm.pbf`.
- PostGIS: anbefales 32–64 GB RAM; disk 5–6× PBF.
- GraphHopper: 32–64 GB RAM; import 10–15 timer med 8+ kerner.
- Månedlig opdatering: brug OSM diff eller fuld re-import i planlagt vindue; under opdatering kør på gamle data (blue/green).

## Opdatering

- **PostGIS:** `osm2pgsql --append` med diff (.osc) eller schedule fuld reload månedligt.
- **GraphHopper:** Genimport ved større opdateringer; eller GraphHopper updaters hvis tilgængelige.
- **Cache:** Invalider Redis geokode-cache efter større OSM-opdatering.
- **Tiles:** Martin læser live fra PostGIS; efter PostGIS-opdatering er nye tiles automatisk opdateret (evt. CDN TTL justeres).

## Fejlsøgning

- **Ingen tiles:** Tjek at PostGIS har data (tabel med geometrier); tjek Martin-logs og `MARTIN_DATABASE_URL`.
- **GraphHopper svarer ikke:** Tjek at import er færdig og at container kører `web` mod korrekt mappe; tjek RAM.
- **Nominatim langsom:** Øg cache; begræns antal forespørgsler; overvej kun koordinat-input i MVP.
