(() => {
  "use strict";

  if (window.__SIMON_FLIGHT_INTRO_V15__) return;
  window.__SIMON_FLIGHT_INTRO_V15__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Flight Intro v15: startSimonGame fehlt.");
    return;
  }

  let introShown = false;
  let introRunning = false;

  window.startSimonGame = function startSimonGameWithFlightIntroV15(options = {}) {
    const startMode = options?.startMode || "normal";

    // Developer jumps stay instant. The plane belongs only to the normal
    // story transition after the Den-Haag shoe dialogue.
    if (startMode !== "normal" || introShown) {
      return wrappedStartSimonGame.call(this, options);
    }

    if (introRunning) return null;

    introRunning = true;

    showFlightIntro(() => {
      introShown = true;
      introRunning = false;
      wrappedStartSimonGame.call(window, options);
    });

    return null;
  };

  function showFlightIntro(onComplete) {
    document
      .querySelectorAll("[data-simon-flight-intro]")
      .forEach((node) => node.remove());

    ensureFlightStyles();

    const overlay = document.createElement("div");
    overlay.dataset.simonFlightIntro = "v15";
    overlay.className = "simon-flight-v15";

    const sky = document.createElement("img");
    sky.className = "simon-flight-v15__sky";
    sky.src = "flight-sky-v15.png";
    sky.alt = "";
    sky.draggable = false;

    const planeGroup = document.createElement("div");
    planeGroup.className = "simon-flight-v15__plane-group";

    const plane = document.createElement("img");
    plane.className = "simon-flight-v15__plane";
    plane.src = "flight-plane-v15.png";
    plane.alt = "Flugzeug nach Zürich";
    plane.draggable = false;

    const thought = document.createElement("div");
    thought.className = "simon-flight-v15__thought";
    thought.textContent = "Ich muss unbedingt neue Schuhe kaufen gehen...";

    const thoughtDotLarge = document.createElement("span");
    thoughtDotLarge.className = "simon-flight-v15__thought-dot is-large";

    const thoughtDotSmall = document.createElement("span");
    thoughtDotSmall.className = "simon-flight-v15__thought-dot is-small";

    planeGroup.append(plane, thought, thoughtDotLarge, thoughtDotSmall);
    overlay.append(sky, planeGroup);
    document.body.appendChild(overlay);

    // Give layout one frame so the CSS flight animation starts reliably on iOS.
    requestAnimationFrame(() => {
      overlay.classList.add("is-flying");
    });

    const finishTimer = window.setTimeout(() => {
      overlay.classList.add("is-leaving");

      window.setTimeout(() => {
        overlay.remove();
        onComplete?.();
      }, 380);
    }, 5250);

    overlay.addEventListener("remove", () => window.clearTimeout(finishTimer));
  }

  function ensureFlightStyles() {
    if (document.getElementById("simon-flight-v15-styles")) return;

    const style = document.createElement("style");
    style.id = "simon-flight-v15-styles";
    style.textContent = `
      .simon-flight-v15 {
        position: fixed;
        inset: 0;
        z-index: 200000;
        overflow: hidden;
        background: #74c9ff;
        opacity: 1;
        pointer-events: none;
        transition: opacity 360ms ease;
      }

      .simon-flight-v15.is-leaving {
        opacity: 0;
      }

      .simon-flight-v15__sky {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        image-rendering: pixelated;
        user-select: none;
        pointer-events: none;
      }

      .simon-flight-v15__plane-group {
        position: absolute;
        left: -66vw;
        top: 48%;
        width: min(63vw, 610px);
        transform: translate3d(0, -50%, 0);
        will-change: transform;
      }

      .simon-flight-v15.is-flying .simon-flight-v15__plane-group {
        animation: simon-plane-cross-v15 4.9s linear forwards;
      }

      .simon-flight-v15__plane {
        display: block;
        width: 100%;
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 10px 10px rgba(33, 81, 128, 0.22));
      }

      .simon-flight-v15__thought {
        position: absolute;
        right: 7%;
        top: -118px;
        width: min(310px, 52vw);
        padding: 13px 15px;
        border: 4px solid #1c2941;
        border-radius: 24px;
        background: rgba(255, 253, 239, 0.98);
        color: #172236;
        box-shadow: 6px 7px 0 rgba(26, 46, 74, 0.18);

        font-family: "Press Start 2P", monospace;
        font-size: clamp(0.48rem, 1.05vw, 0.70rem);
        line-height: 1.65;
        text-align: center;

        opacity: 0;
        transform: translateY(8px);
      }

      .simon-flight-v15.is-flying .simon-flight-v15__thought {
        animation: simon-thought-v15 4.9s ease forwards;
      }

      .simon-flight-v15__thought-dot {
        position: absolute;
        display: block;
        border: 3px solid #1c2941;
        border-radius: 50%;
        background: rgba(255, 253, 239, 0.98);
        opacity: 0;
      }

      .simon-flight-v15__thought-dot.is-large {
        right: 24%;
        top: -30px;
        width: 20px;
        height: 20px;
      }

      .simon-flight-v15__thought-dot.is-small {
        right: 18%;
        top: -5px;
        width: 12px;
        height: 12px;
      }

      .simon-flight-v15.is-flying .simon-flight-v15__thought-dot {
        animation: simon-thought-dots-v15 4.9s ease forwards;
      }

      @keyframes simon-plane-cross-v15 {
        0% {
          transform: translate3d(0, -50%, 0) translateY(6px) scale(0.92);
        }
        25% {
          transform: translate3d(48vw, -50%, 0) translateY(-3px) scale(0.97);
        }
        68% {
          transform: translate3d(118vw, -50%, 0) translateY(2px) scale(1.02);
        }
        100% {
          transform: translate3d(182vw, -50%, 0) translateY(-4px) scale(1.04);
        }
      }

      @keyframes simon-thought-v15 {
        0%, 18% {
          opacity: 0;
          transform: translateY(8px);
        }
        28%, 78% {
          opacity: 1;
          transform: translateY(0);
        }
        90%, 100% {
          opacity: 0;
          transform: translateY(-5px);
        }
      }

      @keyframes simon-thought-dots-v15 {
        0%, 20% { opacity: 0; }
        29%, 78% { opacity: 1; }
        90%, 100% { opacity: 0; }
      }

      @media (max-height: 430px) {
        .simon-flight-v15__plane-group {
          top: 52%;
          width: min(58vw, 520px);
        }

        .simon-flight-v15__thought {
          top: -98px;
          width: min(280px, 50vw);
          padding: 10px 12px;
          font-size: clamp(0.43rem, 1vw, 0.61rem);
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
