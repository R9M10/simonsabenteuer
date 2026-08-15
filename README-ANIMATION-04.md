# Animation Update 04

Diese Version basiert auf dem **aktuellen Repo-Stand mit der neuen Milchbuck-/Zürich-Welt**.
Die neue `game.js` deines Freundes wird bewusst **nicht ersetzt**.

## Einbau

Nur zwei Dateien:

1. `index.html` im Hauptordner ersetzen.
2. `animation-fix.js` neu in den Hauptordner hochladen.

Danach sieht der relevante Teil so aus:

```
simonsabenteuer/
├── index.html
├── game.js                 <- unverändert lassen
├── animation-fix.js        <- NEU
├── script.js
├── style.css
├── simon-spritesheet.png
└── assets/
```

## Was geändert wird

### Laufen
- Die bestehende Welt bewegt Simon weiterhin mit 175 px/s.
- Der Laufzyklus nutzt nur noch Frames 8–15.
- Frames 16–17 werden aus dem Laufloop entfernt, weil sie deutlich aufrechter/langsamer wirken.
- Laufgeschwindigkeit der Animation: 14 fps.

### Springen
Die alte Animation 18–25 wird nicht mehr linear abgespielt.
Stattdessen wird nach Simons tatsächlicher vertikaler Geschwindigkeit ausgewählt:

- Frame 19: starker Aufstieg
- Frame 20: weiterer Aufstieg
- Frame 21: Scheitelpunkt
- Frame 22: Abstieg
- Frame 22 zusätzlich ca. 75 ms als kurze Landepose

Schießen, Touchsteuerung, Kamera, Welt und sämtliche neuen Änderungen deines Freundes bleiben unangetastet.

## Warum als separate Datei?

So überschreibst du nicht versehentlich die inzwischen stark erweiterte `game.js`.
Der Fix wird nach `game.js` und vor `script.js` geladen und ergänzt ausschließlich die Animationen.
