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
            this.acceptingStates = new Set();
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
                    this.nStates = edge[0] + 1;
                }
                if (this.nStates <= edge[1]) {
                    this.nstates = edge[1] + 1;
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
            let F = dfa.acceptingStates.copy();
            let SF = dfa.getStates().subtract(F);
            let groups = [new Set(), F, SF]; // model groups as Sets of states (indices), which will transition well into new DFA definition (G0=first set, etc.; entries can be null if later broken up)
            let checking_ndx = 0;
            let alphabet = dfa.getAlphabet();

            while (checking_ndx < groups.length) {
                // debugging report
                //console.log("group definitions:");
                groups.forEach(function(g, n) {
                    //console.log(`G${n}: ${g.toString()}`);
                });

                // first verify we're not re-checking a broken-up group
                if (groups[checking_ndx] == null) {
                    checking_ndx += 1;
                    continue;
                }

                // transition table tracks group destination for each group member (first index) and transition character (second index)
                let tt = this.buildTransitionTable(groups, checking_ndx, alphabet, dfa);

                // continue if consistent
                let isConsistent = this.checkGroupConsistency(tt);
                if (!isConsistent) {
                    // an inconsistent group means we break old group into a set of new groups, using unique Group destination indices from the transition table
                    let subcheck_ndx = 0;
                    while (subcheck_ndx < tt.length) {
                        // skip if we've already broken this row out from a previous grouping
                        if (tt[subcheck_ndx] == null) {
                            subcheck_ndx += 1;
                            continue;
                        }

                        // first, define the "potentially-new group" with 
                        let newGroup = [ groups[checking_ndx].elements[subcheck_ndx] ]; // group is defined by subset of OLD DFA state indices
                        let transitions = tt[subcheck_ndx]; // "bookmark" for comparison with other tt rows
                        tt[subcheck_ndx] = null; // when we move a state into a new group, we flag it moved by marking the transition table null

                        // what other (subsequent) transition table rows have the same group destinations?
                        let subsubcheck_ndx = subcheck_ndx + 1;
                        while (subsubcheck_ndx < tt.length) {
                            // skip if already broken out by previously-parsed new grouping
                            if (tt[subsubcheck_ndx] == null) {
                                subsubcheck_ndx += 1;
                                continue;
                            }

                            // compare tt[subsubcheck_ndx] against dests
                            let isIdentical = this.isGroupedTransition(tt, transitions, subsubcheck_ndx);
                            if (isIdentical) {
                                // "add" to group by moving original DFA state index and setting transition-table entry to null
                                newGroup.push(groups[checking_ndx].elements[subsubcheck_ndx]);
                                tt[subsubcheck_ndx] = null;
                            }
                            subsubcheck_ndx += 1;
                        }

                        // we now have a "new" group--likely one of several; add it to the groups list (will recompute transition table on subsequent iteration)
                        groups.push(new Set(newGroup));
                        subcheck_ndx += 1;
                    }

                    // mark "old" group as empty (null), as all should have been broken into new groups (verify?); we must also regenerate transition table, so basically start over from the beginning
                    groups[checking_ndx] = new Set();
                    checking_ndx = 0;
                } else {
                    // "safe" to continue checking next reduced-DFA group
                    checking_ndx += 1;
                }
            }

            // assign number of states (some will be empty)
            this.nStates = groups.length;

            // recompute transition tables one last time to define edges
            this.transitions = [];
            groups.forEach(function(group, i) {
                // transitions are edges; each edge is a three-element Array listing "from" index, "to" index, and transition condition.
                if (group.getSize() == 0) { return; }
                let tt = this.buildTransitionTable(groups, i, alphabet, dfa);
                //console.log(this.ttToString(tt, alphabet, i, groups));

                // each transition table should, by virtue of construction, be self-consistent, so we only need the first row
                alphabet.forEach(function(ab, j) {
                    if (tt[0][j] != null) {
                        this.transitions.push([
                            i, // from new DFA state index
                            tt[0][j], // to new DFA state index
                            ab
                        ]);
                    }
                }, this);
            }, this);

            // new starting state contains old starting state
            this.startingState = null;
            groups.forEach(function(group, i) {
                if (group.contains(dfa.startingState)) {
                    this.startingState = i;
                }
            }, this);
            if (this.startingState == null) {
                console.error("Unable to map/resolve new DFA starting state");
            }
            
            // new accepting states are those that contain "old" accepting states
            this.acceptingStates = new Set();
            groups.forEach(function(group, i) {
                group.forEach(function(oldNdx) {
                    if (dfa.acceptingStates.contains(oldNdx)) {
                        this.acceptingStates.push(i);
                    }
                }, this);
            }, this);

            // return "map" of new states to old states, which we can resolve easily from the "groups" Array
            let map = [];
            groups.forEach(function(group) {
                map.push(group.elements);
            });
            return map;
        }

        /**
         * Constructs a transition table for the given group.
         * 
         * @param {Array} groups - Each group in this array is a Set of state indices (old DFA) mapped to the new DFA group
         * @param {Number} checking_ndx - Which entry in groups we are constructing a transition table for
         * @param {Array} alphabet - Array of all possible transition symbols (typically strings)
         * @param {DFA} dfa - "Old" DFA (since this construction is typically used in subset minimization)
         * @returns {Array} - Transition table is technically an array of arrays; first "dimension" is indexed by the "old" DFA states listed in groups; second "dimension" is each character in the transition alphabet; values are indices of (new DFA) group membership
         */
        buildTransitionTable(groups, checking_ndx, alphabet, dfa) {
            let nMembers = groups[checking_ndx].getSize();
            let nTransitions = alphabet.getSize();
            let tt = new Array(nMembers).fill(null).map(function(row) {
                // each entry in the transition table (as indexed by members in the group we are currently checking); we will populate these contents in the next step, but here we assign "null" placeholders
                return new Array(nTransitions).fill(null);
            });

            // is current group "consistent"? a group is "consistent" if all constituent stats have identical transitions (destination groups) for each member of the alphabet. so, first we must determine the transition destinations (and groups to which they belong).
            groups[checking_ndx].forEach(function(from, i) {
                alphabet.forEach(function(tc, j) {
                    // if there is a transition, to which group does it lead?
                    let dest = dfa.getEdgesBy(from, tc);
                    let group = null;
                    if (dest != null) {
                        // if there is a destination, we need the index of the group to which this destination belongs
                        group = this.getGroupMembership(groups, dest);
                    }
                    tt[i][j] = group;
                }, this);
            }, this);
            //console.log(this.ttToString(tt, alphabet, checking_ndx, groups));            
            return tt;
        }

        /**
         * Returns true if the transition table has identical destinations for
         * each transition of the given members (rows). Primarily used as a
         * helper function (could be static) in DFA minimization.
         * 
         * @param {Array} tt - Transition table is array of arrays (first index is row, second is transition); specific values are indices in current groups, but only compared against each other
         * @param {Array} newGroup - Indices of destination states defined in new group for each alphabet character (e.g., old row of transition table)
         * @param {Number} m2_ndx - Index of second row to compare
         * @returns {Boolean} - True if each transitions for the two rows goes to an identical destination
         */
        isGroupedTransition(tt, newGroup, m2_ndx) {
            let nTransitions = newGroup.length;
            for (let i = 0; i < nTransitions; i++) {
                if (newGroup[i] != tt[m2_ndx][i]) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Given an Array of groups (Set of state indices), returns index of
         * group in which the given state is a member. Raises an error if no
         * group membership can be found. Primarily used as a helper method for
         * DFA minimization. Technically this could be a static method as it is
         * used in minization-construction and does not use the instance state.
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

        ttToString(tt, alphabet, checking_ndx, groups) {
            let lines = [];
            lines.push(`Transition table for group G${checking_ndx}:`);
            lines.push(`\t${alphabet.elements.join("\t")}`);
            tt.forEach(function(row, i) {
                // if row has been set to null, this transition has already been "extracted" to another group and we should skip
                if (row == null) { return; }
                lines.push(`${groups[checking_ndx].elements[i]}\t${row.map(function(g, j) {
                    return g == null ? "-" : `G${g}`;
                }).join("\t")}`);
            });
            return lines.join("\n");
        }
    }

    return Object.assign(DFA, {
        "__url__": "",
        "__semver__": "1.0.0",
        "__license__": "MIT",
        "__deps__": {}
    });
});
