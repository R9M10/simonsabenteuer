SIMONS ABENTEUER — GRAFIK PATCH v81

Enthalten:
- index.html
- bugfix-v81.js

UPLOAD
1. index.html im Hauptordner ersetzen.
2. bugfix-v81.js neu in den Hauptordner hochladen.
3. Sonst keine Dateien löschen oder ändern.

ÄNDERUNGEN

1. BAHNHOFSTRASSE / HB — FINAL ART PASS
- neue, zurückhaltende Zürich-Alpen im Hintergrund
- zusätzliche Tiefenstaffelung / Parallax zwischen Himmel, Alpen, Hügeln, Stadt und Fassaden
- hochwertige Erdgeschossfassaden und Schaufenster
- Orell Füssli, Der Inder und Schuhladen optisch sauber in die Häuserzeile integriert
- mehr Cornices, Fensterdetails, Pflanzkästen, Reflexionen und subtile warme Lichtakzente
- keine Gameplay-Hitbox oder Ladenposition wurde verschoben

2. PROPS BAHNHOFSTRASSE
- der alte v67-Mini-Prop-Layer wird beim Weltaufbau gezielt ausgeblendet
- ersetzt durch weniger, deutlich besser skalierte:
  * Laternen
  * Fahrräder
  * Bänke
  * Pflanzkübel / Büsche
- keine zusätzliche Prop-Überladung

3. BÜRKLIPLATZ
- erkennt die Bürkliplatz-Szene dynamisch über Scene-Key/Stations-Key/Text
- derselbe Zürich-Himmel wie Bahnhofstrasse / v67
- durchgehende Himmelbreite über die komplette World-Bounds, damit kein Farbschnitt entsteht
- passende Alpen- und Hügelstaffelung mit Parallax
- vorhandene benannte Bänke/Büsche/Fahrräder/Laternen werden größer skaliert
- zusätzlich wenige korrekt proportionierte Stadt-/Waterfront-Props als Fallback

Technisch ist v81 ein Visual-Patch. Story, Kämpfe, Laden-Hitboxen und Progression werden nicht verändert.
