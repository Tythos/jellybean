/* Main entry point. Sets up configurations (input, terminals, rules, the
   latter two of which are loaded dynamically from .CSV files), and adds
   interface elements for stepping through lexing/parsing.
*/

require(["Terminal", "Lexer", "lib/papaparse-v5.0.2", "DomLog"], function(Terminal, Lexer, papaparse, DomLog) {
    let lxr = new Lexer();

    function onTerminalsLoaded(csvText) {
        lxr.terminals = papaparse.parse(csvText.trim(), { "header": true }).data.map(function(row) {
            return Object.assign(new Terminal(), {
                "tag": row.tag.toUpperCase(),
                "pattern": new RegExp("^" + row.pattern)
            });
        });
        let tokens = lxr.all("1 + 2 * (3 - 4)");
        window.document.body.appendChild(DomLog.arrObjTable(tokens));
    }

    fetch("data/terminals.csv").then(response => response.text()).then(onTerminalsLoaded);

    // attach debugging symbols to global namespace
    Object.assign(window, {
        "lxr": lxr
    });
});
