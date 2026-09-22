// Types a sequence of {el, text} segments one after another - title, then
// subtitle, then lede - as one continuous typing pass, holds at the end,
// deletes the whole sequence back to nothing (last segment first), pauses,
// and repeats - forever, until stop() is called. A single blinking cursor
// node is moved onto whichever element is currently being typed or deleted.
//
// Used for the homepage hero block: started on every home-page visit and
// stopped the moment the visitor navigates away (see js/app.js), so it
// never keeps ticking in the background.
export function loopTypeSequence(
  segments,
  { typeSpeed = 75, deleteSpeed = 38, holdMs = 2400, pauseMs = 600, segmentPauseMs = 250, onFirstComplete } = {}
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
    schedule(() => deleteSegment(items.length - 1, seg.text.length), holdMs);
  }

  function deleteSegment(segIndex, charIndex) {
    const seg = items[segIndex];
    render(seg, charIndex);
    if (charIndex > 0) {
      schedule(() => deleteSegment(segIndex, charIndex - 1), seg.deleteSpeed ?? deleteSpeed);
      return;
    }
    if (segIndex > 0) {
      schedule(() => deleteSegment(segIndex - 1, items[segIndex - 1].text.length), seg.deleteSpeed ?? deleteSpeed);
      return;
    }
    schedule(() => typeSegment(0, 0), pauseMs);
  }

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
