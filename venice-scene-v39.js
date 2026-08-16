(() => {
  "use strict";

  if (window.__SIMON_VENICE_SCENE_V39__) return;
  window.__SIMON_VENICE_SCENE_V39__ = true;

  const sceneClasses = window.__SIMON_SCENE_CLASSES__ || {};
  const BaseScene = sceneClasses.MilchbuckScene;

  if (!BaseScene) {
    console.warn("VeniceScene konnte nicht registriert werden: Basisszene fehlt.");
    return;
  }

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const WORLD_WIDTH = 3000;
  const GROUND_TOP = 338;

  class VeniceScene extends BaseScene {
    constructor() {
      super("VeniceScene");

      this.arrivalTram = null;
      this.arrivalDoor = null;
      this.arrivalFinished = false;
      this.veniceVisitToken = 0;
      this.lockerHitbox = null;
      this.lockerInteractionMarker = null;
      this.lockerModal = null;
      this.stationBoundary = null;
    }

    init(data = {}) {
      super.init(data);
      this.currentStationKey = "venice";
      this.hasCityTicket = false;
      this.longDistanceTicketsUnlocked = true;
      this.arrivalTram = null;
      this.arrivalDoor = null;
      this.arrivalFinished = false;
      this.veniceVisitToken += 1;
      this.lockerHitbox = null;
      this.lockerInteractionMarker = null;
      this.lockerModal = null;
      this.stationBoundary = null;
      this.tramTransitActive = false;
      this.uiLocked = false;
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);
      this.currentStationKey = "venice";
      this.uiLocked = false;
      this.tramTransitActive = false;
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpRequested = false;
      this.touchShootRequested = false;
      this.combatPunchCycleUntil = 0;
      this.combatPunchToken = 0;
      this.combatPunchTarget = null;

      const domRoot = document.getElementById("phaser-game");
      domRoot?.querySelectorAll("[data-simon-ui]").forEach((node) => node.remove());
      this.sprintIndicatorDOM = null;

      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.cameras.main.setBackgroundColor("#86c0d9");

      this.createVeniceWorld();
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
      if (this.stationBoundary) {
        this.physics.add.collider(this.player, this.stationBoundary);
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
        this.cleanupBookQuoteBanner?.();
        this.cleanupVoid();
        if (this.lockerModal) {
          this.destroyDOMModal(this.lockerModal);
          this.lockerModal = null;
        }
      });

      const visitToken = this.veniceVisitToken;

      this.player.setPosition(650, 246);
      this.player.setVisible(false);
      this.player.setVelocity(0, 0);
      if (this.player.body) this.player.body.enable = false;

      this.setUILocked(true);
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(120, 0);
      this.cameras.main.fadeIn(650, 0, 0, 0);

      this.time.delayedCall(320, () => {
        if (visitToken !== this.veniceVisitToken || !this.sys.isActive()) return;
        this.playArrivalAnimation();
      });

      this.time.delayedCall(3600, () => {
        if (
          visitToken !== this.veniceVisitToken ||
          !this.sys.isActive() ||
          this.arrivalFinished
        ) {
          return;
        }
        this.forceFinishVeniceArrival();
      });

      this.cameras.main.roundPixels = true;
    }

    createVeniceWorld() {
      this.createVeniceSky();
      this.createVeniceFarCity();
      this.createVeniceMidCity();
      this.createVeniceStationQuarter();
      this.createVenicePromenade();
      this.createVeniceTicketMachine();
      this.createVeniceLocker();
      this.createArrivalTram();
    }

    createVeniceSky() {
      const bands = [
        { y: 0, h: 58, color: 0x7aaece },
        { y: 58, h: 58, color: 0x89bbd6 },
        { y: 116, h: 56, color: 0x9ac9dd },
        { y: 172, h: 56, color: 0xa9d5e1 },
        { y: 228, h: 70, color: 0xb9dde3 }
      ];

      bands.forEach((band) => {
        this.add.rectangle(
          WORLD_WIDTH / 2,
          band.y + band.h / 2,
          WORLD_WIDTH,
          band.h,
          band.color
        )
          .setScrollFactor(0.10)
          .setDepth(-34);
      });

      const haze = this.add.graphics().setScrollFactor(0.12).setDepth(-33);
      haze.fillStyle(0xf7ead8, 0.20);
      haze.fillEllipse(1450, 126, 900, 150);
      haze.fillEllipse(2380, 140, 760, 132);

      const clouds = [
        { x: 260, y: 72, s: 1.05 },
        { x: 980, y: 96, s: 0.82 },
        { x: 1680, y: 74, s: 1.2 },
        { x: 2430, y: 92, s: 0.92 }
      ];

      clouds.forEach(({ x, y, s }) => {
        const g = this.add.graphics().setScrollFactor(0.14).setDepth(-32);
        g.fillStyle(0xf5efe7, 0.88);
        g.fillRect(x, y, 72 * s, 14 * s);
        g.fillRect(x + 18 * s, y - 11 * s, 46 * s, 14 * s);
        g.fillRect(x + 29 * s, y - 21 * s, 28 * s, 12 * s);
      });
    }

    drawVenetianPalazzo(g, x, baseline, w, h, palette, variant = 0) {
      const top = baseline - h;
      const wall = palette.wall;
      const trim = palette.trim;
      const dark = palette.dark;
      const glass = palette.glass;

      g.fillStyle(wall, 1);
      g.fillRect(x, top, w, h);

      // Strong Venetian cornice / roof silhouette.
      g.fillStyle(trim, 1);
      g.fillRect(x - 3, top, w + 6, 5);
      if (variant % 4 === 0) {
        g.fillTriangle(x - 3, top, x + w / 2, top - 15, x + w + 3, top);
      } else if (variant % 4 === 1) {
        g.fillRect(x + 8, top - 8, w - 16, 8);
        for (let bx = x + 12; bx < x + w - 8; bx += 14) {
          g.fillRect(bx, top - 12, 7, 5);
        }
      }

      // Ground loggia / arcade.
      g.fillStyle(dark, 1);
      g.fillRect(x + 5, baseline - 25, w - 10, 22);
      const arcadeCount = Math.max(2, Math.floor((w - 14) / 24));
      const arcadeStep = (w - 14) / arcadeCount;
      for (let i = 0; i < arcadeCount; i += 1) {
        const ax = x + 9 + i * arcadeStep;
        g.fillStyle(glass, 1);
        g.fillCircle(ax + 7, baseline - 19, 7);
        g.fillRect(ax, baseline - 19, 14, 13);
        g.fillStyle(trim, 0.9);
        g.fillRect(ax - 2, baseline - 5, 18, 3);
      }

      // Tall arched windows, denser than before.
      const columns = Math.max(2, Math.floor((w - 16) / 20));
      const rows = Math.max(2, Math.floor((h - 42) / 24));
      const colStep = (w - 16) / columns;
      for (let row = 0; row < rows; row += 1) {
        const wy = top + 16 + row * 24;
        for (let col = 0; col < columns; col += 1) {
          const wx = x + 8 + col * colStep;
          const lit = (row + col + variant) % 4 === 0;
          g.fillStyle(lit ? 0xf3db9b : glass, 1);
          g.fillCircle(wx + 5, wy + 4, 5);
          g.fillRect(wx, wy + 4, 10, 10);
          g.lineStyle(1, trim, 0.9);
          g.strokeRect(wx, wy + 4, 10, 10);
        }
      }

      // Decorative balcony on many palazzi.
      if (variant % 3 !== 2 && h > 82) {
        const by = top + Math.min(54, h * 0.48);
        g.fillStyle(trim, 1);
        g.fillRect(x + 12, by, w - 24, 4);
        for (let bx = x + 15; bx < x + w - 13; bx += 9) {
          g.fillRect(bx, by - 8, 2, 9);
        }
      }

      // Narrow vertical stone borders give the façades more real weight.
      g.fillStyle(trim, 0.75);
      g.fillRect(x, top, 3, h);
      g.fillRect(x + w - 3, top, 3, h);
    }

    createVeniceFarCity() {
      const water = this.add.graphics().setScrollFactor(0.16).setDepth(-24);
      water.fillStyle(0x72aabc, 1);
      water.fillRect(0, 236, WORLD_WIDTH, 66);
      water.fillStyle(0xa8d5dc, 0.6);
      for (let x = 0; x < WORLD_WIDTH; x += 44) {
        water.fillRect(x, 250 + ((x / 44) % 4), 27, 2);
        water.fillRect(x + 13, 271 + ((x / 31) % 3), 20, 2);
        water.fillRect(x + 6, 287, 34, 1);
      }

      // Continuous far skyline: Venice should feel like a dense historic city,
      // not a handful of isolated blocks.
      const far = this.add.graphics().setScrollFactor(0.18).setDepth(-23);
      const palettes = [
        { wall:0xd7b79e, trim:0x9d806a, dark:0x5c5955, glass:0x607e91 },
        { wall:0xc9907e, trim:0x8f675b, dark:0x554b48, glass:0x66879a },
        { wall:0xe0c7a1, trim:0xae8d68, dark:0x5a5750, glass:0x5e8095 },
        { wall:0xb98775, trim:0x7f6157, dark:0x514b49, glass:0x688b9b },
        { wall:0xd5c9ad, trim:0x9d927a, dark:0x565752, glass:0x668595 },
        { wall:0xc7a584, trim:0x92745f, dark:0x554f49, glass:0x5d7c8e }
      ];

      let x = 820;
      let i = 0;
      while (x < WORLD_WIDTH + 80) {
        const w = 78 + ((i * 31) % 53);
        const h = 88 + ((i * 47) % 72);
        this.drawVenetianPalazzo(
          far,
          x,
          242,
          w,
          h,
          palettes[i % palettes.length],
          i
        );
        x += w - 3;
        i += 1;
      }

      // Multiple monumental landmarks woven into the skyline.
      const landmarks = this.add.graphics().setScrollFactor(0.18).setDepth(-21);

      // Campanile 1.
      landmarks.fillStyle(0xb8724e, 1);
      landmarks.fillRect(1370, 72, 34, 170);
      landmarks.fillStyle(0xe3d2ad, 1);
      landmarks.fillRect(1365, 61, 44, 20);
      landmarks.fillStyle(0x7f6a5d, 1);
      landmarks.fillTriangle(1361, 61, 1387, 36, 1413, 61);
      landmarks.fillStyle(0x4d6070, 1);
      landmarks.fillRect(1378, 88, 18, 23);

      // Campanile 2 further away.
      landmarks.fillStyle(0xb98964, 1);
      landmarks.fillRect(2476, 102, 27, 140);
      landmarks.fillStyle(0xd8c5a5, 1);
      landmarks.fillRect(2472, 92, 35, 16);
      landmarks.fillStyle(0x817160, 1);
      landmarks.fillTriangle(2468, 92, 2489, 72, 2511, 92);

      // Basilica dome cluster.
      const domeCenters = [1840, 1898, 1955];
      domeCenters.forEach((cx, idx) => {
        const radius = idx === 1 ? 34 : 25;
        landmarks.fillStyle(idx === 1 ? 0xcbb69a : 0xbfa990, 1);
        landmarks.fillCircle(cx, 151 + (idx === 1 ? -7 : 0), radius);
        landmarks.fillRect(
          cx - radius,
          151 + (idx === 1 ? -7 : 0),
          radius * 2,
          91 + (idx === 1 ? 7 : 0)
        );
        landmarks.fillStyle(0x9d806f, 1);
        landmarks.fillTriangle(
          cx - radius - 6,
          151 + (idx === 1 ? -7 : 0),
          cx,
          116 + (idx === 1 ? -11 : 0),
          cx + radius + 6,
          151 + (idx === 1 ? -7 : 0)
        );
      });

      // Thin distant church spires throughout the city.
      [1030, 1600, 2240, 2780].forEach((sx, idx) => {
        landmarks.fillStyle(idx % 2 ? 0xa98467 : 0xb38d6d, 1);
        landmarks.fillRect(sx, 126 + (idx % 2) * 15, 15, 116 - (idx % 2) * 15);
        landmarks.fillTriangle(
          sx - 7,
          126 + (idx % 2) * 15,
          sx + 7,
          95 + (idx % 2) * 15,
          sx + 22,
          126 + (idx % 2) * 15
        );
      });
    }

    createVeniceMidCity() {
      // A closer, richly detailed row of palazzi on the opposite canal bank.
      const mid = this.add.graphics().setScrollFactor(0.28).setDepth(-10);
      const palettes = [
        { wall:0xe0b78f, trim:0xa7775e, dark:0x4e4a47, glass:0x547f93 },
        { wall:0xb96f66, trim:0x87564f, dark:0x4c4644, glass:0x668ca0 },
        { wall:0xd8c39f, trim:0xa89170, dark:0x4d4c47, glass:0x587f94 },
        { wall:0xc79672, trim:0x93684f, dark:0x504947, glass:0x63889a },
        { wall:0xd8a99c, trim:0x9e7069, dark:0x514746, glass:0x577e91 }
      ];

      let x = 900;
      let i = 0;
      while (x < WORLD_WIDTH + 60) {
        const w = 92 + ((i * 37) % 54);
        const h = 70 + ((i * 41) % 54);
        this.drawVenetianPalazzo(
          mid,
          x,
          256,
          w,
          h,
          palettes[i % palettes.length],
          i + 10
        );
        x += w - 2;
        i += 1;
      }

      // Marble quay and frequent stair openings.
      mid.fillStyle(0xc6ad8d, 1);
      mid.fillRect(892, 256, 2108, 10);
      mid.fillStyle(0x92775e, 1);
      for (let qx = 920; qx < 2980; qx += 72) {
        mid.fillRect(qx, 266, 44, 4);
      }

      // Gondolas and mooring poles remain visible in front of the palazzi.
      const gondolas = [1085, 1325, 1570, 1815, 2070, 2325, 2610, 2825];
      gondolas.forEach((gx, idx) => {
        const g = this.add.graphics().setScrollFactor(0.30).setDepth(-8);
        g.fillStyle(0x171c21, 1);
        g.fillTriangle(gx, 282, gx + 43, 271, gx + 91, 282);
        g.fillRect(gx + 8, 276, 58, 7);
        g.fillStyle(idx % 3 === 0 ? 0x8d2934 : (idx % 3 === 1 ? 0x274f70 : 0x7b5936), 1);
        g.fillRect(gx + 27, 266, 18, 10);
        g.fillStyle(0xc6b088, 1);
        g.fillRect(gx + 72, 249, 2, 29);
      });

      const poles = this.add.graphics().setScrollFactor(0.30).setDepth(-7);
      for (let px = 1010, idx = 0; px < 2960; px += 205, idx += 1) {
        poles.fillStyle(0x76543c, 1);
        poles.fillRect(px, 242, 6, 50);
        const c1 = idx % 2 === 0 ? 0xc7514b : 0xe9e4d9;
        const c2 = idx % 2 === 0 ? 0xe9e4d9 : 0x35658b;
        poles.fillStyle(c1, 1);
        poles.fillRect(px, 242, 6, 11);
        poles.fillStyle(c2, 1);
        poles.fillRect(px, 253, 6, 11);
      }
    }

    createVeniceStationQuarter() {
      const station = this.add.graphics().setDepth(1);
      // Station building and canopy
      station.fillStyle(0xd6c7af, 1);
      station.fillRect(48, 104, 510, 138);
      station.fillStyle(0x99846f, 1);
      station.fillRect(36, 92, 540, 18);
      station.fillStyle(0xc5b196, 1);
      station.fillRect(94, 120, 420, 104);

      for (let x = 108; x < 500; x += 48) {
        station.fillStyle(0x5f7784, 1);
        station.fillRect(x, 142, 28, 52);
        station.lineStyle(2, 0xe7efe8, 0.65);
        station.strokeRect(x, 142, 28, 52);
      }

      station.fillStyle(0x7e6a59, 1);
      for (let x = 90; x <= 520; x += 86) {
        station.fillRect(x, 230, 10, 68);
      }

      // Platform roof over tram station.
      station.fillStyle(0x4c555c, 1);
      station.fillRect(560, 154, 310, 12);
      station.fillStyle(0x65727c, 1);
      station.fillRect(578, 167, 8, 120);
      station.fillRect(690, 167, 8, 120);
      station.fillRect(814, 167, 8, 120);
      station.fillStyle(0xaed1d1, 0.44);
      station.fillRect(586, 168, 228, 92);
      station.lineStyle(3, 0x57656e, 1);
      station.strokeRect(586, 168, 228, 92);
      station.fillStyle(0x8a623d, 1);
      station.fillRect(646, 252, 108, 8);
      station.fillRect(656, 260, 8, 24);
      station.fillRect(736, 260, 8, 24);

      // End-of-line track zone and catenary only at the station.
      const rails = this.add.graphics().setDepth(0);
      rails.fillStyle(0x666c72, 1);
      rails.fillRect(0, 308, 860, 7);
      rails.fillRect(0, 324, 860, 7);
      for (let x = 0; x < 860; x += 34) {
        rails.fillStyle(0x7b5d3d, 1);
        rails.fillRect(x, 304, 12, 30);
      }
      rails.fillStyle(0x4b5259, 1);
      rails.fillRect(840, 308, 58, 23);

      const catenary = this.add.graphics().setDepth(0);
      [90, 250, 430, 610, 790].forEach((x) => {
        catenary.fillStyle(0x6e7478, 1);
        catenary.fillRect(x, 108, 6, 200);
      });
      catenary.lineStyle(3, 0x7d858a, 1);
      catenary.lineBetween(0, 118, 860, 118);
      catenary.lineBetween(0, 132, 860, 132);
      [90, 250, 430, 610, 790].forEach((x) => {
        catenary.lineBetween(x + 3, 132, x + 30, 164);
        catenary.lineBetween(x + 3, 132, x - 24, 164);
      });

      // Station mast + blue sign.
      station.fillStyle(0x6e757a, 1);
      station.fillRect(878, 160, 7, 130);
      station.fillStyle(0x276aa2, 1);
      station.fillRect(806, 129, 160, 38);
      station.lineStyle(2, 0xdcecf5, 0.8);
      station.strokeRect(806, 129, 160, 38);
      this.add.text(886, 149, "STAZIONE VENEZIA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#ffffff",
        align: "center"
      })
        .setOrigin(0.5)
        .setDepth(6);

      this.add.text(708, 124, "STAZIONE VENEZIA", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "11px",
        color: "#fff7df",
        stroke: "#2b4e5f",
        strokeThickness: 5
      })
        .setOrigin(0.5)
        .setDepth(5);

      // Left boundary: station wall.
      this.stationBoundary = this.add.rectangle(26, 210, 40, 250, 0x000000, 0);
      this.physics.add.existing(this.stationBoundary, true);
    }

    createVenicePromenade() {
      // platform and promenade foreground
      const ground = this.add.graphics().setDepth(2);
      ground.fillStyle(0xbfa88b, 1);
      ground.fillRect(0, 286, WORLD_WIDTH, 52);
      ground.fillStyle(0xcdb69a, 1);
      for (let x = 0; x < WORLD_WIDTH; x += 74) {
        ground.fillRect(x, 288 + ((x / 74) % 2), 52, 10);
      }

      const canalEdge = this.add.graphics().setDepth(3);
      canalEdge.fillStyle(0x9e8669, 1);
      canalEdge.fillRect(900, 282, 2100, 12);
      canalEdge.fillStyle(0x7a6551, 1);
      for (let x = 912; x < 3000; x += 28) {
        canalEdge.fillRect(x, 294, 16, 6);
      }

      // Street lamps / vegetation.
      for (let x of [980, 1430, 1940, 2430]) {
        const lamp = this.add.graphics().setDepth(4);
        lamp.fillStyle(0x5e534c, 1);
        lamp.fillRect(x, 202, 6, 84);
        lamp.fillStyle(0xeadab2, 1);
        lamp.fillCircle(x + 3, 194, 10);
        lamp.fillStyle(0x8cae7d, 1);
        lamp.fillCircle(x - 28, 286, 14);
        lamp.fillCircle(x + 24, 286, 12);
      }
    }

    createVeniceTicketMachine() {
      const x = 735;
      const y = 219;
      const machine = this.add.graphics().setDepth(7);
      machine.fillStyle(0x2d5f78, 1);
      machine.fillRect(x, y, 49, 92);
      machine.fillStyle(0x183849, 1);
      machine.fillRect(x + 6, y + 9, 37, 29);
      machine.fillStyle(0xa9d8c5, 1);
      machine.fillRect(x + 12, y + 15, 25, 15);
      machine.fillStyle(0xf1c64f, 1);
      machine.fillRect(x + 12, y + 50, 25, 8);
      machine.fillStyle(0x17252e, 1);
      machine.fillRect(x + 14, y + 68, 21, 12);
      machine.lineStyle(3, 0xd7edf2, 0.75);
      machine.strokeRect(x, y, 49, 92);

      this.add.text(x + 24, y - 10, "TICKET", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff3c4",
        backgroundColor: "#244c61",
        padding: { x: 4, y: 3 }
      })
        .setOrigin(0.5)
        .setDepth(8);

      this.ticketHitbox = this.add.zone(x + 24, y + 45, 68, 104)
        .setDepth(150)
        .setInteractive({ useHandCursor: true });
      this.ticketHitbox.input.enabled = false;

      this.ticketInteractionMarker = this.createPulsingInteractionMarker(
        x + 24,
        y + 45,
        176
      ).setVisible(false);

      this.ticketHitbox.on("pointerdown", (pointer) => {
        if (!this.canUseWorldInteraction(pointer)) return;
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openTicketModal();
      });
    }

    createVeniceLocker() {
      const x = 646;
      const y = 222;
      const g = this.add.graphics().setDepth(7);
      g.fillStyle(0x7c716a, 1);
      g.fillRect(x, y, 52, 88);
      g.fillStyle(0x93877f, 1);
      g.fillRect(x + 5, y + 6, 42, 34);
      g.fillRect(x + 5, y + 46, 42, 34);
      g.lineStyle(2, 0xd7d0c7, 0.75);
      g.strokeRect(x, y, 52, 88);
      g.strokeRect(x + 5, y + 6, 42, 34);
      g.strokeRect(x + 5, y + 46, 42, 34);
      g.fillStyle(0xe7e2b6, 1);
      g.fillCircle(x + 38, y + 23, 2);
      g.fillCircle(x + 38, y + 63, 2);

      this.add.text(x + 26, y - 10, "SCHLIESSFACH", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff1cd",
        backgroundColor: "#5c5750",
        padding: { x: 4, y: 3 }
      })
        .setOrigin(0.5)
        .setDepth(8);

      this.lockerHitbox = this.add.zone(x + 26, y + 44, 70, 98)
        .setDepth(150)
        .setInteractive({ useHandCursor: true });
      this.lockerHitbox.input.enabled = false;
      this.lockerInteractionMarker = this.createPulsingInteractionMarker(
        x + 26,
        y + 44,
        176
      ).setVisible(false);

      this.lockerHitbox.on("pointerdown", (pointer) => {
        if (!this.canUseWorldInteraction(pointer)) return;
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.openLockerModal();
      });
    }

    getLockerState() {
      if (!window.__SIMON_LOCKER_V37__) {
        window.__SIMON_LOCKER_V37__ = {
          gatorade: 0,
          monster: 0,
          camel: 0,
          gandhiSticks: 0,
          generalRelativity: 0,
          phaenomenologie: 0,
          playbook: 0,
          zarathustra: 0
        };
      }

      const state = window.__SIMON_LOCKER_V37__;
      for (const key of [
        "gatorade", "monster", "camel", "gandhiSticks",
        "generalRelativity", "phaenomenologie", "playbook", "zarathustra"
      ]) {
        state[key] = Math.max(0, Number(state[key]) || 0);
      }
      return state;
    }

    getLockerDisplayItems() {
      return [
        { key: "gatorade", label: "Gatorade" },
        { key: "monster", label: "Monster Energy" },
        { key: "camel", label: "Zigarette" },
        { key: "gandhiSticks", label: "Gandhis Wurfstöcke" },
        { key: "generalRelativity", label: "General Relativity", book: true },
        { key: "phaenomenologie", label: "Phänomenologie des Geistes", book: true },
        { key: "playbook", label: "The Playbook", book: true },
        { key: "zarathustra", label: "Also sprach Zarathustra", book: true }
      ];
    }

    getBagCountForLockerKey(key) {
      if (key === "generalRelativity" || key === "phaenomenologie" || key === "playbook" || key === "zarathustra") {
        return this.booksOwned?.[key] ? 1 : 0;
      }
      return Math.max(0, Number(this.inventory?.[key]) || 0);
    }

    moveBagItemToLocker(key) {
      const locker = this.getLockerState();
      if (this.getBagCountForLockerKey(key) <= 0) return;
      if (key === "generalRelativity" || key === "phaenomenologie" || key === "playbook" || key === "zarathustra") {
        this.booksOwned[key] = false;
        const hotbarKey = this.getBookItemKey(key);
        if (hotbarKey) this.removeItemFromHotbar(hotbarKey);
      } else {
        this.inventory[key] = Math.max(0, (Number(this.inventory[key]) || 0) - 1);
        if (this.getItemCount(key) <= 0) this.removeItemFromHotbar(key);
      }
      locker[key] = Math.max(0, Number(locker[key]) || 0) + 1;
      this.updateInventoryUI();
      this.updateHotbarActionUI();
      this.refreshLockerModalContents();
    }

    moveLockerItemToBag(key) {
      const locker = this.getLockerState();
      if ((Number(locker[key]) || 0) <= 0) return;
      locker[key] = Math.max(0, Number(locker[key]) - 1);
      if (key === "generalRelativity" || key === "phaenomenologie" || key === "playbook" || key === "zarathustra") {
        this.booksOwned[key] = true;
      } else {
        this.inventory[key] = Math.max(0, Number(this.inventory[key]) || 0) + 1;
      }
      this.updateInventoryUI();
      this.updateHotbarActionUI();
      this.refreshLockerModalContents();
    }

    openLockerModal() {
      if (this.lockerModal) return;
      this.setUILocked(true);
      const modal = this.createDOMModal({
        key: "locker-venice",
        width: "min(92%, 660px)",
        background: "#e3ddd3",
        border: "#6f655d",
        shade: "rgba(6, 8, 12, 0.78)",
        padding: "16px 18px 18px"
      });
      if (!modal) {
        this.setUILocked(false);
        return;
      }
      this.lockerModal = modal;
      const top = document.createElement("div");
      Object.assign(top.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: "8px"
      });
      const back = this.createDOMButton("← ZURÜCK", () => this.closeLockerModal(), {
        color: "#344652",
        background: "#d6ddd9",
        border: "#798a92",
        width: "160px",
        minHeight: "40px",
        fontSize: "7px"
      });
      top.appendChild(back);
      const title = this.createDOMText("SCHLIESSFACH", {
        fontSize: "15px",
        color: "#352d28",
        margin: "4px 0 12px"
      });
      const info = this.createDOMText("Lege Gegenstände ab oder nimm sie wieder mit.", {
        fontSize: "6px",
        color: "#6a5f55",
        margin: "0 0 12px"
      });
      const content = document.createElement("div");
      this.__veniceLockerContent = content;
      modal.panel.append(top, title, info, content);
      this.refreshLockerModalContents();
      this.refreshUILock();
    }

    refreshLockerModalContents() {
      const root = this.__veniceLockerContent;
      if (!root || !this.lockerModal) return;
      root.innerHTML = "";
      Object.assign(root.style, {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "8px"
      });
      const locker = this.getLockerState();

      this.getLockerDisplayItems().forEach((item) => {
        const row = document.createElement("div");
        Object.assign(row.style, {
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) auto auto auto auto",
          alignItems: "center",
          gap: "8px",
          border: "2px solid #baa895",
          background: "rgba(255,248,235,0.58)",
          padding: "8px 9px"
        });
        const label = this.createDOMText(item.label, {
          fontSize: "6px",
          color: "#322d29",
          margin: "0"
        });
        const bag = this.createDOMText(`INV ${this.getBagCountForLockerKey(item.key)}`, {
          fontSize: "6px",
          color: "#37514b",
          margin: "0"
        });
        const box = this.createDOMText(`FACH ${Math.max(0, Number(locker[item.key]) || 0)}`, {
          fontSize: "6px",
          color: "#6a4e65",
          margin: "0"
        });
        const toLocker = this.createDOMButton("→", () => this.moveBagItemToLocker(item.key), {
          color: "#f3f1ea",
          background: this.getBagCountForLockerKey(item.key) > 0 ? "#6d8b73" : "#bdb8ad",
          border: "#8ea392",
          width: "46px",
          minHeight: "34px",
          fontSize: "8px"
        });
        const toBag = this.createDOMButton("←", () => this.moveLockerItemToBag(item.key), {
          color: "#f3f1ea",
          background: (Number(locker[item.key]) || 0) > 0 ? "#7a5f80" : "#bdb8ad",
          border: "#a188a4",
          width: "46px",
          minHeight: "34px",
          fontSize: "8px"
        });
        if (this.getBagCountForLockerKey(item.key) <= 0) toLocker.disabled = true;
        if ((Number(locker[item.key]) || 0) <= 0) toBag.disabled = true;
        row.append(label, bag, box, toLocker, toBag);
        root.appendChild(row);
      });
    }

    closeLockerModal() {
      if (!this.lockerModal) return;
      this.destroyDOMModal(this.lockerModal);
      this.lockerModal = null;
      this.__veniceLockerContent = null;
      this.refreshUILock();
      this.ensureLockerInteractive();
      this.ensureTicketMachineInteractive();
      this.ensureTramBoardingInteractive();
    }

    createArrivalTram() {
      const tram = this.add.container(-300, 0).setDepth(10);
      const g = this.add.graphics();
      g.fillStyle(0xe9edef, 1);
      g.fillRect(0, 219, 250, 96);
      g.fillStyle(0x1766a6, 1);
      g.fillRect(0, 274, 250, 41);
      g.fillStyle(0x263e4d, 1);
      [19, 73, 127, 181].forEach((x) => g.fillRect(x, 235, 42, 28));
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

      this.tramBoardingMarker = this.add.circle(156, 266, 6, 0xffffff, 1)
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

      this.tramHitbox = this.add.zone(540, 272, 250, 112)
        .setDepth(170)
        .setInteractive({ useHandCursor: true });
      this.tramHitbox.input.enabled = false;
      this.tramHitbox.on("pointerdown", (pointer) => {
        if (!this.canUseWorldInteraction(pointer)) return;
        pointer.event?.preventDefault?.();
        pointer.event?.stopPropagation?.();
        this.boardTram();
      });

      this.arrivalTram = tram;
      this.tram = tram;
    }

    ensureTicketMachineInteractive() {
      if (!this.ticketHitbox?.input) return;
      this.ticketHitbox.input.enabled = Boolean(this.arrivalFinished && !this.uiLocked && !this.tramTransitActive && !this.playerDying && !this.inVoid && !this.rewindActive);
      this.ticketInteractionMarker?.setVisible(Boolean(this.ticketHitbox.input.enabled));
    }

    ensureLockerInteractive() {
      if (!this.lockerHitbox?.input) return;
      this.lockerHitbox.input.enabled = Boolean(this.arrivalFinished && !this.uiLocked && !this.tramTransitActive && !this.playerDying && !this.inVoid && !this.rewindActive);
      this.lockerInteractionMarker?.setVisible(Boolean(this.lockerHitbox.input.enabled));
    }

    getTramDestinations() {
      const destinations = [];
      if (this.hasLongDistanceTicket) {
        destinations.push({ key: "bahnhofstrasse", label: "BAHNHOFSTRASSE/HB" });
      }
      return destinations;
    }

    openTicketModal() {
      if (this.ticketModal) return;
      this.setUILocked(true);
      const modal = this.createDOMModal({
        key: "ticket-venice",
        width: "min(90%, 500px)",
        background: "#ece3e6",
        border: "#715f7f",
        shade: "rgba(5, 6, 11, 0.78)",
        padding: "15px 18px 18px"
      });
      if (!modal) {
        this.setUILocked(false);
        return;
      }
      this.ticketModal = modal;
      this.longDistanceTicketStatusText = null;

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
        margin: "4px 0 16px"
      });

      const longBox = document.createElement("section");
      Object.assign(longBox.style, {
        border: "2px solid #7f5c86",
        padding: "11px",
        margin: "0",
        background: "rgba(226,211,235,.48)"
      });

      const longLine = this.createDOMText("LANGSTRECKENTICKET · 1 FAHRT", {
        fontSize: "8px",
        color: "#392c40",
        margin: "0 0 7px"
      });
      const longPrice = this.createDOMText("150.-", {
        fontSize: "16px",
        color: "#392c40",
        margin: "0 0 12px"
      });
      const longBuy = this.createDOMButton(
        this.hasLongDistanceTicket ? "GEKAUFT" : "KAUFEN",
        () => this.tryBuyLongDistanceTicket(),
        {
          color: (this.developerMode || this.coins >= 150 || this.hasLongDistanceTicket)
            ? "#f8efff" : "#777078",
          background: this.hasLongDistanceTicket
            ? "#655070"
            : ((this.developerMode || this.coins >= 150) ? "#704f7a" : "#c8bdc9"),
          border: "#a983b2",
          width: "180px",
          minHeight: "42px",
          fontSize: "9px",
          padding: "8px 10px"
        }
      );
      longBuy.style.margin = "0 auto";
      longBuy.dataset.longTicketBuy = "true";
      this.longDistanceTicketStatusText = this.createDOMText(
        this.hasLongDistanceTicket
          ? "LANGSTRECKENTICKET BEREITS GEKAUFT"
          : (this.developerMode
              ? "∞ COINS · DEVELOPER"
              : (this.coins < 150 ? `${this.coins} COINS · NOCH NICHT GENUG` : `${this.coins} COINS`)),
        {
          fontSize: "6px",
          color: this.hasLongDistanceTicket || this.developerMode || this.coins >= 150 ? "#60456a" : "#8b3a36",
          margin: "11px 0 0"
        }
      );
      longBox.append(longLine, longPrice, longBuy, this.longDistanceTicketStatusText);
      modal.panel.append(top, title, longBox);
      this.refreshUILock();
    }

    tryBuyLongDistanceTicket() {
      if (!this.ticketModal) return;
      if (this.hasLongDistanceTicket) {
        if (this.longDistanceTicketStatusText) {
          this.longDistanceTicketStatusText.textContent = "LANGSTRECKENTICKET BEREITS GEKAUFT";
        }
        return;
      }
      if (!this.developerMode && this.coins < 150) {
        if (this.longDistanceTicketStatusText) {
          this.longDistanceTicketStatusText.textContent = "NICHT GENUG COINS!";
          this.longDistanceTicketStatusText.style.color = "#8b3a36";
        }
        return;
      }
      if (!this.developerMode) this.coins -= 150;
      this.hasLongDistanceTicket = true;
      this.updateCoinHUD();
      this.updateInventoryUI();
      this.ensureTramBoardingInteractive();
      if (this.longDistanceTicketStatusText) {
        this.longDistanceTicketStatusText.textContent = "LANGSTRECKENTICKET GEKAUFT!";
        this.longDistanceTicketStatusText.style.color = "#60456a";
      }
      const buy = this.ticketModal?.panel?.querySelector("[data-long-ticket-buy='true']");
      if (buy) {
        buy.textContent = "GEKAUFT";
        buy.style.background = "#655070";
        buy.style.color = "#f8efff";
      }
    }

    closeTicketModal() {
      super.closeTicketModal();
      this.ensureLockerInteractive();
    }

    startTramJourney(destinationKey) {
      if (destinationKey !== "bahnhofstrasse") {
        this.refreshUILock();
        return;
      }
      if (this.__tramSwitching || this.tramTransitActive) return;
      if (!this.consumeLongDistanceTicket()) {
        this.refreshUILock();
        return;
      }
      this.__tramSwitching = true;
      this.tramTransitActive = true;
      this.setUILocked(true);
      this.player.setVelocity(0, 0);
      this.cameras.main.stopFollow();

      const returnData = {
        arrivalFrom: "venice",
        coins: this.developerMode ? 999999 : this.coins,
        hp: this.hp,
        hasCityTicket: false,
        hasLongDistanceTicket: false,
        longDistanceTicketsUnlocked: true,
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
        enriqueSpoken: this.enriqueSpoken,
        amsifEncounterStarted: this.amsifEncounterStarted,
        amsifIntroCompleted: this.amsifIntroCompleted,
        amsifStoryCompleted: this.amsifStoryCompleted,
        booksRead: { ...this.booksRead },
        abilitiesUnlocked: { ...this.abilitiesUnlocked },
        activeAbility: this.activeAbility,
        forItselfCooldownUntil: this.forItselfCooldownUntil,
        hotbarItems: [...this.hotbarItems],
        selectedHotbarIndex: this.selectedHotbarIndex,
        sprintExpiresAt: this.sprintExpiresAt
      };

      const doorX = (this.arrivalTram?.x || 420) + 156;
      this.tweens.add({
        targets: this.player,
        x: doorX,
        y: 250,
        duration: 420,
        ease: "Sine.easeInOut",
        onComplete: () => {
          if (!this.sys.isActive()) return;
          this.player.setVisible(false);
          if (this.player.body) this.player.body.enable = false;
          const leave = () => {
            if (!this.sys.isActive()) return;
            this.tweens.add({
              targets: this.arrivalTram,
              x: -360,
              duration: 1700,
              ease: "Sine.easeIn"
            });
            this.time.delayedCall(650, () => {
              if (!this.sys.isActive()) return;
              this.cameras.main.fadeOut(440, 0, 0, 0);
              this.time.delayedCall(470, () => {
                if (!this.sys.isActive()) return;
                this.cameras.main.resetFX();
                this.scene.start("BahnhofquaiScene", returnData);
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

    forceFinishVeniceArrival() {
      if (this.arrivalFinished || !this.sys.isActive() || !this.player?.active) return;
      if (this.arrivalTram?.active) {
        this.tweens.killTweensOf(this.arrivalTram);
        this.arrivalTram.setX(420);
      }
      if (this.arrivalDoor?.active) {
        this.tweens.killTweensOf(this.arrivalDoor);
        this.arrivalDoor.setScale(0.08, 1);
        this.arrivalDoor.setAlpha(0.35);
      }
      this.tweens.killTweensOf(this.player);
      const exitX = (this.arrivalTram?.x || 420) + 156 + 118;
      this.player.setPosition(exitX, 250);
      this.player.setVelocity(0,0);
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
      this.ensureLockerInteractive();
      this.ensureTramBoardingInteractive();
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
    }

    playArrivalAnimation() {
      if (this.arrivalFinished || !this.arrivalTram?.active || !this.player?.active || !this.sys.isActive()) return;
      this.cameras.main.resetFX();
      this.cameras.main.setAlpha(1);
      this.tweens.add({
        targets: this.arrivalTram,
        x: 420,
        duration: 900,
        ease: "Sine.easeOut",
        onComplete: () => {
          if (!this.sys.isActive()) return;
          if (!this.arrivalDoor?.active) {
            this.forceFinishVeniceArrival();
            return;
          }
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
                  this.tramTransitActive = false;
                  this.setUILocked(false);
                  this.setControlsVisible(true);
                  this.ensureTicketMachineInteractive();
                  this.ensureLockerInteractive();
                  this.ensureTramBoardingInteractive();
                  this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
                  this.cameras.main.setDeadzone(240, 80);
                }
              });
            }
          });
        }
      });
    }

    update(time, delta) {
      super.update(time, delta);
      this.ensureTicketMachineInteractive();
      this.ensureLockerInteractive();
    }
  }

  function installOnGame(game) {
    if (!game?.scene) return;
    if (!game.scene.keys?.VeniceScene) {
      game.scene.add("VeniceScene", VeniceScene, false);
    }
  }

  const originalStart = window.startSimonGame;
  if (typeof originalStart === "function" && !originalStart.__sv39VeniceWrapped) {
    const wrapped = function startSimonGameWithVenice(options = {}) {
      const game = originalStart.call(this, options);
      installOnGame(game);

      if (game && options?.developerMode && options?.startMode === "venice") {
        const startVeniceDeveloperCheckpoint = () => {
          installOnGame(game);
          if (!game.scene?.keys?.VeniceScene) return;

          game.scene.start("VeniceScene", {
            arrivalFrom: "developer",
            coins: 999999,
            hp: 100,
            developerMode: true,
            hasCityTicket: false,
            hasLongDistanceTicket: true,
            longDistanceTicketsUnlocked: true,
            inventory: {
              gatorade: 2,
              monster: 2,
              camel: 3,
              gandhiSticks: 0
            },
            booksOwned: {},
            booksRead: {},
            abilitiesUnlocked: {},
            activeAbility: null,
            hotbarItems: [null, null, null, null, null],
            selectedHotbarIndex: 0,
            sprintExpiresAt: 0
          });
        };

        window.setTimeout(startVeniceDeveloperCheckpoint, 80);
      }

      return game;
    };
    wrapped.__sv39VeniceWrapped = true;
    window.startSimonGame = wrapped;
  }
})();
