(() => {
  "use strict";

  if (window.__SIMON_MILCHBUCK_POLISH_V64__) return;
  window.__SIMON_MILCHBUCK_POLISH_V64__ = true;

  const VERSION = 64;
  const WORLD_WIDTH = 3000;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const HIVE_LEFT = 2050;

  // v64 scene-depth contract: distance is semantic, not just a depth number.
  // Street façades/sidewalk/HIVE are world-space (1.0); only genuinely distant
  // elements use parallax. The separation is deliberately stronger than v63 so
  // it is unmistakable while walking on a phone/tablet.
  const PARALLAX = Object.freeze({
    sky: 0.02,
    cloud: 0.05,
    mountainFar: 0.08,
    mountainNear: 0.14,
    treeLine: 0.22,
    cityFar: 0.30,
    cityMid: 0.52,
    world: 1.00,
    foreground: 1.08
  });

  const DEPTH = Object.freeze({
    sky: -36,
    mountainFar: -32,
    mountainNear: -28,
    treeLine: -24,
    cityFar: -18,
    cityMid: -11,
    streetFacade: -4,
    worldBack: -1,
    world: 2,
    props: 4,
    foreground: 16
  });

  const ZONES = Object.freeze({
    stationEnd: 820,
    trackExitEnd: 950,
    partyStart: 980,
    hiveLeft: HIVE_LEFT,
    hiveRight: HIVE_LEFT + 250
  });

  function addWindow(g, x, y, w = 11, h = 16, options = {}) {
    const { lit = false, shutters = false, muted = false } = options;

    if (shutters && !muted) {
      g.fillStyle(0x557064, 0.95);
      g.fillRect(x - 5, y + 1, 3, h - 2);
      g.fillRect(x + w + 2, y + 1, 3, h - 2);
    }

    g.fillStyle(muted ? 0x5b6060 : 0x403e3d, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(
      lit && !muted ? 0xf2c66e : (muted ? 0x71878c : 0x55798d),
      1
    );
    g.fillRect(x, y, w, h);
    g.fillStyle(muted ? 0x95aaab : (lit ? 0xffdf8a : 0x91afba), 0.72);
    g.fillRect(x + 2, y + 2, Math.max(2, Math.floor(w * 0.25)), h - 4);
    g.fillStyle(0x41545e, 0.82);
    g.fillRect(x + Math.floor(w / 2), y, 2, h);
  }

  function addBalcony(g, x, y, w) {
    g.fillStyle(0x5a6061, 1);
    g.fillRect(x, y, w, 4);
    g.lineStyle(2, 0x464f51, 1);
    g.lineBetween(x + 3, y - 12, x + 3, y);
    g.lineBetween(x + w - 3, y - 12, x + w - 3, y);
    g.lineBetween(x + 3, y - 12, x + w - 3, y - 12);
    for (let bx = x + 10; bx < x + w - 5; bx += 10) {
      g.lineBetween(bx, y - 11, bx, y - 1);
    }
  }

  function addDormer(g, x, roofY, roofColor, muted = false) {
    g.fillStyle(muted ? 0x6f716d : 0x685e54, 1);
    g.fillRect(x, roofY - 16, 22, 17);
    g.fillStyle(muted ? 0x70868a : 0x4d7185, 1);
    g.fillRect(x + 6, roofY - 12, 10, 10);
    g.fillStyle(roofColor, 1);
    g.fillTriangle(x - 3, roofY - 16, x + 11, roofY - 28, x + 25, roofY - 16);
  }

  function addResidentialBuilding(scene, spec, scrollFactor, depth, muted = false) {
    const {
      x,
      w,
      h,
      color,
      roof = 0x7b4d40,
      floors = 3,
      balcony = false,
      shutters = false,
      dormers = true
    } = spec;

    const y = GROUND_TOP - h;
    const g = scene.add.graphics().setScrollFactor(scrollFactor).setDepth(depth);

    g.fillStyle(muted ? 0x67716f : 0x5a4e47, muted ? 0.28 : 0.45);
    g.fillRect(x + w - 8, y + 7, 12, h - 7);

    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);

    g.fillStyle(muted ? 0x78807c : 0x77736b, 1);
    g.fillRect(x, GROUND_TOP - 14, w, 14);

    g.fillStyle(roof, 1);
    g.fillTriangle(x - 6, y, x + w / 2, y - 30, x + w + 6, y);
    g.fillStyle(0x57443d, 0.78);
    g.fillRect(x - 3, y - 2, w + 6, 5);

    g.fillStyle(muted ? 0x72756f : 0x6f6258, 1);
    g.fillRect(x + 18, y - 27, 8, 19);
    g.fillStyle(0x403a37, 1);
    g.fillRect(x + 16, y - 29, 12, 4);

    if (dormers && w >= 122) {
      addDormer(g, x + 30, y, roof, muted);
      if (w >= 150) addDormer(g, x + w - 54, y, roof, muted);
    }

    const usableTop = y + 22;
    const baseTop = GROUND_TOP - 42;
    const floorGap = Math.max(
      25,
      Math.floor((baseTop - usableTop) / Math.max(1, floors - 1))
    );
    const cols = w >= 150 ? 4 : 3;
    const stepX = (w - 30) / cols;

    for (let floor = 0; floor < floors; floor += 1) {
      const wy = usableTop + floor * floorGap;
      if (wy > baseTop - 7) break;

      for (let col = 0; col < cols; col += 1) {
        const wx = x + 16 + col * stepX;
        const lit = ((Math.floor(x / 10) + floor * 5 + col * 3) % 13) === 0;
        addWindow(g, wx, wy, muted ? 8 : 11, muted ? 13 : 16, {
          lit,
          shutters,
          muted
        });
      }

      if (balcony && !muted && floor === 1 && w >= 130) {
        addBalcony(g, x + w * 0.28, wy + 22, w * 0.44);
      }
    }

    g.fillStyle(muted ? 0x656c69 : 0x6d7474, 1);
    g.fillRect(x + w - 5, y + 7, 3, h - 21);
    g.fillStyle(muted ? 0x858a83 : 0x81766b, 0.88);
    g.fillRect(x, GROUND_TOP - 60, w, 4);

    return g;
  }

  function addVenueGroundFloor(scene, spec) {
    const {
      x,
      w,
      label,
      accent = 0x8f6854,
      type = "closed",
      signY = GROUND_TOP - 78
    } = spec;

    const g = scene.add.graphics()
      .setScrollFactor(PARALLAX.world)
      .setDepth(1);

    // Daytime party street: most venues are shut / quiet, but their identity is
    // visible. They are decorative only: no markers and no interaction zones.
    g.fillStyle(0x343b3e, 1);
    g.fillRect(x + 10, GROUND_TOP - 72, w - 20, 38);

    if (type === "shutter") {
      g.fillStyle(0x586164, 1);
      g.fillRect(x + 14, GROUND_TOP - 68, w - 28, 30);
      g.lineStyle(2, 0x434a4d, 0.75);
      for (let yy = GROUND_TOP - 64; yy < GROUND_TOP - 40; yy += 6) {
        g.lineBetween(x + 15, yy, x + w - 15, yy);
      }
    } else if (type === "window") {
      g.fillStyle(0x55798b, 1);
      g.fillRect(x + 16, GROUND_TOP - 66, w - 52, 25);
      g.fillStyle(0xa6c2ca, 0.55);
      g.fillRect(x + 20, GROUND_TOP - 62, Math.max(12, (w - 60) * 0.35), 18);
      g.fillStyle(0x514740, 1);
      g.fillRect(x + w - 31, GROUND_TOP - 68, 18, 34);
    } else {
      g.fillStyle(0x4d5658, 1);
      g.fillRect(x + 16, GROUND_TOP - 66, w - 50, 28);
      g.fillStyle(0x514740, 1);
      g.fillRect(x + w - 29, GROUND_TOP - 68, 17, 34);
    }

    g.fillStyle(accent, 1);
    g.fillRect(x + 12, signY, w - 24, 7);

    const text = scene.add.text(x + w / 2, signY - 7, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      color: "#f2ead2",
      stroke: "#2f3132",
      strokeThickness: 3
    })
      .setOrigin(0.5)
      .setScrollFactor(PARALLAX.world)
      .setDepth(2);

    text.setData?.("decorativeOnly", true);
  }

  function addStreetFacade(scene, spec) {
    addResidentialBuilding(
      scene,
      spec,
      PARALLAX.world,
      DEPTH.streetFacade,
      false
    );

    if (spec.venue) {
      addVenueGroundFloor(scene, {
        x: spec.x,
        w: spec.w,
        ...spec.venue
      });
    }
  }

  function createSkyV64() {
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
        WORLD_WIDTH + 250,
        band.h,
        band.color
      )
        .setScrollFactor(PARALLAX.sky)
        .setDepth(DEPTH.sky);
    });

    [
      { x: 140, y: 72, s: 1.0 },
      { x: 930, y: 103, s: 0.75 },
      { x: 1770, y: 67, s: 1.05 },
      { x: 2600, y: 102, s: 0.90 }
    ].forEach(({ x, y, s }) => {
      const g = this.add.graphics()
        .setScrollFactor(PARALLAX.cloud)
        .setDepth(DEPTH.sky + 2);
      g.fillStyle(0xeaf6f2, 0.90);
      g.fillRect(x, y, 72 * s, 14 * s);
      g.fillRect(x + 14 * s, y - 12 * s, 50 * s, 14 * s);
      g.fillRect(x + 30 * s, y - 23 * s, 30 * s, 12 * s);
      g.fillStyle(0xcfe8e7, 0.52);
      g.fillRect(x + 8 * s, y + 14 * s, 58 * s, 4 * s);
    });
  }

  function createDistantHillsV64() {
    const far = this.add.graphics()
      .setScrollFactor(PARALLAX.mountainFar)
      .setDepth(DEPTH.mountainFar);

    far.fillStyle(0x86ada6, 1);
    far.beginPath();
    far.moveTo(0, GROUND_TOP);
    [
      [0, 248], [210, 218], [430, 236], [660, 192], [900, 230],
      [1130, 204], [1380, 240], [1600, 206], [1850, 228], [2070, 190],
      [2310, 220], [2530, 199], [2780, 227], [3000, 195]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(WORLD_WIDTH, GROUND_TOP);
    far.closePath();
    far.fillPath();

    const near = this.add.graphics()
      .setScrollFactor(PARALLAX.mountainNear)
      .setDepth(DEPTH.mountainNear);

    near.fillStyle(0x659482, 1);
    near.beginPath();
    near.moveTo(0, GROUND_TOP);
    [
      [0, 274], [180, 239], [360, 256], [580, 217], [800, 250],
      [1010, 225], [1240, 262], [1460, 231], [1690, 252], [1910, 216],
      [2140, 248], [2360, 225], [2590, 252], [2810, 213], [3000, 240]
    ].forEach(([x, y]) => near.lineTo(x, y));
    near.lineTo(WORLD_WIDTH, GROUND_TOP);
    near.closePath();
    near.fillPath();

    const treeLine = this.add.graphics()
      .setScrollFactor(PARALLAX.treeLine)
      .setDepth(DEPTH.treeLine);

    for (let x = 0; x < WORLD_WIDTH; x += 38) {
      const h = 26 + ((x * 17) % 35);
      treeLine.fillStyle((Math.floor(x / 38) % 3 === 0) ? 0x3b6a58 : 0x4a7a61, 1);
      treeLine.fillTriangle(
        x,
        GROUND_TOP - 40,
        x + 18,
        GROUND_TOP - 40 - h,
        x + 36,
        GROUND_TOP - 40
      );
    }
  }

  function createCityBackgroundV64() {
    // Layer 1: distant pale roofline – obviously slower than the street.
    const farPalette = [0xa9a69d, 0x9da29d, 0xb1a993, 0x989f9b];
    for (let i = 0; i < 16; i += 1) {
      addResidentialBuilding(
        this,
        {
          x: 40 + i * 190,
          w: 116 + (i % 3) * 18,
          h: 92 + (i % 4) * 12,
          color: farPalette[i % farPalette.length],
          roof: i % 2 === 0 ? 0x75645b : 0x646360,
          floors: 3,
          dormers: false
        },
        PARALLAX.cityFar,
        DEPTH.cityFar,
        true
      );
    }

    // Layer 2: nearer residential blocks, still behind the actual party street.
    const midPalette = [0xc5b89d, 0xc0aa8c, 0xcbbd9f, 0xb9ae96];
    for (let i = 0; i < 13; i += 1) {
      addResidentialBuilding(
        this,
        {
          x: 115 + i * 235,
          w: 128 + (i % 2) * 24,
          h: 115 + (i % 4) * 13,
          color: midPalette[i % midPalette.length],
          roof: i % 2 === 0 ? 0x79584e : 0x5f5d59,
          floors: 3,
          balcony: false,
          dormers: true
        },
        PARALLAX.cityMid,
        DEPTH.cityMid,
        true
      );
    }

    // Layer 3: the actual street façades. These MUST move at 1.0 with the
    // sidewalk/HIVE because Simon is walking directly in front of them.
    // Station area is intentionally left open; HIVE gets a generous 330px gap.
    const street = [
      {
        x: 980, w: 150, h: 162, color: 0xd7c29f, roof: 0x7e4c40,
        floors: 4, shutters: true,
        venue: { label: "CAFE", type: "window", accent: 0x8d7155 }
      },
      {
        x: 1145, w: 138, h: 148, color: 0xc8b28f, roof: 0x5f5955,
        floors: 3, balcony: true,
        venue: { label: "BAR", type: "shutter", accent: 0x71556f }
      },
      {
        x: 1298, w: 160, h: 177, color: 0xdfc9a5, roof: 0x814d40,
        floors: 4, shutters: true,
        venue: { label: "TATTOO", type: "shutter", accent: 0x545f67 }
      },
      {
        x: 1473, w: 142, h: 156, color: 0xc9b99b, roof: 0x625b56,
        floors: 3, balcony: true,
        venue: { label: "PIZZA", type: "window", accent: 0x9b5f48 }
      },
      {
        x: 1630, w: 150, h: 171, color: 0xd6b68d, roof: 0x824d40,
        floors: 4,
        venue: { label: "KIOSK", type: "closed", accent: 0x527a68 }
      },
      {
        x: 1795, w: 132, h: 148, color: 0xd6c7aa, roof: 0x605a56,
        floors: 3, shutters: true,
        venue: { label: "MUSIC", type: "shutter", accent: 0x526c82 }
      },
      // 123px alley / queue breathing room before HIVE.

      // HIVE occupies 2050..2300. No competing venue next to its entrance.
      {
        x: 2340, w: 150, h: 166, color: 0xd8c5a2, roof: 0x625954,
        floors: 4, balcony: true,
        venue: { label: "CAFE", type: "shutter", accent: 0x7b6751 }
      },
      {
        x: 2505, w: 145, h: 151, color: 0xcaa782, roof: 0x804c3f,
        floors: 3, shutters: true,
        venue: { label: "BAR", type: "closed", accent: 0x66556f }
      },
      {
        x: 2665, w: 152, h: 176, color: 0xd6c4a4, roof: 0x5e5955,
        floors: 4, balcony: true,
        venue: { label: "TAKEAWAY", type: "window", accent: 0x8c654d }
      },
      {
        x: 2832, w: 150, h: 158, color: 0xcdb18d, roof: 0x814c3f,
        floors: 3, shutters: true,
        venue: { label: "CLUB", type: "shutter", accent: 0x5b536d }
      }
    ];

    street.forEach((spec) => addStreetFacade(this, spec));
  }

  function createStreetAndTracksV64() {
    const street = this.add.graphics()
      .setScrollFactor(PARALLAX.world)
      .setDepth(0);

    // STATION ZONE (0..820): platform is physically connected to the shelter.
    street.fillStyle(0xa8a7a0, 1);
    street.fillRect(0, 284, ZONES.stationEnd, 18);
    street.fillStyle(0xc9c4b6, 1);
    street.fillRect(0, 284, ZONES.stationEnd, 5);
    street.fillStyle(0x777b79, 1);
    street.fillRect(0, 302, ZONES.stationEnd, 36);

    // Tactile platform edge.
    street.fillStyle(0xd6c083, 1);
    for (let x = 10; x < ZONES.stationEnd - 8; x += 18) {
      street.fillRect(x, 297, 11, 3);
    }

    // Rails exist ONLY at the stop and then visibly diverge out of this street.
    street.fillStyle(0x4c4845, 1);
    street.fillRect(0, 311, 770, 4);
    street.fillRect(0, 327, 770, 4);
    street.fillStyle(0xb6aa8e, 0.50);
    for (let x = 0; x < 770; x += 21) {
      street.fillRect(x, 314, 4, 13);
    }

    // Visual track exit: the tram route turns away into the background instead
    // of inexplicably running through the whole party street.
    street.lineStyle(4, 0x4c4845, 1);
    street.lineBetween(770, 313, 930, 292);
    street.lineBetween(770, 329, 930, 306);
    street.lineStyle(2, 0xa99e86, 0.45);
    for (let x = 790; x < 920; x += 24) {
      const t = (x - 770) / 160;
      const y = 315 - t * 20;
      street.lineBetween(x, y, x + 2, y + 14);
    }

    // Transition patch/plaza where the station ends and the nightlife street begins.
    street.fillStyle(0x858985, 1);
    street.fillRect(ZONES.stationEnd, 306, ZONES.trackExitEnd - ZONES.stationEnd, 32);
    street.fillStyle(0xbab2a2, 1);
    street.fillRect(ZONES.stationEnd, 326, ZONES.trackExitEnd - ZONES.stationEnd, 12);

    // PARTY STREET (950..3000): normal road + curb + sidewalk, NO tram rails.
    street.fillStyle(0x656b6c, 1);
    street.fillRect(ZONES.trackExitEnd, 292, WORLD_WIDTH - ZONES.trackExitEnd, 29);
    street.fillStyle(0x4f5657, 0.78);
    for (let x = ZONES.trackExitEnd + 35; x < WORLD_WIDTH; x += 210) {
      street.fillRect(x, 304, 92, 3);
    }

    street.fillStyle(0xb9afa0, 1);
    street.fillRect(ZONES.trackExitEnd, 321, WORLD_WIDTH - ZONES.trackExitEnd, 8);
    street.fillStyle(0x98958e, 1);
    street.fillRect(ZONES.trackExitEnd, 329, WORLD_WIDTH - ZONES.trackExitEnd, 9);

    // Foreground walking surface – urban paving instead of brown placeholder soil.
    street.fillStyle(0x777875, 1);
    street.fillRect(0, GROUND_TOP, WORLD_WIDTH, GAME_HEIGHT - GROUND_TOP);
    const paving = [0x858680, 0x737570, 0x8d8b82];
    for (let y = GROUND_TOP; y < GAME_HEIGHT; y += 13) {
      const offset = ((y - GROUND_TOP) / 13) % 2 === 0 ? 0 : 18;
      for (let x = -offset; x < WORLD_WIDTH; x += 36) {
        street.fillStyle(paving[(Math.floor(x / 36) + Math.floor(y / 13) + 30) % paving.length], 1);
        street.fillRect(x + 1, y + 1, 33, 10);
      }
    }

    // A clean curb line keeps the gameplay floor readable.
    street.fillStyle(0x5a5d5b, 1);
    street.fillRect(0, GROUND_TOP - 2, WORLD_WIDTH, 3);
  }

  function addStationPolish(scene) {
    const g = scene.add.graphics()
      .setDepth(DEPTH.props)
      .setScrollFactor(PARALLAX.world);

    // Feet/columns visually meet the new platform slab.
    g.fillStyle(0x525d60, 1);
    g.fillRect(310, 282, 16, 8);
    g.fillRect(486, 282, 16, 8);

    // Stronger shelter framing and restrained glass reflections.
    g.lineStyle(2, 0xd8ece9, 0.52);
    g.lineBetween(340, 188, 381, 264);
    g.lineBetween(409, 187, 453, 267);
    g.lineStyle(2, 0x59676a, 0.90);
    g.lineBetween(380, 180, 380, 276);
    g.lineBetween(434, 180, 434, 276);

    // Timetable / local map panel.
    g.fillStyle(0x39484d, 1);
    g.fillRect(395, 194, 38, 45);
    g.fillStyle(0xe5e1d3, 1);
    g.fillRect(399, 198, 30, 37);
    g.lineStyle(2, 0x3e80a1, 1);
    g.lineBetween(404, 228, 411, 215);
    g.lineBetween(411, 215, 420, 207);
    g.lineBetween(420, 207, 425, 201);

    // Small bin + planter complete the stop without changing hitboxes.
    g.fillStyle(0x46555a, 1);
    g.fillRect(618, 258, 19, 27);
    g.fillStyle(0x26343a, 1);
    g.fillRect(621, 262, 13, 6);
    g.fillStyle(0x79583c, 1);
    g.fillRect(276, 270, 24, 14);
    g.fillStyle(0x477449, 1);
    g.fillCircle(282, 269, 10);
    g.fillCircle(294, 267, 11);
  }

  function addHivePolish(scene) {
    const x = HIVE_LEFT;
    const w = 250;
    const g = scene.add.graphics()
      .setDepth(DEPTH.props)
      .setScrollFactor(PARALLAX.world);

    // Rooftop equipment and façade details make HIVE read as a real building.
    g.fillStyle(0x34333d, 1);
    g.fillRect(x + 25, 126, 45, 16);
    g.fillStyle(0x5c626b, 1);
    g.fillRect(x + 33, 119, 28, 8);
    g.fillStyle(0x515762, 1);
    g.fillRect(x + 186, 116, 11, 26);
    g.fillStyle(0x23252c, 1);
    g.fillRect(x + 182, 113, 19, 5);

    g.lineStyle(2, 0x34313c, 0.9);
    for (let yy = 168; yy < 326; yy += 31) {
      g.lineBetween(x + 5, yy, x + w - 5, yy);
    }

    g.fillStyle(0x0d1016, 1);
    g.fillRect(x + 18, 232, 30, 26);
    g.lineStyle(2, 0x606570, 1);
    for (let yy = 237; yy < 255; yy += 5) {
      g.lineBetween(x + 22, yy, x + 44, yy);
    }

    [[x + 18, 278, 0xb83676], [x + 222, 266, 0x3b8ca8]].forEach(([px, py, c]) => {
      g.fillStyle(0x24222b, 1);
      g.fillRect(px, py, 15, 24);
      g.fillStyle(c, 0.9);
      g.fillRect(px + 3, py + 4, 9, 4);
      g.fillRect(px + 4, py + 12, 7, 7);
    });

    // Daytime remnants of the night queue: bollards, faded stickers, no crowd.
    g.fillStyle(0x8e784e, 1);
    g.fillRect(x + 84, 310, 5, 28);
    g.fillRect(x + 165, 310, 5, 28);
    g.lineStyle(2, 0xc5a95e, 0.84);
    g.lineBetween(x + 89, 315, x + 165, 315);
  }

  function addBike(scene, x, y, flip = false) {
    const g = scene.add.graphics()
      .setScrollFactor(PARALLAX.world)
      .setDepth(DEPTH.props);

    const dir = flip ? -1 : 1;
    g.lineStyle(2, 0x3f4648, 1);
    g.strokeCircle(x - 12, y, 10);
    g.strokeCircle(x + 14, y, 10);
    g.lineBetween(x - 12, y, x, y - 13);
    g.lineBetween(x, y - 13, x + 14, y);
    g.lineBetween(x - 12, y, x + 5, y);
    g.lineBetween(x + 5, y, x, y - 13);
    g.lineBetween(x, y - 13, x + 9 * dir, y - 18);
    g.lineBetween(x + 7 * dir, y - 18, x + 13 * dir, y - 18);
  }

  function createForegroundDetailsV64() {
    // The base Milchbuck stop already owns its catenary masts. v64 adds NO
    // tram infrastructure beyond the station; the party street is ordinary road.

    // Normal street lamps from the party street onward.
    for (let x = 1030; x < WORLD_WIDTH; x += 370) {
      const lamp = this.add.graphics()
        .setDepth(DEPTH.props)
        .setScrollFactor(PARALLAX.world);
      lamp.fillStyle(0x4b5356, 1);
      lamp.fillRect(x, 224, 5, 107);
      lamp.fillRect(x - 5, 217, 15, 8);
      lamp.fillStyle(0xffe3a2, 0.72);
      lamp.fillRect(x - 1, 219, 8, 5);
      lamp.fillStyle(0x2d3335, 1);
      lamp.fillRect(x - 4, 328, 13, 4);
    }

    // Daytime party-street clutter: bikes/posters/bins only; no interactions.
    addBike(this, 1215, 326, false);
    addBike(this, 1715, 326, true);
    addBike(this, 2515, 326, false);

    [1090, 1590, 1885, 2460, 2885].forEach((x, i) => {
      const bin = this.add.graphics()
        .setDepth(DEPTH.props)
        .setScrollFactor(PARALLAX.world);
      bin.fillStyle(i % 2 === 0 ? 0x3e5e4d : 0x4d5859, 1);
      bin.fillRect(x, 309, 18, 29);
      bin.fillStyle(0x283a31, 1);
      bin.fillRect(x - 2, 306, 22, 5);
    });

    // Small plaza greenery between station and nightlife street.
    [865, 930].forEach((x, i) => {
      const tree = this.add.graphics()
        .setScrollFactor(PARALLAX.world)
        .setDepth(DEPTH.worldBack);
      tree.fillStyle(0x684a35, 1);
      tree.fillRect(x - 4, 249, 9, 89);
      tree.fillStyle(0x315f45, 1);
      tree.fillCircle(x, 235, 27 + i * 2);
      tree.fillStyle(0x4d8050, 1);
      tree.fillCircle(x - 19, 248, 20);
      tree.fillCircle(x + 20, 248, 21);
    });

    // Near-plane greenery is sparse and deliberately faster than Simon's world.
    [1380, 2740].forEach((x) => {
      const fg = this.add.graphics()
        .setDepth(DEPTH.foreground)
        .setScrollFactor(PARALLAX.foreground);
      fg.fillStyle(0x355b3f, 0.90);
      fg.fillRect(x, GROUND_TOP - 7, 48, 7);
      fg.fillStyle(0x50754d, 0.90);
      for (let px = x + 4; px < x + 44; px += 9) {
        fg.fillTriangle(px, GROUND_TOP - 7, px + 4, GROUND_TOP - 15, px + 8, GROUND_TOP - 7);
      }
    });
  }

  function install() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
    const proto = SceneClass?.prototype;
    if (!proto) return false;
    if (proto.__milchbuckPolishV64Installed) return true;

    proto.__milchbuckPolishV64Installed = true;

    const installSafeVisual = (name, replacement) => {
      const original = proto[name];
      if (typeof original !== "function") return;

      const wrapped = function safeMilchbuckVisualV64(...args) {
        try {
          return replacement.apply(this, args);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] ${name} fallback:`, error);
          return original.apply(this, args);
        }
      };

      wrapped.__milchbuckPolishV64 = true;
      wrapped.__previousVisualFactoryV64 = original;
      proto[name] = wrapped;
    };

    installSafeVisual("createSky", createSkyV64);
    installSafeVisual("createDistantHills", createDistantHillsV64);
    installSafeVisual("createCityBackground", createCityBackgroundV64);
    installSafeVisual("createStreetAndTracks", createStreetAndTracksV64);
    installSafeVisual("createForegroundDetails", createForegroundDetailsV64);

    // Keep the base station interaction logic, but visually seat it on the new
    // platform and add finished shelter detail.
    if (typeof proto.createMilchbuckStation === "function") {
      const originalStation = proto.createMilchbuckStation;
      proto.createMilchbuckStation = function createMilchbuckStationV64(...args) {
        const result = originalStation.apply(this, args);
        try {
          addStationPolish(this);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] station polish skipped:`, error);
        }
        return result;
      };
      proto.createMilchbuckStation.__milchbuckPolishV64 = true;
    }

    // hive-location-v64 has already shifted the original HIVE to x=2050.
    if (typeof proto.createHiveClub === "function") {
      const originalHive = proto.createHiveClub;
      proto.createHiveClub = function createHiveClubV64Polished(...args) {
        const result = originalHive.apply(this, args);
        try {
          addHivePolish(this);
        } catch (error) {
          console.error(`[Milchbuck Polish v${VERSION}] HIVE polish skipped:`, error);
        }
        return result;
      };
      proto.createHiveClub.__milchbuckPolishV64 = true;
    }

    console.info(
      `[Milchbuck Polish v${VERSION}] station 0-820, party street 980+, HIVE x≈2050; strong semantic parallax active.`
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

  window.SimonMilchbuckPolishV64 = Object.freeze({
    VERSION,
    PARALLAX,
    DEPTH,
    ZONES,
    HIVE_LEFT,
    install
  });
})();
