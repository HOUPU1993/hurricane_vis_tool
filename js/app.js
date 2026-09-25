import { initRouter } from "./core/router.js";
import { initScrollReveal } from "./core/reveal.js";
import { initDashboard } from "./main.js";
import { renderProfileCards } from "./core/profileCards.js";
import { CATEGORIES } from "./metrics/index.js";
import { loopTypeSequence } from "./core/typewriter.js";
import { initTerrainScene } from "./core/terrainScene.js";
import { initRegressionPage } from "./core/regressionPage.js";
import { initNationalStudyMap } from "./core/nationalStudyMap.js";

initScrollReveal();

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
const terrainRootEl = document.getElementById("terrain-root");

let dashboard = null;
let profileCardsLoaded = false;
let heroTypeLoop = null;
let mathRendered = false;
let regressionPageLoaded = false;
let nationalStudyMap = null;
let nationalMapLoaded = false;
let mathRenderedPage7 = false;
let terrainScene = null;

// Shared by Page 2 and Page 7, both authored with the same \(...\)/\[...\]
// KaTeX auto-render delimiters (loaded via CDN in index.html).
function renderMathIn(pageEl) {
  if (window.renderMathInElement) {
    window.renderMathInElement(pageEl, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }
}

initRouter({
  onEnter(id) {
    if (id === "home" && heroTitleEl && heroEl) {
      heroEl.classList.remove("typing-done");
      if (heroTypeLoop) heroTypeLoop.stop();
      heroTypeLoop = loopTypeSequence(
        [
          // The title keeps a slow, dramatic pace; the subtitle/lede are
          // sped up so the whole hero (title+subtitle+lede is ~470
          // characters) still finishes in a reasonable time instead of a
          // single pass taking most of a minute at the title's
          // per-character speed. Holds fully typed for 5s, then clears
          // and retypes - no backspace animation.
          { el: heroTitleEl, text: HERO_TITLE },
          { el: heroSubtitleEl, text: HERO_SUBTITLE, typeSpeed: 30 },
          { el: heroLedeEl, text: HERO_LEDE, typeSpeed: 24 },
        ],
        { holdMs: 5000, onFirstComplete: () => heroEl.classList.add("typing-done") }
      );
      if (!terrainScene) {
        terrainScene = initTerrainScene(terrainRootEl);
      } else {
        terrainScene.resume();
      }
    } else {
      if (heroTypeLoop) {
        // Leaving the home page - stop the loop rather than let it keep
        // ticking (and touching a hidden element) in the background.
        heroTypeLoop.stop();
        heroTypeLoop = null;
      }
      if (terrainScene) terrainScene.stop();
    }

    // Page 2's methodology math is authored with the same \(...\)/\[...\]
    // delimiters KaTeX's auto-render extension looks for, loaded via CDN
    // in index.html. Rendered once, lazily, on first visit.
    if (id === "2" && !mathRendered && window.renderMathInElement) {
      mathRendered = true;
      renderMathIn(document.getElementById("page-2"));
    }

    // Page 7's geohash8 / road-infrastructure formulas use the same
    // delimiter convention - render once, lazily, on first visit.
    if (id === "7" && !mathRenderedPage7 && window.renderMathInElement) {
      mathRenderedPage7 = true;
      renderMathIn(document.getElementById("page-7"));
    }

    if (id === "7" && !nationalMapLoaded) {
      nationalMapLoaded = true;
      nationalStudyMap = initNationalStudyMap("national-status-map");
      initScrollReveal(document.getElementById("page-7"));
    } else if (id === "7" && nationalStudyMap) {
      // Same Leaflet display:none-container caveat as Page 3's dashboard -
      // tell it to remeasure now that its container is visible again.
      setTimeout(() => nationalStudyMap.invalidateSize(), 0);
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

    if (id === "5" && !regressionPageLoaded) {
      regressionPageLoaded = true;
      initRegressionPage();
      initScrollReveal(document.getElementById("page-5"));
    }
  },
});
