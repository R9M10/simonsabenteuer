(() => {
  "use strict";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;

  let game = null;

  class PrototypeScene extends Phaser.Scene {
    constructor() {
      super("PrototypeScene");

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
      this.cameras.main.setBackgroundColor("#10172a");

      this.createBackdrop();

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
        ).setOrigin(0.5);
        return;
      }

      this.createAnimations();
      this.createGround();
      this.createPlayer();
      this.createKeyboardControls();
      this.createTouchControls();
      this.createHelpText();
    }

    createBackdrop() {
      this.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x10172a
      );

      this.add.rectangle(
        GAME_WIDTH / 2,
        260,
        GAME_WIDTH,
        120,
        0x17233d
      ).setAlpha(0.9);

      const title = this.add.text(
        GAME_WIDTH / 2,
        42,
        "PROTOTYP – BEWEGUNG & SPRITES",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "12px",
          color: "#fff4d6"
        }
      );
      title.setOrigin(0.5);
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
      makeAnim("simon-victory", 32, 34, 6, 0);
    }

    createGround() {
      const ground = this.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 22,
        GAME_WIDTH,
        44,
        0x30394f
      );

      this.physics.add.existing(ground, true);
      this.ground = ground;
    }

    createPlayer() {
      this.player = this.physics.add.sprite(150, 210, "simon", 0);

      // Der Atlas hat bewusst ein großzügiges 240×280-Raster.
      // Der eigentliche Kollisionskörper liegt nur um Simons Torso/Beine.
      this.player.setScale(0.42);
      this.player.setCollideWorldBounds(true);
      this.player.body.setGravityY(900);
      this.player.body.setSize(92, 205);
      this.player.body.setOffset(74, 66);

      this.physics.add.collider(this.player, this.ground);

      this.player.play("simon-idle");
    }

    createKeyboardControls() {
      if (!this.input.keyboard) {
        this.cursors = { left: { isDown: false }, right: { isDown: false }, up: null };
        return;
      }

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    makeTouchButton(x, y, label, onDown, onUp = null) {
      const circle = this.add.circle(x, y, 30, 0xffffff, 0.12)
        .setStrokeStyle(2, 0xffffff, 0.28)
        .setScrollFactor(0)
        .setDepth(20)
        .setInteractive({ useHandCursor: false });

      const text = this.add.text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "13px",
        color: "#ffffff"
      })
        .setOrigin(0.5)
        .setAlpha(0.7)
        .setScrollFactor(0)
        .setDepth(21);

      circle.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        circle.setAlpha(1);
        onDown();
      });

      const release = () => {
        circle.setAlpha(0.12);
        if (onUp) onUp();
      };

      circle.on("pointerup", release);
      circle.on("pointerout", release);

      return { circle, text };
    }

    createTouchControls() {
      this.makeTouchButton(
        62,
        GAME_HEIGHT - 66,
        "←",
        () => { this.touchLeft = true; },
        () => { this.touchLeft = false; }
      );

      this.makeTouchButton(
        132,
        GAME_HEIGHT - 66,
        "→",
        () => { this.touchRight = true; },
        () => { this.touchRight = false; }
      );

      this.makeTouchButton(
        GAME_WIDTH - 132,
        GAME_HEIGHT - 66,
        "J",
        () => { this.touchJumpRequested = true; }
      );

      this.makeTouchButton(
        GAME_WIDTH - 62,
        GAME_HEIGHT - 66,
        "X",
        () => { this.touchShootRequested = true; }
      );
    }

    createHelpText() {
      const help = this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 14,
        "A/D oder ←/→ · W/SPACE = Sprung · X = Schussanimation",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#aeb7cc"
        }
      );
      help.setOrigin(0.5, 1);
      help.setDepth(30);
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

      this.player.setVelocityX(moveDirection * 220);

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
        if (this.player.anims.currentAnim?.key !== "simon-jump" ||
            !this.player.anims.isPlaying) {
          // Hält die Luftbewegung optisch lebendig, ohne eine zweite Fall-Animation.
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
      backgroundColor: "#10172a",
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
      scene: [PrototypeScene]
    });

    return game;
  };
})();
