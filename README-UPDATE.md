# Simons Abenteuer – Interaktionspunkte / Enrique-Gate v34

## Basis: direkt vor der Änderung erneut geprüft
- aktuelles GitHub `game.js`: `c43e8177faa6904021b849992d6b8caa57acf236`
- aktuelle GitHub `index.html`: `fe39fe83cf8f93513168881efae12150383aa71e`
- aktuelles Zusatz-UI: `simon-ui-v37.js?v=37`
- aktuelle Opening Scene: `opening-scene-v18.css?v=18`

Die Änderungen aus v37 bleiben erhalten.

## 1. Weiße Interaktionspunkte
Der gleiche weiße, pulsierende 6px-Punkt wie bei der Tram wird jetzt verwendet für:
- Ticketautomat am Milchbuck
- Ticketautomat Bahnhofstrasse/HB
- Schließfach/Locker am Milchbuck
- Schließfach/Locker Bahnhofstrasse/HB
- jeden besiegten Türsteher, solange er noch plünderbar ist
- Dark Gandhi, solange sein Körper noch plünderbar ist
- wiederhergestellten Dark-Gandhi-Körper nach einer Tramfahrt
- Milchmann, solange er noch plünderbar ist

Sobald eine Leiche geplündert wurde und ihr 5-Sekunden-Despawn beginnt, wird der weiße Punkt sofort entfernt.

`createPulsingInteractionMarker()` ist ein gemeinsamer Helfer, sodass künftige plünderbare Figuren denselben Stil verwenden können.

## 2. Neue Gandhi-Bedingung
Dark-Gandhi/Gandhi-Story verlangt jetzt zusätzlich ein echtes Gespräch mit Enrique.

Es zählt erst als Gespräch, wenn Simon bei Enrique mindestens eine der eigentlichen Gesprächsoptionen auswählt:
- `WER BISCH DU?`
- `FLIRT LERNE`
- `NACH MOBUTO FRAGE`

Nur Enriques Menü zu öffnen und `ZURÜCK` zu drücken zählt nicht.

Beim ersten echten Gespräch wird ein eventuell bereits vor Enrique absolvierter Gang am Indischen Laden verworfen. Danach muss Simon Zofingia verlassen und **erneut** vollständig am Indischen Laden vorbeilaufen. Erst dann kann Gandhi erscheinen.

Reihenfolge damit:
1. Milchmann besiegen
2. mit Enrique sprechen
3. Zofingia verlassen
4. danach Der Inder vollständig durchqueren
5. Gandhi darf erscheinen

Während Zofingia geöffnet ist, wird der unsichtbare Overworld-Simon ausdrücklich nicht für die Pass-Erkennung benutzt.

`enriqueSpoken` wird bei Tramfahrten mitgeführt, damit die Story nicht durch einen Szenenwechsel zurückgesetzt wird.

## 3. Zigarette
Die Zigarette sitzt nochmals 6 Pixel tiefer als in v33:
- vorher `mouth.y + 7`
- jetzt `mouth.y + 13`

Blickrichtung, Filter-/Glutseite und Rauchursprung bleiben unverändert korrekt.

## Dateien hochladen
- `game.js` ersetzen
- `index.html` ersetzen
- `progression-markers-v38.js` neu hinzufügen

## Cache
- `game.js?v=34`
- `progression-markers-v38.js?v=38`

## Tests
- `node --check game.js` – PASS
- `node --check progression-markers-v38.js` – PASS
- weißer Marker: 6px / weiß / 520ms Puls wie Tram – PASS
- Marker-Cleanup beim Loot – PASS
- Gandhi vor Enrique trotz altem Pass blockiert – PASS
- Enrique-Gespräch setzt Fortschritt und verwirft alten Pass – PASS
- Zofingia kann Pass nicht im Hintergrund triggern – PASS
- erst echter post-Enrique-Durchgang an Der Inder startet Gandhi – PASS
- Enrique `ZURÜCK` zählt nicht als Gespräch – PASS
- Locker-Marker Milchbuck/Bahnhof werden über v37-Locker erzeugt – PASS
- aktuelles v37 / Opening v18 / HIVE v19 in index erhalten – PASS
