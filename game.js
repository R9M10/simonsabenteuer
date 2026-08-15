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

      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
      this.cameras.main.roundPixels = true;
    }

    createWorld() {
      this.createSky();
      this.createDistantHills();
      this.createCityBackground();
      this.createMilchbuckStation();
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

      // Straßenschild in der Stadt als subtiler Zürich-Hinweis.
      this.add.text(1515, 250, "ZÜRICH", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#f2f4ef",
        backgroundColor: "#24588b",
        padding: { x: 7, y: 5 }
      })
        .setDepth(-1);
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

      // Kleine Bahnhofsuhr.
      g.fillStyle(0xf1efe4, 1);
      g.fillCircle(670, 181, 17);
      g.lineStyle(3, 0x2c3337, 1);
      g.strokeCircle(670, 181, 17);
      g.lineBetween(670, 181, 670, 169);
      g.lineBetween(670, 181, 679, 185);

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

    update(time) {
      if (!this.player?.body) return;

      const body = this.player.body;
      const onGround = body.blocked.down || body.touching.down;

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
