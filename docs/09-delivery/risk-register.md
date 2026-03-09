# Risikoregister

| Risiko | Sandsynlighed | Konsekvens | Mitigation | Owner |
|--------|---------------|------------|------------|--------|
| Langsom OSM/GraphHopper-import | Middel | Høj | Brug mindre udsnit (DK) i MVP; parallelliser import; cloud CPU ved behov | DevOps |
| Utilstrækkelige OSM-restriktioner | Lav | Mellem | Tydelige advarsler og disclaimer; bruger-override; telemetri til at forbedre data | Produkt |
| Performance under load | Middel | Høj | Caching (Redis); autoscaling; SLO-monitoring og alerting | Backend |
| Sårbar dependency (CVE) | Lav | Kritisk | Løbende scan (Dependabot/npm audit); hurtig patch | Security |
| RLS-fejl (data læk) | Lav | Kritisk | Integrationstest for isolation; code review af alle queries; ingen superuser til app | Backend |
| Licensbrud (OSM attribution) | Lav | Mellem | Attribution i UI og eksport; dokumenteret i licensing-attribution | Compliance |
| Manglende udviklerkapacitet | Middel | Mellem | Dokumentation og videndeling; prioriter kerne først | Projekt |

Mitigations er løbende; ejer ("Owner") har ansvar for at overvåge og opdatere tiltag.
