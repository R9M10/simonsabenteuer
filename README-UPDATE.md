# Simons Abenteuer – Stabilitätsfix v15

Direkt vor dieser Änderung wurde der aktuelle GitHub-Stand geprüft:

- `game.js`: `974c17827a93f1dec34dbf31b2a3e134cd5a64e4`
- `index.html`: `c23708c7a930c0d063cc408c271a5f1b138d09b8`
- `hive-expansion.js`: `dae204ca8f2bef85e0fb64a1f5487c224d5444e4`

Die aktuelle `hive-expansion.js` deiner Freundin wird nicht ersetzt.

## Dateien ersetzen

- `game.js`
- `index.html`

## Löwenauswahl

Beim Entfernen der Löwenauswahl wird der UI-Lock jetzt explizit gelöst.
Die Touchsteuerung wird wieder aktiviert. Das greift auch bei den von
`hive-expansion.js` gewrappten Löwenpfaden, ohne diese Datei zu überschreiben.

## Rückfahrt Bahnhofstrasse -> Milchbuck

Der schwarze Bildschirm wurde an der Kamera-/Szenenrückkehr abgesichert:

- alter Fade-State von Milchbuck wird zurückgesetzt,
- Zielkamera wird explizit sichtbar gesetzt,
- der Wechsel hängt nicht mehr vom `FADE_OUT_COMPLETE`-Event ab,
- alte Hotbar-DOM-Elemente werden beim Szenenwechsel entfernt.

## Hotbar

Die Hotbar ist jetzt als native HTML-Touchleiste umgesetzt:

- genau 5 Slots,
- direktes Antippen unten wählt einen Slot,
- gelber Rahmen zeigt den aktiven Slot,
- bei Gatorade/Monster erscheint `TRINKEN`,
- kein ITEMS-Menü nötig, um zwischen bereits in der Hotbar liegenden Items
  umzuschalten.

Das ITEMS-Menü entscheidet nur noch, welche maximal 5 Items unten liegen:
`IN HOTBAR` / `ENTFERNEN`.

Damit kann das Inventar später viel mehr als fünf Items enthalten.

## HP

Das Herz wurde als sauberes Pixel-Herz neu gezeichnet.

## Cache

`game.js?v=15`
