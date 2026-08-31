(() => {
  "use strict";

  if (window.__SIMON_FLIGHT_INTRO_V17__) return;
  window.__SIMON_FLIGHT_INTRO_V17__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Flight Intro v17: startSimonGame fehlt.");
    return;
  }

  let introShown = false;
  let introRunning = false;

  window.startSimonGame = function startSimonGameWithFlightIntroV17(options = {}) {
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
    document
      .querySelectorAll("[data-simon-flight-intro]")
      .forEach((node) => node.remove());

    ensureFlightStyles();

    const overlay = document.createElement("div");
    overlay.dataset.simonFlightIntro = "v17";
    overlay.className = "simon-flight-v17";

    const sky = document.createElement("img");
    sky.className = "simon-flight-v17__sky";
    sky.src = "flight-sky-v15.png";
    sky.alt = "";
    sky.draggable = false;

    const planeGroup = document.createElement("div");
    planeGroup.className = "simon-flight-v17__plane-group";

    const plane = document.createElement("img");
    plane.className = "simon-flight-v17__plane";
    plane.src = "flight-plane-v15.png";
    plane.alt = "Flugzeug nach Zürich";
    plane.draggable = false;
    planeGroup.appendChild(plane);

    // v17: the bubble is separate from the plane's fast transform, but its
    // position is continuously eased toward the aircraft. That keeps the
    // thought visibly connected to Simon's flight without making the sentence
    // race across the screen at aircraft speed.
    const thoughtGroup = document.createElement("div");
    thoughtGroup.className = "simon-flight-v17__thought-group";

    const thought = document.createElement("div");
    thought.className = "simon-flight-v17__thought";
    thought.textContent = "Ich muss unbedingt neue Schuhe kaufen gehen...";
    thoughtGroup.appendChild(thought);

    const dotLarge = document.createElement("span");
    dotLarge.className = "simon-flight-v17__connector-dot is-large";

    const dotSmall = document.createElement("span");
    dotSmall.className = "simon-flight-v17__connector-dot is-small";

    overlay.append(sky, planeGroup, thoughtGroup, dotLarge, dotSmall);
    document.body.appendChild(overlay);

    let raf = 0;
    let currentX = Number.NaN;
    let currentY = Number.NaN;

    const followThought = () => {
      if (!overlay.isConnected) return;

      const planeRect = plane.getBoundingClientRect();
      const bubbleRect = thought.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth || 820;
      const vh = window.innerHeight || document.documentElement.clientHeight || 390;

      // Aim above and slightly behind the cockpit. Clamp to the viewport so
      // the whole sentence remains readable while the aircraft enters/leaves.
      const rawX = planeRect.left + planeRect.width * 0.47 - bubbleRect.width * 0.50;
      const rawY = planeRect.top - bubbleRect.height - Math.max(26, planeRect.height * 0.16);
      const targetX = Math.max(14, Math.min(vw - bubbleRect.width - 14, rawX));
      const targetY = Math.max(12, Math.min(vh * 0.34, rawY));

      if (!Number.isFinite(currentX)) {
        currentX = targetX;
        currentY = targetY;
      } else {
        // Strong horizontal damping is the key readability change. Vertical
        // movement is a little more responsive so the bubble still feels tied
        // to the aircraft's gentle bob.
        currentX += (targetX - currentX) * 0.065;
        currentY += (targetY - currentY) * 0.10;
      }

      thoughtGroup.style.transform =
        `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      // Two real connector dots are positioned BETWEEN bubble and aircraft on
      // every frame. Even while the bubble lags, the thought still clearly
      // originates from the moving plane.
      const bubbleAnchorX = currentX + bubbleRect.width * 0.68;
      const bubbleAnchorY = currentY + bubbleRect.height + 5;
      const planeAnchorX = planeRect.left + planeRect.width * 0.60;
      const planeAnchorY = planeRect.top + planeRect.height * 0.24;

      const placeDot = (node, t) => {
        const x = bubbleAnchorX + (planeAnchorX - bubbleAnchorX) * t;
        const y = bubbleAnchorY + (planeAnchorY - bubbleAnchorY) * t;
        node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      };

      placeDot(dotLarge, 0.34);
      placeDot(dotSmall, 0.67);

      raf = requestAnimationFrame(followThought);
    };

    requestAnimationFrame(() => {
      overlay.classList.add("is-flying");
      followThought();
    });

    const finishTimer = window.setTimeout(() => {
      overlay.classList.add("is-leaving");

      window.setTimeout(() => {
        cancelAnimationFrame(raf);
        overlay.remove();
        onComplete?.();
      }, 420);
    }, 6250);

    // Failsafe if another runtime cleanup removes the intro early.
    const observer = new MutationObserver(() => {
      if (overlay.isConnected) return;
      window.clearTimeout(finishTimer);
      cancelAnimationFrame(raf);
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function ensureFlightStyles() {
    if (document.getElementById("simon-flight-v17-styles")) return;

    const style = document.createElement("style");
    style.id = "simon-flight-v17-styles";
    style.textContent = `
      .simon-flight-v17 {
        position: fixed;
        inset: 0;
        z-index: 200000;
        overflow: hidden;
        background: #74c9ff;
        opacity: 1;
        pointer-events: none;
        transition: opacity 400ms ease;
      }

      .simon-flight-v17.is-leaving { opacity: 0; }

      .simon-flight-v17__sky {
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

      .simon-flight-v17__plane-group {
        position: absolute;
        left: -66vw;
        top: 55%;
        width: min(61vw, 600px);
        transform: translate3d(0, -50%, 0);
        will-change: transform;
      }

      .simon-flight-v17.is-flying .simon-flight-v17__plane-group {
        animation: simon-plane-cross-v17 5.85s linear forwards;
      }

      .simon-flight-v17__plane {
        display: block;
        width: 100%;
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 10px 10px rgba(33, 81, 128, 0.22));
      }

      .simon-flight-v17__thought-group {
        position: absolute;
        left: 0;
        top: 0;
        width: min(360px, 61vw);
        opacity: 0;
        will-change: transform, opacity;
      }

      .simon-flight-v17.is-flying .simon-flight-v17__thought-group {
        animation: simon-thought-visible-v17 5.85s ease-in-out forwards;
      }

      .simon-flight-v17__thought {
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

      .simon-flight-v17__connector-dot {
        position: absolute;
        left: 0;
        top: 0;
        display: block;
        border: 3px solid #1c2941;
        border-radius: 50%;
        background: rgba(255, 253, 239, 0.985);
        opacity: 0;
        will-change: transform, opacity;
      }

      .simon-flight-v17__connector-dot.is-large {
        width: 17px;
        height: 17px;
        margin-left: -11px;
        margin-top: -11px;
      }

      .simon-flight-v17__connector-dot.is-small {
        width: 9px;
        height: 9px;
        margin-left: -7px;
        margin-top: -7px;
      }

      .simon-flight-v17.is-flying .simon-flight-v17__connector-dot {
        animation: simon-thought-visible-v17 5.85s ease-in-out forwards;
      }

      @keyframes simon-plane-cross-v17 {
        0%   { transform: translate3d(0, -50%, 0) translateY(5px) scale(0.92); }
        25%  { transform: translate3d(46vw, -50%, 0) translateY(-2px) scale(0.97); }
        68%  { transform: translate3d(116vw, -50%, 0) translateY(2px) scale(1.02); }
        100% { transform: translate3d(182vw, -50%, 0) translateY(-3px) scale(1.04); }
      }

      @keyframes simon-thought-visible-v17 {
        0%, 15%  { opacity: 0; }
        23%, 79% { opacity: 1; }
        91%,100% { opacity: 0; }
      }

      @media (max-height: 430px) {
        .simon-flight-v17__plane-group {
          top: 59%;
          width: min(55vw, 500px);
        }

        .simon-flight-v17__thought-group {
          width: min(340px, 57vw);
        }

        .simon-flight-v17__thought {
          padding: 10px 13px;
          font-size: clamp(0.43rem, 1vw, 0.62rem);
          line-height: 1.55;
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
