(() => {
  "use strict";

  if (window.__SIMON_CLEAN_SCENE_FIX_V74__) return;
  window.__SIMON_CLEAN_SCENE_FIX_V74__ = true;

  const VERSION = 74;
  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const FIRST_INPUT_GUARD_MS = 120;

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

  function safeDestroy(object) {
    try {
      object?.destroy?.();
    } catch {}
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  // =========================================================================
  // 1) AMSIF: return to the original procedural placeholder.
  // =========================================================================

  function makeInvisibleSentinel(sprite) {
    if (!sprite || sprite.__v74Disabled) return sprite;

    try { sprite.stop?.(); } catch {}
    try { sprite.visible = false; } catch {}
    try { sprite.alpha = 0; } catch {}

    // npc-sprites-v69 keeps synchronising its detached visual. Replacing only
    // setVisible/setAlpha makes that old synchroniser harmless without touching
    // Amsif's real tween, hitbox or story state.
    sprite.setVisible = function setVisibleV74() {
      this.visible = false;
      return this;
    };

    sprite.setAlpha = function setAlphaV74() {
      this.alpha = 0;
      return this;
    };

    sprite.__v74Disabled = true;
    return sprite;
  }

  function restoreProceduralGraphics(container) {
    container?.list?.forEach?.((child) => {
      if (child?.type === "Graphics") {
        child.setVisible?.(true);
        if (Number.isFinite(child.alpha)) {
          child.setAlpha?.(1);
        }
      }
    });
  }

  function disableAmsifReplacement(scene) {
    const amsif = scene?.amsif;
    if (!amsif?.active) return;

    if (amsif.__npcSpriteV69) {
      makeInvisibleSentinel(amsif.__npcSpriteV69);
    }

    // Defensive cleanup if an older browser cache created a v71 visual once.
    if (amsif.__npcSpriteV71) {
      makeInvisibleSentinel(amsif.__npcSpriteV71);
    }

    restoreProceduralGraphics(amsif);
    amsif.__v74UsesPlaceholder = true;
  }

  function patchAmsifFactory() {
    const SceneClass = window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;
    const proto = SceneClass?.prototype;

    if (
      !proto ||
      typeof proto.createAmsif !== "function" ||
      proto.createAmsif.__v74Amsif
    ) {
      return false;
    }

    const original = proto.createAmsif;

    const wrapped = function createAmsifPlaceholderV74(...args) {
      const amsif = original.apply(this, args);
      disableAmsifReplacement(this);
      return amsif;
    };

    wrapped.__v74Amsif = true;
    proto.createAmsif = wrapped;
    return true;
  }

  // =========================================================================
  // 2) ENRIQUE: sprite belongs INSIDE the Zofingia container.
  // =========================================================================

  function ensureEnriqueTexture(scene) {
    if (!scene?.textures || scene.textures.exists("enrique-master-v69")) {
      return true;
    }

    if (scene.__v74EnriqueLoading || scene.load?.isLoading?.()) {
      return false;
    }

    scene.__v74EnriqueLoading = true;

    try {
      scene.load.spritesheet(
        "enrique-master-v69",
        "enrique-master-v62.png",
        {
          frameWidth: 240,
          frameHeight: 280
        }
      );

      scene.load.once("complete", () => {
        scene.__v74EnriqueLoading = false;
        ensureEnriqueAnimations(scene);
      });

      scene.load.once("loaderror", () => {
        scene.__v74EnriqueLoading = false;
      });

      scene.load.start();
    } catch (error) {
      scene.__v74EnriqueLoading = false;
      console.warn("v74 Enrique texture load:", error);
    }

    return false;
  }

  function makeAnimation(scene, key, frames, fps, repeat) {
    if (!scene?.anims || !scene.textures?.exists?.("enrique-master-v69")) {
      return;
    }

    if (scene.anims.exists(key)) return;

    scene.anims.create({
      key,
      frames: frames.map((frame) => ({
        key: "enrique-master-v69",
        frame
      })),
      frameRate: fps,
      repeat
    });
  }

  function ensureEnriqueAnimations(scene) {
    makeAnimation(scene, "enrique-idle-v74", [0,1,2,3], 2.4, -1);
    makeAnimation(scene, "enrique-explain-v74", [4,5,6,7], 3.2, -1);
    makeAnimation(scene, "enrique-second-look-v74", [8,9,10,11], 3.0, -1);
  }

  function hideDetachedEnrique(enrique) {
    if (enrique?.__npcSpriteV69) {
      makeInvisibleSentinel(enrique.__npcSpriteV69);
    }
    if (enrique?.__npcSpriteV71) {
      makeInvisibleSentinel(enrique.__npcSpriteV71);
    }
  }

  function installEnriqueChild(scene, enrique) {
    if (
      !scene?.__sv37ZofingiaOpen ||
      !enrique?.active ||
      !ensureEnriqueTexture(scene)
    ) {
      return null;
    }

    ensureEnriqueAnimations(scene);
    hideDetachedEnrique(enrique);

    // Hide only Enrique's procedural body. Keep the existing ENRIQUE label,
    // interaction size and container tween untouched.
    enrique.list?.forEach?.((child) => {
      if (child?.type === "Graphics") {
        child.setVisible?.(false);
      }
    });

    let sprite = enrique.__v74EnriqueSprite;

    if (!sprite?.active) {
      sprite = scene.add.sprite(
        0,
        31,
        "enrique-master-v69",
        0
      )
        .setOrigin(0.5, 1)
        .setScale(0.43);

      // Enrique is itself a child of the Zofingia overlay. The sprite MUST be
      // a child of Enrique, otherwise coordinates 505/315 are interpreted as
      // Bahnhofstrasse world coordinates and the figure disappears.
      try {
        enrique.addAt(sprite, 0);
      } catch {
        enrique.add(sprite);
      }

      enrique.__v74EnriqueSprite = sprite;
      sprite.play?.("enrique-idle-v74", true);
    }

    return sprite;
  }

  function syncEnrique(scene) {
    const enrique = scene?.__sv37Enrique;

    if (!scene?.__sv37ZofingiaOpen || !enrique?.active) {
      return;
    }

    const sprite = installEnriqueChild(scene, enrique);
    if (!sprite?.active) return;

    const simon = scene.__sv37ClubSimon;

    // Sheet faces right. Simon normally approaches Enrique from the left.
    sprite.setFlipX?.(
      Boolean(simon?.active && simon.x < enrique.x)
    );

    const modal = scene.__sv37EnriqueModal;
    let key = "enrique-idle-v74";

    if (modal?.__flirtSequenceV46 && !scene.enriqueSpoken) {
      key = "enrique-second-look-v74";
    } else if (modal) {
      key = "enrique-explain-v74";
    }

    if (sprite.anims?.currentAnim?.key !== key) {
      sprite.play?.(key, true);
    }
  }

  // =========================================================================
  // 3) Click-through protection: ONLY the opening tap, ~120ms.
  // =========================================================================

  function guardFreshNode(node) {
    if (!(node instanceof HTMLElement) || node.dataset.v74TapGuard === "1") {
      return;
    }

    node.dataset.v74TapGuard = "1";
    const readyAt = performance.now() + FIRST_INPUT_GUARD_MS;

    const guard = (event) => {
      if (performance.now() >= readyAt) return;
      stopEvent(event);
    };

    node.addEventListener("pointerup", guard, true);
    node.addEventListener("click", guard, true);
  }

  function scanForFreshDialogueNodes(root) {
    if (!(root instanceof Element)) return;

    const selectors = [
      '[data-simon-ui="hive-sequence-v46"]',
      '[data-simon-ui="enrique-v46-sequence"]',
      '[data-enrique-v46="true"]'
    ];

    selectors.forEach((selector) => {
      if (root.matches?.(selector)) {
        guardFreshNode(root);
      }

      root.querySelectorAll?.(selector).forEach(guardFreshNode);
    });
  }

  function installDialogueObserver() {
    const gameRoot = document.getElementById("phaser-game");
    if (!gameRoot || gameRoot.__v74DialogueObserver) return;

    gameRoot.__v74DialogueObserver = true;
    scanForFreshDialogueNodes(gameRoot);

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            scanForFreshDialogueNodes(node);
          }
        });
      });
    });

    observer.observe(gameRoot, {
      childList: true,
      subtree: true
    });
  }

  // =========================================================================
  // 4) Polybahn entrance: simple street-level entrance. No river, no fake gap.
  // =========================================================================

  function destroyOldPolybahnEntry(scene) {
    const entry = scene?.__ethCampusEntryV59;
    if (!entry || entry.__v74Entry) return;

    [
      entry.street,
      entry.facades,
      entry.station,
      entry.sign,
      entry.centralLabel,
      entry.zone,
      entry.marker,
      entry.actionLabel
    ].forEach(safeDestroy);

    scene.__ethCampusEntryV59 = null;
  }

  function createSimplePolybahnEntry(scene) {
    if (!scene?.add || scene.__ethCampusEntryV59?.__v74Entry) return;

    destroyOldPolybahnEntry(scene);

    // Compact street-level access immediately next to the ticket/locker area.
    // No perspective road and no river: the player reads it as a small entrance
    // leading off Bahnhofstrasse, while the actual journey is the transit scene.
    const x = 1115;
    const bottom = GROUND_TOP;

    const station = scene.add.container(0, 0).setDepth(7);
    const g = scene.add.graphics();

    g.fillStyle(0xb6aa99, 1);
    g.fillRoundedRect(x - 39, 215, 78, 123, 5);

    g.fillStyle(0x918676, 1);
    g.fillRect(x - 43, 208, 86, 10);

    g.fillStyle(0xb52f31, 1);
    g.fillRoundedRect(x - 34, 230, 68, 23, 4);

    // Open dark doorway, not another full building facade.
    g.fillStyle(0x263c43, 1);
    g.fillRoundedRect(x - 25, 267, 50, 71, 8);

    g.fillStyle(0x172b32, 1);
    g.fillRoundedRect(x - 18, 274, 36, 64, 7);

    g.lineStyle(3, 0xd9cfbd, 1);
    g.strokeRoundedRect(x - 25, 267, 50, 71, 8);

    station.add(g);

    const sign = scene.add.text(
      x,
      241,
      "POLYBAHN",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff0d0",
        stroke: "#682024",
        strokeThickness: 2
      }
    )
      .setOrigin(0.5)
      .setDepth(9);

    const zone = scene.add.zone(
      x,
      294,
      88,
      90
    )
      .setDepth(286)
      .setInteractive({ useHandCursor: true });

    const actionLabel = scene.add.text(
      x,
      277,
      "POLYBAHN ↑",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff0c9",
        backgroundColor: "#853031",
        padding: { x: 6, y: 4 }
      }
    )
      .setOrigin(0.5)
      .setDepth(287)
      .setInteractive({ useHandCursor: true });

    const enter = (pointer) => {
      stopEvent(pointer?.event);
      window.SimonETHV59?.enter?.();
    };

    zone.on("pointerdown", enter);
    actionLabel.on("pointerdown", enter);

    scene.__ethCampusEntryV59 = {
      x,
      street: null,
      station,
      sign,
      zone,
      actionLabel,
      marker: null,
      __v74Entry: true
    };

    scene.events?.once?.("shutdown", () => {
      [station, sign, zone, actionLabel, scene.__ethCampusEntryV59?.marker]
        .forEach(safeDestroy);

      if (scene.__ethCampusEntryV59?.__v74Entry) {
        scene.__ethCampusEntryV59 = null;
      }
    });
  }

  // =========================================================================
  // 5) Polybahn transit: complete visual replacement.
  // =========================================================================

  function patchPolybahnTransitPrototype() {
    const game = getGame();
    const transit = game?.scene?.keys?.PolybahnTransitScene;
    const proto = transit?.constructor?.prototype;

    if (
      !proto ||
      typeof proto.createTransitVisuals !== "function" ||
      proto.createTransitVisuals.__v74Transit
    ) {
      return false;
    }

    const replacement = function createTransitVisualsV74() {
      this.cameras.main.setBackgroundColor("#91b4c1");

      const bg = this.add.graphics().setDepth(-30);

      // Sky only occupies the genuinely open upper part of the view.
      bg.fillStyle(0x8eb5c4, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      bg.fillStyle(0xa5c3cc, 1);
      bg.fillRect(0, 80, GAME_WIDTH, 62);

      // Distant Zurich ridge.
      bg.fillStyle(0x70877d, 0.72);
      bg.fillTriangle(-40, 208, 165, 118, 390, 208);
      bg.fillTriangle(250, 208, 520, 132, 790, 208);

      // The important fix: one continuous hillside beneath the railway.
      // Track runs lower-left -> upper-right, and the slope fills everything
      // BELOW it, so there is never a bright-blue void underneath the cabin.
      bg.fillStyle(0x87927b, 1);
      bg.beginPath();
      bg.moveTo(0, 390);
      bg.lineTo(0, 338);
      bg.lineTo(116, 338);
      bg.lineTo(706, 54);
      bg.lineTo(820, 54);
      bg.lineTo(820, 390);
      bg.closePath();
      bg.fillPath();

      // Warm stone terraces/retaining walls make the slope read as Central,
      // not as a random green mountain.
      bg.fillStyle(0x9e9588, 1);
      bg.beginPath();
      bg.moveTo(95, 390);
      bg.lineTo(95, 351);
      bg.lineTo(696, 61);
      bg.lineTo(726, 61);
      bg.lineTo(726, 390);
      bg.closePath();
      bg.fillPath();

      bg.fillStyle(0xb3aa9c, 1);
      for (let i = 0; i < 9; i += 1) {
        const x = 120 + i * 67;
        const y = 352 - i * 32;
        bg.fillRect(x, y, 94, 9);
      }

      // Lower street / Central foreground.
      bg.fillStyle(0x696b69, 1);
      bg.fillRect(0, 348, 185, 42);
      bg.fillStyle(0xbeb7ab, 1);
      bg.fillRect(0, 337, 185, 13);

      // Background houses are physically anchored to stepped terraces.
      const houses = this.add.container(0, 0).setDepth(-12);
      const hg = this.add.graphics();
      const colors = [0xc2b39f, 0xb4a691, 0xd0c1aa, 0xa99989];

      const houseData = [
        [14, 250, 82, 88],
        [98, 218, 82, 90],
        [205, 196, 76, 83],
        [302, 164, 78, 82],
        [402, 132, 76, 79],
        [501, 100, 72, 75],
        [594, 73, 68, 69]
      ];

      houseData.forEach(([x, y, w, h], index) => {
        hg.fillStyle(colors[index % colors.length], 1);
        hg.fillRect(x, y, w, h);

        hg.fillStyle(0x4a5c61, 1);
        for (let wy = y + 18; wy < y + h - 13; wy += 28) {
          hg.fillRect(x + 13, wy, 12, 17);
          if (w > 65) hg.fillRect(x + 46, wy, 12, 17);
        }

        hg.fillStyle(0x765f4c, 1);
        hg.fillTriangle(x - 2, y, x + w / 2, y - 12, x + w + 2, y);
      });

      houses.add(hg);
      this.__transitHousesV56 = houses;

      // Dedicated stone rail bed.
      const railBed = this.add.graphics().setDepth(0);
      railBed.lineStyle(24, 0x7e776d, 1);
      railBed.lineBetween(145, 336, 680, 78);

      railBed.lineStyle(15, 0xa8a094, 1);
      railBed.lineBetween(145, 336, 680, 78);

      // Rails.
      railBed.lineStyle(3, 0xd7ccba, 1);
      railBed.lineBetween(136, 340, 671, 82);
      railBed.lineBetween(154, 333, 689, 75);

      for (let t = 0.02; t < 0.98; t += 0.055) {
        const x = Phaser.Math.Linear(145, 680, t);
        const y = Phaser.Math.Linear(336, 78, t);
        railBed.lineStyle(3, 0x4b4945, 1);
        railBed.lineBetween(x - 15, y + 5, x + 15, y - 5);
      }

      // Red Polybahn carriage; same coordinates as original startTransit(), so
      // mechanics and timing remain untouched.
      const cabin = this.add.container(0, 0).setDepth(35);
      const cg = this.add.graphics();

      cg.fillStyle(0xb72f31, 1);
      cg.fillRoundedRect(-52, -41, 104, 78, 8);
      cg.lineStyle(4, 0xf1dfc5, 1);
      cg.strokeRoundedRect(-52, -41, 104, 78, 8);

      cg.fillStyle(0x29464f, 1);
      cg.fillRect(-40, -30, 29, 31);
      cg.fillRect(11, -30, 29, 31);

      cg.fillStyle(0xe7d9bf, 1);
      cg.fillRect(-4, -34, 8, 64);

      cg.fillStyle(0x3c3b3a, 1);
      cg.fillCircle(-30, 40, 9);
      cg.fillCircle(30, 40, 9);

      cabin.add(cg);

      if (this.textures.exists("simon")) {
        const simon = this.add.sprite(0, 10, "simon", 0)
          .setScale(0.18)
          .setOrigin(0.5, 1);
        cabin.add(simon);
      }

      const up = this.direction === "up";
      cabin.setPosition(
        up ? 145 : 680,
        up ? 318 : 60
      );

      this.__transitCabinV56 = cabin;

      this.add.text(
        GAME_WIDTH / 2,
        27,
        up
          ? "POLYBAHN · POLYTERRASSE"
          : "POLYBAHN · BAHNHOFSTRASSE",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#fff1d1",
          stroke: "#373c3e",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(60);
    };

    replacement.__v74Transit = true;
    proto.createTransitVisuals = replacement;
    return true;
  }

  // =========================================================================
  // 6) Polyterrasse: keep original v59/v67 paving, add ONLY a foot-level seam.
  // =========================================================================

  function reinforceTerraceFeetGround(scene) {
    if (!scene?.sys?.isActive?.() || !scene.add || scene.__v74FootGround) return;

    const width = Number(scene.physics?.world?.bounds?.width) || 1720;
    const g = scene.add.graphics().setDepth(-4);

    // Only the bottom 20 px below the player's feet. No rectangle through the
    // torso, no replacement sky, no fake elevated floor.
    g.fillStyle(0xaaa49a, 0.52);
    g.fillRect(0, 318, width, 20);

    g.lineStyle(1, 0x8e8982, 0.52);
    g.lineBetween(0, 321, width, 321);

    for (let x = 0; x < width; x += 74) {
      g.lineBetween(x, 321, x, 338);
    }

    scene.__v74FootGround = g;
  }

  // =========================================================================
  // 7) Keep the two useful v72 features without its global input blocker.
  // =========================================================================

  function allowUnlimitedEinsteinQuestions(scene) {
    if (!scene?.sys?.isActive?.()) return;

    if (
      scene.__einsteinAskedThisVisit &&
      !scene.__ethDialogueActive &&
      !scene.__ethQuizModal &&
      !scene.__einsteinInteractionBusy
    ) {
      scene.__einsteinAskedThisVisit = false;
      scene.__einsteinPrompt?.setText?.("KLICK · NO E FRAG");
    }
  }

  function replaceCashierNoteWithImage() {
    const overlay = document.querySelector(
      '#phaser-game [data-simon-ui="cashier-note-v54"]'
    );

    if (!overlay || overlay.dataset.v74Note === "1") return;

    const paper = overlay.firstElementChild;
    if (!paper) return;

    const oldNote = Array.from(paper.children).find((child) =>
      child.textContent?.includes?.("sympathisch") ||
      child.textContent?.includes?.("Kaffee") ||
      child.textContent?.includes?.("Kafi")
    );

    if (!oldNote) return;

    const image = document.createElement("img");
    image.src = "coffee-plan-note-v72.png?v=74";
    image.alt = "Simons Zettel";

    Object.assign(image.style, {
      display: "block",
      width: "min(100%, 500px)",
      margin: "0 auto",
      filter: "drop-shadow(0 3px 0 rgba(40,22,5,.18))"
    });

    oldNote.replaceWith(image);
    overlay.dataset.v74Note = "1";
  }

  // =========================================================================
  // Main synchroniser.
  // =========================================================================

  function sync() {
    patchAmsifFactory();
    patchPolybahnTransitPrototype();
    installDialogueObserver();

    const bahnhof = getScene("BahnhofquaiScene");

    if (bahnhof?.sys?.isActive?.()) {
      disableAmsifReplacement(bahnhof);
      syncEnrique(bahnhof);
      createSimplePolybahnEntry(bahnhof);
    }

    reinforceTerraceFeetGround(
      getScene("PolyterrasseScene")
    );

    allowUnlimitedEinsteinQuestions(
      getScene("ETHInteriorScene")
    );

    replaceCashierNoteWithImage();
  }

  sync();
  window.setInterval(sync, 100);

  window.SimonCleanSceneFixV74 = Object.freeze({
    VERSION,
    status() {
      const bahnhof = getScene("BahnhofquaiScene");
      const enrique = bahnhof?.__sv37Enrique;

      return {
        version: VERSION,
        amsifPlaceholder: Boolean(
          bahnhof?.amsif?.__v74UsesPlaceholder
        ),
        enriqueVisible: Boolean(
          enrique?.__v74EnriqueSprite?.active &&
          enrique.__v74EnriqueSprite.visible !== false
        ),
        polybahnEntry: Boolean(
          bahnhof?.__ethCampusEntryV59?.__v74Entry
        ),
        transitPatched: Boolean(
          getGame()?.scene?.keys?.PolybahnTransitScene
            ?.constructor?.prototype?.createTransitVisuals?.__v74Transit
        ),
        terraceFootGround: Boolean(
          getScene("PolyterrasseScene")?.__v74FootGround
        ),
        einsteinReadyAgain:
          getScene("ETHInteriorScene")?.__einsteinAskedThisVisit === false
      };
    }
  });

  console.info(
    "v74: clean Polyterrasse/Polybahn + Amsif placeholder + Enrique container sprite + 120ms dialog debounce."
  );
})();
