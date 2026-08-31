# Outdoor Scene Depth Contract v65

This is the canonical outdoor-scene rule after the Milchbuck v65 correction.

## Semantic planes

| Plane | Camera speed | Use |
|---|---:|---|
| Sky | 0% | sky colour / gradient |
| Clouds | 3.5% | very distant clouds |
| Far ridge | 8% | distant hills / horizon |
| Near ridge | 15% | nearer hills / wooded slopes |
| Far city | 27% | pale distant roofs / blocks |
| Mid city | 46% | set-back neighbourhood buildings / vegetation |
| World | 100% | street, station, HIVE, Simon, NPCs, anything physically next to Simon |

Milchbuck v65 implements distant planes manually from `camera.scrollX` each frame instead of relying only on Phaser `scrollFactor`. This is intentional and is the reference behaviour for later outdoor scenes.

## Spatial design rule

A scene is not filled simply because world width exists. Empty space, trees, walls and residential setbacks are valid world design.

Milchbuck specifically:

- left: compact tram-stop zone;
- rails end with the stop and visibly leave the street;
- short, quiet residential walk with trees/hedges;
- HIVE is the single gameplay destination on this stretch;
- no decorative storefronts that look interactable;
- HIVE uses the original stable game coordinates (`x≈1575`, door `x≈1700`, bouncer `x≈1780`).

## Gameplay rule

Visual depth must never move gameplay objects. Interactions and actors remain in the 100% world plane.
