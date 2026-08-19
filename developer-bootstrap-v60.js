(() => {
  "use strict";

  if (window.__SIMON_DEVELOPER_BOOTSTRAP_V60__) return;
  window.__SIMON_DEVELOPER_BOOTSTRAP_V60__ = true;

  const baseStartSimonGame = window.startSimonGame;

  if (typeof baseStartSimonGame !== "function") {
    console.error(
      "Developer Bootstrap v60: originale startSimonGame-Funktion fehlt."
    );
    return;
  }

  // Capture the ORIGINAL function object from game.js BEFORE flight-intro,
  // runtime-stability, HIVE, Venice, ETH, Oerlikon, etc. replace
  // window.startSimonGame with wrapper functions.
  //
  // The function keeps its private game/pendingStartOptions closure from
  // game.js, so calling this pointer later is equivalent to calling the
  // original game.js start function directly.
  window.__SIMON_DEVELOPER_BASE_V60__ = Object.freeze({
    version: 60,
    start: baseStartSimonGame,
    sceneClasses: window.__SIMON_SCENE_CLASSES__ || null
  });

  console.info(
    "Developer Bootstrap v60: originale game.js-Startfunktion gesichert."
  );
})();
