# Simons Abenteuer – Gandhi Story v23

Ausgangsstand direkt vor dem Build:

- game.js: `cfc6f2f2fff260eb8607d8edfe939eb3ff3ed651`
- index.html: `a7c6a6510da4edc4cff1fce5d541c7e37120c863`
- HIVE bleibt v14.2
- game-polish-v15.js bleibt v15
- flight-intro bleibt v15

## Story-Auslöser

Nachdem der Milchmann besiegt wurde, ist der Gandhi-Storypunkt freigeschaltet.

Er startet nicht sofort. Simon muss zunächst außerhalb des Bereichs von
`Der Inder` sein und danach erneut am Laden vorbeilaufen.

## Gandhi

Gandhi kommt aus der Tür von `Der Inder`, läuft auf Simon zu und begrüßt ihn.

Dialog per Bildschirmtap:

1. `Namaste, Simon.`
2. `Friede fangt nöd bi de andere a. Er fangt bi dir a.`
3. `Wer Gewalt mit Gewalt beantwortet, macht d'Welt nur dunkler.`

Die Sätze sind für das Spiel neu formuliert und keine Gandhi-Zitate.

Danach:

- `NUKE GANDHI`
- `WEITERGEHEN`

## Nuke Gandhi

Bei `NUKE GANDHI`:

- eine stilisierte Atombombe fällt von oben direkt auf Gandhi,
- weißer Flash + Kamerashake,
- Feuer-/Schockwelle,
- stilisierte Rauch-/Pilzwolke,
- Gandhi stirbt und bleibt als dunkle umgefallene Figur zurück,
- kein Gore.

Danach wird Simon wieder freigegeben.

Bei `WEITERGEHEN` geht Gandhi zurück in den Laden.

## Persistenz

Die Storyflags werden über Tramfahrten mitgenommen:

- Gandhi-Story freigeschaltet
- Encounter abgeschlossen
- Gandhi tot

## Interaktionsschutz

Während Gandhi-Dialog, Auswahl und Nuklearanimation sind Der Inder,
Orell Füssli und die Tram blockiert.

## Cache

`game.js?v=23`
