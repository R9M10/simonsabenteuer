(() => {
  "use strict";

  if (window.__SIMON_SCENE_ART_V61__) return;
  window.__SIMON_SCENE_ART_V61__ = true;

  const VERSION = 61;

  const VIEWPORT = Object.freeze({
    width: 820,
    height: 390,
    groundTop: 338
  });

  // Six artist-facing scene planes, plus technical interaction/UI slots.
  const DEPTHS = Object.freeze({
    sky: -34,
    far: -24,
    mid: -12,
    world: 0,
    propsBack: 5,
    player: 10,
    npc: 12,
    propsFront: 15,
    foreground: 20,
    interaction: 150,
    ui: 300
  });

  const ARTIST_LAYERS = Object.freeze([
    "sky",
    "far",
    "mid",
    "world",
    "actors",
    "foreground"
  ]);

  const REGISTRY_KEYS = Object.freeze([
    "sky",
    "far",
    "mid",
    "world",
    "propsBack",
    "gameplay",
    "propsFront",
    "foreground",
    "interaction",
    "ui"
  ]);

  const ASSETS = Object.freeze({
    inderShop: Object.freeze({
      key: "art-inder-shop-v61",
      type: "image",
      url: "inder-shop-v37.png?v=37",
      expectedWidth: 820,
      expectedHeight: 390
    }),
    inderSeller: Object.freeze({
      key: "art-inder-seller-v61",
      type: "spritesheet",
      url: "inder-sprites-v37.png?v=37",
      frameWidth: 220,
      frameHeight: 170
    })
  });

  const INDER_ANIM_KEY = "art-inder-seller-v61-idle";

  function makeRegistry() {
    return Object.fromEntries(REGISTRY_KEYS.map((key) => [key, []]));
  }

  function isAlive(object) {
    return Boolean(object && object.active !== false && object.scene);
  }

  function classifyDepth(object) {
    if (!object) return null;

    const depth = Number(object.depth) || 0;
    const sx = Number(object.scrollFactorX);
    const sy = Number(object.scrollFactorY);

    if (sx === 0 && sy === 0 && depth >= 100) return "ui";
    if (depth >= DEPTHS.interaction) return "interaction";
    if (depth <= -30) return "sky";
    if (depth <= -18) return "far";
    if (depth < 0) return "mid";
    if (depth === 0) return "world";
    if (depth < DEPTHS.player) return "propsBack";
    if (depth <= DEPTHS.npc) return "gameplay";
    if (depth < DEPTHS.foreground) return "propsFront";
    if (depth < DEPTHS.interaction) return "foreground";
    return "ui";
  }

  function register(scene, layer, object, options = {}) {
    if (!scene || !object || !REGISTRY_KEYS.includes(layer)) return object;

    if (!scene.sceneArtLayersV61) {
      scene.sceneArtLayersV61 = makeRegistry();
    }

    REGISTRY_KEYS.forEach((key) => {
      scene.sceneArtLayersV61[key] =
        scene.sceneArtLayersV61[key].filter((entry) => entry !== object);
    });

    scene.sceneArtLayersV61[layer].push(object);
    object.setData?.("sceneArtLayerV61", layer);

    if (options.applyDepth === true) {
      const target = Number.isFinite(options.depth)
        ? options.depth
        : DEPTHS[layer];

      if (Number.isFinite(target)) {
        object.setDepth?.(target);
      }
    }

    return object;
  }

  function rebuildRegistry(scene) {
    if (!scene?.children?.list) return null;

    const registry = makeRegistry();
    scene.sceneArtLayersV61 = registry;

    scene.children.list.forEach((object) => {
      const layer = classifyDepth(object);
      if (!layer) return;
      registry[layer].push(object);
      object.setData?.("sceneArtLayerV61", layer);
    });

    // Semantic overrides for the base outdoor scenes.
    if (scene.player) register(scene, "gameplay", scene.player);
    if (scene.bouncer) register(scene, "gameplay", scene.bouncer);
    if (scene.ground) register(scene, "interaction", scene.ground);
    if (scene.ticketHitbox) register(scene, "interaction", scene.ticketHitbox);
    if (scene.tramHitbox) register(scene, "interaction", scene.tramHitbox);
    if (scene.tramBoardingMarker) {
      register(scene, "interaction", scene.tramBoardingMarker);
    }

    scene.__sceneArtRegistryReadyV61 = true;
    return scene.sceneArtLayersV61;
  }

  function queueAsset(scene, asset) {
    if (!scene?.load || !asset) return false;
    if (scene.textures?.exists?.(asset.key)) return false;

    if (asset.type === "spritesheet") {
      scene.load.spritesheet(asset.key, asset.url, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight
      });
      return true;
    }

    scene.load.image(asset.key, asset.url);
    return true;
  }

  function queueCoreAssets(scene) {
    queueAsset(scene, ASSETS.inderShop);
    queueAsset(scene, ASSETS.inderSeller);
  }

  function validateTexture(scene, asset) {
    if (!scene?.textures?.exists?.(asset.key)) return false;

    const source = scene.textures.get(asset.key)?.getSourceImage?.();
    if (!source) return false;

    if (
      Number.isFinite(asset.expectedWidth) &&
      Number.isFinite(asset.expectedHeight) &&
      (
        source.width !== asset.expectedWidth ||
        source.height !== asset.expectedHeight
      )
    ) {
      console.warn(
        `[Scene Art v${VERSION}] ${asset.key} hat ${source.width}x${source.height}px; ` +
        `erwartet sind ${asset.expectedWidth}x${asset.expectedHeight}px.`
      );
      return false;
    }

    return true;
  }

  function ensureAssets(scene, assetNames, onReady) {
    const assets = assetNames
      .map((name) => ASSETS[name])
      .filter(Boolean);

    const missing = assets.filter(
      (asset) => !scene?.textures?.exists?.(asset.key)
    );

    if (!missing.length) {
      onReady?.();
      return;
    }

    if (scene?.load?.isLoading?.()) {
      scene.time?.delayedCall?.(
        30,
        () => ensureAssets(scene, assetNames, onReady)
      );
      return;
    }

    missing.forEach((asset) => queueAsset(scene, asset));

    const complete = () => {
      onReady?.();
    };

    scene.load.once(Phaser.Loader.Events.COMPLETE, complete);
    scene.load.start();
  }

  function installSceneAPI(proto) {
    if (!proto || proto.__sceneArtApiInstalledV61) return;
    proto.__sceneArtApiInstalledV61 = true;

    proto.sceneArtViewportV61 = VIEWPORT;
    proto.sceneArtDepthsV61 = DEPTHS;

    proto.registerSceneArtObjectV61 = function registerSceneArtObjectV61(
      layer,
      object,
      options = {}
    ) {
      return register(this, layer, object, options);
    };

    proto.rebuildSceneArtLayersV61 = function rebuildSceneArtLayersV61() {
      return rebuildRegistry(this);
    };

    proto.addSceneArtImageV61 = function addSceneArtImageV61(
      textureKey,
      x,
      y,
      layer = "world",
      options = {}
    ) {
      if (!this.textures?.exists?.(textureKey)) {
        console.error(
          `[Scene Art v${VERSION}] Texture "${textureKey}" ist nicht geladen.`
        );
        return null;
      }

      const image = this.add.image(x, y, textureKey)
        .setOrigin(
          Number.isFinite(options.originX) ? options.originX : 0.5,
          Number.isFinite(options.originY) ? options.originY : 1
        )
        .setScrollFactor(
          Number.isFinite(options.scrollFactor)
            ? options.scrollFactor
            : 1
        )
        .setDepth(
          Number.isFinite(options.depth)
            ? options.depth
            : (DEPTHS[layer] ?? DEPTHS.world)
        );

      return register(this, layer, image);
    };
  }

  function wrapPreload(proto) {
    if (!proto || typeof proto.preload !== "function") return;
    if (proto.preload.__sceneArtV61) return;

    const original = proto.preload;

    const wrapped = function preloadWithSceneArtV61(...args) {
      const result = original.apply(this, args);
      queueCoreAssets(this);
      return result;
    };

    wrapped.__sceneArtV61 = true;
    proto.preload = wrapped;
  }

  function wrapCreate(proto) {
    if (!proto || typeof proto.create !== "function") return;
    if (proto.create.__sceneArtV61) return;

    const original = proto.create;

    const wrapped = function createWithSceneArtV61(...args) {
      const result = original.apply(this, args);
      rebuildRegistry(this);
      return result;
    };

    wrapped.__sceneArtV61 = true;
    proto.create = wrapped;
  }

  function indianGuardRoot() {
    return document.getElementById("phaser-game");
  }

  function clearHistoricalIndianDOM() {
    indianGuardRoot()
      ?.querySelectorAll?.('[data-simon-ui="inder-v37-room"]')
      ?.forEach?.((node) => node.remove());
  }

  function installHistoricalIndianGuard() {
    const root = indianGuardRoot();
    if (!root) return null;

    clearHistoricalIndianDOM();

    const guard = document.createElement("div");
    guard.dataset.simonUi = "inder-v37-room";
    guard.dataset.sceneArtGuard = "v61";
    guard.setAttribute("aria-hidden", "true");
    guard.style.display = "none";
    root.appendChild(guard);

    return guard;
  }

  function destroyIndianStoreOverlay(scene) {
    if (!scene?.indianStoreOverlay) return;

    try {
      scene.indianStoreOverlay.list?.forEach?.((child) => {
        scene.tweens?.killTweensOf?.(child);
      });
      scene.indianStoreOverlay.destroy(true);
    } catch (error) {
      console.warn("[Scene Art v61] Inder-Overlay cleanup:", error);
    }

    scene.indianStoreOverlay = null;
  }

  function makeIndianLoadingCover(scene) {
    const cover = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(650);

    const bg = scene.add.rectangle(
      VIEWPORT.width / 2,
      VIEWPORT.height / 2,
      VIEWPORT.width,
      VIEWPORT.height,
      0x17131d,
      1
    );

    const title = scene.add.text(
      VIEWPORT.width / 2,
      VIEWPORT.height / 2,
      "DER INDER",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#f5dfae"
      }
    ).setOrigin(0.5);

    cover.add([bg, title]);
    return cover;
  }

  function ensureIndianAnimation(scene) {
    if (scene.anims?.exists?.(INDER_ANIM_KEY)) return;

    const pairs = [
      [0, 0], [0, 1], [0, 2], [0, 1], [0, 3], [0, 1],
      [1, 0], [1, 1], [1, 2], [1, 3], [1, 2], [1, 1],
      [0, 1], [0, 0], [0, 2], [0, 1],
      [2, 0], [2, 1], [2, 2], [2, 3], [2, 2], [2, 1],
      [0, 2], [0, 1]
    ];

    scene.anims.create({
      key: INDER_ANIM_KEY,
      frames: pairs.map(([row, col]) => ({
        key: ASSETS.inderSeller.key,
        frame: row * 4 + col
      })),
      frameRate: 1.54,
      repeat: -1
    });
  }

  function makeSpeechBubble(scene) {
    const bubble = scene.add.container(410, 65);

    const g = scene.add.graphics();
    g.fillStyle(0xffefc2, 1);
    g.lineStyle(4, 0x5d3f27, 1);
    g.fillRoundedRect(-145, -28, 290, 56, 12);
    g.strokeRoundedRect(-145, -28, 290, 56, 12);
    g.fillStyle(0xffefc2, 1);
    g.fillTriangle(-10, 27, 10, 27, 0, 43);

    const text = scene.add.text(
      0,
      0,
      "Guter Kunde, Guter Kunde",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#2a2017",
        align: "center"
      }
    ).setOrigin(0.5);

    bubble.add([g, text]);
    return bubble;
  }

  function buildIndianRoomV61(scene) {
    if (!scene?.sys?.isActive?.()) return;

    installHistoricalIndianGuard();
    destroyIndianStoreOverlay(scene);

    validateTexture(scene, ASSETS.inderShop);

    const overlay = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(650);

    const background = scene.add.image(
      0,
      0,
      ASSETS.inderShop.key
    )
      .setOrigin(0, 0)
      .setScrollFactor(0);

    const source = scene.textures
      .get(ASSETS.inderShop.key)
      ?.getSourceImage?.();

    // Compatibility only for the already-existing v37 room art. Future scene
    // exports must match their contract and are not silently stretched.
    if (
      source &&
      (
        source.width !== VIEWPORT.width ||
        source.height !== VIEWPORT.height
      )
    ) {
      background.setDisplaySize(VIEWPORT.width, VIEWPORT.height);
    }

    ensureIndianAnimation(scene);

    const seller = scene.add.sprite(
      410,
      180,
      ASSETS.inderSeller.key,
      0
    )
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    seller.play(INDER_ANIM_KEY, true);

    const bubble = makeSpeechBubble(scene);

    overlay.add([background, seller, bubble]);
    scene.indianStoreOverlay = overlay;
    scene.__sceneArtIndianSellerV61 = seller;

    const openShop = (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      scene.openIndianShopWindow?.();
    };

    seller.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
    });
    seller.on("pointerup", openShop);

    scene.createIndianStoreDOMControls?.();
    scene.refreshUILock?.();
    rebuildRegistry(scene);
  }

  function enterIndianStoreV61() {
    if (this.indianStoreOverlay || this.__sceneArtIndianStoreWantedV61) return;

    if (this.storeEntryModal) {
      this.destroyDOMModal?.(this.storeEntryModal);
      this.storeEntryModal = null;
    }

    this.__sceneArtIndianStoreWantedV61 = true;
    const token = (Number(this.__sceneArtIndianStoreTokenV61) || 0) + 1;
    this.__sceneArtIndianStoreTokenV61 = token;

    installHistoricalIndianGuard();

    this.setUILocked?.(true);
    this.player?.setVisible?.(false);
    this.player?.setVelocity?.(0, 0);

    const cover = makeIndianLoadingCover(this);
    this.indianStoreOverlay = cover;
    this.createIndianStoreDOMControls?.();
    this.refreshUILock?.();

    ensureAssets(this, ["inderShop", "inderSeller"], () => {
      if (
        !this.sys?.isActive?.() ||
        !this.__sceneArtIndianStoreWantedV61 ||
        this.__sceneArtIndianStoreTokenV61 !== token
      ) {
        return;
      }

      buildIndianRoomV61(this);
    });
  }

  // Prevent simon-ui-v37 from wrapping this method again.
  enterIndianStoreV61.__sv37Room = true;
  enterIndianStoreV61.__sceneArtV61 = true;

  function exitIndianStoreV61() {
    this.__sceneArtIndianStoreWantedV61 = false;
    this.__sceneArtIndianStoreTokenV61 =
      (Number(this.__sceneArtIndianStoreTokenV61) || 0) + 1;

    clearHistoricalIndianDOM();

    if (this.itemInfoModal) {
      this.destroyDOMModal?.(this.itemInfoModal);
      this.itemInfoModal = null;
    }

    if (this.shopModal) {
      this.destroyDOMModal?.(this.shopModal);
      this.shopModal = null;
    }

    if (this.storeEntryModal) {
      this.destroyDOMModal?.(this.storeEntryModal);
      this.storeEntryModal = null;
    }

    if (this.indianStoreBackUI) {
      this.destroyDOMModal?.(this.indianStoreBackUI);
      this.indianStoreBackUI = null;
    }

    destroyIndianStoreOverlay(this);
    this.__sceneArtIndianSellerV61 = null;

    this.player?.setVisible?.(true);
    this.player?.setVelocity?.(0, 0);
    if (this.player?.body) this.player.body.enable = true;
    this.player?.play?.("simon-idle", true);

    this.cameras?.main?.startFollow?.(this.player, true, 0.12, 0.12);
    this.setControlsVisible?.(true);
    this.refreshUILock?.();
    rebuildRegistry(this);
  }

  exitIndianStoreV61.__sv37Room = true;
  exitIndianStoreV61.__sceneArtV61 = true;

  function patchIndianStoreClass(BahnhofScene) {
    if (!BahnhofScene?.prototype) return;

    BahnhofScene.prototype.enterIndianStore = enterIndianStoreV61;
    BahnhofScene.prototype.exitIndianStore = exitIndianStoreV61;
  }

  function install() {
    const classes = window.__SIMON_SCENE_CLASSES__ || {};
    const BaseScene = classes.MilchbuckScene || null;
    const BahnhofScene = classes.BahnhofquaiScene || null;

    if (!BaseScene || !BahnhofScene) {
      console.warn(
        `[Scene Art v${VERSION}] Basisszenen noch nicht verfügbar.`
      );
      return false;
    }

    installSceneAPI(BaseScene.prototype);
    installSceneAPI(BahnhofScene.prototype);

    wrapPreload(BaseScene.prototype);
    wrapCreate(BaseScene.prototype);
    wrapCreate(BahnhofScene.prototype);
    patchIndianStoreClass(BahnhofScene);

    return true;
  }

  const installed = install();

  if (!installed) {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (install() || attempts > 120) {
        window.clearInterval(timer);
      }
    }, 25);
  }

  window.SimonSceneArtV61 = Object.freeze({
    VERSION,
    VIEWPORT,
    DEPTHS,
    ARTIST_LAYERS,
    ASSETS,
    rebuild(sceneKey = "MilchbuckScene") {
      const game =
        window.__SIMON_ACTIVE_GAME_V28__ ||
        window.__SIMON_ACTIVE_GAME_V20__ ||
        window.__SIMON_ACTIVE_GAME__ ||
        null;

      let scene = null;
      try {
        scene = game?.scene?.getScene?.(sceneKey) || null;
      } catch {}

      return scene ? rebuildRegistry(scene) : null;
    },
    validateIndianAssets(sceneKey = "BahnhofquaiScene") {
      const game =
        window.__SIMON_ACTIVE_GAME_V28__ ||
        window.__SIMON_ACTIVE_GAME_V20__ ||
        window.__SIMON_ACTIVE_GAME__ ||
        null;

      let scene = null;
      try {
        scene = game?.scene?.getScene?.(sceneKey) || null;
      } catch {}

      if (!scene) return false;

      return (
        validateTexture(scene, ASSETS.inderShop) &&
        scene.textures?.exists?.(ASSETS.inderSeller.key)
      );
    }
  });
})();
