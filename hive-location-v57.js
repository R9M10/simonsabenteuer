(() => {
  "use strict";

  if (window.__SIMON_HIVE_LOCATION_V57__) return;
  window.__SIMON_HIVE_LOCATION_V57__ = true;

  const VERSION = 57;
  const ORIGINAL_X = 1575;
  const TARGET_X = 1030;
  const SHIFT = TARGET_X - ORIGINAL_X;

  function patch() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;

    const proto = SceneClass?.prototype;

    if (
      !proto ||
      typeof proto.createHiveClub !== "function" ||
      proto.createHiveClub.__hiveLocationV57
    ) {
      return false;
    }

    const original = proto.createHiveClub;

    const wrapped = function createHiveClubV57(...args) {
      const before = new Set(this.children?.list || []);
      const result = original.apply(this, args);

      const created = (this.children?.list || []).filter(
        (object) => !before.has(object)
      );

      created.forEach((object) => {
        if (!object || object.parentContainer) return;
        object.x = (Number(object.x) || 0) + SHIFT;
      });

      this.__hiveShiftV57 = SHIFT;
      return result;
    };

    wrapped.__hiveLocationV57 = true;
    proto.createHiveClub = wrapped;
    return true;
  }

  patch();

  // Load-order failsafe only; once installed this becomes a no-op.
  const timer = window.setInterval(() => {
    if (patch()) {
      window.clearInterval(timer);
    }
  }, 250);

  window.SimonHiveLocationV57 = Object.freeze({
    VERSION,
    SHIFT,
    TARGET_X
  });

  console.info(
    "HIVE Location v57: HIVE-Fassade bleibt bei x≈1030; Esthi wurde aus Milchbuck entfernt."
  );
})();
