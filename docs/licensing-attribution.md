# Licens og attribution

## OSM-attribution

- Datakilde til routing og (ved brug af Martin/PostGIS) tiles: OpenStreetMap (ODbL).
- **Krav:** Attribution "© OpenStreetMap contributors" (og evt. "Data © OpenStreetMap (ODbL)") på kort og ved eksport hvor relevant.

## Implementeret i koden

### Kort (web)

- I dashboard vises under kortet en footer med:
  - **Bemærk:** Ruten er vejledende. Kontroller altid restriktioner og vejforhold før kørsel.
  - **© OpenStreetMap contributors**
- Komponent: `apps/web/src/components/map/RouteDisclaimer.tsx`; bruges i `apps/web/src/app/(protected)/dashboard/page.tsx`.

### Eksport

- **GPX:** Genereres i API (exports.service) som XML; indeholder rutenavn og koordinater. OSM-attribution er ikke indlejret i GPX-filen i nuværende implementering; disclaimer og attribution står i UI ved download.
- **PDF:** Placeholder i MVP; ingen faktisk PDF-generering. UI viser besked om at PDF er placeholder og at GPX kan bruges til rutedata.

### Vejledende rute – disclaimer

- Teksten "Ruten er vejledende" vises i RouteDisclaimer under kortet på dashboard (alle sider med kort).
- Ruteberegning kan køre med GraphHopper-fallback; i så fald returnerer API også `warnings` med bl.a. besked om at ruten er vejledende.
