(() => {
  "use strict";

  if (window.__SIMON_HIVE_LOCATION_V65__) return;
  window.__SIMON_HIVE_LOCATION_V65__ = true;

  // v65 deliberately returns HIVE to the base game's original coordinate.
  // The previous relocation layers (v57/v64) are NOT loaded by index.html.
  const VERSION = 65;
  const ORIGINAL_X = 1575;
  const TARGET_X = 1575;
  const SHIFT = 0;

  const api = Object.freeze({
    VERSION,
    ORIGINAL_X,
    TARGET_X,
    SHIFT
  });

  // Compatibility API only. No factory is wrapped because no relocation is
  // needed anymore; this also removes a whole class of fight/tween direction
  // bugs that came from translating old HIVE coordinates at runtime.
  window.SimonHiveLocationV65 = api;
  window.SimonHiveLocationV64 = api;
  window.SimonHiveLocationV57 = api;

  console.info(
    "HIVE Location v65: HIVE nutzt wieder die stabilen Basis-Koordinaten bei x≈1575."
  );
})();
