/* The parser object is responsible for generating individual transformations
   to the AST based on ingestion of a token sequence and application of grammar
   rules. The parser state consists of an index in that token sequence, how
   many actions have been executed, and a basic "isFinished" flag.
*/

define(function(require, exports, module) {
    let qudom = require("../deps/qudom");
    let AstNode = require("AstNode");

    function Parser() {
        /* Instantiates a new Parser. Offset is index in tokens array where
           last we left; number of steps counts how many actions have been
           performed; isFinished is shortcut for enabling/disabling parsing.
        */
        this.offset = 0;
        this.nSteps = 0;
        this.isFinished = false;
        return this;
    }

    Parser.prototype.isSequenceShiftable = function(stack, next, sequence) {
        /* Returns true if there is a valid inner match between stack+next and
           sequence.
        */
        let stackNext = Array.concat(stack, [next]);
        for (let n = 1; n <= sequence.length; n++) {
            let isMatch = true;
            for (let i = 0; i < n; i++) {
                if (stackNext[stackNext.length - n + i] != sequence[i]) {
                    isMatch = false;
                }
            }
            if (isMatch) { return true; }
        }
        return false;
    };

    Parser.prototype.isSequenceReducable = function(stack, sequence) {
        /* Returns true if the RHS of the stack matches full rule sequence.
        */
        if (stack.length < sequence.length) { return false; }
        let n = sequence.length;
        for (let i = 0; i < sequence.length; i++) {
            if (stack[stack.length - n + i] != sequence[i]) {
                return false;
            }
        }
        return true;
    };

    Parser.prototype.isRuleShiftable = function(rule, stack, next) {
        /* If any sequences for the given rule (as identified by tag) are
           shiftable, returns the index of that sequence in that rule.
           Otherwise, returns -1.
        */
        let sequences = rule.sequences;
        for (let i = 0; i < sequences.length; i++) {
            if (this.isSequenceShiftable(stack, next, sequences[i])) {
                return i;
            }
        }
        return -1;
    };

    Parser.prototype.isRuleReducable = function(rule, stack) {
        /* If any sequences for the given rule (as identified by tag) are
           reducable, returns the index of that sequence in that rule.
           Otherwise, returns -1.
        */
        let sequences = rule.sequences;
        for (let i = 0; i < sequences.length; i++) {
            if (this.isSequenceReducable(stack, sequences[i])) {
                return i;
            }
        }
        return -1;
    };

    Parser.prototype.isFinishable = function(ast, tokens) {
        /* A parsing operation has successfully concluded if:
            1. There are no more tokens to ingest
            2. The AST has a single, nullable child
        */
        let isTokensEnded = this.offset == tokens.length;
        let isSingleNullable = ast.isSingleNullable();
        return isTokensEnded && isSingleNullable;
    };

    Parser.prototype.getRuleByTag = function(rules, tag) {
        /* Returns a Rule object as identified by the given tag.
        */
        let tags = rules.map(function(rule) { return rule.tag; });
        if (tags.indexOf(tag) < 0) {
            console.error("No rule matching tag'" + tag + "'");
        }
        return rules[tags.indexOf(tag)];
    };

    Parser.prototype.step = function(ast, tokens, rules) {
        /* Check each subrule to identify where shifts and reduces can take
           place. These are identified by a two-element array of rule
           non-terminal and index of expansion. Returns a new AST.
        */
        if (this.isFinished) { return ast; }
        if (!this.isFinished && this.isFinishable(ast, tokens)) {
            // "Actual" AST starts with single child, since "/" does not reduce to "/"
            this.incrementTable(ast, tokens, "Nullable");
            ast = ast.children[0];
            this.isFinished = true;
            return ast;
        }

        this.nSteps += 1;
        let tags = rules.map(function(rule) { return rule.tag; });
        let shifts = [];
        let reductions = [];
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            let rule = this.getRuleByTag(rules, tag);
            let stackTags = ast.children.map(function(node) { return node.tag; });
            let shift = this.offset < tokens.length ? this.isRuleShiftable(rule, stackTags, tokens[this.offset].tag) : -1;
            let reduce = this.isRuleReducable(rule, stackTags);
            if (0 <= shift) { shifts.push([tag, shift]); }
            if (0 <= reduce) { reductions.push([tag, reduce]); }
        }

        // No options? Syntax error.
        if (shifts.length == 0 && reductions.length == 0) {
            console.error("Syntax error encountered at token:", tokens[this.offset]);
        } else if (reductions.length == 1 && reductions[0][0] == "") {
            // Dismissed nullable: pop from stack
            let tag = reductions[0][0];
            let rule = this.getRuleByTag(rules, tag);
            let sequence = rule.sequences[reductions[0][1]];
            ast.children.splice(ast.children.length - 1, 1);
            this.incrementTable(ast, tokens, "Dismiss: " + sequence.join(" "));
        } else if (shifts.length == 1 && reductions.length == 0) {
            // Single shift action
            let node = new AstNode();
            node.tag = tokens[this.offset].tag;
            node.children = tokens[this.offset];
            this.incrementTable(ast, tokens, "Shift " + node.tag);
            ast.children.push(node);
            this.offset += 1;
        } else if (shifts.length == 0 && reductions.length == 1) {
            // Single reduction action
            let tag = reductions[0][0];
            let rule = this.getRuleByTag(rules, tag);
            let sequence = rule.sequences[reductions[0][1]];
            this.incrementTable(ast, tokens, "Reduce " + tag + " : " + sequence.join(" "));
            let nodes = ast.children.splice(ast.children.length - sequence.length, sequence.length);
            let node = new AstNode();
            node.tag = tag;
            node.children = nodes;
            ast.children.push(node);
        } else if (0 < shifts.length && reductions.length == 1 && reductions[0][0] == "/") {
            // Reduction is nullable, there is no conflict
            let node = new AstNode();
            node.tag = tokens[this.offset].tag;
            node.children = tokens[this.offset];
            this.incrementTable(ast, tokens, "Shift " + node.tag);
            ast.children.push(node);
            this.offset += 1;
        } else if (0 < shifts.length && 0 < reductions.length) {
            // Resolve shift-reduce in favor of shift
            console.warn("SHIFT-REDUCE conflict:", shifts, reductions);
            let node = new AstNode();
            node.tag = tokens[this.offset].tag;
            node.children = tokens[this.offset];
            this.incrementTable(ast, tokens, "Shift " + node.tag);
            ast.children.push(node);
            this.offset += 1;
        } else {
            // Unresolvable conflicts
            console.error("REDUCE-REDUCE conflict");
        }

        // Return new AST
        return ast;
    };

    Parser.prototype.all = function(ast, tokens, rules) {
        /* Batches all parsing actions.
        */
        while (!this.isFinished) {
            ast = this.step(ast, tokens, rules);
        }
        return ast;
    };

    Parser.prototype.render = function() {
        /* Renders a parser table, as returned in a single <div/> wrapper
           element for attachment to the document by the user.
        */

        // Define wrapper, input buttons
        let wrapper = qudom.qudom("div");
        wrapper.appendChild(qudom.qudom("input@type:button@value:Parse Single Step#parseStepButton"));
        wrapper.appendChild(qudom.qudom("input@type:button@value:Parse All#parseAllButton"));

        // Define table layout
        let table = qudom.qudom("table#parseTable");
        let thead = qudom.qudom("thead");
        let tr = qudom.qudom("tr");
        tr.appendChild(qudom.qudom("th!Step"));
        tr.appendChild(qudom.qudom("th!Symbol Stack"));
        tr.appendChild(qudom.qudom("th!Input Tokens"));
        tr.appendChild(qudom.qudom("th!Action"));
        thead.appendChild(tr);
        table.appendChild(thead);
        table.appendChild(qudom.qudom("tbody"));
        wrapper.appendChild(table);

        // Return wrapper element
        return wrapper;
    };
    
    Parser.prototype.incrementTable = function(ast, tokens, action) {
        /* Inserts a new row into the table based on the given action.
        */
        let tbody = window.document.querySelector("#parseTable").querySelector("tbody");
        let tr = qudom.qudom("tr");
        let stackTags = ast.children.map(function(node) { return node.tag; });
        let tokenTags = tokens.slice(this.offset).map(function(token) { return token.tag; });
        tr.appendChild(qudom.qudom("td!" + this.nSteps));
        tr.appendChild(qudom.qudom("td!" + stackTags.join(" ")));
        tr.appendChild(qudom.qudom("td!" + tokenTags.join(" ")));
        tr.appendChild(qudom.qudom("td!" + action));
        tbody.appendChild(tr);
    };

    return Parser;
});
