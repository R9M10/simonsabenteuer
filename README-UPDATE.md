# Fix: Löwen-Antworten auf iPhone

Ersetze im Repository nur die vorhandene `game.js`.

Geändert wurde ausschließlich die Auswahl nach:

`Willsch go tanze Gah?`

Die Buttons `JA`, `NEIN` und `KÄMPFEN` besitzen jetzt große, separate Phaser-Touchflächen statt nur den kleinen Text als anklickbare Fläche.

Zusätzlich:

- `pointerup` statt nur Text-`pointerdown` für zuverlässige iPhone-Taps,
- größere Hitboxen,
- Auswahl liegt mit sehr hoher UI-Tiefe über allen anderen HUD-Elementen,
- visuelles Feedback beim Antippen,
- Schutz gegen doppeltes Auslösen.

Die drei bisherigen Wege – Tanzen, Nein und Kampf – bleiben unverändert.
