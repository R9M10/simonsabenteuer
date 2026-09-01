
(() => {
  "use strict";

  if (window.__SIMON_WORLD_POLISH_V70__) return;
  window.__SIMON_WORLD_POLISH_V70__ = true;

  const VERSION = 70;
  const GROUND_TOP = 338;
  const OERLIKON_POS = Object.freeze({
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

  function getScene(key) {
    try {
      return getGame()?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function safeRemove(obj) {
    try {
      obj?.destroy?.();
    } catch {}
  }

  function patchOnce(holder, key, factory) {
    if (!holder || holder[key]) return holder?.[key] || false;
    holder[key] = factory();
    return holder[key];
  }

  function getSceneWidth(scene, fallback = 3200) {
    return (
      Number(scene?.physics?.world?.bounds?.width) ||
      Number(scene?.cameras?.main?.getBounds?.()?.width) ||
      fallback
    );
  }

  function addCleanup(scene, obj) {
    if (!scene || !obj) return obj;
    scene.events?.once?.('shutdown', () => safeRemove(obj));
    return obj;
  }

  function showThought(scene, text) {
    if (!scene?.add) return;

    safeRemove(scene.__worldThoughtV70);

    const x = Number(scene.player?.x) || 410;
    const y = Math.max(70, (Number(scene.player?.y) || 235) - 110);
    const note = scene.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#362d26',
      backgroundColor: '#fff3da',
      padding: { x: 8, y: 7 },
      wordWrap: { width: 210 }
    }).setOrigin(0.5).setDepth(900);

    scene.__worldThoughtV70 = note;

    scene.tweens?.add?.({
      targets: note,
      alpha: 0,
      delay: 1300,
      duration: 350,
      onComplete: () => safeRemove(note)
    });
  }

  function drawMountainSky(scene, width, tones = {}) {
    const g = scene.add.graphics().setDepth(-120);

    const skyTop = tones.skyTop || 0x8cb8ca;
    const skyMid = tones.skyMid || 0x9dc4d1;
    const skyLow = tones.skyLow || 0xb7d1d8;
    const far = tones.far || 0x6d887d;
    const near = tones.near || 0x7b938c;
    const lake = tones.lake || 0x6d98a7;

    g.fillStyle(skyTop, 1);
    g.fillRect(0, 0, width, 82);
    g.fillStyle(skyMid, 1);
    g.fillRect(0, 82, width, 64);
    g.fillStyle(skyLow, 1);
    g.fillRect(0, 146, width, 40);

    g.fillStyle(far, 0.78);
    g.fillTriangle(-50, 206, width * 0.16, 116, width * 0.38, 206);
    g.fillTriangle(width * 0.21, 206, width * 0.47, 131, width * 0.72, 206);
    g.fillTriangle(width * 0.58, 206, width * 0.80, 120, width + 40, 206);

    g.fillStyle(lake, 0.55);
    g.fillRect(0, 198, width, 30);

    g.fillStyle(near, 0.64);
    for (let x = -20; x < width + 40; x += 44) {
      const h = 22 + (((x / 44) | 0) % 5) * 7;
      g.fillRect(x, 198 - h, 36, h);
      if ((((x / 44) | 0) % 4) === 1) {
        g.fillTriangle(x - 1, 198 - h, x + 18, 186 - h, x + 37, 198 - h);
      }
    }

    return addCleanup(scene, g);
  }

  function decorateOutdoorBase(scene, opts = {}) {
    if (!scene?.add || scene.__baseOutdoorDecorV70) return;
    const width = getSceneWidth(scene, opts.width || 3200);
    const back = drawMountainSky(scene, width, opts.tones || {});

    const fg = scene.add.graphics().setDepth(0.2);
    // Narrower asphalt strip, broader pavement.
    fg.fillStyle(0x646566, 0.82);
    fg.fillRect(0, 286, width, 22);
    fg.fillStyle(0xbcb6ac, 0.95);
    fg.fillRect(0, 308, width, 30);
    fg.fillStyle(0xd8d2c7, 0.90);
    fg.fillRect(0, 308, width, 5);
    fg.lineStyle(1, 0x9a958d, 0.6);
    for (let x = 0; x < width; x += 46) {
      fg.lineBetween(x, 314, x, 338);
    }

    // Denser mid-background around likely tram areas.
    const mid = scene.add.graphics().setDepth(-18);
    const positions = opts.midBlocks || [260, 670, 1170, 1610, 2140, 2670];
    positions.forEach((x, idx) => {
      const w = 110 + (idx % 2) * 36;
      const h = 110 + (idx % 3) * 16;
      const top = 170 - (idx % 2) * 16;
      mid.fillStyle([0xc7baa7, 0xbcae9a, 0xa89f94][idx % 3], 0.95);
      mid.fillRect(x, top, w, h);
      mid.fillStyle(0x4e636a, 0.95);
      for (let wx = x + 12; wx < x + w - 14; wx += 28) {
        mid.fillRect(wx, top + 20, 12, 18);
        mid.fillRect(wx, top + 54, 12, 18);
      }
      mid.fillStyle(0x66584d, 1);
      mid.fillTriangle(x - 2, top, x + w / 2, top - 15, x + w + 2, top);
    });

    scene.__baseOutdoorDecorV70 = { back, fg, mid };
    addCleanup(scene, fg); addCleanup(scene, mid);
  }

  function decorateBahnhofScene(scene) {
    if (!scene?.add || scene.__bahnhofDecorV70) return;
    const width = getSceneWidth(scene, 3200);
    decorateOutdoorBase(scene, {
      width,
      tones: {
        skyTop: 0x87b4c8,
        skyMid: 0x99c0cf,
        skyLow: 0xbad2d9,
        lake: 0x6b97a8,
        far: 0x70897d,
        near: 0x7f968f
      },
      midBlocks: [160, 520, 905, 1260, 1690, 2080, 2500, 2880]
    });

    const g = scene.add.graphics().setDepth(-7);

    // More convincing Bahnhofstrasse facades, especially near the Polybahn mouth.
    const facadeXs = [1180, 1340, 1510, 1680, 1850, 2030, 2205];
    facadeXs.forEach((x, idx) => {
      const w = 132 + (idx % 2) * 12;
      const top = 104 + (idx % 3) * 6;
      const h = 174 - (idx % 2) * 8;
      g.fillStyle([0xd0c3b2, 0xc3b7a6, 0xddd3c3][idx % 3], 0.95);
      g.fillRect(x, top, w, h);
      g.fillStyle(0x7c6a5a, 1);
      g.fillRect(x, top, w, 11);
      g.fillStyle(0x35515b, 1);
      for (let wy = top + 22; wy < top + 116; wy += 34) {
        g.fillRect(x + 14, wy, 18, 22);
        g.fillRect(x + 44, wy, 18, 22);
        g.fillRect(x + 74, wy, 18, 22);
        g.fillRect(x + 104, wy, 18, 22);
      }
      // Storefronts.
      g.fillStyle([0x243841, 0x2d4650, 0x394d55][idx % 3], 1);
      g.fillRect(x + 6, top + 126, w - 12, 50);
      g.fillStyle(0xd7c8a8, 1);
      g.fillRect(x + 14, top + 136, 25, 28);
      g.fillRect(x + 48, top + 136, 25, 28);
      g.fillRect(x + 82, top + 136, 25, 28);
    });

    // Slightly scruffier frontage at the Indian shop stretch.
    g.fillStyle(0xa08d7f, 0.98);
    g.fillRect(2325, 118, 170, 156);
    g.fillStyle(0x724b35, 1);
    g.fillRect(2325, 118, 170, 10);
    g.fillStyle(0x405057, 1);
    g.fillRect(2337, 223, 145, 43);
    g.fillStyle(0xc9b886, 1);
    g.fillRect(2348, 231, 26, 24);
    g.fillRect(2381, 231, 26, 24);
    g.fillRect(2414, 231, 26, 24);

    // Background objects near tram stations to reduce emptiness.
    const stationBg = scene.add.graphics().setDepth(-3);
    [430, 980, 2560].forEach((x, idx) => {
      stationBg.fillStyle(0x56666b, 0.94);
      stationBg.fillRect(x - 34, 188, 68, 88);
      stationBg.fillStyle(0xd9d6cb, 0.96);
      stationBg.fillRect(x - 26, 202, 52, 58);
      stationBg.fillStyle(idx === 1 ? 0xba3436 : 0x7a8d91, 1);
      stationBg.fillRect(x - 34, 182, 68, 9);
      stationBg.fillStyle(0x394d55, 1);
      stationBg.fillRect(x - 3, 155, 6, 120);
      stationBg.fillCircle(x, 150, 10);
    });

    scene.__bahnhofDecorV70 = { g, stationBg };
    addCleanup(scene, g); addCleanup(scene, stationBg);
  }

  function decorateMilchbuckScene(scene) {
    if (!scene?.add || scene.__milchbuckDecorV70) return;
    const width = getSceneWidth(scene, 2600);
    decorateOutdoorBase(scene, {
      width,
      tones: {
        skyTop: 0x88b4c8,
        skyMid: 0x9cc0cf,
        skyLow: 0xbad1d8,
        lake: 0x6f99a8,
        far: 0x71897e,
        near: 0x80948c
      },
      midBlocks: [120, 470, 840, 1180, 1550, 1910, 2260]
    });

    const g = scene.add.graphics().setDepth(-8);
    [210, 620, 1040, 1480, 1900, 2280].forEach((x, idx) => {
      g.fillStyle([0xc3b49f, 0xb4a795, 0xccc1af][idx % 3], 0.96);
      g.fillRect(x, 126 + (idx % 2) * 10, 120, 146 - (idx % 2) * 12);
      g.fillStyle(0x506268, 1);
      for (let wy = 152; wy < 236; wy += 30) {
        g.fillRect(x + 18, wy, 14, 18);
        g.fillRect(x + 50, wy, 14, 18);
        g.fillRect(x + 82, wy, 14, 18);
      }
    });
    scene.__milchbuckDecorV70 = g;
    addCleanup(scene, g);
  }

  function decorateBuerkliScene(scene) {
    if (!scene?.add || scene.__buerkliDecorV70) return;
    const width = getSceneWidth(scene, 2200);
    const g = scene.add.graphics().setDepth(-130);
    g.fillStyle(0x8ab6c9, 1); g.fillRect(0, 0, width, 88);
    g.fillStyle(0x9fc5d3, 1); g.fillRect(0, 88, width, 66);
    g.fillStyle(0xbfd6dc, 1); g.fillRect(0, 154, width, 38);
    g.fillStyle(0x6b8b93, 0.5); g.fillRect(0, 190, width, 42);
    g.fillStyle(0x70867d, 0.74);
    g.fillTriangle(-30, 208, 260, 124, 575, 208);
    g.fillTriangle(420, 208, 770, 139, 1110, 208);
    g.fillTriangle(970, 208, 1280, 127, width + 20, 208);
    // Smaller, more distant church silhouette.
    g.fillStyle(0x657173, 0.82);
    g.fillRect(width * 0.77, 126, 24, 72);
    g.fillTriangle(width * 0.77 - 3, 126, width * 0.77 + 12, 103, width * 0.77 + 27, 126);
    const fg = scene.add.graphics().setDepth(-12);
    fg.fillStyle(0xbfb9ae, 0.92); fg.fillRect(0, 308, width, 30);
    fg.fillStyle(0xd9d2c7, 0.88); fg.fillRect(0, 308, width, 5);
    scene.__buerkliDecorV70 = { g, fg };
    addCleanup(scene, g); addCleanup(scene, fg);
  }

  function decorateOerlikonScene(scene) {
    if (!scene?.add || scene.__oerlikonDecorV70) return;
    const width = getSceneWidth(scene, 3200);
    const back = drawMountainSky(scene, width, {
      skyTop: 0x8ebaca,
      skyMid: 0x9dc7d2,
      skyLow: 0xbfd6dd,
      far: 0x728a80,
      near: 0x7d938b,
      lake: 0x7199a4
    });

    const g = scene.add.graphics().setDepth(-4);

    // Richer sidewalks and tram surroundings.
    g.fillStyle(0xbdb7ac, 0.95);
    g.fillRect(0, 308, width, 30);
    g.fillStyle(0xdcd6ca, 0.9);
    g.fillRect(0, 308, width, 5);

    // Small lawn / ground definition for park area.
    g.fillStyle(0x7ca16c, 0.96);
    g.fillRect(OERLIKON_POS.parkLeft, 278, OERLIKON_POS.parkRight - OERLIKON_POS.parkLeft, 35);
    g.fillStyle(0x8db47c, 0.96);
    g.fillRoundedRect(OERLIKON_POS.parkLeft + 24, 258, OERLIKON_POS.parkRight - OERLIKON_POS.parkLeft - 48, 35, 10);

    // Church forecourt path.
    g.fillStyle(0xcbbfae, 1);
    g.fillRoundedRect(OERLIKON_POS.church - 105, 285, 210, 26, 6);
    g.fillRoundedRect(OERLIKON_POS.church - 18, 255, 36, 58, 5);

    // More detail for Salersteig stop.
    const stopXs = [OERLIKON_POS.salersteig + 60, OERLIKON_POS.sternen - 40];
    stopXs.forEach((x, idx) => {
      g.fillStyle(0x57686c, 1);
      g.fillRect(x - 46, 196, 92, 80);
      g.fillStyle(0xd9d6cb, 1);
      g.fillRect(x - 37, 206, 74, 58);
      g.fillStyle(idx === 0 ? 0xbf3738 : 0x7d8f94, 1);
      g.fillRect(x - 46, 188, 92, 10);
      g.fillStyle(0x415359, 1);
      g.fillRect(x + 54, 170, 6, 108);
      g.fillCircle(x + 57, 164, 11);
      g.fillStyle(0x6d5544, 1);
      g.fillRect(x - 90, 260, 32, 8);
      g.fillRect(x - 88, 252, 4, 18);
      g.fillRect(x - 64, 252, 4, 18);
    });

    // Coop frontage extra detail.
    g.fillStyle(0x304850, 0.9);
    g.fillRect(OERLIKON_POS.coopLeft + 40, 220, 170, 46);
    g.fillStyle(0xe4d4b0, 1);
    [OERLIKON_POS.coopLeft + 56, OERLIKON_POS.coopLeft + 90, OERLIKON_POS.coopLeft + 124, OERLIKON_POS.coopLeft + 158].forEach((x) => {
      g.fillRect(x, 229, 22, 26);
    });

    // Ground details around WG.
    g.fillStyle(0x877968, 1);
    g.fillRoundedRect(820, 291, 300, 22, 6);

    scene.__oerlikonDecorV70 = { back, g };
    addCleanup(scene, g);
  }

  function decoratePolyterrasseScene(scene) {
    if (!scene?.add || scene.__polyterrasseDecorV70) return;
    const width = getSceneWidth(scene, 1720);
    const g = scene.add.graphics().setDepth(-125);
    // Extend skyline more seamlessly.
    g.fillStyle(0x8db8c9, 0.72); g.fillRect(0, 0, width, 84);
    g.fillStyle(0x9dc1cf, 0.55); g.fillRect(0, 84, width, 50);
    g.fillStyle(0xb7d0d7, 0.35); g.fillRect(0, 134, width, 28);

    g.fillStyle(0x698489, 0.42);
    g.fillRect(0, 202, 980, 40);
    for (let x = -10; x < 960; x += 34) {
      const h = 16 + (((x / 34) | 0) % 4) * 7;
      g.fillRect(x, 202 - h, 28, h);
    }

    // Softer distant church / skyline layer so it blends with rest of city.
    g.fillStyle(0x647174, 0.48);
    g.fillRect(545, 150, 18, 58);
    g.fillTriangle(542, 150, 554, 132, 566, 150);

    // More promenade depth close to balustrade.
    const fg = scene.add.graphics().setDepth(-2);
    fg.fillStyle(0xb8b0a6, 0.45);
    fg.fillRect(0, 268, width, 18);
    scene.__polyterrasseDecorV70 = { g, fg };
    addCleanup(scene, g); addCleanup(scene, fg);
  }

  function patchOerlikonTransitions() {
    const cls = window.__SIMON_OERLIKON_SCENE_CLASS__;
    const proto = cls?.prototype;
    if (!proto) return false;

    if (typeof proto.create === 'function' && !proto.create.__worldV70) {
      const original = proto.create;
      proto.create = function(...args) {
        const r = original.apply(this, args);
        try { decorateOerlikonScene(this); } catch (e) { console.warn(e); }
        return r;
      };
      proto.create.__worldV70 = true;
    }

    // Resume outdoor more defensively.
    if (typeof proto.resumeFromWG === 'function' && !proto.resumeFromWG.__worldV70) {
      const original = proto.resumeFromWG;
      proto.resumeFromWG = function(...args) {
        const r = original.apply(this, args);
        try {
          this.physics?.world?.resume?.();
          if (this.input) this.input.enabled = true;
          this.player?.setVelocity?.(0,0);
          this.setUILocked?.(false);
          this.refreshUILock?.();
          this.setControlsVisible?.(true);
        } catch {}
        return r;
      };
      proto.resumeFromWG.__worldV70 = true;
    }
    return true;
  }

  function patchWGAndRoom() {
    const wgCls = window.__SIMON_WG_INTERIOR_SCENE_CLASS__;
    const wgProto = wgCls?.prototype;
    if (wgProto && typeof wgProto.leaveWG === 'function' && !wgProto.leaveWG.__worldV70) {
      wgProto.leaveWG = function leaveWGV70() {
        if (this.__leavingWGV70) return;
        this.__leavingWGV70 = true;
        const game = getGame() || this.game;
        const outdoor = this.outdoorScene || getScene('OerlikonScene');
        try {
          outdoor?.resumeFromWG?.();
          game.scene.resume('OerlikonScene');
        } catch (error) {
          console.error('v70 WG->Oerlikon resume failed', error);
        }
        window.setTimeout(() => {
          try { this.scene.stop(); } catch { try { game.scene.stop('WGInteriorScene'); } catch {} }
          this.__leavingWGV70 = false;
        }, 30);
      };
      wgProto.leaveWG.__worldV70 = true;
    }

    const roomCls = window.__SIMON_SIMON_ROOM_SCENE_CLASS__;
    const roomProto = roomCls?.prototype;
    if (roomProto && typeof roomProto.create === 'function' && !roomProto.create.__worldDecorV70) {
      const originalCreate = roomProto.create;
      roomProto.create = function(...args) {
        const r = originalCreate.apply(this, args);
        return r;
      };
      roomProto.create.__worldDecorV70 = true;
    }
    if (roomProto && typeof roomProto.leaveRoom === 'function' && !roomProto.leaveRoom.__worldV70) {
      roomProto.leaveRoom = function leaveRoomV70() {
        if (this.__leavingRoomV70) return;
        this.__leavingRoomV70 = true;
        const game = getGame() || this.game;
        const hall = this.hallScene || getScene('WGInteriorScene');
        try {
          if (hall?.input) hall.input.enabled = true;
          game.scene.resume('WGInteriorScene');
        } catch (error) {
          console.error('v70 Room->WG resume failed', error);
        }
        window.setTimeout(() => {
          try { this.scene.stop(); } catch { try { game.scene.stop('SimonRoomScene'); } catch {} }
          // extra defensive re-activation
          try { hall?.scene?.resume?.(); } catch {}
          try { hall?.input && (hall.input.enabled = true); } catch {}
          this.__leavingRoomV70 = false;
        }, 30);
      };
      roomProto.leaveRoom.__worldV70 = true;
    }
    return Boolean(wgProto || roomProto);
  }

  function patchPolybahnAndTerrace() {
    const transitCls = window.__SIMON_POLYBAHN_TRANSIT_SCENE_CLASS__;
    const transitProto = transitCls?.prototype;
    if (transitProto && typeof transitProto.createTransitVisuals === 'function' && !transitProto.createTransitVisuals.__worldV70) {
      const original = transitProto.createTransitVisuals;
      transitProto.createTransitVisuals = function(...args) {
        const r = original.apply(this, args);
        try {
          const g = this.add.graphics().setDepth(1.5);
          // Ground / embankment under the diagonal track so the ride no longer floats.
          g.fillStyle(0x8b8578, 1);
          g.beginPath();
          g.moveTo(120, 390); g.lineTo(120, 322); g.lineTo(690, 54); g.lineTo(690, 390); g.closePath(); g.fillPath();
          g.fillStyle(0xafa79a, 1);
          g.lineStyle(3, 0xd1c7b6, 0.9);
          for (let i = 0; i < 8; i += 1) {
            const y = 334 - i * 34;
            g.lineBetween(132 + i * 70, y, 690, y - 6);
          }
          // River / water ribbon by the bridge mouth.
          g.fillStyle(0x6e9aaa, 0.92);
          g.beginPath();
          g.moveTo(0, 338); g.lineTo(120, 338); g.lineTo(155, 318); g.lineTo(0, 318); g.closePath(); g.fillPath();
          addCleanup(this, g);
        } catch (e) { console.warn(e); }
        return r;
      };
      transitProto.createTransitVisuals.__worldV70 = true;
    }

    const terraceCls = getGame()?.scene?.keys?.PolyterrasseScene?.constructor || null;
    const proto = terraceCls?.prototype;
    if (proto && typeof proto.create === 'function' && !proto.create.__worldV70) {
      const original = proto.create;
      proto.create = function(...args) {
        const r = original.apply(this, args);
        try { decoratePolyterrasseScene(this); } catch (e) { console.warn(e); }
        return r;
      };
      proto.create.__worldV70 = true;
    }
    return Boolean(transitProto || proto);
  }

  function polybahnUnlocked(scene) {
    if (scene?.developerMode) return true;
    const cashier = window.__SIMON_CASHIER_STATE_V54__ || window.SimonCashierV54?.state || null;
    return Boolean(
      cashier?.inspirationHintSeen ||
      cashier?.needsInspiration ||
      cashier?.coffeePlanWritten ||
      cashier?.cashierAsked ||
      cashier?.cashierRejected
    );
  }

  function replacePolybahnEntry(scene) {
    if (!scene?.add) return;
    const current = scene.__ethCampusEntryV59;
    if (current?.__refinedV70) return;

    // If old entry exists, remove it and replace with a smaller, cleaner version.
    [current?.street, current?.station, current?.sign, current?.zone, current?.marker, current?.actionLabel].forEach(safeRemove);

    const x = 900;
    const yTop = 186;

    const street = scene.add.graphics().setDepth(1);
    // Narrow side street receding into the distance.
    street.fillStyle(0x656664, 1);
    street.beginPath();
    street.moveTo(x - 56, GROUND_TOP);
    street.lineTo(x + 56, GROUND_TOP);
    street.lineTo(x + 23, 210);
    street.lineTo(x - 23, 210);
    street.closePath();
    street.fillPath();
    // Sidewalk only, reduced asphalt feel.
    street.fillStyle(0xc0b8ac, 1);
    street.beginPath();
    street.moveTo(x - 82, GROUND_TOP);
    street.lineTo(x - 56, GROUND_TOP);
    street.lineTo(x - 23, 210);
    street.lineTo(x - 37, 210);
    street.closePath();
    street.fillPath();
    street.beginPath();
    street.moveTo(x + 56, GROUND_TOP);
    street.lineTo(x + 82, GROUND_TOP);
    street.lineTo(x + 37, 210);
    street.lineTo(x + 23, 210);
    street.closePath();
    street.fillPath();
    // River / bridge left of the side street.
    street.fillStyle(0x6f9aaa, 0.96);
    street.beginPath();
    street.moveTo(x - 136, GROUND_TOP);
    street.lineTo(x - 83, GROUND_TOP);
    street.lineTo(x - 40, 214);
    street.lineTo(x - 96, 214);
    street.closePath();
    street.fillPath();
    street.lineStyle(2, 0xd9d6ce, 1);
    street.lineBetween(x - 82, 338, x - 36, 214);
    street.lineBetween(x - 96, 338, x - 49, 214);

    // Elegant Bahnhofstrasse facades right of the entrance.
    const facades = scene.add.graphics().setDepth(-2);
    [[x + 62, 120, 70, 108, 0xd6caba], [x + 136, 112, 82, 116, 0xcdbfab], [x + 222, 106, 90, 122, 0xe0d5c6]].forEach(([lx, top, w, h, color], idx) => {
      facades.fillStyle(color, 1);
      facades.fillRect(lx, top, w, h);
      facades.fillStyle(0x6c5a4d, 1);
      facades.fillRect(lx, top, w, 9);
      facades.fillStyle(0x294149, 1);
      facades.fillRect(lx + 6, top + h - 36, w - 12, 28);
      facades.fillStyle(0xdbcba7, 1);
      facades.fillRect(lx + 14, top + h - 29, 16, 18);
      facades.fillRect(lx + 38, top + h - 29, 16, 18);
      if (w > 80) facades.fillRect(lx + 62, top + h - 29, 16, 18);
    });

    const station = scene.add.container(0, 0).setDepth(4);
    const sg = scene.add.graphics();
    sg.fillStyle(0xb9ae9d, 1);
    sg.fillRoundedRect(x - 33, 124, 66, 68, 4);
    sg.fillStyle(0x978b7d, 1); sg.fillRect(x - 36, 118, 72, 8);
    sg.fillStyle(0xb82f32, 1); sg.fillRoundedRect(x - 29, 139, 58, 18, 4);
    sg.fillStyle(0x233b43, 1); sg.fillCircle(x, 181, 18); sg.fillRect(x - 18, 181, 36, 16);
    sg.fillStyle(0x172b34, 1); sg.fillCircle(x, 182, 13); sg.fillRect(x - 13, 182, 26, 12);
    station.add(sg);

    const sign = scene.add.text(x, 148, 'POLYBAHN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '4px',
      color: '#fff0d2',
      stroke: '#682024',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(5);

    const zone = scene.add.zone(x, 272, 98, 92).setDepth(286).setInteractive({ useHandCursor: true });
    const actionLabel = scene.add.text(x, 257, 'POLYBAHN ↑', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#fff0c9',
      backgroundColor: '#853031',
      padding: { x: 7, y: 5 }
    }).setOrigin(0.5).setDepth(287).setVisible(polybahnUnlocked(scene)).setInteractive({ useHandCursor: true });

    const enter = (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      if (!polybahnUnlocked(scene)) {
        showThought(scene, 'Ich sött mer zerscht no öppis Gschiids überlege, bevor ich det ueche gah.');
        return;
      }
      if (scene.__polybahnTravelActiveV70) return;
      scene.__polybahnTravelActiveV70 = true;
      try {
        window.SimonETHV59?.enter?.();
      } finally {
        window.setTimeout(() => { scene.__polybahnTravelActiveV70 = false; }, 900);
      }
    };

    zone.on('pointerdown', enter);
    actionLabel.on('pointerdown', enter);

    const entry = {
      x,
      street,
      facades,
      station,
      sign,
      zone,
      actionLabel,
      marker: null,
      __refinedV70: true
    };
    scene.__ethCampusEntryV59 = entry;

    if (polybahnUnlocked(scene) && scene.createPulsingInteractionMarker && !entry.marker?.active) {
      entry.marker = scene.createPulsingInteractionMarker(x, 287, 120) || null;
    }

    scene.events?.once?.('shutdown', () => {
      [street, facades, station, sign, zone, actionLabel, entry.marker].forEach(safeRemove);
      scene.__ethCampusEntryV59 = null;
    });
  }

  function patchBaseSceneClasses() {
    const registry = window.__SIMON_SCENE_CLASSES__;
    if (!registry) return false;

    const milchbuckProto = registry.MilchbuckScene?.prototype;
    if (milchbuckProto && typeof milchbuckProto.create === 'function' && !milchbuckProto.create.__worldV70) {
      const original = milchbuckProto.create;
      milchbuckProto.create = function(...args) {
        const r = original.apply(this, args);
        try { if (this.sys?.settings?.key === 'MilchbuckScene') decorateMilchbuckScene(this); } catch (e) { console.warn(e); }
        return r;
      };
      milchbuckProto.create.__worldV70 = true;
    }

    const bahnhofProto = registry.BahnhofquaiScene?.prototype;
    if (bahnhofProto && typeof bahnhofProto.create === 'function' && !bahnhofProto.create.__worldV70) {
      const original = bahnhofProto.create;
      bahnhofProto.create = function(...args) {
        const r = original.apply(this, args);
        try {
          decorateBahnhofScene(this);
          window.setTimeout(() => replacePolybahnEntry(this), 40);
        } catch (e) { console.warn(e); }
        return r;
      };
      bahnhofProto.create.__worldV70 = true;
    }

    return Boolean(milchbuckProto || bahnhofProto);
  }

  function patchGenericSceneStartWatchdog() {
    const proto = Phaser?.Scenes?.ScenePlugin?.prototype;
    if (!proto || proto.start.__worldV70) return false;

    const original = proto.start;
    proto.start = function(target, data) {
      try {
        window.__SIMON_PENDING_SCENE_START_V70__ = {
          target,
          data,
          source: this.systems?.scene?.sys?.settings?.key || null,
          at: Date.now(),
          retried: false
        };
      } catch {}
      return original.call(this, target, data);
    };
    proto.start.__worldV70 = true;
    return true;
  }

  function recoverPendingSceneStart() {
    const pending = window.__SIMON_PENDING_SCENE_START_V70__;
    if (!pending) return;
    const game = getGame();
    if (!game?.scene) return;

    const targetActive = (() => {
      try { return Boolean(game.scene.isActive?.(pending.target)); } catch { return false; }
    })();

    if (targetActive) {
      window.__SIMON_PENDING_SCENE_START_V70__ = null;
      return;
    }

    const age = Date.now() - Number(pending.at || 0);
    if (age > 1300 && !pending.retried && game.scene.keys?.[pending.target]) {
      pending.retried = true;
      try {
        game.scene.start(pending.target, pending.data);
      } catch (error) {
        console.warn('v70 scene-start retry failed', pending.target, error);
      }
      return;
    }

    if (age > 2600) {
      window.__SIMON_PENDING_SCENE_START_V70__ = null;
    }
  }

  function syncActiveScenes() {
    const game = getGame();
    if (!game?.scene?.keys) return;

    try {
      const bahnhof = getScene('BahnhofquaiScene');
      if (bahnhof?.sys?.isActive?.()) {
        decorateBahnhofScene(bahnhof);
        replacePolybahnEntry(bahnhof);
      }
    } catch {}

    try {
      const milchbuck = getScene('MilchbuckScene');
      if (milchbuck?.sys?.isActive?.()) decorateMilchbuckScene(milchbuck);
    } catch {}

    try {
      const oerli = getScene('OerlikonScene');
      if (oerli?.sys?.isActive?.()) decorateOerlikonScene(oerli);
    } catch {}

    try {
      const terr = getScene('PolyterrasseScene');
      if (terr?.sys?.isActive?.()) decoratePolyterrasseScene(terr);
    } catch {}

    try {
      Object.keys(game.scene.keys).forEach((key) => {
        const lower = String(key).toLowerCase();
        const scene = game.scene.keys[key];
        if (!scene?.sys?.isActive?.()) return;
        if (lower.includes('buerkli') || lower.includes('burkli')) {
          decorateBuerkliScene(scene);
        }
      });
    } catch {}

    recoverPendingSceneStart();
  }

  function install() {
    patchGenericSceneStartWatchdog();
    patchBaseSceneClasses();
    patchOerlikonTransitions();
    patchWGAndRoom();
    patchPolybahnAndTerrace();
    syncActiveScenes();
  }

  install();
  window.setInterval(install, 300);
  window.setInterval(syncActiveScenes, 250);

  window.SimonWorldPolishV70 = Object.freeze({
    VERSION,
    sync: syncActiveScenes,
    install,
    status() {
      return {
        version: VERSION,
        bahnhof: Boolean(getScene('BahnhofquaiScene')?.__bahnhofDecorV70),
        milchbuck: Boolean(getScene('MilchbuckScene')?.__milchbuckDecorV70),
        oerlikon: Boolean(getScene('OerlikonScene')?.__oerlikonDecorV70),
        polyterrasse: Boolean(getScene('PolyterrasseScene')?.__polyterrasseDecorV70),
        pendingSceneStart: window.__SIMON_PENDING_SCENE_START_V70__ || null
      };
    }
  });
})();
