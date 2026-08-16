SIMONS ABENTEUER – v34 BUGFIX DROP-IN

Einbau:
1. ZIP entpacken.
2. ALLE Dateien in den Repository-Hauptordner ziehen.
3. index.html ersetzen.
4. simon-ui-v34.js + beide v34-PNGs hinzufügen.
5. Hard Reload.

WICHTIG:
- simon-ui-v33.js darf im Repository liegen bleiben.
- Die neue index.html lädt v33 NICHT mehr.
- v34 ersetzt v33 vollständig.

Fixes:
1. ITEMS / Inventar wieder funktionsfähig:
   v33 und v30 wrappten openItemsModal gegenseitig immer wieder.
   v34 wrappt openItemsModal überhaupt nicht mehr.
2. Inder:
   - 15 px höher (top 95 statt 110)
   - Pose-Wechsel 650 ms statt 330 ms
   - vorhandene Hintergrund-/Sprite-Assets bleiben identisch
3. Mädchen:
   - ungeflippt schaut sie links
   - geflippt schaut sie rechts
   - Simon rechts => flip
   - Simon links => kein flip

Erhalten:
- Locker in Milchbuck und Bahnhofstrasse
- gemeinsamer Locker-Inhalt
- Auto-Hotbar bei neu gekauften Items/Büchern
- größere Buchzitat-Infobox
- Inder-Hintergrund und echte Sprite-Posen
- v32 HIVE-Dialog/Stabilitätsfixes
- game.js v30 / aktuelle Combat-Änderungen
