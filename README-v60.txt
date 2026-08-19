SIMONS ABENTEUER – DEVELOPER MODE ONLY v60

BASIS
GitHub-main unmittelbar vor Packaging:
432309eab64afd8e99d2537c739dffd7b73d2f41

DIESER PATCH ÄNDERT AUSSCHLIESSLICH DEN DEVELOPER MODE.

DATEIEN
- index.html
- developer-bootstrap-v60.js
- developer-mode-v60.js
- README-v60.txt

============================================================
DAS PROBLEM
============================================================

Auch v59 benutzte beim Developer-Start noch:

window.startSimonGame(...)

Zu diesem Zeitpunkt ist window.startSimonGame aber NICHT mehr die originale
Funktion aus game.js.

Zwischen game.js und developer-mode-v59.js liegen inzwischen sehr viele
Patches. Mehrere davon ersetzen window.startSimonGame durch Wrapper.

Besonders:
runtime-stability-v29.js besitzt selbst eine komplette Developer-Pipeline für:
- lion-choice
- hb
- post-milkman

Andere Wrapper registrieren HIVE, Venice, ETH, Oerlikon usw.

Dadurch kontrollierte der Developer Mode nicht wirklich seinen eigenen Start.
Er ging weiterhin durch eine lange historische Wrapper-Kette.

============================================================
v60: ORIGINAL game.js START WIRD VOR ALLEN PATCHES GESICHERT
============================================================

Die neue index.html lädt unmittelbar nach:

game.js?v=38

jetzt:

developer-bootstrap-v60.js?v=60

ERST DANACH kommen:
animation-fix
HIVE
game-polish
flight-intro
runtime-stability-v29
usw.

Der Bootstrap speichert zu diesem Zeitpunkt:

window.__SIMON_DEVELOPER_BASE_V60__.start

Das ist ein direkter Pointer auf die ORIGINAL startSimonGame-Funktion aus
game.js.

Spätere Patches dürfen window.startSimonGame weiterhin wrappen.
Der gespeicherte Pointer verändert sich nicht.

============================================================
DER NEUE STARTABLAUF
============================================================

JEDER Developer-Checkpoint beginnt jetzt gleich:

1. Developer-Menü anklicken.
2. Alle Menü-/Startscreens ausblenden.
3. ORIGINAL game.js aufrufen mit:

   startMode: "normal"
   developerMode: true

4. Danach NICHT in den SceneManager eingreifen.
5. Warten, bis:
   - MilchbuckScene wirklich aktiv ist
   - Simon wirklich existiert
   - das Simon-Spritesheet wirklich geladen ist

Damit wird der erste Phaser-Boot vollständig von game.js/Phaser selbst
abgeschlossen.

Kein:
- runtime-v29 Developer-Loader
- Flight Intro
- custom dev-shell Boot
- SceneManager-Race
- zweiter paralleler Checkpoint-Start

============================================================
ERST NACH DEM SAUBEREN BOOT: ERWEITERUNGEN INITIALISIEREN
============================================================

Einige Erweiterungen registrieren ihre dynamischen Szenen erst in ihrem
startSimonGame-Wrapper. Beispiel: HiveInteriorScene.

Deshalb läuft NACH dem erfolgreichen Basisboot die aktuelle Wrapper-Kette
genau einmal auf dem BEREITS EXISTIERENDEN Spiel mit:

startMode: "dev-shell"
developerMode: false

Das ist jetzt ungefährlich:

- Phaser.Game existiert bereits.
- Milchbuck läuft bereits.
- game.js erzeugt kein zweites Spiel.
- Flight Intro sieht dev-shell und startet nicht.
- runtime-stability-v29 sieht developerMode=false und startet seine alte
  Developer-Pipeline nicht.
- Erweiterungen können nur noch ihre Szenen/Guards registrieren.

Nach 160 ms werden die Checkpoints gesetzt.

============================================================
BAHNHOFSTRASSE
============================================================

Für alle Bahnhof-Checkpoints gilt jetzt:

Sauberer Milchbuck-Boot
-> alle Erweiterungen registriert
-> erst DANN:
   MilchbuckScene.scene.start("BahnhofquaiScene", Developer-State)

Danach wartet v60 wieder auf:
- BahnhofquaiScene aktiv
- Simon aktiv
- Simon-Texture vorhanden

Erst dann:
- forceFinishBahnhofArrival()
- Physics resume
- Input enabled
- Player sichtbar/aktiv
- Body enabled
- uiLocked false
- Touchcontrols sichtbar
- Kamera folgt Simon
- Hotbar/HUD erneuert
- Coins = 999999

Damit wird nie während des ersten Phaser-Boots eine zweite Scene gestartet.

============================================================
CHECKPOINTS
============================================================

1. LÖWENAUSWAHL
   Sauberer Milchbuck -> originales setupDeveloperLionChoice()

2. HIVE / FRAU
   Sauberer Milchbuck -> HIVE registrieren -> echten HIVE-Innenraum öffnen

3. BAHNHOFSTRASSE / HB
   Sauberer Milchbuck -> echter BahnhofquaiScene-Start -> spielbar

4. ORELL / KASSIERERIN
   Bahnhofstrasse -> Simon beim Orell platzieren

5. ENDE MILCHMANN
   Bahnhofstrasse mit developerCheckpoint="post-milkman"
   -> originales setupDeveloperPostMilkman()

6. ZOFINGIA / ENRIQUE
   Bahnhofstrasse -> echter Zofingia-Hotspot

7. OERLIKON / ESTHI
   Bahnhofstrasse -> Oerlikon registrieren -> OerlikonScene

8. POLYBAHN / ETH
   Bahnhofstrasse -> ETH registrieren -> Polybahn freischalten -> dort platzieren

9. VENEDIG
   Bahnhofstrasse -> echte Venice-Abfahrt

Alle Developer-Checkpoints:
- Coins 999999
- aktuelle Spielmechanik
- aktuelle Animationen
- Hotbar/HUD
- Input/Physics aktiv

============================================================
WARUM DAS FUNDAMENTAL ANDERS IST ALS v59
============================================================

v59:
Developer Mode -> aktuelle window.startSimonGame -> ALLE WRAPPER -> game.js

v60:
Developer Mode -> gespeicherte ORIGINALE game.js-Funktion
               -> fertige MilchbuckScene
               -> DANACH Wrapper nur zur Registrierung
               -> DANACH Checkpoint

Der erste Phaser-Boot und die historische Wrapper-Kette sind damit erstmals
vollständig voneinander getrennt.

============================================================
TEST
============================================================

Nach Upload:
1. Hard Reload.
2. Start.
3. Developer Mode AN.
4. 3. BAHNHOFSTRASSE / HB.

Erwartung:
- kein "AKTUELLE ANIMATIONEN WERDEN GELADEN..." von v29
- kein dauerhaft hellblauer Bildschirm
- Bahnhofstrasse erscheint
- Simon sichtbar
- Simon kann laufen/springen
- Hotbar sichtbar
- Coins unlimited
- Interaktionen funktionieren

Für einen anderen Checkpoint die Seite neu laden und erneut wählen.

Wenn ein Checkpoint wider Erwarten nicht erreicht wird, zeigt v60 jetzt eine
sichtbare DEV-FEHLER-Box statt still auf einem blauen Canvas stehenzubleiben.

============================================================
EINBAU
============================================================

Alle vier Dateien in den Repo-Hauptordner laden.

index.html ersetzen.

developer-bootstrap-v60.js MUSS direkt nach game.js geladen werden.
Die beigelegte index.html macht das bereits korrekt.

Alte developer-mode-v59.js darf im Repo bleiben.
Sie wird von der neuen index.html nicht mehr geladen.
