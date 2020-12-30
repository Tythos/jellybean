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
         * @returns {Boolean} Indicates if the given element is in the current set.
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
         * @returns {Set} Deep copy of the current set.
         */
        copy() {
            let ns = new Set();
            ns.elements = JSON.parse(JSON.stringify(this.elements));
            return ns;
        }
    }

    return Object.assign(Set, {
        "__url__": "",
        "__license__": "MIT",
        "__semver__": "1.0.0"
    });
});
