(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_POLISH_V65__) return;
  window.__SIMON_MILCHBUCK_POLISH_V65__ = true;

  const VERSION = 65;
  const WORLD_WIDTH = 3000;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const HIVE_LEFT = 1575;

  // v65 deliberately uses MANUAL parallax. Previous versions relied only on
  // Phaser scrollFactor; on the current nested patch stack the difference was
  // not reliably perceptible. Every distant object is now screen-positioned
  // from camera.scrollX each frame, so the speed separation is explicit.
  const PARALLAX = Object.freeze({
    sky: 0.00,
    cloud: 0.035,
    mountainFar: 0.08,
    mountainNear: 0.15,
    cityFar: 0.27,
    cityMid: 0.46,
    world: 1.00
  });

  const DEPTH = Object.freeze({
    sky: -40,
    cloud: -38,
    mountainFar: -34,
    mountainNear: -30,
    cityFar: -22,
    cityMid: -14,
    worldBackdrop: -5,
    street: 0,
    props: 4,
    foreground: 16
  });

  const ZONES = Object.freeze({
    stationEnd: 790,
    streetStart: 850,
    hiveLeft: HIVE_LEFT,
    hiveDoor: 1700,
    hiveBouncer: 1780
  });

  function resetParallax(scene) {
    scene.__milkParallaxV65 = [];
    scene.__milkParallaxLastScrollV65 = Number.NaN;
  }

  function trackParallax(scene, object, factor) {
    if (!scene || !object) return object;
    if (!Array.isArray(scene.__milkParallaxV65)) resetParallax(scene);

    object.setScrollFactor?.(0, 0);
    object.setData?.("milkParallaxFactorV65", factor);

    scene.__milkParallaxV65.push({
      object,
      factor,
      baseX: Number(object.x) || 0,
      baseY: Number(object.y) || 0
    });

    return object;
  }

  function syncParallax(scene, force = false) {
    const camera = scene?.cameras?.main;
    const layers = scene?.__milkParallaxV65;
    if (!camera || !Array.isArray(layers)) return;

    const scrollX = Number(camera.scrollX) || 0;
    if (!force && scrollX === scene.__milkParallaxLastScrollV65) return;
    scene.__milkParallaxLastScrollV65 = scrollX;

    layers.forEach((entry) => {
      const object = entry?.object;
      if (!object?.active) return;
      object.x = entry.baseX - scrollX * entry.factor;
      object.y = entry.baseY;
    });
  }

  function addWindow(g, x, y, w = 10, h = 14, muted = false) {
    g.fillStyle(muted ? 0x596565 : 0x41494a, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(muted ? 0x789395 : 0x648fa2, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(muted ? 0xa6b9b8 : 0xa9cad2, 0.58);
    g.fillRect(x + 2, y + 2, 3, h - 4);
  }

  function drawResidential(scene, spec, factor, depth, muted = false) {
    const { x, w, h, color, roof = 0x765348, floors = 3 } = spec;
    const y = GROUND_TOP - h;
    const g = trackParallax(
      scene,
      scene.add.graphics().setDepth(depth),
      factor
    );

    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(muted ? 0x777c77 : 0x77736c, 1);
    g.fillRect(x, GROUND_TOP - 13, w, 13);

    g.fillStyle(roof, 1);
    g.fillTriangle(x - 5, y, x + w / 2, y - 25, x + w + 5, y);
    g.fillStyle(0x594a44, 0.78);
    g.fillRect(x - 2, y - 2, w + 4, 4);

    // Chimneys and restrained Zürich residential detail.
    g.fillStyle(0x74665c, 1);
    g.fillRect(x + 18, y - 23, 7, 16);
    if (w > 135) g.fillRect(x + w - 27, y - 20, 7, 14);

    const cols = w > 145 ? 4 : 3;
    const usable = h - 47;
    const gapY = Math.max(25, usable / floors);
    const gapX = (w - 28) / cols;

    for (let row = 0; row < floors; row += 1) {
      const wy = y + 20 + row * gapY;
      if (wy > GROUND_TOP - 38) break;
      for (let col = 0; col < cols; col += 1) {
        addWindow(g, x + 15 + col * gapX, wy, muted ? 8 : 10, muted ? 12 : 14, muted);
      }
    }

    return g;
  }

  function createSkyV65() {
    resetParallax(this);

    [
      [0, 70, 0x70b9dc],
      [70, 70, 0x7bc4df],
      [140, 70, 0x91d0df],
      [210, 70, 0xa7d9dd],
      [280, 58, 0xb9ddd7]
    ].forEach(([y, h, color]) => {
      const band = this.add.rectangle(
        WORLD_WIDTH / 2,
        y + h / 2,
        WORLD_WIDTH + 900,
        h,
        color
      ).setDepth(DEPTH.sky);
      trackParallax(this, band, PARALLAX.sky);
    });

    [
      { x: 130, y: 74, s: 1.0 },
      { x: 870, y: 106, s: 0.72 },
      { x: 1580, y: 68, s: 1.05 },
      { x: 2440, y: 105, s: 0.82 }
    ].forEach(({ x, y, s }) => {
      const g = trackParallax(
        this,
        this.add.graphics().setDepth(DEPTH.cloud),
        PARALLAX.cloud
      );
      g.fillStyle(0xebf6f2, 0.92);
      g.fillRect(x, y, 72 * s, 13 * s);
      g.fillRect(x + 15 * s, y - 12 * s, 49 * s, 14 * s);
      g.fillRect(x + 30 * s, y - 22 * s, 29 * s, 11 * s);
      g.fillStyle(0xcfe8e7, 0.52);
      g.fillRect(x + 9 * s, y + 13 * s, 55 * s, 4 * s);
    });
  }

  function createDistantHillsV65() {
    const far = trackParallax(
      this,
      this.add.graphics().setDepth(DEPTH.mountainFar),
      PARALLAX.mountainFar
    );
    far.fillStyle(0x89afa8, 1);
    far.beginPath();
    far.moveTo(-300, GROUND_TOP);
    [
      [-300, 245], [20, 232], [300, 244], [560, 212], [810, 238],
      [1080, 220], [1370, 245], [1650, 214], [1930, 236], [2210, 207],
      [2500, 233], [2810, 211], [3300, 238]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(3300, GROUND_TOP);
    far.closePath();
    far.fillPath();

    const near = trackParallax(
      this,
      this.add.graphics().setDepth(DEPTH.mountainNear),
      PARALLAX.mountainNear
    );
    near.fillStyle(0x6e9988, 1);
    near.beginPath();
    near.moveTo(-300, GROUND_TOP);
    [
      [-300, 276], [0, 256], [270, 268], [520, 236], [760, 264],
      [1040, 244], [1320, 274], [1590, 246], [1860, 264], [2120, 235],
      [2390, 263], [2700, 239], [3300, 267]
    ].forEach(([x, y]) => near.lineTo(x, y));
    near.lineTo(3300, GROUND_TOP);
    near.closePath();
    near.fillPath();
  }

  function createCityBackgroundV65() {
    // FAR: only a pale Zürich roofline. No venue labels and no dense wall of
    // façades. It is deliberately low contrast and moves at 27% camera speed.
    const farSpecs = [
      { x: 30, w: 132, h: 104, color: 0xa9a69d },
      { x: 230, w: 150, h: 120, color: 0xa2a59d, roof: 0x6e625b },
      { x: 500, w: 124, h: 98, color: 0xb2aa98 },
      { x: 760, w: 148, h: 118, color: 0xa0a49f, roof: 0x716057 },
      { x: 1050, w: 136, h: 108, color: 0xada594 },
      { x: 1350, w: 152, h: 122, color: 0x9fa39e },
      { x: 1690, w: 128, h: 101, color: 0xb0a897 },
      { x: 2010, w: 146, h: 116, color: 0xa0a49f },
      { x: 2360, w: 136, h: 106, color: 0xaaa396 },
      { x: 2720, w: 150, h: 120, color: 0xa1a49d }
    ];
    farSpecs.forEach((spec) => drawResidential(this, spec, PARALLAX.cityFar, DEPTH.cityFar, true));

    // MID: fewer, greener residential forms. These should visibly slide faster
    // than the mountains but still much slower than Simon/HIVE.
    const midSpecs = [
      { x: 120, w: 142, h: 130, color: 0xc7b99c, roof: 0x775448 },
      { x: 610, w: 156, h: 143, color: 0xcdbd9f, roof: 0x645b55 },
      { x: 1120, w: 145, h: 136, color: 0xc8b493, roof: 0x7a5146 },
      { x: 1710, w: 154, h: 145, color: 0xcbbd9f, roof: 0x625b56 },
      { x: 2320, w: 150, h: 139, color: 0xc8b493, roof: 0x775247 }
    ];
    midSpecs.forEach((spec) => drawResidential(this, spec, PARALLAX.cityMid, DEPTH.cityMid, false));

    // Green gaps are as important as the houses for the Milchbuck feel.
    const green = trackParallax(
      this,
      this.add.graphics().setDepth(DEPTH.cityMid + 1),
      PARALLAX.cityMid
    );
    for (let x = 0; x < WORLD_WIDTH + 300; x += 115) {
      const r = 17 + ((x * 7) % 13);
      green.fillStyle((Math.floor(x / 115) % 2) ? 0x4f7f57 : 0x5b895d, 0.96);
      green.fillCircle(x + 35, 300 - ((x * 3) % 17), r);
      green.fillCircle(x + 58, 306, r * 0.78);
    }

    // ACTUAL STREET EDGE: open, residential and non-interactive. A low wall,
    // hedges and trees make the walk plausible without pretending every 100 px
    // is another shop or club.
    const world = this.add.graphics()
      .setScrollFactor(PARALLAX.world)
      .setDepth(DEPTH.worldBackdrop);

    // Wall/hedge from station exit to HIVE forecourt, with breathing gaps.
    world.fillStyle(0xb0aaa0, 1);
    world.fillRect(865, 300, 610, 22);
    world.fillStyle(0x8f8b84, 1);
    world.fillRect(865, 300, 610, 5);

    world.fillStyle(0x47764d, 1);
    world.fillRect(880, 281, 250, 19);
    world.fillRect(1195, 283, 260, 17);

    [930, 1160, 1405].forEach((x, index) => {
      world.fillStyle(0x654930, 1);
      world.fillRect(x - 5, 238, 10, 63);
      world.fillStyle(index % 2 ? 0x4d8057 : 0x56875b, 1);
      world.fillCircle(x, 225, 31);
      world.fillCircle(x - 22, 238, 20);
      world.fillCircle(x + 23, 238, 22);
    });

    // Quiet continuation behind HIVE – just homes/green, never another fake club.
    world.fillStyle(0xb0aaa0, 1);
    world.fillRect(1850, 301, 1120, 21);
    world.fillStyle(0x47764d, 1);
    world.fillRect(1870, 284, 360, 17);
    world.fillRect(2400, 283, 420, 18);
  }

  function createStreetAndTracksV65() {
    const street = this.add.graphics()
      .setScrollFactor(1)
      .setDepth(DEPTH.street);

    // The tram stop is its own physical zone. Rails stop here and do not run
    // beneath HIVE or through the residential walk.
    street.fillStyle(0xa9a8a1, 1);
    street.fillRect(0, 286, ZONES.stationEnd, 18);
    street.fillStyle(0xd0cab9, 1);
    street.fillRect(0, 286, ZONES.stationEnd, 5);
    street.fillStyle(0x777b79, 1);
    street.fillRect(0, 304, ZONES.stationEnd, 34);

    // Rails under/along the actual stop only.
    street.fillStyle(0x4c4845, 1);
    street.fillRect(0, 314, 720, 4);
    street.fillRect(0, 329, 720, 4);
    street.fillStyle(0xb6aa8e, 0.52);
    for (let x = 0; x < 720; x += 21) {
      street.fillRect(x, 317, 4, 11);
    }

    // A short diagonal departure makes it obvious that the tram line leaves
    // this road rather than continuing under Simon's entire route.
    street.lineStyle(4, 0x4c4845, 1);
    street.lineBetween(720, 315, 820, 298);
    street.lineBetween(720, 330, 820, 312);

    // Normal road from the station exit onwards.
    street.fillStyle(0x656b6c, 1);
    street.fillRect(ZONES.stationEnd, 292, WORLD_WIDTH - ZONES.stationEnd, 31);
    street.fillStyle(0x505657, 0.78);
    for (let x = ZONES.streetStart + 40; x < WORLD_WIDTH; x += 260) {
      street.fillRect(x, 306, 100, 3);
    }

    // Curb and sidewalk.
    street.fillStyle(0xbcb2a1, 1);
    street.fillRect(ZONES.stationEnd, 322, WORLD_WIDTH - ZONES.stationEnd, 8);
    street.fillStyle(0x97958f, 1);
    street.fillRect(ZONES.stationEnd, 330, WORLD_WIDTH - ZONES.stationEnd, 8);

    // Player walking floor – consistent paving, no brown placeholder soil.
    street.fillStyle(0x777875, 1);
    street.fillRect(0, GROUND_TOP, WORLD_WIDTH, GAME_HEIGHT - GROUND_TOP);
    const paving = [0x858680, 0x737570, 0x8d8b82];
    for (let y = GROUND_TOP; y < GAME_HEIGHT; y += 13) {
      const offset = ((y - GROUND_TOP) / 13) % 2 === 0 ? 0 : 18;
      for (let x = -offset; x < WORLD_WIDTH; x += 36) {
        street.fillStyle(paving[(Math.floor((x + 36) / 36) + Math.floor(y / 13)) % paving.length], 1);
        street.fillRect(x + 1, y + 1, 33, 10);
      }
    }

    street.fillStyle(0x5a5e5c, 1);
    street.fillRect(0, GROUND_TOP, WORLD_WIDTH, 3);
  }

  function createForegroundDetailsV65() {
    // Only station-side overhead infrastructure. No tram wires over HIVE.
    const stationWire = this.add.graphics().setScrollFactor(1).setDepth(3);
    stationWire.lineStyle(2, 0x4a5052, 0.90);
    [82, 285, 525, 755].forEach((x) => {
      stationWire.fillStyle(0x707779, 1);
      stationWire.fillRect(x, 82, 5, 220);
    });
    stationWire.lineBetween(82, 94, 285, 105);
    stationWire.lineBetween(285, 105, 525, 95);
    stationWire.lineBetween(525, 95, 755, 108);

    // Short quiet walk: a few lamps, a bicycle railing and trees, nothing that
    // looks like a closed/interactive venue.
    [900, 1210, 1470, 1900, 2380].forEach((x) => {
      const lamp = this.add.graphics().setScrollFactor(1).setDepth(3);
      lamp.fillStyle(0x4f5658, 1);
      lamp.fillRect(x, 230, 5, 105);
      lamp.fillRect(x - 4, 224, 13, 7);
      lamp.fillStyle(0xffe7a5, 0.9);
      lamp.fillRect(x - 1, 225, 8, 5);
    });

    const rail = this.add.graphics().setScrollFactor(1).setDepth(3);
    rail.lineStyle(3, 0x626b6d, 1);
    rail.lineBetween(1040, 306, 1120, 306);
    rail.lineBetween(1040, 306, 1040, 334);
    rail.lineBetween(1120, 306, 1120, 334);
    rail.lineBetween(1040, 320, 1120, 320);

    // Tiny non-interactive urban details keep the stretch finished without
    // turning it into a row of fake shops.
    const bin = this.add.graphics().setScrollFactor(1).setDepth(4);
    bin.fillStyle(0x596466, 1);
    bin.fillRoundedRect(1325, 297, 22, 39, 4);
    bin.fillStyle(0x333b3d, 1);
    bin.fillRect(1329, 302, 14, 5);
  }

  function addStationPolish(scene) {
    // Explicit contact plates/shadows remove the floating-shelter impression.
    const g = scene.add.graphics().setScrollFactor(1).setDepth(7);
    g.fillStyle(0x4e5557, 0.65);
    g.fillEllipse(405, 294, 210, 10);

    [314, 490].forEach((x) => {
      g.fillStyle(0x51595b, 1);
      g.fillRect(x - 8, 288, 24, 5);
      g.fillStyle(0x858b8b, 1);
      g.fillRect(x - 5, 285, 18, 4);
    });

    // Station/ticket machine grounding line.
    g.fillStyle(0x8d8d87, 1);
    g.fillRect(286, 292, 500, 4);
  }

  function addHivePolish(scene) {
    const g = scene.add.graphics().setScrollFactor(1).setDepth(3);

    // HIVE gets a modest forecourt so it reads as the destination after the
    // quiet walk, not as one storefront among many.
    g.fillStyle(0x5e6261, 1);
    g.fillRect(HIVE_LEFT - 32, 320, 314, 18);
    g.fillStyle(0x92908a, 1);
    g.fillRect(HIVE_LEFT - 32, 320, 314, 4);

    // Queue posts are decorative and kept clear of the door/bouncer hitboxes.
    g.fillStyle(0x34383b, 1);
    [HIVE_LEFT + 48, HIVE_LEFT + 105].forEach((x) => {
      g.fillRect(x, 298, 4, 24);
      g.fillCircle(x + 2, 297, 4);
    });
    g.lineStyle(2, 0x7d4a72, 0.9);
    g.lineBetween(HIVE_LEFT + 52, 306, HIVE_LEFT + 105, 306);
  }

  function enforceLionFacing(scene) {
    const lion = scene?.fightLion;

    if (!lion?.active || !lion.__lionV12) {
      scene.__milkLionLastXV65 = Number.NaN;
      return;
    }

    const x = Number(lion.x) || 0;
    const lastX = scene.__milkLionLastXV65;
    const animationKey = lion.anims?.currentAnim?.key || "";

    if (Number.isFinite(lastX)) {
      const dx = x - lastX;

      // The lion sheet faces RIGHT by default. During any visible run/jump,
      // actual movement direction is now the source of truth. This prevents a
      // relocation/tween from making him moonwalk or jump backwards.
      if (Math.abs(dx) > 0.18 && animationKey.includes("lion-v12-run")) {
        const sx = Math.max(0.01, Math.abs(lion.scaleX || 1));
        const sy = Math.max(0.01, Math.abs(lion.scaleY || 1));
        lion.setScale?.(sx, sy);
        lion.setFlipX?.(dx < 0);
      }
    }

    scene.__milkLionLastXV65 = x;
  }

  function install() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = SceneClass?.prototype;
    if (!proto || proto.__milchbuckPolishV65Installed) return Boolean(proto);

    proto.__milchbuckPolishV65Installed = true;

    const installSafeVisual = (name, replacement) => {
      if (typeof proto[name] !== "function") return;
      const original = proto[name];

      const wrapped = function milkbuckVisualV65(...args) {
        try {
          return replacement.apply(this, args);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] ${name} fallback:`, error);
          return original.apply(this, args);
        }
      };

      wrapped.__milchbuckPolishV65 = true;
      proto[name] = wrapped;
    };

    installSafeVisual("createSky", createSkyV65);
    installSafeVisual("createDistantHills", createDistantHillsV65);
    installSafeVisual("createCityBackground", createCityBackgroundV65);
    installSafeVisual("createStreetAndTracks", createStreetAndTracksV65);
    installSafeVisual("createForegroundDetails", createForegroundDetailsV65);

    if (typeof proto.createMilchbuckStation === "function") {
      const originalStation = proto.createMilchbuckStation;
      proto.createMilchbuckStation = function createMilchbuckStationV65(...args) {
        const result = originalStation.apply(this, args);
        try { addStationPolish(this); } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] station polish:`, error);
        }
        return result;
      };
      proto.createMilchbuckStation.__milchbuckPolishV65 = true;
    }

    if (typeof proto.createHiveClub === "function") {
      const originalHive = proto.createHiveClub;
      proto.createHiveClub = function createHiveClubV65Polished(...args) {
        const result = originalHive.apply(this, args);
        try { addHivePolish(this); } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] HIVE polish:`, error);
        }
        return result;
      };
      proto.createHiveClub.__milchbuckPolishV65 = true;
    }

    if (typeof proto.update === "function") {
      const originalUpdate = proto.update;
      proto.update = function updateMilchbuckV65(...args) {
        const result = originalUpdate.apply(this, args);
        syncParallax(this);
        enforceLionFacing(this);
        return result;
      };
      proto.update.__milchbuckPolishV65 = true;
    }

    // First sync after all objects have been created; subsequent updates use
    // camera.scrollX every frame.
    if (typeof proto.create === "function") {
      const originalCreate = proto.create;
      proto.create = function createMilchbuckWithParallaxV65(...args) {
        const result = originalCreate.apply(this, args);
        syncParallax(this, true);
        return result;
      };
      proto.create.__milchbuckPolishV65 = true;
    }

    console.info(
      `[Milchbuck Polish v${VERSION}] quiet short walk, HIVE x≈1575, manual camera parallax active.`
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

  window.SimonMilchbuckPolishV65 = Object.freeze({
    VERSION,
    PARALLAX,
    DEPTH,
    ZONES,
    HIVE_LEFT,
    install,
    sync(scene) { syncParallax(scene, true); }
  });
})();
