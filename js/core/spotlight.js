// Cursor-follow "spotlight" reveal for the homepage background art: a faint
// evacuation-rate choropleth (assets/evac-rate-bg.svg) that's only visible
// in a soft circle around the pointer, pure black everywhere else - like a
// flashlight passing over the map. Purely decorative: it never intercepts
// clicks (pointer-events: none in CSS) and starts fully hidden (opacity 0
// until the pointer actually moves), so it can never flash on page load.
export function initSpotlight() {
  const el = document.querySelector(".bg-reveal");
  if (!el) return;

  let raf = null;
  function move(x, y) {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      raf = null;
    });
  }

  window.addEventListener("pointermove", (e) => {
    if (!document.body.classList.contains("is-home")) return;
    el.classList.add("is-active");
    move(e.clientX, e.clientY);
  });

  window.addEventListener("pointerleave", () => el.classList.remove("is-active"));
}
