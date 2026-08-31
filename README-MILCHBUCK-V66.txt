SIMONS ABENTEUER — MILCHBUCK V66
================================

Upload:
- index.html                (ersetzen)
- milchbuck-v66.js          (neu)

flight-intro.js ist unverändert zu v65/v17 und muss nicht erneut ersetzt werden.

WAS V66 ÄNDERT
--------------
1. Milchbuck ist wieder dichter: kontinuierliche Wohn-/Gewerbefassaden,
   schmale Hinterhofgassen, Service-Türen, Poster, Lüftung, Fahrräder und
   urbane Ecken. HIVE bleibt die einzige relevante/interaktive Destination.

2. Parallax ist weiterhin real/manuell, aber subtiler als v65:
   Sky 0.06 / Clouds 0.12 / Far Hills 0.24 / Near Hills 0.36 /
   Far City 0.56 / Mid City 0.74 / Street 1.00.

3. Kein HIVE-Relocation-System mehr. Die stabilen Basispositionen bleiben:
   HIVE x≈1575 / Tür x=1700 / Türsteher x=1780.

4. Lion-Facing bleibt bewegungsbasiert, damit Lauf-/Sprungsequenzen nicht
   rückwärts dargestellt werden.

5. Code-Cleanup: hive-location-v65.js + world-stability-v65.js +
   milchbuck-polish-v65.js werden in index.html NICHT mehr geladen.
   Ihre nötigen Funktionen sind in milchbuck-v66.js konsolidiert.

TEST NACH UPLOAD
----------------
- Normaler Start / Flugzeug
- Station -> HIVE komplett laufen
- Sichtbare aber ruhigere Parallax-Bewegung
- Türsteher-Dialog
- Löwensequenz JA und KÄMPFEN
- HIVE betreten/verlassen
- Tram / Ticketautomat

Fail-open: Die fünf reinen Visual-Factories fallen bei einem Fehler auf die
vorherige game.js-Implementierung zurück, statt den Start zu blockieren.
