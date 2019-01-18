/* Basic Token model for easy handling by other agents. Has no behaviors in and
   of itself. Model based on token attributes from *ply* Python package. Token
   objects are both the result of a Lexer iteration, and the value of leaf
   nodes in the final Abstract Syntax Tree structure.
*/

define(function(require, exports, module) {
    function Token() {
        /* Instantiates a new Token object, with an empty tag and empty value.
           Line and column coordinates both default to 0.
        */
        this.tag = "";
        this.value = "";
        this.line = 0;
        this.column = 0;
        return this;
    }

    return Token;
});
