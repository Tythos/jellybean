/* Lightweight, quick access AJAX module
*/

define(function (require, exports, module) {
	function load(url, callback) {
		/* Single-resource loader. Callback is only invoked if request succeeds.
		*/
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
				callback(xhr.responseText);
			}
		};
		xhr.responseType = "text";
		xhr.open("GET", url);
		xhr.send();
	}

	function loads(urls, callback) {
		/* Batch callback for multiple resources simultaneously.
		*/
		let n = urls.length;
		let results = new Array(n);
		results.fill(null);
		urls.forEach(function (url, ndx) {
			load(url, function (response) {
				results[ndx] = response;
				if (results.every(function (v) { return v != null; })) {
					callback.apply(null, results);
				}
			});
		});
	}

	function rest(method, url, data, callback) {
		/* Lower-level RESTful method that permits customization of request
		   method, data, and specific status result parsing. Callback signature
		   is (xhr.status, {response headers}, xhr.responseText).
		*/
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				console.log(xhr);
				console.log(xhr.getResponseHeader("Set-Cookie"));
				callback(xhr.status, xhr.getAllResponseHeaders(), xhr.responseText);
			}
		}
		xhr.open(method, url);
		xhr.send(JSON.stringify(data));
	};

	return {
		load: load,
		loads: loads,
		rest: rest
	};
});
