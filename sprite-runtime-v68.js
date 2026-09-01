(() => {
  "use strict";

  if (window.__SIMON_SPRITE_RUNTIME_V68__) return;
  window.__SIMON_SPRITE_RUNTIME_V68__ = true;

  const VERSION = 68;
  const POLL_MS = 110;

  const ASSETS = Object.freeze({
    run: Object.freeze({
      key: "simon-run-v68",
      file: "simon-run-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    drink: Object.freeze({
      key: "simon-drink-v68",
      file: "simon-drink-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    dance: Object.freeze({
      key: "simon-dance-v68",
      file: "simon-dance-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    anton: Object.freeze({
      key: "anton-master-v68",
      file: "anton-master-v62.png",
      frameWidth: 160,
      frameHeight: 160
    }),
    amsif: Object.freeze({
      key: "amsif-master-v68",
      file: "amsif-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    esthi: Object.freeze({
      key: "esthi-master-v68",
      file: "esthi-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    enrique: Object.freeze({
      key: "enrique-master-v68",
      file: "enrique-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    gandhi: Object.freeze({
      key: "gandhi-master-v68",
      file: "gandhi-master-v62.png",
      frameWidth: 220,
      frameHeight: 240
    })
  });

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

  function isGraphics(object) {
    return object?.type === "Graphics";
  }

  function textureReady(scene, key) {
    return Boolean(scene?.textures?.exists?.(key));
  }

  function loadSprites(scene) {
    if (!scene?.load) return;

    Object.values(ASSETS).forEach((asset) => {
      if (
        scene.textures?.exists?.(asset.key) ||
        scene.load?.list?.get?.(asset.key)
      ) {
        return;
      }

      scene.load.spritesheet(
        asset.key,
        asset.file,
        {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight
        }
      );
    });
  }

  function removeAnimation(anims, key) {
    if (!anims?.exists?.(key)) return;

    try {
      anims.remove(key);
    } catch {}
  }

  function animFrames(textureKey, frames) {
    return frames.map((frame) => ({
      key: textureKey,
      frame
    }));
  }

  function createAnimation(
    scene,
    key,
    textureKey,
    frames,
    frameRate,
    repeat
  ) {
    if (!scene?.anims || !textureReady(scene, textureKey)) {
      return null;
    }

    const existing = scene.anims.get?.(key);
    if (existing?.__simonSpriteV68) {
      return existing;
    }

    removeAnimation(scene.anims, key);

    const animation = scene.anims.create({
      key,
      frames: animFrames(textureKey, frames),
      frameRate,
      repeat
    });

    if (animation) {
      animation.__simonSpriteV68 = true;
    }

    return animation;
  }

  function ensureAnimations(scene) {
    if (!scene?.anims) return false;

    // IMPORTANT: the public key stays "simon-run", so every current world,
    // interior and cutscene that already calls simon-run automatically gets
    // the new artwork without changing movement mechanics.
    createAnimation(
      scene,
      "simon-run",
      ASSETS.run.key,
      [0,1,2,3,4,5,6,7,8,9],
      12,
      -1
    );

    // Existing indoor code already explicitly prefers simon-v14-dance.
    createAnimation(
      scene,
      "simon-v14-dance",
      ASSETS.dance.key,
      [0,1,2,3,4,5,6],
      8,
      -1
    );

    createAnimation(
      scene,
      "simon-dance-v68",
      ASSETS.dance.key,
      [0,1,2,3,4,5,6],
      8,
      -1
    );

    // Duplicate the sip frame so the visual stays at the mouth long enough
    // for the existing item-icon/heal tween to finish.
    createAnimation(
      scene,
      "simon-drink-v68",
      ASSETS.drink.key,
      [0,1,2,2,2,3],
      6,
      0
    );

    createAnimation(
      scene,
      "anton-idle-v68",
      ASSETS.anton.key,
      [0,1,2,3],
      2,
      -1
    );

    createAnimation(
      scene,
      "anton-meow-v68",
      ASSETS.anton.key,
      [12,13,14,15],
      6,
      0
    );

    createAnimation(
      scene,
      "amsif-idle-v68",
      ASSETS.amsif.key,
      [0,1,2,3],
      4,
      -1
    );

    createAnimation(
      scene,
      "amsif-walk-v68",
      ASSETS.amsif.key,
      [4,5,6,7],
      7,
      -1
    );

    createAnimation(
      scene,
      "amsif-story-v68",
      ASSETS.amsif.key,
      [8,9,10,11],
      5,
      0
    );

    createAnimation(
      scene,
      "esthi-idle-v68",
      ASSETS.esthi.key,
      [0,1,2,3],
      4,
      -1
    );

    createAnimation(
      scene,
      "enrique-idle-v68",
      ASSETS.enrique.key,
      [0,1,2,3],
      4,
      -1
    );

    createAnimation(
      scene,
      "enrique-teach-v68",
      ASSETS.enrique.key,
      [4,5,6,7],
      5,
      -1
    );

    createAnimation(
      scene,
      "enrique-second-look-v68",
      ASSETS.enrique.key,
      [8,9,10,11],
      6,
      0
    );

    createAnimation(
      scene,
      "gandhi-idle-v68",
      ASSETS.gandhi.key,
      [0,1,2,3,4,5],
      4,
      -1
    );

    createAnimation(
      scene,
      "gandhi-collapse-v68",
      ASSETS.gandhi.key,
      [6,7,8,9,10,11],
      6,
      0
    );

    createAnimation(
      scene,
      "dark-gandhi-idle-v68",
      ASSETS.gandhi.key,
      [12,13,14,15,16,17],
      6,
      -1
    );

    createAnimation(
      scene,
      "dark-gandhi-combat-v68",
      ASSETS.gandhi.key,
      [18,19,20,21,22,23],
      7,
      0
    );

    return true;
  }

  // -------------------------------------------------------------------------
  // Simon core animations
  // -------------------------------------------------------------------------

  function installPlayerFrameGuard(player) {
    if (!player?.setFrame || player.__spriteFrameGuardV68) return;

    const rawSetFrame = player.setFrame;

    player.setFrame = function setFrameSpriteSafeV68(
      frame,
      ...args
    ) {
      // animation-fix.js?v=10 directly selects old jump frames 19..22.
      // If Simon was running on the new texture immediately before walking
      // off an edge, force the canonical base texture before resolving those
      // old numeric frame IDs.
      if (
        typeof frame === "number" &&
        frame >= 18 &&
        frame <= 31 &&
        this.texture?.key !== "simon" &&
        this.scene?.textures?.exists?.("simon")
      ) {
        this.setTexture("simon");
      }

      return rawSetFrame.call(
        this,
        frame,
        ...args
      );
    };

    player.__spriteFrameGuardV68 = true;
  }

  function patchBasePrototype() {
    const BaseClass =
      window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;

    const proto = BaseClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.preload === "function" &&
      !proto.preload.__spriteV68
    ) {
      const originalPreload = proto.preload;

      const wrappedPreload = function preloadSpritesV68(...args) {
        const result =
          originalPreload.apply(this, args);

        loadSprites(this);
        return result;
      };

      wrappedPreload.__spriteV68 = true;
      proto.preload = wrappedPreload;
    }

    if (
      typeof proto.createAnimations === "function" &&
      !proto.createAnimations.__spriteV68
    ) {
      const originalCreateAnimations =
        proto.createAnimations;

      const wrappedCreateAnimations =
        function createAnimationsSpriteV68(...args) {
          const result =
            originalCreateAnimations.apply(this, args);

          ensureAnimations(this);
          return result;
        };

      wrappedCreateAnimations.__spriteV68 = true;
      proto.createAnimations =
        wrappedCreateAnimations;
    }

    if (
      typeof proto.createPlayer === "function" &&
      !proto.createPlayer.__spriteV68
    ) {
      const originalCreatePlayer =
        proto.createPlayer;

      const wrappedCreatePlayer =
        function createPlayerSpriteV68(...args) {
          const result =
            originalCreatePlayer.apply(this, args);

          installPlayerFrameGuard(
            this.player
          );

          return result;
        };

      wrappedCreatePlayer.__spriteV68 = true;
      proto.createPlayer =
        wrappedCreatePlayer;
    }

    if (
      typeof proto.playDrinkAnimation === "function" &&
      !proto.playDrinkAnimation.__spriteV68
    ) {
      const originalDrink =
        proto.playDrinkAnimation;

      const wrappedDrink =
        function playDrinkSpriteV68(key, ...args) {
          const result =
            originalDrink.call(this, key, ...args);

          if (
            this.drinkingItem &&
            this.player?.active &&
            this.anims?.exists?.(
              "simon-drink-v68"
            )
          ) {
            this.__spriteDrinkActiveV68 = true;
            this.player.setFlipX(
              this.facing < 0
            );
            this.player.play(
              "simon-drink-v68",
              true
            );
          }

          return result;
        };

      wrappedDrink.__spriteV68 = true;
      proto.playDrinkAnimation =
        wrappedDrink;
    }

    if (
      typeof proto.update === "function" &&
      !proto.update.__spriteV68
    ) {
      const originalUpdate = proto.update;

      const wrappedUpdate =
        function updateSpriteV68(time, delta) {
          if (
            this.drinkingItem &&
            this.__spriteDrinkActiveV68 &&
            this.player?.active &&
            this.anims?.exists?.(
              "simon-drink-v68"
            )
          ) {
            this.player.setVelocityX?.(0);
            this.player.setFlipX(
              this.facing < 0
            );

            const current =
              this.player.anims
                ?.currentAnim
                ?.key;

            if (
              current !==
              "simon-drink-v68"
            ) {
              this.player.play(
                "simon-drink-v68",
                true
              );
            } else if (
              !this.player.anims
                ?.isPlaying &&
              textureReady(
                this,
                ASSETS.drink.key
              )
            ) {
              this.player.setTexture(
                ASSETS.drink.key,
                3
              );
            }

            this.updateSprintIndicator?.();
            return;
          }

          if (
            !this.drinkingItem &&
            this.__spriteDrinkActiveV68
          ) {
            this.__spriteDrinkActiveV68 =
              false;
          }

          return originalUpdate.call(
            this,
            time,
            delta
          );
        };

      wrappedUpdate.__spriteV68 = true;
      proto.update = wrappedUpdate;
    }

    return true;
  }

  // -------------------------------------------------------------------------
  // Container visual replacement helpers
  // -------------------------------------------------------------------------

  function hideProceduralGraphics(container) {
    if (!container?.list) return;

    container.list.forEach((child) => {
      if (
        isGraphics(child) &&
        !child.__spriteKeepV68
      ) {
        child.setVisible?.(false);
      }
    });
  }

  function addSpriteAtBack(
    scene,
    container,
    x,
    y,
    texture,
    frame,
    scale
  ) {
    const sprite =
      scene.add.sprite(
        x,
        y,
        texture,
        frame
      )
        .setOrigin(0.5, 1)
        .setScale(scale);

    sprite.disableInteractive?.();

    if (typeof container.addAt === "function") {
      container.addAt(sprite, 0);
    } else {
      container.add(sprite);
    }

    return sprite;
  }

  function playMode(
    sprite,
    mode,
    animation,
    {
      fallbackTexture = null,
      fallbackFrame = 0
    } = {}
  ) {
    if (!sprite?.active) return;

    if (sprite.__spriteModeV68 === mode) {
      return;
    }

    sprite.__spriteModeV68 = mode;

    if (
      sprite.scene?.anims?.exists?.(
        animation
      )
    ) {
      sprite.play(animation, true);
      return;
    }

    if (
      fallbackTexture &&
      sprite.scene?.textures?.exists?.(
        fallbackTexture
      )
    ) {
      sprite.setTexture(
        fallbackTexture,
        fallbackFrame
      );
    }
  }

  function decorateEsthi(scene) {
    const esthi = scene?.__esthiV57;

    if (
      !esthi?.active ||
      esthi.__spriteV68 ||
      !textureReady(
        scene,
        ASSETS.esthi.key
      )
    ) {
      return;
    }

    hideProceduralGraphics(esthi);

    const sprite = addSpriteAtBack(
      scene,
      esthi,
      0,
      0,
      ASSETS.esthi.key,
      0,
      0.42
    );

    sprite.__spriteRoleV68 = "esthi";
    esthi.__spriteV68 = sprite;

    playMode(
      sprite,
      "idle",
      "esthi-idle-v68"
    );
  }

  function decorateAmsif(scene) {
    const amsif = scene?.amsif;

    if (
      !amsif?.active ||
      amsif.__spriteV68 ||
      !textureReady(
        scene,
        ASSETS.amsif.key
      )
    ) {
      return;
    }

    hideProceduralGraphics(amsif);

    const sprite = addSpriteAtBack(
      scene,
      amsif,
      0,
      74,
      ASSETS.amsif.key,
      0,
      0.48
    );

    sprite.__spriteRoleV68 = "amsif";
    amsif.__spriteV68 = sprite;
  }

  function syncAmsif(scene) {
    const amsif = scene?.amsif;
    const sprite = amsif?.__spriteV68;

    if (!sprite?.active) return;

    if (scene.amsifArrivalActive) {
      playMode(
        sprite,
        "arrival",
        "amsif-walk-v68"
      );
      return;
    }

    if (
      scene.amsifDialogueActive &&
      scene.amsifDialogueMode ===
        "story"
    ) {
      playMode(
        sprite,
        "story",
        "amsif-story-v68"
      );
      return;
    }

    playMode(
      sprite,
      "idle",
      "amsif-idle-v68"
    );
  }

  function decorateEnrique(scene) {
    const enrique =
      scene?.__sv37Enrique;

    if (
      !enrique?.active ||
      enrique.__spriteV68 ||
      !textureReady(
        scene,
        ASSETS.enrique.key
      )
    ) {
      return;
    }

    hideProceduralGraphics(enrique);

    const sprite = addSpriteAtBack(
      scene,
      enrique,
      0,
      32,
      ASSETS.enrique.key,
      0,
      0.43
    );

    sprite.__spriteRoleV68 =
      "enrique";

    enrique.__spriteV68 = sprite;
  }

  function syncEnrique(scene) {
    const sprite =
      scene?.__sv37Enrique
        ?.__spriteV68;

    if (!sprite?.active) return;

    if (scene.__sv37EnriqueModal) {
      playMode(
        sprite,
        "teach",
        "enrique-teach-v68"
      );
      return;
    }

    playMode(
      sprite,
      "idle",
      "enrique-idle-v68"
    );
  }

  function decorateGandhi(scene) {
    const gandhi = scene?.gandhi;

    if (
      !gandhi?.active ||
      gandhi.__spriteV68 ||
      !textureReady(
        scene,
        ASSETS.gandhi.key
      )
    ) {
      return;
    }

    hideProceduralGraphics(gandhi);

    const dark =
      Number(gandhi.depth) >= 45 ||
      scene.darkGandhiBossActive ||
      scene.gandhiNukePhase ===
        "reviving";

    const sprite = addSpriteAtBack(
      scene,
      gandhi,
      0,
      74,
      ASSETS.gandhi.key,
      dark ? 12 : 0,
      0.52
    );

    sprite.__spriteRoleV68 =
      dark
        ? "dark-gandhi"
        : "gandhi";

    gandhi.__spriteV68 = sprite;
  }

  function syncGandhi(scene) {
    const gandhi = scene?.gandhi;
    const sprite =
      gandhi?.__spriteV68;

    if (!sprite?.active) return;

    const dark =
      Number(gandhi.depth) >= 45 ||
      scene.darkGandhiBossActive ||
      sprite.__spriteRoleV68 ===
        "dark-gandhi";

    if (dark) {
      playMode(
        sprite,
        "dark-idle",
        "dark-gandhi-idle-v68"
      );
      return;
    }

    // game.js currently puts the normal Gandhi corpse on the ground by
    // rotating the WHOLE character container ~88 degrees. Playing the already
    // horizontal collapse frames inside that rotated container would rotate
    // them a second time. Therefore v68 deliberately keeps the normal
    // Gandhi sprite here and lets the canonical container transform perform
    // the existing fall. Frames 6–11 stay registered for a later combat-aware
    // nuke choreography.
    playMode(
      sprite,
      "idle",
      "gandhi-idle-v68"
    );
  }

  // -------------------------------------------------------------------------
  // Anton — Simon's room
  // -------------------------------------------------------------------------

  function findAntonContainer(room) {
    return room?.children?.list?.find?.(
      (object) => (
        object?.type === "Container" &&
        Math.abs(
          (Number(object.x) || 0) -
          515
        ) < 4 &&
        Math.abs(
          (Number(object.y) || 0) -
          268
        ) < 8 &&
        object.list?.some?.(isGraphics)
      )
    ) || null;
  }

  function decorateAnton(room) {
    if (
      !room?.sys?.isActive?.() ||
      room.__antonSpriteV68 ||
      !textureReady(
        room,
        ASSETS.anton.key
      )
    ) {
      return;
    }

    const anton =
      findAntonContainer(room);

    if (!anton) return;

    room.tweens?.killTweensOf?.(
      anton
    );
    anton.setY?.(268);

    hideProceduralGraphics(anton);

    const sprite = addSpriteAtBack(
      room,
      anton,
      0,
      38,
      ASSETS.anton.key,
      0,
      0.55
    );

    anton.__spriteV68 = sprite;
    room.__antonSpriteV68 = sprite;
    room.__antonContainerV68 = anton;

    playMode(
      sprite,
      "idle",
      "anton-idle-v68"
    );

    if (
      typeof room.showAnton ===
        "function" &&
      !room.showAnton.__spriteV68
    ) {
      const original =
        room.showAnton.bind(room);

      const wrapped =
        function showAntonSpriteV68(...args) {
          const result =
            original(...args);

          if (
            this.__antonSpriteV68
              ?.active
          ) {
            playMode(
              this.__antonSpriteV68,
              `meow-${Date.now()}`,
              "anton-meow-v68"
            );

            window.setTimeout(() => {
              if (
                this.__antonSpriteV68
                  ?.active &&
                this.sys?.isActive?.()
              ) {
                playMode(
                  this.__antonSpriteV68,
                  "idle",
                  "anton-idle-v68"
                );
              }
            }, 900);
          }

          return result;
        };

      wrapped.__spriteV68 = true;
      room.showAnton = wrapped;
    }
  }

  // -------------------------------------------------------------------------
  // Der Inder — preserve current DOM timing without squashing the new art
  // -------------------------------------------------------------------------

  function readOldInderCell(seller) {
    const value =
      seller?.style
        ?.backgroundPosition ||
      "0px 0px";

    const values =
      value.match(/-?\d+(?:\.\d+)?/g) ||
      ["0", "0"];

    const x =
      Number(values[0]) || 0;
    const y =
      Number(values[1]) || 0;

    return {
      col: Math.max(
        0,
        Math.min(
          3,
          Math.round(
            Math.abs(x) / 220
          )
        )
      ),
      row: Math.max(
        0,
        Math.min(
          2,
          Math.round(
            Math.abs(y) / 170
          )
        )
      )
    };
  }

  function syncInderFrame(
    seller,
    visual
  ) {
    if (
      !seller?.isConnected ||
      !visual?.isConnected
    ) {
      return;
    }

    const { row, col } =
      readOldInderCell(seller);

    visual.style.backgroundPosition =
      `${-col * 240}px ${-row * 280}px`;
  }

  function decorateInderDOM() {
    const seller = document.querySelector(
      "#phaser-game .sv37-inder-seller"
    );

    if (
      !seller ||
      seller.dataset.spriteV68 ===
        "true"
    ) {
      return;
    }

    seller.dataset.spriteV68 = "true";

    // Keep v37's own backgroundPosition values alive because they encode the
    // current row/column. Only hide its old image.
    seller.style.backgroundImage =
      "none";

    const visual =
      document.createElement("div");

    visual.dataset.simonSprite =
      "inder-v68";

    Object.assign(
      visual.style,
      {
        position: "absolute",
        left: "50%",
        bottom: "0",
        width: "240px",
        height: "280px",
        transform:
          "translateX(-50%) scale(.62)",
        transformOrigin: "50% 100%",
        backgroundImage:
          'url("inder-master-v62.png")',
        backgroundRepeat: "no-repeat",
        backgroundSize:
          "960px 840px",
        imageRendering: "pixelated",
        pointerEvents: "none",
        filter:
          "drop-shadow(0 4px 0 rgba(25,12,5,.32))"
      }
    );

    seller.appendChild(visual);
    syncInderFrame(
      seller,
      visual
    );

    const observer =
      new MutationObserver(() => {
        syncInderFrame(
          seller,
          visual
        );
      });

    observer.observe(
      seller,
      {
        attributes: true,
        attributeFilter: ["style"]
      }
    );

    seller.__spriteObserverV68 =
      observer;

    const cleanup = () => {
      if (!seller.isConnected) {
        observer.disconnect();
      }
    };

    window.setTimeout(cleanup, 1000);
  }

  // -------------------------------------------------------------------------
  // Existing HIVE dance overlay
  // -------------------------------------------------------------------------

  function syncDanceOverlay(scene) {
    const overlay =
      scene?.danceOverlay;

    if (
      !overlay?.active ||
      !scene.anims?.exists?.(
        "simon-dance-v68"
      )
    ) {
      return;
    }

    const simon =
      overlay.list?.find?.(
        (child) =>
          child?.type === "Sprite" &&
          (
            child.texture?.key ===
              "simon" ||
            child.texture?.key ===
              ASSETS.run.key ||
            child.texture?.key ===
              ASSETS.dance.key
          )
      );

    if (
      !simon?.active ||
      simon.__danceSpriteV68
    ) {
      return;
    }

    simon.__danceSpriteV68 = true;
    simon.play(
      "simon-dance-v68",
      true
    );
  }

  // -------------------------------------------------------------------------
  // Runtime watcher
  // -------------------------------------------------------------------------

  function syncScene(scene) {
    if (!scene?.sys?.isActive?.()) {
      return;
    }

    ensureAnimations(scene);

    if (scene.player?.active) {
      installPlayerFrameGuard(
        scene.player
      );
    }

    const key =
      scene.sys.settings?.key;

    if (
      key === "MilchbuckScene" ||
      key === "BahnhofquaiScene" ||
      key === "OerlikonScene"
    ) {
      syncDanceOverlay(scene);
    }

    if (key === "BahnhofquaiScene") {
      decorateAmsif(scene);
      syncAmsif(scene);

      decorateEnrique(scene);
      syncEnrique(scene);

      decorateGandhi(scene);
      syncGandhi(scene);
    }

    if (key === "OerlikonScene") {
      decorateEsthi(scene);
    }

    if (key === "SimonRoomScene") {
      decorateAnton(scene);
    }
  }

  function syncAll() {
    patchBasePrototype();

    const game = getGame();
    if (!game?.scene) {
      decorateInderDOM();
      return;
    }

    [
      "MilchbuckScene",
      "BahnhofquaiScene",
      "OerlikonScene",
      "SimonRoomScene",
      "HiveInteriorScene"
    ].forEach((key) => {
      syncScene(
        getScene(game, key)
      );
    });

    decorateInderDOM();
  }

  patchBasePrototype();
  syncAll();

  const timer =
    window.setInterval(
      syncAll,
      POLL_MS
    );

  window.SimonSpritesV68 =
    Object.freeze({
      VERSION,
      ASSETS,

      status() {
        const game = getGame();

        return {
          game: Boolean(game),
          run:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.run.key
              )
            ),
          drink:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.drink.key
              )
            ),
          dance:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.dance.key
              )
            ),
          anton:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.anton.key
              )
            ),
          amsif:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.amsif.key
              )
            ),
          esthi:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.esthi.key
              )
            ),
          enrique:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.enrique.key
              )
            ),
          gandhi:
            Boolean(
              game?.textures?.exists?.(
                ASSETS.gandhi.key
              )
            ),
          inderDOM:
            Boolean(
              document.querySelector(
                '[data-simon-sprite="inder-v68"]'
              )
            )
        };
      }
    });

  console.info(
    "Sprite Runtime v68: Simon Run/Drink/Dance + Anton/Amsif/Esthi/Enrique/Inder/Gandhi."
  );
})();
