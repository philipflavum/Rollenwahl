# Kollegiale Rollenwahl

Digitale Widerstandsabfrage für ein Plenum. Anonym, Echtzeit, mobil-optimiert.

---

## Architektur-Überblick

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser                               │
│                                                              │
│   /moderation              /                                 │
│   ┌──────────────┐         ┌──────────────────────────┐      │
│   │ Moderator-   │         │ Teilnehmer-Ansicht        │      │
│   │ Ansicht      │         │                          │      │
│   │              │         │  1. Wartescreen          │      │
│   │ - Kandidaten │         │  2. Stimmzettel          │      │
│   │   verwalten  │         │     (Slider 0–10)        │      │
│   │ - Abstimmung │         │  3. Bestätigungsscreen   │      │
│   │   öffnen/    │         │                          │      │
│   │   schliessen │         │  Kein Login, anonym      │      │
│   │ - Ergebnisse │         └──────────────────────────┘      │
│   │ - QR-Code    │                                           │
│   └──────────────┘                                           │
│          │                          │                        │
│          └─────────┬────────────────┘                        │
│                    │                                         │
│           useRoles (React Hook)                              │
│           ┌─────────────────────┐                            │
│           │ - onValue Listener  │  ← Echtzeit-Updates        │
│           │ - setStatus()       │  → öffnen / schliessen     │
│           │ - submitVote()      │  → anonym via push()       │
│           │ - addCandidate()    │  → spontan hinzufügen      │
│           │ - removeCandidate() │  → entfernen               │
│           │ - getResults()      │  ← Auswertung              │
│           └─────────────────────┘                            │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│              Firebase Realtime Database                      │
│                                                              │
│  rollenwahl/                                                 │
│  ├── gastgeberin/                                            │
│  │   ├── status: "setup" | "open" | "closed"                │
│  │   ├── voteCount: 7          ← atomares increment()       │
│  │   ├── candidates/                                        │
│  │   │   ├── -Nabc: { name: "Anjli", type: "fremd" }        │
│  │   │   └── -Nxyz: { name: "Fiona", type: "fremd" }        │
│  │   └── votes/                                             │
│  │       ├── -Naaa: { Anjli: 3, Fiona: 7, ... }  ← anonym  │
│  │       └── -Nbbb: { Anjli: 1, Fiona: 4, ... }  ← anonym  │
│  ├── dokumentarin/  ...                                      │
│  ├── lernbegleitung/ ...                                     │
│  └── moderation/ ...                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Dateistruktur

```
src/
├── main.jsx              Einstiegspunkt, React Router
├── App.jsx               Routing: / und /moderation
├── index.css             Design-System (CSS-Variablen)
├── firebase.js           Firebase-Initialisierung via .env
│
├── data/
│   └── roles.js          Rollen, Kandidaten, Plenum (22 Namen)
│
├── lib/
│   ├── logic.js          Reine Logik-Funktionen (testbar)
│   └── logic.test.js     18 Unit-Tests mit Vitest
│
├── hooks/
│   └── useRoles.js       Firebase-Datenzugriff (React Hook)
│
├── views/
│   ├── ModeratorView.jsx  Moderations-Ansicht
│   └── ParticipantView.jsx Teilnehmer-Ansicht
│
└── components/
    └── BallotForm.jsx     Stimmzettel-Formular (Slider 0–10)
```

---

## Anonymität — wie es funktioniert

```
Teilnehmer gibt Stimme ab:
  { Anjli: 3, Fiona: 7, Isabel: 2 }
         ↓
  firebase.push('/rollenwahl/gastgeberin/votes', ballot)
         ↓
  Gespeichert als zufälliger Push-Key: -Nabc123
  Kein Name, keine IP, kein Gerät gespeichert.
         ↓
  Lokaler Flag: localStorage["voted_gastgeberin"] = "yes"
  → verhindert Doppelabstimmung auf demselben Gerät

Moderation sieht nur:
  Anjli: 47 Punkte total  (nie: wer hat was gegeben)
  Fiona: 31 Punkte total
```

---

## Gewinner-Logik (Gleichstand)

```
Beispiel Moderation (2 Plätze), 5 Kandidierende:
  Nicolas: 12 Pkt  ← Platz 1 ✓
  Lea:     18 Pkt  ← Platz 2 ✓
  Fiona:   18 Pkt  ← Gleichstand auf Platz 2 → auch gewählt ✓
  Isabel:  25 Pkt
  Michel:  31 Pkt

→ 3 Gewinner, weil Gleichstand an der Grenze
→ Moderation entscheidet im Plenum wie weiter
```

---

## Tests ausführen

```bash
npm test         # einmalig, zeigt Ergebnis
npm run test:ui  # interaktive Oberfläche im Browser
```

### Getestete Szenarien (18 Tests)

| Bereich | Test |
|---|---|
| `aggregateVotes` | Korrekte Summierung über mehrere Stimmen |
| `aggregateVotes` | Einzelne Stimme |
| `aggregateVotes` | Leere Eingabe |
| `aggregateVotes` | Extremwerte 0 und 10 |
| `aggregateVotes` | 22 gleichzeitige Stimmen |
| `getWinners` 1 Platz | Kandidat:in mit wenigsten Punkten gewinnt |
| `getWinners` 1 Platz | Gleichstand → alle Gleichstehenden |
| `getWinners` 1 Platz | Leere Stimmen → leeres Ergebnis |
| `getWinners` 1 Platz | Weniger Kandidierende als Plätze |
| `getWinners` 2 Plätze | Top 2 werden korrekt gewählt |
| `getWinners` 2 Plätze | Dreifach-Gleichstand auf Platz 2 |
| `getWinners` 2 Plätze | Dreifach-Gleichstand auf Platz 1 |
| `rankCandidates` | Aufsteigende Sortierung |
| `rankCandidates` | Leere Eingabe |
| `average` | Korrekte Berechnung |
| `average` | Kein Division-durch-0-Fehler |
| `average` | Korrekte Rundung |
| Anonymität | Ergebnis enthält keine Wähler:innen-Namen |

---

## Setup

```bash
# 1. Dependencies installieren
npm install

# 2. Firebase-Konfiguration eintragen
cp .env.example .env
# → .env mit deinen Firebase-Werten befüllen

# 3. Lokal starten
npm run dev
# Teilnehmer:  http://localhost:5173
# Moderation:  http://localhost:5173/moderation

# 4. Testen
npm test
```

---

## Deployment (Vercel)

1. Repo auf GitHub pushen
2. Auf vercel.com → "New Project" → GitHub-Repo wählen
3. Environment Variables eintragen (alle `VITE_FIREBASE_*` aus `.env`)
4. Deploy — `vercel.json` sorgt dafür dass `/moderation` korrekt funktioniert
