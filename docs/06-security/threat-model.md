# Threat model (kort STRIDE)

| Trussel | Beskrivelse | Mitigation |
|---------|-------------|------------|
| **S**poofing | Falsk bruger eller session | JWT signeret med hemmelig nøgle; bcrypt til passwords; ingen session-fixation ved logout. |
| **T**ampering | Ændring af data undervejs | HTTPS i prod; API validerer input; RLS forhindrer ændring af anden orgs data. |
| **R**epudiation | Nægtelse af handling | Audit-log over kritiske handlinger (login, rute opret/slet); log immutable. |
| **I**nformation disclosure | Læk af følsomme data | RLS; ingen PII i logs; secrets i miljøvariabler; TLS. |
| **D**enial of service | Overbelastning | Rate limiting pr. token/IP; caching (Redis) for at reducere load på Nominatim/GraphHopper. |
| **E**levation of privilege | Uautoriseret admin | RBAC; role i JWT; backend tjekker rolle ved admin-endpoints. |

## Abuse cases

- **Brute force login:** Rate limit på POST /auth/login; evt. lockout efter N forsøg; fejlede logins logges.
- **Token-tyveri:** Korte JWT levetider eller refresh token; ingen følsomme data i token body.
- **Cross-tenant access:** RLS + org_id fra JWT; ingen mulighed for at sende anden org_id i request body til lister/get.
- **API scraping:** Rate limit; evt. CAPTCHA ved mistænkelig adfærd (V1).
