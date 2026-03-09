# Product Scope

## Personas

- **Dispatcher/Planner:** Planlægger daglige lastbilruter; skal hurtigt generere sikre ruter med lastbilrestriktioner.
- **Chauffør:** Modtager rute (fase 2: mobil/tablet); har brug for klare instruktioner og advarsler om zoner/forbud.
- **Fleet Manager:** Opsætter køretøjsprofiler og strategier (grøn routing, omkostninger); analyserer rapporter.
- **IT-Administrator:** Implementering, multi-tenant, GDPR og licenser.

## Jobs-to-be-done

- Planlæg sikker rute fra A til B med køretøjsprofil.
- Estimer tid og afstand (evt. omkostningsramme).
- Gem og genbrug steder og ruter.
- Tilpasning til køretøj (vognmand, trailer, varevogn).
- Eksport (GPX, PDF) til backup eller andet system.

## Top Workflows (MVP)

1. Opret konto og organisation (admin opretter org + brugere + køretøjsprofiler).
2. Planlæg enkel rute: indtast origin/destination (evt. waypoints), vælg profil, beregn → vis rute på kort med afstand/tid.
3. Gem destination som "saved place".
4. Gem beregnet rute med navn; list og genindlæs.
5. Eksporter rute (GPX eller PDF).
6. Adgangskontrol: admin kan administrere; brugere ser kun egen orgs data.

## Feature Map

| Kategori | MVP | V1 | V2 |
|----------|-----|----|----|
| **Routing** | Enkelt rute, truck/varebil, undgå motorvej/toll (profil) | Multi-stop (VRP), tidsvinduer | Trafik, EV, intermodal |
| **Kort** | MapLibre, Martin/PostGIS tiles, basis lag | Offline, isochrones | 3D, tracking |
| **Køretøjer** | Profiler (mål, vægt, aksler) | Specialiserede, grøn | CO2/emissioner |
| **UI** | Dashboard, ruteformular, gemte ruter/steder, eksport | Multi-stop UI, i18n | Mobil/PWA, stemme |
| **Data** | Gemte steder, gemte ruter, GPX/PDF | CSV-import, deling | TMS/WMS API |
| **Non-func** | JWT, RLS, audit, rate limit, GDPR | SLO 99,9%, scale | Global, fuld compliance |

## Guardrails

- Ingen kopiering af PTV's UI, tekster, ikoner eller kode. PTV nævnes kun som benchmark-kategori.
- Åbne datakilder (OSM); attribution og disclaimer dokumenteret og vist i UI/eksport.
