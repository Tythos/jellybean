/* Encapsulates a definition of grammar rules, as might be imported
   from a rules.csv file. Once parsed, this is used by the parser to generate
   an AST from an Array of Token objects.
*/

define(function(require, exports, module) {
    let papaparse = require("../deps/papaparse");
    let qudom = require("../deps/qudom");

    function Rule() {
        /* Instantiates a new Rule object, with an empty tag string and empty
           Array of sequences.
        */
        this.tag = "";
        this.sequences = [];
        return this;
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
        let table = qudom.qudom("table");
        let thead = qudom.qudom("thead");
        let tr = qudom.qudom("tr");
        tr.appendChild(qudom.qudom("th!Tag"));
        tr.appendChild(qudom.qudom("th!Sequences"));
        thead.appendChild(tr);
        table.appendChild(thead);

        let tbody = qudom.qudom("tbody");
        rules.forEach(function(rule) {
            rule.sequences.forEach(function(sequence, ndx) {
                let tr = qudom.qudom("tr");
                tr.appendChild(qudom.qudom("td!" + (0 < ndx ? "" : rule.tag)));
                tr.appendChild(qudom.qudom("td!" + sequence.join(" ")));
                tbody.appendChild(tr);
            });
        })
        table.appendChild(tbody);
        return table;
    };

    return Rule;
});
