(() => {
  "use strict";

  if (window.__SIMON_SCENE_ART_V61__) return;
  window.__SIMON_SCENE_ART_V61__ = true;

  const VERSION = 75;
  const VIEWPORT = Object.freeze({ width: 820, height: 390, groundTop: 338 });
  const POLY_X = 920;

  const ASSETS = Object.freeze({
    inderShop: Object.freeze({
      key: "art-inder-shop-v61",
      type: "image",
      url: "inder-shop-v37.png?v=75",
      expectedWidth: 820,
      expectedHeight: 390
    }),
    inderSeller: Object.freeze({
      key: "art-inder-seller-v61",
      type: "spritesheet",
      url: "inder-sprites-v37.png?v=75",
      frameWidth: 220,
      frameHeight: 170
    }),
    milkman: Object.freeze({
      key: "milkman-v15",
      type: "spritesheet",
      url: "milkman-spritesheet-v15.png?v=75",
      frameWidth: 210,
      frameHeight: 200
    })
  });

  const INDER_IDLE = "art-inder-seller-v61-idle";

  function getGame() {
    return window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ || null;
  }

  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; }
    catch { return null; }
  }

  function safeDestroy(object) {
    try { object?.destroy?.(); } catch {}
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  // Warm browser cache before gameplay. This prevents old-Inder art from
  // appearing one frame after the procedural room.
  const warmImages = new Map();

  function warmImage(url) {
    if (warmImages.has(url)) return warmImages.get(url);

    const promise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      const done = () => resolve(true);
      image.onload = () => {
        try {
          const decoded = image.decode?.();
          if (decoded?.then) decoded.then(done).catch(done);
          else done();
        } catch { done(); }
      };
      image.onerror = () => resolve(false);
      image.src = url;
    });

    warmImages.set(url, promise);
    return promise;
  }

  Object.values(ASSETS).forEach((asset) => warmImage(asset.url));

  function queueAsset(scene, asset) {
    if (!scene?.load || !asset) return false;
    if (scene.textures?.exists?.(asset.key)) return false;
    if (scene.load?.list?.get?.(asset.key)) return false;

    if (asset.type === "spritesheet") {
      scene.load.spritesheet(asset.key, asset.url, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight
      });
    } else {
      scene.load.image(asset.key, asset.url);
    }
    return true;
  }

  function queueFoundationAssets(scene) {
    queueAsset(scene, ASSETS.inderShop);
    queueAsset(scene, ASSETS.inderSeller);
    queueAsset(scene, ASSETS.milkman);
  }

  // Hide the first construction frames of Milchbuck. v66/v67 and the locker
  // now finish synchronously behind a short neutral curtain, then reveal once.
  function makeWorldRevealCurtain(scene) {
    const root = document.getElementById("phaser-game");
    if (!root || root.querySelector('[data-simon-ui="world-reveal-v75"]')) return;

    const curtain = document.createElement("div");
    curtain.dataset.simonUi = "world-reveal-v75";
    Object.assign(curtain.style, {
      position: "absolute",
      inset: "0",
      zIndex: "99970",
      background: "linear-gradient(180deg,#88b7c8 0%,#a9c9d1 48%,#aaa397 49%,#aaa397 100%)",
      opacity: "1",
      transition: "opacity 150ms linear",
      pointerEvents: "none"
    });
    root.appendChild(curtain);

    window.setTimeout(() => {
      if (!curtain.isConnected) return;
      curtain.style.opacity = "0";
      window.setTimeout(() => curtain.remove(), 175);
    }, 110);

    scene.events?.once?.("shutdown", () => curtain.remove());
  }

  function wrapBasePreloadAndCreate() {
    const BaseScene = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = BaseScene?.prototype;
    if (!proto) return false;

    if (typeof proto.preload === "function" && !proto.preload.__sceneFoundationV75) {
      const original = proto.preload;
      const wrapped = function preloadSceneFoundationV75(...args) {
        const result = original.apply(this, args);
        queueFoundationAssets(this);
        return result;
      };
      wrapped.__sceneFoundationV75 = true;
      proto.preload = wrapped;
    }

    if (typeof proto.create === "function" && !proto.create.__sceneFoundationV75) {
      const original = proto.create;
      const wrapped = function createSceneFoundationV75(...args) {
        const result = original.apply(this, args);
        if (this.sys?.settings?.key === "MilchbuckScene") makeWorldRevealCurtain(this);
        return result;
      };
      wrapped.__sceneFoundationV75 = true;
      proto.create = wrapped;
    }

    return true;
  }

  // -----------------------------------------------------------------------
  // OLD INDER v37
  // -----------------------------------------------------------------------

  function ensureInderAnimation(scene) {
    if (!scene?.anims || !scene.textures?.exists?.(ASSETS.inderSeller.key) || scene.anims.exists(INDER_IDLE)) return;

    scene.anims.create({
      key: INDER_IDLE,
      frames: [0,1,2,1,3,1,4,5,6,7,6,5,1,0,2,1,8,9,10,11,10,9,2,1]
        .map((frame) => ({ key: ASSETS.inderSeller.key, frame })),
      frameRate: 1.54,
      repeat: -1
    });
  }

  function destroyIndianOverlay(scene) {
    if (!scene?.indianStoreOverlay) return;
    try {
      scene.indianStoreOverlay.list?.forEach?.((child) => scene.tweens?.killTweensOf?.(child));
      scene.indianStoreOverlay.destroy(true);
    } catch {}
    scene.indianStoreOverlay = null;
  }

  function makeInderBubble(scene) {
    const bubble = scene.add.container(410, 65).setScrollFactor(0);
    const g = scene.add.graphics();
    g.fillStyle(0xffefc2, 1);
    g.lineStyle(4, 0x5d3f27, 1);
    g.fillRoundedRect(-145, -28, 290, 56, 12);
    g.strokeRoundedRect(-145, -28, 290, 56, 12);
    g.fillStyle(0xffefc2, 1);
    g.fillTriangle(-10, 27, 10, 27, 0, 43);

    const text = scene.add.text(0, 0, "Guter Kunde, Guter Kunde", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#2a2017",
      align: "center"
    }).setOrigin(0.5);

    bubble.add([g, text]);
    return bubble;
  }

  function buildOldInderRoom(scene) {
    if (!scene?.sys?.isActive?.() || !scene.textures?.exists?.(ASSETS.inderShop.key) || !scene.textures?.exists?.(ASSETS.inderSeller.key)) return false;

    destroyIndianOverlay(scene);
    ensureInderAnimation(scene);

    const overlay = scene.add.container(0, 0).setScrollFactor(0).setDepth(650);
    const background = scene.add.image(0, 0, ASSETS.inderShop.key).setOrigin(0, 0).setScrollFactor(0);
    const source = scene.textures.get(ASSETS.inderShop.key)?.getSourceImage?.();
    if (source && (source.width !== VIEWPORT.width || source.height !== VIEWPORT.height)) {
      background.setDisplaySize(VIEWPORT.width, VIEWPORT.height);
    }

    const seller = scene.add.sprite(410, 180, ASSETS.inderSeller.key, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    seller.play(INDER_IDLE, true);
    seller.on("pointerdown", (pointer) => stopEvent(pointer?.event));
    seller.on("pointerup", (pointer) => {
      stopEvent(pointer?.event);
      scene.openIndianShopWindow?.();
    });

    overlay.add([background, seller, makeInderBubble(scene)]);
    scene.indianStoreOverlay = overlay;
    scene.__sceneArtIndianSellerV61 = seller;
    scene.createIndianStoreDOMControls?.();
    scene.refreshUILock?.();
    return true;
  }

  function recoverInderAssets(scene, onReady) {
    if (scene?.textures?.exists?.(ASSETS.inderShop.key) && scene?.textures?.exists?.(ASSETS.inderSeller.key)) {
      onReady?.();
      return;
    }
    if (!scene?.load || scene.__inderAssetRecoveryV75) return;

    scene.__inderAssetRecoveryV75 = true;
    queueAsset(scene, ASSETS.inderShop);
    queueAsset(scene, ASSETS.inderSeller);
    scene.load.once("complete", () => {
      scene.__inderAssetRecoveryV75 = false;
      onReady?.();
    });
    if (!scene.load.isLoading?.()) scene.load.start();
  }

  function enterOldIndianStore() {
    if (this.indianStoreOverlay) return;
    if (this.storeEntryModal) {
      this.destroyDOMModal?.(this.storeEntryModal);
      this.storeEntryModal = null;
    }

    this.setUILocked?.(true);
    this.player?.setVelocity?.(0, 0);

    const reveal = () => {
      if (!this.sys?.isActive?.()) return;
      this.player?.setVisible?.(false);
      buildOldInderRoom(this);
    };

    if (this.textures?.exists?.(ASSETS.inderShop.key) && this.textures?.exists?.(ASSETS.inderSeller.key)) reveal();
    else recoverInderAssets(this, reveal);
  }

  enterOldIndianStore.__sv37Room = true;
  enterOldIndianStore.__sceneArtV61 = true;

  function exitOldIndianStore() {
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
      this.indianStoreShopUI = null;
    }

    destroyIndianOverlay(this);
    document.querySelectorAll('#phaser-game [data-simon-ui="inder-v37-room"]').forEach((node) => node.remove());
    this.player?.setVisible?.(true);
    this.player?.setVelocity?.(0, 0);
    if (this.player?.body) this.player.body.enable = true;
    this.player?.play?.("simon-idle", true);
    this.refreshUILock?.();
    this.cameras?.main?.startFollow?.(this.player, true, 0.11, 0.11);
    this.cameras?.main?.setDeadzone?.(240, 80);
  }

  exitOldIndianStore.__sv37Room = true;
  exitOldIndianStore.__sceneArtV61 = true;

  function patchInderPrototype() {
    const proto = window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene?.prototype;
    if (!proto) return false;
    proto.enterIndianStore = enterOldIndianStore;
    proto.exitIndianStore = exitOldIndianStore;
    return true;
  }

  // -----------------------------------------------------------------------
  // MILKMAN v15 fallback. game-polish-v15 remains primary owner.
  // -----------------------------------------------------------------------

  function makeAnimation(scene, key, frames, frameRate, repeat = -1) {
    if (!scene?.anims || !scene.textures?.exists?.(ASSETS.milkman.key) || scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: ASSETS.milkman.key, frame })),
      frameRate,
      repeat
    });
  }

  function ensureMilkmanAnimations(scene) {
    makeAnimation(scene, "milkman-v15-idle", [0,1,2,1], 2.4, -1);
    makeAnimation(scene, "milkman-v15-run", [4,5,6,7,8,9], 8, -1);
    makeAnimation(scene, "milkman-v15-throw", [10,11,12,13,14,15], 9, 0);
    makeAnimation(scene, "milkman-v15-talk", [3,18,18,3], 2.6, 0);
    makeAnimation(scene, "milkman-v15-hit", [20,21,20], 8, 0);
    makeAnimation(scene, "milkman-v15-ko", [20,21,22,23,24], 6, 0);
  }

  function installMilkmanFallback(scene) {
    if (!scene || scene.__simonPolishV15Milkman || scene.__sceneFoundationMilkmanV75 || !scene.textures?.exists?.(ASSETS.milkman.key) || typeof scene.createMilkman !== "function") return;

    ensureMilkmanAnimations(scene);
    scene.__sceneFoundationMilkmanV75 = true;

    const originalFace = typeof scene.faceMilkmanTowardSimon === "function"
      ? scene.faceMilkmanTowardSimon.bind(scene)
      : null;

    scene.createMilkman = function createMilkmanSceneFoundationV75(x, groundY) {
      const milkman = this.add.sprite(x, groundY - 68, ASSETS.milkman.key, 0)
        .setDepth(32)
        .setScale(0.78);
      milkman.__milkmanV15 = true;
      milkman.setSize(104, 184);
      milkman.play("milkman-v15-idle", true);
      if (this.player) milkman.setFlipX(this.player.x < milkman.x);
      return milkman;
    };

    scene.faceMilkmanTowardSimon = function faceMilkmanSceneFoundationV75() {
      if (this.milkman?.__milkmanV15 && this.player) {
        this.milkman.setFlipX(this.player.x < this.milkman.x);
        return;
      }
      originalFace?.();
    };

    if (typeof scene.showMilkmanDialogue === "function") {
      const original = scene.showMilkmanDialogue.bind(scene);
      scene.showMilkmanDialogue = function showMilkmanDialogueSceneFoundationV75(message) {
        const result = original(message);
        const target = this.milkman;
        if (target?.__milkmanV15) {
          this.faceMilkmanTowardSimon();
          target.play("milkman-v15-talk", true);
          target.once("animationcomplete-milkman-v15-talk", () => {
            if (target.active && this.milkmanDialogueActive) target.play("milkman-v15-idle", true);
          });
        }
        return result;
      };
    }

    if (typeof scene.updateMilkmanFight === "function") {
      const original = scene.updateMilkmanFight.bind(scene);
      scene.updateMilkmanFight = function updateMilkmanFightSceneFoundationV75(time, delta) {
        const beforeX = this.milkman?.__milkmanV15 ? this.milkman.x : null;
        const result = original(time, delta);
        const milkman = this.milkman;
        if (!milkman?.__milkmanV15 || !milkman.active || !this.milkmanFightActive || this.milkmanDefeated) return result;
        this.faceMilkmanTowardSimon();
        if (Number(this.__milkmanV15ActionUntil) > time) return result;
        const moved = Number.isFinite(beforeX) && Math.abs(milkman.x - beforeX) > 0.15;
        const desired = moved ? "milkman-v15-run" : "milkman-v15-idle";
        if (milkman.anims?.currentAnim?.key !== desired) milkman.play(desired, true);
        return result;
      };
    }

    if (typeof scene.createMilkBottleProjectile === "function") {
      const original = scene.createMilkBottleProjectile.bind(scene);
      scene.createMilkBottleProjectile = function createMilkBottleProjectileSceneFoundationV75(...args) {
        if (this.milkman?.__milkmanV15 && this.milkmanFightActive && !this.milkmanDefeated) {
          this.__milkmanV15ActionUntil = this.time.now + 620;
          this.milkman.play("milkman-v15-throw", true);
        }
        return original(...args);
      };
    }

    if (typeof scene.performMilkmanPunch === "function") {
      const original = scene.performMilkmanPunch.bind(scene);
      scene.performMilkmanPunch = function performMilkmanPunchSceneFoundationV75(time) {
        const hpBefore = Number(this.milkmanHp);
        const result = original(time);
        if (this.milkman?.__milkmanV15 && Number(this.milkmanHp) < hpBefore && Number(this.milkmanHp) > 0) {
          this.__milkmanV15ActionUntil = this.time.now + 390;
          this.milkman.play("milkman-v15-hit", true);
        }
        return result;
      };
    }

    if (typeof scene.defeatMilkman === "function") {
      const original = scene.defeatMilkman.bind(scene);
      scene.defeatMilkman = function defeatMilkmanSceneFoundationV75(...args) {
        const result = original(...args);
        const milkman = this.milkman;
        if (milkman?.__milkmanV15) {
          this.tweens?.killTweensOf?.(milkman);
          milkman.setAngle(0).setScale(0.78).setY(VIEWPORT.groundTop - 74).setDepth(25).setSize(190, 92);
          milkman.play("milkman-v15-ko", true);
          milkman.once("animationcomplete-milkman-v15-ko", () => {
            if (milkman.active) milkman.setFrame(24);
          });
        }
        return result;
      };
    }
  }

  // -----------------------------------------------------------------------
  // POLYBAHN — clean street-level entrance left of the locker (locker x=996).
  // -----------------------------------------------------------------------

  function destroyPolybahnArtifacts(scene) {
    if (!scene) return;
    const old = scene.__ethCampusEntryV59;
    if (old) {
      [old.street, old.facades, old.station, old.sign, old.centralLabel, old.zone,
       old.marker, old.actionLabel, old.stair, old.signPost].forEach(safeDestroy);
    }
    scene.__ethCampusEntryV59 = null;

    const remnants = scene.__z67LowerPolybahnPolishObjects;
    if (Array.isArray(remnants)) remnants.forEach(safeDestroy);
    else if (remnants) Object.values(remnants).forEach(safeDestroy);

    scene.__z67LowerPolybahnPolishObjects = [];
    // Keep v67 from drawing the old bridge/side-street visual again.
    scene.__z67LowerPolybahnPolished = true;
  }

  function polybahnUnlocked(scene) {
    if (scene?.developerMode) return true;
    const state = window.__SIMON_CASHIER_STATE_V54__ || window.SimonCashierV54?.state || null;
    return Boolean(
      state?.inspirationHintSeen ||
      state?.needsInspiration ||
      state?.coffeePlanWritten ||
      state?.cashierAsked ||
      state?.cashierRejected
    );
  }

  function createPolybahnEntry(scene) {
    if (!scene?.add) return;
    const current = scene.__ethCampusEntryV59;

    if (current?.__sceneFoundationV75) {
      const unlocked = polybahnUnlocked(scene);
      current.actionLabel?.setVisible?.(unlocked);
      if (current.zone?.input) current.zone.input.enabled = unlocked;
      if (current.actionLabel?.input) current.actionLabel.input.enabled = unlocked;
      return;
    }

    destroyPolybahnArtifacts(scene);

    const x = POLY_X;
    const top = 224;
    const w = 48;
    const h = 88;

    const station = scene.add.container(0, 0).setDepth(7);
    const g = scene.add.graphics();
    g.fillStyle(0xb8ac9b, 1);
    g.fillRoundedRect(x - w / 2, top, w, h, 4);
    g.fillStyle(0x8f8476, 1);
    g.fillRect(x - w / 2 - 3, top - 6, w + 6, 7);
    g.fillStyle(0xb62f31, 1);
    g.fillRoundedRect(x - 20, top + 12, 40, 16, 3);
    g.fillStyle(0x243b43, 1);
    g.fillRoundedRect(x - 16, top + 38, 32, h - 38, 5);
    g.fillStyle(0x172b32, 1);
    g.fillRoundedRect(x - 11, top + 44, 22, h - 44, 4);
    station.add(g);

    const sign = scene.add.text(x, top + 20, "POLY", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "4px",
      color: "#fff0d0"
    }).setOrigin(0.5).setDepth(9);

    const zone = scene.add.zone(x, top + 50, 62, 94)
      .setDepth(286)
      .setInteractive({ useHandCursor: true });

    const actionLabel = scene.add.text(x, top - 14, "POLYBAHN", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "4.5px",
      color: "#fff0c9",
      backgroundColor: "#7f3030",
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(287).setInteractive({ useHandCursor: true });

    const enter = (pointer) => {
      stopEvent(pointer?.event);
      if (!polybahnUnlocked(scene)) return;
      window.SimonETHV59?.enter?.();
    };
    zone.on("pointerdown", enter);
    actionLabel.on("pointerdown", enter);

    scene.__ethCampusEntryV59 = {
      x,
      street: null,
      facades: null,
      station,
      sign,
      centralLabel: null,
      zone,
      marker: null,
      actionLabel,
      __v74Entry: true,
      __sceneFoundationV75: true
    };

    const unlocked = polybahnUnlocked(scene);
    actionLabel.setVisible(unlocked);
    zone.input.enabled = unlocked;
    actionLabel.input.enabled = unlocked;

    scene.events?.once?.("shutdown", () => {
      [station, sign, zone, actionLabel].forEach(safeDestroy);
    });
  }

  // -----------------------------------------------------------------------
  // WG / ROOM transition fix.
  // -----------------------------------------------------------------------

  function patchRoomTransitionStart() {
    const proto = Phaser?.Scenes?.ScenePlugin?.prototype;
    if (!proto || typeof proto.start !== "function" || proto.start.__wgRoomV75) return false;

    const original = proto.start;
    const wrapped = function startWithWGRoomLaunchV75(key, data) {
      const sourceKey = this.systems?.settings?.key || this.scene?.sys?.settings?.key || null;

      if (sourceKey === "WGInteriorScene" && key === "SimonRoomScene") {
        const game = getGame() || this.systems?.game;
        try {
          if (game?.scene?.isActive?.(key) || game?.scene?.isPaused?.(key)) game.scene.stop(key);
          game?.scene?.launch?.(key, data);
          return this;
        } catch (error) {
          console.error("WG -> SimonRoom launch:", error);
        }
      }

      return original.call(this, key, data);
    };
    wrapped.__wgRoomV75 = true;
    proto.start = wrapped;
    return true;
  }

  function patchInteriorExitMethods() {
    const game = getGame();
    if (!game?.scene) return;

    let hall = null;
    let room = null;
    try { hall = game.scene.getScene("WGInteriorScene"); } catch {}
    try { room = game.scene.getScene("SimonRoomScene"); } catch {}

    const hallProto = hall?.constructor?.prototype;
    if (hallProto && typeof hallProto.leaveWG === "function" && !hallProto.leaveWG.__v75) {
      const wrapped = function leaveWGV75() {
        if (this.__leavingWGV75) return;
        this.__leavingWGV75 = true;

        const activeGame = getGame() || this.game;
        const outdoor = this.outdoorScene || getScene("OerlikonScene");

        try {
          activeGame.scene.resume("OerlikonScene");
          outdoor?.physics?.world?.resume?.();
          if (outdoor?.input) outdoor.input.enabled = true;
          outdoor?.player?.setVelocity?.(0, 0);
          outdoor?.resumeFromWG?.();
          outdoor?.setUILocked?.(false);
          outdoor?.refreshUILock?.();
          outdoor?.setControlsVisible?.(true);
        } catch (error) {
          console.error("WG -> Oerlikon v75:", error);
        }

        window.setTimeout(() => {
          try { activeGame.scene.stop("WGInteriorScene"); } catch {}
          this.__leavingWGV75 = false;
        }, 30);
      };
      wrapped.__v75 = true;
      hallProto.leaveWG = wrapped;
    }

    const roomProto = room?.constructor?.prototype;
    if (roomProto && typeof roomProto.leaveRoom === "function" && !roomProto.leaveRoom.__v75) {
      const wrapped = function leaveRoomV75() {
        if (this.__leavingRoomV75) return;
        this.__leavingRoomV75 = true;

        const activeGame = getGame() || this.game;
        const hallScene = this.hallScene || getScene("WGInteriorScene");

        try {
          activeGame.scene.resume("WGInteriorScene");
          if (hallScene?.input) hallScene.input.enabled = true;
          hallScene?.cameras?.main?.resetFX?.();
          hallScene?.cameras?.main?.setAlpha?.(1);
        } catch (error) {
          console.error("Zimmer -> WG v75:", error);
        }

        window.setTimeout(() => {
          try { activeGame.scene.stop("SimonRoomScene"); } catch {}
          this.__leavingRoomV75 = false;
        }, 30);
      };
      wrapped.__v75 = true;
      roomProto.leaveRoom = wrapped;
    }
  }

  function installStaticPatches() {
    wrapBasePreloadAndCreate();
    patchInderPrototype();
    patchRoomTransitionStart();
  }

  function runtimeTick() {
    installStaticPatches();

    const bahnhof = getScene("BahnhofquaiScene");
    if (bahnhof?.sys?.isActive?.()) {
      ensureMilkmanAnimations(bahnhof);
      installMilkmanFallback(bahnhof);
      createPolybahnEntry(bahnhof);
    }

    patchInteriorExitMethods();
  }

  installStaticPatches();
  runtimeTick();
  window.setInterval(runtimeTick, 180);

  window.SimonSceneArtV61 = Object.freeze({
    VERSION,
    VIEWPORT,
    ASSETS,
    ready: true,
    status() {
      const bahnhof = getScene("BahnhofquaiScene");
      return {
        version: VERSION,
        inderShop: Boolean(bahnhof?.textures?.exists?.(ASSETS.inderShop.key)),
        inderSeller: Boolean(bahnhof?.textures?.exists?.(ASSETS.inderSeller.key)),
        milkman: Boolean(bahnhof?.textures?.exists?.(ASSETS.milkman.key)),
        polybahnX: bahnhof?.__ethCampusEntryV59?.x ?? null,
        roomLaunchFixed: Boolean(Phaser?.Scenes?.ScenePlugin?.prototype?.start?.__wgRoomV75)
      };
    }
  });
})();
