Simons Abenteuer – Bugfix v85

DIESER PATCH ÄNDERT NUR DIE DREI ANGEFORDERTEN BEREICHE:

1. DER INDER
- Ursache: v76-Ladenraum z-index 660000, alter STRASSE-Control nur z-index 100001.
- v85 hebt die alten Controls über den Laden.
- Zusätzlich wird ein eigener sichtbarer "← STRASSE"-Failsafe-Button oben links erzeugt.

2. ESTHI + KOREANISCHE SÜSSIGKEITEN
- bugfix-v84.js ist in dieser ZIP enthalten, weil dein aktueller GitHub-main noch bei v82 steht.
- Beim Essen stellt Esthi jetzt jedes Mal zufällig eine dumme Frage, in der ausdrücklich
  "Lineare Algebra" vorkommt.
- 10 verschiedene Fragen sind hinterlegt.
- Danach essen/küssen sich Esthi und Simon wie vorgesehen.

3. FLIRTEN
- Esthi: Nach ihrer Park-Szene bleibt BEOBACHTEN / REDEN / FLIRTEN aktiv.
- Ihre Reaktionen auf alle aktuell bekannten Flirts sind positiv und die Flirts bleiben wiederholbar.
- Orell-Füssli-Kassiererin: Nach Abschluss ihrer bisherigen Szene (cashierRejected) wird ihr
  Klick-Menü zu REDEN / FLIRTEN / ZURÜCK erweitert.
- Alle aktuell bekannten Flirts bekommen eigene positive/lustige Reaktionen.

UPLOAD
- index.html ersetzen
- bugfix-v84.js hochladen
- bugfix-v85.js hochladen

Keine Änderungen an Grafik, Coop-Aufbau, Milchbuck, Bahnhofstrasse oder anderen Story-Events.
