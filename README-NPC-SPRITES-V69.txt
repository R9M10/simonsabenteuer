SIMONS ABENTEUER – NPC SPRITES FIX v69
=========================================

BASIS
GitHub main beim Start:
408bb79fd30fcf68fe99779b65390f34b012a0a8

WICHTIGSTE ÄNDERUNG
sprite-runtime-v68.js wird NICHT MEHR geladen.

Damit sind Simons Animationen wieder exakt die bestehenden Animationen aus:
- game.js
- animation-fix.js
- simon-ui-v37
- den übrigen aktuellen Spielpatches

v69 verändert KEINEN Simon-Animationskey und KEINE Simon-Texture.

============================================================
WARUM v68 BEI DEN NPCs UNZUVERLÄSSIG WAR
============================================================

v68 hat die neuen Figuren nachträglich als Kinder bestehender Phaser-Container
eingehängt und anschließend per globalem Polling versucht, sie zu finden.

Das ist für diese Figuren ungünstig:
- Amsif wird erst während der Schuhladenstory erzeugt und per Container getweent.
- Gandhi wird mehrfach zerstört/neu erzeugt und später als Dark Gandhi ersetzt.
- Enrique lebt als Kind eines separaten Zofingia-Overlay-Containers.
- Der Inder ist überhaupt kein Phaser-Sprite, sondern ein DOM/CSS-Spritesheet
  mit alten 220×170-Koordinaten.

v69 koppelt die sichtbaren Sprites deshalb an die echten Erzeugungs- und
Zustandsstellen.

============================================================
AMSIF
============================================================

Native Blickrichtung des Sheets: RECHTS.

Darstellung:
- Frames 0–3: ruhiges Idle/Talk
- Frames 4–7: Walk
- Frames 8–11: expressive Story-Gesten
- Frames 12–15: Reward/Quest-Abschluss, derzeit bewusst reserviert

Logik:
- Bei seiner Ankunft kommt Amsif von RECHTS und läuft nach LINKS.
  Das Walk-Sheet wird deshalb während der Arrival-Phase gespiegelt.
- Danach blickt er über den bestehenden game.js-Container wieder zu Simon.
- Während "Amsifs Geschichte" läuft ausschließlich die langsame Story-Reihe.
- Intro, Menü und Warten benutzen Idle/Talk.

Technik:
createAmsif() wird DIREKT gewrappt.
Der alte Graphics-Körper wird unsichtbar.
Hitbox, Name, Dialog und Tween-Container bleiben original.

============================================================
ENRIQUE
============================================================

Native Blickrichtung des Sheets: RECHTS.

Darstellung:
- Frames 0–3: Idle/Talk
- Frames 4–7: Explain/Teach
- Frames 8–11: "Zweiter Blick"-Pose/Demo
- Frames 12–15: Reaction/Punchline, registriert aber nicht blind erzwungen

Logik:
- Enrique schaut immer zu Simons Zofingia-Figur.
- Beim ersten Enrique-Flirt-Intro, solange enriqueSpoken noch false ist:
  Zweiter-Blick-Reihe.
- Bei normalen/gekauften Erklärungen:
  Explain/Teach.
- Ohne Menü:
  Idle/Talk.

Technik:
Enriques alter Container bleibt die Hitbox.
Sein Graphics-Körper wird unsichtbar.
Das sichtbare Sprite liegt als eigene Ebene über dem Zofingia-Overlay,
damit Phaser-Container-Depth es nicht verschlucken kann.

============================================================
GANDHI
============================================================

Native Blickrichtung des Sheets: RECHTS.

NORMAL:
- Frames 0–5: Idle/Talk
- bestehende game.js-Blickrichtung zu Simon bleibt maßgeblich

NUKE:
- Frames 6–11: komplette Fall-/Collapse-Sequenz einmalig
- v69 benutzt dafür ein vom alten Container GETRENNTES sichtbares Sprite
- deshalb kann game.js seinen alten prozeduralen Container weiterhin um ~88°
  drehen, ohne das neue bereits liegende Sprite ein zweites Mal zu drehen

DARK GANDHI:
- Frames 12–17: Dark-Idle/Combat-Stance als Loop
- Frames 18–21: einmalige Staff-Attack-Sequenz, exakt wenn
  darkGandhiStaffAttack() ausgelöst wird
- Frames 22–23: Down/Defeat

Boss-Hitbox, HP, Phasen, Attack-Timer, Schaden und Loot bleiben game.js.

============================================================
DER INDER
============================================================

Der Inder ist im aktuellen Spiel DOM/CSS und kein Phaser-Sprite.

v37:
- Verkäuferbox 220×170
- altes Sheet 880×510
- alter eigener Frame-Timer

v69:
- die alte Verkäuferbox bleibt unsichtbarer KLICK-HITBOX
- neues sichtbares Sprite ist eine eigene 240×280-Ebene
- Background size exakt 960×840
- keine Übersetzung alter 220×170-Koordinaten mehr

Darstellung:
- Row 1 / Frames 0–3: ruhiges Verkäufer-Idle/Talk
- Row 2 / Frames 4–7: Service-Sequenz nach Kauf von Gatorade/Monster
- Row 3 / Frames 8–11: Auberginen-/Gemüse-Sequenz derzeit NICHT automatisch,
  weil im aktuellen Shop kein Auberginen-Item gekauft wird

Dadurch passen die Gesten zur tatsächlichen Spielhandlung.

============================================================
SIMON
============================================================

KEINE v69-Änderungen.

Nicht geladen:
- simon-run-v62.png
- simon-drink-v62.png
- simon-dance-v62.png

Nicht überschrieben:
- simon-run
- simon-idle
- simon-jump
- simon-shoot
- simon-hit
- simon-ko
- simon-v14-dance

Die PNGs aus v68 dürfen im GitHub-Repo physisch liegen bleiben.
Solange sprite-runtime-v68.js nicht im index geladen wird, haben sie keinerlei
Einfluss auf Simon.

============================================================
WEITERHIN ERHALTEN
============================================================

- Anton: neues Sprite, Idle + Miau-Reaktion
- Esthi: neues Sprite, vorhandene Oerlikon-Story bleibt
- sämtliche v66/v67-Weltdateien
- game.js?v=38 unverändert
- flirt-system-v46 unverändert
- simon-ui-v37 unverändert
- developer-mode-v60 unverändert


============================================================
V70 WORLD POLISH / STABILITY
============================================================

Neu in diesem Paket:
- world-polish-v70.js
- index.html lädt zusätzlich world-polish-v70.js?v=70

V70 macht Folgendes:
- stärkere Berge/Häuser-Hintergründe in Milchbuck und Bahnhofstrasse
- mehr Midground hinter den Tramstationen
- breitere Gehwege / weniger reine Asphaltwirkung
- verfeinerter Bahnhofstrasse-Polybahnzugang mit kleinerem Eingang, Fluss/Brücke und nobleren Fassaden rechts
- Polybahn-Transit mit sichtbarem Boden/Trassee unter den Schienen
- Polyterrasse-Himmel/Skyline besser an übrigen Zürich-Look angeglichen
- Salersteig/Oerlikon mit klarerem Boden, Park- und Tramdetail
- robustere Rückkehr aus Simon-Zimmer und WG
- generischer Scene-start-Retry als Absicherung gegen Hänger beim Szenenwechsel
