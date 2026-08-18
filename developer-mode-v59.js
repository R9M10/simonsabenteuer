(() => {
  "use strict";

  if (window.__SIMON_DEVELOPER_MODE_V59__) return;
  window.__SIMON_DEVELOPER_MODE_V59__ = true;
  window.__SIMON_DEVELOPER_MODE_V58__ = true;

  const VERSION = 59;

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

  function removeOldDevLoading() {
    document
      .querySelectorAll(
        "[data-simon-dev-v29]"
      )
      .forEach((node) => node.remove());
  }

  function showGameScreen() {
    [
      "start-screen",
      "developer-gate-screen",
      "developer-menu-screen",
      "scene-screen"
    ].forEach((id) => {
      const node =
        document.getElementById(id);

      node?.classList?.add("hidden");
      node?.setAttribute?.(
        "aria-hidden",
        "true"
      );
    });

    const gameScreen =
      document.getElementById(
        "game-screen"
      );

    gameScreen?.classList?.remove("hidden");
    gameScreen?.setAttribute?.(
      "aria-hidden",
      "false"
    );
  }

  function showStageLabel(label) {
    removeOldDevLoading();

    const root =
      document.getElementById(
        "phaser-game"
      );

    if (!root) return null;

    root
      .querySelectorAll(
        '[data-simon-ui="dev-stage-v58"]'
      )
      .forEach((node) => node.remove());

    const node =
      document.createElement("div");

    node.dataset.simonUi =
      "dev-stage-v58";

    node.textContent =
      `DEV · ${label}`;

    Object.assign(node.style, {
      position: "absolute",
      top: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "700000",
      padding: "8px 11px",
      border: "2px solid #d9bc76",
      background: "rgba(28,32,38,.94)",
      color: "#fff0c7",
      fontFamily:
        '"Press Start 2P", monospace',
      fontSize: "6px",
      pointerEvents: "none"
    });

    root.appendChild(node);

    window.setTimeout(
      () => node.remove(),
      1200
    );

    return node;
  }

  function showDeveloperFailure(
    label,
    message
  ) {
    removeOldDevLoading();

    const root =
      document.getElementById(
        "phaser-game"
      );

    if (!root) return;

    root
      .querySelectorAll(
        '[data-simon-ui="dev-error-v59"]'
      )
      .forEach(
        (node) => node.remove()
      );

    const box =
      document.createElement("div");

    box.dataset.simonUi =
      "dev-error-v59";

    Object.assign(
      box.style,
      {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform:
          "translate(-50%, -50%)",
        zIndex: "900000",
        width: "min(82%, 520px)",
        boxSizing: "border-box",
        padding: "16px",
        border:
          "3px solid #d99b65",
        background:
          "rgba(33,28,29,.97)",
        color: "#fff1d0",
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize: "7px",
        lineHeight: "1.7",
        textAlign: "center"
      }
    );

    box.textContent =
      `DEV ${label}\n\n${message}`;

    root.appendChild(box);
  }

  function waitFor(
    predicate,
    onReady,
    {
      attempts = 160,
      delay = 60,
      label = "checkpoint"
    } = {}
  ) {
    let count = 0;

    const tick = () => {
      count += 1;

      let value = null;

      try {
        value = predicate?.();
      } catch (error) {
        console.error(
          `[DEV v58] ${label} predicate:`,
          error
        );
      }

      if (value) {
        removeOldDevLoading();

        try {
          onReady?.(value);
        } catch (error) {
          console.error(
            `[DEV v58] ${label} staging:`,
            error
          );
        }
        return;
      }

      if (count < attempts) {
        window.setTimeout(
          tick,
          delay
        );
        return;
      }

      removeOldDevLoading();

      console.error(
        `[DEV v58] ${label} timed out.`
      );
    };

    tick();
  }

  function makeDevState(extra = {}) {
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

      hotbarItems: [
        "ticket",
        null,
        null,
        null,
        null
      ],

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

  function stopCheckpointScenes(game) {
    if (!game?.scene) return;

    [
      "BahnhofquaiScene",
      "HiveInteriorScene",
      "WGInteriorScene",
      "SimonRoomScene",
      "OerlikonScene",
      "PolybahnTransitScene",
      "PolyterrasseScene",
      "ETHInteriorScene",
      "VeniceScene",
      "PalazzoMediciScene"
    ].forEach((key) => {
      try {
        if (
          game.scene.keys?.[key] &&
          (
            game.scene.isActive?.(key) ||
            game.scene.isPaused?.(key)
          )
        ) {
          game.scene.stop(key);
        }
      } catch {}
    });
  }

  function bootShell(onReady, label) {
    showGameScreen();
    removeOldDevLoading();
    showStageLabel(label);

    let game = getGame();
    let createdNow = false;

    if (!game) {
      try {
        createdNow = true;

        // "dev-shell" bypasses the normal flight intro.
        // developerMode:false prevents runtime-stability-v29 from entering
        // its old DEV CHECKPOINT pipeline.
        game = window.startSimonGame?.({
          startMode: "dev-shell",
          developerMode: false
        });
      } catch (error) {
        console.error(
          "[DEV v59] Phaser boot failed:",
          error
        );
      }
    }

    if (!game) {
      waitFor(
        () => getGame(),
        (readyGame) => {
          bootShell(
            () => onReady?.(readyGame),
            label
          );
        },
        {
          attempts: 240,
          delay: 50,
          label:
            `${label} game object`
        }
      );
      return;
    }

    const bootStartedAt = Date.now();

    const waitForMilk = () => {
      // CRITICAL v59 FIX:
      // new Phaser.Game() returns BEFORE its SceneManager has finished booting.
      // v58 called game.scene.start("MilchbuckScene") immediately here. That
      // could interrupt the automatic first-scene lifecycle and leave nothing
      // except the canvas background color.
      //
      // On a newly created game we DO NOT call any SceneManager mutation until
      // the automatically configured MilchbuckScene has loaded Simon.
      let milk = null;

      try {
        milk =
          game.scene?.getScene?.(
            "MilchbuckScene"
          ) || null;
      } catch {
        milk = null;
      }

      if (
        milk?.sys?.isActive?.() &&
        milk.player?.active &&
        milk.textures?.exists?.(
          "simon"
        )
      ) {
        stopCheckpointScenes(game);
        removeOldDevLoading();
        onReady?.(game);
        return;
      }

      const elapsed =
        Date.now() - bootStartedAt;

      if (
        !createdNow &&
        game.isBooted &&
        elapsed > 250 &&
        milk &&
        !milk.sys?.isActive?.() &&
        !milk.sys?.isPaused?.()
      ) {
        // Existing game from a prior developer test: it is safe to restart the
        // shell because Phaser itself is already fully booted.
        createdNow = true;

        try {
          stopCheckpointScenes(game);
          game.scene.start(
            "MilchbuckScene"
          );
        } catch (error) {
          console.error(
            "[DEV v59] Milchbuck recovery start:",
            error
          );
        }
      }

      if (elapsed < 12000) {
        window.setTimeout(
          waitForMilk,
          50
        );
        return;
      }

      removeOldDevLoading();

      console.error(
        `[DEV v59] ${label}: MilchbuckScene wurde nach Phaser-Boot nicht spielbar.`
      );

      showDeveloperFailure(
        label,
        "Die Basis-Szene konnte nicht vollständig starten. Bitte Seite neu laden."
      );
    };

    // Do not even query/start scenes synchronously after new Phaser.Game().
    window.setTimeout(
      waitForMilk,
      0
    );
  }

  function startBahnhof(
    extra,
    onReady,
    label
  ) {
    bootShell(
      (game) => {
        removeOldDevLoading();

        try {
          const milk =
            getScene(
              "MilchbuckScene"
            );

          const data =
            makeDevState(extra);

          if (
            milk?.sys?.isActive?.() &&
            milk.scene?.start
          ) {
            // ScenePlugin.start atomically replaces the active Milchbuck shell,
            // so we never leave two full overworld scenes updating at once.
            milk.scene.start(
              "BahnhofquaiScene",
              data
            );
          } else {
            game.scene.start(
              "BahnhofquaiScene",
              data
            );
          }
        } catch (error) {
          console.error(
            `[DEV v58] ${label} Bahnhof start:`,
            error
          );
          return;
        }

        waitFor(
          () => {
            const scene =
              getScene(
                "BahnhofquaiScene"
              );

            return (
              scene?.sys?.isActive?.() &&
              scene.player?.active &&
              scene.textures?.exists?.(
                "simon"
              )
            )
              ? scene
              : null;
          },
          (scene) => {
            // Skip decorative arrival for developer checkpoints.
            scene.forceFinishBahnhofArrival?.();

            scene.developerMode = true;
            scene.coins = 999999;
            scene.uiLocked = false;
            scene.tramTransitActive = false;
            scene.__tramSwitching = false;

            scene.physics?.world?.resume?.();

            if (scene.input) {
              scene.input.enabled = true;
            }

            scene.player?.setVisible?.(
              true
            );
            scene.player?.setActive?.(
              true
            );
            scene.player?.setVelocity?.(
              0,
              0
            );

            if (scene.player?.body) {
              scene.player.body.enable =
                true;
              scene.player.body.moves =
                true;
            }

            scene.setUILocked?.(false);
            scene.refreshUILock?.();
            scene.setControlsVisible?.(
              true
            );
            scene.updateCoinHUD?.();
            scene.updateHpBar?.();
            scene.refreshHotbar?.();
            scene.ensureTicketMachineInteractive?.();
            scene.ensureTramBoardingInteractive?.();

            scene.cameras.main.resetFX?.();
            scene.cameras.main.setAlpha?.(
              1
            );
            scene.cameras.main.startFollow(
              scene.player,
              true,
              0.11,
              0.11
            );

            onReady?.(
              scene,
              game
            );
          },
          {
            attempts: 200,
            delay: 50,
            label
          }
        );
      },
      label
    );
  }

  function checkpointLion() {
    bootShell(
      () => {
        const milk =
          getScene("MilchbuckScene");

        milk.developerMode = true;
        milk.coins = 999999;
        milk.updateCoinHUD?.();

        removeOldDevLoading();
        milk.setupDeveloperLionChoice?.();
      },
      "LÖWENAUSWAHL"
    );
  }

  function checkpointHive() {
    bootShell(
      () => {
        const milk =
          getScene("MilchbuckScene");

        milk.developerMode = true;
        milk.coins = 999999;
        milk.hiveEntranceUnlocked = true;
        milk.updateCoinHUD?.();

        removeOldDevLoading();

        if (
          typeof milk.enterHiveDance ===
          "function"
        ) {
          milk.enterHiveDance();
        } else {
          console.error(
            "[DEV v58] HIVE enterHiveDance fehlt."
          );
        }
      },
      "HIVE"
    );
  }

  function checkpointHb() {
    startBahnhof(
      {},
      (scene) => {
        scene.player?.setPosition?.(
          690,
          250
        );
        scene.ensureDeveloperTramReady?.();
      },
      "BAHNHOFSTRASSE / HB"
    );
  }

  function checkpointCashier() {
    window.SimonCashierV54?.reset?.();

    startBahnhof(
      {},
      (scene) => {
        const x =
          Number(
            scene.bookstoreHitbox?.x
          ) || 2080;

        scene.player?.setPosition?.(
          Math.max(
            80,
            x - 170
          ),
          250
        );

        scene.player?.setVelocity?.(
          0,
          0
        );

        scene.cameras.main.startFollow(
          scene.player,
          true,
          0.11,
          0.11
        );
      },
      "ORELL / KASSIERERIN"
    );
  }

  function checkpointPostMilkman() {
    startBahnhof(
      {
        developerCheckpoint:
          "post-milkman",
        gandhiStoryEligible: true,
        gandhiPassOriginSide:
          "right"
      },
      () => {},
      "ENDE MILCHMANN"
    );
  }

  function checkpointEnrique() {
    startBahnhof(
      {
        enriqueSpoken: false
      },
      (scene) => {
        const flirt =
          window.__SIMON_FLIRT_STATE_V46__ ||
          window.__SIMON_FLIRT_STATE_V40__;

        if (flirt) {
          flirt.enriqueIntroCompleted =
            false;

          if (
            Array.isArray(
              flirt.learnedFlirts
            )
          ) {
            const index =
              flirt.learnedFlirts.indexOf(
                "secondLook"
              );

            if (index >= 0) {
              flirt.learnedFlirts.splice(
                index,
                1
              );
            }
          }
        }

        waitFor(
          () =>
            scene.__sv37Promenade
              ?.zone ||
            null,
          (zone) => {
            scene.uiLocked = false;
            scene.setUILocked?.(false);
            scene.refreshUILock?.();

            scene.player?.setPosition?.(
              Number(zone.x) - 90,
              250
            );
            scene.player?.setVelocity?.(
              0,
              0
            );

            zone.emit?.(
              "pointerdown",
              {
                event: {
                  preventDefault() {},
                  stopPropagation() {},
                  stopImmediatePropagation() {}
                }
              }
            );
          },
          {
            attempts: 130,
            delay: 60,
            label: "ZOFINGIA"
          }
        );
      },
      "ZOFINGIA / ENRIQUE"
    );
  }

  function checkpointOerlikon() {
    window
      .SimonEsthiOerlikonV57
      ?.resetStory?.();

    startBahnhof(
      {
        enriqueSpoken: true
      },
      (scene, game) => {
        scene.enriqueSpoken = true;

        window
          .SimonOerlikonV59
          ?.install?.(game);

        window.setTimeout(
          () => {
            const ok =
              window
                .SimonOerlikonV59
                ?.enterDeveloper?.();

            if (!ok) {
              console.error(
                "[DEV v58] Oerlikon start failed."
              );
            }
          },
          80
        );
      },
      "OERLIKON / ESTHI"
    );
  }

  function checkpointPolybahn() {
    const cashier =
      window
        .__SIMON_CASHIER_STATE_V54__;

    if (cashier) {
      cashier.firstCrushThoughtSeen =
        true;
      cashier.inspirationHintSeen =
        true;
      cashier.needsInspiration =
        true;
    }

    startBahnhof(
      {
        enriqueSpoken: true
      },
      (scene, game) => {
        scene.enriqueSpoken = true;

        window
          .SimonETHV59
          ?.install?.(game);

        window.setTimeout(() => {
          const x =
            window
              .SimonETHV59
              ?.status?.()
              ?.hitboxes
              ?.bahnhofPolybahnX ||
            880;

          scene.player?.setPosition?.(
            x - 125,
            250
          );

          scene.player?.setVelocity?.(
            0,
            0
          );

          scene.cameras.main.startFollow(
            scene.player,
            true,
            0.11,
            0.11
          );
        }, 80);
      },
      "POLYBAHN / ETH"
    );
  }

  function checkpointVenice() {
    startBahnhof(
      {
        enriqueSpoken: true,
        longDistanceTicketsUnlocked:
          true,
        hasLongDistanceTicket:
          true
      },
      (scene) => {
        scene.enriqueSpoken = true;
        scene.longDistanceTicketsUnlocked =
          true;
        scene.hasLongDistanceTicket =
          true;

        scene.ensureDeveloperTramReady?.();
        scene.ensureTramBoardingInteractive?.();

        window.setTimeout(() => {
          scene.startVeniceDeparture?.();
        }, 120);
      },
      "VENEDIG"
    );
  }

  const CHECKPOINTS = Object.freeze([
    {
      label: "1. LÖWENAUSWAHL",
      detail:
        "Milchbuck · direkt vor JA / KÄMPFEN.",
      run: checkpointLion
    },
    {
      label: "2. HIVE / FRAU",
      detail:
        "HIVE-Innenraum · Frau und Flirts.",
      run: checkpointHive
    },
    {
      label:
        "3. BAHNHOFSTRASSE / HB",
      detail:
        "Bahnhofstrasse direkt spielbar.",
      run: checkpointHb
    },
    {
      label:
        "4. ORELL / KASSIERERIN",
      detail:
        "Erster Kassiererin-Storypunkt.",
      run: checkpointCashier
    },
    {
      label:
        "5. ENDE MILCHMANN",
      detail:
        "Direkt nach dem Milchmann-Kampf.",
      run: checkpointPostMilkman
    },
    {
      label:
        "6. ZOFINGIA / ENRIQUE",
      detail:
        "Enriques erstes Gespräch.",
      run: checkpointEnrique
    },
    {
      label:
        "7. OERLIKON / ESTHI",
      detail:
        "Salersteig, WG und Kirchenpark.",
      run: checkpointOerlikon
    },
    {
      label:
        "8. POLYBAHN / ETH",
      detail:
        "Freigeschaltete Polybahn / ETH.",
      run: checkpointPolybahn
    },
    {
      label: "9. VENEDIG",
      detail: "Direkte Fernreise.",
      run: checkpointVenice
    }
  ]);

  function injectStyles() {
    if (
      document.getElementById(
        "developer-mode-v59-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "developer-mode-v59-style";

    style.textContent = `
      #developer-menu-screen {
        justify-content: flex-start !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        box-sizing: border-box;
        height: 100dvh;
        max-height: 100dvh;
        padding: 14px 18px 54px !important;
        gap: 10px !important;
      }

      #developer-menu-screen
      .dev-destinations {
        flex: 0 0 auto;
        width: min(94%, 640px) !important;
        gap: 8px !important;
        padding-bottom: 34px;
      }

      #developer-menu-screen
      .dev-destination {
        flex: 0 0 auto;
        min-height: 52px !important;
      }

      #developer-menu-screen
      .dev-v59-subtitle {
        max-width: 620px;
        color: #b9c3d4;
        font:
          5px/1.6
          "Press Start 2P",
          monospace;
        margin: 0 0 4px;
      }

      @media (max-height: 430px) {
        #developer-menu-screen {
          padding-top: 9px !important;
          padding-bottom: 36px !important;
        }

        #developer-menu-screen
        .dev-destination {
          min-height: 46px !important;
          padding: 7px 11px !important;
        }
      }
    `;

    document.head.appendChild(style);
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

    if (!screen || !list) {
      return false;
    }

    list.replaceChildren();

    const normal =
      document.createElement("button");

    normal.className =
      "dev-action dev-destination";

    normal.type = "button";
    normal.textContent =
      "NORMALER START";

    const normalDetail =
      document.createElement("small");

    normalDetail.textContent =
      "Komplette Story vom Anfang.";

    normal.appendChild(
      normalDetail
    );

    normal.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        removeOldDevLoading();

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
        const button =
          document.createElement(
            "button"
          );

        button.className =
          "dev-action dev-destination";

        button.type = "button";
        button.textContent =
          definition.label;

        const small =
          document.createElement(
            "small"
          );

        small.textContent =
          definition.detail;

        button.appendChild(small);

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            removeOldDevLoading();
            definition.run();
          }
        );

        list.appendChild(button);
      }
    );

    screen
      .querySelector(
        ".dev-v57-subtitle"
      )
      ?.remove?.();

    screen
      .querySelector(
        ".dev-v59-subtitle"
      )
      ?.remove?.();

    const subtitle =
      document.createElement("p");

    subtitle.className =
      "dev-v59-subtitle";

    subtitle.textContent =
      "Chronologisch · scrollen für spätere Checkpoints.";

    screen
      .querySelector(".dev-title")
      ?.insertAdjacentElement(
        "afterend",
        subtitle
      );

    return true;
  }

  injectStyles();
  removeOldDevLoading();
  rebuildMenu();

  window.setTimeout(
    rebuildMenu,
    0
  );

  window.setTimeout(
    rebuildMenu,
    120
  );

  window.SimonDeveloperV59 =
    Object.freeze({
      VERSION,
      CHECKPOINTS,
      rebuild: rebuildMenu,
      removeOldDevLoading
    });

  window.SimonDeveloperV58 =
    window.SimonDeveloperV59;

  console.info(
    "Developer Mode v59: wartet auf vollständigen Phaser-Boot vor jedem Checkpoint."
  );
})();
