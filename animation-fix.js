(() => {
  "use strict";

  if (window.__SIMON_ANIMATION_FIX_V10__) return;
  window.__SIMON_ANIMATION_FIX_V10__ = true;

  const originalStartSimonGame = window.startSimonGame;
  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix v10: startSimonGame wurde nicht gefunden.");
    return;
  }

  window.startSimonGame = function startSimonGameWithJumpFix(...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (game) watchScenes(game);
    return game;
  };

  function watchScenes(game) {
    if (game.__simonSceneWatcherV10) return;
    game.__simonSceneWatcherV10 = true;

    const installOnAvailableScenes = () => {
      [
        "MilchbuckScene",
        "BahnhofquaiScene",
        "PrototypeScene"
      ].forEach((key) => {
        const scene = game.scene?.getScene(key);
        if (scene?.player?.body) {
          installJumpFix(scene);
        }
      });
    };

    installOnAvailableScenes();
    window.setInterval(installOnAvailableScenes, 350);
  }

  function installJumpFix(scene) {
    if (scene.__simonJumpFixInstalledV10) return;
    scene.__simonJumpFixInstalledV10 = true;

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
  }

  console.info("Simon Animation-Fix v10 aktiv; Milchbuck + Bahnhofquai werden überwacht.");
})();
