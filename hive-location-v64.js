(() => {
  "use strict";

  if (window.__SIMON_HIVE_LOCATION_V64__) return;
  window.__SIMON_HIVE_LOCATION_V64__ = true;
  // Compatibility: older code only checks the v57 flag/API name.
  window.__SIMON_HIVE_LOCATION_V57__ = true;

  const VERSION = 64;
  const ORIGINAL_X = 1575;
  const TARGET_X = 2050;
  const SHIFT = TARGET_X - ORIGINAL_X; // +475

  function patch() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = SceneClass?.prototype;

    if (
      !proto ||
      typeof proto.createHiveClub !== "function" ||
      proto.createHiveClub.__hiveLocationV64
    ) {
      return false;
    }

    const original = proto.createHiveClub;

    const wrapped = function createHiveClubV64(...args) {
      const before = new Set(this.children?.list || []);
      const result = original.apply(this, args);

      const created = (this.children?.list || []).filter(
        (object) => !before.has(object)
      );

      created.forEach((object) => {
        if (!object || object.parentContainer) return;
        object.x = (Number(object.x) || 0) + SHIFT;
      });

      this.__hiveShiftV64 = SHIFT;
      this.__hiveShiftV57 = SHIFT;
      return result;
    };

    wrapped.__hiveLocationV64 = true;
    wrapped.__hiveLocationV57 = true;
    proto.createHiveClub = wrapped;
    return true;
  }

  patch();

  const timer = window.setInterval(() => {
    if (patch()) window.clearInterval(timer);
  }, 250);

  const api = Object.freeze({ VERSION, SHIFT, TARGET_X, ORIGINAL_X });
  window.SimonHiveLocationV64 = api;
  window.SimonHiveLocationV57 = api;

  console.info(
    "HIVE Location v64: HIVE liegt als eigenes Ziel der Milchbuck-Partystrasse bei x≈2050."
  );
})();
