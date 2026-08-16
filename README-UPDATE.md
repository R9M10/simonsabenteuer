# Simons Abenteuer – v27

## Änderungen

### Zigaretten
- Eine Zigarette gibt 20 Sekunden Sprint.
- Weitere Zigaretten addieren 20 Sekunden auf die verbleibende Sprintzeit.
- 3 Zigaretten = 60 Sekunden Sprint.
- Sprintgeschwindigkeit bleibt unverändert bei +75 %.

### Dark Gandhi
Dark Gandhi behält seine drei Phasen und Fähigkeiten, ist aber deutlich fairer.

Jede Phase:
- exakt 3 erfolgreiche Treffer von Simon
- normaler Schlag weiterhin 10 Schaden
- mindestens 4,5 Sekunden sichtbare Phasendauer

Gesamt:
- Phase 1: 3 Treffer
- Phase 2: 3 Treffer
- Phase 3: 3 Treffer
- insgesamt 9 Treffer

Balancing:
- Salzmarsch: 2 statt 3 Salzhügel, Geschwindigkeit 82/92 statt 132/144/156
- Salz: 5 Schaden, Slow nur noch 1 Sekunde
- Stock: 6 Schaden, längerer Abstand
- Karma: langsamere Kugel, längere Vorwarnung, 6 Schaden
- Wiedergeburt: langsamere Schatten, 4 Schaden
- Nuclear: 1,55 Sekunden Vorwarnung, kleinerer Radius, 12 Schaden
- Ahimsa: 1,8 Sekunden, reflektiert 5 Schaden
- Dark Gandhi bewegt sich in allen Phasen langsamer
- Spezialangriffe treten seltener auf
- Ahimsa entzieht Gandhi nicht mehr automatisch HP, damit auch Phase 3 exakt 3 Treffer braucht

### Developer Mode
Neues Ziel:
`3. ENDE MILCHMANN`

Start:
- Bahnhofstrasse
- Milchmann liegt besiegt am Boden und ist noch plünderbar
- Milchwagen steht noch da
- Simon startet vollständig rechts von Der Inder
- Gandhi-Story ist freigeschaltet
- Simon muss Der Inder danach komplett von rechts nach links passieren

### Milchwagen
Nach dem Plündern werden Milchmann und Milchwagen gemeinsam nach 30 Sekunden entfernt.

### Bösewichte
Inventar-Tabs:
- GEGENSTÄNDE
- FÄHIGKEITEN
- BÖSEWICHTE

Nach dem jeweiligen Sieg:
- Milchmann
- Dark Gandhi

Jeder Eintrag besitzt einen `i`-Button mit einer kurzen Beschreibung.

## Dateien ersetzen
- `game.js`
- `index.html`
- `script.js`

## Cache
- `game.js?v=27`
- `script.js?v=12`

## Tests
- `node --check game.js`
- `node --check script.js`
- Runtime-Test: exakt 3 Treffer pro Dark-Gandhi-Phase
- Runtime-Test: Phase 1 -> Phase 2 -> Phase 3 -> Niederlage
- Runtime-Test: Developer-Checkpoint Ende Milchmann
- Runtime-Test: 3 Zigaretten addieren sich auf 60 Sekunden
- statische Prüfung der Bösewichte-Bibliothek
- statische Prüfung der Script-Reihenfolge und Developer-UI
