# Simons Abenteuer – Thomas / Pferderennen / Bekanntschaften v37

## Direkt vor der Änderung geprüfter GitHub-Stand
- `game.js`: `5783ebc63e7f8be8b1c09d141c55023712decfe1`
- `index.html`: `9ee9f874266e9dbf672ee7d6071838070c8e7b65`
- `acquaintances-v41.js`: `b388f14f0d5131131c0949a2beafc20fbf0f2449`
- `venice-scene-v39.js`: `367a135a9676a7371ce3948e6b55b807075f2715`
- `progression-markers-v38.js`: `f83e3a7029177b948400281908bd9dd1f1806567`
- `script.js`: `6f7e956074964f5c434fdb69b9dbe374fcc9692d`
- aktuelles `flirt-system-v42.js`: `5938d658f2095c049eb20a06c774f2319b7533f9`

Die aktuelle v42-Flirtlogik bleibt unangetastet im Repository und wird durch einen kleinen v43-Patch nur an der gewünschten REDEN-Stelle korrigiert.

## 1. Frau an der Bar
Beim ersten normalen Gespräch bleibt der bisherige Schuh-Teil erhalten:
1. `Hey, weisch du, wo ich fire Schueh chaufe cha?`
2. `Ja, fahr mit de Tram zur Bahnhofstrass. Det findsch sicher öppis im Schueh-Shop.`
3. `Merci! Willsch mit mir tanze?`

Danach neu exakt:
4. `Du bisch zwar nice...`
5. `aber...`
6. `nöd soooo nice.`

Bei späteren normalen REDEN-Gesprächen wird die bereits bekannte Schuh-Auskunft nicht unnötig wiederholt; Simon beginnt dann direkt mit `Willsch mit mir tanze?` und erhält dieselben drei Antworten.

## 2. Bekanntschaften
Neu eingetragen:
- **Der Inder** – Sonstige; wird beim ersten Ansprechen seines Ladens bekannt.
- **Gandhi** – Sonstige; wird bei der ersten Gandhi-Begegnung bekannt.
- **Thomas** – Sonstige; wird beim ersten Anklicken in Venedig bekannt.

Damit sind Gandhi und Dark Gandhi bewusst zwei Einträge: Gandhi als Begegnung, Dark Gandhi als Bösewicht-Form.

Zusätzlich besitzt `window.SimonAcquaintancesV41.register(...)` jetzt einen generischen Anschluss, damit künftige neue Figuren sofort in dasselbe System aufgenommen werden können.

## 3. Tram in Venedig
Der feste Ankunftspunkt wurde von `x=420` auf `x=330` verschoben.

- Tram-Breite: 250 px
- neue rechte Tramkante: x=580
- Schließfach beginnt bei etwa x=646
- Ticketautomat bei etwa x=735

Damit verdeckt die ankommende Tram weder Schließfach noch Ticketautomat. Die Tram-Hitbox wurde passend mitverschoben.

## 4. Thomas in Venedig
Thomas sitzt als erster neuer NPC rechts vom Bahnhofsbereich bei etwa x=1090:
- junger Mann
- schwarze Haare
- Dreitagebart als Pixel-Stoppeln
- sitzt auf einem Stuhl
- Tisch vor ihm
- drei einfache Pokerkarten in der Hand
- statischer Name `THOMAS`

Beim Anklicken:
`Ciao Simeone, willsch e Rundi Pferderenne spiele?`

Optionen:
- **JA**
- **NEIN**

NEIN schließt den Dialog und gibt die Straße sofort wieder frei.

## 5. Pferderennen mit Thomas
Nach JA öffnet sich ein eigenes Arcade-Fenster:
`PFERDERENNEN MIT THOMAS`

Flow:
1. START
2. Einsatz als ganze Coinzahl wählen
3. Pferd wählen: ♥ HERZ / ♦ KARO / ♣ KREUZ / ♠ PIK
4. Thomas wählt zufällig eine andere Farbe und einen Einsatz von 100–400 Coins
5. Rennbrett

### Rennbrett
Das Brett orientiert sich an der gelieferten Karten-Referenz:
- vier offene Pferde-/Farbenkarten nebeneinander oben
- sechs verdeckte Streckenkarten senkrecht rechts
- verdecktes Deck und zuletzt gezogene Karte unten
- Button **UMDREHEN**

Es werden absichtlich keine Kartenwerte verwendet. Jede Karte trägt nur eines der vier Symbole.

### Rennlogik
- Eine gezogene Farbe bewegt ihr Pferd genau eine Position vor.
- Sobald alle vier Pferde Position 1 erreicht/überschritten haben, wird Streckenkarte 1 aufgedeckt.
- Ihre Farbe bewegt das entsprechende Pferd eine Position zurück.
- Dasselbe gilt später für Positionen 2 bis 6.
- Ein Pferd kann nie hinter die Startposition zurückfallen.
- Sieger ist das erste Pferd, das **Position 6 überschreitet**, also Position 7 erreicht.
- Falls beim selben Zug erst eine Streckenkarte aufgedeckt werden muss, wird deren Rückschritt vor der Siegerprüfung angewandt.

### Auszahlung
- Simons Pferd gewinnt: **+2 × Simons gewählter Einsatz**
- Thomas' Pferd gewinnt: **−Thomas' zufälliger Einsatz (100–400)**
- eine der zwei neutralen Farben gewinnt: **−50 Coins**

Die Verluste werden direkt vom Coin-Konto abgezogen. Das Konto darf dadurch negativ werden. Die bestehenden Kaufprüfungen bleiben erhalten, sodass Simon mit negativem Kontostand keine Gegenstände/Tickets/Bücher kaufen kann.

Developer Mode behält weiterhin ∞ Coins; die Rennlogik läuft trotzdem vollständig durch und zeigt das Ergebnis.

## 6. Negativer Coinstand und Ewige Wiederkehr
Die bisherige Rewind-Wiederherstellung hat negative Coinstände still auf 0 gesetzt. Das wurde korrigiert. Ein negativer Pferderennen-Kontostand bleibt nun auch als regulärer Spielzustand erhalten.

## Dateien hochladen
Ersetzen:
- `game.js`
- `index.html`
- `venice-scene-v39.js`
- `acquaintances-v41.js`

Neu hinzufügen:
- `woman-conversation-v43.js`
- `thomas-horserace-v44.js`

Nicht ersetzen:
- `flirt-system-v42.js`
- `script.js`
- `progression-markers-v38.js`
- übrige bestehende Wrapper

## Cache-Versionen
- `game.js?v=37`
- `venice-scene-v39.js?v=43`
- `acquaintances-v41.js?v=42`
- `flirt-system-v42.js?v=42` unverändert
- `woman-conversation-v43.js?v=43`
- `thomas-horserace-v44.js?v=44`
- `script.js?v=13` unverändert

## Tests
- Syntax aller geänderten/neuen JS-Dateien – PASS
- erstes Frau-an-der-Bar-Gespräch inkl. Schuh-Teil – PASS
- neue drei Ablehnungssätze exakt und einzeln klickbar – PASS
- zweites Gespräch wiederholt Schuh-Auskunft nicht – PASS
- Der Inder / Gandhi / Thomas werden als Bekanntschaften markiert – PASS
- zukünftige dynamische Bekanntschaft registrierbar – PASS
- Kartendeck: 52 Symbole, 13 pro Farbe – PASS
- sechs Streckenkarten werden vom Zugdeck abgetrennt – PASS
- Thomas wählt nie Simons Farbe – PASS
- Thomas-Einsatz immer 100–400 – PASS
- Streckenkarte wirft passende Farbe genau eine Position zurück – PASS
- kein Rückfall hinter Start – PASS
- Sieg erst nach Position 6 – PASS
- Simon-Auszahlung +2× Einsatz – PASS
- Thomas-Verlust −Thomas-Einsatz – PASS
- Neutralverlust −50 – PASS
- Tramgeometrie: rechte Kante 580 < Locker 646 – PASS
- bestehende PWA-/Wrapper-Reihenfolge bleibt erhalten – PASS
