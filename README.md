# Kollegiale Rollenwahl

Digitale Widerstandsabfrage für ein Plenum mit 22 Personen.

## Setup

1. Firebase Realtime Database anlegen (Blaze- oder Spark-Plan)
2. `.env` Datei erstellen (siehe `.env.example`) und Firebase-Konfiguration einfügen
3. Firebase-Regeln setzen (Lesen + Schreiben offen für alle, da kein Login):
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```

## Lokale Entwicklung

```bash
npm install
npm run dev
```

## Deployment (Vercel / Netlify)

```bash
npm run build
```
Build-Ordner: `dist/`  
Umgebungsvariablen aus `.env` im Deployment-Dashboard eintragen.

## Ansichten

- `/` — Teilnehmer:innen-Ansicht (Smartphone)
- `/moderation` — Moderations-Ansicht (Laptop)

## Anonymität

Stimmen werden als anonyme Push-Keys gespeichert (`/rollenwahl/{roleId}/votes/{pushKey}`).  
Nur ein lokaler `localStorage`-Flag verhindert Doppelabstimmungen auf demselben Gerät.
