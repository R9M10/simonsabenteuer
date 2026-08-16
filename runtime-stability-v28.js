(() => {
  "use strict";

  if (window.__SIMON_RUNTIME_STABILITY_V28__) return;
  window.__SIMON_RUNTIME_STABILITY_V28__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Runtime Stability v28: startSimonGame fehlt.");
    return;
  }

  const DEV_TARGETS = new Set([
    "lion-choice",
    "hb",
    "post-milkman"
  ]);

  // Any DOM button sitting above the Phaser canvas gets a short no-world-click
  // window. This catches iOS touchend -> pointerup -> click fall-through even
  // when the button belongs to the HIVE extension instead of game.js.
  const markDOMInteraction = (event) => {
    const target = event?.target;
    if (!target?.closest) return;

    const interactiveDOM = target.closest(
      "#phaser-game button, #phaser-game [role='button'], " +
      "#phaser-game [data-simon-ui], #phaser-game [data-hive-v12]"
    );

    if (!interactiveDOM) return;

    window.__SIMON_WORLD_INTERACTION_BLOCK_UNTIL__ = Math.max(
      Number(window.__SIMON_WORLD_INTERACTION_BLOCK_UNTIL__) || 0,
      Date.now() + 750
    );

    // Also suspend Phaser input briefly. This closes the iOS-specific gap in
    // which the DOM button handles touchend but a synthesized pointer event is
    // still delivered to the canvas object underneath (for example NEIN over
    // the HIVE entrance).
    const activeGame =
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      null;
    const activeScenes = activeGame?.scene?.getScenes?.(true) || [];

    activeScenes.forEach((scene) => {
      scene.blockWorldInteractions?.(750);

      if (!scene.input) return;

      const token = (Number(scene.__inputSuspendTokenV28) || 0) + 1;
      scene.__inputSuspendTokenV28 = token;
      scene.input.enabled = false;

      window.setTimeout(() => {
        if (
          scene.input &&
          scene.__inputSuspendTokenV28 === token
        ) {
          scene.input.enabled = true;
        }
      }, 240);
    });
  };

  ["pointerdown", "pointerup", "touchstart", "touchend", "click"].forEach(
    (eventName) => {
      document.addEventListener(eventName, markDOMInteraction, true);
    }
  );

  window.startSimonGame = function startSimonGameRuntimeV28(options = {}) {
    const requestedMode = options?.startMode || "normal";
    const developerMode = Boolean(options?.developerMode);

    // Normal gameplay is passed through unchanged. Developer jumps are instead
    // booted through one neutral scene, then applied only AFTER all current
    // animation/polish wrappers have finished installing.
    if (!developerMode || !DEV_TARGETS.has(requestedMode)) {
      return wrappedStartSimonGame.call(this, options);
    }

    const game = wrappedStartSimonGame.call(this, {
      ...options,
      startMode: "dev-shell",
      developerMode: true
    });

    if (game) {
      prepareDeveloperCheckpoint(game, requestedMode);
    }

    return game;
  };

  function showDevLoading(label) {
    document
      .querySelectorAll("[data-simon-dev-v28]")
      .forEach((node) => node.remove());

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonDevV28 = "loading";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "100080",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
      boxSizing: "border-box",
      background: "rgba(7, 9, 16, .82)",
      color: "#fff1c6",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      lineHeight: "1.7",
      textAlign: "center",
      pointerEvents: "auto"
    });

    overlay.textContent = `DEV CHECKPOINT · ${label}\nAKTUELLE ANIMATIONEN WERDEN GELADEN…`;
    root.appendChild(overlay);
    return overlay;
  }

  function removeDevLoading() {
    document
      .querySelectorAll("[data-simon-dev-v28]")
      .forEach((node) => node.remove());
  }

  function checkpointLabel(mode) {
    if (mode === "lion-choice") return "LÖWENAUSWAHL";
    if (mode === "hb") return "BAHNHOFSTRASSE / HB";
    if (mode === "post-milkman") return "ENDE MILCHMANN";
    return mode.toUpperCase();
  }

  function prepareDeveloperCheckpoint(game, mode) {
    showDevLoading(checkpointLabel(mode));

    const startedAt = Date.now();

    const waitForCurrentRuntime = () => {
      const milk = game.scene?.getScene?.("MilchbuckScene");
      const bahnhof = game.scene?.getScene?.("BahnhofquaiScene");

      const polishReady = Boolean(
        game.__simonPolishV15Ready &&
        game.__simonPolishV15Boxing &&
        bahnhof?.__simonPolishV15Milkman
      );

      const baseReady = Boolean(
        milk?.sys?.isActive?.() &&
        milk?.player?.active &&
        bahnhof
      );

      if (polishReady && baseReady) {
        runDeveloperCheckpoint(game, mode, milk, bahnhof);
        return;
      }

      if (Date.now() - startedAt > 12000) {
        console.error(
          "Runtime Stability v28: Developer-Checkpoint konnte die aktuellen " +
          "Polish-Animationen nicht vollständig laden."
        );
        removeDevLoading();
        return;
      }

      window.setTimeout(waitForCurrentRuntime, 50);
    };

    waitForCurrentRuntime();
  }

  function makeDeveloperState(extra = {}) {
    return {
      coins: 999999,
      hp: 100,
      hasCityTicket: true,
      fromDeveloperMode: true,
      developerMode: true,
      inventory: {
        gatorade: 0,
        monster: 0,
        camel: 0,
        gandhiSticks: 0
      },
      booksOwned: {
        generalRelativity: false,
        phaenomenologie: false,
        playbook: false,
        zarathustra: false
      },
      booksRead: {
        generalRelativity: false,
        phaenomenologie: false,
        playbook: false,
        zarathustra: false
      },
      abilitiesUnlocked: {
        wormhole: false,
        eternalReturn: false,
        forItself: false
      },
      activeAbility: null,
      forItselfCooldownUntil: 0,
      hotbarItems: [null, null, null, null, null],
      selectedHotbarIndex: 0,
      sprintExpiresAt: 0,
      gandhiStoryEligible: false,
      gandhiEncounterFinished: false,
      gandhiDead: false,
      darkGandhiDefeated: false,
      gandhiPassOriginSide: null,
      gandhiPassEnteredZone: false,
      gandhiPassCompleted: false,
      gandhiSticksLooted: false,
      ...extra
    };
  }

  function normalizeDeveloperScene(scene) {
    if (!scene) return;

    scene.physics?.world?.resume?.();
    scene.cameras?.main?.resetFX?.();
    scene.cameras?.main?.setAlpha?.(1);

    if (scene.player?.active) {
      scene.player.setVisible?.(true);
      scene.player.setActive?.(true);
      scene.player.clearTint?.();
      scene.player.setAlpha?.(1);
      scene.player.setAngle?.(0);

      if (scene.player.body) {
        scene.player.body.enable = true;
        scene.player.body.moves = true;
      }
    }

    scene.__tramSwitching = false;
    scene.tramTransitActive = false;
    scene.rewindActive = false;
    scene.wormholeTeleporting = false;
    scene.inVoid = false;
    scene.blockWorldInteractions?.(450);
  }

  function runDeveloperCheckpoint(game, mode, milk, bahnhof) {
    normalizeDeveloperScene(milk);

    if (mode === "lion-choice") {
      removeDevLoading();
      milk.setupDeveloperLionChoice?.();

      // Watchdog: if a tween/timer is dropped, still expose the real current
      // lion choice instead of leaving a locked developer state.
      window.setTimeout(() => {
        if (
          milk.sys?.isActive?.() &&
          milk.fightLion?.active &&
          !milk.lionChoiceModal &&
          !milk.playerDying
        ) {
          milk.showLionChoiceQuestion?.();
        }
      }, 900);
      return;
    }

    if (mode === "hb") {
      milk.scene.start(
        "BahnhofquaiScene",
        makeDeveloperState({
          hasCityTicket: true
        })
      );

      waitForBahnhofPlayable(game, "hb");
      return;
    }

    if (mode === "post-milkman") {
      milk.scene.start(
        "BahnhofquaiScene",
        makeDeveloperState({
          developerCheckpoint: "post-milkman",
          gandhiStoryEligible: true,
          gandhiPassOriginSide: "right"
        })
      );

      waitForBahnhofPlayable(game, "post-milkman");
    }
  }

  function waitForBahnhofPlayable(game, mode, attempt = 0) {
    const scene = game.scene?.getScene?.("BahnhofquaiScene");

    if (
      scene?.sys?.isActive?.() &&
      scene.player?.active
    ) {
      if (mode === "post-milkman") {
        const correctMilkman = Boolean(
          scene.milkman?.active &&
          scene.milkman.__milkmanV15 &&
          scene.milkmanDefeated
        );

        if (!correctMilkman && attempt < 120) {
          window.setTimeout(
            () => waitForBahnhofPlayable(game, mode, attempt + 1),
            50
          );
          return;
        }

        if (!correctMilkman) {
          console.error(
            "Runtime Stability v28: ENDE MILCHMANN hat keinen aktuellen " +
            "Milkman-v15-Körper erzeugt."
          );
        }
      }

      normalizeDeveloperScene(scene);
      removeDevLoading();
      return;
    }

    if (attempt > 160) {
      console.error(
        `Runtime Stability v28: Bahnhof-Checkpoint ${mode} blieb beim Start hängen.`
      );
      removeDevLoading();
      return;
    }

    window.setTimeout(
      () => waitForBahnhofPlayable(game, mode, attempt + 1),
      50
    );
  }

  window.SimonDeveloperV28 = Object.freeze({
    version: "28",
    blockWorld(ms = 750) {
      window.__SIMON_WORLD_INTERACTION_BLOCK_UNTIL__ = Math.max(
        Number(window.__SIMON_WORLD_INTERACTION_BLOCK_UNTIL__) || 0,
        Date.now() + Math.max(0, Number(ms) || 0)
      );
    }
  });
})();
