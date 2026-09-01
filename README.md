# Simons Abenteuer

Browser-Spiel auf Basis von Phaser 3.90, optimiert für iPhone/Browser im Querformat.

## Aktueller Stand

Der produktive Einstieg ist `index.html`. Die dort geladenen Dateien sind die kanonische Runtime. Alte Versionsdateien werden nach erfolgreicher Ablösung aus dem aktuellen Tree entfernt; die Git-Historie und der Branch `backup-pre-cleanup-v74` behalten sie weiterhin vollständig.

### Wichtige aktuelle Module

- `game.js` – Basisspiel, Kern-Szenen und Spielzustand
- `developer-bootstrap-v60.js` + `developer-mode-v60.js` – Developer-Checkpoints
- `hive-expansion.js` + `hive-language-patch-v19.js` – HIVE
- `simon-ui-v30.js`, `simon-ui-v32.js`, `simon-ui-v37.js` – bewusst kumulative UI-/Indoor-Erweiterungen; **alle drei werden benötigt**
- `flirt-system-v46.js` – aktuelles Flirt-System
- `oerlikon-v59.js` + `esthi-oerlikon-v57.js` – Oerlikon / WG / Esthi
- `eth-campus-v59.js` – Polybahn / Polyterrasse / ETH / Einstein
- `cashier-story-v54.js` – Orell-Füssli-Kassiererin
- `milchbuck-v66.js` – aktuelles Milchbuck-Layout
- `zurich-outdoor-v67.js` – gemeinsame Zürich-Outdoor-Darstellung
- `npc-sprites-v69.js` – aktuelle NPC-Sprite-Erweiterungen
- `clean-scene-fix-v74.js` – aktuelle Stabilitäts-/Darstellungsfixes

## Deployment

Das Projekt ist statisch und läuft direkt über GitHub Pages. Änderungen gehören in den Repository-Root. `index.html` bestimmt die Ladefolge.

## Repo-Hygiene

Nicht geladene historische JS-Versionen und identische Asset-Duplikate werden aus `main` entfernt. Sie bleiben über Git-History bzw. `backup-pre-cleanup-v74` verfügbar. Neue Änderungen sollten bestehende aktuelle Module nach Möglichkeit aktualisieren oder konsolidieren, statt weitere parallele Patch-Versionen dauerhaft im Root zu sammeln.

## Design-Dokumente

- `ART-DESIGN.md`
- `MILCHBUCK-ART-BRIEF.md`

