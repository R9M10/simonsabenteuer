(() => {
  "use strict";

  if (window.__SIMON_NPC_ESSENTIAL_V75__) return;
  window.__SIMON_NPC_ESSENTIAL_V75__ = true;

  const VERSION = 75;
  const ASSETS = Object.freeze({
    anton: { key: "anton-master-v75", file: "anton-master-v62.png", frameWidth: 160, frameHeight: 160 },
    esthi: { key: "esthi-master-v75", file: "esthi-master-v62.png", frameWidth: 240, frameHeight: 280 },
    gandhi: { key: "gandhi-master-v75", file: "gandhi-master-v62.png", frameWidth: 220, frameHeight: 240 }
  });

  function getGame() {
    return window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ || null;
  }

  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; }
    catch { return null; }
  }

  function isGraphics(child) {
    return child?.type === "Graphics";
  }

  function queueAssets(scene) {
    if (!scene?.load) return;
    Object.values(ASSETS).forEach((asset) => {
      if (scene.textures?.exists?.(asset.key) || scene.load?.list?.get?.(asset.key)) return;
      scene.load.spritesheet(asset.key, asset.file, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight
      });
    });
  }

  function makeAnimation(scene, key, texture, frames, frameRate, repeat = -1) {
    if (!scene?.anims || !scene.textures?.exists?.(texture) || scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: texture, frame })),
      frameRate,
      repeat
    });
  }

  function ensureAnimations(scene) {
    makeAnimation(scene, "anton-idle-v75", ASSETS.anton.key, [0,1,2,3], 2, -1);
    makeAnimation(scene, "anton-meow-v75", ASSETS.anton.key, [12,13,14,15], 6, 0);
    makeAnimation(scene, "esthi-idle-v75", ASSETS.esthi.key, [0,1,2,3], 2.4, -1);
    makeAnimation(scene, "gandhi-idle-v75", ASSETS.gandhi.key, [0,1,2,3,4,5], 2.4, -1);
    makeAnimation(scene, "gandhi-collapse-v75", ASSETS.gandhi.key, [6,7,8,9,10,11], 6.2, 0);
    makeAnimation(scene, "dark-gandhi-idle-v75", ASSETS.gandhi.key, [12,13,14,15,16,17], 4.2, -1);
    makeAnimation(scene, "dark-gandhi-down-v75", ASSETS.gandhi.key, [22,23], 4, 0);
  }

  function hideGraphics(owner) {
    owner?.list?.forEach?.((child) => {
      if (isGraphics(child)) child.setVisible?.(false);
    });
  }

  function restoreGraphics(owner) {
    owner?.list?.forEach?.((child) => {
      if (!isGraphics(child)) return;
      child.setVisible?.(true);
      child.setAlpha?.(1);
    });
  }

  function installBasePreload() {
    const proto = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene?.prototype;
    if (!proto || typeof proto.preload !== "function") return false;
    if (proto.preload.__npcEssentialV75) return true;

    const original = proto.preload;
    const wrapped = function preloadNPCEssentialV75(...args) {
      const result = original.apply(this, args);
      queueAssets(this);
      return result;
    };
    wrapped.__npcEssentialV75 = true;
    proto.preload = wrapped;
    return true;
  }

  function createDetached(scene, owner, texture, scale, footOffset, depthOffset = 2, frame = 0) {
    if (!scene?.add || !owner?.active || !scene.textures?.exists?.(texture)) return null;
    if (owner.__npcSpriteV75?.active) return owner.__npcSpriteV75;

    hideGraphics(owner);
    const sprite = scene.add.sprite(owner.x, owner.y + footOffset, texture, frame)
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth((Number(owner.depth) || 0) + depthOffset);

    sprite.__baseScaleV75 = scale;
    sprite.__footOffsetV75 = footOffset;
    sprite.__depthOffsetV75 = depthOffset;
    sprite.__modeV75 = null;
    owner.__npcSpriteV75 = sprite;

    if (owner.destroy && !owner.__npcDestroyV75) {
      const originalDestroy = owner.destroy;
      owner.destroy = function destroyWithSpriteV75(...args) {
        try { this.__npcSpriteV75?.destroy?.(); } catch {}
        this.__npcSpriteV75 = null;
        return originalDestroy.apply(this, args);
      };
      owner.__npcDestroyV75 = true;
    }

    return sprite;
  }

  function syncDetached(owner, { footOffset, flipX, y = null, angle = 0 } = {}) {
    const sprite = owner?.__npcSpriteV75;
    if (!sprite?.active || !owner?.active) return null;

    const offset = Number.isFinite(footOffset)
      ? footOffset
      : (Number(sprite.__footOffsetV75) || 0);

    sprite.setPosition(owner.x, Number.isFinite(y) ? y : owner.y + offset);
    sprite.setDepth((Number(owner.depth) || 0) + (Number(sprite.__depthOffsetV75) || 2));
    sprite.setAngle(angle);
    sprite.setVisible(owner.visible !== false);
    sprite.setAlpha(Number.isFinite(owner.alpha) ? owner.alpha : 1);
    sprite.setFlipX(flipX === undefined ? ((Number(owner.scaleX) || 1) < 0) : Boolean(flipX));
    return sprite;
  }

  function playMode(sprite, mode, animation) {
    if (!sprite?.active || sprite.__modeV75 === mode) return;
    sprite.__modeV75 = mode;
    sprite.play?.(animation, true);
  }

  function syncEsthi() {
    const scene = getScene("OerlikonScene");
    const esthi = scene?.__esthiV57;
    if (!scene?.sys?.isActive?.() || !esthi?.active || !scene.textures?.exists?.(ASSETS.esthi.key)) return;

    ensureAnimations(scene);
    const sprite = createDetached(scene, esthi, ASSETS.esthi.key, 0.47, 0, 2);
    if (!sprite) return;

    syncDetached(esthi, {
      footOffset: 0,
      flipX: scene.player?.active ? scene.player.x < esthi.x : false
    });
    playMode(sprite, "idle", "esthi-idle-v75");
  }

  function syncGandhi() {
    const scene = getScene("BahnhofquaiScene");
    const gandhi = scene?.gandhi;
    if (!scene?.sys?.isActive?.() || !gandhi?.active || !scene.textures?.exists?.(ASSETS.gandhi.key)) return;

    ensureAnimations(scene);
    const dark = Number(gandhi.depth) >= 45 || Boolean(scene.darkGandhiBossActive);
    const sprite = createDetached(scene, gandhi, ASSETS.gandhi.key, dark ? 0.57 : 0.56, 74, 2, dark ? 12 : 0);
    if (!sprite) return;

    if (!dark) {
      const collapsed = Boolean(scene.gandhiNukeActive && (scene.gandhiNukePhase === "exploded" || scene.gandhiNukePhase === "reviving"));
      if (collapsed) {
        syncDetached(gandhi, { y: 336, footOffset: 0, angle: 0 });
        playMode(sprite, "collapse", "gandhi-collapse-v75");
        return;
      }
      syncDetached(gandhi, { footOffset: 74 });
      playMode(sprite, "idle", "gandhi-idle-v75");
      return;
    }

    syncDetached(gandhi, { footOffset: 74, angle: 0 });
    playMode(sprite, scene.darkGandhiDefeated ? "down" : "dark", scene.darkGandhiDefeated ? "dark-gandhi-down-v75" : "dark-gandhi-idle-v75");
  }

  function findAnton(room) {
    return room?.children?.list?.find?.((object) => (
      object?.type === "Container" &&
      Math.abs((Number(object.x) || 0) - 515) < 8 &&
      Math.abs((Number(object.y) || 0) - 268) < 16 &&
      object.list?.some?.(isGraphics)
    )) || null;
  }

  function syncAnton() {
    const room = getScene("SimonRoomScene");
    if (!room?.sys?.isActive?.() || !room.textures?.exists?.(ASSETS.anton.key)) return;

    ensureAnimations(room);
    const anton = findAnton(room);
    if (!anton?.active) return;

    room.tweens?.killTweensOf?.(anton);
    anton.setY?.(268);
    const sprite = createDetached(room, anton, ASSETS.anton.key, 0.55, 38, 2);
    if (!sprite) return;

    syncDetached(anton, { footOffset: 38 });
    playMode(sprite, "idle", "anton-idle-v75");
  }

  // Explicitly undo any cached/older Amsif replacement. No Amsif asset is
  // loaded by this module; the original procedural figure is canonical.
  function enforceAmsifPlaceholder() {
    const amsif = getScene("BahnhofquaiScene")?.amsif;
    if (!amsif?.active) return;

    [amsif.__npcSpriteV69, amsif.__npcSpriteV71, amsif.__npcSpriteV75]
      .filter(Boolean)
      .forEach((sprite) => { try { sprite.destroy?.(); } catch {} });

    amsif.__npcSpriteV69 = null;
    amsif.__npcSpriteV71 = null;
    amsif.__npcSpriteV75 = null;
    restoreGraphics(amsif);
  }

  function tick() {
    installBasePreload();
    syncEsthi();
    syncGandhi();
    syncAnton();
    enforceAmsifPlaceholder();
  }

  installBasePreload();
  tick();
  window.setInterval(tick, 220);

  window.SimonNPCEssentialV75 = Object.freeze({
    VERSION,
    status() {
      return {
        version: VERSION,
        amsifUsesPlaceholder: true,
        inderUsesOldV37: true,
        enriqueOwnedByV74: true
      };
    }
  });
})();
