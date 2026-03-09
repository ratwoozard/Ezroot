# API-eksempler (curl og fejl)

## Auth

### Registrering
```bash
curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123","name":"Admin","orgName":"Min Transport"}'
```

### Login
```bash
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'
```
Eksempel svar:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "user_id": "...",
    "org_id": "...",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

### Hent aktuel bruger
```bash
TOKEN="<access_token>"
curl -s http://localhost:3001/me -H "Authorization: Bearer $TOKEN"
```

## Geokodning

### Adressesøgning
```bash
curl -s "http://localhost:3001/geocode/search?q=K%C3%B8benhavn%20H" -H "Authorization: Bearer $TOKEN"
```
Eksempel svar: `{ "items": [ { "address": "...", "lat": 55.6761, "lon": 12.5683 } ] }`

## Køretøjsprofiler

### Opret profil
```bash
curl -s -X POST http://localhost:3001/vehicle-profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"40t lastbil","length":18,"width":2.5,"height":4,"weight":40000,"axles":5,"hazardous_material":false}'
```

### List profiler (pagineret)
```bash
curl -s "http://localhost:3001/vehicle-profiles?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```
Response har header `X-Total-Count` og body `{ "items": [...], "totalCount": N }`.

## Rute

### Beregn rute
```bash
curl -s -X POST http://localhost:3001/routes/compute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "55.6761,12.5683",
    "destination": "56.1629,10.2039",
    "vehicleId": "<vehicle_id uuid>"
  }'
```
Eksempel 200:
```json
{
  "geometry": [[12.5683, 55.6761], [12.59, 55.68], ...],
  "distance_km": 185.2,
  "duration_min": 118,
  "warnings": []
}
```

### Gem rute
```bash
curl -s -X POST http://localhost:3001/saved-routes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kbh – Aarhus",
    "vehicleId": "<vehicle_id>",
    "origin": "København",
    "destination": "Aarhus",
    "geometry": [[12.56, 55.67], ...],
    "distance_km": 185,
    "duration_min": 118
  }'
```

## Eksport

### Opret eksport
```bash
curl -s -X POST http://localhost:3001/exports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"routeId":"<saved_route_id>","format":"GPX"}'
```
202 response: `{ "job_id": "...", "status": "pending", ... }`

### Hent status
```bash
curl -s http://localhost:3001/exports/<job_id> -H "Authorization: Bearer $TOKEN"
```
Ved færdig: `{ "job_id": "...", "status": "completed", "file_url": "https://..." }`

## Fejlresponser (ErrorResponse)

Alle 4xx/5xx har samme form:

```json
{
  "error_code": "INVALID_INPUT",
  "message": "Vehicle profile not found",
  "details": ["vehicleId 12345 does not exist"]
}
```

Eksempler:

- **401 Unauthorized** – manglende eller ugyldig token:
```json
{
  "error_code": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "details": []
}
```

- **400 Bad Request** – validering:
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": ["origin must be a string", "vehicleId must be a UUID"]
}
```

- **404 Not Found** – rute ikke fundet:
```json
{
  "error_code": "ROUTE_NOT_FOUND",
  "message": "Ingen lovlig rute fundet efter restriktioner",
  "details": ["Prøv at fjerne restriktioner eller vælg anden profil"]
}
```

- **503 Service Unavailable** – GraphHopper nede:
```json
{
  "error_code": "SERVICE_UNAVAILABLE",
  "message": "Ruteberegning midlertidigt utilgængelig",
  "details": []
}
```

Pagination: Ved list-endpoints sendes altid `X-Total-Count` og body `totalCount` sammen med `items`.
