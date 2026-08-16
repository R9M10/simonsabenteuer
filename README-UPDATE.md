# Simons Abenteuer – Venedig Background / Stazione Venezia v35

## Basis
Diese Version baut auf der zuletzt geprüften `simonsabenteuer-markers-enrique-v34.zip` auf.

## Neu
1. **Neue spielbare Szene: Venedig**
   - Simon kommt mit der Tram an der Station **Stazione Venezia** an.
   - Aussteige-Animation wie an Bahnhofstrasse/HB.
   - Danach frei begehbar.

2. **Venedig-Background mit mehreren Ebenen**
   - Himmel in mehreren Farbbändern
   - ferne Lagune / Palazzi / Campanile / Kuppel
   - mittlere Wasser- und Stadt-Ebene
   - Bahnhofsbereich mit Endstation, Bahnsteig und begrenzten Oberleitungen
   - Vordergrund-Promenade und Kanalrand

3. **Endstation-Logik**
   - Tram-Infrastruktur befindet sich nur im Bereich des Bahnhofs.
   - Keine Oberleitungen / Schienen durch die gesamte Stadt.

4. **Bahnhofsobjekte in Venedig**
   - Ticketautomat
   - Schliessfach
   - beide mit weißen Interaktionspunkten direkt **auf** dem Objekt

5. **Ticketautomat in Venedig**
   - verkauft **Langstreckentickets** für **150.-**
   - mit gültigem Langstreckenticket kann Simon an der Tram **Bahnhofstrasse/HB** als Ziel wählen

6. **Weiße Punkte überarbeitet**
   - Ticketautomaten in Milchbuck und Bahnhofstrasse/HB: Punkt jetzt auf dem Automaten statt darüber
   - Schliessfach-Marker aus `progression-markers-v38.js`: tiefer auf dem Objekt
   - geplünderte Türsteher / Milchmann / Gandhi: Marker nun auf dem Körper statt darüber

## Dateien
- `game.js` ersetzen
- `index.html` ersetzen
- `progression-markers-v38.js` ersetzen
- `venice-scene-v39.js` neu hinzufügen
