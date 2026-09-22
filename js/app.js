import { initRouter } from "./core/router.js";
import { initScrollReveal } from "./core/reveal.js";
import { initDashboard } from "./main.js";
import { renderProfileCards } from "./core/profileCards.js";
import { CATEGORIES } from "./metrics/index.js";
import { typeText } from "./core/typewriter.js";
import { initSpotlight } from "./core/spotlight.js";

initScrollReveal();
initSpotlight();

const HERO_TITLE = "Does Place Keep People Home?";
const heroTitleEl = document.getElementById("hero-title");
const heroEl = document.querySelector(".hero");

let dashboard = null;
let profileCardsLoaded = false;

initRouter({
  onEnter(id) {
    if (id === "home" && heroTitleEl && heroEl) {
      heroEl.classList.remove("typing-done");
      typeText(heroTitleEl, HERO_TITLE, {
        onDone: () => heroEl.classList.add("typing-done"),
      });
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
