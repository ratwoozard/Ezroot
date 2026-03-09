# Arkitektur – overblik

## C4 – kontekst

```mermaid
flowchart TB
  subgraph Users
    A[Dispatcher/Planner]
    B[Fleet Manager]
    C[Chauffør]
  end

  subgraph System["Route Guide System"]
    D[Web (Next.js)"]
    E[API (NestJS)"]
    F[GraphHopper]
    G[Martin]
    H[Postgres/PostGIS]
    I[Redis]
  end

  A --> D
  B --> D
  C --> D
  D --> E
  E --> H
  E --> F
  E --> I
  D --> G
  E --> G
  F -.->|OSM data| F
  G -.->|tiles from| H
```

- **Brugere** interagerer kun med Web-appen.
- **Web** kalder API til auth, ruter, gemte data og eksport; henter vektor-tiles fra Martin.
- **API** håndterer forretningslogik, JWT, RLS (Postgres), kald til GraphHopper og evt. Nominatim; cache (Redis) til geokodning.
- **GraphHopper** beregner ruter (truck-profil, OSM-baseret).
- **Martin** server MVT fra PostGIS (OSM-data importeret med osm2pgsql).
- **Postgres/PostGIS** indeholder app-data (organizations, users, vehicle_profiles, saved_places, saved_routes, export_jobs, audit_log) og evt. tile-data til Martin.

## Containere / komponenter

| Komponent | Teknologi | Rolle |
|-----------|-----------|--------|
| Web | Next.js, MapLibre GL JS, MUI | SPA med login, dashboard, ruteformular, kort, gemte ruter/steder, eksport |
| API | NestJS, pg, JWT | REST API; sætter `app.current_org_id` pr. request; kalder GraphHopper, Redis, Postgres |
| GraphHopper | Java, OSM PBF | Routing-engine; truck/small_truck; returnerer polyline, distance, time |
| Martin | Rust | Vektor-tile server; læser fra PostGIS eller MBTiles |
| Postgres/PostGIS | PostgreSQL 15 + PostGIS | App DB + tile-geometrier; RLS på alle tenant-tabeller |
| Redis | Redis 7 | Cache for geokodning; evt. rute-cache |
| Nominatim | Valgfri | Geokodning; selv-hostet med cache for at undgå overbelastning |

## Sekvens – beregn rute

```mermaid
sequenceDiagram
  actor User
  participant Web
  participant API
  participant DB
  participant GH as GraphHopper

  User->>Web: Indtaster origin, destination, vælger profil
  Web->>API: POST /routes/compute (JWT, body)
  API->>API: Valider JWT, hent org_id
  API->>DB: SET LOCAL app.current_org_id; SELECT vehicle_profiles
  API->>API: Geokod origin/destination (cache/ Nominatim)
  API->>GH: Route request (from, to, truck params)
  GH-->>API: Polyline, distance, duration
  API-->>Web: 200 { geometry, distance_km, duration_min, warnings }
  Web->>Web: Tegn rute på kort (MapLibre)
```

## Sekvens – auth

```mermaid
sequenceDiagram
  actor User
  participant Web
  participant API
  participant DB

  User->>Web: E-mail + password
  Web->>API: POST /auth/login
  API->>DB: SELECT user (email), verify bcrypt
  API->>API: Generer JWT (org_id, role, user_id)
  API-->>Web: 200 { access_token, user }
  Web->>Web: Gem token; redirect dashboard
  Note over Web,API: Efterfølgende kald: Authorization: Bearer <token>
  Web->>API: GET /me (Bearer)
  API->>API: Verificer JWT, hent org_id
  API-->>Web: 200 { user }
```

## Beslutninger

- Routing: GraphHopper (ADR).
- Tiles: Martin + PostGIS (ADR).
- Multi-tenant: RLS med `app.current_org_id` (ADR).
- Auth: Egen JWT i MVP (ADR).
- Fejl: ErrorResponse envelope; pagination med X-Total-Count og totalCount (API-kontrakter).
