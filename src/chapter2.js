/**
 * 
 */

require(["lib/Set-v1.0.0", "lib/NFA-v1.0.0"], function(Set, NFA) {
    // 2.6.1
    let nfa = new NFA();
    nfa.addEdges([
        [1, 5, null],
        [5, 6, null],
        [5, 7, null],
        [6, 8, 'a'],
        [7, 8, 'b'],
        [8, 1, null],
        [1, 2, null],
        [2, 3, 'a'],
        [3, 4, 'c']
    ]);
    console.log(nfa.getEpsilonClosure(new Set([1])));
});
