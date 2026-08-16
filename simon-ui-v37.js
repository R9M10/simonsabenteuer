(() => {
  "use strict";

  if (window.__SIMON_UI_V37__) return;
  window.__SIMON_UI_V37__ = true;

  const BOOK_TO_ITEM = Object.freeze({
    generalRelativity: "bookGeneralRelativity",
    phaenomenologie: "bookPhaenomenologie",
    playbook: "bookPlaybook",
    zarathustra: "bookZarathustra"
  });

  const ITEM_TO_BOOK = Object.freeze(
    Object.fromEntries(
      Object.entries(BOOK_TO_ITEM).map(([bookKey, itemKey]) => [itemKey, bookKey])
    )
  );

  const LOCKER_KEYS = Object.freeze([
    "ticket",
    "gatorade",
    "monster",
    "camel",
    "gandhiSticks",
    "bookGeneralRelativity",
    "bookPhaenomenologie",
    "bookPlaybook",
    "bookZarathustra"
  ]);

  const LOCKER_STATE = window.__SIMON_LOCKER_V37__ || {
    items: Object.fromEntries(LOCKER_KEYS.map((key) => [key, 0]))
  };

  LOCKER_KEYS.forEach((key) => {
    LOCKER_STATE.items[key] = Math.max(0, Number(LOCKER_STATE.items[key]) || 0);
  });

  window.__SIMON_LOCKER_V37__ = LOCKER_STATE;

  const stats = {
    frames: 0,
    girlFacingFixes: 0,
    autoHotbarAdds: 0,
    lockerMoves: 0,
    lockerOpens: 0,
    shopRoomBuilds: 0,
    quoteResizes: 0
  };


  const INDOOR_GAMEPLAY_V37 = Object.freeze({
    playerScale: 0.42,
    actionScale: 0.52,
    speed: 175,
    gravity: 900,
    jumpVelocity: -470,
    groundY: 286,
    minX: 68,
    maxX: 752
  });

  function indoorControlLocked(extra = false) {
    return Boolean(extra);
  }

  function makeIndoorTouchButton(
    scene,
    x,
    y,
    label,
    onDown,
    onUp = () => {},
    depth = 1250
  ) {
    const circle = scene.add.circle(x, y, 34, 0x101820, 0.42)
      .setStrokeStyle(3, 0xfff3d2, 0.7)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: false });

    const text = scene.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: label.length > 2 ? "6px" : "13px",
      color: "#fff3d2",
      align: "center"
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    circle.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      onDown?.();
    });

    const release = (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      onUp?.();
    };

    circle.on("pointerup", release);
    circle.on("pointerout", release);
    circle.on("pointerupoutside", release);

    return [circle, text];
  }

  function makeIndoorItemsButton(scene, onPress, depth = 1260) {
    const button = scene.add.text(802, 18, "ITEMS", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#fff5d6",
      backgroundColor: "#182333",
      padding: { x: 11, y: 8 }
    })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      onPress?.();
    });

    return button;
  }

  function makeIndoorBackButton(scene, label, onPress, depth = 1260) {
    const button = scene.add.text(18, 18, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      color: "#fff5d6",
      backgroundColor: "#182333",
      padding: { x: 10, y: 8 }
    })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      onPress?.();
    });

    return button;
  }

  function setIndoorSimonAnimation(scene, state, mode) {
    const simon = state?.simon;
    if (!simon?.active) return;

    if (state.lastMode === mode) return;
    state.lastMode = mode;

    if (mode === "dance") {
      simon.setScale(INDOOR_GAMEPLAY_V37.actionScale);
      if (scene.anims?.exists?.("simon-v14-dance")) {
        simon.play("simon-v14-dance", true);
      } else {
        simon.setScale(INDOOR_GAMEPLAY_V37.playerScale);
        simon.play?.("simon-run", true);
      }
      return;
    }

    simon.setScale(INDOOR_GAMEPLAY_V37.playerScale);

    const animation =
      mode === "jump" ? "simon-jump" :
      mode === "run" ? "simon-run" :
      "simon-idle";

    simon.play?.(animation, true);
  }

  function updateIndoorMovement(
    scene,
    state,
    delta,
    {
      locked = false,
      left = false,
      right = false,
      jumpPressed = false,
      dancePressed = false
    } = {}
  ) {
    if (!state?.simon?.active) return;

    const cfg = INDOOR_GAMEPLAY_V37;
    const dt = Phaser.Math.Clamp(Number(delta) || 16, 0, 40) / 1000;

    if (locked) {
      state.leftHeld = false;
      state.rightHeld = false;
      state.jumpRequested = false;
      return;
    }

    if (dancePressed && state.y >= cfg.groundY - 0.5) {
      state.danceUntil = performance.now() + 1650;
    }

    const grounded = state.y >= cfg.groundY - 0.5;

    if (jumpPressed && grounded && performance.now() >= state.danceUntil) {
      state.vy = cfg.jumpVelocity;
    }

    const dancing =
      grounded &&
      performance.now() < state.danceUntil;

    let direction = 0;
    if (!dancing) {
      if (left && !right) direction = -1;
      if (right && !left) direction = 1;
    }

    if (direction !== 0) {
      state.x = Phaser.Math.Clamp(
        state.x + direction * cfg.speed * dt,
        cfg.minX,
        cfg.maxX
      );
      state.facing = direction;
      state.simon.setFlipX(direction < 0);
    }

    if (state.y < cfg.groundY || state.vy < 0) {
      state.vy += cfg.gravity * dt;
      state.y += state.vy * dt;

      if (state.y >= cfg.groundY) {
        state.y = cfg.groundY;
        state.vy = 0;
      }
    } else {
      state.y = cfg.groundY;
      state.vy = 0;
    }

    state.simon.setPosition(state.x, state.y);

    if (state.y < cfg.groundY - 0.5) {
      setIndoorSimonAnimation(scene, state, "jump");
    } else if (dancing) {
      setIndoorSimonAnimation(scene, state, "dance");
    } else if (direction !== 0) {
      setIndoorSimonAnimation(scene, state, "run");
    } else {
      setIndoorSimonAnimation(scene, state, "idle");
    }
  }

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

  function ensureStyles() {
    if (document.getElementById("simon-ui-v37-style")) return;

    const style = document.createElement("style");
    style.id = "simon-ui-v37-style";
    style.textContent = `
      #phaser-game [data-simon-ui="inder-v37-room"] {
        position: absolute;
        inset: 0;
        z-index: 99980;
        overflow: hidden;
        pointer-events: none;
        image-rendering: pixelated;
      }

      #phaser-game .sv37-inder-room-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
        image-rendering: pixelated;
        user-select: none;
        pointer-events: none;
      }

      #phaser-game .sv37-inder-seller {
        position: absolute;
        left: 300px;
        top: 95px;
        width: 220px;
        height: 170px;
        z-index: 3;
        background-image: url("inder-sprites-v37.png?v=37");
        background-repeat: no-repeat;
        background-size: 880px 510px;
        image-rendering: pixelated;
        pointer-events: auto;
        cursor: pointer;
        touch-action: manipulation;
        filter: drop-shadow(0 4px 0 rgba(25, 12, 5, .38));
        -webkit-tap-highlight-color: transparent;
      }

      #phaser-game .sv37-inder-bubble {
        position: absolute;
        left: 50%;
        top: 36px;
        transform: translateX(-50%);
        z-index: 4;
        max-width: 330px;
        padding: 11px 15px;
        box-sizing: border-box;
        border: 4px solid #5d3f27;
        border-radius: 12px;
        background: #ffefc2;
        color: #2a2017;
        font-family: "Press Start 2P", monospace;
        font-size: 8px;
        line-height: 1.55;
        text-align: center;
        pointer-events: none;
        box-shadow: 0 4px 0 rgba(32, 16, 8, .35);
      }

      #phaser-game .sv37-locker-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
        min-height: 0;
      }

      #phaser-game .sv37-locker-section {
        min-width: 0;
        border: 3px solid #7b6a4d;
        background: #e8d3a3;
        padding: 7px;
        box-sizing: border-box;
      }

      #phaser-game .sv37-locker-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-height: 215px;
        overflow-y: auto;
        min-height: 90px;
      }

      #phaser-game .sv37-locker-row {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) auto;
        align-items: center;
        gap: 7px;
        border: 2px solid #a88c5c;
        background: #f3dfae;
        padding: 5px;
        box-sizing: border-box;
      }

      #phaser-game .sv37-locker-empty {
        padding: 18px 6px;
        color: #765d43;
        font-family: "Press Start 2P", monospace;
        font-size: 5px;
        line-height: 1.5;
        text-align: center;
      }

      @media (max-width: 620px) {
        #phaser-game .sv37-locker-grid {
          gap: 6px;
        }
        #phaser-game .sv37-locker-row {
          grid-template-columns: 34px minmax(0, 1fr);
        }
        #phaser-game .sv37-locker-row button {
          grid-column: 1 / -1;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getSceneItemCount(scene, itemKey) {
    try {
      return Math.max(0, Number(scene?.getItemCount?.(itemKey)) || 0);
    } catch {
      return 0;
    }
  }

  function itemName(scene, itemKey) {
    if (itemKey === "ticket") return "Tram-Ticket";
    const item = scene?.getItemDefinition?.(itemKey);
    return item?.name || itemKey;
  }

  function firstFreeHotbar(scene, itemKey) {
    if (!Array.isArray(scene?.hotbarItems)) return false;
    if (scene.hotbarItems.includes(itemKey)) return false;

    const slot = scene.hotbarItems.findIndex((value) => !value);
    if (slot < 0) return false;

    scene.hotbarItems[slot] = itemKey;
    scene.refreshHotbar?.();
    scene.updateInventoryUI?.();
    stats.autoHotbarAdds += 1;
    return true;
  }

  function patchPurchases(scene) {
    if (!scene) return;

    if (
      typeof scene.purchaseStoreItem === "function" &&
      !scene.purchaseStoreItem.__sv37AutoHotbar
    ) {
      const original = scene.purchaseStoreItem.bind(scene);

      const wrapped = function purchaseStoreItemV37(itemKey, ...args) {
        const before = getSceneItemCount(this, itemKey);
        const result = original(itemKey, ...args);
        const after = getSceneItemCount(this, itemKey);

        if (after > before) {
          firstFreeHotbar(this, itemKey);
        }

        return result;
      };

      wrapped.__sv37AutoHotbar = true;
      scene.purchaseStoreItem = wrapped;
    }

    if (
      typeof scene.purchaseBook === "function" &&
      !scene.purchaseBook.__sv37AutoHotbar
    ) {
      const original = scene.purchaseBook.bind(scene);

      const wrapped = function purchaseBookV37(bookKey, ...args) {
        const itemKey = BOOK_TO_ITEM[bookKey];
        const before = itemKey ? getSceneItemCount(this, itemKey) : 0;
        const result = original(bookKey, ...args);
        const after = itemKey ? getSceneItemCount(this, itemKey) : 0;

        if (itemKey && after > before) {
          firstFreeHotbar(this, itemKey);
        }

        return result;
      };

      wrapped.__sv37AutoHotbar = true;
      scene.purchaseBook = wrapped;
    }
  }

  function patchQuoteBanner(scene) {
    if (
      !scene ||
      typeof scene.showRandomBookQuote !== "function" ||
      scene.showRandomBookQuote.__sv37QuoteSize
    ) {
      return;
    }

    const original = scene.showRandomBookQuote.bind(scene);

    const wrapped = function showRandomBookQuoteV37(bookKey, ...args) {
      const result = original(bookKey, ...args);
      const banner = this.bookQuoteBanner;

      if (banner?.active && Array.isArray(banner.list) && banner.list.length >= 3) {
        const [bg, text, source] = banner.list;

        if (bg?.clear) {
          bg.clear();
          bg.fillStyle(0x090b12, 0.95);
          bg.fillRoundedRect(-360, 0, 720, 94, 8);
          bg.lineStyle(2, 0xe7d8ad, 0.78);
          bg.strokeRoundedRect(-360, 0, 720, 94, 8);
        }

        text?.setFontSize?.("8px");
        text?.setWordWrapWidth?.(672);
        text?.setPosition?.(0, 11);

        source?.setFontSize?.("5px");
        source?.setY?.(81);

        stats.quoteResizes += 1;
      }

      return result;
    };

    wrapped.__sv37QuoteSize = true;
    scene.showRandomBookQuote = wrapped;
  }

  function removeFromHotbarIfGone(scene, itemKey) {
    if (!Array.isArray(scene?.hotbarItems)) return;
    if (getSceneItemCount(scene, itemKey) > 0) return;

    let changed = false;
    scene.hotbarItems = scene.hotbarItems.map((key) => {
      if (key === itemKey) {
        changed = true;
        return null;
      }
      return key;
    });

    if (changed) {
      scene.refreshHotbar?.();
    }
  }

  function moveSceneItemToLocker(scene, itemKey) {
    if (!scene || getSceneItemCount(scene, itemKey) <= 0) return false;

    const bookKey = ITEM_TO_BOOK[itemKey];

    if (itemKey === "ticket") {
      scene.hasCityTicket = false;
    } else if (bookKey) {
      if (!scene.booksOwned?.[bookKey]) return false;
      scene.booksOwned[bookKey] = false;
    } else if (scene.inventory && Object.prototype.hasOwnProperty.call(scene.inventory, itemKey)) {
      scene.inventory[itemKey] = Math.max(
        0,
        Number(scene.inventory[itemKey] || 0) - 1
      );
    } else {
      return false;
    }

    LOCKER_STATE.items[itemKey] =
      Math.max(0, Number(LOCKER_STATE.items[itemKey]) || 0) + 1;

    removeFromHotbarIfGone(scene, itemKey);
    stabilizeInventoryControls(scene);
    stats.lockerMoves += 1;
    return true;
  }

  function moveLockerItemToScene(scene, itemKey) {
    if (!scene) return false;

    const stored = Math.max(0, Number(LOCKER_STATE.items[itemKey]) || 0);
    if (stored <= 0) return false;

    const bookKey = ITEM_TO_BOOK[itemKey];

    if (itemKey === "ticket") {
      if (scene.hasCityTicket) return false;
      scene.hasCityTicket = true;
    } else if (bookKey) {
      if (scene.booksOwned?.[bookKey]) return false;
      scene.booksOwned[bookKey] = true;
    } else if (scene.inventory && Object.prototype.hasOwnProperty.call(scene.inventory, itemKey)) {
      scene.inventory[itemKey] =
        Math.max(0, Number(scene.inventory[itemKey]) || 0) + 1;
    } else {
      return false;
    }

    LOCKER_STATE.items[itemKey] = stored - 1;
    stabilizeInventoryControls(scene);
    stats.lockerMoves += 1;
    return true;
  }

  function domText(scene, text, size = "6px", color = "#3a271a") {
    if (scene?.createDOMText) {
      return scene.createDOMText(text, {
        fontSize: size,
        color,
        lineHeight: "1.4"
      });
    }

    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size,
      color,
      lineHeight: "1.4"
    });
    return el;
  }

  function lockerItemRow(scene, itemKey, count, direction) {
    const row = document.createElement("div");
    row.className = "sv37-locker-row";

    const iconWrap = document.createElement("div");
    Object.assign(iconWrap.style, {
      width: "40px",
      height: "40px",
      display: "grid",
      placeItems: "center"
    });

    const icon = scene.createDOMItemIcon?.(itemKey, 34);
    if (icon) iconWrap.appendChild(icon);

    const info = document.createElement("div");
    info.style.minWidth = "0";

    const name = domText(scene, itemName(scene, itemKey), "5.5px", "#3a271a");
    name.style.textAlign = "left";

    const qty = domText(scene, `x${count}`, "5px", "#765d43");
    qty.style.marginTop = "4px";
    qty.style.textAlign = "left";

    info.append(name, qty);

    const button = scene.createDOMButton?.(
      direction === "store" ? "ABLEGEN" : "NEHMEN",
      () => {
        const moved = direction === "store"
          ? moveSceneItemToLocker(scene, itemKey)
          : moveLockerItemToScene(scene, itemKey);

        if (moved) renderLocker(scene);
      },
      {
        color: direction === "store" ? "#fff2d2" : "#f0ffe2",
        background: direction === "store" ? "#6c4d35" : "#536a45",
        border: direction === "store" ? "#a77c52" : "#819b68",
        minHeight: "34px",
        fontSize: "5px",
        padding: "5px"
      }
    );

    row.append(iconWrap, info);
    if (button) row.appendChild(button);
    return row;
  }

  function renderLocker(scene) {
    const modal = scene?.__sv37LockerModal;
    if (!modal?.panel) return;

    const content = modal.panel.querySelector("[data-sv37-locker-content]");
    if (!content) return;
    content.replaceChildren();

    const grid = document.createElement("div");
    grid.className = "sv37-locker-grid";

    const bagSection = document.createElement("section");
    bagSection.className = "sv37-locker-section";

    const lockerSection = document.createElement("section");
    lockerSection.className = "sv37-locker-section";

    const bagTitle = domText(scene, "RUCKSACK", "7px", "#4b3525");
    bagTitle.style.marginBottom = "7px";

    const lockerTitle = domText(scene, "LOCKER", "7px", "#33463e");
    lockerTitle.style.marginBottom = "7px";

    const bagList = document.createElement("div");
    bagList.className = "sv37-locker-list";

    const lockerList = document.createElement("div");
    lockerList.className = "sv37-locker-list";

    const bagItems = LOCKER_KEYS
      .map((key) => [key, getSceneItemCount(scene, key)])
      .filter(([, count]) => count > 0);

    const storedItems = LOCKER_KEYS
      .map((key) => [key, Math.max(0, Number(LOCKER_STATE.items[key]) || 0)])
      .filter(([, count]) => count > 0);

    if (!bagItems.length) {
      const empty = document.createElement("div");
      empty.className = "sv37-locker-empty";
      empty.textContent = "KEINE OBJEKTE IM RUCKSACK";
      bagList.appendChild(empty);
    } else {
      bagItems.forEach(([key, count]) => {
        bagList.appendChild(lockerItemRow(scene, key, count, "store"));
      });
    }

    if (!storedItems.length) {
      const empty = document.createElement("div");
      empty.className = "sv37-locker-empty";
      empty.textContent = "LOCKER IST LEER";
      lockerList.appendChild(empty);
    } else {
      storedItems.forEach(([key, count]) => {
        lockerList.appendChild(lockerItemRow(scene, key, count, "take"));
      });
    }

    bagSection.append(bagTitle, bagList);
    lockerSection.append(lockerTitle, lockerList);
    grid.append(bagSection, lockerSection);
    content.appendChild(grid);
  }


  const DOM_MODAL_REFS_V37 = Object.freeze([
    "ticketModal",
    "itemsModal",
    "lootModal",
    "lionChoiceModal",
    "tramDestinationModal",
    "itemInfoModal",
    "storeEntryModal",
    "shopModal",
    "bookstoreEntryModal",
    "bookstoreCatalogModal",
    "shoeStoreClosedModal",
    "amsifMenuModal",
    "gandhiChoiceModal",
    "gandhiLootModal",
    "milkmanLootModal"
  ]);

  function clearDetachedModalRefs(scene) {
    if (!scene) return;

    DOM_MODAL_REFS_V37.forEach((key) => {
      const modal = scene[key];
      if (!modal) return;

      const overlay = modal.overlay || null;
      if (overlay && overlay.isConnected === false) {
        scene[key] = null;
      }
    });
  }

  function hasHardWorldLock(scene) {
    if (!scene) return true;

    return Boolean(
      scene.__sv37LockerModal ||
      scene.__sv37ZofingiaOpen ||
      scene.ticketModal ||
      scene.itemsModal ||
      scene.lootModal ||
      scene.lionChoiceModal ||
      scene.danceOverlay ||
      scene.bouncerDialogueActive ||
      scene.lionExitActive ||
      scene.tramTransitActive ||
      scene.tramDestinationModal ||
      scene.itemInfoModal ||
      scene.drinkingItem ||
      scene.readingBook ||
      scene.storeEntryModal ||
      scene.indianStoreOverlay ||
      scene.shopModal ||
      scene.bookstoreEntryModal ||
      scene.bookstoreOverlay ||
      scene.bookstoreCatalogModal ||
      scene.shoeStoreClosedModal ||
      scene.amsifDialogueActive ||
      scene.amsifMenuModal ||
      scene.amsifArrivalActive ||
      scene.milkmanDialogueActive ||
      scene.gandhiDialogueActive ||
      scene.gandhiChoiceModal ||
      scene.gandhiLootModal ||
      scene.gandhiNukeActive ||
      scene.playerDying ||
      scene.darkGandhiTransitionActive ||
      scene.darkGandhiNukeActive
    );
  }

  function stabilizeInventoryControls(scene) {
    if (!scene) return;

    if (Array.isArray(scene.hotbarItems)) {
      const selected = Number(scene.selectedHotbarIndex) || 0;
      if (!scene.hotbarItems[selected]) {
        const next = scene.hotbarItems.findIndex(Boolean);
        if (next >= 0) scene.selectedHotbarIndex = next;
      }
    }

    scene.updateInventoryUI?.();
    scene.refreshHotbar?.();
    scene.updateHotbarActionUI?.();

    // Especially important when Gandhi's throwing sticks were the selected item:
    // remove any obsolete WURF touch target before rebuilding it.
    scene.cleanupWeaponTouchControl?.();
    scene.refreshWeaponTouchControl?.();
    scene.refreshAbilityTouchControl?.();
  }

  function recoverWorldInput(scene) {
    if (!scene) return;

    clearDetachedModalRefs(scene);
    stabilizeInventoryControls(scene);

    // Let the game's own newest lock logic decide first.
    scene.refreshUILock?.();

    if (!hasHardWorldLock(scene)) {
      scene.setUILocked?.(false);
      scene.uiLocked = false;

      if (scene.input) scene.input.enabled = true;

      if (scene.hotbarDOM) {
        scene.hotbarDOM.style.pointerEvents = "auto";
        scene.hotbarDOM.style.opacity = "1";
      }

      if (!scene.inVoid && !scene.rewindActive) {
        scene.setControlsVisible?.(true);
      }

      scene.ensureTicketMachineInteractive?.();
      scene.ensureTramBoardingInteractive?.();
      scene.syncStreetStoreHitboxes?.();

      // Avoid carrying a stale multi-second world-click blocker out of Locker.
      if (Number.isFinite(scene.__worldInteractionBlockedUntil)) {
        const now = Number(scene.time?.now) || 0;
        scene.__worldInteractionBlockedUntil =
          Math.min(scene.__worldInteractionBlockedUntil, now + 120);
      }
    }
  }

  function closeLocker(scene, silent = false) {
    const modal = scene?.__sv37LockerModal;

    if (modal?.overlay) {
      modal.overlay.style.pointerEvents = "none";
    }

    try {
      scene?.destroyDOMModal?.(modal);
    } catch {
      modal?.overlay?.remove?.();
    }

    // Failsafe against a detached/half-destroyed full-screen locker overlay.
    document
      .querySelectorAll(
        '#phaser-game [data-simon-ui="locker-v37"], ' +
        '#phaser-game [data-simon-ui="locker-v34"], ' +
        '#phaser-game [data-simon-ui="locker-v33"]'
      )
      .forEach((node) => node.remove());

    if (scene) {
      scene.__sv37LockerModal = null;
    }

    if (!silent) {
      recoverWorldInput(scene);

      // A second pass after the DOM click has fully unwound prevents the
      // closing X tap from leaving mobile pointer state or WURF controls stale.
      window.setTimeout(() => recoverWorldInput(scene), 80);
    }
  }

  function openLocker(scene) {
    if (!scene || scene.__sv37LockerModal) return;

    clearDetachedModalRefs(scene);

    if (
      scene.uiLocked ||
      scene.playerDying ||
      scene.tramTransitActive ||
      scene.itemsModal ||
      scene.itemInfoModal ||
      scene.ticketModal ||
      scene.shopModal ||
      scene.bookstoreCatalogModal ||
      scene.storeEntryModal ||
      scene.indianStoreOverlay ||
      scene.bookstoreOverlay ||
      scene.gandhiChoiceModal ||
      scene.gandhiLootModal ||
      scene.gandhiDialogueActive ||
      scene.gandhiNukeActive ||
      scene.shoeStoreClosedModal ||
      scene.amsifDialogueActive ||
      scene.amsifMenuModal ||
      scene.amsifArrivalActive ||
      scene.milkmanDialogueActive
    ) {
      return;
    }

    const modal = scene.createDOMModal?.({
      key: "locker-v37",
      width: "min(96%, 680px)",
      background: "#ead5a5",
      border: "#40544a",
      shade: "rgba(12, 14, 13, .72)",
      padding: "11px"
    });

    if (!modal) return;

    scene.__sv37LockerModal = modal;
    modal.overlay.style.zIndex = "100090";

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
      paddingBottom: "7px",
      borderBottom: "3px solid #917957"
    });

    const title = domText(scene, "LOCKER", "11px", "#33463e");
    title.style.textAlign = "left";

    const close = scene.createDOMButton?.("X", () => closeLocker(scene), {
      color: "#fff2d5",
      background: "#7d4238",
      border: "#b97462",
      width: "42px",
      minHeight: "32px",
      fontSize: "7px",
      padding: "4px"
    });

    top.append(title);
    if (close) top.appendChild(close);

    const hint = domText(
      scene,
      "INHALT IST AN ALLEN LOCKERN GLEICH",
      "5px",
      "#6b5b45"
    );
    hint.style.marginBottom = "7px";

    const content = document.createElement("div");
    content.dataset.sv37LockerContent = "true";

    modal.panel.append(top, hint, content);
    scene.setUILocked?.(true);
    renderLocker(scene);
    stats.lockerOpens += 1;
  }

  function ensureLocker(scene) {
    if (!scene?.add || !scene?.sys?.settings?.key) return;

    const key = scene.sys.settings.key;
    if (key !== "MilchbuckScene" && key !== "BahnhofquaiScene") return;

    const old = scene.__sv37LockerObjects;
    if (old?.zone?.active && old?.body?.active) return;

    const x = key === "MilchbuckScene" ? 682 : 996;
    const top = 224;
    const w = 44;
    const h = 88;

    const body = scene.add.graphics().setDepth(6);
    body.fillStyle(0x42564f, 1);
    body.fillRoundedRect(x - w / 2, top, w, h, 4);
    body.lineStyle(3, 0x27352f, 1);
    body.strokeRoundedRect(x - w / 2, top, w, h, 4);

    body.lineStyle(2, 0x26362f, 1);
    body.lineBetween(x, top + 4, x, top + h - 4);

    body.fillStyle(0x26362f, 1);
    for (const dx of [-12, 7]) {
      for (let i = 0; i < 4; i += 1) {
        body.fillRect(x + dx, top + 12 + i * 6, 9, 2);
      }
    }

    body.fillStyle(0xd2b45f, 1);
    body.fillRoundedRect(x + 5, top + 49, 5, 13, 2);

    const label = scene.add.text(x, top - 8, "LOCKER", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      color: "#e6e0bd",
      backgroundColor: "#344840",
      padding: { x: 4, y: 3 }
    })
      .setOrigin(0.5, 1)
      .setDepth(7);

    const zone = scene.add.zone(x, top + h / 2, 56, 100)
      .setDepth(160)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();

      if (scene.canUseWorldInteraction && !scene.canUseWorldInteraction(zone)) {
        return;
      }

      openLocker(scene);
    });

    scene.__sv37LockerObjects = { body, label, zone };
  }

  function patchLockerScene(scene) {
    if (!scene) return;

    // A destroyed locker modal must never keep the scene logically locked.
    // Crucially, v37 does NOT wrap openItemsModal at all.
    if (
      scene.__sv37LockerModal &&
      !scene.__sv37LockerModal.overlay?.isConnected
    ) {
      scene.__sv37LockerModal = null;
      recoverWorldInput(scene);
    }


    if (
      typeof scene.create === "function" &&
      !scene.create.__sv37LockerCreate
    ) {
      const original = scene.create.bind(scene);

      const wrapped = function createV37(...args) {
        const result = original(...args);
        this.time?.delayedCall?.(0, () => ensureLocker(this));
        return result;
      };

      wrapped.__sv37LockerCreate = true;
      scene.create = wrapped;
    }

    ensureLocker(scene);
  }

  function cleanupIndianRoom() {
    const room = document.querySelector(
      '#phaser-game [data-simon-ui="inder-v37-room"]'
    );

    if (room?._sv37Timer) {
      window.clearInterval(room._sv37Timer);
    }

    room?.remove?.();
  }

  function setIndianFrame(seller, row, col) {
    if (!seller) return;
    seller.style.backgroundPosition =
      `${-col * 220}px ${-row * 170}px`;
  }

  function buildIndianRoom(scene) {
    if (!scene?.indianStoreOverlay) return;
    if (document.querySelector('#phaser-game [data-simon-ui="inder-v37-room"]')) {
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const room = document.createElement("div");
    room.dataset.simonUi = "inder-v37-room";

    const bg = document.createElement("img");
    bg.className = "sv37-inder-room-bg";
    bg.src = "inder-shop-v37.png?v=37";
    bg.alt = "";
    bg.draggable = false;

    const seller = document.createElement("div");
    seller.className = "sv37-inder-seller";
    seller.setAttribute("role", "button");
    seller.setAttribute("aria-label", "Mit dem Verkäufer handeln");
    seller.tabIndex = 0;

    const bubble = document.createElement("div");
    bubble.className = "sv37-inder-bubble";
    bubble.textContent = "Guter Kunde, Guter Kunde";

    room.append(bg, seller, bubble);
    root.appendChild(room);

    const frames = [
      [0, 0], [0, 1], [0, 2], [0, 1], [0, 3], [0, 1],
      [1, 0], [1, 1], [1, 2], [1, 3], [1, 2], [1, 1],
      [0, 1], [0, 0], [0, 2], [0, 1],
      [2, 0], [2, 1], [2, 2], [2, 3], [2, 2], [2, 1],
      [0, 2], [0, 1]
    ];

    let index = 0;
    setIndianFrame(seller, frames[0][0], frames[0][1]);

    room._sv37Timer = window.setInterval(() => {
      if (!document.body.contains(room) || !scene.indianStoreOverlay) {
        cleanupIndianRoom();
        return;
      }

      index = (index + 1) % frames.length;
      const [row, col] = frames[index];
      setIndianFrame(seller, row, col);
    }, 650);

    const openShop = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      scene.openIndianShopWindow?.();
    };

    seller.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    seller.addEventListener("pointerup", openShop);
    seller.addEventListener("click", openShop);
    seller.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") openShop(event);
    });

    stats.shopRoomBuilds += 1;
  }

  function patchIndianRoom(scene) {
    if (!scene) return;

    if (
      typeof scene.enterIndianStore === "function" &&
      !scene.enterIndianStore.__sv37Room
    ) {
      const original = scene.enterIndianStore.bind(scene);

      const wrapped = function enterIndianStoreV37(...args) {
        const result = original(...args);
        this.time?.delayedCall?.(0, () => buildIndianRoom(this));
        return result;
      };

      wrapped.__sv37Room = true;
      scene.enterIndianStore = wrapped;
    }

    if (
      typeof scene.exitIndianStore === "function" &&
      !scene.exitIndianStore.__sv37Room
    ) {
      const original = scene.exitIndianStore.bind(scene);

      const wrapped = function exitIndianStoreV37(...args) {
        cleanupIndianRoom();
        return original(...args);
      };

      wrapped.__sv37Room = true;
      scene.exitIndianStore = wrapped;
    }

    if (scene.indianStoreOverlay) {
      buildIndianRoom(scene);
    }
  }

  function fixGirlFacing(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;

    if (!woman?.active || !player?.active) return;

    // v32 still calls setFlipX every frame using the visually reversed rule.
    // Intercept that method once and invert every requested value.
    if (!woman.__sv37FlipInterceptor) {
      const rawSetFlipX = woman.setFlipX.bind(woman);
      woman.__sv37RawSetFlipX = rawSetFlipX;

      woman.setFlipX = function setFlipXInvertedV37(value) {
        return rawSetFlipX(!Boolean(value));
      };

      woman.__sv37FlipInterceptor = true;
    }

    // Final explicit orientation from the user's observed sprite direction:
    // Simon LEFT  -> woman must render LEFT  -> flipX TRUE
    // Simon RIGHT -> woman must render RIGHT -> flipX FALSE
    const desiredFlip = player.x < woman.x;
    woman.__sv37RawSetFlipX?.(desiredFlip);
    stats.girlFacingFixes += 1;
  }

  // ----------------------------------------------------------------
  // ZÜRICH PROMENADE + ZOFINGIA
  // ----------------------------------------------------------------

  function makePartyGuest(scene, x, y, suit = 0x202b3d, tie = 0x8f3030, scale = 1) {
    const guest = scene.add.container(x, y);

    const g = scene.add.graphics();
    g.fillStyle(suit, 1);
    g.fillRoundedRect(-12, -34, 24, 32, 5);
    g.fillStyle(0xf0eee5, 1);
    g.fillTriangle(-7, -32, 0, -18, 7, -32);
    g.fillStyle(tie, 1);
    g.fillTriangle(-2, -28, 2, -28, 0, -17);

    g.fillStyle(0xc58a68, 1);
    g.fillCircle(0, -45, 10);
    g.fillStyle(0x3a2b25, 1);
    g.fillRoundedRect(-9, -54, 18, 8, 4);

    g.fillStyle(0x1b2029, 1);
    g.fillRect(-10, -3, 8, 22);
    g.fillRect(2, -3, 8, 22);

    guest.add(g);
    guest.setScale(scale);
    return guest;
  }

  function createEnrique(scene, x, y) {
    const enrique = scene.add.container(x, y).setDepth(735);

    const g = scene.add.graphics();
    // deliberately ordinary, well-dressed young club member
    g.fillStyle(0x18243a, 1);
    g.fillRoundedRect(-23, -55, 46, 55, 7);
    g.fillStyle(0xf4f0e8, 1);
    g.fillTriangle(-12, -51, 0, -29, 12, -51);
    g.fillStyle(0x87343a, 1);
    g.fillTriangle(-3, -46, 3, -46, 0, -25);

    g.fillStyle(0xc9906e, 1);
    g.fillCircle(0, -70, 17);
    g.fillStyle(0x43332a, 1);
    g.fillRoundedRect(-16, -86, 32, 12, 6);
    g.fillRect(-16, -80, 5, 10);

    g.fillStyle(0x20202a, 1);
    g.fillRect(-19, -3, 16, 34);
    g.fillRect(3, -3, 16, 34);

    const label = scene.add.text(0, -105, "ENRIQUE", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#ffe5a8",
      stroke: "#241912",
      strokeThickness: 4
    }).setOrigin(0.5);

    enrique.add([g, label]);
    enrique.setSize(86, 150);
    enrique.setInteractive({ useHandCursor: true });

    scene.tweens?.add?.({
      targets: enrique,
      y: y - 2,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    return enrique;
  }

  function closeEnriqueMenu(scene) {
    if (!scene?.__sv37EnriqueModal) return;
    try {
      scene.destroyDOMModal?.(scene.__sv37EnriqueModal);
    } catch {
      scene.__sv37EnriqueModal.overlay?.remove?.();
    }
    scene.__sv37EnriqueModal = null;
  }

  function openEnriqueMenu(scene) {
    if (!scene?.__sv37ZofingiaOpen || scene.__sv37EnriqueModal) return;

    const modal = scene.createDOMModal?.({
      key: "enrique-v37",
      width: "min(92%, 560px)",
      background: "#e9dcc1",
      border: "#5e3b28",
      shade: "rgba(10, 7, 6, .58)",
      padding: "14px"
    });
    if (!modal) return;

    scene.__sv37EnriqueModal = modal;
    modal.overlay.style.zIndex = "100180";

    const title = domText(scene, "ENRIQUE", "12px", "#4a2d21");
    title.style.marginBottom = "8px";

    const answer = domText(
      scene,
      "Enrique schaut Simon erwartungsvoll an.",
      "6px",
      "#5f5143"
    );
    answer.dataset.sv37EnriqueAnswer = "true";
    answer.style.minHeight = "42px";
    answer.style.marginBottom = "9px";

    const buttons = document.createElement("div");
    Object.assign(buttons.style, {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "7px"
    });

    const setAnswer = (text) => {
      answer.textContent = text;
    };

    const who = scene.createDOMButton?.(
      "WER BISCH DU?",
      () => setAnswer("Ich bin Enrique."),
      {
        color: "#fff2d5",
        background: "#5c4535",
        border: "#9c7d59",
        minHeight: "40px",
        fontSize: "5.5px"
      }
    );

    const flirt = scene.createDOMButton?.(
      "FLIRT LERNE",
      () => setAnswer("Klar. Lueg guet zue. Enrique zeigt Simon einen Flirt."),
      {
        color: "#fff2d5",
        background: "#665037",
        border: "#ae8c5d",
        minHeight: "40px",
        fontSize: "5.5px"
      }
    );

    const mobuto = scene.createDOMButton?.(
      "NACH MOBUTO FRAGE",
      () => setAnswer("Ich han ghört, de Mobuto isch grad in Venedig."),
      {
        color: "#eef4ff",
        background: "#34465e",
        border: "#7089a5",
        minHeight: "40px",
        fontSize: "5px"
      }
    );

    const back = scene.createDOMButton?.(
      "ZURÜCK",
      () => closeEnriqueMenu(scene),
      {
        color: "#4b3528",
        background: "#d4c3a3",
        border: "#8f7656",
        minHeight: "40px",
        fontSize: "6px"
      }
    );

    [who, flirt, mobuto, back].filter(Boolean).forEach((button) => {
      buttons.appendChild(button);
    });

    modal.panel.append(title, answer, buttons);
  }

  function cleanupZofingia(scene, recover = true) {
    if (!scene) return;

    closeEnriqueMenu(scene);

    if (scene.__sv37ClubUpdateHandler) {
      scene.events?.off?.("update", scene.__sv37ClubUpdateHandler);
      scene.__sv37ClubUpdateHandler = null;
    }

    scene.__sv37ZofingiaBlocker?.destroy?.();
    scene.__sv37ZofingiaBlocker = null;

    (scene.__sv37ClubControlObjects || []).forEach((object) => {
      try { object?.destroy?.(); } catch {}
    });
    scene.__sv37ClubControlObjects = [];

    scene.__sv37EnriqueZone = null;
    scene.__sv37EnriquePrompt = null;

    if (scene.__sv37ZofingiaOverlay) {
      try {
        (scene.__sv37ZofingiaGuests || []).forEach((guest) => {
          scene.tweens?.killTweensOf?.(guest);
        });
        scene.tweens?.killTweensOf?.(scene.__sv37ClubSimon);
        scene.__sv37ZofingiaOverlay.destroy(true);
      } catch {}
    }

    scene.__sv37ZofingiaOverlay = null;
    scene.__sv37ZofingiaGuests = [];
    scene.__sv37ZofingiaOpen = false;
    scene.__sv36ZofingiaOpen = false; // compatibility with current game.js?v=33
    scene.__sv37ClubSimon = null;
    scene.__sv37ClubState = null;
    scene.__sv37Enrique = null;

    if (scene.hotbarDOM && scene.__sv37ClubHotbarState) {
      scene.hotbarDOM.style.pointerEvents =
        scene.__sv37ClubHotbarState.pointerEvents;
      scene.hotbarDOM.style.opacity =
        scene.__sv37ClubHotbarState.opacity;
    }
    scene.__sv37ClubHotbarState = null;

    if (scene.__sv37IndoorHudState) {
      scene.hudContainer?.setVisible?.(scene.__sv37IndoorHudState.hudVisible);
      scene.itemsButton?.setVisible?.(scene.__sv37IndoorHudState.itemsVisible);

      if (scene.hotbarDOM) {
        scene.hotbarDOM.style.display =
          scene.__sv37IndoorHudState.hotbarDisplay;
      }
    }
    scene.__sv37IndoorHudState = null;

    if (scene.player?.active) {
      scene.player.setVisible(true);
      if (scene.player.body) scene.player.body.enable = true;
      scene.player.setVelocity?.(0, 0);
      scene.player.play?.("simon-idle", true);
    }

    if (recover) {
      recoverWorldInput(scene);
      scene.cameras?.main?.startFollow?.(scene.player, true, 0.11, 0.11);
      scene.cameras?.main?.setDeadzone?.(240, 80);
    }
  }

  function playClubSimonAnimation(scene, state, key) {
    const mode =
      key === "dance" ? "dance" :
      key === "simon-jump" ? "jump" :
      key === "simon-run" || key === "simon-walk" ? "run" :
      "idle";

    setIndoorSimonAnimation(scene, state, mode);
  }

  function requestClubJump(state) {
    if (!state) return;
    state.jumpRequested = true;
  }

  function requestClubDance(state) {
    if (!state) return;
    state.danceUntil = performance.now() + 1650;
  }

  function openZofingia(scene) {
    if (
      !scene ||
      scene.__sv37ZofingiaOpen ||
      scene.uiLocked ||
      scene.playerDying
    ) return;

    scene.__sv37ZofingiaOpen = true;
    scene.__sv36ZofingiaOpen = true; // compatibility with current game.js?v=33

    // Do NOT set the station scene to uiLocked. v35 did this every frame,
    // which is why absolutely nothing inside Zofingia could move or open.
    scene.setControlsVisible?.(false);

    if (scene.player?.active) {
      scene.player.setVelocity?.(0, 0);
      scene.player.setVisible(false);
      if (scene.player.body) scene.player.body.enable = false;
    }

    scene.cameras?.main?.stopFollow?.();

    scene.__sv37IndoorHudState = {
      hudVisible: scene.hudContainer?.visible !== false,
      itemsVisible: scene.itemsButton?.visible !== false,
      hotbarDisplay: scene.hotbarDOM?.style?.display || ""
    };

    scene.hudContainer?.setVisible?.(false);
    scene.itemsButton?.setVisible?.(false);

    if (scene.hotbarDOM) {
      scene.__sv37ClubHotbarState = {
        pointerEvents: scene.hotbarDOM.style.pointerEvents || "auto",
        opacity: scene.hotbarDOM.style.opacity || "1"
      };
      // Inventory remains available through the dedicated ITEMS button.
      // Disable direct hotbar actions on the hidden overworld player.
      scene.hotbarDOM.style.pointerEvents = "none";
      scene.hotbarDOM.style.opacity = "0";
      scene.hotbarDOM.style.display = "none";
    }

    // Blocks all Bahnhofstrasse world hitboxes, while the higher Zofingia
    // overlay and DOM buttons remain interactive.
    scene.__sv37ZofingiaBlocker = scene.add.zone(410, 195, 820, 390)
      .setScrollFactor(0)
      .setDepth(690)
      .setInteractive();

    scene.__sv37ZofingiaBlocker.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
    });

    const overlay = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(700);

    const bg = scene.add.graphics();
    bg.fillStyle(0x3b281e, 1);
    bg.fillRect(0, 0, 820, 390);
    bg.fillStyle(0xd8c7a7, 1);
    bg.fillRect(0, 38, 820, 178);
    bg.fillStyle(0x6b432b, 1);
    bg.fillRect(0, 200, 820, 126);
    bg.fillStyle(0x261b18, 1);
    bg.fillRect(0, 326, 820, 64);

    bg.lineStyle(3, 0x8a6243, 1);
    for (let x = 22; x < 820; x += 115) {
      bg.strokeRect(x, 218, 94, 88);
    }

    [58, 620].forEach((x) => {
      bg.fillStyle(0x182c3b, 1);
      bg.fillRoundedRect(x, 69, 122, 116, 5);
      bg.lineStyle(4, 0x5d3f2b, 1);
      bg.strokeRoundedRect(x, 69, 122, 116, 5);
      bg.lineBetween(x + 61, 72, x + 61, 182);
      bg.lineBetween(x + 3, 127, x + 119, 127);
      bg.fillStyle(0xe5cc7e, 0.5);
      bg.fillCircle(x + 84, 94, 3);
      bg.fillCircle(x + 28, 145, 2);
    });

    bg.lineStyle(3, 0x9e7a43, 1);
    bg.lineBetween(410, 0, 410, 52);
    bg.fillStyle(0xc69a4f, 1);
    bg.fillCircle(410, 58, 12);
    [-36, -18, 18, 36].forEach((dx) => {
      bg.lineStyle(2, 0x9e7a43, 1);
      bg.lineBetween(410, 61, 410 + dx, 78);
      bg.fillStyle(0xffe29a, 1);
      bg.fillCircle(410 + dx, 82, 5);
    });

    [255, 502].forEach((x) => {
      bg.fillStyle(0x9d3035, 1);
      bg.fillRect(x, 67, 64, 86);
      bg.fillStyle(0xf1e9d8, 1);
      bg.fillRect(x + 25, 67, 14, 86);
      bg.lineStyle(3, 0x5c3727, 1);
      bg.strokeRect(x, 67, 64, 86);
    });

    bg.fillStyle(0x7b2830, 1);
    bg.fillRect(192, 326, 436, 64);
    bg.lineStyle(2, 0xc29b62, 0.8);
    bg.strokeRect(198, 331, 424, 54);

    const title = scene.add.text(410, 24, "ZOFINGIA", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "16px",
      color: "#f5e3b6",
      stroke: "#4a2e20",
      strokeThickness: 6
    }).setOrigin(0.5);

    const guests = [];
    const guestData = [
      [92, 299, 0x27354a, 0x8d3035, .78],
      [160, 312, 0x292929, 0x314d78, .72],
      [224, 292, 0x3a3434, 0x7e3037, .74],
      [288, 315, 0x1e2d3d, 0x9c6b35, .72],
      [350, 295, 0x2f3036, 0x843333, .76],
      [470, 305, 0x243347, 0x8a3038, .73],
      [532, 288, 0x353337, 0x354f7c, .76],
      [598, 313, 0x26364a, 0x9b6a38, .72],
      [670, 294, 0x353034, 0x87343a, .78],
      [735, 315, 0x1f2d3c, 0x7d3035, .70],
      [123, 225, 0x26384a, 0x8b3138, .62],
      [693, 224, 0x313239, 0x30547c, .62]
    ];

    guestData.forEach(([x, y, suit, tie, scale], index) => {
      const guest = makePartyGuest(scene, x, y, suit, tie, scale);
      guests.push(guest);
      scene.tweens?.add?.({
        targets: guest,
        y: y - (index % 2 ? 3 : 2),
        angle: { from: -1, to: 1 },
        duration: 900 + (index % 4) * 170,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    });

    const furniture = scene.add.graphics();
    furniture.fillStyle(0x4f3324, 1);
    furniture.fillRoundedRect(35, 275, 135, 12, 4);
    furniture.fillRoundedRect(650, 274, 135, 12, 4);
    furniture.fillStyle(0xd8b05a, 1);
    [62, 97, 132, 678, 713, 748].forEach((x) => {
      furniture.fillRect(x, 259, 5, 15);
      furniture.fillStyle(0xe6d7b0, 1);
      furniture.fillRect(x - 2, 256, 9, 3);
      furniture.fillStyle(0xd8b05a, 1);
    });

    const enrique = createEnrique(scene, 505, 315);
    enrique.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      openEnriqueMenu(scene);
    });

    const simon = scene.add.sprite(205, INDOOR_GAMEPLAY_V37.groundY, "simon", 0)
      .setScale(INDOOR_GAMEPLAY_V37.playerScale)
      .setDepth(736);

    simon.play?.("simon-idle", true);

    overlay.add([
      bg,
      title,
      furniture,
      ...guests,
      enrique,
      simon
    ]);

    const state = {
      simon,
      x: 205,
      y: INDOOR_GAMEPLAY_V37.groundY,
      groundY: INDOOR_GAMEPLAY_V37.groundY,
      vy: 0,
      gravity: INDOOR_GAMEPLAY_V37.gravity,
      jumpVelocity: INDOOR_GAMEPLAY_V37.jumpVelocity,
      left: false,
      right: false,
      jumpRequested: false,
      jumpHeld: false,
      danceUntil: 0,
      lastAnim: null,
      facing: 1
    };

    scene.__sv37ZofingiaOverlay = overlay;
    scene.__sv37ZofingiaGuests = guests;
    scene.__sv37Enrique = enrique;
    scene.__sv37ClubSimon = simon;
    scene.__sv37ClubState = state;

    const keyboard = scene.input?.keyboard;
    const keyA = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.A);
    const keyD = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.D);
    const keyW = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.W);
    const keySpace = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const keyT = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.T);
    const cursors = keyboard?.createCursorKeys?.();

    const keyE = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.E);

    scene.__sv37ClubUpdateHandler = (_time, delta = 16) => {
      if (!scene.__sv37ZofingiaOpen || !state.simon?.active) return;

      const modalOpen = Boolean(
        scene.itemsModal ||
        scene.itemInfoModal ||
        scene.__sv37EnriqueModal
      );

      const left =
        !modalOpen &&
        (state.left || Boolean(keyA?.isDown) || Boolean(cursors?.left?.isDown));
      const right =
        !modalOpen &&
        (state.right || Boolean(keyD?.isDown) || Boolean(cursors?.right?.isDown));

      const keyboardJump =
        !modalOpen &&
        (
          (keyW && Phaser.Input.Keyboard.JustDown(keyW)) ||
          (keySpace && Phaser.Input.Keyboard.JustDown(keySpace)) ||
          (cursors?.up && Phaser.Input.Keyboard.JustDown(cursors.up))
        );

      const jumpPressed = Boolean(state.jumpRequested || keyboardJump);
      state.jumpRequested = false;

      const dancePressed =
        !modalOpen &&
        (
          (keyT && Phaser.Input.Keyboard.JustDown(keyT)) ||
          Boolean(state.danceRequested)
        );
      state.danceRequested = false;

      updateIndoorMovement(scene, state, delta, {
        locked: modalOpen,
        left,
        right,
        jumpPressed,
        dancePressed
      });

      const nearEnrique =
        Math.abs(state.x - 505) <= 120 &&
        Math.abs(state.y - INDOOR_GAMEPLAY_V37.groundY) <= 80;

      if (scene.__sv37EnriquePrompt?.active) {
        scene.__sv37EnriquePrompt.setVisible(nearEnrique && !modalOpen);
      }

      if (
        nearEnrique &&
        !modalOpen &&
        keyE &&
        Phaser.Input.Keyboard.JustDown(keyE)
      ) {
        openEnriqueMenu(scene);
      }
    };

    scene.events?.on?.("update", scene.__sv37ClubUpdateHandler);

    scene.__sv37ClubControlObjects = [
      ...makeIndoorTouchButton(
        scene, 62, 330, "←",
        () => { state.left = true; },
        () => { state.left = false; }
      ),
      ...makeIndoorTouchButton(
        scene, 138, 330, "→",
        () => { state.right = true; },
        () => { state.right = false; }
      ),
      ...makeIndoorTouchButton(
        scene, 682, 330, "J",
        () => { state.jumpRequested = true; }
      ),
      ...makeIndoorTouchButton(
        scene, 758, 330, "♪",
        () => { state.danceRequested = true; }
      )
    ];

    const itemsButton = makeIndoorItemsButton(scene, () => {
      if (scene.__sv37EnriqueModal) return;
      scene.itemsModalTab = "items";
      scene.openItemsModal?.();
    });

    const backButton = makeIndoorBackButton(
      scene,
      "← PROMENADE",
      () => cleanupZofingia(scene, true)
    );

    scene.__sv37ClubControlObjects.push(itemsButton, backButton);

    // Explicit high-depth interaction zone so the full-screen world blocker can
    // never steal Enrique's click.
    const enriqueZone = scene.add.zone(505, 255, 116, 165)
      .setScrollFactor(0)
      .setDepth(1400)
      .setInteractive({ useHandCursor: true });

    enriqueZone.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();

      const stateNow = scene.__sv37ClubState;
      if (!stateNow || scene.__sv37EnriqueModal || scene.itemsModal) return;

      if (Math.abs(stateNow.x - 505) <= 135) {
        openEnriqueMenu(scene);
      }
    });

    const enriquePrompt = scene.add.text(505, 205, "E / KLICK · ANSPRECHEN", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      color: "#fff1bd",
      backgroundColor: "#3d2b22",
      padding: { x: 6, y: 4 }
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1399)
      .setVisible(false);

    scene.__sv37EnriqueZone = enriqueZone;
    scene.__sv37EnriquePrompt = enriquePrompt;
    scene.__sv37ClubControlObjects.push(enriqueZone, enriquePrompt);
  }

  function ensureZurichPromenade(scene) {
    if (!scene?.add || scene.sys?.settings?.key !== "BahnhofquaiScene") return;

    const old = scene.__sv37Promenade;
    if (old?.background?.active && old?.front?.active && old?.zone?.active) {
      return;
    }

    const background = scene.add.container(0, 0).setDepth(-1);

    const sky = scene.add.graphics();
    sky.fillStyle(0x87c7d8, 1);
    // Match Bahnhofstrasse exactly and extend to the top so no vertical seam
    // appears when the camera reaches the shoe-store / promenade transition.
    sky.fillRect(2436, 0, 564, 283);

    // distant Zürichberg / Alps haze
    sky.fillStyle(0x6f7f80, 1);
    sky.fillTriangle(2440, 221, 2560, 156, 2665, 221);
    sky.fillTriangle(2580, 221, 2750, 168, 2890, 221);
    sky.fillTriangle(2790, 221, 2938, 180, 3000, 221);

    // old town silhouette at the Limmat mouth
    sky.fillStyle(0x596567, 1);
    [
      [2448, 181, 52, 56],
      [2504, 169, 48, 68],
      [2554, 187, 42, 50],
      [2597, 177, 50, 60]
    ].forEach(([x, y, w, h]) => sky.fillRect(x, y, w, h));

    // Grossmünster: recognizable twin towers beyond the river.
    sky.fillStyle(0x515e60, 1);
    sky.fillRect(2518, 119, 25, 92);
    sky.fillRect(2550, 119, 25, 92);
    sky.fillRect(2509, 195, 75, 35);
    sky.fillStyle(0x3f4b4e, 1);
    sky.fillTriangle(2518, 119, 2530, 101, 2543, 119);
    sky.fillTriangle(2550, 119, 2562, 101, 2575, 119);
    sky.fillStyle(0x808b89, 1);
    sky.fillRect(2527, 142, 6, 20);
    sky.fillRect(2559, 142, 6, 20);

    // Limmat opening into the lake: narrower to the left, broad water to right.
    sky.fillStyle(0x4c7d91, 1);
    sky.fillTriangle(2440, 237, 2635, 220, 2690, 298);
    sky.fillRect(2580, 220, 420, 78);

    // Münsterbrücke, then broader Quaibrücke near the lake outlet.
    sky.fillStyle(0x9b9488, 1);
    sky.fillRect(2462, 229, 130, 8);
    sky.fillStyle(0x525759, 1);
    [2480, 2520, 2560].forEach((x) => {
      sky.fillRect(x, 237, 5, 18);
    });

    sky.fillStyle(0x8a8781, 1);
    sky.fillRect(2580, 247, 116, 10);
    sky.fillStyle(0x55595b, 1);
    [2595, 2630, 2665].forEach((x) => {
      sky.fillRect(x, 257, 6, 22);
    });

    // Lake reflections / tiny boats.
    sky.fillStyle(0x78a6b5, 0.7);
    for (let x = 2690; x < 2990; x += 38) {
      sky.fillRect(x, 245 + ((x / 38) % 3) * 12, 22, 2);
    }
    sky.fillStyle(0xe7dfca, 1);
    sky.fillTriangle(2775, 237, 2786, 223, 2786, 237);
    sky.fillRect(2773, 237, 20, 3);

    background.add(sky);

    const front = scene.add.container(0, 0).setDepth(3);
    const g = scene.add.graphics();

    // transition from Bahnhofstrasse paving into Bürkliplatz/Seepromenade
    g.fillStyle(0x8b8a82, 1);
    g.fillRect(2437, 282, 563, 56);
    g.fillStyle(0xa5a095, 1);
    g.fillRect(2437, 301, 563, 37);

    // stone lake wall and railing
    g.fillStyle(0x706f68, 1);
    g.fillRect(2437, 281, 563, 8);
    g.lineStyle(3, 0x3e4748, 1);
    g.lineBetween(2445, 278, 3000, 278);
    for (let x = 2450; x < 3000; x += 42) {
      g.lineBetween(x, 259, x, 282);
    }

    // lamps
    [2490, 2680].forEach((x) => {
      g.fillStyle(0x3d4545, 1);
      g.fillRect(x, 205, 5, 75);
      g.fillStyle(0xf1d58b, 0.95);
      g.fillCircle(x + 2, 201, 8);
    });

    // Clubhouse on the promenade – fictional lakeside placement for the game.
    const cx = 2768;
    const cy = 142;
    const cw = 210;
    const ch = 196;

    g.fillStyle(0xd3c5a5, 1);
    g.fillRoundedRect(cx, cy, cw, ch, 5);
    g.lineStyle(4, 0x544234, 1);
    g.strokeRoundedRect(cx, cy, cw, ch, 5);

    g.fillStyle(0x4a3528, 1);
    g.fillTriangle(cx - 8, cy + 5, cx + cw / 2, cy - 35, cx + cw + 8, cy + 5);
    g.fillRect(cx + 10, cy + 5, cw - 20, 8);

    // tall windows
    [cx + 28, cx + 148].forEach((x) => {
      g.fillStyle(0x284252, 1);
      g.fillRoundedRect(x, cy + 50, 38, 68, 3);
      g.lineStyle(3, 0x644b34, 1);
      g.strokeRoundedRect(x, cy + 50, 38, 68, 3);
      g.lineBetween(x + 19, cy + 52, x + 19, cy + 116);
    });

    // central door
    g.fillStyle(0x4d3025, 1);
    g.fillRoundedRect(cx + 82, cy + 77, 48, 119, 4);
    g.fillStyle(0xc9a35c, 1);
    g.fillCircle(cx + 120, cy + 139, 3);

    // restrained red/white connection banners
    g.fillStyle(0x9b3136, 1);
    g.fillRect(cx + 72, cy + 25, 66, 28);
    g.fillStyle(0xf1ead9, 1);
    g.fillRect(cx + 97, cy + 25, 16, 28);

    front.add(g);

    const sign = scene.add.text(cx + cw / 2, cy + 39, "ZOFINGIA", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#f9e7b3",
      backgroundColor: "#513527",
      padding: { x: 7, y: 5 }
    }).setOrigin(0.5);

    front.add(sign);

    // Street/place sign between the lake lookout and the clubhouse.
    const burkliPole = scene.add.graphics();
    burkliPole.fillStyle(0x3e4b52, 1);
    burkliPole.fillRect(2703, 213, 5, 69);
    burkliPole.fillStyle(0x304d69, 1);
    burkliPole.fillRoundedRect(2646, 199, 118, 25, 3);
    burkliPole.lineStyle(2, 0xd7e0e5, 0.9);
    burkliPole.strokeRoundedRect(2646, 199, 118, 25, 3);

    const burkliText = scene.add.text(2705, 211, "BÜRKLIPLATZ", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      color: "#f4f7f8"
    }).setOrigin(0.5);

    front.add([burkliPole, burkliText]);

    const zone = scene.add.zone(cx + 106, cy + 137, 74, 125)
      .setDepth(165)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerdown", (pointer) => {
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();

      if (scene.uiLocked || scene.playerDying || scene.__sv37ZofingiaOpen) {
        return;
      }

      openZofingia(scene);
    });

    scene.__sv37Promenade = { background, front, zone };

    if (!scene.__sv37PromenadeShutdownHook) {
      scene.__sv37PromenadeShutdownHook = true;
      scene.events?.on?.("shutdown", () => {
        cleanupZofingia(scene, false);
        scene.__sv37Promenade = null;
      });
    }
  }


  // ----------------------------------------------------------------
  // HIVE GAMEPLAY PARITY — same movement/UI baseline as outdoor + Zofingia
  // ----------------------------------------------------------------

  function cleanupHiveV37Controls(hive) {
    (hive?.__sv37IndoorControlObjects || []).forEach((object) => {
      try { object?.destroy?.(); } catch {}
    });

    if (hive) {
      hive.__sv37IndoorControlObjects = [];
      hive.__sv37TouchJumpRequested = false;
      hive.__sv37TouchDanceRequested = false;
      hive.__sv37Vy = 0;
    }
  }

  function closeHiveInventory(hive) {
    const source = hive?.overworld;
    if (source?.itemsModal) {
      source.closeItemsModal?.();
    }

    if (hive) {
      hive.__sv37InventoryOpen = false;

      if (
        !hive.__sv32GirlDialogueActive &&
        !hive.modalOpen &&
        !hive.introDancing
      ) {
        hive.actionLocked = false;
      }
    }
  }

  function openHiveInventory(hive) {
    if (
      !hive ||
      hive.__sv37InventoryOpen ||
      hive.__sv32GirlDialogueActive ||
      hive.modalOpen ||
      hive.introDancing ||
      hive.actionLocked
    ) {
      return;
    }

    const source = hive.overworld;
    if (!source?.openItemsModal) return;

    source.itemsModalTab = "items";
    source.openItemsModal();

    if (!source.itemsModal) {
      source.uiLocked = false;
      source.openItemsModal();
    }

    if (source.itemsModal) {
      hive.__sv37InventoryOpen = true;
      hive.actionLocked = true;

      if (source.itemsModal.overlay) {
        source.itemsModal.overlay.style.zIndex = "400800";
      }
    }
  }

  function createHiveV37TouchControls(hive) {
    cleanupHiveV37Controls(hive);

    hive.touchLeft = false;
    hive.touchRight = false;
    hive.__sv37TouchJumpRequested = false;
    hive.__sv37TouchDanceRequested = false;

    hive.__sv37IndoorControlObjects = [
      ...makeIndoorTouchButton(
        hive, 62, 330, "←",
        () => { hive.touchLeft = true; },
        () => { hive.touchLeft = false; }
      ),
      ...makeIndoorTouchButton(
        hive, 138, 330, "→",
        () => { hive.touchRight = true; },
        () => { hive.touchRight = false; }
      ),
      ...makeIndoorTouchButton(
        hive, 682, 330, "J",
        () => { hive.__sv37TouchJumpRequested = true; }
      ),
      ...makeIndoorTouchButton(
        hive, 758, 330, "♪",
        () => { hive.__sv37TouchDanceRequested = true; }
      )
    ];

    const items = makeIndoorItemsButton(
      hive,
      () => openHiveInventory(hive)
    );

    hive.__sv37IndoorControlObjects.push(items);
  }

  function removeHiveCoinBrouwersHud(hive) {
    if (!hive) return;

    const hud = document.querySelector(
      '#phaser-game [data-hive-v12="hud"]'
    );
    hud?.remove?.();

    if (hive.coinText) {
      try { hive.coinText.remove?.(); } catch {}
      hive.coinText = null;
    }
  }

  function resetHiveMovementState(hive) {
    if (!hive?.player?.active) return;

    hive.__sv37State = {
      simon: hive.player,
      x: Phaser.Math.Clamp(
        Number(hive.player.x) || 110,
        INDOOR_GAMEPLAY_V37.minX,
        INDOOR_GAMEPLAY_V37.maxX
      ),
      y: INDOOR_GAMEPLAY_V37.groundY,
      vy: 0,
      danceUntil: 0,
      facing: hive.player.flipX ? -1 : 1,
      lastMode: null
    };

    hive.player.setPosition(
      hive.__sv37State.x,
      INDOOR_GAMEPLAY_V37.groundY
    );
    hive.player.setScale(INDOOR_GAMEPLAY_V37.playerScale);
    hive.player.setAngle(0);
    hive.player.play?.("simon-idle", true);
  }

  function updateHiveV37(hive, delta = 16) {
    if (!hive?.player?.active) return;

    const source = hive.overworld;

    if (
      hive.__sv37InventoryOpen &&
      !source?.itemsModal
    ) {
      hive.__sv37InventoryOpen = false;

      if (
        !hive.__sv32GirlDialogueActive &&
        !hive.modalOpen &&
        !hive.introDancing
      ) {
        hive.actionLocked = false;
      }
    }

    if (!hive.__sv37State || hive.__sv37State.simon !== hive.player) {
      resetHiveMovementState(hive);
    }

    const state = hive.__sv37State;
    if (!state) return;

    const locked = Boolean(
      hive.modalOpen ||
      hive.introDancing ||
      hive.actionLocked ||
      hive.__sv32GirlDialogueActive
    );

    const left =
      !locked &&
      (
        Boolean(hive.cursors?.left?.isDown) ||
        Boolean(hive.keyA?.isDown) ||
        Boolean(hive.touchLeft)
      );

    const right =
      !locked &&
      (
        Boolean(hive.cursors?.right?.isDown) ||
        Boolean(hive.keyD?.isDown) ||
        Boolean(hive.touchRight)
      );

    const keyboardJump =
      !locked &&
      (
        (hive.cursors?.up && Phaser.Input.Keyboard.JustDown(hive.cursors.up)) ||
        (hive.__sv37KeyW && Phaser.Input.Keyboard.JustDown(hive.__sv37KeyW)) ||
        (hive.__sv37KeySpace && Phaser.Input.Keyboard.JustDown(hive.__sv37KeySpace))
      );

    const jumpPressed =
      Boolean(hive.__sv37TouchJumpRequested || keyboardJump);
    hive.__sv37TouchJumpRequested = false;

    const keyboardDance =
      !locked &&
      hive.keyDance &&
      Phaser.Input.Keyboard.JustDown(hive.keyDance);

    const dancePressed =
      Boolean(hive.__sv37TouchDanceRequested || keyboardDance);
    hive.__sv37TouchDanceRequested = false;

    updateIndoorMovement(hive, state, delta, {
      locked,
      left,
      right,
      jumpPressed,
      dancePressed
    });
  }

  function installHiveV37Gameplay(hive) {
    if (!hive || hive.__sv37GameplayPatched) return;
    hive.__sv37GameplayPatched = true;

    const keyboard = hive.input?.keyboard;
    hive.__sv37KeyW = keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.W);
    hive.__sv37KeySpace =
      keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Replace the old HIVE-only touch layout before create() uses it.
    hive.createTouchControls = function createTouchControlsV37() {
      createHiveV37TouchControls(this);
    };

    // Keep HIVE's other persistent DOM (e.g. exit), remove only the redundant
    // coin/Brouwers badge because ITEMS is the common indoor top-right control.
    if (typeof hive.createPersistentDOM === "function") {
      const originalPersistentDOM = hive.createPersistentDOM.bind(hive);

      hive.createPersistentDOM = function createPersistentDOMV37(...args) {
        const result = originalPersistentDOM(...args);
        removeHiveCoinBrouwersHud(this);
        return result;
      };
    }

    // Stable intro dance: use the real action sprite at its matching physical
    // size, but no bob/rotation tween and no second movement system.
    hive.startSimonDanceIntro = function startSimonDanceIntroV37() {
      this.introDancing = true;
      this.touchLeft = false;
      this.touchRight = false;

      if (!this.__sv37State) resetHiveMovementState(this);

      const state = this.__sv37State;
      if (!state) return;

      state.x = 335;
      state.y = INDOOR_GAMEPLAY_V37.groundY;
      state.vy = 0;
      state.danceUntil = performance.now() + 1650;

      this.player.setPosition(state.x, state.y);
      this.player.setAngle(0);
      setIndoorSimonAnimation(this, state, "dance");

      this.time?.delayedCall?.(1650, () => {
        if (!this.sys?.isActive?.() || !this.player?.active) return;

        this.introDancing = false;
        state.danceUntil = 0;
        state.lastMode = null;
        setIndoorSimonAnimation(this, state, "idle");
      });
    };

    if (typeof hive.create === "function") {
      const originalCreate = hive.create.bind(hive);

      hive.create = function createV37(...args) {
        const result = originalCreate(...args);

        this.time?.delayedCall?.(0, () => {
          resetHiveMovementState(this);
          removeHiveCoinBrouwersHud(this);
        });

        this.events?.once?.("shutdown", () => {
          closeHiveInventory(this);
          cleanupHiveV37Controls(this);
          this.__sv37State = null;
        });

        return result;
      };
    }

    // Replace, rather than stack on top of, the old HIVE movement update.
    hive.update = function updateV37(_time, delta) {
      updateHiveV37(this, delta);
    };

    if (typeof hive.leaveHive === "function") {
      const originalLeave = hive.leaveHive.bind(hive);

      hive.leaveHive = function leaveHiveV37(...args) {
        closeHiveInventory(this);
        cleanupHiveV37Controls(this);
        this.__sv37State = null;
        return originalLeave(...args);
      };
    }

    if (hive.sys?.isActive?.() && hive.player?.active) {
      createHiveV37TouchControls(hive);
      resetHiveMovementState(hive);
      removeHiveCoinBrouwersHud(hive);
    }
  }

  function frame() {
    stats.frames += 1;

    const game = getGame();

    if (game) {
      const milk = getScene(game, "MilchbuckScene");
      const station = getScene(game, "BahnhofquaiScene");
      const hive = getScene(game, "HiveInteriorScene");

      if (milk) {
        patchLockerScene(milk);
        patchQuoteBanner(milk);
      }

      if (station) {
        patchLockerScene(station);
        patchPurchases(station);
        patchQuoteBanner(station);
        patchIndianRoom(station);
        ensureZurichPromenade(station);
      }

      if (hive) {
        installHiveV37Gameplay(hive);
        fixGirlFacing(hive);
      }

      // v31 is no longer loaded, but clean up any stale legacy DOM if a browser
      // restored an old page state.
      document
        .querySelectorAll(
          "#phaser-game [data-sv31-inder-profile], " +
          "#phaser-game [data-sv30-shop-inventory], " +
          "#phaser-game [data-sv29-shop-inventory]"
        )
        .forEach((node) => node.remove());
    }

    window.requestAnimationFrame(frame);
  }

  ensureStyles();
  window.requestAnimationFrame(frame);

  window.SimonUIV37 = Object.freeze({
    version: 35,
    locker: LOCKER_STATE,
    status() {
      return {
        ...stats,
        gameSeen: Boolean(getGame()),
        locker: { ...LOCKER_STATE.items }
      };
    }
  });

  console.info(
    "Simon UI v37 geladen: click dialogue cleanup + HIVE/Zofingia gameplay parity."
  );
})();