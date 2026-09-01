SIMONS ABENTEUER – SPRITE INTEGRATION v68
============================================

BASIS BEIM START DER UMSETZUNG
GitHub main:
9167b419b2ac710009c3d40d58b1b6699c5da290

WICHTIG
Dieser Patch ersetzt NICHT game.js.
Milchbuck v66 und Zürich Outdoor v67 bleiben vollständig erhalten.

NEUE DATEI
- sprite-runtime-v68.js

VERWENDETE PRODUKTIONS-ASSETS
- simon-run-v62.png
- simon-drink-v62.png
- simon-dance-v62.png
- anton-master-v62.png
- amsif-master-v62.png
- esthi-master-v62.png
- enrique-master-v62.png
- gandhi-master-v62.png
- inder-master-v62.png

============================================================
1. SIMON RUN
============================================================

Das bestehende öffentliche Animationslabel bleibt:
simon-run

Dadurch müssen die vielen aktuellen Szenen NICHT umgeschrieben werden.

Neu:
- Texture: simon-run-v68
- Frames 0–9
- 12 fps
- Loop
- Links weiterhin über flipX

Betroffen:
- Milchbuck
- Bahnhofstrasse
- Oerlikon
- freie Indoor-Bewegung
- bestehende Cutscenes, die simon-run verwenden

Der bestehende animation-fix.js?v=10 bleibt erhalten.

Zusätzlich besitzt Simons Player jetzt einen kleinen Frame-Guard:
Wenn animation-fix v10 für Jump/Hit/KO direkt alte numerische Frames
18–31 auswählt, wird vorher automatisch wieder die kanonische Texture
"simon" aktiviert.

Damit kann das neue Run-Sheet nicht die alten Jump-Frames zerstören.

============================================================
2. SIMON DRINK
============================================================

Gatorade und Monster behalten ihre bisherige Mechanik:
- echtes Item-Icon
- Item bewegt sich zum Mund
- Verbrauch
- Heilung
- HP-Text
- Hotbar-Update

Nur Simons Körperanimation wird währenddessen durch das neue
4-Frame-Drink-Sheet ersetzt.

Visual sequence:
0 -> 1 -> 2 -> 2 -> 2 -> 3

Dadurch bleibt der Schluckframe lange genug sichtbar, während die bestehende
Item-Tween-Logik weiterläuft.

Zigaretten bleiben unverändert, weil sie die separate Rauch-Animation nutzen.

============================================================
3. SIMON DANCE
============================================================

Neue 7-Frame-Tanzanimation:
0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> Loop

Sie ersetzt den bestehenden Schlüssel:
simon-v14-dance

Dadurch verwendet die aktuelle Indoor-Logik von simon-ui-v37 automatisch
das neue Sheet.

Zusätzlich wird der alte Simon-&-Leu-HIVE-Dance-Overlay erkannt und dort
der bisherige Run-Ersatz gegen die echte Tanzanimation ausgetauscht.

============================================================
4. ANTON
============================================================

Simons Zimmer, Interaktion und "Miau." bleiben exakt bestehen.

Nur die prozedurale Katze wird ausgeblendet und durch:
anton-master-v62.png
ersetzt.

Idle:
Frames 0–3, langsamer Loop.

Beim Antippen:
Frames 12–15 als kurze Reaktion,
danach zurück zu Idle.

Der alte künstliche Schwebe-Tween der prozeduralen Katze wird entfernt.

Noch NICHT in v68:
- Anton als Follower
- Walk 4–7
- Run 8–11

Diese Frames bleiben für die spätere Companion-Mechanik reserviert.

============================================================
5. ESTHI
============================================================

Esthis existierender Oerlikon-Container bleibt erhalten:
- Position
- Parkstory
- Coop-Sequenz
- Props
- Name
- Tween-Bewegung
- Dialoge

Nur der prozedurale Graphics-Körper wird ausgeblendet.

Neu:
esthi-master-v62.png
Frames 0–3 als ruhiger Idle/Talk-Loop.

Damit wird die Storymechanik nicht verändert.

============================================================
6. AMSIF
============================================================

Amsifs bestehender Container, Name, Hitbox, Story und Arrival-Tweens
bleiben unverändert.

Nur der prozedurale Körper wird ersetzt.

Neu:
- Idle/Talk 0–3
- Arrival/Walk 4–7
- dramatische Geschichte 8–11 einmalig

Quest-/Reward-Frames 12–15 bleiben für die spätere tatsächliche
Schlüssel-/Schuhbelohnung reserviert.

============================================================
7. ENRIQUE
============================================================

Enriques existierender Zofingia-Container und alle Flirt-/Storyhooks bleiben.

Neu:
- Idle/Talk 0–3
- wenn sein aktuelles Menü offen ist: Teach/Explain 4–7

Die spezielle Zweiter-Blick-Demo 8–11 ist als Animation registriert,
wird aber noch nicht blind an das aktuelle 7-Flirt-System gebunden.

============================================================
8. DER INDER
============================================================

Der aktuelle Inder-Innenraum aus simon-ui-v37 bleibt vollständig bestehen.

Wichtig:
v37 verwendet intern noch alte 220x170-Framekoordinaten.

v68 ersetzt deshalb NICHT dessen Timer.

Stattdessen:
- v37 darf weiterhin row/col auswählen
- v68 liest diese Position
- das neue 240x280-Produktionsframe wird unverzerrt darüber dargestellt
- Klick/Shopmechanik bleibt beim bestehenden Verkäufer-DOM

Dadurch wird das neue Sheet verwendet, ohne die bestehende Shoplogik
oder deren Timing umzuschreiben.

============================================================
9. GANDHI / DARK GANDHI
============================================================

Alle Bossmechaniken bleiben in game.js:
- Dialog
- NUKE
- Explosion
- Revival
- drei Bossphasen
- Hitboxen
- Schaden
- Loot
- Wurfstöcke

Nur die prozeduralen Figuren werden visuell ersetzt.

Normal Gandhi:
Frames 0–5 Idle/Talk.

WICHTIG:
game.js legt Gandhis Körper nach der Explosion aktuell durch eine Rotation
des GESAMTEN Containers auf den Boden. Deshalb werden die bereits liegenden
Collapse-Frames 6–11 in v68 bewusst noch NICHT abgespielt — sonst würde
die bestehende Containerrotation sie ein zweites Mal drehen.

Dark Gandhi:
Frames 12–17 als laufender Dark-Gandhi-Zustand.

Collapse 6–11 und Combat 18–23 sind technisch registriert, werden aber erst
in einer späteren kampfbewussten Choreografie exakt an Nuke-/Attacktimings
gebunden. So verändert dieser erste Sprite-Patch keine Bossmechanik.

============================================================
BEWUSST NOCH NICHT EINGEBAUT
============================================================

SIMON BOX
Das Sheet ist technisch fertig, aber die aktuellen Kampfarten
(Milchmann, Dark Gandhi, Shoot/X, Wurfstöcke) müssen zuerst sauber
gegen die echte Punch-Impact-Logik gemappt werden.

SIMON FLIRT
Das Bild besitzt vier visuelle Flirtreihen.
Der aktuelle Code besitzt sieben kanonische Flirts.
Daher keine willkürliche Zuordnung in v68.

============================================================
TECHNIK
============================================================

sprite-runtime-v68.js wird NACH:
- cashier-story-v54
- milchbuck-v66
- zurich-outdoor-v67

und VOR:
- thought-language-v56
- script.js
- developer-mode-v60

geladen.

Damit sieht der Sprite-Adapter die aktuelle v66/v67-Welt, ohne die
Developer-Bootstrap-Reihenfolge anzufassen.

Fail-open:
Wenn ein neues PNG fehlen sollte, bleibt die jeweilige bisherige
prozedurale/alte Darstellung bestehen.

============================================================
TESTREIHENFOLGE
============================================================

1. Normaler Start -> Simon laufen / springen.
2. Gatorade oder Monster -> neue Drink-Animation + korrekte Heilung.
3. HIVE -> Tanzanimation.
4. Bahnhofstrasse -> Der Inder.
5. Amsif -> Ankunft + Gespräch.
6. Gandhi -> normal -> NUKE -> Dark Gandhi.
7. Zofingia -> Enrique.
8. Oerlikon -> Esthi.
9. WG -> Simons Zimmer -> Anton antippen.

