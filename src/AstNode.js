/* Defines a single node in an Abstract Syntax Tree. Nodes are identified by a
   tag (from rule or terminal token type), and either an Array of AstNode
   children or (for leaf nodes) the original Token object.
*/

define(function(require, exports, module) {
    let qudom = require("../deps/qudom");

    function AstNode() {
        /* Constructs a default AST node. Tag defaults to top-level node.
           Children defaults to empty array, but leaf nodes will have a Token
           instead.
        */
        this.tag = "/";
        this.children = [];
        return this;
    }

    AstNode.prototype.isSingleNullable = function() {
        /* Returns true if the node's only child is a single top-level
           nullable (has a root tag, "/").
        */
        return Array.isArray(this.children) && this.children.length == 1 && this.children[0].tag == "/";
    };

    AstNode.prototype.getTab = function(n) {
        /* Returns an indent string for the given level.
        */
        return (new Array(n).fill("  ")).join("");
    };

    AstNode.prototype.getLines = function(level) {
        /* Returns lines describing this and child nodes. Each line will be
           indenteded to the appropriate level, and will have either
           "[tag] = [value]" format for leaf nodes, or "[tag]:" followed by
           recursively-rendered and indented children lines.
        */
        let lines = "";
        if (Array.isArray(this.children)) {
            lines += this.getTab(level) + this.tag + ":\n";
            this.children.forEach(function(subNode) {
                lines += subNode.getLines(level + 1);
            });
        } else {
            lines += this.getTab(level) + this.tag + " = " + this.children.value + "\n";
        }
        return lines;
    };

    AstNode.prototype.render = function() {
        /* Writes the stack out as pseudo-object tree, in a <pre/> element.
        */
        let pre = qudom.qudom("pre");
        pre.textContent = this.getLines(0);
        return pre;
    };

    return AstNode;
});
