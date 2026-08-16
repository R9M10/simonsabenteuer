SIMONS ABENTEUER – LAYER-SYSTEM V18
===================================

ZWECK
-----
Dies ist bewusst ein sehr kleiner, sicherer erster Umbau.
Er bereitet ein einheitliches Render-System für Milchbuck und Bahnhofstraße vor,
ohne die aktuelle Welt automatisch neu zu sortieren.

Feste Zielstruktur:

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

WELTGRÖSSE
----------
Milchbuck / Bahnhofstraße:
  3000 x 390 px
  Bodenoberkante: y = 338

Ganz wichtig:
Vollbild-Grafiken für background / midground / ground / foreground müssen
EXAKT 3000 x 390 px groß sein.

Der neue Code streckt falsch exportierte Bilder NICHT automatisch.
Wenn z.B. ein Hintergrund versehentlich 2998 x 390 px groß ist, wird er später
abgelehnt statt die komplette Welt zu verzerren.

EINBAU
------
1. scene-layers-v18.js in den Hauptordner des Spiels kopieren.
   Dort, wo auch game.js und index.html liegen.

2. INDEX-AENDERUNG.txt öffnen.

3. In index.html genau die dort beschriebene eine Script-Zeile ergänzen.

4. Speichern / auf GitHub hochladen.

5. Seite neu laden.

WAS SICH DANACH SICHTBAR ÄNDERN SOLLTE
--------------------------------------
Nichts.

Das ist Absicht.
Die aktuelle Grafik, Hitboxen, Kollisionen, Tram, Ticketautomat, Simon usw.
bleiben zunächst an ihren bisherigen Positionen und Depths.

Damit haben wir zuerst die neue Infrastruktur im Spiel, bevor wir alte Shapes
schrittweise durch PNGs ersetzen.

WAS DER CODE JETZT BEREITSTELLT
------------------------------
In MilchbuckScene und BahnhofquaiScene stehen danach u.a. zur Verfügung:

  scene.renderDepths
  scene.renderWorld
  scene.addSceneLayerImage(...)
  scene.addScenePropImage(...)
  scene.registerRenderObject(...)

Für die nächsten Schritte können wir dann z.B. einen echten 3000x390-Hintergrund
laden und mit addSceneLayerImage sauber auf background setzen.

ROLLBACK
--------
Falls du den Patch wieder entfernen möchtest:

1. Die eine Zeile
   <script src="scene-layers-v18.js?v=18"></script>
   wieder aus index.html löschen.

2. scene-layers-v18.js löschen.

Damit ist der Zustand exakt wie vorher, weil game.js nicht verändert wurde.
