var dompatch = function (undefined) {

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
		if (!same(compareElement, newElement)) {

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
			var oldNodeLength = compareNodes.length;
			var newNodeLength = newNodes.length;

			// reorder the children so they're all the same type/tag/id
			for (i = 0; i < newNodeLength; i++) {
				if (i >= elementNodes.length || !same(compareNodes[i], newNodes[i], options)) {
					var node = undefined;

					// remove all the siblings that aren't the same
					for (j = i + 1; j < elementNodes.length;j++) {
						content = elementNodes[j];

						if (same(content, newNodes[i])) {
							node = content;

							// remove all the nodes until here
							for (k = j - 1; k >= i; k--) {
								element.removeChild(elementNodes[k]);
							}

							elementNodes.splice(i, j - i);
							compareNodes.splice(i, j - i);

							break;
						}
					}

					// if nothing was the same, clone the new node to use instead
					if (!node) {
						node = newNodes[i].cloneNode(true);

						if (i >= element.childNodes.length) {
							element.appendChild(node);
						} else {
							element.insertBefore(node, element.childNodes[i]);
						}

						// adjust the entry numbers to match the inserted element
						elementNodes.splice(i, 0, null);
						compareNodes.splice(i, 0, null);
					}

				} else {
					patch(elementNodes[i], newNodes[i], compareNodes[i], options);
				}
			}

			for (i = elementNodes.length - 1; i >= newNodeLength; i--) {
				element.removeChild(elementNodes[i]);
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

function same (before, after, options) {
	if (options && options.shouldUpdate && !options.shouldUpdate(before, after)) {
		return true;
	}

	// different type or tag, definitely not the same
	if (before.nodeType !== after.nodeType
		|| before.nodeName !== after.nodeName) {
		return false;
	}

	// different id (if available), then not the same
	if (before.getAttribute && after.getAttribute) {
		return before.getAttribute('id') === after.getAttribute('id');
	}

	// got here, must be the same
	return true;
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
