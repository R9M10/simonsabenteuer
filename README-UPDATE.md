# Simons Abenteuer – Hotbar-Auswahl + Einzelfahrt-Tickets + Tram-Routing

Ausgangsstand wurde unmittelbar vor der Änderung gegen GitHub geprüft.

- game.js: `a39fa4b428a829046360665658cb1117abaa85fd`
- index.html: `6f0c2e9ea8540afd8d36ad48afaf6e87874c1eae`
- script.js: `b85d12562933e3f17fbb0bfecb936b4b8397e301`
- hive-expansion.js: `dae204ca8f2bef85e0fb64a1f5487c224d5444e4`

Die neuesten Änderungen an `hive-expansion.js` und `flight-intro.js` werden
nicht überschrieben.

## Zu ersetzen

- `game.js`
- `index.html`

## 1. Hotbar

Die Hotbar hat nun einen echten ausgewählten Slot.

- Tippen auf einen Slot verschiebt die helle Auswahlmarkierung.
- Wird Gatorade oder Monster ausgewählt, erscheint über der Hotbar ein
  robuster nativer Button `TRINKEN`.
- Erst `TRINKEN` startet die Trinkanimation.
- Beim Ausrüsten über ITEMS wird der entsprechende Getränkeslot automatisch
  ausgewählt.
- Leere Slots sind ebenfalls auswählbar.
- Ticket und Getränke können damit unabhängig voneinander ausgewählt werden.

## 2. Ticket = genau eine Fahrt

Das Tram-Ticket gilt jetzt nur noch für **eine** Fahrt.

Sobald ein Ziel gewählt wurde:

- Ticket wird verbraucht,
- Ticket verschwindet aus ITEMS,
- Ticket verschwindet aus der Hotbar,
- der weiße Einstiegspunkt verschwindet.

Am Ziel muss für eine weitere Fahrt ein neues Ticket gekauft werden.

## 3. Zielauswahl an der Tram

Mit gültigem Ticket öffnet ein Tap auf die Tram nun immer:

`WOHIN?`

Aktuelle Ziele:

- Milchbuck -> Bahnhofstrasse/HB
- Bahnhofstrasse/HB -> Milchbuck

Die Struktur ist so angelegt, dass später weitere Haltestellen als weitere
Zielbuttons ergänzt werden können.

## 4. Ticketautomat Bahnhofstrasse/HB

An Bahnhofstrasse/HB steht jetzt ebenfalls ein anklickbarer Ticketautomat.
Ein dort gekauftes Ticket aktiviert den weißen Punkt an der wartenden Tram.

## 5. Fahrt zurück nach Milchbuck

Mit einem neuen Ticket kann Simon an Bahnhofstrasse/HB `MILCHBUCK` wählen.
Er steigt wieder ein, die Tram fährt ab, die Szene blendet aus und Simon
kommt wieder in Milchbuck an. Coins, HP, Getränkeinventar und Hotbar werden
mitgenommen; das verwendete Ticket ist verbraucht.

## 6. iPhone-Steuerung vor „Der Inder“

Der Fehler war tatsächlich ein Layer-Konflikt:

- Laden-Hitbox: jetzt niedrige Input-Ebene
- Touch-Pfeile: sehr hohe HUD-/Input-Ebene
- Phaser `topOnly` wird explizit aktiviert

Damit gewinnt ein Tap auf ← oder → immer gegen die dahinterliegende
Laden-Hitbox und öffnet nicht mehr versehentlich `Betreten?`.

## Cache

`game.js` wird jetzt als `game.js?v=14` geladen.
