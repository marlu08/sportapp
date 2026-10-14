# Sportapp

Persönlicher Trainings-Tracker für Marcel (Gym, Laufen, Dehnen) als PWA. UI auf Deutsch.

## Struktur
- `index.html` – die ganze App: CSS, HTML, Vanilla JS. Kein Framework, kein Build, keine Dependencies. Bleibt eine Datei.
- `manifest.json`, `sw.js`, `icon.svg` – PWA (Home-Screen-App auf iPhone, offline).
- `test.js` – Logik-Test mit DOM-Stub: `node test.js index.html` → muss `ALL OK` ausgeben. Nach jeder Änderung laufen lassen und bei neuen Features erweitern.

## Datenmodell (localStorage, Key `sportapp`, Objekt `S`)
- `gymPlans[]` → `groups[]` (Muskelgruppe) → `exercises[]` `{name, variants[]}` (z.B. Schrägbankdrücken → Langhantel, Kurzhantel, Maschine, Smith Machine)
- `lastSets` keyed `"Übung · Variante"` → letzte Sätze `[{kg,reps}]`
- `activeWorkout {plan (Kopie), sets}`, `rest {end|left}`, `restSec`, `sr` (laufende Dehnroutine)
- `runPlans[]`, `stretchRoutines[] {steps[{name,seconds}]}`, `plan{ 'YYYY-MM-DD': [{type,name}] }` (Kalender), `log[] {type,date,name}` (Monatszähler); Gym-Einträge zusätzlich `sets[{g,e,v,kg,reps}]` (g=Muskelgruppe, e=Übung, v=Variante) → Quelle für Statistik. Einträge vor Okt 2026 haben kein `sets`, darum immer `l.sets||[]`.
- Statistik (`stats()`): Sätze pro Übung (inkl. 0 für Planübungen) + Kraft pro Muskelgruppe: Dropdown wählt Übung·Variante (`statSel`, nicht gespeichert), Linie = Ø aller Sätze pro Workout (Epley-1RM, ohne kg = Wdh) relativ zum ersten Mal (100 %), dazu schwerster Satz. Workout-Datum (`activeWorkout.date`) ist im Workout einstellbar.
- `screen` + `edit` werden mitgespeichert → Reload landet auf derselben Seite.
- Strukturänderung am Datenmodell: in `load()` migrieren (aktuell: alte String-Übungen → Pläne auf Default zurücksetzen).

## Konventionen
- Navigation: `go(screen, edit)` → `render()` → Screen-Funktion gibt HTML-String zurück. Inline `onclick` mit Indizes, Text immer durch `esc()`.
- Timer rechnen mit `Date.now()`-Differenz, nie mit Tick-Zählung. Nur `#tb-time` / `#sr-time` werden im Tick aktualisiert, kein Voll-Render.
- Design: schwarz, graue Buttons (`.p` = Primär), keine grünen Akzente. Startseite = Emoji-Ring. Menü ☰ oben rechts fest.
- Minimal halten (ponytail): kein Feature ohne Anfrage, keine Abstraktion für einen Fall.

## Deploy
- Repo: https://github.com/marlu08/sportapp (public). Push auf `main` = Deploy.
- GitHub Pages: https://marlu08.github.io/sportapp/ (Source: branch main, root). Einmalig in den Repo-Settings aktivieren.
- Lokal testen: `open index.html` (Safari Responsive Design Mode, 390px). Der gstack-Browse-Daemon stirbt auf diesem Mac mit Exit 137, daher `test.js` statt Screenshots.
