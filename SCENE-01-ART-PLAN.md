# Szene 01 – Visual Art Pass

Ziel: Die erste Dialogszene vor dem eigentlichen Phaser-Spiel soll wie ein bewusst gestalteter Teil derselben Pixel-Art-Welt wirken und nicht wie ein Prototyp aus Hintergrund + Platzhalterfiguren.

## Aktueller Stand

- Die Szene läuft im `scene-screen` vor dem Phaser-Spiel.
- Hintergrund: `assets/bg-arcade.png` als einzelnes flaches 16:9-Bild.
- Vordergrund: `.water-wall` ist aktuell nur ein CSS-Verlauf mit Streifen.
- Simon: `simon-dialog-back-clean.png` ist eingebaut und wird stark herunter skaliert.
- Zweite Figur: noch eine generische CSS-Figur aus Kopf-/Körper-/Bein-Blöcken.
- Dialogblase gehört zur rechten Figur und enthält die drei bestehenden Schweizerdeutsch-Zeilen.

## Art Direction

- Gleicher Simon-Kanon wie Gameplay-Sprites.
- Retro-Pixel-Art im Stil später 1990er / früher 2000er Adventure- und Actionspiele.
- Klare Pixelcluster, harte Kanten, selektive dunkle Outlines, keine glatte Illustration.
- Einheitliche Pixel-Skalierung innerhalb der Szene.
- Keine zufällige Deko: jedes Objekt soll die Szene lesbarer, glaubwürdiger oder atmosphärischer machen.
- Layout bleibt iPhone-Querformat und dialogfreundlich.

## Ausführungsreihenfolge

1. **Komposition und Pixelmaß festziehen**
   - Arbeitsfläche auf die reale Szene abstimmen.
   - Baseline für beide Figuren festlegen.
   - Zielhöhe der Dialogfiguren und integer/nächste Pixel-Skalierung definieren.

2. **Charaktere zuerst fertigstellen**
   - Simon-Back-Sprite auf echte In-Game-Pixelgröße normalisieren, statt das sehr große PNG im Browser stark herunterzuskalieren.
   - Rechte Figur als echten transparenten Pixel-Art-Sprite ersetzen; keine CSS-Blöcke mehr.
   - Beide Figuren auf identischer Baseline, gleichem Licht und gleichem Detailgrad halten.

3. **Vordergrundobjekt statt CSS-Wand**
   - Die aktuelle `.water-wall` durch ein echtes Pixel-Art-Vordergrundelement ersetzen.
   - Material klar lesbar machen: Stein-/Betonkante am Wasser, passend zur bestehenden Szene.
   - Falls die Perspektive es verlangt: Geländer, Kante oder Mauerabschluss als eigenes Layer.

4. **Kleine Szenenobjekte**
   - Nur 2–4 gezielte Props, z. B. ein dezentes Getränk/Abfallobjekt, Beschlag/Poller, kleine Pflanzenkante oder ähnliches – abhängig vom finalen Hintergrund.
   - Keine Objekte direkt hinter der Dialogblase oder den Gesichtern/Silhouetten.

5. **Hintergrund in Tiefenebenen aufteilen**
   - Distant background: Himmel + Stadt/Silhouette.
   - Midground: Wasser mit klarer Uferkante.
   - Foreground: Mauer/Promenade und Figuren.
   - Optional sehr zurückhaltende 2–3-Frame-Wasseranimation, ohne die Dialogszene unruhig zu machen.

6. **Integration**
   - Assets unter einem klaren `assets/scene-01/`-Schema einbinden.
   - Z-Order vereinheitlichen: Hintergrund → Wasser/Midground → Vordergrundobjekte → Figuren → Dialog-UI.
   - Bestehende Dialoglogik unverändert lassen.

7. **QA auf iPhone-Querformat**
   - Keine Crops an Haaren oder Schuhen.
   - Figuren springen beim Skalieren nicht.
   - Kein unscharfes Downsampling.
   - Dialogblase bleibt eindeutig der rechten Figur zugeordnet.
   - Szene funktioniert auch bei kleineren Landscape-Höhen.

## Priorität

Der größte sichtbare Stilbruch ist aktuell die rechte CSS-Platzhalterfigur. Danach folgen die CSS-Wand und die uneinheitliche Pixel-Skalierung von Simon. Diese drei Punkte werden zuerst behoben, bevor zusätzliche Dekoration entsteht.
