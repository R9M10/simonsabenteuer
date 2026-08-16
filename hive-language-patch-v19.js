(() => {
  "use strict";

  if (window.__SIMON_HIVE_LANGUAGE_V19__) return;
  window.__SIMON_HIVE_LANGUAGE_V19__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("HIVE Sprachpatch v19: startSimonGame fehlt.");
    return;
  }

  window.startSimonGame = function startSimonGameWithHiveLanguageV19(options = {}) {
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
      window.setTimeout(() => patchWhenReady(game, attempt + 1), 50);
      return;
    }

    installPatch(hive);
  }

  function installPatch(hive) {
    if (!hive || hive.__simonHiveLanguageV19) return;
    hive.__simonHiveLanguageV19 = true;

    // UI/system text only. v19 deliberately does NOT touch:
    // - update()
    // - setFlipX()
    // - startRejectedDanceInvite()
    // - dialogue timers
    // Those are owned by the newer click-dialogue/gameplay patches.
    if (typeof hive.openDialog === "function") {
      const originalOpenDialog = hive.openDialog.bind(hive);

      hive.openDialog = function openDialogHighGermanV19(title, body, buttons = []) {
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
          .replace("Du hesch ", "Du hast ")
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

    hive.openWomanMenu = function openWomanMenuV19() {
      const flirts = this.getOwnedFlirts?.() || [];
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

    console.info(
      "HIVE Sprachpatch v19 aktiv: Übersetzungen ohne automatische Dialog-Timer."
    );
  }
})();