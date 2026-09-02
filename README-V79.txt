SIMONS ABENTEUER — FIX v79

Enthaltene Dateien:
- index.html
- bugfix-v79.js

Upload:
Beide Dateien in den Hauptordner des GitHub-Repositories hochladen.
index.html ersetzt die vorhandene Datei. bugfix-v79.js ist neu.

Fixes:
1. Orell Füssli / Kassiererin
   - Der zweite Orell-Besuch führt zum zweiten Story-/Gedankenblock.
   - Enrique ist dafür keine Voraussetzung mehr.
   - Enriques echter Story-Status wird dabei nicht verändert.

2. Simons WG-Zimmer
   - Zusätzlicher stabiler Interaktionsbereich auf Simons Tür.
   - Zimmer wird über den globalen Phaser SceneManager gestartet,
     während der WG-Flur pausiert erhalten bleibt.
   - Auch die Rückkehr Zimmer -> Flur hat einen Failsafe.

3. Milchmann
   - Kommt genau einmal: nach dem ersten Orell-Besuch.
   - Ein globaler Laufzeit-Progress merkt sich das Ereignis auch dann,
     wenn BahnhofquaiScene bei einer späteren Tramfahrt neu initialisiert wird.
   - Spätere Orell-Besuche können den Milchmann nicht erneut starten.
