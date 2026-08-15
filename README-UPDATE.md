# Simons Abenteuer – Bahnhofstrasse/HB + Der Inder

Diese Änderung wurde auf Basis der unmittelbar zuvor aus GitHub gelesenen
aktuellen Version erstellt.

Verifizierte Ausgangs-Blobs:

- `game.js`: `9e6cf2e15c16dfdd0b413d11c4e883ccade5ef7f`
- `index.html`: `5dedcbd0cee1a9baec2ead0a3fd49f23dc6a708b`
- `script.js`: `039f3ab8e7127a8bd145e23e7be069d00a181df0`
- `animation-fix.js`: `fa867f55cf726be98c9cdecae59eb952ebb18b14`

Damit bleiben die zwischenzeitlichen Änderungen der anderen Bearbeiterin erhalten.

## Dateien ersetzen

Nur:

- `game.js`
- `index.html`

## Änderungen

### Station

Die sichtbare Station heißt jetzt:

`BAHNHOFSTRASSE/HB`

Der komplette Name steht in **einem einzigen blauen Haltestellenschild**.
Die separate weiße `/ HB`-Tafel wurde entfernt.

Auch das Developer-Menü nennt das Sprungziel jetzt
`BAHNHOFSTRASSE / HB`.

### Der Inder

Direkt rechts neben der Haltestelle steht ein kleiner Laden:

`DER INDER`

Die Fassade ist warm, arcadeartig und mit ornamentalen Farbbändern,
Schaufenstern und Gemüseauslage gestaltet. Vor dem Laden liegen u.a.
Auberginen, grüne Gemüse/Chilis, Tomaten und kleine Gewürzsäcke.

Die gesamte Ladenfassade ist großzügig anklickbar.

Beim Anklicken:

`Betreten?`

mit:

- `JA`
- `NEIN`

### Innenraum

Bei `JA` geht Simon in den Laden.

Dort:

- steht ein indischer Verkäufer hinter dem Tresen,
- er sagt in einer Sprechblase `Guter Kunde, Guter Kunde`,
- am Tresen gibt es den robusten Button `EINKAUFEN`,
- oben links gibt es jederzeit `← STRASSE`.

### Einkaufen

`EINKAUFEN` öffnet bereits ein erstes Item-Fenster mit leeren Slots.
Die eigentlichen kaufbaren Items bauen wir später aus.

Im Einkaufsfenster gibt es:

- `← LADEN`
- `STRASSE`

Dadurch gibt es sowohl aus dem Laden als auch direkt aus dem Item-Fenster
immer einen zuverlässigen Weg zurück auf die Straße.

Alle neuen Menübuttons verwenden wieder das bereits etablierte native
HTML-Button-System über Phaser, damit die iPhone-Touchbedienung stabil bleibt.

`index.html` lädt die neue `game.js` als `game.js?v=11`, um iPhone-Caching
der alten Spiellogik zu vermeiden.
