module.exports = function (undefined) {

function patch(element, newElement, compareElement, options) {
	// reusable iteration variables
	var i, content;

	// allow hook to prevent doing anything on these nodes
	if (!options.shouldUpdate || options.shouldUpdate(compareElement, newElement)) {

		// if the node name or type changed, just replace this node
		if (compareElement.nodeName !== newElement.nodeName
				|| compareElement.nodeType !== newElement.nodeType) {

			element.parentNode.replaceChild(newElement.cloneNode(true), element);

		// otherwise, update this node
		} else {
			// update attributes, if appropriate
			if (newElement.attributes) {

				// remove any attributes that aren't on the new newElement
				for (i = 0; i < compareElement.attributes.length; i++) {
					content = compareElement.attributes[i];

					if (!newElement.hasAttribute(content.name)) {
						element.removeAttribute(content.name);
					}
				}

				for (i = 0; i < newElement.attributes.length; i++) {
					content = newElement.attributes[i];
					element.setAttribute(content.name, content.value);
				}
			}

			// update node value, if a text or comment node
			if (newElement.nodeType === 3 || newElement.nodeType === 8) {
				element.nodeValue = newElement.nodeValue;
			}

			// allow hook to prevent iterating into the children
			if (!options.shouldChildrenUpdate ||
					options.shouldChildrenUpdate(compareElement, newElement)) {

				// update children
				var newChildren = newElement.childNodes,
					compareNodes = compareElement.childNodes,
					newLength = newChildren ? newChildren.length : 0,
					compareLength = compareNodes ? compareNodes.length : 0;

				// but only if the new node even has a childNodes property
				if (newChildren) {
					// remove any excess child nodes
					if (compareLength > newLength) {
						for (i = compareLength - 1; i >= newLength; i--) {
							element.removeChild(element.childNodes[i]);
						}
					}

					// iterate over existing children
					for (i = 0; i < Math.min(compareLength, newLength); i++) {
						patch(element.childNodes[i], newChildren[i], compareNodes[i], options);
					}

					// copy over any new child nodes
					if (compareLength < newLength) {
						for (i = compareLength; i < newLength; i++) {
							element.appendChild(newChildren[i].cloneNode(true));
						}
					}
				}
			}
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
