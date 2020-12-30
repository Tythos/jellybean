/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    let Set = require("lib/Set-v1.0.0");

    /**
     * Encapsulation of a non-deterministic finite automota. Does not model
     * individual states, but does keep track of how many there are. Models
     * individual edges, including transition criteria and directionality.
     * Since this is an NFA model, transition criteria can be "null" to specify
     * an epsilon transition.
     */
    class NFA {
        constructor() {
            this.nStates = 0;
            this.transitions = []; // triplet of "from index", "to index", "transition condition"
        }

        /**
         * Adds an edge to the NFA. Will increase "nStates" property if either
         * index exceeds the number of states currently known.
         * 
         * @param {Number} fromIndex 
         * @param {Number} toIndex 
         * @param {String|null} transitionCondition 
         */
        addEdge(fromIndex, toIndex, transitionCondition) {
            this.transitions.push([fromIndex, toIndex, transitionCondition]);
            if (this.nStates <= fromIndex) {
                this.nStates = fromIndex + 1;
            }
            if (this.nStates <= toIndex) {
                this.nStates = toIndex + 1;
            }
        }

        /**
         * Batches construction of an NFA from an Array of edges.
         * 
         * @param {Array} edges Each element is a three-element Array indicating from indx; to index; and transition condition of a specific NFA edge
         */
        addEdges(edges) {
            edges.forEach(function(edge) {
                this.addEdge(edge[0], edge[1], edge[2]);
            }, this);
        }

        /**
         * Returns subset of edges (Array of triplets) originating from the
         * given state index.
         * 
         * @param {Number} fromIndex Index (number) of "from" state
         * @returns {Array} Array of three-element Arrays, each of which contains a triplet of "from", "to", "transition" edges
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
         * Returns a set of states (index Numbers) corresponding to the
         * epsilon-closure of the given/initial set of states.
         * 
         * @param {Set} states Set of state indices comprising the initial closure
         * @returns {Set} Set of state indices reachable by epsilon transition from the initial closure
         */
        getEpsilonClosure(states) {
            let nextState_ndx = 0; // index of state within Set to inspect next
            let closure = states.copy();
            while (nextState_ndx < closure.getSize()) {
                console.log(closure.elements);
                let nextState = closure.elements[nextState_ndx];
                let edges = this.getEdgesFrom(nextState);
                edges.forEach(function(edge) {
                    if (edge[2] == null) {
                        closure.push(edge[1]);
                    }
                });
                nextState_ndx += 1;
            }
            return closure;
        }
    }

    return Object.assign(NFA, {
        "__url__": "",
        "__license__": "MIT",
        "__semver__": "1.0.0"
    });
});
