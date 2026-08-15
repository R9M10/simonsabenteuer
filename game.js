(() => {
  "use strict";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const WORLD_WIDTH = 3000;
  const GROUND_TOP = 338;

  let game = null;

  class MilchbuckScene extends Phaser.Scene {
    constructor() {
      super("MilchbuckScene");

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

      this.ticketHitbox = null;

      this.itemsButton = null;
      this.itemsModal = null;
      this.itemsTicketBadge = null;
      this.hotbarContainer = null;
      this.hotbarTicketIcon = null;

      this.lootModal = null;
      this.bouncerTipStolen = false;

      this.lionChoiceModal = null;
      this.lionQuestionBubble = null;
      this.lionChoiceShown = false;
      this.lionExitActive = false;
      this.lionCombatActive = false;
      this.nextLionHitAt = 0;

      this.danceOverlay = null;
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
      const tram = this.add.graphics().setDepth(1);
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
        this.coinText.setText(String(this.coins));
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

      for (let i = 0; i < slotCount; i += 1) {
        const x = startX + i * (slotSize + gap);
        bar.fillStyle(i === 0 ? 0x3b3b35 : 0x292b2d, 0.94);
        bar.fillRect(x, -19, slotSize, slotSize);
        bar.lineStyle(i === 0 ? 3 : 2, i === 0 ? 0xf3e3a5 : 0x858585, 0.9);
        bar.strokeRect(x, -19, slotSize, slotSize);
      }

      this.hotbarContainer.add(bar);

      this.hotbarTicketIcon = this.createTicketIcon(startX + slotSize / 2, 0, 0.8)
        .setVisible(false);
      this.hotbarContainer.add(this.hotbarTicketIcon);
    }

    updateInventoryUI() {
      const hasTicket = Boolean(this.hasCityTicket);

      this.itemsTicketBadge?.setVisible(hasTicket);
      this.hotbarTicketIcon?.setVisible(hasTicket);
    }

    equipTicketToHotbar() {
      if (!this.hasCityTicket) return;
      this.hotbarTicketIcon?.setVisible(true);
    }

    openItemsModal() {
      if (this.itemsModal || this.ticketModal || this.lootModal || this.lionChoiceModal) {
        return;
      }
      if (this.playerDying || this.danceOverlay) return;

      this.setUILocked(true);

      const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(420);

      const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060b, 0.72)
        .setInteractive();

      const panel = this.add.graphics();
      panel.fillStyle(0x20252b, 1);
      panel.fillRoundedRect(-235, -125, 470, 250, 16);
      panel.lineStyle(4, 0xd7c892, 1);
      panel.strokeRoundedRect(-235, -125, 470, 250, 16);

      const title = this.add.text(-195, -94, "ITEMS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "15px",
        color: "#fff0bd"
      });

      const back = this.add.text(193, -94, "X", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "13px",
        color: "#fff0bd",
        backgroundColor: "#443a30",
        padding: { x: 9, y: 7 }
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      back.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.closeItemsModal();
      });

      const slotXs = [-150, -75, 0, 75, 150];
      const slots = slotXs.map((x) => {
        const slot = this.add.graphics();
        slot.fillStyle(0x111418, 1);
        slot.fillRect(x - 25, -45, 50, 50);
        slot.lineStyle(2, 0x7d8387, 1);
        slot.strokeRect(x - 25, -45, 50, 50);
        return slot;
      });

      const hint = this.add.text(0, 77, this.hasCityTicket
        ? "TICKET IST IN DER HOTBAR"
        : "NOCH KEINE ITEMS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#aeb7b7"
      }).setOrigin(0.5);

      modal.add([shade, panel, title, back, ...slots, hint]);

      if (this.hasCityTicket) {
        const ticket = this.createTicketIcon(-150, -20, 1.05)
          .setInteractive(new Phaser.Geom.Rectangle(-18, -13, 36, 26), Phaser.Geom.Rectangle.Contains);

        ticket.on("pointerdown", (pointer) => {
          pointer.event?.preventDefault?.();
          pointer.event?.stopPropagation?.();
          this.equipTicketToHotbar();

          const pulse = this.add.text(-150, 18, "AUSGERÜSTET", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            color: "#ffe399"
          }).setOrigin(0.5);
          modal.add(pulse);
          this.tweens.add({
            targets: pulse,
            alpha: 0,
            y: 8,
            duration: 650,
            onComplete: () => pulse.destroy()
          });
        });

        const label = this.add.text(-150, 23, "TICKET", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#f0e1b8"
        }).setOrigin(0.5);

        modal.add([ticket, label]);
      }

      this.itemsModal = modal;
    }

    closeItemsModal() {
      if (!this.itemsModal) return;
      this.itemsModal.destroy(true);
      this.itemsModal = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
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

      const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(440);

      const shade = this.add.rectangle(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x05060b,
        0.78
      ).setInteractive();

      const panel = this.add.graphics();
      panel.fillStyle(0xf2e5bf, 1);
      panel.fillRoundedRect(-265, -135, 530, 270, 18);
      panel.lineStyle(5, 0x253a4b, 1);
      panel.strokeRoundedRect(-265, -135, 530, 270, 18);
      panel.lineStyle(3, 0x6b95aa, 0.9);
      panel.strokeRoundedRect(-251, -121, 502, 242, 13);

      const backHitbox = this.add.zone(-188, -100, 185, 48)
        .setInteractive({ useHandCursor: true });

      const back = this.add.text(-228, -103, "← ZURÜCK", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#23485d",
        backgroundColor: "#d5e7e6",
        padding: { x: 12, y: 10 }
      });

      const closeFromBack = (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.closeTicketModal();
      };

      backHitbox.on("pointerdown", closeFromBack);
      back.setInteractive({ useHandCursor: true });
      back.on("pointerdown", closeFromBack);

      const title = this.add.text(0, -72, "TICKETAUTOMAT", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#253a4b"
      }).setOrigin(0.5);

      const ticketLine = this.add.text(0, -18, "1 TICKET IN DIE STADT", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "11px",
        color: "#2d2a25"
      }).setOrigin(0.5);

      const price = this.add.text(0, 13, "10.-", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "18px",
        color: "#2d2a25"
      }).setOrigin(0.5);

      const buyColor = this.coins >= 10 ? "#215f3f" : "#73706a";
      const buyBg = this.coins >= 10 ? "#bfe0c6" : "#cbc5b8";

      const buy = this.add.text(0, 59, "KAUFEN", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: buyColor,
        backgroundColor: buyBg,
        padding: { x: 22, y: 12 }
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      buy.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        this.tryBuyTicket();
      });

      this.ticketStatusText = this.add.text(
        0,
        105,
        this.coins < 10 ? "0 COINS · DU HÄSCH NO Z'WENIG" : `${this.coins} COINS`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: this.coins < 10 ? "#8b3a36" : "#315d43"
        }
      ).setOrigin(0.5);

      modal.add([
        shade,
        panel,
        backHitbox,
        back,
        title,
        ticketLine,
        price,
        buy,
        this.ticketStatusText
      ]);

      this.ticketModal = modal;
    }

    tryBuyTicket() {
      if (!this.ticketModal) return;

      if (this.hasCityTicket) {
        this.ticketStatusText?.setText("TICKET BEREITS GEKAUFT");
        return;
      }

      if (this.coins < 10) {
        this.ticketStatusText
          ?.setColor("#8b3a36")
          .setText("NÖD GNUeG COINS!");
        return;
      }

      this.coins -= 10;
      this.hasCityTicket = true;
      this.updateCoinHUD();
      this.updateInventoryUI();
      this.equipTicketToHotbar();

      this.ticketStatusText
        ?.setColor("#315d43")
        .setText("TICKET GEKAUFT!");
    }

    closeTicketModal() {
      if (!this.ticketModal) return;

      this.ticketModal.destroy(true);
      this.ticketModal = null;
      this.ticketStatusText = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
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

      const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(430);

      const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060b, 0.68)
        .setInteractive();

      const panel = this.add.graphics();
      panel.fillStyle(0xffedc0, 1);
      panel.fillRoundedRect(-260, -100, 520, 200, 17);
      panel.lineStyle(4, 0x5a402a, 1);
      panel.strokeRoundedRect(-260, -100, 520, 200, 17);

      const question = this.add.text(
        0,
        -42,
        this.bouncerTipStolen
          ? "Da isch nüt meh z hole."
          : "Das Trinkgeld der Türsteher klauen?",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "10px",
          color: "#302319",
          align: "center",
          wordWrap: { width: 450 }
        }
      ).setOrigin(0.5);

      const no = this.add.text(this.bouncerTipStolen ? 0 : 78, 40, this.bouncerTipStolen ? "ZURÜCK" : "NEIN", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#382b21",
        backgroundColor: "#d5c6a6",
        padding: { x: 18, y: 12 }
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      no.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.closeLootModal();
      });

      const children = [shade, panel, question, no];

      if (!this.bouncerTipStolen) {
        const yes = this.add.text(-78, 40, "JA", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "10px",
          color: "#245135",
          backgroundColor: "#b8d7b5",
          padding: { x: 22, y: 12 }
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        yes.on("pointerdown", (pointer) => {
          pointer.event?.preventDefault?.();
          pointer.event?.stopPropagation?.();
          this.stealBouncerTips();
        });

        children.push(yes);
      }

      modal.add(children);
      this.lootModal = modal;
    }

    stealBouncerTips() {
      if (this.bouncerTipStolen) return;

      this.bouncerTipStolen = true;
      this.coins += 100;
      this.updateCoinHUD();
      this.animateCoinGain(100);

      if (this.lootModal) {
        const success = this.add.text(0, 78, "+100 COINS", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#856015",
          stroke: "#fff0b8",
          strokeThickness: 3
        }).setOrigin(0.5);
        this.lootModal.add(success);
      }

      this.time.delayedCall(850, () => this.closeLootModal());
    }

    closeLootModal() {
      if (!this.lootModal) return;
      this.lootModal.destroy(true);
      this.lootModal = null;
      this.refreshUILock();
      this.ensureTicketMachineInteractive();
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
        if (typeof this.lionChoiceModal.destroy === "function") {
          this.lionChoiceModal.destroy(true);
        } else if (typeof this.lionChoiceModal.remove === "function") {
          this.lionChoiceModal.remove();
        }

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

      /*
       * WICHTIG:
       * Die Antwortbuttons liegen ab hier NICHT mehr als Phaser-Objekte
       * im Canvas. Auf iPhone/Safari gab es mit verschachtelten Phaser-
       * Containern und Touch-Events reproduzierbare Probleme, bei denen
       * die Buttons sichtbar reagierten, der Callback aber nicht sauber
       * ausgelöst wurde.
       *
       * Deshalb verwenden wir hier echte HTML-Buttons direkt über dem
       * Phaser-Canvas. Damit laufen Touch und Click über Safari selbst.
       */
      const parent = document.getElementById("phaser-game");
      if (!parent) return;

      parent.querySelectorAll("[data-lion-choice='true']").forEach((node) => node.remove());

      const overlay = document.createElement("div");
      overlay.dataset.lionChoice = "true";
      overlay.setAttribute("aria-label", "Antwort auswählen");
      overlay.style.position = "absolute";
      overlay.style.left = "50%";
      overlay.style.bottom = "16px";
      overlay.style.transform = "translateX(-50%)";
      overlay.style.width = "min(92%, 520px)";
      overlay.style.padding = "9px";
      overlay.style.display = "grid";
      overlay.style.gridTemplateColumns = "1fr 1fr 1.18fr";
      overlay.style.gap = "7px";
      overlay.style.background = "rgba(18, 21, 29, 0.95)";
      overlay.style.border = "3px solid rgba(255, 230, 168, 0.9)";
      overlay.style.boxShadow = "0 4px 0 rgba(60, 42, 28, 0.8)";
      overlay.style.zIndex = "99999";
      overlay.style.pointerEvents = "auto";
      overlay.style.touchAction = "manipulation";
      overlay.style.boxSizing = "border-box";

      const makeButton = (label, textColor, callback) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;

        button.style.minWidth = "0";
        button.style.width = "100%";
        button.style.height = "44px";
        button.style.padding = "0 5px";
        button.style.border = "2px solid rgba(255, 230, 168, 0.65)";
        button.style.borderRadius = "4px";
        button.style.background = "#302d34";
        button.style.color = textColor;
        button.style.fontFamily = '"Press Start 2P", monospace';
        button.style.fontSize = label === "KÄMPFEN"
          ? "clamp(7px, 1.45vw, 9px)"
          : "clamp(8px, 1.65vw, 10px)";
        button.style.lineHeight = "1";
        button.style.textAlign = "center";
        button.style.whiteSpace = "nowrap";
        button.style.overflow = "hidden";
        button.style.boxSizing = "border-box";
        button.style.touchAction = "manipulation";
        button.style.webkitTapHighlightColor = "transparent";
        button.style.cursor = "pointer";

        let fired = false;

        const activate = (event) => {
          if (fired || !this.lionChoiceModal) return;
          fired = true;

          event?.preventDefault?.();
          event?.stopPropagation?.();

          // Sofort visuelles Feedback und danach die eigentliche Aktion.
          button.style.background = "#5a5360";
          button.style.transform = "translateY(2px)";

          window.setTimeout(() => {
            callback();
          }, 25);
        };

        // touchend ist für iPhone im Home-Screen-Modus die wichtigste Route.
        button.addEventListener("touchend", activate, { passive: false });

        // pointerup deckt moderne Safari-Versionen sowie Desktop ab.
        button.addEventListener("pointerup", activate, { passive: false });

        // click bleibt als robuste Fallback-Route bestehen.
        button.addEventListener("click", activate, { passive: false });

        button.addEventListener("touchstart", (event) => {
          event.stopPropagation();
          button.style.background = "#48424d";
        }, { passive: true });

        button.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
          button.style.background = "#48424d";
        });

        return button;
      };

      const yes = makeButton(
        "JA",
        "#bff3bd",
        () => this.chooseDanceWithLion()
      );

      const no = makeButton(
        "NEIN",
        "#f3ddbd",
        () => this.chooseNoDance()
      );

      const fight = makeButton(
        "KÄMPFEN",
        "#ffaaa6",
        () => this.startLionCombat()
      );

      overlay.append(yes, no, fight);

      // Verhindert, dass der darunterliegende Phaser-Canvas den Tap
      // gleichzeitig als Spielinput verarbeitet.
      ["touchstart", "touchend", "pointerdown", "pointerup", "click"].forEach((type) => {
        overlay.addEventListener(type, (event) => {
          event.stopPropagation();
        }, { passive: type === "touchstart" });
      });

      parent.appendChild(overlay);
      this.lionChoiceModal = overlay;
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

      overlay.add([bg, lights, disco, hive, caption]);

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
      this.refreshUILock();
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

      this.player.setTint(0xff6767);
      this.time.delayedCall(170, () => {
        if (!this.playerDying) this.player.clearTint();
      });

      if (this.hp <= 0) {
        this.killSimonAndRestart();
      }
    }

    killSimonAndRestart() {
      if (this.playerDying) return;

      this.playerDying = true;
      this.lionCombatActive = false;
      this.setUILocked(true);
      this.player.setVelocity(0, 0);
      this.player.clearTint();
      this.player.play("simon-death", true);

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
      makeAnim("simon-death", 26, 31, 8, 0);
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

      if (this.uiLocked) {
        this.player.setVelocityX(0);
        if (onGround && this.player.anims.currentAnim?.key !== "simon-idle") {
          this.player.play("simon-idle", true);
        }
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

  window.startSimonGame = function startSimonGame() {
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
      scene: [MilchbuckScene]
    });

    return game;
  };
})();
