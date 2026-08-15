(() => {
  "use strict";

  // Dieses Add-on verändert NICHT die Milchbuck-Welt oder die Steuerungslogik.
  // Es hängt sich nur an die bereits vorhandene Szene und korrigiert die
  // Bewegungsanimationen von Simon.

  const originalStartSimonGame = window.startSimonGame;

  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix: startSimonGame wurde nicht gefunden.");
    return;
  }

  window.startSimonGame = function startSimonGameWithAnimationFix(...args) {
    const game = originalStartSimonGame.apply(this, args);

    if (game) {
      waitForMilchbuckScene(game);
    }

    return game;
  };

  function waitForMilchbuckScene(game, attempt = 0) {
    const scene = game.scene?.getScene("MilchbuckScene");

    if (scene?.player?.body) {
      installAnimationFix(scene);
      return;
    }

    if (attempt >= 120) {
      console.error("Animation-Fix: MilchbuckScene wurde nicht rechtzeitig bereit.");
      return;
    }

    window.setTimeout(() => {
      waitForMilchbuckScene(game, attempt + 1);
    }, 50);
  }

  function installAnimationFix(scene) {
    if (scene.__simonAnimationFixInstalled) return;
    scene.__simonAnimationFixInstalled = true;

    // RUN
    // Die letzten beiden Frames 16/17 wirken deutlich aufrechter/langsamer und
    // brechen den Laufzyklus optisch. Deshalb läuft der echte Zyklus nur 8–15.
    // 14 fps passen besser zur aktuellen horizontalen Geschwindigkeit (175 px/s).
    if (scene.anims.exists("simon-run")) {
      scene.anims.remove("simon-run");
    }

    scene.anims.create({
      key: "simon-run",
      frames: scene.anims.generateFrameNumbers("simon", {
        start: 8,
        end: 15
      }),
      frameRate: 14,
      repeat: -1
    });

    let wasGrounded = true;
    let landingUntil = 0;

    // POST_UPDATE läuft nach der vorhandenen scene.update()-Methode.
    // Damit bleiben Bewegung, Input, Kamera und Schießen unangetastet und wir
    // korrigieren nur das letztlich gerenderte Sprungbild.
    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;

      if (!player || !body) return;

      const grounded = body.blocked.down || body.touching.down;
      const shooting = time < scene.shootingUntil;

      // Während einer Schussanimation soll der bestehende Code die Kontrolle
      // über die Frames behalten.
      if (shooting) {
        wasGrounded = grounded;
        return;
      }

      if (!grounded) {
        wasGrounded = false;

        // Die alte Version spielte stumpf 18–25 ab. Darin liegen aber mehrere
        // Posen, die nicht zu einer kontinuierlichen Flugbahn gehören.
        // Jetzt bestimmt die echte vertikale Geschwindigkeit die Pose.
        player.anims.stop();

        const vy = body.velocity.y;
        let frame;

        if (vy < -260) {
          frame = 19; // kräftiger Aufstieg
        } else if (vy < -80) {
          frame = 20; // weiterer Aufstieg / Einrollen
        } else if (vy < 100) {
          frame = 21; // Scheitelpunkt
        } else {
          frame = 22; // Abstieg / Landung vorbereiten
        }

        player.setFrame(frame);
        return;
      }

      // Sehr kurze Landepose, damit der Sprung nicht abrupt direkt in Idle/Run
      // springt. Danach übernimmt die bestehende Idle-/Run-Logik wieder.
      if (!wasGrounded) {
        landingUntil = time + 75;
        wasGrounded = true;
      }

      if (time < landingUntil) {
        player.anims.stop();
        player.setFrame(22);
      }
    });

    console.info("Simon Animation-Fix v4 aktiv.");
  }
})();
