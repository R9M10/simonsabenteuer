# Simons Abenteuer – Gandhi-Phasen / Wurfstöcke / Stabilität v26

Ausgangsstand wurde direkt vor dem Build gegen GitHub geprüft:

- game.js: `f8f3af8f53fe33c60a6787e2bbf9848080bd5418`
- index.html: `fcca57279a6b57cfb5abe1b1eecadd9db2338038`
- HIVE v14.2 und game-polish-v15 bleiben unangetastet
- hive-language-patch-v17 bleibt unangetastet

## Wichtig
Vom aktuellen Repository aus nur ersetzen:
- `game.js`
- `index.html`

## Gandhi-Trigger
Gandhi erscheint erst, wenn der Milchmann besiegt ist und Simon danach Der Inder
wirklich komplett von einer Seite zur anderen passiert hat. Ein Teleport direkt
über den Laden zählt nicht, weil die Laden-Zone tatsächlich betreten werden muss.

Gandhi kommt nicht mehr aus Der Inder. Er schwebt von rechts oben aus dem Himmel
in die aktuelle Kamera und landet vor Simon. Ein Failsafe beendet die Ankunft,
falls ein Tween-Callback auf Mobile verloren geht.

## Dark Gandhi – klar getrennte drei Phasen
Simon verursacht mit jedem normalen Treffer weiterhin exakt 10 HP Schaden.

- Phase 1 / 3 – SALZMARSCH (300–201 HP): Stock + Salz.
- Phase 2 / 3 – KARMA (200–101 HP): Karmische Vergeltung + Rad der Wiedergeburt.
- Phase 3 / 3 – NUCLEAR LEVEL: MAX (100–0 HP): Nuklear-Zielkreise + Ahimsa Inversion.

Die Phasen können nicht übersprungen werden. Bei jedem Wechsel gibt es eine große,
fixierte Bildschirm-Einblendung, eine dauerhaft sichtbare Boss-Phasenanzeige und
eine neue Aura-Farbe. Attacken der vorherigen Phase werden beim Übergang entfernt.

## Loot / Despawn
Nach dem Beklauen verschwinden besiegte Körper nach 30 Sekunden:
- Türsteher nach dem Trinkgeld-Diebstahl,
- Milchmann nach dem Beklauen,
- Dark Gandhi nach dem Diebstahl seiner Wurfstöcke.

## Gandhis Wurfstöcke
Nach dem endgültigen Sieg über Dark Gandhi ist sein Körper anklickbar:
`Gandhis Wurfstöcke klauen?`

Bei JA erscheint `Gandhis Wurfstöcke` unter ITEMS. Die Waffe kann in die Hotbar
gelegt werden. Ist ihr Slot ausgewählt, erscheint über J/X ein W-Button mit
`WURF`.

- Flugrichtung: Simons Blickrichtung
- Schaden: 10 HP
- Cooldown: 3 Sekunden

Falls gleichzeitig eine Fähigkeit mit eigenem W/F-Button aktiv ist, wandert deren
Button nach links; beide bleiben bedienbar.

## Zarathustra-Freeze
Die Leseanimation wurde neu abgesichert. Die alten Buch-/Seiten-Tweens liefen
länger als der Cleanup und konnten auf Mobile zerstörte Ziele weiter animieren.
Jetzt enden alle Tween-Zyklen vor dem Cleanup, werden zusätzlich explizit beendet
und das Entsperren läuft in einem `finally`-Recovery-Pfad.

Außerdem zeichnet `Ewige Wiederkehr` seine 3-Sekunden-Historie erst auf, wenn die
Fähigkeit tatsächlich ausgerüstet ist – nicht bereits beim ersten Lesen von
`Also sprach Zarathustra`. Das reduziert unnötige Update-Last direkt nach dem
Freischalten deutlich.

## Cache
`game.js?v=26`

## Zusätzliche Stabilisierung vor Ausgabe

- Phase-Übergänge sind 1,25 Sekunden lang unverwundbar. Dadurch kann auch ein
  bereits fliegender Wurfstock keine Phase überspringen.
- Die jeweilige Signaturattacke wird unmittelbar nach dem Phasenbanner
  ausgelöst: Salzmarsch in Phase 1, Rad der Wiedergeburt in Phase 2 und
  Nuclear-Angriff in Phase 3. Ahimsa folgt früh genug, dass Phase 3 nicht
  durch schnelles X-Spam übersprungen werden kann.
- Das permanente Boss-HUD zeigt jetzt zusätzlich die HP-Bereiche jeder Phase.
- Doppelte Neuerzeugung der Ability-/Weapon-Touchbuttons bei UI-Locks wurde
  entfernt; das reduziert DOM/Phaser-Objekt-Churn auf iOS.
- Der direkte Tram-Startpfad blockiert nun ebenfalls während des
  Gandhi-Lootfensters.
- Falls Dark Gandhi besiegt wurde, Simon aber vor dem Plündern wegfährt, wird
  sein plünderbarer Körper bei der nächsten Bahnhofstrasse-Ankunft
  wiederhergestellt.
