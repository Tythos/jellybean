/* The lexer object is responsible for transforming a sequence of characters
   (the input stream) into a sequence of Token objects. This Lexer is also
   responsible for configuring its own user interface. The state of the Lexer
   is soley determined by character pointer for offset in current stream, and
   an ancillary cursor coordinate used to assign line and column values to
   generated tokens. Each step is invoked independently as a function of an
   input stream and known terminals, and generates zero or one tokens.
*/

define(function(require, exports, module) {
    let qudom = require("../deps/qudom");
    let Token = require("Token");

    function Lexer() {
        /* Constructs a new lexer, with initial state at beginning of a stream.
        */
        this.offset = 0;
        this.line = 0;
        this.column = 0;
        return this;
    }

    Lexer.prototype.step = function(text, terminals) {
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
    };

    Lexer.prototype.all = function(text, terminals) {
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
    };

    Lexer.prototype.render = function() {
        /* Returns the DOM subtree that defines the lexer's user interface.
        */
        let wrapper = qudom.qudom("div");

        // Define buttons
        wrapper.appendChild(qudom.qudom("input@type:button@value:Single Lex#lexStepButton"));
        wrapper.appendChild(qudom.qudom("input@type:button@value:Lex All#lexAllButton"));

        // Define table and header
        let table = qudom.qudom("table#lexTable");
        let thead = qudom.qudom("thead");
        let tr = qudom.qudom("tr");
        tr.appendChild(qudom.qudom("th!Tag"));
        tr.appendChild(qudom.qudom("th!Value"));
        tr.appendChild(qudom.qudom("th!Line"));
        tr.appendChild(qudom.qudom("th!Column"));

        // Define table body and append
        thead.appendChild(tr);
        table.appendChild(thead);
        let tbody = qudom.qudom("tbody");
        table.appendChild(tbody);
        wrapper.appendChild(table);

        // Return wrapper element
        return wrapper;
    };

    Lexer.prototype.incrementTable = function(text, token) {
        /* Adds a new row to the lexer's token table
        */
        let tbody = window.document.querySelector("#lexTable").querySelector("tbody");
        let tr = qudom.qudom("tr");
        tr.appendChild(qudom.qudom("td!" + token.tag));
        tr.appendChild(qudom.qudom("td!" + token.value));
        tr.appendChild(qudom.qudom("td!" + token.line));
        tr.appendChild(qudom.qudom("td!" + token.column));
        tbody.appendChild(tr);
    };

    return Lexer;
});
