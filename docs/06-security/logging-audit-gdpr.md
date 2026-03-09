# Logging, audit og GDPR

## Audit-log (applikation)

- **Events:** Brugeroprettelse, login (success/failure), rute oprettet, rute gemt, rute slettet, sted gemt/slettet, eksport oprettet.
- **Felter (minimum):** audit_id, org_id, user_id, action, created_at. Ingen PII i action-tekst (fx "route_created" ikke adresser).
- **Adgang:** Kun admin (eller support) må læse audit_log; API kan eksponere GET /admin/audit med admin-rolle.
- **RLS:** audit_log er RLS protected; org_id fra session.

## Almindelig logging (app/server)

- Struktureret logging (JSON): timestamp, level, requestPath, statusCode, requestId. Undlad at logge passwords, tokens eller fulde adresser.
- Fejl: log stack trace i non-prod; i prod kun fejlkode og besked.

## Retention og GDPR

- **Log retention:** Persondata i logs (fx IP, user_id) anonymiseres eller slettes efter **90 dage**. Aggregeret statistik kan beholdes.
- **Brugerens data:** Ved anmodning om sletning: slet bruger, gemte ruter/steder og relaterede export_jobs; anonymiser eller slet audit-rækker der peger på brugeren (eller behold audit med anonymiseret user_id ifølge lovkrav).
- **Dataminimalitet:** Gem kun nødvendige felter; ingen lokationshistorik ud over brugerens egne gemte ruter/steder.
- **Dokumentation:** Privacy notice og databehandlingsaftale uden for denne tekniske doc; her kun retention og PII-policy.

## Secrets

- Ingen API-nøgler eller JWT_SECRET i kode. Miljøvariabler eller secrets manager (fx Kubernetes Secrets) i prod.
