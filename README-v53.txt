SIMONS ABENTEUER – ESTHI v52 + ETH v53

BASIS
Neuester GitHub-main beim Start des Builds:
2474e809f57a39a2aa164d1c172e32c75eebfcce

WICHTIG
- esthi-story-v50.js darf im Repository bleiben, wird aber NICHT mehr geladen.
- eth-campus-v51.js darf im Repository bleiben, wird aber NICHT mehr geladen.
- index.html lädt stattdessen:
  esthi-story-v52.js?v=52
  eth-campus-v53.js?v=53

============================================================
ESTHI v52
============================================================

1. PARK DEUTLICH WEITER VOM HIVE WEG
- HIVE bleibt bei ungefähr x=1030.
- Zwischen HIVE und Park liegt jetzt ein richtiger neutraler Zürich-Abschnitt:
  Wohnhäuser, Gehwegplatten, Laternen und Fahrrad.
- Park beginnt erst ungefähr bei x=1855.
- Bank ungefähr x=2125.
- SPAR ungefähr x=2460–2740.

2. SCHUH-PROGRESSIONSSPERRE
Vor dem Esthi-Bereich liegt bei ca. x=1695 eine unsichtbare Storygrenze.

Solange Simons Schuh-Story noch nicht erledigt ist:
- Simon wird sanft vor die Grenze zurückgesetzt.
- beim ersten Versuch Denkblase:
  "Ich sollte erstmal nach den Schuhen schauen."
- bei späteren Versuchen:
  "Erst die Schuhe."
- Klick schließt die Denkblase und gibt sofort die Steuerung zurück.
- kein Türsteher.
- Enrique wird nicht erwähnt.

3. WORAN WIRD FREISCHALTUNG ERKANNT?
Das jetzige Basisspiel besitzt noch keinen finalen Fire-Shoes-Inventargegenstand.
Deshalb:
- zukünftige explizite Flags wie hasFireShoes / fireShoesOwned werden bevorzugt
- aktuell gilt der vorhandene, über Tramfahrten persistente
  amsifStoryCompleted-Flag als Schuh-Progression

Sobald die Bedingung erfüllt ist:
- Sperre verschwindet ohne Banner
- Simon läuft normal weiter
- erst beim eigentlichen Parkeintritt startet Esthis Story

4. ESTHI-STORY
Die eigentliche v50-Geschichte bleibt unverändert:
Waschmittel -> SPAR -> Bank -> Füttern -> Puderzucker -> erster Kuss.
Danach steht Esthi weiter dauerhaft im Park.
Keine Snack-Bar / kein Healing.

5. DEVELOPER
MILCHBUCK / ESTHI umgeht die Schuhsperre absichtlich.

============================================================
ETH v53
============================================================

1. CAMPUS-ZUGANG WEITER WEG VON DER TRAM
Der ETH-Zugang liegt jetzt ungefähr bei x=285.
Der Bahnhofquai-Unterstand beginnt im Basisspiel ungefähr bei x=610.
Dadurch liegen Tram- und ETH-/Polybahn-Hotspot klar auseinander.

Kein zusätzlicher UI-Button neben der Tram.
Man klickt eine echte Welt-Tür / einen Welt-Hotspot.

2. CENTRAL IST JETZT EINE EIGENE SPIELBARE SZENE
Simon läuft durch einen kleinen Zürcher Central-Bereich:
- alte Fassaden
- Limmat
- Tramgleise im Hintergrund
- echter Gehweg mit Bordstein und Platten
- untere Polybahnstation als richtiges Gebäude

Der schräge Bahnhang ist KEIN begehbarer Spielboden mehr.

3. POLYBAHN KOMPLETT NEU
Beim Betreten der Talstation:
- Central blendet aus
- eigene kurze Polybahn-Fahrtszene
- Simon steht sichtbar IM roten Wagen
- Wagen fährt tatsächlich entlang fester schräger Schienen
- Stadt- und Hangebenen bewegen sich als Parallax-Hintergrund relativ nach unten
- Dauer ca. 3,25 Sekunden
- danach Ankunft oben

Rückfahrt funktioniert umgekehrt.

4. POLYTERRASSE ALS EIGENE SPIELWELT
Oben gibt es jetzt eine separate horizontal spielbare Polyterrasse:
- große Steinplatten statt flachem Universalboden
- richtige Brüstung
- Zürich-/See-/Altstadtpanorama
- Grossmünster-Silhouette
- Bänke
- Fahrräder
- obere Polybahnstation
- UZH als Nachbargebäude
- breitere ETH-Fassade

Von dort läuft Simon normal zum ETH-Hauptgebäude.

5. ETH-INNENRAUM
Gleiche Regeln wie zuvor:
- A/D / Pfeile
- W / hoch springen
- Tanzen
- Touchsteuerung
- ITEMS
- Hotbar
- Rauchen
- Trinken
- Bücher
- gemeinsamer Coins-/HP-/Inventar-State

6. EINSTEIN
- Statue besitzt KEINEN Collider mehr.
- Simon kann einfach an ihr vorbeilaufen.
- Klick-Hitbox bleibt bestehen.
- 100 Fragen bleiben.
- richtig: +20 Coins
- falsch: KEIN Geldverlust
- falsch: Einstein sagt nur noch trocken "Nein."
- keine richtige Antwort
- keine Physikerklärung
- danach wird er wieder Statue
- eine Frage pro Besuch bleibt

7. DEVELOPER MODE
8. POLYBAHN / ETH

Startet jetzt bei Central direkt vor der Polybahn, damit gerade die neue Fahrt
mitgetestet wird — nicht mehr unmittelbar bei Einstein.

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. esthi-story-v52.js hinzufügen.
4. eth-campus-v53.js hinzufügen.
5. Hard Reload / Cache leeren.

Alte esthi-story-v50.js und eth-campus-v51.js müssen nicht gelöscht werden.
Die neue index.html lädt sie nicht mehr.
