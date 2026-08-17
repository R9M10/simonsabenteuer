SIMONS ABENTEUER – ORELL FÜSSLI KASSIERERIN v54

BASIS
Aktueller GitHub-main beim Build:
1f917bb7a5ec3e72481c7885023e30d9984122a8

DATEIEN
- index.html
- cashier-story-v54.js
- README-v54.txt

Die bestehende game.js wird NICHT ersetzt.
Esthi v52, ETH v53, Stability v47, Flirts v46, Palazzo v49 usw. bleiben erhalten.

============================================================
STORY
============================================================

1. KASSIERERIN IM ORELL-FÜSSLI-OVERLAY
- Kein neuer Innenraum.
- Die bestehende Orell-Füssli-Overlay-Szene bleibt bestehen.
- Rechts neben dem Bücherregal steht jetzt eine junge Kassiererin hinter einer
  kleinen Kasse.
- Vor dem eigentlichen Flirtplan ist sie nicht als Quest-NPC markiert.

2. ERSTER ORELL-BESUCH
Beim ersten Verlassen:
Kassiererin: "Schöne Abig."
Simon: "Danke, dir au."

Danach ist Simon wieder auf der Bahnhofstrasse und denkt:
"Wow… die war aber wirklich süss."
"Ich hätte irgendwas sagen sollen."

ERST DANACH startet der bestehende Milchmann-Encounter.

Wichtig:
Der Milchmann wurde NICHT neu programmiert.
v54 hält startMilkmanEncounter() nur solange zurück, wie Simons erste Denkblasen
aktiv sind, und ruft danach die originale Basisspiel-Funktion auf.

3. NACH ENRIQUE
Sobald der bestehende enriqueSpoken-Flag gesetzt ist und Simon danach erneut
Orell Füssli besucht und wieder auf die Straße geht:

"Ich sollte mir diesmal wirklich überlegen, wie ich sie anspreche."
"Nicht einfach irgendwas."
"Ich brauche einen tiefgründigen Gedanken."
"Vielleicht brauche ich dafür etwas mehr…"
"WEITSICHT."

Keine direkte ETH-Anweisung und kein Quest-Pfeil.

4. POLYTERRASSE
Nur während dieses Storyschritts erscheint in der Mitte der Polyterrasse,
weit entfernt von Polybahn und ETH-Tür:

NACHDENKEN

Simon muss in der Nähe stehen und den Punkt anklicken.

Gedanken:
"Okay."
"Nicht einfach irgendwas sagen."
"Es sollte ehrlich sein."
"Aber nicht oberflächlich."
"Selbstbewusst. Aber nicht arrogant."
"Persönlich. Aber nicht komisch."
"Vielleicht ein bisschen poetisch…"
"Ich hab’s."

Danach erscheint ein kleiner Schmierzettel:

Hey, du wirkst sympathisch.

Hättest du mal Lust,
mit mir einen Kaffee trinken zu gehen?

Danach Simon:
"Perfekt."

Der NACHDENKEN-Punkt verschwindet dauerhaft.

5. ZURÜCK BEI ORELL FÜSSLI
Jetzt erscheint über der Kassiererin:
ANSPRECHEN

Dialog:
Simon: "Hey…"
Kassiererin: "Hoi."
Simon: "Du wirkst sympathisch."
Kassiererin: "Danke."
Simon: "Hättest du mal Lust, mit mir einen Kaffee trinken zu gehen?"
Kassiererin: "Oh… das ist wirklich lieb."
Kassiererin: "Aber ich bin schon in einer Beziehung."
Simon: "Ah."
Kassiererin: "Sorry."
Simon: "Alles gut."

Sie lehnt freundlich ab.
Keine Münzen, kein Malus, kein Kampf und kein zweiter Versuch.

6. DANACH
Wenn Simon den Laden nach dem Korb verlässt:

"Dafür bin ich extra auf einen Berg gefahren."

Bei späteren Klicks auf die Kassiererin:
Kassiererin: "Hoi."
Simon: "Hoi."

============================================================
STEUERUNG
============================================================

Alle echten Dialoge / Denkblasen:
- nur per Klick / Tap weiter
- keine automatisch weiterlaufenden Gesprächssätze

Die bestehenden Orell-Füssli-Bücher, Käufe und das Regal bleiben unverändert.

============================================================
DEVELOPER
============================================================

Neu:
9. ORELL / KASSIERERIN

Startet auf Bahnhofstrasse nahe Orell Füssli mit zurückgesetzter v54-Story.

Debug:
SimonCashierV54.status()
SimonCashierV54.reset()
SimonCashierV54.unlockInspiration()
SimonCashierV54.unlockCoffeePlan()

============================================================
EINBAU
============================================================

1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. cashier-story-v54.js hinzufügen.
4. Hard Reload / Cache leeren.
