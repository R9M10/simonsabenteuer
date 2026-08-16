(() => {
  "use strict";

  if (window.__SIMON_PALAZZO_MEDICI_V48__) return;
  window.__SIMON_PALAZZO_MEDICI_V48__ = true;

  const BaseScene = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene;
  if (!BaseScene) {
    console.warn("Palazzo Medici konnte nicht geladen werden: Basisszene fehlt.");
    return;
  }

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const INTERIOR_WIDTH = 1800;
  const GROUND_TOP = 338;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getVenice(game) {
    try {
      return game?.scene?.getScene?.("VeniceScene") || null;
    } catch {
      return null;
    }
  }

  function drawMediciBalls(scene, x, y, scale = 1, depth = 12) {
    const group = scene.add.container(x, y).setDepth(depth);
    const positions = [
      [0, -17],
      [-17, -5],
      [17, -5],
      [-11, 13],
      [11, 13],
      [0, 31]
    ];

    positions.forEach(([px, py], index) => {
      const ball = scene.add.circle(
        px * scale,
        py * scale,
        (index === 0 ? 7.5 : 7) * scale,
        index === 0 ? 0x315b99 : 0xb82632,
        1
      )
        .setStrokeStyle(2 * scale, 0xe7d5a5, 1);
      group.add(ball);
    });

    return group;
  }

  function createPalazzoFacade(scene) {
    if (!scene?.add || scene.__palazzoMediciFacadeV48?.active) return;

    const left = 1260;
    const top = 54;
    const width = 650;
    const bottom = GROUND_TOP;
    const height = bottom - top;
    const center = left + width / 2;
    const doorX = center;

    const facade = scene.add.container(0, 0).setDepth(5);
    const g = scene.add.graphics();

    // Monumental Renaissance mass: warm Florentine stone and deep rustication.
    g.fillStyle(0x9f7954, 1);
    g.fillRect(left, top, width, height);

    // Roof / cornice.
    g.fillStyle(0x5d4938, 1);
    g.fillRect(left - 12, top - 13, width + 24, 14);
    g.fillStyle(0xc3a277, 1);
    g.fillRect(left - 7, top + 1, width + 14, 10);
    g.fillStyle(0x6e5641, 1);
    g.fillRect(left - 4, top + 14, width + 8, 6);

    // Balustrade.
    g.fillStyle(0xd0b286, 1);
    g.fillRect(left + 22, top - 32, width - 44, 5);
    for (let x = left + 30; x < left + width - 24; x += 22) {
      g.fillRect(x, top - 47, 7, 20);
      g.fillCircle(x + 3, top - 48, 5);
    }

    // Upper floors.
    g.fillStyle(0xb98c61, 1);
    g.fillRect(left + 12, top + 28, width - 24, 86);
    g.fillStyle(0xad8057, 1);
    g.fillRect(left + 12, top + 119, width - 24, 74);

    // Strong horizontal string courses.
    [top + 111, top + 191].forEach((y) => {
      g.fillStyle(0xd0b180, 1);
      g.fillRect(left + 4, y, width - 8, 8);
      g.fillStyle(0x715642, 1);
      g.fillRect(left + 4, y + 8, width - 8, 3);
    });

    // Rusticated ground-floor blocks.
    g.fillStyle(0x886649, 1);
    g.fillRect(left, top + 202, width, height - 202);
    g.lineStyle(2, 0x6f543e, 0.75);
    for (let y = top + 210; y < bottom; y += 22) {
      g.lineBetween(left, y, left + width, y);
    }
    for (let row = 0, y = top + 210; y < bottom; row += 1, y += 22) {
      const offset = row % 2 ? 18 : 0;
      for (let x = left + offset; x < left + width; x += 52) {
        g.lineBetween(x, y, x, Math.min(bottom, y + 22));
      }
    }

    // Grand central portal with nested stone voussoirs.
    g.fillStyle(0x47372e, 1);
    g.fillCircle(doorX, bottom - 79, 58);
    g.fillRect(doorX - 58, bottom - 79, 116, 79);
    g.fillStyle(0x201d1c, 1);
    g.fillCircle(doorX, bottom - 73, 43);
    g.fillRect(doorX - 43, bottom - 73, 86, 73);
    g.lineStyle(6, 0xc7a373, 1);
    g.strokeCircle(doorX, bottom - 79, 58);
    g.strokeRect(doorX - 58, bottom - 79, 116, 79);

    // Bronze double doors.
    g.fillStyle(0x392d26, 1);
    g.fillRect(doorX - 39, bottom - 69, 37, 69);
    g.fillRect(doorX + 2, bottom - 69, 37, 69);
    g.lineStyle(2, 0x9d7a48, 1);
    for (const dx of [-39, 2]) {
      g.strokeRect(doorX + dx, bottom - 69, 37, 69);
      g.strokeRect(doorX + dx + 7, bottom - 59, 23, 22);
      g.strokeRect(doorX + dx + 7, bottom - 29, 23, 20);
    }
    g.fillStyle(0xd2ae65, 1);
    g.fillCircle(doorX - 8, bottom - 34, 3);
    g.fillCircle(doorX + 8, bottom - 34, 3);

    // Tall arched windows on both piano-nobile levels.
    const windowXs = [
      left + 66, left + 156, left + 246,
      left + width - 246, left + width - 156, left + width - 66
    ];

    for (const rowY of [top + 62, top + 145]) {
      windowXs.forEach((wx) => {
        g.fillStyle(0x263c46, 1);
        g.fillCircle(wx, rowY, 15);
        g.fillRect(wx - 15, rowY, 30, 31);
        g.lineStyle(4, 0xd1b485, 1);
        g.strokeCircle(wx, rowY, 15);
        g.strokeRect(wx - 15, rowY, 30, 31);
        g.lineStyle(1, 0x97b5bd, 0.8);
        g.lineBetween(wx, rowY - 13, wx, rowY + 30);
        g.lineBetween(wx - 13, rowY + 12, wx + 13, rowY + 12);
      });
    }

    // Monumental central balcony.
    g.fillStyle(0x49372d, 1);
    g.fillRect(doorX - 88, top + 105, 176, 10);
    g.fillStyle(0xd0ae77, 1);
    g.fillRect(doorX - 82, top + 96, 164, 8);
    for (let bx = doorX - 76; bx <= doorX + 72; bx += 13) {
      g.fillRect(bx, top + 76, 5, 21);
    }

    // Ground-floor barred windows.
    [left + 92, left + 205, left + width - 205, left + width - 92]
      .forEach((wx) => {
        g.fillStyle(0x342f2b, 1);
        g.fillRect(wx - 20, bottom - 86, 40, 48);
        g.lineStyle(3, 0xb08d5d, 1);
        g.strokeRect(wx - 20, bottom - 86, 40, 48);
        for (let gx = wx - 14; gx <= wx + 14; gx += 9) {
          g.lineBetween(gx, bottom - 82, gx, bottom - 42);
        }
      });

    facade.add(g);

    // Central Medici coat: six balls on a dark cartouche.
    const crestPlate = scene.add.graphics();
    crestPlate.fillStyle(0x4f3529, 1);
    crestPlate.fillRoundedRect(doorX - 57, top + 18, 114, 69, 11);
    crestPlate.lineStyle(4, 0xe0be79, 1);
    crestPlate.strokeRoundedRect(doorX - 57, top + 18, 114, 69, 11);
    facade.add(crestPlate);
    drawMediciBalls(scene, doorX, top + 38, 0.58, 9);

    const title = scene.add.text(
      center,
      top - 5,
      "PALAZZO MEDICI",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#fff0b5",
        stroke: "#4e3829",
        strokeThickness: 6
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    const subtitle = scene.add.text(
      center,
      top + 101,
      "MEDICI",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#e6c785",
        stroke: "#4a3027",
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    const doorZone = scene.add.zone(doorX, bottom - 42, 104, 94)
      .setDepth(165)
      .setInteractive({ useHandCursor: true });

    const doorMarker = scene.createPulsingInteractionMarker?.(
      doorX,
      bottom - 39,
      176
    );

    doorZone.on("pointerdown", (pointer) => {
      if (!scene.canUseWorldInteraction?.(pointer)) return;
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      enterPalazzo(scene);
    });

    scene.__palazzoMediciFacadeV48 = facade;
    scene.__palazzoMediciTitleV48 = title;
    scene.__palazzoMediciSubtitleV48 = subtitle;
    scene.__palazzoMediciDoorZoneV48 = doorZone;
    scene.__palazzoMediciDoorMarkerV48 = doorMarker;
  }

  function enterPalazzo(venice) {
    if (
      !venice?.sys?.isActive?.() ||
      venice.__palazzoMediciEnteringV48 ||
      venice.uiLocked ||
      venice.tramTransitActive
    ) {
      return;
    }

    venice.__palazzoMediciEnteringV48 = true;
    venice.player?.setVelocity?.(0, 0);
    venice.blockWorldInteractions?.(500);
    venice.setUILocked?.(true);

    const game = getGame();
    install(game);

    venice.cameras?.main?.fadeOut?.(260, 0, 0, 0);

    window.setTimeout(() => {
      if (!venice.sys?.isActive?.()) {
        venice.__palazzoMediciEnteringV48 = false;
        return;
      }

      venice.cameras?.main?.resetFX?.();
      venice.scene.pause("VeniceScene");
      venice.scene.launch("PalazzoMediciScene", { overworld: venice });
      venice.__palazzoMediciEnteringV48 = false;
    }, 285);
  }

  class PalazzoMediciScene extends BaseScene {
    constructor() {
      super("PalazzoMediciScene");
      this.__simonInteriorScene = true;
      this.overworld = null;
      this.exitZone = null;
      this.exitMarker = null;
      this.exiting = false;
    }

    init(data = {}) {
      // Do not call the Overworld init: the Venice scene remains paused and is
      // the authoritative holder of inventory/coins/story state.
      this.overworld = data.overworld || null;
      this.__simonInteriorScene = true;
      this.exiting = false;
      this.controlObjects = [];
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpRequested = false;
      this.touchShootRequested = false;
      this.uiLocked = false;
      this.playerDying = false;
      this.playerHitUntil = 0;
      this.activeAbility = null;
      this.inventory = {
        gatorade: 0,
        monster: 0,
        camel: 0,
        gandhiSticks: 0
      };
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);
      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, INTERIOR_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, INTERIOR_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBackgroundColor("#6b4f3c");
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(260, 0, 0, 0);

      this.createInteriorArchitecture();

      const ground = this.add.rectangle(
        INTERIOR_WIDTH / 2,
        GROUND_TOP + (GAME_HEIGHT - GROUND_TOP) / 2,
        INTERIOR_WIDTH,
        GAME_HEIGHT - GROUND_TOP,
        0x000000,
        0
      );
      this.physics.add.existing(ground, true);
      this.ground = ground;

      this.createAnimations();
      this.createPlayer();
      this.player.setPosition(430, 235);
      this.createKeyboardControls();
      this.createTouchControls();

      // Intentionally NO createHUD(): all interiors are hotbar-free.
      this.hotbarContainer?.setVisible?.(false);
      this.cleanupHotbarDOM?.();
      document
        .querySelectorAll?.('#phaser-game [data-simon-ui="hotbar-action"]')
        .forEach?.((node) => node.remove());

      this.createExitDoor();

      this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
      this.cameras.main.setDeadzone(260, 90);
      this.cameras.main.roundPixels = true;

      this.events.once("shutdown", () => {
        this.overworld = null;
      });
    }

    createInteriorArchitecture() {
      const wall = this.add.graphics().setDepth(-20);
      wall.fillStyle(0x8a684d, 1);
      wall.fillRect(0, 0, INTERIOR_WIDTH, GROUND_TOP);

      // Huge coffered ceiling.
      wall.fillStyle(0x3e2d25, 1);
      wall.fillRect(0, 0, INTERIOR_WIDTH, 70);
      for (let x = 22; x < INTERIOR_WIDTH; x += 78) {
        wall.fillStyle(0x6f4d34, 1);
        wall.fillRect(x, 11, 57, 42);
        wall.lineStyle(3, 0xc79b58, 0.9);
        wall.strokeRect(x, 11, 57, 42);
        wall.fillStyle(0x8f2834, 1);
        wall.fillCircle(x + 28, 32, 7);
      }

      // Marble lower wall and floor.
      wall.fillStyle(0xc6b18d, 1);
      wall.fillRect(0, 276, INTERIOR_WIDTH, 62);
      wall.fillStyle(0xddd0b5, 1);
      wall.fillRect(0, 304, INTERIOR_WIDTH, 34);
      wall.lineStyle(2, 0x9d8b72, 0.75);
      for (let x = 0; x < INTERIOR_WIDTH; x += 64) {
        wall.lineBetween(x, 304, x + 22, 338);
        wall.lineBetween(x + 42, 304, x + 64, 338);
      }

      // Monumental pietra-serena columns.
      [205, 530, 855, 1180, 1505].forEach((x) => {
        wall.fillStyle(0x5d5851, 1);
        wall.fillRect(x - 13, 81, 26, 222);
        wall.fillStyle(0xa89e8e, 1);
        wall.fillRect(x - 20, 75, 40, 13);
        wall.fillRect(x - 22, 296, 44, 10);
        wall.lineStyle(2, 0xd9ccb1, 0.55);
        wall.lineBetween(x - 6, 90, x - 6, 290);
        wall.lineBetween(x + 6, 90, x + 6, 290);
      });

      // Grand arches between the columns.
      wall.lineStyle(12, 0x6a6257, 1);
      for (let x = 205; x < 1505; x += 325) {
        wall.strokeCircle(x + 162, 150, 135);
      }

      // Deep red Medici banners.
      [350, 1025, 1670].forEach((x) => {
        wall.fillStyle(0x7f1f2b, 1);
        wall.fillRect(x - 42, 84, 84, 128);
        wall.fillTriangle(x - 42, 212, x, 238, x + 42, 212);
        wall.lineStyle(3, 0xd8b15f, 1);
        wall.strokeRect(x - 42, 84, 84, 128);
        drawMediciBalls(this, x, 127, 0.48, -10);
      });

      // Paintings in gilded frames.
      const paintings = [
        { x: 690, c: 0x315568 },
        { x: 1340, c: 0x6b4a35 }
      ];
      paintings.forEach(({ x, c }) => {
        wall.fillStyle(0xc89d54, 1);
        wall.fillRect(x - 58, 105, 116, 110);
        wall.fillStyle(0x392b24, 1);
        wall.fillRect(x - 49, 114, 98, 92);
        wall.fillStyle(c, 1);
        wall.fillRect(x - 43, 120, 86, 80);
        wall.fillStyle(0xd0a07d, 1);
        wall.fillCircle(x, 152, 18);
        wall.fillStyle(0x382a24, 1);
        wall.fillRect(x - 18, 170, 36, 28);
      });

      // Chandeliers.
      [475, 920, 1365].forEach((x) => {
        const chandelier = this.add.graphics().setDepth(-5);
        chandelier.lineStyle(3, 0xb8904d, 1);
        chandelier.lineBetween(x, 0, x, 92);
        chandelier.lineBetween(x - 34, 102, x + 34, 102);
        chandelier.lineBetween(x, 88, x - 34, 102);
        chandelier.lineBetween(x, 88, x + 34, 102);
        [-34, -17, 0, 17, 34].forEach((dx) => {
          chandelier.fillStyle(0xf7d991, 1);
          chandelier.fillCircle(x + dx, 107, 5);
        });
      });

      this.add.text(
        INTERIOR_WIDTH / 2,
        87,
        "PALAZZO MEDICI",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#f0d79d",
          stroke: "#4a2d22",
          strokeThickness: 6
        }
      )
        .setOrigin(0.5)
        .setDepth(-4);
    }

    createExitDoor() {
      const x = 92;
      const bottom = GROUND_TOP;

      const door = this.add.graphics().setDepth(3);
      door.fillStyle(0x4a352c, 1);
      door.fillCircle(x, bottom - 73, 47);
      door.fillRect(x - 47, bottom - 73, 94, 73);
      door.fillStyle(0x211b19, 1);
      door.fillCircle(x, bottom - 68, 35);
      door.fillRect(x - 35, bottom - 68, 70, 68);
      door.lineStyle(4, 0xc7a468, 1);
      door.strokeCircle(x, bottom - 73, 47);
      door.strokeRect(x - 47, bottom - 73, 94, 73);

      this.add.text(x, bottom - 132, "USCITA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#f4dfa8",
        stroke: "#3b2820",
        strokeThickness: 4
      })
        .setOrigin(0.5)
        .setDepth(5);

      this.exitZone = this.add.zone(x, bottom - 43, 98, 90)
        .setDepth(150)
        .setInteractive({ useHandCursor: true });

      this.exitMarker = this.createPulsingInteractionMarker(
        x,
        bottom - 42,
        176
      );

      this.exitZone.on("pointerdown", (pointer) => {
        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();
        this.leavePalazzo();
      });
    }

    leavePalazzo() {
      if (this.exiting) return;
      this.exiting = true;
      this.player?.setVelocity?.(0, 0);
      this.cameras.main.fadeOut(220, 0, 0, 0);

      this.time.delayedCall(240, () => {
        const overworld = this.overworld;
        const scenePlugin = this.scene;

        scenePlugin.stop("PalazzoMediciScene");
        scenePlugin.resume("VeniceScene");

        if (overworld?.scene) {
          overworld.cameras?.main?.resetFX?.();
          overworld.setUILocked?.(false);
          overworld.setControlsVisible?.(true);
          overworld.blockWorldInteractions?.(420);
          overworld.ensureTicketMachineInteractive?.();
          overworld.ensureLockerInteractive?.();
          overworld.ensureTramBoardingInteractive?.();
          overworld.player?.setVelocity?.(0, 0);
        }
      });
    }

    update(time) {
      if (!this.player?.body || this.exiting) return;

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

      let direction = 0;
      if (leftDown && !rightDown) direction = -1;
      if (rightDown && !leftDown) direction = 1;

      this.player.setVelocityX(direction * 175);

      if (direction !== 0) {
        this.facing = direction;
        this.player.setFlipX(direction < 0);
      }

      const jumpPressed =
        Boolean(
          this.cursors?.up &&
          Phaser.Input.Keyboard.JustDown(this.cursors.up)
        ) ||
        Boolean(
          this.keyW &&
          Phaser.Input.Keyboard.JustDown(this.keyW)
        ) ||
        Boolean(
          this.keySpace &&
          Phaser.Input.Keyboard.JustDown(this.keySpace)
        ) ||
        this.touchJumpRequested;

      this.touchJumpRequested = false;
      this.touchShootRequested = false;

      if (jumpPressed && onGround) {
        this.player.setVelocityY(-470);
        this.player.play("simon-jump", true);
      } else if (onGround) {
        this.player.play(
          direction === 0 ? "simon-idle" : "simon-run",
          true
        );
      }

      // Walking out through the left portal is also enough; no click required.
      if (this.player.x < 132 && direction < 0) {
        this.leavePalazzo();
      }
    }
  }

  function patchVenice(scene) {
    if (!scene || scene.__palazzoMediciV48Installed) return;
    scene.__palazzoMediciV48Installed = true;

    if (typeof scene.create === "function") {
      const originalCreate = scene.create.bind(scene);

      const wrappedCreate = function createWithPalazzoMediciV48(...args) {
        const result = originalCreate(...args);
        createPalazzoFacade(this);

        this.events?.once?.("shutdown", () => {
          this.__palazzoMediciFacadeV48 = null;
          this.__palazzoMediciTitleV48 = null;
          this.__palazzoMediciSubtitleV48 = null;
          this.__palazzoMediciDoorZoneV48 = null;
          this.__palazzoMediciDoorMarkerV48 = null;
        });

        return result;
      };

      wrappedCreate.__palazzoMediciV48 = true;
      scene.create = wrappedCreate;
    }

    if (scene.sys?.isActive?.()) {
      createPalazzoFacade(scene);
    }
  }

  function install(game) {
    if (!game?.scene) return;

    if (!game.scene.keys?.PalazzoMediciScene) {
      try {
        game.scene.add(
          "PalazzoMediciScene",
          PalazzoMediciScene,
          false
        );
      } catch (error) {
        console.error("PalazzoMediciScene konnte nicht registriert werden:", error);
      }
    }

    const venice = getVenice(game);
    if (venice) patchVenice(venice);
  }

  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGamePalazzoMediciV48(options = {}) {
      const game = previousStart.call(this, options);
      if (game) install(game);
      return game;
    };
  }

  const loop = () => {
    const game = getGame();
    if (game) install(game);
    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);

  window.PalazzoMediciV48 = Object.freeze({
    install,
    enterPalazzo
  });
})();
