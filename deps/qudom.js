/* Defines super-lightweight DOM and SVG element creation methods, including
   a quick DOM markup parser for compact HTML instantiation.
*/

define(function (require, exports, module) {
	function create(tag, attrs, html) {
		/* Quick functional way to create an HTML DOM element of the given tag
		   name with the given element attributes. Optionally, text content can
		   be provided as the third argument, but this will be appended first
		   to ensure proper transcription of any HTML encoding or elements it
		   contains.
		*/
		let element = document.createElement(tag);
		if (typeof (attrs) == 'undefined') { attrs = {}; }
		if (typeof (html) == 'undefined') { html = ''; }
		element.innerHTML = html;
		Object.keys(attrs).forEach(function (key) {
			element.setAttribute(key, attrs[key]);
		});
		return element;
	}

	function qudom_parse(identifier) {
		/* Generates a single DOM element with the ID, classes, and style
		   attributes specified by the given identifier. Leading with the
		   element tag, this can be augmented by:
		   * An ID starting with "#"
		   * Classes starting with "."
		   * Attributes starting with "@"
		   * Styles starting with "$"
		   * HTML content starting with "!"
		   
		   For example, the following identifier will generate a <div/> element
		   with the ID "myId", classes "classOne" and "classTwo", element
		   attributes "border=0" and "autofocus", and style attributes
		   "width:100px;" and "background-color:rgb(255,255,255)":
		      "div#myId.classOne.classTwo@border:0@autofocus$width:100px$background-color:rgb(255,255,255)"
		   
		   Note that, since ID begins with "#", color style values should use
		   RGB or other color formats that aren't hex values ("#fff", etc.).
		   There can also be issues with style values that include decimal
		   points. A better parser might be in order, in the long run.
		   
		   HTML content (all text following "!") should come last to avoid
		   unnecessary parsing errors triggered by overlap of HTML content with
		   other QuDom parsing symbols. Once the parser encounters a "!", all
		   subsequent text is placed into the HTML content of the element.
		*/
		let tag = 'div'; // defaults to <div/>
		let id = '';
		let classes = [];
		let attributes = {};
		let styles = {};
		let pattern = RegExp("[#\.@$!]");
		let html = "";
		while (identifier.length > 0) {
			if (identifier[0] == '#') {
				identifier = identifier.substr(1, identifier.length - 1);
				let parts = identifier.split(pattern);
				id = parts[0];
				identifier = identifier.substr(id.length, identifier.length - id.length);
			} else if (identifier[0] == ".") {
				identifier = identifier.substr(1, identifier.length - 1);
				let parts = identifier.split(pattern);
				let cls = parts[0];
				classes.push(cls);
				identifier = identifier.substr(cls.length, identifier.length - cls.length);
			} else if (identifier[0] == "@") {
				identifier = identifier.substr(1, identifier.length - 1);
				let parts = identifier.split(pattern);
				let attr = parts[0];
				let attrs = attr.split(":");
				if (attrs.length == 1) {
					attributes[attrs[0]] = true;
				} else {
					attributes[attrs[0]] = attrs[1];
				}
				identifier = identifier.substr(attr.length, identifier.length - attr.length);
			} else if (identifier[0] == "$") {
				identifier = identifier.substr(1, identifier.length - 1);
				let parts = identifier.split(pattern);
				let sty = parts[0];
				let stys = sty.split(":");
				if (stys.length == 1) {
					styles[stys[0]] = true;
				} else {
					styles[stys[0]] = stys[1];
				}
				identifier = identifier.substr(sty.length, identifier.length - sty.length);
			} else if (identifier[0] == "!") {
				html = identifier.substr(1, identifier.length - 1);
				identifier = "";
			} else {
				let parts = identifier.split(pattern);
				tag = parts[0];
				identifier = identifier.substr(tag.length, identifier.length - tag.length);
			}
		}
		return {
			tag: tag,
			id: id,
			classes: classes,
			attributes: attributes,
			styles: styles,
			html: html
		};
	}

	function qudom_factory(properties) {
		/* Uses the results of a *qudom_parse* invocation to generate the actual
		   DOM element with all the appropriate properties.
		*/
		let html = properties.html;
		delete properties.html;
		let styles = [];
		Object.keys(properties.styles).forEach(function (key) {
			styles.push(key + ":" + properties.styles[key]);
		});
		properties.attributes.class = properties.classes.join(' ');
		properties.attributes.style = styles.join(';');
		properties.attributes.id = properties.id;
		return create(properties.tag, properties.attributes, html);
	}

	function qudom(tree) {
		/* Uses a lightweight DOM markup to generate and return a DOM tree with
		   ID and class attributes. Each entry in the tree consists of a QuDom
		   identifier as a key, and an array of child entries (either subobjects
		   or string identifiers) as the value. Function returns a single DOM
		   element object, which means the top level can only contain one value.
		   To recurse to both possible types of child elements, tree can also be
		   a flat identifier (no children), in which case you might as well just
		   be calling the parser+factory.
		*/
		if (typeof (tree) == 'string') {
			let properties = qudom_parse(tree);
			return qudom_factory(properties);
		}
		let keys = Object.keys(tree);
		if (keys.length > 1) {
			console.warn("Ignoring all but the first entry in the QuDom tree");
		}
		let identifier = keys[0];
		let properties = qudom_parse(identifier);
		let parent = qudom_factory(properties);
		tree[keys[0]].forEach(function (child) {
			child = qudom(child); // Could be a flat string, or a subtree
			parent.appendChild(child);
		});
		return parent;
	}

	function svg(tag, attrs) {
		/* Creates a new SVG element with the appropriate namespace attribute.
		*/
		let svgNsUrl = 'http://www.w3.org/2000/svg';
		let element = document.createElementNS(svgNsUrl, tag);
		if (typeof (attrs) == 'undefined') { attrs = {}; }
		Object.keys(attrs).forEach(function (key) {
			element.setAttribute(key, attrs[key]);
		});
		return element;
	}

	function clr(element) {
		/* Removes all children of given element. Useful when redrawing.
		*/
		while (element.childElementCount > 0) {
			element.removeChild(element.children[0]);
		}
	}

	function table(header, rows) {
		/* Quick table constructor given a header Array and rows as Array of
		   Arrays. Optionally, can leave out header and just provide rows.
		*/
		if (typeof (rows) == 'undefined') {
			rows = header;
			header = null;
		}
		let table = create('table');
		if (header != null) {
			let thead = create('thead');
			let tr = create('tr');
			header.forEach(function (h) {
				let th = create('th');
				th.textContent = String(h);
				tr.appendChild(th);
			});
			thead.appendChild(tr);
			table.appendChild(thead);
		}
		let tbody = create('tbody');
		rows.forEach(function (row, i) {
			let tr = create('tr');
			tr.setAttribute("class", "tr" + i);
			row.forEach(function (v, j) {
				let td = create('td');
				td.setAttribute("class", "td" + j);
				td.textContent = String(v);
				tr.appendChild(td);
			});
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		return table;
	}

	return {
		create: create,
		qudom: qudom,
		svg: svg,
		clr: clr,
		table: table
	};
});
