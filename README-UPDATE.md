# Simons Abenteuer – Tram Loop + Ewige Wiederkehr + Für sich sein v22

Direkt vor dem Build wurde der aktuelle GitHub-Stand verifiziert:

- game.js: `59dc672524fbcc99d07a347459e1cb332aa87a4d`
- index.html: `a8848e73e7b661f314b31b49ef80378232b0479a`
- hive-expansion.js: `b9f89ac568cb0954cb0e72a7a897ddf95c25f98f` (v14.2)
- game-polish-v15.js: `e51362977085d3167e40d3e93612546ebbb8bf1e`

Die Dateien deiner Freundin (`hive-expansion.js`, `game-polish-v15.js`,
`flight-intro.js`, `opening-scene-v15.css`) bleiben unangetastet.

## Dateien ersetzen

- `game.js`
- `index.html`

## 1. Tram: beliebig oft hin und her

Der Bahnhofstrasse-Scene wird von Phaser wiederverwendet. `arrivalFinished`
blieb nach dem ersten Besuch auf `true`; beim nächsten Besuch brach
`playArrivalAnimation()` deshalb sofort ab und Simon blieb unsichtbar in der
Tram.

Bei **jeder** neuen Ankunft werden nun sauber zurückgesetzt:

- `arrivalFinished = false`
- arrival tram / door / hitbox references
- tram transit state
- UI locks
- ability transient state

Damit kann mit jeweils einem gültigen Einzelfahrt-Ticket wiederholt gefahren
werden:

Milchbuck -> Bahnhofstrasse -> Milchbuck -> Bahnhofstrasse -> ...

## 2. Also sprach Zarathustra -> Ewige Wiederkehr

Beim ersten Lesen von `Also sprach Zarathustra` wird freigeschaltet:

`Ewige Wiederkehr`

Nur beim ersten Lesen erscheint drei Sekunden der Unlock-Banner.

Wenn die Fähigkeit unter FÄHIGKEITEN ausgerüstet ist:

- oben erscheint ein goldenes Kreis-/Wiederkehrsymbol
- über J/X erscheint der Touchbutton `W`

`W` springt auf einen gespeicherten Spielzustand ungefähr exakt drei Sekunden
zurück.

Zurückgesetzt werden u. a.:

- Simons Position und Bewegung
- HP
- Coins
- Verbrauchsitems
- Hotbar
- Ticketzustand
- Sprint-Restzeit
- Milchmann-HP / Position
- aktuell fliegende Milchflaschen
- Super-Milch-Zustand
- nächster Milch-Wurf

Der Milchmann benutzt nun für seine ohnehin zufälligen 1–3-Sekunden-Abstände
einen lokalen deterministischen Zufallszustand. Dieser wird ebenfalls
zurückgespult. Dadurch läuft der zufällige Wurfrhythmus nach der Wiederkehr
wieder gleich weiter, während Simon anders reagieren kann.

Nach einer Wiederkehr wird die alte Zeitlinie verworfen; erst nach drei neu
gespielten Sekunden ist W wieder verfügbar.

## 3. Phänomenologie des Geistes -> Für sich sein

Beim ersten Lesen wird freigeschaltet:

`Für sich sein`

Ist die Fähigkeit aktiv:

- oben erscheint ein Void-/Einzelsymbol
- über J/X erscheint `F`

Mit F betritt Simon einen dunklen Void.

Dort:
- die Außenwelt steht still
- Simon bleibt sichtbar
- Hotbar bleibt benutzbar
- ITEMS bleibt erreichbar
- Gatorade / Monster / Zigarette / Bücher können benutzt bzw. gelesen werden
- ein nativer `← ZURÜCK`-Button bringt Simon exakt zurück auf die Map

Während der Void-Zeit werden externe Milchmann-/Projectile-Timer verschoben,
damit draußen keine Zeit "heimlich" weiterläuft.

Cooldown:
- eine Aktivierung alle 5 Minuten
- der F-Button zeigt `BEREIT` oder die Restzeit
- der Cooldown wird durch Tramfahrten mitgenommen

## 4. Fähigkeiten

Es bleibt bei genau **einer aktiven Fähigkeit gleichzeitig**.

Aktuell:
- Wurmloch
- Ewige Wiederkehr
- Für sich sein

Jede besitzt ein eigenes Symbol oben in der Mitte.

## 5. Super Milch

Unverändert korrekt:
- normale Milch: 225
- SUPER MILCH: 337.5
- exakt 1.5x Geschwindigkeit
- 10 bzw. 20 Schaden

## Cache

`game.js?v=22`
