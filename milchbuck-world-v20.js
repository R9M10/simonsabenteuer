(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_WORLD_V20__) return;
  window.__SIMON_MILCHBUCK_WORLD_V20__ = true;

  const WORLD = Object.freeze({
    width: 3000,
    height: 390,
    groundTop: 338
  });

  // Canonical render order for NEW Milchbuck artwork.
  // Existing objects keep their current depth in v20; only their world scroll factor
  // is normalized so all current scenery shares the same coordinate system.
  const DEPTHS = Object.freeze({
    background: -30,
    midground: -10,
    ground: 0,
    propsBack: 5,
    player: 10,
    npc: 12,
    foreground: 20,
    propsFront: 25,
    interaction: 150,
    ui: 300
  });

  const LAYERS = Object.freeze([
    "background",
    "midground",
    "ground",
    "propsBack",
    "gameplay",
    "foreground",
    "propsFront",
    "interaction",
    "ui"
  ]);

  function makeRegistry() {
    const result = {};
    LAYERS.forEach((name) => {
      result[name] = [];
    });
    return result;
  }

  function addUnique(list, object) {
    if (object && !list.includes(object)) list.push(object);
  }

  function isAlive(object) {
    return Boolean(object && object.active !== false && object.scene);
  }

  function isScreenSpaceObject(object) {
    if (!object) return false;

    const x = Number(object.scrollFactorX);
    const y = Number(object.scrollFactorY);

    // HUD/touch controls intentionally stay glued to the camera.
    return x === 0 && y === 0;
  }

  function isExplicitGameplayObject(scene, object) {
    if (!scene || !object) return false;
    if (object === scene.player || object === scene.bouncer || object === scene.fightLion) {
      return true;
    }
    return Array.isArray(scene.fightBouncers) && scene.fightBouncers.includes(object);
  }

  function isExplicitInteractionObject(scene, object) {
    if (!scene || !object) return false;
    return (
      object === scene.ground ||
      object === scene.ticketHitbox ||
      object === scene.tramHitbox ||
      object === scene.tramBoardingMarker
    );
  }

  function classify(scene, object) {
    if (!object) return null;

    if (isScreenSpaceObject(object)) return "ui";
    if (isExplicitInteractionObject(scene, object)) return "interaction";
    if (isExplicitGameplayObject(scene, object)) return "gameplay";

    const depth = Number(object.depth) || 0;

    if (depth >= 100) return "interaction";
    if (depth <= -20) return "background";
    if (depth < 0) return "midground";
    if (depth === 0) return "ground";
    if (depth < DEPTHS.player) return "propsBack";
    if (depth <= DEPTHS.npc) return "gameplay";

    // Higher existing objects are mostly temporary gameplay/effect objects.
    // Do not pretend they are permanent foreground art until we replace them deliberately.
    return "gameplay";
  }

  function register(scene, layerName, object) {
    if (!scene || !object || !LAYERS.includes(layerName)) return object;

    if (!scene.milchbuckRenderLayersV20) {
      scene.milchbuckRenderLayersV20 = makeRegistry();
    }

    LAYERS.forEach((name) => {
      scene.milchbuckRenderLayersV20[name] =
        scene.milchbuckRenderLayersV20[name].filter((entry) => entry !== object);
    });

    addUnique(scene.milchbuckRenderLayersV20[layerName], object);
    object.setData?.("milchbuckRenderLayerV20", layerName);
    return object;
  }

  function normalizeWorldScroll(scene) {
    if (!scene?.children?.list) return { changed: 0, preservedUI: 0 };

    let changed = 0;
    let preservedUI = 0;

    scene.children.list.forEach((object) => {
      if (!object?.setScrollFactor) return;

      if (isScreenSpaceObject(object)) {
        preservedUI += 1;
        return;
      }

      const oldX = Number(object.scrollFactorX);
      const oldY = Number(object.scrollFactorY);

      if (oldX !== 1 || oldY !== 1) {
        object.setScrollFactor(1, 1);
        changed += 1;
      }
    });

    scene.__milchbuckWorldScrollNormalizedV20 = true;
    return { changed, preservedUI };
  }

  function rebuildRegistry(scene) {
    if (!scene?.children?.list) return null;

    scene.milchbuckRenderLayersV20 = makeRegistry();

    scene.children.list.forEach((object) => {
      const layerName = classify(scene, object);
      if (layerName) register(scene, layerName, object);
    });

    // Important semantic references.
    register(scene, "propsBack", scene.tram);
    register(scene, "gameplay", scene.player);
    register(scene, "gameplay", scene.bouncer);
    register(scene, "interaction", scene.ground);
    register(scene, "interaction", scene.ticketHitbox);
    register(scene, "interaction", scene.tramHitbox);
    register(scene, "interaction", scene.tramBoardingMarker);

    scene.__milchbuckRegistryReadyV20 = true;
    return scene.milchbuckRenderLayersV20;
  }

  function normalizeScene(scene) {
    if (!scene) return null;
    const scrollResult = normalizeWorldScroll(scene);
    const layers = rebuildRegistry(scene);

    console.info(
      `[Milchbuck v20] Weltmaßstab vereinheitlicht: ${scrollResult.changed} ` +
      `Objekt(e) auf scrollFactor 1 gesetzt; ${scrollResult.preservedUI} ` +
      "Screen-UI-Objekt(e) unverändert."
    );

    return { scrollResult, layers };
  }

  function audit(scene) {
    if (!scene?.children?.list) return null;

    const factors = new Map();
    let worldObjects = 0;
    let screenObjects = 0;

    scene.children.list.forEach((object) => {
      if (!object?.setScrollFactor) return;

      const x = Number(object.scrollFactorX);
      const y = Number(object.scrollFactorY);
      const key = `${x},${y}`;
      factors.set(key, (factors.get(key) || 0) + 1);

      if (x === 0 && y === 0) screenObjects += 1;
      else worldObjects += 1;
    });

    const layerCounts = {};
    LAYERS.forEach((name) => {
      const values = scene.milchbuckRenderLayersV20?.[name] || [];
      layerCounts[name] = values.filter(isAlive).length;
    });

    const result = {
      world: WORLD,
      canonicalDepths: DEPTHS,
      worldObjects,
      screenObjects,
      scrollFactors: Object.fromEntries(factors.entries()),
      layerCounts
    };

    console.log("[Milchbuck v20] Audit", result);
    return result;
  }

  function installScene(scene) {
    if (!scene || scene.__milchbuckWorldV20Installed) return;
    scene.__milchbuckWorldV20Installed = true;

    scene.milchbuckWorldV20 = WORLD;
    scene.milchbuckDepthsV20 = DEPTHS;
    scene.milchbuckRenderLayersV20 = makeRegistry();

    scene.normalizeMilchbuckWorldV20 = function normalizeMilchbuckWorldV20() {
      return normalizeScene(this);
    };

    scene.rebuildMilchbuckLayersV20 = function rebuildMilchbuckLayersV20() {
      return rebuildRegistry(this);
    };

    // Phaser reuses MilchbuckScene after tram travel. Re-normalize after every create().
    if (!scene.__milchbuckCreateWrappedV20 && typeof scene.create === "function") {
      scene.__milchbuckCreateWrappedV20 = true;
      const originalCreate = scene.create;

      scene.create = function createWithUnifiedMilchbuckWorld(...args) {
        const result = originalCreate.apply(this, args);
        normalizeScene(this);
        return result;
      };
    }

    // The initial create() may already be complete before this patch gets attached.
    if (scene.sys?.isActive?.()) {
      normalizeScene(scene);
    }
  }

  function installOnGame(game, attempt = 0) {
    if (!game?.scene || attempt > 160) return;

    const milchbuck = game.scene.getScene?.("MilchbuckScene");

    if (!milchbuck) {
      window.setTimeout(() => installOnGame(game, attempt + 1), 25);
      return;
    }

    installScene(milchbuck);
  }

  function getScene() {
    return window.__SIMON_ACTIVE_GAME_V20__?.scene?.getScene?.("MilchbuckScene") || null;
  }

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("[Milchbuck v20] startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithMilchbuckWorldV20(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (game) {
      window.__SIMON_ACTIVE_GAME_V20__ = game;
      installOnGame(game);
    }

    return game;
  };

  window.MilchbuckWorldV20 = Object.freeze({
    WORLD,
    DEPTHS,
    getScene,
    normalize() {
      const scene = getScene();
      return scene ? normalizeScene(scene) : null;
    },
    audit() {
      const scene = getScene();
      return scene ? audit(scene) : null;
    }
  });
})();
