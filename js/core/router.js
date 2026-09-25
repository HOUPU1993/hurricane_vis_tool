// Minimal hash router driving which <section class="page"> is visible.
// Each page lives at #/<id> and its section is #page-<id>. Pages 1-7 map
// 1:1 to hash segments; the landing screen is "home".
const PAGE_IDS = ["home", "1", "2", "3", "4", "5", "6", "7"];
const CURTAIN_MS = 420; // matches the #page-curtain CSS transition duration

// Same seven accent colors the old homepage tile grid used per section -
// kept here as the single source of truth now that the tiles are gone, so
// the curtain transition can still color itself per destination page.
const PAGE_ACCENTS = {
  home: "#23232b",
  "1": "#2a78d6",
  "2": "#eb6834",
  "3": "#1baf7a",
  "4": "#eda100",
  "5": "#e87ba4",
  "6": "#008300",
  "7": "#4a3aa7",
};

export function initRouter({ onEnter } = {}) {
  const sections = new Map();
  for (const id of PAGE_IDS) {
    const el = document.getElementById(`page-${id}`);
    if (el) sections.set(id, el);
  }
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Returns the page id for a recognized #/<id> hash, or null for anything
  // else (including an in-page anchor like #ref-3 pointing at a citation -
  // that should scroll natively within the current page, not navigate).
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    return sections.has(raw) ? raw : null;
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

  window.addEventListener("hashchange", () => {
    // An unrecognized hash (e.g. an in-page citation anchor, #ref-3) isn't a
    // page navigation - leave the current page active and let the browser's
    // native anchor scroll do its thing, rather than bouncing to home.
    const id = parseHash();
    if (id) activate(id);
  });

  // A single curtain element, reused for every navigation rather than
  // recreated per click - a solid, destination-colored panel sweeps in,
  // the hash change (and the instant page--active swap it triggers)
  // happens while it's fully covering the screen, then it sweeps away to
  // reveal the new page. Content itself still gets .page-enter's fade+
  // drift underneath, so the reveal isn't a hard cut.
  let curtain = null;
  function getCurtain() {
    if (curtain) return curtain;
    curtain = document.createElement("div");
    curtain.id = "page-curtain";
    curtain.setAttribute("aria-hidden", "true");
    document.body.appendChild(curtain);
    return curtain;
  }

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#/"]');
    if (!link) return;

    const targetId = link.getAttribute("href").replace(/^#\//, "") || "home";
    const current = [...sections.entries()].find(([, el]) => el.classList.contains("page--active"));
    if (!current || current[0] === (sections.has(targetId) ? targetId : "home")) return;

    e.preventDefault();
    const el = getCurtain();
    el.style.background = PAGE_ACCENTS[targetId] || PAGE_ACCENTS.home;
    el.style.transition = "none";
    el.style.transform = "translateX(-101%)";
    void el.offsetWidth; // force reflow so the next transform actually animates
    el.style.transition = `transform ${CURTAIN_MS}ms cubic-bezier(.6,0,.2,1)`;
    el.style.transform = "translateX(0%)";

    setTimeout(() => {
      location.hash = `#/${targetId}`;
      el.style.transition = `transform ${CURTAIN_MS}ms cubic-bezier(.6,0,.2,1)`;
      el.style.transform = "translateX(101%)";
    }, CURTAIN_MS + 40);
  });

  activate(parseHash() || "home");
}
