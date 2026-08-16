(() => {
  "use strict";

  if (window.__SIMON_FLIRT_SYSTEM_V45__) return;
  window.__SIMON_FLIRT_SYSTEM_V45__ = true;

  const VERSION = 45;
  const WOMAN_ID = "woman_hive_01";

  // ---------------------------------------------------------------------------
  // SOURCE-CORRECT FLIRT CATALOG
  // ---------------------------------------------------------------------------

  const FLIRTS = Object.freeze({
    // Enrique — free
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

    // Enrique — 100 coins each
    fakeTourist: {
      id: "fakeTourist",
      name: "Der falsche Tourist",
      source: "ENRIQUE",
      description:
        "Simon tut so, als brauche er Orientierung, und verwandelt die Frage in einen Gesprächseinstieg.",
      price: 100,
      lines: [
        {
          speaker: "simon",
          text: "Entschuldigung... ich glaub, ich han mi komplett verlaufe."
        },
        { speaker: "woman", text: "Wo wotsch denn hi?" },
        {
          speaker: "simon",
          text: "Eigentlich? Zu dir. De Rest vo de Route isch improvisiert."
        },
        { speaker: "woman", text: "Okay... frech." }
      ]
    },

    coinToss: {
      id: "coinToss",
      name: "Der Münzwurf",
      source: "ENRIQUE",
      description:
        "Kopf: Simon lädt sie auf einen Drink ein. Zahl: sie ihn. Das Ergebnis kennt Simon natürlich schon.",
      price: 100,
      lines: [
        {
          speaker: "simon",
          text: "Kopf: Ich lad dich uf en Drink ii. Zahl: du mich."
        },
        { speaker: "woman", text: "Und?" },
        { speaker: "simon", text: "Kopf." },
        { speaker: "woman", text: "Wie praktisch." }
      ]
    },

    bookworm: {
      id: "bookworm",
      name: "Der Bücherwurm",
      source: "ENRIQUE",
      description:
        "Simon steigt über Bücher, Lesen oder einen auffälligen literarischen Hinweis ins Gespräch ein.",
      price: 100,
      lines: [
        {
          speaker: "simon",
          text: "Kurzi Frag: Was isch dis Lieblingsbuech?"
        },
        { speaker: "woman", text: "Wieso?" },
        {
          speaker: "simon",
          text: "Ich muss kurz prüefe, ob du nur guet usgsehsch oder au guet liesisch."
        },
        { speaker: "woman", text: "Okay... de isch knapp dure." }
      ]
    },

    // The Playbook — exactly three HIMYM moves
    lorenzoVonMatterhorn: {
      id: "lorenzoVonMatterhorn",
      name: "Lorenzo Von Matterhorn",
      source: "THE PLAYBOOK",
      description:
        "Simon stellt sich als absurd bedeutender Lorenzo Von Matterhorn vor und setzt darauf, dass seine angebliche Legende überzeugt.",
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
      source: "THE PLAYBOOK",
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
      source: "THE PLAYBOOK",
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
    }
  });

  const PLAYBOOK_FLIRTS = Object.freeze([
    "lorenzoVonMatterhorn",
    "snasa",
    "tedMosby"
  ]);

  const ENRIQUE_PAID = Object.freeze({
    fakeTourist: {
      flirtId: "fakeTourist",
      name: "Der falsche Tourist",
      price: 100,
      explanation: [
        {
          speaker: "simon",
          text: "Wie funktioniert de falschi Tourist?"
        },
        {
          speaker: "enrique",
          text: "Du frögsch sie nach em Wäg. Ganz harmlos."
        },
        {
          speaker: "simon",
          text: "Aber ich kenn Zürich."
        },
        {
          speaker: "enrique",
          text: "Simon. Du bisch nöd würklich Tourist."
        },
        {
          speaker: "enrique",
          text: "Sobald sie hilft, machsch us de Route es Gspröch."
        }
      ]
    },

    coinToss: {
      flirtId: "coinToss",
      name: "Der Münzwurf",
      price: 100,
      explanation: [
        { speaker: "simon", text: "Und de Münzwurf?" },
        {
          speaker: "enrique",
          text: "Kopf: du ladsch sie ii. Zahl: sie dich."
        },
        { speaker: "simon", text: "Und wenn Zahl chunnt?" },
        {
          speaker: "enrique",
          text: "Denn seisch trotzdem Kopf."
        },
        { speaker: "simon", text: "Das isch Betrug." },
        { speaker: "enrique", text: "Das isch Flirtökonomie." }
      ]
    },

    bookworm: {
      flirtId: "bookworm",
      name: "Der Bücherwurm",
      price: 100,
      explanation: [
        { speaker: "simon", text: "Was isch de Bücherwurm?" },
        {
          speaker: "enrique",
          text: "Du suechsch öppis, wo sie würklich interessiert."
        },
        {
          speaker: "enrique",
          text: "Wenn sie es Buech het: perfekt. Aber nöd so tue, als hättsch alles gläse."
        },
        { speaker: "simon", text: "Wieso?" },
        {
          speaker: "enrique",
          text: "Will sie spätestens bi de zweite Frag merkt, dass du lügsch."
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

  // Reuse v42's actual state object so Playbook learning, Enrique intro and
  // woman attempts stay connected instead of becoming a parallel system.
  const state =
    window.__SIMON_FLIRT_STATE_V40__ ||
    window.__SIMON_FLIRT_STATE_V42__ || {
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

  const womanProgress =
    state.women[WOMAN_ID] ||
    { attemptedFlirts: [], flirtAttemptedThisVisit: false };

  if (!Array.isArray(womanProgress.attemptedFlirts)) {
    womanProgress.attemptedFlirts = [];
  }

  state.women[WOMAN_ID] = womanProgress;

  // v42 temporarily sold the HIMYM moves through Enrique. If somebody already
  // paid for them in the current session, preserve that spent purchase as the
  // corresponding new Enrique move rather than simply deleting it.
  const oldPaid = state.enriquePurchased;

  state.enriquePurchased = {
    fakeTourist: Boolean(oldPaid.fakeTourist || oldPaid.lorenzoVonMatterhorn),
    coinToss: Boolean(oldPaid.coinToss || oldPaid.snasa),
    bookworm: Boolean(oldPaid.bookworm || oldPaid.tedMosby)
  };

  // Old v40 placeholder IDs become the intended Enrique moves.
  const legacyMap = Object.freeze({
    enrique1: "fakeTourist",
    enrique2: "coinToss",
    enrique3: "bookworm"
  });

  const migratedLearned = [];

  for (const id of state.learnedFlirts) {
    const nextId = legacyMap[id] || id;

    if (FLIRTS[nextId] && !migratedLearned.includes(nextId)) {
      migratedLearned.push(nextId);
    }
  }

  state.learnedFlirts.splice(
    0,
    state.learnedFlirts.length,
    ...migratedLearned
  );

  // If v42 charged for a HIMYM move before v45, preserve value by also
  // granting the new Enrique counterpart.
  if (oldPaid.lorenzoVonMatterhorn && !state.learnedFlirts.includes("fakeTourist")) {
    state.learnedFlirts.push("fakeTourist");
  }
  if (oldPaid.snasa && !state.learnedFlirts.includes("coinToss")) {
    state.learnedFlirts.push("coinToss");
  }
  if (oldPaid.tedMosby && !state.learnedFlirts.includes("bookworm")) {
    state.learnedFlirts.push("bookworm");
  }

  window.__SIMON_FLIRT_STATE_V40__ = state;
  window.__SIMON_FLIRT_STATE_V42__ = state;
  window.__SIMON_FLIRT_STATE_V45__ = state;

  let overlay = null;

  // ---------------------------------------------------------------------------
  // GENERAL
  // ---------------------------------------------------------------------------

  function game() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function scene(gameInstance, key) {
    try {
      return gameInstance?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function learned(id) {
    return state.learnedFlirts.includes(id);
  }

  function learn(sceneInstance, id, showNotice = true) {
    if (!FLIRTS[id] || learned(id)) return false;

    state.learnedFlirts.push(id);
    attach(sceneInstance);

    if (showNotice) {
      showNoticeBanner(
        sceneInstance,
        "NEUER FLIRT GELERNT",
        [id]
      );
    }

    return true;
  }

  function attach(sceneInstance) {
    if (!sceneInstance) return;

    sceneInstance.learnedFlirts = state.learnedFlirts;
    sceneInstance.ownedFlirts = state.learnedFlirts;
    sceneInstance.flirtProgress = state.women;
    sceneInstance.enriqueFlirtsPurchased = state.enriquePurchased;
    sceneInstance.enriqueIntroCompleted =
      Boolean(
        state.enriqueIntroCompleted ||
        sceneInstance.enriqueSpoken
      );

    if (sceneInstance.enriqueSpoken) {
      state.enriqueIntroCompleted = true;
    }
  }

  function showNoticeBanner(sceneInstance, title, ids) {
    const names = ids
      .map((id) => FLIRTS[id]?.name)
      .filter(Boolean);

    if (!names.length) return;

    const text = [
      title,
      ...names.map((name) => name.toUpperCase())
    ].join("\n");

    if (typeof sceneInstance?.showTopTextNotice === "function") {
      sceneInstance.showTopTextNotice(
        text,
        { duration: 3300, key: "flirt-unlock-v45" }
      );
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const banner = document.createElement("div");
    banner.dataset.simonUi = "flirt-unlock-v45";
    banner.textContent = text;

    Object.assign(banner.style, {
      position: "absolute",
      left: "50%",
      top: "46px",
      transform: "translateX(-50%)",
      zIndex: "449000",
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
      pointerEvents: "none"
    });

    root.appendChild(banner);
    window.setTimeout(() => banner.remove(), 3300);
  }

  function clearOverlay() {
    overlay?.remove?.();
    overlay = null;
  }

  function makeOverlay(onAdvance, key) {
    clearOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const node = document.createElement("div");
    node.dataset.simonUi = key;

    Object.assign(node.style, {
      position: "absolute",
      inset: "0",
      zIndex: "450000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
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
    overlay = node;
    return node;
  }

  // ---------------------------------------------------------------------------
  // PLAYBOOK RECONCILIATION
  //
  // v42 already wraps playBookReadingAnimation correctly for Lorenzo / SNASA /
  // Ted Mosby. v45 does not wrap it again. It only repairs old/read saves.
  // ---------------------------------------------------------------------------

  function reconcilePlaybook(sceneInstance) {
    if (!sceneInstance?.booksRead?.playbook) return;

    const missing = PLAYBOOK_FLIRTS.filter(
      (id) => !learned(id)
    );

    if (!missing.length) return;

    missing.forEach((id) => {
      if (!learned(id)) state.learnedFlirts.push(id);
    });

    attach(sceneInstance);

    showNoticeBanner(
      sceneInstance,
      "NEUE FLIRTS GELERNT",
      missing
    );
  }

  // ---------------------------------------------------------------------------
  // WOMAN — first click talks automatically, later clicks show menu
  // ---------------------------------------------------------------------------

  function firstWomanConversationDone() {
    return Boolean(
      window.__SIMON_WOMAN_CONVERSATION_STATE_V43__
        ?.completedFirstConversation
    );
  }

  function faceWomanPair(hive) {
    if (!hive?.player?.active || !hive?.womanSprite?.active) return;
    hive.player.setFlipX(hive.womanSprite.x < hive.player.x);
  }

  function runHiveSequence(hive, steps, done = null) {
    if (!hive || !Array.isArray(steps) || !steps.length) return;

    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;
    faceWomanPair(hive);

    let index = 0;

    const render = () => {
      const step = steps[index];

      if (!step) {
        clearOverlay();
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

    makeOverlay(() => {
      index += 1;
      render();
    }, "hive-flirt-v45");

    render();
  }

  function observeWoman(hive) {
    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;

    const text = WOMAN.observations[
      Math.floor(Math.random() * WOMAN.observations.length)
    ];

    hive.showSpeechBubble?.(
      hive.player,
      text,
      0
    );

    if (hive.speechBubble?.active) {
      const c1 = hive.add.circle(
        -6, 42, 6, 0xfff8df, 1
      ).setStrokeStyle(2, 0x382d36, 1);

      const c2 = hive.add.circle(
        -14, 54, 3.5, 0xfff8df, 1
      ).setStrokeStyle(2, 0x382d36, 1);

      hive.speechBubble.add([c1, c2]);
    }

    makeOverlay(() => {
      clearOverlay();
      hive.destroySpeechBubble?.();
      hive.actionLocked = false;
    }, "woman-observe-v45");
  }

  function womanMenu(hive) {
    const available = state.learnedFlirts
      .filter((id) => Boolean(FLIRTS[id]));

    hive.openDialog?.(
      "ANSPRECHEN",
      "Was soll Simon machen?",
      [
        {
          label: "BEOBACHTEN",
          action: () => observeWoman(hive)
        },
        {
          label: available.length
            ? "FLIRTEN"
            : "FLIRTEN 🔒",
          disabled: available.length === 0,
          action: () => flirtMenu(hive)
        },
        {
          label: "ZURÜCK",
          action: () => hive.closeModal?.()
        }
      ]
    );
  }

  function flirtMenu(hive) {
    const progress = state.women[WOMAN_ID];

    if (progress.flirtAttemptedThisVisit) {
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

    const ids = state.learnedFlirts
      .filter((id) => Boolean(FLIRTS[id]));

    if (!ids.length) {
      hive.openDialog?.(
        "FLIRTEN",
        "Simon kennt no kein Flirt.",
        [
          {
            label: "ZURÜCK",
            action: () => womanMenu(hive)
          }
        ]
      );
      return;
    }

    const attempted = new Set(
      progress.attemptedFlirts
    );

    const buttons = ids.map((id) => ({
      label: FLIRTS[id].name.toUpperCase(),
      disabled: attempted.has(id),
      action: () => applyFlirt(hive, id)
    }));

    buttons.push({
      label: "ZURÜCK",
      action: () => womanMenu(hive)
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
        const label = String(
          button.textContent || ""
        ).trim().toUpperCase();

        if (!attemptedNames.has(label)) return;

        button.disabled = true;
        button.style.textDecoration = "line-through";
        button.style.opacity = "0.45";
        button.style.color = "#77736d";
      });
  }

  function applyFlirt(hive, id) {
    const flirt = FLIRTS[id];
    const progress = state.women[WOMAN_ID];

    if (!flirt || !learned(id)) return;
    if (progress.flirtAttemptedThisVisit) return;
    if (progress.attemptedFlirts.includes(id)) return;

    progress.attemptedFlirts.push(id);
    progress.flirtAttemptedThisVisit = true;

    // For now every flirt succeeds with every woman.
    // Exact physical action loops will be layered in later.
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
          alpha: 0,
          scale: 1.3,
          duration: 800,
          onComplete: () => heart.destroy()
        });
      }
    );
  }

  function patchWoman(hive) {
    if (!hive || hive.__flirtWomanV45Installed) return;
    hive.__flirtWomanV45Installed = true;

    const v43Talk =
      typeof hive.startRejectedDanceInvite === "function"
        ? hive.startRejectedDanceInvite.bind(hive)
        : null;

    hive.openWomanMenu = function openWomanMenuV45() {
      window.SimonAcquaintancesV41?.mark?.("womanHive");

      // FIRST click: no menu at all. Run the established v43 conversation.
      if (!firstWomanConversationDone()) {
        v43Talk?.();
        return;
      }

      // SECOND and later clicks: only the requested three choices.
      womanMenu(this);
    };

    // Prevent the v41 RAF patch from wrapping this again.
    hive.openWomanMenu.__acquaintanceV41 = true;
    hive.openWomanMenu.__flirtV42 = true;
    hive.openWomanMenu.__womanConversationV43 = true;
    hive.openWomanMenu.__flirtV45 = true;

    hive.getOwnedFlirts = function getOwnedFlirtsV45() {
      return [...state.learnedFlirts];
    };

    if (
      typeof hive.create === "function" &&
      !hive.create.__flirtVisitV45
    ) {
      const originalCreate = hive.create.bind(hive);

      const wrappedCreate = function createFlirtVisitV45(...args) {
        state.women[WOMAN_ID].flirtAttemptedThisVisit = false;
        return originalCreate(...args);
      };

      wrappedCreate.__flirtVisitV45 = true;
      hive.create = wrappedCreate;
    }

    if (
      typeof hive.leaveHive === "function" &&
      !hive.leaveHive.__flirtVisitV45
    ) {
      const originalLeave = hive.leaveHive.bind(hive);

      const wrappedLeave = function leaveHiveFlirtVisitV45(...args) {
        clearOverlay();
        state.women[WOMAN_ID].flirtAttemptedThisVisit = false;
        return originalLeave(...args);
      };

      wrappedLeave.__flirtVisitV45 = true;
      hive.leaveHive = wrappedLeave;
    }
  }

  // ---------------------------------------------------------------------------
  // LION DANCE — Simon performs one deliberate opening loop with the lion
  // ---------------------------------------------------------------------------

  function patchLionDance(world) {
    if (
      !world ||
      typeof world.enterHiveDance !== "function" ||
      world.enterHiveDance.__flirtV45
    ) {
      return;
    }

    const original = world.enterHiveDance.bind(world);

    const wrapped = function enterHiveDanceV45(...args) {
      const result = original(...args);

      this.time?.delayedCall?.(30, () => {
        const children = this.danceOverlay?.list || [];

        const danceSimon = children.find(
          (child) =>
            child?.texture?.key === "simon"
        );

        if (!danceSimon?.active) return;

        // Remove the old endless wobble tween on Simon only. The lion's own
        // existing dance remains intact.
        this.tweens?.killTweensOf?.(danceSimon);

        danceSimon.setAngle(0);

        const hasDance =
          this.anims?.exists?.("simon-v14-dance");

        if (hasDance) {
          danceSimon.setScale(0.52);
          danceSimon.play?.("simon-v14-dance", true);
        } else {
          danceSimon.setScale(0.42);
          danceSimon.play?.("simon-run", true);
        }

        // One clear synchronized-looking opening loop.
        this.tweens?.add?.({
          targets: danceSimon,
          x: danceSimon.x + 14,
          y: danceSimon.y - 7,
          angle: { from: -4, to: 4 },
          duration: 420,
          yoyo: true,
          repeat: 1,
          ease: "Sine.easeInOut",
          onComplete: () => {
            if (!danceSimon?.active) return;

            danceSimon.setAngle(0);
            danceSimon.setScale(0.42);
            danceSimon.play?.("simon-run", true);

            // After the opening loop he only gets a subtle club sway.
            this.tweens?.add?.({
              targets: danceSimon,
              y: danceSimon.y - 3,
              duration: 620,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut"
            });
          }
        });
      });

      return result;
    };

    wrapped.__flirtV45 = true;
    world.enterHiveDance = wrapped;
  }

  // ---------------------------------------------------------------------------
  // ENRIQUE — second look free; tourist / coin toss / bookworm paid
  // ---------------------------------------------------------------------------

  function clearZBubble(sceneInstance) {
    sceneInstance?.__flirtV45Bubble?.destroy?.(true);

    if (sceneInstance) {
      sceneInstance.__flirtV45Bubble = null;
    }
  }

  function zBubble(sceneInstance, speaker, text) {
    clearZBubble(sceneInstance);

    const actor =
      speaker === "simon"
        ? sceneInstance.__sv37ClubSimon
        : sceneInstance.__sv37Enrique;

    if (!actor) return;

    const simon = sceneInstance.__sv37ClubSimon;

    if (simon?.active) {
      if (speaker === "simon") {
        simon.setScale(0.52);

        if (
          sceneInstance.anims?.exists?.(
            "simon-v14-talk"
          )
        ) {
          simon.play(
            "simon-v14-talk",
            true
          );
        }
      } else {
        simon.setScale(0.42);
        simon.play?.("simon-idle", true);
      }
    }

    const x = Phaser.Math.Clamp(
      actor.x,
      140,
      680
    );

    const y = Phaser.Math.Clamp(
      actor.y - 120,
      60,
      225
    );

    let bubble = null;

    if (
      typeof sceneInstance.createSpeechBubble ===
      "function"
    ) {
      bubble = sceneInstance.createSpeechBubble(
        x,
        y,
        text,
        0
      );

      bubble?.setScrollFactor?.(0);
      bubble?.setDepth?.(1550);
    }

    if (!bubble) {
      bubble = sceneInstance.add.text(
        x,
        y,
        text,
        {
          fontFamily:
            '"Press Start 2P", monospace',
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

    sceneInstance.__flirtV45Bubble =
      bubble;
  }

  function closeEnrique(sceneInstance) {
    const modal =
      sceneInstance?.__sv37EnriqueModal;

    if (modal?.overlay) {
      try {
        sceneInstance.destroyDOMModal?.(
          modal
        );
      } catch {
        modal.overlay?.remove?.();
      }
    }

    if (sceneInstance) {
      sceneInstance.__sv37EnriqueModal =
        null;
    }
  }

  function enriqueSequence(
    sceneInstance,
    steps,
    done = null
  ) {
    if (
      !sceneInstance ||
      !Array.isArray(steps) ||
      !steps.length
    ) {
      return;
    }

    closeEnrique(sceneInstance);

    sceneInstance.__sv37EnriqueModal = {
      __flirtSequenceV45: true
    };

    let index = 0;

    const render = () => {
      const step = steps[index];

      if (!step) {
        clearOverlay();
        clearZBubble(sceneInstance);

        if (
          sceneInstance.__sv37ClubSimon
            ?.active
        ) {
          sceneInstance.__sv37ClubSimon
            .setScale(0.42);

          sceneInstance.__sv37ClubSimon
            .play?.("simon-idle", true);
        }

        sceneInstance.__sv37EnriqueModal =
          null;

        done?.();
        return;
      }

      zBubble(
        sceneInstance,
        step.speaker,
        step.text
      );
    };

    makeOverlay(() => {
      index += 1;
      render();
    }, "enrique-v45-sequence");

    render();
  }

  function makeEModal(sceneInstance, title) {
    closeEnrique(sceneInstance);

    const modal =
      sceneInstance.createDOMModal?.({
        key: "enrique-v45",
        width: "min(92%,570px)",
        background: "#e9dcc1",
        border: "#5e3b28",
        shade: "rgba(10,7,6,.62)",
        padding: "14px"
      });

    if (!modal) return null;

    sceneInstance.__sv37EnriqueModal =
      modal;

    // Compatibility flag: prevents the older v42 RAF from treating our v45
    // menu as a legacy menu and replacing it.
    modal.panel.dataset.enriqueV42 =
      "true";
    modal.panel.dataset.enriqueV45 =
      "true";

    modal.overlay.style.zIndex =
      "100180";

    const top =
      document.createElement("div");

    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      marginBottom: "10px"
    });

    const titleNode =
      sceneInstance.createDOMText?.(
        title,
        {
          fontSize: "12px",
          color: "#4a2d21"
        }
      ) ||
      document.createElement("div");

    if (!titleNode.textContent) {
      titleNode.textContent = title;
    }

    const wallet =
      sceneInstance.createDOMText?.(
        sceneInstance.developerMode
          ? "COINS ∞"
          : `${Math.max(
              0,
              Number(sceneInstance.coins) || 0
            )} COINS`,
        {
          fontSize: "7px",
          color: "#5a3d26"
        }
      ) ||
      document.createElement("div");

    if (!wallet.textContent) {
      wallet.textContent =
        `${Math.max(
          0,
          Number(sceneInstance.coins) || 0
        )} COINS`;
    }

    top.append(titleNode, wallet);
    modal.panel.appendChild(top);

    return modal;
  }

  function addEButton(
    sceneInstance,
    list,
    label,
    action,
    {
      disabled = false,
      back = false
    } = {}
  ) {
    const button =
      sceneInstance.createDOMButton?.(
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

    if (!button) return;

    if (disabled) {
      button.disabled = true;
      button.style.opacity = "0.55";
      button.style.textDecoration =
        "line-through";
    }

    list.appendChild(button);
  }

  function openEnriqueMain(sceneInstance) {
    if (!sceneInstance?.__sv37ZofingiaOpen) {
      return;
    }

    const modal = makeEModal(
      sceneInstance,
      "ENRIQUE"
    );

    if (!modal) return;

    const list =
      document.createElement("div");

    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    addEButton(
      sceneInstance,
      list,
      "WO ISCH DE GÉNÉRAL?",
      () => {
        enriqueSequence(
          sceneInstance,
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
          () => openEnriqueMain(
            sceneInstance
          )
        );
      }
    );

    addEButton(
      sceneInstance,
      list,
      "FRAG NACH EINEM WEITEREN FLIRT",
      () => openEnriqueShop(
        sceneInstance
      )
    );

    addEButton(
      sceneInstance,
      list,
      "ZURÜCK",
      () => closeEnrique(sceneInstance),
      { back: true }
    );

    modal.panel.appendChild(list);
  }

  function openEnriqueShop(sceneInstance) {
    if (!sceneInstance?.__sv37ZofingiaOpen) {
      return;
    }

    const modal = makeEModal(
      sceneInstance,
      "WEITEREN FLIRT LERNEN"
    );

    if (!modal) return;

    const info =
      sceneInstance.createDOMText?.(
        "Enrique erklärt jeden Move für 100 Coins.",
        {
          fontSize: "5.5px",
          color: "#685749",
          margin: "0 0 10px",
          lineHeight: "1.6"
        }
      );

    if (info) {
      modal.panel.appendChild(info);
    }

    const list =
      document.createElement("div");

    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    Object.values(ENRIQUE_PAID)
      .forEach((definition) => {
        const already = learned(
          definition.flirtId
        );

        addEButton(
          sceneInstance,
          list,
          already
            ? `${definition.name.toUpperCase()} · GELERNT`
            : `${definition.name.toUpperCase()} · ${definition.price} COINS`,
          () => buyEnrique(
            sceneInstance,
            definition
          ),
          { disabled: already }
        );
      });

    addEButton(
      sceneInstance,
      list,
      "← ZURÜCK",
      () => openEnriqueMain(
        sceneInstance
      ),
      { back: true }
    );

    modal.panel.appendChild(list);
  }

  function buyEnrique(
    sceneInstance,
    definition
  ) {
    if (!sceneInstance || !definition) {
      return;
    }

    if (learned(definition.flirtId)) {
      return;
    }

    const coins = Number(
      sceneInstance.coins
    ) || 0;

    if (
      !sceneInstance.developerMode &&
      coins < definition.price
    ) {
      enriqueSequence(
        sceneInstance,
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
        () => openEnriqueShop(
          sceneInstance
        )
      );

      return;
    }

    if (!sceneInstance.developerMode) {
      sceneInstance.coins =
        coins - definition.price;
    }

    sceneInstance.updateCoinHUD?.();

    state.enriquePurchased[
      definition.flirtId
    ] = true;

    enriqueSequence(
      sceneInstance,
      definition.explanation,
      () => {
        learn(
          sceneInstance,
          definition.flirtId,
          true
        );

        openEnriqueShop(
          sceneInstance
        );
      }
    );
  }

  function enriqueInteraction(
    sceneInstance
  ) {
    if (
      !sceneInstance?.__sv37ZofingiaOpen ||
      sceneInstance.itemsModal ||
      sceneInstance.itemInfoModal ||
      sceneInstance.__sv37EnriqueModal
    ) {
      return;
    }

    attach(sceneInstance);
    window.SimonAcquaintancesV41
      ?.mark?.("enrique");

    // First encounter remains owned by v42: it teaches secondLook and updates
    // the canonical enriqueSpoken story state.
    if (
      !state.enriqueIntroCompleted &&
      !sceneInstance.enriqueSpoken
    ) {
      // Let v42's already-stable intro start by temporarily invoking the
      // underlying legacy interaction path: create the legacy modal and allow
      // v42's RAF absorber to transform it.
      sceneInstance.__sv37Enrique
        ?.emit?.(
          "__v45_request_v42_intro"
        );

      // A normal v37 legacy modal is enough for v42 to notice it next frame.
      const oldZone =
        sceneInstance.__sv37EnriqueZone;

      if (
        !sceneInstance.__sv37EnriqueModal &&
        oldZone
      ) {
        // v45 cannot call v37's closure-private openEnriqueMenu directly.
        // Trigger E-style legacy behavior by asking v42's public interaction
        // only if it exists; otherwise use a tiny temporary compatible modal.
        const temp =
          sceneInstance.createDOMModal?.({
            key: "enrique-v37",
            width: "min(92%,560px)",
            background: "#e9dcc1",
            border: "#5e3b28",
            shade: "rgba(10,7,6,.58)",
            padding: "14px"
          });

        if (temp) {
          sceneInstance.__sv37EnriqueModal =
            temp;
        }
      }

      return;
    }

    if (
      sceneInstance.enriqueSpoken &&
      !state.enriqueIntroCompleted
    ) {
      state.enriqueIntroCompleted = true;

      if (!learned("secondLook")) {
        learn(
          sceneInstance,
          "secondLook",
          true
        );
      }
    }

    openEnriqueMain(sceneInstance);
  }

  function patchEnrique(sceneInstance) {
    if (!sceneInstance?.__sv37ZofingiaOpen) return;

    const zone =
      sceneInstance.__sv37EnriqueZone;

    const npc =
      sceneInstance.__sv37Enrique;

    if (
      zone?.active &&
      !zone.__flirtV45Anywhere
    ) {
      zone.removeAllListeners?.(
        "pointerdown"
      );

      zone.on(
        "pointerdown",
        (pointer) => {
          pointer?.event?.preventDefault?.();
          pointer?.event?.stopPropagation?.();

          enriqueInteraction(
            sceneInstance
          );
        }
      );

      zone.__flirtV45Anywhere = true;
    }

    if (
      npc?.active &&
      !npc.__flirtV45Anywhere
    ) {
      npc.removeAllListeners?.(
        "pointerdown"
      );

      npc.on(
        "pointerdown",
        (pointer) => {
          pointer?.event?.preventDefault?.();
          pointer?.event?.stopPropagation?.();

          enriqueInteraction(
            sceneInstance
          );
        }
      );

      npc.__flirtV45Anywhere = true;
    }

    if (
      sceneInstance.__sv37EnriquePrompt
        ?.active
    ) {
      sceneInstance.__sv37EnriquePrompt
        .setText("KLICK · ANSPRECHEN")
        .setVisible(
          !sceneInstance.__sv37EnriqueModal &&
          !sceneInstance.itemsModal
        );
    }

    // If E/legacy code opened v37 or v42's menu, replace it with v45 after the
    // intro has already been completed.
    const modal =
      sceneInstance.__sv37EnriqueModal;

    if (
      state.enriqueIntroCompleted &&
      modal?.panel &&
      !modal.panel.dataset.enriqueV45
    ) {
      closeEnrique(sceneInstance);
      openEnriqueMain(sceneInstance);
    }
  }

  // ---------------------------------------------------------------------------
  // INVENTORY — fourth FLIRTS tab
  // ---------------------------------------------------------------------------

  function renderFlirtsTab(sceneInstance) {
    const content =
      sceneInstance.itemsModalContent ||
      sceneInstance.itemsModal?.panel
        ?.querySelector?.(
          "[data-items-content='true']"
        );

    if (!content) return;

    content.replaceChildren();

    const ids = state.learnedFlirts
      .filter((id) => Boolean(FLIRTS[id]));

    if (!ids.length) {
      content.appendChild(
        sceneInstance.createDOMText?.(
          "NOCH KEINE FLIRTS GELERNT",
          {
            fontSize: "7px",
            color: "#b8bec4",
            margin: "18px 0"
          }
        ) ||
        document.createTextNode(
          "NOCH KEINE FLIRTS GELERNT"
        )
      );

      return;
    }

    const grid =
      document.createElement("div");

    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns:
        "repeat(2,minmax(0,1fr))",
      gap: "8px",
      width: "100%"
    });

    ids.forEach((id) => {
      const flirt = FLIRTS[id];

      const card =
        document.createElement("div");

      Object.assign(card.style, {
        minHeight: "95px",
        padding: "9px",
        border: "2px solid #d58eb8",
        borderRadius: "8px",
        background:
          "linear-gradient(135deg,#3b2132,#17191f)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        textAlign: "left"
      });

      const source =
        sceneInstance.createDOMText?.(
          flirt.source,
          {
            fontSize: "4.7px",
            color: "#e88eb8"
          }
        ) ||
        document.createElement("div");

      const name =
        sceneInstance.createDOMText?.(
          flirt.name.toUpperCase(),
          {
            fontSize: "6.5px",
            color: "#fff0f6"
          }
        ) ||
        document.createElement("div");

      const description =
        sceneInstance.createDOMText?.(
          flirt.description,
          {
            fontSize: "5px",
            color: "#d7cbd2",
            lineHeight: "1.65"
          }
        ) ||
        document.createElement("div");

      if (!source.textContent) {
        source.textContent =
          flirt.source;
      }

      if (!name.textContent) {
        name.textContent =
          flirt.name.toUpperCase();
      }

      if (!description.textContent) {
        description.textContent =
          flirt.description;
      }

      card.append(
        source,
        name,
        description
      );

      grid.appendChild(card);
    });

    content.appendChild(grid);
  }

  function ensureFlirtsTab(sceneInstance) {
    const panel =
      sceneInstance.itemsModal?.panel;

    if (!panel) return;

    const existing =
      panel.querySelector(
        "[data-items-tab='flirts']"
      );

    if (existing) return;

    const acquaintances =
      panel.querySelector(
        "[data-items-tab='villains']"
      );

    const tabs =
      acquaintances?.parentElement ||
      panel.querySelector(
        "[data-items-tab='items']"
      )?.parentElement;

    if (!tabs) return;

    tabs.style.gridTemplateColumns =
      "repeat(4,minmax(0,1fr))";

    const button =
      sceneInstance.createDOMButton?.(
        "FLIRTS",
        () => {
          sceneInstance.itemsModalTab =
            "flirts";

          sceneInstance.renderItemsModalTab?.();
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

  function patchInventory(sceneInstance) {
    if (
      !sceneInstance ||
      sceneInstance.__flirtInventoryV45
    ) {
      return;
    }

    sceneInstance.__flirtInventoryV45 =
      true;

    if (
      typeof sceneInstance.renderItemsModalTab ===
      "function"
    ) {
      const originalRender =
        sceneInstance.renderItemsModalTab
          .bind(sceneInstance);

      sceneInstance.renderItemsModalTab =
        function renderItemsModalTabV45(
          ...args
        ) {
          if (
            this.itemsModalTab ===
            "flirts"
          ) {
            renderFlirtsTab(this);
            ensureFlirtsTab(this);
            return;
          }

          const result =
            originalRender(...args);

          ensureFlirtsTab(this);
          return result;
        };
    }

    if (
      typeof sceneInstance.openItemsModal ===
      "function"
    ) {
      const originalOpen =
        sceneInstance.openItemsModal
          .bind(sceneInstance);

      sceneInstance.openItemsModal =
        function openItemsModalV45(
          ...args
        ) {
          const result =
            originalOpen(...args);

          ensureFlirtsTab(this);

          if (
            this.itemsModalTab ===
            "flirts"
          ) {
            renderFlirtsTab(this);
          }

          return result;
        };
    }
  }

  // ---------------------------------------------------------------------------
  // DEVELOPER MODE AUDIT + NEW TEST TARGETS
  // Existing lion-choice / HB / post-milkman / Venice remain untouched.
  // Add direct HIVE and Zofingia checks for the new systems.
  // ---------------------------------------------------------------------------

  function addDeveloperTargets() {
    const list =
      document.querySelector(
        "#developer-menu-screen .dev-destinations"
      );

    if (!list) return;

    if (
      !list.querySelector(
        "[data-dev-target='hive-test']"
      )
    ) {
      const button =
        document.createElement("button");

      button.className =
        "dev-action dev-destination";
      button.type = "button";
      button.dataset.devTarget =
        "hive-test";

      button.innerHTML =
        '5. HIVE / FRAU' +
        '<small>Direkt HIVE-Steuerung, ersten Frauendialog, Beobachten, Flirts und Inventar testen.</small>';

      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();

          window.launchGame?.({
            startMode: "hive-test"
          });
        }
      );

      list.appendChild(button);
    }

    if (
      !list.querySelector(
        "[data-dev-target='zofingia-test']"
      )
    ) {
      const button =
        document.createElement("button");

      button.className =
        "dev-action dev-destination";
      button.type = "button";
      button.dataset.devTarget =
        "zofingia-test";

      button.innerHTML =
        '6. ZOFINGIA / ENRIQUE' +
        '<small>Direkt Zofingia, Enrique-Menüs, Coins und Flirt-Freischaltungen testen.</small>';

      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();

          window.launchGame?.({
            startMode: "zofingia-test"
          });
        }
      );

      list.appendChild(button);
    }
  }

  function startHiveDeveloper(
    gameInstance
  ) {
    let attempts = 0;

    const tryStart = () => {
      attempts += 1;

      const milk =
        scene(
          gameInstance,
          "MilchbuckScene"
        );

      const hive =
        scene(
          gameInstance,
          "HiveInteriorScene"
        );

      if (
        milk?.sys?.isActive?.() &&
        hive
      ) {
        hive.__leaving = false;
        hive.actionLocked = false;
        hive.modalOpen = false;
        hive.introDancing = false;

        milk.developerMode = true;
        milk.coins = 999999;
        milk.setUILocked?.(true);
        milk.scene.pause();

        gameInstance.scene.start(
          "HiveInteriorScene",
          {
            overworld: milk,
            simonDances: false
          }
        );

        return;
      }

      if (attempts < 120) {
        window.setTimeout(
          tryStart,
          80
        );
      }
    };

    window.setTimeout(
      tryStart,
      180
    );
  }

  function startZofingiaDeveloper(
    gameInstance
  ) {
    let attempts = 0;

    const tryOpen = () => {
      attempts += 1;

      const station =
        scene(
          gameInstance,
          "BahnhofquaiScene"
        );

      const zone =
        station?.__sv37Promenade?.zone;

      if (
        station?.sys?.isActive?.() &&
        zone?.active &&
        !station.uiLocked &&
        !station.tramTransitActive
      ) {
        station.developerMode = true;
        station.coins = 999999;
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
        window.setTimeout(
          tryOpen,
          100
        );
      }
    };

    window.setTimeout(
      tryOpen,
      350
    );
  }

  const previousStart =
    window.startSimonGame;

  if (
    typeof previousStart ===
    "function"
  ) {
    window.startSimonGame =
      function startSimonGameV45(
        options = {}
      ) {
        if (
          options.startMode ===
          "hive-test"
        ) {
          const g =
            previousStart.call(
              this,
              {
                ...options,
                startMode: "normal",
                developerMode: true
              }
            );

          if (g) {
            startHiveDeveloper(g);
          }

          return g;
        }

        if (
          options.startMode ===
          "zofingia-test"
        ) {
          const g =
            previousStart.call(
              this,
              {
                ...options,
                startMode: "hb",
                developerMode: true
              }
            );

          if (g) {
            startZofingiaDeveloper(
              g
            );
          }

          return g;
        }

        return previousStart.call(
          this,
          options
        );
      };
  }

  // ---------------------------------------------------------------------------
  // INSTALL LOOP
  // ---------------------------------------------------------------------------

  function install() {
    const g = game();
    if (!g?.scene) return;

    const milk =
      scene(g, "MilchbuckScene");

    const station =
      scene(g, "BahnhofquaiScene");

    const venice =
      scene(g, "VeniceScene");

    const hive =
      scene(g, "HiveInteriorScene");

    for (
      const world of
      [milk, station, venice]
    ) {
      if (!world) continue;

      attach(world);
      reconcilePlaybook(world);
      patchInventory(world);
      patchLionDance(world);
    }

    if (hive) {
      patchWoman(hive);

      if (hive.overworld) {
        attach(hive.overworld);
        patchInventory(
          hive.overworld
        );
      }
    }

    if (station) {
      patchEnrique(station);
    }
  }

  addDeveloperTargets();

  const loop = () => {
    install();
    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);

  window.SimonFlirtsV45 =
    Object.freeze({
      VERSION,
      FLIRTS,
      ENRIQUE_PAID,
      state,

      getLearned() {
        return state.learnedFlirts
          .filter(
            (id) => Boolean(FLIRTS[id])
          )
          .map((id) => ({
            id,
            name: FLIRTS[id].name,
            source:
              FLIRTS[id].source,
            description:
              FLIRTS[id].description
          }));
      },

      learn(id) {
        const g = game();

        const world =
          scene(
            g,
            "BahnhofquaiScene"
          ) ||
          scene(
            g,
            "MilchbuckScene"
          ) ||
          scene(
            g,
            "VeniceScene"
          );

        return learn(
          world,
          id,
          true
        );
      }
    });

  console.info(
    "Flirt-System v45 geladen: Quellen getrennt, Frau-Flow, Inventar und Developer-Tests."
  );
})();