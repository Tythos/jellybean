/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    class Token {
        constructor() {
            /* Instantiates a new Token object, with an empty tag and empty value.
               Line and column coordinates both default to 0.
            */
            this.tag = "";
            this.value = "";
            this.line = 0;
            this.column = 0;
            return this;
        }
    }

    return Object.assign(Token, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
