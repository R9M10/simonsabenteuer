SIMONS ABENTEUER – v46 STABILITY / FLIRTS / INDOOR ITEMS

BASIS
- GitHub main beim Build: a3f15d96ec58d0874dd5e60e710811600a31b7f6
- game.js?v=37
- simon-ui-v37.js?v=37
- progression-markers-v38.js?v=39
- venice-scene-v39.js?v=43
- acquaintances-v41.js?v=42
- woman-conversation-v43.js?v=43
- thomas-horserace-v44.js?v=44
- script.js?v=13

ARCHITEKTURÄNDERUNG FÜR STABILITÄT
- flirt-system-v42.js wird NICHT mehr geladen.
- flirt-system-v45.js wird NICHT mehr geladen.
- v46 ist der einzige Besitzer von:
  - learnedFlirts
  - Frau-Flirtmenü
  - Enrique-Flirts
  - Playbook-Flirtfreischaltung
  - FLIRTS-Inventartab
- woman-conversation-v43 bleibt nur für den normalen ERSTEN Frauendialog zuständig.
- Der alte State-Key __SIMON_FLIRT_STATE_V40__ bleibt als Kompatibilität
  für acquaintances-v41 bestehen.

1. MILCHMANN
- startMilkmanFight() löscht die Sprechblase zwingend vor und nach dem Übergang.
- advanceMilkmanDialogue() räumt die Bubble auf, sobald Dialog/Fight-State wechselt.
- zusätzlicher Frame-Watchdog:
  Bubble + kein aktiver Milkman-Dialog / Fight aktiv / Milkman weg => sofort destroy.
- Shutdown räumt Bubble ebenfalls auf.

2. ENRIQUE DEAD-INPUT
- transparente alte Sequenz-Overlays werden beim Menüwechsel beseitigt.
- stale __sv37EnriqueModal-Sentinels werden repariert.
- nach dem dritten gekauften Flirt geht Simon zurück ins Enrique-Hauptmenü
  statt in ein Untermenü voller deaktivierter Buttons.
- ZURÜCK räumt Modal + Locks auf.
- zusätzlicher Recover-Hook:
  SimonFlirtsV46.recoverEnrique()

3. DEVELOPER HIVE / BEOBACHTEN
Developer-Ziel HIVE:
- markiert den ersten Standarddialog als bereits gesehen
- BEOBACHTEN ist deshalb sofort testbar
- alle 7 Flirts sind zum Test gelernt
- 5 Zigaretten, Gatorade, Monster und Testbücher werden in die Hotbar gelegt

Normalspiel:
- erster Klick auf Frau = normaler v43-Dialog
- zweiter/späterer Klick = BEOBACHTEN / FLIRTEN / ZURÜCK

4. ALTER "FLIRT-SHOP VERKNÜPFEN"-TEXT
- Ursache war hive-language-patch-v19, das openWomanMenu verzögert installieren kann.
- v46 setzt die kanonische openWomanMenu-Funktion kontinuierlich wieder durch.
- Die alte Platzhalter-Flirt-Erklärung kann das aktuelle Menü dadurch nicht mehr übernehmen.
- FLIRTEN zeigt immer direkt alle learnedFlirts.

5. INDOOR ITEMS
HIVE und Zofingia besitzen jetzt oben mittig dieselbe kleine 5-Slot-Hotbar.
Slots sind mit der normalen Hotbar synchron.

Unterstützt:
- Zigarette -> RAUCHEN + Sprint-Timer
- Gatorade -> TRINKEN + Heilung
- Monster -> TRINKEN + Heilung
- Bücher -> LESEN
- Playbook kann auch indoor seine Flirts freischalten
- andere Waffen/Tickets werden als NICHT HIER markiert

Zigarette/Drink/Buch bekommen zunächst nur kleine Prop-Animationen.
Exakte Full-Body-Handlungsloops können später ergänzt werden.

6. FLIRTQUELLEN – NEU

ENRIQUE GRATIS
- Der zweite Blick

ENRIQUE · JE 100 COINS
- Lorenzo Von Matterhorn
- SNASA
- The Ted Mosby

THE PLAYBOOK
Drei neue, bewusst für Simons Abenteuer erfundene HIMYM-/Playbook-artige Moves:
- The Accidental Plus-One
- The Lost Bet
- The Last Seat

Damit weiterhin insgesamt 7 Flirts.

7. FRAU
- alle erlernten Flirts werden direkt angezeigt
- passende Sprechblasen für alle 7 vorhanden
- aktuell ziehen ALLE Flirts bei ALLEN Frauen
- pro Besuch trotzdem nur ein Versuch
- bereits bei ihr probierte Flirts bleiben dauerhaft gesperrt

8. INVENTAR
Tabs bleiben:
- GEGENSTÄNDE
- FÄHIGKEITEN
- BEKANNTSCHAFTEN
- FLIRTS

Jeder gelernte Flirt zeigt:
- Quelle
- Name
- Beschreibung

EINBAU
1. ZIP entpacken.
2. index.html ersetzen.
3. flirt-system-v46.js in den Repo-Hauptordner.
4. Hard Reload.

Alte flirt-system-v42.js / flirt-system-v45.js dürfen physisch liegen bleiben.
Die neue index.html lädt sie nicht.
