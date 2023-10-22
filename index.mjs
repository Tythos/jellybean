/**
 * Initial entry point. Referenced from index.html.
 */

import Nameplate from "./Nameplate/index.mjs";

/**
 * Included here as an example of event subscription, this listener simply
 * reports that the name in the Nameplate UI element has been clicked.
 * 
 * @param {Object} event - Parameters extended from underlying mouseclick event
 */
function onNameClicked(event) {
    console.log("name clicked:", event);
}

/**
 * "Entry point" in which a Nameplace is instantiated, configured, and finally
 * rendered. See "README.md" for more details.
 * 
 * @param {Object} event - Basic on-window-load event
 */
function onWindowLoad(event) {
    new Nameplate()
        .set("name", "Bob")
        .set("age", 42)
        .on("NAME_CLICKED", onNameClicked)
        .render(window.document.body);
}

window.addEventListener("load", onWindowLoad);
