/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    const Token = require("Token");
    
    class Lexer {
        constructor() {
            /* Constructs a new lexer, with initial state at beginning of a stream.
            */
            this.offset = 0;
            this.line = 0;
            this.column = 0;
            this.terminals = [];
            return this;
        }

        step(text) {
            /* Single-step lexing pass against the given text stream. Starting
               from offset (lexer state), ingests and yields a single Token
               object in accordance with the given terminal objects (as loaded
               from a CSV table). If end-of-text is reached, returns null. If
               no token can be parsed, an Error is thrown.
            */
            if (text.length <= this.offset) { return null; }
            let token = null;
            let input = text.substr(this.offset);

            // first advance past whitespace
            let ws = input.match(/^\s+/);
            if (ws) {
                this.offset += ws[0].length;
                input = text.substr(this.offset);
            }

            // then, check each token pattern
            for (let i = 0; i < this.terminals.length; i++) {
                let terminal = this.terminals[i];
                let rem = input.match(terminal.pattern);
                if (rem) {
                    token = new Token();
                    token.tag = terminal.tag;
                    token.value = rem[0];
                    token.line = this.line;
                    token.column = this.column;
                    if (token.value.match(/\r?\n/)) {
                        this.line += 1;
                        this.column = 0;
                    } else {
                        this.column += token.value.length;
                    }
                    this.offset += token.value.length;
                    return token;
                }
            }
            throw new Error("Unable to resolve next token");
        }

        all(text) {
            /* Iterates over lexing and returns Array of generated Token objects.
            */
            let isFailed = false;
            let tokens = [];
            while (!isFailed && this.offset < text.length) {
                try {
                    tokens.push(this.step(text, this.terminals));
                } catch (e) {
                    isFailed = true;
                }
            }
            if (isFailed) {
                throw new Error("Encountered tokenization error");
            }
            return tokens;
        }
    }

    return Object.assign(Lexer, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
