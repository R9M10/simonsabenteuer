SIMONS ABENTEUER — BUGFIX v77

BASIS
Aktueller GitHub main beim Start:
203c94dbc5fb05e231c3eaa4df21e3251081d7f4

Dieses Update verändert GitHub NICHT.
ZIP direkt ins Repository-Root hochladen.

FIXES

1. LÖWE / TANZEN
- JA startet nicht mehr sofort den HIVE-Overlay.
- Simon läuft zuerst neben den Löwen.
- ca. 3 Sekunden echte choreografierte Bewegung:
  Seitenschritte, Richtungswechsel, zwei klare Sprünge/Hops,
  unterschiedliche Körperwinkel und Musiknoten.
- Der Löwe reagiert/bounced im Rhythmus.
- Erst danach startet die normale HIVE-Tanzsequenz.
- Keine neuen Simon-Sprites; die gewünschten alten Simon-Animationen bleiben.

2. WG / SIMONS ZIMMER
Ursache:
oerlikon-v59 pausierte den Flur und rief danach ScenePlugin.start(Room) auf.
ScenePlugin.start kann die Quellszene stoppen; dadurch war der Flur nachher
nicht mehr zuverlässig vorhanden.

v77:
- SIMON-Tür: WG pausieren -> SimonRoomScene LAUNCHEN.
- kein ScenePlugin.start mehr bei dieser Tür.
- Zimmer -> Flur: Flur zuerst resumieren, dann Zimmer stoppen.
- Flur -> Oerlikon: Oerlikon zuerst vollständig resumieren, dann WG stoppen.
- Recovery, falls ein älterer kaputter Übergang den Flur bereits gestoppt hat.

3. SALERSTEIG TRAM + TICKETAUTOMAT
Ursache:
- Tram ist 250 px breit.
- sie hält bei x = Salersteig - 120.
- Ticketautomat lag nur 112 px rechts von der Haltestelle und damit innerhalb
  des Tramkörpers.

v77:
- Ticketautomat liegt jetzt 170 px neben dem Haltestellenzentrum.
- Ticketautomat hat höhere visuelle Tiefe als die Tram und bleibt lesbar.
- Sternen wird symmetrisch behandelt.
- Interaktionszonen verwenden automatisch die neue Position.

4. TRAM BLEIBT NICHT STEHEN
Ursache:
Im normalen erfolgreichen Salersteig-Ankunftspfad wurde __arrivalTramV57 nie
zerstört. Nur der Failsafe tat dies.

v77:
- Simon steigt aus.
- sobald die Ankunft fertig ist, wartet die Tram kurz.
- Tram fährt anschließend sichtbar nach rechts weiter.
- danach wird der Container zerstört und die Referenz geleert.

5. SALERSTEIG BODEN
- eigener sichtbarer Asphalt-/Gehwegbereich um Salersteig.
- heller Zürcher Gehweg direkt unter Simons Füßen.
- Bordstein + dezente Pflasterfugen.
- keine himmelblaue Fläche mehr unter Simon.

DATEIEN
- index.html
- bugfix-v77.js
- README-V77.txt

TESTREIHENFOLGE
A) Löwenauswahl -> JA
   Erwartung: Simon tanzt zuerst mehrere Sekunden NEBEN dem Löwen.

B) Salersteig
   Erwartung: Tram und Ticketautomat haben getrennten Platz.
   Nach dem Aussteigen fährt die Tram weiter und verschwindet.
   Simon steht auf sichtbarem Gehweg.

C) WG
   Oerlikon -> WG -> SIMON -> FLUR -> RAUS
   Erwartung: alle drei Übergänge funktionieren ohne Hänger.
