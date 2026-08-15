const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");

startButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");

  gameScreen.classList.remove("hidden");
  gameScreen.setAttribute("aria-hidden", "false");

  // Hier bauen wir als Nächstes das eigentliche Spiel ein.
});
