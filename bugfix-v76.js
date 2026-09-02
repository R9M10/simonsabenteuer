(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V76__) return;
  window.__SIMON_BUGFIX_V76__ = true;

  const VERSION = 76;
  const INDER_ROOM_SELECTOR =
    '#phaser-game [data-simon-ui="inder-v76-room"]';

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

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function safeDestroy(object) {
    try {
      object?.destroy?.();
    } catch {}
  }

  // =======================================================================
  // 1) DER INDER — canonical old v37 DOM room, atomic reveal
  // =======================================================================

  const imagePromises = new Map();

  function preloadImage(url) {
    if (imagePromises.has(url)) {
      return imagePromises.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";

      img.onload = async () => {
        try {
          await img.decode?.();
        } catch {}
        resolve(img);
      };

      img.onerror = () =>
        reject(
          new Error(`Bild konnte nicht geladen werden: ${url}`)
        );

      img.src = url;
    });

    imagePromises.set(url, promise);
    return promise;
  }

  // Begin immediately, long before the shop is entered.
  preloadImage("inder-shop-v37.png?v=37").catch(() => {});
  preloadImage("inder-sprites-v37.png?v=37").catch(() => {});

  function cleanupInderRoom() {
    const room = document.querySelector(INDER_ROOM_SELECTOR);

    if (room?._v76Timer) {
      window.clearInterval(room._v76Timer);
    }

    room?.remove?.();
  }

  function setInderFrame(seller, row, col) {
    if (!seller) return;

    seller.style.backgroundPosition =
      `${-col * 220}px ${-row * 170}px`;
  }

  function createInderRoom(scene) {
    cleanupInderRoom();

    const root =
      document.getElementById("phaser-game");

    if (!root || !scene?.sys?.isActive?.()) {
      return false;
    }

    const room =
      document.createElement("div");

    room.dataset.simonUi =
      "inder-v76-room";

    // Reuse the proven v37 styling but explicitly define geometry as a
    // fallback so the room remains correct even if CSS order changes later.
    Object.assign(room.style, {
      position: "absolute",
      inset: "0",
      zIndex: "660000",
      overflow: "hidden",
      pointerEvents: "auto",
      background: "#251d17"
    });

    const bg =
      document.createElement("img");

    bg.className =
      "sv37-inder-room-bg";

    bg.src =
      "inder-shop-v37.png?v=37";

    bg.alt = "";
    bg.draggable = false;

    Object.assign(bg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "fill",
      display: "block",
      pointerEvents: "none"
    });

    const seller =
      document.createElement("div");

    seller.className =
      "sv37-inder-seller";

    seller.setAttribute(
      "role",
      "button"
    );

    seller.setAttribute(
      "aria-label",
      "Mit dem Verkäufer handeln"
    );

    seller.tabIndex = 0;

    // The v37 CSS owns the sprite visual. These values are only fallbacks.
    Object.assign(seller.style, {
      cursor: "pointer",
      imageRendering: "pixelated"
    });

    const bubble =
      document.createElement("div");

    bubble.className =
      "sv37-inder-bubble";

    bubble.textContent =
      "Guter Kunde, Guter Kunde";

    room.append(bg, seller, bubble);

    // Only append once every actual image is decoded. No placeholder room,
    // no invisible Simon while a texture is still loading.
    root.appendChild(room);

    const frames = [
      [0,0], [0,1], [0,2], [0,1], [0,3], [0,1],
      [1,0], [1,1], [1,2], [1,3], [1,2], [1,1],
      [0,1], [0,0], [0,2], [0,1],
      [2,0], [2,1], [2,2], [2,3], [2,2], [2,1],
      [0,2], [0,1]
    ];

    let index = 0;
    setInderFrame(
      seller,
      frames[0][0],
      frames[0][1]
    );

    room._v76Timer =
      window.setInterval(() => {
        if (
          !document.body.contains(room) ||
          !scene.indianStoreOverlay
        ) {
          cleanupInderRoom();
          return;
        }

        index =
          (index + 1) %
          frames.length;

        const [row, col] =
          frames[index];

        setInderFrame(
          seller,
          row,
          col
        );
      }, 650);

    const openShop = (event) => {
      stopEvent(event);
      scene.openIndianShopWindow?.();
    };

    seller.addEventListener(
      "pointerdown",
      stopEvent
    );

    seller.addEventListener(
      "pointerup",
      openShop
    );

    seller.addEventListener(
      "click",
      openShop
    );

    seller.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          openShop(event);
        }
      }
    );

    // Minimal sentinel keeps the canonical game UI lock/store logic happy.
    // It deliberately has the subset of Phaser.Container API used by exits.
    scene.indianStoreOverlay = {
      __inderDOMV76: true,
      active: true,
      list: [],
      destroy() {
        this.active = false;
        cleanupInderRoom();
      }
    };

    scene.player?.setVisible?.(false);
    scene.player?.setVelocity?.(0, 0);

    scene.createIndianStoreDOMControls?.();
    scene.refreshUILock?.();

    return true;
  }

  async function enterIndianStoreV76() {
    if (
      this.indianStoreOverlay ||
      this.__inderEnteringV76
    ) {
      return;
    }

    this.__inderEnteringV76 = true;

    if (this.storeEntryModal) {
      this.destroyDOMModal?.(
        this.storeEntryModal
      );

      this.storeEntryModal = null;
    }

    this.setUILocked?.(true);
    this.player?.setVelocity?.(0, 0);

    try {
      // Wait while Simon is still visibly standing in the street.
      await Promise.all([
        preloadImage(
          "inder-shop-v37.png?v=37"
        ),
        preloadImage(
          "inder-sprites-v37.png?v=37"
        )
      ]);

      if (!this.sys?.isActive?.()) {
        return;
      }

      if (!createInderRoom(this)) {
        throw new Error(
          "Inder-Raum konnte nicht aufgebaut werden."
        );
      }
    } catch (error) {
      console.error(
        "Inder v76:",
        error
      );

      this.player?.setVisible?.(true);
      this.setUILocked?.(false);
      this.refreshUILock?.();
    } finally {
      this.__inderEnteringV76 = false;
    }
  }

  enterIndianStoreV76.__sv37Room = true;
  enterIndianStoreV76.__sceneArtV61 = true;
  enterIndianStoreV76.__v76 = true;

  function exitIndianStoreV76() {
    cleanupInderRoom();

    if (this.itemInfoModal) {
      this.destroyDOMModal?.(
        this.itemInfoModal
      );
      this.itemInfoModal = null;
    }

    if (this.shopModal) {
      this.destroyDOMModal?.(
        this.shopModal
      );
      this.shopModal = null;
    }

    if (this.storeEntryModal) {
      this.destroyDOMModal?.(
        this.storeEntryModal
      );
      this.storeEntryModal = null;
    }

    if (
      this.indianStoreBackUI
        ?.overlay
    ) {
      this.indianStoreBackUI
        .overlay.remove?.();
    }

    this.indianStoreBackUI = null;
    this.indianStoreShopUI = null;

    try {
      this.indianStoreOverlay
        ?.destroy?.(true);
    } catch {}

    this.indianStoreOverlay = null;

    this.player?.setVisible?.(true);
    this.player?.setActive?.(true);
    this.player?.setVelocity?.(0, 0);

    if (this.player?.body) {
      this.player.body.enable = true;
      this.player.body.moves = true;
    }

    this.player?.play?.(
      "simon-idle",
      true
    );

    this.setUILocked?.(false);
    this.refreshUILock?.();

    this.cameras?.main
      ?.startFollow?.(
        this.player,
        true,
        0.11,
        0.11
      );

    this.cameras?.main
      ?.setDeadzone?.(
        240,
        80
      );
  }

  exitIndianStoreV76.__sv37Room = true;
  exitIndianStoreV76.__sceneArtV61 = true;
  exitIndianStoreV76.__v76 = true;

  function patchInder() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (!proto) return false;

    if (
      proto.enterIndianStore !==
      enterIndianStoreV76
    ) {
      proto.enterIndianStore =
        enterIndianStoreV76;
    }

    if (
      proto.exitIndianStore !==
      exitIndianStoreV76
    ) {
      proto.exitIndianStore =
        exitIndianStoreV76;
    }

    return true;
  }

  // =======================================================================
  // 2) SCHUHLADEN GESCHLOSSEN — readable like the other game modals
  // =======================================================================

  function styleShoeClosedModal(scene) {
    const modal =
      scene?.shoeStoreClosedModal;

    const panel = modal?.panel;

    if (!panel) return;

    Object.assign(panel.style, {
      background:
        "linear-gradient(180deg,#252733 0%,#171922 100%)",
      border:
        "3px solid #dd70ae",
      color: "#f5eadc",
      boxShadow:
        "7px 7px 0 rgba(0,0,0,.42)"
    });

    Array
      .from(panel.children)
      .forEach((child) => {
        if (
          child instanceof HTMLElement &&
          child.tagName !== "BUTTON"
        ) {
          // Preserve the pink title but make all pale body text readable.
          if (
            !/SCHUHLADEN/i.test(
              child.textContent || ""
            )
          ) {
            child.style.color =
              "#f1e7d7";
          }
        }
      });
  }

  function patchShoeModal() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (
      !proto ||
      typeof proto.openShoeStoreClosedModal !==
        "function" ||
      proto.openShoeStoreClosedModal.__v76
    ) {
      return false;
    }

    const original =
      proto.openShoeStoreClosedModal;

    const wrapped =
      function openShoeStoreClosedModalV76(
        ...args
      ) {
        const result =
          original.apply(
            this,
            args
          );

        styleShoeClosedModal(this);

        // One extra task covers DOM creation finishing at the end of a frame.
        window.setTimeout(
          () => styleShoeClosedModal(this),
          0
        );

        return result;
      };

    wrapped.__v76 = true;
    proto.openShoeStoreClosedModal =
      wrapped;

    return true;
  }

  // =======================================================================
  // 3) ENRIQUE — remove "KLICK · ANSPRECHEN" only
  // =======================================================================

  function hideEnriquePrompt() {
    const scene =
      getScene("BahnhofquaiScene");

    const enrique =
      scene?.__sv37Enrique;

    if (!enrique?.active) return;

    enrique.list?.forEach?.(
      (child) => {
        if (
          child?.type === "Text" &&
          /KLICK|ANSPRECHEN/i.test(
            String(child.text || "")
          )
        ) {
          child.setVisible?.(false);
          child.setAlpha?.(0);
        }
      }
    );

    // Defensive: a later patch may have created the prompt outside the
    // Enrique container. Hide only text near Enrique that matches the wording.
    scene.children?.list
      ?.forEach?.((child) => {
        if (
          child?.type !== "Text" ||
          !/KLICK|ANSPRECHEN/i.test(
            String(child.text || "")
          )
        ) {
          return;
        }

        const dx =
          Math.abs(
            (Number(child.x) || 0) -
            (Number(enrique.x) || 0)
          );

        if (dx < 150) {
          child.setVisible?.(false);
          child.setAlpha?.(0);
        }
      });
  }

  // =======================================================================
  // 4) GANDHI — remove the NUKE scorch/shadow on revival/despawn
  // =======================================================================

  function destroyGandhiScorch(scene) {
    const scorch =
      scene?.__gandhiScorchV76;

    if (scorch?.active) {
      safeDestroy(scorch);
    }

    if (scene) {
      scene.__gandhiScorchV76 =
        null;

      // Remove the dead reference from the explosion registry too.
      if (
        Array.isArray(
          scene.gandhiExplosionObjects
        )
      ) {
        scene.gandhiExplosionObjects =
          scene.gandhiExplosionObjects
            .filter(
              (object) =>
                object &&
                object.active !== false
            );
      }
    }
  }

  function patchGandhiScorch() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.BahnhofquaiScene
        ?.prototype;

    if (!proto) return false;

    if (
      typeof proto.runGandhiNukeExplosion ===
        "function" &&
      !proto.runGandhiNukeExplosion.__v76
    ) {
      const original =
        proto.runGandhiNukeExplosion;

      const wrapped =
        function runGandhiNukeExplosionV76(
          ...args
        ) {
          const before =
            new Set(
              this.children?.list || []
            );

          const result =
            original.apply(
              this,
              args
            );

          // game.js creates the scorch as a new 132×22 Phaser Ellipse.
          const fresh =
            (this.children?.list || [])
              .find((object) => {
                if (before.has(object)) {
                  return false;
                }

                const type =
                  String(
                    object?.type || ""
                  ).toLowerCase();

                const width =
                  Number(
                    object?.width ||
                    object?.geom?.width ||
                    object?.displayWidth
                  );

                const height =
                  Number(
                    object?.height ||
                    object?.geom?.height ||
                    object?.displayHeight
                  );

                return (
                  type.includes("ellipse") &&
                  Math.abs(width - 132) < 5 &&
                  Math.abs(height - 22) < 5
                );
              });

          if (fresh) {
            this.__gandhiScorchV76 =
              fresh;
          }

          return result;
        };

      wrapped.__v76 = true;
      proto.runGandhiNukeExplosion =
        wrapped;
    }

    [
      "forceDarkGandhiRevival",
      "startDarkGandhiBoss"
    ].forEach((method) => {
      if (
        typeof proto[method] !==
          "function" ||
        proto[method].__v76
      ) {
        return;
      }

      const original =
        proto[method];

      const wrapped =
        function cleanupGandhiScorchV76(
          ...args
        ) {
          destroyGandhiScorch(this);
          return original.apply(
            this,
            args
          );
        };

      wrapped.__v76 = true;
      proto[method] = wrapped;
    });

    return true;
  }

  // =======================================================================
  // 5) ALBERT EINSTEIN — Simon keeps one physical/display scale
  // =======================================================================

  function stabilizeEinsteinPlayer() {
    const scene =
      getScene("ETHInteriorScene");

    const player = scene?.player;

    if (
      !scene?.sys?.isActive?.() ||
      !player?.active
    ) {
      return;
    }

    if (!player.__einsteinScaleGuardV76) {
      const rawSetScale =
        player.setScale.bind(player);

      player.setScale =
        function setScaleEinsteinStableV76(
          x,
          y = x
        ) {
          const nx = Number(x);
          const ny = Number(y);

          // eth-campus-v59 changes Simon from .42 to .52 for each spoken
          // line. With a centred sprite/body this looks like Simon jumps.
          if (
            (
              Math.abs(nx - 0.52) <
                0.03 ||
              Math.abs(nx - 0.42) <
                0.03
            ) &&
            (
              Math.abs(ny - 0.52) <
                0.03 ||
              Math.abs(ny - 0.42) <
                0.03
            )
          ) {
            return rawSetScale(
              0.42,
              0.42
            );
          }

          return rawSetScale(
            x,
            y
          );
        };

      player.__einsteinScaleGuardV76 =
        true;

      // If a line was already mid-animation at installation time.
      rawSetScale(0.42, 0.42);
    }

    // Pin the actual feet while Einstein interaction/dialogue/quiz is active.
    const busy =
      Boolean(
        scene.__einsteinInteractionBusy ||
        scene.__ethDialogueActive ||
        scene.__ethQuizModal
      );

    if (busy) {
      if (
        !Number.isFinite(
          scene.__einsteinPlayerYV76
        )
      ) {
        scene.__einsteinPlayerYV76 =
          player.y;
      }

      player.setVelocityY?.(0);
      player.setY?.(
        scene.__einsteinPlayerYV76
      );
    } else {
      scene.__einsteinPlayerYV76 =
        null;
    }
  }

  // =======================================================================
  // 6) POLYTERRASSE / ORELL — show the user's ACTUAL handwritten note
  // =======================================================================

  function patchActualNote(root) {
    if (!(root instanceof Element)) {
      return;
    }

    const overlays = [];

    if (
      root.matches?.(
        '[data-simon-ui="cashier-note-v54"]'
      )
    ) {
      overlays.push(root);
    }

    root
      .querySelectorAll?.(
        '[data-simon-ui="cashier-note-v54"]'
      )
      .forEach(
        (node) =>
          overlays.push(node)
      );

    overlays.forEach((overlay) => {
      if (
        overlay.dataset
          .actualNoteV76 === "1"
      ) {
        return;
      }

      const panel =
        overlay.firstElementChild;

      if (!panel) return;

      const oldImage =
        panel.querySelector(
          'img[src*="coffee-plan-note-v72"]'
        );

      const oldText =
        Array.from(
          panel.children
        ).find((node) =>
          /sympathisch|Kaffee|Kafi/i.test(
            node.textContent || ""
          )
        );

      const target =
        oldImage || oldText;

      if (!target) return;

      const image =
        document.createElement("img");

      image.src =
        "orell-original-note-v76.png?v=76";

      image.alt =
        "Simons handgeschriebener Zettel";

      Object.assign(
        image.style,
        {
          display: "block",
          width: "min(94%, 620px)",
          maxHeight: "245px",
          objectFit: "contain",
          margin: "2px auto 8px",
          borderRadius: "8px",
          filter:
            "drop-shadow(0 4px 0 rgba(42,26,12,.22))"
        }
      );

      target.replaceWith(image);

      overlay.dataset
        .actualNoteV76 = "1";
    });
  }

  function installNoteObserver() {
    const root =
      document.getElementById(
        "phaser-game"
      );

    if (
      !root ||
      root.__actualNoteObserverV76
    ) {
      return;
    }

    root.__actualNoteObserverV76 =
      true;

    patchActualNote(root);

    const observer =
      new MutationObserver(
        (records) => {
          records.forEach((record) => {
            record.addedNodes
              .forEach((node) => {
                if (
                  node instanceof
                  Element
                ) {
                  patchActualNote(node);
                }
              });
          });
        }
      );

    observer.observe(
      root,
      {
        childList: true,
        subtree: true
      }
    );
  }

  // =======================================================================
  // Defensive Amsif guarantee — original placeholder only
  // =======================================================================

  function enforceAmsifPlaceholder() {
    const amsif =
      getScene("BahnhofquaiScene")
        ?.amsif;

    if (!amsif?.active) return;

    [
      amsif.__npcSpriteV69,
      amsif.__npcSpriteV71,
      amsif.__npcSpriteV75
    ]
      .filter(Boolean)
      .forEach((sprite) => {
        safeDestroy(sprite);
      });

    amsif.__npcSpriteV69 = null;
    amsif.__npcSpriteV71 = null;
    amsif.__npcSpriteV75 = null;

    amsif.list?.forEach?.(
      (child) => {
        if (child?.type === "Graphics") {
          child.setVisible?.(true);
          child.setAlpha?.(1);
        }
      }
    );
  }

  function install() {
    patchInder();
    patchShoeModal();
    patchGandhiScorch();
    installNoteObserver();
  }

  function tick() {
    install();
    hideEnriquePrompt();
    stabilizeEinsteinPlayer();
    enforceAmsifPlaceholder();
  }

  install();
  tick();

  window.setInterval(
    tick,
    160
  );

  window.SimonBugfixV76 =
    Object.freeze({
      VERSION,
      status() {
        return {
          version: VERSION,
          inderDOM:
            Boolean(
              document.querySelector(
                INDER_ROOM_SELECTOR
              )
            ),
          shoeModalStyled:
            Boolean(
              getScene(
                "BahnhofquaiScene"
              )
                ?.shoeStoreClosedModal
            ),
          enriquePromptHidden:
            Boolean(
              getScene(
                "BahnhofquaiScene"
              )
                ?.__sv37Enrique
            ),
          gandhiScorchActive:
            Boolean(
              getScene(
                "BahnhofquaiScene"
              )
                ?.__gandhiScorchV76
                ?.active
            ),
          einsteinScaleGuard:
            Boolean(
              getScene(
                "ETHInteriorScene"
              )
                ?.player
                ?.__einsteinScaleGuardV76
            ),
          actualNoteVisible:
            Boolean(
              document.querySelector(
                '[data-simon-ui="cashier-note-v54"] img[src*="orell-original-note-v76"]'
              )
            )
        };
      }
    });
})();
