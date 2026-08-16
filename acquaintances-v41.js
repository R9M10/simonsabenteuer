(() => {
  "use strict";

  if (window.__SIMON_ACQUAINTANCES_V41__) return;
  window.__SIMON_ACQUAINTANCES_V41__ = true;

  const CATEGORIES = Object.freeze({
    villains: {
      label: "BÖSEWICHTE",
      color: "#e06a72",
      dark: "#3b1d24",
      soft: "rgba(224,106,114,.16)"
    },
    women: {
      label: "FRAUEN",
      color: "#e88eb8",
      dark: "#3b2132",
      soft: "rgba(232,142,184,.15)"
    },
    friends: {
      label: "FREUNDE",
      color: "#78d9ab",
      dark: "#17352d",
      soft: "rgba(120,217,171,.14)"
    },
    other: {
      label: "SONSTIGE",
      color: "#8fb9e8",
      dark: "#1c2d42",
      soft: "rgba(143,185,232,.14)"
    }
  });

  const DEFINITIONS = {
    milkman: {
      name: "Milchmann",
      category: "villains",
      initials: "MM",
      description:
        "Ein rachsüchtiger Milchlieferant an der Bahnhofstrasse. Er verfolgt Simon mit seinem Milchwagen, wirft Milchflaschen und setzt regelmäßig besonders schnelle Super-Milch ein."
    },
    darkGandhi: {
      name: "Dark Gandhi",
      category: "villains",
      initials: "DG",
      description:
        "Gandhis dunkle Form. Dark Gandhi kämpft in drei Phasen mit Salzmarsch, Karma, Wiedergeburt, Nuklearangriffen und Ahimsa Inversion."
    },
    womanHive: {
      name: "Frau an der Bar",
      category: "women",
      initials: "FB",
      description:
        "Eine selbstbewusste Frau im HIVE. Simon kann sie beobachten, mit ihr reden und seine erlernten Flirts ausprobieren. Ob sie beeindruckt ist, hängt stark von seiner Wahl ab."
    },
    amsif: {
      name: "Amsif",
      category: "friends",
      initials: "A",
      description:
        "Ein alter Fußballbekannter von Simon. Nach dem Erlebnis mit den falschen Schueh eröffnete er einen Schuhladen in Zürich – doch Général hat seinen Ladenschlüssel gestohlen."
    },
    enrique: {
      name: "Enrique",
      category: "friends",
      initials: "E",
      description:
        "Simons Bekannter im Zofingia-Clubhaus. Enrique kennt sich mit Flirts aus, bringt Simon den zweiten Blick bei und weiß außerdem einiges über Général und Venedig."
    },
    lion: {
      name: "Der Löwe",
      category: "other",
      initials: "L",
      description:
        "Der Löwe vor dem HIVE. Nachdem die Türsteher ihn unterschätzt haben, fragt er Simon überraschend, ob er tanzen gehen will."
    },
    bouncers: {
      name: "Die Türsteher",
      category: "other",
      initials: "T5",
      description:
        "Die fünf Türsteher des HIVE. Eine Diskussion darüber, ob fünf Türsteher gegen einen Löwen gewinnen würden, eskaliert deutlich schneller als geplant."
    },
    indian: {
      name: "Der Inder",
      category: "other",
      initials: "IN",
      description:
        "Der Betreiber des Ladens „Der Inder“ an der Bahnhofstrasse. Simon lernt ihn kennen, sobald er den Laden zum ersten Mal anspricht."
    },
    gandhi: {
      name: "Gandhi",
      category: "other",
      initials: "G",
      description:
        "Gandhi begegnet Simon an der Bahnhofstrasse. Diese Begegnung entwickelt sich später in eine deutlich gefährlichere Richtung."
    },
    thomas: {
      name: "Thomas",
      category: "other",
      initials: "T",
      description:
        "Ein junger Mann in Venedig mit schwarzen Haaren und Dreitagebart. Er sitzt mit Karten am Tisch und fordert Simon zu einer Runde Pferderennen heraus."
    }
  };

  const state = window.__SIMON_ACQUAINTANCE_STATE_V41__ || { met: {} };
  if (!state.met || typeof state.met !== "object") state.met = {};
  window.__SIMON_ACQUAINTANCE_STATE_V41__ = state;

  let womanDialogueOverlay = null;

  function activeGame() {
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

  function mark(scene, key) {
    if (!DEFINITIONS[key]) return false;
    const fresh = !state.met[key];
    state.met[key] = true;
    if (scene) scene.acquaintancesMet = state.met;
    return fresh;
  }

  function infer(scene) {
    if (!scene) return;
    scene.acquaintancesMet = state.met;

    if (scene.gandhiStoryEligible) mark(scene, "milkman");
    if (
      scene.gandhiEncounterStarted ||
      scene.gandhiEncounterFinished ||
      scene.darkGandhiBossActive ||
      scene.darkGandhiDefeated
    ) {
      mark(scene, "gandhi");
    }
    if (scene.darkGandhiBossActive || scene.darkGandhiDefeated) {
      mark(scene, "darkGandhi");
    }
    if (scene.amsifEncounterStarted) mark(scene, "amsif");
    if (scene.enriqueSpoken || window.__SIMON_FLIRT_STATE_V40__?.enriqueIntroCompleted) {
      mark(scene, "enrique");
    }
    if (scene.fightFinished || scene.bouncerTipStolen) {
      mark(scene, "bouncers");
    }
    if (scene.lionChoiceShown || scene.lionCombatActive || scene.fightLion?.active) {
      mark(scene, "lion");
    }
  }

  function wrapMeetMethod(scene, methodName, acquaintanceKey) {
    if (!scene || typeof scene[methodName] !== "function") return;
    if (scene[methodName].__acquaintanceV41) return;

    const original = scene[methodName].bind(scene);
    const wrapped = function acquaintanceMeetWrapper(...args) {
      mark(this, acquaintanceKey);
      return original(...args);
    };
    wrapped.__acquaintanceV41 = true;
    scene[methodName] = wrapped;
  }

  function createPortrait(scene, key, size = 48) {
    const def = DEFINITIONS[key];
    const category = CATEGORIES[def?.category] || CATEGORIES.other;
    const portrait = document.createElement("div");
    Object.assign(portrait.style, {
      width: `${size}px`,
      height: `${size}px`,
      border: `2px solid ${category.color}`,
      borderRadius: "9px",
      background: category.dark,
      boxSizing: "border-box",
      display: "grid",
      placeItems: "center",
      color: category.color,
      fontFamily: '\"Press Start 2P\", monospace',
      fontSize: key === "bouncers" ? "8px" : "11px",
      boxShadow: `inset 0 0 14px ${category.soft}`
    });
    portrait.textContent = def?.initials || "?";
    return portrait;
  }

  function renderAcquaintances(scene, content) {
    infer(scene);
    content.replaceChildren();

    const knownKeys = Object.keys(DEFINITIONS).filter((key) => state.met[key]);
    if (!knownKeys.length) {
      content.appendChild(
        scene.createDOMText("NOCH KEINE BEKANNTSCHAFTEN", {
          fontSize: "7px",
          color: "#b8bec4",
          margin: "18px 0"
        })
      );
      return;
    }

    for (const categoryKey of ["villains", "women", "friends", "other"]) {
      const category = CATEGORIES[categoryKey];
      const keys = knownKeys.filter(
        (key) => DEFINITIONS[key].category === categoryKey
      );
      if (!keys.length) continue;

      const section = document.createElement("section");
      Object.assign(section.style, {
        margin: "0 0 13px",
        padding: "0"
      });

      const heading = scene.createDOMText(category.label, {
        fontSize: "7px",
        color: category.color,
        margin: "0 0 7px"
      });
      heading.style.textAlign = "left";
      heading.style.borderBottom = `2px solid ${category.color}`;
      heading.style.paddingBottom = "5px";

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        width: "100%"
      });

      keys.forEach((key) => {
        const def = DEFINITIONS[key];
        const card = document.createElement("div");
        Object.assign(card.style, {
          display: "grid",
          gridTemplateColumns: "50px minmax(0,1fr) 36px",
          gap: "7px",
          alignItems: "center",
          minHeight: "66px",
          padding: "7px",
          border: `2px solid ${category.color}`,
          borderRadius: "8px",
          background: `linear-gradient(135deg, ${category.dark}, #15191f)`,
          boxSizing: "border-box",
          boxShadow: `inset 0 0 16px ${category.soft}`
        });

        const portrait = createPortrait(scene, key, 46);
        const name = scene.createDOMText(def.name, {
          fontSize: "6.2px",
          color: "#f0edf0"
        });
        name.style.textAlign = "left";

        const info = scene.createDOMButton(
          "i",
          () => openInfo(scene, key),
          {
            color: category.color,
            background: category.dark,
            border: category.color,
            width: "34px",
            minHeight: "34px",
            fontSize: "11px",
            padding: "3px"
          }
        );

        card.append(portrait, name, info);
        grid.appendChild(card);
      });

      section.append(heading, grid);
      content.appendChild(section);
    }
  }

  function openInfo(scene, key) {
    const def = DEFINITIONS[key];
    if (!def || scene.villainInfoModal) return;
    const category = CATEGORIES[def.category];

    const modal = scene.createDOMModal({
      key: "acquaintance-info",
      width: "min(88%, 500px)",
      background: "#191c22",
      border: category.color,
      shade: "rgba(5, 5, 8, .72)",
      padding: "16px"
    });
    if (!modal) return;
    scene.villainInfoModal = modal;

    const categoryLabel = scene.createDOMText(category.label, {
      fontSize: "5px",
      color: category.color,
      margin: "0 0 7px"
    });
    const title = scene.createDOMText(def.name.toUpperCase(), {
      fontSize: "11px",
      color: "#f6f0e8",
      margin: "0 0 12px"
    });
    const description = scene.createDOMText(def.description, {
      fontSize: "6.3px",
      color: "#d2d3d7",
      lineHeight: "1.7",
      margin: "0 0 14px"
    });
    const close = scene.createDOMButton(
      "ZURÜCK",
      () => {
        if (!scene.villainInfoModal) return;
        scene.destroyDOMModal(scene.villainInfoModal);
        scene.villainInfoModal = null;
      },
      {
        color: "#f6f0e8",
        background: category.dark,
        border: category.color,
        minHeight: "38px",
        fontSize: "7px"
      }
    );
    modal.panel.append(categoryLabel, title, description, close);
  }

  function patchInventoryUI(scene) {
    if (!scene || scene.__acquaintanceInventoryV41) return;
    scene.__acquaintanceInventoryV41 = true;

    scene.renderVillainsTab = function renderAcquaintancesTabV41(content) {
      renderAcquaintances(this, content);
    };

    scene.openVillainInfo = function openAcquaintanceInfoV41(key) {
      openInfo(this, key);
    };

    if (typeof scene.openItemsModal === "function") {
      const originalOpen = scene.openItemsModal.bind(scene);
      scene.openItemsModal = function openItemsModalAcquaintancesV41(...args) {
        const result = originalOpen(...args);
        const tab = this.itemsModal?.panel?.querySelector?.(
          "[data-items-tab='villains']"
        );
        if (tab) tab.textContent = "BEKANNTSCHAFTEN";
        return result;
      };
    }
  }

  function clearWomanOverlay() {
    womanDialogueOverlay?.remove?.();
    womanDialogueOverlay = null;
  }

  function runWomanDanceDialogue(hive) {
    if (!hive?.player?.active || !hive?.womanSprite?.active) return;
    mark(hive.overworld, "womanHive");
    hive.closeModal?.();
    hive.actionLocked = true;

    const steps = [
      { speaker: "simon", text: "Hey Süessi, willsch tanze?" },
      { speaker: "woman", text: "Du bisch zwar nice..." },
      { speaker: "woman", text: "aber..." },
      { speaker: "woman", text: "nöd soooo nice." }
    ];
    let index = 0;

    const render = () => {
      const step = steps[index];
      if (!step) {
        clearWomanOverlay();
        hive.destroySpeechBubble?.();
        hive.stopSimonAction?.();
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.actionLocked = false;
        return;
      }

      hive.destroySpeechBubble?.();
      if (step.speaker === "simon") {
        hive.playSimonAction?.("simon-v14-talk", { loop: true });
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.showSpeechBubble?.(hive.player, step.text, 0);
      } else {
        hive.stopSimonAction?.();
        hive.womanSprite?.play?.(
          index >= 3 ? "woman-v14-reject" : "woman-v14-idle",
          true
        );
        hive.showSpeechBubble?.(hive.womanSprite, step.text, 0);
      }
    };

    clearWomanOverlay();
    const root = document.getElementById("phaser-game");
    if (!root) {
      hive.actionLocked = false;
      return;
    }

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "woman-dance-dialogue-v41";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "430000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation"
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
      if (now - lastAdvance < 280) return;
      lastAdvance = now;
      index += 1;
      render();
    };
    overlay.addEventListener("pointerdown", stop, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });
    root.appendChild(overlay);
    womanDialogueOverlay = overlay;
    render();
  }

  function patchHive(hive) {
    if (!hive) return;

    if (
      typeof hive.openWomanMenu === "function" &&
      !hive.openWomanMenu.__acquaintanceV41
    ) {
      const original = hive.openWomanMenu.bind(hive);
      const wrapped = function openWomanMenuAcquaintanceV41(...args) {
        mark(this.overworld, "womanHive");
        return original(...args);
      };
      wrapped.__acquaintanceV41 = true;
      hive.openWomanMenu = wrapped;
    }

    if (!hive.startRejectedDanceInvite?.__acquaintanceV41) {
      const replacement = function rejectedDanceInviteV41() {
        runWomanDanceDialogue(this);
      };
      replacement.__acquaintanceV41 = true;
      hive.startRejectedDanceInvite = replacement;
    }
  }

  function patchWorldScene(scene) {
    if (!scene) return;
    infer(scene);
    patchInventoryUI(scene);
    wrapMeetMethod(scene, "startBouncerDialogue", "bouncers");
    wrapMeetMethod(scene, "showLionChoiceQuestion", "lion");
    wrapMeetMethod(scene, "startMilkmanEncounter", "milkman");
    wrapMeetMethod(scene, "openIndianStorePrompt", "indian");
    wrapMeetMethod(scene, "startGandhiEncounter", "gandhi");
    wrapMeetMethod(scene, "startDarkGandhiBoss", "darkGandhi");
    wrapMeetMethod(scene, "startAmsifIntroDialogue", "amsif");
  }

  function install(game) {
    if (!game?.scene) return;
    const milk = getScene(game, "MilchbuckScene");
    const station = getScene(game, "BahnhofquaiScene");
    const venice = getScene(game, "VeniceScene");
    const hive = getScene(game, "HiveInteriorScene");

    [milk, station, venice].filter(Boolean).forEach(patchWorldScene);
    if (hive) patchHive(hive);

    if (station?.enriqueSpoken || window.__SIMON_FLIRT_STATE_V40__?.enriqueIntroCompleted) {
      mark(station, "enrique");
    }
  }

  const wrappedStart = window.startSimonGame;
  if (typeof wrappedStart === "function") {
    window.startSimonGame = function startSimonGameAcquaintancesV41(options = {}) {
      const game = wrappedStart.call(this, options);
      if (game) install(game);
      return game;
    };
  }

  const loop = () => {
    const game = activeGame();
    if (game) install(game);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.SimonAcquaintancesV41 = Object.freeze({
    definitions: DEFINITIONS,
    categories: CATEGORIES,
    state,
    mark(key) {
      return mark(null, key);
    },
    register(key, definition, { markNow = false } = {}) {
      if (!key || !definition?.name) return false;
      const category = CATEGORIES[definition.category]
        ? definition.category
        : "other";
      DEFINITIONS[key] = {
        initials: "?",
        description: "Simon hat diese Person kennengelernt.",
        ...definition,
        category
      };
      if (markNow) mark(null, key);
      return true;
    },
    getKnown() {
      return Object.keys(DEFINITIONS)
        .filter((key) => state.met[key])
        .map((key) => ({ key, ...DEFINITIONS[key] }));
    }
  });
})();
