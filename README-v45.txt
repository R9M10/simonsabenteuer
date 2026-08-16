SIMONS ABENTEUER – v45 FLIRT / INVENTAR / DEV

BASIS
- neuester main beim Build: 14bef023a45fd783cc87b2ce999cf361433b9e72
- game.js?v=37
- simon-ui-v37.js?v=37
- progression-markers-v38.js?v=39
- venice-scene-v39.js?v=43
- acquaintances-v41.js?v=42
- flirt-system-v42.js?v=42
- woman-conversation-v43.js?v=43
- thomas-horserace-v44.js?v=44
- script.js?v=13

EINBAU
1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. flirt-system-v45.js hinzufügen.
4. Hard Reload / Cache leeren.

1. FRAU IM HIVE
ERSTER Klick:
- automatisch normaler vorhandener v43-Dialog
- kein Auswahlmenü davor

ZWEITER und jeder spätere Klick:
- BEOBACHTEN
- FLIRTEN
- ZURÜCK

Eigenschaft:
- selbstbewusst
- skeptisch
- sehr aufmerksam

2. FLIRT-QUELLEN KORRIGIERT
THE PLAYBOOK:
- Lorenzo Von Matterhorn
- SNASA
- The Ted Mosby

ENRIQUE GRATIS:
- Der zweite Blick

ENRIQUE JE 100 COINS:
- Der falsche Tourist
- Der Münzwurf
- Der Bücherwurm

Insgesamt zunächst 7 Flirts.

3. FLIRTS BEI FRAUEN
- alle erlernten Flirts werden angezeigt
- für diese Entwicklungsstufe funktionieren alle bei allen Frauen
- bereits bei dieser Frau versucht: weiterhin durchgestrichen
- pro Besuch weiterhin nur ein Versuch
- jeder Flirt besitzt bereits passende klickweise Sprechblasen
- spezifische Körper-/Handlungsanimationen kommen später

4. ENRIQUE
Hauptmenü:
- WO ISCH DE GÉNÉRAL?
- FRAG NACH EINEM WEITEREN FLIRT
- ZURÜCK

Untermenü:
- DER FALSCHE TOURIST · 100
- DER MÜNZWURF · 100
- DER BÜCHERWURM · 100
- ← ZURÜCK

Erklärungen vollständig neu auf diese drei Moves angepasst.
Zweiter Blick bleibt Enriques kostenloser Intro-Flirt.

5. LÖWE / TANZEN
Beim JA / Tanz-Einstieg:
- Simon bekommt am Anfang einen klaren eigenen Tanzloop zusammen mit dem Löwen
- alte endlose starke Simon-Wackelbewegung wird beendet
- danach nur noch subtiler Club-Sway
- Löwenbewegung bleibt erhalten

6. INVENTAR
Vier Tabs:
- GEGENSTÄNDE
- FÄHIGKEITEN
- BEKANNTSCHAFTEN
- FLIRTS

FLIRTS zeigt ausschließlich gelernte Flirts.
Jede Karte zeigt:
- Quelle
- Name
- kurze Erklärung

7. DEVELOPER MODE
Bestehende Ziele bleiben:
1. Löwenauswahl
2. Bahnhofstrasse / HB
3. Ende Milchmann
4. Venedig

Zusätzlich:
5. HIVE / FRAU
6. ZOFINGIA / ENRIQUE

Die neuen Ziele werden vor script.js erzeugt und benutzen denselben Developer-
Startfluss. Beide erhalten ∞ Coins.

STABILITÄT
- v42 bleibt geladen, weil Playbook/Enrique-Intro und bestehende State-Anbindung
  bereits funktionieren.
- v45 übernimmt nur die nun geänderten Regeln.
- v43 bleibt Eigentümer des ersten Frauendialogs.
- v45 überschreibt nur openWomanMenu, nicht erneut den v43-Dialog.
- v41 wird durch Marker davon abgehalten, das Frau-Menü wieder zu wrappen.
- Enrique-v45-Modals tragen zusätzlich den v42-Kompatibilitätsmarker, damit der
  ältere v42-RAF sie nicht wieder ersetzt.
