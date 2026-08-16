(() => {
  "use strict";

  if (window.__SIMON_UI_V29__) return;
  window.__SIMON_UI_V29__ = true;

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

  const COLORS = Object.freeze({
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
    slot: "#d9c08a",
    slotDark: "#b99860"
  });

  function makeStyle() {
    if (document.getElementById("simon-ui-v29-style")) return;

    const style = document.createElement("style");
    style.id = "simon-ui-v29-style";
    style.textContent = `
      #phaser-game .sv29-panel {
        image-rendering: pixelated;
        scrollbar-color: ${COLORS.woodLight} ${COLORS.paperDark};
      }
      #phaser-game .sv29-panel button {
        border-radius: 3px !important;
        box-shadow: inset 0 -2px 0 rgba(48,31,20,.25);
      }
      #phaser-game .sv29-slot {
        position: relative;
        min-width: 0;
        aspect-ratio: 1 / 1;
        border: 3px solid ${COLORS.wood};
        background: ${COLORS.slot};
        box-shadow:
          inset 0 0 0 2px ${COLORS.paperLight},
          inset 0 -5px 0 rgba(86,55,31,.12);
        box-sizing: border-box;
      }
      #phaser-game .sv29-slot.is-hotbar {
        border-color: ${COLORS.gold};
        background: #e8ce8d;
      }
      #phaser-game .sv29-empty {
        opacity: .52;
      }
      #phaser-game .sv29-shop-card {
        transition: transform 80ms ease;
      }
      #phaser-game .sv29-shop-card:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }

  function themePanel(modal, key = "") {
    if (!modal?.panel || !modal?.overlay) return;

    modal.panel.classList.add("sv29-panel");
    modal.overlay.dataset.sv29 = key;

    Object.assign(modal.overlay.style, {
      background: "rgba(31, 22, 16, 0.64)",
      padding: "10px"
    });

    Object.assign(modal.panel.style, {
      background: COLORS.paper,
      color: COLORS.ink,
      border: `5px solid ${COLORS.wood}`,
      borderRadius: "7px",
      boxShadow: `0 6px 0 ${COLORS.woodDark}, inset 0 0 0 3px ${COLORS.paperLight}`,
      padding: key === "items" ? "11px" : "13px"
    });
  }

  function themeModalForKey(modal, key) {
    if (!modal) return modal;

    if (
      key === "items" ||
      key === "item-info" ||
      /shop|catalog|store|orell|inder/i.test(String(key))
    ) {
      themePanel(modal, key);
    }

    return modal;
  }

  function getCount(scene, key) {
    if (key === "ticket") return scene.hasCityTicket ? 1 : 0;
    try {
      return Math.max(0, Number(scene.getItemCount?.(key)) || 0);
    } catch {
      return 0;
    }
  }

  function createLabel(text, fontSize = "6px", color = COLORS.ink) {
    const node = document.createElement("div");
    node.textContent = text;
    Object.assign(node.style, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize,
      lineHeight: "1.35",
      color,
      textAlign: "left"
    });
    return node;
  }

  function createSectionTitle(text) {
    const node = createLabel(text, "6px", COLORS.woodDark);
    Object.assign(node.style, {
      margin: "3px 0 5px",
      letterSpacing: ".3px"
    });
    return node;
  }

  function createEmptySlot(number = null) {
    const slot = document.createElement("div");
    slot.className = "sv29-slot sv29-empty";
    if (number !== null) {
      const num = createLabel(String(number), "5px", COLORS.muted);
      Object.assign(num.style, { position: "absolute", left: "4px", top: "3px" });
      slot.appendChild(num);
    }
    return slot;
  }

  function createInventorySlot(scene, itemKey, { hotbar = false, index = null } = {}) {
    if (!itemKey) return createEmptySlot(index !== null ? index + 1 : null);

    const slot = document.createElement("div");
    slot.className = `sv29-slot${hotbar ? " is-hotbar" : ""}`;

    if (index !== null) {
      const num = createLabel(String(index + 1), "5px", COLORS.muted);
      Object.assign(num.style, { position: "absolute", left: "4px", top: "3px", zIndex: "4" });
      slot.appendChild(num);
    }

    const main = scene.createDOMButton?.("", () => {
      const result = scene.toggleItemInHotbar?.(itemKey);
      if (result === "full") {
        const hint = scene.itemsModal?.panel?.querySelector("[data-items-hint]");
        if (hint) hint.textContent = "HOTBAR VOLL · MAX. 5 SLOTS";
        return;
      }
      scene.renderItemsModalTab?.();
      scene.refreshHotbar?.();
    }, {
      background: "transparent",
      border: "transparent",
      minHeight: "100%",
      width: "100%",
      padding: "6px",
      fontSize: "1px",
      color: COLORS.ink
    });

    if (main) {
      Object.assign(main.style, {
        position: "absolute",
        inset: "0",
        minHeight: "0",
        height: "100%",
        zIndex: "1",
        boxShadow: "none"
      });
      main.setAttribute("aria-label", hotbar ? "Aus Hotbar entfernen" : "Hotbar umschalten");
      slot.appendChild(main);
    }

    const icon = scene.createDOMItemIcon?.(itemKey, hotbar ? 34 : 38);
    if (icon) {
      Object.assign(icon.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -48%)",
        zIndex: "2",
        pointerEvents: "none"
      });
      slot.appendChild(icon);
    }

    const count = getCount(scene, itemKey);
    if (count > 1) {
      const qty = createLabel(`${count}`, "6px", "#fff8d8");
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
      background: COLORS.wood,
      border: COLORS.gold,
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

  function styleInventoryTabs(scene) {
    const panel = scene.itemsModal?.panel;
    if (!panel) return;

    panel.querySelectorAll("[data-items-tab]").forEach((button) => {
      const active = button.dataset.itemsTab === scene.itemsModalTab;
      Object.assign(button.style, {
        background: active ? COLORS.wood : COLORS.paperDark,
        borderColor: active ? COLORS.gold : COLORS.woodLight,
        color: active ? "#fff4cf" : COLORS.ink,
        minHeight: "34px",
        fontSize: "5.5px",
        boxShadow: active ? `inset 0 -3px 0 ${COLORS.woodDark}` : "none"
      });
    });
  }

  function renderInventoryItems(scene, content) {
    content.replaceChildren();

    const hotbarTitle = createSectionTitle("HOTBAR · SCHNELLZUGRIFF");
    const hotbar = document.createElement("div");
    Object.assign(hotbar.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
      gap: "6px",
      maxWidth: "390px",
      margin: "0 auto 9px"
    });

    const hotbarItems = Array.isArray(scene.hotbarItems)
      ? scene.hotbarItems.slice(0, 5)
      : [];
    while (hotbarItems.length < 5) hotbarItems.push(null);

    hotbarItems.forEach((itemKey, index) => {
      hotbar.appendChild(createInventorySlot(scene, itemKey, { hotbar: true, index }));
    });

    const bagTitle = createSectionTitle("RUCKSACK");
    const bag = document.createElement("div");
    Object.assign(bag.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
      gap: "6px",
      maxWidth: "390px",
      margin: "0 auto 8px"
    });

    const owned = ITEM_KEYS.filter((key) => getCount(scene, key) > 0);
    owned.forEach((key) => bag.appendChild(createInventorySlot(scene, key)));
    const targetSlots = Math.max(10, Math.ceil(owned.length / 5) * 5);
    for (let i = owned.length; i < targetSlots; i += 1) {
      bag.appendChild(createEmptySlot());
    }

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      marginTop: "5px"
    });

    const hint = createLabel(
      owned.length ? "ITEM ANTIPPEN: HOTBAR · i: INFO" : "NOCH KEINE GEGENSTÄNDE",
      "5px",
      COLORS.muted
    );
    hint.dataset.itemsHint = "true";

    const wallet = createLabel(
      scene.developerMode ? "COINS ∞" : `COINS ${Number(scene.coins) || 0}`,
      "6px",
      COLORS.woodDark
    );
    wallet.style.textAlign = "right";

    footer.append(hint, wallet);
    content.append(hotbarTitle, hotbar, bagTitle, bag, footer);
  }

  function decorateInventory(scene) {
    const modal = scene.itemsModal;
    if (!modal?.panel) return;

    themePanel(modal, "items");
    Object.assign(modal.panel.style, {
      width: "min(96%, 680px)",
      maxHeight: "calc(100% - 10px)"
    });

    const children = [...modal.panel.children];
    const top = children[0];
    const tabs = children[1];

    if (top) {
      Object.assign(top.style, {
        marginBottom: "7px",
        paddingBottom: "7px",
        borderBottom: `3px solid ${COLORS.woodLight}`
      });
      const title = top.firstElementChild;
      if (title) {
        title.style.color = COLORS.woodDark;
        title.style.fontSize = "11px";
      }
      const close = top.lastElementChild;
      if (close?.tagName === "BUTTON") {
        Object.assign(close.style, {
          background: COLORS.red,
          borderColor: "#c98369",
          color: "#fff4d8",
          width: "42px",
          minHeight: "32px"
        });
      }
    }

    if (tabs) {
      Object.assign(tabs.style, {
        gap: "5px",
        marginBottom: "8px"
      });
    }
    styleInventoryTabs(scene);
  }

  function styleGenericCards(root) {
    if (!root) return;
    [...root.children].forEach((card) => {
      if (!(card instanceof HTMLElement)) return;
      if (card.tagName === "BUTTON") return;
      if (card.children.length < 2) return;
      Object.assign(card.style, {
        borderColor: COLORS.woodLight,
        background: "#e5ca91",
        color: COLORS.ink,
        borderRadius: "3px"
      });
    });
  }

  function createShopInventoryStrip(scene) {
    const wrap = document.createElement("div");
    wrap.dataset.sv29ShopInventory = "true";
    Object.assign(wrap.style, {
      borderTop: `3px solid ${COLORS.woodLight}`,
      marginTop: "7px",
      paddingTop: "7px"
    });

    wrap.appendChild(createSectionTitle("DEINE HOTBAR"));
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "grid",
      gridTemplateColumns: "repeat(5, 46px)",
      justifyContent: "center",
      gap: "5px"
    });

    const items = Array.isArray(scene.hotbarItems) ? scene.hotbarItems.slice(0, 5) : [];
    while (items.length < 5) items.push(null);

    items.forEach((key, index) => {
      const slot = createEmptySlot(index + 1);
      slot.style.width = "46px";
      slot.style.height = "46px";
      slot.style.aspectRatio = "auto";
      if (key) {
        slot.classList.remove("sv29-empty");
        const icon = scene.createDOMItemIcon?.(key, 28);
        if (icon) {
          Object.assign(icon.style, {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -45%)"
          });
          slot.appendChild(icon);
        }
        const count = getCount(scene, key);
        if (count > 1) {
          const qty = createLabel(String(count), "5px", "#fff4cf");
          Object.assign(qty.style, {
            position: "absolute",
            right: "2px",
            bottom: "2px",
            background: COLORS.woodDark,
            padding: "1px 2px"
          });
          slot.appendChild(qty);
        }
      }
      row.appendChild(slot);
    });

    wrap.appendChild(row);
    return wrap;
  }

  function styleShopCard(card, kind) {
    if (!card || card.dataset.sv29Card === "true") return;
    card.dataset.sv29Card = "true";
    card.classList.add("sv29-shop-card");

    Object.assign(card.style, {
      display: "grid",
      gridTemplateColumns: "52px minmax(0, 1fr) 112px",
      gridTemplateRows: "auto auto auto",
      gap: "3px 8px",
      alignItems: "center",
      padding: "6px 7px",
      border: `3px solid ${COLORS.woodLight}`,
      background: "#e5ca91",
      boxSizing: "border-box",
      minHeight: "62px"
    });

    const kids = [...card.children];
    if (kind === "inder" && kids.length >= 5) {
      const [header, icon, effect, owned, buy] = kids;
      Object.assign(icon.style, { gridColumn: "1", gridRow: "1 / 4", justifySelf: "center" });
      Object.assign(header.style, { gridColumn: "2", gridRow: "1", alignSelf: "end" });
      Object.assign(effect.style, { gridColumn: "2", gridRow: "2", textAlign: "left" });
      Object.assign(owned.style, { gridColumn: "2", gridRow: "3", textAlign: "left" });
      Object.assign(buy.style, {
        gridColumn: "3",
        gridRow: "1 / 4",
        alignSelf: "stretch",
        background: COLORS.greenDark,
        borderColor: "#8fa66f",
        color: "#fff5d5",
        minHeight: "44px"
      });
      header.querySelectorAll("div").forEach((el) => { el.style.color = COLORS.ink; });
    } else if (kind === "books" && kids.length >= 4) {
      const [icon, name, price, buy] = kids;
      Object.assign(icon.style, { gridColumn: "1", gridRow: "1 / 4", justifySelf: "center" });
      Object.assign(name.style, { gridColumn: "2", gridRow: "1", textAlign: "left", color: COLORS.ink });
      Object.assign(price.style, { gridColumn: "2", gridRow: "2", textAlign: "left", color: COLORS.woodDark });
      Object.assign(buy.style, {
        gridColumn: "3",
        gridRow: "1 / 4",
        alignSelf: "stretch",
        background: buy.disabled ? "#b8a985" : COLORS.greenDark,
        borderColor: buy.disabled ? "#8c7c60" : "#8fa66f",
        color: buy.disabled ? COLORS.muted : "#fff5d5",
        minHeight: "44px"
      });
    }
  }

  function decorateShop(scene, modal, kind) {
    if (!modal?.panel) return;
    themePanel(modal, kind);

    Object.assign(modal.panel.style, {
      width: "min(96%, 690px)",
      maxHeight: "calc(100% - 10px)"
    });

    const buySelector = kind === "books" ? "[data-book-buy]" : "[data-store-buy]";
    const buyButtons = [...modal.panel.querySelectorAll(buySelector)];
    const cards = [...new Set(buyButtons.map((button) => button.parentElement).filter(Boolean))];
    cards.forEach((card) => styleShopCard(card, kind));

    if (cards.length) {
      const list = cards[0].parentElement;
      if (list) {
        Object.assign(list.style, {
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
    }

    const wallet = modal.panel.querySelector("[data-store-wallet], [data-book-wallet]");
    if (wallet) {
      Object.assign(wallet.style, {
        color: COLORS.woodDark,
        background: COLORS.paperLight,
        border: `2px solid ${COLORS.woodLight}`,
        padding: "5px 7px",
        whiteSpace: "nowrap"
      });
    }

    // Normalize titles and existing back buttons.
    const firstText = [...modal.panel.children].find((el) => el.tagName === "DIV");
    if (firstText) firstText.style.color = COLORS.woodDark;

    modal.panel.querySelectorAll("button").forEach((button) => {
      if (button.matches(buySelector)) return;
      if (button.textContent?.trim().toUpperCase().includes("LADEN")) {
        Object.assign(button.style, {
          background: COLORS.wood,
          borderColor: COLORS.gold,
          color: "#fff4cf"
        });
      }
    });

    if (!modal.panel.querySelector("[data-sv29-shop-inventory]")) {
      const strip = createShopInventoryStrip(scene);
      const status = modal.panel.querySelector("[data-store-status], [data-book-status]");
      modal.panel.insertBefore(strip, status || modal.panel.lastElementChild);
    }
  }

  function normalizeMilchbuckWorld(scene) {
    if (!scene?.children?.list) return;

    const visit = (object) => {
      if (!object) return;

      const sx = Number(object.scrollFactorX);
      const sy = Number(object.scrollFactorY);

      // 0/0 is screen space (HUD, touch controls, modal overlays) and stays fixed.
      if (!(sx === 0 && sy === 0) && typeof object.setScrollFactor === "function") {
        if (sx !== 1 || sy !== 1) object.setScrollFactor(1, 1);
      }

      if (Array.isArray(object.list)) object.list.forEach(visit);
    };

    scene.children.list.forEach(visit);
  }

  function patchMilchbuck(scene) {
    if (!scene || scene.__simonUiV29Milchbuck) return;
    scene.__simonUiV29Milchbuck = true;

    // Use the Scene postupdate event instead of replacing scene.update().
    // This survives other runtime patches that wrap/replace update later.
    const normalize = () => normalizeMilchbuckWorld(scene);
    scene.events?.on?.("postupdate", normalize);
    scene.events?.on?.("wake", normalize);

    const originalCreate = typeof scene.create === "function" ? scene.create.bind(scene) : null;
    if (originalCreate) {
      scene.create = function createV29(...args) {
        const result = originalCreate(...args);
        normalizeMilchbuckWorld(this);
        this.time?.delayedCall?.(120, () => normalizeMilchbuckWorld(this));
        this.time?.delayedCall?.(700, () => normalizeMilchbuckWorld(this));
        return result;
      };
    }

    normalizeMilchbuckWorld(scene);
  }

  function patchHiveFacing(hive) {
    if (!hive || hive.__simonUiV29HiveFacing) return;
    hive.__simonUiV29HiveFacing = true;

    const face = () => {
      const woman = hive.womanSprite;
      const player = hive.player;
      if (!woman?.active || !player?.active) return;

      // v18 had the source orientation backwards. The sprite must be mirrored
      // when Simon is LEFT of her (the usual bar conversation position).
      woman.setFlipX(player.x < woman.x);
    };

    // Apply after every HIVE frame so the v18 orientation can never win the
    // final frame, even while dialogue/actionLocked makes the base update return early.
    hive.events?.on?.("postupdate", face);
    hive.events?.on?.("wake", face);

    const originalWomanMenu = typeof hive.openWomanMenu === "function"
      ? hive.openWomanMenu.bind(hive)
      : null;
    if (originalWomanMenu) {
      hive.openWomanMenu = function openWomanMenuV29(...args) {
        const result = originalWomanMenu(...args);
        face();
        return result;
      };
    }

    const originalDialogue = typeof hive.startRejectedDanceInvite === "function"
      ? hive.startRejectedDanceInvite.bind(hive)
      : null;
    if (originalDialogue) {
      hive.startRejectedDanceInvite = function startRejectedDanceInviteV29(...args) {
        const result = originalDialogue(...args);
        face();
        this.time?.delayedCall?.(100, face);
        this.time?.delayedCall?.(2800, face);
        this.time?.delayedCall?.(6300, face);
        this.time?.delayedCall?.(8750, face);
        return result;
      };
    }

    face();
  }

  function patchSceneUI(scene) {
    if (!scene || scene.__simonUiV29Patched) return;
    scene.__simonUiV29Patched = true;

    const originalCreateModal = typeof scene.createDOMModal === "function"
      ? scene.createDOMModal.bind(scene)
      : null;
    if (originalCreateModal) {
      scene.createDOMModal = function createDOMModalV29(options = {}) {
        const modal = originalCreateModal(options);
        return themeModalForKey(modal, options.key || "");
      };
    }

    const originalRender = typeof scene.renderItemsModalTab === "function"
      ? scene.renderItemsModalTab.bind(scene)
      : null;
    if (originalRender) {
      scene.renderItemsModalTab = function renderItemsModalTabV29() {
        if (!this.itemsModal || !this.itemsModalContent) return;

        if (this.itemsModalTab === "items") {
          styleInventoryTabs(this);
          renderInventoryItems(this, this.itemsModalContent);
          return;
        }

        originalRender();
        styleInventoryTabs(this);
        styleGenericCards(this.itemsModalContent);
      };
    }

    const originalOpenItems = typeof scene.openItemsModal === "function"
      ? scene.openItemsModal.bind(scene)
      : null;
    if (originalOpenItems) {
      scene.openItemsModal = function openItemsModalV29(...args) {
        const result = originalOpenItems(...args);
        decorateInventory(this);
        return result;
      };
    }

    const originalIndianShop = typeof scene.openIndianShopWindow === "function"
      ? scene.openIndianShopWindow.bind(scene)
      : null;
    if (originalIndianShop) {
      scene.openIndianShopWindow = function openIndianShopWindowV29(...args) {
        const result = originalIndianShop(...args);
        decorateShop(this, this.shopModal, "inder");
        return result;
      };
    }

    const originalBookCatalog = typeof scene.openBookCatalog === "function"
      ? scene.openBookCatalog.bind(scene)
      : null;
    if (originalBookCatalog) {
      scene.openBookCatalog = function openBookCatalogV29(...args) {
        const result = originalBookCatalog(...args);
        decorateShop(this, this.bookstoreCatalogModal, "books");
        return result;
      };
    }
  }

  function installOnGame(game, attempt = 0) {
    if (!game?.scene || attempt > 300) return;

    const milk = game.scene.getScene?.("MilchbuckScene");
    const station = game.scene.getScene?.("BahnhofquaiScene");
    const hive = game.scene.getScene?.("HiveInteriorScene");

    if (milk) {
      patchMilchbuck(milk);
      patchSceneUI(milk);
    }
    if (station) patchSceneUI(station);
    if (hive) patchHiveFacing(hive);

    if (!milk || !station || !hive) {
      window.setTimeout(() => installOnGame(game, attempt + 1), 40);
    }
  }

  makeStyle();

  const wrappedStartSimonGame = window.startSimonGame;
  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Simon UI v29: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithUiV29(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);
    if (game) installOnGame(game);
    return game;
  };

  window.SimonUIV29 = Object.freeze({
    normalizeMilchbuckWorld,
    version: 29
  });
})();
