/* Lightweight AJAX library for single get, multiple get, and full REST
   queries. Will eventually be porting this to modern "fetch() => then...", if
   we can map the same (very useful) API. NOT cross-platform (e.g., IE is
   explicitly not supported, which makes things VERY simple).
*/

define(function (require, exports, module) {
	exports.get = function (url, callback) {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
				callback(xhr.responseText);
			}
		};
		xhr.responseType = "text";
		xhr.open("GET", url);
		xhr.send();
	};

	exports.gets = function (urls, callback) {
		let n = urls.length;
		let results = new Array(n);
		results.fill(null);
		urls.forEach(function (url, ndx) {
			exports.get(url, function (response) {
				results[ndx] = response;
				if (results.every(function (v) { return v != null; })) {
					callback.apply(null, results);
				}
			});
		});
	};

	exports.rest = function (method, url, data, callback) {
		/* Lower-level RESTful method that permits customization of request
		   method, data, and specific status result parsing. Callback signature
		   is (xhr.status, {response headers}, xhr.responseText).
		*/
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				/*console.log(xhr);
				console.log(xhr.getResponseHeader("Set-Cookie"));*/
				callback(xhr.status, xhr.getAllResponseHeaders(), xhr.responseText);
			}
		}
		xhr.open(method, url);
		xhr.send(JSON.stringify(data));
	};

	return Object.assign(exports, {
        "__uni__": "com.github.tythos.quajax",
        "__semver__": "1.0.0",
        "__author__": "code@tythos.net"
    });
});
