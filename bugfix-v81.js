(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V81__) return;
  window.__SIMON_BUGFIX_V81__ = true;

  const VERSION = 81;
  const BAHNHOF_KEY = "BahnhofquaiScene";
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const BAHNHOF_WIDTH = 3000;

  // Same Zürich daylight family as zurich-outdoor-v67.
  const C = Object.freeze({
    skyTop: 0x69b5d7,
    skyMid: 0x86c7d9,
    skyLow: 0xb9dcd6,
    haze: 0xd5e4d9,
    alpsFar: 0xa8bbb8,
    alpsSnow: 0xe4e9df,
    hills: 0x718f81,
    hillsLight: 0x83a091,
    stoneLight: 0xd8cfbd,
    stone: 0xbeb29e,
    stoneDark: 0x81766a,
    glass: 0x587a88,
    glassLight: 0xb8d2d4,
    brass: 0xb99150,
    brassLight: 0xd5b86c,
    red: 0x982f35,
    redDark: 0x6f252b,
    charcoal: 0x34393d,
    metal: 0x545e61,
    paving: 0xaaa397,
    greenDark: 0x3e6849,
    green: 0x527c54,
    greenLight: 0x6c9464,
    shadow: 0x33383a
  });

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(key) {
    try {
      return getGame()?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function safeDestroy(object) {
    try { object?.destroy?.(true); } catch {}
  }

  function sceneWorldWidth(scene, fallback = 1600) {
    return Math.max(
      Number(scene?.physics?.world?.bounds?.width) || 0,
      Number(scene?.cameras?.main?.getBounds?.()?.width) || 0,
      Number(scene?.scale?.width) || 0,
      fallback
    );
  }

  function sceneGroundTop(scene) {
    const y = Number(scene?.player?.y);
    if (Number.isFinite(y) && y > 185 && y < 310) {
      return Math.max(315, Math.min(350, Math.round(y + 88)));
    }
    return GROUND_TOP;
  }

  // ======================================================================
  // v81 manual parallax. Kept separate from v67 so neither patch owns the
  // other's object registry.
  // ======================================================================

  function trackParallax(scene, object, factor) {
    if (!scene || !object) return object;
    if (!Array.isArray(scene.__z81Parallax)) scene.__z81Parallax = [];

    object.setScrollFactor?.(0, 0);
    scene.__z81Parallax.push({
      object,
      factor,
      baseX: Number(object.x) || 0,
      baseY: Number(object.y) || 0
    });
    return object;
  }

  function syncParallax(scene) {
    const camera = scene?.cameras?.main;
    const layers = scene?.__z81Parallax;
    if (!camera || !Array.isArray(layers)) return;

    const scrollX = Number(camera.scrollX) || 0;
    if (scrollX === scene.__z81LastScroll) return;
    scene.__z81LastScroll = scrollX;

    layers.forEach((entry) => {
      const object = entry?.object;
      if (!object?.active) return;
      object.x = entry.baseX - scrollX * entry.factor;
      object.y = entry.baseY;
    });
  }

  function attachParallaxUpdate(scene) {
    if (!scene?.events || scene.__z81ParallaxListener) return;

    const onUpdate = () => syncParallax(scene);
    scene.events.on("update", onUpdate);
    scene.__z81ParallaxListener = onUpdate;

    scene.events.once("shutdown", () => {
      try { scene.events.off("update", onUpdate); } catch {}
      scene.__z81ParallaxListener = null;
      scene.__z81Parallax = [];
      scene.__z81LastScroll = Number.NaN;
      scene.__z81BahnhofFinal = false;
      scene.__z81BurkliFinal = false;
    });
  }

  // ======================================================================
  // BAHNHOFSTRASSE — final art pass
  // ======================================================================

  function addBahnhofAlps(scene) {
    if (scene.__z81BahnhofAlps) return;

    const width = Math.max(BAHNHOF_WIDTH, sceneWorldWidth(scene, BAHNHOF_WIDTH));

    // Atmospheric veil prevents the mountains from fighting the façades.
    const haze = trackParallax(
      scene,
      scene.add.graphics().setDepth(-54.2),
      0.18
    );
    haze.fillStyle(C.haze, 0.30);
    haze.fillRect(-700, 150, width + 1900, 112);

    const far = trackParallax(
      scene,
      scene.add.graphics().setDepth(-53.5),
      0.23
    );

    far.fillStyle(C.alpsFar, 0.92);
    far.beginPath();
    far.moveTo(-800, 246);
    [
      [-520, 221], [-255, 191], [40, 222], [305, 158], [535, 214],
      [785, 171], [1040, 223], [1280, 149], [1515, 211], [1775, 163],
      [2025, 220], [2285, 143], [2520, 208], [2765, 166], [3030, 218],
      [3380, 185], [width + 700, 225]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.lineTo(width + 700, 260);
    far.lineTo(-800, 260);
    far.closePath();
    far.fillPath();

    // Snow caps are intentionally sparse and pale: recognisable Alps, not a
    // fantasy mountain wall behind central Zürich.
    far.fillStyle(C.alpsSnow, 0.78);
    [
      [305, 158, 49], [785, 171, 39], [1280, 149, 55],
      [1775, 163, 45], [2285, 143, 58], [2765, 166, 42]
    ].forEach(([x, y, s]) => {
      far.fillTriangle(x - s, y + 30, x, y, x + s, y + 31);
      far.fillStyle(C.alpsFar, 0.35);
      far.fillTriangle(x - s * 0.42, y + 18, x, y, x + 5, y + 23);
      far.fillStyle(C.alpsSnow, 0.78);
    });

    const hills = trackParallax(
      scene,
      scene.add.graphics().setDepth(-50.2),
      0.36
    );
    hills.fillStyle(C.hills, 0.88);
    hills.beginPath();
    hills.moveTo(-750, 264);
    [
      [-450, 244], [-150, 231], [125, 249], [410, 221], [700, 246],
      [995, 226], [1290, 252], [1580, 224], [1880, 247], [2180, 218],
      [2475, 248], [2780, 222], [3120, 247], [width + 650, 232]
    ].forEach(([x, y]) => hills.lineTo(x, y));
    hills.lineTo(width + 650, 275);
    hills.lineTo(-750, 275);
    hills.closePath();
    hills.fillPath();

    hills.fillStyle(C.hillsLight, 0.34);
    hills.fillEllipse(480, 237, 380, 35);
    hills.fillEllipse(1680, 239, 470, 41);
    hills.fillEllipse(2690, 238, 390, 37);

    scene.__z81BahnhofAlps = [haze, far, hills];
  }

  function drawElegantWindow(g, x, y, w, h, lit = false) {
    g.fillStyle(0x424b4e, 1);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(lit ? 0xc8a66a : C.glass, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(lit ? 0xefd28e : C.glassLight, lit ? 0.48 : 0.32);
    g.fillRect(x + 3, y + 3, Math.max(3, w * 0.18), h - 6);
    g.fillStyle(0x334146, 0.62);
    g.fillRect(x + w * 0.55, y, 2, h);
  }

  function drawAwning(g, x, y, w, color, dark) {
    g.fillStyle(dark, 1);
    g.fillRect(x, y, w, 5);
    const sections = Math.max(3, Math.floor(w / 18));
    const sw = w / sections;
    for (let i = 0; i < sections; i += 1) {
      g.fillStyle(i % 2 ? color : 0xe8dfcf, 1);
      g.fillRect(x + i * sw, y + 5, sw + 1, 11);
    }
    g.fillStyle(dark, 0.82);
    g.fillRect(x - 2, y + 16, w + 4, 3);
  }

  function drawPremiumShopBay(g, x, w, options = {}) {
    const {
      accent = 0x755f4f,
      accentDark = 0x4d4138,
      glass = C.glass,
      warm = false,
      awning = true
    } = options;

    const top = 278;
    const bottom = 329;

    // Stone plinth and vertical framing.
    g.fillStyle(C.stoneDark, 1);
    g.fillRect(x, top - 5, w, 5);
    g.fillStyle(C.stone, 1);
    g.fillRect(x + 3, top, 5, bottom - top);
    g.fillRect(x + w - 8, top, 5, bottom - top);

    // Two generous display windows. Their larger scale is deliberate.
    const gap = 9;
    const doorW = Math.max(22, Math.floor(w * 0.18));
    const bayW = Math.floor((w - doorW - gap * 4) / 2);
    const leftX = x + gap;
    const rightX = leftX + bayW + gap + doorW + gap;

    g.fillStyle(0x31393c, 1);
    g.fillRect(leftX - 2, top + 8, bayW + 4, 37);
    g.fillRect(rightX - 2, top + 8, bayW + 4, 37);
    g.fillStyle(glass, 1);
    g.fillRect(leftX, top + 10, bayW, 33);
    g.fillRect(rightX, top + 10, bayW, 33);

    g.fillStyle(C.glassLight, 0.27);
    g.fillTriangle(leftX + 4, top + 12, leftX + 17, top + 12, leftX + 4, top + 36);
    g.fillTriangle(rightX + 4, top + 12, rightX + 17, top + 12, rightX + 4, top + 36);

    const doorX = leftX + bayW + gap;
    g.fillStyle(accentDark, 1);
    g.fillRect(doorX, top + 5, doorW, 43);
    g.fillStyle(warm ? 0xd2a66b : 0x78939b, 0.48);
    g.fillRect(doorX + 4, top + 10, doorW - 8, 21);
    g.fillStyle(C.brassLight, 1);
    g.fillCircle(doorX + doorW - 5, top + 31, 2.3);

    if (awning) drawAwning(g, x + 5, top - 10, w - 10, accent, accentDark);

    // A restrained brass sill makes Bahnhofstrasse read more upscale.
    g.fillStyle(C.brass, 0.78);
    g.fillRect(leftX, top + 44, bayW, 2);
    g.fillRect(rightX, top + 44, bayW, 2);
  }

  function addBahnhofFacadeFinal(scene) {
    if (scene.__z81BahnhofFacadeFinal) return;

    // Upper-floor polish, still behind the actual street plane.
    const upper = scene.add.graphics().setDepth(-0.7);

    const upperSpecs = [
      [990, 178, 166], [1178, 214, 150], [1648, 226, 157],
      [2448, 138, 164], [2742, 240, 145]
    ];

    upperSpecs.forEach(([x, w, top], index) => {
      upper.fillStyle(index % 2 ? 0x9b8e7c : 0xb3a690, 0.72);
      upper.fillRect(x - 2, top, w + 4, 4);
      upper.fillStyle(C.stoneLight, 0.42);
      upper.fillRect(x + 5, top + 7, w - 10, 2);

      // Window lintels / flower ledges are a small detail that makes the old
      // block façades feel intentionally drawn rather than generated boxes.
      for (let wx = x + 18; wx < x + w - 18; wx += 42) {
        upper.fillStyle(0x877a68, 0.68);
        upper.fillRect(wx - 3, 224, 21, 3);
        if ((wx + index) % 3 === 0) {
          upper.fillStyle(C.greenDark, 0.88);
          upper.fillRect(wx, 218, 15, 5);
          upper.fillStyle(C.greenLight, 0.75);
          upper.fillCircle(wx + 5, 216, 4);
          upper.fillCircle(wx + 11, 215, 4);
        }
      }
    });

    // Ground floor sits visually on the pavement (depth > street, < player).
    const shop = scene.add.graphics().setDepth(1.35);

    // Elegant filler storefronts, intentionally without readable fake shop
    // names, so only true interactive stores still advertise interaction.
    drawPremiumShopBay(shop, 1002, 150, {
      accent: 0x6f675f,
      accentDark: 0x474441,
      glass: 0x557582
    });
    drawPremiumShopBay(shop, 1200, 170, {
      accent: 0x846d58,
      accentDark: 0x55483d,
      glass: 0x4f727f,
      warm: true
    });
    drawPremiumShopBay(shop, 1665, 188, {
      accent: 0x615c65,
      accentDark: 0x454149,
      glass: 0x597986
    });
    drawPremiumShopBay(shop, 2457, 120, {
      accent: 0x5d685d,
      accentDark: 0x414b43,
      glass: 0x597b79,
      awning: false
    });
    drawPremiumShopBay(shop, 2760, 204, {
      accent: 0x856255,
      accentDark: 0x55443e,
      glass: 0x577786
    });

    // DER INDER — warm sandstone frame / canopy, preserving the actual store.
    shop.fillStyle(0xb49772, 1);
    shop.fillRect(1414, 262, 8, 67);
    shop.fillRect(1636, 262, 8, 67);
    shop.fillStyle(0xd2bd96, 1);
    shop.fillRect(1414, 261, 230, 5);
    drawAwning(shop, 1430, 271, 198, 0xb25c3a, 0x713828);
    shop.fillStyle(C.brassLight, 1);
    [1452, 1607].forEach((x) => shop.fillCircle(x, 291, 4.2));

    // ORELL FÜSSLI — clean cream stone + red canopy + display reflections.
    shop.fillStyle(0xcfc7b8, 1);
    shop.fillRect(1884, 260, 7, 69);
    shop.fillRect(2159, 260, 7, 69);
    shop.fillStyle(0xe2dbcd, 1);
    shop.fillRect(1884, 258, 282, 5);
    drawAwning(shop, 1900, 273, 248, 0x9e2229, 0x6e1c22);
    shop.fillStyle(C.glassLight, 0.18);
    shop.fillTriangle(1912, 294, 1934, 294, 1912, 322);
    shop.fillTriangle(2094, 294, 2116, 294, 2094, 322);

    // Shoe shop — deliberately modern but no longer a floating dark block.
    shop.fillStyle(0x4a4b50, 1);
    shop.fillRect(2168, 259, 7, 70);
    shop.fillRect(2435, 259, 7, 70);
    shop.fillStyle(0x696970, 1);
    shop.fillRect(2168, 257, 274, 5);
    drawAwning(shop, 2184, 273, 242, 0x8e3f73, 0x4d2944);
    shop.fillStyle(0xd979b0, 0.28);
    shop.fillRect(2195, 292, 215, 3);

    // Very subtle warm window lights give the street a finished lived-in look.
    const glows = scene.add.graphics().setDepth(1.15);
    [1070, 1265, 1730, 1810, 2508, 2825, 2910].forEach((x, i) => {
      glows.fillStyle(i % 2 ? 0xf0cd87 : 0xe7b975, 0.16);
      glows.fillEllipse(x, 302, 46, 18);
    });

    scene.__z81BahnhofFacadeFinal = [upper, shop, glows];
  }

  function drawLamp(g, x, groundY, h = 116) {
    // Correct street-furniture scale relative to Simon (~118 px tall display).
    g.fillStyle(0x424a4d, 0.35);
    g.fillEllipse(x + 3, groundY + 1, 20, 5);
    g.fillStyle(C.metal, 1);
    g.fillRect(x - 3, groundY - h, 6, h);
    g.fillStyle(0x41494c, 1);
    g.fillRoundedRect(x - 7, groundY - h - 5, 14, 10, 3);
    g.fillStyle(0xe7dfc0, 1);
    g.fillCircle(x + 11, groundY - h + 1, 8);
    g.lineStyle(3, C.metal, 1);
    g.lineBetween(x, groundY - h, x + 12, groundY - h);
  }

  function drawBike(g, x, y, scale = 1.15) {
    const r = 11 * scale;
    const dx = 15 * scale;
    g.lineStyle(Math.max(2, 2.2 * scale), 0x394245, 1);
    g.strokeCircle(x - dx, y, r);
    g.strokeCircle(x + dx, y, r);
    g.lineBetween(x - dx, y, x, y - 18 * scale);
    g.lineBetween(x, y - 18 * scale, x + dx, y);
    g.lineBetween(x - dx, y, x + 6 * scale, y);
    g.lineBetween(x, y - 18 * scale, x + 9 * scale, y - 21 * scale);
    g.lineBetween(x + 9 * scale, y - 21 * scale, x + 14 * scale, y - 21 * scale);
    g.lineBetween(x - 3 * scale, y - 19 * scale, x - 10 * scale, y - 23 * scale);
  }

  function drawBench(g, x, groundY, scale = 1) {
    const w = 88 * scale;
    const h = 31 * scale;
    g.fillStyle(0x3c4243, 0.28);
    g.fillEllipse(x, groundY + 1, w + 18, 7);
    g.fillStyle(0x805c42, 1);
    g.fillRoundedRect(x - w / 2, groundY - h, w, 9 * scale, 3);
    g.fillRoundedRect(x - w / 2, groundY - h - 16 * scale, w, 7 * scale, 3);
    g.fillStyle(0x4b5050, 1);
    g.fillRect(x - w * 0.34, groundY - h + 8 * scale, 5 * scale, 23 * scale);
    g.fillRect(x + w * 0.30, groundY - h + 8 * scale, 5 * scale, 23 * scale);
    g.lineStyle(3, 0x4b5050, 1);
    g.lineBetween(x - w * 0.34, groundY - h - 8 * scale, x - w * 0.34, groundY - h + 8 * scale);
    g.lineBetween(x + w * 0.34, groundY - h - 8 * scale, x + w * 0.34, groundY - h + 8 * scale);
  }

  function drawPlanter(g, x, groundY, scale = 1) {
    const w = 36 * scale;
    g.fillStyle(0x353a3b, 0.25);
    g.fillEllipse(x, groundY + 1, w + 12, 6);
    g.fillStyle(0x777166, 1);
    g.fillRoundedRect(x - w / 2, groundY - 22 * scale, w, 22 * scale, 4);
    g.fillStyle(0x8b8376, 1);
    g.fillRect(x - w / 2 + 3, groundY - 19 * scale, w - 6, 3);
    g.fillStyle(C.greenDark, 1);
    g.fillCircle(x, groundY - 34 * scale, 15 * scale);
    g.fillStyle(C.green, 1);
    g.fillCircle(x - 12 * scale, groundY - 29 * scale, 12 * scale);
    g.fillCircle(x + 12 * scale, groundY - 29 * scale, 12 * scale);
    g.fillStyle(C.greenLight, 0.86);
    g.fillCircle(x, groundY - 43 * scale, 9 * scale);
  }

  function addBahnhofScaledProps(scene) {
    if (scene.__z81BahnhofProps) return;

    const props = scene.add.graphics().setDepth(6.4);

    // Less clutter than v67: each object gets enough visual space and a scale
    // that reads correctly next to Simon.
    [1162, 1740, 2504, 2874].forEach((x) => drawLamp(props, x, 327, 116));

    drawBench(props, 1295, 327, 1.0);
    drawBench(props, 2638, 327, 1.03);

    drawBike(props, 1788, 316, 1.16);
    drawBike(props, 2805, 316, 1.12);

    drawPlanter(props, 1215, 327, 1.08);
    drawPlanter(props, 1840, 327, 1.0);
    drawPlanter(props, 2548, 327, 1.08);

    scene.__z81BahnhofProps = props;
  }

  function addBahnhofFineDetails(scene) {
    if (scene.__z81BahnhofFine) return;

    const g = scene.add.graphics().setDepth(2.2);

    // Brass tree guards / curb insets, sparse enough to avoid visual noise.
    [1270, 1745, 2490, 2860].forEach((x) => {
      g.lineStyle(2, 0x656b69, 0.9);
      g.strokeRect(x - 23, 311, 46, 16);
      g.lineBetween(x - 20, 318, x + 20, 318);
    });

    // A few tasteful pavement drain lines and shop thresholds.
    g.fillStyle(0x6e706d, 0.48);
    [1110, 1375, 1860, 2420, 2710].forEach((x) => {
      g.fillRect(x, 326, 38, 2);
    });

    scene.__z81BahnhofFine = g;
  }

  function hideOldMiniPropLayer(createdGraphics, scene) {
    if (!Array.isArray(createdGraphics) || scene.__z81OldPropsHidden) return;

    const depthSix = createdGraphics.filter((object) =>
      object?.type === "Graphics" &&
      Math.abs((Number(object.depth) || 0) - 6) < 0.15 &&
      object?.active !== false
    );

    // v67 creates stop graphics and ticket graphics earlier, but the street
    // furniture graphics is the LAST depth≈6 Graphics before the world build
    // returns. Hide only that last candidate; never touch hitboxes or modals.
    const candidate = depthSix.at(-1);
    if (candidate && depthSix.length >= 2) {
      candidate.setVisible?.(false);
      candidate.setAlpha?.(0);
      candidate.__z81HiddenMiniProps = true;
      scene.__z81OldPropsHidden = candidate;
    }
  }

  function addBahnhofFinal(scene) {
    if (!scene?.sys?.isActive?.() || scene.__z81BahnhofFinal) return false;

    addBahnhofAlps(scene);
    addBahnhofFacadeFinal(scene);
    addBahnhofScaledProps(scene);
    addBahnhofFineDetails(scene);
    attachParallaxUpdate(scene);
    syncParallax(scene);

    scene.__z81BahnhofFinal = true;
    return true;
  }

  function patchBahnhofPrototype() {
    const proto = window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene?.prototype;
    if (!proto) return false;

    if (
      typeof proto.createBahnhofquaiWorld === "function" &&
      !proto.createBahnhofquaiWorld.__z81Final
    ) {
      const previousWorld = proto.createBahnhofquaiWorld;

      const wrappedWorld = function createBahnhofquaiWorldV81(...args) {
        const addManager = this.add;
        const rawGraphics = addManager?.graphics;
        const createdGraphics = [];

        if (typeof rawGraphics === "function") {
          addManager.graphics = function trackedGraphicsV81(...gArgs) {
            const object = rawGraphics.apply(addManager, gArgs);
            createdGraphics.push(object);
            return object;
          };
        }

        let result;
        try {
          result = previousWorld.apply(this, args);
        } finally {
          if (typeof rawGraphics === "function") {
            addManager.graphics = rawGraphics;
          }
        }

        hideOldMiniPropLayer(createdGraphics, this);
        addBahnhofFinal(this);
        return result;
      };

      wrappedWorld.__z81Final = true;
      wrappedWorld.__previousV81 = previousWorld;
      proto.createBahnhofquaiWorld = wrappedWorld;
    }

    if (typeof proto.update === "function" && !proto.update.__z81Parallax) {
      const previousUpdate = proto.update;
      const wrappedUpdate = function updateBahnhofV81(...args) {
        const result = previousUpdate.apply(this, args);
        syncParallax(this);
        return result;
      };
      wrappedUpdate.__z81Parallax = true;
      proto.update = wrappedUpdate;
    }

    return true;
  }

  // ======================================================================
  // BÜRKLIPLATZ — seamless Zürich sky + prop scale normalization
  // ======================================================================

  function sceneLooksLikeBurkli(scene) {
    if (!scene) return false;

    const candidates = [
      scene.sys?.settings?.key,
      scene.scene?.key,
      scene.currentStationKey,
      scene.locationKey,
      scene.areaKey,
      scene.name
    ].map(normalizeText);

    if (candidates.some((value) => value.includes("burkli"))) return true;

    const list = scene.children?.list;
    if (!Array.isArray(list)) return false;

    return list.some((child) => {
      const text = normalizeText(child?.text);
      return text.includes("burkliplatz") || text.includes("burkli platz");
    });
  }

  function scaleNamedProps(scene) {
    if (!scene || scene.__z81NamedPropsScaled) return 0;

    const pattern = /(bench|bank|bush|busch|bike|fahrrad|velo|lamp|laterne|trash|bin|mull|muell|müll|planter|pflanz|prop)/i;
    const seen = new Set();
    let count = 0;

    const scaleObject = (object, label) => {
      if (!object || typeof object !== "object" || seen.has(object)) return;
      seen.add(object);

      const descriptor = `${label || ""} ${object.name || ""}`;
      if (!pattern.test(descriptor)) return;
      if (object.__z81PropScaled) return;

      if (typeof object.setScale === "function") {
        const sx = Number(object.scaleX) || 1;
        const sy = Number(object.scaleY) || 1;
        const factor = /bike|fahrrad|velo/i.test(descriptor) ? 1.30 : 1.24;
        object.setScale(sx * factor, sy * factor);
        object.__z81PropScaled = true;
        count += 1;
      }
    };

    Object.entries(scene).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => scaleObject(item, key));
      else scaleObject(value, key);
    });

    scene.children?.list?.forEach((child) => scaleObject(child, child?.name || ""));
    scene.__z81NamedPropsScaled = true;
    return count;
  }

  function addBurkliSharedSky(scene) {
    if (scene.__z81BurkliSky) return;

    const width = sceneWorldWidth(scene, 1800);
    const groundTop = sceneGroundTop(scene);
    const skyBottom = Math.min(286, groundTop - 45);

    // Deliberately in FRONT of typical old sky layers (-60..-30) but still
    // behind architecture (-10..0). This masks the former colour seam.
    const sky = trackParallax(
      scene,
      scene.add.graphics().setDepth(-27),
      0.10
    );
    sky.fillStyle(C.skyTop, 1);
    sky.fillRect(-900, 0, width + 2100, 92);
    sky.fillStyle(C.skyMid, 1);
    sky.fillRect(-900, 92, width + 2100, 112);
    sky.fillStyle(C.skyLow, 1);
    sky.fillRect(-900, 204, width + 2100, Math.max(40, skyBottom - 204));

    const clouds = trackParallax(
      scene,
      scene.add.graphics().setDepth(-26.2),
      0.16
    );
    const cloud = (x, y, s) => {
      clouds.fillStyle(0xeaf5ef, 0.86);
      clouds.fillRect(x, y, 64 * s, 11 * s);
      clouds.fillRect(x + 13 * s, y - 10 * s, 43 * s, 12 * s);
      clouds.fillRect(x + 28 * s, y - 18 * s, 24 * s, 9 * s);
      clouds.fillStyle(0xcfe4df, 0.44);
      clouds.fillRect(x + 8 * s, y + 11 * s, 49 * s, 3 * s);
    };
    cloud(140, 73, 0.78);
    cloud(width * 0.49, 98, 0.58);
    cloud(width * 0.83, 66, 0.86);

    const alps = trackParallax(
      scene,
      scene.add.graphics().setDepth(-24.8),
      0.27
    );
    alps.fillStyle(C.alpsFar, 0.94);
    alps.beginPath();
    alps.moveTo(-700, 252);

    const peaks = [];
    const step = Math.max(190, width / 8);
    for (let i = -2; i <= 11; i += 1) {
      const x = i * step;
      const y = 184 - ((i * 37 + 17) % 54);
      peaks.push([x, y]);
      alps.lineTo(x, y);
      alps.lineTo(x + step * 0.55, 224 - ((i * 13) % 18));
    }
    alps.lineTo(width + 900, 258);
    alps.lineTo(-700, 258);
    alps.closePath();
    alps.fillPath();

    alps.fillStyle(C.alpsSnow, 0.72);
    peaks.filter((_, i) => i % 2 === 1).forEach(([x, y]) => {
      alps.fillTriangle(x - 31, y + 22, x, y, x + 31, y + 22);
    });

    const hills = trackParallax(
      scene,
      scene.add.graphics().setDepth(-23.2),
      0.40
    );
    hills.fillStyle(C.hills, 0.91);
    hills.beginPath();
    hills.moveTo(-700, 272);
    for (let i = -2; i <= 12; i += 1) {
      const x = i * (width / 9 || 190);
      const y = 238 - ((i * 19 + 9) % 26);
      hills.lineTo(x, y);
    }
    hills.lineTo(width + 900, 278);
    hills.lineTo(-700, 278);
    hills.closePath();
    hills.fillPath();

    scene.cameras?.main?.setBackgroundColor?.("#69b5d7");
    scene.__z81BurkliSky = [sky, clouds, alps, hills];
  }

  function addBurkliScaledProps(scene) {
    if (scene.__z81BurkliProps) return;

    const width = sceneWorldWidth(scene, 1500);
    const groundTop = sceneGroundTop(scene);
    const g = scene.add.graphics().setDepth(6.2);

    // Sparse waterfront/city furniture. These are deliberately full-size and
    // placed away from extreme edges where doors/transitions usually sit.
    drawBench(g, width * 0.22, groundTop - 7, 1.03);
    drawBench(g, width * 0.72, groundTop - 7, 1.00);
    drawLamp(g, width * 0.46, groundTop - 7, 112);
    drawBike(g, width * 0.60, groundTop - 17, 1.12);
    drawPlanter(g, width * 0.33, groundTop - 7, 1.06);
    drawPlanter(g, width * 0.82, groundTop - 7, 1.10);

    scene.__z81BurkliProps = g;
  }

  function applyBurkliFinal(scene) {
    if (!scene?.sys?.isActive?.() || scene.__z81BurkliFinal) return false;
    if (!sceneLooksLikeBurkli(scene)) return false;

    addBurkliSharedSky(scene);
    scaleNamedProps(scene);
    addBurkliScaledProps(scene);
    attachParallaxUpdate(scene);
    syncParallax(scene);

    scene.__z81BurkliFinal = true;
    return true;
  }

  function patchBurkliPrototype(scene) {
    if (!scene) return false;

    const key = normalizeText(scene.sys?.settings?.key);
    if (!key.includes("burkli")) return false;

    const proto = scene.constructor?.prototype;
    if (!proto || typeof proto.create !== "function" || proto.create.__z81Burkli) {
      return Boolean(proto);
    }

    const previousCreate = proto.create;
    const wrappedCreate = function createBurkliV81(...args) {
      const result = previousCreate.apply(this, args);
      applyBurkliFinal(this);
      return result;
    };
    wrappedCreate.__z81Burkli = true;
    proto.create = wrappedCreate;
    return true;
  }

  function scanBurkliScenes() {
    const game = getGame();
    const scenes = game?.scene?.keys;
    if (!scenes) return;

    Object.values(scenes).forEach((scene) => {
      patchBurkliPrototype(scene);
      if (scene?.sys?.isActive?.()) applyBurkliFinal(scene);
    });
  }

  // ======================================================================
  // Install / maintenance
  // ======================================================================

  function install() {
    patchBahnhofPrototype();

    const bahnhof = getScene(BAHNHOF_KEY);
    if (bahnhof?.sys?.isActive?.()) addBahnhofFinal(bahnhof);

    scanBurkliScenes();
  }

  install();
  const timer = window.setInterval(install, 300);

  window.SimonBugfixV81 = Object.freeze({
    VERSION,
    install,
    status() {
      const game = getGame();
      const scenes = Object.values(game?.scene?.keys || {});
      return {
        version: VERSION,
        bahnhofFinal: Boolean(getScene(BAHNHOF_KEY)?.__z81BahnhofFinal),
        burkliScenes: scenes
          .filter((scene) => sceneLooksLikeBurkli(scene))
          .map((scene) => ({
            key: scene.sys?.settings?.key || "unknown",
            active: Boolean(scene.sys?.isActive?.()),
            final: Boolean(scene.__z81BurkliFinal)
          }))
      };
    },
    stopMaintenance() {
      window.clearInterval(timer);
    }
  });

  console.info(
    "Bugfix v81: Bahnhofstrasse final art + seamless Bürkliplatz Zürich palette + full-scale props."
  );
})();
