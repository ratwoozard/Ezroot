# EzRoot med lokal PostgreSQL (uden Supabase)

Du kan køre EzRoot med en **lokal PostgreSQL-database** – ingen Supabase og ingen premium.

## Valg 1: Docker (hvis du har Docker)

Fra EzRoot-mappen:

```powershell
docker compose up -d
```

Det starter PostgreSQL på `localhost:5432` med bruger `postgres`, password `postgres`, database `ezroot`.

## Valg 2: PostgreSQL installeret på PC

1. Installer PostgreSQL fra https://www.postgresql.org/download/windows/ (eller `winget install PostgreSQL.PostgreSQL`).
2. Opret en database, fx i pgAdmin eller med:

   ```powershell
   psql -U postgres -c "CREATE DATABASE ezroot;"
   ```

3. Brug fx bruger `postgres` og dit eget password (eller sæt password til `postgres` til udvikling).

---

## Fælles trin (efter Postgres kører)

1. **Sæt `.env` i EzRoot-roden**

   Brug **kun** disse linjer til database (resten kan stå som før):

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ezroot
   JWT_SECRET=change-me-in-production-min-32-chars
   ```

   Hvis du bruger eget password til `postgres`, skift det andet `postgres` i URL’en:
   `postgresql://postgres:DIT_PASSWORD@localhost:5432/ezroot`

2. **Kør migrationer** (opretter tabeller)

   Fra EzRoot-mappen:

   ```powershell
   npm run migration:run
   ```

3. **Kør seed** (testbrugere)

   ```powershell
   npm run seed
   ```

4. **Start API og web**

   - Terminal 1: `npm run api:dev`
   - Terminal 2: `npm run web:dev`

5. **Log ind**

   Åbn den URL Next.js viser og log ind med **admin@org-a.dk** / **seed-pass-123**.

---

## Opsummering

| Trin              | Kommando            |
|-------------------|---------------------|
| Start Postgres    | `docker compose up -d` (eller din lokale Postgres) |
| Migrationer       | `npm run migration:run` |
| Seed              | `npm run seed`      |
| API               | `npm run api:dev`   |
| Web               | `npm run web:dev`   |

Ingen Supabase-konto eller premium er nødvendig.
