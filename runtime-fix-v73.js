
(() => {
  "use strict";
  if (window.__SIMON_RUNTIME_FIX_V73__) return;
  window.__SIMON_RUNTIME_FIX_V73__ = true;

  const VERSION = 73;
  const ROOT_ID = 'phaser-game';

  function getGame() {
    return window.__SIMON_ACTIVE_GAME_V28__ || window.__SIMON_ACTIVE_GAME_V20__ || window.__SIMON_ACTIVE_GAME__ || null;
  }
  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; } catch { return null; }
  }
  function safe(fn, fallback = null) { try { return fn(); } catch (e) { console.warn('v73', e); return fallback; } }
  function destroyThing(x) {
    try {
      if (!x) return;
      if (Array.isArray(x)) return x.forEach(destroyThing);
      if (typeof x === 'object' && !x.destroy) return Object.values(x).forEach(destroyThing);
      x.destroy?.();
    } catch {}
  }

  function isWorldObject(obj) {
    if (!obj?.setScrollFactor) return false;
    return !(Number(obj.scrollFactorX) === 0 && Number(obj.scrollFactorY) === 0);
  }

  function desiredParallax(depth) {
    if (depth <= -110) return 0.08;
    if (depth <= -70) return 0.12;
    if (depth <= -30) return 0.18;
    if (depth < 0) return 0.36;
    return 1;
  }

  function applyScrollFactor(target, factor) {
    if (!target) return;
    if (Array.isArray(target)) return target.forEach((x) => applyScrollFactor(x, factor));
    if (typeof target === 'object' && !target.setScrollFactor && !target.scrollFactorX) {
      Object.values(target).forEach((v) => applyScrollFactor(v, factor));
      return;
    }
    if (!target.setScrollFactor) return;
    try {
      if (Number(target.scrollFactorX) !== 0 || Number(target.scrollFactorY) !== 0) {
        target.setScrollFactor(factor, factor);
      }
    } catch {}
  }

  function patchSceneParallax(sceneKey) {
    const scene = getScene(sceneKey);
    if (!scene?.sys?.isActive?.() || !scene?.children?.list) return;

    scene.children.list.forEach((obj) => {
      if (!isWorldObject(obj)) return;
      const d = Number(obj.depth) || 0;
      const factor = desiredParallax(d);
      if (d < 0) {
        try { obj.setScrollFactor(factor, factor); } catch {}
      }
    });

    // Explicit tuning for our injected layers.
    const md = scene.__v72MilchbuckDecor;
    if (md) {
      applyScrollFactor(md.sky, 0.04);
      applyScrollFactor(md.mountains, 0.10);
      applyScrollFactor(md.houses, 0.18);
      applyScrollFactor(md.cloudsA, 0.06);
      applyScrollFactor(md.cloudsB, 0.10);
      applyScrollFactor(md.vibe, 0.95);
      applyScrollFactor(scene.__v72GraffitiTexts, 0.95);
    }
    const sky = scene.__v72SkyBoost;
    if (sky) {
      applyScrollFactor(sky.sky, 0.04);
      applyScrollFactor(sky.mountains, 0.11);
      applyScrollFactor(sky.houses, 0.18);
      applyScrollFactor(sky.clouds, 0.08);
    }
    if (scene.__bahnhofRefinedV71) {
      applyScrollFactor(scene.__bahnhofRefinedV71.bg, 0.08);
      applyScrollFactor(scene.__bahnhofRefinedV71.blocks, 0.20);
      applyScrollFactor(scene.__bahnhofRefinedV71.ground, 1);
      applyScrollFactor(scene.__bahnhofRefinedV71.props, 1);
    }
    if (scene.__polyGroundV71) {
      applyScrollFactor(scene.__polyGroundV71.sky, 0.04);
      applyScrollFactor(scene.__polyGroundV71.floor, 1);
    }
    if (scene.__polybahnGroundV71) applyScrollFactor(scene.__polybahnGroundV71, 1);
  }

  function patchMilchbuckLength() {
    const scene = getScene('MilchbuckScene');
    if (!scene?.sys?.isActive?.() || !scene.physics?.world || !scene.cameras?.main) return;
    const targetWidth = 2140;
    const curW = Number(scene.physics.world.bounds.width) || targetWidth;
    if (curW !== targetWidth) {
      safe(() => scene.physics.world.setBounds(0, 0, targetWidth, Number(scene.physics.world.bounds.height) || 338));
      safe(() => scene.cameras.main.setBounds(0, 0, targetWidth, Number(scene.physics.world.bounds.height) || 338));
      scene.__v73MilchbuckTargetWidth = targetWidth;
    }
  }

  function moveSequenceOverlayOutsideRoot() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const rect = root.getBoundingClientRect();
    root.querySelectorAll('[data-simon-ui$="sequence"], [data-simon-ui="hive-sequence-v46"], [data-simon-ui="enrique-v46-sequence"]').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.dataset.v73Moved === '1') {
        Object.assign(node.style, {
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          inset: 'auto'
        });
        return;
      }
      node.dataset.v73Moved = '1';
      document.body.appendChild(node);
      Object.assign(node.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        inset: 'auto',
        zIndex: '999999',
        pointerEvents: 'auto'
      });
    });
  }

  function replacePolybahnEntrance() {
    const scene = getScene('BahnhofquaiScene');
    if (!scene?.sys?.isActive?.() || !scene.add) return;
    if (scene.__v73PolybahnApplied) return;

    // Remove v71 entry visuals only, leave other world polish intact.
    const old = scene.__ethCampusEntryV59;
    if (old) destroyThing([old.street, old.station, old.sign, old.zone, old.marker, old.actionLabel, old.facades]);
    scene.__ethCampusEntryV59 = null;

    const x = 905;
    const y = 308;

    const stair = scene.add.graphics().setDepth(3);
    stair.fillStyle(0xbcb4a7, 1); stair.fillRoundedRect(x - 24, y - 26, 48, 24, 3);
    stair.fillStyle(0x928978, 1); stair.fillRect(x - 26, y - 30, 52, 6);
    stair.fillStyle(0xcfc8bb, 1);
    stair.fillRect(x - 18, y - 20, 36, 4);
    stair.fillRect(x - 15, y - 14, 30, 4);
    stair.fillRect(x - 12, y - 8, 24, 4);
    const signPost = scene.add.graphics().setDepth(4);
    signPost.fillStyle(0x495860, 1); signPost.fillRect(x + 26, y - 54, 4, 54);
    signPost.fillStyle(0x6c3131, 1); signPost.fillRoundedRect(x + 8, y - 68, 42, 16, 4);
    const sign = scene.add.text(x + 29, y - 60, 'POLY', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#fff6df'
    }).setOrigin(0.5).setDepth(5);
    const label = scene.add.text(x, y - 48, 'POLYBAHN', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#fff0cd', backgroundColor: '#73312f', padding: { x: 7, y: 4 }
    }).setOrigin(0.5).setDepth(286).setInteractive({ useHandCursor: true });
    const zone = scene.add.zone(x, y - 10, 90, 74).setDepth(285).setInteractive({ useHandCursor: true });

    const showThought = () => {
      const player = scene.player;
      if (!player?.active) return;
      const bubble = scene.add.text(player.x, player.y - 105, 'Ich sött mir zerscht öppis Gschiids überlege.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#3a3027', backgroundColor: '#fff6dd', padding: { x: 8, y: 7 }, wordWrap: { width: 220 }
      }).setOrigin(0.5).setDepth(900);
      safe(() => scene.time.delayedCall(1500, () => bubble.destroy()));
    };

    const openPoly = (pointer) => {
      pointer?.event?.preventDefault?.(); pointer?.event?.stopPropagation?.();
      const cashier = window.__SIMON_CASHIER_STATE_V54__ || window.SimonCashierV54?.state || null;
      const unlocked = !!(scene.developerMode || cashier?.inspirationHintSeen || cashier?.needsInspiration || cashier?.coffeePlanWritten || cashier?.cashierAsked || cashier?.cashierRejected);
      if (!unlocked) return showThought();
      safe(() => window.SimonETHV59?.enter?.());
    };
    zone.on('pointerdown', openPoly);
    label.on('pointerdown', openPoly);

    scene.__ethCampusEntryV59 = { stair, signPost, sign, zone, actionLabel: label, __v73: true };
    scene.__v73PolybahnApplied = true;
  }

  function tick() {
    patchMilchbuckLength();
    ['MilchbuckScene', 'BahnhofquaiScene', 'OerlikonScene', 'PolyterrasseScene', 'PolybahnTransitScene'].forEach(patchSceneParallax);
    moveSequenceOverlayOutsideRoot();
    replacePolybahnEntrance();
  }

  tick();
  window.setInterval(tick, 200);

  window.SimonRuntimeFixV73 = Object.freeze({
    VERSION,
    status() {
      return {
        version: VERSION,
        milchbuckWidth: safe(() => getScene('MilchbuckScene')?.physics?.world?.bounds?.width, null),
        polybahnPatched: Boolean(getScene('BahnhofquaiScene')?.__v73PolybahnApplied),
        hiveSequenceOverlayMoved: Boolean(document.querySelector('[data-simon-ui="hive-sequence-v46"][data-v73-moved], [data-simon-ui="hive-sequence-v46"][data-v73moved]'))
      };
    }
  });
})();
