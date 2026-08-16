(() => {
  "use strict";

  if (window.__SIMON_PROGRESSION_MARKERS_V38__) return;
  window.__SIMON_PROGRESSION_MARKERS_V38__ = true;

  const wrappedStartSimonGame = window.startSimonGame;
  const ENRIQUE_DIALOGUE_ACTIONS = new Set([
    "WER BISCH DU?",
    "FLIRT LERNE",
    "NACH MOBUTO FRAGE"
  ]);

  function getActiveGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function ensureLockerMarker(scene, attempt = 0) {
    if (!scene || attempt > 80) return;

    const locker = scene.__sv37LockerObjects;
    const zone = locker?.zone;

    if (!zone?.active) {
      window.setTimeout(
        () => ensureLockerMarker(scene, attempt + 1),
        50
      );
      return;
    }

    if (scene.__sv38LockerMarker?.active) {
      scene.__sv38LockerMarker.setPosition(zone.x, zone.y - 8);
      scene.__sv38LockerMarker.setVisible(true);
      return;
    }

    if (typeof scene.createPulsingInteractionMarker !== "function") return;

    scene.__sv38LockerMarker = scene.createPulsingInteractionMarker(
      zone.x,
      zone.y - 8,
      176
    );
  }

  function patchSceneCreateForLocker(scene) {
    if (
      !scene ||
      typeof scene.create !== "function" ||
      scene.create.__sv38LockerMarkerCreate
    ) {
      return;
    }

    const originalCreate = scene.create.bind(scene);

    const wrappedCreate = function createWithLockerMarkerV38(...args) {
      const result = originalCreate(...args);
      window.setTimeout(() => ensureLockerMarker(this), 40);
      return result;
    };

    wrappedCreate.__sv38LockerMarkerCreate = true;
    scene.create = wrappedCreate;
  }

  function patchEnriqueConversation(scene) {
    if (
      !scene ||
      typeof scene.createDOMButton !== "function" ||
      scene.createDOMButton.__sv38EnriqueProgression
    ) {
      return;
    }

    const originalCreateDOMButton = scene.createDOMButton.bind(scene);

    const wrappedCreateDOMButton = function createDOMButtonV38(
      label,
      action,
      options
    ) {
      const normalized = String(label || "")
        .trim()
        .toUpperCase();

      const wrappedAction =
        ENRIQUE_DIALOGUE_ACTIONS.has(normalized)
          ? (...args) => {
              this.markEnriqueConversationComplete?.();
              return action?.(...args);
            }
          : action;

      return originalCreateDOMButton(label, wrappedAction, options);
    };

    wrappedCreateDOMButton.__sv38EnriqueProgression = true;
    scene.createDOMButton = wrappedCreateDOMButton;
  }

  function installOnGame(game, attempt = 0) {
    if (!game?.scene || attempt > 240) return;

    const milkbuck = game.scene.getScene?.("MilchbuckScene");
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");

    if (!milkbuck || !bahnhof) {
      window.setTimeout(() => installOnGame(game, attempt + 1), 50);
      return;
    }

    [milkbuck, bahnhof].forEach((scene) => {
      patchSceneCreateForLocker(scene);
      ensureLockerMarker(scene);
    });

    patchEnriqueConversation(bahnhof);
  }

  function waitForGame(attempt = 0) {
    const game = getActiveGame();
    if (game) {
      installOnGame(game);
      return;
    }

    if (attempt >= 240) return;
    window.setTimeout(() => waitForGame(attempt + 1), 50);
  }

  if (typeof wrappedStartSimonGame === "function") {
    window.startSimonGame = function startSimonGameV38(options = {}) {
      const game = wrappedStartSimonGame.call(this, options);

      if (game) {
        installOnGame(game);
      } else {
        waitForGame();
      }

      return game;
    };
  } else {
    waitForGame();
  }
})();
