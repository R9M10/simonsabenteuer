# Simons Abenteuer – Super Milch + HIVE Re-entry Fix v19

Aktueller GitHub-Stand vor der Änderung:

- game.js: `78d4c9e1bb3f63747cc77fa15a731856e0c522d7`
- index.html: `256c0e1f15b8a48e0878e2133181cc4c45d2dacc`
- hive-expansion.js: `b9f89ac568cb0954cb0e72a7a897ddf95c25f98f` / v14.2

`hive-expansion.js` wird nicht überschrieben.

## Änderungen

### Zigarette
Die Zigarette ist komplett gedreht:
- Filter links
- glühende Spitze rechts

Das gilt für Store/ITEMS/Hotbar, Rauch-Animation und Sprint-Statussymbol.

### HIVE nach Tram-Rückkehr
Der Fehler lag am wiederverwendeten `HiveInteriorScene`-Objekt:
`leaveHive()` aus HIVE v14.2 setzt `__leaving = true`. Dieser Wert blieb beim
nächsten Eintritt erhalten, weshalb `← STRASSE` sofort abbrach.

Vor jedem Eintritt über den nach der Tram-Rückkehr wiederhergestellten
HIVE-Eingang werden nun die transienten HIVE-Zustände zurückgesetzt,
insbesondere `__leaving = false`.

Die aktuelle HIVE-v14.2-Datei selbst bleibt vollständig unangetastet.

### Milchmann
Milchflaschen kommen jetzt unregelmäßig:
- Minimum: 1 Sekunde
- Maximum: 3 Sekunden
- Abstand wird nach jedem Wurf neu zufällig gewählt

Jede dritte Flasche ist **SUPER MILCH**:
- sichtbar größer
- Label `SUPER MILCH`
- 20 Schaden statt 10
- etwas stärkere Trefferreaktion

Normale Milch:
- 10 Schaden

## Cache
`game.js?v=19`
