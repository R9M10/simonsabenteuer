(() => {
  "use strict";

  if (window.__SIMON_FLIGHT_INTRO_V16__) return;
  window.__SIMON_FLIGHT_INTRO_V16__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Flight Intro v16: startSimonGame fehlt.");
    return;
  }

  let introShown = false;
  let introRunning = false;

  window.startSimonGame = function startSimonGameWithFlightIntroV16(options = {}) {
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
    overlay.dataset.simonFlightIntro = "v16";
    overlay.className = "simon-flight-v16";

    const sky = document.createElement("img");
    sky.className = "simon-flight-v16__sky";
    sky.src = "flight-sky-v15.png";
    sky.alt = "";
    sky.draggable = false;

    const planeGroup = document.createElement("div");
    planeGroup.className = "simon-flight-v16__plane-group";

    const plane = document.createElement("img");
    plane.className = "simon-flight-v16__plane";
    plane.src = "flight-plane-v15.png";
    plane.alt = "Flugzeug nach Zürich";
    plane.draggable = false;
    planeGroup.appendChild(plane);

    // The thought is deliberately NOT a child of the moving plane anymore.
    // It remains almost screen-fixed so the sentence can be read comfortably.
    const thoughtGroup = document.createElement("div");
    thoughtGroup.className = "simon-flight-v16__thought-group";

    const thought = document.createElement("div");
    thought.className = "simon-flight-v16__thought";
    thought.textContent = "Ich muss unbedingt neue Schuhe kaufen gehen...";

    const thoughtDotLarge = document.createElement("span");
    thoughtDotLarge.className = "simon-flight-v16__thought-dot is-large";

    const thoughtDotSmall = document.createElement("span");
    thoughtDotSmall.className = "simon-flight-v16__thought-dot is-small";

    thoughtGroup.append(thought, thoughtDotLarge, thoughtDotSmall);
    overlay.append(sky, planeGroup, thoughtGroup);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("is-flying");
    });

    const finishTimer = window.setTimeout(() => {
      overlay.classList.add("is-leaving");

      window.setTimeout(() => {
        overlay.remove();
        onComplete?.();
      }, 420);
    }, 6250);

    // Kept for compatibility with older DOM cleanup logic.
    overlay.addEventListener("remove", () => window.clearTimeout(finishTimer));
  }

  function ensureFlightStyles() {
    if (document.getElementById("simon-flight-v16-styles")) return;

    const style = document.createElement("style");
    style.id = "simon-flight-v16-styles";
    style.textContent = `
      .simon-flight-v16 {
        position: fixed;
        inset: 0;
        z-index: 200000;
        overflow: hidden;
        background: #74c9ff;
        opacity: 1;
        pointer-events: none;
        transition: opacity 400ms ease;
      }

      .simon-flight-v16.is-leaving { opacity: 0; }

      .simon-flight-v16__sky {
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

      .simon-flight-v16__plane-group {
        position: absolute;
        left: -66vw;
        top: 54%;
        width: min(61vw, 600px);
        transform: translate3d(0, -50%, 0);
        will-change: transform;
      }

      .simon-flight-v16.is-flying .simon-flight-v16__plane-group {
        animation: simon-plane-cross-v16 5.85s linear forwards;
      }

      .simon-flight-v16__plane {
        display: block;
        width: 100%;
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 10px 10px rgba(33, 81, 128, 0.22));
      }

      .simon-flight-v16__thought-group {
        position: absolute;
        left: 50%;
        top: 13%;
        width: min(360px, 61vw);
        transform: translateX(-50%);
        opacity: 0;
        will-change: opacity, transform;
      }

      .simon-flight-v16.is-flying .simon-flight-v16__thought-group {
        animation: simon-thought-hold-v16 5.85s ease-in-out forwards;
      }

      .simon-flight-v16__thought {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        padding: 14px 17px;
        border: 4px solid #1c2941;
        border-radius: 24px;
        background: rgba(255, 253, 239, 0.985);
        color: #172236;
        box-shadow: 6px 7px 0 rgba(26, 46, 74, 0.18);
        font-family: "Press Start 2P", monospace;
        font-size: clamp(0.50rem, 1.05vw, 0.72rem);
        line-height: 1.68;
        text-align: center;
      }

      .simon-flight-v16__thought-dot {
        position: absolute;
        display: block;
        border: 3px solid #1c2941;
        border-radius: 50%;
        background: rgba(255, 253, 239, 0.985);
      }

      .simon-flight-v16__thought-dot.is-large {
        right: 18%;
        top: calc(100% + 7px);
        width: 18px;
        height: 18px;
      }

      .simon-flight-v16__thought-dot.is-small {
        right: 12%;
        top: calc(100% + 31px);
        width: 10px;
        height: 10px;
      }

      @keyframes simon-plane-cross-v16 {
        0%   { transform: translate3d(0, -50%, 0) translateY(5px) scale(0.92); }
        25%  { transform: translate3d(46vw, -50%, 0) translateY(-2px) scale(0.97); }
        68%  { transform: translate3d(116vw, -50%, 0) translateY(2px) scale(1.02); }
        100% { transform: translate3d(182vw, -50%, 0) translateY(-3px) scale(1.04); }
      }

      /* Long readable hold: only a 2 px drift instead of following the plane. */
      @keyframes simon-thought-hold-v16 {
        0%, 12%  { opacity: 0; transform: translateX(-50%) translateY(5px); }
        22%      { opacity: 1; transform: translateX(-50%) translateY(0); }
        48%      { opacity: 1; transform: translateX(-50%) translateY(-2px); }
        78%      { opacity: 1; transform: translateX(-50%) translateY(0); }
        90%,100% { opacity: 0; transform: translateX(-50%) translateY(-2px); }
      }

      @media (max-height: 430px) {
        .simon-flight-v16__plane-group {
          top: 58%;
          width: min(55vw, 500px);
        }

        .simon-flight-v16__thought-group {
          top: 8%;
          width: min(345px, 58vw);
        }

        .simon-flight-v16__thought {
          padding: 10px 13px;
          font-size: clamp(0.43rem, 1vw, 0.62rem);
          line-height: 1.55;
        }

        .simon-flight-v16__thought-dot.is-large {
          width: 15px;
          height: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
