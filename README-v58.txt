SIMONS ABENTEUER – CRITICAL RUNTIME FIX v58

BASIS
Aktueller GitHub-main beim Beginn:
4fc4302e37a078f7fb2eb082f5c7491142607419

DATEIEN
- index.html
- oerlikon-v58.js
- eth-campus-v58.js
- developer-mode-v58.js
- README-v58.txt

Unverändert weiter geladen:
- game.js?v=38
- runtime-stability-v29.js?v=29
- hive-location-v57.js
- esthi-oerlikon-v57.js
- cashier-story-v54.js
- world-stability-v57.js
- thought-language-v56.js
usw.

============================================================
1. SALERSTEIG – ROOT CAUSE GEFUNDEN
============================================================

v57 hatte in startBahnhofToOerlikon():

!scene.uiLocked

als Voraussetzung.

Das Tram-Zielmenü setzt uiLocked aber absichtlich TRUE, solange die
Zielauswahl offen ist.

Folge:
Simon klickt SALERSTEIG
-> startTramJourney("salersteig")
-> custom Oerlikon-Handler
-> sieht uiLocked=true
-> bricht ab
-> Zielmenü/Transition bleibt in einem unbrauchbaren Zustand.

v58:
- uiLocked wird NICHT mehr als Ausschluss benutzt
- Zielmodal wird zuerst sauber geschlossen
- danach wird das Stadt-Ticket verbraucht
- dann erst Tram-Transition gelockt

Zusätzliche Sicherheit:
- unabhängiger 2,6-Sekunden-Transfer-Failsafe
- OerlikonScene prüft nach 2,6 Sekunden auch ihre Ankunft
- verlorene Tween-/Timer-Callbacks können den Spieler nicht dauerhaft sperren
- Oerlikon überschreibt preload(), damit nicht erneut das globale Simon-
  Spritesheet aus der Milchbuck-Basisklasse geladen wird

============================================================
2. POLYBAHN – NEUER PLATZ
============================================================

Polybahn jetzt:
x ≈ 1180

Damit liegt sie:
- rechts vom Ticket-/Locker-Bereich
- links vor Der Inder
- nicht auf der Tram
- nicht auf dem Locker
- nicht auf dem Ticketautomaten

Der Eingang ist wieder breiter.

Neue Gestaltung:
- in eine Zürcher Straßenfassade integriert
- heller historischer Stein
- Obergeschossfenster
- dunkler Erdgeschoss-Sockel
- rotes Polybahn-Band
- breiter Rundbogen
- rotes Wagen-Piktogramm
- deutliches POLYBAHN
- kleines CENTRAL-Schild

Das entspricht besser der Idee einer Talstation, die in die Bebauung am
Central integriert ist, statt eines frei stehenden Kiosks.

Hitbox:
- Mittelpunkt = Visual-Mittelpunkt
- 156 px breit

Story-Lock unverändert:
vor dem Orell-WIITSICHT-Schritt keine Interaktion / kein Marker.
Danach normal aktiv.

============================================================
3. DEVELOPER MODE – ROOT CAUSE
============================================================

Der angezeigte Text

DEV CHECKPOINT · BAHNHOFSTRASSE / HB
AKTUELLE ANIMATIONEN WERDEN GELADEN…

kam aus runtime-stability-v29.js.

v29 macht bei:
developerMode=true
+
startMode hb / post-milkman / lion-choice

Folgendes:
- ersetzt den gewünschten Start intern durch "dev-shell"
- zeigt seinen eigenen Loading-Screen
- wartet asynchron auf Game-Polish
- startet danach seinen eigenen Checkpoint

v57 hatte GLEICHZEITIG noch seine neue Checkpoint-Logik darüber.
Damit waren zwei Developer-Systeme für denselben Scenewechsel zuständig.

v58 umgeht diesen alten Pfad vollständig:

Der Phaser-Boot ist jetzt immer:
startMode: "dev-shell"
developerMode: false

Warum:
- runtime-stability-v29 greift nur bei developerMode=true auf seine DEV_TARGETS zu
- Flight Intro greift bei "dev-shell" nicht
- Phaser/Game lädt trotzdem die normale aktuelle Milchbuck-Shell
- danach übernimmt NUR developer-mode-v58 den Scenewechsel

Es werden keine hb/post-milkman/lion-choice-Modi mehr in die alte
runtime-v29 Developer-Pipeline geschickt.

Checkpoints werden direkt mit Phaser SceneManager aufgebaut:
- BahnhofquaiScene direkt mit Entwickler-State
- Löwenauswahl auf echter Milchbuck-Szene
- HIVE aus echter Milchbuck-Szene
- Orell nach echter Bahnhof-Szene
- Enrique nach echter Bahnhof-Szene
- Oerlikon nach echter Bahnhof-Szene
- Polybahn nach echter Bahnhof-Szene
- Venice nach echter Bahnhof-Szene

Der alte v29-Ladescreen wird zusätzlich vor jedem Checkpoint aktiv entfernt.

============================================================
4. DEVELOPER MENÜ
============================================================

Weiterhin scrollfähig und chronologisch:

1. LÖWENAUSWAHL
2. HIVE / FRAU
3. BAHNHOFSTRASSE / HB
4. ORELL / KASSIERERIN
5. ENDE MILCHMANN
6. ZOFINGIA / ENRIQUE
7. OERLIKON / ESTHI
8. POLYBAHN / ETH
9. VENEDIG

============================================================
DEBUG
============================================================

SimonDeveloperV58.rebuild()
SimonDeveloperV58.removeOldDevLoading()

SimonOerlikonV58.status()
SimonOerlikonV58.enterDeveloper()

SimonETHV58.status()
SimonETHV58.recover()

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html ersetzen.
3. oerlikon-v58.js hochladen.
4. eth-campus-v58.js hochladen.
5. developer-mode-v58.js hochladen.
6. Hard Reload / Browsercache leeren.

Die alten v57-Dateien dürfen im Repository bleiben.
Die neue index.html lädt die drei ersetzten v57-Dateien nicht mehr.
