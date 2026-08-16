(() => {
  "use strict";

  if (window.__SIMON_UI_V32__) return;
  window.__SIMON_UI_V32__ = true;

  const BOOK_TO_ITEM = Object.freeze({
    generalRelativity: "bookGeneralRelativity",
    phaenomenologie: "bookPhaenomenologie",
    playbook: "bookPlaybook",
    zarathustra: "bookZarathustra"
  });

  const state = {
    frames: 0,
    gameSeen: false,
    hivePatched: false,
    hiveResets: 0,
    dialogueStarts: 0,
    dialogueFinishes: 0,
    shopSorts: 0,
    shopIconsUnified: 0,
    lionNoRemoved: 0,
    indianSellerPatched: false
  };

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

  function ensureStyle() {
    if (document.getElementById("simon-ui-v32-style")) return;

    const style = document.createElement("style");
    style.id = "simon-ui-v32-style";
    style.textContent = `
      /* Shops deliberately do NOT show an extra hotbar preview. */
      #phaser-game [data-sv30-shop-inventory],
      #phaser-game [data-sv29-shop-inventory],
      #phaser-game [data-sv31-shop-inventory],
      #phaser-game [data-sv31-inder-profile] {
        display: none !important;
      }

      #phaser-game [data-simon-ui="sv32-girl-dialogue-lock"] {
        position: absolute;
        inset: 0;
        z-index: 300000;
        pointer-events: auto;
        touch-action: manipulation;
        background: transparent;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
    `;

    document.head.appendChild(style);
  }

  function removeLegacyShopExtras(root = document) {
    root.querySelectorAll?.(
      "#phaser-game [data-sv30-shop-inventory], " +
      "#phaser-game [data-sv29-shop-inventory], " +
      "#phaser-game [data-sv31-shop-inventory], " +
      "#phaser-game [data-sv31-inder-profile]"
    ).forEach((node) => node.remove());
  }

  function sameItemIcon(scene, itemKey, size = 44) {
    if (!scene?.createDOMItemIcon || !itemKey) return null;

    try {
      const icon = scene.createDOMItemIcon(itemKey, size);
      if (!icon) return null;
      icon.dataset.sv32ItemIcon = itemKey;
      return icon;
    } catch (error) {
      console.warn("v32: Item-Icon konnte nicht erzeugt werden:", itemKey, error);
      return null;
    }
  }

  function sortByPrice(entries) {
    return [...entries].sort((a, b) => {
      const pa = Number(a.price);
      const pb = Number(b.price);

      if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) {
        return pa - pb;
      }

      return String(a.name || "").localeCompare(String(b.name || ""), "de");
    });
  }

  function unifyCardIcon(scene, card, itemKey, kind) {
    if (!card || !itemKey) return;
    if (card.dataset.sv32UnifiedIcon === itemKey) return;

    const icon = sameItemIcon(scene, itemKey, kind === "books" ? 42 : 44);
    if (!icon) return;

    const children = [...card.children];
    const oldIcon = kind === "books" ? children[0] : children[1];

    if (!oldIcon || oldIcon.tagName === "BUTTON") return;

    Object.assign(icon.style, {
      gridColumn: "1",
      gridRow: "1 / 4",
      justifySelf: "center",
      alignSelf: "center"
    });

    oldIcon.replaceWith(icon);
    card.dataset.sv32UnifiedIcon = itemKey;
    state.shopIconsUnified += 1;
  }

  function decorateIndianShop(scene) {
    const modal = scene?.shopModal;
    if (!modal?.panel) return;

    removeLegacyShopExtras(modal.panel);

    const buttons = [...modal.panel.querySelectorAll("[data-store-buy]")];
    if (!buttons.length) return;

    const entries = buttons.map((button) => {
      const key = button.dataset.storeBuy;
      const item = scene.getItemDefinition?.(key) || {};

      return {
        key,
        name: item.name || key,
        price: item.price,
        card: button.parentElement
      };
    }).filter((entry) => entry.card);

    const list = entries[0]?.card?.parentElement;
    if (!list) return;

    const fingerprint = sortByPrice(entries)
      .map((entry) => `${entry.key}:${Number(entry.price)}`)
      .join("|");

    if (list.dataset.sv32SortFingerprint !== fingerprint) {
      sortByPrice(entries).forEach((entry) => list.appendChild(entry.card));
      list.dataset.sv32SortFingerprint = fingerprint;
      state.shopSorts += 1;
    }

    entries.forEach((entry) => {
      unifyCardIcon(scene, entry.card, entry.key, "inder");
    });
  }

  function decorateBookShop(scene) {
    const modal = scene?.bookstoreCatalogModal;
    if (!modal?.panel) return;

    removeLegacyShopExtras(modal.panel);

    const defs = scene.getBookDefinitions?.() || {};
    const buttons = [...modal.panel.querySelectorAll("[data-book-buy]")];
    if (!buttons.length) return;

    const entries = buttons.map((button) => {
      const key = button.dataset.bookBuy;
      const book = defs[key] || {};

      return {
        key,
        itemKey: BOOK_TO_ITEM[key],
        name: book.title || key,
        price: book.price,
        card: button.parentElement
      };
    }).filter((entry) => entry.card);

    const list = entries[0]?.card?.parentElement;
    if (!list) return;

    const fingerprint = sortByPrice(entries)
      .map((entry) => `${entry.key}:${Number(entry.price)}`)
      .join("|");

    if (list.dataset.sv32SortFingerprint !== fingerprint) {
      sortByPrice(entries).forEach((entry) => list.appendChild(entry.card));
      list.dataset.sv32SortFingerprint = fingerprint;
      state.shopSorts += 1;
    }

    entries.forEach((entry) => {
      unifyCardIcon(scene, entry.card, entry.itemKey, "books");
    });
  }

  function patchLionChoice(scene) {
    const panel = scene?.lionChoiceModal?.panel;
    if (!panel) return;

    const buttons = [...panel.querySelectorAll("button")];
    const noButtons = buttons.filter(
      (button) => button.textContent?.trim().toUpperCase() === "NEIN"
    );

    if (!noButtons.length) return;

    const parent = noButtons[0].parentElement;
    noButtons.forEach((button) => button.remove());

    if (parent) {
      Object.assign(parent.style, {
        gridTemplateColumns: "1fr 1fr",
        gap: "10px"
      });
    }

    state.lionNoRemoved += noButtons.length;
  }

  function drawOfferGraphic(graphics, kind) {
    if (!graphics) return;
    graphics.clear();

    if (kind === "cigarette") {
      graphics.fillStyle(0xf5f0df, 1);
      graphics.fillRect(-14, -3, 27, 6);
      graphics.lineStyle(1, 0x66543b, 1);
      graphics.strokeRect(-14, -3, 27, 6);
      graphics.fillStyle(0xc78a44, 1);
      graphics.fillRect(-14, -3, 8, 6);
      graphics.fillStyle(0xef5538, 1);
      graphics.fillRect(12, -2, 3, 4);
      return;
    }

    graphics.fillStyle(0x4e7b3b, 1);
    graphics.fillTriangle(-2, -15, 5, -8, -8, -8);
    graphics.fillStyle(0x5b2f78, 1);
    graphics.fillEllipse(0, 1, 19, 30);
    graphics.lineStyle(2, 0x35203f, 1);
    graphics.strokeEllipse(0, 1, 19, 30);
  }

  function animateIndianSeller(scene, seller) {
    if (!seller || seller.__sv32SellerAnimated) return seller;
    seller.__sv32SellerAnimated = true;

    // Only the actual shop-room seller is animated. Nothing is added to the
    // purchase modal itself.
    seller.y -= 8;
    seller.setScale?.(1.12);

    scene.tweens?.add?.({
      targets: seller,
      x: seller.x + 4,
      y: seller.y - 2,
      angle: { from: -1.8, to: 1.8 },
      duration: 480,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    const offer = scene.add.container(49, 8);
    const graphic = scene.add.graphics();

    const offerText = scene.add.text(0, -28, "ZIGI?", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      color: "#fff1ae",
      backgroundColor: "#713524",
      padding: { x: 4, y: 3 }
    }).setOrigin(0.5);

    offer.add([graphic, offerText]);
    seller.add(offer);

    let kind = "cigarette";

    const render = () => {
      if (!seller.active) return;
      drawOfferGraphic(graphic, kind);
      offerText.setText(kind === "cigarette" ? "ZIGI?" : "AUBERGINE?");
      kind = kind === "cigarette" ? "aubergine" : "cigarette";
    };

    render();

    const timer = scene.time?.addEvent?.({
      delay: 1650,
      loop: true,
      callback: render
    });

    scene.tweens?.add?.({
      targets: offer,
      y: offer.y - 5,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    seller.once?.("destroy", () => timer?.remove?.());
    return seller;
  }

  function patchIndianSellerFactory(scene) {
    if (!scene || typeof scene.createIndianSeller !== "function") return;
    if (scene.createIndianSeller.__sv32IndianSeller) return;

    const original = scene.createIndianSeller.bind(scene);

    const wrapped = function createIndianSellerV32(...args) {
      const seller = original(...args);
      return animateIndianSeller(this, seller);
    };

    wrapped.__sv32IndianSeller = true;
    scene.createIndianSeller = wrapped;
    state.indianSellerPatched = true;
  }

  function getDialogueOverlay() {
    return document.querySelector(
      '#phaser-game [data-simon-ui="sv32-girl-dialogue-lock"]'
    );
  }

  function removeDialogueOverlay() {
    getDialogueOverlay()?.remove?.();
  }

  function faceWomanCorrectly(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;

    if (!woman?.active || !player?.active) return;

    // woman-v14's source orientation faces left.
    // Therefore: no flip when Simon stands to her left; flip only if he is right.
    woman.setFlipX(player.x > woman.x);
  }

  function faceSimonDuringDialogue(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;

    if (!woman?.active || !player?.active) return;

    player.setFlipX(woman.x < player.x);
    faceWomanCorrectly(hive);
  }

  function stopDanceTween(hive) {
    if (!hive) return;

    if (hive.danceBobTween) {
      try {
        hive.danceBobTween.stop?.();
        hive.danceBobTween.remove?.();
      } catch {}
      hive.danceBobTween = null;
    }

    if (hive.player) {
      try {
        hive.tweens?.killTweensOf?.(hive.player);
      } catch {}
    }
  }

  function resetHiveTransient(hive, { beforeCreate = false } = {}) {
    if (!hive) return;

    removeDialogueOverlay();

    hive.__sv32GirlDialogueActive = false;
    hive.__sv32GirlDialogueIndex = -1;
    hive.__sv32DialogueLastActivation = -Infinity;

    hive.__leaving = false;
    hive.modalOpen = false;
    hive.currentModal = null;
    hive.actionLocked = false;
    hive.touchLeft = false;
    hive.touchRight = false;
    hive.touchDance = false;
    hive.introDancing = false;

    stopDanceTween(hive);

    if (beforeCreate) {
      // Base create() adds an anonymous ESC listener each time the reusable
      // HIVE scene starts. Remove old copies first to prevent accumulation.
      try {
        hive.input?.keyboard?.removeAllListeners?.("keydown-ESC");
      } catch {}
    }

    if (hive.input) {
      hive.input.enabled = true;
    }

    if (hive.player?.active) {
      try {
        hive.player.setVelocity?.(0, 0);
        hive.player.setActive?.(true);
        hive.player.setVisible?.(true);

        if (hive.player.body) {
          hive.player.body.enable = true;
        }
      } catch {}
    }

    state.hiveResets += 1;
  }

  function finishGirlDialogue(hive) {
    if (!hive) return;

    removeDialogueOverlay();

    hive.__sv32GirlDialogueActive = false;
    hive.__sv32GirlDialogueIndex = -1;

    hive.destroySpeechBubble?.();
    hive.stopSimonAction?.();

    if (hive.womanSprite?.active) {
      hive.womanSprite.play?.("woman-v14-idle", true);
    }

    if (hive.player?.active) {
      try {
        hive.player.play?.("simon-idle", true);
        hive.player.setVelocity?.(0, 0);
      } catch {}
    }

    hive.modalOpen = false;
    hive.currentModal = null;
    hive.actionLocked = false;
    hive.touchLeft = false;
    hive.touchRight = false;
    hive.touchDance = false;

    if (hive.input) hive.input.enabled = true;

    faceWomanCorrectly(hive);
    state.dialogueFinishes += 1;
  }

  function renderGirlDialogueStep(hive) {
    if (!hive?.__sv32GirlDialogueActive) return;

    const steps = hive.__sv32GirlDialogueSteps || [];
    const index = Number(hive.__sv32GirlDialogueIndex) || 0;
    const step = steps[index];

    if (!step) {
      finishGirlDialogue(hive);
      return;
    }

    hive.destroySpeechBubble?.();
    hive.stopSimonAction?.();
    faceSimonDuringDialogue(hive);

    if (step.speaker === "simon") {
      hive.playSimonAction?.("simon-v14-talk", { loop: true });
      hive.showSpeechBubble?.(hive.player, step.text, 0);
      return;
    }

    if (hive.womanSprite?.active) {
      hive.womanSprite.play?.(
        step.reject ? "woman-v14-reject" : "woman-v14-idle",
        true
      );
    }

    hive.showSpeechBubble?.(hive.womanSprite, step.text, 0);
  }

  function createDialogueOverlay(hive) {
    removeDialogueOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "sv32-girl-dialogue-lock";
    overlay.setAttribute("role", "button");
    overlay.setAttribute("aria-label", "Dialog weiter");
    overlay.tabIndex = 0;

    let lastActivation = -Infinity;
    const notBefore = performance.now() + 480;

    const stopOnly = (event) => {
      event.preventDefault?.();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
    };

    const advance = (event) => {
      stopOnly(event);

      const now = performance.now();
      if (now < notBefore) return;

      // One physical tap can produce touchend, pointerup and click on iOS.
      if (now - lastActivation < 300) return;
      lastActivation = now;

      if (!hive.__sv32GirlDialogueActive) {
        finishGirlDialogue(hive);
        return;
      }

      hive.__sv32GirlDialogueIndex += 1;

      if (
        hive.__sv32GirlDialogueIndex >=
        (hive.__sv32GirlDialogueSteps?.length || 0)
      ) {
        finishGirlDialogue(hive);
        return;
      }

      renderGirlDialogueStep(hive);
    };

    overlay.addEventListener("pointerdown", stopOnly, { passive: false });
    overlay.addEventListener("touchstart", stopOnly, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("touchend", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });

    root.appendChild(overlay);
    return overlay;
  }

  function installGirlDialogue(hive) {
    if (!hive || typeof hive.startRejectedDanceInvite !== "function") return;
    if (hive.startRejectedDanceInvite.__sv32GirlDialogue) return;

    const replacement = function startRejectedDanceInviteV32() {
      if (this.__sv32GirlDialogueActive) return;

      this.closeModal?.();

      this.__sv32GirlDialogueActive = true;
      this.__sv32GirlDialogueIndex = 0;
      this.__sv32GirlDialogueSteps = [
        {
          speaker: "simon",
          text: "Hey, weisch du, wo ich fire Schueh chaufe cha?"
        },
        {
          speaker: "woman",
          text: "Ja, fahr mit de Tram zur Bahnhofstrass. Det findsch sicher öppis im Schueh-Shop."
        },
        {
          speaker: "simon",
          text: "Merci! Willsch mit mir tanze?"
        },
        {
          speaker: "woman",
          reject: true,
          text: "Eher nöd…"
        },
        {
          speaker: "woman",
          text: "Du bisch nice."
        },
        {
          speaker: "woman",
          text: "Aber…"
        },
        {
          speaker: "woman",
          reject: true,
          text: "nöd sooooo nice"
        }
      ];

      // This state intentionally freezes HIVE movement/world actions. A
      // transparent DOM layer receives every tap until the conversation ends.
      this.modalOpen = false;
      this.currentModal = null;
      this.actionLocked = true;
      this.touchLeft = false;
      this.touchRight = false;
      this.touchDance = false;

      if (this.player?.active) {
        this.player.setVelocity?.(0, 0);
      }

      faceSimonDuringDialogue(this);
      createDialogueOverlay(this);
      renderGirlDialogueStep(this);
      state.dialogueStarts += 1;
    };

    replacement.__sv32GirlDialogue = true;
    hive.startRejectedDanceInvite = replacement;
  }

  function patchHiveLifecycle(hive) {
    if (!hive || hive.__sv32LifecyclePatched) return;
    hive.__sv32LifecyclePatched = true;

    // Wrap the already-current methods (including language patch v18), so all
    // existing behavior stays intact while transient state is reset safely.
    if (typeof hive.init === "function") {
      const originalInit = hive.init.bind(hive);

      hive.init = function initV32(data = {}) {
        resetHiveTransient(this);
        return originalInit(data);
      };
    }

    if (typeof hive.create === "function") {
      const originalCreate = hive.create.bind(hive);

      hive.create = function createV32(...args) {
        resetHiveTransient(this, { beforeCreate: true });
        const result = originalCreate(...args);

        this.__leaving = false;
        if (this.input) this.input.enabled = true;

        // Do NOT clear introDancing here: base create() may intentionally have
        // started the dance intro for a fresh entry.
        faceWomanCorrectly(this);
        return result;
      };
    }

    if (typeof hive.leaveHive === "function") {
      const originalLeaveHive = hive.leaveHive.bind(hive);

      hive.leaveHive = function leaveHiveV32(...args) {
        finishGirlDialogue(this);

        // Leaving during the entrance dance used to leave introDancing=true on
        // the reusable scene, which makes update() return forever next entry.
        this.introDancing = false;
        this.actionLocked = false;
        this.modalOpen = false;
        this.currentModal = null;
        this.touchLeft = false;
        this.touchRight = false;
        this.touchDance = false;
        stopDanceTween(this);

        // Make sure an old guard can never block the new exit.
        this.__leaving = false;

        const result = originalLeaveHive(...args);

        window.setTimeout(() => {
          this.__leaving = false;
        }, 550);

        return result;
      };
    }

    hive.events?.on?.("shutdown", () => {
      removeDialogueOverlay();
      hive.__sv32GirlDialogueActive = false;
      hive.actionLocked = false;
      hive.modalOpen = false;
      hive.currentModal = null;
      hive.introDancing = false;
      hive.touchLeft = false;
      hive.touchRight = false;
      hive.touchDance = false;
      stopDanceTween(hive);
    });

    installGirlDialogue(hive);
    state.hivePatched = true;
  }

  function maintainHive(hive) {
    if (!hive) return;

    patchHiveLifecycle(hive);

    // Another earlier patch (v30) uses the opposite flip direction. v32 is
    // loaded later and deliberately applies the verified orientation last.
    faceWomanCorrectly(hive);

    if (hive.__sv32GirlDialogueActive) {
      hive.actionLocked = true;
      hive.modalOpen = false;
      hive.touchLeft = false;
      hive.touchRight = false;
      hive.touchDance = false;

      if (!getDialogueOverlay()) {
        // Failsafe: if a browser removes the overlay unexpectedly, recreate it
        // rather than leaving actionLocked with no way to advance.
        createDialogueOverlay(hive);
      }
    }
  }

  function frame() {
    state.frames += 1;

    const game = getGame();

    if (game) {
      state.gameSeen = true;

      const milk = getScene(game, "MilchbuckScene");
      const station = getScene(game, "BahnhofquaiScene");
      const hive = getScene(game, "HiveInteriorScene");

      if (milk) patchLionChoice(milk);

      if (station) {
        patchIndianSellerFactory(station);

        if (station.shopModal?.panel) {
          decorateIndianShop(station);
        }

        if (station.bookstoreCatalogModal?.panel) {
          decorateBookShop(station);
        }
      }

      if (hive) maintainHive(hive);

      removeLegacyShopExtras(document);
    }

    window.requestAnimationFrame(frame);
  }

  ensureStyle();
  window.requestAnimationFrame(frame);

  window.SimonUIV32 = Object.freeze({
    version: 32,
    status() {
      return {
        ...state,
        gameSeen: Boolean(getGame()),
        dialogueOverlayPresent: Boolean(getDialogueOverlay())
      };
    }
  });

  console.info("Simon UI v32 geladen: HIVE stability + click dialogue + shop cleanup.");
})();