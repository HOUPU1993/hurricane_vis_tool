// Types `text` into `el`, holds it, deletes it, and retypes it - forever,
// until stop() is called. Used for the homepage hero question: started on
// every home-page visit and stopped the moment the visitor navigates away
// (see js/app.js), so it never keeps ticking in the background.
export function loopType(
  el,
  text,
  { typeSpeed = 75, deleteSpeed = 38, holdMs = 2400, pauseMs = 600, onFirstComplete } = {}
) {
  if (!el) return { stop() {} };

  let stopped = false;
  let timer = null;
  let firstCompleteFired = false;

  const cursor = document.createElement("span");
  cursor.className = "type-cursor";

  function render(i) {
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);
  }

  function schedule(fn, delay) {
    timer = setTimeout(() => {
      if (!stopped) fn();
    }, delay);
  }

  function typeStep(i) {
    render(i);
    if (i < text.length) {
      schedule(() => typeStep(i + 1), typeSpeed);
      return;
    }
    if (!firstCompleteFired) {
      firstCompleteFired = true;
      if (onFirstComplete) onFirstComplete();
    }
    schedule(() => deleteStep(text.length), holdMs);
  }

  function deleteStep(i) {
    render(i);
    if (i > 0) {
      schedule(() => deleteStep(i - 1), deleteSpeed);
    } else {
      schedule(() => typeStep(0), pauseMs);
    }
  }

  typeStep(0);

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}
