# Simons Abenteuer – Thomas / Palazzo Medici / Indoor-Hotbar v39

## Direkt vor der Änderung erneut geprüfter GitHub-Stand
- `game.js`: `e0ef4b7aa6c9225141c0a55d9d2dc4d1c3789d16`
- `index.html`: `b3059f4d0832ef82597b651d88da5cadbdfb1230`
- `thomas-horserace-v44.js`: `47941c42f60962bd399480e3765c30b78bd34604`
- `stability-v47.js`: `ee4e7694d15f6bab74e0e04c93612a3399e1586d`

Die aktuellen Änderungen deiner Freundin (`flirt-system-v46.js`) bleiben unverändert.

## 1. Innenräume: keine Hotbar mehr
In HIVE, Zofingia, Palazzo Medici und allen zukünftigen Szenen, die
`__simonInteriorScene = true` verwenden, wird die Hotbar vollständig entfernt.

Versteckt werden:
- normale Hotbar
- Hotbar-Aktionsbutton
- v46 Indoor-Hotbar

Beim Verlassen eines Innenraums wird die normale Außenwelt-Hotbar wiederhergestellt.
Die v46-Indoor-Hotbar bekommt zusätzlich CSS `display:none !important`, damit sie
nicht für einen Frame aufblitzen kann.

## 2. Loot-Punkte weiter unten
Alle aktuellen Loot-Punkte wurden 12 Pixel nach unten verschoben:
- Türsteher
- Milchmann
- Gandhi / Dark Gandhi

Auch der gemeinsame Default für zukünftige lootbare Charaktere liegt jetzt
bei `offsetY = +12`.

Die Loot-Input-Priorität aus v38 bleibt erhalten.

## 3. Pferderennen – neue neutrale Verlustregel
Wenn weder Simon noch Thomas gewinnen:

`Verlust = max(50, ceil(25% von Simons Einsatz))`

Beispiele:
- Einsatz 100 -> Verlust 50
- Einsatz 200 -> Verlust 50
- Einsatz 300 -> Verlust 75
- Einsatz 400 -> Verlust 100

Das Coin-Konto darf wie bisher durch Verluste negativ werden.

## 4. Thomas' Geldlimit
Über mehrere Runden werden alle positiven Auszahlungen an Simon addiert.

- bis exakt 1000 gewonnenen Coins: Thomas spielt weiter
- sobald die Summe **mehr als 1000** beträgt: Thomas ist für 10 Minuten pleite
- Meldung:
  `Thomas hat kein Geld mehr, versuche es später noch einmal.`
- beim Anklicken während der Sperre wird zusätzlich die verbleibende Zeit angezeigt
- nach exakt 10 Minuten wird Thomas' Auszahlungsfenster auf 0 zurückgesetzt und er spielt wieder

Der Zustand bleibt beim Wechsel zwischen Szenen innerhalb der laufenden Spielsitzung erhalten.

## 5. Palazzo Medici in Venedig
Direkt rechts neben Thomas steht jetzt ein großer, begehbarer Palazzo.

Außen:
- `PALAZZO MEDICI`
- monumentale Renaissance-Fassade
- stark rustiziertes Erdgeschoss
- zwei Piano-nobile-Ebenen
- hohe Bogenfenster
- zentraler Balkon
- riesiges Rundbogenportal
- Dachbalustrade
- Medici-Wappen mit sechs Kugeln
- warme Pietra-forte-/Florentiner Farbgebung

Der Eingang ist anklickbar und besitzt einen weißen Interaktionspunkt direkt an der Tür.

## 6. Palazzo-Innenraum
Der Palazzo hat eine eigene begehbare Phaser-Szene:
`PalazzoMediciScene`

Innen:
- großer Marmor-/Steinboden
- monumentale Säulen
- Arkaden
- Kassettendecke
- Medici-Banner und Wappen
- vergoldete Gemälderahmen
- Kronleuchter
- frei begehbarer langer Saal

Simon kann normal links/rechts laufen und springen.

Zurück auf die Straße:
- die linke Tür `USCITA` anklicken
- oder direkt durch das linke Portal hinauslaufen

Die Venedig-Szene wird beim Eintritt nur pausiert, nicht neu aufgebaut.
Dadurch bleiben Coins, Inventar, Thomas, Tram und Storyzustände exakt erhalten.

Im Palazzo wird absichtlich **kein HUD/keine Hotbar** erzeugt.

## Dateien hochladen
Ersetzen:
- `game.js`
- `index.html`
- `thomas-horserace-v44.js`
- `stability-v47.js`

Neu:
- `palazzo-medici-v48.js`

Nicht ersetzen:
- `flirt-system-v46.js`
- `venice-scene-v39.js`
- `acquaintances-v41.js`
- `woman-conversation-v43.js`
- übrige Wrapper-Dateien

## Cache-Versionen
- `game.js?v=39`
- `thomas-horserace-v44.js?v=45`
- `palazzo-medici-v48.js?v=48`
- `stability-v47.js?v=48`

## Tests
- Syntax aller geänderten/neuen JS-Dateien – PASS
- neutraler Verlust: 25%, mindestens 50 – PASS
- 333 Einsatz -> 84 Verlust – PASS
- exakt 1000 Gesamtgewinn -> Thomas spielt weiter – PASS
- 1001 Gesamtgewinn -> 10-Minuten-Sperre – PASS
- Sperre endet erst nach 600000 ms – PASS
- Gesamtgewinn wird nach Cooldown zurückgesetzt – PASS
- alle Hotbars/Aktionsbuttons innen ausgeblendet – PASS
- Außenwelt-Hotbar nach Innenraum wiederhergestellt – PASS
- PalazzoMediciScene registriert – PASS
- Palazzo als Interior markiert – PASS
- aktuelle und zukünftige Loot-Punkte +12 px – PASS
