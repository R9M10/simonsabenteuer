(() => {
  "use strict";

  if (window.__SIMON_WORLD_STABILITY_V56__) return;
  window.__SIMON_WORLD_STABILITY_V56__ = true;
  window.__SIMON_WORLD_STABILITY_V55__ = true;

  const VERSION = 56;

  // Esthi v52 moved HIVE from 1575 to 1030.
  const HIVE_SHIFT = 1030 - 1575; // -545
  const HIVE_DOOR_X = 1700 + HIVE_SHIFT; // 1155
  const HIVE_BOUNCER_X = 1780 + HIVE_SHIFT; // 1235
  const OLD_HIVE_CAMERA_X = 1745;
  const NEW_HIVE_CAMERA_X = OLD_HIVE_CAMERA_X + HIVE_SHIFT;

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
      return value >= 1500
        ? value + HIVE_SHIFT
        : value;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const clone = { ...value };

      if (typeof clone.from === "number") {
        clone.from = shiftOldHiveX(clone.from);
      }

      if (typeof clone.to === "number") {
        clone.to = shiftOldHiveX(clone.to);
      }

      return clone;
    }

    return value;
  }

  function wrapHiveFactories(scene) {
    if (!scene) return;

    // hive-expansion v14.2 installs these factories on the scene instance after
    // create(). We therefore inspect them repeatedly and wrap the current
    // implementation, rather than assuming load order.
    if (
      typeof scene.createFightBouncer === "function" &&
      !scene.createFightBouncer.__hiveRelocationV55
    ) {
      const original = scene.createFightBouncer.bind(scene);

      const wrapped = function createFightBouncerRelocatedV55(
        x,
        y,
        ...args
      ) {
        const actor = original(
          shiftOldHiveX(x),
          y,
          ...args
        );

        if (actor) {
          actor.__hiveRelocatedActorV55 = true;
          actor.__hivePositionCorrectedV55 =
            shiftOldHiveX(x) !== x;
        }

        return actor;
      };

      wrapped.__hiveRelocationV55 = true;
      scene.createFightBouncer = wrapped;
    }

    if (
      typeof scene.createLion === "function" &&
      !scene.createLion.__hiveRelocationV55
    ) {
      const original = scene.createLion.bind(scene);

      const wrapped = function createLionRelocatedV55(
        x,
        y,
        ...args
      ) {
        const actor = original(
          shiftOldHiveX(x),
          y,
          ...args
        );

        if (actor) {
          actor.__hiveRelocatedActorV55 = true;
          actor.__hivePositionCorrectedV55 =
            shiftOldHiveX(x) !== x;
        }

        return actor;
      };

      wrapped.__hiveRelocationV55 = true;
      scene.createLion = wrapped;
    }
  }

  function wrapHiveTweens(scene) {
    const manager = scene?.tweens;
    if (!manager?.add || manager.add.__hiveRelocationV55) return;

    const original = manager.add.bind(manager);

    const wrapped = function addHiveAwareTweenV55(config = {}) {
      if (!config || typeof config !== "object") {
        return original(config);
      }

      const targets = Array.isArray(config.targets)
        ? config.targets
        : [config.targets];

      const hiveTarget = targets.some(
        (target) => isHiveActor(target, scene)
      );

      if (!hiveTarget || !("x" in config)) {
        return original(config);
      }

      return original({
        ...config,
        x: shiftOldHiveX(config.x)
      });
    };

    wrapped.__hiveRelocationV55 = true;
    manager.add = wrapped;
  }

  function wrapHiveCamera(scene) {
    const camera = scene?.cameras?.main;
    if (!camera?.pan || camera.pan.__hiveRelocationV55) return;

    const original = camera.pan.bind(camera);

    const wrapped = function panHiveAwareV55(
      x,
      y,
      ...args
    ) {
      const fixedX =
        Math.abs(Number(x) - OLD_HIVE_CAMERA_X) < 2
          ? NEW_HIVE_CAMERA_X
          : x;

      return original(fixedX, y, ...args);
    };

    wrapped.__hiveRelocationV55 = true;
    camera.pan = wrapped;
  }

  function shiftExistingActor(actor) {
    if (!actor?.active) return;

    if (
      (actor.__bouncerV12 ||
        actor.__lionV12 ||
        actor.__hiveRelocatedActorV55) &&
      actor.x >= 1500 &&
      !actor.__hivePositionCorrectedV55
    ) {
      actor.x += HIVE_SHIFT;
      actor.__hivePositionCorrectedV55 = true;
      actor.__hiveRelocatedActorV55 = true;
    }
  }

  function repairHive(scene) {
    if (
      !scene ||
      scene.sys?.settings?.key !== "MilchbuckScene"
    ) {
      return;
    }

    wrapHiveFactories(scene);
    wrapHiveTweens(scene);
    wrapHiveCamera(scene);

    // Door/hitbox installed later by hive-expansion v14.2.
    if (scene.__hiveV12DoorZone?.active) {
      scene.__hiveV12DoorZone.setPosition?.(
        HIVE_DOOR_X,
        282
      );
    }

    if (scene.__hiveV12DoorLabel?.active) {
      scene.__hiveV12DoorLabel.setPosition?.(
        HIVE_DOOR_X,
        208
      );
    }

    // The static bouncer is normally already shifted by Esthi v52 because it
    // replaces the procedural bouncer at its current x. This condition only
    // repairs a late replacement that was installed at the old coordinate.
    if (
      scene.bouncer?.active &&
      scene.bouncer.x > 1450 &&
      !scene.fightActive
    ) {
      scene.bouncer.x = HIVE_BOUNCER_X;
      scene.bouncer.__hivePositionCorrectedV55 = true;
      scene.bouncer.__hiveRelocatedActorV55 = true;
    }

    shiftExistingActor(scene.fightLion);

    (scene.fightBouncers || []).forEach(
      shiftExistingActor
    );
  }

  function cleanupDetachedUI() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    // Only remove overlays whose owning scene/dialogue is definitely gone.
    const game = getGame();
    const station = getScene(game, "BahnhofquaiScene");

    if (
      !station?.bookstoreOverlay &&
      !station?.__cashierStoreDialogueActiveV54
    ) {
      root
        .querySelectorAll(
          '[data-simon-ui="cashier-store-dialogue-v54"]'
        )
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
          // Quiz/dialogue may belong to ETH, so only remove when neither
          // destination scene is active.
          const terrace = getScene(game, "PolyterrasseScene");
          const eth = getScene(game, "ETHInteriorScene");

          if (
            !terrace?.sys?.isActive?.() &&
            !eth?.sys?.isActive?.()
          ) {
            node.remove();
          }
        });
    }
  }

  function repair(game) {
    if (!game?.scene) return;

    repairHive(getScene(game, "MilchbuckScene"));

    // Let ETH's own transition watchdog handle the details.
    window.SimonETHV56?.recover?.();

    cleanupDetachedUI();
  }

  // Repair once immediately after the complete nested startSimonGame wrapper
  // chain has returned. This means late-installed HIVE door/factory objects are
  // corrected before the player can interact with them, rather than waiting for
  // the first 250 ms maintenance tick.
  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameWorldStabilityV56(
      options = {}
    ) {
      const game = previousStart.call(this, options);

      repair(game);
      window.setTimeout(() => repair(game), 60);

      return game;
    };
  }

  // No extra RAF loop. A quarter-second repair cadence is more than enough for
  // hitbox/cutscene consistency and reduces the amount of permanent per-frame
  // patch work in the project.
  window.setInterval(() => {
    repair(getGame());
  }, 250);

  const publicApi = Object.freeze({
    VERSION,
    HIVE_SHIFT,
    HIVE_DOOR_X,

    repair() {
      repair(getGame());
    },

    status() {
      const game = getGame();
      const milk = getScene(game, "MilchbuckScene");

      return {
        hiveDoorX: milk?.__hiveV12DoorZone?.x ?? null,
        hiveBouncerX: milk?.bouncer?.x ?? null,
        fightLionX: milk?.fightLion?.x ?? null,
        fightBouncers:
          (milk?.fightBouncers || []).map(
            (actor) => actor?.x ?? null
          ),
        eth:
          window.SimonETHV56?.status?.() || null
      };
    }
  });

  window.SimonWorldStabilityV56 = publicApi;
  window.SimonWorldStabilityV55 = publicApi;

  console.info(
    "World Stability v56: HIVE-Layout stabil, Polybahn-Rückkehr und UI-Recovery aktiv."
  );
})();
