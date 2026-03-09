# Ikke-funktionelle krav (NFR)

## SLO / SLA

| ID | Krav | Måling |
|----|------|--------|
| REQ-NFR-001 | Tilgængelighed min. 99,9% | Uptime over måned; ekskl. planlagt vedligeholdelse |
| REQ-NFR-002 | 90% af ruteforespørgsler besvares < 500 ms | P90 latency på POST /routes/compute |
| REQ-NFR-003 | Kortvisning og simple API-kald < 1000 ms | P95 for GET /me, GET /vehicle-profiles osv. |

Degraderet tilstand: ved SLO-brud returneres 503 og bruger informeres (graceful degradation).

## Performance og skalerbarhed

- Routing-tjenesten (GraphHopper) og tile-server (Martin) kan køre flere instanser bag load-balancer.
- API og DB designet til horisontal skalering (stateless API; connection pooling med RLS pr. request).

## Sikkerhed

- Al kommunikation TLS (HTTPS) i produktion.
- JWT-baseret API; rate limiting (fx 100 req/min per token) for at begrænse misbrug.
- Ingen API-nøgler eller secrets i kode; miljøvariabler/secrets manager.

## Privacy og GDPR

- Persondata (bruger-id, e-mail, navn) håndteres fortroligt.
- Sletning af brugerdata på skriftlig anmodning; logs kan anonymiseres/slettes.
- Log retention: persondata i logs anonymiseres eller fjernes efter 90 dage (dokumenteret i logging-audit-gdpr.md).
- Dataminimalitet: kun nødvendige felter gemmes; ingen lokationshistorik ud over brugerens egne gemte ruter/steder.

## Licenser og compliance

- OSM ODbL: attribution på alle kort og ved eksport; ingen reverse engineering af tredjepartsprodukter.
- Audit: revisionsspor af følsomme operationer i uforanderlige logfiler.

## Drift og monitorering

- Metrics (Prometheus/Grafana): fejlrate, latens, throughput.
- Alerting ved fx API-fejlrate > 1% eller latens over SLO i 5 min.
- Backup: Postgres daglig backup; replikering af brugerdata.
