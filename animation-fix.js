(() => {
  "use strict";
  if (window.__SIMON_ANIMATION_FIX_V9__) return;
  window.__SIMON_ANIMATION_FIX_V9__ = true;
  const originalStartSimonGame = window.startSimonGame;
  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix v9: startSimonGame wurde nicht gefunden.");
    return;
  }
  window.startSimonGame = function (...args) {
    const game = originalStartSimonGame.apply(this, args);
    if (game) waitForScene(game);
    return game;
  };
  function waitForScene(game, attempt = 0) {
    const scene = game.scene?.getScene("MilchbuckScene") || game.scene?.getScene("PrototypeScene");
    if (scene?.player?.body) return install(scene);
    if (attempt >= 180) return console.error("Animation-Fix v9: Szene nicht bereit.");
    setTimeout(() => waitForScene(game, attempt + 1), 50);
  }
  function install(scene) {
    if (scene.__simonJumpFixInstalledV9) return;
    scene.__simonJumpFixInstalledV9 = true;
    let wasGrounded = true;
    let landingUntil = 0;
    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;
      if (!player || !body) return;
      const grounded = body.blocked.down || body.touching.down;
      const shooting = typeof scene.shootingUntil === "number" && time < scene.shootingUntil;
      if (scene.uiLocked || scene.playerDying || scene.danceOverlay || shooting) {
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
      if (!wasGrounded) { landingUntil = time + 70; wasGrounded = true; }
      if (time < landingUntil) { player.anims.stop(); player.setFrame(22); }
    });
  }
})();
