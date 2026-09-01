
(() => {
  "use strict";
  if (window.__SIMON_EXPERIENCE_FIX_V72__) return;
  window.__SIMON_EXPERIENCE_FIX_V72__ = true;

  const VERSION = 72;
  const UI_BLOCK_MS = 320;
  let uiBlockUntil = 0;

  function getGame() {
    return window.__SIMON_ACTIVE_GAME_V28__ || window.__SIMON_ACTIVE_GAME_V20__ || window.__SIMON_ACTIVE_GAME__ || null;
  }
  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; } catch { return null; }
  }
  function safe(fn) { try { return fn(); } catch (e) { console.warn('v72', e); return null; } }
  function armUIBlock(ms = UI_BLOCK_MS) { uiBlockUntil = Math.max(uiBlockUntil, performance.now() + ms); }

  function withinGameTarget(target) {
    const root = document.getElementById('phaser-game');
    return !!(root && target instanceof Node && root.contains(target));
  }
  function absorbEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function installGlobalInteractionGuard() {
    if (window.__SIMON_V72_INTERACTION_GUARD__) return;
    window.__SIMON_V72_INTERACTION_GUARD__ = true;

    ['pointerup', 'click'].forEach((type) => {
      document.addEventListener(type, (event) => {
        if (performance.now() >= uiBlockUntil) return;
        if (!withinGameTarget(event.target)) return;
        absorbEvent(event);
      }, true);
    });

    const root = document.getElementById('phaser-game');
    if (!root || root.__v72Observed) return;
    root.__v72Observed = true;

    const applyButtonCooldown = (container) => {
      if (!(container instanceof Element)) return;
      container.querySelectorAll('button, [role="button"]').forEach((btn) => {
        if (btn.dataset.v72CooldownApplied === '1') return;
        btn.dataset.v72CooldownApplied = '1';
        const previous = btn.style.pointerEvents;
        btn.style.pointerEvents = 'none';
        window.setTimeout(() => {
          if (!document.documentElement.contains(btn)) return;
          btn.style.pointerEvents = previous || '';
        }, UI_BLOCK_MS);
      });
    };

    const patchCashierNote = (node) => {
      if (!(node instanceof Element)) return;
      const overlay = node.matches?.('[data-simon-ui="cashier-note-v54"]') ? node : node.querySelector?.('[data-simon-ui="cashier-note-v54"]');
      if (!overlay || overlay.dataset.v72Patched === '1') return;
      overlay.dataset.v72Patched = '1';
      const paper = overlay.firstElementChild;
      if (!paper) return;
      const oldNote = Array.from(paper.children).find((child) => child.textContent?.includes?.('Hättest du mal Lust') || child.textContent?.includes?.('sympathisch'));
      if (!oldNote) return;
      const img = document.createElement('img');
      img.src = 'coffee-plan-note-v72.png?v=72';
      img.alt = 'Simons Zettel für die Orell-Füssli-Kassiererin';
      Object.assign(img.style, {
        display: 'block',
        width: 'min(100%, 500px)',
        margin: '0 auto',
        imageRendering: 'auto',
        filter: 'drop-shadow(0 3px 0 rgba(40,22,5,.18))'
      });
      oldNote.replaceWith(img);
    };

    const observer = new MutationObserver((mutations) => {
      let shouldArm = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('[data-simon-ui], button, [role="button"]') || node.querySelector?.('[data-simon-ui], button, [role="button"]')) shouldArm = true;
          applyButtonCooldown(node);
          patchCashierNote(node);
        });
      });
      if (shouldArm) armUIBlock();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function makeCloudBand(scene, y, alpha = 0.42, scale = 1, depth = -18) {
    const g = scene.add.graphics().setDepth(depth);
    const width = Number(scene.physics?.world?.bounds?.width) || 2200;
    const groups = Math.max(5, Math.round(width / 320));
    for (let i = 0; i < groups; i += 1) {
      const x = 120 + i * (width - 200) / Math.max(1, groups - 1);
      const baseY = y + ((i % 2) ? -4 : 3);
      g.fillStyle(0xf4f6f5, alpha);
      g.fillEllipse(x - 26 * scale, baseY + 3, 44 * scale, 20 * scale);
      g.fillEllipse(x + 2, baseY - 4, 68 * scale, 25 * scale);
      g.fillEllipse(x + 32 * scale, baseY + 1, 48 * scale, 18 * scale);
    }
    return g;
  }

  function makeMountainBand(scene, width, baseY, depth = -17) {
    const g = scene.add.graphics().setDepth(depth);
    g.fillStyle(0x6f857b, 0.72);
    g.fillTriangle(-40, baseY, width * 0.16, baseY - 78, width * 0.33, baseY);
    g.fillTriangle(width * 0.22, baseY, width * 0.45, baseY - 66, width * 0.61, baseY);
    g.fillTriangle(width * 0.52, baseY, width * 0.74, baseY - 82, width + 20, baseY);
    g.fillStyle(0x8ba39e, 0.42);
    g.fillRect(0, baseY - 2, width, 18);
    return g;
  }

  function makeBackHouses(scene, width, topY, depth = -16) {
    const g = scene.add.graphics().setDepth(depth);
    const colors = [0x7e8e91, 0x738489, 0x829398, 0x6f7f83];
    let x = -10;
    let i = 0;
    while (x < width + 20) {
      const w = 34 + (i % 4) * 8;
      const h = 24 + (i % 5) * 8;
      g.fillStyle(colors[i % colors.length], 0.66);
      g.fillRect(x, topY - h, w, h);
      x += w - 4;
      i += 1;
    }
    return g;
  }

  function patchMilchbuck() {
    const scene = getScene('MilchbuckScene');
    if (!scene?.sys?.isActive?.() || !scene.add || !scene.physics?.world || !scene.cameras?.main) return;

    const width = Number(scene.physics.world.bounds.width) || 2200;
    const targetWidth = width > 1880 ? 1820 : width;
    if (targetWidth !== width) {
      safe(() => scene.physics.world.setBounds(0, 0, targetWidth, Number(scene.physics.world.bounds.height) || 338));
      safe(() => scene.cameras.main.setBounds(0, 0, targetWidth, Number(scene.physics.world.bounds.height) || 338));
      if (scene.player?.x > targetWidth - 70) scene.player.x = targetWidth - 70;
    }

    if (scene.__v72MilchbuckDecor) return;

    const sky = scene.add.graphics().setDepth(-19);
    const w = targetWidth;
    sky.fillStyle(0x86b3c7, 0.94); sky.fillRect(0, 0, w, 84);
    sky.fillStyle(0x9fc3cf, 0.84); sky.fillRect(0, 84, w, 58);
    sky.fillStyle(0xb8d1d8, 0.72); sky.fillRect(0, 142, w, 36);
    const mountains = makeMountainBand(scene, w, 196, -18);
    const houses = makeBackHouses(scene, w, 206, -17);
    const cloudsA = makeCloudBand(scene, 62, 0.38, 1.0, -16.5);
    const cloudsB = makeCloudBand(scene, 106, 0.25, 0.82, -16.4);

    const vibe = scene.add.graphics().setDepth(4);
    // lichterketten around club area / right side
    vibe.lineStyle(2, 0x544137, 1);
    [[1080,126],[1330,132],[1560,124]].forEach((arrX, idx) => {
      vibe.beginPath();
      vibe.moveTo(arrX - 120, 92 + idx * 7);
      vibe.quadraticCurveTo(arrX, 132 + idx * 6, arrX + 120, 92 + idx * 7);
      vibe.strokePath();
      const colors = [0xf6d25e,0xe77c74,0x84c8ff,0x8fd894,0xf5a4d2];
      for (let i = 0; i < 8; i += 1) {
        const x = arrX - 105 + i * 30;
        const y = 103 + idx * 7 + Math.sin(i / 7 * Math.PI) * 20;
        vibe.fillStyle(colors[(i + idx) % colors.length], 1);
        vibe.fillCircle(x, y, 4);
      }
    });
    // graffiti blocks on walls near hive area
    const graffs = [
      [1210, 242, 'HIVE'],
      [1430, 236, 'JA'],
      [1600, 248, 'ZH']
    ];
    graffs.forEach(([x, y, text]) => {
      const t = scene.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: ['#ff9d66','#8fd7ff','#ffd56e'][Math.floor((x+y)%3)],
        stroke: '#3a2e2a', strokeThickness: 5
      }).setDepth(4).setAlpha(0.88);
      t.setRotation((x % 2 ? -1 : 1) * 0.05);
      if (!scene.__v72GraffitiTexts) scene.__v72GraffitiTexts = [];
      scene.__v72GraffitiTexts.push(t);
    });

    scene.__v72MilchbuckDecor = { sky, mountains, houses, cloudsA, cloudsB, vibe };
  }

  function patchOutdoorScene(sceneKey) {
    const scene = getScene(sceneKey);
    if (!scene?.sys?.isActive?.() || !scene.add || scene.__v72SkyBoost) return;
    const width = Number(scene.physics?.world?.bounds?.width) || 2200;
    const sky = scene.add.graphics().setDepth(-119);
    sky.fillStyle(0x8ab6c9, 0.12); sky.fillRect(0, 0, width, 160);
    const mountains = makeMountainBand(scene, width, 206, -118);
    const houses = makeBackHouses(scene, width, 210, -117.5);
    const clouds = makeCloudBand(scene, 76, 0.20, 0.92, -117);
    scene.__v72SkyBoost = { sky, mountains, houses, clouds };
  }

  function patchEinsteinUnlimited() {
    const scene = getScene('ETHInteriorScene');
    if (!scene?.sys?.isActive?.()) return;
    if (scene.__einsteinAskedThisVisit && !scene.__ethDialogueActive && !scene.__ethQuizModal && !scene.__einsteinInteractionBusy) {
      scene.__einsteinAskedThisVisit = false;
      safe(() => scene.__einsteinPrompt?.setText?.('KLICK · NO E FRAG'));
    }
  }

  function patchPolyterrasseNoteFallback() {
    const root = document.getElementById('phaser-game');
    const overlay = root?.querySelector?.('[data-simon-ui="cashier-note-v54"]');
    if (!overlay || overlay.dataset.v72Patched === '1') return;
    overlay.dataset.v72Patched = '1';
    const paper = overlay.firstElementChild;
    if (!paper) return;
    const oldNote = Array.from(paper.children).find((child) => child.textContent?.includes?.('Hättest du mal Lust') || child.textContent?.includes?.('sympathisch'));
    if (!oldNote) return;
    const img = document.createElement('img');
    img.src = 'coffee-plan-note-v72.png?v=72';
    img.alt = 'Simons Zettel';
    Object.assign(img.style, { display: 'block', width: 'min(100%, 500px)', margin: '0 auto' });
    oldNote.replaceWith(img);
    armUIBlock();
  }

  function tick() {
    installGlobalInteractionGuard();
    patchMilchbuck();
    patchOutdoorScene('BahnhofquaiScene');
    patchOutdoorScene('OerlikonScene');
    patchEinsteinUnlimited();
    patchPolyterrasseNoteFallback();
  }

  tick();
  window.setInterval(tick, 220);

  window.SimonExperienceFixV72 = Object.freeze({
    VERSION,
    status() {
      return {
        version: VERSION,
        uiBlockUntil,
        milchbuck: Boolean(getScene('MilchbuckScene')?.__v72MilchbuckDecor),
        bahnhofSky: Boolean(getScene('BahnhofquaiScene')?.__v72SkyBoost),
        oerlikonSky: Boolean(getScene('OerlikonScene')?.__v72SkyBoost),
        einsteinRepeat: !Boolean(getScene('ETHInteriorScene')?.__einsteinAskedThisVisit),
        cashierNoteImageVisible: Boolean(document.querySelector('[data-simon-ui="cashier-note-v54"] img[src*="coffee-plan-note-v72"]'))
      };
    }
  });
})();
