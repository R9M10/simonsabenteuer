(() => {
  "use strict";

  if (window.__SIMON_SCENE_LAYERS_V18__) return;
  window.__SIMON_SCENE_LAYERS_V18__ = true;

  const WORLD = Object.freeze({
    width: 3000,
    height: 390,
    groundTop: 338
  });

  // Canonical render slots for all future scene artwork.
  // Existing objects are NOT automatically moved or re-layered by this file.
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

  const VALID_LAYERS = new Set([
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

  function depthFor(layerName) {
    if (layerName === "gameplay") return DEPTHS.player;
    return DEPTHS[layerName];
  }

  function makeRegistry() {
    return {
      background: [],
      midground: [],
      ground: [],
      propsBack: [],
      gameplay: [],
      propsFront: [],
      foreground: [],
      interaction: [],
      ui: []
    };
  }

  function ensureRegistry(scene) {
    if (!scene.renderLayerObjects) {
      scene.renderLayerObjects = makeRegistry();
    }
    return scene.renderLayerObjects;
  }

  function register(scene, layerName, object, options = {}) {
    if (!scene || !object || !VALID_LAYERS.has(layerName)) return object;

    const registry = ensureRegistry(scene);
    if (!registry[layerName].includes(object)) {
      registry[layerName].push(object);
    }

    object.setData?.("renderLayer", layerName);

    // Safe default: registration alone never changes an existing object's depth.
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
      console.error(`[Scene Layers] Texture "${textureKey}" ist nicht geladen.`);
      return false;
    }

    if (size.width !== WORLD.width || size.height !== WORLD.height) {
      console.error(
        `[Scene Layers] "${textureKey}" hat ${size.width}×${size.height}px. ` +
        `Ein Vollbild-Layer muss exakt ${WORLD.width}×${WORLD.height}px groß sein. ` +
        "Das Bild wird absichtlich NICHT gestreckt."
      );
      return false;
    }

    return true;
  }

  function addLayerImage(scene, textureKey, layerName, options = {}) {
    if (!scene || !VALID_LAYERS.has(layerName)) {
      console.error(`[Scene Layers] Ungültiger Layer: ${layerName}`);
      return null;
    }

    const fullCanvas = options.fullCanvas ?? FULL_CANVAS_LAYERS.has(layerName);

    if (!scene.textures.exists(textureKey)) {
      console.error(`[Scene Layers] Texture "${textureKey}" ist nicht geladen.`);
      return null;
    }

    if (fullCanvas && !validateFullCanvasTexture(scene, textureKey)) {
      return null;
    }

    const x = Number.isFinite(options.x) ? options.x : 0;
    const y = Number.isFinite(options.y) ? options.y : 0;
    const originX = Number.isFinite(options.originX) ? options.originX : 0;
    const originY = Number.isFinite(options.originY) ? options.originY : 0;
    const scrollFactor = Number.isFinite(options.scrollFactor)
      ? options.scrollFactor
      : 1;
    const depth = Number.isFinite(options.depth)
      ? options.depth
      : depthFor(layerName);

    const image = scene.add.image(x, y, textureKey)
      .setOrigin(originX, originY)
      .setScrollFactor(scrollFactor)
      .setDepth(depth);

    // Intentionally no setScale() / setDisplaySize() here.
    // Wrong export sizes must fail visibly instead of deforming the level.
    register(scene, layerName, image);

    return image;
  }

  function addPropImage(scene, textureKey, x, y, options = {}) {
    const layerName = options.front ? "propsFront" : "propsBack";

    return addLayerImage(scene, textureKey, layerName, {
      ...options,
      x,
      y,
      fullCanvas: false,
      originX: Number.isFinite(options.originX) ? options.originX : 0.5,
      originY: Number.isFinite(options.originY) ? options.originY : 1
    });
  }

  function installSceneAPI(scene) {
    if (!scene || scene.__sceneLayerApiV18Installed) return;
    scene.__sceneLayerApiV18Installed = true;

    scene.renderDepths = DEPTHS;
    scene.renderWorld = WORLD;
    ensureRegistry(scene);

    scene.registerRenderObject = function registerRenderObject(
      layerName,
      object,
      options = {}
    ) {
      return register(this, layerName, object, options);
    };

    scene.addSceneLayerImage = function addSceneLayerImage(
      textureKey,
      layerName,
      options = {}
    ) {
      return addLayerImage(this, textureKey, layerName, options);
    };

    scene.addScenePropImage = function addScenePropImage(
      textureKey,
      x,
      y,
      options = {}
    ) {
      return addPropImage(this, textureKey, x, y, options);
    };
  }

  function auditCurrentDepths(scene) {
    if (!scene?.children?.list) return null;

    const summary = {
      background: 0,
      midground: 0,
      ground: 0,
      propsBack: 0,
      gameplay: 0,
      propsFront: 0,
      foregroundOrEffects: 0,
      interactionOrUI: 0
    };

    scene.children.list.forEach((object) => {
      const depth = Number(object?.depth) || 0;

      if (depth >= 100) summary.interactionOrUI += 1;
      else if (depth <= -20) summary.background += 1;
      else if (depth < 0) summary.midground += 1;
      else if (depth === 0) summary.ground += 1;
      else if (depth < 10) summary.propsBack += 1;
      else if (depth === DEPTHS.player || depth === DEPTHS.npc) summary.gameplay += 1;
      else if (depth < DEPTHS.foreground) summary.propsFront += 1;
      else summary.foregroundOrEffects += 1;
    });

    console.table(summary);
    return summary;
  }

  function installOnGame(game, attempt = 0) {
    if (!game?.scene || attempt > 120) return;

    const milchbuck = game.scene.getScene?.("MilchbuckScene");
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");

    if (!milchbuck && !bahnhof) {
      window.setTimeout(() => installOnGame(game, attempt + 1), 25);
      return;
    }

    installSceneAPI(milchbuck);
    installSceneAPI(bahnhof);
  }

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("[Scene Layers] startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithSceneLayers(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (game) {
      window.__SIMON_ACTIVE_GAME__ = game;
      installOnGame(game);
    }

    return game;
  };

  window.SimonSceneLayers = Object.freeze({
    WORLD,
    DEPTHS,
    installSceneAPI,
    validateFullCanvasTexture,
    audit(sceneKey = "MilchbuckScene") {
      const scene = window.__SIMON_ACTIVE_GAME__?.scene?.getScene?.(sceneKey);
      if (!scene) {
        console.warn(`[Scene Layers] Scene "${sceneKey}" ist nicht verfügbar.`);
        return null;
      }
      return auditCurrentDepths(scene);
    }
  });
})();
