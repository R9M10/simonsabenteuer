(() => {
  "use strict";

  if (window.__SIMON_WORLD_STABILITY_V65__) return;
  window.__SIMON_WORLD_STABILITY_V65__ = true;

  // Compatibility flags for modules that merely test for an installed world
  // stability layer. v64 itself is intentionally not loaded by index.html.
  window.__SIMON_WORLD_STABILITY_V64__ = true;
  window.__SIMON_WORLD_STABILITY_V57__ = true;
  window.__SIMON_WORLD_STABILITY_V56__ = true;
  window.__SIMON_WORLD_STABILITY_V55__ = true;

  const VERSION = 65;
  const HIVE_LEFT_X = 1575;
  const HIVE_DOOR_X = 1700;
  const HIVE_BOUNCER_X = 1780;
  const HIVE_CAMERA_X = 1745;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(game, key) {
    try {
      return game?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function normalizeHiveActorScale(actor) {
    if (!actor?.active) return;
    const sx = Math.max(0.01, Math.abs(actor.scaleX || 1));
    const sy = Math.max(0.01, Math.abs(actor.scaleY || 1));
    actor.setScale?.(sx, sy);
  }

  function repairHive(scene) {
    if (!scene || scene.sys?.settings?.key !== "MilchbuckScene") return;

    // HIVE v14.2 uses these canonical base coordinates. Explicitly restore
    // them in case the scene instance survived a previous v64 page session.
    if (scene.__hiveV12DoorZone?.active) {
      scene.__hiveV12DoorZone.setPosition?.(HIVE_DOOR_X, 282);
    }

    if (scene.__hiveV12DoorLabel?.active) {
      scene.__hiveV12DoorLabel.setPosition?.(HIVE_DOOR_X, 208);
    }

    if (scene.bouncer?.active && !scene.fightActive) {
      const hiveBouncer =
        scene.bouncer.__bouncerV12 ||
        scene.bouncer.x > 1450;

      if (hiveBouncer && Math.abs(scene.bouncer.x - HIVE_BOUNCER_X) > 2) {
        scene.bouncer.x = HIVE_BOUNCER_X;
      }
      normalizeHiveActorScale(scene.bouncer);
    }

    normalizeHiveActorScale(scene.fightLion);
    (scene.fightBouncers || []).forEach(normalizeHiveActorScale);
  }

  function cleanupDetachedUI() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    const game = getGame();
    const wg = getScene(game, "WGInteriorScene");
    const room = getScene(game, "SimonRoomScene");

    if (!wg?.sys?.isActive?.() && !room?.sys?.isActive?.()) {
      root
        .querySelectorAll(
          '[data-simon-ui="wg-room-select-v57"],' +
          '[data-simon-ui="simon-room-v57"]'
        )
        .forEach((node) => node.remove());
    }

    const station = getScene(game, "BahnhofquaiScene");
    if (!station?.bookstoreOverlay && !station?.__cashierStoreDialogueActiveV54) {
      root
        .querySelectorAll('[data-simon-ui="cashier-store-dialogue-v54"]')
        .forEach((node) => node.remove());
    }

    const transit = getScene(game, "PolybahnTransitScene");
    if (!transit?.sys?.isActive?.()) {
      root
        .querySelectorAll(
          '[data-simon-ui="eth-dialogue-v55"],' +
          '[data-simon-ui="eth-quiz-v55"]'
        )
        .forEach((node) => {
          const terrace = getScene(game, "PolyterrasseScene");
          const eth = getScene(game, "ETHInteriorScene");
          if (!terrace?.sys?.isActive?.() && !eth?.sys?.isActive?.()) node.remove();
        });
    }
  }

  function repair(game) {
    if (!game?.scene) return;
    repairHive(getScene(game, "MilchbuckScene"));
    window.SimonETHV57?.recover?.();
    cleanupDetachedUI();
  }

  const previousStart = window.startSimonGame;
  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameWorldStabilityV65(options = {}) {
      const game = previousStart.call(this, options);
      repair(game);
      window.setTimeout(() => repair(game), 60);
      return game;
    };
  }

  window.setInterval(() => repair(getGame()), 250);

  const publicApi = Object.freeze({
    VERSION,
    HIVE_LEFT_X,
    HIVE_DOOR_X,
    HIVE_BOUNCER_X,
    HIVE_CAMERA_X,
    HIVE_SHIFT: 0,

    repair() {
      repair(getGame());
    },

    status() {
      const game = getGame();
      const milk = getScene(game, "MilchbuckScene");
      return {
        hiveLeftX: HIVE_LEFT_X,
        hiveDoorX: milk?.__hiveV12DoorZone?.x ?? null,
        hiveBouncerX: milk?.bouncer?.x ?? null,
        fightLionX: milk?.fightLion?.x ?? null,
        fightBouncers: (milk?.fightBouncers || []).map((actor) => actor?.x ?? null),
        eth: window.SimonETHV57?.status?.() || null
      };
    }
  });

  window.SimonWorldStabilityV65 = publicApi;
  window.SimonWorldStabilityV64 = publicApi;
  window.SimonWorldStabilityV57 = publicApi;
  window.SimonWorldStabilityV56 = publicApi;
  window.SimonWorldStabilityV55 = publicApi;

  console.info(
    "World Stability v65: HIVE-Basisposition wiederhergestellt; keine Laufzeit-Koordinatenverschiebung mehr."
  );
})();
