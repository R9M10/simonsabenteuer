SIMONS ABENTEUER – v36 DROP-IN

Basis:
- GitHub main beim Build: 8fcb0dc7100953f54644aa02be382f50d7dc7cb5
- game.js?v=32
- opening-scene-v16.css war der aktuelle Stand
- simon-ui-v35.js war der aktuelle Zusatzpatch
- v36 ersetzt v35
- hive-language-patch-v19 ersetzt v18

Einbau:
1. ZIP entpacken.
2. ALLE Dateien in den Repository-Hauptordner ziehen.
3. index.html ersetzen.
4. Hard Reload / Cache leeren.

FIXES / ÄNDERUNGEN

1. PROMENADE-HIMMEL
- exakt dieselbe Bahnhofstrasse-Himmelsfarbe #87c7d8.
- neuer Himmel beginnt bereits bei y=0; dadurch keine sichtbare Farbkante.

2. ZOFINGIA IST JETZT SPIELBAR
- Simon läuft links/rechts.
- A/D oder Pfeiltasten.
- Springen mit W / Pfeil hoch / Leertaste oder SPRUNG-Button.
- Tanzen mit T oder ♪.
- eigener ITEMS-Button.
- Enrique bleibt anklickbar.
- Enrique-Menü pausiert die Clubbewegung.
- Welt-Hitboxes hinter dem Club sind geblockt.
- Bahnhofstrasse-Spieler wird währenddessen verborgen, aber nicht kaputtgelockt.

3. ANFANGS-SPRECHBLASE
- neue opening-scene-v17.css.
- Blase deutlich etwas höher: über Benjamin statt auf seinem Kopf.

4. ALLE KONVERSATIONEN NUR PER KLICK
Audit des aktuellen Spiels:
- Startdialog: bereits klickgesteuert.
- Türsteher: bereits pointerup/klickgesteuert.
- Amsif: bereits advanceAmsifDialogue().
- Milchmann: bereits klickgesteuert.
- Der problematische automatische Dialog war HIVE language v18.
v18 wird nicht mehr geladen.
v19 übersetzt nur Menüs/Text und besitzt KEINE automatischen Gesprächs-Timer.
Die Barfrau-Konversation kommt allein aus v32 und geht nur per Klick weiter.

5. BARFRAU
- durch Entfernen von v18 kann der alte "nice Schueh"-Timerdialog nicht mehr
  nachträglich den v32-Dialog überschreiben.
- gültiger Text: "fire Schueh".
- v36 behält den zuletzt funktionierenden Facing-Fix.

6. HIVE GAMEPLAY
- bisher hatte HIVE nur links/rechts + Tanz; keine Sprunglogik.
- jetzt zusätzlich echtes Springen.
- eigener ITEMS-Button oben rechts.
- HIVE öffnet dasselbe Inventar des Overworld-Spielstands.
- während Inventar/Dialog offen ist Bewegung blockiert.
- nach Schließen wird Bewegung wieder sauber freigegeben.
- Tanzen/Laufen bleiben erhalten.

STABILITÄTSAUDIT
- v35 setzte Zofingia in jedem Frame uiLocked=true -> entfernt.
- v18 und v32/v35 schrieben gleichzeitig Dialog/Facing -> v18 entfernt.
- HIVE-Inventar wird beim Verlassen automatisch geschlossen.
- HIVE-Zusatzsteuerung wird bei Scene shutdown sauber entfernt.
- Zofingia-Updatehandler, Blocker und DOM-Steuerung werden beim Verlassen entfernt.
