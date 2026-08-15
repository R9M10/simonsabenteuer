# Simons Abenteuer – Store Items, Drink-System, Developer Coins

Diese Änderung wurde **nach erneutem Lesen des aktuellen GitHub-Standes** gebaut.

Verifizierter Ausgangsstand:

- `game.js`: `6294ecac35c6fac0fad6f692c2a98ac7a9c3e865`
- `index.html`: `33c38745473e3760d10b416023a279397df7f33d`
- `script.js`: `039f3ab8e7127a8bd145e23e7be069d00a181df0`

Die neuen Dateien deiner Freundin bleiben erhalten und werden nicht ersetzt:

- `hive-expansion.js?v=13`
- `flight-intro.js?v=13`

## Zu ersetzen

- `game.js`
- `index.html`
- `script.js`

## Änderungen

### Der Inder

- Der Laden steht jetzt deutlich weiter rechts von der Haltestelle.
- Er liegt visuell wie das HIVE weiter hinten in der Welt.
- Gemüseauslage und Ladenfassade liegen hinter Simon bzw. der Straßenebene.
- Im Laden gibt es keinen sichtbaren `EINKAUFEN`-Button mehr.
- Stattdessen öffnet ein Tap direkt auf den Verkäufer das Einkaufsfenster.
- Während das Einkaufsfenster offen ist, liegt kein alter Ladenbutton mehr darüber.
- Im Einkaufsfenster gibt es nur `← LADEN`.
- Im Laden selbst bleibt `← STRASSE` erhalten.

### Neue Store-Items

#### Gatorade
- giftgrüne Flasche
- Preis: 10 Coins
- regeneriert 10 HP
- wird beim Trinken verbraucht

#### Monster Energy
- orange Dose
- Preis: 30 Coins
- regeneriert 30 HP
- wird beim Trinken verbraucht

Beide Items können mehrfach gekauft werden.

### Items / Ausrüsten

Gekaufte Getränke erscheinen unter `ITEMS`.

Jedes Item kann dort:
- über `AUSRÜSTEN` in die Hotbar gelegt werden
- über das kleine `i` erklärt werden

Auch das Ticket besitzt jetzt ein kleines `i`.

### Hotbar / Trinken

- Gatorade und Monster erscheinen nach dem Ausrüsten in der bestehenden Hotbar.
- Tap auf ein Getränk in der Hotbar startet eine Trinkanimation:
  - Flasche/Dose bewegt sich zu Simons Mund
  - kippt sichtbar
  - Simon bewegt sich dabei leicht
  - anschließend wird HP regeneriert
  - das verbrauchte Item wird aus dem Inventar abgezogen
- Ist der Bestand danach 0, verschwindet das Item automatisch aus der Hotbar.

### Developer Mode

Wenn Developer Mode AN ist:
- wird intern ein sehr großer Coin-Vorrat verwendet
- das normale Coin-HUD zeigt `∞`
- Ticketkäufe und die neuen Store-Items ziehen keine Coins ab
- auch ein normaler Story-Start über das Developer-Menü behält den Developer-Status

### Info-Buttons

Im Store und im Items-Menü hat jedes relevante Item ein kleines `i`.
Dort werden Preis/Wirkung bzw. die Funktion des Items erklärt.

## Cache

- `game.js?v=12`
- `script.js?v=11`

Die Versionen von `hive-expansion.js` und `flight-intro.js` bleiben unverändert.
