import { initRouter } from "./core/router.js";
import { initScrollReveal } from "./core/reveal.js";
import { initDashboard } from "./main.js";
import { renderProfileCards } from "./core/profileCards.js";
import { CATEGORIES } from "./metrics/index.js";
import { loopTypeSequence } from "./core/typewriter.js";
import { initTerrainScene } from "./core/terrainScene.js";
import { initRegressionPage } from "./core/regressionPage.js";
import { initNationalStudyMap } from "./core/nationalStudyMap.js";
import { initOptionWheel, initWheelCitationJump } from "./core/optionWheel.js";
import { initTechText } from "./core/techText.js";

initScrollReveal();
initWheelCitationJump();

// Pages 1, 2, 5, 6, 7 each disclose their content through an Option Wheel
// (Page 3 keeps its own interactive map/dropdown instead, and Page 4's wheel
// is built from dynamically-rendered category cards below, once loaded).
// Their markup is static from page load, so the wheels themselves can init
// immediately - only the *content behind* a panel (KaTeX, the Page 7 map)
// needs the lazy, first-visit-only treatment already used per-page below.
const page7Wheel = document.getElementById("page7-wheel");
for (const id of ["page1-wheel", "page2-wheel", "page5-wheel", "page6-wheel", "page7-wheel"]) {
  const root = document.getElementById(id);
  if (root) initOptionWheel(root);
}

// The national-status Leaflet map lives behind Page 7's "Data-Collection
// Status" wheel panel, which isn't necessarily the panel shown by default -
// so, like Page 3's dashboard, it can't safely init until that panel is
// actually visible (Leaflet measures a display:none container as 0x0).
// Init once on first reveal, then just invalidateSize() on every later one.
if (page7Wheel) {
  page7Wheel.addEventListener("wheel:show", (e) => {
    if (e.detail.id !== "data-status") return;
    if (!nationalStudyMap) {
      nationalStudyMap = initNationalStudyMap("national-status-map");
    } else {
      setTimeout(() => nationalStudyMap.invalidateSize(), 0);
    }
  });
}

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
let mathRenderedPage7 = false;
let terrainScene = null;
let heroTechText = null;

// Every content page (all but Page 3) has exactly one <h2>, static in the
// DOM from page load - Tech Text is applied to it once, lazily, on first
// visit (the same first-visit-only pattern used for KaTeX/the regression
// page/the national map below), since it needs the heading's real on-screen
// size to lay out correctly, and that isn't available before the page's
// display:none is lifted.
const techTextPages = new Set();
function initHeadingTechText(pageId) {
  if (techTextPages.has(pageId)) return;
  techTextPages.add(pageId);
  const heading = document.querySelector(`#page-${pageId} h2`);
  if (!heading) return;
  const controller = initTechText(heading);
  if (controller) controller.show();
}

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
          // The title keeps a slow, dramatic pace on the very first
          // impression only (loopTypeSpeed takes over on every retype
          // after that - see js/core/typewriter.js - so the title doesn't
          // sit there slowly retyping alone for ~2s with the rest of the
          // hero still blank on every later pass). The subtitle/lede are
          // sped up throughout so the whole hero (title+subtitle+lede is
          // ~470 characters) still finishes in a reasonable time instead
          // of a single pass taking most of a minute at the title's
          // original per-character speed. Holds fully typed for 5s, then
          // clears and retypes - no backspace animation.
          { el: heroTitleEl, text: HERO_TITLE, loopTypeSpeed: 22 },
          { el: heroSubtitleEl, text: HERO_SUBTITLE, typeSpeed: 30 },
          { el: heroLedeEl, text: HERO_LEDE, typeSpeed: 24 },
        ],
        {
          holdMs: 5000,
          onFirstComplete: () => heroEl.classList.add("typing-done"),
          // Tech Text only ever overlays the title during the "settled"
          // hold window between typing passes - never while the typewriter
          // is actively writing/clearing it, so it can't fight that
          // character-by-character effect (left untouched, as asked).
          onHoldStart: () => {
            if (!heroTechText) heroTechText = initTechText(heroTitleEl, { reachRatio: 0.6, speckCount: 10 });
            if (heroTechText) heroTechText.show();
          },
          onHoldEnd: () => {
            if (heroTechText) heroTechText.hide();
          },
        }
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
      // Belt-and-suspenders: stop() above only halts the timer chain, so if
      // the page is left mid-hold (Tech Text actively overlaying the title),
      // this guarantees the title's DOM text is left opaque and normal
      // rather than stuck transparent under a now-frozen canvas.
      if (heroTechText) heroTechText.hide();
      if (terrainScene) terrainScene.stop();
    }

    // Every content page but Page 3 gets Tech Text on its single <h2>.
    if (id !== "home" && id !== "3") {
      initHeadingTechText(id);
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
        // Category sections come back tagged as .wheel-panel (see
        // profileCards.js) - the wheel can only be built once they exist.
        initOptionWheel(document.getElementById("page4-wheel"));
      });
    }

    if (id === "5" && !regressionPageLoaded) {
      regressionPageLoaded = true;
      initRegressionPage();
    }
  },
});
