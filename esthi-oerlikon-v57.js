(() => {
  "use strict";

  if (window.__SIMON_ESTHI_OERLIKON_V57__) return;
  window.__SIMON_ESTHI_STORY_V52__ = true;

  const VERSION = 57;

  const WORLD = Object.freeze({
    groundTop: 338,
    parkLeft: 1260,
    parkRight: 2160,
    parkTriggerLeft: 1390,
    parkTriggerRight: 2070,
    benchX: 1830,
    coopLeft: 2250,
    coopDoorX: 2395
  });

  const state =
    window.__SIMON_ESTHI_OERLIKON_STATE_V57__ ||
    window.__SIMON_ESTHI_STATE_V52__ ||
    window.__SIMON_ESTHI_STATE_V50__ || {
      introStarted: false,
      introCompleted: false,
      firstKissUnlocked: false
    };

  window.__SIMON_ESTHI_OERLIKON_STATE_V57__ = state;
  window.__SIMON_ESTHI_STATE_V52__ = state;
  window.__SIMON_ESTHI_STATE_V50__ = state;

  const runtime = {
    activeScene: null,
    overlay: null,
    bubble: null,
    powder: null,
    sequenceToken: 0
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function isOerlikon(scene) {
    return scene?.sys?.settings?.key === "OerlikonScene";
  }

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getOerlikon(game) {
    try {
      return game?.scene?.getScene?.("OerlikonScene") || null;
    } catch {
      return null;
    }
  }

  function destroyBubble() {
    runtime.bubble?.destroy?.(true);
    runtime.bubble = null;
  }

  function destroyPowder() {
    runtime.powder?.destroy?.(true);
    runtime.powder = null;
  }

  function removeOverlay() {
    runtime.overlay?.remove?.();
    runtime.overlay = null;
  }

  function cleanupStoryVisuals() {
    removeOverlay();
    destroyBubble();
    destroyPowder();
  }

  function safeWorldInteraction(scene) {
    return Boolean(
      scene &&
      scene.player?.active &&
      !scene.uiLocked &&
      !scene.playerDying &&
      !scene.tramTransitActive &&
      !scene.bouncerDialogueActive &&
      !scene.fightActive &&
      !scene.lionExitActive &&
      !scene.lionCombatActive &&
      !scene.danceOverlay &&
      !scene.ticketModal &&
      !scene.itemsModal &&
      !scene.itemInfoModal &&
      !scene.inVoid &&
      !scene.rewindActive
    );
  }

  function setStoryLock(scene, locked) {
    if (!scene) return;

    scene.__esthiStoryActive = Boolean(locked);
    scene.touchLeft = false;
    scene.touchRight = false;
    scene.touchJumpRequested = false;
    scene.touchShootRequested = false;

    if (scene.player?.active) {
      scene.player.setVelocity?.(0, 0);
    }

    if (locked) {
      scene.setUILocked?.(true);
      scene.uiLocked = true;
      return;
    }

    scene.uiLocked = false;
    scene.setUILocked?.(false);
    scene.refreshUILock?.();

    if (!scene.uiLocked) {
      scene.setControlsVisible?.(true);
      scene.ensureTicketMachineInteractive?.();
      scene.ensureTramBoardingInteractive?.();
    }
  }

  function showUnlock(scene) {
    const text = "ERINNERUNG FREIGESCHALTET\nDER ERSTE KUSS";

    if (typeof scene?.showTopTextNotice === "function") {
      scene.showTopTextNotice(text, {
        duration: 3800,
        key: "esthi-first-kiss-v57"
      });
      return;
    }

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const notice = document.createElement("div");
    notice.dataset.simonUi = "esthi-memory-v57";
    notice.textContent = text;

    Object.assign(notice.style, {
      position: "absolute",
      top: "44px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "490000",
      maxWidth: "80%",
      padding: "11px 15px",
      border: "3px solid #e0bf75",
      background: "rgba(37,28,22,.96)",
      color: "#fff0c5",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none"
    });

    root.appendChild(notice);
    window.setTimeout(() => notice.remove(), 3800);
  }

  // ---------------------------------------------------------------------------
  // Esthi
  // ---------------------------------------------------------------------------

  function createEsthi(scene, x, groundY) {
    const esthi = scene.add.container(x, groundY)
      .setDepth(13)
      .setVisible(false);

    const body = scene.add.graphics();

    // White sneakers.
    body.fillStyle(0xf2f0e9, 1);
    body.fillRoundedRect(-18, -5, 16, 6, 3);
    body.fillRoundedRect(2, -5, 16, 6, 3);

    // Trousers.
    body.fillStyle(0x28313d, 1);
    body.fillRect(-16, -38, 12, 35);
    body.fillRect(4, -38, 12, 35);

    // Cream jacket + powder-blue top.
    body.fillStyle(0xd7c9ad, 1);
    body.fillRoundedRect(-24, -77, 48, 43, 8);
    body.fillStyle(0xa8c9d7, 1);
    body.fillRoundedRect(-11, -72, 22, 33, 4);

    // Hands.
    body.fillStyle(0xd4a17d, 1);
    body.fillCircle(-28, -51, 5);
    body.fillCircle(28, -51, 5);

    // Face.
    body.fillStyle(0xd7a581, 1);
    body.fillCircle(0, -96, 18);

    // Dark straight hair.
    body.fillStyle(0x211d20, 1);
    body.fillRoundedRect(-20, -116, 40, 29, 12);
    body.fillRect(-20, -103, 8, 31);
    body.fillRect(12, -103, 8, 31);

    // Eyes / smile.
    body.fillStyle(0x2b2728, 1);
    body.fillRect(-8, -97, 3, 3);
    body.fillRect(5, -97, 3, 3);
    body.lineStyle(2, 0x8a4d4d, 1);
    body.lineBetween(-4, -88, 4, -87);

    esthi.add(body);

    const props = scene.add.container(0, -48)
      .setVisible(false);

    const propG = scene.add.graphics();

    // Detergent bottle.
    propG.fillStyle(0x78a8c7, 1);
    propG.fillRoundedRect(18, -1, 18, 31, 5);
    propG.fillStyle(0xe9f1ec, 1);
    propG.fillRect(21, 6, 12, 9);
    propG.fillStyle(0x547991, 1);
    propG.fillRect(22, -6, 10, 7);

    // Small snack bag.
    propG.fillStyle(0xf1e4c8, 1);
    propG.fillRoundedRect(-37, 4, 25, 28, 4);
    propG.fillStyle(0xffffff, 0.88);
    propG.fillCircle(-29, 12, 4);
    propG.fillCircle(-21, 19, 4);
    propG.fillCircle(-30, 25, 4);

    props.add(propG);
    esthi.add(props);

    const name = scene.add.text(
      0,
      -134,
      "ESTHI",
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff0cf",
        stroke: "#3a2927",
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setVisible(false);

    esthi.add(name);

    esthi.__esthiProps = props;
    esthi.__esthiName = name;

    scene.__esthiV57 = esthi;
    return esthi;
  }

  function setEsthiProps(esthi, visible) {
    esthi?.__esthiProps?.setVisible?.(Boolean(visible));
  }

  function showEsthiPermanently(scene, groundY = null) {
    const esthi = scene.__esthiV57;
    if (!esthi) return;

    const y =
      Number.isFinite(groundY)
        ? groundY
        : (Number(scene.__esthiGroundYV57) || 294);

    esthi
      .setVisible(true)
      .setAlpha(1)
      .setAngle(0)
      .setScale(1)
      .setPosition(WORLD.benchX + 92, y);

    setEsthiProps(esthi, false);
    esthi.__esthiName?.setVisible?.(true);
  }

  // ---------------------------------------------------------------------------
  // Story bubbles
  // ---------------------------------------------------------------------------

  function actorPoint(scene, actorName) {
    if (actorName === "esthi") {
      const esthi = scene.__esthiV57;
      return {
        x: esthi?.x || scene.player.x,
        y: (esthi?.y || scene.player.y) - 124
      };
    }

    const player = scene.player;
    return {
      x: player?.x || 0,
      y: (player?.y || 0) - 122
    };
  }

  function showStoryBubble(scene, actorName, text, thought = false) {
    destroyBubble();

    const point = actorPoint(scene, actorName);

    runtime.bubble = scene.createSpeechBubble?.(
      point.x,
      point.y,
      text,
      0
    );

    if (!runtime.bubble) {
      runtime.bubble = scene.add.text(
        point.x,
        point.y,
        text,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#2b211a",
          backgroundColor: "#fff7dd",
          padding: { x: 10, y: 8 },
          wordWrap: { width: 270 },
          align: "center"
        }
      )
        .setOrigin(0.5)
        .setDepth(1800);
    }

    runtime.bubble?.setDepth?.(1800);

    if (
      thought &&
      runtime.bubble?.add &&
      scene.add
    ) {
      const c1 = scene.add.circle(
        -7,
        42,
        6,
        0xfff7dd,
        1
      ).setStrokeStyle(2, 0x463a33, 1);

      const c2 = scene.add.circle(
        -15,
        54,
        3.5,
        0xfff7dd,
        1
      ).setStrokeStyle(2, 0x463a33, 1);

      runtime.bubble.add([c1, c2]);
    }
  }

  function makeStoryOverlay(onClick) {
    removeOverlay();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "esthi-story-v57";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "499000",
      background: "trancoopent",
      pointerEvents: "auto",
      touchAction: "manipulation",
      cursor: "pointer",
      WebkitTapHighlightColor: "trancoopent"
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
      onClick?.();
    };

    overlay.addEventListener("pointerdown", stop, { passive: false });
    overlay.addEventListener("pointerup", advance, { passive: false });
    overlay.addEventListener("click", advance, { passive: false });

    root.appendChild(overlay);
    runtime.overlay = overlay;
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Story movement / effects
  // ---------------------------------------------------------------------------

  function startEsthiWalkBob(scene, esthi) {
    scene.__esthiWalkBobV57?.stop?.();
    scene.__esthiWalkBobV57?.remove?.();

    scene.__esthiWalkBobV57 = scene.tweens.add({
      targets: esthi,
      y: esthi.y - 2,
      angle: { from: -1, to: 1 },
      duration: 170,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  function stopEsthiWalkBob(scene, esthi, targetY) {
    scene.__esthiWalkBobV57?.stop?.();
    scene.__esthiWalkBobV57?.remove?.();
    scene.__esthiWalkBobV57 = null;

    esthi.setAngle(0);
    esthi.y = targetY;
  }

  function tweenActorX(scene, target, x, duration, onComplete) {
    scene.tweens.add({
      targets: target,
      x,
      duration,
      ease: "Linear",
      onComplete
    });
  }

  function walkPair(scene, simonX, esthiX, done) {
    const player = scene.player;
    const esthi = scene.__esthiV57;

    if (!player?.active || !esthi?.active) {
      done?.();
      return;
    }

    const groundY = Number(scene.__esthiGroundYV57) || player.y;

    player.setFlipX(simonX < player.x);
    player.play?.("simon-run", true);

    esthi.setScale(1);
    esthi.setFlipX?.(esthiX < esthi.x);
    startEsthiWalkBob(scene, esthi);

    const distance = Math.max(
      Math.abs(simonX - player.x),
      Math.abs(esthiX - esthi.x)
    );

    const duration = Phaser.Math.Clamp(
      Math.round((distance / 215) * 1000),
      650,
      3100
    );

    let complete = 0;

    const finishOne = () => {
      complete += 1;

      if (complete < 2) return;

      stopEsthiWalkBob(scene, esthi, groundY);
      player.play?.("simon-idle", true);
      player.setFlipX(esthi.x < player.x);
      esthi.setFlipX?.(player.x < esthi.x);
      done?.();
    };

    tweenActorX(scene, player, simonX, duration, finishOne);
    tweenActorX(scene, esthi, esthiX, duration, finishOne);
  }

  function approachSimon(scene, done) {
    const player = scene.player;
    const esthi = scene.__esthiV57;
    const groundY = scene.__esthiGroundYV57;

    esthi
      .setVisible(true)
      .setAlpha(1)
      .setPosition(
        Math.min(WORLD.parkRight - 55, player.x + 205),
        groundY
      );

    esthi.__esthiName?.setVisible?.(false);
    setEsthiProps(esthi, false);

    startEsthiWalkBob(scene, esthi);

    tweenActorX(
      scene,
      esthi,
      player.x + 78,
      760,
      () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        esthi.setFlipX?.(true);
        player.setFlipX(false);
        done?.();
      }
    );
  }

  function enterCoop(scene, done) {
    const esthi = scene.__esthiV57;
    const groundY = scene.__esthiGroundYV57;

    startEsthiWalkBob(scene, esthi);

    scene.tweens.add({
      targets: esthi,
      x: WORLD.coopDoorX,
      alpha: 0,
      duration: 520,
      ease: "Sine.easeIn",
      onComplete: () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        esthi.setVisible(false);
        window.setTimeout(done, 700);
      }
    });
  }

  function leaveCoop(scene, done) {
    const esthi = scene.__esthiV57;
    const groundY = scene.__esthiGroundYV57;

    esthi
      .setPosition(WORLD.coopDoorX, groundY)
      .setVisible(true)
      .setAlpha(0);

    setEsthiProps(esthi, true);
    startEsthiWalkBob(scene, esthi);

    scene.tweens.add({
      targets: esthi,
      x: WORLD.coopDoorX - 54,
      alpha: 1,
      duration: 590,
      ease: "Sine.easeOut",
      onComplete: () => {
        stopEsthiWalkBob(scene, esthi, groundY);
        done?.();
      }
    });
  }

  function sitAtBench(scene, done) {
    const player = scene.player;
    const esthi = scene.__esthiV57;
    const groundY = scene.__esthiGroundYV57;

    player
      .setPosition(WORLD.benchX - 37, groundY + 11)
      .setScale(0.39)
      .setFlipX(false)
      .play?.("simon-idle", true);

    esthi
      .setPosition(WORLD.benchX + 35, groundY + 10)
      .setAngle(0)
      .setScale(0.94)
      .setFlipX?.(true);

    setEsthiProps(esthi, false);

    window.setTimeout(done, 280);
  }

  function createPowder(scene) {
    destroyPowder();

    const player = scene.player;

    const mouth =
      scene.getPlayerMouthAnchor?.(
        player.flipX ? -1 : 1
      ) || {
        x: player.x + 22,
        y: player.y - 34
      };

    const powder = scene.add.container(
      mouth.x,
      mouth.y + 5
    ).setDepth(1900);

    [
      [-7, 0, 3],
      [-1, 4, 3],
      [5, 0, 2.5],
      [8, 6, 2],
      [-8, 7, 2]
    ].forEach(([x, y, r]) => {
      powder.add(
        scene.add.circle(
          x,
          y,
          r,
          0xffffff,
          0.95
        )
      );
    });

    runtime.powder = powder;
  }

  function feedSimon(scene, done) {
    const esthi = scene.__esthiV57;
    const player = scene.player;

    const mouth =
      scene.getPlayerMouthAnchor?.(
        player.flipX ? -1 : 1
      ) || {
        x: player.x + 22,
        y: player.y - 34
      };

    const snack = scene.add.container(
      esthi.x - 16,
      esthi.y - 62
    ).setDepth(1910);

    snack.add(
      scene.add.circle(
        0,
        0,
        8,
        0xf5eee4,
        1
      ).setStrokeStyle(2, 0xd7cbbb, 1)
    );

    snack.add(
      scene.add.circle(
        3,
        -2,
        2,
        0xffffff,
        0.95
      )
    );

    scene.tweens.add({
      targets: snack,
      x: mouth.x,
      y: mouth.y,
      duration: 620,
      ease: "Sine.easeInOut",
      onComplete: () => {
        snack.destroy(true);
        createPowder(scene);
        done?.();
      }
    });
  }

  function kissSimon(scene, done) {
    const esthi = scene.__esthiV57;
    const player = scene.player;

    const originalX = esthi.x;

    scene.tweens.add({
      targets: esthi,
      x: player.x + 25,
      angle: -3,
      duration: 430,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (runtime.powder) {
          scene.tweens.add({
            targets: runtime.powder,
            alpha: 0,
            duration: 240,
            onComplete: destroyPowder
          });
        }

        const heart = scene.add.text(
          player.x + 18,
          player.y - 112,
          "♥",
          {
            fontFamily: "Georgia, serif",
            fontSize: "25px",
            color: "#e85f78"
          }
        )
          .setOrigin(0.5)
          .setDepth(1920);

        scene.tweens.add({
          targets: heart,
          y: heart.y - 22,
          scale: 1.3,
          alpha: 0,
          duration: 720,
          onComplete: () => heart.destroy()
        });

        window.setTimeout(() => {
          scene.tweens.add({
            targets: esthi,
            x: originalX,
            angle: 0,
            duration: 360,
            ease: "Sine.easeOut",
            onComplete: done
          });
        }, 450);
      }
    });
  }

  function finishStory(scene) {
    const player = scene.player;
    const groundY = scene.__esthiGroundYV57;

    cleanupStoryVisuals();

    state.introStarted = false;
    state.introCompleted = true;
    state.firstKissUnlocked = true;

    if (player?.active) {
      player
        .setScale(0.42)
        .setAngle(0)
        .setPosition(WORLD.benchX - 35, groundY)
        .play?.("simon-idle", true);

      if (player.body) {
        player.body.enable = true;
      }
    }

    showEsthiPermanently(scene, groundY);
    showUnlock(scene);
    setStoryLock(scene, false);
  }

  // ---------------------------------------------------------------------------
  // Sequence
  // Every actual line waits for a click. Movement/physical actions progress
  // automatically only after their animation is finished.
  // ---------------------------------------------------------------------------

  function startEsthiStory(scene) {
    if (
      !scene ||
      state.introStarted ||
      state.introCompleted ||
      !safeWorldInteraction(scene)
    ) {
      return;
    }

    const player = scene.player;
    const groundY = player.y;

    state.introStarted = true;
    runtime.activeScene = scene;
    runtime.sequenceToken += 1;

    const token = runtime.sequenceToken;

    scene.__esthiGroundYV57 = groundY;

    setStoryLock(scene, true);

    player.setVelocity?.(0, 0);
    player.play?.("simon-idle", true);

    if (player.body) {
      player.body.enable = false;
    }

    const steps = [
      {
        type: "action",
        run: (next) => approachSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Excuse me... du weisst vielleicht, wo kaufen Waschmittel?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Waschmittel?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Ja. Für Kleider. Meine Kleider... Problem."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Äh ja. Da vorne isch grad de Coop."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Du zeigen?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Ja klar."
      },

      {
        type: "action",
        run: (next) => {
          walkPair(
            scene,
            WORLD.coopDoorX - 105,
            WORLD.coopDoorX - 55,
            next
          );
        }
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Danke! Du wartest eine kleine Moment?"
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Wieso?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Ich kaufe dir etwas."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Du muesch mir nüt chaufe."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Warten."
      },

      {
        type: "action",
        run: (next) => enterCoop(scene, next)
      },

      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Was lauft da eigentlich grad?"
      },

      {
        type: "action",
        run: (next) => leaveCoop(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Waschmittel. Und koreanische Süssigkeit."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Okay. Jetzt Park."
      },

      {
        type: "action",
        run: (next) => {
          walkPair(
            scene,
            WORLD.benchX - 42,
            WORLD.benchX + 40,
            next
          );
        }
      },

      {
        type: "action",
        run: (next) => sitAtBench(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "In Korea... wir machen so."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was mache?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Freunde füttern sich."
      },
      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Fründe?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Mund auf."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Mund. Auf."
      },

      {
        type: "action",
        run: (next) => feedSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "simon",
        text: "Mmmff."
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Oh."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Was?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Du hast überall."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "Wo?"
      },
      {
        type: "bubble",
        actor: "esthi",
        text: "Warte."
      },

      {
        type: "action",
        run: (next) => kissSimon(scene, next)
      },

      {
        type: "bubble",
        actor: "esthi",
        text: "Jetzt sauber."
      },
      {
        type: "bubble",
        actor: "simon",
        text: "..."
      },
      {
        type: "bubble",
        actor: "simon",
        thought: true,
        text: "Was zur Höll isch grad passiert?"
      }
    ];

    let index = 0;
    let actionRunning = false;

    const render = () => {
      if (
        token !== runtime.sequenceToken ||
        !scene.sys?.isActive?.()
      ) {
        return;
      }

      destroyBubble();

      const step = steps[index];

      if (!step) {
        finishStory(scene);
        return;
      }

      if (step.type === "action") {
        actionRunning = true;

        step.run(() => {
          if (token !== runtime.sequenceToken) return;

          actionRunning = false;
          index += 1;
          render();
        });

        return;
      }

      showStoryBubble(
        scene,
        step.actor,
        step.text,
        Boolean(step.thought)
      );
    };

    makeStoryOverlay(() => {
      if (actionRunning) return;

      const step = steps[index];
      if (!step || step.type !== "bubble") return;

      index += 1;
      render();
    });

    render();
  }

  // ---------------------------------------------------------------------------
  // Oerlikon scene integration
  // ---------------------------------------------------------------------------

  function buildEsthiWorld(scene) {
    if (!isOerlikon(scene)) return;

    const groundY =
      scene.player?.active
        ? scene.player.y
        : 294;

    scene.__esthiGroundYV57 = groundY;

    createEsthi(
      scene,
      WORLD.benchX + 92,
      groundY
    );

    if (state.introCompleted) {
      showEsthiPermanently(scene, groundY);
    }

    scene.events?.once?.("shutdown", () => {
      if (
        scene.__esthiStoryActive &&
        !state.introCompleted
      ) {
        state.introStarted = false;
      }

      runtime.sequenceToken += 1;
      cleanupStoryVisuals();
      runtime.activeScene = null;
    });
  }

  function shouldTrigger(scene) {
    if (
      !isOerlikon(scene) ||
      state.introCompleted ||
      state.introStarted ||
      !safeWorldInteraction(scene)
    ) {
      return false;
    }

    const player = scene.player;
    if (!player?.body) return false;

    const grounded = Boolean(
      player.body.blocked?.down ||
      player.body.touching?.down
    );

    return (
      grounded &&
      player.x >= WORLD.parkTriggerLeft &&
      player.x <= WORLD.parkTriggerRight
    );
  }

  function patchOerlikonLifecycle() {
    const SceneClass =
      window.__SIMON_OERLIKON_SCENE_CLASS__;

    const proto = SceneClass?.prototype;
    if (!proto) return false;

    if (
      typeof proto.create === "function" &&
      !proto.create.__esthiOerlikonV57
    ) {
      const originalCreate = proto.create;

      const wrappedCreate = function createEsthiOerlikonV57(...args) {
        const result = originalCreate.apply(this, args);

        if (isOerlikon(this)) {
          buildEsthiWorld(this);
        }

        return result;
      };

      wrappedCreate.__esthiOerlikonV57 = true;
      proto.create = wrappedCreate;
    }

    if (
      typeof proto.update === "function" &&
      !proto.update.__esthiOerlikonV57
    ) {
      const originalUpdate = proto.update;

      const wrappedUpdate = function updateEsthiOerlikonV57(time, delta) {
        const result = originalUpdate.call(this, time, delta);

        if (
          isOerlikon(this) &&
          shouldTrigger(this)
        ) {
          startEsthiStory(this);
        }

        return result;
      };

      wrappedUpdate.__esthiOerlikonV57 = true;
      proto.update = wrappedUpdate;
    }

    return true;
  }

  patchOerlikonLifecycle();

  const installTimer = window.setInterval(() => {
    if (patchOerlikonLifecycle()) {
      window.clearInterval(installTimer);
    }
  }, 250);

  const api = Object.freeze({
    VERSION,
    state,
    WORLD,

    resetStory() {
      state.introStarted = false;
      state.introCompleted = false;
      state.firstKissUnlocked = false;
    },

    startNow() {
      const scene = getOerlikon(getGame());

      if (!scene?.sys?.isActive?.()) {
        return false;
      }

      state.introStarted = false;
      state.introCompleted = false;
      startEsthiStory(scene);
      return true;
    }
  });

  window.SimonEsthiOerlikonV57 = api;
  window.SimonEsthiV52 = api;

  console.info(
    "Esthi Oerlikon v57: Esthi lebt jetzt im Kirchenpark Oerlikon und geht zum Coop."
  );
})();
