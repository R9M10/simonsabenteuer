# Löwen-Auswahl – grundlegender iPhone-Fix

Bitte nur die bestehende `game.js` im Repository ersetzen.

## Was diesmal geändert wurde

Die Auswahl `JA / NEIN / KÄMPFEN` wurde technisch neu aufgebaut.

Das Problem lag nicht nur an der Größe der Phaser-Hitboxen: Die Auswahl befand sich als interaktive Phaser-Objekte in einem verschachtelten Canvas-Container. Auf iPhone/Safari konnte der Button zwar optisch auf den Tap reagieren, der eigentliche Aktions-Callback aber trotzdem verloren gehen.

Die drei Antworten sind jetzt **echte HTML-Buttons**, die direkt über dem Phaser-Canvas liegen. Dadurch verarbeitet Safari selbst den Touch.

Zusätzlich:

- `touchend`, `pointerup` und `click` werden als abgesicherte Aktivierungswege unterstützt.
- Doppeltes Auslösen wird verhindert.
- Der Tap wird nicht mehr an das Spiel-Canvas weitergereicht.
- Alle drei Buttons bleiben vollständig innerhalb der Box.
- `KÄMPFEN` bekommt etwas kleinere Schrift und mehr Spaltenbreite.
- Die Box nutzt maximal 92 % der Spielfeldbreite und passt damit auch sauber ins iPhone-Querformat.

Die bestehenden Funktionen für:

- JA → Tanzen im HIVE
- NEIN → Löwe geht alleine in den Club
- KÄMPFEN → Löwe verfolgt und attackiert Simon

bleiben unverändert und werden nun direkt von den HTML-Buttons aufgerufen.
