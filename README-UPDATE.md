# Simons Abenteuer – Bekanntschaften / Venedig v36

## Ausgangsbasis
Direkt vor der Änderung erneut geprüft:
- aktuelles GitHub `game.js`: `0581d59601c89719d3aaffebacb64088949e5cd3`
- aktuelle GitHub `index.html`: `6f3c881c46f49484442a7760d32071578f82b9ec`
- aktuelle Venedig-Szene: `venice-scene-v39.js` SHA `6578b5c0d6945853516167f84e287a22544ca6a1`
- aktuelles Repository enthält `flirt-system-v40.js?v=40`; diese Erweiterung bleibt unverändert erhalten.

## 1. Frau an der Bar
Die normale REDEN-/Tanzfrage lautet jetzt klickweise:
1. Simon: `Hey Süessi, willsch tanze?`
2. Frau: `Du bisch zwar nice...`
3. Frau: `aber...`
4. Frau: `nöd soooo nice.`

Die Sequenz läuft mit eigenem Same-Tap-Schutz, damit ein Klick nicht mehrere Sätze überspringt.

## 2. Bekanntschaften statt Bösewichte
Der dritte Inventar-Tab heißt jetzt **BEKANNTSCHAFTEN**.

Bekannte Figuren werden beim tatsächlichen Kennenlernen gespeichert und nach Kategorien gruppiert:
- **BÖSEWICHTE** – rot: Milchmann, Dark Gandhi
- **FRAUEN** – rosa: Frau an der Bar
- **FREUNDE** – grün: Amsif, Enrique
- **SONSTIGE** – blau: Der Löwe, Die Türsteher

Jede Bekanntschaft besitzt eine eigene Karte und einen `i`-Button mit kurzer Beschreibung.

Das System merkt Begegnungen ab jetzt global innerhalb des laufenden Spiels und bietet über `window.SimonAcquaintancesV41.mark(key)` bereits einen Anschluss für kommende Figuren.

## 3. Neuer Developer-Mode-Punkt
Neu:
`4. VENEDIG / STAZIONE VENEZIA`

Der Checkpoint startet direkt in Venedig mit Developer-Coins und einem Langstreckenticket, damit auch die Rückfahrt sofort getestet werden kann.

## 4. Despawn
Geplünderte Figuren despawnen jetzt nach **2 Sekunden** statt 5 Sekunden.

## 5. Venedig dichter und majestätischer
Die Zahl der bisherigen Venedig-Hauptebenen bleibt gleich:
1. Himmel
2. ferne Stadt/Lagune
3. mittlere Stadt-/Kanalschicht
4. Bahnhof/Endstation
5. Vordergrund/Promenade

Innerhalb der Stadtlayer wurde die Architektur deutlich verdichtet:
- 23 zusammenhängende ferne Palazzo-Fassaden
- 19 nähere Palazzo-Fassaden
- venezianische Bogenfenster
- Loggien und Arkaden
- Balkone und Gesimse
- mehrere Campanili
- drei Kuppeln im Basilika-Cluster
- zusätzliche Kirchtürme
- acht Gondeln und mehr Anlegepfähle

Damit entsteht statt einzelner verstreuter Gebäude eine geschlossene historische Stadtsilhouette.

## Weiße Interaktionspunkte
Die Punkte sitzen jetzt auf den tatsächlichen Interaktionsobjekten:
- Ticketautomat: Mittelpunkt der Automaten-Hitbox
- Schließfach: Mittelpunkt der Locker-Hitbox
- besiegte/lootbare Figuren: direkt auf dem Körper
- Tram: weiterhin an der Tür

## Dateien hochladen
- `game.js` ersetzen
- `index.html` ersetzen
- `progression-markers-v38.js` ersetzen
- `venice-scene-v39.js` ersetzen
- `script.js` ersetzen
- `acquaintances-v41.js` neu hinzufügen

`flirt-system-v40.js` bleibt unverändert im Repository.

## Cache
- `game.js?v=36`
- `progression-markers-v38.js?v=39`
- `venice-scene-v39.js?v=42`
- `acquaintances-v41.js?v=41`
- `script.js?v=13`

## Tests
- Syntaxcheck aller fünf JS-Dateien – PASS
- Lootdespawn exakt 2000 ms – PASS
- Marker wird beim Loot sofort entfernt – PASS
- alle sieben aktuellen Bekanntschaften werden korrekt registriert – PASS
- Inventar-Tab wird zu BEKANNTSCHAFTEN – PASS
- Frau-an-der-Bar-Dialog exakt in vier Klickschritten – PASS
- Venedig Developer Checkpoint – PASS
- aktuelles `flirt-system-v40.js` bleibt vor dem neuen Bekanntschaften-Patch geladen – PASS
- Venedig enthält 23+19 prozedurale Palazzo-Fassaden plus Monumente – PASS
