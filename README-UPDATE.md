# Simons Abenteuer – Zigarette + Orell Füssli v17

Aktueller GitHub-Ausgangsstand vor der Änderung:

- `game.js`: `c211bedb4ab40a540184694ffb0c7fe2b8ae03bd`
- `index.html`: `0a7fa9ea1d8127fa47ef3b7e89b8ac9b6f157e33`
- `hive-expansion.js`: `dae204ca8f2bef85e0fb64a1f5487c224d5444e4`

Die aktuelle HIVE-Datei bleibt unangetastet.

## Zu ersetzen

- `game.js`
- `index.html`

## Zigarette

Das bisherige sichtbare Item `Camel Gelb` heißt nun überall einfach:

`Zigarette`

Das Symbol in Store, ITEMS und Hotbar ist keine Packung mehr, sondern eine
einzelne Zigarette.

Der Sprint läuft weiterhin 60 Sekunden, ist jetzt aber nicht mehr doppelt
so schnell:

- normal: 175
- Sprint: 306.25
- also exakt 75 % schneller

## Orell Füssli

Weiter rechts neben `Der Inder` steht jetzt der Buchladen:

`ORELL FÜSSLI`

Er ist anklickbar und hat wieder den stabilen Ablauf:

`Betreten?` -> `JA / NEIN`

Innen gibt es ein großes Bücherregal. Ein Tap auf das Regal öffnet den
Bücherkatalog.

Aktuelle Bücher:

1. General Relativity – 500 Coins
2. Phänomenologie des Geistes – 300 Coins
3. The Playbook – 1000 Coins
4. Also sprach Zarathustra – 500 Coins

Jedes Buch kann einmal gekauft werden. Danach zeigt es `GEKAUFT`.
Die gekauften Bücher werden im Spielzustand gespeichert und bei Tramfahrten
zwischen Milchbuck und Bahnhofstrasse/HB mitgenommen. Später können daran
Abilities angebunden werden.

Im Developer Mode sind auch die Bücher kostenlos.

Aus dem Katalog geht es mit `← LADEN` zurück und aus dem Buchladen jederzeit
mit `← STRASSE` wieder hinaus.

## Cache

`game.js?v=17`
