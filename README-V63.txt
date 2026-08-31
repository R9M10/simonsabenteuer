SIMONS ABENTEUER — MILCHBUCK POLISH v63
========================================

UPLOAD
------
Upload ALL files from this ZIP into the repository root.
Replace index.html and flight-intro.js when GitHub asks.
Add milchbuck-polish-v63.js and SCENE-PARALLAX-V63.md.
No other file needs to be deleted.

THIS UPDATE
-----------
1. FLIGHT INTRO
   - Thought bubble no longer rides directly on the moving plane.
   - It stays near screen center with only ~2 px vertical drift.
   - Readable display window is longer; flight is slightly slower.
   - index.html cache version changes flight-intro.js from ?v=15 to ?v=16.

2. MILCHBUCK PARALLAX
   - Sky 0.06
   - Clouds 0.11
   - Far mountains 0.18
   - Near mountains 0.24
   - Distant treeline 0.31
   - Far city 0.45
   - Mid residential city 0.68
   - Background street trees 0.82
   - Gameplay/world 1.00
   - Sparse foreground 1.04

3. MILCHBUCK WORLD POLISH
   - Adds a denser Zürich residential backdrop around the stop and beyond HIVE.
   - Buildings now share one architectural vocabulary: pitched roofs, chimneys,
     dormers, shutters, balconies, drainpipes, storefronts and mixed windows.
   - Adds detail to the existing stop and HIVE without changing their hitboxes.
   - Existing tram, HIVE story, tickets, combat and travel logic stay untouched.

SAFETY
------
This is a visual patch. game.js is NOT replaced.
The new code replaces only visual factory methods and decoratively wraps the
existing Milchbuck station/HIVE factories.

QUICK TEST
----------
- Normal start -> airplane thought should be comfortable to read.
- Walk right at Milchbuck -> mountains, far houses, mid houses and street
  should visibly separate at different speeds.
- Buy ticket and board tram.
- HIVE bouncer / HIVE entry should still work exactly as before.
