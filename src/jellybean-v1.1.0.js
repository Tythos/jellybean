/*
*/

/*require.config({
    "paths": {
        "hbs": "lib/hbsloader-v1.0.0"
    }
});*/

define(function(require, exports, module) {
    let papaparse = require("lib/papaparse-v5.0.2");
/*    let tAstNode = require("hbs!hbs/AstNode.hbs");
    let tInput = require("hbs!hbs/Input.hbs");
    let tLexer = require("hbs!hbs/Lexer.hbs");
    let tLexerRow = require("hbs!hbs/LexerRow.hbs");
    let tParser = require("hbs!hbs/Parser.hbs");
    let tParserRow = require("hbs!hbs/ParserRow.hbs");
    let tRules = require("hbs!hbs/Rules.hbs");
    let tTerminal = require("hbs!hbs/Terminal.hbs");*/

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

    class Terminal {
        constructor() {
            /* Instantiates a new Terminal object, with an empty string for a tag
               and an empty Regular Expression object for a pattern.
            */
            this.tag = "";
            this.pattern = new RegExp();
            return this;
        }
    }

    Terminal.fromCsv = function(csvText) {
        /* Returns an Array of Terminal instances, as deserialized from the
           given CSV text. CSV table should have a "tag" and a "pattern"
           column; tags will be upper-cased automatically, while patterns will
           have a beginning-of-string ("^") token prepended (for easy matching
           later on by the Lexer) before being copmiled into a Regular
           Expression object
        */
        let data = papaparse.parse(csvText.trim(), { "header": true }).data;
        return data.map(function(row) {
            let terminal = new Terminal();
            terminal.tag = row.tag.toUpperCase();
            terminal.pattern = new RegExp("^" + row.pattern);
            return terminal;
        });
    };

    Terminal.render = function(terminals) {
        /* Renders the given Array of Terminal instances into an
           easily-readable <table/> element.
        */
        /*return tTerminal.render({
            "headers": ["Tag", "Pattern"],
            "terminals": terminals
        });*/        
    };

    class Rule {
        constructor() {
            /* Instantiates a new Rule object, with an empty tag string and empty
               Array of sequences.
            */
            this.tag = "";
            this.sequences = [];
            return this;
        }
    }

    Rule.fromCsv = function(csvText) {
        /* Returns an Array of Rule instances as deserialized from the given
           .CSV content. Each row should have a "tag" and a "sequence" value,
           as denoted by the header. The tag will be upper-cased automatically,
           whereas the sequence is split into an Array from a space-delimited
           list of tags.
        */
        let data = papaparse.parse(csvText.trim(), { "header": true }).data;
        let rules = [];
        data.forEach(function(row) {
            let tags = rules.map(function(rule) { return rule.tag; });
            let tag = row.tag.toUpperCase();
            let sequence = row.sequence.split(/\s+/).map(function(tag) {
                return tag.trim().toUpperCase();
            });
            if (tags.indexOf(tag) < 0) {
                let rule = new Rule();
                rule.tag = tag;
                rule.sequences.push(sequence);
                rules.push(rule);
            } else {
                let rule = rules[tags.indexOf(tag)];
                rule.sequences.push(sequence);
            }
        });
        return rules;
    };

    Rule.render = function(rules) {
        /* Renders the grammar, as defined by an Array of Rule objects, into a
           table for user inspection and reference. Each row lists a sequence,
           and rows are grouped by target tag, which is only rendered for the
           first row to produce a readable and EBNF-like layout.
        */
        /*return tRules.render({
            "headers": ["Tag", "Sequences"],
            "rules": rules
        });*/
    };

    class Input {
        constructor() {
            /* Instantiates new Input with empty content.
            */
            this.text = "";
            return this;
        }

        render() {
            /* Returns a <textarea/> element with on-keyup event listeners to
               ensure text stays up-to-date with user modifications.
            */
            /*let subdom = tInput.render(this);
            subdom.querySelector("textarea").addEventListener("keyup", function(event) {
                this.text = event.target.value;
            }.bind(this));
            return subdom;*/
        }

        get() {
            /* Returns text content.
            */
            return this.text;
        }

        set(text) {
            /* Sets text content state and updates <textarea/> element, if one has
            been rendered.
            */
            this.text = text;
            let textarea = window.document.querySelector("#inputTextarea")
            if (textarea) {
                textarea.value = this.text;
            }
        }
    }

    class Lexer {
        constructor() {
            /* Constructs a new lexer, with initial state at beginning of a stream.
            */
            this.offset = 0;
            this.line = 0;
            this.column = 0;
            return this;
        }

        step(text, terminals) {
            /* Returns either a Token object, if possible, or null, if we have
               reached the end of the stream. Otherwise, an error is raised.
            */
            if (text.length <= this.offset) { return null; }
            let token = null;
            let input = text.substr(this.offset);
            for (let i = 0; i < terminals.length; i++) {
                let terminal = terminals[i];
                if (input.match(terminal.pattern)) {
                    token = new Token();
                    token.tag = terminal.tag;
                    token.value = input.match(terminal.pattern)[0];
                    token.line = this.line;
                    token.column = this.column;
                    if (token.value.match(/\n/)) {
                        this.line += 1;
                        this.column = 0;
                    } else {
                        this.column += token.value.length;
                    }
                    this.offset += token.value.length;
                    break;
                }
            }
            if (!token) {
                console.error("Unable to resolve next token");
            }
            return token;
        }

        all(text, terminals) {
            /* Iterates over lexing and returns Array of generated Token objects.
            */
            let isFailed = false;
            let tokens = [];
            while (!isFailed && this.offset < text.length) {
                try {
                    tokens.push(this.step(text, terminals));
                } catch (e) {
                    isFailed = true;
                }
            }
            return tokens;
        }

        render() {
            /* Returns the DOM subtree that defines the lexer's user interface.
            */
            /*return tLexer.render({
                "headers": ["Tag", "Value", "Line", "Column"]
            });*/
        }

        incrementTable(text, token) {
            /* Adds a new row to the lexer's token table
            */
            /*let table = window.document.querySelector("#lexTable");
            let row = tLexerRow.render(token).querySelector("tr");
            table.querySelector("tbody").appendChild(row);*/
        }
    }

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

        isRuleShiftable(rule, stack, next) {
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
        }

        isRuleReducable(rule, stack) {
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
        }

        isFinishable(ast, tokens) {
            /* A parsing operation has successfully concluded if:
                1. There are no more tokens to ingest
                2. The AST has a single, nullable child
            */
            let isTokensEnded = this.offset == tokens.length;
            let isSingleNullable = ast.isSingleNullable();
            return isTokensEnded && isSingleNullable;
        }

        getRuleByTag(rules, tag) {
            /* Returns a Rule object as identified by the given tag.
            */
            let tags = rules.map(function(rule) { return rule.tag; });
            if (tags.indexOf(tag) < 0) {
                console.error("No rule matching tag'" + tag + "'");
            }
            return rules[tags.indexOf(tag)];
        }

        step(ast, tokens, rules) {
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
            console.log(shifts, reductions);

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
            } else if (0 < shifts.length && reductions.length == 0) {
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
                console.error("REDUCE-REDUCE conflict:", reductions);
            }

            // Return new AST
            return ast;
        }

        all(ast, tokens, rules) {
            /* Batches all parsing actions.
            */
            while (!this.isFinished) {
                ast = this.step(ast, tokens, rules);
            }
            return ast;
        }

        render() {
            /* Renders a parser table, as returned in a single <div/> wrapper
               element for attachment to the document by the user.
            */
            /*return tParser.render({
                "headers": ["Step", "Symbol Stack", "Input Tokens", "Action"]
            });*/
        }
        
        incrementTable(ast, tokens, action) {
            /* Inserts a new row into the table based on the given action.
            */
            console.log(action);
            /*let table = window.document.querySelector("#parseTable");
            let row = tParserRow.render({
                "nSteps": this.nSteps,
                "stackTags": ast.children.map(function(node) { return node.tag; }),
                "tokenTags": tokens.slice(this.offset).map(function(token) { return token.tag; }),
                "action": action
            }).querySelector("tr");
            table.querySelector("tbody").appendChild(row);*/
        }
    }

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

        isSingleNullable() {
            /* Returns true if the node's only child is a single top-level
            nullable (has a root tag, "/").
            */
            return Array.isArray(this.children) && this.children.length == 1 && this.children[0].tag == "/";
        }

        getTab(n) {
            /* Returns an indent string for the given level.
            */
            return (new Array(n).fill("  ")).join("");
        }

        getLines(level=0) {
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
        }

        render() {
            /* Writes the stack out as pseudo-object tree, in a <pre/> element.
            */
            /*return tAstNode.render({
                "content": this.getLines(0)
            });*/
        }
    }

    Object.assign(exports, {
        "AstNode": AstNode,
        "Input": Input,
        "Lexer": Lexer,
        "Parser": Parser,
        "Rule": Rule,
        "Terminal": Terminal,
        "Token": Token,
        "__uni__": "com.github.tythos.jellybean",
        "__semver__": "1.0.0",
        "__author__": "code@tythos.net"
    });
});
