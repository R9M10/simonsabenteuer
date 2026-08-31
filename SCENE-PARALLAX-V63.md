# Simon's Abenteuer — Outdoor Scene Depth Contract v63

This is the visual depth model established with the Milchbuck v63 polish pass.
Use the same logic for later Zürich scenes unless a scene explicitly needs a different effect.

| Plane | Scroll factor | Typical content |
|---|---:|---|
| Sky | 0.06 | sky gradient |
| Cloud | 0.11 | clouds |
| Far mountain | 0.18 | distant ridge |
| Near mountain | 0.24 | closer ridge |
| Tree line | 0.31 | distant vegetation |
| Far city | 0.45 | muted distant buildings |
| Mid city | 0.68 | readable architecture |
| Mid green | 0.82 | trees behind the street |
| World | 1.00 | ground, stop, HIVE, tram, player, interaction props |
| Foreground | 1.04 | sparse low non-interactive foreground detail |

## Rules

- Gameplay and all interactive hitboxes stay on the world plane (`1.00`).
- Parallax is visual only. It must never move interaction geometry away from its art.
- Signature locations (station, HIVE, shops) remain at world speed.
- Buildings should use a shared Zürich vocabulary: warm mineral plaster, pitched roofs, dormers, shutters/balconies, drainpipes, mixed window lighting and restrained storefront details.
- Keep foreground coverage sparse so Simon and combat remain readable.
- New scenes should have at least four perceptible depth planes rather than one flat background.
