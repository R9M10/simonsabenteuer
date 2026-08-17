SIMONS ABENTEUER – OERLIKON + STABILITY v57

BASIS
GitHub-main zu Beginn der Umsetzung:
37dfbc9d938075e80d7dd0d98536f32dec5cbe24

Dieser Patch ersetzt NICHT game.js.
Er trennt Esthi endgültig von Milchbuck, ergänzt Oerlikon als eigene Outdoor-
Zone und vereinfacht Polybahn/Developer-Checkpoints nochmals auf robuste
Szenenwechsel.

DATEIEN
- index.html
- hive-location-v57.js
- oerlikon-v57.js
- esthi-oerlikon-v57.js
- eth-campus-v57.js
- world-stability-v57.js
- developer-mode-v57.js
- README-v57.txt

============================================================
1. ESTHI IST NICHT MEHR IN MILCHBUCK
============================================================

esthi-story-v52.js wird NICHT mehr geladen.

Der HIVE-Versatz aus v52 wurde separat in hive-location-v57.js erhalten:
- ursprünglicher HIVE x≈1575
- neuer HIVE x≈1030
- world-stability-v57 richtet weiterhin spätere HIVE-Türsteher, Tür-Hitbox,
  Kamerafahrt und Löwen-Sequenz an dieser neuen Position aus.

Milchbuck bekommt dadurch nicht mehr zusätzlich:
- Esthi-Park
- SPAR
- Schuh-Gate

============================================================
2. NEUE OUTDOOR-SZENE OERLIKON
============================================================

Freischaltung:
- nach dem ersten abgeschlossenen Enrique-Gespräch
- verwendet den bestehenden persistenten enriqueSpoken-Flag

Danach erscheint im Tram-Zielmenü mit gültigem Stadt-Ticket:
SALERSTEIG

Bahnhofstrasse -> Salersteig:
- normale sichtbare Tram-Abfahrt
- ein Stadt-Ticket wird verbraucht
- sichtbare Tram-Ankunft in Oerlikon
- danach normale Outdoor-Steuerung

Oerlikon ist KEIN Interior:
- normale Lauf-/Sprungmechanik
- Outdoor-Touchcontrols
- HP / Coins
- Hotbar
- ITEMS
- Fähigkeiten / Waffen soweit freigeschaltet

Grober Aufbau:
SALERSTEIG
-> SIMONS WG / OERLIKONWEG 1
-> KIRCHENPARK / REF. KIRCHE OERLIKON
-> COOP
-> STERNEN OERLIKON

============================================================
3. ZWEI FUNKTIONALE TRAMHALTESTELLEN
============================================================

Links:
SALERSTEIG

Rechts:
STERNEN OERLIKON

Beide besitzen:
- Haltestellenbereich
- Ticketautomat
- Boarding-Hitbox
- Interaktionsmarker nur mit gültigem Ticket

Von beiden Haltestellen kann Simon mit einem Stadt-Ticket zurück nach:
BAHNHOFSTRASSE / HB

Die gewählte Haltestelle bestimmt, von wo die Abfahrtsanimation startet.

============================================================
4. SIMONS WG – OERLIKONWEG 1
============================================================

Das Haus ist frei gestaltet.

Außen:
- Zürcher Wohnhaus
- Eingang klar anklickbar
- Schild OERLIKONWEG 1

Innen:
wilder WG-Flur mit Schuhen, Kisten, Jacken und zusammengewürfelter Einrichtung.

Vier Zimmertüren:
SIMON
BENJAMIN 🔒
DANELL 🔒
VAL 🔒

Nur SIMON ist aktuell betretbar.
Die drei anderen Türen bleiben sichtbar und anklickbar, zeigen aber nur
GESPERRT.

============================================================
5. SIMONS ZIMMER
============================================================

Sehr klein gehalten.

Enthält:
- kleines Einzelbett
- blauen Perserteppich
- kleinen Schreibtisch
- Laptop
- einige kleine Schreibtischobjekte
- orange Katze ANTON

Anton ist anklickbar:
ANTON: "Miau."

Noch keine Quest- oder Item-Funktion für Anton.

============================================================
6. KIRCHENPARK + ESTHI
============================================================

Der Park liegt direkt nach/hinter dem WG-Bereich.

Gestaltung:
- Grünfläche
- leichter Hügel
- geschwungene Wege
- große Bäume
- Parkbank
- historische reformierte Kirche mit hohem Turm

Esthis komplette Geschichte läuft jetzt ausschließlich hier.

Ablauf bleibt:
- Esthi fragt nach Waschmittel
- Simon zeigt ihr den COOP
- beide gehen dorthin
- Esthi verschwindet kurz im Coop
- kommt mit Waschmittel + koreanischer Süßigkeit zurück
- zurück zur Parkbank
- Füttern
- Puder
- erster Kuss

SPAR wurde vollständig durch COOP ersetzt.

Simons innere Gedanken in dieser Sequenz sind Schweizerdeutsch:
"Was lauft da eigentlich grad?"
"Fründe?"
"Was zur Höll isch grad passiert?"

============================================================
7. POLYBAHN NOCHMALS NEU POSITIONIERT
============================================================

Bahnhofstrasse:
- Polybahn nicht mehr beim Locker
- Polybahn jetzt klar LINKS von der Tram
- Mittelpunkt ungefähr x=360
- Tram beginnt visuell ungefähr ab x=470
- dadurch kein Überlappen mit Tram / Locker / Ticketautomat

Eingang wurde größer und lesbarer:
- breite Stein-Fassade
- rotes Band
- Rundbogen-Eingang
- kleines rotes Polybahn-Piktogramm
- deutliches Schild:
  POLYBAHN
- Hitbox 128 px breit und exakt um denselben Mittelpunkt

Story-Lock bleibt:
vor Simons zweitem Orell-/WEITSICHT-Schritt:
- sichtbar aber gedimmt
- kein Marker
- kein Hand-Cursor
- Hitbox deaktiviert
- Klick macht nichts
- keine Erklärung

danach:
- normal sichtbar
- Marker
- betretbar

============================================================
8. POLYBAHN-RÜCKWEG FUNDAMENTAL VEREINFACHT
============================================================

Der problematische Hintergrund-Pausezustand von Bahnhofstrasse wurde entfernt.

ALT:
Bahnhofstrasse pausieren
-> Transit
-> Polyterrasse
-> ETH
-> Polyterrasse
-> Transit
-> pausierten Bahnhof wiederbeleben

NEU:
Bahnhofstrasse
-> aktuellen Spielstand in reines Datenobjekt kopieren
-> Bahnhofstrasse sauber beenden
-> Transit
-> Polyterrasse / ETH
-> Rückfahrt
-> Bahnhofstrasse als frische Scene neu starten
-> gespeicherten Zustand wieder einlesen
-> Spieler direkt links der Polybahn positionieren

Damit bleibt beim Rückweg keine alte pausierte Bahnhof-Szene mehr übrig, die
sich aufhängen kann.

Gespeichert werden u.a.:
- Coins / HP
- Inventar
- Hotbar
- Tickets
- Bücher
- Fähigkeiten
- Sprint
- Enrique
- Gandhi-/Dark-Gandhi-Fortschritt
- Amsif-Fortschritt
- HIVE-Status

============================================================
9. POLYTERRASSE
============================================================

Weiterhin Outdoor-Mechanik.

Kein UZH-Gebäude.

Nur:
- Zürich-Panorama
- Polybahn
- Terrasse
- ETH-Hauptgebäude
- Bänke / Fahrräder

Wichtige Interaktionszentren:
- obere Polybahn: x=164
- ETH-Eingang: x=1458
- Einstein innen: x=590

Einstein:
- kein Collider
- 100 Fragen
- richtig +20 Coins
- falsch nur "Nein."
- keine Lösung / Erklärung bei falscher Antwort

============================================================
10. DEVELOPER MODE v57
============================================================

Der zentrale Fehler der alten Developer-Checkpoints:
spätere Patches hatten immer neue eigene startMode-Namen in die
startSimonGame-Wrapperkette eingebaut.

Das führte teilweise zu:
Ladebildschirm -> blauer Phaser-Hintergrund -> keine korrekt gestartete Scene.

v57 gibt startSimonGame deshalb NUR noch Modi, die das Basisspiel selbst stabil
kennt:
- normal
- hb
- post-milkman
- lion-choice

Alle späteren Checkpoints werden ERST NACHDEM die Basis-Szene wirklich aktiv
und spielbar ist eingerichtet.

Scrollbares chronologisches Menü:

NORMALER START

1. LÖWENAUSWAHL
2. HIVE / FRAU
3. BAHNHOFSTRASSE / HB
4. ORELL / KASSIERERIN
5. ENDE MILCHMANN
6. ZOFINGIA / ENRIQUE
7. OERLIKON / ESTHI
8. POLYBAHN / ETH
9. VENEDIG

Besonders:
- HIVE startet normal und öffnet erst danach den echten HIVE-Interior
- Enrique startet HB und öffnet danach den echten Zofingia-Hotspot
- Oerlikon startet HB stabil und wechselt danach in Oerlikon
- Polybahn startet HB und positioniert Simon erst danach beim echten POLY-Eingang
- Venedig startet HB und ruft danach die echte Venice-Abfahrt auf

Keine Custom-startMode-Fallthroughs mehr.

============================================================
DEBUG
============================================================

SimonOerlikonV57.status()
SimonOerlikonV57.enterDeveloper()

SimonEsthiOerlikonV57.resetStory()
SimonEsthiOerlikonV57.startNow()

SimonETHV57.status()
SimonETHV57.recover()

SimonWorldStabilityV57.status()
SimonWorldStabilityV57.repair()

SimonDeveloperV57.rebuild()

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. alle neuen v57-JS-Dateien hochladen.
4. Hard Reload / Cache leeren.

Alte Dateien dürfen im Repo liegen bleiben, werden aber nicht mehr geladen:
- esthi-story-v52.js
- eth-campus-v56.js
- world-stability-v56.js
- developer-mode-v56.js

Unverändert weiterverwendet:
- game.js?v=38
- cashier-story-v54.js?v=54
- thought-language-v56.js?v=56
- alle bestehenden HIVE/Flirt/Venice/Palazzo-Patches
