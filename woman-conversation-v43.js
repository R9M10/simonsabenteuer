(() => {
  "use strict";

  if (window.__SIMON_WOMAN_CONVERSATION_V43__) return;
  window.__SIMON_WOMAN_CONVERSATION_V43__ = true;

  const state = window.__SIMON_WOMAN_CONVERSATION_STATE_V43__ || {
    completedFirstConversation: false
  };
  window.__SIMON_WOMAN_CONVERSATION_STATE_V43__ = state;

  let overlay = null;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getHive(game) {
    try {
      return game?.scene?.getScene?.("HiveInteriorScene") || null;
    } catch {
      return null;
    }
  }

  function clearOverlay() {
    overlay?.remove?.();
    overlay = null;
  }

  function facePair(hive) {
    if (!hive?.player?.active || !hive?.womanSprite?.active) return;
    hive.player.setFlipX(hive.womanSprite.x < hive.player.x);
  }

  function createOverlay(onAdvance) {
    clearOverlay();
    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const node = document.createElement("div");
    node.dataset.simonUi = "woman-conversation-v43";
    Object.assign(node.style, {
      position: "absolute",
      inset: "0",
      zIndex: "446500",
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent"
    });

    let lastAdvance = -Infinity;
    const stop = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
    };
    const advance = (event) => {
      stop(event);
      const now = performance.now();
      if (now - lastAdvance < 310) return;
      lastAdvance = now;
      onAdvance?.();
    };

    node.addEventListener("pointerdown", stop, { passive: false });
    node.addEventListener("pointerup", advance, { passive: false });
    node.addEventListener("click", advance, { passive: false });
    root.appendChild(node);
    overlay = node;
    return node;
  }

  function runSequence(hive, steps, onFinish = null) {
    if (!hive || !Array.isArray(steps) || !steps.length) return;

    window.SimonAcquaintancesV41?.mark?.("womanHive");
    hive.closeModal?.();
    hive.actionLocked = true;
    hive.touchLeft = false;
    hive.touchRight = false;
    facePair(hive);

    let index = 0;
    const render = () => {
      const step = steps[index];
      if (!step) {
        clearOverlay();
        hive.destroySpeechBubble?.();
        hive.stopSimonAction?.();
        hive.womanSprite?.play?.("woman-v14-idle", true);
        hive.actionLocked = false;
        onFinish?.();
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
          index === steps.length - 1 ? "woman-v14-reject" : "woman-v14-idle",
          true
        );
        hive.showSpeechBubble?.(hive.womanSprite, step.text, 0);
      }
    };

    createOverlay(() => {
      index += 1;
      render();
    });
    render();
  }

  function runCorrectWomanConversation(hive) {
    const first = !state.completedFirstConversation;

    const steps = first
      ? [
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
        ]
      : [
          { speaker: "simon", text: "Willsch mit mir tanze?" },
          { speaker: "woman", text: "Du bisch zwar nice..." },
          { speaker: "woman", text: "aber..." },
          { speaker: "woman", text: "nöd soooo nice." }
        ];

    runSequence(hive, steps, () => {
      state.completedFirstConversation = true;
    });
  }

  function patchHive(hive) {
    if (!hive || hive.__womanConversationV43Installed) return;
    hive.__womanConversationV43Installed = true;

    if (typeof hive.openDialog === "function") {
      const originalOpenDialog = hive.openDialog.bind(hive);
      hive.openDialog = function openDialogWomanV43(title, body, buttons, ...rest) {
        let nextButtons = buttons;
        if (
          String(title || "").trim().toUpperCase() === "ANSPRECHEN" &&
          Array.isArray(buttons)
        ) {
          nextButtons = buttons.map((button) => {
            if (String(button?.label || "").trim().toUpperCase() !== "REDEN") {
              return button;
            }
            return {
              ...button,
              action: () => runCorrectWomanConversation(this)
            };
          });
        }
        return originalOpenDialog(title, body, nextButtons, ...rest);
      };
      hive.openDialog.__womanConversationV43 = true;
    }

    hive.startRejectedDanceInvite = function startRejectedDanceInviteV43() {
      runCorrectWomanConversation(this);
    };
    hive.startRejectedDanceInvite.__acquaintanceV41 = true;
    hive.startRejectedDanceInvite.__flirtV42 = true;
    hive.startRejectedDanceInvite.__womanConversationV43 = true;

    if (typeof hive.leaveHive === "function" && !hive.leaveHive.__womanConversationV43) {
      const originalLeave = hive.leaveHive.bind(hive);
      const wrappedLeave = function leaveHiveWomanV43(...args) {
        clearOverlay();
        return originalLeave(...args);
      };
      wrappedLeave.__womanConversationV43 = true;
      hive.leaveHive = wrappedLeave;
    }
  }

  function install(game) {
    const hive = getHive(game);
    if (hive) patchHive(hive);
  }

  const previousStart = window.startSimonGame;
  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameWomanV43(options = {}) {
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
})();
