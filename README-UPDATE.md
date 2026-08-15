# Simons Abenteuer – Fähigkeiten / General Relativity / Wurmloch v21

Ausgangsstand wurde direkt vor dem Build gegen GitHub geprüft:

- game.js: `3c050afc610723633f3d6dcf91c6b4639e3f8d15`
- index.html: `256c0e1f15b8a48e0878e2133181cc4c45d2dacc`
- hive-expansion.js: `b9f89ac568cb0954cb0e72a7a897ddf95c25f98f` / v14.2

Die HIVE-Erweiterung wird nicht verändert.

## Dateien ersetzen

- `game.js`
- `index.html`

## Super Milch

- normale Milch: Geschwindigkeit 225
- SUPER MILCH: Geschwindigkeit 337.5
- also exakt 1.5x
- normal 10 Schaden / SUPER MILCH 20 Schaden
- jede dritte Flasche bleibt SUPER MILCH
- Wurfabstand bleibt zufällig 1–3 Sekunden

## HUD

Oben links:
1. HP-Herz + HP-Leiste
2. direkt darunter Coins

Das alte separate `TICKET`-Label unter `ITEMS` wurde vollständig entfernt.
Tickets werden nicht mehr im ITEMS-Tab gelistet.

## ITEMS / FÄHIGKEITEN

Das Inventar hat jetzt zwei Tabs:

- ITEMS
- FÄHIGKEITEN

Im ITEMS-Tab liegen die normalen Gegenstände und gekaufte Bücher.
Maximal fünf davon können weiterhin in die Hotbar gelegt werden.

Im FÄHIGKEITEN-Tab stehen freigeschaltete Fähigkeiten.
Es kann genau eine Fähigkeit aktiv sein. Wird später eine andere ausgerüstet,
ersetzt sie die zuvor aktive.

## Bücher

Gekaufte Bücher erscheinen im ITEMS-Tab und können wie andere Gegenstände
mit `IN HOTBAR` in einen der fünf Slots gelegt werden.

Wird ein Buch unten ausgewählt, erscheint `LESEN · ...`.

Beim Lesen:
- Simon bleibt stehen,
- ein geöffnetes Buch erscheint vor ihm,
- Seiten-/Leseanimation läuft,
- das Buch wird NICHT verbraucht.

Die bisher anderen drei Bücher bleiben bereits kauf-/lesbar, bekommen ihre
Abilities aber erst in einem späteren Schritt.

## General Relativity -> Wurmloch

Beim ERSTEN Lesen von `General Relativity`:

`FÄHIGKEIT FREIGESCHALTET · WURMLOCH`

erscheint drei Sekunden oben im Bild.

Danach steht `Wurmloch` im Tab FÄHIGKEITEN.

Wird Wurmloch ausgerüstet:
- es ist die aktive Fähigkeit,
- oben in der Mitte erscheint ein kleines Wurmloch-Icon.

## Wurmloch benutzen

Wenn Wurmloch aktiv ist:

1. Simon springt.
2. Solange er in der Luft ist, kann auf einen Punkt der Spielwelt getippt werden.
3. Ein Wurmloch öffnet sich an Simon und am Ziel.
4. Simon verschwindet im ersten Portal und erscheint am Zielportal.
5. Dort fällt/landet er wieder normal auf dem Boden.

Pro Sprung ist ein Wurmloch-Teleport möglich.

Die Touch-Control-Flächen unten werden ausdrücklich NICHT als Wurmloch-Ziele
interpretiert. Storefassaden werden bei einem gültigen Luft-Wurmloch-Tap
ebenfalls nicht ausgelöst.

## Persistenz

Folgendes wird durch Tramfahrten Milchbuck <-> Bahnhofstrasse mitgenommen:

- gekaufte Bücher
- ob General Relativity bereits gelesen wurde
- freigeschaltete Fähigkeiten
- aktive Fähigkeit
- Hotbar
- bestehende Consumables/Sprintzustand

## Cache

`game.js?v=21`
