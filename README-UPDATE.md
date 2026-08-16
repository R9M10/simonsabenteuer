# Simons Abenteuer – v28

## Ausgangsstand
Direkt vor dem Build wurde GitHub `main` geprüft.

- game.js: `2e76453912f165cd814bf342e25049137d0e2609`
- index.html: `a4f9db0ab3bea9e7b0f1e196eb8ff58528c9c7ad`
- script.js: `5e24172c209ab630b718ecb88c14eeea5ccf84de`
- game-polish-v15.js bleibt unverändert
- animation-fix.js bleibt unverändert
- hive-expansion.js bleibt unverändert
- hive-language-patch-v18.js bleibt unverändert
- flight-intro.js bleibt unverändert
- milchbuck-world-v20.js bleibt unverändert

## 1. Dark Gandhi
Dark Gandhi braucht jetzt **6 Treffer je Phase**.

- Phase 1: 6 Treffer
- Phase 2: 6 Treffer
- Phase 3: 6 Treffer
- insgesamt: **18 Treffer**
- Simons normaler Schlag bleibt bei **10 Schaden**
- Boss-HP: 180 -> 120 -> 60 -> 0

Er wurde gegenüber v27 moderat stärker und etwas schneller, aber nicht auf den alten zu schweren Stand zurückgesetzt:

- Laufgeschwindigkeit: 53 / 63 / 73 je Phase
- Salzmarsch weiterhin nur 2 Hügel, aber Geschwindigkeit jetzt 94 / 104
- Salz: 6 Schaden
- Stock: 7 Schaden
- Karma: 7 Schaden und etwas schneller
- Wiedergeburt: etwas schneller, 5 Schaden
- Nuclear: 14 Schaden
- Ahimsa: 2 Sekunden, 6 reflektierter Schaden
- Angriffe kommen etwas häufiger als in v27

Die klare Phasenanzeige und Mindestdauer bleiben erhalten.

## 2. Keine Welt-Interaktionen hinter Dialogen/Menüs
Neue zentrale Methode `canUseWorldInteraction()`.

Aktuelle Welt-Interaktionen prüfen jetzt zentral:

- HIVE-Eingang
- Türsteher
- Ticketautomaten
- Tram
- Der Inder
- Orell Füssli
- tote Türsteher / Loot
- Milchmann-Leiche
- Dark-Gandhi-Leiche

Interaktionen werden geblockt während Dialogen, Kämpfen, Menüs, Stores, Reading/Drinking, Void, Rewind, Tramfahrt usw.

Zusätzlich erzeugt jeder native DOM-Button eine 700–750-ms-Sperre für Welt-Interaktionen. `runtime-stability-v28.js` deaktiviert nach einem DOM-Tap Phaser-Input zusätzlich für 240 ms. Dadurch kann z. B. ein Tap auf **NEIN** bei der Löwenauswahl nicht im selben iOS-Tap auf den HIVE-Eingang darunter durchfallen.

## 3. Keine Welt-Interaktionen in der Luft
`canUseWorldInteraction()` verlangt standardmäßig Bodenkontakt.

Während Simon springt/fällt, können damit insbesondere nicht geöffnet werden:

- Ticketautomat
- Tram
- HIVE
- Der Inder
- Orell Füssli
- Loot-Leichen
- Türsteher-Dialog

Das verhindert auch versehentliche Store-/HIVE-Klicks beim Setzen eines Wurmloch-Ziels.

## 4. Developer Mode komplett stabilisiert
Neue Datei `runtime-stability-v28.js`.

Developer-Ziele werden nicht mehr direkt in halbfertige Scene-Zustände geschoben. Stattdessen:

1. Start über eine neutrale `dev-shell`-Scene.
2. Warten, bis die aktuellen `game-polish-v15`-Assets wirklich geladen sind.
3. Warten auf Simons aktuelle Box-Schlaganimation.
4. Warten auf den aktuellen Milkman-v15-Patch.
5. Erst danach wird der gewünschte Checkpoint aufgebaut.

Das gilt für:

- Löwenauswahl
- Bahnhofstrasse / HB
- Ende Milchmann

`ENDE MILCHMANN` erzeugt den Milchmann jetzt mit dem aktuellen Milkman-v15-Sprite und der aktuellen KO-Animation statt der alten prozeduralen Rotationsdarstellung. Simons `simon-shoot`/X-Animation ist zu diesem Zeitpunkt ebenfalls bereits durch die aktuelle Boxanimation ersetzt.

Der normale Loot-/30-Sekunden-Despawn-Pfad bleibt für den Developer-Milchmann erhalten.

Developer-Checkpoints zeigen während der Vorbereitung kurz einen Ladehinweis und besitzen Watchdogs gegen hängende Zustände.

## Tests
Bestanden:

- `node --check game.js`
- `node --check runtime-stability-v28.js`
- `node --check script.js`
- Runtime: kein Weltklick in der Luft
- Runtime: kein Weltklick bei Löwenmodal
- Runtime: globale DOM-Fall-through-Sperre
- Runtime: 6 Treffer in Phase 1
- Runtime: 6 Treffer in Phase 2
- Runtime: 6 Treffer in Phase 3
- Runtime: 18 Treffer gesamt bis Dark Gandhi besiegt
- Runtime: Milkman-v15-KO-Stil im Developer-Corpse
- Runtime: alle drei Developer-Ziele laufen über `dev-shell`
- Runtime: Developer Post-Milkman wartet auf aktuellen Milkman-v15
- Runtime: DOM-Tap deaktiviert Phaser-Input kurz und aktiviert ihn danach wieder

Kein physischer iPhone-/Safari-Test wurde ausgeführt.

## Dateien hochladen

- `game.js` ersetzen
- `index.html` ersetzen
- `runtime-stability-v28.js` neu hinzufügen

`script.js` bleibt unverändert.

## Cache

- `game.js?v=28`
- `runtime-stability-v28.js?v=28`
