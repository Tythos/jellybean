/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    const AstNode = require("AstNode");
    
    class Parser {
        constructor() {
            /* Instantiates a new Parser. Offset is index in tokens array where
               last we left; number of steps counts how many actions have been
               performed; isFinished is shortcut for enabling/disabling parsing.
            */
            this.offset = 0;
            this.nSteps = 0;
            this.isFinished = false;
            return this;
        }

        isSequenceShiftable(stack, next, sequence) {
            /* Returns true if there is a valid inner match between stack+next and
               sequence.
            */
            let stackNext = stack.concat([next]);
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
        }

        isSequenceReducable(stack, sequence) {
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
        }

        performShift(tokens, ast) {
            /* Shifting creates a new AST node child with the next token. The
               parser state (offset) is incremented to the next token.
            */
            let node = new AstNode();
            node.tag = tokens[this.offset].tag;
            node.children = tokens[this.offset];
            ast.children.push(node);
            this.offset += 1;
            console.debug(`SHIFT ${node.tag}}`);
        }

        performReduction(rule, ast) {
            /* A reduction places a number of nodes on the stack (right-most
               children of AST node) under a new node consolidated with the
               given reduction rule. Of note, the parser state (token) is NOT
               advanced.
            */
            let sequence = rule.sequence.split(/\s+/g);
            let m = ast.children.length;
            let n = sequence.length;
            let nodes = ast.children.splice(m - n, n);
            let node = new AstNode();
            node.tag = rule.tag;
            node.children = nodes;
            ast.children.push(node);
            console.debug(`REDUCE ${rule.tag} <= ${rule.sequence}`);
        }

        step(ast, tokens, rules) {
            /* Performs single-step lookup of potential shifts and reductions.
               Outcomes cover 0, 1, and N matching cases of shift and reduction
               rules, with the following actions (in caps):
               * 0s/0r: SYNTAX ERROR
               * 1s/0r: SHIFT
               * Ns/0r: SHIFT
               * 0s/1r: REDUCTION
               * 1s/1r: SHIFT (shift-reduce conflict)
               * Ns/1r: SHIFT (shift-reduce conflict)
               * 0s/Nr: SYNTAX ERROR (reduce-reduce conflict)
               * 1s/Nr: SHIFT (shift-reduce conflict)
               * Ns/Nr: SHIFT (shift-reduce conflict)
            */

            // Check for top-level nullable
            if (this.isFinished || ast.children.length == 1 && ast.children[0].tag == "/") {
                console.warn("Tokens reduced to top-level nullable");
                this.isFinished = true;
                return;
            }

            // Determine number of candidate operations
            let shifts = [];
            let reductions = [];
            let stack = ast.children.map(function(node) { return node.tag; });
            let isAtEnd = this.offset == tokens.length;
            let next = isAtEnd ? null : tokens[this.offset].tag;
            for (let i = 0; i < rules.length; i++) {
                let sequence = rules[i].sequence.split(/\s+/g);
                if (next && this.isSequenceShiftable(stack, next, sequence)) {
                    shifts.push(i);
                }
                if (this.isSequenceReducable(stack, sequence)) {
                    reductions.push(i);
                }
            }

            // Check each possible case of 0/1/N shifts/reductions
            let s = shifts.length, r = reductions.length;
            if (s == 0) {
                if (r == 0) {
                    throw new Error("SYNTAX ERROR: no shifts or reductions are possible");
                } else if (r == 1) {
                    this.performReduction(rules[reductions[0]], ast);
                } else {
                    throw new Error("SYNTAX ERROR: reduce/reduce conflict encountered");
                }
            } else if (s == 1) {
                if (r == 0) {
                    this.performShift(tokens, ast);
                } else if (r == 1) {
                    console.warn("SYNTAX WARNING: shift/reduce conflict encountered");
                    this.performShift(tokens, ast);
                } else {
                    console.warn("SYNTAX WARNING: shift/reduce conflict encountered");
                    this.performShift(tokens, ast);
                }
            } else {
                if (r == 0) {
                    this.performShift(tokens, ast);
                } else if (r == 1) {
                    console.warn("SYNTAX WARNING: shift/reduce conflict encountered");
                    this.performShift(tokens, ast);
                } else {
                    console.warn("SYNTAX WARNING: shift/reduce conflict encountered");
                    this.performShift(tokens, ast);
                }
            }
        }

        all(ast, tokens, rules) {
            /* Batches all parsing actions.
            */
            while (!this.isFinished) {
                this.step(ast, tokens, rules);
            }
        }
    }
    
    return Object.assign(Parser, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
