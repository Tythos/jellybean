/**
 * 
 */

require(["lib/Set-v1.0.0", "lib/NFA-v1.0.0", "lib/DFA-v1.0.0"], function(Set, NFA, DFA) {
    // 2.6.1
    let nfa = new NFA();
    nfa.addEdges([
        [1, 5, null], // 1 is starting
        [5, 6, null],
        [5, 7, null],
        [6, 8, 'a'],
        [7, 8, 'b'],
        [8, 1, null],
        [1, 2, null],
        [2, 3, 'a'],
        [3, 4, 'c'] // 4 is accepting
    ]);
    nfa.startingState = 1;
    nfa.acceptingStates.push(4);
    console.log(nfa.getEpsilonClosure(new Set([1])));

    // 2.6.2
    let dfa = new DFA();
    let ndMap = dfa.fromSubsetConstruction(nfa);
    console.log("DFA edges:", dfa.transitions);
    console.log("DFA/NFA map:", ndMap.map(function(set) { return set.elements.sort(); }));

    // assign globals for debugging
    window.nfa = nfa;
    window.dfa = dfa;
});
