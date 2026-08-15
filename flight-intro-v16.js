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
    document.querySelectorAll("[data-simon-flight-intro]").forEach((node) => node.remove());
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

    const thought = document.createElement("div");
    thought.className = "simon-flight-v16__thought";
    thought.textContent = "Ich muss unbedingt neue Schuhe kaufen gehen...";

    const thoughtDotLarge = document.createElement("span");
    thoughtDotLarge.className = "simon-flight-v16__thought-dot is-large";
    const thoughtDotSmall = document.createElement("span");
    thoughtDotSmall.className = "simon-flight-v16__thought-dot is-small";

    planeGroup.append(plane, thought, thoughtDotLarge, thoughtDotSmall);
    overlay.append(sky, planeGroup);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("is-flying"));

    const finishTimer = window.setTimeout(() => {
      overlay.classList.add("is-leaving");
      window.setTimeout(() => {
        overlay.remove();
        onComplete?.();
      }, 420);
    }, 7600);

    overlay.addEventListener("remove", () => window.clearTimeout(finishTimer));
  }

  function ensureFlightStyles() {
    if (document.getElementById("simon-flight-v16-styles")) return;
    const style = document.createElement("style");
    style.id = "simon-flight-v16-styles";
    style.textContent = `
      .simon-flight-v16 {
        position: fixed; inset: 0; z-index: 200000; overflow: hidden;
        background: #74c9ff; opacity: 1; pointer-events: none;
        transition: opacity 380ms ease;
      }
      .simon-flight-v16.is-leaving { opacity: 0; }
      .simon-flight-v16__sky {
        position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
        object-position: center center; image-rendering: pixelated; user-select: none; pointer-events: none;
      }
      .simon-flight-v16__plane-group {
        position: absolute; left: -66vw; top: 48%; width: min(63vw, 610px);
        transform: translate3d(0, -50%, 0); will-change: transform;
      }
      .simon-flight-v16.is-flying .simon-flight-v16__plane-group {
        animation: simon-plane-cross-v16 7.15s linear forwards;
      }
      .simon-flight-v16__plane {
        display: block; width: 100%; height: auto; image-rendering: pixelated;
        filter: drop-shadow(0 10px 10px rgba(33, 81, 128, 0.22));
      }
      .simon-flight-v16__thought {
        position: absolute; right: 6%; top: -138px; width: min(370px, 57vw);
        padding: 15px 16px; border: 4px solid #1c2941; border-radius: 24px;
        background: rgba(255, 253, 239, 0.985); color: #172236;
        box-shadow: 6px 7px 0 rgba(26, 46, 74, 0.18);
        font-family: "Press Start 2P", monospace;
        font-size: clamp(0.53rem, 1.15vw, 0.77rem);
        line-height: 1.7; text-align: center; opacity: 0; transform: translateY(8px);
      }
      .simon-flight-v16.is-flying .simon-flight-v16__thought {
        animation: simon-thought-v16 7.15s ease forwards;
      }
      .simon-flight-v16__thought-dot {
        position: absolute; display: block; border: 3px solid #1c2941; border-radius: 50%;
        background: rgba(255, 253, 239, 0.98); opacity: 0;
      }
      .simon-flight-v16__thought-dot.is-large { right: 24%; top: -34px; width: 20px; height: 20px; }
      .simon-flight-v16__thought-dot.is-small { right: 18%; top: -8px; width: 12px; height: 12px; }
      .simon-flight-v16.is-flying .simon-flight-v16__thought-dot {
        animation: simon-thought-dots-v16 7.15s ease forwards;
      }
      @keyframes simon-plane-cross-v16 {
        0%   { transform: translate3d(0, -50%, 0) translateY(6px) scale(0.92); }
        25%  { transform: translate3d(44vw, -50%, 0) translateY(-2px) scale(0.96); }
        70%  { transform: translate3d(111vw, -50%, 0) translateY(2px) scale(1.01); }
        100% { transform: translate3d(177vw, -50%, 0) translateY(-4px) scale(1.04); }
      }
      @keyframes simon-thought-v16 {
        0%, 14% { opacity: 0; transform: translateY(10px); }
        22%, 83% { opacity: 1; transform: translateY(0); }
        92%, 100% { opacity: 0; transform: translateY(-6px); }
      }
      @keyframes simon-thought-dots-v16 {
        0%, 16% { opacity: 0; }
        24%, 83% { opacity: 1; }
        92%, 100% { opacity: 0; }
      }
      @media (max-height: 430px) {
        .simon-flight-v16__plane-group { top: 52%; width: min(58vw, 520px); }
        .simon-flight-v16__thought {
          top: -110px; width: min(314px, 53vw); padding: 11px 13px;
          font-size: clamp(0.45rem, 1vw, 0.63rem);
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
