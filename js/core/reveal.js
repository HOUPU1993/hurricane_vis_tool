// Fades/slides `.reveal` elements in as they scroll into view. Elements
// start hidden via CSS (`.reveal`) and get `.in-view` added once, the first
// time they cross the viewport - never re-hidden, so scrolling back up
// doesn't replay it. Call again with a specific root (e.g. after content is
// inserted dynamically, like the Page 4 cards) to pick up new elements.
export function initScrollReveal(root = document) {
  const items = root.querySelectorAll(".reveal:not(.in-view)");
  if (items.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
}
