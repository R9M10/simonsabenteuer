SIMONS ABENTEUER — MILCHBUCK v62.1 HOTFIX
=========================================

URSACHE DES FEHLERS
-------------------
Beim Upload über GitHub/iPad wurden die PNG-Dateien in den Repository-Hauptordner
gelegt. scene-art-v62.js suchte sie aber unter assets/v62/. Dadurch konnte Phaser
die Assets nicht laden und zeigte MILCHBUCK V62 ASSET-FEHLER.

DIESER HOTFIX
-------------
- lädt alle v62-PNGs aus dem Repository-Hauptordner (so wie sie aktuell dort liegen)
- nutzt Cache-Busting v62.1
- fällt bei einem künftigen Asset-Problem automatisch auf die alte spielbare
  Milchbuck-Welt zurück, statt das komplette Spiel zu blockieren
- enthält alle benötigten Milchbuck-PNGs erneut, damit der Upload vollständig ist

INSTALLATION
------------
1. ZIP entpacken.
2. ALLE Dateien aus dem ZIP gemeinsam in den Hauptordner von simonsabenteuer hochladen.
3. Bei GitHub "Replace files" / Ersetzen bestätigen, wenn gefragt.
4. Keine Unterordner anlegen.
5. Nach dem Deploy die Spielseite neu laden. Auf dem iPad am sichersten den Tab
   schließen und erneut öffnen.

Ersetzt werden nur script.js und scene-art-v62.js sowie die bereits vorhandenen
v62-Grafiken mit identischen Dateinamen. game.js und die Story-Dateien bleiben unverändert.
