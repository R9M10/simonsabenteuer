(() => {
  "use strict";

  if (window.__SIMON_UI_V30__) return;
  window.__SIMON_UI_V30__ = true;

  const ITEM_KEYS = [
    "ticket",
    "gatorade",
    "monster",
    "camel",
    "gandhiSticks",
    "bookGeneralRelativity",
    "bookPhaenomenologie",
    "bookPlaybook",
    "bookZarathustra"
  ];

  const C = Object.freeze({
    paper: "#f3dfae",
    paperLight: "#fff0c9",
    paperDark: "#d8ba7d",
    wood: "#6f4728",
    woodDark: "#3f2819",
    woodLight: "#9a6a3d",
    ink: "#3a271a",
    muted: "#765d43",
    green: "#607b48",
    greenDark: "#405532",
    gold: "#e2b85c",
    red: "#8b4335",
    slot: "#d9c08a"
  });

  const state = {
    frames: 0,
    gameSeen: false,
    milkSeen: false,
    hiveSeen: false,
    stationSeen: false,
    normalizedObjects: 0,
    womanFlipApplied: false,
    uiScenesPatched: 0
  };

  function ensureStyle() {
    if (document.getElementById("simon-ui-v30-style")) return;
    const style = document.createElement("style");
    style.id = "simon-ui-v30-style";
    style.textContent = `
      #phaser-game .sv30-panel {
        image-rendering: pixelated;
        scrollbar-color: ${C.woodLight} ${C.paperDark};
      }
      #phaser-game .sv30-panel button {
        border-radius: 3px !important;
        box-shadow: inset 0 -2px 0 rgba(48,31,20,.25);
      }
      #phaser-game .sv30-slot {
        position: relative;
        min-width: 0;
        aspect-ratio: 1 / 1;
        border: 3px solid ${C.wood};
        background: ${C.slot};
        box-shadow:
          inset 0 0 0 2px ${C.paperLight},
          inset 0 -5px 0 rgba(86,55,31,.12);
        box-sizing: border-box;
      }
      #phaser-game .sv30-slot.is-hotbar {
        border-color: ${C.gold};
        background: #e8ce8d;
      }
      #phaser-game .sv30-empty { opacity: .50; }
      #phaser-game .sv30-shop-card { border-radius: 3px; }
    `;
    document.head.appendChild(style);
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

  function isAlive(obj) {
    return Boolean(obj && obj.active !== false);
  }

  function normalizeMilchbuck(scene) {
    if (!scene?.children?.list) return;

    let changed = 0;
    const seen = new Set();

    const visit = (obj) => {
      if (!obj || seen.has(obj)) return;
      seen.add(obj);

      const sx = Number(obj.scrollFactorX);
      const sy = Number(obj.scrollFactorY);

      // Real screen-space UI stays fixed. Every world object is forced to 1:1.
      const screenSpace = sx === 0 && sy === 0;
      if (!screenSpace && typeof obj.setScrollFactor === "function") {
        if (sx !== 1 || sy !== 1) {
          obj.setScrollFactor(1, 1);
          changed += 1;
        }
      }

      if (Array.isArray(obj.list)) obj.list.forEach(visit);
    };

    scene.children.list.forEach(visit);
    state.normalizedObjects += changed;
    scene.__sv30WorldNormalized = true;
  }

  function faceBarWoman(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;
    if (!isAlive(woman) || !isAlive(player)) return;

    // Verified from the user's in-game observation:
    // when Simon is left of the bar woman, she needs to be mirrored.
    const shouldFlip = player.x < woman.x;
    if (woman.flipX !== shouldFlip) woman.setFlipX(shouldFlip);

    hive.__sv30WomanFacing = shouldFlip;
    state.womanFlipApplied = true;
  }

  function label(text, fontSize = "6px", color = C.ink) {
    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize,
      lineHeight: "1.35",
      color,
      textAlign: "left",
      overflowWrap: "anywhere"
    });
    return el;
  }

  function sectionTitle(text) {
    const el = label(text, "6px", C.woodDark);
    Object.assign(el.style, { margin: "3px 0 5px", letterSpacing: ".3px" });
    return el;
  }

  function themePanel(modal, kind = "") {
    if (!modal?.panel || !modal?.overlay) return;
    modal.panel.classList.add("sv30-panel");
    modal.overlay.dataset.sv30 = kind || "themed";

    Object.assign(modal.overlay.style, {
      background: "rgba(31,22,16,.64)",
      padding: "10px"
    });

    Object.assign(modal.panel.style, {
      background: C.paper,
      color: C.ink,
      border: `5px solid ${C.wood}`,
      borderRadius: "7px",
      boxShadow: `0 6px 0 ${C.woodDark}, inset 0 0 0 3px ${C.paperLight}`,
      padding: kind === "items" ? "11px" : "13px"
    });
  }

  function getCount(scene, key) {
    if (key === "ticket") return scene.hasCityTicket ? 1 : 0;
    try {
      return Math.max(0, Number(scene.getItemCount?.(key)) || 0);
    } catch {
      return 0;
    }
  }

  function emptySlot(number = null) {
    const slot = document.createElement("div");
    slot.className = "sv30-slot sv30-empty";
    if (number !== null) {
      const n = label(String(number), "5px", C.muted);
      Object.assign(n.style, { position: "absolute", left: "4px", top: "3px" });
      slot.appendChild(n);
    }
    return slot;
  }

  function inventorySlot(scene, itemKey, { hotbar = false, index = null } = {}) {
    if (!itemKey) return emptySlot(index !== null ? index + 1 : null);

    const slot = document.createElement("div");
    slot.className = `sv30-slot${hotbar ? " is-hotbar" : ""}`;

    if (index !== null) {
      const n = label(String(index + 1), "5px", C.muted);
      Object.assign(n.style, {
        position: "absolute", left: "4px", top: "3px", zIndex: "4"
      });
      slot.appendChild(n);
    }

    const main = scene.createDOMButton?.("", () => {
      const result = scene.toggleItemInHotbar?.(itemKey);
      if (result === "full") {
        const hint = scene.itemsModal?.panel?.querySelector("[data-items-hint]");
        if (hint) hint.textContent = "HOTBAR VOLL · MAX. 5 SLOTS";
        return;
      }
      renderInventory(scene);
      scene.refreshHotbar?.();
    }, {
      background: "transparent",
      border: "transparent",
      minHeight: "100%",
      width: "100%",
      padding: "4px",
      fontSize: "1px",
      color: C.ink
    });

    if (main) {
      Object.assign(main.style, {
        position: "absolute",
        inset: "0",
        height: "100%",
        minHeight: "0",
        zIndex: "1",
        boxShadow: "none"
      });
      slot.appendChild(main);
    }

    const icon = scene.createDOMItemIcon?.(itemKey, hotbar ? 34 : 38);
    if (icon) {
      Object.assign(icon.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-48%)",
        zIndex: "2",
        pointerEvents: "none"
      });
      slot.appendChild(icon);
    }

    const count = getCount(scene, itemKey);
    if (count > 1) {
      const qty = label(String(count), "6px", "#fff8d8");
      Object.assign(qty.style, {
        position: "absolute",
        right: "3px",
        bottom: "3px",
        zIndex: "4",
        background: "rgba(63,40,25,.9)",
        padding: "2px 3px",
        borderRadius: "2px"
      });
      slot.appendChild(qty);
    }

    const info = scene.createDOMButton?.("i", () => scene.openItemInfo?.(itemKey), {
      background: C.wood,
      border: C.gold,
      color: "#fff4cf",
      width: "22px",
      minHeight: "22px",
      padding: "2px",
      fontSize: "7px"
    });

    if (info) {
      Object.assign(info.style, {
        position: "absolute",
        right: "2px",
        top: "2px",
        zIndex: "6"
      });
      slot.appendChild(info);
    }

    return slot;
  }

  function styleTabs(scene) {
    scene.itemsModal?.panel?.querySelectorAll("[data-items-tab]").forEach((button) => {
      const active = button.dataset.itemsTab === scene.itemsModalTab;
      Object.assign(button.style, {
        background: active ? C.wood : C.paperDark,
        borderColor: active ? C.gold : C.woodLight,
        color: active ? "#fff4cf" : C.ink,
        minHeight: "34px",
        fontSize: "5.5px",
        boxShadow: active ? `inset 0 -3px 0 ${C.woodDark}` : "none"
      });
    });
  }

  function renderInventory(scene) {
    const content = scene?.itemsModalContent;
    if (!scene?.itemsModal?.panel || !content || scene.itemsModalTab !== "items") return;

    content.replaceChildren();

    const hotTitle = sectionTitle("HOTBAR · SCHNELLZUGRIFF");
    const hotbar = document.createElement("div");
    Object.assign(hotbar.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5,minmax(0,1fr))",
      gap: "6px",
      maxWidth: "390px",
      margin: "0 auto 9px"
    });

    const hot = Array.isArray(scene.hotbarItems) ? scene.hotbarItems.slice(0, 5) : [];
    while (hot.length < 5) hot.push(null);
    hot.forEach((key, i) => hotbar.appendChild(inventorySlot(scene, key, {
      hotbar: true, index: i
    })));

    const bagTitle = sectionTitle("RUCKSACK");
    const bag = document.createElement("div");
    Object.assign(bag.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5,minmax(0,1fr))",
      gap: "6px",
      maxWidth: "390px",
      margin: "0 auto 8px"
    });

    const owned = ITEM_KEYS.filter((key) => getCount(scene, key) > 0);
    owned.forEach((key) => bag.appendChild(inventorySlot(scene, key)));

    const total = Math.max(10, Math.ceil(Math.max(owned.length, 1) / 5) * 5);
    for (let i = owned.length; i < total; i += 1) bag.appendChild(emptySlot());

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      alignItems: "center",
      marginTop: "5px"
    });

    const hint = label(
      owned.length ? "ITEM ANTIPPEN: HOTBAR · i: INFO" : "NOCH KEINE GEGENSTÄNDE",
      "5px",
      C.muted
    );
    hint.dataset.itemsHint = "true";

    const wallet = label(
      scene.developerMode ? "COINS ∞" : `COINS ${Number(scene.coins) || 0}`,
      "6px",
      C.woodDark
    );
    wallet.style.textAlign = "right";

    footer.append(hint, wallet);
    content.append(hotTitle, hotbar, bagTitle, bag, footer);
    styleTabs(scene);
  }

  function decorateInventory(scene) {
    const modal = scene?.itemsModal;
    if (!modal?.panel) return;

    themePanel(modal, "items");
    modal.panel.dataset.sv30Inventory = "true";

    Object.assign(modal.panel.style, {
      width: "min(96%,680px)",
      maxHeight: "calc(100% - 10px)"
    });

    const children = [...modal.panel.children];
    const top = children[0];
    if (top) {
      Object.assign(top.style, {
        marginBottom: "7px",
        paddingBottom: "7px",
        borderBottom: `3px solid ${C.woodLight}`
      });
      const title = top.firstElementChild;
      if (title) {
        title.style.color = C.woodDark;
        title.style.fontSize = "11px";
      }
      const close = top.lastElementChild;
      if (close?.tagName === "BUTTON") {
        Object.assign(close.style, {
          background: C.red,
          borderColor: "#c98369",
          color: "#fff4d8",
          width: "42px",
          minHeight: "32px"
        });
      }
    }

    styleTabs(scene);
    if (scene.itemsModalTab === "items") renderInventory(scene);
  }

  function shopHotbar(scene) {
    const wrap = document.createElement("div");
    wrap.dataset.sv30ShopInventory = "true";
    Object.assign(wrap.style, {
      borderTop: `3px solid ${C.woodLight}`,
      marginTop: "7px",
      paddingTop: "7px"
    });
    wrap.appendChild(sectionTitle("DEINE HOTBAR"));

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5,46px)",
      justifyContent: "center",
      gap: "5px"
    });

    const items = Array.isArray(scene.hotbarItems) ? scene.hotbarItems.slice(0, 5) : [];
    while (items.length < 5) items.push(null);

    items.forEach((key, i) => {
      const slot = emptySlot(i + 1);
      slot.style.width = "46px";
      slot.style.height = "46px";
      slot.style.aspectRatio = "auto";
      if (key) {
        slot.classList.remove("sv30-empty");
        const icon = scene.createDOMItemIcon?.(key, 28);
        if (icon) {
          Object.assign(icon.style, {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-45%)"
          });
          slot.appendChild(icon);
        }
      }
      row.appendChild(slot);
    });

    wrap.appendChild(row);
    return wrap;
  }

  function styleShopCard(card, kind) {
    if (!card || card.dataset.sv30Card === "true") return;
    card.dataset.sv30Card = "true";
    card.classList.add("sv30-shop-card");

    Object.assign(card.style, {
      display: "grid",
      gridTemplateColumns: "52px minmax(0,1fr) 112px",
      gridTemplateRows: "auto auto auto",
      gap: "3px 8px",
      alignItems: "center",
      padding: "6px 7px",
      border: `3px solid ${C.woodLight}`,
      background: "#e5ca91",
      boxSizing: "border-box",
      minHeight: "62px"
    });

    const kids = [...card.children];
    if (kind === "inder" && kids.length >= 5) {
      const [header, icon, effect, owned, buy] = kids;
      Object.assign(icon.style, { gridColumn: "1", gridRow: "1 / 4", justifySelf: "center" });
      Object.assign(header.style, { gridColumn: "2", gridRow: "1" });
      Object.assign(effect.style, { gridColumn: "2", gridRow: "2", textAlign: "left" });
      Object.assign(owned.style, { gridColumn: "2", gridRow: "3", textAlign: "left" });
      Object.assign(buy.style, {
        gridColumn: "3",
        gridRow: "1 / 4",
        alignSelf: "stretch",
        background: C.greenDark,
        borderColor: "#8fa66f",
        color: "#fff5d5",
        minHeight: "44px"
      });
    }

    if (kind === "books" && kids.length >= 4) {
      const [icon, name, price, buy] = kids;
      Object.assign(icon.style, { gridColumn: "1", gridRow: "1 / 4", justifySelf: "center" });
      Object.assign(name.style, {
        gridColumn: "2", gridRow: "1", textAlign: "left", color: C.ink
      });
      Object.assign(price.style, {
        gridColumn: "2", gridRow: "2", textAlign: "left", color: C.woodDark
      });
      Object.assign(buy.style, {
        gridColumn: "3",
        gridRow: "1 / 4",
        alignSelf: "stretch",
        background: buy.disabled ? "#b8a985" : C.greenDark,
        borderColor: buy.disabled ? "#8c7c60" : "#8fa66f",
        color: buy.disabled ? C.muted : "#fff5d5",
        minHeight: "44px"
      });
    }
  }

  function decorateShop(scene, modal, kind) {
    if (!modal?.panel) return;
    themePanel(modal, kind);

    modal.panel.dataset.sv30Shop = kind;
    Object.assign(modal.panel.style, {
      width: "min(96%,690px)",
      maxHeight: "calc(100% - 10px)"
    });

    const selector = kind === "books" ? "[data-book-buy]" : "[data-store-buy]";
    const buyButtons = [...modal.panel.querySelectorAll(selector)];
    const cards = [...new Set(buyButtons.map((b) => b.parentElement).filter(Boolean))];

    cards.forEach((card) => styleShopCard(card, kind));

    if (cards.length) {
      const list = cards[0].parentElement;
      if (list) Object.assign(list.style, {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "5px",
        maxWidth: "610px",
        width: "100%",
        maxHeight: "185px",
        overflowY: "auto",
        margin: "0 auto 6px"
      });
    }

    const wallet = modal.panel.querySelector("[data-store-wallet], [data-book-wallet]");
    if (wallet) Object.assign(wallet.style, {
      color: C.woodDark,
      background: C.paperLight,
      border: `2px solid ${C.woodLight}`,
      padding: "5px 7px",
      whiteSpace: "nowrap"
    });

    if (!modal.panel.querySelector("[data-sv30-shop-inventory]")) {
      const strip = shopHotbar(scene);
      const status = modal.panel.querySelector("[data-store-status], [data-book-status]");
      modal.panel.insertBefore(strip, status || modal.panel.lastElementChild);
    }

    modal.panel.querySelectorAll("button").forEach((button) => {
      if (button.matches(selector)) return;
      if (button.textContent?.toUpperCase().includes("LADEN")) {
        Object.assign(button.style, {
          background: C.wood,
          borderColor: C.gold,
          color: "#fff4cf"
        });
      }
    });
  }

  function markWrapper(fn) {
    try { fn.__sv30 = true; } catch {}
    return fn;
  }

  function ensureSceneWrappers(scene) {
    if (!scene) return;

    let patchedNow = false;

    if (typeof scene.createDOMModal === "function" && !scene.createDOMModal.__sv30) {
      const original = scene.createDOMModal.bind(scene);
      scene.createDOMModal = markWrapper(function createDOMModalV30(options = {}) {
        const modal = original(options);
        if (
          options.key === "items" ||
          options.key === "item-info" ||
          /shop|catalog|store|orell|inder/i.test(String(options.key || ""))
        ) {
          themePanel(modal, options.key || "");
        }
        return modal;
      });
      patchedNow = true;
    }

    if (
      typeof scene.renderItemsModalTab === "function" &&
      !scene.renderItemsModalTab.__sv30
    ) {
      const original = scene.renderItemsModalTab.bind(scene);
      scene.renderItemsModalTab = markWrapper(function renderItemsModalTabV30(...args) {
        if (this.itemsModalTab === "items" && this.itemsModal && this.itemsModalContent) {
          renderInventory(this);
          return;
        }
        const result = original(...args);
        styleTabs(this);
        return result;
      });
      patchedNow = true;
    }

    if (typeof scene.openItemsModal === "function" && !scene.openItemsModal.__sv30) {
      const original = scene.openItemsModal.bind(scene);
      scene.openItemsModal = markWrapper(function openItemsModalV30(...args) {
        const result = original(...args);
        decorateInventory(this);
        return result;
      });
      patchedNow = true;
    }

    if (
      typeof scene.openIndianShopWindow === "function" &&
      !scene.openIndianShopWindow.__sv30
    ) {
      const original = scene.openIndianShopWindow.bind(scene);
      scene.openIndianShopWindow = markWrapper(function openIndianShopWindowV30(...args) {
        const result = original(...args);
        decorateShop(this, this.shopModal, "inder");
        return result;
      });
      patchedNow = true;
    }

    if (typeof scene.openBookCatalog === "function" && !scene.openBookCatalog.__sv30) {
      const original = scene.openBookCatalog.bind(scene);
      scene.openBookCatalog = markWrapper(function openBookCatalogV30(...args) {
        const result = original(...args);
        decorateShop(this, this.bookstoreCatalogModal, "books");
        return result;
      });
      patchedNow = true;
    }

    // If a modal was already open before this wrapper won the race, decorate it now.
    if (scene.itemsModal?.panel) decorateInventory(scene);
    if (scene.shopModal?.panel) decorateShop(scene, scene.shopModal, "inder");
    if (scene.bookstoreCatalogModal?.panel) {
      decorateShop(scene, scene.bookstoreCatalogModal, "books");
    }

    if (patchedNow) state.uiScenesPatched += 1;
  }

  function frame() {
    state.frames += 1;
    const game = getGame();

    if (game) {
      state.gameSeen = true;

      const milk = getScene(game, "MilchbuckScene");
      const station = getScene(game, "BahnhofquaiScene");
      const hive = getScene(game, "HiveInteriorScene");

      if (milk) {
        state.milkSeen = true;
        normalizeMilchbuck(milk);
        ensureSceneWrappers(milk);
      }
      if (station) {
        state.stationSeen = true;
        ensureSceneWrappers(station);
      }
      if (hive) {
        state.hiveSeen = true;
        faceBarWoman(hive);
      }

      const root = document.getElementById("phaser-game");
      if (root) root.dataset.simonUiVersion = "30";
    }

    window.requestAnimationFrame(frame);
  }

  ensureStyle();
  window.requestAnimationFrame(frame);

  window.SimonUIV30 = Object.freeze({
    version: 30,
    status() {
      return {
        ...state,
        gameGlobal: Boolean(getGame()),
        rootVersion: document.getElementById("phaser-game")?.dataset?.simonUiVersion || null
      };
    },
    normalizeMilchbuck
  });

  console.info("Simon UI v30 geladen.");
})();