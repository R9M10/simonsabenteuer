(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_POLISH_V63__) return;
  window.__SIMON_MILCHBUCK_POLISH_V63__ = true;

  const VERSION = 63;
  const WORLD_WIDTH = 3000;
  const GROUND_TOP = 338;

  // Canonical depth / parallax concept for future outdoor scenes.
  // These values intentionally keep gameplay on 1.0 while separating the
  // readable landscape into several subtle planes instead of a cardboard wall.
  const PARALLAX = Object.freeze({
    sky: 0.06,
    cloud: 0.11,
    mountainFar: 0.18,
    mountainNear: 0.24,
    treeLine: 0.31,
    cityFar: 0.45,
    cityMid: 0.68,
    greenMid: 0.82,
    world: 1.00,
    foreground: 1.04
  });

  const DEPTH = Object.freeze({
    sky: -34,
    mountainFar: -30,
    mountainNear: -27,
    treeLine: -23,
    cityFar: -16,
    cityMid: -8,
    greenMid: -4,
    worldBack: -1,
    world: 2,
    foreground: 16
  });

  function addWindow(g, x, y, w = 12, h = 17, lit = false, shutters = false) {
    if (shutters) {
      g.fillStyle(0x506e61, 0.95);
      g.fillRect(x - 4, y + 1, 3, h - 2);
      g.fillRect(x + w + 1, y + 1, 3, h - 2);
    }

    g.fillStyle(0x403e3d, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(lit ? 0xf1c46a : 0x547489, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(lit ? 0xffdf8a : 0x87a7b5, 0.78);
    g.fillRect(x + 2, y + 2, Math.max(2, Math.floor(w * 0.28)), h - 4);
    g.fillStyle(0x3d4f59, 0.86);
    g.fillRect(x + Math.floor(w / 2), y, 2, h);
  }

  function addBalcony(g, x, y, w) {
    g.fillStyle(0x5c6060, 1);
    g.fillRect(x, y, w, 4);
    g.lineStyle(2, 0x4a5254, 1);
    g.lineBetween(x + 3, y - 12, x + 3, y);
    g.lineBetween(x + w - 3, y - 12, x + w - 3, y);
    g.lineBetween(x + 3, y - 12, x + w - 3, y - 12);
    for (let bx = x + 9; bx < x + w - 4; bx += 10) {
      g.lineBetween(bx, y - 11, bx, y - 1);
    }
  }

  function addDormer(g, x, roofY, roofColor) {
    g.fillStyle(0x685e54, 1);
    g.fillRect(x, roofY - 16, 22, 17);
    g.fillStyle(0x49687a, 1);
    g.fillRect(x + 6, roofY - 12, 10, 10);
    g.fillStyle(roofColor, 1);
    g.fillTriangle(x - 3, roofY - 16, x + 11, roofY - 28, x + 25, roofY - 16);
  }

  function addResidentialBuilding(scene, spec, scrollFactor, depth, muted = false) {
    const {
      x, w, h, color, roof = 0x7b4d40, floors = 3,
      shop = false, balcony = false, shutters = false, dormers = true
    } = spec;
    const y = GROUND_TOP - h;
    const g = scene.add.graphics().setScrollFactor(scrollFactor).setDepth(depth);

    // Side shadow makes adjacent façades read as individual buildings.
    g.fillStyle(muted ? 0x6f7775 : 0x5d5149, muted ? 0.35 : 0.48);
    g.fillRect(x + w - 8, y + 7, 12, h - 7);

    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);

    // Foundation / plinth.
    g.fillStyle(muted ? 0x747b79 : 0x77736b, 1);
    g.fillRect(x, GROUND_TOP - 15, w, 15);

    // Pitched Zürich residential roof.
    g.fillStyle(roof, 1);
    g.fillTriangle(x - 6, y, x + w / 2, y - 30, x + w + 6, y);
    g.fillStyle(0x59453d, 0.82);
    g.fillRect(x - 3, y - 2, w + 6, 5);

    // Chimneys.
    g.fillStyle(0x6f6258, 1);
    g.fillRect(x + 18, y - 27, 8, 19);
    g.fillStyle(0x403a37, 1);
    g.fillRect(x + 16, y - 29, 12, 4);
    if (w > 140) {
      g.fillStyle(0x76685d, 1);
      g.fillRect(x + w - 30, y - 24, 8, 17);
      g.fillStyle(0x403a37, 1);
      g.fillRect(x + w - 32, y - 26, 12, 4);
    }

    if (dormers && !muted && w >= 120) {
      addDormer(g, x + 30, y, roof);
      if (w >= 145) addDormer(g, x + w - 54, y, roof);
    }

    const baseTop = shop ? GROUND_TOP - 55 : GROUND_TOP - 30;
    const usableTop = y + 21;
    const floorGap = Math.max(25, Math.floor((baseTop - usableTop) / Math.max(1, floors - 1)));
    const cols = w >= 150 ? 4 : 3;
    const stepX = (w - 30) / cols;

    for (let floor = 0; floor < floors; floor += 1) {
      const wy = usableTop + floor * floorGap;
      if (wy > baseTop - 8) break;
      for (let col = 0; col < cols; col += 1) {
        const wx = x + 16 + col * stepX;
        const lit = ((Math.floor(x / 10) + floor * 7 + col * 3) % 11) === 0;
        addWindow(g, wx, wy, muted ? 8 : 11, muted ? 13 : 16, lit && !muted, shutters && !muted);
      }

      if (balcony && !muted && floor === 1 && w >= 130) {
        addBalcony(g, x + w * 0.28, wy + 22, w * 0.44);
      }
    }

    // Ground-floor urban detail: entrance, small shop, awning or garage.
    if (shop && !muted) {
      g.fillStyle(0x3c4b50, 1);
      g.fillRect(x + 12, GROUND_TOP - 50, Math.floor(w * 0.46), 35);
      g.fillStyle(0x7ba0a5, 0.85);
      g.fillRect(x + 17, GROUND_TOP - 45, Math.floor(w * 0.36), 22);
      g.fillStyle(0xd6c29a, 1);
      g.fillRect(x + 9, GROUND_TOP - 55, Math.floor(w * 0.52), 7);
      for (let ax = x + 10; ax < x + w * 0.52; ax += 14) {
        g.fillStyle(((ax / 14) % 2) < 1 ? 0xe0ddd0 : 0x5f8790, 1);
        g.fillRect(ax, GROUND_TOP - 55, 9, 7);
      }
    }

    g.fillStyle(0x514941, 1);
    g.fillRect(x + w - 31, GROUND_TOP - 48, 20, 33);
    g.fillStyle(0x87a5aa, 0.65);
    g.fillRect(x + w - 27, GROUND_TOP - 42, 12, 18);

    // Drainpipe and a narrow cornice add a lot of architectural readability.
    g.fillStyle(0x6d7474, 1);
    g.fillRect(x + w - 5, y + 7, 3, h - 22);
    g.fillStyle(0x81766b, 0.9);
    g.fillRect(x, GROUND_TOP - 59, w, 4);

    return g;
  }

  function createSkyV63() {
    const skyBands = [
      { y: 0, h: 64, color: 0x70b9dc },
      { y: 64, h: 66, color: 0x7bc4df },
      { y: 130, h: 70, color: 0x91d0df },
      { y: 200, h: 70, color: 0xa7d9dd },
      { y: 270, h: 68, color: 0xb9ddd7 }
    ];

    skyBands.forEach((band) => {
      this.add.rectangle(
        WORLD_WIDTH / 2,
        band.y + band.h / 2,
        WORLD_WIDTH,
        band.h,
        band.color
      ).setScrollFactor(PARALLAX.sky).setDepth(DEPTH.sky);
    });

    const clouds = [
      { x: 170, y: 72, s: 1.0 },
      { x: 720, y: 112, s: 0.72 },
      { x: 1320, y: 62, s: 1.12 },
      { x: 1940, y: 103, s: 0.88 },
      { x: 2550, y: 68, s: 1.02 }
    ];

    clouds.forEach(({ x, y, s }) => {
      const g = this.add.graphics().setScrollFactor(PARALLAX.cloud).setDepth(DEPTH.sky + 2);
      g.fillStyle(0xeaf6f2, 0.90);
      g.fillRect(x, y, 70 * s, 14 * s);
      g.fillRect(x + 14 * s, y - 12 * s, 48 * s, 14 * s);
      g.fillRect(x + 28 * s, y - 22 * s, 30 * s, 12 * s);
      g.fillStyle(0xcfe8e7, 0.58);
      g.fillRect(x + 8 * s, y + 14 * s, 56 * s, 4 * s);
    });
  }

  function createDistantHillsV63() {
    // Far blue-green ridge.
    const far = this.add.graphics().setScrollFactor(PARALLAX.mountainFar).setDepth(DEPTH.mountainFar);
    far.fillStyle(0x7ca9a0, 1);
    far.beginPath();
    far.moveTo(0, GROUND_TOP);
    [
      [0, 245], [220, 216], [430, 232], [650, 194], [870, 226],
      [1090, 202], [1310, 238], [1530, 207], [1760, 224], [1990, 188],
      [2210, 218], [2460, 199], [2700, 225], [3000, 192]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(WORLD_WIDTH, GROUND_TOP);
    far.closePath();
    far.fillPath();

    // Near ridge moves a little faster and is darker.
    const near = this.add.graphics().setScrollFactor(PARALLAX.mountainNear).setDepth(DEPTH.mountainNear);
    near.fillStyle(0x62967f, 1);
    near.beginPath();
    near.moveTo(0, GROUND_TOP);
    [
      [0, 270], [150, 232], [360, 252], [540, 216], [760, 246],
      [980, 222], [1180, 260], [1400, 228], [1620, 252], [1830, 215],
      [2050, 246], [2280, 222], [2520, 250], [2760, 210], [3000, 238]
    ].forEach(([x, y]) => near.lineTo(x, y));
    near.lineTo(WORLD_WIDTH, GROUND_TOP);
    near.closePath();
    near.fillPath();

    const trees = this.add.graphics().setScrollFactor(PARALLAX.treeLine).setDepth(DEPTH.treeLine);
    for (let x = 0; x < WORLD_WIDTH; x += 34) {
      const height = 28 + ((x * 19) % 38);
      const c = (Math.floor(x / 34) % 3 === 0) ? 0x376b57 : 0x477b61;
      trees.fillStyle(c, 1);
      trees.fillTriangle(x, GROUND_TOP - 34, x + 16, GROUND_TOP - 34 - height, x + 32, GROUND_TOP - 34);
      trees.fillStyle(0x315c4b, 0.75);
      trees.fillRect(x + 14, GROUND_TOP - 43, 4, 10);
    }
  }

  function createCityBackgroundV63() {
    // FAR CITY: muted, smaller and clearly slower than the gameplay plane.
    const farSpecs = [];
    const farPalette = [0xa6a096, 0x9c9d94, 0xb1a58f, 0x969c98, 0xaaa391];
    for (let i = 0; i < 18; i += 1) {
      farSpecs.push({
        x: 60 + i * 166,
        w: 112 + (i % 3) * 16,
        h: 105 + (i % 5) * 15,
        color: farPalette[i % farPalette.length],
        roof: i % 2 === 0 ? 0x73564d : 0x5e5b58,
        floors: 3,
        dormers: false
      });
    }
    farSpecs.forEach((spec) => addResidentialBuilding(this, spec, PARALLAX.cityFar, DEPTH.cityFar, true));

    // MID CITY: recognisable Zürich residential architecture. The first row
    // continues behind the Milchbuck stop; a deliberate gap frames HIVE.
    const specs = [
      { x: 70,   w: 145, h: 142, color: 0xd8c39d, roof: 0x864e3e, floors: 3, shutters: true },
      { x: 235,  w: 128, h: 160, color: 0xcdb08b, roof: 0x665851, floors: 4, balcony: true },
      { x: 383,  w: 154, h: 148, color: 0xe0c79b, roof: 0x7d493c, floors: 3, shop: true, shutters: true },
      { x: 557,  w: 132, h: 169, color: 0xc7b89a, roof: 0x5e5956, floors: 4, balcony: true },
      { x: 707,  w: 150, h: 151, color: 0xd7b78c, roof: 0x844d3f, floors: 3, shop: true },
      { x: 875,  w: 118, h: 136, color: 0xd6c6a6, roof: 0x615a54, floors: 3, shutters: true },

      // HIVE lives around x=1030..1280 in the current repository: keep breathing room.
      { x: 1300, w: 128, h: 147, color: 0xcfb58d, roof: 0x7b493d, floors: 3, shutters: true },
      { x: 1448, w: 154, h: 171, color: 0xddd0ad, roof: 0x5c5753, floors: 4, balcony: true },
      { x: 1622, w: 126, h: 139, color: 0xc99d78, roof: 0x814b3e, floors: 3, shop: true },
      { x: 1768, w: 156, h: 161, color: 0xd9c5a0, roof: 0x625954, floors: 4, shutters: true },
      { x: 1944, w: 132, h: 146, color: 0xd3aa7e, roof: 0x824c3f, floors: 3, balcony: true },
      { x: 2096, w: 150, h: 176, color: 0xc9b99b, roof: 0x5b5754, floors: 4, shop: true },
      { x: 2266, w: 126, h: 143, color: 0xdfc89e, roof: 0x854f41, floors: 3, shutters: true },
      { x: 2412, w: 158, h: 164, color: 0xd1b28b, roof: 0x635853, floors: 4, balcony: true },
      { x: 2590, w: 134, h: 151, color: 0xdbc49f, roof: 0x824b3d, floors: 3, shop: true },
      { x: 2744, w: 154, h: 174, color: 0xcbb998, roof: 0x5f5853, floors: 4, shutters: true }
    ];

    specs.forEach((spec) => addResidentialBuilding(this, spec, PARALLAX.cityMid, DEPTH.cityMid, false));
  }

  function addTree(scene, x, y, scale = 1, scrollFactor = PARALLAX.greenMid, depth = DEPTH.greenMid) {
    const g = scene.add.graphics().setScrollFactor(scrollFactor).setDepth(depth);
    g.fillStyle(0x684a35, 1);
    g.fillRect(x - 4 * scale, y - 66 * scale, 9 * scale, 66 * scale);
    g.fillStyle(0x315f45, 1);
    g.fillCircle(x, y - 78 * scale, 25 * scale);
    g.fillStyle(0x477b4e, 1);
    g.fillCircle(x - 18 * scale, y - 68 * scale, 20 * scale);
    g.fillStyle(0x558a55, 1);
    g.fillCircle(x + 18 * scale, y - 69 * scale, 21 * scale);
    g.fillStyle(0x6e9a5d, 0.8);
    g.fillCircle(x - 4 * scale, y - 91 * scale, 13 * scale);
    return g;
  }

  function addStationPolish(scene) {
    const g = scene.add.graphics().setDepth(2).setScrollFactor(PARALLAX.world);

    // More convincing shelter structure / glass reflections.
    g.lineStyle(2, 0xd7ece9, 0.58);
    g.lineBetween(340, 188, 382, 264);
    g.lineBetween(410, 186, 455, 268);
    g.lineStyle(2, 0x5c6a6d, 0.9);
    g.lineBetween(380, 180, 380, 274);
    g.lineBetween(434, 180, 434, 274);

    // Route map and timetable boards.
    g.fillStyle(0x39484d, 1);
    g.fillRect(396, 194, 36, 44);
    g.fillStyle(0xe6e2d3, 1);
    g.fillRect(400, 198, 28, 36);
    g.lineStyle(2, 0x3e80a1, 1);
    g.lineBetween(405, 226, 411, 214);
    g.lineBetween(411, 214, 420, 207);
    g.lineBetween(420, 207, 424, 201);

    // Tactile / curb detail along the platform.
    g.fillStyle(0xd8c48b, 0.9);
    for (let x = 238; x < 720; x += 16) {
      g.fillRect(x, 294, 10, 2);
    }

    // Small platform waste bin and planter – decorative only.
    g.fillStyle(0x45545a, 1);
    g.fillRect(618, 267, 19, 29);
    g.fillStyle(0x26343a, 1);
    g.fillRect(621, 271, 13, 6);
    g.fillStyle(0x7a5a3c, 1);
    g.fillRect(276, 280, 24, 16);
    g.fillStyle(0x477449, 1);
    g.fillCircle(282, 278, 11);
    g.fillCircle(294, 276, 12);
  }

  function addHivePolish(scene) {
    // HIVE is already relocated by hive-location-v57. These details use final
    // coordinates and therefore do not touch the existing story hitboxes.
    const x = 1030;
    const w = 250;
    const g = scene.add.graphics().setDepth(2).setScrollFactor(PARALLAX.world);

    // Rooftop industrial equipment.
    g.fillStyle(0x34333d, 1);
    g.fillRect(x + 25, 126, 45, 16);
    g.fillStyle(0x5c626b, 1);
    g.fillRect(x + 33, 119, 28, 8);
    g.fillStyle(0x515762, 1);
    g.fillRect(x + 186, 116, 11, 26);
    g.fillStyle(0x23252c, 1);
    g.fillRect(x + 182, 113, 19, 5);

    // Façade seams, vents and posters make it read as a finished club building.
    g.lineStyle(2, 0x34313c, 0.9);
    for (let yy = 168; yy < 326; yy += 31) {
      g.lineBetween(x + 5, yy, x + w - 5, yy);
    }

    g.fillStyle(0x0d1016, 1);
    g.fillRect(x + 18, 232, 30, 26);
    g.lineStyle(2, 0x606570, 1);
    for (let yy = 237; yy < 255; yy += 5) g.lineBetween(x + 22, yy, x + 44, yy);

    // Small club posters / stickers instead of a bare wall.
    [[x + 18, 278, 0xb83676], [x + 222, 266, 0x3b8ca8]].forEach(([px, py, c]) => {
      g.fillStyle(0x24222b, 1);
      g.fillRect(px, py, 15, 24);
      g.fillStyle(c, 0.9);
      g.fillRect(px + 3, py + 4, 9, 4);
      g.fillRect(px + 4, py + 12, 7, 7);
    });

    // Subtle neon baseline and entrance bollards.
    g.fillStyle(0xd94ab4, 0.65);
    g.fillRect(x + 72, 324, 108, 2);
    g.fillStyle(0x8e784e, 1);
    g.fillRect(x + 84, 310, 5, 28);
    g.fillRect(x + 165, 310, 5, 28);
    g.lineStyle(2, 0xc5a95e, 0.9);
    g.lineBetween(x + 89, 315, x + 165, 315);
  }

  function createForegroundDetailsV63() {
    // World-tied overhead infrastructure: it must move WITH the street.
    const wires = this.add.graphics().setDepth(3).setScrollFactor(PARALLAX.world);
    wires.lineStyle(2, 0x4a5052, 0.85);
    for (let x = 900; x < WORLD_WIDTH; x += 280) {
      wires.fillStyle(0x72787a, 1);
      wires.fillRect(x, 84, 5, 225);
      wires.lineBetween(x, 92, Math.min(x + 280, WORLD_WIDTH), 110);
    }

    // Background street trees move at 82%, clearly separating them from Simon.
    [840, 1370, 1850, 2320, 2790].forEach((x, i) => {
      addTree(this, x, GROUND_TOP, 0.82 + (i % 2) * 0.08);
    });

    // Street lights belong to the gameplay plane and therefore stay at 1.0.
    for (let x = 920; x < WORLD_WIDTH; x += 390) {
      const lamp = this.add.graphics().setDepth(3).setScrollFactor(PARALLAX.world);
      lamp.fillStyle(0x4b5356, 1);
      lamp.fillRect(x, 224, 5, 107);
      lamp.fillRect(x - 5, 217, 15, 8);
      lamp.fillStyle(0xffe3a2, 0.88);
      lamp.fillRect(x - 1, 219, 8, 5);
      lamp.fillStyle(0x2d3335, 1);
      lamp.fillRect(x - 4, 328, 13, 4);
    }

    // A very subtle near plane at the bottom gives feet/camera movement depth
    // without covering gameplay or creating collision objects.
    [1460, 2040, 2670].forEach((x) => {
      const fg = this.add.graphics().setDepth(DEPTH.foreground).setScrollFactor(PARALLAX.foreground);
      fg.fillStyle(0x355b3f, 0.9);
      fg.fillRect(x, GROUND_TOP - 8, 54, 8);
      fg.fillStyle(0x50754d, 0.9);
      for (let px = x + 4; px < x + 50; px += 9) {
        fg.fillTriangle(px, GROUND_TOP - 7, px + 4, GROUND_TOP - 17, px + 8, GROUND_TOP - 7);
      }
    });
  }

  function install() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = SceneClass?.prototype;
    if (!proto) return false;
    if (proto.__milchbuckPolishV63Installed) return true;

    proto.__milchbuckPolishV63Installed = true;

    // Replace only visual factories. Gameplay, hitboxes, travel and story logic
    // are intentionally untouched. Every visual replacement has a fail-open
    // fallback to the repository's previous factory so an art bug cannot make
    // the game unplayable.
    const installSafeVisual = (name, replacement) => {
      const original = proto[name];
      if (typeof original !== "function") return;

      const wrapped = function safeMilchbuckVisualV63(...args) {
        try {
          return replacement.apply(this, args);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] ${name} fallback:`, error);
          return original.apply(this, args);
        }
      };

      wrapped.__milchbuckPolishV63 = true;
      wrapped.__previousVisualFactoryV63 = original;
      proto[name] = wrapped;
    };

    installSafeVisual("createSky", createSkyV63);
    installSafeVisual("createDistantHills", createDistantHillsV63);
    installSafeVisual("createCityBackground", createCityBackgroundV63);
    installSafeVisual("createForegroundDetails", createForegroundDetailsV63);

    // Add finish-detail to the existing station without replacing interactions.
    if (typeof proto.createMilchbuckStation === "function") {
      const originalStation = proto.createMilchbuckStation;
      proto.createMilchbuckStation = function createMilchbuckStationV63(...args) {
        const result = originalStation.apply(this, args);
        try {
          addStationPolish(this);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] station detail skipped:`, error);
        }
        return result;
      };
      proto.createMilchbuckStation.__milchbuckPolishV63 = true;
    }

    // At this load point hive-location-v57 has already wrapped createHiveClub.
    // Call that current implementation first, then add purely decorative detail
    // at HIVE's final relocated position.
    if (typeof proto.createHiveClub === "function") {
      const originalHive = proto.createHiveClub;
      proto.createHiveClub = function createHiveClubV63(...args) {
        const result = originalHive.apply(this, args);
        try {
          addHivePolish(this);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] HIVE detail skipped:`, error);
        }
        return result;
      };
      proto.createHiveClub.__milchbuckPolishV63 = true;
    }

    console.info(
      `[Milchbuck Polish v${VERSION}] Parallax + detailed residential world installed.`
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

  window.SimonMilchbuckPolishV63 = Object.freeze({
    VERSION,
    PARALLAX,
    DEPTH,
    install
  });
})();
