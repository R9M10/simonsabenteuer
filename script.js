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

const DEVELOPER_GATE_ENABLED = true;
const SCENE_ART_FOUNDATIONS = Object.freeze([
  Object.freeze({
    version: "v61",
    src: "scene-art-v61.js?v=61",
    flag: "__SIMON_SCENE_ART_V61__"
  }),
  Object.freeze({
    version: "v62",
    src: "scene-art-v62.js?v=62",
    flag: "__SIMON_SCENE_ART_V62__"
  })
]);

let sceneArtFoundationPromise = null;

function loadSceneArtFoundation(definition) {
  if (window[definition.flag]) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const selector = `script[data-scene-art-foundation="${definition.version}"]`;
    const existing = document.querySelector(selector);

    if (existing) {
      if (window[definition.flag]) {
        resolve(true);
        return;
      }

      existing.addEventListener(
        "load",
        () => resolve(Boolean(window[definition.flag])),
        { once: true }
      );
      existing.addEventListener(
        "error",
        () => reject(new Error(`${definition.src} konnte nicht geladen werden.`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = definition.src;
    script.dataset.sceneArtFoundation = definition.version;
    script.async = true;

    script.addEventListener(
      "load",
      () => {
        if (!window[definition.flag]) {
          reject(new Error(`${definition.version} wurde geladen, aber nicht initialisiert.`));
          return;
        }
        resolve(true);
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`${definition.src} konnte nicht geladen werden.`)),
      { once: true }
    );

    document.head.appendChild(script);
  });
}

function ensureSceneArtFoundation() {
  const ready = SCENE_ART_FOUNDATIONS.every(
    (definition) => Boolean(window[definition.flag])
  );

  if (ready) {
    return Promise.resolve(true);
  }

  if (sceneArtFoundationPromise) {
    return sceneArtFoundationPromise;
  }

  sceneArtFoundationPromise = SCENE_ART_FOUNDATIONS.reduce(
    (promise, definition) => promise.then(() => loadSceneArtFoundation(definition)),
    Promise.resolve(true)
  ).then(() => SCENE_ART_FOUNDATIONS.every(
    (definition) => Boolean(window[definition.flag])
  ));

  return sceneArtFoundationPromise;
}

// Load the established v61 registry/store foundation first, then the v62
// Milchbuck art migration. Gameplay launch waits for both.
ensureSceneArtFoundation().catch((error) => {
  console.error("[Scene Art v62]", error);
});

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
  [startScreen, developerGateScreen, developerMenuScreen, sceneScreen, gameScreen].forEach(hideScreen);
}

function showCurrentDialogue() { speechText.textContent = dialogue[dialogueIndex]; }

function openDeveloperGate() {
  if (!DEVELOPER_GATE_ENABLED) { startScene(); return; }
  hideAllFlowScreens(); showScreen(developerGateScreen);
}

function setDeveloperMode(on) {
  developerModeOn = Boolean(on);
  developerToggle?.classList.toggle("is-on", developerModeOn);
  developerToggle?.setAttribute("aria-pressed", String(developerModeOn));
  if (developerToggleState) developerToggleState.textContent = developerModeOn ? "AN" : "AUS";
}

function continueFromDeveloperGate() {
  if (!developerModeOn) { startScene(); return; }
  hideAllFlowScreens(); showScreen(developerMenuScreen);
}

function startScene() {
  hideAllFlowScreens(); showScreen(sceneScreen);
  dialogueIndex = 0; transitionLocked = false; showCurrentDialogue(); sceneStarted = true;
}

function launchGame(options = {}, { fromDialogue = false } = {}) {
  if (transitionLocked) return;
  transitionLocked = true; sceneStarted = false;

  const actuallyLaunch = () => {
    hideAllFlowScreens(); showScreen(gameScreen);

    ensureSceneArtFoundation()
      .then((loaded) => {
        if (
          !loaded ||
          !window.__SIMON_SCENE_ART_V61__ ||
          !window.__SIMON_SCENE_ART_V62__
        ) {
          throw new Error("Scene Art v61/v62 wurde nicht vollständig initialisiert.");
        }

        if (typeof window.startSimonGame === "function") {
          window.startSimonGame({ ...options, developerMode: developerModeOn });
        } else {
          throw new Error("startSimonGame wurde nicht gefunden.");
        }
      })
      .catch((error) => {
        console.error("[Scene Art v62] Spielstart abgebrochen:", error);
        transitionLocked = false;
        hideAllFlowScreens();
        showScreen(startScreen);
      });
  };

  if (fromDialogue) {
    sceneScreen.classList.add("scene-fade-out");
    window.setTimeout(() => { sceneScreen.classList.remove("scene-fade-out"); actuallyLaunch(); }, 450);
    return;
  }
  actuallyLaunch();
}

function chooseDeveloperDestination(target) {
  if (target === "normal") { transitionLocked = false; startScene(); return; }
  if (target === "lion-choice") { launchGame({ startMode: "lion-choice" }); return; }
  if (target === "hb") { launchGame({ startMode: "hb" }); return; }
  if (target === "post-milkman") { launchGame({ startMode: "post-milkman" }); return; }
  if (target === "venice") { launchGame({ startMode: "venice" }); }
}

function advanceDialogue() {
  if (!sceneStarted || transitionLocked) return;
  if (dialogueIndex < dialogue.length - 1) { dialogueIndex += 1; showCurrentDialogue(); return; }
  launchGame({ startMode: "normal" }, { fromDialogue: true });
}

startButton.addEventListener("click", openDeveloperGate);
developerToggle?.addEventListener("click", () => setDeveloperMode(!developerModeOn));
developerContinue?.addEventListener("click", continueFromDeveloperGate);
developerDestinationButtons.forEach((button) => button.addEventListener("click", () => chooseDeveloperDestination(button.dataset.devTarget)));
sceneTapArea.addEventListener("click", advanceDialogue);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !sceneStarted && !startScreen.classList.contains("hidden")) { openDeveloperGate(); return; }
  if (event.key === "Enter" && !developerGateScreen?.classList.contains("hidden")) { continueFromDeveloperGate(); return; }
  if ((event.key === " " || event.key === "Enter") && sceneStarted) { event.preventDefault(); advanceDialogue(); }
});
setDeveloperMode(false);
