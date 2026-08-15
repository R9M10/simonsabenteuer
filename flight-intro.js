(() => {
  "use strict";

  if (window.__SIMON_FLIGHT_INTRO_V13__) return;
  window.__SIMON_FLIGHT_INTRO_V13__ = true;

  const wrappedStartSimonGame = window.startSimonGame;

  if (typeof wrappedStartSimonGame !== "function") {
    console.error("Flight Intro v13: startSimonGame fehlt.");
    return;
  }

  let introShown = false;
  let introRunning = false;

  window.startSimonGame = function startSimonGameWithFlightIntro(options = {}) {
    const startMode = options?.startMode || "normal";

    // Developer jumps remain instant. The flight only belongs to the story path
    // after the Den-Haag shoe dialogue.
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

    const overlay = document.createElement("div");
    overlay.dataset.simonFlightIntro = "true";

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "200000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      background: "#79bdd8",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 260ms linear"
    });

    const canvas = document.createElement("canvas");
    canvas.width = 820;
    canvas.height = 390;

    Object.assign(canvas.style, {
      width: "100%",
      height: "100%",
      imageRendering: "pixelated",
      display: "block"
    });

    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const duration = 5200;
    const start = performance.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      overlay.style.opacity = "0";

      window.setTimeout(() => {
        overlay.remove();
        onComplete?.();
      }, 280);
    };

    const drawCloud = (x, y, scale = 1) => {
      ctx.fillStyle = "#eaf6f4";
      ctx.fillRect(x, y, 72 * scale, 18 * scale);
      ctx.fillRect(x + 14 * scale, y - 12 * scale, 47 * scale, 17 * scale);
      ctx.fillRect(x + 29 * scale, y - 22 * scale, 29 * scale, 15 * scale);
    };

    const drawPlane = (x, y) => {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));

      // shadow pixels
      ctx.fillStyle = "#486a79";
      ctx.fillRect(11, 13, 147, 10);

      // fuselage
      ctx.fillStyle = "#f2f2ed";
      ctx.fillRect(0, 0, 142, 25);
      ctx.fillRect(20, -5, 102, 35);

      // rounded-ish nose
      ctx.fillRect(133, 4, 18, 17);
      ctx.fillRect(146, 8, 10, 9);

      // wings
      ctx.fillStyle = "#d9dde0";
      ctx.fillRect(55, -27, 52, 24);
      ctx.fillRect(66, 24, 58, 24);
      ctx.fillStyle = "#c5ccd1";
      ctx.fillRect(74, -35, 19, 10);
      ctx.fillRect(89, 46, 17, 8);

      // Swiss-red tail
      ctx.fillStyle = "#d83d44";
      ctx.fillRect(4, -24, 25, 24);
      ctx.fillRect(8, -34, 16, 12);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(15, -29, 4, 13);
      ctx.fillRect(11, -25, 12, 4);

      // windows
      ctx.fillStyle = "#315a70";
      [38,54,70,86,102,118].forEach((wx) => {
        ctx.fillRect(wx, 5, 8, 7);
      });

      ctx.restore();
    };

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawThoughtBubble = (planeX, planeY, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      const bx = Math.max(65, Math.min(470, planeX + 55));
      const by = 57;
      const bw = 300;
      const bh = 108;

      ctx.fillStyle = "#fffdf2";
      ctx.strokeStyle = "#202735";
      ctx.lineWidth = 4;
      roundRect(bx, by, bw, bh, 18);
      ctx.fill();
      ctx.stroke();

      // thought-bubble dots point toward the plane
      const dot1x = Math.max(bx + 25, Math.min(bx + bw - 25, planeX + 78));
      ctx.fillStyle = "#fffdf2";
      ctx.strokeStyle = "#202735";
      ctx.beginPath();
      ctx.arc(dot1x, by + bh + 15, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dot1x + 11, by + bh + 34, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#202735";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '11px "Press Start 2P", monospace';

      ctx.fillText("ICH MUSS UNBEDINGT", bx + bw / 2, by + 31);
      ctx.fillText("NEUE SCHUHE", bx + bw / 2, by + 56);
      ctx.fillText("KAUFEN GEHEN...", bx + bw / 2, by + 81);

      ctx.restore();
    };

    const frame = (now) => {
      if (finished) return;

      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);

      // sky bands
      ctx.fillStyle = "#73b8d5";
      ctx.fillRect(0, 0, 820, 130);
      ctx.fillStyle = "#83c4dc";
      ctx.fillRect(0, 130, 820, 130);
      ctx.fillStyle = "#9bd2e2";
      ctx.fillRect(0, 260, 820, 130);

      // slowly drifting clouds
      const drift = (elapsed / 35) % 980;
      drawCloud(70 - drift * 0.22, 98, 1.0);
      drawCloud(470 - drift * 0.13, 230, 0.72);
      drawCloud(830 - drift * 0.18, 128, 0.9);
      drawCloud(1030 - drift * 0.18, 128, 0.9);

      // plane travels clearly from left to right
      const planeX = -185 + t * 1120;
      const planeY = 214 + Math.sin(t * Math.PI * 3) * 4;
      drawPlane(planeX, planeY);

      // thought appears after takeoff movement and disappears shortly before exit
      let bubbleAlpha = 0;
      if (t > 0.18 && t < 0.86) {
        bubbleAlpha = Math.min(1, (t - 0.18) / 0.10, (0.86 - t) / 0.10);
        drawThoughtBubble(planeX, planeY, bubbleAlpha);
      }

      if (t >= 1) {
        finish();
        return;
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
})();