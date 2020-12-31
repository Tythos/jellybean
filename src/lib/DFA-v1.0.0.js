/**
 * @author "Brian Kirkpatrick" <code@tythos.net>
 */

define(function(require, exports, module) {
    let NFA = require("lib/NFA-v1.0.0");
    let Set = require("lib/Set-v1.0.0");

    class DFA {
        constructor() {
            this.nStates = 0;
            this.transitions = [];
            this.startingState = null;
            this.acceptingStates = [];
        }

        fromSubsetConstruction(nfa) {
            let alphabet = nfa.getAlphabet();

            // starting state will be epsilon closure of s0
            let s0_ = nfa.getEpsilonClosure(new Set([nfa.startingState]));
            
            // moves are a function of DFA state s' and alphabet element c; each entry is epsilon closure of {t | s E s' and s^ct E T}
            let moves = [];

            // new (DFA) states are union of {s0_} and {move(s', c) | s' E S', c E alphabet}
            let ndMap = [ s0_ ];

            // new accepting states are { s' E S' | s' ^ F != /0/ }
            let F_ = new Set();

            // track which NFA state indices comprise each DFA state (key=DFA state index; value=set of NFA states)

            // starting with s0_, iterate over alphabet for each new DFA state to determine moves
            let currDfaState_ndx = 0;
            while (currDfaState_ndx < ndMap.length) {
                alphabet.forEach(function(tc) {
                    // determine set of all NFA states reachable by transition out of this DFA state
                    let dests = new Set();
                    ndMap[currDfaState_ndx].forEach(function(nfaState_ndx) {
                        dests = dests.union(nfa.getEdgesBy(nfaState_ndx, tc));
                    });

                    // we must also supplement post-transitions with the epsilon closure of those states
                    dests = nfa.getEpsilonClosure(dests);

                    // compare to existing DFA states to see if this transition is new
                    for (let i = 0; i < ndMap.length; i++) {
                        if (ndMap[i].isEqual(dests)) {
                            moves.push([currDfaState_ndx, i, tc]);
                            return;
                        }
                    }

                    // having not found a matching DFA state, we add this one to the map and moves
                    if (0 < dests.getSize()) {
                        ndMap.push(dests);
                        moves.push([currDfaState_ndx, ndMap.length-1, tc]);
                    }
                });
                currDfaState_ndx += 1;
            }

            // iterate over all DFA states to determine those that contain accepting NFA states
            ndMap.forEach(function(nfaStates, dfaState_ndx) {
                if (0 < nfaStates.intersect(nfa.acceptingStates).getSize()) {
                    F_.push(dfaState_ndx);
                }
            });

            // conclude by assigning definition to DFA state model
            this.nStates = ndMap.length;
            this.transitions = moves;
            this.startingState = 0;
            this.acceptingStates = F_;

            // return map of NFA-DFA states to support debugging and other post-construction operations
            return ndMap;
        }
    }

    return Object.assign(DFA, {
        "__url__": "",
        "__semver__": "1.0.0",
        "__license__": "MIT"
    });
});
