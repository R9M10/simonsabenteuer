SIMONS ABENTEUER – CRITICAL FIXES v56

BASIS
Neuester GitHub-main beim Start dieses Fixes:
76b78382aa7015d74dc649300f060d37cc137eea

Dieser Patch ersetzt NICHT game.js.
Er ersetzt nur die geladenen v55 ETH/Stability-Patches und ergänzt zwei kleine
v56-Systeme für Denkblasen und Developer Mode.

DATEIEN
- index.html
- eth-campus-v56.js
- world-stability-v56.js
- thought-language-v56.js
- developer-mode-v56.js
- README-v56.txt

============================================================
1. POLYBAHN – POSITION + STORY LOCK
============================================================

Gefundene reale Koordinaten im aktuellen Spiel:
- Ticketautomat Bahnhofstrasse: x=740, Hitbox 66 px
- Locker v37 Bahnhofstrasse: x≈996
- Polybahn v55: x≈1078 (rechts auf/bei Locker)

v56:
- Polybahn liegt LINKS vom Locker:
  x≈878
- Polybahn-Hitbox: 64 px
- Abstand zum Ticketautomaten: ca. 73 px
- Abstand zum Locker: ca. 40+ px
- Visual, Hitbox und Marker benutzen exakt denselben Mittelpunkt.

Story-Lock:
Vor dem zweiten Orell/Kassiererin-Schritt (WEITSICHT-Hinweis):
- POLY ist sichtbar, aber leicht gedimmt
- kein Marker
- kein Hand-Cursor
- Hitbox deaktiviert
- Klick macht GAR NICHTS
- keine Erklärung / keine Denkblase

Nach Abschluss des WEITSICHT-Hinweises:
- Polybahn wird voll sichtbar
- Marker erscheint
- Hitbox wird aktiv

Developer Mode umgeht diesen Lock absichtlich.

============================================================
2. SIMON DENKT SCHWEIZERDEUTSCH
============================================================

thought-language-v56.js verändert nur INNEREN MONOLOG.
Gesprochener Dialog wird nicht pauschal verändert.

Beispiele:
"Wow… die isch aber würkli süess gsi."
"Ich hätt öppis söue säge."
"Ich sött mer würkli überlege, wie ich sie aaspriche."
"Nöd eifach irgendöppis."
"Ich bruch en tüüfgründige Gedanke."
"Villicht bruch ich defür eifach chli meh…"
"WIITSICHT."
"Defür bin ich extra uf en Berg gfahre."

Aktueller Esthi-Schuh-Gate ebenfalls:
"Ich sött zerscht mal nach de Schueh luege."
"Zerscht d’Schueh."

Der absichtlich banale schriftliche Kaffee-Zettel bleibt Hochdeutsch, weil er
geschrieben und nicht gedacht wird.

============================================================
3. POLYTERRASSE – NUR ETH
============================================================

UZH wurde vollständig aus der Polyterrassen-Szene entfernt.

Weiterhin:
- Zürich-Panorama
- Polybahnstation
- Polyterrasse
- ETH Hauptgebäude
- Bänke / Fahrräder

Exakte wichtige Interaktionszentren:
- obere Polybahn: x=164
- ETH-Haupteingang: x=1458
- Einstein im ETH-Innenraum: x=590

Hitboxen wurden enger auf diese tatsächlichen Visuals gelegt.

============================================================
4. RÜCKWEG ETH -> POLYTERRASSE -> BAHNHOF
============================================================

Gefährliche v55-Abfolge entfernt:
global scene.stop(TERRACE) -> global scene.start(TRANSIT)
und Transit stoppt sich nicht mehr, BEVOR das Ziel wieder aktiviert wird.

Neu:
Polyterrasse Rückfahrt:
- ScenePlugin.start(TRANSIT)
- Phaser fährt die eigene Terrace sauber herunter und startet Transit atomar

Transit nach unten:
1. Bahnhofstrasse resume
2. Player/HUD/Hotbar vollständig restaurieren
3. erst DANACH Transit stoppen

ETH-Innenraum verlassen:
1. Polyterrasse resume
2. Terrace-State/HUD restaurieren
3. erst DANACH ETH-Innenraum stoppen

Zusätzlich Recovery:
- wenn weder Transit, Polyterrasse noch ETH aktiv sind, Bahnhof aber noch
  pausiert/travel-locked ist -> automatisch wiederherstellen
- wenn travel state bereits false ist, Bahnhof aber trotzdem pausiert blieb ->
  ebenfalls automatisch wiederherstellen
- Transit-Failsafe bleibt bestehen

============================================================
5. DEVELOPER MODE KOMPLETT AUFGERÄUMT
============================================================

Ursache:
script.js kennt selbst nur die alten statischen Checkpoints.
Spätere Patches hatten neue Buttons und eigene Listener darübergelegt.
Mit inzwischen vielen Buttons war das nicht mehr zuverlässig und das Menü war
auf kleinen/querformatigen Displays nicht scrollbar.

developer-mode-v56.js wird NACH script.js geladen und baut die Liste komplett
neu auf.

Damit:
- alte gestapelte Button-Listener verschwinden
- genau eine Routing-Schicht
- Developer-Menü scrollt vertikal
- iPhone Querformat unterstützt
- chronologische Sortierung

Menü:
NORMALER START

1. LÖWENAUSWAHL
2. HIVE / FRAU
3. BAHNHOFSTRASSE / HB
4. ORELL / KASSIERERIN
5. ENDE MILCHMANN
6. ZOFINGIA / ENRIQUE
7. POLYBAHN / ETH
8. MILCHBUCK / ESTHI
9. VENEDIG

============================================================
DEBUG
============================================================

SimonETHV56.status()
- zeigt u.a. polybahnUnlocked
- Hitbox-Mittelpunkte
- aktive ETH/Transit/Terrace-Szenen

SimonETHV56.recover()

SimonWorldStabilityV56.status()
SimonWorldStabilityV56.repair()

SimonDeveloperV56.rebuild()

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html ersetzen.
3. neue v56-JS-Dateien in Repo-Hauptordner hochladen.
4. Hard Reload / Browser-Cache leeren.

Alte eth-campus-v55.js und world-stability-v55.js dürfen im Repo bleiben.
Die neue index.html lädt sie nicht mehr.
