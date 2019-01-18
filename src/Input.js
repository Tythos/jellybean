/* Defines an input source, including rendering routines as a <textarea/>
   element. Doesn't really need to be an object, but this does clean up the
   entry point nicely (especially with accessors).
*/

define(function(require, exports, module) {
    let qudom = require("../deps/qudom");

    function Input() {
        /* Instantiates new Input with empty content.
        */
        this.text = "";
        return this;
    }

    Input.prototype.render = function() {
        /* Returns a <textarea/> element with on-keyup event listeners to
           ensure text stays up-to-date with user modifications.
        */
        let textarea = qudom.qudom("textarea#inputTextarea");
        textarea.value = this.text;
        textarea.addEventListener("keyup", function(event) {
            this.text = event.target.value;
        }.bind(this));
        return textarea;
    };

    Input.prototype.get = function() {
        /* Returns text content.
        */
        return this.text;
    };

    Input.prototype.set = function(text) {
        /* Sets text content state and updates <textarea/> element, if one has
           been rendered.
        */
        this.text = text;
        let textarea = window.document.querySelector("#inputTextarea")
        if (textarea) {
            textarea.value = this.text;
        }
    };

    return Input;
});
