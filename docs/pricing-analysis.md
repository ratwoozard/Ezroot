# Prissætningsanalyse – EzRoot abonnement

Dette dokument er en **intern analyse** af mulige abonnementspriser for EzRoot som B2B SaaS. Analysen er baseret på produktets scope (MVP), markedssammenligninger og typiske B2B-modeller. Den er ikke et bindende tilbud eller en endelig prisfastlæggelse.

---

## 1. Produktpositionering

### Hvad EzRoot tilbyder (MVP)

| Område | Indhold |
|--------|--------|
| **Routing** | Enkelt rute A→B (evt. waypoints), truck/varebil-profiler, GraphHopper, restriktioner (best-effort fra OSM) |
| **Kort** | MapLibre, vektor-tiles (Martin/PostGIS), selv-hostet – ingen ekstern kort-API-afhængighed |
| **Data** | Gemte steder, gemte ruter, køretøjsprofiler, eksport GPX/PDF |
| **Sikkerhed** | Multi-tenant (RLS), JWT, audit-log, GDPR-orienteret |
| **Brugere** | Dispatcher/planner, fleet manager, IT-admin |

### Hvad EzRoot *ikke* tilbyder i MVP

- Real-time GPS-tracking / flådesporing  
- Proof of delivery (POD)  
- VRP / multi-stop-optimering  
- Mobil-app til chauffører  
- Tredjeparts TMS/WMS-integration  

**Konsekvens:** EzRoot er et **ruteplanlægnings- og kortværktøj** til planlæggere og fleet managers, ikke en fuld flådestyrings-/tracking-løsning. Det placerer produktet i den **lavere til mellemste** del af prisskalaen sammenlignet med fulde fleet-suites.

---

## 2. Markedssammenligning

### International B2B ruteplanlægning (ca. 2024)

| Leverandør | Pris (typisk) | Model | Kommentar |
|------------|----------------|--------|-----------|
| RouteIQ | ~$12/bruger/måned | Per user | Entry-level |
| Route4Me | $40–90/bruger/måned | Per user, tier | Route Management → Business Optimization |
| OptimoRoute | ~$35–44/chauffør/måned | Per driver (årlig rabat) | Optimering inkluderet |
| Routific | ~$39–78/køretøj/måned | Per vehicle | Årlig billigere end månedlig |

### Danske/nordiske fleet- og ruteværktøjer

| Leverandør | Pris (typisk) | Model | Kommentar |
|------------|----------------|--------|-----------|
| Treiber | 199–279 DKK/chauffør/måned | Per driver | Basis (rute + app + tracking) til Pro (kapacitet, profiler) |
| OBI+ Fleet | 0–100 DKK/køretøj/måned | Per vehicle | Fleet Pro med ruteplanlægning ~100 DKK/køretøj |
| Webfleet / TrackMe | Kontakt | Enterprise | Fuld flådestyring, ofte større aftaler |

### API-baseret ruteberegning (reference)

- Tjenester som Google Routes, AWS Location, Onerbox: ofte **per request** eller kredit-baseret; relevante for “ruteberegning som service”, mindre for “abonnement per bruger”.

**Konklusion:** En **enkel ruteplanlægning uden tracking** ligger typisk i intervallet **$12–45 per bruger/måned** (ca. **85–315 DKK**) internationalt, og i DK **ca. 100–280 DKK per aktør** for mere komplette løsninger. EzRoots MVP er tættere på “planlægning + kort + gemte ruter” end på “fuld fleet + tracking”, hvilket understøtter en pris i **nedre til mellemste** del af dette interval.

---

## 3. Foreslået prismodel

### A. Per bruger / per måned (anbefalet som udgangspunkt)

Simpelt at forklare og matcher mange konkurrenters model.

| Niveau | Målgruppe | Pris/bruger/måned (ekskl. moms) | Bemærkning |
|--------|-----------|----------------------------------|-------------|
| **Starter** | Små virksomheder, 1–5 brugere | 99–149 DKK | Begrænset antal gemte ruter/steder (fx 50/50); e-mail support |
| **Professional** | Voksende virksomheder, 6–25 brugere | 149–199 DKK | Højere grænser eller ubegrænset gemte data; prioriteret support |
| **Enterprise** | Store org, 26+ brugere, SLA | Kontakt / custom | Dedikeret support, SLA, evt. on-prem eller specifik integration |

**Årlig betaling:** 10–15 % rabat (fx 2 måneder gratis) for at reducere churn og administration.

Eksempel (midtertal):  
- **149 DKK/bruger/måned** × 10 brugere = **1.490 DKK/måned** (ekskl. moms) ≈ **1.862 DKK inkl. moms**.

### B. Per organisation (flad månedspris)

Egnet hvis I vil have simple tilbud til små kunder uden at tælle brugere.

| Plan | Pris/måned (ekskl. moms) | Inkluderet |
|------|---------------------------|------------|
| **Small** | 499–799 DKK | Op til 5 brugere, basis-grænser |
| **Medium** | 1.299–1.799 DKK | Op til 15 brugere, højere grænser |
| **Large** | Kontakt | 16+ brugere, SLA, custom |

### C. Hybrid (basis + per bruger over X)

F.eks. **799 DKK/måned** inkl. 5 brugere, derefter **79–99 DKK per ekstra bruger**. Giver forudsigelig bundpris og skalerbarhed.

---

## 4. Anbefalet udgangspris (reference)

Som **enkel reference** for et abonnement (uden at binde produktet juridisk):

| Element | Forslag |
|--------|--------|
| **Model** | Per bruger, månedlig eller årlig |
| **Starter (1–5 brugere)** | **129 DKK/bruger/måned** (ekskl. moms) |
| **Professional (6+ brugere)** | **179 DKK/bruger/måned** (ekskl. moms) |
| **Årlig betaling** | 2 måneder gratis (ca. 17 % rabat) |
| **Min. commitment** | Evt. 3–6 måneder første gang eller månedlig opsigelig efter prøveperiode |

I **EUR** (til international salg): ca. **15–22 EUR/bruger/måned** afhængigt af tier.

Disse tal er **illustrative** og bør justeres ud fra:

- Faktiske omkostninger (hosting, GraphHopper, support, salg)  
- Konkurrenter i de konkrete segmenter I går efter  
- Om I tilbyder gratis prøveperiode (fx 14 dage) og hvad den koster  

---

## 5. Faktorer der påvirker prisen

- **Omkostninger:** Hosting (Postgres, Redis, Martin, GraphHopper), evt. Nominatim, support, drift.  
- **Geografi:** DK-only vs. Norden/EU kan kræve flere data og højere pris.  
- **Grænser:** Begrænsning af antal ruteberegninger, gemte ruter eller steder kan differentiere tiers.  
- **Support:** E-mail vs. chat vs. dedikeret account manager.  
- **SLA:** 99,9 % uptime (som i NFR) kan medføre premium-tier eller tillæg.  
- **Licenser:** OSM/ODbL er fri at bruge; I sælger platform og service, ikke kortdata.

---

## 6. Korte anbefalinger

1. **Start med per-bruger-pris** (fx 129–179 DKK/bruger/måned) med en enkel Starter- og en Professional-tier.  
2. **Tilbyd årlig betaling** med 10–15 % rabat for bedre cash flow og lavere churn.  
3. **Overvej en “Small org”-pakke** med flad pris (fx 499–799 DKK/måned) til små kunder med få brugere.  
4. **Dokumentér værdi:** Tidsbesparelse på ruteplanlægning, færre kørte km, bedre overblik – så prisen kan begrundes over for dispatchers og fleet managers.  
5. **Revidér priser** når V1-features (VRP, multi-stop, evt. mobil) kommer; de kan understøtte højere tiers eller tillæg.

---

## 7. Opsummering

| Spørgsmål | Svar |
|-----------|------|
| **Typisk abonnementspris (reference)** | **129–179 DKK per bruger per måned** (ekskl. moms) afhængigt af tier og antal brugere. |
| **Laveste tier** | Ca. **99–149 DKK/bruger/måned** for små teams med begrænsninger. |
| **Enterprise** | Kontaktpris; custom aftale ved mange brugere eller SLA-krav. |
| **Årlig rabat** | Anbefalet 10–15 % (fx 2 måneder gratis). |

Denne analyse kan opdateres, når produktets feature-set, omkostninger og markedet ændrer sig.

---

*Dokument version: 1.0 | Formål: Intern prissætningsanalyse for EzRoot B2B abonnement.*
