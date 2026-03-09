# Test cases (UAT og edge cases)

## UAT-scenarier (acceptance)

1. **Registrering og login:** Opret org + admin; log ind; GET /me returnerer bruger med korrekt org_id og role.
2. **Køretøjsprofil:** Opret profil som planner; list viser kun orgs profiler; slet og bekræft 404 ved GET.
3. **Rute:** Beregn rute med gyldig origin, destination, vehicleId; respons har geometry, distance_km, duration_min. Ugyldig vehicleId → 400.
4. **Ingen rute:** Origin/destination hvor GraphHopper finder ingen rute (fx pga. restriktioner) → 404 eller 200 med tom geometry og beskrivende warning.
5. **Gem rute:** Beregn rute; POST /saved-routes med navn og data; GET /saved-routes/{id} returnerer samme rute. Kun egen org.
6. **Gem sted:** POST /saved-places; list og slet; RLS: anden org ser ikke stedet.
7. **Eksport:** POST /exports med routeId og format GPX; poll GET /exports/{jobId}; ved completed hent file_url.
8. **RLS isolation:** To orgs; bruger B kan ikke se eller slette bruger A's vehicle_profiles, saved_places, saved_routes (integrationstest).

## Edge cases

- **Pagination:** GET /saved-routes?page=2&limit=10; tjek X-Total-Count og items; tom side ved page ud over antal.
- **Search:** GET /saved-places?search=depot; kun matchende steder fra egen org.
- **Token udløbet:** Request med udløbet JWT → 401 ErrorResponse.
- **Manglende token:** Beskyttet endpoint uden Authorization → 401.
- **GraphHopper nede:** POST /routes/compute → 503 med SERVICE_UNAVAILABLE (eller tidsgrænse).
- **Ugyldig UUID:** GET /vehicle-profiles/ikke-uuid → 400.
- **Validering:** POST /vehicle-profiles med manglende required felt → 400 med details.
