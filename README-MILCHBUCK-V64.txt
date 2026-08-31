SIMONS ABENTEUER — MILCHBUCK SPATIAL FIX v64
=============================================

PURPOSE
-------
This update corrects the scene logic of the v63 visual polish.
It does not add new image assets and does not change the flight-intro update.

MAIN CORRECTIONS
----------------
1. HIVE is no longer almost directly behind the tram stop.
   - Station: x 0–820
   - Party street begins around x 980
   - HIVE facade: x ≈2050
   - HIVE story door/bouncer/fight/camera coordinates are shifted consistently.

2. Tram rails no longer run through the entire street.
   They exist at the stop only and visibly branch away around x 820–950.
   The rest of the level is a normal daytime nightlife street with road/curb/sidewalk.

3. The tram stop is visually grounded.
   A real platform slab, curb, track bed and support bases connect the shelter to the street.

4. Parallax is substantially stronger and spatially meaningful.
   - mountains / distant skyline move slowly
   - middle-distance city moves moderately
   - actual street facades move 1:1 with the road
   - a tiny foreground layer moves slightly faster

5. Milchbuck is now a daytime party street.
   Decorative BAR / CAFE / TATTOO / PIZZA / KIOSK / MUSIC / CLUB facades make the street believable,
   but HIVE remains the only interactive destination. No fake interaction markers were added.

INSTALLATION
------------
Upload the CONTENTS of this ZIP to the repository root.

Replace:
- index.html

Add:
- hive-location-v64.js
- world-stability-v64.js
- milchbuck-polish-v64.js
- SCENE-PARALLAX-V64.md

The old v57/v63 files may remain in the repository; index.html no longer loads them.

TEST
----
1. Normal start -> Milchbuck.
2. Walk from tram stop all the way to HIVE and verify meaningful travel distance.
3. Confirm the stop sits on its platform and rails disappear after the station.
4. Watch mountains / far city / mid city while walking: movement speed should be clearly different.
5. Buy a ticket and board the tram.
6. Test HIVE bouncer dialogue, lion/fight path, HIVE entrance, and return to street.
7. Optional developer checkpoint: lion choice and HIVE interior.
