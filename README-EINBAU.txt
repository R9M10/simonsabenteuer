SIMONS ABENTEUER – MILCHBUCK LAYER-SYSTEM V19
=============================================

ZIEL
----
Dieser Patch betrifft NUR MilchbuckScene.
Bahnhofstrasse / BahnhofquaiScene wird nicht verändert.

Der Patch führt die saubere Struktur ein, die wir für die neuen Grafiken brauchen:

  background   = -30
  midground    = -10
  ground       =   0
  propsBack    =   5
  player       =  10
  npc          =  12
  propsFront   =  15
  foreground   =  20
  interaction  = 150
  ui           = 300

WELTGRÖSSE MILCHBUCK
--------------------
  3000 x 390 px
  Bodenoberkante: y = 338

WICHTIGER SICHERHEITSPUNKT
--------------------------
Beim bloßen Einsetzen dieses Patches werden die bestehenden Milchbuck-Objekte
NICHT auf neue Depth-Werte verschoben.

Die aktuelle Optik, Positionen, Kollisionen, Hitboxen, Tram, Ticketautomat,
HIVE und Simon bleiben dadurch zunächst wie vorher.

Der Code registriert die bestehenden Objekte nur in klar benannten Gruppen.
Neue Bilder können wir danach einzeln und kontrolliert in diese Gruppen setzen.

EINBAU
------
1. milchbuck-layers-v19.js in den Hauptordner des Spiels legen.
   Also direkt neben game.js und index.html.

2. In index.html ganz unten bei den Scripts EINE Zeile ergänzen:

   <script src="milchbuck-layers-v19.js?v=19"></script>

   Die Zeile soll NACH flight-intro.js und VOR script.js stehen.

3. Sonst nichts ersetzen.
   Besonders game.js NICHT durch eine ältere Datei ersetzen.

4. Hochladen / speichern und Seite hart neu laden.

WENN scene-layers-v18.js IM REPO LIEGT
--------------------------------------
Das ist kein Problem, solange es NICHT in index.html eingebunden ist.
V19 ist absichtlich nur für Milchbuck und ersetzt für unsere weitere Arbeit
den allgemeinen V18-Ansatz.

KURZER TEST
-----------
Nach dem Start von Milchbuck sollte sich optisch nichts verändert haben.

Optional Browser-Konsole:

  MilchbuckLayers.audit()

Das zeigt nur, wie viele aktuelle Objekte den einzelnen Gruppen zugeordnet sind.
Es verändert nichts.

Weitere hilfreiche Abfragen:

  MilchbuckLayers.DEPTHS
  MilchbuckLayers.WORLD
  MilchbuckLayers.getScene().milchbuckRenderLayers

WAS WIR DANACH MACHEN
---------------------
Danach ersetzen wir Milchbuck schrittweise:

1. background
2. midground
3. ground
4. einzelne props wie Tram / Ticketautomat / Discokugel
5. foreground

Immer nur eine visuelle Ebene pro Update.
So ist sofort sichtbar, falls irgendwo Position oder Größe nicht stimmt.

NEUE VOLLBILD-LAYER
-------------------
background / midground / ground / foreground müssen exakt 3000 x 390 px sein.
Der Code streckt falsche Bildgrößen absichtlich NICHT automatisch.

ROLLBACK
--------
Einfach diese Zeile wieder aus index.html entfernen:

  <script src="milchbuck-layers-v19.js?v=19"></script>

und optional milchbuck-layers-v19.js löschen.
Da game.js nicht verändert wird, ist der Patch damit vollständig entfernt.
