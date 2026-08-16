(() => {
  "use strict";

  if (window.__SIMON_FLIRT_SYSTEM_V42__) return;
  window.__SIMON_FLIRT_SYSTEM_V42__ = true;

  const VERSION = 42;
  const WOMAN_ID = "woman_hive_01";

  // ---------------------------------------------------------------------------
  // FLIRT DEFINITIONS
  //
  // The three Playbook moves are real HIMYM Playbook names. Enrique sells
  // these same moves as an alternate acquisition path. The Playbook teaches
  // whatever is still missing when it is read.
  // ---------------------------------------------------------------------------

  const FLIRTS = Object.freeze({
    secondLook: {
      id: "secondLook",
      name: "Der zweite Blick",
      source: "enrique-free",
      lines: [
        { speaker: "simon", text: "Hoi." },
        { speaker: "woman", text: "Hoi?" },
        { speaker: "simon", text: "Ich ha nur nomal müesse luege." },
        { speaker: "woman", text: "Okay... das war smooth." }
      ]
    },

    lorenzoVonMatterhorn: {
      id: "lorenzoVonMatterhorn",
      name: "Lorenzo Von Matterhorn",
      source: "playbook",
      lines: [
        { speaker: "simon", text: "Hoi. Lorenzo Von Matterhorn." },
        { speaker: "woman", text: "Lorenzo... was?" },
        { speaker: "simon", text: "Google mich ruhig." },
        {
          speaker: "woman",
          text: "Okay... du bisch entweder wichtig oder komplett gestört."
        }
      ]
    },

    snasa: {
      id: "snasa",
      name: "SNASA",
      source: "playbook",
      lines: [
        { speaker: "simon", text: "Ich schaffe übrigens bi de SNASA." },
        { speaker: "woman", text: "SNASA?" },
        { speaker: "simon", text: "Secret NASA. Mir flüged uf de Smoon." },
        {
          speaker: "woman",
          text: "Das isch so dumm, dass es wieder guet isch."
        }
      ]
    },

    tedMosby: {
      id: "tedMosby",
      name: "The Ted Mosby",
      source: "playbook",
      lines: [
        { speaker: "simon", text: "Eigentlich sötti hüt heirate." },
        { speaker: "woman", text: "Was?" },
        { speaker: "simon", text: "Sie isch nöd cho." },
        {
          speaker: "woman",
          text: "Oh Gott... okay. Das isch tragisch."
        }
      ]
    }
  });

  const PLAYBOOK_FLIRTS = Object.freeze([
    "lorenzoVonMatterhorn",
    "snasa",
    "tedMosby"
  ]);

  // Enrique explains exactly the same three Playbook moves. This means:
  // - Buy one from Enrique first -> Playbook later only teaches the missing two.
  // - Read Playbook first -> Enrique shows all three as GELERNT.
  // Nothing is duplicated or charged twice.
  const ENRIQUE_FLIRTS = Object.freeze({
    lorenzoVonMatterhorn: {
      flirtId: "lorenzoVonMatterhorn",
      name: "Lorenzo Von Matterhorn",
      price: 100,
      explanation: [
        {
          speaker: "simon",
          text: "Wie funktioniert de Lorenzo Von Matterhorn?"
        },
        {
          speaker: "enrique",
          text: "Du stellsch dich mit eme absurd vornehme Name vor."
        },
        {
          speaker: "enrique",
          text: "Denn sorgsch du defür, dass sie dich googlet."
        },
        {
          speaker: "simon",
          text: "Und was findet sie?"
        },
        {
          speaker: "enrique",
          text: "Nur Artikel drüber, wie reich, berühmt und unglaublich du bisch."
        },
        {
          speaker: "simon",
          text: "Das isch komplett erfunde."
        },
        {
          speaker: "enrique",
          text: "Simon. Das isch de Punkt."
        }
      ]
    },

    snasa: {
      flirtId: "snasa",
      name: "SNASA",
      price: 100,
      explanation: [
        { speaker: "simon", text: "Und SNASA?" },
        { speaker: "enrique", text: "Secret NASA." },
        { speaker: "simon", text: "Secret NASA." },
        {
          speaker: "enrique",
          text: "Genau. Du seisch, du bisch Astronaut gsi."
        },
        {
          speaker: "enrique",
          text: "Aber nöd uf em Mond. Uf em Smoon."
        },
        { speaker: "simon", text: "Secret Moon?" },
        { speaker: "enrique", text: "Jetzt lernsch." }
      ]
    },

    tedMosby: {
      flirtId: "tedMosby",
      name: "The Ted Mosby",
      price: 100,
      explanation: [
        { speaker: "simon", text: "Was isch The Ted Mosby?" },
        {
          speaker: "enrique",
          text: "Du tuesch, als wärsch grad vor em Altar sitze glo worde."
        },
        { speaker: "simon", text: "Das isch ja brutal." },
        { speaker: "enrique", text: "Brutal effektiv." },
        { speaker: "simon", text: "Und wenn sie nachfragt?" },
        {
          speaker: "enrique",
          text: "Denn luegsch traurig und seisch: Es isch kompliziert."
        }
      ]
    }
  });

  const WOMEN = Object.freeze({
    [WOMAN_ID]: {
      id: WOMAN_ID,
      trait: "Selbstbewusst, skeptisch und sehr aufmerksam.",
      observations: [
        "Sie wirkt ziemlich selbstbewusst – und ein bisschen skeptisch.",
        "Sie beobachtet den Raum, als würde ihr kaum etwas entgehen.",
        "Sie scheint Leute ziemlich schnell zu durchschauen.",
        "Sie hat die Ruhe von jemandem, der sich nicht leicht beeindrucken lässt."
      ],

      // For this iteration the user wants every available flirt to work.
      successfulFlirts: Object.keys(FLIRTS),

      successTexts: [
        "Okay... de war guet.",
        "Hmm. Gar nöd schlecht.",
        "Okay, das hani nöd erwartet."
      ]
    }
  });

  // ---------------------------------------------------------------------------
  // STATE + v40 MIGRATION
  //
  // Keep the v40 global key deliberately:
  // acquaintances-v41 already reads enriqueIntroCompleted from this object.
  // ---------------------------------------------------------------------------

  const state = window.__SIMON_FLIRT_STATE_V40__ || {
    learnedFlirts: [],
    enriquePurchased: {},
    enriqueIntroCompleted: false,
    women: {}
  };

  if (!Array.isArray(state.learnedFlirts)) {
    state.learnedFlirts = [];
  }

  if (!state.enriquePurchased || typeof state.enriquePurchased !== "object") {
    state.enriquePurchased = {};
  }

  if (!state.women || typeof state.women !== "object") {
    state.women = {};
  }

  const LEGACY_LEARNED_MAP = Object.freeze({
    coinToss: "lorenzoVonMatterhorn",
    bookworm: "snasa",
    fakeTourist: "tedMosby",
    enrique1: "lorenzoVonMatterhorn",
    enrique2: "snasa",
    enrique3: "tedMosby"
  });

  const migratedLearned = [];

  state.learnedFlirts.forEach((id) => {
    const nextId = LEGACY_LEARNED_MAP[id] || id;
    if (FLIRTS[nextId] && !migratedLearned.includes(nextId)) {
      migratedLearned.push(nextId);
    }
  });

  state.learnedFlirts.splice(
    0,
    state.learnedFlirts.length,
    ...migratedLearned
  );

  // Preserve coins already spent on the old placeholder Enrique entries.
  const oldPurchased = state.enriquePurchased;
  state.enriquePurchased = {
    lorenzoVonMatterhorn: Boolean(
      oldPurchased.lorenzoVonMatterhorn || oldPurchased.enrique1
    ),
    snasa: Boolean(
      oldPurchased.snasa || oldPurchased.enrique2
    ),
    tedMosby: Boolean(
      oldPurchased.tedMosby || oldPurchased.enrique3
    )
  };

  const previousWomanState = state.women[WOMAN_ID] || {};

  state.women[WOMAN_ID] = {
    // Old attempts were different moves (coin toss/bookworm/fake tourist),
    // so do not incorrectly strike through the new HIMYM plays.
    attemptedFlirts: Array.isArray(previousWomanState.attemptedFlirts)
      ? previousWomanState.attemptedFlirts.filter((id) => Boolean(FLIRTS[id]))
      : [],
    flirtAttemptedThisVisit: false
  };

  window.__SIMON_FLIRT_STATE_V40__ = state;
  window.__SIMON_FLIRT_STATE_V42__ = state;

  let sequenceOverlay = null;

  // ---------------------------------------------------------------------------
  // COMMON HELPERS
  // ---------------------------------------------------------------------------

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

  function womanState() {
    return state.women[WOMAN_ID];
  }

  function learned(flirtId) {
    return state.learnedFlirts.includes(flirtId);
  }

  function attachState(scene) {
    if (!scene) return;

    scene.learnedFlirts = state.learnedFlirts;
    scene.ownedFlirts = state.learnedFlirts;
    scene.flirtProgress = state.women;
    scene.enriqueFlirtsPurchased = state.enriquePurchased;
    scene.enriqueIntroCompleted = Boolean(
      state.enriqueIntroCompleted || scene.enriqueSpoken
    );

    if (scene.enriqueSpoken) {
      state.enriqueIntroCompleted = true;
    }
  }

  function markAcquaintance(key) {
    window.SimonAcquaintancesV41?.mark?.(key);
  }

  function showUnlockNotice(scene, title, flirtIds) {
    const names = flirtIds
      .map((id) => FLIRTS[id]?.name)
      .filter(Boolean);

    if (!names.length) return;

    const text = [
      title,
      ...names.map((name) => name.toUpperCase())
    ].join("\n");

    if (typeof scene?.showTopTextNotice === "function") {
      scene.showTopTextNotice(text, {
        duration: 3300,
        key: "flirt-unlock"
      });
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    root.querySelectorAll(
      '[data-simon-ui="flirt-unlock-v42"]'
    ).forEach((node) => node.remove());

    const notice = document.createElement("div");
    notice.dataset.simonUi = "flirt-unlock-v42";
    notice.textContent = text;

    Object.assign(notice.style, {
      position: "absolute",
      left: "50%",
      top: "46px",
      transform: "translateX(-50%)",
      zIndex: "440000",
      maxWidth: "82%",
      padding: "10px 14px",
      border: "3px solid #d7bd78",
      background: "rgba(33,25,20,.96)",
      color: "#fff0c2",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none",
      boxShadow: "0 4px 0 rgba(14,8,5,.72)"
    });

    root.appendChild(notice);
    window.setTimeout(() => notice.remove(), 3300);
  }

  function learnFlirt(scene, flirtId, showNotice = true) {
    if (!FLIRTS[flirtId] || learned(flirtId)) {
      return false;
    }

    state.learnedFlirts.push(flirtId);
    attachState(scene);

    if (showNotice) {
      showUnlockNotice(
        scene,
        "NEUER FLIRT GELERNT",
        [flirtId]
      );
    }

    return true;
  }

  function learnMany(scene, flirtIds, title = "NEUE FLIRTS GELERNT") {
    const fresh = [];

    flirtIds.forEach((flirtId) => {
      if (learnFlirt(scene, flirtId, false)) {
        fresh.push(flirtId);
      }
    });

    if (fresh.length) {
      showUnlockNotice(scene, title, fresh);
    }

    return fresh;
  }

  function clearSequenceOverlay() {
    sequenceOverlay?.remove?.();
    sequenceOverlay = null;
  }

  function createSequenceOverlay(onAdvance, key) {
    clearSequenceOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = key;

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "445000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent"
    });

    let lastAdvance = -Infinity;

    const stop = (event) => {
      event.preventDefault?.();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
    };

    const advance = (event) => {
      stop(event);

      const now = performance.now();
      if (now - lastAdvance < 300) return;

      lastAdvance = now;
      onAdvance?.();
    };

    overlay.addEventListener("pointerdown", stop, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });

    root.appendChild(overlay);
    sequenceOverlay = overlay;
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // PLAYBOOK
  // ---------------------------------------------------------------------------

  function patchPlaybook(scene) {
    if (
      !scene ||
      typeof scene.playBookReadingAnimation !== "function" ||
      scene.playBookReadingAnimation.__flirtV42
    ) {
      return;
    }

    const original = scene.playBookReadingAnimation.bind(scene);

    const wrapped = function playBookReadingAnimationV42(itemKey, ...args) {
      const item = this.getItemDefinition?.(itemKey);
      const isPlaybook = item?.bookKey === "playbook";
      const wasRead = Boolean(this.booksRead?.playbook);

      const result = original(itemKey, ...args);

      if (isPlaybook && !wasRead) {
        const startedAt = Date.now();

        const finishCheck = () => {
          if (!this.sys?.isActive?.()) return;

          if (
            this.readingBook &&
            Date.now() - startedAt < 4200
          ) {
            window.setTimeout(finishCheck, 90);
            return;
          }

          this.booksRead = this.booksRead || {};

          if (!this.booksRead.playbook) {
            this.booksRead.playbook = true;

            learnMany(
              this,
              PLAYBOOK_FLIRTS,
              "NEUE FLIRTS GELERNT"
            );

            this.updateInventoryUI?.();
          }
        };

        window.setTimeout(finishCheck, 1700);
      }

      return result;
    };

    wrapped.__flirtV42 = true;
    scene.playBookReadingAnimation = wrapped;
  }

  function reconcileReadPlaybook(scene) {
    if (!scene?.booksRead?.playbook) return;

    const missing = PLAYBOOK_FLIRTS.filter(
      (flirtId) => !learned(flirtId)
    );

    if (missing.length) {
      learnMany(
        scene,
        missing,
        "NEUE FLIRTS GELERNT"
      );
    }
  }

  // ---------------------------------------------------------------------------
  // HIVE WOMAN
  // ---------------------------------------------------------------------------

  function faceHivePair(hive) {
    if (!hive?.player?.active || !hive?.womanSprite?.active) return;

    // v37 owns the corrected woman orientation. Only make Simon face her.
    hive.player.setFlipX(
      hive.womanSprite.x < hive.player.x
    );
  }

  function runHiveSequence(hive, steps, onFinish = null) {
    if (!hive || !Array.isArray(steps) || !steps.length) return;

    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;

    faceHivePair(hive);

    let index = 0;

    const render = () => {
      const step = steps[index];

      if (!step) {
        clearSequenceOverlay();
        hive.destroySpeechBubble?.();
        hive.stopSimonAction?.();

        if (hive.womanSprite?.active) {
          hive.womanSprite.play?.("woman-v14-idle", true);
        }

        hive.actionLocked = false;
        onFinish?.();
        return;
      }

      hive.destroySpeechBubble?.();

      if (step.speaker === "simon") {
        hive.playSimonAction?.("simon-v14-talk", { loop: true });
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.showSpeechBubble?.(
          hive.player,
          step.text,
          0
        );
      } else {
        hive.stopSimonAction?.();
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.showSpeechBubble?.(
          hive.womanSprite,
          step.text,
          0
        );
      }
    };

    createSequenceOverlay(() => {
      index += 1;
      render();
    }, "hive-sequence-v42");

    render();
  }

  function runNormalWomanConversation(hive) {
    markAcquaintance("womanHive");

    runHiveSequence(
      hive,
      [
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
        { speaker: "woman", text: "Eher nöd…" },
        { speaker: "woman", text: "Du bisch nice." },
        { speaker: "woman", text: "Aber…" },
        { speaker: "woman", text: "nöd sooooo nice" }
      ]
    );
  }

  function observeWoman(hive) {
    const definition = WOMEN[WOMAN_ID];
    if (!hive || !definition) return;

    markAcquaintance("womanHive");

    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;

    const observation = definition.observations[
      Math.floor(Math.random() * definition.observations.length)
    ];

    hive.showSpeechBubble?.(
      hive.player,
      observation,
      0
    );

    // Reuse the existing HIVE bubble, then add the minimal thought-bubble tail.
    if (hive.speechBubble?.active) {
      const thought1 = hive.add.circle(
        -6,
        42,
        6,
        0xfff8df,
        1
      ).setStrokeStyle(2, 0x382d36, 1);

      const thought2 = hive.add.circle(
        -14,
        54,
        3.5,
        0xfff8df,
        1
      ).setStrokeStyle(2, 0x382d36, 1);

      hive.speechBubble.add([thought1, thought2]);
    }

    createSequenceOverlay(() => {
      clearSequenceOverlay();
      hive.destroySpeechBubble?.();
      hive.actionLocked = false;
    }, "observe-woman-v42");
  }

  function styleAttemptedButtons(hive, attemptedFlirts) {
    const names = new Set(
      attemptedFlirts
        .map((id) => FLIRTS[id]?.name?.toUpperCase())
        .filter(Boolean)
    );

    hive.currentModal?.querySelectorAll?.("button").forEach((button) => {
      const label = String(button.textContent || "")
        .trim()
        .toUpperCase();

      if (!names.has(label)) return;

      button.disabled = true;
      button.style.textDecoration = "line-through";
      button.style.opacity = "0.45";
      button.style.color = "#77736d";
      button.style.cursor = "default";
    });
  }

  function showWomanMenu(hive) {
    if (!hive) return;

    markAcquaintance("womanHive");

    const hasFlirts = state.learnedFlirts
      .some((id) => Boolean(FLIRTS[id]));

    hive.openDialog?.(
      "ANSPRECHEN",
      "Was soll Simon machen?",
      [
        {
          label: "BEOBACHTEN",
          action: () => observeWoman(hive)
        },
        {
          label: hasFlirts ? "FLIRTEN" : "FLIRTEN 🔒",
          disabled: !hasFlirts,
          action: () => showFlirtMenu(hive)
        },
        {
          label: "REDEN",
          action: () => runNormalWomanConversation(hive)
        },
        {
          label: "ZURÜCK",
          action: () => hive.closeModal?.()
        }
      ]
    );
  }

  function showFlirtMenu(hive) {
    if (!hive) return;

    const woman = womanState();

    if (woman.flirtAttemptedThisVisit) {
      runHiveSequence(
        hive,
        [
          {
            speaker: "woman",
            text: "Vielleicht später."
          }
        ]
      );
      return;
    }

    const learnedFlirts = state.learnedFlirts
      .filter((id) => Boolean(FLIRTS[id]));

    if (!learnedFlirts.length) {
      hive.openDialog?.(
        "FLIRTEN",
        "Simon kennt no kein Flirt.",
        [
          {
            label: "ZURÜCK",
            action: () => showWomanMenu(hive)
          }
        ]
      );
      return;
    }

    const attempted = new Set(woman.attemptedFlirts);

    const buttons = learnedFlirts.map((flirtId) => ({
      label: FLIRTS[flirtId].name.toUpperCase(),
      disabled: attempted.has(flirtId),
      action: () => startFlirt(hive, flirtId)
    }));

    buttons.push({
      label: "ZURÜCK",
      action: () => showWomanMenu(hive)
    });

    hive.openDialog?.(
      "WÄHLE EINEN FLIRT",
      "Welchen Move probiert Simon?",
      buttons
    );

    styleAttemptedButtons(
      hive,
      woman.attemptedFlirts
    );
  }

  function startFlirt(hive, flirtId) {
    const flirt = FLIRTS[flirtId];
    const womanDefinition = WOMEN[WOMAN_ID];
    const woman = womanState();

    if (!flirt || !learned(flirtId)) return;
    if (woman.flirtAttemptedThisVisit) return;
    if (woman.attemptedFlirts.includes(flirtId)) return;

    woman.attemptedFlirts.push(flirtId);
    woman.flirtAttemptedThisVisit = true;

    // This iteration deliberately has no failure path: every current flirt
    // works on every current woman. The deterministic per-woman list remains,
    // so later women can become selective without another system rewrite.
    const succeeds = womanDefinition.successfulFlirts
      .includes(flirtId);

    const result = womanDefinition.successTexts[
      Math.floor(Math.random() * womanDefinition.successTexts.length)
    ];

    const steps = [
      ...flirt.lines,
      {
        speaker: "woman",
        text: succeeds ? result : "Eher nöd."
      }
    ];

    runHiveSequence(hive, steps, () => {
      if (!succeeds || !hive.womanSprite?.active) return;

      const heart = hive.add.text(
        hive.womanSprite.x,
        hive.womanSprite.y - 118,
        "♥",
        {
          fontFamily: "Georgia, serif",
          fontSize: "24px",
          color: "#e95770"
        }
      )
        .setOrigin(0.5)
        .setDepth(520);

      hive.tweens.add({
        targets: heart,
        y: heart.y - 28,
        scale: 1.35,
        alpha: 0,
        duration: 800,
        onComplete: () => heart.destroy()
      });
    });
  }

  function resetWomanVisit() {
    womanState().flirtAttemptedThisVisit = false;
  }

  function patchHive(hive) {
    if (!hive || hive.__flirtWomanV42Installed) return;
    hive.__flirtWomanV42Installed = true;

    // If the patch is first loaded while Simon is already in HIVE, this visit
    // starts clean as well.
    resetWomanVisit();

    // Reset visit-only state on every actual HIVE entry.
    if (typeof hive.create === "function") {
      const originalCreate = hive.create.bind(hive);

      const wrappedCreate = function createFlirtV42(...args) {
        resetWomanVisit();
        return originalCreate(...args);
      };

      wrappedCreate.__flirtV42 = true;
      hive.create = wrappedCreate;
    }

    if (typeof hive.leaveHive === "function") {
      const originalLeaveHive = hive.leaveHive.bind(hive);

      const wrappedLeaveHive = function leaveHiveFlirtV42(...args) {
        clearSequenceOverlay();
        resetWomanVisit();
        return originalLeaveHive(...args);
      };

      wrappedLeaveHive.__flirtV42 = true;
      hive.leaveHive = wrappedLeaveHive;
    }

    hive.getOwnedFlirts = function getOwnedFlirtsV42() {
      return [...state.learnedFlirts];
    };

    hive.openWomanMenu = function openWomanMenuV42() {
      showWomanMenu(this);
    };

    // acquaintances-v41 runs a RAF patcher after v42. Mark these methods as
    // already acquaintance-aware so it cannot overwrite them again.
    hive.openWomanMenu.__acquaintanceV41 = true;
    hive.openWomanMenu.__flirtV42 = true;

    hive.startRejectedDanceInvite = function startRejectedDanceInviteV42() {
      runNormalWomanConversation(this);
    };

    hive.startRejectedDanceInvite.__acquaintanceV41 = true;
    hive.startRejectedDanceInvite.__flirtV42 = true;
  }

  // ---------------------------------------------------------------------------
  // ENRIQUE
  // ---------------------------------------------------------------------------

  function clearZofingiaBubble(scene) {
    scene?.__flirtV42Bubble?.destroy?.(true);

    if (scene) {
      scene.__flirtV42Bubble = null;
    }
  }

  function showZofingiaBubble(scene, speaker, text) {
    clearZofingiaBubble(scene);

    const actor =
      speaker === "simon"
        ? scene.__sv37ClubSimon
        : scene.__sv37Enrique;

    if (!actor) return;

    const simon = scene.__sv37ClubSimon;

    if (simon?.active) {
      if (speaker === "simon") {
        simon.setScale(0.52);

        if (scene.anims?.exists?.("simon-v14-talk")) {
          simon.play("simon-v14-talk", true);
        }
      } else {
        simon.setScale(0.42);
        simon.play?.("simon-idle", true);
      }
    }

    const x = Phaser.Math.Clamp(actor.x, 140, 680);
    const y = Phaser.Math.Clamp(actor.y - 120, 60, 225);

    let bubble = null;

    if (typeof scene.createSpeechBubble === "function") {
      bubble = scene.createSpeechBubble(
        x,
        y,
        text,
        0
      );

      bubble?.setScrollFactor?.(0);
      bubble?.setDepth?.(1550);
    }

    if (!bubble) {
      bubble = scene.add.text(
        x,
        y,
        text,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "#2a2017",
          backgroundColor: "#fff8df",
          padding: { x: 12, y: 10 },
          wordWrap: { width: 260 },
          align: "center"
        }
      )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1550);
    }

    scene.__flirtV42Bubble = bubble;
  }

  function closeEnriqueModal(scene) {
    const modal = scene?.__sv37EnriqueModal;

    if (modal?.overlay) {
      try {
        scene.destroyDOMModal?.(modal);
      } catch {
        modal.overlay?.remove?.();
      }
    }

    if (scene) {
      scene.__sv37EnriqueModal = null;
    }
  }

  function runEnriqueSequence(scene, steps, onFinish = null) {
    if (!scene || !Array.isArray(steps) || !steps.length) return;

    closeEnriqueModal(scene);

    // v37's movement loop already treats any truthy __sv37EnriqueModal as a
    // movement lock. Reuse that instead of adding another lock system.
    scene.__sv37EnriqueModal = {
      __flirtSequenceV42: true
    };

    let index = 0;

    const render = () => {
      const step = steps[index];

      if (!step) {
        clearSequenceOverlay();
        clearZofingiaBubble(scene);

        if (scene.__sv37ClubSimon?.active) {
          scene.__sv37ClubSimon.setScale(0.42);
          scene.__sv37ClubSimon.play?.("simon-idle", true);
        }

        scene.__sv37EnriqueModal = null;
        onFinish?.();
        return;
      }

      showZofingiaBubble(
        scene,
        step.speaker,
        step.text
      );
    };

    createSequenceOverlay(() => {
      index += 1;
      render();
    }, "enrique-sequence-v42");

    render();
  }

  const ENRIQUE_INTRO = Object.freeze([
    { speaker: "enrique", text: "Simon! Endlich bisch da!" },
    { speaker: "enrique", text: "Ich ha scho denkt, du chunsch gar nüm." },
    { speaker: "simon", text: "Enrique?" },
    { speaker: "enrique", text: "Ja man! Freut mi mega, dich z'gseh." },
    {
      speaker: "enrique",
      text: "Aber Simon... ich muss dir öppis zeige."
    },
    { speaker: "simon", text: "Was?" },
    { speaker: "enrique", text: "De zweite Blick." },
    { speaker: "simon", text: "Was isch de zweite Blick?" },
    {
      speaker: "enrique",
      text: "Ganz eifach. Du laufsch an ere Frau verbii."
    },
    { speaker: "enrique", text: "Du luegsch sie aa." },
    { speaker: "enrique", text: "Du laufsch wiiter." },
    {
      speaker: "enrique",
      text: "Und denn... luegsch nomal zrugg."
    },
    { speaker: "simon", text: "Das isch alles?" },
    { speaker: "enrique", text: "Ja." },
    {
      speaker: "enrique",
      text: "Aber nur EINMAL. Susch wirds creepy."
    }
  ]);

  function startEnriqueIntro(scene) {
    if (!scene || state.enriqueIntroCompleted) return;

    runEnriqueSequence(
      scene,
      ENRIQUE_INTRO,
      () => {
        state.enriqueIntroCompleted = true;
        scene.enriqueIntroCompleted = true;

        // Canonical current story hook: this is what Gandhi/Venedig progression
        // already uses.
        scene.markEnriqueConversationComplete?.();
        scene.enriqueSpoken = true;

        markAcquaintance("enrique");
        learnFlirt(scene, "secondLook");

        // Important: no menu opens automatically. The first meeting ends here.
        // The next click on Enrique opens his normal menu.
      }
    );
  }

  function createEnriqueModal(scene, titleText) {
    closeEnriqueModal(scene);

    const modal = scene.createDOMModal?.({
      key: "enrique-v42",
      width: "min(92%, 570px)",
      background: "#e9dcc1",
      border: "#5e3b28",
      shade: "rgba(10,7,6,.62)",
      padding: "14px"
    });

    if (!modal) return null;

    scene.__sv37EnriqueModal = modal;
    modal.overlay.style.zIndex = "100180";
    modal.panel.dataset.enriqueV42 = "true";

    const top = document.createElement("div");

    Object.assign(top.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      marginBottom: "10px"
    });

    const title = scene.createDOMText?.(
      titleText,
      {
        fontSize: "12px",
        color: "#4a2d21"
      }
    ) || document.createElement("div");

    if (!title.textContent) {
      title.textContent = titleText;
    }

    const wallet = scene.createDOMText?.(
      scene.developerMode
        ? "COINS ∞"
        : `${Math.max(0, Number(scene.coins) || 0)} COINS`,
      {
        fontSize: "7px",
        color: "#5a3d26"
      }
    ) || document.createElement("div");

    if (!wallet.textContent) {
      wallet.textContent =
        `${Math.max(0, Number(scene.coins) || 0)} COINS`;
    }

    top.append(title, wallet);
    modal.panel.appendChild(top);

    return modal;
  }

  function addEnriqueButton(
    scene,
    list,
    label,
    action,
    {
      disabled = false,
      back = false
    } = {}
  ) {
    const button = scene.createDOMButton?.(
      label,
      action,
      {
        color: disabled
          ? "#837e72"
          : back
            ? "#4b3528"
            : "#fff2d5",
        background: disabled
          ? "#2d2a28"
          : back
            ? "#d4c3a3"
            : "#5c4535",
        border: disabled
          ? "#5a554d"
          : back
            ? "#8f7656"
            : "#9c7d59",
        minHeight: "42px",
        fontSize: "6px",
        padding: "7px"
      }
    );

    if (!button) return null;

    if (disabled) {
      button.disabled = true;
      button.style.opacity = "0.55";
      button.style.textDecoration = "line-through";
      button.style.cursor = "default";
    }

    list.appendChild(button);
    return button;
  }

  function openEnriqueMainMenu(scene) {
    if (!scene?.__sv37ZofingiaOpen) return;

    markAcquaintance("enrique");

    const modal = createEnriqueModal(
      scene,
      "ENRIQUE"
    );

    if (!modal) return;

    const list = document.createElement("div");

    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    addEnriqueButton(
      scene,
      list,
      "WO ISCH DE GÉNÉRAL?",
      () => {
        runEnriqueSequence(
          scene,
          [
            {
              speaker: "simon",
              text: "Weisch du, wo de Général isch?"
            },
            {
              speaker: "enrique",
              text: "De Général?"
            },
            {
              speaker: "enrique",
              text: "Ich ha ghört, de isch grad in Venedig."
            }
          ],
          () => openEnriqueMainMenu(scene)
        );
      }
    );

    addEnriqueButton(
      scene,
      list,
      "FRAG NACH EINEM WEITEREN FLIRT",
      () => openEnriqueFlirtShop(scene)
    );

    addEnriqueButton(
      scene,
      list,
      "ZURÜCK",
      () => closeEnriqueModal(scene),
      { back: true }
    );

    modal.panel.appendChild(list);
  }

  function openEnriqueFlirtShop(scene) {
    if (!scene?.__sv37ZofingiaOpen) return;

    const modal = createEnriqueModal(
      scene,
      "WEITEREN FLIRT LERNEN"
    );

    if (!modal) return;

    const hint = scene.createDOMText?.(
      "Enrique erklärt jeden Move für 100 Coins.",
      {
        fontSize: "5.5px",
        color: "#685749",
        margin: "0 0 10px",
        lineHeight: "1.6"
      }
    );

    if (hint) {
      modal.panel.appendChild(hint);
    }

    const list = document.createElement("div");

    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    Object.values(ENRIQUE_FLIRTS).forEach((definition) => {
      const alreadyLearned = learned(
        definition.flirtId
      );

      addEnriqueButton(
        scene,
        list,
        alreadyLearned
          ? `${definition.name.toUpperCase()} · GELERNT`
          : `${definition.name.toUpperCase()} · ${definition.price} COINS`,
        () => buyEnriqueFlirt(
          scene,
          definition
        ),
        {
          disabled: alreadyLearned
        }
      );
    });

    addEnriqueButton(
      scene,
      list,
      "← ZURÜCK",
      () => openEnriqueMainMenu(scene),
      { back: true }
    );

    modal.panel.appendChild(list);
  }

  function buyEnriqueFlirt(scene, definition) {
    if (!scene || !definition) return;
    if (learned(definition.flirtId)) return;

    const coins = Math.max(
      0,
      Number(scene.coins) || 0
    );

    if (
      !scene.developerMode &&
      coins < definition.price
    ) {
      runEnriqueSequence(
        scene,
        [
          {
            speaker: "enrique",
            text: "Simon... 100 Münze."
          },
          {
            speaker: "enrique",
            text: "Ich bin Enrique, nöd Caritas."
          }
        ],
        () => openEnriqueFlirtShop(scene)
      );

      return;
    }

    if (!scene.developerMode) {
      scene.coins = Math.max(
        0,
        coins - definition.price
      );
    }

    scene.updateCoinHUD?.();

    state.enriquePurchased[
      definition.flirtId
    ] = true;

    runEnriqueSequence(
      scene,
      definition.explanation,
      () => {
        learnFlirt(
          scene,
          definition.flirtId
        );

        openEnriqueFlirtShop(scene);
      }
    );
  }

  function handleEnriqueInteraction(scene) {
    if (
      !scene?.__sv37ZofingiaOpen ||
      scene.itemsModal ||
      scene.itemInfoModal ||
      scene.__sv37EnriqueModal
    ) {
      return;
    }

    attachState(scene);
    markAcquaintance("enrique");

    if (
      !state.enriqueIntroCompleted &&
      !scene.enriqueSpoken
    ) {
      startEnriqueIntro(scene);
      return;
    }

    // Current game may already have persisted the canonical story flag from an
    // older patch. Adopt it without replaying the intro.
    if (
      scene.enriqueSpoken &&
      !state.enriqueIntroCompleted
    ) {
      state.enriqueIntroCompleted = true;
      scene.enriqueIntroCompleted = true;

      if (!learned("secondLook")) {
        learnFlirt(scene, "secondLook");
      }
    }

    openEnriqueMainMenu(scene);
  }

  function patchEnriqueHitbox(scene) {
    if (!scene?.__sv37ZofingiaOpen) return;

    const zone = scene.__sv37EnriqueZone;
    const enrique = scene.__sv37Enrique;

    if (
      zone?.active &&
      !zone.__flirtV42Anywhere
    ) {
      zone.removeAllListeners?.("pointerdown");

      zone.on("pointerdown", (pointer) => {
        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();

        // Deliberately NO player-distance check.
        handleEnriqueInteraction(scene);
      });

      zone.__flirtV42Anywhere = true;
    }

    if (
      enrique?.active &&
      !enrique.__flirtV42Anywhere
    ) {
      enrique.removeAllListeners?.("pointerdown");

      enrique.on("pointerdown", (pointer) => {
        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();

        // Deliberately NO player-distance check.
        handleEnriqueInteraction(scene);
      });

      enrique.__flirtV42Anywhere = true;
    }

    if (scene.__sv37EnriquePrompt?.active) {
      scene.__sv37EnriquePrompt
        .setText("KLICK · ANSPRECHEN")
        .setVisible(
          !scene.__sv37EnriqueModal &&
          !scene.itemsModal
        );
    }
  }

  // v37 creates a legacy Enrique modal when E is used near him. If that
  // happens, replace it immediately with v42's canonical flow.
  function absorbLegacyEnriqueModal(scene) {
    const modal = scene?.__sv37EnriqueModal;

    if (
      !modal?.panel ||
      modal.panel.dataset.enriqueV42
    ) {
      return;
    }

    closeEnriqueModal(scene);
    handleEnriqueInteraction(scene);
  }

  // ---------------------------------------------------------------------------
  // INSTALL
  // ---------------------------------------------------------------------------

  function installBaseScene(scene) {
    if (!scene) return;

    attachState(scene);
    patchPlaybook(scene);
    reconcileReadPlaybook(scene);
  }

  function install(game) {
    if (!game?.scene) return;

    const milk = getScene(game, "MilchbuckScene");
    const station = getScene(game, "BahnhofquaiScene");
    const venice = getScene(game, "VeniceScene");
    const hive = getScene(game, "HiveInteriorScene");

    [milk, station, venice]
      .filter(Boolean)
      .forEach(installBaseScene);

    if (hive) {
      patchHive(hive);

      if (hive.overworld) {
        attachState(hive.overworld);
      }
    }

    if (station) {
      attachState(station);
      patchEnriqueHitbox(station);
      absorbLegacyEnriqueModal(station);
    }
  }

  const wrappedStart = window.startSimonGame;

  if (typeof wrappedStart === "function") {
    window.startSimonGame = function startSimonGameFlirtV42(options = {}) {
      const game = wrappedStart.call(this, options);

      if (game) {
        install(game);
      }

      return game;
    };
  }

  const frame = () => {
    const game = getGame();

    if (game) {
      install(game);
    }

    window.requestAnimationFrame(frame);
  };

  window.requestAnimationFrame(frame);

  window.SimonFlirtsV42 = Object.freeze({
    VERSION,
    FLIRTS,
    ENRIQUE_FLIRTS,
    WOMEN,
    state,

    learn(flirtId) {
      const game = getGame();

      const scene =
        getScene(game, "BahnhofquaiScene") ||
        getScene(game, "MilchbuckScene") ||
        getScene(game, "VeniceScene");

      return learnFlirt(
        scene,
        flirtId
      );
    },

    getLearned() {
      return state.learnedFlirts.map(
        (id) => ({
          id,
          name: FLIRTS[id]?.name || id
        })
      );
    },

    getWomanState() {
      return {
        ...WOMEN[WOMAN_ID],
        ...womanState()
      };
    }
  });

  console.info(
    "Flirt-System v42 geladen: HIVE + Playbook + Enrique stabilisiert."
  );
})();