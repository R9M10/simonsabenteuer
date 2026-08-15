# Simons Abenteuer – Milchmann Story Fight v18

Unmittelbar vor dem Build wurde der aktuelle Repository-Stand geprüft:

- `game.js`: `81f566e68b5e74c8997a9f48dda0723e88b0c8e6`
- `index.html`: `0179c7d461056d7991094abdd06aadd9bcc18c52`
- `hive-expansion.js`: `b9f89ac568cb0954cb0e72a7a897ddf95c25f98f` (Version 14.2)

Die aktuelle `hive-expansion.js` deiner Freundin wird **nicht ersetzt**.

## Dateien ersetzen

- `game.js`
- `index.html`

## Milchmann-Story

Beim **ersten Verlassen von Orell Füssli**:

1. Ein weiß-blauer Milchlieferwagen fährt von rechts ins aktuelle Kamerabild.
2. Ein wütender Milchmann steigt aus.
3. Dialog per Bildschirmtap:
   - `Dich kenn ich doch!`
   - `Din Fründ het mer mini Milch klaut!`
   - `Jetzt wirsch mini rache spüre!`
4. Nach dem nächsten Tap beginnt der Kampf.

### Kampf

- Milchmann: 100 HP.
- Seine exakte Healthbar steht direkt über ihm und bewegt sich mit ihm.
- Alle 2 Sekunden wirft er eine Milchflasche.
- Die Flasche fliegt knapp über dem Boden, sodass Simon darüber springen kann.
- Treffer an Simon: -10 HP + HIT-Animation.
- X bleibt optisch Simons Schlag/Attack-Animation.
- Ist der Milchmann in Schlagreichweite und vor Simon: -10 HP.
- Bewegt Simon sich weit weg, folgt der Milchmann ihm.
- Während Dialog/Kampf können keine Stores betreten werden.
- Während Dialog/Kampf kann auch nicht per Tram aus dem Kampf geflohen werden.

Nach 0 HP fällt der Milchmann um und bleibt anklickbar.

Dann:

`Milchmann beklauen?`

- JA -> +500 Coins (einmalig)
- NEIN -> Fenster schließt

## Store-Hitbox-Fix

`Der Inder` und `Orell Füssli` reagieren jetzt nur noch auf ihre Fassaden
**oberhalb der Tramgleise**.

Zusätzlich werden ihre Welt-Hitboxen deaktiviert, sobald:
- ITEMS offen ist,
- ein Infofenster offen ist,
- ein Store-/Kaufffenster offen ist,
- ein Ticket-/Tramdialog offen ist,
- der Milchmann-Dialog/Kampf aktiv ist.

Damit können Hotbar/Items/Touchbuttons keinen Store mehr versehentlich öffnen.

## Rückkehr nach Milchbuck / HIVE

Bei einer Rückkehr von Bahnhofstrasse wird der alte, erneut erzeugte
prozedurale Türsteher entfernt.

Danach wird ein frischer HIVE-Eingang erzeugt, der direkt die **aktuelle
`HiveInteriorScene` aus `hive-expansion.js v14.2`** startet. Damit bleiben die
neuen HIVE-Funktionen deiner Freundin (Bar/Brouwes, Frau, Wallet, Drunk-Effect
usw.) erhalten.

## Cache

`game.js?v=18`
