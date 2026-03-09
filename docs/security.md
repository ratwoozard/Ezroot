# Security – implementeret MVP

Dette dokument beskriver den sikkerhed, der faktisk er implementeret i koden.

## JWT-claims

- **sub:** user_id (UUID).
- **org:** org_id (UUID) – bruges til RLS (`app.current_org_id`).
- **role:** Rolle (fx "admin"); lagres ved registrering og i token.
- **email:** Valgfrit i payload; bruges i frontend/me.
- **exp / iat:** Standard JWT udløb og udstedelsestid.

Token signeres med HS256 og `JWT_SECRET` (miljø; anbefales min. 32 tegn i produktion).

## Roller

- I koden bruges `admin` ved registrering (packages/shared: ROLES.admin). Rollen lagres i `users.role` og sendes i JWT.
- Der er **ingen** forskellige tilladelser pr. rolle i MVP; alle autentificerede brugere kan bruge de samme endpoints inden for deres org. Fremtidig RBAC (fx kun admin må slette andre brugeres ruter) er ikke implementeret.

## RLS-model med app.current_org_id

- Alle tenant-tabeller har `org_id` og RLS aktiveret (migration 002_rls).
- Policy: `org_id = current_setting('app.current_org_id', true)::uuid`.
- Backend sætter **pr. request** (før tenant-queries): `SET LOCAL app.current_org_id = '<org_id fra JWT>'` via `DbService.runInTenant(orgId, fn)`.
- Tabeller under RLS: users, vehicle_profiles, saved_places, saved_routes, export_jobs, audit_log. Organizations: SELECT/UPDATE begrænset til egen org; INSERT tilladt (til register).

Connection pooling: Hver request får en connection fra pool, sætter `SET LOCAL` i den connection, udfører queries og frigiver; der sættes aldrig org_id ved pool-oprettelse.

## Audit log

- **Implementeret:** `AuditService.log(orgId, userId, action, entityType, entityId, payload?)` skriver til `audit_log`.
- Kaldt ved: create/update/delete vehicle_profile, create/delete saved_place, create/delete saved_route, create export_job.
- RLS gælder for `audit_log`; kun egen orgs logindlæg er synlige. Der er i MVP **ingen** læse-endpoint til audit_log (kun skriv).

## Password-hashing

- bcrypt med 10 salt-runder (AuthService). Passwords gemmes ikke i ren tekst.

## Kendte begrænsninger og risici i MVP

- Ingen rate limiting på auth eller API.
- Ingen refresh-token; kun access_token med konfigurerbar levetid (JWT_EXPIRES_IN).
- RBAC er ikke implementeret; alle autentificerede brugere i en org har samme adgang til orgens data.
- Audit_log læses ikke af appen i MVP (kun skriv).
- Login finder bruger på tværs af orgs via `get_user_by_email` (SECURITY DEFINER); samme email i to orgs vil matche én bruger.

## Hvad testene beviser om tenant-isolation

- **RLS-isolationstest** (`test/rls-isolation.e2e-spec.ts`): Via **HTTP** oprettes to orgs med hver deres bruger. Bruger A opretter en vehicle_profile. Bruger B kalder GET /vehicle-profiles og får 0 items; GET /vehicle-profiles/:id med A’s id returnerer 404. Det beviser, at API-laget (med JWT og `runInTenant`) resulterer i korrekt adgangsbegrænsning som forventet af RLS.
- Der køres **ingen** direkte DB-test, hvor to sessioner med forskellige `app.current_org_id` kører queries i samme test; isolationen verificeres alene gennem API-respons.
