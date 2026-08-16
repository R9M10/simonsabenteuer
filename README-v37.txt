SIMONS ABENTEUER – v37 DROP-IN

AKTUELLER STAND BEIM BUILD
- GitHub main: 22da1384b42787051ab1e661ae6dc5a8a828ac06
- game.js?v=33
- hive-language-patch-v19.js?v=19
- simon-ui-v36.js war aktiv
- v37 ersetzt v36 vollständig

EINBAU
1. ZIP entpacken.
2. ALLE Dateien in den Repository-Hauptordner ziehen.
3. index.html ersetzen.
4. Hard Reload / Cache leeren.

DATEIEN
- index.html
- simon-ui-v37.js
- opening-scene-v18.css
- inder-shop-v37.png
- inder-sprites-v37.png

1. ERSTE SPRECHBLASE
- von bottom 61% auf 69% angehoben
- mobile/kleine Höhe: 67%
- bleibt horizontal über Benjamin ausgerichtet

2. GEMEINSAMES INDOOR-GAMEPLAY
HIVE und Zofingia benutzen dieselbe Basis wie Simon draußen:
- Scale: 0.42
- Bewegung: 175
- Gravitation: 900
- Sprung: -470
- Laufen: simon-run
- Springen: simon-jump
- Idle: simon-idle
- Tanz: simon-v14-dance bei physisch passender Action-Sheet-Skalierung 0.52

Touch-Layout in beiden Räumen:
←  →     J  ♪
in denselben Positionen und demselben Arcade-Stil wie die Outdoor-Controls.

Tastatur:
A/D oder Pfeile = laufen
W / Pfeil hoch / Leertaste = springen
T = tanzen

3. HIVE
- alte doppelte Bewegungslogik entfernt
- WASD wird direkt vom neuen gemeinsamen Controller gelesen
- Sprung entspricht dem Outdoor-Sprung
- Intro-Tanz ohne komische Bob-/Rotations-Tweens
- Coin/Brouwers-Schild oben rechts entfernt
- dort bleibt nur ITEMS
- ITEMS verwendet dasselbe bestehende Inventar des Overworld-Spielstands

4. ZOFINGIA
- Simon nicht mehr mini: Scale 0.42
- normaler Run-/Jump-Look und Outdoor-Physikwerte
- Outdoor-HUD/Hotbar werden im Club ausgeblendet; nur ITEMS + Indoor-Controls
- beim Verlassen wird alles wiederhergestellt
- Enrique besitzt jetzt eine eigene High-Depth-Hitbox, die der Fullscreen-Blocker
  nicht mehr verschlucken kann
- in Enrique-Nähe erscheint "E / KLICK · ANSPRECHEN"
- E oder Klick öffnet sein Menü
- Bewegung pausiert sauber während Enrique-/Inventar-Menüs

5. BÜRKLIPLATZ
- blaues Zürcher Orts-/Straßenschild zwischen Aussicht und Clubhaus ergänzt:
  "BÜRKLIPLATZ"

6. KOHÄRENZ / KOMPATIBILITÄT
- gemeinsame INDOOR_GAMEPLAY_V37-Konstanten und UI-Helfer für HIVE + Zofingia
- neue Indoor-Räume können künftig dieselben Helfer wiederverwenden
- wichtig: game.js?v=33 prüft weiterhin __sv36ZofingiaOpen für
  Langstreckenticket/Venedig
- v37 hält diese Property deshalb absichtlich als Kompatibilitätsalias synchron
- Langstrecken-/Venedig-System des Freundes bleibt erhalten
