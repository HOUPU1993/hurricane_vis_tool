// Minimal hash router driving which <section class="page"> is visible.
// Each page lives at #/<id> and its section is #page-<id>. Pages 1-7 map
// 1:1 to hash segments; the landing screen is "home".
const PAGE_IDS = ["home", "1", "2", "3", "4", "5", "6", "7"];

export function initRouter({ onEnter } = {}) {
  const sections = new Map();
  for (const id of PAGE_IDS) {
    const el = document.getElementById(`page-${id}`);
    if (el) sections.set(id, el);
  }
  const navLinks = document.querySelectorAll("[data-nav-link]");

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    return sections.has(raw) ? raw : "home";
  }

  function activate(id) {
    for (const [pid, el] of sections) {
      const active = pid === id;
      el.classList.toggle("page--active", active);
      if (active) {
        // Restart the entrance animation on every visit, not just the first.
        el.classList.remove("page-enter");
        void el.offsetWidth;
        el.classList.add("page-enter");
      }
    }
    for (const link of navLinks) {
      link.classList.toggle("nav-link--active", link.dataset.navLink === id);
    }
    window.scrollTo(0, 0);
    if (onEnter) onEnter(id);
  }

  window.addEventListener("hashchange", () => activate(parseHash()));
  activate(parseHash());
}
