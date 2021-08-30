/**
 * @author "Brian Kirkpatrick" <code@tythos.net>
 */

define(function(require, exports, module) {
    let NFA = require("NFA");
    let Set = require("Set");

    /**
     * Models a deterministic finite automota. Specific states are implicit.
     */
    class DFA {
        constructor() {
            this.nStates = 0;
            this.transitions = [];
            this.startingState = null;
            this.acceptingStates = [];
        }

        /**
         * Populates transitions property (and nStates, if exceeded).
         * 
         * @param {Array} edges - Array of edges. Each edge is a three-element Array listing "from" index, "to" index, and transition condition.
         */
        addEdges(edges) {
            edges.forEach(function(edge) {
                this.transitions.push(edge);
                if (this.nStates <= edge[0]) {
                    this.nStates = edge[0] - 1;
                }
                if (this.nStates <= edge[1]) {
                    this.nstates = edge[1] - 1;
                }
            }, this);
        }

        /**
         * Returns a Set containing the alphabet for this DFA (e.g., unique
         * transition conditions across all edges).
         * 
         * @returns {Set} - Alphabet (Set) containing all unique transition conditions
         */
        getAlphabet() {
            let alphabet = new Set();
            this.transitions.forEach(function(transition) {
                alphabet.push(transition[2]);
            });
            return alphabet;
        }

        /**
         * Uses subset construction to define (populate) a new DFA equivalent
         * of the NFA passed into the method.
         * 
         * @param {NFA} nfa - Non-deterministic finite automota from which a new DFA will be constructed
         * @returns {Array} - "Map" of DFA states (by index) to the old NFA states they represent (as Array of NFA indices)
         */
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

        /**
         * Returns a set of indices defining the current states of the DFA,
         * based on the nStates property.
         * 
         * @returns {Set} - Set expression of current states of the DFA (Number values)
         */
        getStates() {
            return new Set(new Array(this.nStates).fill(null).map(function(_, i) {
                return i;
            }));
        }

        /**
         * Returns subset of edges (Array of triplets) originating from the
         * given state index.
         * 
         * @param {Number} fromIndex - Index (number) of "from" state
         * @returns {Array}          - Array of three-element Arrays, each of which contains a triplet of "from", "to", "transition" edges
         */
        getEdgesFrom(fromIndex) {
            let subset = [];
            this.transitions.forEach(function(edge) {
                if (edge[0] == fromIndex) {
                    subset.push(edge);
                }
            });
            return subset;
        }

        /**
         * Determines destination states reachable from given state (index) by
         * transition condition. Unlike getEdgesFrom(), this determines a set
         * of destination state indices, since we alreayd constrain source and
         * transition condition. Unlike the NFA equivalent, this should only be
         * zero or one destination (since we are deterministic). Therefore, we
         * either return the index of the destination, or null.
         * 
         * @param {Number} fromIndex           - Index of state from which transition occurs
         * @param {String} transitionCondition - Transition condition of edges to consider
         * @returns {Number|null}              - Index of state reached from given state by transition condition, if any
         */
        getEdgesBy(fromIndex, transitionCondition) {
            for (let i = 0; i < this.transitions.length; i++) {
                let edge = this.transitions[i];
                if (edge[0] == fromIndex && edge[2] == transitionCondition) {
                    return edge[1];
                }
            }
            return null;
        }

        /**
         * Checks the given transition table (member index by transition index)
         * and returns true if it is consistent--that is, if it has identical
         * transition destinations (group indices) for each member.
         * 
         * @param {Array} tt - Actually a "two-dimensional" Array; outer dimension is member index, inner dimension is transition index. Values are destinations (group indices) for that transition.
         * @returns {Boolan} - Is "true" if the transition table is consistent.
         */
        checkGroupConsistency(tt) {
            if (tt.length == 0) { return true; } // it's consistent if it has no members--but this edge case shouldn't be encountered
            let nMembers = tt.length;
            let nTransitions = tt[0].length;
            for (let j = 0; j < nTransitions; j++) {
                let dest = tt[0][j];
                for (let i = 1; i < nMembers; i++) {
                    if (tt[i][j] != dest) { return false; }
                }
            }
            return true;
        }

        /**
         * Constructs a new DFA that is a minimized equivalent to the current DFA. Much like
         * "fromSubsetContruction()" method, returns a mapping of new states to old states.
         * 
         * @param {DFA} dfa  - Potentially non-minimized DFA
         * @returns {Array}  - "Map" (Array) of non-minimized state indices to (by entry index) minimized DFA states
         */
        fromDfaMinimization(dfa) {
            let F = this.acceptingStates.copy();
            let SF = this.getStates().subtract(F);
            let groups = [F, SF]; // model groups as Sets of states (indices), which will transition well into new DFA definition
            let checking_ndx = 1;
            let alphabet = this.getAlphabet();

            while (checking_ndx < groups.length) {
                // transition table tracks group destination for each group member (first index) and transition character (second index)
                let nMembers = groups[checking_ndx].getSize();
                let nTransitions = alphabet.length;
                let tt = new Array(nMembers).fill(null).map(function(row) {
                    return new Array(nTransitions).fill(null);
                });
    
                // is current group "consistent"? a group is "consistent" if all constituent stats have identical transitions (destination groups) for each member of the alphabet.
                alphabet.forEach(function(tc, j) {
                    groups[checking_ndx].forEach(function(from, i) {
                        // if there is a transition, to which group does it lead?
                        let dest = this.getEdgesBy(from, tc);
                        let group = null;
                        if (dest != null) {
                            group = this.getGroupMembership(groups, dest);
                        }
                        tt[i][j] = group;
                    });
                });

                // continue if consistent
                let isConsistent = this.checkGroupConsistency(tt);
                if (!isConsistent) {
                    // determine maximal subsets

                    // expand with subsets

                    // make this group empty
                }
                checking_ndx += 1;
            }

            // assign DFA attributes from construction

            // return "map" of new states to old states--which we already have! It's the "groups" array.
            return groups;
        }

        /**
         * Given an Array of groups (Set of state indices), returns index of
         * group in which the given state is a member. Raises an error if no
         * group membership can be found. Primarily used as a helper method for
         * DFA minimization.
         * 
         * @param {Array} groups - Array of Sets; each Set contains state indices for that group
         * @param {Number} state - Index of state in question
         * @returns {Number}     - Index of group ("groups") within which state is a member
         */
        getGroupMembership(groups, state) {
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].contains(state)) {
                    return i;
                }
            }
            console.error(`State ${state} is not a member of given groups`);
        }
    }

    return Object.assign(DFA, {
        "__url__": "",
        "__semver__": "1.0.0",
        "__license__": "MIT",
        "__deps__": {}
    });
});
