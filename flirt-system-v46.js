(() => {
  "use strict";

  if (window.__SIMON_FLIRT_SYSTEM_V46__) return;
  window.__SIMON_FLIRT_SYSTEM_V46__ = true;

  const VERSION = 46;
  const WOMAN_ID = "woman_hive_01";
  const HOTBAR_SIZE = 5;

  // ===========================================================================
  // ONE CANONICAL FLIRT CATALOG
  // ===========================================================================

  const FLIRTS = Object.freeze({
    // -----------------------------------------------------------------------
    // ENRIQUE — free
    // -----------------------------------------------------------------------
    secondLook: {
      id: "secondLook",
      name: "Der zweite Blick",
      source: "ENRIQUE",
      description:
        "An ihr vorbeigehen, Blickkontakt halten, weiterlaufen – und genau einmal zurückschauen.",
      lines: [
        { speaker: "simon", text: "Hoi." },
        { speaker: "woman", text: "Hoi?" },
        { speaker: "simon", text: "Ich ha nur nomal müesse luege." },
        { speaker: "woman", text: "Okay... de war guet." }
      ]
    },

    // -----------------------------------------------------------------------
    // ENRIQUE — 100 coins each
    // Three HIMYM plays.
    // -----------------------------------------------------------------------
    lorenzoVonMatterhorn: {
      id: "lorenzoVonMatterhorn",
      name: "Lorenzo Von Matterhorn",
      source: "ENRIQUE",
      price: 100,
      description:
        "Simon tritt als absurd bedeutender Lorenzo Von Matterhorn auf und setzt auf eine völlig übertriebene Legende.",
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
      source: "ENRIQUE",
      price: 100,
      description:
        "Simon behauptet, für die geheime Raumfahrtbehörde SNASA zu arbeiten – inklusive Smoon.",
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
      source: "ENRIQUE",
      price: 100,
      description:
        "Simon gibt vor, gerade vor dem Altar sitzengelassen worden zu sein und spielt die tragische Geschichte aus.",
      lines: [
        { speaker: "simon", text: "Eigentlich sötti hüt heirate." },
        { speaker: "woman", text: "Was?" },
        { speaker: "simon", text: "Sie isch nöd cho." },
        {
          speaker: "woman",
          text: "Oh Gott... okay. Das isch tragisch."
        }
      ]
    },

    // -----------------------------------------------------------------------
    // THE PLAYBOOK — three NEW, intentionally invented HIMYM-style plays.
    // They are original game moves, not claimed as TV canon.
    // -----------------------------------------------------------------------
    accidentalPlusOne: {
      id: "accidentalPlusOne",
      name: "The Accidental Plus-One",
      source: "THE PLAYBOOK",
      description:
        "Simon behauptet, seine Begleitung sei gerade abgesprungen und er brauche spontan ein überzeugendes Plus-One.",
      lines: [
        {
          speaker: "simon",
          text: "Du, mini Begleitig isch grad spontan verschwunde."
        },
        { speaker: "woman", text: "Aha?" },
        {
          speaker: "simon",
          text: "Ich han in zehn Minute en Event für zwei. Du gsehsch erstaunlich eventtauglich us."
        },
        {
          speaker: "woman",
          text: "Das isch absurd... aber irgendwie charmant."
        }
      ]
    },

    lostBet: {
      id: "lostBet",
      name: "The Lost Bet",
      source: "THE PLAYBOOK",
      description:
        "Simon behauptet, eine Wette verloren zu haben und deshalb die interessanteste Person im Raum ansprechen zu müssen.",
      lines: [
        { speaker: "simon", text: "Ich han e Wette verlore." },
        { speaker: "woman", text: "Und jetzt?" },
        {
          speaker: "simon",
          text: "Ich muess die interessantischti Person im Raum nach em Name frage."
        },
        { speaker: "woman", text: "Sehr praktisch für dich." }
      ]
    },

    lastSeat: {
      id: "lastSeat",
      name: "The Last Seat",
      source: "THE PLAYBOOK",
      description:
        "Simon macht aus einem angeblich letzten freien Platz einen bewusst viel zu perfekten Gesprächseinstieg.",
      lines: [
        { speaker: "simon", text: "Isch da no frei?" },
        { speaker: "woman", text: "Ja." },
        {
          speaker: "simon",
          text: "Perfekt. Ich ha nämlich genau dä Platz gsuecht."
        },
        { speaker: "woman", text: "Natürlich hesch." }
      ]
    }
  });

  const PLAYBOOK_FLIRTS = Object.freeze([
    "accidentalPlusOne",
    "lostBet",
    "lastSeat"
  ]);

  const ENRIQUE_PAID = Object.freeze({
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
          text: "Denn tuesch, als wärsch du unfassbar berühmt."
        },
        { speaker: "simon", text: "Aber ich bin nöd berühmt." },
        { speaker: "enrique", text: "Lorenzo scho." },
        {
          speaker: "enrique",
          text: "Wichtig: so überzeugt sii, dass du fascht selber glaubsch."
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

  const WOMAN = Object.freeze({
    id: WOMAN_ID,
    trait: "Selbstbewusst, skeptisch und sehr aufmerksam.",
    observations: [
      "Sie wirkt ziemlich selbstbewusst – und ein bisschen skeptisch.",
      "Sie beobachtet den Raum, als würde ihr kaum etwas entgehen.",
      "Sie scheint Leute ziemlich schnell zu durchschauen.",
      "Sie hat die Ruhe von jemandem, der sich nicht leicht beeindrucken lässt."
    ]
  });

  // ===========================================================================
  // STATE
  // Keep the old key as compatibility for acquaintances-v41.
  // ===========================================================================

  const state =
    window.__SIMON_FLIRT_STATE_V46__ ||
    window.__SIMON_FLIRT_STATE_V40__ || {
      learnedFlirts: [],
      enriquePurchased: {},
      enriqueIntroCompleted: false,
      women: {}
    };

  if (!Array.isArray(state.learnedFlirts)) state.learnedFlirts = [];
  if (!state.enriquePurchased || typeof state.enriquePurchased !== "object") {
    state.enriquePurchased = {};
  }
  if (!state.women || typeof state.women !== "object") state.women = {};

  const previousWoman = state.women[WOMAN_ID] || {};

  state.women[WOMAN_ID] = {
    attemptedFlirts: Array.isArray(previousWoman.attemptedFlirts)
      ? previousWoman.attemptedFlirts.filter((id) => Boolean(FLIRTS[id]))
      : [],
    flirtAttemptedThisVisit: Boolean(previousWoman.flirtAttemptedThisVisit)
  };

  // Migration from v45 if v46 is hot-loaded without a full refresh.
  // v45 Enrique sold fakeTourist/coinToss/bookworm. Preserve their value by
  // mapping them onto the three new Enrique HIMYM purchases.
  const oldPurchased = { ...state.enriquePurchased };

  state.enriquePurchased = {
    lorenzoVonMatterhorn: Boolean(
      oldPurchased.lorenzoVonMatterhorn || oldPurchased.fakeTourist
    ),
    snasa: Boolean(
      oldPurchased.snasa || oldPurchased.coinToss
    ),
    tedMosby: Boolean(
      oldPurchased.tedMosby || oldPurchased.bookworm
    )
  };

  const migration = {
    fakeTourist: "lorenzoVonMatterhorn",
    coinToss: "snasa",
    bookworm: "tedMosby"
  };

  const migrated = [];

  for (const id of state.learnedFlirts) {
    const next = migration[id] || id;
    if (FLIRTS[next] && !migrated.includes(next)) migrated.push(next);
  }

  state.learnedFlirts.splice(0, state.learnedFlirts.length, ...migrated);

  window.__SIMON_FLIRT_STATE_V40__ = state;
  window.__SIMON_FLIRT_STATE_V46__ = state;

  let sequenceOverlay = null;
  let indoorHotbarRoot = null;
  let indoorHotbarSignature = "";

  // ===========================================================================
  // COMMON HELPERS
  // ===========================================================================

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

  function learned(id) {
    return state.learnedFlirts.includes(id);
  }

  function womanState() {
    return state.women[WOMAN_ID];
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

  function removeOne(array, value) {
    const index = array.indexOf(value);
    if (index >= 0) array.splice(index, 1);
  }

  function showNotice(scene, title, lines, duration = 3300) {
    const text = [title, ...lines].join("\n");

    // Use the game's own top-notice when its scene is actually running.
    if (
      typeof scene?.showTopTextNotice === "function" &&
      !scene.sys?.isPaused?.()
    ) {
      scene.showTopTextNotice(text, {
        duration,
        key: "v46-notice"
      });
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    root.querySelectorAll('[data-simon-ui="v46-notice"]').forEach((n) => n.remove());

    const node = document.createElement("div");
    node.dataset.simonUi = "v46-notice";
    node.textContent = text;

    Object.assign(node.style, {
      position: "absolute",
      left: "50%",
      top: "44px",
      transform: "translateX(-50%)",
      zIndex: "470000",
      maxWidth: "84%",
      padding: "10px 14px",
      border: "3px solid #d7bd78",
      background: "rgba(33,25,20,.96)",
      color: "#fff0c2",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      lineHeight: "1.65",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none",
      boxShadow: "0 4px 0 rgba(14,8,5,.72)"
    });

    root.appendChild(node);
    window.setTimeout(() => node.remove(), duration);
  }

  function learnFlirt(scene, id, { notice = true } = {}) {
    if (!FLIRTS[id] || learned(id)) return false;

    state.learnedFlirts.push(id);
    attachState(scene);

    if (notice) {
      showNotice(
        scene,
        "NEUER FLIRT GELERNT",
        [FLIRTS[id].name.toUpperCase()]
      );
    }

    return true;
  }

  function learnMany(scene, ids, title = "NEUE FLIRTS GELERNT") {
    const fresh = [];

    ids.forEach((id) => {
      if (learnFlirt(scene, id, { notice: false })) fresh.push(id);
    });

    if (fresh.length) {
      showNotice(
        scene,
        title,
        fresh.map((id) => FLIRTS[id].name.toUpperCase())
      );
    }

    return fresh;
  }

  function clearSequenceOverlay() {
    sequenceOverlay?.remove?.();
    sequenceOverlay = null;
  }

  function clearLegacySequenceOverlays() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    [
      "enrique-sequence-v40",
      "enrique-sequence-v42",
      "enrique-v45-sequence",
      "enrique-v46-sequence",
      "flirt-sequence-v40",
      "hive-flirt-sequence-v40",
      "hive-sequence-v42",
      "hive-flirt-v45"
    ].forEach((value) => {
      root
        .querySelectorAll(`[data-simon-ui="${value}"]`)
        .forEach((node) => node.remove());
    });
  }

  function makeSequenceOverlay(onAdvance, key) {
    clearSequenceOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const node = document.createElement("div");
    node.dataset.simonUi = key;

    Object.assign(node.style, {
      position: "absolute",
      inset: "0",
      zIndex: "471000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent"
    });

    let last = -Infinity;

    const stop = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
    };

    const advance = (event) => {
      stop(event);

      const now = performance.now();
      if (now - last < 300) return;

      last = now;
      onAdvance?.();
    };

    node.addEventListener("pointerdown", stop, { passive: false });
    node.addEventListener("pointerup", advance, { passive: false });
    node.addEventListener("click", advance, { passive: false });

    root.appendChild(node);
    sequenceOverlay = node;
    return node;
  }

  // ===========================================================================
  // PLAYBOOK — ONLY the three new game-original HIMYM-style plays
  // ===========================================================================

  function patchPlaybook(scene) {
    if (
      !scene ||
      typeof scene.playBookReadingAnimation !== "function" ||
      scene.playBookReadingAnimation.__flirtV46
    ) {
      return;
    }

    const original = scene.playBookReadingAnimation.bind(scene);

    const wrapped = function playBookReadingAnimationV46(itemKey, ...args) {
      const item = this.getItemDefinition?.(itemKey);
      const isPlaybook = item?.bookKey === "playbook";
      const wasRead = Boolean(this.booksRead?.playbook);

      const result = original(itemKey, ...args);

      if (isPlaybook && !wasRead) {
        const startedAt = Date.now();

        const finish = () => {
          if (!this.sys?.isActive?.()) return;

          if (this.readingBook && Date.now() - startedAt < 5000) {
            window.setTimeout(finish, 90);
            return;
          }

          this.booksRead = this.booksRead || {};

          if (!this.booksRead.playbook) {
            this.booksRead.playbook = true;
          }

          learnMany(
            this,
            PLAYBOOK_FLIRTS,
            "NEUE FLIRTS GELERNT"
          );

          this.updateInventoryUI?.();
        };

        window.setTimeout(finish, 1700);
      }

      return result;
    };

    wrapped.__flirtV46 = true;
    scene.playBookReadingAnimation = wrapped;
  }

  function reconcilePlaybook(scene) {
    if (!scene?.booksRead?.playbook) return;

    const missing = PLAYBOOK_FLIRTS.filter((id) => !learned(id));
    if (!missing.length) return;

    // If a running page previously used v45, Lorenzo/SNASA/Ted may have been
    // granted by the old Playbook design. Remove only those not actually bought
    // from Enrique before granting the new Playbook set.
    ["lorenzoVonMatterhorn", "snasa", "tedMosby"].forEach((id) => {
      if (!state.enriquePurchased[id]) removeOne(state.learnedFlirts, id);
    });

    learnMany(scene, missing, "NEUE FLIRTS GELERNT");
  }

  // ===========================================================================
  // WOMAN — first-ever click talks; later clicks show OBSERVE / FLIRT / BACK
  // ===========================================================================

  function firstWomanConversationDone() {
    return Boolean(
      window.__SIMON_WOMAN_CONVERSATION_STATE_V43__
        ?.completedFirstConversation
    );
  }

  function markWomanConversationDone() {
    if (!window.__SIMON_WOMAN_CONVERSATION_STATE_V43__) {
      window.__SIMON_WOMAN_CONVERSATION_STATE_V43__ = {
        completedFirstConversation: true
      };
      return;
    }

    window.__SIMON_WOMAN_CONVERSATION_STATE_V43__
      .completedFirstConversation = true;
  }

  function faceHivePair(hive) {
    if (!hive?.player?.active || !hive?.womanSprite?.active) return;
    hive.player.setFlipX(hive.womanSprite.x < hive.player.x);
  }

  function runHiveSequence(hive, steps, done = null) {
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
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.actionLocked = false;
        done?.();
        return;
      }

      hive.destroySpeechBubble?.();

      if (step.speaker === "simon") {
        hive.playSimonAction?.("simon-v14-talk", { loop: true });
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.showSpeechBubble?.(hive.player, step.text, 0);
      } else {
        hive.stopSimonAction?.();
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.showSpeechBubble?.(hive.womanSprite, step.text, 0);
      }
    };

    makeSequenceOverlay(() => {
      index += 1;
      render();
    }, "hive-sequence-v46");

    render();
  }

  function runFallbackFirstWomanConversation(hive) {
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
        { speaker: "woman", text: "Du bisch zwar nice..." },
        { speaker: "woman", text: "aber..." },
        { speaker: "woman", text: "nöd soooo nice." }
      ],
      markWomanConversationDone
    );
  }

  function observeWoman(hive) {
    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;

    const text = WOMAN.observations[
      Math.floor(Math.random() * WOMAN.observations.length)
    ];

    hive.showSpeechBubble?.(hive.player, text, 0);

    if (hive.speechBubble?.active) {
      const c1 = hive.add.circle(-6, 42, 6, 0xfff8df, 1)
        .setStrokeStyle(2, 0x382d36, 1);

      const c2 = hive.add.circle(-14, 54, 3.5, 0xfff8df, 1)
        .setStrokeStyle(2, 0x382d36, 1);

      hive.speechBubble.add([c1, c2]);
    }

    makeSequenceOverlay(() => {
      clearSequenceOverlay();
      hive.destroySpeechBubble?.();
      hive.actionLocked = false;
    }, "woman-observe-v46");
  }

  function showWomanMenu(hive) {
    const available = state.learnedFlirts.filter((id) => Boolean(FLIRTS[id]));

    hive.openDialog?.(
      "ANSPRECHEN",
      "Was soll Simon machen?",
      [
        {
          label: "BEOBACHTEN",
          action: () => observeWoman(hive)
        },
        {
          label: available.length ? "FLIRTEN" : "FLIRTEN 🔒",
          disabled: available.length === 0,
          action: () => showFlirtMenu(hive)
        },
        {
          label: "ZURÜCK",
          action: () => hive.closeModal?.()
        }
      ]
    );
  }

  function showFlirtMenu(hive) {
    const progress = womanState();

    if (progress.flirtAttemptedThisVisit) {
      runHiveSequence(
        hive,
        [{ speaker: "woman", text: "Vielleicht später." }]
      );
      return;
    }

    const ids = state.learnedFlirts.filter((id) => Boolean(FLIRTS[id]));

    if (!ids.length) {
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

    const attempted = new Set(progress.attemptedFlirts);

    const buttons = ids.map((id) => ({
      label: FLIRTS[id].name.toUpperCase(),
      disabled: attempted.has(id),
      action: () => applyFlirt(hive, id)
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

    const attemptedNames = new Set(
      progress.attemptedFlirts
        .map((id) => FLIRTS[id]?.name?.toUpperCase())
        .filter(Boolean)
    );

    hive.currentModal
      ?.querySelectorAll?.("button")
      .forEach((button) => {
        const label = String(button.textContent || "").trim().toUpperCase();

        if (!attemptedNames.has(label)) return;

        button.disabled = true;
        button.style.textDecoration = "line-through";
        button.style.opacity = "0.45";
        button.style.color = "#77736d";
      });
  }

  function applyFlirt(hive, id) {
    const flirt = FLIRTS[id];
    const progress = womanState();

    if (!flirt || !learned(id)) return;
    if (progress.flirtAttemptedThisVisit) return;
    if (progress.attemptedFlirts.includes(id)) return;

    progress.attemptedFlirts.push(id);
    progress.flirtAttemptedThisVisit = true;

    // For now: every flirt succeeds with every woman.
    runHiveSequence(
      hive,
      flirt.lines,
      () => {
        if (!hive.womanSprite?.active) return;

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
          scale: 1.3,
          alpha: 0,
          duration: 800,
          onComplete: () => heart.destroy()
        });
      }
    );
  }

  function canonicalOpenWomanMenu() {
    window.SimonAcquaintancesV41?.mark?.("womanHive");

    if (!firstWomanConversationDone()) {
      const v43Talk = this.startRejectedDanceInvite;

      if (
        typeof v43Talk === "function" &&
        v43Talk.__womanConversationV43
      ) {
        v43Talk.call(this);
      } else {
        runFallbackFirstWomanConversation(this);
      }

      return;
    }

    showWomanMenu(this);
  }

  canonicalOpenWomanMenu.__acquaintanceV41 = true;
  canonicalOpenWomanMenu.__womanConversationV43 = true;
  canonicalOpenWomanMenu.__flirtV46 = true;

  function enforceWomanSystem(hive) {
    if (!hive) return;

    // Continuous assignment is intentional. hive-language-patch-v19 installs
    // asynchronously and can otherwise overwrite the newer menu after startup.
    if (hive.openWomanMenu !== canonicalOpenWomanMenu) {
      hive.openWomanMenu = canonicalOpenWomanMenu;
    }

    hive.getOwnedFlirts = function getOwnedFlirtsV46() {
      return [...state.learnedFlirts];
    };

    if (!hive.__flirtVisitV46Installed) {
      hive.__flirtVisitV46Installed = true;

      if (typeof hive.create === "function") {
        const originalCreate = hive.create.bind(hive);

        const createWrapped = function createFlirtVisitV46(...args) {
          womanState().flirtAttemptedThisVisit = false;
          return originalCreate(...args);
        };

        createWrapped.__flirtVisitV46 = true;
        hive.create = createWrapped;
      }

      if (typeof hive.leaveHive === "function") {
        const originalLeave = hive.leaveHive.bind(hive);

        const leaveWrapped = function leaveHiveFlirtVisitV46(...args) {
          clearSequenceOverlay();
          womanState().flirtAttemptedThisVisit = false;
          return originalLeave(...args);
        };

        leaveWrapped.__flirtVisitV46 = true;
        hive.leaveHive = leaveWrapped;
      }
    }
  }

  // ===========================================================================
  // ENRIQUE — complete canonical implementation, no v42 dependency
  // ===========================================================================

  function clearZofingiaBubble(scene) {
    scene?.__flirtV46Bubble?.destroy?.(true);
    if (scene) scene.__flirtV46Bubble = null;
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
      bubble = scene.createSpeechBubble(x, y, text, 0);
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

    scene.__flirtV46Bubble = bubble;
  }

  function closeEnriqueModal(scene) {
    clearSequenceOverlay();
    clearLegacySequenceOverlays();

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

  function recoverEnriqueInput(scene) {
    clearSequenceOverlay();
    clearLegacySequenceOverlays();
    clearZofingiaBubble(scene);

    if (scene?.__sv37ClubSimon?.active) {
      scene.__sv37ClubSimon.setScale(0.42);
      scene.__sv37ClubSimon.play?.("simon-idle", true);
    }

    if (
      scene?.__sv37EnriqueModal &&
      !scene.__sv37EnriqueModal.overlay
    ) {
      scene.__sv37EnriqueModal = null;
    }
  }

  function runEnriqueSequence(scene, steps, done = null) {
    if (!scene || !Array.isArray(steps) || !steps.length) return;

    closeEnriqueModal(scene);

    const sentinel = { __flirtSequenceV46: true };
    scene.__sv37EnriqueModal = sentinel;

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

        if (scene.__sv37EnriqueModal === sentinel) {
          scene.__sv37EnriqueModal = null;
        }

        done?.();

        // Final safety pass after the callback has opened/closed its next menu.
        window.setTimeout(() => {
          if (
            scene.__sv37EnriqueModal === sentinel
          ) {
            scene.__sv37EnriqueModal = null;
          }
          clearLegacySequenceOverlays();
        }, 0);

        return;
      }

      showZofingiaBubble(scene, step.speaker, step.text);
    };

    makeSequenceOverlay(() => {
      index += 1;
      render();
    }, "enrique-v46-sequence");

    render();
  }

  const ENRIQUE_INTRO = Object.freeze([
    { speaker: "enrique", text: "Simon! Endlich bisch da!" },
    { speaker: "enrique", text: "Ich ha scho denkt, du chunsch gar nüm." },
    { speaker: "simon", text: "Enrique?" },
    { speaker: "enrique", text: "Ja man! Freut mi mega, dich z'gseh." },
    { speaker: "enrique", text: "Aber Simon... ich muss dir öppis zeige." },
    { speaker: "simon", text: "Was?" },
    { speaker: "enrique", text: "De zweite Blick." },
    { speaker: "simon", text: "Was isch de zweite Blick?" },
    {
      speaker: "enrique",
      text: "Ganz eifach. Du laufsch an ere Frau verbii."
    },
    { speaker: "enrique", text: "Du luegsch sie aa." },
    { speaker: "enrique", text: "Du laufsch wiiter." },
    { speaker: "enrique", text: "Und denn... luegsch nomal zrugg." },
    { speaker: "simon", text: "Das isch alles?" },
    { speaker: "enrique", text: "Ja." },
    {
      speaker: "enrique",
      text: "Aber nur EINMAL. Susch wirds creepy."
    }
  ]);

  function startEnriqueIntro(scene) {
    runEnriqueSequence(
      scene,
      ENRIQUE_INTRO,
      () => {
        state.enriqueIntroCompleted = true;
        scene.enriqueIntroCompleted = true;

        scene.markEnriqueConversationComplete?.();
        scene.enriqueSpoken = true;

        window.SimonAcquaintancesV41?.mark?.("enrique");
        learnFlirt(scene, "secondLook");

        // The first meeting ends here. Next click opens the normal menu.
        recoverEnriqueInput(scene);
      }
    );
  }

  function makeEnriqueModal(scene, titleText) {
    closeEnriqueModal(scene);

    const modal = scene.createDOMModal?.({
      key: "enrique-v46",
      width: "min(92%,570px)",
      background: "#e9dcc1",
      border: "#5e3b28",
      shade: "rgba(10,7,6,.62)",
      padding: "14px"
    });

    if (!modal) return null;

    scene.__sv37EnriqueModal = modal;
    modal.panel.dataset.enriqueV46 = "true";
    modal.overlay.style.zIndex = "100180";

    const top = document.createElement("div");

    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      marginBottom: "10px"
    });

    const title =
      scene.createDOMText?.(
        titleText,
        { fontSize: "12px", color: "#4a2d21" }
      ) || document.createElement("div");

    if (!title.textContent) title.textContent = titleText;

    const wallet =
      scene.createDOMText?.(
        scene.developerMode
          ? "COINS ∞"
          : `${Number(scene.coins) || 0} COINS`,
        { fontSize: "7px", color: "#5a3d26" }
      ) || document.createElement("div");

    if (!wallet.textContent) {
      wallet.textContent = `${Number(scene.coins) || 0} COINS`;
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
    { disabled = false, back = false } = {}
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

    recoverEnriqueInput(scene);

    const modal = makeEnriqueModal(scene, "ENRIQUE");
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
      () => openEnriqueShop(scene)
    );

    addEnriqueButton(
      scene,
      list,
      "ZURÜCK",
      () => {
        closeEnriqueModal(scene);
        recoverEnriqueInput(scene);
      },
      { back: true }
    );

    modal.panel.appendChild(list);
  }

  function allEnriqueFlirtsLearned() {
    return Object.keys(ENRIQUE_PAID).every((id) => learned(id));
  }

  function openEnriqueShop(scene) {
    if (!scene?.__sv37ZofingiaOpen) return;

    recoverEnriqueInput(scene);

    const modal = makeEnriqueModal(scene, "WEITEREN FLIRT LERNEN");
    if (!modal) return;

    const hint = scene.createDOMText?.(
      "Jeder Move kostet 100 Coins.",
      {
        fontSize: "5.5px",
        color: "#685749",
        margin: "0 0 10px",
        lineHeight: "1.6"
      }
    );

    if (hint) modal.panel.appendChild(hint);

    const list = document.createElement("div");

    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    Object.values(ENRIQUE_PAID).forEach((definition) => {
      const done = learned(definition.flirtId);

      addEnriqueButton(
        scene,
        list,
        done
          ? `${definition.name.toUpperCase()} · GELERNT`
          : `${definition.name.toUpperCase()} · ${definition.price} COINS`,
        () => buyEnriqueFlirt(scene, definition),
        { disabled: done }
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
    if (!scene || !definition || learned(definition.flirtId)) return;

    const coins = Number(scene.coins) || 0;

    if (!scene.developerMode && coins < definition.price) {
      runEnriqueSequence(
        scene,
        [
          { speaker: "enrique", text: "Simon... 100 Münze." },
          { speaker: "enrique", text: "Ich bin Enrique, nöd Caritas." }
        ],
        () => openEnriqueShop(scene)
      );
      return;
    }

    if (!scene.developerMode) {
      scene.coins = coins - definition.price;
    }

    scene.updateCoinHUD?.();
    state.enriquePurchased[definition.flirtId] = true;

    runEnriqueSequence(
      scene,
      definition.explanation,
      () => {
        learnFlirt(scene, definition.flirtId);

        // This specifically avoids the "all bought -> dead modal" bug.
        if (allEnriqueFlirtsLearned()) {
          openEnriqueMainMenu(scene);
        } else {
          openEnriqueShop(scene);
        }
      }
    );
  }

  function handleEnriqueInteraction(scene) {
    if (
      !scene?.__sv37ZofingiaOpen ||
      scene.itemsModal ||
      scene.itemInfoModal ||
      scene.__sv46IndoorItemBusy ||
      scene.__sv37EnriqueModal
    ) {
      return;
    }

    attachState(scene);
    window.SimonAcquaintancesV41?.mark?.("enrique");

    if (!state.enriqueIntroCompleted && !scene.enriqueSpoken) {
      startEnriqueIntro(scene);
      return;
    }

    if (scene.enriqueSpoken && !state.enriqueIntroCompleted) {
      state.enriqueIntroCompleted = true;
      scene.enriqueIntroCompleted = true;

      if (!learned("secondLook")) {
        learnFlirt(scene, "secondLook");
      }
    }

    openEnriqueMainMenu(scene);
  }

  function enforceEnriqueInteraction(scene) {
    if (!scene?.__sv37ZofingiaOpen) return;

    const zone = scene.__sv37EnriqueZone;
    const npc = scene.__sv37Enrique;

    if (zone?.active && !zone.__flirtV46Anywhere) {
      zone.removeAllListeners?.("pointerdown");

      zone.on("pointerdown", (pointer) => {
        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();
        handleEnriqueInteraction(scene);
      });

      zone.__flirtV46Anywhere = true;
    }

    if (npc?.active && !npc.__flirtV46Anywhere) {
      npc.removeAllListeners?.("pointerdown");

      npc.on("pointerdown", (pointer) => {
        pointer?.event?.preventDefault?.();
        pointer?.event?.stopPropagation?.();
        handleEnriqueInteraction(scene);
      });

      npc.__flirtV46Anywhere = true;
    }

    if (scene.__sv37EnriquePrompt?.active) {
      scene.__sv37EnriquePrompt
        .setText("KLICK · ANSPRECHEN")
        .setVisible(
          !scene.__sv37EnriqueModal &&
          !scene.itemsModal &&
          !scene.__sv46IndoorItemBusy
        );
    }

    // Stale lock repair.
    const modal = scene.__sv37EnriqueModal;

    if (modal?.overlay && !document.documentElement.contains(modal.overlay)) {
      scene.__sv37EnriqueModal = null;
    }

    if (
      modal?.__flirtSequenceV46 &&
      !document.querySelector('[data-simon-ui="enrique-v46-sequence"]')
    ) {
      scene.__sv37EnriqueModal = null;
    }
  }

  // ===========================================================================
  // INVENTORY — FLIRTS TAB
  // ===========================================================================

  function renderFlirtsTab(scene) {
    const content =
      scene.itemsModalContent ||
      scene.itemsModal?.panel?.querySelector?.(
        "[data-items-content='true']"
      );

    if (!content) return;

    content.replaceChildren();

    const ids = state.learnedFlirts.filter((id) => Boolean(FLIRTS[id]));

    if (!ids.length) {
      content.appendChild(
        scene.createDOMText?.(
          "NOCH KEINE FLIRTS GELERNT",
          {
            fontSize: "7px",
            color: "#b8bec4",
            margin: "18px 0"
          }
        ) || document.createTextNode("NOCH KEINE FLIRTS GELERNT")
      );
      return;
    }

    const grid = document.createElement("div");

    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: "8px",
      width: "100%"
    });

    ids.forEach((id) => {
      const flirt = FLIRTS[id];
      const card = document.createElement("div");

      Object.assign(card.style, {
        minHeight: "98px",
        padding: "9px",
        border: "2px solid #d58eb8",
        borderRadius: "8px",
        background: "linear-gradient(135deg,#3b2132,#17191f)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        textAlign: "left"
      });

      const source =
        scene.createDOMText?.(
          flirt.source,
          { fontSize: "4.7px", color: "#e88eb8" }
        ) || document.createElement("div");

      const name =
        scene.createDOMText?.(
          flirt.name.toUpperCase(),
          { fontSize: "6.5px", color: "#fff0f6" }
        ) || document.createElement("div");

      const description =
        scene.createDOMText?.(
          flirt.description,
          {
            fontSize: "5px",
            color: "#d7cbd2",
            lineHeight: "1.65"
          }
        ) || document.createElement("div");

      if (!source.textContent) source.textContent = flirt.source;
      if (!name.textContent) name.textContent = flirt.name.toUpperCase();
      if (!description.textContent) description.textContent = flirt.description;

      card.append(source, name, description);
      grid.appendChild(card);
    });

    content.appendChild(grid);
  }

  function ensureFlirtsTab(scene) {
    const panel = scene.itemsModal?.panel;
    if (!panel) return;

    if (panel.querySelector("[data-items-tab='flirts']")) return;

    const acquaintances =
      panel.querySelector("[data-items-tab='villains']");

    const tabs =
      acquaintances?.parentElement ||
      panel.querySelector("[data-items-tab='items']")?.parentElement;

    if (!tabs) return;

    tabs.style.gridTemplateColumns = "repeat(4,minmax(0,1fr))";

    const button = scene.createDOMButton?.(
      "FLIRTS",
      () => {
        scene.itemsModalTab = "flirts";
        scene.renderItemsModalTab?.();
      },
      {
        color: "#e8edf2",
        background: "#252c32",
        border: "#68727b",
        minHeight: "36px",
        fontSize: "5.6px"
      }
    );

    if (!button) return;

    button.dataset.itemsTab = "flirts";
    tabs.appendChild(button);
  }

  function patchInventory(scene) {
    if (!scene || scene.__flirtInventoryV46) return;
    scene.__flirtInventoryV46 = true;

    if (typeof scene.renderItemsModalTab === "function") {
      const originalRender = scene.renderItemsModalTab.bind(scene);

      scene.renderItemsModalTab = function renderItemsModalTabV46(...args) {
        if (this.itemsModalTab === "flirts") {
          renderFlirtsTab(this);
          ensureFlirtsTab(this);
          return;
        }

        const result = originalRender(...args);
        ensureFlirtsTab(this);
        return result;
      };
    }

    if (typeof scene.openItemsModal === "function") {
      const originalOpen = scene.openItemsModal.bind(scene);

      scene.openItemsModal = function openItemsModalV46(...args) {
        const result = originalOpen(...args);
        ensureFlirtsTab(this);

        if (this.itemsModalTab === "flirts") {
          renderFlirtsTab(this);
        }

        return result;
      };
    }
  }

  // ===========================================================================
  // INDOOR HOTBAR — HIVE + ZOFINGIA can smoke, drink and read
  // ===========================================================================

  function removeIndoorHotbar() {
    indoorHotbarRoot?.remove?.();
    indoorHotbarRoot = null;
    indoorHotbarSignature = "";
  }

  function getIndoorContext() {
    const g = getGame();
    if (!g) return null;

    const hive = getScene(g, "HiveInteriorScene");
    const station = getScene(g, "BahnhofquaiScene");

    if (hive?.sys?.isActive?.() && hive.player?.active && hive.overworld) {
      return {
        key: "hive",
        room: hive,
        world: hive.overworld,
        actor: hive.player,
        locked: Boolean(
          hive.modalOpen ||
          hive.actionLocked ||
          hive.__sv32GirlDialogueActive ||
          hive.overworld?.itemsModal
        )
      };
    }

    if (
      station?.sys?.isActive?.() &&
      station.__sv37ZofingiaOpen &&
      station.__sv37ClubSimon?.active
    ) {
      return {
        key: "zofingia",
        room: station,
        world: station,
        actor: station.__sv37ClubSimon,
        locked: Boolean(
          station.__sv37EnriqueModal ||
          station.itemsModal ||
          station.itemInfoModal ||
          station.__sv46IndoorItemBusy
        )
      };
    }

    return null;
  }

  function itemActionLabel(world, key) {
    if (!key) return "LEER";

    const item = world?.getItemDefinition?.(key);

    if (key === "camel") return "RAUCHEN";
    if (key === "gatorade" || key === "monster") return "TRINKEN";
    if (item?.type === "book") return "LESEN";

    return "NICHT HIER";
  }

  function animateIndoorProp(room, actor, kind, color, done) {
    if (!room || !actor?.active) {
      done?.();
      return;
    }

    const x = actor.x + (actor.flipX ? -25 : 25);
    const y = actor.y - 58;

    if (kind === "smoke") {
      const cigarette = room.add.graphics().setDepth(1700).setScrollFactor(0);
      cigarette.fillStyle(0xf3efe2, 1);
      cigarette.fillRect(x - 10, y, 18, 4);
      cigarette.fillStyle(0xd46439, 1);
      cigarette.fillRect(x + 8, y, 4, 4);

      const puffs = [0, 1, 2].map((i) =>
        room.add.circle(
          x + 13 + i * 4,
          y - 7 - i * 7,
          4 + i,
          0xe7e7e7,
          0.72
        )
          .setDepth(1701)
          .setScrollFactor(0)
      );

      room.tweens.add({
        targets: puffs,
        y: "-=18",
        alpha: 0,
        duration: 900,
        onComplete: () => {
          cigarette.destroy();
          puffs.forEach((p) => p.destroy());
          done?.();
        }
      });

      return;
    }

    if (kind === "drink") {
      const can = room.add.rectangle(x, y, 10, 22, color, 1)
        .setDepth(1700)
        .setScrollFactor(0);

      room.tweens.add({
        targets: can,
        y: y - 18,
        angle: 25,
        duration: 260,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          can.destroy();
          done?.();
        }
      });

      return;
    }

    if (kind === "book") {
      const book = room.add.rectangle(x, y, 26, 34, color, 1)
        .setDepth(1700)
        .setScrollFactor(0);

      room.tweens.add({
        targets: book,
        angle: { from: -5, to: 5 },
        y: y - 5,
        duration: 350,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          book.destroy();
          done?.();
        }
      });

      return;
    }

    done?.();
  }

  function finishIndoorUse(context) {
    const { room, actor, key } = context;

    if (key === "hive") {
      room.actionLocked = false;
    } else {
      room.__sv46IndoorItemBusy = false;

      if (room.__sv37EnriqueModal?.__indoorItemV46) {
        room.__sv37EnriqueModal = null;
      }
    }

    if (actor?.active) {
      actor.setAngle?.(0);
      actor.play?.("simon-idle", true);
    }

    indoorHotbarSignature = "";
  }

  function syncAfterItemUse(world, key) {
    if (world.getItemCount?.(key) <= 0) {
      world.removeItemFromHotbar?.(key);
    } else {
      world.refreshHotbar?.();
    }

    world.updateInventoryUI?.();
    world.updateHotbarActionUI?.();
    world.updateHpBar?.();
  }

  function readBookIndoors(context, itemKey, item) {
    const { room, world, actor } = context;
    const bookKey = item?.bookKey;

    if (!bookKey) {
      finishIndoorUse(context);
      return;
    }

    animateIndoorProp(
      room,
      actor,
      "book",
      0x355f85,
      () => {
        world.booksRead = world.booksRead || {};
        world.abilitiesUnlocked = world.abilitiesUnlocked || {};

        let abilityName = null;
        const firstRead = !world.booksRead[bookKey];

        if (firstRead) {
          world.booksRead[bookKey] = true;

          if (bookKey === "generalRelativity") {
            world.abilitiesUnlocked.wormhole = true;
            abilityName = "WURMLOCH";
          } else if (bookKey === "zarathustra") {
            world.abilitiesUnlocked.eternalReturn = true;
            abilityName = "EWIGE WIEDERKEHR";
          } else if (bookKey === "phaenomenologie") {
            world.abilitiesUnlocked.forItself = true;
            abilityName = "FÜR SICH SEIN";
          } else if (bookKey === "playbook") {
            learnMany(
              world,
              PLAYBOOK_FLIRTS,
              "NEUE FLIRTS GELERNT"
            );
          }
        }

        if (bookKey !== "playbook") {
          const quotes = world.getBookQuotes?.(bookKey) || [];

          if (quotes.length) {
            const quote = quotes[
              Math.floor(Math.random() * quotes.length)
            ];

            showNotice(
              world,
              item.name?.toUpperCase?.() || "BUCH",
              [String(quote)],
              3600
            );
          }
        }

        if (abilityName) {
          showNotice(
            world,
            "NEUE FÄHIGKEIT",
            [abilityName],
            3300
          );
        }

        world.updateInventoryUI?.();
        finishIndoorUse(context);
      }
    );
  }

  function useIndoorSelected(context) {
    const { room, world, actor, key: roomKey } = context;

    if (
      !world ||
      !actor?.active ||
      context.locked ||
      room.__sv46IndoorItemBusy
    ) {
      return;
    }

    const index = Number.isInteger(world.selectedHotbarIndex)
      ? Phaser.Math.Clamp(world.selectedHotbarIndex, 0, HOTBAR_SIZE - 1)
      : 0;

    const itemKey = world.hotbarItems?.[index];
    const item = world.getItemDefinition?.(itemKey);

    if (!itemKey || !item || world.getItemCount?.(itemKey) <= 0) return;

    if (
      !["camel", "gatorade", "monster"].includes(itemKey) &&
      item.type !== "book"
    ) {
      showNotice(
        world,
        "HIER NICHT BENUTZBAR",
        [String(item.name || itemKey).toUpperCase()],
        1800
      );
      return;
    }

    room.__sv46IndoorItemBusy = true;

    if (roomKey === "hive") {
      room.actionLocked = true;
    } else {
      room.__sv37EnriqueModal = { __indoorItemV46: true };
    }

    if (item.type === "book") {
      readBookIndoors(context, itemKey, item);
      return;
    }

    if (itemKey === "camel") {
      animateIndoorProp(
        room,
        actor,
        "smoke",
        0xffffff,
        () => {
          world.inventory.camel =
            Math.max(0, (Number(world.getItemCount?.("camel")) || 0) - 1);

          const now = Date.now();
          const duration = Number(item.sprintMs) || 20000;

          world.sprintExpiresAt =
            Math.max(now, Number(world.sprintExpiresAt) || 0) + duration;

          syncAfterItemUse(world, "camel");
          finishIndoorUse(context);
        }
      );
      return;
    }

    const color =
      itemKey === "gatorade"
        ? 0x79b5ee
        : 0xf08b45;

    animateIndoorProp(
      room,
      actor,
      "drink",
      color,
      () => {
        world.inventory[itemKey] =
          Math.max(0, (Number(world.getItemCount?.(itemKey)) || 0) - 1);

        world.hp = Math.min(
          Number(world.maxHp) || 100,
          (Number(world.hp) || 0) + (Number(item.heal) || 0)
        );

        syncAfterItemUse(world, itemKey);
        finishIndoorUse(context);
      }
    );
  }

  function buildIndoorHotbar(context) {
    removeIndoorHotbar();

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const { world } = context;

    const wrapper = document.createElement("div");
    wrapper.dataset.simonUi = "indoor-hotbar-v46";

    Object.assign(wrapper.style, {
      position: "absolute",
      left: "50%",
      top: "8px",
      transform: "translateX(-50%)",
      zIndex: "100270",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px",
      border: "2px solid rgba(255,240,207,.72)",
      background: "rgba(18,23,31,.82)",
      boxShadow: "3px 3px 0 rgba(0,0,0,.32)",
      pointerEvents: context.locked ? "none" : "auto",
      opacity: context.locked ? "0.45" : "1",
      touchAction: "manipulation"
    });

    for (let i = 0; i < HOTBAR_SIZE; i += 1) {
      const key = world.hotbarItems?.[i] || null;
      const selected = i === world.selectedHotbarIndex;

      const slot = document.createElement("button");
      slot.type = "button";

      Object.assign(slot.style, {
        width: "34px",
        height: "34px",
        padding: "1px",
        border: selected
          ? "3px solid #ffe08a"
          : "2px solid #737b83",
        background: selected
          ? "#4c4433"
          : "#242a31",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        touchAction: "manipulation"
      });

      if (key) {
        const icon = world.createDOMItemIcon?.(key, 27);

        if (icon) {
          icon.style.pointerEvents = "none";
          slot.appendChild(icon);
        } else {
          slot.textContent = key.slice(0, 1).toUpperCase();
        }

        const count = world.getItemCount?.(key) || 0;

        if (count > 1) {
          const qty = document.createElement("span");
          qty.textContent = String(count);

          Object.assign(qty.style, {
            position: "absolute",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            color: "#fff",
            transform: "translate(11px,11px)"
          });

          slot.appendChild(qty);
        }
      }

      slot.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        world.selectedHotbarIndex = i;
        world.refreshHotbar?.();
        indoorHotbarSignature = "";
      });

      wrapper.appendChild(slot);
    }

    const selectedKey =
      world.hotbarItems?.[world.selectedHotbarIndex] || null;

    const use = document.createElement("button");
    use.type = "button";
    use.textContent = itemActionLabel(world, selectedKey);

    const actionable = !["LEER", "NICHT HIER"].includes(use.textContent);

    Object.assign(use.style, {
      minHeight: "34px",
      minWidth: "74px",
      padding: "4px 7px",
      border: "2px solid #d7bd78",
      background: actionable ? "#4a5937" : "#3a3a3a",
      color: actionable ? "#f6ffd8" : "#999",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      cursor: actionable ? "pointer" : "default",
      touchAction: "manipulation"
    });

    use.disabled = !actionable;

    use.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      useIndoorSelected(context);
    });

    wrapper.appendChild(use);

    root.appendChild(wrapper);
    indoorHotbarRoot = wrapper;
  }

  function updateIndoorHotbar() {
    const context = getIndoorContext();

    if (!context) {
      removeIndoorHotbar();
      return;
    }

    const world = context.world;

    const signature = [
      context.key,
      context.locked ? "locked" : "open",
      world.selectedHotbarIndex,
      ...(world.hotbarItems || []),
      world.getItemCount?.("gatorade") || 0,
      world.getItemCount?.("monster") || 0,
      world.getItemCount?.("camel") || 0,
      world.getItemCount?.("bookGeneralRelativity") || 0,
      world.getItemCount?.("bookPhaenomenologie") || 0,
      world.getItemCount?.("bookPlaybook") || 0,
      world.getItemCount?.("bookZarathustra") || 0
    ].join("|");

    if (signature !== indoorHotbarSignature || !indoorHotbarRoot?.isConnected) {
      indoorHotbarSignature = signature;
      buildIndoorHotbar(context);
    }
  }

  // ===========================================================================
  // MILKMAN STABILITY
  // ===========================================================================

  function patchMilkmanStability(scene) {
    if (!scene || scene.__milkmanStabilityV46) return;
    scene.__milkmanStabilityV46 = true;

    if (typeof scene.startMilkmanFight === "function") {
      const originalStartFight = scene.startMilkmanFight.bind(scene);

      scene.startMilkmanFight = function startMilkmanFightV46(...args) {
        this.clearMilkmanDialogue?.();
        this.milkmanDialogueBubble = null;

        const result = originalStartFight(...args);

        this.clearMilkmanDialogue?.();
        this.milkmanDialogueBubble = null;
        return result;
      };
    }

    if (typeof scene.advanceMilkmanDialogue === "function") {
      const originalAdvance = scene.advanceMilkmanDialogue.bind(scene);

      scene.advanceMilkmanDialogue = function advanceMilkmanDialogueV46(...args) {
        const result = originalAdvance(...args);

        if (!this.milkmanDialogueActive || this.milkmanFightActive) {
          this.clearMilkmanDialogue?.();
          this.milkmanDialogueBubble = null;
        }

        return result;
      };
    }

    scene.events?.on?.("shutdown", () => {
      scene.clearMilkmanDialogue?.();
      scene.milkmanDialogueBubble = null;
    });
  }

  function maintainMilkmanBubble(scene) {
    if (!scene?.milkmanDialogueBubble) return;

    const mustDie =
      !scene.milkmanDialogueActive ||
      scene.milkmanFightActive ||
      !scene.milkman?.active;

    if (mustDie) {
      scene.clearMilkmanDialogue?.();
      scene.milkmanDialogueBubble = null;
    }
  }

  // ===========================================================================
  // DEVELOPER MODE
  // ===========================================================================

  function seedDeveloperItems(world) {
    if (!world) return;

    world.inventory = world.inventory || {};
    world.inventory.gatorade = Math.max(3, Number(world.inventory.gatorade) || 0);
    world.inventory.monster = Math.max(3, Number(world.inventory.monster) || 0);
    world.inventory.camel = Math.max(5, Number(world.inventory.camel) || 0);

    world.booksOwned = world.booksOwned || {};
    world.booksOwned.playbook = true;
    world.booksOwned.generalRelativity = true;

    world.hotbarItems = [
      "camel",
      "gatorade",
      "monster",
      "bookPlaybook",
      "bookGeneralRelativity"
    ];

    world.selectedHotbarIndex = 0;
    world.refreshHotbar?.();
    world.updateInventoryUI?.();
  }

  function grantAllFlirtsForDeveloper(world) {
    Object.keys(FLIRTS).forEach((id) => {
      if (!learned(id)) state.learnedFlirts.push(id);
    });

    attachState(world);
  }

  function addDeveloperTargets() {
    const list = document.querySelector(
      "#developer-menu-screen .dev-destinations"
    );

    if (!list) return;

    if (!list.querySelector("[data-dev-target='hive-test']")) {
      const button = document.createElement("button");
      button.className = "dev-action dev-destination";
      button.type = "button";
      button.dataset.devTarget = "hive-test";
      button.innerHTML =
        '5. HIVE / FRAU' +
        '<small>Direkt Beobachten, alle Flirts und Indoor-Items testen.</small>';

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        window.launchGame?.({
          startMode: "hive-test"
        });
      });

      list.appendChild(button);
    }

    if (!list.querySelector("[data-dev-target='zofingia-test']")) {
      const button = document.createElement("button");
      button.className = "dev-action dev-destination";
      button.type = "button";
      button.dataset.devTarget = "zofingia-test";
      button.innerHTML =
        '6. ZOFINGIA / ENRIQUE' +
        '<small>Direkt Enrique-Käufe, Menüs und Indoor-Items testen.</small>';

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        window.launchGame?.({
          startMode: "zofingia-test"
        });
      });

      list.appendChild(button);
    }
  }

  function startHiveDeveloper(game) {
    let attempts = 0;

    const tryStart = () => {
      attempts += 1;

      const milk = getScene(game, "MilchbuckScene");
      const hive = getScene(game, "HiveInteriorScene");

      if (milk?.sys?.isActive?.() && hive) {
        milk.developerMode = true;
        milk.coins = 999999;

        seedDeveloperItems(milk);
        grantAllFlirtsForDeveloper(milk);

        // Developer HIVE is a feature test, so skip the mandatory first
        // conversation and expose BEOBACHTEN immediately.
        markWomanConversationDone();

        hive.__leaving = false;
        hive.actionLocked = false;
        hive.modalOpen = false;
        hive.introDancing = false;

        milk.setUILocked?.(true);
        milk.scene.pause();

        game.scene.start(
          "HiveInteriorScene",
          {
            overworld: milk,
            simonDances: false
          }
        );

        return;
      }

      if (attempts < 120) {
        window.setTimeout(tryStart, 80);
      }
    };

    window.setTimeout(tryStart, 180);
  }

  function startZofingiaDeveloper(game) {
    let attempts = 0;

    const tryOpen = () => {
      attempts += 1;

      const station = getScene(game, "BahnhofquaiScene");
      const zone = station?.__sv37Promenade?.zone;

      if (
        station?.sys?.isActive?.() &&
        zone?.active &&
        !station.uiLocked &&
        !station.tramTransitActive
      ) {
        station.developerMode = true;
        station.coins = 999999;

        seedDeveloperItems(station);
        station.updateCoinHUD?.();

        zone.emit(
          "pointerdown",
          {
            event: {
              preventDefault() {},
              stopPropagation() {}
            }
          }
        );

        return;
      }

      if (attempts < 160) {
        window.setTimeout(tryOpen, 100);
      }
    };

    window.setTimeout(tryOpen, 350);
  }

  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameV46(options = {}) {
      if (options.startMode === "hive-test") {
        const game = previousStart.call(
          this,
          {
            ...options,
            startMode: "normal",
            developerMode: true
          }
        );

        if (game) startHiveDeveloper(game);
        return game;
      }

      if (options.startMode === "zofingia-test") {
        const game = previousStart.call(
          this,
          {
            ...options,
            startMode: "hb",
            developerMode: true
          }
        );

        if (game) startZofingiaDeveloper(game);
        return game;
      }

      return previousStart.call(this, options);
    };
  }

  // ===========================================================================
  // INSTALL LOOP
  // ===========================================================================

  function install() {
    const game = getGame();
    if (!game?.scene) return;

    const milk = getScene(game, "MilchbuckScene");
    const station = getScene(game, "BahnhofquaiScene");
    const venice = getScene(game, "VeniceScene");
    const hive = getScene(game, "HiveInteriorScene");

    [milk, station, venice]
      .filter(Boolean)
      .forEach((world) => {
        attachState(world);
        patchPlaybook(world);
        reconcilePlaybook(world);
        patchInventory(world);
      });

    if (station) {
      patchMilkmanStability(station);
      maintainMilkmanBubble(station);
      enforceEnriqueInteraction(station);
    }

    if (hive) {
      enforceWomanSystem(hive);

      if (hive.overworld) {
        attachState(hive.overworld);
        patchInventory(hive.overworld);
      }
    }

    updateIndoorHotbar();
  }

  addDeveloperTargets();

  const loop = () => {
    install();
    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);

  window.SimonFlirtsV46 = Object.freeze({
    VERSION,
    FLIRTS,
    PLAYBOOK_FLIRTS,
    ENRIQUE_PAID,
    state,

    getLearned() {
      return state.learnedFlirts
        .filter((id) => Boolean(FLIRTS[id]))
        .map((id) => ({
          id,
          name: FLIRTS[id].name,
          source: FLIRTS[id].source,
          description: FLIRTS[id].description
        }));
    },

    learn(id) {
      const game = getGame();

      const world =
        getScene(game, "BahnhofquaiScene") ||
        getScene(game, "MilchbuckScene") ||
        getScene(game, "VeniceScene");

      return learnFlirt(world, id);
    },

    recoverEnrique() {
      const game = getGame();
      const station = getScene(game, "BahnhofquaiScene");

      if (station) {
        closeEnriqueModal(station);
        recoverEnriqueInput(station);
      }
    }
  });

  console.info(
    "Flirt-System v46 aktiv: ein Flirtsystem, Milkman-Fix, Indoor-Items, Developer-Stabilität."
  );
})();