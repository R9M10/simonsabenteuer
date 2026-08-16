(() => {
  "use strict";

  if (window.__SIMON_HIVE_LANGUAGE_V16__) return;
  window.__SIMON_HIVE_LANGUAGE_V16__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("HIVE Sprachpatch: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithHiveLanguageV16(options = {}) {
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

  function installPatch(hive) {
    if (!hive || hive.__simonHiveLanguageV16) return;
    hive.__simonHiveLanguageV16 = true;

    // HIVE scenes are reused. Always clear temporary leaving/modal locks on init.
    if (typeof hive.init === "function") {
      const originalInit = hive.init.bind(hive);

      hive.init = function initLanguageV16(data = {}) {
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

    // General HIVE UI/system language -> High German.
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

    // Exact menu wording requested by the user.
    hive.openWomanMenu = function openWomanMenuHighGerman() {
      const flirts = this.getOwnedFlirts();
      const hasFlirt = flirts.length > 0;

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

    // Dialogue itself remains Swiss German, with the exact requested Simon line.
    hive.startRejectedDanceInvite = function startRejectedDanceInviteV16() {
      this.closeModal();
      this.actionLocked = true;

      if (this.womanSprite) {
        this.womanSprite.setFlipX(
          this.player.x > this.womanSprite.x
        );
      }

      this.player.setFlipX(
        this.womanSprite
          ? this.womanSprite.x < this.player.x
          : false
      );

      this.playSimonAction(
        "simon-v14-talk",
        { loop: true }
      );

      this.showSpeechBubble(
        this.player,
        "Hey Süessi, willsch tanze?",
        2100
      );

      this.time.delayedCall(2150, () => {
        this.destroySpeechBubble();
        this.stopSimonAction();

        if (this.womanSprite?.active) {
          this.womanSprite.play(
            "woman-v14-reject",
            true
          );
        }

        this.showSpeechBubble(
          this.womanSprite,
          "Nöd mit dir.",
          1900
        );
      });

      this.time.delayedCall(4100, () => {
        this.destroySpeechBubble();

        if (this.womanSprite?.active) {
          this.womanSprite.play(
            "woman-v14-idle",
            true
          );
        }

        this.actionLocked = false;
      });
    };

    console.info(
      "HIVE Sprachpatch v16 aktiv: Hochdeutsche Menüs + gewünschter Bar-Dialog."
    );
  }
})();
