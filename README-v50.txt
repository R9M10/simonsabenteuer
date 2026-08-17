SIMONS ABENTEUER – ESTHI STORY v50

BASIS
Direkt vor dem Build geprüfter GitHub-main:
12ea9b70a8261547dacf6ff0fea9d4011793d145

Aktuelle Ladefolge bleibt erhalten:
- game.js?v=38
- simon-ui-v37.js?v=37
- progression-markers-v38.js?v=39
- venice-scene-v39.js?v=44
- acquaintances-v41.js?v=42
- woman-conversation-v43.js?v=43
- thomas-horserace-v44.js?v=44
- palazzo-medici-v49.js?v=49
- flirt-system-v46.js?v=46
- stability-v47.js?v=47
- NEU: esthi-story-v50.js?v=50

EINBAU
1. ZIP entpacken
2. index.html in den Repo-Hauptordner ziehen und ersetzen.
3. esthi-story-v50.js neu hinzufügen.
4. Hard Reload / Cache leeren.

1. HIVE NÄHER AN MILCHBUCK
Der bestehende HIVE wird NICHT neu programmiert.
Die aktuelle createHiveClub()-Ausgabe wird als kompletter Block verschoben:
- vorher: x=1575
- neu: ungefähr x=1030

Dadurch bleiben bestehen:
- aktueller HIVE-Look
- Türsteher
- Lion-/Kampf-/Tanzstory
- bestehende Hitboxes
- bestehende HIVE-Innenraumlogik

2. NEUER PARK
Direkt rechts neben dem verschobenen HIVE:
- Grünfläche
- mehrere Bäume
- Sträucher
- Kiesweg
- Parkbank

Der Park liegt im normalen Milchbuck-Scrollraum.
Keine neue Szene / kein Ladebildschirm.

3. SPAR
Direkt rechts neben dem Park:
- kompakte Supermarkt-Fassade
- SPAR-Schriftzug
- große Fenster
- Glastür
- Waschmittel im Schaufenster angedeutet

4. ERSTES ESTHI-EVENT
Beim ersten Betreten des Parks:
- Steuerung wird sauber gesperrt
- Esthi läuft auf Simon zu
- sie fragt in holprigem Schweizerdeutsch nach Waschmittel
- Simon zeigt ihr den nahen SPAR
- beide laufen tatsächlich gemeinsam zum Laden
- Esthi bittet Simon draußen zu warten
- sie geht sichtbar in den SPAR
- Simon denkt: "Was passiert hier eigentlich?"
- Esthi kommt mit Waschmittel + einer pudrigen koreanischen Süßigkeit zurück
- beide laufen sichtbar zurück zur Parkbank
- Banksequenz mit Klickdialog
- Esthi erklärt: "In Korea... wir machen so." / "Freunde füttern sich."
- Simon wird gefüttert
- sein Mund bekommt sichtbare Puderzucker-Pixel
- Esthi: "Warte."
- kurze körperliche Annäherung; der Puderzucker verschwindet; kleiner Herz-Effekt
- Esthi: "Jetzt sauber."
- Simon: "..."
- Denkblase: "Was zur Hölle ist gerade passiert?"

Danach:
ERINNERUNG FREIGESCHALTET
DER ERSTE KUSS

WICHTIG:
Alle gesprochenen/gedachten Texte gehen NUR PER KLICK weiter.
Nur Lauf-/Fütter-/Kussbewegungen laufen nach ihrer Animation automatisch
zum nächsten Dialogschritt.

5. ESTHI DANACH
Nach Abschluss:
- Esthi bleibt dauerhaft bei der Parkbank stehen
- Name ESTHI erscheint über ihr
- keine Healing-/Snack-Bar
- keine zusätzliche wiederholbare Funktion
- ihr späteres Gameplay kann separat ergänzt werden

6. STATE
Session-persistent:
window.__SIMON_ESTHI_STATE_V50__

- introStarted
- introCompleted
- firstKissUnlocked

Beim Tram-/Location-Wechsel bleibt der Abschluss erhalten.
Beim Zurückkehren nach Milchbuck steht Esthi wieder im Park.
Wird die Szene mitten im Event beendet, wird introStarted sicher zurückgesetzt.

7. DEVELOPER MODE
Zusätzlich:
7. MILCHBUCK / ESTHI

Startet direkt am Park und setzt das Esthi-Event für den Test zurück.

DEBUG
SimonEsthiV50.state
SimonEsthiV50.resetStory()
SimonEsthiV50.startNow()
