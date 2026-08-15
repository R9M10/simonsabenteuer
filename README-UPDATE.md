# Simons Abenteuer – Lion Choice, HP, Loot & Inventory

Für dieses Update muss im Repository nur die bestehende `game.js` ersetzt werden.

## Neu

- Der Ticketautomat bleibt nach der HIVE-Sequenz zuverlässig anklickbar.
- Oben links:
  - Coin-Zähler
  - HP-Leiste ohne Zahlen
- Simon startet mit 100 HP.
- Ein Löwen-Treffer zieht 40 HP ab.
- Nach drei Treffern stirbt Simon und das gesamte Spiel startet neu.

## Nach dem Kampf beim HIVE

Der Löwe fragt:

`Willsch go tanze Gah?`

Antworten:

- `JA`
  - Simon und der Löwe landen im HIVE.
  - Beide tanzen dort animiert zusammen.

- `NEIN`
  - Der Löwe läuft alleine in den HIVE.
  - Danach kann Simon normal weiterspielen.

- `KÄMPFEN`
  - Der Löwe verfolgt Simon.
  - Bei Kontakt greift er an.
  - Nach drei Treffern ist Simon K.O. und das Spiel lädt neu.

## Tote Türsteher

Nach dem Löwenkampf bleiben alle fünf besiegten Türsteher anklickbar.

Beim Anklicken erscheint:

`Das Trinkgeld der Türsteher klauen?`

- `JA`: +100 Coins mit Coin-Animation
- `NEIN`: zurück ins Spiel

Das Trinkgeld kann nur einmal genommen werden. Die Türsteher bleiben danach trotzdem anklickbar.

## Ticket & Inventar

- Oben rechts gibt es von Anfang an `ITEMS`.
- Vor dem Ticketkauf ist das Inventar leer.
- Unten in der Mitte gibt es von Anfang an eine Minecraft-artige Hotbar mit sechs Slots.
- Nach dem Kauf des Stadttickets:
  - wird das Ticket im ITEMS-Menü angezeigt,
  - wird es automatisch in den ersten Hotbar-Slot gelegt,
  - kann es im ITEMS-Menü erneut als ausgerüstet markiert werden.

Das Ticket kostet weiterhin 10 Coins. Nach dem Diebstahl der 100 Coins kann Simon es also kaufen.

Laufen, Springen und Schießen bleiben erhalten.
