(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V78__) return;
  window.__SIMON_BUGFIX_V78__ = true;

  const VERSION = 78;
  const INDER_ROOM_SELECTOR =
    '#phaser-game [data-simon-ui="inder-v76-room"]';

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

  function safeDestroy(object) {
    try {
      object?.destroy?.();
    } catch {}
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  // ======================================================================
  // 1) LÖWE / HIVE
  // Restore the original flow: JA -> immediately INSIDE the HIVE.
  // Then replace the old rocking motion with visible dance footwork there.
  // ======================================================================

  function chooseDanceWithLionV78() {
    if (!this.fightLion || this.playerDying) return;

    this.clearLionQuestion?.();
    this.stopLionPurring?.();

    // No street choreography. The dance starts inside the club.
    this.enterHiveDance?.();
  }

  // v77 checks this marker every 70 ms. Keeping it tells v77 that this is the
  // final intended lion handler, so it does not restore the street dance.
  chooseDanceWithLionV78.__v77 = true;
  chooseDanceWithLionV78.__v78 = true;

  function findHiveDancers(scene) {
    const overlay = scene?.danceOverlay;
    const list = overlay?.list || [];

    const simon = list.find((child) =>
      child?.texture?.key === "simon"
    );

    // enterHiveDance creates exactly one nested character container: the lion.
    const lion = list.find((child) =>
      child &&
      child !== simon &&
      child.type === "Container" &&
      Array.isArray(child.list)
    );

    return { overlay, simon, lion };
  }

  function installHiveDanceV78(scene) {
    const { overlay, simon, lion } = findHiveDancers(scene);

    if (!overlay || !simon?.active || !lion?.active) return false;
    if (overlay.__realDanceV78) return true;

    overlay.__realDanceV78 = true;

    // Remove the former two simple rocking tweens from the base scene.
    scene.tweens?.killTweensOf?.(simon);
    scene.tweens?.killTweensOf?.(lion);

    simon.setAngle?.(0);
    lion.setAngle?.(0);
    simon.setPosition?.(330, 252);
    lion.setPosition?.(500, 278);

    simon.play?.("simon-run", true);
    if (simon.anims) simon.anims.timeScale = 1.18;

    const notes = new Set();

    const addNote = (text, x, y) => {
      if (
        scene.danceOverlay !== overlay ||
        !overlay.active
      ) {
        return;
      }

      const note = scene.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ffe28b",
        stroke: "#4b294f",
        strokeThickness: 4
      })
        .setOrigin(0.5)
        .setScrollFactor(0);

      overlay.add(note);
      notes.add(note);

      scene.tweens.add({
        targets: note,
        y: y - 32,
        alpha: 0,
        duration: 720,
        ease: "Sine.easeOut",
        onComplete: () => {
          notes.delete(note);
          safeDestroy(note);
        }
      });
    };

    // Lion actually dances as well: bounce, lateral movement and body angle.
    scene.tweens.add({
      targets: lion,
      x: { from: 492, to: 508 },
      y: { from: 278, to: 265 },
      angle: { from: -6, to: 6 },
      duration: 310,
      yoyo: true,
      repeat: -1,
      ease: "Quad.easeInOut"
    });

    // Simon's sequence is deliberately more than a sway: side steps, turns,
    // two hops, a cross-step and a small final jump. Then it loops in the HIVE.
    const steps = [
      { x: 312, y: 252, angle: -7, flip: false, d: 180 },
      { x: 347, y: 247, angle: 8, flip: true, d: 190 },
      { x: 326, y: 218, angle: -10, flip: false, d: 235 },
      { x: 342, y: 252, angle: 4, flip: false, d: 170 },
      { x: 370, y: 244, angle: 10, flip: true, d: 185 },
      { x: 319, y: 249, angle: -11, flip: false, d: 210 },
      { x: 337, y: 213, angle: 0, flip: true, d: 250 },
      { x: 361, y: 252, angle: 9, flip: false, d: 185 },
      { x: 316, y: 239, angle: -8, flip: true, d: 195 },
      { x: 355, y: 231, angle: 12, flip: false, d: 205 },
      { x: 327, y: 252, angle: -5, flip: false, d: 175 },
      { x: 347, y: 221, angle: 8, flip: true, d: 225 },
      { x: 330, y: 252, angle: 0, flip: false, d: 210 }
    ];

    let stepIndex = 0;
    let cycle = 0;

    const nextStep = () => {
      if (
        scene.danceOverlay !== overlay ||
        !overlay.active ||
        !simon.active
      ) {
        notes.forEach(safeDestroy);
        notes.clear();
        return;
      }

      if (stepIndex >= steps.length) {
        stepIndex = 0;
        cycle += 1;

        if (cycle % 2 === 0) {
          addNote("♫", 397, 189);
        } else {
          addNote("♪", 286, 201);
        }

        scene.time.delayedCall(160, nextStep);
        return;
      }

      const step = steps[stepIndex++];
      simon.setFlipX?.(step.flip);

      if (stepIndex === 3 || stepIndex === 7 || stepIndex === 12) {
        addNote(stepIndex === 7 ? "♫" : "♪", simon.x + 18, simon.y - 42);
      }

      scene.tweens.add({
        targets: simon,
        x: step.x,
        y: step.y,
        angle: step.angle,
        duration: step.d,
        ease: step.y < 225
          ? "Sine.easeOut"
          : "Quad.easeInOut",
        onComplete: nextStep
      });
    };

    nextStep();

    scene.events?.once?.("shutdown", () => {
      notes.forEach(safeDestroy);
      notes.clear();
    });

    return true;
  }

  function patchLionHiveDance() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.MilchbuckScene
        ?.prototype;

    if (!proto) return false;

    // This intentionally replaces the v77 street-dance function and carries
    // its marker so the v77 maintenance interval leaves it alone.
    if (proto.chooseDanceWithLion !== chooseDanceWithLionV78) {
      proto.chooseDanceWithLion = chooseDanceWithLionV78;
    }

    if (
      typeof proto.enterHiveDance === "function" &&
      !proto.enterHiveDance.__v78
    ) {
      const original = proto.enterHiveDance;

      const wrapped = function enterHiveDanceV78(...args) {
        const result = original.apply(this, args);

        // The overlay is built synchronously, but scheduling one task also
        // handles Phaser versions that finish child registration at frame end.
        this.time?.delayedCall?.(0, () => installHiveDanceV78(this));
        window.setTimeout(() => installHiveDanceV78(this), 0);

        return result;
      };

      wrapped.__v78 = true;
      wrapped.__originalV78 = original;
      proto.enterHiveDance = wrapped;
    }

    return true;
  }

  // ======================================================================
  // 2) DER INDER
  // v76 moved the interior to a DOM layer at z-index 660000. The existing
  // purchase modal still used z-index 100020, so it was created BEHIND the
  // shop. Lift store modals above the room and make the seller touch robust.
  // ======================================================================

  function getInderRoom() {
    return document.querySelector(INDER_ROOM_SELECTOR);
  }

  function liftModal(modal, zIndex) {
    if (!modal?.overlay) return false;
    modal.overlay.style.zIndex = String(zIndex);
    return true;
  }

  function patchInderShop() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (!proto) return false;

    if (
      typeof proto.openIndianShopWindow === "function" &&
      !proto.openIndianShopWindow.__v78
    ) {
      const originalOpen = proto.openIndianShopWindow;

      const wrappedOpen = function openIndianShopWindowV78(...args) {
        const result = originalOpen.apply(this, args);

        if (this.shopModal) {
          // Must be above bugfix-v76's DOM room (660000).
          liftModal(this.shopModal, 690100);

          const room = getInderRoom();
          if (room) room.style.pointerEvents = "none";
        }

        return result;
      };

      wrappedOpen.__v78 = true;
      wrappedOpen.__originalV78 = originalOpen;
      proto.openIndianShopWindow = wrappedOpen;
    }

    if (
      typeof proto.closeIndianShopWindow === "function" &&
      !proto.closeIndianShopWindow.__v78
    ) {
      const originalClose = proto.closeIndianShopWindow;

      const wrappedClose = function closeIndianShopWindowV78(...args) {
        const result = originalClose.apply(this, args);
        const room = getInderRoom();
        if (room) room.style.pointerEvents = "auto";
        return result;
      };

      wrappedClose.__v78 = true;
      wrappedClose.__originalV78 = originalClose;
      proto.closeIndianShopWindow = wrappedClose;
    }

    if (
      typeof proto.openItemInfo === "function" &&
      !proto.openItemInfo.__v78
    ) {
      const originalInfo = proto.openItemInfo;

      const wrappedInfo = function openItemInfoV78(...args) {
        const result = originalInfo.apply(this, args);

        if (this.indianStoreOverlay && this.itemInfoModal) {
          liftModal(this.itemInfoModal, 690200);
        }

        return result;
      };

      wrappedInfo.__v78 = true;
      wrappedInfo.__originalV78 = originalInfo;
      proto.openItemInfo = wrappedInfo;
    }

    return true;
  }

  function repairVisibleInderShop() {
    const scene = getScene("BahnhofquaiScene");
    if (!scene?.sys?.isActive?.()) return;

    const room = getInderRoom();

    if (scene.shopModal) {
      liftModal(scene.shopModal, 690100);
      if (room) room.style.pointerEvents = "none";
    } else if (room) {
      room.style.pointerEvents = "auto";
    }

    if (scene.indianStoreOverlay && scene.itemInfoModal) {
      liftModal(scene.itemInfoModal, 690200);
    }
  }

  // Capture phase deliberately runs before v76's seller pointerdown handler,
  // which calls stopImmediatePropagation. This makes one tap sufficient on
  // desktop, iPhone and other touch browsers.
  function installInderSellerInputGuard() {
    if (window.__SIMON_INDER_INPUT_GUARD_V78__) return;
    window.__SIMON_INDER_INPUT_GUARD_V78__ = true;

    document.addEventListener(
      "pointerdown",
      (event) => {
        const seller = event.target?.closest?.(".sv37-inder-seller");
        if (!seller) return;

        const scene = getScene("BahnhofquaiScene");
        if (
          !scene?.sys?.isActive?.() ||
          !scene.indianStoreOverlay ||
          scene.shopModal
        ) {
          return;
        }

        stopEvent(event);
        scene.openIndianShopWindow?.();
      },
      true
    );
  }

  // ======================================================================
  // 3) REGRESSION GUARD
  // Recent fixes are layered prototype patches. Keep this final patch small:
  // it repairs only the final owner of the two broken interactions and leaves
  // v77's WG/Salersteig fixes untouched.
  // ======================================================================

  function install() {
    patchLionHiveDance();
    patchInderShop();
    repairVisibleInderShop();
    installInderSellerInputGuard();
  }

  install();

  // Scenes are registered dynamically. A slow maintenance pass is enough and
  // avoids the 70 ms method-churn pattern that caused several regressions.
  window.setInterval(install, 500);

  window.SimonBugfixV78 = Object.freeze({
    VERSION,
    status() {
      const milchbuckProto =
        window.__SIMON_SCENE_CLASSES__
          ?.MilchbuckScene
          ?.prototype;

      const bahnhofProto =
        window.__SIMON_SCENE_CLASSES__
          ?.BahnhofquaiScene
          ?.prototype;

      return {
        version: VERSION,
        hiveDancePatched:
          milchbuckProto?.chooseDanceWithLion === chooseDanceWithLionV78 &&
          Boolean(milchbuckProto?.enterHiveDance?.__v78),
        inderShopPatched:
          Boolean(bahnhofProto?.openIndianShopWindow?.__v78),
        inderRoomVisible:
          Boolean(getInderRoom()),
        inderShopVisible:
          Boolean(getScene("BahnhofquaiScene")?.shopModal),
        wgFixStillOwnedByV77:
          Boolean(window.SimonBugfixV77?.status?.().wgDoorPatched),
        salersteigFixStillOwnedByV77:
          Boolean(window.SimonBugfixV77?.status?.().oerlikonPatched)
      };
    }
  });

  console.info(
    "Bugfix v78: real HIVE dance + Inder purchase layer/input + regression guard."
  );
})();
