SIMONS ABENTEUER – FLIRT-SYSTEM v40

Basis: aktueller main 55347276a7d917877fe51a149db844ff3d49dfd4
- game.js?v=35
- simon-ui-v37.js?v=37
- progression-markers-v38.js?v=38
- venice-scene-v39.js?v=39

EINBAU
1. ZIP entpacken.
2. index.html und flirt-system-v40.js in den Repo-Hauptordner ziehen.
3. index.html ersetzen.
4. Hard Reload / Cache leeren.

UMGESETZT
- Modularer FLIRTS-Katalog mit 7 Start-Flirts.
- learnedFlirts wächst automatisch; Frau-Menüs lesen direkt daraus.
- HIVE-Frau: BEOBACHTEN / FLIRTEN / REDEN / ZURÜCK.
- Beobachtungen als Denkblase; verraten keine Lösung.
- Bereits bei der Frau getestete Flirts bleiben dauerhaft grau/durchgestrichen.
- Pro HIVE-Besuch nur ein Versuch; beim nächsten Besuch wieder ein anderer möglich.
- Kein RNG bei Erfolg: woman_hive_01 akzeptiert aktuell secondLook und bookworm.
- Mini-Effekte: Münze, Buch, Karte, zweiter Blick, Sparkle.
- Bestehende Frau-Reject-Animation, Simon-Talk-Animation, Speech-Bubbles und Locks werden weiterverwendet.

PLAYBOOK
Beim ersten abgeschlossenen Lesen werden freigeschaltet:
- Der Münzwurf
- Der Bücherwurm
- Der falsche Tourist
booksRead.playbook wird gesetzt. Bestehende playBookReadingAnimation bleibt bestehen.

ENRIQUE
Beim ersten Gespräch kein Menü, sondern klickgesteuerte Sprechblasen im Raum.
Danach wird Der zweite Blick gelernt und markEnriqueConversationComplete()/enriqueSpoken werden weiterverwendet.
Anschließend exakt vier Hauptoptionen:
1. WO ISCH DE GENERAL?
2. FLIRT 1 · 100 COINS
3. FLIRT 2 · 100 COINS
4. FLIRT 3 · 100 COINS

Die drei kaufbaren Flirts sind zentral in ENRIQUE_FLIRTS definiert. Namen, Preise und Erklärungstexte lassen sich später an einer Stelle ändern.
Bereits gekaufte Flirts werden als GELERNT dargestellt und deaktiviert.
