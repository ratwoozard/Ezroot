# Virtualisering skal være slået til (Docker på Windows)

Docker Desktop viser: *"Virtualization support not detected"*.

Det betyder, at din computer ikke har slået **virtualisering** til. Det sker i PC’ens indstillinger (BIOS/UEFI), ikke i Windows.

---

## Trin 1: Find ud af, om virtualisering er slået til

1. Tryk **Ctrl + Shift + Esc** (åbner Opgaverstyring).
2. Gå til fanen **Ydeevne**.
3. Klik på **CPU** til venstre.
4. Nederst til højre står der fx **"Virtualisering: Aktiveret"** eller **"Virtualisering: Deaktiveret"**.

- **Aktiveret** → Virtualisering er i orden. Prøv at genstarte Docker Desktop eller genstarte PC og start Docker igen.
- **Deaktiveret** → Gå til Trin 2.

---

## Trin 2: Slå virtualisering til i BIOS/UEFI

Det sker i PC’ens "opstartsindstillinger" (BIOS eller UEFI). Navn og placering varierer fra mærke til mærke.

### Sådan kommer du ind i BIOS/UEFI

1. Genstart PC’en.
2. **Lige når den starter**, tryk flere gange på den tast, der åbner indstillinger. Det er ofte en af disse:
   - **F2**
   - **F10**
   - **F12**
   - **Del** (Delete)
   - **Esc**
3. På mange **Dell**: F2 ved opstart.
4. På mange **HP**: F10 eller Esc, derefter F10.
5. På mange **Lenovo**: F1 eller F2.
6. På mange **ASUS**: F2 eller Del.

Hvis du ikke er sikker: søg på nettet efter: **"[dit PC-mærke] enter BIOS"** eller **"[dit PC-mærke] enable virtualization"**.

### Find og slå virtualisering til

- I menuen skal du finde noget, der hedder fx:
  - **Virtualization**
  - **Virtualization Technology**
  - **VT-x** (Intel)
  - **AMD-V** eller **SVM** (AMD)
- Det ligger ofte under:
  - **Advanced** → **CPU Configuration**, eller
  - **Configuration**, eller
  - **Security**.
- Sæt indstillingen til **Enabled** / **Aktiveret**.
- **Gem og afslut** (fx **Save & Exit** eller F10). PC’en genstarter.

---

## Trin 3: Efter genstart

1. Start **Docker Desktop** igen.
2. Vent til det viser, at Docker kører.
3. Kør derefter kommandoerne fra **PRØV APPEN.md** (eller fra runbook) for at starte databasen og appen.

---

## Hvis du er på arbejds-PC

Nogle virksomheder låser virtualisering eller BIOS. Fejlbeskeden siger: *"Contact your IT admin"*.

- **Kontakt din IT-afdeling** og bed dem om at **slå virtualisering til** i BIOS/UEFI (VT-x/AMD-V), så Docker Desktop kan køre.
- Alternativt kan de hjælpe med at køre EzRoot et andet sted (fx en server eller en anden PC, hvor virtualisering er tilladt).

---

## Hvis du ikke kan slå virtualisering til

Så kan Docker Desktop **ikke** køre på den maskine. Du har så disse muligheder:

- Bruge en **anden computer** med virtualisering slået til.
- Køre appen på en **server** eller i skyen, hvor Docker allerede er sat op.
- Få **IT** til at sætte en lille database (Postgres) op til dig og så køre kun API + web uden Docker (kræver lidt opsætning).
