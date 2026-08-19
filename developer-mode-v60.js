(() => {
  "use strict";

  if (window.__SIMON_DEVELOPER_MODE_V60__) return;
  window.__SIMON_DEVELOPER_MODE_V60__ = true;

  const VERSION = 60;
  let launchLocked = false;

  const CHECKPOINTS = Object.freeze([
    ["lion", "1. LÖWENAUSWAHL", "Milchbuck · direkt zu JA / KÄMPFEN."],
    ["hive", "2. HIVE / FRAU", "HIVE-Innenraum · Frau und Flirts testen."],
    ["hb", "3. BAHNHOFSTRASSE / HB", "Bahnhofstrasse direkt spielbar."],
    ["orell", "4. ORELL / KASSIERERIN", "Direkt beim Orell-Füssli."],
    ["post-milkman", "5. ENDE MILCHMANN", "Direkt nach dem Milchmann-Kampf."],
    ["enrique", "6. ZOFINGIA / ENRIQUE", "Enriques erstes Gespräch."],
    ["oerlikon", "7. OERLIKON / ESTHI", "Salersteig · WG und Kirchenpark."],
    ["polybahn", "8. POLYBAHN / ETH", "Freigeschaltete Polybahn / ETH."],
    ["venice", "9. VENEDIG", "Direkte Fernreise ab Bahnhofstrasse."]
  ].map(([id, label, detail]) => ({ id, label, detail })));

  function getBaseStart() {
    return window.__SIMON_DEVELOPER_BASE_V60__?.start || null;
  }

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

  function scenePlayable(scene) {
    return Boolean(
      scene?.sys?.isActive?.() &&
      scene.player?.active &&
      scene.textures?.exists?.("simon")
    );
  }

  function hideFlowScreens() {
    [
      "start-screen",
      "developer-gate-screen",
      "developer-menu-screen",
      "scene-screen"
    ].forEach((id) => {
      const node = document.getElementById(id);
      node?.classList?.add("hidden");
      node?.setAttribute?.("aria-hidden", "true");
    });

    const gameScreen = document.getElementById("game-screen");
    gameScreen?.classList?.remove("hidden");
    gameScreen?.setAttribute?.("aria-hidden", "false");

    document
      .getElementById("scene-screen")
      ?.classList?.remove("scene-fade-out");
  }

  function clearDevUI() {
    document
      .querySelectorAll(
        "[data-simon-dev-v29]," +
        '[data-simon-ui="dev-stage-v58"],' +
        '[data-simon-ui="dev-stage-v59"],' +
        '[data-simon-ui="dev-error-v59"],' +
        '[data-simon-ui="dev-status-v60"]'
      )
      .forEach((node) => node.remove());
  }

  function showStatus(message, error = false) {
    clearDevUI();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const box = document.createElement("div");
    box.dataset.simonUi = "dev-status-v60";

    Object.assign(box.style, {
      position: "absolute",
      left: "50%",
      top: error ? "50%" : "18px",
      transform: error ? "translate(-50%, -50%)" : "translateX(-50%)",
      zIndex: "950000",
      width: "min(84%, 560px)",
      boxSizing: "border-box",
      padding: error ? "16px" : "9px 12px",
      border: `2px solid ${error ? "#e68c78" : "#d9bd79"}`,
      background: error
        ? "rgba(54,28,30,.97)"
        : "rgba(25,30,37,.95)",
      color: "#fff0ca",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: error ? "7px" : "6px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none"
    });

    box.textContent = message;
    root.appendChild(box);

    if (!error) {
      window.setTimeout(() => box.remove(), 1600);
    }

    return box;
  }

  function fail(label, message) {
    launchLocked = false;
    console.error(`[DEV v60] ${label}: ${message}`);
    showStatus(`DEV FEHLER · ${label}\n${message}`, true);
  }

  function waitFor(predicate, onReady, {
    timeout = 15000,
    interval = 40,
    label = "Checkpoint"
  } = {}) {
    const started = Date.now();

    const tick = () => {
      let value = null;

      try {
        value = predicate();
      } catch (error) {
        console.error(`[DEV v60] ${label} wait:`, error);
      }

      if (value) {
        onReady(value);
        return;
      }

      if (Date.now() - started >= timeout) {
        fail(label, "Zielzustand wurde nicht rechtzeitig spielbar.");
        return;
      }

      window.setTimeout(tick, interval);
    };

    tick();
  }

  function makeDeveloperState(extra = {}) {
    return {
      coins: 999999,
      hp: 100,
      hasCityTicket: true,
      hasLongDistanceTicket: false,
      longDistanceTicketsUnlocked: false,
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
      hotbarItems: ["ticket", null, null, null, null],
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

      enriqueSpoken: false,

      amsifEncounterStarted: false,
      amsifIntroCompleted: false,
      amsifStoryCompleted: false,

      ...extra
    };
  }

  function normalize(scene) {
    if (!scene) return;

    scene.developerMode = true;
    scene.coins = 999999;

    scene.physics?.world?.resume?.();

    if (scene.input) {
      scene.input.enabled = true;
    }

    scene.player?.setActive?.(true);
    scene.player?.setVisible?.(true);
    scene.player?.clearTint?.();
    scene.player?.setAlpha?.(1);
    scene.player?.setAngle?.(0);
    scene.player?.setVelocity?.(0, 0);

    if (scene.player?.body) {
      scene.player.body.enable = true;
      scene.player.body.moves = true;
    }

    scene.tramTransitActive = false;
    scene.__tramSwitching = false;
    scene.rewindActive = false;
    scene.wormholeTeleporting = false;
    scene.inVoid = false;

    scene.cameras?.main?.resetFX?.();
    scene.cameras?.main?.setAlpha?.(1);

    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();

    if (!scene.uiLocked) {
      scene.setControlsVisible?.(true);
    }

    scene.updateCoinHUD?.();
    scene.updateHpBar?.();
    scene.updateInventoryUI?.();
    scene.refreshHotbar?.();
    scene.updateHotbarActionUI?.();

    scene.ensureTicketMachineInteractive?.();
    scene.ensureLockerInteractive?.();
    scene.ensureTramBoardingInteractive?.();
    scene.syncStreetStoreHitboxes?.();

    if (scene.player?.active) {
      scene.cameras?.main?.startFollow?.(
        scene.player,
        true,
        0.11,
        0.11
      );
      scene.cameras?.main?.setDeadzone?.(240, 80);
    }
  }

  function initialiseAllExtensions(game, done) {
    if (game.__devV60ExtensionsReady) {
      done();
      return;
    }

    game.__devV60ExtensionsReady = true;

    try {
      // At this moment the ORIGINAL base game is already fully running.
      // Calling the wrapped function can therefore only initialize wrappers
      // on the existing Phaser.Game; it cannot corrupt the initial boot.
      //
      // dev-shell bypasses Flight Intro.
      // developerMode:false bypasses Runtime Stability v29's DEV_TARGETS.
      if (
        typeof window.startSimonGame === "function" &&
        window.startSimonGame !== getBaseStart()
      ) {
        window.startSimonGame({
          startMode: "dev-shell",
          developerMode: false
        });
      }
    } catch (error) {
      console.error("[DEV v60] wrapper initialization:", error);
    }

    try {
      window.SimonOerlikonV59?.install?.(game);
    } catch {}

    try {
      window.SimonETHV59?.install?.(game);
    } catch {}

    // Give wrapper wait/poll installers time to see the existing game.
    window.setTimeout(done, 160);
  }

  // ------------------------------------------------------------
  // THE KEY v60 BOOT:
  // Always boot one clean NORMAL MilchbuckScene using the captured ORIGINAL
  // game.js function. No wrapper controls the initial Phaser lifecycle.
  // ------------------------------------------------------------
  function bootCleanBase(onReady, label) {
    const baseStart = getBaseStart();

    if (typeof baseStart !== "function") {
      fail(
        label,
        "Originale game.js-Startfunktion wurde nicht vor den Patches gesichert."
      );
      return;
    }

    if (getGame()) {
      fail(
        label,
        "Es läuft bereits ein Spiel. Für einen anderen Checkpoint bitte die Seite neu laden."
      );
      return;
    }

    let game = null;

    try {
      game = baseStart({
        startMode: "normal",
        developerMode: true
      });
    } catch (error) {
      console.error("[DEV v60] original base start:", error);
    }

    if (!game) {
      fail(label, "Phaser.Game konnte nicht erzeugt werden.");
      return;
    }

    // IMPORTANT: no game.scene.start(), stop(), pause() or resume() here.
    // Let Phaser finish the automatically configured first scene by itself.
    waitFor(
      () => {
        const milk = getScene("MilchbuckScene");
        return scenePlayable(milk) ? milk : null;
      },
      (milk) => {
        normalize(milk);

        initialiseAllExtensions(game, () => {
          // Extension initialization may briefly touch UI/input.
          normalize(milk);
          onReady(game, milk);
        });
      },
      {
        timeout: 15000,
        interval: 40,
        label: `${label} · BASIS`
      }
    );
  }

  function startBahnhof(game, milk, extra, onReady, label) {
    if (!scenePlayable(milk)) {
      fail(label, "Milchbuck-Basisszene ist nicht spielbar.");
      return;
    }

    const data = makeDeveloperState(extra);

    try {
      // Now Phaser is fully booted and all wrappers have already initialized.
      // This is a normal ScenePlugin transition from a live scene.
      milk.scene.start(
        "BahnhofquaiScene",
        data
      );
    } catch (error) {
      console.error(`[DEV v60] ${label} Bahnhof start:`, error);
      fail(label, "BahnhofquaiScene konnte nicht gestartet werden.");
      return;
    }

    waitFor(
      () => {
        const scene = getScene("BahnhofquaiScene");
        return scenePlayable(scene) ? scene : null;
      },
      (scene) => {
        scene.forceFinishBahnhofArrival?.();
        normalize(scene);

        // The arrival helper and late stability patches may modify lock/input
        // again on the next task, so normalize once more afterwards.
        window.setTimeout(() => {
          if (!scene.sys?.isActive?.()) {
            fail(label, "BahnhofquaiScene wurde unerwartet beendet.");
            return;
          }

          normalize(scene);
          onReady(scene);
        }, 100);
      },
      {
        timeout: 12000,
        interval: 40,
        label
      }
    );
  }

  function finish(scene, label) {
    normalize(scene);
    clearDevUI();
    showStatus(`DEV · ${label} · BEREIT`);
    launchLocked = false;
  }

  // ------------------------------------------------------------
  // Checkpoints
  // ------------------------------------------------------------
  function runCheckpoint(definition, game, milk) {
    switch (definition.id) {
      case "lion":
        normalize(milk);
        milk.setupDeveloperLionChoice?.();

        window.setTimeout(() => {
          normalize(milk);
          finish(milk, "LÖWENAUSWAHL");
        }, 220);
        return;

      case "hive":
        milk.hiveEntranceUnlocked = true;
        normalize(milk);

        waitFor(
          () =>
            game.scene?.keys?.HiveInteriorScene &&
            typeof milk.enterHiveDance === "function",
          () => {
            try {
              milk.enterHiveDance();
            } catch (error) {
              console.error("[DEV v60] HIVE enter:", error);
              fail("HIVE / FRAU", "HIVE konnte nicht geöffnet werden.");
              return;
            }

            waitFor(
              () => {
                const hive = getScene("HiveInteriorScene");
                return hive?.sys?.isActive?.() ? hive : null;
              },
              () => {
                clearDevUI();
                showStatus("DEV · HIVE / FRAU · BEREIT");
                launchLocked = false;
              },
              {
                timeout: 8000,
                label: "HIVE / FRAU"
              }
            );
          },
          {
            timeout: 8000,
            label: "HIVE-REGISTRIERUNG"
          }
        );
        return;

      case "hb":
        startBahnhof(
          game,
          milk,
          {},
          (scene) => {
            scene.player?.setPosition?.(690, 250);
            scene.ensureDeveloperTramReady?.();
            finish(scene, "BAHNHOFSTRASSE / HB");
          },
          "BAHNHOFSTRASSE / HB"
        );
        return;

      case "orell":
        startBahnhof(
          game,
          milk,
          {},
          (scene) => {
            const x =
              Number(scene.bookstoreHitbox?.x) ||
              2080;

            scene.player?.setPosition?.(
              Math.max(80, x - 170),
              250
            );

            finish(scene, "ORELL / KASSIERERIN");
          },
          "ORELL / KASSIERERIN"
        );
        return;

      case "post-milkman":
        startBahnhof(
          game,
          milk,
          {
            developerCheckpoint: "post-milkman",
            gandhiStoryEligible: true,
            gandhiPassOriginSide: "right"
          },
          (scene) => {
            // Let game.js's own delayed setupDeveloperPostMilkman() finish.
            waitFor(
              () =>
                scene.milkmanDefeated &&
                scene.milkman?.active
                  ? scene
                  : null,
              () => finish(scene, "ENDE MILCHMANN"),
              {
                timeout: 5000,
                interval: 50,
                label: "ENDE MILCHMANN"
              }
            );
          },
          "ENDE MILCHMANN"
        );
        return;

      case "enrique":
        startBahnhof(
          game,
          milk,
          {
            enriqueSpoken: false
          },
          (scene) => stageEnrique(scene),
          "ZOFINGIA / ENRIQUE"
        );
        return;

      case "oerlikon":
        startBahnhof(
          game,
          milk,
          {
            enriqueSpoken: true
          },
          (scene) => stageOerlikon(scene, game),
          "OERLIKON / ESTHI"
        );
        return;

      case "polybahn":
        startBahnhof(
          game,
          milk,
          {
            enriqueSpoken: true
          },
          (scene) => stagePolybahn(scene, game),
          "POLYBAHN / ETH"
        );
        return;

      case "venice":
        startBahnhof(
          game,
          milk,
          {
            enriqueSpoken: true,
            longDistanceTicketsUnlocked: true,
            hasLongDistanceTicket: true
          },
          (scene) => stageVenice(scene),
          "VENEDIG"
        );
        return;

      default:
        fail(definition.label, "Unbekannter Checkpoint.");
    }
  }

  function stageEnrique(scene) {
    scene.enriqueSpoken = false;

    const flirt =
      window.__SIMON_FLIRT_STATE_V46__ ||
      window.__SIMON_FLIRT_STATE_V40__;

    if (flirt) {
      flirt.enriqueIntroCompleted = false;

      if (Array.isArray(flirt.learnedFlirts)) {
        const index =
          flirt.learnedFlirts.indexOf("secondLook");

        if (index >= 0) {
          flirt.learnedFlirts.splice(index, 1);
        }
      }
    }

    waitFor(
      () => scene.__sv37Promenade?.zone || null,
      (zone) => {
        normalize(scene);

        scene.player?.setPosition?.(
          (Number(zone.x) || 2480) - 90,
          250
        );

        try {
          zone.emit?.("pointerdown", {
            event: {
              preventDefault() {},
              stopPropagation() {},
              stopImmediatePropagation() {}
            }
          });
        } catch (error) {
          console.error("[DEV v60] Enrique zone:", error);
        }

        clearDevUI();
        showStatus("DEV · ZOFINGIA / ENRIQUE · BEREIT");
        launchLocked = false;
      },
      {
        timeout: 8000,
        label: "ZOFINGIA / ENRIQUE"
      }
    );
  }

  function stageOerlikon(scene, game) {
    scene.enriqueSpoken = true;
    normalize(scene);

    try {
      window.SimonEsthiOerlikonV57?.resetStory?.();
      window.SimonOerlikonV59?.install?.(game);
    } catch {}

    window.setTimeout(() => {
      const ok =
        window.SimonOerlikonV59?.enterDeveloper?.();

      if (!ok) {
        fail("OERLIKON / ESTHI", "OerlikonScene konnte nicht gestartet werden.");
        return;
      }

      waitFor(
        () => {
          const target = getScene("OerlikonScene");
          return scenePlayable(target) ? target : null;
        },
        (target) => finish(target, "OERLIKON / ESTHI"),
        {
          timeout: 10000,
          label: "OERLIKON / ESTHI"
        }
      );
    }, 100);
  }

  function stagePolybahn(scene, game) {
    scene.enriqueSpoken = true;

    const cashier =
      window.__SIMON_CASHIER_STATE_V54__;

    if (cashier) {
      cashier.firstCrushThoughtSeen = true;
      cashier.inspirationHintSeen = true;
      cashier.needsInspiration = true;
    }

    try {
      window.SimonETHV59?.install?.(game);
    } catch {}

    window.setTimeout(() => {
      const x =
        window.SimonETHV59
          ?.status?.()
          ?.hitboxes
          ?.bahnhofPolybahnX ||
        880;

      scene.player?.setPosition?.(
        x - 135,
        250
      );

      finish(scene, "POLYBAHN / ETH");
    }, 180);
  }

  function stageVenice(scene) {
    scene.enriqueSpoken = true;
    scene.longDistanceTicketsUnlocked = true;
    scene.hasLongDistanceTicket = true;
    scene.updateCoinHUD?.();
    scene.ensureDeveloperTramReady?.();
    scene.ensureTramBoardingInteractive?.();

    if (typeof scene.startVeniceDeparture !== "function") {
      fail("VENEDIG", "Venice-Erweiterung ist nicht verfügbar.");
      return;
    }

    window.setTimeout(() => {
      try {
        scene.startVeniceDeparture();
      } catch (error) {
        console.error("[DEV v60] Venice:", error);
        fail("VENEDIG", "Abfahrt konnte nicht gestartet werden.");
        return;
      }

      clearDevUI();
      launchLocked = false;
    }, 120);
  }

  function launch(definition) {
    if (launchLocked) return;
    launchLocked = true;

    clearDevUI();
    hideFlowScreens();
    showStatus(`DEV · ${definition.label}\nSTARTET…`);

    bootCleanBase(
      (game, milk) => {
        runCheckpoint(
          definition,
          game,
          milk
        );
      },
      definition.label
    );
  }

  // ------------------------------------------------------------
  // Menu
  // ------------------------------------------------------------
  function injectStyles() {
    if (
      document.getElementById(
        "developer-mode-v60-style"
      )
    ) {
      return;
    }

    const style = document.createElement("style");
    style.id = "developer-mode-v60-style";

    style.textContent = `
      #developer-menu-screen {
        justify-content: flex-start !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        height: 100dvh;
        max-height: 100dvh;
        padding: 14px 18px 54px !important;
        gap: 10px !important;
      }

      #developer-menu-screen .dev-destinations {
        flex: 0 0 auto;
        width: min(94%, 640px) !important;
        gap: 8px !important;
        padding-bottom: 34px;
      }

      #developer-menu-screen .dev-destination {
        flex: 0 0 auto;
        min-height: 52px !important;
      }

      #developer-menu-screen .dev-v60-subtitle {
        max-width: 640px;
        color: #b9c3d4;
        font: 5px/1.6 "Press Start 2P", monospace;
        margin: 0 0 4px;
      }

      #developer-menu-screen .dev-v60-normal {
        border-color: #9fd4b3;
        background: #20372b;
      }

      @media (max-height: 430px) {
        #developer-menu-screen {
          padding-top: 9px !important;
          padding-bottom: 36px !important;
        }

        #developer-menu-screen .dev-destination {
          min-height: 46px !important;
          padding: 7px 11px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function checkpointButton(definition) {
    const button = document.createElement("button");

    button.className =
      "dev-action dev-destination";
    button.type = "button";

    button.append(
      document.createTextNode(
        definition.label
      )
    );

    const small =
      document.createElement("small");
    small.textContent =
      definition.detail;
    button.appendChild(small);

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        launch(definition);
      }
    );

    return button;
  }

  function rebuildMenu() {
    const screen =
      document.getElementById(
        "developer-menu-screen"
      );

    const list =
      screen?.querySelector(
        ".dev-destinations"
      );

    if (!screen || !list) return false;

    // The original script.js stored a static NodeList and listeners on the
    // ORIGINAL destination buttons. Removing those nodes makes those listeners
    // irrelevant. Every v60 button has exactly one v60 handler.
    list.replaceChildren();

    const normal =
      document.createElement("button");

    normal.className =
      "dev-action dev-destination dev-v60-normal";
    normal.type = "button";
    normal.textContent =
      "NORMALER START";

    const normalSmall =
      document.createElement("small");
    normalSmall.textContent =
      "Komplette Story vom Anfang.";
    normal.appendChild(normalSmall);

    normal.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (
          typeof window.startScene ===
          "function"
        ) {
          window.startScene();
        }
      }
    );

    list.appendChild(normal);

    CHECKPOINTS.forEach(
      (definition) => {
        list.appendChild(
          checkpointButton(definition)
        );
      }
    );

    screen
      .querySelectorAll(
        ".dev-v57-subtitle," +
        ".dev-v58-subtitle," +
        ".dev-v59-subtitle," +
        ".dev-v60-subtitle"
      )
      .forEach((node) => node.remove());

    const subtitle =
      document.createElement("p");

    subtitle.className =
      "dev-v60-subtitle";

    subtitle.textContent =
      "Direkter Basisstart · danach aktueller Checkpoint.";

    screen
      .querySelector(".dev-title")
      ?.insertAdjacentElement(
        "afterend",
        subtitle
      );

    return true;
  }

  injectStyles();
  clearDevUI();
  rebuildMenu();

  window.setTimeout(rebuildMenu, 0);
  window.setTimeout(rebuildMenu, 120);

  window.SimonDeveloperV60 =
    Object.freeze({
      VERSION,
      CHECKPOINTS,
      rebuild: rebuildMenu,
      baseCaptured:
        Boolean(getBaseStart())
    });

  console.info(
    "Developer Mode v60: cleaner game.js-Boot vor jeder Checkpoint-Transition."
  );
})();
