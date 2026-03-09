# EzRoot med Supabase (oprettet via MCP)

**Kør uden Supabase (gratis, ingen premium)?** Se [Lokal PostgreSQL](lokal-postgres-setup.md).

Supabase-projektet **EzRoot** er oprettet og schema er påført.

## Projekt

- **Projekt-id:** `stqcvarknctewxpqqaon`
- **Region:** eu-central-1 (Frankfurt)
- **Dashboard:** https://supabase.com/dashboard/project/stqcvarknctewxpqqaon
- **API URL:** https://stqcvarknctewxpqqaon.supabase.co

## Migrationer og seed

Disse migrationer er kørt på Supabase (EzRoot-schema):

- `ezroot_001_tables` – organisations, users, vehicle_profiles, saved_places, saved_routes, export_jobs, audit_log
- `ezroot_002_rls` – Row Level Security på alle tenant-tabeller
- `ezroot_003_login_by_email` – funktion `get_user_by_email` til login

Seed er kørt: 2 orgs, **admin@org-a.dk** og **admin@org-b.dk** (password: **seed-pass-123**). For at køre migrationer eller seed lokalt kræves gyldig `DATABASE_URL` i repo-root `.env` (Session pooler, se nedenfor).

## Sådan forbinder du EzRoot til Supabase

1. **Database-adgangskode**
   - Gå til **Projekt-indstillinger** → **Database**: https://supabase.com/dashboard/project/stqcvarknctewxpqqaon/settings/database
   - Under **Database password**: vis eller nulstil adgangskoden (gem den). Connection string kan man ikke ændre – kun password bruges i `.env`.

2. **Connection string – format er fast**
   - Supabase giver et fast format; man ændrer **ikke** host, port eller brugernavn. Brug **Session** pooler (port 5432), ikke Direct (`db.xxx.supabase.co`).
   - I `.env` bruges denne form – det eneste du ændrer er **adgangskoden** (efter `postgres.stqcvarknctewxpqqaon:`):
     ```
     DATABASE_URL=postgresql://postgres.stqcvarknctewxpqqaon:DIT_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
     ```

3. **Sæt database-adgangskode i .env**
   - Database-adgangskoden sættes kun i Supabase (Reset password i **Database**-indstillinger) eller via Management API. Derefter opdaterer du **kun** password-delen i `DATABASE_URL` i repo-root **`.env`**.
   - Hvis adgangskoden indeholder `!`, brug `%21` i URL (fx `mypass%21`).

4. **Seed (testdata)**
   - Seed er allerede kørt direkte i Supabase (2 orgs, admin@org-a.dk og admin@org-b.dk, password: **seed-pass-123**).
   - Hvis du vil køre seed lokalt i stedet:
     ```bash
     pnpm -C apps/api run seed:run
     ```
     **Tip:** Hvis din database-adgangskode indeholder `!`, brug `%21` i stedet i `DATABASE_URL` (fx `mypass%21`).
     Ved fejlen "Tenant or user not found" fra pooleren kan du i stedet køre seed-SQL i Supabase Dashboard → SQL Editor.

5. **Start API og web** (kør altid fra EzRoot-mappen)
   - Terminal 1: `npm run api:dev`
   - Terminal 2: `npm run web:dev`
   - Åbn den URL Next.js viser (fx http://localhost:3000 eller http://localhost:3003) og log ind med `admin@org-a.dk` / `seed-pass-123`
   - *(Du behøver ikke `pnpm` globalt – scriptene bruger `npx pnpm`.)*

## Fejlfinding

- **"Tenant or user not found"**: Pooleren accepterer ikke den nuværende adgangskode.
  1. Gå til **Database Settings** (Project Settings → Database) → **Reset database password** og gem den nye adgangskode.
  2. Opdater i **`.env`** kun password-delen i `DATABASE_URL` (mellem `postgres.stqcvarknctewxpqqaon:` og `@aws-0-...`). Connection string-format ændres ikke.
  3. Vent 1–2 minutter efter reset, genstart API: `npm run api:dev`.

- **"pnpm" genkendes ikke**: Brug `npm run api:dev` og `npm run web:dev` fra EzRoot-mappen (ingen global pnpm nødvendig).

- **Port 3001 i brug**: Luk andre programmer der bruger port 3001, eller find processen: `netstat -ano | findstr :3001` og stop den med `taskkill /PID <tal> /F`.

- **Web kører på anden port**: Next.js vælger næste ledige port (fx 3003); brug den URL der står i terminalen.

## Bemærkning

Du behøver **ikke** Docker til at køre EzRoot, når du bruger Supabase som database.
