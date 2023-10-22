/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    class Terminal {
        constructor() {
            this.tag = "";
            this.pattern = new RegExp();
        }
    }

    return Object.assign(Terminal, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
