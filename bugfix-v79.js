(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V79__) return;
  window.__SIMON_BUGFIX_V79__ = true;

  const VERSION = 79;
  const WG_KEY = "WGInteriorScene";
  const ROOM_KEY = "SimonRoomScene";

  const progress =
    window.__SIMON_PROGRESS_V79__ || {
      orellVisits: 0,
      milkmanTriggered: false
    };

  window.__SIMON_PROGRESS_V79__ = progress;

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

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  // ======================================================================
  // 1) ORELL FÜSSLI
  // The SECOND Orell visit advances the cashier story by itself.
  // Enrique is no longer a prerequisite for the inspiration text.
  // ======================================================================

  function patchOrellProgression() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (!proto) return false;

    if (
      typeof proto.enterBookstore === "function" &&
      !proto.enterBookstore.__v79OrellVisit
    ) {
      const currentEnter = proto.enterBookstore;

      const wrappedEnter = function enterBookstoreV79(...args) {
        const wasOpen = Boolean(this.bookstoreOverlay);
        const result = currentEnter.apply(this, args);

        if (!wasOpen && this.bookstoreOverlay) {
          progress.orellVisits += 1;
          this.__orellVisitNumberV79 = progress.orellVisits;
        }

        return result;
      };

      // Preserve the cashier marker so cashier-story-v54 does not wrap over us
      // again on its requestAnimationFrame maintenance loop.
      wrappedEnter.__cashierV54 = true;
      wrappedEnter.__v79OrellVisit = true;
      proto.enterBookstore = wrappedEnter;
    }

    if (
      typeof proto.exitBookstore === "function" &&
      !proto.exitBookstore.__v79OrellSecondEvent
    ) {
      const currentExit = proto.exitBookstore;

      const wrappedExit = function exitBookstoreV79(...args) {
        const cashierState =
          window.__SIMON_CASHIER_STATE_V54__ || null;

        // cashier-story-v54 currently checks `this.enriqueSpoken` before it
        // shows the second inspiration block. For the SECOND Orell visit only,
        // satisfy that obsolete gate during this synchronous call, then restore
        // the real Enrique state immediately. Other Enrique/Gandhi logic never
        // sees the temporary value.
        const shouldAdvanceSecondEvent = Boolean(
          progress.orellVisits >= 2 &&
          cashierState?.firstCrushThoughtSeen &&
          !cashierState?.inspirationHintSeen &&
          !cashierState?.coffeePlanWritten &&
          !cashierState?.cashierAsked
        );

        const realEnriqueState = this.enriqueSpoken;

        if (shouldAdvanceSecondEvent) {
          this.enriqueSpoken = true;
        }

        try {
          return currentExit.apply(this, args);
        } finally {
          if (shouldAdvanceSecondEvent) {
            this.enriqueSpoken = realEnriqueState;
          }
        }
      };

      wrappedExit.__cashierV54 = true;
      wrappedExit.__v79OrellSecondEvent = true;
      proto.exitBookstore = wrappedExit;
    }

    return true;
  }

  // ======================================================================
  // 2) MILCHMANN
  // Exactly one encounter, tied to the first completed Orell visit.
  // BahnhofquaiScene.init() resets its local milkman flags on every trip, so
  // keep the one-time story fact outside the reusable scene instance.
  // ======================================================================

  function patchMilkmanOnce() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (
      !proto ||
      typeof proto.startMilkmanEncounter !== "function"
    ) {
      return false;
    }

    if (proto.startMilkmanEncounter.__v79Once) {
      return true;
    }

    const currentStart = proto.startMilkmanEncounter;

    const wrappedStart = function startMilkmanOnceV79(...args) {
      // The first Orell exit deliberately defers the Milkman until Simon's
      // crush-thought has finished. Do NOT consume the one-time flag while the
      // cashier patch is still holding that original call.
      if (this.__cashierMilkmanDeferredV54) {
        return false;
      }

      // In normal play the Milkman belongs only to the first Orell visit.
      // Preserve the explicit developer post-milkman checkpoint.
      if (
        progress.orellVisits < 1 &&
        this.developerCheckpoint !== "post-milkman"
      ) {
        return false;
      }

      if (progress.milkmanTriggered) {
        // On a later Bahnhofstrasse scene run the base init() has reset these
        // fields to false. Mark the local reusable scene as already past the
        // encounter so its own delayed Orell callback stops trying again.
        if (
          !this.milkmanDialogueActive &&
          !this.milkmanFightActive &&
          !this.milkman?.active
        ) {
          this.milkmanEncounterStarted = true;
          this.milkmanDefeated = true;
        }

        return false;
      }

      const result = currentStart.apply(this, args);

      if (
        this.milkmanEncounterStarted ||
        this.milkmanDialogueActive ||
        this.milkman?.active
      ) {
        progress.milkmanTriggered = true;
      }

      return result;
    };

    // cashier-story-v54 continuously checks this marker. Keeping it prevents
    // that older script from replacing the final v79 one-time guard.
    wrappedStart.__cashierV54 = true;
    wrappedStart.__v79Once = true;
    proto.startMilkmanEncounter = wrappedStart;

    return true;
  }

  function syncMilkmanProgress() {
    const scene = getScene("BahnhofquaiScene");

    if (!scene?.sys?.isActive?.()) return;

    if (
      progress.milkmanTriggered &&
      !scene.milkmanDialogueActive &&
      !scene.milkmanFightActive &&
      !scene.milkman?.active &&
      !scene.milkmanEncounterStarted
    ) {
      scene.milkmanEncounterStarted = true;
      scene.milkmanDefeated = true;
    }
  }

  // ======================================================================
  // 3) SIMONS WG-ZIMMER
  // v77 used game.scene.launch(), which is not a reliable SceneManager path.
  // Add one final, high-depth Simon-door hit area that starts the room through
  // the global SceneManager while keeping the hallway paused underneath.
  // This also repairs a hallway that was already created before v79 installed.
  // ======================================================================

  function ensureOerlikonScenesRegistered(game) {
    if (
      game?.scene?.keys?.[WG_KEY] &&
      game?.scene?.keys?.[ROOM_KEY]
    ) {
      return true;
    }

    try {
      window.SimonOerlikonV59?.install?.(game);
    } catch {}

    return Boolean(
      game?.scene?.keys?.[WG_KEY] &&
      game?.scene?.keys?.[ROOM_KEY]
    );
  }

  function openSimonRoomV79(hall) {
    if (!hall?.sys?.isActive?.()) return false;
    if (hall.__roomTransitionV79) return false;

    const game = getGame() || hall.game;
    if (!game?.scene) return false;

    if (!ensureOerlikonScenesRegistered(game)) {
      console.error("v79: SimonRoomScene ist nicht registriert.");
      return false;
    }

    hall.__roomTransitionV79 = true;
    hall.__roomTransitionV77 = true;

    try {
      if (
        game.scene.isActive?.(ROOM_KEY) ||
        game.scene.isPaused?.(ROOM_KEY) ||
        game.scene.isSleeping?.(ROOM_KEY)
      ) {
        game.scene.stop(ROOM_KEY);
      }

      // Pause the hallway, then start ONLY the target scene through the global
      // SceneManager. SceneManager.start has no "current scene" to stop.
      game.scene.pause(WG_KEY);
      game.scene.start(ROOM_KEY, {
        hallScene: hall
      });

      window.setTimeout(() => {
        const room = getScene(ROOM_KEY);

        if (room?.sys?.isActive?.()) {
          if (room.input) room.input.enabled = true;
          room.cameras?.main?.resetFX?.();
          room.cameras?.main?.setAlpha?.(1);
          return;
        }

        // Hard recovery: never leave the user staring at a frozen hallway.
        try {
          game.scene.resume(WG_KEY);
        } catch {}

        hall.__roomTransitionV79 = false;
        hall.__roomTransitionV77 = false;
      }, 120);

      return true;
    } catch (error) {
      console.error("v79 WG -> Simon Zimmer:", error);

      try {
        game.scene.resume(WG_KEY);
      } catch {}

      hall.__roomTransitionV79 = false;
      hall.__roomTransitionV77 = false;
      return false;
    }
  }

  function installHallDoorGuard(hall) {
    if (!hall?.sys?.isActive?.() || !hall.add) return false;

    if (hall.__simonRoomDoorGuardV79?.active) {
      return true;
    }

    const zone = hall.add.zone(
      142,
      218,
      118,
      198
    )
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerdown", (pointer) => {
      stopEvent(pointer?.event);
      openSimonRoomV79(hall);
    });

    hall.__simonRoomDoorGuardV79 = zone;

    hall.events?.once?.("shutdown", () => {
      try {
        zone.destroy();
      } catch {}
      hall.__simonRoomDoorGuardV79 = null;
      hall.__roomTransitionV79 = false;
    });

    return true;
  }

  function leaveSimonRoomV79(room) {
    const game = getGame() || room?.game;
    if (!game?.scene) return false;

    const hall = room?.hallScene || getScene(WG_KEY);

    try {
      game.scene.resume(WG_KEY);

      if (hall?.input) hall.input.enabled = true;
      hall?.cameras?.main?.resetFX?.();
      hall?.cameras?.main?.setAlpha?.(1);

      if (hall) {
        hall.__roomTransitionV79 = false;
        hall.__roomTransitionV77 = false;
      }

      window.setTimeout(() => {
        try {
          game.scene.stop(ROOM_KEY);
        } catch {}
      }, 25);

      return true;
    } catch (error) {
      console.error("v79 Simon Zimmer -> WG:", error);
      return false;
    }
  }

  function installRoomBackGuard(room) {
    if (!room?.sys?.isActive?.() || !room.add) return false;

    if (room.__roomBackGuardV79?.active) {
      return true;
    }

    const zone = room.add.zone(
      55,
      34,
      110,
      62
    )
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerdown", (pointer) => {
      stopEvent(pointer?.event);
      leaveSimonRoomV79(room);
    });

    room.__roomBackGuardV79 = zone;

    room.events?.once?.("shutdown", () => {
      try {
        zone.destroy();
      } catch {}
      room.__roomBackGuardV79 = null;
    });

    return true;
  }

  function patchWGCreateHooks() {
    const game = getGame();
    if (!game?.scene) return false;

    ensureOerlikonScenesRegistered(game);

    const hall = game.scene.keys?.[WG_KEY];
    const hallProto = hall?.constructor?.prototype;

    if (
      hallProto &&
      typeof hallProto.create === "function" &&
      !hallProto.create.__v79RoomGuard
    ) {
      const currentCreate = hallProto.create;

      const wrappedCreate = function createWGV79(...args) {
        const result = currentCreate.apply(this, args);
        installHallDoorGuard(this);
        return result;
      };

      wrappedCreate.__v79RoomGuard = true;
      hallProto.create = wrappedCreate;
    }

    const room = game.scene.keys?.[ROOM_KEY];
    const roomProto = room?.constructor?.prototype;

    if (
      roomProto &&
      typeof roomProto.create === "function" &&
      !roomProto.create.__v79BackGuard
    ) {
      const currentCreate = roomProto.create;

      const wrappedCreate = function createRoomV79(...args) {
        const result = currentCreate.apply(this, args);
        installRoomBackGuard(this);
        return result;
      };

      wrappedCreate.__v79BackGuard = true;
      roomProto.create = wrappedCreate;
    }

    installHallDoorGuard(getScene(WG_KEY));
    installRoomBackGuard(getScene(ROOM_KEY));

    return Boolean(hallProto && roomProto);
  }

  // ======================================================================
  // Install. The short interval is only for dynamically registered Oerlikon
  // scenes; the wrappers themselves are installed once and marked.
  // ======================================================================

  function install() {
    patchOrellProgression();
    patchMilkmanOnce();
    patchWGCreateHooks();
    syncMilkmanProgress();
  }

  install();

  const timer = window.setInterval(install, 250);

  window.SimonBugfixV79 = Object.freeze({
    VERSION,
    progress,
    install,
    status() {
      return {
        version: VERSION,
        orellVisits: progress.orellVisits,
        milkmanTriggered: progress.milkmanTriggered,
        hallDoorGuard: Boolean(
          getScene(WG_KEY)?.__simonRoomDoorGuardV79?.active
        ),
        roomBackGuard: Boolean(
          getScene(ROOM_KEY)?.__roomBackGuardV79?.active
        )
      };
    },
    resetForDeveloper() {
      progress.orellVisits = 0;
      progress.milkmanTriggered = false;
    },
    stopMaintenance() {
      window.clearInterval(timer);
    }
  });

  console.info(
    "Bugfix v79: Orell second event + one-time Milkman + Simon WG room access."
  );
})();
