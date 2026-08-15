const startScreen = document.getElementById("start-screen");
const sceneScreen = document.getElementById("scene-screen");
const startButton = document.getElementById("start-button");
const sceneTapArea = document.getElementById("scene-tap-area");
const speechText = document.getElementById("speech-text");

const dialogue = [
  "Dini Schueh sind nice!",
  "Aber",
  "nöd sooooo nice..."
];

let dialogueIndex = 0;
let sceneStarted = false;

function showCurrentDialogue() {
  speechText.textContent = dialogue[dialogueIndex];
}

function startScene() {
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");

  sceneScreen.classList.remove("hidden");
  sceneScreen.setAttribute("aria-hidden", "false");

  dialogueIndex = 0;
  showCurrentDialogue();
  sceneStarted = true;
}

function advanceDialogue() {
  if (!sceneStarted) return;
  dialogueIndex = (dialogueIndex + 1) % dialogue.length;
  showCurrentDialogue();
}

startButton.addEventListener("click", startScene);
sceneTapArea.addEventListener("click", advanceDialogue);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !sceneStarted) {
    startScene();
    return;
  }

  if ((event.key === " " || event.key === "Enter") && sceneStarted) {
    event.preventDefault();
    advanceDialogue();
  }
});
