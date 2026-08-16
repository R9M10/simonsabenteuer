# Simons Abenteuer – Fähigkeiten / Zofingia / Langstrecke v33

## Aktueller Repository-Stand vor der Änderung
- `game.js`: `6d32558647e4824b29b1e6e43b9b07b6a158ec25`
- `index.html`: `a03c18ae8accd05278da70df45c9e843922cec22`

Im Repository lagen bereits die neueren Drop-in-Dateien `simon-ui-v36.js`,
`hive-language-patch-v19.js` und `opening-scene-v17.css`. Die neue index.html
aktiviert diese jetzt entsprechend der vorhandenen v36-Dokumentation.

## 1. Fähigkeiten im Spiel
- Fähigkeitskarten im Menü behalten das neue kohärente Design.
- Der eigentliche Ingame-Fähigkeitsbutton ist wieder **rund** und kleiner als J/X.
- Er verwendet den bereits bewährten `makeTouchButton`-Inputpfad und ist daher direkt anklickbar.
- Ewige Wiederkehr: `ZEIT / −3s`.
- Für sich sein: `VOID / BEREIT` bzw. `VOID / m:ss`.
- Wurmloch bleibt wie bisher eine kontextuelle Luft-Fähigkeit und benötigt keinen separaten Button.

## 2. Zigarette
Die Zigarette liegt weitere 7 px tiefer als zuvor und bleibt links/rechts korrekt gespiegelt.

## 3. Bewegung während Gesprächen
Bei den Overworld-Sprechblasendialogen kann Simon weiterhin nach links/rechts laufen.
Springen, Schlagen, Läden und andere Interaktionen bleiben während des Dialogs gesperrt.
Touch-Links/Rechts bleibt dabei sichtbar.

## 4. Amsif
- `Bösewicht` ist im Dialog großgeschrieben.
- Die vorherigen Korrekturen bleiben erhalten: `Schueh`, `Himmel`, statisches Namensschild und Position neben dem Schuhladen.

## 5. Zitate
- keine große schwarze Box mehr
- nur Text + Textschatten im obersten DOM-Layer
- Dauer: 7 Sekunden
- Playbook bleibt ohne Zitat

## 6. Langstreckenticket / Zofingia
Die bestehende Zofingia-Implementierung aus `simon-ui-v36.js` wird jetzt aktiviert.
Sobald Simon das Zofingia-Clubhaus zum ersten Mal betritt:

`LANGSTRECKENTICKETS FREIGESCHALTET!`

erscheint oben für 7 Sekunden.

Danach zeigt ausschließlich der Ticketautomat an Bahnhofstrasse/HB zusätzlich:
- `LANGSTRECKENTICKET · 1 FAHRT`
- Preis `150.-`

Vor dem Zofingia-Besuch ist diese Kaufoption nicht sichtbar.

Mit gekauftem Langstreckenticket bietet die Tram an Bahnhofstrasse zusätzlich:
- `VENEDIG`

Bei Venedig:
- Langstreckenticket wird verbraucht
- Simon steigt ein
- Tram fährt nach links
- Bildschirm blendet schwarz aus
- `window.__SIMON_PENDING_DESTINATION__ = "venice"`
- der komplette relevante Spielstand liegt in `window.__SIMON_PENDING_TRAVEL_STATE__`

Damit kann die nächste Venedig-Sequenz direkt an diesen Übergabepunkt angeschlossen werden.

## 7. Developer Mode
`ENDE MILCHMANN` zerstört die Bahnhofstrasse-Tram nicht mehr.
Zusätzlich repariert `ensureDeveloperTramReady()` die echte Tram an Developer-Checkpoints,
sobald die Bahnhofstrasse spielbar ist. Dadurch kann man aus Dev Mode normal weiterreisen,
Zofingia betreten, Langstrecke freischalten und Venedig testen.

## Weiterhin erhalten
- 5-Sekunden-Despawn nach Plünderung
- Amsif neben dem Schuhladen
- aktuelles Dark-Gandhi-System
- aktuelle v36 Zofingia/HIVE-Spielbarkeit

## Dateien ersetzen
- `game.js`
- `index.html`

Die von der neuen index.html referenzierten Dateien `simon-ui-v36.js`,
`hive-language-patch-v19.js` und `opening-scene-v17.css` liegen bereits im aktuellen Repository.

## Tests
- `node --check game.js` – PASS
- Runde Ability-Buttons: Callback für ZEIT – PASS
- Runde Ability-Buttons: Callback für VOID – PASS
- Gesprächsbewegung links/rechts – PASS
- Zofingia-Unlock genau einmal / 7 s – PASS
- Langstreckenticket kostet 150 – PASS
- Long-ticket-only Tram zeigt Venedig – PASS
- Venedig-Abfahrt fährt nach links / Fade-to-black / State-Handoff – PASS
- Developer-Tram wird erzeugt/geparkt/interaktiv – PASS
- 5-Sekunden-Despawn – PASS
- Zitat-/Unlock-Notice ohne Box – PASS
