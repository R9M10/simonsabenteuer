(() => {
  "use strict";

  if (window.__SIMON_CITY_PATCH_V16__) return;
  window.__SIMON_CITY_PATCH_V16__ = true;

  const wrappedStartSimonGame = window.startSimonGame;
  if (typeof wrappedStartSimonGame !== "function") {
    console.error("City Patch v16: startSimonGame fehlt.");
    return;
  }

  const WORLD_KEYS = {
    milchbuck: "milchbuck-composite-v16",
    bahnhof: "bahnhof-composite-v16",
    tram: "tram-v16",
    inderInterior: "inder-interior-v16",
    inderStrip: "inder-idle-strip-v16"
  };

  window.startSimonGame = function startSimonGameWithCityPatchV16(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);
    if (game) watchScenes(game);
    return game;
  };

  function watchScenes(game) {
    const seen = new WeakSet();
    const timer = window.setInterval(() => {
      if (!game?.scene) return;
      const scenes = game.scene.getScenes?.(false) || [];
      scenes.forEach((scene) => {
        if (!scene?.load || !scene?.textures || seen.has(scene)) return;
        if (["MilchbuckScene", "BahnhofquaiScene", "HiveInteriorScene"].includes(scene.scene.key)) {
          seen.add(scene);
          ensureAssets(scene, () => {
            if (scene.scene.key === "MilchbuckScene") patchMilchbuck(scene);
            if (scene.scene.key === "BahnhofquaiScene") patchBahnhof(scene);
            if (scene.scene.key === "HiveInteriorScene") patchHive(scene);
          });
        }
      });
    }, 250);

    window.setTimeout(() => window.clearInterval(timer), 30000);
  }

  function ensureAssets(scene, onReady) {
    const toLoad = [];
    if (!scene.textures.exists(WORLD_KEYS.milchbuck)) {
      scene.load.image(WORLD_KEYS.milchbuck, "milchbuck-composite-v16.png");
      toLoad.push(WORLD_KEYS.milchbuck);
    }
    if (!scene.textures.exists(WORLD_KEYS.bahnhof)) {
      scene.load.image(WORLD_KEYS.bahnhof, "bahnhof-composite-v16.png");
      toLoad.push(WORLD_KEYS.bahnhof);
    }
    if (!scene.textures.exists(WORLD_KEYS.tram)) {
      scene.load.image(WORLD_KEYS.tram, "tram-v16.png");
      toLoad.push(WORLD_KEYS.tram);
    }
    if (!scene.textures.exists(WORLD_KEYS.inderInterior)) {
      scene.load.image(WORLD_KEYS.inderInterior, "inder-interior-v16.png");
      toLoad.push(WORLD_KEYS.inderInterior);
    }
    if (!scene.textures.exists(WORLD_KEYS.inderStrip)) {
      scene.load.spritesheet(WORLD_KEYS.inderStrip, "inder-idle-strip-v16.png", { frameWidth: 320, frameHeight: 190 });
      toLoad.push(WORLD_KEYS.inderStrip);
    }
    const ready = () => {
      createInderAnimations(scene);
      onReady?.();
    };
    if (!toLoad.length) { ready(); return; }
    scene.load.once("complete", ready);
    if (!scene.load.isLoading?.()) scene.load.start();
  }

  function createInderAnimations(scene) {
    if (scene.anims.exists("inder-v16-idle")) return;
    scene.anims.create({
      key: "inder-v16-idle",
      frames: scene.anims.generateFrameNumbers(WORLD_KEYS.inderStrip, { frames: [0,1,2,3,2,1] }),
      frameRate: 3,
      repeat: -1
    });
  }

  function addBackdrop(scene, key, flagName) {
    if (scene[flagName]) return scene[flagName];
    const image = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(6);
    scene[flagName] = image;
    try {
      const width = scene.scale?.width || 820;
      const height = scene.scale?.height || 390;
      const worldWidth = Math.max(scene.physics?.world?.bounds?.width || 0, scene.cameras?.main?.getBounds?.()?.width || 0, 1900);
      image.setDisplaySize(worldWidth, height);
    } catch (error) {
      image.setDisplaySize(1900, 390);
    }
    return image;
  }

  function safePlayer(scene) { return scene.player || scene.simon || null; }

  function patchMilchbuck(scene) {
    if (scene.__cityPatchV16Milchbuck) return;
    scene.__cityPatchV16Milchbuck = true;

    addBackdrop(scene, WORLD_KEYS.milchbuck, "__milchbuckBackdrop");
    installTram(scene);

    // Re-apply on wake in case the scene gets recreated or resumed from other transitions.
    scene.events?.on?.("wake", () => {
      addBackdrop(scene, WORLD_KEYS.milchbuck, "__milchbuckBackdrop");
      installTram(scene);
    });
  }

  function installTram(scene) {
    if (scene.__tramV16) return;
    scene.__tramV16 = scene.add.image(160, 270, WORLD_KEYS.tram)
      .setOrigin(0.5, 1)
      .setScale(0.18)
      .setDepth(12)
      .setFlipX(true);

    scene.__tramLabel = scene.add.text(146, 185, "TRAM 11", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#fff3c4', backgroundColor: '#11325c',
      padding: { x: 5, y: 4 }
    }).setDepth(13).setOrigin(0.5);

    const zone = scene.add.zone(160, 238, 250, 118).setDepth(14).setInteractive({ useHandCursor: true });
    scene.__tramZone = zone;
    zone.on("pointerup", () => boardTram(scene));
  }

  function boardTram(scene) {
    if (scene.__tramDeparting) return;
    scene.__tramDeparting = true;

    const afterRide = () => {
      const candidateNames = [
        "boardTram", "rideTram", "takeTram", "travelToBahnhofquai", "goToBahnhofquai", "enterBahnhofquai"
      ];
      for (const name of candidateNames) {
        if (typeof scene[name] === "function") {
          try { scene[name](); return; } catch (error) {}
        }
      }
      try {
        if (scene.scene?.isActive?.()) scene.scene.start?.("BahnhofquaiScene");
      } catch (error) {
        console.warn("Tram v16: kein Übergang gefunden.", error);
      }
    };

    scene.tweens.add({
      targets: [scene.__tramV16, scene.__tramLabel],
      x: '-=420',
      duration: 700,
      ease: 'Sine.easeInOut',
      onComplete: afterRide
    });
  }

  function patchBahnhof(scene) {
    if (scene.__cityPatchV16Bahnhof) return;
    scene.__cityPatchV16Bahnhof = true;

    addBackdrop(scene, WORLD_KEYS.bahnhof, "__bahnhofBackdrop");
    installInderEntrance(scene);
    scene.events?.on?.("wake", () => {
      addBackdrop(scene, WORLD_KEYS.bahnhof, "__bahnhofBackdrop");
      installInderEntrance(scene);
    });
  }

  function installInderEntrance(scene) {
    if (scene.__inderZoneV16) return;
    const x = 948;
    const y = 257;
    scene.__inderZoneV16 = scene.add.zone(x, y, 130, 138)
      .setDepth(16)
      .setInteractive({ useHandCursor: true });
    scene.__inderLabelV16 = scene.add.text(x, 191, "DER INDER ↥", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffe6a5', backgroundColor: '#52231e',
      padding: { x: 6, y: 5 }
    }).setOrigin(0.5).setDepth(17);
    scene.__inderZoneV16.on("pointerup", () => openInderOverlay(scene));
  }

  function openInderOverlay(scene) {
    const root = document.getElementById("phaser-game") || document.body;
    root.querySelectorAll("[data-inder-shop-v16]").forEach((node) => node.remove());
    ensureInderStyles();

    scene.scene.pause?.();

    const overlay = document.createElement("div");
    overlay.dataset.inderShopV16 = "overlay";
    overlay.className = "inder-shop-v16";

    const panel = document.createElement("div");
    panel.className = "inder-shop-v16__panel";
    panel.style.backgroundImage = 'url("inder-interior-v16.png")';

    const title = document.createElement("div");
    title.className = "inder-shop-v16__title";
    title.textContent = "DER INDER";

    const keeper = document.createElement("div");
    keeper.className = "inder-shop-v16__keeper";

    const speech = document.createElement("div");
    speech.className = "inder-shop-v16__speech";
    speech.innerHTML = '<strong>Hoi zäme!</strong><br>Willkomme bi “Der Inder”.';

    const note = document.createElement("div");
    note.className = "inder-shop-v16__note";
    note.textContent = "De Lade isch jetzt im Spiel und mit em neue Shop-Innere verknüpft.";

    const closeBtn = document.createElement("button");
    closeBtn.type = 'button';
    closeBtn.className = 'inder-shop-v16__button';
    closeBtn.textContent = 'SCHLIESSEN';

    const close = () => {
      overlay.remove();
      scene.scene.resume?.();
    };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });

    panel.append(title, keeper, speech, note, closeBtn);
    overlay.append(panel);
    root.appendChild(overlay);
  }

  function ensureInderStyles() {
    if (document.getElementById('inder-shop-v16-style')) return;
    const style = document.createElement('style');
    style.id = 'inder-shop-v16-style';
    style.textContent = `
      .inder-shop-v16 {
        position: absolute; inset: 0; z-index: 100080; display: flex; align-items: center; justify-content: center;
        background: rgba(8, 7, 12, 0.78);
      }
      .inder-shop-v16__panel {
        position: relative; width: min(90vw, 900px); aspect-ratio: 1672 / 941; border: 4px solid #cda55f;
        box-shadow: 0 16px 28px rgba(0,0,0,0.45); background-size: cover; background-position: center center;
        image-rendering: pixelated; overflow: hidden;
      }
      .inder-shop-v16__title {
        position: absolute; left: 18px; top: 16px; font-family: "Press Start 2P", monospace; font-size: 14px;
        color: #ffe5ad; background: rgba(30,17,13,0.78); padding: 8px 10px; border: 2px solid #d1a264;
      }
      .inder-shop-v16__keeper {
        position: absolute; left: 50%; bottom: 120px; width: 220px; height: 150px; transform: translateX(-50%);
        background-image: url("inder-idle-strip-v16.png"); background-repeat: no-repeat; background-size: 880px 150px;
        image-rendering: pixelated; animation: inder-keeper-v16 2.2s steps(4) infinite;
      }
      .inder-shop-v16__speech {
        position: absolute; left: 50%; top: 58px; transform: translateX(-50%); width: min(62%, 430px);
        padding: 12px 14px; border-radius: 16px; background: rgba(255, 247, 221, 0.96); color: #241d17;
        border: 3px solid #3a2a1f; font-family: "Press Start 2P", monospace; font-size: 11px; line-height: 1.55; text-align: center;
      }
      .inder-shop-v16__note {
        position: absolute; left: 18px; right: 18px; bottom: 58px; font-family: "Press Start 2P", monospace;
        font-size: 9px; line-height: 1.45; color: #f6e5bf; background: rgba(20,16,13,0.62); padding: 8px 10px;
      }
      .inder-shop-v16__button {
        position: absolute; right: 16px; bottom: 14px; min-height: 38px; padding: 9px 12px; cursor: pointer;
        font-family: "Press Start 2P", monospace; font-size: 9px; color: #fff1bf; background: #4d2918; border: 2px solid #d7a96b;
      }
      @keyframes inder-keeper-v16 {
        from { background-position: 0 0; }
        to { background-position: -880px 0; }
      }
      @media (max-width: 900px) {
        .inder-shop-v16__title { font-size: 11px; }
        .inder-shop-v16__speech { font-size: 9px; width: min(70%, 360px); }
        .inder-shop-v16__note { font-size: 7px; }
        .inder-shop-v16__button { font-size: 8px; }
        .inder-shop-v16__keeper { width: 180px; height: 123px; background-size: 720px 123px; }
      }
    `;
    document.head.appendChild(style);
  }

  function patchHive(scene) {
    if (scene.__cityPatchV16Hive) return;
    scene.__cityPatchV16Hive = true;

    if (typeof scene.createBarWoman === 'function') {
      const originalCreate = scene.createBarWoman.bind(scene);
      scene.createBarWoman = function createBarWomanV16(x, y) {
        originalCreate(x, y);
        if (this.womanSprite) {
          this.womanSprite.setFlipX(true);
          this.womanSprite.setDepth(42);
        }
      };
    }

    if (typeof scene.startRejectedDanceInvite === 'function') {
      scene.startRejectedDanceInvite = function startRejectedDanceInviteV16() {
        this.closeModal?.();
        this.actionLocked = true;
        if (this.womanSprite) this.womanSprite.setFlipX(true);
        this.player?.setFlipX(false);
        this.playSimonAction?.('simon-v14-talk', { loop: true });
        this.showSpeechBubble?.(this.player, 'Hey Süessi, wotsch tanze?', 2550);
        this.time.delayedCall(2625, () => {
          this.destroySpeechBubble?.();
          this.stopSimonAction?.();
          if (this.womanSprite?.active) {
            this.womanSprite.setFlipX(true);
            this.womanSprite.play('woman-v14-reject', true);
          }
          this.showSpeechBubble?.(this.womanSprite, 'Nöd mit dir.', 1900);
        });
        this.time.delayedCall(4560, () => {
          this.destroySpeechBubble?.();
          if (this.womanSprite?.active) {
            this.womanSprite.setFlipX(true);
            this.womanSprite.play('woman-v14-idle', true);
          }
          this.actionLocked = false;
        });
      };
    }

    // Apply immediately if the woman already exists.
    if (scene.womanSprite) scene.womanSprite.setFlipX(true);
  }
})();
