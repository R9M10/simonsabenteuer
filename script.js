const startScreen = document.getElementById("start-screen");
const developerGateScreen = document.getElementById("developer-gate-screen");
const developerMenuScreen = document.getElementById("developer-menu-screen");
const sceneScreen = document.getElementById("scene-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const developerToggle = document.getElementById("developer-toggle");
const developerToggleState = document.getElementById("developer-toggle-state");
const developerContinue = document.getElementById("developer-continue");
const developerDestinationButtons = document.querySelectorAll("[data-dev-target]");

const sceneTapArea = document.getElementById("scene-tap-area");
const speechText = document.getElementById("speech-text");

// DEVELOPER MODE:
// Auf false setzen, um den kompletten Developer-Gate im normalen Spiel zu überspringen.
// Die HTML/CSS-Blöcke sind zusätzlich klar markiert und können später komplett gelöscht werden.
const DEVELOPER_GATE_ENABLED = true;

const dialogue = [
  "Dini Schueh sind nice!",
  "Aber...",
  "nöd sooooo nice..."
];

let dialogueIndex = 0;
let sceneStarted = false;
let transitionLocked = false;
let developerModeOn = false;

function hideScreen(screen) {
  if (!screen) return;
  screen.classList.add("hidden");
  screen.setAttribute("aria-hidden", "true");
}

function showScreen(screen) {
  if (!screen) return;
  screen.classList.remove("hidden");
  screen.setAttribute("aria-hidden", "false");
}

function hideAllFlowScreens() {
  [
    startScreen,
    developerGateScreen,
    developerMenuScreen,
    sceneScreen,
    gameScreen
  ].forEach(hideScreen);
}

function showCurrentDialogue() {
  speechText.textContent = dialogue[dialogueIndex];
}

function openDeveloperGate() {
  if (!DEVELOPER_GATE_ENABLED) {
    startScene();
    return;
  }

  hideAllFlowScreens();
  showScreen(developerGateScreen);
}

function setDeveloperMode(on) {
  developerModeOn = Boolean(on);

  developerToggle?.classList.toggle("is-on", developerModeOn);
  developerToggle?.setAttribute("aria-pressed", String(developerModeOn));

  if (developerToggleState) {
    developerToggleState.textContent = developerModeOn ? "AN" : "AUS";
  }
}

function continueFromDeveloperGate() {
  if (!developerModeOn) {
    startScene();
    return;
  }

  hideAllFlowScreens();
  showScreen(developerMenuScreen);
}

function startScene() {
  hideAllFlowScreens();
  showScreen(sceneScreen);

  dialogueIndex = 0;
  transitionLocked = false;
  showCurrentDialogue();
  sceneStarted = true;
}

function launchGame(options = {}, { fromDialogue = false } = {}) {
  if (transitionLocked) return;

  transitionLocked = true;
  sceneStarted = false;

  const actuallyLaunch = () => {
    hideAllFlowScreens();
    showScreen(gameScreen);

    if (typeof window.startSimonGame === "function") {
      window.startSimonGame({
        ...options,
        developerMode: developerModeOn
      });
    } else {
      console.error("startSimonGame wurde nicht gefunden.");
    }
  };

  if (fromDialogue) {
    sceneScreen.classList.add("scene-fade-out");

    window.setTimeout(() => {
      sceneScreen.classList.remove("scene-fade-out");
      actuallyLaunch();
    }, 450);

    return;
  }

  actuallyLaunch();
}

function chooseDeveloperDestination(target) {
  if (target === "normal") {
    transitionLocked = false;
    startScene();
    return;
  }

  if (target === "lion-choice") {
    launchGame({ startMode: "lion-choice" });
    return;
  }

  if (target === "hb") {
    launchGame({ startMode: "hb" });
    return;
  }

  if (target === "post-milkman") {
    launchGame({ startMode: "post-milkman" });
  }
}

function advanceDialogue() {
  if (!sceneStarted || transitionLocked) return;

  if (dialogueIndex < dialogue.length - 1) {
    dialogueIndex += 1;
    showCurrentDialogue();
    return;
  }

  launchGame({ startMode: "normal" }, { fromDialogue: true });
}

startButton.addEventListener("click", openDeveloperGate);

developerToggle?.addEventListener("click", () => {
  setDeveloperMode(!developerModeOn);
});

developerContinue?.addEventListener("click", continueFromDeveloperGate);

developerDestinationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chooseDeveloperDestination(button.dataset.devTarget);
  });
});

sceneTapArea.addEventListener("click", advanceDialogue);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !sceneStarted &&
    !startScreen.classList.contains("hidden")
  ) {
    openDeveloperGate();
    return;
  }

  if (
    event.key === "Enter" &&
    !developerGateScreen?.classList.contains("hidden")
  ) {
    continueFromDeveloperGate();
    return;
  }

  if ((event.key === " " || event.key === "Enter") && sceneStarted) {
    event.preventDefault();
    advanceDialogue();
  }
});

setDeveloperMode(false);
