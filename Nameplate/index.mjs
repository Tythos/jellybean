/**
 * Demonstrates extension of the TripletUI model to define a basic "Nameplate"
 * UI element. In addition to the superclass, we also import the raw Handlebars
 * template contents and stylesheet at the module level for Vite to optimize.
 */

import TripletUI from "tripletui";
import RAW_TEMPLATE from "./index.hbs?raw";
import "./index.css?css";

/**
 * Models a basic "Nameplate" UI elemment using the TripletUI class. The
 * constructor passes the raw template contents to the parent and defiens what
 * event interfaces exist for this UI element.
 */
class Nameplate extends TripletUI {
    constructor() {
        super(RAW_TEMPLATE);
        this.eventInterfaces.push([".NameplateName", "click", "NAME_CLICKED"]);
    }
}

export default Object.assign(Nameplate, {
    "__tests__": {
        "exists": () => {
            expect(true).toEqual(true);
        }
    }
});
