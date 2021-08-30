/**
 * 
 */

require(["Set", "NFA", "DFA"], function(Set, NFA, DFA) {
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

    // 2.8.1
    let dfa2 = new DFA();
    dfa2.addEdges([
        [0, 1, "a"],
        [1, 2, "b"],
        [2, 3, "a"],
        [3, 1, "b"],
        [1, 4, "a"],
        [2, 5, "b"],
        [5, 2, "b"],
        [4, 5, "b"],
        [4, 6, "a"],
        [6, 5, "a"],
        [5, 7, "a"],
        [7, 5, "b"],
        [7, 0, "a"]
    ]);
    dfa.startingState = 0;
    dfa.acceptingStates.push(0);
    dfa.acceptingStates.push(6);

    // assign globals for debugging
    window.nfa = nfa;
    window.dfa = dfa;
    window.dfa2 = dfa2;
});
