# Simons Abenteuer – Scene Art Contract v1

Dieses Dokument ist ab v61 der verbindliche Grafikvertrag für neue und ersetzte Spielgrafiken.

## 1. Grundregel

Eine finale Grafik **ersetzt** ihren Platzhalter. Sie wird nicht als zweites sichtbares System über eine alte Phaser-Zeichnung gelegt.

Historische prozedurale Platzhalter dürfen während der Migration im Code bleiben, werden aber für migrierte Assets nicht mehr erzeugt.

## 2. Feste Spielgeometrie

- Viewport: **820 × 390 Game-Pixel**
- Gemeinsame Bodenlinie für klassische Side-Scroll-Szenen: **y = 338**
- Die Weltbreite ist szenenabhängig und darf variieren.
- Pixel-Art wird ohne Glättung dargestellt.
- Vollbild-/Szenenlayer werden nicht stillschweigend verzerrt. Falsche Exportgrößen sollen sichtbar als Produktionsfehler auffallen.

## 3. Sechs sichtbare Designebenen

Jede Außenszene wird gestalterisch aus denselben sechs Ebenen gedacht:

1. **Sky** – Himmel, Licht, Sonne/Mond, sehr entfernte Wolken
2. **Far** – Skyline, Berge, entfernte Dächer und Baumkronen
3. **Mid** – Häuserreihen, große Bäume, mittlere Architektur
4. **World** – begehbare Welt: Straße, Gehweg, Gleise, Mauern, Hauptfassaden
5. **Actors & Props** – Simon, NPCs, Türen, Automaten, Bänke, Schilder, kleine Objekte
6. **Foreground** – Äste, Geländer, Pflanzen, Pfosten oder Effekte vor den Figuren

Technisch wird Ebene 5 weiter in Props hinten / Player / NPC / Props vorne getrennt. Interaktionsflächen und UI sind eigene technische Ebenen und gehören nicht in die Grafikexporte.

## 4. Verbindliche Depths

| Slot | Depth |
| --- | ---: |
| Sky | -34 |
| Far | -24 |
| Mid | -12 |
| World | 0 |
| Props Back | 5 |
| Player | 10 |
| NPC | 12 |
| Props Front | 15 |
| Foreground | 20 |
| Interaction | 150 |
| UI | 300 |

Bestehende Objekte werden bei der Migration zunächst nur registriert. Ihre Depth wird nicht automatisch verändert.

## 5. Dateiformate

### Statische Umgebung
- PNG
- Transparenz nur, wenn der Layer sie wirklich benötigt
- keine JPG-Artefakte
- keine weichgezeichneten Kanten

### Einzelobjekte
- PNG mit transparentem Hintergrund
- möglichst enge Bounding Box
- sinnvoller Ankerpunkt am unteren Mittelpunkt

### Animierte Figuren
- transparentes PNG-Spritesheet
- alle Frames exakt gleich groß
- Framegröße wird im Asset-Manifest fest definiert
- keine unterschiedlich skalierten Frames innerhalb einer Animation

### Dialoggrafiken
- separate Assets, nicht hochskalierte Gameplay-Sprites
- pro Figur einheitliche Canvasgröße und Perspektive

## 6. Stil

- stilisierte handgemachte 2D-Pixel-Art
- klare Pixelkanten, kein Antialiasing
- grafische, gut lesbare Silhouetten
- mittlerer Detailgrad
- leicht warme, eher gedämpfte Grundpalette
- kräftigere Akzentfarben nur gezielt
- dunkle Konturen bevorzugt in dunklem Braun/Navy statt reinem Schwarz
- konsistente Lichtlogik: grundsätzlich links oben
- Architektur darf vereinfacht und leicht überzeichnet sein
- reale Orte sollen wiedererkennbar bleiben, aber wie dieselbe Spielwelt wirken
- keine Mischung aus weich gemalter Illustration und hartem Pixel-Sprite

## 7. Asset-Lifecycle

Neue finale Assets folgen immer demselben Ablauf:

1. Asset im zentralen Manifest registrieren.
2. Vor der Szene bzw. vor der Interaktion preloaden.
3. Erst nach erfolgreichem Laden die Szene sichtbar aufbauen.
4. Platzhalter für das migrierte Element nicht mehr erzeugen.
5. Interaktionen/Hitboxen getrennt von der Grafik halten.
6. Im Development Mode fehlende Assets klar melden; im normalen Spiel keine alten „Knochen“ als Fallback aufblitzen lassen.

## 8. Naming

Empfohlenes Schema:

- `art-<ort>-<rolle>-vNN.png`
- `art-<figur>-sprites-vNN.png`
- Texture-Key: `art-<ort>-<rolle>-vNN`

Beispiele:

- `art-milchbuck-sky-v62.png`
- `art-milchbuck-mid-v62.png`
- `art-zurich-bench-01-v62.png`
- `art-inder-shop-v61.png`
- `art-inder-seller-v61`

## 9. Produktionsreihenfolge

1. Grafikfundament + echter Asset-Ersatz
2. Milchbuck als Referenzszene
3. gemeinsame Zürich-Asset-Library
4. Bahnhofstrasse / HB / Inder / Orell
5. Innenräume
6. Oerlikon / WG / ETH
7. Venedig / Italien
8. Character Pass für verbleibende Platzhalter-NPCs

Der Stil wird nach der fertigen Milchbuck-Referenzszene eingefroren. Danach werden neue Szenen aus demselben System abgeleitet statt jedes Mal neu erfunden.
