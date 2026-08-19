# Milchbuck – Reference Scene Art Brief v1

Milchbuck ist die Referenzszene, an der der endgültige Look von **Simons Abenteuer** festgezogen wird. Erst wenn diese Szene visuell sitzt, werden Bahnhofstrasse, Oerlikon, ETH und Venedig im selben System produziert.

## Zielbild

Ein klar lesbares, humorvolles Zürich als handgemachte 2D-Pixelwelt: glaubwürdig genug, dass der Ort nach Zürich wirkt, aber bewusst vereinfacht und leicht überzeichnet. Helle Tagesstimmung mit alpiner Luft und etwas Dunst in der Ferne. Nicht fotorealistisch, nicht düster, nicht generische Fantasy-Pixelart.

Der HIVE ist der bewusste Kontrast: dunkler, urbaner, violett/cyanes Clublicht. Er darf auffallen, ohne wie ein Asset aus einem anderen Spiel zu wirken.

## Szenenlogik

Die Welt bleibt **3000 × 390** Game-Pixel breit/hoch. Die Bodenlinie bleibt **y = 338**.

Der aktuelle Aufbau wird beibehalten:
- links: Milchbuck-Haltestelle / Tram / Ticketautomat
- ab ca. x=900: Übergang in Zürcher Stadtraum
- um x=1575: HIVE-Fassade
- weiter rechts: Stadtfortsetzung

Interaktionen bleiben unsichtbare Phaser-Hitboxen. Die Grafik enthält keine eingebauten Klickflächen.

## Nur 10 Kern-Assets

### A. Gemeinsame Zürich-Basis

1. `art-zurich-sky-v62.png`
   - 1280 × 338
   - undurchsichtig
   - Layer: Sky
   - Scroll factor ca. 0.12
   - Himmel + sehr weiche pixelige Wolken; keine Gebäude

2. `art-zurich-far-v62.png`
   - 1536 × 338
   - transparent
   - Layer: Far
   - Scroll factor ca. 0.25
   - entfernte grüne Hügel, Baumlinie, dezente Zürich-Silhouette

3. `art-zurich-mid-v62.png`
   - 2048 × 338
   - transparent
   - Layer: Mid
   - Scroll factor ca. 0.50
   - zusammenhängende Zürcher Häuser-/Dachsilhouette; keine spielrelevanten Türen

4. `art-zurich-ground-tile-v62.png`
   - 512 × 92
   - undurchsichtig / nahtlos horizontal kachelbar
   - Layer: World
   - Straße, Gleise, Pflasterkante und begehbarer Vorderboden
   - Oberkante entspricht in der Szene y=298, Boden ab y=338

5. `art-zurich-tree-set-v62.png`
   - transparentes Sprite-/Prop-Sheet
   - 4 Baumvarianten + 3 kleinere Buschvarianten
   - gemeinsame Stamm-/Laub-Pixelgröße
   - wiederverwendbar in Milchbuck, HB und Oerlikon

6. `art-zurich-street-props-v62.png`
   - transparentes Prop-Sheet
   - Straßenlampe, Oberleitungsmast, Bank, Mülleimer, kleines Geländer
   - keine Beschriftungen fest in kleine Props rendern

### B. Milchbuck-Signature-Assets

7. `art-milchbuck-stop-v62.png`
   - ca. 900 × 220, transparent
   - Layer: World / Props Back
   - Haltestellenunterstand, Grünbereich, MILCHBUCK-Schild, Uhr
   - ohne Tram und ohne Ticketautomat
   - links/rechts so offen halten, dass Ground Tile darunter durchlaufen kann

8. `art-vbz-tram-v62.png`
   - ca. 240 × 130, transparent
   - Layer: Props Back
   - stilisierte blau-weiße Zürcher Tram
   - klar lesbare Türen/Fenster, aber keine Mikrodetails
   - Interaktionshitbox bleibt separat

9. `art-ticket-machine-v62.png`
   - ca. 64 × 110, transparent
   - Layer: Props Back
   - vereinfachter Zürcher Ticketautomat
   - gut lesbar neben Simon, nicht fotorealistisch

10. `art-hive-exterior-v62.png`
   - ca. 300 × 240, transparent
   - Layer: World
   - dunkle urbane Clubfassade
   - HIVE-Schild darf Teil des Assets sein
   - Akzente violett/cyan/magenta, restliche Palette bleibt an Zürich gekoppelt
   - Türbereich klar lesbar und nicht durch Vordergrunddetails verdecken

## Figuren

Simon wird **nicht** neu gestaltet. Das bestehende Simon-Design ist die Maßstabsreferenz.

Der Türsteher wird separat behandelt. Bevor wir ihn neu produzieren, wird geprüft, ob das vorhandene `bouncer-spritesheet-v12.png` stilistisch bereits genügt. Wir erzeugen keinen neuen NPC nur weil im ursprünglichen `game.js` noch eine prozedurale Platzhalterfigur steht.

## Größen-/Stilregeln

- Pixelkanten hart, `image-rendering: pixelated`
- kein Antialiasing
- keine Foto-Texturen
- Konturen dunkelbraun/dunkelnavy statt tiefschwarz
- Licht grundsätzlich links oben
- Far-Palette weniger kontrastreich als Gameplay-Ebene
- Mid-Palette etwas kräftiger
- Props/Characters stärkster lokaler Kontrast
- keine Texte in Background-Layern, außer ortsfeste echte Schilder
- kleine lesbare UI-Texte weiterhin im Code, nicht in Bilddateien

## Warum diese Aufteilung

Die bisherige Szene zeichnet Himmel, Hügel, Stadt, Haltestelle, Tram, Gleise, Lampen, Bäume und HIVE einzeln mit Phaser-Graphics. Das ist funktional, aber jede spätere Szene entwickelt dadurch ihren eigenen visuellen Dialekt.

Mit dieser Aufteilung werden nur vier Assets wirklich Milchbuck-spezifisch. Die übrigen sechs bilden die erste Zürich-Bibliothek und können in mehreren Orten erneut benutzt werden.

## Einbau-Reihenfolge

1. Sky + Far + Mid parallel zur aktuellen Welt einbauen und vergleichen.
2. Ground Tile ersetzen.
3. Milchbuck Stop einsetzen.
4. Tram + Ticketautomat ersetzen, Hitboxen unverändert lassen.
5. HIVE-Fassade ersetzen.
6. gemeinsame Trees/Street Props einsetzen.
7. erst dann alte prozedurale Grafikobjekte für die ersetzten Teile entfernen.
8. finale Stilabnahme; danach gilt Milchbuck als Referenz für alle weiteren Szenen.
