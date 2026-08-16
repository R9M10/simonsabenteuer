# Simons Abenteuer – Schuhladen / Amsif / Void / Gandhi Reward v31

## Ausgangsbasis
Direkt vor der Änderung erneut aus GitHub geprüft:
- `game.js`: `d6bf414e5ae34ee70be40dbd8d616e6aaa67e42e`
- `index.html`: `320cd0f4e653ea68463dad3f64b714ffbf50c173`

Die aktuelle `simon-ui-v34.js?v=34`-Erweiterung der parallelen Repository-Arbeit bleibt erhalten.

## 1. Für-sich-sein-Void
Der `← ZURÜCK`-Button sitzt jetzt unten links und berücksichtigt iPhone-Safe-Areas.

## 2. Buchzitate
Die Zitatbox ist jetzt ein eigener DOM-Layer mit `z-index: 400500`.
Damit liegt sie vor:
- dem aktiven Fähigkeitssymbol,
- Phaser-HUD,
- Canvas-Effekten.

Sie bleibt 10 Sekunden sichtbar. Die bestehende v34-Quote-Erweiterung kann den neuen DOM-Banner gefahrlos ignorieren, weil sie nur Phaser-Banner mit `active/list` nachbearbeitet.

## 3. Dark Gandhi Reward
Beim endgültigen Sieg über Dark Gandhi werden automatisch **300 Coins** gutgeschrieben.
Im Developer Mode bleibt die Coin-Anzeige unendlich; die +300-Animation wird trotzdem angezeigt.

## 4. Neuer Schuhladen
Direkt rechts neben Orell Füssli steht jetzt dauerhaft ein arcadeartiger Schuhladen:
- dunkle Fassade,
- cyan-/magenta Neonrahmen,
- pulsierende Leuchtreklame,
- Pixel-Schuhe in den Fenstern.

Er ist immer vorhanden – völlig unabhängig davon, ob Gandhi bereits erschienen oder besiegt wurde.

Für ihn gelten dieselben Weltinteraktionsregeln wie für Der Inder/Orell:
- nur am Boden anklickbar,
- kein Wurmloch-Fall-through,
- nicht während Kämpfen/Dialogen/Modals,
- Fassaden-Hitbox endet oberhalb der Touch-Steuerung.

Beim Anklicken erscheint:
`Schuhladen geschlossen.`
mit `ZURÜCK`.

## 5. Amsif
Beim ersten `ZURÜCK` aus dem geschlossenen Schuhladen kommt Amsif von rechts auf die Map und bleibt anschließend vor dem Laden stehen.

Aussehen:
- männliche, Middle-Eastern-inspirierte Arcade-Figur,
- dunkles Haar/Bart,
- grün-türkise Jacke,
- rot-gold gemusterter Schal,
- Name `AMSIF` permanent über dem Kopf.

### Erster Dialog
- `Dich kenn ich doch!`
- `Mir hend mal Fuessball gspielt und ich han falschi Schueh kha!`

Danach:
- `AMSIFS GESCHICHTE HÖREN`
- `WEITER`

Bei `WEITER` läuft das Spiel normal weiter. Amsif bleibt stehen und anklickbar; sein Menü bietet weiterhin Geschichte/Weiter.

### Geschichte
Die komplette vorgegebene Sequenz wurde unverändert eingebaut, inklusive Simons Frage nach dem Général.

Nach Abschluss endet die Sequenz ohne weiteres Popup.
Klickt man Amsif danach erneut an, erscheinen:
- `AMSIF DEN SCHLÜSSEL GEBEN` – sichtbar, aber deaktiviert
- `ZURÜCK`

Es wird noch kein Schlüssel erfunden oder vergeben.

## Sequenz-/Stabilitätsschutz
- Amsif startet pro Spielstand nur einmal.
- `EncounterStarted`, `IntroCompleted` und `StoryCompleted` werden durch Tramfahrten mitgenommen.
- Storyzustände sind monoton: `StoryCompleted` impliziert automatisch `IntroCompleted` und `EncounterStarted`.
- Ein abgebrochener Scene-/Tween-Callback besitzt einen Recovery-Pfad.
- Während Amsif ankommt oder spricht sind Stores, Tram und Items entsprechend gesperrt.
- Amsif wird bei späteren Bahnhofstrasse-Besuchen automatisch wieder vor dem Schuhladen aufgebaut.
- Der Dialog-zu-Menü-Übergang hat zusätzlich 620 ms Same-Tap-Schutz, damit der letzte Dialogtap nicht sofort eine Menüoption auslöst.
- Gandhi-Story und Amsif-Story besitzen keine gegenseitige Fortschrittsbedingung.

## Dateien ersetzen
- `game.js`
- `index.html`

## Cache
- `game.js?v=31`

## Tests
- `node --check game.js` – PASS
- Void-Zurückbutton unten links / Safe Area – PASS
- Zitat-DOM-Layer > 300000 – PASS
- 10-Sekunden-Zitat-Timer – PASS
- Dark Gandhi +300 Coins – PASS
- Schuhladen startet Amsif ohne Gandhi-Abhängigkeit – PASS
- wiederholtes Schuhladen-Zurück startet Amsif nicht doppelt – PASS
- beide Introzeilen in korrekter Reihenfolge – PASS
- komplette Amsif-Geschichte = 10 Schritte – PASS
- Simons Général-Frage ist Sprecher `simon` – PASS
- Story endet sauber in `amsifStoryCompleted` – PASS
- aktuelle `simon-ui-v34.js`-Einbindung bleibt erhalten – PASS
