// Types `text` into `el` one character at a time, then calls `onDone`. Used
// for the homepage hero question - re-run every time the home page is
// (re)entered (see js/app.js), so revisiting the landing page replays it.
export function typeText(el, text, { speed = 34, onDone } = {}) {
  if (!el) return;

  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  el.appendChild(cursor);

  let i = 0;

  function tick() {
    i += 1;
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);
    if (i < text.length) {
      setTimeout(tick, speed);
    } else if (onDone) {
      onDone();
    }
  }

  tick();
}
