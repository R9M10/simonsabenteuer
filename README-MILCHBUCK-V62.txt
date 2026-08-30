SIMONS ABENTEUER — MILCHBUCK SCENE ART v62
============================================

Basis:
- aktueller Repository-Stand main / Scene Art Foundation v61
- Viewport 820 x 390
- Bodenlinie y = 338
- bestehende Gameplay-, Story-, Ticket-, Tram- und HIVE-Logik bleibt erhalten

INSTALLATION
------------
1. ZIP entpacken.
2. Den INHALT des ZIP in den Hauptordner des GitHub-Repositories hochladen.
3. Vorhandene script.js ersetzen.
4. scene-art-v62.js und den Ordner assets/v62 neu hinzufügen.
5. game.js, scene-art-v61.js und die übrigen bestehenden Dateien NICHT löschen.

WAS v62 ÄNDERT
--------------
- Milchbuck verwendet echte PNG-Layer statt der alten sichtbaren Phaser-Platzhalter:
  Sky / Far / Milchbuck Mid / Ground / Haltestelle / Tram / Ticketautomat / HIVE.
- Gemeinsame v61-Layer-Registry bleibt aktiv.
- Interaktionsflächen bleiben Code-Hitboxen und werden nicht in die Bilder eingebrannt.
- Die Tram bleibt die bestehende this.tram-Instanz, sodass die bestehende Abfahrtsanimation weiter funktioniert.
- HIVE folgt dem AKTUELLEN Repository-Layout aus v57 (nach links versetzt), nicht dem älteren x≈1575-Art-Brief.
- Die alte prozedurale createWorld()-Grafik bleibt aus Sicherheits-/Historiengründen in game.js vorhanden, wird für Milchbuck aber nicht mehr aufgerufen.

AUSGEWÄHLTE GRAFIKEN
--------------------
- Sky: ChatGPT Image 29. Aug. 2026, 17_45_12 -> art-zurich-sky-v62.png
- Far: ChatGPT Image 29. Aug. 2026, 17_50_28 -> art-zurich-far-v62.png
- Milchbuck Mid: ChatGPT Image 29. Aug. 2026, 17_55_30 -> art-milchbuck-mid-v62.png
  Auswahlgrund: links offen/grün, nach rechts zunehmend urban — entspricht dem vereinbarten Milchbuck-Brief.
- Ground: tram-ground links, transition in der Mitte, city-ground rechts.
- Haltestelle, VBZ-Tram, Ticketautomat und HIVE: die gelieferten Einzelassets wurden auf Produktionsmaße normalisiert.

ZUORDNUNG DER ANDEREN MID-LAYER FÜR SPÄTER
------------------------------------------
- Pixel-Kulisse mit Zürcher Stadtdächern: am stärksten Bahnhofstrasse/HB (dicht, historisch, urban).
- Pixelart-Wohnhügel von Zürich: am stärksten Salersteig/Oerlikon (Wohnhügel, mehr Grün, ruhigere Wohnbebauung).
- Zürcher Wohnviertel mit üppigem Grün / 18_00_42: alternative Wohnquartier-Kulisse; für Milchbuck v62 nicht benötigt.

ABSICHTLICH NOCH NICHT MIGRIERT
-------------------------------
- Oerlikon/WG-Haus
- Bahnhofstrasse/HB Mid
- Salersteig/Oerlikon Mid
- Baum-Spritesheets mit großflächigem Export-Hintergrund/Halo
- Character-Pass / Bouncer-Pass

TEST NACH DEM UPLOAD
--------------------
1. Normalen Start bis Milchbuck spielen.
2. Ticketautomat öffnen und Ticket kaufen.
3. Prüfen, ob Tram-Marker erscheint und Tram anklickbar wird.
4. Tram nach Bahnhofstrasse starten; die Tram muss weiterhin nach rechts ausfahren.
5. HIVE/Türsteher-Story testen. HIVE muss beim aktuellen v57-Stand links vom alten Standort liegen.
6. Rückkehr nach Milchbuck testen.

Bei einem fehlenden oder falsch dimensionierten v62-Asset zeigt die Szene bewusst einen
"MILCHBUCK V62 ASSET-FEHLER" statt kurz alte Platzhaltergrafik einzublenden.
