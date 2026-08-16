# Palazzo Medici – Eintrittsfix v40

## Ursache
Im aktuellsten GitHub-Stand existiert `palazzo-medici-v48.js`, aber die aktuelle
`index.html` lädt diese Datei überhaupt nicht. Dadurch kann der Innenraum nicht
zuverlässig registriert/gestartet werden.

## Fix
- `index.html` lädt jetzt `palazzo-medici-v49.js?v=49`
- keine anderen bestehenden Wrapper oder Friend-Dateien werden entfernt oder ersetzt
- Eingangshitbox wurde vergrößert und auf hohe Input-Priorität gesetzt
- der Eingang verlangt nicht mehr, dass Simon im exakt selben Frame als "grounded"
  erkannt wird
- Eintritt verwendet jetzt direkt den Phaser `game.scene` SceneManager:
  1. PalazzoMediciScene sicher registrieren
  2. VeniceScene pausieren
  3. PalazzoMediciScene starten
- schlägt der Szenenwechsel wider Erwarten fehl, wird Venedig wieder entsperrt

## Dateien
- `index.html` ersetzen
- `palazzo-medici-v49.js` neu hinzufügen

`palazzo-medici-v48.js` kann im Repository bleiben; sie wird von der neuen index.html
nicht mehr geladen.

## Tests
- `node --check palazzo-medici-v49.js` – PASS
- Registrierung PalazzoMediciScene – PASS
- Klick/Eintrittspfad – PASS
- VeniceScene wird pausiert – PASS
- PalazzoMediciScene wird mit Venice-State gestartet – PASS
- aktuelle Script-Reihenfolge / Friend-Dateien bleiben erhalten – PASS
