// Types a sequence of {el, text} segments one after another - title, then
// subtitle, then lede - as one continuous typing pass, holds the finished
// text on screen, then clears it instantly (no backspace animation) and
// types the whole sequence again - forever, until stop() is called. A
// single blinking cursor node is moved onto whichever element is
// currently being typed.
//
// Used for the homepage hero block: started on every home-page visit and
// stopped the moment the visitor navigates away (see js/app.js), so it
// never keeps ticking in the background.
export function loopTypeSequence(
  segments,
  { typeSpeed = 75, holdMs = 5000, pauseMs = 350, segmentPauseMs = 250, onFirstComplete } = {}
) {
  const items = segments.filter((s) => s && s.el && s.text);
  if (!items.length) return { stop() {} };

  let stopped = false;
  let timer = null;
  let firstCompleteFired = false;

  const cursor = document.createElement("span");
  cursor.className = "type-cursor";

  function render(seg, i) {
    seg.el.textContent = seg.text.slice(0, i);
    seg.el.appendChild(cursor);
  }

  function schedule(fn, delay) {
    timer = setTimeout(() => {
      if (!stopped) fn();
    }, delay);
  }

  function typeSegment(segIndex, charIndex) {
    const seg = items[segIndex];
    render(seg, charIndex);
    if (charIndex < seg.text.length) {
      schedule(() => typeSegment(segIndex, charIndex + 1), seg.typeSpeed ?? typeSpeed);
      return;
    }
    if (segIndex < items.length - 1) {
      schedule(() => typeSegment(segIndex + 1, 0), segmentPauseMs);
      return;
    }
    if (!firstCompleteFired) {
      firstCompleteFired = true;
      if (onFirstComplete) onFirstComplete();
    }
    // Hold the fully-typed text on screen, then clear everything at once
    // (rather than animating a backspace) and start the sequence over.
    schedule(resetAndRetype, holdMs);
  }

  function resetAndRetype() {
    for (const seg of items) seg.el.textContent = "";
    schedule(() => typeSegment(0, 0), pauseMs);
  }

  // Blank every segment up front - otherwise a segment later in the queue
  // still shows its original static HTML text (there for no-JS/SEO) until
  // the sequence actually reaches it.
  for (const seg of items) seg.el.textContent = "";

  typeSegment(0, 0);

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}

// Single-element convenience wrapper, kept for anything that only ever
// types one string into one element.
export function loopType(el, text, opts = {}) {
  return loopTypeSequence([{ el, text }], opts);
}
