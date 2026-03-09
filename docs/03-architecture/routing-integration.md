# Routing-integration (GraphHopper)

## Valg

- **Motor:** GraphHopper (ADR). OSRM og Valhalla bruges ikke i MVP.
- **Årsag:** Gode truck/small_truck profiler, fleksible parametre, fornuftig performance for lange ruter; mulighed for VRP i V1.

## Integration

- API kalder GraphHopper over HTTP (fx `http://graphhopper:8989`).
- Typisk endpoint: `/route` med query-parametre: `point=lat,lon&point=lat,lon` (start/slut og evt. mellempunkter), `vehicle=truck` (eller `small_truck`), og evt. `weight`, `height`, `width` ud fra vehicle_profiles-tabel.
- Response: JSON med `paths[0].points` (encoded polyline eller koordinater), `paths[0].distance`, `paths[0].time`.

## Parametre fra vehicle_profiles

- GraphHopper understøtter truck-parametre som weight (kg), height (m), width (m). Disse sendes med request så GraphHopper undgår veje der ikke matcher.
- hazardous_material: GraphHopper kan have hazmat-understøttelse via custom profil eller tags; ellers dokumenteres som ANTAGELSE (evt. undgå visse veje via profil).
- API-kontrakten: POST /routes/compute modtager vehicleId; API henter profil fra DB og mapper til GraphHopper-parametre.

## Fejlhåndtering

- **Ingen rute fundet:** GraphHopper returnerer fx 404 eller tom path. API returnerer 404 med ErrorResponse eller 200 med tom geometry og warnings: ["Ingen lovlig rute fundet efter restriktioner. Prøv at fjerne restriktioner eller vælg anden profil."].
- **GraphHopper nede:** Timeout eller 5xx → API returnerer 503 med ErrorResponse (fx error_code SERVICE_UNAVAILABLE, message "Ruteberegning midlertidigt utilgængelig").
- **Ugyldig vehicleId:** 400 ErrorResponse (vehicle profile not found).
- **Ugyldige koordinater:** 400 ErrorResponse (invalid origin/destination).

## Mapping API ↔ GraphHopper

- **Origin/destination:** API modtager adresse eller "lat,lon". Ved adresse: geokod først (Nominatim + cache); send koordinater til GraphHopper.
- **Waypoints:** Liste af adresser eller koordinater; GraphHopper understøtter flere `point=` parametre.
- **Output:** GraphHopper path → API mapper til RouteResult: geometry (LineString som [lon,lat][]), distance_km, duration_min, warnings (fx fra GraphHopper besked eller egne "usikre restriktioner"-advarsler).

## Performance

- GraphHopper bruger ~32–64 GB RAM ved EU-import; DK mindre. Lokalt dev kan køre med reduceret udsnit.
- Caching af ruteforespørgsler (Redis med hash af input) reducerer load ved gentagne identiske kald.
