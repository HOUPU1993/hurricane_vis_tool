// Reusable "Tech Text" mouse-reactive heading effect - a simplified
// vanilla-canvas port of reactbits.dev's Tech Text component. The heading
// renders as solid text by default; within a soft-edged radius around the
// mouse (or an idle auto-sweep when the pointer isn't nearby) it swaps to a
// dashed "blueprint" outline, plus a few small blinking accent specks near
// the reveal point for texture. Deliberately dropped from the original
// component: per-letter drag physics and the on-canvas coordinate-readout
// HUD frame - both read as portfolio flourish rather than fitting this
// site's plainer academic register.
//
// initTechText(el, opts?) draws over `el`'s own text. The original text
// node is kept in the DOM (see the .tech-text-host CSS rule in main.css:
// color made transparent, everything else - layout, selection, screen
// readers, no-JS fallback - left alone) while a canvas overlay renders the
// visible glyphs on top of it. Returns { show, hide, relayout, destroy }:
//   - show()/hide() are for a caller that only wants the effect live some
//     of the time (the home hero uses this - see js/app.js - to run it only
//     while the typewriter is holding the finished title on screen, not
//     while it's actively re-typing the text underneath).
//   - h2 usage just calls show() once and leaves it on; an
//     IntersectionObserver pauses the animation loop whenever `el` scrolls
//     out of view so an off-screen heading costs nothing, and resumes it
//     automatically when shown again.
export function initTechText(el, opts = {}) {
  if (!el || el.dataset.techTextInit) return null;
  const text = (el.textContent || "").trim();
  if (!text) return null;
  el.dataset.techTextInit = "1";

  const cfg = {
    dashLength: 4,
    dashGap: 3,
    speckCount: 8,
    reachRatio: 0.5, // reveal radius, as a fraction of el's own width
    softness: 0.7,
    accentColor: "232,123,164", // matches the site's pink accent (rgb triplet)
    ...opts,
  };

  // Captured once, up front, so the canvas always paints with the heading's
  // real color rather than "transparent" - .tech-text-host (which makes the
  // underlying DOM text transparent) is only toggled on inside show()/hide(),
  // not here, since some callers (the home hero) need the plain, opaque DOM
  // text to keep rendering normally - e.g. while the typewriter is still
  // actively typing it - until show() is actually called.
  const textColor = getComputedStyle(el).color || "#ffffff";

  const canvas = document.createElement("canvas");
  canvas.className = "tech-text-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "none";
  el.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const solidLayer = document.createElement("canvas");
  const dashedLayer = document.createElement("canvas");

  let dpr = window.devicePixelRatio || 1;
  let w = 0, h = 0, ready = false;
  const lens = { x: 0, y: 0 };
  const targetLens = { x: 0, y: 0 };
  let inside = false;
  let sweepClock = Math.random() * 10;
  const speckSeed = Math.random() * 1000;
  let raf = null, last = 0, loopOn = false, visible = false;

  function wrapLines(measureCtx, maxWidth) {
    const words = text.split(/\s+/);
    const out = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (cur && measureCtx.measureText(test).width > maxWidth) {
        out.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
    return out;
  }

  function layout() {
    const rect = el.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    if (w < 2 || h < 2) {
      ready = false;
      return;
    }
    dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    solidLayer.width = canvas.width;
    solidLayer.height = canvas.height;
    dashedLayer.width = canvas.width;
    dashedLayer.height = canvas.height;

    const cs = getComputedStyle(el);
    const fontSize = parseFloat(cs.fontSize) || 24;
    const fontSpec = `${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
    const lineH = fontSize * 1.18;
    const align = cs.textAlign === "center" || cs.textAlign === "right" ? cs.textAlign : "left";
    const anchorX = align === "center" ? w / 2 : align === "right" ? w : 0;

    const sctx = solidLayer.getContext("2d");
    const dctx = dashedLayer.getContext("2d");
    [ctx, sctx, dctx].forEach((c) => {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      c.font = fontSpec;
      c.textAlign = align;
      c.textBaseline = "alphabetic";
    });

    const lines = wrapLines(sctx, w);
    const totalH = lineH * lines.length;
    const baseY = (h - totalH) / 2 + fontSize * 0.82;

    sctx.fillStyle = textColor;
    lines.forEach((line, i) => sctx.fillText(line, anchorX, baseY + i * lineH));

    dctx.strokeStyle = textColor;
    dctx.lineWidth = Math.max(1, fontSize * 0.018);
    dctx.setLineDash([cfg.dashLength, cfg.dashGap]);
    lines.forEach((line, i) => dctx.strokeText(line, anchorX, baseY + i * lineH));

    const startX = align === "center" ? w / 2 : align === "right" ? w * 0.85 : w * 0.15;
    targetLens.x = startX;
    targetLens.y = h / 2;
    if (!ready) {
      lens.x = targetLens.x;
      lens.y = targetLens.y;
    }
    ready = true;
  }

  function approach(cur, tgt, dt, seconds) {
    return cur + (tgt - cur) * (1 - Math.exp(-dt / Math.max(seconds, 0.001)));
  }

  function frame(now) {
    if (!loopOn) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!ready) {
      raf = requestAnimationFrame(frame);
      return;
    }

    if (!inside) {
      sweepClock += dt * 0.5;
      targetLens.x = w * (0.5 - 0.42 * Math.cos(sweepClock * 0.4));
      targetLens.y = h * (0.5 + 0.28 * Math.sin(sweepClock * 0.7));
    }
    const lag = inside ? 0.06 : 0.3;
    lens.x = approach(lens.x, targetLens.x, dt, lag);
    lens.y = approach(lens.y, targetLens.y, dt, lag);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(solidLayer, 0, 0);

    const reach = Math.max(30, w * cfg.reachRatio) * dpr;
    const inner = Math.max(0, 1 - cfg.softness);
    const cx = lens.x * dpr;
    const cy = lens.y * dpr;

    const scratch = document.createElement("canvas");
    scratch.width = canvas.width;
    scratch.height = canvas.height;
    const sctx = scratch.getContext("2d");
    sctx.drawImage(dashedLayer, 0, 0);
    sctx.globalCompositeOperation = "destination-in";
    const grad = sctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
    grad.addColorStop(Math.min(inner, 0.99), "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(cx - reach, cy - reach, reach * 2, reach * 2);

    // Cut the same soft circle out of the solid layer so the dashed reveal
    // doesn't double up on top of it.
    ctx.save();
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, reach / dpr, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "destination-out";
    const grad2 = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, reach / dpr);
    grad2.addColorStop(Math.min(inner, 0.99), "rgba(0,0,0,1)");
    grad2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad2;
    ctx.fillRect(lens.x - reach / dpr, lens.y - reach / dpr, (reach / dpr) * 2, (reach / dpr) * 2);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(scratch, 0, 0);

    if (cfg.speckCount > 0) {
      const rr = reach / dpr;
      for (let k = 0; k < cfg.speckCount; k++) {
        const t = (now / 1000) * 0.8 + k * 12.9;
        const rx = (Math.sin(speckSeed + k * 3.1 + t * 1.7) * 0.5 + 0.5) * rr * 1.5 - rr * 0.75;
        const ry = (Math.cos(speckSeed + k * 5.3 + t * 1.3) * 0.5 + 0.5) * rr * 1.5 - rr * 0.75;
        const blink = (Math.sin(t * 3 + k) + 1) / 2;
        if (blink < 0.55) continue;
        const size = k % 3 === 0 ? 3 : 2;
        ctx.fillStyle = `rgba(${cfg.accentColor},${(0.25 + blink * 0.5).toFixed(2)})`;
        ctx.fillRect(Math.round(lens.x + rx), Math.round(lens.y + ry), size, size);
      }
    }

    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() {
    loopOn = false;
    if (raf != null) cancelAnimationFrame(raf);
    raf = null;
  }

  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    inside = true;
    targetLens.x = e.clientX - r.left;
    targetLens.y = e.clientY - r.top;
  });
  el.addEventListener("mouseleave", () => {
    inside = false;
  });

  // Pauses the rAF loop (not the "shown" state) while `el` is off-screen,
  // so a heading on a page the reader has navigated away from - the SPA
  // keeps it in the DOM, just display:none on an ancestor - costs nothing.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && visible) {
          layout();
          startLoop();
        } else {
          stopLoop();
        }
      }
    },
    { threshold: 0.01 }
  );
  io.observe(el);

  const ro = new ResizeObserver(() => {
    if (visible) layout();
  });
  ro.observe(el);

  return {
    show() {
      visible = true;
      el.classList.add("tech-text-host");
      canvas.style.display = "block";
      layout();
      startLoop();
    },
    hide() {
      visible = false;
      stopLoop();
      canvas.style.display = "none";
      el.classList.remove("tech-text-host");
    },
    relayout: layout,
    destroy() {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      canvas.remove();
      el.classList.remove("tech-text-host");
      delete el.dataset.techTextInit;
    },
  };
}
