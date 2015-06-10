module.exports = function (undefined) {

function patch(element, newElement, compareElement, options,
	// local variables
	i, content, name, value,
	newAttrs, compareAttrs,
	newNodes, compareNodes, elementNodes,
	newLength, compareLength) {

	// allow hook to prevent doing anything on these nodes
	if (!options.shouldUpdate || options.shouldUpdate(compareElement, newElement)) {
		content = newElement.nodeType;

		// if the node name or type changed, just replace this node
		if (compareElement.nodeType !== content
				|| compareElement.nodeName !== newElement.nodeName) {

			element.parentNode.replaceChild(newElement.cloneNode(true), element);

		// update node value, if a text or comment node
		} else if (content === 3 || content === 8) {
			value = newElement.nodeValue

			if (compareElement.nodeValue !== value) {
				element.nodeValue = value;
			}

		} else {

			// fetch this stuff all at once to avoid recalculation
			newAttrs = domToArray(newElement.attributes);
			compareAttrs = domToArray(compareElement.attributes);

			newNodes = domToArray(newElement.childNodes);
			compareNodes = domToArray(compareElement.childNodes);
			elementNodes = domToArray(element.childNodes);

			// next, iterate over existing children
			for (i = Math.min(compareNodes.length, newNodes.length) - 1; i >= 0; i--) {
				patch(elementNodes[i], newNodes[i], compareNodes[i], options);
			}

			// remove any excess child nodes
			if (compareNodes.length > newNodes.length) {
				for (i = compareNodes.length - 1; i >= newNodes.length; i--) {
					element.removeChild(elementNodes[i]);
				}
			}

			// copy over any new child nodes
			if (compareNodes.length < newNodes.length) {
				for (i = compareNodes.length; i < newNodes.length; i++) {
					element.appendChild(newNodes[i].cloneNode(true));
				}
			}

			// patch attributes
			if (newAttrs) {
				// remove outdated attributes
				for (i = compareAttrs.length - 1; i >= 0; i--) {
					name = compareAttrs[i].name;

					if (getAttribute(newAttrs, name) === undefined) {
						element.removeAttribute(name);
					}
				}

				// update or add attributes
				for (i = newAttrs.length - 1; i >= 0; i--) {
					content = newAttrs[i];
					name = content.name;
					value = content.value;

					if (getAttribute(compareAttrs, name) !== value) {
						element.setAttribute(name, value);
					}
				}
			}
		}
	}
}

// the theory goes, it's expensive to get dom list entries, so we'll get them all at once
function domToArray(dom) {
	if (dom) {
		var arr = [], value, index = 0;

		while (value = dom[index]) {
			arr[index++] = value;
		}

		return arr;
	}
}

function getAttribute (attrs, name) {
	for (var i = attrs.length - 1; i >= 0; i--) {
		if (attrs[i].name === name) {
			return attrs[i].value;
		}
	}
}

// use the body if it's a document, otherwise use the node itself
function rootNode(document) {
	return document.body || document;
}

function dompatch (document, newDocument, options) {
	options = options || {};

	// update document.title as a special other thing
	if (newDocument.title) {
		document.title = newDocument.title;
	}

	// TODO - handle other <head> updates?

	// find root node (eg. body) we can start iterating into
	patch(
		rootNode(document),
		rootNode(newDocument),
		rootNode(options.compare || document),
		options
	);
}

return dompatch;

}();
