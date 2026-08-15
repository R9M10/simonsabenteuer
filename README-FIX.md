# FIX 01 — fehlendes Simon-Asset

Ich habe den aktuellen Stand des GitHub-Repositories geprüft.

## Gefundener Fehler

Im GitHub-Ordner `assets/` liegt aktuell nur `bg-arcade.png`.
Die Datei `simon-spritesheet.png` ist dort nicht vorhanden.

Dadurch kann Phaser Simon nicht laden. Die kleine schräge Markierung, die du
gesehen hast, ist der Missing-Texture-Platzhalter von Phaser. Weil die
Sprite-/Animationsinitialisierung danach scheitert, werden auch die
Touch-Controls nicht mehr aufgebaut.

## So einbauen — diesmal absichtlich einfacher

Lade BEIDE Dateien aus diesem ZIP direkt in den HAUPTORDNER des Repositories:

- `game.js` → vorhandene `game.js` ersetzen
- `simon-spritesheet.png` → neu hinzufügen

NICHT in `assets/`.

Danach muss dein Repository oben so aussehen:

simonsabenteuer/
  index.html
  style.css
  script.js
  game.js
  simon-spritesheet.png
  assets/
    bg-arcade.png

An `index.html`, `style.css` und `script.js` musst du für diesen Fix nichts ändern.

Danach GitHub Pages kurz neu laden. Auf iPad/Safari am besten einmal die Seite
komplett schließen und neu öffnen, falls noch eine alte Version gecacht ist.

Der neue `game.js` zeigt außerdem künftig eine verständliche Fehlermeldung an,
falls das Sprite-Asset nochmals fehlt, statt nur einen winzigen Phaser-Platzhalter.
