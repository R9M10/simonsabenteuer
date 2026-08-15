# Simon-Sprites + Phaser-Prototyp

Diese ZIP enthält **nur die Dateien, die für den nächsten technischen Schritt
neu oder geändert werden sollen**. Es wurde nichts automatisch in GitHub geschrieben.

## Was wird geändert?

### `index.html`
- fügt einen dritten Screen `#game-screen` hinzu
- bindet Phaser 3.90.0 per CDN ein
- lädt `game.js`

### `script.js`
- der Dialog läuft nicht mehr endlos im Kreis
- nach `nöd sooooo nice...` führt der nächste Tap in die Spielszene
- die bestehende Intro-Szene bleibt ansonsten unverändert

### `style.css`
- bestehendes Styling bleibt erhalten
- ergänzt Fade-Out der Intro-Szene
- ergänzt Phaser-Canvas-Styling
- `touch-action: none`, damit iPhone-Spielsteuerung nicht mit Browsergesten kollidiert

### `game.js`
Erster echter technischer Spielprototyp:
- Phaser Arcade Physics
- Simon als Spritesheet
- Idle-Animation
- Laufanimation
- Sprunganimation
- Schussanimation (noch ohne Projektil)
- Kollisionsboden
- Keyboardsteuerung
- Touch-Steuerung für iPhone im Querformat

### `assets/simon-spritesheet.png`
35 sauber in ein 240×280-Raster gesetzte Frames.

### `assets/simon-spritesheet.json`
Dokumentiert die Frame-Gruppen.

## Einbau

1. Vorher optional einen Git-Branch oder eine Sicherung anlegen.
2. Den Inhalt dieser ZIP in das Root-Verzeichnis von `simonsabenteuer` kopieren.
3. Vorhandene `index.html`, `style.css` und `script.js` ersetzen.
4. `game.js` neu hinzufügen.
5. Die beiden Simon-Dateien nach `assets/` kopieren.
6. `assets/bg-arcade.png` **nicht löschen**. Sie wird weiterhin vom Intro verwendet.
7. Alles committen und über GitHub Pages testen.

## Steuerung

Desktop:
- A / D oder Pfeile: laufen
- W / Pfeil hoch / Leertaste: springen
- X: Schussanimation

iPhone:
- links unten: ← / →
- rechts unten: J = springen
- rechts unten: X = Schussanimation

## Bewusst noch NICHT enthalten

- Projektile / Waffenlogik
- Gegner
- HP
- Coins
- Shop
- Bosskämpfe
- Kamera / große Welt
- Morgen-Szene nach Den Haag
- finale Levelgrafik

Diese Dinge sollten erst auf den funktionierenden Bewegungs-/Animationskern gesetzt werden.
