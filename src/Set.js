/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    /**
     * Encapsulates a set of unique arbitrary elements. Uniqueness between
     * elements is determined solely by the "indexOf()" Array method.
     */
    class Set {
        constructor(initial=[]) {
            this.elements = [];
            initial.forEach(function(element) {
                this.push(element);
            }, this);
        }

        /**
         * Returns true if the given element is in the current set.
         * 
         * @param {*} element 
         * @returns {Boolean} - Indicates if the given element is in the current set.
         */
        contains(element) {
            return 0 <= this.elements.indexOf(element);
        }

        /**
         * Adds the given element (if unique) to the current set.
         * 
         * @param {*} element 
         */
        push(element) {
            if (!this.contains(element)) {
                this.elements.push(element);
            }
        }

        /**
         * Removes the given element (if it exists) from the current set.
         * 
         * @param {*} element 
         */
        pop(element) {
            if (this.contains(element)) {
                let ndx = this.elements.indexOf(element);
                this.elements.splice(ndx, 1);
            }
        }

        /**
         * Returns the size of the current set.
         * 
         * @returns {Number} Number of elements in the current set.
         */
        getSize() {
            return this.elements.length;
        }

        /**
         * Invokes a given function on the current set. At this time, no
         * results are collated.
         * 
         * @param {Function} callback 
         */
        forEach(callback) {
            this.elements.forEach(callback);
        }

        /**
         * Returns a deep copy of the current set.
         * 
         * @returns {Set} - Deep copy of the current set.
         */
        copy() {
            let ns = new Set();
            ns.elements = JSON.parse(JSON.stringify(this.elements));
            return ns;
        }

        /**
         * Compares this Set to another Set. Returns true if they have
         * identical size and contents. Uses "contains()" method for element
         * comparison (no explicit equality comparison made in this method).
         * 
         * @param {Set} rhs   - RHS of equality comparison
         * @returns {Boolean} - Returns true if Sets are identical
         */
        isEqual(rhs) {
            if (this.getSize() != rhs.getSize()) {
                return false;
            }
            this.elements.forEach(function(el) {
                if (!rhs.contains(el)) {
                    return false;
                }
            });
            return true;
        }

        /**
         * Constructs a union of two sets: the callee and the given RHS
         * operand. Callee remains unchanged by this operation.
         * 
         * @param {Set} rhs - RHS of union operation
         * @returns {Set}   - Union of callee and RHS operand
         */
        union(rhs) {
            let result = this.copy();
            rhs.forEach(function(el) {
                result.push(el);
            });
            return result;
        }

        /**
         * Constructs the intersection of two sets: the callee and the given
         * RHS operand. Callee remains unchanged by this operation.
         * 
         * @param {Set} rhs - RHS of intersect operation
         * @returns {Set}   - Intersection of callee and given operand
         */
        intersect(rhs) {
            let result = new Set();
            this.elements.forEach(function(el) {
                if (rhs.contains(el)) {
                    result.push(el);
                }
            });
            return result;
        }

        /**
         * Returns a new Set whose elements are the members of this set that
         * ARE NOT also elements of the given RHS operand.
         * 
         * @param {Set} rhs - RHS of subtraction operation
         * @returns {Set}   - New set resulting from subtraction operation
         */
        subtract(rhs) {
            let result = new Set();
            this.elements.forEach(function(el) {
                if (!rhs.contains(el)) {
                    result.push(el);
                }
            });
            return result;
        }
    }

    return Object.assign(Set, {
        "__url__": "",
        "__license__": "MIT",
        "__semver__": "1.0.0",
        "__deps__": {}
    });
});
