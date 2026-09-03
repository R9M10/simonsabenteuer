(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V84__) return;
  window.__SIMON_BUGFIX_V84__ = true;

  const VERSION = 84;
  const OERLIKON_KEY = "OerlikonScene";
  const ESTHI_TEXTURE = "esthi-master-v75";
  const ESTHI_FILE = "esthi-master-v62.png";
  const COOP_DOOR_X = 2395;
  const ESTHI_X = 1830 + 92;

  const SWEETS = Object.freeze({
    peperoV84: Object.freeze({
      name: "Pepero",
      price: 15,
      short: "PP",
      accent: "#e75d63",
      dark: "#6f2730",
      description: "Koreanische Schokosticks. Beim Essen taucht Esthi auf."
    }),
    chocoPieV84: Object.freeze({
      name: "Choco Pie",
      price: 12,
      short: "CP",
      accent: "#c87a48",
      dark: "#5b3326",
      description: "Koreanischer Schoko-Kuchen-Snack. Beim Essen taucht Esthi auf."
    }),
    yakgwaV84: Object.freeze({
      name: "Yakgwa",
      price: 18,
      short: "YK",
      accent: "#d7a94b",
      dark: "#675020",
      description: "Süßes koreanisches Honiggebäck. Beim Essen taucht Esthi auf."
    })
  });

  const state = window.__SIMON_ESTHI_V84_STATE__ || {
    observed: false,
    esthiFlirtsTried: {},
    sweets: {
      peperoV84: 0,
      chocoPieV84: 0,
      yakgwaV84: 0
    },
    ethStoryTold: false,
    cutsceneActive: false
  };

  if (!state.esthiFlirtsTried || typeof state.esthiFlirtsTried !== "object") {
    state.esthiFlirtsTried = {};
  }
  if (!state.sweets || typeof state.sweets !== "object") state.sweets = {};
  Object.keys(SWEETS).forEach((key) => {
    state.sweets[key] = Math.max(0, Number(state.sweets[key]) || 0);
  });
  window.__SIMON_ESTHI_V84_STATE__ = state;

  const DIALOG_REPLACEMENTS = new Map([
    ["Excuse me... du weisst vielleicht, wo kaufen Waschmittel?", "Hoi... sorry, weisch du zufällig, wo ich Waschmittel chaufe cha?"],
    ["Ja. Für Kleider. Meine Kleider... Problem.", "Ja, für d'Wösch. Ich bin irgendwie komplett ohne Waschmittel hier."],
    ["Du zeigen?", "Zeigsch mer schnell, wo?"],
    ["Danke! Du wartest eine kleine Moment?", "Danke. Wartsch ganz churz uf mich?"],
    ["Ich kaufe dir etwas.", "Ich bring dir öppis mit."],
    ["Warten.", "Wart eifach."],
    ["Waschmittel. Und koreanische Süssigkeit.", "Waschmittel. Und koreanischi Süssigkeite. Viel wichtiger."],
    ["Okay. Jetzt Park.", "Okay... jetzt muesch mit in Park."],
    ["In Korea... wir machen so.", "In Korea macht mer das mängisch so."],
    ["Freunde füttern sich.", "Fründe gäbed sich öppis zum Probierä."],
    ["Mund auf.", "Mach mal de Mund uf."],
    ["Mund. Auf.", "Simon. Mund uf."],
    ["Du hast überall.", "Du hesch es jetzt überall."],
    ["Warte.", "Wart, ich mach das."],
    ["Jetzt sauber.", "So. Jetzt bisch wieder sauber."]
  ]);

  const FLIRT_LABELS = Object.freeze({
    secondLook: "DER ZWEITE BLICK",
    lorenzoVonMatterhorn: "LORENZO VON MATTERHORN",
    snasa: "SNASA",
    tedMosby: "THE TED MOSBY",
    accidentalPlusOne: "THE ACCIDENTAL PLUS-ONE",
    lostBet: "THE LOST BET",
    lastSeat: "THE LAST SEAT"
  });

  const FLIRT_DIALOGUES = Object.freeze({
    secondLook: [
      ["simon", "Ich ha nur nomal müesse luege."],
      ["esthi", "Ja, han ich gmerkt."],
      ["simon", "Und?"],
      ["esthi", "Mach nomal. Das isch irgendwie süess."]
    ],
    lorenzoVonMatterhorn: [
      ["simon", "Hoi. Lorenzo Von Matterhorn."],
      ["esthi", "Das tönt wie en Käse."],
      ["simon", "Ich bin ziemlich bekannt."],
      ["esthi", "Okay Lorenzo. Ich glaub dir gar nüt, aber ich mag's."]
    ],
    snasa: [
      ["simon", "Ich schaffe übrigens bi de SNASA."],
      ["esthi", "Secret NASA?"],
      ["simon", "Genau. Mir flüged uf de Smoon."],
      ["esthi", "Okay. Ich chum mit. Ich nimm Lineare Algebra mit."]
    ],
    tedMosby: [
      ["simon", "Eigentlich sötti hüt heirate."],
      ["esthi", "Oh."],
      ["simon", "Sie isch nöd cho."],
      ["esthi", "Das isch traurig. Aber wenn du jetzt frei bisch... guet für mich."]
    ],
    accidentalPlusOne: [
      ["simon", "Mini Begleitig isch grad verschwunde. Chunsch spontan mit?"],
      ["esthi", "Ja."],
      ["simon", "Du weisch nöd mal wohi."],
      ["esthi", "Ich weiss. Das macht's besser."]
    ],
    lostBet: [
      ["simon", "Ich ha e Wette verlore und muess jetzt die interessantischti Person frage, wie sie heisst."],
      ["esthi", "Du weisch doch, wie ich heisse."],
      ["simon", "Details."],
      ["esthi", "Sehr schlechte Wette. Aber richtige Person gfunde."]
    ],
    lastSeat: [
      ["simon", "Isch da no frei?"],
      ["esthi", "Simon, mir stönd."],
      ["simon", "Ja. Aber theoretisch."],
      ["esthi", "Theoretisch darfst du trotzdem näher stah."]
    ]
  });

  const LINEAR_ALGEBRA_QUESTIONS = Object.freeze([
    "Min Professor meint, ich mach z'viel Lineare Algebra. Findsch du, das git's überhaupt?",
    "Ich mach es neus YouTube-Video über Lineare Algebra. Wotsch du mich drin mit eifache Frage usfrage?",
    "Chasch du Lineare Algebra? Also... weisch du zum Beispiel, was e Matrix isch?",
    "Wenn du und ich zwei Vektore wäred: Wär das Lineare Algebra oder scho Dating?",
    "Meinsch du, Lineare Algebra hilft, wenn mer zwei Süssigkeite fair teile will?",
    "Ich ha mini Einkaufsliste mit Lineare Algebra sortiert. Findsch du das normal?",
    "Wenn ich bi Lineare Algebra immer nur 'Eigenwert' sage, merkt de Professor, dass ich nöd alles weiss?",
    "Isch es no Lineare Algebra, wenn ich bi de Determinante eifach rate?",
    "Chasch du mir Lineare Algebra erkläre, aber nur mit Pepero?",
    "Ich glaub, ich ha bi Lineare Algebra en Lieblingsvektor. Isch das peinlich?"
  ]);

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(key) {
    try { return getGame()?.scene?.getScene?.(key) || null; }
    catch { return null; }
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function getEsthiStoryState() {
    return (
      window.SimonEsthiOerlikonV57?.state ||
      window.__SIMON_ESTHI_OERLIKON_STATE_V57__ ||
      window.__SIMON_ESTHI_STATE_V52__ ||
      null
    );
  }

  function isSweet(key) {
    return Boolean(SWEETS[key]);
  }

  // =====================================================================
  // 1) ESTHI SPRITESHEET OFF — keep original procedural character
  // =====================================================================

  function restoreProceduralEsthi(scene) {
    const esthi = scene?.__esthiV57;
    if (!esthi) return;

    try {
      esthi.__npcSpriteV75?.destroy?.();
    } catch {}
    esthi.__npcSpriteV75 = null;

    const walk = (owner) => {
      owner?.list?.forEach?.((child) => {
        if (child?.type === "Graphics") {
          child.setVisible?.(true);
          child.setAlpha?.(1);
        }
        if (Array.isArray(child?.list)) walk(child);
      });
    };
    walk(esthi);

    if (scene?.textures?.exists?.(ESTHI_TEXTURE)) {
      try { scene.textures.remove(ESTHI_TEXTURE); } catch {}
    }
  }

  function suppressEsthiAssetLoad() {
    const proto = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene?.prototype;
    if (!proto || typeof proto.preload !== "function") return false;
    if (proto.preload.__esthiNoSpriteV84) return true;

    const previous = proto.preload;
    const wrapped = function preloadWithoutEsthiSpriteV84(...args) {
      const loader = this.load;
      const originalSpritesheet = loader?.spritesheet;

      if (loader && typeof originalSpritesheet === "function") {
        loader.spritesheet = function spritesheetV84(key, url, config) {
          if (
            String(key) === ESTHI_TEXTURE ||
            String(url || "").includes(ESTHI_FILE)
          ) {
            return loader;
          }
          return originalSpritesheet.call(loader, key, url, config);
        };
      }

      try {
        return previous.apply(this, args);
      } finally {
        if (loader && typeof originalSpritesheet === "function") {
          loader.spritesheet = originalSpritesheet;
        }
      }
    };

    wrapped.__esthiNoSpriteV84 = true;
    // Preserve the installer markers of the two older preload wrappers.
    // Otherwise their maintenance loops would wrap us again *after* v84 and
    // re-enable the Esthi spritesheet load. Both systems are already installed
    // by the time v84 runs, so marking the final wrapper is intentional.
    wrapped.__npcEssentialV75 = true;
    wrapped.__sceneFoundationV75 = true;
    proto.preload = wrapped;
    return true;
  }

  // =====================================================================
  // 2) ORIGINAL ESTHI STORY — replace only the awkward speech
  // =====================================================================

  function replaceTextNode(node) {
    if (!node || typeof node !== "object") return;

    if (typeof node.text === "string") {
      const next = DIALOG_REPLACEMENTS.get(node.text);
      if (next && next !== node.text) {
        try { node.setText?.(next); } catch {}
        try { node.text = next; } catch {}
      }
    }

    if (Array.isArray(node.list)) {
      node.list.forEach(replaceTextNode);
    }
  }

  function polishEsthiStoryText(scene) {
    scene?.children?.list?.forEach?.(replaceTextNode);
  }

  // =====================================================================
  // Shared dialogue / modal helpers
  // =====================================================================

  function unlockScene(scene) {
    if (!scene) return;
    scene.__esthiV84InteractionBusy = false;
    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();
    scene.setControlsVisible?.(true);
    if (scene.input) scene.input.enabled = true;
    if (scene.player?.body) scene.player.body.enable = true;
    scene.player?.setVelocity?.(0, 0);
  }

  function lockScene(scene) {
    if (!scene) return;
    scene.__esthiV84InteractionBusy = true;
    scene.player?.setVelocity?.(0, 0);
    scene.setUILocked?.(true);
    scene.uiLocked = true;
  }

  function removeDialogueOverlay() {
    document
      .querySelectorAll('#phaser-game [data-simon-ui="esthi-v84-dialogue"]')
      .forEach((node) => node.remove());
  }

  function runDialogue(scene, rawSteps, onFinish = null) {
    if (!scene?.sys?.isActive?.() || !Array.isArray(rawSteps) || !rawSteps.length) {
      onFinish?.();
      return;
    }

    removeDialogueOverlay();
    lockScene(scene);

    const root = document.getElementById("phaser-game");
    if (!root) {
      unlockScene(scene);
      onFinish?.();
      return;
    }

    const steps = rawSteps.map((step) => {
      if (Array.isArray(step)) return { speaker: step[0], text: step[1] };
      return step;
    });

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "esthi-v84-dialogue";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "740000",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer"
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
      position: "absolute",
      left: "50%",
      bottom: "76px",
      transform: "translateX(-50%)",
      width: "min(86%, 610px)",
      minHeight: "78px",
      boxSizing: "border-box",
      padding: "12px 15px",
      border: "3px solid #7b6346",
      borderRadius: "9px",
      background: "rgba(255,246,218,.97)",
      boxShadow: "0 5px 0 rgba(30,20,15,.48)",
      color: "#30251f",
      fontFamily: '"Press Start 2P", monospace'
    });

    const who = document.createElement("div");
    Object.assign(who.style, {
      marginBottom: "9px",
      color: "#8a493d",
      fontSize: "7px"
    });

    const line = document.createElement("div");
    Object.assign(line.style, {
      fontSize: "7px",
      lineHeight: "1.7",
      textAlign: "center"
    });

    const hint = document.createElement("div");
    hint.textContent = "KLICK · WEITER";
    Object.assign(hint.style, {
      marginTop: "9px",
      textAlign: "right",
      color: "#8b7968",
      fontSize: "4.7px"
    });

    card.append(who, line, hint);
    overlay.appendChild(card);
    root.appendChild(overlay);

    let index = 0;
    let last = -Infinity;

    const render = () => {
      const step = steps[index];
      if (!step) {
        overlay.remove();
        unlockScene(scene);
        onFinish?.();
        return;
      }

      const speaker = String(step.speaker || "").toLowerCase();
      who.textContent =
        speaker === "esthi"
          ? "ESTHI"
          : speaker === "thought"
            ? "SIMON · GEDANKE"
            : "SIMON";
      line.textContent = String(step.text || "");

      const esthi = scene.__esthiV57;
      if (scene.player?.active && esthi?.active) {
        scene.player.setFlipX?.(esthi.x < scene.player.x);
        esthi.setFlipX?.(scene.player.x < esthi.x);
      }
    };

    const advance = (event) => {
      stopEvent(event);
      const now = performance.now();
      if (now - last < 280) return;
      last = now;
      index += 1;
      render();
    };

    overlay.addEventListener("pointerdown", stopEvent, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });
    render();
  }

  function destroyEsthiMenu(scene) {
    if (!scene?.__esthiMenuV84) return;
    try { scene.destroyDOMModal?.(scene.__esthiMenuV84); } catch {}
    scene.__esthiMenuV84 = null;
  }

  function makeMenu(scene, title, width = "min(90%, 520px)") {
    destroyEsthiMenu(scene);
    lockScene(scene);

    const modal = scene.createDOMModal?.({
      key: "esthi-v84",
      width,
      background: "#eee3cb",
      border: "#825548",
      shade: "rgba(11,8,8,.62)",
      padding: "15px"
    });

    if (!modal) {
      unlockScene(scene);
      return null;
    }

    modal.overlay.style.zIndex = "735000";
    scene.__esthiMenuV84 = modal;

    const heading = scene.createDOMText?.(title, {
      fontSize: "12px",
      color: "#6e3d35",
      margin: "0 0 12px"
    });
    if (heading) modal.panel.appendChild(heading);
    return modal;
  }

  function addMenuButton(scene, parent, label, action, disabled = false) {
    const button = scene.createDOMButton?.(
      label,
      action,
      {
        color: disabled ? "#81766d" : "#fff3d8",
        background: disabled ? "#504b48" : "#765047",
        border: disabled ? "#77706b" : "#b68a72",
        minHeight: "42px",
        fontSize: "6px",
        padding: "7px"
      }
    );
    if (!button) return null;
    if (disabled) {
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.textDecoration = "line-through";
    }
    parent.appendChild(button);
    return button;
  }

  function closeEsthiMenu(scene) {
    destroyEsthiMenu(scene);
    unlockScene(scene);
  }

  // =====================================================================
  // 3) ESTHI AFTER INTRO — observe, talk, flirt
  // =====================================================================

  function observationSteps() {
    return [
      {
        speaker: "thought",
        text: "Sie wirkt, als hätte sie irgendwo zwischen Coop und ETH einen komplett eigenen Plan – und erstaunlich gute Laune dabei."
      }
    ];
  }

  function talkSteps() {
    return [
      ["simon", "Wie lauft's?"],
      ["esthi", "Eigentlich guet. Ich verstah mittlerweile fascht alles."],
      ["esthi", "Nur wenn Zürcher sehr schnell rede, tue ich eifach so, als hätt ich's verstande."],
      ["simon", "Funktioniert?"],
      ["esthi", "Erstaunlich guet."]
    ];
  }

  function learnedFlirts() {
    const flirtState =
      window.__SIMON_FLIRT_STATE_V46__ ||
      window.__SIMON_FLIRT_STATE_V40__ ||
      {};
    const ids = Array.isArray(flirtState.learnedFlirts)
      ? flirtState.learnedFlirts
      : [];
    return ids.filter((id) => FLIRT_LABELS[id]);
  }

  function runEsthiFlirt(scene, flirtId) {
    const steps = FLIRT_DIALOGUES[flirtId];
    if (!steps) return;
    state.esthiFlirtsTried[flirtId] = true;
    destroyEsthiMenu(scene);
    runDialogue(scene, steps, () => openEsthiMainMenu(scene));
  }

  function openEsthiFlirtMenu(scene) {
    const modal = makeMenu(scene, "MIT ESTHI FLIRTEN", "min(92%, 570px)");
    if (!modal) return;

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    const ids = learnedFlirts();
    if (!ids.length) {
      const empty = scene.createDOMText?.(
        "Du kennsch no kei Flirts. Enrique würd das wahrscheinlich dramatisch finde.",
        {
          fontSize: "6px",
          color: "#584a43",
          lineHeight: "1.7",
          margin: "5px 0 10px"
        }
      );
      if (empty) list.appendChild(empty);
    }

    ids.forEach((id) => {
      addMenuButton(
        scene,
        list,
        FLIRT_LABELS[id],
        () => runEsthiFlirt(scene, id),
        false
      );
    });

    addMenuButton(scene, list, "← ZURÜCK", () => openEsthiMainMenu(scene));
    modal.panel.appendChild(list);
  }

  function openEsthiMainMenu(scene) {
    const modal = makeMenu(scene, "ESTHI");
    if (!modal) return;

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "8px"
    });

    addMenuButton(scene, list, "BEOBACHTEN", () => {
      state.observed = true;
      destroyEsthiMenu(scene);
      runDialogue(scene, observationSteps(), () => openEsthiMainMenu(scene));
    });

    addMenuButton(scene, list, "REDEN", () => {
      destroyEsthiMenu(scene);
      runDialogue(scene, talkSteps(), () => openEsthiMainMenu(scene));
    });

    addMenuButton(scene, list, "FLIRTEN", () => openEsthiFlirtMenu(scene));
    addMenuButton(scene, list, "ZURÜCK", () => closeEsthiMenu(scene));
    modal.panel.appendChild(list);
  }

  function interactWithEsthi(scene) {
    const story = getEsthiStoryState();
    if (!story?.introCompleted || scene.__esthiStoryActive || scene.__esthiV84InteractionBusy) {
      return;
    }

    if (!state.observed) {
      state.observed = true;
      runDialogue(scene, observationSteps());
      return;
    }

    openEsthiMainMenu(scene);
  }

  function ensureEsthiInteraction(scene) {
    const story = getEsthiStoryState();
    const esthi = scene?.__esthiV57;

    if (!story?.introCompleted || !esthi?.active || esthi.visible === false) {
      scene?.__esthiZoneV84?.setVisible?.(false);
      if (scene?.__esthiZoneV84?.input) scene.__esthiZoneV84.input.enabled = false;
      return;
    }

    let zone = scene.__esthiZoneV84;
    if (!zone?.active) {
      zone = scene.add.zone(esthi.x, esthi.y - 62, 104, 140)
        .setDepth(260)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        if (
          !scene.player?.active ||
          scene.__esthiStoryActive ||
          scene.__esthiV84InteractionBusy ||
          Math.abs(scene.player.x - esthi.x) > 190
        ) {
          return;
        }
        interactWithEsthi(scene);
      });

      scene.__esthiZoneV84 = zone;
    }

    zone.setPosition(esthi.x, esthi.y - 62);
    zone.setVisible(true);
    if (zone.input) zone.input.enabled = !scene.__esthiStoryActive;
  }

  // =====================================================================
  // 4) KOREAN SWEETS AS REAL INVENTORY/HOTBAR ITEMS
  // =====================================================================

  function makeSweetDOMIcon(key, size = 44) {
    const def = SWEETS[key];
    const outer = document.createElement("div");
    Object.assign(outer.style, {
      width: `${size}px`,
      height: `${size}px`,
      display: "grid",
      placeItems: "center",
      margin: "0 auto",
      position: "relative"
    });

    const pack = document.createElement("div");
    Object.assign(pack.style, {
      width: key === "peperoV84" ? "17px" : "28px",
      height: key === "peperoV84" ? "34px" : "28px",
      borderRadius: key === "chocoPieV84" ? "50%" : "5px",
      border: `2px solid ${def.dark}`,
      background: def.accent,
      color: "#fff9e9",
      display: "grid",
      placeItems: "center",
      boxSizing: "border-box",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      boxShadow: "2px 2px 0 rgba(0,0,0,.25)"
    });
    pack.textContent = def.short;
    outer.appendChild(pack);
    return outer;
  }

  function makeSweetWorldIcon(scene, key, x, y, scale = 1) {
    const def = SWEETS[key];
    const icon = scene.add.container(x, y);
    const g = scene.add.graphics();
    const color = Number.parseInt(def.accent.slice(1), 16);
    const dark = Number.parseInt(def.dark.slice(1), 16);

    if (key === "peperoV84") {
      g.fillStyle(color, 1);
      g.fillRoundedRect(-8, -18, 16, 36, 4);
      g.lineStyle(2, dark, 1);
      g.strokeRoundedRect(-8, -18, 16, 36, 4);
      g.fillStyle(0xf1cf8c, 1);
      [-4, 0, 4].forEach((dx) => g.fillRect(dx - 1, -12, 2, 22));
    } else if (key === "chocoPieV84") {
      g.fillStyle(color, 1);
      g.fillCircle(0, 0, 15);
      g.lineStyle(3, dark, 1);
      g.strokeCircle(0, 0, 15);
      g.fillStyle(0xf4ead4, 1);
      g.fillCircle(0, 0, 5);
    } else {
      g.fillStyle(color, 1);
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        g.fillCircle(Math.cos(angle) * 8, Math.sin(angle) * 8, 7);
      }
      g.fillStyle(0xe8c770, 1);
      g.fillCircle(0, 0, 8);
      g.lineStyle(2, dark, 1);
      g.strokeCircle(0, 0, 15);
    }

    icon.add(g);
    icon.setScale(scale);
    return icon;
  }

  function appendSweetsToInventory(scene) {
    if (!scene?.itemsModal || scene.itemsModalTab !== "items") return;
    const content =
      scene.itemsModalContent ||
      scene.itemsModal?.panel?.querySelector?.("[data-items-content='true']");
    if (!content || content.querySelector?.("[data-v84-sweets='true']")) return;

    const owned = Object.keys(SWEETS).filter((key) => state.sweets[key] > 0);
    if (!owned.length) return;

    const section = document.createElement("div");
    section.dataset.v84Sweets = "true";
    Object.assign(section.style, {
      marginTop: "12px",
      paddingTop: "10px",
      borderTop: "2px solid #a56a62"
    });

    const heading = scene.createDOMText?.("KOREANISCHE SÜSSIGKEITEN", {
      fontSize: "7px",
      color: "#e49c91",
      margin: "0 0 8px"
    });
    if (heading) section.appendChild(heading);

    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(3,minmax(0,1fr))",
      gap: "7px"
    });

    owned.forEach((key) => {
      const def = SWEETS[key];
      const card = document.createElement("div");
      Object.assign(card.style, {
        padding: "7px",
        border: "2px solid #76574f",
        borderRadius: "7px",
        background: "#2c2627",
        color: "#fff0de",
        textAlign: "center"
      });

      card.appendChild(makeSweetDOMIcon(key, 38));
      const name = scene.createDOMText?.(`${def.name.toUpperCase()} ×${state.sweets[key]}`, {
        fontSize: "5px",
        color: "#fff0de",
        margin: "5px 0"
      });
      if (name) card.appendChild(name);

      const inBar = scene.hotbarItems?.includes?.(key);
      const button = scene.createDOMButton?.(
        inBar ? "RAUS" : "HOTBAR",
        () => {
          scene.toggleItemInHotbar?.(key);
          scene.renderItemsModalTab?.();
        },
        {
          color: "#fff3dc",
          background: "#70463e",
          border: "#ba7e6d",
          minHeight: "30px",
          fontSize: "5px",
          padding: "4px"
        }
      );
      if (button) card.appendChild(button);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    content.appendChild(section);
  }

  function patchBaseItemSystem() {
    const proto = window.__SIMON_SCENE_CLASSES__?.MilchbuckScene?.prototype;
    if (!proto || proto.__esthiSweetsV84) return Boolean(proto);

    if (typeof proto.getItemDefinition === "function") {
      const previous = proto.getItemDefinition;
      proto.getItemDefinition = function getItemDefinitionV84(key) {
        if (SWEETS[key]) {
          const def = SWEETS[key];
          return {
            name: def.name,
            type: "koreanSweet",
            price: def.price,
            effectLabel: "ESTHI-EVENT",
            description: def.description
          };
        }
        return previous.call(this, key);
      };
    }

    if (typeof proto.getItemCount === "function") {
      const previous = proto.getItemCount;
      proto.getItemCount = function getItemCountV84(key) {
        if (SWEETS[key]) return Math.max(0, Number(state.sweets[key]) || 0);
        return previous.call(this, key);
      };
    }

    if (typeof proto.createDOMItemIcon === "function") {
      const previous = proto.createDOMItemIcon;
      proto.createDOMItemIcon = function createDOMItemIconV84(key, size = 44) {
        if (SWEETS[key]) return makeSweetDOMIcon(key, size);
        return previous.call(this, key, size);
      };
    }

    if (typeof proto.createWorldItemIcon === "function") {
      const previous = proto.createWorldItemIcon;
      proto.createWorldItemIcon = function createWorldItemIconV84(key, x = 0, y = 0, scale = 1) {
        if (SWEETS[key]) return makeSweetWorldIcon(this, key, x, y, scale);
        return previous.call(this, key, x, y, scale);
      };
    }

    if (typeof proto.equipItemToHotbar === "function") {
      const previous = proto.equipItemToHotbar;
      proto.equipItemToHotbar = function equipItemToHotbarV84(key) {
        if (SWEETS[key]) return this.addItemToHotbar?.(key) || false;
        return previous.call(this, key);
      };
    }

    if (typeof proto.consumeHotbarItem === "function") {
      const previous = proto.consumeHotbarItem;
      proto.consumeHotbarItem = function consumeHotbarItemV84(index) {
        const key = this.hotbarItems?.[index];
        if (SWEETS[key]) {
          consumeSweet(this, key);
          return;
        }
        return previous.call(this, index);
      };
    }

    if (typeof proto.renderItemsModalTab === "function") {
      const previous = proto.renderItemsModalTab;
      proto.renderItemsModalTab = function renderItemsModalTabV84(...args) {
        const result = previous.apply(this, args);
        appendSweetsToInventory(this);
        return result;
      };
    }

    proto.__esthiSweetsV84 = true;
    return true;
  }

  // =====================================================================
  // COOP INTERIOR + SHOP
  // =====================================================================

  function removeCoopOverlay(scene) {
    document
      .querySelectorAll('#phaser-game [data-simon-ui="coop-v84-room"]')
      .forEach((node) => node.remove());
    scene.__coopOpenV84 = false;
  }

  function updateCoopWallet(scene, room) {
    room?.querySelectorAll?.("[data-coop-wallet-v84]").forEach((node) => {
      node.textContent = scene.developerMode ? "COINS: ∞" : `COINS: ${Number(scene.coins) || 0}`;
    });
  }

  function buySweet(scene, room, key) {
    const def = SWEETS[key];
    if (!def) return;
    const coins = Number(scene.coins) || 0;
    const status = room?.querySelector?.("[data-coop-status-v84]");

    if (!scene.developerMode && coins < def.price) {
      if (status) {
        status.textContent = "ZU WENIG COINS";
        status.style.color = "#ffb2a5";
      }
      return;
    }

    if (!scene.developerMode) scene.coins = coins - def.price;
    state.sweets[key] = Math.max(0, Number(state.sweets[key]) || 0) + 1;
    scene.updateCoinHUD?.();

    const equipped = scene.addItemToHotbar?.(key);
    scene.refreshHotbar?.();
    scene.updateInventoryUI?.();

    if (status) {
      status.textContent = equipped
        ? `${def.name.toUpperCase()} GEKAUFT · IN HOTBAR`
        : `${def.name.toUpperCase()} GEKAUFT · HOTBAR VOLL`;
      status.style.color = "#d9f0b6";
    }
    updateCoopWallet(scene, room);

    room?.querySelectorAll?.(`[data-coop-count-v84="${key}"]`).forEach((node) => {
      node.textContent = `IM INVENTAR: ${state.sweets[key]}`;
    });
  }

  function exitCoop(scene) {
    removeCoopOverlay(scene);
    scene.player?.setVisible?.(true);
    scene.player?.setActive?.(true);
    scene.player?.setVelocity?.(0, 0);
    if (scene.player?.body) scene.player.body.enable = true;
    scene.player?.play?.("simon-idle", true);
    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();
    scene.setControlsVisible?.(true);
    if (scene.input) scene.input.enabled = true;
    scene.cameras?.main?.startFollow?.(scene.player, true, 0.11, 0.11);
    scene.cameras?.main?.setDeadzone?.(240, 80);
  }

  function enterCoop(scene) {
    if (!scene?.sys?.isActive?.() || scene.__coopOpenV84) return;

    if (scene.__coopPromptV84) {
      try { scene.destroyDOMModal?.(scene.__coopPromptV84); } catch {}
      scene.__coopPromptV84 = null;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    scene.__coopOpenV84 = true;
    scene.player?.setVelocity?.(0, 0);
    scene.player?.setVisible?.(false);
    scene.setUILocked?.(true);
    scene.uiLocked = true;
    scene.setControlsVisible?.(false);

    const room = document.createElement("div");
    room.dataset.simonUi = "coop-v84-room";
    Object.assign(room.style, {
      position: "absolute",
      inset: "0",
      zIndex: "860000",
      overflow: "hidden",
      background: "linear-gradient(180deg,#efe7d7 0 21%,#d7d1c5 21% 76%,#9c9182 76% 100%)",
      pointerEvents: "auto",
      fontFamily: '"Press Start 2P", monospace'
    });

    const header = document.createElement("div");
    header.textContent = "COOP OERLIKON";
    Object.assign(header.style, {
      position: "absolute",
      left: "0",
      right: "0",
      top: "0",
      height: "58px",
      display: "grid",
      placeItems: "center",
      background: "#e9502d",
      color: "#fff7e2",
      fontSize: "17px",
      borderBottom: "8px solid #f3a138",
      textShadow: "3px 3px 0 rgba(90,34,20,.45)"
    });

    const aisle = document.createElement("div");
    Object.assign(aisle.style, {
      position: "absolute",
      left: "7%",
      right: "7%",
      top: "84px",
      bottom: "54px",
      padding: "13px",
      boxSizing: "border-box",
      border: "4px solid #8b7b69",
      borderRadius: "9px",
      background: "linear-gradient(#76695c 0 8px,#c7bbaa 8px 31%,#76695c 31% 35%,#c7bbaa 35% 62%,#76695c 62% 66%,#c7bbaa 66% 100%)",
      boxShadow: "inset 0 0 0 7px rgba(255,255,255,.12)"
    });

    const shelfTitle = document.createElement("div");
    shelfTitle.textContent = "KOREA REGAL · SÜSSIGKEITEN";
    Object.assign(shelfTitle.style, {
      margin: "0 auto 12px",
      width: "fit-content",
      padding: "7px 10px",
      background: "#263c4a",
      border: "3px solid #d5dce0",
      color: "#fff1c9",
      fontSize: "8px"
    });

    const wallet = document.createElement("div");
    wallet.dataset.coopWalletV84 = "true";
    wallet.textContent = scene.developerMode ? "COINS: ∞" : `COINS: ${Number(scene.coins) || 0}`;
    Object.assign(wallet.style, {
      textAlign: "center",
      marginBottom: "9px",
      color: "#3a3029",
      fontSize: "6px"
    });

    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(3,minmax(0,1fr))",
      gap: "10px",
      maxWidth: "650px",
      margin: "0 auto"
    });

    Object.entries(SWEETS).forEach(([key, def]) => {
      const card = document.createElement("div");
      Object.assign(card.style, {
        minHeight: "150px",
        padding: "9px",
        boxSizing: "border-box",
        border: `3px solid ${def.dark}`,
        borderRadius: "8px",
        background: "rgba(255,249,229,.96)",
        color: "#382b27",
        textAlign: "center",
        boxShadow: "3px 4px 0 rgba(65,48,38,.3)"
      });

      card.appendChild(makeSweetDOMIcon(key, 54));

      const title = document.createElement("div");
      title.textContent = def.name.toUpperCase();
      Object.assign(title.style, { fontSize: "7px", margin: "4px 0 6px" });

      const price = document.createElement("div");
      price.textContent = `${def.price} COINS`;
      Object.assign(price.style, { fontSize: "6px", color: "#76523a", marginBottom: "5px" });

      const count = document.createElement("div");
      count.dataset.coopCountV84 = key;
      count.textContent = `IM INVENTAR: ${state.sweets[key]}`;
      Object.assign(count.style, { fontSize: "4.8px", color: "#71645a", marginBottom: "7px" });

      const buy = document.createElement("button");
      buy.textContent = "KAUFEN";
      Object.assign(buy.style, {
        minWidth: "90px",
        minHeight: "34px",
        border: `3px solid ${def.dark}`,
        background: def.accent,
        color: "#fff9ea",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        cursor: "pointer",
        touchAction: "manipulation"
      });
      buy.addEventListener("click", (event) => {
        stopEvent(event);
        buySweet(scene, room, key);
      });

      card.append(title, price, count, buy);
      grid.appendChild(card);
    });

    const status = document.createElement("div");
    status.dataset.coopStatusV84 = "true";
    Object.assign(status.style, {
      marginTop: "10px",
      minHeight: "18px",
      textAlign: "center",
      fontSize: "5px",
      color: "#50633d"
    });

    aisle.append(shelfTitle, wallet, grid, status);

    const street = document.createElement("button");
    street.textContent = "← STRASSE";
    Object.assign(street.style, {
      position: "absolute",
      left: "12px",
      top: "12px",
      zIndex: "3",
      minHeight: "38px",
      padding: "7px 10px",
      border: "3px solid #fff2ce",
      background: "#9c3324",
      color: "#fff5db",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      cursor: "pointer"
    });
    street.addEventListener("click", (event) => {
      stopEvent(event);
      exitCoop(scene);
    });

    room.append(header, aisle, street);
    root.appendChild(room);
  }

  function openCoopPrompt(scene) {
    if (
      !scene?.sys?.isActive?.() ||
      scene.__coopOpenV84 ||
      scene.__coopPromptV84 ||
      scene.__esthiStoryActive ||
      scene.__esthiV84InteractionBusy ||
      scene.uiLocked
    ) {
      return;
    }

    lockScene(scene);
    const modal = scene.createDOMModal?.({
      key: "coop-entry-v84",
      width: "min(86%, 390px)",
      background: "#f2eadb",
      border: "#d94b2e",
      shade: "rgba(7,8,10,.6)",
      padding: "17px"
    });

    if (!modal) {
      unlockScene(scene);
      return;
    }
    modal.overlay.style.zIndex = "730000";
    scene.__coopPromptV84 = modal;

    const title = scene.createDOMText?.("COOP OERLIKON", {
      fontSize: "13px",
      color: "#cf442b",
      margin: "0 0 10px"
    });
    const q = scene.createDOMText?.("Reingehen?", {
      fontSize: "8px",
      color: "#3c332e",
      margin: "0 0 14px"
    });

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "9px"
    });

    const yes = scene.createDOMButton?.("JA", () => {
      destroyEsthiMenu(scene);
      try { scene.destroyDOMModal?.(scene.__coopPromptV84); } catch {}
      scene.__coopPromptV84 = null;
      scene.__esthiV84InteractionBusy = false;
      enterCoop(scene);
    }, {
      color: "#fff",
      background: "#d94b2e",
      border: "#f09b70",
      fontSize: "8px"
    });

    const no = scene.createDOMButton?.("NEIN", () => {
      try { scene.destroyDOMModal?.(scene.__coopPromptV84); } catch {}
      scene.__coopPromptV84 = null;
      unlockScene(scene);
    }, {
      color: "#3c332e",
      background: "#d7cfc3",
      border: "#8f8174",
      fontSize: "8px"
    });

    if (yes) row.appendChild(yes);
    if (no) row.appendChild(no);
    if (title) modal.panel.appendChild(title);
    if (q) modal.panel.appendChild(q);
    modal.panel.appendChild(row);
  }

  function ensureCoopInteraction(scene) {
    if (!scene?.sys?.isActive?.()) return;
    let zone = scene.__coopZoneV84;
    if (!zone?.active) {
      zone = scene.add.zone(COOP_DOOR_X, 255, 126, 150)
        .setDepth(270)
        .setInteractive({ useHandCursor: true });
      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        if (
          !scene.player?.active ||
          Math.abs(scene.player.x - COOP_DOOR_X) > 190 ||
          scene.__esthiStoryActive
        ) {
          return;
        }
        openCoopPrompt(scene);
      });
      scene.__coopZoneV84 = zone;

      const marker = scene.createPulsingInteractionMarker?.(COOP_DOOR_X, 286, 176);
      scene.__coopMarkerV84 = marker || null;
    }

    const enabled = Boolean(
      scene.arrivalFinished !== false &&
      !scene.__esthiStoryActive &&
      !scene.__coopOpenV84 &&
      !scene.__esthiV84InteractionBusy
    );
    if (zone.input) zone.input.enabled = enabled;
    scene.__coopMarkerV84?.setVisible?.(enabled);
  }

  // =====================================================================
  // WORLD-INDEPENDENT ESTHI SWEETS CUTSCENE
  // =====================================================================

  function findInventoryWorld() {
    const game = getGame();
    if (!game?.scene) return null;

    const active = game.scene.getScenes?.(true) || [];
    for (const scene of active) {
      const candidates = [
        scene,
        scene.overworld,
        scene.outdoorScene,
        scene.hallScene?.outdoorScene,
        scene.worldScene,
        scene.parentScene
      ];
      for (const candidate of candidates) {
        if (
          candidate?.hotbarItems &&
          typeof candidate.getItemCount === "function" &&
          typeof candidate.getItemDefinition === "function"
        ) {
          return candidate;
        }
      }
    }

    for (const scene of Object.values(game.scene.keys || {})) {
      if (
        scene?.hotbarItems &&
        typeof scene.getItemCount === "function" &&
        typeof scene.getItemDefinition === "function"
      ) {
        return scene;
      }
    }
    return null;
  }

  function activeVisualScene() {
    const scenes = getGame()?.scene?.getScenes?.(true) || [];
    return scenes.find((scene) => scene?.player?.active) || scenes[0] || null;
  }

  function lockForCutscene(world) {
    const visual = activeVisualScene();
    const saved = {
      world,
      visual,
      worldUiLocked: Boolean(world?.uiLocked),
      visualUiLocked: Boolean(visual?.uiLocked),
      visualActionLocked: Boolean(visual?.actionLocked)
    };

    world?.player?.setVelocity?.(0, 0);
    visual?.player?.setVelocity?.(0, 0);
    if (world) {
      world.uiLocked = true;
      world.setUILocked?.(true);
    }
    if (visual && visual !== world) {
      visual.uiLocked = true;
      if ("actionLocked" in visual) visual.actionLocked = true;
    }
    return saved;
  }

  function restoreAfterCutscene(saved) {
    const { world, visual } = saved || {};
    if (world) {
      world.uiLocked = Boolean(saved.worldUiLocked);
      world.setUILocked?.(Boolean(saved.worldUiLocked));
      world.refreshUILock?.();
      if (!saved.worldUiLocked) world.setControlsVisible?.(true);
      world.player?.setVelocity?.(0, 0);
    }
    if (visual && visual !== world) {
      visual.uiLocked = Boolean(saved.visualUiLocked);
      if ("actionLocked" in visual) visual.actionLocked = Boolean(saved.visualActionLocked);
      visual.player?.setVelocity?.(0, 0);
    }
  }

  function makeCutsceneCharacter(name) {
    const character = document.createElement("div");
    character.dataset.character = name.toLowerCase();
    Object.assign(character.style, {
      position: "absolute",
      bottom: "24px",
      width: "74px",
      height: "142px",
      transition: "transform 500ms ease, left 500ms ease, opacity 400ms ease",
      imageRendering: "pixelated"
    });

    const head = document.createElement("div");
    Object.assign(head.style, {
      position: "absolute",
      left: "21px",
      top: "3px",
      width: "34px",
      height: "38px",
      borderRadius: "40% 40% 45% 45%",
      background: name === "Esthi" ? "#d7a581" : "#e2bd8b",
      border: "3px solid #302927",
      boxSizing: "border-box"
    });

    const hair = document.createElement("div");
    Object.assign(hair.style, {
      position: "absolute",
      left: name === "Esthi" ? "-5px" : "-3px",
      top: "-8px",
      width: name === "Esthi" ? "43px" : "39px",
      height: name === "Esthi" ? "27px" : "20px",
      borderRadius: "48% 48% 30% 30%",
      background: name === "Esthi" ? "#211d20" : "#d8b364",
      border: "2px solid #302927",
      boxSizing: "border-box"
    });
    head.appendChild(hair);

    const torso = document.createElement("div");
    Object.assign(torso.style, {
      position: "absolute",
      left: "13px",
      top: "40px",
      width: "49px",
      height: "65px",
      border: "3px solid #302927",
      borderRadius: "8px",
      boxSizing: "border-box",
      background: name === "Esthi"
        ? "linear-gradient(90deg,#d7c9ad 0 28%,#a8c9d7 28% 72%,#d7c9ad 72%)"
        : "repeating-linear-gradient(90deg,#f0d35d 0 8px,#111827 8px 16px,#e6e4db 16px 24px)"
    });

    const legs = document.createElement("div");
    Object.assign(legs.style, {
      position: "absolute",
      left: "19px",
      top: "101px",
      width: "37px",
      height: "39px",
      borderLeft: "12px solid #28313d",
      borderRight: "12px solid #28313d",
      boxSizing: "border-box"
    });

    const label = document.createElement("div");
    label.textContent = name.toUpperCase();
    Object.assign(label.style, {
      position: "absolute",
      left: "50%",
      bottom: "-15px",
      transform: "translateX(-50%)",
      color: "#fff0d5",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px",
      textShadow: "2px 2px 0 #2d2522"
    });

    character.append(head, torso, legs, label);
    return character;
  }

  function playSweetCutscene(world, key) {
    if (state.cutsceneActive || !SWEETS[key]) return;
    const root = document.getElementById("phaser-game");
    if (!root) return;

    state.cutsceneActive = true;
    const saved = lockForCutscene(world);
    const first = !state.ethStoryTold;
    const def = SWEETS[key];

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "esthi-sweets-cutscene-v84";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "995000",
      background: "rgba(16,18,23,.80)",
      pointerEvents: "auto",
      touchAction: "manipulation",
      fontFamily: '"Press Start 2P", monospace'
    });

    const stage = document.createElement("div");
    Object.assign(stage.style, {
      position: "absolute",
      left: "6%",
      right: "6%",
      top: "9%",
      bottom: "20%",
      overflow: "hidden",
      border: "4px solid #e5d7b5",
      borderRadius: "10px",
      background: "linear-gradient(180deg,#7eb7cb 0 55%,#a9a298 55% 100%)",
      boxShadow: "0 6px 0 rgba(0,0,0,.45)"
    });

    const simon = makeCutsceneCharacter("Simon");
    simon.style.left = "31%";
    const esthi = makeCutsceneCharacter("Esthi");
    esthi.style.left = "110%";
    esthi.style.opacity = "0";
    stage.append(simon, esthi);

    const snack = document.createElement("div");
    snack.textContent = def.name.toUpperCase();
    Object.assign(snack.style, {
      position: "absolute",
      left: "50%",
      bottom: "55px",
      transform: "translateX(-50%) scale(.5)",
      opacity: "0",
      padding: "8px 10px",
      border: `3px solid ${def.dark}`,
      borderRadius: "7px",
      background: def.accent,
      color: "#fff7dc",
      fontSize: "6px",
      transition: "transform 300ms ease, opacity 300ms ease"
    });
    stage.appendChild(snack);

    const heart = document.createElement("div");
    heart.textContent = "♥";
    Object.assign(heart.style, {
      position: "absolute",
      left: "50%",
      top: "42px",
      transform: "translateX(-50%) scale(.4)",
      opacity: "0",
      color: "#ef6b82",
      fontFamily: "Georgia,serif",
      fontSize: "42px",
      transition: "transform 300ms ease, opacity 300ms ease"
    });
    stage.appendChild(heart);

    const bubble = document.createElement("div");
    Object.assign(bubble.style, {
      position: "absolute",
      left: "50%",
      bottom: "18px",
      transform: "translateX(-50%)",
      width: "min(88%,650px)",
      minHeight: "72px",
      padding: "11px 14px",
      boxSizing: "border-box",
      border: "3px solid #8b6b54",
      borderRadius: "9px",
      background: "#fff4d7",
      color: "#30251f",
      textAlign: "center"
    });

    const speaker = document.createElement("div");
    Object.assign(speaker.style, {
      color: "#9a5145",
      fontSize: "6px",
      marginBottom: "7px"
    });
    const text = document.createElement("div");
    Object.assign(text.style, {
      fontSize: "7px",
      lineHeight: "1.65"
    });
    const hint = document.createElement("div");
    hint.textContent = "KLICK · WEITER";
    Object.assign(hint.style, {
      marginTop: "7px",
      textAlign: "right",
      color: "#998779",
      fontSize: "4.5px"
    });
    bubble.append(speaker, text, hint);

    overlay.append(stage, bubble);
    root.appendChild(overlay);

    const linearQuestion = LINEAR_ALGEBRA_QUESTIONS[
      Math.floor(Math.random() * LINEAR_ALGEBRA_QUESTIONS.length)
    ];

    const lines = [
      { type: "enter" },
      {
        type: "line",
        who: "ESTHI",
        text: first
          ? "Simon? Hesch du koreanischi Süssigkeite ohni mich?"
          : "Hesch wieder öppis Koreanisches?"
      },
      { type: "line", who: "SIMON", text: first ? "Du bisch... wie bisch du überhaupt hier?" : "Du spürsch das wieder, oder?" },
      { type: "line", who: "ESTHI", text: first ? "Unwichtig. Gib her." : "Ja. Gib her." },
      { type: "eat" },
      { type: "line", who: "ESTHI", text: linearQuestion },
      { type: "line", who: "SIMON", text: "...Esthi." },
      { type: "kiss" },
      { type: "line", who: "ESTHI", text: "Okay. Antwort chasch mer nachher geh." }
    ];

    let index = 0;
    let actionRunning = false;
    let last = -Infinity;

    const finish = () => {
      overlay.remove();
      if (first) state.ethStoryTold = true;
      state.cutsceneActive = false;
      restoreAfterCutscene(saved);
      ensureSweetActionButton();
    };

    const render = () => {
      const step = lines[index];
      if (!step) {
        finish();
        return;
      }

      if (step.type === "line") {
        actionRunning = false;
        bubble.style.display = "block";
        speaker.textContent = step.who;
        text.textContent = step.text;
        hint.style.display = "block";
        return;
      }

      actionRunning = true;
      bubble.style.display = "none";

      if (step.type === "enter") {
        requestAnimationFrame(() => {
          esthi.style.left = "58%";
          esthi.style.opacity = "1";
        });
        window.setTimeout(() => {
          index += 1;
          actionRunning = false;
          render();
        }, 620);
        return;
      }

      if (step.type === "eat") {
        snack.style.opacity = "1";
        snack.style.transform = "translateX(-50%) scale(1)";
        simon.style.transform = "translateX(8px)";
        esthi.style.transform = "translateX(-8px)";
        window.setTimeout(() => {
          snack.style.opacity = "0";
          snack.style.transform = "translateX(-50%) scale(.5)";
          simon.style.transform = "";
          esthi.style.transform = "";
          index += 1;
          actionRunning = false;
          render();
        }, 900);
        return;
      }

      if (step.type === "kiss") {
        esthi.style.transform = "translateX(-46px) rotate(-3deg)";
        heart.style.opacity = "1";
        heart.style.transform = "translateX(-50%) scale(1.2)";
        window.setTimeout(() => {
          esthi.style.transform = "";
          heart.style.opacity = "0";
          heart.style.transform = "translateX(-50%) scale(.4)";
          index += 1;
          actionRunning = false;
          render();
        }, 980);
      }
    };

    const advance = (event) => {
      stopEvent(event);
      if (actionRunning) return;
      const now = performance.now();
      if (now - last < 260) return;
      last = now;
      index += 1;
      render();
    };

    overlay.addEventListener("pointerdown", stopEvent, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });
    render();
  }

  function consumeSweet(world, key) {
    if (!world || !SWEETS[key] || state.cutsceneActive) return;
    if (Math.max(0, Number(state.sweets[key]) || 0) <= 0) return;

    state.sweets[key] -= 1;
    if (state.sweets[key] <= 0) {
      world.removeItemFromHotbar?.(key);
    } else {
      world.refreshHotbar?.();
    }
    world.updateInventoryUI?.();
    world.updateHotbarActionUI?.();
    playSweetCutscene(world, key);
  }

  function ensureSweetActionButton() {
    const root = document.getElementById("phaser-game");
    if (!root) return;

    root.querySelectorAll('[data-simon-ui="sweet-action-v84"]').forEach((n) => n.remove());
    if (state.cutsceneActive) return;

    const world = findInventoryWorld();
    if (!world) return;
    const key = world.hotbarItems?.[world.selectedHotbarIndex];
    if (!SWEETS[key] || state.sweets[key] <= 0) return;

    // Don't put the action button over an open shop/prompt/items modal.
    if (
      document.querySelector('[data-simon-ui="coop-v84-room"]') ||
      document.querySelector('[data-simon-ui="esthi-v84-dialogue"]') ||
      world.itemsModal ||
      world.itemInfoModal
    ) {
      return;
    }

    const button = document.createElement("button");
    button.dataset.simonUi = "sweet-action-v84";
    button.textContent = `ESSEN · ${SWEETS[key].name.toUpperCase()}`;
    Object.assign(button.style, {
      position: "absolute",
      left: "50%",
      bottom: "62px",
      transform: "translateX(-50%)",
      zIndex: "400400",
      width: "210px",
      minHeight: "38px",
      padding: "6px 8px",
      border: "3px solid #e8b899",
      background: "#775044",
      color: "#fff3dd",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      cursor: "pointer",
      touchAction: "manipulation"
    });

    const eat = (event) => {
      stopEvent(event);
      consumeSweet(world, key);
    };
    button.addEventListener("click", eat, { passive: false });
    root.appendChild(button);
  }

  // =====================================================================
  // OERLIKON lifecycle
  // =====================================================================

  function patchOerlikonLifecycle() {
    const SceneClass = window.__SIMON_OERLIKON_SCENE_CLASS__;
    const proto = SceneClass?.prototype;
    if (!proto || proto.__esthiV84) return Boolean(proto);

    if (typeof proto.create === "function" && !proto.create.__esthiV84) {
      const previous = proto.create;
      const wrapped = function createOerlikonV84(...args) {
        const result = previous.apply(this, args);
        restoreProceduralEsthi(this);
        polishEsthiStoryText(this);
        ensureCoopInteraction(this);
        ensureEsthiInteraction(this);

        this.events?.once?.("shutdown", () => {
          removeDialogueOverlay();
          destroyEsthiMenu(this);
          removeCoopOverlay(this);
          document
            .querySelectorAll('[data-simon-ui="sweet-action-v84"]')
            .forEach((node) => node.remove());
        });
        return result;
      };
      wrapped.__esthiV84 = true;
      proto.create = wrapped;
    }

    if (typeof proto.update === "function" && !proto.update.__esthiV84) {
      const previous = proto.update;
      const wrapped = function updateOerlikonV84(...args) {
        const result = previous.apply(this, args);
        restoreProceduralEsthi(this);
        polishEsthiStoryText(this);
        ensureCoopInteraction(this);
        ensureEsthiInteraction(this);
        return result;
      };
      wrapped.__esthiV84 = true;
      proto.update = wrapped;
    }

    proto.__esthiV84 = true;
    return true;
  }

  function install() {
    suppressEsthiAssetLoad();
    patchBaseItemSystem();
    patchOerlikonLifecycle();

    const oerlikon = getScene(OERLIKON_KEY);
    if (oerlikon?.sys?.isActive?.()) {
      restoreProceduralEsthi(oerlikon);
      polishEsthiStoryText(oerlikon);
      ensureCoopInteraction(oerlikon);
      ensureEsthiInteraction(oerlikon);
    }

    ensureSweetActionButton();
  }

  install();
  const timer = window.setInterval(install, 150);

  window.SimonEsthiV84 = Object.freeze({
    VERSION,
    state,
    SWEETS,
    install,
    eat(key = "peperoV84") {
      const world = findInventoryWorld();
      if (!world || !SWEETS[key]) return false;
      if (state.sweets[key] <= 0) state.sweets[key] = 1;
      consumeSweet(world, key);
      return true;
    },
    openCoop() {
      const scene = getScene(OERLIKON_KEY);
      if (!scene?.sys?.isActive?.()) return false;
      enterCoop(scene);
      return true;
    },
    status() {
      const scene = getScene(OERLIKON_KEY);
      return {
        version: VERSION,
        proceduralEsthi: Boolean(scene?.__esthiV57 && !scene.__esthiV57.__npcSpriteV75),
        introCompleted: Boolean(getEsthiStoryState()?.introCompleted),
        observed: Boolean(state.observed),
        sweets: { ...state.sweets },
        ethStoryTold: Boolean(state.ethStoryTold),
        coopOpen: Boolean(scene?.__coopOpenV84)
      };
    },
    stopMaintenance() {
      window.clearInterval(timer);
    }
  });

  console.info(
    "Bugfix v84: procedural Esthi restored, dialogue polished, persistent flirt interaction, Coop Korea shop and global Esthi sweets cutscene."
  );
})();
