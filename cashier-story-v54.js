(() => {
  "use strict";

  if (window.__SIMON_CASHIER_STORY_V54__) return;
  window.__SIMON_CASHIER_STORY_V54__ = true;

  const VERSION = 54;

  const state =
    window.__SIMON_CASHIER_STATE_V54__ || {
      cashierSeen: false,
      firstExitGreetingSeen: false,
      firstCrushThoughtSeen: false,
      needsInspiration: false,
      inspirationHintSeen: false,
      coffeePlanWritten: false,
      cashierAsked: false,
      cashierRejected: false,
      postRejectThoughtSeen: false
    };

  window.__SIMON_CASHIER_STATE_V54__ = state;

  const runtime = {
    worldBubble: null,
    clickOverlay: null,
    storeDialogue: null,
    noteModal: null
  };

  // ---------------------------------------------------------------------------
  // General helpers
  // ---------------------------------------------------------------------------

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getBahnhof(game = getGame()) {
    try {
      return game?.scene?.getScene?.("BahnhofquaiScene") || null;
    } catch {
      return null;
    }
  }

  function getTerrace(game = getGame()) {
    try {
      return game?.scene?.getScene?.("PolyterrasseScene") || null;
    } catch {
      return null;
    }
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function rootNode() {
    return document.getElementById("phaser-game");
  }

  function destroyWorldBubble() {
    runtime.worldBubble?.destroy?.(true);
    runtime.worldBubble = null;
  }

  function removeClickOverlay() {
    runtime.clickOverlay?.remove?.();
    runtime.clickOverlay = null;
  }

  function removeStoreDialogue() {
    runtime.storeDialogue?.remove?.();
    runtime.storeDialogue = null;
  }

  function removeNote() {
    runtime.noteModal?.remove?.();
    runtime.noteModal = null;
  }

  function cleanupDialogueUI() {
    destroyWorldBubble();
    removeClickOverlay();
    removeStoreDialogue();
    removeNote();
  }

  function createClickCatcher(onAdvance, zIndex = 560000) {
    removeClickOverlay();

    const root = rootNode();
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "cashier-click-v54";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: String(zIndex),
      pointerEvents: "auto",
      cursor: "pointer",
      background: "transparent",
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent"
    });

    let lastAt = -Infinity;

    const down = (event) => {
      stopEvent(event);
    };

    const up = (event) => {
      stopEvent(event);

      const now = performance.now();
      if (now - lastAt < 250) return;

      lastAt = now;
      onAdvance?.();
    };

    overlay.addEventListener("pointerdown", down, { passive: false });
    overlay.addEventListener("pointerup", up, { passive: false });

    root.appendChild(overlay);
    runtime.clickOverlay = overlay;
    return overlay;
  }

  function showWorldThought(scene, text) {
    destroyWorldBubble();

    if (!scene?.player?.active) return;

    if (typeof scene.createSpeechBubble === "function") {
      runtime.worldBubble = scene.createSpeechBubble(
        scene.player.x,
        scene.player.y - 122,
        text,
        0
      ).setDepth(520);

      // Small thought dots convert the normal speech-bubble silhouette into a
      // readable inner-monologue cue without touching the base helper.
      const dots = scene.add.container(
        scene.player.x - 38,
        scene.player.y - 74
      ).setDepth(521);

      dots.add([
        scene.add.circle(0, 0, 5, 0xfff8df, 1)
          .setStrokeStyle(2, 0x403832, 1),
        scene.add.circle(-12, 12, 3, 0xfff8df, 1)
          .setStrokeStyle(2, 0x403832, 1)
      ]);

      runtime.worldBubble.__cashierThoughtDots = dots;

      const oldDestroy = runtime.worldBubble.destroy.bind(runtime.worldBubble);
      runtime.worldBubble.destroy = (...args) => {
        dots?.destroy?.(true);
        return oldDestroy(...args);
      };

      return;
    }

    // Defensive fallback for future scene refactors.
    runtime.worldBubble = scene.add.text(
      scene.player.x,
      scene.player.y - 118,
      text,
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#302924",
        backgroundColor: "#fff8df",
        padding: { x: 12, y: 10 },
        align: "center",
        wordWrap: { width: 285 }
      }
    )
      .setOrigin(0.5)
      .setDepth(520);
  }

  function lockBahnhofThought(scene, locked) {
    if (!scene) return;

    scene.__cashierThoughtActiveV54 = Boolean(locked);
    scene.touchLeft = false;
    scene.touchRight = false;
    scene.touchJumpRequested = false;
    scene.touchShootRequested = false;

    scene.player?.setVelocity?.(0, 0);

    if (locked) {
      scene.setUILocked?.(true);
      scene.uiLocked = true;
      return;
    }

    scene.__cashierThoughtActiveV54 = false;
    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();

    if (!scene.uiLocked) {
      scene.setControlsVisible?.(true);
      scene.ensureTicketMachineInteractive?.();
      scene.ensureLockerInteractive?.();
      scene.ensureTramBoardingInteractive?.();
    }
  }

  function runWorldThoughts(
    scene,
    steps,
    done,
    {
      terrace = false
    } = {}
  ) {
    if (!scene || !steps?.length) {
      done?.();
      return;
    }

    if (terrace) {
      scene.__ethDialogueActive = true;
      scene.player?.setVelocity?.(0, 0);
    } else {
      lockBahnhofThought(scene, true);
    }

    let index = 0;

    const render = () => {
      const text = steps[index];

      if (typeof text !== "string") {
        destroyWorldBubble();
        removeClickOverlay();

        if (terrace) {
          scene.__ethDialogueActive = false;
          scene.setUILocked?.(false);
          scene.refreshUILock?.();
        } else {
          lockBahnhofThought(scene, false);
        }

        done?.();
        return;
      }

      showWorldThought(scene, text);
    };

    createClickCatcher(() => {
      index += 1;
      render();
    });

    render();
  }

  // ---------------------------------------------------------------------------
  // Orell Füssli cashier visual
  // ---------------------------------------------------------------------------

  function createCashierVisual(scene) {
    destroyCashierVisual(scene);

    if (!scene?.bookstoreOverlay) return;

    state.cashierSeen = true;

    const counter = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(704);

    // A compact checkout tucked to the right of the existing shelf wall.
    counter.fillStyle(0x6b4a36, 1);
    counter.fillRoundedRect(646, 250, 164, 103, 8);

    counter.fillStyle(0x8e2228, 1);
    counter.fillRect(638, 244, 180, 17);

    counter.fillStyle(0xd8cec0, 1);
    counter.fillRoundedRect(750, 211, 48, 31, 4);

    counter.fillStyle(0x444a4d, 1);
    counter.fillRect(758, 218, 31, 13);

    counter.lineStyle(2, 0xbca98d, 1);
    counter.strokeRoundedRect(646, 250, 164, 103, 8);

    const cashier = scene.add.container(706, 224)
      .setScrollFactor(0)
      .setDepth(708);

    const body = scene.add.graphics();

    // Legs are mostly hidden by the checkout counter.
    body.fillStyle(0x292d36, 1);
    body.fillRect(-14, 38, 11, 31);
    body.fillRect(3, 38, 11, 31);

    // Dark-red cardigan / Orell-ish neutral work outfit.
    body.fillStyle(0x83323a, 1);
    body.fillRoundedRect(-25, -10, 50, 55, 8);

    body.fillStyle(0xeee5d8, 1);
    body.fillRoundedRect(-9, -7, 18, 42, 4);

    // Hands on the counter.
    body.fillStyle(0xd7a37f, 1);
    body.fillCircle(-28, 29, 5);
    body.fillCircle(28, 29, 5);

    // Face.
    body.fillStyle(0xd8a581, 1);
    body.fillCircle(0, -32, 18);

    // Chestnut shoulder-length hair.
    body.fillStyle(0x51352f, 1);
    body.fillRoundedRect(-21, -54, 42, 30, 12);
    body.fillRect(-21, -42, 8, 32);
    body.fillRect(13, -42, 8, 32);

    // Eyes / small friendly smile.
    body.fillStyle(0x302725, 1);
    body.fillRect(-8, -34, 3, 3);
    body.fillRect(5, -34, 3, 3);

    body.lineStyle(2, 0x8d5353, 1);
    body.lineBetween(-4, -25, 4, -24);

    cashier.add(body);

    const registerLabel = scene.add.text(
      730,
      192,
      "KASSE",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#6f1d24",
        backgroundColor: "#efe7da",
        padding: { x: 5, y: 3 }
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(709);

    const actionLabel = scene.add.text(
      706,
      132,
      state.coffeePlanWritten
        ? "ANSPRECHEN"
        : "",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5.5px",
        color: "#fff0c9",
        backgroundColor: "#7f252c",
        padding: { x: 7, y: 5 }
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(713)
      .setVisible(Boolean(state.coffeePlanWritten));

    const zone = scene.add.zone(
      706,
      205,
      105,
      150
    )
      .setScrollFactor(0)
      .setDepth(714)
      .setInteractive({ useHandCursor: true });

    zone.input.enabled =
      Boolean(state.coffeePlanWritten);

    zone.on("pointerdown", (pointer) => {
      stopEvent(pointer?.event);

      if (
        !state.coffeePlanWritten ||
        scene.bookstoreCatalogModal ||
        scene.__cashierStoreDialogueActiveV54
      ) {
        return;
      }

      if (state.cashierRejected) {
        runStoreDialogue(
          scene,
          [
            { speaker: "cashier", text: "Hoi." },
            { speaker: "simon", text: "Hoi." }
          ]
        );
        return;
      }

      if (!state.cashierAsked) {
        runAskCashier(scene);
      }
    });

    // A very subtle wave on first sight; no timed dialogue and no interruption.
    if (!state.firstExitGreetingSeen) {
      scene.tweens.add({
        targets: cashier,
        angle: { from: -1.5, to: 1.5 },
        duration: 420,
        yoyo: true,
        repeat: 1
      });
    }

    scene.__cashierCounterV54 = counter;
    scene.__cashierV54 = cashier;
    scene.__cashierRegisterLabelV54 = registerLabel;
    scene.__cashierActionLabelV54 = actionLabel;
    scene.__cashierZoneV54 = zone;
  }

  function destroyCashierVisual(scene) {
    if (!scene) return;

    scene.__cashierCounterV54?.destroy?.();
    scene.__cashierV54?.destroy?.(true);
    scene.__cashierRegisterLabelV54?.destroy?.();
    scene.__cashierActionLabelV54?.destroy?.();
    scene.__cashierZoneV54?.destroy?.();

    scene.__cashierCounterV54 = null;
    scene.__cashierV54 = null;
    scene.__cashierRegisterLabelV54 = null;
    scene.__cashierActionLabelV54 = null;
    scene.__cashierZoneV54 = null;
  }

  // ---------------------------------------------------------------------------
  // In-store click dialogue
  // ---------------------------------------------------------------------------

  function runStoreDialogue(scene, steps, done = null) {
    removeStoreDialogue();

    if (!scene || !steps?.length) {
      done?.();
      return;
    }

    const root = rootNode();
    if (!root) {
      done?.();
      return;
    }

    scene.__cashierStoreDialogueActiveV54 = true;

    if (scene.bookstoreBackUI?.overlay) {
      scene.bookstoreBackUI.overlay.style.display = "none";
    }

    if (scene.__cashierZoneV54?.input) {
      scene.__cashierZoneV54.input.enabled = false;
    }

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "cashier-store-dialogue-v54";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "570000",
      pointerEvents: "auto",
      background: "rgba(0,0,0,.08)",
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent"
    });

    const box = document.createElement("div");

    Object.assign(box.style, {
      position: "absolute",
      left: "50%",
      bottom: "18px",
      transform: "translateX(-50%)",
      width: "min(90%, 650px)",
      minHeight: "76px",
      boxSizing: "border-box",
      padding: "11px 14px",
      border: "3px solid #6c5040",
      background: "#fff4dd",
      boxShadow: "5px 5px 0 rgba(0,0,0,.38)",
      color: "#2c2724",
      fontFamily: '"Press Start 2P", monospace',
      lineHeight: "1.7"
    });

    const speaker = document.createElement("div");

    Object.assign(speaker.style, {
      marginBottom: "7px",
      fontSize: "5px",
      color: "#8e2228"
    });

    const text = document.createElement("div");

    Object.assign(text.style, {
      fontSize: "7px",
      textAlign: "left"
    });

    box.append(speaker, text);
    overlay.appendChild(box);
    root.appendChild(overlay);
    runtime.storeDialogue = overlay;

    let index = 0;
    let lastAt = -Infinity;

    const render = () => {
      const step = steps[index];

      if (!step) {
        removeStoreDialogue();
        scene.__cashierStoreDialogueActiveV54 = false;

        if (scene.bookstoreBackUI?.overlay) {
          scene.bookstoreBackUI.overlay.style.display = "";
        }

        if (scene.__cashierZoneV54?.input) {
          scene.__cashierZoneV54.input.enabled =
            Boolean(state.coffeePlanWritten);
        }

        done?.();
        return;
      }

      speaker.textContent =
        step.speaker === "cashier"
          ? "KASSIERERIN"
          : "SIMON";

      text.textContent = step.text;
    };

    const advance = (event) => {
      stopEvent(event);

      const now = performance.now();
      if (now - lastAt < 250) return;

      lastAt = now;
      index += 1;
      render();
    };

    overlay.addEventListener("pointerdown", stopEvent, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });

    render();
  }

  function runAskCashier(scene) {
    if (
      state.cashierAsked ||
      state.cashierRejected ||
      scene.__cashierStoreDialogueActiveV54
    ) {
      return;
    }

    runStoreDialogue(
      scene,
      [
        { speaker: "simon", text: "Hey…" },
        { speaker: "cashier", text: "Hoi." },
        { speaker: "simon", text: "Du wirkst sympathisch." },
        { speaker: "cashier", text: "Danke." },
        {
          speaker: "simon",
          text: "Hättest du mal Lust, mit mir einen Kaffee trinken zu gehen?"
        },
        {
          speaker: "cashier",
          text: "Oh… das ist wirklich lieb."
        },
        {
          speaker: "cashier",
          text: "Aber ich bin schon in einer Beziehung."
        },
        { speaker: "simon", text: "Ah." },
        { speaker: "cashier", text: "Sorry." },
        { speaker: "simon", text: "Alles gut." }
      ],
      () => {
        state.cashierAsked = true;
        state.cashierRejected = true;

        if (scene.__cashierActionLabelV54?.active) {
          scene.__cashierActionLabelV54.setText("ANSPRECHEN");
        }
      }
    );
  }

  // ---------------------------------------------------------------------------
  // First exit: crush thought before the EXISTING milkman encounter
  // ---------------------------------------------------------------------------

  function startFirstCrushThought(scene) {
    if (
      !scene?.sys?.isActive?.() ||
      state.firstCrushThoughtSeen
    ) {
      return;
    }

    runWorldThoughts(
      scene,
      [
        "Wow… die war aber wirklich süss.",
        "Ich hätte irgendwas sagen sollen."
      ],
      () => {
        state.firstCrushThoughtSeen = true;
        scene.__cashierMilkmanDeferredV54 = false;

        // Resume the original story exactly where the base game wanted it.
        if (!scene.milkmanEncounterStarted) {
          scene.__cashierCallOriginalMilkmanV54?.();
        }
      }
    );
  }

  function startInspirationHint(scene) {
    if (
      !scene?.sys?.isActive?.() ||
      state.inspirationHintSeen ||
      state.coffeePlanWritten ||
      state.cashierAsked
    ) {
      return;
    }

    runWorldThoughts(
      scene,
      [
        "Ich sollte mir diesmal wirklich überlegen, wie ich sie anspreche.",
        "Nicht einfach irgendwas.",
        "Ich brauche einen tiefgründigen Gedanken.",
        "Vielleicht brauche ich dafür etwas mehr…",
        "WEITSICHT."
      ],
      () => {
        state.inspirationHintSeen = true;
        state.needsInspiration = true;
      }
    );
  }

  function startPostRejectThought(scene) {
    if (
      !scene?.sys?.isActive?.() ||
      !state.cashierRejected ||
      state.postRejectThoughtSeen
    ) {
      return;
    }

    runWorldThoughts(
      scene,
      [
        "Dafür bin ich extra auf einen Berg gefahren."
      ],
      () => {
        state.postRejectThoughtSeen = true;
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Polyterrasse: context-sensitive NACHDENKEN spot
  // ---------------------------------------------------------------------------

  function terraceQuestActive() {
    return Boolean(
      state.needsInspiration &&
      !state.coffeePlanWritten &&
      !state.cashierAsked
    );
  }

  function destroyViewpoint(scene) {
    if (!scene) return;

    scene.__cashierViewZoneV54?.destroy?.();
    scene.__cashierViewMarkerV54?.destroy?.();
    scene.__cashierViewLabelV54?.destroy?.();

    scene.__cashierViewZoneV54 = null;
    scene.__cashierViewMarkerV54 = null;
    scene.__cashierViewLabelV54 = null;
  }

  function ensureViewpoint(scene) {
    if (
      !scene ||
      scene.sys?.settings?.key !== "PolyterrasseScene"
    ) {
      return;
    }

    if (!terraceQuestActive()) {
      destroyViewpoint(scene);
      return;
    }

    if (scene.__cashierViewZoneV54?.active) {
      return;
    }

    // Middle of the panorama: far from Polybahn at x~164 and ETH door x~1458.
    const x = 690;
    const y = 270;

    const zone = scene.add.zone(
      x,
      y,
      145,
      120
    )
      .setDepth(245)
      .setInteractive({ useHandCursor: true });

    const marker = scene.createPulsingInteractionMarker?.(
      x,
      286,
      176
    );

    const label = scene.add.text(
      x,
      235,
      "NACHDENKEN",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff1cf",
        backgroundColor: "#4b5658",
        padding: { x: 6, y: 4 }
      }
    )
      .setOrigin(0.5)
      .setDepth(246);

    zone.on("pointerdown", (pointer) => {
      stopEvent(pointer?.event);

      if (!terraceQuestActive()) return;
      if (scene.__ethDialogueActive || scene.__ethTransitionActive) return;
      if (!scene.player?.active) return;

      const distance = Math.abs(scene.player.x - x);

      if (distance > 260) {
        return;
      }

      startTerraceThinking(scene);
    });

    scene.__cashierViewZoneV54 = zone;
    scene.__cashierViewMarkerV54 = marker || null;
    scene.__cashierViewLabelV54 = label;
  }

  function startTerraceThinking(scene) {
    if (
      !terraceQuestActive() ||
      scene.__cashierThinkingV54
    ) {
      return;
    }

    scene.__cashierThinkingV54 = true;
    scene.player?.setVelocity?.(0, 0);
    scene.player?.setFlipX?.(false);

    runWorldThoughts(
      scene,
      [
        "Okay.",
        "Nicht einfach irgendwas sagen.",
        "Es sollte ehrlich sein.",
        "Aber nicht oberflächlich.",
        "Selbstbewusst. Aber nicht arrogant.",
        "Persönlich. Aber nicht komisch.",
        "Vielleicht ein bisschen poetisch…",
        "Ich hab’s."
      ],
      () => {
        openScribbleNote(scene);
      },
      { terrace: true }
    );
  }

  function openScribbleNote(scene) {
    removeNote();

    const root = rootNode();
    if (!root) {
      finishCoffeePlan(scene);
      return;
    }

    scene.__ethDialogueActive = true;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "cashier-note-v54";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "575000",
      display: "grid",
      placeItems: "center",
      padding: "18px",
      boxSizing: "border-box",
      background: "rgba(15,18,20,.58)",
      pointerEvents: "auto",
      touchAction: "manipulation"
    });

    const paper = document.createElement("div");

    Object.assign(paper.style, {
      position: "relative",
      width: "min(78%, 430px)",
      padding: "30px 25px 24px",
      boxSizing: "border-box",
      border: "2px solid #b9aa87",
      background:
        "repeating-linear-gradient(180deg,#f5edcf 0,#f5edcf 25px,#d9cda6 26px,#f5edcf 27px)",
      color: "#2e3537",
      boxShadow: "7px 8px 0 rgba(0,0,0,.34)",
      transform: "rotate(-1.4deg)"
    });

    const tape = document.createElement("div");

    Object.assign(tape.style, {
      position: "absolute",
      width: "78px",
      height: "20px",
      left: "50%",
      top: "-10px",
      transform: "translateX(-50%) rotate(2deg)",
      background: "rgba(222,211,172,.78)"
    });

    const heading = document.createElement("div");
    heading.textContent = "PLAN";

    Object.assign(heading.style, {
      marginBottom: "18px",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#77674b"
    });

    const note = document.createElement("div");
    note.textContent =
      "Hey, du wirkst sympathisch.\n\n" +
      "Hättest du mal Lust, mit mir einen Kaffee trinken zu gehen?";

    Object.assign(note.style, {
      whiteSpace: "pre-line",
      fontFamily: '"Comic Sans MS", "Bradley Hand", cursive',
      fontWeight: "700",
      fontSize: "18px",
      lineHeight: "1.35",
      textAlign: "left"
    });

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "WEITER";

    Object.assign(button.style, {
      display: "block",
      margin: "22px auto 0",
      minWidth: "130px",
      minHeight: "39px",
      border: "2px solid #665b46",
      background: "#e0d4ae",
      color: "#39342b",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      cursor: "pointer",
      touchAction: "manipulation"
    });

    button.addEventListener("click", (event) => {
      stopEvent(event);
      removeNote();
      finishCoffeePlan(scene);
    });

    paper.append(tape, heading, note, button);
    overlay.appendChild(paper);
    root.appendChild(overlay);

    runtime.noteModal = overlay;
  }

  function finishCoffeePlan(scene) {
    state.coffeePlanWritten = true;
    state.needsInspiration = false;

    destroyViewpoint(scene);

    runWorldThoughts(
      scene,
      [
        "Perfekt."
      ],
      () => {
        scene.__cashierThinkingV54 = false;
        scene.__ethDialogueActive = false;
        scene.setUILocked?.(false);
        scene.refreshUILock?.();
      },
      { terrace: true }
    );
  }

  // ---------------------------------------------------------------------------
  // Patch Bahnhofquai methods without replacing game.js
  // ---------------------------------------------------------------------------

  function patchBahnhofPrototype() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;

    if (!SceneClass?.prototype) return;

    const proto = SceneClass.prototype;

    // Decorate every Orell overlay.
    if (
      typeof proto.enterBookstore === "function" &&
      !proto.enterBookstore.__cashierV54
    ) {
      const originalEnter = proto.enterBookstore;

      const wrappedEnter = function enterBookstoreCashierV54(...args) {
        const result = originalEnter.apply(this, args);
        createCashierVisual(this);
        return result;
      };

      wrappedEnter.__cashierV54 = true;
      proto.enterBookstore = wrappedEnter;
    }

    // Hold only the first automatic milkman call while Simon is thinking.
    if (
      typeof proto.startMilkmanEncounter === "function" &&
      !proto.startMilkmanEncounter.__cashierV54
    ) {
      const originalMilkman = proto.startMilkmanEncounter;

      const wrappedMilkman = function startMilkmanCashierV54(...args) {
        if (this.__cashierMilkmanDeferredV54) {
          return false;
        }

        return originalMilkman.apply(this, args);
      };

      wrappedMilkman.__cashierV54 = true;
      wrappedMilkman.__cashierOriginal = originalMilkman;
      proto.startMilkmanEncounter = wrappedMilkman;
    }

    // Intercept Orell exit to add first greeting / thoughts, then let the base
    // exit function and its existing milkman scheduling run untouched.
    if (
      typeof proto.exitBookstore === "function" &&
      !proto.exitBookstore.__cashierV54
    ) {
      const originalExit = proto.exitBookstore;

      const wrappedExit = function exitBookstoreCashierV54(...args) {
        if (
          !state.firstExitGreetingSeen &&
          this.bookstoreOverlay &&
          !this.__cashierStoreDialogueActiveV54
        ) {
          runStoreDialogue(
            this,
            [
              { speaker: "cashier", text: "Schöne Abig." },
              { speaker: "simon", text: "Danke, dir au." }
            ],
            () => {
              state.firstExitGreetingSeen = true;
              this.__cashierExitAfterGreetingV54 = true;
              this.exitBookstore(...args);
            }
          );

          return;
        }

        const firstThought =
          !state.firstCrushThoughtSeen;

        const inspirationThought =
          state.firstCrushThoughtSeen &&
          Boolean(this.enriqueSpoken) &&
          !state.inspirationHintSeen &&
          !state.coffeePlanWritten &&
          !state.cashierAsked;

        const rejectionThought =
          state.cashierRejected &&
          !state.postRejectThoughtSeen;

        if (firstThought && !this.milkmanEncounterStarted) {
          this.__cashierMilkmanDeferredV54 = true;
        }

        destroyCashierVisual(this);

        const result = originalExit.apply(this, args);

        // Keep a safe direct handle to the ORIGINAL Milkman method. This is
        // used only after the first thought; the base delayed call can still
        // fire later and harmlessly finds milkmanEncounterStarted=true.
        const milkmanWrapper = proto.startMilkmanEncounter;
        const originalMilkman =
          milkmanWrapper?.__cashierOriginal || null;

        this.__cashierCallOriginalMilkmanV54 = () => {
          if (
            typeof originalMilkman === "function" &&
            !this.milkmanEncounterStarted
          ) {
            originalMilkman.call(this);
          } else {
            this.startMilkmanEncounter?.();
          }
        };

        if (firstThought) {
          this.time?.delayedCall?.(
            70,
            () => startFirstCrushThought(this)
          );
        } else if (inspirationThought) {
          this.time?.delayedCall?.(
            90,
            () => startInspirationHint(this)
          );
        } else if (rejectionThought) {
          this.time?.delayedCall?.(
            90,
            () => startPostRejectThought(this)
          );
        }

        return result;
      };

      wrappedExit.__cashierV54 = true;
      proto.exitBookstore = wrappedExit;
    }

    // Clean our overlay objects if Bahnhof is interrupted by a scene shutdown.
    if (
      typeof proto.create === "function" &&
      !proto.create.__cashierCleanupV54
    ) {
      const originalCreate = proto.create;

      const wrappedCreate = function createCashierCleanupV54(...args) {
        const result = originalCreate.apply(this, args);

        this.events?.once?.("shutdown", () => {
          destroyCashierVisual(this);
          cleanupDialogueUI();
          this.__cashierThoughtActiveV54 = false;
          this.__cashierStoreDialogueActiveV54 = false;
          this.__cashierMilkmanDeferredV54 = false;
        });

        return result;
      };

      wrappedCreate.__cashierCleanupV54 = true;
      proto.create = wrappedCreate;
    }
  }

  // ---------------------------------------------------------------------------
  // Patch the dynamic PolyterrasseScene instance created by ETH v53.
  // ---------------------------------------------------------------------------

  function patchTerrace(game) {
    const scene = getTerrace(game);
    if (!scene || scene.__cashierTerracePatchedV54) return;

    scene.__cashierTerracePatchedV54 = true;

    if (typeof scene.create === "function") {
      const originalCreate = scene.create.bind(scene);

      scene.create = function createCashierViewpointV54(...args) {
        const result = originalCreate(...args);

        ensureViewpoint(this);

        this.events?.once?.("shutdown", () => {
          destroyViewpoint(this);
          destroyWorldBubble();
          removeClickOverlay();
          removeNote();
          this.__cashierThinkingV54 = false;
        });

        return result;
      };
    }

    if (scene.sys?.isActive?.()) {
      ensureViewpoint(scene);
    }
  }

  function install(game) {
    patchBahnhofPrototype();

    if (!game?.scene) return;

    patchTerrace(game);

    const terrace = getTerrace(game);

    if (terrace?.sys?.isActive?.()) {
      ensureViewpoint(terrace);
    }
  }

  // ---------------------------------------------------------------------------
  // Developer helper
  // ---------------------------------------------------------------------------

  function resetState() {
    state.cashierSeen = false;
    state.firstExitGreetingSeen = false;
    state.firstCrushThoughtSeen = false;
    state.needsInspiration = false;
    state.inspirationHintSeen = false;
    state.coffeePlanWritten = false;
    state.cashierAsked = false;
    state.cashierRejected = false;
    state.postRejectThoughtSeen = false;
  }

  function addDeveloperButton() {
    const list = document.querySelector(
      "#developer-menu-screen .dev-destinations"
    );

    if (!list) return;
    if (list.querySelector("[data-dev-target='cashier-test']")) return;

    const button = document.createElement("button");
    button.className = "dev-action dev-destination";
    button.type = "button";
    button.dataset.devTarget = "cashier-test";

    button.innerHTML =
      '9. ORELL / KASSIERERIN' +
      '<small>Startet Bahnhofstrasse für die Kassiererin-Story ab dem ersten Orell-Besuch.</small>';

    button.addEventListener("click", (event) => {
      stopEvent(event);

      resetState();

      window.launchGame?.({
        startMode: "cashier-test"
      });
    });

    list.appendChild(button);
  }

  function prepareCashierDeveloper(game) {
    let attempts = 0;

    const attempt = () => {
      attempts += 1;

      install(game);

      const scene = getBahnhof(game);

      if (
        scene?.sys?.isActive?.() &&
        scene.player?.active &&
        scene.arrivalFinished
      ) {
        scene.developerMode = true;
        scene.coins = 999999;
        scene.updateCoinHUD?.();

        // Orell Füssli sits on the Bahnhofstrasse scene. Put Simon near it,
        // but do not auto-open it: the normal entry/exit flow is part of the test.
        if (scene.bookstoreHitbox?.x) {
          scene.player.setPosition(
            Math.max(80, scene.bookstoreHitbox.x - 180),
            235
          );
        }

        scene.player.setVelocity?.(0, 0);
        scene.cameras.main.startFollow(
          scene.player,
          true,
          0.11,
          0.11
        );

        return;
      }

      if (attempts < 150) {
        window.setTimeout(attempt, 90);
      }
    };

    window.setTimeout(attempt, 260);
  }

  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameCashierV54(options = {}) {
      if (options.startMode === "cashier-test") {
        const game = previousStart.call(
          this,
          {
            ...options,
            startMode: "hb",
            developerMode: true
          }
        );

        if (game) prepareCashierDeveloper(game);
        return game;
      }

      const game = previousStart.call(this, options);

      if (game) install(game);
      return game;
    };
  }

  patchBahnhofPrototype();
  addDeveloperButton();

  const loop = () => {
    const game = getGame();

    if (game) install(game);

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);

  window.SimonCashierV54 = Object.freeze({
    VERSION,
    state,

    reset: resetState,

    install,

    unlockInspiration() {
      state.firstCrushThoughtSeen = true;
      state.inspirationHintSeen = true;
      state.needsInspiration = true;
      state.coffeePlanWritten = false;
      state.cashierAsked = false;
      state.cashierRejected = false;

      const terrace = getTerrace();
      if (terrace?.sys?.isActive?.()) {
        ensureViewpoint(terrace);
      }
    },

    unlockCoffeePlan() {
      state.firstCrushThoughtSeen = true;
      state.inspirationHintSeen = true;
      state.needsInspiration = false;
      state.coffeePlanWritten = true;
      state.cashierAsked = false;
      state.cashierRejected = false;
    },

    status() {
      return { ...state };
    }
  });

  console.info(
    "Orell Kassiererin v54 geladen: Crush → Milchmann → Enrique → Weitsicht → Polyterrasse → Kaffee-Korb."
  );
})();
