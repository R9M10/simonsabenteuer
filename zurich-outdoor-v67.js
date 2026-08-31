(() => {
  "use strict";

  if (window.__SIMON_ZURICH_OUTDOOR_V67__) return;
  window.__SIMON_ZURICH_OUTDOOR_V67__ = true;

  const VERSION = 67;
  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const BAHNHOF_WIDTH = 3000;
  const TERRACE_WIDTH = 1720;

  const KEYS = Object.freeze({
    bahnhof: "BahnhofquaiScene",
    transit: "PolybahnTransitScene",
    terrace: "PolyterrasseScene"
  });

  // Shared Zürich palette. v67 deliberately keeps the warm stone / blue-green
  // atmosphere introduced by Milchbuck v66 so the city feels like one game.
  const C = Object.freeze({
    skyTop: 0x69b5d7,
    skyMid: 0x86c7d9,
    skyLow: 0xb9dcd6,
    haze: 0xd5e4d9,
    water: 0x6f9ead,
    waterLight: 0x93b8bf,
    mountainFar: 0x91a9a0,
    mountainNear: 0x718c7f,
    treeDark: 0x426b4d,
    tree: 0x527c54,
    treeLight: 0x668c5b,
    stoneLight: 0xd5cbb8,
    stone: 0xbcae98,
    stoneDark: 0x817769,
    plasterWarm: 0xd6c2a1,
    plasterCream: 0xdfd2b8,
    plasterGrey: 0xb8b6aa,
    plasterRose: 0xc8a68f,
    plasterOlive: 0xbab28f,
    roofRed: 0x835145,
    roofSlate: 0x5b5d5c,
    roofBrown: 0x6b554b,
    window: 0x547687,
    windowLight: 0x9cb9c1,
    frame: 0x494a47,
    asphalt: 0x62686a,
    asphaltDark: 0x4d5355,
    paving: 0xaaa397,
    pavingLight: 0xc5bdae,
    metal: 0x5b6467,
    metalLight: 0x899194,
    polyRed: 0xb63235,
    polyRedDark: 0x74272a,
    warmLight: 0xe2bd72,
    shadow: 0x34393a
  });

  // Densely built Bahnhofstrasse gets subtler parallax than the open terrace.
  // All factors are SCREEN movement relative to camera movement; 1.0 is world.
  const PARALLAX = Object.freeze({
    bahnhof: Object.freeze({
      sky: 0.10,
      clouds: 0.16,
      far: 0.54,
      mid: 0.74,
      world: 1.00
    }),
    terrace: Object.freeze({
      sky: 0.08,
      clouds: 0.14,
      alps: 0.27,
      hills: 0.41,
      cityFar: 0.57,
      cityNear: 0.74,
      world: 1.00
    })
  });

  const DEPTH = Object.freeze({
    sky: -60,
    clouds: -56,
    far: -48,
    mid: -34,
    vista: -22,
    architectureBack: -10,
    architecture: -4,
    street: 0,
    propsBack: 3,
    props: 6,
    foreground: 16
  });

  // -------------------------------------------------------------------------
  // Shared runtime / parallax utilities
  // -------------------------------------------------------------------------

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

  function resetParallax(scene) {
    scene.__zurichParallaxV67 = [];
    scene.__zurichParallaxLastX67 = Number.NaN;
  }

  function trackParallax(scene, object, factor) {
    if (!scene || !object) return object;
    if (!Array.isArray(scene.__zurichParallaxV67)) resetParallax(scene);

    object.setScrollFactor?.(0, 0);
    scene.__zurichParallaxV67.push({
      object,
      factor,
      baseX: Number(object.x) || 0,
      baseY: Number(object.y) || 0
    });
    return object;
  }

  function syncParallax(scene, force = false) {
    const camera = scene?.cameras?.main;
    const entries = scene?.__zurichParallaxV67;
    if (!camera || !Array.isArray(entries)) return;

    const scrollX = Number(camera.scrollX) || 0;
    if (!force && scrollX === scene.__zurichParallaxLastX67) return;
    scene.__zurichParallaxLastX67 = scrollX;

    for (const entry of entries) {
      const object = entry?.object;
      if (!object?.active) continue;
      object.x = entry.baseX - scrollX * entry.factor;
      object.y = entry.baseY;
    }
  }

  function addCloud(g, x, y, s = 1) {
    g.fillStyle(0xeaf5ef, 0.88);
    g.fillRect(x, y, 62 * s, 11 * s);
    g.fillRect(x + 12 * s, y - 10 * s, 45 * s, 12 * s);
    g.fillRect(x + 27 * s, y - 18 * s, 25 * s, 9 * s);
    g.fillStyle(0xcfe4df, 0.48);
    g.fillRect(x + 8 * s, y + 11 * s, 49 * s, 3 * s);
  }

  function drawWindow(g, x, y, w = 11, h = 16, lit = false, muted = false) {
    g.fillStyle(muted ? 0x656e6e : C.frame, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(lit && !muted ? 0xd7ad63 : (muted ? 0x71888e : C.window), 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(lit && !muted ? 0xf2d38c : C.windowLight, muted ? 0.38 : 0.58);
    g.fillRect(x + 2, y + 2, Math.max(2, Math.floor(w * 0.26)), h - 4);
    g.fillStyle(0x43535a, 0.76);
    g.fillRect(x + Math.floor(w / 2), y, 1, h);
  }

  function drawRoof(g, x, y, w, roof, { flat = false, dormers = true, muted = false } = {}) {
    if (flat) {
      g.fillStyle(roof, 1);
      g.fillRect(x - 3, y - 8, w + 6, 10);
      g.fillStyle(muted ? 0x6d7370 : 0x555a59, 1);
      g.fillRect(x + 17, y - 17, 22, 9);
      if (w > 120) g.fillRect(x + w - 38, y - 20, 18, 12);
      return;
    }

    g.fillStyle(roof, 1);
    g.fillTriangle(x - 5, y, x + w / 2, y - 27, x + w + 5, y);
    g.fillStyle(0x57483f, 0.78);
    g.fillRect(x - 3, y - 2, w + 6, 5);

    g.fillStyle(muted ? 0x74766f : 0x74665b, 1);
    g.fillRect(x + 17, y - 23, 7, 16);
    if (w > 135) g.fillRect(x + w - 28, y - 20, 7, 14);

    if (!muted && dormers && w > 125) {
      const dx = x + Math.floor(w * 0.47) - 10;
      g.fillStyle(0x655b53, 1);
      g.fillRect(dx, y - 14, 20, 14);
      g.fillStyle(0x58778a, 1);
      g.fillRect(dx + 6, y - 10, 8, 8);
      g.fillStyle(roof, 1);
      g.fillTriangle(dx - 2, y - 14, dx + 10, y - 24, dx + 22, y - 14);
    }
  }

  function drawFacade(g, spec, muted = false) {
    const {
      x, w, h, color = C.plasterCream, roof = C.roofRed,
      floors = 3, flatRoof = false, balcony = false,
      ground = "door", cornice = true
    } = spec;
    const y = GROUND_TOP - h;

    g.fillStyle(muted ? 0x6f7672 : 0x5b514a, muted ? 0.22 : 0.38);
    g.fillRect(x + w - 7, y + 5, 10, h - 5);

    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);

    if (cornice) {
      g.fillStyle(muted ? 0x8a8b83 : 0x9a8c79, 0.9);
      g.fillRect(x - 2, y + 10, w + 4, 4);
      g.fillRect(x, GROUND_TOP - 66, w, 4);
    }

    drawRoof(g, x, y, w, roof, { flat: flatRoof, dormers: true, muted });

    const cols = w >= 155 ? 4 : (w >= 112 ? 3 : 2);
    const gapX = (w - 30) / cols;
    const top = y + 26;
    const bottom = GROUND_TOP - 72;
    const gapY = Math.max(26, (bottom - top) / Math.max(1, floors));

    for (let row = 0; row < floors; row += 1) {
      const wy = top + row * gapY;
      if (wy > bottom - 8) break;
      for (let col = 0; col < cols; col += 1) {
        const lit = ((Math.floor(x / 17) + row * 5 + col * 3) % 23) === 0;
        drawWindow(g, x + 15 + col * gapX, wy, muted ? 8 : 10, muted ? 12 : 14, lit, muted);
      }

      if (!muted && balcony && row === 1 && w > 115) {
        const bx = x + Math.floor(w * 0.24);
        const bw = Math.floor(w * 0.52);
        const by = wy + 21;
        g.fillStyle(C.metal, 1);
        g.fillRect(bx, by, bw, 4);
        g.lineStyle(2, 0x454e50, 1);
        g.lineBetween(bx + 3, by - 11, bx + 3, by);
        g.lineBetween(bx + bw - 3, by - 11, bx + bw - 3, by);
        g.lineBetween(bx + 3, by - 11, bx + bw - 3, by - 11);
      }
    }

    if (muted) return;

    if (ground === "arcade") {
      g.fillStyle(0x3b4245, 1);
      g.fillRect(x + 8, GROUND_TOP - 58, w - 16, 44);
      const bays = Math.max(2, Math.floor(w / 52));
      const bayW = (w - 22) / bays;
      for (let i = 0; i < bays; i += 1) {
        g.fillStyle(i % 2 ? 0x5f7d84 : 0x526f7a, 1);
        g.fillRect(x + 12 + i * bayW, GROUND_TOP - 51, bayW - 8, 31);
        g.fillStyle(0xa7c0c2, 0.34);
        g.fillRect(x + 15 + i * bayW, GROUND_TOP - 48, 5, 25);
      }
    } else if (ground === "service") {
      g.fillStyle(0x4f5759, 1);
      g.fillRect(x + 11, GROUND_TOP - 57, w - 22, 43);
      g.lineStyle(2, 0x3f4648, 0.88);
      for (let yy = GROUND_TOP - 52; yy < GROUND_TOP - 20; yy += 7) {
        g.lineBetween(x + 13, yy, x + w - 13, yy);
      }
    } else if (ground === "passage") {
      g.fillStyle(0x252a2c, 1);
      g.fillRect(x + Math.floor(w * 0.32), GROUND_TOP - 72, Math.floor(w * 0.36), 58);
      g.fillStyle(0x465154, 1);
      g.fillRect(x + 12, GROUND_TOP - 54, Math.floor(w * 0.22), 40);
      g.fillRect(x + Math.floor(w * 0.76), GROUND_TOP - 54, Math.floor(w * 0.14), 40);
    } else {
      g.fillStyle(0x4f5658, 1);
      g.fillRect(x + w - 31, GROUND_TOP - 51, 19, 37);
      g.fillStyle(0x759098, 0.5);
      g.fillRect(x + w - 27, GROUND_TOP - 44, 11, 18);
    }

    g.fillStyle(0x697173, 1);
    g.fillRect(x + w - 4, y + 8, 3, h - 23);
  }

  function drawTree(g, x, groundY, scale = 1) {
    g.fillStyle(0x654a35, 1);
    g.fillRect(x - 4 * scale, groundY - 54 * scale, 8 * scale, 54 * scale);
    g.fillStyle(C.treeDark, 1);
    g.fillCircle(x, groundY - 70 * scale, 24 * scale);
    g.fillStyle(C.tree, 1);
    g.fillCircle(x - 18 * scale, groundY - 59 * scale, 18 * scale);
    g.fillCircle(x + 19 * scale, groundY - 60 * scale, 19 * scale);
    g.fillStyle(C.treeLight, 0.92);
    g.fillCircle(x - 7 * scale, groundY - 82 * scale, 14 * scale);
  }

  function drawBike(g, x, y, scale = 1) {
    g.lineStyle(Math.max(1, 2 * scale), 0x42494b, 1);
    g.strokeCircle(x - 13 * scale, y, 10 * scale);
    g.strokeCircle(x + 13 * scale, y, 10 * scale);
    g.lineBetween(x - 13 * scale, y, x, y - 16 * scale);
    g.lineBetween(x, y - 16 * scale, x + 13 * scale, y);
    g.lineBetween(x - 13 * scale, y, x + 5 * scale, y);
    g.lineBetween(x, y - 16 * scale, x + 7 * scale, y - 18 * scale);
  }

  function drawLamp(g, x, groundY, h = 90) {
    g.fillStyle(C.metal, 1);
    g.fillRect(x - 2, groundY - h, 4, h);
    g.fillStyle(C.metalDark || 0x3e4648, 1);
    g.fillRect(x - 5, groundY - h, 10, 4);
    g.fillStyle(0xe7e0c6, 0.9);
    g.fillCircle(x + 7, groundY - h + 2, 6);
    g.lineStyle(2, C.metal, 1);
    g.lineBetween(x, groundY - h + 1, x + 8, groundY - h + 1);
  }

  function drawPaving(g, x0, x1, y0, y1, base = C.paving) {
    g.fillStyle(base, 1);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.lineStyle(1, 0x8f8a82, 0.55);
    for (let y = y0 + 10, row = 0; y < y1; y += 13, row += 1) {
      g.lineBetween(x0, y, x1, y);
      const off = row % 2 ? 18 : 0;
      for (let x = x0 + off; x < x1; x += 36) {
        g.lineBetween(x, y - 10, x, Math.min(y1, y + 3));
      }
    }
  }

  // -------------------------------------------------------------------------
  // BAHNHOFSTRASSE / HB
  // -------------------------------------------------------------------------

  function createBahnhofSky(scene) {
    resetParallax(scene);
    const p = PARALLAX.bahnhof;

    const sky = trackParallax(scene, scene.add.graphics().setDepth(DEPTH.sky), p.sky);
    sky.fillStyle(C.skyTop, 1);
    sky.fillRect(-500, 0, BAHNHOF_WIDTH + 1300, 90);
    sky.fillStyle(C.skyMid, 1);
    sky.fillRect(-500, 90, BAHNHOF_WIDTH + 1300, 110);
    sky.fillStyle(C.skyLow, 1);
    sky.fillRect(-500, 200, BAHNHOF_WIDTH + 1300, 138);

    const clouds = trackParallax(scene, scene.add.graphics().setDepth(DEPTH.clouds), p.clouds);
    addCloud(clouds, 250, 67, 0.76);
    addCloud(clouds, 1080, 87, 0.55);
    addCloud(clouds, 1980, 59, 0.82);
    addCloud(clouds, 2890, 91, 0.58);

    // Far city is intentionally low contrast. Bahnhofstrasse is dense enough;
    // parallax should be felt, not look like sliding cardboard.
    const far = trackParallax(scene, scene.add.graphics().setDepth(DEPTH.far), p.far);
    const farColors = [0x9fa39d, 0xaaa494, 0x969e9b, 0xada597];
    for (let i = 0; i < 22; i += 1) {
      const x = 250 + i * 150;
      const w = 118 + (i % 3) * 12;
      const h = 70 + (i % 5) * 9;
      const y = GROUND_TOP - h - 58;
      far.fillStyle(farColors[i % farColors.length], 0.88);
      far.fillRect(x, y, w, h);
      far.fillStyle(i % 2 ? 0x68635d : 0x79584d, 0.86);
      far.fillTriangle(x - 3, y, x + w / 2, y - 18, x + w + 3, y);
      for (let wx = x + 14; wx < x + w - 8; wx += 28) {
        far.fillStyle(0x6d8287, 0.58);
        far.fillRect(wx, y + 23, 8, 11);
      }
    }

    // Mid roofs: old-city texture visible between the real street facades.
    const mid = trackParallax(scene, scene.add.graphics().setDepth(DEPTH.mid), p.mid);
    const midSpecs = [
      { x: 520, w: 135, h: 116, color: 0xb7aa91, roof: C.roofRed },
      { x: 760, w: 150, h: 134, color: 0xb8b3a4, roof: C.roofSlate },
      { x: 1120, w: 142, h: 127, color: 0xc2ae90, roof: C.roofRed },
      { x: 1510, w: 158, h: 142, color: 0xb4ad9d, roof: C.roofSlate },
      { x: 1920, w: 145, h: 128, color: 0xc0aa8e, roof: C.roofRed },
      { x: 2330, w: 155, h: 140, color: 0xb9b1a1, roof: C.roofSlate },
      { x: 2760, w: 145, h: 125, color: 0xc5b394, roof: C.roofRed }
    ];
    for (const spec of midSpecs) drawFacade(mid, spec, true);
  }

  function createHauptbahnhofFacadeV67() {
    const hb = this.add.graphics().setDepth(DEPTH.architecture);

    // Strong stone mass with a slightly darker side wing.
    hb.fillStyle(0xb9aa90, 1);
    hb.fillRect(0, 91, 415, 247);
    hb.fillStyle(0xa8977b, 1);
    hb.fillRect(0, 91, 64, 247);

    // Horizontal sandstone courses.
    hb.fillStyle(0x96866e, 1);
    hb.fillRect(0, 91, 415, 13);
    hb.fillRect(0, 134, 415, 7);
    hb.fillRect(0, 308, 415, 14);
    hb.lineStyle(1, 0xd5c8ae, 0.34);
    for (let y = 108; y < 306; y += 20) hb.lineBetween(0, y, 415, y);

    // Central arched portal and flanking arched windows.
    const arches = [42, 104, 280, 342];
    for (const x of arches) {
      hb.fillStyle(0x3e5663, 1);
      hb.fillCircle(x, 181, 20);
      hb.fillRect(x - 20, 181, 40, 62);
      hb.fillStyle(0x85a3aa, 0.42);
      hb.fillRect(x - 13, 181, 7, 53);
      hb.lineStyle(4, 0x746650, 1);
      hb.strokeCircle(x, 181, 20);
      hb.strokeRect(x - 20, 181, 40, 62);
    }

    hb.fillStyle(0x293c47, 1);
    hb.fillCircle(209, 204, 47);
    hb.fillRect(162, 204, 94, 134);
    hb.fillStyle(0x496872, 0.7);
    hb.fillRect(174, 212, 30, 112);
    hb.fillRect(214, 212, 30, 112);
    hb.lineStyle(5, 0x756850, 1);
    hb.strokeCircle(209, 204, 47);

    // Pilasters frame the entrance.
    hb.fillStyle(0xc8b99c, 1);
    [151, 257].forEach((x) => {
      hb.fillRect(x, 150, 9, 172);
      hb.fillRect(x - 4, 146, 17, 8);
    });

    // Clock in a compact pediment.
    hb.fillStyle(0xa09178, 1);
    hb.fillTriangle(150, 127, 209, 92, 268, 127);
    hb.fillStyle(0xf1ead9, 1);
    hb.fillCircle(209, 125, 21);
    hb.lineStyle(4, 0x48443f, 1);
    hb.strokeCircle(209, 125, 21);
    hb.lineBetween(209, 125, 209, 111);
    hb.lineBetween(209, 125, 219, 131);

    this.add.text(209, 78, "ZÜRICH HB", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "11px",
      color: "#fff0c5",
      stroke: "#5c503d",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(5);
  }

  function createBahnhofquaiStopV67() {
    const stop = this.add.graphics().setDepth(DEPTH.props);

    // Compact stop: leaves the x≈880 side-street mouth visually free for Polybahn.
    const left = 605;
    const right = 750;
    const roofY = 174;

    stop.fillStyle(C.metal, 1);
    stop.fillRect(left, roofY, 7, 116);
    stop.fillRect(right, roofY, 7, 116);
    stop.fillStyle(0x40494d, 1);
    stop.fillRect(left - 10, roofY - 9, right - left + 27, 11);
    stop.fillStyle(0xb9d8d7, 0.40);
    stop.fillRect(left + 10, roofY + 10, right - left - 13, 79);
    stop.lineStyle(3, 0x526166, 1);
    stop.strokeRect(left + 10, roofY + 10, right - left - 13, 79);

    // Bench and feet/contact shadows.
    stop.fillStyle(0x8a603f, 1);
    stop.fillRect(635, 250, 88, 8);
    stop.fillRect(642, 258, 6, 27);
    stop.fillRect(710, 258, 6, 27);
    stop.fillStyle(0x4a5153, 0.5);
    stop.fillEllipse(681, 291, 170, 8);

    // Slim VBZ pole and sign kept clear of the Polybahn alley.
    stop.fillStyle(C.metal, 1);
    stop.fillRect(777, 171, 6, 119);
    stop.fillStyle(0x216aa4, 1);
    stop.fillRect(690, 139, 96, 31);
    stop.lineStyle(2, 0xdcecf5, 0.72);
    stop.strokeRect(690, 139, 96, 31);

    this.add.text(738, 155, "BAHNHOFSTR./HB", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "4.8px",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5).setDepth(7);

    this.add.text(680, 126, "BAHNHOFSTRASSE / HB", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#fff8d9",
      stroke: "#28495b",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(5);
  }

  function addWasserkircheVista(scene) {
    // A narrow side-street opening near the lower Bahnhofstrasse hints at the
    // Limmat/Altstadt without pretending the church sits directly on this road.
    const x0 = 2595;
    const x1 = 2735;
    const g = scene.add.graphics().setDepth(DEPTH.vista);

    g.fillStyle(0x718d93, 0.86);
    g.fillRect(x0 + 8, 238, x1 - x0 - 16, 40);
    g.fillStyle(0x92b2b4, 0.62);
    g.fillRect(x0 + 8, 241, x1 - x0 - 16, 5);

    // Opposite-bank stone fronts.
    g.fillStyle(0xb8aa92, 1);
    g.fillRect(x0 + 18, 177, 42, 61);
    g.fillStyle(0xc4b99e, 1);
    g.fillRect(x1 - 54, 169, 42, 69);
    g.fillStyle(C.roofRed, 1);
    g.fillTriangle(x0 + 14, 177, x0 + 39, 160, x0 + 64, 177);
    g.fillStyle(C.roofSlate, 1);
    g.fillTriangle(x1 - 58, 169, x1 - 33, 150, x1 - 8, 169);

    // Wasserkirche-ish low church body with steep dark roof in the distance.
    g.fillStyle(0xb6ad9c, 1);
    g.fillRect(x0 + 60, 190, 58, 48);
    g.fillStyle(0x55595a, 1);
    g.fillTriangle(x0 + 54, 190, x0 + 89, 158, x0 + 124, 190);
    g.fillStyle(0x4e6268, 1);
    g.fillRect(x0 + 83, 205, 13, 25);
    g.fillStyle(0xd2c7b3, 1);
    g.fillRect(x0 + 112, 178, 7, 34);
    g.fillTriangle(x0 + 109, 178, x0 + 116, 164, x0 + 123, 178);

    // Foreground parapet frames the view like a real side-street glimpse.
    g.fillStyle(0x8b8479, 1);
    g.fillRect(x0, 274, x1 - x0, 8);
    g.lineStyle(2, 0x5c6262, 1);
    for (let x = x0 + 8; x < x1 - 5; x += 19) {
      g.lineBetween(x, 255, x, 274);
    }
    g.lineBetween(x0 + 5, 255, x1 - 5, 255);
  }

  function createBahnhofstrasseV67() {
    const g = this.add.graphics().setDepth(DEPTH.architecture);

    // Gameplay landmarks keep their original positions. Filler architecture is
    // built around them so hitboxes/story code never need coordinate migration.
    const filler = [
      { x: 990,  w: 178, h: 172, color: C.plasterCream, roof: C.roofRed, floors: 4, ground: "arcade", balcony: true },
      { x: 1178, w: 214, h: 188, color: C.plasterGrey, roof: C.roofSlate, floors: 4, ground: "passage" },
      // Der Inder: 1420..1638
      { x: 1648, w: 226, h: 181, color: C.plasterWarm, roof: C.roofRed, floors: 4, ground: "arcade", balcony: true },
      // Orell: 1890..2160; shoe store: 2174..2436
      { x: 2448, w: 138, h: 174, color: C.plasterOlive, roof: C.roofSlate, floors: 4, ground: "service" },
      // 2595..2735 deliberately open toward Limmat/Wasserkirche.
      { x: 2742, w: 240, h: 193, color: C.plasterRose, roof: C.roofRed, floors: 4, ground: "arcade", balcony: true }
    ];
    filler.forEach((spec) => drawFacade(g, spec, false));

    // Narrow seams, passages and service corners make the street dense without
    // inventing fake shops or interaction targets.
    g.fillStyle(0x252b2d, 1);
    g.fillRect(1395, 238, 18, 100);
    g.fillRect(1638, 250, 10, 88);
    g.fillRect(1875, 246, 11, 92);
    g.fillRect(2437, 240, 11, 98);
    g.fillRect(2586, 226, 9, 112);

    // Stone service wall and posters near the lower end of the street.
    g.fillStyle(0x8d887f, 1);
    g.fillRect(2510, 272, 76, 46);
    g.fillStyle(0x5b6264, 1);
    g.fillRect(2520, 282, 23, 32);
    const posters = [0x77606a, 0x60747a, 0x8b7553];
    posters.forEach((color, i) => {
      g.fillStyle(0x363b3c, 1);
      g.fillRect(2549 + i * 11, 282, 9, 25);
      g.fillStyle(color, 1);
      g.fillRect(2550 + i * 11, 283, 7, 22);
    });

    addWasserkircheVista(this);

    // Street trees are sparse enough not to hide interactive facades.
    const trees = this.add.graphics().setDepth(DEPTH.propsBack);
    [1270, 1745, 2490, 2860].forEach((x, i) => drawTree(trees, x, GROUND_TOP, i % 2 ? 0.86 : 0.93));

    // Integrated street plaque instead of the old floating arrow label.
    const sign = this.add.graphics().setDepth(5);
    sign.fillStyle(0x3f4b4e, 1);
    sign.fillRect(1078, 248, 106, 23);
    sign.lineStyle(2, 0xd9d3c1, 0.72);
    sign.strokeRect(1078, 248, 106, 23);
    this.add.text(1131, 260, "BAHNHOFSTRASSE", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      color: "#f3efdf"
    }).setOrigin(0.5).setDepth(6);
  }

  function addStoreIntegrationPolish(scene) {
    if (scene.__z67StoreIntegration) return;
    scene.__z67StoreIntegration = true;

    const back = scene.add.graphics().setDepth(-2.5);

    // Der Inder: warm upper masonry and roof make the vivid storefront part of
    // a normal Zürich building instead of a standalone game prop.
    back.fillStyle(0xc3a782, 1);
    back.fillRect(1412, 122, 234, 42);
    back.fillStyle(C.roofRed, 1);
    back.fillTriangle(1408, 122, 1529, 94, 1650, 122);
    back.fillStyle(0x6b5d50, 1);
    back.fillRect(1440, 104, 8, 17);
    back.fillRect(1607, 105, 8, 16);

    // Orell: restrained stone cornice/upper floor around the existing red sign.
    back.fillStyle(0xc7c0b1, 1);
    back.fillRect(1882, 112, 286, 39);
    back.fillStyle(C.roofSlate, 1);
    back.fillTriangle(1878, 112, 2025, 85, 2172, 112);

    // Shoe shop: neon remains intentionally strange, but is now embedded in a
    // narrow stone arcade building rather than floating as a black rectangle.
    back.fillStyle(0x8d8880, 1);
    back.fillRect(2166, 112, 278, 42);
    back.fillStyle(C.roofSlate, 1);
    back.fillRect(2162, 103, 286, 12);
    back.fillStyle(0x696b68, 1);
    back.fillRect(2182, 91, 34, 12);
    back.fillRect(2393, 88, 28, 15);

    const front = scene.add.graphics().setDepth(-0.5);
    front.fillStyle(0x8c8171, 1);
    front.fillRect(1415, 148, 6, 170);
    front.fillRect(1638, 148, 6, 170);
    front.fillStyle(0xa49b8c, 1);
    front.fillRect(1886, 140, 5, 179);
    front.fillRect(2160, 140, 5, 179);
    front.fillStyle(0x606568, 1);
    front.fillRect(2169, 138, 5, 181);
    front.fillRect(2436, 138, 5, 181);
  }

  function createBahnhofStreetAndRails(scene) {
    const street = scene.add.graphics().setDepth(DEPTH.street);

    // Tram street: here continuous rails ARE geographically intentional.
    street.fillStyle(C.asphalt, 1);
    street.fillRect(0, 279, BAHNHOF_WIDTH, 50);
    street.fillStyle(C.asphaltDark, 0.52);
    street.fillRect(0, 299, BAHNHOF_WIDTH, 3);

    // Twin rails with restrained sleepers / inset paving.
    street.fillStyle(0x404544, 1);
    street.fillRect(0, 300, BAHNHOF_WIDTH, 4);
    street.fillRect(0, 321, BAHNHOF_WIDTH, 4);
    street.fillStyle(0xb5a88f, 0.52);
    for (let x = 0; x < BAHNHOF_WIDTH; x += 28) street.fillRect(x, 304, 4, 16);

    // Curb / pavement along the walkable side.
    street.fillStyle(C.pavingLight, 1);
    street.fillRect(415, 327, BAHNHOF_WIDTH - 415, 11);
    street.fillStyle(0x989288, 1);
    street.fillRect(415, 327, BAHNHOF_WIDTH - 415, 3);
    drawPaving(street, 0, BAHNHOF_WIDTH, GROUND_TOP, GAME_HEIGHT, 0x746b62);

    // Crossings make side-street / landmark transitions legible.
    [855, 1398, 1878, 2442, 2590].forEach((cx) => {
      street.fillStyle(0xc2baa9, 0.72);
      for (let i = -3; i <= 3; i += 1) {
        street.fillRect(cx + i * 11, 286, 7, 39);
      }
    });

    // Overhead wires use fewer poles than the old placeholder and line up with
    // the actual tram corridor instead of cluttering every facade.
    const wires = scene.add.graphics().setDepth(4);
    const poles = [500, 1120, 1710, 2300, 2880];
    for (const x of poles) {
      wires.fillStyle(C.metal, 1);
      wires.fillRect(x, 84, 5, 221);
      wires.fillStyle(C.metalLight, 1);
      wires.fillRect(x - 3, 83, 11, 5);
    }
    wires.lineStyle(2, 0x545b5d, 0.85);
    for (let i = 0; i < poles.length - 1; i += 1) {
      wires.lineBetween(poles[i], 98, poles[i + 1], 107);
      const mid = (poles[i] + poles[i + 1]) / 2;
      wires.lineBetween(poles[i], 98, mid, 113);
      wires.lineBetween(mid, 113, poles[i + 1], 107);
    }

    // Small non-interactive urban detail.
    const props = scene.add.graphics().setDepth(DEPTH.props);
    [1195, 1800, 2470, 2810].forEach((x) => drawLamp(props, x, 327, 88));
    drawBike(props, 1325, 322, 0.78);
    drawBike(props, 1818, 322, 0.78);
    drawBike(props, 2528, 322, 0.78);

    [1250, 1768, 2498].forEach((x) => {
      props.fillStyle(0x74736b, 1);
      props.fillRect(x, 313, 22, 14);
      props.fillStyle(0x426f4b, 1);
      props.fillCircle(x + 11, 309, 13);
    });
  }

  function createBahnhofquaiWorldV67() {
    try {
      createBahnhofSky(this);

      this.createHauptbahnhofFacade();
      this.createBahnhofquaiStop();
      this.createBahnhofstrasse();
      this.createBahnhofstrasseTicketMachine();
      this.createIndianStoreExterior();
      this.createOrellFuessliExterior();
      this.createShoeStoreExterior();

      addStoreIntegrationPolish(this);
      createBahnhofStreetAndRails(this);

      // Keep the base gameplay boundary and tram factory exactly where story
      // code expects them.
      this.hbBoundary = this.add.rectangle(415, 205, 18, 410, 0x000000, 0);
      this.physics.add.existing(this.hbBoundary, true);
      this.createArrivalTram();

      syncParallax(this, true);
    } catch (error) {
      console.error(`[Zürich Outdoor v${VERSION}] Bahnhof world failed:`, error);
      throw error;
    }
  }

  function polishLowerPolybahn(scene, attempt = 0) {
    if (!scene?.sys?.isActive?.() || scene.__z67LowerPolybahnPolished) return;
    const entry = scene.__ethCampusEntryV59;

    if (!entry) {
      if (attempt < 12) scene.time?.delayedCall?.(30, () => polishLowerPolybahn(scene, attempt + 1));
      return;
    }

    scene.__z67LowerPolybahnPolished = true;

    // Preserve exact interaction coordinates. Only framing/depth is improved.
    entry.street?.setDepth?.(1.2);
    entry.station?.setDepth?.(3.2);
    entry.sign?.setDepth?.(5.2);

    const x = Number(entry.x) || 880;
    const g = scene.add.graphics().setDepth(0.8);

    // Deep side-street walls frame the perspective road already provided by ETH v59.
    g.fillStyle(0x8e887d, 1);
    g.fillRect(x - 131, 102, 19, 181);
    g.fillRect(x + 112, 96, 19, 187);
    g.fillStyle(0x5a5f60, 1);
    g.fillRect(x - 126, 118, 7, 148);
    g.fillRect(x + 119, 112, 7, 154);

    // Stairs/road joints become progressively tighter toward Central.
    g.lineStyle(2, 0x8d8a82, 0.65);
    [320, 301, 282, 265, 249, 235, 222, 211].forEach((y, i) => {
      const half = 72 - i * 7;
      g.lineBetween(x - half, y, x + half, y);
    });

    // A little awning/cornice ties the tiny lower station to the red Polybahn identity.
    g.fillStyle(C.polyRedDark, 1);
    g.fillRect(x - 49, 134, 98, 6);

    const label = scene.add.text(x, 124, "CENTRAL", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "4px",
      color: "#e9dfc9",
      stroke: "#4d4540",
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(5.1);

    scene.__z67LowerPolybahnPolishObjects = [g, label];
  }

  function patchBahnhofPrototype() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;
    const proto = SceneClass?.prototype;
    if (!proto || proto.__zurichOutdoorV67) return Boolean(proto);
    proto.__zurichOutdoorV67 = true;

    const safeReplace = (name, replacement) => {
      if (typeof proto[name] !== "function") return;
      const original = proto[name];
      proto[name] = function zurichV67Visual(...args) {
        try {
          return replacement.apply(this, args);
        } catch (error) {
          console.error(`[Zürich Outdoor v${VERSION}] ${name} fallback:`, error);
          return original.apply(this, args);
        }
      };
      proto[name].__zurichOutdoorV67 = true;
      proto[name].__previousV67 = original;
    };

    safeReplace("createBahnhofquaiWorld", createBahnhofquaiWorldV67);
    safeReplace("createHauptbahnhofFacade", createHauptbahnhofFacadeV67);
    safeReplace("createBahnhofquaiStop", createBahnhofquaiStopV67);
    safeReplace("createBahnhofstrasse", createBahnhofstrasseV67);

    if (typeof proto.update === "function") {
      const previousUpdate = proto.update;
      proto.update = function updateBahnhofV67(...args) {
        const result = previousUpdate.apply(this, args);
        syncParallax(this);
        return result;
      };
      proto.update.__zurichOutdoorV67 = true;
    }

    if (typeof proto.create === "function") {
      const previousCreate = proto.create;
      proto.create = function createBahnhofV67(...args) {
        const result = previousCreate.apply(this, args);
        syncParallax(this, true);
        // ETH v59 creates its lower Polybahn entry on a zero-delay call.
        this.time?.delayedCall?.(20, () => polishLowerPolybahn(this));
        return result;
      };
      proto.create.__zurichOutdoorV67 = true;
    }

    return true;
  }

  // -------------------------------------------------------------------------
  // POLYBAHN TRANSIT
  // -------------------------------------------------------------------------

  function drawTransitMiniFacade(g, x, y, w, h, color, roof = C.roofRed) {
    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(roof, 1);
    g.fillTriangle(x - 3, y, x + w / 2, y - 16, x + w + 3, y);
    for (let wy = y + 19; wy < y + h - 11; wy += 28) {
      for (let wx = x + 11; wx < x + w - 8; wx += 26) {
        g.fillStyle(C.window, 0.9);
        g.fillRect(wx, wy, 8, 12);
      }
    }
  }

  function createTransitVisualsV67() {
    const up = this.direction === "up";

    const sky = this.add.graphics().setDepth(-60);
    sky.fillStyle(C.skyTop, 1);
    sky.fillRect(0, 0, GAME_WIDTH, 115);
    sky.fillStyle(C.skyMid, 1);
    sky.fillRect(0, 115, GAME_WIDTH, 125);
    sky.fillStyle(C.skyLow, 1);
    sky.fillRect(0, 240, GAME_WIDTH, 150);

    // Far Alps / Uetliberg.
    const far = this.add.container(0, 0).setDepth(-50);
    const fg = this.add.graphics();
    fg.fillStyle(0xa6b9b0, 0.86);
    fg.fillTriangle(-70, 230, 165, 94, 430, 230);
    fg.fillTriangle(240, 230, 515, 121, 800, 230);
    fg.fillTriangle(590, 230, 770, 145, 930, 230);
    fg.fillStyle(0xe2e7dd, 0.54);
    fg.fillTriangle(116, 124, 165, 94, 215, 125);
    far.add(fg);

    // Distant downtown + Limmat. Grossmünster silhouettes connect this ride to
    // the same panorama seen later from Polyterrasse.
    const city = this.add.container(0, 0).setDepth(-40);
    const cg = this.add.graphics();
    cg.fillStyle(C.water, 0.72);
    cg.fillRect(0, 250, 420, 68);
    cg.fillStyle(C.waterLight, 0.45);
    cg.fillRect(0, 253, 420, 5);
    for (let i = 0; i < 10; i += 1) {
      const x = -30 + i * 70;
      const h = 42 + (i % 4) * 10;
      drawTransitMiniFacade(cg, x, 248 - h, 58, h, i % 2 ? 0xb5aa97 : 0xc1b298, i % 3 ? C.roofRed : C.roofSlate);
    }
    cg.fillStyle(0x9d9586, 1);
    [318, 344].forEach((x) => {
      cg.fillRect(x, 138, 18, 108);
      cg.fillStyle(C.roofSlate, 1);
      cg.fillTriangle(x - 3, 138, x + 9, 112, x + 21, 138);
      cg.fillStyle(0x9d9586, 1);
    });
    city.add(cg);

    // Mid hillside: tightly packed Zürich houses and vegetation step up the slope.
    const mid = this.add.container(0, 0).setDepth(-24);
    const mg = this.add.graphics();
    const blocks = [
      [-50, 244, 104, 116, 0xc5af90],
      [38, 212, 98, 128, 0xbfb4a0],
      [125, 183, 96, 133, 0xd1bea0],
      [592, 172, 100, 134, 0xb9ae9d],
      [670, 138, 104, 146, 0xcfb99b],
      [755, 109, 100, 151, 0xb7afa1]
    ];
    blocks.forEach(([x, y, w, h, color], i) => drawTransitMiniFacade(mg, x, y, w, h, color, i % 2 ? C.roofSlate : C.roofRed));
    [210, 255, 548, 588].forEach((x, i) => drawTree(mg, x, 320 - i * 23, 0.55));
    mid.add(mg);

    // Near cut-slope / retaining walls create a narrow physical corridor.
    const near = this.add.container(0, 0).setDepth(-3);
    const ng = this.add.graphics();
    ng.fillStyle(0x77756e, 1);
    ng.fillTriangle(-20, 390, 125, 390, 300, 244);
    ng.fillTriangle(540, 146, 820, 0, 840, 178);
    ng.lineStyle(2, 0xa39d90, 0.6);
    for (let i = 0; i < 7; i += 1) {
      ng.lineBetween(8 + i * 20, 369 - i * 10, 175 + i * 15, 369 - i * 10);
    }
    ng.fillStyle(C.treeDark, 1);
    ng.fillCircle(91, 306, 29);
    ng.fillCircle(739, 84, 34);
    ng.fillStyle(C.tree, 1);
    ng.fillCircle(123, 284, 22);
    ng.fillCircle(702, 105, 25);
    near.add(ng);

    // Fixed funicular track with sleepers, side cable and station portals.
    const rail = this.add.graphics().setDepth(6);
    rail.lineStyle(10, 0x4d4d49, 1);
    rail.lineBetween(138, 340, 684, 75);
    rail.lineStyle(3, 0xd6cab5, 1);
    rail.lineBetween(129, 343, 675, 78);
    rail.lineBetween(147, 337, 693, 72);
    for (let t = 0.02; t < 0.99; t += 0.052) {
      const x = Phaser.Math.Linear(138, 684, t);
      const y = Phaser.Math.Linear(340, 75, t);
      rail.lineStyle(3, 0x3f403e, 1);
      rail.lineBetween(x - 15, y + 5, x + 15, y - 5);
    }
    rail.lineStyle(2, 0x646a6c, 0.9);
    rail.lineBetween(103, 350, 650, 86);

    // Lower and upper portals visually match the stations in adjacent scenes.
    rail.fillStyle(C.stone, 1);
    rail.fillRoundedRect(79, 299, 92, 62, 7);
    rail.fillStyle(C.polyRed, 1);
    rail.fillRect(86, 309, 78, 13);
    rail.fillStyle(0x263b42, 1);
    rail.fillRoundedRect(105, 326, 42, 35, 12);

    rail.fillStyle(C.stoneLight, 1);
    rail.fillRoundedRect(654, 38, 102, 63, 7);
    rail.fillStyle(C.polyRed, 1);
    rail.fillRect(661, 48, 88, 13);
    rail.fillStyle(0x263b42, 1);
    rail.fillRoundedRect(682, 65, 44, 36, 12);

    // Cabin: richer than the v59 placeholder but preserves the same footprint.
    const cabin = this.add.container(0, 0).setDepth(35);
    const cab = this.add.graphics();
    cab.fillStyle(C.polyRedDark, 0.35);
    cab.fillRoundedRect(-61, -41, 122, 88, 9);
    cab.fillStyle(C.polyRed, 1);
    cab.fillRoundedRect(-58, -45, 116, 86, 8);
    cab.fillStyle(0xe9dfc9, 1);
    cab.fillRect(-54, -40, 108, 10);
    cab.lineStyle(4, 0xf1dfc5, 1);
    cab.strokeRoundedRect(-58, -45, 116, 86, 8);
    cab.fillStyle(0x29464f, 1);
    cab.fillRect(-45, -27, 33, 32);
    cab.fillRect(12, -27, 33, 32);
    cab.fillStyle(0x7fa0a6, 0.45);
    cab.fillRect(-40, -23, 9, 24);
    cab.fillRect(17, -23, 9, 24);
    cab.fillStyle(0xe7d9bf, 1);
    cab.fillRect(-5, -36, 10, 68);
    cab.fillStyle(0x3c3b3a, 1);
    cab.fillCircle(-34, 44, 10);
    cab.fillCircle(34, 44, 10);
    cabin.add(cab);

    if (this.textures.exists("simon")) {
      const simon = this.add.sprite(0, 12, "simon", 0).setScale(0.19).setOrigin(0.5, 1);
      cabin.add(simon);
    }

    cabin.setPosition(up ? 145 : 680, up ? 318 : 60);

    this.__transitCabinV56 = cabin;
    this.__transitHousesV56 = mid; // compatibility with any older recovery code
    this.__z67TransitLayers = { far, city, mid, near };

    this.add.text(GAME_WIDTH / 2, 28, up ? "POLYBAHN · POLYTERRASSE" : "POLYBAHN · CENTRAL", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      color: "#fff1d1",
      stroke: "#373c3e",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(60);
  }

  function startTransitV67() {
    if (this.__finishedV56) return;
    const up = this.direction === "up";
    const m = up ? 1 : -1;
    const target = up ? { x: 680, y: 60 } : { x: 145, y: 318 };
    const layers = this.__z67TransitLayers || {};

    const drift = (targetObject, dx, dy) => {
      if (!targetObject?.active) return;
      this.tweens.add({
        targets: targetObject,
        x: (Number(targetObject.x) || 0) + dx * m,
        y: (Number(targetObject.y) || 0) + dy * m,
        duration: 2850,
        ease: "Sine.easeInOut"
      });
    };

    // Perspective response: the closer the layer, the more it drifts during
    // the climb. The fixed rail stays put as the physical reference.
    drift(layers.far, -3, 8);
    drift(layers.city, -7, 19);
    drift(layers.mid, -15, 38);
    drift(layers.near, -28, 67);

    this.tweens.add({
      targets: this.__transitCabinV56,
      x: target.x,
      y: target.y,
      duration: 2850,
      ease: "Sine.easeInOut",
      onComplete: () => this.finishTransit()
    });
  }

  function patchTransitScene(scene) {
    if (!scene || scene.__zurichOutdoorV67) return Boolean(scene);
    scene.__zurichOutdoorV67 = true;

    if (typeof scene.createTransitVisuals === "function") {
      const original = scene.createTransitVisuals.bind(scene);
      scene.createTransitVisuals = function createTransitVisualsZ67(...args) {
        try {
          return createTransitVisualsV67.apply(this, args);
        } catch (error) {
          console.error(`[Zürich Outdoor v${VERSION}] Polybahn visuals fallback:`, error);
          return original(...args);
        }
      };
    }

    if (typeof scene.startTransit === "function") {
      const original = scene.startTransit.bind(scene);
      scene.startTransit = function startTransitZ67(...args) {
        try {
          return startTransitV67.apply(this, args);
        } catch (error) {
          console.error(`[Zürich Outdoor v${VERSION}] Polybahn movement fallback:`, error);
          return original(...args);
        }
      };
    }

    return true;
  }

  // -------------------------------------------------------------------------
  // POLYTERRASSE
  // -------------------------------------------------------------------------

  function drawPanoramaHouse(g, x, baseY, w, h, color, roof) {
    g.fillStyle(color, 1);
    g.fillRect(x, baseY - h, w, h);
    g.fillStyle(roof, 1);
    g.fillTriangle(x - 2, baseY - h, x + w / 2, baseY - h - 13, x + w + 2, baseY - h);
    g.fillStyle(0x546f79, 0.72);
    for (let wx = x + 8; wx < x + w - 5; wx += 18) {
      for (let wy = baseY - h + 16; wy < baseY - 10; wy += 22) {
        g.fillRect(wx, wy, 6, 9);
      }
    }
  }

  function drawPanoramaLandmarks(g) {
    // Fraumünster-ish slim green spire.
    g.fillStyle(0xa7a095, 1);
    g.fillRect(514, 157, 18, 73);
    g.fillStyle(0x5c756b, 1);
    g.fillTriangle(510, 157, 523, 111, 536, 157);

    // Wasserkirche / Helmhaus low silhouette beside the Limmat.
    g.fillStyle(0xb6ad9c, 1);
    g.fillRect(556, 191, 53, 39);
    g.fillStyle(0x565b5c, 1);
    g.fillTriangle(551, 191, 582, 165, 614, 191);

    // Grossmünster-ish twin towers, the dominant old-town landmark.
    g.fillStyle(0x9f988b, 1);
    [648, 678].forEach((x) => {
      g.fillRect(x, 140, 22, 90);
      g.fillStyle(0x555b59, 1);
      g.fillTriangle(x - 3, 140, x + 11, 111, x + 25, 140);
      g.fillStyle(0x9f988b, 1);
    });

    // One distant modern vertical breaks the roofline without dominating it.
    g.fillStyle(0x7e9193, 0.78);
    g.fillRect(270, 139, 20, 91);
    g.fillStyle(0x9eb0ae, 0.48);
    g.fillRect(274, 145, 5, 77);
  }

  function createTerraceArchitectureV67() {
    resetParallax(this);
    const p = PARALLAX.terrace;

    // Sky.
    const sky = trackParallax(this, this.add.graphics().setDepth(DEPTH.sky), p.sky);
    sky.fillStyle(C.skyTop, 1);
    sky.fillRect(-450, 0, TERRACE_WIDTH + 1100, 90);
    sky.fillStyle(C.skyMid, 1);
    sky.fillRect(-450, 90, TERRACE_WIDTH + 1100, 110);
    sky.fillStyle(C.skyLow, 1);
    sky.fillRect(-450, 200, TERRACE_WIDTH + 1100, 138);

    const clouds = trackParallax(this, this.add.graphics().setDepth(DEPTH.clouds), p.clouds);
    addCloud(clouds, 155, 62, 0.68);
    addCloud(clouds, 840, 82, 0.52);
    addCloud(clouds, 1510, 58, 0.72);

    // Alps: low-contrast, very far.
    const alps = trackParallax(this, this.add.graphics().setDepth(DEPTH.far), p.alps);
    alps.fillStyle(0xa8b8af, 0.86);
    const peaks = [
      [-260, 224], [20, 174], [245, 219], [475, 158], [720, 220],
      [955, 166], [1210, 222], [1465, 170], [1730, 219], [2030, 162]
    ];
    alps.beginPath();
    alps.moveTo(-300, 245);
    peaks.forEach(([x, y]) => alps.lineTo(x, y));
    alps.lineTo(2100, 245);
    alps.closePath();
    alps.fillPath();
    alps.fillStyle(0xe1e8df, 0.54);
    [[475,158],[955,166],[1465,170]].forEach(([x,y]) => {
      alps.fillTriangle(x - 35, y + 23, x, y, x + 34, y + 24);
    });

    // Uetliberg / wooded hills.
    const hills = trackParallax(this, this.add.graphics().setDepth(DEPTH.mid), p.hills);
    hills.fillStyle(C.mountainNear, 0.88);
    hills.beginPath();
    hills.moveTo(-300, 250);
    [[-200,222],[90,194],[390,221],[690,186],[990,220],[1280,190],[1580,218],[2020,181]].forEach(([x,y]) => hills.lineTo(x,y));
    hills.lineTo(2100, 250);
    hills.closePath();
    hills.fillPath();
    hills.fillStyle(C.treeDark, 0.55);
    for (let x = -100; x < 2000; x += 46) {
      hills.fillTriangle(x, 247, x + 15, 214 - ((x * 7) % 18), x + 30, 247);
    }

    // Lake/Limmat haze behind the city.
    const cityFar = trackParallax(this, this.add.graphics().setDepth(-30), p.cityFar);
    cityFar.fillStyle(C.water, 0.78);
    cityFar.fillRect(-250, 219, TERRACE_WIDTH + 700, 48);
    cityFar.fillStyle(C.waterLight, 0.48);
    cityFar.fillRect(-250, 222, TERRACE_WIDTH + 700, 5);

    // Far city roof field.
    const farColors = [0xb9ae99, 0xc3b49a, 0xaaa99f, 0xc0aa90];
    for (let i = 0; i < 26; i += 1) {
      const x = -180 + i * 82;
      const w = 58 + (i % 3) * 7;
      const h = 30 + (i % 5) * 7;
      drawPanoramaHouse(cityFar, x, 245, w, h, farColors[i % farColors.length], i % 3 ? C.roofRed : C.roofSlate);
    }

    // Near old town / landmark layer.
    const cityNear = trackParallax(this, this.add.graphics().setDepth(-20), p.cityNear);
    const nearColors = [0xc9b594, 0xd0bea0, 0xbcb4a5, 0xc5a98d];
    for (let i = 0; i < 16; i += 1) {
      const x = -80 + i * 100;
      const w = 70 + (i % 2) * 10;
      const h = 44 + (i % 4) * 8;
      drawPanoramaHouse(cityNear, x, 248, w, h, nearColors[i % nearColors.length], i % 3 ? C.roofRed : C.roofSlate);
    }
    drawPanoramaLandmarks(cityNear);

    // WORLD: terrace architecture does not parallax; Simon walks directly on it.
    const world = this.add.graphics().setDepth(DEPTH.architecture);

    // Stone balustrade allows the panorama to remain readable below its top edge.
    world.fillStyle(0x7d7971, 1);
    world.fillRect(0, 245, 1115, 10);
    world.fillStyle(0xaaa297, 1);
    world.fillRect(0, 245, 1115, 4);
    for (let x = 10; x < 1110; x += 24) {
      world.fillStyle(0x817e77, 1);
      world.fillRect(x, 254, 7, 24);
      world.fillStyle(0x99938a, 1);
      world.fillRect(x - 2, 253, 11, 4);
    }

    // Paving: warm, clean and clearly exterior.
    world.fillStyle(0xb1aba1, 1);
    world.fillRect(0, 276, TERRACE_WIDTH, 62);
    world.fillStyle(0xc6c0b5, 1);
    world.fillRect(0, 286, TERRACE_WIDTH, 52);
    world.fillStyle(0xd5cfc3, 1);
    world.fillRect(0, 286, TERRACE_WIDTH, 7);
    world.lineStyle(1, 0x98938c, 0.65);
    for (let y = 300; y < 338; y += 18) world.lineBetween(0, y, TERRACE_WIDTH, y);
    for (let row = 0, y = 292; y < 338; row += 1, y += 18) {
      const off = row % 2 ? 34 : 0;
      for (let x = off; x < TERRACE_WIDTH; x += 68) world.lineBetween(x, y, x, Math.min(338, y + 18));
    }

    // Upper Polybahn station: same red/stone identity as lower station and transit portals.
    world.fillStyle(C.stone, 1);
    world.fillRoundedRect(28, 122, 272, 164, 6);
    world.fillStyle(C.stoneDark, 1);
    world.fillRect(22, 116, 284, 11);
    world.fillStyle(C.polyRed, 1);
    world.fillRect(35, 151, 258, 31);
    world.fillStyle(0x334b53, 1);
    world.fillCircle(164, 219, 49);
    world.fillRect(115, 219, 98, 67);
    world.fillStyle(0x1f353d, 1);
    world.fillCircle(164, 221, 38);
    world.fillRect(126, 221, 76, 65);
    world.lineStyle(4, 0xd7cbb7, 1);
    world.strokeCircle(164, 219, 49);
    world.fillStyle(0x4d6268, 1);
    world.fillRect(53, 196, 38, 47);
    world.fillRect(237, 196, 38, 47);

    this.add.text(164, 167, "POLYBAHN", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#fff0d4"
    }).setOrigin(0.5).setDepth(3);
    this.add.text(164, 139, "POLYTERRASSE", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "4.5px",
      color: "#5e5449"
    }).setOrigin(0.5).setDepth(3);

    // ETH main building: more coherent neoclassical mass, still uses x=1458 door.
    const eth = this.add.graphics().setDepth(-4);
    const left = 1215;
    const top = 63;
    const width = 485;

    eth.fillStyle(0xc9beab, 1);
    eth.fillRect(left, top, width, 223);
    eth.fillStyle(0xb2a694, 1);
    eth.fillRect(left, top + 31, width, 12);
    eth.fillRect(left, top + 177, width, 12);
    eth.fillStyle(0xd8cdbb, 1);
    eth.fillRect(left + 153, top - 18, 180, 241);
    eth.fillStyle(0x8a847b, 1);
    eth.fillTriangle(left + 142, top - 18, left + 243, top - 55, left + 344, top - 18);

    // Central pilasters / entablature.
    eth.fillStyle(0xe0d5c2, 1);
    [left + 170, left + 203, left + 276, left + 309].forEach((x) => {
      eth.fillRect(x, top + 38, 8, 139);
      eth.fillRect(x - 3, top + 35, 14, 6);
    });

    // Repeated arched windows.
    for (const y of [top + 61, top + 125]) {
      for (let x = left + 31; x < left + width - 18; x += 49) {
        eth.fillStyle(0x48626b, 1);
        eth.fillCircle(x, y, 9);
        eth.fillRect(x - 9, y, 18, 25);
        eth.fillStyle(0x8ba6aa, 0.35);
        eth.fillRect(x - 5, y + 2, 4, 18);
        eth.lineStyle(2, 0xe6ddca, 1);
        eth.strokeCircle(x, y, 9);
        eth.strokeRect(x - 9, y, 18, 25);
      }
    }

    const doorX = 1458;
    eth.fillStyle(0x383634, 1);
    eth.fillCircle(doorX, 225, 40);
    eth.fillRect(doorX - 40, 225, 80, 61);
    eth.fillStyle(0x26373d, 1);
    eth.fillRect(doorX - 29, 228, 58, 58);
    eth.lineStyle(4, 0xe0d4bd, 1);
    eth.strokeCircle(doorX, 225, 40);

    // Stone steps anchor the door to the terrace.
    eth.fillStyle(0xa49c90, 1);
    eth.fillRect(doorX - 58, 278, 116, 8);
    eth.fillStyle(0xb9b1a4, 1);
    eth.fillRect(doorX - 48, 270, 96, 8);

    this.add.text(1458, 34, "ETH ZÜRICH", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#403b35",
      stroke: "#efe6d4",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(2);

    // Terrace life: benches, trees, lights and bicycles, all non-interactive.
    const props = this.add.graphics().setDepth(DEPTH.props);
    [438, 710, 1010].forEach((x) => {
      props.fillStyle(0x6d523c, 1);
      props.fillRoundedRect(x - 42, 277, 84, 8, 2);
      props.fillStyle(0x48423d, 1);
      props.fillRect(x - 33, 284, 5, 18);
      props.fillRect(x + 28, 284, 5, 18);
    });
    drawBike(props, 928, 298, 0.88);
    drawBike(props, 982, 298, 0.88);
    drawLamp(props, 345, 286, 86);
    drawLamp(props, 1110, 286, 86);

    // Planters/trees soften the huge terrace without obscuring the view.
    [365, 1118].forEach((x, i) => {
      props.fillStyle(0x80796d, 1);
      props.fillRect(x - 18, 270, 36, 16);
      props.fillStyle(C.treeDark, 1);
      props.fillCircle(x, 252, i ? 22 : 19);
      props.fillStyle(C.tree, 1);
      props.fillCircle(x - 13, 258, 13);
      props.fillCircle(x + 13, 258, 13);
    });

    // Discreet engraved location plaque rather than a floating label.
    const plaque = this.add.graphics().setDepth(4);
    plaque.fillStyle(0x77736c, 1);
    plaque.fillRect(618, 263, 116, 20);
    plaque.lineStyle(2, 0xbdb5a6, 0.75);
    plaque.strokeRect(618, 263, 116, 20);
    this.add.text(676, 273, "POLYTERRASSE", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      color: "#eee6d5"
    }).setOrigin(0.5).setDepth(5);

    syncParallax(this, true);
  }

  function patchTerraceScene(scene) {
    if (!scene || scene.__zurichOutdoorV67) return Boolean(scene);
    scene.__zurichOutdoorV67 = true;

    if (typeof scene.createTerraceArchitecture === "function") {
      const original = scene.createTerraceArchitecture.bind(scene);
      scene.createTerraceArchitecture = function createTerraceArchitectureZ67(...args) {
        try {
          return createTerraceArchitectureV67.apply(this, args);
        } catch (error) {
          console.error(`[Zürich Outdoor v${VERSION}] Polyterrasse fallback:`, error);
          return original(...args);
        }
      };
    }

    if (typeof scene.update === "function") {
      const originalUpdate = scene.update.bind(scene);
      scene.update = function updateTerraceZ67(...args) {
        const result = originalUpdate(...args);
        syncParallax(this);
        return result;
      };
    }

    return true;
  }

  // -------------------------------------------------------------------------
  // Installation / stability
  // -------------------------------------------------------------------------

  function patchGame(game) {
    if (!game?.scene) return false;

    const transit = getScene(game, KEYS.transit);
    const terrace = getScene(game, KEYS.terrace);

    if (transit) patchTransitScene(transit);
    if (terrace) patchTerraceScene(terrace);

    const bahnhof = getScene(game, KEYS.bahnhof);
    if (bahnhof?.sys?.isActive?.()) polishLowerPolybahn(bahnhof);

    return Boolean(transit && terrace);
  }

  patchBahnhofPrototype();

  // startSimonGame may return null while Flight Intro owns the transition, so
  // this wrapper is helpful but not the only install route. A short-lived poll
  // below catches normal flight starts and then removes itself.
  const previousStart = window.startSimonGame;
  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameZurichOutdoorV67(options = {}) {
      ensureInstallTimer();
      const game = previousStart.call(this, options);
      if (game) patchGame(game);
      return game;
    };
  }

  let installTimer = null;

  function ensureInstallTimer() {
    if (installTimer !== null) return;

    // Flight Intro v17 intentionally starts the base game several seconds after
    // the original button press. Keep one low-frequency installer alive until
    // ETH v59 has registered its lazy scenes, then remove it permanently.
    installTimer = window.setInterval(() => {
      patchBahnhofPrototype();
      if (!patchGame(getGame())) return;

      window.clearInterval(installTimer);
      installTimer = null;
    }, 500);
  }

  ensureInstallTimer();

  window.SimonZurichOutdoorV67 = Object.freeze({
    VERSION,
    PARALLAX,
    DEPTH,
    patchGame() { return patchGame(getGame()); },
    sync(scene) { syncParallax(scene, true); },
    status() {
      const game = getGame();
      const bahnhof = getScene(game, KEYS.bahnhof);
      const transit = getScene(game, KEYS.transit);
      const terrace = getScene(game, KEYS.terrace);
      return {
        bahnhofPatched: Boolean(window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene?.prototype?.__zurichOutdoorV67),
        bahnhofActive: Boolean(bahnhof?.sys?.isActive?.()),
        bahnhofParallaxLayers: bahnhof?.__zurichParallaxV67?.length ?? 0,
        lowerPolybahnPolished: Boolean(bahnhof?.__z67LowerPolybahnPolished),
        transitPatched: Boolean(transit?.__zurichOutdoorV67),
        terracePatched: Boolean(terrace?.__zurichOutdoorV67),
        terraceParallaxLayers: terrace?.__zurichParallaxV67?.length ?? 0
      };
    }
  });

  console.info(
    "Zürich Outdoor v67: Bahnhofstrasse/HB, Polybahn und Polyterrasse teilen jetzt eine konsistente Depth-, Material- und Panorama-Sprache."
  );
})();
