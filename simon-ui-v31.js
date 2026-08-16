(() => {
  "use strict";

  if (window.__SIMON_UI_V31__) return;
  window.__SIMON_UI_V31__ = true;

  const BOOK_TO_ITEM = Object.freeze({
    generalRelativity: "bookGeneralRelativity",
    phaenomenologie: "bookPhaenomenologie",
    playbook: "bookPlaybook",
    zarathustra: "bookZarathustra"
  });

  const state = {
    frames: 0,
    shopsSorted: 0,
    shopIconsUnified: 0,
    lionNoRemoved: 0,
    girlDialoguePatched: false,
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
    if (document.getElementById("simon-ui-v31-style")) return;

    const style = document.createElement("style");
    style.id = "simon-ui-v31-style";
    style.textContent = `
      /* v30 added a hotbar preview to shops. v31 intentionally removes it. */
      #phaser-game [data-sv30-shop-inventory],
      #phaser-game [data-sv29-shop-inventory],
      #phaser-game [data-sv31-shop-inventory] {
        display: none !important;
      }

      #phaser-game .sv31-inder-profile {
        display: grid;
        grid-template-columns: 86px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        width: min(100%, 420px);
        margin: 3px auto 8px;
        padding: 7px 9px;
        box-sizing: border-box;
        border: 3px solid #9a6a3d;
        background: #f0d99f;
        box-shadow: inset 0 0 0 2px #fff0c9;
        color: #3a271a;
        font-family: "Press Start 2P", monospace;
      }

      #phaser-game .sv31-avatar-frame {
        position: relative;
        width: 80px;
        height: 66px;
        overflow: hidden;
        border: 3px solid #6f4728;
        background: #ca8048;
        image-rendering: pixelated;
        box-sizing: border-box;
      }

      #phaser-game .sv31-avatar {
        position: absolute;
        left: 24px;
        bottom: 2px;
        width: 31px;
        height: 52px;
        animation: sv31-waddle .62s steps(2, end) infinite;
        transform-origin: 50% 100%;
      }

      #phaser-game .sv31-avatar-body {
        position: absolute;
        left: 3px;
        top: 20px;
        width: 26px;
        height: 30px;
        background: #efe0bd;
        border: 2px solid #713524;
        box-sizing: border-box;
      }

      #phaser-game .sv31-avatar-body::after {
        content: "";
        position: absolute;
        left: 10px;
        top: -2px;
        width: 6px;
        height: 30px;
        background: #9f4934;
      }

      #phaser-game .sv31-avatar-head {
        position: absolute;
        left: 6px;
        top: 2px;
        width: 20px;
        height: 20px;
        background: #a96f4d;
        border: 2px solid #4b2e22;
        box-sizing: border-box;
      }

      #phaser-game .sv31-avatar-head::before {
        content: "";
        position: absolute;
        left: -2px;
        top: -4px;
        width: 20px;
        height: 6px;
        background: #1f1b1a;
      }

      #phaser-game .sv31-avatar-head::after {
        content: "";
        position: absolute;
        left: 3px;
        bottom: 3px;
        width: 10px;
        height: 3px;
        background: #241712;
      }

      #phaser-game .sv31-arm {
        position: absolute;
        right: -8px;
        top: 26px;
        width: 16px;
        height: 7px;
        background: #a96f4d;
        transform-origin: 0 50%;
        animation: sv31-offer-arm 1.2s steps(2, end) infinite;
      }

      #phaser-game .sv31-offer-stage {
        position: absolute;
        right: 2px;
        top: 11px;
        width: 27px;
        height: 28px;
      }

      #phaser-game .sv31-cig,
      #phaser-game .sv31-aubergine {
        position: absolute;
        left: 1px;
        top: 8px;
      }

      #phaser-game .sv31-cig {
        width: 24px;
        height: 6px;
        box-sizing: border-box;
        border: 1px solid #66543b;
        background: #f5f0df;
        animation: sv31-cig-cycle 4s steps(1, end) infinite;
      }

      #phaser-game .sv31-cig::before {
        content: "";
        position: absolute;
        left: -1px;
        top: -1px;
        width: 8px;
        height: 6px;
        background: #c78a44;
        border-right: 1px solid #75522e;
      }

      #phaser-game .sv31-aubergine {
        width: 13px;
        height: 22px;
        border-radius: 48% 48% 58% 58%;
        background: #5b2f78;
        border: 2px solid #35203f;
        box-sizing: border-box;
        transform: rotate(20deg);
        animation: sv31-aub-cycle 4s steps(1, end) infinite;
      }

      #phaser-game .sv31-aubergine::before {
        content: "";
        position: absolute;
        left: 1px;
        top: -6px;
        width: 9px;
        height: 7px;
        background: #4e7b3b;
        clip-path: polygon(50% 100%, 0 0, 42% 20%, 100% 0);
      }

      #phaser-game .sv31-profile-copy {
        min-width: 0;
        text-align: left;
        line-height: 1.5;
      }

      #phaser-game .sv31-profile-title {
        font-size: 7px;
        color: #5a3724;
        margin-bottom: 5px;
      }

      #phaser-game .sv31-profile-sub {
        font-size: 5px;
        color: #765d43;
      }

      @keyframes sv31-waddle {
        0%,100% { transform: translateX(-2px) rotate(-2deg); }
        50% { transform: translateX(2px) rotate(2deg); }
      }

      @keyframes sv31-offer-arm {
        0%,100% { transform: rotate(-8deg); }
        50% { transform: rotate(14deg); }
      }

      @keyframes sv31-cig-cycle {
        0%, 49% { opacity: 1; transform: translateY(0); }
        50%, 100% { opacity: 0; transform: translateY(3px); }
      }

      @keyframes sv31-aub-cycle {
        0%, 49% { opacity: 0; transform: rotate(20deg) translateY(3px); }
        50%, 100% { opacity: 1; transform: rotate(20deg) translateY(0); }
      }
    `;

    document.head.appendChild(style);
  }

  function sameItemIcon(scene, itemKey, size = 44) {
    if (!scene?.createDOMItemIcon || !itemKey) return null;

    try {
      const icon = scene.createDOMItemIcon(itemKey, size);
      if (!icon) return null;
      icon.dataset.sv31ItemIcon = itemKey;
      return icon;
    } catch (error) {
      console.warn("v31: Item-Icon konnte nicht erzeugt werden:", itemKey, error);
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

      const na = String(a.name || "");
      const nb = String(b.name || "");
      return na.localeCompare(nb, "de");
    });
  }

  function unifyCardIcon(scene, card, itemKey, kind) {
    if (!card || !itemKey) return;
    if (card.dataset.sv31UnifiedIcon === itemKey) return;

    const newIcon = sameItemIcon(scene, itemKey, kind === "books" ? 42 : 44);
    if (!newIcon) return;

    const children = [...card.children];
    const oldIcon = kind === "books" ? children[0] : children[1];

    if (!oldIcon || oldIcon.tagName === "BUTTON") return;

    Object.assign(newIcon.style, {
      gridColumn: "1",
      gridRow: "1 / 4",
      justifySelf: "center",
      alignSelf: "center"
    });

    oldIcon.replaceWith(newIcon);
    card.dataset.sv31UnifiedIcon = itemKey;
    state.shopIconsUnified += 1;
  }

  function cleanupShopHotbar(modal) {
    modal?.panel?.querySelectorAll(
      "[data-sv30-shop-inventory], [data-sv29-shop-inventory], [data-sv31-shop-inventory]"
    ).forEach((node) => node.remove());
  }

  function decorateIndianProfile(modal) {
    if (!modal?.panel) return;
    if (modal.panel.querySelector("[data-sv31-inder-profile]")) return;

    const profile = document.createElement("div");
    profile.dataset.sv31InderProfile = "true";
    profile.className = "sv31-inder-profile";

    const frame = document.createElement("div");
    frame.className = "sv31-avatar-frame";

    const avatar = document.createElement("div");
    avatar.className = "sv31-avatar";

    const head = document.createElement("span");
    head.className = "sv31-avatar-head";

    const body = document.createElement("span");
    body.className = "sv31-avatar-body";

    const arm = document.createElement("span");
    arm.className = "sv31-arm";

    avatar.append(head, body, arm);

    const offer = document.createElement("div");
    offer.className = "sv31-offer-stage";

    const cigarette = document.createElement("span");
    cigarette.className = "sv31-cig";

    const aubergine = document.createElement("span");
    aubergine.className = "sv31-aubergine";

    offer.append(cigarette, aubergine);
    frame.append(avatar, offer);

    const copy = document.createElement("div");
    copy.className = "sv31-profile-copy";

    const title = document.createElement("div");
    title.className = "sv31-profile-title";
    title.textContent = "DER INDER";

    const sub = document.createElement("div");
    sub.className = "sv31-profile-sub";
    sub.textContent = "wackelt · bietet Zigi und Aubergine im Wechsel an";

    copy.append(title, sub);
    profile.append(frame, copy);

    const first = modal.panel.firstElementChild;
    if (first?.nextSibling) {
      modal.panel.insertBefore(profile, first.nextSibling);
    } else {
      modal.panel.appendChild(profile);
    }
  }

  function decorateIndianShop(scene) {
    const modal = scene?.shopModal;
    if (!modal?.panel) return;

    cleanupShopHotbar(modal);
    decorateIndianProfile(modal);

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

    const sorted = sortByPrice(entries);
    const list = sorted[0]?.card?.parentElement;

    if (list) {
      sorted.forEach((entry) => list.appendChild(entry.card));
      list.dataset.sv31Sorted = "price-asc";
      state.shopsSorted += 1;
    }

    sorted.forEach((entry) => {
      unifyCardIcon(scene, entry.card, entry.key, "inder");
    });
  }

  function decorateBookShop(scene) {
    const modal = scene?.bookstoreCatalogModal;
    if (!modal?.panel) return;

    cleanupShopHotbar(modal);

    const buttons = [...modal.panel.querySelectorAll("[data-book-buy]")];
    if (!buttons.length) return;

    const defs = scene.getBookDefinitions?.() || {};

    const entries = buttons.map((button) => {
      const bookKey = button.dataset.bookBuy;
      const book = defs[bookKey] || {};
      return {
        key: bookKey,
        itemKey: BOOK_TO_ITEM[bookKey],
        name: book.title || bookKey,
        price: book.price,
        card: button.parentElement
      };
    }).filter((entry) => entry.card);

    const sorted = sortByPrice(entries);
    const list = sorted[0]?.card?.parentElement;

    if (list) {
      sorted.forEach((entry) => list.appendChild(entry.card));
      list.dataset.sv31Sorted = "price-asc";
      state.shopsSorted += 1;
    }

    sorted.forEach((entry) => {
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

  function faceGirl(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;
    if (!woman?.active || !player?.active) return;

    woman.setFlipX(player.x < woman.x);
    player.setFlipX(woman.x < player.x);
  }

  function cleanupGirlDialogue(hive) {
    const handler = hive?.__sv31GirlPointerHandler;

    if (handler && hive.input?.off) {
      hive.input.off("pointerup", handler);
    }

    hive.__sv31GirlPointerHandler = null;
    hive.__sv31GirlDialogueState = null;
    hive.__sv31GirlDialogueActive = false;

    hive.destroySpeechBubble?.();
    hive.stopSimonAction?.();

    if (hive.womanSprite?.active) {
      hive.womanSprite.play("woman-v14-idle", true);
    }

    if (hive.player?.active) {
      hive.player.play("simon-idle", true);
    }

    faceGirl(hive);
    hive.actionLocked = false;
  }

  function installClickGirlDialogue(hive) {
    if (!hive || typeof hive.startRejectedDanceInvite !== "function") return;
    if (hive.startRejectedDanceInvite.__sv31ClickDialogue) return;

    const clickDialogue = function startRejectedDanceInviteV31() {
      if (this.__sv31GirlDialogueActive) return;

      this.closeModal?.();
      this.actionLocked = true;
      this.__sv31GirlDialogueActive = true;

      faceGirl(this);

      const steps = [
        {
          who: "simon",
          text: "Hey, weisch du, wo ich nice Schueh chaufe cha?"
        },
        {
          who: "woman",
          text: "Ja, fahr mit de Tram zur Bahnhofstrass. Det findsch sicher öppis im Schueh-Shop."
        },
        {
          who: "simon",
          text: "Merci! Willsch mit mir tanze?"
        },
        {
          who: "woman-reject",
          text: "Eher nöd…"
        },
        {
          who: "woman",
          text: "Du bisch nice."
        },
        {
          who: "woman",
          text: "Aber…"
        },
        {
          who: "woman-reject",
          text: "nöd sooooo nice"
        }
      ];

      const dialogueState = {
        index: 0,
        ignoreUntil: Number(this.time?.now || 0) + 380,
        steps
      };

      this.__sv31GirlDialogueState = dialogueState;

      const render = () => {
        const current = this.__sv31GirlDialogueState;
        if (!current || !this.__sv31GirlDialogueActive) return;

        const step = current.steps[current.index];
        if (!step) {
          cleanupGirlDialogue(this);
          return;
        }

        this.destroySpeechBubble?.();
        this.stopSimonAction?.();
        faceGirl(this);

        if (step.who === "simon") {
          this.playSimonAction?.("simon-v14-talk", { loop: true });
          this.showSpeechBubble?.(this.player, step.text, 0);
          return;
        }

        if (this.womanSprite?.active) {
          this.womanSprite.play(
            step.who === "woman-reject" ? "woman-v14-reject" : "woman-v14-idle",
            true
          );
        }

        this.showSpeechBubble?.(this.womanSprite, step.text, 0);
      };

      const advance = (pointer) => {
        const current = this.__sv31GirlDialogueState;
        if (!current || !this.__sv31GirlDialogueActive) return;

        const now = Number(this.time?.now || 0);
        if (now < current.ignoreUntil) return;

        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();

        current.index += 1;
        current.ignoreUntil = now + 220;

        if (current.index >= current.steps.length) {
          cleanupGirlDialogue(this);
          return;
        }

        render();
      };

      this.__sv31GirlPointerHandler = advance;
      this.input?.on?.("pointerup", advance);

      this.events?.once?.("shutdown", () => cleanupGirlDialogue(this));
      render();
    };

    clickDialogue.__sv31ClickDialogue = true;
    hive.startRejectedDanceInvite = clickDialogue;
    state.girlDialoguePatched = true;
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
    if (!seller || seller.__sv31SellerAnimated) return seller;
    seller.__sv31SellerAnimated = true;

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

    const renderOffer = () => {
      if (!seller.active) return;
      drawOfferGraphic(graphic, kind);
      offerText.setText(kind === "cigarette" ? "ZIGI?" : "AUBERGINE?");
      kind = kind === "cigarette" ? "aubergine" : "cigarette";
    };

    renderOffer();

    const timer = scene.time?.addEvent?.({
      delay: 1650,
      loop: true,
      callback: renderOffer
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

    scene.__sv31IndianSeller = seller;
    return seller;
  }

  function patchIndianSellerFactory(scene) {
    if (!scene || typeof scene.createIndianSeller !== "function") return;
    if (scene.createIndianSeller.__sv31IndianSeller) return;

    const original = scene.createIndianSeller.bind(scene);

    const wrapped = function createIndianSellerV31(...args) {
      const seller = original(...args);
      return animateIndianSeller(this, seller);
    };

    wrapped.__sv31IndianSeller = true;
    scene.createIndianSeller = wrapped;
    state.indianSellerPatched = true;
  }

  function frame() {
    state.frames += 1;

    const game = getGame();
    if (game) {
      const milk = getScene(game, "MilchbuckScene");
      const station = getScene(game, "BahnhofquaiScene");
      const hive = getScene(game, "HiveInteriorScene");

      if (milk) {
        patchLionChoice(milk);
      }

      if (station) {
        patchIndianSellerFactory(station);

        if (station.shopModal?.panel) {
          decorateIndianShop(station);
        }

        if (station.bookstoreCatalogModal?.panel) {
          decorateBookShop(station);
        }
      }

      if (hive) {
        installClickGirlDialogue(hive);
        faceGirl(hive);
      }
    }

    window.requestAnimationFrame(frame);
  }

  ensureStyle();
  window.requestAnimationFrame(frame);

  window.SimonUIV31 = Object.freeze({
    version: 31,
    status() {
      return {
        ...state,
        gameSeen: Boolean(getGame())
      };
    }
  });

  console.info("Simon UI v31 geladen.");
})();