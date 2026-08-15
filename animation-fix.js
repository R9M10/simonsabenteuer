(() => {
  "use strict";

  if (window.__SIMON_ANIMATION_FIX_V8__) return;
  window.__SIMON_ANIMATION_FIX_V8__ = true;

  const originalStartSimonGame = window.startSimonGame;
  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix v8: startSimonGame wurde nicht gefunden.");
    return;
  }

  window.startSimonGame = function startSimonGameWithJumpFix(...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (game) waitForScene(game);
    return game;
  };

  function waitForScene(game, attempt = 0) {
    const scene = game.scene?.getScene("MilchbuckScene") || game.scene?.getScene("PrototypeScene");
    if (scene?.player?.body) {
      installJumpFix(scene);
      return;
    }
    if (attempt >= 160) {
      console.error("Animation-Fix v8: Spielszene wurde nicht rechtzeitig bereit.");
      return;
    }
    window.setTimeout(() => waitForScene(game, attempt + 1), 50);
  }

  function installJumpFix(scene) {
    if (scene.__simonJumpFixInstalledV8) return;
    scene.__simonJumpFixInstalledV8 = true;

    // RUN IS INTENTIONALLY UNTOUCHED.
    // The current game.js uses the original animation from the first spritesheet.
    let wasGrounded = true;
    let landingUntil = 0;

    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;
      if (!player || !body) return;

      const grounded = body.blocked.down || body.touching.down;
      const shooting = typeof scene.shootingUntil === "number" && time < scene.shootingUntil;

      // Friend's newer game states: never interfere with combat, death, modal/dialogue
      // locking, or the HIVE dance overlay.
      if (
        scene.uiLocked ||
        scene.playerDying ||
        scene.danceOverlay ||
        shooting
      ) {
        wasGrounded = grounded;
        return;
      }

      if (!grounded) {
        wasGrounded = false;
        player.anims.stop();
        const vy = body.velocity.y;

        if (vy < -260) player.setFrame(19);
        else if (vy < -80) player.setFrame(20);
        else if (vy < 100) player.setFrame(21);
        else player.setFrame(22);
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

    console.info("Simon Jump-Fix v8 aktiv; Run bleibt original.");
  }
})();
