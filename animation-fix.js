(() => {
  "use strict";

  if (window.__SIMON_ANIMATION_FIX_V6__) return;
  window.__SIMON_ANIMATION_FIX_V6__ = true;

  const originalStartSimonGame = window.startSimonGame;

  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix v6: startSimonGame wurde nicht gefunden.");
    return;
  }

  window.startSimonGame = function startSimonGameWithAnimationFix(...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (game) {
      waitForScene(game);
    }
    return game;
  };

  function waitForScene(game, attempt = 0) {
    const scene = game.scene?.getScene("MilchbuckScene") || game.scene?.getScene("PrototypeScene");

    if (scene?.player?.body) {
      installAnimationFix(scene);
      return;
    }

    if (attempt >= 160) {
      console.error("Animation-Fix v6: Spielszene wurde nicht rechtzeitig bereit.");
      return;
    }

    window.setTimeout(() => waitForScene(game, attempt + 1), 50);
  }

  function installAnimationFix(scene) {
    if (scene.__simonAnimationFixInstalledV6) return;
    scene.__simonAnimationFixInstalledV6 = true;

    /*
      RUN FIX
      Das Problem liegt nicht nur im Loop, sondern in der Auswahl der Frames.
      Deshalb definieren wir einen komplett neuen Run-Zyklus auf Basis der
      brauchbarsten Laufposen. Weniger "hängende" Zwischenbilder, klarere
      Beinwechsel, dadurch flüssiger.
    */
    if (scene.anims.exists("simon-run")) {
      scene.anims.remove("simon-run");
    }

    scene.anims.create({
      key: "simon-run",
      frames: scene.anims.generateFrameNumbers("simon", {
        frames: [8, 9, 10, 11, 12, 13, 14, 15, 14, 13, 12, 11]
      }),
      frameRate: 16,
      repeat: -1,
      skipMissedFrames: true
    });

    let wasGrounded = true;
    let landingUntil = 0;

    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;
      if (!player || !body) return;

      const grounded = body.blocked.down || body.touching.down;
      const shooting = typeof scene.shootingUntil === 'number' && time < scene.shootingUntil;

      // Dialoge / Modal / UI-Lock unangetastet lassen.
      if (scene.uiLocked) {
        wasGrounded = grounded;
        return;
      }

      if (shooting) {
        wasGrounded = grounded;
        return;
      }

      // Jump fix bleibt aktiv.
      if (!grounded) {
        wasGrounded = false;
        player.anims.stop();

        const vy = body.velocity.y;
        if (vy < -260) {
          player.setFrame(19);
        } else if (vy < -80) {
          player.setFrame(20);
        } else if (vy < 100) {
          player.setFrame(21);
        } else {
          player.setFrame(22);
        }
        return;
      }

      if (!wasGrounded) {
        landingUntil = time + 70;
        wasGrounded = true;
      }

      if (time < landingUntil) {
        player.anims.stop();
        player.setFrame(22);
      }
    });

    console.info("Simon Animation-Fix v6 aktiv.");
  }
})();
