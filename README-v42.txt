SIMONS ABENTEUER – FLIRT FIX v42

BASIS
- neuester main beim Build: cd747aa4acc5d6e9a3f21ca808261b9cb9d284e7
- game.js?v=36
- simon-ui-v37.js?v=37
- progression-markers-v38.js?v=39
- venice-scene-v39.js?v=42
- acquaintances-v41.js?v=41
- script.js?v=13

EINBAU
1. ZIP entpacken.
2. index.html in den Repository-Hauptordner ziehen und ersetzen.
3. flirt-system-v42.js hinzufügen.
4. Hard Reload / Cache leeren.

WICHTIG
- flirt-system-v40.js darf physisch im Repository bleiben.
- Die neue index.html lädt v40 NICHT mehr.
- v42 wird bewusst NACH acquaintances-v41.js geladen.

FIXES

1. HIVE-FRAU
- ANSPRECHEN hat zuverlässig:
  BEOBACHTEN
  FLIRTEN
  REDEN
  ZURÜCK
- Eigenschaft der Frau:
  selbstbewusst, skeptisch, sehr aufmerksam.
- BEOBACHTEN liefert natürliche Hinweise als Denkblase.
- REDEN stellt den gewünschten Fire-Schuh-Dialog wieder her.
- acquaintances-v41 darf diesen Dialog nicht mehr überschreiben.

2. FLIRTS BEI DER FRAU
- alle gelernten Flirts erscheinen automatisch.
- alle aktuellen Flirts funktionieren bei der aktuellen Frau.
- Texte laufen Klick für Klick über normale Ingame-Sprechblasen.
- Animationen bleiben bewusst minimal; genaue Flirt-Animationen kommen später.
- attemptedFlirts bleiben pro Frau bestehen.
- pro HIVE-Besuch weiterhin nur ein Versuch.
- Besuchs-State wird robust bei create UND leaveHive zurückgesetzt.

3. PLAYBOOK – ECHTE HIMYM-MOVES
The Playbook lehrt:
- Lorenzo Von Matterhorn
- SNASA
- The Ted Mosby

Beim ersten Lesen werden nur die noch fehlenden Moves gelernt.
Wenn Simon einen davon vorher bei Enrique gekauft hat, wird nichts doppelt gelernt.

4. ENRIQUE
Nach dem ersten Intro:
- WO ISCH DE GÉNÉRAL?
- FRAG NACH EINEM WEITEREN FLIRT
- ZURÜCK

Flirt-Untermenü:
- LORENZO VON MATTERHORN · 100 COINS
- SNASA · 100 COINS
- THE TED MOSBY · 100 COINS
- ← ZURÜCK

Bereits über Playbook oder Enrique gelernt:
- GELERNT
- durchgestrichen
- nicht anklickbar

5. ENRIQUE INTERAKTION
- Distanzprüfung der v37-Hitbox wird entfernt.
- Simon darf an jeder Position im Zofingia stehen.
- Klick auf Enrique/sein Hitbox-Feld startet das Gespräch.
- Prompt: KLICK · ANSPRECHEN

6. GÉNÉRAL
- Schreibweise exakt "Général" / "GÉNÉRAL".
- Wort "Mobutu" kommt in v42 nirgends vor.
- Enrique sagt nur, dass der Général in Venedig sei.
- bestehende markEnriqueConversationComplete()-Storylogik bleibt erhalten.

7. STABILITÄT
- v40 und v41 konkurrierten um dieselben HIVE-Methoden.
- v42 wird als letzter zuständiger Patch geladen.
- bestehender v40-State-Key bleibt als Kompatibilität für acquaintances-v41 erhalten.
- alte Platzhalter-Flirts werden auf die neuen Playbook-Moves migriert.
- alte Versuche werden NICHT fälschlich auf die neuen Flirts übertragen.
