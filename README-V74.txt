SIMONS ABENTEUER — CLEAN SCENE FIX v74

BASIS
Aktueller GitHub-main beim finalen Rebase: 70f202aaa85805262bc47e325e124fd800f5fa77

DIESE VERSION ENTFERNT AUS DER LADEFOLGE
- world-polish-v70.js
- world-npc-fix-v71.js
- experience-fix-v72.js
- runtime-fix-v73.js

Die Dateien dürfen physisch im Repository liegen bleiben; index.html lädt sie nicht mehr.

WARUM
Diese drei Layer waren inzwischen die Ursache der aktuellen visuellen und Input-Regressions:
- zu hoch gezeichneter Polyterrassen-Boden
- zusätzliche schwebende Häuser über Ticketautomat/Locker
- mehrfach erzeugte NPC-Sprites durch v69 + v71
- globaler 320-ms-Inputblocker aus v72

V74
1. POLYTERRASSE
- originale v59/v67-Terrassenarchitektur wieder Basis
- kein Boden mehr durch Simons Körper
- nur eine sehr schmale Pflaster-Verstärkung von y=318 bis y=338 direkt unter den Füßen

2. POLYBAHN-FAHRT
- createTransitVisuals komplett ersetzt
- zusammenhängender Stadt-Hang unter der Bahn
- Stützmauer / Terrassen
- richtiges Gleisbett
- Häuser physisch auf dem Hang verankert
- kein hellblauer Leerraum unter den Schienen
- Fahrtmechanik und Timing bleiben original

3. BAHNHOFSTRASSE / POLYBAHN-EINGANG
- keine perspektivische Seitenstraße
- kein Fluss
- kompakter Straßen-Eingang bei x≈1115 neben dem Ticket-/Locker-Bereich
- bestehende ETH-Freischaltlogik bleibt erhalten

4. AMSIF
- neues Amsif-Sprite deaktiviert
- prozeduraler Platzhalter wieder sichtbar
- keine dreifache Figur
- Story, Tween, Hitbox und Name unverändert

5. ENRIQUE
- neues Enrique-Sprite jetzt INNERHALB seines echten Zofingia-Containers
- lokaler Fußpunkt y=31, Scale 0.43
- schaut zu Simon
- Idle / Explain / Zweiter-Blick-Zustände
- alter unsichtbarer Detached-Sprite wird deaktiviert

6. DIALOG-KLICKS
- globaler 320-ms-v72-Blocker entfernt
- nur neue HIVE-/Enrique-Sequenz bzw. neues Enrique-Menü bekommt EINMALIG ca. 120 ms Schutz
- verhindert denselben Öffnungstap als sofortigen ersten Weiterklick
- danach normal klickbar

7. BEIBEHALTEN AUS V72
- Einstein kann im selben ETH-Besuch unbegrenzt weitere Fragen beantworten
- Zettelbild auf der Polyterrasse bleibt erhalten

INSTALLATION
Alle vier Dateien direkt ins Repository-Root hochladen / ersetzen:
- index.html
- clean-scene-fix-v74.js
- enrique-master-v62.png
- coffee-plan-note-v72.png

Keine Unterordner.
