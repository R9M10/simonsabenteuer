(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_V66__) return;
  window.__SIMON_MILCHBUCK_V66__ = true;

  const VERSION = 66;
  const WORLD_WIDTH = 3000;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;

  // Canonical base-game HIVE coordinates. v66 does not relocate gameplay at runtime.
  const HIVE = Object.freeze({
    left: 1575,
    doorX: 1700,
    bouncerX: 1780,
    cameraX: 1745
  });

  // v65 proved that explicit camera parallax is reliable on iPad. v66 keeps the
  // technique but narrows the speed gaps: depth is visible without the scenery
  // sliding around like separate cards.
  const PARALLAX = Object.freeze({
    sky: 0.06,
    cloud: 0.12,
    mountainFar: 0.24,
    mountainNear: 0.36,
    cityFar: 0.56,
    cityMid: 0.74,
    world: 1.00
  });

  const DEPTH = Object.freeze({
    sky: -40,
    cloud: -38,
    mountainFar: -34,
    mountainNear: -30,
    cityFar: -22,
    cityMid: -14,
    streetFacade: -6,
    street: 0,
    propsBack: 3,
    propsFront: 7,
    foreground: 16
  });

  const ZONES = Object.freeze({
    stationEnd: 790,
    streetStart: 835,
    hiveLeft: HIVE.left,
    hiveRight: HIVE.left + 250
  });

  // ---------------------------------------------------------------------------
  // Manual parallax registry
  // ---------------------------------------------------------------------------

  function resetParallax(scene) {
    scene.__milkParallaxV66 = [];
    scene.__milkParallaxLastScrollV66 = Number.NaN;
  }

  function trackParallax(scene, object, factor) {
    if (!scene || !object) return object;
    if (!Array.isArray(scene.__milkParallaxV66)) resetParallax(scene);

    object.setScrollFactor?.(0, 0);
    object.setData?.("milkParallaxFactorV66", factor);

    scene.__milkParallaxV66.push({
      object,
      factor,
      baseX: Number(object.x) || 0,
      baseY: Number(object.y) || 0
    });

    return object;
  }

  function syncParallax(scene, force = false) {
    const camera = scene?.cameras?.main;
    const layers = scene?.__milkParallaxV66;
    if (!camera || !Array.isArray(layers)) return;

    const scrollX = Number(camera.scrollX) || 0;
    if (!force && scrollX === scene.__milkParallaxLastScrollV66) return;
    scene.__milkParallaxLastScrollV66 = scrollX;

    for (const entry of layers) {
      const object = entry?.object;
      if (!object?.active) continue;
      object.x = entry.baseX - scrollX * entry.factor;
      object.y = entry.baseY;
    }
  }

  // ---------------------------------------------------------------------------
  // Drawing helpers. The dense scene is intentionally batched into a handful
  // of Graphics objects instead of spawning one Phaser object per building.
  // ---------------------------------------------------------------------------

  function drawWindow(g, x, y, w = 10, h = 14, muted = false, lit = false) {
    g.fillStyle(muted ? 0x596566 : 0x3f4749, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(lit && !muted ? 0xd8ad64 : (muted ? 0x789294 : 0x5e8799), 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(lit && !muted ? 0xf1cf82 : (muted ? 0xa6b8b7 : 0xa7c6ce), 0.58);
    g.fillRect(x + 2, y + 2, 3, h - 4);
  }

  function drawBuilding(g, spec, muted = false) {
    const {
      x, w, h, color, roof = 0x755348, floors = 3,
      flatRoof = false, balcony = false, darkGround = false,
      serviceDoor = false, courtyard = false
    } = spec;
    const y = GROUND_TOP - h;

    if (courtyard) {
      g.fillStyle(0x303538, 1);
      g.fillRect(x, y + 28, w, h - 28);
      g.fillStyle(0x1f2527, 1);
      g.fillRect(x + 8, GROUND_TOP - 76, w - 16, 76);
      g.fillStyle(0x596263, 1);
      g.fillRect(x + 5, GROUND_TOP - 78, w - 10, 4);
      return;
    }

    // Subtle side shadow separates tightly packed façades.
    g.fillStyle(muted ? 0x68706e : 0x574d48, muted ? 0.25 : 0.42);
    g.fillRect(x + w - 7, y + 5, 10, h - 5);

    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);

    // Foundation.
    g.fillStyle(muted ? 0x777d78 : 0x74716c, 1);
    g.fillRect(x, GROUND_TOP - 14, w, 14);

    if (flatRoof) {
      g.fillStyle(roof, 1);
      g.fillRect(x - 3, y - 8, w + 6, 10);
      g.fillStyle(0x555a5a, 1);
      g.fillRect(x + 18, y - 18, 26, 10);
      g.fillRect(x + w - 42, y - 21, 20, 13);
    } else {
      g.fillStyle(roof, 1);
      g.fillTriangle(x - 6, y, x + w / 2, y - 28, x + w + 6, y);
      g.fillStyle(0x57463f, 0.82);
      g.fillRect(x - 3, y - 2, w + 6, 5);

      // Chimney/dormer details make the roofline read as Zürich rather than a blockout.
      g.fillStyle(0x74665c, 1);
      g.fillRect(x + 18, y - 25, 7, 17);
      if (w > 125) g.fillRect(x + w - 27, y - 22, 7, 15);
      if (!muted && w > 128) {
        g.fillStyle(0x645951, 1);
        g.fillRect(x + w * 0.45, y - 15, 20, 15);
        g.fillStyle(0x58778a, 1);
        g.fillRect(x + w * 0.45 + 6, y - 11, 8, 8);
        g.fillStyle(roof, 1);
        g.fillTriangle(x + w * 0.45 - 2, y - 15, x + w * 0.45 + 10, y - 25, x + w * 0.45 + 22, y - 15);
      }
    }

    const cols = w >= 145 ? 4 : (w >= 105 ? 3 : 2);
    const gapX = (w - 28) / cols;
    const top = y + 20;
    const bottom = GROUND_TOP - (darkGround || serviceDoor ? 68 : 38);
    const gapY = Math.max(24, (bottom - top) / Math.max(1, floors));

    for (let row = 0; row < floors; row += 1) {
      const wy = top + row * gapY;
      if (wy > bottom - 8) break;
      for (let col = 0; col < cols; col += 1) {
        const lit = ((Math.floor(x / 11) + row * 5 + col * 7) % 17) === 0;
        drawWindow(g, x + 14 + col * gapX, wy, muted ? 8 : 10, muted ? 12 : 14, muted, lit);
      }

      if (!muted && balcony && row === 1 && w > 110) {
        const bx = x + Math.floor(w * 0.24);
        const bw = Math.floor(w * 0.52);
        const by = wy + 21;
        g.fillStyle(0x5a6061, 1);
        g.fillRect(bx, by, bw, 4);
        g.lineStyle(2, 0x454e50, 1);
        g.lineBetween(bx + 3, by - 11, bx + 3, by);
        g.lineBetween(bx + bw - 3, by - 11, bx + bw - 3, by);
        g.lineBetween(bx + 3, by - 11, bx + bw - 3, by - 11);
      }
    }

    // Ground floors imply nightlife / mixed-use without advertising fake stores.
    if (!muted && darkGround) {
      g.fillStyle(0x292e31, 1);
      g.fillRect(x + 8, GROUND_TOP - 62, w - 16, 48);
      g.fillStyle(0x15191c, 1);
      g.fillRect(x + 16, GROUND_TOP - 56, Math.max(24, w - 48), 42);
      g.fillStyle(0x48555a, 1);
      g.fillRect(x + w - 28, GROUND_TOP - 56, 14, 42);
      // Unlit daytime trim: club-like, but no readable sign and no interaction cue.
      g.fillStyle(0x68516d, 0.72);
      g.fillRect(x + 12, GROUND_TOP - 66, w - 24, 3);
    } else if (!muted && serviceDoor) {
      g.fillStyle(0x525b5d, 1);
      g.fillRect(x + 11, GROUND_TOP - 58, w - 22, 44);
      g.lineStyle(2, 0x40484a, 0.9);
      for (let yy = GROUND_TOP - 53; yy < GROUND_TOP - 18; yy += 7) {
        g.lineBetween(x + 13, yy, x + w - 13, yy);
      }
      g.fillStyle(0x303638, 1);
      g.fillRect(x + w - 27, GROUND_TOP - 55, 14, 41);
    } else if (!muted) {
      g.fillStyle(0x4d5658, 1);
      g.fillRect(x + w - 30, GROUND_TOP - 50, 18, 36);
      g.fillStyle(0x718a90, 0.55);
      g.fillRect(x + w - 26, GROUND_TOP - 44, 10, 19);
    }

    // Downpipe / façade seam.
    g.fillStyle(muted ? 0x737b78 : 0x687173, 1);
    g.fillRect(x + w - 4, y + 6, 3, h - 21);
  }

  function drawPosterCluster(g, x, y) {
    const colors = [0x745c65, 0x566c73, 0x8a7652, 0x5e596d];
    for (let i = 0; i < 4; i += 1) {
      const w = 12 + (i % 2) * 3;
      const h = 18 + ((i + 1) % 2) * 4;
      g.fillStyle(0x373b3d, 1);
      g.fillRect(x + i * 15 - 1, y - h - 1, w + 2, h + 2);
      g.fillStyle(colors[i], 0.88);
      g.fillRect(x + i * 15, y - h, w, h);
      g.fillStyle(0xd8d0b8, 0.35);
      g.fillRect(x + i * 15 + 2, y - h + 3, w - 4, 2);
    }
  }

  // ---------------------------------------------------------------------------
  // Visual factories
  // ---------------------------------------------------------------------------

  function createSkyV66() {
    resetParallax(this);

    const sky = trackParallax(this, this.add.graphics().setDepth(DEPTH.sky), PARALLAX.sky);
    [
      [0, 70, 0x70b9dc],
      [70, 70, 0x7bc4df],
      [140, 70, 0x91d0df],
      [210, 70, 0xa7d9dd],
      [280, 58, 0xb9ddd7]
    ].forEach(([y, h, color]) => {
      sky.fillStyle(color, 1);
      sky.fillRect(-450, y, WORLD_WIDTH + 1200, h);
    });

    const clouds = trackParallax(this, this.add.graphics().setDepth(DEPTH.cloud), PARALLAX.cloud);
    [
      { x: 150, y: 78, s: 0.92 },
      { x: 980, y: 110, s: 0.70 },
      { x: 1780, y: 72, s: 0.98 },
      { x: 2570, y: 106, s: 0.78 }
    ].forEach(({ x, y, s }) => {
      clouds.fillStyle(0xebf6f2, 0.90);
      clouds.fillRect(x, y, 72 * s, 13 * s);
      clouds.fillRect(x + 15 * s, y - 12 * s, 49 * s, 14 * s);
      clouds.fillRect(x + 30 * s, y - 22 * s, 29 * s, 11 * s);
      clouds.fillStyle(0xcfe8e7, 0.50);
      clouds.fillRect(x + 9 * s, y + 13 * s, 55 * s, 4 * s);
    });
  }

  function createDistantHillsV66() {
    const far = trackParallax(this, this.add.graphics().setDepth(DEPTH.mountainFar), PARALLAX.mountainFar);
    far.fillStyle(0x89afa8, 1);
    far.beginPath();
    far.moveTo(-500, GROUND_TOP);
    [
      [-500, 248], [-160, 235], [120, 244], [430, 218], [720, 239],
      [1010, 224], [1320, 246], [1600, 219], [1910, 237], [2210, 213],
      [2500, 234], [2810, 216], [3500, 240]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(3500, GROUND_TOP);
    far.closePath();
    far.fillPath();

    const near = trackParallax(this, this.add.graphics().setDepth(DEPTH.mountainNear), PARALLAX.mountainNear);
    near.fillStyle(0x6d9987, 1);
    near.beginPath();
    near.moveTo(-500, GROUND_TOP);
    [
      [-500, 278], [-170, 259], [100, 269], [390, 242], [680, 264],
      [970, 247], [1280, 274], [1560, 248], [1850, 265], [2150, 240],
      [2450, 264], [2770, 243], [3500, 269]
    ].forEach(([x, y]) => near.lineTo(x, y));
    near.lineTo(3500, GROUND_TOP);
    near.closePath();
    near.fillPath();
  }

  function createCityBackgroundV66() {
    // Far city: dense but low-contrast roof mass. One Graphics object = less GC/object churn.
    const far = trackParallax(this, this.add.graphics().setDepth(DEPTH.cityFar), PARALLAX.cityFar);
    const farPalette = [0xa9a59c, 0x9da29d, 0xb0a793, 0x989f9b, 0xaba397];
    let x = -40;
    let i = 0;
    while (x < WORLD_WIDTH + 450) {
      const w = 95 + (i % 4) * 14;
      const h = 82 + (i % 5) * 11;
      drawBuilding(far, {
        x, w, h,
        color: farPalette[i % farPalette.length],
        roof: i % 3 === 0 ? 0x745e54 : 0x66645f,
        floors: 3,
        flatRoof: i % 5 === 4
      }, true);
      x += w + 14 + (i % 3) * 7;
      i += 1;
    }

    // Mid city: closer, taller and denser. Still background; no interaction or signs.
    const mid = trackParallax(this, this.add.graphics().setDepth(DEPTH.cityMid), PARALLAX.cityMid);
    const midSpecs = [
      { x: -20, w: 132, h: 122, color: 0xc7b99d, roof: 0x795347, floors: 3 },
      { x: 125, w: 118, h: 147, color: 0xbfb49a, roof: 0x5f5b58, floors: 4, flatRoof: true },
      { x: 258, w: 148, h: 132, color: 0xd0bea0, roof: 0x7c5043, floors: 3 },
      { x: 422, w: 102, h: 157, color: 0xbca88b, roof: 0x625b56, floors: 4 },
      { x: 541, w: 154, h: 140, color: 0xcab99c, roof: 0x7b5145, floors: 4 },
      { x: 710, w: 126, h: 151, color: 0xbcb19a, roof: 0x5f5b58, floors: 4, flatRoof: true },
      { x: 850, w: 145, h: 135, color: 0xcbb695, roof: 0x7a5145, floors: 3 },
      { x: 1010, w: 116, h: 165, color: 0xb9ad94, roof: 0x5f5955, floors: 4 },
      { x: 1141, w: 150, h: 143, color: 0xc9b99c, roof: 0x7b5247, floors: 4 },
      { x: 1306, w: 108, h: 153, color: 0xbcae95, roof: 0x5f5b58, floors: 4, flatRoof: true },
      { x: 1430, w: 146, h: 137, color: 0xcfb998, roof: 0x795045, floors: 3 },
      { x: 1590, w: 124, h: 160, color: 0xb9ad95, roof: 0x5f5955, floors: 4 },
      { x: 1730, w: 150, h: 142, color: 0xc9b99b, roof: 0x7a5246, floors: 4 },
      { x: 1895, w: 112, h: 151, color: 0xb9ad94, roof: 0x5f5b58, floors: 4, flatRoof: true },
      { x: 2022, w: 150, h: 136, color: 0xccb99b, roof: 0x795147, floors: 3 },
      { x: 2188, w: 120, h: 162, color: 0xbcb09a, roof: 0x5f5956, floors: 4 },
      { x: 2324, w: 148, h: 142, color: 0xcab698, roof: 0x795146, floors: 4 },
      { x: 2487, w: 108, h: 155, color: 0xbcae95, roof: 0x5f5b58, floors: 4, flatRoof: true },
      { x: 2610, w: 152, h: 138, color: 0xc9b99c, roof: 0x795147, floors: 3 },
      { x: 2778, w: 118, h: 160, color: 0xb9ad94, roof: 0x5f5955, floors: 4 },
      { x: 2910, w: 148, h: 142, color: 0xcab89a, roof: 0x7a5146, floors: 4 }
    ];
    midSpecs.forEach((spec) => drawBuilding(mid, spec, false));

    // Actual street wall: tighter mixed-use façades, narrow alleys and service
    // corners. HIVE is still the only meaningful destination.
    const street = this.add.graphics().setScrollFactor(1).setDepth(DEPTH.streetFacade);
    const streetSpecs = [
      { x: 820,  w: 126, h: 148, color: 0xd2bd99, roof: 0x7b5042, floors: 3, balcony: true },
      { x: 950,  w: 108, h: 170, color: 0xb8aaa0, roof: 0x454a4c, floors: 4, flatRoof: true, darkGround: true },
      { x: 1062, w: 38,  h: 112, color: 0x303538, courtyard: true },
      { x: 1104, w: 136, h: 158, color: 0xd0ba94, roof: 0x7d5143, floors: 4, serviceDoor: true },
      { x: 1244, w: 112, h: 182, color: 0xa7a09a, roof: 0x45494c, floors: 4, flatRoof: true, darkGround: true },
      { x: 1360, w: 42,  h: 125, color: 0x2f3437, courtyard: true },
      { x: 1406, w: 142, h: 156, color: 0xd6c19f, roof: 0x795046, floors: 3, balcony: true, serviceDoor: true },

      // HIVE 1575..1825 deliberately gets breathing room at its own entrance.

      { x: 1840, w: 116, h: 165, color: 0xb5a89d, roof: 0x454a4c, floors: 4, flatRoof: true, darkGround: true },
      { x: 1960, w: 35,  h: 118, color: 0x303538, courtyard: true },
      { x: 1999, w: 145, h: 150, color: 0xd0bb98, roof: 0x7b5145, floors: 3, serviceDoor: true },
      { x: 2148, w: 122, h: 177, color: 0xaaa29b, roof: 0x484c4e, floors: 4, flatRoof: true, darkGround: true },
      { x: 2274, w: 139, h: 154, color: 0xd2c09f, roof: 0x795046, floors: 3, balcony: true },
      { x: 2417, w: 40,  h: 122, color: 0x303538, courtyard: true },
      { x: 2461, w: 142, h: 169, color: 0xb8aba0, roof: 0x474b4d, floors: 4, flatRoof: true, serviceDoor: true },
      { x: 2607, w: 150, h: 150, color: 0xd0ba97, roof: 0x7a5144, floors: 3, darkGround: true },
      { x: 2761, w: 124, h: 180, color: 0xaaa39d, roof: 0x45494c, floors: 4, flatRoof: true },
      { x: 2889, w: 140, h: 154, color: 0xd1bd9a, roof: 0x7a5044, floors: 3, serviceDoor: true }
    ];
    streetSpecs.forEach((spec) => drawBuilding(street, spec, false));

    // Visual clutter with purpose: poster walls, vents, gates, bins. No text, no
    // hand cursor and no hitboxes, so the player never mistakes scenery for content.
    drawPosterCluster(street, 970, GROUND_TOP - 15);
    drawPosterCluster(street, 1260, GROUND_TOP - 15);
    drawPosterCluster(street, 1860, GROUND_TOP - 15);
    drawPosterCluster(street, 2160, GROUND_TOP - 15);

    street.fillStyle(0x515a5c, 1);
    [1035, 1328, 1928, 2244, 2528].forEach((vx) => {
      street.fillRect(vx, GROUND_TOP - 99, 18, 13);
      street.lineStyle(1, 0x343a3c, 0.9);
      for (let yy = GROUND_TOP - 96; yy < GROUND_TOP - 88; yy += 4) {
        street.lineBetween(vx + 3, yy, vx + 15, yy);
      }
    });
  }

  function createStreetAndTracksV66() {
    const street = this.add.graphics().setScrollFactor(1).setDepth(DEPTH.street);

    // Station zone with physical platform.
    street.fillStyle(0xa9a8a1, 1);
    street.fillRect(0, 286, ZONES.stationEnd, 18);
    street.fillStyle(0xd0cab9, 1);
    street.fillRect(0, 286, ZONES.stationEnd, 5);
    street.fillStyle(0x777b79, 1);
    street.fillRect(0, 304, ZONES.stationEnd, 34);

    // Rails only belong to the stop and visibly peel away before the dense street.
    street.fillStyle(0x4c4845, 1);
    street.fillRect(0, 314, 720, 4);
    street.fillRect(0, 329, 720, 4);
    street.fillStyle(0xb6aa8e, 0.52);
    for (let tx = 0; tx < 720; tx += 21) street.fillRect(tx, 317, 4, 11);
    street.lineStyle(4, 0x4c4845, 1);
    street.lineBetween(720, 315, 820, 298);
    street.lineBetween(720, 330, 820, 312);

    // Normal road through the compact nightlife / residential stretch.
    street.fillStyle(0x62696a, 1);
    street.fillRect(ZONES.stationEnd, 292, WORLD_WIDTH - ZONES.stationEnd, 31);
    street.fillStyle(0x505657, 0.72);
    for (let sx = ZONES.streetStart + 40; sx < WORLD_WIDTH; sx += 245) {
      street.fillRect(sx, 306, 92, 3);
    }

    street.fillStyle(0xb9b0a2, 1);
    street.fillRect(ZONES.stationEnd, 322, WORLD_WIDTH - ZONES.stationEnd, 8);
    street.fillStyle(0x92918c, 1);
    street.fillRect(ZONES.stationEnd, 330, WORLD_WIDTH - ZONES.stationEnd, 8);

    // Player floor: compact city paving.
    street.fillStyle(0x747673, 1);
    street.fillRect(0, GROUND_TOP, WORLD_WIDTH, GAME_HEIGHT - GROUND_TOP);
    const paving = [0x81837e, 0x70736f, 0x89877f];
    for (let py = GROUND_TOP; py < GAME_HEIGHT; py += 13) {
      const offset = ((py - GROUND_TOP) / 13) % 2 === 0 ? 0 : 18;
      for (let px = -offset; px < WORLD_WIDTH; px += 36) {
        street.fillStyle(paving[(Math.floor((px + 36) / 36) + Math.floor(py / 13)) % paving.length], 1);
        street.fillRect(px + 1, py + 1, 33, 10);
      }
    }
    street.fillStyle(0x565b59, 1);
    street.fillRect(0, GROUND_TOP, WORLD_WIDTH, 3);
  }

  function createForegroundDetailsV66() {
    // Overhead infrastructure is station-only. No phantom tram wires over HIVE.
    const g = this.add.graphics().setScrollFactor(1).setDepth(DEPTH.propsBack);
    g.lineStyle(2, 0x495052, 0.88);
    [82, 285, 525, 755].forEach((x) => {
      g.fillStyle(0x707779, 1);
      g.fillRect(x, 82, 5, 220);
    });
    g.lineBetween(82, 94, 285, 105);
    g.lineBetween(285, 105, 525, 95);
    g.lineBetween(525, 95, 755, 108);

    // Dense but non-interactive street furniture / odd corners.
    const props = this.add.graphics().setScrollFactor(1).setDepth(DEPTH.propsFront);

    // Lamps are closer together than v65, reinforcing the narrow urban scale.
    [875, 1080, 1320, 1510, 1885, 2110, 2380, 2660, 2915].forEach((x) => {
      props.fillStyle(0x4e5557, 1);
      props.fillRect(x, 231, 4, 104);
      props.fillRect(x - 4, 225, 12, 7);
      props.fillStyle(0xffe6a5, 0.82);
      props.fillRect(x - 1, 226, 7, 5);
    });

    // Narrow rail/gate sections suggest courtyards and queue/service spaces.
    const gateSegments = [
      [1064, 1098], [1362, 1400], [1962, 1993], [2419, 2455]
    ];
    props.lineStyle(3, 0x5d6668, 1);
    gateSegments.forEach(([a, b]) => {
      props.lineBetween(a, 300, b, 300);
      props.lineBetween(a, 316, b, 316);
      props.lineBetween(a, 300, a, 335);
      props.lineBetween(b, 300, b, 335);
    });

    // Bins and utility boxes: small urban mess, but not gameplay affordances.
    [1008, 1290, 1942, 2220, 2540].forEach((x, index) => {
      props.fillStyle(index % 2 ? 0x455b50 : 0x596466, 1);
      props.fillRoundedRect(x, 300, 20, 36, 3);
      props.fillStyle(0x303638, 1);
      props.fillRect(x + 4, 304, 12, 5);
    });

    // A few parked bicycles break the repeated façade rhythm.
    [[1168, 319], [1450, 319], [2035, 319]].forEach(([x, y]) => {
      props.lineStyle(2, 0x42494b, 1);
      props.strokeCircle(x, y, 9);
      props.strokeCircle(x + 27, y, 9);
      props.lineBetween(x, y, x + 11, y - 17);
      props.lineBetween(x + 11, y - 17, x + 20, y);
      props.lineBetween(x + 20, y, x, y);
      props.lineBetween(x + 11, y - 17, x + 27, y);
      props.lineBetween(x + 9, y - 18, x + 16, y - 18);
    });
  }

  function addStationPolish(scene) {
    const g = scene.add.graphics().setScrollFactor(1).setDepth(7);
    g.fillStyle(0x4e5557, 0.62);
    g.fillEllipse(405, 294, 210, 10);
    [314, 490].forEach((x) => {
      g.fillStyle(0x51595b, 1);
      g.fillRect(x - 8, 288, 24, 5);
      g.fillStyle(0x858b8b, 1);
      g.fillRect(x - 5, 285, 18, 4);
    });
    g.fillStyle(0x8d8d87, 1);
    g.fillRect(286, 292, 500, 4);
  }

  function addHivePolish(scene) {
    const g = scene.add.graphics().setScrollFactor(1).setDepth(3);

    // HIVE sits in the dense block, but its small forecourt keeps door/bouncer readable.
    g.fillStyle(0x5e6261, 1);
    g.fillRect(HIVE.left - 24, 320, 302, 18);
    g.fillStyle(0x92908a, 1);
    g.fillRect(HIVE.left - 24, 320, 302, 4);

    // Poster/utility wall at the edge of the queue zone; no labels/hitboxes.
    g.fillStyle(0x44494b, 1);
    g.fillRect(HIVE.left - 20, 266, 36, 54);
    drawPosterCluster(g, HIVE.left - 16, 315);

    g.fillStyle(0x34383b, 1);
    [HIVE.left + 48, HIVE.left + 105].forEach((x) => {
      g.fillRect(x, 298, 4, 24);
      g.fillCircle(x + 2, 297, 4);
    });
    g.lineStyle(2, 0x7d4a72, 0.86);
    g.lineBetween(HIVE.left + 52, 306, HIVE.left + 105, 306);
  }

  // ---------------------------------------------------------------------------
  // Stability / actor direction
  // ---------------------------------------------------------------------------

  function enforceLionFacing(scene) {
    const lion = scene?.fightLion;
    if (!lion?.active || !lion.__lionV12) {
      scene.__milkLionLastXV66 = Number.NaN;
      return;
    }

    const x = Number(lion.x) || 0;
    const lastX = scene.__milkLionLastXV66;
    const animationKey = lion.anims?.currentAnim?.key || "";

    if (Number.isFinite(lastX)) {
      const dx = x - lastX;
      if (Math.abs(dx) > 0.18 && animationKey.includes("lion-v12-run")) {
        const sx = Math.max(0.01, Math.abs(lion.scaleX || 1));
        const sy = Math.max(0.01, Math.abs(lion.scaleY || 1));
        lion.setScale?.(sx, sy);
        lion.setFlipX?.(dx < 0);
      }
    }

    scene.__milkLionLastXV66 = x;
  }

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

  function normalizeActorScale(actor) {
    if (!actor?.active) return;
    const sx = Math.max(0.01, Math.abs(actor.scaleX || 1));
    const sy = Math.max(0.01, Math.abs(actor.scaleY || 1));
    actor.setScale?.(sx, sy);
  }

  function repairMilchbuck(scene) {
    if (!scene || scene.sys?.settings?.key !== "MilchbuckScene") return;

    // Canonical coordinates only; no relocation wrappers, no translated tweens.
    if (scene.__hiveV12DoorZone?.active) {
      scene.__hiveV12DoorZone.setPosition?.(HIVE.doorX, 282);
    }
    if (scene.__hiveV12DoorLabel?.active) {
      scene.__hiveV12DoorLabel.setPosition?.(HIVE.doorX, 208);
    }

    if (scene.bouncer?.active && !scene.fightActive) {
      const hiveBouncer = scene.bouncer.__bouncerV12 || scene.bouncer.x > 1450;
      if (hiveBouncer && Math.abs(scene.bouncer.x - HIVE.bouncerX) > 2) {
        scene.bouncer.x = HIVE.bouncerX;
      }
      normalizeActorScale(scene.bouncer);
    }

    normalizeActorScale(scene.fightLion);
    (scene.fightBouncers || []).forEach(normalizeActorScale);
  }

  function cleanupDetachedUI() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    const game = getGame();
    const wg = getScene(game, "WGInteriorScene");
    const room = getScene(game, "SimonRoomScene");

    if (!wg?.sys?.isActive?.() && !room?.sys?.isActive?.()) {
      root.querySelectorAll(
        '[data-simon-ui="wg-room-select-v57"],' +
        '[data-simon-ui="simon-room-v57"]'
      ).forEach((node) => node.remove());
    }

    const station = getScene(game, "BahnhofquaiScene");
    if (!station?.bookstoreOverlay && !station?.__cashierStoreDialogueActiveV54) {
      root.querySelectorAll('[data-simon-ui="cashier-store-dialogue-v54"]')
        .forEach((node) => node.remove());
    }

    const transit = getScene(game, "PolybahnTransitScene");
    if (!transit?.sys?.isActive?.()) {
      root.querySelectorAll(
        '[data-simon-ui="eth-dialogue-v55"],' +
        '[data-simon-ui="eth-quiz-v55"]'
      ).forEach((node) => {
        const terrace = getScene(game, "PolyterrasseScene");
        const eth = getScene(game, "ETHInteriorScene");
        if (!terrace?.sys?.isActive?.() && !eth?.sys?.isActive?.()) node.remove();
      });
    }
  }

  function repairGame(game) {
    if (!game?.scene) return;
    repairMilchbuck(getScene(game, "MilchbuckScene"));
    window.SimonETHV57?.recover?.();
    cleanupDetachedUI();
  }

  // ---------------------------------------------------------------------------
  // Prototype installation
  // ---------------------------------------------------------------------------

  function install() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = SceneClass?.prototype;
    if (!proto || proto.__milchbuckV66Installed) return Boolean(proto);

    proto.__milchbuckV66Installed = true;

    const installSafeVisual = (name, replacement) => {
      if (typeof proto[name] !== "function") return;
      const original = proto[name];

      const wrapped = function milkbuckVisualV66(...args) {
        try {
          return replacement.apply(this, args);
        } catch (error) {
          console.error(`[Milchbuck v${VERSION}] ${name} fallback:`, error);
          return original.apply(this, args);
        }
      };

      wrapped.__milchbuckV66 = true;
      wrapped.__previousFactory = original;
      proto[name] = wrapped;
    };

    installSafeVisual("createSky", createSkyV66);
    installSafeVisual("createDistantHills", createDistantHillsV66);
    installSafeVisual("createCityBackground", createCityBackgroundV66);
    installSafeVisual("createStreetAndTracks", createStreetAndTracksV66);
    installSafeVisual("createForegroundDetails", createForegroundDetailsV66);

    if (typeof proto.createMilchbuckStation === "function") {
      const originalStation = proto.createMilchbuckStation;
      proto.createMilchbuckStation = function createMilchbuckStationV66(...args) {
        const result = originalStation.apply(this, args);
        try { addStationPolish(this); } catch (error) {
          console.error(`[Milchbuck v${VERSION}] station polish:`, error);
        }
        return result;
      };
      proto.createMilchbuckStation.__milchbuckV66 = true;
    }

    if (typeof proto.createHiveClub === "function") {
      const originalHive = proto.createHiveClub;
      proto.createHiveClub = function createHiveClubV66(...args) {
        const result = originalHive.apply(this, args);
        try { addHivePolish(this); } catch (error) {
          console.error(`[Milchbuck v${VERSION}] HIVE polish:`, error);
        }
        return result;
      };
      proto.createHiveClub.__milchbuckV66 = true;
    }

    if (typeof proto.update === "function") {
      const originalUpdate = proto.update;
      proto.update = function updateMilchbuckV66(...args) {
        const result = originalUpdate.apply(this, args);
        syncParallax(this);
        enforceLionFacing(this);
        return result;
      };
      proto.update.__milchbuckV66 = true;
    }

    if (typeof proto.create === "function") {
      const originalCreate = proto.create;
      proto.create = function createMilchbuckV66(...args) {
        const result = originalCreate.apply(this, args);
        syncParallax(this, true);
        repairMilchbuck(this);
        return result;
      };
      proto.create.__milchbuckV66 = true;
    }

    console.info(
      `[Milchbuck v${VERSION}] dense mixed-use street, HIVE base coordinates, consolidated parallax/stability layer active.`
    );
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 120) window.clearInterval(timer);
    }, 50);
  }

  // Single low-frequency maintenance pass replaces the old location + world
  // stability timers. Visual parallax itself remains tied to the scene update.
  window.setInterval(() => repairGame(getGame()), 500);

  // Compatibility APIs let older modules query the canonical HIVE location
  // without requiring the obsolete v57/v64/v65 location files to be loaded.
  const hiveApi = Object.freeze({
    VERSION,
    ORIGINAL_X: HIVE.left,
    TARGET_X: HIVE.left,
    SHIFT: 0
  });

  const worldApi = Object.freeze({
    VERSION,
    HIVE_LEFT_X: HIVE.left,
    HIVE_DOOR_X: HIVE.doorX,
    HIVE_BOUNCER_X: HIVE.bouncerX,
    HIVE_CAMERA_X: HIVE.cameraX,
    HIVE_SHIFT: 0,
    repair() { repairGame(getGame()); },
    status() {
      const game = getGame();
      const milk = getScene(game, "MilchbuckScene");
      return {
        hiveLeftX: HIVE.left,
        hiveDoorX: milk?.__hiveV12DoorZone?.x ?? null,
        hiveBouncerX: milk?.bouncer?.x ?? null,
        fightLionX: milk?.fightLion?.x ?? null,
        fightBouncers: (milk?.fightBouncers || []).map((actor) => actor?.x ?? null),
        parallaxLayers: milk?.__milkParallaxV66?.length ?? 0,
        eth: window.SimonETHV57?.status?.() || null
      };
    }
  });

  window.__SIMON_HIVE_LOCATION_V65__ = true;
  window.__SIMON_HIVE_LOCATION_V64__ = true;
  window.__SIMON_HIVE_LOCATION_V57__ = true;
  window.SimonHiveLocationV66 = hiveApi;
  window.SimonHiveLocationV65 = hiveApi;
  window.SimonHiveLocationV64 = hiveApi;
  window.SimonHiveLocationV57 = hiveApi;

  window.__SIMON_WORLD_STABILITY_V65__ = true;
  window.__SIMON_WORLD_STABILITY_V64__ = true;
  window.__SIMON_WORLD_STABILITY_V57__ = true;
  window.__SIMON_WORLD_STABILITY_V56__ = true;
  window.__SIMON_WORLD_STABILITY_V55__ = true;
  window.SimonWorldStabilityV66 = worldApi;
  window.SimonWorldStabilityV65 = worldApi;
  window.SimonWorldStabilityV64 = worldApi;
  window.SimonWorldStabilityV57 = worldApi;
  window.SimonWorldStabilityV56 = worldApi;
  window.SimonWorldStabilityV55 = worldApi;

  window.SimonMilchbuckV66 = Object.freeze({
    VERSION,
    PARALLAX,
    DEPTH,
    ZONES,
    HIVE,
    install,
    sync(scene) { syncParallax(scene, true); }
  });
})();
