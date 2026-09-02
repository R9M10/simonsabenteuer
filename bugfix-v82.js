(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V82__) return;
  window.__SIMON_BUGFIX_V82__ = true;

  const VERSION = 82;
  const KEY = "MilchbuckScene";
  const GROUND_TOP = 338;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene() {
    try {
      return getGame()?.scene?.getScene?.(KEY) || null;
    } catch {
      return null;
    }
  }

  function destroy(obj) {
    try { obj?.destroy?.(true); } catch {}
  }

  // v80's maintenance timer can re-add the hidden layers after we replace them.
  try { window.SimonBugfixV80?.stopMaintenance?.(); } catch {}

  function removeV80Art(scene) {
    if (!scene) return;

    [
      scene.__milchbuckGroundPolishV80,
      ...(scene.__milchbuckMountainsV80 || []),
      scene.__milchbuckTwinTowersV80,
      scene.__milchbuckGarageV80
    ].forEach(destroy);

    if (scene.__milchbuckLightsV80) {
      destroy(scene.__milchbuckLightsV80.wire);
      (scene.__milchbuckLightsV80.bulbs || []).forEach(destroy);
    }

    scene.__milchbuckGroundPolishV80 = null;
    scene.__milchbuckMountainsV80 = null;
    scene.__milchbuckTwinTowersV80 = null;
    scene.__milchbuckGarageV80 = null;
    scene.__milchbuckLightsV80 = null;

    // Keep true so the old wrapper does not paint the obsolete v80 layer again
    // during this scene run.
    scene.__milchbuckVisualPatchV80 = true;
  }

  function worldWidth(scene) {
    return Math.max(
      Number(scene?.physics?.world?.bounds?.width) || 0,
      Number(scene?.cameras?.main?.getBounds?.()?.width) || 0,
      3000
    );
  }

  function track(scene, object, factor) {
    if (!Array.isArray(scene.__v82Parallax)) scene.__v82Parallax = [];
    object.setScrollFactor?.(0, 0);
    scene.__v82Parallax.push({
      object,
      factor,
      baseX: Number(object.x) || 0,
      baseY: Number(object.y) || 0
    });
    return object;
  }

  function sync(scene) {
    const entries = scene?.__v82Parallax;
    const camera = scene?.cameras?.main;
    if (!camera || !Array.isArray(entries)) return;

    const sx = Number(camera.scrollX) || 0;
    if (sx === scene.__v82LastScroll) return;
    scene.__v82LastScroll = sx;

    for (const e of entries) {
      if (!e.object?.active) continue;
      e.object.x = e.baseX - sx * e.factor;
      e.object.y = e.baseY;
    }
  }

  function addAlps(scene) {
    const w = worldWidth(scene);

    // IMPORTANT: v66 sky is depth -40. Everything here is ABOVE the sky.
    const far = track(scene, scene.add.graphics().setDepth(-35.2), 0.20);
    far.fillStyle(0xa7bab9, 0.96);
    far.beginPath();
    far.moveTo(-650, 246);
    [
      [-420, 220], [-170, 194], [80, 224], [330, 146], [555, 214],
      [820, 166], [1080, 224], [1340, 132], [1580, 210], [1840, 156],
      [2090, 220], [2350, 124], [2590, 207], [2830, 154], [3150, 220],
      [w + 650, 198]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(w + 650, 260);
    far.lineTo(-650, 260);
    far.closePath();
    far.fillPath();

    far.fillStyle(0xe7ece4, 0.92);
    [
      [330, 146, 52], [820, 166, 40], [1340, 132, 60],
      [1840, 156, 48], [2350, 124, 65], [2830, 154, 46]
    ].forEach(([x, y, s]) => {
      far.fillTriangle(x - s, y + 34, x, y, x + s, y + 34);
    });

    // Ridge is in front of v66's near mountains (-30) by a fraction, but still
    // safely behind city/facades.
    const ridge = track(scene, scene.add.graphics().setDepth(-29.4), 0.36);
    ridge.fillStyle(0x6d927f, 0.92);
    ridge.beginPath();
    ridge.moveTo(-650, 276);
    [
      [-400, 255], [-130, 239], [145, 260], [430, 226], [710, 254],
      [1000, 231], [1280, 261], [1570, 229], [1850, 255], [2160, 223],
      [2450, 257], [2760, 228], [3100, 257], [w + 650, 238]
    ].forEach(([x, y]) => ridge.lineTo(x, y));
    ridge.lineTo(w + 650, 282);
    ridge.lineTo(-650, 282);
    ridge.closePath();
    ridge.fillPath();

    scene.__v82Mountains = [far, ridge];
  }

  function addMilchbuckLandmark(scene) {
    // Between v66 cityMid (-14) and real street facades (-6).
    const layer = scene.add.graphics().setDepth(-11.5);
    const base = GROUND_TOP - 18;

    function tower(x, width, height, body, side) {
      const y = base - height;
      layer.fillStyle(side, 1);
      layer.fillRect(x - 7, y + 8, 7, height - 8);
      layer.fillStyle(body, 1);
      layer.fillRect(x, y, width, height);
      layer.fillStyle(0xd5c69f, 1);
      layer.fillRect(x + 4, y - 7, width - 8, 7);

      for (let wy = y + 16; wy < base - 12; wy += 19) {
        for (let wx = x + 9; wx < x + width - 8; wx += 15) {
          layer.fillStyle(((wx + wy) % 31) < 12 ? 0xe1cb87 : 0x506d80, 0.94);
          layer.fillRect(wx, wy, 8, 11);
        }
      }
    }

    // Taller than v80: their silhouettes now rise above the nearer roofline.
    tower(1115, 62, 190, 0x748694, 0x566a78);
    tower(1192, 62, 215, 0x687d8d, 0x4c6170);

    layer.fillStyle(0x49545b, 0.92);
    layer.fillRect(1080, base - 23, 215, 23);

    scene.__v82Towers = layer;
  }

  function addGarageAndLights(scene) {
    const facade = scene.add.graphics().setDepth(-4.7);
    const x = 1260;
    const top = 222;
    const w = 245;
    const h = GROUND_TOP - top;

    facade.fillStyle(0x625d65, 1);
    facade.fillRoundedRect(x, top, w, h, 5);
    facade.fillStyle(0x3b4148, 1);
    facade.fillRoundedRect(x + 14, top + 31, 143, h - 37, 4);

    for (let y = top + 39; y < GROUND_TOP - 8; y += 10) {
      facade.fillStyle((y / 10) % 2 ? 0x4d5963 : 0x424d58, 1);
      facade.fillRect(x + 21, y, 129, 4);
    }

    facade.fillStyle(0x37313d, 1);
    facade.fillRect(x + 169, top + 42, 57, h - 42);

    // Graffiti deliberately large enough to be an actual landmark.
    const graffiti1 = scene.add.text(x + 85, top + 67, "MILCH", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      color: "#5df0ff",
      stroke: "#17313b",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.3);

    const graffiti2 = scene.add.text(x + 92, top + 91, "BUCK", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      color: "#ff67bd",
      stroke: "#3b1c34",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.3);

    const wire = scene.add.graphics().setDepth(9);
    wire.lineStyle(3, 0x3b3342, 0.96);
    wire.beginPath();
    wire.moveTo(1195, 170);
    wire.quadraticCurveTo(1390, 220, 1585, 168);
    wire.strokePath();

    const bulbs = [];
    for (let i = 0; i < 12; i += 1) {
      const t = i / 11;
      const bx = 1195 + (1585 - 1195) * t;
      const by = 170 + 43 * (4 * t * (1 - t));
      const colors = [0xffe58a, 0xff78c8, 0x69e8ff, 0xc990ff];
      const b = scene.add.circle(bx, by, 4.2, colors[i % colors.length], 1)
        .setDepth(10);
      bulbs.push(b);
      scene.tweens.add({
        targets: b,
        alpha: { from: 0.50, to: 1 },
        scale: { from: 0.95, to: 1.12 },
        duration: 520 + (i % 3) * 100,
        yoyo: true,
        repeat: -1,
        delay: i * 55
      });
    }

    scene.__v82Garage = [facade, graffiti1, graffiti2, wire, ...bulbs];
  }

  function addCorrectScaleProps(scene) {
    const p = scene.add.graphics().setDepth(8);

    // Fewer lamps, but genuinely street-sized.
    [930, 1215, 1515, 2020, 2460, 2810].forEach((x) => {
      p.fillStyle(0x4b5558, 1);
      p.fillRect(x - 3, 214, 6, 121);
      p.fillRect(x - 7, 209, 15, 6);
      p.fillStyle(0xffe7a5, 0.95);
      p.fillCircle(x + 9, 212, 7);
      p.lineStyle(3, 0x4b5558, 1);
      p.lineBetween(x, 212, x + 9, 212);
    });

    // Large bin and one bench establish Simon-scale immediately.
    p.fillStyle(0x52615c, 1);
    p.fillRoundedRect(1040, 292, 28, 44, 4);
    p.fillStyle(0x30383a, 1);
    p.fillRect(1045, 298, 18, 6);

    p.fillStyle(0x76543d, 1);
    p.fillRect(1370, 302, 91, 10);
    p.fillRect(1376, 312, 8, 24);
    p.fillRect(1447, 312, 8, 24);
    p.fillStyle(0x4d3a2d, 1);
    p.fillRect(1370, 286, 91, 8);

    function bike(x, y, s=1.1) {
      p.lineStyle(3, 0x3f474a, 1);
      p.strokeCircle(x, y, 12*s);
      p.strokeCircle(x + 34*s, y, 12*s);
      p.lineBetween(x, y, x + 14*s, y - 22*s);
      p.lineBetween(x + 14*s, y - 22*s, x + 25*s, y);
      p.lineBetween(x + 25*s, y, x, y);
      p.lineBetween(x + 14*s, y - 22*s, x + 34*s, y);
      p.lineBetween(x + 11*s, y - 23*s, x + 20*s, y - 23*s);
    }

    bike(1740, 322, 1.05);
    bike(2310, 322, 1.08);

    scene.__v82Props = p;
  }

  function cleanup(scene) {
    (scene.__v82Mountains || []).forEach(destroy);
    destroy(scene.__v82Towers);
    (scene.__v82Garage || []).forEach(destroy);
    destroy(scene.__v82Props);
    scene.__v82Mountains = null;
    scene.__v82Towers = null;
    scene.__v82Garage = null;
    scene.__v82Props = null;
    scene.__v82Installed = false;
    scene.__v82Parallax = [];
  }

  function apply(scene) {
    if (!scene?.sys?.isActive?.() || scene.__v82Installed) return false;

    removeV80Art(scene);
    addAlps(scene);
    addMilchbuckLandmark(scene);
    addGarageAndLights(scene);
    addCorrectScaleProps(scene);

    scene.__v82Installed = true;

    if (!scene.__v82UpdateAttached) {
      scene.__v82UpdateAttached = true;
      scene.events?.on?.("update", () => sync(scene));
      scene.events?.once?.("shutdown", () => {
        cleanup(scene);
        scene.__v82UpdateAttached = false;
      });
    }

    sync(scene);
    return true;
  }

  function patchGame(game) {
    const scene = game?.scene?.keys?.[KEY];
    const proto = scene?.constructor?.prototype;
    if (!proto || proto.create?.__v82Create) return Boolean(proto);

    if (typeof proto.create === "function") {
      const previous = proto.create;
      const wrapped = function createMilchbuckV82(...args) {
        const result = previous.apply(this, args);
        removeV80Art(this);
        apply(this);
        return result;
      };
      wrapped.__v82Create = true;
      proto.create = wrapped;
    }

    return true;
  }

  function install() {
    try { window.SimonBugfixV80?.stopMaintenance?.(); } catch {}
    const game = getGame();
    if (game) patchGame(game);
    const scene = getScene();
    if (scene?.sys?.isActive?.()) apply(scene);
  }

  const previousStart = window.startSimonGame;
  if (typeof previousStart === "function" && !previousStart.__v82Start) {
    const wrappedStart = function startSimonGameV82(...args) {
      const game = previousStart.apply(this, args);
      if (game) {
        patchGame(game);
        window.setTimeout(() => install(), 0);
      }
      return game;
    };
    wrappedStart.__v82Start = true;
    window.startSimonGame = wrappedStart;
  }

  install();
  const timer = window.setInterval(install, 160);

  window.SimonBugfixV82 = Object.freeze({
    VERSION,
    install,
    status() {
      const scene = getScene();
      return {
        version: VERSION,
        active: Boolean(scene?.sys?.isActive?.()),
        installed: Boolean(scene?.__v82Installed),
        mountainsVisibleDepths: [-35.2, -29.4],
        v66SkyDepth: -40
      };
    },
    stopMaintenance() {
      window.clearInterval(timer);
    }
  });

  console.info("Bugfix v82: repaired visible Milchbuck art layers.");
})();