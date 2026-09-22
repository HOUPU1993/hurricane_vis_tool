import { initRouter } from "./core/router.js";
import { initScrollReveal } from "./core/reveal.js";
import { initDashboard } from "./main.js";
import { renderProfileCards } from "./core/profileCards.js";
import { CATEGORIES } from "./metrics/index.js";

initScrollReveal();

let dashboard = null;
let profileCardsLoaded = false;

initRouter({
  onEnter(id) {
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
