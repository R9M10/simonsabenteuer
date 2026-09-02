(() => {
  "use strict";

  if (window.__SIMON_BUGFIX_V77__) return;
  window.__SIMON_BUGFIX_V77__ = true;

  const VERSION = 77;

  const OERLIKON_KEY = "OerlikonScene";
  const WG_KEY = "WGInteriorScene";
  const ROOM_KEY = "SimonRoomScene";

  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;

  const SALERSTEIG_X = 300;
  const STERNEN_X = 2870;

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(key) {
    try {
      return getGame()?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function safeDestroy(object) {
    try {
      object?.destroy?.();
    } catch {}
  }

  // ========================================================================
  // 1. LION: actual in-world dance before Simon + lion enter the HIVE.
  // ========================================================================

  function patchLionDance() {
    const proto =
      window.__SIMON_SCENE_CLASSES__
        ?.MilchbuckScene
        ?.prototype;

    if (
      !proto ||
      typeof proto.chooseDanceWithLion !== "function"
    ) {
      return false;
    }

    if (proto.chooseDanceWithLion.__v77) {
      return true;
    }

    const dance =
      function chooseDanceWithLionV77() {
        if (
          !this.fightLion ||
          !this.player?.active ||
          this.playerDying ||
          this.__lionDanceV77
        ) {
          return;
        }

        this.__lionDanceV77 = true;

        this.clearLionQuestion?.();
        this.stopLionPurring?.();
        this.setUILocked?.(true);

        const player = this.player;
        const lion = this.fightLion;
        const body = player.body;

        const saved = {
          x: Number(player.x) || 0,
          y: Number(player.y) || 250,
          angle: Number(player.angle) || 0,
          flipX: Boolean(player.flipX),
          allowGravity:
            body?.allowGravity !== false,
          moves:
            body?.moves !== false,
          animTimeScale:
            Number(player.anims?.timeScale) || 1,
          lionY:
            Number(lion.y) || 278,
          lionAngle:
            Number(lion.angle) || 0
        };

        player.setVelocity?.(0, 0);

        if (body) {
          body.allowGravity = false;
          body.moves = false;
        }

        player.anims.timeScale = 1.22;

        const lionOnRight =
          lion.x >= player.x;

        const danceX =
          lion.x +
          (lionOnRight ? -108 : 108);

        const baseY =
          Math.min(
            GROUND_TOP - 68,
            Math.max(224, saved.y)
          );

        const notes = [];

        const addNote = (
          text,
          dx,
          dy,
          delay
        ) => {
          this.time.delayedCall(
            delay,
            () => {
              if (
                !this.sys?.isActive?.() ||
                !this.__lionDanceV77
              ) {
                return;
              }

              const note =
                this.add.text(
                  danceX + dx,
                  baseY + dy,
                  text,
                  {
                    fontFamily:
                      '"Press Start 2P", monospace',
                    fontSize: "10px",
                    color: "#ffe38b",
                    stroke: "#54364d",
                    strokeThickness: 4
                  }
                )
                  .setOrigin(0.5)
                  .setDepth(90);

              notes.push(note);

              this.tweens.add({
                targets: note,
                y: note.y - 34,
                alpha: 0,
                duration: 760,
                ease: "Sine.easeOut",
                onComplete: () =>
                  safeDestroy(note)
              });
            }
          );
        };

        addNote("♪", -48, -60, 450);
        addNote("♫", 54, -75, 1120);
        addNote("♪", -62, -82, 1950);
        addNote("♫", 58, -56, 2700);

        const cleanupAndEnter = () => {
          if (!this.__lionDanceV77) {
            return;
          }

          this.__lionDanceV77 = false;

          this.tweens?.killTweensOf?.(
            player
          );
          this.tweens?.killTweensOf?.(
            lion
          );

          notes.forEach(safeDestroy);

          player
            .setAngle(0)
            .setPosition(
              danceX,
              baseY
            )
            .setVelocity?.(0, 0);

          player.setFlipX(
            lionOnRight
              ? false
              : true
          );

          player.anims.timeScale =
            saved.animTimeScale;

          if (body) {
            body.allowGravity =
              saved.allowGravity;
            body.moves =
              saved.moves;
          }

          if (lion?.active) {
            lion.setY(saved.lionY);
            lion.setAngle(
              saved.lionAngle
            );
          }

          player.play?.(
            "simon-idle",
            true
          );

          // The normal HIVE dance sequence now begins only AFTER the
          // visible street dance beside the lion.
          this.enterHiveDance?.();
        };

        const startChoreography = () => {
          if (
            !this.sys?.isActive?.() ||
            !player?.active ||
            !lion?.active
          ) {
            cleanupAndEnter();
            return;
          }

          player.play?.(
            "simon-run",
            true
          );

          // Lion reacts/bounces in rhythm while Simon performs actual
          // footwork: lateral steps + direction changes + two clear hops.
          this.tweens.add({
            targets: lion,
            y: saved.lionY - 9,
            angle:
              lionOnRight ? 5 : -5,
            duration: 250,
            yoyo: true,
            repeat: 5,
            ease: "Quad.easeInOut"
          });

          const steps = [
            {
              x: danceX - 18,
              y: baseY - 7,
              angle: -7,
              flip: false,
              duration: 190
            },
            {
              x: danceX + 18,
              y: baseY,
              angle: 7,
              flip: true,
              duration: 190
            },
            {
              x: danceX - 5,
              y: baseY - 28,
              angle: -10,
              flip: false,
              duration: 230
            },
            {
              x: danceX + 8,
              y: baseY,
              angle: 5,
              flip: false,
              duration: 180
            },
            {
              x: danceX + 28,
              y: baseY - 9,
              angle: 10,
              flip: true,
              duration: 190
            },
            {
              x: danceX - 26,
              y: baseY - 4,
              angle: -10,
              flip: false,
              duration: 210
            },
            {
              x: danceX,
              y: baseY - 34,
              angle: 0,
              flip: true,
              duration: 250
            },
            {
              x: danceX + 20,
              y: baseY,
              angle: 8,
              flip: false,
              duration: 190
            },
            {
              x: danceX - 20,
              y: baseY - 13,
              angle: -8,
              flip: true,
              duration: 190
            },
            {
              x: danceX + 24,
              y: baseY - 18,
              angle: 11,
              flip: false,
              duration: 205
            },
            {
              x: danceX - 8,
              y: baseY,
              angle: -4,
              flip: false,
              duration: 175
            },
            {
              x: danceX + 8,
              y: baseY - 25,
              angle: 7,
              flip: true,
              duration: 220
            },
            {
              x: danceX,
              y: baseY,
              angle: 0,
              flip:
                !lionOnRight,
              duration: 210
            }
          ];

          let index = 0;

          const nextStep = () => {
            if (
              !this.__lionDanceV77 ||
              !this.sys?.isActive?.()
            ) {
              return;
            }

            if (index >= steps.length) {
              this.time.delayedCall(
                250,
                cleanupAndEnter
              );
              return;
            }

            const step =
              steps[index++];

            player.setFlipX(
              step.flip
            );

            this.tweens.add({
              targets: player,
              x: step.x,
              y: step.y,
              angle: step.angle,
              duration:
                step.duration,
              ease:
                step.y < baseY - 15
                  ? "Sine.easeOut"
                  : "Quad.easeInOut",
              onComplete:
                nextStep
            });
          };

          nextStep();
        };

        // Move into a clearly readable position NEXT TO the lion first.
        player.setFlipX(
          lionOnRight ? false : true
        );
        player.play?.(
          "simon-run",
          true
        );

        this.tweens.add({
          targets: player,
          x: danceX,
          y: baseY,
          duration: 310,
          ease: "Sine.easeOut",
          onComplete:
            startChoreography
        });

        this.events.once(
          "shutdown",
          () => {
            this.__lionDanceV77 =
              false;
            notes.forEach(
              safeDestroy
            );
          }
        );
      };

    dance.__v77 = true;
    proto.chooseDanceWithLion =
      dance;

    return true;
  }

  // ========================================================================
  // 2. WG: direct scene ownership instead of pause() + ScenePlugin.start().
  // ========================================================================

  function createWGDoorV77({
    name,
    x,
    open
  }) {
    const g = this.add.graphics();

    g.fillStyle(
      open ? 0x584234 : 0x4e4742,
      1
    );

    g.fillRoundedRect(
      x - 52,
      127,
      104,
      180,
      6
    );

    g.lineStyle(
      4,
      open ? 0xd6bd8b : 0x877c70,
      1
    );

    g.strokeRoundedRect(
      x - 52,
      127,
      104,
      180,
      6
    );

    g.fillStyle(0xd2a947, 1);
    g.fillCircle(
      x + 34,
      226,
      4
    );

    this.add.text(
      x,
      110,
      open
        ? name
        : `${name}  🔒`,
      {
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize: "7px",
        color:
          open
            ? "#fff0c2"
            : "#aaa49b",
        stroke: "#332b26",
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    const zone =
      this.add.zone(
        x,
        218,
        110,
        190
      )
        .setDepth(50)
        .setInteractive({
          useHandCursor: true
        });

    zone.on(
      "pointerdown",
      (pointer) => {
        stopEvent(
          pointer?.event
        );

        if (!open) {
          this.showLocked?.(
            name
          );
          return;
        }

        if (
          this.__roomTransitionV77
        ) {
          return;
        }

        this.__roomTransitionV77 =
          true;

        const game =
          getGame() ||
          this.game;

        try {
          // Remove a stale room instance from a previous failed transition.
          if (
            game.scene.isActive?.(
              ROOM_KEY
            ) ||
            game.scene.isPaused?.(
              ROOM_KEY
            )
          ) {
            game.scene.stop(
              ROOM_KEY
            );
          }

          // Hall MUST remain alive. Pause the parent and LAUNCH the child.
          // Never call ScenePlugin.start() here: it stops the source scene.
          game.scene.pause(
            WG_KEY
          );

          game.scene.launch(
            ROOM_KEY,
            {
              hallScene: this
            }
          );

          window.setTimeout(
            () => {
              this.__roomTransitionV77 =
                false;
            },
            180
          );
        } catch (error) {
          console.error(
            "v77 WG -> Zimmer:",
            error
          );

          try {
            game.scene.resume(
              WG_KEY
            );
          } catch {}

          this.__roomTransitionV77 =
            false;
        }
      }
    );
  }

  function leaveRoomV77() {
    if (this.__leavingRoomV77) {
      return;
    }

    this.__leavingRoomV77 =
      true;

    const game =
      getGame() ||
      this.game;

    let hall =
      this.hallScene ||
      getScene(WG_KEY);

    try {
      // Normally the hall is alive and paused.
      if (hall) {
        game.scene.resume(
          WG_KEY
        );
      } else {
        // Recovery only: recreate the hall if an older failed transition
        // already stopped it.
        const outdoor =
          getScene(
            OERLIKON_KEY
          );

        game.scene.start(
          WG_KEY,
          {
            outdoorScene: outdoor
          }
        );

        hall =
          getScene(WG_KEY);
      }

      if (hall?.input) {
        hall.input.enabled = true;
      }

      hall?.cameras?.main
        ?.resetFX?.();

      hall?.cameras?.main
        ?.setAlpha?.(1);

      hall.__roomTransitionV77 =
        false;
    } catch (error) {
      console.error(
        "v77 Zimmer -> WG:",
        error
      );
    }

    // Stop the child LAST, after the hall has definitely resumed.
    window.setTimeout(
      () => {
        try {
          game.scene.stop(
            ROOM_KEY
          );
        } catch {}

        this.__leavingRoomV77 =
          false;
      },
      35
    );
  }

  function leaveWGV77() {
    if (this.__leavingWGV77) {
      return;
    }

    this.__leavingWGV77 = true;

    const game =
      getGame() ||
      this.game;

    const outdoor =
      this.outdoorScene ||
      getScene(
        OERLIKON_KEY
      );

    try {
      if (
        game.scene.isPaused?.(
          OERLIKON_KEY
        )
      ) {
        game.scene.resume(
          OERLIKON_KEY
        );
      }

      outdoor?.physics
        ?.world?.resume?.();

      if (outdoor?.input) {
        outdoor.input.enabled =
          true;
      }

      outdoor?.player
        ?.setVisible?.(true);

      outdoor?.player
        ?.setActive?.(true);

      if (outdoor?.player?.body) {
        outdoor.player.body.enable =
          true;
        outdoor.player.body.moves =
          true;
      }

      outdoor?.player
        ?.setVelocity?.(0, 0);

      outdoor?.resumeFromWG?.();

      outdoor?.setUILocked?.(
        false
      );

      outdoor?.refreshUILock?.();

      outdoor
        ?.setControlsVisible?.(
          true
        );
    } catch (error) {
      console.error(
        "v77 WG -> Oerlikon:",
        error
      );
    }

    window.setTimeout(
      () => {
        try {
          game.scene.stop(
            WG_KEY
          );
        } catch {}

        this.__leavingWGV77 =
          false;
      },
      35
    );
  }

  function patchWGClasses() {
    const game = getGame();
    if (!game?.scene?.keys) {
      return false;
    }

    let patched = false;

    const hall =
      game.scene.keys[
        WG_KEY
      ];

    const hallProto =
      hall?.constructor?.prototype;

    if (
      hallProto &&
      hallProto.createDoor !==
        createWGDoorV77
    ) {
      hallProto.createDoor =
        createWGDoorV77;
      patched = true;
    }

    if (
      hallProto &&
      hallProto.leaveWG !==
        leaveWGV77
    ) {
      hallProto.leaveWG =
        leaveWGV77;
      patched = true;
    }

    const room =
      game.scene.keys[
        ROOM_KEY
      ];

    const roomProto =
      room?.constructor?.prototype;

    if (
      roomProto &&
      roomProto.leaveRoom !==
        leaveRoomV77
    ) {
      roomProto.leaveRoom =
        leaveRoomV77;
      patched = true;
    }

    return patched;
  }

  // ========================================================================
  // 3 + 4. SALERSTEIG:
  // - visible street / pavement below Simon
  // - ticket machine outside the stopped tram body
  // - arrival tram actually departs and gets destroyed
  // ========================================================================

  function addSalersteigGround(
    scene
  ) {
    if (
      !scene?.add ||
      scene.__salersteigGroundV77
    ) {
      return;
    }

    const ground =
      scene.add.graphics()
        .setDepth(-6);

    // Asphalt lies behind the curb; Simon stands on the pale pavement.
    ground.fillStyle(
      0x6f7273,
      1
    );
    ground.fillRect(
      0,
      279,
      770,
      28
    );

    ground.fillStyle(
      0xbeb8ad,
      1
    );
    ground.fillRect(
      0,
      307,
      770,
      GROUND_TOP - 307
    );

    ground.fillStyle(
      0xd8d3c9,
      1
    );
    ground.fillRect(
      0,
      304,
      770,
      5
    );

    ground.lineStyle(
      1,
      0x9c978e,
      0.62
    );

    for (
      let x = 0;
      x < 770;
      x += 42
    ) {
      ground.lineBetween(
        x,
        312,
        x,
        GROUND_TOP
      );
    }

    // A few understated curb joints make the floor read as pavement,
    // without adding foreground clutter.
    ground.lineStyle(
      1,
      0xa7a197,
      0.65
    );

    for (
      let x = 18;
      x < 770;
      x += 84
    ) {
      ground.lineBetween(
        x,
        306,
        x + 34,
        306
      );
    }

    scene.__salersteigGroundV77 =
      ground;

    scene.events?.once?.(
      "shutdown",
      () => {
        safeDestroy(
          ground
        );
        scene.__salersteigGroundV77 =
          null;
      }
    );
  }

  function createStopGraphicV77(
    x,
    name,
    side
  ) {
    const stop =
      this.add.graphics()
        .setDepth(4);

    // Shelter.
    stop.fillStyle(
      0x72797b,
      1
    );
    stop.fillRect(
      x - 85,
      187,
      5,
      96
    );
    stop.fillRect(
      x + 79,
      187,
      5,
      96
    );

    stop.fillStyle(
      0xcfd9dc,
      0.42
    );
    stop.fillRect(
      x - 80,
      194,
      159,
      68
    );

    stop.fillStyle(
      0x5f6b70,
      1
    );
    stop.fillRect(
      x - 92,
      181,
      184,
      10
    );

    // VBZ sign.
    const poleX =
      side === "left"
        ? x - 116
        : x + 103;

    stop.fillStyle(
      0x2a6aa1,
      1
    );
    stop.fillRect(
      poleX,
      190,
      8,
      94
    );

    stop.fillStyle(
      0x246aa5,
      1
    );
    stop.fillRect(
      side === "left"
        ? x - 137
        : x + 82,
      178,
      50,
      29
    );

    this.add.text(
      side === "left"
        ? x - 112
        : x + 107,
      192,
      name,
      {
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize:
          name.length > 12
            ? "4.3px"
            : "5px",
        color: "#ffffff",
        align: "center",
        wordWrap: {
          width: 80
        }
      }
    )
      .setOrigin(0.5)
      .setDepth(6);

    // v59 used ±112 px. The arriving tram is 250 px wide and stops at
    // x-120, so the Salersteig machine was physically inside the tram body.
    // ±170 gives both objects their own readable space.
    const ticketX =
      side === "left"
        ? x + 170
        : x - 170;

    // Machine sits in FRONT of the tram, as a pavement object.
    const machine =
      this.add.graphics()
        .setDepth(42);

    machine.fillStyle(
      0x244c61,
      1
    );

    machine.fillRoundedRect(
      ticketX - 22,
      220,
      44,
      91,
      4
    );

    machine.fillStyle(
      0x17252e,
      1
    );
    machine.fillRect(
      ticketX - 12,
      235,
      24,
      22
    );

    machine.fillStyle(
      0xd5edf1,
      1
    );
    machine.fillRect(
      ticketX - 8,
      265,
      16,
      9
    );

    this.add.text(
      ticketX,
      211,
      "TICKET",
      {
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff3c4",
        backgroundColor:
          "#244c61",
        padding: {
          x: 4,
          y: 3
        }
      }
    )
      .setOrigin(0.5)
      .setDepth(43);

    return ticketX;
  }

  function scheduleArrivalTramDeparture(
    scene
  ) {
    if (
      !scene?.time ||
      scene.__arrivalDepartureWatchV77
    ) {
      return;
    }

    scene.__arrivalDepartureWatchV77 =
      true;

    const check = () => {
      if (!scene.sys?.isActive?.()) {
        scene.__arrivalDepartureWatchV77 =
          false;
        return;
      }

      const tram =
        scene.__arrivalTramV57;

      if (
        scene.arrivalFinished &&
        tram?.active
      ) {
        if (tram.__departingV77) {
          return;
        }

        tram.__departingV77 =
          true;

        // Let the player finish stepping onto the pavement, then drive away.
        scene.time.delayedCall(
          180,
          () => {
            if (
              !scene.sys?.isActive?.() ||
              !tram?.active
            ) {
              return;
            }

            scene.tweens.add({
              targets: tram,
              x:
                SALERSTEIG_X +
                520,
              duration: 980,
              ease: "Sine.easeIn",
              onComplete: () => {
                if (
                  scene.__arrivalTramV57 ===
                  tram
                ) {
                  scene.__arrivalTramV57 =
                    null;
                }

                safeDestroy(
                  tram
                );
              }
            });
          }
        );

        scene.__arrivalDepartureWatchV77 =
          false;
        return;
      }

      scene.time.delayedCall(
        80,
        check
      );
    };

    scene.time.delayedCall(
      80,
      check
    );
  }

  function patchOerlikonClass() {
    const game = getGame();

    const instance =
      game?.scene?.keys?.[
        OERLIKON_KEY
      ];

    const proto =
      instance?.constructor?.prototype;

    if (!proto) {
      return false;
    }

    if (
      proto.createStopGraphic !==
        createStopGraphicV77
    ) {
      proto.createStopGraphic =
        createStopGraphicV77;
    }

    if (
      typeof proto.create === "function" &&
      !proto.create.__v77
    ) {
      const originalCreate =
        proto.create;

      const wrappedCreate =
        function createOerlikonV77(
          ...args
        ) {
          const result =
            originalCreate.apply(
              this,
              args
            );

          addSalersteigGround(
            this
          );

          return result;
        };

      wrappedCreate.__v77 = true;
      proto.create =
        wrappedCreate;
    }

    if (
      typeof proto.startArrivalAtSalersteig ===
        "function" &&
      !proto.startArrivalAtSalersteig.__v77
    ) {
      const originalArrival =
        proto.startArrivalAtSalersteig;

      const wrappedArrival =
        function startArrivalAtSalersteigV77(
          ...args
        ) {
          const result =
            originalArrival.apply(
              this,
              args
            );

          scheduleArrivalTramDeparture(
            this
          );

          return result;
        };

      wrappedArrival.__v77 = true;
      proto.startArrivalAtSalersteig =
        wrappedArrival;
    }

    return true;
  }

  // If Oerlikon is already active when this patch first sees it, at least
  // repair the visible floor and lingering arrival tram immediately.
  function repairActiveOerlikon() {
    const scene =
      getScene(
        OERLIKON_KEY
      );

    if (!scene?.sys?.isActive?.()) {
      return;
    }

    addSalersteigGround(
      scene
    );

    if (
      scene.arrivalFinished &&
      scene.__arrivalTramV57?.active
    ) {
      scheduleArrivalTramDeparture(
        scene
      );
    }
  }

  // ========================================================================
  // Install / maintain after dynamic scene registration.
  // ========================================================================

  function install() {
    patchLionDance();
    patchWGClasses();
    patchOerlikonClass();
    repairActiveOerlikon();
  }

  install();

  window.setInterval(
    install,
    70
  );

  window.SimonBugfixV77 =
    Object.freeze({
      VERSION,
      status() {
        return {
          version: VERSION,
          lionDancePatched:
            Boolean(
              window.__SIMON_SCENE_CLASSES__
                ?.MilchbuckScene
                ?.prototype
                ?.chooseDanceWithLion
                ?.__v77
            ),
          wgDoorPatched:
            Boolean(
              getGame()
                ?.scene?.keys?.[
                  WG_KEY
                ]
                ?.constructor
                ?.prototype
                ?.createDoor ===
              createWGDoorV77
            ),
          roomExitPatched:
            Boolean(
              getGame()
                ?.scene?.keys?.[
                  ROOM_KEY
                ]
                ?.constructor
                ?.prototype
                ?.leaveRoom ===
              leaveRoomV77
            ),
          oerlikonPatched:
            Boolean(
              getGame()
                ?.scene?.keys?.[
                  OERLIKON_KEY
                ]
                ?.constructor
                ?.prototype
                ?.createStopGraphic ===
              createStopGraphicV77
            ),
          salersteigGround:
            Boolean(
              getScene(
                OERLIKON_KEY
              )
                ?.__salersteigGroundV77
                ?.active
            ),
          arrivalTram:
            Boolean(
              getScene(
                OERLIKON_KEY
              )
                ?.__arrivalTramV57
                ?.active
            )
        };
      }
    });

  console.info(
    "Bugfix v77: lion dance + WG room transitions + Salersteig tram/floor."
  );
})();
