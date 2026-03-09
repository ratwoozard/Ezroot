# Multi-tenancy og RLS

## Model

- **Én Postgres-instans** med alle tenant-data i samme schema.
- **Hver tenant-relevant tabel** har kolonnen `org_id` (UUID, NOT NULL) og er **RLS protected**.
- **Policy:** Kun rækker hvor `org_id = current_setting('app.current_org_id', true)::uuid` er synlige og redigerbare for den aktuelle forbindelse.

## Tabeller med RLS

| Tabel | RLS policy |
|-------|------------|
| users | org_id = session |
| vehicle_profiles | org_id = session |
| saved_places | org_id = session |
| saved_routes | org_id = session |
| export_jobs | org_id = session |
| audit_log | org_id = session |

`organizations` bruges til at oprette org og til lookup; adgang kan begrænses til at bruger kun kan se egen org (via join med users eller separat policy).

## Session setting

- Ved **hver API-request** (efter JWT-validering):
  1. Backend læser `org_id` fra JWT (claim `org` eller `org_id`).
  2. For den DB-forbindelse der bruges til denne request: `SET LOCAL app.current_org_id = '<uuid>'`.
  3. Alle efterfølgende queries på samme connection ser kun data for den org.

**Vigtigt (connection pooling):** `SET LOCAL` gælder kun for den aktuelle transaktion/connection. Ved connection pooling skal setting sættes **pr. request** (før første query), ikke ved pool-oprettelse. Ellers kan en genbrugt connection utilsigtet bruge forrige requests org_id. Løsning: altid sæt `app.current_org_id` i starten af request-håndteringen for den connection der bruges til DB-kald. ANTAGELSE: Backend bruger request-scoped connection eller eksplicit set pr. request.

## Pitfalls

1. **Glemme at sætte session:** Hvis `app.current_org_id` ikke er sat, returnerer `current_setting('app.current_org_id', true)` NULL; cast til uuid kan fejle eller policy matcher ingen rækker → bruger ser ingen data eller får fejl. Løsning: altid sæt variablen efter JWT-validering; fejl hvis org_id mangler i token.
2. **Connection pooling:** Hvis en connection genbruges fra en anden request uden at sætte variablen igen, kan den nye request utilsigtet se den forrige tenants data. Løsning: sæt altid `app.current_org_id` i starten af request-håndteringen for den connection der bruges.
3. **Superuser / bypass RLS:** Postgres tillader at RLS bypasses for table-owner og superuser. App-brugeren der kører queries skal **ikke** være superuser; den skal være en almindelig bruger så RLS altid gælder.
4. **INSERT/UPDATE:** Policy skal dække både SELECT og INSERT/UPDATE/DELETE (USING og evt. WITH CHECK). I vores model: USING (org_id = current_setting(...)) og ved INSERT sæt org_id fra token (ikke fra request body).

## Test af isolation

- Opret to organisationer med hver deres bruger.
- Som bruger A: opret vehicle_profile og saved_route.
- Som bruger B: kald GET /vehicle-profiles og GET /saved-routes. Acceptkriterie: ingen af A's data vises; X-Total-Count og items svarer kun til B's data.
- Som bruger B: kald GET /saved-routes/{id} med A's route_id. Acceptkriterie: 404 (eller 403).

Implementer denne test som integrationstest (jf. test-strategy.md).
