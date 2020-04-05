/* Main entry point. Sets up configurations (input, terminals, rules, the
   latter two of which are loaded dynamically from .CSV files), and adds
   interface elements for stepping through lexing/parsing.
*/

require(["lib/quajax-v1.0.0", "jellybean-v1.0.0"], function(quajax, jellybean) {
    // Load, render terminals
    terminals = [];
    quajax.get("data/terminals.csv", function(csvText) {
        terminals = jellybean.Terminal.fromCsv(csvText);
        window.document.querySelector("#terminals").appendChild(jellybean.Terminal.render(terminals));
    });

    // Load, render rules
    rules = [];
    quajax.get("data/rules.csv", function(csvText) {
        rules = jellybean.Rule.fromCsv(csvText);
        window.document.querySelector("#rules").appendChild(jellybean.Rule.render(rules));
    });

    // Define, render input
    input = new jellybean.Input();
    input.set("3 + 5 * \n(10 - \t20)");
    window.document.querySelector("#input").appendChild(input.render());

    // Define lexer, global tokens Array, interface hooks
    tokens = [];
    lexer = new jellybean.Lexer();
    window.document.querySelector("#lexer").appendChild(lexer.render());
    window.document.querySelector("#lexStepButton").addEventListener("click", function(event) {
        let token = lexer.step(input.get(), terminals);
        lexer.incrementTable(input.get(), token);
        tokens.push(token);
    });
    window.document.querySelector("#lexAllButton").addEventListener("click", function(event) {
        tokens = lexer.all(input.get(), terminals);
        tokens.forEach(function(token) {
            lexer.incrementTable(input.get(), token);
        });
    });

    // Define AST (top-level stack node), parser, interface hooks
    ast = new jellybean.AstNode();
    parser = new jellybean.Parser();
    window.document.querySelector("#parser").appendChild(parser.render());
    window.document.querySelector("#parseStepButton").addEventListener("click", function(event) {
        ast = parser.step(ast, tokens, rules);
        if (parser.isFinished) {
            window.document.querySelector("#ast").appendChild(ast.render());
        }
    });
    window.document.querySelector("#parseAllButton").addEventListener("click", function(event) {
        ast = parser.all(ast, tokens, rules);
        if (parser.isFinished) {
            window.document.querySelector("#ast").appendChild(ast.render());
        }
    });
});
