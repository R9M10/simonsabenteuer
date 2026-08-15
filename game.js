(() => {
  "use strict";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const WORLD_WIDTH = 3000;
  const GROUND_TOP = 338;

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

      this.itemsButton = null;
      this.itemsModal = null;
      this.itemsTicketBadge = null;
      this.itemInfoModal = null;

      this.inventory = {
        gatorade: 0,
        monster: 0
      };

      this.hotbarContainer = null;
      this.hotbarSlotCenters = [];
      this.hotbarItems = [null, null, null, null, null, null];
      this.hotbarDynamicObjects = [];

      this.drinkingItem = false;

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
      this.startMode = pendingStartOptions?.startMode || "normal";
      this.developerMode = Boolean(pendingStartOptions?.developerMode) ||
        this.startMode !== "normal";

      if (this.developerMode) {
        this.coins = 999999;
      }

      const domRoot = document.getElementById("phaser-game");
      domRoot?.querySelectorAll("[data-simon-ui]").forEach((node) => node.remove());

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
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

      // Developer-Startziele werden erst NACH der normalen Szeneninitialisierung
      // angewandt. So bleiben Sprites, Animationen, HUD und Touch-Steuerung
      // exakt dieselben wie im normalen Spiel.
      if (this.startMode === "hb") {
        this.scene.start("BahnhofquaiScene", {
          coins: 999999,
          hp: this.maxHp,
          hasCityTicket: true,
          fromDeveloperMode: true,
          developerMode: true,
          inventory: { ...this.inventory },
          hotbarItems: ["ticket", null, null, null, null, null]
        });
        return;
      }

      if (this.startMode === "lion-choice") {
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

      // Coins oben links.
      const coin = this.add.graphics();
      coin.fillStyle(0xe2aa28, 1);
      coin.fillCircle(20, 19, 12);
      coin.fillStyle(0xffdf65, 1);
      coin.fillCircle(20, 19, 8);
      coin.fillStyle(0xa66c15, 1);
      coin.fillRect(18, 13, 4, 12);
      coin.lineStyle(2, 0xfff0a0, 0.85);
      coin.strokeCircle(20, 19, 11);

      this.coinText = this.add.text(40, 19, "0", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#fff4cf",
        stroke: "#2a1b0b",
        strokeThickness: 4
      }).setOrigin(0, 0.5);

      // HP-Leiste ohne Zahlen.
      const heart = this.add.graphics();
      heart.fillStyle(0xb93642, 1);
      heart.fillRect(83, 14, 10, 10);
      heart.fillRect(92, 14, 10, 10);
      heart.fillTriangle(83, 23, 102, 23, 92, 32);
      heart.fillStyle(0xf16b72, 1);
      heart.fillRect(85, 15, 5, 4);

      const hpFrame = this.add.graphics();
      hpFrame.fillStyle(0x15171c, 0.9);
      hpFrame.fillRoundedRect(108, 12, 104, 16, 5);
      hpFrame.lineStyle(2, 0xffe3d1, 0.8);
      hpFrame.strokeRoundedRect(108, 12, 104, 16, 5);

      this.hpBarFill = this.add.rectangle(112, 20, 96, 10, 0xd84e57)
        .setOrigin(0, 0.5);

      hud.add([coin, this.coinText, heart, hpFrame, this.hpBarFill]);

      // ITEMS-Menü oben rechts.
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

      this.itemsTicketBadge = this.add.text(GAME_WIDTH - 14, 38, "TICKET", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#2b2115",
        backgroundColor: "#ffe3a2",
        padding: { x: 4, y: 3 }
      })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(305)
        .setVisible(false);

      this.createHotbar();
      this.updateHpBar();
      this.updateInventoryUI();
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
        ticket: {
          name: "Ticket",
          description: "Erlaubt Simon, die Tram zu benutzen. Das Ticket wird nicht verbraucht."
        },
        gatorade: {
          name: "Gatorade",
          price: 10,
          heal: 10,
          description: "Giftgrünes Gatorade. Regeneriert 10 Leben und wird danach verbraucht."
        },
        monster: {
          name: "Monster Energy",
          price: 30,
          heal: 30,
          description: "Orange Dose Monster Energy. Regeneriert 30 Leben und wird danach verbraucht."
        }
      };

      return definitions[key] || null;
    }

    getItemCount(key) {
      if (key === "ticket") return this.hasCityTicket ? 1 : 0;
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

      return outer;
    }

    createHotbar() {
      this.hotbarContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 25)
        .setScrollFactor(0)
        .setDepth(290);

      const bar = this.add.graphics();
      const slotCount = 6;
      const slotSize = 38;
      const gap = 3;
      const totalWidth = slotCount * slotSize + (slotCount - 1) * gap;
      const startX = -totalWidth / 2;

      bar.fillStyle(0x15171a, 0.78);
      bar.fillRoundedRect(startX - 6, -24, totalWidth + 12, 48, 5);

      this.hotbarSlotCenters = [];

      for (let i = 0; i < slotCount; i += 1) {
        const left = startX + i * (slotSize + gap);
        const center = left + slotSize / 2;
        this.hotbarSlotCenters.push(center);

        bar.fillStyle(i === 0 ? 0x3b3b35 : 0x292b2d, 0.94);
        bar.fillRect(left, -19, slotSize, slotSize);
        bar.lineStyle(i === 0 ? 3 : 2, i === 0 ? 0xf3e3a5 : 0x858585, 0.9);
        bar.strokeRect(left, -19, slotSize, slotSize);
      }

      this.hotbarContainer.add(bar);
      this.refreshHotbar();
    }

    refreshHotbar() {
      if (!this.hotbarContainer) return;

      this.hotbarDynamicObjects.forEach((object) => {
        object?.destroy?.(true);
      });
      this.hotbarDynamicObjects = [];

      this.hotbarItems = Array.isArray(this.hotbarItems)
        ? this.hotbarItems.slice(0, 6)
        : [];

      while (this.hotbarItems.length < 6) {
        this.hotbarItems.push(null);
      }

      // Nicht mehr vorhandene Verbrauchsitems verschwinden aus der Hotbar.
      this.hotbarItems = this.hotbarItems.map((key) => {
        if (!key) return null;
        if (key === "ticket") return this.hasCityTicket ? key : null;
        return this.getItemCount(key) > 0 ? key : null;
      });

      this.hotbarItems.forEach((key, index) => {
        if (!key) return;

        const x = this.hotbarSlotCenters[index] ?? 0;
        const icon = this.createWorldItemIcon(key, x, 0, key === "ticket" ? 0.72 : 0.72);
        this.hotbarContainer.add(icon);
        this.hotbarDynamicObjects.push(icon);

        const count = this.getItemCount(key);
        if (key !== "ticket" && count > 1) {
          const qty = this.add.text(x + 11, 12, String(count), {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "6px",
            color: "#ffffff",
            stroke: "#171717",
            strokeThickness: 3
          })
            .setOrigin(0.5)
            .setDepth(320);

          this.hotbarContainer.add(qty);
          this.hotbarDynamicObjects.push(qty);
        }

        const zone = this.add.zone(x, 0, 36, 36)
          .setInteractive({ useHandCursor: key !== "ticket" });

        if (key !== "ticket") {
          zone.on("pointerup", (pointer) => {
            pointer.event?.preventDefault?.();
            pointer.event?.stopPropagation?.();
            this.consumeHotbarItem(index);
          });
        }

        this.hotbarContainer.add(zone);
        this.hotbarDynamicObjects.push(zone);
      });
    }

    updateInventoryUI() {
      this.itemsTicketBadge?.setVisible(Boolean(this.hasCityTicket));

      if (this.hasCityTicket) {
        this.equipTicketToHotbar();
      }

      this.refreshHotbar();
    }

    equipTicketToHotbar() {
      if (!this.hasCityTicket) return;

      const currentIndex = this.hotbarItems.indexOf("ticket");
      if (currentIndex === 0) {
        this.refreshHotbar();
        return;
      }

      if (currentIndex > 0) {
        this.hotbarItems[currentIndex] = this.hotbarItems[0] || null;
      } else if (this.hotbarItems[0] && this.hotbarItems[0] !== "ticket") {
        const free = this.hotbarItems.findIndex((item, index) => index > 0 && !item);
        if (free > 0) this.hotbarItems[free] = this.hotbarItems[0];
      }

      this.hotbarItems[0] = "ticket";
      this.refreshHotbar();
    }

    equipItemToHotbar(key) {
      if (!["gatorade", "monster"].includes(key)) return;
      if (this.getItemCount(key) <= 0) return;

      const existing = this.hotbarItems.indexOf(key);
      if (existing >= 0) {
        this.refreshHotbar();
        return;
      }

      const startIndex = this.hasCityTicket ? 1 : 0;
      let free = -1;

      for (let i = startIndex; i < this.hotbarItems.length; i += 1) {
        if (!this.hotbarItems[i]) {
          free = i;
          break;
        }
      }

      if (free < 0) {
        // Falls alle Slots voll sind, wird der letzte Verbrauchs-Slot ersetzt.
        free = this.hotbarItems.length - 1;
      }

      this.hotbarItems[free] = key;
      this.refreshHotbar();
    }

    removeItemFromHotbar(key) {
      this.hotbarItems = this.hotbarItems.map((item) => item === key ? null : item);
      this.refreshHotbar();
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
      if (!["gatorade", "monster"].includes(key)) return;
      if (this.getItemCount(key) <= 0) return;

      this.playDrinkAnimation(key);
    }

    playDrinkAnimation(key) {
      const item = this.getItemDefinition(key);
      if (!item || this.getItemCount(key) <= 0) return;

      this.drinkingItem = true;
      this.refreshUILock();

      this.player.setVelocity(0, 0);
      this.player.anims.stop();

      const direction = this.facing < 0 ? -1 : 1;
      const startX = this.player.x + direction * 28;
      const startY = this.player.y - 52;
      const icon = this.createWorldItemIcon(key, startX, startY, 0.85)
        .setDepth(55);

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
                .setDepth(70);

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
        itemKey === "ticket" ? "1x" : `${count}x`,
        {
          fontSize: "6px",
          color: "#aeb7b7"
        }
      );

      const equip = this.createDOMButton("AUSRÜSTEN", () => {
        if (itemKey === "ticket") {
          this.equipTicketToHotbar();
        } else {
          this.equipItemToHotbar(itemKey);
        }

        const hint = this.itemsModal?.panel?.querySelector("[data-items-hint]");
        if (hint) hint.textContent = `${item.name.toUpperCase()} AUSGERÜSTET`;
      }, {
        color: "#e9f1e8",
        background: "#324438",
        border: "#6d8c73",
        minHeight: "34px",
        fontSize: "5.5px",
        padding: "5px 4px"
      });

      card.append(header, icon, qty, equip);
      return card;
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

      if (this.playerDying || this.danceOverlay || this.indianStoreOverlay) return;

      this.setUILocked(true);

      const modal = this.createDOMModal({
        key: "items",
        width: "min(92%, 540px)",
        background: "#20252b",
        border: "#d7c892",
        shade: "rgba(5, 6, 11, 0.72)",
        padding: "15px"
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
        marginBottom: "12px"
      });

      const title = this.createDOMText("ITEMS", {
        fontSize: "15px",
        color: "#fff0bd"
      });
      title.style.textAlign = "left";

      const close = this.createDOMButton("X", () => this.closeItemsModal(), {
        color: "#fff0bd",
        background: "#443a30",
        border: "#8c795e",
        width: "48px",
        minHeight: "40px",
        padding: "6px",
        fontSize: "12px"
      });

      top.append(title, close);

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "8px",
        width: "100%",
        margin: "0 0 12px"
      });

      ["ticket", "gatorade", "monster"].forEach((itemKey) => {
        const card = this.createInventoryCard(itemKey);
        if (card) grid.appendChild(card);
      });

      const empty = grid.childElementCount === 0;

      const hint = this.createDOMText(
        empty ? "NOCH KEINE ITEMS" : "ITEM ANTIPpen → AUSRÜSTEN",
        {
          fontSize: "6px",
          color: "#aeb7b7",
          margin: "2px 0 0"
        }
      );
      hint.dataset.itemsHint = "true";

      modal.panel.append(top, grid, hint);
      this.refreshUILock();
    }

    closeItemsModal() {
      if (!this.itemsModal) return;

      this.destroyDOMModal(this.itemsModal);
      this.itemsModal = null;
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
        this.itemInfoModal ||
        this.drinkingItem ||
        this.playerDying
      );

      this.setUILocked(locked);
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

    boardTram() {
      if (
        !this.hasCityTicket ||
        !this.tramBoardingEnabled ||
        this.tramTransitActive ||
        this.uiLocked ||
        this.playerDying ||
        !this.tram
      ) {
        return;
      }

      this.tramTransitActive = true;
      this.tramBoardingEnabled = false;

      if (this.tramHitbox?.input) {
        this.tramHitbox.input.enabled = false;
      }

      this.tramBoardingMarker?.setVisible(false);

      this.setUILocked(true);
      this.player.setVelocity(0, 0);

      // Simon geht kurz zur Tram und verschwindet dann sichtbar "im" Fahrzeug.
      this.cameras.main.stopFollow();
      this.cameras.main.pan(410, GAME_HEIGHT / 2, 360, "Sine.easeInOut");

      this.tweens.add({
        targets: this.player,
        x: 137,
        y: 250,
        duration: 430,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.player.setVisible(false);
          if (this.player.body) this.player.body.enable = false;

          // Die Tram fährt einige Meter nach rechts.
          this.tweens.add({
            targets: this.tram,
            x: 520,
            duration: 2350,
            ease: "Sine.easeIn",
            onUpdate: () => {
              // leichter Fahrt-Eindruck
              this.tram.y = Math.sin(this.time.now / 72) * 1.2;
            }
          });

          // Nach einem kurzen sichtbaren Stück Fahrt blendet die Szene aus.
          this.time.delayedCall(1150, () => {
            this.cameras.main.once(
              Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
              () => this.scene.start("BahnhofquaiScene", {
                coins: this.developerMode ? 999999 : this.coins,
                hp: this.hp,
                hasCityTicket: this.hasCityTicket,
                fromDeveloperMode: this.developerMode,
                developerMode: this.developerMode,
                inventory: { ...this.inventory },
                hotbarItems: [...this.hotbarItems]
              })
            );

            this.cameras.main.fadeOut(850, 0, 0, 0);
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
      this.setControlsVisible(!locked);

      if (locked && this.player?.body) {
        this.player.setVelocityX(0);
      }
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

      const line = this.createDOMText("1 TICKET IN DIE STADT", {
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
                : (this.coins < 10 ? `${this.coins} COINS · DU HÄSCH NO Z'WENIG` : `${this.coins} COINS`)
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
          this.ticketStatusText.textContent = "NÖD GNUEG COINS!";
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
      this.equipTicketToHotbar();
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
          ? "Da isch nüt meh z hole."
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

      const gameOver = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, "SIMON ISCH K.O.", {
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
        .setDepth(50)
        .setInteractive({ useHandCursor: false });

      const text = this.add.text(x, y - 1, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#fff5d6"
      })
        .setOrigin(0.5)
        .setAlpha(0.92)
        .setScrollFactor(0)
        .setDepth(51);

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

      if (this.playerDying) {
        this.player.setVelocityX(0);
        return;
      }

      if (this.uiLocked) {
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

      const speed = 175;
      this.player.setVelocityX(moveDirection * speed);

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
    }

    init(data = {}) {
      this.arrivalData = data;
      this.developerMode = Boolean(data.developerMode || data.fromDeveloperMode);
      this.coins = this.developerMode
        ? 999999
        : (Number.isFinite(data.coins) ? data.coins : 0);

      this.hp = Number.isFinite(data.hp) ? data.hp : this.maxHp;
      this.hasCityTicket = data.hasCityTicket !== false;

      this.inventory = {
        gatorade: Math.max(0, Number(data.inventory?.gatorade) || 0),
        monster: Math.max(0, Number(data.inventory?.monster) || 0)
      };

      this.hotbarItems = Array.isArray(data.hotbarItems)
        ? data.hotbarItems.slice(0, 6)
        : [this.hasCityTicket ? "ticket" : null, null, null, null, null, null];

      while (this.hotbarItems.length < 6) {
        this.hotbarItems.push(null);
      }
    }

    create() {
      this.input.addPointer(3);

      const domRoot = document.getElementById("phaser-game");
      domRoot?.querySelectorAll("[data-simon-ui]").forEach((node) => node.remove());

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
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
      this.updateCoinHUD();
      this.updateHpBar();
      this.updateInventoryUI();

      this.player.setPosition(650, 246);
      this.player.setVisible(false);
      this.player.setVelocity(0, 0);
      if (this.player.body) this.player.body.enable = false;

      this.setUILocked(true);

      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(300, 0);
      this.cameras.main.fadeIn(650, 0, 0, 0);

      this.time.delayedCall(320, () => this.playArrivalAnimation());
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
      this.createIndianStoreExterior();

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
      this.indianStoreHitbox = this.add.zone(x + w / 2, y + h / 2, w + 18, h + 18)
        .setDepth(180)
        .setInteractive({ useHandCursor: true });

      this.indianStoreHitbox.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openIndianStorePrompt();
      });
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
        this.itemInfoModal ||
        this.drinkingItem
      );

      this.setUILocked(locked);
    }

    openIndianStorePrompt() {
      if (
        !this.arrivalFinished ||
        this.playerDying ||
        this.storeEntryModal ||
        this.indianStoreOverlay ||
        this.shopModal
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
        `+${item.heal} HP`,
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
      if (!item || !["gatorade", "monster"].includes(itemKey)) return;

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
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
        maxWidth: "430px",
        margin: "0 auto 10px"
      });

      ["gatorade", "monster"].forEach((itemKey) => {
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

      this.arrivalTram = tram;
    }

    playArrivalAnimation() {
      if (this.arrivalFinished || !this.arrivalTram) return;

      // Die Tram rollt sichtbar in die Haltestelle ein.
      this.tweens.add({
        targets: this.arrivalTram,
        x: 470,
        duration: 820,
        ease: "Sine.easeOut",
        onComplete: () => {
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
                  this.player.play("simon-idle", true);
                  this.arrivalFinished = true;

                  this.setUILocked(false);
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
