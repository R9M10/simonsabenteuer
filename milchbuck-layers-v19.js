(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_LAYERS_V19__) return;
  window.__SIMON_MILCHBUCK_LAYERS_V19__ = true;

  const WORLD = Object.freeze({
    width: 3000,
    height: 390,
    groundTop: 338
  });

  // Canonical slots for future Milchbuck artwork.
  // Existing objects keep their current depth so installing this file alone
  // cannot visually rearrange or break the already-working scene.
  const DEPTHS = Object.freeze({
    background: -30,
    midground: -10,
    ground: 0,
    propsBack: 5,
    player: 10,
    npc: 12,
    propsFront: 15,
    foreground: 20,
    interaction: 150,
    ui: 300
  });

  const LAYER_NAMES = Object.freeze([
    "background",
    "midground",
    "ground",
    "propsBack",
    "gameplay",
    "propsFront",
    "foreground",
    "interaction",
    "ui"
  ]);

  const FULL_CANVAS_LAYERS = new Set([
    "background",
    "midground",
    "ground",
    "foreground"
  ]);

  function makeRegistry() {
    const registry = {};
    LAYER_NAMES.forEach((name) => {
      registry[name] = [];
    });
    return registry;
  }

  function depthFor(layerName) {
    if (layerName === "gameplay") return DEPTHS.player;
    return DEPTHS[layerName];
  }

  function isAlive(object) {
    return Boolean(object && object.active !== false && object.scene);
  }

  function addUnique(list, object) {
    if (object && !list.includes(object)) list.push(object);
  }

  function removeFromAllLayers(scene, object) {
    if (!scene?.milchbuckRenderLayers || !object) return;

    LAYER_NAMES.forEach((name) => {
      scene.milchbuckRenderLayers[name] =
        scene.milchbuckRenderLayers[name].filter((entry) => entry !== object);
    });
  }

  function register(scene, layerName, object, options = {}) {
    if (!scene || !object || !LAYER_NAMES.includes(layerName)) return object;

    if (!scene.milchbuckRenderLayers) {
      scene.milchbuckRenderLayers = makeRegistry();
    }

    removeFromAllLayers(scene, object);
    addUnique(scene.milchbuckRenderLayers[layerName], object);

    object.setData?.("milchbuckRenderLayer", layerName);

    // Existing scene objects are registered without moving them.
    // applyDepth is only for NEW objects/assets added through this API.
    if (options.applyDepth === true) {
      const targetDepth = Number.isFinite(options.depth)
        ? options.depth
        : depthFor(layerName);

      if (Number.isFinite(targetDepth)) {
        object.setDepth?.(targetDepth);
      }
    }

    return object;
  }

  function classifyExistingObject(scene, object) {
    if (!object) return null;

    // Explicit gameplay / collision / interaction references win over depth.
    if (object === scene.player || object === scene.bouncer) return "gameplay";
    if (Array.isArray(scene.fightBouncers) && scene.fightBouncers.includes(object)) {
      return "gameplay";
    }
    if (object === scene.fightLion) return "gameplay";

    if (object === scene.ground) return "interaction";
    if (
      object === scene.ticketHitbox ||
      object === scene.tramHitbox ||
      object === scene.tramBoardingMarker
    ) {
      return "interaction";
    }

    const depth = Number(object.depth) || 0;
    const scrollX = Number(object.scrollFactorX);
    const scrollY = Number(object.scrollFactorY);

    // Fixed-screen high-depth objects are HUD / touch UI.
    if (scrollX === 0 && scrollY === 0 && depth >= 50) {
      return "ui";
    }

    if (depth >= 100) return "interaction";
    if (depth <= -20) return "background";
    if (depth < 0) return "midground";
    if (depth === 0) return "ground";
    if (depth <= 3) return "propsBack";
    if (depth < DEPTHS.player) return "propsFront";
    if (depth <= DEPTHS.npc) return "gameplay";

    // Higher temporary combat/effect objects are deliberately not treated as
    // permanent foreground artwork. They stay gameplay unless explicitly added
    // to the new foreground layer later.
    return "gameplay";
  }

  function rebuildRegistry(scene) {
    if (!scene?.children?.list) return null;

    scene.milchbuckRenderLayers = makeRegistry();

    scene.children.list.forEach((object) => {
      const layerName = classifyExistingObject(scene, object);
      if (layerName) register(scene, layerName, object);
    });

    // Semantic overrides for the most important current Milchbuck props.
    // Their numeric depths are NOT changed.
    register(scene, "propsBack", scene.tram);
    register(scene, "gameplay", scene.player);
    register(scene, "gameplay", scene.bouncer);
    register(scene, "interaction", scene.ground);
    register(scene, "interaction", scene.ticketHitbox);
    register(scene, "interaction", scene.tramHitbox);
    register(scene, "interaction", scene.tramBoardingMarker);

    scene.__milchbuckLayerRegistryReady = true;
    return scene.milchbuckRenderLayers;
  }

  function textureSize(scene, textureKey) {
    if (!scene?.textures?.exists(textureKey)) return null;

    const texture = scene.textures.get(textureKey);
    const source = texture?.getSourceImage?.();
    if (!source) return null;

    return {
      width: Number(source.width) || 0,
      height: Number(source.height) || 0
    };
  }

  function validateFullCanvasTexture(scene, textureKey) {
    const size = textureSize(scene, textureKey);

    if (!size) {
      console.error(`[Milchbuck Layers] Texture "${textureKey}" ist nicht geladen.`);
      return false;
    }

    if (size.width !== WORLD.width || size.height !== WORLD.height) {
      console.error(
        `[Milchbuck Layers] "${textureKey}" hat ${size.width}×${size.height}px. ` +
        `Ein Vollbild-Layer muss exakt ${WORLD.width}×${WORLD.height}px groß sein. ` +
        "Das Bild wird NICHT automatisch gestreckt."
      );
      return false;
    }

    return true;
  }

  function addLayerImage(scene, textureKey, layerName, options = {}) {
    if (!scene || !LAYER_NAMES.includes(layerName)) {
      console.error(`[Milchbuck Layers] Ungültiger Layer: ${layerName}`);
      return null;
    }

    if (!scene.textures.exists(textureKey)) {
      console.error(`[Milchbuck Layers] Texture "${textureKey}" ist nicht geladen.`);
      return null;
    }

    const fullCanvas = options.fullCanvas ?? FULL_CANVAS_LAYERS.has(layerName);
    if (fullCanvas && !validateFullCanvasTexture(scene, textureKey)) return null;

    const image = scene.add.image(
      Number.isFinite(options.x) ? options.x : 0,
      Number.isFinite(options.y) ? options.y : 0,
      textureKey
    )
      .setOrigin(
        Number.isFinite(options.originX) ? options.originX : 0,
        Number.isFinite(options.originY) ? options.originY : 0
      )
      .setScrollFactor(
        Number.isFinite(options.scrollFactor) ? options.scrollFactor : 1
      )
      .setDepth(
        Number.isFinite(options.depth) ? options.depth : depthFor(layerName)
      );

    // Important: no setScale() or setDisplaySize() for full-canvas art.
    // Wrong exports fail validation instead of deforming the level.
    return register(scene, layerName, image);
  }

  function addPropImage(scene, textureKey, x, y, options = {}) {
    const layerName = options.front === true ? "propsFront" : "propsBack";

    return addLayerImage(scene, textureKey, layerName, {
      ...options,
      x,
      y,
      fullCanvas: false,
      originX: Number.isFinite(options.originX) ? options.originX : 0.5,
      originY: Number.isFinite(options.originY) ? options.originY : 1
    });
  }

  function setLayerVisible(scene, layerName, visible) {
    const layer = scene?.milchbuckRenderLayers?.[layerName];
    if (!Array.isArray(layer)) return;

    layer.forEach((object) => {
      if (isAlive(object)) object.setVisible?.(Boolean(visible));
    });
  }

  function cleanRegistry(scene) {
    if (!scene?.milchbuckRenderLayers) return;

    LAYER_NAMES.forEach((name) => {
      scene.milchbuckRenderLayers[name] =
        scene.milchbuckRenderLayers[name].filter(isAlive);
    });
  }

  function audit(scene) {
    if (!scene) return null;

    cleanRegistry(scene);

    const summary = {};
    LAYER_NAMES.forEach((name) => {
      summary[name] = scene.milchbuckRenderLayers?.[name]?.length || 0;
    });

    console.table(summary);
    return summary;
  }

  function installSceneAPI(scene) {
    if (!scene || scene.__milchbuckLayerApiV19Installed) return;
    scene.__milchbuckLayerApiV19Installed = true;

    scene.milchbuckRenderDepths = DEPTHS;
    scene.milchbuckRenderWorld = WORLD;
    scene.milchbuckRenderLayers = makeRegistry();

    scene.registerMilchbuckRenderObject = function registerMilchbuckRenderObject(
      layerName,
      object,
      options = {}
    ) {
      return register(this, layerName, object, options);
    };

    scene.addMilchbuckLayerImage = function addMilchbuckLayerImage(
      textureKey,
      layerName,
      options = {}
    ) {
      return addLayerImage(this, textureKey, layerName, options);
    };

    scene.addMilchbuckPropImage = function addMilchbuckPropImage(
      textureKey,
      x,
      y,
      options = {}
    ) {
      return addPropImage(this, textureKey, x, y, options);
    };

    scene.setMilchbuckLayerVisible = function setMilchbuckLayerVisible(
      layerName,
      visible
    ) {
      return setLayerVisible(this, layerName, visible);
    };

    scene.rebuildMilchbuckRenderLayers = function rebuildMilchbuckRenderLayers() {
      return rebuildRegistry(this);
    };

    // Scene instances are reused after tram travel. Wrap only Milchbuck's own
    // create method so the registry is rebuilt every time it is recreated.
    if (!scene.__milchbuckCreateWrappedV19 && typeof scene.create === "function") {
      scene.__milchbuckCreateWrappedV19 = true;
      const originalCreate = scene.create;

      scene.create = function createWithMilchbuckLayerRegistry(...args) {
        const result = originalCreate.apply(this, args);
        rebuildRegistry(this);
        return result;
      };
    }

    // The first scene may already have been created before startSimonGame returned.
    if (scene.sys?.isActive?.()) {
      rebuildRegistry(scene);
    }
  }

  function installOnGame(game, attempt = 0) {
    if (!game?.scene || attempt > 120) return;

    const milchbuck = game.scene.getScene?.("MilchbuckScene");

    if (!milchbuck) {
      window.setTimeout(() => installOnGame(game, attempt + 1), 25);
      return;
    }

    installSceneAPI(milchbuck);
  }

  function getMilchbuckScene() {
    return window.__SIMON_ACTIVE_GAME__?.scene?.getScene?.("MilchbuckScene") || null;
  }

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("[Milchbuck Layers] startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithMilchbuckLayers(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (game) {
      window.__SIMON_ACTIVE_GAME__ = game;
      installOnGame(game);
    }

    return game;
  };

  window.MilchbuckLayers = Object.freeze({
    WORLD,
    DEPTHS,
    getScene: getMilchbuckScene,
    rebuild() {
      const scene = getMilchbuckScene();
      return scene ? rebuildRegistry(scene) : null;
    },
    audit() {
      const scene = getMilchbuckScene();
      return scene ? audit(scene) : null;
    },
    validate(textureKey) {
      const scene = getMilchbuckScene();
      return scene ? validateFullCanvasTexture(scene, textureKey) : false;
    }
  });
})();
