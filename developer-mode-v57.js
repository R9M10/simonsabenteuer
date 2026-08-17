(() => {
  "use strict";

  if (window.__SIMON_DEVELOPER_MODE_V57__) return;
  window.__SIMON_DEVELOPER_MODE_V57__ = true;

  const VERSION = 57;

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

  function showGameScreen() {
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

    const gameScreen =
      document.getElementById("game-screen");

    gameScreen?.classList?.remove("hidden");
    gameScreen?.setAttribute?.("aria-hidden", "false");
  }

  function waitFor(
    predicate,
    onReady,
    {
      attempts = 180,
      delay = 90,
      label = "checkpoint"
    } = {}
  ) {
    let count = 0;

    const tick = () => {
      count += 1;

      let value = null;

      try {
        value = predicate?.();
      } catch {}

      if (value) {
        try {
          onReady?.(value);
        } catch (error) {
          console.error(
            `[DEV v57] ${label} staging failed:`,
            error
          );
        }
        return;
      }

      if (count < attempts) {
        window.setTimeout(tick, delay);
        return;
      }

      console.error(
        `[DEV v57] ${label} timed out.`
      );
    };

    tick();
  }

  function launchBase(
    startMode,
    after = null,
    label = startMode
  ) {
    showGameScreen();

    if (typeof window.startSimonGame !== "function") {
      console.error("[DEV v57] startSimonGame fehlt.");
      return;
    }

    let game = null;

    try {
      // IMPORTANT: only base-known stable modes are ever passed into the
      // startSimonGame wrapper chain. Custom checkpoint names are staged
      // afterwards and therefore cannot fall through to a blank game state.
      game = window.startSimonGame({
        startMode,
        developerMode: true
      });
    } catch (error) {
      console.error(
        `[DEV v57] ${label} launch failed:`,
        error
      );
      return;
    }

    if (!game) {
      console.error(
        `[DEV v57] ${label}: no Phaser game returned.`
      );
      return;
    }

    after?.(game);
  }

  function stageHb(callback, label) {
    launchBase(
      "hb",
      () => {
        waitFor(
          () => {
            const scene =
              getScene("BahnhofquaiScene");

            return (
              scene?.sys?.isActive?.() &&
              scene.player?.active &&
              scene.arrivalFinished
            )
              ? scene
              : null;
          },
          callback,
          { label }
        );
      },
      label
    );
  }

  function checkpointLion() {
    launchBase("lion-choice", null, "lion-choice");
  }

  function checkpointHive() {
    launchBase(
      "normal",
      () => {
        waitFor(
          () => {
            const scene =
              getScene("MilchbuckScene");

            return (
              scene?.sys?.isActive?.() &&
              scene.player?.active &&
              typeof scene.enterHiveDance === "function"
            )
              ? scene
              : null;
          },
          (scene) => {
            scene.developerMode = true;
            scene.coins = 999999;
            scene.hiveEntranceUnlocked = true;
            scene.updateCoinHUD?.();

            scene.enterHiveDance();
          },
          { label: "HIVE" }
        );
      },
      "HIVE"
    );
  }

  function checkpointHb() {
    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();
        scene.ensureDeveloperTramReady?.();
      },
      "Bahnhofstrasse"
    );
  }

  function checkpointCashier() {
    window.SimonCashierV54?.reset?.();

    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

        const x =
          Number(scene.bookstoreHitbox?.x) ||
          2080;

        scene.player?.setPosition?.(
          Math.max(80, x - 170),
          250
        );

        scene.player?.setVelocity?.(0, 0);
        scene.cameras.main.startFollow(
          scene.player,
          true,
          0.11,
          0.11
        );
      },
      "Orell"
    );
  }

  function checkpointPostMilkman() {
    launchBase(
      "post-milkman",
      null,
      "post-milkman"
    );
  }

  function checkpointEnrique() {
    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

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
            scene.uiLocked = false;
            scene.setUILocked?.(false);
            scene.refreshUILock?.();

            const x =
              Number(zone.x) || 2480;

            scene.player?.setPosition?.(
              x - 90,
              250
            );

            scene.player?.setVelocity?.(0, 0);

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
            attempts: 100,
            delay: 80,
            label: "Zofingia"
          }
        );
      },
      "Zofingia"
    );
  }

  function checkpointPolybahn() {
    // Dev bypass exists, but set the story state too so marker/appearance
    // exactly matches a legitimately unlocked playthrough.
    const cashier =
      window.__SIMON_CASHIER_STATE_V54__;

    if (cashier) {
      cashier.firstCrushThoughtSeen = true;
      cashier.inspirationHintSeen = true;
      cashier.needsInspiration = true;
    }

    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.enriqueSpoken = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

        window.SimonETHV57?.install?.(getGame());

        window.setTimeout(() => {
          const x =
            window.SimonETHV57
              ?.status?.()
              ?.hitboxes
              ?.bahnhofPolybahnX || 360;

          scene.player?.setPosition?.(
            x - 120,
            250
          );
          scene.player?.setVelocity?.(0, 0);
          scene.cameras.main.startFollow(
            scene.player,
            true,
            0.11,
            0.11
          );
        }, 100);
      },
      "Polybahn"
    );
  }

  function checkpointOerlikon() {
    window.SimonEsthiOerlikonV57?.resetStory?.();

    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.enriqueSpoken = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

        window.SimonOerlikonV57?.install?.(
          getGame()
        );

        window.setTimeout(() => {
          const ok =
            window.SimonOerlikonV57
              ?.enterDeveloper?.();

          if (!ok) {
            console.error(
              "[DEV v57] Oerlikon konnte nicht gestartet werden."
            );
          }
        }, 120);
      },
      "Oerlikon"
    );
  }

  function checkpointVenice() {
    stageHb(
      (scene) => {
        scene.developerMode = true;
        scene.enriqueSpoken = true;
        scene.coins = 999999;
        scene.longDistanceTicketsUnlocked = true;
        scene.hasLongDistanceTicket = true;
        scene.updateCoinHUD?.();
        scene.ensureDeveloperTramReady?.();
        scene.ensureTramBoardingInteractive?.();

        window.setTimeout(() => {
          if (
            scene.sys?.isActive?.() &&
            typeof scene.startVeniceDeparture === "function"
          ) {
            scene.startVeniceDeparture();
          }
        }, 180);
      },
      "Venice"
    );
  }

  const CHECKPOINTS = Object.freeze([
    {
      label: "1. LÖWENAUSWAHL",
      detail: "Milchbuck · direkt vor JA / KÄMPFEN.",
      run: checkpointLion
    },
    {
      label: "2. HIVE / FRAU",
      detail: "HIVE-Innenraum · Frau und Flirts testen.",
      run: checkpointHive
    },
    {
      label: "3. BAHNHOFSTRASSE / HB",
      detail: "Stabile Stadt-Ankunft.",
      run: checkpointHb
    },
    {
      label: "4. ORELL / KASSIERERIN",
      detail: "Kassiererin-Story ab dem ersten Orell-Besuch.",
      run: checkpointCashier
    },
    {
      label: "5. ENDE MILCHMANN",
      detail: "Direkt nach dem Milchmann-Kampf.",
      run: checkpointPostMilkman
    },
    {
      label: "6. ZOFINGIA / ENRIQUE",
      detail: "Enriques erstes Gespräch und De zweiti Blick.",
      run: checkpointEnrique
    },
    {
      label: "7. OERLIKON / ESTHI",
      detail: "Salersteig · neue Oerlikon-Zone mit WG und Kirchenpark.",
      run: checkpointOerlikon
    },
    {
      label: "8. POLYBAHN / ETH",
      detail: "Nach dem WEITSICHT-Schritt · Bahnhofstrasse links vor der Polybahn.",
      run: checkpointPolybahn
    },
    {
      label: "9. VENEDIG",
      detail: "Direkte Fernreise ab Bahnhofstrasse.",
      run: checkpointVenice
    }
  ]);

  function injectStyles() {
    if (
      document.getElementById(
        "developer-mode-v57-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = "developer-mode-v57-style";
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

      #developer-menu-screen .dev-v57-subtitle {
        max-width: 620px;
        color: #b9c3d4;
        font: 5px/1.6 "Press Start 2P", monospace;
        margin: 0 0 4px;
      }

      #developer-menu-screen .dev-v57-normal {
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

    list.replaceChildren();

    const normal =
      document.createElement("button");

    normal.className =
      "dev-action dev-destination dev-v57-normal";

    normal.type = "button";
    normal.textContent = "NORMALER START";

    const normalDetail =
      document.createElement("small");

    normalDetail.textContent =
      "Komplette Story vom Anfang.";

    normal.appendChild(normalDetail);

    normal.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (
          typeof window.startScene === "function"
        ) {
          window.startScene();
          return;
        }

        // Failsafe if browser did not expose top-level script function.
        showGameScreen();
        window.startSimonGame?.({
          startMode: "normal",
          developerMode: false
        });
      }
    );

    list.appendChild(normal);

    CHECKPOINTS.forEach((definition) => {
      const button =
        document.createElement("button");

      button.className =
        "dev-action dev-destination";

      button.type = "button";
      button.textContent =
        definition.label;

      const detail =
        document.createElement("small");

      detail.textContent =
        definition.detail;

      button.appendChild(detail);

      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          definition.run();
        }
      );

      list.appendChild(button);
    });

    screen
      .querySelector(".dev-v57-subtitle")
      ?.remove?.();

    const subtitle =
      document.createElement("p");

    subtitle.className =
      "dev-v57-subtitle";

    subtitle.textContent =
      "Chronologisch · nach unten scrollen für spätere Checkpoints.";

    screen
      .querySelector(".dev-title")
      ?.insertAdjacentElement(
        "afterend",
        subtitle
      );

    return true;
  }

  injectStyles();
  rebuildMenu();

  window.setTimeout(rebuildMenu, 0);
  window.setTimeout(rebuildMenu, 150);

  window.SimonDeveloperV57 = Object.freeze({
    VERSION,
    CHECKPOINTS,
    rebuild: rebuildMenu
  });

  console.info(
    "Developer Mode v57: zentrale stabile Checkpoints ohne Custom-startMode-Fallthrough."
  );
})();
