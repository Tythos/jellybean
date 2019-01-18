/* Encapsulates a definition of terminal language tokens, as might be imported
   from a terminals.csv file. Once loaded, this is used by the lexer to
   generate an Array of token instances from an input stream.
*/

define(function(require, exports, module) {
    let papaparse = require("../deps/papaparse");
    let qudom = require("../deps/qudom");

    function Terminal() {
        /* Instantiates a new Terminal object, with an empty string for a tag
           and an empty Regular Expression object for a pattern.
        */
        this.tag = "";
        this.pattern = new RegExp();
        return this;
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
        let table = qudom.qudom("table");
        let thead = qudom.qudom("thead");
        let tr = qudom.qudom("tr");
        tr.appendChild(qudom.qudom("th!Tag"));
        tr.appendChild(qudom.qudom("th!Pattern"));
        thead.appendChild(tr);
        table.appendChild(thead);

        let tbody = qudom.qudom("tbody");
        terminals.forEach(function(terminal) {
            let tr = qudom.qudom("tr");
            tr.appendChild(qudom.qudom("td!" + terminal.tag));
            tr.appendChild(qudom.qudom("td!" + terminal.pattern));
            tbody.appendChild(tr);
        })
        table.appendChild(tbody);
        return table;
    };

    return Terminal;
});
