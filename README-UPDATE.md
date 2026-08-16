# Simons Abenteuer – Dark Gandhi Runtime-Fix v25

Basis: aktueller GitHub-Stand direkt vor dem Fix.

- game.js: 463a877e52434b925bbcd0cdc6b80d1756cc7ccc
- index.html: 526a376d42cd57d1012c7314ec5157932658d553
- hive-language-patch-v16.js: 455502e2ebda6d584d259e97ecf8b14abaf4dcac
- hive-expansion.js bleibt v14.2 unverändert
- game-polish-v15.js bleibt v15 unverändert

## Kritischer Gandhi-Fix

Der Freeze direkt beim Bombeneinschlag hatte eine konkrete Runtime-Ursache:
`Gandhi` ist ein `Phaser.GameObjects.Container`, aber v24 rief nach dem Einschlag
`this.gandhi.setTint(...)` auf. `Container` besitzt nicht die Sprite-Tint-API.
Dadurch wurde beim Einschlag eine Exception ausgelöst, während `uiLocked=true`
blieb – visuell genau der gemeldete Freeze.

v25 verwendet in der gesamten Gandhi-/Dark-Gandhi-Kette keine Tint-Methode auf
Containern mehr. Außerdem gibt es zwei unabhängige Revival-Pfade:

1. normaler Scene-Timer nach der Explosion,
2. Update-Watchdog nach 2,8 s, falls ein Callback verloren geht.

Beim Start des Bosskampfs werden Player-Body, Controls und Kamera explizit in
einen spielbaren Zustand zurückgesetzt.

## Dark Gandhi

Nach der Nuke:
- Explosion
- Gandhi liegt kurz reglos
- direkte Wiederauferstehung als Dark Gandhi
- schwarze Kleidung, rote Augen
- 300 HP

Phasen:
1. **Salzmarsch** – Stock + Salzprojektile/Slow
2. **Karma** – jeder dritte Treffer erzeugt karmische Vergeltung + Rad der Wiedergeburt
3. **NUCLEAR LEVEL: MAX** – Zielkreis/Nuke + Ahimsa Inversion

Auch die endgültige Niederlage benutzt jetzt keine ungültige Container-Tint-API.

## Tram-/Scene-Stabilität

Zusätzlich zu den v24-Guards gibt es jetzt einen Bahnhofstrasse-Ankunfts-Watchdog.
Wenn die normale Aussteige-Tweenkette nach 3,2 s aus irgendeinem Grund nicht
abschließt, wird Simon automatisch sichtbar, Body/Controls werden aktiviert und
die Kamera folgt ihm wieder. Damit bleibt das Spiel auch bei wiederholten
Milchbuck↔Bahnhofstrasse-Fahrten bedienbar.

## Sprache / HIVE

Allgemeine Menüs/Systemtexte bleiben Hochdeutsch. Vorgegebene Schweizerdeutsche
Dialoge bleiben unverändert. Frau an der Bar exakt:

- `FRAU AN DER BAR`
- `Was soll Simon machen?`
- `ANSPRECHEN`
- Simon: `Hey Süessi, willsch tanze?`
- Frau: `Nöd mit dir.`

Der neue `hive-language-patch-v17.js` ersetzt nur den Runtime-Patch;
`hive-expansion.js` der Freundin wird nicht verändert.

## Hochladen

- game.js ersetzen
- index.html ersetzen
- hive-language-patch-v17.js hinzufügen

Die alte `hive-language-patch-v16.js` kann im Repo bleiben; sie wird von der
neuen index.html nicht mehr geladen.

## Verifikation

Der gemeldete v24-Fehler wurde mit einem Runtime-Harness reproduziert. Ein
Gandhi-Objekt wurde dabei absichtlich wie ein echter Phaser-Container ohne
`setTint()` modelliert. v24 bricht exakt beim Bombeneinschlag ab mit:

`TypeError: this.gandhi.setTint is not a function`

v25 wurde mit demselben Harness geprüft:

- kompletter Weg `NUKE GANDHI -> Explosion -> scheinbar tot -> Dark Gandhi -> Bossstart`: PASS
- Dark-Gandhi-Phase 1 / Salzmarsch + Stock: PASS
- Phase 2 / Karma + Rad der Wiedergeburt: PASS
- Phase 3 / Nuke + Ahimsa Inversion: PASS
- endgültige Niederlage ohne Container-Tint: PASS
- Nuke-Watchdog bei simuliert verlorenem Callback: PASS
- wiederholtes Bahnhofstrasse-`init()` setzt Arrival-/Transitstate korrekt zurück: PASS
- Arrival-Watchdog stellt Simon/Body/Controls wieder her: PASS
- HIVE-Menütext + exakter Schweizerdeutscher Frau-Dialog + Re-entry-Reset: PASS
- `node --check game.js`: PASS
- `node --check hive-language-patch-v17.js`: PASS

Das sind gezielte JavaScript-Runtime-/State-Machine-Tests; sie ersetzen keinen
physischen iPhone-Safari-Test, prüfen aber genau den vorherigen Crashpfad und
die neu hinzugefügten Boss-/Scene-Zustände.
