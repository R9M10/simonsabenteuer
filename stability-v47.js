(() => {
  "use strict";

  if (window.__SIMON_STABILITY_V47__) return;
  window.__SIMON_STABILITY_V47__ = true;

  const DIALOG_MIN_MS = 250;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(game, key) {
    try {
      return game?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 1) One hotbar indoors
  // ---------------------------------------------------------------------------
  // v46's indoor hotbar is the one designed to remain interactive while the
  // overworld scene is paused. Therefore KEEP v46's indoor hotbar and hide only
  // the canonical overworld hotbar while an indoor hotbar is present.
  function installNoIndoorHotbarStyle() {
    if (document.getElementById("simon-no-indoor-hotbar-v48")) return;

    const style = document.createElement("style");
    style.id = "simon-no-indoor-hotbar-v48";
    style.textContent = `
      #phaser-game [data-simon-ui="indoor-hotbar-v46"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head?.appendChild?.(style);
  }

  function isInteriorActive() {
    const game = getGame();
    if (!game?.scene) return false;

    const hive = getScene(game, "HiveInteriorScene");
    if (hive?.sys?.isActive?.()) return true;

    const station = getScene(game, "BahnhofquaiScene");
    if (
      station?.sys?.isActive?.() &&
      (station.__sv37ZofingiaOpen || station.__sv36ZofingiaOpen)
    ) {
      return true;
    }

    const palazzo = getScene(game, "PalazzoMediciScene");
    if (palazzo?.sys?.isActive?.()) return true;

    // Convention for every new interior from now on.
    try {
      return Boolean(
        game.scene
          .getScenes?.(true)
          ?.some?.((scene) => scene?.__simonInteriorScene)
      );
    } catch {
      return false;
    }
  }

  function rememberAndHide(node) {
    if (!node) return;

    if (!node.dataset.v48PreviousDisplay) {
      node.dataset.v48PreviousDisplay = node.style.display || "__EMPTY__";
    }

    node.style.display = "none";
    node.style.pointerEvents = "none";
    node.setAttribute?.("aria-hidden", "true");
  }

  function restoreHiddenNode(node) {
    if (!node?.dataset?.v48PreviousDisplay) return;

    const previous = node.dataset.v48PreviousDisplay;
    node.style.display = previous === "__EMPTY__" ? "" : previous;
    node.style.pointerEvents = "";
    node.removeAttribute?.("aria-hidden");
    delete node.dataset.v48PreviousDisplay;
  }

  function syncIndoorHotbarDedup() {
    installNoIndoorHotbarStyle();

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const interiorActive = isInteriorActive();

    const bars = [
      ...root.querySelectorAll('[data-simon-ui="hotbar"]'),
      ...root.querySelectorAll('[data-simon-ui="hotbar-action"]'),
      ...root.querySelectorAll('[data-simon-ui="indoor-hotbar-v46"]')
    ];

    bars.forEach((bar) => {
      if (interiorActive) rememberAndHide(bar);
      else restoreHiddenNode(bar);
    });
  }

  // ---------------------------------------------------------------------------
  // 2) "De zweiti Blick"
  // ---------------------------------------------------------------------------
  function normalizeSecondLookText(value) {
    if (typeof value !== "string") return value;

    return value
      .replace(/\bDer zweite Blick\b/g, "De zweiti Blick")
      .replace(/\bDER ZWEITE BLICK\b/g, "DE ZWEITI BLICK")
      .replace(/\bDe zweite Blick\b/g, "De zweiti Blick")
      .replace(/\bde zweite Blick\b/g, "de zweiti Blick");
  }

  function patchSecondLookCatalog() {
    const api = window.SimonFlirtsV46;
    const secondLook = api?.FLIRTS?.secondLook;

    if (secondLook && secondLook.name !== "De zweiti Blick") {
      secondLook.name = "De zweiti Blick";
    }
  }

  function patchSpeechMethod(scene, methodName, textIndex) {
    if (!scene || typeof scene[methodName] !== "function") return;

    const current = scene[methodName];
    if (current.__secondLookV47) return;

    const original = current.bind(scene);

    const wrapped = function secondLookSpeechV47(...args) {
      if (typeof args[textIndex] === "string") {
        args[textIndex] = normalizeSecondLookText(args[textIndex]);
      }
      return original(...args);
    };

    wrapped.__secondLookV47 = true;
    scene[methodName] = wrapped;
  }

  function patchSecondLookSpeech(game) {
    [
      getScene(game, "MilchbuckScene"),
      getScene(game, "BahnhofquaiScene"),
      getScene(game, "VeniceScene")
    ]
      .filter(Boolean)
      .forEach((scene) => {
        // Base createSpeechBubble(x, y, message, ...)
        patchSpeechMethod(scene, "createSpeechBubble", 2);
      });

    const hive = getScene(game, "HiveInteriorScene");
    // HIVE showSpeechBubble(actor, message, ...)
    patchSpeechMethod(hive, "showSpeechBubble", 1);
  }

  function normalizeExistingDOMText() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const normalized = normalizeSecondLookText(node.nodeValue);
      if (normalized !== node.nodeValue) node.nodeValue = normalized;
    });
  }

  // ---------------------------------------------------------------------------
  // 3) Venice registration / transition hardening
  // ---------------------------------------------------------------------------
  function ensureVeniceRegistered(game) {
    if (!game?.scene) return false;
    if (game.scene.keys?.VeniceScene) return true;

    const VeniceClass = window.__SIMON_VENICE_SCENE_CLASS__;
    if (!VeniceClass) return false;

    try {
      game.scene.add("VeniceScene", VeniceClass, false);
      return Boolean(game.scene.keys?.VeniceScene);
    } catch (error) {
      console.error("[V47] VeniceScene konnte nicht registriert werden:", error);
      return false;
    }
  }

  function patchBahnhofVeniceDeparture(game) {
    const station = getScene(game, "BahnhofquaiScene");
    if (!station || typeof station.startVeniceDeparture !== "function") return;

    const current = station.startVeniceDeparture;
    if (current.__veniceRegistrationV47) return;

    const original = current.bind(station);

    const wrapped = function startVeniceDepartureV47(...args) {
      if (!ensureVeniceRegistered(game)) {
        console.error("[V47] Venedig ist vor der Abfahrt nicht registriert.");
        this.__tramSwitching = false;
        this.tramTransitActive = false;
        this.refreshUILock?.();
        return;
      }

      return original(...args);
    };

    wrapped.__veniceRegistrationV47 = true;
    station.startVeniceDeparture = wrapped;
  }

  function recoverActiveVenice(game) {
    const venice = getScene(game, "VeniceScene");
    if (!venice?.sys?.isActive?.()) return;

    // A running Venice scene that has its player and world but got stuck in the
    // arrival state should recover automatically instead of remaining locked.
    if (
      venice.player?.active &&
      venice.arrivalTram?.active &&
      !venice.arrivalFinished &&
      !venice.__v47ArrivalRecoveryScheduled
    ) {
      venice.__v47ArrivalRecoveryScheduled = true;

      window.setTimeout(() => {
        venice.__v47ArrivalRecoveryScheduled = false;

        if (
          venice.sys?.isActive?.() &&
          !venice.arrivalFinished &&
          venice.player?.active
        ) {
          venice.forceFinishVeniceArrival?.();
        }
      }, 3900);
    }
  }

  // ---------------------------------------------------------------------------
  // 4) Dialogue timing audit / common helper for new dialogue systems
  // ---------------------------------------------------------------------------
  // Existing current systems use:
  // - core dialogueIgnoreUntil (patched to >=250 ms in game.js)
  // - woman v43: 310 ms
  // - acquaintances v41: 280 ms
  // - flirt v46: 300 ms
  // New systems can use this helper instead of inventing another debounce.
  window.SimonDialogueGuardV47 = Object.freeze({
    MIN_MS: DIALOG_MIN_MS,

    create() {
      let last = -Infinity;

      return () => {
        const now = performance.now();
        if (now - last < DIALOG_MIN_MS) return false;
        last = now;
        return true;
      };
    }
  });

  function install(game) {
    syncIndoorHotbarDedup();
    patchSecondLookCatalog();
    patchSecondLookSpeech(game);
    normalizeExistingDOMText();

    if (game) {
      ensureVeniceRegistered(game);
      patchBahnhofVeniceDeparture(game);
      recoverActiveVenice(game);
    }
  }

  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameStabilityV47(options = {}) {
      const game = previousStart.call(this, options);
      install(game);
      return game;
    };
  }

  const loop = () => {
    install(getGame());
    window.requestAnimationFrame(loop);
  };

  syncIndoorHotbarDedup();
  window.requestAnimationFrame(loop);

  console.info(
    "Stability v47 aktiv: Hotbar in Innenräumen entfernt, Dialoge >=250ms, Loot-Priorität, Venice-Recovery."
  );
})();
