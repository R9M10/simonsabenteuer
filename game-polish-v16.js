(() => {
  "use strict";

  if (window.__SIMON_POLISH_V16_V21__) return;
  window.__SIMON_POLISH_V16_V21__ = true;

  const SIMON_BOX_KEY = "simon-box-v15";
  const MILKMAN_KEY = "milkman-v15";
  const MILK_KEY = "milk-bottle-v16";
  const SUPER_MILK_KEY = "super-milk-bottle-v16";
  const GROUND_TOP = 338;

  const wrappedStartSimonGame = window.startSimonGame;
  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Game Polish v16: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithPolishV16(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);
    if (game) waitForGameScenes(game);
    return game;
  };

  function waitForGameScenes(game, attempt = 0) {
    if (!game?.scene || attempt > 260) return;
    const milchbuck = game.scene.getScene?.("MilchbuckScene");
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");
    const activeScene = game.scene.getScenes?.(true)?.find((scene) => scene?.load && scene?.textures && scene?.anims);
    if (!activeScene || (!milchbuck && !bahnhof)) {
      window.setTimeout(() => waitForGameScenes(game, attempt + 1), 50);
      return;
    }
    loadPolishAssets(activeScene, game);
  }

  function loadPolishAssets(loaderScene, game) {
    if (game.__simonPolishV16Ready) {
      installPolish(game);
      return;
    }
    if (game.__simonPolishV16Loading) return;
    game.__simonPolishV16Loading = true;

    let queued = 0;
    if (!loaderScene.textures.exists(SIMON_BOX_KEY)) {
      loaderScene.load.spritesheet(SIMON_BOX_KEY, "simon-box-spritesheet-v15.png", { frameWidth: 300, frameHeight: 280 });
      queued += 1;
    }
    if (!loaderScene.textures.exists(MILKMAN_KEY)) {
      loaderScene.load.spritesheet(MILKMAN_KEY, "milkman-spritesheet-v15.png", { frameWidth: 210, frameHeight: 200 });
      queued += 1;
    }
    if (!loaderScene.textures.exists(MILK_KEY)) {
      loaderScene.load.image(MILK_KEY, "milk-bottle-v16.png");
      queued += 1;
    }
    if (!loaderScene.textures.exists(SUPER_MILK_KEY)) {
      loaderScene.load.image(SUPER_MILK_KEY, "super-milk-bottle-v16.png");
      queued += 1;
    }

    const ready = () => {
      game.__simonPolishV16Loading = false;
      game.__simonPolishV16Ready = true;
      installPolish(game);
    };

    if (queued === 0) { ready(); return; }
    loaderScene.load.once("complete", ready);
    if (!loaderScene.load.isLoading?.()) loaderScene.load.start();
  }

  function installPolish(game) {
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");
    const sceneForAnimations = game.scene.getScenes?.(true)?.find((scene) => scene?.anims) || bahnhof;
    if (!sceneForAnimations) return;
    installAnimations(sceneForAnimations);
    installUnarmedBoxing(sceneForAnimations);
    patchMilkmanScene(bahnhof);
    console.info("Game Polish v16 aktiv: Boxen + Milkman + Milchflaschen-Reskin.");
  }

  function frames(texture, ids) { return ids.map((frame) => ({ key: texture, frame })); }
  function createAnimation(scene, key, texture, ids, frameRate, repeat = -1) {
    if (scene.anims.exists(key)) scene.anims.remove(key);
    scene.anims.create({ key, frames: frames(texture, ids), frameRate, repeat });
  }

  function installAnimations(scene) {
    if (scene.game.__simonPolishV16Animations) return;
    scene.game.__simonPolishV16Animations = true;
    createAnimation(scene, "simon-box-v15", SIMON_BOX_KEY, [0,1,2,3,4], 14, 0);
    createAnimation(scene, "milkman-v15-idle", MILKMAN_KEY, [0,1,2,1], 2.4, -1);
    createAnimation(scene, "milkman-v15-run", MILKMAN_KEY, [4,5,6,7,8,9], 8, -1);
    createAnimation(scene, "milkman-v15-throw", MILKMAN_KEY, [10,11,12,13,14,15], 9, 0);
    createAnimation(scene, "milkman-v15-talk", MILKMAN_KEY, [3,18,18,3], 2.6, 0);
    createAnimation(scene, "milkman-v15-hit", MILKMAN_KEY, [20,21,20], 8, 0);
    createAnimation(scene, "milkman-v15-ko", MILKMAN_KEY, [20,21,22,23,24], 6, 0);
  }

  function installUnarmedBoxing(scene) {
    if (scene.game.__simonPolishV16Boxing) return;
    scene.game.__simonPolishV16Boxing = true;
    if (scene.anims.exists("simon-shoot")) scene.anims.remove("simon-shoot");
    scene.anims.create({ key: "simon-shoot", frames: frames(SIMON_BOX_KEY, [0,1,2,3,4]), frameRate: 14, repeat: 0 });
  }

  function decorateProjectile(scene, projectile, isSuper = false) {
    if (!projectile || !projectile.active) return;
    const key = isSuper ? SUPER_MILK_KEY : MILK_KEY;
    try {
      if (typeof projectile.setTexture === "function") {
        projectile.setTexture(key);
        projectile.setDisplaySize(isSuper ? 50 : 34, isSuper ? 50 : 34);
        projectile.setDepth(36);
        return;
      }
    } catch (error) {
      // fall back below
    }
    if (typeof projectile.setVisible === "function") projectile.setVisible(false);
    const image = scene.add.image(projectile.x, projectile.y, key)
      .setDisplaySize(isSuper ? 52 : 36, isSuper ? 52 : 36)
      .setDepth((projectile.depth || 35) + 1);
    scene.__milkProjectileSprites ||= [];
    scene.__milkProjectileSprites.push({ source: projectile, image });
  }

  function syncProjectileSprites(scene) {
    if (!Array.isArray(scene.__milkProjectileSprites)) return;
    scene.__milkProjectileSprites = scene.__milkProjectileSprites.filter((entry) => {
      const { source, image } = entry;
      if (!source?.active || !image?.active) {
        image?.destroy?.();
        return false;
      }
      image.setPosition(source.x, source.y);
      if (Number.isFinite(source.rotation)) image.rotation = source.rotation;
      else if (Number.isFinite(source.angle)) image.setAngle(source.angle);
      return true;
    });
  }

  function detectSuperBottle(scene, args) {
    return Boolean(
      scene?.superMilkActive ||
      scene?.milkmanSuperActive ||
      scene?.throwingSuperMilk ||
      args.some((arg) => arg === true || arg?.super || arg?.kind === "super" || arg?.type === "super")
    );
  }

  function patchMilkmanScene(scene) {
    if (!scene || scene.__simonPolishV16Milkman) return;
    if (typeof scene.createMilkman !== "function" || typeof scene.updateMilkmanFight !== "function") {
      console.warn("Game Polish v16: aktuelles Milchmann-System nicht gefunden; Milkman-Patch ausgelassen.");
      return;
    }
    scene.__simonPolishV16Milkman = true;

    const originalFace = typeof scene.faceMilkmanTowardSimon === "function" ? scene.faceMilkmanTowardSimon.bind(scene) : null;

    scene.createMilkman = function createMilkmanV16(x, groundY) {
      const milkman = this.add.sprite(x, groundY - 68, MILKMAN_KEY, 0).setDepth(32).setScale(0.78);
      milkman.__milkmanV15 = true;
      milkman.setSize(104, 184);
      milkman.play("milkman-v15-idle", true);
      if (this.player) milkman.setFlipX(this.player.x < milkman.x);
      return milkman;
    };

    scene.faceMilkmanTowardSimon = function faceMilkmanTowardSimonV16() {
      if (this.milkman?.__milkmanV15 && this.player) {
        this.milkman.setFlipX(this.player.x < this.milkman.x);
        return;
      }
      originalFace?.();
    };

    if (typeof scene.showMilkmanDialogue === "function") {
      const original = scene.showMilkmanDialogue.bind(scene);
      scene.showMilkmanDialogue = function showMilkmanDialogueV16(message) {
        this.faceMilkmanTowardSimon();
        const result = original(message);
        if (this.milkman?.__milkmanV15) {
          this.faceMilkmanTowardSimon();
          this.milkman.play("milkman-v15-talk", true);
          const target = this.milkman;
          target.once("animationcomplete-milkman-v15-talk", () => {
            if (target.active && this.milkmanDialogueActive) {
              this.faceMilkmanTowardSimon();
              target.play("milkman-v15-idle", true);
            }
          });
        }
        return result;
      };
    }

    if (typeof scene.startMilkmanFight === "function") {
      const original = scene.startMilkmanFight.bind(scene);
      scene.startMilkmanFight = function startMilkmanFightV16(...args) {
        const result = original(...args);
        if (this.milkman?.__milkmanV15) {
          this.faceMilkmanTowardSimon();
          this.milkman.play("milkman-v15-idle", true);
        }
        return result;
      };
    }

    if (typeof scene.createMilkBottleProjectile === "function") {
      const original = scene.createMilkBottleProjectile.bind(scene);
      scene.createMilkBottleProjectile = function createMilkBottleProjectileV16(...args) {
        const milkman = this.milkman;
        if (!milkman?.__milkmanV15 || !this.milkmanFightActive || this.milkmanDefeated || this.playerDying) {
          const direct = original(...args);
          decorateProjectile(this, direct, detectSuperBottle(this, args));
          return direct;
        }
        this.faceMilkmanTowardSimon();
        this.__milkmanV15ActionUntil = this.time.now + 690;
        milkman.play("milkman-v15-throw", true);
        const isSuper = detectSuperBottle(this, args);
        this.time.delayedCall(285, () => {
          if (this.milkmanFightActive && this.milkman === milkman && milkman.active && !this.milkmanDefeated && !this.playerDying) {
            const projectile = original(...args);
            decorateProjectile(this, projectile, isSuper);
          }
        });
        return null;
      };
    }

    if (typeof scene.updateMilkmanFight === "function") {
      const original = scene.updateMilkmanFight.bind(scene);
      scene.updateMilkmanFight = function updateMilkmanFightV16(time, delta) {
        const beforeX = this.milkman?.__milkmanV15 ? this.milkman.x : null;
        const result = original(time, delta);
        syncProjectileSprites(this);
        const milkman = this.milkman;
        if (!milkman?.__milkmanV15 || !milkman.active || !this.milkmanFightActive || this.milkmanDefeated) return result;
        this.faceMilkmanTowardSimon();
        const actionUntil = Number(this.__milkmanV15ActionUntil) || 0;
        if (time < actionUntil) return result;
        const moved = Number.isFinite(beforeX) && Math.abs(milkman.x - beforeX) > 0.15;
        const desired = moved ? "milkman-v15-run" : "milkman-v15-idle";
        if (milkman.anims.currentAnim?.key !== desired) milkman.play(desired, true);
        return result;
      };
    }

    if (typeof scene.performMilkmanPunch === "function") {
      const original = scene.performMilkmanPunch.bind(scene);
      scene.performMilkmanPunch = function performMilkmanPunchV16(time) {
        const hpBefore = Number(this.milkmanHp);
        const result = original(time);
        if (this.milkman?.__milkmanV15 && Number(this.milkmanHp) < hpBefore && Number(this.milkmanHp) > 0) {
          this.faceMilkmanTowardSimon();
          this.__milkmanV15ActionUntil = this.time.now + 390;
          this.milkman.play("milkman-v15-hit", true);
        }
        return result;
      };
    }

    if (typeof scene.defeatMilkman === "function") {
      const original = scene.defeatMilkman.bind(scene);
      scene.defeatMilkman = function defeatMilkmanV16(...args) {
        const result = original(...args);
        const milkman = this.milkman;
        if (milkman?.__milkmanV15) {
          this.tweens.killTweensOf(milkman);
          milkman.setAngle(0).setScale(0.78).setY(GROUND_TOP - 74).setDepth(25).setSize(190, 92);
          milkman.play("milkman-v15-ko", true);
          milkman.once("animationcomplete-milkman-v15-ko", () => {
            if (milkman.active) milkman.setFrame(24);
          });
        }
        return result;
      };
    }
  }
})();
