(() => {
  "use strict";

  if (window.__SIMON_UI_V33__) return;
  window.__SIMON_UI_V33__ = true;

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

  const LOCKER_STATE = window.__SIMON_LOCKER_V33__ || {
    items: Object.fromEntries(LOCKER_KEYS.map((key) => [key, 0]))
  };

  LOCKER_KEYS.forEach((key) => {
    LOCKER_STATE.items[key] = Math.max(0, Number(LOCKER_STATE.items[key]) || 0);
  });

  window.__SIMON_LOCKER_V33__ = LOCKER_STATE;

  const stats = {
    frames: 0,
    girlFacingFixes: 0,
    autoHotbarAdds: 0,
    lockerMoves: 0,
    lockerOpens: 0,
    shopRoomBuilds: 0,
    quoteResizes: 0
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

  function ensureStyles() {
    if (document.getElementById("simon-ui-v33-style")) return;

    const style = document.createElement("style");
    style.id = "simon-ui-v33-style";
    style.textContent = `
      #phaser-game [data-simon-ui="inder-v33-room"] {
        position: absolute;
        inset: 0;
        z-index: 99980;
        overflow: hidden;
        pointer-events: none;
        image-rendering: pixelated;
      }

      #phaser-game .sv33-inder-room-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
        image-rendering: pixelated;
        user-select: none;
        pointer-events: none;
      }

      #phaser-game .sv33-inder-seller {
        position: absolute;
        left: 300px;
        top: 110px;
        width: 220px;
        height: 170px;
        z-index: 3;
        background-image: url("inder-sprites-v33.png?v=33");
        background-repeat: no-repeat;
        background-size: 880px 510px;
        image-rendering: pixelated;
        pointer-events: auto;
        cursor: pointer;
        touch-action: manipulation;
        filter: drop-shadow(0 4px 0 rgba(25, 12, 5, .38));
        -webkit-tap-highlight-color: transparent;
      }

      #phaser-game .sv33-inder-bubble {
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

      #phaser-game .sv33-locker-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
        min-height: 0;
      }

      #phaser-game .sv33-locker-section {
        min-width: 0;
        border: 3px solid #7b6a4d;
        background: #e8d3a3;
        padding: 7px;
        box-sizing: border-box;
      }

      #phaser-game .sv33-locker-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-height: 215px;
        overflow-y: auto;
        min-height: 90px;
      }

      #phaser-game .sv33-locker-row {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) auto;
        align-items: center;
        gap: 7px;
        border: 2px solid #a88c5c;
        background: #f3dfae;
        padding: 5px;
        box-sizing: border-box;
      }

      #phaser-game .sv33-locker-empty {
        padding: 18px 6px;
        color: #765d43;
        font-family: "Press Start 2P", monospace;
        font-size: 5px;
        line-height: 1.5;
        text-align: center;
      }

      @media (max-width: 620px) {
        #phaser-game .sv33-locker-grid {
          gap: 6px;
        }
        #phaser-game .sv33-locker-row {
          grid-template-columns: 34px minmax(0, 1fr);
        }
        #phaser-game .sv33-locker-row button {
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
      !scene.purchaseStoreItem.__sv33AutoHotbar
    ) {
      const original = scene.purchaseStoreItem.bind(scene);

      const wrapped = function purchaseStoreItemV33(itemKey, ...args) {
        const before = getSceneItemCount(this, itemKey);
        const result = original(itemKey, ...args);
        const after = getSceneItemCount(this, itemKey);

        if (after > before) {
          firstFreeHotbar(this, itemKey);
        }

        return result;
      };

      wrapped.__sv33AutoHotbar = true;
      scene.purchaseStoreItem = wrapped;
    }

    if (
      typeof scene.purchaseBook === "function" &&
      !scene.purchaseBook.__sv33AutoHotbar
    ) {
      const original = scene.purchaseBook.bind(scene);

      const wrapped = function purchaseBookV33(bookKey, ...args) {
        const itemKey = BOOK_TO_ITEM[bookKey];
        const before = itemKey ? getSceneItemCount(this, itemKey) : 0;
        const result = original(bookKey, ...args);
        const after = itemKey ? getSceneItemCount(this, itemKey) : 0;

        if (itemKey && after > before) {
          firstFreeHotbar(this, itemKey);
        }

        return result;
      };

      wrapped.__sv33AutoHotbar = true;
      scene.purchaseBook = wrapped;
    }
  }

  function patchQuoteBanner(scene) {
    if (
      !scene ||
      typeof scene.showRandomBookQuote !== "function" ||
      scene.showRandomBookQuote.__sv33QuoteSize
    ) {
      return;
    }

    const original = scene.showRandomBookQuote.bind(scene);

    const wrapped = function showRandomBookQuoteV33(bookKey, ...args) {
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

    wrapped.__sv33QuoteSize = true;
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
    scene.updateInventoryUI?.();
    scene.refreshHotbar?.();
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
    scene.updateInventoryUI?.();
    scene.refreshHotbar?.();
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
    row.className = "sv33-locker-row";

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
    const modal = scene?.__sv33LockerModal;
    if (!modal?.panel) return;

    const content = modal.panel.querySelector("[data-sv33-locker-content]");
    if (!content) return;
    content.replaceChildren();

    const grid = document.createElement("div");
    grid.className = "sv33-locker-grid";

    const bagSection = document.createElement("section");
    bagSection.className = "sv33-locker-section";

    const lockerSection = document.createElement("section");
    lockerSection.className = "sv33-locker-section";

    const bagTitle = domText(scene, "RUCKSACK", "7px", "#4b3525");
    bagTitle.style.marginBottom = "7px";

    const lockerTitle = domText(scene, "LOCKER", "7px", "#33463e");
    lockerTitle.style.marginBottom = "7px";

    const bagList = document.createElement("div");
    bagList.className = "sv33-locker-list";

    const lockerList = document.createElement("div");
    lockerList.className = "sv33-locker-list";

    const bagItems = LOCKER_KEYS
      .map((key) => [key, getSceneItemCount(scene, key)])
      .filter(([, count]) => count > 0);

    const storedItems = LOCKER_KEYS
      .map((key) => [key, Math.max(0, Number(LOCKER_STATE.items[key]) || 0)])
      .filter(([, count]) => count > 0);

    if (!bagItems.length) {
      const empty = document.createElement("div");
      empty.className = "sv33-locker-empty";
      empty.textContent = "KEINE OBJEKTE IM RUCKSACK";
      bagList.appendChild(empty);
    } else {
      bagItems.forEach(([key, count]) => {
        bagList.appendChild(lockerItemRow(scene, key, count, "store"));
      });
    }

    if (!storedItems.length) {
      const empty = document.createElement("div");
      empty.className = "sv33-locker-empty";
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

  function closeLocker(scene, silent = false) {
    const modal = scene?.__sv33LockerModal;
    if (!modal) return;

    try {
      scene.destroyDOMModal?.(modal);
    } catch {
      modal.overlay?.remove?.();
    }

    scene.__sv33LockerModal = null;

    if (!silent) {
      scene.refreshUILock?.();
    }
  }

  function openLocker(scene) {
    if (!scene || scene.__sv33LockerModal) return;

    if (
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
      scene.gandhiDialogueActive ||
      scene.milkmanDialogueActive
    ) {
      return;
    }

    const modal = scene.createDOMModal?.({
      key: "locker-v33",
      width: "min(96%, 680px)",
      background: "#ead5a5",
      border: "#40544a",
      shade: "rgba(12, 14, 13, .72)",
      padding: "11px"
    });

    if (!modal) return;

    scene.__sv33LockerModal = modal;
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
    content.dataset.sv33LockerContent = "true";

    modal.panel.append(top, hint, content);
    scene.setUILocked?.(true);
    renderLocker(scene);
    stats.lockerOpens += 1;
  }

  function ensureLocker(scene) {
    if (!scene?.add || !scene?.sys?.settings?.key) return;

    const key = scene.sys.settings.key;
    if (key !== "MilchbuckScene" && key !== "BahnhofquaiScene") return;

    const old = scene.__sv33LockerObjects;
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

    scene.__sv33LockerObjects = { body, label, zone };
  }

  function patchLockerScene(scene) {
    if (!scene) return;

    if (
      typeof scene.refreshUILock === "function" &&
      !scene.refreshUILock.__sv33LockerAware
    ) {
      const original = scene.refreshUILock.bind(scene);

      const wrapped = function refreshUILockV33(...args) {
        const result = original(...args);
        if (this.__sv33LockerModal) {
          this.setUILocked?.(true);
        }
        return result;
      };

      wrapped.__sv33LockerAware = true;
      scene.refreshUILock = wrapped;
    }

    if (
      typeof scene.openItemsModal === "function" &&
      !scene.openItemsModal.__sv33LockerAware
    ) {
      const original = scene.openItemsModal.bind(scene);

      const wrapped = function openItemsModalV33(...args) {
        if (this.__sv33LockerModal) return;
        return original(...args);
      };

      wrapped.__sv33LockerAware = true;
      scene.openItemsModal = wrapped;
    }

    if (
      typeof scene.create === "function" &&
      !scene.create.__sv33LockerCreate
    ) {
      const original = scene.create.bind(scene);

      const wrapped = function createV33(...args) {
        const result = original(...args);
        this.time?.delayedCall?.(0, () => ensureLocker(this));
        return result;
      };

      wrapped.__sv33LockerCreate = true;
      scene.create = wrapped;
    }

    ensureLocker(scene);
  }

  function cleanupIndianRoom() {
    const room = document.querySelector(
      '#phaser-game [data-simon-ui="inder-v33-room"]'
    );

    if (room?._sv33Timer) {
      window.clearInterval(room._sv33Timer);
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
    if (document.querySelector('#phaser-game [data-simon-ui="inder-v33-room"]')) {
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const room = document.createElement("div");
    room.dataset.simonUi = "inder-v33-room";

    const bg = document.createElement("img");
    bg.className = "sv33-inder-room-bg";
    bg.src = "inder-shop-v33.png?v=33";
    bg.alt = "";
    bg.draggable = false;

    const seller = document.createElement("div");
    seller.className = "sv33-inder-seller";
    seller.setAttribute("role", "button");
    seller.setAttribute("aria-label", "Mit dem Verkäufer handeln");
    seller.tabIndex = 0;

    const bubble = document.createElement("div");
    bubble.className = "sv33-inder-bubble";
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

    room._sv33Timer = window.setInterval(() => {
      if (!document.body.contains(room) || !scene.indianStoreOverlay) {
        cleanupIndianRoom();
        return;
      }

      index = (index + 1) % frames.length;
      const [row, col] = frames[index];
      setIndianFrame(seller, row, col);
    }, 330);

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
      !scene.enterIndianStore.__sv33Room
    ) {
      const original = scene.enterIndianStore.bind(scene);

      const wrapped = function enterIndianStoreV33(...args) {
        const result = original(...args);
        this.time?.delayedCall?.(0, () => buildIndianRoom(this));
        return result;
      };

      wrapped.__sv33Room = true;
      scene.enterIndianStore = wrapped;
    }

    if (
      typeof scene.exitIndianStore === "function" &&
      !scene.exitIndianStore.__sv33Room
    ) {
      const original = scene.exitIndianStore.bind(scene);

      const wrapped = function exitIndianStoreV33(...args) {
        cleanupIndianRoom();
        return original(...args);
      };

      wrapped.__sv33Room = true;
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

    // User-tested orientation: the v32 direction is visually reversed.
    // Apply the opposite flip last in the frame.
    const shouldFlip = player.x < woman.x;

    if (woman.flipX !== shouldFlip) {
      woman.setFlipX(shouldFlip);
      stats.girlFacingFixes += 1;
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
      }

      if (hive) {
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

  window.SimonUIV33 = Object.freeze({
    version: 33,
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
    "Simon UI v33 geladen: Inder assets + Auto-Hotbar + Locker + quote/facing fixes."
  );
})();