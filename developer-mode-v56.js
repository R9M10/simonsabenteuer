(() => {
  "use strict";

  if (window.__SIMON_DEVELOPER_MODE_V56__) return;
  window.__SIMON_DEVELOPER_MODE_V56__ = true;

  const VERSION = 56;

  const CHECKPOINTS = Object.freeze([
    {
      label: "1. LÖWENAUSWAHL",
      detail: "Milchbuck · direkt vor JA / KÄMPFEN beim HIVE.",
      mode: "lion-choice"
    },
    {
      label: "2. HIVE / FRAU",
      detail: "HIVE-Innenraum · Frau / Flirt-System testen.",
      mode: "hive-test"
    },
    {
      label: "3. BAHNHOFSTRASSE / HB",
      detail: "Erste Ankunft in der Stadt.",
      mode: "hb"
    },
    {
      label: "4. ORELL / KASSIERERIN",
      detail: "Erster Orell-Füssli-Besuch und Kassiererin-Story.",
      mode: "cashier-test",
      before() {
        window.SimonCashierV54?.reset?.();
      }
    },
    {
      label: "5. ENDE MILCHMANN",
      detail: "Milchmann besiegt · Simon startet beim Inder.",
      mode: "post-milkman"
    },
    {
      label: "6. ZOFINGIA / ENRIQUE",
      detail: "Enriques erstes Gespräch / Flirt-Lernen.",
      mode: "zofingia-test"
    },
    {
      label: "7. POLYBAHN / ETH",
      detail: "Bahnhofstrasse · direkt bei der Polybahn. Developer umgeht Story-Lock.",
      mode: "eth-test"
    },
    {
      label: "8. MILCHBUCK / ESTHI",
      detail: "Aktueller Esthi-Testcheckpoint.",
      mode: "esthi-test"
    },
    {
      label: "9. VENEDIG",
      detail: "Stazione Venezia · Fernreise testen.",
      mode: "venice"
    }
  ]);

  function injectStyles() {
    if (document.getElementById("developer-mode-v56-style")) return;

    const style = document.createElement("style");
    style.id = "developer-mode-v56-style";
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
        padding: 16px 18px 46px !important;
        gap: 11px !important;
      }

      #developer-menu-screen .dev-title {
        flex: 0 0 auto;
        margin: 3px 0 2px !important;
      }

      #developer-menu-screen .dev-v56-subtitle {
        flex: 0 0 auto;
        margin: 0 0 4px;
        max-width: 620px;
        color: #b9c3d4;
        font-family: "Press Start 2P", monospace;
        font-size: 5px;
        line-height: 1.55;
      }

      #developer-menu-screen .dev-destinations {
        flex: 0 0 auto;
        width: min(94%, 620px) !important;
        gap: 8px !important;
        padding-bottom: 28px;
      }

      #developer-menu-screen .dev-destination {
        flex: 0 0 auto;
        min-height: 54px !important;
      }

      #developer-menu-screen .dev-v56-normal {
        border-color: #9fd4b3;
        background: #20372b;
      }

      @media (max-height: 430px) {
        #developer-menu-screen {
          padding-top: 10px !important;
          padding-bottom: 32px !important;
        }

        #developer-menu-screen .dev-destination {
          min-height: 48px !important;
          padding: 7px 11px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function launch(mode, before = null) {
    try {
      before?.();
    } catch (error) {
      console.error("[DEV v56] Checkpoint-Vorbereitung fehlgeschlagen:", error);
    }

    if (typeof window.launchGame !== "function") {
      console.error("[DEV v56] window.launchGame fehlt.");
      return;
    }

    window.launchGame({
      startMode: mode,
      developerMode: true
    });
  }

  function makeButton(definition) {
    const button = document.createElement("button");
    button.className = "dev-action dev-destination";
    button.type = "button";
    button.dataset.devTarget = definition.mode;

    const label = document.createTextNode(definition.label);
    const small = document.createElement("small");
    small.textContent = definition.detail;

    button.append(label, small);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      launch(definition.mode, definition.before);
    });

    return button;
  }

  function rebuildMenu() {
    const screen = document.getElementById("developer-menu-screen");
    const list = screen?.querySelector(".dev-destinations");
    if (!screen || !list) return false;

    // Replacing the nodes also removes every old stacked dynamic listener from
    // v46/v52/v54/v56. From here on there is exactly ONE routing layer.
    list.replaceChildren();

    const normal = document.createElement("button");
    normal.className =
      "dev-action dev-destination dev-v56-normal";
    normal.type = "button";

    normal.append(
      document.createTextNode("NORMALER START")
    );

    const normalDetail = document.createElement("small");
    normalDetail.textContent =
      "Komplette Story vom Anfang ohne Checkpoint.";
    normal.appendChild(normalDetail);

    normal.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (typeof window.startScene === "function") {
        window.startScene();
      }
    });

    list.appendChild(normal);

    CHECKPOINTS.forEach((definition) => {
      list.appendChild(makeButton(definition));
    });

    if (!screen.querySelector(".dev-v56-subtitle")) {
      const subtitle = document.createElement("p");
      subtitle.className = "dev-v56-subtitle";
      subtitle.textContent =
        "Chronologisch · nach unten scrollen für spätere Checkpoints.";

      const title = screen.querySelector(".dev-title");
      title?.insertAdjacentElement("afterend", subtitle);
    }

    return true;
  }

  injectStyles();

  // script.js is loaded immediately before this file, so one synchronous pass
  // is normally enough. Retry once for browser/cache edge cases.
  rebuildMenu();
  window.setTimeout(rebuildMenu, 0);
  window.setTimeout(rebuildMenu, 120);

  window.SimonDeveloperV56 = Object.freeze({
    VERSION,
    CHECKPOINTS,
    rebuild: rebuildMenu
  });

  console.info(
    "Developer Mode v56: chronologisches, scrollbares Menü mit zentralem Checkpoint-Routing."
  );
})();
