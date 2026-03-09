# Auth og RBAC

## JWT-claims

- **sub:** user_id (UUID).
- **org** (eller org_id): organisation UUID – bruges til RLS (`app.current_org_id`).
- **role:** admin | planner | driver (eller tilsvarende).
- **exp:** udløb.
- **iat:** udstedt.

Ingen PII (fx e-mail) i token; hentes ved GET /me ved behov.

## Roller og tilladelser

| Ressource / handling | admin | planner | driver |
|----------------------|-------|---------|--------|
| Opret bruger / rediger org | Ja | Nej | Nej |
| CRUD køretøjsprofiler | Ja | Ja | Læs |
| Gemte steder CRUD | Ja | Ja | Læs |
| Beregn rute, gem rute, slet egen | Ja | Ja | Ja |
| List/slet andres gemte ruter | Ja | Ja (samme org) | Egne |
| Eksport | Ja | Ja | Ja |
| Læs audit_log | Ja | Nej | Nej |

RBAC implementeres i backend: efter JWT-validering tjekkes `role` ved admin-specifikke endpoints; RLS håndterer org-isolation for data.

## Password og token

- Passwords hashes med bcrypt (salt).
- JWT signeret med HS256 (eller RS256) med hemmelig nøgle fra miljø (JWT_SECRET); min. 32 tegn i prod.
- Token levetid: fx 7 dage (JWT_EXPIRES_IN); refresh token kan tilføjes i V1.
