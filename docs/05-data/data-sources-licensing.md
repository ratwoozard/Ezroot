# Datakilder og licenser

## OpenStreetMap (OSM)

- **Kilde:** Primær datakilde til kort, vejnet og routing. Hentes via Geofabrik (PBF-udsnit) eller planet.
- **Licens:** ODbL 1.0. Krav:
  - **Attribution:** På alle kort og ved eksport skal angives: "© OpenStreetMap contributors" og evt. "Data © OpenStreetMap (ODbL)".
  - **Share-alike:** Afledt datakilde (fx forbedret kortdata) skal distribueres under samme vilkår.
- Vi bruger OSM kun til kort og routing; applikationskode er egne licenser (MIT/Apache). OSM-bidrag (hvis nogen) deles under ODbL.

## Nominatim (geokodning)

- **Licens:** GPL. Vi hoster egen instans.
- **Politik:** Offentlig Nominatim må ikke overbelastes. Strategi:
  - Selv-hostet Nominatim med egen OSM-database.
  - Cache alle svar (Redis); TTL fx 24 timer.
  - Custom User-Agent; hold forespørgsler under 1 req/s mod offentlig API hvis den bruges som fallback.
  - Throttling ved bulk-søgning.

## GraphHopper

- **Licens:** Apache 2.0. Bruger OSM-data til routing; samme ODbL-attribution gælder for det afledte rutenet.

## Martin / vektor-tiles

- Martin læser fra PostGIS (OSM importeret med osm2pgsql). Tile-output er afledt af OSM; attribution på kortet er påkrævet.

## Disclaimer (copy – skal vises i UI og eksport)

Følgende tekst skal indgå i produktet (kortvisning, PDF-eksport, evt. login/footer):

> **Ruteberegneren er kun vejledende.** Kun officielle trafikskilte er juridisk bindende. Vi kan ikke garantere, at alle lokale restriktioner er dækket. Chauffør skal stadig overholde skilte og gældende regler.

Og på kortet:

> Kortdata © OpenStreetMap contributors (ODbL)

Ved eksport (GPX/PDF) inkluderes OSM-attribution og disclaimer hvor det giver mening (fx i PDF-fod).
