(() => {
  "use strict";

  const VERSION = "14";
  const GROUND_TOP = 338;
  const BOUNCER_KEY = "bouncer-v12";
  const LION_KEY = "lion-v12";

  if (window.__SIMON_HIVE_V14__) return;
  window.__SIMON_HIVE_V14__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("HIVE v14: startSimonGame fehlt.");
    return;
  }

  class HiveInteriorScene extends Phaser.Scene {
    constructor() {
      super("HiveInteriorScene");
      this.overworld = null;
      this.simonDances = false;
      this.player = null;
      this.lion = null;
      this.touchLeft = false;
      this.touchRight = false;
      this.modalOpen = false;
      this.currentModal = null;
      this.domNodes = [];
      this.introDancing = false;
      this.walletGraphic = null;
      this.walletZone = null;
      this.coinText = null;
      this.coins = 0;
      this.brouwersCount = 0;
      this.drunkLevel = 0;
      this.touchDance = false;
      this.actionLocked = false;
      this.womanSprite = null;
      this.speechBubble = null;
      this.danceBobTween = null;
    }

    init(data = {}) {
      this.overworld = data.overworld || null;
      this.simonDances = Boolean(data.simonDances);
      this.coins = Number.isFinite(this.overworld?.coins) ? this.overworld.coins : 0;
      this.brouwersCount = Number.isFinite(this.overworld?.brouwersCount)
        ? this.overworld.brouwersCount
        : 0;
      this.drunkLevel = Number.isFinite(this.overworld?.drunkLevel)
        ? this.overworld.drunkLevel
        : Math.max(0, Number(window.__SIMON_DRUNK_LEVEL__) || 0);
    }

    preload() {
      if (!this.textures.exists(BOUNCER_KEY)) {
        this.load.spritesheet(BOUNCER_KEY, "bouncer-spritesheet-v12.png", {
          frameWidth: 140,
          frameHeight: 160
        });
      }

      if (!this.textures.exists(LION_KEY)) {
        this.load.spritesheet(LION_KEY, "lion-spritesheet-v12.png", {
          frameWidth: 150,
          frameHeight: 110
        });
      }

      if (!this.textures.exists("simon-actions-v14")) {
        this.load.spritesheet("simon-actions-v14", "simon-actions-spritesheet-v14.png", {
          frameWidth: 190,
          frameHeight: 220
        });
      }

      if (!this.textures.exists("woman-v14")) {
        this.load.spritesheet("woman-v14", "woman-spritesheet-v14.png", {
          frameWidth: 165,
          frameHeight: 185
        });
      }
    }

    create() {
      this.input.addPointer(3);
      this.createAnimations();
      this.createRoom();
      this.createPlayer();
      this.createTouchControls();
      this.createPersistentDOM();

      if (this.simonDances) {
        this.startSimonDanceIntro();
      }

      this.cameras.main.fadeIn(320, 0, 0, 0);
      setGlobalDrunkLevel(this.drunkLevel);

      this.events.once("shutdown", () => {
        this.destroySpeechBubble();
        this.cleanupDOM();
      });
      this.events.once("destroy", () => this.cleanupDOM());

      if (this.input.keyboard) {
        this.input.keyboard.on("keydown-ESC", () => {
          if (this.modalOpen) this.closeModal();
          else this.leaveHive();
        });
      }
    }

    createAnimations() {
      const make = (key, texture, frames, frameRate, repeat = -1) => {
        if (this.anims.exists(key)) return;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, { frames }),
          frameRate,
          repeat
        });
      };

      // Türsteher: especially the dialogue is deliberately slower. His old
      // four-fps loop changed hand poses too rapidly for spoken dialogue.
      make("bouncer-v12-idle", BOUNCER_KEY, [0,1,2,3,2,1], 2.4, -1);
      make("bouncer-v12-talk", BOUNCER_KEY, [4,4,5,5,6,7,8,9,10,10,9,8,7,6,5], 2.5, -1);
      make("bouncer-v12-run", BOUNCER_KEY, [11,12,13,14,15,16], 9, -1);
      make("bouncer-v12-attack", BOUNCER_KEY, [17,18,19,20,21], 8, 0);
      make("bouncer-v12-hit", BOUNCER_KEY, [22,23], 6, 0);
      make("bouncer-v12-down", BOUNCER_KEY, [24,25,26,27], 7, 0);

      make("lion-v12-idle", LION_KEY, [0,1,2,3], 4, -1);
      make("lion-v12-run", LION_KEY, [4,5,6,7,8,9], 9.5, -1);
      make("lion-v12-attack", LION_KEY, [10,11,12,13,14,15], 9, 0);
      make("lion-v12-purr", LION_KEY, [16,17,18,17], 3.5, -1);
      make("lion-v12-dance", LION_KEY, [20,21,20,22,20,24,21,20], 4.3, -1);

      // New Simon sheet is action-only. The game's established 240x280 Simon
      // sheet remains untouched, so the friend's movement/combat work cannot break.
      make("simon-v14-talk", "simon-actions-v14", [0,1,2,3,2,1], 3, -1);
      make("simon-v14-dance", "simon-actions-v14", [4,5,6,7,8,9,10,9,8,7,6,5], 5.8, -1);
      make("simon-v14-drink", "simon-actions-v14", [11,12,13,13,12,14], 5.2, 0);
      make("simon-v14-flirt", "simon-actions-v14", [15,16,17,18,19], 4.8, 0);

      make("woman-v14-idle", "woman-v14", [0,1,2,1], 2.2, -1);
      // The clean pointing/arms gestures from the source atlas work best for rejection.
      make("woman-v14-reject", "woman-v14", [4,5,6,7,6,5], 3.2, 0);
      make("woman-v14-cheers", "woman-v14", [8,9,10,11,10,9], 4, 0);
    }

    createRoom() {
      const bg = this.add.graphics();
      bg.fillStyle(0x090811, 1);
      bg.fillRect(0, 0, 820, 390);

      bg.fillStyle(0x171124, 1);
      bg.fillRect(0, 55, 820, 260);

      bg.fillStyle(0x2b2033, 1);
      bg.fillRect(0, 315, 820, 75);

      // Wall panels.
      bg.fillStyle(0x21172a, 1);
      for (let x = 0; x < 820; x += 82) {
        bg.fillRect(x + 6, 82, 62, 95);
      }

      this.add.text(410, 30, "HIVE", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#fff1a8",
        stroke: "#7829aa",
        strokeThickness: 7
      }).setOrigin(0.5);

      // Disco ball.
      const disco = this.add.graphics();
      disco.fillStyle(0xdce4ec, 1);
      disco.fillCircle(410, 82, 19);
      disco.lineStyle(2, 0x727a84, 1);
      disco.strokeCircle(410, 82, 19);
      for (let i = -12; i <= 12; i += 6) {
        disco.lineBetween(394, 82 + i, 426, 82 + i);
        disco.lineBetween(410 + i, 66, 410 + i, 98);
      }

      const lights = this.add.graphics();
      lights.fillStyle(0xff4f9a, 0.12);
      lights.fillTriangle(410, 98, 120, 315, 320, 315);
      lights.fillStyle(0x45d8ff, 0.12);
      lights.fillTriangle(410, 98, 320, 315, 615, 315);
      lights.fillStyle(0xc876ff, 0.10);
      lights.fillTriangle(410, 98, 520, 315, 790, 315);

      // Dance floor.
      const floor = this.add.graphics();
      const colors = [0x632f72, 0x284a6a, 0x7a4b32, 0x2f6652];
      let ci = 0;
      for (let y = 235; y < 315; y += 28) {
        for (let x = 215; x < 545; x += 32) {
          floor.fillStyle(colors[ci % colors.length], 0.9);
          floor.fillRect(x, y, 28, 24);
          ci += 1;
        }
      }

      // BAR on the right. The counter now visibly stands on the same floor
      // Simon walks on instead of floating high on the wall.
      const bar = this.add.graphics().setDepth(15);

      // Back wall / bottle niche.
      bar.fillStyle(0x3d241a, 1);
      bar.fillRect(575, 128, 230, 92);
      bar.fillStyle(0x24130f, 1);
      bar.fillRect(580, 122, 220, 8);

      // Counter front reaches all the way down to the club floor (y = 315).
      bar.fillStyle(0x70452f, 1);
      bar.fillRect(563, 238, 250, 77);
      bar.fillStyle(0x9a6842, 1);
      bar.fillRect(558, 231, 260, 11);
      bar.fillStyle(0x4c2d21, 1);
      bar.fillRect(575, 251, 226, 55);

      this.add.text(688, 111, "BAR · BROUWERS", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        color: "#ffe4a4"
      }).setOrigin(0.5).setDepth(20);

      const shelf = this.add.graphics().setDepth(17);
      shelf.fillStyle(0x2a1712, 1);
      shelf.fillRect(603, 172, 172, 7);
      const bottleColors = [0x47754b, 0x7a4a48, 0x486c91, 0x9b7b35];
      for (let i = 0; i < 9; i += 1) {
        shelf.fillStyle(bottleColors[i % bottleColors.length], 1);
        shelf.fillRect(608 + i * 18, 149 + (i % 2) * 3, 8, 23);
        shelf.fillStyle(0xe5d7ae, 1);
        shelf.fillRect(610 + i * 18, 145 + (i % 2) * 3, 4, 4);
      }

      // Bar stools also touch the same floor line.
      const stools = this.add.graphics().setDepth(18);
      [607, 660, 713, 766].forEach((x) => {
        stools.fillStyle(0x84563a, 1);
        stools.fillRoundedRect(x - 14, 273, 28, 9, 4);
        stools.fillStyle(0x3a2319, 1);
        stools.fillRect(x - 9, 282, 4, 33);
        stools.fillRect(x + 5, 282, 4, 33);
      });

      // Beer interaction hint sits just above the counter.
      this.add.text(773, 216, "BIER", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff0bb",
        backgroundColor: "#5d3427",
        padding: { x: 5, y: 4 }
      }).setOrigin(0.5).setDepth(25);

      this.createBarWoman(657, 315);

      // Other people dancing.
      this.createDancer(245, 291, 0x5a89d0, 0);
      this.createDancer(310, 283, 0xdb7796, 1);
      this.createDancer(484, 289, 0x6ebc7c, 2);
      this.createDancer(531, 298, 0xc18c4f, 3);

      // Lion dances regardless of whether Simon said YES or NO.
      this.lion = this.add.sprite(403, 282, LION_KEY, 20)
        .setDepth(45)
        .setScale(1.1)
        .setFlipX(true)
        .play("lion-v12-dance");

      this.tweens.add({
        targets: this.lion,
        y: this.lion.y - 7,
        angle: { from: -5, to: 5 },
        duration: 360,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      // Hidden wallet: deliberately subtle and unlabeled.
      this.walletGraphic = this.add.graphics().setDepth(19);
      const walletFound = Boolean(this.overworld?.hiveWalletFound);
      this.walletGraphic.fillStyle(0x5a3c25, walletFound ? 0.08 : 0.50);
      this.walletGraphic.fillRoundedRect(535, 308, 21, 11, 2);
      this.walletGraphic.fillStyle(0xc6a66a, walletFound ? 0.05 : 0.40);
      this.walletGraphic.fillRect(545, 310, 4, 7);

      this.walletZone = this.add.zone(545, 313, 38, 30)
        .setDepth(90)
        .setInteractive({ useHandCursor: true });

      if (walletFound) this.walletZone.disableInteractive();

      this.walletZone.on("pointerup", () => this.collectWallet());

      // Bar hit area, below woman zone in input depth.
      this.add.zone(748, 246, 112, 132)
        .setDepth(80)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => this.openBeerMenu());

      // Woman hit area.
      this.add.zone(657, 253, 62, 104)
        .setDepth(100)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => this.openWomanMenu());
    }

    createDancer(x, y, shirtColor, variant) {
      const c = this.add.container(x, y).setDepth(35);
      const g = this.add.graphics();

      const skin = [0xf1c8a7, 0xd0a082, 0xe5b899, 0xb97f67][variant % 4];
      const hair = [0x4a3026, 0x1b1b1e, 0xc47a34, 0x6d3f2b][variant % 4];

      g.fillStyle(skin, 1);
      g.fillCircle(0, -30, 9);
      g.fillStyle(hair, 1);
      g.fillRect(-8, -40, 16, 7);

      g.fillStyle(shirtColor, 1);
      g.fillRect(-10, -21, 20, 26);

      g.fillStyle(0x29232f, 1);
      g.fillRect(-9, 5, 7, 23);
      g.fillRect(2, 5, 7, 23);

      g.fillStyle(skin, 1);
      g.fillRect(-17, -18, 6, 19);
      g.fillRect(11, -18, 6, 19);

      c.add(g);

      this.tweens.add({
        targets: c,
        y: y - 8,
        angle: { from: -7, to: 7 },
        duration: 310 + variant * 55,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    createBarWoman(x, y) {
      this.womanSprite = this.add.sprite(x, y, "woman-v14", 0)
        .setOrigin(0.5, 1)
        .setScale(0.62)
        .setDepth(42);

      this.womanSprite.play("woman-v14-idle", true);
    }

    createPlayer() {
      this.player = this.add.sprite(
        this.simonDances ? 335 : 110,
        286,
        "simon",
        0
      )
        .setScale(0.42)
        .setDepth(60);

      this.player.play("simon-idle", true);

      if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyDance = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
      }
    }

    createTouchControls() {
      const make = (x, label, down, up, radius = 30, fontSize = "16px") => {
        const bg = this.add.circle(x, 347, radius, 0x111621, 0.68)
          .setStrokeStyle(3, 0xfff0cf, 0.7)
          .setDepth(220)
          .setScrollFactor(0)
          .setInteractive();

        this.add.text(x, 347, label, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize,
          color: "#fff4d5"
        })
          .setOrigin(0.5)
          .setDepth(221)
          .setScrollFactor(0);

        bg.on("pointerdown", () => {
          bg.setFillStyle(0x3c3a72, 0.9);
          down();
        });

        const release = () => {
          bg.setFillStyle(0x111621, 0.68);
          up();
        };

        bg.on("pointerup", release);
        bg.on("pointerout", release);
        bg.on("pointerupoutside", release);
      };

      make(55, "←", () => { this.touchLeft = true; }, () => { this.touchLeft = false; });
      make(123, "→", () => { this.touchRight = true; }, () => { this.touchRight = false; });
      make(765, "♪", () => { this.touchDance = true; }, () => { this.touchDance = false; }, 28, "14px");
    }

    createPersistentDOM() {
      const root = document.getElementById("phaser-game");
      if (!root) return;

      root.querySelectorAll("[data-hive-v12]").forEach((node) => node.remove());

      const street = document.createElement("button");
      street.type = "button";
      street.dataset.hiveV12 = "street";
      street.textContent = "← STRASSE";

      Object.assign(street.style, {
        position: "absolute",
        left: "10px",
        top: "10px",
        zIndex: "100005",
        minHeight: "40px",
        padding: "7px 10px",
        border: "2px solid #c69ce8",
        background: "#352540",
        color: "#fff3ca",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        touchAction: "manipulation",
        cursor: "pointer"
      });

      street.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.leaveHive();
      });

      root.appendChild(street);
      this.domNodes.push(street);

      const hud = document.createElement("div");
      hud.dataset.hiveV12 = "hud";
      Object.assign(hud.style, {
        position: "absolute",
        right: "12px",
        top: "12px",
        zIndex: "100004",
        padding: "8px 10px",
        border: "2px solid #ffe2a2",
        background: "rgba(20,17,27,.88)",
        color: "#fff0bd",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "8px",
        pointerEvents: "none"
      });

      this.coinText = hud;
      this.updateCoinHUD();
      root.appendChild(hud);
      this.domNodes.push(hud);
    }

    updateCoinHUD() {
      if (this.coinText) {
        this.coinText.textContent =
          `${this.coins} COINS · BROUWERS ${this.brouwersCount}`;
      }
    }

    startSimonDanceIntro() {
      this.introDancing = true;
      this.playSimonAction("simon-v14-dance", { loop: true });

      this.danceBobTween = this.tweens.add({
        targets: this.player,
        y: this.player.y - 6,
        angle: { from: -5, to: 5 },
        duration: 300,
        yoyo: true,
        repeat: 4,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.stopSimonAction();
          this.introDancing = false;
        }
      });
    }

    collectWallet() {
      if (this.overworld?.hiveWalletFound) return;

      if (this.overworld) this.overworld.hiveWalletFound = true;
      this.coins += 8;
      this.syncCoinsToOverworld();
      this.updateCoinHUD();

      this.walletGraphic?.clear();
      this.walletZone?.disableInteractive();

      this.openDialog(
        "PORTEMONNAIE",
        "Du findsch es Portemonnaie am Bode. +8 Coins.",
        [
          { label: "EINSTECKEN", action: () => this.closeModal() }
        ]
      );
    }

    openBeerMenu() {
      const canBuy = this.coins >= 3;

      this.openDialog(
        "BAR",
        `Es Brouwers kostet 3 Coins.\nDu hesch ${this.coins} Coins.`,
        [
          {
            label: canBuy ? "BROUWERS TRINKE -3" : "Z'WENIG COINS",
            disabled: !canBuy,
            action: () => this.buyBrouwers()
          },
          { label: "SCHLIESSEN", action: () => this.closeModal() }
        ]
      );
    }

    buyBrouwers() {
      if (this.coins < 3 || this.actionLocked) return;

      this.coins -= 3;
      this.brouwersCount += 1;
      this.drunkLevel = Math.min(6, this.drunkLevel + 1);

      if (this.overworld) {
        this.overworld.drunkLevel = this.drunkLevel;
        this.overworld.brouwersCount = this.brouwersCount;
      }

      this.syncCoinsToOverworld();
      this.updateCoinHUD();
      setGlobalDrunkLevel(this.drunkLevel);
      this.closeModal();

      this.actionLocked = true;
      this.playSimonAction("simon-v14-drink");

      this.time.delayedCall(1200, () => {
        this.stopSimonAction();
        this.actionLocked = false;

        this.openDialog(
          "BROUWERS",
          "Simon het sis Brouwers trunke.",
          [
            { label: "NO EIS", action: () => this.openBeerMenu() },
            { label: "WEITER", action: () => this.closeModal() }
          ]
        );
      });
    }

    getOwnedFlirts() {
      const ow = this.overworld;
      if (!ow) return [];

      if (Array.isArray(ow.ownedFlirts)) return ow.ownedFlirts;
      if (Array.isArray(ow.flirtInventory)) return ow.flirtInventory;
      if (ow.hasFlirtMove || ow.hasFlirt) return ["Flirt"];
      return [];
    }

    openWomanMenu() {
      const flirts = this.getOwnedFlirts();
      const hasFlirt = flirts.length > 0;

      this.openDialog(
        "FRAU A DE BAR",
        "Was söll Simon mache?",
        [
          {
            label: "ANSPRECHEN",
            action: () => this.startRejectedDanceInvite()
          },
          {
            label: hasFlirt ? "FLIRT" : "FLIRT 🔒",
            action: () => {
              if (!hasFlirt) {
                this.openDialog(
                  "FLIRT",
                  "Dä Move muesch du später zerscht im Flirt-Shop chaufe.",
                  [
                    { label: "ZURÜCK", action: () => this.openWomanMenu() },
                    { label: "SCHLIESSEN", action: () => this.closeModal() }
                  ]
                );
                return;
              }

              // The current repository still has no implemented flirt shop and no
              // canonical flirt IDs. Do not guess permanent mappings yet.
              this.openDialog(
                "FLIRT",
                "Flirts sind im HIVE vorbereitet, aber die einzelnen gekauften Moves werden erst mit dem Flirt-Shop verknüpft.",
                [
                  { label: "ZURÜCK", action: () => this.openWomanMenu() },
                  { label: "SCHLIESSEN", action: () => this.closeModal() }
                ]
              );
            }
          },
          { label: "SCHLIESSEN", action: () => this.closeModal() }
        ]
      );
    }

    startRejectedDanceInvite() {
      this.closeModal();
      this.actionLocked = true;

      if (this.womanSprite) {
        this.womanSprite.setFlipX(this.player.x > this.womanSprite.x);
      }
      this.player.setFlipX(this.womanSprite ? this.womanSprite.x < this.player.x : false);

      this.playSimonAction("simon-v14-talk", { loop: true });
      this.showSpeechBubble(this.player, "hey süße, Witsch tanzen?", 2100);

      this.time.delayedCall(2150, () => {
        this.destroySpeechBubble();
        this.stopSimonAction();

        if (this.womanSprite?.active) {
          this.womanSprite.play("woman-v14-reject", true);
        }
        this.showSpeechBubble(this.womanSprite, "nöd mit dir.", 1900);
      });

      this.time.delayedCall(4100, () => {
        this.destroySpeechBubble();
        if (this.womanSprite?.active) {
          this.womanSprite.play("woman-v14-idle", true);
        }
        this.actionLocked = false;
      });
    }

    playSimonAction(animationKey, { loop = false } = {}) {
      if (!this.player) return;
      this.player.setScale(0.52);
      this.player.play(animationKey, true);
    }

    stopSimonAction() {
      if (!this.player) return;
      if (this.danceBobTween) {
        this.danceBobTween.stop();
        this.danceBobTween = null;
      }
      this.player.setAngle(0);
      this.player.setY(286);
      this.player.setScale(0.42);
      this.player.play("simon-idle", true);
    }

    showSpeechBubble(sprite, message, duration = 1800) {
      this.destroySpeechBubble();
      if (!sprite) return;

      const x = Phaser.Math.Clamp(sprite.x, 135, 685);
      const y = Phaser.Math.Clamp(sprite.y - 118, 58, 245);

      const text = this.add.text(0, 0, message, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "9px",
        color: "#28222a",
        align: "center",
        wordWrap: { width: 230 }
      }).setOrigin(0.5);

      const w = Math.max(150, Math.min(270, text.width + 34));
      const h = Math.max(52, text.height + 28);
      const g = this.add.graphics();
      g.fillStyle(0xfff8df, 1);
      g.lineStyle(3, 0x382d36, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.fillTriangle(-10, h / 2 - 1, 8, h / 2 - 1, 0, h / 2 + 14);
      g.lineBetween(-10, h / 2, 0, h / 2 + 14);
      g.lineBetween(0, h / 2 + 14, 8, h / 2);

      this.speechBubble = this.add.container(x, y, [g, text]).setDepth(400);

      if (duration > 0) {
        this.time.delayedCall(duration, () => {
          if (this.speechBubble?.active) this.destroySpeechBubble();
        });
      }
    }

    destroySpeechBubble() {
      if (!this.speechBubble) return;
      this.speechBubble.destroy(true);
      this.speechBubble = null;
    }

    openDialog(title, text, buttons) {
      this.closeModal();
      this.modalOpen = true;

      const root = document.getElementById("phaser-game");
      if (!root) return;

      const shade = document.createElement("div");
      shade.dataset.hiveV12 = "modal";

      Object.assign(shade.style, {
        position: "absolute",
        inset: "0",
        zIndex: "100010",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        background: "rgba(5,5,10,.72)",
        touchAction: "manipulation"
      });

      const panel = document.createElement("div");
      Object.assign(panel.style, {
        position: "relative",
        width: "min(92%, 520px)",
        maxHeight: "82%",
        overflow: "auto",
        padding: "18px 14px 14px",
        boxSizing: "border-box",
        border: "3px solid #ffe2a7",
        background: "#171621",
        color: "#f6edcf",
        fontFamily: '"Press Start 2P", monospace',
        textAlign: "center",
        boxShadow: "0 6px 0 rgba(63,42,29,.8)"
      });

      const x = document.createElement("button");
      x.type = "button";
      x.textContent = "×";
      Object.assign(x.style, {
        position: "absolute",
        right: "7px",
        top: "5px",
        width: "34px",
        height: "34px",
        border: "2px solid #806f55",
        background: "#302d34",
        color: "#fff0c8",
        fontFamily: "monospace",
        fontSize: "22px",
        lineHeight: "1",
        cursor: "pointer"
      });
      x.addEventListener("click", () => this.closeModal());

      const heading = document.createElement("div");
      heading.textContent = title;
      Object.assign(heading.style, {
        margin: "3px 34px 14px",
        fontSize: "12px",
        color: "#fff2b5"
      });

      const body = document.createElement("div");
      body.textContent = text;
      Object.assign(body.style, {
        margin: "0 0 16px",
        fontSize: "9px",
        lineHeight: "1.7",
        whiteSpace: "pre-line"
      });

      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(1, buttons.length)}, minmax(0, 1fr))`,
        gap: "8px"
      });

      buttons.forEach((config) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = config.label;

        Object.assign(button.style, {
          minWidth: "0",
          minHeight: "42px",
          padding: "7px 5px",
          border: "2px solid #806f55",
          background: config.disabled ? "#29282d" : "#302d34",
          color: config.disabled ? "#817b72" : "#fff0c8",
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          touchAction: "manipulation",
          cursor: config.disabled ? "default" : "pointer",
          opacity: config.disabled ? "0.65" : "1"
        });

        if (!config.disabled) {
          const fire = (event) => {
            event.preventDefault();
            event.stopPropagation();
            config.action?.();
          };
          button.addEventListener("click", fire);
          button.addEventListener("touchend", fire, { passive: false });
        }

        row.appendChild(button);
      });

      panel.append(x, heading, body, row);
      shade.appendChild(panel);

      shade.addEventListener("click", (event) => {
        if (event.target === shade) this.closeModal();
      });

      root.appendChild(shade);
      this.currentModal = shade;
      this.domNodes.push(shade);
    }

    closeModal() {
      if (this.currentModal) {
        this.currentModal.remove();
        this.domNodes = this.domNodes.filter((node) => node !== this.currentModal);
        this.currentModal = null;
      }
      this.modalOpen = false;
    }

    syncCoinsToOverworld() {
      if (!this.overworld) return;
      this.overworld.coins = this.coins;
      this.overworld.brouwersCount = this.brouwersCount;
      this.overworld.updateCoinHUD?.();
      this.overworld.updateInventoryUI?.();
    }

    cleanupDOM() {
      this.closeModal();
      this.domNodes.forEach((node) => node?.remove?.());
      this.domNodes = [];
      document
        .querySelectorAll("#phaser-game [data-hive-v12]")
        .forEach((node) => node.remove());
    }

    leaveHive() {
      if (this.__leaving) return;
      this.__leaving = true;

      this.syncCoinsToOverworld();
      if (this.overworld) this.overworld.drunkLevel = this.drunkLevel;
      setGlobalDrunkLevel(this.drunkLevel);
      this.destroySpeechBubble();
      this.cleanupDOM();

      const overworld = this.overworld;

      this.scene.stop();

      if (overworld?.scene) {
        overworld.scene.resume();
        overworld.player?.setVisible(true);
        if (overworld.player?.body) overworld.player.body.enable = true;
        overworld.setUILocked?.(false);
        overworld.refreshUILock?.();
        overworld.ensureTicketMachineInteractive?.();
        overworld.ensureTramBoardingInteractive?.();
        unlockHiveDoor(overworld);
      }
    }

    update(time, delta) {
      if (!this.player) return;

      if (this.modalOpen || this.introDancing || this.actionLocked) {
        return;
      }

      const left =
        Boolean(this.cursors?.left?.isDown) ||
        Boolean(this.keyA?.isDown) ||
        this.touchLeft;

      const right =
        Boolean(this.cursors?.right?.isDown) ||
        Boolean(this.keyD?.isDown) ||
        this.touchRight;

      const dance = Boolean(this.keyDance?.isDown) || this.touchDance;

      let direction = 0;
      if (left && !right) direction = -1;
      if (right && !left) direction = 1;

      this.player.x = Phaser.Math.Clamp(
        this.player.x + direction * 170 * (delta / 1000),
        68,
        782
      );

      if (direction !== 0) {
        if (this.player.anims.currentAnim?.key?.startsWith("simon-v14-")) {
          this.stopSimonAction();
        }
        this.player.setFlipX(direction < 0);
        this.player.setScale(0.42);
        this.player.play("simon-run", true);
        return;
      }

      if (dance) {
        if (this.player.anims.currentAnim?.key !== "simon-v14-dance") {
          this.playSimonAction("simon-v14-dance", { loop: true });
        }
        return;
      }

      if (this.player.anims.currentAnim?.key?.startsWith("simon-v14-")) {
        this.stopSimonAction();
      } else {
        this.player.setScale(0.42);
        this.player.play("simon-idle", true);
      }
    }
  }



  let activeSimonGame = null;
  let drunkRAFStarted = false;
  const drunkCameraBase = new WeakMap();

  function setGlobalDrunkLevel(level) {
    window.__SIMON_DRUNK_LEVEL__ = Math.max(0, Math.min(6, Number(level) || 0));
  }

  function ensureDrunkController(game) {
    activeSimonGame = game || activeSimonGame;
    if (drunkRAFStarted) return;
    drunkRAFStarted = true;

    const tick = (now) => {
      const level = Math.max(0, Number(window.__SIMON_DRUNK_LEVEL__) || 0);
      const currentGame = activeSimonGame;

      if (currentGame?.canvas) {
        currentGame.canvas.style.filter = level > 0
          ? `blur(${Math.min(1.5, level * 0.22).toFixed(2)}px) saturate(${(1 + level * 0.035).toFixed(2)})`
          : "";
      }

      if (currentGame?.scene) {
        const scenes = currentGame.scene.getScenes(true);
        scenes.forEach((scene) => {
          const camera = scene?.cameras?.main;
          if (!camera) return;

          if (!drunkCameraBase.has(camera)) {
            drunkCameraBase.set(camera, {
              zoom: camera.zoom || 1,
              rotation: camera.rotation || 0
            });
          }

          const base = drunkCameraBase.get(camera);
          if (level <= 0) {
            camera.setZoom(base.zoom);
            camera.setRotation(base.rotation);
            return;
          }

          const sway = Math.sin(now / 620) * level;
          const breathe = Math.sin(now / 930) * level;
          camera.setRotation(base.rotation + sway * 0.0027);
          camera.setZoom(base.zoom * (1 + level * 0.0025 + breathe * 0.0008));
        });
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  window.startSimonGame = function startSimonGameWithHiveV14(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (!game) return game;

    ensureDrunkController(game);

    if (!game.scene.keys.HiveInteriorScene) {
      game.scene.add("HiveInteriorScene", HiveInteriorScene, false);
    }

    waitForMilchbuckScene(game);
    return game;
  };

  function waitForMilchbuckScene(game, attempt = 0) {
    const scene =
      game.scene?.getScene("MilchbuckScene") ||
      game.scene?.getScene("PrototypeScene");

    if (scene) {
      prePatchDeveloperStart(scene);
    }

    if (scene?.player) {
      loadNewAssets(scene);
      return;
    }

    if (attempt > 240) {
      console.error("HIVE v12: MilchbuckScene wurde nicht bereit.");
      return;
    }

    window.setTimeout(() => waitForMilchbuckScene(game, attempt + 1), 25);
  }

  function prePatchDeveloperStart(scene) {
    if (scene.__hiveV12DeveloperGuard) return;
    if (typeof scene.setupDeveloperLionChoice !== "function") return;

    scene.__hiveV12DeveloperGuard = true;

    const original = scene.setupDeveloperLionChoice.bind(scene);

    scene.setupDeveloperLionChoice = function guardedDeveloperLionChoice(...args) {
      if (!this.__hiveV12AssetsReady) {
        if (!this.__hiveV12DeveloperQueued) {
          this.__hiveV12DeveloperQueued = true;
          this.time.delayedCall(100, () => {
            this.__hiveV12DeveloperQueued = false;
            this.setupDeveloperLionChoice(...args);
          });
        }
        return;
      }

      return original(...args);
    };
  }

  function loadNewAssets(scene) {
    if (scene.__hiveV12LoadStarted) return;
    scene.__hiveV12LoadStarted = true;

    const pending = [];

    if (!scene.textures.exists(BOUNCER_KEY)) {
      scene.load.spritesheet(BOUNCER_KEY, "bouncer-spritesheet-v12.png", {
        frameWidth: 140,
        frameHeight: 160
      });
      pending.push(BOUNCER_KEY);
    }

    if (!scene.textures.exists(LION_KEY)) {
      scene.load.spritesheet(LION_KEY, "lion-spritesheet-v12.png", {
        frameWidth: 150,
        frameHeight: 110
      });
      pending.push(LION_KEY);
    }

    const ready = () => {
      scene.__hiveV12AssetsReady = true;
      installIntoMilchbuck(scene);
    };

    if (pending.length === 0) {
      ready();
      return;
    }

    scene.load.once("complete", ready);
    scene.load.start();
  }

  function ensureAnimations(scene) {
    const make = (key, texture, frames, frameRate, repeat = -1) => {
      if (scene.anims.exists(key)) return;

      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(texture, { frames }),
        frameRate,
        repeat
      });
    };

    make("bouncer-v12-idle", BOUNCER_KEY, [0,1,2,3,2,1], 2.4, -1);
    make("bouncer-v12-talk", BOUNCER_KEY, [4,4,5,5,6,7,8,9,10,10,9,8,7,6,5], 2.5, -1);
    make("bouncer-v12-run", BOUNCER_KEY, [11,12,13,14,15,16], 9, -1);
    make("bouncer-v12-attack", BOUNCER_KEY, [17,18,19,20,21], 8, 0);
    make("bouncer-v12-hit", BOUNCER_KEY, [22,23], 6, 0);
    make("bouncer-v12-down", BOUNCER_KEY, [24,25,26,27], 7, 0);

    make("lion-v12-idle", LION_KEY, [0,1,2,3], 4, -1);
    make("lion-v12-run", LION_KEY, [4,5,6,7,8,9], 9.5, -1);
    make("lion-v12-attack", LION_KEY, [10,11,12,13,14,15], 9, 0);
    make("lion-v12-purr", LION_KEY, [16,17,18,17], 3.5, -1);
    make("lion-v12-dance", LION_KEY, [20,21,20,22,20,24,21,20], 4.3, -1);
  }

  function installIntoMilchbuck(scene) {
    if (scene.__hiveV12Installed) return;
    scene.__hiveV12Installed = true;

    ensureAnimations(scene);
    replaceStaticBouncer(scene);
    patchBouncerFactory(scene);
    patchLionFactory(scene);
    patchAnimationMoments(scene);
    installHiveDoor(scene);

    console.info("HIVE v14 aktiv: Woman-Sheet, Tanz, Bier & Drunk-Effect.");
  }

  function isBouncerSprite(object) {
    return Boolean(object?.__bouncerV12);
  }

  function isLionSprite(object) {
    return Boolean(object?.__lionV12);
  }

  // Both imported sheets are drawn facing RIGHT by default.
  // Always normalize negative scales left behind by older placeholder logic,
  // then use flipX as the single source of truth for direction.
  function faceX(sprite, targetX) {
    if (!sprite || !Number.isFinite(targetX)) return;

    const sx = Math.max(0.01, Math.abs(sprite.scaleX || 1));
    const sy = Math.max(0.01, Math.abs(sprite.scaleY || 1));
    sprite.setScale(sx, sy);
    sprite.setFlipX(targetX < sprite.x);
  }

  function faceToward(sprite, target) {
    if (!sprite || !target) return;
    faceX(sprite, target.x);
  }

  function faceEachOther(first, second) {
    if (!first || !second) return;
    faceToward(first, second);
    faceToward(second, first);
  }

  function replaceStaticBouncer(scene) {
    const old = scene.bouncer;

    if (!old || isBouncerSprite(old)) return;

    const x = old.x;
    const y = old.y - 4;
    const depth = old.depth || 12;

    scene.tweens.killTweensOf(old);
    old.removeAllListeners?.();
    old.destroy?.(true);

    const sprite = scene.add.sprite(x, y, BOUNCER_KEY, 0)
      .setDepth(depth)
      .setSize(88, 148)
      .setInteractive({ useHandCursor: true });

    sprite.__bouncerV12 = true;
    sprite.setFlipX(true);
    sprite.play("bouncer-v12-idle");

    sprite.on("pointerdown", (pointer) => {
      pointer.event?.preventDefault?.();
      scene.startBouncerDialogue();
    });

    sprite.on("pointerover", () => {
      if (!scene.bouncerDialogueActive && !scene.ticketModal) {
        sprite.setScale(1.04);
      }
    });

    sprite.on("pointerout", () => sprite.setScale(1));

    scene.bouncer = sprite;
  }

  function patchBouncerFactory(scene) {
    if (scene.__hiveV12BouncerFactory) return;
    if (typeof scene.createFightBouncer !== "function") return;

    scene.__hiveV12BouncerFactory = true;

    scene.createFightBouncer = function createFightBouncerV12(x, y) {
      const sprite = this.add.sprite(x, y - 5, BOUNCER_KEY, 17)
        .setDepth(13)
        .setSize(78, 140);

      sprite.__bouncerV12 = true;
      sprite.setFlipX(false);
      sprite.play("bouncer-v12-run");
      return sprite;
    };
  }

  function patchLionFactory(scene) {
    if (scene.__hiveV12LionFactory) return;
    if (typeof scene.createLion !== "function") return;

    scene.__hiveV12LionFactory = true;

    scene.createLion = function createLionV12(x, y) {
      const sprite = this.add.sprite(x, y, LION_KEY, 0)
        .setDepth(14)
        .setSize(120, 92);

      sprite.__lionV12 = true;
      sprite.setFlipX(true);
      sprite.play("lion-v12-idle");
      return sprite;
    };
  }

  function patchAnimationMoments(scene) {
    if (scene.__hiveV12MomentsPatched) return;
    scene.__hiveV12MomentsPatched = true;

    if (typeof scene.showBouncerDialogueStep === "function") {
      const original = scene.showBouncerDialogueStep.bind(scene);
      scene.showBouncerDialogueStep = function (...args) {
        faceEachOther(this.bouncer, this.player);
        const result = original(...args);
        if (isBouncerSprite(this.bouncer)) {
          faceEachOther(this.bouncer, this.player);
          this.bouncer.play("bouncer-v12-talk", true);
        }
        return result;
      };
    }

    if (typeof scene.startFightSequence === "function") {
      const original = scene.startFightSequence.bind(scene);
      scene.startFightSequence = function (...args) {
        const result = original(...args);

        this.fightBouncers.forEach((guard) => {
          if (isBouncerSprite(guard)) {
            guard.setAngle(0);
            guard.setFlipX(false);
            guard.play("bouncer-v12-run", true);
          }
        });

        this.time.delayedCall(1280, () => {
          if (isLionSprite(this.fightLion)) {
            const nearestGuard = this.fightBouncers
              .filter((guard) => guard?.active)
              .sort((a, b) => Math.abs(a.x - this.fightLion.x) - Math.abs(b.x - this.fightLion.x))[0];

            if (nearestGuard) faceEachOther(this.fightLion, nearestGuard);
            else faceX(this.fightLion, this.fightLion.x - 100);

            this.fightBouncers.forEach((guard) => {
              if (isBouncerSprite(guard) && guard.active) {
                faceToward(guard, this.fightLion);
              }
            });

            this.fightLion.play("lion-v12-run", true);
          }
        });

        return result;
      };
    }

    if (typeof scene.runFightRounds === "function") {
      const original = scene.runFightRounds.bind(scene);
      scene.runFightRounds = function (...args) {
        this.fightBouncers.forEach((guard) => {
          if (isBouncerSprite(guard)) {
            faceToward(guard, this.fightLion);
            guard.play("bouncer-v12-attack", true);
          }
        });

        if (isLionSprite(this.fightLion)) {
          const nearestGuard = this.fightBouncers
            .filter((guard) => guard?.active)
            .sort((a, b) => Math.abs(a.x - this.fightLion.x) - Math.abs(b.x - this.fightLion.x))[0];
          if (nearestGuard) faceEachOther(this.fightLion, nearestGuard);
          this.fightLion.play("lion-v12-idle", true);
        }

        return original(...args);
      };
    }

    if (typeof scene.knockOutNextBouncer === "function") {
      const original = scene.knockOutNextBouncer.bind(scene);
      scene.knockOutNextBouncer = function (order, index) {
        const guard = order?.[index];

        if (isBouncerSprite(guard)) {
          faceToward(guard, this.fightLion);
          guard.play("bouncer-v12-run", true);

          this.time.delayedCall(315, () => {
            if (guard.active) {
              faceToward(guard, this.fightLion);
              guard.play("bouncer-v12-attack", true);
            }
          });

          this.time.delayedCall(535, () => {
            if (guard.active) {
              faceToward(guard, this.fightLion);
              guard.play("bouncer-v12-hit", true);
            }
          });
        }

        this.time.delayedCall(455, () => {
          if (isLionSprite(this.fightLion) && this.fightLion.active) {
            if (guard?.active) faceEachOther(this.fightLion, guard);
            this.fightLion.play("lion-v12-attack", true);
          }
        });

        this.time.delayedCall(980, () => {
          if (isLionSprite(this.fightLion) && this.fightLion.active) {
            this.fightLion.play("lion-v12-idle", true);
          }
        });

        return original(order, index);
      };
    }

    if (typeof scene.makeDeadBouncersLootable === "function") {
      const original = scene.makeDeadBouncersLootable.bind(scene);
      scene.makeDeadBouncersLootable = function (...args) {
        const result = original(...args);

        this.fightBouncers.forEach((guard, index) => {
          if (!isBouncerSprite(guard) || !guard.active) return;

          this.tweens.killTweensOf(guard);
          guard.anims.stop();
          guard.setFrame(index % 2 === 0 ? 26 : 27);
          guard.setAngle(0);
          guard.setScale(1);
          guard.setY(GROUND_TOP - 75);
          guard.setDepth(18);
        });

        return result;
      };
    }

    if (typeof scene.finishFightSequence === "function") {
      const original = scene.finishFightSequence.bind(scene);
      scene.finishFightSequence = function (...args) {
        const result = original(...args);

        this.time.delayedCall(780, () => {
          if (isLionSprite(this.fightLion) && this.fightLion.active) {
            this.fightLion.setScale(1);
            this.fightLion.setAngle(0);
            faceEachOther(this.fightLion, this.player);
            this.fightLion.play("lion-v12-purr", true);
          }
        });

        return result;
      };
    }

    if (typeof scene.setupDeveloperLionChoice === "function") {
      const current = scene.setupDeveloperLionChoice.bind(scene);
      scene.setupDeveloperLionChoice = function (...args) {
        const result = current(...args);

        this.time.delayedCall(220, () => {
          if (isLionSprite(this.fightLion) && this.fightLion.active) {
            this.fightLion.setScale(1);
            this.fightLion.setAngle(0);
            faceEachOther(this.fightLion, this.player);
            this.fightLion.play("lion-v12-purr", true);
          }
        });

        return result;
      };
    }

    if (typeof scene.showLionChoiceQuestion === "function") {
      const original = scene.showLionChoiceQuestion.bind(scene);
      scene.showLionChoiceQuestion = function (...args) {
        faceEachOther(this.fightLion, this.player);
        const result = original(...args);
        faceEachOther(this.fightLion, this.player);
        return result;
      };
    }

    if (typeof scene.startLionCombat === "function") {
      const original = scene.startLionCombat.bind(scene);
      scene.startLionCombat = function (...args) {
        const result = original(...args);
        if (isLionSprite(this.fightLion)) {
          faceEachOther(this.fightLion, this.player);
          this.fightLion.play("lion-v12-run", true);
        }
        return result;
      };
    }

    if (typeof scene.updateLionCombat === "function") {
      const original = scene.updateLionCombat.bind(scene);
      scene.updateLionCombat = function (...args) {
        const result = original(...args);

        if (this.lionCombatActive && isLionSprite(this.fightLion)) {
          faceToward(this.fightLion, this.player);
        }

        return result;
      };
    }

    if (typeof scene.applyPlayerDamage === "function") {
      const original = scene.applyPlayerDamage.bind(scene);
      scene.applyPlayerDamage = function (amount) {
        if (isLionSprite(this.fightLion)) {
          faceToward(this.fightLion, this.player);
          this.fightLion.play("lion-v12-attack", true);
          this.time.delayedCall(560, () => {
            if (
              this.lionCombatActive &&
              isLionSprite(this.fightLion) &&
              this.fightLion.active
            ) {
              this.fightLion.play("lion-v12-run", true);
            }
          });
        }

        return original(amount);
      };
    }

    // YES still routes through chooseDanceWithLion -> enterHiveDance.
    scene.enterHiveDance = function enterHiveV12() {
      unlockHiveDoor(this);
      launchHiveInterior(this, true);
    };

    // NO: lion goes into the club; HIVE remains clickable afterwards.
    scene.chooseNoDance = function chooseNoDanceV12() {
      if (!this.fightLion || this.playerDying) return;

      this.clearLionQuestion?.();
      this.stopLionPurring?.();

      this.lionExitActive = true;
      unlockHiveDoor(this);
      this.refreshUILock?.();

      const lion = this.fightLion;
      faceX(lion, 1700);
      lion.play?.("lion-v12-run", true);

      this.tweens.add({
        targets: lion,
        x: 1700,
        y: 275,
        scale: 0.62,
        alpha: 0,
        duration: 850,
        ease: "Sine.easeInOut",
        onComplete: () => {
          lion.destroy?.();
          this.fightLion = null;
          this.lionExitActive = false;
          this.refreshUILock?.();
          this.ensureTicketMachineInteractive?.();
          this.ensureTramBoardingInteractive?.();
          unlockHiveDoor(this);
        }
      });
    };
  }

  function installHiveDoor(scene) {
    if (scene.__hiveV12DoorZone) return;

    const zone = scene.add.zone(1700, 282, 100, 116)
      .setDepth(90)
      .setInteractive({ useHandCursor: true });

    zone.input.enabled = false;

    const label = scene.add.text(1700, 208, "HIVE ↥", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#ffe6a5",
      backgroundColor: "#34203f",
      padding: { x: 6, y: 5 }
    })
      .setOrigin(0.5)
      .setDepth(91)
      .setVisible(false);

    zone.on("pointerup", () => {
      if (!scene.hiveEntranceUnlocked || scene.playerDying) return;
      launchHiveInterior(scene, false);
    });

    scene.__hiveV12DoorZone = zone;
    scene.__hiveV12DoorLabel = label;
  }

  function unlockHiveDoor(scene) {
    scene.hiveEntranceUnlocked = true;

    if (scene.__hiveV12DoorZone?.input) {
      scene.__hiveV12DoorZone.input.enabled = true;
    }

    scene.__hiveV12DoorLabel?.setVisible(true);
  }

  function launchHiveInterior(scene, simonDances) {
    if (!scene?.game || scene.game.scene.isActive("HiveInteriorScene")) return;

    scene.clearLionQuestion?.();
    scene.stopLionPurring?.();

    // The lion stays in the HIVE instead of remaining on the street.
    if (scene.fightLion) {
      scene.tweens.killTweensOf(scene.fightLion);
      scene.fightLion.destroy?.();
      scene.fightLion = null;
    }

    unlockHiveDoor(scene);

    scene.setUILocked?.(true);
    scene.scene.pause();

    scene.game.scene.start("HiveInteriorScene", {
      overworld: scene,
      simonDances: Boolean(simonDances)
    });
  }
})();