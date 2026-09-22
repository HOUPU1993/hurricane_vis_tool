import { initRouter } from "./core/router.js";
import { initScrollReveal } from "./core/reveal.js";
import { initDashboard } from "./main.js";
import { renderProfileCards } from "./core/profileCards.js";
import { CATEGORIES } from "./metrics/index.js";
import { loopTypeSequence } from "./core/typewriter.js";
import { initSpotlight } from "./core/spotlight.js";

initScrollReveal();
initSpotlight();

// Duplicated from index.html's static hero markup (which stays as plain
// text for no-JS/SEO/accessibility) so the typewriter has a clean string -
// normalized whitespace, real em dashes - to type rather than the raw,
// indented HTML source text.
const HERO_TITLE = "Does Place Keep People Home?";
const HERO_SUBTITLE =
  "The Influence of Social and Material Dimensions of Place Attachment in Hurricane Evacuation Compliance under Mandatory Evacuation Orders";
const HERO_LEDE =
  "We use large-scale mobile phone data to detect who evacuated ahead of Hurricane Ian's landfall in Southwest Florida, and test whether place attachment — protecting a mortgaged home, or staying close to a social network — helps explain who stayed behind despite mandatory evacuation orders.";

const heroTitleEl = document.getElementById("hero-title");
const heroSubtitleEl = document.querySelector(".hero-subtitle");
const heroLedeEl = document.querySelector(".hero-lede");
const heroEl = document.querySelector(".hero");

let dashboard = null;
let profileCardsLoaded = false;
let heroTypeLoop = null;

initRouter({
  onEnter(id) {
    if (id === "home" && heroTitleEl && heroEl) {
      heroEl.classList.remove("typing-done");
      if (heroTypeLoop) heroTypeLoop.stop();
      heroTypeLoop = loopTypeSequence(
        [
          // The title keeps a slow, dramatic pace; the subtitle/lede are
          // sped up so the whole hero (title+subtitle+lede is ~470
          // characters) still finishes - and visibly loops - in a
          // reasonable time instead of a single pass taking most of a
          // minute at the title's per-character speed.
          { el: heroTitleEl, text: HERO_TITLE },
          { el: heroSubtitleEl, text: HERO_SUBTITLE, typeSpeed: 30, deleteSpeed: 16 },
          { el: heroLedeEl, text: HERO_LEDE, typeSpeed: 24, deleteSpeed: 14 },
        ],
        { holdMs: 3200, onFirstComplete: () => heroEl.classList.add("typing-done") }
      );
    } else if (heroTypeLoop) {
      // Leaving the home page - stop the loop rather than let it keep
      // ticking (and touching a hidden element) in the background.
      heroTypeLoop.stop();
      heroTypeLoop = null;
    }

    if (id === "3") {
      if (!dashboard) {
        dashboard = initDashboard();
      } else {
        // The map container was display:none since the last visit - Leaflet
        // needs telling its size may have changed before it redraws tiles.
        setTimeout(() => dashboard.map.invalidateSize(), 0);
      }
    }

    if (id === "4" && !profileCardsLoaded) {
      profileCardsLoaded = true;
      renderProfileCards(document.getElementById("profile-cards"), CATEGORIES).then(() => {
        initScrollReveal(document.getElementById("profile-cards"));
      });
    }
  },
});
