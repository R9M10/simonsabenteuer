(() => {
  "use strict";

  if (window.__SIMON_ANIMATION_FIX_V9__) return;
  window.__SIMON_ANIMATION_FIX_V9__ = true;

  const originalStartSimonGame = window.startSimonGame;
  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix v9: startSimonGame wurde nicht gefunden.");
    return;
  }

  window.startSimonGame = function startSimonGameWithJumpFix(...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (game) waitForScene(game);
    return game;
  };

  function waitForScene(game, attempt = 0) {
    const scene =
      game.scene?.getScene("MilchbuckScene") ||
      game.scene?.getScene("PrototypeScene");

    if (scene?.player?.body) {
      installJumpFix(scene);
      return;
    }

    if (attempt >= 160) {
      console.error("Animation-Fix v9: Spielszene wurde nicht rechtzeitig bereit.");
      return;
    }

    window.setTimeout(() => waitForScene(game, attempt + 1), 50);
  }

  function installJumpFix(scene) {
    if (scene.__simonJumpFixInstalledV9) return;
    scene.__simonJumpFixInstalledV9 = true;

    let wasGrounded = true;
    let landingUntil = 0;

    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;
      if (!player || !body) return;

      const grounded = body.blocked.down || body.touching.down;
      const shooting =
        typeof scene.shootingUntil === "number" &&
        time < scene.shootingUntil;

      const beingHit =
        typeof scene.playerHitUntil === "number" &&
        time < scene.playerHitUntil;

      // Niemals HIT, KO, Dialoge, Menüs, Tramfahrt oder den HIVE-Tanz
      // durch die Sprungkorrektur überschreiben.
      if (
        scene.uiLocked ||
        scene.playerDying ||
        scene.danceOverlay ||
        scene.tramTransitActive ||
        shooting ||
        beingHit
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

    console.info("Simon Jump-Fix v9 aktiv; HIT/KO werden respektiert.");
  }
})();
