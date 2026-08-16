SIMONS ABENTEUER – v35 DROP-IN

Basis:
- GitHub main beim Build: e3e8415b76d252fa064e9d07b11d8b289550a143
- game.js?v=31
- runtime-stability-v29.js?v=29
- simon-ui-v30.js?v=30
- simon-ui-v32.js?v=32
- v35 ersetzt v34

Einbau:
1. ZIP entpacken.
2. Alle Dateien in den Repository-Hauptordner ziehen.
3. index.html ersetzen.
4. Hard Reload.

Enthalten:
- index.html
- simon-ui-v35.js
- inder-shop-v35.png
- inder-sprites-v35.png
- README-v35.txt

FIX 1 – LOCKER / WURFSTÖCKE / NICHTS MEHR KLICKBAR
- Kein refreshUILock-Wrapper mehr.
- Locker öffnet nur bei wirklich freier Welt.
- Beim Ablegen/Nehmen wird Hotbar + Action UI + WURF-Steuerung explizit neu aufgebaut.
- Wenn Gandhi-Stöcke aus dem ausgewählten Slot verschwinden, wird ein gültiger Slot gewählt.
- Beim Schließen werden abgerissene DOM-Modal-Referenzen bereinigt.
- Stale Locker-Overlays werden entfernt.
- Weltinput wird nur dann freigegeben, wenn kein echter Dialog/Modal/Transit-Lock aktiv ist.
- Zweiter Recovery-Pass nach 80 ms gegen mobile Same-Tap-/Pointer-Reste.

FIX 2 – MÄDCHEN
- v32 setzt die visuell falsche Flip-Richtung weiterhin pro Frame.
- v35 interceptet woman.setFlipX() und invertiert v32s Anforderung.
- Zusätzlich wird der gewünschte finale Zustand direkt gesetzt:
  Simon links -> Frau schaut links.
  Simon rechts -> Frau schaut rechts.

NEU – RECHTS VOM SCHUHLADEN
- Übergang von Bahnhofstrasse zu Bürkliplatz/Seepromenade.
- Hintergrund mit Limmat-Auslauf, Grossmünster-Silhouette,
  Münsterbrücke/Quaibrücke und Zürichsee.
- Promenade mit Geländer und Laternen.
- Fiktiv an die Promenade gesetztes Clubhaus "ZOFINGIA".

ZOFINGIA INNEN
- Edles Zürcher Verbindungs-/Clubhaus: Holzvertäfelung, hohe Fenster,
  Kronleuchter, rot/weisse Akzente, viele feiernde Gäste im Anzug.
- Enrique ist anklickbar.
- Fragen:
  WER BISCH DU? -> "Ich bin Enrique."
  FLIRT LERNE -> Platzhaltersequenz, später exakt ersetzbar.
  NACH MOBUTO FRAGE -> Mobuto sei gerade in Venedig.
- Zurück zur Promenade über eigenen Button.

WICHTIG ZUR GEOGRAFIE
- Die Zürich-Aussicht ist an der realen Abfolge Bahnhofstrasse -> Bürkliplatz /
  Seeufer -> Limmat/Grossmünster orientiert.
- Das tatsächliche Zofingia-Haus liegt NICHT am See. Die Promenadenposition ist
  eine bewusste Spiel-Fiktion.
