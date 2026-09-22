// Minimal hash router driving which <section class="page"> is visible.
// Each page lives at #/<id> and its section is #page-<id>. Pages 1-7 map
// 1:1 to hash segments; the landing screen is "home".
const PAGE_IDS = ["home", "1", "2", "3", "4", "5", "6", "7"];
const LEAVE_MS = 200; // matches the .page-leaving CSS animation duration

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
    document.body.classList.toggle("is-home", id === "home");
    window.scrollTo(0, 0);
    if (onEnter) onEnter(id);
  }

  window.addEventListener("hashchange", () => activate(parseHash()));

  // Clicking a card/nav link fades the current page out first, then swaps -
  // a deliberate page-to-page jump rather than an instant content swap.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#/"]');
    if (!link) return;

    const targetId = link.getAttribute("href").replace(/^#\//, "") || "home";
    const current = [...sections.entries()].find(([, el]) => el.classList.contains("page--active"));
    if (!current || current[0] === (sections.has(targetId) ? targetId : "home")) return;

    e.preventDefault();
    const [, currentEl] = current;
    currentEl.classList.add("page-leaving");
    setTimeout(() => {
      currentEl.classList.remove("page-leaving");
      location.hash = `#/${targetId}`;
    }, LEAVE_MS);
  });

  activate(parseHash());
}
