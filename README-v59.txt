SIMONS ABENTEUER – STABILITY FIX v59

BASIS
GitHub-main zu Beginn der Umsetzung:
6846675eace615f704ba3d83906b940e20c6411d

DATEIEN
- index.html
- oerlikon-v59.js
- eth-campus-v59.js
- developer-mode-v59.js
- README-v59.txt

============================================================
1. DEVELOPER MODE – EIGENTLICHER BLUE-SCREEN-FEHLER
============================================================

game.js macht beim ersten Start:

game = new Phaser.Game(...)
return game

Das Phaser.Game-Objekt wird also zurückgegeben, BEVOR die erste Scene komplett
gebootet, preload abgeschlossen und Simon erzeugt wurde.

v58 hat direkt nach diesem return:
game.scene.start("MilchbuckScene")

aufgerufen, falls Milkbuck in genau diesem Moment noch nicht aktiv war.

Das war ein Race gegen Phasers eigenen automatischen Start der ersten Scene.
Das typische Ergebnis ist exakt:
- Canvas existiert
- Hintergrundfarbe hellblau
- keine vollständig gestartete spielbare Scene

v59:
- nach new Phaser.Game KEINE SceneManager-Mutation
- wartet auf die automatisch gestartete MilchbuckScene
- verlangt:
  * Scene aktiv
  * Simon-Player aktiv
  * Texture "simon" vorhanden
- erst DANACH wird ein Checkpoint gestartet

Bei einem schon vorher vollständig gebooteten Game darf v59 die Milkbuck-Shell
bei Bedarf gezielt neu starten. Beim allerersten Boot ausdrücklich nicht.

Bahnhof-Checkpoints werden anschließend zusätzlich normalisiert:
- player visible/active
- physics resumed
- input enabled
- body enabled
- uiLocked false
- controls visible
- camera restored
- HUD/hotbar restored
- unlimited coins

Der alte runtime-stability-v29-Developer-Loader wird weiterhin umgangen.

============================================================
2. POLYBAHN – NEUES RÄUMLICHES KONZEPT
============================================================

Die Talstation steht NICHT mehr als großes Gebäude direkt an Bahnhofstrasse.

Neu:
- ungefähr x=880
- neben dem Bahnhof-/Tramstationsbereich
- eine kurze perspektivische Seitenstraße führt sichtbar nach hinten
- Straße wird Richtung Hintergrund schmaler
- Gehwege begleiten sie
- kleine Häuserfassaden rahmen sie
- am ENDE der Straße liegt eine bewusst kleinere POLYBAHN-Talstation

Dadurch wirkt sie wie ein Ziel, das man vom HB/Central-Bereich aus ein kleines
Stück in die Straße hinein erreicht, ohne dafür eine zusätzliche begehbare
Central-Szene einzubauen.

Die Station selbst ist kleiner:
- historischer heller Stein
- rotes Polybahn-Band
- Rundbogen
- kleines rotes Bähnli
- POLYBAHN

Interaktion findet am Vorderende der Seitenstraße statt.

Nach Freischaltung erscheint klar:
POLYBAHN ↑

plus der blinkende Interaktionsmarker.

Vor dem Orell-WIITSICHT-Schritt:
- kein Button
- kein Marker
- keine Erklärung
- Hitbox inaktiv

Nach dem Schritt:
- Button erscheint automatisch, AUCH wenn Bahnhofstrasse schon die ganze Zeit
  geladen war
- Hitbox aktiv
- Marker aktiv

v58 hatte den Unlock teilweise nur beim Scene-Create ausgewertet. v59
synchronisiert den Zustand alle 250 ms, sodass der Button direkt nach dem
WEITSICHT-Gedanken erscheinen kann.

============================================================
3. WG-RÜCKWEG
============================================================

v58:
WG -> game.scene.stop(WG) -> danach Oerlikon resume

Das beendet die aktuelle Scene, bevor der restliche Rückkehrcode vollständig
ausgeführt wurde. Auf Mobile Safari konnte dadurch der Parent-Resume verloren
gehen.

v59:
WG -> Oerlikon RESUME -> Oerlikon vollständig restaurieren -> WG STOP

Oerlikon wird explizit wiederhergestellt:
- Physics
- Input
- Player/body
- UI lock
- Kamera
- Touchcontrols
- Hotbar
- Ticket-/Tram-Interaktion

80 ms später erfolgt noch eine zweite Recovery-Runde, nachdem Stability v47
den Interior-Zustand sicher nicht mehr sieht.

Der gleiche parent-first Fix gilt auch:
Simons Zimmer -> WG-Flur.

============================================================
4. TESTEN
============================================================

Besonders testen:

A) Developer Mode
- Seite neu laden
- Developer Mode AN
- 3. BAHNHOFSTRASSE / HB
=> muss direkt spielbar sein, unlimited coins

Danach auch:
- ORELL
- ENRIQUE
- OERLIKON
- POLYBAHN

B) Polybahn
- vor WEITSICHT: kein POLYBAHN ↑
- nach WEITSICHT: POLYBAHN ↑ erscheint ohne Reload
- anklicken -> Transit

C) WG
- Oerlikon -> WG -> wieder RAUS
- Oerlikon muss sofort weiter spielbar sein
- Simon-Zimmer -> FLUR -> RAUS ebenfalls

============================================================
EINBAU
============================================================

ZIP in Repo-Hauptordner entpacken / hochladen.
index.html ersetzen.

Alte v58-Dateien dürfen liegen bleiben; die neue index.html lädt sie nicht.
