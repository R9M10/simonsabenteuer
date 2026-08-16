(() => {
  "use strict";

  if (window.__SIMON_HIVE_LANGUAGE_V18__) return;
  window.__SIMON_HIVE_LANGUAGE_V18__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("HIVE Sprachpatch v18: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithHiveLanguageV18(options = {}) {
    const game = wrappedStartSimonGame.call(this, options);

    if (game) {
      patchWhenReady(game);
    }

    return game;
  };

  function patchWhenReady(game, attempt = 0) {
    if (!game?.scene || attempt > 240) return;

    const hive = game.scene.getScene?.("HiveInteriorScene");

    if (!hive) {
      window.setTimeout(
        () => patchWhenReady(game, attempt + 1),
        50
      );
      return;
    }

    installPatch(hive);
  }

  function faceWomanTowardSimon(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;

    if (!woman?.active || !player?.active) return;

    // woman-v14 faces left in its source orientation.
    // Flip only when Simon is to her right so she always looks toward him.
    woman.setFlipX(player.x > woman.x);
  }

  function faceSimonTowardWoman(hive) {
    const woman = hive?.womanSprite;
    const player = hive?.player;

    if (!woman?.active || !player?.active) return;

    player.setFlipX(woman.x < player.x);
    faceWomanTowardSimon(hive);
  }

  function installPatch(hive) {
    if (!hive || hive.__simonHiveLanguageV18) return;
    hive.__simonHiveLanguageV18 = true;

    // HIVE scenes are reused. Always clear temporary leaving/modal locks on init.
    if (typeof hive.init === "function") {
      const originalInit = hive.init.bind(hive);

      hive.init = function initLanguageV18(data = {}) {
        this.__leaving = false;
        this.modalOpen = false;
        this.currentModal = null;
        this.actionLocked = false;
        this.touchLeft = false;
        this.touchRight = false;
        this.touchDance = false;
        return originalInit(data);
      };
    }

    // Keep the woman visually oriented toward Simon while both are in the HIVE.
    // This is intentionally visual only and does not change collisions or movement.
    if (typeof hive.update === "function") {
      const originalUpdate = hive.update.bind(hive);

      hive.update = function updateLanguageV18(...args) {
        const result = originalUpdate(...args);
        faceWomanTowardSimon(this);
        return result;
      };
    }

    // General HIVE UI/system language stays High German.
    if (typeof hive.openDialog === "function") {
      const originalOpenDialog = hive.openDialog.bind(hive);

      hive.openDialog = function openDialogHighGerman(title, body, buttons = []) {
        const titleMap = {
          "FRAU A DE BAR": "FRAU AN DER BAR"
        };

        let translatedBody = String(body ?? "")
          .replace(
            "Du findsch es Portemonnaie am Bode. +8 Coins.",
            "Du findest ein Portemonnaie auf dem Boden. +8 Coins."
          )
          .replace(
            "Es Brouwers kostet 3 Coins.",
            "Ein Brouwers kostet 3 Coins."
          )
          .replace(
            "Du hesch ",
            "Du hast "
          )
          .replace(
            "Simon het sis Brouwers trunke.",
            "Simon hat sein Brouwers getrunken."
          )
          .replace(
            "Dä Move muesch zerscht im Flirt-Shop chaufe.",
            "Diesen Move musst du zuerst im Flirt-Shop kaufen."
          )
          .replace(
            "Was söll Simon mache?",
            "Was soll Simon machen?"
          );

        const labelMap = {
          "EINSTECKEN": "EINSTECKEN",
          "BROUWERS TRINKE -3": "BROUWERS TRINKEN -3",
          "Z'WENIG COINS": "ZU WENIG COINS",
          "NO EIS": "NOCH EINS",
          "ASPRÄCHE": "ANSPRECHEN"
        };

        const translatedButtons = buttons.map((config) => ({
          ...config,
          label: labelMap[config.label] || config.label
        }));

        return originalOpenDialog(
          titleMap[title] || title,
          translatedBody,
          translatedButtons
        );
      };
    }

    hive.openWomanMenu = function openWomanMenuV18() {
      const flirts = this.getOwnedFlirts();
      const hasFlirt = flirts.length > 0;

      faceWomanTowardSimon(this);

      this.openDialog(
        "FRAU AN DER BAR",
        "Was soll Simon machen?",
        [
          {
            label: "ANSPRECHEN",
            action: () => this.startRejectedDanceInvite()
          },
          {
            label: hasFlirt ? "FLIRT" : "FLIRT 🔒",
            action: () => {
              if (!hasFlirt) {
                this.openDialog(
                  "FLIRT",
                  "Diesen Move musst du zuerst im Flirt-Shop kaufen.",
                  [
                    { label: "ZURÜCK", action: () => this.openWomanMenu() },
                    { label: "SCHLIESSEN", action: () => this.closeModal() }
                  ]
                );
                return;
              }

              this.openDialog(
                "FLIRT",
                "Flirts sind im HIVE vorbereitet, aber die einzelnen gekauften Moves werden erst mit dem Flirt-Shop verknüpft.",
                [
                  { label: "ZURÜCK", action: () => this.openWomanMenu() },
                  { label: "SCHLIESSEN", action: () => this.closeModal() }
                ]
              );
            }
          },
          {
            label: "SCHLIESSEN",
            action: () => this.closeModal()
          }
        ]
      );
    };

    // Four-step Swiss-German conversation:
    // shoes -> Bahnhofstrasse -> thanks/dance invite -> friendly rejection.
    // Keep the existing method name because the HIVE menu already calls it.
    hive.startRejectedDanceInvite = function startRejectedDanceInviteV18() {
      this.closeModal();
      this.actionLocked = true;
      faceSimonTowardWoman(this);

      this.playSimonAction(
        "simon-v14-talk",
        { loop: true }
      );

      this.showSpeechBubble(
        this.player,
        "Hey, weisch du, wo ich nice Schueh chaufe cha?",
        2650
      );

      this.time.delayedCall(2700, () => {
        if (!this.sys?.isActive?.()) return;

        this.destroySpeechBubble();
        this.stopSimonAction();
        faceWomanTowardSimon(this);

        if (this.womanSprite?.active) {
          this.womanSprite.play("woman-v14-idle", true);
        }

        this.showSpeechBubble(
          this.womanSprite,
          "Ja, fahr mit de Tram zur Bahnhofstrass. Det findsch sicher öppis im Schueh-Shop.",
          3400
        );
      });

      this.time.delayedCall(6150, () => {
        if (!this.sys?.isActive?.()) return;

        this.destroySpeechBubble();
        faceSimonTowardWoman(this);

        this.playSimonAction(
          "simon-v14-talk",
          { loop: true }
        );

        this.showSpeechBubble(
          this.player,
          "Merci! Wotsch mit mir tanze?",
          2400
        );
      });

      this.time.delayedCall(8600, () => {
        if (!this.sys?.isActive?.()) return;

        this.destroySpeechBubble();
        this.stopSimonAction();
        faceWomanTowardSimon(this);

        if (this.womanSprite?.active) {
          this.womanSprite.play(
            "woman-v14-reject",
            true
          );
        }

        this.showSpeechBubble(
          this.womanSprite,
          "Nei, dich findi no nöd ganz so nice.",
          2300
        );
      });

      this.time.delayedCall(10950, () => {
        if (!this.sys?.isActive?.()) return;

        this.destroySpeechBubble();

        if (this.womanSprite?.active) {
          this.womanSprite.play(
            "woman-v14-idle",
            true
          );
        }

        faceWomanTowardSimon(this);
        this.actionLocked = false;
      });
    };

    // Reused HIVE scene guard: if the street transition ever returns without a
    // fresh init cycle, clear the one-shot leaving flag after the stop/resume.
    if (typeof hive.leaveHive === "function") {
      const originalLeaveHive = hive.leaveHive.bind(hive);

      hive.leaveHive = function leaveHiveV18(...args) {
        if (this.__leaving) return;

        const result = originalLeaveHive(...args);

        window.setTimeout(() => {
          this.__leaving = false;
        }, 500);

        return result;
      };
    }

    console.info(
      "HIVE Sprachpatch v18 aktiv: Barfrau schaut Simon an + neuer Schueh-Dialog."
    );
  }
})();
