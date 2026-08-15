(() => {
  "use strict";
  if (window.__SIMON_HIVE_EXPANSION_V9__) return;
  window.__SIMON_HIVE_EXPANSION_V9__ = true;

  const originalStartSimonGame = window.startSimonGame;
  if (typeof originalStartSimonGame !== "function") {
    console.error("Hive-Expansion v9: startSimonGame wurde nicht gefunden.");
    return;
  }

  class HiveInteriorScene extends Phaser.Scene {
    constructor() {
      super("HiveInteriorScene");
      this.overworld = null;
      this.player = null;
      this.floor = 330;
      this.touchLeft = false;
      this.touchRight = false;
      this.modalOpen = false;
      this.currentDomOverlay = null;
      this.walletFound = false;
      this.walletSprite = null;
      this.statusText = null;
    }

    init(data) {
      this.overworld = data?.overworld || null;
      this.openedFromLionChoice = Boolean(data?.fromLionChoice);
    }

    preload() {
      if (!this.textures.exists("bouncer-sheet")) {
        this.load.spritesheet("bouncer-sheet", "bouncer-spritesheet.png", { frameWidth: 240, frameHeight: 280 });
      }
      if (!this.textures.exists("lion-sheet")) {
        this.load.spritesheet("lion-sheet", "lion-spritesheet.png", { frameWidth: 240, frameHeight: 280 });
      }
    }

    create() {
      this.input.addPointer(3);
      this.ensureAnimations();
      this.createRoom();
      this.createPlayer();
      this.createTouchControls();
      this.statusText = this.add.text(410, 380, 'Tippe Bar, Frau, Portemonnaie oder RAUS', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#e5d8bd'
      }).setOrigin(0.5, 1).setDepth(210);
      this.events.once("shutdown", () => this.cleanupDOM());
      this.events.once("destroy", () => this.cleanupDOM());
    }

    ensureAnimations() {
      const make = (key, texture, frameConfig, frameRate, repeat = -1) => {
        if (this.anims.exists(key) || !this.textures.exists(texture)) return;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, frameConfig),
          frameRate,
          repeat
        });
      };
      if (!this.anims.exists('simon-idle') && this.textures.exists('simon')) {
        this.anims.create({ key: 'simon-idle', frames: this.anims.generateFrameNumbers('simon', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
      }
      if (!this.anims.exists('simon-run') && this.textures.exists('simon')) {
        this.anims.create({ key: 'simon-run', frames: this.anims.generateFrameNumbers('simon', { start: 8, end: 17 }), frameRate: 12, repeat: -1 });
      }
      make('bouncer-idle', 'bouncer-sheet', { start: 0, end: 3 }, 5, -1);
      make('bouncer-walk', 'bouncer-sheet', { start: 12, end: 17 }, 10, -1);
      make('bouncer-guard', 'bouncer-sheet', { frames: [6, 7, 6, 8] }, 4, -1);
      make('lion-idle', 'lion-sheet', { start: 0, end: 3 }, 5, -1);
      make('lion-dance', 'lion-sheet', { frames: [24, 25, 24, 25, 24, 28] }, 4, -1);
    }

    createRoom() {
      const g = this.add.graphics();
      g.fillStyle(0x120f1a, 1); g.fillRect(0, 0, 820, 390);
      g.fillStyle(0x1c1626, 1); g.fillRect(0, 0, 820, 70);
      g.fillStyle(0x2a1f2e, 1); g.fillRect(0, 70, 820, 170);
      g.fillStyle(0x201823, 1); g.fillRect(0, 240, 820, 150);
      g.fillStyle(0x3f2d2b, 1); g.fillRect(0, 320, 820, 70);
      g.fillStyle(0x5d3f34, 1); for (let x=0; x<820; x+=40) g.fillRect(x, 320, 20, 70);
      this.add.text(410, 30, 'HIVE', { fontFamily: '"Press Start 2P", monospace', fontSize: '22px', color: '#fff5b5', stroke: '#7727a8', strokeThickness: 6 }).setOrigin(0.5);

      const lights = this.add.graphics();
      lights.fillStyle(0xff4e92, 0.12); lights.fillTriangle(100, 70, 0, 320, 220, 320);
      lights.fillStyle(0x45d8ff, 0.12); lights.fillTriangle(410, 70, 260, 320, 560, 320);
      lights.fillStyle(0xc876ff, 0.10); lights.fillTriangle(720, 70, 600, 320, 820, 320);

      const floor = this.add.graphics();
      const danceTiles = [0x6f2f7d, 0x23486a, 0x7d4f2f, 0x2c6f53]; let idx = 0;
      for (let y = 210; y < 320; y += 36) for (let x = 250; x < 540; x += 36) {
        floor.fillStyle(danceTiles[idx % danceTiles.length], 0.95); floor.fillRect(x, y, 32, 32); idx += 1;
      }

      const bar = this.add.graphics();
      bar.fillStyle(0x5b3a2d, 1); bar.fillRect(560, 110, 220, 24);
      bar.fillStyle(0x6f4736, 1); bar.fillRect(560, 134, 220, 62);
      bar.fillStyle(0x41251b, 1); bar.fillRect(565, 138, 210, 6);
      bar.fillStyle(0x2e1912, 1); bar.fillRect(560, 195, 220, 6);
      this.add.text(670, 96, 'BROUWERS', { fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffe7a6' }).setOrigin(0.5);

      const shelf = this.add.graphics();
      shelf.fillStyle(0x2b1b1b, 1); shelf.fillRect(590, 64, 150, 8);
      const bottleColors = [0x4b7a4e, 0x7a4b4b, 0x476b90, 0xa1823a];
      for (let i=0;i<8;i++) {
        shelf.fillStyle(bottleColors[i % bottleColors.length], 1); shelf.fillRect(598 + i*18, 42 + (i%2)*3, 8, 22);
        shelf.fillStyle(0xd9d1b0, 1); shelf.fillRect(600 + i*18, 38 + (i%2)*3, 4, 4);
      }
      const stools = this.add.graphics();
      [590, 640, 690].forEach((x) => { stools.fillStyle(0x7a5039, 1); stools.fillRect(x, 226, 24, 8); stools.fillStyle(0x3e251a, 1); stools.fillRect(x+4, 234, 4, 32); stools.fillRect(x+16, 234, 4, 32); });

      this.add.text(780, 30, 'RAUS', { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#e8f7d6' }).setOrigin(0.5);
      this.add.rectangle(780, 30, 70, 28, 0x204f25).setStrokeStyle(2, 0xd8f1bf).setDepth(-1);
      this.add.zone(780, 30, 90, 40).setInteractive({ useHandCursor: true }).on('pointerup', () => this.leaveHive());

      const lion = this.add.sprite(404, 266, 'lion-sheet', 24).setScale(0.42).setDepth(40).play('lion-dance');
      this.tweens.add({ targets: lion, y: '-=8', duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: lion, angle: { from: -7, to: 7 }, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      this.createDancer(290, 292, 0x5b8ad2);
      this.createDancer(510, 294, 0xe07d9c);
      this.createDancer(345, 306, 0x7fc282);

      this.createBarWoman(650, 222);
      this.add.zone(650, 195, 70, 100).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openWomanDialog());
      this.add.zone(734, 168, 86, 110).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openBeerDialog());

      this.walletFound = Boolean(this.overworld?.walletFound);
      const walletG = this.add.graphics().setDepth(6);
      walletG.fillStyle(0x6a4928, this.walletFound ? 0.18 : 0.38); walletG.fillRect(140, 300, 20, 12);
      walletG.fillStyle(0x8f6a3c, this.walletFound ? 0.18 : 0.38); walletG.fillRect(142, 302, 16, 8);
      walletG.fillStyle(0xe2d2a3, this.walletFound ? 0.18 : 0.38); walletG.fillRect(149, 303, 4, 6);
      this.walletSprite = walletG;
      const walletZone = this.add.zone(150, 306, 36, 28).setInteractive({ useHandCursor: true });
      walletZone.on('pointerup', () => this.collectWallet(walletZone));
    }

    createDancer(x, y, color) {
      const c = this.add.container(x, y).setDepth(35);
      const g = this.add.graphics();
      g.fillStyle(0xf4cfb0, 1); g.fillCircle(0, -32, 10);
      g.fillStyle(color, 1); g.fillRect(-10, -22, 20, 28);
      g.fillStyle(0x2b2030, 1); g.fillRect(-10, 6, 8, 22); g.fillRect(2, 6, 8, 22);
      g.fillStyle(0xf4cfb0, 1); g.fillRect(-16, -18, 6, 18); g.fillRect(10, -18, 6, 18);
      c.add(g);
      this.tweens.add({ targets: c, y: y - 9, duration: 320 + ((x+y)%3)*90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: c, angle: { from: -8, to: 8 }, duration: 360 + ((x+y)%4)*70, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return c;
    }

    createBarWoman(x, y) {
      const c = this.add.container(x, y).setDepth(38);
      const stool = this.add.graphics(); stool.fillStyle(0x7a5039, 1); stool.fillRect(-15, 14, 28, 8); stool.fillStyle(0x3e251a, 1); stool.fillRect(-10, 22, 4, 18); stool.fillRect(6, 22, 4, 18);
      const g = this.add.graphics();
      g.fillStyle(0x6b3a1f, 1); g.fillRect(-10, -47, 20, 10);
      g.fillStyle(0xf2c9ae, 1); g.fillCircle(0, -28, 11);
      g.fillStyle(0x934f7b, 1); g.fillRect(-12, -16, 24, 24);
      g.fillStyle(0x3f2744, 1); g.fillRect(-10, 8, 8, 18); g.fillRect(2, 8, 8, 18);
      g.fillStyle(0xf2c9ae, 1); g.fillRect(10, -10, 14, 5);
      c.add([stool, g]);
      this.tweens.add({ targets: c, y: y - 2, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    createPlayer() {
      this.physics.world.setBounds(0, 0, 820, 390);
      this.player = this.physics.add.sprite(120, this.floor - 20, 'simon', 0).setScale(0.42).setCollideWorldBounds(true).setDepth(50);
      this.player.body.setGravityY(0); this.player.body.setSize(88, 205); this.player.body.setOffset(76, 66); this.player.play('simon-idle');
      if (this.input.keyboard) { this.cursors = this.input.keyboard.createCursorKeys(); this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); }
    }

    createTouchControls() {
      const makeButton = (x, y, label, onDown, onUp) => {
        const bg = this.add.rectangle(x, y, 56, 56, 0x151723, 0.78).setScrollFactor(0).setStrokeStyle(3, 0xffffff, 0.6).setDepth(200).setInteractive();
        const txt = this.add.text(x, y, label, { fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        bg.on('pointerdown', () => { bg.setFillStyle(0x3346bf, 0.92); onDown?.(); });
        const release = () => { bg.setFillStyle(0x151723, 0.78); onUp?.(); };
        bg.on('pointerup', release); bg.on('pointerout', release);
      };
      makeButton(58, 346, '←', () => this.touchLeft = true, () => this.touchLeft = false);
      makeButton(126, 346, '→', () => this.touchRight = true, () => this.touchRight = false);
    }

    setStatus(msg) { if (this.statusText) this.statusText.setText(msg); }
    syncOverworldCoins() {
      const ow = this.overworld; if (!ow) return;
      if (ow.coinText && typeof ow.coinText.setText === 'function') ow.coinText.setText(`Coins: ${ow.coins}`);
      if (typeof ow.refreshItemsModal === 'function') try { ow.refreshItemsModal(); } catch (_) {}
      if (typeof ow.refreshHotbar === 'function') try { ow.refreshHotbar(); } catch (_) {}
    }
    addCoins(amount, reason = '') {
      if (!this.overworld) return;
      this.overworld.coins = Math.max(0, (this.overworld.coins || 0) + amount); this.syncOverworldCoins();
      const prefix = amount >= 0 ? '+' : ''; this.setStatus(`${prefix}${amount} Coins ${reason}`.trim());
      const pop = this.add.text(this.player.x, this.player.y - 80, `${prefix}${amount}`, { fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: amount >= 0 ? '#c0f7b5' : '#ffb4b4', stroke: '#1b1522', strokeThickness: 4 }).setOrigin(0.5).setDepth(220);
      this.tweens.add({ targets: pop, y: pop.y - 28, alpha: 0, duration: 900, onComplete: () => pop.destroy() });
    }
    collectWallet(walletZone) {
      if (this.walletFound || this.overworld?.walletFound) { this.setStatus('Du hesch ds Portemonnaie scho gfunde.'); return; }
      this.walletFound = true; if (this.overworld) this.overworld.walletFound = true; walletZone.disableInteractive();
      this.walletSprite.clear();
      this.walletSprite.fillStyle(0x6a4928, 0.15); this.walletSprite.fillRect(140, 300, 20, 12);
      this.walletSprite.fillStyle(0x8f6a3c, 0.15); this.walletSprite.fillRect(142, 302, 16, 8);
      this.walletSprite.fillStyle(0xe2d2a3, 0.15); this.walletSprite.fillRect(149, 303, 4, 6);
      this.addCoins(8, 'gfunde!');
    }
    openBeerDialog() {
      const enough = (this.overworld?.coins || 0) >= 3;
      this.openMenu('Bar', 'A de Bar chasch es Brouwers kaufe.', [
        { label: enough ? 'BROUWERS -3' : 'BROUWERS (ZU TÜR)', color: enough ? '#bfe4ff' : '#f0c4c4', onClick: () => {
          if ((this.overworld?.coins || 0) < 3) return this.openMenu('Bar', 'Dir fähled Coins für es Brouwers.', [{ label: 'OK', color: '#fff0c8', onClick: () => this.closeMenu() }]);
          this.addCoins(-3, 'für es Brouwers');
          this.openMenu('Bar', 'Du chaufsch es Brouwers. Sehr guet.', [{ label: 'OK', color: '#fff0c8', onClick: () => this.closeMenu() }]);
        }},
        { label: 'SCHLIESSEN', color: '#fff0c8', onClick: () => this.closeMenu() }
      ]);
    }
    openWomanDialog() {
      const flirtOwned = Boolean(this.overworld?.flirtOwned || this.overworld?.hasFlirt || this.overworld?.hasFlirtMove);
      this.openMenu('Frau a de Bar', 'Sie luegt kurz zu dir.', [
        { label: 'HEY', color: '#c7f1ff', onClick: () => this.openMenu('Frau a de Bar', 'Simon: "Hey."\nSie: "Hey."', [ { label: 'FERTIG', color: '#fff0c8', onClick: () => this.closeMenu() } ]) },
        { label: flirtOwned ? 'FLIRT' : 'FLIRT (LOCKED)', color: flirtOwned ? '#ffcfde' : '#d8c6cf', onClick: () => {
          if (!flirtOwned) return this.openMenu('Frau a de Bar', 'Dafür bruchsch zerscht en Flirt us em Flirt-Shop.', [{ label: 'OK', color: '#fff0c8', onClick: () => this.closeMenu() }]);
          this.openMenu('Frau a de Bar', 'Simon setzt sin Flirt i.\nSie lächlet chli.', [{ label: 'OK', color: '#fff0c8', onClick: () => this.closeMenu() }]);
        }},
        { label: 'SCHLIESSEN', color: '#fff0c8', onClick: () => this.closeMenu() }
      ]);
    }
    openMenu(title, text, buttons) {
      this.cleanupDOM(); this.modalOpen = true;
      const parent = document.getElementById('phaser-game'); if (!parent) return;
      const overlay = document.createElement('div'); overlay.dataset.hiveModal = 'true';
      Object.assign(overlay.style, { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'min(92%, 520px)', background: 'rgba(18,19,28,.96)', border: '3px solid rgba(255,231,168,.92)', boxShadow: '0 6px 0 rgba(59,41,27,.82)', padding: '14px', zIndex: '99999', color: '#f6edcf', fontFamily: '"Press Start 2P", monospace', boxSizing: 'border-box' });
      const titleEl = document.createElement('div'); titleEl.textContent = title; Object.assign(titleEl.style, { fontSize: '12px', marginBottom: '12px', color: '#fff4bc' });
      const textEl = document.createElement('div'); textEl.textContent = text; Object.assign(textEl.style, { fontSize: '10px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '14px' });
      const row = document.createElement('div'); Object.assign(row.style, { display: 'grid', gap: '8px', gridTemplateColumns: `repeat(${Math.max(1, buttons.length)}, minmax(0, 1fr))` });
      buttons.forEach((btnCfg) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = btnCfg.label;
        Object.assign(button.style, { minWidth: '0', height: '42px', padding: '0 6px', border: '2px solid rgba(255,231,168,.65)', borderRadius: '4px', background: '#302d34', color: btnCfg.color || '#fff0c8', fontFamily: '"Press Start 2P", monospace', fontSize: '9px', lineHeight: '1', cursor: 'pointer', touchAction: 'manipulation', boxSizing: 'border-box' });
        const activate = (e) => { e?.preventDefault?.(); e?.stopPropagation?.(); button.style.background = '#5a5360'; setTimeout(() => btnCfg.onClick?.(), 20); };
        button.addEventListener('touchend', activate, { passive: false }); button.addEventListener('pointerup', activate, { passive: false }); button.addEventListener('click', activate, { passive: false }); row.appendChild(button);
      });
      overlay.append(titleEl, textEl, row);
      ['touchstart','touchend','pointerdown','pointerup','click'].forEach((type) => overlay.addEventListener(type, (e) => e.stopPropagation(), { passive: type === 'touchstart' }));
      parent.appendChild(overlay); this.currentDomOverlay = overlay;
    }
    closeMenu() { this.cleanupDOM(); this.modalOpen = false; this.setStatus('Tippe Bar, Frau, Portemonnaie oder RAUS'); }
    cleanupDOM() { if (this.currentDomOverlay) { this.currentDomOverlay.remove(); this.currentDomOverlay = null; } const parent = document.getElementById('phaser-game'); if (parent) parent.querySelectorAll('[data-hive-modal="true"]').forEach((node) => node.remove()); }
    leaveHive() { this.closeMenu(); this.scene.stop('HiveInteriorScene'); if (this.overworld) { this.overworld.scene.resume(); if (typeof this.overworld.refreshUILock === 'function') try { this.overworld.refreshUILock(); } catch (_) {} } }
    update() {
      if (!this.player || !this.player.body) return;
      if (this.modalOpen) { this.player.setVelocityX(0); if (this.player.anims.currentAnim?.key !== 'simon-idle') this.player.play('simon-idle', true); return; }
      const left = Boolean(this.cursors?.left?.isDown || this.keyA?.isDown || this.touchLeft);
      const right = Boolean(this.cursors?.right?.isDown || this.keyD?.isDown || this.touchRight);
      let dir = 0; if (left && !right) dir = -1; if (right && !left) dir = 1;
      this.player.setVelocityX(dir * 170); if (dir < 0) this.player.setFlipX(true); if (dir > 0) this.player.setFlipX(false); if (dir === 0) this.player.play('simon-idle', true); else this.player.play('simon-run', true);
    }
  }

  window.startSimonGame = function (...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (!game) return game;
    if (!game.scene.keys['HiveInteriorScene']) game.scene.add('HiveInteriorScene', HiveInteriorScene, false);
    waitForMilchbuckScene(game);
    return game;
  };

  function waitForMilchbuckScene(game, attempt = 0) {
    const scene = game.scene?.getScene('MilchbuckScene') || game.scene?.getScene('PrototypeScene');
    if (scene?.player?.body) return prepareExpansion(scene);
    if (attempt >= 180) return console.error('Hive-Expansion v9: Szene nicht bereit.');
    setTimeout(() => waitForMilchbuckScene(game, attempt + 1), 50);
  }

  function prepareExpansion(scene) {
    if (scene.__hiveExpansionPreparedV9) return;
    scene.__hiveExpansionPreparedV9 = true;
    const pending = [];
    if (!scene.textures.exists('bouncer-sheet')) { scene.load.spritesheet('bouncer-sheet', 'bouncer-spritesheet.png', { frameWidth: 240, frameHeight: 280 }); pending.push('bouncer'); }
    if (!scene.textures.exists('lion-sheet')) { scene.load.spritesheet('lion-sheet', 'lion-spritesheet.png', { frameWidth: 240, frameHeight: 280 }); pending.push('lion'); }
    const done = () => installHooks(scene);
    if (pending.length === 0) done(); else { scene.load.once('complete', done); scene.load.start(); }
  }

  function installHooks(scene) {
    ensureNewAnimations(scene); patchCreateLion(scene); patchDanceEntry(scene); installHiveEntryZone(scene); replaceStaticBouncerIfPresent(scene);
  }
  function ensureNewAnimations(scene) {
    const make = (key, texture, frameConfig, frameRate, repeat = -1) => { if (scene.anims.exists(key) || !scene.textures.exists(texture)) return; scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(texture, frameConfig), frameRate, repeat }); };
    make('bouncer-idle', 'bouncer-sheet', { start: 0, end: 3 }, 5, -1);
    make('bouncer-guard', 'bouncer-sheet', { frames: [6, 7, 6, 8] }, 4, -1);
    make('lion-idle', 'lion-sheet', { start: 0, end: 3 }, 5, -1);
  }
  function patchCreateLion(scene) {
    if (typeof scene.createLion !== 'function' || scene.__lionCreatePatchedV9) return;
    scene.__lionCreatePatchedV9 = true;
    scene.createLion = function (x, y) { return this.add.sprite(x, y, 'lion-sheet', 0).setOrigin(0.5, 1).setScale(0.42).setDepth(55).play('lion-idle'); };
  }
  function replaceStaticBouncerIfPresent(scene) {
    if (!scene.bouncer || scene.__staticBouncerReplacedV9 || !scene.textures.exists('bouncer-sheet')) return;
    scene.__staticBouncerReplacedV9 = true;
    const ref = scene.bouncer;
    try { ref.setVisible(false); } catch (_) {}
    scene.add.sprite(ref.x, ref.y, 'bouncer-sheet', 6).setOrigin(0.5, 1).setScale(0.42).setDepth((ref.depth || 50) + 1).play('bouncer-guard');
  }
  function patchDanceEntry(scene) {
    if (scene.__enterHivePatchedV9) return;
    scene.__enterHivePatchedV9 = true;
    scene.enterHiveDance = function () { launchHiveInterior(this, true); };
  }
  function installHiveEntryZone(scene) {
    if (scene.__hiveEntryInstalledV9) return;
    scene.__hiveEntryInstalledV9 = true;
    const zone = scene.add.zone(1840, 245, 180, 150).setOrigin(0.5).setDepth(80).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => {
      if (scene.playerDying) return;
      if (!scene.fightFinished && !scene.lionChoiceShown && !scene.fightLion) return;
      launchHiveInterior(scene, false);
    });
    scene.add.text(1840, 165, 'HIVE', { fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffe8a8', stroke: '#4b225f', strokeThickness: 4 }).setOrigin(0.5).setDepth(81).setAlpha(0.92);
  }
  function launchHiveInterior(scene, fromLionChoice) {
    if (scene.game.scene.isActive('HiveInteriorScene')) return;
    if (typeof scene.clearLionQuestion === 'function') try { scene.clearLionQuestion(); } catch (_) {}
    if (typeof scene.stopLionPurring === 'function') try { scene.stopLionPurring(); } catch (_) {}
    scene.scene.pause();
    scene.game.scene.start('HiveInteriorScene', { overworld: scene, fromLionChoice });
  }
})();
