
(() => {
  "use strict";

  if (window.__SIMON_WORLD_NPC_FIX_V71__) return;
  window.__SIMON_WORLD_NPC_FIX_V71__ = true;

  const VERSION = 71;
  const GROUND_TOP = 338;
  const NPC_ASSETS = Object.freeze({
    anton: { key: 'anton-master-v69', file: 'anton-master-v62.png', frameWidth: 160, frameHeight: 160 },
    amsif: { key: 'amsif-master-v69', file: 'amsif-master-v62.png', frameWidth: 240, frameHeight: 280 },
    esthi: { key: 'esthi-master-v69', file: 'esthi-master-v62.png', frameWidth: 240, frameHeight: 280 },
    enrique: { key: 'enrique-master-v69', file: 'enrique-master-v62.png', frameWidth: 240, frameHeight: 280 },
    gandhi: { key: 'gandhi-master-v69', file: 'gandhi-master-v62.png', frameWidth: 220, frameHeight: 240 }
  });

  function getGame() {
    return window.__SIMON_ACTIVE_GAME_V28__ || window.__SIMON_ACTIVE_GAME_V20__ || window.__SIMON_ACTIVE_GAME__ || null;
  }
  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; } catch { return null; }
  }
  function safeDestroy(x) { try { x?.destroy?.(); } catch {} }
  function hasTexture(scene, key) { try { return Boolean(scene?.textures?.exists?.(key)); } catch { return false; } }

  function getActiveLoaderScene() {
    const game = getGame();
    if (!game?.scene?.keys) return null;
    const pref = ['BahnhofquaiScene', 'MilchbuckScene', 'OerlikonScene', 'PolyterrasseScene', 'SimonRoomScene'];
    for (const key of pref) {
      const s = getScene(key);
      if (s?.sys?.isActive?.() && s.load) return s;
    }
    return Object.values(game.scene.keys).find((s) => s?.sys?.isActive?.() && s.load) || null;
  }

  let npcLoadState = { active: false, requested: false, completed: false, target: null };

  function loadNPCAssetsNow() {
    const scene = getActiveLoaderScene();
    if (!scene?.load) return;
    const missing = Object.values(NPC_ASSETS).filter((a) => !hasTexture(scene, a.key));
    if (!missing.length) {
      npcLoadState.completed = true;
      return;
    }
    if (npcLoadState.active || scene.load.isLoading?.()) return;

    npcLoadState.active = true;
    npcLoadState.target = scene.sys?.settings?.key || 'unknown';

    missing.forEach((a) => {
      try {
        scene.load.spritesheet(a.key, a.file, { frameWidth: a.frameWidth, frameHeight: a.frameHeight });
      } catch (e) { console.warn('v71 NPC load queue failed', a.key, e); }
    });

    scene.load.once('complete', () => {
      npcLoadState.active = false;
      npcLoadState.completed = true;
      try { ensureNPCAnimations(scene); } catch {}
    });
    scene.load.once('loaderror', () => { npcLoadState.active = false; });

    try { scene.load.start(); } catch (e) {
      npcLoadState.active = false;
      console.warn('v71 NPC load start failed', e);
    }
  }

  function makeAnimation(scene, key, texture, frames, frameRate, repeat = -1) {
    if (!scene?.anims || !hasTexture(scene, texture)) return null;
    if (scene.anims.exists(key)) return scene.anims.get(key);
    return scene.anims.create({ key, frames: frames.map((f) => ({ key: texture, frame: f })), frameRate, repeat });
  }

  function ensureNPCAnimations(scene) {
    if (!scene?.anims) return;
    makeAnimation(scene, 'anton-idle-v69', NPC_ASSETS.anton.key, [0,1,2,3], 2, -1);
    makeAnimation(scene, 'anton-meow-v69', NPC_ASSETS.anton.key, [12,13,14,15], 6, 0);
    makeAnimation(scene, 'amsif-idle-v69', NPC_ASSETS.amsif.key, [0,1,2,3], 2.6, -1);
    makeAnimation(scene, 'amsif-walk-v69', NPC_ASSETS.amsif.key, [4,5,6,7], 7, -1);
    makeAnimation(scene, 'amsif-story-v69', NPC_ASSETS.amsif.key, [8,9,10,11], 2.8, -1);
    makeAnimation(scene, 'amsif-reward-v69', NPC_ASSETS.amsif.key, [12,13,14,15], 3.2, 0);
    makeAnimation(scene, 'esthi-idle-v69', NPC_ASSETS.esthi.key, [0,1,2,3], 2.4, -1);
    makeAnimation(scene, 'enrique-idle-v69', NPC_ASSETS.enrique.key, [0,1,2,3], 2.5, -1);
    makeAnimation(scene, 'enrique-explain-v69', NPC_ASSETS.enrique.key, [4,5,6,7], 3.4, -1);
    makeAnimation(scene, 'enrique-second-look-v69', NPC_ASSETS.enrique.key, [8,9,10,11], 3.0, -1);
    makeAnimation(scene, 'gandhi-idle-v69', NPC_ASSETS.gandhi.key, [0,1,2,3,4,5], 2.4, -1);
    makeAnimation(scene, 'gandhi-collapse-v69', NPC_ASSETS.gandhi.key, [6,7,8,9,10,11], 6.2, 0);
    makeAnimation(scene, 'dark-gandhi-idle-v69', NPC_ASSETS.gandhi.key, [12,13,14,15,16,17], 4.2, -1);
    makeAnimation(scene, 'dark-gandhi-attack-v69', NPC_ASSETS.gandhi.key, [18,19,20,21], 8, 0);
    makeAnimation(scene, 'dark-gandhi-down-v69', NPC_ASSETS.gandhi.key, [22,23], 4, 0);
  }

  function isGraphics(child) { return child?.type === 'Graphics'; }
  function hideProceduralBody(owner) {
    try {
      owner?.list?.forEach?.((child) => {
        if (isGraphics(child)) child.setVisible?.(false);
      });
    } catch {}
  }
  function installDestroyLink(owner) {
    if (!owner?.destroy || owner.__v71DestroyLinked) return;
    const original = owner.destroy;
    owner.destroy = function(...args) {
      safeDestroy(this.__npcSpriteV71);
      this.__npcSpriteV71 = null;
      return original.apply(this, args);
    };
    owner.__v71DestroyLinked = true;
  }
  function createDetachedSprite(scene, owner, opts) {
    if (!scene?.add || !owner?.active || !hasTexture(scene, opts.texture)) return null;
    if (owner.__npcSpriteV71?.active) return owner.__npcSpriteV71;
    hideProceduralBody(owner);
    const sp = scene.add.sprite(owner.x, owner.y + (opts.footOffset || 0), opts.texture, opts.frame || 0)
      .setOrigin(0.5, 1)
      .setScale(opts.scale || 1)
      .setDepth((Number(owner.depth) || 0) + (opts.depthOffset || 1));
    sp.__baseScaleV71 = opts.scale || 1;
    sp.__footOffsetV71 = opts.footOffset || 0;
    sp.__depthOffsetV71 = opts.depthOffset || 1;
    sp.__modeV71 = null;
    owner.__npcSpriteV71 = sp;
    installDestroyLink(owner);
    return sp;
  }
  function syncSprite(owner, opts = {}) {
    const sp = owner?.__npcSpriteV71;
    if (!sp?.active || !owner?.active) return null;
    const mult = Number.isFinite(opts.scaleMultiplier) ? opts.scaleMultiplier : 1;
    sp.setScale((Number(sp.__baseScaleV71) || 1) * mult);
    sp.setPosition(Number.isFinite(opts.x) ? opts.x : owner.x, Number.isFinite(opts.y) ? opts.y : owner.y + (Number.isFinite(opts.footOffset) ? opts.footOffset : (Number(sp.__footOffsetV71) || 0)));
    sp.setDepth((Number(owner.depth) || 0) + (Number(sp.__depthOffsetV71) || 1));
    sp.setAngle(Number.isFinite(opts.angle) ? opts.angle : 0);
    sp.setVisible(opts.visible === undefined ? owner.visible !== false : !!opts.visible);
    sp.setAlpha(Number.isFinite(opts.alpha) ? opts.alpha : (Number.isFinite(owner.alpha) ? owner.alpha : 1));
    sp.setFlipX(opts.flipX === undefined ? ((Number(owner.scaleX) || 1) < 0) : !!opts.flipX);
    return sp;
  }
  function playMode(sp, mode, anim, force = false) {
    if (!sp?.active) return;
    if (!force && sp.__modeV71 === mode) return;
    sp.__modeV71 = mode;
    try { sp.play(anim, true); } catch {}
  }

  function syncAmsif() {
    const scene = getScene('BahnhofquaiScene');
    const amsif = scene?.amsif;
    if (!scene?.sys?.isActive?.() || !amsif?.active || !hasTexture(scene, NPC_ASSETS.amsif.key)) return;
    ensureNPCAnimations(scene);
    const sp = createDetachedSprite(scene, amsif, { texture: NPC_ASSETS.amsif.key, frame: 0, scale: 0.48, footOffset: 74, depthOffset: 2 });
    if (!sp) return;
    const arriving = !!scene.amsifArrivalActive;
    const story = !!(scene.amsifDialogueActive && scene.amsifDialogueMode === 'story');
    syncSprite(amsif, { footOffset: 74, flipX: arriving ? true : undefined });
    if (arriving) return playMode(sp, 'walk', 'amsif-walk-v69');
    if (story) return playMode(sp, 'story', 'amsif-story-v69');
    playMode(sp, 'idle', 'amsif-idle-v69');
  }

  function syncGandhi() {
    const scene = getScene('BahnhofquaiScene');
    const gandhi = scene?.gandhi;
    if (!scene?.sys?.isActive?.() || !gandhi?.active || !hasTexture(scene, NPC_ASSETS.gandhi.key)) return;
    ensureNPCAnimations(scene);
    const dark = gandhi.__npcRoleV69 === 'dark-gandhi' || Number(gandhi.depth) >= 45 || !!scene.darkGandhiBossActive;
    const sp = createDetachedSprite(scene, gandhi, { texture: NPC_ASSETS.gandhi.key, frame: dark ? 12 : 0, scale: dark ? 0.57 : 0.56, footOffset: 74, depthOffset: 2 });
    if (!sp) return;
    if (!dark) {
      const collapsed = !!(scene.gandhiNukeActive && (scene.gandhiNukePhase === 'exploded' || scene.gandhiNukePhase === 'reviving'));
      if (collapsed) {
        syncSprite(gandhi, { y: GROUND_TOP - 2, angle: 0, footOffset: 0 });
        return playMode(sp, 'collapse', 'gandhi-collapse-v69');
      }
      syncSprite(gandhi, { footOffset: 74 });
      return playMode(sp, 'idle', 'gandhi-idle-v69');
    }
    syncSprite(gandhi, { footOffset: 74, angle: 0 });
    if (scene.darkGandhiDefeated) return playMode(sp, 'down', 'dark-gandhi-down-v69');
    return playMode(sp, 'dark-idle', 'dark-gandhi-idle-v69');
  }

  function syncEnrique() {
    const scene = getScene('BahnhofquaiScene');
    const enrique = scene?.__sv37Enrique;
    if (!scene?.sys?.isActive?.() || !scene.__sv37ZofingiaOpen || !enrique?.active || !hasTexture(scene, NPC_ASSETS.enrique.key)) return;
    ensureNPCAnimations(scene);
    const sp = createDetachedSprite(scene, enrique, { texture: NPC_ASSETS.enrique.key, frame: 0, scale: 0.47, footOffset: 31, depthOffset: 3 });
    if (!sp) return;
    const simon = scene.__sv37ClubSimon;
    const flip = !!(simon?.active && simon.x < enrique.x);
    syncSprite(enrique, { footOffset: 31, flipX: flip });
    sp.setDepth(738);
    const modal = scene.__sv37EnriqueModal;
    if (!!modal?.__flirtSequenceV46 && !scene.enriqueSpoken) return playMode(sp, 'second-look', 'enrique-second-look-v69');
    if (modal) return playMode(sp, 'explain', 'enrique-explain-v69');
    return playMode(sp, 'idle', 'enrique-idle-v69');
  }

  function syncEsthi() {
    const scene = getScene('OerlikonScene');
    const esthi = scene?.__esthiV57;
    if (!scene?.sys?.isActive?.() || !esthi?.active || !hasTexture(scene, NPC_ASSETS.esthi.key)) return;
    ensureNPCAnimations(scene);
    const sp = createDetachedSprite(scene, esthi, { texture: NPC_ASSETS.esthi.key, frame: 0, scale: 0.47, footOffset: 0, depthOffset: 2 });
    if (!sp) return;
    const player = scene.player;
    syncSprite(esthi, { footOffset: 0, flipX: player?.active ? player.x < esthi.x : false });
    playMode(sp, 'idle', 'esthi-idle-v69');
  }

  function findAntonContainer(room) {
    return room?.children?.list?.find?.((o) => o?.type === 'Container' && Math.abs((Number(o.x) || 0) - 515) < 8 && Math.abs((Number(o.y) || 0) - 268) < 16 && o.list?.some?.(isGraphics)) || null;
  }
  function syncAnton() {
    const room = getScene('SimonRoomScene');
    if (!room?.sys?.isActive?.() || !hasTexture(room, NPC_ASSETS.anton.key)) return;
    ensureNPCAnimations(room);
    const anton = findAntonContainer(room);
    if (!anton?.active) return;
    const sp = createDetachedSprite(room, anton, { texture: NPC_ASSETS.anton.key, frame: 0, scale: 0.55, footOffset: 38, depthOffset: 2 });
    if (!sp) return;
    syncSprite(anton, { footOffset: 38 });
    playMode(sp, 'idle', 'anton-idle-v69');
  }

  // ---------------------- DOM Inder ----------------------
  const INDER_IDLE = [0,1,0,3,0,2];
  const INDER_SERVE = [4,5,6,7,8,9,10,11];
  let inderState = { idleIndex: 0, nextIdleAt: 0, sequence: null, idx: 0, nextSeqAt: 0 };

  function setInderFrame(frame) {
    const visual = document.querySelector('[data-simon-sprite="inder-v71"]');
    if (!visual) return;
    const index = Math.max(0, Math.min(11, Number(frame) || 0));
    const row = Math.floor(index / 4), col = index % 4;
    visual.style.backgroundPosition = `${-col * 240}px ${-row * 280}px`;
  }

  function createInderVisual() {
    const room = document.querySelector('#phaser-game [data-simon-ui="inder-v37-room"], #phaser-game .sv37-inder-room');
    const seller = room?.querySelector?.('.sv37-inder-seller, [data-simon-ui="inder-v37-seller"]');
    if (!room || !seller || room.querySelector('[data-simon-sprite="inder-v71"]')) return;

    seller.style.backgroundImage = 'none';
    seller.style.opacity = '0';

    const visual = document.createElement('div');
    visual.dataset.simonSprite = 'inder-v71';
    Object.assign(visual.style, {
      position: 'absolute',
      left: '292px',
      top: '-24px',
      width: '240px',
      height: '280px',
      zIndex: '4',
      backgroundImage: 'url("inder-master-v62.png?v=71")',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '960px 840px',
      imageRendering: 'pixelated',
      transform: 'scale(.78)',
      transformOrigin: '50% 100%',
      pointerEvents: 'none',
      userSelect: 'none',
      filter: 'drop-shadow(0 4px 0 rgba(25,12,5,.22))'
    });
    room.appendChild(visual);
    inderState = { idleIndex: 0, nextIdleAt: performance.now() + 500, sequence: null, idx: 0, nextSeqAt: 0 };
    setInderFrame(0);
  }

  function syncInder() {
    createInderVisual();
    const visual = document.querySelector('[data-simon-sprite="inder-v71"]');
    if (!visual) return;
    const now = performance.now();
    if (inderState.sequence) {
      if (now >= inderState.nextSeqAt) {
        setInderFrame(inderState.sequence[inderState.idx]);
        inderState.idx += 1;
        inderState.nextSeqAt = now + 480;
        if (inderState.idx >= inderState.sequence.length) {
          inderState.sequence = null;
          inderState.idx = 0;
          inderState.nextIdleAt = now + 700;
        }
      }
      return;
    }
    if (now < inderState.nextIdleAt) return;
    inderState.idleIndex = (inderState.idleIndex + 1) % INDER_IDLE.length;
    setInderFrame(INDER_IDLE[inderState.idleIndex]);
    inderState.nextIdleAt = now + 920;
  }
  window.SimonPlayInderServeV71 = function() {
    inderState.sequence = [...INDER_SERVE];
    inderState.idx = 0;
    inderState.nextSeqAt = performance.now();
  };

  // ---------------------- WORLD FIXES ----------------------
  function destroyGroup(obj) {
    if (!obj) return;
    if (Array.isArray(obj)) return obj.forEach(safeDestroy);
    if (typeof obj === 'object' && !obj.destroy) return Object.values(obj).forEach(destroyGroup);
    safeDestroy(obj);
  }

  function refineBahnhofScene() {
    const scene = getScene('BahnhofquaiScene');
    if (!scene?.sys?.isActive?.() || !scene.add) return;
    if (scene.__bahnhofRefinedV71) return;

    // Remove v70's extra prop layer / entry if present.
    try { destroyGroup(scene.__bahnhofDecorV70); } catch {}
    try { destroyGroup(scene.__baseOutdoorDecorV70); } catch {}
    try {
      const e = scene.__ethCampusEntryV59;
      if (e) destroyGroup([e.street, e.facades, e.station, e.sign, e.zone, e.marker, e.actionLabel]);
      scene.__ethCampusEntryV59 = null;
    } catch {}

    const width = Number(scene.physics?.world?.bounds?.width) || 3200;
    const bg = scene.add.graphics().setDepth(-120);
    bg.fillStyle(0x88b4c8,1); bg.fillRect(0,0,width,84);
    bg.fillStyle(0x9fc3d0,1); bg.fillRect(0,84,width,58);
    bg.fillStyle(0xb9d0d8,1); bg.fillRect(0,142,width,46);
    bg.fillStyle(0x72887c,0.76);
    bg.fillTriangle(-40,206, width*0.18, 118, width*0.40,206);
    bg.fillTriangle(width*0.26,206, width*0.51,136, width*0.76,206);
    bg.fillTriangle(width*0.60,206, width*0.82,122, width+20,206);
    bg.fillStyle(0x719ba8,0.48); bg.fillRect(0,195,width,24);
    bg.fillStyle(0x7d948d,0.62);
    for (let x = -8; x < width + 32; x += 42) {
      const h = 18 + ((((x / 42) | 0) + 1) % 5) * 7;
      bg.fillRect(x, 196 - h, 34, h);
    }

    const blocks = scene.add.graphics().setDepth(-10);
    const fancy = [1080, 1230, 1390, 1560, 1730, 1910, 2090];
    fancy.forEach((x, idx) => {
      const w = 126 + (idx % 2) * 12;
      const top = 106 + (idx % 3) * 5;
      const h = 162 - (idx % 2) * 6;
      blocks.fillStyle([0xd5c8b8,0xc7b9a8,0xddd2c4][idx % 3], 1);
      blocks.fillRect(x, top, w, h);
      blocks.fillStyle(0x715f4f,1); blocks.fillRect(x, top, w, 10);
      blocks.fillStyle(0x34505a,1);
      for (let wy = top + 22; wy < top + 115; wy += 34) {
        for (let wx = x + 16; wx < x + w - 18; wx += 28) blocks.fillRect(wx, wy, 16, 21);
      }
      blocks.fillStyle([0x284048,0x2f4952,0x3a4f58][idx % 3],1); blocks.fillRect(x + 8, top + h - 42, w - 16, 34);
      blocks.fillStyle(0xe0d2b0,1);
      for (let wx = x + 16; wx < x + w - 24; wx += 30) blocks.fillRect(wx, top + h - 34, 18, 20);
    });
    // Scruffier Inder block.
    blocks.fillStyle(0xa28e7f,1); blocks.fillRect(2328, 118, 168, 152);
    blocks.fillStyle(0x6d4b39,1); blocks.fillRect(2328,118,168,10);
    blocks.fillStyle(0x425159,1); blocks.fillRect(2340,223,144,40);
    blocks.fillStyle(0xcbba90,1); [2351,2384,2417].forEach((x) => blocks.fillRect(x,232,24,22));

    // Sidewalk / no big street foreground.
    const ground = scene.add.graphics().setDepth(-2);
    ground.fillStyle(0x666767,0.7); ground.fillRect(0, 288, width, 16);
    ground.fillStyle(0xbdb6ab,1); ground.fillRect(0,304,width,34);
    ground.fillStyle(0xdbd5c9,1); ground.fillRect(0,304,width,5);
    ground.lineStyle(1,0x9b958b,0.55);
    for (let x = 0; x < width; x += 44) ground.lineBetween(x,310,x,338);

    // Better, fewer props on pavement.
    const props = scene.add.graphics().setDepth(2);
    // planters
    [[1125,308],[1460,308],[1825,308]].forEach(([x,y]) => {
      props.fillStyle(0x7c6a59,1); props.fillRoundedRect(x-18,y-14,36,14,3);
      props.fillStyle(0x62896b,1); props.fillCircle(x-10,y-18,7); props.fillCircle(x,y-22,9); props.fillCircle(x+10,y-18,7);
    });
    // elegant poles / signs
    [[1290,304],[2015,304]].forEach(([x,y]) => {
      props.fillStyle(0x425158,1); props.fillRect(x-2,y-74,4,74); props.fillCircle(x,y-79,8);
      props.fillStyle(0xd8d5cc,1); props.fillRoundedRect(x-18,y-58,36,22,4);
    });
    // bike stand (bigger and on sidewalk, not in street)
    props.lineStyle(3,0x6f767a,1);
    [1665,1692].forEach((x) => { props.strokeCircle(x, 315, 10); });
    props.lineBetween(1665,315,1692,315); props.lineBetween(1668,307,1681,297); props.lineBetween(1681,297,1692,315);
    props.lineStyle(2,0x56666b,1); props.strokeRoundedRect(1648, 322, 62, 8, 3);

    // Small, subtle polybahn access in background.
    const px = 935;
    const entryStreet = scene.add.graphics().setDepth(1);
    entryStreet.fillStyle(0x6b6c69,1);
    entryStreet.beginPath();
    entryStreet.moveTo(px-48, GROUND_TOP); entryStreet.lineTo(px+48, GROUND_TOP); entryStreet.lineTo(px+18, 212); entryStreet.lineTo(px-18, 212); entryStreet.closePath(); entryStreet.fillPath();
    entryStreet.fillStyle(0xc4bcaf,1);
    entryStreet.beginPath();
    entryStreet.moveTo(px-66, GROUND_TOP); entryStreet.lineTo(px-48, GROUND_TOP); entryStreet.lineTo(px-18, 212); entryStreet.lineTo(px-28, 212); entryStreet.closePath(); entryStreet.fillPath();
    entryStreet.beginPath();
    entryStreet.moveTo(px+48, GROUND_TOP); entryStreet.lineTo(px+66, GROUND_TOP); entryStreet.lineTo(px+28, 212); entryStreet.lineTo(px+18, 212); entryStreet.closePath(); entryStreet.fillPath();
    // tiny river only at the far end / bridge zone, subtle
    entryStreet.fillStyle(0x759eac,0.78);
    entryStreet.fillRect(px-52, 205, 104, 9);
    entryStreet.fillStyle(0xd6d0c5,0.95);
    entryStreet.fillRect(px-17, 204, 34, 6);

    const station = scene.add.graphics().setDepth(4);
    station.fillStyle(0xb9ae9c,1); station.fillRoundedRect(px-28, 128, 56, 58, 4);
    station.fillStyle(0x9b8f80,1); station.fillRect(px-31,123,62,7);
    station.fillStyle(0xb93133,1); station.fillRoundedRect(px-24,141,48,16,4);
    station.fillStyle(0x243b43,1); station.fillCircle(px,178,15); station.fillRect(px-15,178,30,13);
    station.fillStyle(0x162a33,1); station.fillCircle(px,179,11); station.fillRect(px-11,179,22,10);
    const sign = scene.add.text(px, 148, 'POLYBAHN', { fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#fff0d2', stroke: '#682024', strokeThickness: 2 }).setOrigin(0.5).setDepth(5);
    const zone = scene.add.zone(px, 272, 90, 88).setDepth(286).setInteractive({ useHandCursor: true });
    const actionLabel = scene.add.text(px, 257, 'POLYBAHN ↑', { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#fff0c9', backgroundColor: '#853031', padding: { x: 7, y: 5 } }).setOrigin(0.5).setDepth(287).setInteractive({ useHandCursor: true });

    const enter = (pointer) => {
      pointer?.event?.preventDefault?.(); pointer?.event?.stopPropagation?.();
      const cashier = window.__SIMON_CASHIER_STATE_V54__ || window.SimonCashierV54?.state || null;
      const unlocked = !!(scene.developerMode || cashier?.inspirationHintSeen || cashier?.needsInspiration || cashier?.coffeePlanWritten || cashier?.cashierAsked || cashier?.cashierRejected);
      if (!unlocked) {
        try { window.SimonWorldPolishV70 && scene.add.text(scene.player.x, scene.player.y - 110, 'Ich sött mer zerscht öppis Gschiids überlege.', { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#362d26', backgroundColor: '#fff3da', padding: {x:8,y:7} }).setOrigin(0.5).setDepth(900); } catch {}
        return;
      }
      try { window.SimonETHV59?.enter?.(); } catch (e) { console.warn('polybahn enter failed', e); }
    };
    zone.on('pointerdown', enter);
    actionLabel.on('pointerdown', enter);
    if (!scene.developerMode) {
      const cashier = window.__SIMON_CASHIER_STATE_V54__ || window.SimonCashierV54?.state || null;
      const unlocked = !!(cashier?.inspirationHintSeen || cashier?.needsInspiration || cashier?.coffeePlanWritten || cashier?.cashierAsked || cashier?.cashierRejected);
      actionLabel.setVisible(unlocked);
      zone.input.enabled = unlocked;
      actionLabel.input.enabled = unlocked;
    }

    scene.__ethCampusEntryV59 = { street: entryStreet, station, sign, zone, actionLabel, __refinedV71: true };
    scene.__bahnhofRefinedV71 = { bg, blocks, ground, props, entryStreet, station, sign, zone, actionLabel };
  }

  function fixPolybahnTransit() {
    const scene = getScene('PolybahnTransitScene');
    if (!scene?.sys?.isActive?.() || scene.__polybahnGroundV71 || !scene.add) return;
    const g = scene.add.graphics().setDepth(1.2);
    // big hillside / track bed
    g.fillStyle(0xa39c8f,1);
    g.beginPath();
    g.moveTo(84, 390); g.lineTo(84, 336); g.lineTo(700, 62); g.lineTo(700, 390); g.closePath(); g.fillPath();
    g.fillStyle(0xbeb4a3,1);
    for (let i = 0; i < 10; i += 1) {
      const x1 = 110 + i * 56;
      const y1 = 352 - i * 27;
      g.fillRect(x1, y1, 78, 8);
    }
    // little side wall / retaining edge
    g.fillStyle(0x8c8374,1);
    g.beginPath(); g.moveTo(84,336); g.lineTo(112,336); g.lineTo(700,74); g.lineTo(700,62); g.closePath(); g.fillPath();
    scene.__polybahnGroundV71 = g;
  }

  function fixPolyterrasseGround() {
    const scene = getScene('PolyterrasseScene');
    if (!scene?.sys?.isActive?.() || scene.__polyGroundV71 || !scene.add) return;
    const width = Number(scene.physics?.world?.bounds?.width) || 1720;
    const sky = scene.add.graphics().setDepth(-118);
    sky.fillStyle(0x8ab5c8, 0.82); sky.fillRect(0,0,width,86);
    sky.fillStyle(0x9fc2cf, 0.64); sky.fillRect(0,86,width,52);
    sky.fillStyle(0xb8d0d7, 0.44); sky.fillRect(0,138,width,32);
    const floor = scene.add.graphics().setDepth(-1);
    floor.fillStyle(0xc7c0b5, 1); floor.fillRect(0, 236, width, 102);
    floor.fillStyle(0xb3aaa0, 1); floor.fillRect(0, 236, width, 10);
    floor.fillStyle(0xa69785, 1);
    for (let x = 0; x < width; x += 56) floor.fillRect(x, 270, 2, 68);
    for (let y = 270; y < 338; y += 24) floor.fillRect(0, y, width, 2);
    // distant city base under railing
    floor.fillStyle(0x748b8f,0.48); floor.fillRect(0, 202, width, 30);
    scene.__polyGroundV71 = { sky, floor };
  }

  function tick() {
    loadNPCAssetsNow();
    syncAmsif(); syncGandhi(); syncEnrique(); syncEsthi(); syncAnton(); syncInder();
    refineBahnhofScene();
    fixPolybahnTransit();
    fixPolyterrasseGround();
  }

  tick();
  window.setInterval(tick, 250);

  window.SimonWorldNpcFixV71 = Object.freeze({
    VERSION,
    status() {
      const b = getScene('BahnhofquaiScene');
      return {
        version: VERSION,
        npcLoadState,
        amsif: Boolean(b?.amsif?.__npcSpriteV71?.active || b?.amsif?.__npcSpriteV69?.active),
        gandhi: Boolean(b?.gandhi?.__npcSpriteV71?.active || b?.gandhi?.__npcSpriteV69?.active),
        enrique: Boolean(b?.__sv37Enrique?.__npcSpriteV71?.active || b?.__sv37Enrique?.__npcSpriteV69?.active),
        esthi: Boolean(getScene('OerlikonScene')?.__esthiV57?.__npcSpriteV71?.active || getScene('OerlikonScene')?.__esthiV57?.__npcSpriteV69?.active),
        anton: Boolean(getScene('SimonRoomScene')?.__npcAntonV69?.active || findAntonContainer(getScene('SimonRoomScene'))?.__npcSpriteV71?.active),
        inder: Boolean(document.querySelector('[data-simon-sprite="inder-v71"], [data-simon-sprite="inder-v69"]')),
        bahnhofRefined: Boolean(b?.__bahnhofRefinedV71),
        polybahnTransitGround: Boolean(getScene('PolybahnTransitScene')?.__polybahnGroundV71),
        polyterrasseGround: Boolean(getScene('PolyterrasseScene')?.__polyGroundV71)
      };
    }
  });
})();
