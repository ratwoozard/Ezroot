# Antagelser og åbne spørgsmål

## Antagelser (markeret i hele docs)

- **Geokodning:** Nominatim er tilstrækkelig for MVP. Evt. Danmarks Adresser eller anden kilde kan tilføjes i V1. ANTAGELSE.
- **Told/priser:** MVP understøtter ikke præcise takster for broer/told; kun "undgå toll" via routing-profil hvor GraphHopper understøtter det. ANTAGELSE.
- **Lavemissionszoner:** OSM-tags bruges hvor tilgængelige; ellers vises generisk advarsel eller placeholder i UI. ANTAGELSE.
- **Legal route:** "Lovlig rute" defineres som rute der overholder alle *kendte* OSM-restriktioner; manglende data betyder best-effort og advarsel. ANTAGELSE.
- **Connection pooling:** Backend sætter `SET LOCAL app.current_org_id` pr. request på den forbindelse der bruges til queries; pooling er kompatibel (session variabel er connection-local). ANTAGELSE.
- **PDF-eksport:** MVP kan levere enkel rutebeskrivelse (tekst/placeholder); fuld print-layout i V1. ANTAGELSE.
- **Nominatim:** Selv-hostet instans med Redis-cache og throttling; vi undgår at overbelaste offentlig Nominatim. ANTAGELSE.

## Åbne spørgsmål (minimale)

1. **Refresh token:** MVP bruger kun access token med evt. længere levetid; refresh token flow kan tilføjes i V1. Åbent: om klient kræver refresh før release.
2. **Geografisk scope ved launch:** DK-only vs. DK + nabolande vs. EU – afhænger af første kunde; dokumenteret som valgbar i data-pipeline.
3. **Rate limit tal:** 100 req/min per token er anført; endelige tal fastlægges ved go-live (kan justeres ud fra load).
4. **Export file retention:** Hvor længe gemmes eksporterede filer (file_url)? Forslag: 24 timer; derefter cleanup job. Skal fastlægges i V1.

Resten er lukket ved binding decisions (ADR / API-kontrakter).
