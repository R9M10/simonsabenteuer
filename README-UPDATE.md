# Simons Abenteuer – Dark Gandhi / UI / Buchzitate v29

## Ausgangsbasis
Gebaut auf dem direkt vor der Änderung erneut geprüften aktuellen GitHub-main:
- game.js: d741a3e320514d678febc88c9b15df1cc00809ae
- index.html: 5681cb23f917ce67f0df730bd1633b1ad0e92046
- runtime-stability-v28.js: a398916570d94b2e5c5cc31f21369e0f01790a6c

Die neuere `simon-ui-v30.js?v=30`-Integration bleibt erhalten.

## Dark Gandhi
- 300 HP insgesamt.
- Jede der drei Phasen braucht exakt 10 erfolgreiche Treffer.
- Simons Schlag und Wurfstock bleiben bei 10 Schaden.
- 30 Treffer insgesamt.
- Gandhi ist gegenüber v28 moderat schneller und etwas gefährlicher, ohne auf das frühere sehr harte Niveau zurückzugehen.

### Phasenwechsel
Nach Phase 1 und 2 wird das Spiel für die Interaktion vollständig abgefangen.
Die Arcade-Einblendung lautet beispielsweise:

`PHASE SALZMARSCH BEENDET`
`NEUE PHASE: KARMA`

bzw.

`PHASE KARMA BEENDET`
`NEUE PHASE: NUCLEAR LEVEL: MAX`

Jeder Übergang besitzt eine eigene Einflug-/Glitch-/Charge-Animation und gleichzeitig eine sichtbare Transformationsanimation an Dark Gandhi. Währenddessen sind Canvas, Hotbar und Touchaktionen nicht anklickbar. Nach der letzten Phase erscheint ebenfalls eine Abschluss-Einblendung, bevor Gandhi endgültig besiegt wird.

## Wurfstöcke
Der zusätzliche Touchbutton zeigt jetzt direkt `WURF`. Die alte separate Beschriftung oberhalb wurde entfernt.

## Für sich sein
Die Cooldown-Zeit steht jetzt im F-Button selbst, z. B.:

`F`
`3:42`

Ist die Fähigkeit bereit, steht im Button `F / BEREIT`.

## Doppelklick-/Durchklickschutz
Zwei Ebenen wurden kombiniert:
1. Öffnet ein Weltobjekt ein DOM-Menü, wird das neu erzeugte Menü 620 ms vor dem restlichen Touch desselben physischen Taps geschützt.
2. DOM-Buttons besitzen einen globalen Cross-Button-Debounce. Ein Button kann also nicht mit demselben Tap ein Folgemenü öffnen und dort sofort `JA` auslösen.
3. HIVE baut eigene DOM-Buttons. `runtime-stability-v29.js` versieht deshalb jedes neu erzeugte HIVE-Dialogfenster zusätzlich mit demselben Aktivierungsschutz.

Das betrifft insbesondere Orell Füssli, Der Inder, Ticket-/Tram-Menüs, Loot-Dialoge und die HIVE-Dialogketten.

## Buchzitate
Nach einer erfolgreichen Leseanimation erscheint oben 10 Sekunden lang zufällig eines von fünf Zitaten.

Unterstützt:
- General Relativity / Einstein: 5 Zitate
- Phänomenologie des Geistes / Hegel: 5 Zitate
- Also sprach Zarathustra / Nietzsche: 5 Zitate

`The Playbook` bleibt wie gewünscht ohne Zitat.

Liest Simon dasselbe Buch später erneut, wird wieder zufällig ausgewählt.

## Dateien hochladen
- `game.js` ersetzen
- `index.html` ersetzen
- `runtime-stability-v29.js` neu hinzufügen

`runtime-stability-v28.js` kann im Repository bleiben; die neue index.html lädt nur v29.

## Cache
- `game.js?v=29`
- `runtime-stability-v29.js?v=29`

## Tests
- `node --check game.js` – PASS
- `node --check runtime-stability-v29.js` – PASS
- 10 Treffer Phase 1 / HP 300→200 – PASS
- 10 Treffer Phase 2 / HP 200→100 – PASS
- 10 Treffer Phase 3 / HP 100→0 – PASS
- 11. Treffer vor Phasenwechsel wird blockiert – PASS
- Cinematic Transition wird nach Phasenende aufgerufen – PASS
- je 5 Zitate für Einstein/Hegel/Nietzsche – PASS
- Playbook hat 0 Zitate – PASS
- Für-sich-sein-Timer beginnt mit `F` im Button – PASS
- Weltinteraktion setzt DOM-Fall-through-Sperre – PASS
- HIVE-Folgemenü blockiert Same-Tap-Aktivierung – PASS
- aktuelle Friend-Skripte in index.html erhalten – PASS
