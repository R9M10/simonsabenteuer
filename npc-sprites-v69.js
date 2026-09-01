(() => {
  "use strict";

  if (window.__SIMON_NPC_SPRITES_V69__) return;
  window.__SIMON_NPC_SPRITES_V69__ = true;

  const VERSION = 69;
  const GROUND_TOP = 338;

  const ASSETS = Object.freeze({
    anton: Object.freeze({
      key: "anton-master-v69",
      file: "anton-master-v62.png",
      frameWidth: 160,
      frameHeight: 160
    }),
    amsif: Object.freeze({
      key: "amsif-master-v69",
      file: "amsif-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    esthi: Object.freeze({
      key: "esthi-master-v69",
      file: "esthi-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    enrique: Object.freeze({
      key: "enrique-master-v69",
      file: "enrique-master-v62.png",
      frameWidth: 240,
      frameHeight: 280
    }),
    gandhi: Object.freeze({
      key: "gandhi-master-v69",
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

  function isGraphics(child) {
    return child?.type === "Graphics";
  }

  function loadNPCAssets(scene) {
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

  function makeAnimation(
    scene,
    key,
    texture,
    frames,
    frameRate,
    repeat = -1
  ) {
    if (
      !scene?.anims ||
      !scene.textures?.exists?.(texture)
    ) {
      return null;
    }

    if (scene.anims.exists(key)) {
      return scene.anims.get(key);
    }

    return scene.anims.create({
      key,
      frames: frames.map((frame) => ({
        key: texture,
        frame
      })),
      frameRate,
      repeat
    });
  }

  function ensureNPCAnimations(scene) {
    if (!scene?.anims) return;

    // Anton
    makeAnimation(
      scene,
      "anton-idle-v69",
      ASSETS.anton.key,
      [0, 1, 2, 3],
      2,
      -1
    );
    makeAnimation(
      scene,
      "anton-meow-v69",
      ASSETS.anton.key,
      [12, 13, 14, 15],
      6,
      0
    );

    // Amsif
    makeAnimation(
      scene,
      "amsif-idle-v69",
      ASSETS.amsif.key,
      [0, 1, 2, 3],
      2.6,
      -1
    );
    makeAnimation(
      scene,
      "amsif-walk-v69",
      ASSETS.amsif.key,
      [4, 5, 6, 7],
      7,
      -1
    );
    makeAnimation(
      scene,
      "amsif-story-v69",
      ASSETS.amsif.key,
      [8, 9, 10, 11],
      2.8,
      -1
    );
    makeAnimation(
      scene,
      "amsif-reward-v69",
      ASSETS.amsif.key,
      [12, 13, 14, 15],
      3.2,
      0
    );

    // Esthi
    makeAnimation(
      scene,
      "esthi-idle-v69",
      ASSETS.esthi.key,
      [0, 1, 2, 3],
      2.4,
      -1
    );

    // Enrique
    makeAnimation(
      scene,
      "enrique-idle-v69",
      ASSETS.enrique.key,
      [0, 1, 2, 3],
      2.5,
      -1
    );
    makeAnimation(
      scene,
      "enrique-explain-v69",
      ASSETS.enrique.key,
      [4, 5, 6, 7],
      3.4,
      -1
    );
    makeAnimation(
      scene,
      "enrique-second-look-v69",
      ASSETS.enrique.key,
      [8, 9, 10, 11],
      3.0,
      -1
    );
    makeAnimation(
      scene,
      "enrique-reaction-v69",
      ASSETS.enrique.key,
      [12, 13, 14, 15],
      3.4,
      0
    );

    // Gandhi
    makeAnimation(
      scene,
      "gandhi-idle-v69",
      ASSETS.gandhi.key,
      [0, 1, 2, 3, 4, 5],
      2.4,
      -1
    );
    makeAnimation(
      scene,
      "gandhi-collapse-v69",
      ASSETS.gandhi.key,
      [6, 7, 8, 9, 10, 11],
      6.2,
      0
    );
    makeAnimation(
      scene,
      "dark-gandhi-idle-v69",
      ASSETS.gandhi.key,
      [12, 13, 14, 15, 16, 17],
      4.2,
      -1
    );
    makeAnimation(
      scene,
      "dark-gandhi-attack-v69",
      ASSETS.gandhi.key,
      [18, 19, 20, 21],
      8,
      0
    );
    makeAnimation(
      scene,
      "dark-gandhi-down-v69",
      ASSETS.gandhi.key,
      [22, 23],
      4,
      0
    );
  }

  // -----------------------------------------------------------------------
  // Visible NPC layer
  // -----------------------------------------------------------------------

  function hideProceduralBody(owner) {
    if (!owner?.list) return;

    owner.list.forEach((child) => {
      if (isGraphics(child)) {
        child.setVisible?.(false);
      }
    });
  }

  function destroyOwnerVisual(owner) {
    const sprite = owner?.__npcSpriteV69;

    if (sprite?.active) {
      sprite.destroy();
    }

    if (owner) {
      owner.__npcSpriteV69 = null;
    }
  }

  function installDestroyLink(owner) {
    if (
      !owner?.destroy ||
      owner.__npcDestroyLinkedV69
    ) {
      return;
    }

    const originalDestroy = owner.destroy;

    owner.destroy = function destroyWithNPCSpriteV69(...args) {
      destroyOwnerVisual(this);
      return originalDestroy.apply(this, args);
    };

    owner.__npcDestroyLinkedV69 = true;
  }

  function createDetachedVisual(
    scene,
    owner,
    {
      texture,
      frame,
      scale,
      footOffset,
      depthOffset = 1,
      role
    }
  ) {
    if (
      !scene?.add ||
      !owner?.active ||
      !scene.textures?.exists?.(texture)
    ) {
      return null;
    }

    destroyOwnerVisual(owner);
    hideProceduralBody(owner);

    const sprite = scene.add.sprite(
      owner.x,
      owner.y + footOffset,
      texture,
      frame
    )
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth((Number(owner.depth) || 0) + depthOffset);

    sprite.__npcRoleV69 = role;
    sprite.__npcBaseScaleV69 = scale;
    sprite.__npcFootOffsetV69 = footOffset;
    sprite.__npcDepthOffsetV69 = depthOffset;
    sprite.__npcModeV69 = null;

    owner.__npcSpriteV69 = sprite;
    installDestroyLink(owner);

    return sprite;
  }

  function syncDetachedVisual(
    owner,
    {
      footOffset = null,
      angle = null,
      alpha = null,
      visible = null,
      flipX = null,
      y = null,
      x = null,
      scaleMultiplier = null
    } = {}
  ) {
    const sprite = owner?.__npcSpriteV69;
    if (!sprite?.active) return null;

    const baseScale =
      Number(sprite.__npcBaseScaleV69) || 1;

    const ownerScale =
      Number.isFinite(scaleMultiplier)
        ? scaleMultiplier
        : Math.abs(Number(owner.scaleY) || 1);

    sprite.setScale(baseScale * ownerScale);

    sprite.setPosition(
      Number.isFinite(x) ? x : owner.x,
      Number.isFinite(y)
        ? y
        : owner.y + (
            Number.isFinite(footOffset)
              ? footOffset
              : (Number(sprite.__npcFootOffsetV69) || 0)
          )
    );

    sprite.setDepth(
      (Number(owner.depth) || 0) +
      (Number(sprite.__npcDepthOffsetV69) || 1)
    );

    sprite.setVisible(
      visible === null
        ? owner.visible !== false
        : Boolean(visible)
    );

    sprite.setAlpha(
      alpha === null
        ? (Number.isFinite(owner.alpha) ? owner.alpha : 1)
        : alpha
    );

    sprite.setAngle(
      angle === null
        ? (Number(owner.angle) || 0)
        : angle
    );

    sprite.setFlipX(
      flipX === null
        ? (Number(owner.scaleX) || 1) < 0
        : Boolean(flipX)
    );

    return sprite;
  }

  function setAnimation(sprite, mode, animation, restart = false) {
    if (!sprite?.active) return;

    if (
      !restart &&
      sprite.__npcModeV69 === mode
    ) {
      return;
    }

    sprite.__npcModeV69 = mode;

    if (sprite.scene?.anims?.exists?.(animation)) {
      sprite.play(animation, true);
    }
  }

  // -----------------------------------------------------------------------
  // AMSIF
  // -----------------------------------------------------------------------

  function decorateAmsif(scene, amsif) {
    if (
      !amsif?.active ||
      amsif.__npcSpriteV69 ||
      !scene?.textures?.exists?.(ASSETS.amsif.key)
    ) {
      return amsif;
    }

    const sprite = createDetachedVisual(
      scene,
      amsif,
      {
        texture: ASSETS.amsif.key,
        frame: 0,
        scale: 0.48,
        footOffset: 74,
        depthOffset: 1,
        role: "amsif"
      }
    );

    setAnimation(
      sprite,
      "idle",
      "amsif-idle-v69"
    );

    return amsif;
  }

  function syncAmsif(scene) {
    const amsif = scene?.amsif;
    if (!amsif?.active) return;

    decorateAmsif(scene, amsif);
    const sprite = amsif.__npcSpriteV69;
    if (!sprite?.active) return;

    const arriving =
      Boolean(scene.amsifArrivalActive);

    const story =
      Boolean(
        scene.amsifDialogueActive &&
        scene.amsifDialogueMode === "story"
      );

    // Amsif enters from the RIGHT and walks LEFT toward the shoe shop.
    // His sheet faces right natively, therefore arrival must be flipped.
    const arrivalFlip =
      arriving ? true : null;

    syncDetachedVisual(
      amsif,
      {
        footOffset: 74,
        flipX: arrivalFlip
      }
    );

    if (arriving) {
      setAnimation(
        sprite,
        "walk",
        "amsif-walk-v69"
      );
      return;
    }

    if (story) {
      // The third row is expressive storytelling: pointing, looking down,
      // gesturing upward. It loops slowly only while Amsif tells his story.
      setAnimation(
        sprite,
        "story",
        "amsif-story-v69"
      );
      return;
    }

    // Intro, menu and ordinary waiting use the quiet talk/idle row.
    setAnimation(
      sprite,
      "idle",
      "amsif-idle-v69"
    );
  }

  // -----------------------------------------------------------------------
  // ENRIQUE
  // -----------------------------------------------------------------------

  function decorateEnrique(scene, enrique) {
    if (
      !enrique?.active ||
      enrique.__npcSpriteV69 ||
      !scene?.textures?.exists?.(ASSETS.enrique.key)
    ) {
      return enrique;
    }

    const sprite = createDetachedVisual(
      scene,
      enrique,
      {
        texture: ASSETS.enrique.key,
        frame: 0,
        scale: 0.47,
        footOffset: 31,
        // Zofingia's overlay is at depth 700. Enrique's detached visible
        // sprite must explicitly live above that overlay.
        depthOffset: 2,
        role: "enrique"
      }
    );

    sprite.setDepth(738);

    setAnimation(
      sprite,
      "idle",
      "enrique-idle-v69"
    );

    return enrique;
  }

  function syncEnrique(scene) {
    const enrique = scene?.__sv37Enrique;

    if (
      !scene?.__sv37ZofingiaOpen ||
      !enrique?.active
    ) {
      if (
        scene?.__npcEnriqueVisualV69?.active
      ) {
        scene.__npcEnriqueVisualV69.destroy();
      }
      scene.__npcEnriqueVisualV69 = null;
      return;
    }

    decorateEnrique(scene, enrique);

    const sprite =
      enrique.__npcSpriteV69;

    if (!sprite?.active) return;

    scene.__npcEnriqueVisualV69 = sprite;

    const simon =
      scene.__sv37ClubSimon;

    // Native Enrique art faces RIGHT.
    // When Simon is left of him, Enrique must face LEFT.
    const shouldFlip =
      Boolean(
        simon?.active &&
        simon.x < enrique.x
      );

    syncDetachedVisual(
      enrique,
      {
        footOffset: 31,
        flipX: shouldFlip,
        angle: 0,
        scaleMultiplier: 1
      }
    );

    // Detached visual must remain above the Zofingia overlay regardless of
    // the child-container depth rules inside that overlay.
    sprite.setDepth(738);

    const modal =
      scene.__sv37EnriqueModal;

    const sequence =
      Boolean(
        modal?.__flirtSequenceV46
      );

    if (
      sequence &&
      !scene.enriqueSpoken
    ) {
      // First Enrique encounter = "Der zweite Blick".
      // Row 3 is the deliberately cool glance/pose sequence.
      setAnimation(
        sprite,
        "second-look",
        "enrique-second-look-v69"
      );
      return;
    }

    if (sequence || modal) {
      // Paid explanations and Enrique's normal menu use row 2:
      // finger up, open hand, pointing, explaining.
      setAnimation(
        sprite,
        "explain",
        "enrique-explain-v69"
      );
      return;
    }

    setAnimation(
      sprite,
      "idle",
      "enrique-idle-v69"
    );
  }

  // -----------------------------------------------------------------------
  // GANDHI / DARK GANDHI
  // -----------------------------------------------------------------------

  function decorateGandhi(scene, gandhi, role = "gandhi") {
    if (
      !gandhi?.active ||
      gandhi.__npcSpriteV69 ||
      !scene?.textures?.exists?.(ASSETS.gandhi.key)
    ) {
      return gandhi;
    }

    const dark = role === "dark-gandhi";

    const sprite = createDetachedVisual(
      scene,
      gandhi,
      {
        texture: ASSETS.gandhi.key,
        frame: dark ? 12 : 0,
        scale: dark ? 0.57 : 0.56,
        footOffset: dark ? 74 : 74,
        depthOffset: 1,
        role
      }
    );

    gandhi.__npcRoleV69 = role;

    setAnimation(
      sprite,
      dark ? "dark-idle" : "idle",
      dark
        ? "dark-gandhi-idle-v69"
        : "gandhi-idle-v69"
    );

    return gandhi;
  }

  function syncGandhi(scene) {
    const gandhi = scene?.gandhi;
    if (!gandhi?.active) return;

    const dark =
      gandhi.__npcRoleV69 === "dark-gandhi" ||
      Number(gandhi.depth) >= 45 ||
      Boolean(scene.darkGandhiBossActive);

    decorateGandhi(
      scene,
      gandhi,
      dark ? "dark-gandhi" : "gandhi"
    );

    const sprite = gandhi.__npcSpriteV69;
    if (!sprite?.active) return;

    if (!dark) {
      const collapsed =
        Boolean(
          scene.gandhiNukeActive &&
          (
            scene.gandhiNukePhase === "exploded" ||
            scene.gandhiNukePhase === "reviving"
          )
        );

      if (collapsed) {
        // IMPORTANT: game.js rotates the procedural Gandhi container ~88°.
        // The production sheet ALREADY contains the complete fall. Because
        // this v69 sprite is detached from the container, it can stay upright
        // in world coordinates and play the real collapse without double-
        // rotation.
        syncDetachedVisual(
          gandhi,
          {
            x: gandhi.x,
            y: GROUND_TOP - 2,
            angle: 0,
            alpha: 1,
            flipX: (Number(gandhi.scaleX) || 1) < 0,
            scaleMultiplier: 1
          }
        );

        setAnimation(
          sprite,
          "collapse",
          "gandhi-collapse-v69"
        );
        return;
      }

      syncDetachedVisual(
        gandhi,
        {
          footOffset: 74
        }
      );

      setAnimation(
        sprite,
        "idle",
        "gandhi-idle-v69"
      );
      return;
    }

    // Dark Gandhi follows the existing boss container for position/facing,
    // but uses his dedicated dark row.
    syncDetachedVisual(
      gandhi,
      {
        footOffset: 74,
        angle: 0
      }
    );

    const now =
      Number(scene.time?.now) || 0;

    if (
      Number(gandhi.__npcAttackUntilV69) > now
    ) {
      const token =
        Number(gandhi.__npcAttackTokenV69) || 0;

      setAnimation(
        sprite,
        `attack-${token}`,
        "dark-gandhi-attack-v69"
      );
      return;
    }

    if (scene.darkGandhiDefeated) {
      setAnimation(
        sprite,
        "down",
        "dark-gandhi-down-v69"
      );
      return;
    }

    setAnimation(
      sprite,
      "dark-idle",
      "dark-gandhi-idle-v69"
    );
  }

  // -----------------------------------------------------------------------
  // Bahnhofstrasse hooks — direct, not polling-based
  // -----------------------------------------------------------------------

  function patchBahnhofClass() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;

    const proto = SceneClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.createAmsif === "function" &&
      !proto.createAmsif.__npcV69
    ) {
      const original = proto.createAmsif;

      const wrapped = function createAmsifV69(...args) {
        const amsif =
          original.apply(this, args);

        ensureNPCAnimations(this);
        decorateAmsif(this, amsif);
        return amsif;
      };

      wrapped.__npcV69 = true;
      proto.createAmsif = wrapped;
    }

    if (
      typeof proto.createGandhi === "function" &&
      !proto.createGandhi.__npcV69
    ) {
      const original = proto.createGandhi;

      const wrapped = function createGandhiV69(...args) {
        const gandhi =
          original.apply(this, args);

        ensureNPCAnimations(this);
        decorateGandhi(
          this,
          gandhi,
          "gandhi"
        );
        return gandhi;
      };

      wrapped.__npcV69 = true;
      proto.createGandhi = wrapped;
    }

    if (
      typeof proto.createDarkGandhi === "function" &&
      !proto.createDarkGandhi.__npcV69
    ) {
      const original = proto.createDarkGandhi;

      const wrapped = function createDarkGandhiV69(...args) {
        const gandhi =
          original.apply(this, args);

        ensureNPCAnimations(this);
        decorateGandhi(
          this,
          gandhi,
          "dark-gandhi"
        );
        return gandhi;
      };

      wrapped.__npcV69 = true;
      proto.createDarkGandhi = wrapped;
    }

    if (
      typeof proto.darkGandhiStaffAttack === "function" &&
      !proto.darkGandhiStaffAttack.__npcV69
    ) {
      const original =
        proto.darkGandhiStaffAttack;

      const wrapped =
        function darkGandhiStaffAttackV69(...args) {
          if (this.gandhi?.active) {
            this.gandhi.__npcAttackTokenV69 =
              (Number(
                this.gandhi.__npcAttackTokenV69
              ) || 0) + 1;

            this.gandhi.__npcAttackUntilV69 =
              (Number(this.time?.now) || 0) +
              650;
          }

          return original.apply(
            this,
            args
          );
        };

      wrapped.__npcV69 = true;
      proto.darkGandhiStaffAttack = wrapped;
    }

    if (
      typeof proto.purchaseStoreItem === "function" &&
      !proto.purchaseStoreItem.__npcV69
    ) {
      const original =
        proto.purchaseStoreItem;

      const wrapped =
        function purchaseStoreItemV69(itemKey, ...args) {
          const before =
            Number(
              this.getItemCount?.(itemKey)
            ) || 0;

          const result =
            original.call(
              this,
              itemKey,
              ...args
            );

          const after =
            Number(
              this.getItemCount?.(itemKey)
            ) || 0;

          if (
            this.indianStoreOverlay &&
            after > before &&
            (
              itemKey === "gatorade" ||
              itemKey === "monster"
            )
          ) {
            playInderServeSequence();
          }

          return result;
        };

      wrapped.__npcV69 = true;
      proto.purchaseStoreItem = wrapped;
    }

    if (
      typeof proto.update === "function" &&
      !proto.update.__npcV69
    ) {
      const original = proto.update;

      const wrapped =
        function updateNPCSpritesV69(time, delta) {
          const result =
            original.call(
              this,
              time,
              delta
            );

          ensureNPCAnimations(this);
          syncAmsif(this);
          syncEnrique(this);
          syncGandhi(this);
          syncInderDOM();

          return result;
        };

      wrapped.__npcV69 = true;
      proto.update = wrapped;
    }

    return true;
  }

  // -----------------------------------------------------------------------
  // Base preload / animation registration
  // NO SIMON ANIMATION IS MODIFIED HERE.
  // -----------------------------------------------------------------------

  function patchBaseScene() {
    const BaseClass =
      window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;

    const proto = BaseClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.preload === "function" &&
      !proto.preload.__npcV69
    ) {
      const original = proto.preload;

      const wrapped =
        function preloadNPCV69(...args) {
          const result =
            original.apply(this, args);

          loadNPCAssets(this);
          return result;
        };

      wrapped.__npcV69 = true;
      proto.preload = wrapped;
    }

    if (
      typeof proto.createAnimations === "function" &&
      !proto.createAnimations.__npcV69
    ) {
      const original =
        proto.createAnimations;

      const wrapped =
        function createAnimationsNPCV69(...args) {
          const result =
            original.apply(this, args);

          ensureNPCAnimations(this);
          return result;
        };

      wrapped.__npcV69 = true;
      proto.createAnimations = wrapped;
    }

    return true;
  }

  // -----------------------------------------------------------------------
  // ESTHI — preserve v68's NPC improvement without touching Simon
  // -----------------------------------------------------------------------

  function decorateEsthi(scene) {
    const esthi = scene?.__esthiV57;

    if (
      !esthi?.active ||
      esthi.__npcSpriteV69 ||
      !scene?.textures?.exists?.(ASSETS.esthi.key)
    ) {
      return;
    }

    const sprite = createDetachedVisual(
      scene,
      esthi,
      {
        texture: ASSETS.esthi.key,
        frame: 0,
        scale: 0.47,
        footOffset: 0,
        depthOffset: 1,
        role: "esthi"
      }
    );

    setAnimation(
      sprite,
      "idle",
      "esthi-idle-v69"
    );
  }

  function syncEsthi(scene) {
    const esthi = scene?.__esthiV57;
    if (!esthi?.active) return;

    decorateEsthi(scene);

    const sprite = esthi.__npcSpriteV69;
    if (!sprite?.active) return;

    // Esthi's v57 container already uses its y-coordinate as the ground/feet
    // point, so footOffset is intentionally 0.
    const player = scene.player;
    const flip =
      player?.active
        ? player.x < esthi.x
        : false;

    syncDetachedVisual(
      esthi,
      {
        footOffset: 0,
        flipX: flip,
        angle: 0,
        scaleMultiplier: 1
      }
    );

    setAnimation(
      sprite,
      "idle",
      "esthi-idle-v69"
    );
  }

  function patchOerlikonClass() {
    const SceneClass =
      window.__SIMON_OERLIKON_SCENE_CLASS__;

    const proto = SceneClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.update === "function" &&
      !proto.update.__npcV69
    ) {
      const original = proto.update;

      const wrapped =
        function updateOerlikonNPCV69(time, delta) {
          const result =
            original.call(
              this,
              time,
              delta
            );

          ensureNPCAnimations(this);
          syncEsthi(this);
          return result;
        };

      wrapped.__npcV69 = true;
      proto.update = wrapped;
    }

    return true;
  }

  // -----------------------------------------------------------------------
  // ANTON — SimonRoomScene is registered dynamically by oerlikon-v59.
  // A very small scene-registration watcher is used only for this room.
  // -----------------------------------------------------------------------

  function findAntonContainer(room) {
    return room?.children?.list?.find?.(
      (object) => (
        object?.type === "Container" &&
        Math.abs((Number(object.x) || 0) - 515) < 5 &&
        Math.abs((Number(object.y) || 0) - 268) < 10 &&
        object.list?.some?.(isGraphics)
      )
    ) || null;
  }

  function syncAntonRoom() {
    const game = getGame();
    const room =
      getScene(
        game,
        "SimonRoomScene"
      );

    if (!room?.sys?.isActive?.()) {
      return;
    }

    ensureNPCAnimations(room);

    if (!room.__npcAntonV69) {
      const anton =
        findAntonContainer(room);

      if (
        !anton?.active ||
        !room.textures?.exists?.(
          ASSETS.anton.key
        )
      ) {
        return;
      }

      room.tweens?.killTweensOf?.(
        anton
      );
      anton.setY?.(268);

      hideProceduralBody(anton);

      const sprite =
        createDetachedVisual(
          room,
          anton,
          {
            texture: ASSETS.anton.key,
            frame: 0,
            scale: 0.55,
            footOffset: 38,
            depthOffset: 1,
            role: "anton"
          }
        );

      setAnimation(
        sprite,
        "idle",
        "anton-idle-v69"
      );

      room.__npcAntonV69 = sprite;

      if (
        typeof room.showAnton === "function" &&
        !room.showAnton.__npcV69
      ) {
        const original =
          room.showAnton.bind(room);

        const wrapped =
          function showAntonV69(...args) {
            const result =
              original(...args);

            const current =
              this.__npcAntonV69;

            if (current?.active) {
              setAnimation(
                current,
                `meow-${Date.now()}`,
                "anton-meow-v69",
                true
              );

              window.setTimeout(
                () => {
                  if (
                    this.__npcAntonV69?.active &&
                    this.sys?.isActive?.()
                  ) {
                    setAnimation(
                      this.__npcAntonV69,
                      "idle",
                      "anton-idle-v69"
                    );
                  }
                },
                900
              );
            }

            return result;
          };

        wrapped.__npcV69 = true;
        room.showAnton = wrapped;
      }
    }

    const anton =
      findAntonContainer(room);

    if (
      anton?.active &&
      anton.__npcSpriteV69?.active
    ) {
      syncDetachedVisual(
        anton,
        {
          footOffset: 38,
          angle: 0,
          scaleMultiplier: 1
        }
      );
    }
  }

  // -----------------------------------------------------------------------
  // DER INDER — current seller is DOM, not Phaser.
  // v69 gives him a dedicated 240×280 visual layer instead of attempting
  // to reuse v37's old 220×170 background coordinates.
  // -----------------------------------------------------------------------

  let inderState = {
    frame: 0,
    idleIndex: 0,
    nextIdleAt: 0,
    sequence: null,
    sequenceIndex: 0,
    nextSequenceAt: 0
  };

  const INDER_IDLE = [0, 1, 0, 3, 0, 2];
  const INDER_SERVE = [4, 5, 6, 7];

  function setInderFrame(frame) {
    const visual = document.querySelector(
      '[data-simon-sprite="inder-v69"]'
    );

    if (!visual) return;

    const index =
      Math.max(
        0,
        Math.min(
          11,
          Number(frame) || 0
        )
      );

    const row =
      Math.floor(index / 4);
    const col =
      index % 4;

    visual.style.backgroundPosition =
      `${-col * 240}px ${-row * 280}px`;

    inderState.frame = index;
  }

  function playInderServeSequence() {
    inderState.sequence =
      [...INDER_SERVE];

    inderState.sequenceIndex = 0;
    inderState.nextSequenceAt =
      performance.now();

    setInderFrame(
      inderState.sequence[0]
    );
  }

  function createInderVisual(room, seller) {
    if (
      !room ||
      !seller ||
      room.querySelector(
        '[data-simon-sprite="inder-v69"]'
      )
    ) {
      return;
    }

    // Existing v37 seller remains the click target, but becomes visually
    // transparent. Its old 220×170 animation can no longer interfere.
    seller.style.backgroundImage = "none";
    seller.style.zIndex = "5";

    const visual =
      document.createElement("div");

    visual.dataset.simonSprite =
      "inder-v69";

    Object.assign(
      visual.style,
      {
        position: "absolute",
        left: "290px",
        top: "-10px",
        width: "240px",
        height: "280px",
        zIndex: "4",
        backgroundImage:
          'url("inder-master-v62.png?v=69")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "960px 840px",
        backgroundPosition: "0 0",
        imageRendering: "pixelated",
        transform: "scale(.75)",
        transformOrigin: "50% 100%",
        pointerEvents: "none",
        userSelect: "none",
        filter:
          "drop-shadow(0 4px 0 rgba(25,12,5,.28))"
      }
    );

    room.appendChild(visual);

    inderState.idleIndex = 0;
    inderState.sequence = null;
    inderState.nextIdleAt =
      performance.now() + 450;

    setInderFrame(0);
  }

  function syncInderDOM() {
    const room = document.querySelector(
      '#phaser-game [data-simon-ui="inder-v37-room"]'
    );

    const seller =
      room?.querySelector?.(
        ".sv37-inder-seller"
      );

    if (!room || !seller) {
      return;
    }

    createInderVisual(
      room,
      seller
    );

    const visual =
      room.querySelector(
        '[data-simon-sprite="inder-v69"]'
      );

    if (!visual) return;

    const now = performance.now();

    if (inderState.sequence) {
      if (
        now >=
        inderState.nextSequenceAt
      ) {
        const frame =
          inderState.sequence[
            inderState.sequenceIndex
          ];

        setInderFrame(frame);

        inderState.sequenceIndex += 1;
        inderState.nextSequenceAt =
          now + 330;

        if (
          inderState.sequenceIndex >=
          inderState.sequence.length
        ) {
          inderState.sequence = null;
          inderState.sequenceIndex = 0;
          inderState.nextIdleAt =
            now + 420;
        }
      }

      return;
    }

    if (now < inderState.nextIdleAt) {
      return;
    }

    inderState.idleIndex =
      (
        inderState.idleIndex + 1
      ) % INDER_IDLE.length;

    setInderFrame(
      INDER_IDLE[
        inderState.idleIndex
      ]
    );

    inderState.nextIdleAt =
      now + 720;
  }

  // -----------------------------------------------------------------------
  // Installation
  // -----------------------------------------------------------------------

  patchBaseScene();
  patchBahnhofClass();
  patchOerlikonClass();

  // Retry class hooks until all script-created classes are available.
  const installTimer =
    window.setInterval(
      () => {
        patchBaseScene();
        patchBahnhofClass();
        patchOerlikonClass();
        syncInderDOM();
        syncAntonRoom();
      },
      180
    );

  window.SimonNPCSpritesV69 =
    Object.freeze({
      VERSION,

      status() {
        const game = getGame();
        const bahnhof =
          getScene(
            game,
            "BahnhofquaiScene"
          );

        return {
          simonAnimationsModified: false,
          amsif: Boolean(
            bahnhof?.amsif
              ?.__npcSpriteV69?.active
          ),
          enrique: Boolean(
            bahnhof?.__sv37Enrique
              ?.__npcSpriteV69?.active
          ),
          gandhi: Boolean(
            bahnhof?.gandhi
              ?.__npcSpriteV69?.active
          ),
          inder: Boolean(
            document.querySelector(
              '[data-simon-sprite="inder-v69"]'
            )
          ),
          esthi: Boolean(
            getScene(
              game,
              "OerlikonScene"
            )?.__esthiV57
              ?.__npcSpriteV69?.active
          ),
          anton: Boolean(
            getScene(
              game,
              "SimonRoomScene"
            )?.__npcAntonV69?.active
          )
        };
      }
    });

  console.info(
    "NPC Sprites v69: Simon unverändert; Amsif/Enrique/Gandhi/Inder direkt integriert."
  );
})();
