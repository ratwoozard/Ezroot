# Virtualisering er aktiveret – Docker starter stadig ikke

Hvis Opgaverstyring viser **"Virtualisering: Aktiveret"** men Docker siger "Virtualization support not detected", skal Windows have slået nogle ekstra funktioner til.

---

## Løsning 1: Slå WSL og virtualiseringsfunktioner til (anbefalet)

Docker Desktop på Windows bruger ofte **WSL 2**. Disse trin aktiverer det:

### Trin A: Åbn Windows-funktioner

1. Tryk **Windows-tasten** og skriv **"udviklerindstillinger"** eller **"Windows-funktioner"**.
2. Klik på **"Aktiver eller deaktiver Windows-funktioner"** (Turn Windows features on or off).

### Trin B: Slå disse til (kryds i boksen)

- **Virtual Machine Platform**
- **Windows Subsystem for Linux** (WSL)
- **Hyper-V** (hvis den findes på din udgave af Windows – ikke på alle)

Klik **OK**. Windows beder måske om genstart – genstart PC’en.

### Trin C: Opdater WSL (i PowerShell som administrator)

1. Åbn **Start-menuen**, højreklik på **Windows PowerShell** eller **Terminal**.
2. Vælg **Kør som administrator**.
3. Kør:

```powershell
wsl --update
```

4. Luk og start **Docker Desktop** igen.

---

## Løsning 2: Tving Docker til at bruge WSL 2

1. Åbn **Docker Desktop** (selv om den fejler).
2. Gå til **Indstillinger** (Settings) – tandhjulet.
3. Under **General**: sæt **"Use the WSL 2 based engine"** til **ON** (hvis den findes).
4. Klik **Apply & Restart**.

---

## Løsning 3: Genstart alt

1. **Luk Docker Desktop** helt (højreklik på ikonet i systembakken → Quit).
2. **Genstart PC’en**.
3. Start **Docker Desktop** igen og vent 1–2 minutter.

---

## Hvis det stadig ikke virker

- **Opdater Docker Desktop** til nyeste version fra [docker.com](https://www.docker.com/products/docker-desktop/).
- Tjek at du er **administrator** på PC’en (nogle virksomheds-PC’er begrænser det).
- Søg på **"Docker Desktop Virtualization support not detected but enabled"** – der er mange tråde med løsninger til forskellige PC’er.
