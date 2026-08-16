(() => {
  "use strict";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const WORLD_WIDTH = 3000;
  const GROUND_TOP = 338;
  const HOTBAR_SIZE = 5;

  let game = null;
  let pendingStartOptions = {
    startMode: "normal",
    developerMode: false
  };

  class MilchbuckScene extends Phaser.Scene {
    constructor(sceneKey = "MilchbuckScene") {
      super(sceneKey);

      this.startMode = "normal";
      this.developerMode = false;

      this.player = null;
      this.cursors = null;
      this.keyA = null;
      this.keyD = null;
      this.keyW = null;
      this.keySpace = null;
      this.keyShoot = null;

      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpRequested = false;
      this.touchShootRequested = false;

      this.ground = null;
      this.facing = 1;
      this.shootingUntil = 0;

      this.coins = 0;
      this.hasCityTicket = false;
      this.coinText = null;

      this.uiLocked = false;
      this.controlObjects = [];
      this.ticketModal = null;
      this.ticketStatusText = null;

      this.bouncer = null;
      this.bouncerDialogueActive = false;
      this.bouncerDialogueStep = 0;
      this.bouncerDialogueBubble = null;
      this.dialogueIgnoreUntil = 0;

      this.fightActive = false;
      this.fightFinished = false;
      this.fightBouncers = [];
      this.fightLion = null;
      this.purrText = null;

      this.maxHp = 100;
      this.hp = 100;
      this.hpBarFill = null;
      this.playerDying = false;
      this.playerHitUntil = 0;

      this.ticketHitbox = null;

      this.tram = null;
      this.tramHitbox = null;
      this.tramBoardingMarker = null;
      this.tramBoardingEnabled = false;
      this.tramTransitActive = false;
      this.tramDestinationModal = null;
      this.currentStationKey = "milchbuck";
      this.travelArrivalFrom = null;

      this.itemsButton = null;
      this.itemsModal = null;
      this.itemsTicketBadge = null;
      this.itemInfoModal = null;
      this.villainInfoModal = null;

      this.inventory = {
        gatorade: 0,
        monster: 0,
        camel: 0,
        gandhiSticks: 0
      };

      this.booksOwned = {
        generalRelativity: false,
        phaenomenologie: false,
        playbook: false,
        zarathustra: false
      };

      // Bahnhofstrasse story progression. These flags are carried through
      // tram journeys so the encounter cannot accidentally repeat.
      this.gandhiStoryEligible = false;
      this.gandhiEncounterFinished = false;
      this.gandhiDead = false;
      this.darkGandhiDefeated = false;
      this.gandhiPassOriginSide = null;
      this.gandhiPassEnteredZone = false;
      this.gandhiPassCompleted = false;
      this.gandhiSticksLooted = false;

      this.booksRead = {
        generalRelativity: false,
        phaenomenologie: false,
        playbook: false,
        zarathustra: false
      };

      this.abilitiesUnlocked = {
        wormhole: false,
        eternalReturn: false,
        forItself: false
      };
      this.activeAbility = null;
      this.itemsModalTab = "items";
      this.itemsModalContent = null;
      this.readingBook = false;
      this.abilityIndicatorDOM = null;
      this.abilityUnlockBannerDOM = null;
      this.abilityControlObjects = [];
      this.abilityCooldownText = null;
      this.weaponControlObjects = [];
      this.throwingStickProjectiles = [];
      this.throwingStickCooldownUntil = 0;

      this.wormholeTeleporting = false;
      this.wormholeUsedThisJump = false;
      this.__wormholePointerHandler = null;

      // Ewige Wiederkehr: rolling 3-second gameplay history.
      this.rewindHistory = [];
      this.lastRewindCaptureAt = -Infinity;
      this.rewindActive = false;
      this.rewindHorizonMs = 4200;
      this.__rewindSuppressMilkmanUntil = 0;

      // Für sich sein: isolated void, one activation every five minutes.
      this.inVoid = false;
      this.voidOverlay = null;
      this.voidBlocker = null;
      this.voidBackUI = null;
      this.voidEnteredSceneTime = 0;
      this.voidBottleStates = [];
      this.voidPlayerState = null;
      this.forItselfCooldownUntil = 0;

      this.hotbarContainer = null;
      this.hotbarBackground = null;
      this.hotbarSlotCenters = [];
      this.hotbarItems = Array(HOTBAR_SIZE).fill(null);
      this.hotbarDynamicObjects = [];
      this.selectedHotbarIndex = 0;
      this.hotbarDOM = null;
      this.hotbarActionUI = null;

      this.drinkingItem = false;

      // Zigarette / Sprint-Buff.
      // Epoch timestamp instead of Scene-time, so the minute survives tram
      // scene changes reliably.
      this.sprintExpiresAt = 0;
      this.sprintIndicatorDOM = null;
      this.nextSprintIndicatorRefreshAt = 0;

      this.lootModal = null;
      this.bouncerTipStolen = false;

      this.lionChoiceModal = null;
      this.lionQuestionBubble = null;
      this.lionChoiceShown = false;
      this.lionExitActive = false;
      this.lionCombatActive = false;
      this.nextLionHitAt = 0;

      this.danceOverlay = null;
      this.danceBackUI = null;
    }

    init(data = {}) {
      this.travelArrivalFrom = data.arrivalFrom || null;

      // Scene objects are rebuilt after a tram journey. Clear references to
      // objects from the previous scene run so no old hitboxes/UI survive.
      this.controlObjects = [];
      this.hotbarDynamicObjects = [];
      this.hotbarContainer = null;
      this.hotbarBackground = null;
      this.hotbarDOM = null;
      this.hotbarActionUI = null;
      this.ticketModal = null;
      this.tramDestinationModal = null;
      this.itemInfoModal = null;
      this.villainInfoModal = null;
      this.itemsModal = null;
      this.lootModal = null;
      this.danceOverlay = null;
      this.playerDying = false;
      this.drinkingItem = false;
      this.readingBook = false;
      this.wormholeTeleporting = false;
      this.wormholeUsedThisJump = false;
      this.itemsModalContent = null;
      this.rewindHistory = [];
      this.lastRewindCaptureAt = -Infinity;
      this.rewindActive = false;
      this.inVoid = false;
      this.voidOverlay = null;
      this.voidBlocker = null;
      this.voidBackUI = null;
      this.abilityControlObjects = [];
      this.abilityCooldownText = null;
      this.weaponControlObjects = [];
      this.throwingStickProjectiles = [];

      // A Scene instance is reused by Phaser after scene.start(). Any old
      // modal/combat/travel lock must be reset explicitly.
      this.uiLocked = false;
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpRequested = false;
      this.touchShootRequested = false;
      this.bouncerDialogueActive = false;
      this.fightActive = false;
      this.lionExitActive = false;
      this.lionCombatActive = false;
      this.nextLionHitAt = 0;

      this.tramTransitActive = false;
      this.tramBoardingEnabled = false;
      this.__tramSwitching = false;
      this.ticketHitbox = null;
      this.tramHitbox = null;
      this.tramBoardingMarker = null;
      this.tram = null;

      if (!this.travelArrivalFrom) return;

      this.developerMode = Boolean(data.developerMode);
      this.coins = this.developerMode
        ? 999999
        : (Number.isFinite(data.coins) ? data.coins : 0);

      this.hp = Number.isFinite(data.hp) ? data.hp : this.maxHp;
      this.hasCityTicket = Boolean(data.hasCityTicket);

      this.inventory = {
        gatorade: Math.max(0, Number(data.inventory?.gatorade) || 0),
        monster: Math.max(0, Number(data.inventory?.monster) || 0),
        camel: Math.max(0, Number(data.inventory?.camel) || 0),
        gandhiSticks: Math.max(0, Number(data.inventory?.gandhiSticks) || 0)
      };

      this.sprintExpiresAt = Number.isFinite(data.sprintExpiresAt)
        ? data.sprintExpiresAt
        : 0;

      this.booksOwned = {
        generalRelativity: Boolean(data.booksOwned?.generalRelativity),
        phaenomenologie: Boolean(data.booksOwned?.phaenomenologie),
        playbook: Boolean(data.booksOwned?.playbook),
        zarathustra: Boolean(data.booksOwned?.zarathustra)
      };

      this.gandhiStoryEligible =
        Boolean(data.gandhiStoryEligible);
      this.gandhiEncounterFinished =
        Boolean(data.gandhiEncounterFinished);
      this.gandhiDead =
        Boolean(data.gandhiDead);
      this.darkGandhiDefeated =
        Boolean(data.darkGandhiDefeated);
      this.gandhiPassOriginSide =
        data.gandhiPassOriginSide === "left" || data.gandhiPassOriginSide === "right"
          ? data.gandhiPassOriginSide
          : null;
      this.gandhiPassEnteredZone =
        Boolean(data.gandhiPassEnteredZone);
      this.gandhiPassCompleted =
        Boolean(data.gandhiPassCompleted);
      this.gandhiSticksLooted =
        Boolean(data.gandhiSticksLooted || this.inventory.gandhiSticks > 0);

      this.booksRead = {
        generalRelativity: Boolean(data.booksRead?.generalRelativity),
        phaenomenologie: Boolean(data.booksRead?.phaenomenologie),
        playbook: Boolean(data.booksRead?.playbook),
        zarathustra: Boolean(data.booksRead?.zarathustra)
      };

      this.abilitiesUnlocked = {
        wormhole: Boolean(data.abilitiesUnlocked?.wormhole),
        eternalReturn: Boolean(data.abilitiesUnlocked?.eternalReturn),
        forItself: Boolean(data.abilitiesUnlocked?.forItself)
      };

      this.activeAbility =
        typeof data.activeAbility === "string" &&
        this.abilitiesUnlocked[data.activeAbility]
          ? data.activeAbility
          : null;

      this.forItselfCooldownUntil =
        Number.isFinite(data.forItselfCooldownUntil)
          ? data.forItselfCooldownUntil
          : 0;

      this.hotbarItems = Array.isArray(data.hotbarItems)
        ? data.hotbarItems.slice(0, HOTBAR_SIZE)
        : Array(HOTBAR_SIZE).fill(null);

      while (this.hotbarItems.length < HOTBAR_SIZE) {
        this.hotbarItems.push(null);
      }

      this.selectedHotbarIndex = Number.isInteger(data.selectedHotbarIndex)
        ? Phaser.Math.Clamp(data.selectedHotbarIndex, 0, HOTBAR_SIZE - 1)
        : 0;

      // A fresh return to Milchbuck should not restart a Developer jump.
      this.startMode = "normal";
      pendingStartOptions = {
        startMode: "normal",
        developerMode: this.developerMode
      };
    }

    preload() {
      this.load.on("loaderror", (file) => {
        console.error("Asset konnte nicht geladen werden:", file?.src || file?.key);
      });

      this.load.spritesheet("simon", "simon-spritesheet.png", {
        frameWidth: 240,
        frameHeight: 280
      });
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);

      if (this.travelArrivalFrom) {
        this.startMode = "normal";
      } else {
        this.startMode = pendingStartOptions?.startMode || "normal";
        this.developerMode = Boolean(pendingStartOptions?.developerMode) ||
          this.startMode !== "normal";
      }

      if (this.developerMode) {
        this.coins = 999999;
      }

      const domRoot = document.getElementById("phaser-game");
      domRoot?.querySelectorAll("[data-simon-ui]").forEach((node) => node.remove());
      this.sprintIndicatorDOM = null;

      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.setBackgroundColor("#7fc7dd");

      this.createWorld();
      this.createGround();

      if (!this.textures.exists("simon")) {
        this.add.text(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2,
          "SIMON-SPRITE FEHLT\n\nsimon-spritesheet.png\nmuss im Hauptordner liegen.",
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "11px",
            color: "#ffdf8a",
            align: "center",
            lineSpacing: 8
          }
        )
          .setScrollFactor(0)
          .setDepth(100)
          .setOrigin(0.5);
        return;
      }

      this.createAnimations();
      this.createPlayer();
      this.createKeyboardControls();
      this.createTouchControls();
      this.createHUD();
      this.installWormholeInput();

      this.events.once("shutdown", () => {
        this.cleanupHotbarDOM?.();
        document
          .querySelectorAll("#phaser-game [data-simon-ui='hotbar-action']")
          .forEach((node) => node.remove());
        this.cleanupSprintIndicator();
        this.cleanupAbilityIndicator();
        this.cleanupVoid();
      });

      if (this.travelArrivalFrom === "bahnhofstrasse") {
        this.currentStationKey = "milchbuck";

        // Force the reused scene back into a genuinely playable state.
        this.uiLocked = false;
        this.tramTransitActive = false;
        this.lionExitActive = false;
        this.lionCombatActive = false;
        this.fightActive = false;
        this.bouncerDialogueActive = false;

        this.player.setPosition(250, 245);
        this.player.setVelocity(0, 0);
        this.player.setVisible(true);
        this.player.setActive(true);

        if (this.player.body) {
          this.player.body.enable = true;
          this.player.body.moves = true;
        }

        this.player.clearTint();
        this.player.setAngle(0);
        this.player.play("simon-idle", true);

        this.cameras.main.resetFX();
        this.cameras.main.setAlpha(1);
        this.cameras.main.setScroll(0, 0);

        this.setControlsVisible(true);
        this.setUILocked(false);

        this.updateCoinHUD();
        this.updateHpBar();
        this.updateInventoryUI();
        this.updateSprintIndicator(true);
        this.updateAbilityIndicator();

        // The original street bouncer belongs to the already-resolved HIVE
        // story. On a later return from Bahnhofstrasse he must not respawn.
        // Rebuild only the HIVE entrance and hand it to the latest HIVE
        // expansion so all of its current interior options remain available.
        this.restoreHiveAfterStoryReturn();
      }

      // Developer-Startziele werden erst NACH der normalen Szeneninitialisierung
      // angewandt. So bleiben Sprites, Animationen, HUD und Touch-Steuerung
      // exakt dieselben wie im normalen Spiel.
      if (!this.travelArrivalFrom && this.startMode === "hb") {
        this.scene.start("BahnhofquaiScene", {
          coins: 999999,
          hp: this.maxHp,
          hasCityTicket: true,
          fromDeveloperMode: true,
          developerMode: true,
          inventory: { ...this.inventory },
          booksOwned: { ...this.booksOwned },
          gandhiStoryEligible: this.gandhiStoryEligible,
          gandhiEncounterFinished: this.gandhiEncounterFinished,
          gandhiDead: this.gandhiDead,
          darkGandhiDefeated: this.darkGandhiDefeated,
          gandhiPassOriginSide: this.gandhiPassOriginSide,
          gandhiPassEnteredZone: this.gandhiPassEnteredZone,
          gandhiPassCompleted: this.gandhiPassCompleted,
          gandhiSticksLooted: this.gandhiSticksLooted,
          booksRead: { ...this.booksRead },
          abilitiesUnlocked: { ...this.abilitiesUnlocked },
          activeAbility: this.activeAbility,
          forItselfCooldownUntil: this.forItselfCooldownUntil,
          hotbarItems: ["ticket", null, null, null, null]
        });
        return;
      }

      if (!this.travelArrivalFrom && this.startMode === "post-milkman") {
        this.scene.start("BahnhofquaiScene", {
          coins: 999999,
          hp: this.maxHp,
          hasCityTicket: true,
          fromDeveloperMode: true,
          developerMode: true,
          developerCheckpoint: "post-milkman",
          inventory: { ...this.inventory },
          booksOwned: { ...this.booksOwned },
          gandhiStoryEligible: true,
          gandhiEncounterFinished: false,
          gandhiDead: false,
          darkGandhiDefeated: false,
          gandhiPassOriginSide: "right",
          gandhiPassEnteredZone: false,
          gandhiPassCompleted: false,
          gandhiSticksLooted: false,
          booksRead: { ...this.booksRead },
          abilitiesUnlocked: { ...this.abilitiesUnlocked },
          activeAbility: this.activeAbility,
          forItselfCooldownUntil: this.forItselfCooldownUntil,
          hotbarItems: [null, null, null, null, null]
        });
        return;
      }

      if (!this.travelArrivalFrom && this.startMode === "lion-choice") {
        this.time.delayedCall(80, () => this.setupDeveloperLionChoice());
      }

      this.input.on("pointerup", () => {
        if (
          this.bouncerDialogueActive &&
          this.time.now >= this.dialogueIgnoreUntil
        ) {
          this.advanceBouncerDialogue();
        }
      });

      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
      this.cameras.main.roundPixels = true;
    }

    restoreHiveAfterStoryReturn() {
      // Remove the procedural/old bouncer created again by createWorld().
      if (this.bouncer) {
        this.tweens.killTweensOf(this.bouncer);
        this.bouncer.removeAllListeners?.();
        this.bouncer.destroy?.(true);
        this.bouncer = null;
      }

      // Remove stale references to a door from a previous scene run.
      const oldZone = this.__hiveV12DoorZone;
      const oldLabel = this.__hiveV12DoorLabel;

      if (oldZone?.active) oldZone.destroy?.();
      if (oldLabel?.active) oldLabel.destroy?.();

      const zone = this.add.zone(1700, 282, 100, 116)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(1700, 208, "HIVE ↥", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#ffe6a5",
        backgroundColor: "#34203f",
        padding: { x: 6, y: 5 }
      })
        .setOrigin(0.5)
        .setDepth(91);

      zone.on("pointerup", (pointer) => {
        if (this.canUseWormholeNow()) return;

        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.enterLatestHiveInterior();
      });

      this.hiveEntranceUnlocked = true;
      this.__hiveV12DoorZone = zone;
      this.__hiveV12DoorLabel = label;
    }

    enterLatestHiveInterior() {
      if (
        this.playerDying ||
        this.uiLocked ||
        !this.game?.scene?.keys?.HiveInteriorScene ||
        this.game.scene.isActive("HiveInteriorScene")
      ) {
        return;
      }

      const hiveScene = this.game.scene.keys.HiveInteriorScene;

      // HiveInteriorScene is reused by Phaser. v14.2 sets __leaving=true
      // when leaving and otherwise keeps that value forever, making the
      // STRASSE button inert on the next visit. Reset all transient exit/UI
      // flags before starting the existing latest HIVE scene again.
      if (hiveScene) {
        hiveScene.__leaving = false;
        hiveScene.modalOpen = false;
        hiveScene.currentModal = null;
        hiveScene.actionLocked = false;
        hiveScene.touchLeft = false;
        hiveScene.touchRight = false;
        hiveScene.touchDance = false;
        hiveScene.introDancing = false;
      }

      this.setUILocked(true);
      this.scene.pause();

      this.game.scene.start("HiveInteriorScene", {
        overworld: this,
        simonDances: false
      });
    }

    createWorld() {
      this.createSky();
      this.createDistantHills();
      this.createCityBackground();
      this.createMilchbuckStation();
      this.createHiveClub();
      this.createStreetAndTracks();
      this.createForegroundDetails();
    }

    createSky() {
      const skyBands = [
        { y: 0,   h: 65, color: 0x70b9dc },
        { y: 65,  h: 65, color: 0x7bc4df },
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
        )
          .setScrollFactor(0.12)
          .setDepth(-30);
      });

      // Kleine blockige Wolken, damit das Ganze klar nach Pixelwelt wirkt.
      const clouds = [
        { x: 180, y: 72, s: 1.0 },
        { x: 680, y: 105, s: 0.78 },
        { x: 1320, y: 62, s: 1.15 },
        { x: 1920, y: 102, s: 0.9 },
        { x: 2580, y: 70, s: 1.05 }
      ];

      clouds.forEach(({ x, y, s }) => {
        const g = this.add.graphics().setScrollFactor(0.18).setDepth(-27);
        g.fillStyle(0xeaf6f2, 0.9);
        g.fillRect(x, y, 70 * s, 14 * s);
        g.fillRect(x + 14 * s, y - 12 * s, 48 * s, 14 * s);
        g.fillRect(x + 28 * s, y - 22 * s, 30 * s, 12 * s);
      });
    }

    createDistantHills() {
      const hills = this.add.graphics().setScrollFactor(0.25).setDepth(-22);

      hills.fillStyle(0x6da78e, 1);
      hills.beginPath();
      hills.moveTo(0, 255);

      const points = [
        [0, 240], [180, 205], [340, 225], [540, 180], [730, 215],
        [930, 190], [1140, 230], [1340, 195], [1540, 225], [1740, 180],
        [1950, 215], [2160, 190], [2390, 220], [2600, 175], [2820, 208],
        [3000, 195]
      ];

      points.forEach(([x, y]) => hills.lineTo(x, y));
      hills.lineTo(WORLD_WIDTH, GROUND_TOP);
      hills.lineTo(0, GROUND_TOP);
      hills.closePath();
      hills.fillPath();

      const treeLine = this.add.graphics().setScrollFactor(0.32).setDepth(-20);
      for (let x = 0; x < WORLD_WIDTH; x += 38) {
        const height = 30 + ((x * 17) % 36);
        treeLine.fillStyle((x / 38) % 2 === 0 ? 0x3f735d : 0x4b8268, 1);
        treeLine.fillTriangle(
          x,
          GROUND_TOP - 40,
          x + 18,
          GROUND_TOP - 40 - height,
          x + 36,
          GROUND_TOP - 40
        );
      }
    }

    createCityBackground() {
      // Die Stadt beginnt rechts nach der eigentlichen Milchbuck-Station.
      const startX = 900;

      // Parallaxe-Silhouette weiter hinten.
      const far = this.add.graphics().setScrollFactor(0.52).setDepth(-12);
      const farBuildings = [
        [900, 174, 115, 164, 0x89938f],
        [1025, 205, 92, 133, 0x7f8986],
        [1128, 160, 128, 178, 0x9b968c],
        [1270, 198, 105, 140, 0x858e8c],
        [1388, 145, 142, 193, 0x9a9589],
        [1545, 187, 96, 151, 0x7f8987],
        [1660, 165, 128, 173, 0x949086],
        [1800, 195, 106, 143, 0x818a88],
        [1925, 154, 148, 184, 0x999487],
        [2092, 190, 94, 148, 0x858c88],
        [2205, 166, 130, 172, 0x969085],
        [2350, 198, 100, 140, 0x828a87],
        [2470, 152, 154, 186, 0x999387],
        [2640, 185, 108, 153, 0x858d89],
        [2765, 160, 145, 178, 0x969085]
      ];

      farBuildings.forEach(([x, y, w, h, c], index) => {
        far.fillStyle(c, 1);
        far.fillRect(x, y, w, h);

        // Terrakotta- bzw. dunkle Dächer für einen Zürich-Eindruck.
        far.fillStyle(index % 3 === 0 ? 0x824f42 : 0x5d5855, 1);
        far.fillTriangle(x - 6, y, x + w / 2, y - 28, x + w + 6, y);

        far.fillStyle(0xd3c99f, 0.7);
        for (let wx = x + 14; wx < x + w - 10; wx += 24) {
          for (let wy = y + 22; wy < y + h - 16; wy += 30) {
            far.fillRect(wx, wy, 8, 12);
          }
        }
      });

      // Markante Turm-Silhouetten, ohne ein konkretes Gebäude 1:1 zu kopieren.
      far.fillStyle(0x666d6d, 1);
      far.fillRect(2010, 107, 34, 231);
      far.fillTriangle(2003, 107, 2027, 55, 2051, 107);
      far.fillRect(2055, 128, 28, 210);
      far.fillTriangle(2048, 128, 2069, 78, 2090, 128);

      // Mittlere Ebene: kleine Zürcher Altstadthäuser und Wohnblöcke.
      const colors = [0xd7b178, 0xc98d72, 0xd8c59a, 0xb8876f, 0xd2a56b, 0xc8b48d];
      for (let i = 0; i < 16; i += 1) {
        const x = startX + i * 135;
        const w = 118 + (i % 3) * 10;
        const h = 100 + (i % 4) * 18;
        const y = GROUND_TOP - h - 18;
        const color = colors[i % colors.length];

        const b = this.add.graphics().setDepth(-5);
        b.fillStyle(color, 1);
        b.fillRect(x, y, w, h);

        b.fillStyle(i % 2 === 0 ? 0x7e493c : 0x63564c, 1);
        b.fillTriangle(x - 4, y, x + w / 2, y - 24 - (i % 3) * 4, x + w + 4, y);

        b.fillStyle(0x684c3f, 0.9);
        b.fillRect(x + w / 2 - 10, y + h - 34, 20, 34);

        for (let wx = x + 15; wx < x + w - 10; wx += 28) {
          for (let wy = y + 20; wy < y + h - 40; wy += 30) {
            b.fillStyle((wx + wy) % 3 === 0 ? 0xffd67c : 0x49677b, 1);
            b.fillRect(wx, wy, 10, 14);
            b.lineStyle(2, 0x5d463c, 1);
            b.strokeRect(wx, wy, 10, 14);
          }
        }
      }

    }

    createMilchbuckStation() {
      // Bahnhofsvorplatz / Grünbereich.
      const g = this.add.graphics().setDepth(-1);

      g.fillStyle(0x6f8f62, 1);
      g.fillRect(0, 276, 880, 62);

      // Büsche.
      for (let x = 0; x < 900; x += 44) {
        g.fillStyle((x / 44) % 2 === 0 ? 0x3f7149 : 0x4f8053, 1);
        g.fillCircle(x + 18, 288 + ((x * 7) % 12), 22);
        g.fillCircle(x + 34, 296, 16);
      }

      // Haltestellenunterstand.
      g.fillStyle(0x545d62, 1);
      g.fillRect(314, 174, 8, 116);
      g.fillRect(490, 174, 8, 116);
      g.fillStyle(0x415056, 1);
      g.fillRect(300, 166, 214, 12);
      g.fillStyle(0xb7d6d3, 0.45);
      g.fillRect(326, 182, 160, 92);
      g.lineStyle(4, 0x4c5c60, 1);
      g.strokeRect(326, 182, 160, 92);

      // Bank.
      g.fillStyle(0x8c5e3b, 1);
      g.fillRect(348, 256, 104, 10);
      g.fillRect(358, 266, 8, 22);
      g.fillRect(434, 266, 8, 22);

      // VBZ-artige Tram links, dekorativ und bewusst vereinfacht.
      this.tram = this.add.graphics().setDepth(1);
      const tram = this.tram;
      tram.fillStyle(0xe8eced, 1);
      tram.fillRect(12, 222, 210, 92);
      tram.fillStyle(0x1766a6, 1);
      tram.fillRect(12, 274, 210, 40);
      tram.fillStyle(0x203d4e, 1);
      tram.fillRect(32, 236, 48, 28);
      tram.fillRect(91, 236, 48, 28);
      tram.fillRect(150, 236, 48, 28);
      tram.fillStyle(0x272e31, 1);
      tram.fillCircle(55, 316, 13);
      tram.fillCircle(175, 316, 13);
      tram.lineStyle(4, 0x282d31, 1);
      tram.lineBetween(116, 221, 137, 190);
      tram.lineBetween(137, 190, 160, 221);

      // Sobald Simon ein Ticket besitzt, wird die Tram als nächster
      // Interaktionspunkt freigeschaltet. Die Hitbox ist absichtlich
      // deutlich größer als einzelne Fenster/Türen.
      this.tramHitbox = this.add.zone(117, 262, 226, 118)
        .setDepth(170)
        .setInteractive({ useHandCursor: true });

      this.tramHitbox.input.enabled = false;

      this.tramHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.boardTram();
      });

      // Weißer blinkender Punkt über der mittleren Tür.
      this.tramBoardingMarker = this.add.circle(137, 216, 6, 0xffffff, 1)
        .setStrokeStyle(2, 0xe8f6ff, 0.95)
        .setDepth(175)
        .setVisible(false);

      this.tweens.add({
        targets: this.tramBoardingMarker,
        alpha: { from: 0.2, to: 1 },
        scale: { from: 0.82, to: 1.18 },
        duration: 520,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      // Haltestellenschild – soll unmissverständlich lesbar sein.
      g.fillStyle(0x6b7175, 1);
      g.fillRect(570, 184, 7, 110);
      g.fillStyle(0x1d67a3, 1);
      g.fillRect(537, 154, 73, 31);

      this.add.text(573, 169, "MILCHBUCK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffffff"
      })
        .setOrigin(0.5)
        .setDepth(5);

      this.add.text(573, 205, "7  9  10  14", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#183348",
        backgroundColor: "#f3f2e9",
        padding: { x: 6, y: 5 }
      })
        .setOrigin(0.5)
        .setDepth(5);

      // Kleine Bahnhofsuhr – jetzt sichtbar an einem eigenen Mast befestigt.
      g.fillStyle(0x666d70, 1);
      g.fillRect(667, 194, 6, 102);
      g.fillRect(657, 191, 26, 6);
      g.fillStyle(0xf1efe4, 1);
      g.fillCircle(670, 175, 18);
      g.lineStyle(3, 0x2c3337, 1);
      g.strokeCircle(670, 175, 18);
      g.lineBetween(670, 175, 670, 162);
      g.lineBetween(670, 175, 680, 180);

      // Ticketautomat.
      const ticketMachine = this.add.graphics().setDepth(6);
      ticketMachine.fillStyle(0x2d5f78, 1);
      ticketMachine.fillRect(716, 220, 48, 91);
      ticketMachine.fillStyle(0x183849, 1);
      ticketMachine.fillRect(722, 229, 36, 28);
      ticketMachine.fillStyle(0xa9d8c5, 1);
      ticketMachine.fillRect(728, 235, 24, 15);
      ticketMachine.fillStyle(0xf1c64f, 1);
      ticketMachine.fillRect(728, 268, 24, 8);
      ticketMachine.fillStyle(0x17252e, 1);
      ticketMachine.fillRect(730, 286, 20, 12);
      ticketMachine.lineStyle(3, 0xd7edf2, 0.75);
      ticketMachine.strokeRect(716, 220, 48, 91);

      this.add.text(740, 211, "TICKET", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff3c4",
        backgroundColor: "#244c61",
        padding: { x: 4, y: 3 }
      })
        .setOrigin(0.5)
        .setDepth(7);

      this.ticketHitbox = this.add.zone(740, 254, 66, 78)
        .setDepth(150)
        .setInteractive({ useHandCursor: true });

      this.ticketHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openTicketModal();
      });

      // Kabelmasten + Oberleitung.
      [84, 275, 525, 760].forEach((x) => {
        g.fillStyle(0x73797a, 1);
        g.fillRect(x, 74, 5, 222);
      });

      g.lineStyle(2, 0x454b4f, 1);
      g.lineBetween(0, 98, 900, 115);
      g.lineBetween(0, 127, 900, 90);
      g.lineBetween(85, 82, 280, 115);
      g.lineBetween(280, 115, 530, 82);
      g.lineBetween(530, 82, 765, 112);
      g.lineBetween(765, 112, 900, 94);

      this.add.text(425, 112, "MILCHBUCK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "13px",
        color: "#fff8d9",
        stroke: "#28495b",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(4);
    }

    createStreetAndTracks() {
      const street = this.add.graphics().setDepth(0);

      // Asphalt / Plattform.
      street.fillStyle(0x787c78, 1);
      street.fillRect(0, 298, WORLD_WIDTH, 40);

      // Pflasterkante.
      street.fillStyle(0xb3aa92, 1);
      street.fillRect(0, 324, WORLD_WIDTH, 14);

      // Tramgleise durchziehen – verbindet Milchbuck visuell mit der Stadt.
      street.fillStyle(0x4c4844, 1);
      street.fillRect(0, 305, WORLD_WIDTH, 4);
      street.fillRect(0, 322, WORLD_WIDTH, 4);

      street.fillStyle(0xb8aa8b, 0.55);
      for (let x = 0; x < WORLD_WIDTH; x += 20) {
        street.fillRect(x, 307, 4, 14);
      }

      // Vorderer begehbarer Boden.
      street.fillStyle(0x5b4b3f, 1);
      street.fillRect(0, GROUND_TOP, WORLD_WIDTH, GAME_HEIGHT - GROUND_TOP);

      // Pixelige Steinoberkante.
      const stoneColors = [0x806a55, 0x6f5b4a, 0x8c745b];
      for (let x = 0; x < WORLD_WIDTH; x += 24) {
        street.fillStyle(stoneColors[(x / 24) % stoneColors.length], 1);
        street.fillRect(x, GROUND_TOP, 22, 10);
      }

      street.fillStyle(0x3d342e, 1);
      for (let x = 0; x < WORLD_WIDTH; x += 48) {
        street.fillRect(x + 8, GROUND_TOP + 20, 34, 5);
      }
    }

    createForegroundDetails() {
      // Oberleitung zieht sich in die Stadt weiter.
      const wires = this.add.graphics().setDepth(3);
      wires.lineStyle(2, 0x4a5052, 0.85);

      for (let x = 900; x < WORLD_WIDTH; x += 280) {
        wires.fillStyle(0x72787a, 1);
        wires.fillRect(x, 84, 5, 225);
        wires.lineBetween(x, 92, Math.min(x + 280, WORLD_WIDTH), 110);
      }

      // Straßenlampen.
      for (let x = 1050; x < WORLD_WIDTH; x += 390) {
        const lamp = this.add.graphics().setDepth(2);
        lamp.fillStyle(0x4f5658, 1);
        lamp.fillRect(x, 226, 5, 105);
        lamp.fillRect(x - 4, 220, 13, 7);
        lamp.fillStyle(0xffe7a5, 0.9);
        lamp.fillRect(x - 1, 221, 8, 5);
      }

      // Ein paar Bäume zwischen den Häusern.
      for (let x = 1160; x < WORLD_WIDTH; x += 470) {
        const tree = this.add.graphics().setDepth(1);
        tree.fillStyle(0x65462f, 1);
        tree.fillRect(x, 270, 9, 68);
        tree.fillStyle(0x3f744e, 1);
        tree.fillCircle(x + 4, 255, 28);
        tree.fillStyle(0x53875b, 1);
        tree.fillCircle(x - 14, 267, 18);
        tree.fillCircle(x + 22, 267, 20);
      }
    }

    createHiveClub() {
      const clubX = 1575;
      const clubY = 142;
      const clubW = 250;
      const clubH = GROUND_TOP - clubY;

      const facade = this.add.graphics().setDepth(-2);

      // Dunkle, leicht industrielle Club-Fassade.
      facade.fillStyle(0x18151f, 1);
      facade.fillRect(clubX, clubY, clubW, clubH);

      facade.fillStyle(0x24202e, 1);
      for (let y = clubY + 18; y < GROUND_TOP - 12; y += 28) {
        facade.fillRect(clubX + 8, y, clubW - 16, 4);
      }

      // Neon-Rahmen und Eingang.
      facade.lineStyle(5, 0x9b5cff, 0.9);
      facade.strokeRect(clubX + 67, 215, 116, 123);

      facade.fillStyle(0x08070c, 1);
      facade.fillRect(clubX + 79, 230, 92, 108);

      facade.lineStyle(3, 0x35d9ff, 0.85);
      facade.strokeRect(clubX + 87, 238, 76, 100);

      // Kleine "Fenster" mit farbigem Clublicht.
      [
        [clubX + 18, 190, 32, 55, 0xff477e],
        [clubX + 198, 190, 32, 55, 0x45d8ff]
      ].forEach(([x, y, w, h, color]) => {
        facade.fillStyle(0x0a0910, 1);
        facade.fillRect(x, y, w, h);
        facade.lineStyle(3, color, 0.9);
        facade.strokeRect(x, y, w, h);
      });

      // HIVE-Schild über dem Gebäude.
      const sign = this.add.text(clubX + clubW / 2, 113, "HIVE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "27px",
        color: "#fff4b8",
        stroke: "#6f27a8",
        strokeThickness: 8
      })
        .setOrigin(0.5)
        .setDepth(4);

      this.tweens.add({
        targets: sign,
        alpha: { from: 0.78, to: 1 },
        duration: 650,
        yoyo: true,
        repeat: -1
      });

      // Arcade-Discokugel.
      const disco = this.add.container(clubX + 125, 187).setDepth(4);
      const discoGraphic = this.add.graphics();
      discoGraphic.fillStyle(0xcfd6df, 1);
      discoGraphic.fillCircle(0, 0, 19);
      discoGraphic.lineStyle(2, 0x6b7280, 1);
      discoGraphic.strokeCircle(0, 0, 19);

      for (let yy = -10; yy <= 10; yy += 7) {
        discoGraphic.lineBetween(-16, yy, 16, yy);
      }
      for (let xx = -10; xx <= 10; xx += 7) {
        discoGraphic.lineBetween(xx, -16, xx, 16);
      }

      disco.add(discoGraphic);

      facade.lineStyle(2, 0x4a4652, 1);
      facade.lineBetween(clubX + 125, clubY, clubX + 125, 168);

      const beams = this.add.graphics().setDepth(1);
      beams.fillStyle(0xff4f9a, 0.12);
      beams.fillTriangle(clubX + 125, 188, clubX + 40, GROUND_TOP, clubX + 105, GROUND_TOP);
      beams.fillStyle(0x42d7ff, 0.12);
      beams.fillTriangle(clubX + 125, 188, clubX + 150, GROUND_TOP, clubX + 235, GROUND_TOP);
      beams.fillStyle(0xc876ff, 0.1);
      beams.fillTriangle(clubX + 125, 188, clubX + 95, GROUND_TOP, clubX + 190, GROUND_TOP);

      this.tweens.add({
        targets: disco,
        angle: 360,
        duration: 5200,
        repeat: -1
      });

      // Arcade-Türsteher, angelehnt an das Referenzfoto:
      // sehr kräftig, schwarzes Polo/Hose, kurze dunkle Haare und Vollbart.
      this.createBouncer(clubX + 205, GROUND_TOP - 8);
    }

    createBouncer(x, groundY) {
      const container = this.add.container(x, groundY - 54).setDepth(12);

      const body = this.add.graphics();

      // Beine und Boots.
      body.fillStyle(0x111216, 1);
      body.fillRect(-19, 27, 15, 42);
      body.fillRect(4, 27, 15, 42);
      body.fillStyle(0x08090c, 1);
      body.fillRect(-23, 65, 22, 10);
      body.fillRect(1, 65, 24, 10);

      // Sehr breiter schwarzer Oberkörper / Polo.
      body.fillStyle(0x15161a, 1);
      body.fillRoundedRect(-32, -28, 64, 63, 10);
      body.fillStyle(0x25272d, 1);
      body.fillTriangle(-28, -20, -42, 9, -25, 12);
      body.fillTriangle(28, -20, 42, 9, 25, 12);

      // Hals und Kopf.
      body.fillStyle(0xd1a07f, 1);
      body.fillRect(-8, -38, 16, 12);
      body.fillRoundedRect(-17, -64, 34, 31, 8);

      // Kurzes dunkles Haar.
      body.fillStyle(0x242126, 1);
      body.fillRect(-15, -66, 30, 8);
      body.fillRect(-17, -62, 5, 10);
      body.fillRect(12, -62, 5, 10);

      // Vollbart.
      body.fillStyle(0x30282a, 1);
      body.fillRect(-14, -49, 28, 13);
      body.fillTriangle(-13, -36, 0, -29, 13, -36);

      // Genervter Gesichtsausdruck: zusammengezogene Augenbrauen,
      // kleine Augen und ein sichtbarer schiefer Mund.
      body.lineStyle(3, 0x211b1d, 1);
      body.lineBetween(-12, -60, -4, -57);
      body.lineBetween(4, -57, 12, -60);

      body.fillStyle(0x17171a, 1);
      body.fillRect(-9, -55, 4, 2);
      body.fillRect(5, -55, 4, 2);

      body.lineStyle(2, 0x17171a, 1);
      body.lineBetween(-5, -39, 5, -41);

      // Arme – kräftig und vor dem Körper zusammengeführt.
      body.fillStyle(0xc99473, 1);
      body.fillRoundedRect(-39, -11, 16, 42, 7);
      body.fillRoundedRect(23, -11, 16, 42, 7);
      body.fillRoundedRect(-26, 16, 29, 13, 6);
      body.fillRoundedRect(-3, 16, 29, 13, 6);

      // Polokragen.
      body.fillStyle(0x25272d, 1);
      body.fillTriangle(-10, -27, 0, -16, -1, -28);
      body.fillTriangle(10, -27, 0, -16, 1, -28);

      // Kleine ID-Karte wie im Referenzbild.
      body.fillStyle(0xe8edf0, 1);
      body.fillRect(17, 31, 11, 15);
      body.fillStyle(0x4b555e, 1);
      body.fillRect(19, 34, 7, 2);

      container.add(body);
      container.setSize(88, 148);
      container.setInteractive({ useHandCursor: true });

      container.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        this.startBouncerDialogue();
      });

      container.on("pointerover", () => {
        if (!this.bouncerDialogueActive && !this.ticketModal) {
          container.setScale(1.04);
        }
      });

      container.on("pointerout", () => {
        container.setScale(1);
      });

      this.tweens.add({
        targets: container,
        y: container.y - 2,
        duration: 950,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1
      });

      this.bouncer = container;
    }

    createHUD() {
      const hud = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(300);

      // HP ganz oben links.
      const heart = this.add.graphics();
      const heartPixels = [
        [1,0],[2,0],[4,0],[5,0],
        [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
        [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
        [1,3],[2,3],[3,3],[4,3],[5,3],
        [2,4],[3,4],[4,4],
        [3,5]
      ];

      heart.fillStyle(0xc73c49, 1);
      heartPixels.forEach(([px, py]) => {
        heart.fillRect(10 + px * 3, 8 + py * 3, 3, 3);
      });

      heart.fillStyle(0xff7a82, 1);
      heart.fillRect(13, 11, 3, 3);
      heart.fillRect(16, 11, 3, 3);

      const hpFrame = this.add.graphics();
      hpFrame.fillStyle(0x15171c, 0.9);
      hpFrame.fillRoundedRect(36, 9, 104, 16, 5);
      hpFrame.lineStyle(2, 0xffe3d1, 0.8);
      hpFrame.strokeRoundedRect(36, 9, 104, 16, 5);

      this.hpBarFill = this.add.rectangle(40, 17, 96, 10, 0xd84e57)
        .setOrigin(0, 0.5);

      // Coins direkt unter der HP-Leiste.
      const coin = this.add.graphics();
      coin.fillStyle(0xe2aa28, 1);
      coin.fillCircle(20, 45, 10);
      coin.fillStyle(0xffdf65, 1);
      coin.fillCircle(20, 45, 6);
      coin.fillStyle(0xa66c15, 1);
      coin.fillRect(18, 40, 4, 10);
      coin.lineStyle(2, 0xfff0a0, 0.85);
      coin.strokeCircle(20, 45, 9);

      this.coinText = this.add.text(38, 45, "0", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#fff4cf",
        stroke: "#2a1b0b",
        strokeThickness: 4
      }).setOrigin(0, 0.5);

      hud.add([heart, hpFrame, this.hpBarFill, coin, this.coinText]);

      // ITEMS-Menü oben rechts. Kein separates TICKET-Badge mehr.
      this.itemsButton = this.add.text(GAME_WIDTH - 18, 18, "ITEMS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#fff5d6",
        backgroundColor: "#182333",
        padding: { x: 11, y: 8 }
      })
        .setOrigin(1, 0.5)
        .setScrollFactor(0)
        .setDepth(305)
        .setInteractive({ useHandCursor: true });

      this.itemsButton.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openItemsModal();
      });

      this.itemsTicketBadge = null;

      this.createHotbar();
      this.updateHpBar();
      this.updateInventoryUI();
      this.updateAbilityIndicator();
    }

    updateCoinHUD() {
      if (this.coinText) {
        this.coinText.setText(this.developerMode ? "∞" : String(this.coins));
      }
    }

    updateHpBar() {
      if (!this.hpBarFill) return;

      const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
      this.hpBarFill.displayWidth = 96 * ratio;

      if (ratio > 0.6) {
        this.hpBarFill.setFillStyle(0xd84e57);
      } else if (ratio > 0.25) {
        this.hpBarFill.setFillStyle(0xe68a45);
      } else {
        this.hpBarFill.setFillStyle(0xc33131);
      }
    }

    createTicketIcon(x = 0, y = 0, scale = 1) {
      const icon = this.add.container(x, y);
      const g = this.add.graphics();

      g.fillStyle(0xffe1a1, 1);
      g.fillRoundedRect(-15, -10, 30, 20, 4);
      g.lineStyle(2, 0x6c5230, 1);
      g.strokeRoundedRect(-15, -10, 30, 20, 4);
      g.lineStyle(1, 0xb68b48, 1);
      g.lineBetween(-4, -8, -4, 8);
      g.lineBetween(5, -8, 5, 8);

      const t = this.add.text(10, 0, "T", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#513d25"
      }).setOrigin(0.5);

      icon.add([g, t]);
      icon.setScale(scale);
      return icon;
    }

    getItemDefinition(key) {
      const definitions = {
        gatorade: {
          name: "Gatorade",
          type: "consumable",
          price: 10,
          heal: 10,
          effectLabel: "+10 HP",
          description: "Giftgrünes Gatorade. Regeneriert 10 Leben und wird danach verbraucht."
        },
        monster: {
          name: "Monster Energy",
          type: "consumable",
          price: 30,
          heal: 30,
          effectLabel: "+30 HP",
          description: "Orange Dose Monster Energy. Regeneriert 30 Leben und wird danach verbraucht."
        },
        camel: {
          name: "Zigarette",
          type: "consumable",
          price: 0.5,
          sprintMs: 20000,
          effectLabel: "SPRINT +20 SEK.",
          description: "Eine Zigarette gibt 20 Sekunden Sprint. Rauchst du weitere Zigaretten, wird ihre Zeit zur noch verbleibenden Sprintzeit addiert. Drei Zigaretten ergeben 60 Sekunden Sprint."
        },
        gandhiSticks: {
          name: "Gandhis Wurfstöcke",
          type: "weapon",
          damage: 10,
          cooldownMs: 3000,
          effectLabel: "10 SCHADEN · 3 SEK.",
          description: "Gandhis Wurfstöcke. Aus der Hotbar mit W in Blickrichtung werfen. Ein Treffer verursacht 10 Schaden. Zwischen zwei Würfen liegen mindestens 3 Sekunden."
        },

        bookGeneralRelativity: {
          name: "General Relativity",
          type: "book",
          bookKey: "generalRelativity",
          abilityKey: "wormhole",
          description: "Ein Buch über Allgemeine Relativitätstheorie. Beim ersten Lesen wird die Fähigkeit Wurmloch freigeschaltet."
        },
        bookPhaenomenologie: {
          name: "Phänomenologie des Geistes",
          type: "book",
          bookKey: "phaenomenologie",
          description: "Hegels Phänomenologie des Geistes. Eine spätere Fähigkeit wird mit diesem Buch verknüpft."
        },
        bookPlaybook: {
          name: "The Playbook",
          type: "book",
          bookKey: "playbook",
          description: "The Playbook. Eine spätere Fähigkeit wird mit diesem Buch verknüpft."
        },
        bookZarathustra: {
          name: "Also sprach Zarathustra",
          type: "book",
          bookKey: "zarathustra",
          description: "Nietzsches Also sprach Zarathustra. Eine spätere Fähigkeit wird mit diesem Buch verknüpft."
        }
      };

      return definitions[key] || null;
    }

    getAbilityDefinition(key) {
      const definitions = {
        wormhole: {
          name: "Wurmloch",
          description: "Springe und tippe während Simon in der Luft ist auf einen Punkt der Welt. Ein Wurmloch versetzt ihn dorthin."
        },
        eternalReturn: {
          name: "Ewige Wiederkehr",
          description: "Drücke W. Der Spielzustand springt drei Sekunden zurück. Simon kann danach anders handeln."
        },
        forItself: {
          name: "Für sich sein",
          description: "Drücke F. Simon zieht sich in einen Void zurück und kann dort in Ruhe Items benutzen. Nur einmal alle fünf Minuten."
        }
      };

      return definitions[key] || null;
    }

    getBookItemKey(bookKey) {
      const mapping = {
        generalRelativity: "bookGeneralRelativity",
        phaenomenologie: "bookPhaenomenologie",
        playbook: "bookPlaybook",
        zarathustra: "bookZarathustra"
      };

      return mapping[bookKey] || null;
    }

    getItemCount(key) {
      if (key === "ticket") return this.hasCityTicket ? 1 : 0;

      const definition = this.getItemDefinition(key);
      if (definition?.type === "book") {
        return this.booksOwned?.[definition.bookKey] ? 1 : 0;
      }

      return Math.max(0, Number(this.inventory?.[key]) || 0);
    }

    createWorldItemIcon(key, x = 0, y = 0, scale = 1) {
      if (key === "ticket") {
        return this.createTicketIcon(x, y, scale);
      }

      const icon = this.add.container(x, y);
      const g = this.add.graphics();

      if (key === "gatorade") {
        // Giftgrüne Flasche.
        g.fillStyle(0x15181a, 1);
        g.fillRect(-4, -17, 8, 5);
        g.fillStyle(0xa8ff2d, 1);
        g.fillRect(-6, -13, 12, 7);
        g.fillRoundedRect(-10, -7, 20, 26, 4);
        g.fillStyle(0xd7ff68, 1);
        g.fillRect(-6, -3, 12, 8);
        g.lineStyle(2, 0x33411d, 1);
        g.strokeRoundedRect(-10, -7, 20, 26, 4);
      } else if (key === "monster") {
        // Orange Dose.
        g.fillStyle(0xe97824, 1);
        g.fillRoundedRect(-10, -18, 20, 37, 4);
        g.lineStyle(2, 0x512714, 1);
        g.strokeRoundedRect(-10, -18, 20, 37, 4);
        g.fillStyle(0x1e1d1d, 1);
        g.fillRect(-5, -9, 3, 20);
        g.fillRect(1, -12, 3, 23);
        g.fillRect(6, -7, 2, 17);
        g.fillStyle(0xf2c7a1, 0.85);
        g.fillRect(-7, -15, 14, 2);
      } else if (key === "camel") {
        // Einzelne Zigarette als Item-Symbol, Filter links / Glut rechts.
        g.fillStyle(0xc58a48, 1);
        g.fillRect(-16, -4, 9, 8);
        g.fillStyle(0xf3efe2, 1);
        g.fillRoundedRect(-7, -4, 23, 8, 2);
        g.fillStyle(0xe34f35, 1);
        g.fillRect(16, -3, 3, 6);
        g.lineStyle(1, 0x675b48, 1);
        g.strokeRoundedRect(-16, -4, 32, 8, 2);
      } else if (key === "gandhiSticks") {
        // Zwei gekreuzte dunkle Wurfstöcke.
        g.lineStyle(5, 0x5a3622, 1);
        g.lineBetween(-15, 12, 15, -12);
        g.lineBetween(-15, -12, 15, 12);
        g.lineStyle(2, 0xd9b26a, 1);
        g.lineBetween(-11, 8, 11, -10);
        g.lineBetween(-11, -8, 11, 10);
      } else if (this.getItemDefinition(key)?.type === "book") {
        const bookColors = {
          bookGeneralRelativity: 0x355f85,
          bookPhaenomenologie: 0x694c78,
          bookPlaybook: 0x9a6739,
          bookZarathustra: 0x8e3038
        };

        g.fillStyle(bookColors[key] || 0x5b4d42, 1);
        g.fillRoundedRect(-14, -18, 28, 36, 3);
        g.fillStyle(0xe6d8ba, 1);
        g.fillRect(-9, -13, 18, 4);
        g.fillRect(-9, -5, 14, 2);
        g.fillRect(-9, 1, 17, 2);
        g.lineStyle(2, 0x2d2926, 1);
        g.strokeRoundedRect(-14, -18, 28, 36, 3);
        g.lineBetween(-8, -18, -8, 18);
      }

      icon.add(g);
      icon.setScale(scale);
      return icon;
    }

    createDOMItemIcon(key, size = 44) {
      const outer = document.createElement("div");

      Object.assign(outer.style, {
        width: `${size}px`,
        height: `${size}px`,
        display: "grid",
        placeItems: "center",
        margin: "0 auto",
        position: "relative",
        flex: "0 0 auto"
      });

      if (key === "ticket") {
        const ticket = document.createElement("div");
        Object.assign(ticket.style, {
          width: "34px",
          height: "23px",
          background: "#ffe1a1",
          border: "2px solid #6c5230",
          borderRadius: "5px",
          boxSizing: "border-box",
          position: "relative"
        });

        const cut = document.createElement("div");
        Object.assign(cut.style, {
          position: "absolute",
          left: "10px",
          top: "2px",
          bottom: "2px",
          borderLeft: "2px dashed #b68b48"
        });

        ticket.appendChild(cut);
        outer.appendChild(ticket);
        return outer;
      }

      if (key === "gatorade") {
        const bottle = document.createElement("div");
        Object.assign(bottle.style, {
          width: "20px",
          height: "31px",
          marginTop: "8px",
          background: "#a8ff2d",
          border: "2px solid #33411d",
          borderRadius: "5px 5px 6px 6px",
          position: "relative",
          boxSizing: "border-box"
        });

        const neck = document.createElement("div");
        Object.assign(neck.style, {
          position: "absolute",
          left: "4px",
          top: "-9px",
          width: "8px",
          height: "9px",
          background: "#a8ff2d",
          border: "2px solid #33411d",
          borderBottom: "0"
        });

        const label = document.createElement("div");
        Object.assign(label.style, {
          position: "absolute",
          left: "3px",
          right: "3px",
          top: "9px",
          height: "8px",
          background: "#d7ff68"
        });

        bottle.append(neck, label);
        outer.appendChild(bottle);
        return outer;
      }

      if (key === "monster") {
        const can = document.createElement("div");
        Object.assign(can.style, {
          width: "21px",
          height: "37px",
          background: "#e97824",
          border: "2px solid #512714",
          borderRadius: "5px",
          boxSizing: "border-box",
          color: "#1d1b1b",
          display: "grid",
          placeItems: "center",
          fontFamily: "monospace",
          fontWeight: "900",
          fontSize: "16px"
        });
        can.textContent = "M";
        outer.appendChild(can);
        return outer;
      }

      if (key === "camel") {
        const cigarette = document.createElement("div");
        Object.assign(cigarette.style, {
          width: "34px",
          height: "8px",
          background: "#f3efe2",
          border: "1px solid #675b48",
          borderRadius: "3px",
          boxSizing: "border-box",
          position: "relative"
        });

        const filter = document.createElement("span");
        Object.assign(filter.style, {
          position: "absolute",
          left: "-1px",
          top: "-1px",
          width: "10px",
          height: "8px",
          background: "#c58a48",
          borderRight: "1px solid #795730",
          boxSizing: "border-box"
        });

        const ember = document.createElement("span");
        Object.assign(ember.style, {
          position: "absolute",
          right: "-4px",
          top: "1px",
          width: "4px",
          height: "4px",
          background: "#e34f35",
          boxShadow: "0 0 3px #ff8950"
        });

        cigarette.append(filter, ember);
        outer.appendChild(cigarette);
        return outer;
      }

      if (key === "gandhiSticks") {
        const weapon = document.createElement("div");
        Object.assign(weapon.style, {
          width: "38px",
          height: "38px",
          position: "relative"
        });

        [-1, 1].forEach((direction) => {
          const stick = document.createElement("span");
          Object.assign(stick.style, {
            position: "absolute",
            left: "17px",
            top: "3px",
            width: "5px",
            height: "32px",
            borderRadius: "3px",
            background: "#5a3622",
            border: "1px solid #d9b26a",
            transformOrigin: "50% 50%",
            transform: `rotate(${direction * 43}deg)`
          });
          weapon.appendChild(stick);
        });

        outer.appendChild(weapon);
        return outer;
      }

      const bookDefinition = this.getItemDefinition(key);
      if (bookDefinition?.type === "book") {
        const colors = {
          bookGeneralRelativity: "#355f85",
          bookPhaenomenologie: "#694c78",
          bookPlaybook: "#9a6739",
          bookZarathustra: "#8e3038"
        };

        const abbreviations = {
          bookGeneralRelativity: "GR",
          bookPhaenomenologie: "PH",
          bookPlaybook: "PB",
          bookZarathustra: "AZ"
        };

        const book = document.createElement("div");
        Object.assign(book.style, {
          width: "29px",
          height: "38px",
          background: colors[key] || "#5b4d42",
          border: "2px solid #302a26",
          borderRadius: "3px",
          boxSizing: "border-box",
          boxShadow: "4px 0 0 rgba(32,28,25,.35)",
          display: "grid",
          placeItems: "center",
          color: "#fff2cf",
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          position: "relative"
        });
        book.textContent = abbreviations[key] || "B";

        const spine = document.createElement("span");
        Object.assign(spine.style, {
          position: "absolute",
          left: "4px",
          top: "0",
          bottom: "0",
          width: "2px",
          background: "rgba(255,240,210,.55)"
        });
        book.appendChild(spine);

        outer.appendChild(book);
        return outer;
      }

      return outer;
    }

    createHotbar() {
      this.hotbarItems = Array.isArray(this.hotbarItems)
        ? this.hotbarItems.slice(0, HOTBAR_SIZE)
        : Array(HOTBAR_SIZE).fill(null);

      while (this.hotbarItems.length < HOTBAR_SIZE) {
        this.hotbarItems.push(null);
      }

      this.selectedHotbarIndex = Phaser.Math.Clamp(
        Number.isInteger(this.selectedHotbarIndex) ? this.selectedHotbarIndex : 0,
        0,
        HOTBAR_SIZE - 1
      );

      this.refreshHotbar();
    }

    cleanupHotbarDOM() {
      const root = document.getElementById("phaser-game");
      root?.querySelectorAll("[data-simon-ui='hotbar']")
        .forEach((node) => node.remove());
      this.hotbarDOM = null;
    }

    refreshHotbar() {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      this.cleanupHotbarDOM();

      this.hotbarItems = Array.isArray(this.hotbarItems)
        ? this.hotbarItems.slice(0, HOTBAR_SIZE)
        : Array(HOTBAR_SIZE).fill(null);

      while (this.hotbarItems.length < HOTBAR_SIZE) {
        this.hotbarItems.push(null);
      }

      this.hotbarItems = this.hotbarItems.map((key) => {
        if (!key) return null;
        if (key === "ticket") return this.hasCityTicket ? key : null;
        return this.getItemCount(key) > 0 ? key : null;
      });

      this.selectedHotbarIndex = Phaser.Math.Clamp(
        this.selectedHotbarIndex,
        0,
        HOTBAR_SIZE - 1
      );

      const bar = document.createElement("div");
      bar.dataset.simonUi = "hotbar";

      Object.assign(bar.style, {
        position: "absolute",
        left: "50%",
        bottom: "6px",
        transform: "translateX(-50%)",
        zIndex: "99980",
        display: "grid",
        gridTemplateColumns: `repeat(${HOTBAR_SIZE}, 44px)`,
        gap: "4px",
        padding: "5px",
        border: "2px solid rgba(225,213,177,.75)",
        background: "rgba(17,20,24,.90)",
        boxSizing: "border-box",
        pointerEvents: this.uiLocked ? "none" : "auto",
        touchAction: "manipulation"
      });

      for (let index = 0; index < HOTBAR_SIZE; index += 1) {
        const key = this.hotbarItems[index];
        const selected = index === this.selectedHotbarIndex;

        const slot = document.createElement("button");
        slot.type = "button";

        Object.assign(slot.style, {
          appearance: "none",
          WebkitAppearance: "none",
          position: "relative",
          width: "44px",
          height: "44px",
          padding: "2px",
          border: selected ? "4px solid #ffe98a" : "2px solid #858585",
          background: selected ? "#514a35" : "#292b2d",
          boxSizing: "border-box",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          overflow: "hidden"
        });

        if (key) {
          const icon = this.createDOMItemIcon(key, 34);
          icon.style.pointerEvents = "none";
          icon.style.transform = "scale(.78)";
          slot.appendChild(icon);

          const count = this.getItemCount(key);
          if (key !== "ticket" && count > 1) {
            const qty = document.createElement("span");
            qty.textContent = String(count);
            Object.assign(qty.style, {
              position: "absolute",
              right: "2px",
              bottom: "1px",
              color: "#fff",
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "6px",
              textShadow: "1px 1px 0 #000"
            });
            slot.appendChild(qty);
          }
        }

        let lastTap = -Infinity;
        const select = (event) => {
          const now = performance.now();

          event?.preventDefault?.();
          event?.stopPropagation?.();

          if (now - lastTap < 300) return;
          lastTap = now;

          if (this.uiLocked || this.playerDying || this.drinkingItem) return;

          this.selectedHotbarIndex = index;
          this.refreshHotbar();
        };

        slot.addEventListener("touchend", select, { passive: false });
        slot.addEventListener("pointerup", select, { passive: false });
        slot.addEventListener("click", select, { passive: false });

        bar.appendChild(slot);
      }

      root.appendChild(bar);
      this.hotbarDOM = bar;
      this.updateHotbarActionUI();
    }

    selectHotbarSlot(index) {
      this.selectedHotbarIndex = Phaser.Math.Clamp(index, 0, HOTBAR_SIZE - 1);
      this.refreshHotbar();
    }

    updateHotbarActionUI() {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='hotbar-action']")
        .forEach((node) => node.remove());

      this.hotbarActionUI = null;

      this.refreshAbilityTouchControl?.();
      this.refreshWeaponTouchControl?.();

      if (
        this.uiLocked ||
        this.drinkingItem ||
        this.playerDying ||
        !this.player?.visible
      ) {
        return;
      }

      const key = this.hotbarItems?.[this.selectedHotbarIndex];
      const item = this.getItemDefinition(key);

      const isConsumable = ["gatorade", "monster", "camel"].includes(key);
      const isBook = item?.type === "book";

      if (!isConsumable && !isBook) return;
      if (this.getItemCount(key) <= 0) return;
      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "hotbar-action";

      Object.assign(wrapper.style, {
        position: "absolute",
        left: "50%",
        bottom: "62px",
        transform: "translateX(-50%)",
        zIndex: "99990",
        pointerEvents: "auto",
        touchAction: "manipulation"
      });

      const actionLabel = isBook
        ? `LESEN · ${item.name.toUpperCase()}`
        : (
            key === "camel"
              ? `RAUCHEN · ${item.name.toUpperCase()}`
              : `TRINKEN · ${item.name.toUpperCase()}`
          );

      const drink = this.createDOMButton(
        actionLabel,
        () => this.consumeSelectedHotbarItem(),
        {
          color: "#f4ffe5",
          background: "#38522d",
          border: "#b7e47d",
          width: "190px",
          minHeight: "38px",
          fontSize: "6px",
          padding: "6px 8px"
        }
      );

      wrapper.appendChild(drink);
      root.appendChild(wrapper);
      this.hotbarActionUI = { overlay: wrapper };
    }

    updateInventoryUI() {
      // No separate TICKET label under ITEMS. The valid one-trip ticket is
      // represented only by its hotbar slot / tram state.
      this.refreshHotbar();
    }

    addItemToHotbar(key) {
      if (!key || this.getItemCount(key) <= 0) return false;

      const existing = this.hotbarItems.indexOf(key);
      if (existing >= 0) return true;

      const free = this.hotbarItems.findIndex((item) => !item);
      if (free < 0) return false;

      this.hotbarItems[free] = key;
      this.refreshHotbar();
      return true;
    }

    removeItemFromHotbar(key) {
      this.hotbarItems = this.hotbarItems.map((item) => item === key ? null : item);
      this.refreshHotbar();
    }

    toggleItemInHotbar(key) {
      const existing = this.hotbarItems.indexOf(key);

      if (existing >= 0) {
        this.hotbarItems[existing] = null;
        this.refreshHotbar();
        return "removed";
      }

      return this.addItemToHotbar(key) ? "added" : "full";
    }

    equipTicketToHotbar() {
      return this.addItemToHotbar("ticket");
    }

    equipItemToHotbar(key) {
      const item = this.getItemDefinition(key);

      if (
        !["gatorade", "monster", "camel"].includes(key) &&
        item?.type !== "book" &&
        item?.type !== "weapon"
      ) {
        return false;
      }

      return this.addItemToHotbar(key);
    }

    consumeSelectedHotbarItem() {
      this.consumeHotbarItem(this.selectedHotbarIndex);
    }

    consumeHotbarItem(index) {
      if (
        this.uiLocked ||
        this.drinkingItem ||
        this.playerDying ||
        !this.player?.visible
      ) {
        return;
      }

      const key = this.hotbarItems[index];
      const item = this.getItemDefinition(key);

      if (!item || this.getItemCount(key) <= 0) return;

      if (item.type === "book") {
        this.playBookReadingAnimation(key);
        return;
      }

      if (!["gatorade", "monster", "camel"].includes(key)) return;

      if (key === "camel") {
        this.playSmokeAnimation();
        return;
      }

      this.playDrinkAnimation(key);
    }

    playDrinkAnimation(key) {
      const item = this.getItemDefinition(key);
      if (!item || this.getItemCount(key) <= 0) return;

      this.drinkingItem = true;
      this.updateHotbarActionUI();
      this.refreshUILock();

      this.player.setVelocity(0, 0);
      this.player.anims.stop();

      const direction = this.facing < 0 ? -1 : 1;
      const startX = this.player.x + direction * 28;
      const startY = this.player.y - 52;
      const icon = this.createWorldItemIcon(key, startX, startY, 0.85)
        .setDepth(this.getActionEffectDepth(55));

      const originalAngle = this.player.angle;

      this.tweens.add({
        targets: this.player,
        angle: -direction * 6,
        y: this.player.y - 3,
        duration: 220,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: icon,
        x: this.player.x + direction * 8,
        y: this.player.y - 84,
        angle: direction * 72,
        duration: 330,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.tweens.add({
            targets: icon,
            y: icon.y + 4,
            angle: direction * 95,
            duration: 210,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              this.inventory[key] = Math.max(0, this.getItemCount(key) - 1);

              const oldHp = this.hp;
              this.hp = Math.min(this.maxHp, this.hp + item.heal);
              const healed = this.hp - oldHp;
              this.updateHpBar();

              if (this.getItemCount(key) <= 0) {
                this.removeItemFromHotbar(key);
              } else {
                this.refreshHotbar();
              }

              const healText = this.add.text(
                this.player.x,
                this.player.y - 98,
                `+${healed} HP`,
                {
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "8px",
                  color: "#b9ff8b",
                  stroke: "#24411d",
                  strokeThickness: 4
                }
              )
                .setOrigin(0.5)
                .setDepth(this.getActionEffectDepth(70));

              this.tweens.add({
                targets: healText,
                y: healText.y - 22,
                alpha: 0,
                duration: 780,
                onComplete: () => healText.destroy()
              });

              icon.destroy(true);
              this.player.setAngle(originalAngle);
              this.player.play("simon-idle", true);

              this.drinkingItem = false;
              this.updateInventoryUI();
              this.refreshUILock();
            }
          });
        }
      });
    }

    playBookReadingAnimation(itemKey) {
      const item = this.getItemDefinition(itemKey);

      if (
        item?.type !== "book" ||
        this.getItemCount(itemKey) <= 0 ||
        this.readingBook ||
        this.drinkingItem ||
        this.playerDying ||
        !this.player?.visible
      ) {
        return;
      }

      this.readingBook = true;
      this.refreshUILock();

      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.player.play("simon-idle", true);

      const direction = this.facing < 0 ? -1 : 1;
      const book = this.add.container(
        this.player.x + direction * 22,
        this.player.y - 58
      ).setDepth(this.getActionEffectDepth(90));

      const pages = this.add.graphics();
      pages.fillStyle(0xf6edcf, 1);
      pages.fillRoundedRect(-26, -17, 23, 34, 3);
      pages.fillRoundedRect(3, -17, 23, 34, 3);
      pages.lineStyle(2, 0x665648, 1);
      pages.strokeRoundedRect(-26, -17, 23, 34, 3);
      pages.strokeRoundedRect(3, -17, 23, 34, 3);
      pages.lineBetween(0, -16, 0, 17);

      for (const y of [-9, -3, 3, 9]) {
        pages.lineStyle(1, 0xb8a98e, 0.8);
        pages.lineBetween(-21, y, -7, y);
        pages.lineBetween(7, y, 21, y);
      }

      const cover = this.add.graphics();
      cover.lineStyle(4, 0x355f85, 1);
      cover.strokeRoundedRect(-29, -20, 58, 40, 4);
      book.add([cover, pages]);

      const readingText = this.add.text(
        this.player.x,
        this.player.y - 105,
        "LESEN...",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#fff0bd",
          stroke: "#2b2723",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(this.getActionEffectDepth(92));

      const pageFlip = this.add.rectangle(
        book.x + direction * 2,
        book.y,
        19,
        31,
        0xfff7dc,
        0.92
      )
        .setOrigin(direction > 0 ? 0 : 1, 0.5)
        .setDepth(this.getActionEffectDepth(91));

      // All animation cycles finish before the cleanup callback. The previous
      // implementation destroyed tween targets while their repeat loops were
      // still running, which could leave the Bahnhof scene locked on mobile.
      this.tweens.add({
        targets: book,
        y: book.y - 5,
        angle: { from: -3, to: 3 },
        duration: 220,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: pageFlip,
        scaleX: { from: 1, to: 0.08 },
        alpha: { from: 0.95, to: 0.25 },
        duration: 250,
        yoyo: true,
        repeat: 2,
        ease: "Quad.easeInOut"
      });

      this.tweens.add({
        targets: this.player,
        angle: { from: -2, to: 2 },
        duration: 230,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut"
      });

      const finishReading = () => {
        if (!this.readingBook) return;

        try {
          this.tweens.killTweensOf(book);
          this.tweens.killTweensOf(pageFlip);
          this.tweens.killTweensOf(this.player);

          book?.destroy?.(true);
          pageFlip?.destroy?.();
          readingText?.destroy?.();

          if (this.player?.active) {
            this.player.setAngle(0);
            this.player.setAlpha(1);
            this.player.play("simon-idle", true);
          }

          let unlockedAbilityName = null;

          if (
            item.bookKey === "generalRelativity" &&
            !this.booksRead.generalRelativity
          ) {
            this.booksRead.generalRelativity = true;
            this.abilitiesUnlocked.wormhole = true;
            unlockedAbilityName = "Wurmloch";
          } else if (
            item.bookKey === "zarathustra" &&
            !this.booksRead.zarathustra
          ) {
            this.booksRead.zarathustra = true;
            this.abilitiesUnlocked.eternalReturn = true;
            unlockedAbilityName = "Ewige Wiederkehr";
          } else if (
            item.bookKey === "phaenomenologie" &&
            !this.booksRead.phaenomenologie
          ) {
            this.booksRead.phaenomenologie = true;
            this.abilitiesUnlocked.forItself = true;
            unlockedAbilityName = "Für sich sein";
          }

          if (unlockedAbilityName) {
            this.showAbilityUnlockedBanner(unlockedAbilityName);
          }
        } catch (error) {
          console.error("Buch-Leseanimation konnte nicht sauber abgeschlossen werden:", error);
        } finally {
          this.readingBook = false;
          this.refreshUILock();
          this.updateAbilityIndicator();
          this.updateInventoryUI();

          // Hard recovery: reading a book must never leave Simon frozen.
          if (
            this.player?.active &&
            !this.playerDying &&
            !this.bookstoreOverlay &&
            !this.indianStoreOverlay &&
            !this.itemsModal
          ) {
            this.player.setVisible(true);
            if (this.player.body) {
              this.player.body.enable = true;
              this.player.body.moves = true;
            }
            this.setUILocked(false);
            this.setControlsVisible(true);
          }
        }
      };

      this.time.delayedCall(1600, () => {
        if (!this.sys?.isActive?.()) return;
        finishReading();
      });

      // Independent fallback in case a browser loses a delayed callback while
      // changing focus/orientation.
      window.setTimeout(() => {
        if (
          this.readingBook &&
          this.sys?.isActive?.()
        ) {
          finishReading();
        }
      }, 2300);
    }

    showAbilityUnlockedBanner(abilityName) {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      this.abilityUnlockBannerDOM?.remove?.();

      const banner = document.createElement("div");
      banner.dataset.simonUi = "ability-unlock-banner";
      banner.textContent = `FÄHIGKEIT FREIGESCHALTET · ${abilityName.toUpperCase()}`;

      Object.assign(banner.style, {
        position: "absolute",
        left: "50%",
        top: "48px",
        transform: "translateX(-50%)",
        zIndex: "100050",
        maxWidth: "78%",
        padding: "9px 12px",
        border: "3px solid #bda6ff",
        background: "rgba(34, 22, 58, .95)",
        color: "#fff1c9",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        lineHeight: "1.5",
        textAlign: "center",
        boxShadow: "0 4px 0 rgba(14, 8, 25, .75)",
        pointerEvents: "none"
      });

      root.appendChild(banner);
      this.abilityUnlockBannerDOM = banner;

      window.setTimeout(() => {
        if (this.abilityUnlockBannerDOM === banner) {
          banner.remove();
          this.abilityUnlockBannerDOM = null;
        }
      }, 3000);
    }

    createDOMAbilityIcon(key, size = 40) {
      const outer = document.createElement("div");

      Object.assign(outer.style, {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        boxSizing: "border-box",
        position: "relative",
        flex: "0 0 auto"
      });

      if (key === "wormhole") {
        Object.assign(outer.style, {
          background:
            "radial-gradient(circle, #07040e 0 27%, #724dd2 31% 45%, #62c8ff 50% 59%, #2a153f 63% 100%)",
          border: "2px solid #d8c9ff",
          boxShadow: "0 0 8px #7054cf"
        });
        return outer;
      }

      if (key === "eternalReturn") {
        Object.assign(outer.style, {
          background:
            "radial-gradient(circle, #17100a 0 35%, #513b1c 37% 54%, #d6b34e 57% 63%, #21170d 66% 100%)",
          border: "2px solid #f0d67b",
          boxShadow: "0 0 8px rgba(224,183,76,.72)",
          color: "#fff0a5",
          fontFamily: "Georgia, serif",
          fontSize: `${Math.round(size * 0.66)}px`,
          fontWeight: "700",
          lineHeight: "1"
        });
        outer.textContent = "↻";
        return outer;
      }

      if (key === "forItself") {
        Object.assign(outer.style, {
          background:
            "radial-gradient(circle, #050608 0 48%, #19202b 51% 68%, #080a0e 72% 100%)",
          border: "2px solid #dce5ef",
          boxShadow: "0 0 8px rgba(190,210,235,.42)"
        });

        const figure = document.createElement("div");
        Object.assign(figure.style, {
          width: `${Math.max(4, Math.round(size * 0.12))}px`,
          height: `${Math.round(size * 0.34)}px`,
          background: "#edf2f6",
          borderRadius: "50% 50% 3px 3px",
          position: "relative"
        });

        const head = document.createElement("span");
        Object.assign(head.style, {
          position: "absolute",
          width: `${Math.round(size * 0.16)}px`,
          height: `${Math.round(size * 0.16)}px`,
          borderRadius: "50%",
          background: "#edf2f6",
          left: "50%",
          top: `${-Math.round(size * 0.15)}px`,
          transform: "translateX(-50%)"
        });

        figure.appendChild(head);
        outer.appendChild(figure);
        return outer;
      }

      return outer;
    }

    cleanupAbilityTouchControl() {
      const doomed = new Set(this.abilityControlObjects || []);

      (this.abilityControlObjects || []).forEach((object) => {
        object?.destroy?.();
      });

      this.controlObjects = (this.controlObjects || [])
        .filter((object) => !doomed.has(object));

      this.abilityControlObjects = [];
      this.abilityCooldownText = null;
    }

    refreshAbilityTouchControl() {
      this.cleanupAbilityTouchControl();

      if (
        this.uiLocked ||
        this.inVoid ||
        this.rewindActive ||
        !this.player?.visible
      ) {
        return;
      }

      if (
        this.activeAbility !== "eternalReturn" &&
        this.activeAbility !== "forItself"
      ) {
        return;
      }

      const label =
        this.activeAbility === "eternalReturn"
          ? "W"
          : "F";
      const weaponSelected = this.isThrowingSticksSelected?.() || false;
      const abilityX = weaponSelected
        ? GAME_WIDTH - 176
        : GAME_WIDTH - 100;

      const button = this.makeTouchButton(
        abilityX,
        GAME_HEIGHT - 137,
        label,
        () => {
          if (this.activeAbility === "eternalReturn") {
            this.rewindGameThreeSeconds();
          } else if (this.activeAbility === "forItself") {
            this.enterForItselfVoid();
          }
        },
        () => {}
      );

      button.circle.setScale(0.88);
      button.text.setScale(0.88);

      this.abilityControlObjects.push(button.circle, button.text);

      if (weaponSelected) {
        const abilityCaption = this.add.text(
          abilityX,
          GAME_HEIGHT - 179,
          this.activeAbility === "eternalReturn" ? "ZEIT" : "VOID",
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            color: "#d8caff",
            stroke: "#14101c",
            strokeThickness: 3
          }
        )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1002);

        this.controlObjects.push(abilityCaption);
        this.abilityControlObjects.push(abilityCaption);
      }

      if (this.activeAbility === "forItself") {
        const cooldown = this.add.text(
          abilityX,
          GAME_HEIGHT - 181,
          "",
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            color: "#e6edf5",
            stroke: "#10151b",
            strokeThickness: 3
          }
        )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(1002);

        this.controlObjects.push(cooldown);
        this.abilityControlObjects.push(cooldown);
        this.abilityCooldownText = cooldown;
        this.updateAbilityCooldownLabel();
      }
    }

    isThrowingSticksSelected() {
      return (
        this.hotbarItems?.[this.selectedHotbarIndex] === "gandhiSticks" &&
        this.getItemCount("gandhiSticks") > 0
      );
    }

    cleanupWeaponTouchControl() {
      const doomed = new Set(this.weaponControlObjects || []);

      (this.weaponControlObjects || []).forEach((object) => {
        object?.destroy?.();
      });

      this.controlObjects = (this.controlObjects || [])
        .filter((object) => !doomed.has(object));

      this.weaponControlObjects = [];
    }

    refreshWeaponTouchControl() {
      this.cleanupWeaponTouchControl();

      if (
        !this.isThrowingSticksSelected() ||
        this.uiLocked ||
        this.inVoid ||
        this.rewindActive ||
        this.playerDying ||
        !this.player?.visible
      ) {
        return;
      }

      const button = this.makeTouchButton(
        GAME_WIDTH - 100,
        GAME_HEIGHT - 137,
        "W",
        () => this.throwGandhiStick(),
        () => {}
      );

      button.circle.setScale(0.88);
      button.text.setScale(0.88);

      const caption = this.add.text(
        GAME_WIDTH - 100,
        GAME_HEIGHT - 179,
        "WURF",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#ffe1a7",
          stroke: "#17120e",
          strokeThickness: 3
        }
      )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1002);

      this.controlObjects.push(caption);
      this.weaponControlObjects.push(
        button.circle,
        button.text,
        caption
      );
    }

    throwGandhiStick() {
      const item = this.getItemDefinition("gandhiSticks");

      if (
        !item ||
        !this.isThrowingSticksSelected() ||
        this.uiLocked ||
        this.playerDying ||
        this.inVoid ||
        this.rewindActive ||
        !this.player?.body ||
        !this.player.visible
      ) {
        return false;
      }

      const now = Date.now();
      if (now < this.throwingStickCooldownUntil) {
        const remaining = Math.max(
          1,
          Math.ceil((this.throwingStickCooldownUntil - now) / 1000)
        );
        this.showAbilityStatusMessage?.(
          `WURFSTÖCKE · NOCH ${remaining} SEK.`
        );
        return false;
      }

      this.throwingStickCooldownUntil =
        now + (Number(item.cooldownMs) || 3000);

      const direction = this.facing < 0 ? -1 : 1;
      const stick = this.add.rectangle(
        this.player.x + direction * 32,
        this.player.y - 48,
        36,
        6,
        0x5a3622,
        1
      )
        .setDepth(95)
        .setAngle(direction > 0 ? -22 : 22);

      stick.setStrokeStyle?.(2, 0xd9b26a, 1);
      stick.__gandhiThrowingStick = true;
      stick.__damage = 10;
      stick.__hit = false;
      stick.__spinDirection = direction;

      this.physics.add.existing(stick);
      stick.body.setAllowGravity(false);
      stick.body.setSize(36, 10);
      stick.body.setVelocityX(direction * 360);
      stick.body.setVelocityY(-12);

      this.throwingStickProjectiles.push(stick);

      if (this.milkmanFightActive && this.milkman?.active) {
        this.physics.add.overlap(
          stick,
          this.milkman,
          () => this.hitMilkmanWithThrownStick(stick),
          null,
          this
        );
      }

      if (this.darkGandhiBossActive && this.gandhi?.active) {
        this.physics.add.overlap(
          stick,
          this.gandhi,
          () => this.hitDarkGandhiWithThrownStick(stick),
          null,
          this
        );
      }

      return true;
    }

    hitMilkmanWithThrownStick(stick) {
      if (
        !stick?.active ||
        stick.__hit ||
        !this.milkmanFightActive ||
        !this.milkman?.active ||
        this.milkmanDefeated
      ) {
        return;
      }

      stick.__hit = true;
      stick.destroy();

      this.milkmanHp = Math.max(
        0,
        this.milkmanHp - 10
      );
      this.updateMilkmanHealthBar?.();
      this.showImpact(
        this.milkman.x,
        this.milkman.y - 60,
        "WURFSTOCK −10"
      );

      if (this.milkmanHp <= 0) {
        this.defeatMilkman?.();
      }
    }

    hitDarkGandhiWithThrownStick(stick) {
      if (
        !stick?.active ||
        stick.__hit ||
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        return;
      }

      stick.__hit = true;
      stick.destroy();

      // Wurfstöcke deal the same fixed damage as Simon's normal hit.
      this.applyDarkGandhiDamage?.(
        10,
        this.time.now,
        "WURFSTOCK −10"
      );
    }

    updateThrowingStickProjectiles(delta) {
      this.throwingStickProjectiles =
        (this.throwingStickProjectiles || []).filter((stick) => {
          if (!stick?.active) return false;

          stick.angle +=
            (Number(stick.__spinDirection) || 1) *
            Math.max(1, Number(delta) || 16) * 0.55;

          const tooFar =
            stick.x < this.cameras.main.worldView.left - 180 ||
            stick.x > this.cameras.main.worldView.right + 180;

          if (tooFar) {
            stick.destroy();
            return false;
          }

          return true;
        });
    }

    updateAbilityCooldownLabel() {
      if (
        !this.abilityCooldownText ||
        this.activeAbility !== "forItself"
      ) {
        return;
      }

      const remaining = Math.max(
        0,
        this.forItselfCooldownUntil - Date.now()
      );

      if (remaining <= 0) {
        this.abilityCooldownText.setText("BEREIT");
        this.abilityCooldownText.setColor("#c9ffd2");
        return;
      }

      const totalSeconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      this.abilityCooldownText.setText(
        `${minutes}:${String(seconds).padStart(2, "0")}`
      );
      this.abilityCooldownText.setColor("#ffd6aa");
    }

    cleanupAbilityIndicator() {
      this.cleanupAbilityTouchControl();
      this.cleanupWeaponTouchControl?.();

      this.abilityIndicatorDOM?.remove?.();
      this.abilityIndicatorDOM = null;

      const root = document.getElementById("phaser-game");
      root?.querySelectorAll(
        "[data-simon-ui='ability-indicator'], [data-simon-ui='ability-unlock-banner'], [data-simon-ui='ability-status-banner']"
      ).forEach((node) => node.remove());

      this.abilityUnlockBannerDOM = null;
    }

    updateAbilityIndicator() {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='ability-indicator']")
        .forEach((node) => node.remove());

      this.abilityIndicatorDOM = null;

      if (
        !this.activeAbility ||
        !this.abilitiesUnlocked?.[this.activeAbility]
      ) {
        this.refreshAbilityTouchControl();
        return;
      }

      const ability = this.getAbilityDefinition(this.activeAbility);
      if (!ability) {
        this.refreshAbilityTouchControl();
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "ability-indicator";
      wrapper.setAttribute(
        "aria-label",
        `Aktive Fähigkeit: ${ability.name}`
      );

      Object.assign(wrapper.style, {
        position: "absolute",
        left: "50%",
        top: "9px",
        transform: "translateX(-50%)",
        zIndex: "99972",
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "rgba(17,13,28,.72)",
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        boxSizing: "border-box"
      });

      wrapper.appendChild(
        this.createDOMAbilityIcon(this.activeAbility, 32)
      );

      root.appendChild(wrapper);
      this.abilityIndicatorDOM = wrapper;
      this.refreshAbilityTouchControl();
    }

    showAbilityStatusMessage(message, duration = 1300) {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='ability-status-banner']")
        .forEach((node) => node.remove());

      const banner = document.createElement("div");
      banner.dataset.simonUi = "ability-status-banner";
      banner.textContent = message;

      Object.assign(banner.style, {
        position: "absolute",
        left: "50%",
        top: "56px",
        transform: "translateX(-50%)",
        zIndex: "100051",
        maxWidth: "76%",
        padding: "8px 10px",
        border: "2px solid #baa8dd",
        background: "rgba(22,17,34,.94)",
        color: "#fff0c8",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        lineHeight: "1.5",
        textAlign: "center",
        pointerEvents: "none"
      });

      root.appendChild(banner);

      window.setTimeout(() => banner.remove(), duration);
    }

    equipAbility(key) {
      if (!this.abilitiesUnlocked?.[key]) return;

      // Exactly one active ability. Rewind history is only meaningful while
      // Ewige Wiederkehr is actually equipped.
      this.activeAbility = key;
      this.rewindHistory = [];
      this.lastRewindCaptureAt = -Infinity;
      this.updateAbilityIndicator();

      if (this.itemsModal) {
        this.itemsModalTab = "abilities";
        this.renderItemsModalTab();
      }
    }

    recordRewindSnapshot(time) {
      if (
        this.activeAbility !== "eternalReturn" ||
        !this.abilitiesUnlocked?.eternalReturn ||
        this.uiLocked ||
        this.playerDying ||
        this.rewindActive ||
        this.inVoid ||
        this.readingBook ||
        this.drinkingItem ||
        this.wormholeTeleporting ||
        this.tramTransitActive ||
        !this.player?.body ||
        !this.player.visible
      ) {
        return;
      }

      if (
        Number(this.__milkmanV15ActionUntil) > time
      ) {
        // Avoid storing the tiny delayed throw-release window from the polish
        // wrapper; it cannot be rewound independently from its delayed callback.
        return;
      }

      if (time - this.lastRewindCaptureAt < 100) return;
      this.lastRewindCaptureAt = time;

      const body = this.player.body;

      const snapshot = {
        time,
        player: {
          x: this.player.x,
          y: this.player.y,
          vx: body.velocity.x,
          vy: body.velocity.y,
          facing: this.facing,
          alpha: this.player.alpha
        },
        hp: this.hp,
        coins: this.coins,
        inventory: {
          gatorade: this.getItemCount("gatorade"),
          monster: this.getItemCount("monster"),
          camel: this.getItemCount("camel")
        },
        hasCityTicket: Boolean(this.hasCityTicket),
        hotbarItems: [...this.hotbarItems],
        selectedHotbarIndex: this.selectedHotbarIndex,
        sprintRemainingMs: Math.max(
          0,
          this.sprintExpiresAt - Date.now()
        ),
        milkmanState: this.captureMilkmanRewindState?.(time) || null
      };

      this.rewindHistory.push(snapshot);

      const cutoff = time - this.rewindHorizonMs;
      while (
        this.rewindHistory.length > 0 &&
        this.rewindHistory[0].time < cutoff
      ) {
        this.rewindHistory.shift();
      }
    }

    findThreeSecondRewindSnapshot() {
      if (!this.rewindHistory?.length) return null;

      const target = this.time.now - 3000;
      let best = null;

      for (const snapshot of this.rewindHistory) {
        if (snapshot.time <= target + 80) {
          best = snapshot;
        } else {
          break;
        }
      }

      if (!best) return null;

      const age = this.time.now - best.time;
      return age >= 2750 && age <= 3900 ? best : null;
    }

    restoreRewindSnapshot(snapshot) {
      if (!snapshot || !this.player?.body) return;

      this.hp = Phaser.Math.Clamp(
        Number(snapshot.hp) || 0,
        0,
        this.maxHp
      );

      this.coins = this.developerMode
        ? 999999
        : Math.max(0, Number(snapshot.coins) || 0);

      this.inventory.gatorade =
        Math.max(0, Number(snapshot.inventory?.gatorade) || 0);
      this.inventory.monster =
        Math.max(0, Number(snapshot.inventory?.monster) || 0);
      this.inventory.camel =
        Math.max(0, Number(snapshot.inventory?.camel) || 0);

      this.hasCityTicket = Boolean(snapshot.hasCityTicket);
      this.hotbarItems = Array.isArray(snapshot.hotbarItems)
        ? snapshot.hotbarItems.slice(0, HOTBAR_SIZE)
        : Array(HOTBAR_SIZE).fill(null);

      while (this.hotbarItems.length < HOTBAR_SIZE) {
        this.hotbarItems.push(null);
      }

      this.selectedHotbarIndex = Phaser.Math.Clamp(
        Number(snapshot.selectedHotbarIndex) || 0,
        0,
        HOTBAR_SIZE - 1
      );

      this.sprintExpiresAt =
        Number(snapshot.sprintRemainingMs) > 0
          ? Date.now() + Number(snapshot.sprintRemainingMs)
          : 0;

      this.facing =
        snapshot.player?.facing < 0 ? -1 : 1;

      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.setAlpha(
        Number.isFinite(snapshot.player?.alpha)
          ? snapshot.player.alpha
          : 1
      );
      this.player.setPosition(
        Number(snapshot.player?.x) || this.player.x,
        Number(snapshot.player?.y) || this.player.y
      );
      this.player.setFlipX(this.facing < 0);
      this.player.clearTint();
      this.player.setAngle(0);
      this.player.setScale(0.42);

      this.player.body.enable = true;
      this.player.setVelocity(
        Number(snapshot.player?.vx) || 0,
        Number(snapshot.player?.vy) || 0
      );

      this.playerHitUntil = 0;
      this.shootingUntil = 0;

      this.restoreMilkmanRewindState?.(
        snapshot.milkmanState,
        this.time.now
      );

      this.updateHpBar();
      this.updateCoinHUD();
      this.updateInventoryUI();
      this.updateSprintIndicator(true);
      this.ensureTicketMachineInteractive?.();
      this.ensureTramBoardingInteractive?.();

      const onGround =
        this.player.body.blocked.down ||
        this.player.body.touching.down;

      this.player.play(
        onGround ? "simon-idle" : "simon-jump",
        true
      );
    }

    rewindGameThreeSeconds() {
      if (
        this.activeAbility !== "eternalReturn" ||
        !this.abilitiesUnlocked?.eternalReturn ||
        this.uiLocked ||
        this.playerDying ||
        this.rewindActive ||
        this.inVoid ||
        this.tramTransitActive
      ) {
        return;
      }

      const snapshot = this.findThreeSecondRewindSnapshot();

      if (!snapshot) {
        this.showAbilityStatusMessage(
          "EWIGE WIEDERKEHR · NOCH KEINE 3 SEKUNDEN GESPEICHERT"
        );
        return;
      }

      this.rewindActive = true;
      this.__rewindSuppressMilkmanUntil =
        this.time.now + 700;

      this.setControlsVisible(false);

      if (this.hotbarDOM) {
        this.hotbarDOM.style.pointerEvents = "none";
        this.hotbarDOM.style.opacity = "0.58";
      }

      this.showAbilityStatusMessage(
        "EWIGE WIEDERKEHR · −3 SEK.",
        900
      );

      this.cameras.main.flash(180, 186, 153, 255);

      const x = this.player.x;
      const y = this.player.y - 38;

      const rings = [
        this.add.circle(x, y, 17, 0x000000, 0)
          .setStrokeStyle(4, 0xe8cf74, 0.92)
          .setDepth(190),
        this.add.circle(x, y, 28, 0x000000, 0)
          .setStrokeStyle(3, 0x9c76df, 0.78)
          .setDepth(189),
        this.add.circle(x, y, 39, 0x000000, 0)
          .setStrokeStyle(2, 0x67d3ff, 0.66)
          .setDepth(188)
      ];

      rings.forEach((ring, index) => {
        this.tweens.add({
          targets: ring,
          scale: { from: 0.5, to: 2.0 + index * 0.22 },
          alpha: { from: 1, to: 0 },
          angle: index % 2 === 0 ? -120 : 120,
          duration: 460,
          ease: "Quad.easeOut",
          onComplete: () => ring.destroy()
        });
      });

      this.tweens.add({
        targets: this.player,
        alpha: { from: 1, to: 0.18 },
        scaleX: { from: this.player.scaleX, to: 0.2 },
        duration: 210,
        yoyo: true,
        ease: "Quad.easeInOut"
      });

      this.time.delayedCall(470, () => {
        this.restoreRewindSnapshot(snapshot);

        // The old timeline is discarded. Three new seconds have to develop
        // before W can rewind again.
        this.rewindHistory = [];
        this.lastRewindCaptureAt = -Infinity;
        this.rewindActive = false;

        if (this.hotbarDOM) {
          this.hotbarDOM.style.pointerEvents = "auto";
          this.hotbarDOM.style.opacity = "1";
        }

        this.setControlsVisible(true);
        this.updateAbilityIndicator();
      });
    }

    canUseWormholeNow() {
      if (
        this.activeAbility !== "wormhole" ||
        !this.abilitiesUnlocked?.wormhole ||
        this.uiLocked ||
        this.playerDying ||
        this.wormholeTeleporting ||
        this.wormholeUsedThisJump ||
        !this.player?.body ||
        !this.player.visible
      ) {
        return false;
      }

      const body = this.player.body;
      const onGround = body.blocked.down || body.touching.down;
      return !onGround;
    }

    isPointerInControlArea(pointer) {
      if (!pointer) return true;

      const x = pointer.x;
      const y = pointer.y;

      // Never reinterpret the four touch-control circles as wormhole targets.
      if (y >= GAME_HEIGHT - 110 && (x <= 205 || x >= GAME_WIDTH - 205)) {
        return true;
      }

      return false;
    }

    installWormholeInput() {
      if (!this.input) return;

      if (this.__wormholePointerHandler) {
        this.input.off("pointerup", this.__wormholePointerHandler);
      }

      this.__wormholePointerHandler = (pointer) => {
        if (!this.canUseWormholeNow()) return;
        if (this.isPointerInControlArea(pointer)) return;

        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();

        this.performWormholeTeleport(pointer);
      };

      this.input.on("pointerup", this.__wormholePointerHandler);
    }

    createWormholePortal(x, y, depth = 160) {
      const container = this.add.container(x, y).setDepth(depth);

      const outer = this.add.ellipse(0, 0, 62, 82, 0x6b43c6, 0.42);
      outer.setStrokeStyle(5, 0xa88cff, 0.95);

      const middle = this.add.ellipse(0, 0, 43, 61, 0x3189bb, 0.3);
      middle.setStrokeStyle(4, 0x69d6ff, 0.92);

      const core = this.add.ellipse(0, 0, 26, 43, 0x080411, 0.95);
      core.setStrokeStyle(2, 0xe2d3ff, 0.75);

      container.add([outer, middle, core]);

      this.tweens.add({
        targets: [outer, middle],
        angle: { from: -12, to: 12 },
        scaleX: { from: 0.9, to: 1.08 },
        scaleY: { from: 1.08, to: 0.92 },
        duration: 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      return container;
    }

    performWormholeTeleport(pointer) {
      if (!this.canUseWormholeNow()) return;

      this.wormholeUsedThisJump = true;
      this.wormholeTeleporting = true;

      const sourceX = this.player.x;
      const sourceY = this.player.y - 20;

      const targetX = Phaser.Math.Clamp(
        Number(pointer.worldX) || sourceX,
        45,
        WORLD_WIDTH - 45
      );

      // If the player taps the road, emerge just above the ground and fall
      // naturally onto it. Tapping higher creates a higher exit.
      const targetY = Phaser.Math.Clamp(
        Math.min(Number(pointer.worldY) || 220, GROUND_TOP - 112),
        72,
        GROUND_TOP - 112
      );

      const entry = this.createWormholePortal(sourceX, sourceY, 165);
      const exit = this.createWormholePortal(targetX, targetY, 165)
        .setScale(0.12)
        .setAlpha(0);

      this.player.setVelocity(0, 0);

      this.tweens.add({
        targets: entry,
        scaleX: 0.12,
        scaleY: 1.18,
        alpha: 0,
        duration: 240,
        ease: "Quad.easeIn",
        onComplete: () => entry.destroy(true)
      });

      this.tweens.add({
        targets: this.player,
        scaleX: 0.16 * Math.sign(this.player.scaleX || 1),
        scaleY: 0.50,
        alpha: 0,
        duration: 200,
        ease: "Quad.easeIn",
        onComplete: () => {
          this.player.setPosition(targetX, targetY);
          this.player.setVelocity(0, 70);

          this.tweens.add({
            targets: exit,
            scale: 1,
            alpha: 1,
            duration: 210,
            ease: "Back.easeOut"
          });

          this.tweens.add({
            targets: this.player,
            scaleX: 0.42 * Math.sign(this.player.scaleX || 1),
            scaleY: 0.42,
            alpha: 1,
            duration: 260,
            ease: "Back.easeOut",
            onComplete: () => {
              this.player.setScale(0.42);
              this.player.setFlipX(this.facing < 0);
              this.player.play("simon-jump", true);
              this.wormholeTeleporting = false;

              this.time.delayedCall(280, () => {
                if (exit.active) {
                  this.tweens.add({
                    targets: exit,
                    scaleX: 0.1,
                    alpha: 0,
                    duration: 220,
                    onComplete: () => exit.destroy(true)
                  });
                }
              });
            }
          });
        }
      });
    }

    getActionEffectDepth(baseDepth) {
      return this.inVoid
        ? 4250 + Math.max(0, baseDepth)
        : baseDepth;
    }

    enterForItselfVoid() {
      if (
        this.activeAbility !== "forItself" ||
        !this.abilitiesUnlocked?.forItself ||
        this.uiLocked ||
        this.playerDying ||
        this.rewindActive ||
        this.inVoid ||
        this.tramTransitActive
      ) {
        return;
      }

      const remaining =
        this.forItselfCooldownUntil - Date.now();

      if (remaining > 0) {
        const seconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const rest = seconds % 60;

        this.showAbilityStatusMessage(
          `FÜR SICH SEIN · NOCH ${minutes}:${String(rest).padStart(2, "0")}`
        );
        return;
      }

      this.forItselfCooldownUntil =
        Date.now() + 5 * 60 * 1000;

      this.inVoid = true;
      this.voidEnteredSceneTime = this.time.now;

      this.voidPlayerState = {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.body?.velocity?.x || 0,
        vy: this.player.body?.velocity?.y || 0,
        depth: this.player.depth
      };

      this.player.setVelocity(0, 0);
      if (this.player.body) {
        this.player.body.enable = false;
      }

      this.voidBottleStates = [];

      (this.milkBottles || []).forEach((bottle) => {
        if (!bottle?.active || !bottle.body) return;

        this.voidBottleStates.push({
          bottle,
          vx: bottle.body.velocity.x,
          vy: bottle.body.velocity.y,
          enabled: bottle.body.enable
        });

        bottle.body.enable = false;
      });

      this.setControlsVisible(false);
      this.cleanupAbilityTouchControl();

      if (this.itemsButton) {
        this.itemsButton.setDepth(4300);
      }

      const overlay = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(4000);

      const bg = this.add.graphics();
      bg.fillStyle(0x020307, 0.985);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Sparse timeless void.
      const points = [
        [76,56],[154,126],[244,70],[338,143],[435,73],[517,164],
        [626,76],[731,131],[792,54],[107,247],[205,308],[313,253],
        [423,315],[541,268],[655,326],[755,246]
      ];

      points.forEach(([x, y], index) => {
        bg.fillStyle(
          index % 3 === 0 ? 0xb7c9e7 : 0x67758d,
          index % 2 === 0 ? 0.55 : 0.32
        );
        bg.fillCircle(x, y, index % 4 === 0 ? 2 : 1);
      });

      bg.lineStyle(2, 0x4a5870, 0.22);
      bg.strokeEllipse(GAME_WIDTH / 2, 205, 510, 210);
      bg.strokeEllipse(GAME_WIDTH / 2, 205, 330, 132);

      const title = this.add.text(
        GAME_WIDTH / 2,
        62,
        "FÜR SICH SEIN",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#e9edf2",
          stroke: "#090b10",
          strokeThickness: 5
        }
      )
        .setOrigin(0.5);

      const note = this.add.text(
        GAME_WIDTH / 2,
        92,
        "DIE WELT DRAUSSEN STEHT STILL",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#8f9aac"
        }
      )
        .setOrigin(0.5);

      overlay.add([bg, title, note]);
      this.voidOverlay = overlay;

      this.voidBlocker = this.add.zone(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT
      )
        .setScrollFactor(0)
        .setDepth(4050)
        .setInteractive();

      this.voidBlocker.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
      });

      // Simon stays visible above the void.
      this.player.setDepth(4100);
      this.player.play("simon-idle", true);

      this.createVoidBackButton();
      this.refreshHotbar();
      this.updateHotbarActionUI();
      this.updateAbilityIndicator();
    }

    createVoidBackButton() {
      const root = this.getDOMUIRoot?.();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='void-back']")
        .forEach((node) => node.remove());

      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "void-back";

      Object.assign(wrapper.style, {
        position: "absolute",
        left: "12px",
        top: "12px",
        zIndex: "100060",
        pointerEvents: "auto"
      });

      const back = this.createDOMButton(
        "← ZURÜCK",
        () => this.exitForItselfVoid(),
        {
          color: "#eef2f6",
          background: "#151922",
          border: "#8794a8",
          width: "145px",
          minHeight: "40px",
          fontSize: "7px"
        }
      );

      wrapper.appendChild(back);
      root.appendChild(wrapper);
      this.voidBackUI = { overlay: wrapper };
    }

    shiftPausedWorldTimers(elapsed) {
      if (!Number.isFinite(elapsed) || elapsed <= 0) return;

      [
        "nextMilkBottleAt",
        "nextMilkmanPunchAt",
        "nextLionHitAt",
        "playerHitUntil",
        "shootingUntil",
        "dialogueIgnoreUntil"
      ].forEach((key) => {
        if (Number.isFinite(this[key]) && this[key] > 0) {
          this[key] += elapsed;
        }
      });
    }

    exitForItselfVoid() {
      if (!this.inVoid) return;

      const elapsed =
        Math.max(0, this.time.now - this.voidEnteredSceneTime);

      this.shiftPausedWorldTimers(elapsed);

      if (this.voidBackUI) {
        this.destroyDOMModal(this.voidBackUI);
        this.voidBackUI = null;
      }

      this.voidBlocker?.destroy?.();
      this.voidBlocker = null;

      this.voidOverlay?.destroy?.(true);
      this.voidOverlay = null;

      this.inVoid = false;

      if (this.itemsButton) {
        this.itemsButton.setDepth(305);
      }

      this.player.setDepth(
        Number.isFinite(this.voidPlayerState?.depth)
          ? this.voidPlayerState.depth
          : 10
      );

      if (this.player.body) {
        this.player.body.enable = true;
      }

      this.player.setVelocity(
        Number(this.voidPlayerState?.vx) || 0,
        Number(this.voidPlayerState?.vy) || 0
      );

      this.voidBottleStates.forEach((state) => {
        const bottle = state.bottle;
        if (!bottle?.active || !bottle.body) return;

        bottle.body.enable = Boolean(state.enabled);
        bottle.body.setVelocity(
          Number(state.vx) || 0,
          Number(state.vy) || 0
        );
      });

      this.voidBottleStates = [];
      this.voidPlayerState = null;

      this.setControlsVisible(!this.uiLocked);
      this.refreshHotbar();
      this.updateHotbarActionUI();
      this.updateAbilityIndicator();
      this.syncStreetStoreHitboxes?.();
    }

    cleanupVoid() {
      if (this.voidBackUI) {
        this.destroyDOMModal(this.voidBackUI);
        this.voidBackUI = null;
      }

      this.voidBlocker?.destroy?.();
      this.voidBlocker = null;

      this.voidOverlay?.destroy?.(true);
      this.voidOverlay = null;

      this.inVoid = false;
      this.voidBottleStates = [];
      this.voidPlayerState = null;
    }

    isSprintActive() {
      return Number.isFinite(this.sprintExpiresAt) &&
        this.sprintExpiresAt > Date.now();
    }

    playSmokeAnimation() {
      if (
        this.getItemCount("camel") <= 0 ||
        this.drinkingItem ||
        this.playerDying ||
        !this.player?.visible
      ) {
        return;
      }

      this.drinkingItem = true;
      this.updateHotbarActionUI();
      this.refreshUILock();

      this.player.setVelocity(0, 0);
      this.player.anims.stop();

      const direction = this.facing < 0 ? -1 : 1;
      const cigarette = this.add.container(
        this.player.x + direction * 17,
        this.player.y - 62
      ).setDepth(this.getActionEffectDepth(85));

      const cig = this.add.graphics();
      cig.fillStyle(0xc78a44, 1);
      cig.fillRect(-11, -2, 5, 4);
      cig.fillStyle(0xf1eee2, 1);
      cig.fillRect(-6, -2, 15, 4);
      cig.fillStyle(0xe34f35, 1);
      cig.fillRect(9, -2, 2, 4);
      cigarette.add(cig);

      const startPlayerY = this.player.y;

      this.tweens.add({
        targets: this.player,
        angle: -direction * 4,
        y: startPlayerY - 2,
        duration: 230,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut"
      });

      // Three pixel-ish smoke puffs.
      [0, 270, 540].forEach((delay, index) => {
        this.time.delayedCall(310 + delay, () => {
          if (!cigarette.active) return;

          const puff = this.add.circle(
            cigarette.x - direction * 10,
            cigarette.y - 7,
            4 + index,
            0xe7e4dc,
            0.72
          ).setDepth(this.getActionEffectDepth(84));

          this.tweens.add({
            targets: puff,
            y: puff.y - 30 - index * 5,
            x: puff.x - direction * (8 + index * 3),
            scale: 1.6,
            alpha: 0,
            duration: 820,
            ease: "Sine.easeOut",
            onComplete: () => puff.destroy()
          });
        });
      });

      this.time.delayedCall(1300, () => {
        this.inventory.camel = Math.max(0, this.getItemCount("camel") - 1);

        const item = this.getItemDefinition("camel");
        const now = Date.now();

        // Add to remaining sprint time instead of resetting it.
        this.sprintExpiresAt =
          Math.max(now, Number(this.sprintExpiresAt) || 0) +
          item.sprintMs;

        if (this.getItemCount("camel") <= 0) {
          this.removeItemFromHotbar("camel");
        } else {
          this.refreshHotbar();
        }

        cigarette.destroy(true);
        this.player.setAngle(0);
        this.player.setY(startPlayerY);
        this.player.play("simon-idle", true);

        this.drinkingItem = false;
        this.updateInventoryUI();
        this.refreshUILock();
        this.updateSprintIndicator(true);
      });
    }

    cleanupSprintIndicator() {
      if (this.sprintIndicatorDOM?.remove) {
        this.sprintIndicatorDOM.remove();
      }

      this.sprintIndicatorDOM = null;

      const root = document.getElementById("phaser-game");
      root?.querySelectorAll("[data-simon-ui='sprint-cigarette']")
        .forEach((node) => node.remove());
    }

    updateSprintIndicator(force = false) {
      const now = Date.now();

      if (!force && now < this.nextSprintIndicatorRefreshAt) return;
      this.nextSprintIndicatorRefreshAt = now + 180;

      const remaining = this.sprintExpiresAt - now;

      if (remaining <= 0) {
        if (this.sprintExpiresAt > 0) {
          this.sprintExpiresAt = 0;
        }
        this.cleanupSprintIndicator();
        return;
      }

      const root = this.getDOMUIRoot?.();
      if (!root) return;

      let wrapper = this.sprintIndicatorDOM;

      if (!wrapper || !wrapper.isConnected) {
        wrapper = document.createElement("div");
        wrapper.dataset.simonUi = "sprint-cigarette";

        Object.assign(wrapper.style, {
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: "99970",
          width: "48px",
          height: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          border: "2px solid rgba(255,237,185,.72)",
          background: "rgba(25,25,25,.72)",
          boxSizing: "border-box"
        });

        const cigarette = document.createElement("div");
        cigarette.dataset.cigaretteGraphic = "true";

        Object.assign(cigarette.style, {
          position: "relative",
          width: "31px",
          height: "6px",
          background: "#f4f0df",
          border: "1px solid #6a5d48",
          boxSizing: "border-box"
        });

        const filter = document.createElement("span");
        Object.assign(filter.style, {
          position: "absolute",
          left: "-1px",
          top: "-1px",
          width: "9px",
          height: "6px",
          background: "#c78a44",
          borderRight: "1px solid #75522e"
        });

        const ember = document.createElement("span");
        Object.assign(ember.style, {
          position: "absolute",
          right: "-4px",
          top: "0px",
          width: "4px",
          height: "4px",
          background: "#ef5538",
          boxShadow: "0 0 4px #ff8b44"
        });

        cigarette.append(filter, ember);
        wrapper.appendChild(cigarette);
        root.appendChild(wrapper);
        this.sprintIndicatorDOM = wrapper;
      }

      // Blink during the FINAL ten seconds of the currently stacked sprint effect.
      if (remaining <= 10000) {
        const visiblePhase = Math.floor(now / 330) % 2 === 0;
        wrapper.style.opacity = visiblePhase ? "1" : "0.25";
        wrapper.style.borderColor = visiblePhase
          ? "rgba(255,112,72,.95)"
          : "rgba(255,237,185,.45)";
      } else {
        wrapper.style.opacity = "1";
        wrapper.style.borderColor = "rgba(255,237,185,.72)";
      }
    }

    getDOMUIRoot() {
      const root = document.getElementById("phaser-game");
      if (!root) {
        console.error("DOM-UI: #phaser-game wurde nicht gefunden.");
        return null;
      }

      // Absolute DOM overlays need a positioned containing block.
      const computed = window.getComputedStyle(root);
      if (computed.position === "static") {
        root.style.position = "relative";
      }

      return root;
    }

    destroyDOMModal(modal) {
      if (!modal) return;

      const node = modal.overlay || modal;
      if (node && typeof node.remove === "function") {
        node.remove();
      }
    }

    createDOMModal({
      key,
      width = "min(92%, 520px)",
      placement = "center",
      shade = "rgba(5, 6, 11, 0.75)",
      background = "#f2e5bf",
      border = "#253a4b",
      padding = "18px"
    }) {
      const root = this.getDOMUIRoot();
      if (!root) return null;

      root.querySelectorAll(`[data-simon-ui="${key}"]`).forEach((node) => node.remove());

      const overlay = document.createElement("div");
      overlay.dataset.simonUi = key;

      Object.assign(overlay.style, {
        position: "absolute",
        inset: "0",
        zIndex: "100000",
        display: "flex",
        justifyContent: "center",
        alignItems: placement === "bottom" ? "flex-end" : "center",
        padding: placement === "bottom" ? "0 10px 14px" : "12px",
        background: shade,
        boxSizing: "border-box",
        pointerEvents: "auto",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent"
      });

      const panel = document.createElement("div");
      Object.assign(panel.style, {
        width,
        maxWidth: "calc(100% - 4px)",
        maxHeight: "calc(100% - 4px)",
        overflow: "auto",
        boxSizing: "border-box",
        padding,
        background,
        border: `4px solid ${border}`,
        borderRadius: "14px",
        boxShadow: "0 5px 0 rgba(35, 30, 26, 0.7)",
        fontFamily: '"Press Start 2P", monospace',
        textAlign: "center",
        color: "#2d2a25",
        pointerEvents: "auto",
        touchAction: "manipulation"
      });

      // Do not let taps leak through to Phaser.
      const stop = (event) => event.stopPropagation();
      ["pointerdown", "pointerup", "touchstart", "touchend", "click"].forEach((type) => {
        overlay.addEventListener(type, stop, { passive: type === "touchstart" });
        panel.addEventListener(type, stop, { passive: type === "touchstart" });
      });

      overlay.appendChild(panel);
      root.appendChild(overlay);

      return { overlay, panel };
    }

    createDOMText(text, {
      fontSize = "10px",
      color = "#2d2a25",
      margin = "0",
      lineHeight = "1.55",
      weight = "normal"
    } = {}) {
      const element = document.createElement("div");
      element.textContent = text;

      Object.assign(element.style, {
        margin,
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        color,
        lineHeight,
        fontWeight: weight,
        textAlign: "center",
        overflowWrap: "anywhere"
      });

      return element;
    }

    createDOMButton(label, onActivate, {
      color = "#fff5d6",
      background = "#302d34",
      border = "rgba(255, 230, 168, 0.7)",
      minHeight = "44px",
      fontSize = "9px",
      padding = "8px 10px",
      width = "100%"
    } = {}) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;

      Object.assign(button.style, {
        appearance: "none",
        WebkitAppearance: "none",
        width,
        minWidth: "0",
        minHeight,
        padding,
        boxSizing: "border-box",
        border: `2px solid ${border}`,
        borderRadius: "5px",
        background,
        color,
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        lineHeight: "1.2",
        textAlign: "center",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none"
      });

      // iOS/PWA can emit touchend -> pointerup -> click for one tap.
      // A short debounce makes that one logical activation while still
      // allowing the same button to be used again afterwards.
      let lastActivation = -Infinity;

      const activate = (event) => {
        const now = performance.now();
        if (now - lastActivation < 350) {
          event?.preventDefault?.();
          event?.stopPropagation?.();
          return;
        }
        lastActivation = now;

        event?.preventDefault?.();
        event?.stopPropagation?.();

        const previousBackground = button.style.background;
        button.style.background = "#5a5360";
        button.style.transform = "translateY(2px)";

        window.setTimeout(() => {
          button.style.background = previousBackground;
          button.style.transform = "";
        }, 110);

        try {
          onActivate();
        } catch (error) {
          console.error(`DOM-Button "${label}" ist fehlgeschlagen:`, error);
        }
      };

      // All three are deliberate. The debounce above collapses duplicates.
      button.addEventListener("touchend", activate, { passive: false });
      button.addEventListener("pointerup", activate, { passive: false });
      button.addEventListener("click", activate, { passive: false });

      button.addEventListener("touchstart", (event) => {
        event.stopPropagation();
      }, { passive: true });

      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      return button;
    }

    createInfoButton(itemKey) {
      return this.createDOMButton("i", () => this.openItemInfo(itemKey), {
        color: "#fff5d6",
        background: "#3d4854",
        border: "#8c9bab",
        width: "34px",
        minHeight: "34px",
        fontSize: "10px",
        padding: "4px"
      });
    }

    openItemInfo(itemKey) {
      const item = this.getItemDefinition(itemKey);
      if (!item || this.itemInfoModal) return;

      const modal = this.createDOMModal({
        key: "item-info",
        width: "min(86%, 410px)",
        background: "#ece1c4",
        border: "#4b5560",
        shade: "rgba(5, 6, 11, 0.58)",
        padding: "18px"
      });

      if (!modal) return;

      modal.overlay.style.zIndex = "100040";
      this.itemInfoModal = modal;

      const icon = this.createDOMItemIcon(itemKey, 52);

      const title = this.createDOMText(item.name, {
        fontSize: "13px",
        color: "#2f363c",
        margin: "6px 0 13px"
      });

      const description = this.createDOMText(item.description, {
        fontSize: "7px",
        color: "#4f4940",
        margin: "0 0 16px",
        lineHeight: "1.75"
      });

      const close = this.createDOMButton("OK", () => this.closeItemInfo(), {
        color: "#fff4cf",
        background: "#3d4854",
        border: "#8c9bab",
        width: "120px",
        fontSize: "9px"
      });
      close.style.margin = "0 auto";

      modal.panel.append(icon, title, description, close);
      this.refreshUILock();
    }

    closeItemInfo() {
      if (!this.itemInfoModal) return;

      this.destroyDOMModal(this.itemInfoModal);
      this.itemInfoModal = null;
      this.refreshUILock();
    }

    createInventoryCard(itemKey) {
      const item = this.getItemDefinition(itemKey);
      const count = this.getItemCount(itemKey);
      if (!item || count <= 0) return null;

      const card = document.createElement("div");
      Object.assign(card.style, {
        minWidth: "0",
        padding: "9px 7px",
        border: "2px solid #68727b",
        background: "#111418",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        boxSizing: "border-box"
      });

      const header = document.createElement("div");
      Object.assign(header.style, {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 34px",
        gap: "4px",
        alignItems: "start"
      });

      const name = this.createDOMText(item.name, {
        fontSize: "6px",
        color: "#fff0bd",
        lineHeight: "1.45"
      });

      const info = this.createInfoButton(itemKey);
      header.append(name, info);

      const icon = this.createDOMItemIcon(itemKey, 45);

      const qty = this.createDOMText(
        item.type === "book"
          ? "BUCH"
          : (item.type === "weapon" ? "WAFFE" : `${count}x`),
        {
          fontSize: "6px",
          color: "#aeb7b7"
        }
      );

      const inHotbar = this.hotbarItems.includes(itemKey);

      const hotbarButton = this.createDOMButton(
        inHotbar ? "ENTFERNEN" : "IN HOTBAR",
        () => {
          const result = this.toggleItemInHotbar(itemKey);

          if (result === "full") {
            const hint = this.itemsModal?.panel?.querySelector("[data-items-hint]");
            if (hint) hint.textContent = "HOTBAR VOLL · MAX. 5 ITEMS";
            return;
          }

          this.closeItemsModal();
          this.openItemsModal();
        },
        {
          color: inHotbar ? "#ffe5cf" : "#e9f1e8",
          background: inHotbar ? "#5b3a32" : "#324438",
          border: inHotbar ? "#9a6b5d" : "#6d8c73",
          minHeight: "34px",
          fontSize: "5.5px",
          padding: "5px 4px"
        }
      );

      card.append(header, icon, qty, hotbarButton);
      return card;
    }

    renderItemsModalTab() {
      if (!this.itemsModal || !this.itemsModalContent) return;

      const content = this.itemsModalContent;
      content.replaceChildren();

      const tabButtons = this.itemsModal.panel.querySelectorAll("[data-items-tab]");
      tabButtons.forEach((button) => {
        const active = button.dataset.itemsTab === this.itemsModalTab;
        button.style.background = active ? "#6d5a36" : "#2c333a";
        button.style.borderColor = active ? "#ffe4a0" : "#68727b";
        button.style.color = active ? "#fff4c7" : "#c5c7c8";
      });

      if (this.itemsModalTab === "abilities") {
        this.renderAbilitiesTab(content);
        return;
      }

      if (this.itemsModalTab === "villains") {
        this.renderVillainsTab(content);
        return;
      }

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "8px",
        width: "100%",
        margin: "0 0 12px"
      });

      [
        "gatorade",
        "monster",
        "camel",
        "gandhiSticks",
        "bookGeneralRelativity",
        "bookPhaenomenologie",
        "bookPlaybook",
        "bookZarathustra"
      ].forEach((itemKey) => {
        const card = this.createInventoryCard(itemKey);
        if (card) grid.appendChild(card);
      });

      const empty = grid.childElementCount === 0;

      const hint = this.createDOMText(
        empty
          ? "NOCH KEINE ITEMS"
          : "WÄHLE BIS ZU 5 ITEMS / BÜCHER FÜR DIE HOTBAR",
        {
          fontSize: "6px",
          color: "#aeb7b7",
          margin: "2px 0 0"
        }
      );
      hint.dataset.itemsHint = "true";

      content.append(grid, hint);
    }

    renderAbilitiesTab(content) {
      const unlocked = Object.keys(this.abilitiesUnlocked || {})
        .filter((key) => this.abilitiesUnlocked[key]);

      if (unlocked.length === 0) {
        content.appendChild(
          this.createDOMText("NOCH KEINE FÄHIGKEITEN FREIGESCHALTET", {
            fontSize: "7px",
            color: "#b8bec4",
            margin: "18px 0"
          })
        );
        return;
      }

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "9px",
        width: "100%"
      });

      unlocked.forEach((abilityKey) => {
        const ability = this.getAbilityDefinition(abilityKey);
        if (!ability) return;

        const card = document.createElement("div");
        Object.assign(card.style, {
          padding: "10px 8px",
          border: "2px solid #7259a5",
          background: "#17131f",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          boxSizing: "border-box"
        });

        const icon = this.createDOMAbilityIcon(abilityKey, 40);

        const name = this.createDOMText(ability.name, {
          fontSize: "8px",
          color: "#eee3ff"
        });

        const description = this.createDOMText(ability.description, {
          fontSize: "5.5px",
          color: "#bfb6cc",
          lineHeight: "1.55"
        });

        const active = this.activeAbility === abilityKey;
        const button = this.createDOMButton(
          active ? "AKTIV" : "AUSRÜSTEN",
          () => this.equipAbility(abilityKey),
          {
            color: active ? "#f8f0c9" : "#eef2ff",
            background: active ? "#61522f" : "#493670",
            border: active ? "#e1c96d" : "#9c82d4",
            minHeight: "36px",
            fontSize: "6px"
          }
        );
        button.disabled = active;

        card.append(icon, name, description, button);
        grid.appendChild(card);
      });

      content.appendChild(grid);
    }

    getVillainDefinition(key) {
      const definitions = {
        milkman: {
          name: "Milchmann",
          description:
            "Ein rachsüchtiger Milchlieferant an der Bahnhofstrasse. Er verfolgte Simon, warf Milchflaschen und machte jede dritte Flasche als schnellere SUPER MILCH besonders gefährlich. Simon besiegte ihn im Nahkampf."
        },
        darkGandhi: {
          name: "Dark Gandhi",
          description:
            "Nach dem Nuklearangriff erhob sich Gandhi als Dark Gandhi: schwarze Kleidung, rote Augen und drei Bossphasen. Er kämpfte mit Salzmarsch, karmischer Vergeltung, dem Rad der Wiedergeburt, Nuclear Level: Max und Ahimsa Inversion."
        }
      };

      return definitions[key] || null;
    }

    createVillainIcon(key) {
      const icon = document.createElement("div");
      Object.assign(icon.style, {
        width: "46px",
        height: "54px",
        position: "relative",
        border: "2px solid #5d646a",
        borderRadius: "7px",
        background: key === "darkGandhi" ? "#161116" : "#e7eceb",
        boxSizing: "border-box",
        overflow: "hidden"
      });

      if (key === "darkGandhi") {
        const head = document.createElement("div");
        Object.assign(head.style, {
          position: "absolute",
          width: "25px",
          height: "22px",
          left: "9px",
          top: "7px",
          borderRadius: "9px",
          background: "#9b7055"
        });

        const robe = document.createElement("div");
        Object.assign(robe.style, {
          position: "absolute",
          width: "30px",
          height: "27px",
          left: "7px",
          bottom: "-2px",
          borderRadius: "7px 7px 0 0",
          background: "#151318"
        });

        [-1, 1].forEach((side) => {
          const eye = document.createElement("span");
          Object.assign(eye.style, {
            position: "absolute",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#ff2638",
            top: "15px",
            left: side < 0 ? "15px" : "25px",
            boxShadow: "0 0 5px #ff2638",
            zIndex: "4"
          });
          icon.appendChild(eye);
        });

        icon.append(head, robe);
      } else {
        const cap = document.createElement("div");
        Object.assign(cap.style, {
          position: "absolute",
          width: "28px",
          height: "8px",
          left: "8px",
          top: "5px",
          background: "#e8ece9",
          borderBottom: "3px solid #4f86a9"
        });

        const head = document.createElement("div");
        Object.assign(head.style, {
          position: "absolute",
          width: "22px",
          height: "20px",
          left: "11px",
          top: "13px",
          borderRadius: "7px",
          background: "#d2a27e"
        });

        const uniform = document.createElement("div");
        Object.assign(uniform.style, {
          position: "absolute",
          width: "31px",
          height: "25px",
          left: "7px",
          bottom: "-1px",
          background: "#e8ece9",
          borderTop: "5px solid #4f86a9"
        });

        icon.append(cap, head, uniform);
      }

      return icon;
    }

    renderVillainsTab(content) {
      const defeated = [];

      // gandhiStoryEligible is persisted as soon as the milkman is defeated.
      if (this.gandhiStoryEligible) {
        defeated.push("milkman");
      }

      if (this.darkGandhiDefeated) {
        defeated.push("darkGandhi");
      }

      if (defeated.length === 0) {
        content.appendChild(
          this.createDOMText("NOCH KEINE BÖSEWICHTE BESIEGT", {
            fontSize: "7px",
            color: "#b8bec4",
            margin: "18px 0"
          })
        );
        return;
      }

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
        width: "100%"
      });

      defeated.forEach((villainKey) => {
        const villain = this.getVillainDefinition(villainKey);
        if (!villain) return;

        const card = document.createElement("div");
        Object.assign(card.style, {
          display: "grid",
          gridTemplateColumns: "56px 1fr 42px",
          alignItems: "center",
          gap: "7px",
          minHeight: "74px",
          padding: "8px",
          border: "2px solid #6c6263",
          background: "#1a181c",
          boxSizing: "border-box"
        });

        const icon = this.createVillainIcon(villainKey);

        const name = this.createDOMText(villain.name, {
          fontSize: "7px",
          color: villainKey === "darkGandhi" ? "#ffb7bd" : "#e8eef0"
        });
        name.style.textAlign = "left";

        const info = this.createDOMButton(
          "i",
          () => this.openVillainInfo(villainKey),
          {
            color: "#fff4d4",
            background: "#3b3440",
            border: "#8c8093",
            minHeight: "38px",
            fontSize: "12px",
            width: "38px",
            padding: "4px"
          }
        );

        card.append(icon, name, info);
        grid.appendChild(card);
      });

      content.appendChild(grid);
    }

    openVillainInfo(villainKey) {
      const villain = this.getVillainDefinition(villainKey);
      if (!villain || this.villainInfoModal) return;

      const modal = this.createDOMModal({
        key: "villain-info",
        width: "min(88%, 480px)",
        background: "#1b1920",
        border: "#8e7d86",
        shade: "rgba(5, 5, 8, .72)",
        padding: "16px"
      });

      if (!modal) return;

      this.villainInfoModal = modal;

      const title = this.createDOMText(villain.name.toUpperCase(), {
        fontSize: "11px",
        color: villainKey === "darkGandhi" ? "#ff9aa5" : "#e8eef0",
        margin: "0 0 12px"
      });

      const description = this.createDOMText(villain.description, {
        fontSize: "6.5px",
        color: "#d2ccd3",
        lineHeight: "1.7",
        margin: "0 0 14px"
      });

      const close = this.createDOMButton(
        "ZURÜCK",
        () => this.closeVillainInfo(),
        {
          color: "#f6ebd3",
          background: "#3b3440",
          border: "#8c8093",
          minHeight: "38px",
          fontSize: "7px"
        }
      );

      modal.panel.append(title, description, close);
    }

    closeVillainInfo() {
      if (!this.villainInfoModal) return;

      this.destroyDOMModal(this.villainInfoModal);
      this.villainInfoModal = null;
    }

    openItemsModal() {
      if (
        this.itemsModal ||
        this.ticketModal ||
        this.lootModal ||
        this.lionChoiceModal ||
        this.shopModal
      ) {
        return;
      }

      if (
        this.playerDying ||
        this.danceOverlay ||
        this.indianStoreOverlay ||
        this.bookstoreOverlay ||
        this.readingBook
      ) {
        return;
      }

      this.setUILocked(true);
      this.itemsModalTab = "items";

      const modal = this.createDOMModal({
        key: "items",
        width: "min(94%, 590px)",
        background: "#20252b",
        border: "#d7c892",
        shade: "rgba(5, 6, 11, 0.72)",
        padding: "13px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.itemsModal = modal;

      const top = document.createElement("div");
      Object.assign(top.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "9px"
      });

      const title = this.createDOMText("INVENTAR", {
        fontSize: "13px",
        color: "#fff0bd"
      });
      title.style.textAlign = "left";

      const close = this.createDOMButton("X", () => this.closeItemsModal(), {
        color: "#fff0bd",
        background: "#443a30",
        border: "#8c795e",
        width: "48px",
        minHeight: "38px",
        padding: "6px",
        fontSize: "12px"
      });

      top.append(title, close);

      const tabs = document.createElement("div");
      Object.assign(tabs.style, {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "7px",
        marginBottom: "10px"
      });

      const itemsTab = this.createDOMButton(
        "GEGENSTÄNDE",
        () => {
          this.itemsModalTab = "items";
          this.renderItemsModalTab();
        },
        {
          color: "#fff4c7",
          background: "#6d5a36",
          border: "#ffe4a0",
          minHeight: "36px",
          fontSize: "5.6px"
        }
      );
      itemsTab.dataset.itemsTab = "items";

      const abilitiesTab = this.createDOMButton(
        "FÄHIGKEITEN",
        () => {
          this.itemsModalTab = "abilities";
          this.renderItemsModalTab();
        },
        {
          color: "#c5c7c8",
          background: "#2c333a",
          border: "#68727b",
          minHeight: "36px",
          fontSize: "5.6px"
        }
      );
      abilitiesTab.dataset.itemsTab = "abilities";

      const villainsTab = this.createDOMButton(
        "BÖSEWICHTE",
        () => {
          this.itemsModalTab = "villains";
          this.renderItemsModalTab();
        },
        {
          color: "#c5c7c8",
          background: "#2c333a",
          border: "#68727b",
          minHeight: "36px",
          fontSize: "5.6px"
        }
      );
      villainsTab.dataset.itemsTab = "villains";

      tabs.append(itemsTab, abilitiesTab, villainsTab);

      const content = document.createElement("div");
      content.dataset.itemsContent = "true";
      this.itemsModalContent = content;

      modal.panel.append(top, tabs, content);
      this.renderItemsModalTab();
      this.refreshUILock();
    }

    closeItemsModal() {
      if (!this.itemsModal) return;

      this.closeVillainInfo?.();
      this.destroyDOMModal(this.itemsModal);
      this.itemsModal = null;
      this.itemsModalContent = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }

    refreshUILock() {
      const locked = Boolean(
        this.ticketModal ||
        this.itemsModal ||
        this.lootModal ||
        this.lionChoiceModal ||
        this.danceOverlay ||
        this.bouncerDialogueActive ||
        this.fightActive ||
        this.lionExitActive ||
        this.tramTransitActive ||
        this.tramDestinationModal ||
        this.itemInfoModal ||
        this.drinkingItem ||
        this.readingBook ||
        this.playerDying
      );

      this.setUILocked(locked);
      this.updateHotbarActionUI?.();
    }

    ensureTicketMachineInteractive() {
      if (!this.ticketHitbox) return;

      if (!this.ticketHitbox.input) {
        this.ticketHitbox.setInteractive({ useHandCursor: true });
      }

      this.ticketHitbox.input.enabled = true;
      this.ticketHitbox.setDepth(150);
    }

    enableTramBoarding() {
      if (!this.hasCityTicket || this.tramTransitActive) return;

      this.tramBoardingEnabled = true;

      if (this.tramHitbox) {
        if (!this.tramHitbox.input) {
          this.tramHitbox.setInteractive({ useHandCursor: true });
        }
        this.tramHitbox.input.enabled = true;
        this.tramHitbox.setDepth(170);
      }

      this.tramBoardingMarker?.setVisible(true);
    }

    ensureTramBoardingInteractive() {
      if (!this.hasCityTicket || this.tramTransitActive) return;
      this.enableTramBoarding();
    }

    getTramDestinations() {
      return [
        {
          key: "bahnhofstrasse",
          label: "BAHNHOFSTRASSE/HB"
        }
      ];
    }

    boardTram() {
      if (
        this.inVoid ||
        this.rewindActive ||
        !this.hasCityTicket ||
        !this.tramBoardingEnabled ||
        this.tramTransitActive ||
        this.uiLocked ||
        this.playerDying ||
        !this.tram
      ) {
        return;
      }

      this.openTramDestinationModal();
    }

    openTramDestinationModal() {
      if (
        this.tramDestinationModal ||
        !this.hasCityTicket ||
        this.tramTransitActive
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "tram-destination",
        width: "min(90%, 470px)",
        background: "#dce8eb",
        border: "#245b84",
        shade: "rgba(5, 7, 12, 0.72)",
        padding: "17px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.tramDestinationModal = modal;

      const title = this.createDOMText("WOHIN?", {
        fontSize: "15px",
        color: "#183b55",
        margin: "0 0 15px"
      });

      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "8px",
        maxWidth: "350px",
        margin: "0 auto 12px"
      });

      this.getTramDestinations().forEach((destination) => {
        const button = this.createDOMButton(
          destination.label,
          () => this.chooseTramDestination(destination.key),
          {
            color: "#f7f4df",
            background: "#245b84",
            border: "#83b9d8",
            minHeight: "44px",
            fontSize: "7px",
            padding: "8px"
          }
        );

        list.appendChild(button);
      });

      const back = this.createDOMButton(
        "← ZURÜCK",
        () => this.closeTramDestinationModal(),
        {
          color: "#24475c",
          background: "#c4d7dc",
          border: "#7195a4",
          width: "150px",
          minHeight: "38px",
          fontSize: "7px"
        }
      );
      back.style.margin = "0 auto";

      modal.panel.append(title, list, back);
      this.refreshUILock();
    }

    closeTramDestinationModal() {
      if (!this.tramDestinationModal) return;

      this.destroyDOMModal(this.tramDestinationModal);
      this.tramDestinationModal = null;
      this.refreshUILock();
      this.ensureTramBoardingInteractive();
    }

    chooseTramDestination(destinationKey) {
      if (!this.tramDestinationModal || !this.hasCityTicket) return;

      this.destroyDOMModal(this.tramDestinationModal);
      this.tramDestinationModal = null;

      this.startTramJourney(destinationKey);
    }

    consumeCityTicket() {
      if (!this.hasCityTicket) return false;

      this.hasCityTicket = false;
      this.tramBoardingEnabled = false;

      if (this.tramHitbox?.input) {
        this.tramHitbox.input.enabled = false;
      }

      this.tramBoardingMarker?.setVisible(false);

      this.hotbarItems = this.hotbarItems.map(
        (item) => item === "ticket" ? null : item
      );

      this.itemsTicketBadge?.setVisible(false);
      this.updateInventoryUI();
      this.updateHotbarActionUI();
      return true;
    }

    startTramJourney(destinationKey) {
      if (destinationKey !== "bahnhofstrasse") {
        this.refreshUILock();
        return;
      }

      if (this.__tramSwitching || this.tramTransitActive) return;

      if (!this.consumeCityTicket()) {
        this.__tramSwitching = false;
        this.refreshUILock();
        return;
      }

      this.__tramSwitching = true;
      this.tramTransitActive = true;
      this.setUILocked(true);
      this.player.setVelocity(0, 0);

      const travelData = {
        coins: this.developerMode ? 999999 : this.coins,
        hp: this.hp,
        hasCityTicket: false,
        fromDeveloperMode: this.developerMode,
        developerMode: this.developerMode,
        inventory: { ...this.inventory },
        booksOwned: { ...this.booksOwned },
        gandhiStoryEligible: this.gandhiStoryEligible,
        gandhiEncounterFinished: this.gandhiEncounterFinished,
        gandhiDead: this.gandhiDead,
        darkGandhiDefeated: this.darkGandhiDefeated,
        gandhiPassOriginSide: this.gandhiPassOriginSide,
        gandhiPassEnteredZone: this.gandhiPassEnteredZone,
        gandhiPassCompleted: this.gandhiPassCompleted,
        gandhiSticksLooted: this.gandhiSticksLooted,
        booksRead: { ...this.booksRead },
        abilitiesUnlocked: { ...this.abilitiesUnlocked },
        activeAbility: this.activeAbility,
        forItselfCooldownUntil: this.forItselfCooldownUntil,
        hotbarItems: [...this.hotbarItems],
        selectedHotbarIndex: this.selectedHotbarIndex,
        sprintExpiresAt: this.sprintExpiresAt
      };

      this.cameras.main.stopFollow();
      this.cameras.main.pan(410, GAME_HEIGHT / 2, 360, "Sine.easeInOut");

      this.tweens.add({
        targets: this.player,
        x: 137,
        y: 250,
        duration: 430,
        ease: "Sine.easeInOut",
        onComplete: () => {
          if (!this.sys.isActive()) return;

          this.player.setVisible(false);
          if (this.player.body) this.player.body.enable = false;

          if (this.tram?.active) {
            this.tweens.add({
              targets: this.tram,
              x: 520,
              duration: 1900,
              ease: "Sine.easeIn"
            });
          }

          this.time.delayedCall(780, () => {
            if (!this.sys.isActive()) return;

            this.cameras.main.fadeOut(480, 0, 0, 0);

            this.time.delayedCall(500, () => {
              if (!this.sys.isActive()) return;

              this.cameras.main.resetFX();
              this.scene.start("BahnhofquaiScene", travelData);
            });
          });
        }
      });
    }

    animateCoinGain(amount) {
      const gain = this.add.text(44, 46, `+${amount}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ffdf65",
        stroke: "#5c3c11",
        strokeThickness: 4
      })
        .setScrollFactor(0)
        .setDepth(390)
        .setOrigin(0.5);

      this.tweens.add({
        targets: gain,
        y: 25,
        scale: 1.25,
        alpha: 0,
        duration: 900,
        ease: "Quad.easeOut",
        onComplete: () => gain.destroy()
      });

      if (this.coinText) {
        this.tweens.add({
          targets: this.coinText,
          scale: 1.45,
          duration: 140,
          yoyo: true,
          repeat: 2
        });
      }
    }

    setControlsVisible(visible) {
      this.controlObjects.forEach((object) => {
        object.setVisible(visible);
        if (object.input) {
          object.input.enabled = visible;
        }
      });

      if (!visible) {
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJumpRequested = false;
        this.touchShootRequested = false;
      }
    }

    setUILocked(locked) {
      this.uiLocked = locked;
      this.setControlsVisible(!locked && !this.inVoid && !this.rewindActive);

      if (this.hotbarDOM) {
        this.hotbarDOM.style.pointerEvents = locked ? "none" : "auto";
        this.hotbarDOM.style.opacity = locked ? "0.72" : "1";
      }

      if (locked && this.player?.body) {
        this.player.setVelocityX(0);
      }

      // updateHotbarActionUI() already refreshes both the ability and
      // weapon touch controls. Rebuilding them three times on every lock
      // transition caused unnecessary destroy/create churn on mobile Safari.
      this.updateHotbarActionUI?.();
    }

    openTicketModal() {
      if (this.ticketModal || this.playerDying || this.danceOverlay) return;

      if (this.itemsModal) this.closeItemsModal();
      if (this.lootModal) this.closeLootModal();

      this.ensureTicketMachineInteractive();
      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "ticket",
        width: "min(92%, 530px)",
        background: "#f2e5bf",
        border: "#253a4b",
        shade: "rgba(5, 6, 11, 0.78)",
        padding: "15px 18px 18px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.ticketModal = modal;

      const top = document.createElement("div");
      Object.assign(top.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: "8px"
      });

      const back = this.createDOMButton("← ZURÜCK", () => this.closeTicketModal(), {
        color: "#23485d",
        background: "#d5e7e6",
        border: "#6b95aa",
        width: "165px",
        minHeight: "42px",
        fontSize: "8px",
        padding: "7px 9px"
      });

      top.appendChild(back);

      const title = this.createDOMText("TICKETAUTOMAT", {
        fontSize: "15px",
        color: "#253a4b",
        margin: "4px 0 18px"
      });

      const line = this.createDOMText("1 TRAM-TICKET · 1 FAHRT", {
        fontSize: "10px",
        color: "#2d2a25",
        margin: "0 0 8px"
      });

      const price = this.createDOMText("10.-", {
        fontSize: "18px",
        color: "#2d2a25",
        margin: "0 0 15px"
      });

      const buy = this.createDOMButton("KAUFEN", () => this.tryBuyTicket(), {
        color: (this.developerMode || this.coins >= 10) ? "#215f3f" : "#73706a",
        background: (this.developerMode || this.coins >= 10) ? "#bfe0c6" : "#cbc5b8",
        border: "#6b705f",
        width: "180px",
        minHeight: "46px",
        fontSize: "11px",
        padding: "9px 12px"
      });
      buy.style.margin = "0 auto";
      buy.dataset.ticketBuy = "true";

      this.ticketStatusText = this.createDOMText(
        this.hasCityTicket
          ? "TICKET BEREITS GEKAUFT"
          : (
              this.developerMode
                ? "∞ COINS · DEVELOPER"
                : (this.coins < 10 ? `${this.coins} COINS · NOCH NICHT GENUG` : `${this.coins} COINS`)
            ),
        {
          fontSize: "7px",
          color: this.hasCityTicket || this.developerMode || this.coins >= 10 ? "#315d43" : "#8b3a36",
          margin: "15px 0 0"
        }
      );

      modal.panel.append(top, title, line, price, buy, this.ticketStatusText);
      this.refreshUILock();
    }

    tryBuyTicket() {
      if (!this.ticketModal) return;

      if (this.hasCityTicket) {
        if (this.ticketStatusText) {
          this.ticketStatusText.textContent = "TICKET BEREITS GEKAUFT";
          this.ticketStatusText.style.color = "#315d43";
        }
        return;
      }

      if (!this.developerMode && this.coins < 10) {
        if (this.ticketStatusText) {
          this.ticketStatusText.textContent = "NICHT GENUG COINS!";
          this.ticketStatusText.style.color = "#8b3a36";
        }
        return;
      }

      if (!this.developerMode) {
        this.coins -= 10;
      }

      this.hasCityTicket = true;
      this.updateCoinHUD();
      this.updateInventoryUI();
      this.addItemToHotbar("ticket");
      this.enableTramBoarding();

      if (this.ticketStatusText) {
        this.ticketStatusText.textContent = "TICKET GEKAUFT!";
        this.ticketStatusText.style.color = "#315d43";
      }

      const buy = this.ticketModal?.panel?.querySelector("[data-ticket-buy='true']");
      if (buy) {
        buy.textContent = "GEKAUFT";
        buy.style.background = "#bfe0c6";
        buy.style.color = "#315d43";
      }
    }

    closeTicketModal() {
      if (!this.ticketModal) return;

      this.destroyDOMModal(this.ticketModal);
      this.ticketModal = null;
      this.ticketStatusText = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }

    scheduleLootedCharacterDespawn(target, delayMs = 30000, onDone = null) {
      const targets = Array.isArray(target)
        ? target.filter(Boolean)
        : [target].filter(Boolean);

      targets.forEach((object) => {
        object?.disableInteractive?.();
      });

      if (targets.length === 0) return;

      this.time.delayedCall(delayMs, () => {
        targets.forEach((object) => {
          if (object?.active) {
            this.tweens.killTweensOf(object);
            object.destroy?.(true);
          }
        });
        onDone?.();
      });
    }

    makeDeadBouncersLootable() {
      this.fightBouncers.forEach((guard) => {
        if (!guard?.active) return;

        guard.removeAllListeners("pointerdown");
        guard.removeAllListeners("pointerover");
        guard.removeAllListeners("pointerout");
        guard.setSize(118, 82);
        guard.setInteractive({ useHandCursor: true });
        guard.setDepth(18);

        guard.on("pointerdown", (pointer) => {
          pointer.event?.preventDefault?.();
          pointer.event?.stopPropagation?.();
          this.openLootModal();
        });
      });
    }

    openLootModal() {
      if (
        this.lootModal ||
        this.ticketModal ||
        this.itemsModal ||
        this.lionChoiceModal ||
        this.playerDying
      ) return;
      if (this.danceOverlay) return;

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "loot",
        width: "min(91%, 520px)",
        background: "#ffedc0",
        border: "#5a402a",
        shade: "rgba(5, 6, 11, 0.68)",
        padding: "20px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.lootModal = modal;

      const question = this.createDOMText(
        this.bouncerTipStolen
          ? "Hier gibt es nichts mehr zu holen."
          : "Das Trinkgeld der Türsteher klauen?",
        {
          fontSize: "9px",
          color: "#302319",
          margin: "2px 0 20px",
          lineHeight: "1.7"
        }
      );

      const buttons = document.createElement("div");
      Object.assign(buttons.style, {
        display: "grid",
        gridTemplateColumns: this.bouncerTipStolen ? "1fr" : "1fr 1fr",
        gap: "10px",
        maxWidth: this.bouncerTipStolen ? "210px" : "330px",
        margin: "0 auto"
      });

      if (!this.bouncerTipStolen) {
        const yes = this.createDOMButton("JA", () => this.stealBouncerTips(), {
          color: "#245135",
          background: "#b8d7b5",
          border: "#6f8f70",
          fontSize: "10px"
        });

        const no = this.createDOMButton("NEIN", () => this.closeLootModal(), {
          color: "#382b21",
          background: "#d5c6a6",
          border: "#8a7659",
          fontSize: "10px"
        });

        buttons.append(yes, no);
      } else {
        const back = this.createDOMButton("ZURÜCK", () => this.closeLootModal(), {
          color: "#382b21",
          background: "#d5c6a6",
          border: "#8a7659",
          fontSize: "9px"
        });

        buttons.appendChild(back);
      }

      const status = this.createDOMText("", {
        fontSize: "9px",
        color: "#856015",
        margin: "14px 0 0"
      });
      status.dataset.lootStatus = "true";

      modal.panel.append(question, buttons, status);
      this.refreshUILock();
    }

    stealBouncerTips() {
      if (this.bouncerTipStolen) return;

      this.bouncerTipStolen = true;
      this.coins += 100;
      this.updateCoinHUD();
      this.animateCoinGain(100);

      const status = this.lootModal?.panel?.querySelector("[data-loot-status='true']");
      if (status) {
        status.textContent = "+100 COINS";
      }

      const buttons = this.lootModal?.panel?.querySelectorAll("button");
      buttons?.forEach((button) => {
        button.disabled = true;
        button.style.opacity = "0.6";
      });

      const lootedBouncers = [...this.fightBouncers];
      this.scheduleLootedCharacterDespawn(
        lootedBouncers,
        30000,
        () => {
          this.fightBouncers = this.fightBouncers.filter(
            (guard) => !lootedBouncers.includes(guard)
          );
        }
      );

      this.time.delayedCall(850, () => this.closeLootModal());
    }

    closeLootModal() {
      if (!this.lootModal) return;

      this.destroyDOMModal(this.lootModal);
      this.lootModal = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }

    createSpeechBubble(x, y, text, tailOffset = 0) {
      const width = Math.min(315, Math.max(165, text.length * 6.2 + 56));
      const height = text.length > 34 ? 82 : 60;

      const bubble = this.add.container(x, y).setDepth(80);

      const g = this.add.graphics();
      g.fillStyle(0xffefc2, 1);
      g.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
      g.lineStyle(4, 0x5d3f27, 1);
      g.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

      g.fillStyle(0xffefc2, 1);
      g.fillTriangle(
        tailOffset - 12,
        height / 2 - 2,
        tailOffset + 12,
        height / 2 - 2,
        tailOffset,
        height / 2 + 18
      );
      g.lineStyle(3, 0x5d3f27, 1);
      g.lineBetween(
        tailOffset - 12,
        height / 2 - 1,
        tailOffset,
        height / 2 + 18
      );
      g.lineBetween(
        tailOffset,
        height / 2 + 18,
        tailOffset + 12,
        height / 2 - 1
      );

      const label = this.add.text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#2a2017",
        align: "center",
        wordWrap: { width: width - 30 }
      }).setOrigin(0.5);

      bubble.add([g, label]);
      return bubble;
    }

    clearBouncerBubble() {
      if (this.bouncerDialogueBubble) {
        this.bouncerDialogueBubble.destroy(true);
        this.bouncerDialogueBubble = null;
      }
    }

    startBouncerDialogue() {
      if (
        this.ticketModal ||
        this.bouncerDialogueActive ||
        this.fightActive ||
        this.fightFinished
      ) return;

      this.setUILocked(true);
      this.bouncerDialogueActive = true;
      this.bouncerDialogueStep = 0;
      this.dialogueIgnoreUntil = this.time.now + 260;
      this.showBouncerDialogueStep();
    }

    showBouncerDialogueStep() {
      this.clearBouncerBubble();

      if (!this.bouncer || !this.player) return;

      const bouncerX = this.bouncer.x - 52;
      const bouncerY = this.bouncer.y - 122;
      const simonY = this.player.y - 118;

      if (this.bouncerDialogueStep === 0) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          bouncerX,
          bouncerY,
          "was wetsch?",
          58
        );
        return;
      }

      if (this.bouncerDialogueStep === 1) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          this.player.x,
          simonY,
          "Wer wür Günne: 5 Türsteher, oder ein Leu?",
          0
        );
        return;
      }

      if (this.bouncerDialogueStep === 2) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          bouncerX,
          bouncerY,
          "Was isch das für e Frag? Safe 5 Türsteher!",
          62
        );
        return;
      }

      if (this.bouncerDialogueStep === 3) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          this.player.x,
          simonY,
          "Ich glaub dir nöd",
          0
        );
        return;
      }

      if (this.bouncerDialogueStep === 4) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          bouncerX - 18,
          bouncerY - 4,
          "Du huere Sackgsicht! Lueg guet ane, ich zeigs dir!",
          76
        );
        return;
      }

      if (this.bouncerDialogueStep === 5) {
        this.bouncerDialogueBubble = this.createSpeechBubble(
          bouncerX - 25,
          bouncerY - 8,
          "Jungs chömed use, mir münd mal wieder en Leu zerstöre!",
          76
        );
      }
    }

    advanceBouncerDialogue() {
      if (!this.bouncerDialogueActive) return;

      if (this.bouncerDialogueStep < 5) {
        this.bouncerDialogueStep += 1;
        this.dialogueIgnoreUntil = this.time.now + 190;
        this.showBouncerDialogueStep();
        return;
      }

      this.clearBouncerBubble();
      this.bouncerDialogueActive = false;
      this.bouncerDialogueStep = 0;
      this.startFightSequence();
    }

    setupDeveloperLionChoice() {
      if (!this.player || this.fightActive) return;

      this.clearBouncerBubble();
      this.bouncerDialogueActive = false;
      this.bouncerDialogueStep = 0;
      this.fightActive = false;
      this.fightFinished = true;
      this.lionChoiceShown = false;

      // Simon wird direkt vor das HIVE gesetzt.
      this.player.setPosition(1510, 245);
      this.player.setVelocity(0, 0);
      this.player.setVisible(true);
      this.player.clearTint();
      this.player.play("simon-idle", true);

      // Der bereits vorhandene Türsteher wird als besiegt dargestellt.
      if (this.bouncer) {
        this.tweens.killTweensOf(this.bouncer);
        this.bouncer.disableInteractive();
        this.bouncer.setPosition(1812, GROUND_TOP - 15);
        this.bouncer.setAngle(86);
        this.bouncer.setScale(1);
      }

      const positions = [
        [1590, -82],
        [1647, 88],
        [1701, -91],
        [1756, 84]
      ];

      const extras = positions.map(([x, angle], index) => {
        const guard = this.createFightBouncer(x, GROUND_TOP - 15, index + 1);
        guard.setAngle(angle);
        return guard;
      });

      this.fightBouncers = [...extras, this.bouncer].filter(Boolean);
      this.makeDeadBouncersLootable();

      const lion = this.createLion(1738, GROUND_TOP - 37);
      this.tweens.killTweensOf(lion);
      lion.setScale(1.05, 0.9);
      lion.setAngle(0);
      this.fightLion = lion;

      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
      this.cameras.main.setDeadzone(240, 80);

      this.time.delayedCall(180, () => {
        this.showLionChoiceQuestion();
      });
    }

    createFightBouncer(x, y, variant = 0) {
      const container = this.add.container(x, y).setDepth(13);
      const g = this.add.graphics();

      const skinColors = [0xc99473, 0xb98264, 0xd0a181, 0xa9765b];
      const hairColors = [0x221f22, 0x3a2c25, 0x17191c, 0x4a372a];
      const skin = skinColors[variant % skinColors.length];
      const hair = hairColors[variant % hairColors.length];

      // Boots + Beine.
      g.fillStyle(0x0b0c0f, 1);
      g.fillRect(-17, 28, 13, 39);
      g.fillRect(4, 28, 13, 39);
      g.fillRect(-21, 64, 20, 9);
      g.fillRect(1, 64, 22, 9);

      // Schwarzes Security-Outfit.
      g.fillStyle(0x15161a, 1);
      g.fillRoundedRect(-29, -24, 58, 58, 9);
      g.fillStyle(0x24262b, 1);
      g.fillTriangle(-25, -18, -39, 9, -22, 12);
      g.fillTriangle(25, -18, 39, 9, 22, 12);

      // Kopf.
      g.fillStyle(skin, 1);
      g.fillRect(-7, -35, 14, 11);
      g.fillRoundedRect(-15, -60, 30, 29, 7);

      // Haare + Bart.
      g.fillStyle(hair, 1);
      g.fillRect(-14, -62, 28, 7);
      g.fillRect(-12, -46, 24, 11);
      g.fillTriangle(-11, -35, 0, -29, 11, -35);

      // Genervte Augenbrauen.
      g.lineStyle(3, hair, 1);
      g.lineBetween(-11, -56, -4, -53);
      g.lineBetween(4, -53, 11, -56);

      g.fillStyle(0x151515, 1);
      g.fillRect(-8, -51, 3, 2);
      g.fillRect(5, -51, 3, 2);

      // Fäuste / Arme.
      g.fillStyle(skin, 1);
      g.fillRoundedRect(-36, -8, 14, 36, 6);
      g.fillRoundedRect(22, -8, 14, 36, 6);
      g.fillCircle(-28, 25, 8);
      g.fillCircle(28, 25, 8);

      container.add(g);
      container.setSize(78, 140);

      return container;
    }

    createLion(x, y) {
      const lion = this.add.container(x, y).setDepth(14);
      const g = this.add.graphics();

      // Schwanz.
      g.lineStyle(7, 0xc78527, 1);
      g.beginPath();
      g.moveTo(33, 4);
      g.lineTo(54, -10);
      g.lineTo(61, -27);
      g.strokePath();
      g.fillStyle(0x70411f, 1);
      g.fillCircle(62, -29, 7);

      // Körper.
      g.fillStyle(0xd99a31, 1);
      g.fillRoundedRect(-15, -12, 58, 34, 12);

      // Hinter- und Vorderbeine.
      g.fillRect(20, 14, 10, 28);
      g.fillRect(-8, 14, 10, 28);
      g.fillStyle(0xbd7822, 1);
      g.fillRect(18, 38, 15, 6);
      g.fillRect(-10, 38, 15, 6);

      // Mähne.
      g.fillStyle(0x75411f, 1);
      g.fillCircle(-23, -9, 29);
      g.fillCircle(-34, -14, 17);
      g.fillCircle(-17, -27, 18);

      // Gesicht.
      g.fillStyle(0xe5aa43, 1);
      g.fillRoundedRect(-41, -23, 35, 31, 11);
      g.fillStyle(0x2a2119, 1);
      g.fillRect(-34, -12, 4, 3);
      g.fillRect(-18, -12, 4, 3);
      g.fillTriangle(-26, -4, -21, -4, -23, 1);

      // Ohren.
      g.fillStyle(0xc9852d, 1);
      g.fillCircle(-38, -28, 8);
      g.fillCircle(-10, -29, 8);

      lion.add(g);
      lion.setSize(115, 92);

      // Kleine Laufbewegung.
      this.tweens.add({
        targets: lion,
        y: y - 3,
        duration: 240,
        yoyo: true,
        repeat: -1
      });

      return lion;
    }

    showImpact(x, y, word = "POW!") {
      const hit = this.add.text(x, y, word, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "11px",
        color: "#fff1a8",
        stroke: "#6b1f2b",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(95)
        .setAngle(-8);

      this.tweens.add({
        targets: hit,
        y: y - 22,
        scale: 1.25,
        alpha: 0,
        duration: 420,
        onComplete: () => hit.destroy()
      });
    }

    startFightSequence() {
      if (this.fightActive || this.fightFinished) return;

      this.fightActive = true;
      this.setUILocked(true);

      if (this.bouncer) {
        this.tweens.killTweensOf(this.bouncer);
        this.bouncer.disableInteractive();
        this.bouncer.setScale(1);
      }

      // Kamera bleibt beim HIVE und Simon wird zum Zuschauer.
      this.cameras.main.stopFollow();
      this.cameras.main.pan(1745, GAME_HEIGHT / 2, 650, "Sine.easeInOut");

      const doorX = 1700;
      const exitY = GROUND_TOP - 63;
      const targetXs = [1615, 1655, 1695, 1735];

      const extras = targetXs.map((targetX, index) => {
        const guard = this.createFightBouncer(doorX, exitY, index + 1);
        guard.setAlpha(0);
        guard.setScale(0.8);

        this.tweens.add({
          targets: guard,
          alpha: 1,
          scale: 1,
          x: targetX,
          duration: 520,
          delay: index * 190,
          ease: "Back.easeOut"
        });

        return guard;
      });

      this.fightBouncers = [...extras, this.bouncer].filter(Boolean);

      // Der Löwe kommt klar von rechts ins Bild.
      this.time.delayedCall(1250, () => {
        const lion = this.createLion(2170, GROUND_TOP - 44);
        this.fightLion = lion;

        this.tweens.add({
          targets: lion,
          x: 1905,
          duration: 1450,
          ease: "Sine.easeInOut",
          onComplete: () => {
            this.time.delayedCall(280, () => this.runFightRounds());
          }
        });
      });
    }

    runFightRounds() {
      if (!this.fightLion || this.fightBouncers.length === 0) {
        this.finishFightSequence();
        return;
      }

      // Vor dem eigentlichen KO werfen alle kurz die Fäuste.
      this.fightBouncers.forEach((guard, index) => {
        if (!guard?.active) return;

        this.tweens.add({
          targets: guard,
          x: guard.x + 12,
          duration: 120,
          yoyo: true,
          repeat: 2,
          delay: index * 65,
          onYoyo: () => {
            this.showImpact(
              Math.min(guard.x + 45, this.fightLion.x - 28),
              GROUND_TOP - 92,
              index % 2 === 0 ? "POW!" : "BAM!"
            );
          }
        });
      });

      this.time.delayedCall(850, () => {
        const order = [...this.fightBouncers];
        this.knockOutNextBouncer(order, 0);
      });
    }

    knockOutNextBouncer(order, index) {
      if (index >= order.length) {
        this.time.delayedCall(550, () => this.finishFightSequence());
        return;
      }

      const guard = order[index];
      if (!guard?.active || !this.fightLion) {
        this.knockOutNextBouncer(order, index + 1);
        return;
      }

      const lion = this.fightLion;
      const attackX = lion.x - 73 - (index % 2) * 12;

      // Türsteher stürmt vor und schlägt.
      this.tweens.add({
        targets: guard,
        x: attackX,
        duration: 330,
        ease: "Sine.easeIn",
        onComplete: () => {
          this.showImpact(lion.x - 42, lion.y - 28, "POW!");

          this.tweens.add({
            targets: guard,
            x: guard.x + 12,
            duration: 95,
            yoyo: true,
            repeat: 1
          });

          // Löwe kontert.
          this.tweens.add({
            targets: lion,
            x: lion.x - 23,
            angle: -4,
            duration: 125,
            yoyo: true,
            onYoyo: () => {
              this.showImpact(guard.x + 15, guard.y - 22, "RARR!");
            },
            onComplete: () => {
              const fallDirection = index % 2 === 0 ? -1 : 1;

              this.tweens.add({
                targets: guard,
                x: guard.x + fallDirection * (58 + index * 5),
                y: GROUND_TOP - 15,
                angle: fallDirection * (82 + index * 3),
                duration: 420,
                ease: "Quad.easeOut",
                onComplete: () => {
                  guard.y = GROUND_TOP - 15;
                  this.time.delayedCall(
                    260,
                    () => this.knockOutNextBouncer(order, index + 1)
                  );
                }
              });
            }
          });
        }
      });
    }

    finishFightSequence() {
      if (!this.fightLion) {
        this.fightActive = false;
        this.fightFinished = true;
        this.makeDeadBouncersLootable();
        this.ensureTicketMachineInteractive();
        this.showLionChoiceQuestion();
        return;
      }

      const lion = this.fightLion;
      this.tweens.killTweensOf(lion);

      // Der Löwe setzt sich zwischen die besiegten Türsteher.
      this.tweens.add({
        targets: lion,
        x: 1740,
        y: GROUND_TOP - 37,
        angle: 0,
        duration: 720,
        ease: "Sine.easeInOut",
        onComplete: () => {
          lion.setScale(1.05, 0.9);

          this.purrText = this.add.text(
            lion.x + 8,
            lion.y - 70,
            "prrrr...",
            {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "9px",
              color: "#fff2c7",
              stroke: "#5d3b22",
              strokeThickness: 4
            }
          )
            .setOrigin(0.5)
            .setDepth(90);

          this.tweens.add({
            targets: [lion, this.purrText],
            y: "-=2",
            duration: 650,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });

          this.tweens.add({
            targets: this.purrText,
            alpha: { from: 0.45, to: 1 },
            duration: 700,
            yoyo: true,
            repeat: -1
          });

          this.fightActive = false;
          this.fightFinished = true;
          this.makeDeadBouncersLootable();
          this.ensureTicketMachineInteractive();

          // Wieder normale Kamera-Steuerung, bevor der Löwe Simon anspricht.
          this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
          this.cameras.main.setDeadzone(240, 80);

          this.time.delayedCall(650, () => this.showLionChoiceQuestion());
        }
      });
    }

    clearLionQuestion() {
      if (this.lionQuestionBubble) {
        this.lionQuestionBubble.destroy(true);
        this.lionQuestionBubble = null;
      }

      if (this.lionChoiceModal) {
        this.destroyDOMModal(this.lionChoiceModal);
        this.lionChoiceModal = null;
      }

      this.lionChoiceShown = false;

      // Die Auswahl sperrt Simon. Sobald sie verschwindet, wird diese
      // spezifische Sperre sicher gelöst. Die anschließende Aktion kann
      // bei Bedarf sofort wieder ihre eigene Sperre setzen.
      this.setUILocked(false);
      this.setControlsVisible(true);
    }

    showLionChoiceQuestion() {
      if (this.lionChoiceShown || !this.fightLion || this.playerDying) return;

      this.lionChoiceShown = true;
      this.setUILocked(true);

      this.lionQuestionBubble = this.createSpeechBubble(
        this.fightLion.x - 15,
        this.fightLion.y - 105,
        "Willsch go tanze Gah?",
        0
      );

      const modal = this.createDOMModal({
        key: "lion-choice",
        width: "min(92%, 500px)",
        placement: "bottom",
        background: "#12151d",
        border: "#ffe6a8",
        shade: "rgba(0, 0, 0, 0)",
        padding: "9px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.lionChoiceModal = modal;

      const choices = document.createElement("div");
      Object.assign(choices.style, {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.18fr",
        gap: "7px",
        width: "100%"
      });

      const yes = this.createDOMButton("JA", () => this.chooseDanceWithLion(), {
        color: "#bff3bd",
        background: "#302d34",
        border: "#806f55",
        fontSize: "9px",
        padding: "6px 4px"
      });

      const no = this.createDOMButton("NEIN", () => this.chooseNoDance(), {
        color: "#f3ddbd",
        background: "#302d34",
        border: "#806f55",
        fontSize: "9px",
        padding: "6px 4px"
      });

      const fight = this.createDOMButton("KÄMPFEN", () => this.startLionCombat(), {
        color: "#ffaaa6",
        background: "#302d34",
        border: "#806f55",
        fontSize: "7px",
        padding: "6px 3px"
      });

      choices.append(yes, no, fight);
      modal.panel.appendChild(choices);
      this.refreshUILock();
    }

    stopLionPurring() {
      if (this.purrText) {
        this.tweens.killTweensOf(this.purrText);
        this.purrText.destroy();
        this.purrText = null;
      }

      if (this.fightLion) {
        this.tweens.killTweensOf(this.fightLion);
        this.fightLion.setScale(1);
        this.fightLion.setAngle(0);
      }
    }

    chooseDanceWithLion() {
      if (!this.fightLion || this.playerDying) return;

      this.clearLionQuestion();
      this.stopLionPurring();
      this.enterHiveDance();
    }

    enterHiveDance() {
      this.setUILocked(true);

      this.player.setVisible(false);
      this.fightLion?.setVisible(false);

      const overlay = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(600);

      const bg = this.add.graphics();
      bg.fillStyle(0x080711, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      bg.fillStyle(0x171125, 1);
      bg.fillRect(0, 80, GAME_WIDTH, 260);
      bg.fillStyle(0x2c2038, 1);
      for (let x = 0; x < GAME_WIDTH; x += 62) {
        bg.fillRect(x, 310, 45, 12);
      }

      const hive = this.add.text(GAME_WIDTH / 2, 42, "HIVE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "27px",
        color: "#fff4b8",
        stroke: "#7c2eb4",
        strokeThickness: 8
      }).setOrigin(0.5);

      const disco = this.add.graphics();
      disco.fillStyle(0xdbe5ed, 1);
      disco.fillCircle(GAME_WIDTH / 2, 112, 25);
      disco.lineStyle(2, 0x6c7180, 1);
      disco.strokeCircle(GAME_WIDTH / 2, 112, 25);
      for (let i = -18; i <= 18; i += 9) {
        disco.lineBetween(GAME_WIDTH / 2 - 20, 112 + i, GAME_WIDTH / 2 + 20, 112 + i);
        disco.lineBetween(GAME_WIDTH / 2 + i, 92, GAME_WIDTH / 2 + i, 132);
      }

      const lights = this.add.graphics();
      lights.fillStyle(0xff4f9a, 0.14);
      lights.fillTriangle(GAME_WIDTH / 2, 120, 110, 330, 305, 330);
      lights.fillStyle(0x45d8ff, 0.14);
      lights.fillTriangle(GAME_WIDTH / 2, 120, 510, 330, 745, 330);
      lights.fillStyle(0xc876ff, 0.12);
      lights.fillTriangle(GAME_WIDTH / 2, 120, 310, 330, 555, 330);

      const danceSimon = this.add.sprite(330, 252, "simon", 0)
        .setScale(0.36)
        .setScrollFactor(0)
        .setDepth(620);
      danceSimon.play("simon-run", true);

      const danceLion = this.createLion(500, 278)
        .setScrollFactor(0)
        .setDepth(620);

      const caption = this.add.text(GAME_WIDTH / 2, 355, "SIMON & LEU", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ffe6a1"
      }).setOrigin(0.5);

      overlay.add([bg, lights, disco, hive, danceSimon, danceLion, caption]);

      this.tweens.add({
        targets: danceSimon,
        angle: { from: -7, to: 7 },
        y: "-=8",
        duration: 330,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: danceLion,
        angle: { from: -5, to: 6 },
        x: "+=14",
        duration: 390,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: hive,
        alpha: { from: 0.65, to: 1 },
        duration: 480,
        yoyo: true,
        repeat: -1
      });

      this.danceOverlay = overlay;
      this.createDanceBackButton();
      this.refreshUILock();
    }

    createDanceBackButton() {
      const root = this.getDOMUIRoot();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='dance-back']")
        .forEach((node) => node.remove());

      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "dance-back";

      Object.assign(wrapper.style, {
        position: "absolute",
        left: "12px",
        top: "12px",
        zIndex: "100001",
        pointerEvents: "auto",
        touchAction: "manipulation"
      });

      const back = this.createDOMButton("← STRASSE", () => this.exitHiveDance(), {
        color: "#fff3ca",
        background: "#352540",
        border: "#c69ce8",
        width: "150px",
        minHeight: "42px",
        fontSize: "8px",
        padding: "7px 9px"
      });

      wrapper.appendChild(back);
      root.appendChild(wrapper);
      this.danceBackUI = { overlay: wrapper };
    }

    exitHiveDance() {
      if (!this.danceOverlay) return;

      if (this.danceBackUI) {
        this.destroyDOMModal(this.danceBackUI);
        this.danceBackUI = null;
      }

      // Stoppe alle endlosen Tanz-Tweens, bevor die Figuren zerstört werden.
      this.danceOverlay.list?.forEach((child) => {
        this.tweens.killTweensOf(child);
      });

      this.danceOverlay.destroy(true);
      this.danceOverlay = null;

      // Simon kommt allein wieder auf die Straße; der Löwe bleibt im Club.
      if (this.fightLion) {
        this.tweens.killTweensOf(this.fightLion);
        this.fightLion.destroy(true);
        this.fightLion = null;
      }

      this.player.setVisible(true);
      if (this.player.body) this.player.body.enable = true;
      this.player.play("simon-idle", true);

      this.refreshUILock();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }

    chooseNoDance() {
      if (!this.fightLion || this.playerDying) return;

      this.clearLionQuestion();
      this.stopLionPurring();
      this.lionExitActive = true;
      this.refreshUILock();

      const lion = this.fightLion;
      lion.setScale(1);

      this.tweens.add({
        targets: lion,
        x: 1700,
        y: 255,
        scale: 0.55,
        alpha: 0,
        duration: 1300,
        ease: "Sine.easeInOut",
        onComplete: () => {
          lion.destroy(true);
          this.fightLion = null;
          this.lionExitActive = false;
          this.refreshUILock();
          this.setUILocked(false);
          this.setControlsVisible(true);
          this.ensureTicketMachineInteractive();
          this.ensureTramBoardingInteractive();
        }
      });
    }

    startLionCombat() {
      if (!this.fightLion || this.playerDying) return;

      this.clearLionQuestion();
      this.stopLionPurring();

      this.lionCombatActive = true;
      this.nextLionHitAt = this.time.now + 500;

      this.fightLion.setVisible(true);
      this.fightLion.setAlpha(1);
      this.fightLion.setScale(1);
      this.fightLion.y = GROUND_TOP - 44;

      this.refreshUILock();
      this.setUILocked(false);
      this.setControlsVisible(true);
      this.ensureTicketMachineInteractive();
    }

    updateLionCombat(time, delta) {
      if (!this.lionCombatActive || !this.fightLion || this.playerDying) return;
      if (this.uiLocked) return;

      const lion = this.fightLion;
      const dx = this.player.x - lion.x;
      const direction = Math.sign(dx) || 1;
      const speed = 132;

      lion.x += direction * speed * (delta / 1000);
      lion.y = GROUND_TOP - 44 + Math.sin(time / 115) * 2;
      lion.scaleX = direction < 0 ? 1 : -1;
      lion.scaleY = 1;

      const closeEnough = Math.abs(dx) < 76 && Math.abs(this.player.y - lion.y) < 95;

      if (closeEnough && time >= this.nextLionHitAt) {
        this.nextLionHitAt = time + 950;
        this.applyPlayerDamage(40);
      }
    }

    applyPlayerDamage(amount) {
      if (this.playerDying) return;

      this.hp = Math.max(0, this.hp - amount);
      this.updateHpBar();
      this.showImpact(this.player.x + 8, this.player.y - 55, "HIT!");
      this.cameras.main.shake(130, 0.008);

      if (this.hp <= 0) {
        this.killSimonAndRestart();
        return;
      }

      // Eigene HIT-Sequenz aus dem Spritesheet.
      this.playerHitUntil = this.time.now + 360;
      this.player.anims.stop();
      this.player.play("simon-hit", true);
      this.player.setTint(0xff8b8b);

      const lionX = this.fightLion?.x ?? (this.player.x - 1);
      const knockbackDirection = Math.sign(this.player.x - lionX) || 1;
      this.player.setVelocityX(knockbackDirection * 115);

      this.time.delayedCall(360, () => {
        if (this.playerDying) return;
        this.player.clearTint();

        const grounded =
          this.player.body?.blocked.down ||
          this.player.body?.touching.down;

        if (grounded) {
          this.player.play("simon-idle", true);
        }
      });
    }

    killSimonAndRestart() {
      if (this.playerDying) return;

      this.playerDying = true;
      this.lionCombatActive = false;
      this.setUILocked(true);
      this.player.setVelocity(0, 0);
      this.playerHitUntil = Number.POSITIVE_INFINITY;
      this.player.clearTint();
      this.player.anims.stop();
      this.player.play("simon-ko", true);

      const gameOver = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, "SIMON IST K.O.", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#ffd0c8",
        stroke: "#541c22",
        strokeThickness: 7
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(800);

      this.tweens.add({
        targets: gameOver,
        alpha: { from: 0, to: 1 },
        duration: 350
      });

      this.time.delayedCall(1600, () => {
        window.location.reload();
      });
    }

    createGround() {
      const ground = this.add.rectangle(
        WORLD_WIDTH / 2,
        GROUND_TOP + (GAME_HEIGHT - GROUND_TOP) / 2,
        WORLD_WIDTH,
        GAME_HEIGHT - GROUND_TOP,
        0x000000,
        0
      );

      this.physics.add.existing(ground, true);
      this.ground = ground;
    }

    createAnimations() {
      const makeAnim = (key, start, end, frameRate, repeat = -1) => {
        if (this.anims.exists(key)) return;

        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers("simon", { start, end }),
          frameRate,
          repeat
        });
      };

      makeAnim("simon-idle", 0, 3, 4);
      makeAnim("simon-shoot", 4, 7, 10, 0);
      makeAnim("simon-run", 8, 17, 12);
      makeAnim("simon-jump", 18, 25, 10, 0);
      makeAnim("simon-hit", 26, 28, 11, 0);
      makeAnim("simon-ko", 29, 31, 7, 0);
    }

    createPlayer() {
      this.player = this.physics.add.sprite(405, 235, "simon", 0);

      this.player.setScale(0.42);
      this.player.setCollideWorldBounds(true);
      this.player.body.setGravityY(900);
      this.player.body.setSize(92, 205);
      this.player.body.setOffset(74, 66);

      this.physics.add.collider(this.player, this.ground);

      this.player.play("simon-idle");
      this.player.setDepth(10);
    }

    createKeyboardControls() {
      if (!this.input.keyboard) {
        this.cursors = {
          left: { isDown: false },
          right: { isDown: false },
          up: null
        };
        return;
      }

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    makeTouchButton(x, y, label, onDown, onUp) {
      const circle = this.add.circle(x, y, 34, 0x101820, 0.42)
        .setStrokeStyle(3, 0xfff3d2, 0.7)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: false });

      const text = this.add.text(x, y - 1, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#fff5d6"
      })
        .setOrigin(0.5)
        .setAlpha(0.92)
        .setScrollFactor(0)
        .setDepth(1001);

      const press = (pointer) => {
        pointer.event?.preventDefault?.();
        circle.setFillStyle(0x2d4962, 0.75);
        onDown();
      };

      const release = () => {
        circle.setFillStyle(0x101820, 0.42);
        onUp();
      };

      circle.on("pointerdown", press);
      circle.on("pointerup", release);
      circle.on("pointerout", release);
      circle.on("pointerupoutside", release);

      this.controlObjects.push(circle, text);
      return { circle, text };
    }

    createTouchControls() {
      this.makeTouchButton(
        62,
        GAME_HEIGHT - 60,
        "←",
        () => { this.touchLeft = true; },
        () => { this.touchLeft = false; }
      );

      this.makeTouchButton(
        138,
        GAME_HEIGHT - 60,
        "→",
        () => { this.touchRight = true; },
        () => { this.touchRight = false; }
      );

      this.makeTouchButton(
        GAME_WIDTH - 138,
        GAME_HEIGHT - 60,
        "J",
        () => { this.touchJumpRequested = true; },
        () => {}
      );

      this.makeTouchButton(
        GAME_WIDTH - 62,
        GAME_HEIGHT - 60,
        "X",
        () => { this.touchShootRequested = true; },
        () => {}
      );
    }

    update(time, delta) {
      if (!this.player?.body) return;

      this.updateLionCombat(time, delta);

      const body = this.player.body;
      const onGround = body.blocked.down || body.touching.down;

      this.updateAbilityCooldownLabel();
      this.updateThrowingStickProjectiles(delta);
      this.recordRewindSnapshot(time);

      if (onGround) {
        this.wormholeUsedThisJump = false;
      }

      if (this.inVoid) {
        this.player.setVelocity(0, 0);
        this.updateSprintIndicator();
        return;
      }

      if (this.rewindActive) {
        this.player.setVelocity(0, 0);
        return;
      }

      if (this.wormholeTeleporting) {
        this.player.setVelocity(0, 0);
        return;
      }

      if (this.playerDying) {
        this.player.setVelocityX(0);
        this.updateSprintIndicator();
        return;
      }

      if (this.uiLocked) {
        this.updateSprintIndicator();
        this.player.setVelocityX(0);
        if (
          onGround &&
          this.player.anims.currentAnim?.key !== "simon-idle" &&
          this.player.anims.currentAnim?.key !== "simon-ko"
        ) {
          this.player.play("simon-idle", true);
        }
        return;
      }

      // Während der HIT-Frames übernimmt keine Lauf-/Idle-Animation.
      if (time < this.playerHitUntil) {
        return;
      }

      const leftDown =
        Boolean(this.cursors?.left?.isDown) ||
        Boolean(this.keyA?.isDown) ||
        this.touchLeft;

      const rightDown =
        Boolean(this.cursors?.right?.isDown) ||
        Boolean(this.keyD?.isDown) ||
        this.touchRight;

      let moveDirection = 0;
      if (leftDown && !rightDown) moveDirection = -1;
      if (rightDown && !leftDown) moveDirection = 1;

      const baseSpeed =
        this.isSprintActive() ? 306.25 : 175;
      const speed =
        Number(this.darkGandhiSlowUntil) > time
          ? baseSpeed * 0.55
          : baseSpeed;
      this.player.setVelocityX(moveDirection * speed);

      this.updateSprintIndicator();

      if (moveDirection !== 0) {
        this.facing = moveDirection;
        this.player.setFlipX(moveDirection < 0);
      }

      const keyboardJump = this.input.keyboard
        ? (
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keyW) ||
            Phaser.Input.Keyboard.JustDown(this.keySpace)
          )
        : false;

      const wantsJump = keyboardJump || this.touchJumpRequested;
      this.touchJumpRequested = false;

      if (wantsJump && onGround) {
        this.player.setVelocityY(-470);
        this.player.play("simon-jump", true);
      }

      const wantsShoot =
        (this.input.keyboard && Phaser.Input.Keyboard.JustDown(this.keyShoot)) ||
        this.touchShootRequested;

      this.touchShootRequested = false;

      if (wantsShoot) {
        this.shootingUntil = time + 360;
        this.player.play("simon-shoot", true);
      }

      const shooting = time < this.shootingUntil;

      if (shooting) {
        return;
      }

      if (!onGround) {
        if (
          this.player.anims.currentAnim?.key !== "simon-jump" ||
          !this.player.anims.isPlaying
        ) {
          this.player.play("simon-jump", true);
        }
        return;
      }

      if (moveDirection !== 0) {
        this.player.play("simon-run", true);
      } else {
        this.player.play("simon-idle", true);
      }
    }
  }

  class BahnhofquaiScene extends MilchbuckScene {
    constructor() {
      super("BahnhofquaiScene");

      this.arrivalTram = null;
      this.arrivalDoor = null;
      this.hbBoundary = null;
      this.arrivalFinished = false;
      this.arrivalData = null;

      this.indianStoreHitbox = null;
      this.storeEntryModal = null;
      this.indianStoreOverlay = null;
      this.indianStoreBackUI = null;
      this.indianStoreShopUI = null;
      this.shopModal = null;

      this.bookstoreHitbox = null;
      this.bookstoreEntryModal = null;
      this.bookstoreOverlay = null;
      this.bookstoreBackUI = null;
      this.bookstoreShelfHitbox = null;
      this.bookstoreCatalogModal = null;

      // Story encounter after leaving Orell Füssli for the first time.
      this.milkmanEncounterStarted = false;
      this.milkmanDialogueActive = false;
      this.milkmanDialogueStep = 0;
      this.milkmanDialogueBubble = null;
      this.milkVan = null;
      this.milkman = null;
      this.milkmanMaxHp = 100;
      this.milkmanHp = 100;
      this.milkmanHealthBar = null;
      this.milkmanHealthFill = null;
      this.milkmanFightActive = false;
      this.milkmanDefeated = false;
      this.milkmanLooted = false;
      this.milkmanLootModal = null;
      this.milkBottles = [];
      this.nextMilkBottleAt = 0;
      this.milkBottleThrowCount = 0;
      this.milkmanRngState = 0x51a7c3d9;
      this.nextMilkmanPunchAt = 0;

      // Gandhi encounter.
      this.gandhi = null;
      this.gandhiDialogueBubble = null;
      this.gandhiDialogueActive = false;
      this.gandhiDialogueStep = 0;
      this.gandhiChoiceModal = null;
      this.gandhiLootModal = null;
      this.gandhiNukeActive = false;
      this.gandhiTriggerArmed = false;
      this.gandhiEncounterStarted = false;
      this.gandhiBomb = null;
      this.gandhiExplosionObjects = [];
      this.gandhiNukeStartedAt = 0;
      this.gandhiNukePhase = "idle";
      this.gandhiRevivalScheduled = false;

      // Dark Gandhi boss.
      this.darkGandhiBossActive = false;
      this.darkGandhiMaxHp = 90;
      this.darkGandhiHp = 90;
      this.darkGandhiPhase = 0;
      this.darkGandhiHealthBar = null;
      this.darkGandhiHealthFill = null;
      this.darkGandhiPhaseText = null;
      this.darkGandhiPhaseHUD = null;
      this.darkGandhiPhaseBanner = null;
      this.darkGandhiPhaseAura = null;
      this.darkGandhiPhaseTransitionUntil = 0;
      this.darkGandhiPhaseMinUntil = 0;
      this.darkGandhiPhaseHits = 0;
      this.darkGandhiPhaseQueued = false;
      this.darkGandhiNextStaffAt = 0;
      this.darkGandhiNextSaltAt = 0;
      this.darkGandhiNextRebirthAt = 0;
      this.darkGandhiNextNukeAt = 0;
      this.darkGandhiNextAhimsaAt = 0;
      this.darkGandhiAhimsaUntil = 0;
      this.darkGandhiLastDrainAt = 0;
      this.darkGandhiHitCounter = 0;
      this.darkGandhiPlayerHitUntil = 0;
      this.darkGandhiSlowUntil = 0;
      this.darkGandhiSaltProjectiles = [];
      this.darkGandhiKarmaProjectiles = [];
      this.darkGandhiClones = [];
      this.darkGandhiCloneStartedAt = 0;
      this.darkGandhiCloneHitUntil = 0;
      this.darkGandhiNukeMarkers = [];
      this.darkGandhiAura = null;
    }

    init(data = {}) {
      this.arrivalData = data;
      this.developerCheckpoint =
        data.developerCheckpoint === "post-milkman"
          ? "post-milkman"
          : null;

      // Reset transient milkman objects on every reused Bahnhofstrasse visit.
      this.milkmanEncounterStarted = false;
      this.milkmanDialogueActive = false;
      this.milkmanDialogueStep = 0;
      this.milkmanDialogueBubble = null;
      this.milkVan = null;
      this.milkman = null;
      this.milkmanHp = this.milkmanMaxHp;
      this.milkmanHealthBar = null;
      this.milkmanHealthFill = null;
      this.milkmanFightActive = false;
      this.milkmanDefeated = false;
      this.milkmanLooted = false;
      this.milkmanLootModal = null;
      this.milkBottles = [];
      this.nextMilkBottleAt = 0;
      this.milkBottleThrowCount = 0;
      this.nextMilkmanPunchAt = 0;

      // BahnhofquaiScene is reused by Phaser. These arrival references/flags
      // must be fresh on EVERY trip, otherwise playArrivalAnimation() returns
      // immediately after the first visit and Simon stays hidden in the tram.
      this.__bahnhofVisitToken =
        (Number(this.__bahnhofVisitToken) || 0) + 1;
      this.__tramSwitching = false;
      this.arrivalFinished = false;
      this.arrivalTram = null;
      this.arrivalDoor = null;
      this.tram = null;
      this.tramHitbox = null;
      this.tramBoardingMarker = null;
      this.tramBoardingEnabled = false;
      this.tramTransitActive = false;
      this.hbBoundary = null;
      this.uiLocked = false;
      this.rewindHistory = [];
      this.lastRewindCaptureAt = -Infinity;
      this.rewindActive = false;
      this.inVoid = false;
      this.voidOverlay = null;
      this.voidBlocker = null;
      this.voidBackUI = null;
      this.abilityControlObjects = [];
      this.abilityCooldownText = null;
      this.weaponControlObjects = [];
      this.throwingStickProjectiles = [];

      this.gandhi = null;
      this.gandhiDialogueBubble = null;
      this.gandhiDialogueActive = false;
      this.gandhiDialogueStep = 0;
      this.gandhiChoiceModal = null;
      this.gandhiLootModal = null;
      this.gandhiNukeActive = false;
      this.gandhiTriggerArmed = false;
      this.gandhiEncounterStarted = false;
      this.gandhiBomb = null;
      this.gandhiExplosionObjects = [];
      this.gandhiNukeStartedAt = 0;
      this.gandhiNukePhase = "idle";
      this.gandhiRevivalScheduled = false;

      this.darkGandhiBossActive = false;
      this.darkGandhiHp = this.darkGandhiMaxHp;
      this.darkGandhiPhase = 0;
      this.darkGandhiHealthBar = null;
      this.darkGandhiHealthFill = null;
      this.darkGandhiPhaseText = null;
      this.darkGandhiPhaseHUD = null;
      this.darkGandhiPhaseBanner = null;
      this.darkGandhiPhaseAura = null;
      this.darkGandhiPhaseTransitionUntil = 0;
      this.darkGandhiPhaseMinUntil = 0;
      this.darkGandhiPhaseHits = 0;
      this.darkGandhiPhaseQueued = false;
      this.darkGandhiNextStaffAt = 0;
      this.darkGandhiNextSaltAt = 0;
      this.darkGandhiNextRebirthAt = 0;
      this.darkGandhiNextNukeAt = 0;
      this.darkGandhiNextAhimsaAt = 0;
      this.darkGandhiAhimsaUntil = 0;
      this.darkGandhiLastDrainAt = 0;
      this.darkGandhiHitCounter = 0;
      this.darkGandhiPlayerHitUntil = 0;
      this.darkGandhiSlowUntil = 0;
      this.darkGandhiSaltProjectiles = [];
      this.darkGandhiKarmaProjectiles = [];
      this.darkGandhiClones = [];
      this.darkGandhiCloneStartedAt = 0;
      this.darkGandhiCloneHitUntil = 0;
      this.darkGandhiNukeMarkers = [];
      this.darkGandhiAura = null;

      this.developerMode = Boolean(data.developerMode || data.fromDeveloperMode);
      this.coins = this.developerMode
        ? 999999
        : (Number.isFinite(data.coins) ? data.coins : 0);

      this.hp = Number.isFinite(data.hp) ? data.hp : this.maxHp;
      this.hasCityTicket = data.hasCityTicket !== false;

      this.inventory = {
        gatorade: Math.max(0, Number(data.inventory?.gatorade) || 0),
        monster: Math.max(0, Number(data.inventory?.monster) || 0),
        camel: Math.max(0, Number(data.inventory?.camel) || 0),
        gandhiSticks: Math.max(0, Number(data.inventory?.gandhiSticks) || 0)
      };

      this.sprintExpiresAt = Number.isFinite(data.sprintExpiresAt)
        ? data.sprintExpiresAt
        : 0;

      this.booksOwned = {
        generalRelativity: Boolean(data.booksOwned?.generalRelativity),
        phaenomenologie: Boolean(data.booksOwned?.phaenomenologie),
        playbook: Boolean(data.booksOwned?.playbook),
        zarathustra: Boolean(data.booksOwned?.zarathustra)
      };

      this.gandhiStoryEligible =
        Boolean(data.gandhiStoryEligible || this.gandhiStoryEligible);
      this.gandhiEncounterFinished =
        Boolean(data.gandhiEncounterFinished || this.gandhiEncounterFinished);
      this.gandhiDead =
        Boolean(data.gandhiDead || this.gandhiDead);
      this.darkGandhiDefeated =
        Boolean(data.darkGandhiDefeated || this.darkGandhiDefeated);
      this.gandhiPassOriginSide =
        data.gandhiPassOriginSide === "left" || data.gandhiPassOriginSide === "right"
          ? data.gandhiPassOriginSide
          : (this.gandhiPassOriginSide || null);
      this.gandhiPassEnteredZone =
        Boolean(data.gandhiPassEnteredZone || this.gandhiPassEnteredZone);
      this.gandhiPassCompleted =
        Boolean(data.gandhiPassCompleted || this.gandhiPassCompleted);
      this.gandhiSticksLooted =
        Boolean(data.gandhiSticksLooted || this.gandhiSticksLooted || this.inventory.gandhiSticks > 0);

      this.booksRead = {
        generalRelativity: Boolean(data.booksRead?.generalRelativity),
        phaenomenologie: Boolean(data.booksRead?.phaenomenologie),
        playbook: Boolean(data.booksRead?.playbook),
        zarathustra: Boolean(data.booksRead?.zarathustra)
      };

      this.abilitiesUnlocked = {
        wormhole: Boolean(data.abilitiesUnlocked?.wormhole),
        eternalReturn: Boolean(data.abilitiesUnlocked?.eternalReturn),
        forItself: Boolean(data.abilitiesUnlocked?.forItself)
      };

      this.activeAbility =
        typeof data.activeAbility === "string" &&
        this.abilitiesUnlocked[data.activeAbility]
          ? data.activeAbility
          : null;

      this.forItselfCooldownUntil =
        Number.isFinite(data.forItselfCooldownUntil)
          ? data.forItselfCooldownUntil
          : 0;

      this.hotbarItems = Array.isArray(data.hotbarItems)
        ? data.hotbarItems.slice(0, HOTBAR_SIZE)
        : Array(HOTBAR_SIZE).fill(null);

      while (this.hotbarItems.length < HOTBAR_SIZE) {
        this.hotbarItems.push(null);
      }

      this.selectedHotbarIndex = Number.isInteger(data.selectedHotbarIndex)
        ? Phaser.Math.Clamp(data.selectedHotbarIndex, 0, HOTBAR_SIZE - 1)
        : 0;

      this.currentStationKey = "bahnhofstrasse";
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);
      this.currentStationKey = "bahnhofstrasse";

      this.uiLocked = false;
      this.tramTransitActive = false;
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpRequested = false;
      this.touchShootRequested = false;

      const domRoot = document.getElementById("phaser-game");
      domRoot?.querySelectorAll("[data-simon-ui]").forEach((node) => node.remove());

      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.setBackgroundColor("#87c7d8");

      this.createBahnhofquaiWorld();
      this.createGround();

      if (!this.textures.exists("simon")) {
        this.add.text(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2,
          "SIMON-SPRITE FEHLT",
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "12px",
            color: "#ffdf8a"
          }
        )
          .setOrigin(0.5)
          .setScrollFactor(0);
        return;
      }

      this.createAnimations();
      this.createPlayer();

      // Der Hauptbahnhof bildet links eine reale Grenze.
      if (this.hbBoundary) {
        this.physics.add.collider(this.player, this.hbBoundary);
      }

      this.createKeyboardControls();
      this.createTouchControls();
      this.createHUD();
      this.installWormholeInput();

      this.events.once("shutdown", () => {
        this.cleanupHotbarDOM?.();
        document
          .querySelectorAll("#phaser-game [data-simon-ui='hotbar-action']")
          .forEach((node) => node.remove());
        this.cleanupSprintIndicator();
        this.cleanupAbilityIndicator();
        this.cleanupVoid();

        if (this.gandhiChoiceModal) {
          this.destroyDOMModal(this.gandhiChoiceModal);
          this.gandhiChoiceModal = null;
        }

        this.clearGandhiDialogue?.();

        (this.gandhiExplosionObjects || []).forEach((object) => {
          object?.destroy?.();
        });
        this.gandhiExplosionObjects = [];
      });

      this.updateCoinHUD();
      this.updateHpBar();
      this.updateInventoryUI();
      this.updateSprintIndicator(true);
      this.updateAbilityIndicator();

      const visitToken = this.__bahnhofVisitToken;

      if (this.developerCheckpoint === "post-milkman") {
        this.arrivalFinished = true;

        this.time.delayedCall(100, () => {
          if (
            visitToken !== this.__bahnhofVisitToken ||
            !this.sys.isActive()
          ) {
            return;
          }

          this.setupDeveloperPostMilkman();
        });
      } else {
        this.player.setPosition(650, 246);
        this.player.setVisible(false);
        this.player.setVelocity(0, 0);
        if (this.player.body) this.player.body.enable = false;

        this.setUILocked(true);

        this.cameras.main.stopFollow();
        this.cameras.main.setScroll(300, 0);
        this.cameras.main.fadeIn(650, 0, 0, 0);

        this.time.delayedCall(320, () => {
          if (
            visitToken !== this.__bahnhofVisitToken ||
            !this.sys.isActive()
          ) {
            return;
          }
          this.playArrivalAnimation();
        });

        this.time.delayedCall(3200, () => {
          if (
            visitToken !== this.__bahnhofVisitToken ||
            !this.sys.isActive() ||
            this.arrivalFinished
          ) {
            return;
          }

          this.forceFinishBahnhofArrival();
        });
      }

      if (this.__bahnhofPointerHandler) {
        this.input.off("pointerup", this.__bahnhofPointerHandler);
      }

      this.__bahnhofPointerHandler = (pointer) => {
        if (this.gandhiDialogueActive) {
          if (
            this.itemsModal ||
            this.ticketModal ||
            this.storeEntryModal ||
            this.bookstoreEntryModal ||
            this.indianStoreOverlay ||
            this.bookstoreOverlay ||
            this.gandhiChoiceModal
          ) {
            return;
          }

          this.advanceGandhiDialogue();
          return;
        }

        if (!this.milkmanDialogueActive) return;

        if (
          this.itemsModal ||
          this.ticketModal ||
          this.storeEntryModal ||
          this.bookstoreEntryModal ||
          this.indianStoreOverlay ||
          this.bookstoreOverlay
        ) {
          return;
        }

        this.advanceMilkmanDialogue();
      };

      this.input.on("pointerup", this.__bahnhofPointerHandler);
      this.cameras.main.roundPixels = true;
    }

    createBahnhofquaiWorld() {
      const bg = this.add.graphics().setDepth(-30);

      // Himmel.
      bg.fillStyle(0x78bcd2, 1);
      bg.fillRect(0, 0, WORLD_WIDTH, 105);
      bg.fillStyle(0x91cbd5, 1);
      bg.fillRect(0, 105, WORLD_WIDTH, 100);
      bg.fillStyle(0xb8d8d1, 1);
      bg.fillRect(0, 205, WORLD_WIDTH, 133);

      // Ferne Zürcher Dächer.
      const far = this.add.graphics().setDepth(-20);
      for (let x = 420; x < WORLD_WIDTH; x += 115) {
        const h = 64 + ((x / 115) % 4) * 11;
        const y = GROUND_TOP - h - 45;
        far.fillStyle((x / 115) % 2 === 0 ? 0x8d8a80 : 0x9b9385, 1);
        far.fillRect(x, y, 103, h);
        far.fillStyle((x / 115) % 3 === 0 ? 0x7e4b40 : 0x5f5651, 1);
        far.fillTriangle(x - 4, y, x + 51, y - 20, x + 107, y);
      }

      this.createHauptbahnhofFacade();
      this.createBahnhofquaiStop();
      this.createBahnhofstrasse();
      this.createBahnhofstrasseTicketMachine();
      this.createIndianStoreExterior();
      this.createOrellFuessliExterior();

      // Fahrbahn / Gleise / Gehfläche.
      const street = this.add.graphics().setDepth(0);
      street.fillStyle(0x777a76, 1);
      street.fillRect(0, 282, WORLD_WIDTH, 56);

      street.fillStyle(0x434543, 1);
      street.fillRect(0, 300, WORLD_WIDTH, 4);
      street.fillRect(0, 322, WORLD_WIDTH, 4);

      street.fillStyle(0xb9aa8d, 0.7);
      for (let x = 0; x < WORLD_WIDTH; x += 22) {
        street.fillRect(x, 304, 4, 17);
      }

      street.fillStyle(0xb9b09d, 1);
      street.fillRect(420, 328, WORLD_WIDTH - 420, 10);

      street.fillStyle(0x655446, 1);
      street.fillRect(0, GROUND_TOP, WORLD_WIDTH, GAME_HEIGHT - GROUND_TOP);

      for (let x = 0; x < WORLD_WIDTH; x += 26) {
        street.fillStyle((x / 26) % 2 === 0 ? 0x806c58 : 0x735f4e, 1);
        street.fillRect(x, GROUND_TOP, 24, 10);
      }

      // Oberleitung.
      const wires = this.add.graphics().setDepth(4);
      wires.lineStyle(2, 0x555a5d, 0.9);
      [505, 760, 1030, 1320, 1650, 1990, 2350, 2710].forEach((x) => {
        wires.fillStyle(0x6b7173, 1);
        wires.fillRect(x, 78, 5, 230);
      });

      for (let x = 505; x < 2710; x += 255) {
        wires.lineBetween(x, 96, Math.min(x + 255, WORLD_WIDTH), 112);
      }

      // Unsichtbare Kollision vor dem Hauptbahnhof: links endet der Weg.
      this.hbBoundary = this.add.rectangle(415, 205, 18, 410, 0x000000, 0);
      this.physics.add.existing(this.hbBoundary, true);

      this.createArrivalTram();
    }

    createHauptbahnhofFacade() {
      const hb = this.add.graphics().setDepth(-4);

      hb.fillStyle(0xb9aa8e, 1);
      hb.fillRect(0, 104, 415, 234);

      hb.fillStyle(0x9e8d72, 1);
      hb.fillRect(0, 104, 415, 22);
      hb.fillRect(0, 316, 415, 22);

      // Klassische Fensterbögen.
      for (let x = 34; x < 390; x += 68) {
        hb.fillStyle(0x405769, 1);
        hb.fillRoundedRect(x, 164, 42, 77, 17);
        hb.lineStyle(4, 0x756850, 1);
        hb.strokeRoundedRect(x, 164, 42, 77, 17);

        hb.fillStyle(0x5e6d72, 1);
        hb.fillRect(x + 6, 253, 30, 51);
      }

      // Haupteingang / Tor.
      hb.fillStyle(0x293c4a, 1);
      hb.fillRoundedRect(165, 192, 88, 146, 30);
      hb.lineStyle(5, 0x756850, 1);
      hb.strokeRoundedRect(165, 192, 88, 146, 30);

      // Uhr.
      hb.fillStyle(0xf2ecdc, 1);
      hb.fillCircle(209, 152, 22);
      hb.lineStyle(4, 0x4a4640, 1);
      hb.strokeCircle(209, 152, 22);
      hb.lineBetween(209, 152, 209, 137);
      hb.lineBetween(209, 152, 220, 158);

      this.add.text(209, 116, "ZÜRICH HB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#fff0c4",
        stroke: "#5b4f3d",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(5);
    }

    createBahnhofquaiStop() {
      const stop = this.add.graphics().setDepth(2);

      // Unterstand.
      stop.fillStyle(0x4d575a, 1);
      stop.fillRect(625, 178, 8, 112);
      stop.fillRect(825, 178, 8, 112);
      stop.fillStyle(0x3e494d, 1);
      stop.fillRect(610, 169, 238, 12);
      stop.fillStyle(0xb7d9d6, 0.42);
      stop.fillRect(638, 184, 180, 86);
      stop.lineStyle(4, 0x536166, 1);
      stop.strokeRect(638, 184, 180, 86);

      // Bank.
      stop.fillStyle(0x8c603e, 1);
      stop.fillRect(678, 253, 102, 9);
      stop.fillRect(688, 262, 7, 23);
      stop.fillRect(764, 262, 7, 23);

      // Haltestellenmast.
      stop.fillStyle(0x687075, 1);
      stop.fillRect(888, 171, 7, 124);

      // Ein einziges blaues Schild mit dem vollständigen Stationsnamen.
      stop.fillStyle(0x216aa4, 1);
      stop.fillRect(817, 139, 151, 37);
      stop.lineStyle(2, 0xdcecf5, 0.75);
      stop.strokeRect(817, 139, 151, 37);

      this.add.text(892, 158, "BAHNHOFSTRASSE/HB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5.5px",
        color: "#ffffff",
        align: "center"
      })
        .setOrigin(0.5)
        .setDepth(6);

      this.add.text(735, 126, "BAHNHOFSTRASSE / HB", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "11px",
        color: "#fff8d9",
        stroke: "#28495b",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(5);
    }

    createBahnhofstrasse() {
      const startX = 990;
      const colors = [
        0xd5c5a4,
        0xc8aa8b,
        0xd9d0b4,
        0xbda489,
        0xd2b99a,
        0xc4b6a1
      ];

      for (let i = 0; i < 15; i += 1) {
        const x = startX + i * 132;
        const w = 118;
        const h = 155 + (i % 4) * 14;
        const y = GROUND_TOP - h;

        const b = this.add.graphics().setDepth(-3);
        b.fillStyle(colors[i % colors.length], 1);
        b.fillRect(x, y, w, h);

        b.fillStyle(i % 2 === 0 ? 0x59595b : 0x73584a, 1);
        b.fillTriangle(x - 4, y, x + w / 2, y - 22, x + w + 4, y);

        // Fenster.
        for (let wx = x + 13; wx < x + w - 12; wx += 28) {
          for (let wy = y + 23; wy < y + h - 49; wy += 32) {
            b.fillStyle((wx + wy) % 3 === 0 ? 0xf5d98f : 0x426077, 1);
            b.fillRect(wx, wy, 11, 15);
            b.lineStyle(2, 0x65584d, 1);
            b.strokeRect(wx, wy, 11, 15);
          }
        }

        // Arkadenartige Schaufenster im Erdgeschoss.
        b.fillStyle(0x2d3339, 1);
        b.fillRect(x + 8, GROUND_TOP - 44, w - 16, 38);

        b.fillStyle(i % 3 === 0 ? 0xc18a56 : 0x6c8b8e, 1);
        b.fillRect(x + 14, GROUND_TOP - 38, 39, 25);
        b.fillRect(x + 64, GROUND_TOP - 38, 39, 25);
      }

      this.add.text(1240, 244, "BAHNHOFSTRASSE →", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#f2efe4",
        backgroundColor: "#42413d",
        padding: { x: 8, y: 6 }
      }).setDepth(4);

      // Straßenbäume.
      for (let x = 1110; x < WORLD_WIDTH; x += 360) {
        const tree = this.add.graphics().setDepth(1);
        tree.fillStyle(0x65462f, 1);
        tree.fillRect(x, 267, 8, 71);
        tree.fillStyle(0x477a51, 1);
        tree.fillCircle(x + 4, 252, 24);
        tree.fillStyle(0x568a5b, 1);
        tree.fillCircle(x - 11, 263, 17);
        tree.fillCircle(x + 19, 263, 18);
      }
    }

    createBahnhofstrasseTicketMachine() {
      const x = 1030;
      const y = 221;

      const machine = this.add.graphics().setDepth(6);
      machine.fillStyle(0x2d5f78, 1);
      machine.fillRect(x, y, 49, 91);
      machine.fillStyle(0x183849, 1);
      machine.fillRect(x + 6, y + 9, 37, 28);
      machine.fillStyle(0xa9d8c5, 1);
      machine.fillRect(x + 12, y + 15, 25, 15);
      machine.fillStyle(0xf1c64f, 1);
      machine.fillRect(x + 12, y + 49, 25, 8);
      machine.fillStyle(0x17252e, 1);
      machine.fillRect(x + 14, y + 67, 21, 12);
      machine.lineStyle(3, 0xd7edf2, 0.75);
      machine.strokeRect(x, y, 49, 91);

      this.add.text(x + 24, y - 9, "TICKET", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff3c4",
        backgroundColor: "#244c61",
        padding: { x: 4, y: 3 }
      })
        .setOrigin(0.5)
        .setDepth(7);

      this.ticketHitbox = this.add.zone(x + 24, y + 44, 68, 104)
        .setDepth(150)
        .setInteractive({ useHandCursor: true });

      // Erst nach der Aussteigeanimation aktivieren.
      this.ticketHitbox.input.enabled = false;

      this.ticketHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openTicketModal();
      });
    }

    createIndianStoreExterior() {
      // Bewusst deutlich weiter rechts von der Haltestelle und wie das HIVE
      // als Hintergrund-Fassade hinter der begehbaren Straßenebene.
      const x = 1420;
      const y = 154;
      const w = 218;
      const h = GROUND_TOP - y;

      const store = this.add.graphics().setDepth(-2);

      // Warme, indisch inspirierte Ladenfassade mit Bögen und Ornamenten.
      store.fillStyle(0xa54f32, 1);
      store.fillRect(x, y, w, h);

      store.fillStyle(0xd98a3d, 1);
      store.fillRect(x + 5, y + 6, w - 10, 35);

      store.fillStyle(0x5e2340, 1);
      store.fillRect(x + 14, y + 48, w - 28, h - 58);

      // Zwei Schaufenster.
      store.fillStyle(0x213c43, 1);
      store.fillRoundedRect(x + 20, y + 61, 58, 64, 16);
      store.fillRoundedRect(x + 124, y + 61, 58, 64, 16);

      store.lineStyle(3, 0xf4c75a, 1);
      store.strokeRoundedRect(x + 20, y + 61, 58, 64, 16);
      store.strokeRoundedRect(x + 124, y + 61, 58, 64, 16);

      // Tür in der Mitte.
      store.fillStyle(0x3c2220, 1);
      store.fillRoundedRect(x + 82, y + 58, 38, 104, 11);
      store.fillStyle(0xf2c45d, 1);
      store.fillCircle(x + 111, y + 111, 3);

      // Kleine ornamentale Farbbänder.
      const ornamentColors = [0xf0be4d, 0x3f875c, 0xd84f4e];
      for (let i = 0; i < 9; i += 1) {
        store.fillStyle(ornamentColors[i % ornamentColors.length], 1);
        store.fillTriangle(
          x + 12 + i * 21,
          y + 42,
          x + 21 + i * 21,
          y + 51,
          x + 30 + i * 21,
          y + 42
        );
      }

      this.add.text(x + w / 2, y + 24, "DER INDER", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#fff0b0",
        stroke: "#652a24",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(-1);

      // Gemüseauslage vor dem Laden – ebenfalls hinter Simon/Straße.
      const veg = this.add.graphics().setDepth(-1);

      // Holzkisten.
      veg.fillStyle(0x8b5e35, 1);
      veg.fillRect(x + 20, GROUND_TOP - 34, 54, 27);
      veg.fillRect(x + 126, GROUND_TOP - 34, 54, 27);

      veg.lineStyle(2, 0x5c3b23, 1);
      veg.strokeRect(x + 20, GROUND_TOP - 34, 54, 27);
      veg.strokeRect(x + 126, GROUND_TOP - 34, 54, 27);

      // Auberginen.
      veg.fillStyle(0x5d356f, 1);
      [0, 13, 26, 39].forEach((dx, i) => {
        veg.fillEllipse(x + 27 + dx, GROUND_TOP - 28 + (i % 2) * 3, 10, 16);
      });
      veg.fillStyle(0x4e8746, 1);
      [0, 13, 26, 39].forEach((dx) => {
        veg.fillRect(x + 25 + dx, GROUND_TOP - 39, 4, 6);
      });

      // Okra / grüne Chilis / Tomaten.
      veg.fillStyle(0x4b9449, 1);
      for (let i = 0; i < 8; i += 1) {
        veg.fillRect(x + 131 + i * 6, GROUND_TOP - 31 + (i % 3), 3, 15);
      }

      veg.fillStyle(0xd64a38, 1);
      veg.fillCircle(x + 139, GROUND_TOP - 13, 6);
      veg.fillCircle(x + 155, GROUND_TOP - 15, 6);
      veg.fillCircle(x + 171, GROUND_TOP - 13, 6);

      // Kleine Gewürzsäcke vor der Tür.
      veg.fillStyle(0xc8904d, 1);
      veg.fillRoundedRect(x + 82, GROUND_TOP - 24, 18, 20, 5);
      veg.fillStyle(0xb84f34, 1);
      veg.fillRoundedRect(x + 103, GROUND_TOP - 24, 18, 20, 5);

      // Die gesamte Fassade ist großzügig anklickbar.
      // Only the facade ABOVE the tram tracks is clickable. The street,
      // touch controls and hotbar below it can never trigger this store.
      const clickableBottom = 278;
      const clickableHeight = clickableBottom - y;

      this.indianStoreHitbox = this.add.zone(
        x + w / 2,
        y + clickableHeight / 2,
        w - 18,
        clickableHeight
      )
        .setDepth(40)
        .setInteractive({ useHandCursor: true });

      this.indianStoreHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();

        if (!this.canOpenStreetStore(pointer)) return;
        this.openIndianStorePrompt();
      });
    }

    createOrellFuessliExterior() {
      // Weiter rechts als "Der Inder", ebenfalls als Hintergrundfassade.
      const x = 1890;
      const y = 145;
      const w = 270;
      const h = GROUND_TOP - y;

      const store = this.add.graphics().setDepth(-2);

      store.fillStyle(0xd9d2c3, 1);
      store.fillRect(x, y, w, h);

      store.fillStyle(0xb7272f, 1);
      store.fillRect(x + 7, y + 8, w - 14, 38);

      store.fillStyle(0x30363b, 1);
      store.fillRect(x + 18, y + 58, 74, 101);
      store.fillRect(x + 178, y + 58, 74, 101);

      store.fillStyle(0x684b39, 1);
      store.fillRoundedRect(x + 108, y + 54, 54, 131, 6);

      store.lineStyle(3, 0xffffff, 0.55);
      store.strokeRect(x + 18, y + 58, 74, 101);
      store.strokeRect(x + 178, y + 58, 74, 101);

      // Books in windows.
      const colors = [0x8f2f38, 0x416c8a, 0xb58a32, 0x49694c, 0x7a4e7f];
      for (let i = 0; i < 7; i += 1) {
        store.fillStyle(colors[i % colors.length], 1);
        store.fillRect(x + 28 + i * 8, y + 117 - (i % 2) * 4, 6, 28);
        store.fillRect(x + 188 + i * 8, y + 117 - ((i + 1) % 2) * 4, 6, 28);
      }

      this.add.text(x + w / 2, y + 28, "ORELL FÜSSLI", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "13px",
        color: "#ffffff",
        stroke: "#7c151d",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(-1);

      const clickableBottom = 278;
      const clickableHeight = clickableBottom - y;

      this.bookstoreHitbox = this.add.zone(
        x + w / 2,
        y + clickableHeight / 2,
        w - 20,
        clickableHeight
      )
        .setDepth(40)
        .setInteractive({ useHandCursor: true });

      this.bookstoreHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();

        if (!this.canOpenStreetStore(pointer)) return;
        this.openBookstorePrompt();
      });
    }

    canOpenStreetStore(pointer) {
      // An airborne Wurmloch click is a map target, never a store click.
      if (this.canUseWormholeNow()) {
        return false;
      }

      // Stores are intentionally facade-only interactions.
      if (pointer && Number.isFinite(pointer.worldY) && pointer.worldY >= 279) {
        return false;
      }

      if (!this.arrivalFinished || this.playerDying) return false;

      // Absolutely no world-store interaction while any overlay/menu is open.
      if (
        this.inVoid ||
        this.rewindActive ||
        this.uiLocked ||
        this.itemsModal ||
        this.itemInfoModal ||
        this.ticketModal ||
        this.tramDestinationModal ||
        this.storeEntryModal ||
        this.indianStoreOverlay ||
        this.shopModal ||
        this.bookstoreEntryModal ||
        this.bookstoreOverlay ||
        this.bookstoreCatalogModal ||
        this.itemsModal ||
        this.itemInfoModal ||
        this.shopModal ||
        this.milkmanDialogueActive ||
        this.milkmanFightActive ||
        this.milkmanDialogueActive ||
        this.milkmanFightActive ||
        this.milkmanLootModal ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiLootModal ||
        this.gandhiNukeActive ||
        this.darkGandhiBossActive
      ) {
        return false;
      }

      return true;
    }

    syncStreetStoreHitboxes() {
      const enabled = Boolean(
        this.arrivalFinished &&
        !this.inVoid &&
        !this.rewindActive &&
        !this.uiLocked &&
        !this.milkmanDialogueActive &&
        !this.milkmanFightActive &&
        !this.gandhiDialogueActive &&
        !this.gandhiChoiceModal &&
        !this.gandhiLootModal &&
        !this.gandhiNukeActive &&
        !this.darkGandhiBossActive &&
        !this.playerDying
      );

      [this.indianStoreHitbox, this.bookstoreHitbox].forEach((zone) => {
        if (!zone?.input) return;
        zone.input.enabled = enabled;
      });
    }

    getBookDefinitions() {
      return {
        generalRelativity: {
          title: "General Relativity",
          price: 500
        },
        phaenomenologie: {
          title: "Phänomenologie des Geistes",
          price: 300
        },
        playbook: {
          title: "The Playbook",
          price: 1000
        },
        zarathustra: {
          title: "Also sprach Zarathustra",
          price: 500
        }
      };
    }

    openBookstorePrompt() {
      if (
        !this.arrivalFinished ||
        this.playerDying ||
        this.bookstoreEntryModal ||
        this.bookstoreOverlay ||
        this.bookstoreCatalogModal ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiNukeActive
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "orell-entry",
        width: "min(88%, 430px)",
        background: "#eee7db",
        border: "#9e2229",
        shade: "rgba(5, 6, 11, 0.62)",
        padding: "20px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.bookstoreEntryModal = modal;

      const title = this.createDOMText("ORELL FÜSSLI", {
        fontSize: "14px",
        color: "#8d1d24",
        margin: "0 0 13px"
      });

      const question = this.createDOMText("Betreten?", {
        fontSize: "10px",
        color: "#302b28",
        margin: "0 0 18px"
      });

      const buttons = document.createElement("div");
      Object.assign(buttons.style, {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        maxWidth: "300px",
        margin: "0 auto"
      });

      const yes = this.createDOMButton("JA", () => this.enterBookstore(), {
        color: "#ffffff",
        background: "#9e2229",
        border: "#d98e92",
        fontSize: "10px"
      });

      const no = this.createDOMButton("NEIN", () => this.closeBookstorePrompt(), {
        color: "#443b36",
        background: "#d8d0c4",
        border: "#8f8378",
        fontSize: "10px"
      });

      buttons.append(yes, no);
      modal.panel.append(title, question, buttons);
      this.refreshUILock();
    }

    closeBookstorePrompt() {
      if (!this.bookstoreEntryModal) return;

      this.destroyDOMModal(this.bookstoreEntryModal);
      this.bookstoreEntryModal = null;
      this.refreshUILock();
    }

    enterBookstore() {
      if (this.bookstoreOverlay) return;

      if (this.bookstoreEntryModal) {
        this.destroyDOMModal(this.bookstoreEntryModal);
        this.bookstoreEntryModal = null;
      }

      this.setUILocked(true);
      this.player.setVisible(false);

      const overlay = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(650);

      const bg = this.add.graphics();
      bg.fillStyle(0xefe9dc, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      bg.fillStyle(0xc8bda8, 1);
      bg.fillRect(0, 0, GAME_WIDTH, 77);

      bg.fillStyle(0x8e2228, 1);
      bg.fillRect(0, 77, GAME_WIDTH, 9);

      bg.fillStyle(0x6a4a36, 1);
      bg.fillRect(0, 330, GAME_WIDTH, 60);

      // Main shelf wall.
      const shelfX = 185;
      const shelfY = 105;
      const shelfW = 450;
      const shelfH = 205;

      bg.fillStyle(0x65452f, 1);
      bg.fillRoundedRect(shelfX, shelfY, shelfW, shelfH, 9);

      bg.fillStyle(0x3b281d, 1);
      for (const y of [147, 196, 245, 294]) {
        bg.fillRect(shelfX + 12, y, shelfW - 24, 8);
      }

      const bookColors = [
        0x93333c, 0x3e688a, 0xbe8b35, 0x476e52,
        0x77517f, 0x9c6844, 0x304c69
      ];

      let index = 0;
      for (const rowY of [115, 164, 213, 262]) {
        for (let x = shelfX + 20; x < shelfX + shelfW - 25; x += 18) {
          bg.fillStyle(bookColors[index % bookColors.length], 1);
          bg.fillRect(x, rowY + (index % 3), 12, 29 - (index % 3));
          index += 1;
        }
      }

      const sign = this.add.text(GAME_WIDTH / 2, 38, "ORELL FÜSSLI", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "19px",
        color: "#9e2229",
        stroke: "#ffffff",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(675);

      const hint = this.add.text(GAME_WIDTH / 2, 320, "BÜCHERREGAL", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#fff2cf",
        backgroundColor: "#5a3d2b",
        padding: { x: 8, y: 5 }
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(675);

      this.bookstoreShelfHitbox = this.add.zone(
        GAME_WIDTH / 2,
        208,
        shelfW,
        shelfH
      )
        .setScrollFactor(0)
        .setDepth(690)
        .setInteractive({ useHandCursor: true });

      this.bookstoreShelfHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openBookCatalog();
      });

      overlay.add([bg, sign, hint, this.bookstoreShelfHitbox]);
      this.bookstoreOverlay = overlay;

      this.createBookstoreBackButton();
      this.refreshUILock();
    }

    createBookstoreBackButton() {
      const root = this.getDOMUIRoot();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='orell-controls']")
        .forEach((node) => node.remove());

      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "orell-controls";

      Object.assign(wrapper.style, {
        position: "absolute",
        inset: "0",
        zIndex: "100001",
        pointerEvents: "none"
      });

      const street = this.createDOMButton(
        "← STRASSE",
        () => this.exitBookstore(),
        {
          color: "#ffffff",
          background: "#9e2229",
          border: "#e4a1a5",
          width: "150px",
          minHeight: "42px",
          fontSize: "8px"
        }
      );

      Object.assign(street.style, {
        position: "absolute",
        left: "12px",
        top: "12px",
        pointerEvents: "auto"
      });

      wrapper.appendChild(street);
      root.appendChild(wrapper);
      this.bookstoreBackUI = { overlay: wrapper };
    }

    openBookCatalog() {
      if (!this.bookstoreOverlay || this.bookstoreCatalogModal) return;

      if (this.bookstoreBackUI?.overlay) {
        this.bookstoreBackUI.overlay.style.display = "none";
      }

      const modal = this.createDOMModal({
        key: "orell-catalog",
        width: "min(94%, 650px)",
        background: "#f1eadf",
        border: "#9e2229",
        shade: "rgba(10, 8, 7, 0.78)",
        padding: "15px"
      });

      if (!modal) {
        if (this.bookstoreBackUI?.overlay) {
          this.bookstoreBackUI.overlay.style.display = "";
        }
        return;
      }

      modal.overlay.style.zIndex = "100025";
      this.bookstoreCatalogModal = modal;

      const title = this.createDOMText("BÜCHER", {
        fontSize: "14px",
        color: "#8f1e24",
        margin: "0 0 12px"
      });

      const wallet = this.createDOMText(
        this.developerMode ? "COINS: ∞" : `COINS: ${this.coins}`,
        {
          fontSize: "6px",
          color: "#544b44",
          margin: "0 0 10px"
        }
      );
      wallet.dataset.bookWallet = "true";

      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        width: "100%",
        marginBottom: "10px"
      });

      Object.entries(this.getBookDefinitions()).forEach(([key, book]) => {
        const card = document.createElement("div");

        Object.assign(card.style, {
          padding: "9px",
          border: "2px solid #9d8e80",
          background: "#ddd3c3",
          display: "flex",
          flexDirection: "column",
          gap: "7px",
          alignItems: "center",
          boxSizing: "border-box"
        });

        const bookIcon = document.createElement("div");
        Object.assign(bookIcon.style, {
          width: "30px",
          height: "40px",
          background: key === "generalRelativity"
            ? "#3e688a"
            : key === "phaenomenologie"
              ? "#6b4b79"
              : key === "playbook"
                ? "#9a6739"
                : "#8e3038",
          border: "2px solid #493a31",
          boxSizing: "border-box",
          boxShadow: "4px 0 0 rgba(58,45,37,.35)"
        });

        const name = this.createDOMText(book.title, {
          fontSize: "6px",
          color: "#332b27",
          lineHeight: "1.45"
        });

        const price = this.createDOMText(`${book.price} COINS`, {
          fontSize: "6px",
          color: "#705221"
        });

        const owned = Boolean(this.booksOwned?.[key]);

        const buy = this.createDOMButton(
          owned
            ? "GEKAUFT"
            : (this.developerMode ? "KAUFEN · ∞" : "KAUFEN"),
          () => this.purchaseBook(key),
          {
            color: owned ? "#64615c" : "#ffffff",
            background: owned ? "#bbb5aa" : "#9e2229",
            border: owned ? "#8d877d" : "#dc8a90",
            minHeight: "35px",
            fontSize: "6px",
            padding: "5px"
          }
        );

        buy.disabled = owned;
        buy.dataset.bookBuy = key;

        card.append(bookIcon, name, price, buy);
        list.appendChild(card);
      });

      const status = this.createDOMText("", {
        fontSize: "6px",
        color: "#35613c",
        margin: "0 0 10px"
      });
      status.dataset.bookStatus = "true";

      const back = this.createDOMButton(
        "← LADEN",
        () => this.closeBookCatalog(),
        {
          color: "#463b34",
          background: "#d5cab9",
          border: "#8d7e70",
          width: "160px",
          fontSize: "8px"
        }
      );
      back.style.margin = "0 auto";

      modal.panel.append(title, wallet, list, status, back);
      this.refreshUILock();
    }

    purchaseBook(key) {
      const book = this.getBookDefinitions()[key];
      if (!book || this.booksOwned?.[key]) return;

      if (!this.developerMode && this.coins < book.price) {
        const status = this.bookstoreCatalogModal?.panel?.querySelector(
          "[data-book-status]"
        );
        if (status) {
          status.textContent = "ZU WENIG COINS!";
          status.style.color = "#9b332d";
        }
        return;
      }

      if (!this.developerMode) {
        this.coins -= book.price;
      } else {
        this.coins = 999999;
      }

      this.booksOwned[key] = true;
      this.updateCoinHUD();
      this.updateInventoryUI();

      const wallet = this.bookstoreCatalogModal?.panel?.querySelector(
        "[data-book-wallet]"
      );
      if (wallet) {
        wallet.textContent = this.developerMode
          ? "COINS: ∞"
          : `COINS: ${this.coins}`;
      }

      const buy = this.bookstoreCatalogModal?.panel?.querySelector(
        `[data-book-buy="${key}"]`
      );
      if (buy) {
        buy.textContent = "GEKAUFT";
        buy.disabled = true;
        buy.style.background = "#bbb5aa";
        buy.style.color = "#64615c";
      }

      const status = this.bookstoreCatalogModal?.panel?.querySelector(
        "[data-book-status]"
      );
      if (status) {
        status.textContent = `${book.title.toUpperCase()} GEKAUFT`;
        status.style.color = "#35613c";
      }
    }

    closeBookCatalog() {
      if (!this.bookstoreCatalogModal) return;

      this.destroyDOMModal(this.bookstoreCatalogModal);
      this.bookstoreCatalogModal = null;

      if (this.bookstoreBackUI?.overlay) {
        this.bookstoreBackUI.overlay.style.display = "";
      }

      this.refreshUILock();
    }

    exitBookstore() {
      if (this.bookstoreCatalogModal) {
        this.destroyDOMModal(this.bookstoreCatalogModal);
        this.bookstoreCatalogModal = null;
      }

      if (this.bookstoreEntryModal) {
        this.destroyDOMModal(this.bookstoreEntryModal);
        this.bookstoreEntryModal = null;
      }

      if (this.bookstoreBackUI) {
        this.destroyDOMModal(this.bookstoreBackUI);
        this.bookstoreBackUI = null;
      }

      if (this.bookstoreOverlay) {
        this.bookstoreOverlay.destroy(true);
        this.bookstoreOverlay = null;
        this.bookstoreShelfHitbox = null;
      }

      this.player.setVisible(true);
      if (this.player.body) {
        this.player.body.enable = true;
      }

      this.player.play("simon-idle", true);

      this.refreshUILock();
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);

      if (!this.milkmanEncounterStarted) {
        this.time.delayedCall(320, () => this.startMilkmanEncounter());
      }
    }

    refreshUILock() {
      const locked = Boolean(
        this.ticketModal ||
        this.itemsModal ||
        this.lootModal ||
        this.lionChoiceModal ||
        this.danceOverlay ||
        this.bouncerDialogueActive ||
        this.fightActive ||
        this.lionExitActive ||
        this.tramTransitActive ||
        this.playerDying ||
        this.storeEntryModal ||
        this.indianStoreOverlay ||
        this.shopModal ||
        this.bookstoreEntryModal ||
        this.bookstoreOverlay ||
        this.bookstoreCatalogModal ||
        this.tramDestinationModal ||
        this.itemInfoModal ||
        this.drinkingItem ||
        this.readingBook ||
        this.milkmanDialogueActive ||
        this.milkmanLootModal ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiLootModal ||
        this.gandhiNukeActive
      );

      this.setUILocked(locked);
      this.updateHotbarActionUI?.();
      this.syncStreetStoreHitboxes?.();
    }

    openIndianStorePrompt() {
      if (
        !this.arrivalFinished ||
        this.playerDying ||
        this.storeEntryModal ||
        this.indianStoreOverlay ||
        this.shopModal ||
        this.itemsModal ||
        this.itemInfoModal ||
        this.bookstoreCatalogModal ||
        this.readingBook ||
        this.milkmanDialogueActive ||
        this.milkmanFightActive ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiNukeActive
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "der-inder-entry",
        width: "min(88%, 430px)",
        background: "#f4d9a5",
        border: "#7c3e2b",
        shade: "rgba(5, 6, 11, 0.62)",
        padding: "20px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.storeEntryModal = modal;

      const title = this.createDOMText("DER INDER", {
        fontSize: "14px",
        color: "#713524",
        margin: "0 0 13px"
      });

      const question = this.createDOMText("Betreten?", {
        fontSize: "10px",
        color: "#32251d",
        margin: "0 0 18px"
      });

      const buttons = document.createElement("div");
      Object.assign(buttons.style, {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        maxWidth: "300px",
        margin: "0 auto"
      });

      const yes = this.createDOMButton("JA", () => this.enterIndianStore(), {
        color: "#214f32",
        background: "#b8d7b5",
        border: "#688568",
        fontSize: "10px"
      });

      const no = this.createDOMButton("NEIN", () => this.closeIndianStorePrompt(), {
        color: "#4c3328",
        background: "#d7c4a6",
        border: "#8d6a50",
        fontSize: "10px"
      });

      buttons.append(yes, no);
      modal.panel.append(title, question, buttons);
      this.refreshUILock();
    }

    closeIndianStorePrompt() {
      if (!this.storeEntryModal) return;

      this.destroyDOMModal(this.storeEntryModal);
      this.storeEntryModal = null;
      this.refreshUILock();
    }

    enterIndianStore() {
      if (this.indianStoreOverlay) return;

      if (this.storeEntryModal) {
        this.destroyDOMModal(this.storeEntryModal);
        this.storeEntryModal = null;
      }

      this.setUILocked(true);
      this.player.setVisible(false);

      const overlay = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(650);

      const bg = this.add.graphics();
      bg.fillStyle(0x2a1a17, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Wand.
      bg.fillStyle(0xc77c43, 1);
      bg.fillRect(0, 0, GAME_WIDTH, 238);

      // Dekorative Wandbänder.
      bg.fillStyle(0xf0c259, 1);
      bg.fillRect(0, 62, GAME_WIDTH, 12);
      bg.fillStyle(0x47835a, 1);
      bg.fillRect(0, 76, GAME_WIDTH, 7);

      for (let x = 18; x < GAME_WIDTH; x += 42) {
        bg.fillStyle((x / 42) % 2 === 0 ? 0x8b3150 : 0xe0a347, 1);
        bg.fillTriangle(x, 84, x + 14, 98, x + 28, 84);
      }

      // Regale mit farbigen Produkten/Gewürzen.
      for (const shelfY of [125, 177]) {
        bg.fillStyle(0x70452d, 1);
        bg.fillRect(40, shelfY, 250, 9);
        bg.fillRect(530, shelfY, 250, 9);

        for (let x = 52; x < 278; x += 31) {
          const palette = [0xb94c39, 0xdca845, 0x588f55, 0x74496f];
          bg.fillStyle(palette[(x + shelfY) % palette.length], 1);
          bg.fillRect(x, shelfY - 28, 18, 27);
        }

        for (let x = 542; x < 768; x += 31) {
          const palette = [0xdca845, 0x588f55, 0x74496f, 0xb94c39];
          bg.fillStyle(palette[(x + shelfY) % palette.length], 1);
          bg.fillRect(x, shelfY - 28, 18, 27);
        }
      }

      // Tresen.
      bg.fillStyle(0x56372a, 1);
      bg.fillRoundedRect(175, 254, 470, 96, 12);
      bg.fillStyle(0x875237, 1);
      bg.fillRect(163, 247, 494, 18);
      bg.lineStyle(4, 0xf0c259, 0.65);
      bg.strokeRoundedRect(175, 254, 470, 96, 12);

      const seller = this.createIndianSeller(410, 226);

      // Der Verkäufer selbst öffnet das Einkaufsfenster.
      seller.setSize(120, 145);
      seller.setInteractive({ useHandCursor: true });
      seller.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openIndianShopWindow();
      });

      // Sprechblase über dem Verkäufer.
      const bubble = this.add.container(410, 112).setScrollFactor(0).setDepth(675);
      const bubbleG = this.add.graphics();
      bubbleG.fillStyle(0xffefc2, 1);
      bubbleG.fillRoundedRect(-145, -34, 290, 68, 15);
      bubbleG.lineStyle(4, 0x5d3f27, 1);
      bubbleG.strokeRoundedRect(-145, -34, 290, 68, 15);
      bubbleG.fillTriangle(-12, 32, 12, 32, 0, 51);

      const bubbleText = this.add.text(0, 0, "Guter Kunde, Guter Kunde", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#2a2017",
        align: "center"
      }).setOrigin(0.5);

      bubble.add([bubbleG, bubbleText]);

      const sign = this.add.text(GAME_WIDTH / 2, 30, "DER INDER", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#fff1ae",
        stroke: "#713524",
        strokeThickness: 6
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(675);

      overlay.add([bg, seller, bubble, sign]);
      this.indianStoreOverlay = overlay;

      this.createIndianStoreDOMControls();
      this.refreshUILock();
    }

    createIndianSeller(x, y) {
      const seller = this.add.container(x, y).setScrollFactor(0).setDepth(670);
      const g = this.add.graphics();

      // Kurta / Oberteil.
      g.fillStyle(0xefe0bd, 1);
      g.fillRoundedRect(-31, -5, 62, 68, 9);
      g.fillStyle(0x9f4934, 1);
      g.fillRect(-7, -5, 14, 68);

      // Hals und Gesicht.
      g.fillStyle(0xa96f4d, 1);
      g.fillRect(-9, -18, 18, 15);
      g.fillRoundedRect(-22, -52, 44, 39, 9);

      // Dunkles Haar.
      g.fillStyle(0x1f1b1a, 1);
      g.fillRect(-20, -55, 40, 10);
      g.fillRect(-22, -49, 6, 16);

      // Augen und freundlicher Schnurrbart.
      g.fillStyle(0x1d1715, 1);
      g.fillRect(-11, -39, 4, 3);
      g.fillRect(7, -39, 4, 3);
      g.fillRect(-10, -27, 20, 4);
      g.fillTriangle(-10, -27, -17, -23, -4, -24);
      g.fillTriangle(10, -27, 17, -23, 4, -24);

      // Arme auf dem Tresen.
      g.fillStyle(0xa96f4d, 1);
      g.fillRoundedRect(-42, 34, 36, 13, 6);
      g.fillRoundedRect(6, 34, 36, 13, 6);

      seller.add(g);
      return seller;
    }

    createIndianStoreDOMControls() {
      const root = this.getDOMUIRoot();
      if (!root) return;

      root.querySelectorAll("[data-simon-ui='der-inder-controls']")
        .forEach((node) => node.remove());

      const wrapper = document.createElement("div");
      wrapper.dataset.simonUi = "der-inder-controls";

      Object.assign(wrapper.style, {
        position: "absolute",
        inset: "0",
        zIndex: "100001",
        pointerEvents: "none",
        touchAction: "manipulation"
      });

      const street = this.createDOMButton("← STRASSE", () => this.exitIndianStore(), {
        color: "#fff3ca",
        background: "#713524",
        border: "#efc45c",
        width: "150px",
        minHeight: "42px",
        fontSize: "8px",
        padding: "7px 9px"
      });

      Object.assign(street.style, {
        position: "absolute",
        left: "12px",
        top: "12px",
        pointerEvents: "auto"
      });

      wrapper.appendChild(street);
      root.appendChild(wrapper);

      this.indianStoreBackUI = { overlay: wrapper };
      this.indianStoreShopUI = null;
    }

    createStoreItemCard(itemKey) {
      const item = this.getItemDefinition(itemKey);
      if (!item) return null;

      const card = document.createElement("div");
      Object.assign(card.style, {
        padding: "10px",
        border: "2px solid #806246",
        background: "#d8c295",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "7px",
        boxSizing: "border-box"
      });

      const header = document.createElement("div");
      Object.assign(header.style, {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 34px",
        alignItems: "start",
        gap: "5px"
      });

      const name = this.createDOMText(item.name, {
        fontSize: "7px",
        color: "#4b3125",
        lineHeight: "1.45"
      });

      const info = this.createInfoButton(itemKey);
      header.append(name, info);

      const icon = this.createDOMItemIcon(itemKey, 54);

      const effect = this.createDOMText(
        item.effectLabel || "",
        {
          fontSize: "7px",
          color: "#395530"
        }
      );

      const owned = this.createDOMText(
        `IM INVENTAR: ${this.getItemCount(itemKey)}`,
        {
          fontSize: "5.5px",
          color: "#66503b"
        }
      );
      owned.dataset.storeOwned = itemKey;

      const buy = this.createDOMButton(
        this.developerMode ? "KAUFEN · ∞" : `KAUFEN · ${item.price} COINS`,
        () => this.purchaseStoreItem(itemKey),
        {
          color: "#fff5d6",
          background: "#6a4330",
          border: "#efc45c",
          minHeight: "40px",
          fontSize: "6px",
          padding: "6px 5px"
        }
      );
      buy.dataset.storeBuy = itemKey;

      card.append(header, icon, effect, owned, buy);
      return card;
    }

    purchaseStoreItem(itemKey) {
      const item = this.getItemDefinition(itemKey);
      if (!item || !["gatorade", "monster", "camel"].includes(itemKey)) return;

      if (!this.developerMode && this.coins < item.price) {
        const status = this.shopModal?.panel?.querySelector("[data-store-status]");
        if (status) {
          status.textContent = "ZU WENIG COINS!";
          status.style.color = "#9b332d";
        }
        return;
      }

      if (!this.developerMode) {
        this.coins -= item.price;
      } else {
        this.coins = 999999;
      }

      this.inventory[itemKey] = this.getItemCount(itemKey) + 1;
      this.updateCoinHUD();
      this.updateInventoryUI();

      const owned = this.shopModal?.panel?.querySelector(
        `[data-store-owned="${itemKey}"]`
      );
      if (owned) {
        owned.textContent = `IM INVENTAR: ${this.getItemCount(itemKey)}`;
      }

      const wallet = this.shopModal?.panel?.querySelector("[data-store-wallet]");
      if (wallet) {
        wallet.textContent = this.developerMode
          ? "COINS: ∞"
          : `COINS: ${this.coins}`;
      }

      const status = this.shopModal?.panel?.querySelector("[data-store-status]");
      if (status) {
        status.textContent = `${item.name.toUpperCase()} GEKAUFT`;
        status.style.color = "#35613c";
      }
    }

    openIndianShopWindow() {
      if (!this.indianStoreOverlay || this.shopModal) return;

      // Der Straßen-Button des Innenraums soll NICHT vor dem Shopfenster liegen.
      if (this.indianStoreBackUI?.overlay) {
        this.indianStoreBackUI.overlay.style.display = "none";
      }

      const modal = this.createDOMModal({
        key: "der-inder-shop",
        width: "min(92%, 560px)",
        background: "#f0ddb7",
        border: "#713524",
        shade: "rgba(9, 6, 5, 0.78)",
        padding: "15px"
      });

      if (!modal) {
        if (this.indianStoreBackUI?.overlay) {
          this.indianStoreBackUI.overlay.style.display = "";
        }
        return;
      }

      modal.overlay.style.zIndex = "100020";
      this.shopModal = modal;

      const top = document.createElement("div");
      Object.assign(top.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px"
      });

      const title = this.createDOMText("KAUFBARE ITEMS", {
        fontSize: "13px",
        color: "#713524"
      });
      title.style.textAlign = "left";

      const wallet = this.createDOMText(
        this.developerMode ? "COINS: ∞" : `COINS: ${this.coins}`,
        {
          fontSize: "6px",
          color: "#5d4937"
        }
      );
      wallet.dataset.storeWallet = "true";

      top.append(title, wallet);

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "8px",
        maxWidth: "500px",
        margin: "0 auto 10px"
      });

      ["gatorade", "monster", "camel"].forEach((itemKey) => {
        const card = this.createStoreItemCard(itemKey);
        if (card) grid.appendChild(card);
      });

      const status = this.createDOMText("", {
        fontSize: "6px",
        color: "#35613c",
        margin: "2px 0 10px"
      });
      status.dataset.storeStatus = "true";

      // Nur zurück in den Laden. Kein Straßenbutton mehr im Einkaufsfenster.
      const backToShop = this.createDOMButton("← LADEN", () => this.closeIndianShopWindow(), {
        color: "#3f3127",
        background: "#d5c19b",
        border: "#85684a",
        width: "180px",
        fontSize: "8px"
      });
      backToShop.style.margin = "0 auto";

      modal.panel.append(top, grid, status, backToShop);
      this.refreshUILock();
    }

    closeIndianShopWindow() {
      if (!this.shopModal) return;

      this.destroyDOMModal(this.shopModal);
      this.shopModal = null;

      if (this.itemInfoModal) {
        this.destroyDOMModal(this.itemInfoModal);
        this.itemInfoModal = null;
      }

      if (this.indianStoreBackUI?.overlay) {
        this.indianStoreBackUI.overlay.style.display = "";
      }

      this.refreshUILock();
    }

    exitIndianStore() {
      if (this.itemInfoModal) {
        this.destroyDOMModal(this.itemInfoModal);
        this.itemInfoModal = null;
      }

      if (this.shopModal) {
        this.destroyDOMModal(this.shopModal);
        this.shopModal = null;
      }

      if (this.storeEntryModal) {
        this.destroyDOMModal(this.storeEntryModal);
        this.storeEntryModal = null;
      }

      if (this.indianStoreBackUI) {
        this.destroyDOMModal(this.indianStoreBackUI);
        this.indianStoreBackUI = null;
        this.indianStoreShopUI = null;
      }

      if (this.indianStoreOverlay) {
        this.indianStoreOverlay.list?.forEach((child) => {
          this.tweens.killTweensOf(child);
        });
        this.indianStoreOverlay.destroy(true);
        this.indianStoreOverlay = null;
      }

      this.player.setVisible(true);
      if (this.player.body) this.player.body.enable = true;
      this.player.play("simon-idle", true);

      this.refreshUILock();
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
    }

    updateGandhiStory() {
      if (
        !this.gandhiStoryEligible ||
        this.gandhiEncounterFinished ||
        this.gandhiEncounterStarted ||
        this.playerDying ||
        !this.arrivalFinished
      ) {
        return;
      }

      const inderLeft = 1370;
      const inderRight = 1750;
      const x = this.player.x;
      const insideInder =
        x >= inderLeft && x <= inderRight;

      // If the milkman was defeated while Simon happened to stand inside the
      // facade range, first establish which side he genuinely leaves on.
      if (!this.gandhiPassOriginSide) {
        if (x < inderLeft) {
          this.gandhiPassOriginSide = "left";
        } else if (x > inderRight) {
          this.gandhiPassOriginSide = "right";
        }
        return;
      }

      if (insideInder) {
        this.gandhiPassEnteredZone = true;
        return;
      }

      const crossedToOppositeSide =
        this.gandhiPassEnteredZone &&
        (
          (this.gandhiPassOriginSide === "right" && x < inderLeft) ||
          (this.gandhiPassOriginSide === "left" && x > inderRight)
        );

      if (!crossedToOppositeSide) return;

      this.gandhiPassCompleted = true;

      if (
        this.uiLocked ||
        this.milkmanFightActive ||
        this.milkmanDialogueActive ||
        this.milkmanLootModal ||
        this.indianStoreOverlay ||
        this.shopModal ||
        this.bookstoreOverlay ||
        this.bookstoreCatalogModal
      ) {
        return;
      }

      this.startGandhiEncounter();
    }

    createGandhi(x, groundY) {
      const gandhi = this.add.container(
        x,
        groundY - 67
      ).setDepth(34);

      const g = this.add.graphics();

      g.fillStyle(0x9b704f, 1);
      g.fillRect(-14, 35, 9, 33);
      g.fillRect(5, 35, 9, 33);
      g.fillStyle(0x5f4835, 1);
      g.fillRect(-18, 65, 16, 5);
      g.fillRect(2, 65, 16, 5);

      g.fillStyle(0xf1eee1, 1);
      g.fillRoundedRect(-24, -13, 48, 53, 9);
      g.fillTriangle(-22, 29, -2, 72, 5, 29);
      g.fillTriangle(22, 29, 2, 72, -5, 29);

      g.fillStyle(0xded8c9, 1);
      g.fillTriangle(-25, -11, 4, -9, -18, 36);
      g.lineStyle(2, 0xbcb4a3, 1);
      g.lineBetween(-16, -3, 4, 30);

      g.fillStyle(0xaa7b58, 1);
      g.fillRoundedRect(-31, -3, 10, 42, 5);
      g.fillRoundedRect(21, -3, 10, 42, 5);
      g.fillCircle(-26, 38, 6);
      g.fillCircle(26, 38, 6);

      g.fillStyle(0xb68460, 1);
      g.fillRoundedRect(-18, -53, 36, 36, 11);
      g.fillCircle(-19, -35, 5);
      g.fillCircle(19, -35, 5);

      g.lineStyle(2, 0x3f3933, 1);
      g.strokeCircle(-8, -38, 7);
      g.strokeCircle(8, -38, 7);
      g.lineBetween(-1, -38, 1, -38);

      g.fillStyle(0x2b2622, 1);
      g.fillCircle(-8, -38, 1.5);
      g.fillCircle(8, -38, 1.5);
      g.lineStyle(2, 0x5d3d31, 1);
      g.beginPath();
      g.arc(0, -27, 7, 0.18, Math.PI - 0.18);
      g.strokePath();

      g.lineStyle(4, 0x6e4b2f, 1);
      g.lineBetween(31, -3, 37, 70);
      g.lineBetween(31, -3, 26, -7);

      gandhi.add(g);
      gandhi.setSize(82, 150);

      return gandhi;
    }

    startGandhiEncounter() {
      if (
        this.gandhiEncounterStarted ||
        this.gandhiEncounterFinished ||
        !this.gandhiPassCompleted ||
        this.playerDying
      ) {
        return;
      }

      this.gandhiEncounterStarted = true;
      this.gandhiDialogueActive = false;
      this.gandhiDialogueStep = 0;
      this.setUILocked(true);
      this.syncStreetStoreHitboxes();

      const camera = this.cameras.main.worldView;
      const startX = Phaser.Math.Clamp(
        camera.right + 150,
        80,
        WORLD_WIDTH - 50
      );
      const startY = camera.top - 95;
      const targetX = Phaser.Math.Clamp(
        this.player.x + 165,
        95,
        WORLD_WIDTH - 95
      );
      const targetY = GROUND_TOP - 75;

      this.gandhi = this.createGandhi(
        startX,
        GROUND_TOP - 8
      )
        .setPosition(startX, startY)
        .setAlpha(0)
        .setScale(0.78)
        .setAngle(-10);

      const halo = this.add.circle(
        startX,
        startY + 62,
        24,
        0xfff0b8,
        0.22
      )
        .setStrokeStyle(3, 0xffe7a0, 0.55)
        .setDepth(31);

      const finishArrival = () => {
        if (
          !this.sys.isActive() ||
          !this.gandhi?.active ||
          this.gandhiDialogueActive
        ) {
          return;
        }

        this.tweens.killTweensOf(this.gandhi);
        this.tweens.killTweensOf(halo);
        halo?.destroy?.();

        this.gandhi
          .setPosition(targetX, targetY)
          .setAlpha(1)
          .setScale(1)
          .setAngle(0);

        this.faceGandhiTowardSimon();
        this.gandhiDialogueActive = true;
        this.showGandhiDialogue("Namaste, Simon.");
        this.dialogueIgnoreUntil = this.time.now + 300;
      };

      this.tweens.add({
        targets: this.gandhi,
        x: targetX,
        y: targetY,
        alpha: 1,
        angle: { from: -10, to: 4 },
        duration: 1450,
        ease: "Sine.easeInOut",
        onUpdate: () => {
          if (halo?.active && this.gandhi?.active) {
            halo.setPosition(
              this.gandhi.x,
              this.gandhi.y + 62
            );
          }
        },
        onComplete: finishArrival
      });

      // Failsafe for mobile browsers losing a tween completion callback.
      this.time.delayedCall(1850, finishArrival);
    }

    faceGandhiTowardSimon() {
      if (!this.gandhi || !this.player) return;

      this.gandhi.scaleX =
        this.player.x < this.gandhi.x ? -1 : 1;
      this.gandhi.scaleY =
        Math.abs(this.gandhi.scaleY || 1);
    }

    clearGandhiDialogue() {
      if (this.gandhiDialogueBubble) {
        this.gandhiDialogueBubble.destroy(true);
        this.gandhiDialogueBubble = null;
      }
    }

    showGandhiDialogue(message) {
      this.clearGandhiDialogue();

      if (!this.gandhi) return;

      this.gandhiDialogueBubble =
        this.createSpeechBubble(
          this.gandhi.x,
          this.gandhi.y - 116,
          message,
          0
        ).setDepth(125);
    }

    advanceGandhiDialogue() {
      if (
        !this.gandhiDialogueActive ||
        this.time.now < this.dialogueIgnoreUntil
      ) {
        return false;
      }

      if (this.gandhiDialogueStep === 0) {
        this.gandhiDialogueStep = 1;
        this.showGandhiDialogue(
          "Frieden beginnt nicht bei den anderen. Er beginnt bei dir."
        );
        this.dialogueIgnoreUntil =
          this.time.now + 250;
        return true;
      }

      if (this.gandhiDialogueStep === 1) {
        this.gandhiDialogueStep = 2;
        this.showGandhiDialogue(
          "Wer Gewalt mit Gewalt beantwortet, macht die Welt nur dunkler."
        );
        this.dialogueIgnoreUntil =
          this.time.now + 250;
        return true;
      }

      this.clearGandhiDialogue();
      this.gandhiDialogueActive = false;
      this.openGandhiChoice();
      return true;
    }

    openGandhiChoice() {
      if (
        this.gandhiChoiceModal ||
        !this.gandhi ||
        this.gandhiDead
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "gandhi-choice",
        width: "min(92%, 500px)",
        placement: "bottom",
        background: "#16171b",
        border: "#ded8bf",
        shade: "rgba(0, 0, 0, 0)",
        padding: "10px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.gandhiChoiceModal = modal;

      const title = this.createDOMText(
        "WAS MACHT SIMON?",
        {
          fontSize: "8px",
          color: "#eee9d8",
          margin: "0 0 9px"
        }
      );

      const buttons = document.createElement("div");
      Object.assign(buttons.style, {
        display: "grid",
        gridTemplateColumns: "1.35fr 1fr",
        gap: "8px"
      });

      const nuke = this.createDOMButton(
        "NUKE GANDHI",
        () => this.nukeGandhi(),
        {
          color: "#ffe7c7",
          background: "#7a2626",
          border: "#f0a16e",
          minHeight: "43px",
          fontSize: "8px"
        }
      );

      const spare = this.createDOMButton(
        "WEITERGEHEN",
        () => this.spareGandhi(),
        {
          color: "#e7eadf",
          background: "#364139",
          border: "#84947e",
          minHeight: "43px",
          fontSize: "6px"
        }
      );

      buttons.append(nuke, spare);
      modal.panel.append(title, buttons);
      this.refreshUILock();
    }

    closeGandhiChoice() {
      if (!this.gandhiChoiceModal) return;

      this.destroyDOMModal(this.gandhiChoiceModal);
      this.gandhiChoiceModal = null;
    }

    spareGandhi() {
      if (!this.gandhi || this.gandhiDead) return;

      this.closeGandhiChoice();
      this.gandhiEncounterFinished = true;

      const targetX = 1521;

      this.tweens.add({
        targets: this.gandhi,
        x: targetX,
        alpha: 0,
        scale: 0.72,
        duration: 720,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.gandhi?.destroy?.(true);
          this.gandhi = null;
          this.refreshUILock();
          this.syncStreetStoreHitboxes();
        }
      });
    }

    createAtomicBomb(x, y) {
      const bomb = this.add.container(x, y)
        .setDepth(210);

      const g = this.add.graphics();

      g.fillStyle(0x25292d, 1);
      g.fillEllipse(0, 0, 34, 72);
      g.fillStyle(0x3f474d, 1);
      g.fillRoundedRect(-12, -38, 24, 13, 4);

      g.fillStyle(0xa43b2f, 1);
      g.fillTriangle(-17, 20, -34, 40, -8, 35);
      g.fillTriangle(17, 20, 34, 40, 8, 35);

      g.fillStyle(0xf4ce52, 1);
      g.fillCircle(0, 2, 10);
      g.fillStyle(0x25292d, 1);
      g.fillCircle(0, 2, 4);

      const label = this.add.text(
        0,
        2,
        "☢",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "13px",
          color: "#2b2b24"
        }
      ).setOrigin(0.5);

      bomb.add([g, label]);
      return bomb;
    }

    nukeGandhi() {
      if (
        !this.gandhi ||
        this.gandhiDead ||
        this.gandhiNukeActive
      ) {
        return;
      }

      this.closeGandhiChoice();

      this.gandhiNukeActive = true;
      this.gandhiNukeStartedAt = this.time.now;
      this.gandhiNukePhase = "falling";
      this.gandhiRevivalScheduled = false;
      this.setUILocked(true);
      this.syncStreetStoreHitboxes();

      const targetX = this.gandhi.x;
      const targetY = this.gandhi.y - 18;
      const startY =
        this.cameras.main.worldView.top - 110;

      this.gandhiBomb =
        this.createAtomicBomb(
          targetX,
          startY
        );

      this.tweens.add({
        targets: this.gandhiBomb,
        y: targetY,
        angle: 28,
        duration: 920,
        ease: "Quad.easeIn",
        onComplete: () => {
          this.gandhiBomb?.destroy?.(true);
          this.gandhiBomb = null;
          this.runGandhiNukeExplosion();
        }
      });
    }

    runGandhiNukeExplosion() {
      if (!this.sys.isActive()) return;

      // Critical robustness rule: the normal Gandhi is a Phaser Container.
      // Containers do NOT provide Sprite.setTint(). The previous build called
      // setTint() here and threw exactly when the bomb landed, leaving the game
      // locked forever. This sequence uses only Container-supported transforms.
      if (!this.gandhi?.active) {
        this.forceDarkGandhiRevival();
        return;
      }

      this.gandhiNukePhase = "exploded";

      const x = this.gandhi.x;
      const y = GROUND_TOP - 48;

      this.cameras.main.flash(280, 255, 245, 214);
      this.cameras.main.shake(620, 0.018);

      const flash = this.add.circle(
        x,
        y,
        30,
        0xfff8d8,
        0.98
      ).setDepth(230);

      const fire = this.add.circle(
        x,
        y,
        24,
        0xff9b32,
        0.95
      ).setDepth(229);

      const shock = this.add.circle(
        x,
        y,
        26,
        0x000000,
        0
      )
        .setStrokeStyle(8, 0xffd76a, 0.92)
        .setDepth(228);

      this.gandhiExplosionObjects.push(
        flash,
        fire,
        shock
      );

      this.tweens.add({
        targets: flash,
        scale: 7.6,
        alpha: 0,
        duration: 620,
        ease: "Quad.easeOut",
        onComplete: () => flash?.destroy?.()
      });

      this.tweens.add({
        targets: fire,
        scale: 5.2,
        alpha: 0,
        duration: 720,
        ease: "Quad.easeOut",
        onComplete: () => fire?.destroy?.()
      });

      this.tweens.add({
        targets: shock,
        scale: 7,
        alpha: 0,
        duration: 760,
        ease: "Quad.easeOut",
        onComplete: () => shock?.destroy?.()
      });

      [
        [0, -20, 27],
        [-23, -38, 21],
        [23, -38, 21],
        [0, -57, 29],
        [-29, -61, 20],
        [29, -61, 20],
        [0, -82, 25]
      ].forEach(([dx, dy, radius], index) => {
        const puff = this.add.circle(
          x + dx,
          y + dy,
          radius,
          index < 3 ? 0x514a43 : 0x716b64,
          0.88
        ).setDepth(224 + index);

        this.gandhiExplosionObjects.push(puff);

        this.tweens.add({
          targets: puff,
          y: puff.y - 30 - index * 5,
          scale: 1.35 + index * 0.05,
          alpha: 0,
          duration: 1250 + index * 90,
          ease: "Sine.easeOut",
          onComplete: () => puff?.destroy?.()
        });
      });

      // Gandhi lies apparently dead. Container-safe only: alpha / angle /
      // position / depth are supported by Phaser.Container.
      this.tweens.killTweensOf(this.gandhi);
      this.gandhi
        .setAlpha(0.72)
        .setAngle(88)
        .setY(GROUND_TOP - 16)
        .setDepth(24);
      this.gandhi.disableInteractive?.();

      const scorch = this.add.ellipse(
        x,
        GROUND_TOP - 3,
        132,
        22,
        0x211b18,
        0.48
      ).setDepth(5);

      this.gandhiExplosionObjects.push(scorch);

      // Independent Scene timer rather than a tween onComplete chain. The
      // update-loop watchdog below is a second recovery path if this callback
      // is ever missed after scene reuse.
      this.gandhiRevivalScheduled = true;
      this.time.delayedCall(1050, () => {
        if (!this.sys.isActive()) return;
        this.forceDarkGandhiRevival();
      });
    }

    forceDarkGandhiRevival() {
      if (
        this.darkGandhiBossActive ||
        this.darkGandhiDefeated ||
        !this.sys.isActive()
      ) {
        return;
      }

      this.gandhiNukePhase = "reviving";
      this.gandhiRevivalScheduled = false;

      const x = Number.isFinite(this.gandhi?.x)
        ? this.gandhi.x
        : Phaser.Math.Clamp(this.player?.x || 1521, 120, WORLD_WIDTH - 120);

      if (this.gandhi?.active) {
        this.tweens.killTweensOf(this.gandhi);
        this.gandhi.destroy(true);
      }

      this.gandhi = this.createDarkGandhi(
        x,
        GROUND_TOP - 8
      );

      this.gandhi
        .setAlpha(0)
        .setScale(0.78)
        .setY(GROUND_TOP - 70);

      const reviveAura = this.add.circle(
        x,
        GROUND_TOP - 72,
        30,
        0x25050d,
        0
      )
        .setStrokeStyle(6, 0xe6223a, 0.9)
        .setDepth(46);

      const eyeFlashLeft = this.add.circle(
        x - 8,
        GROUND_TOP - 113,
        3,
        0xff2037,
        1
      ).setDepth(57);

      const eyeFlashRight = this.add.circle(
        x + 8,
        GROUND_TOP - 113,
        3,
        0xff2037,
        1
      ).setDepth(57);

      this.tweens.add({
        targets: reviveAura,
        scale: 4,
        alpha: { from: 0.95, to: 0 },
        duration: 720,
        ease: "Quad.easeOut",
        onComplete: () => reviveAura?.destroy?.()
      });

      this.tweens.add({
        targets: [eyeFlashLeft, eyeFlashRight],
        scale: { from: 1, to: 2.4 },
        alpha: { from: 1, to: 0 },
        duration: 620,
        ease: "Sine.easeOut",
        onComplete: () => {
          eyeFlashLeft?.destroy?.();
          eyeFlashRight?.destroy?.();
        }
      });

      this.tweens.add({
        targets: this.gandhi,
        alpha: 1,
        scale: 1,
        y: GROUND_TOP - 75,
        duration: 480,
        ease: "Back.easeOut"
      });

      // Start the boss from a Scene timer, not from the tween callback.
      this.time.delayedCall(500, () => {
        if (!this.sys.isActive()) return;
        this.startDarkGandhiBoss();
      });
    }

    updateGandhiNukeFailsafe(time) {
      if (
        !this.gandhiNukeActive ||
        this.darkGandhiBossActive ||
        this.darkGandhiDefeated
      ) {
        return;
      }

      const startedAt = Number(this.gandhiNukeStartedAt) || time;
      const elapsed = time - startedAt;

      // Falling bomb should hit in < 1 s, corpse + revival in another ~1.5 s.
      // If any tween/callback was lost during a scene/input edge case, recover
      // automatically instead of leaving Simon locked.
      if (elapsed > 2800) {
        this.forceDarkGandhiRevival();
      }
    }

    createDarkGandhi(x, groundY) {
      const gandhi = this.add.container(
        x,
        groundY - 67
      ).setDepth(48);

      const g = this.add.graphics();

      // Black dhoti / robes.
      g.fillStyle(0x141317, 1);
      g.fillRoundedRect(-27, -15, 54, 57, 9);
      g.fillTriangle(-25, 30, -4, 73, 5, 30);
      g.fillTriangle(25, 30, 4, 73, -5, 30);

      g.fillStyle(0x2a222c, 1);
      g.fillTriangle(-28, -12, 6, -8, -19, 39);
      g.lineStyle(2, 0x5c324f, 1);
      g.lineBetween(-18, -2, 5, 31);

      // Legs / sandals.
      g.fillStyle(0x8d654d, 1);
      g.fillRect(-14, 38, 9, 31);
      g.fillRect(5, 38, 9, 31);
      g.fillStyle(0x171214, 1);
      g.fillRect(-18, 66, 16, 6);
      g.fillRect(2, 66, 16, 6);

      // Arms/head.
      g.fillStyle(0x9b7055, 1);
      g.fillRoundedRect(-34, -3, 11, 43, 5);
      g.fillRoundedRect(23, -3, 11, 43, 5);
      g.fillRoundedRect(-19, -55, 38, 37, 11);
      g.fillCircle(-20, -37, 5);
      g.fillCircle(20, -37, 5);

      // Dark glasses frame, glowing red eyes.
      g.lineStyle(2, 0x0b0a0c, 1);
      g.strokeCircle(-8, -40, 8);
      g.strokeCircle(8, -40, 8);
      g.lineBetween(-1, -40, 1, -40);

      g.fillStyle(0xff2638, 1);
      g.fillCircle(-8, -40, 3);
      g.fillCircle(8, -40, 3);

      // Angry mouth.
      g.lineStyle(2, 0x3a1218, 1);
      g.lineBetween(-8, -26, 8, -30);

      // Black staff with red tip.
      g.lineStyle(5, 0x17131a, 1);
      g.lineBetween(32, -5, 38, 72);
      g.fillStyle(0xd32136, 1);
      g.fillCircle(32, -7, 5);

      gandhi.add(g);
      gandhi.setSize(92, 156);
      gandhi.__darkGandhi = true;

      return gandhi;
    }

    reviveAsDarkGandhi() {
      this.forceDarkGandhiRevival();
    }

    startDarkGandhiBoss() {
      if (
        !this.gandhi?.active ||
        this.darkGandhiDefeated
      ) {
        return;
      }

      this.darkGandhiBossActive = true;
      this.gandhiNukeActive = false;
      this.gandhiNukePhase = "boss";
      this.gandhiRevivalScheduled = false;
      this.gandhiDead = false;
      this.darkGandhiHp = this.darkGandhiMaxHp;
      this.darkGandhiPhase = 0;
      this.darkGandhiHitCounter = 0;

      this.createDarkGandhiHealthBar();
      this.createDarkGandhiPhaseHUD();
      this.setDarkGandhiPhase(1, true);
      this.updateDarkGandhiHealthBar();

      this.player?.setVisible(true);
      this.player?.setActive(true);
      this.player?.clearTint?.();
      this.player?.setAlpha(1);

      if (this.player?.body) {
        this.player.body.enable = true;
        this.player.body.moves = true;
      }

      this.setUILocked(false);
      this.setControlsVisible(true);
      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
      this.syncStreetStoreHitboxes();
    }

    getDarkGandhiPhaseConfig(phase) {
      return {
        1: {
          title: "PHASE 1 / 3",
          name: "SALZMARSCH",
          detail: "3 TREFFER · STOCK + SALZ",
          accent: 0xf3e8c6
        },
        2: {
          title: "PHASE 2 / 3",
          name: "KARMA",
          detail: "3 TREFFER · KARMA + WIEDERGEBURT",
          accent: 0xb66dff
        },
        3: {
          title: "PHASE 3 / 3",
          name: "NUCLEAR LEVEL: MAX",
          detail: "3 TREFFER · NUKES + AHIMSA",
          accent: 0xff4b4b
        }
      }[phase];
    }

    createDarkGandhiPhaseHUD() {
      this.darkGandhiPhaseHUD?.destroy?.(true);

      const hud = this.add.container(
        GAME_WIDTH / 2,
        63
      )
        .setScrollFactor(0)
        .setDepth(520);

      const bg = this.add.graphics();
      bg.fillStyle(0x0b0910, 0.90);
      bg.fillRoundedRect(-165, -23, 330, 46, 8);
      bg.lineStyle(2, 0xede3cd, 0.55);
      bg.strokeRoundedRect(-165, -23, 330, 46, 8);

      const phase = this.add.text(
        0,
        -8,
        "DARK GANDHI",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#fff0d2"
        }
      ).setOrigin(0.5);

      const detail = this.add.text(
        0,
        10,
        "",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#d9cfe4"
        }
      ).setOrigin(0.5);

      hud.add([bg, phase, detail]);
      hud.__phaseText = phase;
      hud.__detailText = detail;
      this.darkGandhiPhaseHUD = hud;
    }

    announceDarkGandhiPhase(phase) {
      const cfg = this.getDarkGandhiPhaseConfig(phase);
      if (!cfg) return;

      this.darkGandhiPhaseBanner?.destroy?.(true);

      const banner = this.add.container(
        GAME_WIDTH / 2,
        128
      )
        .setScrollFactor(0)
        .setDepth(650);

      const bg = this.add.graphics();
      bg.fillStyle(0x08070b, 0.94);
      bg.fillRoundedRect(-220, -38, 440, 76, 10);
      bg.lineStyle(4, cfg.accent, 0.95);
      bg.strokeRoundedRect(-220, -38, 440, 76, 10);

      const title = this.add.text(
        0,
        -14,
        cfg.title,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "13px",
          color: "#fff5df",
          stroke: "#100d12",
          strokeThickness: 5
        }
      ).setOrigin(0.5);

      const name = this.add.text(
        0,
        15,
        cfg.name,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: `#${cfg.accent.toString(16).padStart(6, "0")}`,
          stroke: "#100d12",
          strokeThickness: 4
        }
      ).setOrigin(0.5);

      banner.add([bg, title, name]);
      this.darkGandhiPhaseBanner = banner;

      this.tweens.add({
        targets: banner,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.86, to: 1 },
        duration: 180,
        yoyo: true,
        hold: 1050,
        onComplete: () => {
          if (this.darkGandhiPhaseBanner === banner) {
            banner.destroy(true);
            this.darkGandhiPhaseBanner = null;
          }
        }
      });
    }

    setDarkGandhiPhase(phase, force = false) {
      phase = Phaser.Math.Clamp(Number(phase) || 1, 1, 3);
      if (!force && phase === this.darkGandhiPhase) return;

      this.darkGandhiPhase = phase;
      const now = this.time.now;
      const cfg = this.getDarkGandhiPhaseConfig(phase);

      // Each phase has its own attack vocabulary. Clear leftovers so the
      // transition is visually and mechanically unmistakable.
      this.cleanupDarkGandhiAttackObjects();
      this.darkGandhiPhaseTransitionUntil = now + 1500;
      this.darkGandhiPhaseMinUntil = now + 4500;
      this.darkGandhiPhaseHits = 0;
      this.darkGandhiPhaseQueued = false;
      this.darkGandhiAhimsaUntil = 0;
      this.darkGandhiHitCounter = 0;

      // Each phase stays visible long enough for its signature move.
      this.darkGandhiNextStaffAt = now + 2550;
      this.darkGandhiNextSaltAt = now + 1550;
      this.darkGandhiNextRebirthAt = now + 1650;
      this.darkGandhiNextNukeAt = now + 1750;
      this.darkGandhiNextAhimsaAt = now + 3150;
      this.darkGandhiLastDrainAt = now;

      this.darkGandhiPhaseAura?.destroy?.();
      this.darkGandhiPhaseAura = this.add.circle(
        this.gandhi.x,
        this.gandhi.y - 28,
        48,
        0x000000,
        0
      )
        .setStrokeStyle(4, cfg.accent, 0.78)
        .setDepth(44);

      if (this.darkGandhiPhaseHUD?.active) {
        this.darkGandhiPhaseHUD.__phaseText?.setText(
          `${cfg.title} · ${cfg.name}`
        );
        this.darkGandhiPhaseHUD.__phaseText?.setColor(
          `#${cfg.accent.toString(16).padStart(6, "0")}`
        );
        this.darkGandhiPhaseHUD.__detailText?.setText(cfg.detail);
      }

      this.announceDarkGandhiPhase(phase);
      this.cameras.main.flash(150, 110, 45, 70);
    }

    createDarkGandhiHealthBar() {
      this.destroyDarkGandhiHealthBar();

      const container = this.add.container(
        this.gandhi.x,
        this.gandhi.y - 112
      ).setDepth(155);

      const frame = this.add.graphics();
      frame.fillStyle(0x0c0b0f, 0.96);
      frame.fillRoundedRect(-76, -12, 152, 24, 6);
      frame.lineStyle(2, 0xffc9ce, 0.92);
      frame.strokeRoundedRect(-76, -12, 152, 24, 6);

      this.darkGandhiHealthFill = this.add.rectangle(
        -71,
        -3,
        142,
        10,
        0xcc2638
      ).setOrigin(0, 0.5);

      this.darkGandhiPhaseText = this.add.text(
        0,
        7,
        "PHASE 1 · SALZMARSCH",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#ffe9cc"
        }
      ).setOrigin(0.5);

      container.add([
        frame,
        this.darkGandhiHealthFill,
        this.darkGandhiPhaseText
      ]);

      this.darkGandhiHealthBar = container;
    }

    destroyDarkGandhiHealthBar() {
      this.darkGandhiHealthBar?.destroy?.(true);
      this.darkGandhiHealthBar = null;
      this.darkGandhiHealthFill = null;
      this.darkGandhiPhaseText = null;
    }

    updateDarkGandhiHealthBar() {
      if (
        !this.darkGandhiHealthBar ||
        !this.gandhi?.active
      ) {
        return;
      }

      const ratio = Phaser.Math.Clamp(
        this.darkGandhiHp / this.darkGandhiMaxHp,
        0,
        1
      );

      this.darkGandhiHealthFill.displayWidth =
        142 * ratio;

      this.darkGandhiHealthBar.setPosition(
        this.gandhi.x,
        this.gandhi.y - 112
      );

      if (this.darkGandhiPhaseText) {
        const cfg = this.getDarkGandhiPhaseConfig(this.darkGandhiPhase);
        this.darkGandhiPhaseText.setText(
          cfg ? `${cfg.title} · ${cfg.name}` : "DARK GANDHI"
        );
      }
    }

    faceDarkGandhiTowardSimon() {
      if (
        !this.gandhi?.__darkGandhi ||
        !this.player
      ) {
        return;
      }

      const direction =
        this.player.x < this.gandhi.x
          ? -1
          : 1;

      this.gandhi.scaleX =
        Math.abs(this.gandhi.scaleX || 1) * direction;
      this.gandhi.scaleY =
        Math.abs(this.gandhi.scaleY || 1);
    }

    damageSimonFromDarkGandhi(amount, label = null) {
      if (
        this.playerDying ||
        !this.darkGandhiBossActive ||
        this.time.now < this.darkGandhiPlayerHitUntil
      ) {
        return false;
      }

      this.darkGandhiPlayerHitUntil =
        this.time.now + 420;

      this.hp = Math.max(
        0,
        this.hp - Math.max(0, Number(amount) || 0)
      );

      this.updateHpBar();
      this.showImpact(
        this.player.x,
        this.player.y - 55,
        label || `-${amount}`
      );

      this.cameras.main.shake(90, 0.006);

      if (this.hp <= 0) {
        this.killSimonAndRestart();
        return true;
      }

      this.playerHitUntil =
        this.time.now + 320;
      this.player.play("simon-hit", true);
      this.player.setTint(0xffc2c8);

      this.time.delayedCall(330, () => {
        if (
          !this.playerDying &&
          this.player?.active
        ) {
          this.player.clearTint();
        }
      });

      return true;
    }

    applyDarkGandhiDamage(amount, time, label = null) {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active ||
        this.playerDying
      ) {
        return false;
      }

      const damage = Math.max(0, Number(amount) || 0);
      if (damage <= 0) return false;

      if (time < this.darkGandhiPhaseTransitionUntil) {
        this.showImpact(
          this.gandhi.x,
          this.gandhi.y - 68,
          "PHASENWECHSEL"
        );
        return false;
      }

      if (time < this.darkGandhiAhimsaUntil) {
        this.damageSimonFromDarkGandhi(
          5,
          "AHIMSA −5"
        );
        this.showImpact(
          this.gandhi.x,
          this.gandhi.y - 70,
          "GEWALT KEHRT ZURÜCK"
        );
        return false;
      }

      if (this.darkGandhiPhaseHits >= 3) {
        this.showImpact(
          this.gandhi.x,
          this.gandhi.y - 58,
          "PHASE GESCHAFFT"
        );
        return false;
      }

      const appliedDamage = Math.min(10, damage);

      this.darkGandhiHp = Math.max(
        0,
        this.darkGandhiHp - appliedDamage
      );
      this.darkGandhiHitCounter += 1;
      this.darkGandhiPhaseHits += 1;

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 55,
        label || `-${appliedDamage}`
      );

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 82,
        `TREFFER ${this.darkGandhiPhaseHits}/3`
      );

      if (this.darkGandhiPhaseHits >= 3) {
        const floorByPhase = {
          1: 60,
          2: 30,
          3: 0
        };

        this.darkGandhiHp =
          floorByPhase[this.darkGandhiPhase] ?? this.darkGandhiHp;
        this.darkGandhiPhaseQueued = true;
      }

      this.updateDarkGandhiHealthBar();

      // Trigger Karma early enough that Phase 2 is clearly visible.
      if (
        this.darkGandhiPhase === 2 &&
        this.darkGandhiPhaseHits === 2
      ) {
        this.scheduleKarmicRetaliation();
      }

      return true;
    }

    performDarkGandhiHit(time) {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active ||
        this.playerDying ||
        time < this.darkGandhiPhaseTransitionUntil
      ) {
        return;
      }

      const dx = this.gandhi.x - this.player.x;
      const facingCorrect =
        Math.sign(dx || this.facing) === this.facing;

      if (
        Math.abs(dx) > 108 ||
        !facingCorrect
      ) {
        return;
      }

      // Simon's normal hit remains exactly 10 HP in every phase.
      const applied = this.applyDarkGandhiDamage(
        10,
        time,
        "-10"
      );

      if (applied && this.gandhi?.active) {
        this.tweens.add({
          targets: this.gandhi,
          x: this.gandhi.x + Math.sign(dx || 1) * 13,
          duration: 75,
          yoyo: true
        });
      }
    }

    spawnSaltMarch() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active ||
        this.playerDying
      ) {
        return;
      }

      const direction =
        this.player.x < this.gandhi.x
          ? -1
          : 1;

      for (let i = 0; i < 2; i += 1) {
        const salt = this.add.container(
          this.gandhi.x + direction * (38 + i * 36),
          GROUND_TOP - 13
        ).setDepth(30);

        const g = this.add.graphics();
        g.fillStyle(0xf3eee1, 0.96);
        g.fillTriangle(-13, 10, 0, -10, 13, 10);
        g.fillStyle(0xdad4c9, 0.92);
        g.fillTriangle(-8, 9, 4, -7, 10, 9);
        salt.add(g);

        this.physics.add.existing(salt);
        salt.body.setSize(27, 22);
        salt.body.setAllowGravity(false);
        salt.body.setVelocityX(
          direction * (82 + i * 10)
        );

        salt.__hit = false;
        this.darkGandhiSaltProjectiles.push(salt);

        this.physics.add.overlap(
          this.player,
          salt,
          () => {
            if (
              salt.__hit ||
              !salt.active
            ) {
              return;
            }

            salt.__hit = true;
            this.darkGandhiSlowUntil =
              this.time.now + 1000;

            this.damageSimonFromDarkGandhi(
              5,
              "SALZ −5"
            );

            salt.destroy(true);
          },
          null,
          this
        );
      }

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 75,
        "SALZMARSCH"
      );
    }

    darkGandhiStaffAttack() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        return;
      }

      const dx = this.player.x - this.gandhi.x;
      if (Math.abs(dx) > 92) return;

      this.faceDarkGandhiTowardSimon();

      this.tweens.add({
        targets: this.gandhi,
        angle: { from: 0, to: Math.sign(dx || 1) * 13 },
        duration: 90,
        yoyo: true
      });

      this.damageSimonFromDarkGandhi(
        6,
        "STOCK −6"
      );
    }

    scheduleKarmicRetaliation() {
      const target = this.gandhi;
      if (!target?.active) return;

      this.showImpact(
        target.x,
        target.y - 82,
        "KARMA"
      );

      this.time.delayedCall(800, () => {
        if (
          !this.darkGandhiBossActive ||
          !target.active ||
          this.gandhi !== target
        ) {
          return;
        }

        const direction =
          this.player.x < target.x
            ? -1
            : 1;

        const orb = this.add.circle(
          target.x,
          target.y - 35,
          10,
          0x7b1530,
          0.92
        )
          .setStrokeStyle(3, 0xff6b78, 0.9)
          .setDepth(62);

        this.physics.add.existing(orb);
        orb.body.setAllowGravity(false);
        orb.body.setVelocityX(direction * 170);
        orb.__hit = false;

        this.darkGandhiKarmaProjectiles.push(orb);

        this.physics.add.overlap(
          this.player,
          orb,
          () => {
            if (
              orb.__hit ||
              !orb.active
            ) {
              return;
            }

            orb.__hit = true;
            this.damageSimonFromDarkGandhi(
              6,
              "KARMA −6"
            );
            orb.destroy();
          },
          null,
          this
        );
      });
    }

    startWheelOfRebirth() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active ||
        this.darkGandhiClones.length > 0
      ) {
        return;
      }

      this.darkGandhiCloneStartedAt =
        this.time.now;

      for (let i = 0; i < 3; i += 1) {
        const clone = this.createDarkGandhi(
          this.gandhi.x,
          GROUND_TOP - 8
        );

        clone
          .setAlpha(0.38)
          .setScale(0.72)
          .setDepth(42);

        clone.__rebirthIndex = i;
        this.darkGandhiClones.push(clone);
      }

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 85,
        "RAD DER WIEDERGEBURT"
      );
    }

    updateWheelOfRebirth(time) {
      if (this.darkGandhiClones.length === 0) {
        return;
      }

      const elapsed =
        time - this.darkGandhiCloneStartedAt;

      if (
        elapsed > 2400 ||
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        this.darkGandhiClones.forEach(
          (clone) => clone?.destroy?.(true)
        );
        this.darkGandhiClones = [];
        return;
      }

      const radius =
        62 + Math.sin(elapsed / 220) * 8;

      this.darkGandhiClones.forEach(
        (clone, index) => {
          if (!clone?.active) return;

          const angle =
            elapsed / 760 +
            index * (Math.PI * 2 / 3);

          clone.x =
            this.gandhi.x +
            Math.cos(angle) * radius;
          clone.y =
            this.gandhi.y +
            Math.sin(angle) * 22;

          if (
            Math.abs(clone.x - this.player.x) < 44 &&
            Math.abs(clone.y - this.player.y) < 70 &&
            time >= this.darkGandhiCloneHitUntil
          ) {
            this.darkGandhiCloneHitUntil =
              time + 1000;

            this.damageSimonFromDarkGandhi(
              4,
              "WIEDERKEHR −4"
            );
          }
        }
      );
    }

    scheduleCivilizationNuke() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        return;
      }

      const targetX = Phaser.Math.Clamp(
        this.player.x,
        60,
        WORLD_WIDTH - 60
      );

      const marker = this.add.container(
        targetX,
        GROUND_TOP - 6
      ).setDepth(120);

      const ring = this.add.circle(
        0,
        0,
        26,
        0x000000,
        0
      ).setStrokeStyle(4, 0xe54343, 0.9);

      const cross = this.add.text(
        0,
        -28,
        "NUCLEAR",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#ffb3a6",
          stroke: "#4a0c0f",
          strokeThickness: 3
        }
      ).setOrigin(0.5);

      marker.add([ring, cross]);
      this.darkGandhiNukeMarkers.push(marker);

      this.tweens.add({
        targets: ring,
        scale: { from: 0.7, to: 1.35 },
        alpha: { from: 1, to: 0.4 },
        duration: 230,
        yoyo: true,
        repeat: 3
      });

      this.time.delayedCall(1550, () => {
        if (
          !this.darkGandhiBossActive ||
          !marker.active
        ) {
          marker?.destroy?.(true);
          return;
        }

        const blast = this.add.circle(
          targetX,
          GROUND_TOP - 36,
          18,
          0xffb22f,
          0.96
        ).setDepth(125);

        const blastRing = this.add.circle(
          targetX,
          GROUND_TOP - 36,
          22,
          0x000000,
          0
        )
          .setStrokeStyle(6, 0xff6650, 0.92)
          .setDepth(124);

        this.tweens.add({
          targets: [blast, blastRing],
          scale: 5.5,
          alpha: 0,
          duration: 520,
          onComplete: () => {
            blast.destroy();
            blastRing.destroy();
          }
        });

        this.cameras.main.shake(160, 0.01);

        if (
          Math.abs(this.player.x - targetX) < 70
        ) {
          this.damageSimonFromDarkGandhi(
            12,
            "NUKE −12"
          );
        }

        marker.destroy(true);
        this.darkGandhiNukeMarkers =
          this.darkGandhiNukeMarkers.filter(
            (item) => item !== marker
          );
      });
    }

    startAhimsaInversion() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        return;
      }

      this.darkGandhiAhimsaUntil =
        this.time.now + 1800;
      this.darkGandhiLastDrainAt =
        this.time.now;

      this.darkGandhiAura?.destroy?.();
      this.darkGandhiAura = this.add.circle(
        this.gandhi.x,
        this.gandhi.y - 25,
        46,
        0x000000,
        0
      )
        .setStrokeStyle(5, 0xf3e4b1, 0.86)
        .setDepth(45);

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 90,
        "AHIMSA INVERSION"
      );
    }

    updateAhimsaInversion(time) {
      if (
        time >= this.darkGandhiAhimsaUntil
      ) {
        this.darkGandhiAura?.destroy?.();
        this.darkGandhiAura = null;
        return;
      }

      if (this.darkGandhiAura?.active) {
        this.darkGandhiAura.setPosition(
          this.gandhi.x,
          this.gandhi.y - 25
        );
        this.darkGandhiAura.scale =
          1 + Math.sin(time / 120) * 0.08;
      }

      // Ahimsa now only reverses attacks briefly. It no longer removes boss
      // HP automatically, so Phase 3 also requires exactly three Simon hits.
    }

    cleanupDarkGandhiAttackObjects() {
      [
        ...this.darkGandhiSaltProjectiles,
        ...this.darkGandhiKarmaProjectiles,
        ...this.darkGandhiClones,
        ...this.darkGandhiNukeMarkers
      ].forEach((object) => {
        object?.destroy?.(true);
      });

      this.darkGandhiSaltProjectiles = [];
      this.darkGandhiKarmaProjectiles = [];
      this.darkGandhiClones = [];
      this.darkGandhiNukeMarkers = [];

      this.darkGandhiAura?.destroy?.();
      this.darkGandhiAura = null;
    }

    updateDarkGandhiBoss(time, delta) {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active ||
        this.playerDying ||
        this.uiLocked ||
        this.inVoid ||
        this.rewindActive
      ) {
        return;
      }

      this.updateDarkGandhiHealthBar();
      this.faceDarkGandhiTowardSimon();

      if (this.darkGandhiPhaseAura?.active) {
        this.darkGandhiPhaseAura.setPosition(
          this.gandhi.x,
          this.gandhi.y - 28
        );
        this.darkGandhiPhaseAura.scale =
          1 + Math.sin(time / 150) * 0.08;
      }

      if (
        this.darkGandhiPhaseQueued &&
        time >= this.darkGandhiPhaseMinUntil
      ) {
        this.darkGandhiPhaseQueued = false;

        if (this.darkGandhiPhase === 1) {
          this.setDarkGandhiPhase(2);
          return;
        }

        if (this.darkGandhiPhase === 2) {
          this.setDarkGandhiPhase(3);
          return;
        }

        this.defeatDarkGandhi();
        return;
      }

      if (time < this.darkGandhiPhaseTransitionUntil) {
        return;
      }

      const dx = this.player.x - this.gandhi.x;
      const absDx = Math.abs(dx);
      const speed = [0, 46, 56, 66][this.darkGandhiPhase] || 46;

      if (absDx > 78) {
        this.gandhi.x +=
          Math.sign(dx) * speed * (delta / 1000);
      }

      if (
        absDx < 90 &&
        time >= this.darkGandhiNextStaffAt
      ) {
        this.darkGandhiNextStaffAt = time + 2100;
        this.darkGandhiStaffAttack();
      }

      if (this.darkGandhiPhase === 1) {
        if (time >= this.darkGandhiNextSaltAt) {
          this.darkGandhiNextSaltAt = time + 3400;
          this.spawnSaltMarch();
        }
      } else if (this.darkGandhiPhase === 2) {
        if (time >= this.darkGandhiNextRebirthAt) {
          this.darkGandhiNextRebirthAt = time + 6200;
          this.startWheelOfRebirth();
        }
        this.updateWheelOfRebirth(time);
      } else if (this.darkGandhiPhase === 3) {
        if (time >= this.darkGandhiNextNukeAt) {
          this.darkGandhiNextNukeAt = time + 5000;
          this.scheduleCivilizationNuke();
        }

        if (
          time >= this.darkGandhiNextAhimsaAt &&
          time >= this.darkGandhiAhimsaUntil
        ) {
          this.darkGandhiNextAhimsaAt = time + 9000;
          this.startAhimsaInversion();
        }

        this.updateAhimsaInversion(time);
      }

      this.darkGandhiSaltProjectiles =
        this.darkGandhiSaltProjectiles.filter((object) => {
          if (!object?.active) return false;
          if (
            object.x < this.cameras.main.worldView.left - 180 ||
            object.x > this.cameras.main.worldView.right + 180
          ) {
            object.destroy(true);
            return false;
          }
          return true;
        });

      this.darkGandhiKarmaProjectiles =
        this.darkGandhiKarmaProjectiles.filter((object) => {
          if (!object?.active) return false;
          if (
            object.x < this.cameras.main.worldView.left - 180 ||
            object.x > this.cameras.main.worldView.right + 180
          ) {
            object.destroy();
            return false;
          }
          return true;
        });
    }

    defeatDarkGandhi() {
      if (
        !this.darkGandhiBossActive ||
        !this.gandhi?.active
      ) {
        return;
      }

      this.darkGandhiBossActive = false;
      this.darkGandhiDefeated = true;
      this.gandhiDead = true;
      this.gandhiEncounterFinished = true;

      this.cleanupDarkGandhiAttackObjects();
      this.destroyDarkGandhiHealthBar();
      this.darkGandhiPhaseHUD?.destroy?.(true);
      this.darkGandhiPhaseHUD = null;
      this.darkGandhiPhaseBanner?.destroy?.(true);
      this.darkGandhiPhaseBanner = null;
      this.darkGandhiPhaseAura?.destroy?.();
      this.darkGandhiPhaseAura = null;

      this.tweens.killTweensOf(this.gandhi);

      this.gandhi
        .setAngle(88)
        .setY(GROUND_TOP - 16)
        .setAlpha(0.72)
        .setDepth(24)
        .setSize(125, 78)
        .setInteractive({ useHandCursor: true });

      this.gandhi.removeAllListeners?.("pointerdown");
      this.gandhi.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openGandhiLootModal();
      });

      this.showImpact(
        this.gandhi.x,
        this.gandhi.y - 45,
        "DARK GANDHI BESIEGT"
      );

      this.setUILocked(false);
      this.setControlsVisible(true);
      this.syncStreetStoreHitboxes();
    }

    restoreDarkGandhiLootCorpseIfNeeded() {
      if (
        !this.darkGandhiDefeated ||
        this.gandhiSticksLooted ||
        this.gandhi?.active
      ) {
        return;
      }

      // If Simon leaves Bahnhofstrasse after the boss fight without looting,
      // the reusable scene would otherwise lose the corpse permanently.
      this.gandhi = this.createDarkGandhi(
        1605,
        GROUND_TOP - 8
      );

      this.gandhi
        .setAngle(88)
        .setY(GROUND_TOP - 16)
        .setAlpha(0.72)
        .setDepth(24)
        .setSize(125, 78)
        .setInteractive({ useHandCursor: true });

      this.gandhi.removeAllListeners?.("pointerdown");
      this.gandhi.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openGandhiLootModal();
      });
    }

    openGandhiLootModal() {
      if (
        !this.darkGandhiDefeated ||
        !this.gandhi?.active ||
        this.gandhiLootModal ||
        this.itemsModal ||
        this.shopModal ||
        this.bookstoreCatalogModal
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "gandhi-loot",
        width: "min(90%, 480px)",
        background: "#17141b",
        border: "#d6b06a",
        shade: "rgba(5, 5, 8, .72)",
        padding: "18px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.gandhiLootModal = modal;

      const question = this.createDOMText(
        this.gandhiSticksLooted
          ? "Die Wurfstöcke wurden bereits genommen."
          : "Gandhis Wurfstöcke klauen?",
        {
          fontSize: "9px",
          color: "#fff0d0",
          margin: "0 0 18px"
        }
      );

      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: this.gandhiSticksLooted ? "1fr" : "1fr 1fr",
        gap: "10px",
        maxWidth: "330px",
        margin: "0 auto"
      });

      if (!this.gandhiSticksLooted) {
        row.append(
          this.createDOMButton(
            "JA",
            () => this.lootGandhiThrowingSticks(),
            {
              color: "#302414",
              background: "#e0c483",
              border: "#8d6a34",
              fontSize: "9px"
            }
          ),
          this.createDOMButton(
            "NEIN",
            () => this.closeGandhiLootModal(),
            {
              color: "#ddd8df",
              background: "#39343e",
              border: "#77707d",
              fontSize: "9px"
            }
          )
        );
      } else {
        row.append(
          this.createDOMButton(
            "ZURÜCK",
            () => this.closeGandhiLootModal(),
            {
              color: "#ddd8df",
              background: "#39343e",
              border: "#77707d",
              fontSize: "8px"
            }
          )
        );
      }

      modal.panel.append(question, row);
      this.refreshUILock();
    }

    lootGandhiThrowingSticks() {
      if (this.gandhiSticksLooted) return;

      this.gandhiSticksLooted = true;
      this.inventory.gandhiSticks = 1;
      this.updateInventoryUI();

      const lootedGandhi = this.gandhi;
      this.scheduleLootedCharacterDespawn(
        lootedGandhi,
        30000,
        () => {
          if (this.gandhi === lootedGandhi) {
            this.gandhi = null;
          }
        }
      );

      this.showAbilityStatusMessage(
        "GANDHIS WURFSTÖCKE ERHALTEN",
        1800
      );
      this.closeGandhiLootModal();
    }

    closeGandhiLootModal() {
      if (!this.gandhiLootModal) return;

      this.destroyDOMModal(this.gandhiLootModal);
      this.gandhiLootModal = null;
      this.refreshUILock();
    }

    startMilkmanEncounter() {
      if (
        this.milkmanEncounterStarted ||
        this.playerDying ||
        !this.arrivalFinished
      ) {
        return;
      }

      this.milkmanEncounterStarted = true;
      this.milkmanDialogueActive = true;
      this.milkmanDialogueStep = 0;
      this.milkmanHp = this.milkmanMaxHp;

      this.setUILocked(true);
      this.syncStreetStoreHitboxes();

      const cameraRight = this.cameras.main.worldView.right;
      const vanStartX = Math.min(WORLD_WIDTH - 150, cameraRight + 310);
      const vanStopX = Math.min(WORLD_WIDTH - 210, cameraRight - 70);

      this.milkVan = this.createMilkVan(vanStartX, 248);

      this.tweens.add({
        targets: this.milkVan,
        x: vanStopX,
        duration: 1250,
        ease: "Sine.easeOut",
        onComplete: () => {
          this.time.delayedCall(250, () => {
            this.milkman = this.createMilkman(vanStopX + 40, GROUND_TOP - 8);
            this.milkman.setAlpha(0);

            this.tweens.add({
              targets: this.milkman,
              x: vanStopX - 78,
              alpha: 1,
              duration: 560,
              ease: "Back.easeOut",
              onComplete: () => {
                this.faceMilkmanTowardSimon();
                this.showMilkmanDialogue("Dich kenn ich doch!");

                // Screen taps advance only this dialogue.
                this.dialogueIgnoreUntil = this.time.now + 300;
              }
            });
          });
        }
      });
    }

    createMilkVan(x, y) {
      const van = this.add.container(x, y).setDepth(12);
      const g = this.add.graphics();

      // White milk delivery van.
      g.fillStyle(0xf2f3ee, 1);
      g.fillRoundedRect(-105, -52, 210, 78, 12);
      g.fillStyle(0xd9e7ee, 1);
      g.fillRect(-82, -39, 58, 31);
      g.fillRect(40, -39, 44, 31);

      g.fillStyle(0x5a96bb, 1);
      g.fillRect(-105, 4, 210, 22);

      g.fillStyle(0x24313a, 1);
      g.fillCircle(-62, 29, 18);
      g.fillCircle(65, 29, 18);
      g.fillStyle(0xaeb7ba, 1);
      g.fillCircle(-62, 29, 8);
      g.fillCircle(65, 29, 8);

      // Milk bottle emblem.
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(-5, -35, 19, 37, 4);
      g.fillRect(0, -43, 9, 9);
      g.fillStyle(0x5a96bb, 1);
      g.fillRect(-1, -18, 11, 12);

      const label = this.add.text(5, -6, "MILCH", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#24506b"
      }).setOrigin(0.5);

      van.add([g, label]);
      return van;
    }

    createMilkman(x, groundY) {
      const man = this.add.container(x, groundY - 68).setDepth(32);
      const g = this.add.graphics();

      // Legs / boots.
      g.fillStyle(0x26323a, 1);
      g.fillRect(-18, 29, 13, 45);
      g.fillRect(5, 29, 13, 45);
      g.fillStyle(0x151a1d, 1);
      g.fillRect(-22, 69, 21, 9);
      g.fillRect(1, 69, 22, 9);

      // White-blue milkman uniform.
      g.fillStyle(0xe8ece9, 1);
      g.fillRoundedRect(-28, -26, 56, 62, 8);
      g.fillStyle(0x4f86a9, 1);
      g.fillRect(-28, 9, 56, 10);
      g.fillRect(-5, -26, 10, 62);

      // Arms.
      g.fillStyle(0xd0a17e, 1);
      g.fillRoundedRect(-36, -13, 12, 42, 5);
      g.fillRoundedRect(24, -13, 12, 42, 5);

      // Head.
      g.fillStyle(0xd2a27e, 1);
      g.fillRoundedRect(-18, -58, 36, 34, 8);

      // Hair + cap.
      g.fillStyle(0x44362e, 1);
      g.fillRect(-16, -60, 32, 7);
      g.fillStyle(0xe8ece9, 1);
      g.fillRect(-21, -67, 42, 10);
      g.fillStyle(0x4f86a9, 1);
      g.fillRect(-23, -59, 46, 5);

      // Angry eyebrows / mouth.
      g.lineStyle(3, 0x36251f, 1);
      g.lineBetween(-12, -49, -4, -45);
      g.lineBetween(4, -45, 12, -49);
      g.lineBetween(-8, -31, 8, -31);

      man.add(g);
      man.setSize(82, 150);

      return man;
    }

    faceMilkmanTowardSimon() {
      if (!this.milkman || !this.player) return;
      this.milkman.scaleX = this.player.x < this.milkman.x ? -1 : 1;
    }

    showMilkmanDialogue(message) {
      this.clearMilkmanDialogue();

      if (!this.milkman) return;

      this.milkmanDialogueBubble = this.createSpeechBubble(
        this.milkman.x,
        this.milkman.y - 120,
        message,
        0
      ).setDepth(120);
    }

    clearMilkmanDialogue() {
      if (this.milkmanDialogueBubble) {
        this.milkmanDialogueBubble.destroy(true);
        this.milkmanDialogueBubble = null;
      }
    }

    advanceMilkmanDialogue() {
      if (
        !this.milkmanDialogueActive ||
        this.time.now < this.dialogueIgnoreUntil
      ) {
        return false;
      }

      if (this.milkmanDialogueStep === 0) {
        this.milkmanDialogueStep = 1;
        this.showMilkmanDialogue("Din Fründ het mer mini Milch klaut!");
        this.dialogueIgnoreUntil = this.time.now + 240;
        return true;
      }

      if (this.milkmanDialogueStep === 1) {
        this.milkmanDialogueStep = 2;
        this.showMilkmanDialogue("Jetzt wirsch mini rache spüre!");
        this.dialogueIgnoreUntil = this.time.now + 240;
        return true;
      }

      this.clearMilkmanDialogue();
      this.milkmanDialogueActive = false;
      this.startMilkmanFight();
      return true;
    }

    startMilkmanFight() {
      if (!this.milkman || this.milkmanDefeated) return;

      this.milkmanFightActive = true;
      this.milkmanHp = this.milkmanMaxHp;
      this.milkBottleThrowCount = 0;

      if (!Number.isFinite(this.milkmanRngState)) {
        this.milkmanRngState = 0x51a7c3d9;
      }

      this.nextMilkBottleAt =
        this.time.now + this.nextMilkBottleDelay();
      this.nextMilkmanPunchAt = 0;

      this.createMilkmanHealthBar();
      this.setUILocked(false);
      this.setControlsVisible(true);
      this.syncStreetStoreHitboxes();
    }

    createMilkmanHealthBar() {
      this.destroyMilkmanHealthBar();

      const container = this.add.container(
        this.milkman.x,
        this.milkman.y - 98
      ).setDepth(130);

      const frame = this.add.graphics();
      frame.fillStyle(0x16191c, 0.95);
      frame.fillRoundedRect(-52, -8, 104, 16, 4);
      frame.lineStyle(2, 0xf4eee2, 0.9);
      frame.strokeRoundedRect(-52, -8, 104, 16, 4);

      this.milkmanHealthFill = this.add.rectangle(
        -48,
        0,
        96,
        9,
        0xcf4148
      ).setOrigin(0, 0.5);

      container.add([frame, this.milkmanHealthFill]);
      this.milkmanHealthBar = container;
      this.updateMilkmanHealthBar();
    }

    updateMilkmanHealthBar() {
      if (!this.milkmanHealthBar || !this.milkman) return;

      const ratio = Phaser.Math.Clamp(
        this.milkmanHp / this.milkmanMaxHp,
        0,
        1
      );

      this.milkmanHealthFill.displayWidth = 96 * ratio;
      this.milkmanHealthBar.setPosition(
        this.milkman.x,
        this.milkman.y - 105
      );
    }

    destroyMilkmanHealthBar() {
      if (this.milkmanHealthBar) {
        this.milkmanHealthBar.destroy(true);
        this.milkmanHealthBar = null;
        this.milkmanHealthFill = null;
      }
    }

    nextMilkBottleDelay() {
      // Local deterministic PRNG. Rewinding the stored state reproduces the
      // same 1–3 second throw rhythm.
      this.milkmanRngState =
        (
          (Math.imul(1664525, this.milkmanRngState >>> 0) + 1013904223)
          >>> 0
        );

      return 1000 + (this.milkmanRngState % 2001);
    }

    captureMilkmanRewindState(time) {
      const milkmanExists = Boolean(this.milkman?.active);

      return {
        exists: milkmanExists,
        encounterStarted: Boolean(this.milkmanEncounterStarted),
        fightActive: Boolean(this.milkmanFightActive),
        defeated: Boolean(this.milkmanDefeated),
        hp: this.milkmanHp,
        throwCount: this.milkBottleThrowCount,
        rngState: this.milkmanRngState >>> 0,
        nextBottleInMs: Number.isFinite(this.nextMilkBottleAt)
          ? Math.max(0, this.nextMilkBottleAt - time)
          : 0,
        nextPunchInMs: Number.isFinite(this.nextMilkmanPunchAt)
          ? Math.max(0, this.nextMilkmanPunchAt - time)
          : 0,
        milkman: milkmanExists
          ? {
              x: this.milkman.x,
              y: this.milkman.y,
              angle: this.milkman.angle,
              scaleX: this.milkman.scaleX,
              scaleY: this.milkman.scaleY,
              flipX: this.milkman.flipX,
              alpha: this.milkman.alpha,
              depth: this.milkman.depth
            }
          : null,
        bottles: (this.milkBottles || [])
          .filter((bottle) => bottle?.active && bottle.body)
          .map((bottle) => ({
            x: bottle.x,
            y: bottle.y,
            vx: bottle.body.velocity.x,
            vy: bottle.body.velocity.y,
            damage: Number(bottle.__milkDamage) || 10,
            superMilk: Boolean(bottle.__superMilk)
          }))
      };
    }

    createRestoredMilkBottle(data) {
      const isSuperMilk = Boolean(data?.superMilk);
      const damage = isSuperMilk ? 20 : 10;

      const bottle = this.add.container(
        Number(data?.x) || this.player.x,
        Number(data?.y) || (GROUND_TOP - 30)
      ).setDepth(28);

      const g = this.add.graphics();

      if (isSuperMilk) {
        g.fillStyle(0xffffff, 1);
        g.fillRoundedRect(-10, -17, 20, 34, 5);
        g.fillRect(-6, -26, 12, 10);
        g.fillStyle(0x70c7ff, 1);
        g.fillRect(-8, -5, 16, 12);
        g.fillStyle(0xffdf5b, 1);
        g.fillRect(-8, 8, 16, 5);
        g.lineStyle(3, 0x4e86a8, 1);
        g.strokeRoundedRect(-10, -17, 20, 34, 5);

        const label = this.add.text(
          0,
          -39,
          "SUPER MILCH",
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5.5px",
            color: "#fff5b8",
            stroke: "#235a79",
            strokeThickness: 3
          }
        )
          .setOrigin(0.5)
          .setDepth(29);

        bottle.add([g, label]);
      } else {
        g.fillStyle(0xf5f6ef, 1);
        g.fillRoundedRect(-7, -12, 14, 24, 4);
        g.fillRect(-4, -18, 8, 7);
        g.fillStyle(0x80acd1, 1);
        g.fillRect(-5, -3, 10, 8);
        g.lineStyle(2, 0x80919a, 1);
        g.strokeRoundedRect(-7, -12, 14, 24, 4);
        bottle.add(g);
      }

      this.physics.add.existing(bottle);
      bottle.body.setSize(
        isSuperMilk ? 24 : 16,
        isSuperMilk ? 48 : 34
      );
      bottle.body.setAllowGravity(false);
      bottle.body.setVelocity(
        Number(data?.vx) || 0,
        Number(data?.vy) || 0
      );

      bottle.__milkHit = false;
      bottle.__milkDamage = damage;
      bottle.__superMilk = isSuperMilk;

      this.milkBottles.push(bottle);

      this.physics.add.overlap(
        this.player,
        bottle,
        () => this.hitSimonWithMilkBottle(bottle),
        null,
        this
      );

      return bottle;
    }

    restoreMilkmanRewindState(state, now) {
      if (!state) return;

      this.milkBottles.forEach((bottle) => {
        bottle?.destroy?.(true);
      });
      this.milkBottles = [];

      this.milkmanEncounterStarted =
        Boolean(state.encounterStarted);
      this.milkmanFightActive =
        Boolean(state.fightActive);
      this.milkmanDefeated =
        Boolean(state.defeated);
      this.milkmanHp = Phaser.Math.Clamp(
        Number(state.hp) || 0,
        0,
        this.milkmanMaxHp
      );
      this.milkBottleThrowCount =
        Math.max(0, Number(state.throwCount) || 0);
      this.milkmanRngState =
        Number(state.rngState) >>> 0;

      this.nextMilkBottleAt =
        now + Math.max(0, Number(state.nextBottleInMs) || 0);
      this.nextMilkmanPunchAt =
        now + Math.max(0, Number(state.nextPunchInMs) || 0);

      if (state.exists) {
        if (!this.milkman?.active) {
          this.milkman = this.createMilkman(
            Number(state.milkman?.x) || this.player.x + 230,
            GROUND_TOP - 8
          );
        }

        this.milkman.setPosition(
          Number(state.milkman?.x) || this.milkman.x,
          Number(state.milkman?.y) || this.milkman.y
        );
        this.milkman.setAngle(
          Number(state.milkman?.angle) || 0
        );
        this.milkman.setScale(
          Number.isFinite(state.milkman?.scaleX)
            ? Math.abs(state.milkman.scaleX)
            : Math.abs(this.milkman.scaleX || 1),
          Number.isFinite(state.milkman?.scaleY)
            ? Math.abs(state.milkman.scaleY)
            : Math.abs(this.milkman.scaleY || 1)
        );
        this.milkman.setFlipX(Boolean(state.milkman?.flipX));
        this.milkman.setAlpha(
          Number.isFinite(state.milkman?.alpha)
            ? state.milkman.alpha
            : 1
        );
        this.milkman.setDepth(
          Number.isFinite(state.milkman?.depth)
            ? state.milkman.depth
            : 32
        );

        if (this.milkmanDefeated) {
          this.milkman.setInteractive({ useHandCursor: true });
        } else {
          this.milkman.disableInteractive?.();
          this.milkman.setAngle(0);

          if (this.milkman.__milkmanV15) {
            this.milkman
              .setScale(0.78)
              .setSize(104, 184);
            this.milkman.play("milkman-v15-idle", true);
          }
        }
      }

      (state.bottles || []).forEach((bottleData) => {
        this.createRestoredMilkBottle(bottleData);
      });

      if (
        this.milkmanFightActive &&
        this.milkman?.active &&
        !this.milkmanDefeated
      ) {
        if (!this.milkmanHealthBar) {
          this.createMilkmanHealthBar();
        }
        this.updateMilkmanHealthBar();
      } else {
        this.destroyMilkmanHealthBar();
      }

      this.syncStreetStoreHitboxes();
    }

    createMilkBottleProjectile() {
      if (
        this.time.now < this.__rewindSuppressMilkmanUntil ||
        this.inVoid ||
        this.rewindActive ||
        !this.milkmanFightActive ||
        !this.milkman ||
        this.milkmanDefeated ||
        this.playerDying
      ) {
        return;
      }

      this.milkBottleThrowCount += 1;
      const isSuperMilk = this.milkBottleThrowCount % 3 === 0;
      const damage = isSuperMilk ? 20 : 10;

      const direction = this.player.x < this.milkman.x ? -1 : 1;
      this.faceMilkmanTowardSimon();

      const bottle = this.add.container(
        this.milkman.x + direction * 28,
        GROUND_TOP - (isSuperMilk ? 35 : 30)
      ).setDepth(28);

      const g = this.add.graphics();

      if (isSuperMilk) {
        // Every third projectile is visibly larger and more dangerous.
        g.fillStyle(0xffffff, 1);
        g.fillRoundedRect(-10, -17, 20, 34, 5);
        g.fillRect(-6, -26, 12, 10);
        g.fillStyle(0x70c7ff, 1);
        g.fillRect(-8, -5, 16, 12);
        g.fillStyle(0xffdf5b, 1);
        g.fillRect(-8, 8, 16, 5);
        g.lineStyle(3, 0x4e86a8, 1);
        g.strokeRoundedRect(-10, -17, 20, 34, 5);

        const superLabel = this.add.text(0, -39, "SUPER MILCH", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5.5px",
          color: "#fff5b8",
          stroke: "#235a79",
          strokeThickness: 3
        })
          .setOrigin(0.5)
          .setDepth(29);

        bottle.add([g, superLabel]);
      } else {
        g.fillStyle(0xf5f6ef, 1);
        g.fillRoundedRect(-7, -12, 14, 24, 4);
        g.fillRect(-4, -18, 8, 7);
        g.fillStyle(0x80acd1, 1);
        g.fillRect(-5, -3, 10, 8);
        g.lineStyle(2, 0x80919a, 1);
        g.strokeRoundedRect(-7, -12, 14, 24, 4);
        bottle.add(g);
      }

      this.physics.add.existing(bottle);

      if (isSuperMilk) {
        bottle.body.setSize(24, 48);
      } else {
        bottle.body.setSize(16, 34);
      }

      bottle.body.setAllowGravity(false);

      const normalMilkSpeed = 225;
      const projectileSpeed = isSuperMilk
        ? normalMilkSpeed * 1.5
        : normalMilkSpeed;

      bottle.body.setVelocityX(direction * projectileSpeed);

      bottle.__milkHit = false;
      bottle.__milkDamage = damage;
      bottle.__superMilk = isSuperMilk;

      this.milkBottles.push(bottle);

      this.physics.add.overlap(
        this.player,
        bottle,
        () => this.hitSimonWithMilkBottle(bottle),
        null,
        this
      );
    }

    hitSimonWithMilkBottle(bottle) {
      if (
        !bottle?.active ||
        bottle.__milkHit ||
        !this.milkmanFightActive ||
        this.playerDying
      ) {
        return;
      }

      bottle.__milkHit = true;

      const damage = Number(bottle.__milkDamage) || 10;
      const isSuperMilk = Boolean(bottle.__superMilk);

      bottle.destroy(true);

      this.hp = Math.max(0, this.hp - damage);
      this.updateHpBar();
      this.showImpact(
        this.player.x,
        this.player.y - 55,
        isSuperMilk ? "-20 SUPER!" : "-10"
      );
      this.cameras.main.shake(
        isSuperMilk ? 170 : 110,
        isSuperMilk ? 0.010 : 0.006
      );

      if (this.hp <= 0) {
        this.killSimonAndRestart();
        return;
      }

      this.playerHitUntil = this.time.now + 320;
      this.player.anims.stop();
      this.player.play("simon-hit", true);
      this.player.setTint(0xcfe9ff);

      this.time.delayedCall(320, () => {
        if (this.playerDying) return;
        this.player.clearTint();
      });
    }

    performMilkmanPunch(time) {
      if (
        !this.milkmanFightActive ||
        !this.milkman ||
        this.milkmanDefeated ||
        time < this.nextMilkmanPunchAt
      ) {
        return;
      }

      this.nextMilkmanPunchAt = time + 420;

      const dx = this.milkman.x - this.player.x;
      const facingCorrect =
        Math.sign(dx || this.facing) === this.facing;

      if (Math.abs(dx) > 105 || !facingCorrect) {
        return;
      }

      this.milkmanHp = Math.max(0, this.milkmanHp - 10);
      this.showImpact(this.milkman.x, this.milkman.y - 48, "POW!");
      this.cameras.main.shake(70, 0.003);
      this.updateMilkmanHealthBar();

      this.tweens.add({
        targets: this.milkman,
        x: this.milkman.x + Math.sign(dx || 1) * 16,
        duration: 90,
        yoyo: true
      });

      if (this.milkmanHp <= 0) {
        this.defeatMilkman();
      }
    }

    updateMilkmanFight(time, delta) {
      if (
        this.inVoid ||
        this.rewindActive ||
        !this.milkmanFightActive ||
        !this.milkman ||
        this.milkmanDefeated ||
        this.playerDying
      ) {
        return;
      }

      // Follow Simon if he moves far enough that the encounter would leave
      // the camera. Within fighting range he holds his ground and throws.
      const dx = this.player.x - this.milkman.x;
      const followThreshold = 300;

      if (Math.abs(dx) > followThreshold) {
        const direction = Math.sign(dx) || 1;
        this.milkman.x += direction * 125 * (delta / 1000);
        this.faceMilkmanTowardSimon();
      }

      this.updateMilkmanHealthBar();

      if (time >= this.nextMilkBottleAt) {
        this.createMilkBottleProjectile();

        // Same 1–3 s range, now deterministic so Ewige Wiederkehr can
        // reproduce the same environmental timing after a rewind.
        this.nextMilkBottleAt =
          time + this.nextMilkBottleDelay();
      }

      // Remove projectiles that have left the active world/camera area.
      this.milkBottles = this.milkBottles.filter((bottle) => {
        if (!bottle?.active) return false;

        const tooFar =
          bottle.x < this.cameras.main.worldView.left - 160 ||
          bottle.x > this.cameras.main.worldView.right + 160;

        if (tooFar) {
          bottle.destroy(true);
          return false;
        }

        return true;
      });
    }

    prepareMilkmanCorpse() {
      if (!this.milkman?.active) return;

      this.tweens.killTweensOf(this.milkman);
      this.milkman.removeAllListeners?.("pointerdown");
      this.milkman.setAngle(84);
      this.milkman.setY(GROUND_TOP - 17);
      this.milkman.setDepth(25);
      this.milkman.setSize(120, 75);
      this.milkman.setInteractive({ useHandCursor: true });

      this.milkman.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openMilkmanLootModal();
      });
    }

    setupDeveloperPostMilkman() {
      if (
        this.developerCheckpoint !== "post-milkman" ||
        !this.player?.active
      ) {
        return;
      }

      [
        this.arrivalTram,
        this.arrivalDoor,
        this.tramHitbox,
        this.tramBoardingMarker
      ].forEach((object) => object?.destroy?.());

      this.arrivalTram = null;
      this.arrivalDoor = null;
      this.tramHitbox = null;
      this.tramBoardingMarker = null;
      this.tramBoardingEnabled = false;
      this.tramTransitActive = false;
      this.__tramSwitching = false;

      // Start completely to the right of Der Inder.
      this.player.setPosition(1885, 246);
      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.setVelocity(0, 0);
      this.player.clearTint();
      this.player.setAlpha(1);
      this.player.setAngle(0);
      this.player.play("simon-idle", true);

      if (this.player.body) {
        this.player.body.enable = true;
        this.player.body.moves = true;
      }

      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);

      this.milkmanEncounterStarted = true;
      this.milkmanDialogueActive = false;
      this.milkmanFightActive = false;
      this.milkmanDefeated = true;
      this.milkmanLooted = false;
      this.milkmanHp = 0;

      this.gandhiStoryEligible = true;
      this.gandhiEncounterFinished = false;
      this.gandhiDead = false;
      this.darkGandhiDefeated = false;
      this.gandhiPassOriginSide = "right";
      this.gandhiPassEnteredZone = false;
      this.gandhiPassCompleted = false;
      this.gandhiTriggerArmed = false;

      this.milkVan = this.createMilkVan(2070, 248);
      this.milkman = this.createMilkman(1815, GROUND_TOP - 8);
      this.prepareMilkmanCorpse();

      this.setUILocked(false);
      this.setControlsVisible(true);
      this.updateCoinHUD();
      this.updateHpBar();
      this.updateInventoryUI();
      this.syncStreetStoreHitboxes();

      this.showImpact(
        this.milkman.x,
        this.milkman.y - 35,
        "K.O."
      );
    }

    defeatMilkman() {
      if (this.milkmanDefeated || !this.milkman) return;

      this.milkmanDefeated = true;
      this.milkmanFightActive = false;

      // Gandhi is only allowed after Simon has defeated the milkman AND then
      // completely crossed Der Inder from one side to the other.
      this.gandhiStoryEligible = true;
      this.gandhiPassCompleted = false;
      this.gandhiPassEnteredZone = false;

      const inderLeft = 1370;
      const inderRight = 1750;
      this.gandhiPassOriginSide =
        this.player.x < inderLeft
          ? "left"
          : (this.player.x > inderRight ? "right" : null);
      this.gandhiTriggerArmed = false;

      this.milkBottles.forEach((bottle) => bottle?.destroy?.(true));
      this.milkBottles = [];

      this.destroyMilkmanHealthBar();
      this.prepareMilkmanCorpse();

      this.showImpact(this.milkman.x, this.milkman.y - 35, "K.O.!");
      this.syncStreetStoreHitboxes();
    }

    openMilkmanLootModal() {
      if (
        !this.milkmanDefeated ||
        this.milkmanLootModal ||
        this.itemsModal ||
        this.shopModal ||
        this.bookstoreCatalogModal
      ) {
        return;
      }

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "milkman-loot",
        width: "min(88%, 460px)",
        background: "#edf2ef",
        border: "#4f86a9",
        shade: "rgba(5, 7, 11, 0.7)",
        padding: "18px"
      });

      if (!modal) {
        this.setUILocked(false);
        return;
      }

      this.milkmanLootModal = modal;

      const question = this.createDOMText(
        this.milkmanLooted
          ? "Hier gibt es nichts mehr zu holen."
          : "Milchmann beklauen?",
        {
          fontSize: "10px",
          color: "#24343e",
          margin: "0 0 18px"
        }
      );

      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: this.milkmanLooted ? "1fr" : "1fr 1fr",
        gap: "10px",
        maxWidth: "310px",
        margin: "0 auto"
      });

      if (!this.milkmanLooted) {
        row.append(
          this.createDOMButton(
            "JA",
            () => this.lootMilkman(),
            {
              color: "#214f32",
              background: "#b8d7b5",
              border: "#688568",
              fontSize: "10px"
            }
          ),
          this.createDOMButton(
            "NEIN",
            () => this.closeMilkmanLootModal(),
            {
              color: "#3d4244",
              background: "#d6dcda",
              border: "#78878a",
              fontSize: "10px"
            }
          )
        );
      } else {
        row.append(
          this.createDOMButton(
            "ZURÜCK",
            () => this.closeMilkmanLootModal(),
            {
              color: "#3d4244",
              background: "#d6dcda",
              border: "#78878a",
              fontSize: "8px"
            }
          )
        );
      }

      modal.panel.append(question, row);
      this.refreshUILock();
    }

    lootMilkman() {
      if (this.milkmanLooted) return;

      this.milkmanLooted = true;

      if (!this.developerMode) {
        this.coins += 500;
      } else {
        this.coins = 999999;
      }

      this.updateCoinHUD();
      this.animateCoinGain(500);

      const lootedMilkman = this.milkman;
      const lootedMilkVan = this.milkVan;

      this.scheduleLootedCharacterDespawn(
        [lootedMilkman, lootedMilkVan],
        30000,
        () => {
          if (this.milkman === lootedMilkman) {
            this.milkman = null;
          }

          if (this.milkVan === lootedMilkVan) {
            this.milkVan = null;
          }
        }
      );

      this.closeMilkmanLootModal();
    }

    closeMilkmanLootModal() {
      if (!this.milkmanLootModal) return;

      this.destroyDOMModal(this.milkmanLootModal);
      this.milkmanLootModal = null;
      this.refreshUILock();
    }

    // During the encounter, transit and stores are intentionally blocked so
    // the boss fight cannot be escaped into another scene/modal.
    boardTram() {
      if (
        this.milkmanDialogueActive ||
        this.milkmanFightActive ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiLootModal ||
        this.gandhiNukeActive ||
        this.darkGandhiBossActive
      ) {
        return;
      }

      super.boardTram();
    }

    openItemsModal() {
      if (
        this.milkmanDialogueActive ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiLootModal ||
        this.gandhiNukeActive ||
        this.darkGandhiBossActive
      ) {
        return;
      }

      super.openItemsModal();
    }

    update(time, delta) {
      // Read X before the base update consumes the touch request.
      const keyboardPunch =
        this.input.keyboard &&
        Phaser.Input.Keyboard.JustDown(this.keyShoot);
      const touchPunch =
        this.touchShootRequested;
      const punchPressed =
        keyboardPunch || touchPunch;

      if (
        this.darkGandhiBossActive &&
        !this.uiLocked &&
        !this.playerDying &&
        punchPressed
      ) {
        this.performDarkGandhiHit(time);
      } else if (
        this.milkmanFightActive &&
        !this.uiLocked &&
        !this.playerDying &&
        punchPressed
      ) {
        this.performMilkmanPunch(time);
      }

      super.update(time, delta);
      this.updateMilkmanFight(time, delta);
      this.updateGandhiNukeFailsafe(time);
      this.updateDarkGandhiBoss(time, delta);
      this.updateGandhiStory();
    }

    getTramDestinations() {
      return [
        {
          key: "milchbuck",
          label: "MILCHBUCK"
        }
      ];
    }

    startTramJourney(destinationKey) {
      if (destinationKey !== "milchbuck") {
        this.refreshUILock();
        return;
      }

      if (
        this.__tramSwitching ||
        this.tramTransitActive ||
        this.darkGandhiBossActive ||
        this.gandhiDialogueActive ||
        this.gandhiChoiceModal ||
        this.gandhiLootModal ||
        this.gandhiNukeActive
      ) {
        return;
      }

      if (!this.consumeCityTicket()) {
        this.__tramSwitching = false;
        this.refreshUILock();
        return;
      }

      this.__tramSwitching = true;
      this.tramTransitActive = true;
      this.setUILocked(true);
      this.player.setVelocity(0, 0);
      this.cameras.main.stopFollow();

      const returnData = {
        arrivalFrom: "bahnhofstrasse",
        coins: this.developerMode ? 999999 : this.coins,
        hp: this.hp,
        hasCityTicket: false,
        developerMode: this.developerMode,
        inventory: { ...this.inventory },
        booksOwned: { ...this.booksOwned },
        gandhiStoryEligible: this.gandhiStoryEligible,
        gandhiEncounterFinished: this.gandhiEncounterFinished,
        gandhiDead: this.gandhiDead,
        darkGandhiDefeated: this.darkGandhiDefeated,
        gandhiPassOriginSide: this.gandhiPassOriginSide,
        gandhiPassEnteredZone: this.gandhiPassEnteredZone,
        gandhiPassCompleted: this.gandhiPassCompleted,
        gandhiSticksLooted: this.gandhiSticksLooted,
        booksRead: { ...this.booksRead },
        abilitiesUnlocked: { ...this.abilitiesUnlocked },
        activeAbility: this.activeAbility,
        forItselfCooldownUntil: this.forItselfCooldownUntil,
        hotbarItems: [...this.hotbarItems],
        selectedHotbarIndex: this.selectedHotbarIndex,
        sprintExpiresAt: this.sprintExpiresAt
      };

      const doorX =
        (this.arrivalTram?.x || 470) + 156;

      this.tweens.add({
        targets: this.player,
        x: doorX,
        y: 250,
        duration: 430,
        ease: "Sine.easeInOut",
        onComplete: () => {
          if (!this.sys.isActive()) return;

          this.player.setVisible(false);
          if (this.player.body) this.player.body.enable = false;

          const leave = () => {
            if (!this.sys.isActive()) return;

            if (this.arrivalTram?.active) {
              this.tweens.add({
                targets: this.arrivalTram,
                x: -330,
                duration: 1750,
                ease: "Sine.easeIn"
              });
            }

            this.time.delayedCall(650, () => {
              if (!this.sys.isActive()) return;

              this.cameras.main.fadeOut(420, 0, 0, 0);

              this.time.delayedCall(440, () => {
                if (!this.sys.isActive()) return;

                this.cameras.main.resetFX();
                this.scene.start("MilchbuckScene", returnData);
              });
            });
          };

          if (this.arrivalDoor?.active) {
            this.tweens.add({
              targets: this.arrivalDoor,
              scaleX: 1,
              alpha: 1,
              duration: 220,
              ease: "Quad.easeOut",
              onComplete: leave
            });
          } else {
            leave();
          }
        }
      });
    }

    createArrivalTram() {
      const tram = this.add.container(365, 0).setDepth(10);
      const g = this.add.graphics();

      g.fillStyle(0xe9edef, 1);
      g.fillRect(0, 219, 250, 96);
      g.fillStyle(0x1766a6, 1);
      g.fillRect(0, 274, 250, 41);

      g.fillStyle(0x263e4d, 1);
      [19, 73, 127, 181].forEach((x) => {
        g.fillRect(x, 235, 42, 28);
      });

      // Türbereich.
      g.fillStyle(0x182832, 1);
      g.fillRect(139, 232, 35, 76);
      g.lineStyle(2, 0xb8dce7, 1);
      g.strokeRect(139, 232, 35, 76);

      g.fillStyle(0x252a2d, 1);
      g.fillCircle(51, 317, 13);
      g.fillCircle(200, 317, 13);

      tram.add(g);

      this.arrivalDoor = this.add.rectangle(156, 270, 30, 70, 0x243844, 1);
      tram.add(this.arrivalDoor);

      // Weißer Einstiegspunkt an der Tür, erst mit gültigem Ticket sichtbar.
      this.tramBoardingMarker = this.add.circle(156, 218, 6, 0xffffff, 1)
        .setStrokeStyle(2, 0xe8f6ff, 0.95)
        .setVisible(false);

      tram.add(this.tramBoardingMarker);

      this.tweens.add({
        targets: this.tramBoardingMarker,
        alpha: { from: 0.2, to: 1 },
        scale: { from: 0.82, to: 1.18 },
        duration: 520,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      // Hitbox an der endgültigen Halteposition der Tram.
      this.tramHitbox = this.add.zone(595, 263, 250, 112)
        .setDepth(170)
        .setInteractive({ useHandCursor: true });

      this.tramHitbox.input.enabled = false;

      this.tramHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.boardTram();
      });

      this.arrivalTram = tram;
      this.tram = tram;
    }

    forceFinishBahnhofArrival() {
      if (
        this.arrivalFinished ||
        !this.sys.isActive() ||
        !this.player?.active
      ) {
        return;
      }

      // Kill only the objects involved in the arrival sequence; unrelated
      // world tweens (trees, signs, etc.) keep running.
      if (this.arrivalTram?.active) {
        this.tweens.killTweensOf(this.arrivalTram);
        this.arrivalTram.setX(470);
      }

      if (this.arrivalDoor?.active) {
        this.tweens.killTweensOf(this.arrivalDoor);
        this.arrivalDoor.setScale(0.08, 1);
        this.arrivalDoor.setAlpha(0.35);
      }

      this.tweens.killTweensOf(this.player);

      const exitX =
        (this.arrivalTram?.x || 470) + 156 + 118;

      this.player.setPosition(exitX, 250);
      this.player.setVelocity(0, 0);
      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.clearTint?.();
      this.player.setAlpha(1);
      this.player.setAngle(0);

      if (this.player.body) {
        this.player.body.enable = true;
        this.player.body.moves = true;
      }

      this.player.play("simon-idle", true);
      this.arrivalFinished = true;
      this.__tramSwitching = false;
      this.tramTransitActive = false;

      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.setUILocked(false);
      this.setControlsVisible(true);
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
      this.syncStreetStoreHitboxes();
      this.restoreDarkGandhiLootCorpseIfNeeded?.();
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
    }

    playArrivalAnimation() {
      if (
        this.arrivalFinished ||
        !this.arrivalTram?.active ||
        !this.player?.active ||
        !this.sys.isActive()
      ) {
        return;
      }

      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);

      // Die Tram rollt sichtbar in die Haltestelle ein.
      this.tweens.add({
        targets: this.arrivalTram,
        x: 470,
        duration: 820,
        ease: "Sine.easeOut",
        onComplete: () => {
          if (!this.sys.isActive()) return;

          if (!this.arrivalDoor?.active) {
            this.forceFinishBahnhofArrival();
            return;
          }

          // Tür fährt auf.
          this.tweens.add({
            targets: this.arrivalDoor,
            scaleX: 0.08,
            alpha: 0.35,
            duration: 270,
            ease: "Quad.easeOut",
            onComplete: () => {
              const exitX = this.arrivalTram.x + 156;

              this.player.setPosition(exitX, 250);
              this.player.setVisible(true);
              if (this.player.body) this.player.body.enable = true;
              this.player.play("simon-run", true);

              // Simon steigt aus und geht ein paar Schritte auf den Bahnsteig.
              this.tweens.add({
                targets: this.player,
                x: exitX + 118,
                duration: 620,
                ease: "Sine.easeOut",
                onComplete: () => {
                  this.player.setVelocity(0, 0);
                  this.player.setVisible(true);
                  this.player.setActive(true);

                  if (this.player.body) {
                    this.player.body.enable = true;
                    this.player.body.moves = true;
                  }

                  this.player.clearTint();
                  this.player.setAlpha(1);
                  this.player.setAngle(0);
                  this.player.play("simon-idle", true);
                  this.arrivalFinished = true;
                  this.__tramSwitching = false;

                  this.setUILocked(false);
                  this.setControlsVisible(true);
                  this.ensureTicketMachineInteractive();
                  this.ensureTramBoardingInteractive();
                  this.syncStreetStoreHitboxes();
                  this.restoreDarkGandhiLootCorpseIfNeeded?.();
                  this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
                  this.cameras.main.setDeadzone(240, 80);
                }
              });
            }
          });
        }
      });
    }
  }

  window.startSimonGame = function startSimonGame(options = {}) {
    pendingStartOptions = {
      startMode: options?.startMode || "normal",
      developerMode: Boolean(options?.developerMode)
    };

    if (game) {
      return game;
    }

    const parent = document.getElementById("phaser-game");
    if (!parent) {
      console.error("Phaser-Container #phaser-game wurde nicht gefunden.");
      return null;
    }

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-game",
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: "#7fc7dd",
      pixelArt: true,
      roundPixels: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
      },
      scene: [MilchbuckScene, BahnhofquaiScene]
    });

    return game;
  };
})();
