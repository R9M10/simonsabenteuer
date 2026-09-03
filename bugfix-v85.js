(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V85__) return;
  window.__SIMON_BUGFIX_V85__ = true;

  const VERSION = 85;
  const BAHNHOF_KEY = "BahnhofquaiScene";
  const INDER_ROOM = '#phaser-game [data-simon-ui="inder-v76-room"]';
  const INDER_CONTROLS = '#phaser-game [data-simon-ui="der-inder-controls"]';
  const INDER_EXIT = '#phaser-game [data-simon-ui="inder-exit-v85"]';
  const ORELL_MENU = '#phaser-game [data-simon-ui="orell-flirt-menu-v85"]';
  const ORELL_DIALOGUE = '#phaser-game [data-simon-ui="orell-flirt-dialogue-v85"]';

  const FLIRT_LABELS = Object.freeze({
    secondLook: "DER ZWEITE BLICK",
    lorenzoVonMatterhorn: "LORENZO VON MATTERHORN",
    snasa: "SNASA",
    tedMosby: "THE TED MOSBY",
    accidentalPlusOne: "THE ACCIDENTAL PLUS-ONE",
    lostBet: "THE LOST BET",
    lastSeat: "THE LAST SEAT"
  });

  const ORELL_FLIRTS = Object.freeze({
    secondLook: [
      ["SIMON", "Ich ha nur nomal müesse luege."],
      ["KASSIERERIN", "Das isch jetzt leider ziemlich herzig gsi."],
      ["SIMON", "Leider?"],
      ["KASSIERERIN", "Für mini Konzentration, ja."]
    ],
    lorenzoVonMatterhorn: [
      ["SIMON", "Hoi. Lorenzo Von Matterhorn."],
      ["KASSIERERIN", "Das tönt wie e sehr teuri Hardcover-Ausgab."],
      ["SIMON", "Ich bin ziemlich bekannt."],
      ["KASSIERERIN", "Ich glaub dir kein Wort. Aber ich mag, wie überzeugt du lügsch."]
    ],
    snasa: [
      ["SIMON", "Ich schaffe übrigens bi de SNASA."],
      ["KASSIERERIN", "Secret NASA?"],
      ["SIMON", "Genau. Mir flüged uf de Smoon."],
      ["KASSIERERIN", "Das isch komplett bescheuert. Ich würd trotzdem mit uf de Smoon."]
    ],
    tedMosby: [
      ["SIMON", "Eigentlich sötti hüt heirate."],
      ["KASSIERERIN", "Oh Gott."],
      ["SIMON", "Sie isch nöd cho."],
      ["KASSIERERIN", "Schlimm. Aber... guet für mich, oder?"]
    ],
    accidentalPlusOne: [
      ["SIMON", "Mini Begleitig isch grad verschwunde. Chunsch spontan mit?"],
      ["KASSIERERIN", "Ja."],
      ["SIMON", "Du weisch nöd mal wohi."],
      ["KASSIERERIN", "Ich suech de Event us. Problem glöst."]
    ],
    lostBet: [
      ["SIMON", "Ich ha e Wette verlore und muess die interessantischti Person im Raum nach em Name frage."],
      ["KASSIERERIN", "Du weisch scho, wie ich heisse, oder?"],
      ["SIMON", "Details."],
      ["KASSIERERIN", "Billige Wette. Leider funktioniert sie."]
    ],
    lastSeat: [
      ["SIMON", "Isch da no frei?"],
      ["KASSIERERIN", "Hinter de Kasse? Eigentlich nöd."],
      ["SIMON", "Schade."],
      ["KASSIERERIN", "Für dich mach ich Platz."]
    ]
  });

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getBahnhof() {
    try { return getGame()?.scene?.getScene?.(BAHNHOF_KEY) || null; }
    catch { return null; }
  }

  function stop(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function root() {
    return document.getElementById("phaser-game");
  }

  // =====================================================================
  // 1) DER INDER — make the street exit actually visible
  // =====================================================================

  function hardExitInder(scene) {
    document.querySelector(INDER_EXIT)?.remove?.();

    try {
      scene?.exitIndianStore?.();
      return;
    } catch (error) {
      console.warn("v85: normaler Inder-Ausgang fehlgeschlagen, Failsafe aktiv.", error);
    }

    document.querySelector(INDER_ROOM)?.remove?.();
    document.querySelector(INDER_CONTROLS)?.remove?.();
    scene.indianStoreOverlay = null;
    scene.indianStoreBackUI = null;
    scene.indianStoreShopUI = null;
    scene.shopModal = null;
    scene.itemInfoModal = null;
    scene.storeEntryModal = null;
    scene.__inderEnteringV76 = false;
    scene.player?.setVisible?.(true);
    scene.player?.setActive?.(true);
    scene.player?.setVelocity?.(0, 0);
    if (scene.player?.body) {
      scene.player.body.enable = true;
      scene.player.body.moves = true;
    }
    scene.player?.play?.("simon-idle", true);
    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();
    scene.cameras?.main?.startFollow?.(scene.player, true, 0.11, 0.11);
    scene.cameras?.main?.setDeadzone?.(240, 80);
  }

  function ensureInderExit(scene) {
    const room = document.querySelector(INDER_ROOM);
    const controls = document.querySelector(INDER_CONTROLS);

    if (!room || !scene?.sys?.isActive?.()) {
      document.querySelector(INDER_EXIT)?.remove?.();
      return false;
    }

    // The old controls exist at z-index 100001 while the v76 room is 660000.
    // Raise them above the room if they exist.
    if (controls) {
      controls.style.zIndex = "720000";
      controls.style.pointerEvents = "none";
      controls.querySelectorAll("button,[role='button']").forEach((button) => {
        button.style.pointerEvents = "auto";
        button.style.position = "relative";
        button.style.zIndex = "720001";
      });
    }

    // Independent failsafe button: no reliance on createIndianStoreDOMControls.
    if (!document.querySelector(INDER_EXIT)) {
      const host = root();
      if (!host) return false;

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.simonUi = "inder-exit-v85";
      button.textContent = "← STRASSE";
      Object.assign(button.style, {
        position: "absolute",
        left: "14px",
        top: "14px",
        zIndex: "760000",
        pointerEvents: "auto",
        touchAction: "manipulation",
        padding: "10px 12px",
        border: "3px solid #f4e3b9",
        borderRadius: "5px",
        background: "#3c3028",
        color: "#fff0c9",
        boxShadow: "4px 4px 0 rgba(0,0,0,.42)",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        lineHeight: "1.2",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent"
      });

      let last = -Infinity;
      const exit = (event) => {
        stop(event);
        const now = performance.now();
        if (now - last < 350) return;
        last = now;
        hardExitInder(scene);
      };

      button.addEventListener("pointerdown", stop, { passive: false });
      button.addEventListener("pointerup", exit, { passive: false });
      button.addEventListener("click", exit, { passive: false });
      host.appendChild(button);
    }

    return true;
  }

  // =====================================================================
  // 3) ORELL FÜSSLI — post-story flirt menu, every learned flirt succeeds
  // =====================================================================

  function learnedFlirts() {
    const state = window.__SIMON_FLIRT_STATE_V46__ || window.__SIMON_FLIRT_STATE_V40__ || {};
    const learned = Array.isArray(state.learnedFlirts) ? state.learnedFlirts : [];
    return learned.filter((id) => FLIRT_LABELS[id] && ORELL_FLIRTS[id]);
  }

  function removeOrellUI() {
    document.querySelector(ORELL_MENU)?.remove?.();
    document.querySelector(ORELL_DIALOGUE)?.remove?.();
  }

  function makeButton(label, action, { muted = false } = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    Object.assign(button.style, {
      width: "100%",
      minHeight: "42px",
      padding: "8px 10px",
      border: muted ? "2px solid #a89b8a" : "2px solid #b06972",
      borderRadius: "5px",
      background: muted ? "#ded3c3" : "#79333b",
      color: muted ? "#463c35" : "#fff1da",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      lineHeight: "1.45",
      cursor: "pointer",
      touchAction: "manipulation"
    });
    const fire = (event) => {
      stop(event);
      action?.();
    };
    button.addEventListener("pointerdown", stop, { passive: false });
    button.addEventListener("pointerup", fire, { passive: false });
    return button;
  }

  function runOrellDialogue(scene, lines, done) {
    removeOrellUI();
    const host = root();
    if (!host || !lines?.length) {
      done?.();
      return;
    }

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "orell-flirt-dialogue-v85";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "820000",
      background: "rgba(0,0,0,.12)",
      pointerEvents: "auto",
      touchAction: "manipulation"
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "absolute",
      left: "50%",
      bottom: "18px",
      transform: "translateX(-50%)",
      width: "min(90%,650px)",
      minHeight: "78px",
      padding: "12px 14px",
      boxSizing: "border-box",
      border: "3px solid #744a43",
      borderRadius: "7px",
      background: "#fff1d8",
      color: "#302824",
      boxShadow: "5px 5px 0 rgba(0,0,0,.4)",
      fontFamily: '"Press Start 2P", monospace'
    });

    const speaker = document.createElement("div");
    Object.assign(speaker.style, {
      color: "#8b3540",
      fontSize: "6px",
      marginBottom: "8px"
    });
    const text = document.createElement("div");
    Object.assign(text.style, { fontSize: "7px", lineHeight: "1.65" });
    const hint = document.createElement("div");
    hint.textContent = "KLICK · WEITER";
    Object.assign(hint.style, {
      marginTop: "8px",
      textAlign: "right",
      color: "#8d7a6e",
      fontSize: "4.5px"
    });
    box.append(speaker, text, hint);
    overlay.appendChild(box);
    host.appendChild(overlay);

    let index = 0;
    let last = -Infinity;
    const render = () => {
      if (!lines[index]) {
        overlay.remove();
        done?.();
        return;
      }
      speaker.textContent = lines[index][0];
      text.textContent = lines[index][1];
    };
    const advance = (event) => {
      stop(event);
      const now = performance.now();
      if (now - last < 260) return;
      last = now;
      index += 1;
      render();
    };
    overlay.addEventListener("pointerdown", stop, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    render();
  }

  function openOrellFlirtMenu(scene) {
    removeOrellUI();
    const host = root();
    if (!host) return;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "orell-flirt-menu-v85";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "815000",
      background: "rgba(12,8,8,.58)",
      display: "grid",
      placeItems: "center",
      pointerEvents: "auto",
      touchAction: "manipulation"
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      width: "min(88%,560px)",
      maxHeight: "82%",
      overflowY: "auto",
      padding: "14px",
      boxSizing: "border-box",
      border: "3px solid #7b3942",
      borderRadius: "8px",
      background: "#eee2ce",
      boxShadow: "7px 7px 0 rgba(0,0,0,.45)",
      fontFamily: '"Press Start 2P", monospace'
    });

    const title = document.createElement("div");
    title.textContent = "MIT DER KASSIERERIN FLIRTEN";
    Object.assign(title.style, {
      marginBottom: "11px",
      color: "#6f2832",
      fontSize: "9px",
      lineHeight: "1.45",
      textAlign: "center"
    });
    panel.appendChild(title);

    const ids = learnedFlirts();
    if (!ids.length) {
      const empty = document.createElement("div");
      empty.textContent = "Du kennsch no kei Flirts. Enrique muss zuerst öppis lehre.";
      Object.assign(empty.style, {
        padding: "10px 4px 14px",
        color: "#5e5148",
        fontSize: "6px",
        lineHeight: "1.7",
        textAlign: "center"
      });
      panel.appendChild(empty);
    }

    ids.forEach((id) => {
      panel.appendChild(makeButton(FLIRT_LABELS[id], () => {
        runOrellDialogue(scene, ORELL_FLIRTS[id], () => openOrellMainMenu(scene));
      }));
    });

    panel.appendChild(makeButton("← ZURÜCK", () => openOrellMainMenu(scene), { muted: true }));
    overlay.appendChild(panel);
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) stop(event);
    }, { passive: false });
    host.appendChild(overlay);
  }

  function openOrellMainMenu(scene) {
    removeOrellUI();
    const host = root();
    if (!host) return;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "orell-flirt-menu-v85";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "815000",
      background: "rgba(12,8,8,.52)",
      display: "grid",
      placeItems: "center",
      pointerEvents: "auto",
      touchAction: "manipulation"
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      width: "min(86%,500px)",
      padding: "14px",
      boxSizing: "border-box",
      border: "3px solid #7b3942",
      borderRadius: "8px",
      background: "#eee2ce",
      boxShadow: "7px 7px 0 rgba(0,0,0,.45)",
      fontFamily: '"Press Start 2P", monospace'
    });

    const title = document.createElement("div");
    title.textContent = "ORELL FÜSSLI · KASSIERERIN";
    Object.assign(title.style, {
      marginBottom: "11px",
      color: "#6f2832",
      fontSize: "9px",
      lineHeight: "1.45",
      textAlign: "center"
    });
    panel.appendChild(title);

    panel.appendChild(makeButton("REDEN", () => {
      runOrellDialogue(scene, [
        ["SIMON", "Hoi."],
        ["KASSIERERIN", "Hoi Simon."],
        ["SIMON", "Alles guet?"],
        ["KASSIERERIN", "Ja. Jetzt grad sogar ziemlich."]
      ], () => openOrellMainMenu(scene));
    }));
    panel.appendChild(makeButton("FLIRTEN", () => openOrellFlirtMenu(scene)));
    panel.appendChild(makeButton("ZURÜCK", () => removeOrellUI(), { muted: true }));
    overlay.appendChild(panel);
    host.appendChild(overlay);
  }

  function ensureOrellFlirt(scene) {
    const cashierState = window.__SIMON_CASHIER_STATE_V54__;
    const zone = scene?.__cashierZoneV54;

    if (
      !cashierState?.cashierRejected ||
      !scene?.bookstoreOverlay ||
      !zone?.active
    ) {
      return false;
    }

    scene.__cashierActionLabelV54?.setText?.("ANSPRECHEN / FLIRTEN");
    scene.__cashierActionLabelV54?.setVisible?.(true);

    if (!zone.__v85OrellFlirt) {
      zone.removeAllListeners?.("pointerdown");
      zone.on("pointerdown", (pointer) => {
        stop(pointer?.event);
        if (
          scene.bookstoreCatalogModal ||
          scene.__cashierStoreDialogueActiveV54 ||
          document.querySelector(ORELL_DIALOGUE)
        ) return;
        openOrellMainMenu(scene);
      });
      zone.__v85OrellFlirt = true;
    }

    if (zone.input) zone.input.enabled = true;
    return true;
  }

  function install() {
    const scene = getBahnhof();
    if (!scene?.sys?.isActive?.()) {
      document.querySelector(INDER_EXIT)?.remove?.();
      removeOrellUI();
      return;
    }

    ensureInderExit(scene);
    ensureOrellFlirt(scene);
  }

  install();
  const timer = window.setInterval(install, 160);

  window.SimonBugfixV85 = Object.freeze({
    VERSION,
    install,
    status() {
      return {
        version: VERSION,
        inderRoomOpen: Boolean(document.querySelector(INDER_ROOM)),
        inderExitVisible: Boolean(document.querySelector(INDER_EXIT)),
        orellFlirtAvailable: Boolean(
          window.__SIMON_CASHIER_STATE_V54__?.cashierRejected &&
          getBahnhof()?.__cashierZoneV54?.active
        )
      };
    },
    stopMaintenance() {
      window.clearInterval(timer);
      document.querySelector(INDER_EXIT)?.remove?.();
      removeOrellUI();
    }
  });

  console.info("Bugfix v85: Inder exit visible + Orell post-story flirting enabled.");
})();
