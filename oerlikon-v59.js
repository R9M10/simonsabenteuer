(() => {
  "use strict";

  if (window.__SIMON_OERLIKON_V59__) return;
  window.__SIMON_OERLIKON_V59__ = true;
  window.__SIMON_OERLIKON_V58__ = true;
  window.__SIMON_OERLIKON_V57__ = true;

  const VERSION = 59;
  const SCENE_KEY = "OerlikonScene";
  const WG_KEY = "WGInteriorScene";
  const ROOM_KEY = "SimonRoomScene";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;
  const WORLD_WIDTH = 3200;

  const POS = Object.freeze({
    salersteig: 300,
    wgDoor: 965,
    parkLeft: 1260,
    parkRight: 2160,
    church: 1690,
    bench: 1830,
    coopLeft: 2250,
    coopDoor: 2395,
    sternen: 2870
  });

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

  function getBaseSceneClass() {
    return window.__SIMON_SCENE_CLASSES__?.MilchbuckScene || null;
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function cloneTravelState(scene) {
    return {
      developerMode: Boolean(scene?.developerMode),
      coins: Number(scene?.coins) || 0,
      hp: Number(scene?.hp) || 100,
      maxHp: Number(scene?.maxHp) || 100,

      hasCityTicket: Boolean(scene?.hasCityTicket),
      hasLongDistanceTicket: Boolean(scene?.hasLongDistanceTicket),
      longDistanceTicketsUnlocked:
        Boolean(scene?.longDistanceTicketsUnlocked),

      inventory: { ...(scene?.inventory || {}) },
      booksOwned: { ...(scene?.booksOwned || {}) },
      booksRead: { ...(scene?.booksRead || {}) },
      abilitiesUnlocked: { ...(scene?.abilitiesUnlocked || {}) },
      activeAbility: scene?.activeAbility || null,
      forItselfCooldownUntil:
        Number(scene?.forItselfCooldownUntil) || 0,

      hotbarItems: Array.isArray(scene?.hotbarItems)
        ? [...scene.hotbarItems]
        : [null, null, null, null, null],
      selectedHotbarIndex:
        Number(scene?.selectedHotbarIndex) || 0,
      sprintExpiresAt:
        Number(scene?.sprintExpiresAt) || 0,

      gandhiStoryEligible:
        Boolean(scene?.gandhiStoryEligible),
      gandhiEncounterFinished:
        Boolean(scene?.gandhiEncounterFinished),
      gandhiDead:
        Boolean(scene?.gandhiDead),
      darkGandhiDefeated:
        Boolean(scene?.darkGandhiDefeated),
      gandhiPassOriginSide:
        scene?.gandhiPassOriginSide || null,
      gandhiPassEnteredZone:
        Boolean(scene?.gandhiPassEnteredZone),
      gandhiPassCompleted:
        Boolean(scene?.gandhiPassCompleted),
      gandhiSticksLooted:
        Boolean(scene?.gandhiSticksLooted),

      enriqueSpoken:
        Boolean(scene?.enriqueSpoken),

      amsifEncounterStarted:
        Boolean(scene?.amsifEncounterStarted),
      amsifIntroCompleted:
        Boolean(scene?.amsifIntroCompleted),
      amsifStoryCompleted:
        Boolean(scene?.amsifStoryCompleted),

      hiveWalletFound:
        Boolean(scene?.hiveWalletFound),
      brouwersCount:
        Number(scene?.brouwersCount) || 0,
      drunkDoseExpiries:
        Array.isArray(scene?.drunkDoseExpiries)
          ? [...scene.drunkDoseExpiries]
          : (
              Array.isArray(window.__SIMON_DRUNK_DOSES__)
                ? [...window.__SIMON_DRUNK_DOSES__]
                : []
            )
    };
  }

  function applyTravelState(scene, data = {}) {
    scene.developerMode = Boolean(data.developerMode);

    scene.coins = scene.developerMode
      ? 999999
      : (Number(data.coins) || 0);

    scene.hp = Number(data.hp) || 100;
    scene.maxHp = Number(data.maxHp) || 100;

    scene.hasCityTicket = Boolean(data.hasCityTicket);
    scene.hasLongDistanceTicket =
      Boolean(data.hasLongDistanceTicket);
    scene.longDistanceTicketsUnlocked =
      Boolean(data.longDistanceTicketsUnlocked);

    scene.inventory = {
      gatorade: Math.max(0, Number(data.inventory?.gatorade) || 0),
      monster: Math.max(0, Number(data.inventory?.monster) || 0),
      camel: Math.max(0, Number(data.inventory?.camel) || 0),
      gandhiSticks: Math.max(0, Number(data.inventory?.gandhiSticks) || 0)
    };

    scene.booksOwned = {
      generalRelativity: Boolean(data.booksOwned?.generalRelativity),
      phaenomenologie: Boolean(data.booksOwned?.phaenomenologie),
      playbook: Boolean(data.booksOwned?.playbook),
      zarathustra: Boolean(data.booksOwned?.zarathustra)
    };

    scene.booksRead = {
      generalRelativity: Boolean(data.booksRead?.generalRelativity),
      phaenomenologie: Boolean(data.booksRead?.phaenomenologie),
      playbook: Boolean(data.booksRead?.playbook),
      zarathustra: Boolean(data.booksRead?.zarathustra)
    };

    scene.abilitiesUnlocked = {
      wormhole: Boolean(data.abilitiesUnlocked?.wormhole),
      eternalReturn: Boolean(data.abilitiesUnlocked?.eternalReturn),
      forItself: Boolean(data.abilitiesUnlocked?.forItself)
    };

    scene.activeAbility =
      typeof data.activeAbility === "string" &&
      scene.abilitiesUnlocked[data.activeAbility]
        ? data.activeAbility
        : null;

    scene.forItselfCooldownUntil =
      Number(data.forItselfCooldownUntil) || 0;

    scene.hotbarItems = Array.isArray(data.hotbarItems)
      ? data.hotbarItems.slice(0, 5)
      : [null, null, null, null, null];

    while (scene.hotbarItems.length < 5) {
      scene.hotbarItems.push(null);
    }

    scene.selectedHotbarIndex =
      Math.max(
        0,
        Math.min(4, Number(data.selectedHotbarIndex) || 0)
      );

    scene.sprintExpiresAt =
      Number(data.sprintExpiresAt) || 0;

    scene.gandhiStoryEligible =
      Boolean(data.gandhiStoryEligible);
    scene.gandhiEncounterFinished =
      Boolean(data.gandhiEncounterFinished);
    scene.gandhiDead =
      Boolean(data.gandhiDead);
    scene.darkGandhiDefeated =
      Boolean(data.darkGandhiDefeated);
    scene.gandhiPassOriginSide =
      data.gandhiPassOriginSide || null;
    scene.gandhiPassEnteredZone =
      Boolean(data.gandhiPassEnteredZone);
    scene.gandhiPassCompleted =
      Boolean(data.gandhiPassCompleted);
    scene.gandhiSticksLooted =
      Boolean(
        data.gandhiSticksLooted ||
        scene.inventory.gandhiSticks > 0
      );

    scene.enriqueSpoken =
      Boolean(data.enriqueSpoken);

    scene.amsifEncounterStarted =
      Boolean(data.amsifEncounterStarted);
    scene.amsifIntroCompleted =
      Boolean(
        data.amsifIntroCompleted ||
        data.amsifStoryCompleted
      );
    scene.amsifStoryCompleted =
      Boolean(data.amsifStoryCompleted);

    scene.hiveWalletFound =
      Boolean(data.hiveWalletFound);
    scene.brouwersCount =
      Number(data.brouwersCount) || 0;
    scene.drunkDoseExpiries =
      Array.isArray(data.drunkDoseExpiries)
        ? [...data.drunkDoseExpiries]
        : [];
  }

  function isOerlikonUnlocked(scene) {
    return Boolean(
      scene?.developerMode ||
      scene?.enriqueSpoken
    );
  }

  function ensureStyles() {
    if (document.getElementById("oerlikon-v57-style")) return;

    const style = document.createElement("style");
    style.id = "oerlikon-v57-style";

    style.textContent = `
      #phaser-game [data-simon-ui="wg-room-select-v57"],
      #phaser-game [data-simon-ui="simon-room-v57"] {
        position: absolute;
        inset: 0;
        z-index: 690000;
        pointer-events: none;
      }

      #phaser-game .v57-room-back {
        position: absolute;
        left: 16px;
        top: 14px;
        z-index: 5;
        pointer-events: auto;
        border: 2px solid #eee2c5;
        background: #28313b;
        color: #fff2d3;
        padding: 8px 10px;
        font: 6px/1.4 "Press Start 2P", monospace;
        cursor: pointer;
      }
    `;

    document.head.appendChild(style);
  }

  // =====================================================================
  // Outdoor Oerlikon
  // =====================================================================

  let BaseScene = getBaseSceneClass();

  class OerlikonScene extends (BaseScene || Phaser.Scene) {
    constructor() {
      super(SCENE_KEY);
      this.__simonInteriorScene = false;
      this.__travelStateV57 = null;
      this.__activeOerlikonStopV57 = "salersteig";
      this.__oerlikonTravelBusyV57 = false;
      this.__oerlikonStopsV57 = [];
      this.__oerlikonTicketZonesV57 = [];
    }

    preload() {
      // Oerlikon is entered only after the base game has loaded Simon.
      // Do NOT inherit MilchbuckScene.preload(), which would queue the same
      // global "simon" texture again during a scene transition.
    }

    init(data = {}) {
      super.init?.({});

      this.__simonInteriorScene = false;
      this.__travelStateV57 = {
        ...data
      };

      applyTravelState(this, data);

      this.currentStationKey = "oerlikon";
      this.travelArrivalFrom = data.arrivalFrom || null;
      this.arrivalFinished = !this.travelArrivalFrom;

      this.tramTransitActive = false;
      this.tramBoardingEnabled = false;
      this.__tramSwitching = false;
      this.__oerlikonTravelBusyV57 = false;
      this.__activeOerlikonStopV57 =
        data.arrivalStop === "sternen"
          ? "sternen"
          : "salersteig";
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);

      this.physics.world.resume();
      this.physics.world.setBounds(
        0,
        0,
        WORLD_WIDTH,
        GAME_HEIGHT
      );

      this.cameras.main.setBounds(
        0,
        0,
        WORLD_WIDTH,
        GAME_HEIGHT
      );

      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.setBackgroundColor("#90bed0");

      this.createOerlikonWorld();

      this.ground = this.add.rectangle(
        WORLD_WIDTH / 2,
        GROUND_TOP + (GAME_HEIGHT - GROUND_TOP) / 2,
        WORLD_WIDTH,
        GAME_HEIGHT - GROUND_TOP,
        0x000000,
        0
      );

      this.physics.add.existing(this.ground, true);

      this.createAnimations?.();
      this.createPlayer?.();
      this.createKeyboardControls?.();
      this.createTouchControls?.();
      this.createHUD?.();
      this.installWormholeInput?.();

      const spawnX =
        this.__activeOerlikonStopV57 === "sternen"
          ? POS.sternen - 120
          : POS.salersteig + 150;

      this.player?.setPosition?.(
        spawnX,
        250
      );

      this.player?.setVelocity?.(0, 0);

      this.createWGEntrance();
      this.createOerlikonStops();

      this.cameras.main.startFollow(
        this.player,
        true,
        0.11,
        0.11
      );
      this.cameras.main.setDeadzone(240, 80);
      this.cameras.main.roundPixels = true;

      if (this.travelArrivalFrom) {
        this.startArrivalAtSalersteig();
      } else {
        this.arrivalFinished = true;
        this.setUILocked?.(false);
        this.setControlsVisible?.(true);
        this.enableTramBoarding();
      }

      this.events.once("shutdown", () => {
        this.cleanupHotbarDOM?.();
        this.cleanupSprintIndicator?.();

        (this.hotbarActionUI?.overlay || this.hotbarActionUI)
          ?.remove?.();

        (this.abilityIndicatorDOM?.overlay || this.abilityIndicatorDOM)
          ?.remove?.();

        this.__oerlikonStopsV57 = [];
        this.__oerlikonTicketZonesV57 = [];
      });
    }

    createOerlikonWorld() {
      const bg = this.add.graphics().setDepth(-30);

      // Sky.
      bg.fillStyle(0x93c1d1, 1);
      bg.fillRect(0, 0, WORLD_WIDTH, 205);

      // Distant Zürich residential rhythm.
      const blocks = [
        [0, 142, 168, 145, 0xbab1a2],
        [174, 128, 148, 159, 0xc7baa4],
        [328, 149, 170, 138, 0xa99f95],
        [505, 136, 180, 151, 0xc5b9a8],
        [695, 151, 132, 136, 0xa9a293],
        [2520, 130, 170, 157, 0xb7aa99],
        [2698, 148, 150, 139, 0xc3b7a3],
        [2854, 132, 162, 155, 0xa89d91],
        [3022, 151, 178, 136, 0xbcae9a]
      ];

      blocks.forEach(([x, top, w, h, color], i) => {
        bg.fillStyle(color, 1);
        bg.fillRect(x, top, w, h);

        bg.fillStyle(0x52646a, 1);
        for (let wx = x + 18; wx < x + w - 13; wx += 36) {
          bg.fillRect(wx, top + 30, 16, 24);
          bg.fillRect(wx, top + 76, 16, 24);
        }

        bg.fillStyle(0x56504a, 1);
        bg.fillTriangle(
          x - 3,
          top,
          x + w / 2,
          top - 18 - (i % 2) * 8,
          x + w + 3,
          top
        );
      });

      // Street / tram track base.
      bg.fillStyle(0x5f6263, 1);
      bg.fillRect(0, 282, WORLD_WIDTH, 31);

      bg.lineStyle(3, 0x404344, 1);
      bg.lineBetween(0, 291, 720, 291);
      bg.lineBetween(0, 304, 720, 304);
      bg.lineBetween(2630, 291, WORLD_WIDTH, 291);
      bg.lineBetween(2630, 304, WORLD_WIDTH, 304);

      // Walkable pavement.
      bg.fillStyle(0xb8b3aa, 1);
      bg.fillRect(0, 313, WORLD_WIDTH, 25);
      bg.fillStyle(0xd0cbc1, 1);
      bg.fillRect(0, 313, WORLD_WIDTH, 6);

      bg.lineStyle(1, 0x8f8a83, 0.72);
      for (let x = 0; x < WORLD_WIDTH; x += 48) {
        bg.lineBetween(x, 319, x, 338);
      }

      this.drawWGHouse();
      this.drawChurchPark();
      this.drawCoop();
    }

    drawWGHouse() {
      const g = this.add.graphics().setDepth(-5);

      const left = 820;
      const top = 92;
      const width = 295;

      // Free interpretation of Simon's WG at the user-specified Oerlikonweg 1.
      g.fillStyle(0xb6a795, 1);
      g.fillRect(left, top, width, 221);

      g.fillStyle(0x6b5143, 1);
      g.fillTriangle(
        left - 9,
        top,
        left + width / 2,
        top - 48,
        left + width + 9,
        top
      );

      g.fillStyle(0x8d7968, 1);
      g.fillRect(left + 129, top - 28, 38, 28);

      for (const y of [top + 48, top + 108]) {
        for (const x of [
          left + 31,
          left + 91,
          left + 184,
          left + 244
        ]) {
          g.fillStyle(0x49616b, 1);
          g.fillRect(x, y, 30, 38);
          g.lineStyle(3, 0xe4d9c6, 1);
          g.strokeRect(x, y, 30, 38);
        }
      }

      // WG door.
      g.fillStyle(0x3e342e, 1);
      g.fillRoundedRect(
        POS.wgDoor - 28,
        226,
        56,
        87,
        5
      );

      g.fillStyle(0x667f75, 1);
      g.fillRect(POS.wgDoor - 18, 239, 36, 30);

      g.fillStyle(0xd6b95f, 1);
      g.fillCircle(POS.wgDoor + 18, 278, 3);

      // Small address plate.
      this.add.text(
        POS.wgDoor,
        214,
        "OERLIKONWEG 1",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#3d3731",
          backgroundColor: "#e2dacb",
          padding: { x: 5, y: 3 }
        }
      )
        .setOrigin(0.5)
        .setDepth(4);
    }

    drawChurchPark() {
      const g = this.add.graphics().setDepth(-8);

      // Park floor begins immediately behind/after the WG.
      g.fillStyle(0x6e9a67, 1);
      g.fillRect(
        POS.parkLeft,
        219,
        POS.parkRight - POS.parkLeft,
        119
      );

      // Small hill: the real church is slightly elevated in a park landscape.
      g.fillStyle(0x7aa36c, 1);
      g.fillEllipse(
        POS.church,
        274,
        600,
        140
      );

      // Curving-looking paths, approximated with broad segments.
      g.lineStyle(18, 0xc4bba7, 1);
      g.lineBetween(
        POS.parkLeft + 20,
        320,
        POS.church - 70,
        282
      );
      g.lineBetween(
        POS.church - 70,
        282,
        POS.parkRight - 30,
        323
      );

      g.lineStyle(4, 0xdad2c1, 0.9);
      g.lineBetween(
        POS.parkLeft + 20,
        320,
        POS.church - 70,
        282
      );
      g.lineBetween(
        POS.church - 70,
        282,
        POS.parkRight - 30,
        323
      );

      // Trees framing the church.
      [
        [1320, 299, 0.95],
        [1415, 293, 1.1],
        [1990, 298, 1.05],
        [2080, 300, 0.9]
      ].forEach(([x, y, scale]) => {
        this.drawParkTree(x, y, scale);
      });

      // Church body.
      const church = this.add.graphics().setDepth(-2);
      const cx = POS.church;

      church.fillStyle(0xaaa193, 1);
      church.fillRect(cx - 142, 137, 284, 139);

      church.fillStyle(0x8c8276, 1);
      church.fillTriangle(
        cx - 154,
        137,
        cx,
        86,
        cx + 154,
        137
      );

      // Central tall tower.
      church.fillStyle(0xb9afa0, 1);
      church.fillRect(cx - 38, 70, 76, 184);

      church.fillStyle(0x6e6257, 1);
      church.fillTriangle(
        cx - 47,
        70,
        cx,
        18,
        cx + 47,
        70
      );

      church.fillStyle(0x454d4f, 1);
      church.fillCircle(cx, 105, 13);
      church.lineStyle(3, 0xdfd5c3, 1);
      church.strokeCircle(cx, 105, 13);

      // Arched windows.
      [-96, -52, 52, 96].forEach((dx) => {
        church.fillStyle(0x3f5962, 1);
        church.fillCircle(cx + dx, 189, 10);
        church.fillRect(cx + dx - 10, 189, 20, 35);
      });

      church.fillStyle(0x403833, 1);
      church.fillCircle(cx, 212, 19);
      church.fillRect(cx - 19, 212, 38, 64);

      // Small cross/spire accent.
      church.lineStyle(3, 0x4b4540, 1);
      church.lineBetween(cx, 16, cx, 4);
      church.lineBetween(cx - 6, 9, cx + 6, 9);

      this.add.text(
        cx,
        52,
        "REF. KIRCHE OERLIKON",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5.5px",
          color: "#fff4dc",
          stroke: "#4b4a45",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(1);

      // Bench used by Esthi story.
      const bench = this.add.graphics().setDepth(5);
      bench.fillStyle(0x6f5139, 1);
      bench.fillRoundedRect(
        POS.bench - 48,
        286,
        96,
        9,
        3
      );
      bench.fillStyle(0x493b31, 1);
      bench.fillRect(POS.bench - 38, 295, 5, 22);
      bench.fillRect(POS.bench + 33, 295, 5, 22);
    }

    drawParkTree(x, baseY, scale = 1) {
      const g = this.add.graphics().setDepth(-1);

      g.fillStyle(0x554331, 1);
      g.fillRect(
        x - 6 * scale,
        baseY - 68 * scale,
        12 * scale,
        70 * scale
      );

      g.fillStyle(0x3e724e, 1);
      g.fillCircle(
        x - 18 * scale,
        baseY - 78 * scale,
        25 * scale
      );
      g.fillCircle(
        x + 13 * scale,
        baseY - 87 * scale,
        28 * scale
      );
      g.fillCircle(
        x,
        baseY - 108 * scale,
        23 * scale
      );

      g.fillStyle(0x56885f, 0.9);
      g.fillCircle(
        x - 28 * scale,
        baseY - 94 * scale,
        11 * scale
      );
    }

    drawCoop() {
      const g = this.add.graphics().setDepth(-4);
      const left = POS.coopLeft;
      const top = 136;
      const width = 310;

      g.fillStyle(0xd9d2c6, 1);
      g.fillRect(left, top, width, 177);

      g.fillStyle(0xb9b0a2, 1);
      g.fillRect(left - 8, top - 8, width + 16, 12);

      // Store windows.
      g.fillStyle(0x46636d, 1);
      g.fillRect(left + 20, top + 65, 92, 102);
      g.fillRect(left + 190, top + 65, 95, 102);

      // Entrance.
      g.fillStyle(0x304951, 1);
      g.fillRoundedRect(
        POS.coopDoor - 35,
        top + 58,
        70,
        119,
        4
      );

      g.lineStyle(3, 0xdce4df, 1);
      g.lineBetween(
        POS.coopDoor,
        top + 61,
        POS.coopDoor,
        top + 175
      );

      this.add.text(
        left + 155,
        top + 35,
        "COOP",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "18px",
          color: "#e24d2d",
          stroke: "#fff4da",
          strokeThickness: 3
        }
      )
        .setOrigin(0.5)
        .setDepth(2);
    }

    createWGEntrance() {
      const zone = this.add.zone(
        POS.wgDoor,
        260,
        92,
        130
      )
        .setDepth(240)
        .setInteractive({ useHandCursor: true });

      const marker =
        this.createPulsingInteractionMarker?.(
          POS.wgDoor,
          288,
          176
        );

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);

        if (!this.canUseWorldInteraction?.(pointer)) return;
        if (!this.arrivalFinished) return;
        if (Math.abs(this.player.x - POS.wgDoor) > 170) return;

        this.enterWG();
      });

      this.__wgDoorZoneV57 = zone;
      this.__wgDoorMarkerV57 = marker;
    }

    enterWG() {
      if (
        this.uiLocked ||
        this.__oerlikonTravelBusyV57 ||
        this.__wgTransitionV59
      ) {
        return;
      }

      const game = getGame() || this.game;

      this.__wgTransitionV59 = true;
      this.player?.setVelocity?.(0, 0);
      this.setUILocked?.(true);

      try {
        // Keep the outdoor scene alive and PAUSED underneath the WG.
        // It is therefore resumed with the exact same world/player state.
        game.scene.pause(SCENE_KEY);
        game.scene.start(WG_KEY, {
          outdoorScene: this
        });

        window.setTimeout(() => {
          this.__wgTransitionV59 = false;
        }, 250);
      } catch (error) {
        console.error("Oerlikon v59: WG konnte nicht geöffnet werden:", error);
        this.__wgTransitionV59 = false;
        this.uiLocked = false;
        this.setUILocked?.(false);
        this.refreshUILock?.();
      }
    }

    resumeFromWG() {
      this.__wgTransitionV59 = false;
      this.__oerlikonTravelBusyV57 = false;
      this.uiLocked = false;
      this.tramTransitActive = false;
      this.__tramSwitching = false;

      // Explicitly restore every system that may have been suspended while
      // an interior scene was active.
      this.physics?.world?.resume?.();

      if (this.input) {
        this.input.enabled = true;
      }

      this.player?.setActive?.(true);
      this.player?.setVisible?.(true);
      this.player?.setAlpha?.(1);
      this.player?.clearTint?.();
      this.player?.setAngle?.(0);
      this.player?.setVelocity?.(0, 0);

      if (this.player?.body) {
        this.player.body.enable = true;
        this.player.body.moves = true;
      }

      this.player?.play?.("simon-idle", true);

      this.cameras.main.resetFX?.();
      this.cameras.main.setAlpha?.(1);
      this.cameras.main.startFollow(
        this.player,
        true,
        0.11,
        0.11
      );
      this.cameras.main.setDeadzone(240, 80);

      this.setUILocked?.(false);
      this.refreshUILock?.();
      this.setControlsVisible?.(true);

      this.updateCoinHUD?.();
      this.updateHpBar?.();
      this.updateInventoryUI?.();
      this.refreshHotbar?.();
      this.updateHotbarActionUI?.();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();

      // Stability v47 still sees the WG as an active interior during the exact
      // resume call. Repeat the HUD/input restoration after the WG scene has
      // actually stopped on the next event-loop turn.
      window.setTimeout(() => {
        if (!this.sys?.isActive?.()) return;

        this.physics?.world?.resume?.();

        if (this.input) {
          this.input.enabled = true;
        }

        this.uiLocked = false;
        this.setUILocked?.(false);
        this.refreshUILock?.();
        this.setControlsVisible?.(true);

        if (this.player?.body) {
          this.player.body.enable = true;
          this.player.body.moves = true;
        }

        this.player?.setVisible?.(true);
        this.player?.setActive?.(true);
        this.player?.setVelocity?.(0, 0);

        this.refreshHotbar?.();
        this.updateHotbarActionUI?.();
        this.ensureTicketMachineInteractive();
        this.ensureTramBoardingInteractive();
      }, 80);
    }

    createStopGraphic(x, name, side) {
      const stop = this.add.graphics().setDepth(4);

      // Shelter.
      stop.fillStyle(0x72797b, 1);
      stop.fillRect(x - 85, 187, 5, 96);
      stop.fillRect(x + 79, 187, 5, 96);
      stop.fillStyle(0xcfd9dc, 0.42);
      stop.fillRect(x - 80, 194, 159, 68);
      stop.fillStyle(0x5f6b70, 1);
      stop.fillRect(x - 92, 181, 184, 10);

      // VBZ stop sign.
      stop.fillStyle(0x2a6aa1, 1);
      stop.fillRect(
        side === "left" ? x - 116 : x + 103,
        190,
        8,
        94
      );
      stop.fillStyle(0x246aa5, 1);
      stop.fillRect(
        side === "left" ? x - 137 : x + 82,
        178,
        50,
        29
      );

      this.add.text(
        side === "left" ? x - 112 : x + 107,
        192,
        name,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: name.length > 12 ? "4.3px" : "5px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 80 }
        }
      )
        .setOrigin(0.5)
        .setDepth(6);

      // Ticket machine near the stop.
      const tx =
        side === "left"
          ? x + 112
          : x - 112;

      stop.fillStyle(0x244c61, 1);
      stop.fillRect(tx - 22, 220, 44, 91);
      stop.fillStyle(0x17252e, 1);
      stop.fillRect(tx - 12, 235, 24, 22);
      stop.fillStyle(0xd5edf1, 1);
      stop.fillRect(tx - 8, 265, 16, 9);

      this.add.text(
        tx,
        211,
        "TICKET",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#fff3c4",
          backgroundColor: "#244c61",
          padding: { x: 4, y: 3 }
        }
      )
        .setOrigin(0.5)
        .setDepth(7);

      return tx;
    }

    createOerlikonStops() {
      this.__oerlikonStopsV57 = [];
      this.__oerlikonTicketZonesV57 = [];

      [
        {
          key: "salersteig",
          x: POS.salersteig,
          name: "SALERSTEIG",
          side: "left"
        },
        {
          key: "sternen",
          x: POS.sternen,
          name: "STERNEN OERLIKON",
          side: "right"
        }
      ].forEach((def) => {
        const ticketX =
          this.createStopGraphic(
            def.x,
            def.name,
            def.side
          );

        const boarding = this.add.zone(
          def.x,
          260,
          160,
          124
        )
          .setDepth(230)
          .setInteractive({ useHandCursor: true });

        const marker =
          this.createPulsingInteractionMarker?.(
            def.x,
            286,
            176
          );

        const ticketZone = this.add.zone(
          ticketX,
          260,
          62,
          110
        )
          .setDepth(245)
          .setInteractive({ useHandCursor: true });

        boarding.on("pointerdown", (pointer) => {
          stopEvent(pointer?.event);

          if (!this.canUseWorldInteraction?.(pointer)) return;
          if (!this.hasCityTicket) return;
          if (this.__oerlikonTravelBusyV57) return;

          this.__activeOerlikonStopV57 = def.key;
          this.openTramDestinationModal?.();
        });

        ticketZone.on("pointerdown", (pointer) => {
          stopEvent(pointer?.event);

          if (!this.canUseWorldInteraction?.(pointer)) return;
          if (this.__oerlikonTravelBusyV57) return;

          this.openTicketModal?.();
        });

        this.__oerlikonStopsV57.push({
          ...def,
          boarding,
          marker
        });

        this.__oerlikonTicketZonesV57.push(
          ticketZone
        );
      });

      this.enableTramBoarding();
      this.ensureTicketMachineInteractive();
    }

    enableTramBoarding() {
      this.tramBoardingEnabled =
        Boolean(this.hasCityTicket);

      this.ensureTramBoardingInteractive();
    }

    ensureTramBoardingInteractive() {
      const enabled = Boolean(
        this.hasCityTicket &&
        this.arrivalFinished &&
        !this.uiLocked &&
        !this.__oerlikonTravelBusyV57
      );

      this.__oerlikonStopsV57.forEach((stop) => {
        if (stop.boarding?.input) {
          stop.boarding.input.enabled = enabled;
          stop.boarding.input.cursor =
            enabled ? "pointer" : "default";
        }

        stop.marker?.setVisible?.(enabled);
      });
    }

    ensureTicketMachineInteractive() {
      const enabled = Boolean(
        this.arrivalFinished &&
        !this.uiLocked &&
        !this.__oerlikonTravelBusyV57
      );

      this.__oerlikonTicketZonesV57.forEach((zone) => {
        if (zone?.input) {
          zone.input.enabled = enabled;
          zone.input.cursor =
            enabled ? "pointer" : "default";
        }
      });
    }

    getTramDestinations() {
      if (!this.hasCityTicket) return [];

      return [
        {
          key: "bahnhofstrasse",
          label: "BAHNHOFSTRASSE/HB"
        }
      ];
    }

    startTramJourney(destinationKey) {
      if (destinationKey !== "bahnhofstrasse") {
        this.refreshUILock?.();
        return;
      }

      this.leaveForBahnhof();
    }

    forceFinishOerlikonArrival() {
      if (
        !this.sys?.isActive?.() ||
        !this.player?.active
      ) {
        return;
      }

      this.tweens?.killTweensOf?.(this.player);

      if (this.__arrivalTramV57?.active) {
        this.tweens?.killTweensOf?.(
          this.__arrivalTramV57
        );
        this.__arrivalTramV57.destroy?.(true);
        this.__arrivalTramV57 = null;
      }

      const exitX =
        POS.salersteig + 150;

      this.player.setPosition(
        exitX,
        250
      );

      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.clearTint?.();
      this.player.setAlpha?.(1);
      this.player.setAngle?.(0);
      this.player.setVelocity?.(0, 0);

      if (this.player.body) {
        this.player.body.enable = true;
        this.player.body.moves = true;
      }

      this.player.play?.(
        "simon-idle",
        true
      );

      this.arrivalFinished = true;
      this.uiLocked = false;
      this.tramTransitActive = false;
      this.__tramSwitching = false;
      this.__oerlikonTravelBusyV57 = false;

      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.setUILocked?.(false);
      this.refreshUILock?.();
      this.setControlsVisible?.(true);
      this.enableTramBoarding();
      this.ensureTicketMachineInteractive();

      this.cameras.main.startFollow(
        this.player,
        true,
        0.11,
        0.11
      );
      this.cameras.main.setDeadzone(
        240,
        80
      );
    }

    startArrivalAtSalersteig() {
      this.arrivalFinished = false;
      this.uiLocked = true;
      this.setUILocked?.(true);
      this.setControlsVisible?.(false);
      this.player?.setVisible?.(false);

      if (this.player?.body) {
        this.player.body.enable = false;
      }

      const tram = this.makeTransitTram(
        -270,
        0
      );

      this.__arrivalTramV57 = tram;

      // Hard recovery: if iOS/browser drops either tween callback, the new
      // scene becomes playable instead of remaining locked forever.
      this.time.delayedCall(2600, () => {
        if (
          this.sys?.isActive?.() &&
          !this.arrivalFinished
        ) {
          console.warn(
            "Oerlikon v59: Ankunft per Failsafe abgeschlossen."
          );
          this.forceFinishOerlikonArrival();
        }
      });

      this.tweens.add({
        targets: tram,
        x: POS.salersteig - 120,
        duration: 1050,
        ease: "Sine.easeOut",
        onComplete: () => {
          if (!this.sys?.isActive?.()) return;

          const exitX =
            POS.salersteig + 45;

          this.player?.setPosition?.(
            exitX,
            250
          );
          this.player?.setVisible?.(true);

          if (this.player?.body) {
            this.player.body.enable = true;
          }

          this.player?.play?.(
            "simon-run",
            true
          );

          this.tweens.add({
            targets: this.player,
            x: exitX + 105,
            duration: 520,
            ease: "Sine.easeOut",
            onComplete: () => {
              this.player?.setVelocity?.(0, 0);
              this.player?.play?.("simon-idle", true);

              this.arrivalFinished = true;
              this.uiLocked = false;
              this.setUILocked?.(false);
              this.setControlsVisible?.(true);
              this.enableTramBoarding();
              this.ensureTicketMachineInteractive();

              this.cameras.main.startFollow(
                this.player,
                true,
                0.11,
                0.11
              );
            }
          });
        }
      });
    }

    makeTransitTram(x, y) {
      const tram = this.add.container(x, y)
        .setDepth(35);

      const g = this.add.graphics();

      g.fillStyle(0xe9edef, 1);
      g.fillRect(0, 219, 250, 96);
      g.fillStyle(0x1766a6, 1);
      g.fillRect(0, 274, 250, 41);

      g.fillStyle(0x263e4d, 1);
      [19, 73, 127, 181].forEach((wx) => {
        g.fillRect(wx, 235, 42, 28);
      });

      g.fillStyle(0x182832, 1);
      g.fillRect(139, 232, 35, 76);

      g.fillStyle(0x252a2d, 1);
      g.fillCircle(51, 317, 13);
      g.fillCircle(200, 317, 13);

      tram.add(g);
      return tram;
    }

    leaveForBahnhof() {
      if (
        this.__oerlikonTravelBusyV57 ||
        !this.hasCityTicket
      ) {
        return;
      }

      if (!this.consumeCityTicket?.()) {
        this.refreshUILock?.();
        return;
      }

      this.closeTramDestinationModal?.();

      this.__oerlikonTravelBusyV57 = true;
      this.tramTransitActive = true;
      this.setUILocked?.(true);
      this.setControlsVisible?.(false);
      this.player?.setVelocity?.(0, 0);

      const stopX =
        this.__activeOerlikonStopV57 === "sternen"
          ? POS.sternen
          : POS.salersteig;

      const fromRight =
        this.__activeOerlikonStopV57 === "sternen";

      const tram = this.makeTransitTram(
        fromRight
          ? stopX + 330
          : stopX - 330,
        0
      );

      this.tweens.add({
        targets: tram,
        x: stopX - 120,
        duration: 800,
        ease: "Sine.easeOut",
        onComplete: () => {
          if (!this.sys?.isActive?.()) return;

          this.player?.setVisible?.(false);

          if (this.player?.body) {
            this.player.body.enable = false;
          }

          const state = {
            ...cloneTravelState(this),
            arrivalFrom: "oerlikon",
            hasCityTicket: false
          };

          this.tweens.add({
            targets: tram,
            x: fromRight
              ? stopX - 500
              : stopX + 520,
            duration: 1200,
            ease: "Sine.easeIn"
          });

          this.time.delayedCall(520, () => {
            if (!this.sys?.isActive?.()) return;

            this.cameras.main.fadeOut(
              300,
              0,
              0,
              0
            );

            this.time.delayedCall(320, () => {
              if (!this.sys?.isActive?.()) return;

              this.scene.start(
                "BahnhofquaiScene",
                state
              );
            });
          });
        }
      });
    }

    update(time, delta) {
      if (this.__esthiStoryActive) {
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJumpRequested = false;
        this.touchShootRequested = false;
        this.player?.setVelocityX?.(0);
        return;
      }

      super.update(time, delta);
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }
  }

  // =====================================================================
  // WG hallway — room selection
  // =====================================================================

  class WGInteriorScene extends Phaser.Scene {
    constructor() {
      super(WG_KEY);
      this.__simonInteriorScene = true;
      this.outdoorScene = null;
    }

    init(data = {}) {
      this.outdoorScene = data.outdoorScene || null;
    }

    create() {
      this.cameras.main.setBackgroundColor("#2d2a28");

      const g = this.add.graphics();

      g.fillStyle(0x443c36, 1);
      g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      g.fillStyle(0xb8a986, 1);
      g.fillRect(0, 75, GAME_WIDTH, 232);

      g.fillStyle(0x6e5b46, 1);
      g.fillRect(0, 307, GAME_WIDTH, 83);

      // chaotic WG details
      g.fillStyle(0x725743, 1);
      g.fillRect(55, 282, 78, 18); // crate
      g.fillStyle(0x33485e, 1);
      g.fillRect(62, 268, 18, 14);
      g.fillStyle(0x743e38, 1);
      g.fillRect(86, 265, 15, 17);

      // shoes / coats
      g.fillStyle(0x2d3137, 1);
      g.fillRoundedRect(166, 292, 30, 11, 4);
      g.fillStyle(0x855741, 1);
      g.fillRoundedRect(202, 291, 29, 12, 4);

      g.lineStyle(5, 0x544235, 1);
      g.lineBetween(676, 91, 676, 186);
      g.lineBetween(728, 91, 728, 186);
      g.fillStyle(0x45636c, 1);
      g.fillTriangle(662, 125, 690, 125, 676, 173);
      g.fillStyle(0x7b3f45, 1);
      g.fillTriangle(714, 124, 742, 124, 728, 176);

      this.add.text(
        GAME_WIDTH / 2,
        35,
        "WG · OERLIKONWEG 1",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#fff0c8",
          stroke: "#4c3a2f",
          strokeThickness: 5
        }
      ).setOrigin(0.5);

      const doors = [
        { name: "SIMON", x: 142, open: true },
        { name: "BENJAMIN", x: 322, open: false },
        { name: "DANELL", x: 502, open: false },
        { name: "VAL", x: 682, open: false }
      ];

      doors.forEach((door) => {
        this.createDoor(door);
      });

      this.createBackButton();

      this.events.once("shutdown", () => {
        document
          .querySelectorAll(
            '#phaser-game [data-simon-ui="wg-room-select-v57"]'
          )
          .forEach((node) => node.remove());
      });
    }

    createDoor({ name, x, open }) {
      const g = this.add.graphics();

      g.fillStyle(
        open ? 0x584234 : 0x4e4742,
        1
      );

      g.fillRoundedRect(
        x - 52,
        127,
        104,
        180,
        6
      );

      g.lineStyle(
        4,
        open ? 0xd6bd8b : 0x877c70,
        1
      );

      g.strokeRoundedRect(
        x - 52,
        127,
        104,
        180,
        6
      );

      g.fillStyle(0xd2a947, 1);
      g.fillCircle(
        x + 34,
        226,
        4
      );

      this.add.text(
        x,
        110,
        open
          ? name
          : `${name}  🔒`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: open ? "#fff0c2" : "#aaa49b",
          stroke: "#332b26",
          strokeThickness: 3
        }
      ).setOrigin(0.5);

      const zone = this.add.zone(
        x,
        218,
        110,
        190
      )
        .setDepth(50)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);

        if (open) {
          this.scene.pause(WG_KEY);
          this.scene.start(ROOM_KEY, {
            hallScene: this
          });
          return;
        }

        this.showLocked(name);
      });
    }

    showLocked(name) {
      this.__lockedNoticeV57?.destroy?.();

      const note = this.add.text(
        GAME_WIDTH / 2,
        337,
        `${name}: GESPERRT`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#f2d7b4",
          backgroundColor: "#3c3430",
          padding: { x: 10, y: 7 }
        }
      )
        .setOrigin(0.5)
        .setDepth(100);

      this.__lockedNoticeV57 = note;

      this.tweens.add({
        targets: note,
        alpha: 0,
        delay: 850,
        duration: 350,
        onComplete: () => note.destroy()
      });
    }

    createBackButton() {
      const back = this.add.text(
        18,
        18,
        "← RAUS",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#fff1d0",
          backgroundColor: "#30373b",
          padding: { x: 9, y: 7 }
        }
      )
        .setDepth(100)
        .setInteractive({ useHandCursor: true });

      back.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        this.leaveWG();
      });
    }

    leaveWG() {
      if (this.__leavingWGV59) return;
      this.__leavingWGV59 = true;

      const outdoor = this.outdoorScene;
      const game = getGame() || this.game;

      try {
        // v58 stopped the CURRENT scene first and only afterwards tried to
        // resume Oerlikon. On mobile Safari that can drop the remaining code
        // path because this scene's systems are already shutting down.
        //
        // Resume parent FIRST, restore it fully, stop this interior LAST.
        game.scene.resume(SCENE_KEY);
        outdoor?.resumeFromWG?.();

        this.time.delayedCall(20, () => {
          try {
            this.scene.stop();
          } catch {
            game.scene.stop(WG_KEY);
          }
        });
      } catch (error) {
        console.error("Oerlikon v59: WG-Rückkehr fehlgeschlagen:", error);

        try {
          game.scene.resume(SCENE_KEY);
          outdoor?.resumeFromWG?.();
        } catch {}

        this.__leavingWGV59 = false;
      }
    }
  }

  // =====================================================================
  // Simon's tiny room
  // =====================================================================

  class SimonRoomScene extends Phaser.Scene {
    constructor() {
      super(ROOM_KEY);
      this.__simonInteriorScene = true;
      this.hallScene = null;
    }

    init(data = {}) {
      this.hallScene = data.hallScene || null;
    }

    create() {
      this.cameras.main.setBackgroundColor("#c5bda9");

      const g = this.add.graphics();

      // Walls / floor.
      g.fillStyle(0xcfc6b2, 1);
      g.fillRect(0, 0, GAME_WIDTH, 285);
      g.fillStyle(0x8d7256, 1);
      g.fillRect(0, 285, GAME_WIDTH, 105);

      // Tiny single bed.
      g.fillStyle(0x674f3f, 1);
      g.fillRect(54, 213, 246, 67);
      g.fillStyle(0xe7dfca, 1);
      g.fillRoundedRect(61, 193, 230, 76, 8);
      g.fillStyle(0x6d879d, 1);
      g.fillRect(70, 223, 211, 43);
      g.fillStyle(0xf0e8d7, 1);
      g.fillRoundedRect(69, 198, 70, 29, 8);

      // Blue Persian-style rug.
      g.fillStyle(0x244f75, 1);
      g.fillRoundedRect(273, 274, 310, 78, 7);
      g.lineStyle(5, 0x8ba7b8, 1);
      g.strokeRoundedRect(283, 283, 290, 60, 5);
      g.lineStyle(2, 0xd0c49d, 0.85);
      for (let x = 305; x < 560; x += 42) {
        g.lineBetween(x, 291, x + 22, 333);
        g.lineBetween(x + 22, 291, x, 333);
      }

      // Small writing desk + laptop.
      g.fillStyle(0x76573f, 1);
      g.fillRect(587, 215, 173, 13);
      g.fillRect(601, 228, 9, 68);
      g.fillRect(738, 228, 9, 68);

      // Laptop screen.
      g.fillStyle(0x31363b, 1);
      g.fillRoundedRect(625, 158, 88, 57, 5);
      g.fillStyle(0x6c9bb4, 1);
      g.fillRect(633, 166, 72, 39);
      g.fillStyle(0x4a4c4d, 1);
      g.fillRect(614, 215, 111, 8);

      // A few desk objects.
      g.fillStyle(0xe0d4b0, 1);
      g.fillRect(595, 196, 20, 18);
      g.fillStyle(0x3f6b4c, 1);
      g.fillRect(723, 193, 8, 22);

      this.add.text(
        672,
        142,
        "SIMONS SCHREIBTISCH",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#4b3a30"
        }
      ).setOrigin(0.5);

      // Anton — orange cat.
      const anton = this.add.container(
        515,
        268
      ).setDepth(20);

      const cat = this.add.graphics();

      cat.fillStyle(0xd47a35, 1);
      cat.fillEllipse(0, 12, 51, 29);
      cat.fillCircle(22, -2, 18);
      cat.fillTriangle(11, -16, 17, -31, 23, -15);
      cat.fillTriangle(26, -16, 35, -29, 38, -10);

      cat.fillStyle(0xf0c06e, 1);
      cat.fillRect(-15, 15, 10, 24);
      cat.fillRect(8, 15, 10, 24);

      cat.fillStyle(0x2d2925, 1);
      cat.fillRect(17, -6, 3, 3);
      cat.fillRect(27, -6, 3, 3);

      cat.lineStyle(4, 0xc2682f, 1);
      cat.beginPath();
      cat.moveTo(-24, 10);
      cat.lineTo(-46, -4);
      cat.lineTo(-51, -19);
      cat.strokePath();

      anton.add(cat);

      this.tweens.add({
        targets: anton,
        y: anton.y - 2,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      const antonLabel = this.add.text(
        515,
        221,
        "ANTON",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#6e3c24",
          backgroundColor: "#f3e5c5",
          padding: { x: 5, y: 3 }
        }
      ).setOrigin(0.5);

      const antonZone = this.add.zone(
        515,
        268,
        100,
        100
      )
        .setDepth(80)
        .setInteractive({ useHandCursor: true });

      antonZone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        this.showAnton();
      });

      this.add.text(
        GAME_WIDTH / 2,
        34,
        "SIMONS ZIMMER",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "14px",
          color: "#4c4036"
        }
      ).setOrigin(0.5);

      const back = this.add.text(
        18,
        18,
        "← FLUR",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#fff1d0",
          backgroundColor: "#30373b",
          padding: { x: 9, y: 7 }
        }
      )
        .setDepth(100)
        .setInteractive({ useHandCursor: true });

      back.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        this.leaveRoom();
      });
    }

    showAnton() {
      this.__antonBubbleV57?.destroy?.();

      const bubble = this.add.text(
        515,
        185,
        "Miau.",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#332a24",
          backgroundColor: "#fff2d5",
          padding: { x: 9, y: 7 }
        }
      )
        .setOrigin(0.5)
        .setDepth(100);

      this.__antonBubbleV57 = bubble;

      this.tweens.add({
        targets: bubble,
        alpha: 0,
        delay: 900,
        duration: 300,
        onComplete: () => bubble.destroy()
      });
    }

    leaveRoom() {
      if (this.__leavingRoomV59) return;
      this.__leavingRoomV59 = true;

      const hall = this.hallScene;
      const game = getGame() || this.game;

      try {
        // Same parent-first ordering as the WG -> outdoor transition.
        game.scene.resume(WG_KEY);

        if (hall?.input) {
          hall.input.enabled = true;
        }

        hall?.cameras?.main?.resetFX?.();
        hall?.cameras?.main?.setAlpha?.(1);

        this.time.delayedCall(20, () => {
          try {
            this.scene.stop();
          } catch {
            game.scene.stop(ROOM_KEY);
          }
        });
      } catch (error) {
        console.error("Oerlikon v59: Zimmer-Rückkehr fehlgeschlagen:", error);
        this.__leavingRoomV59 = false;
      }
    }
  }

  // =====================================================================
  // Bahnhofstrasse integration
  // =====================================================================

  function buildOerlikonTravelState(scene) {
    return {
      ...cloneTravelState(scene),
      arrivalFrom: "bahnhofstrasse",
      arrivalStop: "salersteig",
      hasCityTicket: false
    };
  }

  function startBahnhofToOerlikon(scene) {
    if (
      !scene ||
      !isOerlikonUnlocked(scene) ||
      scene.__tramSwitching ||
      scene.tramTransitActive
    ) {
      return false;
    }

    // The destination menu deliberately sets uiLocked=true. Close it first.
    // v57 checked uiLocked above and therefore rejected the exact click that
    // was supposed to start SALERSTEIG.
    scene.closeTramDestinationModal?.();

    if (!scene.consumeCityTicket?.()) {
      scene.__tramSwitching = false;
      scene.tramTransitActive = false;
      scene.refreshUILock?.();
      return false;
    }

    const game = getGame() || scene.game;
    install(game);

    scene.__tramSwitching = true;
    scene.tramTransitActive = true;
    scene.setUILocked?.(true);
    scene.player?.setVelocity?.(0, 0);
    scene.cameras.main.stopFollow?.();

    const state = buildOerlikonTravelState(scene);
    let transitionDone = false;

    const enterOerlikon = () => {
      if (transitionDone) return;
      transitionDone = true;

      const gameNow =
        getGame() ||
        scene.game;

      install(gameNow);

      try {
        if (!gameNow?.scene?.keys?.[SCENE_KEY]) {
          throw new Error(
            "OerlikonScene ist nicht registriert."
          );
        }

        scene.scene.start(
          SCENE_KEY,
          state
        );
      } catch (error) {
        console.error(
          "Oerlikon v59: Salersteig-Start fehlgeschlagen:",
          error
        );

        scene.__tramSwitching = false;
        scene.tramTransitActive = false;
        scene.uiLocked = false;
        scene.setUILocked?.(false);
        scene.refreshUILock?.();
        scene.setControlsVisible?.(true);
        scene.player?.setVisible?.(true);

        if (scene.player?.body) {
          scene.player.body.enable = true;
        }

        scene.cameras.main.resetFX();
        scene.cameras.main.startFollow(
          scene.player,
          true,
          0.11,
          0.11
        );
      }
    };

    // Independent transition watchdog. The normal animation gets priority;
    // if a nested tween/delayedCall is lost, travel still completes.
    scene.time.delayedCall(2600, () => {
      if (
        !transitionDone &&
        scene.sys?.isActive?.()
      ) {
        console.warn(
          "Oerlikon v59: Salersteig-Transfer per Failsafe gestartet."
        );
        enterOerlikon();
      }
    });

    const tram =
      scene.arrivalTram ||
      scene.tram;

    const doorX =
      (tram?.x || 470) + 156;

    scene.tweens.add({
      targets: scene.player,
      x: doorX,
      y: 250,
      duration: 420,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (!scene.sys?.isActive?.()) return;

        scene.player?.setVisible?.(false);

        if (scene.player?.body) {
          scene.player.body.enable = false;
        }

        if (tram?.active) {
          scene.tweens.add({
            targets: tram,
            x: -330,
            duration: 1250,
            ease: "Sine.easeIn"
          });
        }

        scene.time.delayedCall(520, () => {
          if (!scene.sys?.isActive?.()) return;

          scene.cameras.main.fadeOut(
            300,
            0,
            0,
            0
          );

          scene.time.delayedCall(320, () => {
            if (!scene.sys?.isActive?.()) return;

            enterOerlikon();
          });
        });
      }
    });

    return true;
  }

  function patchBahnhof() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;

    const proto = SceneClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.getTramDestinations === "function" &&
      !proto.getTramDestinations.__oerlikonV57
    ) {
      const original = proto.getTramDestinations;

      const wrapped = function getTramDestinationsOerlikonV57(...args) {
        const destinations =
          original.apply(this, args) || [];

        if (
          this.hasCityTicket &&
          isOerlikonUnlocked(this) &&
          !destinations.some(
            (item) => item?.key === "salersteig"
          )
        ) {
          destinations.push({
            key: "salersteig",
            label: "SALERSTEIG"
          });
        }

        return destinations;
      };

      wrapped.__oerlikonV57 = true;
      proto.getTramDestinations = wrapped;
    }

    if (
      typeof proto.startTramJourney === "function" &&
      !proto.startTramJourney.__oerlikonV57
    ) {
      const original = proto.startTramJourney;

      const wrapped = function startTramJourneyOerlikonV57(
        destinationKey,
        ...args
      ) {
        if (destinationKey === "salersteig") {
          return startBahnhofToOerlikon(this);
        }

        return original.call(
          this,
          destinationKey,
          ...args
        );
      };

      wrapped.__oerlikonV57 = true;
      proto.startTramJourney = wrapped;
    }

    return true;
  }

  // =====================================================================
  // Registration / API
  // =====================================================================

  function install(game = getGame()) {
    ensureStyles();

    BaseScene =
      getBaseSceneClass() ||
      BaseScene;

    if (!game?.scene || !BaseScene) {
      patchBahnhof();
      return false;
    }

    const scenes = [
      [SCENE_KEY, OerlikonScene],
      [WG_KEY, WGInteriorScene],
      [ROOM_KEY, SimonRoomScene]
    ];

    scenes.forEach(([key, SceneClass]) => {
      if (game.scene.keys?.[key]) return;

      try {
        game.scene.add(
          key,
          SceneClass,
          false
        );
      } catch (error) {
        console.error(
          `Oerlikon v57: ${key} konnte nicht registriert werden:`,
          error
        );
      }
    });

    patchBahnhof();
    return true;
  }

  patchBahnhof();
  ensureStyles();

  const timer = window.setInterval(() => {
    install(getGame());
  }, 300);

  window.__SIMON_OERLIKON_SCENE_CLASS__ =
    OerlikonScene;

  const publicApi = Object.freeze({
    VERSION,
    POS,
    cloneTravelState,
    install,

    enterDeveloper() {
      const game = getGame();
      if (!game?.scene) return false;

      install(game);

      const station =
        getScene(game, "BahnhofquaiScene");

      const state = station
        ? {
            ...cloneTravelState(station),
            developerMode: true,
            enriqueSpoken: true,
            coins: 999999,
            arrivalFrom: null,
            arrivalStop: "salersteig"
          }
        : {
            developerMode: true,
            enriqueSpoken: true,
            coins: 999999,
            hp: 100,
            hotbarItems: [null, null, null, null, null],
            arrivalFrom: null,
            arrivalStop: "salersteig"
          };

      try {
        game.scene.stop("BahnhofquaiScene");
      } catch {}

      try {
        game.scene.stop("MilchbuckScene");
      } catch {}

      game.scene.start(
        SCENE_KEY,
        state
      );

      return true;
    },

    status() {
      const game = getGame();
      const scene = getScene(game, SCENE_KEY);

      return {
        registered:
          Boolean(game?.scene?.keys?.[SCENE_KEY]),
        active:
          Boolean(scene?.sys?.isActive?.()),
        enriqueUnlock:
          Boolean(
            getScene(game, "BahnhofquaiScene")?.enriqueSpoken
          ),
        positions: POS
      };
    }
  });

  window.SimonOerlikonV59 = publicApi;
  window.SimonOerlikonV58 = publicApi;
  window.SimonOerlikonV57 = publicApi;

  console.info(
    "Oerlikon v59: Salersteig-Transfer repariert, Ankunft mit Failsafe."
  );
})();
