(() => {
  "use strict";

  if (window.__SIMON_THOMAS_HORSERACE_V44__) return;
  window.__SIMON_THOMAS_HORSERACE_V44__ = true;

  const SUITS = Object.freeze([
    { key: "hearts", label: "HERZ", symbol: "♥", color: "#c93643" },
    { key: "diamonds", label: "KARO", symbol: "♦", color: "#d24747" },
    { key: "clubs", label: "KREUZ", symbol: "♣", color: "#17191c" },
    { key: "spades", label: "PIK", symbol: "♠", color: "#17191c" }
  ]);

  const FINISH_POSITION = 7;
  const TRACK_CARD_COUNT = 6;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getVenice(game) {
    try {
      return game?.scene?.getScene?.("VeniceScene") || null;
    } catch {
      return null;
    }
  }

  function suit(key) {
    return SUITS.find((entry) => entry.key === key) || SUITS[0];
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function buildSuitDeck() {
    const deck = [];
    SUITS.forEach((entry) => {
      for (let i = 0; i < 13; i += 1) deck.push(entry.key);
    });
    return shuffle(deck);
  }

  function arcadeText(scene, text, options = {}) {
    return scene.createDOMText(text, {
      fontSize: options.fontSize || "7px",
      color: options.color || "#f7ebc2",
      margin: options.margin || "0",
      lineHeight: options.lineHeight || "1.55"
    });
  }

  function closeModal(scene, key) {
    const modal = scene?.[key];
    if (!modal) return;
    scene.destroyDOMModal?.(modal);
    scene[key] = null;
  }

  function restoreVeniceStreet(scene) {
    closeModal(scene, "__thomasInviteModal");
    closeModal(scene, "__horseRaceModal");
    scene.__horseRaceState = null;
    scene.__horseRaceDraft = null;
    scene.blockWorldInteractions?.(650);
    scene.setUILocked?.(false);
    scene.setControlsVisible?.(true);
    scene.ensureTicketMachineInteractive?.();
    scene.ensureLockerInteractive?.();
    scene.ensureTramBoardingInteractive?.();
  }

  function createThomas(scene) {
    if (!scene?.add || scene.__thomasV44?.active) return;

    const x = 1090;
    const groundY = 338;
    const thomas = scene.add.container(x, groundY - 58).setDepth(20);

    const chair = scene.add.graphics();
    chair.fillStyle(0x6d4a32, 1);
    chair.fillRect(-43, 8, 9, 59);
    chair.fillRect(-42, 5, 40, 8);
    chair.fillRect(-39, 13, 6, 48);
    chair.fillRect(-6, 13, 6, 48);

    const body = scene.add.graphics();
    // Legs / shoes while seated.
    body.fillStyle(0x25303b, 1);
    body.fillRect(-27, 31, 18, 31);
    body.fillRect(-6, 31, 18, 31);
    body.fillStyle(0x17191c, 1);
    body.fillRect(-30, 58, 23, 8);
    body.fillRect(-9, 58, 24, 8);

    // Shirt / arms.
    body.fillStyle(0x42576b, 1);
    body.fillRoundedRect(-31, -11, 52, 48, 8);
    body.fillStyle(0xc49370, 1);
    body.fillRoundedRect(-38, 3, 13, 38, 6);
    body.fillRoundedRect(15, 2, 13, 38, 6);

    // Neck / head.
    body.fillStyle(0xc99572, 1);
    body.fillRect(-12, -23, 17, 13);
    body.fillRoundedRect(-22, -51, 37, 34, 9);

    // Black hair.
    body.fillStyle(0x17191d, 1);
    body.fillRect(-21, -53, 35, 9);
    body.fillRect(-23, -49, 6, 14);
    body.fillRect(10, -49, 6, 12);
    body.fillRect(-14, -57, 20, 6);

    // Eyes / eyebrows.
    body.fillStyle(0x201b1a, 1);
    body.fillRect(-13, -39, 4, 2);
    body.fillRect(3, -39, 4, 2);
    body.fillRect(-14, -43, 7, 2);
    body.fillRect(2, -43, 7, 2);

    // Three-day stubble: small dark pixels around jaw, not a full beard.
    body.fillStyle(0x51453f, 0.9);
    [
      [-13,-30],[-7,-28],[0,-29],[7,-30],[-10,-24],[-4,-22],[3,-23],[8,-25]
    ].forEach(([sx, sy]) => body.fillRect(sx, sy, 3, 2));
    body.fillStyle(0x3d3330, 1);
    body.fillRect(-4, -20, 10, 2);

    // Table in front of Thomas.
    const table = scene.add.graphics();
    table.fillStyle(0x6f472b, 1);
    table.fillRoundedRect(24, 27, 104, 18, 5);
    table.fillStyle(0x4f331f, 1);
    table.fillRect(35, 43, 8, 54);
    table.fillRect(109, 43, 8, 54);
    table.fillStyle(0x2f573f, 1);
    table.fillRoundedRect(32, 30, 87, 10, 4);

    thomas.add([chair, body, table]);

    // Three simple poker cards fanned in his hand.
    const cardSymbols = ["♥", "♠", "♦"];
    const cardColors = ["#c93643", "#17191c", "#d24747"];
    cardSymbols.forEach((symbol, index) => {
      const card = scene.add.rectangle(
        24 + index * 9,
        14 + Math.abs(index - 1) * 2,
        18,
        26,
        0xf3eee3,
        1
      )
        .setStrokeStyle(2, 0x4b443c, 1)
        .setAngle((index - 1) * 11);
      const mark = scene.add.text(
        24 + index * 9,
        14 + Math.abs(index - 1) * 2,
        symbol,
        {
          fontFamily: "Georgia, serif",
          fontSize: "13px",
          color: cardColors[index]
        }
      )
        .setOrigin(0.5)
        .setAngle((index - 1) * 11);
      thomas.add([card, mark]);
    });

    thomas.setSize(180, 150);
    thomas.setInteractive({ useHandCursor: true });

    const name = scene.add.text(x - 18, groundY - 127, "THOMAS", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#fff0b5",
      stroke: "#26313b",
      strokeThickness: 4
    })
      .setOrigin(0.5)
      .setDepth(23);

    thomas.on("pointerdown", (pointer) => {
      if (!scene.canUseWorldInteraction?.(pointer)) return;
      pointer?.event?.preventDefault?.();
      pointer?.event?.stopPropagation?.();
      window.SimonAcquaintancesV41?.mark?.("thomas");
      openThomasInvite(scene);
    });

    scene.__thomasV44 = thomas;
    scene.__thomasNameV44 = name;
  }

  function openThomasInvite(scene) {
    if (scene.__thomasInviteModal || scene.__horseRaceModal) return;
    scene.player?.setVelocity?.(0, 0);
    scene.setUILocked?.(true);

    const modal = scene.createDOMModal({
      key: "thomas-invite-v44",
      width: "min(90%, 510px)",
      background: "#efe4ca",
      border: "#5c4531",
      shade: "rgba(6, 7, 10, .72)",
      padding: "16px 18px"
    });
    if (!modal) {
      restoreVeniceStreet(scene);
      return;
    }
    scene.__thomasInviteModal = modal;
    modal.overlay.style.zIndex = "455000";

    const title = arcadeText(scene, "THOMAS", {
      fontSize: "12px",
      color: "#4b3022",
      margin: "0 0 14px"
    });
    const line = arcadeText(
      scene,
      "Ciao Simeone, willsch e Rundi Pferderenne spiele?",
      {
        fontSize: "8px",
        color: "#302821",
        margin: "0 0 16px",
        lineHeight: "1.7"
      }
    );

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px"
    });

    const yes = scene.createDOMButton("JA", () => {
      closeModal(scene, "__thomasInviteModal");
      openHorseRaceIntro(scene);
    }, {
      color: "#efffdc",
      background: "#355936",
      border: "#8fc271",
      minHeight: "44px",
      fontSize: "9px"
    });

    const no = scene.createDOMButton("NEIN", () => {
      restoreVeniceStreet(scene);
    }, {
      color: "#ffe3d3",
      background: "#653b35",
      border: "#b7766b",
      minHeight: "44px",
      fontSize: "9px"
    });

    row.append(yes, no);
    modal.panel.append(title, line, row);
  }

  function makeRaceModal(scene, key = "horse-race-v44") {
    closeModal(scene, "__horseRaceModal");
    const modal = scene.createDOMModal({
      key,
      width: "min(96%, 760px)",
      background: "#101522",
      border: "#d9b85e",
      shade: "rgba(3, 4, 8, .86)",
      padding: "12px 14px"
    });
    if (!modal) return null;
    scene.__horseRaceModal = modal;
    modal.overlay.style.zIndex = "456000";
    modal.panel.style.borderRadius = "8px";
    modal.panel.style.boxShadow = "0 5px 0 #392b18, inset 0 0 26px rgba(122,91,39,.22)";
    return modal;
  }

  function raceTitle(scene) {
    const title = arcadeText(scene, "PFERDERENNEN MIT THOMAS", {
      fontSize: "12px",
      color: "#ffe58a",
      margin: "0 0 9px"
    });
    title.style.textShadow = "3px 3px 0 #65461f";
    return title;
  }

  function openHorseRaceIntro(scene) {
    const modal = makeRaceModal(scene, "horse-race-intro-v44");
    if (!modal) {
      restoreVeniceStreet(scene);
      return;
    }

    const title = raceTitle(scene);
    const rules = arcadeText(
      scene,
      "VIER PFERDE · SECHS STRECKENKARTEN\n\nDeine Farbe gewinnt: +2× dein Einsatz.\nThomas gewinnt: −sein Einsatz (100–400).\nEine andere Farbe gewinnt: −50 Coins.",
      {
        fontSize: "6px",
        color: "#d5d8df",
        margin: "0 0 13px",
        lineHeight: "1.65"
      }
    );
    rules.style.whiteSpace = "pre-line";

    const start = scene.createDOMButton("START", () => openBetScreen(scene), {
      color: "#172014",
      background: "#f1cf65",
      border: "#fff0a0",
      width: "220px",
      minHeight: "44px",
      fontSize: "10px"
    });
    start.style.margin = "0 auto";

    modal.panel.append(title, rules, start);
  }

  function openBetScreen(scene) {
    const modal = makeRaceModal(scene, "horse-race-bet-v44");
    if (!modal) return;
    const title = raceTitle(scene);

    const available = scene.developerMode
      ? 9999
      : Math.max(0, Math.floor(Number(scene.coins) || 0));

    const question = arcadeText(
      scene,
      "WIEVIELE COINS WILLST DU SETZEN?",
      {
        fontSize: "8px",
        color: "#f4e8c6",
        margin: "0 0 10px"
      }
    );

    const balance = arcadeText(
      scene,
      scene.developerMode
        ? "KONTO: ∞ · DEVELOPER"
        : `KONTO: ${scene.coins} COINS`,
      {
        fontSize: "6px",
        color: available > 0 ? "#a9dca4" : "#e69a8f",
        margin: "0 0 10px"
      }
    );

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.min = "1";
    input.step = "1";
    input.max = String(Math.max(1, available));
    input.value = String(Math.min(50, Math.max(1, available)));
    Object.assign(input.style, {
      appearance: "none",
      width: "min(80%, 260px)",
      minHeight: "44px",
      padding: "8px 10px",
      border: "3px solid #d9b85e",
      borderRadius: "4px",
      background: "#f5edda",
      color: "#24201b",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      textAlign: "center",
      boxSizing: "border-box",
      outline: "none",
      margin: "0 auto 10px",
      display: "block"
    });

    const error = arcadeText(scene, "", {
      fontSize: "5.5px",
      color: "#ff9b91",
      margin: "0 0 8px"
    });

    const next = scene.createDOMButton("WEITER", () => {
      const wager = Math.floor(Number(input.value));
      if (!Number.isFinite(wager) || wager < 1) {
        error.textContent = "MINDESTENS 1 COIN.";
        return;
      }
      if (!scene.developerMode && wager > available) {
        error.textContent = "SO VIELE COINS HAST DU NICHT.";
        return;
      }
      scene.__horseRaceDraft = {
        wager,
        playerSuit: null
      };
      openSuitScreen(scene);
    }, {
      color: "#172014",
      background: available > 0 ? "#f1cf65" : "#736b58",
      border: available > 0 ? "#fff0a0" : "#8d8678",
      width: "220px",
      minHeight: "42px",
      fontSize: "8px"
    });
    next.style.margin = "0 auto";
    if (available <= 0) {
      next.disabled = true;
      error.textContent = "DU HAST KEINE COINS ZUM SETZEN.";
    }

    modal.panel.append(title, question, balance, input, error, next);
  }

  function suitButton(scene, entry, onSelect) {
    const button = scene.createDOMButton(
      `${entry.symbol} ${entry.label}`,
      () => onSelect(entry.key, button),
      {
        color: entry.color,
        background: "#f5efe2",
        border: entry.color,
        minHeight: "44px",
        fontSize: "9px"
      }
    );
    button.dataset.horseSuit = entry.key;
    return button;
  }

  function openSuitScreen(scene) {
    const modal = makeRaceModal(scene, "horse-race-suit-v44");
    if (!modal) return;
    const title = raceTitle(scene);
    const wager = Math.max(1, Number(scene.__horseRaceDraft?.wager) || 1);

    const question = arcadeText(scene, "MIT WELCHEM PFERD WILLST DU SPIELEN?", {
      fontSize: "8px",
      color: "#f4e8c6",
      margin: "0 0 11px"
    });
    const stake = arcadeText(scene, `DEIN EINSATZ: ${wager} COINS`, {
      fontSize: "6px",
      color: "#c0c8d6",
      margin: "0 0 10px"
    });

    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "8px",
      margin: "0 0 10px"
    });

    let selected = null;
    const buttons = [];
    const next = scene.createDOMButton("WEITER", () => {
      if (!selected) return;
      scene.__horseRaceDraft.playerSuit = selected;
      startRace(scene);
    }, {
      color: "#797365",
      background: "#45433d",
      border: "#69665c",
      width: "220px",
      minHeight: "42px",
      fontSize: "8px"
    });
    next.disabled = true;
    next.style.margin = "0 auto";

    const select = (key) => {
      selected = key;
      buttons.forEach((button) => {
        const active = button.dataset.horseSuit === key;
        button.style.background = active ? "#ffe4a2" : "#f5efe2";
        button.style.boxShadow = active ? "0 0 0 3px rgba(255,226,128,.28)" : "none";
      });
      next.disabled = false;
      next.style.color = "#172014";
      next.style.background = "#f1cf65";
      next.style.borderColor = "#fff0a0";
    };

    SUITS.forEach((entry) => {
      const button = suitButton(scene, entry, select);
      buttons.push(button);
      grid.appendChild(button);
    });

    modal.panel.append(title, question, stake, grid, next);
  }

  function createRaceState(scene) {
    const playerSuit = scene.__horseRaceDraft?.playerSuit || SUITS[0].key;
    const wager = Math.max(1, Math.floor(Number(scene.__horseRaceDraft?.wager) || 1));
    const thomasOptions = SUITS.map((entry) => entry.key)
      .filter((key) => key !== playerSuit);
    const thomasSuit = thomasOptions[randomInt(0, thomasOptions.length - 1)];
    const thomasStake = randomInt(100, 400);
    const fullDeck = buildSuitDeck();
    const trackCards = fullDeck.splice(0, TRACK_CARD_COUNT);

    return {
      playerSuit,
      wager,
      thomasSuit,
      thomasStake,
      positions: Object.fromEntries(SUITS.map((entry) => [entry.key, 0])),
      trackCards,
      revealedTrackCards: Array(TRACK_CARD_COUNT).fill(false),
      nextTrackStage: 1,
      drawPile: fullDeck,
      drawCount: 0,
      busy: false,
      winner: null,
      refs: {
        horses: {},
        trackCards: [],
        drawnCard: null,
        status: null,
        drawButton: null
      }
    };
  }

  function createCardElement(entry, { back = false, compact = false } = {}) {
    const card = document.createElement("div");
    Object.assign(card.style, {
      width: compact ? "46px" : "58px",
      height: compact ? "25px" : "30px",
      border: back ? "2px solid #e2e7ea" : "2px solid #57514b",
      borderRadius: "4px",
      background: back
        ? "repeating-linear-gradient(45deg,#35678a 0 3px,#d8e7ef 3px 5px,#244f70 5px 8px)"
        : "#f5f0e6",
      boxSizing: "border-box",
      display: "grid",
      placeItems: "center",
      color: entry?.color || "#222",
      fontFamily: "Georgia, serif",
      fontWeight: "700",
      fontSize: compact ? "19px" : "22px",
      boxShadow: "2px 2px 0 rgba(0,0,0,.25)",
      transition: "top 260ms ease, transform 220ms ease, opacity 180ms ease",
      transformOrigin: "center"
    });
    card.textContent = back ? "✦" : (entry?.symbol || "?");
    if (back) card.style.color = "rgba(255,255,255,.75)";
    return card;
  }

  function startRace(scene) {
    scene.__horseRaceState = createRaceState(scene);
    renderRaceBoard(scene);
  }

  function renderRaceBoard(scene) {
    const state = scene.__horseRaceState;
    if (!state) return;
    const modal = makeRaceModal(scene, "horse-race-board-v44");
    if (!modal) return;

    const title = raceTitle(scene);
    title.style.marginBottom = "5px";

    const player = suit(state.playerSuit);
    const thomas = suit(state.thomasSuit);
    const info = arcadeText(
      scene,
      `SIMON: ${player.symbol} ${player.label} · ${state.wager}   |   THOMAS: ${thomas.symbol} ${thomas.label} · ${state.thomasStake}`,
      {
        fontSize: "5.5px",
        color: "#c8d0db",
        margin: "0 0 6px"
      }
    );

    const board = document.createElement("div");
    Object.assign(board.style, {
      position: "relative",
      width: "min(100%, 620px)",
      height: "238px",
      margin: "0 auto 7px",
      border: "3px solid #8a633e",
      borderRadius: "6px",
      background:
        "linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(#2d624a,#234f3c)",
      backgroundSize: "25% 100%,100% 100%",
      overflow: "hidden",
      boxSizing: "border-box"
    });

    // Wooden top label strip.
    const strip = document.createElement("div");
    Object.assign(strip.style, {
      position: "absolute",
      left: "0",
      top: "0",
      right: "0",
      height: "7px",
      background: "#8a633e"
    });
    board.appendChild(strip);

    const laneLefts = ["9%", "28%", "47%", "66%"];
    const startTop = 10;
    const rowStep = 27;

    // Stage guide lines and numbers.
    for (let stage = 1; stage <= TRACK_CARD_COUNT; stage += 1) {
      const y = startTop + stage * rowStep + 13;
      const line = document.createElement("div");
      Object.assign(line.style, {
        position: "absolute",
        left: "4%",
        right: "18%",
        top: `${y}px`,
        borderTop: "1px dashed rgba(238,226,194,.24)"
      });
      board.appendChild(line);
    }

    const finishTop = startTop + FINISH_POSITION * rowStep + 13;
    const finish = document.createElement("div");
    Object.assign(finish.style, {
      position: "absolute",
      left: "3%",
      right: "18%",
      top: `${finishTop}px`,
      borderTop: "3px dashed #f7dc77"
    });
    const finishLabel = document.createElement("span");
    finishLabel.textContent = "ZIEL";
    Object.assign(finishLabel.style, {
      position: "absolute",
      right: "2px",
      top: "-13px",
      color: "#ffe68f",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5px"
    });
    finish.appendChild(finishLabel);
    board.appendChild(finish);

    SUITS.forEach((entry, index) => {
      const horse = createCardElement(entry, { compact: false });
      horse.dataset.raceHorse = entry.key;
      Object.assign(horse.style, {
        position: "absolute",
        left: laneLefts[index],
        top: `${startTop}px`,
        transform: "translateX(-50%)"
      });

      const owner = document.createElement("span");
      if (entry.key === state.playerSuit) owner.textContent = "S";
      else if (entry.key === state.thomasSuit) owner.textContent = "T";
      else owner.textContent = "";
      Object.assign(owner.style, {
        position: "absolute",
        right: "2px",
        bottom: "1px",
        color: "#7b6648",
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "4px"
      });
      horse.appendChild(owner);
      board.appendChild(horse);
      state.refs.horses[entry.key] = horse;
    });

    // Six face-down stage cards, vertical like the reference photo.
    state.trackCards.forEach((cardSuit, index) => {
      const card = createCardElement(null, { back: true, compact: true });
      Object.assign(card.style, {
        position: "absolute",
        left: "86%",
        top: `${startTop + (index + 1) * rowStep + 2}px`,
        transform: "translateX(-50%)"
      });
      card.dataset.trackStage = String(index + 1);
      card.dataset.cardSuit = cardSuit;
      board.appendChild(card);
      state.refs.trackCards.push(card);
    });

    const status = arcadeText(scene, "KLICK AUF UMDREHEN.", {
      fontSize: "5.5px",
      color: "#f2dfaa",
      margin: "0 0 5px"
    });
    state.refs.status = status;

    const controls = document.createElement("div");
    Object.assign(controls.style, {
      display: "grid",
      gridTemplateColumns: "74px 74px minmax(150px, 210px)",
      justifyContent: "center",
      alignItems: "center",
      gap: "9px"
    });

    const deck = createCardElement(null, { back: true, compact: false });
    deck.style.margin = "0 auto";
    deck.title = "Deck";

    const drawn = createCardElement(null, { back: true, compact: false });
    drawn.style.margin = "0 auto";
    drawn.style.opacity = "0.45";
    state.refs.drawnCard = drawn;

    const draw = scene.createDOMButton("UMDREHEN", () => drawRaceCard(scene), {
      color: "#172014",
      background: "#f1cf65",
      border: "#fff0a0",
      minHeight: "42px",
      fontSize: "8px"
    });
    state.refs.drawButton = draw;

    controls.append(deck, drawn, draw);
    modal.panel.append(title, info, board, status, controls);
  }

  function updateHorsePosition(state, key) {
    const horse = state.refs.horses[key];
    if (!horse) return;
    const top = 10 + Math.max(0, state.positions[key]) * 27;
    horse.style.top = `${top}px`;
  }

  function showDrawnCard(state, key) {
    const entry = suit(key);
    const card = state.refs.drawnCard;
    if (!card) return;
    card.style.opacity = "1";
    card.style.transform = "scaleX(.08)";
    window.setTimeout(() => {
      card.style.background = "#f5f0e6";
      card.style.border = "2px solid #57514b";
      card.style.color = entry.color;
      card.textContent = entry.symbol;
      card.style.transform = "scaleX(1)";
    }, 110);
  }

  function revealNextTrackCard(state) {
    const stage = state.nextTrackStage;
    if (stage > TRACK_CARD_COUNT) return null;

    const allReached = SUITS.every(
      (entry) => state.positions[entry.key] >= stage
    );
    if (!allReached) return null;

    const index = stage - 1;
    const key = state.trackCards[index];
    const entry = suit(key);
    const card = state.refs.trackCards[index];
    state.revealedTrackCards[index] = true;
    state.nextTrackStage += 1;

    if (card) {
      card.style.transform = "translateX(-50%) scaleX(.08)";
      window.setTimeout(() => {
        card.style.background = "#f5f0e6";
        card.style.border = "2px solid #57514b";
        card.style.color = entry.color;
        card.textContent = entry.symbol;
        card.style.transform = "translateX(-50%) scaleX(1)";
      }, 110);
    }

    state.positions[key] = Math.max(0, state.positions[key] - 1);
    updateHorsePosition(state, key);

    return { stage, key, entry };
  }

  function checkWinner(state) {
    return SUITS.find(
      (entry) => state.positions[entry.key] > TRACK_CARD_COUNT
    )?.key || null;
  }

  function drawRaceCard(scene) {
    const state = scene.__horseRaceState;
    if (!state || state.busy || state.winner) return;

    state.busy = true;
    if (state.refs.drawButton) {
      state.refs.drawButton.disabled = true;
      state.refs.drawButton.textContent = "...";
    }

    if (!state.drawPile.length) {
      state.drawPile = buildSuitDeck();
    }

    const drawnSuit = state.drawPile.pop();
    const entry = suit(drawnSuit);
    state.drawCount += 1;
    showDrawnCard(state, drawnSuit);
    state.refs.status.textContent = `${entry.symbol} ${entry.label} · PFERD RÜCKT VOR`;

    window.setTimeout(() => {
      if (scene.sys?.isActive && !scene.sys.isActive()) return;
      state.positions[drawnSuit] += 1;
      updateHorsePosition(state, drawnSuit);

      window.setTimeout(() => {
        if (scene.sys?.isActive && !scene.sys.isActive()) return;
        const revealed = revealNextTrackCard(state);
        if (revealed) {
          state.refs.status.textContent =
            `STRECKENKARTE ${revealed.stage}: ${revealed.entry.symbol} ${revealed.entry.label} · 1 ZURÜCK`;
        }

        window.setTimeout(() => {
          if (scene.sys?.isActive && !scene.sys.isActive()) return;
          const winner = checkWinner(state);
          if (winner) {
            state.winner = winner;
            finishRace(scene, winner);
            return;
          }

          state.busy = false;
          if (state.refs.drawButton) {
            state.refs.drawButton.disabled = false;
            state.refs.drawButton.textContent = "UMDREHEN";
          }
          if (!revealed) {
            state.refs.status.textContent = "NÄCHSTE KARTE UMDREHEN.";
          }
        }, revealed ? 420 : 110);
      }, 330);
    }, 220);
  }

  function calculateOutcome(state, winnerKey) {
    if (!state) return { delta: 0, resultText: "" };

    if (winnerKey === state.playerSuit) {
      const delta = Math.max(0, Number(state.wager) || 0) * 2;
      return {
        delta,
        resultText: `SIMON GEWINNT · +${delta} COINS (2× EINSATZ)`
      };
    }

    if (winnerKey === state.thomasSuit) {
      const delta = -Math.max(100, Math.min(400, Number(state.thomasStake) || 100));
      return {
        delta,
        resultText: `THOMAS GEWINNT · ${delta} COINS`
      };
    }

    return {
      delta: -50,
      resultText: "ANDERES PFERD GEWINNT · −50 COINS"
    };
  }

  function finishRace(scene, winnerKey) {
    const state = scene.__horseRaceState;
    if (!state) return;
    const winner = suit(winnerKey);
    const { delta, resultText } = calculateOutcome(state, winnerKey);

    if (!scene.developerMode) {
      const current = Number(scene.coins);
      scene.coins = (Number.isFinite(current) ? current : 0) + delta;
    }
    scene.updateCoinHUD?.();
    scene.updateInventoryUI?.();

    const modal = makeRaceModal(scene, "horse-race-result-v44");
    if (!modal) {
      restoreVeniceStreet(scene);
      return;
    }

    const title = raceTitle(scene);
    const winnerCard = createCardElement(winner, { compact: false });
    winnerCard.style.width = "82px";
    winnerCard.style.height = "50px";
    winnerCard.style.fontSize = "34px";
    winnerCard.style.margin = "2px auto 10px";

    const winnerText = arcadeText(scene, `GEWINNER: ${winner.symbol} ${winner.label}`, {
      fontSize: "10px",
      color: winner.color === "#17191c" ? "#f2f2f2" : "#ff9aa2",
      margin: "0 0 9px"
    });
    const result = arcadeText(scene, resultText, {
      fontSize: "7px",
      color: delta >= 0 ? "#aee3a6" : "#f0a49a",
      margin: "0 0 8px"
    });
    const balance = arcadeText(
      scene,
      scene.developerMode
        ? "KONTO BLEIBT ∞ · DEVELOPER"
        : `NEUER KONTOSTAND: ${scene.coins} COINS`,
      {
        fontSize: "6px",
        color: "#d8d5c9",
        margin: "0 0 12px"
      }
    );

    const back = scene.createDOMButton("ZURÜCK AUF DIE STRASSE", () => {
      restoreVeniceStreet(scene);
    }, {
      color: "#172014",
      background: "#f1cf65",
      border: "#fff0a0",
      width: "260px",
      minHeight: "42px",
      fontSize: "7px"
    });
    back.style.margin = "0 auto";

    modal.panel.append(title, winnerCard, winnerText, result, balance, back);
  }

  function patchVenice(scene) {
    if (!scene || scene.__thomasHorseRaceV44Installed) return;
    scene.__thomasHorseRaceV44Installed = true;

    if (typeof scene.create === "function") {
      const originalCreate = scene.create.bind(scene);
      const wrappedCreate = function createThomasHorseRaceV44(...args) {
        const result = originalCreate(...args);
        createThomas(this);

        this.events?.once?.("shutdown", () => {
          closeModal(this, "__thomasInviteModal");
          closeModal(this, "__horseRaceModal");
          this.__horseRaceState = null;
          this.__horseRaceDraft = null;
          this.__thomasV44 = null;
          this.__thomasNameV44 = null;
        });

        return result;
      };
      wrappedCreate.__thomasHorseRaceV44 = true;
      scene.create = wrappedCreate;
    }

    if (scene.sys?.isActive?.() && !scene.__thomasV44?.active) {
      createThomas(scene);
    }
  }

  function install(game) {
    const venice = getVenice(game);
    if (venice) patchVenice(venice);
  }

  const previousStart = window.startSimonGame;
  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameThomasV44(options = {}) {
      const game = previousStart.call(this, options);
      if (game) install(game);
      return game;
    };
  }

  const frame = () => {
    const game = getGame();
    if (game) install(game);
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);

  window.SimonHorseRaceV44 = Object.freeze({
    SUITS,
    FINISH_POSITION,
    TRACK_CARD_COUNT,
    buildSuitDeck,
    createRaceState,
    calculateOutcome,
    checkWinner,
    revealNextTrackCard
  });
})();
