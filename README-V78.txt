SIMONS ABENTEUER — FIX v78

Enthaltene Dateien:
- index.html
- bugfix-v78.js

Upload:
Beide Dateien in den Hauptordner des GitHub-Repositories hochladen.
index.html ersetzt die vorhandene Datei. bugfix-v78.js ist neu.

Fixes:
1. Löwe / HIVE
   - JA führt wieder sofort IN den HIVE.
   - Kein Tanz draußen auf der Straße.
   - Im HIVE tanzen Simon und der Löwe jetzt sichtbar mit Schritten,
     Richtungswechseln und Sprüngen statt nur zu wackeln.

2. Der Inder
   - Kaufmenü liegt jetzt über dem DOM-Laden und ist wieder sichtbar.
   - Verkäufer reagiert bereits zuverlässig auf pointerdown/touch.
   - Item-Info liegt ebenfalls über dem Laden.
   - Beim Schließen werden die Ebenen/Poin­ter-Events sauber zurückgesetzt.

3. Regression Guard
   - v77-WG- und Salersteig-Fixes bleiben unangetastet.
   - v78 überschreibt nur die finalen Besitzer der zwei aktuell kaputten
     Interaktionen, damit keine weitere Patch-Kaskade entsteht.

Technische Ursache der Inder-Störung:
bugfix-v76 stellte den Laden auf ein DOM-Overlay mit z-index 660000 um,
während das bestehende Kaufmodal bei z-index 100020 blieb. Das Kaufmodal
wurde erzeugt, aber hinter dem Laden angezeigt.
