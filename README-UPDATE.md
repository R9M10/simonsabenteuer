# Simons Abenteuer – Combat / Für sich sein v30

## Grundlage
Direkt vor der Änderung erneut geprüft:
- aktuelles `game.js`: `ab4cb652f4c830a1d75bfc1bc2186e10cf598cda`
- aktuelle `index.html`: `28021a95af6a5c6f369d475c6d17e71dfa5a9ee0`
- `runtime-stability-v29.js`: `a51239d9b6a8ed3888d148adbe5dadccef937736`

Die neue `simon-ui-v32.js?v=32`-Erweiterung aus dem Repository bleibt erhalten.

## 1. Kampfschläge
Ein Treffer ist jetzt an einen echten Box-Animationszyklus gekoppelt.

- Die aktuelle `simon-shoot`-Animation wird durch `game-polish-v15.js` als 5-Frame-Boxanimation dargestellt.
- Ein Schlagzyklus dauert ca. 380 ms.
- Der Trefferpunkt liegt einmalig bei ca. 235 ms.
- Weitere X-Taps während desselben Zyklus werden konsumiert, starten die Animation nicht neu und erzeugen keinen zusätzlichen Schaden.

Dark Gandhi:
- 4 erfolgreiche Treffer pro Phase
- 3 Phasen
- 12 erfolgreiche Treffer insgesamt
- normaler Schlag weiterhin 10 Schaden
- HP 120 → 80 → 40 → 0

Wurfstöcke bleiben von ihrem eigenen 3-Sekunden-Cooldown abhängig.

## 2. Gegner pausieren nicht bei Item-Aktionen
Während Simon trinkt, raucht oder ein Buch liest, darf seine Aktion ihn selbst blockieren – der Gegner läuft aber weiter.

- Dark Gandhi bewegt sich weiter und setzt Angriffe fort.
- Der Löwe greift weiter an.
- Der Milchmann war bereits unabhängig von `uiLocked` und wirft weiterhin Flaschen; dieser Ablauf bleibt erhalten.
- Dialog-/Modal-/Transit-Locks pausieren Kämpfe weiterhin dort, wo sie wirklich einen harten UI-Zustand darstellen.

## 3. Für sich sein
Die Void wurde optisch und funktional überarbeitet:

- keine Ellipsen/Orbitlinien mehr
- stattdessen 64 deterministische Sterne, inklusive heller Kreuzsterne
- HP-Leiste bleibt sichtbar
- Coins bleiben sichtbar
- ITEMS bleibt sichtbar und anklickbar
- Hotbar bleibt sichtbar und anklickbar
- Gegenstände/Bücher/Waffen können weiterhin aus- und abgerüstet werden
- Hotbar-Aktionen wie Trinken/Rauchen/Lesen funktionieren weiterhin in der Void
- HUD-Tiefen werden beim Verlassen der Void sauber wiederhergestellt

## Dateien ersetzen
- `game.js`
- `index.html`

## Cache
- `game.js?v=30`

## Tests
- `node --check game.js` – PASS
- 4 Treffer Phase 1 → 80 HP – PASS
- 4 Treffer Phase 2 → 40 HP – PASS
- 4 Treffer Phase 3 → 0 HP – PASS
- fünf Taps innerhalb einer Boxanimation → genau ein gestarteter Schlag / ein Damage-Callback – PASS
- Dark Gandhi läuft bei aktivem Trinkvorgang weiter – PASS
- Löwe läuft bei aktivem Trinkvorgang weiter – PASS
- Void enthält keine `strokeEllipse`-Geometrie – PASS
- HUD/ITEMS werden in der Void über den Overlay-Blocker gehoben – PASS
- aktuelle `simon-ui-v32.js`-Einbindung bleibt erhalten – PASS
