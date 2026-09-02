SIMONS ABENTEUER — BUGFIX v76

BASIS
GitHub main beim Start dieses Updates:
58cc065d26fa0ac9d778231a515e9f5b92937136

DIESES UPDATE ÄNDERT NICHT GITHUB.
ZIP direkt ins Repository-Root hochladen / vorhandene index.html ersetzen.

FIXES

1. DER INDER
- wieder ausschließlich der alte v37-Laden und v37-Verkäufer
- beide Bilder werden bereits im HTML vorab geladen
- JavaScript wartet zusätzlich auf vollständiges Image.decode()
- Simon bleibt solange auf der Straße sichtbar
- ERST wenn beide Bilder fertig sind, wird der komplette Laden atomar eingeblendet
- kein prozeduraler Zwischenraum / kein unsichtbarer Simon mehr

2. SCHUHLADEN GESCHLOSSEN
- dunkles Panel statt hellem Beige
- heller Text
- pinker Rand / zum restlichen Arcade-Schuhladen passend

3. ENRIQUE
- nur der Text "KLICK · ANSPRECHEN" wird ausgeblendet
- Enrique selbst, Name, Hitbox und Dialog bleiben unangetastet

4. GANDHI
- der dunkle 132×22-Nuke-Scorch wurde als eigentlicher "Schatten" identifiziert
- beim Dark-Gandhi-Revival / Bossstart wird er zerstört
- tote Referenz wird aus gandhiExplosionObjects entfernt

5. ALBERT EINSTEIN
- eth-campus-v59 skaliert Simon beim Sprechen von 0.42 auf 0.52 und wieder zurück
- diese Skalierung verursachte das sichtbare Hochspringen/Fallen
- im ETH-Innenraum bleibt Simon jetzt bei 0.42
- während Einstein-Dialog/Quiz bleibt zusätzlich seine Fußposition stabil

6. ORELL / POLYTERRASSE
- der bisherige künstlich nachgebaute Textzettel wird ersetzt
- verwendet jetzt das tatsächlich hochgeladene handschriftliche Foto
- nur zugeschnitten / leicht kontrastiert / auf eine Papierkarte gesetzt
- Inhalt der Handschrift wurde NICHT ersetzt oder neu formuliert

7. AMSIF
- defensiv nochmals abgesichert: ausschließlich prozeduraler Platzhalter
- alte gecachte v69/v71/v75-Sprites werden zerstört, falls Browsercache sie noch hält

DATEIEN
- index.html
- bugfix-v76.js
- orell-original-note-v76.png
- README-V76.txt
