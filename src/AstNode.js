/**
 * @author <code@tythos.net
 */

define(function(require, exports, module) {
    class AstNode {
        constructor() {
            /* Constructs a default AST node. Tag defaults to top-level node.
               Children defaults to empty array, but leaf nodes will have a Token
               instead.
            */
            this.tag = "/";
            this.children = [];
            return this;
        }
    }

    return Object.assign(AstNode, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
