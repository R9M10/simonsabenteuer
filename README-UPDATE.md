# Simons Abenteuer – UI / Alignment / Despawn v32

## Aktueller GitHub-Stand
Direkt vor der Änderung geprüft:
- `game.js`: `6d32558647e4824b29b1e6e43b9b07b6a158ec25`
- `index.html`: `a03c18ae8accd05278da70df45c9e843922cec22`
- `opening-scene-v15.css`: `63705d1b20499548e21ac6e5cadc6712cfa0ec78`
- aktuelles Repository lädt bereits `simon-ui-v35.js?v=35`; diese Änderung bleibt erhalten.

## Änderungen

### Fähigkeiten-UI
- Fähigkeitskarten sind jetzt pro Fähigkeit visuell zusammenhängend gestaltet statt mit einem generischen lila Button.
- Wurmloch: Cyan/Violett-Weltraumstil.
- Ewige Wiederkehr: Gold/Zeit-Stil.
- Für sich sein: dunkler Void/Stahl-Stil.
- `AUSRÜSTEN` / `AUSGERÜSTET` ist in das Kartendesign integriert.
- Der Touch-Aktionsbutton wurde ebenfalls neu gestaltet: ein kompakter Arcade-Panel-Button statt eines willkürlichen W/F-Kreises.
- Ewige Wiederkehr zeigt `ZEIT / −3 SEK.`.
- Für sich sein zeigt `VOID / BEREIT` bzw. den Countdown direkt im Panel.
- Tastatursteuerung W/F bleibt unverändert.

### Anfangssequenz
- Neue `opening-scene-v16.css`.
- Sprechblase wird über ihre Mitte positioniert statt über die linke Kante.
- Mittelpunkt bei 50,5 %, Tail ebenfalls mittig; dadurch sitzt die Blase direkt über Benjamin statt deutlich rechts davon.

### Despawn
- Geplünderte Figuren verschwinden nach **5 Sekunden** statt 30.
- Gilt für Türsteher, Dark Gandhi und Milchmann.
- Der Milchwagen verschwindet weiterhin gemeinsam mit dem Milchmann.
- Auch der gemeinsame Default für zukünftige plünderbare Figuren ist 5 Sekunden.

### Amsif
- `Schuher` → `Schueh`.
- `Himmel` wird im letzten Satz großgeschrieben.
- Sein Namensschild ist jetzt ein separates, nicht gespiegeltes Displayobjekt. Amsif kann sich drehen, `AMSIF` bleibt immer normal lesbar und waagerecht.
- Amsif steht jetzt bei x=2494 rechts **neben** dem Schuhladen. Seine Hitbox beginnt erst nach dem Ende der Schuhladen-Fassade, sodass Amsif- und Ladenklick nicht mehr räumlich überlappen.

### Rauchen / Trinken
- Neue gemeinsame Mundposition anhand von Simons tatsächlicher Sprite-Größe.
- Monster und Gatorade werden aus Handhöhe zum Mund geführt; der Flaschenwinkel wird für links/rechts korrekt gespiegelt.
- Die Zigarette sitzt direkt auf Mundhöhe.
- Die Zigarette selbst wird für Simons Blickrichtung gespiegelt, sodass Filter und Glut immer auf der richtigen Seite liegen.
- Rauch entsteht jetzt an der Glut statt hinter Simons Kopf.

## Dateien hochladen
- `game.js`
- `index.html`
- `opening-scene-v16.css` (neu)

`opening-scene-v15.css` kann im Repository bleiben; die neue index lädt v16.

## Cache
- `game.js?v=32`
- `opening-scene-v16.css?v=16`

## Tests
- `node --check game.js` – PASS
- Default-Lootdespawn = 5000 ms – PASS
- Mundanker links/rechts symmetrisch – PASS
- Amsif dreht sich, Namensschild bleibt Scale 1 / Winkel 0 – PASS
- Amsif-Hitbox liegt vollständig außerhalb der Schuhladen-Fassade – PASS
- keine 30000-ms-Lootdespawns mehr – PASS
- aktuelle `simon-ui-v35.js?v=35`-Integration bleibt erhalten – PASS
