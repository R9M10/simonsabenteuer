# Simons Abenteuer – stabiler UI-Fix

Diese Version wurde auf Basis der aktuellsten `game.js` aus dem Repository erstellt.

## Grundlegende Änderung

Die Menü- und Entscheidungsbuttons benutzen jetzt ein **einheitliches natives HTML-UI-System** über dem Phaser-Canvas.

Damit werden nicht mehr einzelne problematische Phaser-Textobjekte als Buttons verwendet.

Das neue System wird jetzt für folgende Menüs verwendet:

- Löwe: `JA / NEIN / KÄMPFEN`
- Türsteher ausrauben: `JA / NEIN / ZURÜCK`
- Ticketautomat: `← ZURÜCK / KAUFEN`
- ITEMS-Menü: `X` und Ticket-Ausrüstung

Jeder Button unterstützt abgesichert:

- `touchend`
- `pointerup`
- `click`
- Schutz vor Mehrfachauslösung eines einzigen iPhone-Taps
- große Touchflächen
- keine Weitergabe des Taps an den Phaser-Canvas

Damit gibt es für zukünftige Menüs jetzt **eine einzige Button-Implementierung**, statt für jedes Menü eine andere Sonderlösung.

## Zusätzlich behoben

- Simon war beim gemeinsamen Tanz im HIVE nicht sichtbar, weil sein Dance-Sprite an Weltkoordinaten hing, während die Kamera noch beim HIVE stand.
- Sein Dance-Sprite ist jetzt kamera-fixiert und Bestandteil des HIVE-Overlays.
- Der Löwe und Simon werden gemeinsam über dem Club-Hintergrund gerendert.

## Wichtig

Nur `game.js` ersetzen.

Die zwischenzeitlichen Änderungen an `animation-fix.js`, `index.html`, `dialog-fix.css` und dem neuen Simon-Dialogbild bleiben unangetastet.
