# UX-specifikation

## Skærme (MVP)

- **Login:** Felter e-mail, password; knap "Log ind". Link til "Opret konto" (register).
- **Registrering:** Org-navn, bruger navn, e-mail, password; opretter org + admin-bruger.
- **Dashboard:** Kort (MapLibre) med tile-baggrund; formular til rute (startadresse, måladresse, vælg køretøjsprofil, Beregn). Under kort: rute-linje og evt. trin-liste; afstand og varighed. Knapper: Gem rute, Eksport (GPX/PDF).
- **Køretøjsprofiler:** Liste (tabel) med eksisterende profiler; "Ny profil" formular (navn, længde, bredde, højde, vægt, aksler, farligt gods). Inline validering.
- **Gemte ruter:** Liste med navn, destination, dato; knapper Åbn, Slet, Eksport. Tom state: "Ingen gemte ruter".
- **Gemte steder:** Liste med navn, adresse; Slet. Tom state: "Ingen gemte steder".
- **Eksport:** Modal eller side: vælg format (GPX/PDF), start job; vis status og link til fil når klar.

## States

- **Empty:** Ved ingen gemte ruter/steder vis tydelig besked ("Ingen gemte ruter" / "Ingen gemte steder") og evt. call-to-action.
- **Loading:** Ved beregn rute: spinner eller disabled "Beregn"-knap; ved kort: placeholder eller skeleton indtil tiles og rute er loadet.
- **Error:** Geokodning fejler: banner "Kunne ikke finde adresse" og markér felt; flere forslag: dropdown. Rute ikke fundet: dialog "Ingen lovlig rute fundet. Prøv at fjerne restriktioner eller vælg anden profil." API-fejl: generisk fejlbesked med evt. error_code fra ErrorResponse.
- **Success:** Rute beregnet: vis linje på kort og afstand/varighed; mulighed for at gemme.

## Disclaimer og attribution

- **Kort:** I kortets hjørne (fx nederst): "Kortdata © OpenStreetMap contributors (ODbL)".
- **Rute/eksport:** Tydelig tekst: "Ruteberegneren er kun vejledende. Kun officielle trafikskilte er juridisk bindende. Vi kan ikke garantere, at alle lokale restriktioner er dækket."
- Placeres så den er synlig ved rutevisning og ved PDF-eksport (fx fod eller sidefod).

## Design-system

- Ét UI-bibliotek (MUI eller Chakra) konsekvent; standard komponenter (knapper, formularer, alerts).
- Farver: fx blå til primær/marker; rød til advarsler; neutral til baggrund.
- Responsivt: formular over kort på små skærme; mobil-optimering kan være fase 2.

## Guardrails

- Ingen kopiering af PTV's UI, tekster eller ikoner. Layout og flows er originale.
