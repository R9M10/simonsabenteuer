(() => {
  "use strict";

  if (window.__SIMON_POLISH_V15_V21__) return;
  window.__SIMON_POLISH_V15_V21__ = true;

  const SIMON_BOX_KEY = "simon-box-v15";
  const MILKMAN_KEY = "milkman-v15";
  const GROUND_TOP = 338;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Game Polish v15: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithPolishV15(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (game) {
      waitForGameScenes(game);
    }

    return game;
  };

  function waitForGameScenes(game, attempt = 0) {
    if (!game?.scene || attempt > 240) return;

    const milchbuck = game.scene.getScene?.("MilchbuckScene");
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");
    const activeScene = game.scene.getScenes?.(true)?.find(
      (scene) => scene?.load && scene?.textures && scene?.anims
    );

    if (!activeScene || (!milchbuck && !bahnhof)) {
      window.setTimeout(
        () => waitForGameScenes(game, attempt + 1),
        50
      );
      return;
    }

    loadPolishAssets(activeScene, game);
  }

  function loadPolishAssets(loaderScene, game) {
    if (game.__simonPolishV15Ready) {
      installPolish(game);
      return;
    }

    if (game.__simonPolishV15Loading) return;
    game.__simonPolishV15Loading = true;

    let queued = 0;

    if (!loaderScene.textures.exists(SIMON_BOX_KEY)) {
      loaderScene.load.spritesheet(
        SIMON_BOX_KEY,
        "simon-box-spritesheet-v15.png",
        {
          frameWidth: 300,
          frameHeight: 280
        }
      );
      queued += 1;
    }

    if (!loaderScene.textures.exists(MILKMAN_KEY)) {
      loaderScene.load.spritesheet(
        MILKMAN_KEY,
        "milkman-spritesheet-v15.png",
        {
          frameWidth: 210,
          frameHeight: 200
        }
      );
      queued += 1;
    }

    const ready = () => {
      game.__simonPolishV15Loading = false;
      game.__simonPolishV15Ready = true;
      installPolish(game);
    };

    if (queued === 0) {
      ready();
      return;
    }

    loaderScene.load.once("complete", ready);

    if (!loaderScene.load.isLoading?.()) {
      loaderScene.load.start();
    }
  }

  function installPolish(game) {
    const milchbuck = game.scene.getScene?.("MilchbuckScene");
    const bahnhof = game.scene.getScene?.("BahnhofquaiScene");
    const sceneForAnimations =
      game.scene.getScenes?.(true)?.find((scene) => scene?.anims) ||
      milchbuck ||
      bahnhof;

    if (!sceneForAnimations) return;

    installAnimations(sceneForAnimations);

    // The current v21 game has no weapon/equipped-weapon system yet.
    // Its X action is the existing "simon-shoot" animation key. Replacing
    // that visual animation lets the SAME current combat logic stay intact:
    // X now looks like boxing while unarmed, including the milkman fight.
    installUnarmedBoxing(sceneForAnimations);

    // The current milkman story already lives in BahnhofquaiScene. We only
    // replace its procedural visual container with the supplied sprite and
    // attach animations to the existing encounter logic.
    patchMilkmanScene(bahnhof);

    console.info(
      "Game Polish v15 aktiv: Boxen + Milkman-Sprite auf aktuellem v21-System."
    );
  }

  function animationFrames(texture, frames) {
    return frames.map((frame) => ({ key: texture, frame }));
  }

  function createAnimation(
    scene,
    key,
    texture,
    frames,
    frameRate,
    repeat = -1
  ) {
    if (scene.anims.exists(key)) {
      scene.anims.remove(key);
    }

    scene.anims.create({
      key,
      frames: animationFrames(texture, frames),
      frameRate,
      repeat
    });
  }

  function installAnimations(scene) {
    if (scene.game.__simonPolishV15Animations) return;
    scene.game.__simonPolishV15Animations = true;

    // Simon: 5 frames in ~0.36 s, matching the current shootingUntil = 360 ms.
    createAnimation(
      scene,
      "simon-box-v15",
      SIMON_BOX_KEY,
      [0, 1, 2, 3, 4],
      14,
      0
    );

    // Milkman: deliberately slower idle/talk, faster movement/combat.
    createAnimation(
      scene,
      "milkman-v15-idle",
      MILKMAN_KEY,
      [0, 1, 2, 1],
      2.4,
      -1
    );

    createAnimation(
      scene,
      "milkman-v15-run",
      MILKMAN_KEY,
      [4, 5, 6, 7, 8, 9],
      8,
      -1
    );

    createAnimation(
      scene,
      "milkman-v15-throw",
      MILKMAN_KEY,
      [10, 11, 12, 13, 14, 15],
      9,
      0
    );

    createAnimation(
      scene,
      "milkman-v15-talk",
      MILKMAN_KEY,
      [3, 18, 18, 3],
      2.6,
      0
    );

    createAnimation(
      scene,
      "milkman-v15-hit",
      MILKMAN_KEY,
      [20, 21, 20],
      8,
      0
    );

    createAnimation(
      scene,
      "milkman-v15-ko",
      MILKMAN_KEY,
      [20, 21, 22, 23, 24],
      6,
      0
    );
  }

  function installUnarmedBoxing(scene) {
    if (scene.game.__simonPolishV15Boxing) return;
    scene.game.__simonPolishV15Boxing = true;

    // The current v21 code still calls this animation key for the X action.
    // Keep the key, swap only its frames. This means all existing controls,
    // cooldowns and damage logic continue to work unchanged.
    if (scene.anims.exists("simon-shoot")) {
      scene.anims.remove("simon-shoot");
    }

    scene.anims.create({
      key: "simon-shoot",
      frames: animationFrames(
        SIMON_BOX_KEY,
        [0, 1, 2, 3, 4]
      ),
      frameRate: 14,
      repeat: 0
    });
  }

  function patchMilkmanScene(scene) {
    if (!scene || scene.__simonPolishV15Milkman) return;

    if (
      typeof scene.createMilkman !== "function" ||
      typeof scene.updateMilkmanFight !== "function"
    ) {
      console.warn(
        "Game Polish v15: aktuelles Milchmann-System nicht gefunden; Milkman-Patch ausgelassen."
      );
      return;
    }

    scene.__simonPolishV15Milkman = true;

    const originalFace =
      typeof scene.faceMilkmanTowardSimon === "function"
        ? scene.faceMilkmanTowardSimon.bind(scene)
        : null;

    scene.createMilkman = function createMilkmanV15(x, groundY) {
      // The original procedural milkman is centred around groundY - 68.
      // Keeping the same centre makes the existing speech bubble and HP-bar
      // coordinates continue to line up.
      const milkman = this.add
        .sprite(x, groundY - 68, MILKMAN_KEY, 0)
        .setDepth(32)
        .setScale(0.78);

      milkman.__milkmanV15 = true;
      milkman.setSize(104, 184);
      milkman.play("milkman-v15-idle", true);

      if (this.player) {
        milkman.setFlipX(this.player.x < milkman.x);
      }

      return milkman;
    };

    scene.faceMilkmanTowardSimon = function faceMilkmanTowardSimonV15() {
      if (
        this.milkman?.__milkmanV15 &&
        this.player
      ) {
        // Source artwork faces RIGHT by default.
        this.milkman.setFlipX(
          this.player.x < this.milkman.x
        );
        return;
      }

      originalFace?.();
    };

    if (typeof scene.showMilkmanDialogue === "function") {
      const original =
        scene.showMilkmanDialogue.bind(scene);

      scene.showMilkmanDialogue = function showMilkmanDialogueV15(message) {
        this.faceMilkmanTowardSimon();

        const result = original(message);

        if (this.milkman?.__milkmanV15) {
          this.faceMilkmanTowardSimon();
          this.milkman.play("milkman-v15-talk", true);

          const target = this.milkman;
          target.once(
            "animationcomplete-milkman-v15-talk",
            () => {
              if (
                target.active &&
                this.milkmanDialogueActive
              ) {
                this.faceMilkmanTowardSimon();
                target.play(
                  "milkman-v15-idle",
                  true
                );
              }
            }
          );
        }

        return result;
      };
    }

    if (typeof scene.startMilkmanFight === "function") {
      const original =
        scene.startMilkmanFight.bind(scene);

      scene.startMilkmanFight = function startMilkmanFightV15(...args) {
        const result = original(...args);

        if (this.milkman?.__milkmanV15) {
          this.faceMilkmanTowardSimon();
          this.milkman.play("milkman-v15-idle", true);
        }

        return result;
      };
    }

    if (typeof scene.createMilkBottleProjectile === "function") {
      const original =
        scene.createMilkBottleProjectile.bind(scene);

      scene.createMilkBottleProjectile =
        function createMilkBottleProjectileV15(...args) {
          const milkman = this.milkman;

          if (
            !milkman?.__milkmanV15 ||
            !this.milkmanFightActive ||
            this.milkmanDefeated ||
            this.playerDying
          ) {
            return original(...args);
          }

          this.faceMilkmanTowardSimon();
          this.__milkmanV15ActionUntil =
            this.time.now + 690;

          milkman.play("milkman-v15-throw", true);

          // Spawn the existing current projectile close to the release pose,
          // rather than at the very first raised-bottle frame.
          this.time.delayedCall(285, () => {
            if (
              this.milkmanFightActive &&
              this.milkman === milkman &&
              milkman.active &&
              !this.milkmanDefeated &&
              !this.playerDying
            ) {
              original(...args);
            }
          });

          return null;
        };
    }

    if (typeof scene.updateMilkmanFight === "function") {
      const original =
        scene.updateMilkmanFight.bind(scene);

      scene.updateMilkmanFight = function updateMilkmanFightV15(time, delta) {
        const beforeX =
          this.milkman?.__milkmanV15
            ? this.milkman.x
            : null;

        const result = original(time, delta);

        const milkman = this.milkman;

        if (
          !milkman?.__milkmanV15 ||
          !milkman.active ||
          !this.milkmanFightActive ||
          this.milkmanDefeated
        ) {
          return result;
        }

        // Requirement: the milkman always looks toward Simon.
        this.faceMilkmanTowardSimon();

        const actionUntil =
          Number(this.__milkmanV15ActionUntil) || 0;

        if (time < actionUntil) {
          return result;
        }

        const moved =
          Number.isFinite(beforeX) &&
          Math.abs(milkman.x - beforeX) > 0.15;

        const desired =
          moved
            ? "milkman-v15-run"
            : "milkman-v15-idle";

        if (milkman.anims.currentAnim?.key !== desired) {
          milkman.play(desired, true);
        }

        return result;
      };
    }

    if (typeof scene.performMilkmanPunch === "function") {
      const original =
        scene.performMilkmanPunch.bind(scene);

      scene.performMilkmanPunch = function performMilkmanPunchV15(time) {
        const hpBefore = Number(this.milkmanHp);
        const result = original(time);

        if (
          this.milkman?.__milkmanV15 &&
          Number(this.milkmanHp) < hpBefore &&
          Number(this.milkmanHp) > 0
        ) {
          this.faceMilkmanTowardSimon();
          this.__milkmanV15ActionUntil =
            this.time.now + 390;

          this.milkman.play(
            "milkman-v15-hit",
            true
          );
        }

        return result;
      };
    }

    if (typeof scene.defeatMilkman === "function") {
      const original =
        scene.defeatMilkman.bind(scene);

      scene.defeatMilkman = function defeatMilkmanV15(...args) {
        const result = original(...args);

        const milkman = this.milkman;

        if (milkman?.__milkmanV15) {
          this.tweens.killTweensOf(milkman);

          // The original procedural figure was rotated on KO.
          // The supplied sheet already contains the complete fall sequence.
          milkman
            .setAngle(0)
            .setScale(0.78)
            .setY(GROUND_TOP - 74)
            .setDepth(25)
            .setSize(190, 92);

          milkman.play(
            "milkman-v15-ko",
            true
          );

          milkman.once(
            "animationcomplete-milkman-v15-ko",
            () => {
              if (milkman.active) {
                milkman.setFrame(24);
              }
            }
          );
        }

        return result;
      };
    }
  }
})();
