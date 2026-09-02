(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V80__) return;
  window.__SIMON_BUGFIX_V80__ = true;

  const VERSION = 80;
  const MILCHBUCK_KEY = "MilchbuckScene";
  const HIVE_GIRL_OBSERVATION_TEXT =
    "Mit dere würd ich grad en Joint durezwirble.";
  const GROUND_TOP = 338;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(key = MILCHBUCK_KEY) {
    try {
      return getGame()?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function safeDestroy(object) {
    try {
      object?.destroy?.(true);
    } catch {}
  }

  function safeScale(object, factor = 1.24) {
    if (!object || object.__v80Scaled) return false;

    const canScale =
      typeof object.setScale === "function" ||
      typeof object.setDisplaySize === "function";

    if (!canScale) return false;

    try {
      if (typeof object.setScale === "function") {
        const sx = Number(object.scaleX) || 1;
        const sy = Number(object.scaleY) || 1;
        object.setScale(sx * factor, sy * factor);
      } else if (
        typeof object.setDisplaySize === "function" &&
        Number(object.displayWidth) > 0 &&
        Number(object.displayHeight) > 0
      ) {
        object.setDisplaySize(
          object.displayWidth * factor,
          object.displayHeight * factor
        );
      }

      object.__v80Scaled = true;
      return true;
    } catch {
      return false;
    }
  }

  function pickWorldWidth(scene) {
    return Math.max(
      Number(scene?.physics?.world?.bounds?.width) || 0,
      Number(scene?.cameras?.main?.getBounds?.()?.width) || 0,
      Number(scene?.scale?.width) || 0,
      2600
    );
  }

  function pickGroundTop(scene) {
    const playerY = Number(scene?.player?.y) || 0;

    if (playerY > 190 && playerY < 320) {
      return Math.max(GROUND_TOP, Math.round(playerY + 88));
    }

    return GROUND_TOP;
  }

  function makeLayerGraphics(scene, depth, scrollFactor = 1) {
    const g = scene.add.graphics();
    g.setDepth(depth);
    g.setScrollFactor(scrollFactor);
    return g;
  }

  function addMountainBackdrop(scene) {
    if (scene.__milchbuckMountainsV80) return;

    const width = pickWorldWidth(scene);

    const far = makeLayerGraphics(scene, -45, 0.18);
    far.fillStyle(0x9db6c7, 0.95);
    far.beginPath();
    far.moveTo(-200, 240);
    [
      [0, 204], [220, 146], [430, 212], [640, 120], [900, 222],
      [1170, 150], [1390, 230], [1640, 136], [1920, 220], [2190, 158],
      [2460, 226], [2750, 146], [width + 250, 220], [width + 250, 260],
      [-200, 260]
    ].forEach(([x, y]) => far.lineTo(x, y));
    far.closePath();
    far.fillPath();

    far.fillStyle(0xc4d5de, 0.85);
    [
      [220, 146], [640, 120], [1170, 150], [1640, 136], [2190, 158], [2750, 146]
    ].forEach(([x, y]) => {
      far.fillTriangle(x - 42, y + 25, x, y - 6, x + 44, y + 27);
    });

    const near = makeLayerGraphics(scene, -38, 0.32);
    near.fillStyle(0x6f8aa0, 0.92);
    near.beginPath();
    near.moveTo(-220, 278);
    [
      [0, 250], [170, 214], [355, 246], [560, 190], [770, 252],
      [980, 205], [1225, 262], [1470, 188], [1700, 252], [1970, 196],
      [2235, 264], [2480, 204], [width + 260, 262], [width + 260, 290],
      [-220, 290]
    ].forEach(([x, y]) => near.lineTo(x, y));
    near.closePath();
    near.fillPath();

    near.fillStyle(0x89a4b6, 0.34);
    near.fillEllipse(420, 225, 300, 44);
    near.fillEllipse(1460, 220, 370, 52);
    near.fillEllipse(2340, 230, 320, 46);

    scene.__milchbuckMountainsV80 = [far, near];
  }

  function addTwinTowers(scene, groundTop) {
    if (scene.__milchbuckTwinTowersV80) return;

    const towers = scene.add.container(0, 0)
      .setDepth(-7)
      .setScrollFactor(0.82);

    const g = scene.add.graphics();
    const baseY = groundTop - 16;

    const drawTower = (x, width, height, tintA, tintB) => {
      const top = baseY - height;

      g.fillStyle(tintA, 1);
      g.fillRect(x, top, width, height);
      g.fillStyle(tintB, 1);
      g.fillRect(x - 8, top + 8, 8, height - 8);
      g.fillStyle(0xd4bf96, 1);
      g.fillRect(x + 5, top - 8, width - 10, 8);

      for (let wy = top + 16; wy < top + height - 12; wy += 18) {
        for (let wx = x + 10; wx < x + width - 8; wx += 15) {
          g.fillStyle(((wx + wy) / 3) % 2 > 1 ? 0xe7d79e : 0x607789, 0.95);
          g.fillRect(wx, wy, 8, 10);
        }
      }
    };

    drawTower(1125, 58, 116, 0x748695, 0x586977);
    drawTower(1195, 58, 138, 0x687b89, 0x4f6170);

    g.fillStyle(0x44505b, 0.88);
    g.fillRect(1085, baseY - 20, 215, 22);
    g.fillStyle(0x8fa0aa, 0.22);
    g.fillRect(1085, baseY - 20, 215, 4);

    towers.add(g);
    scene.__milchbuckTwinTowersV80 = towers;
  }

  function addGarageEyecatcher(scene, groundTop) {
    if (scene.__milchbuckGarageV80) return;

    const garage = scene.add.container(0, 0).setDepth(6);
    const g = scene.add.graphics();

    const left = 1405;
    const top = groundTop - 123;
    const width = 250;
    const height = 118;

    g.fillStyle(0x4e4a57, 1);
    g.fillRoundedRect(left, top, width, height, 8);
    g.fillStyle(0x675f70, 1);
    g.fillRect(left + 9, top + 10, width - 18, 10);

    g.fillStyle(0x2e343c, 1);
    g.fillRoundedRect(left + 22, top + 34, 132, 84, 5);
    for (let y = top + 42; y < top + 111; y += 9) {
      g.fillStyle((y / 9) % 2 === 0 ? 0x455261 : 0x3a4652, 1);
      g.fillRect(left + 28, y, 120, 4);
    }

    g.fillStyle(0x293039, 1);
    g.fillRoundedRect(left + 170, top + 46, 56, 72, 5);
    g.fillStyle(0xe3dbb0, 0.18);
    g.fillRect(left + 179, top + 57, 37, 18);

    const text1 = scene.add.text(left + 88, top + 74, "MILCH", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "11px",
      color: "#5df0ff",
      stroke: "#10212b",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(7);

    const text2 = scene.add.text(left + 95, top + 95, "BUCK", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "11px",
      color: "#ff5fbe",
      stroke: "#2b1426",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(7);

    const arrow = scene.add.text(left + 198, top + 25, "HIVE →", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#fff2b4",
      backgroundColor: "#3a2c46",
      padding: { x: 6, y: 4 }
    }).setOrigin(0.5).setDepth(8);

    garage.add([g, text1, text2, arrow]);
    scene.__milchbuckGarageV80 = garage;
  }

  function addStringLights(scene, groundTop) {
    if (scene.__milchbuckLightsV80) return;

    const lights = makeLayerGraphics(scene, 14, 1);
    const bulbs = [];

    lights.lineStyle(3, 0x3d3346, 0.95);
    lights.beginPath();
    lights.moveTo(1238, groundTop - 174);
    lights.quadraticCurveTo(1395, groundTop - 126, 1548, groundTop - 170);
    lights.strokePath();

    lights.beginPath();
    lights.moveTo(1315, groundTop - 160);
    lights.quadraticCurveTo(1492, groundTop - 116, 1668, groundTop - 164);
    lights.strokePath();

    const bulbPositions = [
      [1265, groundTop - 161], [1312, groundTop - 150], [1360, groundTop - 144],
      [1409, groundTop - 143], [1458, groundTop - 147], [1505, groundTop - 154],
      [1551, groundTop - 162], [1342, groundTop - 145], [1390, groundTop - 135],
      [1442, groundTop - 130], [1494, groundTop - 132], [1546, groundTop - 139],
      [1597, groundTop - 149], [1645, groundTop - 160]
    ];

    bulbPositions.forEach(([x, y], index) => {
      const color = [0xffe58a, 0xff7acd, 0x66e7ff, 0xc58aff][index % 4];
      const bulb = scene.add.circle(x, y, 3.5, color, 0.98)
        .setDepth(15)
        .setStrokeStyle(1, 0xfdf6cf, 0.55);
      bulbs.push(bulb);

      scene.tweens.add({
        targets: bulb,
        alpha: { from: 0.38, to: 1 },
        scale: { from: 0.92, to: 1.1 },
        duration: 470 + (index % 4) * 90,
        yoyo: true,
        repeat: -1,
        delay: index * 45
      });
    });

    scene.__milchbuckLightsV80 = { wire: lights, bulbs };
  }

  function addGroundPolish(scene, groundTop) {
    if (scene.__milchbuckGroundPolishV80) return;

    const width = pickWorldWidth(scene);
    const g = makeLayerGraphics(scene, 0.2, 1);

    g.fillStyle(0x6d7076, 1);
    g.fillRect(0, groundTop - 54, width, 26);

    g.fillStyle(0xbdb6aa, 1);
    g.fillRect(0, groundTop - 28, width, 28);

    g.fillStyle(0xd8d2c7, 1);
    g.fillRect(0, groundTop - 31, width, 5);

    g.lineStyle(1, 0x9d988d, 0.7);
    for (let x = 0; x < width; x += 46) {
      g.lineBetween(x, groundTop - 22, x, groundTop - 1);
    }

    g.lineStyle(2, 0xb79f6d, 0.33);
    for (let x = 120; x < width; x += 138) {
      g.lineBetween(x, groundTop - 43, x + 52, groundTop - 43);
    }

    scene.__milchbuckGroundPolishV80 = g;
  }

  function scaleNamedSceneProps(scene) {
    if (!scene || scene.__milchbuckPropScaleV80) return;

    const hints = [
      /lamp/i,
      /laterne/i,
      /trash/i,
      /m[üu]ll/i,
      /bin/i,
      /bench/i,
      /bank/i,
      /prop/i
    ];

    const tryScaleCandidate = (candidate, key = "") => {
      if (!candidate) return;
      const tag = `${key} ${candidate.name || ""}`;
      if (!hints.some((hint) => hint.test(tag))) return;
      safeScale(candidate, 1.28);
    };

    Object.entries(scene).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => tryScaleCandidate(item, key));
        return;
      }
      tryScaleCandidate(value, key);
    });

    if (Array.isArray(scene.children?.list)) {
      scene.children.list.forEach((child) => tryScaleCandidate(child, child?.name || ""));
    }

    scene.__milchbuckPropScaleV80 = true;
  }

  function cleanupMilchbuckPatch(scene) {
    [
      scene.__milchbuckGroundPolishV80,
      ...(scene.__milchbuckMountainsV80 || []),
      scene.__milchbuckTwinTowersV80,
      scene.__milchbuckGarageV80,
      scene.__milchbuckHiveGirlObserverHintV80
    ].forEach(safeDestroy);

    if (scene.__milchbuckLightsV80) {
      safeDestroy(scene.__milchbuckLightsV80.wire);
      (scene.__milchbuckLightsV80.bulbs || []).forEach(safeDestroy);
    }

    scene.__milchbuckGroundPolishV80 = null;
    scene.__milchbuckMountainsV80 = null;
    scene.__milchbuckTwinTowersV80 = null;
    scene.__milchbuckGarageV80 = null;
    scene.__milchbuckLightsV80 = null;
    scene.__milchbuckVisualPatchV80 = false;
  }

  function applyMilchbuckArt(scene) {
    if (!scene?.sys?.isActive?.() || scene.__milchbuckVisualPatchV80) return false;

    const groundTop = pickGroundTop(scene);

    addMountainBackdrop(scene);
    addGroundPolish(scene, groundTop);
    addTwinTowers(scene, groundTop);
    addGarageEyecatcher(scene, groundTop);
    addStringLights(scene, groundTop);
    scaleNamedSceneProps(scene);

    scene.__milchbuckVisualPatchV80 = true;
    scene.events?.once?.("shutdown", () => cleanupMilchbuckPatch(scene));
    return true;
  }

  function applyTextIfJointy(target) {
    if (!target || typeof target.text !== "string") return false;
    if (!/(joint|kiff|rauc|durchzieh|zwirbl|durezieh)/i.test(target.text)) {
      return false;
    }

    try {
      target.setText?.(HIVE_GIRL_OBSERVATION_TEXT);
      if (typeof target.text === "string") {
        target.text = HIVE_GIRL_OBSERVATION_TEXT;
      }
      return true;
    } catch {
      return false;
    }
  }

  function patchPotentialObservationObject(object) {
    if (!object || typeof object !== "object") return false;

    let changed = false;

    [
      "observeText",
      "observationText",
      "lookText",
      "inspectText",
      "watchText",
      "thoughtText",
      "hintText",
      "text"
    ].forEach((key) => {
      if (typeof object[key] === "string" && /(joint|kiff|rauc|durchzieh|zwirbl|durezieh)/i.test(object[key])) {
        object[key] = HIVE_GIRL_OBSERVATION_TEXT;
        changed = true;
      }
    });

    return changed;
  }

  function retouchHiveObservation(scene) {
    if (!scene) return false;

    let changed = false;

    Object.values(scene).forEach((value) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (patchPotentialObservationObject(item)) changed = true;
          if (applyTextIfJointy(item)) changed = true;
        });
        return;
      }

      if (patchPotentialObservationObject(value)) changed = true;
      if (applyTextIfJointy(value)) changed = true;
    });

    if (Array.isArray(scene.children?.list)) {
      scene.children.list.forEach((child) => {
        if (applyTextIfJointy(child)) changed = true;
      });
    }

    const root = document.getElementById("phaser-game");
    root?.querySelectorAll?.("div, button, p, span").forEach((node) => {
      if (typeof node.textContent !== "string") return;
      if (!/(joint|kiff|rauc|durchzieh|zwirbl|durezieh)/i.test(node.textContent)) return;
      node.textContent = HIVE_GIRL_OBSERVATION_TEXT;
      changed = true;
    });

    return changed;
  }

  function wrapObservationLikeMethods() {
    const proto = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene?.prototype;
    if (!proto || proto.__v80ObservationWrapInstalled) return Boolean(proto);

    Object.getOwnPropertyNames(proto).forEach((name) => {
      const original = proto[name];
      if (typeof original !== "function") return;
      if (original.__v80ObservationWrap) return;

      const source = Function.prototype.toString.call(original);
      if (!/(observe|beob|inspect|watch|look|joint|kiff|hive|girl|mädchen|maedchen)/i.test(`${name}\n${source}`)) {
        return;
      }

      const wrapped = function milchbuckObservationV80(...args) {
        const result = original.apply(this, args);

        if (typeof result === "string" && /(joint|kiff|rauc|durchzieh|zwirbl|durezieh)/i.test(result)) {
          return HIVE_GIRL_OBSERVATION_TEXT;
        }

        retouchHiveObservation(this);
        return result;
      };

      wrapped.__v80ObservationWrap = true;
      proto[name] = wrapped;
    });

    proto.__v80ObservationWrapInstalled = true;
    return true;
  }

  function patchMilchbuckCreate() {
    const proto = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene?.prototype;
    if (!proto) return false;

    if (typeof proto.create === "function" && !proto.create.__v80MilchbuckCreate) {
      const originalCreate = proto.create;

      const wrappedCreate = function createMilchbuckV80(...args) {
        const result = originalCreate.apply(this, args);
        applyMilchbuckArt(this);
        retouchHiveObservation(this);
        return result;
      };

      wrappedCreate.__v80MilchbuckCreate = true;
      proto.create = wrappedCreate;
    }

    return true;
  }

  function install() {
    patchMilchbuckCreate();
    wrapObservationLikeMethods();

    const scene = getScene(MILCHBUCK_KEY);
    if (scene?.sys?.isActive?.()) {
      applyMilchbuckArt(scene);
      retouchHiveObservation(scene);
    }
  }

  install();
  const timer = window.setInterval(install, 300);

  window.SimonBugfixV80 = Object.freeze({
    VERSION,
    install,
    getHiveObservationText() {
      return HIVE_GIRL_OBSERVATION_TEXT;
    },
    status() {
      const scene = getScene(MILCHBUCK_KEY);
      return {
        version: VERSION,
        milchbuckActive: Boolean(scene?.sys?.isActive?.()),
        artInstalled: Boolean(scene?.__milchbuckVisualPatchV80),
        observationText: HIVE_GIRL_OBSERVATION_TEXT
      };
    },
    stopMaintenance() {
      window.clearInterval(timer);
    }
  });

  console.info(
    "Bugfix v80: Milchbuck visuals polished with mountains, eyecatcher, and Hive observation text update."
  );
})();
