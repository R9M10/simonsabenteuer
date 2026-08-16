# Simons Abenteuer – Indoor / Dialog / Loot / Venice Stability v38

## Direkt vor der Änderung erneut geprüfter GitHub-Stand
- `game.js`: `5783ebc63e7f8be8b1c09d141c55023712decfe1`
- `index.html`: `ee05e19c930260e16615629dfdc690b7b9a60ab0`
- `venice-scene-v39.js`: `74bd1537c111a7443182b36d1c903b734b4e7c1a`
- aktuelles Flirtsystem: `flirt-system-v46.js?v=46`

Die Änderungen deiner Freundin in v46 bleiben vollständig erhalten.

## 1. Doppelte Hotbar in Innenräumen
v46 fügt absichtlich eine eigene Indoor-Hotbar für HIVE/Zofingia hinzu.
Gleichzeitig blieb die normale Overworld-Hotbar sichtbar.

Jetzt:
- sobald die funktionale `indoor-hotbar-v46` vorhanden ist, wird nur die alte Overworld-Hotbar versteckt;
- die v46-Indoor-Hotbar bleibt sichtbar und anklickbar;
- beim Verlassen des Innenraums wird die normale Hotbar automatisch wiederhergestellt;
- dieselbe Regel gilt für zukünftige Innenräume, sobald sie die gemeinsame v46-Indoor-Hotbar verwenden.

## 2. De zweiti Blick
`Der zweite Blick` / `De zweite Blick` wird auf:
`De zweiti Blick`
vereinheitlicht.

Das betrifft:
- Flirtname im Inventar,
- Enrique-Dialog,
- bereits offene DOM-Texte,
- neue Sprechblasen.

## 3. Loot hat Vorrang vor Laden / Türen / Schaltflächen
Alle Figuren, die über den gemeinsamen Loot-Marker plünderbar gemacht werden, erhalten automatisch Input-Priorität.

Technisch:
- lootbarer Körper wird auf World-Depth 245 angehoben;
- `input.setTopOnly(true)` bleibt erzwungen;
- Stores, Innenraum-Eingänge, Automaten usw. liegen darunter.

Dadurch öffnet ein Klick auf einen vor einem Laden liegenden Milchmann/Türsteher/sonstigen zukünftigen lootbaren Charakter zuerst die Plünderungsoption.

## 4. Dialog-Minimum 0,25 Sekunden
Alle Core-`dialogueIgnoreUntil`-Werte liegen jetzt bei mindestens 250 ms.

Aktueller Stand:
- Core: mindestens 250 ms
- Frau v43: 310 ms
- Bekanntschaften v41: 280 ms
- Flirt/Enrique v46: 300 ms

Für neue Dialogsysteme stellt `window.SimonDialogueGuardV47` denselben 250-ms-Standard bereit.

## 5. Venedig – hellblauer Bildschirm / Erreichbarkeit
Die Venedig-Szene wurde gehärtet:

- `VeniceScene` wird als Klasse global verfügbar gemacht.
- v47 prüft unmittelbar vor jeder Venedig-Abfahrt, ob die Scene im Phaser-SceneManager registriert ist.
- fehlt sie durch eine Wrapper-/Startketten-Kollision, wird sie erneut registriert.
- der Venedig-Aufbau läuft jetzt in separaten Stages:
  Himmel, Ferne Stadt, mittlere Stadt, Bahnhof, Promenade, Ticketautomat, Locker, Tram.
- ein Fehler in einem einzelnen nichtkritischen Stage kann nicht mehr den gesamten `create()`-Ablauf abbrechen und nur den hellblauen Camera-Background hinterlassen.
- ein festhängender Arrival-State besitzt einen zusätzlichen Recovery-Watchdog.

Damit bleibt die vorhandene Venedig-Architektur/Thomas-Logik unangetastet, während der Einstieg robuster gegen spätere Wrapper wird.

## Dateien hochladen
Ersetzen:
- `game.js`
- `index.html`
- `venice-scene-v39.js`

Neu:
- `stability-v47.js`

Nicht ersetzen:
- `flirt-system-v46.js`
- `acquaintances-v41.js`
- `woman-conversation-v43.js`
- `thomas-horserace-v44.js`
- alle übrigen Friend-/Wrapper-Dateien

## Cache
- `game.js?v=38`
- `venice-scene-v39.js?v=44`
- `stability-v47.js?v=47`

## Tests
- `node --check game.js` – PASS
- `node --check venice-scene-v39.js` – PASS
- `node --check stability-v47.js` – PASS
- lootbarer Körper Depth 245 / top-only – PASS
- Indoor-Hotbar: nur eine sichtbar – PASS
- Overworld-Hotbar nach Innenraum wiederhergestellt – PASS
- `De zweiti Blick` Katalog + Sprechblase – PASS
- VeniceScene Re-Registration vor Abfahrt – PASS
- Venedig: simulierter Fehler in einem World-Stage stoppt restlichen Aufbau nicht – PASS
- alle Core-Dialogdelays >= 250 ms – PASS
