# Simons Abenteuer – Dark Gandhi + Sprach-/Stabilitätsupdate v24

Direkt vor der Änderung wurde der aktuelle GitHub-Stand geprüft:

- `game.js`: `cfc6f2f2fff260eb8607d8edfe939eb3ff3ed651`
- `index.html`: `a7c6a6510da4edc4cff1fce5d541c7e37120c863`
- `hive-expansion.js`: `b9f89ac568cb0954cb0e72a7a897ddf95c25f98f` (v14.2)
- `game-polish-v15.js`: `e51362977085d3167e40d3e93612546ebbb8bf1e`

Die Dateien deiner Freundin werden **nicht überschrieben**. Für die gewünschte
HIVE-Sprache gibt es deshalb die kleine zusätzliche Datei
`hive-language-patch-v16.js`.

## Hochdeutsch

Allgemeine Menüs und Systemtexte sind jetzt Hochdeutsch.

Bewusst unverändert bleiben Dialoge, die ausdrücklich vorgegeben wurden,
darunter:
- der Startdialog,
- Türsteher-/Löwen-Dialoge,
- Milchmann-Dialoge,
- Schweizerdeutscher Dialog mit der Frau an der Bar.

Frau an der Bar:
- Titel: `FRAU AN DER BAR`
- Text: `Was soll Simon machen?`
- Button: `ANSPRECHEN`
- Simon: `Hey Süessi, willsch tanze?`

## Stabilität beim Hin- und Herfahren

Mehrfachfahrten wurden zusätzlich gehärtet:
- neuer Visit-Token für jede Bahnhofstrasse-Ankunft,
- nur noch genau ein eigener Pointer-Handler pro Scene-Lauf,
- alte Handler werden beim Shutdown entfernt,
- Physik wird bei jedem Scene-Start explizit fortgesetzt,
- Camera-FX werden vor jeder Ankunft zurückgesetzt,
- Tramwechsel haben einen `__tramSwitching`-Guard,
- beide Richtungen wechseln die Scene deterministisch per Timer statt auf
  wiederverwendete Camera-Fade-Events zu vertrauen,
- Simon/Body/Controls werden nach jeder Bahnhofstrasse-Ankunft explizit
  normalisiert.

## Gandhi -> Dark Gandhi

Der bekannte Gandhi-Storypunkt wird wieder auf dem aktuellen v22-Stand
aufgebaut. Nach dem Milchmann startet er beim nächsten echten Vorbeilaufen
am Inder.

Nach `NUKE GANDHI`:
1. Bombe fällt.
2. Explosion / Schockwelle / Rauch.
3. Gandhi liegt kurz scheinbar tot am Boden.
4. Er steht als **Dark Gandhi** wieder auf:
   - schwarze Kleidung,
   - rote Augen,
   - dunkler Stab.
5. Bosskampf beginnt mit **300 HP** und exakter Healthbar über ihm.

### Phase 1 – Salzmarsch (300–201 HP)
- Dark Gandhi verfolgt Simon.
- Nahbereich: Stockschlag, 10 Schaden.
- `SALZMARSCH`: drei Salzhaufen rasen über den Boden.
- Salzkontakt: 8 Schaden + 1,8 Sekunden deutliche Verlangsamung.

### Phase 2 – Karma (200–101 HP)
Zusätzlich zu Phase 1:
- **Karmische Vergeltung**: Jeder dritte erfolgreiche Treffer Simons erzeugt
  nach kurzer Verzögerung ein Karma-Projektil zurück auf Simon (12 Schaden).
- **Rad der Wiedergeburt**: Drei dunkle Gandhi-Schatten kreisen um den Boss.
  Berührt Simon einen Schatten, nimmt er 8 Schaden.

### Phase 3 – NUCLEAR LEVEL: MAX (100–0 HP)
Zusätzlich:
- regelmäßig roter `NUCLEAR`-Zielkreis an Simons Position,
- nach kurzer Vorwarnung Explosion, 25 Schaden im Radius,
- **AHIMSA INVERSION**:
  - für 3 Sekunden schadet ein Schlag gegen Gandhi stattdessen Simon,
  - während Simon nicht angreift, verliert Dark Gandhi selbst kontinuierlich HP.

Bei 0 HP fällt Dark Gandhi endgültig um und der Storypunkt ist abgeschlossen.

## Dateien hochladen

Ersetze / ergänze:
- `game.js`
- `index.html`
- `hive-language-patch-v16.js`

Nicht ersetzen:
- `hive-expansion.js`
- `game-polish-v15.js`
- `flight-intro.js`
- `animation-fix.js`

## Cache

- `game.js?v=24`
- `hive-language-patch-v16.js?v=16`
