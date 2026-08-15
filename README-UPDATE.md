# Simons Abenteuer – Tram, HIVE-Zurück, HIT/KO

Diese Version basiert auf der aktuellsten `game.js` aus dem Repository
(Blob `e1a6ac0e14c9c5d670daefd70f2030ed75ad67dc`).

Bitte diese drei Dateien ersetzen:

- `game.js`
- `animation-fix.js`
- `index.html`

Andere Dateien – insbesondere die zuletzt geänderten Dialog-Assets und
`dialog-fix.css` – bleiben unverändert.

## Neu

### Tram nach Ticketkauf

Nach einem erfolgreichen Ticketkauf:

- blinkt ein weißer Punkt an der Tram,
- die Tram wird anklickbar,
- Simon kann einsteigen,
- Simon läuft kurz zur Tram und verschwindet im Wagen,
- die Tram fährt ein Stück nach rechts,
- danach blendet der Bildschirm schwarz aus,
- anschließend startet die vorbereitete `NextScenePlaceholder`-Szene.

Diese leere Folgeszene ist absichtlich nur ein Platzhalter für den nächsten
Entwicklungsschritt.

### HIVE

Beim Tanzen mit dem Löwen gibt es oben links einen robusten nativen Button:

`← STRASSE`

Damit kommt Simon wieder aus dem HIVE auf die Straße. Der Löwe bleibt im Club.

### HIT und KO

Die bislang zusammen verwendeten Endframes des Spritesheets wurden getrennt:

- Frames `26–28`: `simon-hit`
- Frames `29–31`: `simon-ko`

Bei einem Löwentreffer spielt Simon jetzt die HIT-Sequenz.
Beim K.O. spielt er die KO-Sequenz, bevor das Spiel neu startet.

`animation-fix.js` wurde auf v9 aktualisiert, damit die bestehende
Sprungkorrektur HIT und KO nicht überschreibt.

### Cache

`index.html` lädt `game.js?v=9` und `animation-fix.js?v=9`, damit das iPhone
nicht versehentlich die alte gecachte JavaScript-Version verwendet.
