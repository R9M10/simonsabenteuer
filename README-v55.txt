SIMONS ABENTEUER – CLEANUP / STABILITY v55

BASIS
Beim Start der Bereinigung neuester GitHub-main:
15029427ae8f1a2bc8398ee649b3f9924b889a39

DIESER PATCH
- ersetzt nur den geladenen ETH-v53-Patch durch eth-campus-v55.js
- ergänzt world-stability-v55.js
- ersetzt NICHT game.js
- Esthi v52 bleibt erhalten
- Kassiererin v54 bleibt erhalten
- HIVE v14.2 / Stability v47 / Flirts v46 / Palazzo v49 bleiben erhalten

============================================================
1. HIVE – ROOT CAUSE FIX
============================================================

Gefundener Fehler:
Esthi v52 verschiebt die beim createHiveClub()-Aufruf erzeugten HIVE-Objekte
von x=1575 auf x=1030.

Später erzeugte HIVE-Elemente arbeiten aber weiterhin mit den alten Koordinaten:
- HIVE-Tür / Hitbox: x=1700
- Kamerapan: x=1745
- Extra-Türsteher: alte x-Werte 1615–1735
- Löwe: alte x-Werte bis 2170 -> 1905

v55 bindet jetzt ALLE dynamisch später erzeugten HIVE-Elemente an denselben
Versatz -545:
- Eingang / HIVE ↥ steht wieder tatsächlich am Gebäude
- Interaktionszone liegt auf dem Eingang
- Kamera zeigt während der Löwen-Szene auf den neuen HIVE
- zusätzliche Türsteher erscheinen dort
- Löwe kommt dort ins Bild
- spätere HIVE-Tweens werden für HIVE-Akteure automatisch auf die neue
  Koordinatenbasis übersetzt

HIVE-Fassade bleibt ungefähr:
x=1030–1280
Tür ungefähr:
x=1155
Türsteher ungefähr:
x=1235

============================================================
2. POLYBAHN – KOMPLETT VEREINFACHT
============================================================

Die Central-Lauf-Szene ist aus dem aktiven Spielweg entfernt.

Auf Bahnhofstrasse:
- Locker liegt durch simon-ui-v37 bei x≈996
- Polybahn liegt jetzt direkt daneben bei x≈1078
- kompakter roter POLY-Eingang
- eigener Hitbox-Bereich, ohne Überlappung mit Locker

Klick auf POLY:
- keine zusätzliche Lauf-Szene
- Bahnhofstrasse wird pausiert
- sofort kurze Polybahn-Fahrt
- danach direkt Polyterrasse

Rückfahrt:
- Klick auf obere Polybahnstation
- sofort dieselbe Transit-Animation abwärts
- danach direkt zurück auf Bahnhofstrasse

Keine Kette mehr:
Bahnhof -> Central -> Ride -> Terrace -> Ride -> Central -> Bahnhof

Dadurch werden mehrere alte Scene-stop/start/pause-Rennen entfernt.

Zusätzlich:
- Transit besitzt 5,2-Sekunden-Failsafe
- verlorener Tween-Callback kann das Spiel nicht mehr dauerhaft einfrieren
- Recovery prüft, ob Bahnhofstrasse versehentlich pausiert blieb, obwohl keine
  Polybahn-/ETH-Szene mehr aktiv ist

============================================================
3. POLYTERRASSE IST JETZT OUTDOOR
============================================================

Vorher:
Polyterrasse setzte __simonInteriorScene=true.
Stability v47 interpretierte sie deshalb korrekt nach diesem Flag als Innenraum.

Jetzt:
__simonInteriorScene=false

Die Polyterrasse verwendet die normale Outdoor-Toolchain des Basisspiels:
- createPlayer
- createKeyboardControls
- createTouchControls
- createHUD
- Hotbar
- ITEMS
- normale Lauf-/Sprungphysik
- Outdoor-Touchsteuerung
- Fähigkeiten / Waffe soweit im Basisspiel freigeschaltet
- normale HP-/Coin-Anzeige

Das soll sich wie Bahnhofstrasse/Milchbuck anfühlen, nicht wie HIVE/Zofingia.

Der ETH-INNENRAUM bleibt bewusst ein Interior.

============================================================
4. EINSTEIN
============================================================

Einstein steht jetzt x=590:
mittig vor / bei der zentralen Treppenanlage.

Weiterhin:
- kein Collider
- Simon kann vorbeilaufen
- 100 Physikfragen
- richtig +20 Coins
- falsch nur "Nein."
- keine Erklärung bei falscher Antwort

============================================================
5. STATE / HUD CLEANUP
============================================================

Polyterrasse synchronisiert jetzt zusätzlich:
- activeAbility
- forItselfCooldownUntil
- Coins / HP
- Inventar / Hotbar
- Bücher
- Fähigkeiten
- Sprint

Beim ETH-Betreten:
- Outdoor-HUD und Touchcontrols der Polyterrasse werden ausgeblendet
- beim Zurückkommen sauber wiederhergestellt

Beim Polybahnfahren:
- Bahnhofstrassen-HUD wird sauber ausgeblendet
- auf Rückkehr wiederhergestellt

============================================================
6. WEITERE STABILITÄTSPRÜFUNG
============================================================

Geprüft wurden insbesondere:
- Script-Reihenfolge
- alte v53-Szene nicht mehr geladen
- Esthi v52 bleibt geladen
- Kassiererin v54 bleibt geladen und findet weiterhin PolyterrasseScene
- HIVE v14.2 bleibt unangetastet
- v47-Interior-Erkennung
- HIVE-Tür / Bouncer / Löwen-Factories
- Polybahn pause/start/stop/resume-Reihenfolge
- ETH -> Polyterrasse State-Rückgabe
- orphaned Kassiererin-/ETH-DOM-Overlays
- Developer Checkpoints

============================================================
DEVELOPER / DEBUG
============================================================

8. POLYBAHN / ETH
startet Bahnhofstrasse direkt neben POLY.

Bestehender:
9. ORELL / KASSIERERIN
bleibt erhalten.

Debug:
SimonETHV55.status()
SimonETHV55.recover()
SimonWorldStabilityV55.status()
SimonWorldStabilityV55.repair()

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. eth-campus-v55.js hinzufügen.
4. world-stability-v55.js hinzufügen.
5. Hard Reload / Cache leeren.

eth-campus-v53.js darf im Repository bleiben.
Die neue index.html lädt es nicht mehr.
