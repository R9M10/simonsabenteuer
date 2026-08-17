SIMONS ABENTEUER – ETH / EINSTEIN v51

BASIS
Direkt vor dem Build geprüfter GitHub-main:
b4f45fa5f113408870ca0c8de1b9571ba66b04de

NEU
- Links von der Bahnhofquai-Tramhaltestelle:
  POLYBAHN ↑ / ETH · POLYTERRASSE
- Eigene Route-Szene:
  Central -> rote Polybahn -> Polyterrasse -> ETH-Hauptgebäude
- UZH ist als Nachbargebäude im Hochschulquartier sichtbar.
- Eigener ETH-Innenraum im Semper-/Hauptgebäude-Look.
- Lebende Einstein-Statue.
- Genau 100 Physik-Multiple-Choice-Fragen.
- Richtig: +20 Coins.
- Falsch: kein Geldverlust, Einstein nennt richtige Antwort + kurze Erklärung.
- Eine Frage pro ETH-Besuch.
- Ungefragte Fragen werden zuerst gewählt.
- Nach allen 100 kommen zuerst noch nicht korrekt beantwortete Fragen.
- Bereits korrekt beantwortete Fragen zahlen nicht doppelt.

EINSTEIN
Erstes Anklicken:
Simon: "Einstein."
Simon: "Cool."
[Statue dreht langsam den Kopf]
Einstein: "Moment."
Simon: "Was zum—"
Einstein: "Physik."
Simon: "Was?"
Einstein: "Eine Frage. Zwanzig Münzen."

Wenn "General Relativity" bereits gelesen wurde, gibt es einmalig einen Zusatzdialog.

Nach bereits gestellter Frage im selben Besuch:
Einstein: "Geh jetzt etwas lernen."
Simon: "Ich bin doch in der ETH."
Einstein: "Dann fang an."

PHYSIKBANK
100 Fragen aus:
- Mechanik / analytische Mechanik
- Elektrodynamik
- Quantenmechanik
- Thermodynamik / statistische Physik
- Relativität
- Optik / Wellen
- Festkörper / Kern- / Teilchenphysik

Jede Frage:
- 4 Antwortmöglichkeiten
- exakt eine richtige Antwort
- kurze Erklärung bei Fehler

RAUMREGELN
Route und ETH verwenden dieselbe Grundphysik wie die anderen stabilen Interiors:
- A/D oder Pfeile: laufen
- W / Pfeil hoch: springen
- SPACE / TANZ: tanzen
- iPhone Touchsteuerung
- 5-Slot-Hotbar
- ITEMS
- Rauchen
- Gatorade / Monster trinken
- Bücher lesen
- Inventar / Coins / HP werden mit Bahnhofstrasse geteilt
- FLIRTS-Tab wird im Interior-Inventar ergänzt

GEOGRAFISCHE IDEE
Das Spiel verdichtet die reale Zürcher Route:
Central / Polybahn -> Polyterrasse -> ETH-Hauptgebäude.
Die UZH liegt als Nachbar im Hochschulquartier daneben.

Die lebende Einstein-Statue ist natürlich bewusst Spiel-Fiktion.

DEVELOPER MODE
Neu:
8. ETH / EINSTEIN
Startet direkt im ETH-Innenraum bei Einstein.

DEBUG
SimonETHV51.status()
SimonETHV51.resetQuizProgress()
SimonETHV51.enter()

EINBAU
1. ZIP entpacken.
2. index.html im Repo-Hauptordner ersetzen.
3. eth-campus-v51.js hinzufügen.
4. Hard Reload / Cache leeren.
