SIMONS ABENTEUER — MILCHBUCK v65
================================

Upload all files in this ZIP to the repository root and replace index.html and flight-intro.js.

NEW / REPLACED
- index.html
- flight-intro.js (v17)
- hive-location-v65.js
- world-stability-v65.js
- milchbuck-polish-v65.js
- SCENE-PARALLAX-V65.md

IMPORTANT
Do not load hive-location-v64.js, world-stability-v64.js or milchbuck-polish-v64.js from index.html anymore. They may remain in the repository as unused historical files.

WHAT CHANGED
1. Plane thought bubble continuously follows the aircraft with damping; connector dots remain between bubble and plane.
2. HIVE returns to stable original coordinates around x=1575, creating a short but distinct walk after the stop.
3. Removed the fake row of closed clubs/shops. The walk is residential/green and non-interactive.
4. Tram rails exist only in the station zone and visibly depart the street.
5. Station receives explicit base plates / contact shadow to stop the floating impression.
6. Parallax is now manually driven by camera.scrollX every frame, with clearly separated speeds.
7. Lion run direction is corrected from its actual x movement, preventing backward jumping/running.

TEST
- normal start -> plane intro
- walk from station to HIVE
- watch hills vs. residential background vs. foreground while camera scrolls
- start bouncer/lion encounter and verify lion faces its movement
- ticket machine / tram still work
- HIVE door and bouncer remain aligned
