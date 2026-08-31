# Simons Abenteuer — Outdoor Scene Depth Contract v64

This is the canonical outdoor-scene concept after the Milchbuck v64 correction.

## Rule 1: visual depth follows spatial meaning

Do not assign parallax just because an object is visually behind another object.
Ask where it physically is.

- Sky: 0.02
- Clouds: 0.05
- Far ridge / mountains: 0.08
- Near ridge: 0.14
- Distant tree line: 0.22
- Far city roofline: 0.30
- Mid-distance city: 0.52
- Actual street facades: 1.00
- Sidewalk / road / HIVE / station / street furniture: 1.00
- Very near decorative foreground: 1.08

The important correction versus v63 is that buildings directly lining Simon's street are NOT a parallax background. They are world objects and therefore move at 1.0 with the road.

## Milchbuck spatial composition

- x 0–820: Milchbuck tram-stop zone
- x 820–950: transition/plaza; tram line visibly leaves the side-on street
- x 980–~2000: daytime party street with decorative, non-interactive venues
- x ~2050–2300: HIVE as the only gameplay destination in this street
- x >2300: continuation of the nightlife/residential street and room for HIVE story/camera movement

## Rail rule

Tram rails belong only where the tram infrastructure logically exists. Never use rails as a generic street-ground texture.

In Milchbuck they are limited to the station and then visibly diverge away from the party street.

## Gameplay readability

Decorative venues may communicate nightlife character (BAR, TATTOO, PIZZA, KIOSK, etc.) but must not use interaction markers or hitboxes unless gameplay is actually implemented there.
