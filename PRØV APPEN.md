# Sådan prøver du EzRoot (ikke-teknisk)

## 1. Start Docker (vigtigt)

Appen bruger en database som kører i Docker.

- Åbn **Docker Desktop** (installer det fra [docker.com](https://www.docker.com/products/docker-desktop/) hvis du ikke har det).
- Vent til Docker viser at den kører (ikon i systembakken).

## 2. Åbn en terminal i mappen EzRoot

- Åbn **Cursor** (eller VS Code) og åbn mappen **EzRoot**.
- Åbn terminalen: **Terminal → Ny terminal** (eller tryk `` Ctrl+` ``).

Du skal stå i mappen hvor filen `package.json` ligger (EzRoot-roden).

## 3. Kør disse kommandoer – ét ad gangen

Kopier og indsæt **ét** kommando ad gangen og tryk Enter. Vent til den er færdig før næste.

**3a – Installer**
```bash
pnpm install
```
(Ved "pnpm not found": prøv `npm install` i stedet.)

**3b – Start database**
```bash
docker compose -f infra/docker-compose.yml up -d
```
(Vent 10–20 sekunder.)

**3c – Opret tabeller i databasen**
```bash
node scripts/run-migrations.js
```
(Sæt først miljø:  
`$env:DATABASE_URL="postgres://app:secret@localhost:5432/appdb"`  
derefter kør `node scripts/run-migrations.js` igen. På Mac/Linux: `export DATABASE_URL=postgres://app:secret@localhost:5432/appdb`.)

**3d – Indsæt testdata (valgfrit)**
```bash
pnpm -C apps/api run seed:run
```
(Igen: hvis det siger DATABASE_URL ikke sat, sæt den som under 3c.)

**3e – Start API**
```bash
pnpm -C apps/api start:dev
```
Lad vinduet stå åbent. Når du ser noget med "Nest application successfully started", er API klar.

**3f – Åbn en NY terminal** (Terminal → Ny terminal), stadig i EzRoot-mappen.

**3g – Generer typer og start web**
```bash
pnpm -C packages/openapi run codegen
pnpm -C apps/web dev
```
Lad også dette vindue stå åbent.

## 4. Åbn appen i browseren

- Gå til: **http://localhost:3000**
- Log ind med (efter du har kørt seed i 3d):
  - **E-mail:** `admin@org-a.dk`
  - **Adgangskode:** `seed-pass-123`

Så kan du prøve ruteplanlægning, gemte steder og eksport.

---

**Hvis noget fejler**

- "DATABASE_URL is not set" → Sæt variablen som beskrevet under 3c og kør kommandoen igen.
- "docker not found" → Start Docker Desktop og sørg for at den kører.
- "port 3000/3001 in use" → Luk andre programmer der bruger de porte, eller skift port i konfiguration.

Flere detaljer og fejlsøgning: **docs/runbook.md**.
