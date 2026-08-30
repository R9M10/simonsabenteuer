(() => {
  "use strict";

  if (window.__SIMON_SCENE_ART_V62__) return;
  window.__SIMON_SCENE_ART_V62__ = true;

  const VERSION = 62;
  const WORLD_WIDTH = 3000;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const GROUND_ART_TOP = 298;

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
    interaction: 150
  });

  const HIVE = Object.freeze({
    facadeLeft: 1015,
    facadeCenter: 1165,
    doorX: 1155,
    bouncerX: 1235
  });

  const ASSET_ROOT = "assets/v62/";

  const ASSETS = Object.freeze({
    sky: Object.freeze({
      key: "art-zurich-sky-v62",
      url: `${ASSET_ROOT}art-zurich-sky-v62.png?v=62`,
      width: 1280,
      height: 338
    }),
    far: Object.freeze({
      key: "art-zurich-far-v62",
      url: `${ASSET_ROOT}art-zurich-far-v62.png?v=62`,
      width: 1536,
      height: 338
    }),
    mid: Object.freeze({
      key: "art-milchbuck-mid-v62",
      url: `${ASSET_ROOT}art-milchbuck-mid-v62.png?v=62`,
      width: 2048,
      height: 338
    }),
    tramGround: Object.freeze({
      key: "art-zurich-tram-ground-v62",
      url: `${ASSET_ROOT}art-zurich-tram-ground-v62.png?v=62`,
      width: 512,
      height: 92
    }),
    transitionGround: Object.freeze({
      key: "art-zurich-ground-transition-v62",
      url: `${ASSET_ROOT}art-zurich-ground-transition-v62.png?v=62`,
      width: 512,
      height: 92
    }),
    cityGround: Object.freeze({
      key: "art-zurich-city-ground-v62",
      url: `${ASSET_ROOT}art-zurich-city-ground-v62.png?v=62`,
      width: 512,
      height: 92
    }),
    stop: Object.freeze({
      key: "art-milchbuck-stop-v62",
      url: `${ASSET_ROOT}art-milchbuck-stop-v62.png?v=62`,
      width: 900,
      height: 300
    }),
    tram: Object.freeze({
      key: "art-vbz-tram-v62",
      url: `${ASSET_ROOT}art-vbz-tram-v62.png?v=62`,
      width: 240,
      height: 130
    }),
    ticketMachine: Object.freeze({
      key: "art-ticket-machine-v62",
      url: `${ASSET_ROOT}art-ticket-machine-v62.png?v=62`,
      width: 64,
      height: 110
    }),
    hive: Object.freeze({
      key: "art-hive-exterior-v62",
      url: `${ASSET_ROOT}art-hive-exterior-v62.png?v=62`,
      width: 300,
      height: 240
    }),
    mast: Object.freeze({
      key: "art-zurich-overhead-mast-v62",
      url: `${ASSET_ROOT}art-zurich-overhead-mast-v62.png?v=62`,
      width: 45,
      height: 220
    }),
    railing: Object.freeze({
      key: "art-zurich-railing-v62",
      url: `${ASSET_ROOT}art-zurich-railing-v62.png?v=62`,
      width: 256,
      height: 68
    }),
    bin: Object.freeze({
      key: "art-zurich-bin-v62",
      url: `${ASSET_ROOT}art-zurich-bin-v62.png?v=62`,
      width: 36,
      height: 58
    })
  });

  function queueAssets(scene) {
    if (!scene?.load) return;

    Object.values(ASSETS).forEach((asset) => {
      if (!scene.textures?.exists?.(asset.key)) {
        scene.load.image(asset.key, asset.url);
      }
    });
  }

  function validateAssets(scene) {
    const errors = [];

    Object.values(ASSETS).forEach((asset) => {
      if (!scene.textures?.exists?.(asset.key)) {
        errors.push(`${asset.key}: fehlt`);
        return;
      }

      const source = scene.textures.get(asset.key)?.getSourceImage?.();
      if (!source) {
        errors.push(`${asset.key}: keine Bildquelle`);
        return;
      }

      if (source.width !== asset.width || source.height !== asset.height) {
        errors.push(
          `${asset.key}: ${source.width}x${source.height}, erwartet ${asset.width}x${asset.height}`
        );
      }
    });

    if (errors.length) {
      console.error(`[Scene Art v${VERSION}] Asset-Vertrag verletzt:\n${errors.join("\n")}`);
      return false;
    }

    return true;
  }

  function useNearest(scene) {
    Object.values(ASSETS).forEach((asset) => {
      const texture = scene.textures?.get?.(asset.key);
      texture?.setFilter?.(Phaser.Textures.FilterMode.NEAREST);
    });
  }

  function register(scene, layer, object) {
    scene.registerSceneArtObjectV61?.(layer, object);
    return object;
  }

  function addImage(scene, assetName, x, y, layer, options = {}) {
    const asset = ASSETS[assetName];
    if (!asset || !scene.textures?.exists?.(asset.key)) return null;

    const image = scene.add.image(x, y, asset.key)
      .setOrigin(
        Number.isFinite(options.originX) ? options.originX : 0.5,
        Number.isFinite(options.originY) ? options.originY : 1
      )
      .setScrollFactor(
        Number.isFinite(options.scrollFactor) ? options.scrollFactor : 1
      )
      .setDepth(
        Number.isFinite(options.depth)
          ? options.depth
          : (DEPTHS[layer] ?? DEPTHS.world)
      );

    return register(scene, layer, image);
  }

  function buildParallax(scene) {
    addImage(scene, "sky", 0, 0, "sky", {
      originX: 0,
      originY: 0,
      scrollFactor: 0.12
    });

    addImage(scene, "far", 0, GROUND_TOP, "far", {
      originX: 0,
      originY: 1,
      scrollFactor: 0.25
    });

    addImage(scene, "mid", 0, GROUND_TOP, "mid", {
      originX: 0,
      originY: 1,
      scrollFactor: 0.50
    });
  }

  function addGroundSegment(scene, x, width, assetName) {
    const asset = ASSETS[assetName];
    const tile = scene.add.tileSprite(
      x,
      GROUND_ART_TOP,
      width,
      asset.height,
      asset.key
    )
      .setOrigin(0, 0)
      .setDepth(DEPTHS.world);

    return register(scene, "world", tile);
  }

  function buildGround(scene) {
    // Milchbuck/Haltestelle -> kurzer Übergang -> dichterer Stadtraum.
    addGroundSegment(scene, 0, 1024, "tramGround");
    addGroundSegment(scene, 1024, 512, "transitionGround");
    addGroundSegment(scene, 1536, WORLD_WIDTH - 1536, "cityGround");
  }

  function buildOverhead(scene) {
    const mastXs = [85, 500, 900];

    mastXs.forEach((x) => {
      addImage(scene, "mast", x, 318, "propsBack");
    });

    // Only the thin contact wires remain procedural. The structural poles are
    // final v62 assets and no old placeholder mast geometry is created.
    const wires = scene.add.graphics()
      .setDepth(DEPTHS.propsBack);

    wires.lineStyle(2, 0x394756, 0.95);
    wires.lineBetween(85, 105, 500, 115);
    wires.lineBetween(500, 115, 900, 98);
    wires.lineBetween(85, 130, 500, 96);
    wires.lineBetween(500, 96, 900, 125);

    register(scene, "propsBack", wires);
  }

  function buildMilchbuckStop(scene) {
    addImage(scene, "stop", 455, GROUND_TOP, "propsBack");

    scene.tram = addImage(scene, "tram", 132, 320, "propsBack");

    scene.tramHitbox = scene.add.zone(132, 260, 240, 132)
      .setDepth(170)
      .setInteractive({ useHandCursor: true });

    scene.tramHitbox.input.enabled = false;
    scene.tramHitbox.on("pointerdown", (pointer) => {
      if (!scene.canUseWorldInteraction(pointer)) return;
      pointer.event?.preventDefault?.();
      pointer.event?.stopPropagation?.();
      scene.boardTram();
    });

    register(scene, "interaction", scene.tramHitbox);

    scene.tramBoardingMarker = scene.add.circle(132, 205, 6, 0xffffff, 1)
      .setStrokeStyle(2, 0xe8f6ff, 0.95)
      .setDepth(175)
      .setVisible(false);

    scene.tweens.add({
      targets: scene.tramBoardingMarker,
      alpha: { from: 0.2, to: 1 },
      scale: { from: 0.82, to: 1.18 },
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    register(scene, "interaction", scene.tramBoardingMarker);

    addImage(scene, "ticketMachine", 760, 326, "propsBack");

    scene.ticketHitbox = scene.add.zone(760, 271, 72, 116)
      .setDepth(150)
      .setInteractive({ useHandCursor: true });

    scene.ticketHitbox.on("pointerdown", (pointer) => {
      if (!scene.canUseWorldInteraction(pointer)) return;
      pointer.event?.preventDefault?.();
      pointer.event?.stopPropagation?.();
      scene.openTicketModal();
    });

    register(scene, "interaction", scene.ticketHitbox);

    scene.ticketInteractionMarker = scene.createPulsingInteractionMarker(
      760,
      221,
      176
    );

    register(scene, "interaction", scene.ticketInteractionMarker);
  }

  function buildHive(scene) {
    addImage(scene, "hive", HIVE.facadeCenter, GROUND_TOP, "world");

    // Current repository logic relocated HIVE by -545 px in v57. Keep the
    // existing story/camera/hitbox contract rather than reviving the old x=1575.
    scene.__hiveShiftV57 = -545;

    scene.createBouncer(HIVE.bouncerX, GROUND_TOP - 8);
  }

  function buildStreetProps(scene) {
    // Keep the first v62 pass deliberately sparse. Signature art stays readable.
    addImage(scene, "railing", 1490, GROUND_TOP, "propsFront");
    addImage(scene, "bin", 1650, GROUND_TOP, "propsFront");

    addImage(scene, "mast", 1950, 318, "propsBack");
    addImage(scene, "railing", 2210, GROUND_TOP, "propsFront");
    addImage(scene, "bin", 2390, GROUND_TOP, "propsFront");
    addImage(scene, "mast", 2660, 318, "propsBack");
  }

  function showAssetFailure(scene) {
    scene.add.rectangle(410, 195, 820, 390, 0x161921, 1)
      .setScrollFactor(0)
      .setDepth(500);

    scene.add.text(410, 195, "MILCHBUCK V62\nASSET-FEHLER\n\nKonsole prüfen", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#ffd7a3",
      align: "center",
      lineSpacing: 8
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(501);
  }

  function createWorldV62() {
    if (!validateAssets(this)) {
      showAssetFailure(this);
      return;
    }

    useNearest(this);
    buildParallax(this);
    buildGround(this);
    buildMilchbuckStop(this);
    buildOverhead(this);
    buildHive(this);
    buildStreetProps(this);

    this.__milchbuckArtV62Ready = true;
  }

  createWorldV62.__sceneArtV62 = true;

  function install() {
    const BaseScene = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = BaseScene?.prototype;

    if (!proto) {
      console.warn(`[Scene Art v${VERSION}] MilchbuckScene noch nicht verfügbar.`);
      return false;
    }

    if (!proto.preload?.__sceneArtV62) {
      const originalPreload = proto.preload;
      const wrappedPreload = function preloadWithMilchbuckArtV62(...args) {
        const result = originalPreload.apply(this, args);
        queueAssets(this);
        return result;
      };
      wrappedPreload.__sceneArtV62 = true;
      proto.preload = wrappedPreload;
    }

    if (!proto.__originalCreateWorldBeforeV62) {
      proto.__originalCreateWorldBeforeV62 = proto.createWorld;
    }

    proto.createWorld = createWorldV62;
    proto.__milchbuckArtV62Installed = true;

    console.info(
      `[Scene Art v${VERSION}] Milchbuck migriert: Sky/Far/Mid/Ground/Stop/Tram/Ticket/HIVE/Props.`
    );

    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 120) {
        window.clearInterval(timer);
      }
    }, 50);
  }

  window.SimonSceneArtV62 = Object.freeze({
    VERSION,
    ASSETS,
    DEPTHS,
    HIVE,
    install
  });
})();
