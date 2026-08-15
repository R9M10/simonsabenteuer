(() => {
  "use strict";

  const originalStartSimonGame = window.startSimonGame;

  if (typeof originalStartSimonGame !== "function") {
    console.error("Animation-Fix 5.1: startSimonGame wurde nicht gefunden.");
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
    const scene =
      game.scene?.getScene("MilchbuckScene") ||
      game.scene?.getScene("PrototypeScene");

    if (scene?.player?.body) {
      installAnimationFix(scene);
      return;
    }

    if (attempt >= 140) {
      console.error("Animation-Fix 5.1: Spielszene wurde nicht rechtzeitig bereit.");
      return;
    }

    window.setTimeout(() => waitForScene(game, attempt + 1), 50);
  }

  function installAnimationFix(scene) {
    if (scene.__simonAnimationFixInstalled51) return;
    scene.__simonAnimationFixInstalled51 = true;

    /*
      LAUFEN

      Das Original verwendet 8–17 linear. Mehrere davon sind fast identische
      Beinpositionen (vor allem 10–12), wodurch Simon optisch kurz "hängen"
      bleibt. Gleichzeitig ist Frame 17 bereits sehr nah an einer Idle-/Walk-Pose.

      Wir benutzen deshalb nur die deutlich unterscheidbaren Schlüsselposen:
      8  = Kontakt / langer Schritt
      9  = Bein hebt ab
      10 = frühe Schwungphase
      11 = große Schwungphase
      13 = Landung / Kompression
      14 = Durchgang
      15 = Gegenschritt
      16 = Rückkehr zum Kontakt

      Kein Ping-Pong: die Bewegung läuft immer vorwärts durch den Zyklus.
    */
    if (scene.anims.exists("simon-run")) {
      scene.anims.remove("simon-run");
    }

    scene.anims.create({
      key: "simon-run",
      frames: [
        { key: "simon", frame: 8,  duration: 78 },
        { key: "simon", frame: 9,  duration: 62 },
        { key: "simon", frame: 10, duration: 58 },
        { key: "simon", frame: 11, duration: 62 },
        { key: "simon", frame: 13, duration: 72 },
        { key: "simon", frame: 14, duration: 66 },
        { key: "simon", frame: 15, duration: 62 },
        { key: "simon", frame: 16, duration: 72 }
      ],
      frameRate: 14,
      repeat: -1,
      skipMissedFrames: true
    });

    let wasGrounded = true;
    let landingUntil = 0;

    /*
      SPRINGEN
      Die bestehende Verbesserung bleibt: nicht 18–25 blind als Film abspielen,
      sondern eine passende Pose anhand der echten Y-Geschwindigkeit wählen.
      Das ist jetzt zusätzlich mit uiLocked/dialogues kompatibel.
    */
    scene.events.on("postupdate", (time) => {
      const player = scene.player;
      const body = player?.body;

      if (!player || !body) return;

      const grounded = body.blocked.down || body.touching.down;
      const shooting =
        typeof scene.shootingUntil === "number" &&
        time < scene.shootingUntil;

      // Bei Ticketmodal/Dialog/Türsteher-Dialogen lässt der Fix die aktuelle
      // Spiellogik vollständig in Ruhe.
      if (scene.uiLocked) {
        wasGrounded = grounded;
        return;
      }

      if (shooting) {
        wasGrounded = grounded;
        return;
      }

      if (!grounded) {
        wasGrounded = false;
        player.anims.stop();

        const vy = body.velocity.y;

        if (vy < -260) {
          player.setFrame(19); // kräftiger Absprung
        } else if (vy < -80) {
          player.setFrame(20); // Aufstieg
        } else if (vy < 100) {
          player.setFrame(21); // Scheitelpunkt
        } else {
          player.setFrame(22); // Fall
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

    console.info("Simon Animation-Fix 5.1 aktiv.");
  }
})();
