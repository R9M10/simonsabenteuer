(() => {
  "use strict";

  if (window.__SIMON_ESTHI_STORY_V52__) return;
  window.__SIMON_ESTHI_STORY_V52__ = true;

  const VERSION = 52;

  const WORLD = Object.freeze({
    groundTop: 338,

    // Keep the v50 improvement: HIVE sits close enough to Milchbuck station.
    hiveOriginalX: 1575,
    hiveTargetX: 1030,

    // New neutral city stretch between HIVE and the later Esthi area.
    bufferLeft: 1325,
    bufferRight: 1810,

    // Invisible story gate. The park itself begins well after the gate.
    shoeGateX: 1695,

    parkLeft: 1855,
    parkRight: 2415,
    parkTriggerLeft: 1910,
    parkTriggerRight: 2375,

    benchX: 2125,

    sparLeft: 2460,
    sparTop: 134,
    sparWidth: 280,
    sparDoorX: 2582
  });

  const HIVE_SHIFT = WORLD.hiveTargetX - WORLD.hiveOriginalX;

  const state =
    window.__SIMON_ESTHI_STATE_V52__ ||
    window.__SIMON_ESTHI_STATE_V50__ || {
      introStarted: false,
      introCompleted: false,
      firstKissUnlocked: false,
      gatePromptShown: false
    };

  if (typeof state.gatePromptShown !== "boolean") {
    state.gatePromptShown = false;
  }

  window.__SIMON_ESTHI_STATE_V52__ = state;
  // Compatibility for any older helper that still reads the v50 key.
  window.__SIMON_ESTHI_STATE_V50__ = state;

  const runtime = {
    activeScene: null,
    overlay: null,
    bubble: null,
    powder: null,
    sequenceToken: 0
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function isMilchbuck(scene) {
    return scene?.sys?.settings?.key === "MilchbuckScene";
  }

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getMilchbuck(game) {
    try {
      return game?.scene?.getScene?.("MilchbuckScene") || null;
    } catch {
      return null;
    }
  }

  function destroyBubble() {
    runtime.bubble?.destroy?.(true);
    runtime.bubble = null;
  }

  function destroyPowder() {
    runtime.powder?.destroy?.(true);
    runtime.powder = null;
  }

  function removeOverlay() {
    runtime.overlay?.remove?.();
    runtime.overlay = null;
  }

  function cleanupStoryVisuals() {
    removeOverlay();
    destroyBubble();
    destroyPowder();
  }

  function safeWorldInteraction(scene) {
    return Boolean(
      scene &&
      scene.player?.active &&
      !scene.uiLocked &&
      !scene.playerDying &&
      !scene.tramTransitActive &&
      !scene.bouncerDialogueActive &&
      !scene.fightActive &&
      !scene.lionExitActive &&
      !scene.lionCombatActive &&
      !scene.danceOverlay &&
      !scene.ticketModal &&
      !scene.itemsModal &&
      !scene.itemInfoModal &&
      !scene.inVoid &&
      !scene.rewindActive
    );
  }

  function setStoryLock(scene, locked) {
    if (!scene) return;

    scene.__esthiStoryActive = Boolean(locked);
    scene.touchLeft = false;
    scene.touchRight = false;
    scene.touchJumpRequested = false;
    scene.touchShootRequested = false;

    if (scene.player?.active) {
      scene.player.setVelocity?.(0, 0);
    }

    if (locked) {
      scene.setUILocked?.(true);
      scene.uiLocked = true;
      return;
    }

    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();

    if (!scene.uiLocked) {
      scene.setControlsVisible?.(true);
      scene.ensureTicketMachineInteractive?.();
      scene.ensureTramBoardingInteractive?.();
    }
  }

  function showUnlock(scene) {
    const text = "ERINNERUNG FREIGESCHALTET\nDER ERSTE KUSS";

    if (typeof scene?.showTopTextNotice === "function") {
      scene.showTopTextNotice(text, {
        duration: 3800,
        key: "esthi-first-kiss-v52"
      });
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const notice = document.createElement("div");
    notice.dataset.simonUi = "esthi-memory-v52";
    notice.textContent = text;

    Object.assign(notice.style, {
      position: "absolute",
      top: "44px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "490000",
      maxWidth: "80%",
      padding: "11px 15px",
      border: "3px solid #e0bf75",
      background: "rgba(37,28,22,.96)",
      color: "#fff0c5",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none"
    });

    root.appendChild(notice);
    window.setTimeout(() => notice.remove(), 3800);
  }

  // ---------------------------------------------------------------------------
  // HIVE relocation
  //
  // Do not duplicate/rewrite the HIVE. Run the current game's own
  // createHiveClub(), then move only the display objects it just created.
  // Bouncer/story/input state therefore stays the existing implementation.
  // ---------------------------------------------------------------------------

  function patchHiveLocation() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;

    if (!SceneClass?.prototype) return;

    const proto = SceneClass.prototype;

    if (
      typeof proto.createHiveClub !== "function" ||
      proto.createHiveClub.__esthiHiveLocationV52
    ) {
      return;
    }

    const original = proto.createHiveClub;

    const wrapped = function createHiveClubV52(...args) {
      if (!isMilchbuck(this)) {
        return original.apply(this, args);
      }

      const before = new Set(this.children?.list || []);
      const result = original.apply(this, args);

      const after = this.children?.list || [];

      after.forEach((object) => {
        if (!object || before.has(object)) return;
        if (object.parentContainer) return;

        // Graphics use absolute draw coordinates, so moving their object x
        // shifts the whole current HIVE artwork without rewriting it.
        object.x = (Number(object.x) || 0) + HIVE_SHIFT;
      });

      this.__esthiHiveShiftV52 = HIVE_SHIFT;
      return result;
    };

    wrapped.__esthiHiveLocationV52 = true;
    proto.createHiveClub = wrapped;
  }

  // ---------------------------------------------------------------------------
  // Park + SPAR
  // ---------------------------------------------------------------------------

  function drawTree(scene, x, baseY, scale = 1) {
    const tree = scene.add.container(x, baseY)
      .setDepth(-0.7);

    const g = scene.add.graphics();

    g.fillStyle(0x554430, 1);
    g.fillRect(-7 * scale, -62 * scale, 14 * scale, 64 * scale);

    g.fillStyle(0x315f48, 1);
    g.fillCircle(-17 * scale, -69 * scale, 25 * scale);
    g.fillCircle(14 * scale, -76 * scale, 29 * scale);
    g.fillCircle(3 * scale, -100 * scale, 25 * scale);

    g.fillStyle(0x47795a, 0.9);
    g.fillCircle(-26 * scale, -84 * scale, 12 * scale);
    g.fillCircle(28 * scale, -91 * scale, 13 * scale);

    tree.add(g);
    return tree;
  }

  function createBench(scene) {
    const bench = scene.add.container(WORLD.benchX, 294)
      .setDepth(4);

    const g = scene.add.graphics();

    g.fillStyle(0x765036, 1);
    g.fillRoundedRect(-72, -40, 144, 12, 3);
    g.fillRoundedRect(-68, -23, 136, 12, 3);

    g.fillStyle(0x44352a, 1);
    g.fillRect(-59, -11, 7, 37);
    g.fillRect(52, -11, 7, 37);

    g.lineStyle(3, 0x4a392b, 1);
    g.lineBetween(-61, -26, -61, -52);
    g.lineBetween(61, -26, 61, -52);

    bench.add(g);
    return bench;
  }

  function buildBufferStreet(scene) {
    const g = scene.add.graphics().setDepth(-0.9);
    const left = WORLD.bufferLeft;
    const right = WORLD.bufferRight;

    // Continuous Zürich sidewalk, curb and darker street edge.
    g.fillStyle(0x9b9891, 1);
    g.fillRect(left, 287, right - left, 51);

    g.fillStyle(0xc0bbb0, 1);
    g.fillRect(left, 287, right - left, 8);

    g.fillStyle(0x666765, 1);
    g.fillRect(left, 322, right - left, 16);

    // Pavement joints make this feel like actual street rather than empty space.
    g.lineStyle(1, 0x817f79, 0.72);
    for (let x = left + 14; x < right; x += 42) {
      g.lineBetween(x, 294, x, 321);
    }
    g.lineBetween(left, 307, right, 307);

    // Quiet apartment façades: deliberately no interaction or quest content.
    const facades = [
      { x: left + 10, w: 112, top: 146, c: 0xb0a18f },
      { x: left + 126, w: 126, top: 130, c: 0xc0b39e },
      { x: left + 256, w: 102, top: 155, c: 0x9f9386 },
      { x: left + 362, w: 112, top: 139, c: 0xb9aa96 }
    ];

    facades.forEach(({ x, w, top, c }, index) => {
      g.fillStyle(c, 1);
      g.fillRect(x, top, w, 147);

      g.fillStyle(index % 2 ? 0x56504a : 0x4e5960, 1);
      for (let wx = x + 17; wx < x + w - 13; wx += 33) {
        g.fillRect(wx, top + 28, 16, 25);
        g.fillRect(wx, top + 72, 16, 25);
      }

      g.fillStyle(0x55504b, 1);
      g.fillTriangle(x - 3, top, x + w / 2, top - 24, x + w + 3, top);
    });

    // Street lamps and bikes as Zürich texture.
    [1435, 1605, 1760].forEach((x) => {
      g.fillStyle(0x414747, 1);
      g.fillRect(x - 2, 218, 4, 69);
      g.fillStyle(0xe9dca7, 0.9);
      g.fillCircle(x, 216, 7);
    });

    const bike = scene.add.graphics().setDepth(2);
    bike.lineStyle(2, 0x3f4548, 1);
    [1515, 1546].forEach((x) => {
      bike.strokeCircle(x, 303, 10);
    });
    bike.lineBetween(1515, 303, 1530, 288);
    bike.lineBetween(1530, 288, 1546, 303);
    bike.lineBetween(1515, 303, 1537, 303);
    bike.lineBetween(1530, 288, 1538, 280);

    scene.__esthiBufferStreetV52 = { g, bike };
  }

  function buildParkAndSpar(scene) {
    const grass = scene.add.graphics().setDepth(-0.8);

    grass.fillStyle(0x678b60, 1);
    grass.fillRect(
      WORLD.parkLeft,
      186,
      WORLD.parkRight - WORLD.parkLeft,
      112
    );

    grass.fillStyle(0x52734f, 1);
    grass.fillRect(
      WORLD.parkLeft,
      258,
      WORLD.parkRight - WORLD.parkLeft,
      40
    );

    // Gravel park path running behind the street.
    grass.fillStyle(0xb7aa8f, 1);
    grass.fillRoundedRect(
      WORLD.parkLeft + 38,
      272,
      WORLD.parkRight - WORLD.parkLeft - 76,
      26,
      8
    );

    // Shrub line.
    grass.fillStyle(0x3c6c4b, 1);
    for (let x = WORLD.parkLeft + 20; x < WORLD.parkRight; x += 42) {
      grass.fillCircle(x, 262, 17);
      grass.fillCircle(x + 15, 260, 14);
    }

    [
      [1905, 292, 0.88],
      [1990, 294, 1.02],
      [2305, 294, 1.0],
      [2380, 294, 0.84]
    ].forEach(([x, y, scale]) => {
      drawTree(scene, x, y, scale);
    });

    createBench(scene);

    // SPAR façade.
    const left = WORLD.sparLeft;
    const top = WORLD.sparTop;
    const width = WORLD.sparWidth;

    const shop = scene.add.container(0, 0).setDepth(-0.65);
    const g = scene.add.graphics();

    g.fillStyle(0xd8d3c5, 1);
    g.fillRoundedRect(left, top, width, WORLD.groundTop - top, 4);

    g.fillStyle(0xb94a3a, 1);
    g.fillRect(left, top + 38, width, 34);

    g.fillStyle(0xf4efe4, 1);
    g.fillRoundedRect(left + 20, top + 45, 87, 23, 4);

    const sparText = scene.add.text(
      left + 64,
      top + 57,
      "SPAR",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#28734b"
      }
    )
      .setOrigin(0.5)
      .setDepth(-0.6);

    // Large windows.
    g.fillStyle(0x456776, 1);
    g.fillRect(left + 22, top + 90, 79, 91);
    g.fillRect(left + width - 101, top + 90, 79, 91);

    g.lineStyle(4, 0xe5dfcf, 1);
    g.strokeRect(left + 22, top + 90, 79, 91);
    g.strokeRect(left + width - 101, top + 90, 79, 91);

    // Entrance.
    g.fillStyle(0x294551, 1);
    g.fillRoundedRect(
      WORLD.sparDoorX - 31,
      top + 84,
      62,
      WORLD.groundTop - (top + 84),
      3
    );

    g.lineStyle(3, 0xc9d6d5, 1);
    g.strokeRoundedRect(
      WORLD.sparDoorX - 31,
      top + 84,
      62,
      WORLD.groundTop - (top + 84),
      3
    );

    g.lineBetween(
      WORLD.sparDoorX,
      top + 86,
      WORLD.sparDoorX,
      WORLD.groundTop - 3
    );

    // Small detergent window display hint.
    g.fillStyle(0x6ba3c5, 1);
    g.fillRoundedRect(left + 43, top + 136, 22, 36, 5);
    g.fillStyle(0xf1f4eb, 1);
    g.fillRect(left + 47, top + 143, 14, 9);

    shop.add(g);

    scene.__esthiParkGraphicsV52 = {
      grass,
      shop,
      sparText
    };
  }

  // ---------------------------------------------------------------------------
  // Esthi
  // ---------------------------------------------------------------------------

  function createEsthi(scene, x, groundY) {
    const esthi = scene.add.container(x, groundY)
      .setDepth(13)
      .setVisible(false);

    const body = scene.add.graphics();

    // White sneakers.
    body.fillStyle(0xf2f0e9, 1);
    body.fillRoundedRect(-18, -5, 16, 6, 3);
    body.fillRoundedRect(2, -5, 16, 6, 3);

    // Trousers.
    body.fillStyle(0x28313d, 1);
    body.fillRect(-16, -38, 12, 35);
    body.fillRect(4, -38, 12, 35);

    // Cream jacket + powder-blue top.
    body.fillStyle(0xd7c9ad, 1);
    body.fillRoundedRect(-24, -77, 48, 43, 8);
    body.fillStyle(0xa8c9d7, 1);
    body.fillRoundedRect(-11, -72, 22, 33, 4);

    // Hands.
    body.fillStyle(0xd4a17d, 1);
    body.fillCircle(-28, -51, 5);
    body.fillCircle(28, -51, 5);

    // Face.
    body.fillStyle(0xd7a581, 1);
    body.fillCircle(0, -96, 18);

    // Dark straight hair.
    body.fillStyle(0x211d20, 1);
    body.fillRoundedRect(-20, -116, 40, 29, 12);
    body.fillRect(-20, -103, 8, 31);
    body.fillRect(12, -103, 8, 31);

    // Eyes / smile.
    body.fillStyle(0x2b2728, 1);
    body.fillRect(-8, -97, 3, 3);
    body.fillRect(5, -97, 3, 3);
    body.lineStyle(2, 0x8a4d4d, 1);
    body.lineBetween(-4, -88, 4, -87);

    esthi.add(body);

    const props = scene.add.container(0, -48)
      .setVisible(false);

    const propG = scene.add.graphics();

    // Detergent bottle.
    propG.fillStyle(0x78a8c7, 1);
    propG.fillRoundedRect(18, -1, 18, 31, 5);
    propG.fillStyle(0xe9f1ec, 1);
    propG.fillRect(21, 6, 12, 9);
    propG.fillStyle(0x547991, 1);
    propG.fillRect(22, -6, 10, 7);

    // Small snack bag.
    propG.fillStyle(0xf1e4c8, 1);
    propG.fillRoundedRect(-37, 4, 25, 28, 4);
    propG.fillStyle(0xffffff, 0.88);
    propG.fillCircle(-29, 12, 4);
    propG.fillCircle(-21, 19, 4);
    propG.fillCircle(-30, 25, 4);

    props.add(propG);
    esthi.add(props);

    const name = scene.add.text(
      0,
      -134,
      "ESTHI",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff0cf",
        stroke: "#3a2927",
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setVisible(false);

    esthi.add(name);

    esthi.__esthiProps = props;
    esthi.__esthiName = name;

    scene.__esthiV52 = esthi;
    return esthi;
  }

  function setEsthiProps(esthi, visible) {
    esthi?.__esthiProps?.setVisible?.(Boolean(visible));
  }

  function showEsthiPermanently(scene, groundY = null) {
    const esthi = scene.__esthiV52;
    if (!esthi) return;

    const y =
      Number.isFinite(groundY)
        ? groundY
        : (Number(scene.__esthiGroundYV52) || 294);

    esthi
      .setVisible(true)
      .setAlpha(1)
      .setAngle(0)
      .setScale(1)
      .setPosition(WORLD.benchX + 92, y);

    setEsthiProps(esthi, false);
    esthi.__esthiName?.setVisible?.(true);
  }

  // ---------------------------------------------------------------------------
  // Story bubbles
  // ---------------------------------------------------------------------------

  function actorPoint(scene, actorName) {
    if (actorName === "esthi") {
      const esthi = scene.__esthiV52;
      return {
        x: esthi?.x || scene.player.x,
        y: (esthi?.y || scene.player.y) - 124
      };
    }

    const player = scene.player;
    return {
      x: player?.x || 0,
      y: (player?.y || 0) - 122
    };
  }

  function showStoryBubble(scene, actorName, text, thought = false) {
    destroyBubble();

    const point = actorPoint(scene, actorName);

    runtime.bubble = scene.createSpeechBubble?.(
      point.x,
      point.y,
      text,
      0
    );

    if (!runtime.bubble) {
      runtime.bubble = scene.add.text(
        point.x,
        point.y,
        text,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#2b211a",
          backgroundColor: "#fff7dd",
          padding: { x: 10, y: 8 },
          wordWrap: { width: 270 },
          align: "center"
        }
      )
        .setOrigin(0.5)
        .setDepth(1800);
    }

    runtime.bubble?.setDepth?.(1800);

    if (
      thought &&
      runtime.bubble?.add &&
      scene.add
    ) {
      const c1 = scene.add.circle(
        -7,
        42,
        6,
        0xfff7dd,
        1
      ).setStrokeStyle(2, 0x463a33, 1);

      const c2 = scene.add.circle(
        -15,
        54,
        3.5,
        0xfff7dd,
        1
      ).setStrokeStyle(2, 0x463a33, 1);

      runtime.bubble.add([c1, c2]);
    }
  }

  function makeStoryOverlay(onClick) {
    removeOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "esthi-story-v52";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "499000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent"
    });

    let last = -Infinity;

    const stop = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
    };

    const advance = (event) => {
      stop(event);

      const now = performance.now();
      if (now - last < 300) return;

      last = now;
      onClick?.();
    };

    overlay.addEventListener("pointerdown", stop, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });

    root.appendChild(overlay);
    runtime.overlay = overlay;
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Story movement / effects
  // ---------------------------------------------------------------------------

  function startEsthiWalkBob(scene, esthi) {
    scene.__esthiWalkBobV52?.stop?.();
    scene.__esthiWalkBobV52?.remove?.();

    scene.__esthiWalkBobV52 = scene.tweens.add({
      targets: esthi,
      y: esthi.y - 2,
      angle: { from: -1, to: 1 },
      duration: 170,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  function stopEsthiWalkBob(scene, esthi, targetY) {
    scene.__esthiWalkBobV52?.stop?.();
    scene.__esthiWalkBobV52?.remove?.();
    scene.__esthiWalkBobV52 = null;

    esthi.setAngle(0);
    esthi.y = targetY;
  }

  function tweenActorX(scene, target, x, duration, onComplete) {
    scene.tweens.add({
      targets: target,
      x,
      duration,
      ease: "Linear",
      onComplete
    });
  }

  function walkPair(scene, simonX, esthiX, done) {
    const player = scene.player;
    const esthi = scene.__esthiV52;

    if (!player?.active || !esthi?.active) {
      done?.();
      return;
    }

    const groundY = Number(scene.__esthiGroundYV52) || player.y;

    player.setFlipX(simonX < player.x);
    player.play?.("simon-run", true);

    esthi.setScale(1);
    esthi.setFlipX?.(esthiX < esthi.x);
    startEsthiWalkBob(scene, esthi);

    const distance = Math.max(
      Math.abs(simonX - player.x),
      Math.abs(esthiX - esthi.x)
    );

    const duration = Phaser.Math.Clamp(
      Math.round((distance / 215) * 1000),
      650,
      3100
    );

    let complete = 0;

    const finishOne = () => {
      complete += 1;

      if (complete < 2) return;

      stopEsthiWalkBob(scene, esthi, groundY);
      player.play?.("simon-idle", true);
      player.setFlipX(esthi.x < player.x);
      esthi.setFlipX?.(player.x < esthi.x);
      done?.();
    };

    tweenActorX(scene, player, simonX, duration, finishOne);
    tweenActorX(scene, esthi, esthiX, duration, finishOne);
  }

  function approachSimon(scene, done) {
    const player = scene.player;
    const esthi = scene.__esthiV52;
    const groundY = scene.__esthiGroundYV52;

    esthi
      .setVisible(true)
      .setAlpha(1)
      .setPosition(
        Math.min(WORLD.parkRight - 55, player.x + 205),
        groundY
      );

    esthi.__esthiName?.setVisible?.(false);
    setEsthiProps(esthi, false);

    startEsthiWalkBob(scene, esthi);

    tweenActorX(
      scene,
      esthi,
      player.x + 78,
      760,
      () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        esthi.setFlipX?.(true);
        player.setFlipX(false);
        done?.();
      }
    );
  }

  function enterSpar(scene, done) {
    const esthi = scene.__esthiV52;
    const groundY = scene.__esthiGroundYV52;

    startEsthiWalkBob(scene, esthi);

    scene.tweens.add({
      targets: esthi,
      x: WORLD.sparDoorX,
      alpha: 0,
      duration: 520,
      ease: "Sine.easeIn",
      onComplete: () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        esthi.setVisible(false);
        window.setTimeout(done, 700);
      }
    });
  }

  function leaveSpar(scene, done) {
    const esthi = scene.__esthiV52;
    const groundY = scene.__esthiGroundYV52;

    esthi
      .setPosition(WORLD.sparDoorX, groundY)
      .setVisible(true)
      .setAlpha(0);

    setEsthiProps(esthi, true);
    startEsthiWalkBob(scene, esthi);

    scene.tweens.add({
      targets: esthi,
      x: WORLD.sparDoorX - 54,
      alpha: 1,
      duration: 590,
      ease: "Sine.easeOut",
      onComplete: () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        done?.();
      }
    });
  }

  function sitAtBench(scene, done) {
    const player = scene.player;
    const esthi = scene.__esthiV52;
    const groundY = scene.__esthiGroundYV52;

    player
      .setPosition(WORLD.benchX - 37, groundY + 11)
      .setScale(0.39)
      .setFlipX(false)
      .play?.("simon-idle", true);

    esthi
      .setPosition(WORLD.benchX + 35, groundY + 10)
      .setAngle(0)
      .setScale(0.94)
      .setFlipX?.(true);

    setEsthiProps(esthi, false);

    window.setTimeout(done, 280);
  }

  function createPowder(scene) {
    destroyPowder();

    const player = scene.player;

    const mouth =
      scene.getPlayerMouthAnchor?.(
        player.flipX ? -1 : 1
      ) || {
        x: player.x + 22,
        y: player.y - 34
      };

    const powder = scene.add.container(
      mouth.x,
      mouth.y + 5
    ).setDepth(1900);

    [
      [-7, 0, 3],
      [-1, 4, 3],
      [5, 0, 2.5],
      [8, 6, 2],
      [-8, 7, 2]
    ].forEach(([x, y, r]) => {
      powder.add(
        scene.add.circle(
          x,
          y,
          r,
          0xffffff,
          0.95
        )
      );
    });

    runtime.powder = powder;
  }

  function feedSimon(scene, done) {
    const esthi = scene.__esthiV52;
    const player = scene.player;

    const mouth =
      scene.getPlayerMouthAnchor?.(
        player.flipX ? -1 : 1
      ) || {
        x: player.x + 22,
        y: player.y - 34
      };

    const snack = scene.add.container(
      esthi.x - 16,
      esthi.y - 62
    ).setDepth(1910);

    snack.add(
      scene.add.circle(
        0,
        0,
        8,
        0xf5eee4,
        1
      ).setStrokeStyle(2, 0xd7cbbb, 1)
    );

    snack.add(
      scene.add.circle(
        3,
        -2,
        2,
        0xffffff,
        0.95
      )
    );

    scene.tweens.add({
      targets: snack,
      x: mouth.x,
      y: mouth.y,
      duration: 620,
      ease: "Sine.easeInOut",
      onComplete: () => {
        snack.destroy(true);
        createPowder(scene);
        done?.();
      }
    });
  }

  function kissSimon(scene, done) {
    const esthi = scene.__esthiV52;
    const player = scene.player;

    const originalX = esthi.x;

    scene.tweens.add({
      targets: esthi,
      x: player.x + 25,
      angle: -3,
      duration: 430,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (runtime.powder) {
          scene.tweens.add({
            targets: runtime.powder,
            alpha: 0,
            duration: 240,
            onComplete: destroyPowder
          });
        }

        const heart = scene.add.text(
          player.x + 18,
          player.y - 112,
          "♥",
          {
            fontFamily: "Georgia, serif",
            fontSize: "25px",
            color: "#e85f78"
          }
        )
          .setOrigin(0.5)
          .setDepth(1920);

        scene.tweens.add({
          targets: heart,
          y: heart.y - 22,
          scale: 1.3,
          alpha: 0,
          duration: 720,
          onComplete: () => heart.destroy()
        });

        window.setTimeout(() => {
          scene.tweens.add({
            targets: esthi,
            x: originalX,
            angle: 0,
            duration: 360,
            ease: "Sine.easeOut",
            onComplete: done
          });
        }, 450);
      }
    });
  }

  function finishStory(scene) {
    const player = scene.player;
    const groundY = scene.__esthiGroundYV52;

    cleanupStoryVisuals();

    state.introStarted = false;
    state.introCompleted = true;
    state.firstKissUnlocked = true;

    if (player?.active) {
      player
        .setScale(0.42)
        .setAngle(0)
        .setPosition(WORLD.benchX - 35, groundY)
        .play?.("simon-idle", true);

      if (player.body) {
        player.body.enable = true;
      }
    }

    showEsthiPermanently(scene, groundY);
    showUnlock(scene);
    setStoryLock(scene, false);
  }

  // ---------------------------------------------------------------------------
  // Sequence
  // Every actual line waits for a click. Movement/physical actions progress
  // automatically only after their animation is finished.
  // ---------------------------------------------------------------------------

  function startEsthiStory(scene) {
    if (
      !scene ||
      state.introStarted ||
      state.introCompleted ||
      !safeWorldInteraction(scene)
    ) {
      return;
    }

    const player = scene.player;
    const groundY = player.y;

    state.introStarted = true;
    runtime.activeScene = scene;
    runtime.sequenceToken += 1;

    const token = runtime.sequenceToken;

    scene.__esthiGroundYV52 = groundY;

    setStoryLock(scene, true);

    player.setVelocity?.(0, 0);
    player.play?.("simon-idle", true);

    if (player.body) {
      player.body.enable = false;
    }

    const steps = [
      {
        type: "action",
        run: (next) => approachSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Excuse me... du weisst vielleicht, wo kaufen Waschmittel?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Waschmittel?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Ja. Für Kleider. Meine Kleider... Problem."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Äh ja. Da vorne isch grad de SPAR."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Du zeigen?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Ja klar."
      },

      {
        type: "action",
        run: (next) => {
          walkPair(
            scene,
            WORLD.sparDoorX - 105,
            WORLD.sparDoorX - 55,
            next
          );
        }
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Danke! Du wartest eine kleine Moment?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Wieso?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Ich kaufe dir etwas."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Du muesch mir nüt chaufe."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Warten."
      },

      {
        type: "action",
        run: (next) => enterSpar(scene, next)
      },

      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Was passiert hier eigentlich?"
      },

      {
        type: "action",
        run: (next) => leaveSpar(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Waschmittel. Und koreanische Süssigkeit."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Okay. Jetzt Park."
      },

      {
        type: "action",
        run: (next) => {
          walkPair(
            scene,
            WORLD.benchX - 42,
            WORLD.benchX + 40,
            next
          );
        }
      },

      {
        type: "action",
        run: (next) => sitAtBench(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "In Korea... wir machen so."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was mache?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Freunde füttern sich."
      },
      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Freunde?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Mund auf."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Mund. Auf."
      },

      {
        type: "action",
        run: (next) => feedSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "simon",
        text: "Mmmff."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Oh."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Du hast überall."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Wo?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Warte."
      },

      {
        type: "action",
        run: (next) => kissSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Jetzt sauber."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "..."
      },
      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Was zur Hölle ist gerade passiert?"
      }
    ];

    let index = 0;
    let actionRunning = false;

    const render = () => {
      if (
        token !== runtime.sequenceToken ||
        !scene.sys?.isActive?.()
      ) {
        return;
      }

      destroyBubble();

      const step = steps[index];

      if (!step) {
        finishStory(scene);
        return;
      }

      if (step.type === "action") {
        actionRunning = true;

        step.run(() => {
          if (token !== runtime.sequenceToken) return;

          actionRunning = false;
          index += 1;
          render();
        });

        return;
      }

      showStoryBubble(
        scene,
        step.actor,
        step.text,
        Boolean(step.thought)
      );
    };

    makeStoryOverlay(() => {
      if (actionRunning) return;

      const step = steps[index];
      if (!step || step.type !== "bubble") return;

      index += 1;
      render();
    });

    render();
  }

  // ---------------------------------------------------------------------------
  // Shoe progression gate
  //
  // The current base game does not yet expose a final Fire-Shoes inventory item.
  // Prefer a future explicit shoe flag when it exists; until then the canonical
  // persisted Amsif shoe-story completion is the progression source of truth.
  // ---------------------------------------------------------------------------

  function shoeObjectiveSatisfied(scene) {
    if (!scene) return false;

    if (
      scene.developerMode ||
      scene.__esthiBypassShoeGateV52
    ) {
      return true;
    }

    const explicitShoes = Boolean(
      scene.hasFireShoes ||
      scene.fireShoesOwned ||
      scene.fireShoesUnlocked ||
      scene.inventory?.fireShoes ||
      scene.inventory?.fireShoesOwned
    );

    return explicitShoes || Boolean(scene.amsifStoryCompleted);
  }

  function showShoeGateThought(scene) {
    if (
      !scene ||
      scene.__esthiGatePromptActiveV52 ||
      scene.__esthiStoryActive
    ) {
      return;
    }

    scene.__esthiGatePromptActiveV52 = true;
    setStoryLock(scene, true);

    const text = state.gatePromptShown
      ? "Erst die Schuhe."
      : "Ich sollte erstmal nach den Schuhen schauen.";

    state.gatePromptShown = true;

    showStoryBubble(
      scene,
      "simon",
      text,
      true
    );

    makeStoryOverlay(() => {
      cleanupStoryVisuals();

      if (scene.player?.active) {
        scene.player.x = Math.min(
          scene.player.x,
          WORLD.shoeGateX - 34
        );
        scene.player.setVelocity?.(0, 0);
        scene.player.setFlipX?.(true);
      }

      scene.__esthiGatePromptActiveV52 = false;
      setStoryLock(scene, false);
    });
  }

  function enforceShoeGate(scene) {
    if (
      !isMilchbuck(scene) ||
      state.introCompleted ||
      shoeObjectiveSatisfied(scene) ||
      scene.__esthiStoryActive ||
      scene.__esthiGatePromptActiveV52 ||
      !safeWorldInteraction(scene) ||
      !scene.player?.active
    ) {
      return false;
    }

    if (scene.player.x < WORLD.shoeGateX) {
      return false;
    }

    scene.player.x = WORLD.shoeGateX - 22;
    scene.player.setVelocity?.(0, 0);

    showShoeGateThought(scene);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Scene integration
  // ---------------------------------------------------------------------------

  function buildEsthiWorld(scene) {
    if (!isMilchbuck(scene)) return;

    buildBufferStreet(scene);
    buildParkAndSpar(scene);

    // Use Simon's actual ground position when available.
    const groundY =
      scene.player?.active
        ? scene.player.y
        : 294;

    scene.__esthiGroundYV52 = groundY;

    createEsthi(
      scene,
      WORLD.benchX + 92,
      groundY
    );

    if (state.introCompleted) {
      showEsthiPermanently(scene, groundY);
    }

    scene.events?.once?.("shutdown", () => {
      if (
        scene.__esthiStoryActive &&
        !state.introCompleted
      ) {
        state.introStarted = false;
      }

      runtime.sequenceToken += 1;
      cleanupStoryVisuals();
      runtime.activeScene = null;
    });
  }

  function shouldTrigger(scene) {
    if (
      !isMilchbuck(scene) ||
      state.introCompleted ||
      state.introStarted ||
      !shoeObjectiveSatisfied(scene) ||
      !safeWorldInteraction(scene)
    ) {
      return false;
    }

    const player = scene.player;
    if (!player?.body) return false;

    const x = player.x;

    const grounded = Boolean(
      player.body.blocked?.down ||
      player.body.touching?.down
    );

    return (
      grounded &&
      x >= WORLD.parkTriggerLeft &&
      x <= WORLD.parkTriggerRight
    );
  }

  function patchMilchbuckLifecycle() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;

    if (!SceneClass?.prototype) return;

    const proto = SceneClass.prototype;

    if (
      typeof proto.create === "function" &&
      !proto.create.__esthiCreateV52
    ) {
      const originalCreate = proto.create;

      const wrappedCreate = function createV52(...args) {
        const result = originalCreate.apply(this, args);

        if (isMilchbuck(this)) {
          buildEsthiWorld(this);
        }

        return result;
      };

      wrappedCreate.__esthiCreateV52 = true;
      proto.create = wrappedCreate;
    }

    if (
      typeof proto.update === "function" &&
      !proto.update.__esthiUpdateV52
    ) {
      const originalUpdate = proto.update;

      const wrappedUpdate = function updateV52(time, delta) {
        const result = originalUpdate.call(this, time, delta);

        if (isMilchbuck(this)) {
          const blockedByShoes = enforceShoeGate(this);

          if (!blockedByShoes && shouldTrigger(this)) {
            startEsthiStory(this);
          }
        }

        return result;
      };

      wrappedUpdate.__esthiUpdateV52 = true;
      proto.update = wrappedUpdate;
    }
  }

  // ---------------------------------------------------------------------------
  // Developer checkpoint
  // ---------------------------------------------------------------------------

  function addDeveloperButton() {
    const list = document.querySelector(
      "#developer-menu-screen .dev-destinations"
    );

    if (!list) return;
    if (list.querySelector("[data-dev-target='esthi-test']")) return;

    const button = document.createElement("button");
    button.className = "dev-action dev-destination";
    button.type = "button";
    button.dataset.devTarget = "esthi-test";

    button.innerHTML =
      '7. MILCHBUCK / ESTHI' +
      '<small>Direkt den ersten Park-/SPAR-/Esthi-Storyablauf testen.</small>';

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      window.launchGame?.({
        startMode: "esthi-test"
      });
    });

    list.appendChild(button);
  }

  function startEsthiDeveloper(game) {
    let attempts = 0;

    const tryStart = () => {
      attempts += 1;

      const scene = getMilchbuck(game);

      if (
        scene?.sys?.isActive?.() &&
        scene.player?.active &&
        scene.__esthiV52
      ) {
        state.introStarted = false;
        state.introCompleted = false;
        state.firstKissUnlocked = false;
        state.gatePromptShown = false;

        scene.developerMode = true;
        scene.__esthiBypassShoeGateV52 = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

        scene.player.setPosition(
          WORLD.parkTriggerLeft + 18,
          scene.player.y
        );

        scene.player.setVelocity?.(0, 0);

        // Let physics settle for one frame before the trigger checks grounded.
        window.setTimeout(() => {
          if (
            scene.sys?.isActive?.() &&
            !state.introStarted
          ) {
            startEsthiStory(scene);
          }
        }, 160);

        return;
      }

      if (attempts < 140) {
        window.setTimeout(tryStart, 90);
      }
    };

    window.setTimeout(tryStart, 240);
  }

  const previousStartSimonGame =
    window.startSimonGame;

  if (
    typeof previousStartSimonGame ===
    "function"
  ) {
    window.startSimonGame =
      function startSimonGameEsthiV50(options = {}) {
        if (options.startMode === "esthi-test") {
          const game = previousStartSimonGame.call(
            this,
            {
              ...options,
              startMode: "normal",
              developerMode: true
            }
          );

          if (game) {
            startEsthiDeveloper(game);
          }

          return game;
        }

        return previousStartSimonGame.call(
          this,
          options
        );
      };
  }

  // Install before the first game scene is created.
  patchHiveLocation();
  patchMilchbuckLifecycle();
  addDeveloperButton();

  window.SimonEsthiV52 = Object.freeze({
    VERSION,
    state,
    WORLD,

    resetStory() {
      state.introStarted = false;
      state.introCompleted = false;
      state.firstKissUnlocked = false;
      state.gatePromptShown = false;
    },

    startNow() {
      const scene = getMilchbuck(getGame());

      if (!scene?.sys?.isActive?.()) {
        return false;
      }

      state.introStarted = false;
      state.introCompleted = false;
      startEsthiStory(scene);
      return true;
    }
  });

  console.info(
    "Esthi Story v52 geladen: größerer Stadtpuffer, Schuh-Gate, Park + SPAR + Esthi."
  );
})();