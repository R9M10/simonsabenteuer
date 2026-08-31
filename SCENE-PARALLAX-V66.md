# Outdoor Scene Depth Contract v66

Milchbuck ist ab v66 die Referenz für spätere Outdoor-Szenen.

| Plane | Camera factor | Zweck |
|---|---:|---|
| Sky | 0.06 | fast statisch |
| Clouds | 0.12 | sehr fern |
| Far landscape | 0.24 | Berge / fernste Silhouette |
| Near landscape | 0.36 | nähere Hügel |
| Far city | 0.56 | entfernte Dachmasse |
| Mid city | 0.74 | erkennbare Quartierbebauung |
| Street / gameplay | 1.00 | physisch neben Simon |

## Designregel

**Depth ist semantisch.** Ein Haus direkt am Gehweg ist kein Parallax-Hintergrund,
auch wenn es hinter Simon gerendert wird. Nur tatsächlich räumlich entfernte
Geometrie erhält einen Faktor < 1.

## Milchbuck-Komposition

- Station ist ein eigener Verkehrsbereich links.
- Danach folgt ein kurzer, dichter Mixed-Use-Block: Wohnhäuser, dunkle
  Erdgeschosse, Servicezugänge, schmale Gassen, Poster, Fahrräder, Lüftung.
- Diese Elemente sind reine Kulisse: keine Labels, keine Marker, keine Hitboxen.
- HIVE ist die einzige gameplay-relevante Destination in diesem Abschnitt.
- Gleise/Oberleitung enden mit der Station.
