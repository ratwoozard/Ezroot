# Datakvalitet og begrænsninger

## OSM-dækning

- **Restriktioner:** OSM understøtter tags som `maxheight`, `maxweight`, `hazmat`, `toll`, `low_emission_zone`. Dækningen er uensartet; mange broer har maxheight, maxweight er ofte mindre systematisk.
- **Konsekvens:** Ruteberegning er "best effort". Hvor data mangler, antager vi at vejen er tilgængelig; vi viser advarsler i UI og i `warnings[]` i API.

## Flagging af usikkerhed

- Veje uden bekræftet restriktion (fx manglende maxheight) kan markeres med **gul advarsel** i UI på rutesegmenter.
- API kan returnere `warnings: ["Mulige restriktioner på segment X ikke verificeret"]`.
- Ruter med kendte restriktioner (bro med maxheight under køretøjshøjde) udelukkes af GraphHopper; ellers vises advarsel.

## Bruger-override

- UI tilbyder "Ignorer advarsler" så brugeren kan acceptere potentielt problematiske segmenter. Chauffør skal stadig overholde skilte; vi garanterer ikke regel-overholdelse ved override.
- Disclaimer vises tydeligt (jf. licensing-attribution og UX-spec).

## Telemetri

- Log hver gang en planlagt rute indeholder advarselssegmenter, og når ruteforsøg fejler pga. restriktioner.
- Mål: "antal advarsler per måned", "antal mislykkede ruteforespørgsler" – til at forbedre datagrundlag og prioritere OSM-opdateringer.

## Opdateringsfrekvens

- Månedlige OSM-opdateringer (PBF eller diff) så nye restriktioner og veje indarbejdes over tid.
