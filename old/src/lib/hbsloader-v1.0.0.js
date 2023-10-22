/*
*/

define(function (require, exports, module) {    
    var handlebars = require("lib/handlebars-v4.0.11");

    exports.load = function (name, req, onload, config) {
        fetch(name).then(function (response) {
            return response.text();
        }).then(function (text) {
            var template = handlebars.compile(text);
            template.render = function (n) {
                var div = window.document.createElement("div");
                div.innerHTML = this(n);
                return div;
            };
            onload(template);
        })
    }
});
