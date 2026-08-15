const startScreen = document.getElementById("start-screen");
const sceneScreen = document.getElementById("scene-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");
const sceneTapArea = document.getElementById("scene-tap-area");
const speechText = document.getElementById("speech-text");

const dialogue = [
  "Dini Schueh sind nice!",
  "Aber...",
  "nöd sooooo nice..."
];

let dialogueIndex = 0;
let sceneStarted = false;
let transitionLocked = false;

function showCurrentDialogue() {
  speechText.textContent = dialogue[dialogueIndex];
}

function startScene() {
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");

  sceneScreen.classList.remove("hidden");
  sceneScreen.setAttribute("aria-hidden", "false");

  dialogueIndex = 0;
  transitionLocked = false;
  showCurrentDialogue();
  sceneStarted = true;
}

function enterGame() {
  if (transitionLocked) return;
  transitionLocked = true;
  sceneStarted = false;

  sceneScreen.classList.add("scene-fade-out");

  window.setTimeout(() => {
    sceneScreen.classList.add("hidden");
    sceneScreen.classList.remove("scene-fade-out");
    sceneScreen.setAttribute("aria-hidden", "true");

    gameScreen.classList.remove("hidden");
    gameScreen.setAttribute("aria-hidden", "false");

    if (typeof window.startSimonGame === "function") {
      window.startSimonGame();
    }
  }, 450);
}

function advanceDialogue() {
  if (!sceneStarted || transitionLocked) return;

  if (dialogueIndex < dialogue.length - 1) {
    dialogueIndex += 1;
    showCurrentDialogue();
    return;
  }

  enterGame();
}

startButton.addEventListener("click", startScene);
sceneTapArea.addEventListener("click", advanceDialogue);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !sceneStarted && gameScreen.classList.contains("hidden")) {
    startScene();
    return;
  }

  if ((event.key === " " || event.key === "Enter") && sceneStarted) {
    event.preventDefault();
    advanceDialogue();
  }
});
