/**
 * @author <code@tythos.net>
 */

define(function(require, exports, module) {
    let DomLog = {};

    DomLog.dumb = function(obj) {
        let table = window.document.createElement("table");

        let thead = window.document.createElement("thead");
        let tr = window.document.createElement("tr");
        {
            let th = window.document.createElement("th");
            th.textContent = "Key";
            tr.appendChild(th);
        }
        {
            let th = window.document.createElement("th");
            th.textContent = "Value";
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        table.appendChild(thead);
        
        let tbody = window.document.createElement("tbody");
        Object.keys(obj).forEach(function(key) {
            let tr = window.document.createElement("tr");
            {
                let td = window.document.createElement("td");
                td.textContent = key;
                tr.appendChild(td);
            }
            {
                let td = window.document.createElement("td");
                if (obj[key] instanceof Object) {
                    td.appendChild(domlog(obj[key]));
                } else {
                    td.textContent = obj[key];
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;
    };

    DomLog.arrObjTable = function(arrObj) {
        let table = window.document.createElement("table");

        let thead = window.document.createElement("thead");
        let tr = window.document.createElement("tr");
        let keys = Object.keys(arrObj[0]);
        keys.forEach(function(key) {
            let th = window.document.createElement("th");
            th.textContent = key;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
        
        let tbody = window.document.createElement("tbody");
        arrObj.forEach(function(obj) {
            let tr = window.document.createElement("tr");
            keys.forEach(function(key) {
                let td = window.document.createElement("td");
                td.textContent = obj[key];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;        
    }

    return Object.assign(DomLog, {
        "__url__": "",
        "__semver__": "",
        "__license__": "",
        "__deps__": {}
    });
});
