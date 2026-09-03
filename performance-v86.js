(() => {
  "use strict";

  if (window.__SIMON_PERFORMANCE_V86__) return;
  window.__SIMON_PERFORMANCE_V86__ = true;

  const VERSION = 86;
  const OERLIKON_KEY = "OerlikonScene";
  const ACTIVE_MAINTENANCE_MS = 180;
  const V84_FALLBACK_MS = 750;
  const V85_FALLBACK_MS = 450;

  const timers = [];

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getOerlikon() {
    try {
      return getGame()?.scene?.getScene?.(OERLIKON_KEY) || null;
    } catch {
      return null;
    }
  }

  function stopLegacyPolling() {
    try {
      window.SimonEsthiV84?.stopMaintenance?.();
    } catch (error) {
      console.warn("Performance v86: v84 polling konnte nicht gestoppt werden.", error);
    }

    try {
      window.SimonBugfixV85?.stopMaintenance?.();
      // stopMaintenance() intentionally removes its DOM helpers; restore the
      // current state once immediately and then maintain it at a lower rate.
      window.SimonBugfixV85?.install?.();
    } catch (error) {
      console.warn("Performance v86: v85 polling konnte nicht gestoppt werden.", error);
    }
  }

  function patchOerlikonUpdate() {
    const SceneClass =
      window.__SIMON_OERLIKON_SCENE_CLASS__ ||
      window.__SIMON_SCENE_CLASSES__?.OerlikonScene;

    const proto = SceneClass?.prototype;
    if (!proto || typeof proto.update !== "function") return false;
    if (proto.update.__performanceV86) return true;

    const heavyUpdate = proto.update;
    const baseProto = Object.getPrototypeOf(proto);
    const baseUpdate = baseProto?.update;

    // We only install when we can preserve the normal inherited gameplay
    // update on the frames where the expensive compatibility layer is skipped.
    if (typeof baseUpdate !== "function") return false;

    const wrapped = function updateOerlikonPerformanceV86(time, delta) {
      const now = Number.isFinite(time) ? time : performance.now();
      const last = Number(this.__simonPerfV86LastMaintenance);
      const due = !Number.isFinite(last) || now - last >= ACTIVE_MAINTENANCE_MS;

      if (due) {
        this.__simonPerfV86LastMaintenance = now;
        return heavyUpdate.call(this, time, delta);
      }

      // Match OerlikonScene's original story-lock behavior on skipped frames.
      if (this.__esthiStoryActive) {
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJumpRequested = false;
        this.touchShootRequested = false;
        this.player?.setVelocityX?.(0);
        return;
      }

      // Fast path: keep core movement/physics/camera/gameplay at full FPS,
      // while avoiding v84's recursive scene walk + DOM maintenance each frame.
      const result = baseUpdate.call(this, time, delta);
      this.ensureTicketMachineInteractive?.();
      this.ensureTramBoardingInteractive?.();
      return result;
    };

    // v84's installer checks this marker. Keeping it prevents its maintenance
    // fallback from wrapping this optimized update function again.
    wrapped.__esthiV84 = true;
    wrapped.__performanceV86 = true;
    wrapped.__wrappedHeavyUpdate = heavyUpdate;
    proto.update = wrapped;
    return true;
  }

  function safeMaintenance(fn) {
    if (document.visibilityState === "hidden") return;
    try {
      fn?.();
    } catch (error) {
      console.warn("Performance v86: Maintenance-Fehler abgefangen.", error);
    }
  }

  function installFallbackTimers() {
    if (window.SimonEsthiV84?.install) {
      timers.push(window.setInterval(() => {
        safeMaintenance(() => window.SimonEsthiV84.install());
      }, V84_FALLBACK_MS));
    }

    if (window.SimonBugfixV85?.install) {
      timers.push(window.setInterval(() => {
        safeMaintenance(() => window.SimonBugfixV85.install());
      }, V85_FALLBACK_MS));
    }
  }

  function install() {
    stopLegacyPolling();

    if (!patchOerlikonUpdate()) {
      const retry = window.setInterval(() => {
        if (patchOerlikonUpdate()) {
          window.clearInterval(retry);
        }
      }, 250);
      timers.push(retry);
    }

    installFallbackTimers();
  }

  function stop() {
    while (timers.length) {
      window.clearInterval(timers.pop());
    }
  }

  window.addEventListener?.("pagehide", stop, { once: true });

  install();

  window.SimonPerformanceV86 = Object.freeze({
    VERSION,
    install: patchOerlikonUpdate,
    stop,
    status() {
      const SceneClass =
        window.__SIMON_OERLIKON_SCENE_CLASS__ ||
        window.__SIMON_SCENE_CLASSES__?.OerlikonScene;
      const scene = getOerlikon();

      return {
        version: VERSION,
        patched: Boolean(SceneClass?.prototype?.update?.__performanceV86),
        oerlikonActive: Boolean(scene?.sys?.isActive?.()),
        activeMaintenanceMs: ACTIVE_MAINTENANCE_MS,
        v84FallbackMs: V84_FALLBACK_MS,
        v85FallbackMs: V85_FALLBACK_MS
      };
    }
  });

  console.info(
    "Performance v86: Oerlikon maintenance throttled; v84/v85 polling reduced without removing gameplay features."
  );
})();
