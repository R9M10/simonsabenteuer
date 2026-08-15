# Simons Abenteuer – Rückfahrt + Camel/Sprint v16

Unmittelbar vor der Änderung wurde der aktuelle GitHub-Stand geprüft:

- `game.js`: `615cac1d44b3a5c7b1478dbaf34490716af32e20`
- `index.html`: `ecf12de18cbd0cb0b3ee8c7805cdc12758f6f222`
- `hive-expansion.js`: `dae204ca8f2bef85e0fb64a1f5487c224d5444e4`

Die aktuelle HIVE-Erweiterung deiner Freundin wird nicht verändert.

## Dateien ersetzen

- `game.js`
- `index.html`

## Rückfahrt Bahnhofstrasse -> Milchbuck

Der Rückweg setzt jetzt beim erneuten Erstellen der Milchbuck-Szene alle
transienten Sperren zurück:

- `uiLocked = false`
- Tram-/Löwen-/Kampf-/Dialog-Locks aus
- Touchzustände zurückgesetzt
- Spieler sichtbar und aktiv
- Physics-Body explizit aktiviert
- Kamera-FX, Alpha und Scroll explizit zurückgesetzt
- Touchsteuerung explizit wieder eingeschaltet

Außerdem wird ein alter Developer-Sprung (`startMode = hb`) beim Zurückfahren
neutralisiert. Das ist speziell für den schwarzen Bildschirm im Developer
Mode wichtig.

## Camel Gelb

Neues kaufbares Item bei „Der Inder“:

- `Camel Gelb`
- Preis pro Zigarette: `0.5 Coins`
- wird einzeln dem Inventar hinzugefügt
- besitzt ein `i` wie die anderen Items
- kann in einen der fünf Hotbar-Slots gelegt werden

Wird Camel in der Hotbar ausgewählt, erscheint:

`RAUCHEN · CAMEL GELB`

Beim Benutzen:

- kurze Rauch-/Zigarettenanimation bei Simon
- drei aufsteigende Rauchwolken
- eine Zigarette wird verbraucht
- Sprintmodus wird für 60 Sekunden aktiviert
- Simon läuft in dieser Zeit mit doppelter Geschwindigkeit: 350 statt 175

Rechts am Bildschirm erscheint während des Effekts eine kleine Zigarette.
In den letzten 10 Sekunden beginnt sie zu blinken und verschwindet nach Ablauf.

Der Sprint-Zeitpunkt wird als echter Zeitstempel gespeichert und durch
Tram-Szenenwechsel mitgenommen.

## Store

Der Shop zeigt nun:

- Gatorade · 10 Coins · +10 HP
- Monster Energy · 30 Coins · +30 HP
- Camel Gelb · 0.5 Coins · Sprint 60 Sek.

## Cache

`game.js?v=16`
