# Simons Abenteuer – Developer Mode + Bahnhofquai/HB

Diese Version basiert auf dem **aktuellen GitHub-Stand** vor dieser Änderung.

Verifiziert wurden dabei unter anderem:

- `game.js`: `ef683ee1a63d5c93ea3e738978f318a1c9e5f29f`
- `index.html`: `a2f289426ed701083a4d22a531213918b4e56f54`
- `script.js`: `364683dbdb414ea8f23219531a2a4e8e595915a0`
- `animation-fix.js`: `0dd16d6b163e0d1b059961ae005c1bf676b70cd0`

## Dateien ersetzen

- `game.js`
- `animation-fix.js`
- `index.html`
- `script.js`

`style.css` und die übrigen Dateien bleiben unangetastet.

## Developer Mode

Nach START erscheint jetzt zuerst ein eigener Developer-Mode-Bildschirm.

Standard: `AUS`

- AUS + WEITER → normales Spiel, beginnend mit der ersten Dialogszene.
- AN + WEITER → Developer-Menü.

Aktuelle Sprungziele:

1. `ZUR LÖWENAUSWAHL`
   - startet direkt vor dem HIVE bei der Auswahl `JA / NEIN / KÄMPFEN`
   - die besiegten Türsteher liegen bereits auf der Straße und bleiben anklickbar

2. `BAHNHOFQUAI / HB`
   - startet direkt die neue Tram-Ankunft am Hauptbahnhof

3. `NORMALER START`

Der Developer Mode ist absichtlich leicht wieder entfernbar:
In `script.js` kann `DEVELOPER_GATE_ENABLED` einfach auf `false` gesetzt werden.
Die zugehörigen HTML/CSS-Blöcke in `index.html` sind zusätzlich mit
`DEVELOPER MODE START/END` markiert.

## Neue Szene: Bahnhofquai / HB

Nach der normalen Tramfahrt aus Milchbuck geht es jetzt wirklich weiter zur
Haltestelle `BAHNHOFQUAI / HB`.

- links: arcadeartiger Zürcher Hauptbahnhof als feste Begrenzung
- Mitte: Tramhaltestelle Bahnhofquai / HB
- rechts: Beginn der Bahnhofstrasse mit Zürcher Häuserzeile, Schaufenstern,
  Bäumen und Straßenraum
- aktuell noch keine neuen Interaktionen

### Ankunft

- Szene fadet aus Milchbuck ein
- Tram rollt in die Haltestelle
- Tür öffnet sich
- Simon steigt sichtbar aus und geht auf den Bahnsteig
- danach werden Touch-Steuerung und freie Bewegung wieder freigegeben

Coins, HP und das gekaufte Ticket werden in die neue Szene übernommen.

## Animation-Fix

`animation-fix.js` ist jetzt v10 und überwacht sowohl `MilchbuckScene` als auch
`BahnhofquaiScene`, damit die bestehende Sprungdarstellung auch nach dem
Szenenwechsel erhalten bleibt.
