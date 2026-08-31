(() => {
  "use strict";

  if (window.__SIMON_WORLD_STABILITY_V64__) return;
  window.__SIMON_WORLD_STABILITY_V64__ = true;
  // Compatibility aliases for older modules that only test/read v57/v56/v55.
  window.__SIMON_WORLD_STABILITY_V57__ = true;
  window.__SIMON_WORLD_STABILITY_V56__ = true;
  window.__SIMON_WORLD_STABILITY_V55__ = true;

  const VERSION = 64;

  // Milchbuck v64 deliberately separates the tram stop from HIVE.
  // Base game coordinates are still the original HIVE coordinates around 1575.
  const HIVE_LEFT_X = 2050;
  const HIVE_SHIFT = HIVE_LEFT_X - 1575; // +475
  const HIVE_DOOR_X = 1700 + HIVE_SHIFT; // 2175
  const HIVE_BOUNCER_X = 1780 + HIVE_SHIFT; // 2255
  const OLD_HIVE_CAMERA_X = 1745;
  const NEW_HIVE_CAMERA_X = OLD_HIVE_CAMERA_X + HIVE_SHIFT; // 2220

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

  function isHiveActor(target, scene) {
    if (!target) return false;

    if (
      target === scene?.bouncer ||
      target === scene?.fightLion ||
      target.__bouncerV12 ||
      target.__lionV12 ||
      target.__hiveRelocatedActorV64 ||
      target.__hiveRelocatedActorV55
    ) {
      return true;
    }

    return Boolean(
      Array.isArray(scene?.fightBouncers) &&
      scene.fightBouncers.includes(target)
    );
  }

  function shiftOldHiveX(value) {
    if (typeof value === "number") {
      return value >= 1500 ? value + HIVE_SHIFT : value;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const clone = { ...value };
      if (typeof clone.from === "number") clone.from = shiftOldHiveX(clone.from);
      if (typeof clone.to === "number") clone.to = shiftOldHiveX(clone.to);
      return clone;
    }

    return value;
  }

  function wrapHiveFactories(scene) {
    if (!scene) return;

    if (
      typeof scene.createFightBouncer === "function" &&
      !scene.createFightBouncer.__hiveRelocationV64
    ) {
      const original = scene.createFightBouncer.bind(scene);

      const wrapped = function createFightBouncerRelocatedV64(x, y, ...args) {
        const fixedX = shiftOldHiveX(x);
        const actor = original(fixedX, y, ...args);

        if (actor) {
          actor.__hiveRelocatedActorV64 = true;
          actor.__hiveRelocatedActorV55 = true;
          actor.__hivePositionCorrectedV64 = fixedX !== x;
          actor.__hivePositionCorrectedV55 = fixedX !== x;
        }

        return actor;
      };

      wrapped.__hiveRelocationV64 = true;
      wrapped.__hiveRelocationV55 = true;
      scene.createFightBouncer = wrapped;
    }

    if (
      typeof scene.createLion === "function" &&
      !scene.createLion.__hiveRelocationV64
    ) {
      const original = scene.createLion.bind(scene);

      const wrapped = function createLionRelocatedV64(x, y, ...args) {
        const fixedX = shiftOldHiveX(x);
        const actor = original(fixedX, y, ...args);

        if (actor) {
          actor.__hiveRelocatedActorV64 = true;
          actor.__hiveRelocatedActorV55 = true;
          actor.__hivePositionCorrectedV64 = fixedX !== x;
          actor.__hivePositionCorrectedV55 = fixedX !== x;
        }

        return actor;
      };

      wrapped.__hiveRelocationV64 = true;
      wrapped.__hiveRelocationV55 = true;
      scene.createLion = wrapped;
    }
  }

  function wrapHiveTweens(scene) {
    const manager = scene?.tweens;
    if (!manager?.add || manager.add.__hiveRelocationV64) return;

    const original = manager.add.bind(manager);

    const wrapped = function addHiveAwareTweenV64(config = {}) {
      if (!config || typeof config !== "object") return original(config);

      const targets = Array.isArray(config.targets)
        ? config.targets
        : [config.targets];

      const hiveTarget = targets.some((target) => isHiveActor(target, scene));
      if (!hiveTarget || !("x" in config)) return original(config);

      return original({ ...config, x: shiftOldHiveX(config.x) });
    };

    wrapped.__hiveRelocationV64 = true;
    wrapped.__hiveRelocationV55 = true;
    manager.add = wrapped;
  }

  function wrapHiveCamera(scene) {
    const camera = scene?.cameras?.main;
    if (!camera?.pan || camera.pan.__hiveRelocationV64) return;

    const original = camera.pan.bind(camera);

    const wrapped = function panHiveAwareV64(x, y, ...args) {
      const fixedX =
        Math.abs(Number(x) - OLD_HIVE_CAMERA_X) < 2
          ? NEW_HIVE_CAMERA_X
          : x;

      return original(fixedX, y, ...args);
    };

    wrapped.__hiveRelocationV64 = true;
    wrapped.__hiveRelocationV55 = true;
    camera.pan = wrapped;
  }

  function shiftExistingActor(actor) {
    if (!actor?.active) return;

    if (
      (actor.__bouncerV12 ||
        actor.__lionV12 ||
        actor.__hiveRelocatedActorV64 ||
        actor.__hiveRelocatedActorV55) &&
      actor.x >= 1500 &&
      !actor.__hivePositionCorrectedV64 &&
      !actor.__hivePositionCorrectedV55
    ) {
      actor.x += HIVE_SHIFT;
      actor.__hivePositionCorrectedV64 = true;
      actor.__hivePositionCorrectedV55 = true;
      actor.__hiveRelocatedActorV64 = true;
      actor.__hiveRelocatedActorV55 = true;
    }
  }

  function repairHive(scene) {
    if (!scene || scene.sys?.settings?.key !== "MilchbuckScene") return;

    wrapHiveFactories(scene);
    wrapHiveTweens(scene);
    wrapHiveCamera(scene);

    // Door/hitbox is installed by hive-expansion after the base scene starts.
    if (scene.__hiveV12DoorZone?.active) {
      scene.__hiveV12DoorZone.setPosition?.(HIVE_DOOR_X, 282);
    }

    if (scene.__hiveV12DoorLabel?.active) {
      scene.__hiveV12DoorLabel.setPosition?.(HIVE_DOOR_X, 208);
    }

    // Static bouncer must remain at the new HIVE, even after later replacements.
    if (scene.bouncer?.active && !scene.fightActive) {
      const looksHiveRelated =
        scene.bouncer.__bouncerV12 ||
        scene.bouncer.__hiveRelocatedActorV64 ||
        scene.bouncer.__hiveRelocatedActorV55 ||
        scene.bouncer.x > 1450;

      if (looksHiveRelated && Math.abs(scene.bouncer.x - HIVE_BOUNCER_X) > 2) {
        scene.bouncer.x = HIVE_BOUNCER_X;
        scene.bouncer.__hivePositionCorrectedV64 = true;
        scene.bouncer.__hivePositionCorrectedV55 = true;
        scene.bouncer.__hiveRelocatedActorV64 = true;
        scene.bouncer.__hiveRelocatedActorV55 = true;
      }
    }

    shiftExistingActor(scene.fightLion);
    (scene.fightBouncers || []).forEach(shiftExistingActor);
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
    window.startSimonGame = function startSimonGameWorldStabilityV64(options = {}) {
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
    HIVE_SHIFT,
    HIVE_DOOR_X,
    HIVE_BOUNCER_X,
    NEW_HIVE_CAMERA_X,

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

  window.SimonWorldStabilityV64 = publicApi;
  window.SimonWorldStabilityV57 = publicApi;
  window.SimonWorldStabilityV56 = publicApi;
  window.SimonWorldStabilityV55 = publicApi;

  console.info(
    "World Stability v64: HIVE bei x≈2050, Story-/Kampfkoordinaten und UI-Recovery stabilisiert."
  );
})();
